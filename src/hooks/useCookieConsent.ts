import { useCallback, useSyncExternalStore } from 'react';

export interface CookiePreferences {
  necessary: boolean;   // Çevrimdışı veritabanı (IndexedDB) ve oturum verisi (her zaman aktif)
  media: boolean;       // YouTube video oynatıcı ve gömülü medya çerezleri
  preferences: boolean; // Sinema modu, son kalınan bölüm ve oynatıcı tercihleri
}

export interface CookieConsentData {
  hasConsented: boolean;
  status: 'accepted_all' | 'essential_only' | 'customized' | 'pending';
  preferences: CookiePreferences;
  consentedAt: string | null;
}

export interface CookieConsentStoreState extends CookieConsentData {
  isBannerOpen: boolean;
  isCustomizeExpanded: boolean;
}

const STORAGE_KEY = 'yds_cookie_consent_v1';
const EVENT_NAME = 'yds_cookie_consent_changed';

const DEFAULT_PREFERENCES: CookiePreferences = {
  necessary: true,
  media: true,
  preferences: true,
};

function getStoredConsent(): CookieConsentData {
  if (typeof window === 'undefined') {
    return {
      hasConsented: false,
      status: 'pending',
      preferences: DEFAULT_PREFERENCES,
      consentedAt: null,
    };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed.hasConsented === 'boolean') {
        return {
          hasConsented: parsed.hasConsented,
          status: parsed.status || 'accepted_all',
          preferences: {
            necessary: true,
            media: parsed.preferences?.media ?? true,
            preferences: parsed.preferences?.preferences ?? true,
          },
          consentedAt: parsed.consentedAt || null,
        };
      }
    }
  } catch {
    // yoksay
  }

  return {
    hasConsented: false,
    status: 'pending',
    preferences: DEFAULT_PREFERENCES,
    consentedAt: null,
  };
}

const initialStored = getStoredConsent();

let globalStoreState: CookieConsentStoreState = {
  ...initialStored,
  isBannerOpen: !initialStored.hasConsented,
  isCustomizeExpanded: false,
};

const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(EVENT_NAME));
  }
}

function updateGlobalStore(partial: Partial<CookieConsentStoreState>) {
  globalStoreState = { ...globalStoreState, ...partial };
  notifyListeners();
}

export function syncConsentFromStorage() {
  const stored = getStoredConsent();
  globalStoreState = {
    ...stored,
    isBannerOpen: !stored.hasConsented,
    isCustomizeExpanded: false,
  };
  notifyListeners();
}

if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY || e.key === null) {
      syncConsentFromStorage();
    }
  });
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return globalStoreState;
}

function getServerSnapshot() {
  return globalStoreState;
}

export function useCookieConsent() {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const saveConsent = useCallback((
    status: 'accepted_all' | 'essential_only' | 'customized',
    preferences: CookiePreferences
  ) => {
    const data: CookieConsentData = {
      hasConsented: true,
      status,
      preferences: {
        necessary: true,
        media: preferences.media,
        preferences: preferences.preferences,
      },
      consentedAt: new Date().toISOString(),
    };

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      // yoksay
    }

    updateGlobalStore({
      ...data,
      isBannerOpen: false,
      isCustomizeExpanded: false,
    });
  }, []);

  const acceptAll = useCallback(() => {
    saveConsent('accepted_all', {
      necessary: true,
      media: true,
      preferences: true,
    });
  }, [saveConsent]);

  const acceptEssentialOnly = useCallback(() => {
    saveConsent('essential_only', {
      necessary: true,
      media: false,
      preferences: false,
    });
  }, [saveConsent]);

  const saveCustomPreferences = useCallback((custom: Partial<CookiePreferences>) => {
    const currentMedia = store.preferences.media;
    const currentPrefs = store.preferences.preferences;
    saveConsent('customized', {
      necessary: true,
      media: custom.media !== undefined ? custom.media : currentMedia,
      preferences: custom.preferences !== undefined ? custom.preferences : currentPrefs,
    });
  }, [saveConsent, store.preferences]);

  const openBanner = useCallback((options?: { customize?: boolean }) => {
    updateGlobalStore({
      isBannerOpen: true,
      isCustomizeExpanded: options?.customize ?? false,
    });
  }, []);

  const closeBanner = useCallback(() => {
    updateGlobalStore({
      isBannerOpen: false,
      isCustomizeExpanded: false,
    });
  }, []);

  const setCustomizeExpanded = useCallback((expanded: boolean) => {
    updateGlobalStore({
      isCustomizeExpanded: expanded,
    });
  }, []);

  const resetConsent = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // yoksay
    }
    const initial: CookieConsentData = {
      hasConsented: false,
      status: 'pending',
      preferences: DEFAULT_PREFERENCES,
      consentedAt: null,
    };
    updateGlobalStore({
      ...initial,
      isBannerOpen: true,
      isCustomizeExpanded: false,
    });
  }, []);

  return {
    ...store,
    openBanner,
    closeBanner,
    setCustomizeExpanded,
    acceptAll,
    acceptEssentialOnly,
    saveCustomPreferences,
    resetConsent,
  };
}

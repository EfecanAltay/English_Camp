import React, { useState, useEffect } from 'react';
import { Cookie, Check, X, ChevronDown, ChevronUp, Settings2, Video, HardDrive } from 'lucide-react';
import { useCookieConsent, type CookiePreferences } from '../../hooks/useCookieConsent';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export const CookieConsentBanner: React.FC = () => {
  const {
    isBannerOpen,
    hasConsented,
    preferences,
    isCustomizeExpanded,
    setCustomizeExpanded,
    acceptAll,
    acceptEssentialOnly,
    saveCustomPreferences,
    closeBanner,
  } = useCookieConsent();

  const [customPrefs, setCustomPrefs] = useState<CookiePreferences>({
    necessary: true,
    media: preferences.media,
    preferences: preferences.preferences,
  });

  useEffect(() => {
    setCustomPrefs({
      necessary: true,
      media: preferences.media,
      preferences: preferences.preferences,
    });
  }, [preferences.media, preferences.preferences, isBannerOpen]);

  if (!isBannerOpen) return null;

  const handleSaveCustom = () => {
    saveCustomPreferences(customPrefs);
    setCustomizeExpanded(false);
  };

  return (
    <aside
      aria-label="Çerez ve Gizlilik Tercihleri"
      className="fixed bottom-4 inset-x-4 sm:bottom-6 sm:right-6 sm:left-auto sm:max-w-lg z-50 animate-in slide-in-from-bottom-5 duration-300"
    >
      <div className="rounded-2xl border border-primary/30 bg-card/95 backdrop-blur-md shadow-2xl p-5 text-foreground space-y-4 ring-1 ring-black/5">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary shrink-0 border border-primary/20">
              <Cookie className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <span>Çerez ve Depolama İzni</span>
                <Badge variant="outline" className="text-[10px] font-semibold bg-primary/10 text-primary border-primary/25">
                  KVKK / GDPR
                </Badge>
              </h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Gizliliğiniz ve öğrenme deneyiminiz bizim için önemlidir.
              </p>
            </div>
          </div>

          {hasConsented && (
            <button
              type="button"
              onClick={closeBanner}
              className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"
              title="Kapat"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Content Description */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          English Camp, ders tamamlama ilerlemenizi ve quiz yanıtlarınızı çevrimdışı saklayabilmek (<strong>IndexedDB</strong>), tema tercihlerinizi hatırlamak ve Dilci Burak Hoca'nın video konu anlatımlarını oynatabilmek (<strong>YouTube</strong>) için yerel depolama ve çerezleri kullanır.
        </p>

        {/* Customization Details (Accordion) */}
        {isCustomizeExpanded && (
          <div className="space-y-2.5 pt-2 border-t border-border/70 animate-in fade-in-50 duration-200">
            {/* Category 1: Zorunlu */}
            <div className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <div className="flex items-start gap-2">
                <HardDrive className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-foreground">Zorunlu Depolama</span>
                    <Badge variant="outline" className="text-[9px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30">
                      Her Zaman Aktif
                    </Badge>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    Ders ilerlemeniz, quiz puanlarınız ve tema seçiminizin tarayıcınızda (IndexedDB / LocalStorage) kaybolmadan saklanması için zorunludur.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                checked
                disabled
                className="mt-1 h-4 w-4 rounded accent-primary cursor-not-allowed opacity-75"
              />
            </div>

            {/* Category 2: YouTube & Medya */}
            <div className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <div className="flex items-start gap-2">
                <Video className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground">Ders Videoları (YouTube)</span>
                  <p className="text-[11px] text-muted-foreground">
                    YouTube üzerinden gömülü video derslerin kesintisiz oynatılması ve zaman damgalı atlamaların çalışması için gereklidir.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                id="cookie-toggle-media"
                checked={customPrefs.media}
                onChange={(e) => setCustomPrefs((prev) => ({ ...prev, media: e.target.checked }))}
                className="mt-1 h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </div>

            {/* Category 3: Tercihler & Deneyim */}
            <div className="flex items-start justify-between gap-3 p-2.5 rounded-xl bg-muted/40 border border-border/60">
              <div className="flex items-start gap-2">
                <Settings2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="text-xs font-bold text-foreground">Tercihler & Sinema Modu</span>
                  <p className="text-[11px] text-muted-foreground">
                    Geniş ekran (sinema modu) ve oynatıcı tercihlerinizi sonraki oturumlar için hatırlar.
                  </p>
                </div>
              </div>
              <input
                type="checkbox"
                id="cookie-toggle-preferences"
                checked={customPrefs.preferences}
                onChange={(e) => setCustomPrefs((prev) => ({ ...prev, preferences: e.target.checked }))}
                className="mt-1 h-4 w-4 rounded accent-primary cursor-pointer"
              />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 pt-1">
          <button
            type="button"
            onClick={() => setCustomizeExpanded(!isCustomizeExpanded)}
            className="inline-flex items-center justify-center gap-1 text-[11px] font-semibold text-muted-foreground hover:text-foreground transition-colors py-1.5"
          >
            <span>{isCustomizeExpanded ? 'Daha Az Detay' : 'Tercihleri Özelleştir'}</span>
            {isCustomizeExpanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {isCustomizeExpanded ? (
              <Button
                size="sm"
                variant="primary"
                onClick={handleSaveCustom}
                className="flex-1 sm:flex-initial text-xs h-8 px-3.5 font-bold"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Tercihlerimi Kaydet</span>
              </Button>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={acceptEssentialOnly}
                  className="flex-1 sm:flex-initial text-[11px] h-8 px-2.5 text-muted-foreground hover:text-foreground"
                >
                  <span>Yalnızca Gerekli</span>
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={acceptAll}
                  className="flex-1 sm:flex-initial text-xs h-8 px-3.5 font-bold shadow-sm"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Tümünü Kabul Et</span>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

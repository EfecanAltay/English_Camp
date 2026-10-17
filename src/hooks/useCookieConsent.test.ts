import { describe, it, expect, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCookieConsent, syncConsentFromStorage } from './useCookieConsent';

describe('useCookieConsent hook', () => {
  beforeEach(() => {
    localStorage.clear();
    syncConsentFromStorage();
  });

  it('initializes with default pending state if not previously consented', () => {
    const { result } = renderHook(() => useCookieConsent());

    expect(result.current.hasConsented).toBe(false);
    expect(result.current.status).toBe('pending');
    expect(result.current.isBannerOpen).toBe(true);
    expect(result.current.preferences.necessary).toBe(true);
    expect(result.current.preferences.media).toBe(true);
    expect(result.current.preferences.preferences).toBe(true);
  });

  it('accepts all cookies and stores preference', () => {
    const { result } = renderHook(() => useCookieConsent());

    act(() => {
      result.current.acceptAll();
    });

    expect(result.current.hasConsented).toBe(true);
    expect(result.current.status).toBe('accepted_all');
    expect(result.current.isBannerOpen).toBe(false);
    expect(result.current.preferences.necessary).toBe(true);
    expect(result.current.preferences.media).toBe(true);
    expect(result.current.preferences.preferences).toBe(true);
    expect(result.current.consentedAt).toBeTruthy();

    const stored = JSON.parse(localStorage.getItem('yds_cookie_consent_v1') || '{}');
    expect(stored.hasConsented).toBe(true);
    expect(stored.status).toBe('accepted_all');
  });

  it('accepts only essential cookies when requested', () => {
    const { result } = renderHook(() => useCookieConsent());

    act(() => {
      result.current.acceptEssentialOnly();
    });

    expect(result.current.hasConsented).toBe(true);
    expect(result.current.status).toBe('essential_only');
    expect(result.current.isBannerOpen).toBe(false);
    expect(result.current.preferences.necessary).toBe(true);
    expect(result.current.preferences.media).toBe(false);
    expect(result.current.preferences.preferences).toBe(false);
  });

  it('saves custom preferences properly', () => {
    const { result } = renderHook(() => useCookieConsent());

    act(() => {
      result.current.saveCustomPreferences({
        media: false,
        preferences: true,
      });
    });

    expect(result.current.hasConsented).toBe(true);
    expect(result.current.status).toBe('customized');
    expect(result.current.isBannerOpen).toBe(false);
    expect(result.current.preferences.necessary).toBe(true);
    expect(result.current.preferences.media).toBe(false);
    expect(result.current.preferences.preferences).toBe(true);
  });

  it('resets consent and reopens banner', () => {
    const { result } = renderHook(() => useCookieConsent());

    act(() => {
      result.current.acceptAll();
    });
    expect(result.current.hasConsented).toBe(true);
    expect(result.current.isBannerOpen).toBe(false);

    act(() => {
      result.current.resetConsent();
    });

    expect(result.current.hasConsented).toBe(false);
    expect(result.current.status).toBe('pending');
    expect(result.current.isBannerOpen).toBe(true);
    expect(localStorage.getItem('yds_cookie_consent_v1')).toBeNull();
  });

  it('allows manual open and close of the banner with customize option', () => {
    const { result } = renderHook(() => useCookieConsent());

    act(() => {
      result.current.acceptAll();
    });
    expect(result.current.isBannerOpen).toBe(false);

    act(() => {
      result.current.openBanner({ customize: true });
    });
    expect(result.current.isBannerOpen).toBe(true);
    expect(result.current.isCustomizeExpanded).toBe(true);

    act(() => {
      result.current.closeBanner();
    });
    expect(result.current.isBannerOpen).toBe(false);
    expect(result.current.isCustomizeExpanded).toBe(false);
  });
});


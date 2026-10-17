import { useState, useEffect, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import {
  ExternalLink,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  AlertCircle,
  Clock,
  ListVideo,
  ChevronDown,
  ChevronUp,
  Sparkles,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Video,
  ThumbsUp,
  Bell,
  Heart,
  X,
} from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { cn } from '../../lib/utils';
import { useCookieConsent } from '../../hooks/useCookieConsent';
import { VideoSupportModal } from '../shared/VideoSupportModal';
import type { GrammarSectionNote } from '../../core/content/grammar-lessons.data';

export interface YouTubeEmbedHandle {
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
  playVideo: () => void;
  pauseVideo: () => void;
  togglePlay: () => void;
  seekRelative: (deltaSeconds: number) => void;
}

export interface YouTubeEmbedProps {
  videoId: string;
  title: string;
  playlistId?: string;
  sections?: GrammarSectionNote[];
  activeSectionIndex?: number;
  onSectionSelect?: (section: GrammarSectionNote, index: number) => void;
  onTimeUpdate?: (currentSeconds: number) => void;
  className?: string;
  isCinemaMode?: boolean;
  onToggleCinemaMode?: () => void;
}

declare global {
  interface Window {
    YT?: any;
    onYouTubeIframeAPIReady?: () => void;
  }
}

let ytScriptLoading = false;
function loadYouTubeApi() {
  if (typeof window === 'undefined') return;
  if (window.YT && window.YT.Player) return;
  if (ytScriptLoading) return;
  ytScriptLoading = true;

  const script = document.createElement('script');
  script.src = 'https://www.youtube.com/iframe_api';
  script.async = true;
  document.body.appendChild(script);
}

export const YouTubeEmbed = forwardRef<YouTubeEmbedHandle, YouTubeEmbedProps>(({
  videoId,
  title,
  playlistId,
  sections = [],
  activeSectionIndex: controlledActiveIndex,
  onSectionSelect,
  onTimeUpdate,
  className,
  isCinemaMode = false,
  onToggleCinemaMode,
}, ref) => {
  const [hasError, setHasError] = useState(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isChapterListOpen, setIsChapterListOpen] = useState<boolean>(true);
  const [pendingStartSeconds, setPendingStartSeconds] = useState<number | null>(null);

  const [isSupportModalOpen, setIsSupportModalOpen] = useState<boolean>(false);
  const [isSupportBannerDismissed, setIsSupportBannerDismissed] = useState<boolean>(() => {
    try {
      return localStorage.getItem('yds_support_banner_dismissed') === 'true';
    } catch {
      return false;
    }
  });
  const [, setHasSupported] = useState<boolean>(() => {
    try {
      return localStorage.getItem('yds_creator_supported') === 'true';
    } catch {
      return false;
    }
  });

  const { hasConsented, preferences, saveCustomPreferences, openBanner } = useCookieConsent();
  const isMediaConsentDenied = hasConsented && !preferences.media;

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const iframeUniqueId = useMemo(() => `yt-player-${videoId.replace(/[^a-zA-Z0-9_-]/g, '')}`, [videoId]);

  // Sayfa origin'i (YouTube JS API güvenliği için)
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  // YouTube IFrame API script yükleme (Medya izni reddedilmemişse)
  useEffect(() => {
    if (!isMediaConsentDenied) {
      loadYouTubeApi();
    }
  }, [isMediaConsentDenied]);

  // PostMessage ile video zaman ve durum güncellemelerini dinle
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' ? JSON.parse(event.data) : event.data;
        if (!data) return;

        // infoDelivery event
        if (data.event === 'infoDelivery' && data.info) {
          if (typeof data.info.currentTime === 'number') {
            const time = data.info.currentTime;
            setCurrentTime(time);
            onTimeUpdate?.(time);
          }
          if (typeof data.info.playerState === 'number') {
            // 1: playing, 2: paused, 0: ended
            setIsPlaying(data.info.playerState === 1);
            if (data.info.playerState === 0) {
              setIsSupportModalOpen(true);
            }
          }
        }

        // onStateChange event
        if (data.event === 'onStateChange') {
          setIsPlaying(data.info === 1);
          if (data.info === 0) {
            setIsSupportModalOpen(true);
          }
        }
      } catch {
        // yoksay
      }
    };

    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onTimeUpdate]);

  // YouTube YT.Player örneğini başlat (varsa)
  useEffect(() => {
    let isCancelled = false;

    const initPlayer = () => {
      if (isCancelled || !iframeRef.current || !window.YT || !window.YT.Player) return;

      try {
        playerRef.current = new window.YT.Player(iframeRef.current, {
          events: {
            onStateChange: (event: any) => {
              if (isCancelled) return;
              const state = event.data;
              setIsPlaying(state === 1);
              if (state === 0) {
                setIsSupportModalOpen(true);
              }

              if (state === 1) {
                // Oynatılıyorken periyodik zaman güncellemesi
                if (timerRef.current) clearInterval(timerRef.current);
                timerRef.current = setInterval(() => {
                  if (playerRef.current && typeof playerRef.current.getCurrentTime === 'function') {
                    const time = playerRef.current.getCurrentTime();
                    setCurrentTime(time);
                    onTimeUpdate?.(time);
                  }
                }, 800);
              } else {
                if (timerRef.current) {
                  clearInterval(timerRef.current);
                  timerRef.current = null;
                }
              }
            },
          },
        });
      } catch (err) {
        // Hata durumunda postMessage fallback devam eder
        console.warn('YouTube Player init warning:', err);
      }
    };

    if (window.YT && window.YT.Player) {
      initPlayer();
    } else {
      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initPlayer();
      };
    }

    return () => {
      isCancelled = true;
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [videoId, onTimeUpdate]);

  // Videoda belirtilen saniyeye atlama fonksiyonu
  const seekTo = (seconds: number) => {
    const targetSeconds = Math.max(0, Math.floor(seconds));
    setCurrentTime(targetSeconds);
    onTimeUpdate?.(targetSeconds);

    let seekSucceeded = false;

    // 1. YT.Player nesnesi ile doğrudan atlama
    if (playerRef.current && typeof playerRef.current.seekTo === 'function') {
      try {
        playerRef.current.seekTo(targetSeconds, true);
        playerRef.current.playVideo?.();
        seekSucceeded = true;
      } catch (e) {
        console.warn('YT.Player seekTo error:', e);
      }
    }

    // 2. PostMessage protokolü ile iframe'e atlama emri gönderme
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'seekTo',
            args: [targetSeconds, true],
          }),
          '*'
        );
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({
            event: 'command',
            func: 'playVideo',
            args: [],
          }),
          '*'
        );
        seekSucceeded = true;
      } catch (e) {
        console.warn('postMessage seek error:', e);
      }
    }

    // 3. Eğer oynatıcı henüz hazır değilse parametre olarak kaydet
    if (!seekSucceeded) {
      setPendingStartSeconds(targetSeconds);
    }
  };

  const [actionFeedback, setActionFeedback] = useState<'play' | 'pause' | 'forward' | 'backward' | null>(null);

  // Aksiyon geribildirim ikonunu 400ms sonra otomatik olarak tamamen kapat
  useEffect(() => {
    if (!actionFeedback) return;
    const timer = setTimeout(() => {
      setActionFeedback(null);
    }, 400);
    return () => clearTimeout(timer);
  }, [actionFeedback]);

  const triggerFeedback = (type: 'play' | 'pause' | 'forward' | 'backward') => {
    setActionFeedback(type);
  };

  const playVideo = () => {
    setIsPlaying(true);
    let ok = false;
    if (playerRef.current && typeof playerRef.current.playVideo === 'function') {
      try {
        playerRef.current.playVideo();
        ok = true;
      } catch (e) {
        console.warn('YT playVideo error:', e);
      }
    }
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'playVideo', args: [] }),
          '*'
        );
        ok = true;
      } catch (e) {
        console.warn('postMessage playVideo error:', e);
      }
    }
    return ok;
  };

  const pauseVideo = () => {
    setIsPlaying(false);
    let ok = false;
    if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
      try {
        playerRef.current.pauseVideo();
        ok = true;
      } catch (e) {
        console.warn('YT pauseVideo error:', e);
      }
    }
    if (iframeRef.current && iframeRef.current.contentWindow) {
      try {
        iframeRef.current.contentWindow.postMessage(
          JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
          '*'
        );
        ok = true;
      } catch (e) {
        console.warn('postMessage pauseVideo error:', e);
      }
    }
    return ok;
  };

  const togglePlay = () => {
    if (isPlaying) {
      pauseVideo();
      triggerFeedback('pause');
    } else {
      playVideo();
      triggerFeedback('play');
    }
  };

  const seekRelative = (deltaSeconds: number) => {
    const nextTime = Math.max(0, currentTime + deltaSeconds);
    seekTo(nextTime);
    triggerFeedback(deltaSeconds > 0 ? 'forward' : 'backward');
  };

  // Klavye Kısayolları (Space / K: Oynat/Durdur, J/L: Geri/İleri 10s)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === 'Space' || e.key === 'k' || e.key === 'K') {
        e.preventDefault();
        togglePlay();
      } else if (e.key === 'j' || e.key === 'J') {
        e.preventDefault();
        seekRelative(-10);
      } else if (e.key === 'l' || e.key === 'L') {
        e.preventDefault();
        seekRelative(10);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isPlaying, currentTime]);

  // Imperative handle
  useImperativeHandle(ref, () => ({
    seekTo,
    getCurrentTime: () => currentTime,
    playVideo,
    pauseVideo,
    togglePlay,
    seekRelative,
  }));

  // O an oynatılan bölüm indeksi
  const currentActiveSectionIndex = useMemo(() => {
    if (controlledActiveIndex !== undefined && controlledActiveIndex >= 0) {
      return controlledActiveIndex;
    }
    if (!sections || sections.length === 0) return -1;
    return sections.findIndex((s) => {
      if (s.startSeconds === undefined) return false;
      const end = s.endSeconds !== undefined ? s.endSeconds : Infinity;
      return currentTime >= s.startSeconds && currentTime <= end;
    });
  }, [controlledActiveIndex, sections, currentTime]);

  const activeSection = currentActiveSectionIndex >= 0 ? sections[currentActiveSectionIndex] : null;

  const youtubeUrl = playlistId
    ? `https://www.youtube.com/watch?v=${videoId}&list=${playlistId}${currentTime > 0 ? `&t=${Math.floor(currentTime)}s` : ''}`
    : `https://www.youtube.com/watch?v=${videoId}${currentTime > 0 ? `&t=${Math.floor(currentTime)}s` : ''}`;

  const iframeSrc = useMemo(() => {
    const params = new URLSearchParams({
      enablejsapi: '1',
      rel: '0',
      modestbranding: '1',
      playsinline: '1',
      iv_load_policy: '3', // Hides video annotations and channel popups
      autohide: '1',       // Autohides player controls quickly
      controls: '1',
    });
    if (origin) {
      params.set('origin', origin);
    }
    if (pendingStartSeconds !== null && pendingStartSeconds > 0) {
      params.set('start', pendingStartSeconds.toString());
      params.set('autoplay', '1');
    }
    return `https://www.youtube-nocookie.com/embed/${videoId}?${params.toString()}`;
  }, [videoId, origin, pendingStartSeconds]);

  return (
    <div className={cn(
      "overflow-hidden rounded-2xl border border-border bg-card shadow-md space-y-0 transition-all duration-300",
      isCinemaMode && "shadow-2xl ring-1 ring-primary/25",
      className
    )}>
      {/* Video Container */}
      <div className="relative aspect-video w-full bg-black select-none group">
        {isMediaConsentDenied ? (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-white bg-gradient-to-b from-slate-900 via-slate-950 to-black">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/20 text-primary border border-primary/30 mb-3 shadow-lg">
              <Video className="h-6 w-6" />
            </div>
            <p className="text-sm font-bold text-white">YouTube Medya Çerezleri Devre Dışı</p>
            <p className="text-xs text-slate-300 mt-1 max-w-md leading-relaxed">
              Ders videolarını doğrudan platform üzerinden oynatabilmek ve konu anlatımı bölümlerine atlayabilmek için YouTube medya iznine ihtiyaç duyulmaktadır.
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
              <Button
                size="sm"
                variant="primary"
                onClick={() => saveCustomPreferences({ media: true })}
                className="text-xs font-bold gap-1.5 shadow-md"
              >
                <Play className="h-3.5 w-3.5" />
                <span>İzin Ver ve Oynat</span>
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => openBanner({ customize: true })}
                className="text-xs text-white border-white/20 hover:bg-white/10"
              >
                <span>Çerez Tercihlerini Aç</span>
              </Button>
              <a
                href={youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white px-3 py-1.5 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                <span>YouTube'da Aç</span>
              </a>
            </div>
          </div>
        ) : !hasError ? (
          <>
            <iframe
              id={iframeUniqueId}
              ref={iframeRef}
              src={iframeSrc}
              title={title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              onError={() => setHasError(true)}
              className="h-full w-full border-0"
            />


          </>
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center text-white bg-slate-900">
            <AlertCircle className="h-10 w-10 text-amber-500 mb-2" />
            <p className="text-sm font-semibold">Video burada yüklenemedi.</p>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Tarayıcınızın gizlilik veya eklenti ayarları YouTube iframe gömmeyi engellemiş olabilir.
            </p>
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
            >
              <Play className="h-3.5 w-3.5" />
              <span>YouTube Üzerinde İzle</span>
            </a>
          </div>
        )}
      </div>

      {/* Video Header Bar: Title, Playing Status, Quick Controls, Cinema Mode & YouTube Link */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 bg-card/95 p-2.5 sm:px-3 text-xs">
        <div className="flex items-center gap-2 truncate max-w-full sm:max-w-md">
          {/* Hızlı Oynat / Duraklat Butonu */}
          <Button
            type="button"
            variant={isPlaying ? "outline" : "primary"}
            size="sm"
            onClick={togglePlay}
            className={cn(
              "h-7 px-2.5 text-[11px] gap-1.5 font-bold transition-all shrink-0",
              isPlaying
                ? "border-border text-foreground hover:bg-muted"
                : "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
            )}
            title={isPlaying ? "Videoyu Duraklat (Boşluk / K)" : "Videoyu Oynat (Boşluk / K)"}
          >
            {isPlaying ? (
              <>
                <Pause className="h-3.5 w-3.5 fill-current" />
                <span className="hidden sm:inline">Durdur</span>
              </>
            ) : (
              <>
                <Play className="h-3.5 w-3.5 fill-current text-primary-foreground" />
                <span className="hidden sm:inline">Oynat</span>
              </>
            )}
          </Button>

          {/* Hızlı Geri / İleri Sarma Butonları (±10s) */}
          <div className="flex items-center gap-1 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => seekRelative(-10)}
              className="h-7 px-1.5 text-[10px] font-mono gap-0.5 text-muted-foreground hover:text-foreground hover:border-primary/40"
              title="10 saniye geri al (Kısayol: J)"
            >
              <RotateCcw className="h-3 w-3" />
              <span>-10s</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => seekRelative(10)}
              className="h-7 px-1.5 text-[10px] font-mono gap-0.5 text-muted-foreground hover:text-foreground hover:border-primary/40"
              title="10 saniye ileri al (Kısayol: L)"
            >
              <RotateCw className="h-3 w-3" />
              <span>+10s</span>
            </Button>
          </div>

          <span className="truncate font-semibold text-foreground text-xs ml-1">{title}</span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {activeSection && (
            <Badge variant="outline" className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium bg-primary/5 text-primary border-primary/20">
              <Sparkles className="h-3 w-3" />
              <span className="truncate max-w-[180px]">{activeSection.title}</span>
              {activeSection.timeRange && (
                <span className="font-mono text-[10px] opacity-75">({activeSection.timeRange})</span>
              )}
            </Badge>
          )}

          {onToggleCinemaMode && (
            <Button
              type="button"
              variant={isCinemaMode ? "default" : "outline"}
              size="sm"
              onClick={onToggleCinemaMode}
              className={cn(
                "h-7 text-[11px] gap-1.5 transition-all font-semibold",
                isCinemaMode
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-xs"
                  : "text-foreground hover:text-primary hover:border-primary/50"
              )}
              title={isCinemaMode ? "Normal Görünüme Dön (Kısayol: T)" : "Sinema Moduna Geç (Kısayol: T)"}
            >
              {isCinemaMode ? (
                <>
                  <Minimize2 className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Normal Görünüm</span>
                </>
              ) : (
                <>
                  <Maximize2 className="h-3.5 w-3.5 text-primary" />
                  <span className="hidden sm:inline">Sinema Modu</span>
                </>
              )}
              <kbd className="hidden md:inline-flex items-center px-1 py-0.2 rounded text-[9px] font-mono bg-muted/80 text-muted-foreground border border-border/60 ml-0.5">
                T
              </kbd>
            </Button>
          )}

          <a
            href={youtubeUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="outline" size="sm" className="h-7 text-[11px] gap-1.5 hover:text-red-500 transition-colors">
              <span>YouTube'da Aç</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
        </div>
      </div>

      {/* Dilci Burak Hoca Destek ve Abone Olma Bilgi Çubuğu */}
      {!isSupportBannerDismissed && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-3 py-2 bg-gradient-to-r from-rose-500/10 via-amber-500/10 to-primary/10 border-t border-border/60 text-xs">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-500/15 text-rose-600 dark:text-rose-400 shrink-0">
              <Heart className="h-3.5 w-3.5 fill-current" />
            </span>
            <p className="text-foreground text-[11px] leading-tight">
              <strong>Dilci Burak Hoca'ya Destek Olun:</strong> Bu ücretsiz dersler için videoyu beğenmeyi ve kanala abone olmayı unutmayın!
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto">
            <a
              href={youtubeUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-rose-600 hover:bg-rose-700 text-white transition-colors shadow-xs"
              title="Videoyu YouTube'da Beğen"
            >
              <ThumbsUp className="h-3 w-3" />
              <span>Beğen</span>
            </a>
            <a
              href="https://www.youtube.com/@dilciburakhoca?sub_confirmation=1"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 hover:opacity-90 transition-opacity shadow-xs"
              title="Kanala Abone Ol"
            >
              <Bell className="h-3 w-3" />
              <span>Abone Ol</span>
            </a>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsSupportModalOpen(true)}
              className="h-6 px-2 text-[11px] text-muted-foreground hover:text-foreground font-medium"
            >
              Bilgi Ekranı
            </Button>
            <button
              type="button"
              onClick={() => {
                setIsSupportBannerDismissed(true);
                try {
                  localStorage.setItem('yds_support_banner_dismissed', 'true');
                } catch { }
              }}
              className="p-1 text-muted-foreground hover:text-foreground rounded-md hover:bg-muted/60 transition-colors"
              title="Kapat"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Video Sections / Chapters Navigation Panel */}
      {sections && sections.length > 0 && (
        <div className="border-t border-border/60 bg-muted/20">
          {/* Chapters Accordion / Toggle Header */}
          <button
            type="button"
            onClick={() => setIsChapterListOpen((prev) => !prev)}
            className="w-full flex items-center justify-between p-3 text-left hover:bg-muted/40 transition-colors"
          >
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ListVideo className="h-3.5 w-3.5" />
              </div>
              <div>
                <span className="text-xs font-bold text-foreground">
                  Video Bölümleri & Konu Başlıkları
                </span>
                <span className="text-[11px] text-muted-foreground ml-2">
                  ({sections.length} Alt Başlık • Zaman Damgalı)
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                {isChapterListOpen ? 'Gizle' : 'Tüm Bölümleri Gör'}
              </span>
              {isChapterListOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </button>

          {/* Chapters List */}
          {isChapterListOpen && (
            <div className={cn(
              "p-3 pt-0 grid grid-cols-1 sm:grid-cols-2 gap-2 transition-all",
              isCinemaMode && "lg:grid-cols-3"
            )}>
              {sections.map((section, idx) => {
                const isActive = currentActiveSectionIndex === idx;
                const hasTime = section.startSeconds !== undefined;

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      if (hasTime && section.startSeconds !== undefined) {
                        seekTo(section.startSeconds);
                      }
                      onSectionSelect?.(section, idx);
                    }}
                    className={cn(
                      "flex items-start gap-2.5 p-2.5 rounded-xl border text-left text-xs transition-all relative group",
                      isActive
                        ? "border-primary bg-primary/10 text-primary font-medium shadow-sm ring-1 ring-primary/40"
                        : "border-border/70 hover:border-primary/40 bg-card hover:bg-muted/50 text-foreground"
                    )}
                  >
                    {/* Play/Active Icon */}
                    <div className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-lg shrink-0 mt-0.5 transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground group-hover:bg-primary/20 group-hover:text-primary"
                    )}>
                      {isActive ? (
                        <Play className="h-3.5 w-3.5 fill-current animate-pulse" />
                      ) : (
                        <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                      )}
                    </div>

                    {/* Section Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        {section.timeRange ? (
                          <span className={cn(
                            "inline-flex items-center gap-1 font-mono text-[11px] font-bold px-1.5 py-0.5 rounded transition-colors",
                            isActive
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground group-hover:text-foreground"
                          )}>
                            <Clock className="h-3 w-3" />
                            <span>{section.timeRange}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground">
                            {idx + 1}. Bölüm
                          </span>
                        )}

                        {isActive && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-primary animate-pulse">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Oynatılıyor</span>
                          </span>
                        )}
                      </div>

                      <div className={cn(
                        "font-semibold line-clamp-2 text-xs leading-snug",
                        isActive ? "text-primary" : "text-foreground"
                      )}>
                        {section.title}
                      </div>

                      {section.formula && (
                        <div className="mt-1 text-[11px] text-muted-foreground line-clamp-1 font-mono opacity-80">
                          {section.formula}
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Dilci Burak Hoca Beğen & Abone Ol Bilgi Ekranı Modalı */}
      <VideoSupportModal
        isOpen={isSupportModalOpen}
        onClose={() => setIsSupportModalOpen(false)}
        videoId={videoId}
        videoTitle={title}
        instructor="Dilci Burak Hoca"
        onSupported={() => setHasSupported(true)}
      />
    </div>
  );
});

YouTubeEmbed.displayName = 'YouTubeEmbed';

import { useState, useEffect, useRef, useImperativeHandle, forwardRef, useMemo } from 'react';
import { ExternalLink, Play, AlertCircle, Clock, ListVideo, ChevronDown, ChevronUp, Sparkles, CheckCircle2, Maximize2, Minimize2 } from 'lucide-react';
import { Button } from './button';
import { Badge } from './badge';
import { cn } from '../../lib/utils';
import type { GrammarSectionNote } from '../../core/content/grammar-lessons.data';

export interface YouTubeEmbedHandle {
  seekTo: (seconds: number) => void;
  getCurrentTime: () => number;
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

  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const playerRef = useRef<any>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const iframeUniqueId = useMemo(() => `yt-player-${videoId.replace(/[^a-zA-Z0-9_-]/g, '')}`, [videoId]);

  // Sayfa origin'i (YouTube JS API güvenliği için)
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  // YouTube IFrame API script yükleme
  useEffect(() => {
    loadYouTubeApi();
  }, []);

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
          }
        }

        // onStateChange event
        if (data.event === 'onStateChange') {
          setIsPlaying(data.info === 1);
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

  // Imperative handle
  useImperativeHandle(ref, () => ({
    seekTo,
    getCurrentTime: () => currentTime,
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
      <div className="relative aspect-video w-full bg-black">
        {!hasError ? (
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

      {/* Video Header Bar: Title, Playing Status, Cinema Mode & YouTube Link */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/50 bg-card/95 p-3 text-xs">
        <div className="flex items-center gap-2 truncate max-w-full sm:max-w-md">
          <span className={cn(
            "flex h-2.5 w-2.5 rounded-full shrink-0 transition-colors",
            isPlaying ? "bg-red-500 animate-pulse ring-2 ring-red-400/40" : "bg-muted-foreground/40"
          )} />
          <span className="truncate font-semibold text-foreground">{title}</span>
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
    </div>
  );
});

YouTubeEmbed.displayName = 'YouTubeEmbed';

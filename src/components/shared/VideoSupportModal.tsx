import React, { useState, useEffect } from 'react';
import {
  ThumbsUp,
  Bell,
  Heart,
  ExternalLink,
  Check,
  X,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export interface VideoSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoId: string;
  videoTitle: string;
  instructor?: string;
  channelUrl?: string;
  onSupported?: () => void;
}

const STORAGE_KEY_SUPPORTED = 'yds_creator_supported';

export const VideoSupportModal: React.FC<VideoSupportModalProps> = ({
  isOpen,
  onClose,
  videoId,
  videoTitle,
  instructor = 'Dilci Burak Hoca',
  channelUrl = 'https://www.youtube.com/@dilciburakhoca',
  onSupported,
}) => {
  const [hasMarkedSupported, setHasMarkedSupported] = useState<boolean>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY_SUPPORTED) === 'true';
    } catch {
      return false;
    }
  });

  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const youtubeVideoUrl = `https://www.youtube.com/watch?v=${videoId}`;
  const youtubeSubscribeUrl = `${channelUrl}?sub_confirmation=1`;

  const handleMarkSupported = () => {
    try {
      localStorage.setItem(STORAGE_KEY_SUPPORTED, 'true');
    } catch {
      // yoksay
    }
    setHasMarkedSupported(true);
    onSupported?.();
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(youtubeVideoUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in-0 duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Dialog Card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="video-support-title"
        className="relative z-10 w-full max-w-lg rounded-3xl border border-primary/25 bg-card text-foreground shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200 ring-1 ring-white/10"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          title="Kapat (Esc)"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header with Badges and Visual Icon */}
        <div className="flex items-start gap-4 pr-6">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500/20 via-red-500/15 to-primary/25 text-rose-500 border border-rose-500/30 shadow-inner">
            <ThumbsUp className="h-7 w-7" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25 gap-1 font-semibold">
                <Heart className="h-3 w-3 fill-rose-500" />
                <span>Emeğe Saygı</span>
              </Badge>
              <Badge variant="outline" className="text-[10px] bg-primary/10 text-primary border-primary/25 font-semibold">
                <span>{instructor}</span>
              </Badge>
            </div>
            <h2 id="video-support-title" className="text-lg font-bold text-foreground leading-tight">
              Videoyu Beğen & Kanala Abone Ol
            </h2>
            <p className="text-xs text-muted-foreground line-clamp-1">
              {videoTitle}
            </p>
          </div>
        </div>

        {/* Informative Explanation */}
        <div className="rounded-2xl bg-muted/50 p-4 border border-border/70 space-y-2 text-xs leading-relaxed text-muted-foreground">
          <p>
            <strong className="text-foreground">{instructor}</strong>, 18 Günde YDS-YÖKDİL-YDT Kampı kapsamındaki tüm konu anlatımı derslerini, strateji tüyolarını ve sınav soru analizlerini <strong>tamamen ücretsiz</strong> olarak sunmaktadır.
          </p>
          <p>
            Derslerin devamı, içeriğin daha fazla sınava hazırlanan öğrenciye ulaşması ve hocamızın emeğine teşekkür etmek için <strong className="text-foreground">videoyu YouTube'da beğenip kanala abone olarak</strong> büyük katkı sağlayabilirsiniz!
          </p>
        </div>

        {/* Action Cards (Like & Subscribe) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Card 1: Videoyu Beğen */}
          <a
            href={youtubeVideoUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between p-4 rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] hover:bg-rose-500/[0.09] hover:border-rose-500/40 transition-all shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400">
                  <ThumbsUp className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </span>
                <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  Adım 1
                </span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground group-hover:text-rose-600 dark:group-hover:text-rose-400 transition-colors">
                  Videoyu Beğen
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Videonun YouTube algoritmasında öne çıkmasını sağlar.
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
              <span>YouTube'da Beğen</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </div>
          </a>

          {/* Card 2: Kanala Abone Ol */}
          <a
            href={youtubeSubscribeUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col justify-between p-4 rounded-2xl border border-primary/20 bg-primary/[0.04] hover:bg-primary/[0.09] hover:border-primary/40 transition-all shadow-xs"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/15 text-primary">
                  <Bell className="h-4 w-4 group-hover:scale-110 transition-transform" />
                </span>
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                  Adım 2
                </span>
              </div>
              <div>
                <h3 className="text-xs font-bold text-foreground group-hover:text-primary transition-colors">
                  Kanala Abone Ol
                </h3>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Yeni kampları, soru çözümlerini ve canlı yayınları kaçırmayın.
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1.5 text-xs font-bold text-primary">
              <span>Tek Tıkla Abone Ol</span>
              <ExternalLink className="h-3.5 w-3.5" />
            </div>
          </a>
        </div>

        {/* Gratitude & Confirmation Toggle */}
        <div className="pt-2 border-t border-border/70 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleCopyLink}
            className="inline-flex items-center justify-center gap-1.5 text-xs text-muted-foreground hover:text-foreground py-1 px-2 rounded-lg hover:bg-muted transition-colors self-start sm:self-auto"
          >
            {copiedLink ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Video Linki Kopyalandı!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>Video Linkini Paylaş</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2">
            {!hasMarkedSupported ? (
              <Button
                variant="primary"
                size="sm"
                onClick={handleMarkSupported}
                className="flex-1 sm:flex-initial text-xs h-9 px-4 font-bold shadow-md gap-1.5"
              >
                <Heart className="h-3.5 w-3.5 fill-current" />
                <span>Beğendim & Abone Oldum</span>
              </Button>
            ) : (
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-3 py-1.5 rounded-xl">
                <CheckCircle2 className="h-4 w-4" />
                <span>Desteğiniz için teşekkürler! 🎉</span>
              </div>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="text-xs h-9 px-3 text-muted-foreground hover:text-foreground"
            >
              Kapat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

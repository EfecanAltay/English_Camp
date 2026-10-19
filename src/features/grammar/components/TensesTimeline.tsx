import React, { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import type { PeriodType, AspectType } from '../../../core/content/tenses-lab.data';

export interface TensesTimelineProps {
  period: PeriodType;
  aspect: AspectType;
  note: string;
}

export const TensesTimeline: React.FC<TensesTimelineProps> = ({
  period,
  aspect,
  note,
}) => {
  const [replayKey, setReplayKey] = useState(0);

  const handleReplay = () => {
    setReplayKey((prev) => prev + 1);
  };

  const color =
    period === 'past'
      ? '#e39c57'
      : period === 'present'
        ? '#30a78c'
        : '#6485e7';

  const renderTimelineVisuals = () => {
    if (aspect === 'simple') {
      if (period === 'present') {
        const dots = [170, 280, 390, 500, 610, 720, 830];
        return (
          <>
            {dots.map((x, i) => (
              <circle
                key={`dot-${x}`}
                className="timeline-appearing"
                style={{ animationDelay: `${i * 0.16}s` }}
                cx={x}
                cy={127}
                r={9}
                fill={color}
                stroke="white"
                strokeWidth={4}
              />
            ))}
            <text
              x={500}
              y={188}
              textAnchor="middle"
              className="fill-foreground/75 text-[17px] font-bold"
            >
              tekrar eden alışkanlık / rutin
            </text>
          </>
        );
      } else {
        const x = period === 'past' ? 285 : 752;
        const text = period === 'past' ? 'tamamlanan olay' : 'gelecekteki olay';
        return (
          <>
            <circle
              className="timeline-appearing"
              style={{ animationDelay: '0.16s' }}
              cx={x}
              cy={127}
              r={14}
              fill={color}
              stroke="white"
              strokeWidth={4}
            />
            <text
              x={x}
              y={188}
              textAnchor="middle"
              className="fill-foreground/75 text-[17px] font-bold"
            >
              {text}
            </text>
          </>
        );
      }
    } else if (aspect === 'continuous') {
      const s = period === 'past' ? 170 : period === 'present' ? 375 : 635;
      const e = period === 'past' ? 395 : period === 'present' ? 625 : 865;
      const text =
        period === 'past'
          ? 'o sırada sürüyordu'
          : period === 'present'
            ? 'şu anda sürüyor'
            : 'o sırada sürüyor olacak';

      return (
        <>
          <line
            x1={s}
            y1={127}
            x2={e}
            y2={127}
            stroke={color}
            strokeWidth={15}
            strokeLinecap="round"
            className="timeline-trace"
          />
          <circle
            className="timeline-moving-dot"
            cy={127}
            cx={s}
            r={8}
            fill={color}
            stroke="white"
            strokeWidth={3}
          >
            <animate
              attributeName="cx"
              values={`${s};${e};${s}`}
              keyTimes="0;0.83;1"
              dur="3.6s"
              repeatCount="indefinite"
            />
          </circle>
          <text
            x={(s + e) / 2}
            y={188}
            textAnchor="middle"
            className="fill-foreground/75 text-[17px] font-bold"
          >
            {text}
          </text>
        </>
      );
    } else if (aspect === 'perfect') {
      const s = period === 'past' ? 175 : period === 'present' ? 305 : 650;
      const e = period === 'past' ? 345 : period === 'present' ? 500 : 832;
      const refText =
        period === 'past'
          ? 'geçmiş referans'
          : period === 'present'
            ? 'bugüne etkisi'
            : 'gelecek hedef';

      return (
        <>
          <line
            x1={s}
            y1={127}
            x2={e}
            y2={127}
            stroke={color}
            strokeWidth={8}
            strokeLinecap="round"
            className="timeline-trace"
          />
          <circle
            className="timeline-appearing"
            style={{ animationDelay: '0.45s' }}
            cx={s}
            cy={127}
            r={12}
            fill={color}
            stroke="white"
            strokeWidth={4}
          />
          {period === 'present' ? (
            <circle
              className="timeline-appearing"
              style={{ animationDelay: '1.1s' }}
              cx={e}
              cy={127}
              r={9}
              fill="#5477bd"
              stroke="white"
              strokeWidth={3}
            />
          ) : (
            <path
              d={`M${e} 113 l14 14 -14 14 -14 -14Z`}
              fill="#ecae64"
              stroke="#fff"
              strokeWidth={3}
              className="timeline-appearing"
              style={{ animationDelay: '1s' }}
            />
          )}
          <text
            x={s}
            y={192}
            textAnchor="middle"
            className="fill-foreground/75 text-[16px] font-bold"
          >
            önceki olay
          </text>
          <text
            x={e}
            y={215}
            textAnchor="middle"
            className="fill-foreground/75 text-[16px] font-bold"
          >
            {refText}
          </text>
        </>
      );
    } else {
      // perfectContinuous
      const s = period === 'past' ? 105 : period === 'present' ? 215 : 480;
      const e = period === 'past' ? 345 : period === 'present' ? 500 : 835;
      const text =
        period === 'past'
          ? 'geçmişte biriken süre'
          : period === 'present'
            ? 'şimdiye kadar geçen süre'
            : 'gelecekte birikecek süre';

      return (
        <>
          <line
            x1={s}
            y1={127}
            x2={e}
            y2={127}
            stroke={color}
            strokeWidth={14}
            strokeLinecap="round"
            className="timeline-trace"
          />
          <circle
            className="timeline-moving-dot"
            cy={127}
            cx={s}
            r={8}
            fill={color}
            stroke="white"
            strokeWidth={3}
          >
            <animate
              attributeName="cx"
              values={`${s};${e};${s}`}
              keyTimes="0;0.83;1"
              dur="3.6s"
              repeatCount="indefinite"
            />
          </circle>
          {period !== 'present' && (
            <path
              d={`M${e} 113 l14 14 -14 14 -14 -14Z`}
              fill="#ecae64"
              stroke="#fff"
              strokeWidth={3}
              className="timeline-appearing"
              style={{ animationDelay: '0.8s' }}
            />
          )}
          <text
            x={(s + e) / 2}
            y={188}
            textAnchor="middle"
            className="fill-foreground/75 text-[17px] font-bold"
          >
            {text}
          </text>
        </>
      );
    }
  };

  return (
    <div className="rounded-2xl border border-border/70 bg-gradient-to-br from-card via-card to-muted/20 p-4 sm:p-5 shadow-xs overflow-hidden space-y-3">
      {/* Head */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
            <span className="h-2 w-2 rounded-full bg-primary animate-pulse" />
          </div>
          <strong className="text-xs sm:text-sm font-bold uppercase tracking-wider text-foreground">
            HAREKETLİ ZAMAN ÇİZGİSİ
          </strong>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleReplay}
          className="h-8 text-xs font-semibold gap-1.5 border-border bg-background hover:bg-muted text-foreground"
          title="Animasyonu Baştan Oynat"
        >
          <RotateCcw className="h-3.5 w-3.5 text-primary" />
          <span>Tekrar Oynat</span>
        </Button>
      </div>

      {/* SVG Canvas */}
      <div className="w-full overflow-x-auto py-1">
        <svg
          viewBox="0 0 1000 228"
          className="w-full h-auto min-h-[160px] sm:min-h-[190px] select-none block overflow-visible"
          role="img"
          aria-label="Olayları geçmiş, şimdi ve gelecek üzerine yerleştiren hareketli zaman çizgisi"
        >
          <defs>
            <marker
              id="timeline-endarrow"
              markerWidth="7"
              markerHeight="7"
              refX="5.4"
              refY="3.5"
              orient="auto"
            >
              <path
                d="M0 0 L7 3.5 L0 7"
                fill="none"
                stroke="#8c9bc1"
                strokeWidth="1.4"
              />
            </marker>
          </defs>

          {/* Past & Future Region Pill Backgrounds */}
          <rect
            x="48"
            y="104"
            width="436"
            height="47"
            rx="10"
            className="fill-muted/70"
          />
          <rect
            x="515"
            y="104"
            width="436"
            height="47"
            rx="10"
            className="fill-muted/70"
          />

          {/* Main Axis Line */}
          <line
            x1="56"
            y1="127"
            x2="942"
            y2="127"
            stroke="#9daecc"
            strokeWidth="3"
            strokeLinecap="round"
            markerEnd="url(#timeline-endarrow)"
          />

          {/* Vertical NOW Reference Line */}
          <line
            x1="500"
            y1="76"
            x2="500"
            y2="185"
            stroke="#7189c1"
            strokeWidth="2"
            strokeDasharray="5 7"
          />
          <circle
            cx="500"
            cy="127"
            r="9"
            fill="#7189c1"
            stroke="white"
            strokeWidth="4"
          />

          {/* Time Zone Labels */}
          <text
            x="85"
            y="76"
            className="fill-muted-foreground text-[22px] font-extrabold uppercase tracking-wider"
          >
            PAST
          </text>
          <text
            x="500"
            y="65"
            textAnchor="middle"
            className="fill-primary text-[24px] font-black uppercase tracking-wider"
          >
            NOW
          </text>
          <text
            x="915"
            y="76"
            textAnchor="end"
            className="fill-muted-foreground text-[22px] font-extrabold uppercase tracking-wider"
          >
            FUTURE
          </text>

          {/* Dynamic Animation Layer keyed for clean restart */}
          <g key={replayKey}>{renderTimelineVisuals()}</g>
        </svg>
      </div>

      {/* Note & Legend */}
      <div className="space-y-2 pt-1 border-t border-border/40">
        <p className="text-xs sm:text-sm font-medium text-muted-foreground leading-relaxed">
          {note}
        </p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-primary" />
            <span>Eylem / Olay</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-4 rounded-full bg-primary/70" />
            <span>Süreç / Bağlantı</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rotate-45 bg-amber-500 rounded-xs" />
            <span>Referans Anı / Hedef</span>
          </span>
        </div>
      </div>
    </div>
  );
};

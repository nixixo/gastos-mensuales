"use client";

import { useMemo, useState } from "react";
import { ICON_MAP } from "@/lib/icon-map";
import { formatCLP } from "@/lib/utils";
import type { Expense } from "@/lib/types";

interface DonutChartProps {
  expenses: Expense[];
  total: number;
}

interface Segment {
  key: string;
  label: string;
  amount: number;
  color: string;
  percentage: number;
}

// Concentric rings configuration
const RING_COUNT = 4;
const INNER_RADIUS = 80;
const RING_WIDTH = 10;
const RING_GAP = 7;
const CENTER = 160;
const SEGMENT_GAP_DEG = 6;

const DEFAULT_COLORS = [
  "#ffffff",
  "#a3a3a3",
  "#737373",
  "#d4d4d4",
  "#525252",
  "#e5e5e5",
  "#404040",
  "#fafafa",
];

function groupExpensesByIcon(expenses: Expense[]): Segment[] {
  const grouped: Record<string, { label: string; amount: number; color?: string }> = {};

  for (const expense of expenses) {
    if (grouped[expense.icon]) {
      grouped[expense.icon].amount += expense.amount;
    } else {
      const entry = ICON_MAP[expense.icon];
      grouped[expense.icon] = {
        label: entry?.label ?? expense.name,
        amount: expense.amount,
        color: entry?.color,
      };
    }
  }

  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  let colorIndex = 0;

  return Object.entries(grouped)
    .sort(([, a], [, b]) => b.amount - a.amount)
    .map(([key, data]) => ({
      key,
      label: data.label,
      amount: data.amount,
      color: data.color ?? DEFAULT_COLORS[colorIndex++ % DEFAULT_COLORS.length],
      percentage: total > 0 ? data.amount / total : 0,
    }));
}

function degreesToRadians(deg: number) {
  return (deg * Math.PI) / 180;
}

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = degreesToRadians(angleDeg);
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number) {
  const start = polarToCartesian(cx, cy, r, startDeg);
  const end = polarToCartesian(cx, cy, r, endDeg);
  const sweep = endDeg - startDeg;
  const largeArc = sweep > 180 ? 1 : 0;
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`;
}

interface Arc {
  segmentKey: string;
  key: string;
  radius: number;
  startDeg: number;
  endDeg: number;
  color: string;
}

export default function DonutChart({ expenses, total }: DonutChartProps) {
  const segments = useMemo(() => groupExpensesByIcon(expenses), [expenses]);
  const [hoveredSegment, setHoveredSegment] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const arcs = useMemo(() => {
    if (segments.length === 0) return [];

    const totalGaps = SEGMENT_GAP_DEG * segments.length;
    const availableDeg = 360 - totalGaps;
    const result: Arc[] = [];

    const EXTRA_GAP_INNER = 6;

    let cursor = -90;

    for (const seg of segments) {
      const segDeg = seg.percentage * availableDeg;

      for (let ring = 0; ring < RING_COUNT; ring++) {
        const radius = INNER_RADIUS + ring * (RING_WIDTH + RING_GAP);
        const t = ring / (RING_COUNT - 1);
        const halfExtra = (EXTRA_GAP_INNER / 2) * (1 - t);
        const maxHalf = segDeg * 0.15;
        const trim = Math.min(halfExtra, maxHalf);
        const start = cursor + trim;
        const end = cursor + segDeg - trim;

        result.push({
          segmentKey: seg.key,
          key: `${seg.key}-ring-${ring}`,
          radius,
          startDeg: start,
          endDeg: end,
          color: seg.color,
        });
      }

      cursor += segDeg + SEGMENT_GAP_DEG;
    }

    return result;
  }, [segments]);

  const hoveredData = hoveredSegment
    ? segments.find((s) => s.key === hoveredSegment)
    : null;

  const svgSize = CENTER * 2;

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <svg
          width={svgSize}
          height={svgSize}
          viewBox={`0 0 ${svgSize} ${svgSize}`}
          onMouseLeave={() => setHoveredSegment(null)}
        >
          <defs>
            {/* Glow filter for hovered segments */}
            {segments.map((seg) => (
              <filter
                key={`glow-${seg.key}`}
                id={`glow-${seg.key}`}
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feGaussianBlur stdDeviation="4" result="blur" />
                <feFlood floodColor={seg.color} floodOpacity="0.6" result="color" />
                <feComposite in="color" in2="blur" operator="in" result="glow" />
                <feMerge>
                  <feMergeNode in="glow" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            ))}
          </defs>

          {/* Background rings */}
          {Array.from({ length: RING_COUNT }).map((_, ring) => {
            const radius = INNER_RADIUS + ring * (RING_WIDTH + RING_GAP);
            return (
              <circle
                key={`bg-${ring}`}
                cx={CENTER}
                cy={CENTER}
                r={radius}
                fill="none"
                stroke="white"
                strokeWidth={RING_WIDTH}
                opacity={0.03}
              />
            );
          })}

          {/* Segment arcs on each ring, grouped by segment for transform */}
          {segments.map((seg) => {
            const segArcs = arcs.filter((a) => a.segmentKey === seg.key);
            const isHovered = hoveredSegment === seg.key;
            const isDimmed = hoveredSegment !== null && !isHovered;
            return (
              <g
                key={seg.key}
                style={{
                  transformOrigin: `${CENTER}px ${CENTER}px`,
                  transform: isHovered ? "scale(1.045)" : "scale(1)",
                  transition: "transform 0.3s ease-out, opacity 0.3s ease-out",
                  opacity: isDimmed ? 0.15 : 1,
                }}
                filter={isHovered ? `url(#glow-${seg.key})` : undefined}
                onMouseEnter={(e) => {
                  setHoveredSegment(seg.key);
                  const rect = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
                  setTooltipPos({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }}
                onMouseMove={(e) => {
                  const rect = e.currentTarget.ownerSVGElement!.getBoundingClientRect();
                  setTooltipPos({
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                  });
                }}
                className="cursor-pointer"
              >
                {segArcs.map((arc) => (
                  <path
                    key={arc.key}
                    d={arcPath(CENTER, CENTER, arc.radius, arc.startDeg, arc.endDeg)}
                    fill="none"
                    stroke={arc.color}
                    strokeWidth={RING_WIDTH}
                    strokeLinecap="round"
                  />
                ))}
              </g>
            );
          })}
        </svg>

        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-semibold tracking-tight">
            {formatCLP(total)}
          </span>
          <span className="text-xs text-white/40">total</span>
        </div>

        {/* Tooltip */}
        {hoveredData && (
          <div
            className="absolute z-10 pointer-events-none bg-neutral-900 border border-white/10 rounded-xl px-4 py-3 shadow-xl"
            style={{
              left: tooltipPos.x,
              top: tooltipPos.y,
              transform: "translate(-50%, -120%)",
            }}
          >
            <div className="flex items-center gap-3">
              {(() => {
                const entry = ICON_MAP[hoveredData.key];
                if (!entry) return null;
                const Icon = entry.icon;
                return (
                  <Icon
                    size={20}
                    style={
                      entry.category === "brand" && entry.color
                        ? { color: entry.color }
                        : undefined
                    }
                    className={
                      entry.category !== "brand" ? "text-white/70" : ""
                    }
                  />
                );
              })()}
              <div className="flex flex-col">
                <span className="text-sm font-medium">{hoveredData.label}</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-white/60">
                    {formatCLP(hoveredData.amount)}
                  </span>
                  <span className="text-xs text-white/40">
                    {Math.round(hoveredData.percentage * 100)}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      {segments.length > 0 && (
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
          {segments.map((seg) => (
            <div key={seg.key} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-xs text-white/50">
                {seg.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

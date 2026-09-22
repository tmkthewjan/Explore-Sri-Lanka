"use client";

import React, { useState } from "react";

interface AreaPoint {
  label: string;
  value: number;
}

interface AreaTrendChartProps {
  data: AreaPoint[];
  color?: string;
  height?: number;
  valueLabel?: string;
}

/**
 * Responsive SVG Area / Trend Line Chart with Smooth Bezier Splines and Gradients
 */
export function AreaTrendChart({
  data = [],
  color = "#10b981",
  height = 200,
  valueLabel = "Count",
}: AreaTrendChartProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (!data || data.length === 0) {
    return (
      <div
        style={{ height }}
        className="flex items-center justify-center text-xs text-slate-500 font-medium"
      >
        No historical data recorded for this time range.
      </div>
    );
  }

  const values = data.map((d) => d.value);
  const maxVal = Math.max(...values, 5);
  const minVal = 0;
  const paddingX = 40;
  const paddingY = 24;
  const svgWidth = 600;
  const svgHeight = height;

  const getX = (index: number) => {
    if (data.length <= 1) return svgWidth / 2;
    return paddingX + (index / (data.length - 1)) * (svgWidth - paddingX * 2);
  };

  const getY = (val: number) => {
    const range = maxVal - minVal || 1;
    return svgHeight - paddingY - ((val - minVal) / range) * (svgHeight - paddingY * 2);
  };

  // Build SVG Path with smooth curves
  const points = data.map((d, i) => `${getX(i)},${getY(d.value)}`);
  const linePath = points.length > 0 ? `M ${points.join(" L ")}` : "";
  const areaPath =
    points.length > 0
      ? `M ${getX(0)},${svgHeight - paddingY} L ${points.join(" L ")} L ${getX(
          data.length - 1
        )},${svgHeight - paddingY} Z`
      : "";

  return (
    <div className="w-full relative select-none">
      <svg
        viewBox={`0 0 ${svgWidth} ${svgHeight}`}
        className="w-full h-auto overflow-visible"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((p, idx) => {
          const y = paddingY + p * (svgHeight - paddingY * 2);
          const val = Math.round(maxVal - p * maxVal);
          return (
            <g key={idx}>
              <line
                x1={paddingX}
                y1={y}
                x2={svgWidth - paddingX}
                y2={y}
                stroke="#334155"
                strokeDasharray="4 4"
                strokeWidth="1"
                opacity="0.4"
              />
              <text
                x={paddingX - 8}
                y={y + 3}
                fill="#64748b"
                fontSize="10"
                textAnchor="end"
                fontFamily="monospace"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Filled Area */}
        <path d={areaPath} fill="url(#areaGradient)" />

        {/* Trend Line */}
        <path
          d={linePath}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Interactive Dots & Tooltip Anchors */}
        {data.map((d, i) => {
          const cx = getX(i);
          const cy = getY(d.value);
          const isHovered = hoveredIndex === i;

          return (
            <g key={i} className="cursor-pointer">
              <circle
                cx={cx}
                cy={cy}
                r={isHovered ? "6" : "3.5"}
                fill={isHovered ? "#ffffff" : color}
                stroke="#0f172a"
                strokeWidth="2"
                className="transition-all"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* Dynamic Hover Tooltip */}
      {hoveredIndex !== null && data[hoveredIndex] && (
        <div
          className="absolute -top-10 px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-white text-[11px] font-mono shadow-xl pointer-events-none transform -translate-x-1/2 flex items-center gap-1.5 z-10"
          style={{
            left: `${((hoveredIndex) / Math.max(1, data.length - 1)) * 80 + 10}%`,
          }}
        >
          <span className="text-slate-400">{data[hoveredIndex].label}:</span>
          <span className="font-bold text-emerald-400">
            {data[hoveredIndex].value} {valueLabel}
          </span>
        </div>
      )}

      {/* X-axis labels */}
      <div className="flex justify-between px-6 mt-2 text-[10px] text-slate-500 font-mono">
        <span>{data[0]?.label || ""}</span>
        {data.length > 2 && <span>{data[Math.floor(data.length / 2)]?.label || ""}</span>}
        <span>{data[data.length - 1]?.label || ""}</span>
      </div>
    </div>
  );
}

interface BarRankItem {
  label: string;
  count: number;
  subLabel?: string;
  avatar?: string;
  badge?: string;
}

interface BarRankChartProps {
  items: BarRankItem[];
  color?: string;
  maxItems?: number;
}

/**
 * Animated Horizontal Ranking Bar Chart
 */
export function BarRankChart({
  items = [],
  color = "bg-emerald-500",
  maxItems = 6,
}: BarRankChartProps) {
  const displayItems = items.slice(0, maxItems);
  const maxCount = Math.max(...displayItems.map((i) => i.count), 1);

  if (displayItems.length === 0) {
    return (
      <div className="py-8 text-center text-xs text-slate-500">
        No ranking data recorded.
      </div>
    );
  }

  return (
    <div className="space-y-3.5">
      {displayItems.map((item, index) => {
        const percent = Math.min(100, Math.round((item.count / maxCount) * 100));

        return (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0 pr-2">
                <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-400 text-[10px] font-mono font-bold flex items-center justify-center shrink-0">
                  #{index + 1}
                </span>
                <span className="font-semibold text-slate-200 truncate">{item.label}</span>
                {item.subLabel && (
                  <span className="text-[11px] text-slate-500 hidden sm:inline truncate">
                    ({item.subLabel})
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {item.badge && (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-medium">
                    {item.badge}
                  </span>
                )}
                <span className="font-mono font-bold text-emerald-400">
                  {item.count.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface RatingDistributionProps {
  distribution: Array<{ rating: number; count: number }>;
  totalReviews: number;
  averageRating: number;
}

/**
 * 5-Star to 1-Star Rating Distribution Card
 */
export function RatingDistributionChart({
  distribution = [],
  totalReviews = 0,
  averageRating = 0,
}: RatingDistributionProps) {
  const getRatingCount = (star: number) => {
    const found = distribution.find((d) => Number(d.rating) === star);
    return found ? Number(found.count) : 0;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
      {/* Left Average Score Badge */}
      <div className="md:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-800/60 border border-slate-700/50 text-center">
        <span className="text-4xl sm:text-5xl font-black text-amber-400 tracking-tight">
          {averageRating.toFixed(1)}
        </span>
        <div className="flex items-center gap-1 my-2 text-amber-400">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`text-lg ${
                star <= Math.round(averageRating) ? "text-amber-400" : "text-slate-700"
              }`}
            >
              ★
            </span>
          ))}
        </div>
        <p className="text-xs text-slate-400 font-medium">
          Based on <span className="text-white font-bold">{totalReviews}</span> verified feedback
        </p>
      </div>

      {/* Right 5-Star Breakdown Progress */}
      <div className="md:col-span-8 space-y-2">
        {[5, 4, 3, 2, 1].map((stars) => {
          const count = getRatingCount(stars);
          const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;

          return (
            <div key={stars} className="flex items-center gap-3 text-xs">
              <div className="w-12 font-medium text-slate-300 flex items-center gap-1 shrink-0">
                <span>{stars}</span>
                <span className="text-amber-400">★</span>
              </div>

              <div className="flex-1 h-2.5 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    stars >= 4
                      ? "bg-amber-400"
                      : stars === 3
                      ? "bg-emerald-400"
                      : "bg-rose-400"
                  }`}
                  style={{ width: `${percent}%` }}
                />
              </div>

              <span className="w-14 text-right font-mono text-slate-400 shrink-0">
                {count} <span className="text-[10px] text-slate-600">({percent}%)</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

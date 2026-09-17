"use client";

import { useState } from "react";
import { Star } from "lucide-react";

interface StarRatingProps {
  value: number;
  onChange?: (val: number) => void;
  readOnly?: boolean;
  size?: "sm" | "md" | "lg";
}

export default function StarRating({
  value,
  onChange,
  readOnly = false,
  size = "md",
}: StarRatingProps) {
  const [hoverValue, setHoverValue] = useState<number | null>(null);

  const starSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-5 h-5",
    lg: "w-7 h-7",
  };

  const currentVal = hoverValue !== null ? hoverValue : value;

  return (
    <div className="inline-flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((starIndex) => {
        const isFilled = starIndex <= currentVal;

        return (
          <button
            key={starIndex}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange?.(starIndex)}
            onMouseEnter={() => !readOnly && setHoverValue(starIndex)}
            onMouseLeave={() => !readOnly && setHoverValue(null)}
            className={`transition-all duration-150 ${
              readOnly
                ? "cursor-default"
                : "cursor-pointer hover:scale-125 focus:outline-none"
            }`}
          >
            <Star
              className={`${starSizes[size]} transition-colors ${
                isFilled
                  ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                  : "text-slate-200 fill-transparent"
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

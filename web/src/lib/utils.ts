import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDistance(distanceKm: number | string | undefined | null): string {
  if (distanceKm === undefined || distanceKm === null) return "";
  const num = typeof distanceKm === "string" ? parseFloat(distanceKm) : distanceKm;
  if (isNaN(num)) return "";
  if (num < 1) {
    return `${Math.round(num * 1000)} m away`;
  }
  return `${num.toFixed(1)} km away`;
}

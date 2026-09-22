"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";
import type { ComponentProps } from "react";
import type MapboxMapType from "./MapboxMap";

// Dynamic import with ssr:false is only allowed inside Client Components
const MapboxMap = dynamic(() => import("@/components/MapboxMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center bg-slate-100 rounded-2xl text-slate-400 gap-2">
      <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      <span className="text-xs font-semibold">Loading map...</span>
    </div>
  ),
});

type Props = ComponentProps<typeof MapboxMapType>;

export default function MapboxMapClient(props: Props) {
  return <MapboxMap {...props} />;
}

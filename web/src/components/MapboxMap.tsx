"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Place } from "@/types/place";
import { formatDistance } from "@/lib/utils";
import { getGoogleMapsNavigationUrl } from "@/lib/api";

interface MapboxMapProps {
  places: Place[];
  userCoords?: { lat: number; lng: number } | null;
  selectedPlace?: Place | null;
  onSelectPlace?: (place: Place) => void;
  radiusKm?: number;
}

// Sri Lanka geographic center
const SRI_LANKA_CENTER: [number, number] = [80.7718, 7.8731]; // [lng, lat]

// Bulletproof OpenStreetMap Tile Style (Zero API token needed, 100% reliable)
const OPENSTREETMAP_STYLE: any = {
  version: 8,
  sources: {
    "osm-tiles": {
      type: "raster",
      tiles: [
        "https://a.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://b.tile.openstreetmap.org/{z}/{x}/{y}.png",
        "https://c.tile.openstreetmap.org/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "&copy; OpenStreetMap Contributors",
    },
  },
  layers: [
    {
      id: "osm-tiles-layer",
      type: "raster",
      source: "osm-tiles",
      minzoom: 0,
      maxzoom: 19,
    },
  ],
};

export default function MapboxMap({
  places,
  userCoords,
  selectedPlace,
  onSelectPlace,
  radiusKm,
}: MapboxMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const userMarkerRef = useRef<mapboxgl.Marker | null>(null);
  const markersRef = useRef<{ [id: string]: mapboxgl.Marker }>({});

  const [mapLoaded, setMapLoaded] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    try {
      const token = (process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "").trim();
      const hasRealToken = Boolean(
        token && 
        token.startsWith("pk.ey") && 
        !token.includes("demo") && 
        token.length > 50
      );

      if (hasRealToken) {
        mapboxgl.accessToken = token;
      }

      const map = new mapboxgl.Map({
        container: mapContainerRef.current,
        style: hasRealToken ? "mapbox://styles/mapbox/outdoors-v12" : OPENSTREETMAP_STYLE,
        center: userCoords ? [userCoords.lng, userCoords.lat] : SRI_LANKA_CENTER,
        zoom: userCoords ? 9 : 7.5,
        attributionControl: true,
      });

      map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");
      map.addControl(new mapboxgl.FullscreenControl(), "top-right");

      map.on("load", () => {
        setMapLoaded(true);
        map.resize();
      });

      map.on("error", (e) => {
        // If Mapbox token fails, gracefully switch to OSM style
        if (e && e.error && e.error.message && e.error.message.includes("401")) {
          console.warn("Mapbox token unauthorized, falling back to OpenStreetMap tiles.");
          map.setStyle(OPENSTREETMAP_STYLE);
        }
      });

      mapRef.current = map;
    } catch (err: any) {
      console.error("Failed to initialize Mapbox:", err);
      setInitError(err.message || "Failed to load map");
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update user pulsing marker
  useEffect(() => {
    if (!mapRef.current || !userCoords || !mapLoaded) return;

    try {
      if (!userMarkerRef.current) {
        const el = document.createElement("div");
        el.className = "user-location-pulse";
        el.title = "Your Current Location";

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([userCoords.lng, userCoords.lat])
          .addTo(mapRef.current);

        userMarkerRef.current = marker;
      } else {
        userMarkerRef.current.setLngLat([userCoords.lng, userCoords.lat]);
      }
    } catch (err) {
      console.warn("Error updating user marker:", err);
    }
  }, [userCoords, mapLoaded]);

  // Update destination markers
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;

    // Remove existing markers
    Object.values(markersRef.current).forEach((m) => m.remove());
    markersRef.current = {};

    places.forEach((place) => {
      try {
        const el = document.createElement("div");
        el.className = "cursor-pointer group hover:scale-110 active:scale-95 transition-transform";
        el.innerHTML = `
          <div style="background:#059669;color:white;width:32px;height:32px;border-radius:9999px;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 4px 6px -1px rgba(0,0,0,0.2);">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
          </div>
        `;

        const navUrl = getGoogleMapsNavigationUrl(
          place.latitude,
          place.longitude,
          userCoords?.lat,
          userCoords?.lng
        );

        const distanceBadge =
          place.distance_km !== undefined
            ? `<div style="background:#10b981;color:white;font-size:11px;font-weight:700;padding:2px 8px;border-radius:9999px;display:inline-flex;align-items:center;gap:4px;margin-bottom:6px;">
                 📍 ${formatDistance(place.distance_km)}
               </div>`
            : "";

        const popupHtml = `
          <div style="width:230px;font-family:inherit;overflow:hidden;border-radius:12px;">
            <div style="height:115px;position:relative;overflow:hidden;">
              <img src="${place.cover_image}" alt="${place.title}" style="width:100%;height:100%;object-fit:cover;"/>
              <span style="position:absolute;top:6px;left:6px;background:rgba(255,255,255,0.92);padding:2px 8px;border-radius:9999px;font-size:10px;font-weight:700;color:#0f172a;">
                ${place.category}
              </span>
            </div>
            <div style="padding:12px;background:white;">
              ${distanceBadge}
              <h4 style="font-weight:700;font-size:13px;color:#0f172a;margin:0 0 4px 0;line-height:1.2;">
                ${place.title}
              </h4>
              <p style="font-size:11px;color:#64748b;margin:0 0 10px 0;">
                ${place.district}, ${place.province}
              </p>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;">
                <a href="/places/${place.slug}" style="display:flex;align-items:center;justify-content:center;gap:4px;background:#f1f5f9;color:#334155;text-decoration:none;font-size:11px;font-weight:600;padding:6px 8px;border-radius:8px;">
                  Details &rarr;
                </a>
                <a href="${navUrl}" target="_blank" rel="noopener noreferrer" style="display:flex;align-items:center;justify-content:center;gap:4px;background:#ecfdf5;color:#059669;border:1px solid #a7f3d0;text-decoration:none;font-size:11px;font-weight:600;padding:6px 8px;border-radius:8px;">
                  Navigate
                </a>
              </div>
            </div>
          </div>
        `;

        const popup = new mapboxgl.Popup({ offset: 25, maxWidth: "250px" }).setHTML(popupHtml);

        el.addEventListener("click", () => {
          if (onSelectPlace) onSelectPlace(place);
        });

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([place.longitude, place.latitude])
          .setPopup(popup)
          .addTo(mapRef.current!);

        markersRef.current[place.id] = marker;
      } catch (e) {
        console.warn("Marker creation failed:", e);
      }
    });
  }, [places, userCoords, mapLoaded]);

  // Fly to selected place
  useEffect(() => {
    if (!mapRef.current || !selectedPlace || !mapLoaded) return;

    try {
      mapRef.current.flyTo({
        center: [selectedPlace.longitude, selectedPlace.latitude],
        zoom: 13,
        speed: 1.2,
        curve: 1.4,
        essential: true,
      });

      const marker = markersRef.current[selectedPlace.id];
      if (marker) {
        marker.togglePopup();
      }
    } catch (e) {
      console.warn("FlyTo error:", e);
    }
  }, [selectedPlace, mapLoaded]);

  if (initError) {
    return (
      <div className="w-full h-full min-h-[500px] rounded-3xl bg-slate-100 flex flex-col items-center justify-center p-6 text-center">
        <p className="text-sm font-bold text-slate-700">Map Display Notice</p>
        <p className="text-xs text-slate-500 mt-1">{initError}</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden shadow-lg border border-slate-200">
      <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10 glass-card px-3.5 py-2.5 rounded-2xl text-xs text-slate-700 shadow-md flex items-center gap-4">
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-3 h-3 rounded-full bg-blue-600 border-2 border-white shadow-sm inline-block" />
          <span>Your Location</span>
        </div>
        <div className="flex items-center gap-1.5 font-medium">
          <span className="w-3 h-3 rounded-full bg-emerald-600 border-2 border-white shadow-sm inline-block" />
          <span>Destinations ({places.length})</span>
        </div>
      </div>
    </div>
  );
}

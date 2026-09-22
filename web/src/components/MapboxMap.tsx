"use client";

import { useEffect, useRef, useState } from "react";
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

// Sri Lanka geographic center [lat, lng]
const SRI_LANKA_CENTER: [number, number] = [7.8731, 80.7718];
const LEAFLET_VERSION = "1.9.4";

function loadScript(src: string, id: string): Promise<void> {
  return new Promise((resolve) => {
    if (document.getElementById(id)) { resolve(); return; }
    const s = document.createElement("script");
    s.id = id;
    s.src = src;
    s.onload = () => resolve();
    document.head.appendChild(s);
  });
}

function loadCSS(href: string, id: string) {
  if (document.getElementById(id)) return;
  const link = document.createElement("link");
  link.id = id;
  link.rel = "stylesheet";
  link.href = href;
  document.head.appendChild(link);
}

export default function MapboxMap({
  places,
  userCoords,
  selectedPlace,
  onSelectPlace,
}: MapboxMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const userMarkerRef = useRef<any>(null);
  const markersRef = useRef<{ [id: string]: any }>({});
  const [mapReady, setMapReady] = useState(false);

  // Bootstrap Leaflet from CDN and initialize map
  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    const base = `https://unpkg.com/leaflet@${LEAFLET_VERSION}/dist`;
    loadCSS(`${base}/leaflet.css`, "leaflet-css");

    loadScript(`${base}/leaflet.js`, "leaflet-js").then(() => {
      const L = (window as any).L;
      if (!L || !mapContainerRef.current) return;

      const center: [number, number] = userCoords
        ? [userCoords.lat, userCoords.lng]
        : SRI_LANKA_CENTER;

      const map = L.map(mapContainerRef.current, {
        center,
        zoom: userCoords ? 10 : 8,
        zoomControl: false,
      });

      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      L.control.zoom({ position: "topright" }).addTo(map);

      mapRef.current = map;
      setMapReady(true);
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        userMarkerRef.current = null;
        markersRef.current = {};
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // User location marker
  useEffect(() => {
    if (!mapReady || !mapRef.current || !userCoords) return;
    const L = (window as any).L;
    if (!L) return;

    const pulseIcon = L.divIcon({
      className: "",
      html: `<div class="lf-user-dot"></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10],
    });

    if (userMarkerRef.current) {
      userMarkerRef.current.setLatLng([userCoords.lat, userCoords.lng]);
    } else {
      userMarkerRef.current = L.marker([userCoords.lat, userCoords.lng], {
        icon: pulseIcon,
        title: "Your Location",
        zIndexOffset: 9999,
      }).addTo(mapRef.current);
    }
  }, [userCoords, mapReady]);

  // Destination markers
  useEffect(() => {
    if (!mapReady || !mapRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    Object.values(markersRef.current).forEach((m: any) => m.remove());
    markersRef.current = {};

    places.forEach((place) => {
      const pinIcon = L.divIcon({
        className: "",
        html: `<div class="lf-pin">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
        </div>`,
        iconSize: [34, 34],
        iconAnchor: [17, 17],
        popupAnchor: [0, -20],
      });

      const navUrl = getGoogleMapsNavigationUrl(
        place.latitude,
        place.longitude,
        userCoords?.lat,
        userCoords?.lng
      );

      const distanceBadge =
        place.distance_km !== undefined
          ? `<div class="lf-dist-badge">📍 ${formatDistance(place.distance_km)}</div>`
          : "";

      const popupContent = `
        <div class="lf-popup-inner">
          <div class="lf-popup-img">
            <img src="${place.cover_image}" alt="${place.title}" />
            <span class="lf-popup-cat">${place.category}</span>
          </div>
          <div class="lf-popup-body">
            ${distanceBadge}
            <h4>${place.title}</h4>
            <p>${place.district}, ${place.province}</p>
            <div class="lf-popup-actions">
              <a href="/places/${place.slug}" class="lf-btn-detail">Details →</a>
              <a href="${navUrl}" target="_blank" rel="noopener noreferrer" class="lf-btn-nav">Navigate</a>
            </div>
          </div>
        </div>`;

      const marker = L.marker([place.latitude, place.longitude], { icon: pinIcon })
        .addTo(mapRef.current)
        .bindPopup(popupContent, { maxWidth: 240, className: "lf-popup" });

      marker.on("click", () => {
        if (onSelectPlace) onSelectPlace(place);
      });

      markersRef.current[place.id] = marker;
    });
  }, [places, userCoords, mapReady]);

  // Fly to selected place
  useEffect(() => {
    if (!mapReady || !mapRef.current || !selectedPlace) return;
    mapRef.current.flyTo([selectedPlace.latitude, selectedPlace.longitude], 13, {
      animate: true,
      duration: 1.2,
    });
    setTimeout(() => {
      const m = markersRef.current[selectedPlace.id];
      if (m) m.openPopup();
    }, 1350);
  }, [selectedPlace, mapReady]);

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-3xl overflow-hidden shadow-lg border border-slate-200">
      <style>{`
        /* User location pulse dot */
        .lf-user-dot {
          width:18px; height:18px; border-radius:50%;
          background:#2563eb; border:3px solid white;
          box-shadow:0 0 0 4px rgba(37,99,235,0.25);
          animation:lf-pulse 1.8s ease-out infinite;
        }
        @keyframes lf-pulse {
          0%   { box-shadow:0 0 0 0 rgba(37,99,235,0.5); }
          70%  { box-shadow:0 0 0 14px rgba(37,99,235,0); }
          100% { box-shadow:0 0 0 0 rgba(37,99,235,0); }
        }
        /* Destination pin */
        .lf-pin {
          width:34px; height:34px; border-radius:50%;
          background:#059669; color:white;
          display:flex; align-items:center; justify-content:center;
          border:2.5px solid white;
          box-shadow:0 4px 12px rgba(0,0,0,0.25);
          cursor:pointer; transition:transform 0.15s;
        }
        .lf-pin:hover { transform:scale(1.18); }
        /* Popup */
        .lf-popup .leaflet-popup-content-wrapper {
          padding:0; border-radius:14px; overflow:hidden;
          box-shadow:0 8px 30px rgba(0,0,0,0.18);
        }
        .lf-popup .leaflet-popup-content { margin:0; }
        .lf-popup .leaflet-popup-tip { display:none; }
        .lf-popup .leaflet-popup-close-button {
          color:#fff !important; top:6px !important; right:8px !important;
          font-size:18px !important; z-index:10;
        }
        .lf-popup-inner { width:224px; font-family:system-ui,sans-serif; }
        .lf-popup-img { height:110px; position:relative; overflow:hidden; }
        .lf-popup-img img { width:100%; height:100%; object-fit:cover; display:block; }
        .lf-popup-cat {
          position:absolute; top:6px; left:6px;
          background:rgba(255,255,255,0.92); padding:2px 8px;
          border-radius:999px; font-size:10px; font-weight:700; color:#0f172a;
        }
        .lf-popup-body { padding:10px 12px 12px; background:#fff; }
        .lf-dist-badge {
          background:#10b981; color:#fff; font-size:11px; font-weight:700;
          padding:2px 10px; border-radius:999px; display:inline-block; margin-bottom:6px;
        }
        .lf-popup-body h4 {
          font-weight:700; font-size:13px; color:#0f172a;
          margin:0 0 3px; line-height:1.3;
        }
        .lf-popup-body p {
          font-size:11px; color:#64748b; margin:0 0 10px;
        }
        .lf-popup-actions { display:grid; grid-template-columns:1fr 1fr; gap:6px; }
        .lf-btn-detail {
          display:flex; align-items:center; justify-content:center;
          background:#f1f5f9; color:#334155; text-decoration:none;
          font-size:11px; font-weight:600; padding:6px 8px; border-radius:8px;
        }
        .lf-btn-nav {
          display:flex; align-items:center; justify-content:center;
          background:#ecfdf5; color:#059669; border:1px solid #a7f3d0;
          text-decoration:none; font-size:11px; font-weight:600;
          padding:6px 8px; border-radius:8px;
        }
        .lf-btn-detail:hover { background:#e2e8f0; }
        .lf-btn-nav:hover { background:#d1fae5; }
      `}</style>

      <div ref={mapContainerRef} className="w-full h-full min-h-[500px]" />

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-[1000] glass-card px-3.5 py-2.5 rounded-2xl text-xs text-slate-700 shadow-md flex items-center gap-4">
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

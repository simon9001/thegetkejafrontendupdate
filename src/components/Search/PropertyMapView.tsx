// components/Search/PropertyMapView.tsx
// Live map — Uber-style animated dot markers with price pills.
import React, { useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, MapPin, BedDouble, Bath, X } from 'lucide-react';
import { useLazySearchInBoundsQuery, type Property } from '../../features/Api/PropertiesApi';

// ─── Inject pulse keyframe once into <head> ───────────────────────────────────
const STYLE_ID = 'gk-map-pulse';
if (!document.getElementById(STYLE_ID)) {
  const s = document.createElement('style');
  s.id = STYLE_ID;
  s.textContent = `
    @keyframes gk-pulse {
      0%   { transform: scale(1);   opacity: 0.55; }
      100% { transform: scale(2.8); opacity: 0; }
    }
    @keyframes gk-pulse-fast {
      0%   { transform: scale(1);   opacity: 0.7; }
      100% { transform: scale(2.2); opacity: 0; }
    }
  `;
  document.head.appendChild(s);
}

// ─── Price formatter ──────────────────────────────────────────────────────────
function formatPrice(p: Property): string {
  const pricing = (p as any).property_pricing?.[0] ?? p.pricing;
  const rent    = pricing?.monthly_rent ?? p.price_per_month;
  const ask     = pricing?.asking_price ?? p.price;
  const night   = (p as any).short_term_config?.[0]?.price_per_night ?? p.price_per_night;
  const amount  = rent ?? ask ?? night ?? 0;
  if (!amount) return 'Ask';
  const num = Number(amount);
  // Compact format: 25000 → 25k, 1200000 → 1.2M
  const compact =
    num >= 1_000_000 ? `${(num / 1_000_000).toFixed(1)}M` :
    num >= 1_000     ? `${Math.round(num / 1_000)}k`      :
    String(num);
  return `KES ${compact}`;
}

// ─── Dot marker factory ───────────────────────────────────────────────────────
// Creates an Uber-style animated dot with a price pill on top.
function makeDotIcon(price: string, selected: boolean, featured: boolean) {
  const bg      = selected  ? '#50757A'  : featured ? '#C0D6DF' : '#DD6E42';
  const textCol = selected  ? '#ffffff'  : '#50757A';
  const pillBg  = selected  ? '#50757A'  : '#ffffff';
  const shadow  = selected
    ? '0 4px 16px rgba(0,0,0,0.45)'
    : '0 2px 10px rgba(0,0,0,0.22)';
  const scale   = selected ? 'scale(1.15)' : 'scale(1)';

  return L.divIcon({
    className: '',
    // anchor at the bottom-centre of the dot
    iconAnchor: [0, 0],
    popupAnchor: [60, -10],
    html: `
      <div style="
        display:inline-flex;
        flex-direction:column;
        align-items:center;
        transform:${scale};
        transition:transform 0.18s cubic-bezier(.34,1.56,.64,1);
        cursor:pointer;
      ">
        <!-- Price pill -->
        <div style="
          background:${pillBg};
          color:${textCol};
          font-size:11px;
          font-weight:800;
          font-family:sans-serif;
          letter-spacing:-0.2px;
          white-space:nowrap;
          padding:4px 9px;
          border-radius:20px;
          box-shadow:${shadow};
          border:2px solid ${bg};
          margin-bottom:3px;
          user-select:none;
        ">${price}</div>

        <!-- Dot with pulse ring -->
        <div style="position:relative; width:14px; height:14px; display:flex; align-items:center; justify-content:center;">
          <!-- Outer pulse ring -->
          <div style="
            position:absolute;
            inset:0;
            border-radius:50%;
            background:${bg};
            animation:${selected ? 'gk-pulse-fast' : 'gk-pulse'} 1.8s ease-out infinite;
          "></div>
          <!-- Inner solid dot -->
          <div style="
            position:relative;
            width:10px; height:10px;
            border-radius:50%;
            background:${bg};
            border:2px solid white;
            box-shadow:0 1px 5px rgba(0,0,0,0.3);
          "></div>
        </div>
      </div>
    `,
  });
}

// ─── Bounds watcher ───────────────────────────────────────────────────────────
const BoundsWatcher: React.FC<{
  onBoundsChange: (b: { north: number; south: number; east: number; west: number }) => void;
}> = ({ onBoundsChange }) => {
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);
  const map = useMapEvents({
    moveend: () => fire(),
    zoomend: () => fire(),
  });
  function fire() {
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(() => {
      const b = map.getBounds();
      onBoundsChange({ north: b.getNorth(), south: b.getSouth(), east: b.getEast(), west: b.getWest() });
    }, 400);
  }
  return null;
};

// ─── Property popup card ──────────────────────────────────────────────────────
const PropertyPopup: React.FC<{ property: Property; onClose: () => void }> = ({ property: p, onClose }) => {
  const navigate = useNavigate();
  const loc = (p as any).property_locations?.[0] ?? p.location;
  const locationText = [loc?.estate_name, loc?.area, loc?.county].filter(Boolean).join(', ');
  const cover =
    ((p as any).property_media ?? p.media ?? []).find((m: any) => m.is_cover)?.url ??
    ((p as any).property_media ?? p.media ?? [])[0]?.url;

  return (
    <div className="w-56 font-sans">
      {/* Image */}
      {cover && (
        <div className="relative -mx-px -mt-px h-28 overflow-hidden rounded-t-xl">
          <img src={cover} alt={p.title} className="w-full h-full object-cover" />
          <button
            onClick={onClose}
            className="absolute top-1.5 right-1.5 bg-white/90 rounded-full p-0.5 shadow"
          >
            <X className="w-3 h-3 text-gray-600" />
          </button>
        </div>
      )}
      <div className="p-3">
        <p className="text-xs font-bold text-[#222] line-clamp-2 mb-1">{p.title}</p>
        {locationText && (
          <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-1.5">
            <MapPin className="w-2.5 h-2.5 shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>
        )}
        <div className="flex items-center gap-2.5 text-[10px] text-gray-500 mb-2">
          {(p.bedrooms ?? 0) > 0 && (
            <span className="flex items-center gap-0.5"><BedDouble className="w-2.5 h-2.5" />{p.bedrooms} bd</span>
          )}
          {(p.bathrooms ?? 0) > 0 && (
            <span className="flex items-center gap-0.5"><Bath className="w-2.5 h-2.5" />{p.bathrooms} ba</span>
          )}
          {p.listing_category && (
            <span className="capitalize text-[#DD6E42] font-semibold">
              {p.listing_category.replace(/_/g, ' ')}
            </span>
          )}
        </div>
        <p className="text-[#DD6E42] font-black text-sm mb-2.5">{formatPrice(p)}</p>
        <button
          onClick={() => navigate(`/property/${p.id}`)}
          className="w-full py-1.5 bg-[#DD6E42] text-white text-xs font-bold rounded-lg hover:bg-[#DD6E42] transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
interface PropertyMapViewProps {
  initialCenter?: [number, number];
  initialZoom?: number;
  listing_category?: string;
  q?: string;
  className?: string;
}

const PropertyMapView: React.FC<PropertyMapViewProps> = ({
  initialCenter = [-1.2921, 36.8219],
  initialZoom   = 12,
  listing_category,
  q,
  className = '',
}) => {
  const [triggerSearch, { data, isFetching }] = useLazySearchInBoundsQuery();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleBoundsChange = useCallback(
    (bounds: { north: number; south: number; east: number; west: number }) => {
      triggerSearch({ ...bounds, listing_category, q });
    },
    [triggerSearch, listing_category, q],
  );

  const properties = data?.properties ?? [];

  return (
    <div className={`relative w-full ${className}`}>
      {/* Loading pill */}
      {isFetching && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-full px-4 py-2 shadow-lg flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Loader2 className="w-4 h-4 animate-spin text-[#DD6E42]" />
          Loading…
        </div>
      )}

      {/* Count badge */}
      {!isFetching && properties.length > 0 && (
        <div className="absolute top-3 left-3 z-[1000] bg-white rounded-full px-3 py-1.5 shadow-md text-xs font-bold text-gray-700">
          {properties.length} {properties.length === 1 ? 'property' : 'properties'} here
        </div>
      )}

      {/* Dismiss card on map click */}
      {selectedId && (
        <button
          className="absolute inset-0 z-[400]"
          aria-label="Dismiss"
          onClick={() => setSelectedId(null)}
          style={{ background: 'transparent', border: 'none', cursor: 'default' }}
        />
      )}

      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ width: '100%', height: '100%' }}
        className="rounded-2xl"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BoundsWatcher onBoundsChange={handleBoundsChange} />

        {properties.map((prop) => {
          const loc = (prop as any).property_locations?.[0] ?? prop.location;
          const lat = loc?.latitude  ?? (prop.location as any)?.latitude;
          const lng = loc?.longitude ?? (prop.location as any)?.longitude;
          if (!lat || !lng) return null;

          const isSelected = selectedId === prop.id;
          const price = formatPrice(prop);

          return (
            <Marker
              key={`${prop.id}-${isSelected}`}
              position={[Number(lat), Number(lng)]}
              icon={makeDotIcon(price, isSelected, !!prop.is_featured)}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation();
                  setSelectedId(isSelected ? null : prop.id);
                },
              }}
            >
              {isSelected && (
                <Popup closeButton={false} maxWidth={230} className="gk-popup">
                  <PropertyPopup property={prop} onClose={() => setSelectedId(null)} />
                </Popup>
              )}
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default PropertyMapView;

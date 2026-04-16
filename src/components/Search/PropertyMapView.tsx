// components/Search/PropertyMapView.tsx
// Live map that shows property markers in the visible area.
// Uses react-leaflet + OpenStreetMap tiles (no API key required).
// Refetches when the map is moved/zoomed — shows markers for properties in view.
import React, { useState, useCallback, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import { useNavigate } from 'react-router-dom';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Loader2, MapPin, BedDouble, Bath, X } from 'lucide-react';
import { useLazySearchInBoundsQuery, type Property } from '../../features/Api/PropertiesApi';

// Fix leaflet default icon URLs (Vite asset handling)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom red marker for GETKEJA brand
function makeIcon(color: string) {
  return L.divIcon({
    className: '',
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
    html: `<div style="
      width:28px;height:28px;border-radius:50% 50% 50% 0;
      background:${color};border:2px solid white;
      transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.35);
    "></div>`,
  });
}
const defaultIcon  = makeIcon('#ff385c');
const featuredIcon = makeIcon('#222222');

// ─── Price formatter ──────────────────────────────────────────────────────────
function formatPrice(p: Property): string {
  const pricing = (p as any).property_pricing?.[0] ?? p.pricing;
  const rent    = pricing?.monthly_rent ?? p.price_per_month;
  const ask     = pricing?.asking_price ?? p.price;
  const night   = (p as any).short_term_config?.[0]?.price_per_night ?? p.price_per_night;
  const amount  = rent ?? ask ?? night ?? 0;
  if (!amount) return 'Price on request';
  const cur = pricing?.currency ?? 'KES';
  return `${cur} ${Number(amount).toLocaleString()}`;
}

// ─── Bounds watcher — triggers search when map moves ─────────────────────────
interface BoundsWatcherProps {
  onBoundsChange: (bounds: { north: number; south: number; east: number; west: number }) => void;
}
const BoundsWatcher: React.FC<BoundsWatcherProps> = ({ onBoundsChange }) => {
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const map = useMapEvents({
    moveend: () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const b = map.getBounds();
        onBoundsChange({
          north: b.getNorth(), south: b.getSouth(),
          east:  b.getEast(),  west:  b.getWest(),
        });
      }, 500);
    },
    zoomend: () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        const b = map.getBounds();
        onBoundsChange({
          north: b.getNorth(), south: b.getSouth(),
          east:  b.getEast(),  west:  b.getWest(),
        });
      }, 500);
    },
  });
  return null;
};

// ─── Property popup card ──────────────────────────────────────────────────────
const PropertyPopup: React.FC<{ property: Property; onClose?: () => void }> = ({ property: p, onClose }) => {
  const navigate = useNavigate();
  const loc = (p as any).property_locations?.[0] ?? p.location;
  const locationText = [loc?.estate_name, loc?.area, loc?.sub_county, loc?.county].filter(Boolean).join(', ');
  const cover =
    ((p as any).property_media ?? p.media ?? []).find((m: any) => m.is_cover)?.url ??
    ((p as any).property_media ?? p.media ?? [])[0]?.url;

  return (
    <div className="w-60">
      {cover && (
        <div className="relative -mx-[1px] -mt-[1px] h-32 overflow-hidden rounded-t-lg">
          <img src={cover} alt={p.title} className="w-full h-full object-cover"/>
          {onClose && (
            <button onClick={onClose} className="absolute top-1.5 right-1.5 bg-white rounded-full p-0.5 shadow-sm">
              <X className="w-3 h-3 text-gray-600"/>
            </button>
          )}
        </div>
      )}
      <div className="p-3">
        <p className="text-xs font-bold text-[#222] line-clamp-2 mb-1">{p.title}</p>
        {locationText && (
          <div className="flex items-center gap-1 text-[10px] text-gray-400 mb-1.5">
            <MapPin className="w-2.5 h-2.5 shrink-0"/>
            <span className="truncate">{locationText}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-[10px] text-gray-500 mb-2">
          {p.bedrooms != null && p.bedrooms > 0 && (
            <span className="flex items-center gap-0.5"><BedDouble className="w-2.5 h-2.5"/>{p.bedrooms} bd</span>
          )}
          {p.bathrooms != null && p.bathrooms > 0 && (
            <span className="flex items-center gap-0.5"><Bath className="w-2.5 h-2.5"/>{p.bathrooms} ba</span>
          )}
          {p.listing_category && (
            <span className="capitalize text-[#ff385c] font-medium">{p.listing_category.replace(/_/g,' ')}</span>
          )}
        </div>
        <p className="text-[#ff385c] font-bold text-xs mb-2">{formatPrice(p)}</p>
        <button
          onClick={() => navigate(`/properties/${p.id}`)}
          className="w-full py-1.5 bg-[#ff385c] text-white text-xs font-semibold rounded-lg hover:bg-[#e0334f] transition-colors"
        >
          View Details
        </button>
      </div>
    </div>
  );
};

// ─── Main map component ───────────────────────────────────────────────────────
interface PropertyMapViewProps {
  /** Initial centre. Defaults to Nairobi CBD */
  initialCenter?: [number, number];
  /** Initial zoom level. 12 = ~city level, 10 = county level */
  initialZoom?: number;
  /** Optional pre-applied filters */
  listing_category?: string;
  q?: string;
  className?: string;
}

const PropertyMapView: React.FC<PropertyMapViewProps> = ({
  initialCenter = [-1.2921, 36.8219], // Nairobi CBD
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
      {/* Loading overlay */}
      {isFetching && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] bg-white rounded-full px-4 py-2 shadow-md flex items-center gap-2 text-sm font-medium text-gray-700">
          <Loader2 className="w-4 h-4 animate-spin text-[#ff385c]"/>
          Loading properties…
        </div>
      )}

      {/* Property count badge */}
      {!isFetching && properties.length > 0 && (
        <div className="absolute top-3 left-3 z-[1000] bg-white rounded-full px-3 py-1.5 shadow-md text-xs font-semibold text-gray-700">
          {properties.length} {properties.length === 1 ? 'property' : 'properties'} in view
        </div>
      )}

      <MapContainer
        center={initialCenter}
        zoom={initialZoom}
        style={{ width: '100%', height: '100%' }}
        className="rounded-2xl"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <BoundsWatcher onBoundsChange={handleBoundsChange} />

        {properties.map((prop) => {
          const loc = (prop as any).property_locations?.[0] ?? prop.location;
          const lat = loc?.latitude  ?? (prop.location as any)?.latitude;
          const lng = loc?.longitude ?? (prop.location as any)?.longitude;
          if (!lat || !lng) return null;
          return (
            <Marker
              key={prop.id}
              position={[Number(lat), Number(lng)]}
              icon={prop.is_featured ? featuredIcon : defaultIcon}
              eventHandlers={{ click: () => setSelectedId(prev => prev === prop.id ? null : prop.id) }}
            >
              {selectedId === prop.id && (
                <Popup
                  closeButton={false}
                  maxWidth={250}
                >
                  <PropertyPopup property={prop} onClose={() => setSelectedId(null)}/>
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

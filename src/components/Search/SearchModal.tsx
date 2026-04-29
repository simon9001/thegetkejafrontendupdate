import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, X, LocateFixed, Loader2, MapPin, Building2,
  SlidersHorizontal, Home,
} from 'lucide-react';
import { useSearchPropertiesQuery, useSearchNearbyQuery } from '../../features/Api/PropertiesApi';

// ── Types ─────────────────────────────────────────────────────────────────────
interface SearchModalProps {
  isOpen:    boolean;
  onClose:   () => void;
  onSearch?: (params: {
    lat:           number;
    lng:           number;
    radius:        number;
    maxPrice?:     number;
    minBedrooms?:  number;
    q?:            string;
  }) => void;
}

// ── Helpers ───────────────────────────────────────────────────────────────────
const EXAMPLES = [
  'Bedsitter in Roysambu below 8k',
  '3 bedroom house in Ruiru with parking',
  'Studio apartment near JKUAT',
  'Plot for sale in Kitengela',
  'Airbnb near Two Rivers Mall',
  'Office space in Westlands',
];

const CATEGORIES = [
  { value: '',               label: 'All Types' },
  { value: 'long_term_rent', label: 'Long-Term Rent' },
  { value: 'for_sale',       label: 'For Sale' },
  { value: 'short_term_rent',label: 'Short-Term / Airbnb' },
  { value: 'commercial',     label: 'Commercial' },
];

const BEDROOMS = ['Any', '1', '2', '3', '4', '5+'];

// Derive a cover image url from a property row
function coverUrl(property: any): string | null {
  const media: any[] = property.property_media ?? [];
  const cover = media.find((m: any) => m.is_cover) ?? media[0];
  return cover?.url ?? cover?.thumbnail_url ?? null;
}

// Format price from property_pricing
function displayPrice(property: any): string {
  const p = Array.isArray(property.property_pricing)
    ? property.property_pricing[0]
    : property.property_pricing;
  if (!p) return '';
  const currency = p.currency ?? 'KES';
  if (p.monthly_rent) return `${currency} ${Number(p.monthly_rent).toLocaleString()}/mo`;
  if (p.asking_price) return `${currency} ${Number(p.asking_price).toLocaleString()}`;
  return '';
}

function locationLabel(property: any): string {
  const l = Array.isArray(property.property_locations)
    ? property.property_locations[0]
    : property.property_locations;
  return [l?.area, l?.county].filter(Boolean).join(', ') || l?.county || '';
}

// ── Component ─────────────────────────────────────────────────────────────────
const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSearch }) => {
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const [q,        setQ]        = useState('');
  const [category, setCategory] = useState('');
  const [bedrooms, setBedrooms] = useState('Any');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [geoState, setGeoState] = useState<
    { status: 'idle' | 'loading' | 'done' | 'error'; lat?: number; lng?: number; error?: string }
  >({ status: 'idle' });

  // Debounced query — only run the API after 400ms of no typing
  const [debouncedQ, setDebouncedQ] = useState('');
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQ(q), 400);
    return () => clearTimeout(id);
  }, [q]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    } else {
      // Reset on close
      setQ(''); setDebouncedQ(''); setCategory(''); setBedrooms('Any');
      setMinPrice(''); setMaxPrice(''); setShowFilters(false);
      setGeoState({ status: 'idle' });
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  // ── Build search params ────────────────────────────────────────────────────
  const hasQuery     = debouncedQ.trim().length > 0 || category || bedrooms !== 'Any' || minPrice || maxPrice;
  const bedroomsNum  = bedrooms === 'Any' ? undefined : bedrooms === '5+' ? 5 : Number(bedrooms);

  const textParams = hasQuery ? {
    q:                debouncedQ.trim() || undefined,
    listing_category: category || undefined,
    bedrooms:         bedroomsNum,
    min_price:        minPrice  ? Number(minPrice)  : undefined,
    max_price:        maxPrice  ? Number(maxPrice)  : undefined,
    limit:            8,
  } : undefined;

  const nearbyParams = geoState.status === 'done' && geoState.lat !== undefined ? {
    lat:              geoState.lat!,
    lng:              geoState.lng!,
    radius_km:        5,
    listing_category: category || undefined,
    limit:            8,
  } : undefined;

  const { data: textResults, isFetching: textFetching } = useSearchPropertiesQuery(
    textParams ?? {},
    { skip: !hasQuery },
  );

  const { data: nearbyResults, isFetching: nearbyFetching } = useSearchNearbyQuery(
    nearbyParams!,
    { skip: !nearbyParams },
  );

  const results    = geoState.status === 'done' ? nearbyResults : textResults;
  const isFetching = geoState.status === 'done' ? nearbyFetching : textFetching;
  const properties = results?.properties ?? [];

  // ── Geolocation ────────────────────────────────────────────────────────────
  const handleGeo = () => {
    if (!navigator.geolocation) {
      setGeoState({ status: 'error', error: 'Geolocation not supported' });
      return;
    }
    setGeoState({ status: 'loading' });
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setGeoState({ status: 'done', lat: coords.latitude, lng: coords.longitude });
        if (onSearch) {
          onSearch({
            lat:          coords.latitude,
            lng:          coords.longitude,
            radius:       5,
            maxPrice:     maxPrice  ? Number(maxPrice)  : undefined,
            minBedrooms:  bedroomsNum,
            q:            q.trim() || undefined,
          });
        }
      },
      () => setGeoState({ status: 'error', error: 'Location access denied' }),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 },
    );
  };

  const clearGeo = () => setGeoState({ status: 'idle' });

  // ── Navigate to property detail ────────────────────────────────────────────
  const goToProperty = (id: string, category: string) => {
    onClose();
    if (category === 'commercial') navigate(`/commercial/${id}`);
    else navigate(`/property/${id}`);
  };

  // ── Full-page search ───────────────────────────────────────────────────────
  const handleFullSearch = () => {
    const params = new URLSearchParams();
    if (q.trim())   params.set('q', q.trim());
    if (category)   params.set('listing_category', category);
    if (bedroomsNum !== undefined) params.set('bedrooms', String(bedroomsNum));
    if (minPrice)   params.set('min_price', minPrice);
    if (maxPrice)   params.set('max_price', maxPrice);
    onClose();
    navigate(`/properties?${params.toString()}`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal panel */}
      <div className="relative z-10 w-full max-w-2xl mx-auto mt-16 mx-4 flex flex-col"
           style={{ maxHeight: 'calc(100vh - 80px)' }}>
        <div className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">

          {/* ── Search bar ──────────────────────────────────────────────────── */}
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="flex-1 flex items-center gap-3 px-4 py-3 bg-[#EAEAEA] rounded-xl border border-[#EAEAEA] focus-within:border-[#DD6E42] focus-within:ring-2 focus-within:ring-[#DD6E42]/20 transition">
                <Search className="w-4 h-4 text-[#50757A] shrink-0" />
                <input
                  ref={inputRef}
                  value={q}
                  onChange={e => { setQ(e.target.value); clearGeo(); }}
                  onKeyDown={e => e.key === 'Enter' && handleFullSearch()}
                  placeholder="Search by area, type, or description…"
                  className="flex-1 bg-transparent text-sm text-[#50757A] placeholder:text-[#EAEAEA] outline-none"
                />
                {q && (
                  <button onClick={() => { setQ(''); setDebouncedQ(''); }} className="text-[#50757A] hover:text-[#3D5A5E]">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Geo button */}
              <button
                onClick={geoState.status === 'done' ? clearGeo : handleGeo}
                disabled={geoState.status === 'loading'}
                title={geoState.status === 'done' ? 'Clear location' : 'Search near me'}
                className={`p-3 rounded-xl border transition shrink-0 ${
                  geoState.status === 'done'
                    ? 'bg-[#DD6E42] text-white border-[#DD6E42]'
                    : 'bg-white text-[#50757A] border-[#EAEAEA] hover:border-[#DD6E42] hover:text-[#DD6E42]'
                }`}
              >
                {geoState.status === 'loading'
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <LocateFixed className="w-4 h-4" />}
              </button>

              {/* Filters toggle */}
              <button
                onClick={() => setShowFilters(p => !p)}
                className={`p-3 rounded-xl border transition shrink-0 ${
                  showFilters
                    ? 'bg-[#50757A] text-white border-[#50757A]'
                    : 'bg-white text-[#50757A] border-[#EAEAEA] hover:border-[#50757A]'
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
              </button>

              {/* Close */}
              <button onClick={onClose} className="p-3 rounded-xl border border-[#EAEAEA] text-[#50757A] hover:bg-[#EAEAEA] transition shrink-0">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Geo status */}
            {geoState.status === 'done' && (
              <div className="mt-2 flex items-center gap-2 text-xs text-[#DD6E42] font-medium">
                <MapPin className="w-3 h-3" />
                Showing properties within 5 km of your location
              </div>
            )}
            {geoState.status === 'error' && (
              <p className="mt-2 text-xs text-red-500">{geoState.error}</p>
            )}
          </div>

          {/* ── Filters panel ───────────────────────────────────────────────── */}
          {showFilters && (
            <div className="px-4 py-3 border-b border-gray-100 bg-[#EAEAEA] flex flex-wrap gap-3">
              {/* Category */}
              <div className="flex-1 min-w-[140px]">
                <label className="block text-[10px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Category</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full text-sm px-3 py-2 border border-[#EAEAEA] rounded-lg bg-white text-[#50757A] focus:outline-none focus:border-[#DD6E42]"
                >
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              {/* Bedrooms */}
              <div>
                <label className="block text-[10px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Bedrooms</label>
                <div className="flex gap-1">
                  {BEDROOMS.map(b => (
                    <button
                      key={b}
                      onClick={() => setBedrooms(b)}
                      className={`px-2.5 py-1.5 rounded-lg text-xs font-bold border transition ${
                        bedrooms === b
                          ? 'bg-[#DD6E42] text-white border-[#DD6E42]'
                          : 'bg-white text-[#50757A] border-[#EAEAEA] hover:border-[#DD6E42]'
                      }`}
                    >
                      {b}
                    </button>
                  ))}
                </div>
              </div>
              {/* Price range */}
              <div className="flex gap-2 items-end">
                <div>
                  <label className="block text-[10px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Min Price</label>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={e => setMinPrice(e.target.value)}
                    placeholder="KES"
                    className="w-28 text-sm px-3 py-2 border border-[#EAEAEA] rounded-lg focus:outline-none focus:border-[#DD6E42]"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-[#50757A] uppercase tracking-wider mb-1">Max Price</label>
                  <input
                    type="number"
                    value={maxPrice}
                    onChange={e => setMaxPrice(e.target.value)}
                    placeholder="KES"
                    className="w-28 text-sm px-3 py-2 border border-[#EAEAEA] rounded-lg focus:outline-none focus:border-[#DD6E42]"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Body (results / examples) ────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto">

            {/* Loading */}
            {isFetching && (
              <div className="flex items-center justify-center py-10 gap-3 text-[#50757A]">
                <Loader2 className="w-5 h-5 animate-spin text-[#DD6E42]" />
                <span className="text-sm">Searching…</span>
              </div>
            )}

            {/* Results */}
            {!isFetching && hasQuery && properties.length > 0 && (
              <div className="divide-y divide-gray-50">
                {properties.map((property: any) => {
                  const img   = coverUrl(property);
                  const price = displayPrice(property);
                  const loc   = locationLabel(property);
                  return (
                    <button
                      key={property.id}
                      onClick={() => goToProperty(property.id, property.listing_category)}
                      className="w-full flex items-center gap-4 px-4 py-3 hover:bg-[#EAEAEA] transition text-left"
                    >
                      {/* Thumbnail */}
                      <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-100 shrink-0 border border-gray-200">
                        {img
                          ? <img src={img} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-gray-300"><Home className="w-6 h-6" /></div>
                        }
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-[#50757A] truncate">{property.title}</p>
                        <p className="text-xs text-[#50757A] truncate mt-0.5 flex items-center gap-1">
                          <MapPin className="w-3 h-3 shrink-0" /> {loc}
                        </p>
                        {property.distance_m !== undefined && (
                          <p className="text-[10px] text-[#DD6E42] font-semibold mt-0.5">
                            {property.distance_m < 1000
                              ? `${property.distance_m}m away`
                              : `${(property.distance_m / 1000).toFixed(1)}km away`}
                          </p>
                        )}
                      </div>
                      {/* Price */}
                      {price && (
                        <div className="text-right shrink-0">
                          <p className="text-sm font-bold text-[#50757A]">{price}</p>
                          {property.bedrooms != null && (
                            <p className="text-[10px] text-[#50757A] mt-0.5">{property.bedrooms} bed</p>
                          )}
                        </div>
                      )}
                    </button>
                  );
                })}

                {/* View all results */}
                <div className="px-4 py-3">
                  <button
                    onClick={handleFullSearch}
                    className="w-full py-2.5 rounded-xl bg-[#50757A] text-white text-sm font-bold hover:bg-black transition"
                  >
                    View all {results?.total ?? 0} results
                  </button>
                </div>
              </div>
            )}

            {/* No results */}
            {!isFetching && hasQuery && properties.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-[#50757A]">
                <Building2 className="w-10 h-10 opacity-20 mb-3" />
                <p className="text-sm font-bold">No properties found</p>
                <p className="text-xs mt-1">Try different keywords or filters</p>
              </div>
            )}

            {/* Example queries (idle state) */}
            {!hasQuery && geoState.status === 'idle' && (
              <div className="px-4 py-4">
                <p className="text-[10px] font-bold text-[#50757A] uppercase tracking-wider mb-3">Try searching for</p>
                <div className="flex flex-wrap gap-2">
                  {EXAMPLES.map(ex => (
                    <button
                      key={ex}
                      onClick={() => { setQ(ex); setDebouncedQ(ex); }}
                      className="text-xs px-3 py-1.5 bg-[#EAEAEA] border border-[#EAEAEA] rounded-full hover:bg-[#DD6E42]/10 hover:border-[#DD6E42] hover:text-[#DD6E42] transition font-medium text-[#50757A]"
                    >
                      {ex}
                    </button>
                  ))}
                </div>

                <p className="text-[10px] font-bold text-[#50757A] uppercase tracking-wider mt-5 mb-3">Or search by category</p>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.slice(1).map(cat => (
                    <button
                      key={cat.value}
                      onClick={() => { setCategory(cat.value); setShowFilters(true); }}
                      className="flex items-center gap-2 px-3 py-2.5 border border-[#EAEAEA] rounded-xl text-xs font-bold text-[#50757A] hover:border-[#DD6E42] hover:bg-[#DD6E42]/5 transition"
                    >
                      <Building2 className="w-3.5 h-3.5 text-[#DD6E42]" /> {cat.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;

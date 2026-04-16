// components/Search/NearbyPlaceMapPicker.tsx
// A small embeddable map for picking the location of a nearby place.
// - User can type to search (Nominatim / OpenStreetMap geocoder, no API key)
// - Clicking anywhere on the map sets the pin
// - Selecting a search result fills in the pin + name suggestion
// - Exposes onPick(lat, lng, name?) callback to the parent
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, Loader2, X, MapPin } from 'lucide-react';

// Fix Leaflet default icon paths for Vite
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const pinIcon = L.divIcon({
  className: '',
  iconAnchor: [14, 28],
  html: `<div style="width:28px;height:28px;border-radius:50% 50% 50% 0;
    background:#ff385c;border:2px solid white;transform:rotate(-45deg);
    box-shadow:0 2px 8px rgba(255,56,92,.5);"></div>`,
});

// ── Nominatim result type ─────────────────────────────────────────────────────
interface NominatimResult {
  place_id:    number;
  display_name:string;
  lat:         string;
  lon:         string;
  type:        string;
  class:       string;
}

// ── Click handler inside the map ──────────────────────────────────────────────
interface ClickHandlerProps {
  onMapClick: (lat: number, lng: number) => void;
}
const ClickHandler: React.FC<ClickHandlerProps> = ({ onMapClick }) => {
  useMapEvents({ click: (e) => onMapClick(e.latlng.lat, e.latlng.lng) });
  return null;
};

// ── Map ref helper — allows panning to a new position ────────────────────────
interface PanControlProps { panTo: [number, number] | null }
const PanControl: React.FC<PanControlProps> = ({ panTo }) => {
  const map = useMapEvents({});
  useEffect(() => {
    if (panTo) map.setView(panTo, Math.max(map.getZoom(), 15), { animate: true });
  }, [map, panTo]);
  return null;
};

// ── Props ─────────────────────────────────────────────────────────────────────
interface NearbyPlaceMapPickerProps {
  /** Called when the user clicks the map or selects a search result */
  onPick: (lat: number, lng: number, suggestedName?: string) => void;
  /** Current pin position (controlled) */
  lat?: number;
  lng?: number;
  /** Initial map centre — defaults to Nairobi */
  defaultCenter?: [number, number];
}

// ── Component ─────────────────────────────────────────────────────────────────
const NearbyPlaceMapPicker: React.FC<NearbyPlaceMapPickerProps> = ({
  onPick,
  lat,
  lng,
  defaultCenter = [-1.2921, 36.8219],
}) => {
  const [searchText, setSearchText]   = useState('');
  const [results, setResults]         = useState<NominatimResult[]>([]);
  const [searching, setSearching]     = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [panTo, setPanTo]             = useState<[number, number] | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef    = useRef<AbortController | null>(null);

  // ── Nominatim geocode search ────────────────────────────────────────────────
  const doSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.trim().length < 3) { setResults([]); setShowResults(false); return; }
    if (abortRef.current) abortRef.current.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setSearching(true);
    try {
      const url = `https://nominatim.openstreetmap.org/search?` +
        `q=${encodeURIComponent(q)}&format=json&limit=6&countrycodes=ke&addressdetails=0`;
      const res  = await fetch(url, { signal: ctrl.signal, headers: { 'Accept-Language': 'en' } });
      const data = await res.json() as NominatimResult[];
      setResults(data);
      setShowResults(data.length > 0);
    } catch (e: any) {
      if (e?.name !== 'AbortError') setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchText(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(val), 500);
  };

  const handleSelectResult = (r: NominatimResult) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    // Use the first part of display_name as suggested name
    const suggested = r.display_name.split(',')[0].trim();
    setPanTo([lat, lng]);
    onPick(lat, lng, suggested);
    setSearchText(suggested);
    setShowResults(false);
    setResults([]);
  };

  const handleMapClick = (lat: number, lng: number) => {
    onPick(lat, lng);
  };

  const clearSearch = () => {
    setSearchText('');
    setResults([]);
    setShowResults(false);
  };

  const hasPin = lat !== undefined && lng !== undefined && !isNaN(lat) && !isNaN(lng);
  const center: [number, number] = hasPin ? [lat!, lng!] : defaultCenter;

  return (
    <div className="space-y-2">
      {/* Search input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a6a6a] pointer-events-none"/>
        <input
          type="text"
          value={searchText}
          onChange={handleSearchChange}
          onFocus={() => results.length > 0 && setShowResults(true)}
          placeholder="Search for a place, e.g. 'Embu University', 'Naivas Meru'"
          className="w-full pl-9 pr-8 py-2.5 border border-[#c1c1c1] rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#ff385c]/20 focus:border-[#ff385c]"
        />
        {searching && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a6a6a] animate-spin"/>
        )}
        {!searching && searchText && (
          <button type="button" onClick={clearSearch}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#6a6a6a] hover:text-[#222]">
            <X className="w-3.5 h-3.5"/>
          </button>
        )}

        {/* Dropdown results */}
        {showResults && results.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e5e5e5] rounded-xl shadow-lg z-[2000] max-h-52 overflow-y-auto">
            {results.map((r) => (
              <button
                key={r.place_id}
                type="button"
                onClick={() => handleSelectResult(r)}
                className="w-full flex items-start gap-2.5 px-4 py-2.5 hover:bg-[#fff0f2] text-left transition-colors border-b border-[#f2f2f2] last:border-0"
              >
                <MapPin className="w-3.5 h-3.5 text-[#ff385c] mt-0.5 shrink-0"/>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#222] truncate">{r.display_name.split(',')[0]}</p>
                  <p className="text-[11px] text-[#6a6a6a] truncate">{r.display_name.split(',').slice(1,3).join(',')}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Instruction */}
      <p className="text-[11px] text-[#6a6a6a]">
        <span className="font-semibold text-[#222]">Tip:</span> Search above <span className="font-medium">or</span> click anywhere on the map to drop a pin.
      </p>

      {/* Leaflet map */}
      <div className="rounded-xl overflow-hidden border border-[#e5e5e5]" style={{ height: 300 }}>
        <MapContainer
          center={center}
          zoom={13}
          style={{ width: '100%', height: '100%' }}
          scrollWheelZoom={false}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <ClickHandler onMapClick={handleMapClick}/>
          <PanControl panTo={panTo}/>
          {hasPin && (
            <Marker position={[lat!, lng!]} icon={pinIcon}/>
          )}
        </MapContainer>
      </div>

      {/* Coordinates readout */}
      {hasPin ? (
        <p className="text-[11px] text-[#6a6a6a] flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[#ff385c]"/>
          Pin at <span className="font-mono font-medium text-[#222]">{lat!.toFixed(6)}, {lng!.toFixed(6)}</span>
        </p>
      ) : (
        <p className="text-[11px] text-[#6a6a6a] italic">No pin yet — click the map or search above.</p>
      )}
    </div>
  );
};

export default NearbyPlaceMapPicker;

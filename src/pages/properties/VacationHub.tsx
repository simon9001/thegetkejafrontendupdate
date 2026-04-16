import React, { useState } from 'react';
import { Sparkles, MapPin, ArrowRight, Search, SlidersHorizontal, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout.js';
import StatusPreview from '../../components/property/StatusPreview.js';
import SearchResults from '../../components/Search/SearchResults.js';
import { useGetPublicPropertiesQuery } from '../../features/Api/PropertiesApi.js';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store.js';
import { statusData } from '../../data/statusData.js';
import { MapPin as MapPinIcon, BedDouble, Bath, Maximize2 } from 'lucide-react';
import HeartButton from '../../components/ui/HeartButton.js';
import { useSearchParams } from 'react-router-dom';

// ── Category tabs matching actual DB enum values ──────────────────────────────
const CATEGORIES = [
  { value: '',                label: 'All',        },
  { value: 'long_term_rent',  label: 'Long Rent',  },
  { value: 'for_sale',        label: 'For Sale',   },
  { value: 'short_term_rent', label: 'Short Stay', },
  { value: 'commercial',      label: 'Commercial', },
];


const BEDROOM_OPTIONS = [
  { value: '',  label: 'Any' },
  { value: '0', label: 'Bedsitter' },
  { value: '1', label: '1 bd' },
  { value: '2', label: '2 bd' },
  { value: '3', label: '3 bd' },
  { value: '4', label: '4+ bd' },
];

// ── Property card (same logic as SearchResults.tsx) ───────────────────────────
const PropertyCard: React.FC<{ property: any; onNavigate: (id: string) => void }> = ({ property: p, onNavigate }) => {
  const cover =
    (p.media ?? []).find((m: any) => m.is_cover)?.url ??
    p.media?.[0]?.url ??
    null;

  const pricing  = Array.isArray(p.pricing) ? p.pricing[0] : p.pricing;
  const amount   = pricing?.monthly_rent ?? pricing?.asking_price ?? 0;
  const currency = pricing?.currency ?? 'KES';
  const location = p.location;

  return (
    <div
      onClick={() => onNavigate(p.id)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-shadow border border-gray-100 group"
    >
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {cover ? (
          <img src={cover} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300">
            <Maximize2 className="w-10 h-10" />
          </div>
        )}
        {p.listing_category && (
          <span className="absolute top-3 left-3 bg-white/90 text-[#ff385c] text-xs font-semibold px-2 py-0.5 rounded-full capitalize">
            {p.listing_category.replace(/_/g, ' ')}
          </span>
        )}
        <div className="absolute top-3 right-3 z-10">
          <HeartButton property={p} size="sm" />
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-[#222] text-sm line-clamp-2 mb-1">{p.title}</h3>
        {(location?.area || location?.county) && (
          <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
            <MapPinIcon className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{[location.area, location.county].filter(Boolean).join(', ')}</span>
          </div>
        )}
        <div className="flex items-center gap-3 text-gray-500 text-xs mb-3">
          {p.bedrooms != null && p.bedrooms > 0 && (
            <span className="flex items-center gap-1"><BedDouble className="w-3 h-3" />{p.bedrooms} bd</span>
          )}
          {p.bathrooms != null && p.bathrooms > 0 && (
            <span className="flex items-center gap-1"><Bath className="w-3 h-3" />{p.bathrooms} ba</span>
          )}
        </div>
        <p className="text-[#ff385c] font-bold text-sm">
          {amount ? `${currency} ${Number(amount).toLocaleString()}` : 'Price on request'}
        </p>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const VacationHub: React.FC = () => {
  const navigate  = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);

  // Read active filters from URL so the filter bar and SearchResults stay in sync
  const activeCategory = searchParams.get('listing_category') ?? '';
  const activeBedrooms = searchParams.get('bedrooms')         ?? '';
  const activeMinPrice = searchParams.get('min_price')        ?? '';
  const activeMaxPrice = searchParams.get('max_price')        ?? '';
  const activeArea     = searchParams.get('area')             ?? '';
  const heroQ          = searchParams.get('q')                ?? '';

  const hasFilters = !!(activeCategory || activeBedrooms || activeMinPrice || activeMaxPrice || activeArea || heroQ);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const clearAll = () => setSearchParams({});

  // Hero search
  const handleHeroSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const input = (e?.target as HTMLFormElement)?.querySelector('input')?.value?.trim();
    if (input) setParam('q', input);
  };

  // Default listing (no filters active) — use public properties endpoint
  const { data: defaultData, isFetching: defaultLoading } = useGetPublicPropertiesQuery(
    { limit: 20 },
    { skip: hasFilters }
  );

  const { isAuthenticated } = useSelector((state: RootState) => state.auth);

  const handleStatusClick = (_index: number) => {
    // TODO: status preview modal not yet implemented
  };

  return (
    <Layout showSearch={true}>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="relative bg-gradient-to-br from-[#1B2430] to-[#2C3A4E] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#C5A373] rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C5A373] rounded-full filter blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center lg:text-left lg:flex lg:items-center lg:justify-between"
          >
            <div className="lg:w-2/3">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Sparkles className="w-4 h-4 text-[#C5A373]" />
                <span className="text-xs font-semibold uppercase tracking-wider">Welcome to GetKeja</span>
              </div>

              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black mb-4 leading-tight">
                Find Your <span className="text-[#C5A373]">Perfect</span><br />Property in Kenya
              </h1>

              <p className="text-lg lg:text-xl text-white/80 mb-8 max-w-2xl lg:mx-0 mx-auto">
                Browse thousands of verified rentals, homes for sale, and commercial spaces across Kenya.
              </p>

              {/* Hero search bar */}
              <form
                onSubmit={handleHeroSearch}
                className="bg-white rounded-full p-1.5 max-w-2xl mx-auto lg:mx-0 shadow-2xl"
              >
                <div className="flex items-center">
                  <div className="flex-1 flex items-center gap-2 px-4">
                    <MapPin className="w-5 h-5 text-[#C5A373]" />
                    <input
                      type="text"
                      defaultValue={heroQ}
                      placeholder="Try: '2 bedroom in Kilimani under 30k'"
                      className="w-full py-2 text-[#1B2430] placeholder-gray-400 focus:outline-none text-sm"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-[#C5A373] hover:bg-[#8B6E4E] transition-colors text-white px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 group"
                  >
                    <Search className="w-4 h-4" />
                    <span>Search</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </form>

              {/* Quick stats */}
              <div className="flex items-center gap-8 mt-8 justify-center lg:justify-start">
                <div>
                  <div className="text-2xl font-black text-[#C5A373]">500+</div>
                  <div className="text-xs text-white/60">Verified Properties</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#C5A373]">50k+</div>
                  <div className="text-xs text-white/60">Happy Guests</div>
                </div>
                <div>
                  <div className="text-2xl font-black text-[#C5A373]">100+</div>
                  <div className="text-xs text-white/60">Destinations</div>
                </div>
              </div>
            </div>

            <div className="hidden lg:block lg:w-1/3">
              <div className="relative">
                <div className="absolute -inset-4 bg-[#C5A373]/20 rounded-full filter blur-2xl" />
                <img
                  src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop"
                  alt="Luxury property"
                  className="relative rounded-2xl shadow-2xl"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Curved bottom */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 100L60 91.7C120 83.3 240 66.7 360 58.3C480 50 600 50 720 54.2C840 58.3 960 66.7 1080 70.8C1200 75 1320 75 1380 75L1440 75V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0Z" fill="white" />
          </svg>
        </div>
      </div>

      {/* ── Body ────────────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Status stories */}
        <div className="py-6 lg:py-8 border-b border-gray-100">
          <StatusPreview statuses={statusData} onStatusClick={handleStatusClick} />
        </div>

        {/* ── Filter bar ──────────────────────────────────────────────── */}
        <div className="sticky top-16 sm:top-20 bg-white z-20 border-b border-gray-100 shadow-sm">

          {/* Row: scrollable category pills + single filter button */}
          <div className="flex items-center gap-2 px-4 sm:px-0 py-3">

            {/* Horizontally scrollable category pills — no wrap on mobile */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar flex-1 min-w-0">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setParam('listing_category', cat.value)}
                  className={`flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border transition-colors whitespace-nowrap ${
                    activeCategory === cat.value
                      ? 'bg-[#ff385c] border-[#ff385c] text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Single filter button — shows active-filter dot when filters applied */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`relative flex-shrink-0 flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                showFilters || !!(activeBedrooms || activeMinPrice || activeMaxPrice || activeArea)
                  ? 'bg-[#222] text-white border-[#222]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
              {/* Active indicator dot */}
              {!!(activeBedrooms || activeMinPrice || activeMaxPrice || activeArea) && (
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#ff385c] border-2 border-white" />
              )}
            </button>

            {/* Clear all — only when something is active */}
            {hasFilters && (
              <button
                onClick={clearAll}
                className="flex-shrink-0 flex items-center gap-1 text-xs text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>

          {/* Expandable filter panel — full-width, grid on desktop / stacked on mobile */}
          {showFilters && (
            <div className="border-t border-gray-100 px-4 sm:px-0 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Bedrooms</label>
                <div className="flex flex-wrap gap-1.5">
                  {BEDROOM_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setParam('bedrooms', opt.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        activeBedrooms === opt.value
                          ? 'bg-[#ff385c] border-[#ff385c] text-white'
                          : 'bg-gray-50 border-gray-200 text-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Area / Location</label>
                <input
                  type="text"
                  value={activeArea}
                  onChange={(e) => setParam('area', e.target.value)}
                  placeholder="e.g. Westlands, Kilimani"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Min Price (KES)</label>
                <input
                  type="number"
                  min={0}
                  value={activeMinPrice}
                  onChange={(e) => setParam('min_price', e.target.value)}
                  placeholder="e.g. 5000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Max Price (KES)</label>
                <input
                  type="number"
                  min={0}
                  value={activeMaxPrice}
                  onChange={(e) => setParam('max_price', e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                />
              </div>
            </div>
          )}
        </div>

        {/* ── Property content ─────────────────────────────────────────── */}
        <div className="py-8">
          {hasFilters ? (
            // When the user has applied any filter/search — delegate to SearchResults
            // which uses useSearchPropertiesQuery and reads from URL params
            <SearchResults />
          ) : (
            // Default homepage view — all approved properties via useGetPublicPropertiesQuery
            defaultLoading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="w-12 h-12 border-4 border-[#C5A373] border-t-transparent rounded-full animate-spin" />
                <p className="text-gray-500 font-medium animate-pulse">Loading properties...</p>
              </div>
            ) : (defaultData?.properties ?? []).length === 0 ? (
              <div className="text-center py-24 text-gray-400">
                <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-200" />
                <p className="text-lg font-medium">No properties available yet.</p>
                <p className="text-sm mt-1">Check back soon — new listings are added daily.</p>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-5">
                  <span className="font-semibold text-gray-800">{defaultData?.total ?? 0}</span> properties available
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {(defaultData?.properties ?? []).map((p: any) => (
                    <PropertyCard
                      key={p.id}
                      property={p}
                      onNavigate={(id) => navigate(`/property/${id}`)}
                    />
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </Layout>
  );
};

export default VacationHub;

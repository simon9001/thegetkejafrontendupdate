import React, { useState, useCallback } from 'react';
import { Sparkles, SlidersHorizontal, X, ArrowRight, Home, Building2, CalendarDays, Briefcase, LayoutGrid } from 'lucide-react';
import { MapPin as MapPinIcon, BedDouble, Bath, Maximize2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Layout from '../../components/layout/Layout.js';
import StatusPreview from '../../components/property/StatusPreview.js';
import StatusViewerModal from '../../components/property/StatusViewerModal.js';
import SearchResults from '../../components/Search/SearchResults.js';
import { useGetPublicPropertiesQuery } from '../../features/Api/PropertiesApi.js';
import { statusData } from '../../data/statusData.js';
import SubscribeModal from '../../components/subscriptions/SubscribeModal.js';
import HeartButton from '../../components/ui/HeartButton.js';
import { useSearchParams } from 'react-router-dom';
import { useGetPlatformStatsQuery } from '../../features/Api/StatsApi.js';
import { useLanguage } from '../../context/LanguageContext.js';

// ── Category tabs — labels are resolved at render time via t() ─────────────────
const CATEGORY_DEFS = [
  { value: '',                labelKey: 'all'       as const, icon: <LayoutGrid   className="w-4 h-4" />, color: 'text-[#ff385c]'  },
  { value: 'long_term_rent',  labelKey: 'longRent'  as const, icon: <Home         className="w-4 h-4" />, color: 'text-blue-500'   },
  { value: 'for_sale',        labelKey: 'forSale'   as const, icon: <Building2    className="w-4 h-4" />, color: 'text-emerald-500'},
  { value: 'short_term_rent', labelKey: 'shortStay' as const, icon: <CalendarDays className="w-4 h-4" />, color: 'text-orange-500' },
  { value: 'commercial',      labelKey: 'commercial'as const, icon: <Briefcase    className="w-4 h-4" />, color: 'text-purple-500' },
];


// labelKey = null means it's a literal string (bed count)
const BEDROOM_OPTIONS = [
  { value: '',  labelKey: 'any' as const,      literal: null },
  { value: '0', labelKey: 'bedsitter' as const, literal: null },
  { value: '1', labelKey: null, literal: '1 bd' },
  { value: '2', labelKey: null, literal: '2 bd' },
  { value: '3', labelKey: null, literal: '3 bd' },
  { value: '4', labelKey: null, literal: '4+ bd' },
];

// ── Property card (same logic as SearchResults.tsx) ───────────────────────────
const PropertyCard: React.FC<{ property: any; onNavigate: (id: string) => void; priceOnRequest: string }> = ({ property: p, onNavigate, priceOnRequest }) => {
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
          {amount ? `${currency} ${Number(amount).toLocaleString()}` : priceOnRequest}
        </p>
      </div>
    </div>
  );
};

// ── Main page ─────────────────────────────────────────────────────────────────
const VacationHub: React.FC = () => {
  const navigate  = useNavigate();
  const { t }     = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();

  // Resolve category labels using current language
  const CATEGORIES = CATEGORY_DEFS.map((c) => ({ ...c, label: t(c.labelKey) }));
  const [showFilters, setShowFilters]     = useState(false);
  const [showSubscribe, setShowSubscribe] = useState(false);

  // Status viewer state
  const [viewerOpen, setViewerOpen]       = useState(false);
  const [viewerIndex, setViewerIndex]     = useState(0);
  const [statuses, setStatuses]           = useState(statusData);

  // Live platform stats — falls back to hardcoded values while loading or on error
  const { data: platformStats } = useGetPlatformStatsQuery();

  // Read active filters from URL so the filter bar and SearchResults stay in sync
  const activeCategory = searchParams.get('listing_category') ?? '';
  const activeBedrooms = searchParams.get('bedrooms')         ?? '';
  const activeMinPrice = searchParams.get('min_price')        ?? '';
  const activeMaxPrice = searchParams.get('max_price')        ?? '';
  const activeArea     = searchParams.get('area')             ?? '';
  const activeQ        = searchParams.get('q')                ?? '';

  const hasFilters = !!(activeCategory || activeBedrooms || activeMinPrice || activeMaxPrice || activeArea || activeQ);

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const clearAll = () => setSearchParams({});

  // Default listing (no filters active) — fetch enough for category sections (4 per section × 4 sections)
  const { data: defaultData, isFetching: defaultLoading } = useGetPublicPropertiesQuery(
    { limit: 32 },
    { skip: hasFilters }
  );


  const handleStatusClick = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  const handleStatusViewed = useCallback((statusId: number) => {
    setStatuses((prev) =>
      prev.map((s) => s.id === statusId ? { ...s, hasUnviewed: false } : s)
    );
  }, []);

  return (
    <Layout showSearch={true}>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      {/* pt-11 on mobile gives ~44px clearance for the floating navbar search pill */}
      
      <div className="relative bg-gradient-to-br from-[#1B2430] to-[#2C3A4E] text-white overflow-hidden pt-11 md:pt-0">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-[#C5A373] rounded-full filter blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C5A373] rounded-full filter blur-3xl" />
        </div>

        {/* Decorative grid lines */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(#C5A373 1px, transparent 1px), linear-gradient(90deg, #C5A373 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

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
                <span className="text-xs font-semibold uppercase tracking-wider">{t('welcomeBadge')}</span>
              </div>

              <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black mb-4 leading-tight">
                {t('heroTitle1')} <span className="text-[#C5A373]">{t('heroTitle2')}</span><br />{t('heroTitle3')}
              </h1>

              <p className="text-lg lg:text-xl text-white/80 mb-8 max-w-2xl lg:mx-0 mx-auto">
                {t('heroSub')}
              </p>

              {/* ── Subscribe CTA ── */}
              <div className="mb-8 flex flex-col sm:flex-row items-center lg:items-start gap-4 justify-center lg:justify-start">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowSubscribe(true)}
                  className="
                    group flex items-center gap-3
                    bg-[#C5A373] hover:bg-[#8B6E4E]
                    text-white font-bold px-7 py-3.5 rounded-full
                    shadow-lg shadow-[#C5A373]/40
                    transition-colors duration-200
                    text-sm
                  "
                >
                  <Sparkles className="w-4 h-4" />
                  {t('subscribeBtn')}
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </motion.button>

                <p className="text-white/50 text-xs text-center lg:text-left leading-relaxed max-w-xs">
                  {t('subscribeSub')}
                </p>
              </div>

              {/* Quick stats — live from /api/stats */}
              <div className="flex items-center gap-8 justify-center lg:justify-start">
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-black text-[#C5A373]">
                    {platformStats
                      ? platformStats.verified_properties >= 1000
                        ? `${(platformStats.verified_properties / 1000).toFixed(1)}k+`
                        : `${platformStats.verified_properties}+`
                      : '500+'}
                  </div>
                  <div className="text-xs text-white/60">{t('verifiedProps')}</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-black text-[#C5A373]">
                    {platformStats
                      ? platformStats.happy_tenants >= 1000
                        ? `${Math.floor(platformStats.happy_tenants / 1000)}k+`
                        : `${platformStats.happy_tenants}+`
                      : '50k+'}
                  </div>
                  <div className="text-xs text-white/60">{t('happyTenants')}</div>
                </div>
                <div className="text-center lg:text-left">
                  <div className="text-2xl font-black text-[#C5A373]">
                    {platformStats ? `${platformStats.counties_covered}+` : '47+'}
                  </div>
                  <div className="text-xs text-white/60">{t('counties')}</div>
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
          <StatusPreview statuses={statuses} onStatusClick={handleStatusClick} />
        </div>

        {/* ── Filter bar ──────────────────────────────────────────────── */}
        <div className="sticky top-16 sm:top-20 bg-white z-20 border-b border-gray-100 shadow-sm">

          {/* Row: scrollable category pills + single filter button */}
          <div className="flex items-center gap-2 px-4 sm:px-0 py-3">

            {/* Horizontally scrollable category pills — Airbnb-style with icons */}
            <div className="flex gap-1 overflow-x-auto no-scrollbar flex-1 min-w-0">
              {CATEGORIES.map((cat) => {
                const isActive = activeCategory === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => setParam('listing_category', cat.value)}
                    className={`flex-shrink-0 flex flex-col items-center gap-1 px-4 pt-2 pb-2.5 text-xs font-semibold border-b-2 transition-all whitespace-nowrap ${
                      isActive
                        ? 'border-[#222] text-[#222]'
                        : 'border-transparent text-gray-400 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <span className={isActive ? 'text-[#222]' : cat.color}>{cat.icon}</span>
                    {cat.label}
                  </button>
                );
              })}
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
              <span className="hidden sm:inline">{t('filters')}</span>
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
                <span className="hidden sm:inline">{t('clear')}</span>
              </button>
            )}
          </div>

          {/* Expandable filter panel — full-width, grid on desktop / stacked on mobile */}
          {showFilters && (
            <div className="border-t border-gray-100 px-4 sm:px-0 py-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">{t('bedrooms')}</label>
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
                      {opt.labelKey ? t(opt.labelKey) : opt.literal}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">{t('areaLabel')}</label>
                <input
                  type="text"
                  value={activeArea}
                  onChange={(e) => setParam('area', e.target.value)}
                  placeholder="e.g. Westlands, Kilimani"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">{t('minPrice')}</label>
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
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">{t('maxPrice')}</label>
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
            // Filtered view — delegate to SearchResults (reads URL params)
            <SearchResults />
          ) : defaultLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-12 h-12 border-4 border-[#C5A373] border-t-transparent rounded-full animate-spin" />
              <p className="text-gray-500 font-medium animate-pulse">{t('loading')}</p>
            </div>
          ) : (defaultData?.properties ?? []).length === 0 ? (
            <div className="text-center py-24 text-gray-400">
              <Sparkles className="w-12 h-12 mx-auto mb-4 text-gray-200" />
              <p className="text-lg font-medium">{t('noProperties')}</p>
              <p className="text-sm mt-1">{t('checkBack')}</p>
            </div>
          ) : (
            // "All" default view — categorized sections like Airbnb
            <div className="space-y-12">
              {CATEGORIES.filter((c) => c.value !== '').map((cat) => {
                const props = (defaultData?.properties ?? []).filter(
                  (p: any) => p.listing_category === cat.value,
                );
                if (props.length === 0) return null;
                return (
                  <section key={cat.value}>
                    {/* Section header */}
                    <div className="flex items-center justify-between mb-5">
                      <div className="flex items-center gap-2">
                        <span className={cat.color}>{cat.icon}</span>
                        <h2 className="text-lg font-bold text-[#222]">{cat.label}</h2>
                        <span className="text-sm text-gray-400 font-normal">
                          ({props.length} {props.length !== 1 ? t('listingsPlural') : t('listings')})
                        </span>
                      </div>
                      {props.length > 4 && (
                        <button
                          onClick={() => setParam('listing_category', cat.value)}
                          className="flex items-center gap-1 text-sm font-semibold text-[#ff385c] hover:underline"
                        >
                          {t('seeAll')} <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    {/* Property grid — 4 cards max */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                      {props.slice(0, 4).map((p: any) => (
                        <PropertyCard
                          key={p.id}
                          property={p}
                          priceOnRequest={t('priceOnRequest')}
                          onNavigate={(id) => navigate(`/property/${id}`)}
                        />
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <SubscribeModal isOpen={showSubscribe} onClose={() => setShowSubscribe(false)} />

      {viewerOpen && (
        <StatusViewerModal
          statuses={statuses}
          initialIndex={viewerIndex}
          onClose={() => setViewerOpen(false)}
          onViewed={handleStatusViewed}
        />
      )}
    </Layout>
  );
};

export default VacationHub;

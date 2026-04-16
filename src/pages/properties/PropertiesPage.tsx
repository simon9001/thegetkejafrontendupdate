// pages/properties/PropertiesPage.tsx
// Public search / browse page — accessible at /properties?q=...
// Contains NL search bar + filter strip above a SearchResults grid or live Map view.
import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X, List, Map } from 'lucide-react';
import Layout from '../../components/layout/Layout';
import NaturalLanguageSearch, { type ParsedQuery } from '../../components/Search/NaturalLanguageSearch';
import SearchResults from '../../components/Search/SearchResults';
import PropertyMapView from '../../components/Search/PropertyMapView';

const CATEGORIES = [
  { value: '',               label: 'All' },
  { value: 'long_term_rent', label: 'Long Rent' },
  { value: 'for_sale',       label: 'For Sale' },
  { value: 'short_term_rent',label: 'Short Stay' },
  { value: 'commercial',     label: 'Commercial' },
];

const BEDROOM_OPTIONS = [
  { value: '', label: 'Any' },
  { value: '0', label: 'Bedsitter' },
  { value: '1', label: '1 bd' },
  { value: '2', label: '2 bd' },
  { value: '3', label: '3 bd' },
  { value: '4', label: '4+ bd' },
];

const PropertiesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode]       = useState<'list' | 'map'>('list');

  const q        = searchParams.get('q')               ?? '';
  const category = searchParams.get('listing_category') ?? '';
  const bedrooms = searchParams.get('bedrooms')         ?? '';
  const minPrice = searchParams.get('min_price')        ?? '';
  const maxPrice = searchParams.get('max_price')        ?? '';
  const area     = searchParams.get('area')             ?? '';

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value);
    else next.delete(key);
    next.delete('page');
    setSearchParams(next);
  };

  const clearAll = () => setSearchParams({});

  const hasFilters = !!(category || bedrooms || minPrice || maxPrice || area);

  // When NL search resolves, sync all parsed params to URL
  const handleSearchResults = (_results: any[], _newQ: string, parsed: ParsedQuery) => {
    const next = new URLSearchParams();
    if (parsed.q)                           next.set('q',                parsed.q);
    if (parsed.listing_category)            next.set('listing_category', parsed.listing_category);
    if (parsed.listing_type)                next.set('listing_type',     parsed.listing_type);
    if (parsed.area)                        next.set('area',             parsed.area);
    if (parsed.county)                      next.set('county',           parsed.county);
    if (parsed.bedrooms !== undefined)      next.set('bedrooms',         String(parsed.bedrooms));
    if (parsed.max_price !== undefined)     next.set('max_price',        String(parsed.max_price));
    if (parsed.min_price !== undefined)     next.set('min_price',        String(parsed.min_price));
    if (parsed.is_furnished)               next.set('is_furnished',     parsed.is_furnished);
    setSearchParams(next);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-[#f7f7f7]">
        {/* Search header */}
        <div className="bg-white border-b border-gray-200 py-5 px-4 sticky top-0 z-20 shadow-sm">
          <div className="max-w-5xl mx-auto">
            <NaturalLanguageSearch
              onResults={handleSearchResults}
              placeholder="Try: '1 bedroom house near Embu university budget 5000'"
              className="mb-0"
            />
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-5">
          {/* Filter bar */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            {/* Category pills */}
            <div className="flex gap-2 flex-wrap flex-1">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setParam('listing_category', cat.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                    category === cat.value
                      ? 'bg-[#ff385c] border-[#ff385c] text-white'
                      : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {/* Advanced filters */}
            <button
              onClick={() => setShowFilters((v) => !v)}
              className={`flex items-center gap-1.5 px-4 py-1.5 rounded-full border text-sm font-medium transition-colors ${
                showFilters || hasFilters
                  ? 'bg-[#222] text-white border-[#222]'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
              {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-[#ff385c] ml-0.5" />}
            </button>

            {hasFilters && (
              <button
                onClick={clearAll}
                className="flex items-center gap-1 text-sm text-gray-400 hover:text-gray-700 transition-colors"
              >
                <X className="w-3.5 h-3.5" /> Clear all
              </button>
            )}

            {/* List / Map toggle */}
            <div className="flex items-center gap-0 border border-gray-200 rounded-full overflow-hidden bg-white ml-auto">
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'list' ? 'bg-[#222] text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="w-4 h-4" /> List
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-sm font-medium transition-colors ${
                  viewMode === 'map' ? 'bg-[#222] text-white' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Map className="w-4 h-4" /> Map
              </button>
            </div>
          </div>

          {/* Advanced filter panel */}
          {showFilters && (
            <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5 grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2 block">Bedrooms</label>
                <div className="flex flex-wrap gap-1.5">
                  {BEDROOM_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setParam('bedrooms', opt.value)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-colors ${
                        bedrooms === opt.value
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
                  value={area}
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
                  value={minPrice}
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
                  value={maxPrice}
                  onChange={(e) => setParam('max_price', e.target.value)}
                  placeholder="e.g. 50000"
                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#ff385c]"
                />
              </div>
            </div>
          )}

          {/* Content */}
          {viewMode === 'list' ? (
            <SearchResults />
          ) : (
            <div className="rounded-2xl overflow-hidden border border-gray-200 shadow-sm"
              style={{ height: '70vh' }}>
              <PropertyMapView
                listing_category={category || undefined}
                q={q || undefined}
                className="h-full"
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default PropertiesPage;

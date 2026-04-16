// components/Search/SearchResults.tsx
// Displays a grid of search results from the /api/search endpoint.
// Reads search params from the URL (q, listing_category, county, bedrooms,
// min_price, max_price, page) and re-fetches whenever they change.
import React, { useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { MapPin, BedDouble, Bath, Maximize2, Loader2, SearchX, ChevronLeft, ChevronRight } from 'lucide-react';
import { useSearchPropertiesQuery, type Property } from '../../features/Api/PropertiesApi';

// ─── Price formatter ──────────────────────────────────────────────────────────
function formatPrice(p: Property): string {
  const pricing = (p as any).property_pricing?.[0] ?? p.pricing;
  const amount = pricing?.monthly_rent ?? pricing?.asking_price ?? p.price_per_month ?? p.price_per_night ?? p.price ?? 0;
  const currency = pricing?.currency ?? p.currency ?? 'KES';
  if (!amount) return 'Price on request';
  return `${currency} ${Number(amount).toLocaleString()}`;
}

// ─── Single card ─────────────────────────────────────────────────────────────
const PropertyCard: React.FC<{ property: Property }> = ({ property: p }) => {
  const navigate = useNavigate();
  const cover =
    (p.media ?? []).find((m) => m.is_cover)?.url ??
    p.media?.[0]?.url ??
    (p as any).cover_url ??
    null;

  const locationText = [
    (p.location as any)?.estate_name,
    (p.location as any)?.area,
    (p.location as any)?.town,
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      onClick={() => navigate(`/properties/${p.id}`)}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md cursor-pointer transition-shadow border border-gray-100 group"
    >
      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        {cover ? (
          <img
            src={cover}
            alt={p.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
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
      </div>

      {/* Body */}
      <div className="p-4">
        <h3 className="font-semibold text-[#222] text-sm line-clamp-2 mb-1">{p.title}</h3>
        {locationText && (
          <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
            <MapPin className="w-3 h-3 flex-shrink-0" />
            <span className="truncate">{locationText}</span>
          </div>
        )}

        {/* Specs row */}
        <div className="flex items-center gap-3 text-gray-500 text-xs mb-3">
          {p.bedrooms != null && p.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <BedDouble className="w-3 h-3" />
              {p.bedrooms} bd
            </span>
          )}
          {p.bathrooms != null && p.bathrooms > 0 && (
            <span className="flex items-center gap-1">
              <Bath className="w-3 h-3" />
              {p.bathrooms} ba
            </span>
          )}
          {p.size_sqm != null && p.size_sqm > 0 && (
            <span className="flex items-center gap-1">
              <Maximize2 className="w-3 h-3" />
              {p.size_sqm} m²
            </span>
          )}
        </div>

        <p className="text-[#ff385c] font-bold text-sm">{formatPrice(p)}</p>
      </div>
    </div>
  );
};

// ─── Pagination bar ───────────────────────────────────────────────────────────
const Pagination: React.FC<{ page: number; pages: number; onPage: (p: number) => void }> = ({
  page,
  pages,
  onPage,
}) => {
  if (pages <= 1) return null;
  const nums: number[] = [];
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) nums.push(i);

  return (
    <div className="flex items-center justify-center gap-2 mt-8">
      <button
        disabled={page <= 1}
        onClick={() => onPage(page - 1)}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      {nums[0] > 1 && (
        <>
          <button onClick={() => onPage(1)} className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-sm">1</button>
          {nums[0] > 2 && <span className="text-gray-400 px-1">…</span>}
        </>
      )}
      {nums.map((n) => (
        <button
          key={n}
          onClick={() => onPage(n)}
          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
            n === page ? 'bg-[#ff385c] text-white' : 'hover:bg-gray-100 text-gray-700'
          }`}
        >
          {n}
        </button>
      ))}
      {nums[nums.length - 1] < pages && (
        <>
          {nums[nums.length - 1] < pages - 1 && <span className="text-gray-400 px-1">…</span>}
          <button onClick={() => onPage(pages)} className="px-3 py-1.5 rounded-lg hover:bg-gray-100 text-sm">{pages}</button>
        </>
      )}
      <button
        disabled={page >= pages}
        onClick={() => onPage(page + 1)}
        className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const SearchResults: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const params = useMemo(() => ({
    q:                searchParams.get('q')               ?? undefined,
    listing_category: searchParams.get('listing_category') ?? undefined,
    listing_type:     searchParams.get('listing_type')     ?? undefined,
    county:           searchParams.get('county')           ?? undefined,
    area:             searchParams.get('area')             ?? undefined,
    min_price:        searchParams.get('min_price') ? Number(searchParams.get('min_price')) : undefined,
    max_price:        searchParams.get('max_price') ? Number(searchParams.get('max_price')) : undefined,
    bedrooms:         searchParams.get('bedrooms')  ? Number(searchParams.get('bedrooms'))  : undefined,
    page:             searchParams.get('page')      ? Number(searchParams.get('page'))      : 1,
    limit:            20,
  }), [searchParams]);

  const hasAnyFilter = !!(params.q || params.listing_category || params.county ||
    params.area || params.bedrooms !== undefined || params.listing_type ||
    params.min_price !== undefined || params.max_price !== undefined);

  const { data, isFetching, isError } = useSearchPropertiesQuery(params, {
    skip: !hasAnyFilter,
  });

  const goToPage = (p: number) => {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(p));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ── States ────────────────────────────────────────────────────────────────
  if (!hasAnyFilter) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <SearchX className="w-12 h-12 mb-4" />
        <p className="text-lg font-medium">No search query provided.</p>
        <p className="text-sm mt-1">Use the search bar above to find properties.</p>
      </div>
    );
  }

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-[#ff385c]" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-gray-400">
        <SearchX className="w-12 h-12 mb-4" />
        <p className="text-lg font-medium">Something went wrong.</p>
        <p className="text-sm mt-1">Please try again.</p>
      </div>
    );
  }

  const properties = data?.properties ?? [];
  const total      = data?.total ?? 0;
  const pages      = data?.pages ?? 1;
  const page       = params.page ?? 1;

  return (
    <div className="w-full">
      {/* Result count */}
      <div className="mb-4 text-sm text-gray-500">
        {total > 0 ? (
          <>
            <span className="font-semibold text-gray-800">{total.toLocaleString()}</span>{' '}
            {total === 1 ? 'property' : 'properties'} found
            {params.q && (
              <>
                {' '}for <span className="font-medium text-gray-700">"{params.q}"</span>
              </>
            )}
          </>
        ) : (
          'No properties matched your search.'
        )}
      </div>

      {/* Grid */}
      {properties.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {properties.map((p) => (
            <PropertyCard key={p.id} property={p} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <SearchX className="w-12 h-12 mb-4" />
          <p className="font-medium">No results found.</p>
          <p className="text-sm mt-1">Try a different keyword or remove some filters.</p>
        </div>
      )}

      <Pagination page={page} pages={pages} onPage={goToPage} />
    </div>
  );
};

export default SearchResults;

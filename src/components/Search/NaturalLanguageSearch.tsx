// components/Search/NaturalLanguageSearch.tsx
// Embeddable search bar with a client-side natural-language parser.
// Parses queries like "2 bedroom house near Embu university budget 5000"
// into structured API params, then navigates to /properties or passes results to parent.
import React, { useState, useCallback, useRef } from 'react';
import { Search, Loader2, X, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useLazySearchPropertiesQuery } from '../../features/Api/PropertiesApi';

// ─── Natural Language Parser ─────────────────────────────────────────────────
export interface ParsedQuery {
  q:                 string;   // raw query (always passed for fallback text search)
  bedrooms?:         number;
  listing_type?:     string;
  listing_category?: string;
  county?:           string;
  area?:             string;
  max_price?:        number;
  min_price?:        number;
  is_furnished?:     string;
}

const PROPERTY_TYPES: Record<string, string> = {
  apartment: 'apartment', flat: 'apartment', bedsitter: 'bedsitter', bedsit: 'bedsitter',
  house: 'house', bungalow: 'house', maisonette: 'maisonette',
  villa: 'villa', mansion: 'villa', studio: 'studio',
  plot: 'plot', land: 'plot', farm: 'plot',
  'off plan': 'off_plan', offplan: 'off_plan', 'off-plan': 'off_plan',
};

const CATEGORIES: { patterns: RegExp[]; value: string }[] = [
  { patterns: [/\bfor\s+sale\b/i, /\bto\s+buy\b/i, /\bpurchase\b/i, /\bbuy\b/i], value: 'for_sale' },
  { patterns: [/\bairbnb\b/i, /\bshort.?stay\b/i, /\bbnb\b/i, /\bholiday\b/i, /\bvacation\b/i, /\bper\s+night\b/i], value: 'short_term_rent' },
  { patterns: [/\bcommercial\b/i, /\boffice\b/i, /\bgodown\b/i, /\bwarehouse\b/i, /\bshop\b/i, /\bkiosk\b/i], value: 'commercial' },
  { patterns: [/\bfor\s+rent\b/i, /\bto\s+rent\b/i, /\brenting\b/i], value: 'long_term_rent' },
];

const LOCATION_PREPS = /\b(?:around|near(?:by)?|close\s+to|next\s+to|in|at|within|along)\s+(.+?)(?:\s+(?:with|budget|under|below|max|ksh|kes|for|bed|bed|bath|furnish|park|\d)|$)/i;

function parseNaturalQuery(input: string): ParsedQuery {
  const text = input.trim();
  const lower = text.toLowerCase();
  const parsed: ParsedQuery = { q: text };

  // ── Bedrooms ─────────────────────────────────────────────────────────────
  const bedMatch =
    lower.match(/\b(\d+)\s*(?:bed(?:room)?s?|br)\b/) ||
    lower.match(/\b(one|two|three|four|five|six)\s*bed(?:room)?s?\b/);
  if (bedMatch) {
    const wordToNum: Record<string, number> = { one:1,two:2,three:3,four:4,five:5,six:6 };
    parsed.bedrooms = wordToNum[bedMatch[1]] ?? parseInt(bedMatch[1], 10);
  }
  if (/\bstudio\b/i.test(lower)) parsed.bedrooms = 0;
  if (/\bbedsitter\b|\bbedsit\b/i.test(lower)) parsed.bedrooms = 1;

  // ── Property type ─────────────────────────────────────────────────────────
  for (const [keyword, value] of Object.entries(PROPERTY_TYPES)) {
    if (lower.includes(keyword)) {
      parsed.listing_type = value;
      break;
    }
  }

  // ── Listing category ──────────────────────────────────────────────────────
  for (const cat of CATEGORIES) {
    if (cat.patterns.some(p => p.test(lower))) {
      parsed.listing_category = cat.value;
      break;
    }
  }
  // If no explicit category but it's a plot, default to for_sale
  if (!parsed.listing_category && parsed.listing_type === 'plot') {
    parsed.listing_category = 'for_sale';
  }

  // ── Price / Budget ────────────────────────────────────────────────────────
  // Matches: "budget 5000", "under 30k", "below 15,000", "max 8k", "KES 12,000", "Ksh 8000"
  const priceMatch = lower.match(
    /(?:budget|max(?:imum)?|under|below|up\s+to|kes|ksh|ksh\.?)\s*:?\s*([\d,]+)k?\b/i,
  );
  if (priceMatch) {
    const raw = priceMatch[1].replace(/,/g, '');
    const val = parseInt(raw, 10) * (/k\b/.test(priceMatch[0]) ? 1000 : 1);
    parsed.max_price = val;
  }

  // Matches: "from 10k", "from KES 10000", "minimum 5000"
  const minMatch = lower.match(
    /(?:from|minimum|min(?:imum)?)\s*:?\s*([\d,]+)k?\b/i,
  );
  if (minMatch) {
    const raw = minMatch[1].replace(/,/g, '');
    const val = parseInt(raw, 10) * (/k\b/.test(minMatch[0]) ? 1000 : 1);
    parsed.min_price = val;
  }

  // ── Location ──────────────────────────────────────────────────────────────
  const locMatch = lower.match(LOCATION_PREPS);
  if (locMatch) {
    // Clean up the location string
    let loc = locMatch[1].trim().replace(/\s+/g, ' ');
    // Remove trailing filler words
    loc = loc.replace(/\s+(?:area|estate|town|city|kenya)$/i, '');
    if (loc.length >= 2) parsed.area = loc;
  } else {
    // Try simpler "in X" pattern without prep-word ambiguity
    const inMatch = lower.match(/\bin\s+([a-z][a-z\s]{1,30}?)(?:\s+\d|\s+with|\s+budget|$)/i);
    if (inMatch) {
      const loc = inMatch[1].trim();
      if (loc.length >= 2) parsed.area = loc;
    }
  }

  // ── Furnished ─────────────────────────────────────────────────────────────
  if (/\bfully\s+furnished\b/i.test(lower))     parsed.is_furnished = 'fully_furnished';
  else if (/\bsemi\s+furnished\b/i.test(lower)) parsed.is_furnished = 'semi_furnished';
  else if (/\bunfurnished\b/i.test(lower))      parsed.is_furnished = 'unfurnished';
  else if (/\bfurnished\b/i.test(lower))        parsed.is_furnished = 'fully_furnished';

  return parsed;
}

// ─── Examples ────────────────────────────────────────────────────────────────
const EXAMPLES = [
  '1 bedroom house near Embu university budget 5000',
  '2 bedroom apartment in Westlands under 30k',
  'Bedsitter in Roysambu below 8k',
  'Plot for sale in Kitengela',
  'Studio near JKUAT furnished',
  'Airbnb near Two Rivers Mall',
];

// ─── Component ───────────────────────────────────────────────────────────────
interface NaturalLanguageSearchProps {
  onResults?: (results: any[], query: string, parsed: ParsedQuery) => void;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
}

const NaturalLanguageSearch: React.FC<NaturalLanguageSearchProps> = ({
  onResults,
  placeholder = "Try: '1 bedroom house near Embu university budget 5000'",
  className = '',
  autoFocus = false,
}) => {
  const navigate = useNavigate();
  const [query, setQuery]             = useState('');
  const [parsed, setParsed]           = useState<ParsedQuery | null>(null);
  const [showParsed, setShowParsed]   = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [triggerSearch, { isFetching }] = useLazySearchPropertiesQuery();

  const runSearch = useCallback(
    async (q: string) => {
      if (!q.trim()) return;
      const p = parseNaturalQuery(q);
      setParsed(p);

      // Build API params from parsed fields
      const apiParams: Record<string, any> = { q: p.q };
      if (p.bedrooms         !== undefined) apiParams.bedrooms         = p.bedrooms;
      if (p.listing_type)                   apiParams.listing_type     = p.listing_type;
      if (p.listing_category)               apiParams.listing_category = p.listing_category;
      if (p.county)                         apiParams.county           = p.county;
      if (p.area)                           apiParams.area             = p.area;
      if (p.max_price        !== undefined) apiParams.max_price        = p.max_price;
      if (p.min_price        !== undefined) apiParams.min_price        = p.min_price;
      if (p.is_furnished)                   apiParams.is_furnished     = p.is_furnished;

      if (onResults) {
        const result = await triggerSearch(apiParams);
        if (result.data) onResults(result.data.properties, q, p);
      } else {
        // Navigate to /properties with all parsed params as URL search params
        const sp = new URLSearchParams({ q: p.q });
        if (p.bedrooms         !== undefined) sp.set('bedrooms',         String(p.bedrooms));
        if (p.listing_type)                   sp.set('listing_type',     p.listing_type);
        if (p.listing_category)               sp.set('listing_category', p.listing_category);
        if (p.area)                           sp.set('area',             p.area);
        if (p.county)                         sp.set('county',           p.county);
        if (p.max_price        !== undefined) sp.set('max_price',        String(p.max_price));
        if (p.min_price        !== undefined) sp.set('min_price',        String(p.min_price));
        if (p.is_furnished)                   sp.set('is_furnished',     p.is_furnished);
        navigate(`/properties?${sp.toString()}`);
      }
    },
    [navigate, onResults, triggerSearch],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    setShowParsed(false);
    if (onResults) {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => runSearch(val), 400);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setShowParsed(true);
    runSearch(query);
  };

  const handleClear = () => {
    setQuery('');
    setParsed(null);
    setShowParsed(false);
    if (onResults) onResults([], '', { q: '' });
  };

  // Build a human-readable summary of what was parsed
  const parsedSummary = parsed && showParsed ? (() => {
    const parts: string[] = [];
    if (parsed.bedrooms !== undefined) parts.push(`${parsed.bedrooms === 0 ? 'Studio' : `${parsed.bedrooms} bed`}`);
    if (parsed.listing_type && parsed.listing_type !== 'studio') parts.push(parsed.listing_type.replace('_', ' '));
    if (parsed.listing_category) parts.push(`(${parsed.listing_category.replace('_', ' ')})`);
    if (parsed.area) parts.push(`near "${parsed.area}"`);
    if (parsed.county && parsed.county !== parsed.area) parts.push(`in ${parsed.county}`);
    if (parsed.max_price) parts.push(`max KES ${parsed.max_price.toLocaleString()}`);
    if (parsed.min_price) parts.push(`from KES ${parsed.min_price.toLocaleString()}`);
    if (parsed.is_furnished) parts.push(parsed.is_furnished.replace('_', ' '));
    return parts.length ? `Searching: ${parts.join(', ')}` : null;
  })() : null;

  return (
    <div className={`w-full ${className}`}>
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={handleChange}
          autoFocus={autoFocus}
          placeholder={placeholder}
          className="w-full pl-12 pr-28 py-4 text-base border border-gray-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff385c] focus:border-transparent bg-white"
        />
        {query && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-[6.5rem] top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
            aria-label="Clear"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          disabled={isFetching || !query.trim()}
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#ff385c] text-white px-4 py-2.5 rounded-xl font-semibold hover:bg-[#e0334f] disabled:opacity-50 transition-colors flex items-center gap-1.5 text-sm"
        >
          {isFetching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
          <span className="hidden sm:inline">Search</span>
        </button>
      </form>

      {/* Parsed interpretation pill */}
      {parsedSummary && (
        <div className="mt-2 flex items-center gap-1.5 text-xs text-[#6a6a6a] px-1">
          <Sparkles className="w-3.5 h-3.5 text-[#ff385c]" />
          <span>{parsedSummary}</span>
        </div>
      )}

      {/* Example queries */}
      <div className="mt-3 flex gap-2 flex-wrap">
        {EXAMPLES.map((ex) => (
          <button
            key={ex}
            type="button"
            onClick={() => {
              setQuery(ex);
              setShowParsed(true);
              runSearch(ex);
            }}
            className="text-xs px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors text-gray-600 whitespace-nowrap"
          >
            {ex}
          </button>
        ))}
      </div>
    </div>
  );
};

export { parseNaturalQuery };
export default NaturalLanguageSearch;

import React, { useState, useRef } from 'react';
import { Star, Building2, Hotel, Home, Sparkles, ChevronLeft, ChevronRight, Search, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from '../../components/layout/Layout.js';
import HeartButton from '../../components/ui/HeartButton.js';
import PropertyStatus from '../../components/property/PropertyStatus.js';
import StatusPreview from '../../components/property/StatusPreview.js';
import FilterButton from '../../components/ui/FilterButton.js';
import { AnimatePresence, motion } from 'framer-motion';
import { useSearchByRadiusQuery } from '../../features/Api/SpatialApi.js';
import { useGetPropertiesQuery, useSearchNaturalQuery } from '../../features/Api/PropertiesApi.js';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store.js';
import { statusData } from '../../data/statusData.js';

const VacationHub: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [activeCategory, setActiveCategory] = useState<string>('featured');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [showStatus, setShowStatus] = useState(false);
    const [statusInitialIndex, setStatusInitialIndex] = useState(0);
    const [heroSearchQuery, setHeroSearchQuery] = useState('');
    const [isHeroSearching, setIsHeroSearching] = useState(false);
    const [heroSearchResults, setHeroSearchResults] = useState<any[] | null>(null);

    // Search State from Redux
    const { mapView } = useSelector((state: RootState) => state.properties);
    const isSearchActive = mapView.radius > 0;

    // Fetch properties
    useSearchByRadiusQuery(
        {
            lat: mapView.center.lat,
            lng: mapView.center.lng,
            radius: mapView.radius,
            maxPrice: mapView.maxPrice,
            minBedrooms: mapView.minBedrooms,
            q: mapView.query
        },
        { skip: !isSearchActive }
    );

    const { data: catProperties, isFetching: isCatLoading } = useGetPropertiesQuery(
        { category: activeCategory === 'featured' ? undefined : activeCategory },
        { skip: !!heroSearchResults }
    );

    const { data: naturalResults, isFetching: isNaturalLoading } = useSearchNaturalQuery(
        heroSearchQuery,
        { skip: !isHeroSearching || !heroSearchQuery }
    );

    // Effect to handle hero search results
    React.useEffect(() => {
        if (naturalResults) {
            setHeroSearchResults(naturalResults.properties);
            setIsHeroSearching(false);
        }
    }, [naturalResults]);

    const handleHeroSearch = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (heroSearchQuery.trim()) {
            setIsHeroSearching(true);
        }
    };

    const handleClearSearch = () => {
        setHeroSearchQuery('');
        setHeroSearchResults(null);
    };

    // Process properties based on search state
    const getBaseProperties = () => {
        if (heroSearchResults) return heroSearchResults;
        return catProperties?.properties || [];
    };

    const properties = getBaseProperties();
    const isLoading = isHeroSearching || isNaturalLoading || isCatLoading;

    // Filter properties based on selected categories (amenities/styles) and verification
    const filterProperties = (props: any[] | undefined) => {
        if (!props) return [];
        let filtered = props;

        // Ensure only active properties are shown and hide struck ones
        // Removed `is_verified === true` to allow unverified properties to appear (e.g., newly added ones)
        filtered = filtered.filter(p => !p.is_struck);

        const categorized = selectedCategories.length === 0
            ? filtered
            : filtered.filter(p => p.category && selectedCategories.includes(p.category));

        // Sort boosted properties to the top
        return [...categorized].sort((a, b) => (b.is_boosted ? 1 : 0) - (a.is_boosted ? 1 : 0));
    };

    const filteredProperties = filterProperties(properties);

    // Refs for horizontal scroll containers
    const scrollRef = useRef<HTMLDivElement>(null);

    // Scroll function
    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const scrollAmount = 400;
            const newScrollLeft = direction === 'left'
                ? scrollRef.current.scrollLeft - scrollAmount
                : scrollRef.current.scrollLeft + scrollAmount;

            scrollRef.current.scrollTo({
                left: newScrollLeft,
                behavior: 'smooth'
            });
        }
    };

    // Category tabs configuration
    const categoryTabs = [
        { id: 'featured', label: 'All Featured', icon: Sparkles },
        { id: 'residential', label: 'Residential', icon: Home },
        { id: 'commercial', label: 'Commercial', icon: Building2 },
        { id: 'recreational', label: 'Recreational', icon: Hotel },
    ];

    const styleCategories = [
        'Beach', 'Windmills', 'Modern', 'Countryside', 'Pools', 'Islands',
        'Lake', 'Skiing', 'Castles', 'Caves', 'Camping', 'Arctic',
        'Desert', 'Barns', 'Lux'
    ];

    const handleCategoryChange = (category: string) => {
        setSelectedCategories(prev =>
            prev.includes(category)
                ? prev.filter(c => c !== category)
                : [...prev, category]
        );
    };

    const handleClearAllFilters = () => {
        setSelectedCategories([]);
    };
    const { isAuthenticated } = useSelector((state: RootState) => state.authSlice);

    const handleStatusClick = (index: number) => {
        setStatusInitialIndex(index);
        setShowStatus(true);
    };

    const handleViewDetails = (propertyId: number | string) => {
        setShowStatus(false);
        navigate(`/property/${propertyId}`);
    };

    // Property Card Component
    const PropertyCard = ({ property, authenticated }: { property: any, authenticated: boolean }) => {
        const handleClick = () => {
            if (!authenticated) {
                navigate('/login', { state: { from: location.pathname } });
            } else {
                navigate(`/property/${property.id}`);
            }
        };

        const displayPrice = property.price_per_month || property.price_per_night || property.price || 0;
        const priceLabel = property.price_per_month ? 'month' : 'night';
        const primaryImage = property.image || property.images?.find((img: any) => img.is_primary)?.image_url || property.images?.[0]?.image_url || 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=400';

        return (
            <div
                className="min-w-[160px] sm:min-w-[180px] md:min-w-[200px] lg:min-w-[220px] group cursor-pointer"
                onClick={handleClick}
            >
                <div className="relative aspect-square rounded-lg lg:rounded-xl overflow-hidden shadow-sm border border-gray-100">
                    <img
                        src={primaryImage}
                        alt={property.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                    />

                    <div
                        className="absolute top-2 right-2 z-10"
                        onClick={(e) => {
                            if (!authenticated) {
                                e.stopPropagation();
                                navigate('/login', { state: { from: location.pathname } });
                            }
                        }}
                    >
                        <HeartButton property={property} size="sm" />
                    </div>

                    {isSearchActive && property.dist_meters !== undefined && (
                        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-md text-white px-2 py-0.5 rounded-full text-[10px] font-medium">
                            {(property.dist_meters / 1000).toFixed(1)} km away
                        </div>
                    )}
                </div>

                <div className="mt-2.5 space-y-0.5">
                    <div className="flex items-start justify-between">
                        <h3 className="text-sm font-semibold text-[#1B2430] truncate pr-2">
                            {property.title}
                        </h3>
                        <div className="flex items-center gap-1 shrink-0">
                            <Star className="w-3 h-3 fill-current text-[#D4A373]" />
                            <span className="text-xs font-medium">4.8</span>
                        </div>
                    </div>

                    <p className="text-xs text-gray-500">
                        {property.location?.town || property.neighborhood?.name || 'International'}
                    </p>

                    <p className="mt-1.5 flex items-baseline gap-1">
                        <span className="text-sm font-extrabold text-[#1B2430]">
                            {property.currency || '$'}{displayPrice.toLocaleString()}
                        </span>
                        <span className="text-xs text-gray-500"> /{priceLabel}</span>
                    </p>
                </div>
            </div>
        );
    };

    return (
        <Layout showSearch={true}>
            {/* Hero Section */}
            <div className="relative bg-gradient-to-br from-[#1B2430] to-[#2C3A4E] text-white overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 left-0 w-64 h-64 bg-[#C5A373] rounded-full filter blur-3xl"></div>
                    <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#C5A373] rounded-full filter blur-3xl"></div>
                </div>

                {/* Content */}
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
                                <span className="text-xs font-semibold uppercase tracking-wider">
                                    Welcome to Your Dream Getaway
                                </span>
                            </div>

                            <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black mb-4 leading-tight">
                                Discover <span className="text-[#C5A373]">Extraordinary</span><br />
                                Places to Stay
                            </h1>

                            <p className="text-lg lg:text-xl text-white/80 mb-8 max-w-2xl lg:mx-0 mx-auto">
                                From luxury villas to cozy apartments, find the perfect space for your next adventure.
                                Explore thousands of verified properties worldwide.
                            </p>

                            {/* Search Bar */}
                            <form onSubmit={handleHeroSearch} className="bg-white rounded-full p-1.5 max-w-2xl mx-auto lg:mx-0 shadow-2xl">
                                <div className="flex items-center">
                                    <div className="flex-1 flex items-center gap-2 px-4">
                                        <MapPin className="w-5 h-5 text-[#C5A373]" />
                                        <input
                                            type="text"
                                            value={heroSearchQuery}
                                            onChange={(e) => setHeroSearchQuery(e.currentTarget.value)}
                                            placeholder="Where do you want to go? (e.g. house in embu under 20k)"
                                            className="w-full py-2 text-[#1B2430] placeholder-gray-400 focus:outline-none text-sm"
                                        />
                                        {heroSearchQuery && (
                                            <button
                                                type="button"
                                                onClick={handleClearSearch}
                                                className="text-gray-400 hover:text-gray-600 px-2"
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={isHeroSearching}
                                        className="bg-[#C5A373] hover:bg-[#8B6E4E] disabled:bg-gray-400 transition-colors text-white px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 group"
                                    >
                                        {isHeroSearching ? (
                                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        ) : (
                                            <Search className="w-4 h-4" />
                                        )}
                                        <span>Search</span>
                                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </form>

                            {/* Stats */}
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

                        {/* Hero Image */}
                        <div className="hidden lg:block lg:w-1/3">
                            <div className="relative">
                                <div className="absolute -inset-4 bg-[#C5A373]/20 rounded-full filter blur-2xl"></div>
                                <img
                                    src="https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop"
                                    alt="Luxury property"
                                    className="relative rounded-2xl shadow-2xl"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Curved Bottom Edge */}
                <div className="absolute bottom-0 left-0 right-0">
                    <svg viewBox="0 0 1440 100" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
                        <path d="M0 100L60 91.7C120 83.3 240 66.7 360 58.3C480 50 600 50 720 54.2C840 58.3 960 66.7 1080 70.8C1200 75 1320 75 1380 75L1440 75V100H1380C1320 100 1200 100 1080 100C960 100 840 100 720 100C600 100 480 100 360 100C240 100 120 100 60 100H0Z" fill="white" />
                    </svg>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Status Stories Section */}
                <div className="py-6 lg:py-8 border-b border-gray-100">
                    <StatusPreview
                        statuses={statusData}
                        onStatusClick={handleStatusClick}
                    />
                </div>

                {/* Filter & Category Section */}
                <div className="py-4 lg:py-6 sticky top-20 bg-white z-20 border-b border-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="flex gap-2 lg:gap-4 overflow-x-auto no-scrollbar py-1">
                            {categoryTabs.map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => {
                                            setActiveCategory(tab.id);
                                        }}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 text-sm whitespace-nowrap ${activeCategory === tab.id && !isSearchActive
                                            ? 'bg-[#1B2430] text-white shadow-md'
                                            : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                                            }`}
                                    >
                                        <Icon className="w-4 h-4" />
                                        <span className="font-semibold">{tab.label}</span>
                                    </button>
                                );
                            })}
                        </div>

                        <div className="hidden lg:block h-8 w-[1px] bg-gray-200 mx-4"></div>

                        <FilterButton
                            categories={styleCategories}
                            selectedCategories={selectedCategories}
                            onCategoryChange={handleCategoryChange}
                            onClearAll={handleClearAllFilters}
                        />
                    </div>
                </div>

                {/* Content Section */}
                <div className="py-8">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-20 gap-4">
                            <div className="w-12 h-12 border-4 border-[#D4A373] border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-gray-500 font-medium animate-pulse">Finding perfect stays...</p>
                        </div>
                    ) : (
                        <div>
                            {activeCategory === 'featured' && !heroSearchResults ? (
                                // Grouped by category view
                                <div className="space-y-16">
                                    {categoryTabs.slice(1).map((cat) => {
                                        const catProps = filteredProperties.filter(p => p.category === cat.id);
                                        if (catProps.length === 0) return null;

                                        return (
                                            <div key={cat.id}>
                                                <div className="flex items-center justify-between mb-8">
                                                    <div>
                                                        <h2 className="text-2xl font-bold text-[#1B2430] flex items-center gap-2">
                                                            <cat.icon className="w-6 h-6 text-[#C5A373]" />
                                                            {cat.label}
                                                        </h2>
                                                        <p className="text-gray-500 text-sm mt-1">
                                                            Discover our best {cat.label.toLowerCase()} properties
                                                        </p>
                                                    </div>
                                                    <button
                                                        onClick={() => setActiveCategory(cat.id)}
                                                        className="text-[#C5A373] font-bold text-sm flex items-center gap-1 hover:underline"
                                                    >
                                                        View all <ArrowRight className="w-4 h-4" />
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                                                    {catProps.slice(0, 4).map((p) => (
                                                        <PropertyCard key={p.id} property={p} authenticated={isAuthenticated} />
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                // Standard filtered view
                                <div>
                                    <div className="flex items-center justify-between mb-8">
                                        <div>
                                            <h2 className="text-2xl font-bold text-[#1B2430]">
                                                {heroSearchResults ? 'Search Results' :
                                                    categoryTabs.find(t => t.id === activeCategory)?.label}
                                            </h2>
                                            <p className="text-gray-500 text-sm mt-1">
                                                {filteredProperties.length} stunning properties found
                                            </p>
                                        </div>
                                        {filteredProperties.length > 4 && (
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => scroll('left')}
                                                    className="p-2.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                                                >
                                                    <ChevronLeft className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => scroll('right')}
                                                    className="p-2.5 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors shadow-sm"
                                                >
                                                    <ChevronRight className="w-5 h-5" />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    {filteredProperties.length > 0 ? (
                                        <div
                                            ref={scrollRef}
                                            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8"
                                        >
                                            {filteredProperties.map((p) => (
                                                <PropertyCard key={p.id} property={p} authenticated={isAuthenticated} />
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-center py-20 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
                                            <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                                <Sparkles className="w-10 h-10 text-gray-300" />
                                            </div>
                                            <h3 className="text-xl font-bold text-[#1B2430]">No properties found</h3>
                                            <p className="text-gray-500 mt-2">Try adjusting your search query or filters</p>
                                            <button
                                                onClick={() => {
                                                    handleClearSearch();
                                                    handleClearAllFilters();
                                                }}
                                                className="mt-6 px-6 py-2.5 bg-[#1B2430] text-white rounded-full font-bold hover:shadow-lg transition-all"
                                            >
                                                Reset everything
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Property Status Modal */}
            <AnimatePresence>
                {showStatus && (
                    <PropertyStatus
                        statuses={statusData}
                        initialIndex={statusInitialIndex}
                        onClose={() => setShowStatus(false)}
                        onViewDetails={handleViewDetails}
                    />
                )}
            </AnimatePresence>
        </Layout>
    );
};

export default VacationHub;
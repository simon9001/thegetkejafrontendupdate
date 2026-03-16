// frontend/src/components/Search/SearchModal.tsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, MapPin, Search, Navigation, Building, Ruler } from 'lucide-react';
import { useLazySearchByRadiusQuery } from '../../features/Api/SpatialApi';

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSearch: (params: { lat: number; lng: number; radius: number, maxPrice?: number, minBedrooms?: number, q?: string }) => void;
}

const locations = [
    { name: 'Embu Town', lat: -0.5300, lng: 37.4500 },
    { name: 'University Area', lat: -0.5142, lng: 37.4592 },
    { name: 'Majengo', lat: -0.5350, lng: 37.4450 },
    { name: 'Dallas', lat: -0.5400, lng: 37.4550 },
];

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSearch }) => {
    const [selectedLocation, setSelectedLocation] = useState(locations[1]);
    const [radius, setRadius] = useState(2000);
    const [maxPrice, setMaxPrice] = useState<number>(10000);
    const [minBedrooms, setMinBedrooms] = useState<number>(1);
    const [advancedQuery, setAdvancedQuery] = useState('');

    const [triggerSearch, { data: searchPreview, isFetching }] = useLazySearchByRadiusQuery();

    useEffect(() => {
        if (isOpen) {
            triggerSearch({
                lat: selectedLocation.lat,
                lng: selectedLocation.lng,
                radius,
                maxPrice: maxPrice < 50000 ? maxPrice : undefined,
                minBedrooms,
                q: advancedQuery.trim() || undefined
            });
        }
    }, [isOpen, selectedLocation, radius, maxPrice, minBedrooms, advancedQuery, triggerSearch]);

    const handleSearch = () => {
        onSearch({
            lat: selectedLocation.lat,
            lng: selectedLocation.lng,
            radius,
            maxPrice: maxPrice < 50000 ? maxPrice : undefined,
            minBedrooms,
            q: advancedQuery.trim() || undefined
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-24 left-1/2 -translate-x-1/2 w-full max-w-2xl bg-white rounded-3xl shadow-2xl z-[70] overflow-hidden max-h-[85vh] overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-[#1B2430]">Find your next home</h2>
                            <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition">
                                <X className="w-5 h-5 text-gray-500" />
                            </button>
                        </div>

                        <div className="p-8 space-y-8">
                            {/* Location Selection */}
                            <div className="space-y-4">
                                <label className="flex items-center gap-2 text-sm font-semibold text-[#1B2430]">
                                    <MapPin className="w-4 h-4 text-[#D4A373]" />
                                    Select Area
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {locations.map((loc) => (
                                        <button
                                            key={loc.name}
                                            onClick={() => setSelectedLocation(loc)}
                                            className={`p-3 rounded-2xl border-2 transition text-center ${selectedLocation.name === loc.name
                                                ? 'border-[#D4A373] bg-[#D4A373]/5 text-[#D4A373]'
                                                : 'border-gray-100 hover:border-gray-200 text-gray-600'
                                                }`}
                                        >
                                            <span className="text-xs font-medium">{loc.name}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Radius Slider */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-[#1B2430]">
                                            <Ruler className="w-4 h-4 text-[#D4A373]" />
                                            Search Radius
                                        </label>
                                        <span className="text-sm font-bold text-[#D4A373]">
                                            {(radius / 1000).toFixed(1)} km
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="500"
                                        max="10000"
                                        step="500"
                                        value={radius}
                                        onChange={(e) => setRadius(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#D4A373]"
                                    />
                                </div>

                                {/* Budget Slider */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-[#1B2430]">
                                            <Building className="w-4 h-4 text-[#D3A373]" />
                                            Max Budget
                                        </label>
                                        <span className="text-sm font-bold text-[#D4A373]">
                                            {maxPrice >= 50000 ? 'Any' : `KES ${maxPrice.toLocaleString()}`}
                                        </span>
                                    </div>
                                    <input
                                        type="range"
                                        min="2000"
                                        max="50000"
                                        step="1000"
                                        value={maxPrice}
                                        onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                                        className="w-full h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-[#D4A373]"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Bedrooms Selector */}
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1B2430]">
                                        <div className="w-4 h-4 flex items-center justify-center">
                                            <span className="text-lg font-bold text-[#D4A373]">1</span>
                                        </div>
                                        Min Bedrooms
                                    </label>
                                    <div className="flex gap-2">
                                        {[1, 2, 3, 4, 5].map((num) => (
                                            <button
                                                key={num}
                                                onClick={() => setMinBedrooms(num)}
                                                className={`flex-1 py-2 rounded-xl border text-sm font-bold transition ${minBedrooms === num
                                                    ? 'bg-[#1B2430] text-white border-[#1B2430]'
                                                    : 'bg-white text-gray-500 border-gray-200 hover:border-[#D4A373]'
                                                    }`}
                                            >
                                                {num === 5 ? '5+' : num}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Advanced Query */}
                                <div className="space-y-4">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-[#1B2430]">
                                        <Search className="w-4 h-4 text-[#D4A373]" />
                                        What are you looking for?
                                    </label>
                                    <input
                                        type="text"
                                        placeholder="e.g. near chiefs office, one bedroom..."
                                        value={advancedQuery}
                                        onChange={(e) => setAdvancedQuery(e.target.value)}
                                        className="w-full px-4 py-2 bg-gray-50 border border-gray-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A373]/20 focus:border-[#D4A373]"
                                    />
                                </div>
                            </div>

                            {/* Live Preview / Count */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-xl shadow-sm">
                                        <Building className="w-6 h-6 text-[#D4A373]" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Available properties</p>
                                        <p className="text-2xl font-bold text-[#1B2430]">
                                            {isFetching ? '...' : searchPreview?.count || 0}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">PostGIS Accuracy</p>
                                    <div className="flex items-center gap-1 text-green-500 justify-end">
                                        <Navigation className="w-3 h-3" />
                                        <span className="text-[10px] font-bold">Precise</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={handleSearch}
                                className="w-full py-4 bg-[#1B2430] hover:bg-black text-white font-bold rounded-2xl transition flex items-center justify-center gap-2"
                            >
                                <Search className="w-5 h-5" />
                                Show {isFetching ? '' : searchPreview?.count || 0} Results
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

export default SearchModal;

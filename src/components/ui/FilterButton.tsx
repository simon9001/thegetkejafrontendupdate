// frontend/src/components/ui/FilterButton.tsx
import React, { useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FilterButtonProps {
    categories: string[];
    selectedCategories: string[];
    onCategoryChange: (category: string) => void;
    onClearAll: () => void;
}

const FilterButton: React.FC<FilterButtonProps> = ({
    categories,
    selectedCategories,
    onCategoryChange,
    onClearAll,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-full shadow-sm hover:shadow-md transition"
            >
                <SlidersHorizontal className="w-4 h-4 text-[#1B2430]" />
                <span className="text-sm font-medium">Filter</span>
                {selectedCategories.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-[#D4A373] text-white text-xs rounded-full">
                        {selectedCategories.length}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-xl z-50 border border-gray-100"
                    >
                        <div className="p-4">
                            <div className="flex items-center justify-between mb-3">
                                <h3 className="font-semibold text-[#1B2430]">
                                    Filter by category
                                </h3>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1 hover:bg-gray-100 rounded-full transition"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {categories.map((category) => (
                                    <label
                                        key={category}
                                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg cursor-pointer"
                                    >
                                        <span className="text-sm text-[#1B2430]">{category}</span>
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(category)}
                                            onChange={() => onCategoryChange(category)}
                                            className="w-4 h-4 text-[#D4A373] rounded focus:ring-[#D4A373]"
                                        />
                                    </label>
                                ))}
                            </div>

                            {selectedCategories.length > 0 && (
                                <button
                                    onClick={onClearAll}
                                    className="mt-4 w-full py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition"
                                >
                                    Clear all filters
                                </button>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default FilterButton;
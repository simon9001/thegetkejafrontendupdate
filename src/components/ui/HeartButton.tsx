// frontend/src/components/ui/HeartButton.tsx
import React, { useState, useEffect } from 'react';
import { Heart } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { toggleSaved } from '../../features/Slice/SavedPropertiesSlice';
import { motion, AnimatePresence } from 'framer-motion';

interface HeartButtonProps {
    property: any; // Allow real API property data
    className?: string;
    size?: 'sm' | 'md' | 'lg';
}

const HeartButton: React.FC<HeartButtonProps> = ({
    property,
    className = '',
    size = 'md'
}) => {
    const dispatch = useDispatch();
    const savedItems = useSelector((state: RootState) => state.savedProperties?.items || []);
    const [isSaved, setIsSaved] = useState(false);
    const [showAnimation, setShowAnimation] = useState(false);

    // Check if property is saved
    useEffect(() => {
        setIsSaved(savedItems.some(item => item.id === property.id));
    }, [savedItems, property.id]);

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();
        dispatch(toggleSaved(property));
        setShowAnimation(true);
        setTimeout(() => setShowAnimation(false), 600);
    };

    const sizeClasses = {
        sm: 'w-7 h-7',
        md: 'w-9 h-9',
        lg: 'w-11 h-11',
    };

    return (
        <div className="relative z-20">
            <button
                onClick={handleClick}
                className={`relative ${sizeClasses[size]} rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-all duration-300 flex items-center justify-center ${className}`}
            >
                <Heart
                    className={`w-5 h-5 lg:w-6 lg:h-6 transition-all duration-300 ${isSaved
                            ? 'fill-red-500 text-red-500 scale-110'
                            : 'text-[#1B2430] hover:text-red-400 hover:scale-110'
                        }`}
                />
            </button>

            {/* Heart Burst Animation */}
            <AnimatePresence>
                {showAnimation && (
                    <motion.div
                        initial={{ scale: 0, opacity: 1 }}
                        animate={{ scale: 2, opacity: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.6 }}
                        className="absolute inset-0 pointer-events-none flex items-center justify-center"
                    >
                        <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    x: 0,
                                    y: 0,
                                    opacity: 1,
                                    rotate: i * 45
                                }}
                                animate={{
                                    x: Math.cos(i * 45 * Math.PI / 180) * 40,
                                    y: Math.sin(i * 45 * Math.PI / 180) * 40,
                                    opacity: 0
                                }}
                                transition={{ duration: 0.6 }}
                                className="absolute top-1/2 left-1/2 w-1.5 h-1.5 bg-red-500 rounded-full"
                            />
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default HeartButton;
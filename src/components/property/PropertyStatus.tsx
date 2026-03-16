// frontend/src/components/property/PropertyStatus.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Grid, Play, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { type Status } from '../../data/statusData';

interface PropertyStatusProps {
    statuses: Status[];
    initialIndex?: number;
    onClose: () => void;
    onViewDetails: (propertyId: number) => void;
}

const PropertyStatus: React.FC<PropertyStatusProps> = ({
    statuses,
    initialIndex = 0,
    onClose,
    onViewDetails,
}) => {
    const [currentStatusIndex, setCurrentStatusIndex] = useState(initialIndex);
    const [currentMediaIndex, setCurrentMediaIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [showGallery, setShowGallery] = useState(false);
    const [isLongPressing, setIsLongPressing] = useState(false);
    const [galleryStartIndex, setGalleryStartIndex] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);
    // Use ReturnType<typeof setTimeout> instead of NodeJS.Timeout
    const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const progressRef = useRef<number>(0);

    const currentStatus = statuses[currentStatusIndex];
    const currentMedia = currentStatus?.media[currentMediaIndex];
    const hasMultipleMedia = currentStatus?.media.length > 1;
    const STATUS_DURATION = 30; // 30 seconds

    // Progress bar animation
    useEffect(() => {
        if (isPaused || !currentStatus) return;

        const startTime = Date.now() - (progress * STATUS_DURATION * 1000);

        const interval = setInterval(() => {
            const elapsed = (Date.now() - startTime) / 1000;
            const newProgress = Math.min(elapsed / STATUS_DURATION, 1);

            if (newProgress >= 1) {
                // Move to next status or media
                if (currentMediaIndex < currentStatus.media.length - 1) {
                    // Next media in same status
                    setCurrentMediaIndex(prev => prev + 1);
                    setProgress(0);
                    progressRef.current = 0;
                } else if (currentStatusIndex < statuses.length - 1) {
                    // Next status
                    setCurrentStatusIndex(prev => prev + 1);
                    setCurrentMediaIndex(0);
                    setProgress(0);
                    progressRef.current = 0;
                } else {
                    // No more statuses, close
                    onClose();
                }
            } else {
                setProgress(newProgress);
                progressRef.current = newProgress;
            }
        }, 100);

        return () => clearInterval(interval);
    }, [currentStatusIndex, currentMediaIndex, isPaused, currentStatus, statuses.length, onClose, progress]);

    // Handle video playback
    useEffect(() => {
        if (videoRef.current && currentMedia?.type === 'video') {
            if (isPaused) {
                videoRef.current.pause();
            } else {
                videoRef.current.play().catch(error => {
                    console.log('Video playback failed:', error);
                });
            }
        }
    }, [isPaused, currentMedia]);

    // Handle navigation
    const handleNext = useCallback(() => {
        if (!currentStatus) return;

        if (currentMediaIndex < currentStatus.media.length - 1) {
            setCurrentMediaIndex(prev => prev + 1);
            setProgress(0);
        } else if (currentStatusIndex < statuses.length - 1) {
            setCurrentStatusIndex(prev => prev + 1);
            setCurrentMediaIndex(0);
            setProgress(0);
        }
    }, [currentStatusIndex, currentMediaIndex, currentStatus, statuses.length]);

    const handlePrevious = useCallback(() => {
        if (!currentStatus) return;

        if (currentMediaIndex > 0) {
            setCurrentMediaIndex(prev => prev - 1);
            setProgress(0);
        } else if (currentStatusIndex > 0) {
            const prevStatus = statuses[currentStatusIndex - 1];
            setCurrentStatusIndex(prev => prev - 1);
            setCurrentMediaIndex(prevStatus.media.length - 1);
            setProgress(0);
        }
    }, [currentStatusIndex, currentMediaIndex, statuses, currentStatus]);

    // Handle tap areas
    const handleTap = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;

        if (x < rect.width * 0.3) {
            handlePrevious();
        } else if (x > rect.width * 0.7) {
            handleNext();
        }
    };

    // Handle long press
    const handleMouseDown = () => {
        longPressTimerRef.current = setTimeout(() => {
            setIsLongPressing(true);
            setIsPaused(true);
        }, 300);
    };

    const handleMouseUp = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
        if (isLongPressing) {
            setIsLongPressing(false);
            setIsPaused(false);
        }
    };

    const handleMouseLeave = () => {
        if (longPressTimerRef.current) {
            clearTimeout(longPressTimerRef.current);
            longPressTimerRef.current = null;
        }
        if (isLongPressing) {
            setIsLongPressing(false);
            setIsPaused(false);
        }
    };

    // Handle gallery
    const handleViewAllImages = () => {
        setIsPaused(true);
        setGalleryStartIndex(currentMediaIndex);
        setShowGallery(true);
    };

    const handleCloseGallery = () => {
        setShowGallery(false);
        setIsPaused(false);
    };

    const handleViewDetails = () => {
        setIsPaused(true);
        onViewDetails(currentStatus.propertyId);
    };

    if (!currentStatus) return null;

    return (
        <>
            {/* Main Status View */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 bg-black touch-none"
            >
                {/* Progress Bars */}
                <div className="absolute top-0 left-0 right-0 z-10 flex gap-1 p-2">
                    {currentStatus.media.map((_, idx) => (
                        <div
                            key={idx}
                            className="flex-1 h-1 bg-gray-600 rounded-full overflow-hidden"
                        >
                            <motion.div
                                className="h-full bg-white"
                                initial={{ width: 0 }}
                                animate={{
                                    width: idx === currentMediaIndex
                                        ? `${progress * 100}%`
                                        : idx < currentMediaIndex
                                            ? '100%'
                                            : '0%'
                                }}
                                transition={{ duration: 0.1 }}
                            />
                        </div>
                    ))}
                </div>

                {/* Status Header */}
                <div className="absolute top-6 left-0 right-0 z-10 flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#D4A373]">
                            <img
                                src={currentStatus.owner.avatar}
                                alt={currentStatus.owner.name}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-semibold text-white">
                                    {currentStatus.owner.name}
                                </span>
                                {currentStatus.owner.verified && (
                                    <span className="text-[#D4A373] text-xs">✓</span>
                                )}
                                <span className="text-xs text-gray-300">
                                    {new Date(currentStatus.postedAt).toLocaleDateString()}
                                </span>
                            </div>
                            <p className="text-sm text-gray-300">
                                {currentStatus.propertyTitle}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
                    >
                        <X className="w-5 h-5 text-white" />
                    </button>
                </div>

                {/* Status Content */}
                <div
                    className="w-full h-full"
                    onClick={handleTap}
                    onMouseDown={handleMouseDown}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    onTouchStart={handleMouseDown}
                    onTouchEnd={handleMouseUp}
                    onTouchCancel={handleMouseLeave}
                >
                    {currentMedia.type === 'video' ? (
                        <video
                            ref={videoRef}
                            src={currentMedia.url}
                            className="w-full h-full object-contain"
                            loop={false}
                            playsInline
                        />
                    ) : (
                        <img
                            src={currentMedia.url}
                            alt=""
                            className="w-full h-full object-contain"
                        />
                    )}
                </div>

                {/* Bottom Actions */}
                <div className="absolute bottom-6 left-0 right-0 z-10 flex items-center justify-between px-4">
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-1 p-2 bg-black/50 rounded-full hover:bg-black/70 transition">
                            <Eye className="w-5 h-5 text-white" />
                            <span className="text-white text-sm">
                                {currentStatus.views}
                            </span>
                        </button>
                        {hasMultipleMedia && (
                            <button
                                onClick={handleViewAllImages}
                                className="flex items-center gap-2 px-4 py-2 bg-black/50 rounded-full hover:bg-black/70 transition"
                            >
                                <Grid className="w-4 h-4 text-white" />
                                <span className="text-white text-sm">
                                    View all ({currentStatus.media.length})
                                </span>
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handleViewDetails}
                        className="px-6 py-2 bg-[#D4A373] text-white rounded-full font-medium hover:bg-[#E6B17E] transition"
                    >
                        View Details
                    </button>
                </div>

                {/* Pause Indicator */}
                {isPaused && !showGallery && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                        <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center">
                            <Play className="w-8 h-8 text-white ml-1" />
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Gallery Modal */}
            <AnimatePresence>
                {showGallery && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black"
                    >
                        {/* Gallery Header */}
                        <div className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between p-4">
                            <button
                                onClick={handleCloseGallery}
                                className="p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
                            >
                                <X className="w-5 h-5 text-white" />
                            </button>
                            <span className="text-white font-medium">
                                {galleryStartIndex + 1} / {currentStatus.media.length}
                            </span>
                        </div>

                        {/* Gallery Content */}
                        <div className="w-full h-full flex items-center justify-center">
                            <img
                                src={currentStatus.media[galleryStartIndex].url}
                                alt=""
                                className="max-w-full max-h-full object-contain"
                            />
                        </div>

                        {/* Gallery Navigation */}
                        {galleryStartIndex > 0 && (
                            <button
                                onClick={() => setGalleryStartIndex(prev => prev - 1)}
                                className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
                            >
                                <ChevronLeft className="w-6 h-6 text-white" />
                            </button>
                        )}
                        {galleryStartIndex < currentStatus.media.length - 1 && (
                            <button
                                onClick={() => setGalleryStartIndex(prev => prev + 1)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition"
                            >
                                <ChevronRight className="w-6 h-6 text-white" />
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default PropertyStatus;
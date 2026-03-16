// frontend/src/pages/SavedProperties.tsx
import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Heart, Trash2, Home, Building2, Hotel, Calendar, Star, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/layout/Layout';
import type { RootState } from '../../store/store';
import { removeFromSaved, clearSaved } from '../../features/Slice/SavedPropertiesSlice';
import { motion, AnimatePresence } from 'framer-motion';

const SavedProperties: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { items: savedProperties } = useSelector((state: RootState) => state.savedProperties);
    const { isAuthenticated } = useSelector((state: RootState) => state.authSlice);

    useEffect(() => {
        // If not authenticated, redirect to login
        if (!isAuthenticated && savedProperties.length > 0) {
            // You might want to show a login prompt instead
            console.log('Please login to sync your saved properties');
        }
    }, [isAuthenticated, savedProperties.length]);

    const handleRemove = (propertyId: number) => {
        dispatch(removeFromSaved(propertyId));
    };

    const handleClearAll = () => {
        if (window.confirm('Are you sure you want to clear all saved properties?')) {
            dispatch(clearSaved());
        }
    };

    const handlePropertyClick = (propertyId: number, type: string) => {
        switch(type) {
            case 'commercial':
                navigate(`/commercial-property/${propertyId}`);
                break;
            case 'event':
                navigate(`/event-space/${propertyId}`);
                break;
            default:
                navigate(`/property/${propertyId}`);
        }
    };

    const getPropertyIcon = (type: string) => {
        switch(type) {
            case 'commercial': return Building2;
            case 'event': return Calendar;
            case 'hotel': return Hotel;
            default: return Home;
        }
    };

    return (
        <Layout showSearch={true}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => navigate(-1)}
                            className="p-2 hover:bg-gray-100 rounded-full transition"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl lg:text-3xl font-bold text-[#1B2430]">
                                Saved Properties
                            </h1>
                            <p className="text-gray-500 text-sm mt-1">
                                You have {savedProperties.length} saved {savedProperties.length === 1 ? 'property' : 'properties'}
                            </p>
                        </div>
                    </div>
                    
                    {savedProperties.length > 0 && (
                        <button
                            onClick={handleClearAll}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                            <Trash2 className="w-4 h-4" />
                            <span className="text-sm font-medium">Clear all</span>
                        </button>
                    )}
                </div>

                {/* Saved Properties Grid */}
                {savedProperties.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-24 h-24 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Heart className="w-12 h-12 text-gray-400" />
                        </div>
                        <h2 className="text-xl font-semibold text-[#1B2430] mb-2">
                            No saved properties yet
                        </h2>
                        <p className="text-gray-500 mb-6">
                            Start exploring and heart the properties you love
                        </p>
                        <button
                            onClick={() => navigate('/')}
                            className="px-6 py-3 bg-[#D4A373] text-white rounded-lg hover:bg-[#E6B17E] transition"
                        >
                            Explore properties
                        </button>
                    </div>
                ) : (
                    <AnimatePresence>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 lg:gap-6">
                            {savedProperties.map((property) => {
                                const Icon = getPropertyIcon(property.type);
                                return (
                                    <motion.div
                                        key={property.id}
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="group cursor-pointer relative"
                                        onClick={() => handlePropertyClick(property.id, property.type)}
                                    >
                                        {/* Image Container */}
                                        <div className="relative aspect-square rounded-lg lg:rounded-xl overflow-hidden">
                                            <img
                                                src={property.image}
                                                alt={property.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                                            />
                                            
                                            {/* Remove button */}
                                            <button 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleRemove(property.id);
                                                }}
                                                className="absolute top-2 right-2 p-2 bg-white/90 backdrop-blur-sm rounded-full hover:bg-red-50 transition group/remove"
                                            >
                                                <Heart className="w-4 h-4 fill-red-500 text-red-500" />
                                            </button>
                                            
                                            {/* Type Badge */}
                                            <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                                                <Icon className="w-3 h-3" />
                                                <span className="capitalize">{property.type}</span>
                                            </div>

                                            {/* Price Tag */}
                                            <div className="absolute bottom-2 left-2 bg-[#1B2430]/90 text-white px-2 py-1 rounded-lg text-sm font-semibold">
                                                ${property.price}
                                                <span className="text-xs text-gray-300 ml-1">
                                                    {property.type === 'commercial' ? '/day' : '/night'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Property Details */}
                                        <div className="mt-2">
                                            <div className="flex items-start justify-between">
                                                <h3 className="text-sm font-semibold text-[#1B2430] truncate max-w-[150px]">
                                                    {property.title}
                                                </h3>
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-3 h-3 fill-current text-[#D4A373]" />
                                                    <span className="text-xs font-medium">{property.rating}</span>
                                                </div>
                                            </div>
                                            
                                            {/* Dynamic details */}
                                            {property.bedrooms && (
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {property.bedrooms} beds · {property.bathrooms} baths
                                                </p>
                                            )}
                                            
                                            {property.capacity && (
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    {property.capacity}
                                                </p>
                                            )}
                                            
                                            {property.amenities && (
                                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                                    {property.amenities.slice(0, 2).join(' · ')}
                                                </p>
                                            )}
                                            
                                            {/* Saved date */}
                                            <p className="text-[10px] text-gray-400 mt-1">
                                                Saved on {new Date(property.savedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                    </AnimatePresence>
                )}

                {/* Login Prompt for Guest Users */}
                {!isAuthenticated && savedProperties.length > 0 && (
                    <div className="mt-8 p-4 bg-amber-50 rounded-lg text-center">
                        <p className="text-sm text-amber-800 mb-2">
                            Sign in to sync your saved properties across devices
                        </p>
                        <button
                            onClick={() => navigate('/login')}
                            className="px-4 py-2 bg-[#D4A373] text-white rounded-lg text-sm hover:bg-[#E6B17E] transition"
                        >
                            Sign in
                        </button>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default SavedProperties;
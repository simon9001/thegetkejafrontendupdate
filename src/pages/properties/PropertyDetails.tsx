import React, { useState, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Heart, Share2, Star, MapPin,
    Wifi, Car, Home, Ruler, Bed, Bath, Building2,
    CalendarDays, Shield, Eye, Clock, Sun, Award,
    BadgeCheck, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
    Layers, Navigation2, Monitor, Wind, Utensils,
    UserCircle, Droplets, Mountain, Sparkles,
    Truck, Users, X,
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
import { useGetPublicPropertyByIdQuery } from '../../features/Api/PropertiesApi';
import { 
  useCheckAvailabilityQuery, 
  useGetPriceQuoteQuery, 
  useCreateBookingMutation,
  useGetPropertyReviewsQuery
} from '../../features/Api/ShortStayApi';
import { useSavePropertyMutation, useRemoveSavedPropertyMutation, useGetSavedPropertiesQuery } from '../../features/Api/SavedPropertiesApi';
import { useStartConversationMutation } from '../../features/Api/ChatApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import CommercialPropertyDetails from './CommercialPropertyDetails';
import PropertyChat from '../../components/property/PropertyChat';
import { useGetMySubscriptionQuery } from '../../features/Api/SubscriptionsApi';
import { toast } from 'react-hot-toast';
import { PropertyShareModal } from '../../components/property/PropertyShareModal';
import { ProtectionDisclaimer } from '../../components/property/ImageProtection';
import { TenantTypeBadge } from '../../components/property/TenantTypePicker';
import { UtilitiesBreakdownCard } from '../../components/property/UtilitiesBreakdownCard';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const customMarkerIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const MemoizedMapView = React.memo(({ lat, lng, propertyTitle }: { lat: number; lng: number; propertyTitle: string }) => (
    <div className="h-[280px] w-full rounded-[14px] overflow-hidden border border-[#EAEAEA]">
        <MapContainer center={[lat, lng]} zoom={15} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]} icon={customMarkerIcon}>
                <Popup>{propertyTitle}</Popup>
            </Marker>
        </MapContainer>
    </div>
));

// Mobile-friendly fullscreen image gallery modal
const ImageGalleryModal: React.FC<{
    images: string[];
    initialIndex: number;
    onClose: () => void;
    title: string;
}> = ({ images, initialIndex, onClose, title }) => {
    const [currentIndex, setCurrentIndex] = useState(initialIndex);

    const handlePrev = useCallback(() => {
        setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
    }, [images.length]);

    const handleNext = useCallback(() => {
        setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
    }, [images.length]);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowLeft') handlePrev();
        if (e.key === 'ArrowRight') handleNext();
    }, [handlePrev, handleNext, onClose]);

    React.useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [handleKeyDown]);

    return (
        <div 
            className="fixed inset-0 z-50 bg-black/95 flex flex-col"
            onClick={(e) => e.target === e.currentTarget && onClose()}
        >
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/50">
                <button
                    onClick={onClose}
                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                    aria-label="Close gallery"
                >
                    <X className="w-5 h-5 text-white" />
                </button>
                <span className="text-white text-sm font-medium">
                    {currentIndex + 1} / {images.length}
                </span>
                <div className="w-10" /> {/* Spacer for alignment */}
            </div>

            {/* Main Image */}
            <div className="flex-1 flex items-center justify-center relative min-h-0">
                <img
                    src={images[currentIndex]}
                    alt={`${title} - Image ${currentIndex + 1}`}
                    className="max-w-full max-h-full object-contain"
                />
                
                {/* Navigation Buttons - Only show if more than 1 image */}
                {images.length > 1 && (
                    <>
                        <button
                            onClick={handlePrev}
                            className="absolute left-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 transition"
                            aria-label="Previous image"
                        >
                            <ChevronLeft className="w-6 h-6 text-white" />
                        </button>
                        <button
                            onClick={handleNext}
                            className="absolute right-4 w-10 h-10 rounded-full bg-white/10 backdrop-blur flex items-center justify-center hover:bg-white/20 transition"
                            aria-label="Next image"
                        >
                            <ChevronRight className="w-6 h-6 text-white" />
                        </button>
                    </>
                )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
                <div className="py-4 px-2 overflow-x-auto">
                    <div className="flex gap-2 justify-center min-w-max">
                        {images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentIndex(idx)}
                                className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all ${
                                    idx === currentIndex 
                                        ? 'ring-2 ring-[#DD6E42] opacity-100' 
                                        : 'opacity-60 hover:opacity-100'
                                }`}
                            >
                                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

// Responsive image gallery component
const ResponsiveImageGallery: React.FC<{
    images: string[];
    title: string;
}> = ({ images, title }) => {
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const openModal = (index: number) => {
        setSelectedImageIndex(index);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedImageIndex(null);
    };

    if (images.length === 0) return null;

    // Mobile: single column layout
    // Tablet/Desktop: grid layout
    if (images.length === 1) {
        return (
            <>
                <div 
                    className="relative w-full rounded-[14px] overflow-hidden cursor-pointer"
                    onClick={() => openModal(0)}
                >
                    <div className="aspect-[16/9]">
                        <img 
                            src={images[0]} 
                            alt={title} 
                            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
                        />
                    </div>
                </div>
                {isModalOpen && selectedImageIndex !== null && (
                    <ImageGalleryModal 
                        images={images} 
                        initialIndex={selectedImageIndex} 
                        onClose={closeModal} 
                        title={title}
                    />
                )}
            </>
        );
    }

    return (
        <>
            {/* Mobile layout (1 column, scrollable) - visible on small screens */}
            <div className="block md:hidden relative">
                <div className="relative overflow-x-auto snap-x snap-mandatory scrollbar-hide">
                    <div className="flex">
                        {images.map((img, idx) => (
                            <div 
                                key={idx}
                                className="w-full flex-shrink-0 snap-center aspect-[16/9] cursor-pointer"
                                onClick={() => openModal(idx)}
                            >
                                <img 
                                    src={img} 
                                    alt={`${title} - ${idx + 1}`} 
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        ))}
                    </div>
                </div>
                
                {/* Dot indicators - these are decorative now, but could be made interactive */}
                <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {images.map((_, idx) => (
                        <div 
                            key={idx}
                            className="w-1.5 h-1.5 rounded-full bg-white/60"
                        />
                    ))}
                </div>
                
                {/* Counter badge */}
                <div className="absolute bottom-4 right-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                    {images.length} photos
                </div>
            </div>

            {/* Desktop/Tablet layout (2x2 grid) - visible on medium screens and up */}
            <div className="hidden md:grid grid-cols-2 gap-2 rounded-[14px] overflow-hidden" style={{ minHeight: '460px' }}>
                {/* Large main image - first image */}
                <div 
                    className="relative cursor-pointer overflow-hidden row-span-2"
                    onClick={() => openModal(0)}
                >
                    <img
                        src={images[0]}
                        alt={title}
                        className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
                    />
                </div>
                
                {/* Right side grid */}
                <div className="grid grid-cols-2 gap-2">
                    {images.slice(1, 5).map((img, idx) => (
                        <div 
                            key={idx}
                            className="relative cursor-pointer overflow-hidden"
                            onClick={() => openModal(idx + 1)}
                        >
                            <img
                                src={img}
                                alt={`${title} - View ${idx + 2}`}
                                className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
                                style={{ aspectRatio: '1/1' }}
                            />
                            {/* Show "+X more" overlay on the last visible image if there are more */}
                            {idx === 3 && images.length > 5 && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <span className="text-white text-lg font-semibold">
                                        +{images.length - 5} more
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Fullscreen Modal */}
            {isModalOpen && selectedImageIndex !== null && (
                <ImageGalleryModal 
                    images={images} 
                    initialIndex={selectedImageIndex} 
                    onClose={closeModal} 
                    title={title}
                />
            )}
        </>
    );
};

const PropertyDetails: React.FC = () => {
    const { id = '' } = useParams();
    const { data: property, isLoading: isPropertyLoading } = useGetPublicPropertyByIdQuery(id);
    const realProperty = useMemo(() => property?.property, [property]);

    const lat = useMemo(() => realProperty?.location?.latitude || -1.2921, [realProperty]);
    const lng = useMemo(() => realProperty?.location?.longitude || 36.8219, [realProperty]);

    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);
    const [isBooking, setIsBooking] = useState(false);
    const [viewingDate, setViewingDate] = useState('');
    const [showShareModal, setShowShareModal] = useState(false);

    const { isAuthenticated, user: currentUser } = useSelector((state: RootState) => state.auth);

    // Subscription tier check — free tier users cannot contact landlords/caretakers
    const { data: mySub } = useGetMySubscriptionQuery(undefined, { skip: !isAuthenticated });
    const isFreeTier = !mySub || (mySub.plan?.price_monthly_kes === 0);

    // ── API Hooks ──
    const { data: savedProps } = useGetSavedPropertiesQuery(undefined, { skip: !isAuthenticated });
    const [saveProp] = useSavePropertyMutation();
    const [removeSaved] = useRemoveSavedPropertyMutation();
    const [createBooking] = useCreateBookingMutation();
    const [startConversation] = useStartConversationMutation();

    const isSaved = useMemo(() => savedProps?.some(p => p.id === Number(id)), [savedProps, id]);

    // Fast availability check
    const { data: availData } = useCheckAvailabilityQuery(
        { propertyId: id, checkIn, checkOut },
        { skip: !checkIn || !checkOut || id === '' }
    );

    // Server-side pricing quote
    useGetPriceQuoteQuery(
        { propertyId: id, checkIn, checkOut, guests },
        { skip: !checkIn || !checkOut || id === '' }
    );

    const { data: reviewsData } = useGetPropertyReviewsQuery({ propertyId: id }, { skip: id === '' });

    const propertyData = useMemo(() => {
        if (!realProperty) return null;
        
        // Handle images mapping
        const mediaImages = (realProperty.media ?? [])
            .filter((m: any) => m.media_type === 'photo')
            .map((m: any) => m.url);
        
        const displayImages = mediaImages.length > 0 ? mediaImages : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop'];

        return {
            id: realProperty.id,
            title: realProperty.title,
            description: realProperty.description,
            price: realProperty.pricing?.monthly_rent || realProperty.pricing?.asking_price || realProperty.short_term_config?.price_per_night || 0,
            currency: realProperty.pricing?.currency || 'KSh',
            location: [realProperty.location?.area, realProperty.location?.county].filter(Boolean).join(', ') || 'Kenya',
            fullAddress: [realProperty.location?.estate_name, realProperty.location?.road_street, realProperty.location?.area, realProperty.location?.county].filter(Boolean).join(', '),
            type: (realProperty.listing_type || 'Apartment').replace(/_/g, ' '),
            category: realProperty.listing_category,
            sizes: (realProperty as any).floor_area_sqm || (realProperty as any).plot_area_sqft || 0,
            bedrooms: realProperty.bedrooms || 0,
            bathrooms: realProperty.bathrooms || 0,
            floorLevel: (realProperty as any).rental_unit?.floor_level || 'N/A',
            furnished: realProperty.is_furnished || 'Unfurnished',
            yearBuilt: realProperty.year_built || 'N/A',
            internetSpeed: realProperty.internet_speed || 'Fiber Ready',
            images: displayImages,
            host: {
                id: realProperty.owner?.id,
                name: realProperty.owner?.full_name || 'Verified Host',
                avatar: realProperty.owner?.avatar_url || null,
                verified: (realProperty.owner as any)?.is_verified || false,
            },
            amenities: (realProperty.amenities ?? []).map((a: any) => ({
                name: a.name,
                icon: a.category === 'security' ? 'Shield' : a.category === 'recreation' ? 'Droplets' : 'Sparkles',
                details: a.notes
            })),
            status: {
                verifiedProperty: realProperty.status === 'verified' || realProperty.is_featured,
                views: realProperty.views_count || 0,
                dateListed: realProperty.created_at || new Date().toISOString(),
                construction: realProperty.construction_status,
                management: realProperty.management_model,
            },
            pricing: {
                cleaningFee: realProperty.short_term_config?.cleaning_fee || 0,
                serviceCharge: realProperty.pricing?.service_charge || 0,
                tax: 0,
                securityDeposit: realProperty.pricing?.deposit_amount || 0,
            },
            houseRules: [
                (realProperty as any).compound_is_gated ? 'Gated community' : 'Open compound',
                realProperty.is_furnished ? 'Furnished unit' : 'Unfurnished',
                `Parking: ${(realProperty as any).parking_spaces || 0} slots`,
                `Water: ${(realProperty as any).water_supply?.replace(/_/g, ' ') || 'Normal'}`,
            ],
            communityVibe: realProperty.description?.slice(0, 100) + '...',
            lightExposure: 'Excellent natural light and ventilation.',
        };
    }, [realProperty]);

    const getIconByName = (name: string) => {
        const icons: Record<string, any> = {
            Wifi, Car, Droplets, Monitor, Wind, Utensils, UserCircle, Mountain, Sparkles,
            Home, Ruler, Bed, Bath, Building2, CalendarDays, Shield, Eye, Clock, Sun, Navigation2,
        };
        return icons[name] || Sparkles;
    };

    const handleSaveToggle = useCallback(async () => {
        if (!isAuthenticated) return toast.error('Please login to save properties');
        if (!id) return toast.error('Property ID is required');
        
        try {
            if (isSaved) {
                await removeSaved({ propertyId: Number(id) }).unwrap();
                toast.success('Removed from saved');
            } else {
                await saveProp({ propertyId: Number(id) }).unwrap();
                toast.success('Property saved!');
            }
        } catch (err: any) {
            console.error('Save toggle error:', err);
            toast.error(err?.data?.message || err?.message || 'Action failed');
        }
    }, [isAuthenticated, isSaved, id, saveProp, removeSaved]);

    const handleReserve = useCallback(async () => {
        if (!isAuthenticated) return toast.error('Please login to book');
        if (!checkIn || !checkOut) return toast.error('Please select dates');
        if (availData?.available === false) return toast.error(availData.reason || 'Dates are not available');

        setIsBooking(true);
        try {
            await createBooking({
                property_id: id,
                check_in_date: checkIn,
                check_out_date: checkOut,
                guests_count: guests,
                guest_name: fullName || currentUser?.full_name,
                guest_phone: phoneNumber || currentUser?.phone
            }).unwrap();
            
            toast.success('Booking initiated! Check your messages for payment details.');
        } catch (err: any) {
            toast.error(err?.data?.message || 'Booking failed. Try again.');
        } finally {
            setIsBooking(false);
        }
    }, [isAuthenticated, checkIn, checkOut, availData, id, guests, fullName, phoneNumber, currentUser, createBooking]);

    const handleScheduleViewing = useCallback(async () => {
        if (!isAuthenticated) return toast.error('Please login to schedule a viewing');
        if (!viewingDate) return toast.error('Please select a preferred viewing date');
        if (!fullName.trim()) return toast.error('Please enter your full name');
        if (!phoneNumber.trim()) return toast.error('Please enter your phone number');
        const hostId = realProperty?.owner?.id;
        if (!hostId) return toast.error('Owner information unavailable');

        const dateLabel = new Date(viewingDate).toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const message = `Hi, I'd like to schedule a viewing for this property on ${dateLabel}. My name is ${fullName.trim()} and my phone number is ${phoneNumber.trim()}.`;

        setIsBooking(true);
        try {
            await startConversation({
                property_id: id,
                recipient_id: hostId,
                initial_message: message,
                type: 'property_enquiry',
            }).unwrap();
            toast.success('Viewing request sent! Check your messages for the owner\'s reply.');
            setViewingDate('');
            setFullName('');
            setPhoneNumber('');
        } catch (err: any) {
            toast.error(err?.data?.message || 'Failed to send viewing request. Try again.');
        } finally {
            setIsBooking(false);
        }
    }, [isAuthenticated, viewingDate, fullName, phoneNumber, realProperty?.owner?.id, id, startConversation]);

    if (isPropertyLoading) {
        return (
            <Layout showSearch={false}>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-10 h-10 border-[3px] border-[#DD6E42] border-t-transparent rounded-full animate-spin" />
                </div>
            </Layout>
        );
    }

    if (!realProperty) {
        return (
            <Layout showSearch={false}>
                <div className="text-center py-24">
                    <h2 className="text-2xl font-semibold text-[#50757A]">Property not found</h2>
                    <p className="text-[#50757A] mt-2 text-sm">This listing may have been removed or doesn't exist.</p>
                </div>
            </Layout>
        );
    }

    if (realProperty.listing_category === 'commercial') {
        return <CommercialPropertyDetails />;
    }

    if (!propertyData) return null;

    return (
        <>
        <Layout showSearch={false}>
            <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">

                {/* ── Title row ─────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-2xl sm:text-[26px] font-semibold text-[#50757A] tracking-[-0.44px]">
                            {propertyData.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm text-[#50757A]">
                            {propertyData.status.verifiedProperty && (
                                <>
                                    <span className="text-[#50757A]">·</span>
                                    <BadgeCheck className="w-4 h-4 text-[#DD6E42]" />
                                    <span className="text-[#DD6E42] font-medium">Verified</span>
                                </>
                            )}
                            <span className="text-[#50757A]">·</span>
                            <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-[#50757A]" />
                                <span className="underline cursor-pointer hover:text-[#50757A] text-sm">{propertyData.fullAddress || propertyData.location}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button
                            onClick={() => setShowShareModal(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-[#EAEAEA] transition-colors text-sm font-semibold text-[#50757A]"
                        >
                            <Share2 className="w-4 h-4" />
                            <span className="hidden sm:inline">Share</span>
                        </button>
                        <button 
                            onClick={handleSaveToggle}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-sm font-semibold ${
                                isSaved ? 'bg-red-50 text-[#DD6E42]' : 'hover:bg-[#EAEAEA] text-[#50757A]'
                            }`}
                        >
                            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                            <span className="hidden sm:inline">{isSaved ? 'Saved' : 'Save'}</span>
                        </button>
                    </div>
                </div>

                {/* ── Mobile-friendly responsive image gallery ────────────────────────────── */}
                <div className="mb-4 relative">
                    <ResponsiveImageGallery 
                        images={propertyData.images} 
                        title={propertyData.title}
                    />
                </div>
                <ProtectionDisclaimer />

                {/* ── Main 2-col layout ─────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6 lg:gap-12">

                    {/* Left column */}
                    <div className="space-y-6 sm:space-y-8 min-w-0">

                        {/* Host row */}
                        <div className="flex items-center justify-between pb-6 border-b border-[#EAEAEA]">
                            <div>
                                <h2 className="text-lg sm:text-xl font-semibold text-[#50757A]">
                                    Hosted by {propertyData.host.name}
                                </h2>
                                <p className="text-[#50757A] text-sm mt-0.5">
                                    {propertyData.bedrooms} bed · {propertyData.bathrooms} bath · {propertyData.type}
                                </p>
                            </div>
                            <div className="relative shrink-0">
                                {propertyData.host.avatar ? (
                                    <img
                                        src={propertyData.host.avatar}
                                        alt={propertyData.host.name}
                                        className="w-12 h-12 sm:w-14 sm:h-14 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#EAEAEA] flex items-center justify-center">
                                        <UserCircle className="w-6 h-6 sm:w-8 sm:h-8 text-[#50757A]" />
                                    </div>
                                )}
                                {propertyData.host.verified && (
                                    <BadgeCheck className="w-4 h-4 text-[#DD6E42] absolute bottom-0 right-0" />
                                )}
                            </div>
                        </div>

                        {/* Host highlights */}
                        <div className="space-y-4 pb-6 border-b border-[#EAEAEA]">
                            <div className="flex items-start gap-4">
                                <BadgeCheck className="w-5 h-5 sm:w-6 sm:h-6 text-[#50757A] shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-[#50757A]">{propertyData.host.name} is a Superhost</p>
                                    <p className="text-sm text-[#50757A]">Superhosts are experienced, highly rated hosts who are committed to providing great stays.</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#50757A] shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-[#50757A]">Great location</p>
                                    <p className="text-sm text-[#50757A]">{propertyData.communityVibe}</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4">
                                <Eye className="w-5 h-5 sm:w-6 sm:h-6 text-[#50757A] shrink-0 mt-0.5" />
                                <div>
                                    <p className="text-sm font-semibold text-[#50757A]">{propertyData.status.views} views</p>
                                    <p className="text-sm text-[#50757A]">
                                        Listed {new Date(propertyData.status.dateListed).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {propertyData.description && (
                            <div className="pb-6 border-b border-[#EAEAEA]">
                                <p className="text-[#50757A] text-sm leading-relaxed">{propertyData.description}</p>
                            </div>
                        )}

                        {/* Property facts grid — fields adapt to listing category & type */}
                        <div className="pb-6 border-b border-[#EAEAEA]">
                            <h3 className="text-lg sm:text-xl font-semibold text-[#50757A] mb-4">Property details</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                                {(() => {
                                    const cat  = realProperty.listing_category;
                                    const type = realProperty.listing_type;
                                    const stc  = (realProperty as any).short_term_config ?? {};
                                    const ru   = (realProperty as any).rental_unit ?? {};
                                    const pd   = (realProperty as any).plot_details ?? {};
                                    const op   = (realProperty as any).offplan_details ?? {};
                                    const fmt  = (v: any) => v != null && v !== '' ? String(v).replace(/_/g, ' ') : '—';

                                    // ── Short-term rent ────────────────────────────────
                                    if (cat === 'short_term_rent') return [
                                        { icon: Home,        label: 'Property type',    value: fmt(type) },
                                        { icon: Sun,         label: 'Stay type',        value: fmt(stc.short_term_type) },
                                        { icon: Bed,         label: 'Max guests',       value: stc.max_guests ?? '—' },
                                        { icon: CalendarDays,label: 'Min nights',       value: stc.min_nights ?? 1 },
                                        { icon: Clock,       label: 'Check-in',         value: stc.check_in_time  ? String(stc.check_in_time).slice(0,5)  : '14:00' },
                                        { icon: Clock,       label: 'Check-out',        value: stc.check_out_time ? String(stc.check_out_time).slice(0,5) : '10:00' },
                                        { icon: Ruler,       label: 'Size',             value: (realProperty as any).floor_area_sqm ? `${(realProperty as any).floor_area_sqm} m²` : '—' },
                                        { icon: Layers,      label: 'Furnished',        value: fmt(realProperty.is_furnished) },
                                    ];

                                    // ── For sale ──────────────────────────────────────
                                    if (cat === 'for_sale') {
                                        // Plot / land
                                        if (type === 'plot') return [
                                            { icon: Ruler,       label: 'Size (acres)',   value: pd.size_acres ?? '—' },
                                            { icon: Ruler,       label: 'Size (sqft)',    value: pd.size_sqft  ?? '—' },
                                            { icon: Mountain,    label: 'Terrain',        value: fmt(pd.terrain) },
                                            { icon: Home,        label: 'Zoning',         value: fmt(pd.zoning_use) },
                                            { icon: Layers,      label: 'Road frontage',  value: pd.road_frontage_m ? `${pd.road_frontage_m} m` : '—' },
                                            { icon: Shield,      label: 'Serviced',       value: pd.is_serviced ? 'Yes' : 'No' },
                                            { icon: CalendarDays,label: 'Payment plan',   value: pd.payment_plan_available ? 'Available' : 'Not available' },
                                            { icon: Building2,   label: 'Corner plot',    value: pd.is_corner_plot ? 'Yes' : 'No' },
                                        ];
                                        // Off-plan
                                        if (type === 'off_plan') return [
                                            { icon: Building2,   label: 'Project',        value: fmt(op.project_name) },
                                            { icon: UserCircle,  label: 'Developer',      value: fmt(op.developer_name) },
                                            { icon: CalendarDays,label: 'Completion',      value: fmt(op.completion_quarter) },
                                            { icon: Layers,      label: 'Completion %',   value: op.construction_pct != null ? `${op.construction_pct}%` : '—' },
                                            { icon: Building2,   label: 'Total units',    value: op.total_units_in_project ?? '—' },
                                            { icon: Bed,         label: 'Bedrooms',       value: realProperty.bedrooms ?? '—' },
                                            { icon: Bath,        label: 'Bathrooms',      value: realProperty.bathrooms ?? '—' },
                                            { icon: Ruler,       label: 'Size',           value: (realProperty as any).floor_area_sqm ? `${(realProperty as any).floor_area_sqm} m²` : '—' },
                                        ];
                                        // Standard for_sale (house, villa, apartment…)
                                        return [
                                            { icon: Home,        label: 'Property type',  value: fmt(type) },
                                            { icon: Ruler,       label: 'Floor area',     value: (realProperty as any).floor_area_sqm ? `${(realProperty as any).floor_area_sqm} m²` : '—' },
                                            { icon: Bed,         label: 'Bedrooms',       value: realProperty.bedrooms ?? '—' },
                                            { icon: Bath,        label: 'Bathrooms',      value: realProperty.bathrooms ?? '—' },
                                            { icon: CalendarDays,label: 'Year built',     value: realProperty.year_built ?? '—' },
                                            { icon: Layers,      label: 'Furnished',      value: fmt(realProperty.is_furnished) },
                                            { icon: Shield,      label: 'Gated',          value: (realProperty as any).compound_is_gated ? 'Yes' : 'No' },
                                            { icon: Car,         label: 'Parking',        value: (realProperty as any).parking_spaces ? `${(realProperty as any).parking_spaces} slot(s)` : 'None' },
                                        ];
                                    }

                                    // ── Long-term rent (default) ──────────────────────
                                    return [
                                        { icon: Home,        label: 'Property type',    value: fmt(type) },
                                        { icon: Bed,         label: 'Bedrooms',         value: realProperty.bedrooms ?? '—' },
                                        { icon: Bath,        label: 'Bathrooms',        value: realProperty.bathrooms ?? '—' },
                                        { icon: Layers,      label: 'Furnished',        value: fmt(realProperty.is_furnished) },
                                        { icon: Building2,   label: 'Floor',            value: ru.floor_level != null ? `Floor ${ru.floor_level}` : '—' },
                                        { icon: Droplets,    label: 'Water',            value: fmt((realProperty as any).water_supply) },
                                        { icon: Wind,        label: 'Electricity',      value: fmt((realProperty as any).electricity_supply) },
                                        { icon: Car,         label: 'Parking',          value: (realProperty as any).parking_spaces ? `${(realProperty as any).parking_spaces} slot(s)` : 'None' },
                                    ];
                                })().map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="p-2 sm:p-3 rounded-[14px] border border-[#EAEAEA]">
                                        <Icon className="w-4 h-4 text-[#50757A] mb-2" />
                                        <p className="text-xs text-[#50757A]">{label}</p>
                                        <p className="text-xs sm:text-sm font-medium text-[#50757A] truncate capitalize">{String(value)}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Pricing extras for long-term rent */}
                            {realProperty.listing_category === 'long_term_rent' && (
                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    {[
                                        realProperty.pricing?.deposit_months  && { label: 'Deposit',       value: `${realProperty.pricing.deposit_months} month(s)` },
                                        realProperty.pricing?.deposit_amount  && { label: 'Deposit (KES)', value: Number(realProperty.pricing.deposit_amount).toLocaleString() },
                                        realProperty.pricing?.service_charge  && { label: 'Service charge',value: `KES ${Number(realProperty.pricing.service_charge).toLocaleString()}` },
                                        realProperty.pricing?.garbage_fee     && { label: 'Garbage fee',   value: `KES ${Number(realProperty.pricing.garbage_fee).toLocaleString()}` },
                                        realProperty.pricing?.caretaker_fee   && { label: 'Caretaker fee', value: `KES ${Number(realProperty.pricing.caretaker_fee).toLocaleString()}` },
                                        realProperty.pricing?.water_bill_type && { label: 'Water bill',    value: String(realProperty.pricing.water_bill_type).replace(/_/g, ' ') },
                                        realProperty.pricing?.electricity_bill_type && { label: 'Electricity', value: String(realProperty.pricing.electricity_bill_type).replace(/_/g, ' ') },
                                        realProperty.pricing?.negotiable != null && { label: 'Negotiable',  value: realProperty.pricing.negotiable ? 'Yes' : 'No' },
                                    ].filter(Boolean).map((item: any) => (
                                        <div key={item.label} className="p-2 sm:p-3 bg-[#EAEAEA] rounded-xl">
                                            <p className="text-xs text-[#50757A]">{item.label}</p>
                                            <p className="text-xs sm:text-sm font-medium text-[#50757A] capitalize">{item.value}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Short-term extras */}
                            {realProperty.listing_category === 'short_term_rent' && realProperty.short_term_config && (
                                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {[
                                        realProperty.short_term_config.cleaning_fee   && { label: 'Cleaning fee',   value: `KES ${Number(realProperty.short_term_config.cleaning_fee).toLocaleString()}` },
                                        realProperty.short_term_config.damage_deposit && { label: 'Damage deposit', value: `KES ${Number(realProperty.short_term_config.damage_deposit).toLocaleString()}` },
                                        (realProperty.short_term_config as any)?.instant_book != null && { label: 'Instant book', value: (realProperty.short_term_config as any)?.instant_book ? 'Yes' : 'No' },
                                    ].filter(Boolean).map((item: any) => (
                                        <div key={item.label} className="p-2 sm:p-3 bg-[#EAEAEA] rounded-xl">
                                            <p className="text-xs text-[#50757A]">{item.label}</p>
                                            <p className="text-xs sm:text-sm font-medium text-[#50757A]">{item.value}</p>
                                        </div>
                                    ))}
                                    {(realProperty.short_term_config?.rules ?? []).length > 0 && (
                                        <div className="col-span-full">
                                            <p className="text-xs text-[#50757A] mb-1.5">House rules</p>
                                            <ul className="flex flex-wrap gap-2">
                                                {realProperty.short_term_config?.rules?.map((r: string, i: number) => (
                                                    <li key={i} className="text-xs bg-white border border-[#EAEAEA] rounded-full px-3 py-1 text-[#50757A]">{r}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Utilities breakdown */}
                        {(realProperty as any).utilities_config && (
                            <div className="pb-6 border-b border-[#EAEAEA]">
                                <h3 className="text-lg sm:text-xl font-semibold text-[#50757A] mb-4">Utilities &amp; Bills</h3>
                                <UtilitiesBreakdownCard
                                    utilities={(realProperty as any).utilities_config}
                                    monthlyRent={Number(realProperty.pricing?.monthly_rent ?? 0)}
                                />
                            </div>
                        )}

                        {/* Tenant targeting badges */}
                        {(realProperty as any).tenant_targeting?.types?.length > 0 && (
                            <div className="pb-6 border-b border-[#EAEAEA]">
                                <h3 className="text-lg sm:text-xl font-semibold text-[#50757A] mb-3">Ideal for</h3>
                                <div className="flex flex-wrap gap-2">
                                    {((realProperty as any).tenant_targeting.types as string[]).map(type => (
                                        <TenantTypeBadge key={type} type={type as any} />
                                    ))}
                                </div>
                                {(realProperty as any).tenant_targeting.notes && (
                                    <p className="text-sm text-[#50757A] mt-2 italic">
                                        {(realProperty as any).tenant_targeting.notes}
                                    </p>
                                )}
                            </div>
                        )}

                        {/* Amenities */}
                        <div className="pb-6 border-b border-[#EAEAEA]">
                            <h3 className="text-lg sm:text-xl font-semibold text-[#50757A] mb-4">What this place offers</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {(showAllAmenities ? propertyData.amenities : propertyData.amenities.slice(0, 6)).map(
                                    (amenity: any, i: number) => {
                                        const Icon = typeof amenity.icon === 'string' ? getIconByName(amenity.icon) : amenity.icon;
                                        return (
                                            <div key={i} className="flex items-center gap-3 py-2">
                                                <Icon className="w-5 h-5 text-[#50757A] shrink-0" />
                                                <div>
                                                    <span className="text-sm text-[#50757A]">{amenity.name}</span>
                                                    {amenity.details && <p className="text-xs text-[#50757A]">{amenity.details}</p>}
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                            {propertyData.amenities.length > 6 && (
                                <button
                                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                                    className="mt-4 flex items-center gap-1 px-4 py-2 border border-[#50757A] rounded-lg text-sm font-semibold text-[#50757A] hover:bg-[#EAEAEA] transition-colors"
                                >
                                    {showAllAmenities
                                        ? <>Show less <ChevronUp className="w-4 h-4" /></>
                                        : <>Show all {propertyData.amenities.length} amenities <ChevronDown className="w-4 h-4" /></>}
                                </button>
                            )}
                        </div>

                        {/* House rules & vibe */}
                        <div className="pb-6 border-b border-[#EAEAEA]">
                            <h3 className="text-lg sm:text-xl font-semibold text-[#50757A] mb-4">The Vibe</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-semibold text-[#50757A] mb-2">House rules</p>
                                    <ul className="space-y-1.5">
                                        {propertyData.houseRules.map((rule: string, i: number) => (
                                            <li key={i} className="text-sm text-[#50757A] flex items-start gap-2">
                                                <span className="mt-1.5 w-1 h-1 rounded-full bg-[#50757A] shrink-0" />
                                                {rule}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <p className="text-sm text-[#50757A]">{propertyData.lightExposure}</p>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="pb-6 border-b border-[#EAEAEA]">
                            <h3 className="text-lg sm:text-xl font-semibold text-[#50757A] mb-1">Where you'll be</h3>
                            <p className="text-sm text-[#50757A] mb-4">{propertyData.location}</p>
                            <MemoizedMapView lat={lat} lng={lng} propertyTitle={propertyData.title} />
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-[#50757A] underline hover:text-[#DD6E42] transition-colors"
                            >
                                <Navigation2 className="w-4 h-4" />
                                Get directions
                            </a>
                        </div>

                        {/* Moving services CTA */}
                        <div className="pb-6 border-b border-[#EAEAEA]">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#50757A] to-[#3D5A5E]">
                                <div>
                                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                                        <Truck className="w-5 h-5 text-[#DD6E42]" />
                                        Need help moving in?
                                    </h3>
                                    <p className="text-sm text-[#C0D6DF] mt-0.5">
                                        Browse verified moving companies, compare quotes, and book your move.
                                    </p>
                                </div>
                                <Link
                                    to="/moving-services"
                                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 bg-[#DD6E42] text-[#50757A] text-sm font-bold rounded-xl hover:bg-[#C4623B] transition-colors w-full sm:w-auto justify-center"
                                >
                                    <Truck className="w-4 h-4" />
                                    Find Movers
                                </Link>
                            </div>
                        </div>

                        {/* Roommate finder section */}
                        <div className="pb-6 border-b border-[#EAEAEA]">
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl border-2 border-[#EAEAEA]">
                                <div>
                                    <h3 className="text-base font-bold text-[#50757A] flex items-center gap-2">
                                        <Users className="w-5 h-5 text-[#DD6E42]" />
                                        Looking for a roommate?
                                    </h3>
                                    <p className="text-sm text-[#50757A] mt-0.5">
                                        Connect with people searching for rent-sharing partners in {propertyData.location}.
                                    </p>
                                </div>
                                <Link
                                    to="/roommates"
                                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2.5 border-2 border-[#50757A] text-[#50757A] text-sm font-bold rounded-xl hover:bg-[#EAEAEA] transition-colors w-full sm:w-auto justify-center"
                                >
                                    <Users className="w-4 h-4" />
                                    Browse Roommates
                                </Link>
                            </div>
                        </div>

                        {/* Chat */}
                        <PropertyChat
                            propertyId={propertyData.id}
                            host={propertyData.host}
                            currentUser={currentUser}
                            isAuthenticated={isAuthenticated}
                            isFreeTier={isFreeTier}
                        />

                        {/* Reviews */}
                        <div className="pb-6 border-b border-[#EAEAEA]">
                            <h3 className="text-lg sm:text-xl font-semibold text-[#50757A] mb-4">Reviews</h3>
                            {!reviewsData || reviewsData.reviews.length === 0 ? (
                                <p className="text-sm text-[#50757A]">No reviews yet for this property.</p>
                            ) : (
                                <div className="space-y-6">
                                    {reviewsData.reviews.map((rev: any, i: number) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400">
                                                    {rev.guest_name?.[0] || 'G'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-[#50757A]">{rev.guest_name}</p>
                                                    <p className="text-xs text-[#50757A]">{new Date(rev.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, idx) => (
                                                    <Star key={idx} className={`w-3 h-3 ${idx < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                                ))}
                                            </div>
                                            <p className="text-sm text-[#50757A] leading-relaxed">{rev.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ── Right sticky booking card ──────────────────────────── */}
                    <div className="lg:block">
                        <div className="sticky top-24">
                            <div
                                className="
                                    bg-white border border-[#EAEAEA] rounded-[20px] p-4 sm:p-6
                                    shadow-[rgba(0,0,0,0.02)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_2px_6px,rgba(0,0,0,0.1)_0px_4px_8px]
                                "
                            >
                                {/* Price — label adapts to listing category */}
                                {(() => {
                                    const cat = realProperty.listing_category;
                                    const priceLabel =
                                        cat === 'short_term_rent' ? '/night' :
                                        cat === 'for_sale'        ? ' asking price' :
                                        '/month';
                                    const displayPrice =
                                        cat === 'short_term_rent'
                                            ? (realProperty.short_term_config?.price_per_night ?? propertyData.price)
                                            : cat === 'for_sale'
                                                ? (realProperty.pricing?.asking_price ?? propertyData.price)
                                                : (realProperty.pricing?.monthly_rent ?? propertyData.price);
                                    return (
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <span className="text-xl sm:text-2xl font-semibold text-[#50757A]">
                                                    {propertyData.currency} {Number(displayPrice).toLocaleString()}
                                                </span>
                                                <span className="text-[#50757A] text-sm">{priceLabel}</span>
                                            </div>
                                            {propertyData.status.verifiedProperty && (
                                                <div className="flex items-center gap-1">
                                                    <BadgeCheck className="w-4 h-4 text-[#DD6E42]" />
                                                    <span className="text-xs text-[#DD6E42] font-medium hidden sm:inline">Verified</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* ── Short-term rent: date picker + reserve ── */}
                                {realProperty.listing_category === 'short_term_rent' && (<>
                                    <div className="border border-[#EAEAEA] rounded-[8px] overflow-hidden mb-3">
                                        <div className="grid grid-cols-2 divide-x divide-[#EAEAEA]">
                                            <div className="p-3">
                                                <p className="text-[10px] font-bold text-[#50757A] uppercase tracking-wide mb-1">Check-in</p>
                                                <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                                                    className="w-full text-sm font-medium text-[#50757A] focus:outline-none bg-transparent" />
                                            </div>
                                            <div className="p-3">
                                                <p className="text-[10px] font-bold text-[#50757A] uppercase tracking-wide mb-1">Check-out</p>
                                                <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                                                    className="w-full text-sm font-medium text-[#50757A] focus:outline-none bg-transparent" />
                                            </div>
                                        </div>
                                        <div className="border-t border-[#EAEAEA] p-3">
                                            <p className="text-[10px] font-bold text-[#50757A] uppercase tracking-wide mb-1">Guests</p>
                                            <select value={guests} onChange={e => setGuests(Number(e.target.value))}
                                                className="w-full text-sm font-medium text-[#50757A] focus:outline-none bg-transparent">
                                                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <button onClick={handleReserve} disabled={isBooking || (!!checkIn && !!checkOut && availData?.available === false)}
                                        className={`w-full py-3 text-white font-semibold rounded-[8px] transition-colors mb-3 flex items-center justify-center gap-2 ${
                                            isBooking || (checkIn && checkOut && availData?.available === false) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#DD6E42] hover:bg-[#C4623B]'}`}>
                                        {isBooking ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> :
                                            availData?.available === false ? 'Dates Unavailable' : 'Reserve'}
                                    </button>
                                    <p className="text-xs text-[#50757A] text-center mb-4">
                                        {availData?.available === false ? availData.reason : "You won't be charged yet"}
                                    </p>
                                    <div className="space-y-2 border-t border-[#EAEAEA] pt-4">
                                        {(realProperty.short_term_config?.cleaning_fee ?? 0) > 0 && (
                                            <div className="flex justify-between text-sm text-[#50757A]">
                                                <span className="underline">Cleaning fee</span>
                                                <span>{propertyData.currency} {Number(realProperty.short_term_config?.cleaning_fee).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {(realProperty.short_term_config?.damage_deposit ?? 0) > 0 && (
                                            <div className="flex justify-between text-sm text-[#50757A]">
                                                <span>Damage deposit (refundable)</span>
                                                <span>{propertyData.currency} {Number(realProperty.short_term_config?.damage_deposit).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </>)}

                                {/* ── Long-term rent: deposit breakdown + schedule viewing ── */}
                                {realProperty.listing_category === 'long_term_rent' && (<>
                                    <div className="space-y-2 mb-4 bg-[#EAEAEA] rounded-[8px] p-3 sm:p-4 text-sm">
                                        {(realProperty.pricing?.deposit_months ?? 0) > 0 && (
                                            <div className="flex justify-between text-[#50757A]">
                                                <span className="text-[#50757A]">Deposit</span>
                                                <span className="font-medium">{realProperty.pricing?.deposit_months} month(s)</span>
                                            </div>
                                        )}
                                        {(realProperty.pricing?.deposit_amount ?? 0) > 0 && (
                                            <div className="flex justify-between text-[#50757A]">
                                                <span className="text-[#50757A]">Deposit amount</span>
                                                <span className="font-medium">KES {Number(realProperty.pricing?.deposit_amount).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {(realProperty.pricing?.service_charge ?? 0) > 0 && (
                                            <div className="flex justify-between text-[#50757A]">
                                                <span className="text-[#50757A]">Service charge</span>
                                                <span className="font-medium">KES {Number(realProperty.pricing?.service_charge).toLocaleString()}/mo</span>
                                            </div>
                                        )}
                                        {(realProperty.pricing?.garbage_fee ?? 0) > 0 && (
                                            <div className="flex justify-between text-[#50757A]">
                                                <span className="text-[#50757A]">Garbage fee</span>
                                                <span className="font-medium">KES {Number(realProperty.pricing?.garbage_fee).toLocaleString()}/mo</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-semibold text-[#50757A] pt-2 border-t border-[#EAEAEA]">
                                            <span>Move-in estimate</span>
                                            <span>KES {(
                                                Number(realProperty.pricing?.monthly_rent ?? 0) +
                                                Number(realProperty.pricing?.deposit_amount ?? (realProperty.pricing?.monthly_rent ?? 0) * (realProperty.pricing?.deposit_months ?? 0)) +
                                                Number(realProperty.pricing?.service_charge ?? 0) +
                                                Number(realProperty.pricing?.garbage_fee ?? 0)
                                            ).toLocaleString()}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2 mb-3">
                                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                                            placeholder="Your full name"
                                            className="w-full px-3 py-2 border border-[#EAEAEA] rounded-[8px] text-sm text-[#50757A] placeholder-[#50757A] focus:outline-none focus:border-[#50757A]" />
                                        <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                                            placeholder="Phone number"
                                            className="w-full px-3 py-2 border border-[#EAEAEA] rounded-[8px] text-sm text-[#50757A] placeholder-[#50757A] focus:outline-none focus:border-[#50757A]" />
                                        <div className="relative">
                                            <label className="block text-xs text-[#50757A] mb-1 font-medium">Preferred viewing date</label>
                                            <input type="date" value={viewingDate} onChange={e => setViewingDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-3 py-2 border border-[#EAEAEA] rounded-[8px] text-sm text-[#50757A] focus:outline-none focus:border-[#50757A]" />
                                        </div>
                                    </div>
                                    <button onClick={handleScheduleViewing} disabled={isBooking}
                                        className="w-full py-3 bg-[#DD6E42] hover:bg-[#C4623B] disabled:bg-gray-400 text-white font-semibold rounded-[8px] transition-colors mb-2 flex items-center justify-center gap-2">
                                        {isBooking ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Schedule Viewing'}
                                    </button>
                                    <p className="text-xs text-[#50757A] text-center">Free viewing — no commitment required</p>
                                </>)}

                                {/* ── For sale: asking price breakdown + schedule viewing ── */}
                                {realProperty.listing_category === 'for_sale' && (<>
                                    <div className="space-y-2 mb-4 bg-[#EAEAEA] rounded-[8px] p-3 sm:p-4 text-sm">
                                        {(realProperty.pricing?.goodwill_fee ?? 0) > 0 && (
                                            <div className="flex justify-between text-[#50757A]">
                                                <span className="text-[#50757A]">Goodwill / caution</span>
                                                <span className="font-medium">KES {Number(realProperty.pricing?.goodwill_fee).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {realProperty.pricing?.agent_commission_pct && (
                                            <div className="flex justify-between text-[#50757A]">
                                                <span className="text-[#50757A]">Agent commission</span>
                                                <span className="font-medium">{realProperty.pricing.agent_commission_pct}%</span>
                                            </div>
                                        )}
                                        {realProperty.pricing?.negotiable && (
                                            <p className="text-xs text-green-700 font-medium">Price is negotiable</p>
                                        )}
                                    </div>
                                    <div className="space-y-2 mb-3">
                                        <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                                            placeholder="Your full name"
                                            className="w-full px-3 py-2 border border-[#EAEAEA] rounded-[8px] text-sm text-[#50757A] placeholder-[#50757A] focus:outline-none focus:border-[#50757A]" />
                                        <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                                            placeholder="Phone number"
                                            className="w-full px-3 py-2 border border-[#EAEAEA] rounded-[8px] text-sm text-[#50757A] placeholder-[#50757A] focus:outline-none focus:border-[#50757A]" />
                                        <div className="relative">
                                            <label className="block text-xs text-[#50757A] mb-1 font-medium">Preferred viewing date</label>
                                            <input type="date" value={viewingDate} onChange={e => setViewingDate(e.target.value)}
                                                min={new Date().toISOString().split('T')[0]}
                                                className="w-full px-3 py-2 border border-[#EAEAEA] rounded-[8px] text-sm text-[#50757A] focus:outline-none focus:border-[#50757A]" />
                                        </div>
                                    </div>
                                    <button onClick={handleScheduleViewing} disabled={isBooking}
                                        className="w-full py-3 bg-[#DD6E42] hover:bg-[#C4623B] disabled:bg-gray-400 text-white font-semibold rounded-[8px] transition-colors mb-2 flex items-center justify-center gap-2">
                                        {isBooking ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Request Viewing'}
                                    </button>
                                    <p className="text-xs text-[#50757A] text-center">The seller's agent will contact you to arrange a visit</p>
                                </>)}

                                {/* Trust badges */}
                                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-[#EAEAEA]">
                                    <div className="flex items-center gap-1">
                                        <Shield className="w-4 h-4 text-[#50757A]" />
                                        <span className="text-xs text-[#50757A] hidden sm:inline">Secure payment</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Award className="w-4 h-4 text-[#50757A]" />
                                        <span className="text-xs text-[#50757A] hidden sm:inline">Verified property</span>
                                    </div>
                                </div>
                            </div>

                            {/* Host contact */}
                            <div className="mt-4 text-center">
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-semibold text-[#50757A] underline hover:text-[#DD6E42] transition-colors flex items-center justify-center gap-1"
                                >
                                    <Navigation2 className="w-4 h-4" />
                                    <span className="hidden sm:inline">Get directions on Google Maps</span>
                                    <span className="sm:hidden">Directions</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>

        {showShareModal && (
            <PropertyShareModal
                isOpen={showShareModal}
                onClose={() => setShowShareModal(false)}
                property={{
                    id: propertyData.id,
                    title: propertyData.title,
                    price: propertyData.price,
                    currency: propertyData.currency,
                    location: propertyData.location,
                    category: propertyData.category,
                }}
            />
        )}
        </>
    );
};

export default PropertyDetails;
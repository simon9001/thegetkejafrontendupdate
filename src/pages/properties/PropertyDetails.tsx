import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    Heart, Share2, Star, MapPin,
    Wifi, Car, Home, Ruler, Bed, Bath, Building2,
    CalendarDays, Shield, Eye, Clock, Sun, Award,
    BadgeCheck, ChevronDown, ChevronUp, ChevronLeft, ChevronRight,
    Layers, Navigation2, Monitor, Wind, Utensils,
    UserCircle, Droplets, Mountain, Sparkles, Camera,
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
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import CommercialPropertyDetails from './CommercialPropertyDetails';
import PropertyChat from '../../components/property/PropertyChat';
import { toast } from 'react-hot-toast';
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
    <div className="h-[280px] w-full rounded-[14px] overflow-hidden border border-[#e5e5e5]">
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

const PropertyDetails: React.FC = () => {
    const { id = '' } = useParams();
    const { data: property, isLoading: isPropertyLoading } = useGetPublicPropertyByIdQuery(id);
    const realProperty = useMemo(() => property?.property, [property]);

    const lat = useMemo(() => realProperty?.location?.latitude || -1.2921, [realProperty]);
    const lng = useMemo(() => realProperty?.location?.longitude || 36.8219, [realProperty]);

    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);
    const [isBooking, setIsBooking] = useState(false);

    const { isAuthenticated, user: currentUser } = useSelector((state: RootState) => state.auth);

    // ── API Hooks ──
    const { data: savedProps } = useGetSavedPropertiesQuery(undefined, { skip: !isAuthenticated });
    const [saveProp] = useSavePropertyMutation();
    const [removeSaved] = useRemoveSavedPropertyMutation();
    const [createBooking] = useCreateBookingMutation();

    const isSaved = useMemo(() => savedProps?.some(p => p.id === Number(id)), [savedProps, id]);

    // Fast availability check
    const { data: availData } = useCheckAvailabilityQuery(
        { propertyId: id, checkIn, checkOut },
        { skip: !checkIn || !checkOut || id === '' }
    );

    // Server-side pricing quote
    const { data: quote } = useGetPriceQuoteQuery(
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

    if (isPropertyLoading) {
        return (
            <Layout showSearch={false}>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <div className="w-10 h-10 border-[3px] border-[#ff385c] border-t-transparent rounded-full animate-spin" />
                </div>
            </Layout>
        );
    }

    if (!realProperty) {
        return (
            <Layout showSearch={false}>
                <div className="text-center py-24">
                    <h2 className="text-2xl font-semibold text-[#222222]">Property not found</h2>
                    <p className="text-[#6a6a6a] mt-2 text-sm">This listing may have been removed or doesn't exist.</p>
                </div>
            </Layout>
        );
    }

    if (realProperty.listing_category === 'commercial') {
        return <CommercialPropertyDetails />;
    }

    if (!propertyData) return null;

    const _totalNights = quote?.nights ?? (checkIn && checkOut
        ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
        : 1);

    const handleSaveToggle = async () => {
        if (!isAuthenticated) return toast.error('Please login to save properties');
        try {
            if (isSaved) {
                await removeSaved({ propertyId: Number(id) }).unwrap();
                toast.success('Removed from saved');
            } else {
                await saveProp({ propertyId: Number(id) }).unwrap();
                toast.success('Property saved!');
            }
        } catch (err: any) {
            toast.error(err?.data?.message || 'Action failed');
        }
    };

    const handleReserve = async () => {
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
            // Potentially redirect to booking detail or chat
        } catch (err: any) {
            toast.error(err?.data?.message || 'Booking failed. Try again.');
        } finally {
            setIsBooking(false);
        }
    };

    return (
        <Layout showSearch={false}>
            <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

                {/* ── Title row ─────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-[26px] font-semibold text-[#222222] tracking-[-0.44px]">
                            {propertyData.title}
                        </h1>
                        <div className="flex flex-wrap items-center gap-2 mt-1.5 text-sm text-[#222222]">
                            {propertyData.status.verifiedProperty && (
                                <>
                                    <span className="text-[#6a6a6a]">·</span>
                                    <BadgeCheck className="w-4 h-4 text-[#ff385c]" />
                                    <span className="text-[#ff385c] font-medium">Verified</span>
                                </>
                            )}
                            <span className="text-[#6a6a6a]">·</span>
                            <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-[#6a6a6a]" />
                                <span className="underline cursor-pointer hover:text-[#222222]">{propertyData.fullAddress || propertyData.location}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-[#f2f2f2] transition-colors text-sm font-semibold text-[#222222]">
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                        <button 
                            onClick={handleSaveToggle}
                            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg transition-colors text-sm font-semibold ${
                                isSaved ? 'bg-red-50 text-[#ff385c]' : 'hover:bg-[#f2f2f2] text-[#222222]'
                            }`}
                        >
                            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                            {isSaved ? 'Saved' : 'Save'}
                        </button>
                    </div>
                </div>

                {/* ── Airbnb-style image gallery ────────────────────────────── */}
                <div className="mb-8 relative">
                    {propertyData.images.length === 1 ? (
                        <div className="aspect-[16/9] rounded-[14px] overflow-hidden">
                            <img src={propertyData.images[0]} alt={propertyData.title} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 rounded-[14px] overflow-hidden" style={{ height: '460px' }}>
                            {/* Large main image */}
                            <div
                                className="relative cursor-pointer overflow-hidden"
                                onClick={() => setActiveImageIndex(0)}
                            >
                                <img
                                    src={propertyData.images[activeImageIndex]}
                                    alt={propertyData.title}
                                    className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
                                />
                            </div>
                            {/* 2×2 right grid */}
                            <div className="grid grid-cols-2 gap-2">
                                {propertyData.images.slice(1, 5).map((img: string, i: number) => (
                                    <div
                                        key={i}
                                        className="relative cursor-pointer overflow-hidden"
                                        onClick={() => setActiveImageIndex(i + 1)}
                                    >
                                        <img
                                            src={img}
                                            alt={`View ${i + 2}`}
                                            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Gallery nav & show-all */}
                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                        {propertyData.images.length > 1 && (
                            <>
                                <button
                                    onClick={() => setActiveImageIndex(i => Math.max(0, i - 1))}
                                    className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition"
                                >
                                    <ChevronLeft className="w-4 h-4 text-[#222222]" />
                                </button>
                                <button
                                    onClick={() => setActiveImageIndex(i => Math.min(propertyData.images.length - 1, i + 1))}
                                    className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition"
                                >
                                    <ChevronRight className="w-4 h-4 text-[#222222]" />
                                </button>
                            </>
                        )}
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white/90 hover:bg-white text-[#222222] rounded-lg text-sm font-semibold shadow transition">
                            <Camera className="w-4 h-4" />
                            Show all photos ({propertyData.images.length})
                        </button>
                    </div>

                    {/* Image counter */}
                    <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                        {activeImageIndex + 1} / {propertyData.images.length}
                    </div>
                </div>

                {/* ── Main 2-col layout ─────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-12">

                    {/* Left column */}
                    <div className="space-y-8 min-w-0">

                        {/* Host row */}
                        <div className="flex items-center justify-between pb-6 border-b border-[#e5e5e5]">
                            <div>
                                <h2 className="text-xl font-semibold text-[#222222]">
                                    Hosted by {propertyData.host.name}
                                </h2>
                                <p className="text-[#6a6a6a] text-sm mt-0.5">
                                    {propertyData.bedrooms} bed · {propertyData.bathrooms} bath · {propertyData.type}
                                </p>
                            </div>
                            <div className="relative shrink-0">
                                {propertyData.host.avatar ? (
                                    <img
                                        src={propertyData.host.avatar}
                                        alt={propertyData.host.name}
                                        className="w-14 h-14 rounded-full object-cover"
                                    />
                                ) : (
                                    <div className="w-14 h-14 rounded-full bg-[#f2f2f2] flex items-center justify-center">
                                        <UserCircle className="w-8 h-8 text-[#6a6a6a]" />
                                    </div>
                                )}
                                {propertyData.host.verified && (
                                    <BadgeCheck className="w-4 h-4 text-[#ff385c] absolute bottom-0 right-0" />
                                )}
                            </div>
                        </div>

                        {/* Host highlights */}
                        <div className="space-y-4 pb-6 border-b border-[#e5e5e5]">
                            <div className="flex items-center gap-4">
                                <BadgeCheck className="w-6 h-6 text-[#222222] shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-[#222222]">{propertyData.host.name} is a Superhost</p>
                                    <p className="text-sm text-[#6a6a6a]">Superhosts are experienced, highly rated hosts who are committed to providing great stays.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <MapPin className="w-6 h-6 text-[#222222] shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-[#222222]">Great location</p>
                                    <p className="text-sm text-[#6a6a6a]">{propertyData.communityVibe}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Eye className="w-6 h-6 text-[#222222] shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-[#222222]">{propertyData.status.views} views</p>
                                    <p className="text-sm text-[#6a6a6a]">
                                        Listed {new Date(propertyData.status.dateListed).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {propertyData.description && (
                            <div className="pb-6 border-b border-[#e5e5e5]">
                                <p className="text-[#222222] text-sm leading-relaxed">{propertyData.description}</p>
                            </div>
                        )}

                        {/* Property facts grid — fields adapt to listing category & type */}
                        <div className="pb-6 border-b border-[#e5e5e5]">
                            <h3 className="text-xl font-semibold text-[#222222] mb-4">Property details</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {(() => {
                                    const cat  = realProperty.listing_category;
                                    const type = realProperty.listing_type;
                                    const _p   = realProperty.pricing ?? {};
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
                                    <div key={label} className="p-3 rounded-[14px] border border-[#e5e5e5]">
                                        <Icon className="w-4 h-4 text-[#6a6a6a] mb-2" />
                                        <p className="text-xs text-[#6a6a6a]">{label}</p>
                                        <p className="text-sm font-medium text-[#222222] truncate capitalize">{String(value)}</p>
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
                                        <div key={item.label} className="p-3 bg-[#fafafa] rounded-xl">
                                            <p className="text-xs text-[#6a6a6a]">{item.label}</p>
                                            <p className="text-sm font-medium text-[#222222] capitalize">{item.value}</p>
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
                                        <div key={item.label} className="p-3 bg-[#fafafa] rounded-xl">
                                            <p className="text-xs text-[#6a6a6a]">{item.label}</p>
                                            <p className="text-sm font-medium text-[#222222]">{item.value}</p>
                                        </div>
                                    ))}
                                    {(realProperty.short_term_config?.rules ?? []).length > 0 && (
                                        <div className="col-span-full">
                                            <p className="text-xs text-[#6a6a6a] mb-1.5">House rules</p>
                                            <ul className="flex flex-wrap gap-2">
                                                {realProperty.short_term_config?.rules?.map((r: string, i: number) => (
                                                    <li key={i} className="text-xs bg-white border border-[#e5e5e5] rounded-full px-3 py-1 text-[#222222]">{r}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Amenities */}
                        <div className="pb-6 border-b border-[#e5e5e5]">
                            <h3 className="text-xl font-semibold text-[#222222] mb-4">What this place offers</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {(showAllAmenities ? propertyData.amenities : propertyData.amenities.slice(0, 6)).map(
                                    (amenity: any, i: number) => {
                                        const Icon = typeof amenity.icon === 'string' ? getIconByName(amenity.icon) : amenity.icon;
                                        return (
                                            <div key={i} className="flex items-center gap-3 py-2">
                                                <Icon className="w-5 h-5 text-[#222222]" />
                                                <div>
                                                    <span className="text-sm text-[#222222]">{amenity.name}</span>
                                                    {amenity.details && <p className="text-xs text-[#6a6a6a]">{amenity.details}</p>}
                                                </div>
                                            </div>
                                        );
                                    }
                                )}
                            </div>
                            {propertyData.amenities.length > 6 && (
                                <button
                                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                                    className="mt-4 flex items-center gap-1 px-4 py-2 border border-[#222222] rounded-lg text-sm font-semibold text-[#222222] hover:bg-[#f2f2f2] transition-colors"
                                >
                                    {showAllAmenities
                                        ? <>Show less <ChevronUp className="w-4 h-4" /></>
                                        : <>Show all {propertyData.amenities.length} amenities <ChevronDown className="w-4 h-4" /></>}
                                </button>
                            )}
                        </div>

                        {/* House rules & vibe */}
                        <div className="pb-6 border-b border-[#e5e5e5]">
                            <h3 className="text-xl font-semibold text-[#222222] mb-4">The Vibe</h3>
                            <div className="space-y-4">
                                <div>
                                    <p className="text-sm font-semibold text-[#222222] mb-2">House rules</p>
                                    <ul className="space-y-1.5">
                                        {propertyData.houseRules.map((rule: string, i: number) => (
                                            <li key={i} className="text-sm text-[#6a6a6a] flex items-start gap-2">
                                                <span className="mt-1.5 w-1 h-1 rounded-full bg-[#6a6a6a] shrink-0" />
                                                {rule}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <p className="text-sm text-[#6a6a6a]">{propertyData.lightExposure}</p>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="pb-6 border-b border-[#e5e5e5]">
                            <h3 className="text-xl font-semibold text-[#222222] mb-1">Where you'll be</h3>
                            <p className="text-sm text-[#6a6a6a] mb-4">{propertyData.location}</p>
                            <MemoizedMapView lat={lat} lng={lng} propertyTitle={propertyData.title} />
                            <a
                                href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 mt-3 text-sm font-semibold text-[#222222] underline hover:text-[#ff385c] transition-colors"
                            >
                                <Navigation2 className="w-4 h-4" />
                                Get directions
                            </a>
                        </div>

                        {/* Chat */}
                        <PropertyChat
                            propertyId={propertyData.id}
                            host={propertyData.host}
                            currentUser={currentUser}
                            isAuthenticated={isAuthenticated}
                        />

                        {/* Reviews */}
                        <div className="pb-6 border-b border-[#e5e5e5]">
                            <h3 className="text-xl font-semibold text-[#222222] mb-4">Reviews</h3>
                            {!reviewsData || reviewsData.reviews.length === 0 ? (
                                <p className="text-sm text-[#6a6a6a]">No reviews yet for this property.</p>
                            ) : (
                                <div className="space-y-6">
                                    {reviewsData.reviews.map((rev: any, i: number) => (
                                        <div key={i} className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-400">
                                                    {rev.guest_name?.[0] || 'G'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-[#222222]">{rev.guest_name}</p>
                                                    <p className="text-xs text-[#6a6a6a]">{new Date(rev.created_at).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                {[...Array(5)].map((_, idx) => (
                                                    <Star key={idx} className={`w-3 h-3 ${idx < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
                                                ))}
                                            </div>
                                            <p className="text-sm text-[#222222] leading-relaxed">{rev.comment}</p>
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
                                    bg-white border border-[#e5e5e5] rounded-[20px] p-6
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
                                                <span className="text-2xl font-semibold text-[#222222]">
                                                    {propertyData.currency} {Number(displayPrice).toLocaleString()}
                                                </span>
                                                <span className="text-[#6a6a6a] text-sm">{priceLabel}</span>
                                            </div>
                                            {propertyData.status.verifiedProperty && (
                                                <div className="flex items-center gap-1">
                                                    <BadgeCheck className="w-4 h-4 text-[#ff385c]" />
                                                    <span className="text-xs text-[#ff385c] font-medium">Verified</span>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })()}

                                {/* ── Short-term rent: date picker + reserve ── */}
                                {realProperty.listing_category === 'short_term_rent' && (<>
                                    <div className="border border-[#c1c1c1] rounded-[8px] overflow-hidden mb-3">
                                        <div className="grid grid-cols-2 divide-x divide-[#c1c1c1]">
                                            <div className="p-3">
                                                <p className="text-[10px] font-bold text-[#222222] uppercase tracking-wide mb-1">Check-in</p>
                                                <input type="date" value={checkIn} onChange={e => setCheckIn(e.target.value)}
                                                    className="w-full text-sm font-medium text-[#222222] focus:outline-none bg-transparent" />
                                            </div>
                                            <div className="p-3">
                                                <p className="text-[10px] font-bold text-[#222222] uppercase tracking-wide mb-1">Check-out</p>
                                                <input type="date" value={checkOut} onChange={e => setCheckOut(e.target.value)}
                                                    className="w-full text-sm font-medium text-[#222222] focus:outline-none bg-transparent" />
                                            </div>
                                        </div>
                                        <div className="border-t border-[#c1c1c1] p-3">
                                            <p className="text-[10px] font-bold text-[#222222] uppercase tracking-wide mb-1">Guests</p>
                                            <select value={guests} onChange={e => setGuests(Number(e.target.value))}
                                                className="w-full text-sm font-medium text-[#222222] focus:outline-none bg-transparent">
                                                {[1,2,3,4,5].map(n => <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                    <button onClick={handleReserve} disabled={isBooking || (!!checkIn && !!checkOut && availData?.available === false)}
                                        className={`w-full py-3 text-white font-semibold rounded-[8px] transition-colors mb-3 flex items-center justify-center gap-2 ${
                                            isBooking || (checkIn && checkOut && availData?.available === false) ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#ff385c] hover:bg-[#e00b41]'}`}>
                                        {isBooking ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> :
                                            availData?.available === false ? 'Dates Unavailable' : 'Reserve'}
                                    </button>
                                    <p className="text-xs text-[#6a6a6a] text-center mb-4">
                                        {availData?.available === false ? availData.reason : "You won't be charged yet"}
                                    </p>
                                    <div className="space-y-2 border-t border-[#e5e5e5] pt-4">
                                        {(realProperty.short_term_config?.cleaning_fee ?? 0) > 0 && (
                                            <div className="flex justify-between text-sm text-[#222222]">
                                                <span className="underline">Cleaning fee</span>
                                                <span>{propertyData.currency} {Number(realProperty.short_term_config?.cleaning_fee).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {(realProperty.short_term_config?.damage_deposit ?? 0) > 0 && (
                                            <div className="flex justify-between text-sm text-[#6a6a6a]">
                                                <span>Damage deposit (refundable)</span>
                                                <span>{propertyData.currency} {Number(realProperty.short_term_config?.damage_deposit).toLocaleString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </>)}

                                {/* ── Long-term rent: deposit breakdown + schedule viewing ── */}
                                {realProperty.listing_category === 'long_term_rent' && (<>
                                    <div className="space-y-2 mb-4 bg-[#fafafa] rounded-[8px] p-4 text-sm">
                                        {(realProperty.pricing?.deposit_months ?? 0) > 0 && (
                                            <div className="flex justify-between text-[#222222]">
                                                <span className="text-[#6a6a6a]">Deposit</span>
                                                <span className="font-medium">{realProperty.pricing?.deposit_months} month(s)</span>
                                            </div>
                                        )}
                                        {(realProperty.pricing?.deposit_amount ?? 0) > 0 && (
                                            <div className="flex justify-between text-[#222222]">
                                                <span className="text-[#6a6a6a]">Deposit amount</span>
                                                <span className="font-medium">KES {Number(realProperty.pricing?.deposit_amount).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {(realProperty.pricing?.service_charge ?? 0) > 0 && (
                                            <div className="flex justify-between text-[#222222]">
                                                <span className="text-[#6a6a6a]">Service charge</span>
                                                <span className="font-medium">KES {Number(realProperty.pricing?.service_charge).toLocaleString()}/mo</span>
                                            </div>
                                        )}
                                        {(realProperty.pricing?.garbage_fee ?? 0) > 0 && (
                                            <div className="flex justify-between text-[#222222]">
                                                <span className="text-[#6a6a6a]">Garbage fee</span>
                                                <span className="font-medium">KES {Number(realProperty.pricing?.garbage_fee).toLocaleString()}/mo</span>
                                            </div>
                                        )}
                                        <div className="flex justify-between font-semibold text-[#222222] pt-2 border-t border-[#e5e5e5]">
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
                                            className="w-full px-3 py-2 border border-[#c1c1c1] rounded-[8px] text-sm text-[#222222] placeholder-[#6a6a6a] focus:outline-none focus:border-[#222222]" />
                                        <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                                            placeholder="Phone number"
                                            className="w-full px-3 py-2 border border-[#c1c1c1] rounded-[8px] text-sm text-[#222222] placeholder-[#6a6a6a] focus:outline-none focus:border-[#222222]" />
                                    </div>
                                    <button onClick={handleReserve} disabled={isBooking}
                                        className="w-full py-3 bg-[#ff385c] hover:bg-[#e00b41] disabled:bg-gray-400 text-white font-semibold rounded-[8px] transition-colors mb-2 flex items-center justify-center gap-2">
                                        {isBooking ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Schedule Viewing'}
                                    </button>
                                    <p className="text-xs text-[#6a6a6a] text-center">Free viewing — no commitment required</p>
                                </>)}

                                {/* ── For sale: asking price breakdown + schedule viewing ── */}
                                {realProperty.listing_category === 'for_sale' && (<>
                                    <div className="space-y-2 mb-4 bg-[#fafafa] rounded-[8px] p-4 text-sm">
                                        {(realProperty.pricing?.goodwill_fee ?? 0) > 0 && (
                                            <div className="flex justify-between text-[#222222]">
                                                <span className="text-[#6a6a6a]">Goodwill / caution</span>
                                                <span className="font-medium">KES {Number(realProperty.pricing?.goodwill_fee).toLocaleString()}</span>
                                            </div>
                                        )}
                                        {realProperty.pricing?.agent_commission_pct && (
                                            <div className="flex justify-between text-[#222222]">
                                                <span className="text-[#6a6a6a]">Agent commission</span>
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
                                            className="w-full px-3 py-2 border border-[#c1c1c1] rounded-[8px] text-sm text-[#222222] placeholder-[#6a6a6a] focus:outline-none focus:border-[#222222]" />
                                        <input type="tel" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                                            placeholder="Phone number"
                                            className="w-full px-3 py-2 border border-[#c1c1c1] rounded-[8px] text-sm text-[#222222] placeholder-[#6a6a6a] focus:outline-none focus:border-[#222222]" />
                                    </div>
                                    <button onClick={handleReserve} disabled={isBooking}
                                        className="w-full py-3 bg-[#ff385c] hover:bg-[#e00b41] disabled:bg-gray-400 text-white font-semibold rounded-[8px] transition-colors mb-2 flex items-center justify-center gap-2">
                                        {isBooking ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : 'Request Viewing'}
                                    </button>
                                    <p className="text-xs text-[#6a6a6a] text-center">The seller's agent will contact you to arrange a visit</p>
                                </>)}

                                {/* Trust badges */}
                                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-[#f2f2f2]">
                                    <div className="flex items-center gap-1">
                                        <Shield className="w-4 h-4 text-[#6a6a6a]" />
                                        <span className="text-xs text-[#6a6a6a]">Secure payment</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Award className="w-4 h-4 text-[#6a6a6a]" />
                                        <span className="text-xs text-[#6a6a6a]">Verified property</span>
                                    </div>
                                </div>
                            </div>

                            {/* Host contact */}
                            <div className="mt-4 text-center">
                                <a
                                    href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm font-semibold text-[#222222] underline hover:text-[#ff385c] transition-colors flex items-center justify-center gap-1"
                                >
                                    <Navigation2 className="w-4 h-4" />
                                    Get directions on Google Maps
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default PropertyDetails;

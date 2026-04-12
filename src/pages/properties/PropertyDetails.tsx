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
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import CommercialPropertyDetails from './CommercialPropertyDetails';
import PropertyChat from '../../components/property/PropertyChat';
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

    const lat = useMemo(() => realProperty?.location?.location?.coordinates[1] || 31.6148, [realProperty]);
    const lng = useMemo(() => realProperty?.location?.location?.coordinates[0] || 77.3456, [realProperty]);

    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);

    const { isAuthenticated, user: currentUser } = useSelector((state: RootState) => state.auth);

    const propertyData = useMemo(() => {
        if (!realProperty) return null;
        return {
            id: realProperty.id,
            title: realProperty.title,
            description: realProperty.description,
            price: realProperty.price_per_month || realProperty.price_per_night || realProperty.price || 0,
            currency: realProperty.currency || 'KSh',
            location: realProperty.location?.address || realProperty.location?.town || 'Kenya',
            type: realProperty.property_type || realProperty.type || 'Apartment',
            sizes: realProperty.size_sqm || realProperty.size || 0,
            bedrooms: realProperty.bedrooms || 0,
            bathrooms: realProperty.bathrooms || 0,
            floorLevel: realProperty.floor_level || 'N/A',
            furnished: realProperty.furnished_status || 'Unfurnished',
            yearBuilt: realProperty.year_built || 'N/A',
            internetSpeed: realProperty.internet_speed || 'N/A',
            images:
                realProperty.images && realProperty.images.length > 0
                    ? realProperty.images.map((img: any) => img.image_url)
                    : ['https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop'],
            host: {
                id: realProperty.owner?.id || (realProperty as any).owner_id,
                name: realProperty.owner?.full_name || 'Host',
                avatar: realProperty.owner?.avatar_url || null,
                verified: realProperty.is_verified || false,
            },
            amenities:
                realProperty.amenities && realProperty.amenities.length > 0
                    ? realProperty.amenities.map((a: any) => ({ name: a.name, icon: a.icon_name || 'Sparkles', details: a.details }))
                    : [
                        { name: 'High-speed WiFi', icon: 'Wifi' },
                        { name: 'Free Parking', icon: 'Car' },
                        { name: 'Water Included', icon: 'Droplets' },
                    ],
            status: {
                verifiedProperty: realProperty.is_verified || false,
                views: realProperty.views_count || 0,
                dateListed: realProperty.created_at || new Date().toISOString(),
            },
            pricing: {
                cleaningFee: realProperty.cleaning_fee || 0,
                serviceCharge: realProperty.service_fee || 0,
                tax: realProperty.tax_amount || 0,
                securityDeposit: realProperty.security_deposit || 0,
            },
            houseRules: [
                realProperty.is_pet_friendly ? 'Pets allowed' : 'No pets',
                realProperty.is_smoking_allowed ? 'Smoking allowed' : 'No smoking',
                `Notice period: ${realProperty.notice_period || '1 month'}`,
                `Lease duration: ${realProperty.lease_duration || '12 months'}`,
            ],
            communityVibe: realProperty.neighborhood?.community_vibe || 'Quiet, upscale residential community.',
            lightExposure: realProperty.neighborhood?.light_exposure || 'Excellent natural light.',
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

    if (realProperty.category === 'commercial' || realProperty.category === 'recreational') {
        return <CommercialPropertyDetails />;
    }

    if (!propertyData) return null;

    const totalNights = checkIn && checkOut
        ? Math.max(1, Math.round((new Date(checkOut).getTime() - new Date(checkIn).getTime()) / 86400000))
        : 1;

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
                                <span className="underline cursor-pointer hover:text-[#222222]">{propertyData.location}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-[#f2f2f2] transition-colors text-sm font-semibold text-[#222222]">
                            <Share2 className="w-4 h-4" />
                            Share
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-[#f2f2f2] transition-colors text-sm font-semibold text-[#222222]">
                            <Heart className="w-4 h-4" />
                            Save
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

                        {/* Property facts grid */}
                        <div className="pb-6 border-b border-[#e5e5e5]">
                            <h3 className="text-xl font-semibold text-[#222222] mb-4">Property details</h3>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[
                                    { icon: Home, label: 'Type', value: propertyData.type },
                                    { icon: Ruler, label: 'Size', value: `${propertyData.sizes} m²` },
                                    { icon: Bed, label: 'Bedrooms', value: propertyData.bedrooms },
                                    { icon: Bath, label: 'Bathrooms', value: propertyData.bathrooms },
                                    { icon: Building2, label: 'Floor', value: propertyData.floorLevel },
                                    { icon: Layers, label: 'Furnished', value: propertyData.furnished },
                                    { icon: CalendarDays, label: 'Year built', value: propertyData.yearBuilt },
                                    { icon: Wifi, label: 'Internet', value: propertyData.internetSpeed },
                                ].map(({ icon: Icon, label, value }) => (
                                    <div key={label} className="p-3 rounded-[14px] border border-[#e5e5e5]">
                                        <Icon className="w-4 h-4 text-[#6a6a6a] mb-2" />
                                        <p className="text-xs text-[#6a6a6a]">{label}</p>
                                        <p className="text-sm font-medium text-[#222222] truncate">{value}</p>
                                    </div>
                                ))}
                            </div>
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
                        <div>
                            <h3 className="text-xl font-semibold text-[#222222] mb-4">Reviews</h3>
                            <p className="text-sm text-[#6a6a6a]">No reviews yet for this property.</p>
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
                                {/* Price */}
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <span className="text-2xl font-semibold text-[#222222]">
                                            {propertyData.currency} {propertyData.price.toLocaleString()}
                                        </span>
                                        <span className="text-[#6a6a6a] text-sm"> /month</span>
                                    </div>
                                    {propertyData.status.verifiedProperty && (
                                        <div className="flex items-center gap-1">
                                            <BadgeCheck className="w-4 h-4 text-[#ff385c]" />
                                            <span className="text-xs text-[#ff385c] font-medium">Verified</span>
                                        </div>
                                    )}
                                </div>

                                {/* Date pickers */}
                                <div className="border border-[#c1c1c1] rounded-[8px] overflow-hidden mb-3">
                                    <div className="grid grid-cols-2 divide-x divide-[#c1c1c1]">
                                        <div className="p-3">
                                            <p className="text-[10px] font-bold text-[#222222] uppercase tracking-wide mb-1">Check-in</p>
                                            <input
                                                type="date"
                                                value={checkIn}
                                                onChange={e => setCheckIn(e.target.value)}
                                                className="w-full text-sm font-medium text-[#222222] focus:outline-none bg-transparent"
                                            />
                                        </div>
                                        <div className="p-3">
                                            <p className="text-[10px] font-bold text-[#222222] uppercase tracking-wide mb-1">Check-out</p>
                                            <input
                                                type="date"
                                                value={checkOut}
                                                onChange={e => setCheckOut(e.target.value)}
                                                className="w-full text-sm font-medium text-[#222222] focus:outline-none bg-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="border-t border-[#c1c1c1] p-3">
                                        <p className="text-[10px] font-bold text-[#222222] uppercase tracking-wide mb-1">Guests</p>
                                        <select
                                            value={guests}
                                            onChange={e => setGuests(Number(e.target.value))}
                                            className="w-full text-sm font-medium text-[#222222] focus:outline-none bg-transparent"
                                        >
                                            {[1, 2, 3, 4, 5].map(n => (
                                                <option key={n} value={n}>{n} guest{n > 1 ? 's' : ''}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                {/* CTA */}
                                <button className="w-full py-3 bg-[#ff385c] hover:bg-[#e00b41] text-white font-semibold rounded-[8px] transition-colors mb-3">
                                    Reserve
                                </button>
                                <p className="text-xs text-[#6a6a6a] text-center mb-4">You won't be charged yet</p>

                                {/* Price breakdown */}
                                <div className="space-y-2 border-t border-[#e5e5e5] pt-4">
                                    <div className="flex justify-between text-sm text-[#222222]">
                                        <span className="underline">
                                            {propertyData.currency} {propertyData.price.toLocaleString()} × {totalNights} night{totalNights > 1 ? 's' : ''}
                                        </span>
                                        <span>{propertyData.currency} {(propertyData.price * totalNights).toLocaleString()}</span>
                                    </div>
                                    {propertyData.pricing.cleaningFee > 0 && (
                                        <div className="flex justify-between text-sm text-[#222222]">
                                            <span className="underline">Cleaning fee</span>
                                            <span>{propertyData.currency} {propertyData.pricing.cleaningFee.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {propertyData.pricing.serviceCharge > 0 && (
                                        <div className="flex justify-between text-sm text-[#222222]">
                                            <span className="underline">Service fee</span>
                                            <span>{propertyData.currency} {propertyData.pricing.serviceCharge.toLocaleString()}</span>
                                        </div>
                                    )}
                                    {propertyData.pricing.securityDeposit > 0 && (
                                        <div className="flex justify-between text-sm text-[#6a6a6a]">
                                            <span>Security deposit (refundable)</span>
                                            <span>{propertyData.currency} {propertyData.pricing.securityDeposit.toLocaleString()}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between font-semibold text-[#222222] pt-2 border-t border-[#e5e5e5]">
                                        <span>Total</span>
                                        <span>
                                            {propertyData.currency}{' '}
                                            {(
                                                propertyData.price * totalNights +
                                                propertyData.pricing.cleaningFee +
                                                propertyData.pricing.serviceCharge
                                            ).toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                {/* Contact details */}
                                <div className="space-y-2 mt-4">
                                    <input
                                        type="text"
                                        value={fullName}
                                        onChange={e => setFullName(e.target.value)}
                                        placeholder="Your full name"
                                        className="w-full px-3 py-2 border border-[#c1c1c1] rounded-[8px] text-sm text-[#222222] placeholder-[#6a6a6a] focus:outline-none focus:border-[#222222]"
                                    />
                                    <input
                                        type="tel"
                                        value={phoneNumber}
                                        onChange={e => setPhoneNumber(e.target.value)}
                                        placeholder="Phone number"
                                        className="w-full px-3 py-2 border border-[#c1c1c1] rounded-[8px] text-sm text-[#222222] placeholder-[#6a6a6a] focus:outline-none focus:border-[#222222]"
                                    />
                                </div>

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

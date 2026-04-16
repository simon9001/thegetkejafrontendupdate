import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { useGetPublicPropertyByIdQuery } from '../../features/Api/PropertiesApi';
import PropertyChat from '../../components/property/PropertyChat';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
    Heart, Share2, MapPin, Camera, Video, Grid,
    Home, Ruler, Users, Calendar, Clock, Music, Mic,
    Shield, Eye, Award, BadgeCheck, Moon, ParkingCircle,
    DoorOpen, Building2, AlertTriangle, Volume2, GlassWater,
    Sparkles, MessageCircle, User, Navigation2,
    ChevronLeft, ChevronRight,
} from 'lucide-react';
import Layout from '../../components/layout/Layout';

const MemoizedMapView = React.memo(({ lat, lng, propertyTitle }: { lat: number; lng: number; propertyTitle: string }) => (
    <div className="h-[280px] w-full rounded-[14px] overflow-hidden border border-[#e5e5e5]">
        <MapContainer center={[lat, lng]} zoom={15} scrollWheelZoom={false} className="h-full w-full">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[lat, lng]}>
                <Popup>{propertyTitle}</Popup>
            </Marker>
        </MapContainer>
    </div>
));

const CommercialPropertyDetails: React.FC = () => {
    const { id = '' } = useParams();
    const { data: propertyData, isLoading: isPropertyLoading } = useGetPublicPropertyByIdQuery(id);
    const realProperty = useMemo(() => propertyData?.property, [propertyData]);

    const lat = useMemo(() => realProperty?.location?.location?.coordinates[1] || 31.6148, [realProperty]);
    const lng = useMemo(() => realProperty?.location?.location?.coordinates[0] || 77.3456, [realProperty]);

    const { isAuthenticated, user: currentUser } = useSelector((state: RootState) => state.auth);
    const navigate = useNavigate();

    const [selectedRate, setSelectedRate] = useState<'hourly' | 'half-day' | 'full-day' | 'weekend'>('full-day');
    const [eventType, setEventType] = useState('wedding');
    const [guestCount, setGuestCount] = useState(100);
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [activeImageIndex, setActiveImageIndex] = useState(0);

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
                    <h2 className="text-2xl font-semibold text-[#222222]">Venue not found</h2>
                    <p className="text-[#6a6a6a] text-sm mt-2 mb-6">This listing may have been removed.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2.5 bg-[#222222] text-white text-sm font-semibold rounded-[8px] hover:bg-[#ff385c] transition-colors"
                    >
                        Back to home
                    </button>
                </div>
            </Layout>
        );
    }

    // Merge real backend data with sensible defaults for UI richness
    const property = {
        ...realProperty,
        id: realProperty.id,
        name: realProperty.title,
        vibeDescription: realProperty.description || 'A stunning venue perfect for your next big event.',
        cityLocation: realProperty.location?.address?.split(',').slice(-3).join(',') || 'Location unavailable',
        exactLocation: realProperty.location?.address || 'Address unavailable',
        startingPrice: realProperty.price_per_day || realProperty.price_per_month || 50000,
        priceUnit: realProperty.price_per_day ? 'day' : 'month',
        currency: realProperty.currency || 'KSh',
        maxCapacity: realProperty.capacity || 500,
        verifiedVenue: realProperty.is_verified || false,
        gallery:
            realProperty.images && realProperty.images.length > 0
                ? realProperty.images.map((img: any) => img.image_url)
                : ['https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2070&auto=format&fit=crop'],
        totalArea: realProperty.size_sqm || realProperty.size || 2500,
        indoorCapacity: Math.floor((realProperty.capacity || 500) * 0.6),
        outdoorCapacity: Math.floor((realProperty.capacity || 500) * 0.4),
        numberOfRooms: realProperty.bedrooms || 0,
        numberOfBathrooms: realProperty.bathrooms || 0,
        parkingCapacity: (realProperty as any).parking_spots || 50,
        property_type: realProperty.property_type || realProperty.type || 'Convention Center',
        availabilityCalendar: 'Available for 2024/2025 bookings',
        pricing: {
            hourly: (realProperty.price_per_day || 50000) / 8,
            halfDay: (realProperty.price_per_day || 50000) * 0.7,
            fullDay: realProperty.price_per_day || 50000,
            weekend: (realProperty.price_per_day || 50000) * 1.5,
            securityDeposit: (realProperty as any).security_deposit || 50000,
            cleaningFee: (realProperty as any).cleaning_fee || 10000,
        },
        rules: {
            allowedEventTypes:
                realProperty.category === 'recreational'
                    ? ['Vacation', 'Short term']
                    : ['Corporate events', 'Product launches'],
            maxSoundLevel: '85 dB after 10 PM',
            musicCutoffTime: '1 AM',
            alcoholPolicy: (realProperty as any).is_smoking_allowed ? 'Smoking allowed' : 'No smoking',
            requiredPermits: ['Event permit', 'Catering license'],
            ageRestrictions: '21+ for alcohol service',
        },
        host: {
            id: realProperty.owner?.id || (realProperty as any).owner_id,
            name: realProperty.owner?.full_name || 'Host',
            avatar: realProperty.owner?.avatar_url || null,
        },
        socialProof: {
            cancellationPolicy: 'Moderate — full refund 7 days prior',
        },
        uniqueFeatures: realProperty.amenities?.map((a: any) => a.name) || ['12 ft glass walls', 'Grand staircase', 'Rooftop deck'],
        architecturalStyle: 'Contemporary glass and steel',
        interiorTheme: 'Modern minimalist',
        naturalLighting: 'Floor-to-ceiling windows',
        ceilingHeight: '8–12 meters',
        powerCapacity: '200 amps',
        generatorBackup: '125 kVA generator',
        wifiSpeed: (realProperty as any).internet_speed || '250 Mbps',
        soundSystem: 'Built-in surround sound',
        lightingSystem: 'Programmable LED',
        djBoothAvailable: true,
        stageAvailable: true,
        airConditioning: 'Centralized AC',
        equipmentLoading: 'Ground-level access',
        safety: { fireExits: 6, cctv: true },
        locationInfo: {
            accessibility: 'Paved road',
            neighborhoodType: (realProperty as any).neighborhood?.community_vibe || 'Private hillside estate',
            privacyRating: 'High',
            nearbyLandmarks: ['City Center', 'Main Station'],
        },
    };

    const getPriceForSelectedRate = () => {
        switch (selectedRate) {
            case 'hourly': return property.pricing.hourly;
            case 'half-day': return property.pricing.halfDay;
            case 'full-day': return property.pricing.fullDay;
            case 'weekend': return property.pricing.weekend;
        }
    };

    const rateOptions: { key: typeof selectedRate; label: string }[] = [
        { key: 'hourly', label: 'Hourly' },
        { key: 'half-day', label: 'Half-day' },
        { key: 'full-day', label: 'Full-day' },
        { key: 'weekend', label: 'Weekend' },
    ];

    // ── Reusable components ────────────────────────────────────────────────────
    const InfoPill = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) => (
        <div className="p-3 rounded-[14px] border border-[#e5e5e5]">
            <Icon className="w-4 h-4 text-[#6a6a6a] mb-2" />
            <p className="text-xs text-[#6a6a6a]">{label}</p>
            <p className="text-sm font-medium text-[#222222] truncate">{value}</p>
        </div>
    );

    const SectionTitle = ({ children }: { children: React.ReactNode }) => (
        <h3 className="text-xl font-semibold text-[#222222] mb-4">{children}</h3>
    );

    return (
        <Layout showSearch={false}>
            <div className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

                {/* ── Title row ─────────────────────────────────────────────── */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-[26px] font-semibold text-[#222222] tracking-[-0.44px]">{property.name}</h1>
                            {property.verifiedVenue && (
                                <span className="flex items-center gap-1 px-2 py-0.5 bg-[#fff1f2] text-[#ff385c] text-xs font-medium rounded-full">
                                    <BadgeCheck className="w-3.5 h-3.5" />
                                    Verified venue
                                </span>
                            )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-[#222222]">
                            <div className="flex items-center gap-1">
                                <MapPin className="w-3.5 h-3.5 text-[#6a6a6a]" />
                                <span className="underline cursor-pointer text-[#6a6a6a]">{property.cityLocation}</span>
                            </div>
                            <span className="text-[#6a6a6a]">·</span>
                            <div className="flex items-center gap-1">
                                <Users className="w-3.5 h-3.5 text-[#6a6a6a]" />
                                <span className="text-[#6a6a6a]">Up to {property.maxCapacity} guests</span>
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

                {/* ── Airbnb-style gallery ──────────────────────────────────── */}
                <div className="mb-8 relative">
                    {property.gallery.length === 1 ? (
                        <div className="aspect-[16/9] rounded-[14px] overflow-hidden">
                            <img src={property.gallery[0]} alt={property.name} className="w-full h-full object-cover" />
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-2 rounded-[14px] overflow-hidden" style={{ height: '460px' }}>
                            <div className="overflow-hidden cursor-pointer" onClick={() => setActiveImageIndex(0)}>
                                <img
                                    src={property.gallery[activeImageIndex]}
                                    alt={property.name}
                                    className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {property.gallery.slice(1, 5).map((img: string, i: number) => (
                                    <div
                                        key={i}
                                        className="overflow-hidden cursor-pointer"
                                        onClick={() => setActiveImageIndex(i + 1)}
                                    >
                                        <img
                                            src={img}
                                            alt={`Gallery ${i + 2}`}
                                            className="w-full h-full object-cover hover:scale-[1.02] transition-transform duration-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="absolute bottom-4 right-4 flex items-center gap-2">
                        {property.gallery.length > 1 && (
                            <>
                                <button
                                    onClick={() => setActiveImageIndex(i => Math.max(0, i - 1))}
                                    className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition"
                                >
                                    <ChevronLeft className="w-4 h-4 text-[#222222]" />
                                </button>
                                <button
                                    onClick={() => setActiveImageIndex(i => Math.min(property.gallery.length - 1, i + 1))}
                                    className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white transition"
                                >
                                    <ChevronRight className="w-4 h-4 text-[#222222]" />
                                </button>
                            </>
                        )}
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white/90 hover:bg-white text-[#222222] rounded-lg text-sm font-semibold shadow transition">
                            <Camera className="w-4 h-4" />
                            Show all photos ({property.gallery.length})
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white/90 hover:bg-white text-[#222222] rounded-lg text-sm font-semibold shadow transition">
                            <Video className="w-4 h-4" />
                            Virtual tour
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-white/90 hover:bg-white text-[#222222] rounded-lg text-sm font-semibold shadow transition">
                            <Grid className="w-4 h-4" />
                            Floor plan
                        </button>
                    </div>

                    <div className="absolute bottom-4 left-4 bg-black/60 text-white text-xs px-2 py-1 rounded-full">
                        {activeImageIndex + 1} / {property.gallery.length}
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
                                    Hosted by {property.host.name}
                                </h2>
                                <p className="text-[#6a6a6a] text-sm mt-0.5">
                                    {property.property_type} · {property.totalArea} sqm · Up to {property.maxCapacity} guests
                                </p>
                            </div>
                            <img
                                src={property.host.avatar ?? undefined}
                                alt={property.host.name}
                                className="w-14 h-14 rounded-full object-cover shrink-0"
                            />
                        </div>

                        {/* Highlights */}
                        <div className="space-y-4 pb-6 border-b border-[#e5e5e5]">
                            <div className="flex items-center gap-4">
                                <BadgeCheck className="w-6 h-6 text-[#222222] shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-[#222222]">Verified venue</p>
                                    <p className="text-sm text-[#6a6a6a]">This venue has been inspected and verified by our team.</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <Award className="w-6 h-6 text-[#222222] shrink-0" />
                                <div>
                                    <p className="text-sm font-semibold text-[#222222]">Cancellation policy</p>
                                    <p className="text-sm text-[#6a6a6a]">{property.socialProof.cancellationPolicy}</p>
                                </div>
                            </div>
                        </div>

                        {/* Description */}
                        {property.vibeDescription && (
                            <div className="pb-6 border-b border-[#e5e5e5]">
                                <p className="text-[#222222] text-sm leading-relaxed">{property.vibeDescription}</p>
                            </div>
                        )}

                        {/* Quick overview grid */}
                        <div className="pb-6 border-b border-[#e5e5e5]">
                            <SectionTitle>Quick overview</SectionTitle>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <InfoPill icon={Building2} label="Property type" value={property.property_type} />
                                <InfoPill icon={Ruler} label="Total area" value={`${property.totalArea} sqm`} />
                                <InfoPill icon={Users} label="Indoor capacity" value={property.indoorCapacity} />
                                <InfoPill icon={Users} label="Outdoor capacity" value={property.outdoorCapacity} />
                                <InfoPill icon={DoorOpen} label="Rooms" value={property.numberOfRooms} />
                                <InfoPill icon={DoorOpen} label="Bathrooms" value={property.numberOfBathrooms} />
                                <InfoPill icon={ParkingCircle} label="Parking" value={`${property.parkingCapacity} spots`} />
                                <InfoPill icon={Calendar} label="Availability" value={property.availabilityCalendar} />
                            </div>
                        </div>

                        {/* Atmosphere & features */}
                        <div className="pb-6 border-b border-[#e5e5e5]">
                            <SectionTitle>Atmosphere & features</SectionTitle>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                {[
                                    { label: 'Architectural style', value: property.architecturalStyle },
                                    { label: 'Interior theme', value: property.interiorTheme },
                                    { label: 'Natural lighting', value: property.naturalLighting },
                                    { label: 'Ceiling height', value: property.ceilingHeight },
                                ].map(({ label, value }) => (
                                    <div key={label}>
                                        <p className="text-xs text-[#6a6a6a]">{label}</p>
                                        <p className="text-sm font-medium text-[#222222] mt-0.5">{value}</p>
                                    </div>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2 mb-4">
                                {property.uniqueFeatures.map((f: string, i: number) => (
                                    <span key={i} className="px-3 py-1 bg-[#f2f2f2] text-[#222222] rounded-full text-xs font-medium">
                                        {f}
                                    </span>
                                ))}
                            </div>
                            <div className="flex gap-4">
                                <button className="flex items-center gap-1.5 text-sm font-semibold text-[#222222] underline hover:text-[#ff385c] transition-colors">
                                    <Camera className="w-4 h-4" />
                                    Drone photos
                                </button>
                                <button className="flex items-center gap-1.5 text-sm font-semibold text-[#222222] underline hover:text-[#ff385c] transition-colors">
                                    <Moon className="w-4 h-4" />
                                    Night photos
                                </button>
                            </div>
                        </div>

                        {/* Technical infrastructure */}
                        <div className="pb-6 border-b border-[#e5e5e5]">
                            <div className="flex items-center justify-between mb-4">
                                <SectionTitle>Technical infrastructure</SectionTitle>
                                <span className="text-xs bg-[#fff1f2] text-[#ff385c] px-2 py-1 rounded-full font-medium">For professionals</span>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                                {[
                                    { label: 'Power capacity', value: property.powerCapacity },
                                    { label: 'Generator backup', value: property.generatorBackup },
                                    { label: 'WiFi speed', value: property.wifiSpeed },
                                    { label: 'Sound system', value: property.soundSystem },
                                    { label: 'Lighting system', value: property.lightingSystem },
                                    { label: 'AC capacity', value: property.airConditioning },
                                ].map(({ label, value }) => (
                                    <div key={label}>
                                        <p className="text-xs text-[#6a6a6a]">{label}</p>
                                        <p className="text-sm font-medium text-[#222222] mt-0.5">{value}</p>
                                    </div>
                                ))}
                                <div className="col-span-2">
                                    <p className="text-xs text-[#6a6a6a]">Equipment loading</p>
                                    <p className="text-sm font-medium text-[#222222] mt-0.5">{property.equipmentLoading}</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                {property.djBoothAvailable && (
                                    <span className="flex items-center gap-1 text-xs bg-[#f0fdf4] text-green-700 px-2 py-1 rounded-full font-medium">
                                        <Music className="w-3 h-3" />
                                        DJ booth
                                    </span>
                                )}
                                {property.stageAvailable && (
                                    <span className="flex items-center gap-1 text-xs bg-[#f0fdf4] text-green-700 px-2 py-1 rounded-full font-medium">
                                        <Mic className="w-3 h-3" />
                                        Stage available
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Rules */}
                        <div className="pb-6 border-b border-[#e5e5e5]">
                            <SectionTitle>Rules & restrictions</SectionTitle>
                            <div className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    {property.rules.allowedEventTypes.map((t: string, i: number) => (
                                        <span key={i} className="px-3 py-1 bg-[#f0fdf4] text-green-700 rounded-full text-xs font-medium">
                                            {t}
                                        </span>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    {[
                                        { icon: Volume2, label: 'Max sound level', value: property.rules.maxSoundLevel },
                                        { icon: Clock, label: 'Music cutoff', value: property.rules.musicCutoffTime },
                                        { icon: GlassWater, label: 'Alcohol policy', value: property.rules.alcoholPolicy },
                                        { icon: Key, label: 'Age restriction', value: property.rules.ageRestrictions },
                                    ].map(({ icon: Icon, label, value }) => (
                                        <div key={label} className="flex items-start gap-2">
                                            <Icon className="w-4 h-4 text-[#6a6a6a] mt-0.5 shrink-0" />
                                            <div>
                                                <p className="text-xs text-[#6a6a6a]">{label}</p>
                                                <p className="text-sm text-[#222222]">{value}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div>
                                    <p className="text-xs text-[#6a6a6a] mb-1.5">Required permits</p>
                                    <div className="flex flex-wrap gap-2">
                                        {property.rules.requiredPermits.map((p: string, i: number) => (
                                            <span key={i} className="px-2 py-1 bg-[#f2f2f2] text-[#6a6a6a] rounded text-xs">
                                                {p}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Safety */}
                        <div className="pb-6 border-b border-[#e5e5e5]">
                            <SectionTitle>Safety & compliance</SectionTitle>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="flex items-center gap-2">
                                    <DoorOpen className="w-4 h-4 text-[#6a6a6a]" />
                                    <span className="text-sm text-[#222222]">{property.safety.fireExits} fire exits</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-[#6a6a6a]" />
                                    <span className="text-sm text-[#222222]">{property.safety.cctv ? 'CCTV' : 'No CCTV'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-[#6a6a6a]" />
                                    <span className="text-sm text-[#222222]">On-site manager</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-[#6a6a6a]" />
                                    <span className="text-sm text-[#222222]">First aid available</span>
                                </div>
                            </div>
                        </div>

                        {/* Map */}
                        <div className="pb-6 border-b border-[#e5e5e5]">
                            <SectionTitle>Where you'll host</SectionTitle>
                            <p className="text-sm text-[#6a6a6a] -mt-2 mb-4">{property.exactLocation}</p>
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                {[
                                    { label: 'Accessibility', value: property.locationInfo.accessibility },
                                    { label: 'Neighborhood', value: property.locationInfo.neighborhoodType },
                                    { label: 'Privacy rating', value: property.locationInfo.privacyRating },
                                ].map(({ label, value }) => (
                                    <div key={label}>
                                        <p className="text-xs text-[#6a6a6a]">{label}</p>
                                        <p className="text-sm font-medium text-[#222222]">{value}</p>
                                    </div>
                                ))}
                                <div>
                                    <p className="text-xs text-[#6a6a6a]">Nearby landmarks</p>
                                    <p className="text-sm font-medium text-[#222222]">{property.locationInfo.nearbyLandmarks.join(', ')}</p>
                                </div>
                            </div>
                            <MemoizedMapView lat={lat} lng={lng} propertyTitle={property.name} />
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

                        {/* Credibility */}
                        <div className="pb-6 border-b border-[#e5e5e5] rounded-[14px] border border-[#e5e5e5] p-5">
                            <SectionTitle>Credibility</SectionTitle>
                            <div className="grid grid-cols-2 gap-4 mb-4">
                                <div>
                                    <p className="text-sm font-semibold text-[#222222]">
                                        {property.verifiedVenue ? 'Verified venue' : 'Unverified'}
                                    </p>
                                    <p className="text-xs text-[#6a6a6a]">
                                        {property.verifiedVenue ? 'Inspected by our team' : 'Pending verification'}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-[#222222]">{property.socialProof.cancellationPolicy}</p>
                                    <p className="text-xs text-[#6a6a6a]">cancellation policy</p>
                                </div>
                            </div>
                        </div>

                        {/* Chat */}
                        <PropertyChat
                            propertyId={property.id}
                            host={{
                                id: realProperty.owner?.id,
                                name: property.host.name,
                                avatar: property.host.avatar,
                                verified: property.verifiedVenue,
                            }}
                            currentUser={currentUser}
                            isAuthenticated={isAuthenticated}
                        />
                    </div>

                    {/* ── Right sticky booking card ──────────────────────────── */}
                    <div>
                        <div className="sticky top-24">
                            <div
                                className="
                                    bg-white border border-[#e5e5e5] rounded-[20px] p-6
                                    shadow-[rgba(0,0,0,0.02)_0px_0px_0px_1px,rgba(0,0,0,0.04)_0px_2px_6px,rgba(0,0,0,0.1)_0px_4px_8px]
                                "
                            >
                                <h3 className="text-lg font-semibold text-[#222222] mb-4">Book this venue</h3>

                                {/* Price */}
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <span className="text-2xl font-semibold text-[#222222]">
                                            {property.currency} {property.startingPrice.toLocaleString()}
                                        </span>
                                        <span className="text-[#6a6a6a] text-sm"> /{property.priceUnit}</span>
                                    </div>
                                    {property.verifiedVenue && (
                                        <div className="flex items-center gap-1">
                                            <BadgeCheck className="w-4 h-4 text-[#ff385c]" />
                                            <span className="text-xs text-[#ff385c] font-medium">Verified</span>
                                        </div>
                                    )}
                                </div>

                                {/* Rate type selector */}
                                <div className="mb-4">
                                    <p className="text-[10px] font-bold text-[#222222] uppercase tracking-wide mb-2">Rate type</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        {rateOptions.map(({ key, label }) => (
                                            <button
                                                key={key}
                                                onClick={() => setSelectedRate(key)}
                                                className={`p-2 text-sm rounded-[8px] border transition font-medium ${
                                                    selectedRate === key
                                                        ? 'bg-[#222222] text-white border-[#222222]'
                                                        : 'border-[#c1c1c1] text-[#222222] hover:border-[#222222]'
                                                }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Booking form */}
                                <div className="border border-[#c1c1c1] rounded-[8px] overflow-hidden mb-3 divide-y divide-[#c1c1c1]">
                                    <div className="p-3">
                                        <p className="text-[10px] font-bold text-[#222222] uppercase tracking-wide mb-1">Event type</p>
                                        <select
                                            value={eventType}
                                            onChange={e => setEventType(e.target.value)}
                                            className="w-full text-sm font-medium text-[#222222] focus:outline-none bg-transparent"
                                        >
                                            <option value="wedding">Wedding</option>
                                            <option value="corporate">Corporate event</option>
                                            <option value="film">Film shoot</option>
                                            <option value="party">Private party</option>
                                            <option value="product-launch">Product launch</option>
                                            <option value="conference">Conference</option>
                                        </select>
                                    </div>
                                    <div className="grid grid-cols-2 divide-x divide-[#c1c1c1]">
                                        <div className="p-3">
                                            <p className="text-[10px] font-bold text-[#222222] uppercase tracking-wide mb-1">Date</p>
                                            <input
                                                type="date"
                                                value={eventDate}
                                                onChange={e => setEventDate(e.target.value)}
                                                className="w-full text-sm font-medium text-[#222222] focus:outline-none bg-transparent"
                                            />
                                        </div>
                                        <div className="p-3">
                                            <p className="text-[10px] font-bold text-[#222222] uppercase tracking-wide mb-1">Start time</p>
                                            <input
                                                type="time"
                                                value={eventTime}
                                                onChange={e => setEventTime(e.target.value)}
                                                className="w-full text-sm font-medium text-[#222222] focus:outline-none bg-transparent"
                                            />
                                        </div>
                                    </div>
                                    <div className="p-3">
                                        <p className="text-[10px] font-bold text-[#222222] uppercase tracking-wide mb-1">
                                            Number of guests (max {property.maxCapacity})
                                        </p>
                                        <input
                                            type="number"
                                            value={guestCount}
                                            onChange={e => setGuestCount(Number(e.target.value))}
                                            min={1}
                                            max={property.maxCapacity}
                                            className="w-full text-sm font-medium text-[#222222] focus:outline-none bg-transparent"
                                        />
                                    </div>
                                </div>

                                {/* CTA */}
                                <button className="w-full py-3 bg-[#ff385c] hover:bg-[#e00b41] text-white font-semibold rounded-[8px] transition-colors mb-3 flex items-center justify-center gap-2">
                                    <MessageCircle className="w-4 h-4" />
                                    Check availability
                                </button>
                                <p className="text-xs text-[#6a6a6a] text-center mb-4">You'll receive a detailed quote within 2 hours</p>

                                {/* Price breakdown */}
                                <div className="space-y-2 border-t border-[#e5e5e5] pt-4">
                                    <div className="flex justify-between text-sm text-[#222222]">
                                        <span className="underline">Venue rental ({selectedRate})</span>
                                        <span>{property.currency} {getPriceForSelectedRate().toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-[#222222]">
                                        <span className="underline">Cleaning fee</span>
                                        <span>{property.currency} {property.pricing.cleaningFee.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-sm text-[#6a6a6a]">
                                        <span>Security deposit (refundable)</span>
                                        <span>{property.currency} {property.pricing.securityDeposit.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between font-semibold text-[#222222] pt-2 border-t border-[#e5e5e5]">
                                        <span>Subtotal</span>
                                        <span>
                                            {property.currency}{' '}
                                            {(getPriceForSelectedRate() + property.pricing.cleaningFee).toLocaleString()}
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
                                    <input
                                        type="text"
                                        value={companyName}
                                        onChange={e => setCompanyName(e.target.value)}
                                        placeholder="Company / Organization (optional)"
                                        className="w-full px-3 py-2 border border-[#c1c1c1] rounded-[8px] text-sm text-[#222222] placeholder-[#6a6a6a] focus:outline-none focus:border-[#222222]"
                                    />
                                </div>

                                {/* Trust badges */}
                                <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-[#f2f2f2]">
                                    <div className="flex items-center gap-1">
                                        <Shield className="w-4 h-4 text-[#6a6a6a]" />
                                        <span className="text-xs text-[#6a6a6a]">Secure booking</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <Award className="w-4 h-4 text-[#6a6a6a]" />
                                        <span className="text-xs text-[#6a6a6a]">Verified venue</span>
                                    </div>
                                </div>

                                <p className="text-xs text-[#6a6a6a] text-center mt-3">
                                    {property.socialProof.cancellationPolicy}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CommercialPropertyDetails;

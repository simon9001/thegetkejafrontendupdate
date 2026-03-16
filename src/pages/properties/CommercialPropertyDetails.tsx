import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { useGetPropertyByIdQuery } from '../../features/Api/PropertiesApi';
import { useGetProximityIntelligenceQuery } from '../../features/Api/SpatialApi';
import PropertyChat from '../../components/property/PropertyChat';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

import {
    Heart,
    Share2,
    Star,
    MapPin,
    Camera,
    Video,
    Grid,
    Home,
    Ruler,
    Users,
    Calendar,
    Clock,
    Zap,
    Music,
    Mic,
    Hospital,
    Bus,
    School,
    Shield,
    Eye,
    Award,
    BadgeCheck,
    Moon,
    ParkingCircle,
    DoorOpen,
    Building2,
    AlertTriangle,
    Volume2,
    GlassWater,
    Sparkles,
    Key,
    Ban,
    MessageCircle,
    User
} from 'lucide-react';
import Layout from '../../components/layout/Layout';

// Memoized MapView to prevent expensive re-renders
const MemoizedMapView = React.memo(({ lat, lng, propertyTitle }: { lat: number, lng: number, propertyTitle: string }) => {
    return (
        <div className="h-[300px] w-full rounded-xl overflow-hidden border border-gray-200">
            <MapContainer
                center={[lat, lng]}
                zoom={15}
                scrollWheelZoom={false}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]}>
                    <Popup>{propertyTitle}</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
});

const CommercialPropertyDetails: React.FC = () => {
    const { id = '' } = useParams();
    const { data: propertyData, isLoading: isPropertyLoading } = useGetPropertyByIdQuery(id);

    // Memoize the property data to prevent unnecessary re-renders of heavy children
    const realProperty = useMemo(() => propertyData, [propertyData]);

    const lat = useMemo(() => realProperty?.location?.location.coordinates[1] || 31.6148, [realProperty]);
    const lng = useMemo(() => realProperty?.location?.location.coordinates[0] || 77.3456, [realProperty]);

    const { data: proximityData } = useGetProximityIntelligenceQuery({ lat, lng }, {
        skip: !realProperty
    });
    const { isAuthenticated, user: currentUser } = useSelector((state: RootState) => state.authSlice);
    const navigate = useNavigate();

    if (isPropertyLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9F7F2]">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-[#D4A373] border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-[#1B2430] font-medium animate-pulse">Loading venue details...</p>
                </div>
            </div>
        );
    }

    if (!realProperty) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F9F7F2]">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-[#1B2430] mb-2">Venue Not Found</h2>
                    <p className="text-gray-500 mb-6">The venue you're looking for might have been moved or deleted.</p>
                    <button
                        onClick={() => navigate('/')}
                        className="px-6 py-2 bg-[#1B2430] text-white rounded-full font-medium transition hover:shadow-lg"
                    >
                        Back to Home
                    </button>
                </div>
            </div>
        );
    }

    const [selectedRate, setSelectedRate] = useState<'hourly' | 'half-day' | 'full-day' | 'weekend'>('full-day');
    const [eventType, setEventType] = useState('wedding');
    const [guestCount, setGuestCount] = useState(100);
    const [eventDate, setEventDate] = useState('');
    const [eventTime, setEventTime] = useState('');
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    // Comprehensive commercial property data - Merge real with mock for UI completeness
    const property = {
        ...realProperty,
        id: realProperty.id,
        name: realProperty.title,
        vibeDescription: realProperty.description || 'A stunning venue perfect for your next big event.',
        cityLocation: realProperty.location?.address?.split(',').slice(-3).join(',') || 'Location unavailable',
        exactLocation: realProperty.location?.address || 'Address unavailable',
        startingPrice: realProperty.price_per_day || realProperty.price_per_month || 50000,
        priceUnit: realProperty.price_per_day ? 'day' : 'month',
        maxCapacity: realProperty.capacity || 500,
        verifiedVenue: true,
        rating: 4.9,
        reviews: 87,

        // Gallery
        gallery: realProperty.images?.map((img: any) => img.image_url) || [
            'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?q=80&w=2070&auto=format&fit=crop'
        ],

        // Mocking the complex fields for UI richness if not in backend
        totalArea: realProperty.size || 2500,
        indoorCapacity: Math.floor((realProperty.capacity || 500) * 0.6),
        outdoorCapacity: Math.floor((realProperty.capacity || 500) * 0.4),
        numberOfRooms: realProperty.bedrooms || 6,
        numberOfBathrooms: realProperty.bathrooms || 8,
        parkingCapacity: 50,
        property_type: realProperty.property_type || 'Convention Center',
        availabilityCalendar: 'Available for 2024/2025 bookings',

        pricing: {
            hourly: (realProperty.price_per_day || (realProperty.price_per_month ? realProperty.price_per_month / 30 : 50000)) / 8,
            halfDay: (realProperty.price_per_day || 50000) * 0.7,
            fullDay: realProperty.price_per_day || 50000,
            weekend: (realProperty.price_per_day || 50000) * 1.5,
            securityDeposit: 50000,
            cleaningFee: 10000,
        },

        rules: {
            allowedEventTypes: ['Weddings', 'Corporate events', 'Product launches', 'Film shoots', 'Private parties'],
            maxSoundLevel: '85 dB after 10 PM',
            musicCutoffTime: '1 AM',
            alcoholPolicy: 'Permitted with catering license',
            requiredPermits: ['Event permit', 'Catering license', 'Alcohol permit'],
            ageRestrictions: '21+ for alcohol service',
        },

        host: {
            name: realProperty.owner?.full_name || 'Host',
            avatar: realProperty.owner?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2070&auto=format&fit=crop',
            responseRate: 98,
        },

        socialProof: {
            responseTime: '< 2 hours',
            eventsHosted: 156,
            rating: 4.9,
            reviews: 87,
            pastBrands: ['Vogue', 'Netflix', 'Safaricom', 'BMW', 'Heineken'],
            cancellationPolicy: 'Moderate - Full refund 7 days prior to event',
        },

        // Carry over other mock fields for the WOW factor
        architecturalStyle: 'Contemporary Glass & Steel',
        interiorTheme: 'Minimalist with warm wood accents',
        naturalLighting: 'Floor-to-ceiling windows on three sides, skylights',
        uniqueFeatures: [
            '12 ft glass walls',
            'Grand staircase',
            'Rooftop deck with city views',
            'Private lake access',
        ],
        ceilingHeight: '8-12 meters',
        powerCapacity: '200 amps, 3-phase available',
        generatorBackup: '125 kVA diesel generator',
        wifiSpeed: '250 Mbps fiber',
        soundSystem: 'Built-in surround sound with zone control',
        lightingSystem: 'Programmable RGB LED throughout',
        djBoothAvailable: true,
        stageAvailable: true,
        airConditioning: '200 ton centralized AC',
        equipmentLoading: 'Ground-level roll-in access, freight elevator',
        safety: {
            fireExits: 6,
            cctv: true,
        },
        locationInfo: {
            accessibility: 'Paved road, 2km from highway',
            neighborhoodType: 'Private hillside estate',
            privacyRating: 'High - gated community',
            nearbyLandmarks: ['Local Landmark 1', 'Local Landmark 2'],
        }
    };



    const getPriceForSelectedRate = () => {
        switch (selectedRate) {
            case 'hourly': return property.pricing.hourly;
            case 'half-day': return property.pricing.halfDay;
            case 'full-day': return property.pricing.fullDay;
            case 'weekend': return property.pricing.weekend;
            default: return property.pricing.fullDay;
        }
    };

    // Section Header Component
    const SectionHeader = ({ title, icon: Icon, badge }: { title: string; icon: any; badge?: string }) => (
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
                <div className="p-2 bg-[#D4A373]/10 rounded-lg">
                    <Icon className="w-5 h-5 text-[#D4A373]" />
                </div>
                <h2 className="text-lg font-semibold text-[#1B2430]">{title}</h2>
            </div>
            {badge && (
                <span className="text-xs bg-[#D4A373]/10 text-[#D4A373] px-2 py-1 rounded-full">
                    {badge}
                </span>
            )}
        </div>
    );

    // Info Pill Component
    const InfoPill = ({ icon: Icon, label, value }: { icon: any; label: string; value: string | number }) => (
        <div className="flex items-center gap-2 p-2 bg-gray-50 rounded-lg">
            <Icon className="w-4 h-4 text-[#D4A373]" />
            <div>
                <p className="text-xs text-gray-500">{label}</p>
                <p className="text-sm font-medium text-[#1B2430]">{value}</p>
            </div>
        </div>
    );

    // Moved outside component

    return (
        <Layout showSearch={false}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                {/* Hero Section - Immediate Impact */}
                <div className="mb-6">
                    {/* Title Row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-3">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h1 className="text-2xl lg:text-3xl font-bold text-[#1B2430]">
                                    {property.name}
                                </h1>
                                {property.verifiedVenue && (
                                    <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-600 rounded-full text-xs">
                                        <BadgeCheck className="w-4 h-4" />
                                        <span>Verified venue</span>
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-600 text-sm lg:text-base max-w-2xl">
                                {property.vibeDescription}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2 hover:bg-gray-100 rounded-full transition">
                                <Share2 className="w-5 h-5 text-[#1B2430]" />
                            </button>
                            <button className="p-2 hover:bg-gray-100 rounded-full transition">
                                <Heart className="w-5 h-5 text-[#1B2430]" />
                            </button>
                        </div>
                    </div>

                    {/* Key Metrics Row */}
                    <div className="flex flex-wrap items-center gap-4 mb-4">
                        <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4 text-[#D4A373]" />
                            <span className="text-sm text-gray-600">{property.cityLocation}</span>
                        </div>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 fill-current text-[#D4A373]" />
                            <span className="text-sm font-medium">{property.rating}</span>
                            <span className="text-sm text-gray-500">({property.reviews} reviews)</span>
                        </div>
                        <div className="w-px h-4 bg-gray-300"></div>
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Up to {property.maxCapacity} guests</span>
                        </div>
                    </div>

                    {/* Price and Quick Actions */}
                    <div className="flex flex-wrap items-center gap-4 p-4 bg-amber-50 rounded-xl">
                        <div>
                            <span className="text-2xl font-bold text-[#1B2430]">₹{property.startingPrice.toLocaleString()}</span>
                            <span className="text-gray-500"> / {property.priceUnit}</span>
                        </div>
                        <div className="w-px h-8 bg-amber-200"></div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-[#D4A373]" />
                                <span className="text-sm">Check availability</span>
                            </div>
                            <button
                                className="flex items-center gap-2 px-4 py-2 bg-[#D4A373] text-white rounded-lg hover:bg-[#E6B17E] transition"
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>Contact host</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Hero Gallery */}
                <div className="mb-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                        {/* Main Large Image */}
                        <div className="lg:col-span-2 aspect-[16/9] rounded-xl overflow-hidden">
                            <img
                                src={property.gallery[activeImageIndex]}
                                alt={property.name}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        {/* Side Images Grid */}
                        {property.gallery.slice(1, 5).map((img, idx) => (
                            <div
                                key={idx}
                                className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition"
                                onClick={() => setActiveImageIndex(idx + 1)}
                            >
                                <img src={img} alt={`Gallery ${idx + 2}`} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>

                    {/* Gallery Action Buttons */}
                    <div className="flex items-center justify-end gap-2 mt-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-black/70 text-white rounded-lg text-sm hover:bg-black transition">
                            <Camera className="w-4 h-4" />
                            View all photos ({property.gallery.length})
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-black/70 text-white rounded-lg text-sm hover:bg-black transition">
                            <Video className="w-4 h-4" />
                            Virtual tour
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 bg-black/70 text-white rounded-lg text-sm hover:bg-black transition">
                            <Grid className="w-4 h-4" />
                            Floor plan
                        </button>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Detailed Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Overview Summary - Quick Decision Data */}
                        <div>
                            <SectionHeader title="Quick Overview" icon={Home} badge="Decision data" />
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

                        {/* Atmosphere & Features */}
                        <div>
                            <SectionHeader title="Atmosphere & Features" icon={Sparkles} />
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-xs text-gray-500">Architectural style</p>
                                        <p className="text-sm font-medium">{property.architecturalStyle}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Interior theme</p>
                                        <p className="text-sm font-medium">{property.interiorTheme}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Natural lighting</p>
                                        <p className="text-sm font-medium">{property.naturalLighting}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Ceiling height</p>
                                        <p className="text-sm font-medium">{property.ceilingHeight}</p>
                                    </div>
                                </div>

                                {/* Unique Features */}
                                <div>
                                    <p className="text-sm font-medium text-[#1B2430] mb-2">Unique features</p>
                                    <div className="flex flex-wrap gap-2">
                                        {property.uniqueFeatures.map((feature, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                                                {feature}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Media Types */}
                                <div className="flex gap-4 pt-2">
                                    <button className="flex items-center gap-2 text-sm text-[#D4A373] hover:text-[#E6B17E]">
                                        <Camera className="w-4 h-4" />
                                        Drone photos
                                    </button>
                                    <button className="flex items-center gap-2 text-sm text-[#D4A373] hover:text-[#E6B17E]">
                                        <Moon className="w-4 h-4" />
                                        Night photos
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Technical & Infrastructure - Critical for professionals */}
                        <div className="bg-gray-50 p-5 rounded-xl">
                            <SectionHeader title="Technical Infrastructure" icon={Zap} badge="For professionals" />
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div>
                                    <p className="text-xs text-gray-500">Power capacity</p>
                                    <p className="text-sm font-medium">{property.powerCapacity}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Generator backup</p>
                                    <p className="text-sm font-medium">{property.generatorBackup}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">WiFi speed</p>
                                    <p className="text-sm font-medium">{property.wifiSpeed}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Sound system</p>
                                    <p className="text-sm font-medium">{property.soundSystem}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">Lighting system</p>
                                    <p className="text-sm font-medium">{property.lightingSystem}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500">AC capacity</p>
                                    <p className="text-sm font-medium">{property.airConditioning}</p>
                                </div>
                                <div className="col-span-2">
                                    <p className="text-xs text-gray-500">Equipment loading</p>
                                    <p className="text-sm font-medium">{property.equipmentLoading}</p>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-3">
                                {property.djBoothAvailable && (
                                    <span className="flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">
                                        <Music className="w-3 h-3" />
                                        DJ booth
                                    </span>
                                )}
                                {property.stageAvailable && (
                                    <span className="flex items-center gap-1 text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full">
                                        <Mic className="w-3 h-3" />
                                        Stage available
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Rules & Restrictions */}
                        <div>
                            <SectionHeader title="Rules & Restrictions" icon={Ban} />
                            <div className="space-y-3">
                                <div className="flex flex-wrap gap-2">
                                    {property.rules.allowedEventTypes.map((type, idx) => (
                                        <span key={idx} className="px-3 py-1 bg-green-50 text-green-600 rounded-full text-xs">
                                            {type}
                                        </span>
                                    ))}
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="flex items-start gap-2">
                                        <Volume2 className="w-4 h-4 text-[#D4A373] mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500">Max sound level</p>
                                            <p className="text-sm">{property.rules.maxSoundLevel}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Clock className="w-4 h-4 text-[#D4A373] mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500">Music cutoff</p>
                                            <p className="text-sm">{property.rules.musicCutoffTime}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <GlassWater className="w-4 h-4 text-[#D4A373] mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500">Alcohol policy</p>
                                            <p className="text-sm">{property.rules.alcoholPolicy}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-2">
                                        <Key className="w-4 h-4 text-[#D4A373] mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500">Age restriction</p>
                                            <p className="text-sm">{property.rules.ageRestrictions}</p>
                                        </div>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Required permits</p>
                                    <div className="flex flex-wrap gap-2">
                                        {property.rules.requiredPermits.map((permit, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                {permit}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Safety & Compliance */}
                        <div>
                            <SectionHeader title="Safety & Compliance" icon={Shield} />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                <div className="flex items-center gap-2">
                                    <DoorOpen className="w-4 h-4 text-[#D4A373]" />
                                    <span className="text-sm">{property.safety.fireExits} fire exits</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Eye className="w-4 h-4 text-[#D4A373]" />
                                    <span className="text-sm">{property.safety.cctv ? 'CCTV' : 'No CCTV'}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-[#D4A373]" />
                                    <span className="text-sm">On-site manager</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-[#D4A373]" />
                                    <span className="text-sm">First aid available</span>
                                </div>
                            </div>
                        </div>

                        {/* Location Intelligence - Updated to use locationInfo */}
                        <div>
                            <SectionHeader title="Location Intelligence" icon={MapPin} />
                            <div className="space-y-3">
                                <div className="flex items-start gap-2">
                                    <MapPin className="w-4 h-4 text-[#D4A373] mt-0.5" />
                                    <span className="text-sm text-gray-600">{property.exactLocation}</span>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <p className="text-xs text-gray-500">Accessibility</p>
                                        <p className="text-sm">{property.locationInfo.accessibility}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Neighborhood</p>
                                        <p className="text-sm">{property.locationInfo.neighborhoodType}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500">Privacy rating</p>
                                        <p className="text-sm text-green-600">{property.locationInfo.privacyRating}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-500 mb-1">Nearby landmarks</p>
                                    <div className="flex flex-wrap gap-2">
                                        {property.locationInfo.nearbyLandmarks.map((landmark, idx) => (
                                            <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                                {landmark}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                {/* Map View */}
                                <div className="mt-4">
                                    <MemoizedMapView lat={lat} lng={lng} propertyTitle={property.name} />
                                </div>
                            </div>
                        </div>

                        {/* Proximity Intelligence */}
                        {proximityData && (
                            <div>
                                <SectionHeader title="Proximity Intelligence" icon={Eye} badge="Nearby amenities" />
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {proximityData.landmarks.map((landmark, idx) => {
                                        let Icon = Building2;
                                        if (landmark.type.toLowerCase().includes('university')) Icon = School;
                                        if (landmark.type.toLowerCase().includes('hospital')) Icon = Hospital;
                                        if (landmark.type.toLowerCase().includes('transit') || landmark.type.toLowerCase().includes('bus')) Icon = Bus;

                                        return (
                                            <div key={idx} className="flex flex-col p-3 bg-gray-50 rounded-lg border border-gray-100">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <Icon className="w-4 h-4 text-[#D4A373]" />
                                                    <span className="text-xs font-semibold text-gray-700">{landmark.name}</span>
                                                </div>
                                                <div className="flex justify-between items-center text-[10px] text-gray-500">
                                                    <span>{(landmark.distance_meters / 1000).toFixed(1)} km away</span>
                                                    <span className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {landmark.walking_time_mins} min walk
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* Social Proof & Credibility */}
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-5 rounded-xl">
                            <SectionHeader title="Credibility" icon={Award} />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div>
                                    <p className="text-2xl font-bold text-[#1B2430]">{property.socialProof.eventsHosted}+</p>
                                    <p className="text-xs text-gray-500">events hosted</p>
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-[#1B2430]">{property.socialProof.rating}</p>
                                    <p className="text-xs text-gray-500">rating ({property.socialProof.reviews} reviews)</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#1B2430]">{property.socialProof.responseTime}</p>
                                    <p className="text-xs text-gray-500">response time</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-[#1B2430]">{property.host.responseRate}%</p>
                                    <p className="text-xs text-gray-500">response rate</p>
                                </div>
                            </div>
                            <div className="mt-3">
                                <p className="text-xs text-gray-500 mb-1">Past brands & productions</p>
                                <div className="flex flex-wrap gap-2">
                                    {property.socialProof.pastBrands.map((brand, idx) => (
                                        <span key={idx} className="px-2 py-1 bg-white text-[#1B2430] rounded text-xs font-medium">
                                            {brand}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Chat Section */}
                        <PropertyChat
                            propertyId={property.id}
                            host={{
                                id: realProperty.owner?.id,
                                name: property.host.name,
                                avatar: property.host.avatar,
                                responseRate: property.host.responseRate,
                                responseTime: property.socialProof.responseTime,
                                verified: true
                            }}
                            currentUser={currentUser}
                            isAuthenticated={isAuthenticated}
                        />
                    </div>

                    {/* Right Column - Booking & Pricing Card */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 border border-gray-200 rounded-xl p-6 shadow-lg">
                            <h3 className="text-lg font-semibold text-[#1B2430] mb-4">Book this venue</h3>

                            {/* Rate Selection */}
                            <div className="mb-4">
                                <label className="text-xs text-gray-500 mb-1 block">SELECT RATE TYPE</label>
                                <div className="grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => setSelectedRate('hourly')}
                                        className={`p-2 text-sm rounded-lg border transition ${selectedRate === 'hourly'
                                            ? 'bg-[#D4A373] text-white border-[#D4A373]'
                                            : 'border-gray-200 hover:border-[#D4A373]'
                                            }`}
                                    >
                                        Hourly
                                    </button>
                                    <button
                                        onClick={() => setSelectedRate('half-day')}
                                        className={`p-2 text-sm rounded-lg border transition ${selectedRate === 'half-day'
                                            ? 'bg-[#D4A373] text-white border-[#D4A373]'
                                            : 'border-gray-200 hover:border-[#D4A373]'
                                            }`}
                                    >
                                        Half-day
                                    </button>
                                    <button
                                        onClick={() => setSelectedRate('full-day')}
                                        className={`p-2 text-sm rounded-lg border transition ${selectedRate === 'full-day'
                                            ? 'bg-[#D4A373] text-white border-[#D4A373]'
                                            : 'border-gray-200 hover:border-[#D4A373]'
                                            }`}
                                    >
                                        Full-day
                                    </button>
                                    <button
                                        onClick={() => setSelectedRate('weekend')}
                                        className={`p-2 text-sm rounded-lg border transition ${selectedRate === 'weekend'
                                            ? 'bg-[#D4A373] text-white border-[#D4A373]'
                                            : 'border-gray-200 hover:border-[#D4A373]'
                                            }`}
                                    >
                                        Weekend
                                    </button>
                                </div>
                            </div>

                            {/* Event Type */}
                            <div className="mb-4">
                                <label className="text-xs text-gray-500 mb-1 block">EVENT TYPE</label>
                                <select
                                    value={eventType}
                                    onChange={(e) => setEventType(e.target.value)}
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A373]/40"
                                >
                                    <option value="wedding">Wedding</option>
                                    <option value="corporate">Corporate event</option>
                                    <option value="film">Film shoot</option>
                                    <option value="party">Private party</option>
                                    <option value="product-launch">Product launch</option>
                                    <option value="conference">Conference</option>
                                </select>
                            </div>

                            {/* Guest Count */}
                            <div className="mb-4">
                                <label className="text-xs text-gray-500 mb-1 block">NUMBER OF GUESTS</label>
                                <input
                                    type="number"
                                    value={guestCount}
                                    onChange={(e) => setGuestCount(Number(e.target.value))}
                                    min={1}
                                    max={property.maxCapacity}
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A373]/40"
                                />
                                <p className="text-xs text-gray-400 mt-1">Max capacity: {property.maxCapacity}</p>
                            </div>

                            {/* Date & Time */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">DATE</label>
                                    <input
                                        type="date"
                                        value={eventDate}
                                        onChange={(e) => setEventDate(e.target.value)}
                                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A373]/40"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-gray-500 mb-1 block">START TIME</label>
                                    <input
                                        type="time"
                                        value={eventTime}
                                        onChange={(e) => setEventTime(e.target.value)}
                                        className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A373]/40"
                                    />
                                </div>
                            </div>

                            {/* Contact Details */}
                            <div className="space-y-2 mb-4">
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Your full name"
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A373]/40"
                                />
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="Phone number"
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A373]/40"
                                />
                                <input
                                    type="text"
                                    value={companyName}
                                    onChange={(e) => setCompanyName(e.target.value)}
                                    placeholder="Company / Organization (optional)"
                                    className="w-full p-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A373]/40"
                                />
                            </div>

                            {/* Price Breakdown */}
                            <div className="border-t border-gray-200 pt-4 mb-4">
                                <h4 className="font-medium text-[#1B2430] mb-3">Price breakdown</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Venue rental ({selectedRate})</span>
                                        <span className="font-medium">₹{getPriceForSelectedRate().toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Security deposit</span>
                                        <span className="font-medium">₹{property.pricing.securityDeposit.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Cleaning fee</span>
                                        <span className="font-medium">₹{property.pricing.cleaningFee.toLocaleString()}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-amber-600">
                                        <span>Subtotal</span>
                                        <span className="font-bold">₹{(getPriceForSelectedRate() + property.pricing.securityDeposit + property.pricing.cleaningFee).toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Book Button */}
                            <button className="w-full py-3 bg-[#D4A373] text-white font-bold rounded-lg hover:bg-[#E6B17E] transition shadow-lg mb-3">
                                Check availability
                            </button>

                            <p className="text-xs text-gray-500 text-center">
                                You'll receive a detailed quote within 2 hours
                            </p>

                            {/* Trust Badges */}
                            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-1">
                                    <Shield className="w-4 h-4 text-green-600" />
                                    <span className="text-xs text-gray-600">Secure booking</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Award className="w-4 h-4 text-[#D4A373]" />
                                    <span className="text-xs text-gray-600">Verified venue</span>
                                </div>
                            </div>

                            {/* Cancellation Policy */}
                            <div className="mt-3 text-center">
                                <span className="text-xs text-gray-400 cursor-help hover:text-gray-600">
                                    {property.socialProof.cancellationPolicy}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default CommercialPropertyDetails;
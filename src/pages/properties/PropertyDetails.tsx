import React, { useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import {
    Heart,
    Share2,
    Star,
    MapPin,
    Wifi,
    Car,
    Home,
    Ruler,
    Bed,
    Bath,
    Building2,
    CalendarDays,
    Shield,
    Eye,
    Clock,
    School,
    Hospital,
    Bus,
    Sun,
    Award,
    BadgeCheck,
    ChevronDown,
    ChevronUp,
    Camera,
    Video,
    Map,
    Grid,
    Layers,
    Navigation2,
    Monitor,
    Wind,
    Utensils,
    UserCircle,
    Droplets,
    Mountain,
    Sparkles
} from 'lucide-react';
import Layout from '../../components/layout/Layout';
// Removed redundant MapView import as we define a memoized one here
import { useGetProximityIntelligenceQuery } from '../../features/Api/SpatialApi';
import { useGetPropertyByIdQuery } from '../../features/Api/PropertiesApi';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import CommercialPropertyDetails from './CommercialPropertyDetails';
import PropertyChat from '../../components/property/PropertyChat';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Custom marker icon for Leaflet
const customMarkerIcon = new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

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
                <Marker position={[lat, lng]} icon={customMarkerIcon}>
                    <Popup>{propertyTitle}</Popup>
                </Marker>
            </MapContainer>
        </div>
    );
});

const PropertyDetails: React.FC = () => {
    const { id = '' } = useParams();
    const { data: property, isLoading: isPropertyLoading } = useGetPropertyByIdQuery(id);

    // Memoize the property data to prevent unnecessary re-renders of heavy children
    const realProperty = useMemo(() => property, [property]);

    const lat = useMemo(() => realProperty?.location?.location.coordinates[1] || 31.6148, [realProperty]);
    const lng = useMemo(() => realProperty?.location?.location.coordinates[0] || 77.3456, [realProperty]);

    const { data: proximityData, isLoading: isProximityLoading } = useGetProximityIntelligenceQuery({ lat, lng }, {
        skip: !realProperty
    });

    const [checkIn, setCheckIn] = useState('2024-02-04');
    const [checkOut, setCheckOut] = useState('2024-02-09');
    const [guests, setGuests] = useState(1);
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [showAllAmenities, setShowAllAmenities] = useState(false);
    const [fullName, setFullName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const { isAuthenticated, user: currentUser } = useSelector((state: RootState) => state.authSlice);

    // Helper function to render section headers
    const SectionHeader = ({ title, icon: Icon }: { title: string; icon: any }) => (
        <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-[#D4A373]/10 rounded-lg">
                <Icon className="w-5 h-5 text-[#D4A373]" />
            </div>
            <h2 className="text-lg font-semibold text-[#1B2430]">{title}</h2>
        </div>
    );

    if (isPropertyLoading) {
        return (
            <Layout showSearch={false}>
                <div className="flex items-center justify-center min-h-[60vh]">
                    <span className="loading loading-spinner loading-lg text-[#D4A373]"></span>
                </div>
            </Layout>
        );
    }

    if (!realProperty) {
        return (
            <Layout showSearch={false}>
                <div className="text-center py-20">
                    <h2 className="text-2xl font-bold text-gray-800">Property not found</h2>
                    <p className="text-gray-500 mt-2">The property you're looking for doesn't exist or has been removed.</p>
                </div>
            </Layout>
        );
    }

    // Switch to specialized view for commercial/recreational
    if (realProperty.category === 'commercial' || realProperty.category === 'recreational') {
        return <CommercialPropertyDetails />;
    }

    // Standard mapping for residential properties
    const propertyData = { // Renamed to propertyData to avoid conflict with `property` from useGetPropertyQuery
        id: realProperty.id,
        title: realProperty.title,
        description: realProperty.description,
        price: realProperty.price,
        currency: 'KSh',
        location: realProperty.location?.address || 'Nairobi, Kenya',
        type: realProperty.type || 'Apartment',
        rating: 4.8,
        reviews: 24,
        sizes: realProperty.size,
        bedrooms: realProperty.bedrooms,
        bathrooms: realProperty.bathrooms,
        floorLevel: '4th Floor',
        furnished: 'Fully Furnished',
        yearBuilt: 2022,
        internetSpeed: '50 Mbps',
        images: realProperty.images && realProperty.images.length > 0
            ? realProperty.images.map((img: any) => img.image_url)
            : [
                'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=2070&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1613490493576-7fde63acd811?q=80&w=2071&auto=format&fit=crop',
                'https://images.unsplash.com/photo-1613977257363-707ba9348227?q=80&w=2070&auto=format&fit=crop'
            ],
        host: {
            id: realProperty.owner?.id,
            name: realProperty.owner?.full_name || 'Admin Host',
            avatar: realProperty.owner?.avatar_url || 'https://img.daisyui.com/images/profile/demo/anon@192.webp',
            joined: 'Oct 2021',
            responseRate: 98,
            responseTime: 'within an hour',
            verified: true,
            properties: 12
        },
        amenities: [
            { name: 'High-speed WiFi', icon: Wifi },
            { name: 'Smart TV', icon: Monitor },
            { name: 'Air Conditioning', icon: Wind },
            { name: 'Full Kitchen', icon: Utensils },
            { name: 'Washer', icon: UserCircle },
            { name: 'Free Parking', icon: Car },
            { name: 'Swimming Pool', icon: Droplets },
            { name: 'Mountain View', icon: Mountain },
            { name: 'Cleaning Service', icon: Sparkles }
        ],
        status: {
            verifiedProperty: true,
            instantBook: true,
            views: 1240,
            dateListed: '2024-01-15'
        },
        pricing: {
            cleaningFee: 1500,
            serviceCharge: 800,
            tax: 500,
            securityDeposit: 5000
        },
        idealFor: ['Nature Lovers', 'Remote Workers', 'Small Families'],
        houseRules: [
            'Check-in: After 2:00 PM',
            'Check-out: 11:00 AM',
            'No smoking',
            'No pets',
            'No parties or events'
        ],
        communityVibe: 'Quiet, upscale residential community with a mix of professionals and families. Very safe for evening walks.',
        lightExposure: 'Excellent natural light with south-facing windows in the living room.'
    };

    // Section removed from inside component as it's now defined outside

    return (
        <Layout showSearch={false}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
                {/* Header with actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <div>
                        <h1 className="text-xl lg:text-2xl font-bold text-[#1B2430]">
                            {propertyData.title}
                        </h1>
                        <div className="flex items-center gap-2 mt-1">
                            <MapPin className="w-4 h-4 text-[#D4A373]" />
                            <span className="text-sm text-gray-600">{propertyData.location}</span>
                            {propertyData.status.verifiedProperty && (
                                <div className="flex items-center gap-1 px-2 py-0.5 bg-green-50 text-green-600 rounded-full text-xs">
                                    <BadgeCheck className="w-3 h-3" />
                                    <span>Verified</span>
                                </div>
                            )}
                        </div>
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

                {/* Rating and key stats */}
                <div className="flex flex-wrap items-center gap-4 mb-6">
                    <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current text-[#D4A373]" />
                        <span className="text-sm font-medium">{propertyData.rating}</span>
                        <span className="text-sm text-gray-500">({propertyData.reviews} reviews)</span>
                    </div>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">{propertyData.status.views} views</span>
                    </div>
                    <div className="w-px h-4 bg-gray-300"></div>
                    <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-sm text-gray-600">Listed {new Date(propertyData.status.dateListed).toLocaleDateString()}</span>
                    </div>
                </div>

                {/* Visual Proof Section - Image Gallery */}
                <div className="mb-8">
                    <SectionHeader title="Visual Tour" icon={Camera} />

                    {/* Main Image */}
                    <div className="relative aspect-[16/9] rounded-xl overflow-hidden mb-2">
                        <img
                            src={propertyData.images[activeImageIndex]}
                            alt={`Property view ${activeImageIndex + 1}`}
                            className="w-full h-full object-cover"
                        />

                        {/* Image Navigation Overlay */}
                        <div className="absolute inset-0 flex items-center justify-between px-4">
                            <button
                                onClick={() => setActiveImageIndex(prev => Math.max(0, prev - 1))}
                                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
                            >
                                <ChevronDown className="w-5 h-5 rotate-90" />
                            </button>
                            <button
                                onClick={() => setActiveImageIndex(prev => Math.min(propertyData.images.length - 1, prev + 1))}
                                className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition"
                            >
                                <ChevronDown className="w-5 h-5 -rotate-90" />
                            </button>
                        </div>

                        {/* Image Stats */}
                        <div className="absolute bottom-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                            {activeImageIndex + 1} / {propertyData.images.length}
                        </div>

                        {/* Action Buttons */}
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition">
                                <Camera className="w-5 h-5" />
                            </button>
                            <button className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition">
                                <Video className="w-5 h-5" />
                            </button>
                            <button className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition">
                                <Map className="w-5 h-5" />
                            </button>
                            <button className="p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition">
                                <Grid className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Thumbnail Grid */}
                    <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {propertyData.images.map((img, idx) => (
                            <button
                                key={idx}
                                onClick={() => setActiveImageIndex(idx)}
                                className={`aspect-square rounded-lg overflow-hidden border-2 transition ${activeImageIndex === idx ? 'border-[#D4A373]' : 'border-transparent'
                                    }`}
                            >
                                <img src={img} alt={`Thumb ${idx + 1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Detailed Info */}
                    <div className="lg:col-span-2 space-y-8">
                        {/* Host Info & Credibility */}
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full overflow-hidden">
                                    <img
                                        src={propertyData.host.avatar}
                                        alt={propertyData.host.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-semibold text-[#1B2430]">Hosted by {propertyData.host.name}</h3>
                                        {propertyData.host.verified && (
                                            <BadgeCheck className="w-4 h-4 text-[#D4A373]" />
                                        )}
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        Joined {propertyData.host.joined} · {propertyData.host.responseRate}% response rate · {propertyData.host.responseTime}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-sm font-medium text-[#1B2430]">{propertyData.host.properties} properties</div>
                                <div className="text-xs text-gray-500">Last active: today</div>
                            </div>
                        </div>

                        {/* Key Facts Grid */}
                        <div>
                            <SectionHeader title="Property Facts" icon={Home} />
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <Home className="w-5 h-5 text-[#D4A373] mb-2" />
                                    <div className="text-xs text-gray-500">Type</div>
                                    <div className="font-medium">{propertyData.type}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <Ruler className="w-5 h-5 text-[#D4A373] mb-2" />
                                    <div className="text-xs text-gray-500">Size</div>
                                    <div className="font-medium">{propertyData.sizes} m²</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <Bed className="w-5 h-5 text-[#D4A373] mb-2" />
                                    <div className="text-xs text-gray-500">Bedrooms</div>
                                    <div className="font-medium">{propertyData.bedrooms}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <Bath className="w-5 h-5 text-[#D4A373] mb-2" />
                                    <div className="text-xs text-gray-500">Bathrooms</div>
                                    <div className="font-medium">{propertyData.bathrooms}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <Building2 className="w-5 h-5 text-[#D4A373] mb-2" />
                                    <div className="text-xs text-gray-500">Floor</div>
                                    <div className="font-medium">{propertyData.floorLevel}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <Layers className="w-5 h-5 text-[#D4A373] mb-2" />
                                    <div className="text-xs text-gray-500">Furnished</div>
                                    <div className="font-medium">{propertyData.furnished}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <CalendarDays className="w-5 h-5 text-[#D4A373] mb-2" />
                                    <div className="text-xs text-gray-500">Year Built</div>
                                    <div className="font-medium">{propertyData.yearBuilt}</div>
                                </div>
                                <div className="p-3 bg-gray-50 rounded-lg">
                                    <Wifi className="w-5 h-5 text-[#D4A373] mb-2" />
                                    <div className="text-xs text-gray-500">Internet</div>
                                    <div className="font-medium">{propertyData.internetSpeed}</div>
                                </div>
                            </div>
                        </div>

                        {/* Amenities with Show More/Less */}
                        <div>
                            <SectionHeader title="What this place offers" icon={Layers} />
                            <div className="grid grid-cols-2 gap-4">
                                {(showAllAmenities ? propertyData.amenities : propertyData.amenities.slice(0, 6)).map((amenity, index) => {
                                    const Icon = amenity.icon;
                                    const details = (amenity as any).details;
                                    return (
                                        <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition">
                                            <Icon className="w-5 h-5 text-[#D4A373]" />
                                            <div>
                                                <span className="text-sm text-gray-600">{amenity.name}</span>
                                                {details && (
                                                    <p className="text-xs text-gray-400">{details}</p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {propertyData.amenities.length > 6 && (
                                <button
                                    onClick={() => setShowAllAmenities(!showAllAmenities)}
                                    className="flex items-center gap-1 text-sm text-[#D4A373] hover:text-[#E6B17E] mt-3"
                                >
                                    {showAllAmenities ? 'Show less' : `Show ${propertyData.amenities.length - 6} more amenities`}
                                    {showAllAmenities ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>
                            )}
                        </div>

                        {/* Neighborhood Intelligence */}
                        <div>
                            <SectionHeader title="Neighborhood Intelligence" icon={MapPin} />

                            {isProximityLoading ? (
                                <div className="animate-pulse flex space-x-4">
                                    <div className="flex-1 space-y-4 py-1">
                                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                        <div className="h-4 bg-gray-200 rounded"></div>
                                    </div>
                                </div>
                            ) : proximityData ? (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-2 gap-4">
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

                                    {proximityData.nearest_road && (
                                        <div className="p-3 bg-blue-50/30 border border-blue-100 rounded-lg flex items-center gap-3">
                                            <div className="p-2 bg-white rounded-full shadow-sm">
                                                <Navigation2 className="w-4 h-4 text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-medium text-gray-800">
                                                    Accessible via {proximityData.nearest_road.name}
                                                </p>
                                                <p className="text-[10px] text-gray-500">
                                                    {proximityData.nearest_road.surface} road • {proximityData.nearest_road.distance_meters.toFixed(0)}m from entrance
                                                </p>
                                            </div>
                                        </div>
                                    )}

                                    <MemoizedMapView
                                        lat={lat}
                                        lng={lng}
                                        propertyTitle={propertyData.title}
                                    />
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500 italic">No proximity data available for this location.</p>
                            )}
                        </div>

                        {/* Emotional Context */}
                        <div>
                            <SectionHeader title="The Vibe" icon={Sun} />
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-medium text-[#1B2430] mb-2">Perfect for</h4>
                                    <div className="flex flex-wrap gap-2">
                                        {propertyData.idealFor.map((item, idx) => (
                                            <span key={idx} className="px-3 py-1 bg-[#D4A373]/10 text-[#D4A373] rounded-full text-xs">
                                                {item}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-[#1B2430] mb-2">House Rules</h4>
                                    <ul className="list-disc list-inside space-y-1">
                                        {propertyData.houseRules.map((rule, idx) => (
                                            <li key={idx} className="text-sm text-gray-600">{rule}</li>
                                        ))}
                                    </ul>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-[#1B2430] mb-1">Community Vibe</h4>
                                    <p className="text-sm text-gray-600">{propertyData.communityVibe}</p>
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-[#1B2430] mb-1">Natural Light</h4>
                                    <p className="text-sm text-gray-600">{propertyData.lightExposure}</p>
                                </div>
                            </div>
                        </div>

                        {/* Chat Section */}
                        <PropertyChat
                            propertyId={propertyData.id}
                            host={propertyData.host}
                            currentUser={currentUser}
                            isAuthenticated={isAuthenticated}
                        />

                        {/* Reviews Section */}
                        <div>
                            <SectionHeader title={`${propertyData.reviews} Reviews`} icon={Star} />
                            <div className="space-y-4">
                                {/* Sample reviews */}
                                <div className="border-b border-gray-200 pb-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-full overflow-hidden">
                                            <img src="https://images.unsplash.com/photo-1494790108777-706fd5f1e685?q=80&w=2070&auto=format&fit=crop" alt="User" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Priya Sharma</h4>
                                            <p className="text-xs text-gray-500">Stayed Jan 2024</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">"Amazing experience! The treehouse is even better than the photos. Rajesh was super helpful and the views are breathtaking."</p>
                                </div>
                                <div className="border-b border-gray-200 pb-4">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className="w-10 h-10 rounded-full overflow-hidden">
                                            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=2070&auto=format&fit=crop" alt="User" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Arjun Mehta</h4>
                                            <p className="text-xs text-gray-500">Stayed Dec 2023</p>
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-600">"Perfect getaway from city life. The internet was surprisingly good, worked perfectly for my remote work."</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - Booking Card (Sticky) */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24 border border-gray-200 rounded-xl p-6 shadow-lg">
                            {/* Price and Rating */}
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <span className="text-2xl font-bold text-[#1B2430]">{propertyData.currency}{propertyData.price}</span>
                                    <span className="text-gray-500"> / night</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Star className="w-4 h-4 fill-current text-[#D4A373]" />
                                    <span className="font-medium">{propertyData.rating}</span>
                                </div>
                            </div>

                            {/* Date Selection */}
                            <div className="border border-gray-200 rounded-lg overflow-hidden mb-4">
                                <div className="grid grid-cols-2 divide-x divide-gray-200">
                                    <div className="p-3">
                                        <label className="text-xs text-gray-500">CHECK-IN</label>
                                        <input
                                            type="date"
                                            value={checkIn}
                                            onChange={(e) => setCheckIn(e.target.value)}
                                            className="w-full text-sm font-medium focus:outline-none"
                                        />
                                    </div>
                                    <div className="p-3">
                                        <label className="text-xs text-gray-500">CHECK-OUT</label>
                                        <input
                                            type="date"
                                            value={checkOut}
                                            onChange={(e) => setCheckOut(e.target.value)}
                                            className="w-full text-sm font-medium focus:outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Guests */}
                            <div className="border border-gray-200 rounded-lg p-3 mb-4">
                                <label className="text-xs text-gray-500">NUMBER OF GUESTS</label>
                                <select
                                    value={guests}
                                    onChange={(e) => setGuests(Number(e.target.value))}
                                    className="w-full text-sm font-medium focus:outline-none"
                                >
                                    {[1, 2, 3].map(num => (
                                        <option key={num} value={num}>{num} guest{num > 1 ? 's' : ''}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Price Breakdown */}
                            <div className="border-t border-gray-200 pt-4 mb-4">
                                <h3 className="font-medium text-[#1B2430] mb-3">Price Breakdown</h3>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Base price × 5 nights</span>
                                        <span className="font-medium">{propertyData.currency}{(propertyData.price || 0) * 5}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Cleaning fee</span>
                                        <span className="font-medium">{propertyData.currency}{propertyData.pricing.cleaningFee}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Service fee</span>
                                        <span className="font-medium">{propertyData.currency}{propertyData.pricing.serviceCharge}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-gray-600">Tax (GST)</span>
                                        <span className="font-medium">{propertyData.currency}{propertyData.pricing.tax}</span>
                                    </div>
                                    <div className="flex items-center justify-between text-sm text-green-600">
                                        <span>Security deposit (refundable)</span>
                                        <span>{propertyData.currency}{propertyData.pricing.securityDeposit}</span>
                                    </div>
                                    <div className="flex items-center justify-between font-bold text-[#1B2430] pt-2 border-t border-gray-200">
                                        <span>Total</span>
                                        <span>{propertyData.currency}{(propertyData.price || 0) * 5 + propertyData.pricing.cleaningFee + propertyData.pricing.serviceCharge + propertyData.pricing.tax}</span>
                                    </div>

                                    <p className="text-xs text-gray-500 italic">Security deposit refunded after check-out</p>
                                </div>
                            </div>

                            {/* Guest Details */}
                            <div className="space-y-3 mb-4">
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    placeholder="Your full name"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A373]/40"
                                />
                                <input
                                    type="tel"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    placeholder="Phone number"
                                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#D4A373]/40"
                                />
                            </div>

                            {/* Book Button */}
                            <button className="w-full py-3 bg-[#D4A373] text-white font-bold rounded-lg hover:bg-[#E6B17E] transition shadow-lg mb-3">
                                Request to book
                            </button>

                            <p className="text-xs text-gray-500 text-center">
                                You won't be charged yet
                            </p>

                            {/* Trust Badges */}
                            <div className="flex items-center justify-center gap-4 mt-4 pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-1">
                                    <Shield className="w-4 h-4 text-green-600" />
                                    <span className="text-xs text-gray-600">Secure payment</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Award className="w-4 h-4 text-[#D4A373]" />
                                    <span className="text-xs text-gray-600">Verified property</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default PropertyDetails;
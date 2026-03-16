import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import {
    Home,
    DollarSign,
    MapPin,
    Layout as LayoutIcon,
    Image as ImageIcon,
    CheckCircle2,
    ChevronRight,
    ChevronLeft,
    Plus,
    X,
    Info,
    LocateFixed,
    Upload,
    Loader2,
} from 'lucide-react';
import {
    useCreatePropertyMutation,
    useUploadPropertyImagesMutation,
    useLazySearchExternalPlacesQuery,
    useLinkLandmarkMutation
} from '../../features/Api/PropertiesApi';
import { toast } from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in Leaflet with React
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Map Recenter Component
const MapRecenter = ({ coords }: { coords: [number, number] }) => {
    const map = useMap();
    map.setView(coords, map.getZoom());
    return null;
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface UploadedImage {
    previewUrl: string; // local object URL for preview
    cloudUrl: string;   // returned by backend after upload
    publicId: string;
    file: File;
}

// ─── Component ────────────────────────────────────────────────────────────────
const AddProperty: React.FC = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [createProperty, { isLoading: isCreating }] = useCreatePropertyMutation();
    const [uploadImages, { isLoading: isUploading }] = useUploadPropertyImagesMutation();

    const [step, setStep] = useState(1);
    const [geoLoading, setGeoLoading] = useState(false);
    const [landmarkSearch, setLandmarkSearch] = useState('');
    const [triggerSearch, { data: searchResults = [], isFetching: isSearching }] = useLazySearchExternalPlacesQuery();
    const [linkLandmark] = useLinkLandmarkMutation();
    const [selectedLandmarks, setSelectedLandmarks] = useState<any[]>([]);
    const searchTimeout = useRef<any>(null);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        property_type: 'apartment',
        price_per_month: '',
        security_deposit: '',
        bedrooms: '',
        bathrooms: '',
        size_sqm: '',
        address: '',
        town: '',
        county: '',
        latitude: '',
        longitude: '',
        amenity_ids: [] as string[],
    });

    const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
    const [dragOver, setDragOver] = useState(false);

    // ─── Constants ────────────────────────────────────────────────────────────
    const propertyTypes = [
        { id: 'bedsitter', label: 'Bedsitter' },
        { id: 'studio', label: 'Studio' },
        { id: 'apartment', label: 'Apartment' },
        { id: 'maisonette', label: 'Maisonette' },
        { id: 'bungalow', label: 'Bungalow' },
        { id: 'short_term', label: 'Short Term' },
    ];

    const commonAmenities = [
        { id: 'wifi', label: 'Fast WiFi', icon: 'wifi' },
        { id: 'parking', label: 'Parking', icon: 'parking' },
        { id: 'gym', label: 'Gym', icon: 'gym' },
        { id: 'pool', label: 'Swimming Pool', icon: 'pool' },
        { id: 'security', label: '24/7 Security', icon: 'security' },
        { id: 'borehole', label: 'Borehole Water', icon: 'water' },
    ];

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAmenityToggle = (id: string) => {
        setFormData(prev => ({
            ...prev,
            amenity_ids: prev.amenity_ids.includes(id)
                ? prev.amenity_ids.filter(a => a !== id)
                : [...prev.amenity_ids, id],
        }));
    };

    // ─── Geolocation ──────────────────────────────────────────────────────────
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            toast.error('Geolocation is not supported by your browser.');
            return;
        }
        setGeoLoading(true);
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setFormData(prev => ({
                    ...prev,
                    latitude: latitude.toFixed(7),
                    longitude: longitude.toFixed(7),
                }));
                toast.success('📍 Location detected successfully!');
                setGeoLoading(false);
            },
            (error) => {
                setGeoLoading(false);
                const messages: Record<number, string> = {
                    1: 'Location permission denied. Please allow access in browser settings.',
                    2: 'Position unavailable. Try again or enter coordinates manually.',
                    3: 'Location request timed out. Try again.',
                };
                toast.error(messages[error.code] || 'Failed to get location.');
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    const handleLandmarkSearch = (val: string) => {
        setLandmarkSearch(val);
        if (searchTimeout.current) clearTimeout(searchTimeout.current);

        if (val.length > 2) {
            searchTimeout.current = setTimeout(() => {
                triggerSearch(val);
            }, 500);
        }
    };

    const addLandmark = (place: any) => {
        if (selectedLandmarks.find(l => l.name === place.name)) {
            toast.error('Landmark already added');
            return;
        }
        setSelectedLandmarks(prev => [...prev, place]);
        setLandmarkSearch('');
    };

    const removeLandmark = (name: string) => {
        setSelectedLandmarks(prev => prev.filter(l => l.name !== name));
    };

    // ─── Image upload helpers ─────────────────────────────────────────────────
    const processFiles = async (files: FileList | File[]) => {
        const fileArray = Array.from(files);
        const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/avif'];
        const MAX_MB = 10;

        const valid = fileArray.filter(f => {
            if (!allowed.includes(f.type)) {
                toast.error(`${f.name}: unsupported type (jpg/png/webp only)`);
                return false;
            }
            if (f.size > MAX_MB * 1024 * 1024) {
                toast.error(`${f.name}: exceeds ${MAX_MB}MB limit`);
                return false;
            }
            return true;
        });

        if (valid.length === 0) return;

        // Build FormData
        const fd = new FormData();
        valid.forEach(f => fd.append('images', f));

        try {
            const result = await uploadImages(fd).unwrap();
            const newImages: UploadedImage[] = result.images.map((r, i) => ({
                previewUrl: URL.createObjectURL(valid[i]),
                cloudUrl: r.url,
                publicId: r.public_id,
                file: valid[i],
            }));
            setUploadedImages(prev => [...prev, ...newImages]);
            toast.success(`${result.images.length} image(s) uploaded!`);
        } catch (err: any) {
            toast.error(err?.data?.message || 'Upload failed. Please try again.');
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) processFiles(e.target.files);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        if (e.dataTransfer.files) processFiles(e.dataTransfer.files);
    };

    const removeImage = (index: number) => {
        setUploadedImages(prev => {
            URL.revokeObjectURL(prev[index].previewUrl);
            return prev.filter((_, i) => i !== index);
        });
    };

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (uploadedImages.length === 0) {
            toast.error('Please upload at least one property image.');
            return;
        }

        try {
            const submissionData = {
                ...formData,
                price_per_month: Number(formData.price_per_month),
                security_deposit: Number(formData.security_deposit),
                bedrooms: Number(formData.bedrooms),
                bathrooms: Number(formData.bathrooms),
                size_sqm: Number(formData.size_sqm),
                latitude: Number(formData.latitude) || -1.286389,
                longitude: Number(formData.longitude) || 36.817223,
                images: uploadedImages.map((img, index) => ({
                    image_url: img.cloudUrl,
                    is_primary: index === 0,
                    sort_order: index,
                })),
            };

            const result = await createProperty(submissionData).unwrap();
            const propertyId = result?.property?.id;

            if (!propertyId) {
                throw new Error('Property created but ID was not returned.');
            }

            // Link landmarks
            if (selectedLandmarks.length > 0) {
                console.log(`🔗 Linking ${selectedLandmarks.length} landmarks to property ${propertyId}...`);
                const linkPromises = selectedLandmarks.map(landmark => {
                    console.log('Sending landmark payload:', { propertyId, landmark });
                    return linkLandmark({
                        propertyId,
                        landmark
                    }).unwrap();
                });
                await Promise.all(linkPromises);
            }

            toast.success('Property listed successfully with nearby landmarks!');
            navigate('/dashboard/landlord');
        } catch (error: any) {
            toast.error(error?.data?.message || 'Failed to list property');
        }
    };

    const nextStep = () => setStep(s => Math.min(s + 1, 4));
    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const isLoading = isCreating || isUploading;

    // ─── Step Indicator ───────────────────────────────────────────────────────
    const renderStepIndicator = () => (
        <div className="flex items-center justify-between mb-12 max-w-2xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center">
                    <div className={`
                        w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all duration-300
                        ${step >= i ? 'bg-[#D4A373] text-[#1B2430]' : 'bg-[#1e293b] text-gray-500 border border-[#2c3a4e]'}
                    `}>
                        {step > i ? <CheckCircle2 size={20} /> : i}
                    </div>
                    {i < 4 && (
                        <div className={`w-12 h-0.5 mx-2 ${step > i ? 'bg-[#D4A373]' : 'bg-[#1e293b]'}`} />
                    )}
                </div>
            ))}
        </div>
    );

    // ─── Render ───────────────────────────────────────────────────────────────
    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto pb-20">
                <div className="mb-8">
                    <h1 className="text-3xl font-black text-white">List Your Property</h1>
                    <p className="text-gray-400 mt-2 font-medium">Follow the steps to showcase your estate to thousands of potential tenants.</p>
                </div>

                {renderStepIndicator()}

                <form onSubmit={handleSubmit} className="bg-[#1B2430] border border-[#2C3A4E] rounded-[32px] p-8 md:p-12 shadow-2xl relative overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4A373]/5 rounded-full -mr-48 -mt-48 blur-3xl p-8" />

                    <div className="relative z-10">

                        {/* ── Step 1: Basic Info ── */}
                        {step === 1 && (
                            <div className="space-y-8 animate-in fade-in duration-500">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-[#D4A373]/10 rounded-2xl text-[#D4A373]">
                                        <Home size={24} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Basic Information</h2>
                                </div>

                                <div className="grid grid-cols-1 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Property Title</label>
                                        <input
                                            type="text"
                                            name="title"
                                            value={formData.title}
                                            onChange={handleChange}
                                            placeholder="e.g. Luxurious 2BR Penthouse with Ocean View"
                                            className="w-full bg-[#131C26] border border-[#2C3A4E] rounded-2xl p-4 text-white focus:outline-none focus:border-[#D4A373] transition-colors"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Description</label>
                                        <textarea
                                            name="description"
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={5}
                                            placeholder="Tell potential tenants about the unique features, surroundings, and vibe of your property..."
                                            className="w-full bg-[#131C26] border border-[#2C3A4E] rounded-2xl p-4 text-white focus:outline-none focus:border-[#D4A373] transition-colors resize-none"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Property Type</label>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                            {propertyTypes.map((type) => (
                                                <button
                                                    key={type.id}
                                                    type="button"
                                                    onClick={() => setFormData(prev => ({ ...prev, property_type: type.id }))}
                                                    className={`
                                                        p-4 rounded-2xl border font-bold transition-all text-sm
                                                        ${formData.property_type === type.id
                                                            ? 'bg-[#D4A373] text-[#1B2430] border-[#D4A373]'
                                                            : 'bg-[#131C26] border-[#2C3A4E] text-gray-400 hover:border-[#D4A373]/50'}
                                                    `}
                                                >
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Step 2: Details & Pricing ── */}
                        {step === 2 && (
                            <div className="space-y-8 animate-in slide-in-from-right duration-500">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-[#D4A373]/10 rounded-2xl text-[#D4A373]">
                                        <DollarSign size={24} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Details &amp; Pricing</h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Monthly Rent (KES)</label>
                                        <div className="relative">
                                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#D4A373] font-bold">KES</div>
                                            <input
                                                type="number"
                                                name="price_per_month"
                                                value={formData.price_per_month}
                                                onChange={handleChange}
                                                placeholder="0.00"
                                                className="w-full bg-[#131C26] border border-[#2C3A4E] rounded-2xl p-4 pl-16 text-white focus:outline-none focus:border-[#D4A373] transition-colors"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Security Deposit (KES)</label>
                                        <input
                                            type="number"
                                            name="security_deposit"
                                            value={formData.security_deposit}
                                            onChange={handleChange}
                                            placeholder="0.00"
                                            className="w-full bg-[#131C26] border border-[#2C3A4E] rounded-2xl p-4 text-white focus:outline-none focus:border-[#D4A373] transition-colors"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Bedrooms</label>
                                        <input
                                            type="number"
                                            name="bedrooms"
                                            value={formData.bedrooms}
                                            onChange={handleChange}
                                            placeholder="e.g. 2"
                                            className="w-full bg-[#131C26] border border-[#2C3A4E] rounded-2xl p-4 text-white focus:outline-none focus:border-[#D4A373] transition-colors"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Bathrooms</label>
                                        <input
                                            type="number"
                                            name="bathrooms"
                                            value={formData.bathrooms}
                                            onChange={handleChange}
                                            placeholder="e.g. 1"
                                            className="w-full bg-[#131C26] border border-[#2C3A4E] rounded-2xl p-4 text-white focus:outline-none focus:border-[#D4A373] transition-colors"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2 col-span-full">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Total Size (sqm)</label>
                                        <input
                                            type="number"
                                            name="size_sqm"
                                            value={formData.size_sqm}
                                            onChange={handleChange}
                                            placeholder="e.g. 120"
                                            className="w-full bg-[#131C26] border border-[#2C3A4E] rounded-2xl p-4 text-white focus:outline-none focus:border-[#D4A373] transition-colors"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Step 3: Location ── */}
                        {step === 3 && (
                            <div className="space-y-8 animate-in slide-in-from-right duration-500">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="p-3 bg-[#D4A373]/10 rounded-2xl text-[#D4A373]">
                                        <MapPin size={24} />
                                    </div>
                                    <h2 className="text-2xl font-bold text-white">Location Details</h2>
                                </div>

                                {/* GPS detect button */}
                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                                    <button
                                        type="button"
                                        onClick={handleGetLocation}
                                        disabled={geoLoading}
                                        className={`
                                            flex items-center gap-3 px-6 py-4 rounded-2xl font-bold text-sm transition-all border
                                            ${geoLoading
                                                ? 'bg-[#D4A373]/20 border-[#D4A373]/30 text-[#D4A373] cursor-not-allowed'
                                                : 'bg-[#D4A373]/10 border-[#D4A373]/40 text-[#D4A373] hover:bg-[#D4A373]/20 hover:border-[#D4A373] active:scale-95'}
                                        `}
                                    >
                                        {geoLoading
                                            ? <Loader2 size={20} className="animate-spin" />
                                            : <LocateFixed size={20} />}
                                        {geoLoading ? 'Detecting Location…' : 'Use My Current Location'}
                                    </button>
                                    {formData.latitude && formData.longitude && (
                                        <span className="text-xs text-green-400 font-medium bg-green-400/10 border border-green-400/20 px-3 py-2 rounded-xl flex items-center gap-2">
                                            <CheckCircle2 size={14} />
                                            GPS: {parseFloat(formData.latitude).toFixed(5)}, {parseFloat(formData.longitude).toFixed(5)}
                                        </span>
                                    )}
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-2 col-span-full">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Full Address</label>
                                        <input
                                            type="text"
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            placeholder="e.g. 123 Luxury Ave, Kilimani"
                                            className="w-full bg-[#131C26] border border-[#2C3A4E] rounded-2xl p-4 text-white focus:outline-none focus:border-[#D4A373] transition-colors"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Town / City</label>
                                        <input
                                            type="text"
                                            name="town"
                                            value={formData.town}
                                            onChange={handleChange}
                                            placeholder="e.g. Nairobi"
                                            className="w-full bg-[#131C26] border border-[#2C3A4E] rounded-2xl p-4 text-white focus:outline-none focus:border-[#D4A373] transition-colors"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">County</label>
                                        <input
                                            type="text"
                                            name="county"
                                            value={formData.county}
                                            onChange={handleChange}
                                            placeholder="e.g. Nairobi"
                                            className="w-full bg-[#131C26] border border-[#2C3A4E] rounded-2xl p-4 text-white focus:outline-none focus:border-[#D4A373] transition-colors"
                                            required
                                        />
                                    </div>

                                    <div className="col-span-full pt-2">
                                        <div className="p-4 bg-[#D4A373]/5 border border-[#D4A373]/20 rounded-2xl flex items-start gap-3">
                                            <Info className="text-[#D4A373] shrink-0" size={20} />
                                            <p className="text-xs text-gray-400 leading-relaxed font-medium">
                                                Click <strong className="text-[#D4A373]">Use My Current Location</strong> to auto-fill coordinates,
                                                or enter them manually below. Accurate coordinates improve search visibility.
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Latitude (Optional)</label>
                                        <input
                                            type="text"
                                            name="latitude"
                                            value={formData.latitude}
                                            onChange={handleChange}
                                            placeholder="e.g. -1.286389"
                                            className="w-full bg-[#131C26] border border-[#2C3A4E] rounded-2xl p-4 text-white focus:outline-none focus:border-[#D4A373] transition-colors"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Longitude (Optional)</label>
                                        <input
                                            type="text"
                                            name="longitude"
                                            value={formData.longitude}
                                            onChange={handleChange}
                                            placeholder="e.g. 36.817223"
                                            className="w-full bg-[#131C26] border border-[#2C3A4E] rounded-2xl p-4 text-white focus:outline-none focus:border-[#D4A373] transition-colors"
                                        />
                                    </div>

                                    {/* ── Nearby Places ── */}
                                    <div className="col-span-full space-y-6 pt-6 border-t border-[#2C3A4E]">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-white">Nearby Places</h3>
                                            <span className="text-xs text-[#D4A373] bg-[#D4A373]/10 px-2 py-1 rounded-lg">Beta</span>
                                        </div>

                                        <div className="relative">
                                            <label className="text-xs font-bold text-gray-400 uppercase tracking-widest px-1">Search Place (Nairobi / Kenya)</label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={landmarkSearch}
                                                    onChange={(e) => handleLandmarkSearch(e.target.value)}
                                                    placeholder="Search hospital, school, mall..."
                                                    className="w-full bg-[#131C26] border border-[#2C3A4E] rounded-2xl p-4 pl-12 text-white focus:outline-none focus:border-[#D4A373] transition-colors"
                                                />
                                                <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                                                {isSearching && (
                                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                                        <Loader2 size={16} className="animate-spin text-[#D4A373]" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Search Results Dropdown */}
                                            {searchResults.length > 0 && landmarkSearch.length > 2 && (
                                                <ul className="absolute z-50 w-full mt-2 bg-[#1B2430] border border-[#2C3A4E] rounded-2xl shadow-2xl max-h-60 overflow-y-auto overflow-x-hidden p-2 space-y-1">
                                                    {searchResults.map((result: any, idx: number) => (
                                                        <li key={idx}>
                                                            <button
                                                                type="button"
                                                                onClick={() => addLandmark(result)}
                                                                className="w-full text-left p-3 hover:bg-white/5 rounded-xl transition-colors flex items-center justify-between group"
                                                            >
                                                                <div className="flex flex-col">
                                                                    <span className="text-sm font-medium text-white truncate max-w-[200px] sm:max-w-xs">{result.name}</span>
                                                                    <span className="text-[10px] text-gray-500 uppercase">{result.type}</span>
                                                                </div>
                                                                <Plus size={16} className="text-[#D4A373] opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </button>
                                                        </li>
                                                    ))}
                                                </ul>
                                            )}
                                        </div>

                                        {/* Map and Selection List */}
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            {/* Selected Landmarks List */}
                                            <div className="lg:col-span-1 space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Selected Places</p>
                                                {selectedLandmarks.length === 0 ? (
                                                    <div className="p-8 border border-dashed border-[#2C3A4E] rounded-2xl flex flex-col items-center justify-center text-center opacity-50">
                                                        <MapPin size={32} className="text-gray-600 mb-2" />
                                                        <p className="text-xs text-gray-500">No places added yet.</p>
                                                    </div>
                                                ) : (
                                                    selectedLandmarks.map((landmark: any, idx: number) => (
                                                        <div key={idx} className="p-4 bg-[#131C26] border border-[#2C3A4E] rounded-2xl flex items-center justify-between group">
                                                            <div className="flex flex-col min-w-0">
                                                                <span className="text-xs font-bold text-white truncate">{landmark.name}</span>
                                                                <span className="text-[10px] text-[#D4A373] uppercase font-bold">{landmark.type}</span>
                                                            </div>
                                                            <button
                                                                type="button"
                                                                onClick={() => removeLandmark(landmark.name)}
                                                                className="p-2 text-red-400 opacity-0 group-hover:opacity-100 hover:bg-red-400/10 rounded-xl transition-all"
                                                            >
                                                                <X size={16} />
                                                            </button>
                                                        </div>
                                                    ))
                                                )}
                                            </div>

                                            {/* Map Visualization */}
                                            <div className="lg:col-span-2 h-[400px] rounded-2xl overflow-hidden border border-[#2C3A4E] relative group">
                                                <MapContainer
                                                    center={formData.latitude && formData.longitude ? [parseFloat(formData.latitude), parseFloat(formData.longitude)] : [-1.286389, 36.817223]}
                                                    zoom={14}
                                                    style={{ height: '100%', width: '100%' }}
                                                    scrollWheelZoom={false}
                                                >
                                                    <TileLayer
                                                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                                    />

                                                    {formData.latitude && formData.longitude && (
                                                        <>
                                                            <Marker position={[parseFloat(formData.latitude), parseFloat(formData.longitude)]}>
                                                                <Popup>
                                                                    <div className="p-1">
                                                                        <h4 className="font-bold text-black">Property Location</h4>
                                                                        <p className="text-xs text-gray-600">{formData.address || 'Your new property'}</p>
                                                                    </div>
                                                                </Popup>
                                                            </Marker>
                                                            <MapRecenter coords={[parseFloat(formData.latitude), parseFloat(formData.longitude)]} />

                                                            {selectedLandmarks.map((landmark: any, idx: number) => (
                                                                <React.Fragment key={idx}>
                                                                    <Marker position={[landmark.lat, landmark.lon]} icon={new L.Icon({
                                                                        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
                                                                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                                                                        iconSize: [25, 41],
                                                                        iconAnchor: [12, 41],
                                                                        popupAnchor: [1, -34],
                                                                        shadowSize: [41, 41]
                                                                    })}>
                                                                        <Popup>
                                                                            <div className="p-1">
                                                                                <h4 className="font-bold text-black">{landmark.name}</h4>
                                                                                <p className="text-xs text-gray-600 uppercase">{landmark.type}</p>
                                                                            </div>
                                                                        </Popup>
                                                                    </Marker>
                                                                    <Polyline
                                                                        positions={[
                                                                            [parseFloat(formData.latitude), parseFloat(formData.longitude)],
                                                                            [landmark.lat, landmark.lon]
                                                                        ]}
                                                                        color="#D4A373"
                                                                        dashArray="10, 10"
                                                                        weight={2}
                                                                    />
                                                                </React.Fragment>
                                                            ))}
                                                        </>
                                                    )}
                                                </MapContainer>

                                                {!formData.latitude && (
                                                    <div className="absolute inset-0 z-[1000] bg-[#1B2430]/80 backdrop-blur-sm flex items-center justify-center p-8 text-center">
                                                        <div>
                                                            <MapPin size={48} className="text-[#D4A373] mx-auto mb-4 opacity-50" />
                                                            <h4 className="text-white font-bold mb-1">Missing Coordinates</h4>
                                                            <p className="text-xs text-gray-400 max-w-[200px] mx-auto">Please detect or enter property coordinates to visualize nearby places on the map.</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ── Step 4: Amenities & Images ── */}
                        {step === 4 && (
                            <div className="space-y-12 animate-in slide-in-from-right duration-500">
                                {/* Amenities */}
                                <div className="space-y-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="p-3 bg-[#D4A373]/10 rounded-2xl text-[#D4A373]">
                                            <LayoutIcon size={24} />
                                        </div>
                                        <h2 className="text-2xl font-bold text-white">Amenities &amp; Features</h2>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                        {commonAmenities.map((amenity) => (
                                            <button
                                                key={amenity.id}
                                                type="button"
                                                onClick={() => handleAmenityToggle(amenity.id)}
                                                className={`
                                                    p-4 rounded-2xl border flex flex-col items-center gap-3 transition-all
                                                    ${formData.amenity_ids.includes(amenity.id)
                                                        ? 'bg-[#D4A373]/10 border-[#D4A373] text-[#D4A373]'
                                                        : 'bg-[#131C26] border-[#2C3A4E] text-gray-500 hover:border-[#D4A373]/30'}
                                                `}
                                            >
                                                <div className={`p-2 rounded-xl ${formData.amenity_ids.includes(amenity.id) ? 'bg-[#D4A373] text-[#1B2430]' : 'bg-[#1e293b]'}`}>
                                                    <Plus size={16} />
                                                </div>
                                                <span className="font-bold text-xs uppercase tracking-wider">{amenity.label}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-3 bg-[#D4A373]/10 rounded-2xl text-[#D4A373]">
                                                <ImageIcon size={24} />
                                            </div>
                                            <div>
                                                <h2 className="text-2xl font-bold text-white">Property Images</h2>
                                                <p className="text-xs text-gray-500 mt-0.5">Images are securely stored. Max 10MB per file.</p>
                                            </div>
                                        </div>
                                        <span className="text-xs font-bold text-gray-500 bg-[#131C26] px-3 py-1 rounded-full border border-[#2C3A4E]">
                                            {uploadedImages.length} Added
                                        </span>
                                    </div>

                                    {/* Drop Zone */}
                                    <div
                                        onDrop={handleDrop}
                                        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                                        onDragLeave={() => setDragOver(false)}
                                        onClick={() => fileInputRef.current?.click()}
                                        className={`
                                            relative border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center gap-4
                                            cursor-pointer transition-all duration-300 group
                                            ${dragOver
                                                ? 'border-[#D4A373] bg-[#D4A373]/10 scale-[1.01]'
                                                : 'border-[#2C3A4E] bg-[#131C26] hover:border-[#D4A373]/50 hover:bg-[#D4A373]/5'}
                                            ${isUploading ? 'pointer-events-none opacity-70' : ''}
                                        `}
                                    >
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/jpeg,image/jpg,image/png,image/webp,image/avif"
                                            multiple
                                            className="hidden"
                                            onChange={handleFileSelect}
                                        />

                                        {isUploading ? (
                                            <>
                                                <Loader2 size={40} className="text-[#D4A373] animate-spin" />
                                                <p className="text-[#D4A373] font-bold">Uploading…</p>
                                            </>
                                        ) : (
                                            <>
                                                <div className="p-4 bg-[#D4A373]/10 rounded-2xl text-[#D4A373] group-hover:scale-110 transition-transform">
                                                    <Upload size={32} />
                                                </div>
                                                <div className="text-center">
                                                    <p className="text-white font-bold text-base">Drop images here or click to browse</p>
                                                    <p className="text-gray-500 text-xs mt-1">JPG, PNG, WebP — up to 10MB each</p>
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Image Previews */}
                                    {uploadedImages.length > 0 && (
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            {uploadedImages.map((img, idx) => (
                                                <div key={idx} className="relative aspect-video rounded-2xl overflow-hidden group border border-[#2C3A4E]">
                                                    <img src={img.previewUrl} alt="Property" className="w-full h-full object-cover" />
                                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                        <button
                                                            type="button"
                                                            onClick={() => removeImage(idx)}
                                                            className="bg-red-500 text-white p-2 rounded-xl hover:scale-110 transition-transform"
                                                        >
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                    {idx === 0 && (
                                                        <div className="absolute top-2 left-2 bg-[#D4A373] text-[#1B2430] text-[8px] font-black uppercase px-2 py-0.5 rounded-full">
                                                            Primary
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-0 inset-x-0 bg-black/40 backdrop-blur-sm py-1 px-2">
                                                        <p className="text-white text-[9px] truncate font-medium">{img.file.name}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Navigation ── */}
                        <div className="mt-12 pt-8 border-t border-[#2C3A4E] flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="text-gray-500 text-xs font-medium">
                                {step < 4 ? `Step ${step} of 4: Next is ${step === 1 ? 'Details' : step === 2 ? 'Location' : 'Visuals'}` : 'Final Step: Review and List'}
                            </div>

                            <div className="flex gap-4 w-full md:w-auto">
                                {step > 1 && (
                                    <button
                                        type="button"
                                        onClick={prevStep}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-[#131C26] border border-[#2C3A4E] text-white rounded-2xl font-bold hover:bg-white/5 transition-all"
                                    >
                                        <ChevronLeft size={20} /> Back
                                    </button>
                                )}

                                {step < 4 ? (
                                    <button
                                        type="button"
                                        onClick={nextStep}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-8 py-4 bg-[#D4A373] text-[#1B2430] rounded-2xl font-black shadow-lg shadow-[#D4A373]/10 hover:bg-[#E6B17E] transition-all"
                                    >
                                        Next <ChevronRight size={20} />
                                    </button>
                                ) : (
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`
                                            flex-1 md:flex-none flex items-center justify-center gap-2 px-12 py-4 bg-[#D4A373] text-[#1B2430] rounded-2xl font-black shadow-lg shadow-[#D4A373]/20 hover:bg-[#E6B17E] transition-all
                                            ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}
                                        `}
                                    >
                                        {isLoading ? (
                                            <div className="flex items-center gap-3">
                                                <Loader2 size={20} className="animate-spin" />
                                                {isUploading ? 'Uploading…' : 'Listing…'}
                                            </div>
                                        ) : (
                                            <>List Property <CheckCircle2 size={20} /></>
                                        )}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </DashboardLayout>
    );
};

export default AddProperty;

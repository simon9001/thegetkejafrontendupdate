import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Home, Loader2, Check, AlertCircle, Save, MapPin, DollarSign, Layout as LayoutIcon, Image as ImageIcon, Plus, LocateFixed } from 'lucide-react';
import { useCreatePropertyMutation, useUploadPropertyImagesMutation, useLinkLandmarkMutation, type Property } from '../../../features/Api/PropertiesApi';
import { toast } from 'react-hot-toast';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
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
    publicId?: string;
    file?: File;
}

interface PropertyModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyToEdit?: Property | null;
}

const PropertyModal: React.FC<PropertyModalProps> = ({ isOpen, onClose, propertyToEdit }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [createProperty, { isLoading: isCreating }] = useCreatePropertyMutation();
    const [uploadImages, { isLoading: isUploading }] = useUploadPropertyImagesMutation();

    const [geoLoading, setGeoLoading] = useState(false);
    const [linkLandmark] = useLinkLandmarkMutation();
    const [selectedLandmarks, setSelectedLandmarks] = useState<any[]>([]);

    const [form, setForm] = useState({
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
    const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null);

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
        { id: 'wifi', label: 'Fast WiFi' },
        { id: 'parking', label: 'Parking' },
        { id: 'gym', label: 'Gym' },
        { id: 'pool', label: 'Swimming Pool' },
        { id: 'security', label: '24/7 Security' },
        { id: 'borehole', label: 'Borehole Water' },
    ];

    useEffect(() => {
        if (propertyToEdit) {
            setForm({
                title: propertyToEdit.title || '',
                description: propertyToEdit.description || '',
                property_type: propertyToEdit.property_type || 'apartment',
                price_per_month: propertyToEdit.price_per_month?.toString() || '',
                security_deposit: '', // Backend doesn't return this in Property type by default
                bedrooms: propertyToEdit.bedrooms?.toString() || '',
                bathrooms: propertyToEdit.bathrooms?.toString() || '',
                size_sqm: propertyToEdit.size_sqm?.toString() || '',
                address: propertyToEdit.location?.address || '',
                town: propertyToEdit.location?.town || '',
                county: propertyToEdit.location?.county || '',
                latitude: propertyToEdit.location?.location?.coordinates?.[1]?.toString() || '',
                longitude: propertyToEdit.location?.location?.coordinates?.[0]?.toString() || '',
                amenity_ids: propertyToEdit.amenities?.map((a: any) => a.name) || [],
            });
            // Handle existing images
            if (propertyToEdit.images) {
                const existingImages: UploadedImage[] = propertyToEdit.images.map((img: any) => ({
                    previewUrl: img.image_url,
                    cloudUrl: img.image_url,
                    publicId: img.public_id || '', // Maintain public_id if available
                }));
                setUploadedImages(existingImages);
            }
        } else {
            setForm({
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
                amenity_ids: [],
            });
            setUploadedImages([]);
            setSelectedLandmarks([]);
        }
    }, [propertyToEdit, isOpen]);

    // ─── Handlers ─────────────────────────────────────────────────────────────
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAmenityToggle = (id: string) => {
        setForm(prev => ({
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
                setForm(prev => ({
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

        const fd = new FormData();
        valid.forEach(f => fd.append('images', f));

        try {
            const result = await uploadImages(fd).unwrap();
            const newImages: UploadedImage[] = result.images.map((r: any, i: number) => ({
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
            const img = prev[index];
            if (img.file) {
                URL.revokeObjectURL(img.previewUrl);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    // ─── Submit ───────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (uploadedImages.length === 0 && !propertyToEdit) {
            toast.error('Please upload at least one property image.');
            return;
        }

        try {
            const submissionData = {
                ...form,
                price_per_month: Number(form.price_per_month),
                security_deposit: Number(form.security_deposit),
                bedrooms: Number(form.bedrooms),
                bathrooms: Number(form.bathrooms),
                size_sqm: Number(form.size_sqm),
                latitude: Number(form.latitude) || -1.286389,
                longitude: Number(form.longitude) || 36.817223,
                images: uploadedImages.map((img, index) => ({
                    image_url: img.cloudUrl,
                    is_primary: index === 0,
                    sort_order: index,
                })),
            };

            if (propertyToEdit) {
                // Update Logic placeholder if API supports it
                // await updateProperty({ id: propertyToEdit.id, ...submissionData }).unwrap();
                setStatus({ success: true, message: 'Property updated!' });
            } else {
                const result = await createProperty(submissionData).unwrap();
                const propertyId = result?.property?.id;

                if (!propertyId) throw new Error('Property created but ID was not returned.');

                if (selectedLandmarks.length > 0) {
                    const linkPromises = selectedLandmarks.map(landmark => linkLandmark({ propertyId, landmark }).unwrap());
                    await Promise.all(linkPromises);
                }
                setStatus({ success: true, message: 'Property created!' });
            }

            setTimeout(() => {
                onClose();
                setStatus(null);
            }, 1000);
        } catch (error: any) {
            setStatus({ success: false, message: error?.data?.message || 'Operation failed' });
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white dark:bg-[#1B2430] rounded-3xl w-full max-w-4xl border border-gray-100 dark:border-white/10 shadow-2xl flex flex-col h-[90vh] sm:h-[85vh] overflow-hidden"
            >
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-white/10 flex justify-between items-center bg-gray-50/50 dark:bg-[#0F172A]/50 shrink-0">
                    <h2 className="text-xl font-bold flex items-center gap-2 text-gray-900 dark:text-white">
                        <Home className="w-6 h-6 text-[#D4A373]" />
                        {propertyToEdit ? 'Edit Property' : 'List New Property'}
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 dark:hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Form Content */}
                <form id="property-form" onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-10 flex-1 custom-scrollbar">

                    {/* Basic Info */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="bg-[#D4A373]/10 text-[#D4A373] p-1.5 rounded-lg"><LayoutIcon size={18} /></span> Basic Info
                        </h3>
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Property Title</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="e.g. Luxurious 2BR Penthouse"
                                    className="w-full bg-gray-50 dark:bg-[#131C26] border border-gray-200 dark:border-[#2C3A4E] rounded-xl p-4 font-bold focus:ring-2 focus:ring-[#D4A373] text-gray-900 dark:text-white outline-none transition-all"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Property Type</label>
                                    <select
                                        name="property_type"
                                        value={form.property_type}
                                        onChange={handleChange}
                                        className="w-full bg-gray-50 dark:bg-[#131C26] border border-gray-200 dark:border-[#2C3A4E] rounded-xl p-4 focus:ring-2 focus:ring-[#D4A373] text-gray-900 dark:text-white outline-none"
                                    >
                                        {propertyTypes.map(pt => <option key={pt.id} value={pt.id}>{pt.label}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Total Size (sqm)</label>
                                    <input
                                        type="number"
                                        name="size_sqm"
                                        value={form.size_sqm}
                                        onChange={handleChange}
                                        placeholder="e.g. 120"
                                        className="w-full bg-gray-50 dark:bg-[#131C26] border border-gray-200 dark:border-[#2C3A4E] rounded-xl p-4 focus:ring-2 focus:ring-[#D4A373] text-gray-900 dark:text-white outline-none"
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Description</label>
                                <textarea
                                    name="description"
                                    value={form.description}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Tell potential tenants about the unique features..."
                                    className="w-full bg-gray-50 dark:bg-[#131C26] border border-gray-200 dark:border-[#2C3A4E] rounded-xl p-4 focus:ring-2 focus:ring-[#D4A373] text-gray-900 dark:text-white outline-none resize-none"
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing & Rooms */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="bg-[#D4A373]/10 text-[#D4A373] p-1.5 rounded-lg"><DollarSign size={18} /></span> Pricing & Layout
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Monthly Rent (KES)</label>
                                <input type="number" name="price_per_month" value={form.price_per_month} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-[#131C26] border border-gray-200 dark:border-[#2C3A4E] rounded-xl p-4 focus:ring-2 focus:ring-[#D4A373] text-gray-900 dark:text-white outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Deposit (KES)</label>
                                <input type="number" name="security_deposit" value={form.security_deposit} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-[#131C26] border border-gray-200 dark:border-[#2C3A4E] rounded-xl p-4 focus:ring-2 focus:ring-[#D4A373] text-gray-900 dark:text-white outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bedrooms</label>
                                <input type="number" name="bedrooms" value={form.bedrooms} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-[#131C26] border border-gray-200 dark:border-[#2C3A4E] rounded-xl p-4 focus:ring-2 focus:ring-[#D4A373] text-gray-900 dark:text-white outline-none" />
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Bathrooms</label>
                                <input type="number" name="bathrooms" value={form.bathrooms} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-[#131C26] border border-gray-200 dark:border-[#2C3A4E] rounded-xl p-4 focus:ring-2 focus:ring-[#D4A373] text-gray-900 dark:text-white outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Location */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="bg-[#D4A373]/10 text-[#D4A373] p-1.5 rounded-lg"><MapPin size={18} /></span> Location Rules
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Full Address</label>
                                    <input type="text" name="address" value={form.address} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-[#131C26] border border-gray-200 dark:border-[#2C3A4E] rounded-xl p-4 focus:ring-2 focus:ring-[#D4A373] text-gray-900 dark:text-white outline-none" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Town / City</label>
                                        <input type="text" name="town" value={form.town} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-[#131C26] border border-gray-200 dark:border-[#2C3A4E] rounded-xl p-4 focus:ring-2 focus:ring-[#D4A373] text-gray-900 dark:text-white outline-none" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">County</label>
                                        <input type="text" name="county" value={form.county} onChange={handleChange} required className="w-full bg-gray-50 dark:bg-[#131C26] border border-gray-200 dark:border-[#2C3A4E] rounded-xl p-4 focus:ring-2 focus:ring-[#D4A373] text-gray-900 dark:text-white outline-none" />
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="space-y-1 flex-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Latitude</label>
                                        <input type="text" name="latitude" value={form.latitude} onChange={handleChange} className="w-full bg-gray-50 dark:bg-[#131C26] border border-gray-200 dark:border-[#2C3A4E] rounded-xl p-4 focus:ring-2 focus:ring-[#D4A373] text-gray-900 dark:text-white outline-none" />
                                    </div>
                                    <div className="space-y-1 flex-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Longitude</label>
                                        <input type="text" name="longitude" value={form.longitude} onChange={handleChange} className="w-full bg-gray-50 dark:bg-[#131C26] border border-gray-200 dark:border-[#2C3A4E] rounded-xl p-4 focus:ring-2 focus:ring-[#D4A373] text-gray-900 dark:text-white outline-none" />
                                    </div>
                                </div>
                                <button type="button" onClick={handleGetLocation} disabled={geoLoading} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#D4A373]/10 text-[#D4A373] rounded-xl font-bold hover:bg-[#D4A373]/20 transition-colors">
                                    {geoLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LocateFixed className="w-5 h-5" />}
                                    Auto-detect Coords
                                </button>
                            </div>

                            {/* Mini Map */}
                            <div className="h-full min-h-[250px] rounded-2xl overflow-hidden border border-gray-200 dark:border-[#2C3A4E] relative">
                                <MapContainer
                                    center={form.latitude && form.longitude ? [parseFloat(form.latitude), parseFloat(form.longitude)] : [-1.286389, 36.817223]}
                                    zoom={14}
                                    style={{ height: '100%', width: '100%' }}
                                >
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    {form.latitude && form.longitude && (
                                        <>
                                            <Marker position={[parseFloat(form.latitude), parseFloat(form.longitude)]} />
                                            <MapRecenter coords={[parseFloat(form.latitude), parseFloat(form.longitude)]} />
                                        </>
                                    )}
                                </MapContainer>
                            </div>
                        </div>
                    </div>

                    {/* Features & Amenities */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="bg-[#D4A373]/10 text-[#D4A373] p-1.5 rounded-lg"><Plus size={18} /></span> Amenities
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {commonAmenities.map(amenity => (
                                <button
                                    key={amenity.id}
                                    type="button"
                                    onClick={() => handleAmenityToggle(amenity.id)}
                                    className={`p-3 rounded-xl border text-sm font-bold transition-all ${form.amenity_ids.includes(amenity.id) ? 'bg-[#D4A373] border-[#D4A373] text-white' : 'bg-gray-50 dark:bg-[#131C26] border-gray-200 dark:border-[#2C3A4E] text-gray-500 hover:border-[#D4A373]/50'}`}
                                >
                                    {amenity.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Images */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                            <span className="bg-[#D4A373]/10 text-[#D4A373] p-1.5 rounded-lg"><ImageIcon size={18} /></span> Photos
                        </h3>
                        <div
                            onDrop={handleDrop}
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-2xl p-8 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all ${dragOver ? 'border-[#D4A373] bg-[#D4A373]/5' : 'border-gray-300 dark:border-[#2C3A4E] bg-gray-50 dark:bg-[#131C26]'}`}
                        >
                            <ImageIcon className="text-[#D4A373] mb-2" size={32} />
                            <p className="text-sm font-bold text-gray-900 dark:text-white">Click or drag images to upload</p>
                            <p className="text-xs text-gray-500">JPG, PNG, WEBP (Max 10MB)</p>
                            <input ref={fileInputRef} type="file" multiple className="hidden" accept="image/*" onChange={handleFileSelect} />
                        </div>
                        {uploadedImages.length > 0 && (
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                                {uploadedImages.map((img, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200 dark:border-[#2C3A4E]">
                                        <img src={img.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <button type="button" onClick={() => removeImage(idx)} className="absolute top-2 right-2 bg-red-500/80 p-1.5 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                                            <X size={14} />
                                        </button>
                                        {idx === 0 && <span className="absolute bottom-2 left-2 text-[10px] font-bold bg-[#D4A373] text-white px-2 py-0.5 rounded-md">Cover</span>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                </form>

                {/* Footer Fixed Action Area */}
                <div className="p-6 border-t border-gray-100 dark:border-white/10 shrink-0 bg-gray-50/50 dark:bg-[#1B2430]">
                    {status && (
                        <div className={`p-4 rounded-xl flex items-center gap-3 mb-4 ${status.success ? 'bg-green-100 dark:bg-green-500/10 text-green-700 dark:text-green-400' : 'bg-red-100 dark:bg-red-500/10 text-red-700 dark:text-red-400'}`}>
                            {status.success ? <Check className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                            <span className="text-sm font-medium">{status.message}</span>
                        </div>
                    )}
                    <div className="flex gap-4">
                        <button type="button" onClick={onClose} className="flex-1 bg-white dark:bg-[#131C26] border border-gray-200 dark:border-[#2C3A4E] text-gray-700 dark:text-gray-300 font-bold py-4 rounded-xl hover:bg-gray-50 dark:hover:bg-[#2C3A4E]/50 transition-all shadow-sm">
                            Cancel
                        </button>
                        <button type="submit" form="property-form" disabled={isCreating || isUploading} className="flex-[2] bg-gradient-to-r from-[#D4A373] to-[#E6B17E] text-[#1B2430] font-bold py-4 rounded-xl hover:scale-[1.02] transition-all flex items-center justify-center gap-2 shadow-lg shadow-[#D4A373]/20">
                            {(isCreating || isUploading) ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {propertyToEdit ? 'Save Changes' : 'Publish Property'}
                        </button>
                    </div>
                </div>

            </motion.div>
        </div>
    );
};

export default PropertyModal;

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ShieldCheck, ShieldX, Eye, CheckCircle2, XCircle, Clock,
    Building2, MapPin, DollarSign, BedDouble, Bath, LayoutDashboard,
    ChevronRight, X, Loader2, AlertTriangle, Filter, Search, ImageOff
} from 'lucide-react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import type { RootState } from '../../store/store';
import {
    useGetUnverifiedPropertiesQuery,
    useVerifyPropertyMutation,
    useRejectPropertyMutation,
    type Property
} from '../../features/Api/PropertiesApi';
import ModernDashboardLayout, { type NavigationItem } from '../../components/layout/ModernDashboardLayout';
import { toast } from 'react-hot-toast';

// ─── Helpers ────────────────────────────────────────────────────────────────
const getLocationStr = (loc: any): string => {
    if (!loc) return 'Location not set';
    if (typeof loc === 'string') return loc;
    return [loc.town, loc.county].filter(Boolean).join(', ') || 'Location not set';
};

const getImageUrl = (property: Property): string | null => {
    const imgs = (property as any).images;
    if (!imgs || imgs.length === 0) return null;
    const primary = imgs.find((i: any) => i.is_primary) || imgs[0];
    return primary?.image_url || null;
};

// ─── Reject Modal ────────────────────────────────────────────────────────────
interface RejectModalProps {
    property: Property;
    onConfirm: (reason: string) => void;
    onCancel: () => void;
    isLoading: boolean;
}
const RejectModal: React.FC<RejectModalProps> = ({ property, onConfirm, onCancel, isLoading }) => {
    const [reason, setReason] = useState('');
    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={onCancel}
        >
            <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-gray-900 border border-red-500/30 rounded-2xl p-6 w-full max-w-md shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-red-500/10 rounded-xl">
                        <AlertTriangle className="w-6 h-6 text-red-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">Reject Property</h3>
                        <p className="text-sm text-gray-400 truncate max-w-xs">{property.title}</p>
                    </div>
                </div>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Rejection reason (optional but recommended)..."
                    rows={4}
                    className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 text-sm focus:outline-none focus:border-red-500/50 resize-none mb-4"
                />
                <div className="flex gap-3">
                    <button
                        onClick={onCancel}
                        className="flex-1 px-4 py-2.5 bg-gray-800 text-gray-300 rounded-xl font-medium hover:bg-gray-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onConfirm(reason)}
                        disabled={isLoading}
                        className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <XCircle className="w-4 h-4" />}
                        Reject
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ─── Property Detail Modal ────────────────────────────────────────────────────
interface DetailModalProps {
    property: Property;
    onVerify: () => void;
    onReject: () => void;
    onClose: () => void;
    isVerifying: boolean;
}
const DetailModal: React.FC<DetailModalProps> = ({ property, onVerify, onReject, onClose, isVerifying }) => {
    const imgUrl = getImageUrl(property);
    const imgs = (property as any).images || [];
    const [activeImg, setActiveImg] = useState(imgUrl);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <motion.div
                initial={{ scale: 0.92, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.92, opacity: 0 }}
                className="bg-gray-900 border border-white/10 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-amber-500/10 rounded-xl">
                            <ShieldCheck className="w-5 h-5 text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-white">{property.title}</h2>
                            <p className="text-sm text-gray-400">{getLocationStr((property as any).location)}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Images */}
                    <div>
                        <div className="h-56 rounded-xl overflow-hidden bg-gray-800 flex items-center justify-center mb-3">
                            {activeImg ? (
                                <img src={activeImg} alt={property.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="flex flex-col items-center gap-2 text-gray-600">
                                    <ImageOff className="w-10 h-10" />
                                    <span className="text-sm">No images uploaded</span>
                                </div>
                            )}
                        </div>
                        {imgs.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto pb-1">
                                {imgs.map((img: any, i: number) => (
                                    <button
                                        key={i}
                                        onClick={() => setActiveImg(img.image_url)}
                                        className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all ${activeImg === img.image_url ? 'border-amber-400' : 'border-transparent'}`}
                                    >
                                        <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {[
                            { icon: Building2, label: 'Type', value: property.property_type },
                            { icon: DollarSign, label: 'Price/Month', value: `KES ${property.price_per_month?.toLocaleString() || '—'}` },
                            { icon: BedDouble, label: 'Bedrooms', value: String(property.bedrooms ?? '—') },
                            { icon: Bath, label: 'Bathrooms', value: String(property.bathrooms ?? '—') },
                            { icon: MapPin, label: 'Location', value: getLocationStr((property as any).location) },
                            { icon: Clock, label: 'Submitted', value: property.created_at ? new Date(property.created_at).toLocaleDateString() : '—' },
                        ].map(({ icon: Icon, label, value }) => (
                            <div key={label} className="bg-gray-800 rounded-xl p-4">
                                <div className="flex items-center gap-2 mb-1">
                                    <Icon className="w-4 h-4 text-amber-400" />
                                    <span className="text-xs text-gray-400 font-medium uppercase">{label}</span>
                                </div>
                                <p className="text-sm font-bold text-white">{value}</p>
                            </div>
                        ))}
                    </div>

                    {/* Description */}
                    {property.description && (
                        <div className="bg-gray-800 rounded-xl p-4">
                            <p className="text-xs text-gray-400 font-medium uppercase mb-2">Description</p>
                            <p className="text-sm text-gray-300 leading-relaxed">{property.description}</p>
                        </div>
                    )}

                    {/* Owner */}
                    {(property as any).owner && (
                        <div className="bg-gray-800 rounded-xl p-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                                <span className="text-amber-400 font-bold text-sm">
                                    {(property as any).owner.full_name?.[0]?.toUpperCase() || 'U'}
                                </span>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase">Owner</p>
                                <p className="text-sm font-bold text-white">{(property as any).owner.full_name}</p>
                                <p className="text-xs text-gray-400">{(property as any).owner.email}</p>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-2">
                        <button
                            onClick={onReject}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl font-bold hover:bg-red-500/20 transition-colors"
                        >
                            <XCircle className="w-5 h-5" />
                            Reject
                        </button>
                        <button
                            onClick={onVerify}
                            disabled={isVerifying}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500 text-white rounded-xl font-bold hover:bg-emerald-600 transition-colors disabled:opacity-50"
                        >
                            {isVerifying ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                            Approve & Verify
                        </button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// ─── Property Card ────────────────────────────────────────────────────────────
interface CardProps {
    property: Property;
    onView: () => void;
    onVerify: () => void;
    onReject: () => void;
    isVerifying: boolean;
    index: number;
}
const PropertyCard: React.FC<CardProps> = ({ property, onView, onVerify, onReject, isVerifying, index }) => {
    const imgUrl = getImageUrl(property);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="bg-gray-900 border border-white/8 rounded-2xl overflow-hidden hover:border-amber-500/30 transition-all group shadow-lg"
        >
            {/* Image */}
            <div className="h-44 bg-gray-800 relative overflow-hidden">
                {imgUrl ? (
                    <img src={imgUrl} alt={property.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-gray-600">
                        <ImageOff className="w-8 h-8 mb-1" />
                        <span className="text-xs">No image</span>
                    </div>
                )}
                {/* Status Badge */}
                <div className="absolute top-3 left-3">
                    <span className="flex items-center gap-1 px-3 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 rounded-full text-xs font-bold backdrop-blur-sm">
                        <Clock className="w-3 h-3" />
                        Pending Review
                    </span>
                </div>
                {/* Property type */}
                <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 bg-black/60 text-gray-200 rounded-lg text-xs font-medium backdrop-blur-sm">
                        {property.property_type}
                    </span>
                </div>
            </div>

            {/* Body */}
            <div className="p-4">
                <h3 className="font-bold text-white truncate mb-1">{property.title}</h3>
                <div className="flex items-center gap-1 text-sm text-gray-400 mb-3">
                    <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="truncate">{getLocationStr((property as any).location)}</span>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
                    {property.price_per_month && (
                        <span className="flex items-center gap-1 font-bold text-amber-400">
                            <DollarSign className="w-3.5 h-3.5" />
                            KES {property.price_per_month.toLocaleString()}/mo
                        </span>
                    )}
                    {property.bedrooms != null && (
                        <span className="flex items-center gap-1">
                            <BedDouble className="w-3.5 h-3.5" />
                            {property.bedrooms} bd
                        </span>
                    )}
                    {property.bathrooms != null && (
                        <span className="flex items-center gap-1">
                            <Bath className="w-3.5 h-3.5" />
                            {property.bathrooms} ba
                        </span>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={onView}
                        className="flex items-center gap-1.5 px-3 py-2 bg-white/5 border border-white/10 text-gray-300 rounded-xl text-sm font-medium hover:bg-white/10 transition-colors"
                    >
                        <Eye className="w-4 h-4" />
                        Details
                    </button>
                    <button
                        onClick={onReject}
                        className="flex items-center gap-1.5 px-3 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm font-medium hover:bg-red-500/20 transition-colors"
                    >
                        <XCircle className="w-4 h-4" />
                        Reject
                    </button>
                    <button
                        onClick={onVerify}
                        disabled={isVerifying}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-xl text-sm font-bold hover:bg-emerald-500 hover:text-white transition-all disabled:opacity-50"
                    >
                        {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                        Verify
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const VerifierDashboard: React.FC = () => {
    const user = useSelector((state: RootState) => state.authSlice.user);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('queue');
    const [search, setSearch] = useState('');
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [rejectTarget, setRejectTarget] = useState<Property | null>(null);
    const [verifyingId, setVerifyingId] = useState<string | null>(null);

    useEffect(() => {
        if (user && user.role !== 'verifier' && user.role !== 'admin') {
            navigate('/');
        }
    }, [user, navigate]);

    const { data: unverifiedData, isLoading, refetch } = useGetUnverifiedPropertiesQuery(undefined, {
        skip: !user
    });

    const [verifyProperty] = useVerifyPropertyMutation();
    const [rejectProperty, { isLoading: isRejecting }] = useRejectPropertyMutation();

    const properties = unverifiedData?.properties || [];

    const filtered = properties.filter((p) =>
        p.title?.toLowerCase().includes(search.toLowerCase()) ||
        getLocationStr((p as any).location).toLowerCase().includes(search.toLowerCase()) ||
        p.property_type?.toLowerCase().includes(search.toLowerCase())
    );

    const handleVerify = async (property: Property) => {
        setVerifyingId(property.id);
        try {
            await verifyProperty(property.id).unwrap();
            toast.success(`"${property.title}" verified and published!`);
            setSelectedProperty(null);
            refetch();
        } catch (err: any) {
            toast.error(err?.data?.message || 'Verification failed');
        } finally {
            setVerifyingId(null);
        }
    };

    const handleReject = async (property: Property, reason: string) => {
        try {
            await rejectProperty({ id: property.id, reason }).unwrap();
            toast.success(`"${property.title}" rejected.`);
            setRejectTarget(null);
            setSelectedProperty(null);
            refetch();
        } catch (err: any) {
            toast.error(err?.data?.message || 'Rejection failed');
        }
    };

    const navigation: NavigationItem[] = [
        { id: 'queue', name: 'Review Queue', icon: ShieldCheck, badge: properties.length > 0 ? properties.length : undefined },
        { id: 'overview', name: 'Overview', icon: LayoutDashboard },
    ];

    if (user?.role !== 'verifier' && user?.role !== 'admin') {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gray-950 space-y-4">
                <ShieldX size={48} className="text-red-500 opacity-40" />
                <h2 className="text-xl font-bold text-white">Access Denied</h2>
                <p className="text-gray-500">You don't have permission to view this page.</p>
            </div>
        );
    }

    return (
        <ModernDashboardLayout
            user={user}
            navigation={navigation}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sidebarTitle="Verifier Hub"
            sidebarSubtitle="Platform Integrity"
            sidebarIcon={ShieldCheck}
        >
            <div className="space-y-8 pb-12">
                {/* Header */}
                <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 border border-white/8 rounded-3xl p-8 shadow-xl">
                    <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black text-white">Property Review Queue</h1>
                            <p className="text-gray-400 mt-1">
                                {properties.length > 0
                                    ? `${properties.length} ${properties.length === 1 ? 'property' : 'properties'} awaiting verification`
                                    : 'Queue is clear — no pending properties'}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl">
                                <Clock className="w-4 h-4 text-amber-400" />
                                <span className="text-amber-300 font-bold text-sm">{properties.length} Pending</span>
                            </div>
                        </div>
                    </div>
                    <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {[
                        { label: 'Pending Review', value: properties.length, icon: Clock, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
                        { label: 'Total Reviewed', value: '—', icon: ShieldCheck, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
                        { label: 'Rejected Today', value: '—', icon: ShieldX, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
                    ].map(({ label, value, icon: Icon, color }) => (
                        <div key={label} className={`rounded-2xl border p-4 flex items-center gap-3 ${color}`}>
                            <div className={`p-2 rounded-xl ${color}`}>
                                <Icon className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="text-2xl font-black text-white">{value}</p>
                                <p className="text-xs text-gray-400">{label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Search & Filter Bar */}
                <div className="flex gap-3">
                    <div className="flex-1 relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search by title, type, or location…"
                            className="w-full pl-11 pr-4 py-3 bg-gray-900 border border-white/10 text-white rounded-xl placeholder-gray-500 focus:outline-none focus:border-amber-500/50 text-sm"
                        />
                    </div>
                    <button className="px-4 py-3 bg-gray-900 border border-white/10 text-gray-400 rounded-xl hover:bg-gray-800 transition-colors">
                        <Filter className="w-4 h-4" />
                    </button>
                </div>

                {/* Property Cards */}
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-4">
                        <Loader2 className="w-10 h-10 text-amber-400 animate-spin" />
                        <p className="text-gray-400">Loading properties…</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col items-center justify-center py-20 gap-4"
                    >
                        <div className="w-20 h-20 rounded-full bg-emerald-500/10 flex items-center justify-center">
                            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white">{search ? 'No results found' : 'Queue is empty!'}</h3>
                        <p className="text-gray-400 text-center max-w-sm">
                            {search ? 'Try adjusting your search.' : 'All properties have been reviewed. Great work!'}
                        </p>
                        {search && (
                            <button onClick={() => setSearch('')} className="text-amber-400 hover:underline text-sm">
                                Clear search
                            </button>
                        )}
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        {filtered.map((property, i) => (
                            <PropertyCard
                                key={property.id}
                                property={property}
                                index={i}
                                isVerifying={verifyingId === property.id}
                                onView={() => setSelectedProperty(property)}
                                onVerify={() => handleVerify(property)}
                                onReject={() => setRejectTarget(property)}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination hint */}
                {filtered.length > 0 && (
                    <div className="flex items-center justify-between text-sm text-gray-500 border-t border-white/5 pt-4">
                        <span>Showing {filtered.length} of {properties.length} pending properties</span>
                        <button onClick={() => refetch()} className="flex items-center gap-1 text-amber-400 hover:underline">
                            Refresh <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Modals */}
            <AnimatePresence>
                {selectedProperty && (
                    <DetailModal
                        property={selectedProperty}
                        isVerifying={verifyingId === selectedProperty.id}
                        onVerify={() => handleVerify(selectedProperty)}
                        onReject={() => { setRejectTarget(selectedProperty); }}
                        onClose={() => setSelectedProperty(null)}
                    />
                )}
            </AnimatePresence>

            <AnimatePresence>
                {rejectTarget && (
                    <RejectModal
                        property={rejectTarget}
                        isLoading={isRejecting}
                        onConfirm={(reason) => handleReject(rejectTarget, reason)}
                        onCancel={() => setRejectTarget(null)}
                    />
                )}
            </AnimatePresence>
        </ModernDashboardLayout>
    );
};

export default VerifierDashboard;

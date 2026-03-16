import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Users, LayoutDashboard, Calendar,
    Settings, Search, Plus, Filter, MoreVertical,
    Edit3, Building2, TrendingUp, DollarSign, MapPin,
    ChevronRight, AlertCircle, Key, MessageSquare, Download,
    Trash2, UserCog, Phone, Mail, Loader2
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { useGetDashboardStatsQuery } from '../../features/Api/DashboardApi';
import { useGetMyPropertiesQuery, useDeletePropertyMutation } from '../../features/Api/PropertiesApi';
import OrderDonut from '../../components/dashboard/OrderDonut';
import SalesChart from '../../components/dashboard/SalesChart';
import ModernDashboardLayout from '../../components/layout/ModernDashboardLayout';
import PropertyModal from '../../components/dashboard/modals/PropertyModal';

const formatLocation = (loc: any) => {
    if (!loc) return 'Nairobi';
    if (typeof loc === 'string') return loc;
    if (typeof loc === 'object') {
        const parts = [];
        if (loc.town) parts.push(loc.town);
        if (loc.county) parts.push(loc.county);
        return parts.length > 0 ? parts.join(', ') : 'Nairobi';
    }
    return String(loc);
};

const LandlordDashboard: React.FC = () => {
    const user = useSelector((state: RootState) => state.authSlice.user);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);

    useEffect(() => {
        if (user && user.role !== 'landlord') {
            navigate('/');
        }
    }, [user, navigate]);

    const { data: stats, isLoading: isStatsLoading } = useGetDashboardStatsQuery(undefined, {
        skip: !user || user.role !== 'landlord'
    });
    const { data: propertiesData, isLoading: isPropertiesLoading } = useGetMyPropertiesQuery(undefined, {
        skip: !user || user.role !== 'landlord'
    });

    const properties = propertiesData?.properties || [];

    const navigation = [
        { id: 'overview', name: 'Overview', icon: LayoutDashboard },
        { id: 'properties', name: 'My Properties', icon: Building2 },
        { id: 'bookings', name: 'Active Bookings', icon: Calendar },
        { id: 'caretakers', name: 'Caretakers', icon: Users },
        { id: 'tenants', name: 'Tenants', icon: Key },
        { id: 'payments', name: 'Payments', icon: DollarSign },
        { id: 'reports', name: 'Reports', icon: TrendingUp },
        { id: 'messages', name: 'Messages', icon: MessageSquare },
        { id: 'settings', name: 'Settings', icon: Settings },
    ];



    if (user?.role !== 'landlord') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-12 text-center max-w-md"
                >
                    <div className="w-24 h-24 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Access Denied</h2>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">You don't have permission to view this page.</p>
                    <Link
                        to="/"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-xl font-bold hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25"
                    >
                        Return Home
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </motion.div>
            </div>
        );
    }

    if (isStatsLoading || isPropertiesLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-amber-200 border-t-amber-500 rounded-full animate-spin"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Building2 className="w-8 h-8 text-amber-500 animate-pulse" />
                        </div>
                    </div>
                    <p className="mt-4 text-gray-600 dark:text-gray-400 font-medium">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    const renderTabContent = () => {
        switch (activeTab) {
            case 'overview':
                return <OverviewTab stats={stats} properties={properties} setActiveTab={setActiveTab} />;
            case 'properties':
                return <PropertiesTab properties={properties} />;
            case 'bookings':
                return <BookingsTab />;
            case 'caretakers':
                return <CaretakersTab />;
            case 'tenants':
                return <TenantsTab />;
            case 'payments':
                return <PaymentsTab stats={stats} />;
            case 'reports':
                return <ReportsTab />;
            case 'messages':
                return <MessagesTab />;
            case 'settings':
                return <SettingsTab />;
            default:
                return <OverviewTab stats={stats} properties={properties} setActiveTab={setActiveTab} />;
        }
    };

    return (
        <ModernDashboardLayout
            user={user}
            navigation={navigation}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            sidebarTitle="Landlord Panel"
            sidebarSubtitle="Property Management"
            sidebarIcon={Building2}
        >
            {renderTabContent()}
            <PropertyModal
                isOpen={isPropertyModalOpen}
                onClose={() => setIsPropertyModalOpen(false)}
            />
        </ModernDashboardLayout>
    );
};

// Overview Tab
const OverviewTab = ({ stats, properties, setActiveTab }: { stats: any, properties: any[], setActiveTab: any }) => {
    const statsCards = [
        {
            title: 'Total Properties',
            value: stats?.ownedProperties || 0,
            icon: Building2,
            color: 'from-blue-500 to-blue-600',
            bg: 'bg-blue-50 dark:bg-blue-900/20',
            textColor: 'text-blue-600 dark:text-blue-400'
        },
        {
            title: 'Active Bookings',
            value: stats?.activeBookings || 0,
            icon: Calendar,
            color: 'from-green-500 to-green-600',
            bg: 'bg-green-50 dark:bg-green-900/20',
            textColor: 'text-green-600 dark:text-green-400'
        },
        {
            title: 'Monthly Revenue',
            value: `KES ${stats?.totalRent?.toLocaleString() || '0'}`,
            icon: DollarSign,
            color: 'from-amber-500 to-amber-600',
            bg: 'bg-amber-50 dark:bg-amber-900/20',
            textColor: 'text-amber-600 dark:text-amber-400'
        },
        {
            title: 'Active Caretakers',
            value: stats?.activeCaretakers || 0,
            icon: Users,
            color: 'from-purple-500 to-purple-600',
            bg: 'bg-purple-50 dark:bg-purple-900/20',
            textColor: 'text-purple-600 dark:text-purple-400'
        }
    ];

    return (
        <div className="space-y-8">
            {/* Welcome Banner */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative overflow-hidden bg-gradient-to-r from-amber-500 to-amber-600 rounded-3xl p-8"
            >
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold text-white mb-2">Property Portfolio Overview</h2>
                    <p className="text-amber-100 mb-6 max-w-2xl">
                        Manage your properties, track bookings, and monitor performance all in one place.
                    </p>
                    <div className="flex gap-4">
                        <Link
                            to="/dashboard/landlord/add-property"
                            className="bg-white text-amber-600 px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-50 transition-all shadow-lg"
                        >
                            <Plus className="w-5 h-5" />
                            Add New Property
                        </Link>
                        <button className="bg-amber-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-amber-700 transition-all border border-amber-400">
                            <Download className="w-5 h-5" />
                            Export Report
                        </button>
                    </div>
                </div>
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full -ml-24 -mb-24 blur-2xl"></div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {statsCards.map((card, index) => (
                    <motion.div
                        key={card.title}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
                    >
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-xl ${card.bg}`}>
                                <card.icon className={`w-6 h-6 ${card.textColor}`} />
                            </div>
                            <span className="text-xs font-medium text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                                This Month
                            </span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{card.value}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
                        <div className="mt-4 h-1 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: '75%' }}
                                transition={{ delay: 0.5, duration: 1 }}
                                className={`h-full rounded-full bg-gradient-to-r ${card.color}`}
                            />
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
                >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Booking Distribution</h3>
                    <OrderDonut />
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700"
                >
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Revenue Trends</h3>
                    <SalesChart />
                </motion.div>
            </div>

            {/* Recent Properties */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden"
            >
                <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">Recent Properties</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Your latest listed properties</p>
                    </div>
                    <button
                        onClick={() => setActiveTab('properties')}
                        className="text-amber-600 hover:text-amber-700 font-medium text-sm flex items-center gap-1"
                    >
                        View All
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                    {properties.slice(0, 5).map((property: any) => (
                        <div key={property.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 flex items-center justify-center">
                                        <Building2 className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">{property.title}</p>
                                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {formatLocation(property.location)}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <DollarSign className="w-3 h-3" />
                                                KES {property.price_per_month?.toLocaleString()}/mo
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold
                                        ${property.status === 'active' ? 'bg-green-100 text-green-700' :
                                            property.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'}`}>
                                        {property.status}
                                    </span>
                                    <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                        <MoreVertical className="w-4 h-4 text-gray-400" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
};

// Properties Tab
const PropertiesTab = ({ properties }: { properties: any[] }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [editingProperty, setEditingProperty] = useState<any | null>(null);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [deleteProperty, { isLoading: isDeleting }] = useDeletePropertyMutation();

    const getLocationStr = (loc: any): string => {
        if (!loc) return '';
        if (typeof loc === 'string') return loc.toLowerCase();
        return [loc.town, loc.county].filter(Boolean).join(', ').toLowerCase();
    };

    const filteredProperties = properties.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        getLocationStr(p.location).includes(searchTerm.toLowerCase())
    );

    const handleDelete = async (id: string) => {
        if (!window.confirm('Delete this property? This action cannot be undone.')) return;
        try {
            setDeletingId(id);
            await deleteProperty(id).unwrap();
        } catch (err: any) {
            alert(err?.data?.message || 'Delete failed');
        } finally {
            setDeletingId(null);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Properties</h2>
                    <p className="text-gray-500 dark:text-gray-400">Manage your property portfolio</p>
                </div>
                <Link
                    to="/dashboard/landlord/add-property"
                    className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:from-amber-600 hover:to-amber-700 transition-all shadow-lg shadow-amber-500/25"
                >
                    <Plus className="w-5 h-5" />
                    Add Property
                </Link>
            </div>

            {/* Search & Filter */}
            <div className="flex gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search properties by name or location..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500"
                    />
                </div>
                <button className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Filter className="w-5 h-5" />
                </button>
                <button className="px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <Download className="w-5 h-5" />
                </button>
            </div>

            {/* Properties Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProperties.map((property: any, index: number) => (
                    <motion.div
                        key={property.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-xl transition-shadow"
                    >
                        {/* Property Image Placeholder */}
                        <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 relative">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <Building2 className="w-12 h-12 text-gray-400" />
                            </div>
                            <div className="absolute top-4 right-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold
                                    ${property.status === 'active' ? 'bg-green-100 text-green-700' :
                                        property.status === 'draft' ? 'bg-yellow-100 text-yellow-700' :
                                            'bg-red-100 text-red-700'}`}>
                                    {property.status}
                                </span>
                            </div>
                        </div>

                        {/* Property Details */}
                        <div className="p-6">
                            <h3 className="font-bold text-lg text-gray-900 dark:text-white mb-2">{property.title}</h3>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">
                                {property.description || 'No description provided'}
                            </p>

                            <div className="space-y-2 mb-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <MapPin className="w-4 h-4" />
                                    {getLocationStr(property.location) || 'Location not specified'}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <DollarSign className="w-4 h-4" />
                                    KES {property.price_per_month?.toLocaleString()}/month
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                    <Users className="w-4 h-4" />
                                    {property.capacity || 'N/A'} occupants
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2">
                                <button
                                    onClick={() => window.open(`/property/${property.id}`, '_blank')}
                                    className="flex-1 px-4 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-xl font-medium text-sm hover:bg-amber-100 dark:hover:bg-amber-900/30 transition-colors"
                                >
                                    View Details
                                </button>
                                <button
                                    onClick={() => setEditingProperty(property)}
                                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                >
                                    <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                    disabled={deletingId === property.id || isDeleting}
                                    onClick={() => handleDelete(property.id)}
                                    className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                                >
                                    {deletingId === property.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            {filteredProperties.length === 0 && (
                <div className="text-center py-12">
                    <Building2 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No properties found</h3>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Get started by adding your first property</p>
                    <Link
                        to="/dashboard/landlord/add-property"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Property
                    </Link>
                </div>
            )}

            {/* Edit Property Modal */}
            <PropertyModal
                isOpen={!!editingProperty}
                onClose={() => setEditingProperty(null)}
                propertyToEdit={editingProperty}
            />
        </div>
    );
};

// Bookings Tab
const BookingsTab = () => {
    const bookings = [
        { id: 1, tenant: 'John Doe', property: 'Sunset Apartments', date: '2024-01-15', amount: 25000, status: 'confirmed' },
        { id: 2, tenant: 'Jane Smith', property: 'Green Heights', date: '2024-01-20', amount: 35000, status: 'pending' },
        { id: 3, tenant: 'Bob Johnson', property: 'Urban Loft', date: '2024-01-25', amount: 18000, status: 'cancelled' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Active Bookings</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tenant</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Property</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {bookings.map((booking) => (
                            <tr key={booking.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{booking.tenant}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{booking.property}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{booking.date}</td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">KES {booking.amount.toLocaleString()}</td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold
                                        ${booking.status === 'confirmed' ? 'bg-green-100 text-green-700' :
                                            booking.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'}`}>
                                        {booking.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button className="text-amber-600 hover:text-amber-700 font-medium text-sm">View</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Caretakers Tab
const CaretakersTab = () => {
    const caretakers = [
        { id: 1, name: 'Mike Wilson', property: 'Sunset Apartments', phone: '+254 712 345 678', status: 'active' },
        { id: 2, name: 'Sarah Brown', property: 'Green Heights', phone: '+254 723 456 789', status: 'active' },
        { id: 3, name: 'David Lee', property: 'Urban Loft', phone: '+254 734 567 890', status: 'inactive' },
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Caretakers</h2>
                    <p className="text-gray-500 dark:text-gray-400">Manage property caretakers</p>
                </div>
                <button className="bg-gradient-to-r from-amber-500 to-amber-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:from-amber-600 hover:to-amber-700 transition-all">
                    <UserCog className="w-5 h-5" />
                    Add Caretaker
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {caretakers.map((caretaker) => (
                    <div key={caretaker.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 flex items-center justify-center">
                                    <span className="text-lg font-bold text-amber-600 dark:text-amber-400">
                                        {caretaker.name.charAt(0)}
                                    </span>
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900 dark:text-white">{caretaker.name}</h3>
                                    <p className="text-sm text-gray-500">{caretaker.property}</p>
                                </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold
                                ${caretaker.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                                {caretaker.status}
                            </span>
                        </div>
                        <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Phone className="w-4 h-4" />
                                {caretaker.phone}
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                                <Mail className="w-4 h-4" />
                                {caretaker.name.toLowerCase().replace(' ', '.')}@example.com
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                Message
                            </button>
                            <button className="p-2 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                                <Edit3 className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Tenants Tab
const TenantsTab = () => {
    const tenants = [
        { id: 1, name: 'John Doe', property: 'Sunset Apartments', leaseStart: '2024-01-01', leaseEnd: '2024-12-31', status: 'active' },
        { id: 2, name: 'Jane Smith', property: 'Green Heights', leaseStart: '2024-02-01', leaseEnd: '2025-01-31', status: 'active' },
        { id: 3, name: 'Bob Johnson', property: 'Urban Loft', leaseStart: '2023-12-01', leaseEnd: '2024-11-30', status: 'pending' },
    ];

    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Current Tenants</h2>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-900">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tenant</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Property</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Lease Period</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                            <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                        {tenants.map((tenant) => (
                            <tr key={tenant.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{tenant.name}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">{tenant.property}</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                                    {tenant.leaseStart} - {tenant.leaseEnd}
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-bold
                                        ${tenant.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                        {tenant.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4">
                                    <button className="text-amber-600 hover:text-amber-700 font-medium text-sm">View Details</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Payments Tab
const PaymentsTab = ({ stats }: { stats: any }) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-500 mb-2">Total Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">KES {stats?.totalRent?.toLocaleString() || '0'}</p>
                    <p className="text-xs text-green-600 mt-2">+12.5% from last month</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-500 mb-2">Pending Payments</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">KES 45,000</p>
                    <p className="text-xs text-yellow-600 mt-2">3 pending invoices</p>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <p className="text-sm text-gray-500 mb-2">This Month</p>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">KES 128,000</p>
                    <p className="text-xs text-blue-600 mt-2">8 payments received</p>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
                <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Recent Transactions</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Date</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Property</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Tenant</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Amount</th>
                                <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                            <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">2024-01-15</td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">Sunset Apartments</td>
                                <td className="px-6 py-4 text-gray-600 dark:text-gray-400">John Doe</td>
                                <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">KES 25,000</td>
                                <td className="px-6 py-4">
                                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">paid</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Reports Tab
const ReportsTab = () => {
    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Reports & Analytics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Occupancy Rate</h3>
                    <div className="flex items-end gap-4">
                        <div className="flex-1">
                            <div className="h-48 bg-gray-100 dark:bg-gray-700 rounded-xl relative overflow-hidden">
                                <motion.div
                                    initial={{ height: 0 }}
                                    animate={{ height: '85%' }}
                                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-amber-500 to-amber-400"
                                />
                            </div>
                        </div>
                        <div className="text-center">
                            <p className="text-4xl font-bold text-gray-900 dark:text-white">85%</p>
                            <p className="text-sm text-gray-500">Current Rate</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Revenue Breakdown</h3>
                    <div className="space-y-3">
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Residential</span>
                                <span className="font-bold">KES 150,000</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full w-3/4 bg-blue-500 rounded-full" />
                            </div>
                        </div>
                        <div>
                            <div className="flex justify-between text-sm mb-1">
                                <span className="text-gray-600">Commercial</span>
                                <span className="font-bold">KES 85,000</span>
                            </div>
                            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full w-2/4 bg-green-500 rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Messages Tab
const MessagesTab = () => {
    return (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Messages</h2>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors cursor-pointer">
                        <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30 flex items-center justify-center flex-shrink-0">
                                <span className="text-lg font-bold text-amber-600 dark:text-amber-400">JD</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between mb-1">
                                    <h3 className="font-bold text-gray-900 dark:text-white">John Doe</h3>
                                    <span className="text-xs text-gray-500">2 hours ago</span>
                                </div>
                                <p className="text-sm text-gray-500 mb-2">Regarding the maintenance request at Sunset Apartments...</p>
                                <span className="text-xs px-2 py-1 bg-amber-100 text-amber-700 rounded-full">Property Inquiry</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

// Settings Tab
const SettingsTab = () => {
    return (
        <div className="max-w-4xl space-y-6">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Profile Settings
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Full Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500"
                            placeholder="Your name"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email Address</label>
                        <input
                            type="email"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500"
                            placeholder="your@email.com"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone Number</label>
                        <input
                            type="tel"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500"
                            placeholder="+254 700 000 000"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Company Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500"
                            placeholder="Your real estate company"
                        />
                    </div>
                </div>
                <div className="mt-6">
                    <button className="px-6 py-3 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors">
                        Save Changes
                    </button>
                </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Notification Preferences</h3>
                <div className="space-y-4">
                    <label className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Email Notifications</span>
                        <input type="checkbox" className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">SMS Alerts</span>
                        <input type="checkbox" className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500" />
                    </label>
                    <label className="flex items-center justify-between">
                        <span className="text-gray-700 dark:text-gray-300">Payment Reminders</span>
                        <input type="checkbox" className="w-5 h-5 text-amber-500 rounded focus:ring-amber-500" defaultChecked />
                    </label>
                </div>
            </div>
        </div>
    );
};

export default LandlordDashboard;
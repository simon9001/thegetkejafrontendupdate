// frontend/src/pages/Dashboard/LandlordDashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Users, LayoutDashboard, Calendar, Settings, Search,
  Plus, Filter, MoreVertical, Edit3, Building2, TrendingUp,
  DollarSign, MapPin, ChevronRight, AlertCircle, Key,
  MessageSquare, Download, Trash2, UserCog, Phone, Mail,
  Loader2, Home, LogOut, Menu, Bell, ArrowUpRight, ArrowDownRight,
  BarChart3, Eye, Star,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearCredentials, selectCurrentUser } from '../../features/Slice/AuthSlice';
import { useLogoutMutation } from '../../features/Api/AuthApi';
import { useGetLandlordDashboardQuery } from '../../features/Api/DashboardApi';
import { useGetMyPropertiesQuery, useDeletePropertyMutation } from '../../features/Api/PropertiesApi';
import PropertyModal from '../../components/dashboard/modals/PropertyModal';

// ─── Nav ─────────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'overview',    label: 'Overview',         icon: LayoutDashboard },
  { id: 'properties',  label: 'My Properties',    icon: Building2 },
  { id: 'bookings',    label: 'Active Bookings',  icon: Calendar },
  { id: 'caretakers',  label: 'Caretakers',       icon: Users },
  { id: 'tenants',     label: 'Tenants',          icon: Key },
  { id: 'payments',    label: 'Payments',         icon: DollarSign },
  { id: 'reports',     label: 'Reports',          icon: TrendingUp },
  { id: 'messages',    label: 'Messages',         icon: MessageSquare },
  { id: 'settings',    label: 'Settings',         icon: Settings },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatLocation = (loc: any): string => {
  if (!loc) return 'Nairobi';
  if (typeof loc === 'string') return loc;
  return [loc.area ?? loc.town, loc.county].filter(Boolean).join(', ') || 'Nairobi';
};

// ─── Shared primitives ────────────────────────────────────────────────────────
const Badge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    active:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    confirmed: 'bg-blue-50   text-blue-700   border-blue-200',
    pending:   'bg-amber-50  text-amber-700  border-amber-200',
    paid:      'bg-emerald-50 text-emerald-700 border-emerald-200',
    cancelled: 'bg-red-50    text-red-700    border-red-200',
    draft:     'bg-gray-50   text-gray-600   border-gray-200',
    inactive:  'bg-gray-50   text-gray-500   border-gray-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${map[status] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
      {status}
    </span>
  );
};

const SectionHeader: React.FC<{ title: string; sub?: string; action?: React.ReactNode }> = ({ title, sub, action }) => (
  <div className="flex items-center justify-between mb-5">
    <div>
      <h2 className="text-base font-bold text-[#222222] tracking-tight">{title}</h2>
      {sub && <p className="text-xs text-[#6a6a6a] mt-0.5">{sub}</p>}
    </div>
    {action}
  </div>
);

interface StatCardProps {
  label: string; value: string | number; sub?: string;
  trend?: number; icon: React.ElementType; accent: string; loading?: boolean;
}
const StatCard: React.FC<StatCardProps> = ({ label, value, sub, trend, icon: Icon, accent, loading }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      {trend !== undefined && (
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${trend >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
          {trend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
          {Math.abs(trend)}%
        </span>
      )}
    </div>
    {loading ? (
      <div className="space-y-2">
        <div className="h-7 w-20 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-3.5 w-28 bg-gray-100 rounded animate-pulse" />
      </div>
    ) : (
      <>
        <p className="text-2xl font-bold text-[#222222] tracking-tight">{value}</p>
        <p className="text-xs text-[#6a6a6a] mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-[#6a6a6a] mt-1 font-medium">{sub}</p>}
      </>
    )}
  </div>
);

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
const OverviewTab: React.FC<{ stats: any; properties: any[]; loading: boolean; setActiveTab: (t: string) => void }> = ({
  stats, properties, loading, setActiveTab,
}) => {
  const statCards: StatCardProps[] = [
    { label: 'Total Properties',   value: stats?.ownedProperties ?? properties.length, sub: 'In your portfolio',    icon: Building2,  accent: 'bg-blue-50 text-blue-600',    trend: 12 },
    { label: 'Active Bookings',    value: stats?.activeBookings ?? 0,                   sub: 'Current tenancies',    icon: Calendar,   accent: 'bg-violet-50 text-violet-600', trend: 8 },
    { label: 'Monthly Revenue',    value: `KES ${(stats?.totalRent ?? 0).toLocaleString()}`, sub: 'Rental income', icon: DollarSign, accent: 'bg-emerald-50 text-emerald-600', trend: 15 },
    { label: 'Active Caretakers',  value: stats?.activeCaretakers ?? 0,                sub: 'On your properties',   icon: Users,      accent: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-[#111827] rounded-2xl p-7">
        <div className="relative z-10">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Property Management</p>
          <h2 className="text-2xl font-bold text-white mb-1">Portfolio Overview</h2>
          <p className="text-white/60 text-sm max-w-xl">Manage your properties, track bookings, and monitor performance all in one place.</p>
          <div className="flex gap-3 mt-5 flex-wrap">
            <Link to="/dashboard/add-property"
              className="inline-flex items-center gap-2 bg-[#ff385c] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#e00b41] transition-all shadow-lg shadow-[#ff385c]/30">
              <Plus className="w-4 h-4" /> Add Property
            </Link>
            <button className="inline-flex items-center gap-2 bg-white/10 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-white/20 transition-all">
              <Download className="w-4 h-4" /> Export Report
            </button>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-[#ff385c]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-6 -bottom-6 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </motion.div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...c} loading={loading} />
          </motion.div>
        ))}
      </div>

      {/* Recent properties */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
        <SectionHeader
          title="Recent Properties"
          sub="Your latest listed properties"
          action={
            <button onClick={() => setActiveTab('properties')} className="text-xs text-[#ff385c] font-semibold hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          }
        />
        {properties.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-[#6a6a6a] gap-2 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Building2 className="w-8 h-8 opacity-20" />
            <p className="text-xs font-medium">No properties yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {properties.slice(0, 5).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                    {(p.media?.[0]?.url ?? p.images?.[0]?.image_url)
                      ? <img src={p.media?.[0]?.url ?? p.images![0].image_url} className="w-full h-full object-cover" alt="" />
                      : <Building2 className="w-5 h-5 text-gray-300 mx-auto mt-2.5" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#222222]">{p.title}</p>
                    <p className="text-xs text-[#6a6a6a] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3" /> {formatLocation(p.location)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#ff385c] hidden sm:block">
                    KES {(p.pricing?.monthly_rent ?? p.pricing?.asking_price ?? p.price_per_month ?? 0).toLocaleString()}/mo
                  </span>
                  <Badge status={p.status ?? 'active'} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Snapshot row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Occupancy Rate', value: '85%',   color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Avg. Rent',      value: 'KES 22K', color: 'text-blue-600',  bg: 'bg-blue-50' },
          { label: 'Pending Rent',   value: 'KES 45K', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Enquiries',      value: '23',     color: 'text-violet-600', bg: 'bg-violet-50' },
        ].map(m => (
          <div key={m.label} className={`${m.bg} rounded-2xl p-5 text-center`}>
            <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
            <p className="text-xs text-[#6a6a6a] mt-1 font-medium">{m.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── PROPERTIES TAB ───────────────────────────────────────────────────────────
const PropertiesTab: React.FC<{ properties: any[] }> = ({ properties }) => {
  const [searchTerm, setSearchTerm]   = useState('');
  const [editingProperty, setEditingProperty] = useState<any | null>(null);
  const [deletingId, setDeletingId]   = useState<string | null>(null);
  const [deleteProperty, { isLoading: isDeleting }] = useDeletePropertyMutation();

  const getLocationStr = (loc: any): string =>
    !loc ? '' : typeof loc === 'string' ? loc.toLowerCase() : [loc.area ?? loc.town, loc.county].filter(Boolean).join(', ').toLowerCase();

  const filtered = properties.filter(p =>
    p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getLocationStr(p.location).includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this property? This action cannot be undone.')) return;
    try { setDeletingId(id); await deleteProperty(id).unwrap(); }
    catch (err: any) { alert(err?.data?.message || 'Delete failed'); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader
        title={`My Properties (${properties.length})`}
        action={
          <Link to="/dashboard/add-property"
            className="flex items-center gap-2 bg-[#ff385c] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#e00b41] transition-all">
            <Plus className="w-4 h-4" /> Add Property
          </Link>
        }
      />

      {/* Search */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6a6a6a]" />
          <input type="text" placeholder="Search by name or location…" value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-[#222222] placeholder:text-[#6a6a6a] focus:outline-none focus:ring-2 focus:ring-[#ff385c]/30 focus:border-[#ff385c]" />
        </div>
        <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-[#6a6a6a] hover:text-[#222222] transition-colors">
          <Filter className="w-4 h-4" />
        </button>
        <button className="w-10 h-10 flex items-center justify-center bg-white border border-gray-200 rounded-xl text-[#6a6a6a] hover:text-[#222222] transition-colors">
          <Download className="w-4 h-4" />
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 text-[#6a6a6a] gap-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
          <Building2 className="w-12 h-12 opacity-20" />
          <p className="text-sm font-medium">No properties found</p>
          <Link to="/dashboard/add-property" className="text-xs text-[#ff385c] font-semibold hover:underline">
            Add your first property
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p: any, i: number) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
              {/* Image */}
              <div className="h-44 bg-gray-100 relative overflow-hidden">
                {(p.media?.[0]?.url ?? p.images?.[0]?.image_url)
                  ? <img src={p.media?.[0]?.url ?? p.images![0].image_url} className="w-full h-full object-cover" alt={p.title} />
                  : <div className="w-full h-full flex items-center justify-center"><Building2 className="w-10 h-10 text-gray-300" /></div>
                }
                <div className="absolute top-3 right-3"><Badge status={p.status ?? 'active'} /></div>
              </div>
              {/* Details */}
              <div className="p-5">
                <h3 className="font-bold text-[#222222] mb-1 truncate">{p.title}</h3>
                <p className="text-xs text-[#6a6a6a] mb-3 line-clamp-2">{p.description || 'No description provided'}</p>
                <div className="space-y-1.5 mb-4">
                  <p className="text-xs text-[#6a6a6a] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {getLocationStr(p.location) || 'Location not specified'}
                  </p>
                  <p className="text-sm font-bold text-[#ff385c]">KES {(p.pricing?.monthly_rent ?? p.pricing?.asking_price ?? p.price_per_month ?? 0).toLocaleString()}/mo</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => window.open(`/property/${p.id}`, '_blank')}
                    className="flex-1 px-3 py-2 bg-gray-50 text-[#222222] rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors border border-gray-200 flex items-center justify-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button onClick={() => setEditingProperty(p)}
                    className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl text-[#6a6a6a] hover:bg-gray-50 transition-colors">
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button disabled={deletingId === p.id || isDeleting} onClick={() => handleDelete(p.id)}
                    className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40">
                    {deletingId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <PropertyModal isOpen={!!editingProperty} onClose={() => setEditingProperty(null)} propertyToEdit={editingProperty} />
    </div>
  );
};

// ─── BOOKINGS TAB ────────────────────────────────────────────────────────────
const MOCK_BOOKINGS = [
  { id: 1, tenant: 'John Doe',    property: 'Sunset Apartments', date: '2024-01-15', amount: 25000, status: 'confirmed' },
  { id: 2, tenant: 'Jane Smith',  property: 'Green Heights',     date: '2024-01-20', amount: 35000, status: 'pending' },
  { id: 3, tenant: 'Bob Johnson', property: 'Urban Loft',        date: '2024-01-25', amount: 18000, status: 'cancelled' },
];

const BookingsTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader title="Active Bookings" sub={`${MOCK_BOOKINGS.filter(b => b.status === 'confirmed').length} confirmed`} />
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] text-[#6a6a6a] font-semibold uppercase border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3.5">Tenant</th>
              <th className="text-left px-5 py-3.5">Property</th>
              <th className="text-left px-5 py-3.5">Date</th>
              <th className="text-right px-5 py-3.5">Amount</th>
              <th className="text-right px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MOCK_BOOKINGS.map(b => (
              <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 font-semibold text-[#222222]">{b.tenant}</td>
                <td className="px-5 py-4 text-[#6a6a6a]">{b.property}</td>
                <td className="px-5 py-4 text-[#6a6a6a]">{b.date}</td>
                <td className="px-5 py-4 text-right font-bold text-[#222222]">KES {b.amount.toLocaleString()}</td>
                <td className="px-5 py-4 text-right"><Badge status={b.status} /></td>
                <td className="px-5 py-4 text-right">
                  <button className="text-xs text-[#ff385c] font-semibold hover:underline">View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// ─── CARETAKERS TAB ──────────────────────────────────────────────────────────
const MOCK_CARETAKERS = [
  { id: 1, name: 'Mike Wilson', property: 'Sunset Apartments', phone: '+254 712 345 678', status: 'active' },
  { id: 2, name: 'Sarah Brown', property: 'Green Heights',     phone: '+254 723 456 789', status: 'active' },
  { id: 3, name: 'David Lee',   property: 'Urban Loft',        phone: '+254 734 567 890', status: 'inactive' },
];

const CaretakersTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader
      title="Caretakers"
      sub="Property caretakers under your management"
      action={
        <button className="flex items-center gap-2 bg-[#ff385c] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#e00b41] transition-all">
          <UserCog className="w-4 h-4" /> Add Caretaker
        </button>
      }
    />
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {MOCK_CARETAKERS.map(c => (
        <div key={c.id} className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#111827] flex items-center justify-center shrink-0">
                <span className="text-[#ff385c] font-bold">{c.name[0]}</span>
              </div>
              <div>
                <h3 className="font-bold text-[#222222]">{c.name}</h3>
                <p className="text-xs text-[#6a6a6a]">{c.property}</p>
              </div>
            </div>
            <Badge status={c.status} />
          </div>
          <div className="space-y-1.5 mb-4">
            <p className="text-xs text-[#6a6a6a] flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" />{c.phone}</p>
            <p className="text-xs text-[#6a6a6a] flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{c.name.toLowerCase().replace(' ', '.')}@example.com</p>
          </div>
          <div className="flex gap-2">
            <button className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-xs font-bold text-[#222222] hover:bg-gray-50 transition-colors">Message</button>
            <button className="w-9 h-9 flex items-center justify-center border border-gray-200 rounded-xl text-[#6a6a6a] hover:bg-gray-50 transition-colors">
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── TENANTS TAB ─────────────────────────────────────────────────────────────
const MOCK_TENANTS = [
  { id: 1, name: 'John Doe',    property: 'Sunset Apartments', leaseStart: '2024-01-01', leaseEnd: '2024-12-31', status: 'active' },
  { id: 2, name: 'Jane Smith',  property: 'Green Heights',     leaseStart: '2024-02-01', leaseEnd: '2025-01-31', status: 'active' },
  { id: 3, name: 'Bob Johnson', property: 'Urban Loft',        leaseStart: '2023-12-01', leaseEnd: '2024-11-30', status: 'pending' },
];

const TenantsTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader title="Current Tenants" sub={`${MOCK_TENANTS.filter(t => t.status === 'active').length} active tenancies`} />
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] text-[#6a6a6a] font-semibold uppercase border-b border-gray-100 bg-gray-50">
              <th className="text-left px-5 py-3.5">Tenant</th>
              <th className="text-left px-5 py-3.5">Property</th>
              <th className="text-left px-5 py-3.5">Lease Period</th>
              <th className="text-right px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {MOCK_TENANTS.map(t => (
              <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-5 py-4 font-semibold text-[#222222]">{t.name}</td>
                <td className="px-5 py-4 text-[#6a6a6a]">{t.property}</td>
                <td className="px-5 py-4 text-[#6a6a6a] text-xs">{t.leaseStart} → {t.leaseEnd}</td>
                <td className="px-5 py-4 text-right"><Badge status={t.status} /></td>
                <td className="px-5 py-4 text-right">
                  <button className="text-xs text-[#ff385c] font-semibold hover:underline">Details</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// ─── PAYMENTS TAB ────────────────────────────────────────────────────────────
const PaymentsTab: React.FC<{ stats: any }> = ({ stats }) => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader title="Payments" sub="Revenue and transaction history" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { label: 'Total Revenue',      value: `KES ${(stats?.totalRent ?? 0).toLocaleString()}`, sub: '+12.5% from last month', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Pending Payments',   value: 'KES 45,000',  sub: '3 pending invoices', color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'This Month',         value: 'KES 128,000', sub: '8 payments received', color: 'text-blue-600',  bg: 'bg-blue-50' },
      ].map(c => (
        <div key={c.label} className={`${c.bg} rounded-2xl p-5`}>
          <p className={`text-2xl font-bold ${c.color} tracking-tight`}>{c.value}</p>
          <p className="text-xs text-[#6a6a6a] mt-0.5 font-medium">{c.label}</p>
          <p className="text-[11px] text-[#6a6a6a] mt-1">{c.sub}</p>
        </div>
      ))}
    </div>
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100">
        <h3 className="font-bold text-[#222222]">Recent Transactions</h3>
      </div>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-[11px] text-[#6a6a6a] font-semibold uppercase bg-gray-50 border-b border-gray-100">
            <th className="text-left px-5 py-3">Date</th>
            <th className="text-left px-5 py-3">Property</th>
            <th className="text-left px-5 py-3">Tenant</th>
            <th className="text-right px-5 py-3">Amount</th>
            <th className="text-right px-5 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          <tr className="hover:bg-gray-50 transition-colors">
            <td className="px-5 py-4 text-[#6a6a6a]">2024-01-15</td>
            <td className="px-5 py-4 font-semibold text-[#222222]">Sunset Apartments</td>
            <td className="px-5 py-4 text-[#6a6a6a]">John Doe</td>
            <td className="px-5 py-4 text-right font-bold text-[#222222]">KES 25,000</td>
            <td className="px-5 py-4 text-right"><Badge status="paid" /></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

// ─── REPORTS TAB ─────────────────────────────────────────────────────────────
const ReportsTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader title="Reports & Analytics" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
        <h3 className="font-bold text-[#222222] mb-4">Occupancy Rate</h3>
        <div className="flex items-end gap-6">
          <div className="flex-1 h-40 bg-gray-50 rounded-xl relative overflow-hidden border border-gray-100">
            <motion.div initial={{ height: 0 }} animate={{ height: '85%' }}
              transition={{ duration: 1, delay: 0.3 }}
              className="absolute bottom-0 left-0 right-0 bg-[#ff385c]/80 rounded-t-lg" />
          </div>
          <div className="text-center shrink-0">
            <p className="text-3xl font-bold text-[#222222]">85%</p>
            <p className="text-xs text-[#6a6a6a] mt-1 font-medium">Current Rate</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
        <h3 className="font-bold text-[#222222] mb-4">Revenue Breakdown</h3>
        <div className="space-y-4">
          {[
            { label: 'Residential', value: 'KES 150,000', pct: '75%', color: 'bg-[#ff385c]' },
            { label: 'Commercial',  value: 'KES 85,000',  pct: '50%', color: 'bg-blue-500' },
          ].map(r => (
            <div key={r.label}>
              <div className="flex justify-between text-sm mb-1.5">
                <span className="text-[#6a6a6a] font-medium">{r.label}</span>
                <span className="font-bold text-[#222222]">{r.value}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: r.pct }} transition={{ duration: 0.8 }}
                  className={`h-full ${r.color} rounded-full`} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

// ─── MESSAGES TAB ────────────────────────────────────────────────────────────
const MessagesTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader title="Messages" sub="3 unread messages" />
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
      <div className="divide-y divide-gray-50">
        {[1, 2, 3].map(i => (
          <div key={i} className="p-5 hover:bg-gray-50 transition-colors cursor-pointer">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-[#111827] flex items-center justify-center shrink-0">
                <span className="text-[#ff385c] text-sm font-bold">JD</span>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-[#222222] text-sm">John Doe</h3>
                  <span className="text-[11px] text-[#6a6a6a]">2 hours ago</span>
                </div>
                <p className="text-xs text-[#6a6a6a] mb-2">Regarding the maintenance request at Sunset Apartments...</p>
                <span className="text-[10px] px-2 py-0.5 bg-[#ff385c]/10 text-[#ff385c] rounded-full font-semibold">Property Inquiry</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

// ─── SETTINGS TAB ────────────────────────────────────────────────────────────
const SettingsTab: React.FC = () => (
  <div className="max-w-2xl space-y-5">
    <SectionHeader title="Profile Settings" />
    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
        {[
          { label: 'Full Name', placeholder: 'Your name', type: 'text' },
          { label: 'Email Address', placeholder: 'your@email.com', type: 'email' },
          { label: 'Phone Number', placeholder: '+254 700 000 000', type: 'tel' },
          { label: 'Company Name', placeholder: 'Your real estate company', type: 'text' },
        ].map(f => (
          <div key={f.label}>
            <label className="text-[10px] font-bold text-[#6a6a6a] uppercase tracking-wider block mb-1.5">{f.label}</label>
            <input type={f.type} placeholder={f.placeholder}
              className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-[#222222] placeholder:text-[#6a6a6a] focus:outline-none focus:ring-2 focus:ring-[#ff385c]/30 focus:border-[#ff385c]" />
          </div>
        ))}
      </div>
      <button className="px-5 py-2.5 bg-[#ff385c] text-white rounded-xl font-bold text-sm hover:bg-[#e00b41] transition-all">
        Save Changes
      </button>
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
      <h3 className="font-bold text-[#222222] mb-4">Notification Preferences</h3>
      <div className="space-y-3">
        {[
          { label: 'Email Notifications', defaultChecked: true },
          { label: 'SMS Alerts',          defaultChecked: false },
          { label: 'Payment Reminders',   defaultChecked: true },
        ].map(n => (
          <label key={n.label} className="flex items-center justify-between cursor-pointer">
            <span className="text-sm text-[#222222] font-medium">{n.label}</span>
            <input type="checkbox" defaultChecked={n.defaultChecked}
              className="w-4 h-4 accent-[#ff385c] rounded" />
          </label>
        ))}
      </div>
    </div>
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const LandlordDashboard: React.FC = () => {
  const dispatch      = useDispatch();
  const navigate      = useNavigate();
  const user          = useSelector(selectCurrentUser);
  const [activeTab, setActiveTab]     = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isPropertyModalOpen, setIsPropertyModalOpen] = useState(false);
  const [logout] = useLogoutMutation();

  useEffect(() => {
    if (user && !user.roles?.includes('landlord') && !user.roles?.includes('developer')) navigate('/');
  }, [user, navigate]);

  const { data: stats,          isLoading: statsLoading  } = useGetLandlordDashboardQuery(undefined, { skip: !user });
  const { data: propertiesData, isLoading: propsLoading  } = useGetMyPropertiesQuery(undefined,       { skip: !user });

  const properties = propertiesData?.properties ?? [];
  const loading    = statsLoading || propsLoading;

  const handleLogout = async () => {
    try {
      const rt = localStorage.getItem('refreshToken');
      if (rt) await logout({ refreshToken: rt }).unwrap();
    } catch {}
    dispatch(clearCredentials());
    navigate('/login');
  };

  // Access denied state
  if (user && !user.roles?.includes('landlord') && !user.roles?.includes('developer')) {
    return (
      <div className="min-h-screen bg-[#f7f7f7] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-12 text-center max-w-sm border border-gray-100">
          <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-[#222222] mb-2">Access Denied</h2>
          <p className="text-sm text-[#6a6a6a] mb-5">You don't have permission to view this page.</p>
          <Link to="/" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#ff385c] text-white rounded-xl font-bold text-sm hover:bg-[#e00b41] transition-all">
            Return Home <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const navBadges: Record<string, number> = {
    properties: properties.length,
    messages:   3,
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':    return <OverviewTab stats={stats} properties={properties} loading={loading} setActiveTab={setActiveTab} />;
      case 'properties':  return <PropertiesTab properties={properties} />;
      case 'bookings':    return <BookingsTab />;
      case 'caretakers':  return <CaretakersTab />;
      case 'tenants':     return <TenantsTab />;
      case 'payments':    return <PaymentsTab stats={stats} />;
      case 'reports':     return <ReportsTab />;
      case 'messages':    return <MessagesTab />;
      case 'settings':    return <SettingsTab />;
      default:            return <OverviewTab stats={stats} properties={properties} loading={loading} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex font-['DM_Sans',sans-serif]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-56 bg-[#111827] flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#ff385c] flex items-center justify-center shrink-0">
              <Home className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm tracking-tight">GetKeja</span>
              <span className="block text-white/40 text-[10px] font-medium uppercase tracking-widest">Landlord</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            const badge  = navBadges[id];
            return (
              <button key={id} onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}>
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#ff385c]' : ''}`} />
                <span className="flex-1 text-left">{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className="text-[10px] font-bold bg-[#ff385c] text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-[#ff385c]/20 flex items-center justify-center shrink-0">
              <span className="text-[#ff385c] text-xs font-bold">{(user?.full_name ?? user?.email ?? 'L')[0].toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.full_name ?? user?.email}</p>
              <p className="text-white/40 text-[10px] capitalize">{user?.primaryRole ?? 'landlord'}</p>
            </div>
            <button onClick={handleLogout} className="text-white/30 hover:text-[#ff385c] transition-colors shrink-0">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center gap-4 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#6a6a6a] hover:text-[#222222] transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-[#222222] tracking-tight">
              {NAV.find(n => n.id === activeTab)?.label ?? 'Dashboard'}
            </h1>
            <p className="text-xs text-[#6a6a6a]">
              {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-48">
              <Search className="w-3.5 h-3.5 text-[#6a6a6a]" />
              <input placeholder="Search…" className="bg-transparent text-xs text-[#222222] placeholder:text-[#6a6a6a] outline-none flex-1" />
            </div>
            <button className="relative w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-[#6a6a6a] hover:text-[#222222] transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#ff385c] rounded-full" />
            </button>
            <button onClick={() => setIsPropertyModalOpen(true)}
              className="hidden sm:flex items-center gap-1.5 bg-[#ff385c] text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-[#e00b41] transition-all">
              <Plus className="w-3.5 h-3.5" /> Add Property
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>
      </div>

      <PropertyModal isOpen={isPropertyModalOpen} onClose={() => setIsPropertyModalOpen(false)} />
    </div>
  );
};

export default LandlordDashboard;
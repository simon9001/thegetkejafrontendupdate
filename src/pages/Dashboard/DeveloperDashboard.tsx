// frontend/src/pages/Dashboard/DeveloperDashboard.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Building2, TrendingUp, DollarSign,
  MapPin, Plus, Eye, Edit3, Trash2, Search, Filter,
  Download, ArrowUpRight, ArrowDownRight, CheckCircle2,
  Clock, AlertTriangle, Loader2, LogOut, Menu, Bell,
  BarChart3, Layers, HardHat, Key, Users, ChevronRight,
  Star, Home,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { clearCredentials, selectCurrentUser } from '../../features/Slice/AuthSlice';
import { useLogoutMutation } from '../../features/Api/AuthApi';
import { useGetMyPropertiesQuery, useDeletePropertyMutation } from '../../features/Api/PropertiesApi';

// ─── Nav ─────────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'overview',   label: 'Overview',      icon: LayoutDashboard },
  { id: 'projects',   label: 'My Projects',   icon: Building2 },
  { id: 'pipeline',   label: 'Sales Pipeline',icon: TrendingUp },
  { id: 'units',      label: 'Unit Tracker',  icon: Layers },
  { id: 'reports',    label: 'Reports',       icon: BarChart3 },
];

// ─── Shared primitives ────────────────────────────────────────────────────────
const Badge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    active:           'bg-emerald-50 text-emerald-700 border-emerald-200',
    draft:            'bg-gray-50   text-gray-500   border-gray-200',
    pending_review:   'bg-amber-50  text-amber-700  border-amber-200',
    suspended:        'bg-red-50    text-red-700    border-red-200',
    completed:        'bg-blue-50   text-blue-700   border-blue-200',
    off_plan:         'bg-violet-50 text-violet-700 border-violet-200',
    under_construction: 'bg-orange-50 text-orange-700 border-orange-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${map[status] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
      {(status ?? '').replace(/_/g, ' ')}
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

const getLocationStr = (loc: any): string => {
  if (!loc) return '';
  if (typeof loc === 'string') return loc;
  return [loc.area ?? loc.town, loc.county].filter(Boolean).join(', ');
};

const getPriceStr = (p: any): string => {
  const amount = p.pricing?.monthly_rent ?? p.pricing?.asking_price ?? p.price_per_month ?? 0;
  const suffix = p.pricing?.asking_price && !p.pricing?.monthly_rent ? '' : '/mo';
  return `KES ${amount.toLocaleString()}${suffix}`;
};

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
const OverviewTab: React.FC<{
  properties: any[]; loading: boolean; setActiveTab: (t: string) => void;
}> = ({ properties, loading, setActiveTab }) => {
  const active    = properties.filter(p => p.status === 'active').length;
  const offPlan   = properties.filter(p => p.construction_status === 'off_plan').length;
  const underCons = properties.filter(p => p.construction_status === 'under_construction').length;

  const statCards: StatCardProps[] = [
    { label: 'Total Projects',    value: properties.length, sub: 'All listings',           icon: Building2,   accent: 'bg-blue-50 text-blue-600',    trend: 5 },
    { label: 'Active Listings',   value: active,            sub: 'Live on platform',        icon: CheckCircle2,accent: 'bg-emerald-50 text-emerald-600', trend: 12 },
    { label: 'Off-Plan Projects', value: offPlan,           sub: 'Pre-sale units',           icon: HardHat,     accent: 'bg-violet-50 text-violet-600' },
    { label: 'Under Construction',value: underCons,         sub: 'In progress',              icon: AlertTriangle,accent: 'bg-amber-50 text-amber-600' },
  ];

  const recent = [...properties].sort((a, b) =>
    new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
  ).slice(0, 5);

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-[#111827] rounded-2xl p-7">
        <div className="relative z-10">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Developer Portal</p>
          <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-white/60 text-sm max-w-xl">Manage your projects, track units, and grow your property portfolio — all in one place.</p>
          <div className="flex gap-3 mt-5">
            <Link to="/dashboard/add-property"
              className="inline-flex items-center gap-2 bg-[#ff385c] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#e00b41] transition-all shadow-lg shadow-[#ff385c]/30">
              <Plus className="w-4 h-4" /> New Project
            </Link>
            <button onClick={() => setActiveTab('projects')}
              className="inline-flex items-center gap-2 bg-white/10 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-white/20 transition-all">
              <Eye className="w-4 h-4" /> View All
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

      {/* Recent projects */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6">
        <SectionHeader
          title="Recent Projects"
          sub="Your latest property listings"
          action={
            <button onClick={() => setActiveTab('projects')}
              className="text-xs text-[#ff385c] font-semibold flex items-center gap-1 hover:underline">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          }
        />
        {recent.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-[#6a6a6a] gap-2 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Building2 className="w-8 h-8 opacity-20" />
            <p className="text-xs font-medium">No projects yet</p>
            <Link to="/dashboard/add-property" className="text-xs text-[#ff385c] font-semibold hover:underline">Add your first project</Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recent.map((p: any) => (
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
                      <MapPin className="w-3 h-3" /> {getLocationStr(p.location) || 'Location not set'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-[#ff385c] hidden sm:block">{getPriceStr(p)}</span>
                  <Badge status={p.status ?? 'draft'} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pipeline snapshot */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Enquiries',       value: '—', color: 'text-blue-600',    bg: 'bg-blue-50' },
          { label: 'Units Reserved',  value: '—', color: 'text-violet-600',  bg: 'bg-violet-50' },
          { label: 'Units Sold',      value: '—', color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Revenue Pipeline',value: '—', color: 'text-amber-600',   bg: 'bg-amber-50' },
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

// ─── PROJECTS TAB ─────────────────────────────────────────────────────────────
const ProjectsTab: React.FC<{ properties: any[] }> = ({ properties }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [deleteProperty, { isLoading: isDeleting }] = useDeletePropertyMutation();

  const filtered = properties.filter(p =>
    p.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    getLocationStr(p.location).toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this project? This action cannot be undone.')) return;
    try { setDeletingId(id); await deleteProperty(id).unwrap(); }
    catch (err: any) { alert(err?.data?.message || 'Delete failed'); }
    finally { setDeletingId(null); }
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader
        title={`My Projects (${properties.length})`}
        action={
          <Link to="/dashboard/add-property"
            className="flex items-center gap-2 bg-[#ff385c] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#e00b41] transition-all">
            <Plus className="w-4 h-4" /> New Project
          </Link>
        }
      />

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
          <p className="text-sm font-medium">No projects found</p>
          <Link to="/dashboard/add-property" className="text-xs text-[#ff385c] font-semibold hover:underline">
            Add your first project
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p: any, i: number) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
              <div className="h-44 bg-gray-100 relative overflow-hidden">
                {(p.media?.[0]?.url ?? p.images?.[0]?.image_url)
                  ? <img src={p.media?.[0]?.url ?? p.images![0].image_url} className="w-full h-full object-cover" alt={p.title} />
                  : <div className="w-full h-full flex items-center justify-center"><Building2 className="w-10 h-10 text-gray-300" /></div>
                }
                <div className="absolute top-3 right-3"><Badge status={p.status ?? 'draft'} /></div>
                {p.construction_status && p.construction_status !== 'completed' && (
                  <div className="absolute bottom-3 left-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white uppercase tracking-wide">
                      {p.construction_status.replace(/_/g, ' ')}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-[#222222] mb-1 truncate">{p.title}</h3>
                <p className="text-xs text-[#6a6a6a] mb-3 line-clamp-2">{p.description || 'No description provided'}</p>
                <div className="space-y-1.5 mb-4">
                  <p className="text-xs text-[#6a6a6a] flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5" /> {getLocationStr(p.location) || 'Location not specified'}
                  </p>
                  <p className="text-xs text-[#6a6a6a] capitalize flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5" />
                    {p.listing_category?.replace(/_/g, ' ')} · {p.listing_type?.replace(/_/g, ' ')}
                  </p>
                  <p className="text-sm font-bold text-[#ff385c]">{getPriceStr(p)}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => window.open(`/property/${p.id}`, '_blank')}
                    className="flex-1 px-3 py-2 bg-gray-50 text-[#222222] rounded-xl text-xs font-bold hover:bg-gray-100 transition-colors border border-gray-200 flex items-center justify-center gap-1.5">
                    <Eye className="w-3.5 h-3.5" /> View
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
    </div>
  );
};

// ─── PIPELINE TAB ─────────────────────────────────────────────────────────────
const PipelineTab: React.FC<{ properties: any[] }> = ({ properties }) => {
  const stages = [
    { key: 'draft',          label: 'Draft',           color: 'bg-gray-100 text-gray-600',     dot: 'bg-gray-400' },
    { key: 'pending_review', label: 'Pending Review',  color: 'bg-amber-50 text-amber-700',    dot: 'bg-amber-500' },
    { key: 'active',         label: 'Active',          color: 'bg-emerald-50 text-emerald-700',dot: 'bg-emerald-500' },
    { key: 'suspended',      label: 'Suspended',       color: 'bg-red-50 text-red-700',        dot: 'bg-red-500' },
  ];

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="Sales Pipeline" sub="Your projects by listing status" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stages.map(stage => {
          const items = properties.filter(p => (p.status ?? 'draft') === stage.key);
          return (
            <div key={stage.key} className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-4">
              <div className="flex items-center gap-2 mb-4">
                <div className={`w-2 h-2 rounded-full ${stage.dot}`} />
                <span className="text-xs font-bold text-[#222222] uppercase tracking-wide">{stage.label}</span>
                <span className="ml-auto text-xs font-bold text-[#6a6a6a]">{items.length}</span>
              </div>
              <div className="space-y-3">
                {items.length === 0 ? (
                  <p className="text-xs text-[#6a6a6a] text-center py-4 opacity-60">None</p>
                ) : items.map(p => (
                  <div key={p.id} className={`rounded-xl p-3 text-xs ${stage.color}`}>
                    <p className="font-semibold truncate">{p.title}</p>
                    <p className="mt-0.5 opacity-70">{getLocationStr(p.location) || '—'}</p>
                    <p className="mt-1 font-bold">{getPriceStr(p)}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── UNIT TRACKER TAB ─────────────────────────────────────────────────────────
const UnitsTab: React.FC<{ properties: any[] }> = ({ properties }) => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader
      title="Unit Tracker"
      sub="Track availability and reservations per project"
      action={
        <Link to="/dashboard/add-property"
          className="flex items-center gap-2 bg-[#ff385c] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#e00b41] transition-all">
          <Plus className="w-4 h-4" /> Add Project
        </Link>
      }
    />
    {properties.length === 0 ? (
      <div className="flex flex-col items-center justify-center h-48 text-[#6a6a6a] gap-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <Layers className="w-12 h-12 opacity-20" />
        <p className="text-sm font-medium">No projects yet</p>
      </div>
    ) : (
      <div className="space-y-4">
        {properties.map((p: any) => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="font-bold text-[#222222]">{p.title}</h3>
                <p className="text-xs text-[#6a6a6a] mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {getLocationStr(p.location) || 'Location not set'}
                </p>
              </div>
              <Badge status={p.status ?? 'draft'} />
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                { label: 'Bedrooms', value: p.bedrooms ?? '—' },
                { label: 'Bathrooms', value: p.bathrooms ?? '—' },
                { label: 'Floor Area', value: p.floor_area_sqm ? `${p.floor_area_sqm}m²` : '—' },
              ].map(s => (
                <div key={s.label} className="bg-gray-50 rounded-xl p-3">
                  <p className="text-base font-bold text-[#222222]">{s.value}</p>
                  <p className="text-[10px] text-[#6a6a6a] mt-0.5 font-medium">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ─── REPORTS TAB ─────────────────────────────────────────────────────────────
const ReportsTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader title="Reports" sub="Performance insights for your portfolio" />
    <div className="flex flex-col items-center justify-center h-64 text-[#6a6a6a] gap-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
      <BarChart3 className="w-12 h-12 opacity-20" />
      <p className="text-sm font-medium">Analytics coming soon</p>
      <p className="text-xs opacity-60">Enquiry trends, unit absorption rates, and revenue forecasts.</p>
    </div>
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const DeveloperDashboard: React.FC = () => {
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const user       = useSelector(selectCurrentUser);
  const [logout]   = useLogoutMutation();
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: propertiesData, isLoading: propsLoading } = useGetMyPropertiesQuery({});
  const properties: any[] = propertiesData?.properties ?? [];

  const handleLogout = async () => {
    try { await logout().unwrap(); } catch {}
    dispatch(clearCredentials());
    navigate('/login');
  };

  const renderTab = () => {
    switch (activeTab) {
      case 'overview':  return <OverviewTab properties={properties} loading={propsLoading} setActiveTab={setActiveTab} />;
      case 'projects':  return <ProjectsTab properties={properties} />;
      case 'pipeline':  return <PipelineTab properties={properties} />;
      case 'units':     return <UnitsTab properties={properties} />;
      case 'reports':   return <ReportsTab />;
      default:          return <OverviewTab properties={properties} loading={propsLoading} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex">
      {/* ── Sidebar ── */}
      <>
        {sidebarOpen && (
          <div className="fixed inset-0 bg-black/40 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}
        <aside className={`
          fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-100 flex flex-col
          transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 lg:static lg:z-auto
        `}>
          {/* Logo */}
          <div className="p-6 border-b border-gray-100">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#ff385c] rounded-xl flex items-center justify-center">
                <Home className="w-4 h-4 text-white" />
              </div>
              <span className="text-base font-bold text-[#222222]">GetKeja</span>
            </Link>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-violet-100 flex items-center justify-center text-sm font-bold text-violet-700">
                {user?.firstName?.[0] ?? user?.email?.[0]?.toUpperCase() ?? 'D'}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-[#222222] truncate">{user?.firstName ?? 'Developer'}</p>
                <p className="text-[10px] text-[#6a6a6a] bg-violet-50 text-violet-700 px-1.5 py-0.5 rounded-full font-semibold inline-block mt-0.5">Developer</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {NAV.map(item => {
              const Icon = item.icon;
              const active = activeTab === item.id;
              return (
                <button key={item.id} onClick={() => { setActiveTab(item.id); setSidebarOpen(false); }}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all
                    ${active ? 'bg-[#ff385c] text-white shadow-sm' : 'text-[#6a6a6a] hover:bg-gray-50 hover:text-[#222222]'}`}>
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Add project CTA */}
          <div className="p-4 border-t border-gray-100">
            <Link to="/dashboard/add-property"
              className="flex items-center justify-center gap-2 w-full bg-[#222222] text-white px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-[#ff385c] transition-all">
              <Plus className="w-4 h-4" /> New Project
            </Link>
          </div>

          {/* Logout */}
          <div className="p-4 pt-0">
            <button onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2.5 rounded-xl text-sm font-semibold text-[#6a6a6a] hover:bg-red-50 hover:text-red-600 transition-all">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>
        </aside>
      </>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button className="lg:hidden p-2 rounded-xl border border-gray-200 text-[#6a6a6a]"
              onClick={() => setSidebarOpen(true)}>
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-[#222222] leading-tight">
                {NAV.find(n => n.id === activeTab)?.label ?? 'Dashboard'}
              </h1>
              <p className="text-xs text-[#6a6a6a]">{new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="relative p-2 rounded-xl border border-gray-200 text-[#6a6a6a] hover:text-[#222222] transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[#ff385c] rounded-full" />
            </button>
            <Link to="/dashboard/add-property"
              className="hidden sm:flex items-center gap-2 bg-[#ff385c] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#e00b41] transition-all">
              <Plus className="w-4 h-4" /> New Project
            </Link>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {propsLoading && activeTab === 'overview' ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="w-8 h-8 animate-spin text-[#ff385c]" />
            </div>
          ) : renderTab()}
        </main>
      </div>
    </div>
  );
};

export default DeveloperDashboard;

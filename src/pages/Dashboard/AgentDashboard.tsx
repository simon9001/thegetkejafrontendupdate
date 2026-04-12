// frontend/src/pages/Dashboard/AgentDashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Building2, Calendar, TrendingUp, Users,
  DollarSign, Phone, MapPin, Clock, ChevronRight, PlusCircle,
  ArrowUpRight, ArrowDownRight, Briefcase, MessageSquare,
  BarChart3, Eye, Home, LogOut, Menu, X, Bell, Search,
  CheckCircle2, AlertTriangle, Star, ChevronDown,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { clearCredentials, selectCurrentUser } from '../../features/Slice/AuthSlice';
import { useLogoutMutation } from '../../features/Api/AuthApi';
import { useGetDashboardStatsQuery } from '../../features/Api/DashboardApi';
import { useGetMyPropertiesQuery } from '../../features/Api/PropertiesApi';

// ─── Nav config ───────────────────────────────────────────────────────────────
const NAV = [
  { id: 'overview',    label: 'Overview',    icon: LayoutDashboard },
  { id: 'listings',    label: 'My Listings', icon: Building2 },
  { id: 'viewings',    label: 'Viewings',    icon: Calendar },
  { id: 'leads',       label: 'Leads',       icon: Users },
  { id: 'commissions', label: 'Commissions', icon: DollarSign },
  { id: 'reports',     label: 'Reports',     icon: BarChart3 },
];

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_VIEWINGS = [
  { id: 'V-001', client: 'Amina Hassan',  property: 'Kilimani 2BR Apt',  date: 'Today, 3:00 PM',     status: 'confirmed' },
  { id: 'V-002', client: 'David Mwangi',  property: 'Westlands Studio',  date: 'Tomorrow, 10:00 AM', status: 'pending' },
  { id: 'V-003', client: 'Sarah Otieno',  property: 'Karen Villa',        date: 'Thu, 2:00 PM',       status: 'confirmed' },
  { id: 'V-004', client: 'John Kariuki',  property: 'Lavington 3BR',      date: 'Fri, 11:00 AM',      status: 'pending' },
];

const MOCK_LEADS = [
  { id: 'L-001', name: "Fatuma Ali",       intent: 'Rent', budget: 'KES 30,000', area: 'Kilimani', contacted: '2 hrs ago',  source: 'WhatsApp' },
  { id: 'L-002', name: "Robert Ndung'u",   intent: 'Buy',  budget: 'KES 8M',     area: 'Karen',    contacted: '1 day ago',  source: 'Website' },
  { id: 'L-003', name: 'Lucy Wambui',      intent: 'Rent', budget: 'KES 20,000', area: 'Westlands',contacted: '2 days ago', source: 'Referral' },
];

// ─── Shared primitives ────────────────────────────────────────────────────────

const Badge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    active:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    confirmed: 'bg-blue-50   text-blue-700   border-blue-200',
    pending:   'bg-amber-50  text-amber-700  border-amber-200',
    paid:      'bg-emerald-50 text-emerald-700 border-emerald-200',
    closed:    'bg-gray-50   text-gray-500   border-gray-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${map[status] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
      {status}
    </span>
  );
};

interface StatCardProps {
  label:   string;
  value:   string | number;
  sub?:    string;
  trend?:  number;
  icon:    React.ElementType;
  accent:  string;
  loading?: boolean;
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

const SectionHeader: React.FC<{ title: string; sub?: string; action?: React.ReactNode }> = ({ title, sub, action }) => (
  <div className="flex items-center justify-between mb-5">
    <div>
      <h2 className="text-base font-bold text-[#222222] tracking-tight">{title}</h2>
      {sub && <p className="text-xs text-[#6a6a6a] mt-0.5">{sub}</p>}
    </div>
    {action}
  </div>
);

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
const OverviewTab: React.FC<{
  stats: any; properties: any[]; loading: boolean; setActiveTab: (t: string) => void;
}> = ({ stats, properties, loading, setActiveTab }) => {
  const statCards: StatCardProps[] = [
    { label: 'Active Listings',     value: properties.length,      sub: 'Properties managed',     icon: Building2,  accent: 'bg-blue-50 text-blue-600',    trend: 12 },
    { label: 'Viewings This Week',  value: MOCK_VIEWINGS.length,   sub: '2 confirmed today',      icon: Calendar,   accent: 'bg-violet-50 text-violet-600', trend: 8 },
    { label: 'Commission Pipeline', value: 'KES 145K',             sub: 'Projected this month',   icon: DollarSign, accent: 'bg-emerald-50 text-emerald-600', trend: 22 },
    { label: 'Active Leads',        value: MOCK_LEADS.length,      sub: 'Need follow-up',         icon: Users,      accent: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Hero banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-[#111827] rounded-2xl p-7"
      >
        <div className="relative z-10">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Agent Dashboard</p>
          <h2 className="text-2xl font-bold text-white mb-1">Your Property Pipeline</h2>
          <p className="text-white/60 text-sm max-w-xl">Manage listings, schedule viewings, and close deals — all from one place.</p>
          <div className="flex gap-3 mt-5 flex-wrap">
            <Link
              to="/dashboard/add-property"
              className="inline-flex items-center gap-2 bg-[#ff385c] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#e00b41] transition-all shadow-lg shadow-[#ff385c]/30"
            >
              <PlusCircle className="w-4 h-4" /> Add Listing
            </Link>
            <button
              onClick={() => setActiveTab('viewings')}
              className="inline-flex items-center gap-2 bg-white/10 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-white/20 transition-all"
            >
              <Calendar className="w-4 h-4" /> Schedule Viewing
            </button>
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-[#ff385c]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-6 -bottom-6 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </motion.div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}>
            <StatCard {...c} loading={loading} />
          </motion.div>
        ))}
      </div>

      {/* Two column panel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming viewings */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
          <SectionHeader
            title="Upcoming Viewings"
            action={
              <button onClick={() => setActiveTab('viewings')} className="text-xs text-[#ff385c] font-semibold hover:underline flex items-center gap-1">
                See all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            }
          />
          <div className="space-y-1">
            {MOCK_VIEWINGS.slice(0, 3).map(v => (
              <div key={v.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#111827] flex items-center justify-center shrink-0">
                    <Calendar className="w-3.5 h-3.5 text-[#ff385c]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#222222]">{v.client}</p>
                    <p className="text-[11px] text-[#6a6a6a]">{v.property} · {v.date}</p>
                  </div>
                </div>
                <Badge status={v.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Hot leads */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
          <SectionHeader
            title="Hot Leads"
            action={
              <button onClick={() => setActiveTab('leads')} className="text-xs text-[#ff385c] font-semibold hover:underline flex items-center gap-1">
                See all <ChevronRight className="w-3.5 h-3.5" />
              </button>
            }
          />
          <div className="space-y-1">
            {MOCK_LEADS.map(l => (
              <div key={l.id} className="flex items-center justify-between py-3 border-b border-gray-50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#222222]">{l.name}</p>
                    <p className="text-[11px] text-[#6a6a6a]">{l.intent} · {l.area} · {l.budget}</p>
                  </div>
                </div>
                <span className="text-[11px] text-[#6a6a6a]">{l.contacted}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly snapshot */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
        <SectionHeader title="This Month at a Glance" sub="Performance summary" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Deals Closed',   value: '2',    color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Viewings Done',  value: '14',   color: 'text-blue-600',    bg: 'bg-blue-50' },
            { label: 'New Enquiries',  value: '23',   color: 'text-violet-600',  bg: 'bg-violet-50' },
            { label: 'Avg. Response',  value: '< 2h', color: 'text-amber-600',   bg: 'bg-amber-50' },
          ].map(m => (
            <div key={m.label} className={`${m.bg} rounded-xl p-4 text-center`}>
              <p className={`text-2xl font-bold ${m.color}`}>{m.value}</p>
              <p className="text-xs text-[#6a6a6a] mt-1 font-medium">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── LISTINGS TAB ─────────────────────────────────────────────────────────────
const ListingsTab: React.FC<{ properties: any[] }> = ({ properties }) => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader
      title={`My Active Listings (${properties.length})`}
      action={
        <Link
          to="/dashboard/add-property"
          className="flex items-center gap-2 bg-[#ff385c] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#e00b41] transition-all"
        >
          <PlusCircle className="w-4 h-4" /> New Listing
        </Link>
      }
    />
    {properties.length === 0 ? (
      <div className="flex flex-col items-center justify-center h-48 text-[#6a6a6a] gap-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
        <Building2 className="w-12 h-12 opacity-20" />
        <p className="text-sm font-medium">No listings yet</p>
        <Link to="/dashboard/add-property" className="text-xs text-[#ff385c] font-semibold hover:underline">
          Add your first listing
        </Link>
      </div>
    ) : (
      <div className="grid gap-3">
        {properties.map((p: any) => (
          <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 flex items-center gap-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
            <div className="w-14 h-14 rounded-xl bg-gray-100 overflow-hidden shrink-0">
              {p.images?.[0]?.image_url
                ? <img src={p.images[0].image_url} className="w-full h-full object-cover" alt="" />
                : <Building2 className="w-7 h-7 text-gray-300 mx-auto mt-3.5" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[#222222] truncate">{p.title}</p>
              <p className="text-xs text-[#6a6a6a] flex items-center gap-1 mt-0.5">
                <MapPin className="w-3 h-3" />
                {p.location?.town || p.location?.county || 'Nairobi'}
              </p>
              <p className="text-sm font-bold text-[#ff385c] mt-1">
                KES {(p.price_per_month || p.price || 0).toLocaleString()}/mo
              </p>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <Badge status={p.status ?? 'active'} />
              <div className="flex items-center gap-1 text-[11px] text-[#6a6a6a]">
                <Eye className="w-3 h-3" /> {p.views_count ?? 0} views
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ─── VIEWINGS TAB ─────────────────────────────────────────────────────────────
const ViewingsTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader
      title="Viewing Schedule"
      sub={`${MOCK_VIEWINGS.filter(v => v.status === 'pending').length} pending confirmation`}
      action={
        <button className="flex items-center gap-2 bg-[#ff385c] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#e00b41] transition-all">
          <PlusCircle className="w-4 h-4" /> Schedule Viewing
        </button>
      }
    />
    <div className="grid gap-3">
      {MOCK_VIEWINGS.map(v => (
        <div key={v.id} className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 flex items-center justify-between gap-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-[#111827] rounded-xl flex items-center justify-center shrink-0">
              <Calendar className="w-5 h-5 text-[#ff385c]" />
            </div>
            <div>
              <p className="font-semibold text-[#222222]">{v.client}</p>
              <p className="text-xs text-[#6a6a6a]">{v.property}</p>
              <p className="text-xs font-bold text-[#ff385c] mt-0.5">{v.date}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Badge status={v.status} />
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors border border-gray-200">
              <Phone className="w-3.5 h-3.5 text-[#6a6a6a]" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── LEADS TAB ───────────────────────────────────────────────────────────────
const LeadsTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader title="Client Leads" sub={`${MOCK_LEADS.length} active leads`} />
    <div className="grid gap-3">
      {MOCK_LEADS.map(l => (
        <div key={l.id} className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 flex items-center justify-between gap-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center shrink-0 border border-amber-100">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-[#222222]">{l.name}</p>
              <p className="text-xs text-[#6a6a6a]">{l.intent} · {l.area} · Budget: {l.budget}</p>
              <p className="text-[11px] text-[#6a6a6a] mt-0.5">Via {l.source} · {l.contacted}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors border border-emerald-100">
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors border border-blue-100">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── COMMISSIONS TAB ──────────────────────────────────────────────────────────
const CommissionsTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader title="Commission Tracker" sub="Earnings and pending payouts" />
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[
        { label: 'Earned This Month', value: 'KES 85,000', icon: DollarSign,  accent: 'bg-emerald-50 text-emerald-600' },
        { label: 'Pending Payment',   value: 'KES 60,000', icon: Clock,       accent: 'bg-amber-50 text-amber-600' },
        { label: 'Annual Total',      value: 'KES 720,000',icon: TrendingUp,  accent: 'bg-blue-50 text-blue-600' },
      ].map(c => (
        <div key={c.label} className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.accent}`}>
            <c.icon className="w-5 h-5" />
          </div>
          <p className="text-2xl font-bold text-[#222222] tracking-tight">{c.value}</p>
          <p className="text-xs text-[#6a6a6a] mt-1 font-medium">{c.label}</p>
        </div>
      ))}
    </div>

    <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
      <SectionHeader title="Recent Deals" />
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-[11px] text-[#6a6a6a] font-semibold uppercase border-b border-gray-100">
              <th className="text-left pb-3 pr-4">Property</th>
              <th className="text-left pb-3 pr-4">Client</th>
              <th className="text-right pb-3 pr-4">Commission</th>
              <th className="text-right pb-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {[
              { property: 'Kilimani 2BR', client: 'Amina Hassan',  amount: 'KES 25,000', status: 'paid' },
              { property: 'Karen Villa',  client: 'David Mwangi',   amount: 'KES 60,000', status: 'pending' },
            ].map((d, i) => (
              <tr key={i}>
                <td className="py-3.5 pr-4 font-semibold text-[#222222]">{d.property}</td>
                <td className="py-3.5 pr-4 text-[#6a6a6a]">{d.client}</td>
                <td className="py-3.5 pr-4 text-right font-bold text-[#222222]">{d.amount}</td>
                <td className="py-3.5 text-right"><Badge status={d.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </div>
);

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const AgentDashboard: React.FC = () => {
  const dispatch   = useDispatch();
  const navigate   = useNavigate();
  const user       = useSelector(selectCurrentUser);
  const [activeTab, setActiveTab]     = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logout] = useLogoutMutation();

  useEffect(() => {
    if (user && !user.roles?.includes('agent')) navigate('/');
  }, [user, navigate]);

  const { data: stats,          isLoading: statsLoading } = useGetDashboardStatsQuery(undefined, { skip: !user });
  const { data: propertiesData, isLoading: propsLoading } = useGetMyPropertiesQuery(undefined,   { skip: !user });

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

  // Badge counts for nav
  const navBadges: Record<string, number> = {
    listings: properties.length,
    viewings: MOCK_VIEWINGS.filter(v => v.status === 'pending').length,
    leads:    MOCK_LEADS.length,
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':    return <OverviewTab stats={stats} properties={properties} loading={loading} setActiveTab={setActiveTab} />;
      case 'listings':    return <ListingsTab properties={properties} />;
      case 'viewings':    return <ViewingsTab />;
      case 'leads':       return <LeadsTab />;
      case 'commissions': return <CommissionsTab />;
      case 'reports':
        return (
          <div className="flex flex-col items-center justify-center h-64 text-[#6a6a6a] gap-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200 max-w-7xl">
            <BarChart3 className="w-12 h-12 opacity-20" />
            <p className="text-sm font-medium">Reports coming soon</p>
          </div>
        );
      default: return <OverviewTab stats={stats} properties={properties} loading={loading} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex font-['DM_Sans',sans-serif]">

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-56 bg-[#111827] flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:flex
      `}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#ff385c] flex items-center justify-center shrink-0">
              <Home className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm tracking-tight">GetKeja</span>
              <span className="block text-white/40 text-[10px] font-medium uppercase tracking-widest">Agent</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            const badge  = navBadges[id];
            return (
              <button
                key={id}
                onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}
                `}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#ff385c]' : ''}`} />
                <span className="flex-1 text-left">{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className="text-[10px] font-bold bg-[#ff385c] text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                    {badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-[#ff385c]/20 flex items-center justify-center shrink-0">
              <span className="text-[#ff385c] text-xs font-bold">
                {(user?.full_name ?? user?.email ?? 'A')[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.full_name ?? user?.email}</p>
              <p className="text-white/40 text-[10px] capitalize">Agent</p>
            </div>
            <button onClick={handleLogout} className="text-white/30 hover:text-[#ff385c] transition-colors shrink-0">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main ── */}
      <div className="flex-1 min-w-0 flex flex-col">

        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center gap-4 sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden text-[#6a6a6a] hover:text-[#222222] transition-colors"
          >
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
              <input placeholder="Search…" className="bg-transparent text-xs text-[#222222] placeholder:text-[#6a6a6a] outline-none flex-1 w-full" />
            </div>
            <button className="relative w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-[#6a6a6a] hover:text-[#222222] transition-colors">
              <Bell className="w-4 h-4" />
              {MOCK_VIEWINGS.filter(v => v.status === 'pending').length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#ff385c] rounded-full" />
              )}
            </button>
            <Link
              to="/dashboard/add-property"
              className="hidden sm:flex items-center gap-1.5 bg-[#ff385c] text-white px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-[#e00b41] transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5" /> Add Listing
            </Link>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default AgentDashboard;
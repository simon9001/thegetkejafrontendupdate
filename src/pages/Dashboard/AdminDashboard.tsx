// frontend/src/pages/Admin/AdminDashboard.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard, Users, Building2, CreditCard, ShieldAlert,
  TrendingUp, Calendar, Star, Settings, LogOut,
  ArrowUpRight, ArrowDownRight, ChevronRight, Bell, Search,
  Home, FileText, Megaphone, Menu,
  CheckCircle2, Clock, AlertTriangle, DollarSign,
  Package,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { clearCredentials, selectCurrentUser } from '../../features/Slice/AuthSlice';
import { useLogoutMutation } from '../../features/Api/AuthApi';
import {
  useGetKpiSnapshotQuery,
  useGetRevenueBreakdownQuery,
  useGetUserStatsQuery,
  useGetPropertyStatsQuery,
  useGetBookingStatsQuery,
  useGetModerationVerificationsQuery,
  useGetModerationDisputesQuery,
  useGetFraudReviewQueueQuery,
  useGetSubscriptionStatsQuery,
  useGetReviewStatsQuery,
} from '../../features/Api/AdminApi';

// ─── Sidebar nav items ────────────────────────────────────────────────────────
const NAV = [
  { id: 'overview',       label: 'Overview',       icon: LayoutDashboard },
  { id: 'users',          label: 'Users',          icon: Users },
  { id: 'properties',     label: 'Properties',     icon: Building2 },
  { id: 'bookings',       label: 'Bookings',       icon: Calendar },
  { id: 'revenue',        label: 'Revenue',        icon: TrendingUp },
  { id: 'subscriptions',  label: 'Subscriptions',  icon: Package },
  { id: 'moderation',     label: 'Moderation',     icon: ShieldAlert },
  { id: 'reviews',        label: 'Reviews',        icon: Star },
  { id: 'ads',            label: 'Ads',            icon: Megaphone },
  { id: 'audit',          label: 'Audit Log',      icon: FileText },
  { id: 'fees',           label: 'Fee Config',     icon: Settings },
];

// ─── Stat card ────────────────────────────────────────────────────────────────
interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: number;
  icon: React.ElementType;
  accent: string;
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
        <div className="h-7 w-24 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-3.5 w-32 bg-gray-100 rounded animate-pulse" />
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

// ─── Moderation queue row ─────────────────────────────────────────────────────
interface QueueRowProps {
  label: string;
  count: number;
  urgency: 'high' | 'medium' | 'low';
  onClick?: () => void;
}

const QueueRow: React.FC<QueueRowProps> = ({ label, count, urgency, onClick }) => {
  const colors = {
    high:   'bg-red-50 text-red-700 border-red-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low:    'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors group"
    >
      <span className="text-sm font-medium text-[#222222]">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${colors[urgency]}`}>
          {count}
        </span>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#222222] transition-colors" />
      </div>
    </button>
  );
};

// ─── Section header ───────────────────────────────────────────────────────────
const SectionHeader: React.FC<{ title: string; sub?: string; action?: React.ReactNode }> = ({ title, sub, action }) => (
  <div className="flex items-center justify-between mb-5">
    <div>
      <h2 className="text-base font-bold text-[#222222] tracking-tight">{title}</h2>
      {sub && <p className="text-xs text-[#6a6a6a] mt-0.5">{sub}</p>}
    </div>
    {action}
  </div>
);

// ─── Revenue stream bar ───────────────────────────────────────────────────────
const RevenueBar: React.FC<{ label: string; value: number; total: number; color: string }> = ({ label, value, total, color }) => {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-[#6a6a6a] font-medium">{label}</span>
        <span className="text-[#222222] font-semibold">KES {value.toLocaleString()}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────
const AdminDashboard: React.FC = () => {
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const user       = useSelector(selectCurrentUser);
  const [activeNav, setActiveNav]     = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logout] = useLogoutMutation();

  // ── API queries ──────────────────────────────────────────────────────────
  const isAdmin = !!user && (user.roles?.includes('super_admin') || user.roles?.includes('staff'));
  const { data: kpi,     isLoading: kpiLoading     } = useGetKpiSnapshotQuery(undefined, { skip: !isAdmin });
  const { data: revenue, isLoading: revenueLoading  } = useGetRevenueBreakdownQuery({}, { skip: !isAdmin });
  const { data: userStats                           } = useGetUserStatsQuery(undefined, { skip: !isAdmin });
  const { data: propStats                           } = useGetPropertyStatsQuery(undefined, { skip: !isAdmin });
  const { data: bookingStats                        } = useGetBookingStatsQuery(undefined, { skip: !isAdmin });
  useGetModerationVerificationsQuery({ page: 1, limit: 5 }, { skip: !isAdmin });
  useGetModerationDisputesQuery({ page: 1, limit: 5 }, { skip: !isAdmin });
  useGetFraudReviewQueueQuery({ page: 1, limit: 5 }, { skip: !isAdmin });
  const { data: subStats                            } = useGetSubscriptionStatsQuery(undefined, { skip: !isAdmin });
  const { data: reviewStats                         } = useGetReviewStatsQuery(undefined, { skip: !isAdmin });

  const handleLogout = async () => {
    try {
      const rt = localStorage.getItem('refreshToken');
      if (rt) await logout({ refreshToken: rt }).unwrap();
    } catch {}
    dispatch(clearCredentials());
    navigate('/login');
  };

  const fmt = (n?: number) => (n ?? 0).toLocaleString();
  const fmtKes = (n?: number) => `KES ${((n ?? 0) / 1000).toFixed(1)}k`;

  // ── KPI cards data ───────────────────────────────────────────────────────
  const kpiCards: StatCardProps[] = [
    {
      label: 'Total Users',
      value: fmt(kpi?.users?.total),
      sub: `+${fmt(kpi?.users?.new_30d)} this month`,
      icon: Users,
      accent: 'bg-blue-50 text-blue-600',
      loading: kpiLoading,
    },
    {
      label: 'Active Listings',
      value: fmt(kpi?.properties?.active),
      sub: `${fmt(kpi?.properties?.total)} total properties`,
      icon: Building2,
      accent: 'bg-violet-50 text-violet-600',
      loading: kpiLoading,
    },
    {
      label: 'Revenue (Month)',
      value: fmtKes(kpi?.revenue?.month_kes),
      sub: `All-time: ${fmtKes(kpi?.revenue?.all_time_kes)}`,
      icon: DollarSign,
      accent: 'bg-emerald-50 text-emerald-600',
      loading: kpiLoading,
    },
    {
      label: 'Active Bookings',
      value: fmt(kpi?.short_stay_bookings?.active),
      sub: `${fmt(kpi?.long_term_bookings?.active)} long-term tenancies`,
      icon: Calendar,
      accent: 'bg-amber-50 text-amber-600',
      loading: kpiLoading,
    },
    {
      label: 'Active Subscribers',
      value: fmt(kpi?.subscriptions?.active),
      sub: `${fmt(subStats?.past_due)} past due`,
      icon: CreditCard,
      accent: 'bg-rose-50 text-rose-600',
      loading: kpiLoading,
    },
    {
      label: 'Moderation Queue',
      value: fmt((kpi?.moderation?.pending_id_verifications ?? 0) + (kpi?.moderation?.open_disputes ?? 0) + (kpi?.moderation?.fraud_signals_unresolved ?? 0)),
      sub: `${fmt(kpi?.moderation?.open_disputes)} disputes open`,
      icon: ShieldAlert,
      accent: 'bg-red-50 text-red-600',
      loading: kpiLoading,
    },
  ];

  const revenueTotal = revenue
    ? (revenue.by_stream?.listing_fees_kes ?? 0) +
      (revenue.by_stream?.viewing_fees_kes ?? 0) +
      (revenue.by_stream?.subscriptions_kes ?? 0) +
      (revenue.by_stream?.short_stay_fees_kes ?? 0)
    : 0;

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f7f7f7]">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#222222]">Access Denied</h2>
          <p className="text-sm text-[#6a6a6a] mt-1">You need admin privileges to view this page.</p>
          <button onClick={() => navigate('/')} className="mt-4 px-4 py-2 bg-[#ff385c] text-white rounded-lg text-sm font-medium hover:bg-[#e00b41] transition">Go Home</button>
        </div>
      </div>
    );
  }

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
            <div className="w-7 h-7 rounded-lg bg-[#ff385c] flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm tracking-tight">GetKeja</span>
              <span className="block text-white/40 text-[10px] font-medium uppercase tracking-widest">Admin</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = activeNav === id;
            return (
              <button
                key={id}
                onClick={() => { setActiveNav(id); setSidebarOpen(false); }}
                className={`
                  w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                  ${active
                    ? 'bg-white/10 text-white'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/5'}
                `}
              >
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#ff385c]' : ''}`} />
                {label}
                {id === 'moderation' && (kpi?.moderation?.pending_id_verifications ?? 0) > 0 && (
                  <span className="ml-auto text-[10px] font-bold bg-[#ff385c] text-white px-1.5 py-0.5 rounded-full">
                    {(kpi?.moderation?.pending_id_verifications ?? 0) + (kpi?.moderation?.open_disputes ?? 0)}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
            <div className="w-7 h-7 rounded-lg bg-[#ff385c]/20 flex items-center justify-center shrink-0">
              <span className="text-[#ff385c] text-xs font-bold">
                {(user?.full_name ?? user?.email ?? 'A')[0].toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.full_name ?? user?.email}</p>
              <p className="text-white/40 text-[10px] capitalize">{user?.primaryRole ?? 'admin'}</p>
            </div>
            <button onClick={handleLogout} className="text-white/30 hover:text-[#ff385c] transition-colors">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {/* Backdrop */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Main content ── */}
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
              {NAV.find(n => n.id === activeNav)?.label ?? 'Dashboard'}
            </h1>
            <p className="text-xs text-[#6a6a6a]">
              {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-52">
              <Search className="w-3.5 h-3.5 text-[#6a6a6a]" />
              <input placeholder="Search…" className="bg-transparent text-xs text-[#222222] placeholder:text-[#6a6a6a] outline-none flex-1" />
            </div>
            <button className="relative w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-[#6a6a6a] hover:text-[#222222] transition-colors">
              <Bell className="w-4 h-4" />
              {(kpi?.moderation?.open_disputes ?? 0) > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#ff385c] rounded-full" />
              )}
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">

          {/* ── OVERVIEW TAB ── */}
          {activeNav === 'overview' && (
            <div className="space-y-6 max-w-7xl">

              {/* KPI grid */}
              <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
                {kpiCards.map((card) => (
                  <StatCard key={card.label} {...card} />
                ))}
              </div>

              {/* Middle row: Revenue + Moderation queue */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Revenue breakdown */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <SectionHeader
                    title="Revenue Breakdown"
                    sub="Current month, all streams"
                    action={
                      <button onClick={() => setActiveNav('revenue')} className="text-xs text-[#ff385c] font-semibold hover:underline flex items-center gap-1">
                        View all <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    }
                  />
                  {revenueLoading ? (
                    <div className="space-y-3">
                      {[...Array(4)].map((_, i) => (
                        <div key={i} className="space-y-1.5">
                          <div className="h-3 w-32 bg-gray-100 rounded animate-pulse" />
                          <div className="h-1.5 bg-gray-100 rounded-full animate-pulse" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <RevenueBar label="Listing Fees"     value={revenue?.by_stream?.listing_fees_kes ?? 0}    total={revenueTotal} color="bg-[#ff385c]" />
                      <RevenueBar label="Viewing Fees"     value={revenue?.by_stream?.viewing_fees_kes ?? 0}    total={revenueTotal} color="bg-violet-500" />
                      <RevenueBar label="Subscriptions"    value={revenue?.by_stream?.subscriptions_kes ?? 0}   total={revenueTotal} color="bg-emerald-500" />
                      <RevenueBar label="Short-Stay Fees"  value={revenue?.by_stream?.short_stay_fees_kes ?? 0} total={revenueTotal} color="bg-amber-500" />
                      <div className="pt-2 border-t border-gray-100 flex justify-between text-sm">
                        <span className="text-[#6a6a6a] font-medium">Total this period</span>
                        <span className="text-[#222222] font-bold">KES {revenueTotal.toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Moderation queues */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <SectionHeader
                    title="Moderation Queue"
                    sub="Items requiring admin action"
                    action={
                      <button onClick={() => setActiveNav('moderation')} className="text-xs text-[#ff385c] font-semibold hover:underline flex items-center gap-1">
                        View all <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    }
                  />
                  <div className="space-y-1">
                    <QueueRow label="Pending ID Verifications" count={kpi?.moderation?.pending_id_verifications ?? 0}  urgency="high"   onClick={() => setActiveNav('moderation')} />
                    <QueueRow label="Open Disputes"            count={kpi?.moderation?.open_disputes ?? 0}             urgency="high"   onClick={() => setActiveNav('moderation')} />
                    <QueueRow label="Fraud Review Queue"       count={kpi?.moderation?.fraud_signals_unresolved ?? 0}  urgency="medium" onClick={() => setActiveNav('moderation')} />
                    <QueueRow label="Pending Visits"           count={kpi?.visits?.pending_confirmation ?? 0}          urgency="low"    onClick={() => setActiveNav('bookings')} />
                  </div>
                </div>
              </div>

              {/* Bottom row: Users, Properties, Bookings snapshot */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Users by role */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <SectionHeader title="Users by Role" action={
                    <button onClick={() => setActiveNav('users')} className="text-xs text-[#ff385c] font-semibold hover:underline">View →</button>
                  } />
                  <div className="space-y-2.5">
                    {Object.entries(userStats?.by_role ?? {}).map(([role, count]) => (
                      <div key={role} className="flex items-center justify-between text-sm">
                        <span className="text-[#6a6a6a] capitalize font-medium">{role.replace('_', ' ')}</span>
                        <span className="font-bold text-[#222222]">{fmt(count as number)}</span>
                      </div>
                    ))}
                    {!userStats && <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />)}</div>}
                  </div>
                </div>

                {/* Properties by category */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <SectionHeader title="Properties" action={
                    <button onClick={() => setActiveNav('properties')} className="text-xs text-[#ff385c] font-semibold hover:underline">View →</button>
                  } />
                  <div className="space-y-2.5">
                    {Object.entries(propStats?.by_category ?? {}).map(([cat, count]) => (
                      <div key={cat} className="flex items-center justify-between text-sm">
                        <span className="text-[#6a6a6a] capitalize font-medium">{cat.replace(/_/g, ' ')}</span>
                        <span className="font-bold text-[#222222]">{fmt(count as number)}</span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-100 flex justify-between text-sm">
                      <span className="text-[#6a6a6a] font-medium">Avg search score</span>
                      <span className="font-bold text-[#222222]">{propStats?.avg_search_score ?? '—'}</span>
                    </div>
                    {!propStats && <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />)}</div>}
                  </div>
                </div>

                {/* Bookings snapshot */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <SectionHeader title="Bookings" action={
                    <button onClick={() => setActiveNav('bookings')} className="text-xs text-[#ff385c] font-semibold hover:underline">View →</button>
                  } />
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6a6a6a] font-medium">Short-stay active</span>
                      <span className="font-bold text-[#222222]">{fmt(bookingStats?.short_stay?.active)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6a6a6a] font-medium">Escrow held</span>
                      <span className="font-bold text-emerald-600">KES {fmt(bookingStats?.short_stay?.escrow_held_kes)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6a6a6a] font-medium">Disputes</span>
                      <span className="font-bold text-red-500">{fmt(bookingStats?.short_stay?.disputed)}</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100 flex justify-between text-sm">
                      <span className="text-[#6a6a6a] font-medium">Long-term active</span>
                      <span className="font-bold text-[#222222]">{fmt(bookingStats?.long_term?.active)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#6a6a6a] font-medium">Visits pending</span>
                      <span className="font-bold text-amber-600">{fmt(bookingStats?.visits?.pending_confirmation)}</span>
                    </div>
                    {!bookingStats && <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />)}</div>}
                  </div>
                </div>
              </div>

              {/* Reviews + Subscriptions */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* Review stats */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <SectionHeader title="Reviews" action={
                    <button onClick={() => setActiveNav('reviews')} className="text-xs text-[#ff385c] font-semibold hover:underline">View →</button>
                  } />
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    {[
                      { label: 'Published',   value: reviewStats?.published,       color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
                      { label: 'Held',        value: reviewStats?.held_moderation, color: 'text-amber-600',   bg: 'bg-amber-50',   icon: Clock },
                      { label: 'Rejected',    value: reviewStats?.rejected,        color: 'text-red-600',     bg: 'bg-red-50',     icon: AlertTriangle },
                    ].map(({ label, value, color, bg, icon: Ic }) => (
                      <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                        <Ic className={`w-4 h-4 ${color} mx-auto mb-1`} />
                        <p className={`text-lg font-bold ${color}`}>{fmt(value)}</p>
                        <p className="text-[10px] text-[#6a6a6a] font-medium">{label}</p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
                    <span className="text-[#6a6a6a] font-medium">Avg rating</span>
                    <span className="font-bold text-[#222222] flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                      {reviewStats?.avg_rating ?? '—'}
                    </span>
                  </div>
                </div>

                {/* Subscription stats */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
                  <SectionHeader title="Subscriptions" action={
                    <button onClick={() => setActiveNav('subscriptions')} className="text-xs text-[#ff385c] font-semibold hover:underline">View →</button>
                  } />
                  <div className="space-y-2.5">
                    {Object.entries(subStats?.subscribers_by_plan ?? {}).map(([plan, count]) => (
                      <div key={plan} className="flex items-center justify-between text-sm">
                        <span className="text-[#6a6a6a] font-medium">{plan}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-[#ff385c] rounded-full"
                              style={{ width: `${subStats ? ((count as number) / subStats.total) * 100 : 0}%` }}
                            />
                          </div>
                          <span className="font-bold text-[#222222] w-8 text-right">{fmt(count as number)}</span>
                        </div>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-gray-100 flex justify-between text-sm">
                      <span className="text-[#6a6a6a] font-medium">Past due</span>
                      <span className="font-bold text-red-500">{fmt(subStats?.past_due)}</span>
                    </div>
                    {!subStats && <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />)}</div>}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── OTHER TABS (placeholder) ── */}
          {activeNav !== 'overview' && (
            <div className="max-w-7xl">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-12 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  {React.createElement(NAV.find(n => n.id === activeNav)?.icon ?? LayoutDashboard, { className: 'w-7 h-7 text-[#6a6a6a]' })}
                </div>
                <h3 className="text-base font-bold text-[#222222] mb-2">
                  {NAV.find(n => n.id === activeNav)?.label} Module
                </h3>
                <p className="text-sm text-[#6a6a6a] max-w-xs mx-auto">
                  This section connects to{' '}
                  <code className="text-xs bg-gray-100 px-1.5 py-0.5 rounded font-mono">
                    GET /api/admin/{activeNav}
                  </code>{' '}
                  — build it as a separate page component.
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
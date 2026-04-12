// frontend/src/pages/Dashboard/CaretakerDashboard.tsx
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard, Building2, Wrench, ClipboardList, Bell,
  CheckCircle2, AlertTriangle, Phone, ChevronRight,
  Home, Key, Droplets, Zap, Shield, PlusCircle,
  LogOut, Menu, Search, ArrowUpRight,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { clearCredentials, selectCurrentUser } from '../../features/Slice/AuthSlice';
import { useLogoutMutation } from '../../features/Api/AuthApi';
import { useGetDashboardStatsQuery } from '../../features/Api/DashboardApi';

// ─── Nav ─────────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'overview',   label: 'Overview',      icon: LayoutDashboard },
  { id: 'tickets',    label: 'Maintenance',   icon: Wrench },
  { id: 'units',      label: 'Units',         icon: Building2 },
  { id: 'utilities',  label: 'Utilities',     icon: Droplets },
  { id: 'security',   label: 'Security Log',  icon: Shield },
];

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_TICKETS = [
  { id: 'T-001', unit: 'Unit A-102', category: 'Plumbing',     desc: 'Leaking pipe under sink',     priority: 'urgent', status: 'pending',     reported: '2 hrs ago' },
  { id: 'T-002', unit: 'Unit B-204', category: 'Electrical',   desc: 'Power socket not working',    priority: 'normal', status: 'in_progress', reported: '1 day ago' },
  { id: 'T-003', unit: 'Unit C-305', category: 'Cleaning',     desc: 'Common area cleaning',        priority: 'low',    status: 'done',        reported: '3 days ago' },
  { id: 'T-004', unit: 'Unit D-101', category: 'Security',     desc: 'Door lock replacement',       priority: 'urgent', status: 'pending',     reported: '5 hrs ago' },
  { id: 'T-005', unit: 'Unit E-202', category: 'Maintenance',  desc: 'Window seal broken',          priority: 'normal', status: 'pending',     reported: '2 days ago' },
];

const MOCK_UNITS = [
  { number: 'A-101', type: '2 Bedroom', floor: 1, tenant: 'James Ochieng', phone: '0712 345 678', status: 'occupied', rent: 25000 },
  { number: 'A-102', type: '1 Bedroom', floor: 1, tenant: 'Mary Wanjiku',  phone: '0723 456 789', status: 'occupied', rent: 18000 },
  { number: 'B-201', type: 'Bedsitter', floor: 2, tenant: null,            phone: null,            status: 'vacant',   rent: 12000 },
  { number: 'B-204', type: '2 Bedroom', floor: 2, tenant: 'Peter Kamau',   phone: '0734 567 890', status: 'occupied', rent: 25000 },
  { number: 'C-305', type: 'Studio',    floor: 3, tenant: 'Grace Achieng', phone: '0745 678 901', status: 'occupied', rent: 15000 },
];

// ─── Shared primitives ────────────────────────────────────────────────────────
const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    pending:     'bg-amber-50  text-amber-700  border-amber-200',
    in_progress: 'bg-blue-50   text-blue-700   border-blue-200',
    done:        'bg-emerald-50 text-emerald-700 border-emerald-200',
    urgent:      'bg-red-50    text-red-700    border-red-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${map[status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
      {status.replace('_', ' ')}
    </span>
  );
};

interface StatCardProps {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; accent: string; loading?: boolean;
}
const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon: Icon, accent, loading }) => (
  <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
    <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${accent}`}>
      <Icon className="w-5 h-5" />
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
const OverviewTab: React.FC<{ stats: any; loading: boolean; setActiveTab: (t: string) => void }> = ({ stats, loading, setActiveTab }) => {
  const urgentTickets = MOCK_TICKETS.filter(t => t.priority === 'urgent' && t.status !== 'done');

  const statCards: StatCardProps[] = [
    { label: 'Managed Units',      value: stats?.managedUnits ?? MOCK_UNITS.length,                          sub: 'Across all buildings', icon: Building2,   accent: 'bg-blue-50 text-blue-600' },
    { label: 'Open Tickets',       value: stats?.openTickets ?? MOCK_TICKETS.filter(t => t.status !== 'done').length, sub: 'Require attention', icon: AlertTriangle, accent: 'bg-red-50 text-red-600' },
    { label: 'Completed Jobs',     value: stats?.completedJobs ?? MOCK_TICKETS.filter(t => t.status === 'done').length, sub: 'This month',        icon: CheckCircle2,  accent: 'bg-emerald-50 text-emerald-600' },
    { label: 'Pending Responses',  value: 3,                                                                  sub: 'Tenant enquiries',     icon: Bell,          accent: 'bg-amber-50 text-amber-600' },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-[#111827] rounded-2xl p-7">
        <div className="relative z-10">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Building Operations</p>
          <h2 className="text-2xl font-bold text-white mb-1">Caretaker Dashboard</h2>
          <p className="text-white/60 text-sm max-w-xl">Track maintenance tickets, manage units, and keep tenants happy — all in one place.</p>
          <button onClick={() => setActiveTab('tickets')}
            className="mt-5 inline-flex items-center gap-2 bg-[#ff385c] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#e00b41] transition-all shadow-lg shadow-[#ff385c]/30">
            <ClipboardList className="w-4 h-4" /> View All Tickets
          </button>
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

      {/* Urgent tickets */}
      {urgentTickets.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
          <SectionHeader
            title="Urgent — Needs Immediate Attention"
            sub={`${urgentTickets.length} ticket${urgentTickets.length > 1 ? 's' : ''} require action`}
          />
          <div className="space-y-3">
            {urgentTickets.map(t => (
              <div key={t.id} className="flex items-center justify-between p-4 bg-red-50 border border-red-100 rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                    <Wrench className="w-4 h-4 text-red-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-[#222222]">{t.unit} — {t.category}</p>
                    <p className="text-xs text-[#6a6a6a]">{t.desc} · {t.reported}</p>
                  </div>
                </div>
                <button className="text-xs font-bold text-red-600 hover:underline flex items-center gap-1">
                  Resolve <ChevronRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
        <SectionHeader title="Quick Actions" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Log Ticket',       icon: PlusCircle, accent: 'bg-[#111827] text-[#ff385c]', action: 'tickets' },
            { label: 'View Units',       icon: Home,       accent: 'bg-blue-50 text-blue-600',    action: 'units' },
            { label: 'Utility Readings', icon: Droplets,   accent: 'bg-cyan-50 text-cyan-600',    action: 'utilities' },
            { label: 'Security Log',     icon: Shield,     accent: 'bg-violet-50 text-violet-600',action: 'security' },
          ].map(q => (
            <button key={q.label} onClick={() => setActiveTab(q.action)}
              className="flex flex-col items-center gap-2.5 p-4 bg-gray-50 border border-gray-100 rounded-xl hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all text-center">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${q.accent}`}>
                <q.icon className="w-5 h-5" />
              </div>
              <span className="text-xs font-semibold text-[#222222]">{q.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── TICKETS TAB ──────────────────────────────────────────────────────────────
const TicketsTab: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'in_progress' | 'done'>('all');
  const filtered = filter === 'all' ? MOCK_TICKETS : MOCK_TICKETS.filter(t => t.status === filter);

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader
        title="Maintenance Tickets"
        sub={`${MOCK_TICKETS.filter(t => t.status === 'pending').length} pending`}
        action={
          <button className="flex items-center gap-2 bg-[#ff385c] text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-[#e00b41] transition-all">
            <PlusCircle className="w-4 h-4" /> New Ticket
          </button>
        }
      />
      {/* Filter pills */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'in_progress', 'done'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all capitalize ${
              filter === f
                ? 'bg-[#111827] text-white border-[#111827]'
                : 'bg-white text-[#6a6a6a] border-gray-200 hover:border-gray-400'
            }`}>
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {filtered.map(ticket => (
          <motion.div key={ticket.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${ticket.priority === 'urgent' ? 'bg-red-50' : 'bg-gray-50'}`}>
                  <Wrench className={`w-4 h-4 ${ticket.priority === 'urgent' ? 'text-red-500' : 'text-[#6a6a6a]'}`} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm text-[#222222]">{ticket.id}</span>
                    <span className="text-[11px] text-[#6a6a6a]">· {ticket.unit}</span>
                  </div>
                  <p className="text-sm text-[#222222]">{ticket.desc}</p>
                  <p className="text-[11px] text-[#6a6a6a] mt-1">{ticket.category} · Reported {ticket.reported}</p>
                </div>
              </div>
              <StatusBadge status={ticket.status} />
            </div>
            {ticket.status !== 'done' && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                <button className="text-xs font-bold text-blue-600 px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all border border-blue-100">
                  Mark In Progress
                </button>
                <button className="text-xs font-bold text-emerald-600 px-3 py-1.5 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-all border border-emerald-100">
                  Mark Done
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// ─── UNITS TAB ────────────────────────────────────────────────────────────────
const UnitsTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader
      title="Units Under Management"
      sub={`${MOCK_UNITS.filter(u => u.status === 'occupied').length} occupied · ${MOCK_UNITS.filter(u => u.status === 'vacant').length} vacant`}
    />
    <div className="grid gap-3">
      {MOCK_UNITS.map(unit => (
        <div key={unit.number} className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 flex items-center justify-between gap-4 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${unit.status === 'occupied' ? 'bg-emerald-50' : 'bg-gray-50'}`}>
              <Key className={`w-5 h-5 ${unit.status === 'occupied' ? 'text-emerald-600' : 'text-gray-400'}`} />
            </div>
            <div>
              <p className="font-bold text-[#222222]">Unit {unit.number}</p>
              <p className="text-xs text-[#6a6a6a]">{unit.type} · Floor {unit.floor}</p>
              <p className="text-xs font-bold text-[#ff385c] mt-0.5">KES {unit.rent.toLocaleString()}/mo</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            {unit.tenant ? (
              <>
                <p className="text-sm font-semibold text-[#222222]">{unit.tenant}</p>
                <a href={`tel:${unit.phone}`} className="text-xs text-[#ff385c] flex items-center gap-1 justify-end hover:underline mt-0.5">
                  <Phone className="w-3 h-3" /> {unit.phone}
                </a>
              </>
            ) : (
              <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-100">Vacant</span>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
);

// ─── UTILITIES TAB ────────────────────────────────────────────────────────────
const UtilitiesTab: React.FC = () => (
  <div className="space-y-5 max-w-7xl">
    <SectionHeader title="Utility Readings" sub="Log and track water & electricity consumption" />
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[
        { icon: Droplets, label: 'Water Meter',  current: '1,240 units', last: '1,180 units', usage: '60 units',  accent: 'bg-cyan-50 text-cyan-600' },
        { icon: Zap,      label: 'Electricity',  current: '8,420 kWh',   last: '8,100 kWh',   usage: '320 kWh',   accent: 'bg-amber-50 text-amber-600' },
      ].map(u => (
        <div key={u.label} className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${u.accent}`}>
              <u.icon className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-[#222222]">{u.label}</h4>
          </div>
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[['Current', u.current], ['Previous', u.last], ['Usage', u.usage]].map(([l, v]) => (
              <div key={l} className="bg-gray-50 rounded-xl p-3 text-center border border-gray-100">
                <p className="text-[10px] text-[#6a6a6a] uppercase font-semibold tracking-wider">{l}</p>
                <p className="text-sm font-bold text-[#222222] mt-1">{v}</p>
              </div>
            ))}
          </div>
          <button className="w-full text-xs font-bold text-[#ff385c] py-2.5 border border-[#ff385c]/20 rounded-xl hover:bg-[#ff385c]/5 transition-all">
            Log New Reading
          </button>
        </div>
      ))}
    </div>
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
      <p className="text-sm text-amber-800 font-medium">Utility readings for October have not been submitted. Please log readings before the 5th of each month.</p>
    </div>
  </div>
);

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const CaretakerDashboard: React.FC = () => {
  const dispatch      = useDispatch();
  const navigate      = useNavigate();
  const user          = useSelector(selectCurrentUser);
  const [activeTab, setActiveTab]     = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logout] = useLogoutMutation();

  useEffect(() => {
    if (user && !user.roles?.includes('caretaker')) navigate('/');
  }, [user, navigate]);

  const { data: stats, isLoading } = useGetDashboardStatsQuery(undefined, { skip: !user });

  const handleLogout = async () => {
    try {
      const rt = localStorage.getItem('refreshToken');
      if (rt) await logout({ refreshToken: rt }).unwrap();
    } catch {}
    dispatch(clearCredentials());
    navigate('/login');
  };

  const navBadges: Record<string, number> = {
    tickets: MOCK_TICKETS.filter(t => t.status === 'pending').length,
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':  return <OverviewTab stats={stats} loading={isLoading} setActiveTab={setActiveTab} />;
      case 'tickets':   return <TicketsTab />;
      case 'units':     return <UnitsTab />;
      case 'utilities': return <UtilitiesTab />;
      case 'security':
        return (
          <div className="flex flex-col items-center justify-center h-64 text-[#6a6a6a] gap-3 bg-gray-50 rounded-2xl border border-dashed border-gray-200 max-w-7xl">
            <Shield className="w-12 h-12 opacity-20" />
            <p className="text-sm font-medium">Security log coming soon</p>
          </div>
        );
      default: return <OverviewTab stats={stats} loading={isLoading} setActiveTab={setActiveTab} />;
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
              <span className="block text-white/40 text-[10px] font-medium uppercase tracking-widest">Caretaker</span>
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
              <span className="text-[#ff385c] text-xs font-bold">{(user?.full_name ?? user?.email ?? 'C')[0].toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.full_name ?? user?.email}</p>
              <p className="text-white/40 text-[10px]">Caretaker</p>
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
              {MOCK_TICKETS.filter(t => t.priority === 'urgent' && t.status !== 'done').length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#ff385c] rounded-full" />
              )}
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

export default CaretakerDashboard;
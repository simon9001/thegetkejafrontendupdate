import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import {
  LayoutDashboard, Building2, Wrench, Droplets, Shield,
  Users, ArrowUpRight, AlertTriangle, CheckCircle2, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { selectCurrentUser } from '../../features/Slice/AuthSlice';
import { useGetCaretakerDashboardQuery } from '../../features/Api/CaretakerApi';
import { DashboardShell } from '../../components/dashboard/shared';
import type { NavItem } from '../../components/dashboard/shared';

import CaretakerTicketsTab   from '../../components/dashboard/caretaker/CaretakerTicketsTab';
import CaretakerUnitsTab     from '../../components/dashboard/caretaker/CaretakerUnitsTab';
import CaretakerUtilitiesTab from '../../components/dashboard/caretaker/CaretakerUtilitiesTab';
import CaretakerSecurityTab  from '../../components/dashboard/caretaker/CaretakerSecurityTab';

const NAV: NavItem[] = [
  { id: 'overview',  label: 'Overview',     icon: LayoutDashboard },
  { id: 'tickets',   label: 'Maintenance',  icon: Wrench },
  { id: 'units',     label: 'Units',        icon: Building2 },
  { id: 'utilities', label: 'Utilities',    icon: Droplets },
  { id: 'security',  label: 'Security Log', icon: Shield },
];

const CaretakerDashboard: React.FC = () => {
  const user = useSelector(selectCurrentUser);
  const [activeNav, setActiveNav] = useState('overview');

  const isCaretaker = !!user?.roles.includes('caretaker');
  const { data: kpi, isLoading } = useGetCaretakerDashboardQuery(undefined, { skip: !isCaretaker });

  if (!user) return <div className="p-20 text-center">Please login to access your dashboard.</div>;

  if (!isCaretaker) {
    return (
      <div className="p-20 text-center">
        <h2 className="text-xl font-bold text-red-600">Access Denied</h2>
        <p className="text-gray-600 mt-2">You do not have the required caretaker permissions.</p>
      </div>
    );
  }

  const statCards = [
    {
      label: 'Managed Units',
      value: kpi?.total_units ?? 0,
      icon: Building2,
      color: 'bg-[#DD6E42]/10 text-[#DD6E42]',
      border: 'border-[#DD6E42]/20',
    },
    {
      label: 'Open Maintenance',
      value: kpi?.open_maintenance ?? 0,
      icon: Wrench,
      color: kpi?.open_maintenance ? 'bg-amber-50 text-amber-600' : 'bg-gray-50 text-gray-400',
      border: kpi?.open_maintenance ? 'border-amber-200' : 'border-gray-100',
    },
    {
      label: 'Pending Complaints',
      value: kpi?.pending_complaints ?? 0,
      icon: AlertTriangle,
      color: kpi?.pending_complaints ? 'bg-red-50 text-red-500' : 'bg-gray-50 text-gray-400',
      border: kpi?.pending_complaints ? 'border-red-200' : 'border-gray-100',
    },
    {
      label: 'Upcoming Move-ins',
      value: kpi?.upcoming_move_ins ?? 0,
      icon: ArrowUpRight,
      color: 'bg-[#50757A]/5 text-[#50757A]',
      border: 'border-[#50757A]/10',
    },
    {
      label: 'Move-outs This Week',
      value: kpi?.upcoming_move_outs ?? 0,
      icon: Clock,
      color: 'bg-purple-50 text-purple-600',
      border: 'border-purple-100',
    },
    {
      label: 'Overdue Rent',
      value: kpi?.overdue_rent ?? 0,
      icon: AlertTriangle,
      color: kpi?.overdue_rent ? 'bg-red-50 text-red-600' : 'bg-gray-50 text-gray-400',
      border: kpi?.overdue_rent ? 'border-red-200' : 'border-gray-100',
    },
  ];

  return (
    <DashboardShell
      navItems={NAV}
      activeNav={activeNav}
      onNavChange={setActiveNav}
      roleLabel="Caretaker"
    >
      {activeNav === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-500">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-[#50757A]">
                Welcome, {user.full_name ?? 'Caretaker'}
              </h1>
              <p className="text-[#50757A] mt-1 text-sm">
                Property operations overview — {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            {kpi?.unread_notifications ? (
              <div className="flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold text-amber-700">
                  {kpi.unread_notifications} unread notification{kpi.unread_notifications !== 1 ? 's' : ''}
                </span>
              </div>
            ) : null}
          </div>

          {/* KPI Grid */}
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {statCards.map((card, idx) => (
                <motion.div
                  key={card.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.07 }}
                  className={`bg-white p-5 rounded-2xl border ${card.border} shadow-sm`}
                >
                  <div className={`inline-flex p-2.5 rounded-xl mb-3 ${card.color}`}>
                    <card.icon className="w-5 h-5" />
                  </div>
                  <p className="text-[#50757A] text-xs font-semibold uppercase tracking-wider">{card.label}</p>
                  <h3 className="text-3xl font-black text-[#50757A] mt-1">{card.value}</h3>
                </motion.div>
              ))}
            </div>
          )}

          {/* Quick actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: 'Log Maintenance Issue', icon: Wrench,       tab: 'tickets',   bg: 'bg-[#50757A]',      text: 'text-white' },
              { label: 'Record Utility Reading', icon: Droplets,    tab: 'utilities', bg: 'bg-[#DD6E42]',      text: 'text-[#50757A]' },
              { label: 'Log Visitor',            icon: Users,       tab: 'security',  bg: 'bg-white border border-[#50757A]', text: 'text-[#50757A]' },
            ].map(action => (
              <button
                key={action.label}
                onClick={() => setActiveNav(action.tab)}
                className={`flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all hover:opacity-90 ${action.bg} ${action.text}`}
              >
                <action.icon className="w-4 h-4" />
                {action.label}
              </button>
            ))}
          </div>

          {/* Status summary strip */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-[#50757A] to-[#3D5A5E] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-[#DD6E42] shrink-0" />
              <div>
                <p className="text-white font-bold text-sm">Operations Status</p>
                <p className="text-[#C0D6DF] text-xs mt-0.5">
                  {(kpi?.open_maintenance ?? 0) === 0 && (kpi?.pending_complaints ?? 0) === 0
                    ? 'All clear — no pending issues.'
                    : `${kpi?.open_maintenance ?? 0} maintenance + ${kpi?.pending_complaints ?? 0} complaint(s) need attention.`}
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveNav('tickets')}
              className="shrink-0 px-4 py-2 bg-[#DD6E42] text-[#50757A] rounded-xl text-xs font-bold hover:bg-[#C4623B] transition-colors"
            >
              View Tickets
            </button>
          </div>
        </div>
      )}
      {activeNav === 'tickets'   && <CaretakerTicketsTab />}
      {activeNav === 'units'     && <CaretakerUnitsTab />}
      {activeNav === 'utilities' && <CaretakerUtilitiesTab />}
      {activeNav === 'security'  && <CaretakerSecurityTab />}
    </DashboardShell>
  );
};

export default CaretakerDashboard;

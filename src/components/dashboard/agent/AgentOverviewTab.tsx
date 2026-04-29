import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Users, Calendar, MessageSquare,
  TrendingUp, Zap, Plus, ArrowUpRight
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Props {
  stats?: {
    ownedProperties: number;
    activeBookings:  number;
    leadsCount:      number;
    unreadMessages:  number;
    activeBoosts:    number;
    activeCaretakers: number;
  };
  userName: string;
}

const AgentOverviewTab: React.FC<Props> = ({ stats, userName }) => {
  const kpis = [
    {
      label: 'My Listings',
      value: stats?.ownedProperties ?? 0,
      icon: Building2,
      color: 'bg-[#50757A]/10 text-[#50757A]',
    },
    {
      label: 'Pending Viewings',
      value: stats?.activeBookings ?? 0,
      icon: Calendar,
      color: 'bg-[#DD6E42]/10 text-[#DD6E42]',
    },
    {
      label: 'Total Leads',
      value: stats?.leadsCount ?? 0,
      icon: Users,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Active Boosts',
      value: stats?.activeBoosts ?? 0,
      icon: Zap,
      color: 'bg-indigo-50 text-indigo-600',
    },
  ];

  const alerts = [
    {
      label: 'Pending Viewing Requests',
      count: stats?.activeBookings ?? 0,
      icon: Calendar,
    },
    {
      label: 'New Lead Inquiries',
      count: stats?.leadsCount ?? 0,
      icon: Users,
    },
    {
      label: 'Unread Messages',
      count: stats?.unreadMessages ?? 0,
      icon: MessageSquare,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#50757A]">Agent Workspace — {userName}</h1>
          <p className="text-[#50757A] mt-1 text-sm">Monitor your listings and streamline your performance.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/dashboard/add-property"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#DD6E42] text-[#50757A] rounded-xl text-sm font-bold hover:bg-[#C4623B] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Listing
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all"
          >
            <div className={`inline-flex p-3 rounded-xl mb-4 ${kpi.color}`}>
              <kpi.icon className="w-6 h-6" />
            </div>
            <p className="text-[#50757A] text-sm font-medium">{kpi.label}</p>
            <h3 className="text-2xl font-bold text-[#50757A] mt-1">{kpi.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alerts */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-base font-bold text-[#50757A] px-1">Active Tasks</h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.label}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-[#DD6E42]/40 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-lg ${
                    alert.count > 0 ? 'bg-[#DD6E42]/10 text-[#DD6E42]' : 'bg-gray-50 text-gray-400'
                  }`}>
                    <alert.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#50757A]">{alert.label}</p>
                    <p className="text-xs text-[#50757A]">{alert.count} pending</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                  alert.count > 0 ? 'bg-[#50757A] text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {alert.count}
                </div>
              </div>
            ))}
          </div>

          <div className="p-5 bg-gradient-to-br from-[#50757A] to-[#3D5A5E] rounded-2xl text-white shadow-lg relative overflow-hidden">
            <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 rotate-12" />
            <h3 className="font-bold mb-2">Commission Accelerator</h3>
            <p className="text-sm opacity-80 mb-4 leading-relaxed">
              Close more deals this month to unlock your Platinum bonus tier.
            </p>
            <button className="w-full py-2 bg-[#DD6E42] text-[#50757A] rounded-xl text-xs font-bold hover:bg-[#C4623B] transition-colors">
              View Targets
            </button>
          </div>
        </div>

        {/* Summary panel */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
            <h2 className="text-base font-bold text-[#50757A] mb-6">Listing Summary</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Total Listings', value: stats?.ownedProperties ?? 0, icon: Building2 },
                { label: 'Pending Viewings', value: stats?.activeBookings ?? 0, icon: Calendar },
                { label: 'Total Leads', value: stats?.leadsCount ?? 0, icon: ArrowUpRight },
                { label: 'Unread Messages', value: stats?.unreadMessages ?? 0, icon: MessageSquare },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-xl bg-[#EAEAEA] border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="w-4 h-4 text-[#DD6E42]" />
                    <p className="text-xs text-[#50757A] font-semibold uppercase tracking-wider">{item.label}</p>
                  </div>
                  <p className="text-2xl font-black text-[#50757A]">{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentOverviewTab;

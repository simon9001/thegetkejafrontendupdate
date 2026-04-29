import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Users, DollarSign, Calendar, MessageSquare,
  TrendingUp, Zap, ArrowUpRight, Plus
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { LandlordKpi } from '../../../features/Api/DashboardApi';

interface Props {
  stats?: LandlordKpi;
  userName: string;
}

const LandlordOverviewTab: React.FC<Props> = ({ stats, userName }) => {
  const kpis = [
    {
      label: 'Total Earnings',
      value: `KES ${(stats?.earnings?.total_kes ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-[#DD6E42]/10 text-[#DD6E42]',
    },
    {
      label: 'Your Properties',
      value: stats?.properties?.total ?? 0,
      icon: Building2,
      color: 'bg-[#50757A]/10 text-[#50757A]',
    },
    {
      label: 'Active Tenancies',
      value: stats?.tenancies?.active ?? 0,
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Active Boosts',
      value: stats?.boosts?.active ?? 0,
      icon: Zap,
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  const alerts = [
    {
      label: 'Pending Applications',
      count: stats?.tenancies?.pending_applications ?? 0,
      tab: 'tenants',
      icon: Users,
    },
    {
      label: 'Visit Requests',
      count: stats?.visits?.pending ?? 0,
      tab: 'bookings',
      icon: Calendar,
    },
    {
      label: 'Unread Messages',
      count: stats?.messages?.unread ?? 0,
      tab: 'messages',
      icon: MessageSquare,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#50757A]">Welcome back, {userName}</h1>
          <p className="text-[#50757A] mt-1 text-sm">Here's what's happening with your portfolio today.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/dashboard/add-property"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#DD6E42] text-[#50757A] rounded-xl text-sm font-bold hover:bg-[#C4623B] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Property
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
          <h2 className="text-base font-bold text-[#50757A] px-1">Action Required</h2>
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
                    <p className="text-xs text-[#50757A]">{alert.count} item{alert.count !== 1 ? 's' : ''} pending</p>
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

          {/* Upsell card */}
          <div className="p-5 bg-gradient-to-br from-[#50757A] to-[#3D5A5E] rounded-2xl text-white shadow-lg relative overflow-hidden">
            <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 rotate-12" />
            <h3 className="font-bold mb-2">Grow your portfolio</h3>
            <p className="text-sm opacity-80 mb-4 leading-relaxed">
              Getkeja Premium members see 3x more bookings on average.
            </p>
            <button className="w-full py-2 bg-[#DD6E42] text-[#50757A] rounded-xl text-xs font-bold hover:bg-[#C4623B] transition-colors">
              Upgrade to Premium
            </button>
          </div>
        </div>

        {/* Portfolio summary */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-[#50757A]">Portfolio at a Glance</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Upcoming Short-Stay', value: stats?.short_stay?.upcoming_bookings ?? 0, suffix: 'bookings', icon: Calendar },
                { label: 'Active Tenancies', value: stats?.tenancies?.active ?? 0, suffix: 'units occupied', icon: Users },
                { label: 'Pending Tenancy Applications', value: stats?.tenancies?.pending_applications ?? 0, suffix: 'awaiting review', icon: ArrowUpRight },
                { label: 'Visit Requests', value: stats?.visits?.pending ?? 0, suffix: 'to confirm', icon: Calendar },
              ].map((item) => (
                <div key={item.label} className="p-4 rounded-xl bg-[#EAEAEA] border border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <item.icon className="w-4 h-4 text-[#DD6E42]" />
                    <p className="text-xs text-[#50757A] font-semibold uppercase tracking-wider">{item.label}</p>
                  </div>
                  <p className="text-2xl font-black text-[#50757A]">{item.value}</p>
                  <p className="text-xs text-[#50757A] mt-0.5">{item.suffix}</p>
                </div>
              ))}
            </div>

            {stats?.generated_at && (
              <p className="text-[10px] text-[#C0D6DF] mt-4">
                Last updated: {new Date(stats.generated_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordOverviewTab;

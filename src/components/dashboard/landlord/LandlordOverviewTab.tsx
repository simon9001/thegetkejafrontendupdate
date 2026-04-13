// frontend/src/components/dashboard/landlord/LandlordOverviewTab.tsx
import React from 'react';
import { 
  Building2, Users, DollarSign, Calendar, MessageSquare, 
  TrendingUp, ArrowUpRight, ArrowDownRight, Zap 
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
      change: '+12.5%',
      trend: 'up',
      icon: DollarSign,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Your Properties',
      value: stats?.properties?.total ?? 0,
      change: '+2',
      trend: 'up',
      icon: Building2,
      color: 'bg-[#ff385c]/10 text-[#ff385c]',
    },
    {
      label: 'Active Tenancies',
      value: stats?.tenancies?.active ?? 0,
      change: '85% occupancy',
      trend: 'neutral',
      icon: Users,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Active Boosts',
      value: stats?.boosts?.active ?? 0,
      change: 'Promoted',
      trend: 'up',
      icon: Zap,
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  const alerts = [
    { 
      label: 'Pending Applications', 
      count: stats?.tenancies?.pending_applications ?? 0,
      link: '/dashboard/tenants', 
      icon: Users,
      priority: 'high'
    },
    { 
      label: 'Visit Requests', 
      count: stats?.visits?.pending ?? 0, 
      link: '/dashboard/bookings',
      icon: Calendar,
      priority: 'medium'
    },
    { 
      label: 'Unread Messages', 
      count: stats?.messages?.unread ?? 0, 
      link: '/dashboard/messages',
      icon: MessageSquare,
      priority: 'medium'
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section with greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#222222]">Welcome back, {userName}</h1>
          <p className="text-[#6a6a6a] mt-1">Here's what's happening with your portfolio today.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm">
            Download Report
          </button>
          <button className="px-4 py-2 bg-[#ff385c] text-white rounded-xl text-sm font-semibold hover:bg-[#e31c5f] transition-colors shadow-sm">
            Add Property
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-[0_2px_10px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${kpi.color}`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-0.5 text-xs font-bold ${
                kpi.trend === 'up' ? 'text-green-600' : kpi.trend === 'down' ? 'text-red-600' : 'text-[#6a6a6a]'
              }`}>
                {kpi.change}
                {kpi.trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
                {kpi.trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
              </div>
            </div>
            <p className="text-[#6a6a6a] text-sm font-medium">{kpi.label}</p>
            <h3 className="text-2xl font-bold text-[#222222] mt-1">{kpi.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Alerts & Action items */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-lg font-bold text-[#222222] px-1">Engagement Alerts</h2>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div 
                key={alert.label}
                className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-[#ff385c]/30 transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-2.5 rounded-lg ${
                    alert.count > 0 ? 'bg-[#ff385c]/10 text-[#ff385c]' : 'bg-gray-50 text-gray-400'
                  }`}>
                    <alert.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#222222]">{alert.label}</p>
                    <p className="text-xs text-[#6a6a6a]">{alert.count} items requiring attention</p>
                  </div>
                </div>
                <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                  alert.count > 0 ? 'bg-[#ff385c] text-white' : 'bg-gray-100 text-gray-400'
                }`}>
                  {alert.count}
                </div>
              </div>
            ))}
          </div>
          <div className="p-5 bg-gradient-to-br from-[#ff385c] to-[#e31c5f] rounded-2xl text-white shadow-lg relative overflow-hidden">
            <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 opacity-10 rotate-12" />
            <h3 className="font-bold mb-2">Grow your portfolio</h3>
            <p className="text-sm opacity-90 mb-4 text-balance">Getkeja Premium members see 3x more bookings on average.</p>
            <button className="w-full py-2 bg-white text-[#ff385c] rounded-xl text-xs font-bold hover:bg-gray-50 transition-colors">
              Upgrade to Premium
            </button>
          </div>
        </div>

        {/* Visual Summary */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-bold text-[#222222]">Portfolio Performance</h2>
              <select className="bg-gray-50 border border-transparent text-sm font-medium rounded-lg px-2 py-1 outline-none">
                <option>Last 30 Days</option>
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
            </div>
            
            <div className="relative h-[240px] flex items-end justify-between gap-3 px-2">
              {[60, 45, 80, 55, 90, 70, 85, 95, 75, 65, 80, 100].map((h, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="w-full relative">
                    <motion.div 
                      initial={{ height: 0 }}
                      animate={{ height: `${h}%` }}
                      transition={{ duration: 1, delay: i * 0.05 }}
                      className="w-full bg-gray-100 rounded-lg group-hover:bg-[#ff385c]/80 transition-colors"
                    />
                  </div>
                  <span className="text-[10px] text-[#6a6a6a] font-medium hidden md:block">
                    {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][i]}
                  </span>
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 mt-8 pt-8 border-t border-gray-50 gap-4">
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#6a6a6a] font-bold">Occupancy Rate</p>
                <p className="text-xl font-bold text-[#222222]">92%</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#6a6a6a] font-bold">Avg. Rent</p>
                <p className="text-xl font-bold text-[#222222]">KES 45k</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#6a6a6a] font-bold">Market Score</p>
                <p className="text-xl font-bold text-[#222222]">8.4/10</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider text-[#6a6a6a] font-bold">Churn Rate</p>
                <p className="text-xl font-bold text-green-600">2.1%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandlordOverviewTab;

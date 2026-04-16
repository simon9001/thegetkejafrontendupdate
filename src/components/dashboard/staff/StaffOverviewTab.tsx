// frontend/src/components/dashboard/staff/StaffOverviewTab.tsx
import React from 'react';
import {
  ShieldCheck, UserCheck, Scale, AlertCircle,
  ArrowUpRight, Clock, Search
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { DashboardStats } from '../../../features/Api/DashboardApi';

interface Props {
  stats?: DashboardStats;
  userName: string;
}

const StaffOverviewTab: React.FC<Props> = ({ stats, userName: _userName }) => {
  const kpis = [
    {
      label: 'Pending Properties',
      value: stats?.pendingProperties ?? 0,
      change: 'Approval Pool',
      icon: Search,
      color: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'ID Verifications',
      value: stats?.pendingUserVerifications ?? 0,
      change: 'Awaiting Review',
      icon: UserCheck,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Active Disputes',
      value: stats?.activeDisputes ?? 0,
      change: 'Requires Action',
      icon: Scale,
      color: 'bg-red-50 text-red-600',
    },
    {
      label: 'Security Score',
      value: '98.2%',
      change: 'Trust Metric',
      icon: ShieldCheck,
      color: 'bg-green-50 text-green-600',
    },
  ];

  const recentTasks = [
    { type: 'ID Verification', user: 'Simon Kamau', time: '12m ago', status: 'pending' },
    { type: 'Property Approval', user: 'Sunrise Estates', time: '45m ago', status: 'pending' },
    { type: 'Dispute Resolution', user: 'Ticket #420', time: '2h ago', status: 'in-progress' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section with greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#222222]">Moderation Console</h1>
          <p className="text-[#6a6a6a] mt-1">Maintaining platform integrity and user safety.</p>
        </div>
        <div className="flex gap-3 text-sm font-semibold text-[#222222]">
           <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl border border-gray-100 shadow-sm">
             <Clock className="w-4 h-4 text-amber-500" /> Avg Response: 1.4h
           </div>
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
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:border-[#ff385c]/20 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${kpi.color}`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <ArrowUpRight className="w-4 h-4 text-gray-300" />
            </div>
            <p className="text-[#6a6a6a] text-xs font-bold uppercase tracking-wider">{kpi.label}</p>
            <h3 className="text-2xl font-bold text-[#222222] mt-1">{kpi.value}</h3>
            <p className="text-[11px] text-[#6a6a6a] mt-1 font-medium">{kpi.change}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Verification Queue */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h2 className="text-lg font-bold text-[#222222] mb-6">Recent Activity Queue</h2>
            <div className="divide-y divide-gray-50">
              {recentTasks.map((task, i) => (
                <div key={i} className="py-4 flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                      {task.type.includes('ID') ? <UserCheck className="w-5 h-5" /> : task.type.includes('Property') ? <Search className="w-5 h-5" /> : <Scale className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#222222]">{task.type}</p>
                      <p className="text-xs text-[#6a6a6a]">{task.user} • {task.time}</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 bg-gray-50 text-[11px] font-bold text-[#222222] rounded-lg hover:bg-[#222222] hover:text-white transition-all">
                    Review
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* System Health */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm h-full flex flex-col">
            <h2 className="text-lg font-bold text-[#222222] mb-6">System Health</h2>
            <div className="space-y-6 flex-1">
               <div className="space-y-2">
                 <div className="flex justify-between text-xs font-bold">
                   <span className="text-[#6a6a6a]">Platform Trust Score</span>
                   <span className="text-green-600">98%</span>
                 </div>
                 <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                   <div className="w-[98%] h-full bg-green-500" />
                 </div>
               </div>
               <div className="space-y-2">
                 <div className="flex justify-between text-xs font-bold">
                   <span className="text-[#6a6a6a]">Legal Compliance</span>
                   <span className="text-blue-600">100%</span>
                 </div>
                 <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                   <div className="w-full h-full bg-blue-500" />
                 </div>
               </div>
            </div>
            
            <div className="mt-8 p-4 bg-orange-50 border border-orange-100 rounded-xl flex gap-3">
               <AlertCircle className="w-5 h-5 text-orange-600 shrink-0" />
               <p className="text-[11px] text-orange-800 font-medium">
                 2 properties in Kilimani area have been flagged for investigation by the fraud detection system.
               </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaffOverviewTab;

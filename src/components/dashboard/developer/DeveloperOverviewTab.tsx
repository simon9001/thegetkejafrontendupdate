// frontend/src/components/dashboard/developer/DeveloperOverviewTab.tsx
import React from 'react';
import { 
  Building2, Layers, TrendingUp, BarChart3, 
  ArrowUpRight, MapPin, Plus, Sparkles
} from 'lucide-react';
import { motion } from 'framer-motion';
import type { DashboardStats } from '../../../features/Api/DashboardApi';

interface Props {
  stats?: DashboardStats;
  userName: string;
}

const DeveloperOverviewTab: React.FC<Props> = ({ stats, userName }) => {
  const kpis = [
    {
      label: 'Active Projects',
      value: stats?.ownedProperties ?? 0,
      change: '+1',
      trend: 'up',
      icon: Building2,
      color: 'bg-indigo-50 text-indigo-600',
    },
    {
      label: 'Total Units',
      value: (stats as any)?.totalUnits ?? 124, // Fallback
      change: '82% sold',
      trend: 'up',
      icon: Layers,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Market Valuation',
      value: 'KES 420M',
      change: '+15%',
      trend: 'up',
      icon: TrendingUp,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Project Efficiency',
      value: '94%',
      change: 'Optimal',
      trend: 'neutral',
      icon: BarChart3,
      color: 'bg-blue-50 text-blue-600',
    },
  ];

  const milestones = [
    { name: 'Skyview Heights', status: '85% Complete', progress: 85, location: 'Kilimani' },
    { name: 'Urban Oasis', status: 'Foundation', progress: 15, location: 'Westlands' },
    { name: 'Riverway Plots', status: 'Ready for Title', progress: 95, location: 'Kitengela' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header section with greeting */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#222222]">Developer Portal: {userName}</h1>
          <p className="text-[#6a6a6a] mt-1">Strategic overview of your large-scale developments and acquisitions.</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors shadow-sm flex items-center gap-2">
            <BarChart3 className="w-4 h-4" /> Reports
          </button>
          <button className="px-4 py-2 bg-[#ff385c] text-white rounded-xl text-sm font-semibold hover:bg-[#e31c5f] transition-colors shadow-sm flex items-center gap-2">
            <Plus className="w-4 h-4" /> New Project
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
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${kpi.color}`}>
                <kpi.icon className="w-6 h-6" />
              </div>
              <div className={`flex items-center gap-0.5 text-xs font-bold ${
                kpi.trend === 'up' ? 'text-green-600' : 'text-[#6a6a6a]'
              }`}>
                {kpi.change}
                {kpi.trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
              </div>
            </div>
            <p className="text-[#6a6a6a] text-[13px] font-medium">{kpi.label}</p>
            <h3 className="text-2xl font-bold text-[#222222] mt-0.5">{kpi.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Project Pipeline */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-[#222222]">Project Pipeline</h2>
              <button className="text-[#ff385c] text-sm font-bold hover:underline">View All</button>
            </div>
            
            <div className="space-y-6">
              {milestones.map((project, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-50 rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-gray-400" />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#222222] text-sm">{project.name}</h4>
                        <div className="flex items-center gap-1 text-[11px] text-[#6a6a6a]">
                          <MapPin className="w-3 h-3" />
                          {project.location}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold text-[#ff385c] bg-[#ff385c]/5 px-2 py-1 rounded-md">
                      {project.status}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${project.progress}%` }}
                      transition={{ duration: 1, delay: i * 0.2 }}
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Insights & Actions */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-gradient-to-br from-[#222222] to-[#444444] p-6 rounded-2xl text-white shadow-xl relative overflow-hidden h-full flex flex-col justify-between">
            <Sparkles className="absolute -right-4 -top-4 w-24 h-24 opacity-10" />
            <div>
              <h3 className="font-bold text-lg mb-2">Market Insights</h3>
              <p className="text-sm opacity-80 mb-6 leading-relaxed"> Westlands land prices rose by 4.2% last quarter. Your "Urban Oasis" project is now valued 8% above target. </p>
            </div>
            <button className="w-full py-3 bg-white text-[#222222] rounded-xl text-sm font-bold hover:bg-gray-100 transition-colors">
              Read Market Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperOverviewTab;

import React from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Layers, TrendingUp, DollarSign,
  ArrowUpRight, MapPin, Plus, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useGetMyPropertiesQuery } from '../../../features/Api/PropertiesApi';

interface Props {
  stats?: {
    ownedProperties: number;
    activeBookings:  number;
    totalEarnings:   number;
  };
  userName: string;
}

const DeveloperOverviewTab: React.FC<Props> = ({ stats, userName }) => {
  const { data: propertiesData } = useGetMyPropertiesQuery(undefined);
  const recentProjects = (propertiesData?.properties ?? []).slice(0, 4);

  const kpis = [
    {
      label: 'Active Projects',
      value: stats?.ownedProperties ?? 0,
      icon: Building2,
      color: 'bg-[#50757A]/10 text-[#50757A]',
    },
    {
      label: 'Upcoming Bookings',
      value: stats?.activeBookings ?? 0,
      icon: Calendar,
      color: 'bg-[#DD6E42]/10 text-[#DD6E42]',
    },
    {
      label: 'Total Earnings',
      value: `KES ${(stats?.totalEarnings ?? 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Portfolio Units',
      value: (propertiesData?.properties ?? []).reduce((acc: number, p: any) => acc + (p.bedrooms ?? 1), 0),
      icon: Layers,
      color: 'bg-indigo-50 text-indigo-600',
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#50757A]">Developer Portal — {userName}</h1>
          <p className="text-[#50757A] mt-1 text-sm">Strategic overview of your developments and acquisitions.</p>
        </div>
        <div className="flex gap-3">
          <Link
            to="/dashboard/add-property"
            className="flex items-center gap-2 px-4 py-2.5 bg-[#DD6E42] text-[#50757A] rounded-xl text-sm font-bold hover:bg-[#C4623B] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Project
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
            className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all"
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
        {/* Real project pipeline */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-base font-bold text-[#50757A]">My Projects</h2>
              <Link to="/dashboard/projects" className="text-[#DD6E42] text-sm font-bold hover:underline">
                View All
              </Link>
            </div>

            {recentProjects.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                <p className="text-sm text-[#50757A]">No projects yet. Add your first project.</p>
                <Link
                  to="/dashboard/add-property"
                  className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-[#DD6E42] text-[#50757A] rounded-xl text-sm font-bold hover:bg-[#C4623B] transition-colors"
                >
                  <Plus className="w-4 h-4" /> Add Project
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {recentProjects.map((project: any, i: number) => (
                  <div key={project.id ?? i} className="flex items-center justify-between p-4 rounded-xl border border-gray-100 hover:border-[#DD6E42]/30 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-[#50757A]/5 rounded-xl flex items-center justify-center shrink-0">
                        <Building2 className="w-5 h-5 text-[#50757A]" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-[#50757A] text-sm truncate">
                          {project.title ?? 'Unnamed Project'}
                        </h4>
                        <div className="flex items-center gap-1 text-[11px] text-[#50757A] mt-0.5">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">
                            {[project.location?.area, project.location?.county].filter(Boolean).join(', ') || 'Kenya'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <span className={`shrink-0 ml-3 text-[11px] font-bold px-2.5 py-1 rounded-lg ${
                      project.status === 'active'
                        ? 'bg-[#DD6E42]/10 text-[#DD6E42]'
                        : project.status === 'pending_review'
                          ? 'bg-amber-50 text-amber-600'
                          : 'bg-gray-100 text-gray-500'
                    }`}>
                      {(project.status ?? 'draft').replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Market insights panel */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-[#50757A] to-[#3D5A5E] p-6 rounded-2xl text-white shadow-xl h-full flex flex-col">
            <TrendingUp className="w-8 h-8 text-[#DD6E42] mb-4" />
            <h3 className="font-bold text-lg mb-2">Market Insights</h3>
            <p className="text-sm text-[#C0D6DF] mb-6 leading-relaxed flex-1">
              Track Nairobi's real-time property trends. Your listings are benchmarked against similar properties in your area to help you price competitively.
            </p>
            <div className="space-y-3">
              {[
                { label: 'Your Projects', value: stats?.ownedProperties ?? 0, icon: Building2 },
                { label: 'Earnings (all time)', value: `KES ${(stats?.totalEarnings ?? 0).toLocaleString()}`, icon: DollarSign },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between p-3 rounded-xl bg-white/5">
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4 text-[#DD6E42]" />
                    <span className="text-xs text-[#C0D6DF]">{item.label}</span>
                  </div>
                  <span className="text-sm font-bold text-white">{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeveloperOverviewTab;

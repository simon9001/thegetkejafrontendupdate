import React from 'react';
import { Building2, Users, Calendar, TrendingUp, BarChart3, ArrowUpRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader } from '../shared';
import { useGetAgentReportsQuery } from '../../../features/Api/AgentApi';

const CATEGORY_LABELS: Record<string, string> = {
  for_sale:        'For Sale',
  long_term_rent:  'Long-term Rent',
  short_term_rent: 'Short Stay',
  commercial:      'Commercial',
};

const AgentReportsTab: React.FC = () => {
  const { data, isLoading } = useGetAgentReportsQuery();

  if (isLoading) {
    return (
      <div className="space-y-5 max-w-7xl animate-pulse">
        <div className="h-8 bg-gray-100 rounded-xl w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24" />)}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 h-48" />
      </div>
    );
  }

  const kpis = [
    { label: 'Total Listings',    value: data?.total_listings ?? 0,    icon: Building2,  color: 'bg-[#50757A]/10 text-[#50757A]' },
    { label: 'Active Tenancies',  value: data?.active_tenancies ?? 0,  icon: Users,      color: 'bg-[#DD6E42]/10 text-[#DD6E42]' },
    { label: 'Pending Viewings',  value: data?.pending_viewings ?? 0,  icon: Calendar,   color: 'bg-amber-50 text-amber-600' },
    { label: 'Total Leads',       value: data?.total_leads ?? 0,       icon: ArrowUpRight, color: 'bg-blue-50 text-blue-600' },
  ];

  const conversionRate = data?.conversion_rate_pct ?? 0;
  const byCategory = data?.listings_by_category ?? {};
  const total = data?.total_listings || 1;

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="Performance Reports" sub="Your listing and conversion metrics" />

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${kpi.color}`}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-[#50757A]">{kpi.value}</p>
            <p className="text-xs text-[#50757A] mt-1 font-medium">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Conversion Rate */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <TrendingUp className="w-5 h-5 text-[#DD6E42]" />
            <h3 className="font-bold text-[#50757A]">Lead-to-Tenancy Conversion</h3>
          </div>
          <span className="text-2xl font-bold text-[#50757A]">{conversionRate}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${conversionRate}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-[#DD6E42] rounded-full"
          />
        </div>
        <p className="text-xs text-[#50757A] mt-2">
          {data?.active_tenancies ?? 0} active tenancies from {data?.total_leads ?? 0} total leads
        </p>
      </div>

      {/* Listings by Category */}
      {Object.keys(byCategory).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <BarChart3 className="w-5 h-5 text-[#DD6E42]" />
            <h3 className="font-bold text-[#50757A]">Listings by Category</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(byCategory).map(([cat, count]) => {
              const pct = Math.round((count / total) * 100);
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-[#50757A] font-medium">{CATEGORY_LABELS[cat] ?? cat}</span>
                    <span className="font-bold text-[#50757A]">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.8 }}
                      className="h-full bg-[#DD6E42] rounded-full"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {data?.generated_at && (
        <p className="text-[10px] text-[#C0D6DF]">
          Last updated: {new Date(data.generated_at).toLocaleTimeString('en-KE', { hour: '2-digit', minute: '2-digit' })}
        </p>
      )}
    </div>
  );
};

export default AgentReportsTab;

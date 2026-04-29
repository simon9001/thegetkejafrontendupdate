import React from 'react';
import { TrendingUp, Users, DollarSign, Clock, MessageSquare, Building2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader } from '../shared';
import { useGetDeveloperPipelineQuery } from '../../../features/Api/DeveloperApi';

const DeveloperPipelineTab: React.FC = () => {
  const { data, isLoading } = useGetDeveloperPipelineQuery();

  const kpis = [
    {
      label: 'Total Enquiries',
      value: data?.total_enquiries ?? 0,
      icon: Users,
      accent: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Reserved Units',
      value: data?.reserved_units ?? 0,
      icon: Clock,
      accent: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Properties for Sale',
      value: data?.properties_for_sale ?? 0,
      icon: Building2,
      accent: 'bg-[#DD6E42]/10 text-[#DD6E42]',
    },
    {
      label: 'Projected Sales',
      value: `KES ${((data?.projected_sales_kes ?? 0) / 1_000_000).toFixed(1)}M`,
      icon: DollarSign,
      accent: 'bg-emerald-50 text-emerald-600',
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-5 max-w-7xl animate-pulse">
        <div className="h-8 bg-gray-100 rounded-xl w-48" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 h-28" />
          ))}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="Sales Pipeline" sub="Track leads and unit reservations from your listings" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${kpi.accent}`}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-[#50757A]">{kpi.value}</p>
            <p className="text-xs text-[#50757A] mt-1 font-medium">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Pipeline Entries */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-[#50757A]">Recent Enquiries</h3>
          <span className="text-xs text-[#50757A] font-medium">{data?.total_enquiries ?? 0} total</span>
        </div>

        {(data?.pipeline_entries ?? []).length === 0 ? (
          <div className="py-16 text-center">
            <TrendingUp className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-[#50757A] font-medium">No enquiries yet</p>
            <p className="text-xs text-[#50757A] mt-1">Enquiries from interested buyers will appear here.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {(data?.pipeline_entries ?? []).map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.04 }}
                className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-[#50757A]/5 flex items-center justify-center shrink-0">
                    <Users className="w-4 h-4 text-[#50757A]" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-[#50757A] text-sm truncate">
                      {entry.requester?.full_name ?? 'Unknown Enquirer'}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-[#50757A] mt-0.5">
                      <Building2 className="w-3 h-3 shrink-0" />
                      <span className="truncate">{entry.property?.title ?? 'Property'}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-3">
                  {(entry.unread_b ?? 0) > 0 && (
                    <span className="flex items-center gap-1 text-xs font-bold text-[#DD6E42] bg-[#DD6E42]/10 px-2 py-0.5 rounded-full">
                      <MessageSquare className="w-3 h-3" />
                      {entry.unread_b}
                    </span>
                  )}
                  <span className="text-[11px] text-[#50757A]">
                    {new Date(entry.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Market Insights Banner */}
      <div className="p-6 bg-gradient-to-br from-[#50757A] to-[#3D5A5E] rounded-2xl text-white shadow-lg flex items-center justify-between gap-6">
        <div>
          <h3 className="font-bold text-lg mb-1">Conversion Snapshot</h3>
          <p className="text-sm text-[#C0D6DF]">
            {data?.total_enquiries ?? 0} enquiries → {data?.reserved_units ?? 0} reservations
            {(data?.total_enquiries ?? 0) > 0 && (
              <> · <span className="text-[#DD6E42] font-bold">
                {Math.round(((data?.reserved_units ?? 0) / (data?.total_enquiries ?? 1)) * 100)}% conversion
              </span></>
            )}
          </p>
        </div>
        <TrendingUp className="w-10 h-10 text-[#DD6E42] shrink-0 opacity-80" />
      </div>
    </div>
  );
};

export default DeveloperPipelineTab;

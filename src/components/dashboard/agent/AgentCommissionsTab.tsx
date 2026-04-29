import React from 'react';
import { DollarSign, Clock, TrendingUp, Percent } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader, Badge } from '../shared';
import { useGetAgentCommissionsQuery } from '../../../features/Api/AgentApi';

const AgentCommissionsTab: React.FC = () => {
  const { data, isLoading } = useGetAgentCommissionsQuery();

  if (isLoading) {
    return (
      <div className="space-y-5 max-w-7xl animate-pulse">
        <div className="h-8 bg-gray-100 rounded-xl w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-28" />)}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 h-48" />
      </div>
    );
  }

  const kpis = [
    {
      label: 'Earned This Month',
      value: `KES ${(data?.earned_this_month_kes ?? 0).toLocaleString()}`,
      icon: DollarSign,
      accent: 'bg-emerald-50 text-emerald-600',
    },
    {
      label: 'Pending Payout',
      value: `KES ${(data?.pending_kes ?? 0).toLocaleString()}`,
      icon: Clock,
      accent: 'bg-amber-50 text-amber-600',
    },
    {
      label: 'Annual Total',
      value: `KES ${(data?.annual_total_kes ?? 0).toLocaleString()}`,
      icon: TrendingUp,
      accent: 'bg-blue-50 text-blue-600',
    },
  ];

  const deals = data?.recent_deals ?? [];

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="Commission Tracker" sub="Earnings and pending payouts from your deals" />

      {/* Commission Rate Banner */}
      {(data?.commission_rate_pct ?? 0) > 0 && (
        <div className="flex items-center gap-3 px-5 py-3 bg-[#50757A]/5 border border-[#50757A]/10 rounded-2xl">
          <Percent className="w-5 h-5 text-[#50757A] shrink-0" />
          <p className="text-sm text-[#50757A]">
            Your average commission rate is{' '}
            <span className="font-bold">{data?.commission_rate_pct ?? 0}%</span> per deal.
          </p>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {kpis.map((kpi, i) => (
          <motion.div
            key={kpi.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${kpi.accent}`}>
              <kpi.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-[#50757A] tracking-tight">{kpi.value}</p>
            <p className="text-xs text-[#50757A] mt-1 font-medium">{kpi.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Deals Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-[#50757A]">Recent Deals</h3>
          <span className="text-xs text-[#50757A]">{deals.length} deal{deals.length !== 1 ? 's' : ''}</span>
        </div>

        {deals.length === 0 ? (
          <div className="py-14 text-center">
            <DollarSign className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-[#50757A] font-medium">No deals recorded yet</p>
            <p className="text-xs text-[#50757A] mt-1">Your closed and pending deals will appear here.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-[#50757A] font-semibold uppercase border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-6 py-3.5">Property</th>
                  <th className="text-left px-6 py-3.5">Client</th>
                  <th className="text-left px-6 py-3.5">Date</th>
                  <th className="text-right px-6 py-3.5">Commission</th>
                  <th className="text-right px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {deals.map((deal, i) => (
                  <motion.tr
                    key={deal.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 font-semibold text-[#50757A]">{deal.property}</td>
                    <td className="px-6 py-4 text-[#50757A]">{deal.client}</td>
                    <td className="px-6 py-4 text-[#50757A] text-xs">
                      {deal.date
                        ? new Date(deal.date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
                        : '—'}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-[#50757A]">
                      KES {(deal.amount_kes ?? 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Badge status={deal.status} />
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentCommissionsTab;

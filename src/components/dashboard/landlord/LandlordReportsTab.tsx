import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2, Users, DollarSign, Calendar, TrendingUp,
  Bed, Home, Clock, BarChart3,
} from 'lucide-react';
import { SectionHeader } from '../shared';
import { useGetLandlordFullReportQuery } from '../../../features/Api/DashboardApi';

const CATEGORY_LABELS: Record<string, string> = {
  for_sale:        'For Sale',
  long_term_rent:  'Long-term Rent',
  short_term_rent: 'Short Stay / Airbnb',
  commercial:      'Commercial',
};

const LandlordReportsTab: React.FC = () => {
  const { data, isLoading } = useGetLandlordFullReportQuery();

  if (isLoading) {
    return (
      <div className="space-y-5 max-w-7xl animate-pulse">
        <div className="h-8 bg-gray-100 rounded-xl w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-24" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(2)].map((_, i) => <div key={i} className="bg-white rounded-2xl border border-gray-100 h-48" />)}
        </div>
      </div>
    );
  }

  const ss   = data?.short_stay;
  const lt   = data?.long_term;
  const occ  = data?.occupancy_rate_pct ?? 0;

  const topStats = [
    { label: 'Total Properties',    value: data?.total_properties ?? 0,          icon: Building2,  color: 'bg-[#50757A]/10 text-[#50757A]' },
    { label: 'Occupancy Rate',      value: `${occ}%`,                            icon: TrendingUp, color: 'bg-[#DD6E42]/10 text-[#DD6E42]' },
    { label: 'Active Tenancies',    value: lt?.active_tenancies ?? 0,            icon: Users,      color: 'bg-blue-50 text-blue-600' },
    { label: 'Short-Stay Bookings', value: ss?.bookings ?? 0,                    icon: Calendar,   color: 'bg-violet-50 text-violet-600' },
  ];

  const shortStayStats = [
    { label: 'Total Bookings',     value: ss?.bookings ?? 0,                                          icon: Calendar  },
    { label: 'Revenue (Host Payout)', value: `KES ${(ss?.revenue_kes ?? 0).toLocaleString()}`,       icon: DollarSign },
    { label: 'Avg Stay Duration',  value: `${ss?.avg_stay_nights ?? 0} nights`,                       icon: Bed        },
  ];

  const longTermStats = [
    { label: 'Active Tenancies',        value: lt?.active_tenancies ?? 0,                                    icon: Home },
    { label: 'Monthly Income',          value: `KES ${(lt?.monthly_income_kes ?? 0).toLocaleString()}`,     icon: DollarSign },
    { label: 'Pending Applications',    value: lt?.pending_applications ?? 0,                                icon: Clock },
  ];

  const byCategory = data?.by_category ?? {};
  const totalProps = data?.total_properties || 1;

  return (
    <div className="space-y-6 max-w-7xl">
      <SectionHeader title="Portfolio Reports" sub="Full performance report across all your properties" />

      {/* Top KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {topStats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm"
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${s.color}`}>
              <s.icon className="w-5 h-5" />
            </div>
            <p className="text-2xl font-bold text-[#50757A]">{s.value}</p>
            <p className="text-xs text-[#50757A] mt-1 font-medium">{s.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Occupancy Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-[#50757A]">Occupancy Rate</h3>
          <span className="text-2xl font-bold text-[#50757A]">{occ}%</span>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${occ}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className="h-full bg-[#DD6E42] rounded-full"
          />
        </div>
        <div className="flex justify-between text-xs text-[#50757A] mt-2">
          <span>0%</span>
          <span className="font-medium text-[#50757A]">{occ}% occupied</span>
          <span>100%</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Short-Stay Report */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-violet-50 rounded-xl flex items-center justify-center">
              <Bed className="w-5 h-5 text-violet-600" />
            </div>
            <div>
              <h3 className="font-bold text-[#50757A]">Short-Stay / Airbnb</h3>
              <p className="text-xs text-[#50757A]">Holiday homes, BnB, serviced apartments</p>
            </div>
          </div>
          <div className="space-y-3">
            {shortStayStats.map((s) => (
              <div key={s.label} className="flex items-center justify-between p-3.5 rounded-xl bg-[#EAEAEA] border border-gray-100">
                <div className="flex items-center gap-2">
                  <s.icon className="w-4 h-4 text-[#DD6E42]" />
                  <span className="text-sm text-[#50757A] font-medium">{s.label}</span>
                </div>
                <span className="font-bold text-[#50757A] text-sm">{s.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Long-Term Report */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
              <Home className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-[#50757A]">Long-Term Rentals</h3>
              <p className="text-xs text-[#50757A]">Monthly tenancies and lease agreements</p>
            </div>
          </div>
          <div className="space-y-3">
            {longTermStats.map((s) => (
              <div key={s.label} className="flex items-center justify-between p-3.5 rounded-xl bg-[#EAEAEA] border border-gray-100">
                <div className="flex items-center gap-2">
                  <s.icon className="w-4 h-4 text-[#DD6E42]" />
                  <span className="text-sm text-[#50757A] font-medium">{s.label}</span>
                </div>
                <span className="font-bold text-[#50757A] text-sm">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Portfolio by Category */}
      {Object.keys(byCategory).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center gap-3 mb-5">
            <BarChart3 className="w-5 h-5 text-[#DD6E42]" />
            <h3 className="font-bold text-[#50757A]">Portfolio Breakdown</h3>
          </div>
          <div className="space-y-4">
            {Object.entries(byCategory).map(([cat, count]) => {
              const pct = Math.round((count / totalProps) * 100);
              return (
                <div key={cat}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-[#50757A] font-medium">{CATEGORY_LABELS[cat] ?? cat}</span>
                    <span className="font-bold text-[#50757A]">{count} properties ({pct}%)</span>
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

export default LandlordReportsTab;

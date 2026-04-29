import React, { useState } from 'react';
import { DollarSign, TrendingUp, Clock, CalendarDays, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { SectionHeader, Badge } from '../shared';
import { useGetLandlordShortStayPaymentsQuery } from '../../../features/Api/DashboardApi';

const LandlordPaymentsTab: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useGetLandlordShortStayPaymentsQuery({ page, limit: 15 });

  const summary = data?.summary;

  const summaryCards = [
    {
      label: 'Total Revenue',
      value: `KES ${(summary?.total_revenue_kes ?? 0).toLocaleString()}`,
      sub: 'All-time host payouts',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      icon: DollarSign,
    },
    {
      label: 'Pending Payouts',
      value: `KES ${(summary?.pending_payments_kes ?? 0).toLocaleString()}`,
      sub: 'Confirmed bookings awaiting check-in',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      icon: Clock,
    },
    {
      label: 'This Month',
      value: `KES ${(summary?.this_month_kes ?? 0).toLocaleString()}`,
      sub: 'Revenue earned this month',
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      icon: TrendingUp,
    },
  ];

  const statusColor = (status: string) => {
    switch (status) {
      case 'completed':  return 'bg-emerald-50 text-emerald-700';
      case 'checked_in': return 'bg-[#DD6E42]/10 text-[#DD6E42]';
      case 'confirmed':  return 'bg-blue-50 text-blue-700';
      case 'cancelled':  return 'bg-red-50 text-red-600';
      default:           return 'bg-gray-100 text-gray-500';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-5 max-w-7xl animate-pulse">
        <div className="h-8 bg-gray-100 rounded-xl w-48" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <div key={i} className="rounded-2xl h-28 bg-gray-100" />)}
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="Short-Stay Payments" sub="Revenue and payout history for your short-stay properties" />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {summaryCards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`${c.bg} rounded-2xl p-5`}
          >
            <div className="flex items-start justify-between mb-2">
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
            <p className={`text-2xl font-bold ${c.color} tracking-tight`}>{c.value}</p>
            <p className="text-xs font-semibold text-[#50757A] mt-0.5">{c.label}</p>
            <p className="text-[11px] text-[#50757A] mt-0.5">{c.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="font-bold text-[#50757A]">Booking Transactions</h3>
          <span className="text-xs text-[#50757A] font-medium">{data?.total ?? 0} total</span>
        </div>

        {(data?.transactions ?? []).length === 0 ? (
          <div className="py-16 text-center">
            <DollarSign className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-sm text-[#50757A] font-medium">No short-stay transactions yet</p>
            <p className="text-xs text-[#50757A] mt-1">Short-stay booking payments will appear here.</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[11px] text-[#50757A] font-semibold uppercase bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-5 py-3">Booking</th>
                    <th className="text-left px-5 py-3">Property</th>
                    <th className="text-left px-5 py-3">Guest</th>
                    <th className="text-left px-5 py-3">Stay Dates</th>
                    <th className="text-right px-5 py-3">Total</th>
                    <th className="text-right px-5 py-3">Your Payout</th>
                    <th className="text-right px-5 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {(data?.transactions ?? []).map((tx, i) => (
                    <motion.tr
                      key={tx.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-5 py-4">
                        <p className="font-mono text-xs text-[#50757A]">{tx.booking_ref}</p>
                        <p className="text-[11px] text-[#C0D6DF]">
                          {new Date(tx.created_at).toLocaleDateString('en-KE')}
                        </p>
                      </td>
                      <td className="px-5 py-4 font-semibold text-[#50757A] text-xs">
                        {tx.property?.title ?? '—'}
                      </td>
                      <td className="px-5 py-4 text-[#50757A] text-xs">
                        {tx.guest?.full_name ?? '—'}
                      </td>
                      <td className="px-5 py-4 text-xs text-[#50757A]">
                        <div className="flex items-center gap-1">
                          <CalendarDays className="w-3 h-3 shrink-0" />
                          <span>
                            {tx.check_in_date
                              ? new Date(tx.check_in_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })
                              : '—'}
                            {' → '}
                            {tx.check_out_date
                              ? new Date(tx.check_out_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })
                              : '—'}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-right text-xs text-[#50757A]">
                        KES {(tx.total_kes ?? 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right font-bold text-[#50757A]">
                        KES {(tx.host_payout_kes ?? 0).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg ${statusColor(tx.status)}`}>
                          {tx.status.replace(/_/g, ' ')}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {(data?.total ?? 0) > 15 && (
              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-[#50757A]">
                  Page {page} of {Math.ceil((data?.total ?? 1) / 15)}
                </span>
                <div className="flex gap-2">
                  <button
                    disabled={page <= 1 || isFetching}
                    onClick={() => setPage(p => p - 1)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition-colors"
                  >
                    Prev
                  </button>
                  <button
                    disabled={(page * 15) >= (data?.total ?? 0) || isFetching}
                    onClick={() => setPage(p => p + 1)}
                    className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[#50757A] text-white hover:bg-[#3D5A5E] disabled:opacity-40 transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default LandlordPaymentsTab;

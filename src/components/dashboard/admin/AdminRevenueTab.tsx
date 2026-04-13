// components/dashboard/admin/AdminRevenueTab.tsx
import React, { useState } from 'react';
import { DollarSign, TrendingUp, CreditCard, Calendar, Download, Filter } from 'lucide-react';
import { SectionHeader, StatCard } from '../shared';
import {
  useGetRevenueBreakdownQuery,
  useGetDailyRevenueSeriesQuery,
} from '../../../features/Api/AdminApi';
import { exportToCsv } from '../../../utils/csvExport';

const AdminRevenueTab: React.FC = () => {
  const [days, setDays] = useState(30);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });
  
  const { data: breakdown, isLoading: bdLoading } = useGetRevenueBreakdownQuery({
    from: dateRange.from || undefined,
    to: dateRange.to || undefined
  });
  
  const { data: series, isLoading: seriesLoading } = useGetDailyRevenueSeriesQuery({ days });

  const fmt = (n?: number) => (n ?? 0).toLocaleString();
  const streams = breakdown?.by_stream;

  const maxDayValue = Math.max(1, ...(series?.series ?? []).map(d =>
    d.listing_fee + d.viewing_fee + d.subscription));

  const handleExport = () => {
    if (!breakdown) return;
    const exportData = [
      { stream: 'Listing Fees', amount_kes: streams?.listing_fees_kes, count: breakdown.counts.listing_payments },
      { stream: 'Viewing Fees', amount_kes: streams?.viewing_fees_kes, count: breakdown.counts.viewing_unlocks_paid },
      { stream: 'Subscriptions', amount_kes: streams?.subscriptions_kes, count: breakdown.counts.subscriptions_new },
      { stream: 'Short-Stay Fees', amount_kes: streams?.short_stay_fees_kes, count: breakdown.counts.short_stay_bookings },
    ];
    exportToCsv(exportData, 'revenue-breakdown');
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SectionHeader 
          title="Revenue Analytics" 
          sub={breakdown?.period ? `${breakdown.period.from} → ${breakdown.period.to}` : 'Global breakdown'} 
        />
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-white border border-gray-200 rounded-xl px-3 py-1.5">
            <Calendar className="w-3.5 h-3.5 text-[#6a6a6a]" />
            <input 
              type="date" 
              value={dateRange.from} 
              onChange={e => setDateRange(prev => ({ ...prev, from: e.target.value }))}
              className="text-xs font-bold text-[#222222] outline-none bg-transparent"
            />
            <span className="text-[#6a6a6a] text-xs">to</span>
            <input 
              type="date" 
              value={dateRange.to} 
              onChange={e => setDateRange(prev => ({ ...prev, to: e.target.value }))}
              className="text-xs font-bold text-[#222222] outline-none bg-transparent"
            />
          </div>
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-[#222222] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" /> Export
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Revenue" value={`KES ${fmt(breakdown?.total_kes)}`} icon={DollarSign} accent="bg-emerald-50 text-emerald-600" loading={bdLoading} />
        <StatCard label="Listing Fees" value={`KES ${fmt(streams?.listing_fees_kes)}`} sub={`${fmt(breakdown?.counts?.listing_payments)} payments`} icon={CreditCard} accent="bg-blue-50 text-blue-600" loading={bdLoading} />
        <StatCard label="Viewing Fees" value={`KES ${fmt(streams?.viewing_fees_kes)}`} sub={`${fmt(breakdown?.counts?.viewing_unlocks_paid)} unlocks`} icon={TrendingUp} accent="bg-violet-50 text-violet-600" loading={bdLoading} />
        <StatCard label="Subscriptions" value={`KES ${fmt(streams?.subscriptions_kes)}`} sub={`${fmt(breakdown?.counts?.subscriptions_new)} new`} icon={Calendar} accent="bg-amber-50 text-amber-600" loading={bdLoading} />
      </div>

      {/* Streams Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <h3 className="text-sm font-bold text-[#222222] mb-4">Revenue by Stream</h3>
          {bdLoading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-8 bg-gray-50 rounded animate-pulse" />)}</div>
          ) : (
            <div className="space-y-4">
              {[
                { label: 'Listing Fees', value: streams?.listing_fees_kes ?? 0, color: 'bg-[#ff385c]' },
                { label: 'Viewing Fees', value: streams?.viewing_fees_kes ?? 0, color: 'bg-violet-500' },
                { label: 'Subscriptions', value: streams?.subscriptions_kes ?? 0, color: 'bg-emerald-500' },
                { label: 'Short-Stay Fees', value: streams?.short_stay_fees_kes ?? 0, color: 'bg-amber-500' },
              ].map(s => {
                const pct = breakdown?.total_kes ? (s.value / breakdown.total_kes) * 100 : 0;
                return (
                  <div key={s.label} className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#6a6a6a] font-medium">{s.label}</span>
                      <span className="text-[#222222] font-semibold">KES {s.value.toLocaleString()} ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-700 ${s.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm transition-all hover:shadow-md">
          <h3 className="text-sm font-bold text-[#222222] mb-4">Listing Fees by Tier</h3>
          {bdLoading ? (
            <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-6 bg-gray-50 rounded animate-pulse" />)}</div>
          ) : (
            <div className="space-y-2.5">
              {Object.entries(breakdown?.listing_fees_by_tier ?? {}).map(([tier, amount]) => (
                <div key={tier} className="flex items-center justify-between text-sm">
                  <span className="text-[#6a6a6a] capitalize font-medium">{tier.replace(/_/g, ' ')}</span>
                  <span className="font-bold text-[#222222]">KES {(amount as number).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Daily Series Chart */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#ff385c]" />
            <h3 className="text-sm font-bold text-[#222222]">Daily Growth Series</h3>
          </div>
          <div className="flex gap-1">
            {[7, 14, 30, 60, 90].map(d => (
              <button key={d} onClick={() => setDays(d)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${days === d ? 'bg-[#222222] text-white shadow-sm' : 'text-[#6a6a6a] hover:bg-gray-100'}`}>
                {d}d
              </button>
            ))}
          </div>
        </div>
        {seriesLoading ? (
          <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
        ) : (
          <div className="flex items-end gap-[3px] h-48 overflow-x-auto pt-2">
            {(series?.series ?? []).map((d, i) => {
              const total = d.listing_fee + d.viewing_fee + d.subscription;
              const h = (total / maxDayValue) * 100;
              return (
                <div key={i} className="flex-1 min-w-[6px] group relative">
                  <div className="w-full rounded-t-lg bg-gray-100 group-hover:bg-[#ff385c]/10 transition-colors absolute inset-0 bottom-0 pointer-events-none" />
                  <div className="w-full rounded-t-lg bg-[#ff385c]/80 group-hover:bg-[#ff385c] transition-all cursor-pointer relative z-10"
                    style={{ height: `${Math.max(h, 4)}%` }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#222222] text-white text-[10px] py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-xl">
                      <p className="font-bold">{new Date(d.day).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })}</p>
                      <p>KES {total.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminRevenueTab;

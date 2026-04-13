// components/dashboard/admin/AdminBookingsTab.tsx
import React, { useState } from 'react';
import { Calendar, DollarSign, AlertTriangle, Clock } from 'lucide-react';
import { SectionHeader, Badge, Pagination, StatCard, EmptyState } from '../shared';
import {
  useGetBookingStatsQuery,
  useListShortStayBookingsQuery,
  useListLongTermBookingsQuery,
} from '../../../features/Api/AdminApi';

const AdminBookingsTab: React.FC = () => {
  const [view, setView] = useState<'short' | 'long'>('short');
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');

  const { data: stats } = useGetBookingStatsQuery();
  const { data: shortStay, isLoading: shortLoading } = useListShortStayBookingsQuery(
    { page, limit: 15, status: statusFilter || undefined },
    { skip: view !== 'short' },
  );
  const { data: longTerm, isLoading: longLoading } = useListLongTermBookingsQuery(
    { page, limit: 15, status: statusFilter || undefined },
    { skip: view !== 'long' },
  );

  const fmt = (n?: number) => (n ?? 0).toLocaleString();
  const bookings = view === 'short' ? (shortStay?.bookings ?? []) : (longTerm?.bookings ?? []);
  const totalPages = view === 'short' ? (shortStay?.pages ?? 1) : (longTerm?.pages ?? 1);
  const loading = view === 'short' ? shortLoading : longLoading;

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="Booking Management" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Short-Stay Active" value={fmt(stats?.short_stay?.active)} icon={Calendar} accent="bg-blue-50 text-blue-600" />
        <StatCard label="Long-Term Active" value={fmt(stats?.long_term?.active)} icon={Clock} accent="bg-violet-50 text-violet-600" />
        <StatCard label="Escrow Held" value={`KES ${fmt(stats?.short_stay?.escrow_held_kes)}`} icon={DollarSign} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Disputes" value={fmt(stats?.short_stay?.disputed)} icon={AlertTriangle} accent="bg-red-50 text-red-600" urgent />
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <button onClick={() => { setView('short'); setPage(1); setStatusFilter(''); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === 'short' ? 'bg-[#222222] text-white' : 'bg-white border border-gray-200 text-[#6a6a6a] hover:text-[#222222]'}`}>
          Short-Stay ({fmt(stats?.short_stay?.total)})
        </button>
        <button onClick={() => { setView('long'); setPage(1); setStatusFilter(''); }}
          className={`px-4 py-2 rounded-xl text-sm font-bold transition-all ${view === 'long' ? 'bg-[#222222] text-white' : 'bg-white border border-gray-200 text-[#6a6a6a] hover:text-[#222222]'}`}>
          Long-Term ({fmt(stats?.long_term?.total)})
        </button>
      </div>

      {/* Booking Table */}
      {loading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          {[...Array(8)].map((_, i) => <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />)}
        </div>
      ) : bookings.length === 0 ? (
        <EmptyState icon={Calendar} message="No bookings found" sub="No bookings match the current filters" />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50">
                  <th className="text-left px-4 py-3 font-semibold text-[#6a6a6a] text-xs">Booking Ref</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#6a6a6a] text-xs">Property</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#6a6a6a] text-xs">Guest</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#6a6a6a] text-xs">Status</th>
                  <th className="text-right px-4 py-3 font-semibold text-[#6a6a6a] text-xs">Amount</th>
                  <th className="text-left px-4 py-3 font-semibold text-[#6a6a6a] text-xs">Dates</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {bookings.map((b: any) => (
                  <tr key={b.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3"><span className="font-mono text-xs text-[#222222]">{(b.id ?? '').slice(0, 8)}</span></td>
                    <td className="px-4 py-3"><span className="text-sm font-medium text-[#222222]">{b.property_title ?? '—'}</span></td>
                    <td className="px-4 py-3"><span className="text-xs text-[#6a6a6a]">{b.guest_email ?? b.tenant_email ?? '—'}</span></td>
                    <td className="px-4 py-3"><Badge status={b.status ?? 'pending'} /></td>
                    <td className="px-4 py-3 text-right"><span className="font-bold text-[#222222]">KES {(b.total_charged_kes ?? b.monthly_rent ?? 0).toLocaleString()}</span></td>
                    <td className="px-4 py-3"><span className="text-xs text-[#6a6a6a]">{b.check_in ? new Date(b.check_in).toLocaleDateString() : '—'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-gray-100">
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBookingsTab;

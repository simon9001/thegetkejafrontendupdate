// components/dashboard/admin/AdminPropertiesTab.tsx
import React, { useState } from 'react';
import { Building2, Eye, CheckCircle, XCircle, Download } from 'lucide-react';
import { SectionHeader, Badge, Pagination, ConfirmModal, EmptyState } from '../shared';
import {
  useGetPropertyStatsQuery,
  useGetPendingListingsQuery,
  useGetTopListingsQuery,
  useApproveListingMutation,
  useRejectListingMutation,
} from '../../../features/Api/AdminApi';
import { exportToCsv } from '../../../utils/csvExport';

const AdminPropertiesTab: React.FC = () => {
  const [view, setView] = useState<'stats' | 'pending' | 'top'>('stats');
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const { data: stats } = useGetPropertyStatsQuery();
  const { data: pending, isLoading: pendingLoading } = useGetPendingListingsQuery({ page, limit: 15 });
  const { data: top } = useGetTopListingsQuery({ limit: 20 });
  const [approveListing] = useApproveListingMutation();
  const [rejectListing] = useRejectListingMutation();

  const handleExport = () => {
    let exportData: any[] = [];
    let filename = 'properties-report';

    if (view === 'stats' && stats) {
      exportData = Object.entries(stats.by_category).map(([cat, count]) => ({ category: cat, count }));
      filename = 'property-stats';
    } else if (view === 'pending' && pending?.listings) {
      exportData = pending.listings.map((p: any) => ({
        title: p.title,
        owner: p.owner_email,
        type: p.property_type,
        status: p.status,
        submitted: p.created_at
      }));
      filename = 'pending-listings';
    } else if (view === 'top' && top?.listings) {
      exportData = top.listings.map((p: any) => ({
        title: p.title,
        type: p.property_type,
        status: p.status,
        views: p.view_count
      }));
      filename = 'top-listings';
    }

    exportToCsv(exportData, filename);
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <SectionHeader title="Property Management" sub={`${stats?.featured_count ?? 0} featured · ${stats?.active_boosts ?? 0} active boosts`} />
        <button 
          onClick={handleExport}
          className="flex items-center gap-2 bg-[#222222] text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-black transition-all shadow-sm self-start md:self-auto"
        >
          <Download className="w-3.5 h-3.5" /> Export {view === 'stats' ? 'Stats' : 'Listings'}
        </button>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        {(['stats', 'pending', 'top'] as const).map(v => (
          <button key={v} onClick={() => { setView(v); setPage(1); }}
            className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${view === v ? 'bg-white text-[#222222] shadow-sm' : 'text-[#6a6a6a] hover:text-[#222222]'}`}>
            {v === 'stats' ? 'Overview' : v === 'pending' ? `Pending (${pending?.total ?? 0})` : 'Top Listings'}
          </button>
        ))}
      </div>

      {/* Stats View */}
      {view === 'stats' && (
        <div className="space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Object.entries(stats?.by_status ?? {}).map(([status, count]) => (
              <div key={status} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                <p className="text-xl font-bold text-[#222222]">{(count as number).toLocaleString()}</p>
                <p className="text-xs text-[#6a6a6a] capitalize mt-0.5">{status.replace(/_/g, ' ')}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-[#222222] mb-3">By Category</h3>
              <div className="space-y-2.5">
                {Object.entries(stats?.by_category ?? {}).map(([cat, count]) => {
                   const total = Object.values(stats?.by_category ?? {}).reduce((a, b) => (a as number) + (b as number), 0);
                   const pct = total ? ((count as number) / (total as number)) * 100 : 0;
                   return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-[#6a6a6a] capitalize font-medium">{cat.replace(/_/g, ' ')}</span>
                        <span className="font-bold text-[#222222]">{(count as number).toLocaleString()}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-[#ff385c] rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                   );
                })}
              </div>
            </div>
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
              <h3 className="text-sm font-bold text-[#222222] mb-3">By Type</h3>
              <div className="space-y-2.5">
                {Object.entries(stats?.by_type ?? {}).map(([type, count]) => (
                  <div key={type} className="flex items-center justify-between text-sm">
                    <span className="text-[#6a6a6a] capitalize font-medium">{type.replace(/_/g, ' ')}</span>
                    <span className="font-bold text-[#222222]">{(count as number).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pending View */}
      {view === 'pending' && (
        pendingLoading ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
            {[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}
          </div>
        ) : !pending?.listings?.length ? (
          <EmptyState icon={CheckCircle} message="No pending listings" sub="All listings have been reviewed" />
        ) : (
          <div className="space-y-3">
            {pending.listings.map((p: any) => (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
                <div className="w-16 h-16 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-50">
                  {p.media?.[0]?.url ? <img src={p.media[0].url} className="w-full h-full object-cover" alt="" />
                    : <Building2 className="w-6 h-6 text-gray-300 mx-auto mt-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-[#222222] truncate">{p.title}</p>
                  <p className="text-xs text-[#6a6a6a] mt-0.5">{p.owner_email ?? 'Unknown owner'} · {p.property_type ?? 'N/A'}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button onClick={() => window.open(`/property/${p.id}`, '_blank')}
                    className="p-2 rounded-xl text-[#6a6a6a] hover:bg-gray-50 border border-gray-200 transition-colors" title="View Listing"><Eye className="w-4 h-4" /></button>
                  <button onClick={() => approveListing(p.id)}
                    className="p-2 rounded-xl text-emerald-600 hover:bg-emerald-50 border border-emerald-200 transition-colors" title="Approve"><CheckCircle className="w-4 h-4" /></button>
                  <button onClick={() => setRejectTarget(p.id)}
                    className="p-2 rounded-xl text-red-600 hover:bg-red-50 border border-red-200 transition-colors" title="Reject"><XCircle className="w-4 h-4" /></button>
                </div>
              </div>
            ))}
            <div className="pt-2">
              <Pagination page={page} totalPages={pending.pages ?? 1} onPageChange={setPage} />
            </div>
          </div>
        )
      )}

      {/* Top Listings View */}
      {view === 'top' && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 font-semibold text-[#6a6a6a] text-xs uppercase tracking-wider">Property</th>
                <th className="text-left px-4 py-3 font-semibold text-[#6a6a6a] text-xs uppercase tracking-wider">Type</th>
                <th className="text-left px-4 py-3 font-semibold text-[#6a6a6a] text-xs uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-[#6a6a6a] text-xs uppercase tracking-wider">Views</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {(top?.listings ?? []).map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 py-3"><p className="font-semibold text-[#222222]">{p.title}</p></td>
                  <td className="px-4 py-3"><span className="text-xs text-[#6a6a6a] capitalize">{(p.property_type ?? '').replace(/_/g, ' ')}</span></td>
                  <td className="px-4 py-3"><Badge status={p.status ?? 'active'} /></td>
                  <td className="px-4 py-3 text-right"><span className="font-bold text-[#222222]">{(p.view_count ?? 0).toLocaleString()}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmModal
        isOpen={!!rejectTarget}
        title="Reject Listing"
        message="This listing will be sent back to the owner with your reason."
        confirmLabel="Reject"
        confirmClass="bg-red-600 hover:bg-red-700"
        onConfirm={(notes) => { if (rejectTarget) rejectListing({ propertyId: rejectTarget, reason: notes || 'Does not meet guidelines' }); setRejectTarget(null); }}
        onCancel={() => setRejectTarget(null)}
        showNotes
        notesPlaceholder="Rejection reason…"
      />
    </div>
  );
};

export default AdminPropertiesTab;

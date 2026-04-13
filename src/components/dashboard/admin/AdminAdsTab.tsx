// components/dashboard/admin/AdminAdsTab.tsx
import React, { useState } from 'react';
import { Megaphone, TrendingUp, MousePointer2, Eye, CheckCircle, Pause } from 'lucide-react';
import { SectionHeader, Badge, StatCard, EmptyState, Pagination } from '../shared';
import {
  useGetAdStatsQuery,
  useListAdCampaignsQuery,
  useApproveAdCampaignMutation,
  usePauseAdCampaignMutation,
} from '../../../features/Api/AdminApi';

const AdminAdsTab: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data: stats } = useGetAdStatsQuery();
  const { data: list, isLoading } = useListAdCampaignsQuery({ page, limit: 15 });
  const [approveAd] = useApproveAdCampaignMutation();
  const [pauseAd] = usePauseAdCampaignMutation();

  const fmt = (n?: number) => (n ?? 0).toLocaleString();

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="Ad Campaign Management" sub="Monitor and moderate active advertising campaigns" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Spent" value={`KES ${fmt(stats?.total_spent_kes)}`} icon={TrendingUp} accent="bg-blue-50 text-blue-600" />
        <StatCard label="Impressions" value={fmt(stats?.total_impressions)} icon={Eye} accent="bg-violet-50 text-violet-600" />
        <StatCard label="Total Clicks" value={fmt(stats?.total_clicks)} icon={MousePointer2} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Avg. CTR" value={`${stats?.avg_ctr_pct?.toFixed(2) ?? '0.00'}%`} icon={Megaphone} accent="bg-amber-50 text-amber-600" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-10 bg-gray-50 rounded-xl animate-pulse" />)}</div>
        ) : !list?.campaigns?.length ? (
          <EmptyState icon={Megaphone} message="No ad campaigns found" className="border-none" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/50 text-[#6a6a6a] text-xs font-semibold">
                  <th className="px-4 py-3">Campaign</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Budget</th>
                  <th className="px-4 py-3">Spent</th>
                  <th className="px-4 py-3">Performance</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 text-[#222222]">
                {list.campaigns.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-3 font-semibold">{c.name ?? 'Unnamed Campaign'}</td>
                    <td className="px-4 py-3"><Badge status={c.status} /></td>
                    <td className="px-4 py-3 text-xs font-bold text-[#6a6a6a]">KES {fmt(c.budget_kes)}</td>
                    <td className="px-4 py-3 text-xs font-bold text-emerald-600">KES {fmt(c.spent_kes)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="text-center">
                          <p className="text-[10px] uppercase text-[#6a6a6a] font-bold">Clicks</p>
                          <p className="text-xs font-bold">{fmt(c.clicks)}</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[10px] uppercase text-[#6a6a6a] font-bold">CTR</p>
                          <p className="text-xs font-bold">{(c.ctr_pct ?? 0).toFixed(2)}%</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {c.status === 'pending_approval' && (
                          <button onClick={() => approveAd(c.id)} className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50 transition-colors" title="Approve">
                            <CheckCircle className="w-4 h-4" />
                          </button>
                        )}
                        {c.status === 'active' && (
                          <button onClick={() => pauseAd(c.id)} className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors" title="Pause">
                            <Pause className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-3 border-t border-gray-100">
          <Pagination page={page} totalPages={list?.pages ?? 1} onPageChange={setPage} />
        </div>
      </div>
    </div>
  );
};

export default AdminAdsTab;

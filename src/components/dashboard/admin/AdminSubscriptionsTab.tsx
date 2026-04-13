// components/dashboard/admin/AdminSubscriptionsTab.tsx
import React, { useState } from 'react';
import { Package, Users, AlertCircle, Edit3, Save, X } from 'lucide-react';
import { SectionHeader, StatCard, Badge, EmptyState } from '../shared';
import {
  useGetSubscriptionStatsQuery,
  useListSubscriptionPlansQuery,
  useUpdateSubscriptionPlanMutation,
} from '../../../features/Api/AdminApi';

const AdminSubscriptionsTab: React.FC = () => {
  const { data: stats } = useGetSubscriptionStatsQuery();
  const { data: plansData, isLoading } = useListSubscriptionPlansQuery();
  const [updatePlan] = useUpdateSubscriptionPlanMutation();
  const [editingPlan, setEditingPlan] = useState<any>(null);
  const [editForm, setEditForm] = useState<any>(null);

  const fmt = (n?: number) => (n ?? 0).toLocaleString();
  const plans = plansData?.plans ?? [];

  const handleEditClick = (p: any) => {
    setEditingPlan(p);
    setEditForm({ ...p });
  };

  const handleSave = async () => {
    if (!editingPlan) return;
    try {
      await updatePlan({ id: editingPlan.id, updates: { 
        price_monthly_kes: editForm.price_monthly_kes,
        viewing_unlocks_per_month: editForm.viewing_unlocks_per_month,
        ai_recommendations_per_day: editForm.ai_recommendations_per_day,
        is_active: editForm.is_active
      } }).unwrap();
      setEditingPlan(null);
    } catch {}
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="Subscriptions" sub={`${fmt(stats?.total)} total subscribers`} />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Total Subscribers" value={fmt(stats?.total)} icon={Users} accent="bg-blue-50 text-blue-600" />
        <StatCard label="Past Due" value={fmt(stats?.past_due)} icon={AlertCircle} accent="bg-red-50 text-red-600" urgent />
        {Object.entries(stats?.by_status ?? {}).slice(0, 2).map(([status, count]) => (
          <StatCard key={status} label={status.replace(/_/g, ' ')} value={fmt(count as number)} icon={Package} accent="bg-violet-50 text-violet-600" />
        ))}
      </div>

      {/* By Plan breakdown */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <h3 className="text-sm font-bold text-[#222222] mb-4">Subscribers by Plan</h3>
        <div className="space-y-3">
          {Object.entries(stats?.subscribers_by_plan ?? {}).map(([plan, count]) => {
            const pct = stats?.total ? ((count as number) / stats.total) * 100 : 0;
            return (
              <div key={plan} className="flex items-center gap-3">
                <span className="text-sm text-[#6a6a6a] font-medium w-24 shrink-0">{plan}</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#ff385c] rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-sm font-bold text-[#222222] w-12 text-right">{fmt(count as number)}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Plans table */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-14 bg-gray-50 rounded-xl animate-pulse" />)}
        </div>
      ) : plans.length === 0 ? (
        <EmptyState icon={Package} message="No subscription plans configured" />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50">
                <th className="text-left px-4 py-3 font-semibold text-[#6a6a6a] text-[10px] uppercase tracking-wider">Plan</th>
                <th className="text-right px-4 py-3 font-semibold text-[#6a6a6a] text-[10px] uppercase tracking-wider">Monthly (KES)</th>
                <th className="text-right px-4 py-3 font-semibold text-[#6a6a6a] text-[10px] uppercase tracking-wider">Views/Mo</th>
                <th className="text-right px-4 py-3 font-semibold text-[#6a6a6a] text-[10px] uppercase tracking-wider">AI/Day</th>
                <th className="text-center px-4 py-3 font-semibold text-[#6a6a6a] text-[10px] uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-[#6a6a6a] text-[10px] uppercase tracking-wider">Subs</th>
                <th className="text-right px-4 py-3 font-semibold text-[#6a6a6a] text-[10px] uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {plans.map((p: any) => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors group">
                  <td className="px-4 py-3 font-bold text-[#222222]">{p.name}</td>
                  <td className="px-4 py-3 text-right font-bold text-[#ff385c]">{(p.price_monthly_kes ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right text-[#6a6a6a] font-medium">{p.viewing_unlocks_per_month}</td>
                  <td className="px-4 py-3 text-right text-[#6a6a6a] font-medium">{p.ai_recommendations_per_day}</td>
                  <td className="px-4 py-3 text-center"><Badge status={p.is_active ? 'active' : 'inactive'} /></td>
                  <td className="px-4 py-3 text-right font-bold text-[#222222]">{fmt(p.active_subscribers)}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleEditClick(p)} className="p-2 rounded-xl text-[#6a6a6a] hover:bg-white border border-transparent hover:border-gray-200 transition-all">
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Modal Overlay */}
      {editingPlan && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-lg font-bold text-[#222222]">Edit {editingPlan.name}</h3>
                <p className="text-xs text-[#6a6a6a]">Update plan limits and pricing</p>
              </div>
              <button onClick={() => setEditingPlan(null)} className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-gray-200">
                <X className="w-4 h-4 text-[#6a6a6a]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-[#222222]">Monthly Price (KES)</label>
                <input type="number" value={editForm.price_monthly_kes} 
                  onChange={e => setEditForm({...editForm, price_monthly_kes: parseFloat(e.target.value)})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none focus:ring-2 focus:ring-[#ff385c]/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#222222]">Viewing Unlocks</label>
                  <input type="number" value={editForm.viewing_unlocks_per_month} 
                    onChange={e => setEditForm({...editForm, viewing_unlocks_per_month: parseInt(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#222222]">AI/Day</label>
                  <input type="number" value={editForm.ai_recommendations_per_day} 
                    onChange={e => setEditForm({...editForm, ai_recommendations_per_day: parseInt(e.target.value)})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold outline-none" />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl">
                <span className="text-xs font-bold text-[#222222]">Plan Status</span>
                <button onClick={() => setEditForm({...editForm, is_active: !editForm.is_active})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${editForm.is_active ? 'bg-emerald-500' : 'bg-gray-300'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${editForm.is_active ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>
            <div className="p-6 bg-gray-50/50 border-t border-gray-100 flex gap-3">
              <button onClick={() => setEditingPlan(null)} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-[#6a6a6a] hover:bg-white border border-gray-200 transition-all">Cancel</button>
              <button onClick={handleSave} className="flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-[#222222] hover:bg-black transition-all flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSubscriptionsTab;

import React, { useState } from 'react';
import { Building2, ThumbsUp, ThumbsDown, ExternalLink, PowerOff, Power, AlertTriangle, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { SectionHeader, Badge, Pagination, ConfirmModal } from '../shared';
import {
  useGetPendingListingsQuery,
  useApproveListingMutation,
  useRejectListingMutation,
  useGetAllPropertiesAdminQuery,
  useDeactivatePropertyMutation,
  useActivatePropertyMutation,
  useStrikeLandlordMutation,
} from '../../../features/Api/AdminApi';

type TabView = 'pending' | 'all' | 'suspended';

const StaffListingsTab: React.FC = () => {
  const [tab, setTab]         = useState<TabView>('pending');
  const [page, setPage]       = useState(1);
  const [rejectId, setRejectId]         = useState<string | null>(null);
  const [deactivateId, setDeactivateId] = useState<string | null>(null);
  const [strikeTarget, setStrikeTarget] = useState<{ propertyId: string; ownerId: string; ownerName: string } | null>(null);

  const { data: pendingData, isLoading: pendingLoading } = useGetPendingListingsQuery({ page, limit: 10 });
  const { data: allData,     isLoading: allLoading }     = useGetAllPropertiesAdminQuery(
    tab === 'all'       ? { page, limit: 15 }                          :
    tab === 'suspended' ? { page, limit: 15, status: 'off_market' }    :
    undefined,
    { skip: tab === 'pending' }
  );

  const [approve]    = useApproveListingMutation();
  const [reject]     = useRejectListingMutation();
  const [deactivate] = useDeactivatePropertyMutation();
  const [activate]   = useActivatePropertyMutation();
  const [strike]     = useStrikeLandlordMutation();

  const isLoading = tab === 'pending' ? pendingLoading : allLoading;
  const listings  = tab === 'pending'
    ? (pendingData?.listings ?? [])
    : (allData?.properties ?? []);
  const totalPages = tab === 'pending'
    ? (pendingData?.pages ?? 1)
    : (allData?.pages ?? 1);

  const handleApprove = async (id: string) => {
    try { await approve(id).unwrap(); toast.success('Listing approved'); }
    catch (e: any) { toast.error(e?.data?.message ?? 'Approval failed'); }
  };

  const handleReject = async (reason?: string) => {
    if (!rejectId) return;
    try { await reject({ propertyId: rejectId, reason: reason || 'Violation of guidelines' }).unwrap(); toast.success('Listing rejected'); }
    catch (e: any) { toast.error(e?.data?.message ?? 'Rejection failed'); }
    setRejectId(null);
  };

  const handleDeactivate = async (reason?: string) => {
    if (!deactivateId) return;
    try { await deactivate({ propertyId: deactivateId, reason: reason || 'Suspended by staff' }).unwrap(); toast.success('Property deactivated — hidden from public'); }
    catch (e: any) { toast.error(e?.data?.message ?? 'Deactivation failed'); }
    setDeactivateId(null);
  };

  const handleActivate = async (id: string) => {
    try { await activate(id).unwrap(); toast.success('Property reactivated'); }
    catch (e: any) { toast.error(e?.data?.message ?? 'Activation failed'); }
  };

  const handleStrike = async (reason?: string) => {
    if (!strikeTarget) return;
    try {
      await strike({ userId: strikeTarget.ownerId, reason: reason || 'Repeated policy violations' }).unwrap();
      toast.success(`${strikeTarget.ownerName} has been struck — all their properties suspended`);
    } catch (e: any) { toast.error(e?.data?.message ?? 'Strike failed'); }
    setStrikeTarget(null);
  };

  const TABS: { label: string; value: TabView; count?: number }[] = [
    { label: 'Pending Review', value: 'pending', count: pendingData?.total },
    { label: 'All Properties',  value: 'all' },
    { label: 'Deactivated',     value: 'suspended' },
  ];

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader
        title="Property Management"
        sub="Review, approve, deactivate or strike listings"
      />

      {/* Tab bar */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-xl w-fit">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => { setTab(t.value); setPage(1); }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              tab === t.value ? 'bg-white text-[#50757A] shadow-sm' : 'text-[#50757A]/70 hover:text-[#50757A]'
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
                tab === t.value ? 'bg-[#DD6E42] text-white' : 'bg-gray-200 text-gray-500'
              }`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Legend for deactivated tab */}
      {tab === 'suspended' && (
        <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          These properties are hidden from the public. Landlords can still see them in their dashboard.
        </div>
      )}

      {isLoading ? (
        <div className="grid gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}
        </div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-[#50757A]">
          <Building2 className="w-12 h-12 opacity-20 mb-3" />
          <p className="text-sm font-bold">
            {tab === 'pending' ? 'All caught up!' : tab === 'suspended' ? 'No deactivated properties' : 'No properties found'}
          </p>
          <p className="text-xs">
            {tab === 'pending' ? 'No pending listings to review.' : 'Nothing here yet.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {listings.map((p: any) => {
            const isSuspended = p.status === 'off_market';
            const ownerName   = p.owner?.full_name?.[0]?.full_name ?? p.owner?.email ?? p.owner_email ?? 'Unknown owner';
            const ownerId     = p.owner?.id ?? p.created_by;
            const cover       = p.cover_url ?? p.property_media?.find((m: any) => m.is_cover)?.url ?? p.property_media?.[0]?.url ?? null;
            const area        = p.property_locations?.[0]?.area ?? '';
            const county      = p.property_locations?.[0]?.county ?? '';

            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white rounded-2xl border p-5 shadow-sm hover:shadow-md transition-shadow ${
                  isSuspended ? 'border-amber-200 bg-amber-50/40' : 'border-gray-100'
                }`}
              >
                <div className="flex items-start gap-5">
                  {/* Cover image */}
                  <div className="w-20 h-20 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                    {cover
                      ? <img src={cover} className="w-full h-full object-cover" alt="" />
                      : <div className="w-full h-full flex items-center justify-center text-gray-300"><Building2 className="w-8 h-8" /></div>
                    }
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-[#50757A] truncate">{p.title}</h3>
                      <Badge status={p.status ?? 'pending'} />
                    </div>
                    <p className="text-xs text-[#50757A] mb-0.5">{ownerName}</p>
                    {(area || county) && (
                      <p className="text-xs text-gray-400 mb-2">{[area, county].filter(Boolean).join(', ')}</p>
                    )}

                    {/* Action row */}
                    <div className="flex flex-wrap gap-2">
                      {/* Pending tab only — approve/reject */}
                      {tab === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(p.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100"
                          >
                            <ThumbsUp className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => setRejectId(p.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors border border-red-100"
                          >
                            <ThumbsDown className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      )}

                      {/* Deactivate / Activate toggle */}
                      {!isSuspended ? (
                        <button
                          onClick={() => setDeactivateId(p.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 text-xs font-bold rounded-lg hover:bg-amber-100 transition-colors border border-amber-200"
                        >
                          <PowerOff className="w-3.5 h-3.5" /> Deactivate
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(p.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100"
                        >
                          <Power className="w-3.5 h-3.5" /> Reactivate
                        </button>
                      )}

                      {/* Strike landlord */}
                      {ownerId && (
                        <button
                          onClick={() => setStrikeTarget({ propertyId: p.id, ownerId, ownerName })}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors border border-red-200"
                        >
                          <ShieldAlert className="w-3.5 h-3.5" /> Strike Landlord
                        </button>
                      )}

                      {/* View listing */}
                      <button
                        onClick={() => window.open(`/property/${p.id}`, '_blank')}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-[#50757A] text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> View
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}

          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      {/* Reject modal */}
      <ConfirmModal
        isOpen={!!rejectId}
        title="Reject Listing"
        message="This will notify the owner. Please specify the reason."
        confirmLabel="Reject Listing"
        confirmClass="bg-red-600 hover:bg-red-700"
        onConfirm={handleReject}
        onCancel={() => setRejectId(null)}
        showNotes
        notesPlaceholder="Violation of policy, low quality photos, etc…"
      />

      {/* Deactivate modal */}
      <ConfirmModal
        isOpen={!!deactivateId}
        title="Deactivate Property"
        message="This property will be hidden from all public searches. The landlord will still see it in their dashboard. You can reactivate it at any time."
        confirmLabel="Deactivate"
        confirmClass="bg-amber-600 hover:bg-amber-700"
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateId(null)}
        showNotes
        notesPlaceholder="Reason for deactivation (optional)…"
      />

      {/* Strike landlord modal */}
      <ConfirmModal
        isOpen={!!strikeTarget}
        title={`Strike ${strikeTarget?.ownerName ?? 'Landlord'}`}
        message="This will suspend the landlord's account and hide ALL their properties from public searches. This is a serious action — please provide a clear reason."
        confirmLabel="Strike Landlord"
        confirmClass="bg-red-700 hover:bg-red-800"
        onConfirm={handleStrike}
        onCancel={() => setStrikeTarget(null)}
        showNotes
        notesPlaceholder="Reason for strike (e.g. repeated policy violations, fraud, etc.)…"
      />
    </div>
  );
};

export default StaffListingsTab;

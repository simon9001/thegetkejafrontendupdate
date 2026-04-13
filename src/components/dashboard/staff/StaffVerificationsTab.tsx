// components/dashboard/staff/StaffVerificationsTab.tsx
import React, { useState } from 'react';
import { UserCheck, Eye, ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { SectionHeader, Badge, Pagination, ConfirmModal } from '../shared';
import {
  useGetModerationVerificationsQuery,
  useApproveVerificationMutation,
  useRejectVerificationMutation,
} from '../../../features/Api/AdminApi';

const StaffVerificationsTab: React.FC = () => {
  const [filter, setFilter] = useState<'pending'|'approved'|'rejected'>('pending');
  const [page, setPage] = useState(1);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useGetModerationVerificationsQuery({ page, limit: 15, status: filter });
  const [approve] = useApproveVerificationMutation();
  const [reject] = useRejectVerificationMutation();

  const verifications = data?.verifications ?? [];
  const totalPages = data?.pages ?? 1;

  const handleApprove = async (id: string) => {
    try {
      await approve(id).unwrap();
      toast.success('Verification approved');
    } catch (e: any) {
      toast.error(e?.data?.message ?? 'Approval failed');
    }
  };

  const handleReject = async (notes?: string) => {
    if (!rejectTarget) return;
    try {
      await reject({ verificationId: rejectTarget, reason: notes || 'Documents do not meet requirements' }).unwrap();
      toast.success('Verification rejected');
    } catch (e: any) {
      toast.error(e?.data?.message ?? 'Rejection failed');
    }
    setRejectTarget(null);
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="ID Verifications" sub="Review role applications and identity documents" />

      <div className="flex gap-2">
        {(['pending', 'approved', 'rejected'] as const).map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all capitalize ${
              filter === f ? 'bg-[#111827] text-white border-[#111827]' : 'bg-white text-[#6a6a6a] border-gray-200 hover:border-gray-400'
            }`}>{f}</button>
        ))}
      </div>

      {(isLoading || isFetching) ? (
        <div className="grid gap-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : verifications.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-[#6a6a6a] gap-2 bg-gray-50 rounded-xl border border-dashed border-gray-200">
           <UserCheck className="w-8 h-8 opacity-20" />
           <p className="text-xs font-medium">No {filter} verifications</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {verifications.map((v: any) => (
            <motion.div key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#111827] flex items-center justify-center shrink-0">
                    <span className="text-[#ff385c] font-bold text-lg">{(v.user_full_name?.[0] ?? v.user_email?.[0] ?? '?').toUpperCase()}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#222222]">{v.user_full_name ?? v.user_email}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] px-2 py-0.5 bg-[#ff385c] text-white rounded-md font-bold uppercase tracking-wider">{v.requested_role?.replace(/_/g, ' ')}</span>
                      <span className="text-xs text-[#6a6a6a] capitalize">· {v.doc_type.replace(/_/g, ' ')} · {new Date(v.submitted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge status={v.status} />
                  <a href={v.front_image_url ?? v.selfie_url} target="_blank" rel="noreferrer" className="p-2 rounded-lg bg-gray-50 text-[#6a6a6a] hover:text-[#222222] border border-gray-200"><Eye className="w-4 h-4" /></a>
                </div>
              </div>
              {v.status === 'pending' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                   <button onClick={() => handleApprove(v.id)} className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 px-3 py-1.5 bg-emerald-50 rounded-lg hover:bg-emerald-100 border border-emerald-100 transition-all"><ThumbsUp className="w-3.5 h-3.5" /> Approve</button>
                   <button onClick={() => setRejectTarget(v.id)} className="flex items-center gap-1.5 text-xs font-bold text-red-600 px-3 py-1.5 bg-red-50 rounded-lg hover:bg-red-100 border border-red-100 transition-all"><ThumbsDown className="w-3.5 h-3.5" /> Reject</button>
                </div>
              )}
            </motion.div>
          ))}
          <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </div>
      )}

      <ConfirmModal
        isOpen={!!rejectTarget}
        title="Reject Verification"
        message="Please provide a reason for rejecting this verification."
        confirmLabel="Reject"
        confirmClass="bg-red-600 hover:bg-red-700"
        onConfirm={handleReject}
        onCancel={() => setRejectTarget(null)}
        showNotes
        notesPlaceholder="Reason for rejection…"
      />
    </div>
  );
};

export default StaffVerificationsTab;

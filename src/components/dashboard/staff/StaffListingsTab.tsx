// components/dashboard/staff/StaffListingsTab.tsx
import React, { useState } from 'react';
import { Building2, ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { SectionHeader, Badge, Pagination, ConfirmModal } from '../shared';
import {
  useGetPendingListingsQuery,
  useApproveListingMutation,
  useRejectListingMutation,
} from '../../../features/Api/AdminApi';

const StaffListingsTab: React.FC = () => {
  const [page, setPage] = useState(1);
  const [rejectId, setRejectId] = useState<string | null>(null);

  const { data, isLoading } = useGetPendingListingsQuery({ page, limit: 10 });
  const [approve] = useApproveListingMutation();
  const [reject] = useRejectListingMutation();

  const handleApprove = async (id: string) => {
    try {
      await approve(id).unwrap();
      toast.success('Listing approved');
    } catch (e: any) {
      toast.error(e?.data?.message ?? 'Approval failed');
    }
  };

  const handleReject = async (reason?: string) => {
    if (!rejectId) return;
    try {
      await reject({ propertyId: rejectId, reason: reason || 'Violation of guidelines' }).unwrap();
      toast.success('Listing rejected');
    } catch (e: any) {
      toast.error(e?.data?.message ?? 'Rejection failed');
    }
    setRejectId(null);
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="Listing Reviews" sub="New properties awaiting moderation" />

      {isLoading ? (
        <div className="grid gap-3">{[...Array(4)].map((_, i) => <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : !data?.listings?.length ? (
        <div className="flex flex-col items-center justify-center h-48 bg-gray-50 rounded-2xl border border-dashed border-gray-200 text-[#6a6a6a]">
          <Building2 className="w-12 h-12 opacity-20 mb-3" />
          <p className="text-sm font-bold">All caught up!</p>
          <p className="text-xs">No pending listings to review.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {data.listings.map((p: any) => (
            <motion.div key={p.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-5">
                <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden shrink-0 border border-gray-200">
                  {p.cover_url
                    ? <img src={p.cover_url} className="w-full h-full object-cover" alt="" />
                    : <div className="w-full h-full flex items-center justify-center text-gray-300"><Building2 className="w-8 h-8" /></div>
                  }
                </div>
                <div className="flex-1 min-w-0">
                   <div className="flex items-center justify-between gap-2 mb-1">
                      <h3 className="font-bold text-[#222222] truncate">{p.title}</h3>
                      <Badge status={p.status} />
                   </div>
                   <p className="text-xs text-[#6a6a6a] mb-2">{p.owner_email} · {p.property_type} · {p.currency} {p.price?.toLocaleString()}</p>
                   <div className="flex gap-2">
                     <button onClick={() => handleApprove(p.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-100 transition-colors border border-emerald-100"><ThumbsUp className="w-3.5 h-3.5" /> Approve</button>
                     <button onClick={() => setRejectId(p.id)} className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg hover:bg-red-100 transition-colors border border-red-100"><ThumbsDown className="w-3.5 h-3.5" /> Reject</button>
                     <button onClick={() => window.open(`/property/${p.id}`, '_blank')} className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-[#6a6a6a] text-xs font-bold rounded-lg hover:bg-gray-100 transition-colors border border-gray-200"><ExternalLink className="w-3.5 h-3.5" /> View Details</button>
                   </div>
                </div>
              </div>
            </motion.div>
          ))}
          <Pagination page={page} totalPages={data.pages ?? 1} onPageChange={setPage} />
        </div>
      )}

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
    </div>
  );
};

export default StaffListingsTab;

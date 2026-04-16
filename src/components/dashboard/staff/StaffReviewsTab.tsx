// components/dashboard/staff/StaffReviewsTab.tsx
import React from 'react';
import { AlertTriangle, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { SectionHeader, EmptyState } from '../shared';
import {
  useGetFraudReviewQueueQuery,
  usePublishReviewMutation,
  useRejectReviewMutation,
  useEscalateReviewMutation,
} from '../../../features/Api/AdminApi';

const StaffReviewsTab: React.FC = () => {
  const { data, isLoading } = useGetFraudReviewQueueQuery({ page: 1, limit: 15 });
  const [publish] = usePublishReviewMutation();
  const [reject] = useRejectReviewMutation();
  const [escalate] = useEscalateReviewMutation();

  const handleAction = async (action: 'publish'|'reject'|'escalate', id: string) => {
    try {
      if (action === 'publish') await publish(id).unwrap();
      if (action === 'reject') await reject({ reviewId: id, notes: 'Rejected by staff' }).unwrap();
      if (action === 'escalate') await escalate({ reviewId: id, notes: '' }).unwrap();
      toast.success(`Review ${action}ed`);
    } catch (e: any) {
      toast.error(e?.data?.message ?? 'Action failed');
    }
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="Fraud Review Queue" sub="Reviews flagged for moderation" />

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}</div>
      ) : !data?.reviews?.length ? (
        <EmptyState icon={Star} message="No fraud signals detected" sub="All reviews are currently safe." />
      ) : (
        <div className="space-y-4">
          {data.reviews.map((r: any) => (
            <motion.div key={r.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border border-red-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-4">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#222222] text-sm">{r.property_title ?? 'Property Review'}</h4>
                    <p className="text-xs text-[#6a6a6a]">{r.reviewer_email} · {r.rating_overall}/5 stars</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleAction('publish', r.id)} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 hover:bg-emerald-100">Ignore & Publish</button>
                  <button onClick={() => handleAction('reject', r.id)} className="px-3 py-1.5 bg-red-50 text-red-700 text-xs font-bold rounded-lg border border-red-100 hover:bg-red-100">Reject</button>
                  <button onClick={() => handleAction('escalate', r.id)} className="px-3 py-1.5 bg-violet-50 text-violet-700 text-xs font-bold rounded-lg border border-violet-100 hover:bg-violet-100">Escalate</button>
                </div>
              </div>

              <blockquote className="text-sm text-[#222222] italic bg-gray-50 px-4 py-3 rounded-xl border-l-4 border-red-400 mb-4">
                "{r.review_text}"
              </blockquote>

              <div className="flex flex-wrap gap-2">
                {r.fraud_signals.map((s: any) => (
                   <div key={s.id} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-bold ${
                     s.confidence === 'high' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                   }`}>
                     <AlertTriangle className="w-3 h-3" />
                     {s.signal.replace(/_/g, ' ')} ({s.confidence})
                   </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StaffReviewsTab;

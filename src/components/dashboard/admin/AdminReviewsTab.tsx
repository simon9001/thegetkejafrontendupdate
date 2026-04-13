// components/dashboard/admin/AdminReviewsTab.tsx
import React from 'react';
import { Star, AlertCircle, CheckCircle, XCircle, TrendingUp } from 'lucide-react';
import { SectionHeader, Badge, StatCard, EmptyState } from '../shared';
import {
  useGetReviewStatsQuery,
  useGetFraudReviewQueueQuery,
  usePublishReviewMutation,
  useRejectReviewMutation,
} from '../../../features/Api/AdminApi';

const AdminReviewsTab: React.FC = () => {
  const { data: stats } = useGetReviewStatsQuery();
  const { data: queue, isLoading } = useGetFraudReviewQueueQuery({ page: 1, limit: 20 });
  const [publishReview] = usePublishReviewMutation();
  const [rejectReview] = useRejectReviewMutation();

  const fmt = (n?: number) => (n ?? 0).toLocaleString();

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="Review Management" sub="Monitor quality and manage the fraud queue" />

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard label="Avg Rating" value={stats?.avg_rating?.toFixed(1) ?? '—'} icon={Star} accent="bg-amber-50 text-amber-600" />
        <StatCard label="Published" value={fmt(stats?.published)} icon={CheckCircle} accent="bg-emerald-50 text-emerald-600" />
        <StatCard label="Held for Review" value={fmt(stats?.held_moderation)} icon={AlertCircle} accent="bg-amber-50 text-amber-600" urgent />
        <StatCard label="Rejected" value={fmt(stats?.rejected)} icon={XCircle} accent="bg-red-50 text-red-600" />
      </div>

      {/* Fraud Signals breakdown */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100">
        <h3 className="text-sm font-bold text-[#222222] mb-4">Fraud Signals by Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(stats?.fraud_signals_by_type ?? {}).map(([type, s]: [string, any]) => (
            <div key={type} className="bg-gray-50 rounded-xl p-3 border border-gray-100">
              <div className="flex justify-between items-center mb-1">
                <p className="text-xs font-bold text-[#222222] capitalize">{type.replace(/_/g, ' ')}</p>
                <span className="text-[10px] font-bold text-red-600">{s.high} High Risk</span>
              </div>
              <p className="text-lg font-bold text-[#222222]">{s.total}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Moderation Queue */}
      <SectionHeader title="Moderation Queue" sub="Reviews flagged by automated fraud detection" />
      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-50 rounded-2xl animate-pulse" />)}</div>
      ) : !queue?.reviews?.length ? (
        <EmptyState icon={CheckCircle} message="Queue is empty" sub="All reviews have been processed" />
      ) : (
        <div className="space-y-3">
          {queue.reviews.map((r: any) => (
            <div key={r.id} className="bg-white rounded-2xl border border-red-100 p-5 shadow-sm">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#222222] text-sm">{r.property_title ?? 'Review'}</h4>
                    <p className="text-xs text-[#6a6a6a]">{r.reviewer_email} · Overall: {r.rating_overall}/5</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => publishReview(r.id)} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold hover:bg-emerald-100 border border-emerald-200 transition-all">Approve</button>
                  <button onClick={() => rejectReview({ reviewId: r.id, notes: 'Rejected by admin' })} className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg text-xs font-bold hover:bg-red-100 border border-red-200 transition-all">Reject</button>
                </div>
              </div>
              <p className="text-sm text-[#222222] leading-relaxed mb-4 italic">"{r.review_text}"</p>
              <div className="flex flex-wrap gap-2 pt-3 border-t border-gray-50">
                {r.fraud_signals.map((s: any) => (
                  <span key={s.id} className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${s.confidence === 'high' ? 'bg-red-50 text-red-700 border-red-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                    {s.signal} ({s.confidence})
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviewsTab;

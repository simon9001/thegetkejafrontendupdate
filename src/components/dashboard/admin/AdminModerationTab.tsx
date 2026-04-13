// components/dashboard/admin/AdminModerationTab.tsx
import React, { useState } from 'react';
import { ShieldAlert, UserCheck, Scale, AlertTriangle, MessageSquare, CheckCircle, XCircle } from 'lucide-react';
import { SectionHeader, Badge, Pagination, ConfirmModal, EmptyState } from '../shared';
import {
  useGetModerationVerificationsQuery,
  useApproveVerificationMutation,
  useRejectVerificationMutation,
  useGetModerationDisputesQuery,
  useResolveDisputeMutation,
  useGetFraudReviewQueueQuery,
  useGetReportedMessagesQuery,
} from '../../../features/Api/AdminApi';

type ModTab = 'verifications' | 'disputes' | 'fraud' | 'messages';

const AdminModerationTab: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ModTab>('verifications');
  const [page, setPage] = useState(1);
  const [actionTarget, setActionTarget] = useState<{ id: string; type: string; title: string } | null>(null);

  // Queries
  const { data: verifData, isLoading: vLoading } = useGetModerationVerificationsQuery({ page, limit: 10 }, { skip: activeTab !== 'verifications' });
  const { data: disputeData, isLoading: dLoading } = useGetModerationDisputesQuery({ page, limit: 10 }, { skip: activeTab !== 'disputes' });
  const { data: fraudData, isLoading: fLoading } = useGetFraudReviewQueueQuery({ page, limit: 10 }, { skip: activeTab !== 'fraud' });
  const { data: msgData, isLoading: mLoading } = useGetReportedMessagesQuery({ page, limit: 10 }, { skip: activeTab !== 'messages' });

  // Mutations
  const [approveVerif] = useApproveVerificationMutation();
  const [rejectVerif] = useRejectVerificationMutation();
  const [resolveDispute] = useResolveDisputeMutation();

  const handleAction = async (notes?: string) => {
    if (!actionTarget) return;
    try {
      if (actionTarget.type === 'approve_v') await approveVerif(actionTarget.id).unwrap();
      if (actionTarget.type === 'reject_v') await rejectVerif({ verificationId: actionTarget.id, reason: notes || 'Rejected' }).unwrap();
    } catch {}
    setActionTarget(null);
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="Moderation Center" sub="Review verifications, disputes, and fraud signals" />

      {/* Internal Sub-tabs */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-xl w-fit">
        {[
          { id: 'verifications', label: 'ID Verifications', icon: UserCheck },
          { id: 'disputes', label: 'Disputes', icon: Scale },
          { id: 'fraud', label: 'Fraud Queue', icon: AlertTriangle },
          { id: 'messages', label: 'Reported Messages', icon: MessageSquare },
        ].map(t => (
          <button key={t.id} onClick={() => { setActiveTab(t.id as ModTab); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === t.id ? 'bg-white text-[#222222] shadow-sm' : 'text-[#6a6a6a] hover:text-[#222222]'}`}>
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] min-h-[400px]">
        {activeTab === 'verifications' && (
          <div className="p-1">
            {vLoading ? <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}</div> :
              !verifData?.verifications?.length ? <EmptyState icon={UserCheck} message="No pending verifications" className="border-none bg-transparent" /> :
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-xs font-semibold text-[#6a6a6a]">
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Doc Type</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Submitted</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {verifData.verifications.map((v: any) => (
                      <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-[#222222]">{v.user_full_name ?? 'User'}</p>
                          <p className="text-xs text-[#6a6a6a]">{v.user_email}</p>
                        </td>
                        <td className="px-4 py-3 capitalize">{v.doc_type.replace('_', ' ')}</td>
                        <td className="px-4 py-3"><Badge status={v.status} /></td>
                        <td className="px-4 py-3 text-[#6a6a6a]">{new Date(v.submitted_at).toLocaleDateString()}</td>
                        <td className="px-4 py-3 text-right">
                          {v.status === 'pending' && (
                            <div className="flex items-center justify-end gap-1">
                              <button onClick={() => setActionTarget({ id: v.id, type: 'approve_v', title: 'Approve' })} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><CheckCircle className="w-4 h-4" /></button>
                              <button onClick={() => setActionTarget({ id: v.id, type: 'reject_v', title: 'Reject' })} className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"><XCircle className="w-4 h-4" /></button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
            <div className="p-4 border-t border-gray-100">
              <Pagination page={page} totalPages={verifData?.pages ?? 1} onPageChange={setPage} />
            </div>
          </div>
        )}

        {/* Disputes Content */}
        {activeTab === 'disputes' && (
          <div className="p-1">
            {dLoading ? <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}</div> :
              !disputeData?.disputes?.length ? <EmptyState icon={Scale} message="No active disputes" className="border-none bg-transparent" /> :
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50/50 text-left text-xs font-semibold text-[#6a6a6a]">
                      <th className="px-4 py-3">Booking Ref</th>
                      <th className="px-4 py-3">Reason</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Raised At</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {disputeData.disputes.map((d: any) => (
                      <tr key={d.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-4 py-3 font-mono text-xs">{d.booking_ref ?? d.booking_id.slice(0, 8)}</td>
                        <td className="px-4 py-3 font-medium">{d.reason}</td>
                        <td className="px-4 py-3"><Badge status={d.status} /></td>
                        <td className="px-4 py-3 font-bold text-[#ff385c]">KES {d.total_charged_kes?.toLocaleString() ?? '—'}</td>
                        <td className="px-4 py-3 text-[#6a6a6a]">{new Date(d.raised_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            }
            <div className="p-4 border-t border-gray-100">
              <Pagination page={page} totalPages={disputeData?.pages ?? 1} onPageChange={setPage} />
            </div>
          </div>
        )}

        {/* Fraud Content */}
        {activeTab === 'fraud' && (
          <div className="p-1">
            {fLoading ? <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}</div> :
              !fraudData?.reviews?.length ? <EmptyState icon={AlertTriangle} message="No reviews in fraud queue" className="border-none bg-transparent" /> :
              <div className="divide-y divide-gray-50">
                {fraudData.reviews.map((f: any) => (
                  <div key={f.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-semibold text-[#222222]">{f.property_title ?? 'Property Review'}</p>
                        <p className="text-xs text-[#6a6a6a]">{f.reviewer_email} · Overall: {f.rating_overall}/5</p>
                      </div>
                      <Badge status={f.status} />
                    </div>
                    <p className="text-sm text-[#6a6a6a] line-clamp-2 italic mb-3">"{f.review_text}"</p>
                    <div className="flex flex-wrap gap-2">
                      {f.fraud_signals.map((s: any) => (
                        <span key={s.id} className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-50 text-red-600 border border-red-100">
                          {s.signal} ({s.confidence})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            }
            <div className="p-4 border-t border-gray-100">
              <Pagination page={page} totalPages={fraudData?.pages ?? 1} onPageChange={setPage} />
            </div>
          </div>
        )}

        {/* Messages Content */}
        {activeTab === 'messages' && (
          <div className="p-1">
            {mLoading ? <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}</div> :
              !msgData?.reports?.length ? <EmptyState icon={MessageSquare} message="No reported messages" className="border-none bg-transparent" /> :
              <div className="divide-y divide-gray-50">
                {msgData.reports.map((r: any) => (
                  <div key={r.id} className="p-4 hover:bg-gray-50/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                       <p className="text-xs font-bold text-[#ff385c]">REASON: {r.reason}</p>
                       <Badge status={r.reviewed ? 'resolved' : 'pending'} />
                    </div>
                    <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 mb-2">
                      <p className="text-sm text-[#222222]">{r.message_body ?? '[Message Deleted or Unreachable]'}</p>
                    </div>
                    <p className="text-[10px] text-[#6a6a6a]">From: {r.sender_email} · Reported by: {r.reporter_email}</p>
                  </div>
                ))}
              </div>
            }
            <div className="p-4 border-t border-gray-100">
              <Pagination page={page} totalPages={msgData?.pages ?? 1} onPageChange={setPage} />
            </div>
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!actionTarget}
        title={`${actionTarget?.title} Verification`}
        message={`Are you sure you want to ${actionTarget?.title.toLowerCase()} this verification request?`}
        confirmLabel={actionTarget?.title ?? 'Confirm'}
        confirmClass={actionTarget?.type.startsWith('approve') ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'}
        onConfirm={handleAction}
        onCancel={() => setActionTarget(null)}
        showNotes={actionTarget?.type.startsWith('reject')}
        notesPlaceholder="Reason for rejection…"
      />
    </div>
  );
};

export default AdminModerationTab;

// components/dashboard/staff/StaffVerificationsTab.tsx
// Staff view: list of ID verification requests with a slide-out detail drawer.
// Drawer shows all submitted data: document images, selfie, user info, doc number.
import React, { useState } from 'react';
import {
  UserCheck, Eye, ThumbsUp, ThumbsDown, X,
  User, Mail, Phone, FileText, Calendar, CheckCircle2,
  XCircle, Clock, AlertTriangle, ImageOff, ZoomIn,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { SectionHeader, Pagination, ConfirmModal } from '../shared';
import {
  useGetModerationVerificationsQuery,
  useApproveVerificationMutation,
  useRejectVerificationMutation,
  type IdVerification,
} from '../../../features/Api/AdminApi';

// ─── helpers ─────────────────────────────────────────────────────────────────

function fmtDate(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-KE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function DocLabel(type: IdVerification['doc_type']) {
  const map: Record<string, string> = {
    national_id:   'National ID',
    passport:      'Passport',
    company_cert:  'Company Certificate',
    earb_license:  'EARB License',
    nca_cert:      'NCA Certificate',
  };
  return map[type] ?? type;
}

/** Role that will be assigned on approval, inferred from the submitted doc type */
function inferredRole(type: IdVerification['doc_type']): string {
  const map: Record<string, string> = {
    national_id:   'Landlord',
    passport:      'Landlord',
    company_cert:  'Developer',
    nca_cert:      'Developer',
    earb_license:  'Agent',
  };
  return map[type] ?? 'Landlord';
}

const StatusPill: React.FC<{ status: IdVerification['status'] }> = ({ status }) => {
  const cfg: Record<string, { label: string; icon: React.ElementType; cls: string }> = {
    pending:  { label: 'Pending',  icon: Clock,         cls: 'bg-amber-50  text-amber-700  border-amber-200'  },
    approved: { label: 'Approved', icon: CheckCircle2,  cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    rejected: { label: 'Rejected', icon: XCircle,       cls: 'bg-red-50    text-red-700    border-red-200'    },
    expired:  { label: 'Expired',  icon: AlertTriangle, cls: 'bg-gray-100  text-gray-500   border-gray-200'   },
  };
  const { label, icon: Icon, cls } = cfg[status] ?? cfg.pending;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${cls}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
};

// ─── Image tile — shows doc image or a placeholder ───────────────────────────
const DocImage: React.FC<{ src: string | null; label: string; onZoom: () => void }> = ({ src, label, onZoom }) => (
  <div className="flex flex-col gap-1.5">
    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{label}</p>
    {src ? (
      <div className="relative group rounded-xl overflow-hidden border border-gray-200 bg-gray-50 aspect-[4/3]">
        <img
          src={src}
          alt={label}
          className="w-full h-full object-cover"
          onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
        />
        <button
          onClick={onZoom}
          className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/30 transition-colors"
          aria-label={`Zoom ${label}`}
        >
          <ZoomIn className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
        </button>
      </div>
    ) : (
      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 aspect-[4/3] flex flex-col items-center justify-center text-gray-300">
        <ImageOff className="w-8 h-8 mb-1" />
        <p className="text-[10px]">Not provided</p>
      </div>
    )}
  </div>
);

// ─── Lightbox ─────────────────────────────────────────────────────────────────
const Lightbox: React.FC<{ src: string; label: string; onClose: () => void }> = ({ src, label, onClose }) => (
  <AnimatePresence>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-6"
    >
      <motion.div
        initial={{ scale: 0.92 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.92 }}
        onClick={(e) => e.stopPropagation()}
        className="relative max-w-3xl w-full"
      >
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white/70 hover:text-white"
          aria-label="Close"
        >
          <X className="w-6 h-6" />
        </button>
        <p className="text-white/60 text-xs font-semibold uppercase tracking-wider mb-3">{label}</p>
        <img src={src} alt={label} className="w-full rounded-2xl shadow-2xl max-h-[80vh] object-contain" />
      </motion.div>
    </motion.div>
  </AnimatePresence>
);

// ─── Detail drawer ─────────────────────────────────────────────────────────────
interface DrawerProps {
  v: IdVerification;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
  isApproving: boolean;
}

const VerificationDrawer: React.FC<DrawerProps> = ({ v, onClose, onApprove, onReject, isApproving }) => {
  const [zoomed, setZoomed] = useState<{ src: string; label: string } | null>(null);
  const name = v.user_full_name ?? v.user_display_name ?? v.user_email ?? 'Unknown user';

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-40 bg-black/30"
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-lg bg-white shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            {v.user_avatar_url ? (
              <img src={v.user_avatar_url} alt={name} className="w-10 h-10 rounded-full object-cover" />
            ) : (
              <div className="w-10 h-10 rounded-full bg-[#111827] flex items-center justify-center text-[#ff385c] font-bold text-lg">
                {(name[0] ?? '?').toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-bold text-[#222222] text-sm leading-tight">{name}</p>
              <StatusPill status={v.status} />
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">

          {/* User info */}
          <section>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Applicant Details</p>
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <InfoRow icon={User}     label="Name"     value={v.user_full_name ?? '—'} />
              <InfoRow icon={Mail}     label="Email"    value={v.user_email    ?? '—'} />
              <InfoRow icon={Phone}    label="Phone"    value={v.user_phone    ?? '—'} />
              <InfoRow icon={Calendar} label="Submitted" value={fmtDate(v.submitted_at)} />
              {v.reviewed_at && (
                <InfoRow icon={Calendar} label="Reviewed" value={fmtDate(v.reviewed_at)} />
              )}
            </div>
          </section>

          {/* Document info */}
          <section>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Document Information</p>
            <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
              <InfoRow icon={FileText} label="Document Type"   value={DocLabel(v.doc_type)} />
              <InfoRow icon={FileText} label="Document No."    value={v.doc_number ?? '—'} />
              <div className="flex items-center gap-3 pt-1 border-t border-gray-200">
                <div className="w-7 h-7 rounded-lg bg-[#ff385c]/10 border border-[#ff385c]/20 flex items-center justify-center shrink-0">
                  <UserCheck className="w-3.5 h-3.5 text-[#ff385c]" />
                </div>
                <div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">Role if Approved</p>
                  <p className="text-sm font-bold text-[#ff385c]">{inferredRole(v.doc_type)}</p>
                </div>
              </div>
            </div>
          </section>

          {/* Images */}
          <section>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Submitted Documents</p>
            <div className="grid grid-cols-2 gap-3">
              <DocImage
                src={v.front_image_url}
                label="Front of Document"
                onZoom={() => v.front_image_url && setZoomed({ src: v.front_image_url, label: 'Front of Document' })}
              />
              <DocImage
                src={v.back_image_url}
                label="Back of Document"
                onZoom={() => v.back_image_url && setZoomed({ src: v.back_image_url, label: 'Back of Document' })}
              />
            </div>
            <div className="mt-3 max-w-[50%]">
              <DocImage
                src={v.selfie_url}
                label="Selfie / Live Photo"
                onZoom={() => v.selfie_url && setZoomed({ src: v.selfie_url, label: 'Selfie / Live Photo' })}
              />
            </div>
          </section>

          {/* Rejection reason */}
          {v.status === 'rejected' && v.rejection_reason && (
            <section>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-3">Rejection Reason</p>
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 text-sm text-red-700">
                {v.rejection_reason}
              </div>
            </section>
          )}
        </div>

        {/* Action footer — only shown for pending */}
        {v.status === 'pending' && (
          <div className="px-6 py-4 border-t border-gray-100 flex gap-3">
            <button
              onClick={() => onReject(v.id)}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-bold hover:bg-red-50 transition-colors"
            >
              <ThumbsDown className="w-4 h-4" />
              Reject
            </button>
            <button
              onClick={() => onApprove(v.id)}
              disabled={isApproving}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-50 transition-colors"
            >
              <ThumbsUp className="w-4 h-4" />
              Approve
            </button>
          </div>
        )}
      </motion.aside>

      {/* Lightbox */}
      {zoomed && <Lightbox src={zoomed.src} label={zoomed.label} onClose={() => setZoomed(null)} />}
    </>
  );
};

const InfoRow: React.FC<{ icon: React.ElementType; label: string; value: string }> = ({ icon: Icon, label, value }) => (
  <div className="flex items-center gap-3">
    <div className="w-7 h-7 rounded-lg bg-white border border-gray-200 flex items-center justify-center shrink-0">
      <Icon className="w-3.5 h-3.5 text-gray-400" />
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wide">{label}</p>
      <p className="text-sm font-medium text-[#222222] truncate">{value}</p>
    </div>
  </div>
);

// ─── Main component ───────────────────────────────────────────────────────────
const StaffVerificationsTab: React.FC = () => {
  const [filter, setFilter] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [page, setPage]     = useState(1);
  const [selected, setSelected] = useState<IdVerification | null>(null);
  const [rejectTarget, setRejectTarget] = useState<string | null>(null);

  const { data, isLoading, isFetching } = useGetModerationVerificationsQuery(
    { page, limit: 15, status: filter },
  );
  const [approve, { isLoading: isApproving }] = useApproveVerificationMutation();
  const [reject]                              = useRejectVerificationMutation();

  const verifications = data?.verifications ?? [];
  const totalPages    = data?.pages ?? 1;

  const handleApprove = async (id: string) => {
    try {
      await approve(id).unwrap();
      toast.success('Verification approved');
      setSelected(null);
    } catch (e: any) {
      toast.error(e?.data?.message ?? 'Approval failed');
    }
  };

  const handleReject = async (notes?: string) => {
    if (!rejectTarget) return;
    try {
      await reject({ verificationId: rejectTarget, reason: notes || 'Documents do not meet requirements' }).unwrap();
      toast.success('Verification rejected');
      setSelected(null);
    } catch (e: any) {
      toast.error(e?.data?.message ?? 'Rejection failed');
    }
    setRejectTarget(null);
  };

  return (
    <>
      <div className="space-y-5 max-w-4xl">
        <SectionHeader title="ID Verifications" sub="Review role applications and identity documents" />

        {/* Status filter tabs */}
        <div className="flex gap-2">
          {(['pending', 'approved', 'rejected'] as const).map((f) => (
            <button
              key={f}
              onClick={() => { setFilter(f); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all capitalize ${
                filter === f
                  ? 'bg-[#111827] text-white border-[#111827]'
                  : 'bg-white text-[#6a6a6a] border-gray-200 hover:border-gray-400'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* List */}
        {(isLoading || isFetching) ? (
          <div className="grid gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : verifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-[#6a6a6a] gap-2 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <UserCheck className="w-8 h-8 opacity-20" />
            <p className="text-xs font-medium">No {filter} verifications</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {verifications.map((v) => {
              const name = v.user_full_name ?? v.user_display_name ?? v.user_email ?? 'Unknown';
              return (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 hover:border-gray-300 transition-colors"
                >
                  <div className="flex items-center justify-between gap-4">
                    {/* Left: avatar + info */}
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-11 h-11 rounded-xl bg-[#111827] flex items-center justify-center shrink-0">
                        {v.user_avatar_url ? (
                          <img src={v.user_avatar_url} alt={name} className="w-full h-full rounded-xl object-cover" />
                        ) : (
                          <span className="text-[#ff385c] font-bold text-lg">
                            {(name[0] ?? '?').toUpperCase()}
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[#222222] truncate">{name}</p>
                        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                          <span className="text-[10px] px-2 py-0.5 bg-[#ff385c]/10 text-[#ff385c] rounded-md font-bold capitalize">
                            → {inferredRole(v.doc_type)}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 bg-[#f3f4f6] text-[#6a6a6a] rounded-md font-semibold">
                            {DocLabel(v.doc_type)}
                          </span>
                          <span className="text-xs text-[#6a6a6a]">
                            {new Date(v.submitted_at).toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: status + actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <StatusPill status={v.status} />
                      <button
                        onClick={() => setSelected(v)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#111827] text-white text-xs font-bold hover:bg-[#ff385c] transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Review
                      </button>
                    </div>
                  </div>

                  {/* Quick actions for pending (also available in drawer) */}
                  {v.status === 'pending' && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                      <button
                        onClick={() => handleApprove(v.id)}
                        disabled={isApproving}
                        className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 px-3 py-1.5 bg-emerald-50 rounded-lg hover:bg-emerald-100 border border-emerald-100 transition-all disabled:opacity-50"
                      >
                        <ThumbsUp className="w-3.5 h-3.5" /> Approve
                      </button>
                      <button
                        onClick={() => setRejectTarget(v.id)}
                        className="flex items-center gap-1.5 text-xs font-bold text-red-600 px-3 py-1.5 bg-red-50 rounded-lg hover:bg-red-100 border border-red-100 transition-all"
                      >
                        <ThumbsDown className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}

                  {/* Rejection reason preview */}
                  {v.status === 'rejected' && v.rejection_reason && (
                    <p className="mt-3 pt-3 border-t border-gray-50 text-xs text-red-500 line-clamp-1">
                      Reason: {v.rejection_reason}
                    </p>
                  )}
                </motion.div>
              );
            })}
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Detail drawer */}
      <AnimatePresence>
        {selected && (
          <VerificationDrawer
            v={selected}
            onClose={() => setSelected(null)}
            onApprove={handleApprove}
            onReject={(id) => { setRejectTarget(id); }}
            isApproving={isApproving}
          />
        )}
      </AnimatePresence>

      {/* Reject confirm modal */}
      <ConfirmModal
        isOpen={!!rejectTarget}
        title="Reject Verification"
        message="Please provide a reason for rejecting this verification request."
        confirmLabel="Reject"
        confirmClass="bg-red-600 hover:bg-red-700"
        onConfirm={handleReject}
        onCancel={() => setRejectTarget(null)}
        showNotes
        notesPlaceholder="Reason for rejection…"
      />
    </>
  );
};

export default StaffVerificationsTab;

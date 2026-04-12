// frontend/src/pages/Dashboard/StaffDashboard.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, ShieldAlert, FileText, Star, Building2,
  Users, CheckCircle2, XCircle, AlertTriangle, Clock, Eye,
  Home, LogOut, Menu, Bell, Search, ChevronRight, Scale,
  MessageSquare, UserCheck, UserX, RefreshCw, Flag,
  ThumbsUp, ThumbsDown, ExternalLink, X, ChevronLeft,
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { clearCredentials, selectCurrentUser } from '../../features/Slice/AuthSlice';
import { useLogoutMutation } from '../../features/Api/AuthApi';
import {
  useGetModerationVerificationsQuery,
  useApproveVerificationMutation,
  useRejectVerificationMutation,
  useGetModerationDisputesQuery,
  useResolveDisputeMutation,
  useGetFraudReviewQueueQuery,
  usePublishReviewMutation,
  useRejectReviewMutation,
  useEscalateReviewMutation,
  useGetReportedMessagesQuery,
  useResolveMessageReportMutation,
  useRemoveReportedMessageMutation,
  useGetPropertiesNeedingAttentionQuery,
  useGetPendingListingsQuery,
  useApproveListingMutation,
  useRejectListingMutation,
  useGetAuditLogQuery,
  type IdVerification,
  type Dispute,
  type FraudReview,
  type ReportedMessage,
  type AuditEvent,
} from '../../features/Api/AdminApi';

// ─── Nav ─────────────────────────────────────────────────────────────────────
const NAV = [
  { id: 'overview',      label: 'Overview',          icon: LayoutDashboard },
  { id: 'verifications', label: 'ID Verifications',  icon: UserCheck },
  { id: 'listings',      label: 'Listing Review',    icon: Building2 },
  { id: 'reviews',       label: 'Review Queue',      icon: Star },
  { id: 'disputes',      label: 'Disputes',          icon: Scale },
  { id: 'messages',      label: 'Reported Messages', icon: MessageSquare },
  { id: 'users',         label: 'User Stats',        icon: Users },
  { id: 'audit',         label: 'Audit Log',         icon: FileText },
];

// ─── Fraud signal human labels (matches fraud_signal_enum) ───────────────────
const SIGNAL_LABELS: Record<string, string> = {
  velocity_multiple_reviews: 'Velocity — multiple reviews fast',
  ip_cluster:                'IP cluster detected',
  account_age_too_new:       'Account age < 7 days',
  no_verified_interaction:   'No verified booking/visit',
  text_duplicate:            'Duplicate review text ≥ 80%',
  rating_extreme_no_text:    'Extreme rating, no text',
  reciprocal_pattern:        'Reciprocal 5-star swap',
};

const SIGNAL_CONFIDENCE_COLOR: Record<string, string> = {
  low:    'bg-gray-50   text-gray-600   border-gray-200',
  medium: 'bg-amber-50  text-amber-700  border-amber-200',
  high:   'bg-red-50    text-red-700    border-red-200',
};

// ─── Audit event display map (matches audit_event_enum) ──────────────────────
const AUDIT_EVENT_STYLE: Record<string, { label: string; cls: string }> = {
  login:           { label: 'Login',           cls: 'bg-blue-50 text-blue-700' },
  logout:          { label: 'Logout',          cls: 'bg-gray-50 text-gray-600' },
  failed_login:    { label: 'Failed Login',    cls: 'bg-red-50 text-red-700' },
  password_change: { label: 'Password Change', cls: 'bg-amber-50 text-amber-700' },
  role_change:     { label: 'Role Change',     cls: 'bg-violet-50 text-violet-700' },
  listing_create:  { label: 'Listing Created', cls: 'bg-emerald-50 text-emerald-700' },
  listing_delete:  { label: 'Listing Deleted', cls: 'bg-orange-50 text-orange-700' },
  account_ban:     { label: 'Account Banned',  cls: 'bg-red-50 text-red-800' },
  data_export:     { label: 'Data Export',     cls: 'bg-violet-50 text-violet-700' },
};

// ─── Shared primitives ────────────────────────────────────────────────────────
const Badge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    pending:           'bg-amber-50  text-amber-700  border-amber-200',
    approved:          'bg-emerald-50 text-emerald-700 border-emerald-200',
    rejected:          'bg-red-50    text-red-700    border-red-200',
    expired:           'bg-gray-50   text-gray-500   border-gray-200',
    open:              'bg-red-50    text-red-700    border-red-200',
    under_review:      'bg-blue-50   text-blue-700   border-blue-200',
    resolved_guest:    'bg-emerald-50 text-emerald-700 border-emerald-200',
    resolved_host:     'bg-emerald-50 text-emerald-700 border-emerald-200',
    escalated:         'bg-violet-50 text-violet-700  border-violet-200',
    published:         'bg-emerald-50 text-emerald-700 border-emerald-200',
    held_for_moderation: 'bg-red-50  text-red-700    border-red-200',
    available:         'bg-emerald-50 text-emerald-700 border-emerald-200',
    active:            'bg-emerald-50 text-emerald-700 border-emerald-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-semibold border capitalize ${map[status] ?? 'bg-gray-50 text-gray-500 border-gray-200'}`}>
      {status.replace(/_/g, ' ')}
    </span>
  );
};

const AuditBadge = ({ event }: { event: string }) => {
  const e = AUDIT_EVENT_STYLE[event] ?? { label: event.replace(/_/g, ' '), cls: 'bg-gray-50 text-gray-600' };
  return <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold capitalize ${e.cls}`}>{e.label}</span>;
};

interface StatCardProps {
  label: string; value: string | number; sub?: string;
  icon: React.ElementType; accent: string; urgent?: boolean; loading?: boolean;
}
const StatCard: React.FC<StatCardProps> = ({ label, value, sub, icon: Icon, accent, urgent, loading }) => (
  <div className={`bg-white rounded-2xl p-5 border shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow ${urgent && Number(value) > 0 ? 'border-red-200' : 'border-gray-100'}`}>
    <div className="flex items-start justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent}`}>
        <Icon className="w-5 h-5" />
      </div>
      {urgent && Number(value) > 0 && (
        <span className="text-[10px] font-bold text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">Action needed</span>
      )}
    </div>
    {loading ? (
      <div className="space-y-2">
        <div className="h-7 w-20 bg-gray-100 rounded-lg animate-pulse" />
        <div className="h-3.5 w-28 bg-gray-100 rounded animate-pulse" />
      </div>
    ) : (
      <>
        <p className={`text-2xl font-bold tracking-tight ${urgent && Number(value) > 0 ? 'text-red-600' : 'text-[#222222]'}`}>{value}</p>
        <p className="text-xs text-[#6a6a6a] mt-0.5">{label}</p>
        {sub && <p className="text-[11px] text-[#6a6a6a] mt-1 font-medium">{sub}</p>}
      </>
    )}
  </div>
);

const SectionHeader: React.FC<{ title: string; sub?: string; action?: React.ReactNode }> = ({ title, sub, action }) => (
  <div className="flex items-center justify-between mb-5">
    <div>
      <h2 className="text-base font-bold text-[#222222] tracking-tight">{title}</h2>
      {sub && <p className="text-xs text-[#6a6a6a] mt-0.5">{sub}</p>}
    </div>
    {action}
  </div>
);

// Confirmation modal for destructive actions
interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  confirmClass: string;
  onConfirm: (notes?: string) => void;
  onCancel: () => void;
  showNotes?: boolean;
  notesPlaceholder?: string;
}
const ConfirmModal: React.FC<ConfirmModalProps> = ({ isOpen, title, message, confirmLabel, confirmClass, onConfirm, onCancel, showNotes, notesPlaceholder }) => {
  const [notes, setNotes] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl w-full max-w-sm shadow-2xl border border-gray-100 p-6">
        <h3 className="font-bold text-[#222222] mb-2">{title}</h3>
        <p className="text-sm text-[#6a6a6a] mb-4">{message}</p>
        {showNotes && (
          <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder={notesPlaceholder ?? 'Add notes…'}
            rows={3}
            className="w-full text-sm text-[#222222] bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-[#ff385c]/30 resize-none mb-4" />
        )}
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-[#6a6a6a] hover:bg-gray-50 transition-colors">
            Cancel
          </button>
          <button onClick={() => { onConfirm(notes); setNotes(''); }}
            className={`flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-colors ${confirmClass}`}>
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── OVERVIEW TAB ─────────────────────────────────────────────────────────────
const OverviewTab: React.FC<{
  pendingVerif: number; openDisputes: number; heldReviews: number;
  pendingListings: number; loading: boolean; setActiveTab: (t: string) => void;
}> = ({ pendingVerif, openDisputes, heldReviews, pendingListings, loading, setActiveTab }) => {
  const statCards: StatCardProps[] = [
    { label: 'Pending ID Verifications', value: pendingVerif,    sub: 'Role applications + ID checks',      icon: UserCheck, accent: 'bg-blue-50 text-blue-600',    urgent: true },
    { label: 'Listings Pending Review',  value: pendingListings, sub: 'New listings awaiting approval',      icon: Building2, accent: 'bg-violet-50 text-violet-600', urgent: true },
    { label: 'Open Disputes',            value: openDisputes,    sub: 'short_stay_disputes — status: open', icon: Scale,     accent: 'bg-red-50 text-red-600',       urgent: true },
    { label: 'Reviews Held',             value: heldReviews,     sub: 'Fraud-flagged reviews to moderate',  icon: Flag,      accent: 'bg-amber-50 text-amber-600',   urgent: true },
  ];

  const pendingActions = [
    { label: 'Role Applications / ID Verifications', count: pendingVerif,    tab: 'verifications', color: 'text-blue-700 bg-blue-50 border-blue-200' },
    { label: 'Listings Pending Approval',            count: pendingListings,  tab: 'listings',      color: 'text-violet-700 bg-violet-50 border-violet-200' },
    { label: 'Open Disputes',                        count: openDisputes,    tab: 'disputes',      color: 'text-red-700 bg-red-50 border-red-200' },
    { label: 'Reviews Held for Moderation',          count: heldReviews,    tab: 'reviews',       color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { label: 'Reported Messages',                    count: 0,              tab: 'messages',      color: 'text-amber-700 bg-amber-50 border-amber-200' },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden bg-[#111827] rounded-2xl p-7">
        <div className="relative z-10">
          <p className="text-white/40 text-xs font-semibold uppercase tracking-widest mb-1">Staff · Moderator</p>
          <h2 className="text-2xl font-bold text-white mb-1">Moderation Dashboard</h2>
          <p className="text-white/60 text-sm max-w-xl">Review listings, verify identities, resolve disputes, and keep the platform safe.</p>
          <div className="flex gap-3 mt-5 flex-wrap">
            <button onClick={() => setActiveTab('verifications')}
              className="inline-flex items-center gap-2 bg-[#ff385c] text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-[#e00b41] transition-all shadow-lg shadow-[#ff385c]/30">
              <UserCheck className="w-4 h-4" /> Review IDs
            </button>
            <button onClick={() => setActiveTab('disputes')}
              className="inline-flex items-center gap-2 bg-white/10 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-white/20 transition-all">
              <Scale className="w-4 h-4" /> Open Disputes
            </button>
          </div>
        </div>
        <div className="absolute -right-8 -top-8 w-48 h-48 bg-[#ff385c]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-6 -bottom-6 w-36 h-36 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      </motion.div>

      {/* KPI grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <StatCard {...c} loading={loading} />
          </motion.div>
        ))}
      </div>

      {/* Moderation queue + review stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
          <SectionHeader title="Moderation Queue" sub="Items requiring your action" />
          <div className="space-y-1">
            {pendingActions.map(a => (
              <button key={a.label} onClick={() => setActiveTab(a.tab)}
                className="w-full flex items-center justify-between py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors group">
                <span className="text-sm font-medium text-[#222222]">{a.label}</span>
                <div className="flex items-center gap-2">
                  {a.count > 0
                    ? <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${a.color}`}>{a.count}</span>
                    : <span className="text-xs text-[#6a6a6a]">None</span>
                  }
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#222222] transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Quick action shortcuts */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
          <SectionHeader title="Quick Actions" sub="Jump to moderation tasks" />
          <div className="space-y-2">
            {[
              { label: 'Review role applications & ID documents', tab: 'verifications', count: pendingVerif,    accent: 'text-blue-600',   bg: 'bg-blue-50 border-blue-100'   },
              { label: 'Approve / reject listings',               tab: 'listings',      count: pendingListings, accent: 'text-violet-600', bg: 'bg-violet-50 border-violet-100'},
              { label: 'Resolve open disputes',                   tab: 'disputes',      count: openDisputes,    accent: 'text-red-600',    bg: 'bg-red-50 border-red-100'     },
              { label: 'Moderate held reviews',                   tab: 'reviews',       count: heldReviews,     accent: 'text-amber-600',  bg: 'bg-amber-50 border-amber-100' },
              { label: 'Review reported messages',                tab: 'messages',      count: 0,               accent: 'text-emerald-600',bg: 'bg-emerald-50 border-emerald-100'},
            ].map(a => (
              <button key={a.tab} onClick={() => setActiveTab(a.tab)}
                className="w-full flex items-center justify-between py-2.5 px-3 rounded-xl hover:bg-gray-50 transition-colors group border border-transparent hover:border-gray-100">
                <span className="text-sm font-medium text-[#222222]">{a.label}</span>
                <div className="flex items-center gap-2">
                  {a.count > 0 && (
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${a.bg} ${a.accent}`}>{a.count}</span>
                  )}
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#222222] transition-colors" />
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── ID VERIFICATIONS TAB (id_verifications table) ────────────────────────────
const VerificationsTab: React.FC = () => {
  const [filter, setFilter] = useState<'pending'|'approved'|'rejected'>('pending');
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ type: 'approve'|'reject'; id: string } | null>(null);

  const { data, isLoading, isFetching } = useGetModerationVerificationsQuery({ page, limit: 15, status: filter });
  const [approve, { isLoading: approving }] = useApproveVerificationMutation();
  const [reject,  { isLoading: rejecting  }] = useRejectVerificationMutation();

  const verifications: IdVerification[] = data?.verifications ?? [];
  const totalPages = data?.pages ?? 1;

  const handleApprove = async (id: string) => {
    try {
      await approve(id).unwrap();
      toast.success('Verification approved — user role marked verified');
    } catch (e: any) {
      toast.error(e?.data?.message ?? 'Approval failed');
    }
  };

  const handleReject = async (id: string, reason: string) => {
    if (!reason.trim()) { toast.error('Please provide a rejection reason'); return; }
    try {
      await reject({ verificationId: id, reason }).unwrap();
      toast.success('Verification rejected');
      setConfirm(null);
    } catch (e: any) {
      toast.error(e?.data?.message ?? 'Rejection failed');
    }
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="ID Verifications" sub="id_verifications table — doc_type: national_id, passport, company_cert, earb_license, nca_cert" />

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
          <CheckCircle2 className="w-8 h-8 opacity-20" />
          <p className="text-xs font-medium">No {filter} verifications</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {verifications.map((v) => (
            <motion.div key={v.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#111827] flex items-center justify-center shrink-0">
                    <span className="text-[#ff385c] font-bold text-lg">
                      {(v.user_full_name?.[0] ?? v.user_email?.[0] ?? '?').toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#222222]">{v.user_full_name ?? v.user_email ?? v.user_id}</p>
                    <p className="text-xs text-[#6a6a6a] mt-0.5">
                      <span className="font-medium capitalize">{v.doc_type.replace(/_/g, ' ')}</span>
                      {v.doc_number ? ` · #${v.doc_number}` : ''}
                      {' · '}Submitted {new Date(v.submitted_at).toLocaleDateString('en-KE')}
                    </p>
                    {v.status === 'rejected' && v.rejection_reason && (
                      <p className="text-xs text-red-600 mt-0.5 font-medium">Reason: {v.rejection_reason}</p>
                    )}
                    {v.expires_at && (
                      <p className="text-[11px] text-[#6a6a6a] mt-0.5">Expires: {new Date(v.expires_at).toLocaleDateString('en-KE')}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <Badge status={v.status} />
                  {(v.front_image_url || v.selfie_url) && (
                    <a href={v.front_image_url ?? v.selfie_url!} target="_blank" rel="noreferrer"
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-50 border border-gray-200 text-[#6a6a6a] hover:text-[#222222] transition-colors"
                      title="View document">
                      <Eye className="w-3.5 h-3.5" />
                    </a>
                  )}
                </div>
              </div>
              {v.status === 'pending' && (
                <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50">
                  <button onClick={() => handleApprove(v.id)} disabled={approving}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 px-3 py-1.5 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-all border border-emerald-100 disabled:opacity-50">
                    <ThumbsUp className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button onClick={() => setConfirm({ type: 'reject', id: v.id })} disabled={rejecting}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-600 px-3 py-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-all border border-red-100 disabled:opacity-50">
                    <ThumbsDown className="w-3.5 h-3.5" /> Reject
                  </button>
                  {v.front_image_url && (
                    <a href={v.front_image_url} target="_blank" rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-600 px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all border border-blue-100">
                      <ExternalLink className="w-3.5 h-3.5" /> View Doc
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="flex items-center gap-1 text-xs font-bold text-[#6a6a6a] hover:text-[#222222] disabled:opacity-40 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-xs text-[#6a6a6a]">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="flex items-center gap-1 text-xs font-bold text-[#6a6a6a] hover:text-[#222222] disabled:opacity-40 transition-colors">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={confirm?.type === 'reject'}
        title="Reject Verification"
        message="This will set the verification status to 'rejected'. The user will be notified."
        confirmLabel="Reject"
        confirmClass="bg-red-600 hover:bg-red-700"
        showNotes
        notesPlaceholder="Reason for rejection (required)…"
        onConfirm={(notes) => confirm && handleReject(confirm.id, notes ?? '')}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};

// ─── LISTING REVIEW TAB — shows pending_review + attention listings ───────────
const ListingsTab: React.FC = () => {
  const [page, setPage] = useState(1);
  const [tab, setTab] = useState<'pending' | 'flagged'>('pending');
  const [confirm, setConfirm] = useState<{ type: 'approve'|'reject'; id: string } | null>(null);

  const { data: pendingData, isLoading: pendingLoading, isFetching: pendingFetching } =
    useGetPendingListingsQuery({ page, limit: 15 });
  const { data: flaggedData, isLoading: flaggedLoading, isFetching: flaggedFetching } =
    useGetPropertiesNeedingAttentionQuery({ page, limit: 15 });

  const [approveListing, { isLoading: approving }] = useApproveListingMutation();
  const [rejectListing,  { isLoading: rejecting  }] = useRejectListingMutation();

  const listings: any[]  = tab === 'pending' ? (pendingData?.listings ?? []) : (flaggedData?.listings ?? []);
  const totalPages: number = tab === 'pending' ? (pendingData?.pages ?? 1) : (flaggedData?.pages ?? 1);
  const isLoading  = tab === 'pending' ? pendingLoading  : flaggedLoading;
  const isFetching = tab === 'pending' ? pendingFetching : flaggedFetching;
  const pendingCount = pendingData?.total ?? 0;

  const handleApprove = async (id: string) => {
    try {
      await approveListing(id).unwrap();
      toast.success('Listing approved — it is now live');
    } catch (e: any) {
      toast.error(e?.data?.message ?? 'Failed');
    }
  };

  const handleReject = async (id: string, reason: string) => {
    if (!reason.trim()) { toast.error('Provide a rejection reason'); return; }
    try {
      await rejectListing({ propertyId: id, reason }).unwrap();
      toast.success('Listing rejected — owner will be notified');
      setConfirm(null);
    } catch (e: any) {
      toast.error(e?.data?.message ?? 'Failed');
    }
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader
        title="Listing Approvals"
        sub="Review and approve new property listings before they go live"
      />

      {/* Tab switcher */}
      <div className="flex gap-2">
        {[
          { key: 'pending' as const, label: 'Pending Review', count: pendingData?.total },
          { key: 'flagged' as const, label: 'Flagged / Attention', count: flaggedData?.total },
        ].map(t => (
          <button key={t.key} onClick={() => { setTab(t.key); setPage(1); }}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold border transition-all ${
              tab === t.key ? 'bg-[#111827] text-white border-[#111827]' : 'bg-white text-[#6a6a6a] border-gray-200 hover:border-gray-400'
            }`}>
            {t.label}
            {(t.count ?? 0) > 0 && (
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold min-w-[18px] text-center ${
                tab === t.key ? 'bg-white text-[#111827]' : 'bg-[#ff385c] text-white'
              }`}>{t.count}</span>
            )}
          </button>
        ))}
      </div>

      {/* Info banner for pending tab */}
      {tab === 'pending' && pendingCount > 0 && (
        <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-700">
            <strong>{pendingCount} listing{pendingCount > 1 ? 's' : ''}</strong> {pendingCount > 1 ? 'are' : 'is'} waiting for staff review.
            Listings remain hidden from seekers until approved.
          </p>
        </div>
      )}

      {(isLoading || isFetching) ? (
        <div className="grid gap-3">{[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : listings.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-[#6a6a6a] gap-2 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <CheckCircle2 className="w-8 h-8 opacity-20" />
          <p className="text-xs font-medium">
            {tab === 'pending' ? 'No listings pending review — all clear!' : 'No flagged listings'}
          </p>
        </div>
      ) : (
        <div className="grid gap-3">
          {listings.map((p: any) => (
            <div key={p.id} className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                  {/* Cover image or fallback */}
                  <div className="w-14 h-14 rounded-xl bg-violet-50 overflow-hidden shrink-0">
                    {(p.media?.[0]?.url ?? p.cover_image_url)
                      ? <img src={p.media?.[0]?.url ?? p.cover_image_url} className="w-full h-full object-cover" alt="" />
                      : <Building2 className="w-6 h-6 text-violet-400 m-auto mt-3" />
                    }
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="font-semibold text-[#222222] truncate">{p.title}</p>
                    </div>
                    <p className="text-xs text-[#6a6a6a]">
                      <span className="capitalize font-medium">{p.listing_category?.replace(/_/g, ' ')}</span>
                      {' · '}<span className="capitalize">{p.listing_type?.replace(/_/g, ' ')}</span>
                      {(p.location?.county ?? p.county) ? ` · ${p.location?.county ?? p.county}` : ''}
                    </p>
                    {/* Owner info */}
                    {(p.owner_name ?? p.owner_email) && (
                      <p className="text-[11px] text-[#6a6a6a] mt-0.5 flex items-center gap-1">
                        <UserCheck className="w-3 h-3" />
                        Listed by <span className="font-semibold text-[#222222] ml-0.5">{p.owner_name ?? p.owner_email}</span>
                        {p.owner_role && <span className="capitalize ml-1 px-1.5 py-0.5 bg-violet-50 text-violet-700 rounded-full text-[10px] font-bold">{p.owner_role}</span>}
                      </p>
                    )}
                    {/* Submitted date */}
                    {p.created_at && (
                      <p className="text-[11px] text-[#6a6a6a] mt-0.5">
                        Submitted {new Date(p.created_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    )}
                    {p.flag_reason && (
                      <p className="text-xs font-medium text-amber-600 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 shrink-0" /> {p.flag_reason}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <Badge status={p.status ?? 'pending_review'} />
                  {p.pricing?.monthly_rent && (
                    <span className="text-xs font-bold text-[#ff385c]">
                      KES {p.pricing.monthly_rent.toLocaleString()}/mo
                    </span>
                  )}
                  {p.pricing?.asking_price && !p.pricing?.monthly_rent && (
                    <span className="text-xs font-bold text-[#ff385c]">
                      KES {p.pricing.asking_price.toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-50 flex-wrap">
                <button onClick={() => handleApprove(p.id)} disabled={approving}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 px-4 py-2 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-all border border-emerald-100 disabled:opacity-50">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Approve & Publish
                </button>
                <button onClick={() => setConfirm({ type: 'reject', id: p.id })} disabled={rejecting}
                  className="flex items-center gap-1.5 text-xs font-bold text-red-600 px-4 py-2 bg-red-50 rounded-lg hover:bg-red-100 transition-all border border-red-100 disabled:opacity-50">
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
                <a href={`/property/${p.id}`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs font-bold text-blue-600 px-4 py-2 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all border border-blue-100 ml-auto">
                  <ExternalLink className="w-3.5 h-3.5" /> Preview
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="flex items-center gap-1 text-xs font-bold text-[#6a6a6a] hover:text-[#222222] disabled:opacity-40 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-xs text-[#6a6a6a]">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="flex items-center gap-1 text-xs font-bold text-[#6a6a6a] hover:text-[#222222] disabled:opacity-40 transition-colors">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={confirm?.type === 'reject'}
        title="Reject Listing"
        message="This listing will be marked as off_market and the owner notified."
        confirmLabel="Reject Listing"
        confirmClass="bg-red-600 hover:bg-red-700"
        showNotes notesPlaceholder="Reason for rejection…"
        onConfirm={(notes) => confirm && handleReject(confirm.id, notes ?? '')}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};

// ─── REVIEW QUEUE TAB (unified_reviews + review_fraud_signals) ────────────────
const ReviewsTab: React.FC = () => {
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ type: 'reject'|'escalate'; id: string } | null>(null);
  const { data, isLoading, isFetching } = useGetFraudReviewQueueQuery({ page, limit: 15 });
  const [publishReview,  { isLoading: publishing  }] = usePublishReviewMutation();
  const [rejectReview,   { isLoading: rejecting   }] = useRejectReviewMutation();
  const [escalateReview, { isLoading: escalating  }] = useEscalateReviewMutation();

  const reviews: FraudReview[] = data?.reviews ?? [];
  const totalPages = data?.pages ?? 1;

  const handlePublish = async (id: string) => {
    try { await publishReview(id).unwrap(); toast.success('Review published'); }
    catch (e: any) { toast.error(e?.data?.message ?? 'Failed'); }
  };

  const handleReject = async (id: string, notes: string) => {
    try { await rejectReview({ reviewId: id, notes }).unwrap(); toast.success('Review rejected'); setConfirm(null); }
    catch (e: any) { toast.error(e?.data?.message ?? 'Failed'); }
  };

  const handleEscalate = async (id: string, notes: string) => {
    try { await escalateReview({ reviewId: id, notes }).unwrap(); toast.success('Escalated to super_admin'); setConfirm(null); }
    catch (e: any) { toast.error(e?.data?.message ?? 'Failed'); }
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="Fraud Review Queue"
        sub="unified_reviews WHERE status = 'held_for_moderation' + review_fraud_signals" />

      {(isLoading || isFetching) ? (
        <div className="grid gap-3">{[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-[#6a6a6a] gap-2 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Star className="w-8 h-8 opacity-20" />
          <p className="text-xs font-medium">No reviews in fraud queue</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-sm text-[#222222]">{r.reviewer_email ?? r.reviewer_id.slice(0, 8)}</span>
                    {r.property_title && <span className="text-[11px] text-[#6a6a6a]">→ {r.property_title}</span>}
                    <span className="text-[11px] font-bold text-amber-600">★ {r.rating_overall}/5</span>
                    <span className="text-[11px] text-[#6a6a6a] capitalize">{r.review_type.replace(/_/g, ' ')}</span>
                  </div>
                  {r.review_text
                    ? <p className="text-sm text-[#6a6a6a] italic bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">"{r.review_text}"</p>
                    : <p className="text-xs text-red-600 font-medium">⚠ No review text (extreme rating without explanation)</p>
                  }
                </div>
                <span className="text-[11px] text-[#6a6a6a] shrink-0">{new Date(r.submitted_at).toLocaleDateString('en-KE')}</span>
              </div>

              {/* Fraud signals from review_fraud_signals table */}
              {r.fraud_signals.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {r.fraud_signals.map((sig) => (
                    <span key={sig.id} title={sig.detail ?? ''}
                      className={`text-[10px] font-bold px-2 py-0.5 border rounded-full ${SIGNAL_CONFIDENCE_COLOR[sig.confidence]}`}>
                      {SIGNAL_LABELS[sig.signal] ?? sig.signal.replace(/_/g, ' ')} ({sig.confidence})
                    </span>
                  ))}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-50">
                <button onClick={() => handlePublish(r.id)} disabled={publishing}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 px-3 py-1.5 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-all border border-emerald-100 disabled:opacity-50">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Publish
                </button>
                <button onClick={() => setConfirm({ type: 'reject', id: r.id })} disabled={rejecting}
                  className="flex items-center gap-1.5 text-xs font-bold text-red-600 px-3 py-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-all border border-red-100 disabled:opacity-50">
                  <XCircle className="w-3.5 h-3.5" /> Reject
                </button>
                <button onClick={() => setConfirm({ type: 'escalate', id: r.id })} disabled={escalating}
                  className="flex items-center gap-1.5 text-xs font-bold text-violet-600 px-3 py-1.5 bg-violet-50 rounded-lg hover:bg-violet-100 transition-all border border-violet-100 disabled:opacity-50">
                  <Flag className="w-3.5 h-3.5" /> Escalate
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="flex items-center gap-1 text-xs font-bold text-[#6a6a6a] hover:text-[#222222] disabled:opacity-40 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-xs text-[#6a6a6a]">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="flex items-center gap-1 text-xs font-bold text-[#6a6a6a] hover:text-[#222222] disabled:opacity-40 transition-colors">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={confirm?.type === 'reject'}
        title="Reject Review"
        message="This review will be set to 'rejected' and removed from the public listing page."
        confirmLabel="Reject Review"
        confirmClass="bg-red-600 hover:bg-red-700"
        showNotes notesPlaceholder="Moderation notes (required)…"
        onConfirm={(notes) => confirm && handleReject(confirm.id, notes ?? '')}
        onCancel={() => setConfirm(null)}
      />
      <ConfirmModal
        isOpen={confirm?.type === 'escalate'}
        title="Escalate to Super Admin"
        message="This review requires super_admin attention (e.g. potential ban, legal issue)."
        confirmLabel="Escalate"
        confirmClass="bg-violet-600 hover:bg-violet-700"
        showNotes notesPlaceholder="Describe why you are escalating…"
        onConfirm={(notes) => confirm && handleEscalate(confirm.id, notes ?? '')}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
};

// ─── DISPUTES TAB (short_stay_disputes table) ─────────────────────────────────
const DisputesTab: React.FC = () => {
  const [statusFilter, setStatusFilter] = useState<'open'|'under_review'|'all'>('open');
  const [page, setPage] = useState(1);
  const [confirm, setConfirm] = useState<{ disputeId: string; resolution: 'resolved_guest'|'resolved_host'|'escalated' } | null>(null);
  const { data, isLoading, isFetching } = useGetModerationDisputesQuery({
    page, limit: 15, status: statusFilter === 'all' ? undefined : statusFilter,
  });
  const [resolveDispute, { isLoading: resolving }] = useResolveDisputeMutation();

  const disputes: Dispute[] = data?.disputes ?? [];
  const totalPages = data?.pages ?? 1;

  const handleResolve = async (notes: string) => {
    if (!confirm) return;
    if (!notes.trim()) { toast.error('Resolution notes required'); return; }
    try {
      await resolveDispute({ disputeId: confirm.disputeId, resolution: confirm.resolution, resolution_notes: notes }).unwrap();
      toast.success(`Dispute ${confirm.resolution.replace('_', ' ')}`);
      setConfirm(null);
    } catch (e: any) {
      toast.error(e?.data?.message ?? 'Failed');
    }
  };

  const resolutionLabel = confirm?.resolution === 'resolved_guest' ? 'Resolve for Guest' :
                          confirm?.resolution === 'resolved_host'  ? 'Resolve for Host' : 'Escalate';
  const resolutionClass = confirm?.resolution === 'escalated'
    ? 'bg-violet-600 hover:bg-violet-700'
    : 'bg-emerald-600 hover:bg-emerald-700';

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="Disputes" sub="short_stay_disputes table — guest vs host conflict resolution" />

      <div className="flex gap-2">
        {(['open', 'under_review', 'all'] as const).map(f => (
          <button key={f} onClick={() => { setStatusFilter(f); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold border transition-all capitalize ${
              statusFilter === f ? 'bg-[#111827] text-white border-[#111827]' : 'bg-white text-[#6a6a6a] border-gray-200 hover:border-gray-400'
            }`}>{f.replace('_', ' ')}</button>
        ))}
      </div>

      {(isLoading || isFetching) ? (
        <div className="grid gap-3">{[...Array(3)].map((_, i) => <div key={i} className="h-28 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : disputes.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-[#6a6a6a] gap-2 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <Scale className="w-8 h-8 opacity-20" />
          <p className="text-xs font-medium">No {statusFilter === 'all' ? '' : statusFilter} disputes</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {disputes.map((d) => (
            <div key={d.id} className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${d.status === 'open' ? 'bg-red-50' : 'bg-blue-50'}`}>
                    <Scale className={`w-5 h-5 ${d.status === 'open' ? 'text-red-600' : 'text-blue-600'}`} />
                  </div>
                  <div>
                    <p className="font-semibold text-[#222222]">{d.reason}</p>
                    <p className="text-xs text-[#6a6a6a] mt-0.5">
                      Raised by <span className="font-medium capitalize">{d.raised_by_role}</span>
                      {d.booking_ref ? ` · Booking ${d.booking_ref}` : ''}
                      {' · '}{new Date(d.raised_at).toLocaleDateString('en-KE')}
                    </p>
                    {d.description && <p className="text-xs text-[#6a6a6a] mt-1 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100">{d.description}</p>}
                    {d.refund_amount_kes && (
                      <p className="text-xs font-bold text-[#ff385c] mt-1">KES {d.refund_amount_kes.toLocaleString()} in dispute</p>
                    )}
                    {d.evidence_urls && d.evidence_urls.length > 0 && (
                      <div className="flex gap-2 mt-1 flex-wrap">
                        {d.evidence_urls.map((url, i) => (
                          <a key={i} href={url} target="_blank" rel="noreferrer"
                            className="text-[10px] text-blue-600 underline">Evidence {i + 1}</a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <Badge status={d.status} />
              </div>
              {(d.status === 'open' || d.status === 'under_review') && (
                <div className="flex gap-2 pt-3 border-t border-gray-50">
                  <button onClick={() => setConfirm({ disputeId: d.id, resolution: 'resolved_guest' })} disabled={resolving}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 px-3 py-1.5 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-all border border-emerald-100 disabled:opacity-50">
                    <ThumbsUp className="w-3.5 h-3.5" /> Guest Wins
                  </button>
                  <button onClick={() => setConfirm({ disputeId: d.id, resolution: 'resolved_host' })} disabled={resolving}
                    className="flex items-center gap-1.5 text-xs font-bold text-blue-600 px-3 py-1.5 bg-blue-50 rounded-lg hover:bg-blue-100 transition-all border border-blue-100 disabled:opacity-50">
                    <ThumbsDown className="w-3.5 h-3.5" /> Host Wins
                  </button>
                  <button onClick={() => setConfirm({ disputeId: d.id, resolution: 'escalated' })} disabled={resolving}
                    className="flex items-center gap-1.5 text-xs font-bold text-violet-600 px-3 py-1.5 bg-violet-50 rounded-lg hover:bg-violet-100 transition-all border border-violet-100 disabled:opacity-50">
                    <Flag className="w-3.5 h-3.5" /> Escalate
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="flex items-center gap-1 text-xs font-bold text-[#6a6a6a] hover:text-[#222222] disabled:opacity-40 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-xs text-[#6a6a6a]">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="flex items-center gap-1 text-xs font-bold text-[#6a6a6a] hover:text-[#222222] disabled:opacity-40 transition-colors">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {confirm && (
        <ConfirmModal
          isOpen={true}
          title={resolutionLabel}
          message={`This will set the dispute status to '${confirm.resolution.replace(/_/g, ' ')}' and notify both parties.`}
          confirmLabel={resolutionLabel}
          confirmClass={resolutionClass}
          showNotes notesPlaceholder="Resolution notes (required — sent to both parties)…"
          onConfirm={handleResolve}
          onCancel={() => setConfirm(null)}
        />
      )}
    </div>
  );
};

// ─── REPORTED MESSAGES TAB (message_reports table) ────────────────────────────
const MessagesTab: React.FC = () => {
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useGetReportedMessagesQuery({ page, limit: 15 });
  const [resolve,       { isLoading: resolving }] = useResolveMessageReportMutation();
  const [removeMessage, { isLoading: removing  }] = useRemoveReportedMessageMutation();

  const reports: ReportedMessage[] = data?.reports ?? [];
  const totalPages = data?.pages ?? 1;

  const handleResolve = async (id: string) => {
    try { await resolve(id).unwrap(); toast.success('Report marked reviewed'); }
    catch (e: any) { toast.error(e?.data?.message ?? 'Failed'); }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm('Remove the reported message? This sets is_deleted = true on the messages table.')) return;
    try { await removeMessage(id).unwrap(); toast.success('Message removed'); }
    catch (e: any) { toast.error(e?.data?.message ?? 'Failed'); }
  };

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="Reported Messages" sub="message_reports JOIN messages — spam, harassment, abuse reports" />

      {(isLoading || isFetching) ? (
        <div className="grid gap-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />)}</div>
      ) : reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-32 text-[#6a6a6a] gap-2 bg-gray-50 rounded-xl border border-dashed border-gray-200">
          <MessageSquare className="w-8 h-8 opacity-20" />
          <p className="text-xs font-medium">No reported messages</p>
        </div>
      ) : (
        <div className="grid gap-3">
          {reports.map((r) => (
            <div key={r.id} className="bg-white rounded-xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-semibold text-sm text-[#222222]">{r.reason}</p>
                  <p className="text-xs text-[#6a6a6a] mt-0.5">
                    Reporter: {r.reporter_email ?? r.reported_by.slice(0, 8)}
                    {r.sender_email ? ` · Sender: ${r.sender_email}` : ''}
                    {' · '}{new Date(r.created_at).toLocaleDateString('en-KE')}
                  </p>
                  {r.message_body && (
                    <p className="text-xs text-[#6a6a6a] mt-2 italic bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 line-clamp-3">
                      "{r.message_body}"
                    </p>
                  )}
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${r.reviewed ? 'bg-gray-50 text-gray-500 border-gray-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                  {r.reviewed ? 'Reviewed' : 'Pending'}
                </span>
              </div>
              {!r.reviewed && (
                <div className="flex gap-2 pt-3 border-t border-gray-50">
                  <button onClick={() => handleResolve(r.id)} disabled={resolving}
                    className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 px-3 py-1.5 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-all border border-emerald-100 disabled:opacity-50">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Mark Reviewed
                  </button>
                  <button onClick={() => handleRemove(r.id)} disabled={removing}
                    className="flex items-center gap-1.5 text-xs font-bold text-red-600 px-3 py-1.5 bg-red-50 rounded-lg hover:bg-red-100 transition-all border border-red-100 disabled:opacity-50">
                    <XCircle className="w-3.5 h-3.5" /> Remove Message
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="flex items-center gap-1 text-xs font-bold text-[#6a6a6a] hover:text-[#222222] disabled:opacity-40 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-xs text-[#6a6a6a]">Page {page} of {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="flex items-center gap-1 text-xs font-bold text-[#6a6a6a] hover:text-[#222222] disabled:opacity-40 transition-colors">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// ─── USER STATS TAB ───────────────────────────────────────────────────────────
// Platform-wide stats (admin/users/stats, admin/properties/stats) require
// admin or super_admin — staff only has moderation-scope access.
// Show the moderation work summary that IS accessible.
const UsersTab: React.FC = () => {
  const { data: verifData, isLoading: vLoad } = useGetModerationVerificationsQuery({ page: 1, limit: 5, status: 'pending' });
  const { data: dispData,  isLoading: dLoad } = useGetModerationDisputesQuery({ page: 1, limit: 5, status: 'open' });
  const { data: reviewData,isLoading: rLoad } = useGetFraudReviewQueueQuery({ page: 1, limit: 5 });

  const loading = vLoad || dLoad || rLoad;

  const summary = [
    { label: 'Pending ID Verifications', value: verifData?.total  ?? 0, color: 'text-blue-600',   note: 'Awaiting document review' },
    { label: 'Open Disputes',            value: dispData?.total   ?? 0, color: 'text-red-600',    note: 'Require resolution' },
    { label: 'Reviews in Moderation',    value: reviewData?.total ?? 0, color: 'text-amber-600',  note: 'Held for fraud review' },
    { label: 'Total Moderation Items',   value: (verifData?.total ?? 0) + (dispData?.total ?? 0) + (reviewData?.total ?? 0),
      color: 'text-[#ff385c]', note: 'Across all queues' },
  ];

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="Moderation Summary" sub="Live counts from moderation queues accessible to staff" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {summary.map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5 text-center">
            {loading ? (
              <div className="space-y-2">
                <div className="h-7 w-16 bg-gray-100 rounded-lg animate-pulse mx-auto" />
                <div className="h-3 w-24 bg-gray-100 rounded animate-pulse mx-auto" />
              </div>
            ) : (
              <>
                <p className={`text-2xl font-bold tracking-tight ${s.color}`}>{s.value.toLocaleString()}</p>
                <p className="text-xs text-[#6a6a6a] mt-1 font-medium">{s.label}</p>
                <p className="text-[10px] text-[#6a6a6a] mt-0.5">{s.note}</p>
              </>
            )}
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-5">
        <p className="text-sm text-[#6a6a6a]">
          Platform-wide user and property statistics require <span className="font-semibold text-[#222222]">admin</span> access.
          Your moderation queue totals are shown above. Use the sidebar tabs to action each queue.
        </p>
      </div>
    </div>
  );
};

// ─── AUDIT LOG TAB (security_audit_log table) ─────────────────────────────────
const AuditTab: React.FC = () => {
  const [eventFilter, setEventFilter] = useState('');
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching } = useGetAuditLogQuery({
    page, limit: 20,
    event_type: eventFilter || undefined,
  });

  const events: AuditEvent[] = data?.events ?? [];
  const totalPages = data?.pages ?? 1;
  const eventTypes = ['', 'login', 'logout', 'failed_login', 'password_change', 'role_change', 'listing_create', 'listing_delete', 'account_ban', 'data_export'];

  return (
    <div className="space-y-5 max-w-7xl">
      <SectionHeader title="Security Audit Log"
        sub="security_audit_log table — sequential BIGSERIAL, never deleted, tamper-evident" />

      <div className="flex gap-2 flex-wrap">
        {eventTypes.map(e => (
          <button key={e || 'all'} onClick={() => { setEventFilter(e); setPage(1); }}
            className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all capitalize ${
              eventFilter === e ? 'bg-[#111827] text-white border-[#111827]' : 'bg-white text-[#6a6a6a] border-gray-200 hover:border-gray-400'
            }`}>{e ? e.replace(/_/g, ' ') : 'All Events'}</button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)] overflow-hidden">
        {(isLoading || isFetching) ? (
          <div className="p-4 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[11px] text-[#6a6a6a] font-semibold uppercase border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-5 py-3.5">Event</th>
                  <th className="text-left px-5 py-3.5">User</th>
                  <th className="text-left px-5 py-3.5">IP Address</th>
                  <th className="text-left px-5 py-3.5">Details</th>
                  <th className="text-right px-5 py-3.5">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {events.map((e) => (
                  <tr key={e.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5"><AuditBadge event={e.event_type} /></td>
                    <td className="px-5 py-3.5">
                      <p className="text-xs text-[#6a6a6a] font-mono truncate max-w-[180px]">{e.user_email ?? e.user_id ?? 'anonymous'}</p>
                      {e.performer_email && e.performer_email !== e.user_email && (
                        <p className="text-[10px] text-violet-600">by {e.performer_email}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-xs text-[#6a6a6a] font-mono">{e.ip_address ?? '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-[#6a6a6a] max-w-[200px] truncate">
                      {e.metadata ? JSON.stringify(e.metadata) : e.user_agent?.slice(0, 40) ?? '—'}
                    </td>
                    <td className="px-5 py-3.5 text-right text-[11px] text-[#6a6a6a] whitespace-nowrap">
                      {new Date(e.created_at).toLocaleString('en-KE', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {events.length === 0 && (
              <div className="flex flex-col items-center justify-center h-24 text-[#6a6a6a] gap-2">
                <FileText className="w-6 h-6 opacity-20" />
                <p className="text-xs font-medium">No events match filter</p>
              </div>
            )}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="flex items-center gap-1 text-xs font-bold text-[#6a6a6a] hover:text-[#222222] disabled:opacity-40 transition-colors">
            <ChevronLeft className="w-4 h-4" /> Prev
          </button>
          <span className="text-xs text-[#6a6a6a]">Page {page} of {totalPages} · {data?.total?.toLocaleString()} total events</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="flex items-center gap-1 text-xs font-bold text-[#6a6a6a] hover:text-[#222222] disabled:opacity-40 transition-colors">
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

// ─── MAIN ─────────────────────────────────────────────────────────────────────
const StaffDashboard: React.FC = () => {
  const dispatch      = useDispatch();
  const navigate      = useNavigate();
  const user          = useSelector(selectCurrentUser);
  const [activeTab, setActiveTab]     = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [logout] = useLogoutMutation();

  useEffect(() => {
    if (user && !user.roles?.includes('staff') && !user.roles?.includes('super_admin')) navigate('/');
  }, [user, navigate]);

  // ── Use only moderation endpoints that staff has access to ────────────────
  // admin/kpi and admin/reviews/stats are admin-only → would 401 for staff.
  // Instead we pull the totals directly from the moderation queues.
  const { data: pendingVerif, isLoading: verifLoad } =
    useGetModerationVerificationsQuery({ page: 1, limit: 1, status: 'pending' });
  const { data: openDisputes, isLoading: dispLoad } =
    useGetModerationDisputesQuery({ page: 1, limit: 1, status: 'open' });
  const { data: heldReviews, isLoading: reviewLoad } =
    useGetFraudReviewQueueQuery({ page: 1, limit: 1 });
  const { data: pendingListings, isLoading: listingsLoad } =
    useGetPendingListingsQuery({ page: 1, limit: 1 });

  const pendingVerifCount   = pendingVerif?.total    ?? 0;
  const openDisputeCount    = openDisputes?.total    ?? 0;
  const heldReviewCount     = heldReviews?.total     ?? 0;
  const pendingListingCount = pendingListings?.total  ?? 0;
  const overviewLoading     = verifLoad || dispLoad || reviewLoad || listingsLoad;

  const handleLogout = async () => {
    try {
      const rt = localStorage.getItem('refreshToken');
      if (rt) await logout({ refreshToken: rt }).unwrap();
    } catch {}
    dispatch(clearCredentials());
    navigate('/login');
  };

  const navBadges: Record<string, number> = {
    verifications: pendingVerifCount,
    disputes:      openDisputeCount,
    reviews:       heldReviewCount,
    listings:      pendingListingCount,
  };

  const totalPending = pendingVerifCount + openDisputeCount + heldReviewCount + pendingListingCount;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':      return <OverviewTab pendingVerif={pendingVerifCount} openDisputes={openDisputeCount} heldReviews={heldReviewCount} pendingListings={pendingListingCount} loading={overviewLoading} setActiveTab={setActiveTab} />;
      case 'verifications': return <VerificationsTab />;
      case 'listings':      return <ListingsTab />;
      case 'reviews':       return <ReviewsTab />;
      case 'disputes':      return <DisputesTab />;
      case 'messages':      return <MessagesTab />;
      case 'users':         return <UsersTab />;
      case 'audit':         return <AuditTab />;
      default:              return <OverviewTab pendingVerif={pendingVerifCount} openDisputes={openDisputeCount} heldReviews={heldReviewCount} loading={overviewLoading} setActiveTab={setActiveTab} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f7f7] flex font-['DM_Sans',sans-serif]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-56 bg-[#111827] flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-[#ff385c] flex items-center justify-center shrink-0">
              <Home className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-white font-bold text-sm tracking-tight">GetKeja</span>
              <span className="block text-white/40 text-[10px] font-medium uppercase tracking-widest">Staff</span>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon }) => {
            const active = activeTab === id;
            const badge  = navBadges[id];
            return (
              <button key={id} onClick={() => { setActiveTab(id); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${active ? 'bg-white/10 text-white' : 'text-white/50 hover:text-white/80 hover:bg-white/5'}`}>
                <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-[#ff385c]' : ''}`} />
                <span className="flex-1 text-left">{label}</span>
                {badge !== undefined && badge > 0 && (
                  <span className="text-[10px] font-bold bg-[#ff385c] text-white px-1.5 py-0.5 rounded-full min-w-[18px] text-center">{badge}</span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
            <div className="w-7 h-7 rounded-lg bg-[#ff385c]/20 flex items-center justify-center shrink-0">
              <span className="text-[#ff385c] text-xs font-bold">{(user?.full_name ?? user?.email ?? 'S')[0].toUpperCase()}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user?.full_name ?? user?.email}</p>
              <p className="text-white/40 text-[10px]">Staff · Moderator</p>
            </div>
            <button onClick={handleLogout} className="text-white/30 hover:text-[#ff385c] transition-colors shrink-0">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="bg-white border-b border-gray-100 px-6 py-3.5 flex items-center gap-4 sticky top-0 z-20">
          <button onClick={() => setSidebarOpen(true)} className="lg:hidden text-[#6a6a6a] hover:text-[#222222] transition-colors">
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-base font-bold text-[#222222] tracking-tight">
              {NAV.find(n => n.id === activeTab)?.label ?? 'Dashboard'}
            </h1>
            <p className="text-xs text-[#6a6a6a]">
              {new Date().toLocaleDateString('en-KE', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 w-48">
              <Search className="w-3.5 h-3.5 text-[#6a6a6a]" />
              <input placeholder="Search…" className="bg-transparent text-xs text-[#222222] placeholder:text-[#6a6a6a] outline-none flex-1" />
            </div>
            <button className="relative w-8 h-8 flex items-center justify-center rounded-xl bg-gray-50 border border-gray-200 text-[#6a6a6a] hover:text-[#222222] transition-colors">
              <Bell className="w-4 h-4" />
              {totalPending > 0 && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#ff385c] rounded-full" />}
            </button>
            <button onClick={() => window.location.reload()}
              className="hidden sm:flex items-center gap-1.5 bg-gray-50 border border-gray-200 text-[#222222] px-3.5 py-2 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all">
              <RefreshCw className="w-3.5 h-3.5" /> Refresh
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

export default StaffDashboard;
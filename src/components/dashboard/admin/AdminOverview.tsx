// components/dashboard/admin/AdminOverview.tsx
import React from 'react';
import {
  Users, Building2, Calendar, CreditCard, ShieldAlert, DollarSign,
  ChevronRight, CheckCircle2, Clock, AlertTriangle, Star,
} from 'lucide-react';
import { StatCard, SectionHeader } from '../shared';
import type { StatCardProps } from '../shared';
import {
  useGetKpiSnapshotQuery,
  useGetRevenueBreakdownQuery,
  useGetUserStatsQuery,
  useGetPropertyStatsQuery,
  useGetBookingStatsQuery,
  useGetSubscriptionStatsQuery,
  useGetReviewStatsQuery,
} from '../../../features/Api/AdminApi';

/* ── Revenue bar ── */
const RevenueBar: React.FC<{ label: string; value: number; total: number; color: string }> = ({
  label, value, total, color,
}) => {
  const pct = total > 0 ? (value / total) * 100 : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex justify-between text-xs">
        <span className="text-[#6a6a6a] font-medium">{label}</span>
        <span className="text-[#222222] font-semibold">KES {value.toLocaleString()}</span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

/* ── Queue row ── */
const QueueRow: React.FC<{
  label: string; count: number; urgency: 'high' | 'medium' | 'low'; onClick?: () => void;
}> = ({ label, count, urgency, onClick }) => {
  const colors = {
    high: 'bg-red-50 text-red-700 border-red-200',
    medium: 'bg-amber-50 text-amber-700 border-amber-200',
    low: 'bg-blue-50 text-blue-700 border-blue-200',
  };
  return (
    <button onClick={onClick} className="w-full flex items-center justify-between py-3 px-4 rounded-xl hover:bg-gray-50 transition-colors group">
      <span className="text-sm font-medium text-[#222222]">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${colors[urgency]}`}>{count}</span>
        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-[#222222] transition-colors" />
      </div>
    </button>
  );
};

interface AdminOverviewProps {
  onNavigate: (tab: string) => void;
}

const AdminOverview: React.FC<AdminOverviewProps> = ({ onNavigate }) => {
  const { data: kpi, isLoading: kpiLoading } = useGetKpiSnapshotQuery();
  const { data: revenue, isLoading: revenueLoading } = useGetRevenueBreakdownQuery({});
  const { data: userStats } = useGetUserStatsQuery();
  const { data: propStats } = useGetPropertyStatsQuery();
  const { data: bookingStats } = useGetBookingStatsQuery();
  const { data: subStats } = useGetSubscriptionStatsQuery();
  const { data: reviewStats } = useGetReviewStatsQuery();

  const fmt = (n?: number) => (n ?? 0).toLocaleString();
  const fmtKes = (n?: number) => `KES ${((n ?? 0) / 1000).toFixed(1)}k`;

  const kpiCards: StatCardProps[] = [
    { label: 'Total Users', value: fmt(kpi?.users?.total), sub: `+${fmt(kpi?.users?.new_30d)} this month`, icon: Users, accent: 'bg-blue-50 text-blue-600', loading: kpiLoading },
    { label: 'Active Listings', value: fmt(kpi?.properties?.active), sub: `${fmt(kpi?.properties?.total)} total`, icon: Building2, accent: 'bg-violet-50 text-violet-600', loading: kpiLoading },
    { label: 'Revenue (Month)', value: fmtKes(kpi?.revenue?.month_kes), sub: `All-time: ${fmtKes(kpi?.revenue?.all_time_kes)}`, icon: DollarSign, accent: 'bg-emerald-50 text-emerald-600', loading: kpiLoading },
    { label: 'Active Bookings', value: fmt(kpi?.short_stay_bookings?.active), sub: `${fmt(kpi?.long_term_bookings?.active)} long-term`, icon: Calendar, accent: 'bg-amber-50 text-amber-600', loading: kpiLoading },
    { label: 'Active Subscribers', value: fmt(kpi?.subscriptions?.active), sub: `${fmt(subStats?.past_due)} past due`, icon: CreditCard, accent: 'bg-rose-50 text-rose-600', loading: kpiLoading },
    { label: 'Moderation Queue', value: fmt((kpi?.moderation?.pending_id_verifications ?? 0) + (kpi?.moderation?.open_disputes ?? 0) + (kpi?.moderation?.fraud_signals_unresolved ?? 0)), sub: `${fmt(kpi?.moderation?.open_disputes)} disputes`, icon: ShieldAlert, accent: 'bg-red-50 text-red-600', loading: kpiLoading },
  ];

  const revenueTotal = revenue
    ? (revenue.by_stream?.listing_fees_kes ?? 0) + (revenue.by_stream?.viewing_fees_kes ?? 0) + (revenue.by_stream?.subscriptions_kes ?? 0) + (revenue.by_stream?.short_stay_fees_kes ?? 0)
    : 0;

  return (
    <div className="space-y-6 max-w-7xl">
      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {kpiCards.map((card) => <StatCard key={card.label} {...card} />)}
      </div>

      {/* Revenue + Moderation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <SectionHeader title="Revenue Breakdown" sub="Current month, all streams" action={
            <button onClick={() => onNavigate('revenue')} className="text-xs text-[#ff385c] font-semibold hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          } />
          {revenueLoading ? (
            <div className="space-y-3">{[...Array(4)].map((_, i) => (<div key={i} className="space-y-1.5"><div className="h-3 w-32 bg-gray-100 rounded animate-pulse" /><div className="h-1.5 bg-gray-100 rounded-full animate-pulse" /></div>))}</div>
          ) : (
            <div className="space-y-4">
              <RevenueBar label="Listing Fees" value={revenue?.by_stream?.listing_fees_kes ?? 0} total={revenueTotal} color="bg-[#ff385c]" />
              <RevenueBar label="Viewing Fees" value={revenue?.by_stream?.viewing_fees_kes ?? 0} total={revenueTotal} color="bg-violet-500" />
              <RevenueBar label="Subscriptions" value={revenue?.by_stream?.subscriptions_kes ?? 0} total={revenueTotal} color="bg-emerald-500" />
              <RevenueBar label="Short-Stay Fees" value={revenue?.by_stream?.short_stay_fees_kes ?? 0} total={revenueTotal} color="bg-amber-500" />
              <div className="pt-2 border-t border-gray-100 flex justify-between text-sm">
                <span className="text-[#6a6a6a] font-medium">Total this period</span>
                <span className="text-[#222222] font-bold">KES {revenueTotal.toLocaleString()}</span>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <SectionHeader title="Moderation Queue" sub="Items requiring admin action" action={
            <button onClick={() => onNavigate('moderation')} className="text-xs text-[#ff385c] font-semibold hover:underline flex items-center gap-1">
              View all <ChevronRight className="w-3.5 h-3.5" />
            </button>
          } />
          <div className="space-y-1">
            <QueueRow label="Pending ID Verifications" count={kpi?.moderation?.pending_id_verifications ?? 0} urgency="high" onClick={() => onNavigate('moderation')} />
            <QueueRow label="Open Disputes" count={kpi?.moderation?.open_disputes ?? 0} urgency="high" onClick={() => onNavigate('moderation')} />
            <QueueRow label="Fraud Review Queue" count={kpi?.moderation?.fraud_signals_unresolved ?? 0} urgency="medium" onClick={() => onNavigate('moderation')} />
            <QueueRow label="Pending Visits" count={kpi?.visits?.pending_confirmation ?? 0} urgency="low" onClick={() => onNavigate('bookings')} />
          </div>
        </div>
      </div>

      {/* Users / Properties / Bookings snapshots */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <SectionHeader title="Users by Role" action={<button onClick={() => onNavigate('users')} className="text-xs text-[#ff385c] font-semibold hover:underline">View →</button>} />
          <div className="space-y-2.5">
            {Object.entries(userStats?.by_role ?? {}).map(([role, count]) => (
              <div key={role} className="flex items-center justify-between text-sm">
                <span className="text-[#6a6a6a] capitalize font-medium">{role.replace('_', ' ')}</span>
                <span className="font-bold text-[#222222]">{fmt(count as number)}</span>
              </div>
            ))}
            {!userStats && <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />)}</div>}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <SectionHeader title="Properties" action={<button onClick={() => onNavigate('properties')} className="text-xs text-[#ff385c] font-semibold hover:underline">View →</button>} />
          <div className="space-y-2.5">
            {Object.entries(propStats?.by_category ?? {}).map(([cat, count]) => (
              <div key={cat} className="flex items-center justify-between text-sm">
                <span className="text-[#6a6a6a] capitalize font-medium">{cat.replace(/_/g, ' ')}</span>
                <span className="font-bold text-[#222222]">{fmt(count as number)}</span>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100 flex justify-between text-sm">
              <span className="text-[#6a6a6a] font-medium">Avg search score</span>
              <span className="font-bold text-[#222222]">{propStats?.avg_search_score ?? '—'}</span>
            </div>
            {!propStats && <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />)}</div>}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <SectionHeader title="Bookings" action={<button onClick={() => onNavigate('bookings')} className="text-xs text-[#ff385c] font-semibold hover:underline">View →</button>} />
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm"><span className="text-[#6a6a6a] font-medium">Short-stay active</span><span className="font-bold text-[#222222]">{fmt(bookingStats?.short_stay?.active)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-[#6a6a6a] font-medium">Escrow held</span><span className="font-bold text-emerald-600">KES {fmt(bookingStats?.short_stay?.escrow_held_kes)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-[#6a6a6a] font-medium">Disputes</span><span className="font-bold text-red-500">{fmt(bookingStats?.short_stay?.disputed)}</span></div>
            <div className="pt-2 border-t border-gray-100 flex justify-between text-sm"><span className="text-[#6a6a6a] font-medium">Long-term active</span><span className="font-bold text-[#222222]">{fmt(bookingStats?.long_term?.active)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-[#6a6a6a] font-medium">Visits pending</span><span className="font-bold text-amber-600">{fmt(bookingStats?.visits?.pending_confirmation)}</span></div>
            {!bookingStats && <div className="space-y-2">{[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />)}</div>}
          </div>
        </div>
      </div>

      {/* Reviews + Subscriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <SectionHeader title="Reviews" action={<button onClick={() => onNavigate('reviews')} className="text-xs text-[#ff385c] font-semibold hover:underline">View →</button>} />
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: 'Published', value: reviewStats?.published, color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2 },
              { label: 'Held', value: reviewStats?.held_moderation, color: 'text-amber-600', bg: 'bg-amber-50', icon: Clock },
              { label: 'Rejected', value: reviewStats?.rejected, color: 'text-red-600', bg: 'bg-red-50', icon: AlertTriangle },
            ].map(({ label, value, color, bg, icon: Ic }) => (
              <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                <Ic className={`w-4 h-4 ${color} mx-auto mb-1`} />
                <p className={`text-lg font-bold ${color}`}>{fmt(value)}</p>
                <p className="text-[10px] text-[#6a6a6a] font-medium">{label}</p>
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm border-t border-gray-100 pt-3">
            <span className="text-[#6a6a6a] font-medium">Avg rating</span>
            <span className="font-bold text-[#222222] flex items-center gap-1">
              <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> {reviewStats?.avg_rating ?? '—'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
          <SectionHeader title="Subscriptions" action={<button onClick={() => onNavigate('subscriptions')} className="text-xs text-[#ff385c] font-semibold hover:underline">View →</button>} />
          <div className="space-y-2.5">
            {Object.entries(subStats?.subscribers_by_plan ?? {}).map(([plan, count]) => (
              <div key={plan} className="flex items-center justify-between text-sm">
                <span className="text-[#6a6a6a] font-medium">{plan}</span>
                <div className="flex items-center gap-2">
                  <div className="w-20 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#ff385c] rounded-full" style={{ width: `${subStats ? ((count as number) / subStats.total) * 100 : 0}%` }} />
                  </div>
                  <span className="font-bold text-[#222222] w-8 text-right">{fmt(count as number)}</span>
                </div>
              </div>
            ))}
            <div className="pt-2 border-t border-gray-100 flex justify-between text-sm">
              <span className="text-[#6a6a6a] font-medium">Past due</span>
              <span className="font-bold text-red-500">{fmt(subStats?.past_due)}</span>
            </div>
            {!subStats && <div className="space-y-2">{[...Array(4)].map((_, i) => <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />)}</div>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminOverview;

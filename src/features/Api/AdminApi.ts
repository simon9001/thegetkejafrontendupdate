// frontend/src/features/Api/AdminApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

// ─────────────────────────────────────────────────────────────────────────────
// Response types
// ─────────────────────────────────────────────────────────────────────────────

export interface KpiSnapshot {
  users:                { total: number; new_30d: number };
  properties:           { total: number; new_30d: number; active: number };
  short_stay_bookings:  { total: number; active: number };
  long_term_bookings:   { total: number; active: number };
  revenue:              { all_time_kes: number; month_kes: number };
  moderation:           { pending_id_verifications: number; open_disputes: number; fraud_signals_unresolved: number };
  subscriptions:        { active: number };
  visits:               { pending_confirmation: number };
  generated_at:         string;
  code:                 string;
}

export interface RevenueBreakdown {
  period:               { from: string; to: string };
  total_kes:            number;
  by_stream: { listing_fees_kes: number; viewing_fees_kes: number; subscriptions_kes: number; short_stay_fees_kes: number };
  listing_fees_by_tier:     Record<string, number>;
  subscriptions_by_plan:    Record<string, number>;
  counts: { listing_payments: number; viewing_unlocks_paid: number; subscriptions_new: number; short_stay_bookings: number };
  code: string;
}

export interface RevenueSeries {
  days: number; since: string;
  series: Array<{ day: string; listing_fee: number; viewing_fee: number; subscription: number }>;
  code: string;
}

export interface UserStats {
  by_status: Record<string, number>;
  by_provider: Record<string, number>;
  by_role: Record<string, number>;
  new_this_month: number;
  verified_ids_total: number;
  code: string;
}

export interface PropertyStats {
  by_category: Record<string, number>;
  by_status: Record<string, number>;
  by_type: Record<string, number>;
  by_furnished: Record<string, number>;
  featured_count: number;
  active_boosts: number;
  avg_search_score: number;
  code: string;
}

export interface BookingStats {
  short_stay: { total: number; new_this_month: number; active: number; cancelled: number; disputed: number; escrow_held_kes: number; payouts_released_kes: number };
  long_term: { total: number; pending: number; active: number; terminated: number };
  visits: { pending_confirmation: number; completed_total: number; no_shows_total: number };
  code: string;
}

export interface IdVerification {
  id: string;
  user_id: string;
  doc_type: 'national_id' | 'passport' | 'company_cert' | 'earb_license' | 'nca_cert';
  doc_number?: string;
  front_image_url?: string;
  back_image_url?: string;
  selfie_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  rejection_reason?: string;
  submitted_at: string;
  reviewed_at?: string;
  expires_at?: string;
  user_full_name?: string;
  user_email?: string;
}

export interface Dispute {
  id: string;
  booking_id: string;
  raised_by: string;
  raised_by_role: 'guest' | 'host';
  against_user_id: string;
  reason: string;
  description: string;
  evidence_urls?: string[];
  status: 'open' | 'under_review' | 'resolved_guest' | 'resolved_host' | 'escalated';
  resolved_by?: string;
  resolution_notes?: string;
  refund_amount_kes?: number;
  raised_at: string;
  resolved_at?: string;
  booking_ref?: string;
  total_charged_kes?: number;
}

export interface FraudReview {
  id: string;
  review_type: string;
  reviewer_id: string;
  property_id?: string;
  rating_overall: number;
  review_text?: string;
  status: string;
  submitted_at: string;
  auto_publish_at?: string;
  reviewer_email?: string;
  property_title?: string;
  fraud_signals: Array<{ id: string; signal: string; confidence: 'low'|'medium'|'high'; detail?: string; detected_at: string; resolved: boolean }>;
}

export interface ReportedMessage {
  id: string;
  message_id: string;
  reported_by: string;
  reason: string;
  reviewed: boolean;
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  message_body?: string;
  reporter_email?: string;
  sender_email?: string;
}

export interface AuditEvent {
  id: number;
  user_id?: string;
  event_type: string;
  ip_address?: string;
  user_agent?: string;
  metadata?: Record<string, any>;
  performed_by?: string;
  created_at: string;
  user_email?: string;
  performer_email?: string;
}

export interface VerificationsResponse {
  verifications: IdVerification[];
  total: number; page: number; limit: number; pages: number; code: string;
}

export interface DisputesResponse {
  disputes: Dispute[];
  total: number; page: number; limit: number; pages: number; code: string;
}

export interface FraudQueueResponse {
  reviews: FraudReview[];
  total: number; page: number; limit: number; pages: number; code: string;
}

export interface ReportedMessagesResponse {
  reports: ReportedMessage[];
  total: number; page: number; limit: number; pages: number; code: string;
}

export interface AuditLog {
  events: AuditEvent[];
  total: number; page: number; limit: number; pages: number; code: string;
}

export interface SubscriptionStats {
  total: number; past_due: number;
  by_status: Record<string, number>;
  subscribers_by_plan: Record<string, number>;
  code: string;
}

export interface SubscriptionPlan {
  id: string; name: string; price_monthly_kes: number; price_annual_kes?: number;
  viewing_unlocks_per_month: number; ai_recommendations_per_day: number; saved_searches_limit: number;
  alert_frequency: string; priority_support: boolean; can_see_price_history: boolean;
  can_see_similar_properties: boolean; is_active: boolean; active_subscribers: number; total_subscribers: number;
}

export interface ReviewStats {
  published: number; held_moderation: number; rejected: number;
  avg_rating: number; five_star: number; one_star: number;
  fraud_signals_by_type: Record<string, { total: number; high: number }>;
  code: string;
}

export interface FeeConfig {
  fee_config: any[]; viewing_fees: any[]; listing_tiers: any[]; boost_packages: any[]; code: string;
}

export interface SearchAnalytics {
  period_days: number; total_searches: number; avg_results_per_search: number;
  zero_result_count: number; zero_result_queries: string[];
  top_searched_areas: Array<{ area: string; count: number }>;
  top_searched_types: Array<{ type: string; count: number }>;
  code: string;
}

export interface AdStats {
  total_campaigns: number; by_status: Record<string, number>;
  total_spent_kes: number; total_budget_kes: number;
  total_impressions: number; total_clicks: number; avg_ctr_pct: number; code: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// API slice
// ─────────────────────────────────────────────────────────────────────────────
export const AdminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery:   baseQueryWithReauth,
  tagTypes: [
    'Admin','AdminKpi','AdminRevenue','AdminUsers','AdminProperties',
    'AdminBookings','AdminModeration','AdminSubscriptions',
    'AdminReviews','AdminFees','AdminAudit','AdminAds',
  ],
  endpoints: (builder) => ({

    // Overview
    getKpiSnapshot: builder.query<KpiSnapshot, void>({
      query: () => 'admin/kpi',
      providesTags: ['AdminKpi'],
    }),

    // Revenue
    getRevenueBreakdown: builder.query<RevenueBreakdown, { from?: string; to?: string }>({
      query: ({ from, to } = {}) => {
        const p = new URLSearchParams();
        if (from) p.set('from', from);
        if (to)   p.set('to', to);
        return `admin/revenue/breakdown?${p}`;
      },
      providesTags: ['AdminRevenue'],
    }),
    getDailyRevenueSeries: builder.query<RevenueSeries, { days?: number }>({
      query: ({ days = 30 } = {}) => `admin/revenue/series?days=${days}`,
      providesTags: ['AdminRevenue'],
    }),

    // Users
    getUserStats: builder.query<UserStats, void>({
      query: () => 'admin/users/stats',
      providesTags: ['AdminUsers'],
    }),
    getUserActivityProfile: builder.query<{ profile: any; code: string }, string>({
      query: (userId) => `admin/users/${userId}/activity`,
      providesTags: ['AdminUsers'],
    }),
    suspendUser: builder.mutation<{ code: string }, { userId: string; reason: string }>({
      query: ({ userId, reason }) => ({ url: `admin/users/${userId}/suspend`, method: 'PATCH', body: { reason } }),
      invalidatesTags: ['AdminUsers', 'AdminModeration'],
    }),
    banUser: builder.mutation<{ code: string }, { userId: string; reason: string }>({
      query: ({ userId, reason }) => ({ url: `admin/users/${userId}/ban`, method: 'PATCH', body: { reason } }),
      invalidatesTags: ['AdminUsers', 'AdminModeration'],
    }),
    reactivateUser: builder.mutation<{ code: string }, string>({
      query: (userId) => ({ url: `admin/users/${userId}/reactivate`, method: 'PATCH' }),
      invalidatesTags: ['AdminUsers'],
    }),

    // Properties
    getPropertyStats: builder.query<PropertyStats, void>({
      query: () => 'admin/properties/stats',
      providesTags: ['AdminProperties'],
    }),
    getPropertiesNeedingAttention: builder.query<any, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 } = {}) => `admin/properties/attention?page=${page}&limit=${limit}`,
      providesTags: ['AdminProperties'],
    }),
    getTopListings: builder.query<{ listings: any[]; code: string }, { limit?: number }>({
      query: ({ limit = 20 } = {}) => `admin/properties/top?limit=${limit}`,
      providesTags: ['AdminProperties'],
    }),
    // Listings pending staff review (status = 'pending_review')
    getPendingListings: builder.query<{ listings: any[]; total: number; page: number; pages: number }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 } = {}) => `admin/properties/pending?page=${page}&limit=${limit}`,
      providesTags: ['AdminProperties', 'AdminModeration'],
    }),
    approveListing: builder.mutation<{ code: string }, string>({
      query: (propertyId) => ({ url: `admin/properties/${propertyId}/approve`, method: 'PATCH' }),
      invalidatesTags: ['AdminProperties', 'AdminModeration'],
    }),
    rejectListing: builder.mutation<{ code: string }, { propertyId: string; reason: string }>({
      query: ({ propertyId, reason }) => ({ url: `admin/properties/${propertyId}/reject`, method: 'PATCH', body: { reason } }),
      invalidatesTags: ['AdminProperties', 'AdminModeration'],
    }),

    // Bookings
    getBookingStats: builder.query<BookingStats, void>({
      query: () => 'admin/bookings/stats',
      providesTags: ['AdminBookings'],
    }),
    listShortStayBookings: builder.query<any, { page?: number; limit?: number; status?: string; from_date?: string; to_date?: string }>({
      query: (params = {}) => {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => { if (v !== undefined) q.set(k, String(v)); });
        return `admin/bookings/short-stay?${q}`;
      },
      providesTags: ['AdminBookings'],
    }),
    listLongTermBookings: builder.query<any, { page?: number; limit?: number; status?: string }>({
      query: (params = {}) => {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => { if (v !== undefined) q.set(k, String(v)); });
        return `admin/bookings/long-term?${q}`;
      },
      providesTags: ['AdminBookings'],
    }),

    // Moderation — ID verifications (id_verifications table)
    getModerationVerifications: builder.query<VerificationsResponse, { page?: number; limit?: number; status?: string }>({
      query: ({ page = 1, limit = 20, status } = {}) => {
        const q = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (status) q.set('status', status);
        return `admin/moderation/verifications?${q}`;
      },
      providesTags: ['AdminModeration'],
    }),
    approveVerification: builder.mutation<{ code: string }, string>({
      query: (id) => ({ url: `admin/moderation/verifications/${id}/approve`, method: 'PATCH' }),
      invalidatesTags: ['AdminModeration', 'AdminKpi'],
    }),
    rejectVerification: builder.mutation<{ code: string }, { verificationId: string; reason: string }>({
      query: ({ verificationId, reason }) => ({ url: `admin/moderation/verifications/${verificationId}/reject`, method: 'PATCH', body: { reason } }),
      invalidatesTags: ['AdminModeration', 'AdminKpi'],
    }),

    // Moderation — disputes (short_stay_disputes table)
    getModerationDisputes: builder.query<DisputesResponse, { page?: number; limit?: number; status?: string }>({
      query: ({ page = 1, limit = 20, status } = {}) => {
        const q = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (status) q.set('status', status);
        return `admin/moderation/disputes?${q}`;
      },
      providesTags: ['AdminModeration'],
    }),
    resolveDispute: builder.mutation<{ code: string }, { disputeId: string; resolution: 'resolved_guest'|'resolved_host'|'escalated'; resolution_notes: string; refund_amount_kes?: number }>({
      query: ({ disputeId, ...body }) => ({ url: `admin/moderation/disputes/${disputeId}/resolve`, method: 'PATCH', body }),
      invalidatesTags: ['AdminModeration', 'AdminKpi', 'AdminBookings'],
    }),

    // Moderation — review fraud queue (unified_reviews held_for_moderation + review_fraud_signals)
    getFraudReviewQueue: builder.query<FraudQueueResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 } = {}) => `admin/moderation/reviews?page=${page}&limit=${limit}`,
      providesTags: ['AdminModeration'],
    }),
    publishReview: builder.mutation<{ code: string }, string>({
      query: (id) => ({ url: `admin/moderation/reviews/${id}/publish`, method: 'PATCH' }),
      invalidatesTags: ['AdminModeration', 'AdminReviews', 'AdminKpi'],
    }),
    rejectReview: builder.mutation<{ code: string }, { reviewId: string; notes: string }>({
      query: ({ reviewId, notes }) => ({ url: `admin/moderation/reviews/${reviewId}/reject`, method: 'PATCH', body: { notes } }),
      invalidatesTags: ['AdminModeration', 'AdminReviews', 'AdminKpi'],
    }),
    escalateReview: builder.mutation<{ code: string }, { reviewId: string; notes: string }>({
      query: ({ reviewId, notes }) => ({ url: `admin/moderation/reviews/${reviewId}/escalate`, method: 'PATCH', body: { notes } }),
      invalidatesTags: ['AdminModeration'],
    }),

    // Moderation — reported messages (message_reports table)
    getReportedMessages: builder.query<ReportedMessagesResponse, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 } = {}) => `admin/moderation/messages?page=${page}&limit=${limit}`,
      providesTags: ['AdminModeration'],
    }),
    resolveMessageReport: builder.mutation<{ code: string }, string>({
      query: (id) => ({ url: `admin/moderation/messages/${id}/resolve`, method: 'PATCH' }),
      invalidatesTags: ['AdminModeration'],
    }),
    removeReportedMessage: builder.mutation<{ code: string }, string>({
      query: (id) => ({ url: `admin/moderation/messages/${id}/remove`, method: 'PATCH' }),
      invalidatesTags: ['AdminModeration'],
    }),

    // Subscriptions
    getSubscriptionStats: builder.query<SubscriptionStats, void>({
      query: () => 'admin/subscriptions/stats',
      providesTags: ['AdminSubscriptions'],
    }),
    listSubscriptionPlans: builder.query<{ plans: SubscriptionPlan[]; code: string }, void>({
      query: () => 'admin/subscriptions/plans',
      providesTags: ['AdminSubscriptions'],
    }),
    updateSubscriptionPlan: builder.mutation<any, { id: string; updates: Partial<SubscriptionPlan> }>({
      query: ({ id, updates }) => ({ url: `admin/subscriptions/plans/${id}`, method: 'PATCH', body: updates }),
      invalidatesTags: ['AdminSubscriptions'],
    }),

    // Fees (super_admin write only)
    getFeeConfig: builder.query<FeeConfig, void>({
      query: () => 'admin/fees',
      providesTags: ['AdminFees'],
    }),
    updateFeeConfigEntry: builder.mutation<any, { key: string; value: number }>({
      query: ({ key, value }) => ({ url: `admin/fees/config/${key}`, method: 'PATCH', body: { value } }),
      invalidatesTags: ['AdminFees'],
    }),
    updateViewingFee: builder.mutation<any, { id: string; updates: any }>({
      query: ({ id, updates }) => ({ url: `admin/fees/viewing/${id}`, method: 'PATCH', body: updates }),
      invalidatesTags: ['AdminFees'],
    }),
    updateBoostPackage: builder.mutation<any, { id: string; updates: any }>({
      query: ({ id, updates }) => ({ url: `admin/fees/boosts/${id}`, method: 'PATCH', body: updates }),
      invalidatesTags: ['AdminFees'],
    }),

    // Search analytics
    getSearchAnalytics: builder.query<SearchAnalytics, { days?: number }>({
      query: ({ days = 30 } = {}) => `admin/search/analytics?days=${days}`,
    }),

    // Audit log (security_audit_log table)
    getAuditLog: builder.query<AuditLog, { page?: number; limit?: number; event_type?: string; user_id?: string; from?: string; to?: string }>({
      query: (params = {}) => {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => { if (v !== undefined) q.set(k, String(v)); });
        return `admin/audit?${q}`;
      },
      providesTags: ['AdminAudit'],
    }),
    getAuditBreakdown: builder.query<any, { days?: number }>({
      query: ({ days = 7 } = {}) => `admin/audit/breakdown?days=${days}`,
      providesTags: ['AdminAudit'],
    }),

    // Ads
    getAdStats: builder.query<AdStats, void>({
      query: () => 'admin/ads/stats',
      providesTags: ['AdminAds'],
    }),
    listAdCampaigns: builder.query<any, { page?: number; limit?: number; status?: string }>({
      query: (params = {}) => {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => { if (v !== undefined) q.set(k, String(v)); });
        return `admin/ads?${q}`;
      },
      providesTags: ['AdminAds'],
    }),
    approveAdCampaign: builder.mutation<any, string>({
      query: (id) => ({ url: `admin/ads/${id}/approve`, method: 'PATCH' }),
      invalidatesTags: ['AdminAds'],
    }),
    pauseAdCampaign: builder.mutation<any, string>({
      query: (id) => ({ url: `admin/ads/${id}/pause`, method: 'PATCH' }),
      invalidatesTags: ['AdminAds'],
    }),

    // Reviews
    getReviewStats: builder.query<ReviewStats, void>({
      query: () => 'admin/reviews/stats',
      providesTags: ['AdminReviews'],
    }),
  }),
});

export const {
  useGetKpiSnapshotQuery,
  useGetRevenueBreakdownQuery,
  useGetDailyRevenueSeriesQuery,
  useGetUserStatsQuery,
  useGetUserActivityProfileQuery,
  useSuspendUserMutation,
  useBanUserMutation,
  useReactivateUserMutation,
  useGetPropertyStatsQuery,
  useGetPropertiesNeedingAttentionQuery,
  useGetPendingListingsQuery,
  useGetTopListingsQuery,
  useApproveListingMutation,
  useRejectListingMutation,
  useGetBookingStatsQuery,
  useListShortStayBookingsQuery,
  useListLongTermBookingsQuery,
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
  useGetSubscriptionStatsQuery,
  useListSubscriptionPlansQuery,
  useUpdateSubscriptionPlanMutation,
  useGetFeeConfigQuery,
  useUpdateFeeConfigEntryMutation,
  useUpdateViewingFeeMutation,
  useUpdateBoostPackageMutation,
  useGetSearchAnalyticsQuery,
  useGetAuditLogQuery,
  useGetAuditBreakdownQuery,
  useGetAdStatsQuery,
  useListAdCampaignsQuery,
  useApproveAdCampaignMutation,
  usePauseAdCampaignMutation,
  useGetReviewStatsQuery,
} = AdminApi;
// features/Api/SubscriptionsApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SubscriptionPlan {
  id:                          string;
  name:                        string;
  price_monthly_kes:           number;
  price_annual_kes:            number | null;
  viewing_unlocks_per_month:   number;
  ai_recommendations_per_day:  number;
  saved_searches_limit:        number | null;
  alert_frequency:             string | null;
  priority_support:            boolean;
  can_see_price_history:       boolean;
  can_see_similar_properties:  boolean;
}

export interface UserSubscription {
  id:                    string;
  billing_cycle:         'monthly' | 'annual';
  amount_kes:            number;
  status:                'active' | 'past_due' | 'cancelled' | 'expired';
  started_at:            string;
  renews_at:             string;
  cancelled_at:          string | null;
  unlock_credits_used:   number;
  credits_remaining:     number;
  plan:                  SubscriptionPlan;
}

export interface SubscribeInput {
  plan_id:        string;
  billing_cycle:  'monthly' | 'annual';
  payment_method: 'mpesa' | 'card' | 'bank_transfer';
  mpesa_phone?:   string;
}

// ── API slice ─────────────────────────────────────────────────────────────────

export const subscriptionsApi = createApi({
  reducerPath: 'subscriptionsApi',
  baseQuery:   baseQueryWithReauth,
  tagTypes:    ['MySubscription'],
  endpoints:   (builder) => ({

    /** GET /api/subscriptions/plans — public, returns { plans: [], total, code } */
    getPlans: builder.query<SubscriptionPlan[], void>({
      query:             () => 'subscriptions/plans',
      transformResponse: (res: any) => Array.isArray(res) ? res : (res?.plans ?? []),
    }),

    /** GET /api/subscriptions/me — authenticated, returns { subscription, has_active, code } */
    getMySubscription: builder.query<UserSubscription | null, void>({
      query:             () => 'subscriptions/me',
      transformResponse: (res: any) => res?.subscription ?? null,
      providesTags:      ['MySubscription'],
    }),

    /** POST /api/subscriptions/subscribe — authenticated, returns { subscription, ... } */
    subscribe: builder.mutation<UserSubscription, SubscribeInput>({
      query: (body) => ({
        url:    'subscriptions/subscribe',
        method: 'POST',
        body,
      }),
      transformResponse: (res: any) => res?.subscription ?? res,
      invalidatesTags:   ['MySubscription'],
    }),

    /** POST /api/subscriptions/paystack/verify — authenticated */
    verifyPaystackPayment: builder.mutation<UserSubscription, {
      plan_id:             string;
      billing_cycle:       'monthly' | 'annual';
      paystack_reference:  string;
    }>({
      query: (body) => ({
        url:    'subscriptions/paystack/verify',
        method: 'POST',
        body,
      }),
      transformResponse: (res: any) => res?.subscription ?? res,
      invalidatesTags:   ['MySubscription'],
    }),

    /** POST /api/subscriptions/cancel — authenticated */
    cancelSubscription: builder.mutation<{ message: string; access_until: string }, { reason?: string }>({
      query: (body) => ({
        url:    'subscriptions/cancel',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MySubscription'],
    }),
  }),
});

export const {
  useGetPlansQuery,
  useGetMySubscriptionQuery,
  useSubscribeMutation,
  useVerifyPaystackPaymentMutation,
  useCancelSubscriptionMutation,
} = subscriptionsApi;

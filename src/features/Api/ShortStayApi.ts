// frontend/src/features/Api/ShortStayApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export interface Booking {
  id: string;
  booking_ref: string;
  property_id: string;
  guest_user_id: string;
  host_user_id: string;
  check_in_date: string;
  check_out_date: string;
  nights: number;
  guests_count: number;
  total_charged_kes: number;
  host_payout_kes: number;
  status: 'pending' | 'confirmed' | 'cancelled' | 'checked_in' | 'checked_out' | 'disputed' | 'completed';
  mpesa_checkout_id?: string;
  special_requests?: string;
  guest_name?: string;
  guest_phone?: string;
  created_at: string;
  properties?: {
    id: string;
    title: string;
    location?: any;
    media?: any[];
  };
}

export interface Quote {
  nights: number;
  price_per_night: number;
  subtotal: number;
  cleaning_fee: number;
  service_fee: number;
  total_kes: number;
  policy: string;
}

export const ShortStayApi = createApi({
  reducerPath: 'shortStayApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Booking', 'Dispute', 'Review', 'Calendar'],
  endpoints: (builder) => ({

    // ── Public: availability check ──────────────────────────────────────────
    // GET /api/short-stay/availability/:propertyId?check_in=&check_out=
    checkAvailability: builder.query<
      { available: boolean; blockedDates: string[]; reason?: string; code: string },
      { propertyId: string; checkIn: string; checkOut: string }
    >({
      query: ({ propertyId, checkIn, checkOut }) => ({
        url: `short-stay/availability/${propertyId}`,
        params: { check_in: checkIn, check_out: checkOut },
      }),
    }),

    // ── Public: calendar ────────────────────────────────────────────────────
    // GET /api/short-stay/calendar/:propertyId?start=&end=
    getCalendar: builder.query<
      { calendar: any[]; code: string },
      { propertyId: string; start?: string; end?: string }
    >({
      query: ({ propertyId, start, end }) => ({
        url: `short-stay/calendar/${propertyId}`,
        params: { start, end },
      }),
      providesTags: (_r, _e, { propertyId }) => [{ type: 'Calendar', id: propertyId }],
    }),

    // ── Public: price quote ─────────────────────────────────────────────────
    // GET /api/short-stay/quote/:propertyId?check_in=&check_out=&guests=
    getPriceQuote: builder.query<
      Quote & { code: string },
      { propertyId: string; checkIn: string; checkOut: string; guests?: number }
    >({
      query: ({ propertyId, checkIn, checkOut, guests = 1 }) => ({
        url: `short-stay/quote/${propertyId}`,
        params: { check_in: checkIn, check_out: checkOut, guests },
      }),
    }),

    // ── Public: property reviews ────────────────────────────────────────────
    // GET /api/short-stay/reviews/:propertyId?page=1&limit=20
    getPropertyReviews: builder.query<
      { reviews: any[]; stats: any; total: number; code: string },
      { propertyId: string; page?: number; limit?: number }
    >({
      query: ({ propertyId, page = 1, limit = 20 }) => ({
        url: `short-stay/reviews/${propertyId}`,
        params: { page, limit },
      }),
      providesTags: (_r, _e, { propertyId }) => [{ type: 'Review', id: `PROPERTY_${propertyId}` }],
    }),

    // ── Create booking ──────────────────────────────────────────────────────
    // POST /api/short-stay/bookings
    createBooking: builder.mutation<{ message: string; booking: Booking; code: string }, any>({
      query: (body) => ({ url: 'short-stay/bookings', method: 'POST', body }),
      invalidatesTags: [
        { type: 'Booking', id: 'LIST_GUEST' },
        { type: 'Booking', id: 'LIST_HOST' },
      ],
    }),

    // ── Get single booking ──────────────────────────────────────────────────
    // GET /api/short-stay/bookings/:id
    getBookingDetail: builder.query<{ booking: Booking; code: string }, string>({
      query: (id) => `short-stay/bookings/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Booking', id }],
    }),

    // ── My bookings as guest ────────────────────────────────────────────────
    // GET /api/short-stay/bookings/my/guest
    getMyGuestBookings: builder.query<
      { bookings: Booking[]; total: number; code: string },
      { status?: string; page?: number; limit?: number } | void
    >({
      query: (params) => ({ url: 'short-stay/bookings/my/guest', params: params ?? {} }),
      providesTags: (result) =>
        result
          ? [...result.bookings.map(b => ({ type: 'Booking' as const, id: b.id })), { type: 'Booking', id: 'LIST_GUEST' }]
          : [{ type: 'Booking', id: 'LIST_GUEST' }],
    }),

    // ── My bookings as host ─────────────────────────────────────────────────
    // GET /api/short-stay/bookings/my/host
    getMyHostBookings: builder.query<
      { bookings: Booking[]; total: number; code: string },
      { status?: string; page?: number; limit?: number } | void
    >({
      query: (params) => ({ url: 'short-stay/bookings/my/host', params: params ?? {} }),
      providesTags: (result) =>
        result
          ? [...result.bookings.map(b => ({ type: 'Booking' as const, id: b.id })), { type: 'Booking', id: 'LIST_HOST' }]
          : [{ type: 'Booking', id: 'LIST_HOST' }],
    }),

    // ── Cancel booking ──────────────────────────────────────────────────────
    // POST /api/short-stay/bookings/:id/cancel
    cancelBooking: builder.mutation<
      { message: string; refund_amount_kes?: number; code: string },
      { id: string; reason: string }
    >({
      query: ({ id, reason }) => ({
        url: `short-stay/bookings/${id}/cancel`,
        method: 'POST',
        body: { reason },
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Booking', id },
        { type: 'Booking', id: 'LIST_GUEST' },
        { type: 'Booking', id: 'LIST_HOST' },
      ],
    }),

    // ── Record check-in or check-out ────────────────────────────────────────
    // POST /api/short-stay/bookings/:id/checkin
    recordCheckin: builder.mutation<
      { message: string; code: string },
      {
        id: string;
        event_type: 'check_in' | 'check_out';
        checkin_type?: 'guest_self' | 'host_confirmed' | 'admin_override';
        latitude?: number;
        longitude?: number;
        proof_photo_url?: string;
        notes?: string;
      }
    >({
      query: ({ id, ...body }) => ({
        url: `short-stay/bookings/${id}/checkin`,
        method: 'POST',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Booking', id }],
    }),

    // ── Host confirms guest self-check-in ───────────────────────────────────
    // POST /api/short-stay/bookings/:id/confirm-checkin
    confirmCheckin: builder.mutation<
      { message: string; code: string },
      { id: string; notes?: string }
    >({
      query: ({ id, notes }) => ({
        url: `short-stay/bookings/${id}/confirm-checkin`,
        method: 'POST',
        body: notes ? { notes } : {},
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Booking', id }],
    }),

    // ── Guest reviews property ──────────────────────────────────────────────
    // POST /api/short-stay/reviews/property
    submitPropertyReview: builder.mutation<{ message: string; code: string }, any>({
      query: (body) => ({ url: 'short-stay/reviews/property', method: 'POST', body }),
      invalidatesTags: (_r, _e, body) => [{ type: 'Review', id: `PROPERTY_${body?.property_id}` }],
    }),

    // ── Host reviews guest ──────────────────────────────────────────────────
    // POST /api/short-stay/reviews/guest
    submitGuestReview: builder.mutation<{ message: string; code: string }, any>({
      query: (body) => ({ url: 'short-stay/reviews/guest', method: 'POST', body }),
    }),

    // ── Host replies to a review ────────────────────────────────────────────
    // POST /api/short-stay/reviews/:reviewId/reply
    replyToReview: builder.mutation<
      { message: string; code: string },
      { reviewId: string; reply: string }
    >({
      query: ({ reviewId, reply }) => ({
        url: `short-stay/reviews/${reviewId}/reply`,
        method: 'POST',
        body: { reply },
      }),
      invalidatesTags: (_r, _e, { reviewId }) => [{ type: 'Review', id: reviewId }],
    }),

    // ── Raise dispute ───────────────────────────────────────────────────────
    // POST /api/short-stay/disputes
    raiseDispute: builder.mutation<{ message: string; code: string }, any>({
      query: (body) => ({ url: 'short-stay/disputes', method: 'POST', body }),
      invalidatesTags: ['Dispute', 'Booking'],
    }),

    // ── Admin: all bookings ─────────────────────────────────────────────────
    // GET /api/short-stay/admin/bookings
    getAllBookingsAdmin: builder.query<
      { bookings: Booking[]; total: number; code: string },
      { page?: number; limit?: number; status?: string } | void
    >({
      query: (params) => ({ url: 'short-stay/admin/bookings', params: params ?? {} }),
      providesTags: [{ type: 'Booking', id: 'ADMIN_LIST' }],
    }),

    // ── Admin: open disputes ────────────────────────────────────────────────
    // GET /api/short-stay/admin/disputes
    getAdminDisputes: builder.query<
      { disputes: any[]; total: number; code: string },
      { page?: number; limit?: number } | void
    >({
      query: (params) => ({ url: 'short-stay/admin/disputes', params: params ?? {} }),
      providesTags: [{ type: 'Dispute', id: 'LIST' }],
    }),

    // ── Admin: resolve dispute ──────────────────────────────────────────────
    // PATCH /api/short-stay/admin/disputes/:id/resolve
    resolveDispute: builder.mutation<
      { message: string; code: string },
      { id: string; status: 'resolved_guest' | 'resolved_host' | 'escalated'; resolution_notes: string; refund_amount_kes?: number }
    >({
      query: ({ id, ...body }) => ({
        url: `short-stay/admin/disputes/${id}/resolve`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: ['Dispute', 'Booking'],
    }),

    // ── Admin: flag review ──────────────────────────────────────────────────
    // PATCH /api/short-stay/admin/reviews/:id/flag
    flagReview: builder.mutation<{ message: string; code: string }, string>({
      query: (id) => ({ url: `short-stay/admin/reviews/${id}/flag`, method: 'PATCH' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Review', id }],
    }),

    // ── Admin: remove review ────────────────────────────────────────────────
    // DELETE /api/short-stay/admin/reviews/:id
    removeReview: builder.mutation<{ message: string; code: string }, string>({
      query: (id) => ({ url: `short-stay/admin/reviews/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [{ type: 'Review', id }],
    }),
  }),
});

export const {
  useCheckAvailabilityQuery,
  useGetCalendarQuery,
  useGetPriceQuoteQuery,
  useGetPropertyReviewsQuery,
  useCreateBookingMutation,
  useGetBookingDetailQuery,
  useGetMyGuestBookingsQuery,
  useGetMyHostBookingsQuery,
  useCancelBookingMutation,
  useRecordCheckinMutation,
  useConfirmCheckinMutation,
  useSubmitPropertyReviewMutation,
  useSubmitGuestReviewMutation,
  useReplyToReviewMutation,
  useRaiseDisputeMutation,
  useGetAllBookingsAdminQuery,
  useGetAdminDisputesQuery,
  useResolveDisputeMutation,
  useFlagReviewMutation,
  useRemoveReviewMutation,
} = ShortStayApi;

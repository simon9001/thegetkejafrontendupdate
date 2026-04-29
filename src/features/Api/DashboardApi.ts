// frontend/src/features/Api/DashboardApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export interface LandlordKpi {
  properties:  { total: number };
  tenancies:   { active: number; pending_applications: number };
  visits:      { pending: number };
  earnings:    { total_kes: number };
  messages:    { unread: number };
  short_stay:  { upcoming_bookings: number };
  boosts:      { active: number };
  generated_at: string;
  code?: string;
}

export interface LandlordTenant {
  id:              string;
  property_id:     string;
  property_title:  string;
  status:          string;
  type:            'long_term' | 'short_stay';
  // long-term fields
  monthly_rent_kes?: number;
  start_date?:       string;
  end_date?:         string;
  tenant?:           { id: string; full_name: string; email: string; phone: string; avatar_url: string };
  // short-stay fields
  check_in_date?:    string;
  check_out_date?:   string;
  guests_count?:     number;
  total_kes?:        number;
  booking_ref?:      string;
  guest?:            { id: string; full_name: string; email: string; phone: string; avatar_url: string };
}

export interface LandlordTenantsResponse {
  long_term:         LandlordTenant[];
  short_stay_guests: LandlordTenant[];
  total:             number;
}

export interface ShortStayTransaction {
  id:              string;
  booking_ref:     string;
  check_in_date:   string;
  check_out_date:  string;
  status:          string;
  total_kes:       number;
  host_payout_kes: number;
  platform_fee_kes:number;
  created_at:      string;
  property:        { id: string; title: string } | null;
  guest:           { id: string; full_name: string; email: string } | null;
}

export interface ShortStayPayments {
  transactions: ShortStayTransaction[];
  total:        number;
  page:         number;
  limit:        number;
  summary: {
    total_revenue_kes:    number;
    pending_payments_kes: number;
    this_month_kes:       number;
  };
}

export interface LandlordFullReport {
  total_properties:   number;
  occupancy_rate_pct: number;
  short_stay: {
    bookings:        number;
    revenue_kes:     number;
    avg_stay_nights: number;
  };
  long_term: {
    active_tenancies:     number;
    monthly_income_kes:   number;
    pending_applications: number;
  };
  by_category:  Record<string, number>;
  generated_at: string;
}

// Unified stats shape (backend returns role-specific subset)
export interface DashboardStats {
  // Landlord / Agent
  ownedProperties?:   number;
  activeBookings?:    number;
  totalRent?:         number;
  activeCaretakers?:  number;
  // Caretaker
  managedUnits?:      number;
  openTickets?:       number;
  completedJobs?:     number;
  // Verifier
  pendingProperties?:         number;
  pendingUserVerifications?:  number;
  activeDisputes?:            number;
  // Admin
  totalUsers?:                number;
  totalProperties?:           number;
  pendingVerifications?:      number;
  monthlyRevenue?:            number;
}

export const DashboardApi = createApi({
  reducerPath: 'dashboardApi',
  baseQuery:   baseQueryWithReauth,
  tagTypes:    ['Dashboard', 'Users', 'ShortStay', 'Profile', 'LandlordTenants', 'LandlordPayments', 'LandlordReports'],
  endpoints: (builder) => ({

    // ── Unified role-aware dashboard stats ──────────────────────────────────
    getDashboardStats: builder.query<DashboardStats, void>({
      query: () => 'dashboard/stats',
      providesTags: ['Dashboard', 'Profile'],
    }),

    // ── Landlord dashboard ──────────────────────────────────────────────────
    getLandlordDashboard: builder.query<LandlordKpi, void>({
      query: () => 'landlord/dashboard',
      providesTags: ['Dashboard'],
    }),

    // ── Landlord tenants (long-term + short-stay guests) ─────────────────
    getLandlordTenants: builder.query<LandlordTenantsResponse, void>({
      query: () => 'landlord/tenants',
      providesTags: ['LandlordTenants'],
    }),

    // ── Short-stay payments ───────────────────────────────────────────────
    getLandlordShortStayPayments: builder.query<ShortStayPayments, { page?: number; limit?: number } | void>({
      query: (params) => {
        const p = params ?? {};
        const qs = new URLSearchParams();
        if ((p as any).page)  qs.set('page',  String((p as any).page));
        if ((p as any).limit) qs.set('limit', String((p as any).limit));
        const q = qs.toString();
        return `landlord/short-stay/payments${q ? '?' + q : ''}`;
      },
      providesTags: ['LandlordPayments'],
    }),

    // ── Full reports ──────────────────────────────────────────────────────
    getLandlordFullReport: builder.query<LandlordFullReport, void>({
      query: () => 'landlord/reports/full',
      providesTags: ['LandlordReports'],
    }),

    // ── Admin user list ─────────────────────────────────────────────────────
    // Backend: GET /api/users  (super_admin / staff only)
    getUsers: builder.query<any, { page?: number; limit?: number; search?: string; status?: string; role?: string }>({
      query: ({ page = 1, limit = 10, search = '', status, role } = {}) => {
        const q = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (search) q.set('search', search);
        if (status) q.set('status', status);
        if (role)   q.set('role', role);
        return `users?${q}`;
      },
      providesTags: ['Users'],
    }),

    // ── Role management ─────────────────────────────────────────────────────
    // Backend: PATCH /api/users/:id/roles
    updateUserRole: builder.mutation<any, { id: string; roles: string[] }>({
      query: ({ id, roles }) => ({
        url: `users/${id}/roles`,
        method: 'PATCH',
        body: { roles },
      }),
      invalidatesTags: ['Users'],
    }),

    // ── Account status ──────────────────────────────────────────────────────
    // Backend: PATCH /api/users/:id/status
    // status: 'active' | 'suspended' | 'banned' | 'pending_verify'
    updateUserStatus: builder.mutation<any, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url: `users/${id}/status`,
        method: 'PATCH',
        body: { status },
      }),
      invalidatesTags: ['Users'],
    }),
  }),
});

export const {
  useGetDashboardStatsQuery,
  useGetLandlordDashboardQuery,
  useGetLandlordTenantsQuery,
  useGetLandlordShortStayPaymentsQuery,
  useGetLandlordFullReportQuery,
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
} = DashboardApi;

// frontend/src/features/Api/DashboardApi.ts
// Maps to actual backend routes:
//   GET /api/landlord/dashboard  → landlord KPI cards
//   GET /api/users               → admin user list
//   PATCH /api/users/:id/roles   → update roles
//   PATCH /api/users/:id/status  → update account status
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
  tagTypes:    ['Dashboard', 'Users', 'ShortStay', 'Profile'],
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
  useGetUsersQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
} = DashboardApi;

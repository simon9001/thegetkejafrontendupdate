// frontend/src/features/Api/UsersApi.ts
// Maps to actual backend routes:
//   GET    /api/users           → paginated user list  (admin/staff)
//   GET    /api/users/:id       → single user profile  (admin/staff)
//   PATCH  /api/users/:id/roles   → assign / revoke roles (admin/staff)
//   PATCH  /api/users/:id/status  → change account_status (admin/staff)
//   DELETE /api/users/:id       → soft-delete user    (admin/staff)
//   GET    /api/users/me        → own full profile     (any authenticated)
//   PUT    /api/users/me        → update own profile   (any authenticated)
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export interface UserProfile {
  id:             string;
  email:          string;
  full_name:      string;
  display_name?:  string;
  avatar_url?:    string;
  county?:        string;
  whatsapp_number?: string;
  preferred_language?: string;
  phone?:         string;
  email_verified: boolean;
  phone_verified?: boolean;
  account_status: 'active' | 'suspended' | 'banned' | 'pending_verify';
  auth_provider:  'local' | 'google';
  roles:          string[];
  created_at:     string;
  profiles?: {
    seeker?:    Record<string, unknown>;
    landlord?:  Record<string, unknown>;
    agent?:     Record<string, unknown>;
    caretaker?: Record<string, unknown>;
  };
}

export interface UpdateProfileRequest {
  full_name?:         string;
  display_name?:      string;
  avatar_url?:        string;
  county?:            string;
  whatsapp_number?:   string;
  preferred_language?: string;
}

export const UsersApi = createApi({
  reducerPath: 'usersApi',
  baseQuery:   baseQueryWithReauth,
  tagTypes:    ['User', 'MyProfile'],
  endpoints: (builder) => ({

    // ── Admin: list all users ──────────────────────────────────────────────
    getAllUsers: builder.query<
      { users: UserProfile[]; total: number; page: number; limit: number; pages: number },
      { page?: number; limit?: number; search?: string; status?: string; role?: string } | void
    >({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.page)   q.set('page', String(params.page));
        if (params?.limit)  q.set('limit', String(params.limit ?? 20));
        if (params?.search) q.set('search', params.search);
        if (params?.status) q.set('status', params.status);
        if (params?.role)   q.set('role', params.role);
        const qs = q.toString();
        return qs ? `users?${qs}` : 'users';
      },
      providesTags: (result) =>
        result?.users
          ? [
              ...result.users.map(({ id }) => ({ type: 'User' as const, id })),
              { type: 'User', id: 'LIST' },
            ]
          : [{ type: 'User', id: 'LIST' }],
    }),

    // ── Admin: get single user ─────────────────────────────────────────────
    getUserById: builder.query<{ user: UserProfile; code: string }, string>({
      query: (id) => `users/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'User', id }],
    }),

    // ── Admin: assign / revoke roles ───────────────────────────────────────
    // Backend: PATCH /api/users/:id/roles  (was incorrectly /role without 's')
    updateUserRole: builder.mutation<{ message: string; code: string }, { id: string; roles: string[] }>({
      query: ({ id, roles }) => ({
        url:    `users/${id}/roles`,
        method: 'PATCH',
        body:   { roles },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
    }),

    // ── Admin: change account_status ───────────────────────────────────────
    // status: 'active' | 'suspended' | 'banned' | 'pending_verify'
    updateUserStatus: builder.mutation<{ message: string; code: string }, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url:    `users/${id}/status`,
        method: 'PATCH',
        body:   { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
    }),

    // ── Admin: soft-delete user ────────────────────────────────────────────
    deleteUser: builder.mutation<{ message: string; code: string }, string>({
      query: (id) => ({
        url:    `users/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    // ── Self: get own full profile ─────────────────────────────────────────
    getMyProfile: builder.query<{ user: UserProfile; code: string }, void>({
      query: () => 'users/me',
      providesTags: ['MyProfile'],
    }),

    // ── Self: update own base profile ──────────────────────────────────────
    updateMyProfile: builder.mutation<{ message: string; code: string }, UpdateProfileRequest>({
      query: (updates) => ({
        url:    'users/me',
        method: 'PUT',
        body:   updates,
      }),
      invalidatesTags: ['MyProfile'],
    }),

    // ── Self: submit ID / role verification request ────────────────────────
    // Creates a row in id_verifications with status='pending' for staff to review.
    // On approval the backend upgrades the user's role to landlord or developer.
    submitVerification: builder.mutation<{ message: string; code: string }, {
      requested_role:  'landlord' | 'developer' | 'agent';
      doc_type:        'national_id' | 'passport' | 'company_cert' | 'earb_license' | 'nca_cert';
      doc_number?:     string;
      front_image?:    string;   // base64 dataUrl
      back_image?:     string;   // base64 dataUrl
      selfie?:         string;   // base64 dataUrl
      // developer extras
      company_name?:   string;
      kra_pin?:        string;
      nca_reg_number?: string;
    }>({
      query: (body) => ({
        url:    'users/me/verification',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['MyProfile'],
    }),
  }),
});

export const {
  useGetAllUsersQuery,
  useGetUserByIdQuery,
  useUpdateUserRoleMutation,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useGetMyProfileQuery,
  useUpdateMyProfileMutation,
  useSubmitVerificationMutation,
} = UsersApi;

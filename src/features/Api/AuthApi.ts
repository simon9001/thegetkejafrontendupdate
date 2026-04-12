// frontend/src/features/Api/AuthApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

// ---------------------------------------------------------------------------
// Request types
// ---------------------------------------------------------------------------
export interface RegisterRequest {
  full_name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ResendVerificationRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface LogoutRequest {
  refreshToken?: string;
  logoutAll?: boolean;
}

// ---------------------------------------------------------------------------
// Response types — aligned with auth.service.ts return shapes
// ---------------------------------------------------------------------------

/** The user object returned inside login / Google callback responses */
export interface AuthUser {
  id: string;
  email: string;
  roles: string[];
  /** Optional: present on getProfile but not on login */
  full_name?: string;
  display_name?: string;
  avatar_url?: string;
  phone?: string;
  email_verified?: boolean;
  auth_provider?: string;
  account_status?: string;
  created_at?: string;
  county?: string;
  whatsapp_number?: string;
}

/** Returned by POST /auth/login on success */
export interface LoginResponse {
  message: string;
  code: 'LOGIN_SUCCESS';
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
}

/** Returned by POST /auth/login on auth failure (4xx) */
export interface LoginErrorResponse {
  message: string;
  code:
    | 'INVALID_CREDENTIALS'
    | 'EMAIL_NOT_VERIFIED'
    | 'ACCOUNT_LOCKED'
    | 'ACCOUNT_BANNED'
    | 'SERVER_ERROR';
  userId?: string;
  canResend?: boolean;
}

/** Returned by POST /auth/register (201) */
export interface RegisterResponse {
  message: string;
  code: 'REGISTRATION_SUCCESS';
  user?: {
    id: string;
    email: string;
    account_status: string;
  };
}

/** Returned by GET /auth/verify-email */
export interface VerifyEmailResponse {
  message: string;
  code: 'VERIFICATION_SUCCESS' | 'ALREADY_VERIFIED';
}

/** Returned by POST /auth/resend-verification */
export interface ResendVerificationResponse {
  message: string;
  code: 'RESEND_SUCCESS';
}

/** Returned by POST /auth/forgot-password */
export interface ForgotPasswordResponse {
  message: string;
  code: 'FORGOT_PASSWORD_SUCCESS';
}

/** Returned by POST /auth/reset-password */
export interface ResetPasswordResponse {
  message: string;
  code: 'RESET_PASSWORD_SUCCESS';
}

/** Returned by POST /auth/change-password */
export interface ChangePasswordResponse {
  message: string;
  code: 'PASSWORD_CHANGED';
}

/** Returned by POST /auth/refresh-token */
export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  code: 'TOKEN_REFRESHED';
}

/** Returned by POST /auth/logout */
export interface LogoutResponse {
  message: string;
  code: 'LOGOUT_SUCCESS' | 'LOGOUT_ALL_SUCCESS';
}

/** Returned by POST /auth/logout-others */
export interface LogoutOthersResponse {
  message: string;
  code: 'LOGOUT_OTHERS_SUCCESS';
  devicesLoggedOut: number;
}

/** One session entry from GET /auth/sessions */
export interface SessionInfo {
  id: string;
  deviceType: string;
  userAgent: string;
  ipAddress: string | null;
  createdAt: string;
  expiresAt: string;
}

/** Returned by GET /auth/sessions */
export interface SessionsResponse {
  sessions: SessionInfo[];
  total: number;
  code: 'SESSIONS_FETCHED';
}

/** Returned by DELETE /auth/sessions/:sessionId */
export interface RevokeSessionResponse {
  message: string;
  code: 'SESSION_REVOKED';
}

/** Returned by GET /auth/profile */
export interface ProfileResponse {
  user: AuthUser;
  code: 'PROFILE_FETCHED';
}

// ---------------------------------------------------------------------------
// API slice
// ---------------------------------------------------------------------------
export const AuthApi = createApi({
  reducerPath: 'authApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Auth', 'Sessions', 'Profile'],
  endpoints: (builder) => ({

    // ------------------------------------------------------------------
    // Public — no token required
    // ------------------------------------------------------------------
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: 'auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    register: builder.mutation<RegisterResponse, RegisterRequest>({
      query: (userInfo) => ({
        url: 'auth/register',
        method: 'POST',
        body: userInfo,
      }),
    }),

    verifyEmail: builder.query<VerifyEmailResponse, string>({
      query: (token) => ({
        url: `auth/verify-email?token=${token}`,
        method: 'GET',
      }),
    }),

    resendVerification: builder.mutation<ResendVerificationResponse, ResendVerificationRequest>({
      query: (data) => ({
        url: 'auth/resend-verification',
        method: 'POST',
        body: data,
      }),
    }),

    forgotPassword: builder.mutation<ForgotPasswordResponse, ForgotPasswordRequest>({
      query: (data) => ({
        url: 'auth/forgot-password',
        method: 'POST',
        body: data,
      }),
    }),

    resetPassword: builder.mutation<ResetPasswordResponse, ResetPasswordRequest>({
      query: (data) => ({
        url: 'auth/reset-password',
        method: 'POST',
        body: data,
      }),
    }),

    refreshToken: builder.mutation<RefreshTokenResponse, RefreshTokenRequest>({
      query: (data) => ({
        url: 'auth/refresh-token',
        method: 'POST',
        body: data,
      }),
    }),

    // ------------------------------------------------------------------
    // Protected — requires Bearer token (handled by baseQueryWithReauth)
    // ------------------------------------------------------------------
    logout: builder.mutation<LogoutResponse, LogoutRequest>({
      query: (body) => ({
        url: 'auth/logout',
        method: 'POST',
        body,
      }),
      // Invalidate profile/session cache on logout
      invalidatesTags: ['Profile', 'Sessions'],
    }),

    logoutOthers: builder.mutation<LogoutOthersResponse, RefreshTokenRequest>({
      query: (body) => ({
        url: 'auth/logout-others',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Sessions'],
    }),

    changePassword: builder.mutation<ChangePasswordResponse, ChangePasswordRequest>({
      query: (data) => ({
        url: 'auth/change-password',
        method: 'POST',
        body: data,
      }),
    }),

    getProfile: builder.query<ProfileResponse, void>({
      query: () => ({
        url: 'auth/profile',
        method: 'GET',
      }),
      providesTags: ['Profile'],
    }),

    getSessions: builder.query<SessionsResponse, void>({
      query: () => ({
        url: 'auth/sessions',
        method: 'GET',
      }),
      providesTags: ['Sessions'],
    }),

    revokeSession: builder.mutation<RevokeSessionResponse, string>({
      query: (sessionId) => ({
        url: `auth/sessions/${sessionId}`,
        method: 'DELETE',
      }),
      invalidatesTags: ['Sessions'],
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useVerifyEmailQuery,
  useLazyVerifyEmailQuery,
  useResendVerificationMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRefreshTokenMutation,
  useLogoutMutation,
  useLogoutOthersMutation,
  useChangePasswordMutation,
  useGetProfileQuery,
  useLazyGetProfileQuery,
  useGetSessionsQuery,
  useRevokeSessionMutation,
} = AuthApi;
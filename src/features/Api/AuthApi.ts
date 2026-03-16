// frontend/src/features/Api/AuthApi.ts
import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

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

export interface AuthResponse {
    message: string;
    code?: string;
    accessToken?: string;
    refreshToken?: string;
    user?: {
        id: string;
        full_name: string;
        email: string;
        roles: string[];
    };
    userId?: string;
    canResend?: boolean;
}

export interface VerifyEmailResponse {
    message: string;
    code: string;
}

export const AuthApi = createApi({
    reducerPath: 'authApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Auth'],
    endpoints: (builder) => ({
        login: builder.mutation<AuthResponse, LoginRequest>({
            query: (credentials) => ({
                url: 'auth/login',
                method: 'POST',
                body: credentials,
            }),
        }),
        register: builder.mutation<AuthResponse, RegisterRequest>({
            query: (userInfo) => ({
                url: 'auth/register',
                method: 'POST',
                body: userInfo,
            }),
        }),
        logout: builder.mutation<{ success: boolean; code?: string }, { refreshToken?: string }>({
            query: (body) => ({
                url: 'auth/logout',
                method: 'POST',
                body
            }),
        }),
        verifyEmail: builder.query<VerifyEmailResponse, string>({
            query: (token) => ({
                url: `auth/verify-email?token=${token}`,
                method: 'GET',
            }),
        }),
        resendVerification: builder.mutation<AuthResponse, ResendVerificationRequest>({
            query: (data) => ({
                url: 'auth/resend-verification',
                method: 'POST',
                body: data,
            }),
        }),
        forgotPassword: builder.mutation<AuthResponse, { email: string }>({
            query: (data) => ({
                url: 'auth/forgot-password',
                method: 'POST',
                body: data,
            }),
        }),
        resetPassword: builder.mutation<AuthResponse, { token: string; password: string }>({
            query: (data) => ({
                url: 'auth/reset-password',
                method: 'POST',
                body: data,
            }),
        }),
    }),
})

export const {
    useLoginMutation,
    useRegisterMutation,
    useLogoutMutation,
    useVerifyEmailQuery,
    useLazyVerifyEmailQuery,
    useResendVerificationMutation,
    useForgotPasswordMutation,
    useResetPasswordMutation,
} = AuthApi;
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export const DashboardApi = createApi({
    reducerPath: 'dashboardApi',
    baseQuery: baseQueryWithReauth,
    endpoints: (builder) => ({
        getDashboardStats: builder.query<any, void>({
            query: () => '/dashboard/stats',
        }),
        getUsers: builder.query<any, { page?: number; limit?: number; search?: string }>({
            query: ({ page = 1, limit = 10, search = '' }) => ({
                url: '/users',
                params: { page, limit, search },
            }),
        }),
        updateUserRole: builder.mutation<any, { id: string; roles: string[] }>({
            query: ({ id, roles }) => ({
                url: `/users/${id}/role`,
                method: 'PATCH',
                body: { roles },
            }),
        }),
        updateUserStatus: builder.mutation<any, { id: string; status: string }>({
            query: ({ id, status }) => ({
                url: `/users/${id}/status`,
                method: 'PATCH',
                body: { status },
            }),
        }),
    }),
});

export const {
    useGetDashboardStatsQuery,
    useGetUsersQuery,
    useUpdateUserRoleMutation,
    useUpdateUserStatusMutation
} = DashboardApi;

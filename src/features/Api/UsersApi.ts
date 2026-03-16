// frontend/src/features/Api/UsersApi.ts
import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export interface UserProfile {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    created_at: string;
    email_verified: boolean;
    is_active: boolean;
    roles: string[];
    status: 'pending' | 'approved' | 'rejected';
}

export const UsersApi = createApi({
    reducerPath: 'usersApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['User'],
    endpoints: (builder) => ({
        getAllUsers: builder.query<{ users: UserProfile[], total: number }, { page?: number, limit?: number, search?: string } | void>({
            query: (params) => ({
                url: 'users',
                method: 'GET',
                params: params || undefined,
            }),
            providesTags: (result) =>
                result?.users
                    ? [
                        ...result.users.map(({ id }) => ({ type: 'User' as const, id })),
                        { type: 'User', id: 'LIST' }
                    ]
                    : [{ type: 'User', id: 'LIST' }],
        }),
        updateUserRole: builder.mutation<{ success: boolean }, { id: string, roles: string[] }>({
            query: ({ id, roles }) => ({
                url: `users/${id}/role`,
                method: 'PATCH',
                body: { roles },
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
        }),
        updateUserStatus: builder.mutation<{ success: boolean }, { id: string, status: string | boolean }>({
            query: ({ id, status }) => ({
                url: `users/${id}/status`,
                method: 'PATCH',
                body: { status },
            }),
            invalidatesTags: (_result, _error, { id }) => [{ type: 'User', id }, { type: 'User', id: 'LIST' }],
        }),
        deleteUser: builder.mutation<{ success: boolean }, string>({
            query: (id) => ({
                url: `users/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: [{ type: 'User', id: 'LIST' }],
        }),
    }),
})

export const {
    useGetAllUsersQuery,
    useUpdateUserRoleMutation,
    useUpdateUserStatusMutation,
    useDeleteUserMutation,
} = UsersApi

// frontend/src/features/Api/SavedPropertiesApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';
import type { SavedProperty } from '../Slice/SavedPropertiesSlice';

export const SavedPropertiesApi = createApi({
    reducerPath: 'savedPropertiesApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['SavedProperties'],
    endpoints: (builder) => ({
        getSavedProperties: builder.query<SavedProperty[], void>({
            query: () => 'user/saved-properties',
            providesTags: ['SavedProperties'],
        }),
        saveProperty: builder.mutation<{ message: string }, { propertyId: number }>({
            query: (data) => ({
                url: 'user/saved-properties',
                method: 'POST',
                body: data,
            }),
            invalidatesTags: ['SavedProperties'],
        }),
        removeSavedProperty: builder.mutation<{ message: string }, { propertyId: number }>({
            query: ({ propertyId }) => ({
                url: `user/saved-properties/${propertyId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['SavedProperties'],
        }),
        syncSavedProperties: builder.mutation<{ message: string }, SavedProperty[]>({
            query: (properties) => ({
                url: 'user/saved-properties/sync',
                method: 'POST',
                body: { properties },
            }),
            invalidatesTags: ['SavedProperties'],
        }),
    }),
});

export const {
    useGetSavedPropertiesQuery,
    useSavePropertyMutation,
    useRemoveSavedPropertyMutation,
    useSyncSavedPropertiesMutation,
} = SavedPropertiesApi;
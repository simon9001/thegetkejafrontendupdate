// frontend/src/features/Api/PropertiesApi.ts
import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export interface Property {
    id: string;
    title: string;
    description?: string;
    property_type: string;
    price_per_month?: number;
    price_per_night?: number;
    currency: string;
    status: string;
    bedrooms: number;
    bathrooms: number;
    size_sqm?: number;
    images?: Array<{ image_url: string; is_primary: boolean }>;
    location?: {
        address?: string;
        town?: string;
        county?: string;
        location: {
            type: 'Point';
            coordinates: [number, number];
        };
    };
    amenities?: Array<{ name: string; icon_name: string; details?: string }>;
    neighborhood?: {
        community_vibe?: string;
        light_exposure?: string;
        crime_rating?: string;
        noise_level?: string;
    };
    avatar_url?: string;
    is_verified?: boolean;
    is_boosted?: boolean;
    is_struck?: boolean;
    category?: string;
    created_at?: string;
    owner?: {
        id: string;
        full_name: string;
        email: string;
        phone: string;
        avatar_url?: string;
    };
    price?: number;
    capacity?: number;
    views_count?: number;
    type?: string;
    size?: number;
    price_per_day?: number;

    // New fields
    furnished_status?: string;
    lease_duration?: string;
    notice_period?: string;
    is_pet_friendly?: boolean;
    is_smoking_allowed?: boolean;
    has_parking?: boolean;
    parking_spots?: number;
    floor_level?: string;
    year_built?: number;
    water_included?: boolean;
    electricity_included?: boolean;
    internet_included?: boolean;
    garbage_included?: boolean;
    contact_number?: string;
    security_deposit?: number;
    cleaning_fee?: number;
    service_fee?: number;
    tax_amount?: number;
}

export const PropertiesApi = createApi({
    reducerPath: 'propertiesApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Property'],
    endpoints: (builder) => ({
        getProperties: builder.query<{ properties: Property[], total: number }, any>({
            query: (params) => ({
                url: 'properties',
                method: 'GET',
                params,
            }),
            providesTags: (result) =>
                result?.properties
                    ? [
                        ...result.properties.map(({ id }) => ({ type: 'Property' as const, id })),
                        { type: 'Property', id: 'LIST' }
                    ]
                    : [{ type: 'Property', id: 'LIST' }],
        }),
        searchNatural: builder.query<{ properties: Property[], total: number }, string>({
            query: (q) => ({
                url: 'properties/search/natural',
                method: 'GET',
                params: { q },
            }),
            providesTags: (result) =>
                result?.properties
                    ? [
                        ...result.properties.map(({ id }) => ({ type: 'Property' as const, id })),
                        { type: 'Property', id: 'SEARCH' }
                    ]
                    : [{ type: 'Property', id: 'SEARCH' }],
        }),
        getPropertyById: builder.query<Property, string>({
            query: (id) => `properties/${id}`,
            providesTags: (_result, _error, id) => [{ type: 'Property', id }],
        }),
        createProperty: builder.mutation<{ message: string; code: string; property: Property }, any>({
            query: (body) => ({
                url: 'properties',
                method: 'POST',
                body,
            }),
            invalidatesTags: ['Property'],
        }),
        getMyProperties: builder.query<{ properties: Property[], total: number }, { status?: string } | void>({
            query: (params) => ({
                url: 'properties/my-properties',
                method: 'GET',
                params: params || undefined,
            }),
            providesTags: ['Property'],
        }),
        getUnverifiedProperties: builder.query<{ properties: Property[], total: number }, void>({
            query: () => 'properties/admin/unverified',
            providesTags: ['Property'],
        }),
        verifyProperty: builder.mutation<{ message: string; property: Property }, string>({
            query: (id) => ({
                url: `properties/${id}/verify`,
                method: 'PATCH',
            }),
            invalidatesTags: ['Property'],
        }),
        rejectProperty: builder.mutation<{ message: string; property: Property }, { id: string; reason?: string }>({
            query: ({ id, reason }) => ({
                url: `properties/${id}/reject`,
                method: 'PATCH',
                body: { reason },
            }),
            invalidatesTags: ['Property'],
        }),
        getAllProperties: builder.query<{ properties: Property[], total: number }, void>({
            query: () => 'properties/all-properties',
            providesTags: ['Property'],
        }),
        deleteProperty: builder.mutation<{ message: string }, string>({
            query: (id) => ({
                url: `properties/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Property'],
        }),
        strikeProperty: builder.mutation<{ message: string; property: Property }, { id: string; isStruck: boolean }>({
            query: ({ id, isStruck }) => ({
                url: `properties/${id}/strike`,
                method: 'PATCH',
                body: { isStruck },
            }),
            invalidatesTags: ['Property'],
        }),
        boostProperty: builder.mutation<{ message: string; property: Property }, { id: string; isBoosted: boolean }>({
            query: ({ id, isBoosted }) => ({
                url: `properties/${id}/boost`,
                method: 'PATCH',
                body: { isBoosted },
            }),
            invalidatesTags: ['Property'],
        }),
        uploadPropertyImages: builder.mutation<
            { images: { url: string; public_id: string }[] },
            FormData
        >({
            query: (formData) => ({
                url: 'upload/images',
                method: 'POST',
                body: formData,
            }),
        }),
        searchExternalPlaces: builder.query<any[], string>({
            query: (q) => ({
                url: 'spatial/search-external',
                method: 'GET',
                params: { q },
            }),
        }),
        linkLandmark: builder.mutation<any, { propertyId: string, landmark: any }>({
            query: (body) => ({
                url: 'spatial/link-landmark',
                method: 'POST',
                body,
            }),
        }),
    }),
})

export const {
    useGetPropertiesQuery,
    useSearchNaturalQuery,
    useGetPropertyByIdQuery,
    useCreatePropertyMutation,
    useGetMyPropertiesQuery,
    useGetUnverifiedPropertiesQuery,
    useVerifyPropertyMutation,
    useRejectPropertyMutation,
    useGetAllPropertiesQuery,
    useDeletePropertyMutation,
    useStrikePropertyMutation,
    useBoostPropertyMutation,
    useUploadPropertyImagesMutation,
    useSearchExternalPlacesQuery,
    useLazySearchExternalPlacesQuery,
    useLinkLandmarkMutation,
} = PropertiesApi

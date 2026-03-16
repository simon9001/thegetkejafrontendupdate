// frontend/src/features/Api/SpatialApi.ts
import { createApi } from '@reduxjs/toolkit/query/react'
import { baseQueryWithReauth } from './baseQuery'

export interface SpatialSearchResponse {
    center: { lat: number; lng: number };
    radius: number;
    count: number;
    properties: any[];
}

export interface ProximityIntelligence {
    coordinates: { lat: number; lng: number };
    landmarks: Array<{
        name: string;
        type: string;
        distance_meters: number;
        walking_time_mins: number;
    }>;
    nearest_road: {
        name: string;
        surface: string;
        distance_meters: number;
    } | null;
}

export const SpatialApi = createApi({
    reducerPath: 'spatialApi',
    baseQuery: baseQueryWithReauth,
    tagTypes: ['Spatial'],
    endpoints: (builder) => ({
        searchByRadius: builder.query<SpatialSearchResponse, { lat: number; lng: number; radius?: number; maxPrice?: number; minBedrooms?: number; q?: string }>({
            query: ({ lat, lng, radius, maxPrice, minBedrooms, q }) => ({
                url: 'spatial/search',
                method: 'GET',
                params: { lat, lng, radius, maxPrice, minBedrooms, q },
            }),
        }),
        getProximityIntelligence: builder.query<ProximityIntelligence, { lat: number; lng: number }>({
            query: ({ lat, lng }) => ({
                url: 'spatial/proximity',
                method: 'GET',
                params: { lat, lng },
            }),
        }),
    }),
})

export const {
    useSearchByRadiusQuery,
    useLazySearchByRadiusQuery,
    useGetProximityIntelligenceQuery,
} = SpatialApi

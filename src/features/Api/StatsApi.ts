import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export interface PlatformStats {
  verified_properties: number;
  happy_tenants:       number;
  counties_covered:    number;
}

export const statsApi = createApi({
  reducerPath: 'statsApi',
  baseQuery:   baseQueryWithReauth,
  endpoints: (builder) => ({
    getPlatformStats: builder.query<PlatformStats, void>({
      query: () => 'stats',
    }),
  }),
});

export const { useGetPlatformStatsQuery } = statsApi;

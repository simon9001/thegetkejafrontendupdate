import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export interface RoommateProfile {
  id:             string;
  displayName:    string;
  age:            number;
  gender:         'male' | 'female' | 'any';
  occupation?:    string;
  budgetMin:      number;
  budgetMax:      number;
  moveInDate:     string;
  area:           string;
  county:         string;
  bio:            string;
  lifestyle:      string[];
  photoUrl?:      string;
  connectedCount: number;
  postedAt:       string;
}

export interface RoommateListResponse {
  profiles: RoommateProfile[];
  total:    number;
  page:     number;
  limit:    number;
}

export interface RoommateConnection {
  profile_id: string;
  status:     'pending' | 'connected' | 'rejected';
}

export interface ListRoommateParams {
  search?:    string;
  gender?:    string;
  budgetMax?: number;
  area?:      string;
  page?:      number;
  limit?:     number;
}

export const RoommateApi = createApi({
  reducerPath: 'roommateApi',
  baseQuery:   baseQueryWithReauth,
  tagTypes:    ['RoommateProfiles', 'RoommateConnections'],
  endpoints:   (builder) => ({

    listRoommateProfiles: builder.query<RoommateListResponse, ListRoommateParams | void>({
      query: (params) => {
        const qs = new URLSearchParams();
        const p  = params ?? {};
        if ((p as any).search)    qs.set('search',    String((p as any).search));
        if ((p as any).gender)    qs.set('gender',    String((p as any).gender));
        if ((p as any).budgetMax) qs.set('budgetMax', String((p as any).budgetMax));
        if ((p as any).area)      qs.set('area',      String((p as any).area));
        if ((p as any).page)      qs.set('page',      String((p as any).page));
        if ((p as any).limit)     qs.set('limit',     String((p as any).limit));
        const q = qs.toString();
        return `roommate/profiles${q ? '?' + q : ''}`;
      },
      providesTags: ['RoommateProfiles'],
    }),

    createRoommateProfile: builder.mutation<{ profile: RoommateProfile }, Omit<RoommateProfile, 'id' | 'connectedCount' | 'postedAt'>>({
      query: (body) => ({
        url:    'roommate/profiles',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['RoommateProfiles'],
    }),

    sendRoommateConnect: builder.mutation<{ status: string }, string>({
      query: (profileId) => ({
        url:    `roommate/profiles/${profileId}/connect`,
        method: 'POST',
      }),
      invalidatesTags: ['RoommateConnections'],
    }),

    getMyRoommateConnections: builder.query<{ connections: RoommateConnection[] }, void>({
      query: () => 'roommate/connections',
      providesTags: ['RoommateConnections'],
    }),

  }),
});

export const {
  useListRoommateProfilesQuery,
  useCreateRoommateProfileMutation,
  useSendRoommateConnectMutation,
  useGetMyRoommateConnectionsQuery,
} = RoommateApi;

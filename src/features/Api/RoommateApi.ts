import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

// ── Shared types ──────────────────────────────────────────────────────────────

export interface MatchCard {
  id:             string;
  profileType:    'host' | 'seeker';
  displayName:    string;
  age:            number;
  gender:         string;
  occupation?:    string;
  bio:            string;
  lifestyle:      string[];
  photoUrl?:      string;
  area:           string;
  county:         string;
  workSchedule?:  string;
  totalScore:     number;
  lifestyleScore: number;
  softScore:      number;
  isStrongMatch:  boolean;
  // Host fields (when seeker views)
  roomType?:       string;
  furnishing?:     string;
  parking?:        boolean;
  wifi?:           boolean;
  availableFrom?:  string;
  rentAmount?:     number;
  billsIncluded?:  boolean;
  houseRules?:     string[];
  currentTenants?: number;
  // Seeker fields (when host views)
  budgetMin?:      number;
  budgetMax?:      number;
  preferredMoveIn?: string;
  maxHousemates?:  number;
  roomTypePref?:   string[];
}

export interface MyProfile {
  id:            string;
  profileType:   'host' | 'seeker';
  displayName:   string;
  age:           number;
  gender:        string;
  occupation?:   string;
  bio:           string;
  lifestyle:     string[];
  photoUrl?:     string;
  area:          string;
  county:        string;
  workSchedule?: string;
  isActive:      boolean;
  postedAt:      string;
  // Host
  roomType?:        string;
  bathrooms?:       string;
  furnishing?:      string;
  parking?:         boolean;
  wifi?:            boolean;
  availableFrom?:   string;
  rentAmount?:      number;
  billsIncluded?:   boolean;
  currentTenants?:  number;
  housemateGender?: string;
  housemateAgeMin?: number;
  housemateAgeMax?: number;
  houseRules?:      string[];
  whatsappNumber?:  string;
  // Seeker
  budgetMin?:       number;
  budgetMax?:       number;
  preferredMoveIn?: string;
  maxHousemates?:   number;
  roomTypePref?:    string[];
}

export interface RoommateConnection {
  id:              string;
  status:          'pending' | 'connected' | 'rejected';
  hostAccepted:    boolean;
  seekerAccepted:  boolean;
  initiatedByRole: 'host' | 'seeker';
  isMutual:        boolean;
  isHostParty:     boolean;
  isSeekerParty:   boolean;
  hostProfile: {
    id: string; displayName: string; area: string; county: string;
    bio: string; lifestyle: string[]; photoUrl?: string;
    roomType?: string; rentAmount?: number; availableFrom?: string;
    houseRules?: string[]; whatsappNumber?: string;
  } | null;
  seekerProfile: {
    id: string; displayName: string; area: string; county: string;
    bio: string; lifestyle: string[]; photoUrl?: string;
    budgetMin?: number; budgetMax?: number; preferredMoveIn?: string;
    whatsappNumber?: string;
  } | null;
  postedAt: string;
}

export interface CreateProfileBody {
  profileType:  'host' | 'seeker';
  displayName:  string;
  age:          number;
  gender:       string;
  occupation?:  string;
  bio:          string;
  lifestyle:    string[];
  area:         string;
  county:       string;
  workSchedule?: string;
  whatsappNumber?: string;
  dealBreakers?: string[];
  // Host
  roomType?:        string;
  bathrooms?:       string;
  furnishing?:      string;
  parking?:         boolean;
  wifi?:            boolean;
  availableFrom?:   string;
  rentAmount?:      number;
  billsIncluded?:   boolean;
  currentTenants?:  number;
  housemateGender?: string;
  housemateAgeMin?: number;
  housemateAgeMax?: number;
  houseRules?:      string[];
  propertyAddress?: string;
  // Seeker
  budgetMin?:       number;
  budgetMax?:       number;
  preferredMoveIn?: string;
  maxHousemates?:   number;
  roomTypePref?:    string[];
}

// ── API slice ─────────────────────────────────────────────────────────────────

export const RoommateApi = createApi({
  reducerPath: 'roommateApi',
  baseQuery:   baseQueryWithReauth,
  tagTypes:    ['RoommateProfiles', 'RoommateMatches', 'RoommateConnections'],
  endpoints:   (builder) => ({

    getMyRoommateProfiles: builder.query<{ profiles: MyProfile[] }, void>({
      query: () => 'roommate/profiles/me',
      providesTags: ['RoommateProfiles'],
    }),

    createRoommateProfile: builder.mutation<{ profile: MyProfile }, CreateProfileBody>({
      query: (body) => ({ url: 'roommate/profiles', method: 'POST', body }),
      invalidatesTags: ['RoommateProfiles', 'RoommateMatches'],
    }),

    deactivateRoommateProfile: builder.mutation<{ message: string }, string>({
      query: (id) => ({ url: `roommate/profiles/${id}`, method: 'DELETE' }),
      invalidatesTags: ['RoommateProfiles', 'RoommateMatches'],
    }),

    getMatchesAsHost: builder.query<{
      hostProfile: MyProfile;
      matches: MatchCard[];
      total: number; page: number; pages: number;
    }, { page?: number }>({
      query: ({ page = 1 } = {}) => `roommate/matches/as-host?page=${page}`,
      providesTags: ['RoommateMatches'],
    }),

    getMatchesAsSeeker: builder.query<{
      seekerProfile: MyProfile;
      matches: MatchCard[];
      total: number; page: number; pages: number;
    }, { page?: number }>({
      query: ({ page = 1 } = {}) => `roommate/matches/as-seeker?page=${page}`,
      providesTags: ['RoommateMatches'],
    }),

    sendRoommateConnection: builder.mutation<
      { connectionId: string; status: string },
      { targetProfileId: string; myProfileId: string }
    >({
      query: (body) => ({ url: 'roommate/connections', method: 'POST', body }),
      invalidatesTags: ['RoommateConnections'],
    }),

    respondToRoommateConnection: builder.mutation<
      { status: string; mutual: boolean },
      { connectionId: string; action: 'accept' | 'reject' }
    >({
      query: ({ connectionId, action }) => ({
        url:    `roommate/connections/${connectionId}`,
        method: 'PATCH',
        body:   { action },
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
  useGetMyRoommateProfilesQuery,
  useCreateRoommateProfileMutation,
  useDeactivateRoommateProfileMutation,
  useGetMatchesAsHostQuery,
  useGetMatchesAsSeekerQuery,
  useSendRoommateConnectionMutation,
  useRespondToRoommateConnectionMutation,
  useGetMyRoommateConnectionsQuery,
} = RoommateApi;

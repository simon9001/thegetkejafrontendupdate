// frontend/src/features/Api/LandlordApi.ts
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export interface TeamMember {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  avatar_url?: string;
  role: 'agent' | 'caretaker';
  status: 'active' | 'revoked';
  assigned_at: string;
  // For Agents
  can_edit_listing?: boolean;
  can_view_analytics?: boolean;
  can_manage_bookings?: boolean;
  // For Caretakers
  can_collect_rent?: boolean;
  property_title?: string;
  property_id?: string;
}

export interface SearchProfessionalResult {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
}

export const LandlordApi = createApi({
  reducerPath: 'landlordApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['Team', 'Properties'],
  endpoints: (builder) => ({
    // List all team members (Agents and Caretakers)
    listTeamMembers: builder.query<{ caretakers: TeamMember[]; agents: TeamMember[] }, void>({
      query: () => 'landlord/team',
      providesTags: ['Team'],
    }),

    // Search for existing agents or caretakers to invite
    searchProfessionals: builder.query<SearchProfessionalResult[], { query: string; role: 'agent' | 'caretaker' }>({
      query: ({ query, role }) => `landlord/professionals/search?query=${encodeURIComponent(query)}&role=${role}`,
    }),

    // Assign a new team member
    assignTeamMember: builder.mutation<any, {
      user_id: string;
      role: 'agent' | 'caretaker';
      property_id?: string;
      building_id?: string;
      permissions?: Record<string, boolean>;
    }>({
      query: (body) => ({
        url: 'landlord/team/assign',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Team'],
    }),

    // Revoke a team member's access
    revokeTeamMember: builder.mutation<any, { id: string; role: 'agent' | 'caretaker' }>({
      query: ({ id, role }) => ({
        url: `landlord/team/revoke/${id}`,
        method: 'DELETE',
        params: { role },
      }),
      invalidatesTags: ['Team'],
    }),
  }),
});

export const {
  useListTeamMembersQuery,
  useSearchProfessionalsQuery,
  useAssignTeamMemberMutation,
  useRevokeTeamMemberMutation,
} = LandlordApi;

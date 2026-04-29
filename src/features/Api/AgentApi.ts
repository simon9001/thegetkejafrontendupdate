import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export interface AgentKpi {
  total_listings:   number;
  pending_viewings: number;
  total_leads:      number;
  unread_messages:  number;
  active_boosts:    number;
  generated_at:     string;
  code?:            string;
}

export interface AgentViewing {
  id:         string;
  visit_date: string;
  visit_time: string;
  status:     string;
  notes:      string;
  created_at: string;
  property:   { id: string; title: string; location: { area: string; county: string } | null } | null;
  requester:  { id: string; full_name: string; email: string; phone: string } | null;
}

export interface AgentViewingsResponse {
  viewings: AgentViewing[];
  total:    number;
}

export interface AgentLead {
  id:              string;
  created_at:      string;
  unread_b:        number;
  last_message_at: string;
  property:        { id: string; title: string; listing_category: string; location: { area: string; county: string } | null } | null;
  seeker:          { id: string; full_name: string; email: string; phone: string } | null;
}

export interface AgentLeadsResponse {
  leads: AgentLead[];
  total: number;
}

export interface AgentDeal {
  id:         string;
  property:   string;
  client:     string;
  amount_kes: number;
  status:     string;
  date:       string;
}

export interface AgentCommissions {
  earned_this_month_kes: number;
  pending_kes:           number;
  annual_total_kes:      number;
  recent_deals:          AgentDeal[];
  commission_rate_pct:   number;
}

export interface AgentReports {
  total_listings:       number;
  active_tenancies:     number;
  pending_viewings:     number;
  total_leads:          number;
  conversion_rate_pct:  number;
  listings_by_category: Record<string, number>;
  generated_at:         string;
}

export const AgentApi = createApi({
  reducerPath: 'agentApi',
  baseQuery:   baseQueryWithReauth,
  tagTypes:    ['AgentDashboard', 'AgentViewings', 'AgentLeads', 'AgentCommissions', 'AgentReports'],
  endpoints:   (builder) => ({

    getAgentDashboard: builder.query<AgentKpi, void>({
      query: () => 'agent/dashboard',
      providesTags: ['AgentDashboard'],
    }),

    getAgentViewings: builder.query<AgentViewingsResponse, { status?: string } | void>({
      query: (params) => {
        const qs = params && (params as any).status ? `?status=${(params as any).status}` : '';
        return `agent/viewings${qs}`;
      },
      providesTags: ['AgentViewings'],
    }),

    getAgentLeads: builder.query<AgentLeadsResponse, void>({
      query: () => 'agent/leads',
      providesTags: ['AgentLeads'],
    }),

    getAgentCommissions: builder.query<AgentCommissions, void>({
      query: () => 'agent/commissions',
      providesTags: ['AgentCommissions'],
    }),

    getAgentReports: builder.query<AgentReports, void>({
      query: () => 'agent/reports',
      providesTags: ['AgentReports'],
    }),

  }),
});

export const {
  useGetAgentDashboardQuery,
  useGetAgentViewingsQuery,
  useGetAgentLeadsQuery,
  useGetAgentCommissionsQuery,
  useGetAgentReportsQuery,
} = AgentApi;

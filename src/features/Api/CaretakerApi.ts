import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export interface CaretakerKpi {
  total_units:          number;
  open_maintenance:     number;
  pending_complaints:   number;
  upcoming_move_ins:    number;
  upcoming_move_outs:   number;
  overdue_rent:         number;
  unread_notifications: number;
  generated_at:         string;
  code?:                string;
}

export interface MaintenanceRequest {
  id: string;
  property_id: string;
  unit_id?: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'completed' | 'cancelled';
  reported_by: string;
  assigned_to?: string;
  created_at: string;
  updated_at: string;
  property_title?: string;
  reporter_name?: string;
}

export interface CaretakerTenant {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone?: string;
  unit_id?: string;
  property_id?: string;
  status: 'active' | 'pending' | 'moved_out';
  move_in_date?: string;
  rent_amount?: number;
}

export interface UtilityReading {
  id: string;
  property_id: string;
  unit_id?: string;
  utility_type: 'water' | 'electricity' | 'gas';
  reading_value: number;
  reading_date: string;
  submitted_by: string;
  notes?: string;
}

export interface VisitorLog {
  id: string;
  property_id: string;
  visitor_name: string;
  visitor_phone?: string;
  host_unit?: string;
  check_in: string;
  check_out?: string;
  purpose?: string;
  logged_by: string;
}

export const CaretakerApi = createApi({
  reducerPath: 'caretakerApi',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['CaretakerDashboard', 'Maintenance', 'CaretakerTenants', 'Utilities', 'Visitors'],
  endpoints: (builder) => ({

    getCaretakerDashboard: builder.query<CaretakerKpi, void>({
      query: () => 'caretaker/dashboard',
      providesTags: ['CaretakerDashboard'],
    }),

    getMaintenanceRequests: builder.query<{ requests: MaintenanceRequest[]; total: number }, { status?: string; page?: number; limit?: number }>({
      query: ({ status, page = 1, limit = 20 } = {}) => {
        const q = new URLSearchParams({ page: String(page), limit: String(limit) });
        if (status) q.set('status', status);
        return `caretaker/maintenance?${q}`;
      },
      providesTags: ['Maintenance'],
    }),

    createMaintenanceRequest: builder.mutation<any, { property_id: string; title: string; description: string; priority: string; unit_id?: string }>({
      query: (body) => ({ url: 'caretaker/maintenance', method: 'POST', body }),
      invalidatesTags: ['Maintenance', 'CaretakerDashboard'],
    }),

    updateMaintenanceStatus: builder.mutation<any, { id: string; status: string; notes?: string }>({
      query: ({ id, ...body }) => ({ url: `caretaker/maintenance/${id}/status`, method: 'PATCH', body }),
      invalidatesTags: ['Maintenance', 'CaretakerDashboard'],
    }),

    completeMaintenance: builder.mutation<any, { id: string; completion_notes?: string }>({
      query: ({ id, ...body }) => ({ url: `caretaker/maintenance/${id}/complete`, method: 'POST', body }),
      invalidatesTags: ['Maintenance', 'CaretakerDashboard'],
    }),

    getCaretakerTenants: builder.query<{ tenants: CaretakerTenant[]; total: number }, { page?: number; limit?: number }>({
      query: ({ page = 1, limit = 20 } = {}) => `caretaker/tenants?page=${page}&limit=${limit}`,
      providesTags: ['CaretakerTenants'],
    }),

    getUtilityReadings: builder.query<{ readings: UtilityReading[]; total: number }, { property_id?: string; type?: string }>({
      query: (params = {}) => {
        const q = new URLSearchParams();
        Object.entries(params).forEach(([k, v]) => { if (v) q.set(k, v); });
        return `caretaker/utilities?${q}`;
      },
      providesTags: ['Utilities'],
    }),

    submitUtilityReading: builder.mutation<any, Omit<UtilityReading, 'id' | 'submitted_by'>>({
      query: (body) => ({ url: 'caretaker/utilities', method: 'POST', body }),
      invalidatesTags: ['Utilities'],
    }),

    getVisitorLogs: builder.query<{ visitors: VisitorLog[]; total: number }, { property_id?: string; page?: number }>({
      query: ({ property_id, page = 1 } = {}) => {
        const q = new URLSearchParams({ page: String(page) });
        if (property_id) q.set('property_id', property_id);
        return `caretaker/visitors?${q}`;
      },
      providesTags: ['Visitors'],
    }),

    logVisitor: builder.mutation<any, Omit<VisitorLog, 'id' | 'logged_by'>>({
      query: (body) => ({ url: 'caretaker/visitors', method: 'POST', body }),
      invalidatesTags: ['Visitors'],
    }),

    checkoutVisitor: builder.mutation<any, string>({
      query: (visitorId) => ({ url: `caretaker/visitors/${visitorId}/checkout`, method: 'PATCH' }),
      invalidatesTags: ['Visitors'],
    }),

    getAssignedProperties: builder.query<{ properties: any[]; total: number }, void>({
      query: () => 'caretaker/properties',
    }),

    getUpcomingMoveIns: builder.query<{ move_ins: any[] }, void>({
      query: () => 'caretaker/move-ins',
    }),

    getUpcomingMoveOuts: builder.query<{ move_outs: any[] }, void>({
      query: () => 'caretaker/move-outs',
    }),
  }),
});

export const {
  useGetCaretakerDashboardQuery,
  useGetMaintenanceRequestsQuery,
  useCreateMaintenanceRequestMutation,
  useUpdateMaintenanceStatusMutation,
  useCompleteMaintenanceMutation,
  useGetCaretakerTenantsQuery,
  useGetUtilityReadingsQuery,
  useSubmitUtilityReadingMutation,
  useGetVisitorLogsQuery,
  useLogVisitorMutation,
  useCheckoutVisitorMutation,
  useGetAssignedPropertiesQuery,
  useGetUpcomingMoveInsQuery,
  useGetUpcomingMoveOutsQuery,
} = CaretakerApi;

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export interface PipelineStats {
  total_enquiries:     number;
  reserved_units:      number;
  properties_for_sale: number;
  projected_sales_kes: number;
  pipeline_entries:    PipelineLead[];
  generated_at:        string;
  code?:               string;
}

export interface PipelineLead {
  id:         string;
  created_at: string;
  unread_b:   number;
  property:   { id: string; title: string; status: string } | null;
  requester:  { id: string; full_name: string; email: string; phone: string } | null;
}

export interface UnitTracker {
  total_units:     number;
  available:       number;
  let_out:         number;
  sold:            number;
  off_market:      number;
  under_offer:     number;
  by_category:     Record<string, number>;
  by_construction: Record<string, number>;
  properties:      UnitProperty[];
  generated_at:    string;
  code?:           string;
}

export interface UnitProperty {
  id:                  string;
  title:               string;
  status:              string;
  listing_category:    string;
  construction_status: string;
  bedrooms:            number;
  bathrooms:           number;
  property_type:       string;
  location:            { area: string; county: string; town: string } | null;
}

export const DeveloperApi = createApi({
  reducerPath: 'developerApi',
  baseQuery:   baseQueryWithReauth,
  tagTypes:    ['DeveloperPipeline', 'DeveloperUnits'],
  endpoints:   (builder) => ({

    getDeveloperPipeline: builder.query<PipelineStats, void>({
      query: () => 'developer/pipeline',
      providesTags: ['DeveloperPipeline'],
    }),

    getDeveloperUnits: builder.query<UnitTracker, void>({
      query: () => 'developer/units',
      providesTags: ['DeveloperUnits'],
    }),

  }),
});

export const {
  useGetDeveloperPipelineQuery,
  useGetDeveloperUnitsQuery,
} = DeveloperApi;

import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

export interface MovingCompany {
  id:             string;
  name:           string;
  logoInitials:   string;
  logoColor:      string;
  rating:         number;
  reviewCount:    number;
  coverageAreas:  string[];
  services:       string[];
  priceRange:     'budget' | 'mid' | 'premium';
  phone:          string;
  whatsapp:       string;
  email?:         string;
  verified:       boolean;
  tagline?:       string;
  yearsActive:    number;
  totalMoves:     number;
}

export interface MovingCompaniesResponse {
  companies: MovingCompany[];
}

export interface QuoteRequest {
  companyId:      string;
  fromLocation:   string;
  toLocation:     string;
  moveDate:       string;
  furnitureCount?: number;
  boxCount?:      number;
  specialItems?:  string;
  name:           string;
  phone:          string;
}

export interface QuoteResponse {
  id:           string;
  estimatedKes: number;
}

export interface CompanyRegistration {
  companyName:  string;
  contactName:  string;
  phone:        string;
  email:        string;
  areas?:       string;
}

export interface ListMovingParams {
  search?:     string;
  priceRange?: string;
  service?:    string;
}

export const MovingApi = createApi({
  reducerPath: 'movingApi',
  baseQuery:   baseQueryWithReauth,
  tagTypes:    ['MovingCompanies'],
  endpoints:   (builder) => ({

    listMovingCompanies: builder.query<MovingCompaniesResponse, ListMovingParams | void>({
      query: (params) => {
        const qs = new URLSearchParams();
        const p  = params ?? {};
        if ((p as any).search)     qs.set('search',     String((p as any).search));
        if ((p as any).priceRange) qs.set('priceRange', String((p as any).priceRange));
        if ((p as any).service)    qs.set('service',    String((p as any).service));
        const q = qs.toString();
        return `moving/companies${q ? '?' + q : ''}`;
      },
      providesTags: ['MovingCompanies'],
    }),

    submitMovingQuote: builder.mutation<QuoteResponse, QuoteRequest>({
      query: (body) => ({
        url:    'moving/quotes',
        method: 'POST',
        body,
      }),
    }),

    registerMovingCompany: builder.mutation<{ message: string }, CompanyRegistration>({
      query: (body) => ({
        url:    'moving/register',
        method: 'POST',
        body,
      }),
    }),

  }),
});

export const {
  useListMovingCompaniesQuery,
  useSubmitMovingQuoteMutation,
  useRegisterMovingCompanyMutation,
} = MovingApi;

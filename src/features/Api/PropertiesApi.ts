// frontend/src/features/Api/PropertiesApi.ts
// Maps to actual backend routes:
//   Landlord property CRUD  → /api/landlord/properties/…
//   Staff/admin moderation  → /api/staff/properties/…
//   Media uploads           → /api/landlord/properties/:id/media
import { createApi } from '@reduxjs/toolkit/query/react';
import { baseQueryWithReauth } from './baseQuery';

// ─── Shared types ────────────────────────────────────────────────────────────
export interface PropertyMedia {
  id:          string;
  url:         string;
  media_type:  'photo' | 'video' | 'floor_plan' | 'virtual_tour' | 'drone';
  is_cover:    boolean;
  created_at:  string;
}

export interface Property {
  id:              string;
  title:           string;
  description?:    string;
  listing_category?: string;     // rental_residential, rental_commercial, short_stay, …
  listing_type?:   string;       // apartment, house, villa, studio, …
  property_type?:  string;       // alias used in legacy UI
  price_per_month?: number;
  price_per_night?: number;
  currency:        string;
  status:          string;       // active, draft, pending_review, suspended, …
  bedrooms:        number;
  bathrooms:       number;
  size_sqm?:       number;
  is_featured?:    boolean;
  is_furnished?:   boolean;
  is_verified?:    boolean;
  is_boosted?:     boolean;
  construction_status?: string;
  management_model?: string;
  media?:          PropertyMedia[];
  // Legacy image array (used by older UI components)
  images?: Array<{ image_url: string; is_primary: boolean }>;
  // Nested pricing from property_pricing table
  pricing?: {
    monthly_rent?:        number;
    asking_price?:        number;
    currency?:            string;
    rent_frequency?:      string;
    deposit_months?:      number;
    deposit_amount?:      number;
    goodwill_fee?:        number;
    service_charge?:      number;
    caretaker_fee?:       number;
    garbage_fee?:         number;
    water_bill_type?:     string;
    electricity_bill_type?: string;
    negotiable?:          boolean;
    agent_commission_pct?: number;
  };
  location?: {
    address?: string;
    area?:    string;
    town?:    string;
    county?:  string;
    sub_county?: string;
    estate_name?: string;
    road_street?: string;
    nearest_landmark?: string;
    directions?: string;
    latitude?:  number;
    longitude?: number;
    location?: {
      type:        'Point';
      coordinates: [number, number]; // [lng, lat]
    };
  };
  amenities?: Array<{ name: string; icon_name?: string; details?: string }>;
  neighborhood?: {
    community_vibe?:  string;
    light_exposure?:  string;
    crime_rating?:    string;
    noise_level?:     string;
  };
  owner?: {
    id:          string;
    full_name:   string;
    email:       string;
    phone?:      string;
    avatar_url?: string;
  };
  caretaker_id?:       string;
  agent_id?:           string;
  created_at?:         string;
  updated_at?:         string;
  // Short-stay config
  cleaning_fee?:       number;
  security_deposit?:   number;
  service_fee?:        number;
  // Misc
  views_count?:        number;
  price?:              number;
  capacity?:           number;
  contact_number?:     string;
  // Extended fields used by UI (may or may not be returned by backend)
  category?:           string;
  type?:               string;
  size?:               number;
  floor_level?:        string | number;
  furnished_status?:   string;
  year_built?:         string | number;
  internet_speed?:     string;
  is_pet_friendly?:    boolean;
  is_smoking_allowed?: boolean;
  notice_period?:      string;
  lease_duration?:     string;
  tax_amount?:         number;
  price_per_day?:      number;
  parking_spots?:      number;
  // Fields returned by backend but missing from type
  floor_area_sqm?:   number;
  plot_area_sqft?:   number;
  parking_spaces?:   number;   // alias for parking_spots
  compound_is_gated?: boolean;
  water_supply?:     string;
  electricity_supply?: string;
  published_at?:     string;
  // Nested sub-tables
  rental_unit?: {
    floor_level?: number;
    unit_type?:  string;
    faces?:      string;
    has_balcony?: boolean;
    is_corner_unit?: boolean;
  };
  plot_details?: {
    size_acres?:    number;
    size_sqft?:     number;
    road_frontage_m?: number;
    is_corner_plot?: boolean;
    terrain?:       string;
    soil_type?:     string;
    is_serviced?:   boolean;
    zoning_use?:    string;
    payment_plan_available?: boolean;
    installment_months?: number;
  };
  offplan_details?: {
    project_name:     string;
    developer_name?:  string;
    completion_quarter?: string;
    construction_pct?: number;
    total_units_in_project?: number;
    units_sold?:      number;
    payment_plan?:    any;
    escrow_bank?:     string;
    nca_reg_number?:  string;
  };
  // Structured configuration for short-stays
  short_term_config?: {
    short_term_type:    'airbnb_bnb' | 'party_home' | 'holiday_home' | 'serviced_apartment';
    price_per_night:    number;
    price_per_weekend?: number;
    min_nights?:        number;
    max_guests?:        number;
    check_in_time?:     string;
    check_out_time?:    string;
    cleaning_fee?:      number;
    damage_deposit?:    number;
    rules?:             string[];
    catering_available?: boolean;
    airbnb_listing_url?: string;
    instant_book?: boolean;
    max_nights?:  number;
  };
}

export interface PaginatedProperties {
  properties: Property[];
  total:      number;
  page:       number;
  limit:      number;
  pages:      number;
}

export const PropertiesApi = createApi({
  reducerPath: 'propertiesApi',
  baseQuery:   baseQueryWithReauth,
  tagTypes:    ['Property', 'LandlordProperty', 'StaffProperty'],
  endpoints: (builder) => ({

    // ── Landlord: list own properties ──────────────────────────────────────
    // GET /api/landlord/properties
    getMyProperties: builder.query<PaginatedProperties, { status?: string; page?: number; limit?: number; search?: string } | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.status) q.set('status', params.status);
        if (params?.page)   q.set('page', String(params.page));
        if (params?.limit)  q.set('limit', String(params.limit));
        if (params?.search) q.set('search', params.search);
        const qs = q.toString();
        return qs ? `landlord/properties?${qs}` : 'landlord/properties';
      },
      providesTags: (result) =>
        result?.properties
          ? [
              ...result.properties.map(({ id }) => ({ type: 'LandlordProperty' as const, id })),
              { type: 'LandlordProperty', id: 'LIST' },
            ]
          : [{ type: 'LandlordProperty', id: 'LIST' }],
    }),

    // ── Landlord: get single property ──────────────────────────────────────
    // GET /api/landlord/properties/:id
    getPropertyById: builder.query<{ property: Property; code: string }, string>({
      query: (id) => `landlord/properties/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'LandlordProperty', id }],
    }),

    // ── Landlord: create property ─────────────────────────────────────────
    // POST /api/landlord/properties
    createProperty: builder.mutation<{ message: string; code: string; property: Property }, Partial<Property>>({
      query: (body) => ({
        url:    'landlord/properties',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'LandlordProperty', id: 'LIST' }],
    }),

    // ── Landlord: update property ─────────────────────────────────────────
    // PUT /api/landlord/properties/:id
    updateProperty: builder.mutation<{ message: string; code: string; property: Property }, { id: string; updates: Partial<Property> }>({
      query: ({ id, updates }) => ({
        url:    `landlord/properties/${id}`,
        method: 'PUT',
        body:   updates,
      }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'LandlordProperty', id },
        { type: 'LandlordProperty', id: 'LIST' },
      ],
    }),

    // ── Landlord: delete property ─────────────────────────────────────────
    // DELETE /api/landlord/properties/:id
    deleteProperty: builder.mutation<{ message: string; code: string }, string>({
      query: (id) => ({
        url:    `landlord/properties/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'LandlordProperty', id },
        { type: 'LandlordProperty', id: 'LIST' },
      ],
    }),

    // ── Landlord: update status ───────────────────────────────────────────
    // PATCH /api/landlord/properties/:id/status
    updatePropertyStatus: builder.mutation<{ message: string; code: string }, { id: string; status: string }>({
      query: ({ id, status }) => ({
        url:    `landlord/properties/${id}/status`,
        method: 'PATCH',
        body:   { status },
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'LandlordProperty', id }],
    }),

    // ── Landlord: add media ───────────────────────────────────────────────
    // POST /api/landlord/properties/:id/media
    addPropertyMedia: builder.mutation<{ message: string; media: PropertyMedia }, { id: string; formData: FormData }>({
      query: ({ id, formData }) => ({
        url:    `landlord/properties/${id}/media`,
        method: 'POST',
        body:   formData,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'LandlordProperty', id }],
    }),

    // ── Landlord: delete media ────────────────────────────────────────────
    // DELETE /api/landlord/properties/:id/media/:mediaId
    deletePropertyMedia: builder.mutation<{ message: string }, { propertyId: string; mediaId: string }>({
      query: ({ propertyId, mediaId }) => ({
        url:    `landlord/properties/${propertyId}/media/${mediaId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_r, _e, { propertyId }) => [{ type: 'LandlordProperty', id: propertyId }],
    }),

    // ── Landlord: set cover photo ─────────────────────────────────────────
    // PATCH /api/landlord/properties/:id/media/:mediaId/cover
    setCoverPhoto: builder.mutation<{ message: string }, { propertyId: string; mediaId: string }>({
      query: ({ propertyId, mediaId }) => ({
        url:    `landlord/properties/${propertyId}/media/${mediaId}/cover`,
        method: 'PATCH',
      }),
      invalidatesTags: (_r, _e, { propertyId }) => [{ type: 'LandlordProperty', id: propertyId }],
    }),

    // ── Staff: list all properties ────────────────────────────────────────
    // GET /api/staff/properties
    getAllProperties: builder.query<PaginatedProperties, { page?: number; limit?: number; status?: string } | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.page)   q.set('page', String(params.page));
        if (params?.limit)  q.set('limit', String(params.limit));
        if (params?.status) q.set('status', params.status);
        const qs = q.toString();
        return qs ? `staff/properties?${qs}` : 'staff/properties';
      },
      providesTags: [{ type: 'StaffProperty', id: 'LIST' }],
    }),

    // ── Staff: pending-review (flagged) properties ────────────────────────
    // GET /api/staff/properties/pending-review
    getUnverifiedProperties: builder.query<PaginatedProperties, { page?: number; limit?: number } | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.page)  q.set('page', String(params.page));
        if (params?.limit) q.set('limit', String(params.limit));
        const qs = q.toString();
        return qs ? `staff/properties/pending-review?${qs}` : 'staff/properties/pending-review';
      },
      providesTags: [{ type: 'StaffProperty', id: 'PENDING' }],
    }),

    // ── Staff: approve property ───────────────────────────────────────────
    // POST /api/staff/properties/:id/approve
    verifyProperty: builder.mutation<{ message: string; code: string }, string>({
      query: (id) => ({
        url:    `staff/properties/${id}/approve`,
        method: 'POST',
      }),
      invalidatesTags: [
        { type: 'StaffProperty', id: 'LIST' },
        { type: 'StaffProperty', id: 'PENDING' },
      ],
    }),

    // ── Staff: reject property ────────────────────────────────────────────
    // POST /api/staff/properties/:id/reject
    rejectProperty: builder.mutation<{ message: string; code: string }, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url:    `staff/properties/${id}/reject`,
        method: 'POST',
        body:   reason ? { reason } : undefined,
      }),
      invalidatesTags: [
        { type: 'StaffProperty', id: 'LIST' },
        { type: 'StaffProperty', id: 'PENDING' },
      ],
    }),

    // ── Staff: flag property ──────────────────────────────────────────────
    // POST /api/staff/properties/:id/flag
    strikeProperty: builder.mutation<{ message: string }, { id: string; reason?: string }>({
      query: ({ id, reason }) => ({
        url:    `staff/properties/${id}/flag`,
        method: 'POST',
        body:   reason ? { reason } : undefined,
      }),
      invalidatesTags: [{ type: 'StaffProperty', id: 'LIST' }],
    }),

    // ── Search: full-text + filter ────────────────────────────────────────
    // GET /api/search?q=&listing_category=&county=&min_price=&max_price=&bedrooms=&page=&limit=
    searchProperties: builder.query<
      { properties: Property[]; total: number; page: number; limit: number; pages: number; code: string },
      {
        q?: string;
        listing_category?: string;
        listing_type?: string;
        county?: string;
        area?: string;
        min_price?: number;
        max_price?: number;
        bedrooms?: number;
        is_furnished?: string;
        page?: number;
        limit?: number;
      } | void
    >({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.q)                 q.set('q',                 params.q);
        if (params?.listing_category)  q.set('listing_category',  params.listing_category);
        if (params?.listing_type)      q.set('listing_type',      params.listing_type);
        if (params?.county)            q.set('county',            params.county);
        if (params?.area)              q.set('area',              params.area);
        if (params?.min_price != null) q.set('min_price',         String(params.min_price));
        if (params?.max_price != null) q.set('max_price',         String(params.max_price));
        if (params?.bedrooms != null)  q.set('bedrooms',          String(params.bedrooms));
        if (params?.is_furnished)      q.set('is_furnished',      params.is_furnished);
        if (params?.page)              q.set('page',              String(params.page));
        if (params?.limit)             q.set('limit',             String(params.limit));
        const qs = q.toString();
        return qs ? `search?${qs}` : 'search';
      },
      providesTags: [{ type: 'Property', id: 'SEARCH' }],
    }),

    // ── Search: radius / nearby ───────────────────────────────────────────
    // GET /api/search/nearby?lat=&lng=&radius_km=&...filters
    searchNearby: builder.query<
      { properties: Property[]; total: number; page: number; limit: number; pages: number; code: string },
      { lat: number; lng: number; radius_km?: number; q?: string; listing_category?: string; page?: number; limit?: number }
    >({
      query: ({ lat, lng, radius_km = 5, q, listing_category, page, limit }) => {
        const params = new URLSearchParams({ lat: String(lat), lng: String(lng), radius_km: String(radius_km) });
        if (q)                params.set('q',                q);
        if (listing_category) params.set('listing_category', listing_category);
        if (page)             params.set('page',             String(page));
        if (limit)            params.set('limit',            String(limit));
        return `search/nearby?${params.toString()}`;
      },
      providesTags: [{ type: 'Property', id: 'NEARBY' }],
    }),

    // ── Search: map bounds ────────────────────────────────────────────────
    // GET /api/search/map?north=&south=&east=&west=&...filters
    searchInBounds: builder.query<
      { properties: Property[]; total: number; code: string },
      { north: number; south: number; east: number; west: number; listing_category?: string; q?: string }
    >({
      query: ({ north, south, east, west, listing_category, q }) => {
        const params = new URLSearchParams({
          north: String(north), south: String(south),
          east:  String(east),  west:  String(west),
        });
        if (listing_category) params.set('listing_category', listing_category);
        if (q)                params.set('q', q);
        return `search/map?${params.toString()}`;
      },
    }),

    // ── Legacy alias: kept for any components still calling getProperties ─
    getProperties: builder.query<PaginatedProperties, any>({
      query: (params) => ({
        url:    'properties',
        method: 'GET',
        params,
      }),
      providesTags: [{ type: 'Property', id: 'LIST' }],
    }),

    // ── Natural-language search alias (maps to /api/search) ──────────────
    searchNatural: builder.query<{ properties: Property[]; total: number }, string>({
      query: (q) => ({
        url:    'search',
        method: 'GET',
        params: { q },
      }),
    }),

    // ── Spatial: link landmark (kept for when spatial router is re-enabled) ─
    linkLandmark: builder.mutation<any, { propertyId: string; landmark: any }>({
      query: (body) => ({
        url:    'spatial/link-landmark',
        method: 'POST',
        body,
      }),
    }),

    // ── Standalone image upload ───────────────────────────────────────────
    // POST /api/upload/images  — upload before property is created
    uploadPropertyImages: builder.mutation<{ message: string; code: string; images: Array<{ url: string; public_id: string }> }, FormData>({
      query: (formData) => ({
        url:    'upload/images',
        method: 'POST',
        body:   formData,
      }),
    }),

    // ── Add nearby places (post-creation) ────────────────────────────────
    // POST /api/properties/:id/nearby-places
    addNearbyPlaces: builder.mutation<
      { message: string; code: string },
      {
        propertyId: string;
        places: Array<{
          place_type: string; name: string;
          latitude: number; longitude: number;
          google_maps_url?: string; school_type?: string; matatu_stage_name?: string;
        }>;
      }
    >({
      query: ({ propertyId, places }) => ({
        url:    `properties/${propertyId}/nearby-places`,
        method: 'POST',
        body:   { places },
      }),
      invalidatesTags: (_r, _e, { propertyId }) => [{ type: 'LandlordProperty', id: propertyId }],
    }),

    // ── Boost (landlord) ─────────────────────────────────────────────────
    // POST /api/landlord/boosts
    boostProperty: builder.mutation<{ message: string }, { propertyId: string; packageId: string }>({
      query: (body) => ({
        url:    'landlord/boosts',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'LandlordProperty', id: 'LIST' }],
    }),

    // ── Public: single property (no auth required) ────────────────────
    // GET /api/properties/:id
    getPublicPropertyById: builder.query<{ property: Property; code: string }, string>({
      query: (id) => `properties/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Property', id }],
    }),

    // ── Public: list properties (no auth required) ────────────────────
    // GET /api/properties
    getPublicProperties: builder.query<PaginatedProperties, { listing_category?: string; page?: number; limit?: number; status?: string } | void>({
      query: (params) => {
        const q = new URLSearchParams();
        if (params?.listing_category) q.set('listing_category', params.listing_category);
        if (params?.page)             q.set('page', String(params.page));
        if (params?.limit)            q.set('limit', String(params.limit));
        if (params?.status)           q.set('status', params.status);
        const qs = q.toString();
        return qs ? `properties?${qs}` : 'properties';
      },
      providesTags: [{ type: 'Property', id: 'LIST' }],
    }),
  }),
});

export const {
  useAddNearbyPlacesMutation,
  useGetPublicPropertyByIdQuery,
  useGetPublicPropertiesQuery,
  useGetMyPropertiesQuery,
  useGetPropertyByIdQuery,
  useCreatePropertyMutation,
  useUpdatePropertyMutation,
  useDeletePropertyMutation,
  useUpdatePropertyStatusMutation,
  useAddPropertyMediaMutation,
  useDeletePropertyMediaMutation,
  useSetCoverPhotoMutation,
  useGetAllPropertiesQuery,
  useGetUnverifiedPropertiesQuery,
  useVerifyPropertyMutation,
  useRejectPropertyMutation,
  useStrikePropertyMutation,
  useLinkLandmarkMutation,
  useGetPropertiesQuery,
  useSearchNaturalQuery,
  useBoostPropertyMutation,
  useUploadPropertyImagesMutation,
  // Search
  useSearchPropertiesQuery,
  useLazySearchPropertiesQuery,
  useSearchNearbyQuery,
  useLazySearchNearbyQuery,
  useSearchInBoundsQuery,
  useLazySearchInBoundsQuery,
} = PropertiesApi;

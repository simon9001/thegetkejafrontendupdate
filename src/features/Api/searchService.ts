// services/searchService.ts
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const searchApi = createApi({
  reducerPath: 'searchApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api' }),
  endpoints: (builder) => ({
    naturalLanguageSearch: builder.mutation({
      query: (query: string) => ({
        url: '/search/natural',
        method: 'POST',
        body: { query },
      }),
    }),
    searchNearby: builder.query({
      query: ({ lat, lng, radius, type, budget, bedrooms }) => 
        `/search/nearby?lat=${lat}&lng=${lng}&radius=${radius}&type=${type}&budget=${budget}&bedrooms=${bedrooms}`,
    }),
    getPropertiesOnMap: builder.query({
      query: ({ bounds, filters }) => ({
        url: '/search/map',
        method: 'POST',
        body: { bounds, filters },
      }),
    }),
  }),
});

// Natural Language Parser
export const parseSearchQuery = (query: string) => {
  const parsed: any = {
    bedrooms: null,
    propertyType: null,
    location: null,
    landmark: null,
    minPrice: null,
    maxPrice: null,
    listingCategory: 'long_term_rent', // default
  };
  
  const lowerQuery = query.toLowerCase();
  
  // Extract bedrooms
  const bedroomMatch = lowerQuery.match(/(\d+)\s*(bedroom|bed|br)/i);
  if (bedroomMatch) {
    parsed.bedrooms = parseInt(bedroomMatch[1]);
  }
  
  // Extract budget
  const budgetMatch = lowerQuery.match(/(\d+(?:,\d+)?)\s*(?:bob|ksh|kes|shillings?)/i);
  if (budgetMatch) {
    const amount = parseInt(budgetMatch[1].replace(/,/g, ''));
    if (lowerQuery.includes('below') || lowerQuery.includes('under')) {
      parsed.maxPrice = amount;
    } else if (lowerQuery.includes('above') || lowerQuery.includes('over')) {
      parsed.minPrice = amount;
    } else {
      parsed.maxPrice = amount; // assume max budget
    }
  }
  
  // Extract location/landmark
  const locationPatterns = [
    /(?:around|near|in)\s+([a-z\s]+?)(?:\s+(?:with|for|and|$))/i,
    /(?:at)\s+([a-z\s]+?)(?:\s+(?:with|for|and|$))/i,
  ];
  
  for (const pattern of locationPatterns) {
    const match = lowerQuery.match(pattern);
    if (match && match[1]) {
      parsed.location = match[1].trim();
      break;
    }
  }
  
  // Extract property type
  if (lowerQuery.includes('bedsitter')) parsed.propertyType = 'bedsitter';
  else if (lowerQuery.includes('studio')) parsed.propertyType = 'studio';
  else if (lowerQuery.includes('apartment')) parsed.propertyType = 'apartment';
  else if (lowerQuery.includes('house') || lowerQuery.includes('bungalow')) parsed.propertyType = 'house';
  else if (lowerQuery.includes('plot') || lowerQuery.includes('land')) {
    parsed.propertyType = 'plot';
    parsed.listingCategory = 'for_sale';
  }
  
  // Determine listing category
  if (lowerQuery.includes('rent') || lowerQuery.includes('renting')) {
    if (lowerQuery.includes('short') || lowerQuery.includes('airbnb')) {
      parsed.listingCategory = 'short_term_rent';
    } else {
      parsed.listingCategory = 'long_term_rent';
    }
  } else if (lowerQuery.includes('sale') || lowerQuery.includes('buy')) {
    parsed.listingCategory = 'for_sale';
  } else if (lowerQuery.includes('commercial') || lowerQuery.includes('shop') || lowerQuery.includes('office')) {
    parsed.listingCategory = 'commercial';
  }
  
  return parsed;
};

export const searchNearbyPlaces = async (lat: number, lng: number, query: string) => {
  // Use Overpass API for OSM data
  const overpassQuery = `
    [out:json];
    (
      node["amenity"~"${query}"](around:2000,${lat},${lng});
      node["shop"~"${query}"](around:2000,${lat},${lng});
      node["tourism"~"${query}"](around:2000,${lat},${lng});
      way["amenity"~"${query}"](around:2000,${lat},${lng});
    );
    out body;
  `;
  
  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: overpassQuery,
  });
  
  const data = await response.json();
  
  return data.elements.map((element: any) => ({
    name: element.tags?.name || 'Unnamed',
    type: element.tags?.amenity || element.tags?.shop || element.tags?.tourism,
    lat: element.lat || element.center?.lat,
    lng: element.lon || element.center?.lon,
    distance_m: calculateDistance(lat, lng, element.lat || element.center?.lat, element.lon || element.center?.lon),
  }));
};

const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = lat1 * Math.PI / 180;
  const φ2 = lat2 * Math.PI / 180;
  const Δφ = (lat2 - lat1) * Math.PI / 180;
  const Δλ = (lng2 - lng1) * Math.PI / 180;
  
  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  
  return Math.round(R * c);
};
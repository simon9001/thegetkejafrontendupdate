// frontend/src/features/Slice/PropertiesSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface PropertiesState {
    searchResults: any[];
    filters: {
        type: string | null;
        minPrice: number | null;
        maxPrice: number | null;
        status: string;
    };
    mapView: {
        center: { lat: number; lng: number };
        zoom: number;
        radius: number;
        maxPrice?: number;
        minBedrooms?: number;
        query?: string;
    };
    isLoading: boolean;
}

const initialState: PropertiesState = {
    searchResults: [],
    filters: {
        type: null,
        minPrice: null,
        maxPrice: null,
        status: 'active',
    },
    mapView: {
        center: { lat: -0.5142, lng: 37.4592 }, // Default to Embu, Kenya area
        zoom: 13,
        radius: 2000,
        maxPrice: undefined,
        minBedrooms: undefined,
        query: undefined,
    },
    isLoading: false,
};

export const propertiesSlice = createSlice({
    name: 'properties',
    initialState,
    reducers: {
        setSearchResults: (state, action: PayloadAction<any[]>) => {
            state.searchResults = action.payload;
        },
        setFilter: (state, action: PayloadAction<Partial<PropertiesState['filters']>>) => {
            state.filters = { ...state.filters, ...action.payload };
        },
        setMapCenter: (state, action: PayloadAction<{ lat: number; lng: number }>) => {
            state.mapView.center = action.payload;
        },
        setMapRadius: (state, action: PayloadAction<number>) => {
            state.mapView.radius = action.payload;
        },
        setMapFilters: (state, action: PayloadAction<{ maxPrice?: number; minBedrooms?: number; query?: string }>) => {
            state.mapView = { ...state.mapView, ...action.payload };
        },
        setLoading: (state, action: PayloadAction<boolean>) => {
            state.isLoading = action.payload;
        },
    },
});

export const {
    setSearchResults,
    setFilter,
    setMapCenter,
    setMapRadius,
    setMapFilters,
    setLoading
} = propertiesSlice.actions;

export default propertiesSlice.reducer;

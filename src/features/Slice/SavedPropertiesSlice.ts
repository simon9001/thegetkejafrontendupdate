// frontend/src/features/Slice/SavedPropertiesSlice.ts
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface SavedProperty {
    id: number;
    title: string;
    type: string;
    category: string;
    price: number;
    rating: number;
    image: string;
    badge?: string;
    bedrooms?: number;
    bathrooms?: number;
    capacity?: string;
    amenities?: string[];
    savedAt: string;
}

interface SavedPropertiesState {
    items: SavedProperty[];
    isLoading: boolean;
    error: string | null;
}

// Load initial state from localStorage
const loadSavedProperties = (): SavedProperty[] => {
    try {
        const saved = localStorage.getItem('savedProperties');
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

const initialState: SavedPropertiesState = {
    items: loadSavedProperties(),
    isLoading: false,
    error: null,
};

export const savedPropertiesSlice = createSlice({
    name: 'savedProperties',
    initialState,
    reducers: {
        addToSaved: (state, action: PayloadAction<Omit<SavedProperty, 'savedAt'>>) => {
            // Check if already saved
            const exists = state.items.some(item => item.id === action.payload.id);
            if (!exists) {
                const newItem = {
                    ...action.payload,
                    savedAt: new Date().toISOString(),
                };
                state.items.push(newItem);
                // Save to localStorage
                localStorage.setItem('savedProperties', JSON.stringify(state.items));
            }
        },
        removeFromSaved: (state, action: PayloadAction<number>) => {
            state.items = state.items.filter(item => item.id !== action.payload);
            // Update localStorage
            localStorage.setItem('savedProperties', JSON.stringify(state.items));
        },
        toggleSaved: (state, action: PayloadAction<Omit<SavedProperty, 'savedAt'>>) => {
            const index = state.items.findIndex(item => item.id === action.payload.id);
            if (index === -1) {
                // Add if not exists
                const newItem = {
                    ...action.payload,
                    savedAt: new Date().toISOString(),
                };
                state.items.push(newItem);
            } else {
                // Remove if exists
                state.items.splice(index, 1);
            }
            // Update localStorage
            localStorage.setItem('savedProperties', JSON.stringify(state.items));
        },
        clearSaved: (state) => {
            state.items = [];
            localStorage.removeItem('savedProperties');
        },
        syncWithUser: (state, action: PayloadAction<SavedProperty[]>) => {
            // Merge with user's saved properties from backend
            state.items = action.payload;
            localStorage.setItem('savedProperties', JSON.stringify(state.items));
        },
    },
});

export const { 
    addToSaved, 
    removeFromSaved, 
    toggleSaved, 
    clearSaved,
    syncWithUser 
} = savedPropertiesSlice.actions;

export default savedPropertiesSlice.reducer;
import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'

export interface User {
    user_id: string;
    username: string;
    email: string;
    first_name?: string;
    last_name?: string;
    fullName?: string;
    full_name?: string; // Standardized
    phoneNumber?: string;
    phone?: string; // Standardized
    role: string;
    isActive: boolean;
    isEmailVerified: boolean;
    avatar_url?: string;
}

interface AuthTokens {
    accessToken: string;
    refreshToken?: string;
}

export interface AuthState {
    isAuthenticated: boolean
    tokens: AuthTokens | null
    user: User | null
}

const initialState: AuthState = {
    isAuthenticated: false,
    tokens: null,
    user: null,
}

const cleanTokenString = (token: string): string => {
    if (!token) return '';
    let cleaned = token.replace(/^"(.*)"$/, '$1');
    return cleaned.trim();
};

export const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action: PayloadAction<{ user: User; tokens: AuthTokens }>) => {
            const { user, tokens } = action.payload;
            const cleanedTokens: AuthTokens = {
                accessToken: cleanTokenString(tokens.accessToken),
                refreshToken: tokens.refreshToken ? cleanTokenString(tokens.refreshToken) : undefined
            };

            state.tokens = cleanedTokens;
            state.user = user;
            state.isAuthenticated = true;

            localStorage.setItem('token', cleanedTokens.accessToken);
            if (cleanedTokens.refreshToken) {
                localStorage.setItem('refreshToken', cleanedTokens.refreshToken);
            }
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('isAuthenticated', 'true');
        },
        clearCredentials: (state) => {
            state.user = null;
            state.tokens = null;
            state.isAuthenticated = false;

            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            localStorage.removeItem('user');
            localStorage.removeItem('isAuthenticated');
        },
        updateAccessToken: (state, action: PayloadAction<string>) => {
            const cleanedToken = cleanTokenString(action.payload);
            if (state.tokens) {
                state.tokens.accessToken = cleanedToken;
            } else {
                state.tokens = { accessToken: cleanedToken };
            }
            localStorage.setItem('token', cleanedToken);
        },
    },
})

export const { setCredentials, clearCredentials, updateAccessToken } = authSlice.actions;
export default authSlice.reducer;

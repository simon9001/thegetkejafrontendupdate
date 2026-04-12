// frontend/src/features/Slice/AuthSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

// ---------------------------------------------------------------------------
// Types — aligned with the backend's AuthUser shape
// ---------------------------------------------------------------------------

/**
 * The user object as stored in Redux state.
 *
 * Matches the shape returned by POST /auth/login → result.user:
 *   { id, email, roles[] }
 *
 * And the fuller shape from GET /auth/profile.
 */
export interface User {
  /** Backend returns `id`, not `user_id` */
  id: string;
  email: string;
  /** Array of role names — e.g. ['seeker'], ['landlord', 'seeker'] */
  roles: string[];
  /** Convenience getter: first role in the array */
  primaryRole?: string;

  // Profile fields (populated after getProfile or from login payload)
  full_name?: string;
  display_name?: string;
  phone?: string;
  avatar_url?: string;
  county?: string;
  whatsapp_number?: string;

  // Account meta
  email_verified?: boolean;
  auth_provider?: string;
  account_status?: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  tokens: AuthTokens | null;
  user: User | null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const initialState: AuthState = {
  isAuthenticated: false,
  tokens: null,
  user: null,
};

/** Strip surrounding quotes and whitespace that sometimes appear when tokens
 *  are serialised through localStorage or certain HTTP clients. */
const cleanToken = (token: string): string =>
  token.replace(/^"(.*)"$/, '$1').trim();

// ---------------------------------------------------------------------------
// Slice
// ---------------------------------------------------------------------------

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Call this after a successful login or Google OAuth callback.
     *
     * @example
     * dispatch(setCredentials({
     *   user: { id: result.user.id, email: result.user.email, roles: result.user.roles },
     *   tokens: { accessToken: result.accessToken, refreshToken: result.refreshToken },
     * }));
     */
    setCredentials: (
      state,
      action: PayloadAction<{ user: User; tokens: AuthTokens }>,
    ) => {
      const { user, tokens } = action.payload;

      const cleanedTokens: AuthTokens = {
        accessToken: cleanToken(tokens.accessToken),
        refreshToken: tokens.refreshToken
          ? cleanToken(tokens.refreshToken)
          : undefined,
      };

      // Derive primaryRole from the roles array for convenience
      const enrichedUser: User = {
        ...user,
        primaryRole: user.roles?.[0] ?? 'seeker',
      };

      state.tokens = cleanedTokens;
      state.user = enrichedUser;
      state.isAuthenticated = true;

      localStorage.setItem('token', cleanedTokens.accessToken);
      if (cleanedTokens.refreshToken) {
        localStorage.setItem('refreshToken', cleanedTokens.refreshToken);
      }
      localStorage.setItem('user', JSON.stringify(enrichedUser));
      localStorage.setItem('isAuthenticated', 'true');
    },

    /**
     * Call this after a successful GET /auth/profile to enrich the stored
     * user object with profile fields (full_name, avatar_url, etc.).
     */
    updateUserProfile: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem('user', JSON.stringify(state.user));
      }
    },

    /**
     * Rotate the access token in state (called by baseQueryWithReauth after
     * a silent token refresh).
     */
    updateAccessToken: (state, action: PayloadAction<string>) => {
      const cleaned = cleanToken(action.payload);
      if (state.tokens) {
        state.tokens.accessToken = cleaned;
      } else {
        state.tokens = { accessToken: cleaned };
      }
      localStorage.setItem('token', cleaned);
    },

    /**
     * Rotate both tokens (called by baseQueryWithReauth when the backend
     * also issues a new refresh token).
     */
    updateTokens: (state, action: PayloadAction<AuthTokens>) => {
      const cleaned: AuthTokens = {
        accessToken: cleanToken(action.payload.accessToken),
        refreshToken: action.payload.refreshToken
          ? cleanToken(action.payload.refreshToken)
          : state.tokens?.refreshToken,
      };
      state.tokens = cleaned;
      localStorage.setItem('token', cleaned.accessToken);
      if (cleaned.refreshToken) {
        localStorage.setItem('refreshToken', cleaned.refreshToken);
      }
    },

    /** Clear everything — call after logout. */
    clearCredentials: (state) => {
      state.user = null;
      state.tokens = null;
      state.isAuthenticated = false;

      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      localStorage.removeItem('isAuthenticated');
    },
  },
});

export const {
  setCredentials,
  updateUserProfile,
  updateAccessToken,
  updateTokens,
  clearCredentials,
} = authSlice.actions;

export default authSlice.reducer;

// ---------------------------------------------------------------------------
// Selectors
// ---------------------------------------------------------------------------
import type { RootState } from '../../store/store'; // adjust path if needed

export const selectCurrentUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) =>
  state.auth.isAuthenticated;
export const selectAccessToken = (state: RootState) =>
  state.auth.tokens?.accessToken ?? null;
export const selectRefreshToken = (state: RootState) =>
  state.auth.tokens?.refreshToken ?? null;
export const selectPrimaryRole = (state: RootState) =>
  state.auth.user?.primaryRole ?? 'seeker';
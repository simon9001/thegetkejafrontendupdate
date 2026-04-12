// frontend/src/features/Api/baseQuery.ts
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { updateTokens, clearCredentials } from '../Slice/AuthSlice';
import type { RootState } from '../../store/store';

// ---------------------------------------------------------------------------
// Base query — attaches Bearer token if one exists in state
// ---------------------------------------------------------------------------
const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL ?? '/api',
  prepareHeaders: (headers, { getState }) => {
    // Safe access — state.auth may be undefined during redux-persist rehydration
    const token = (getState() as RootState)?.auth?.tokens?.accessToken;
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
  },
});

// ---------------------------------------------------------------------------
// Refresh mutex — ensures only ONE refresh call is in flight at a time.
// Without this, parallel 401s each fire a refresh; the backend rotates the
// token on the first call, making every subsequent refresh fail → logout.
// ---------------------------------------------------------------------------
let refreshPromise: Promise<boolean> | null = null;

// ---------------------------------------------------------------------------
// Wrapper — silent token refresh on 401, then retry once
// ---------------------------------------------------------------------------
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error?.status === 401) {
    const refreshToken = (api.getState() as RootState)?.auth?.tokens?.refreshToken;

    if (refreshToken) {
      // If a refresh is already in flight, wait for it instead of firing another.
      if (!refreshPromise) {
        refreshPromise = Promise.resolve(baseQuery(
          { url: 'auth/refresh-token', method: 'POST', body: { refreshToken } },
          api,
          extraOptions,
        )).then((refreshResult) => {
          if (refreshResult.data) {
            const { accessToken, refreshToken: newRefreshToken } = refreshResult.data as {
              accessToken: string;
              refreshToken: string;
            };
            api.dispatch(updateTokens({ accessToken, refreshToken: newRefreshToken }));
            return true;
          }
          api.dispatch(clearCredentials());
          return false;
        }).finally(() => {
          refreshPromise = null;
        });
      }

      const refreshed = await refreshPromise;
      if (refreshed) {
        // Retry original request with the new access token now in state
        result = await baseQuery(args, api, extraOptions);
      }
    } else {
      // No refresh token — force logout
      api.dispatch(clearCredentials());
    }
  }

  return result;
};
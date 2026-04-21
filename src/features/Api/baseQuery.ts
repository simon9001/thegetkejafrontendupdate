// frontend/src/features/Api/baseQuery.ts
import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { updateTokens, clearCredentials } from '../Slice/AuthSlice';
import type { RootState } from '../../store/store';
import { apiDomain } from '../../apiDomain/ApiDomain';

// ---------------------------------------------------------------------------
// Base query — attaches Bearer token if one exists in state
// ---------------------------------------------------------------------------
const baseQuery = fetchBaseQuery({
  baseUrl: apiDomain,
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState)?.auth?.tokens?.accessToken;

    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }

    return headers;
  },
});

// ---------------------------------------------------------------------------
// Refresh mutex — ensures only ONE refresh call is in flight at a time.
// ---------------------------------------------------------------------------
let refreshPromise: Promise<boolean> | null = null;

// ---------------------------------------------------------------------------
// Decode JWT exp claim without a library (base64url → JSON).
// Returns expiry in ms, or 0 if the token is unparseable.
// ---------------------------------------------------------------------------
function getTokenExpiry(token: string): number {
  try {
    const payload = token.split('.')[1];
    const json = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')));
    return typeof json.exp === 'number' ? json.exp * 1000 : 0;
  } catch {
    return 0;
  }
}

function isExpiringSoon(token: string, thresholdMs = 60_000): boolean {
  const expiry = getTokenExpiry(token);
  return expiry > 0 && Date.now() >= expiry - thresholdMs;
}

// ---------------------------------------------------------------------------
// Shared refresh helper — called both proactively and reactively.
// ---------------------------------------------------------------------------
async function doRefresh(
  refreshToken: string,
  api: Parameters<BaseQueryFn>[1],
  extraOptions: Parameters<BaseQueryFn>[2],
): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = Promise.resolve(
      baseQuery(
        { url: 'auth/refresh-token', method: 'POST', body: { refreshToken } },
        api,
        extraOptions,
      ),
    )
      .then((refreshResult) => {
        if (refreshResult.data) {
          const { accessToken, refreshToken: newRefreshToken } =
            refreshResult.data as { accessToken: string; refreshToken: string };
          api.dispatch(updateTokens({ accessToken, refreshToken: newRefreshToken }));
          return true;
        }
        api.dispatch(clearCredentials());
        return false;
      })
      .catch(() => {
        api.dispatch(clearCredentials());
        return false;
      })
      .finally(() => {
        refreshPromise = null;
      });
  }
  return refreshPromise!;
}

// ---------------------------------------------------------------------------
// Wrapper — proactive refresh when token is about to expire, reactive on 401
// ---------------------------------------------------------------------------
export const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  const state = api.getState() as RootState;
  const accessToken  = state?.auth?.tokens?.accessToken;
  const refreshToken = state?.auth?.tokens?.refreshToken;

  // Proactively refresh if token expires within 60 s — avoids unnecessary 401s
  if (accessToken && refreshToken && isExpiringSoon(accessToken)) {
    await doRefresh(refreshToken, api, extraOptions);
  }

  let result = await baseQuery(args, api, extraOptions);

  // Reactive refresh on 401 (e.g. clock skew, or token invalidated server-side)
  if (result.error?.status === 401) {
    const currentRefreshToken = (api.getState() as RootState)?.auth?.tokens?.refreshToken;

    if (currentRefreshToken) {
      const refreshed = await doRefresh(currentRefreshToken, api, extraOptions);
      if (refreshed) {
        result = await baseQuery(args, api, extraOptions);
      }
    } else {
      api.dispatch(clearCredentials());
    }
  }

  return result;
};

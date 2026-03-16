import { fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import { Mutex } from 'async-mutex';
import { setCredentials, clearCredentials } from '../Slice/AuthSlice';
import type { AuthState } from '../Slice/AuthSlice';
import { apiDomain } from '../../apiDomain/ApiDomain';

const mutex = new Mutex();

const cleanTokenString = (token: string): string => {
    if (!token) return '';
    return token.replace(/^"(.*)"$/, '$1').trim();
};

const baseQuery = fetchBaseQuery({
    baseUrl: apiDomain,
    credentials: 'include',
    prepareHeaders: (headers, { getState }) => {
        const state = getState() as { authSlice: AuthState };
        const token = state.authSlice.tokens?.accessToken;

        if (token) {
            headers.set('Authorization', `Bearer ${cleanTokenString(token)}`);
        } else {
            const storedToken = localStorage.getItem('token');
            if (storedToken) {
                headers.set('Authorization', `Bearer ${cleanTokenString(storedToken)}`);
            }
        }
        return headers;
    },
});

export const baseQueryWithReauth: BaseQueryFn<
    string | FetchArgs,
    unknown,
    FetchBaseQueryError
> = async (args, api, extraOptions) => {
    await mutex.waitForUnlock();
    let result = await baseQuery(args, api, extraOptions);

    if (result.error && result.error.status === 401) {
        if (!mutex.isLocked()) {
            const release = await mutex.acquire();
            try {
                const state = api.getState() as { authSlice: AuthState };
                let refreshToken = state.authSlice.tokens?.refreshToken || localStorage.getItem('refreshToken');

                if (refreshToken) {
                    const refreshResult = await baseQuery(
                        {
                            url: 'auth/refresh-token',
                            method: 'POST',
                            body: { refreshToken },
                        },
                        api,
                        extraOptions
                    );

                    if (refreshResult.data) {
                        const data = refreshResult.data as any;
                        if (data.success && data.data) {
                            api.dispatch(setCredentials({
                                user: state.authSlice.user as any,
                                tokens: data.data
                            }));
                            result = await baseQuery(args, api, extraOptions);
                        } else {
                            api.dispatch(clearCredentials());
                        }
                    } else {
                        api.dispatch(clearCredentials());
                    }
                } else {
                    api.dispatch(clearCredentials());
                }
            } finally {
                release();
            }
        } else {
            await mutex.waitForUnlock();
            result = await baseQuery(args, api, extraOptions);
        }
    }
    return result;
};

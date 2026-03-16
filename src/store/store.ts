import { configureStore } from '@reduxjs/toolkit'
import { AuthApi } from '../features/Api/AuthApi';
import { PropertiesApi } from '../features/Api/PropertiesApi';
import { DashboardApi } from '../features/Api/DashboardApi';
import { SpatialApi } from '../features/Api/SpatialApi'
import { chatApi } from '../features/Api/ChatApi';
import { UsersApi } from '../features/Api/UsersApi';
import authSlice from '../features/Slice/AuthSlice'
import storage from 'redux-persist/lib/storage'
import propertiesSlice from '../features/Slice/PropertiesSlice';
import savedPropertiesReducer from '../features/Slice/SavedPropertiesSlice';
import { persistReducer, persistStore, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';

const authPersistConfig = {
    key: 'auth',
    storage,
    version: 1,
    whitelist: ['tokens', 'isAuthenticated', 'user'],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authSlice);

export const store = configureStore({
    reducer: {
        [AuthApi.reducerPath]: AuthApi.reducer,
        [PropertiesApi.reducerPath]: PropertiesApi.reducer,
        [SpatialApi.reducerPath]: SpatialApi.reducer,
        [DashboardApi.reducerPath]: DashboardApi.reducer,
        [chatApi.reducerPath]: chatApi.reducer,
        [UsersApi.reducerPath]: UsersApi.reducer,
        properties: propertiesSlice,
        savedProperties: savedPropertiesReducer,
        authSlice: persistedAuthReducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
            },
            immutableCheck: { warnAfter: 64 }, // Increase threshold to 64ms
        })
            .concat(AuthApi.middleware)
            .concat(PropertiesApi.middleware)
            .concat(SpatialApi.middleware)
            .concat(DashboardApi.middleware)
            .concat(chatApi.middleware)
            .concat(UsersApi.middleware),
})

export const persistor = persistStore(store)

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

// frontend/src/app/store.ts
import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { AuthApi }              from '../features/Api/AuthApi';
import { AdminApi }             from '../features/Api/AdminApi';
import { PropertiesApi }        from '../features/Api/PropertiesApi';
import { DashboardApi }         from '../features/Api/DashboardApi';
import { SpatialApi }           from '../features/Api/SpatialApi';
import { chatApi }              from '../features/Api/ChatApi';
import { UsersApi }             from '../features/Api/UsersApi';
import { LandlordApi }          from '../features/Api/LandlordApi';
import { SavedPropertiesApi }   from '../features/Api/SavedPropertiesApi';
import { ShortStayApi }         from '../features/Api/ShortStayApi';
import authReducer           from '../features/Slice/AuthSlice';
import propertiesReducer     from '../features/Slice/PropertiesSlice';
import savedPropertiesReducer from '../features/Slice/SavedPropertiesSlice';
import storage from 'redux-persist/lib/storage';
import {
  persistReducer, persistStore,
  FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER,
} from 'redux-persist';

const authPersistConfig = {
  key:       'auth',
  storage,
  version:   1,
  whitelist: ['tokens', 'isAuthenticated', 'user'],
};

const persistedAuthReducer = persistReducer(authPersistConfig, authReducer);

const rootReducer = combineReducers({
  // RTK Query API slices
  [AuthApi.reducerPath]:            AuthApi.reducer,
  [AdminApi.reducerPath]:           AdminApi.reducer,
  [PropertiesApi.reducerPath]:      PropertiesApi.reducer,
  [SpatialApi.reducerPath]:         SpatialApi.reducer,
  [DashboardApi.reducerPath]:       DashboardApi.reducer,
  [chatApi.reducerPath]:            chatApi.reducer,
  [UsersApi.reducerPath]:           UsersApi.reducer,
  [LandlordApi.reducerPath]:        LandlordApi.reducer,
  [SavedPropertiesApi.reducerPath]: SavedPropertiesApi.reducer,
  [ShortStayApi.reducerPath]:       ShortStayApi.reducer,
  // Feature slices
  auth:            persistedAuthReducer,
  properties:      propertiesReducer,
  savedProperties: savedPropertiesReducer,
});

export const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER] },
      immutableCheck: { warnAfter: 64 },
    })
      .concat(AuthApi.middleware)
      .concat(AdminApi.middleware)
      .concat(PropertiesApi.middleware)
      .concat(SpatialApi.middleware)
      .concat(DashboardApi.middleware)
      .concat(chatApi.middleware)
      .concat(UsersApi.middleware)
      .concat(LandlordApi.middleware)
      .concat(SavedPropertiesApi.middleware)
      .concat(ShortStayApi.middleware),
});

export const persistor = persistStore(store);
export type RootState   = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
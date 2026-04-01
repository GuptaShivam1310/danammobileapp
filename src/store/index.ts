import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import settingsReducer from './slices/settingsSlice';
import postReducer from './slices/postSlice';
import seekerLookReducer from './slices/seekerLookSlice';
import seekerLookProfessionReducer from './slices/seekerLookProfession';
import seekerLookDoYouReducer from './slices/seekerLookDoYouSlice';
import chatReducer from './chat/chatSlice';
import productSeekersReducer from './productSeekers/productSeekersSlice';
import profileReducer from './slices/profileSlice';
import wishListReducer from './slices/wishListSlice';
import homeFilterReducer from './slices/homeFilterSlice';
import searchReducer from './slices/searchSlice';
import seekerPreferencesReducer from './slices/seekerPreferencesSlice';
import userSettingsReducer from './slices/userSettingsSlice';

const appReducer = combineReducers({
  auth: authReducer,
  settings: settingsReducer,
  userSettings: userSettingsReducer,
  post: postReducer,
  seekerLook: seekerLookReducer,
  seekerLookProfession: seekerLookProfessionReducer,
  seekerLookDoYou: seekerLookDoYouReducer,
  chat: chatReducer,
  productSeekers: productSeekersReducer,
  profile: profileReducer,
  wishList: wishListReducer,
  homeFilter: homeFilterReducer,
  search: searchReducer,
  seekerPreferences: seekerPreferencesReducer,
});

const rootReducer = (state: any, action: any) => {
  if (action.type === 'auth/logoutUser/fulfilled' || action.type === 'auth/clearAuthState') {
    // Preserve settings (theme, onboarding state, etc.)
    const settings = state?.settings;
    state = { settings };
  }
  return appReducer(state, action);
};

export const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({ serializableCheck: false }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

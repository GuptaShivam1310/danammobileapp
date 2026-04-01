import { axiosClient } from '../api/axiosClient';
import { ApiResponse } from '../models/api';
import { SeekerPreferences } from '../store/slices/seekerPreferencesSlice';

export const SEEKER_PREFERENCES_ENDPOINTS = {
    PREFERENCES: '/api/user/seeker-preferences',
} as const;

export const seekerPreferencesService = {
    savePreferences: async (preferences: SeekerPreferences): Promise<ApiResponse<any>> => {
        const response = await axiosClient.post<ApiResponse<any>>(
            SEEKER_PREFERENCES_ENDPOINTS.PREFERENCES,
            preferences
        );
        return response.data;
    },

    resetPreferences: async (): Promise<ApiResponse<any>> => {
        const response = await axiosClient.delete<ApiResponse<any>>(
            SEEKER_PREFERENCES_ENDPOINTS.PREFERENCES
        );
        return response.data;
    },
};

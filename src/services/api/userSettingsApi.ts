import { axiosClient } from '../../api/axiosClient';
import { ApiResponse } from '../../models/api';

export interface IUserSettings {
    id: string;
    user_id: string;
    receive_updates: boolean;
    nearby_notifications: boolean;
    hide_identity: boolean;
    created_at: string;
    updated_at: string;
}

export interface IUpdateUserSettingsRequest {
    receive_updates?: boolean;
    nearby_notifications?: boolean;
    hide_identity?: boolean;
}

export const USER_SETTINGS_ENDPOINTS = {
    GET_SETTINGS: '/api/user/settings',
    UPDATE_SETTINGS: '/api/user/settings',
} as const;

export const userSettingsApi = {
    /**
     * Fetch user settings
     */
    getSettings: async (): Promise<ApiResponse<IUserSettings>> => {
        const response = await axiosClient.get<ApiResponse<IUserSettings>>(
            USER_SETTINGS_ENDPOINTS.GET_SETTINGS
        );
        return response.data;
    },

    /**
     * Update user settings
     */
    updateSettings: async (
        payload: IUpdateUserSettingsRequest
    ): Promise<ApiResponse<IUserSettings>> => {
        const response = await axiosClient.patch<ApiResponse<IUserSettings>>(
            USER_SETTINGS_ENDPOINTS.UPDATE_SETTINGS,
            payload
        );
        return response.data;
    },
};

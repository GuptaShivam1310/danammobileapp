import { axiosClient } from '../../api/axiosClient';
import { ApiResponse } from '../../models/api';
import {
    IUserProfile,
    IUpdateUserRequest,
    IUpdateUserResponse,
    IDeleteUserResponse,
    IChangePasswordRequest,
    IUpdateSettingsRequest,
    IContactUsRequest,
    IDeleteAccountRequest,
} from '../../models/profile';

export const PROFILE_ENDPOINTS = {
    GET_PROFILE: 'api/user/me',
    UPDATE_PROFILE: 'api/user/profile',
    DELETE_USER: 'api/user/delete-account',
    CHANGE_PASSWORD: 'api/auth/change-password',
    UPDATE_SETTINGS: '/api/profile/update-settings',
    CONTACT_US: '/api/common/contactus',
    CHANGE_PASSWORD_USER: '/api/user/change-password',
} as const;

export const profileApi = {
    /**
     * Get user profile details
     */
    getProfile: async (): Promise<ApiResponse<IUserProfile>> => {
        const response = await axiosClient.get<ApiResponse<IUserProfile>>(
            PROFILE_ENDPOINTS.GET_PROFILE
        );
        return response.data;
    },

    /**
     * Update user profile details
     */
    updateProfile: async (
        payload: IUpdateUserRequest
    ): Promise<IUpdateUserResponse> => {
        const formData = new FormData();
        if (payload.full_name) formData.append('full_name', payload.full_name);
        if (payload.phone_number) formData.append('phone_number', payload.phone_number);
        if (payload.country_code) formData.append('country_code', payload.country_code);

        if (payload.profile_image_url && !payload.profile_image_url.startsWith('http')) {
            const uri = payload.profile_image_url;
            const filename = uri.split('/').pop() || 'avatar.jpg';
            const match = /\.(\w+)$/.exec(filename);
            const type = match ? `image/${match[1]}` : `image/jpeg`;

            formData.append('profile_image', {
                uri: uri,
                name: filename,
                type: type,
            } as any);
        }

        const response = await axiosClient.put<IUpdateUserResponse>(
            PROFILE_ENDPOINTS.UPDATE_PROFILE,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },

    /**
     * Delete user account
     */
    deleteUser: async (): Promise<IDeleteUserResponse> => {
        const response = await axiosClient.delete<IDeleteUserResponse>(
            PROFILE_ENDPOINTS.DELETE_USER
        );
        return response.data;
    },

    /**
     * Delete account with password
     */
    deleteAccount: async (payload: IDeleteAccountRequest): Promise<IDeleteUserResponse> => {
        const response = await axiosClient.delete<IDeleteUserResponse>(
            PROFILE_ENDPOINTS.DELETE_USER,
            { data: payload }
        );
        return response.data;
    },

    /**
     * Change user password
     */
    changePassword: async (
        payload: IChangePasswordRequest
    ): Promise<IDeleteUserResponse> => {
        const response = await axiosClient.post<IDeleteUserResponse>(
            PROFILE_ENDPOINTS.CHANGE_PASSWORD_USER,
            payload
        );
        return response.data;
    },

    /**
     * Update user settings
     */
    updateSettings: async (
        payload: IUpdateSettingsRequest
    ): Promise<ApiResponse<null>> => {
        const response = await axiosClient.put<ApiResponse<null>>(
            PROFILE_ENDPOINTS.UPDATE_SETTINGS,
            payload
        );
        return response.data;
    },

    /**
     * Submit contact us form
     */
    contactUs: async (
        payload: IContactUsRequest
    ): Promise<ApiResponse<null>> => {
        const response = await axiosClient.post<ApiResponse<null>>(
            PROFILE_ENDPOINTS.CONTACT_US,
            payload
        );

        return response.data;
    },
};

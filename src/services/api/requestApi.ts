import { axiosClient } from '../../api/axiosClient';
import { ApiResponse } from '../../models/api';

export interface IRequestDetail {
    request_id: string;
    user: {
        id: string;
        name: string;
        profile_image: string | null;
    };
    product_name: string;
    gender: string | null;
    date_of_birth: string | null;
    profession: string | null;
    location: string | null;
    reason: string | null;
    requested_date: string;
}

export const REQUEST_ENDPOINTS = {
    GET_REQUEST_DETAIL: (id: string) => `/api/request/details/${id}`,
    ACCEPT_REQUEST: '/api/request/accept',
    REJECT_REQUEST: '/api/request/reject',
    REPORT_USER: '/api/user/report',
} as const;

export const requestApi = {
    getRequestDetail: async (id: string): Promise<ApiResponse<IRequestDetail>> => {
        const response = await axiosClient.get<ApiResponse<IRequestDetail>>(
            REQUEST_ENDPOINTS.GET_REQUEST_DETAIL(id)
        );
        return response.data;
    },

    acceptRequest: async (requestId: string): Promise<ApiResponse<null>> => {
        const response = await axiosClient.post<ApiResponse<null>>(
            REQUEST_ENDPOINTS.ACCEPT_REQUEST,
            { request_id: requestId }
        );
        return response.data;
    },

    rejectRequest: async (requestId: string, reason: string): Promise<ApiResponse<null>> => {
        const response = await axiosClient.post<ApiResponse<null>>(
            REQUEST_ENDPOINTS.REJECT_REQUEST,
            { request_id: requestId, reason }
        );
        return response.data;
    },

    reportUser: async (reportedUserId: string, reason: string): Promise<ApiResponse<null>> => {
        const response = await axiosClient.post<ApiResponse<null>>(
            REQUEST_ENDPOINTS.REPORT_USER,
            { reported_user_id: reportedUserId, reason }
        );
        return response.data;
    },
};

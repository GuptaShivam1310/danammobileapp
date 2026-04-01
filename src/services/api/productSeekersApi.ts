import { axiosClient } from '../../api/axiosClient';

export const PRODUCT_SEEKERS_ENDPOINTS = {
    GET_SEEKERS: (productId: string) => `/api/product-seekers/${productId}`,
} as const;

export interface Seeker {
    id: string; // the request_id
    userId: string; // the user_id
    name: string;
    avatar: string;
    status: 'pending' | 'active';
    lastMessage?: string;
    timestamp?: string;
}

export interface FetchProductSeekersResponse {
    success: boolean;
    data: Seeker[];
}

export const productSeekersApi = {
    /**
     * GET /api/product-seekers/:productId
     * Returns list of seekers for a given product.
     */
    getProductSeekers: async (productId: string): Promise<FetchProductSeekersResponse> => {
        const response = await axiosClient.get<FetchProductSeekersResponse>(
            PRODUCT_SEEKERS_ENDPOINTS.GET_SEEKERS(productId),
        );
        return response.data;
    },
};


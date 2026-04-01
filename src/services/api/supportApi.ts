import { axiosClient } from '../../api/axiosClient';
import { ApiResponse } from '../../models/api';

export const SUPPORT_ENDPOINTS = {
    FAQS: '/api/support/faqs',
    ABOUT: '/api/support/about',
    TERMS: '/api/support/terms',
    CONTACT: '/api/support/contact',
    RATE: '/api/support/rate',
} as const;

export interface FAQ {
    id: string;
    question: string;
    answer: string;
    created_at: string;
}

export interface AboutData {
    title: string;
    description: string;
    image_url: string;
}

export interface TermsData {
    title: string;
    content: string;
}

export interface ContactUsPayload {
    full_name: string;
    email: string;
    phone_number: string;
    message: string;
}

export const supportApi = {
    getFaqs: async (): Promise<FAQ[]> => {
        const response = await axiosClient.get<FAQ[]>(SUPPORT_ENDPOINTS.FAQS);
        return response.data;
    },
    getAbout: async (): Promise<AboutData> => {
        const response = await axiosClient.get<ApiResponse<AboutData>>(SUPPORT_ENDPOINTS.ABOUT);
        return response.data.data;
    },
    getTerms: async (): Promise<TermsData> => {
        const response = await axiosClient.get<ApiResponse<TermsData>>(SUPPORT_ENDPOINTS.TERMS);
        return response.data.data;
    },
    sendMessage: async (payload: ContactUsPayload): Promise<ApiResponse<null>> => {
        const response = await axiosClient.post<ApiResponse<null>>(SUPPORT_ENDPOINTS.CONTACT, payload);
        return response.data;
    },
    submitRating: async (rating: number): Promise<ApiResponse<null>> => {
        const response = await axiosClient.post<ApiResponse<null>>(SUPPORT_ENDPOINTS.RATE, { rating });
        return response.data;
    },
};


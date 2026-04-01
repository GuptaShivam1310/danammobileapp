import { axiosClient } from '../../api/axiosClient';
import { ChatItem } from '../../screens/ChatList/ChatListScreen';
import { ApiResponse } from '../../models/api';

export const CHAT_ENDPOINTS = {
    CHAT_PRODUCTS: '/api/chat/products',
    PRODUCT_SEEKERS: (productId: string) => `/api/chat/product-seekers/${productId}`,
    CHATS: '/api/chats',
    CHAT_MESSAGES: (requestId: string) => `/api/chat/messages/${requestId}`,
    SEND_MESSAGE: '/api/chat/send',
    UPLOAD_CHAT_FILE: '/api/chat/upload',
} as const;

export interface FetchChatsResponse {
    success: boolean;
    data: ChatItem[];
}

export interface BackendChatMessage {
    message_id: string;
    sender_id: string;
    message: string;
    type: string;
    created_at: string;
}

export interface FetchMessagesResponse {
    success: boolean;
    data: BackendChatMessage[];
}

export interface SendMessageResponse {
    success: boolean;
    data: BackendChatMessage;
}

export interface ProductSeekerResponse {
    request_id: string;
    user_id: string;
    name: string;
    profile_image: string;
    last_message: string | null;
    last_message_time: string | null;
    request_status: string;
}

export interface ProductChat {
    product_id: string;
    product_name: string;
    product_image: string;
    seeker_count: number;
    last_message_time: string | null;
    has_unread?: boolean;
}

export const chatApi = {
    /**
     * GET /api/seeker/chats
     * Returns a list of chats for the seeker.
     */
    getSeekerChats: async (): Promise<any[]> => {
        const response = await axiosClient.get<any>('/api/seeker/chats');
        const payload = response.data;
        if (Array.isArray(payload)) return payload;
        if (payload?.success && payload?.data) {
            if (payload.data.items && Array.isArray(payload.data.items)) return payload.data.items;
            if (Array.isArray(payload.data)) return payload.data;
        }
        if (payload?.items && Array.isArray(payload.items)) return payload.items;
        return [];
    },

    /**
     * GET /api/chat/products
     * Returns a list of products with chat info.
     */
    getChatProducts: async (): Promise<ProductChat[]> => {
        const response = await axiosClient.get<any>(CHAT_ENDPOINTS.CHAT_PRODUCTS);

        const payload = response.data;

        // 1. Direct array response
        if (Array.isArray(payload)) {
            return payload;
        }

        // 2. Wrapped object response (ApiResponse structure)
        if (payload?.success && payload?.data) {
            // Check for paginated items: data: { items: [...] }
            if (payload.data.items && Array.isArray(payload.data.items)) {
                return payload.data.items;
            }
            // Check for direct data array: data: [...]
            if (Array.isArray(payload.data)) {
                return payload.data;
            }
        }

        return [];
    },

    /**
     * GET /api/chat/product-seekers/:productId
     * Returns list of seekers for a given product.
     */
    getProductSeekers: async (productId: string): Promise<ApiResponse<ProductSeekerResponse[]>> => {
        const response = await axiosClient.get<ApiResponse<ProductSeekerResponse[]>>(
            CHAT_ENDPOINTS.PRODUCT_SEEKERS(productId),
        );
        return response.data;
    },

    /**
     * GET /api/chats
     * Returns a list of chat items for the authenticated user.
     * @deprecated Use getChatProducts instead
     */
    getChats: async (): Promise<FetchChatsResponse> => {
        const response = await axiosClient.get<FetchChatsResponse>(CHAT_ENDPOINTS.CHATS);
        return response.data;
    },

    /**
     * GET /api/chat/messages/:requestId
     * Fetch all messages for a specific request.
     */
    getChatMessages: async (requestId: string): Promise<FetchMessagesResponse> => {
        const response = await axiosClient.get<FetchMessagesResponse>(CHAT_ENDPOINTS.CHAT_MESSAGES(requestId));
        return response.data;
    },

    /**
     * POST /api/chat/send
     * Sends a new message to a specific request.
     */
    sendMessage: async (requestId: string, message: string, type: string = 'text'): Promise<SendMessageResponse> => {
        const response = await axiosClient.post<SendMessageResponse>(CHAT_ENDPOINTS.SEND_MESSAGE, {
            request_id: requestId,
            message,
            type,
        });
        return response.data;
    },

    /**
     * POST /api/chat/upload
     * Uploads an image to the chat and returns its URL.
     */
    uploadChatImage: async (fileUri: string, fileName?: string, mimeType?: string): Promise<ApiResponse<{ file_url: string }>> => {
        const formData = new FormData();

        const name = fileName || fileUri.split('/').pop() || 'file.dat';

        formData.append('file', {
            uri: fileUri,
            name: name,
            type: mimeType,
        } as any);

        const response = await axiosClient.post<ApiResponse<{ file_url: string }>>(
            CHAT_ENDPOINTS.UPLOAD_CHAT_FILE,
            formData,
            {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            }
        );
        return response.data;
    },
};

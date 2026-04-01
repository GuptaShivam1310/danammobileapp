import { axiosClient } from '../../api/axiosClient';
import get from 'lodash/get';
import { ApiResponse } from '../../models/api';

export const POST_ENDPOINTS = {
    CONTRIBUTIONS: '/api/contributions',
    CONTRIBUTION_DETAILS: (id: string) => `/api/contributions/${id}`,
    MY_CONTRIBUTIONS: '/api/contributions/my',
    CATEGORIES: '/api/categories',
    SUB_CATEGORIES: (id: string) => `/api/categories/${id}/subcategories`,
    ITEMS: '/api/items',
    ITEM_DETAILS: (id: string) => `/api/items/${id}`,
    ITEM_CONTRIBUTES: (id: string) => `/api/itemcontridutes/${id}`,
    UPLOAD_IMAGE: '/api/upload/image',
    CONTRIBUTION_SEEKERS: (id: string) => `/api/contributions/${id}/seekers`,
    ASSIGN_SEEKER: (id: string) => `/api/contributions/${id}/assign-seeker`,
    MARK_DONATED: (id: string) => `/api/contributions/${id}/mark-donated`,
    EXPRESS_INTEREST: (id: string) => `/api/contributions/${id}/interest`,
    CONTRIBUTION_FAVORITE: (id: string) => `/api/contributions/${id}/favorite`,
    FAVORITES: '/api/contributions/favorites',
    ASSIGNED_CONTRIBUTIONS: '/api/contributions/assigned',
} as const;

export interface ContributionPostApiItem {
    id: string;
    title: string;
    date: string;
    image?: string;
    images?: string[];
    description?: string;
    categoryName?: string;
    categoryId?: string;
    subCategoryName?: string;
    subCategoryId?: string;
    latitude?: number;
    longitude?: number;
    address?: string;
}

export interface Category {
    id: string;
    name: string;
    icon?: string;
    item_count: number;
}

export interface Item {
    id: string;
    title: string;
    location_address: string;
    created_at: string;
    is_featured: boolean;
    image?: string;
}

export interface ItemDetail {
    id: string;
    title: string;
    description?: string;
    category_id?: string;
    price?: number;
    location_address?: string;
    latitude?: number | null;
    longitude?: number | null;
    posted_by?: string;
    is_featured?: boolean;
    created_at?: string;
    updated_at?: string;
    deleted_at?: string | null;
    category?: {
        id?: string;
        name?: string;
        icon?: string;
        created_at?: string;
    };
    images?: string[];
    posted_by_user?: {
        id?: string;
        full_name?: string;
        profile_image_url?: string;
    };
}

export interface PaginationData {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export interface ItemsListResponse {
    items: Item[];
    pagination: PaginationData;
}

export const postApi = {
    deleteContribution: async (id: string): Promise<any> => {
        const response = await axiosClient.delete(POST_ENDPOINTS.CONTRIBUTION_DETAILS(id));
        return response.data;
    },

    markAsContributed: async (id: string): Promise<any> => {
        // Mocking API call for now. Adjust if/when an actual endpoint is ready.
        return new Promise(resolve =>
            setTimeout(() => resolve({ success: true, id }), 500),
        );
    },

    getCategories: async (signal?: AbortSignal): Promise<Category[]> => {
        const response = await axiosClient.get<ApiResponse<Category[]>>(
            POST_ENDPOINTS.CATEGORIES,
            { signal }
        );
        const categories = get(response.data, 'data', []);
        if (!Array.isArray(categories)) {
            return [];
        }
        return categories.map((category: any) => ({
            id: String(category.id || ''),
            name: String(category.name || ''),
            icon: category.icon,
            item_count: Number(category.item_count ?? 0),
        }));
    },

    getSubCategories: async (id: string, signal?: AbortSignal): Promise<any> => {
        const response = await axiosClient.get(POST_ENDPOINTS.SUB_CATEGORIES(id), { signal });
        return response.data;
    },

    getItems: async (
        page: number = 1,
        limit: number = 10,
        search?: string,
        categoryId?: string,
        signal?: AbortSignal,
    ): Promise<{
        items: Item[];
        pagination: PaginationData;
        success: boolean;
    }> => {
        const response = await axiosClient.get<ApiResponse<ItemsListResponse>>(
            POST_ENDPOINTS.ITEMS,
            {
                params: {
                    page,
                    limit,
                    ...(search && { search }),
                    ...(categoryId && { category_id: categoryId }),
                },
                signal,
            },
        );

        const items = get(response.data, 'data.items', []) as Item[];
        const pagination = get(response.data, 'data.pagination', {
            page,
            limit,
            total: 0,
            totalPages: 0,
        }) as PaginationData;

        return {
            items,
            pagination,
            success: response.data.success,
        };
    },

    getItemDetails: async (id: string, signal?: AbortSignal): Promise<ApiResponse<ItemDetail>> => {
        const response = await axiosClient.get<ApiResponse<ItemDetail>>(POST_ENDPOINTS.ITEM_DETAILS(id), { signal });
        return response.data;
    },
    getContributions: async (params: { page: number; limit: number; search?: string; location?: string }, signal?: AbortSignal): Promise<{
        items: any[];
        total: number;
        success: boolean;
    }> => {
        const { page, limit, search, location } = params;
        const response = await axiosClient.get<ApiResponse<{ items: any[]; total: number }>>(
            POST_ENDPOINTS.CONTRIBUTIONS,
            {
                params: {
                    page,
                    limit,

                },
                signal,
            },
        );
        return {
            items: get(response.data, 'data.items', []),
            total: get(response.data, 'data.total', 0),
            success: response.data.success,
        };
    },

    createContribution: async (data: any): Promise<any> => {
        const payload = {
            category_id: data.categoryId,
            subcategory_id: data.subCategoryId,
            title: String(data.title || '').trim(),
            description: String(data.description || '').trim(),
            condition: data.condition || 'used_good',
            quantity: data.quantity || 1,
            images: Array.from(new Set(data.images || [])).filter(img => typeof img === 'string' && img.startsWith('http')),
            location: {
                latitude: Number(data.latitude),
                longitude: Number(data.longitude),
                address: String(data.address || '').trim(),
            },
        };
        const response = await axiosClient.post(POST_ENDPOINTS.CONTRIBUTIONS, payload);
        return response.data;
    },
    updateContribution: async (id: string, data: any): Promise<any> => {
        const payload = {
            category_id: data.categoryId,
            subcategory_id: data.subCategoryId,
            title: String(data.title || '').trim(),
            description: String(data.description || '').trim(),
            condition: data.condition || 'used_good',
            quantity: data.quantity || 1,
            images: Array.from(new Set(data.images || [])).filter(img => typeof img === 'string' && img.startsWith('http')),
            location: {
                latitude: Number(data.latitude),
                longitude: Number(data.longitude),
                address: String(data.address || '').trim(),
            },
        };
        const response = await axiosClient.put(POST_ENDPOINTS.CONTRIBUTION_DETAILS(id), payload);
        return response.data;
    },

    getItemContributes: async (id: string): Promise<ContributionPostApiItem[]> => {
        const response = await axiosClient.get<
            ContributionPostApiItem[] | { data?: ContributionPostApiItem[] }
        >(POST_ENDPOINTS.ITEM_CONTRIBUTES(id));

        const payload = response.data;
        if (Array.isArray(payload)) {
            return payload;
        }
        return Array.isArray(payload?.data) ? payload.data : [];
    },

    uploadImage: async (uri: string): Promise<any> => {
        const formData = new FormData();
        const filename = uri.split('/').pop() || 'upload.jpg';
        const match = /\.(\w+)$/.exec(filename);
        const type = match ? `image/${match[1]}` : `image/jpeg`;

        formData.append('file', {
            uri: uri,
            name: filename,
            type: type,
        } as any);

        const response = await axiosClient.post(POST_ENDPOINTS.UPLOAD_IMAGE, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    },

    getMyContributions: async (params: { status: string; page: number; limit: number }, signal?: AbortSignal): Promise<any> => {
        const { status, page, limit } = params;
        const response = await axiosClient.get(`${POST_ENDPOINTS.MY_CONTRIBUTIONS}?status=${status}&page=${page}&limit=${limit}`, { signal });
        return response.data;
    },

    getAssignedContributions: async (page: number, limit: number, status: string): Promise<any> => {
        const response = await axiosClient.get(POST_ENDPOINTS.ASSIGNED_CONTRIBUTIONS, {
            params: { page, limit, status }
        });
        return response.data;
    },

    getContributionDetails: async (id: string, signal?: AbortSignal): Promise<any> => {
        const response = await axiosClient.get(POST_ENDPOINTS.CONTRIBUTION_DETAILS(id), { signal });
        return response.data;
    },

    getSeekers: async (contributionId: string, signal?: AbortSignal): Promise<any> => {
        const response = await axiosClient.get(POST_ENDPOINTS.CONTRIBUTION_SEEKERS(contributionId), { signal });
        return response.data;
    },

    assignSeeker: async (contributionId: string, seekerId: string, signal?: AbortSignal): Promise<any> => {
        const response = await axiosClient.post(POST_ENDPOINTS.ASSIGN_SEEKER(contributionId), {
            seeker_id: seekerId
        }, { signal });
        return response.data;
    },

    markDonated: async (contributionId: string, seekerId: string, signal?: AbortSignal): Promise<any> => {
        const response = await axiosClient.post(POST_ENDPOINTS.MARK_DONATED(contributionId), {
            seeker_id: seekerId
        }, { signal });
        return response.data;
    },
    expressInterest: async (contributionId: string, message: string): Promise<any> => {
        const payload = { message };
        const response = await axiosClient.post(
            POST_ENDPOINTS.EXPRESS_INTEREST(contributionId),
            payload,
        );
        return response.data;
    },
    cancelInterest: async (contributionId: string): Promise<any> => {
        const response = await axiosClient.delete(
            POST_ENDPOINTS.EXPRESS_INTEREST(contributionId),
        );
        return response.data;
    },
    addContributionToFavorite: async (contributionId: string): Promise<any> => {
        const response = await axiosClient.post(
            POST_ENDPOINTS.CONTRIBUTION_FAVORITE(contributionId),
        );
        return response.data;
    },
    removeContributionFromFavorite: async (contributionId: string): Promise<any> => {
        const response = await axiosClient.delete(
            POST_ENDPOINTS.CONTRIBUTION_FAVORITE(contributionId),
        );
        return response.data;
    },
    getFavoriteContributions: async (params: { page: number; limit: number }, signal?: AbortSignal): Promise<any> => {
        const { page, limit } = params;
        const response = await axiosClient.get(POST_ENDPOINTS.FAVORITES, {
            params: { page, limit },
            signal,
        });
        return response.data;
    },
};


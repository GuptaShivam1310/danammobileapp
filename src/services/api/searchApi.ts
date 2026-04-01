import { axiosClient } from '../../api/axiosClient';
import get from 'lodash/get';
import { ApiResponse } from '../../models/api';

export const SEARCH_ENDPOINTS = {
  SUGGESTIONS: '/api/search/suggestions',
  SEARCH: '/api/search',
} as const;

export interface SearchSuggestionsData {
  suggestions: string[];
  trending: string[];
}

export interface SearchItem {
  id: string;
  title: string;
  description: string;
  category_id: string;
  price: number;
  location_address: string;
  latitude: number | null;
  longitude: number | null;
  posted_by: string;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
  image_url?: string | null;
}

export interface SearchPagination {
  page: number;
  limit: number;
  total: number;
}

export interface SearchItemsData {
  items: SearchItem[];
  pagination: SearchPagination;
}

export const searchApi = {
  getSuggestions: async (query: string): Promise<SearchSuggestionsData> => {
    const response = await axiosClient.get<ApiResponse<SearchSuggestionsData>>(
      SEARCH_ENDPOINTS.SUGGESTIONS,
      {
        params: { query },
      },
    );

    const data = get(response.data, 'data', {} as SearchSuggestionsData);
    return {
      suggestions: Array.isArray(data?.suggestions) ? data.suggestions : [],
      trending: Array.isArray(data?.trending) ? data.trending : [],
    };
  },
  searchItems: async (
    query: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<SearchItemsData> => {
    const response = await axiosClient.get<ApiResponse<SearchItemsData>>(
      SEARCH_ENDPOINTS.SEARCH,
      {
        params: { query, page, limit },
      },
    );

    const data = get(response.data, 'data', {} as SearchItemsData);
    return {
      items: Array.isArray(data?.items) ? data.items : [],
      pagination: {
        page: Number(data?.pagination?.page ?? page),
        limit: Number(data?.pagination?.limit ?? limit),
        total: Number(data?.pagination?.total ?? 0),
      },
    };
  },
};



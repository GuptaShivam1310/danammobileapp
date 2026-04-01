import { axiosClient } from '../../api/axiosClient';

export interface ReceivedProductApiItem {
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
  contributorName?: string;
  contributorEmail?: string;
  contributorPhone?: string;
}

export const MY_RECEIVED_GOODS_ENDPOINTS = {
  GET_RECEIVED_PRODUCTS: '/api/received/product',
} as const;

export const myReceivedGoodsApi = {
  getReceivedProducts: async (): Promise<ReceivedProductApiItem[]> => {
    const response = await axiosClient.get<
      ReceivedProductApiItem[] | { data?: ReceivedProductApiItem[] }
    >(MY_RECEIVED_GOODS_ENDPOINTS.GET_RECEIVED_PRODUCTS);

    const payload = response.data;
    if (Array.isArray(payload)) {
      return payload;
    }

    return Array.isArray(payload?.data) ? payload.data : [];
  },
};

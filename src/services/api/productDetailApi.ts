import { axiosClient } from '../../api/axiosClient';
import { ProductDetailStatus } from '../../models/navigation';

export interface ProductStatusResponse {
  status: ProductDetailStatus | string;
}

export interface UpdateProductStatusRequest {
  id: string;
}

export interface UpdateProductStatusResponse {
  success: boolean;
  message: string;
}

export interface ReportIssueRequest {
  contribution_id: string;
  reason: string;
}

export interface ReportIssueResponse {
  success: boolean;
  message: string;
}

export const PRODUCT_DETAILS_ENDPOINTS = {
  GET_PRODUCT_STATUS: (id: string) => `/api/product/status/${id}`,
  UPDATE_PRODUCT_STATUS: '/api/product/status/update',
  REPORT_ISSUE: '/api/report',
} as const;

export const productDetailApi = {
  getProductStatus: async (id: string): Promise<ProductStatusResponse> => {
    const response = await axiosClient.get<ProductStatusResponse>(
      PRODUCT_DETAILS_ENDPOINTS.GET_PRODUCT_STATUS(id),
    );
    return response.data;
  },

  updateProductStatus: async (
    payload: UpdateProductStatusRequest,
  ): Promise<UpdateProductStatusResponse> => {
    const response = await axiosClient.put<UpdateProductStatusResponse>(
      PRODUCT_DETAILS_ENDPOINTS.UPDATE_PRODUCT_STATUS,
      payload,
    );
    return response.data;
  },

  reportIssue: async (payload: ReportIssueRequest): Promise<ReportIssueResponse> => {
    const response = await axiosClient.post<ReportIssueResponse>(
      PRODUCT_DETAILS_ENDPOINTS.REPORT_ISSUE,
      payload,
    );
    return response.data;
  },
};


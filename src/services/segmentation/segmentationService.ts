import { API_ENDPOINTS, DEFAULT_PAGE_SIZE, EntityStatus } from '@/constants';
import { apiRequest } from '@/services/client';
import type { ApiListResponse } from '@/types/api';
import type {
  SegmentationListParams,
  SegmentationListResult,
  SegmentationPayload,
  UserAccountType,
} from '@/types/segmentation';

type SegmentationListApiResponse =
  | UserAccountType[]
  | ApiListResponse<UserAccountType>;

const mapListResponse = (
  response: SegmentationListApiResponse,
  params: SegmentationListParams,
): SegmentationListResult => {
  if (Array.isArray(response)) {
    const fallbackSize = (params.size ?? response.length) || DEFAULT_PAGE_SIZE;
    return {
      data: response,
      total: response.length,
      page: params.page ?? 1,
      page_size: fallbackSize,
      size: fallbackSize,
    };
  }

  const list = Array.isArray(response.data) ? response.data : [];
  const inputPageZeroBased =
    params.page !== undefined
      ? Math.max(params.page - 1, 0)
      : params.pageNumber !== undefined
      ? Math.max(params.pageNumber - 1, 0)
      : 0;
  const pageZeroBased = response.page ?? inputPageZeroBased;
  const size =
    (response.size ?? params.size ?? list.length) || DEFAULT_PAGE_SIZE;

  return {
    data: list,
    total: response.total ?? list.length,
    page: pageZeroBased + 1,
    page_size: size,
    total_pages: response.total_pages,
    last: response.last,
  };
};

const normalizeStatusParam = (status?: EntityStatus | EntityStatus[]) => {
  if (!status) return undefined;
  return Array.isArray(status) ? status.join(',') : status;
};

export const fetchSegmentations = async (
  params: SegmentationListParams = {},
): Promise<SegmentationListResult> => {
  const pageZeroBased =
    params.page !== undefined
      ? Math.max(params.page - 1, 0)
      : params.pageNumber !== undefined
      ? Math.max(params.pageNumber - 1, 0)
      : 0;

  const nameParam = params.name ?? params.search;

  const requestParams: Record<string, unknown> = {
    page: pageZeroBased,
    size: params.size,
    status: normalizeStatusParam(params.status),
  };
  if (nameParam && nameParam.trim() !== '') {
    requestParams.name = nameParam;
  }

  const response = await apiRequest<SegmentationListApiResponse>(
    API_ENDPOINTS.SEGMENTATION.LIST,
    { params: requestParams, retry: { retries: 1 } },
  );

  return mapListResponse(response, params);
};

export const createSegmentation = async (
  payload: SegmentationPayload,
): Promise<UserAccountType> => {
  return apiRequest<UserAccountType>(API_ENDPOINTS.SEGMENTATION.CREATE, {
    method: 'POST',
    data: payload,
    retry: { retries: 0 },
  });
};

export const updateSegmentation = async (
  id: number,
  payload: SegmentationPayload,
): Promise<UserAccountType> => {
  return apiRequest<UserAccountType>(API_ENDPOINTS.SEGMENTATION.UPDATE(id), {
    method: 'PUT',
    data: payload,
    retry: { retries: 0 },
  });
};

export const deleteSegmentation = async (id: number): Promise<void> => {
  return apiRequest<void>(API_ENDPOINTS.SEGMENTATION.DELETE(id), {
    method: 'DELETE',
    retry: { retries: 0 },
  });
};

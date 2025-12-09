import { API_ENDPOINTS, DEFAULT_PAGE_SIZE, ENTITY_STATUS } from '@/constants';
import { apiRequest } from '@/services/client';
import type { ApiListResponse } from '@/types/api';
import type {
  Segmentation,
  SegmentationListParams,
  SegmentationListResult,
  SegmentationPayload,
} from '@/types/segmentation';

type SegmentationListApiResponse =
  | Segmentation[]
  | ApiListResponse<Segmentation>;

const normalizeItem = (item: Segmentation, index: number): Segmentation => ({
  ...item,
  // Generate id if missing (use index as fallback for display purposes)
  id: item.id ?? index,
});

const mapListResponse = (
  response: SegmentationListApiResponse,
  params: SegmentationListParams,
): SegmentationListResult => {
  if (Array.isArray(response)) {
    const fallbackSize = (params.size ?? response.length) || DEFAULT_PAGE_SIZE;
    return {
      data: response.map((item, index) => normalizeItem(item, index)),
      total: response.length,
      page: params.page ?? 1,
      page_size: fallbackSize,
      size: fallbackSize,
    };
  }

  const list = Array.isArray(response.data)
    ? response.data.map((item, index) => normalizeItem(item, index))
    : [];
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

const normalizeStatusParam = (status?: ENTITY_STATUS | ENTITY_STATUS[]) => {
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
    API_ENDPOINTS.SEGMENTATIONS.LIST,
    { params: requestParams, retry: { retries: 1 } },
  );

  return mapListResponse(response, params);
};

export const createSegmentation = async (
  payload: SegmentationPayload,
): Promise<Segmentation> => {
  return apiRequest<Segmentation>(API_ENDPOINTS.SEGMENTATIONS.CREATE, {
    method: 'POST',
    data: payload,
    retry: { retries: 0 },
  });
};

export const updateSegmentation = async (
  id: number,
  payload: SegmentationPayload,
): Promise<Segmentation> => {
  return apiRequest<Segmentation>(API_ENDPOINTS.SEGMENTATIONS.UPDATE(id), {
    method: 'PUT',
    data: payload,
    retry: { retries: 0 },
  });
};

export const deleteSegmentation = async (id: number): Promise<void> => {
  return apiRequest<void>(API_ENDPOINTS.SEGMENTATIONS.DELETE(id), {
    method: 'DELETE',
    retry: { retries: 0 },
  });
};

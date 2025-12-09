import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from '@/constants';
import { apiRequest } from '@/services/client';
import type { ApiListResponse } from '@/types/api';
import type {
  Store,
  StoreListParams,
  StoreListResult,
  StorePayload,
  StoreStatus,
} from '@/types/store';
import { getApiErrorMessage } from '@/utils/apiError';

/**
 * Store list API response type
 *
 * Supports both legacy array format and standardized ApiListResponse format.
 * New endpoints should use ApiListResponse<Store> directly.
 *
 * @see {@link ApiListResponse} for the standardized format
 */
type StoreListApiResponse =
  | Store[] // Legacy array format
  | ApiListResponse<Store>; // Standardized format

/**
 * Maps API response to standardized StoreListResult format
 *
 * Handles both legacy array format and standardized ApiListResponse format.
 * Normalizes pagination to 1-based page numbers.
 */
const mapStoreListResponse = (
  response: StoreListApiResponse,
  params: StoreListParams,
): StoreListResult => {
  // Handle legacy array format
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

  // Handle standardized ApiListResponse format
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

const normalizeStatusParam = (status?: StoreStatus | StoreStatus[]) => {
  if (!status) {
    return undefined;
  }
  return Array.isArray(status) ? status.join(',') : status;
};

export const fetchStores = async (
  params: StoreListParams = {},
): Promise<StoreListResult> => {
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

  const response = await apiRequest<StoreListApiResponse>(
    API_ENDPOINTS.STORES.LIST,
    {
      params: requestParams,
      retry: { retries: 1 },
    },
  );

  return mapStoreListResponse(response, params);
};

export const createStore = async (payload: StorePayload): Promise<Store> => {
  return apiRequest<Store>(API_ENDPOINTS.STORES.CREATE, {
    method: 'POST',
    data: payload,
    retry: { retries: 0 },
  });
};

export const updateStore = async (
  id: number,
  payload: StorePayload,
): Promise<Store> => {
  return apiRequest<Store>(API_ENDPOINTS.STORES.UPDATE, {
    method: 'PUT',
    data: { id, ...payload },
    retry: { retries: 0 },
  });
};

export const deleteStore = async (id: number): Promise<void> => {
  return apiRequest<void>(API_ENDPOINTS.STORES.DELETE(id), {
    method: 'DELETE',
    retry: { retries: 0 },
  });
};

export const downloadStores = async (): Promise<{
  blob: Blob;
  filename: string;
}> => {
  try {
    const response = await apiRequest<any>(API_ENDPOINTS.STORES.EXPORT, {
      method: 'GET',
      responseType: 'blob',
      getResponse: true,
      retry: { retries: 0 },
      useGlobalErrorHandler: false,
    });

    const disposition: string | undefined =
      (response.headers?.['content-disposition'] as string | undefined) ||
      (response.headers as Record<string, string> | undefined)?.[
        'Content-Disposition'
      ];

    const filenameMatch = disposition?.match(
      /filename\*=UTF-8''([^;]+)|filename="?([^";]+)"?/i,
    );
    const rawFilename =
      (filenameMatch?.[1] || filenameMatch?.[2]) ?? 'stores.xlsx';
    let filename = rawFilename;
    try {
      filename = decodeURIComponent(rawFilename);
    } catch (_e) {
      // keep raw filename if decode fails
    }

    const blob: Blob = response.data;
    return { blob, filename };
  } catch (error) {
    // Use global api error message normalization
    throw new Error(getApiErrorMessage(error));
  }
};

// Upload an XLSX file to create stores in bulk.
// Backend expects: multipart/form-data with a single part named "file" (xlsx only).
// It will process asynchronously and send a report via email to the current user.
export const uploadStoresFile = async (
  file: File,
): Promise<{ jobId?: string; message?: string }> => {
  const formData = new FormData();
  formData.append('file', file);

  // Do not set Content-Type header manually; the browser will add boundary.
  const response = await apiRequest<any>(API_ENDPOINTS.STORES.UPLOAD, {
    method: 'POST',
    data: formData,
    requestType: undefined,
    // In case backend responds with 202 or 200, we don't need retries
    retry: { retries: 0 },
    useGlobalErrorHandler: true,
  });

  if (response && typeof response === 'object') {
    const { jobId, message } = response as { jobId?: string; message?: string };
    return { jobId, message };
  }
  return {};
};

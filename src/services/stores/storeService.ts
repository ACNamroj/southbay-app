import { apiRequest } from '@/services/client';
import type {
  Store,
  StoreListParams,
  StoreListResult,
  StorePayload,
  StoreStatus,
} from '@/types/store';
import { getApiErrorMessage } from '@/utils/apiError';

type StoreListApiResponse =
  | Store[]
  | {
      data?: Store[];
      page: number;
      size: number;
      total: number;
      total_pages?: number;
      last: boolean;
    };

const mapStoreListResponse = (
  response: StoreListApiResponse,
  params: StoreListParams,
): StoreListResult => {
  if (Array.isArray(response)) {
    const fallbackSize = (params.size ?? response.length) || 10;
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
  const size = (response.size ?? params.size ?? list.length) || 10;

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

  const response = await apiRequest<StoreListApiResponse>('/v1/stores', {
    params: requestParams,
    retry: { retries: 1 },
  });

  return mapStoreListResponse(response, params);
};

export const createStore = async (payload: StorePayload): Promise<Store> => {
  return apiRequest<Store>('/v1/stores', {
    method: 'POST',
    data: payload,
    retry: { retries: 0 },
  });
};

export const updateStore = async (
  id: number,
  payload: StorePayload,
): Promise<Store> => {
  return apiRequest<Store>(`/v1/stores`, {
    method: 'PUT',
    data: { id, ...payload },
    retry: { retries: 0 },
  });
};

export const deleteStore = async (id: number): Promise<void> => {
  return apiRequest<void>(`/v1/stores/${id}`, {
    method: 'DELETE',
    retry: { retries: 0 },
  });
};

export const downloadStores = async (): Promise<{
  blob: Blob;
  filename: string;
}> => {
  try {
    const response = await apiRequest<any>('/v1/stores/export', {
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

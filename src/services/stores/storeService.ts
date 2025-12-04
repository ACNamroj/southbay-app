import { apiRequest, withBaseUrl } from '@/services/client';
import type {
  Store,
  StoreListParams,
  StoreListResult,
  StorePayload,
  StoreStatus,
} from '@/types/store';
import { getApiErrorMessage } from '@/utils/apiError';
import { getRequestInstance, type AxiosError } from '@umijs/max';

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
  return apiRequest<Store>(`/v1/stores/${id}`, {
    method: 'PATCH',
    data: payload,
    retry: { retries: 0 },
  });
};

export const deleteStore = async (id: number): Promise<Store> => {
  return apiRequest<Store>(`/v1/stores/${id}`, {
    method: 'PATCH',
    data: { status: 'DELETED' },
    retry: { retries: 0 },
  });
};

export const downloadStores = async (): Promise<{
  blob: Blob;
  filename: string;
}> => {
  try {
    const client = getRequestInstance();
    const response = await client.request<Blob>({
      url: withBaseUrl('/v1/stores/export'),
      method: 'GET',
      responseType: 'blob',
    });
    const disposition: string | undefined =
      (response.headers?.['content-disposition'] as string | undefined) ??
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
    const axiosError = error as AxiosError;
    const responseData = axiosError.response?.data;
    if (responseData instanceof Blob) {
      try {
        const text = await responseData.text();
        const parsed = JSON.parse(text);
        const message =
          parsed?.message ??
          (Array.isArray(parsed?.messages)
            ? parsed.messages.join(', ')
            : undefined);
        if (message) {
          throw new Error(message);
        }
      } catch (_err) {
        // fall through to the generic handler
      }
    }
    throw new Error(getApiErrorMessage(error));
  }
};

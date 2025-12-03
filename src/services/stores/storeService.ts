import { apiRequest } from '@/services/client';
import type {
  Store,
  StoreListParams,
  StoreListResult,
  StorePayload,
  StoreStatus,
} from '@/types/store';

type StoreListApiResponse =
  | Store[]
  | {
      data?: Store[];
      page?: number;
      page_size?: number;
      total?: number;
      total_pages?: number;
      last?: boolean;
    };

const mapStoreListResponse = (
  response: StoreListApiResponse,
  params: StoreListParams,
): StoreListResult => {
  if (Array.isArray(response)) {
    const fallbackSize =
      (params.page_size ?? params.pageSize ?? response.length) || 10;
    return {
      data: response,
      total: response.length,
      page: params.page ?? params.pageNumber ?? 1,
      page_size: fallbackSize,
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
  const page_size =
    (response.page_size ??
      params.page_size ??
      params.pageSize ??
      list.length) ||
    10;

  return {
    data: list,
    total: response.total ?? list.length,
    page: pageZeroBased + 1,
    page_size,
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

  const response = await apiRequest<StoreListApiResponse>('/v1/stores', {
    params: {
      page: pageZeroBased,
      size: params.page_size ?? params.pageSize,
      page_size: params.page_size ?? params.pageSize,
      name: params.name ?? params.search,
      status: normalizeStatusParam(params.status),
    },
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

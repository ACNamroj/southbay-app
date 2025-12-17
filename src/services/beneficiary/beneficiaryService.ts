import { API_ENDPOINTS, DEFAULT_PAGE_SIZE, ENTITY_STATUS } from '@/constants';
import { apiRequest } from '@/services/client';
import type { ApiListResponse } from '@/types/api';
import type {
  Beneficiary,
  BeneficiaryCreateRequest,
  BeneficiaryListParams,
  BeneficiaryListResult,
  BeneficiaryUpdateRequest,
} from '@/types/beneficiary';
import { getApiErrorMessage } from '@/utils/apiError';

type BeneficiaryListApiResponse = Beneficiary[] | ApiListResponse<Beneficiary>;

const mapListResponse = (
  response: BeneficiaryListApiResponse,
  params: BeneficiaryListParams,
): BeneficiaryListResult => {
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

const normalizeStatusParam = (status?: ENTITY_STATUS | ENTITY_STATUS[]) => {
  if (!status) return undefined;
  return Array.isArray(status) ? status.join(',') : status;
};

export const fetchBeneficiaries = async (
  params: BeneficiaryListParams = {},
): Promise<BeneficiaryListResult> => {
  const pageZeroBased =
    params.page !== undefined
      ? Math.max(params.page - 1, 0)
      : params.pageNumber !== undefined
      ? Math.max(params.pageNumber - 1, 0)
      : 0;

  const requestParams: Record<string, unknown> = {
    page: pageZeroBased,
    size: params.size,
    status: normalizeStatusParam(params.status),
  };

  if (params.text && params.text.trim() !== '') {
    requestParams.text = params.text;
  }

  const response = await apiRequest<BeneficiaryListApiResponse>(
    API_ENDPOINTS.BENEFICIARIES.LIST,
    { params: requestParams, retry: { retries: 1 } },
  );
  return mapListResponse(response, params);
};

export const createBeneficiary = async (
  payload: BeneficiaryCreateRequest,
): Promise<Beneficiary> => {
  return apiRequest<Beneficiary>(API_ENDPOINTS.BENEFICIARIES.CREATE, {
    method: 'POST',
    data: payload,
    retry: { retries: 0 },
  });
};

export const updateBeneficiary = async (
  payload: BeneficiaryUpdateRequest,
): Promise<Beneficiary> => {
  return apiRequest<Beneficiary>(API_ENDPOINTS.BENEFICIARIES.UPDATE, {
    method: 'PUT',
    data: payload,
    retry: { retries: 0 },
  });
};

export const deleteBeneficiary = async (id: number): Promise<void> => {
  return apiRequest<void>(API_ENDPOINTS.BENEFICIARIES.DELETE(id), {
    method: 'DELETE',
    retry: { retries: 0 },
  });
};

export const downloadBeneficiaries = async (): Promise<{
  blob: Blob;
  filename: string;
}> => {
  try {
    const response = await apiRequest<any>(API_ENDPOINTS.BENEFICIARIES.EXPORT, {
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
      (filenameMatch?.[1] || filenameMatch?.[2]) ?? 'beneficiary.xlsx';
    let filename = rawFilename;
    try {
      filename = decodeURIComponent(rawFilename);
    } catch (_) {}
    const blob: Blob = response.data;
    return { blob, filename };
  } catch (error) {
    throw new Error(getApiErrorMessage(error));
  }
};

export const uploadBeneficiariesFile = async (
  file: File,
): Promise<{ jobId?: string; message?: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await apiRequest<any>(API_ENDPOINTS.BENEFICIARIES.UPLOAD, {
    method: 'POST',
    data: formData,
    requestType: undefined,
    retry: { retries: 0 },
    useGlobalErrorHandler: true,
  });
  if (response && typeof response === 'object') {
    const { jobId, message } = response as { jobId?: string; message?: string };
    return { jobId, message };
  }
  return {};
};

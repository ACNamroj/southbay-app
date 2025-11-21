import type { ApiErrorResponse } from '@/types/api';
import type { AxiosError } from '@umijs/max';

const DEFAULT_ERROR_MESSAGE = 'Ocurrió un error. Por favor intenta nuevamente.';

export const normalizeApiError = (error: unknown): ApiErrorResponse => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  const payload = axiosError?.response?.data;
  if (payload?.message || payload?.messages) {
    return payload;
  }

  const asApiError = error as ApiErrorResponse;
  if (asApiError?.message || asApiError?.messages) {
    return asApiError;
  }

  if (error instanceof Error) {
    return { message: error.message };
  }

  return { message: DEFAULT_ERROR_MESSAGE };
};

export const getApiErrorMessage = (
  error: unknown,
  fallback?: string,
): string => {
  const normalized = normalizeApiError(error);
  const messages = normalized.messages?.filter(Boolean);
  if (messages && messages.length > 0) {
    return messages.join(', ');
  }
  return normalized.message ?? fallback ?? DEFAULT_ERROR_MESSAGE;
};

export const DEFAULT_API_ERROR_MESSAGE = DEFAULT_ERROR_MESSAGE;

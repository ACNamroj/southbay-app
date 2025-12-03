import { getApiErrorMessage, normalizeApiError } from '@/utils/apiError';
import type { RequestOptionsInit } from '@umijs/max';
import { request } from '@umijs/max';
import { message } from 'antd';
import type { AxiosError } from 'axios';

const API_BASE_URL = process.env.BASE_URL ?? '';

export const withBaseUrl = (path: string) => {
  if (!API_BASE_URL) {
    return path;
  }
  return `${API_BASE_URL.replace(/\/$/, '')}${path}`;
};

type RetryOptions = {
  retries?: number;
  retryDelayMs?: number;
  retryStatusCodes?: number[];
  retryOnNetworkError?: boolean;
};

type ApiRequestOptions = RequestOptionsInit & {
  retry?: RetryOptions;
  useGlobalErrorHandler?: boolean;
};

const sleep = (ms: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });

const shouldRetry = (error: AxiosError, retry?: RetryOptions) => {
  if (!retry) {
    return false;
  }
  const {
    retryStatusCodes = [429, 502, 503, 504],
    retryOnNetworkError = true,
  } = retry;
  const status = error.response?.status;
  const isNetworkError = !error.response;
  if (isNetworkError) {
    return retryOnNetworkError;
  }
  return status ? retryStatusCodes.includes(status) : false;
};

export const apiRequest = async <T>(
  path: string,
  options: ApiRequestOptions = {},
): Promise<T> => {
  const { retry, useGlobalErrorHandler = true, ...requestOptions } = options;
  const fullUrl = withBaseUrl(path);
  const retryAttempts = retry?.retries ?? 1;
  const delay = retry?.retryDelayMs ?? 300;

  let attempt = 0;
  let lastError: unknown;

  while (attempt <= retryAttempts) {
    try {
      return await request<T>(fullUrl, {
        ...requestOptions,
        skipErrorHandler: true,
      });
    } catch (error) {
      lastError = normalizeApiError(error);
      attempt += 1;
      const axiosError = error as AxiosError;
      if (attempt > retryAttempts || !shouldRetry(axiosError, retry)) {
        if (useGlobalErrorHandler && typeof window !== 'undefined') {
          message.error(getApiErrorMessage(lastError));
        }
        throw lastError;
      }
      await sleep(delay * attempt);
    }
  }

  if (useGlobalErrorHandler && typeof window !== 'undefined') {
    message.error(getApiErrorMessage(lastError));
  }
  throw normalizeApiError(lastError);
};

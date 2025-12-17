import { API_ENDPOINTS } from '@/constants';
import { refreshAuthToken } from '@/services/auth/tokenService';
import type { StoredAuthTokens } from '@/types/auth';
import { getApiErrorMessage, normalizeApiError } from '@/utils/apiError';
import {
  clearStoredAuthTokens,
  getStoredAuthorizationHeader,
  isStoredAccessTokenValid,
  mapApiTokensToStored,
  persistStoredAuthTokens,
  readRefreshTokenCookie,
  readStoredAuthTokens,
} from '@/utils/authTokens';
import type { RequestConfig } from '@umijs/max';
import {
  getRequestInstance,
  history,
  type AxiosError,
  type AxiosRequestConfig,
} from '@umijs/max';
import { message } from 'antd';

const AUTH_EXCLUDED_PATHS = [
  API_ENDPOINTS.AUTH.LOGIN,
  API_ENDPOINTS.AUTH.REFRESH,
  API_ENDPOINTS.AUTH.INITIATE_PASSWORD_RESET,
  API_ENDPOINTS.AUTH.VERIFY_PASSWORD_RESET_TOKEN,
  API_ENDPOINTS.AUTH.PASSWORD_RESET,
];

type AuthAxiosRequestConfig = AxiosRequestConfig & {
  skipAuthRefresh?: boolean;
  skipErrorHandler?: boolean;
  _retry?: boolean;
};

const isAuthRequest = (url?: string) => {
  if (!url) {
    return false;
  }
  return AUTH_EXCLUDED_PATHS.some((path) =>
    url.toLowerCase().includes(path.toLowerCase()),
  );
};

const handleUnauthorized = () => {
  clearStoredAuthTokens();
  history.replace('/login');
};

const applyAuthorizationHeader = (
  config: AxiosRequestConfig,
  token: string,
) => {
  const existingHeaders =
    (config.headers as Record<string, string> | undefined) ?? {};
  config.headers = {
    ...existingHeaders,
    Authorization: token,
  };
};

const resolveRefreshToken = () =>
  readRefreshTokenCookie() ?? readStoredAuthTokens()?.refreshToken;

const executeTokenRefresh = async () => {
  const refreshToken = resolveRefreshToken();
  if (!refreshToken) {
    handleUnauthorized();
    return undefined;
  }
  const response = await refreshAuthToken(refreshToken).catch((error) => {
    console.error('Refresh token error:', error);
    handleUnauthorized();
    return undefined;
  });
  if (!response?.token) {
    handleUnauthorized();
    return undefined;
  }
  const storedTokens = mapApiTokensToStored(response);
  persistStoredAuthTokens(storedTokens);
  return storedTokens;
};

let refreshPromise: Promise<StoredAuthTokens | undefined> | null = null;

const queueTokenRefresh = () => {
  if (!refreshPromise) {
    const pending = executeTokenRefresh().finally(() => {
      if (refreshPromise === pending) {
        refreshPromise = null;
      }
    });
    refreshPromise = pending;
  }
  return refreshPromise;
};

export const authRequestInterceptor = async (
  config: AuthAxiosRequestConfig,
) => {
  if (
    typeof window === 'undefined' ||
    config.skipAuthRefresh ||
    isAuthRequest(config.url)
  ) {
    return config;
  }
  if (!isStoredAccessTokenValid()) {
    const refreshed = await queueTokenRefresh();
    if (!refreshed?.token) {
      handleUnauthorized();
      config.skipAuthRefresh = true;
      return config;
    }
  }
  const header = getStoredAuthorizationHeader();
  if (header) {
    applyAuthorizationHeader(config, header);
  }
  return config;
};

export const authResponseErrorInterceptor = async (error: AxiosError) => {
  const { response, config } = error;
  const typedConfig = config as AuthAxiosRequestConfig | undefined;

  if (
    typeof window !== 'undefined' &&
    response?.status === 401 &&
    typedConfig &&
    !typedConfig.skipAuthRefresh &&
    !typedConfig._retry &&
    !isAuthRequest(typedConfig.url)
  ) {
    const refreshed = await queueTokenRefresh();
    if (refreshed?.token) {
      typedConfig._retry = true;
      typedConfig.skipAuthRefresh = true;
      applyAuthorizationHeader(
        typedConfig,
        `${refreshed.tokenType || 'Bearer'} ${refreshed.token}`,
      );
      return getRequestInstance().request(typedConfig);
    }
    handleUnauthorized();
  }

  return Promise.reject(error);
};

export const createRequestConfig = (): RequestConfig => ({
  requestInterceptors: [authRequestInterceptor],
  responseInterceptors: [
    [
      (response: any) => response,
      (error: AxiosError) => authResponseErrorInterceptor(error),
    ] as any,
  ],
  errorConfig: {
    errorHandler: (error: any): void => {
      const config = error?.config as AuthAxiosRequestConfig | undefined;
      if (config?.skipErrorHandler) {
        throw error;
      }
      const normalized = normalizeApiError(error);
      if (typeof window !== 'undefined') {
        message.error(getApiErrorMessage(normalized));
      }
      throw normalized;
    },
  },
});

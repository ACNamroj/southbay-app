import { refreshAuthToken } from '@/services/auth/tokenService';
import type { StoredAuthTokens } from '@/types/auth';
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

const AUTH_EXCLUDED_PATHS = [
  '/auth/login',
  '/auth/refresh',
  '/auth/initiate/password/reset',
  '/auth/password/reset/verify-token',
  '/auth/password/reset',
];

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
  if (config?.headers) {
    config.headers.Authorization = token;
  }
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

export const authRequestInterceptor = async (config: AxiosRequestConfig) => {
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

  if (
    typeof window !== 'undefined' &&
    response?.status === 401 &&
    config &&
    !config.skipAuthRefresh &&
    !config._retry &&
    !isAuthRequest(config.url)
  ) {
    const refreshed = await queueTokenRefresh();
    if (refreshed?.token) {
      config._retry = true;
      config.skipAuthRefresh = true;
      applyAuthorizationHeader(
        config,
        `${refreshed.tokenType || 'Bearer'} ${refreshed.token}`,
      );
      return getRequestInstance().request(config);
    }
    handleUnauthorized();
  }

  return Promise.reject(error);
};

export const createRequestConfig = (): RequestConfig => ({
  requestInterceptors: [authRequestInterceptor],
  responseInterceptors: [
    [
      (response) => response,
      (error: AxiosError) => authResponseErrorInterceptor(error),
    ] as any,
  ],
});

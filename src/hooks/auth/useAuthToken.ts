import { refreshAuthToken } from '@/services/auth/tokenService';
import type { StoredAuthTokens } from '@/types/auth';
import {
  clearStoredAuthTokens,
  decodeJwtToken,
  getStoredAuthorizationHeader,
  isStoredAccessTokenValid,
  mapApiTokensToStored,
  persistStoredAuthTokens,
  readRefreshTokenCookie,
  readStoredAuthTokens,
} from '@/utils/authTokens';
import { useCallback } from 'react';

export const useAuthToken = () => {
  const setAuthTokens = useCallback((tokens?: StoredAuthTokens) => {
    if (!tokens) {
      clearStoredAuthTokens();
      return;
    }
    persistStoredAuthTokens(tokens);
  }, []);

  const getAuthTokens = useCallback(() => readStoredAuthTokens(), []);

  const removeAuthTokens = useCallback(() => {
    clearStoredAuthTokens();
  }, []);

  const decodeToken = useCallback((token: string) => decodeJwtToken(token), []);

  const isAuthTokenValid = useCallback(() => isStoredAccessTokenValid(), []);

  const getAuthorizationHeader = useCallback(
    () => getStoredAuthorizationHeader(),
    [],
  );

  const refreshAuthTokens = useCallback(async () => {
    const tokens = readStoredAuthTokens();
    const refreshToken = tokens?.refreshToken ?? readRefreshTokenCookie();
    if (!refreshToken) {
      return undefined;
    }
    try {
      const response = await refreshAuthToken(refreshToken);
      if (response?.success && response?.data) {
        const mapped = mapApiTokensToStored(response.data);
        persistStoredAuthTokens(mapped);
        return mapped;
      }
      clearStoredAuthTokens();
      return undefined;
    } catch (error) {
      clearStoredAuthTokens();
      return undefined;
    }
  }, []);

  return {
    setAuthTokens,
    getAuthTokens,
    removeAuthTokens,
    decodeToken,
    isAuthTokenValid,
    getAuthorizationHeader,
    refreshAuthTokens,
  };
};

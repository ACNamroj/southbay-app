import type { StoredAuthTokens } from '@/types/auth';
import { useCallback } from 'react';

const AUTH_STORAGE_KEY = 'southbay:auth';

const isBrowser = () => typeof window !== 'undefined';

const readTokens = (): StoredAuthTokens | undefined => {
  if (!isBrowser()) return undefined;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) return undefined;
  try {
    return JSON.parse(raw) as StoredAuthTokens;
  } catch (error) {
    console.error('Invalid auth token payload', error);
    return undefined;
  }
};

const writeTokens = (payload: StoredAuthTokens) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(payload));
};

const removeTokens = () => {
  if (!isBrowser()) return;
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
};

const decodeBase64 = (input: string) => {
  if (typeof window !== 'undefined' && typeof window.atob === 'function') {
    return window.atob(input);
  }
  if (typeof globalThis !== 'undefined') {
    const nodeBuffer = (globalThis as any).Buffer as
      | undefined
      | {
          from: (
            input: string,
            encoding: string,
          ) => { toString: (enc: string) => string };
        };
    if (nodeBuffer) {
      return nodeBuffer.from(input, 'base64').toString('utf-8');
    }
  }
  return '';
};

const decodeJwt = (token: string) => {
  if (!token) return undefined;
  try {
    const base64Segment = token.split('.')[1];
    if (!base64Segment) return undefined;
    const base64 = base64Segment.replace(/-/g, '+').replace(/_/g, '/');
    const decoded = decodeBase64(base64);
    return JSON.parse(
      decodeURIComponent(
        decoded
          .split('')
          .map((c) => `%${`00${c.charCodeAt(0).toString(16)}`.slice(-2)}`)
          .join(''),
      ),
    );
  } catch (error) {
    console.error('Invalid auth token format', error);
    return undefined;
  }
};

export const useAuthToken = () => {
  const setAuthTokens = useCallback((tokens?: StoredAuthTokens) => {
    if (!tokens) {
      removeTokens();
      return;
    }
    writeTokens(tokens);
  }, []);

  const getAuthTokens = useCallback(() => readTokens(), []);

  const removeAuthTokens = useCallback(() => {
    removeTokens();
  }, []);

  const decodeToken = useCallback((token: string) => decodeJwt(token), []);

  const isAuthTokenValid = useCallback(() => {
    const tokens = readTokens();
    if (!tokens?.token) return false;
    const decoded = decodeJwt(tokens.token);
    const expiresFromToken = decoded?.exp;
    const expiresFromField = tokens.expiresAt
      ? Math.floor(new Date(tokens.expiresAt).getTime() / 1000)
      : undefined;
    const expiresAt = expiresFromToken ?? expiresFromField;
    if (!expiresAt) return true;
    const now = Date.now() / 1000;
    if (expiresAt <= now) {
      removeTokens();
      return false;
    }
    return true;
  }, []);

  const getAuthorizationHeader = useCallback(() => {
    const tokens = readTokens();
    if (!tokens?.token) return undefined;
    const prefix = tokens.tokenType || 'Bearer';
    return `${prefix} ${tokens.token}`;
  }, []);

  return {
    setAuthTokens,
    getAuthTokens,
    removeAuthTokens,
    decodeToken,
    isAuthTokenValid,
    getAuthorizationHeader,
  };
};

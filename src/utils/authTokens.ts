import type { LoginTokensResponse, StoredAuthTokens } from '@/types/auth';

const AUTH_STORAGE_KEY = 'southbay:auth';
const REFRESH_COOKIE_NAME = 'southbay_refresh_token';
const REFRESH_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const ACCESS_TOKEN_EXPIRY_LEEWAY_SECONDS = 30;

const isBrowser = () => typeof window !== 'undefined';

const readCookie = (name: string) => {
  if (!isBrowser()) {
    return undefined;
  }
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${name.replace(/([$?*|{}\]\\^])/g, '\\$1')}=([^;]*)`),
  );
  return match ? decodeURIComponent(match[1]) : undefined;
};

const isSecureContextAvailable = () => {
  if (!isBrowser()) {
    return false;
  }
  if (typeof window.isSecureContext === 'boolean') {
    return window.isSecureContext;
  }
  return window.location.protocol === 'https:';
};

const setCookie = (name: string, value: string, maxAgeSeconds?: number) => {
  if (!isBrowser()) {
    return;
  }
  const maxAge =
    typeof maxAgeSeconds === 'number' ? `;max-age=${maxAgeSeconds}` : '';
  const secure = isSecureContextAvailable() ? ';Secure' : '';
  document.cookie = `${name}=${encodeURIComponent(
    value,
  )};path=/${maxAge};SameSite=Strict${secure}`;
};

const deleteCookie = (name: string) => {
  if (!isBrowser()) {
    return;
  }
  document.cookie = `${name}=;path=/;max-age=0;SameSite=Strict`;
};

export const readStoredAuthTokens = (): StoredAuthTokens | undefined => {
  if (!isBrowser()) return undefined;
  const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
  if (!raw) {
    return undefined;
  }
  try {
    return JSON.parse(raw) as StoredAuthTokens;
  } catch (error) {
    console.error('Invalid auth token payload', error);
    return undefined;
  }
};

export const persistStoredAuthTokens = (payload?: StoredAuthTokens) => {
  if (!isBrowser()) {
    return;
  }
  if (!payload) {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    deleteCookie(REFRESH_COOKIE_NAME);
    return;
  }
  const { refreshToken, ...rest } = payload;
  window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(rest));
  if (refreshToken) {
    setCookie(
      REFRESH_COOKIE_NAME,
      refreshToken,
      REFRESH_COOKIE_MAX_AGE_SECONDS,
    );
  }
};

export const clearStoredAuthTokens = () => {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.removeItem(AUTH_STORAGE_KEY);
  deleteCookie(REFRESH_COOKIE_NAME);
};

export const readRefreshTokenCookie = () => readCookie(REFRESH_COOKIE_NAME);

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

export const decodeJwtToken = (token: string) => {
  if (!token) {
    return undefined;
  }
  try {
    const base64Segment = token.split('.')[1];
    if (!base64Segment) {
      return undefined;
    }
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

export const isStoredAccessTokenValid = () => {
  const tokens = readStoredAuthTokens();
  if (!tokens?.token) {
    return false;
  }
  const decoded = decodeJwtToken(tokens.token);
  const expiresFromToken = decoded?.exp;
  const expiresFromField = tokens.expiresAt
    ? Math.floor(new Date(tokens.expiresAt).getTime() / 1000)
    : undefined;
  const expiresAt = expiresFromToken ?? expiresFromField;
  if (!expiresAt) {
    return true;
  }
  const now = Date.now() / 1000;
  return expiresAt - ACCESS_TOKEN_EXPIRY_LEEWAY_SECONDS > now;
};

export const getStoredAuthorizationHeader = () => {
  const tokens = readStoredAuthTokens();
  if (!tokens?.token) {
    return undefined;
  }
  const prefix = tokens.tokenType || 'Bearer';
  return `${prefix} ${tokens.token}`;
};

export const mapApiTokensToStored = (
  payload: LoginTokensResponse,
): StoredAuthTokens => ({
  token: payload.token,
  refreshToken: payload.refresh_token,
  expiresAt: payload.expires_at,
  tokenType: payload.token_type,
});

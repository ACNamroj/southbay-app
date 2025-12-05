const SIDEBAR_STORAGE_KEY = 'sidebar_state';
const SIDEBAR_COOKIE_NAME = 'sidebar_state';
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

const isBrowser = () =>
  typeof window !== 'undefined' && typeof document !== 'undefined';

const readCookie = () => {
  if (!isBrowser()) {
    return null;
  }
  const match = document.cookie.match(
    new RegExp(
      `(?:^|; )${SIDEBAR_COOKIE_NAME.replace(
        /([.$?*|{}()[\]\\/+^])/g,
        '\\$1',
      )}=([^;]*)`,
    ),
  );
  return match ? decodeURIComponent(match[1]) : null;
};

export const readSidebarCollapsed = (): boolean | undefined => {
  if (!isBrowser()) {
    return undefined;
  }
  const stored = window.localStorage.getItem(SIDEBAR_STORAGE_KEY);
  if (stored !== null) {
    return stored === 'true';
  }
  const cookie = readCookie();
  if (cookie !== null) {
    return cookie === 'true';
  }
  return undefined;
};

export const persistSidebarCollapsed = (value: boolean) => {
  if (!isBrowser()) {
    return;
  }
  window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(value));
  document.cookie = `${SIDEBAR_COOKIE_NAME}=${value};path=/;max-age=${COOKIE_MAX_AGE_SECONDS};SameSite=Strict`;
};

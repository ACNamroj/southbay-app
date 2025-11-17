// Runtime configuration

// Global initial data configuration, used for initializing user info and permissions in the Layout
// For more information, see the documentation: https://umijs.org/docs/api/runtime-config#getinitialstate
import { LOGO_COMPACT, LOGO_ICON } from '@/assets';
import { useSiderCollapse } from '@/hooks/useSiderCollapse';
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
import {
  persistSidebarCollapsed,
  readSidebarCollapsed,
} from '@/utils/sidebarStorage';
import { UserOutlined } from '@ant-design/icons';
import type { MenuDataItem } from '@ant-design/pro-layout/lib/typing';
import {
  getRequestInstance,
  history,
  useModel,
  type AxiosError,
  type AxiosRequestConfig,
  type RequestConfig,
  type RunTimeLayoutConfig,
} from '@umijs/max';
import { Avatar, type AvatarProps } from 'antd';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import React from 'react';

export type CollapseType = 'clickTrigger' | 'responsive';

// Remove ProLayout's tooltip wrapper to avoid rc-resize-observer findDOMNode warnings in React 18.
const disableMenuTooltip = (menuItems: MenuDataItem[] = []): MenuDataItem[] =>
  menuItems.map((item) => {
    const patchedChildren = item.children
      ? disableMenuTooltip(item.children)
      : undefined;

    return {
      ...item,
      disabledTooltip: true,
      children: patchedChildren,
    };
  });

export type InitialState = {
  name: string;
  collapsed?: boolean;
  collapseType?: CollapseType;
};

export async function getInitialState(): Promise<InitialState> {
  const storedCollapsed = readSidebarCollapsed();
  return { name: 'Jorman', collapsed: storedCollapsed ?? false };
}

type LogoProps = {
  collapsed?: boolean;
};

const Logo: React.FC<LogoProps> = ({ collapsed: collapsedProp }) => {
  const { collapsed } = useSiderCollapse();
  const effectiveCollapsed = collapsedProp ?? collapsed;
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const getLogo = () => {
    if (isMobile) {
      return LOGO_COMPACT;
    }
    return effectiveCollapsed ? LOGO_ICON : LOGO_COMPACT;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: isMobile ? 8 : 15,
        padding: isMobile ? '8px 0' : 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src={getLogo()}
          alt="Southbay"
          style={{
            height: isMobile ? 40 : 50,
            maxWidth: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
      {!isMobile && !effectiveCollapsed && (
        <div
          style={{
            fontSize: 16,
            color: '#000',
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          Descuento de Empleados
        </div>
      )}
    </div>
  );
};

const UserMenuFooter: React.FC = () => {
  const { currentUser } = useModel('user');
  if (!currentUser) {
    return null;
  }
  const profile = currentUser.profile;
  const displayName =
    [profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
    currentUser.email;
  const avatarProps: AvatarProps = {};
  if (profile?.thumbnail || profile?.photo) {
    avatarProps.src = profile.thumbnail || profile.photo || undefined;
  } else {
    avatarProps.icon = <UserOutlined />;
    avatarProps.size = 'small';
  }
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '12px 16px',
        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
      }}
    >
      <Avatar {...avatarProps} />
      <span
        style={{
          fontWeight: 500,
          fontSize: 13,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {displayName}
      </span>
    </div>
  );
};

const AUTH_EXCLUDED_PATHS = ['/auth/login', '/auth/refresh'];

const isAuthRequest = (url?: string) => {
  if (!url) {
    return false;
  }
  return AUTH_EXCLUDED_PATHS.some((path) =>
    url.toLowerCase().includes(path.toLowerCase()),
  );
};

const applyAuthorizationHeader = (
  config: AxiosRequestConfig,
  value?: string,
) => {
  if (!value) {
    return;
  }
  if (!config.headers) {
    config.headers = {};
  }
  const headers = config.headers as any;
  if (headers && typeof headers.set === 'function') {
    headers.set('Authorization', value);
    return;
  }
  config.headers = {
    ...(headers || {}),
    Authorization: value,
  };
};

const handleUnauthorized = () => {
  clearStoredAuthTokens();
  if (typeof window === 'undefined') {
    return;
  }
  if (history.location.pathname !== '/login') {
    history.replace('/login');
  }
};

const executeTokenRefresh = async (): Promise<StoredAuthTokens | undefined> => {
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
  } catch (error) {
    // Ignore and clear tokens below
  }
  clearStoredAuthTokens();
  return undefined;
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

const authRequestInterceptor = async (config: AxiosRequestConfig) => {
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

const authResponseErrorInterceptor = async (error: AxiosError) => {
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

export const layout: RunTimeLayoutConfig<InitialState> = ({
  initialState,
  setInitialState,
}) => ({
  title: false,
  // Use a custom header to react to collapse state and responsive behavior
  menuHeaderRender: (
    _logoDom: React.ReactNode,
    _title: React.ReactNode,
    props: any,
  ) => <Logo collapsed={props?.collapsed ?? initialState?.collapsed} />,
  onCollapse: (collapsed: boolean, type?: CollapseType) => {
    setInitialState?.((s: object) => ({
      ...s,
      collapsed,
      collapseType: type,
    }));
    persistSidebarCollapsed(collapsed);
  },
  menuDataRender: disableMenuTooltip,
  menuFooterRender: () => <UserMenuFooter />,
});

export const request: RequestConfig = {
  requestInterceptors: [authRequestInterceptor],
  responseInterceptors: [
    [
      (response) => response,
      (error: AxiosError) => authResponseErrorInterceptor(error),
    ] as any,
  ],
};

// Runtime configuration

// Global initial data configuration, used for initializing user info and permissions in the Layout
// For more information, see the documentation: https://umijs.org/docs/api/runtime-config#getinitialstate
import { LOGO_COMPACT, LOGO_ICON } from '@/assets';
import { useAuthToken } from '@/hooks/auth/useAuthToken';
import { useSiderCollapse } from '@/hooks/useSiderCollapse';
import { logout } from '@/services/auth/logoutService';
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
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
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
import {
  Avatar,
  Button,
  Dropdown,
  Modal,
  type AvatarProps,
  type MenuProps,
} from 'antd';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import React, { useCallback } from 'react';

export type CollapseType = 'clickTrigger' | 'responsive';

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
  return { name: '', collapsed: storedCollapsed ?? false };
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
            height: isMobile ? 40 : 60,
            maxWidth: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
      {((!isMobile && !effectiveCollapsed) || (isMobile && !collapsed)) && (
        <div
          style={{
            fontSize: 16,
            fontWeight: 'bold',
            textAlign: 'center',
          }}
        >
          Descuento de Empleados
        </div>
      )}
    </div>
  );
};

const UserMenuFooter: React.FC = () => {
  const { currentUser, clearCurrentUser } = useModel('user');
  const { removeAuthTokens } = useAuthToken();
  const { collapsed } = useSiderCollapse();

  const profile = currentUser?.profile;
  const displayName =
    (currentUser &&
      ([profile?.first_name, profile?.last_name].filter(Boolean).join(' ') ||
        currentUser.email)) ||
    undefined;

  const avatarProps: AvatarProps = {};
  if (profile?.thumbnail || profile?.photo) {
    avatarProps.src = profile.thumbnail || profile.photo || undefined;
  } else {
    avatarProps.icon = <UserOutlined />;
    avatarProps.size = 'small';
  }

  const handleConfirmLogout = useCallback(async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    removeAuthTokens();
    clearCurrentUser();
    history.replace('/login');
  }, [removeAuthTokens, clearCurrentUser]);

  const handleLogoutClick = useCallback(() => {
    Modal.confirm({
      title: 'Cerrar sesión',
      content: '¿Seguro que deseas cerrar sesión?',
      okText: 'Cerrar sesión',
      cancelText: 'Cancelar',
      centered: true,
      onOk: handleConfirmLogout,
    });
  }, [handleConfirmLogout]);

  const handleUserMenuClick = useCallback<NonNullable<MenuProps['onClick']>>(
    ({ key }) => {
      if (key === 'logout') {
        handleLogoutClick();
      }
    },
    [handleLogoutClick],
  );

  const userMenuItems = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Cerrar sesión',
    },
  ];

  if (!currentUser) {
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'end',
        }}
      >
        <Button
          type="text"
          block={!collapsed}
          icon={<LogoutOutlined />}
          style={{
            justifyContent: collapsed ? 'center' : 'flex-start',
            paddingLeft: collapsed ? 0 : undefined,
          }}
          onClick={handleLogoutClick}
        >
          {!collapsed && 'Cerrar sesión'}
        </Button>
      </div>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'end',
      }}
    >
      <Dropdown
        trigger={['click']}
        menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
        placement="topRight"
      >
        <Button
          type="text"
          block={!collapsed}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: collapsed ? 0 : 8,
            justifyContent: collapsed ? 'center' : 'flex-end',
            paddingLeft: collapsed ? 0 : undefined,
          }}
        >
          <Avatar {...avatarProps} />

          {!collapsed && (
            <span
              style={{
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {displayName}
            </span>
          )}
        </Button>
      </Dropdown>
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
    console.error('Token refresh error:', error);
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

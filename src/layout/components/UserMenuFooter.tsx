import { useAuthToken } from '@/hooks/auth/useAuthToken';
import { useSiderCollapse } from '@/hooks/useSiderCollapse';
import { logout } from '@/services/auth/logoutService';
import { LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import {
  Avatar,
  Button,
  Dropdown,
  Modal,
  type AvatarProps,
  type MenuProps,
} from 'antd';
import React, { useCallback } from 'react';

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
        menu={{
          items: userMenuItems,
          onClick: handleUserMenuClick,
          className: 'user-menu-dropdown-menu',
        }}
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

export default UserMenuFooter;

import PasswordPolicyChecklist from '@/components/PasswordPolicyChecklist';
import { useAuthToken } from '@/hooks/auth/useAuthToken';
import { useSiderCollapse } from '@/hooks/useSiderCollapse';
import { logout } from '@/services/auth/logoutService';
import { updateCurrentUserPassword } from '@/services/user/passwordService';
import { getApiErrorMessage } from '@/utils/apiError';
import {
  evaluatePasswordPolicy,
  PASSWORD_POLICY_REGEX,
} from '@/utils/passwordPolicy';
import { LockOutlined, LogoutOutlined, UserOutlined } from '@ant-design/icons';
import { history, useModel } from '@umijs/max';
import {
  Avatar,
  Button,
  Dropdown,
  Form,
  Input,
  message,
  Modal,
  type AvatarProps,
  type MenuProps,
} from 'antd';
import React, { useCallback, useMemo, useState } from 'react';

const UserMenuFooter: React.FC = () => {
  const { currentUser, clearCurrentUser } = useModel('user');
  const { removeAuthTokens } = useAuthToken();
  const { collapsed } = useSiderCollapse();
  const [isPasswordModalOpen, setPasswordModalOpen] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordForm] = Form.useForm();
  const newPasswordValue = Form.useWatch('password', passwordForm) ?? '';
  const passwordPolicyStatus = useMemo(
    () => evaluatePasswordPolicy(newPasswordValue),
    [newPasswordValue],
  );
  const isPasswordValid = useMemo(
    () => Object.values(passwordPolicyStatus).every(Boolean),
    [passwordPolicyStatus],
  );

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

  const handlePasswordModalClose = useCallback(() => {
    setPasswordModalOpen(false);
    passwordForm.resetFields();
  }, [passwordForm]);

  const handleUserMenuClick = useCallback<NonNullable<MenuProps['onClick']>>(
    ({ key }) => {
      if (key === 'change-password') {
        setPasswordModalOpen(true);
        return;
      }
      if (key === 'logout') {
        handleLogoutClick();
      }
    },
    [handleLogoutClick],
  );
  const handlePasswordSubmit = useCallback(async () => {
    try {
      const values = await passwordForm.validateFields();
      setIsUpdatingPassword(true);
      const response = await updateCurrentUserPassword({
        current_password: values.currentPassword,
        password: values.password,
      });
      message.success(response?.message ?? 'Contraseña actualizada con éxito');
      handlePasswordModalClose();
    } catch (error: any) {
      if (error?.errorFields) {
        return;
      }
      console.error('Update password error:', error);
      message.error(
        getApiErrorMessage(
          error,
          'No pudimos actualizar tu contraseña. Por favor intenta nuevamente.',
        ),
      );
    } finally {
      setIsUpdatingPassword(false);
    }
  }, [passwordForm, handlePasswordModalClose]);

  const userMenuItems = [
    {
      key: 'change-password',
      icon: <LockOutlined />,
      label: 'Actualizar contraseña',
    },
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
      <Modal
        centered
        destroyOnClose
        title="Actualizar contraseña"
        open={isPasswordModalOpen}
        okText="Actualizar"
        cancelText="Cancelar"
        onCancel={handlePasswordModalClose}
        onOk={handlePasswordSubmit}
        confirmLoading={isUpdatingPassword}
      >
        <Form form={passwordForm} layout="vertical">
          <Form.Item
            label="Contraseña actual"
            name="currentPassword"
            rules={[
              {
                required: true,
                message: 'Por favor ingresa tu contraseña actual',
              },
            ]}
          >
            <Input.Password autoComplete="current-password" />
          </Form.Item>
          <Form.Item
            label="Nueva contraseña"
            name="password"
            rules={[
              {
                required: true,
                message: 'Por favor ingresa tu nueva contraseña',
              },
              {
                validator: (_, value) => {
                  if (!value) {
                    return Promise.resolve();
                  }
                  if (PASSWORD_POLICY_REGEX.test(value)) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error('La contraseña no cumple con los requisitos'),
                  );
                },
              },
            ]}
            validateStatus={
              newPasswordValue && !isPasswordValid ? 'error' : undefined
            }
            help={
              newPasswordValue && !isPasswordValid
                ? 'La contraseña no cumple con los requisitos'
                : undefined
            }
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
          <PasswordPolicyChecklist status={passwordPolicyStatus} />
          <Form.Item
            label="Confirmar nueva contraseña"
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              {
                required: true,
                message: 'Por favor confirma tu nueva contraseña',
              },
              ({ getFieldValue }) => ({
                validator: (_, value) => {
                  if (!value) {
                    return Promise.resolve();
                  }
                  if (value === getFieldValue('password')) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error('Las contraseñas no coinciden'),
                  );
                },
              }),
            ]}
          >
            <Input.Password autoComplete="new-password" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserMenuFooter;

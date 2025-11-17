import { LOGO } from '@/assets';
import { useAuthToken } from '@/hooks/auth/useAuthToken';
import { useSiderCollapse } from '@/hooks/useSiderCollapse';
import { login } from '@/services/login/loginService';
import type { LoginRequest } from '@/types/auth';
import { LoginFormPage, ProFormText } from '@ant-design/pro-components';
import { history, Link } from '@umijs/max';
import { message, theme } from 'antd';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import React, { useCallback, useEffect, useMemo } from 'react';

const Login: React.FC = () => {
  const { token } = theme.useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { collapsed, setCollapsed } = useSiderCollapse();
  const { setAuthTokens, isAuthTokenValid } = useAuthToken();

  const inputStyle = useMemo<React.CSSProperties>(
    () => ({
      borderRadius: token.borderRadius,
      borderColor: token.colorBorder,
      opacity: 0.7,
      width: '100%',
    }),
    [token.borderRadius, token.colorBorder],
  );

  const label = (text: string) => (
    <span
      style={{
        fontWeight: 600,
        color: token.colorText,
        fontSize: 12,
      }}
    >
      {text}
    </span>
  );

  useEffect(() => {
    if (collapsed) {
      setCollapsed(false);
    }
  }, [collapsed, setCollapsed]);

  useEffect(() => {
    if (isAuthTokenValid()) {
      history.push('/');
    }
  }, [isAuthTokenValid]);

  const handleFinish = useCallback(
    async (values: LoginRequest) => {
      try {
        const response = await login(values);
        if (response?.success && response?.data) {
          setAuthTokens({
            token: response.data.token,
            refreshToken: response.data.refresh_token,
            expiresAt: response.data.expires_at,
            tokenType: response.data.token_type,
          });
          history.push('/');
          return true;
        }
        message.error(response?.message || 'Credenciales inválidas');
        return false;
      } catch (error) {
        message.error('No pudimos iniciar sesión. Inténtalo de nuevo.');
        return false;
      }
    },
    [setAuthTokens],
  );

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <LoginFormPage
        logo={
          <Link to="/">
            <img
              alt="Southbay"
              src={LOGO}
              style={{
                width: '100%',
                objectFit: 'contain',
              }}
            />
          </Link>
        }
        containerStyle={{
          background: token.colorBgBase,
          border: `1px solid ${token.colorBorder}`,
          borderRadius: token.borderRadius,
          padding: isMobile ? '30px' : '45px',
          maxWidth: 420,
        }}
        mainStyle={{
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        submitter={{
          searchConfig: {
            submitText: 'Ingresar',
          },
          submitButtonProps: {
            size: 'small',
            style: {
              width: 180,
              height: 52,
              display: 'block',
              margin: `${isMobile ? '35px' : '60px'} auto`,
              backgroundColor: token.colorPrimary,
              border: 'none',
              fontSize: 12,
            },
          },
        }}
        actions={[
          <Link
            key="forgot-password"
            to="/forgot-password"
            style={{
              display: 'block',
              textAlign: 'center',
              color: token.colorLink,
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            Olvidé mi contraseña
          </Link>,
        ]}
        requiredMark={false}
        colon={false}
        layout="vertical"
        autoComplete="off"
        onFinish={handleFinish}
      >
        <ProFormText
          name="username"
          label={label('Correo')}
          placeholder=""
          rules={[
            {
              required: true,
              message: 'Por favor ingresa tu correo',
            },
            {
              type: 'email',
              message: 'Por favor ingresa un correo válido',
            },
          ]}
          fieldProps={{
            size: 'middle',
            style: inputStyle,
          }}
          formItemProps={{
            style: { marginBottom: 30 },
          }}
        />
        <ProFormText.Password
          name="password"
          label={label('Contraseña')}
          placeholder=""
          rules={[
            {
              required: true,
              message: 'Por favor ingresa tu contraseña',
            },
          ]}
          fieldProps={{
            size: 'middle',
            style: inputStyle,
          }}
        />
      </LoginFormPage>
    </div>
  );
};

export default Login;

import { LOGO } from '@/assets';
import { useSiderCollapse } from '@/hooks/useSiderCollapse';
import { initiatePasswordReset } from '@/services/auth/passwordResetService';
import { LoginFormPage, ProFormText } from '@ant-design/pro-components';
import { history, Link } from '@umijs/max';
import { message, theme } from 'antd';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import React, { useCallback, useEffect, useMemo } from 'react';

type ForgotPasswordFormValues = {
  email: string;
};

const ForgotPassword: React.FC = () => {
  const { token } = theme.useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { collapsed, setCollapsed } = useSiderCollapse();

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

  const handleFinish = useCallback(async (values: ForgotPasswordFormValues) => {
    try {
      const response = await initiatePasswordReset({
        email: values.email,
        origin: 'web',
      });

      if (response?.success) {
        message.success(
          response.message ??
            'Enviamos un correo con las instrucciones para restablecer tu contraseña',
        );
        history.push('/login');
        return true;
      }

      message.error(
        response?.message ??
          'No pudimos procesar la solicitud. Intenta nuevamente',
      );
      return false;
    } catch (error) {
      console.error('Forgot password error:', error);
      message.error('Ocurrió un error. Por favor intenta nuevamente');
      return false;
    }
  }, []);

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
        subTitle="Ingresa tu correo para solicitar el restablecimiento de contraseña."
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
            submitText: 'Solicitar',
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
            key="back-to-login"
            to="/login"
            style={{
              display: 'block',
              textAlign: 'center',
              color: token.colorLink,
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            Volver
          </Link>,
        ]}
        requiredMark={false}
        colon={false}
        layout="vertical"
        autoComplete="off"
        onFinish={handleFinish}
      >
        <ProFormText
          name="email"
          label={label('Correo')}
          placeholder=""
          fieldProps={{
            size: 'middle',
            style: inputStyle,
            autoComplete: 'email',
          }}
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
        />
      </LoginFormPage>
    </div>
  );
};

export default ForgotPassword;

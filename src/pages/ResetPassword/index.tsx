import { LOGO } from '@/assets';
import { useSiderCollapse } from '@/hooks/useSiderCollapse';
import {
  resetPassword,
  verifyPasswordResetToken,
} from '@/services/auth/passwordResetService';
import { LoginFormPage, ProFormText } from '@ant-design/pro-components';
import { history, Link, useParams } from '@umijs/max';
import { Alert, Form, message, Spin, theme } from 'antd';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

type ResetPasswordFormValues = {
  password: string;
  confirmPassword: string;
};

type RouteParams = {
  resetToken?: string;
};

const PASSWORD_POLICY_REGEX =
  /^(?=.*\p{Lu})(?=.*\p{Nd})(?=.*[^\p{L}\p{Nd}]).{8,}$/u;

const ensureBuenosAiresDate = (value: string): Date => {
  const normalized = value.replace(' ', 'T');
  if (/[+-]\d\d:\d\d$|Z$/i.test(normalized)) {
    return new Date(normalized);
  }
  return new Date(`${normalized}-03:00`);
};

const formatDuration = (ms: number) => {
  if (ms <= 0) {
    return '00:00';
  }
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(
    2,
    '0',
  )}`;
};

const ResetPassword: React.FC = () => {
  const { token } = theme.useToken();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const { collapsed, setCollapsed } = useSiderCollapse();
  const params = useParams<RouteParams>();
  const urlToken = params?.resetToken ?? '';

  const [form] = Form.useForm<ResetPasswordFormValues>();
  const passwordValue = Form.useWatch('password', form) ?? '';

  const [validatedToken, setValidatedToken] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState('00:00');
  const [verifying, setVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(
    null,
  );
  const [isExpired, setIsExpired] = useState(false);

  const inputStyle = useMemo<React.CSSProperties>(
    () => ({
      borderRadius: token.borderRadius,
      borderColor: token.colorBorder,
      opacity: 0.7,
      width: '100%',
    }),
    [token.borderRadius, token.colorBorder],
  );

  const policy = useMemo(
    () => ({
      length: passwordValue.length >= 8,
      uppercase: /\p{Lu}/u.test(passwordValue),
      digit: /\p{Nd}/u.test(passwordValue),
      special: /[^\p{L}\p{Nd}]/u.test(passwordValue),
    }),
    [passwordValue],
  );

  const isPasswordValid = Object.values(policy).every(Boolean);

  useEffect(() => {
    if (collapsed) {
      setCollapsed(false);
    }
  }, [collapsed, setCollapsed]);

  useEffect(() => {
    let mounted = true;
    const verifyToken = async () => {
      if (!urlToken) {
        setVerificationError(
          'El enlace no es válido. Solicita nuevamente el restablecimiento.',
        );
        setVerifying(false);
        return;
      }

      setVerifying(true);
      setVerificationError(null);
      setValidatedToken(null);
      setExpiresAt(null);
      setIsExpired(false);
      try {
        const response = await verifyPasswordResetToken(urlToken);
        if (!mounted) {
          return;
        }
        if (response?.success && response.data) {
          setValidatedToken(urlToken);
          const expirationDate = ensureBuenosAiresDate(
            response.data.expires_at,
          );
          setExpiresAt(expirationDate);
          setIsExpired(expirationDate.getTime() <= Date.now());
        } else {
          setVerificationError(
            response?.message ??
              'No pudimos validar el enlace. Solicita un nuevo correo.',
          );
        }
      } catch (error) {
        console.error('Verify reset token error:', error);
        setVerificationError(
          'Ocurrió un error al validar el enlace. Por favor intenta nuevamente.',
        );
      } finally {
        if (mounted) {
          setVerifying(false);
        }
      }
    };

    verifyToken();

    return () => {
      mounted = false;
    };
  }, [urlToken]);

  useEffect(() => {
    if (!expiresAt) {
      setTimeLeft('00:00');
      return;
    }

    const updateCountdown = () => {
      const diff = expiresAt.getTime() - Date.now();
      if (diff <= 0) {
        setTimeLeft('00:00');
        setIsExpired(true);
        setValidatedToken(null);
        setVerificationError(
          (prev) => prev ?? 'El enlace ha expirado. Solicita un nuevo correo.',
        );
        return false;
      }
      setTimeLeft(formatDuration(diff));
      return true;
    };

    updateCountdown();
    const interval = window.setInterval(() => {
      const shouldContinue = updateCountdown();
      if (!shouldContinue) {
        window.clearInterval(interval);
      }
    }, 1000);

    return () => {
      window.clearInterval(interval);
    };
  }, [expiresAt]);

  const handleFinish = useCallback(
    async (values: ResetPasswordFormValues) => {
      if (!validatedToken) {
        message.error(
          'No pudimos validar el enlace para restablecer tu contraseña.',
        );
        return false;
      }

      try {
        const response = await resetPassword({
          reset_token: validatedToken,
          password: values.password,
        });

        if (response?.success) {
          message.success(
            response.message ??
              'Tu contraseña fue restablecida correctamente. Inicia sesión con tus nuevas credenciales.',
          );
          history.push('/login');
          return true;
        }

        message.error(
          response?.message ??
            'No pudimos restablecer tu contraseña. Intenta nuevamente.',
        );
        return false;
      } catch (error) {
        console.error('Reset password error:', error);
        message.error('Ocurrió un error. Por favor intenta nuevamente.');
        return false;
      }
    },
    [validatedToken],
  );

  const checklistItems = [
    { key: 'length', label: '8 caracteres', satisfied: policy.length },
    { key: 'uppercase', label: '1 mayúscula', satisfied: policy.uppercase },
    { key: 'digit', label: '1 dígito', satisfied: policy.digit },
    { key: 'special', label: '1 carácter especial', satisfied: policy.special },
  ];

  const isFormDisabled =
    verifying || !!verificationError || isExpired || !validatedToken;
  const normalizedVerificationMessage = verificationError?.toLowerCase() ?? '';
  const tokenPreviouslyApplied =
    normalizedVerificationMessage.includes('token aplicado') ||
    normalizedVerificationMessage.includes('aplicado previamente');
  const shouldHideForm = tokenPreviouslyApplied;

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
        subTitle={
          shouldHideForm
            ? undefined
            : 'Ingresa tu nueva contraseña y confírmala.'
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
        form={form}
        submitter={
          shouldHideForm
            ? { render: () => null }
            : {
                searchConfig: {
                  submitText: 'Restablecer',
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
                  disabled: isFormDisabled || !isPasswordValid,
                },
              }
        }
        actions={
          shouldHideForm
            ? undefined
            : [
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
                <span
                  key="expiration"
                  style={{
                    display: 'block',
                    textAlign: 'center',
                    color: token.colorTextSecondary,
                    fontSize: 12,
                  }}
                >
                  Tiempo restante: {timeLeft}
                </span>,
              ]
        }
        requiredMark={false}
        colon={false}
        layout="vertical"
        autoComplete="off"
        onFinish={handleFinish}
      >
        {verifying && (
          <Spin
            size="small"
            tip="Validando enlace..."
            style={{ marginBottom: 16 }}
          />
        )}
        {verificationError && (
          <Alert
            type="error"
            showIcon
            style={{ marginBottom: 16 }}
            message={verificationError}
          />
        )}
        {shouldHideForm ? (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginTop: 16,
            }}
          >
            <Link
              to="/forgot-password"
              style={{
                color: token.colorLink,
                fontSize: 14,
                fontWeight: 500,
                marginTop: 60,
              }}
            >
              Genera uno nuevo
            </Link>
          </div>
        ) : (
          <>
            <ProFormText.Password
              name="password"
              label="Nueva contraseña"
              placeholder=""
              fieldProps={{
                size: 'middle',
                style: inputStyle,
                autoComplete: 'new-password',
                disabled: isFormDisabled,
              }}
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
              formItemProps={{
                validateStatus:
                  passwordValue && !isPasswordValid ? 'error' : undefined,
                help:
                  passwordValue && !isPasswordValid ? (
                    <div>La contraseña no cumple con los requisitos</div>
                  ) : undefined,
                style: { marginBottom: 0 },
              }}
            />
            <div style={{ marginBottom: 24, marginTop: 8 }}>
              {checklistItems.map((item) => (
                <div
                  key={item.key}
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    fontSize: 12,
                    color: item.satisfied
                      ? token.colorSuccess
                      : token.colorError,
                    lineHeight: 1.6,
                  }}
                >
                  <span>•</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
            <ProFormText.Password
              name="confirmPassword"
              label="Confirmar contraseña"
              placeholder=""
              fieldProps={{
                size: 'middle',
                style: inputStyle,
                autoComplete: 'new-password',
                disabled: isFormDisabled,
              }}
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
            />
          </>
        )}
      </LoginFormPage>
    </div>
  );
};

export default ResetPassword;

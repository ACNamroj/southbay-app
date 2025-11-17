import { LOGO } from '@/assets';
import { LoginFormPage, ProFormText } from '@ant-design/pro-components';
import { Link } from '@umijs/max';
import { theme } from 'antd';
import React from 'react';

const Login: React.FC = () => {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        width: '100vw',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: token.colorBgBase,
      }}
    >
      <LoginFormPage
        logo={
          <img
            alt="Southbay"
            src={LOGO}
            style={{ height: 100, objectFit: 'contain' }}
          />
        }
        containerStyle={{
          background: token.colorBgContainer,
          border: `1px solid ${token.colorBorder}`,
          borderRadius: token.borderRadiusLG,
        }}
        submitter={{
          searchConfig: {
            submitText: 'Ingresar',
          },
          submitButtonProps: {
            size: 'large',
            style: {
              width: '60%',
              display: 'flex',
              justifySelf: 'center',
              backgroundColor: token['primary-color'],
            },
          },
        }}
        actions={[
          <Link key="forgot-password" to="/forgot-password">
            Olvidé mi contraseña
          </Link>,
        ]}
        onFinish={async () => {
          return true;
        }}
      >
        <ProFormText
          name="email"
          label="Correo"
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
          fieldProps={{ size: 'middle' }}
        />
        <ProFormText.Password
          name="password"
          label="Contraseña"
          placeholder=""
          rules={[
            {
              required: true,
              message: 'Por favor ingresa tu contraseña',
            },
          ]}
          fieldProps={{ size: 'middle' }}
        />
      </LoginFormPage>
    </div>
  );
};

export default Login;

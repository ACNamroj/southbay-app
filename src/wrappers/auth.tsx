import { useAuthToken } from '@/hooks/auth/useAuthToken';
import { history, Outlet, useModel } from '@umijs/max';
import { Spin } from 'antd';
import React, { useEffect, useState } from 'react';

const AuthWrapper: React.FC = () => {
  const { isAuthTokenValid, refreshAuthTokens, removeAuthTokens } =
    useAuthToken();
  const { currentUser, fetchCurrentUser, clearCurrentUser } = useModel('user');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const redirectToLogin = () => {
      if (cancelled) {
        return;
      }
      removeAuthTokens();
      clearCurrentUser();
      history.replace('/login');
    };

    const ensureAuth = async () => {
      let hasValidToken = isAuthTokenValid();
      if (!hasValidToken) {
        const refreshed = await refreshAuthTokens();
        hasValidToken = Boolean(refreshed?.token);
      }
      if (!hasValidToken) {
        redirectToLogin();
        return;
      }
      if (!currentUser) {
        const user = await fetchCurrentUser();
        if (!user) {
          redirectToLogin();
          return;
        }
      }
      if (!cancelled) {
        setIsReady(true);
      }
    };

    ensureAuth();

    return () => {
      cancelled = true;
    };
  }, [
    isAuthTokenValid,
    refreshAuthTokens,
    removeAuthTokens,
    fetchCurrentUser,
    clearCurrentUser,
    currentUser,
  ]);

  if (!isReady) {
    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Spin size="large" tip="Cargando sesión..." />
      </div>
    );
  }

  return <Outlet />;
};

export default AuthWrapper;

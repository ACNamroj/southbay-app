import { useAuthToken } from '@/hooks/auth/useAuthToken';
import { history, Outlet, useModel } from '@umijs/max';
import React, { useEffect, useState } from 'react';

const AuthWrapper: React.FC = () => {
  const { isAuthTokenValid, refreshAuthTokens, removeAuthTokens } =
    useAuthToken();
  const { currentUser, fetchCurrentUser, clearCurrentUser } = useModel('user');
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const ensureAuth = async () => {
      let hasValidToken = isAuthTokenValid();
      if (!hasValidToken) {
        const refreshed = await refreshAuthTokens();
        hasValidToken = Boolean(refreshed?.token);
      }
      if (!hasValidToken) {
        removeAuthTokens();
        clearCurrentUser();
        if (!cancelled) {
          history.replace('/login');
        }
        return;
      }
      if (!currentUser) {
        await fetchCurrentUser();
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
    return null;
  }

  return <Outlet />;
};

export default AuthWrapper;

import { useAuthToken } from '@/hooks/auth/useAuthToken';
import { history, Outlet } from '@umijs/max';
import React, { useEffect, useState } from 'react';

const AuthWrapper: React.FC = () => {
  const { isAuthTokenValid, refreshAuthTokens, removeAuthTokens } =
    useAuthToken();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const ensureAuth = async () => {
      if (isAuthTokenValid()) {
        if (!cancelled) {
          setIsReady(true);
        }
        return;
      }
      const refreshed = await refreshAuthTokens();
      if (cancelled) {
        return;
      }
      if (refreshed?.token) {
        setIsReady(true);
        return;
      }
      removeAuthTokens();
      history.replace('/login');
    };

    ensureAuth();

    return () => {
      cancelled = true;
    };
  }, [isAuthTokenValid, refreshAuthTokens, removeAuthTokens]);

  if (!isReady) {
    return null;
  }

  return <Outlet />;
};

export default AuthWrapper;

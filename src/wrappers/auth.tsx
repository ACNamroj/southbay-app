import { useAuthToken } from '@/hooks/auth/useAuthToken';
import { history, Outlet } from '@umijs/max';
import React, { useEffect, useState } from 'react';

const AuthWrapper: React.FC = () => {
  const { isAuthTokenValid } = useAuthToken();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const valid = isAuthTokenValid();
    if (!valid) {
      history.replace('/login');
      return;
    }
    setIsReady(true);
  }, [isAuthTokenValid]);

  if (!isReady) {
    return null;
  }

  return <Outlet />;
};

export default AuthWrapper;

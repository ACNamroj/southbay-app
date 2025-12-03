import { Alert } from 'antd';
import React, { useEffect, useState } from 'react';

const OfflineNotice: React.FC = () => {
  const [isOnline, setIsOnline] = useState(
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    return null;
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 16,
        right: 16,
        zIndex: 1000,
        maxWidth: 360,
      }}
    >
      <Alert
        message="Sin conexión"
        description="Parece que no tienes conexión a internet. Intentando reconectar..."
        type="warning"
        showIcon
      />
    </div>
  );
};

export default OfflineNotice;

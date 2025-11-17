import { getCurrentUser } from '@/services/user/userService';
import type { User } from '@/types/user';
import { useCallback, useState } from 'react';

export default () => {
  const [currentUser, setCurrentUser] = useState<User | undefined>();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const response = await getCurrentUser();
      if (response?.success && response?.data) {
        setCurrentUser(response.data);
        return response.data;
      }
      setCurrentUser(undefined);
      return undefined;
    } catch (error) {
      setCurrentUser(undefined);
      return undefined;
    }
  }, []);

  const clearCurrentUser = useCallback(() => {
    setCurrentUser(undefined);
  }, []);

  return {
    currentUser,
    setCurrentUser,
    fetchCurrentUser,
    clearCurrentUser,
  };
};

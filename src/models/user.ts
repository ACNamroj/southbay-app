import { getCurrentUser } from '@/services/user/userService';
import type { User } from '@/types/user';
import { useCallback, useState } from 'react';

export default () => {
  const [currentUser, setCurrentUser] = useState<User | undefined>();

  const fetchCurrentUser = useCallback(async () => {
    try {
      const user = await getCurrentUser();
      setCurrentUser(user);
      return user;
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

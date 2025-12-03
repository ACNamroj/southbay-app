import { apiRequest } from '@/services/client';
import type { User } from '@/types/user';

export const getCurrentUser = async (): Promise<User> => {
  return apiRequest<User>('/v1/users/me', {
    retry: { retries: 1 },
  });
};

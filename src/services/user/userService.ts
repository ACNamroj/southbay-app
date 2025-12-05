import { API_ENDPOINTS } from '@/constants';
import { apiRequest } from '@/services/client';
import type { User } from '@/types/user';

export const getCurrentUser = async (): Promise<User> => {
  return apiRequest<User>(API_ENDPOINTS.USERS.ME, {
    retry: { retries: 1 },
  });
};

import { apiRequest } from '@/services/client';

export const logout = async () => {
  await apiRequest<void>('/auth/logout', {
    method: 'POST',
    retry: { retries: 0 },
  });
};

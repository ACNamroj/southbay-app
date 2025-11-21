import { withBaseUrl } from '@/services/client';
import type { User } from '@/types/user';
import { normalizeApiError } from '@/utils/apiError';
import { request } from '@umijs/max';

export const getCurrentUser = async (): Promise<User> => {
  try {
    return await request<User>(withBaseUrl('/v1/users/me'));
  } catch (error) {
    throw normalizeApiError(error);
  }
};

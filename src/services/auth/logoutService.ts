import { withBaseUrl } from '@/services/client';
import { normalizeApiError } from '@/utils/apiError';
import { request } from '@umijs/max';

export const logout = async () => {
  try {
    await request<void>(withBaseUrl('/auth/logout'), {
      method: 'POST',
    });
  } catch (error) {
    throw normalizeApiError(error);
  }
};

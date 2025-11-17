import { withBaseUrl } from '@/services/client';
import type { ApiResponse } from '@/types/api';
import { request } from '@umijs/max';

export const logout = () =>
  request<ApiResponse<null>>(withBaseUrl('/auth/logout'), {
    method: 'POST',
  });

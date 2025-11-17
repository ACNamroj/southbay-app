import { withBaseUrl } from '@/services/client';
import type { ApiResponse } from '@/types/api';
import type { User } from '@/types/user';
import { request } from '@umijs/max';

export const getCurrentUser = () =>
  request<ApiResponse<User>>(withBaseUrl('/v1/users/me'));

import { withBaseUrl } from '@/services/client';
import type { ApiResponse } from '@/types/api';
import type { LoginRequest, LoginTokensResponse } from '@/types/auth';
import { request } from '@umijs/max';

export const login = (body: LoginRequest) =>
  request<ApiResponse<LoginTokensResponse>>(withBaseUrl('/auth/login'), {
    method: 'POST',
    data: body,
  });

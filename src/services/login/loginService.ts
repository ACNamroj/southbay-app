import type { ApiResponse } from '@/types/api';
import type { LoginRequest, LoginTokensResponse } from '@/types/auth';
import { request } from '@umijs/max';

const API_BASE_URL = process.env.BASE_URL ?? '';

const withBaseUrl = (path: string) => {
  if (!API_BASE_URL) {
    return path;
  }
  return `${API_BASE_URL.replace(/\/$/, '')}${path}`;
};

export const login = (body: LoginRequest) =>
  request<ApiResponse<LoginTokensResponse>>(withBaseUrl('/auth/login'), {
    method: 'POST',
    data: body,
  });

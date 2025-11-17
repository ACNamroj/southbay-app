import type { LoginRequest, LoginTokensResponse } from '@/types/auth';
import { request } from '@umijs/max';

const API_BASE_URL = process.env.BASE_URL ?? '';

const withBaseUrl = (path: string) => {
  if (!API_BASE_URL) {
    return path;
  }
  return `${API_BASE_URL.replace(/\/$/, '')}${path}`;
};

export type LoginApiResponse = {
  success: boolean;
  message?: string | null;
  data?: LoginTokensResponse;
};

export const login = (body: LoginRequest) =>
  request<LoginApiResponse>(withBaseUrl('/auth/login'), {
    method: 'POST',
    data: body,
  });

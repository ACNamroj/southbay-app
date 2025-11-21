import { withBaseUrl } from '@/services/client';
import type { LoginRequest, LoginTokensResponse } from '@/types/auth';
import { getApiErrorMessage, normalizeApiError } from '@/utils/apiError';
import { request } from '@umijs/max';

export const login = async (
  body: LoginRequest,
): Promise<LoginTokensResponse> => {
  try {
    return await request<LoginTokensResponse>(withBaseUrl('/auth/login'), {
      method: 'POST',
      data: body,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Login request error:', getApiErrorMessage(error));
    }
    throw normalizeApiError(error);
  }
};

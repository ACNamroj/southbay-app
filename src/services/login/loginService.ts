import { API_ENDPOINTS } from '@/constants';
import { apiRequest } from '@/services/client';
import type { LoginRequest, LoginTokensResponse } from '@/types/auth';
import { getApiErrorMessage } from '@/utils/apiError';

export const login = async (
  body: LoginRequest,
): Promise<LoginTokensResponse> => {
  try {
    return await apiRequest<LoginTokensResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      method: 'POST',
      data: body,
      retry: { retries: 0, retryOnNetworkError: true },
      useGlobalErrorHandler: false,
    });
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      console.error('Login request error:', getApiErrorMessage(error));
    }
    throw error;
  }
};

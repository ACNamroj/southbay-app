import { apiRequest } from '@/services/client';
import type { LoginTokensResponse } from '@/types/auth';

export const refreshAuthToken = async (
  refreshToken: string,
): Promise<LoginTokensResponse> => {
  return apiRequest<LoginTokensResponse>('/auth/refresh', {
    method: 'POST',
    data: { refresh_token: refreshToken },
    skipAuthRefresh: true,
    useGlobalErrorHandler: false,
    retry: { retries: 1, retryDelayMs: 400 },
  });
};

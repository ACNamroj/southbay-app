import { withBaseUrl } from '@/services/client';
import type { LoginTokensResponse } from '@/types/auth';
import { normalizeApiError } from '@/utils/apiError';
import { getRequestInstance } from '@umijs/max';

export const refreshAuthToken = async (
  refreshToken: string,
): Promise<LoginTokensResponse> => {
  try {
    const response = await getRequestInstance().post<LoginTokensResponse>(
      withBaseUrl('/auth/refresh'),
      { refresh_token: refreshToken },
      { skipAuthRefresh: true } as any,
    );
    return response.data;
  } catch (error) {
    throw normalizeApiError(error);
  }
};

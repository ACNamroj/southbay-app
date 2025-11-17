import { withBaseUrl } from '@/services/client';
import type { ApiResponse } from '@/types/api';
import type { LoginTokensResponse } from '@/types/auth';
import { getRequestInstance } from '@umijs/max';

export const refreshAuthToken = (
  refreshToken: string,
): Promise<ApiResponse<LoginTokensResponse>> =>
  getRequestInstance()
    .post<ApiResponse<LoginTokensResponse>>(
      withBaseUrl('/auth/refresh'),
      { refresh_token: refreshToken },
      { skipAuthRefresh: true },
    )
    .then((response) => response.data);

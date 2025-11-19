import { withBaseUrl } from '@/services/client';
import type { ApiResponse } from '@/types/api';
import type { LoginRequest, LoginTokensResponse } from '@/types/auth';
import { request, type AxiosError } from '@umijs/max';

export const login = async (
  body: LoginRequest,
): Promise<ApiResponse<LoginTokensResponse>> => {
  try {
    return await request<ApiResponse<LoginTokensResponse>>(
      withBaseUrl('/auth/login'),
      {
        method: 'POST',
        data: body,
      },
    );
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<LoginTokensResponse>>;
    const responseData = axiosError.response?.data;
    if (responseData) {
      return responseData;
    }
    throw error;
  }
};

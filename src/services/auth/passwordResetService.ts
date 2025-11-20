import { withBaseUrl } from '@/services/client';
import type { ApiResponse } from '@/types/api';
import type { PasswordResetRequest } from '@/types/auth';
import { request, type AxiosError } from '@umijs/max';

export const initiatePasswordReset = async (
  body: PasswordResetRequest,
): Promise<ApiResponse<null>> => {
  try {
    return await request<ApiResponse<null>>(
      withBaseUrl('/auth/initiate/password/reset'),
      {
        method: 'POST',
        data: body,
      },
    );
  } catch (error) {
    const axiosError = error as AxiosError<ApiResponse<null>>;
    const responseData = axiosError.response?.data;
    if (responseData) {
      return responseData;
    }
    throw error;
  }
};

import { withBaseUrl } from '@/services/client';
import type { ApiResponse } from '@/types/api';
import type {
  PasswordResetRequest,
  PasswordResetSubmitRequest,
  PasswordResetVerificationResponse,
} from '@/types/auth';
import { request, type AxiosError } from '@umijs/max';

const handleRequestError = <T>(error: unknown): T => {
  const axiosError = error as AxiosError<T>;
  const responseData = axiosError.response?.data;
  if (responseData) {
    return responseData;
  }
  throw error;
};

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
    return handleRequestError<ApiResponse<null>>(error);
  }
};

export const verifyPasswordResetToken = async (
  resetToken: string,
): Promise<ApiResponse<PasswordResetVerificationResponse>> => {
  try {
    return await request<ApiResponse<PasswordResetVerificationResponse>>(
      withBaseUrl('/auth/password/reset/verify-token'),
      {
        method: 'POST',
        data: {
          reset_token: resetToken,
        },
      },
    );
  } catch (error) {
    return handleRequestError<ApiResponse<PasswordResetVerificationResponse>>(
      error,
    );
  }
};

export const resetPassword = async (
  body: PasswordResetSubmitRequest,
): Promise<ApiResponse<null>> => {
  try {
    return await request<ApiResponse<null>>(
      withBaseUrl('/auth/password/reset'),
      {
        method: 'PATCH',
        data: body,
      },
    );
  } catch (error) {
    return handleRequestError<ApiResponse<null>>(error);
  }
};

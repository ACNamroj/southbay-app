import { apiRequest } from '@/services/client';
import type { ApiMessageResponse } from '@/types/api';
import type {
  PasswordResetRequest,
  PasswordResetSubmitRequest,
  PasswordResetVerificationResponse,
} from '@/types/auth';

export const initiatePasswordReset = async (
  body: PasswordResetRequest,
): Promise<ApiMessageResponse> => {
  return apiRequest<ApiMessageResponse>('/auth/initiate/password/reset', {
    method: 'POST',
    data: body,
    retry: { retries: 0 },
  });
};

export const verifyPasswordResetToken = async (
  resetToken: string,
): Promise<PasswordResetVerificationResponse> => {
  return apiRequest<PasswordResetVerificationResponse>(
    '/auth/password/reset/verify-token',
    {
      method: 'POST',
      data: {
        reset_token: resetToken,
      },
      retry: { retries: 0 },
    },
  );
};

export const resetPassword = async (
  body: PasswordResetSubmitRequest,
): Promise<ApiMessageResponse> => {
  return apiRequest<ApiMessageResponse>('/auth/password/reset', {
    method: 'PATCH',
    data: body,
    retry: { retries: 0 },
  });
};

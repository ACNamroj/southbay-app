import { API_ENDPOINTS } from '@/constants';
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
  return apiRequest<ApiMessageResponse>(
    API_ENDPOINTS.AUTH.INITIATE_PASSWORD_RESET,
    {
      method: 'POST',
      data: body,
      retry: { retries: 0 },
    },
  );
};

export const verifyPasswordResetToken = async (
  resetToken: string,
): Promise<PasswordResetVerificationResponse> => {
  return apiRequest<PasswordResetVerificationResponse>(
    API_ENDPOINTS.AUTH.VERIFY_PASSWORD_RESET_TOKEN,
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
  return apiRequest<ApiMessageResponse>(API_ENDPOINTS.AUTH.PASSWORD_RESET, {
    method: 'PATCH',
    data: body,
    retry: { retries: 0 },
  });
};

import { withBaseUrl } from '@/services/client';
import type { ApiMessageResponse } from '@/types/api';
import type {
  PasswordResetRequest,
  PasswordResetSubmitRequest,
  PasswordResetVerificationResponse,
} from '@/types/auth';
import { normalizeApiError } from '@/utils/apiError';
import { request } from '@umijs/max';

export const initiatePasswordReset = async (
  body: PasswordResetRequest,
): Promise<ApiMessageResponse> => {
  try {
    return await request<ApiMessageResponse>(
      withBaseUrl('/auth/initiate/password/reset'),
      {
        method: 'POST',
        data: body,
      },
    );
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const verifyPasswordResetToken = async (
  resetToken: string,
): Promise<PasswordResetVerificationResponse> => {
  try {
    return await request<PasswordResetVerificationResponse>(
      withBaseUrl('/auth/password/reset/verify-token'),
      {
        method: 'POST',
        data: {
          reset_token: resetToken,
        },
      },
    );
  } catch (error) {
    throw normalizeApiError(error);
  }
};

export const resetPassword = async (
  body: PasswordResetSubmitRequest,
): Promise<ApiMessageResponse> => {
  try {
    return await request<ApiMessageResponse>(
      withBaseUrl('/auth/password/reset'),
      {
        method: 'PATCH',
        data: body,
      },
    );
  } catch (error) {
    throw normalizeApiError(error);
  }
};

import { withBaseUrl } from '@/services/client';
import type { ApiMessageResponse } from '@/types/api';
import { normalizeApiError } from '@/utils/apiError';
import { request } from '@umijs/max';

type UpdatePasswordPayload = {
  current_password: string;
  password: string;
};

export const updateCurrentUserPassword = async (
  body: UpdatePasswordPayload,
): Promise<ApiMessageResponse> => {
  try {
    return await request<ApiMessageResponse>(
      withBaseUrl('/v1/users/me/password'),
      {
        method: 'PATCH',
        data: body,
      },
    );
  } catch (error) {
    throw normalizeApiError(error);
  }
};

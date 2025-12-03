import { apiRequest } from '@/services/client';
import type { ApiMessageResponse } from '@/types/api';

type UpdatePasswordPayload = {
  current_password: string;
  password: string;
};

export const updateCurrentUserPassword = async (
  body: UpdatePasswordPayload,
): Promise<ApiMessageResponse> => {
  return apiRequest<ApiMessageResponse>('/v1/users/me/password', {
    method: 'PATCH',
    data: body,
    retry: { retries: 0 },
  });
};

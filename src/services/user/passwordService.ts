import { withBaseUrl } from '@/services/client';
import type { ApiResponse } from '@/types/api';
import { request, type AxiosError } from '@umijs/max';

type UpdatePasswordPayload = {
  current_password: string;
  password: string;
};

const handleRequestError = (error: unknown): ApiResponse<null> => {
  const axiosError = error as AxiosError<ApiResponse<null>>;
  if (axiosError.response?.data) {
    return axiosError.response.data;
  }
  throw error;
};

export const updateCurrentUserPassword = async (
  body: UpdatePasswordPayload,
): Promise<ApiResponse<null>> => {
  try {
    return await request<ApiResponse<null>>(
      withBaseUrl('/v1/users/me/password'),
      {
        method: 'PATCH',
        data: body,
      },
    );
  } catch (error) {
    return handleRequestError(error);
  }
};

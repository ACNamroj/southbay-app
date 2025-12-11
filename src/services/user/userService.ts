import { API_ENDPOINTS, DEFAULT_PAGE_SIZE } from '@/constants';
import { apiRequest } from '@/services/client';
import type { ApiListResponse } from '@/types/api';
import type {
  User,
  UserListParams,
  UserListResult,
  UserPayload,
  UserRole,
} from '@/types/user';

export const getCurrentUser = async (): Promise<User> => {
  return apiRequest<User>(API_ENDPOINTS.USERS.ME, {
    retry: { retries: 1 },
  });
};

type UserListApiResponse = User[] | ApiListResponse<User>;

const normalizeRoleParam = (role?: UserRole | UserRole[]) => {
  if (!role) return undefined;
  return Array.isArray(role) ? role.join(',') : role;
};

const normalizeUser = (user: User, index: number): User => {
  const apiId =
    (user as any).id ?? (user as any).user_id ?? (user as any).userId;
  const parsedId =
    typeof apiId === 'string' ? Number.parseInt(apiId, 10) : apiId;

  return {
    ...user,
    id: Number.isFinite(parsedId) ? (parsedId as number) : index + 1,
    roles: Array.isArray((user as any).roles) ? (user as any).roles : [],
  };
};

const mapUserListResponse = (
  response: UserListApiResponse,
  params: UserListParams,
): UserListResult => {
  if (Array.isArray(response)) {
    const fallbackSize = (params.size ?? response.length) || DEFAULT_PAGE_SIZE;
    return {
      data: response.map((item, idx) => normalizeUser(item, idx)),
      total: response.length,
      page: params.page ?? 1,
      page_size: fallbackSize,
      size: fallbackSize,
    };
  }

  const list = Array.isArray(response.data) ? response.data : [];
  const inputPageZeroBased =
    params.page !== undefined
      ? Math.max(params.page - 1, 0)
      : params.pageNumber !== undefined
      ? Math.max(params.pageNumber - 1, 0)
      : 0;
  const pageZeroBased = response.page ?? inputPageZeroBased;
  const size =
    (response.size ?? params.size ?? list.length) || DEFAULT_PAGE_SIZE;

  return {
    data: list.map((item, idx) => normalizeUser(item, idx)),
    total: response.total ?? list.length,
    page: pageZeroBased + 1,
    page_size: size,
    total_pages: response.total_pages,
    last: response.last,
  };
};

export const fetchUsers = async (
  params: UserListParams = {},
): Promise<UserListResult> => {
  const pageZeroBased =
    params.page !== undefined
      ? Math.max(params.page - 1, 0)
      : params.pageNumber !== undefined
      ? Math.max(params.pageNumber - 1, 0)
      : 0;

  const emailParam = params.email;

  const requestParams: Record<string, unknown> = {
    page: pageZeroBased,
    size: params.size,
    roles: normalizeRoleParam(params.roles),
  };

  if (emailParam && emailParam.trim() !== '') {
    requestParams.email = emailParam.trim();
  }

  const response = await apiRequest<UserListApiResponse>(
    API_ENDPOINTS.USERS.LIST,
    {
      params: requestParams,
      retry: { retries: 1 },
    },
  );

  return mapUserListResponse(response, params);
};

export const createUser = async (payload: UserPayload): Promise<User> => {
  return apiRequest<User>(API_ENDPOINTS.USERS.CREATE, {
    method: 'POST',
    data: payload,
    retry: { retries: 0 },
  });
};

export const updateUser = async (
  id: number,
  payload: UserPayload,
): Promise<User> => {
  return apiRequest<User>(API_ENDPOINTS.USERS.UPDATE, {
    method: 'PUT',
    data: { id, ...payload },
    retry: { retries: 0 },
  });
};

export const deleteUser = async (id: number): Promise<void> => {
  return apiRequest<void>(API_ENDPOINTS.USERS.DELETE(id), {
    method: 'DELETE',
    retry: { retries: 0 },
  });
};

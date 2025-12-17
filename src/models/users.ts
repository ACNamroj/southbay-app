import { DEFAULT_PAGE_SIZE } from '@/constants';
import {
  createUser,
  deleteUser,
  fetchUsers,
  updateUser,
} from '@/services/user/userService';
import type {
  User,
  UserListParams,
  UserListResult,
  UserPayload,
} from '@/types/user';
import { useCallback, useRef, useState } from 'react';

const useUsersModel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
  });
  const lastQueryRef = useRef<UserListParams>({});

  const loadUsers = useCallback(
    async (params: UserListParams = {}): Promise<UserListResult> => {
      setLoading(true);
      try {
        const query: UserListParams = {
          page: params.page ?? pagination.current,
          size:
            params.size ??
            params.page_size ??
            params.pageSize ??
            pagination.pageSize,
          email: params.email ?? lastQueryRef.current.email,
          roles: params.roles ?? lastQueryRef.current.roles,
        };

        const result = await fetchUsers(query);
        setUsers(result.data);
        setPagination({
          current: result.page,
          pageSize:
            result.page_size ??
            result.size ??
            pagination.pageSize ??
            DEFAULT_PAGE_SIZE,
          total: result.total,
        });
        lastQueryRef.current = query;
        return result;
      } finally {
        setLoading(false);
      }
    },
    [pagination.current, pagination.pageSize],
  );

  const create = useCallback(async (payload: UserPayload) => {
    return createUser(payload);
  }, []);

  const update = useCallback(async (id: number, payload: UserPayload) => {
    return updateUser(id, payload);
  }, []);

  const remove = useCallback(async (id: number) => {
    return deleteUser(id);
  }, []);

  return {
    users,
    loading,
    pagination,
    loadUsers,
    create,
    update,
    remove,
  };
};

export default useUsersModel;

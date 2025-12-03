import {
  createStore,
  deleteStore,
  fetchStores,
  updateStore,
} from '@/services/stores/storeService';
import type {
  Store,
  StoreListParams,
  StoreListResult,
  StorePayload,
} from '@/types/store';
import { useCallback, useRef, useState } from 'react';

const DEFAULT_PAGE_SIZE = 10;

const useStoresModel = () => {
  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
  });
  const lastQueryRef = useRef<StoreListParams>({});

  const loadStores = useCallback(
    async (params: StoreListParams = {}): Promise<StoreListResult> => {
      setLoading(true);
      try {
        const query: StoreListParams = {
          page: params.page ?? pagination.current,
          page_size: params.page_size ?? pagination.pageSize,
          name: params.name ?? lastQueryRef.current.name,
          search: params.search ?? lastQueryRef.current.search,
          status: params.status ?? lastQueryRef.current.status,
        };
        const result = await fetchStores(query);

        setStores(result.data);
        setPagination({
          current: result.page,
          pageSize: result.page_size || DEFAULT_PAGE_SIZE,
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

  const create = useCallback(async (payload: StorePayload) => {
    return createStore(payload);
  }, []);

  const update = useCallback(async (id: number, payload: StorePayload) => {
    return updateStore(id, payload);
  }, []);

  const remove = useCallback(async (id: number) => {
    return deleteStore(id);
  }, []);

  return {
    stores,
    loading,
    pagination,
    loadStores,
    create,
    update,
    remove,
  };
};

export default useStoresModel;

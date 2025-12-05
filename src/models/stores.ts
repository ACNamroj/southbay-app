import { DEFAULT_PAGE_SIZE } from '@/constants';
import {
  createStore,
  deleteStore,
  downloadStores,
  fetchStores,
  updateStore,
  uploadStoresFile,
} from '@/services/stores/storeService';
import type {
  Store,
  StoreListParams,
  StoreListResult,
  StorePayload,
} from '@/types/store';
import { useCallback, useRef, useState } from 'react';

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
          size:
            params.size ??
            params.page_size ??
            params.pageSize ??
            pagination.pageSize,
          name: params.name ?? lastQueryRef.current.name,
          search: params.search ?? lastQueryRef.current.search,
          status: params.status ?? lastQueryRef.current.status,
        };
        const result = await fetchStores(query);

        setStores(result.data);
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

  const create = useCallback(async (payload: StorePayload) => {
    return createStore(payload);
  }, []);

  const update = useCallback(async (id: number, payload: StorePayload) => {
    return updateStore(id, payload);
  }, []);

  const remove = useCallback(async (id: number) => {
    return deleteStore(id);
  }, []);

  const exportStores = useCallback(async () => {
    return downloadStores();
  }, []);

  const upload = useCallback(async (file: File) => {
    return uploadStoresFile(file);
  }, []);

  return {
    stores,
    loading,
    pagination,
    loadStores,
    create,
    update,
    remove,
    exportStores,
    upload,
  };
};

export default useStoresModel;

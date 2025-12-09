import { DEFAULT_PAGE_SIZE } from '@/constants';
import {
  createSegmentation,
  deleteSegmentation,
  fetchSegmentations,
  updateSegmentation,
} from '@/services/segmentation/segmentationService';
import type {
  SegmentationListParams,
  SegmentationListResult,
  SegmentationPayload,
  UserAccountType,
} from '@/types/segmentation';
import { useCallback, useRef, useState } from 'react';

const useSegmentationModel = () => {
  const [items, setItems] = useState<UserAccountType[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
  });
  const lastQueryRef = useRef<SegmentationListParams>({});

  const loadSegmentations = useCallback(
    async (
      params: SegmentationListParams = {},
    ): Promise<SegmentationListResult> => {
      setLoading(true);
      try {
        const query: SegmentationListParams = {
          page: params.page ?? pagination.current,
          size:
            params.size ??
            (params as any).page_size ??
            (params as any).pageSize ??
            pagination.pageSize,
          name: params.name ?? lastQueryRef.current.name,
          search: params.search ?? lastQueryRef.current.search,
          status: params.status ?? lastQueryRef.current.status,
        };
        const result = await fetchSegmentations(query);

        setItems(result.data);
        setPagination({
          current: result.page,
          pageSize:
            result.page_size ??
            (result as any).size ??
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

  const create = useCallback(async (payload: SegmentationPayload) => {
    return createSegmentation(payload);
  }, []);

  const update = useCallback(
    async (id: number, payload: SegmentationPayload) => {
      return updateSegmentation(id, payload);
    },
    [],
  );

  const remove = useCallback(async (id: number) => {
    return deleteSegmentation(id);
  }, []);

  return {
    items,
    loading,
    pagination,
    loadSegmentations,
    create,
    update,
    remove,
  };
};

export default useSegmentationModel;

import { DEFAULT_PAGE_SIZE } from '@/constants';
import {
  createBeneficiary,
  deleteBeneficiary,
  downloadBeneficiaries,
  fetchBeneficiaries,
  updateBeneficiary,
  uploadBeneficiariesFile,
} from '@/services/beneficiary/beneficiaryService';
import type {
  Beneficiary,
  BeneficiaryCreateRequest,
  BeneficiaryListParams,
  BeneficiaryListResult,
  BeneficiaryUpdateRequest,
} from '@/types/beneficiary';
import { useCallback, useRef, useState } from 'react';

const useBeneficiariesModel = () => {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: DEFAULT_PAGE_SIZE,
    total: 0,
  });
  const lastQueryRef = useRef<BeneficiaryListParams>({});

  const loadBeneficiaries = useCallback(
    async (
      params: BeneficiaryListParams = {},
    ): Promise<BeneficiaryListResult> => {
      setLoading(true);
      try {
        // Normalize search/text param so the service always receives `text`
        const text =
          params.text ??
          // keep backward compatibility if some callers still pass `search`
          (params as any).search ??
          (lastQueryRef.current && 'text' in lastQueryRef.current
            ? lastQueryRef.current.text
            : undefined) ??
          ((lastQueryRef.current as any)?.search as string | undefined);
        const query: BeneficiaryListParams = {
          page: params.page ?? pagination.current,
          size:
            params.size ??
            params.page_size ??
            (params as any).pageSize ??
            pagination.pageSize,
          text,
          status: params.status ?? lastQueryRef.current.status,
        };
        const result = await fetchBeneficiaries(query);
        setBeneficiaries(result.data);
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

  const create = useCallback(async (payload: BeneficiaryCreateRequest) => {
    return createBeneficiary(payload);
  }, []);

  const update = useCallback(async (payload: BeneficiaryUpdateRequest) => {
    return updateBeneficiary(payload);
  }, []);

  const remove = useCallback(async (id: number) => {
    return deleteBeneficiary(id);
  }, []);

  const exportBeneficiaries = useCallback(async () => {
    return downloadBeneficiaries();
  }, []);

  const upload = useCallback(async (file: File) => {
    return uploadBeneficiariesFile(file);
  }, []);

  return {
    beneficiaries,
    loading,
    pagination,
    loadBeneficiaries,
    create,
    update,
    remove,
    exportBeneficiaries,
    upload,
  };
};

export default useBeneficiariesModel;

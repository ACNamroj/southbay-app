import { ENTITY_STATUS } from '@/constants';

export type Store = {
  id: number;
  external_id: string;
  name: string;
  status: ENTITY_STATUS;
  created_at?: string;
  updated_at?: string;
};

export type StoreListParams = {
  page?: number;
  pageNumber?: number;
  size?: number;
  pageSize?: number;
  page_size?: number;
  name?: string;
  status?: ENTITY_STATUS | ENTITY_STATUS[];
};

export type StoreListResult = {
  data: Store[];
  total: number;
  page: number;
  page_size: number;
  size?: number;
  total_pages?: number;
  last?: boolean;
};

export type StorePayload = {
  external_id: string;
  name: string;
  status?: ENTITY_STATUS;
};

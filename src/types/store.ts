export type StoreStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED';

export type Store = {
  id: number;
  external_id: string;
  name: string;
  status: StoreStatus;
  created_at?: string;
  updated_at?: string;
};

export type StoreListParams = {
  page?: number;
  size?: number;
  name?: string;
  status?: StoreStatus | StoreStatus[];
};

export type StoreListResult = {
  data: Store[];
  total: number;
  page: number;
  page_size: number;
  total_pages?: number;
  last?: boolean;
};

export type StorePayload = {
  external_id: string;
  name: string;
  status?: StoreStatus;
};

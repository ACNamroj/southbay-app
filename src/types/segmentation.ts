import type { EntityStatus } from '@/constants';

export type UserAccountType = {
  id: number;
  name: string;
  label: string;
  discount_percentage?: number;
  status: EntityStatus;
  created_at?: string;
  updated_at?: string;
};

export type SegmentationListParams = {
  page?: number;
  pageNumber?: number;
  size?: number;
  pageSize?: number;
  page_size?: number;
  name?: string;
  search?: string;
  status?: EntityStatus | EntityStatus[];
};

export type SegmentationListResult = {
  data: UserAccountType[];
  total: number;
  page: number;
  page_size: number;
  size?: number;
  total_pages?: number;
  last?: boolean;
};

export type SegmentationPayload = {
  name: string;
  label: string;
  discount_percentage?: number;
  status?: EntityStatus;
};

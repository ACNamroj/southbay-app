import type { ENTITY_STATUS } from '@/constants';

export type Segmentation = {
  id?: number;
  name: string;
  label: string;
  discount_percentage_cap?: number;
  allocated_balance?: number | null;
  status: ENTITY_STATUS;
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
  status?: ENTITY_STATUS | ENTITY_STATUS[];
};

export type SegmentationListResult = {
  data: Segmentation[];
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
  discount_percentage_cap?: number;
  allocated_balance?: number | null;
  status?: ENTITY_STATUS;
};

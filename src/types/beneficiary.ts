import type { ENTITY_STATUS } from '@/constants';

export interface BeneficiarySegmentation {
  name: string;
  label: string;
}

export interface BeneficiaryWallet {
  status: ENTITY_STATUS;
  allocated_balance: string | number | null;
  expires_at?: string;
}

export interface BeneficiaryProfile {
  first_name: string;
  last_name: string;
  document_number?: string | null;
  phone_number?: string | null;
}

export interface Beneficiary {
  email: string;
  profile: BeneficiaryProfile;
  segmentation: BeneficiarySegmentation;
  wallet: BeneficiaryWallet;
}

export type BeneficiaryCreateRequest = {
  id: number;
  email: string;
  profile: {
    first_name: string;
    last_name: string;
    document_number: string;
    phone_number?: string;
  };
  segmentation: string;
  wallet: {
    status: ENTITY_STATUS;
  };
  allocated_amount: number;
  expires_at?: string;
};

export type BeneficiaryUpdateRequest = {
  id: number;
  email: string;
  profile: {
    first_name: string;
    last_name: string;
    document_number: string;
    phone_number?: string;
  };
  segmentation: string;
  wallet: {
    status?: ENTITY_STATUS;
  };
  allocated_amount: number;
  expires_at?: string;
};

export interface BeneficiaryListParams {
  page?: number;
  size?: number;
  pageNumber?: number;
  page_size?: number;
  text?: string;
  status?: ENTITY_STATUS;
  segmentation?: string;
}

export interface BeneficiaryListResult {
  data: Beneficiary[];
  total: number;
  page: number;
  page_size?: number;
  size?: number;
  total_pages?: number;
  last?: boolean;
}

export type UserProfile = {
  first_name: string;
  last_name: string;
  document_number: string;
  phone_number?: string | null;
  photo?: string | null;
  thumbnail?: string | null;
};

export type UserRole =
  | 'ADMIN'
  | 'TECH'
  | 'MARKETING'
  | 'USER'
  | 'INTEGRATION'
  | string;

export type User = {
  id?: number;
  email: string;
  uuid: string;
  segmentation?: string | null;
  roles?: UserRole[];
  profile?: UserProfile | null;
  created_at?: string;
  updated_at?: string;
};

export type UserListParams = {
  page?: number;
  pageNumber?: number;
  size?: number;
  pageSize?: number;
  page_size?: number;
  email?: string;
  name?: string;
  roles?: UserRole | UserRole[];
};

export type UserListResult = {
  data: User[];
  total: number;
  page: number;
  page_size: number;
  size?: number;
  total_pages?: number;
  last?: boolean;
};

export type UserPayload = {
  email: string;
  roles: UserRole[];
  segmentation?: string | null;
  profile: UserProfile;
};

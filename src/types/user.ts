export type UserProfile = {
  first_name: string;
  last_name: string;
  document_number: string;
  phone_number?: string | null;
  photo?: string | null;
  thumbnail?: string | null;
};

export type User = {
  email: string;
  uuid: string;
  profile?: UserProfile | null;
  account_type: string;
};

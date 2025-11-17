export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginTokensResponse = {
  token: string;
  refresh_token: string;
  expires_at: string;
  token_type: string;
};

export type StoredAuthTokens = {
  token: string;
  refreshToken: string;
  expiresAt: string;
  tokenType: string;
};

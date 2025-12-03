export type ApiErrorResponse = {
  message?: string | null;
  messages?: string[] | null;
  statusCode?: number | null;
  code?: string | null;
};

export type ApiMessageResponse = {
  message?: string | null;
};

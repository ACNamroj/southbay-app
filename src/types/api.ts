/**
 * Base API types
 *
 * Standard types for API requests and responses used throughout the application.
 */

/**
 * Standard API error response structure
 */
export type ApiErrorResponse = {
  message?: string | null;
  messages?: string[] | null;
  statusCode?: number | null;
  code?: string | null;
};

/**
 * Standard API success message response
 */
export type ApiMessageResponse = {
  message?: string | null;
};

/**
 * Generic API response wrapper
 *
 * Use this for API responses that return a single data object
 */
export type ApiResponse<T> = {
  data: T;
  message?: string;
};

/**
 * Paginated API response wrapper
 *
 * Use this for API responses that return paginated lists
 */
export type ApiListResponse<T> = {
  data: T[];
  total: number;
  page: number;
  page_size: number;
  size?: number;
  total_pages?: number;
  last?: boolean;
};

/**
 * API request options
 */
export type ApiRequestOptions = {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
};

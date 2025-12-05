/**
 * Base API types
 *
 * Standard types for API requests and responses used throughout the application.
 * These types provide consistency across all API interactions.
 *
 * @module types/api
 */

/**
 * Standard API error response structure
 *
 * Used for error responses from the API. Supports both single message
 * and multiple messages formats.
 *
 * @example
 * ```typescript
 * const error: ApiErrorResponse = {
 *   message: 'Validation failed',
 *   statusCode: 400
 * };
 * ```
 */
export type ApiErrorResponse = {
  message?: string | null;
  messages?: string[] | null;
  statusCode?: number | null;
  code?: string | null;
};

/**
 * Standard API success message response
 *
 * Used for simple success responses that only contain a message.
 *
 * @example
 * ```typescript
 * const response: ApiMessageResponse = {
 *   message: 'Operation completed successfully'
 * };
 * ```
 */
export type ApiMessageResponse = {
  message?: string | null;
};

/**
 * Generic API response wrapper
 *
 * Use this for API responses that return a single data object.
 * This provides a consistent structure for all single-item responses.
 *
 * @template T - The type of the data being returned
 *
 * @example
 * ```typescript
 * const userResponse: ApiResponse<User> = {
 *   data: { id: 1, name: 'John' },
 *   message: 'User retrieved successfully'
 * };
 * ```
 */
export type ApiResponse<T> = {
  data: T;
  message?: string;
};

/**
 * Paginated API response wrapper
 *
 * Use this for API responses that return paginated lists.
 * This standardizes pagination across all list endpoints.
 *
 * @template T - The type of items in the list
 *
 * @example
 * ```typescript
 * const storesResponse: ApiListResponse<Store> = {
 *   data: [{ id: 1, name: 'Store 1' }],
 *   total: 100,
 *   page: 1,
 *   page_size: 10,
 *   total_pages: 10,
 *   last: false
 * };
 * ```
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
 * Standard API request options
 *
 * Base options for API requests. Note: The actual request options
 * used in `apiRequest` extend this with additional properties like
 * retry configuration and error handling options.
 *
 * @see {@link src/services/client.ts} for the full ApiRequestOptions type
 *
 * @example
 * ```typescript
 * const options: ApiRequestOptions = {
 *   params: { page: 1, size: 10 },
 *   headers: { 'Custom-Header': 'value' },
 *   timeout: 30000
 * };
 * ```
 */
export type ApiRequestOptions = {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
};

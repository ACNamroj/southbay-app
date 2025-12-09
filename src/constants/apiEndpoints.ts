/**
 * Centralized API endpoint constants
 *
 * This file contains all API endpoints used throughout the application.
 * Using constants prevents typos and makes refactoring easier.
 */

export const API_ENDPOINTS = {
  // Authentication endpoints
  AUTH: {
    LOGIN: '/auth/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    INITIATE_PASSWORD_RESET: '/auth/initiate/password/reset',
    VERIFY_PASSWORD_RESET_TOKEN: '/auth/password/reset/verify-token',
    PASSWORD_RESET: '/auth/password/reset',
  },

  // User endpoints
  USERS: {
    ME: '/v1/users/me',
    LIST: '/v1/users',
    CREATE: '/v1/users',
    UPDATE: (id: number) => `/v1/users/${id}`,
    DELETE: (id: number) => `/v1/users/${id}`,
    PASSWORD: {
      CHANGE: '/v1/users/password',
      RESET: '/v1/users/password/reset',
    },
  },

  // Store endpoints
  STORES: {
    LIST: '/v1/stores',
    CREATE: '/v1/stores',
    UPDATE: '/v1/stores',
    DELETE: (id: number) => `/v1/stores/${id}`,
    EXPORT: '/v1/stores/export',
    UPLOAD: '/v1/stores/upload',
  },

  // People endpoints
  PEOPLE: {
    LIST: '/v1/people',
    CREATE: '/v1/people',
    UPDATE: (id: number) => `/v1/people/${id}`,
    DELETE: (id: number) => `/v1/people/${id}`,
  },

  // Segmentation endpoints
  SEGMENTATIONS: {
    LIST: '/v1/segmentations',
    CREATE: '/v1/segmentations',
    UPDATE: (id: number) => `/v1/segmentations/${id}`,
    DELETE: (id: number) => `/v1/segmentations/${id}`,
  },
} as const;

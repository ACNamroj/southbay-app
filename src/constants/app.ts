/**
 * Application-wide constants
 */

export const APP_NAME = 'Southbay';

export const DEFAULT_NAME = 'Southbay';

// API Configuration
export const API_TIMEOUT = 30000; // 30 seconds

// Retry Configuration
export const DEFAULT_RETRY_ATTEMPTS = 1;
export const DEFAULT_RETRY_DELAY_MS = 300;

// File Upload Configuration
export const MAX_FILE_SIZE_MB = 10;
export const ALLOWED_FILE_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
] as const;

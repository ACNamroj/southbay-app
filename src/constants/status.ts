/**
 * Status constants
 */

export const STORE_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
} as const;

export type StoreStatus = (typeof STORE_STATUS)[keyof typeof STORE_STATUS];

export const STORE_STATUS_LABELS: Record<StoreStatus, string> = {
  ACTIVE: 'Activa',
  INACTIVE: 'Inactiva',
  DELETED: 'Eliminada',
};

export const STORE_STATUS_COLORS: Record<StoreStatus, string> = {
  ACTIVE: 'green',
  INACTIVE: 'orange',
  DELETED: 'red',
};

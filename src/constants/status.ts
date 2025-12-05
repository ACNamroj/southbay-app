/**
 * Status constants
 */

export const STORE_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
} as const;

export const STORE_STATUS_LABELS: Record<
  (typeof STORE_STATUS)[keyof typeof STORE_STATUS],
  string
> = {
  ACTIVE: 'Activa',
  INACTIVE: 'Inactiva',
  DELETED: 'Eliminada',
};

export const STORE_STATUS_COLORS: Record<
  (typeof STORE_STATUS)[keyof typeof STORE_STATUS],
  string
> = {
  ACTIVE: 'green',
  INACTIVE: 'orange',
  DELETED: 'red',
};

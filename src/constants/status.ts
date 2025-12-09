/**
 * Status constants
 */

export const STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
} as const;

export type ENTITY_STATUS = (typeof STATUS)[keyof typeof STATUS];

export const ENTITY_STATUS_LABELS: Record<ENTITY_STATUS, string> = {
  ACTIVE: 'Activa',
  INACTIVE: 'Inactiva',
  DELETED: 'Eliminada',
};

export const ENTITY_STATUS_COLORS: Record<ENTITY_STATUS, string> = {
  ACTIVE: 'green',
  INACTIVE: 'orange',
  DELETED: 'red',
};

/**
 * Status constants
 */

export const ENTITY_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  DELETED: 'DELETED',
} as const;

export type EntityStatus = (typeof ENTITY_STATUS)[keyof typeof ENTITY_STATUS];

export const ENTITY_STATUS_LABELS: Record<EntityStatus, string> = {
  ACTIVE: 'Activa',
  INACTIVE: 'Inactiva',
  DELETED: 'Eliminada',
};

export const STORE_STATUS_COLORS: Record<EntityStatus, string> = {
  ACTIVE: 'green',
  INACTIVE: 'orange',
  DELETED: 'red',
};

import type { DisplayField, IdeaStatus } from '../types/graph'

export const STATUS_COLOR_MAP: Record<IdeaStatus, string> = {
  open: '#f8fafc',
  doing: '#2563eb',
  wait: '#facc15',
  hold: '#7c3aed',
  finish: '#16a34a',
  fail: '#dc2626',
  cancel: '#6b7280',
}

export const STATUS_LABEL_MAP: Record<IdeaStatus, string> = {
  open: 'Open',
  doing: 'Doing',
  wait: 'Wait',
  hold: 'Hold',
  finish: 'Finish',
  fail: 'Fail',
  cancel: 'Cancel',
}

export const ALLOWED_STATUSES = Object.keys(STATUS_COLOR_MAP) as IdeaStatus[]

export const DEFAULT_DISPLAY_FIELDS: Record<DisplayField, boolean> = {
  label: true,
  title: true,
  subtitle: true,
  targetDate: true,
  conclusion: true,
  taskList: true,
}

export function isIdeaStatus(value: string): value is IdeaStatus {
  return ALLOWED_STATUSES.includes(value as IdeaStatus)
}

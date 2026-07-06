export const INCIDENT_TYPES = [
  'safeguarding',
  'accident',
  'near_miss',
  'transport',
  'missing_child',
  'data_breach',
  'other',
] as const;

export type IncidentType = (typeof INCIDENT_TYPES)[number];

export const INCIDENT_TYPE_LABELS: Record<IncidentType, string> = {
  safeguarding: 'Safeguarding',
  accident: 'Accident or injury',
  near_miss: 'Near miss',
  transport: 'Transport',
  missing_child: 'Missing child',
  data_breach: 'Data breach',
  other: 'Other',
};

export const INCIDENT_SEVERITIES = ['low', 'medium', 'high', 'critical'] as const;

export type IncidentSeverity = (typeof INCIDENT_SEVERITIES)[number];

export const INCIDENT_SEVERITY_LABELS: Record<IncidentSeverity, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
  critical: 'Critical',
};

export const INCIDENT_STATUSES = ['open', 'reviewing', 'closed'] as const;

export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export const INCIDENT_STATUS_LABELS: Record<IncidentStatus, string> = {
  open: 'Open',
  reviewing: 'Under review',
  closed: 'Closed',
};

export function formatIncidentType(type: string): string {
  return INCIDENT_TYPE_LABELS[type as IncidentType] ?? type.replace(/_/g, ' ');
}

export function formatIncidentSeverity(severity: string): string {
  return INCIDENT_SEVERITY_LABELS[severity as IncidentSeverity] ?? severity;
}

export function formatIncidentStatus(status: string): string {
  return INCIDENT_STATUS_LABELS[status as IncidentStatus] ?? status;
}

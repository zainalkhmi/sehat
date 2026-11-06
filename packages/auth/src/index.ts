import type { UserRole } from '@future-health/domain';

export type Permission =
  | 'patient:read_self'
  | 'patient:update_self'
  | 'patient:submit_questionnaire'
  | 'patient:sync_device'
  | 'patient:manage_consent'
  | 'clinician:read_assigned_patient'
  | 'clinician:write_clinical_note'
  | 'clinician:review_risk'
  | 'clinician:manage_appointment'
  | 'researcher:read_deidentified'
  | 'researcher:manage_study'
  | 'researcher:export_dataset'
  | 'admin:manage_users'
  | 'admin:view_audit_logs';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  patient: [
    'patient:read_self',
    'patient:update_self',
    'patient:submit_questionnaire',
    'patient:sync_device',
    'patient:manage_consent',
  ],
  doctor: [
    'clinician:read_assigned_patient',
    'clinician:write_clinical_note',
    'clinician:review_risk',
    'clinician:manage_appointment',
  ],
  researcher: [
    'researcher:read_deidentified',
    'researcher:manage_study',
    'researcher:export_dataset',
  ],
  admin: [
    'admin:manage_users',
    'admin:view_audit_logs',
    'clinician:read_assigned_patient',
    'researcher:read_deidentified',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getDefaultDashboardRoute(role: UserRole): string {
  switch (role) {
    case 'patient':
      return '/dashboard/patient';
    case 'doctor':
      return '/dashboard/doctor';
    case 'researcher':
      return '/dashboard/researcher';
    case 'admin':
      return '/dashboard/admin';
    default:
      return '/login';
  }
}

/**
 * Evaluates whether an actor can access a specific patient's identifiable clinical data
 */
export function canAccessPatientRecord(params: {
  actorRole: UserRole;
  actorId: string;
  patientId: string;
  isClinicianAssigned?: boolean;
}): boolean {
  const { actorRole, actorId, patientId, isClinicianAssigned } = params;

  // Patient can only access their own records
  if (actorRole === 'patient') {
    return actorId === patientId;
  }

  // Doctor can only access if actively assigned in patient_clinicians
  if (actorRole === 'doctor') {
    return Boolean(isClinicianAssigned);
  }

  // Admin has emergency supervisory access
  if (actorRole === 'admin') {
    return true;
  }

  // Researchers NEVER have access to identifiable patient records!
  if (actorRole === 'researcher') {
    return false;
  }

  return false;
}

/**
 * Evaluates whether an actor can export research datasets
 */
export function canExportResearchCohort(actorRole: UserRole): boolean {
  return actorRole === 'researcher' || actorRole === 'admin';
}

/**
 * Evaluates whether an actor can validate AI risk assessment
 */
export function canValidateRiskAssessment(actorRole: UserRole, isClinicianAssigned: boolean): boolean {
  return actorRole === 'doctor' && isClinicianAssigned;
}

export interface AuthSession {
  userId: string;
  email: string;
  role: UserRole;
  accessToken: string;
  expiresAt: number;
}

/**
 * Future Health - Canonical Domain Entities
 */

export type UserRole = 'patient' | 'doctor' | 'researcher' | 'admin';

export interface PersonName {
  givenName?: string;
  middleName?: string;
  familyName?: string;
  prefix?: string;
  suffix?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  role: UserRole;
  name: PersonName;
  displayName: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'unknown';
  phoneNumber?: string;
  avatarUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PatientProfile extends UserProfile {
  role: 'patient';
  mrn?: string; // Medical Record Number
  bloodType?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-';
  allergies?: string[];
  emergencyContact?: {
    name: string;
    relationship: string;
    phoneNumber: string;
  };
}

export interface DoctorProfile extends UserProfile {
  role: 'doctor';
  licenseNumber: string;
  specialty: string;
  hospitalAffiliation?: string;
  biography?: string;
}

export interface ResearcherProfile extends UserProfile {
  role: 'researcher';
  institution: string;
  department: string;
  orcidId?: string;
}

export type ObservationCategory =
  | 'vital-signs'
  | 'laboratory'
  | 'activity'
  | 'survey'
  | 'exam';

export type ObservationStatus =
  | 'registered'
  | 'preliminary'
  | 'final'
  | 'amended'
  | 'entered-in-error';

export interface VitalSignObservation {
  id: string;
  patientId: string;
  status: ObservationStatus;
  category: ObservationCategory;
  loincCode: string;
  displayName: string;
  valueNumeric?: number;
  valueString?: string;
  unit: string;
  unitCode: string;
  effectiveDateTime: string;
  source: 'healthkit' | 'health-connect' | 'ble' | 'manual' | 'vendor_api';
  deviceId?: string;
  components?: Array<{
    code: string;
    displayName: string;
    value: number;
    unit: string;
  }>;
  createdAt: string;
}

export interface ClinicalQuestionnaire {
  id: string;
  title: string;
  description: string;
  version: string;
  status: 'draft' | 'active' | 'retired';
  items: QuestionnaireItem[];
  createdAt: string;
}

export interface QuestionnaireItem {
  linkId: string;
  text: string;
  type: 'boolean' | 'decimal' | 'integer' | 'string' | 'choice' | 'open-choice';
  required?: boolean;
  options?: Array<{
    value: string;
    label: string;
    score?: number;
  }>;
}

export interface QuestionnaireResponse {
  id: string;
  questionnaireId: string;
  patientId: string;
  status: 'in-progress' | 'completed' | 'amended';
  authored: string;
  calculatedScore?: number;
  answers: Record<string, any>;
  createdAt: string;
}

export interface PatientConsent {
  id: string;
  patientId: string;
  scope: 'clinical-care' | 'research' | 'telehealth';
  status: 'active' | 'revoked' | 'expired';
  authorizedActorId?: string;
  authorizedOrganizationId?: string;
  researchProjectId?: string;
  consentedAt: string;
  expiresAt?: string;
}

export interface ClinicalAppointment {
  id: string;
  patientId: string;
  clinicianId: string;
  status: 'proposed' | 'pending' | 'booked' | 'arrived' | 'fulfilled' | 'cancelled';
  scheduledStart: string;
  scheduledEnd: string;
  reason?: string;
  telehealthUrl?: string;
  createdAt: string;
}

export interface ClinicalCondition {
  id: string;
  patientId: string;
  recorderId?: string;
  clinicalStatus: 'active' | 'recurrence' | 'relapse' | 'remission' | 'resolved';
  verificationStatus: 'unconfirmed' | 'provisional' | 'confirmed' | 'refuted';
  codeSystem: string;
  code: string;
  displayName: string;
  onsetDateTime?: string;
  recordedDate: string;
  notes?: string;
  createdAt: string;
}

export interface RiskAssessmentResult {
  id: string;
  patientId: string;
  riskCategory: string;
  riskScore: number; // 0.0 - 1.0
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  clinicalSummary: string;
  inputReferences: string[];
  modelName: string;
  modelVersion: string;
  reviewStatus: 'pending_review' | 'approved' | 'modified' | 'rejected';
  reviewedByClinicianId?: string;
  reviewedAt?: string;
  clinicianNotes?: string;
  createdAt: string;
}

export interface ResearchProject {
  id: string;
  title: string;
  protocolNumber: string;
  description: string;
  leadResearcherId: string;
  status: 'recruiting' | 'active' | 'completed' | 'suspended';
  startDate: string;
  endDate?: string;
  inclusionCriteria?: string[];
  exclusionCriteria?: string[];
  createdAt: string;
}

export interface ResearchEnrollment {
  id: string;
  projectId: string;
  participantPseudonym: string; // De-identified ID
  status: 'enrolled' | 'withdrawn' | 'completed';
  enrolledAt: string;
}

export type AgeGroupBracket = '<25' | '25-44' | '45-64' | '65-88' | '89+';

export interface DeidentifiedResearchObservation {
  projectId: string;
  participantPseudonym: string;
  ageGroup: AgeGroupBracket;
  gender: 'male' | 'female' | 'other' | 'unknown';
  loincCode: string;
  observationName: string;
  valueNumeric?: number;
  valueString?: string;
  unit: string;
  shiftedDatetime: string;
  observationSource: string;
}

export interface ResearchCohortFilter {
  projectId?: string;
  ageGroups?: AgeGroupBracket[];
  genders?: string[];
  loincCodes?: string[];
  minNumericValue?: number;
  maxNumericValue?: number;
  startDate?: string;
  endDate?: string;
}

export interface CohortStatistics {
  totalParticipants: number;
  totalObservations: number;
  genderBreakdown: Record<string, number>;
  ageGroupBreakdown: Record<AgeGroupBracket, number>;
  numericMetrics: Record<
    string,
    {
      loincCode: string;
      displayName: string;
      count: number;
      mean: number;
      stdDev: number;
      min: number;
      max: number;
      unit: string;
    }
  >;
}

export interface ResearchExportLog {
  id: string;
  researcherId: string;
  projectId: string;
  datasetFormat: 'csv' | 'json';
  recordCount: number;
  exportedAt: string;
  checksumSha256: string;
}

export * from './scoring.ts';


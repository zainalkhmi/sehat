/**
 * Future Health - HL7 FHIR Release 4 (R4 v4.0.1) TypeScript Definitions
 */

export interface FHIRCoding {
  system: string;
  code: string;
  display?: string;
  version?: string;
}

export interface FHIRCodeableConcept {
  coding: FHIRCoding[];
  text?: string;
}

export interface FHIRIdentifier {
  use?: 'usual' | 'official' | 'temp' | 'secondary' | 'old' | 'anonymous';
  system: string;
  value: string;
}

export interface FHIRHumanName {
  use?: 'usual' | 'official' | 'temp' | 'nickname' | 'anonymous' | 'old' | 'maiden';
  text?: string;
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
}

export interface FHIRContactPoint {
  system: 'phone' | 'fax' | 'email' | 'pager' | 'url' | 'sms' | 'other';
  value: string;
  use?: 'home' | 'work' | 'temp' | 'old' | 'mobile';
}

export interface FHIRPeriod {
  start?: string;
  end?: string;
}

export interface FHIRReference {
  reference?: string;
  display?: string;
  type?: string;
}

export interface FHIRExtension {
  url: string;
  valueString?: string;
  valueBoolean?: boolean;
  valueInteger?: number;
  valueDecimal?: number;
  valueDateTime?: string;
}

// -------------------------------------------------------------
// FHIR Resource: Patient
// -------------------------------------------------------------
export interface FHIRPatient {
  resourceType: 'Patient';
  id: string;
  identifier?: FHIRIdentifier[];
  active?: boolean;
  name?: FHIRHumanName[];
  telecom?: FHIRContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string; // YYYY-MM-DD
  deceasedBoolean?: boolean;
  contact?: Array<{
    relationship?: FHIRCodeableConcept[];
    name?: FHIRHumanName;
    telecom?: FHIRContactPoint[];
  }>;
  extension?: FHIRExtension[];
}

// -------------------------------------------------------------
// FHIR Resource: Practitioner
// -------------------------------------------------------------
export interface FHIRPractitioner {
  resourceType: 'Practitioner';
  id: string;
  identifier?: FHIRIdentifier[];
  active?: boolean;
  name?: FHIRHumanName[];
  telecom?: FHIRContactPoint[];
  gender?: 'male' | 'female' | 'other' | 'unknown';
  birthDate?: string;
  qualification?: Array<{
    code: FHIRCodeableConcept;
    period?: FHIRPeriod;
    issuer?: FHIRReference;
  }>;
  extension?: FHIRExtension[];
}

// -------------------------------------------------------------
// FHIR Resource: Observation
// -------------------------------------------------------------
export interface FHIRObservationComponent {
  code: FHIRCodeableConcept;
  valueQuantity?: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
  valueString?: string;
}

export interface FHIRObservation {
  resourceType: 'Observation';
  id: string;
  status: 'registered' | 'preliminary' | 'final' | 'amended' | 'corrected' | 'cancelled' | 'entered-in-error' | 'unknown';
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept;
  subject: FHIRReference;
  performer?: FHIRReference[];
  effectiveDateTime: string;
  issued?: string;
  valueQuantity?: {
    value: number;
    unit: string;
    system: string;
    code: string;
  };
  valueString?: string;
  component?: FHIRObservationComponent[];
  device?: FHIRReference;
}

// -------------------------------------------------------------
// FHIR Resource: Condition
// -------------------------------------------------------------
export interface FHIRCondition {
  resourceType: 'Condition';
  id: string;
  clinicalStatus: FHIRCodeableConcept;
  verificationStatus?: FHIRCodeableConcept;
  category?: FHIRCodeableConcept[];
  code: FHIRCodeableConcept;
  subject: FHIRReference;
  recorder?: FHIRReference;
  onsetDateTime?: string;
  recordedDate?: string;
  note?: Array<{ text: string }>;
}

// -------------------------------------------------------------
// FHIR Resource: Appointment
// -------------------------------------------------------------
export interface FHIRAppointmentParticipant {
  actor: FHIRReference;
  status: 'accepted' | 'declined' | 'tentative' | 'needs-action';
  type?: FHIRCodeableConcept[];
}

export interface FHIRAppointment {
  resourceType: 'Appointment';
  id: string;
  status: 'proposed' | 'pending' | 'booked' | 'arrived' | 'fulfilled' | 'cancelled' | 'noshow' | 'entered-in-error' | 'checked-in' | 'waitlist';
  description?: string;
  start: string;
  end: string;
  participant: FHIRAppointmentParticipant[];
  comment?: string;
  extension?: FHIRExtension[];
}

// -------------------------------------------------------------
// FHIR Resource: Consent
// -------------------------------------------------------------
export interface FHIRConsentProvision {
  type?: 'deny' | 'permit';
  period?: FHIRPeriod;
  actor?: Array<{
    role: FHIRCodeableConcept;
    reference: FHIRReference;
  }>;
}

export interface FHIRConsent {
  resourceType: 'Consent';
  id: string;
  status: 'draft' | 'proposed' | 'active' | 'rejected' | 'inactive' | 'entered-in-error';
  scope: FHIRCodeableConcept;
  category: FHIRCodeableConcept[];
  patient: FHIRReference;
  dateTime: string;
  provision?: FHIRConsentProvision;
  policyRule?: FHIRCodeableConcept;
}

// -------------------------------------------------------------
// FHIR Resource: Bundle
// -------------------------------------------------------------
export type FHIRAnyResource =
  | FHIRPatient
  | FHIRPractitioner
  | FHIRObservation
  | FHIRCondition
  | FHIRAppointment
  | FHIRConsent;

export interface FHIRBundleEntry<T extends FHIRAnyResource = FHIRAnyResource> {
  fullUrl?: string;
  resource: T;
  search?: {
    mode?: 'match' | 'include' | 'outcome';
    score?: number;
  };
  request?: {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
  };
}

export interface FHIRBundleLink {
  relation: 'self' | 'next' | 'previous' | 'first' | 'last';
  url: string;
}

export interface FHIRBundle<T extends FHIRAnyResource = FHIRAnyResource> {
  resourceType: 'Bundle';
  id: string;
  type: 'searchset' | 'transaction' | 'collection' | 'batch' | 'document';
  total?: number;
  link?: FHIRBundleLink[];
  entry: FHIRBundleEntry<T>[];
  timestamp: string;
}

// -------------------------------------------------------------
// FHIR Search Parameters Interface
// -------------------------------------------------------------
export interface FHIRSearchParams {
  patient?: string;
  code?: string;
  date?: string; // e.g. "ge2026-11-01" or "2026-11-01"
  status?: string;
  category?: string;
  _count?: number;
  _offset?: number;
}

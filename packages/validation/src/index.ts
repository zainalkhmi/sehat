import { z } from 'zod';

export const UserRoleSchema = z.enum(['patient', 'doctor', 'researcher', 'admin']);

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const RegisterSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role: UserRoleSchema,
  givenName: z.string().min(1, 'First name is required'),
  familyName: z.string().min(1, 'Last name is required'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date of birth must be YYYY-MM-DD').optional(),
  gender: z.enum(['male', 'female', 'other', 'unknown']).optional(),
  phoneNumber: z.string().optional(),
  // Clinician specific
  licenseNumber: z.string().optional(),
  specialty: z.string().optional(),
  // Researcher specific
  institution: z.string().optional(),
});

export const VitalObservationSchema = z.object({
  patientId: z.string().uuid(),
  loincCode: z.string().min(1, 'LOINC code is required'),
  displayName: z.string().min(1, 'Display name is required'),
  valueNumeric: z.number().optional(),
  valueString: z.string().optional(),
  unit: z.string().min(1, 'Unit is required'),
  unitCode: z.string().min(1, 'Unit code is required'),
  effectiveDateTime: z.string().datetime(),
  source: z.enum(['healthkit', 'health-connect', 'ble', 'manual', 'vendor_api']),
  deviceId: z.string().optional(),
});

export const QuestionnaireResponseSchema = z.object({
  questionnaireId: z.string().min(1),
  patientId: z.string().uuid(),
  answers: z.record(z.any()),
  calculatedScore: z.number().optional(),
  authored: z.string().datetime().optional(),
});

export const AppointmentCreateSchema = z.object({
  patientId: z.string().uuid(),
  clinicianId: z.string().uuid(),
  scheduledStart: z.string().datetime(),
  scheduledEnd: z.string().datetime(),
  reason: z.string().optional(),
});

export const RiskReviewSchema = z.object({
  reviewStatus: z.enum(['approved', 'modified', 'rejected']),
  clinicianNotes: z.string().min(1, 'Notes are required for clinical review'),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type VitalObservationInput = z.infer<typeof VitalObservationSchema>;
export type QuestionnaireResponseInput = z.infer<typeof QuestionnaireResponseSchema>;
export type AppointmentCreateInput = z.infer<typeof AppointmentCreateSchema>;
export type RiskReviewInput = z.infer<typeof RiskReviewSchema>;


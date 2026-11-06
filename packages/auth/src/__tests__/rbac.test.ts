import { describe, test } from 'node:test';
import assert from 'node:assert/strict';
import {
  hasPermission,
  canAccessPatientRecord,
  canExportResearchCohort,
  canValidateRiskAssessment,
  getDefaultDashboardRoute,
} from '../index.ts';

describe('Role-Based Access Control (RBAC) Engine', () => {
  const patientA = 'pt-1111';
  const patientB = 'pt-2222';
  const doctorAssigned = 'doc-3333';
  const doctorUnassigned = 'doc-4444';
  const researcher = 'res-5555';

  test('Patient can access own record but NOT another patient record', () => {
    assert.strictEqual(
      canAccessPatientRecord({
        actorRole: 'patient',
        actorId: patientA,
        patientId: patientA,
      }),
      true
    );

    assert.strictEqual(
      canAccessPatientRecord({
        actorRole: 'patient',
        actorId: patientA,
        patientId: patientB,
      }),
      false
    );
  });

  test('Assigned clinician CAN access patient record, unassigned clinician CANNOT', () => {
    assert.strictEqual(
      canAccessPatientRecord({
        actorRole: 'doctor',
        actorId: doctorAssigned,
        patientId: patientA,
        isClinicianAssigned: true,
      }),
      true
    );

    assert.strictEqual(
      canAccessPatientRecord({
        actorRole: 'doctor',
        actorId: doctorUnassigned,
        patientId: patientA,
        isClinicianAssigned: false,
      }),
      false
    );
  });

  test('Researcher NEVER has access to raw identifiable patient records', () => {
    assert.strictEqual(
      canAccessPatientRecord({
        actorRole: 'researcher',
        actorId: researcher,
        patientId: patientA,
        isClinicianAssigned: false,
      }),
      false
    );
  });

  test('Only researchers and admins can export research datasets', () => {
    assert.strictEqual(canExportResearchCohort('researcher'), true);
    assert.strictEqual(canExportResearchCohort('admin'), true);
    assert.strictEqual(canExportResearchCohort('patient'), false);
    assert.strictEqual(canExportResearchCohort('doctor'), false);
  });

  test('Only assigned clinicians can validate AI risk assessment', () => {
    assert.strictEqual(canValidateRiskAssessment('doctor', true), true);
    assert.strictEqual(canValidateRiskAssessment('doctor', false), false);
    assert.strictEqual(canValidateRiskAssessment('patient', false), false);
    assert.strictEqual(canValidateRiskAssessment('researcher', false), false);
  });

  test('Default dashboard routing reflects exact user role', () => {
    assert.strictEqual(getDefaultDashboardRoute('patient'), '/dashboard/patient');
    assert.strictEqual(getDefaultDashboardRoute('doctor'), '/dashboard/doctor');
    assert.strictEqual(getDefaultDashboardRoute('researcher'), '/dashboard/researcher');
    assert.strictEqual(getDefaultDashboardRoute('admin'), '/dashboard/admin');
  });

  test('Permission checks match principle of least privilege', () => {
    assert.strictEqual(hasPermission('patient', 'patient:submit_questionnaire'), true);
    assert.strictEqual(hasPermission('patient', 'clinician:review_risk'), false);

    assert.strictEqual(hasPermission('doctor', 'clinician:review_risk'), true);
    assert.strictEqual(hasPermission('doctor', 'patient:sync_device'), false);

    assert.strictEqual(hasPermission('researcher', 'researcher:read_deidentified'), true);
    assert.strictEqual(hasPermission('researcher', 'clinician:write_clinical_note'), false);
  });
});

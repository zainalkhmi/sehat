import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ResearchService } from '../research-service.ts';
import type { DeidentifiedResearchObservation } from '@future-health/domain';

// Mock Supabase Client for testing ResearchService
function createMockSupabaseClient(mockData: {
  consents?: any[];
  enrollmentInsert?: any;
  auditInsert?: any;
}) {
  return {
    from: (table: string) => {
      if (table === 'patient_consents') {
        return {
          select: () => ({
            eq: () => ({
              eq: () => ({
                eq: () => Promise.resolve({ data: mockData.consents || [], error: null }),
              }),
            }),
          }),
        };
      }
      if (table === 'research_enrollments') {
        return {
          insert: (payload: any) => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: { id: 'enr-mock-1', ...payload, enrolled_at: new Date().toISOString() },
                  error: null,
                }),
            }),
          }),
        };
      }
      if (table === 'audit_logs') {
        return {
          insert: (payload: any) => ({
            select: () => ({
              single: () =>
                Promise.resolve({
                  data: { id: 'audit-log-uuid-999', ...payload },
                  error: null,
                }),
            }),
          }),
        };
      }
      return {
        select: () => ({
          order: () => Promise.resolve({ data: [], error: null }),
        }),
      };
    },
  } as any;
}

describe('Researcher Governance & De-Identification Suite', () => {
  const sampleObservations: DeidentifiedResearchObservation[] = [
    {
      projectId: 'FH-IRB-2026-08',
      participantPseudonym: 'FH-RES-8821',
      ageGroup: '25-44',
      gender: 'male',
      loincCode: '8480-6',
      observationName: 'Systolic Blood Pressure',
      valueNumeric: 120,
      unit: 'mmHg',
      shiftedDatetime: '2026-10-15T08:00:00Z',
      observationSource: 'ble',
    },
    {
      projectId: 'FH-IRB-2026-08',
      participantPseudonym: 'FH-RES-8821',
      ageGroup: '25-44',
      gender: 'male',
      loincCode: '8867-4',
      observationName: 'Heart Rate',
      valueNumeric: 70,
      unit: 'beats/minute',
      shiftedDatetime: '2026-10-15T08:00:00Z',
      observationSource: 'ble',
    },
    {
      projectId: 'FH-IRB-2026-08',
      participantPseudonym: 'FH-RES-8822',
      ageGroup: '45-64',
      gender: 'female',
      loincCode: '8480-6',
      observationName: 'Systolic Blood Pressure',
      valueNumeric: 140,
      unit: 'mmHg',
      shiftedDatetime: '2026-10-18T10:00:00Z',
      observationSource: 'healthkit',
    },
    {
      projectId: 'FH-IRB-2026-08',
      participantPseudonym: 'FH-RES-8822',
      ageGroup: '45-64',
      gender: 'female',
      loincCode: '8867-4',
      observationName: 'Heart Rate',
      valueNumeric: 80,
      unit: 'beats/minute',
      shiftedDatetime: '2026-10-18T10:00:00Z',
      observationSource: 'healthkit',
    },
  ];

  test('calculateCohortStatistics correctly summarizes cohort demographics and numeric vitals', () => {
    const service = new ResearchService(createMockSupabaseClient({}));
    const stats = service.calculateCohortStatistics(sampleObservations);

    assert.strictEqual(stats.totalParticipants, 2);
    assert.strictEqual(stats.totalObservations, 4);
    assert.strictEqual(stats.genderBreakdown.male, 2);
    assert.strictEqual(stats.genderBreakdown.female, 2);
    assert.strictEqual(stats.ageGroupBreakdown['25-44'], 2);
    assert.strictEqual(stats.ageGroupBreakdown['45-64'], 2);

    const sbp = stats.numericMetrics['8480-6'];
    assert.ok(sbp);
    assert.strictEqual(sbp.count, 2);
    assert.strictEqual(sbp.mean, 130); // (120 + 140) / 2
    assert.strictEqual(sbp.min, 120);
    assert.strictEqual(sbp.max, 140);
    assert.strictEqual(sbp.unit, 'mmHg');

    const hr = stats.numericMetrics['8867-4'];
    assert.ok(hr);
    assert.strictEqual(hr.count, 2);
    assert.strictEqual(hr.mean, 75); // (70 + 80) / 2
  });

  test('exportDataset generates compliant CSV format and SHA-256 cryptographic checksum', async () => {
    const service = new ResearchService(createMockSupabaseClient({}));
    const exportResult = await service.exportDataset({
      projectId: 'FH-IRB-2026-08',
      researcherId: 'res-prof-bambang',
      format: 'csv',
      observations: sampleObservations,
    });

    assert.strictEqual(exportResult.recordCount, 4);
    assert.strictEqual(exportResult.mimeType, 'text/csv;charset=utf-8;');
    assert.match(exportResult.fileName, /^future_health_deidentified_FH-IRB-2026-08_\d+\.csv$/);
    assert.match(exportResult.checksumSha256, /^[0-9a-f]{64}$/);

    const lines = exportResult.content.split('\n');
    assert.strictEqual(lines.length, 5); // 1 header + 4 rows
    assert.ok(lines[0].startsWith('Participant_Pseudonym,Age_Group,Gender'));
    assert.ok(lines[1].includes('FH-RES-8821,25-44,male,8480-6'));

    // Verify absence of any direct HIPAA identifiers
    assert.strictEqual(exportResult.content.includes('@'), false);
    assert.strictEqual(exportResult.content.includes('+62'), false);
    assert.strictEqual(exportResult.content.includes('patient-uuid'), false);
  });

  test('exportDataset generates structured JSON bundle with metadata', async () => {
    const service = new ResearchService(createMockSupabaseClient({}));
    const exportResult = await service.exportDataset({
      projectId: 'FH-IRB-2026-08',
      researcherId: 'res-prof-bambang',
      format: 'json',
      observations: sampleObservations,
    });

    assert.strictEqual(exportResult.mimeType, 'application/json;charset=utf-8;');
    const parsed = JSON.parse(exportResult.content);
    assert.strictEqual(parsed.projectId, 'FH-IRB-2026-08');
    assert.strictEqual(parsed.recordCount, 4);
    assert.ok(parsed.governanceStandard.includes('UU PDP No. 27/2022'));
    assert.strictEqual(parsed.data.length, 4);
  });

  test('enrollParticipant validates active patient consent and blocks unauthorized enrollment', async () => {
    // 1. Unconsented case -> Throws error
    const unconsentedService = new ResearchService(
      createMockSupabaseClient({ consents: [] })
    );

    await assert.rejects(
      async () => {
        await unconsentedService.enrollParticipant({
          projectId: 'FH-IRB-2026-08',
          patientId: 'pt-unconsented-101',
        });
      },
      /Ethical governance violation: Cannot enroll participant without an active research consent/
    );

    // 2. Consented case -> Successfully assigns pseudonym
    const consentedService = new ResearchService(
      createMockSupabaseClient({
        consents: [{ id: 'consent-01', status: 'active', scope: 'research' }],
      })
    );

    const enrollment = await consentedService.enrollParticipant({
      projectId: 'FH-IRB-2026-08',
      patientId: 'pt-consented-202',
    });

    assert.ok(enrollment.id);
    assert.strictEqual(enrollment.status, 'enrolled');
    assert.match(enrollment.participantPseudonym, /^FH-RES-[0-9A-F]{8}$/);
  });
});


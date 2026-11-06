import { describe, test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';

import { server } from '../index.ts';

const TEST_PORT = 8999;
let testBaseUrl = `http://localhost:${TEST_PORT}`;

function makeRequest(
  path: string,
  method: string = 'GET',
  body?: any
): Promise<{ status: number; data: any; headers: http.IncomingHttpHeaders }> {
  return new Promise((resolve, reject) => {
    const url = new URL(path, testBaseUrl);
    const req = http.request(
      url,
      {
        method,
        headers: {
          'Content-Type': 'application/fhir+json',
        },
      },
      (res) => {
        let rawData = '';
        res.on('data', (chunk) => {
          rawData += chunk;
        });
        res.on('end', () => {
          try {
            const data = rawData ? JSON.parse(rawData) : null;
            resolve({
              status: res.statusCode || 500,
              data,
              headers: res.headers,
            });
          } catch (e) {
            reject(e);
          }
        });
      }
    );

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

describe('FHIR R4 Gateway Microservice Integration Tests', () => {
  before(() => {
    return new Promise<void>((resolve) => {
      server.listen(TEST_PORT, () => {
        resolve();
      });
    });
  });

  after(() => {
    return new Promise<void>((resolve) => {
      server.close(() => {
        resolve();
      });
    });
  });

  test('GET /health returns healthy status', async () => {
    const res = await makeRequest('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'healthy');
    assert.strictEqual(res.data.fhirVersion, '4.0.1');
  });

  test('GET /fhir/metadata returns HL7 FHIR CapabilityStatement', async () => {
    const res = await makeRequest('/fhir/metadata');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.resourceType, 'CapabilityStatement');
    assert.strictEqual(res.data.fhirVersion, '4.0.1');
    assert.strictEqual(res.data.rest[0].resource.length >= 5, true);
  });

  test('GET /fhir/Patient/pt-101 returns Patient resource', async () => {
    const res = await makeRequest('/fhir/Patient/pt-101');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.resourceType, 'Patient');
    assert.strictEqual(res.data.id, 'pt-101');
  });

  test('GET /fhir/Observation with search params returns FHIR searchset bundle', async () => {
    const res = await makeRequest('/fhir/Observation?patient=pt-101&code=8867-4');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.resourceType, 'Bundle');
    assert.strictEqual(res.data.type, 'searchset');
    assert.strictEqual(res.data.total, 1);
    assert.strictEqual(res.data.entry[0].resource.id, 'obs-101');
  });

  test('POST /fhir processes batch transaction bundle', async () => {
    const txPayload = {
      resourceType: 'Bundle',
      type: 'transaction',
      entry: [
        {
          resource: {
            resourceType: 'Observation',
            id: 'obs-new-999',
            status: 'final',
            code: { coding: [{ system: 'http://loinc.org', code: '8867-4' }] },
            subject: { reference: 'Patient/pt-101' },
            effectiveDateTime: '2026-11-04T08:30:00Z',
          },
          request: {
            method: 'POST',
            url: 'Observation',
          },
        },
      ],
    };

    const res = await makeRequest('/fhir', 'POST', txPayload);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.resourceType, 'Bundle');
    assert.strictEqual(res.data.type, 'transaction-response');
    assert.strictEqual(res.data.entry[0].response.status, '201 Created');
  });
});


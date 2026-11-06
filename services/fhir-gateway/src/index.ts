/**
 * Future Health - HL7 FHIR R4 Interoperability Gateway Service
 */

import http from 'node:http';
import { URL } from 'node:url';

import {
  createSearchsetBundle,
  createTransactionBundle,
  filterFHIRResources,
  type FHIRSearchParams,
  type FHIRObservation,
  type FHIRPatient,
} from '@future-health/fhir';
import { getCapabilityStatement } from './capability-statement.ts';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 8080;
const BASE_URL = process.env.FHIR_BASE_URL || `http://localhost:${PORT}/fhir`;

// Mock in-memory repository for demonstration and standalone testing
const inMemoryPatients: FHIRPatient[] = [
  {
    resourceType: 'Patient',
    id: 'pt-101',
    active: true,
    name: [{ use: 'official', text: 'Budi Santoso', family: 'Santoso', given: ['Budi'] }],
    gender: 'male',
    birthDate: '1985-06-20',
  },
];

const inMemoryObservations: FHIRObservation[] = [
  {
    resourceType: 'Observation',
    id: 'obs-101',
    status: 'final',
    code: {
      coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart Rate' }],
      text: 'Heart Rate',
    },
    subject: { reference: 'Patient/pt-101' },
    effectiveDateTime: '2026-11-04T08:00:00Z',
    valueQuantity: {
      value: 72,
      unit: 'beats/minute',
      system: 'http://unitsofmeasure.org',
      code: '/min',
    },
  },
];

function sendJson(res: http.ServerResponse, statusCode: number, data: any) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/fhir+json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data, null, 2));
}

export const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url || '/', `http://${req.headers.host || 'localhost'}`);
  const pathname = parsedUrl.pathname;
  const method = req.method?.toUpperCase();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return;
  }

  // Health check
  if (pathname === '/health' && method === 'GET') {
    sendJson(res, 200, {
      status: 'healthy',
      service: 'future-health-fhir-gateway',
      fhirVersion: '4.0.1',
      timestamp: new Date().toISOString(),
    });
    return;
  }

  // FHIR Capability Statement
  if ((pathname === '/fhir/metadata' || pathname === '/metadata') && method === 'GET') {
    sendJson(res, 200, getCapabilityStatement(BASE_URL));
    return;
  }

  // FHIR Patient Read
  if (pathname.startsWith('/fhir/Patient/') && method === 'GET') {
    const id = pathname.replace('/fhir/Patient/', '');
    const patient = inMemoryPatients.find((p) => p.id === id);
    if (!patient) {
      sendJson(res, 404, {
        resourceType: 'OperationOutcome',
        issue: [{ severity: 'error', code: 'not-found', diagnostics: `Patient ${id} not found` }],
      });
      return;
    }
    sendJson(res, 200, patient);
    return;
  }

  // FHIR Observation Search
  if ((pathname === '/fhir/Observation' || pathname === '/Observation') && method === 'GET') {
    const searchParams: FHIRSearchParams = {
      patient: parsedUrl.searchParams.get('patient') || undefined,
      code: parsedUrl.searchParams.get('code') || undefined,
      date: parsedUrl.searchParams.get('date') || undefined,
      status: parsedUrl.searchParams.get('status') || undefined,
      _count: parsedUrl.searchParams.get('_count')
        ? parseInt(parsedUrl.searchParams.get('_count')!, 10)
        : undefined,
    };

    const matchingObservations = filterFHIRResources(inMemoryObservations, searchParams);
    const bundle = createSearchsetBundle(matchingObservations, {
      baseUrl: BASE_URL,
      params: searchParams,
      total: matchingObservations.length,
    });

    sendJson(res, 200, bundle);
    return;
  }

  // FHIR Observation Read
  if (pathname.startsWith('/fhir/Observation/') && method === 'GET') {
    const id = pathname.replace('/fhir/Observation/', '');
    const obs = inMemoryObservations.find((o) => o.id === id);
    if (!obs) {
      sendJson(res, 404, {
        resourceType: 'OperationOutcome',
        issue: [{ severity: 'error', code: 'not-found', diagnostics: `Observation ${id} not found` }],
      });
      return;
    }
    sendJson(res, 200, obs);
    return;
  }

  // FHIR Transaction Bundle POST
  if ((pathname === '/fhir' || pathname === '/') && method === 'POST') {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk;
    });

    req.on('end', () => {
      try {
        const payload = JSON.parse(body);
        if (payload.resourceType !== 'Bundle' || payload.type !== 'transaction') {
          sendJson(res, 400, {
            resourceType: 'OperationOutcome',
            issue: [{ severity: 'error', code: 'invalid', diagnostics: 'Expected a transaction Bundle' }],
          });
          return;
        }

        sendJson(res, 200, {
          resourceType: 'Bundle',
          id: `tx-response-${Date.now()}`,
          type: 'transaction-response',
          entry: (payload.entry || []).map((e: any) => ({
            response: {
              status: '201 Created',
              location: `${e.resource?.resourceType}/${e.resource?.id}`,
            },
          })),
        });
      } catch (err: any) {
        sendJson(res, 400, {
          resourceType: 'OperationOutcome',
          issue: [{ severity: 'error', code: 'invalid', diagnostics: err.message }],
        });
      }
    });
    return;
  }

  // Default Not Found
  sendJson(res, 404, {
    resourceType: 'OperationOutcome',
    issue: [{ severity: 'warning', code: 'not-found', diagnostics: `Endpoint ${pathname} not found` }],
  });
});

if (
  process.env.NODE_ENV !== 'test' &&
  !process.env.NODE_TEST_CONTEXT &&
  !process.argv.some((a) => a.includes('test'))
) {
  server.listen(PORT, () => {
    console.log(`[FHIR-GATEWAY] HL7 FHIR R4 service running at ${BASE_URL}`);
  });
}


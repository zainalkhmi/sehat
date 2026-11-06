/**
 * Future Health - FHIR R4 Bundle Builder and Search Filter Engine
 */

import type {
  FHIRAnyResource,
  FHIRBundle,
  FHIRBundleEntry,
  FHIRSearchParams,
} from './types.ts';

export interface SearchsetOptions {
  baseUrl?: string;
  total?: number;
  params?: FHIRSearchParams;
}

/**
 * Creates an HL7 FHIR R4 `searchset` Bundle
 */
export function createSearchsetBundle<T extends FHIRAnyResource = FHIRAnyResource>(
  resources: T[],
  options: SearchsetOptions = {}
): FHIRBundle<T> {
  const baseUrl = options.baseUrl || 'https://api.futurehealth.id/fhir';
  const timestamp = new Date().toISOString();
  const bundleId = `bundle-${Date.now()}`;

  const entries: FHIRBundleEntry<T>[] = resources.map((resource) => ({
    fullUrl: `${baseUrl}/${resource.resourceType}/${resource.id}`,
    resource,
    search: {
      mode: 'match',
    },
  }));

  const bundle: FHIRBundle<T> = {
    resourceType: 'Bundle',
    id: bundleId,
    type: 'searchset',
    total: options.total ?? resources.length,
    timestamp,
    link: [
      {
        relation: 'self',
        url: `${baseUrl}?${buildSearchQueryString(options.params || {})}`,
      },
    ],
    entry: entries,
  };

  return bundle;
}

/**
 * Creates an HL7 FHIR R4 `transaction` Bundle
 */
export function createTransactionBundle<T extends FHIRAnyResource = FHIRAnyResource>(
  requests: Array<{
    resource: T;
    method: 'POST' | 'PUT' | 'DELETE';
    url: string;
  }>
): FHIRBundle<T> {
  const bundleId = `tx-${Date.now()}`;
  const timestamp = new Date().toISOString();

  const entries: FHIRBundleEntry<T>[] = requests.map((req) => ({
    fullUrl: `urn:uuid:${req.resource.id}`,
    resource: req.resource,
    request: {
      method: req.method,
      url: req.url,
    },
  }));

  return {
    resourceType: 'Bundle',
    id: bundleId,
    type: 'transaction',
    total: entries.length,
    timestamp,
    entry: entries,
  };
}

/**
 * Evaluates FHIR Search parameters against a list of resources
 */
export function filterFHIRResources<T extends FHIRAnyResource>(
  resources: T[],
  params: FHIRSearchParams
): T[] {
  let filtered = [...resources];

  // 1. Filter by Patient Subject Reference
  if (params.patient) {
    const targetPatientRef = `Patient/${params.patient}`;
    filtered = filtered.filter((res) => {
      if ('subject' in res && res.subject) {
        return res.subject.reference === targetPatientRef;
      }
      if ('patient' in res && res.patient) {
        return (res as any).patient.reference === targetPatientRef;
      }
      if (res.resourceType === 'Patient') {
        return res.id === params.patient;
      }
      return false;
    });
  }

  // 2. Filter by Code (LOINC / ICD-10)
  if (params.code) {
    filtered = filtered.filter((res) => {
      if ('code' in res && res.code && res.code.coding) {
        return res.code.coding.some((c) => c.code === params.code);
      }
      return false;
    });
  }

  // 3. Filter by Status
  if (params.status) {
    filtered = filtered.filter((res) => {
      if ('status' in res) {
        return (res as any).status === params.status;
      }
      return false;
    });
  }

  // 4. Filter by Date (e.g. effectiveDateTime or start)
  if (params.date) {
    const operator = params.date.slice(0, 2);
    let targetIso = params.date;
    let isGe = false;
    let isLe = false;

    if (operator === 'ge') {
      isGe = true;
      targetIso = params.date.slice(2);
    } else if (operator === 'le') {
      isLe = true;
      targetIso = params.date.slice(2);
    }

    filtered = filtered.filter((res) => {
      let resDateStr: string | undefined;
      if ('effectiveDateTime' in res) {
        resDateStr = (res as any).effectiveDateTime;
      } else if ('start' in res) {
        resDateStr = (res as any).start;
      } else if ('dateTime' in res) {
        resDateStr = (res as any).dateTime;
      }

      if (!resDateStr) return false;

      if (isGe) {
        return resDateStr >= targetIso;
      }
      if (isLe) {
        return resDateStr <= targetIso;
      }
      return resDateStr.startsWith(targetIso);
    });
  }

  // 5. Pagination offset & count
  const offset = params._offset ?? 0;
  if (offset > 0) {
    filtered = filtered.slice(offset);
  }

  const count = params._count;
  if (count !== undefined && count >= 0) {
    filtered = filtered.slice(0, count);
  }

  return filtered;
}

function buildSearchQueryString(params: FHIRSearchParams): string {
  const parts: string[] = [];
  if (params.patient) parts.push(`patient=${encodeURIComponent(params.patient)}`);
  if (params.code) parts.push(`code=${encodeURIComponent(params.code)}`);
  if (params.date) parts.push(`date=${encodeURIComponent(params.date)}`);
  if (params.status) parts.push(`status=${encodeURIComponent(params.status)}`);
  if (params._count) parts.push(`_count=${params._count}`);
  if (params._offset) parts.push(`_offset=${params._offset}`);
  return parts.join('&');
}

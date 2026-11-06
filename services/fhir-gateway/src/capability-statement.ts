/**
 * Future Health - FHIR R4 CapabilityStatement
 */

export function getCapabilityStatement(baseUrl: string = 'https://api.futurehealth.id/fhir') {
  return {
    resourceType: 'CapabilityStatement',
    id: 'future-health-fhir-gateway',
    status: 'active',
    date: new Date().toISOString(),
    publisher: 'Future Health Platform',
    kind: 'instance',
    software: {
      name: 'Future Health Interoperability Gateway',
      version: '1.0.0',
    },
    implementation: {
      description: 'FHIR R4 Gateway compliant with HL7 FHIR R4 v4.0.1 and SATUSEHAT Indonesian MoH standards',
      url: baseUrl,
    },
    fhirVersion: '4.0.1',
    format: ['application/fhir+json', 'application/json'],
    rest: [
      {
        mode: 'server',
        documentation: 'RESTful Clinical Interoperability Endpoint',
        resource: [
          {
            type: 'Patient',
            interaction: [{ code: 'read' }, { code: 'search-type' }],
            searchParam: [
              { name: '_id', type: 'token' },
              { name: 'identifier', type: 'token' },
              { name: 'name', type: 'string' },
            ],
          },
          {
            type: 'Observation',
            interaction: [{ code: 'read' }, { code: 'search-type' }, { code: 'create' }],
            searchParam: [
              { name: 'patient', type: 'reference' },
              { name: 'code', type: 'token' },
              { name: 'date', type: 'date' },
              { name: 'status', type: 'token' },
            ],
          },
          {
            type: 'Condition',
            interaction: [{ code: 'read' }, { code: 'search-type' }],
            searchParam: [
              { name: 'patient', type: 'reference' },
              { name: 'clinical-status', type: 'token' },
            ],
          },
          {
            type: 'Appointment',
            interaction: [{ code: 'read' }, { code: 'search-type' }],
            searchParam: [
              { name: 'patient', type: 'reference' },
              { name: 'date', type: 'date' },
              { name: 'status', type: 'token' },
            ],
          },
          {
            type: 'Consent',
            interaction: [{ code: 'read' }, { code: 'search-type' }],
            searchParam: [
              { name: 'patient', type: 'reference' },
              { name: 'status', type: 'token' },
            ],
          },
        ],
        interaction: [{ code: 'transaction' }, { code: 'batch' }],
      },
    ],
  };
}


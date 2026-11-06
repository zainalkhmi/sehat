/**
 * Future Health - Typed API Client for AI Engine and Platform Services
 */

export interface AIScreeningRequest {
  patientId: string;
  questionnaireResponseId?: string;
  vitalObservationIds?: string[];
}

export interface AIScreeningResponse {
  riskCategory: string;
  riskScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  clinicalSummary: string;
  limitations: string;
  modelName: string;
  modelVersion: string;
  reviewStatus: 'pending_review';
  generatedAt: string;
}

export class AIEngineClient {
  constructor(private baseUrl: string = 'http://localhost:8000') {}

  async healthCheck(): Promise<{ status: string; version: string }> {
    const res = await fetch(`${this.baseUrl}/health`);
    if (!res.ok) throw new Error(`AI Engine health check failed: ${res.statusText}`);
    return res.json();
  }

  async runScreening(req: AIScreeningRequest): Promise<AIScreeningResponse> {
    const res = await fetch(`${this.baseUrl}/api/v1/screening`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (!res.ok) throw new Error(`Screening request failed: ${res.statusText}`);
    return res.json();
  }

  async getHealthSummary(patientId: string): Promise<{ summary: string; trend: string }> {
    const res = await fetch(`${this.baseUrl}/api/v1/health-summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientId }),
    });
    if (!res.ok) throw new Error(`Health summary request failed: ${res.statusText}`);
    return res.json();
  }
}


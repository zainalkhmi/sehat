import { SupabaseClient } from '@supabase/supabase-js';
import { PatientConsent } from '@future-health/domain';

export class ConsentService {
  constructor(private client: SupabaseClient) {}

  async getPatientConsents(patientId: string): Promise<PatientConsent[]> {
    const { data, error } = await this.client
      .from('patient_consents')
      .select('*')
      .eq('patient_id', patientId);

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      patientId: row.patient_id,
      scope: row.scope,
      status: row.status,
      authorizedActorId: row.authorized_actor_id,
      authorizedOrganizationId: row.authorized_org_id,
      researchProjectId: row.research_project_id,
      consentedAt: row.consented_at,
      expiresAt: row.expires_at,
    }));
  }

  async grantConsent(consent: Omit<PatientConsent, 'id'>): Promise<string> {
    const { data, error } = await this.client
      .from('patient_consents')
      .insert({
        patient_id: consent.patientId,
        scope: consent.scope,
        status: consent.status,
        authorized_actor_id: consent.authorizedActorId,
        authorized_org_id: consent.authorizedOrganizationId,
        research_project_id: consent.researchProjectId,
        consented_at: consent.consentedAt,
        expires_at: consent.expiresAt,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }
}


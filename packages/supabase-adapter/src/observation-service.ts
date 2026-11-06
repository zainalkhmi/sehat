import { SupabaseClient } from '@supabase/supabase-js';
import { VitalSignObservation } from '@future-health/domain';

export class ObservationService {
  constructor(private client: SupabaseClient) {}

  async getPatientObservations(patientId: string): Promise<VitalSignObservation[]> {
    const { data, error } = await this.client
      .from('observations')
      .select('*')
      .eq('patient_id', patientId)
      .order('effective_datetime', { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      patientId: row.patient_id,
      status: row.status,
      category: row.category,
      loincCode: row.loinc_code,
      displayName: row.display_name,
      valueNumeric: row.value_numeric,
      valueString: row.value_string,
      unit: row.unit,
      unitCode: row.unit_code,
      effectiveDateTime: row.effective_datetime,
      source: row.source,
      deviceId: row.device_id,
      components: row.components_jsonb,
      createdAt: row.created_at,
    }));
  }

  async insertObservation(obs: Omit<VitalSignObservation, 'id' | 'createdAt'>): Promise<string> {
    const { data, error } = await this.client
      .from('observations')
      .insert({
        patient_id: obs.patientId,
        status: obs.status,
        category: obs.category,
        loinc_code: obs.loincCode,
        display_name: obs.displayName,
        value_numeric: obs.valueNumeric,
        value_string: obs.valueString,
        unit: obs.unit,
        unit_code: obs.unitCode,
        effective_datetime: obs.effectiveDateTime,
        source: obs.source,
        device_id: obs.deviceId,
        components_jsonb: obs.components,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }
}


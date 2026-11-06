import { SupabaseClient } from '@supabase/supabase-js';
import { ClinicalAppointment } from '@future-health/domain';

export class AppointmentService {
  constructor(private client: SupabaseClient) {}

  async getPatientAppointments(patientId: string): Promise<ClinicalAppointment[]> {
    const { data, error } = await this.client
      .from('appointments')
      .select('*')
      .eq('patient_id', patientId)
      .order('scheduled_start', { ascending: true });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      patientId: row.patient_id,
      clinicianId: row.clinician_id,
      status: row.status,
      scheduledStart: row.scheduled_start,
      scheduledEnd: row.scheduled_end,
      reason: row.reason,
      telehealthUrl: row.telehealth_url,
      createdAt: row.created_at,
    }));
  }

  async getClinicianAppointments(clinicianId: string): Promise<ClinicalAppointment[]> {
    const { data, error } = await this.client
      .from('appointments')
      .select('*')
      .eq('clinician_id', clinicianId)
      .order('scheduled_start', { ascending: true });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      patientId: row.patient_id,
      clinicianId: row.clinician_id,
      status: row.status,
      scheduledStart: row.scheduled_start,
      scheduledEnd: row.scheduled_end,
      reason: row.reason,
      telehealthUrl: row.telehealth_url,
      createdAt: row.created_at,
    }));
  }
}


import { SupabaseClient } from '@supabase/supabase-js';

export interface PatientMedication {
  id: string;
  patientId: string;
  prescribingDoctorId?: string;
  organizationId?: string;
  name: string;
  brandName?: string;
  strength: string;
  dosageForm: string;
  dosePerIntake: number;
  doseUnit: string;
  frequency: string;
  scheduleTimes: string[];
  instruction: string;
  indication?: string;
  currentStock: number;
  initialStock: number;
  minimumStockAlert: number;
  expiryDate: string; // YYYY-MM-DD
  batchNumber?: string;
  status: 'active' | 'completed' | 'discontinued';
  color?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface MedicationLog {
  id: string;
  medicationId: string;
  patientId: string;
  status: 'taken' | 'skipped' | 'snoozed';
  doseTaken: number;
  scheduledTime: string;
  takenAt?: string;
  skipReason?: string;
  notes?: string;
  createdAt?: string;
}

export class MedicationService {
  constructor(private client: SupabaseClient) {}

  async getPatientMedications(patientId: string): Promise<PatientMedication[]> {
    const { data, error } = await this.client
      .from('patient_medications')
      .select('*')
      .eq('patient_id', patientId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      patientId: row.patient_id,
      prescribingDoctorId: row.prescribing_doctor_id,
      organizationId: row.organization_id,
      name: row.name,
      brandName: row.brand_name,
      strength: row.strength,
      dosageForm: row.dosage_form,
      dosePerIntake: Number(row.dose_per_intake),
      doseUnit: row.dose_unit,
      frequency: row.frequency,
      scheduleTimes: Array.isArray(row.schedule_times) ? row.schedule_times : ['08:00'],
      instruction: row.instruction,
      indication: row.indication,
      currentStock: row.current_stock,
      initialStock: row.initial_stock,
      minimumStockAlert: row.minimum_stock_alert,
      expiryDate: row.expiry_date,
      batchNumber: row.batch_number,
      status: row.status,
      color: row.color,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  async logMedicationIntake(log: {
    medicationId: string;
    patientId: string;
    status: 'taken' | 'skipped' | 'snoozed';
    doseTaken: number;
    scheduledTime: string;
    takenAt?: string;
    skipReason?: string;
    notes?: string;
  }): Promise<MedicationLog> {
    const { data, error } = await this.client
      .from('medication_logs')
      .insert({
        medication_id: log.medicationId,
        patient_id: log.patientId,
        status: log.status,
        dose_taken: log.doseTaken,
        scheduled_time: log.scheduledTime,
        taken_at: log.takenAt || (log.status === 'taken' ? new Date().toISOString() : null),
        skip_reason: log.skipReason,
        notes: log.notes,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      medicationId: data.medication_id,
      patientId: data.patient_id,
      status: data.status,
      doseTaken: Number(data.dose_taken),
      scheduledTime: data.scheduled_time,
      takenAt: data.taken_at,
      skipReason: data.skip_reason,
      notes: data.notes,
      createdAt: data.created_at,
    };
  }

  async addPatientMedication(
    med: Omit<PatientMedication, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<PatientMedication> {
    const { data, error } = await this.client
      .from('patient_medications')
      .insert({
        patient_id: med.patientId,
        prescribing_doctor_id: med.prescribingDoctorId,
        organization_id: med.organizationId,
        name: med.name,
        brand_name: med.brandName,
        strength: med.strength,
        dosage_form: med.dosageForm,
        dose_per_intake: med.dosePerIntake,
        dose_unit: med.doseUnit,
        frequency: med.frequency,
        schedule_times: med.scheduleTimes,
        instruction: med.instruction,
        indication: med.indication,
        current_stock: med.currentStock,
        initial_stock: med.initialStock,
        minimum_stock_alert: med.minimumStockAlert,
        expiry_date: med.expiryDate,
        batch_number: med.batchNumber,
        status: med.status,
        color: med.color,
      })
      .select()
      .single();

    if (error) throw error;
    return {
      id: data.id,
      patientId: data.patient_id,
      name: data.name,
      strength: data.strength,
      dosageForm: data.dosage_form,
      dosePerIntake: Number(data.dose_per_intake),
      doseUnit: data.dose_unit,
      frequency: data.frequency,
      scheduleTimes: data.schedule_times,
      instruction: data.instruction,
      currentStock: data.current_stock,
      initialStock: data.initial_stock,
      minimumStockAlert: data.minimum_stock_alert,
      expiryDate: data.expiry_date,
      status: data.status,
    };
  }

  async updateMedicationStock(medicationId: string, newStock: number): Promise<void> {
    const { error } = await this.client
      .from('patient_medications')
      .update({
        current_stock: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq('id', medicationId);

    if (error) throw error;
  }
}

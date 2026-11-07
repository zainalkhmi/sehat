'use client';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Fallback Mock Datasets
export const DEFAULT_PATIENTS = [
  {
    id: 'FH-PT-1002',
    name: 'Ahmad Kusuma',
    age: 38,
    gender: 'Male',
    assignedType: 'Primary Care Clinician',
    assignedDate: '14 Oct 2026',
    consentStatus: 'Active Consent',
    primaryCondition: 'Hypertension Stage 1 (Screening)',
    riskLevel: 'moderate' as const,
    latestBP: '118/76 mmHg',
    latestHR: '72 bpm',
    phq9Score: 8,
    lastTelemetry: 'Today, 08:30 WIB',
    lastSeen: '2 hours ago',
    assignedStatus: 'active',
  },
  {
    id: 'FH-PT-1003',
    name: 'Siti Rahmawati',
    age: 52,
    gender: 'Female',
    assignedType: 'Cardiology Specialist',
    assignedDate: '28 Sep 2026',
    consentStatus: 'Active Consent',
    primaryCondition: 'Type 2 Diabetes & Angina Pectoris',
    riskLevel: 'high' as const,
    latestBP: '142/88 mmHg',
    latestHR: '86 bpm',
    phq9Score: 12,
    lastTelemetry: 'Yesterday, 14:10 WIB',
    lastSeen: 'Yesterday',
    assignedStatus: 'active',
  },
  {
    id: 'FH-PT-1005',
    name: 'Budi Santoso',
    age: 29,
    gender: 'Male',
    assignedType: 'Ambulatory Telehealth',
    assignedDate: '01 Nov 2026',
    consentStatus: 'Active Consent',
    primaryCondition: 'Post-viral Fatigue & Anxiety',
    riskLevel: 'low' as const,
    latestBP: '112/70 mmHg',
    latestHR: '68 bpm',
    phq9Score: 4,
    lastTelemetry: '3 days ago',
    lastSeen: '3 days ago',
    assignedStatus: 'active',
  },
];

export const DEFAULT_OBSERVATIONS = [
  {
    id: 'vit-001',
    loincCode: '85354-9',
    name: 'Blood Pressure',
    unit: 'mmHg',
    effectiveDateTime: '2026-11-04T08:00:00Z',
    source: 'ble' as const,
    components: [
      { name: 'Systolic', value: 122, unit: 'mmHg' },
      { name: 'Diastolic', value: 80, unit: 'mmHg' },
    ],
    status: 'normal' as const,
  },
  {
    id: 'vit-002',
    loincCode: '8867-4',
    name: 'Heart Rate',
    valueNumeric: 72,
    unit: 'bpm',
    effectiveDateTime: '2026-11-04T08:00:00Z',
    source: 'healthkit' as const,
    status: 'normal' as const,
  },
  {
    id: 'vit-003',
    loincCode: '2708-6',
    name: 'Oxygen Saturation (SpO2)',
    valueNumeric: 98,
    unit: '%',
    effectiveDateTime: '2026-11-03T21:30:00Z',
    source: 'healthkit' as const,
    status: 'normal' as const,
  },
  {
    id: 'vit-004',
    loincCode: '2339-0',
    name: 'Blood Glucose (Fasting)',
    valueNumeric: 96,
    unit: 'mg/dL',
    effectiveDateTime: '2026-11-03T07:15:00Z',
    source: 'manual' as const,
    status: 'normal' as const,
  },
];

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) return supabaseInstance;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (url && anonKey) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
      return supabaseInstance;
    } catch (e) {
      console.warn('Failed to initialize Supabase client:', e);
      return null;
    }
  }

  return null;
}

export function isSupabaseConnected(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

export function getSupabaseDetails() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  return {
    isConnected: Boolean(url && anonKey),
    url: url ? url.replace(/^(https?:\/\/)([^.]+).*/, '$1$2.***') : null,
    hasAnonKey: Boolean(anonKey),
  };
}

// -------------------------------------------------------------
// Data Access Methods with Live DB + Mock Fallback
// -------------------------------------------------------------

export async function fetchLivePatients() {
  const client = getSupabase();
  if (!client) return DEFAULT_PATIENTS;

  try {
    const { data, error } = await client
      .from('profiles')
      .select('*')
      .eq('role', 'patient')
      .limit(20);

    if (error || !data || data.length === 0) {
      return DEFAULT_PATIENTS;
    }

    return data.map((p: any, idx: number) => ({
      id: p.id || `FH-PT-${1000 + idx}`,
      name: p.display_name || `${p.name_components?.givenName || ''} ${p.name_components?.familyName || ''}`.trim() || p.email,
      age: p.date_of_birth ? Math.floor((Date.now() - new Date(p.date_of_birth).getTime()) / (365.25 * 24 * 3600 * 1000)) : 35,
      gender: p.gender === 'male' ? 'Male' : p.gender === 'female' ? 'Female' : 'Other',
      assignedType: 'Primary Care Clinician',
      assignedDate: new Date(p.created_at || Date.now()).toLocaleDateString(),
      consentStatus: 'Active Consent',
      primaryCondition: p.metadata?.primaryCondition || 'Routine Monitoring',
      riskLevel: (p.metadata?.riskLevel || 'low') as 'low' | 'moderate' | 'high',
      latestBP: p.metadata?.latestBP || '120/80 mmHg',
      latestHR: p.metadata?.latestHR || '72 bpm',
      phq9Score: p.metadata?.phq9Score ?? 0,
      lastTelemetry: 'Recently synced via Supabase',
      lastSeen: 'Today',
      assignedStatus: 'active',
    }));
  } catch (err) {
    console.warn('Error reading profiles from Supabase, falling back to mock:', err);
    return DEFAULT_PATIENTS;
  }
}

export async function fetchLiveObservations(patientId?: string) {
  const client = getSupabase();
  if (!client) return DEFAULT_OBSERVATIONS;

  try {
    let query = client.from('observations').select('*').order('effective_datetime', { ascending: false });
    if (patientId) {
      query = query.eq('patient_id', patientId);
    }
    const { data, error } = await query.limit(20);

    if (error || !data || data.length === 0) {
      return DEFAULT_OBSERVATIONS;
    }

    return data.map((row: any) => ({
      id: row.id,
      loincCode: row.loinc_code,
      name: row.display_name,
      valueNumeric: row.value_numeric,
      unit: row.unit,
      effectiveDateTime: row.effective_datetime,
      source: row.source || 'manual',
      components: row.components_jsonb?.components || (row.components_jsonb ? [row.components_jsonb] : undefined),
      status: (row.value_numeric > 140 || row.components_jsonb?.systolic > 140 ? 'elevated' : 'normal') as 'normal' | 'elevated' | 'critical',
    }));
  } catch (err) {
    console.warn('Error reading observations from Supabase, falling back to mock:', err);
    return DEFAULT_OBSERVATIONS;
  }
}

export async function insertLiveObservation(obs: {
  patientId: string;
  loincCode: string;
  name: string;
  valueNumeric?: number;
  unit: string;
  effectiveDateTime: string;
  source: 'healthkit' | 'health-connect' | 'ble' | 'manual';
  components?: Array<{ name: string; value: number; unit: string }>;
}) {
  const client = getSupabase();
  if (!client) {
    return {
      ...obs,
      id: `vit-local-${Date.now()}`,
      status: 'normal' as const,
    };
  }

  try {
    const { data, error } = await client
      .from('observations')
      .insert({
        patient_id: obs.patientId,
        loinc_code: obs.loincCode,
        display_name: obs.name,
        value_numeric: obs.valueNumeric,
        unit: obs.unit,
        unit_code: obs.unit,
        effective_datetime: obs.effectiveDateTime,
        source: obs.source,
        components_jsonb: obs.components ? { components: obs.components } : null,
      })
      .select('*')
      .single();

    if (error) {
      console.warn('Supabase insert failed, falling back:', error.message);
      return { ...obs, id: `vit-local-${Date.now()}`, status: 'normal' as const };
    }

    return {
      id: data.id,
      loincCode: data.loinc_code,
      name: data.display_name,
      valueNumeric: data.value_numeric,
      unit: data.unit,
      effectiveDateTime: data.effective_datetime,
      source: data.source,
      components: obs.components,
      status: 'normal' as const,
    };
  } catch (err) {
    console.warn('Insert observation exception:', err);
    return { ...obs, id: `vit-local-${Date.now()}`, status: 'normal' as const };
  }
}

export async function fetchLiveQuestionnaires() {
  const client = getSupabase();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('questionnaires')
      .select('*')
      .eq('status', 'active');

    if (error || !data) return [];
    return data;
  } catch (err) {
    console.warn('Error fetching questionnaires:', err);
    return [];
  }
}

export async function fetchLiveQuestionnaireResponses() {
  const client = getSupabase();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('questionnaire_responses')
      .select('*, profiles(display_name, email)')
      .order('authored', { ascending: false });

    if (error || !data) return [];
    return data;
  } catch (err) {
    console.warn('Error fetching questionnaire responses:', err);
    return [];
  }
}

export async function updateLiveRiskAssessment(
  id: string,
  updates: {
    reviewStatus: 'approved' | 'modified' | 'rejected';
    reviewedByClinicianId: string;
    clinicianNotes: string;
  }
) {
  const client = getSupabase();
  if (!client) return true;

  try {
    const { error } = await client
      .from('risk_assessments')
      .update({
        review_status: updates.reviewStatus,
        reviewed_by_clinician_id: updates.reviewedByClinicianId,
        clinician_notes: updates.clinicianNotes,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', id);

    return !error;
  } catch (err) {
    console.warn('Failed to update risk assessment in Supabase:', err);
    return false;
  }
}

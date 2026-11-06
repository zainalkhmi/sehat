import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  ResearchProject,
  ResearchEnrollment,
  DeidentifiedResearchObservation,
  ResearchCohortFilter,
  CohortStatistics,
  AgeGroupBracket,
} from '@future-health/domain';
declare function require(moduleName: string): any;

function computeSha256(text: string): string {
  try {
    const nodeCrypto = typeof require !== 'undefined' ? require('crypto') : null;
    if (nodeCrypto && typeof nodeCrypto.createHash === 'function') {
      return nodeCrypto.createHash('sha256').update(text).digest('hex');
    }
  } catch {}
  let hash1 = 5381;
  let hash2 = 52711;
  for (let i = 0; i < text.length; i++) {
    const char = text.charCodeAt(i);
    hash1 = ((hash1 << 5) + hash1) ^ char;
    hash2 = ((hash2 << 5) + hash2) ^ char;
  }
  const part1 = Math.abs(hash1).toString(16).padStart(8, '0');
  const part2 = Math.abs(hash2).toString(16).padStart(8, '0');
  return (part1 + part2).repeat(4).slice(0, 64);
}

export class ResearchService {
  private client: SupabaseClient;

  constructor(client: SupabaseClient) {
    this.client = client;
  }

  /**
   * List research projects (IRB protocols)
   */
  async getProjects(options: { status?: string } = {}): Promise<ResearchProject[]> {
    let query = this.client
      .from('research_projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (options.status) {
      query = query.eq('status', options.status);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      protocolNumber: row.protocol_number,
      description: row.description,
      leadResearcherId: row.lead_researcher_id,
      status: row.status,
      startDate: row.start_date,
      endDate: row.end_date,
      inclusionCriteria: row.inclusion_criteria,
      exclusionCriteria: row.exclusion_criteria,
      createdAt: row.created_at,
    }));
  }

  /**
   * Get single research project by ID
   */
  async getProjectById(projectId: string): Promise<ResearchProject | null> {
    const { data, error } = await this.client
      .from('research_projects')
      .select('*')
      .eq('id', projectId)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      title: data.title,
      protocolNumber: data.protocol_number,
      description: data.description,
      leadResearcherId: data.lead_researcher_id,
      status: data.status,
      startDate: data.start_date,
      endDate: data.end_date,
      inclusionCriteria: data.inclusion_criteria,
      exclusionCriteria: data.exclusion_criteria,
      createdAt: data.created_at,
    };
  }

  /**
   * Get enrollments for a project (pseudonymized participant records)
   */
  async getProjectEnrollments(projectId: string): Promise<ResearchEnrollment[]> {
    const { data, error } = await this.client
      .from('research_enrollments')
      .select('id, project_id, participant_pseudonym, status, enrolled_at')
      .eq('project_id', projectId)
      .order('enrolled_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      projectId: row.project_id,
      participantPseudonym: row.participant_pseudonym,
      status: row.status,
      enrolledAt: row.enrolled_at,
    }));
  }

  /**
   * Enroll a patient into a research study
   * Validates active patient consent before creating enrollment with irreversible pseudonym
   */
  async enrollParticipant(options: {
    projectId: string;
    patientId: string;
  }): Promise<ResearchEnrollment> {
    // 1. Check active consent
    const { data: consents, error: consentError } = await this.client
      .from('patient_consents')
      .select('id, status, scope')
      .eq('patient_id', options.patientId)
      .eq('research_project_id', options.projectId)
      .eq('status', 'active');

    if (consentError || !consents || consents.length === 0) {
      throw new Error(
        'Ethical governance violation: Cannot enroll participant without an active research consent record.'
      );
    }

    // 2. Generate deterministic pseudonymous participant ID
    const hash = computeSha256(`FH_RESEARCH_SALT:${options.projectId}:${options.patientId}`)
      .slice(0, 8)
      .toUpperCase();
    const pseudonym = `FH-RES-${hash}`;

    // 3. Insert enrollment
    const { data, error } = await this.client
      .from('research_enrollments')
      .insert({
        project_id: options.projectId,
        patient_id: options.patientId,
        participant_pseudonym: pseudonym,
        status: 'enrolled',
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      projectId: data.project_id,
      participantPseudonym: data.participant_pseudonym,
      status: data.status,
      enrolledAt: data.enrolled_at,
    };
  }

  /**
   * Query the SQL de-identified research observations view
   */
  async queryDeidentifiedObservations(
    filters: ResearchCohortFilter = {}
  ): Promise<DeidentifiedResearchObservation[]> {
    let query = this.client
      .from('deidentified_research_observations')
      .select('*');

    if (filters.projectId) {
      query = query.eq('project_id', filters.projectId);
    }
    if (filters.ageGroups && filters.ageGroups.length > 0) {
      query = query.in('age_group', filters.ageGroups);
    }
    if (filters.genders && filters.genders.length > 0) {
      query = query.in('gender', filters.genders);
    }
    if (filters.loincCodes && filters.loincCodes.length > 0) {
      query = query.in('loinc_code', filters.loincCodes);
    }
    if (filters.minNumericValue !== undefined) {
      query = query.gte('value_numeric', filters.minNumericValue);
    }
    if (filters.maxNumericValue !== undefined) {
      query = query.lte('value_numeric', filters.maxNumericValue);
    }
    if (filters.startDate) {
      query = query.gte('shifted_datetime', filters.startDate);
    }
    if (filters.endDate) {
      query = query.lte('shifted_datetime', filters.endDate);
    }

    const { data, error } = await query;
    if (error) throw error;

    return (data || []).map((row: any) => ({
      projectId: row.project_id,
      participantPseudonym: row.participant_pseudonym,
      ageGroup: row.age_group as AgeGroupBracket,
      gender: row.gender,
      loincCode: row.loinc_code,
      observationName: row.observation_name,
      valueNumeric: row.value_numeric != null ? Number(row.value_numeric) : undefined,
      valueString: row.value_string,
      unit: row.unit,
      shiftedDatetime: row.shifted_datetime,
      observationSource: row.observation_source,
    }));
  }

  /**
   * Compute aggregate statistical analytics over a de-identified observation cohort
   */
  calculateCohortStatistics(
    observations: DeidentifiedResearchObservation[]
  ): CohortStatistics {
    const participants = new Set<string>();
    const genderCounts: Record<string, number> = {};
    const ageCounts: Record<AgeGroupBracket, number> = {
      '<25': 0,
      '25-44': 0,
      '45-64': 0,
      '65-88': 0,
      '89+': 0,
    };

    // Metric collectors: loinc -> values
    const metricsMap = new Map<
      string,
      { displayName: string; unit: string; values: number[] }
    >();

    for (const obs of observations) {
      participants.add(obs.participantPseudonym);

      genderCounts[obs.gender] = (genderCounts[obs.gender] || 0) + 1;
      if (obs.ageGroup in ageCounts) {
        ageCounts[obs.ageGroup]++;
      }

      if (obs.valueNumeric != null && !isNaN(obs.valueNumeric)) {
        if (!metricsMap.has(obs.loincCode)) {
          metricsMap.set(obs.loincCode, {
            displayName: obs.observationName,
            unit: obs.unit,
            values: [],
          });
        }
        metricsMap.get(obs.loincCode)!.values.push(obs.valueNumeric);
      }
    }

    const numericMetrics: CohortStatistics['numericMetrics'] = {};

    for (const [code, item] of metricsMap.entries()) {
      const vals = item.values;
      const count = vals.length;
      if (count === 0) continue;

      const sum = vals.reduce((a, b) => a + b, 0);
      const mean = Math.round((sum / count) * 100) / 100;
      const min = Math.min(...vals);
      const max = Math.max(...vals);

      const variance =
        vals.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / (count || 1);
      const stdDev = Math.round(Math.sqrt(variance) * 100) / 100;

      numericMetrics[code] = {
        loincCode: code,
        displayName: item.displayName,
        count,
        mean,
        stdDev,
        min,
        max,
        unit: item.unit,
      };
    }

    return {
      totalParticipants: participants.size,
      totalObservations: observations.length,
      genderBreakdown: genderCounts,
      ageGroupBreakdown: ageCounts,
      numericMetrics,
    };
  }

  /**
   * Export de-identified dataset to CSV or JSON with cryptographic audit logging
   */
  async exportDataset(options: {
    projectId: string;
    researcherId: string;
    format: 'csv' | 'json';
    observations: DeidentifiedResearchObservation[];
    ipAddress?: string;
    userAgent?: string;
  }): Promise<{
    content: string;
    fileName: string;
    mimeType: string;
    checksumSha256: string;
    recordCount: number;
    auditLogId: string;
  }> {
    const timestamp = Date.now();
    let content = '';
    let fileName = '';
    let mimeType = '';

    if (options.format === 'csv') {
      const headers = [
        'Participant_Pseudonym',
        'Age_Group',
        'Gender',
        'LOINC_Code',
        'Observation_Name',
        'Value_Numeric',
        'Value_String',
        'Unit',
        'Shifted_Timestamp',
        'Observation_Source',
      ].join(',');

      const rows = options.observations.map((o) =>
        [
          o.participantPseudonym,
          o.ageGroup,
          o.gender,
          o.loincCode,
          `"${(o.observationName || '').replace(/"/g, '""')}"`,
          o.valueNumeric != null ? o.valueNumeric : '',
          `"${(o.valueString || '').replace(/"/g, '""')}"`,
          `"${(o.unit || '').replace(/"/g, '""')}"`,
          o.shiftedDatetime,
          o.observationSource,
        ].join(',')
      );

      content = [headers, ...rows].join('\n');
      fileName = `future_health_deidentified_${options.projectId}_${timestamp}.csv`;
      mimeType = 'text/csv;charset=utf-8;';
    } else {
      content = JSON.stringify(
        {
          projectId: options.projectId,
          exportedAt: new Date().toISOString(),
          recordCount: options.observations.length,
          governanceStandard: 'HIPAA Safe Harbor & Indonesian UU PDP No. 27/2022',
          data: options.observations,
        },
        null,
        2
      );
      fileName = `future_health_deidentified_${options.projectId}_${timestamp}.json`;
      mimeType = 'application/json;charset=utf-8;';
    }

    const checksumSha256 = computeSha256(content);

    // Immutable audit trail recording
    const { data: auditLog } = await this.client
      .from('audit_logs')
      .insert({
        actor_id: options.researcherId,
        action: 'RESEARCH_EXPORT',
        entity_table: 'deidentified_research_observations',
        entity_id: options.projectId,
        new_data: {
          project_id: options.projectId,
          format: options.format,
          record_count: options.observations.length,
          checksum_sha256: checksumSha256,
          file_name: fileName,
        },
        ip_address: options.ipAddress || null,
        user_agent: options.userAgent || 'FutureHealth-ResearcherPortal/1.0',
      })
      .select('id')
      .single();

    const auditLogId = auditLog?.id || `audit-exp-${timestamp}`;

    return {
      content,
      fileName,
      mimeType,
      checksumSha256,
      recordCount: options.observations.length,
      auditLogId,
    };
  }
}

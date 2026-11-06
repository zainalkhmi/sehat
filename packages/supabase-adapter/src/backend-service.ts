import { SupabaseClient } from '@supabase/supabase-js';
import {
  SpeziBackendService,
  SpeziSchedulerState,
  SpeziTask,
  SpeziOutcome,
} from './types.ts';
import {
  calculateQuestionnaireScore,
  VitalSignObservation,
} from '@future-health/domain';

export class SupabaseBackendService implements SpeziBackendService {
  private userId: string | null = null;
  private initialized = false;

  constructor(private client: SupabaseClient) {}

  async initialize(): Promise<void> {
    this.initialized = true;
  }

  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  async loadSchedulerState(): Promise<SpeziSchedulerState | null> {
    if (!this.userId) return null;
    const [tasks, outcomes] = await Promise.all([
      this.getTasks(),
      this.getOutcomes(),
    ]);
    return { tasks, outcomes };
  }

  async saveSchedulerState(state: SpeziSchedulerState): Promise<void> {
    // State is persisted transactionally through task/outcome calls
  }

  async createTask(task: SpeziTask): Promise<SpeziTask> {
    if (!this.userId) throw new Error('User not authenticated');
    const { data, error } = await this.client
      .from('tasks')
      .insert({
        id: task.id,
        patient_id: this.userId,
        title: task.title,
        category: task.category,
        schedule: task.schedule,
        questionnaire_id: task.questionnaireId,
      })
      .select()
      .single();

    if (error) throw error;
    return task;
  }

  async updateTask(task: SpeziTask): Promise<SpeziTask> {
    if (!this.userId) throw new Error('User not authenticated');
    const { error } = await this.client
      .from('tasks')
      .update({
        title: task.title,
        category: task.category,
        schedule: task.schedule,
        questionnaire_id: task.questionnaireId,
      })
      .eq('id', task.id)
      .eq('patient_id', this.userId);

    if (error) throw error;
    return task;
  }

  async deleteTask(taskId: string): Promise<void> {
    if (!this.userId) throw new Error('User not authenticated');
    const { error } = await this.client
      .from('tasks')
      .delete()
      .eq('id', taskId)
      .eq('patient_id', this.userId);

    if (error) throw error;
  }

  async getTasks(): Promise<SpeziTask[]> {
    if (!this.userId) return [];
    const { data, error } = await this.client
      .from('tasks')
      .select('*')
      .eq('patient_id', this.userId);

    if (error) {
      console.warn('Could not fetch tasks:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      category: row.category,
      schedule: row.schedule,
      questionnaireId: row.questionnaire_id,
    }));
  }

  async createOutcome(outcome: SpeziOutcome): Promise<SpeziOutcome> {
    if (!this.userId) throw new Error('User not authenticated');
    const { error } = await this.client
      .from('outcomes')
      .insert({
        id: outcome.id,
        patient_id: this.userId,
        completed_at: outcome.completedAt.toISOString(),
        data: outcome,
      });

    if (error) throw error;
    return outcome;
  }

  async getOutcomes(): Promise<SpeziOutcome[]> {
    if (!this.userId) return [];
    const { data, error } = await this.client
      .from('outcomes')
      .select('*')
      .eq('patient_id', this.userId);

    if (error) {
      console.warn('Could not fetch outcomes:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      completedAt: new Date(row.completed_at),
      ...row.data,
    }));
  }

  /**
   * Fetch questionnaire definition by ID
   */
  async getQuestionnaire(id: string): Promise<any | null> {
    const { data, error } = await this.client
      .from('questionnaires')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.warn(`Could not fetch questionnaire ${id}:`, error.message);
      return null;
    }
    return data;
  }

  /**
   * Save questionnaire response with automated clinical scoring
   */
  async saveQuestionnaireResponse(response: any): Promise<void> {
    if (!this.userId) throw new Error('User not authenticated');

    // Extract questionnaire ID (supports Spezi FHIR QuestionnaireResponse format or direct format)
    const questionnaireId =
      response.questionnaireId ||
      response.questionnaire?.replace(/^Questionnaire\//, '') ||
      'unknown';

    // Normalize answers to map { linkId: value }
    const answers: Record<string, any> = {};
    if (response.answers && typeof response.answers === 'object') {
      Object.assign(answers, response.answers);
    } else if (Array.isArray(response.item)) {
      for (const item of response.item) {
        if (item.linkId && item.answer?.[0]) {
          const ans = item.answer[0];
          answers[item.linkId] =
            ans.valueInteger ??
            ans.valueCoding?.code ??
            ans.valueString ??
            ans.valueBoolean ??
            ans.valueDecimal;
        }
      }
    }

    // Automatically calculate standard clinical score
    const scoreResult = calculateQuestionnaireScore(questionnaireId, answers);

    const { error } = await this.client
      .from('questionnaire_responses')
      .insert({
        id: response.id || crypto.randomUUID(),
        questionnaire_id: questionnaireId,
        patient_id: this.userId,
        task_id: response.taskId || response.basedOn?.[0]?.identifier?.value,
        status: response.status || 'completed',
        authored: response.authored || new Date().toISOString(),
        calculated_score: scoreResult.totalScore,
        answers,
      });

    if (error) throw error;
  }

  async getQuestionnaireResponses(taskId?: string): Promise<any[]> {
    if (!this.userId) return [];
    let query = this.client
      .from('questionnaire_responses')
      .select('*')
      .eq('patient_id', this.userId)
      .order('authored', { ascending: false });

    if (taskId) {
      query = query.eq('task_id', taskId);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Could not fetch questionnaire responses:', error.message);
      return [];
    }
    return data || [];
  }

  /**
   * Clinician view: Fetch responses for assigned patient
   */
  async getPatientQuestionnaireResponses(patientId: string): Promise<any[]> {
    const { data, error } = await this.client
      .from('questionnaire_responses')
      .select('*, questionnaires(title, description)')
      .eq('patient_id', patientId)
      .order('authored', { ascending: false });

    if (error) {
      console.warn(`Could not fetch responses for patient ${patientId}:`, error.message);
      return [];
    }
    return data || [];
  }

  /**
   * Save a physiological vital sign observation
   */
  async saveObservation(
    obs: Omit<VitalSignObservation, 'id' | 'createdAt'> & { id?: string }
  ): Promise<VitalSignObservation> {
    const patientId = obs.patientId || this.userId;
    if (!patientId) throw new Error('Patient ID required');

    const id = obs.id || crypto.randomUUID();
    const effectiveDatetime = obs.effectiveDateTime || new Date().toISOString();

    const { data, error } = await this.client
      .from('observations')
      .insert({
        id,
        patient_id: patientId,
        performer_id: this.userId,
        status: obs.status || 'final',
        category: obs.category || 'vital-signs',
        loinc_code: obs.loincCode,
        display_name: obs.displayName,
        value_numeric: obs.valueNumeric,
        value_string: obs.valueString,
        unit: obs.unit,
        unit_code: obs.unitCode,
        effective_datetime: effectiveDatetime,
        source: obs.source || 'manual',
        device_id: obs.deviceId,
        components_jsonb: obs.components ? obs.components : null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      patientId: data.patient_id,
      status: data.status,
      category: data.category,
      loincCode: data.loinc_code,
      displayName: data.display_name,
      valueNumeric: data.value_numeric ? Number(data.value_numeric) : undefined,
      valueString: data.value_string,
      unit: data.unit,
      unitCode: data.unit_code,
      effectiveDateTime: data.effective_datetime,
      source: data.source,
      deviceId: data.device_id,
      components: data.components_jsonb,
      createdAt: data.created_at,
    };
  }

  /**
   * Query time-series observations
   */
  async getObservations(options: {
    patientId?: string;
    loincCode?: string;
    category?: string;
    limit?: number;
  } = {}): Promise<VitalSignObservation[]> {
    const targetPatient = options.patientId || this.userId;
    if (!targetPatient) return [];

    let query = this.client
      .from('observations')
      .select('*')
      .eq('patient_id', targetPatient)
      .order('effective_datetime', { ascending: false });

    if (options.loincCode) {
      query = query.eq('loinc_code', options.loincCode);
    }
    if (options.category) {
      query = query.eq('category', options.category);
    }
    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) {
      console.warn('Could not fetch observations:', error.message);
      return [];
    }

    return (data || []).map((row: any) => ({
      id: row.id,
      patientId: row.patient_id,
      status: row.status,
      category: row.category,
      loincCode: row.loinc_code,
      displayName: row.display_name,
      valueNumeric: row.value_numeric != null ? Number(row.value_numeric) : undefined,
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

  async syncToRemote(): Promise<void> {}
  async syncFromRemote(): Promise<void> {}
}

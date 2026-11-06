import { SupabaseClient } from '@supabase/supabase-js';
import { ClinicalQuestionnaire, QuestionnaireResponse } from '@future-health/domain';

export class QuestionnaireService {
  constructor(private client: SupabaseClient) {}

  async getActiveQuestionnaires(): Promise<ClinicalQuestionnaire[]> {
    const { data, error } = await this.client
      .from('questionnaires')
      .select('*')
      .eq('status', 'active');

    if (error) throw error;
    return (data || []).map((row: any) => ({
      id: row.id,
      title: row.title,
      description: row.description,
      version: row.version,
      status: row.status,
      items: row.items,
      createdAt: row.created_at,
    }));
  }

  async submitResponse(res: Omit<QuestionnaireResponse, 'id' | 'createdAt'>): Promise<string> {
    const { data, error } = await this.client
      .from('questionnaire_responses')
      .insert({
        questionnaire_id: res.questionnaireId,
        patient_id: res.patientId,
        status: res.status,
        authored: res.authored,
        calculated_score: res.calculatedScore,
        answers: res.answers,
      })
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  }
}


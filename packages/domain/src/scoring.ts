/**
 * Future Health - Clinical Questionnaire Scoring Engine
 * Standard validated clinical instruments:
 *  - PHQ-9 (Patient Health Questionnaire - 9, Depression)
 *  - GAD-7 (General Anxiety Disorder - 7, Anxiety)
 */

export interface QuestionnaireScoreResult {
  questionnaireId: string;
  totalScore: number;
  maxScore: number;
  severity: 'minimal' | 'mild' | 'moderate' | 'moderately_severe' | 'severe';
  severityLabel: string;
  interpretation: string;
  isCriticalAlert: boolean;
  alertMessage?: string;
}

/**
 * Score PHQ-9 (0 - 27 points)
 * Items 1 through 9, each rated 0 (Not at all) to 3 (Nearly every day).
 */
export function scorePHQ9(answers: Record<string, any>): QuestionnaireScoreResult {
  let totalScore = 0;
  let hasSuicidalIdeation = false;

  for (let i = 1; i <= 9; i++) {
    const rawVal =
      answers[String(i)] ??
      answers[`phq9_${i}`] ??
      answers[`q${i}`] ??
      answers[`item_${i}`] ??
      0;

    let score = 0;
    if (typeof rawVal === 'number') {
      score = rawVal;
    } else if (typeof rawVal === 'string') {
      score = parseInt(rawVal, 10) || 0;
    } else if (rawVal && typeof rawVal === 'object' && 'value' in rawVal) {
      score = parseInt(rawVal.value, 10) || 0;
    }

    // Clamp score between 0 and 3
    score = Math.max(0, Math.min(3, score));
    totalScore += score;

    if (i === 9 && score > 0) {
      hasSuicidalIdeation = true;
    }
  }

  let severity: QuestionnaireScoreResult['severity'] = 'minimal';
  let severityLabel = 'Minimal depression';
  let interpretation = 'Patient exhibits little or no depressive symptoms. Routine preventative care recommended.';

  if (totalScore >= 20) {
    severity = 'severe';
    severityLabel = 'Severe depression';
    interpretation = 'Immediate comprehensive clinical evaluation and psychiatric consultation recommended.';
  } else if (totalScore >= 15) {
    severity = 'moderately_severe';
    severityLabel = 'Moderately severe depression';
    interpretation = 'Active clinical treatment with pharmacotherapy and/or structured psychotherapy indicated.';
  } else if (totalScore >= 10) {
    severity = 'moderate';
    severityLabel = 'Moderate depression';
    interpretation = 'Formal clinical treatment plan and follow-up monitoring recommended.';
  } else if (totalScore >= 5) {
    severity = 'mild';
    severityLabel = 'Mild depression';
    interpretation = 'Supportive care, symptom education, and clinical follow-up in 4-6 weeks recommended.';
  }

  return {
    questionnaireId: 'phq-9',
    totalScore,
    maxScore: 27,
    severity,
    severityLabel,
    interpretation,
    isCriticalAlert: hasSuicidalIdeation,
    alertMessage: hasSuicidalIdeation
      ? 'CRITICAL ALERT: Patient reported thoughts of self-harm or suicide (Item 9 > 0). Immediate clinician contact and safety protocol required.'
      : undefined,
  };
}

/**
 * Score GAD-7 (0 - 21 points)
 * Items 1 through 7, each rated 0 (Not at all) to 3 (Nearly every day).
 */
export function scoreGAD7(answers: Record<string, any>): QuestionnaireScoreResult {
  let totalScore = 0;

  for (let i = 1; i <= 7; i++) {
    const rawVal =
      answers[String(i)] ??
      answers[`gad7_${i}`] ??
      answers[`q${i}`] ??
      answers[`item_${i}`] ??
      0;

    let score = 0;
    if (typeof rawVal === 'number') {
      score = rawVal;
    } else if (typeof rawVal === 'string') {
      score = parseInt(rawVal, 10) || 0;
    } else if (rawVal && typeof rawVal === 'object' && 'value' in rawVal) {
      score = parseInt(rawVal.value, 10) || 0;
    }

    score = Math.max(0, Math.min(3, score));
    totalScore += score;
  }

  let severity: QuestionnaireScoreResult['severity'] = 'minimal';
  let severityLabel = 'Minimal anxiety';
  let interpretation = 'Patient exhibits little or no generalized anxiety symptoms.';

  if (totalScore >= 15) {
    severity = 'severe';
    severityLabel = 'Severe anxiety';
    interpretation = 'Active clinical treatment, anxiety disorder evaluation, and psychotherapy recommended.';
  } else if (totalScore >= 10) {
    severity = 'moderate';
    severityLabel = 'Moderate anxiety';
    interpretation = 'Further evaluation for Generalized Anxiety Disorder and lifestyle/psychological interventions recommended.';
  } else if (totalScore >= 5) {
    severity = 'mild';
    severityLabel = 'Mild anxiety';
    interpretation = 'Monitoring, stress reduction, and follow-up assessment recommended.';
  }

  return {
    questionnaireId: 'gad-7',
    totalScore,
    maxScore: 21,
    severity,
    severityLabel,
    interpretation,
    isCriticalAlert: totalScore >= 15,
    alertMessage: totalScore >= 15 ? 'HIGH ALERT: Severe anxiety score detected. Prompt clinician consultation indicated.' : undefined,
  };
}

/**
 * General scoring dispatcher
 */
export function calculateQuestionnaireScore(
  questionnaireId: string,
  answers: Record<string, any>
): QuestionnaireScoreResult {
  const normId = questionnaireId.toLowerCase();
  if (normId.includes('phq') || normId === 'phq-9') {
    return scorePHQ9(answers);
  }
  if (normId.includes('gad') || normId === 'gad-7') {
    return scoreGAD7(answers);
  }

  let sum = 0;
  for (const v of Object.values(answers)) {
    let num = 0;
    if (typeof v === 'number') num = v;
    else if (typeof v === 'string') num = parseInt(v, 10) || 0;
    else if (v && typeof v === 'object' && 'value' in v) num = parseInt(v.value, 10) || 0;
    sum += num;
  }

  return {
    questionnaireId,
    totalScore: sum,
    maxScore: 100,
    severity: 'minimal',
    severityLabel: 'Completed',
    interpretation: 'Survey responses logged.',
    isCriticalAlert: false,
  };
}


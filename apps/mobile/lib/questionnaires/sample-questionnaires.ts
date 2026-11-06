import { Questionnaire, QuestionnaireBuilder } from '@spezivibe/questionnaire';

const CLINICAL_LIKERT_OPTIONS = [
  { value: '0', display: 'Not at all' },
  { value: '1', display: 'Several days' },
  { value: '2', display: 'More than half the days' },
  { value: '3', display: 'Nearly every day' },
];

export const PHQ9_QUESTIONNAIRE: Questionnaire = new QuestionnaireBuilder('phq-9')
  .title('Patient Health Questionnaire - 9 (PHQ-9)')
  .description('Over the last 2 weeks, how often have you been bothered by any of the following problems?')
  .addChoice('1', '1. Little interest or pleasure in doing things', {
    required: true,
    answerOption: CLINICAL_LIKERT_OPTIONS,
  })
  .addChoice('2', '2. Feeling down, depressed, or hopeless', {
    required: true,
    answerOption: CLINICAL_LIKERT_OPTIONS,
  })
  .addChoice('3', '3. Trouble falling or staying asleep, or sleeping too much', {
    required: true,
    answerOption: CLINICAL_LIKERT_OPTIONS,
  })
  .addChoice('4', '4. Feeling tired or having little energy', {
    required: true,
    answerOption: CLINICAL_LIKERT_OPTIONS,
  })
  .addChoice('5', '5. Poor appetite or overeating', {
    required: true,
    answerOption: CLINICAL_LIKERT_OPTIONS,
  })
  .addChoice('6', '6. Feeling bad about yourself - or that you are a failure', {
    required: true,
    answerOption: CLINICAL_LIKERT_OPTIONS,
  })
  .addChoice('7', '7. Trouble concentrating on things (e.g. reading or TV)', {
    required: true,
    answerOption: CLINICAL_LIKERT_OPTIONS,
  })
  .addChoice('8', '8. Moving or speaking slowly, or fidgety/restless', {
    required: true,
    answerOption: CLINICAL_LIKERT_OPTIONS,
  })
  .addChoice('9', '9. Thoughts that you would be better off dead, or hurting yourself', {
    required: true,
    answerOption: CLINICAL_LIKERT_OPTIONS,
  })
  .build();

export const GAD7_QUESTIONNAIRE: Questionnaire = new QuestionnaireBuilder('gad-7')
  .title('General Anxiety Disorder - 7 (GAD-7)')
  .description('Over the last 2 weeks, how often have you been bothered by the following problems?')
  .addChoice('1', '1. Feeling nervous, anxious, or on edge', {
    required: true,
    answerOption: CLINICAL_LIKERT_OPTIONS,
  })
  .addChoice('2', '2. Not being able to stop or control worrying', {
    required: true,
    answerOption: CLINICAL_LIKERT_OPTIONS,
  })
  .addChoice('3', '3. Worrying too much about different things', {
    required: true,
    answerOption: CLINICAL_LIKERT_OPTIONS,
  })
  .addChoice('4', '4. Trouble relaxing', {
    required: true,
    answerOption: CLINICAL_LIKERT_OPTIONS,
  })
  .addChoice('5', '5. Being so restless that it is hard to sit still', {
    required: true,
    answerOption: CLINICAL_LIKERT_OPTIONS,
  })
  .addChoice('6', '6. Becoming easily annoyed or irritable', {
    required: true,
    answerOption: CLINICAL_LIKERT_OPTIONS,
  })
  .addChoice('7', '7. Feeling afraid, as if something awful might happen', {
    required: true,
    answerOption: CLINICAL_LIKERT_OPTIONS,
  })
  .build();

export const WELLNESS_QUESTIONNAIRE: Questionnaire = new QuestionnaireBuilder('wellness-checkin')
  .title('Daily Wellness Check-In')
  .description('Take a moment to reflect on your overall wellness today')
  .addInteger('mood', 'How would you rate your mood today?', {
    required: true,
    min: 1,
    max: 10,
  })
  .addInteger('energy', 'What is your energy level?', {
    required: true,
    min: 1,
    max: 10,
  })
  .addChoice('sleep_quality', 'How was your sleep last night?', {
    required: true,
    answerOption: [
      { value: 'excellent', display: 'Excellent' },
      { value: 'good', display: 'Good' },
      { value: 'fair', display: 'Fair' },
      { value: 'poor', display: 'Poor' },
    ],
  })
  .addInteger('stress_level', 'How stressed do you feel?', {
    required: true,
    min: 1,
    max: 10,
  })
  .addText('notes', 'Additional notes', {
    required: false,
  })
  .build();

export const GRATITUDE_QUESTIONNAIRE: Questionnaire = new QuestionnaireBuilder('gratitude-reflection')
  .title('Evening Gratitude')
  .description('Reflect on the positive moments of your day')
  .addText('grateful_for', 'What are you grateful for today?', {
    required: true,
  })
  .addText('positive_moment', 'Describe a positive moment from today', {
    required: true,
  })
  .addBoolean('helped_someone', 'Did you help someone today?', {
    required: true,
  })
  .addInteger('overall_satisfaction', 'How satisfied are you with today?', {
    required: true,
    min: 1,
    max: 10,
  })
  .build();

export const WEEKLY_REFLECTION_QUESTIONNAIRE: Questionnaire = new QuestionnaireBuilder('weekly-reflection')
  .title('Weekly Reflection')
  .description('Review your progress and set intentions for the week ahead')
  .addDate('reflection_date', 'Week ending date', {
    required: true,
  })
  .addInteger('week_rating', 'Overall, how was your week?', {
    required: true,
    min: 1,
    max: 10,
  })
  .addText('accomplishments', 'What did you accomplish this week?', {
    required: true,
  })
  .addText('challenges', 'What challenges did you face?', {
    required: false,
  })
  .addChoice('self_care', 'How well did you practice self-care?', {
    required: true,
    answerOption: [
      { value: 'excellent', display: 'Excellent - Made it a priority' },
      { value: 'good', display: 'Good - Regular practice' },
      { value: 'fair', display: 'Fair - Could improve' },
      { value: 'poor', display: 'Poor - Needs attention' },
    ],
  })
  .addText('next_week_goals', 'What are your goals for next week?', {
    required: true,
  })
  .build();

export const SAMPLE_QUESTIONNAIRES = [
  PHQ9_QUESTIONNAIRE,
  GAD7_QUESTIONNAIRE,
  WELLNESS_QUESTIONNAIRE,
  GRATITUDE_QUESTIONNAIRE,
  WEEKLY_REFLECTION_QUESTIONNAIRE,
];

export function getQuestionnaireById(id: string): Questionnaire | undefined {
  return SAMPLE_QUESTIONNAIRES.find((q) => q.id === id);
}

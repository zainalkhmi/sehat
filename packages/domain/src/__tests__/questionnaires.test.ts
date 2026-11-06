import { describe, test } from 'node:test';
import assert from 'node:assert/strict';

import {
  scorePHQ9,
  scoreGAD7,
  calculateQuestionnaireScore,
} from '../index.ts';

describe('Clinical Questionnaires Scoring Suite (PHQ-9 & GAD-7)', () => {
  test('PHQ-9 minimal depression (Score 0 - 4)', () => {
    const answers = {
      '1': 0,
      '2': 1,
      '3': 0,
      '4': 1,
      '5': 0,
      '6': 0,
      '7': 0,
      '8': 0,
      '9': 0,
    };
    const result = scorePHQ9(answers);
    assert.strictEqual(result.totalScore, 2);
    assert.strictEqual(result.severity, 'minimal');
    assert.strictEqual(result.isCriticalAlert, false);
    assert.strictEqual(result.alertMessage, undefined);
  });

  test('PHQ-9 mild depression (Score 5 - 9)', () => {
    const answers = {
      '1': 1,
      '2': 1,
      '3': 1,
      '4': 1,
      '5': 1,
      '6': 1,
      '7': 1,
      '8': 0,
      '9': 0,
    };
    const result = scorePHQ9(answers);
    assert.strictEqual(result.totalScore, 7);
    assert.strictEqual(result.severity, 'mild');
    assert.strictEqual(result.isCriticalAlert, false);
  });

  test('PHQ-9 moderate depression (Score 10 - 14)', () => {
    const answers = {
      '1': 2,
      '2': 2,
      '3': 2,
      '4': 1,
      '5': 1,
      '6': 2,
      '7': 1,
      '8': 1,
      '9': 0,
    };
    const result = scorePHQ9(answers);
    assert.strictEqual(result.totalScore, 12);
    assert.strictEqual(result.severity, 'moderate');
    assert.strictEqual(result.isCriticalAlert, false);
  });

  test('PHQ-9 moderately severe depression (Score 15 - 19)', () => {
    const answers = {
      '1': 2,
      '2': 2,
      '3': 2,
      '4': 2,
      '5': 2,
      '6': 2,
      '7': 2,
      '8': 2,
      '9': 0,
    };
    const result = scorePHQ9(answers);
    assert.strictEqual(result.totalScore, 16);
    assert.strictEqual(result.severity, 'moderately_severe');
  });

  test('PHQ-9 severe depression (Score 20 - 27)', () => {
    const answers = {
      '1': 3,
      '2': 3,
      '3': 3,
      '4': 3,
      '5': 2,
      '6': 3,
      '7': 2,
      '8': 2,
      '9': 0,
    };
    const result = scorePHQ9(answers);
    assert.strictEqual(result.totalScore, 21);
    assert.strictEqual(result.severity, 'severe');
  });

  test('PHQ-9 Item 9 triggers Critical Suicidal Ideation Alert even with low total score', () => {
    // Total score is low (only 3), but Question 9 is positive (thoughts of self-harm)
    const answers = {
      '1': 0,
      '2': 1,
      '3': 0,
      '4': 0,
      '5': 0,
      '6': 0,
      '7': 0,
      '8': 0,
      '9': 2, // Positive item 9
    };
    const result = scorePHQ9(answers);
    assert.strictEqual(result.totalScore, 3);
    assert.strictEqual(result.isCriticalAlert, true);
    assert.match(result.alertMessage || '', /CRITICAL ALERT/);
    assert.match(result.alertMessage || '', /Item 9/);
  });

  test('GAD-7 minimal anxiety (Score 0 - 4)', () => {
    const answers = {
      '1': 0,
      '2': 1,
      '3': 0,
      '4': 0,
      '5': 1,
      '6': 0,
      '7': 0,
    };
    const result = scoreGAD7(answers);
    assert.strictEqual(result.totalScore, 2);
    assert.strictEqual(result.severity, 'minimal');
    assert.strictEqual(result.isCriticalAlert, false);
  });

  test('GAD-7 mild anxiety (Score 5 - 9)', () => {
    const answers = {
      '1': 1,
      '2': 1,
      '3': 1,
      '4': 1,
      '5': 1,
      '6': 1,
      '7': 1,
    };
    const result = scoreGAD7(answers);
    assert.strictEqual(result.totalScore, 7);
    assert.strictEqual(result.severity, 'mild');
  });

  test('GAD-7 moderate anxiety (Score 10 - 14)', () => {
    const answers = {
      '1': 2,
      '2': 2,
      '3': 2,
      '4': 1,
      '5': 2,
      '6': 1,
      '7': 1,
    };
    const result = scoreGAD7(answers);
    assert.strictEqual(result.totalScore, 11);
    assert.strictEqual(result.severity, 'moderate');
  });

  test('GAD-7 severe anxiety (Score 15 - 21) triggers High Alert', () => {
    const answers = {
      '1': 3,
      '2': 3,
      '3': 3,
      '4': 2,
      '5': 2,
      '6': 2,
      '7': 2,
    };
    const result = scoreGAD7(answers);
    assert.strictEqual(result.totalScore, 17);
    assert.strictEqual(result.severity, 'severe');
    assert.strictEqual(result.isCriticalAlert, true);
  });

  test('calculateQuestionnaireScore correctly dispatches by questionnaire ID', () => {
    const phqResult = calculateQuestionnaireScore('phq-9', { '1': 3, '2': 3, '9': 1 });
    assert.strictEqual(phqResult.questionnaireId, 'phq-9');
    assert.strictEqual(phqResult.totalScore, 7);
    assert.strictEqual(phqResult.isCriticalAlert, true);

    const gadResult = calculateQuestionnaireScore('gad-7', { '1': 2, '2': 2, '3': 2 });
    assert.strictEqual(gadResult.questionnaireId, 'gad-7');
    assert.strictEqual(gadResult.totalScore, 6);

    const customResult = calculateQuestionnaireScore('custom-diet', { calories: 500, hydration: 2 });
    assert.strictEqual(customResult.totalScore, 502);
  });
});

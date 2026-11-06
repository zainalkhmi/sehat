'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { scorePHQ9, scoreGAD7 } from '@future-health/domain';

interface ClinicalSubmission {
  id: string;
  patientId: string;
  patientName: string;
  mrn: string;
  questionnaireId: 'phq-9' | 'gad-7';
  title: string;
  submittedAt: string;
  answers: Record<string, number>;
  previousScore?: number;
}

const MOCK_SUBMISSIONS: ClinicalSubmission[] = [
  {
    id: 'sub-001',
    patientId: 'pt-101',
    patientName: 'Ahmad Kusuma',
    mrn: 'FH-PT-100234',
    questionnaireId: 'phq-9',
    title: 'Patient Health Questionnaire - 9 (Depression)',
    submittedAt: '2026-11-04T09:15:00Z',
    previousScore: 16,
    answers: {
      '1': 2,
      '2': 3,
      '3': 2,
      '4': 2,
      '5': 1,
      '6': 2,
      '7': 2,
      '8': 1,
      '9': 1, // Suicidal ideation > 0
    },
  },
  {
    id: 'sub-002',
    patientId: 'pt-102',
    patientName: 'Siti Rahma',
    mrn: 'FH-PT-100235',
    questionnaireId: 'gad-7',
    title: 'General Anxiety Disorder - 7 (Anxiety)',
    submittedAt: '2026-11-04T08:30:00Z',
    previousScore: 8,
    answers: {
      '1': 2,
      '2': 2,
      '3': 2,
      '4': 1,
      '5': 1,
      '6': 2,
      '7': 1,
    },
  },
  {
    id: 'sub-003',
    patientId: 'pt-103',
    patientName: 'Budi Santoso',
    mrn: 'FH-PT-100236',
    questionnaireId: 'phq-9',
    title: 'Patient Health Questionnaire - 9 (Depression)',
    submittedAt: '2026-11-03T16:00:00Z',
    previousScore: 6,
    answers: {
      '1': 1,
      '2': 0,
      '3': 1,
      '4': 1,
      '5': 0,
      '6': 0,
      '7': 0,
      '8': 0,
      '9': 0,
    },
  },
];

const PHQ9_QUESTIONS: Record<string, string> = {
  '1': 'Little interest or pleasure in doing things',
  '2': 'Feeling down, depressed, or hopeless',
  '3': 'Trouble falling/staying asleep, or sleeping too much',
  '4': 'Feeling tired or having little energy',
  '5': 'Poor appetite or overeating',
  '6': 'Feeling bad about yourself, or that you are a failure',
  '7': 'Trouble concentrating on reading or watching TV',
  '8': 'Moving/speaking slowly or being restless/fidgety',
  '9': 'Thoughts that you would be better off dead, or hurting yourself',
};

const GAD7_QUESTIONS: Record<string, string> = {
  '1': 'Feeling nervous, anxious, or on edge',
  '2': 'Not being able to stop or control worrying',
  '3': 'Worrying too much about different things',
  '4': 'Trouble relaxing',
  '5': 'Being so restless that it is hard to sit still',
  '6': 'Becoming easily annoyed or irritable',
  '7': 'Feeling afraid, as if something awful might happen',
};

const LIKERT_LABELS: Record<number, string> = {
  0: 'Not at all (0)',
  1: 'Several days (1)',
  2: 'More than half the days (2)',
  3: 'Nearly every day (3)',
};

export default function DoctorQuestionnairesPage() {
  const [selectedSubmission, setSelectedSubmission] = useState<ClinicalSubmission>(MOCK_SUBMISSIONS[0]);
  const [filterType, setFilterType] = useState<'all' | 'phq-9' | 'gad-7'>('all');
  const [reviewedIds, setReviewedIds] = useState<string[]>([]);
  const [clinicalNote, setClinicalNote] = useState('');
  const [noteSaved, setNoteSaved] = useState(false);

  const filteredSubmissions = MOCK_SUBMISSIONS.filter((sub) => {
    if (filterType === 'all') return true;
    return sub.questionnaireId === filterType;
  });

  const activeScore =
    selectedSubmission.questionnaireId === 'phq-9'
      ? scorePHQ9(selectedSubmission.answers)
      : scoreGAD7(selectedSubmission.answers);

  const isReviewed = reviewedIds.includes(selectedSubmission.id);

  const handleMarkReviewed = () => {
    if (!reviewedIds.includes(selectedSubmission.id)) {
      setReviewedIds([...reviewedIds, selectedSubmission.id]);
    }
  };

  const handleSaveNote = () => {
    if (!clinicalNote) return;
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/doctor"
              className="text-xs font-semibold uppercase tracking-wider text-teal-600 hover:text-teal-700"
            >
              &larr; Doctor Portal
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-500 uppercase">Questionnaire Roster</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">Clinical Questionnaire Review</h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/dashboard/doctor/risk-assessments"
            className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 border border-indigo-200 rounded-md hover:bg-indigo-100 text-indigo-700 flex items-center gap-1"
          >
            <span>🧠 AI Risk Queue</span>
          </Link>
          <Link
            href="/dashboard/doctor/patients"
            className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md hover:bg-slate-50 text-slate-700"
          >
            Assigned Patients
          </Link>
          <div className="flex items-center bg-slate-100 rounded-lg p-1 border border-slate-200 text-xs">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded font-medium transition ${
                filterType === 'all' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({MOCK_SUBMISSIONS.length})
            </button>
            <button
              onClick={() => setFilterType('phq-9')}
              className={`px-3 py-1 rounded font-medium transition ${
                filterType === 'phq-9' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              PHQ-9 Depression
            </button>
            <button
              onClick={() => setFilterType('gad-7')}
              className={`px-3 py-1 rounded font-medium transition ${
                filterType === 'gad-7' ? 'bg-white shadow text-slate-900' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              GAD-7 Anxiety
            </button>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Submissions List */}
        <section className="lg:col-span-5 space-y-3">
          <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
            Recent Patient Submissions ({filteredSubmissions.length})
          </h2>

          <div className="space-y-2">
            {filteredSubmissions.map((sub) => {
              const score =
                sub.questionnaireId === 'phq-9' ? scorePHQ9(sub.answers) : scoreGAD7(sub.answers);
              const isSelected = selectedSubmission.id === sub.id;
              const reviewed = reviewedIds.includes(sub.id);

              return (
                <div
                  key={sub.id}
                  onClick={() => setSelectedSubmission(sub)}
                  className={`p-4 rounded-xl border cursor-pointer transition text-left bg-white ${
                    isSelected
                      ? 'border-teal-600 ring-2 ring-teal-500/20 shadow-sm'
                      : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-800 text-sm">{sub.patientName}</span>
                        <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-mono">
                          {sub.mrn}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{sub.title}</p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          score.severity === 'severe' || score.severity === 'moderately_severe'
                            ? 'bg-rose-100 text-rose-800'
                            : score.severity === 'moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : score.severity === 'mild'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {score.totalScore}/{score.maxScore}
                      </span>
                    </div>
                  </div>

                  {score.isCriticalAlert && (
                    <div className="mt-2.5 px-2.5 py-1 bg-red-50 border border-red-200 rounded text-xs text-red-700 font-semibold flex items-center gap-1.5">
                      <span>⚠️</span>
                      <span>Item 9 Suicidal Ideation Alert</span>
                    </div>
                  )}

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                    <span>{new Date(sub.submittedAt).toLocaleString()}</span>
                    <span>{reviewed ? '✓ Reviewed' : '● Needs Review'}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Selected Submission Inspector */}
        <section className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Header Card */}
            <div className="p-6 border-b border-slate-100">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-slate-800">{selectedSubmission.patientName}</h3>
                    <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      MRN: {selectedSubmission.mrn}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{selectedSubmission.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Completed: {new Date(selectedSubmission.submittedAt).toLocaleString()}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleMarkReviewed}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                      isReviewed
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-teal-600 text-white hover:bg-teal-700 shadow-sm'
                    }`}
                  >
                    {isReviewed ? '✓ Clinician Verified' : 'Mark as Reviewed'}
                  </button>
                </div>
              </div>

              {/* Critical Safety Alert Banner */}
              {activeScore.isCriticalAlert && (
                <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-600 rounded-r-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-xl">🚨</span>
                    <div>
                      <h4 className="text-sm font-bold text-red-900">Critical Patient Safety Flag</h4>
                      <p className="text-xs text-red-800 mt-0.5">{activeScore.alertMessage}</p>
                      <div className="mt-2 flex gap-2">
                        <button
                          onClick={() => alert(`Initiating priority outreach for ${selectedSubmission.patientName}`)}
                          className="px-2.5 py-1 bg-red-600 text-white text-xs font-bold rounded hover:bg-red-700"
                        >
                          Direct Patient Outreach
                        </button>
                        <button
                          onClick={() => alert(`Crisis protocol logged for MRN ${selectedSubmission.mrn}`)}
                          className="px-2.5 py-1 bg-white border border-red-300 text-red-700 text-xs font-semibold rounded hover:bg-red-50"
                        >
                          Log Safety Protocol
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Score & Longitudinal Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-xs font-medium text-slate-500 uppercase">Total Score</span>
                  <div className="text-2xl font-black text-slate-800 mt-1">
                    {activeScore.totalScore}
                    <span className="text-sm font-normal text-slate-400"> / {activeScore.maxScore}</span>
                  </div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-xs font-medium text-slate-500 uppercase">Severity Classification</span>
                  <div className="text-sm font-bold text-slate-800 mt-1.5">{activeScore.severityLabel}</div>
                </div>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200">
                  <span className="text-xs font-medium text-slate-500 uppercase">Longitudinal Delta</span>
                  <div className="text-sm font-bold text-slate-800 mt-1.5 flex items-center gap-1">
                    {selectedSubmission.previousScore !== undefined ? (
                      <>
                        <span>Previous: {selectedSubmission.previousScore}</span>
                        <span
                          className={`text-xs font-extrabold ${
                            activeScore.totalScore > selectedSubmission.previousScore
                              ? 'text-rose-600'
                              : 'text-emerald-600'
                          }`}
                        >
                          ({activeScore.totalScore > selectedSubmission.previousScore ? '↑ +' : '↓ '}
                          {activeScore.totalScore - selectedSubmission.previousScore})
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-400 font-normal">Baseline Intake</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Clinical Interpretation */}
              <div className="mt-3 p-3 bg-teal-50/60 border border-teal-200/60 rounded-lg text-xs text-teal-900">
                <span className="font-bold">Clinical Guideline: </span>
                {activeScore.interpretation}
              </div>
            </div>

            {/* Item-by-Item Breakdown */}
            <div className="p-6">
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                Questionnaire Item Answers Breakdown
              </h4>

              <div className="space-y-2.5">
                {Object.entries(selectedSubmission.answers).map(([key, val]) => {
                  const questionText =
                    selectedSubmission.questionnaireId === 'phq-9'
                      ? PHQ9_QUESTIONS[key] || `Item ${key}`
                      : GAD7_QUESTIONS[key] || `Item ${key}`;

                  const isCriticalItem = selectedSubmission.questionnaireId === 'phq-9' && key === '9' && val > 0;

                  return (
                    <div
                      key={key}
                      className={`p-3 rounded-lg border flex items-center justify-between gap-4 ${
                        isCriticalItem
                          ? 'bg-rose-50 border-rose-300'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <div className="text-xs">
                        <span className="font-bold text-slate-700 mr-2">Q{key}.</span>
                        <span className="text-slate-700">{questionText}</span>
                      </div>

                      <div className="shrink-0 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-xs font-bold ${
                            val === 3
                              ? 'bg-rose-100 text-rose-800'
                              : val === 2
                              ? 'bg-amber-100 text-amber-800'
                              : val === 1
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {LIKERT_LABELS[val] || `${val} pts`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Clinician Documentation Note Box */}
              <div className="mt-6 pt-4 border-t border-slate-100">
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1">
                  Clinician Review Note (Appends to EHR Encounter)
                </label>
                <textarea
                  rows={3}
                  value={clinicalNote}
                  onChange={(e) => setClinicalNote(e.target.value)}
                  placeholder="Document clinical discussion, medication titration, or follow-up plan..."
                  className="w-full text-xs p-3 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-slate-400">
                    Encrypted and stored in compliance with Indonesian UU PDP No. 27/2022.
                  </span>
                  <div className="flex items-center gap-2">
                    {noteSaved && (
                      <span className="text-xs text-emerald-600 font-semibold">✓ Note saved to record</span>
                    )}
                    <button
                      onClick={handleSaveNote}
                      className="px-3 py-1.5 bg-slate-800 text-white rounded text-xs font-semibold hover:bg-slate-900"
                    >
                      Save Clinical Note
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}


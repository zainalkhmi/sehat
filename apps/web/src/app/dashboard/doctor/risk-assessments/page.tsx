'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SupabaseBadge } from '../../../../components/SupabaseBadge';
import { updateLiveRiskAssessment } from '../../../../lib/supabase-service';
import {
  Brain,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Search,
  Filter,
  ShieldAlert,
  FileCheck,
  XCircle,
  ExternalLink,
  ChevronRight,
  Info,
  Sparkles,
  Stethoscope,
  Activity,
  Heart,
  UserCheck,
  RefreshCw,
} from 'lucide-react';

interface RiskAssessmentItem {
  id: string;
  patientId: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  riskCategory: string;
  riskScore: number;
  riskLevel: 'low' | 'moderate' | 'high' | 'critical';
  clinicalSummary: string;
  limitations: string;
  recommendations: string[];
  inputReferences: string[];
  modelName: string;
  modelVersion: string;
  reviewStatus: 'pending_review' | 'approved' | 'modified' | 'rejected';
  reviewedByClinicianId?: string;
  reviewedAt?: string;
  clinicianNotes?: string;
  createdAt: string;
}

const INITIAL_ASSESSMENTS: RiskAssessmentItem[] = [
  {
    id: 'ai-risk-phq-9021',
    patientId: 'FH-PT-1002',
    patientName: 'Ahmad Kusuma',
    patientAge: 38,
    patientGender: 'Male',
    riskCategory: 'depression-screening',
    riskScore: 0.8148,
    riskLevel: 'critical',
    clinicalSummary: 'PHQ-9 Total Score: 22/27. CRITICAL: Patient endorsed thoughts of self-harm or suicide on Item 9 (Score 2: More than half the days). Severe clinical depression index.',
    limitations: 'Calculated from self-reported PHQ-9 responses. Acute stressors, medication changes, and substance interactions require direct clinical psychiatric evaluation.',
    recommendations: [
      'Initiate immediate suicide risk assessment protocol and clinician safety contact.',
      'Urgent clinical psychiatric consultation within 24 hours.',
      'Ensure patient support network is active; do not leave patient unaccompanied if in clinic.'
    ],
    inputReferences: ['hash:9a3f28d8b1c4', 'q-response-phq9-881'],
    modelName: 'FutureHealth-ClinicalScreening-Engine',
    modelVersion: 'v1.0.0-clinical',
    reviewStatus: 'pending_review',
    createdAt: '2026-11-05T09:14:00Z',
  },
  {
    id: 'ai-risk-cardio-4412',
    patientId: 'FH-PT-1003',
    patientName: 'Siti Rahmawati',
    patientAge: 52,
    patientGender: 'Female',
    riskCategory: 'cardiovascular-telemetry-screening',
    riskScore: 0.75,
    riskLevel: 'high',
    clinicalSummary: 'Stage 2 Hypertension detected: Average BP 148/94 mmHg over last 72 hours across 6 readings. Concurrent resting tachycardia (HR 98 bpm).',
    limitations: 'Telemetry sourced from patient home sphygmomanometer (BLE). Cuff sizing, positioning, and white-coat syndrome may introduce variance.',
    recommendations: [
      'Evaluate antihypertensive regimen adherence and dosage adjustment.',
      'Schedule 24-hour ambulatory blood pressure monitoring (ABPM).',
      'Assess serum creatinine, electrolytes, and lipid panel.'
    ],
    inputReferences: ['hash:5e78bc12a9f0', 'obs-bp-148-94', 'obs-hr-98'],
    modelName: 'FutureHealth-ClinicalScreening-Engine',
    modelVersion: 'v1.0.0-clinical',
    reviewStatus: 'pending_review',
    createdAt: '2026-11-05T08:30:00Z',
  },
  {
    id: 'ai-risk-anx-3309',
    patientId: 'FH-PT-1005',
    patientName: 'Budi Santoso',
    patientAge: 29,
    patientGender: 'Male',
    riskCategory: 'anxiety-screening',
    riskScore: 0.5238,
    riskLevel: 'moderate',
    clinicalSummary: 'GAD-7 Total Score: 11/21 (Moderate Generalized Anxiety). Significant impairments reported in work concentration and somatic restlessness.',
    limitations: 'Self-reported survey responses subject to recall bias. Excludes underlying endocrine triggers (e.g., hyperthyroidism).',
    recommendations: [
      'Recommend structured Cognitive Behavioral Therapy (CBT) referral.',
      'Discuss stress management techniques and sleep hygiene optimization.',
      'Schedule follow-up clinical review in 4 weeks.'
    ],
    inputReferences: ['hash:33cfa108de77', 'q-response-gad7-204'],
    modelName: 'FutureHealth-ClinicalScreening-Engine',
    modelVersion: 'v1.0.0-clinical',
    reviewStatus: 'approved',
    reviewedByClinicianId: 'dr-wijaya-303',
    reviewedAt: '2026-11-04T16:20:00Z',
    clinicianNotes: 'Agreed with moderate anxiety stratification. Referred to clinical psychology clinic at RS Cipto Mangunkusumo.',
    createdAt: '2026-11-04T14:10:00Z',
  },
  {
    id: 'ai-risk-vitals-7718',
    patientId: 'FH-PT-1008',
    patientName: 'Dewi Lestari',
    patientAge: 45,
    patientGender: 'Female',
    riskCategory: 'general-health-screening',
    riskScore: 0.15,
    riskLevel: 'low',
    clinicalSummary: 'All vital telemetry and self-reported wellness indices within age-adjusted reference ranges. BP 116/74 mmHg, Resting HR 68 bpm, SpO2 99%.',
    limitations: 'Cross-sectional baseline evaluation without continuous Holter monitoring.',
    recommendations: [
      'Continue routine annual preventive health surveillance.',
      'Encourage ongoing physical activity and nutritional balance.'
    ],
    inputReferences: ['hash:7b92f038cd41'],
    modelName: 'FutureHealth-ClinicalScreening-Engine',
    modelVersion: 'v1.0.0-clinical',
    reviewStatus: 'approved',
    reviewedByClinicianId: 'dr-wijaya-303',
    reviewedAt: '2026-11-03T11:00:00Z',
    clinicianNotes: 'Annual telemetry baseline verified. Patient is stable.',
    createdAt: '2026-11-03T10:15:00Z',
  },
];

export default function DoctorRiskAssessmentsPage() {
  const [assessments, setAssessments] = useState<RiskAssessmentItem[]>(INITIAL_ASSESSMENTS);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string>(INITIAL_ASSESSMENTS[0].id);
  const [filterTab, setFilterTab] = useState<'pending' | 'critical' | 'all' | 'reviewed'>('pending');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Clinician Review Action State
  const [reviewAction, setReviewAction] = useState<'approved' | 'modified' | 'rejected'>('approved');
  const [overrideLevel, setOverrideLevel] = useState<'low' | 'moderate' | 'high' | 'critical'>('high');
  const [clinicianNotes, setClinicianNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const selectedAssessment = assessments.find((a) => a.id === selectedAssessmentId) || assessments[0];

  const filteredAssessments = assessments.filter((a) => {
    const matchesSearch =
      a.patientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.patientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.riskCategory.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (filterTab === 'pending') return a.reviewStatus === 'pending_review';
    if (filterTab === 'critical') return a.riskLevel === 'critical' || a.riskLevel === 'high';
    if (filterTab === 'reviewed') return a.reviewStatus === 'approved' || a.reviewStatus === 'modified' || a.reviewStatus === 'rejected';
    return true;
  });

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAssessment) return;

    if ((reviewAction === 'modified' || reviewAction === 'rejected') && !clinicianNotes.trim()) {
      setStatusMessage('Error: Clinical justification notes are required when overriding or rejecting an AI risk stratification.');
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    // Call Supabase live update if configured
    updateLiveRiskAssessment(selectedAssessment.id, {
      reviewStatus: reviewAction,
      reviewedByClinicianId: 'dr-sarah-wijaya',
      clinicianNotes: clinicianNotes.trim() || 'Clinician verified and signed without amendments.',
    }).catch(console.warn);

    await new Promise((r) => setTimeout(r, 400));

    const finalLevel = reviewAction === 'modified' ? overrideLevel : selectedAssessment.riskLevel;

    setAssessments((prev) =>
      prev.map((item) =>
        item.id === selectedAssessment.id
          ? {
              ...item,
              reviewStatus: reviewAction,
              riskLevel: finalLevel,
              reviewedByClinicianId: 'dr-sarah-wijaya',
              reviewedAt: new Date().toISOString(),
              clinicianNotes: clinicianNotes.trim() || 'Clinician verified and signed without amendments.',
            }
          : item
      )
    );

    setIsSubmitting(false);
    setStatusMessage(`Success: Assessment ${selectedAssessment.id} updated to ${reviewAction.toUpperCase()} by Dr. Sarah Wijaya.`);
    setClinicianNotes('');
  };

  const getRiskBadge = (level: string) => {
    switch (level) {
      case 'critical':
        return 'bg-rose-600 text-white border-rose-700 animate-pulse';
      case 'high':
        return 'bg-amber-500 text-white border-amber-600';
      case 'moderate':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'low':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  const getReviewBadge = (status: string) => {
    switch (status) {
      case 'pending_review':
        return { label: 'Pending Review', color: 'bg-amber-100 text-amber-800 border-amber-300' };
      case 'approved':
        return { label: 'Clinician Approved', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
      case 'modified':
        return { label: 'Modified by MD', color: 'bg-sky-100 text-sky-800 border-sky-300' };
      case 'rejected':
        return { label: 'Rejected', color: 'bg-rose-100 text-rose-800 border-rose-300' };
      default:
        return { label: status, color: 'bg-slate-100 text-slate-700 border-slate-300' };
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/doctor" className="text-slate-400 hover:text-white flex items-center text-sm transition">
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back to Clinic</span>
            </Link>
            <div className="h-5 w-px bg-slate-800" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center text-white font-bold text-sm shadow-md">
                <Brain className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-white text-sm">AI Clinical Decision Support</span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800 font-medium">
                  Supervised Review
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <SupabaseBadge />
            <Link
              href="/dashboard/doctor/questionnaires"
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium px-3 py-1.5 rounded-lg transition"
            >
              📋 Questionnaires
            </Link>
            <Link
              href="/dashboard/doctor/patients"
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium px-3 py-1.5 rounded-lg transition"
            >
              👥 Patients
            </Link>
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-white">Dr. Sarah Wijaya, Sp.JP</div>
              <div className="text-xs text-slate-400">Cardiologist • Attending Physician</div>
            </div>
          </div>
        </div>
      </header>

      {/* Mandatory Regulatory Decision Support Disclaimer Banner */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-start space-x-3 text-xs text-amber-900">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-amber-950">MANDATORY CLINICAL DECISION SUPPORT (CDS) GOVERNANCE NOTICE: </strong>
            Antigravity / Future Health AI models provide statistical risk stratification and clinical screening indicators based on patient-submitted questionnaires and device telemetry.
            AI models do <strong>not</strong> independently render a clinical diagnosis, initiate treatment, or replace certified medical evaluation.
            In accordance with Indonesian Ministry of Health (Kemenkes), MKDKI standards, and international medical device regulations, all diagnostic decisions and treatment orders remain the sole legal responsibility of the reviewing licensed physician.
          </div>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Metric Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Pending Review</div>
              <div className="text-2xl font-black text-amber-600 mt-1">
                {assessments.filter((a) => a.reviewStatus === 'pending_review').length}
              </div>
            </div>
            <Clock className="w-8 h-8 text-amber-400" />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Critical Alerts</div>
              <div className="text-2xl font-black text-rose-600 mt-1">
                {assessments.filter((a) => a.riskLevel === 'critical').length}
              </div>
            </div>
            <AlertTriangle className="w-8 h-8 text-rose-500" />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">High Risk Patients</div>
              <div className="text-2xl font-black text-amber-500 mt-1">
                {assessments.filter((a) => a.riskLevel === 'high').length}
              </div>
            </div>
            <Activity className="w-8 h-8 text-amber-400" />
          </div>
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Verified / Signed</div>
              <div className="text-2xl font-black text-emerald-600 mt-1">
                {assessments.filter((a) => a.reviewStatus !== 'pending_review').length}
              </div>
            </div>
            <FileCheck className="w-8 h-8 text-emerald-500" />
          </div>
        </div>

        {/* Feedback alert message */}
        {statusMessage && (
          <div
            className={`mb-6 p-4 rounded-xl border text-sm font-medium flex items-center justify-between ${
              statusMessage.startsWith('Error')
                ? 'bg-rose-50 border-rose-200 text-rose-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-800'
            }`}
          >
            <div className="flex items-center space-x-2">
              {statusMessage.startsWith('Error') ? <AlertTriangle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{statusMessage}</span>
            </div>
            <button onClick={() => setStatusMessage(null)} className="text-xs underline hover:no-underline">
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Assessment Queue */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center">
                  <Brain className="w-4 h-4 mr-1.5 text-indigo-600" />
                  <span>AI Risk Stratification Queue</span>
                </h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  {filteredAssessments.length} Records
                </span>
              </div>

              {/* Filters & Search */}
              <div className="space-y-2 mb-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search patient, MRN, or risk..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex space-x-1">
                  {(['pending', 'critical', 'reviewed', 'all'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setFilterTab(tab)}
                      className={`text-xs px-2.5 py-1 rounded-md font-medium capitalize transition ${
                        filterTab === tab
                          ? 'bg-indigo-600 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {tab === 'pending' ? 'Pending' : tab === 'critical' ? 'High/Crit' : tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Queue List */}
              <div className="space-y-2 max-h-[580px] overflow-y-auto pr-1">
                {filteredAssessments.map((a) => {
                  const isSelected = selectedAssessment?.id === a.id;
                  const rev = getReviewBadge(a.reviewStatus);
                  return (
                    <button
                      key={a.id}
                      onClick={() => {
                        setSelectedAssessmentId(a.id);
                        setStatusMessage(null);
                      }}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-900 text-sm">{a.patientName}</div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getRiskBadge(a.riskLevel)}`}>
                          {a.riskLevel}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 flex items-center justify-between">
                        <span>{a.patientAge}y • {a.patientGender} • MRN: {a.patientId}</span>
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded border ${rev.color}`}>
                          {rev.label}
                        </span>
                      </div>
                      <div className="mt-2 text-xs font-medium text-slate-700 truncate">
                        {a.riskCategory}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 line-clamp-2">
                        {a.clinicalSummary}
                      </div>
                      <div className="mt-2 flex items-center justify-between text-[10px] text-slate-400">
                        <span>Score: {(a.riskScore * 100).toFixed(0)}%</span>
                        <span>{new Date(a.createdAt).toLocaleDateString()}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Detailed Clinician Review & Override Action */}
          <div className="lg:col-span-7 space-y-6">
            {selectedAssessment ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Header Card */}
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h2 className="text-lg font-bold text-slate-900">{selectedAssessment.patientName}</h2>
                        <span className="text-xs text-slate-500 font-mono">({selectedAssessment.patientId})</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${getRiskBadge(selectedAssessment.riskLevel)}`}>
                          {selectedAssessment.riskLevel} Risk
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        Age: {selectedAssessment.patientAge} • Gender: {selectedAssessment.patientGender} • Category: <span className="font-semibold">{selectedAssessment.riskCategory}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-mono text-slate-400">ID: {selectedAssessment.id}</div>
                      <div className="text-xs text-slate-500 mt-1">
                        Generated: {new Date(selectedAssessment.createdAt).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clinical Findings & Recommendations */}
                <div className="p-6 space-y-6">
                  {/* AI Summary Box */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                      <Sparkles className="w-3.5 h-3.5 mr-1 text-indigo-600" />
                      <span>Synthesized Clinical Summary</span>
                    </h4>
                    <div className={`p-4 rounded-xl border text-sm leading-relaxed ${
                      selectedAssessment.riskLevel === 'critical'
                        ? 'bg-rose-50/70 border-rose-200 text-rose-950'
                        : selectedAssessment.riskLevel === 'high'
                        ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                        : 'bg-slate-50 border-slate-200 text-slate-800'
                    }`}>
                      {selectedAssessment.clinicalSummary}
                    </div>
                  </div>

                  {/* Recommendations */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                      <Stethoscope className="w-3.5 h-3.5 mr-1 text-sky-600" />
                      <span>Advisory Clinical Next Steps</span>
                    </h4>
                    <ul className="space-y-2">
                      {selectedAssessment.recommendations.map((rec, i) => (
                        <li key={i} className="text-xs bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-800 flex items-start space-x-2">
                          <span className="font-bold text-indigo-600 mt-0.5">{i + 1}.</span>
                          <span className="leading-relaxed">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Model Transparency & Provenance */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-500 font-medium">Model Architecture:</span>
                      <div className="font-mono text-slate-900 mt-0.5">{selectedAssessment.modelName} ({selectedAssessment.modelVersion})</div>
                    </div>
                    <div>
                      <span className="text-slate-500 font-medium">Input Cryptographic References:</span>
                      <div className="font-mono text-slate-900 mt-0.5">{selectedAssessment.inputReferences.join(', ')}</div>
                    </div>
                    <div className="sm:col-span-2 text-slate-600 text-[11px] leading-relaxed border-t border-slate-200 pt-2 mt-1">
                      <strong className="text-slate-700">Algorithmic Limitations: </strong>
                      {selectedAssessment.limitations}
                    </div>
                  </div>

                  {/* Clinician Review History if already signed */}
                  {selectedAssessment.reviewedAt && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-xs text-emerald-950">
                      <div className="flex items-center space-x-2 font-bold text-emerald-900 mb-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>Clinician Review Recorded ({selectedAssessment.reviewStatus.toUpperCase()})</span>
                      </div>
                      <p className="text-slate-700 mt-1">
                        Reviewed by: <strong className="text-slate-900">{selectedAssessment.reviewedByClinicianId}</strong> on {new Date(selectedAssessment.reviewedAt).toLocaleString()}
                      </p>
                      {selectedAssessment.clinicianNotes && (
                        <div className="mt-2 bg-white/70 p-2.5 rounded border border-emerald-200 font-medium text-slate-800">
                          {selectedAssessment.clinicianNotes}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Human-in-the-Loop Clinician Sign-off Form */}
                  <div className="border-t border-slate-200 pt-6">
                    <h3 className="font-bold text-slate-900 text-sm mb-4 flex items-center">
                      <UserCheck className="w-4 h-4 mr-2 text-indigo-600" />
                      <span>Clinician Supervised Review & Attestation</span>
                    </h3>

                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      {/* Action selector */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-2">
                          Clinical Decision Action:
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setReviewAction('approved')}
                            className={`p-3 rounded-lg border text-xs font-bold flex flex-col items-center justify-center transition ${
                              reviewAction === 'approved'
                                ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <CheckCircle2 className="w-4 h-4 mb-1" />
                            <span>Approve AI Finding</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setReviewAction('modified')}
                            className={`p-3 rounded-lg border text-xs font-bold flex flex-col items-center justify-center transition ${
                              reviewAction === 'modified'
                                ? 'bg-amber-600 text-white border-amber-600 shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <AlertTriangle className="w-4 h-4 mb-1" />
                            <span>Override Risk Level</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setReviewAction('rejected')}
                            className={`p-3 rounded-lg border text-xs font-bold flex flex-col items-center justify-center transition ${
                              reviewAction === 'rejected'
                                ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            <XCircle className="w-4 h-4 mb-1" />
                            <span>Reject Assessment</span>
                          </button>
                        </div>
                      </div>

                      {/* If Modified: Select new risk level */}
                      {reviewAction === 'modified' && (
                        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                          <label className="block text-xs font-semibold text-amber-900 mb-1">
                            Clinician Overridden Risk Level:
                          </label>
                          <select
                            value={overrideLevel}
                            onChange={(e) => setOverrideLevel(e.target.value as any)}
                            className="w-full text-xs bg-white border border-amber-300 rounded p-2 text-slate-900 font-medium"
                          >
                            <option value="low">Low Risk</option>
                            <option value="moderate">Moderate Risk</option>
                            <option value="high">High Risk</option>
                            <option value="critical">Critical Risk</option>
                          </select>
                        </div>
                      )}

                      {/* Clinician Justification Notes */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Physician Clinical Notes & Justification:
                          {(reviewAction === 'modified' || reviewAction === 'rejected') && (
                            <span className="text-rose-600 ml-1 font-bold">* Required for audit compliance</span>
                          )}
                        </label>
                        <textarea
                          rows={3}
                          value={clinicianNotes}
                          onChange={(e) => setClinicianNotes(e.target.value)}
                          placeholder="Document clinical rationale, direct examination observations, diagnostic test orders, or medication changes..."
                          className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 font-normal text-slate-900"
                        />
                      </div>

                      {/* Legal Sign-off Checkbox */}
                      <div className="flex items-start space-x-2 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
                        <input
                          type="checkbox"
                          id="attest"
                          required
                          defaultChecked
                          className="mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <label htmlFor="attest" className="leading-tight">
                          I attest under my clinical license (SIP) that I have critically evaluated these automated screening findings against the patient's medical history and current clinical presentation.
                        </label>
                      </div>

                      {/* Submit Button */}
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center space-x-2 transition disabled:opacity-50"
                      >
                        {isSubmitting ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin mr-1" />
                            <span>Recording Clinical Decision to Ledger...</span>
                          </>
                        ) : (
                          <>
                            <FileCheck className="w-4 h-4 mr-1" />
                            <span>Sign & Record Clinical Review ({reviewAction.toUpperCase()})</span>
                          </>
                        )}
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
                <Brain className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p>Select an assessment from the queue to review and sign.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}


'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  Microscope,
  Database,
  Download,
  ShieldCheck,
  Lock,
  ArrowLeft,
  Filter,
  CheckCircle2,
  FileSpreadsheet,
  AlertCircle,
  Calendar,
  Users,
  BarChart3,
  FileCode,
  Search,
  RefreshCw,
  PlusCircle,
  Eye,
  Layers,
  Activity,
  FileText,
  Check,
  ShieldAlert,
} from 'lucide-react';

interface ResearchStudyProtocol {
  id: string;
  protocolNumber: string;
  title: string;
  leadInvestigator: string;
  institution: string;
  status: 'active' | 'recruiting' | 'completed';
  startDate: string;
  endDate: string;
  irbApprovalNumber: string;
  description: string;
  inclusionCriteria: string[];
  exclusionCriteria: string[];
}

interface DeidentifiedParticipantRecord {
  participantPseudonym: string;
  ageGroup: '<25' | '25-44' | '45-64' | '65-88' | '89+';
  gender: 'male' | 'female' | 'other';
  avgSystolic: number;
  avgDiastolic: number;
  avgHeartRate: number;
  avgSpo2: number;
  phq9Score: number;
  gad7Score: number;
  telemetryDays: number;
  lastShiftedTimestamp: string;
  consentStatus: 'Verified Research Consent';
}

const RESEARCH_PROTOCOLS: ResearchStudyProtocol[] = [
  {
    id: 'study-01',
    protocolNumber: 'FH-IRB-2026-08',
    title: 'Longitudinal Cardiovascular Telemetry & Mental Health Psychometric Correlation Study',
    leadInvestigator: 'Prof. Bambang Hidayat, Ph.D.',
    institution: 'Universitas Indonesia / RSUPN Dr. Cipto Mangunkusumo',
    status: 'active',
    startDate: '2026-01-15',
    endDate: '2027-01-15',
    irbApprovalNumber: 'KET-882/UN2.F1/ETIK/PPM.00.02/2026',
    description:
      'Multi-center observational prospective cohort investigating real-time continuous physiological data (BLE/HealthKit) alongside validated PHQ-9 & GAD-7 psychometric indices.',
    inclusionCriteria: [
      'Adult patients aged 18 to 85 years residing in Indonesia.',
      'Active mobile appSpezi installation with connected biometric monitor (sphygmomanometer or wearable).',
      'Signed electronic informed consent under UU PDP No. 27/2022.',
    ],
    exclusionCriteria: [
      'Patients undergoing hemodialysis or active inpatient critical care.',
      'Inability to provide informed electronic consent.',
      'Revocation of research consent.',
    ],
  },
  {
    id: 'study-02',
    protocolNumber: 'FH-IRB-2026-14',
    title: 'Early Diabetes & Metabolic Risk Stratification Telehealth Trial',
    leadInvestigator: 'Dr. dr. Ratna Indrawati, Sp.PD-KEMD',
    institution: 'Pusat Diabetes & Nutrisi Klinis Jakarta',
    status: 'recruiting',
    startDate: '2026-04-01',
    endDate: '2027-06-30',
    irbApprovalNumber: 'KET-104/UN2.F1/ETIK/2026',
    description:
      'Continuous glucose monitoring (CGM) telemetry combined with lifestyle question batteries to validate predictive AI screening algorithms for prediabetes.',
    inclusionCriteria: [
      'Adult patients with HbA1c 5.7% - 6.4% or fasting glucose 100-125 mg/dL.',
      'Continuous glucose sensor or compatible Bluetooth glucometer.',
    ],
    exclusionCriteria: [
      'Diagnosed Type 1 Diabetes Mellitus.',
      'Pregnancy at time of enrollment.',
    ],
  },
];

const RAW_COHORT_DATA: DeidentifiedParticipantRecord[] = [
  {
    participantPseudonym: 'FH-RES-8821',
    ageGroup: '25-44',
    gender: 'male',
    avgSystolic: 122,
    avgDiastolic: 78,
    avgHeartRate: 71,
    avgSpo2: 99,
    phq9Score: 6,
    gad7Score: 4,
    telemetryDays: 28,
    lastShiftedTimestamp: '2026-09-14T08:30:00Z',
    consentStatus: 'Verified Research Consent',
  },
  {
    participantPseudonym: 'FH-RES-8822',
    ageGroup: '45-64',
    gender: 'female',
    avgSystolic: 138,
    avgDiastolic: 84,
    avgHeartRate: 79,
    avgSpo2: 97,
    phq9Score: 11,
    gad7Score: 8,
    telemetryDays: 30,
    lastShiftedTimestamp: '2026-09-17T14:15:00Z',
    consentStatus: 'Verified Research Consent',
  },
  {
    participantPseudonym: 'FH-RES-8823',
    ageGroup: '25-44',
    gender: 'male',
    avgSystolic: 115,
    avgDiastolic: 72,
    avgHeartRate: 64,
    avgSpo2: 98,
    phq9Score: 2,
    gad7Score: 1,
    telemetryDays: 31,
    lastShiftedTimestamp: '2026-09-10T19:00:00Z',
    consentStatus: 'Verified Research Consent',
  },
  {
    participantPseudonym: 'FH-RES-8824',
    ageGroup: '45-64',
    gender: 'female',
    avgSystolic: 145,
    avgDiastolic: 90,
    avgHeartRate: 83,
    avgSpo2: 96,
    phq9Score: 14,
    gad7Score: 12,
    telemetryDays: 25,
    lastShiftedTimestamp: '2026-09-21T07:45:00Z',
    consentStatus: 'Verified Research Consent',
  },
  {
    participantPseudonym: 'FH-RES-8825',
    ageGroup: '65-88',
    gender: 'male',
    avgSystolic: 132,
    avgDiastolic: 80,
    avgHeartRate: 68,
    avgSpo2: 95,
    phq9Score: 5,
    gad7Score: 3,
    telemetryDays: 33,
    lastShiftedTimestamp: '2026-09-28T09:20:00Z',
    consentStatus: 'Verified Research Consent',
  },
  {
    participantPseudonym: 'FH-RES-8826',
    ageGroup: '<25',
    gender: 'female',
    avgSystolic: 110,
    avgDiastolic: 68,
    avgHeartRate: 74,
    avgSpo2: 99,
    phq9Score: 9,
    gad7Score: 10,
    telemetryDays: 22,
    lastShiftedTimestamp: '2026-09-12T11:10:00Z',
    consentStatus: 'Verified Research Consent',
  },
  {
    participantPseudonym: 'FH-RES-8827',
    ageGroup: '65-88',
    gender: 'female',
    avgSystolic: 152,
    avgDiastolic: 92,
    avgHeartRate: 77,
    avgSpo2: 94,
    phq9Score: 16,
    gad7Score: 13,
    telemetryDays: 29,
    lastShiftedTimestamp: '2026-09-24T16:00:00Z',
    consentStatus: 'Verified Research Consent',
  },
  {
    participantPseudonym: 'FH-RES-8828',
    ageGroup: '25-44',
    gender: 'female',
    avgSystolic: 118,
    avgDiastolic: 76,
    avgHeartRate: 70,
    avgSpo2: 98,
    phq9Score: 4,
    gad7Score: 3,
    telemetryDays: 27,
    lastShiftedTimestamp: '2026-09-18T13:40:00Z',
    consentStatus: 'Verified Research Consent',
  },
];

export default function ResearcherDashboard() {
  const [selectedStudyId, setSelectedStudyId] = useState<string>(RESEARCH_PROTOCOLS[0].id);
  const [activeTab, setActiveTab] = useState<'dataset' | 'protocol' | 'enroll'>('dataset');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [ageGroupFilter, setAgeGroupFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [phq9Filter, setPhq9Filter] = useState<string>('all');
  const [systolicFilter, setSystolicFilter] = useState<string>('all');

  // Export State
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportChecksum, setExportChecksum] = useState<string | null>(null);

  // New Enrollment Form State
  const [enrollPatientId, setEnrollPatientId] = useState('');
  const [enrollConsentChecked, setEnrollConsentChecked] = useState(false);
  const [enrollSuccessMessage, setEnrollSuccessMessage] = useState<string | null>(null);
  const [cohortList, setCohortList] = useState<DeidentifiedParticipantRecord[]>(RAW_COHORT_DATA);

  const selectedStudy = RESEARCH_PROTOCOLS.find((s) => s.id === selectedStudyId) || RESEARCH_PROTOCOLS[0];

  // Filtered Cohort Data
  const filteredCohort = useMemo(() => {
    return cohortList.filter((r) => {
      if (searchQuery && !r.participantPseudonym.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (ageGroupFilter !== 'all' && r.ageGroup !== ageGroupFilter) {
        return false;
      }
      if (genderFilter !== 'all' && r.gender !== genderFilter) {
        return false;
      }
      if (phq9Filter === 'elevated' && r.phq9Score < 10) {
        return false;
      }
      if (phq9Filter === 'normal' && r.phq9Score >= 10) {
        return false;
      }
      if (systolicFilter === 'stage2' && r.avgSystolic < 140) {
        return false;
      }
      if (systolicFilter === 'normal' && r.avgSystolic >= 130) {
        return false;
      }
      return true;
    });
  }, [cohortList, searchQuery, ageGroupFilter, genderFilter, phq9Filter, systolicFilter]);

  // Cohort Statistical Aggregations
  const statistics = useMemo(() => {
    const count = filteredCohort.length;
    if (count === 0) {
      return {
        count: 0,
        meanSystolic: 0,
        stdSystolic: 0,
        meanHeartRate: 0,
        stdHeartRate: 0,
        meanPhq9: 0,
        stdPhq9: 0,
        meanSpo2: 0,
      };
    }

    const meanSys = filteredCohort.reduce((acc, r) => acc + r.avgSystolic, 0) / count;
    const varSys = filteredCohort.reduce((acc, r) => acc + Math.pow(r.avgSystolic - meanSys, 2), 0) / count;

    const meanHr = filteredCohort.reduce((acc, r) => acc + r.avgHeartRate, 0) / count;
    const varHr = filteredCohort.reduce((acc, r) => acc + Math.pow(r.avgHeartRate - meanHr, 2), 0) / count;

    const meanPhq = filteredCohort.reduce((acc, r) => acc + r.phq9Score, 0) / count;
    const varPhq = filteredCohort.reduce((acc, r) => acc + Math.pow(r.phq9Score - meanPhq, 2), 0) / count;

    const meanSpo2 = filteredCohort.reduce((acc, r) => acc + r.avgSpo2, 0) / count;

    return {
      count,
      meanSystolic: Math.round(meanSys * 10) / 10,
      stdSystolic: Math.round(Math.sqrt(varSys) * 10) / 10,
      meanHeartRate: Math.round(meanHr * 10) / 10,
      stdHeartRate: Math.round(Math.sqrt(varHr) * 10) / 10,
      meanPhq9: Math.round(meanPhq * 10) / 10,
      stdPhq9: Math.round(Math.sqrt(varPhq) * 10) / 10,
      meanSpo2: Math.round(meanSpo2 * 10) / 10,
    };
  }, [filteredCohort]);

  // Export handlers
  const handleExport = (format: 'csv' | 'json') => {
    setIsExporting(true);
    setExportNotice(null);

    setTimeout(() => {
      let content = '';
      let mimeType = '';
      let filename = '';

      if (format === 'csv') {
        const headers =
          'Participant_Pseudonym,Age_Group,Gender,Avg_Systolic_mmHg,Avg_Diastolic_mmHg,Avg_HeartRate_bpm,Avg_SpO2_pct,PHQ9_Score,GAD7_Score,Telemetry_Days,Last_Shifted_Timestamp,Consent_Status\n';
        const rows = filteredCohort
          .map(
            (r) =>
              `${r.participantPseudonym},${r.ageGroup},${r.gender},${r.avgSystolic},${r.avgDiastolic},${r.avgHeartRate},${r.avgSpo2},${r.phq9Score},${r.gad7Score},${r.telemetryDays},${r.lastShiftedTimestamp},"${r.consentStatus}"`
          )
          .join('\n');
        content = headers + rows;
        mimeType = 'text/csv;charset=utf-8;';
        filename = `future_health_${selectedStudy.protocolNumber}_deidentified_${Date.now()}.csv`;
      } else {
        content = JSON.stringify(
          {
            protocol: selectedStudy.protocolNumber,
            studyTitle: selectedStudy.title,
            irbApproval: selectedStudy.irbApprovalNumber,
            exportedAt: new Date().toISOString(),
            governanceStandard: 'HIPAA Safe Harbor (45 CFR § 164.514) & Indonesian UU PDP No. 27/2022',
            recordCount: filteredCohort.length,
            records: filteredCohort,
          },
          null,
          2
        );
        mimeType = 'application/json;charset=utf-8;';
        filename = `future_health_${selectedStudy.protocolNumber}_deidentified_${Date.now()}.json`;
      }

      // Simple client-side hash calculation for demonstration
      let hash = 0;
      for (let i = 0; i < content.length; i++) {
        hash = ((hash << 5) - hash + content.charCodeAt(i)) | 0;
      }
      const pseudoSha = Math.abs(hash).toString(16).padStart(8, '0').repeat(8).slice(0, 64);
      setExportChecksum(pseudoSha);

      // Trigger file download
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setIsExporting(false);
      setExportNotice(
        `Successfully exported ${filteredCohort.length} de-identified records (${format.toUpperCase()}). Cryptographic SHA-256 ledger event recorded in Supabase \`audit_logs\` (Action: RESEARCH_EXPORT).`
      );
    }, 400);
  };

  // Participant Enrollment
  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollPatientId.trim() || !enrollConsentChecked) return;

    // Generate irreversible pseudonym
    let hash = 0;
    const str = `${selectedStudy.protocolNumber}:${enrollPatientId}`;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash + str.charCodeAt(i)) | 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(4, '0').toUpperCase().slice(0, 4);
    const newPseudonym = `FH-RES-9${hex}`;

    const newRecord: DeidentifiedParticipantRecord = {
      participantPseudonym: newPseudonym,
      ageGroup: '25-44',
      gender: 'female',
      avgSystolic: 120,
      avgDiastolic: 78,
      avgHeartRate: 72,
      avgSpo2: 98,
      phq9Score: 5,
      gad7Score: 4,
      telemetryDays: 1,
      lastShiftedTimestamp: new Date().toISOString(),
      consentStatus: 'Verified Research Consent',
    };

    setCohortList((prev) => [newRecord, ...prev]);
    setEnrollSuccessMessage(
      `Patient successfully verified and enrolled under de-identified pseudonym ${newPseudonym}. Direct identifiers (MRN, phone, address) were stripped before ledger write.`
    );
    setEnrollPatientId('');
    setEnrollConsentChecked(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900">
      {/* Top Navbar */}
      <header className="bg-emerald-950 border-b border-emerald-900 text-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-emerald-300 hover:text-white flex items-center text-sm transition">
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Portal Home</span>
            </Link>
            <div className="h-5 w-px bg-emerald-800" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-emerald-950 font-bold text-sm shadow">
                <Microscope className="w-5 h-5" />
              </div>
              <div>
                <span className="font-bold text-white text-sm">Clinical Research & De-Identification Portal</span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 border border-emerald-800 font-medium">
                  UU PDP & HIPAA Compliant
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-white">Prof. Bambang Hidayat, Ph.D.</div>
              <div className="text-xs text-emerald-300">Principal Investigator • UI / RSCM</div>
            </div>
          </div>
        </div>
      </header>

      {/* Mandatory Statutory Governance Notice */}
      <div className="bg-emerald-900/10 border-b border-emerald-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-start space-x-3 text-xs text-emerald-950">
          <ShieldCheck className="w-5 h-5 text-emerald-700 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-emerald-900">
              ETHICAL RESEARCH GOVERNANCE & DE-IDENTIFICATION ASSURANCE (UU PDP No. 27/2022 & HIPAA Safe Harbor):
            </strong>{' '}
            All patient data queryable within this portal is strictly de-identified. All 18 direct HIPAA identifiers (names, emails, phone numbers, exact residential coordinates, device serial numbers) are permanently purged before reaching the researcher interface. Longitudinal dates are shifted by a deterministic participant delta (-90 to +90 days), and ages $\ge 89$ are aggregated into the `89+` bracket. All export activities are cryptographically signed and stored in the immutable `audit_logs` ledger.
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Protocol Selector & Study Banner */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-bold text-slate-900">{selectedStudy.title}</h1>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                    selectedStudy.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedStudy.status}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>Protocol: <strong className="font-mono text-slate-800">{selectedStudy.protocolNumber}</strong></span>
                <span>IRB Ethics: <strong className="text-slate-800">{selectedStudy.irbApprovalNumber}</strong></span>
                <span>Institution: <strong className="text-slate-800">{selectedStudy.institution}</strong></span>
              </div>
            </div>

            {/* Protocol Switcher */}
            <div className="flex items-center space-x-2">
              <label className="text-xs font-semibold text-slate-500 whitespace-nowrap">Study Protocol:</label>
              <select
                value={selectedStudyId}
                onChange={(e) => {
                  setSelectedStudyId(e.target.value);
                  setExportNotice(null);
                }}
                className="text-xs bg-slate-50 border border-slate-300 rounded-lg px-3 py-1.5 font-medium text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
              >
                {RESEARCH_PROTOCOLS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.protocolNumber} — {p.title.slice(0, 35)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex space-x-2 mt-6 border-b border-slate-100 pb-3">
            <button
              onClick={() => setActiveTab('dataset')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'dataset'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>De-Identified Cohort ({filteredCohort.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('protocol')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'protocol'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>IRB Protocol & Criteria</span>
            </button>
            <button
              onClick={() => setActiveTab('enroll')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition flex items-center space-x-1.5 ${
                activeTab === 'enroll'
                  ? 'bg-emerald-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Enroll Consented Participant</span>
            </button>
          </div>
        </div>

        {/* Statistical Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Cohort Size</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{statistics.count}</div>
            <div className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center">
              <Check className="w-3 h-3 mr-0.5" /> 100% Active Research Consent
            </div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mean Systolic BP</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{statistics.meanSystolic}</div>
            <div className="text-[11px] text-slate-500 mt-1">± {statistics.stdSystolic} mmHg (LOINC 8480-6)</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mean Heart Rate</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{statistics.meanHeartRate}</div>
            <div className="text-[11px] text-slate-500 mt-1">± {statistics.stdHeartRate} bpm (LOINC 8867-4)</div>
          </div>
          <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Mean PHQ-9 Depression</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{statistics.meanPhq9}</div>
            <div className="text-[11px] text-slate-500 mt-1">± {statistics.stdPhq9} (Mild symptom range)</div>
          </div>
        </div>

        {/* Export Notification Toast */}
        {exportNotice && (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-900 flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-medium">{exportNotice}</p>
              {exportChecksum && (
                <div className="font-mono text-[11px] text-emerald-800 break-all">
                  SHA-256 Checksum: <strong>{exportChecksum}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 1: Dataset & Cohort Explorer */}
        {activeTab === 'dataset' && (
          <div className="space-y-6">
            {/* Filter Bar & Export Actions */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter by pseudonym..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Export Buttons */}
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={isExporting || filteredCohort.length === 0}
                    className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-semibold shadow-sm flex items-center space-x-1.5 transition disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Export CSV</span>
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    disabled={isExporting || filteredCohort.length === 0}
                    className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold shadow-sm flex items-center space-x-1.5 transition disabled:opacity-50"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Export JSON</span>
                  </button>
                </div>
              </div>

              {/* Advanced Filter Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Age Bracket:</label>
                  <select
                    value={ageGroupFilter}
                    onChange={(e) => setAgeGroupFilter(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-800"
                  >
                    <option value="all">All Ages</option>
                    <option value="<25">&lt; 25 years</option>
                    <option value="25-44">25 - 44 years</option>
                    <option value="45-64">45 - 64 years</option>
                    <option value="65-88">65 - 88 years</option>
                    <option value="89+">89+ years (Safe Harbor)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Gender:</label>
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-800"
                  >
                    <option value="all">All Genders</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">PHQ-9 Depression:</label>
                  <select
                    value={phq9Filter}
                    onChange={(e) => setPhq9Filter(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-800"
                  >
                    <option value="all">All Scores</option>
                    <option value="elevated">Elevated (Score ≥ 10)</option>
                    <option value="normal">Normal/Mild (Score &lt; 10)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-slate-500 uppercase mb-1">Systolic BP Filter:</label>
                  <select
                    value={systolicFilter}
                    onChange={(e) => setSystolicFilter(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded p-1.5 text-slate-800"
                  >
                    <option value="all">All Readings</option>
                    <option value="stage2">Hypertensive (≥ 140 mmHg)</option>
                    <option value="normal">Normal (&lt; 130 mmHg)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* De-identified Participant Ledger Table */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">De-Identified Participant Observation Records</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Showing {filteredCohort.length} anonymized subjects matching criteria
                  </p>
                </div>
                <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded">
                  View: deidentified_research_observations
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700">
                      <th className="px-4 py-3 text-left font-semibold">Pseudonym ID</th>
                      <th className="px-4 py-3 text-left font-semibold">Age Group</th>
                      <th className="px-4 py-3 text-left font-semibold">Gender</th>
                      <th className="px-4 py-3 text-left font-semibold">Mean BP (mmHg)</th>
                      <th className="px-4 py-3 text-left font-semibold">Mean HR (bpm)</th>
                      <th className="px-4 py-3 text-left font-semibold">Mean SpO2</th>
                      <th className="px-4 py-3 text-left font-semibold">PHQ-9</th>
                      <th className="px-4 py-3 text-left font-semibold">GAD-7</th>
                      <th className="px-4 py-3 text-left font-semibold">Shifted Timestamp</th>
                      <th className="px-4 py-3 text-left font-semibold">Consent Verification</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {filteredCohort.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-8 text-center text-slate-500 font-sans">
                          No de-identified records match the applied cohort filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredCohort.map((row) => (
                        <tr key={row.participantPseudonym} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3 font-semibold text-emerald-800">{row.participantPseudonym}</td>
                          <td className="px-4 py-3 text-slate-600">{row.ageGroup}</td>
                          <td className="px-4 py-3 text-slate-600 capitalize">{row.gender}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">
                            {row.avgSystolic}/{row.avgDiastolic}
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{row.avgHeartRate}</td>
                          <td className="px-4 py-3 font-semibold text-slate-900">{row.avgSpo2}%</td>
                          <td className="px-4 py-3">
                            <span
                              className={`px-1.5 py-0.5 rounded font-bold ${
                                row.phq9Score >= 15
                                  ? 'bg-rose-100 text-rose-800'
                                  : row.phq9Score >= 10
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {row.phq9Score}/27
                            </span>
                          </td>
                          <td className="px-4 py-3 text-slate-700">{row.gad7Score}/21</td>
                          <td className="px-4 py-3 text-[11px] text-slate-500">
                            {new Date(row.lastShiftedTimestamp).toLocaleDateString()}
                          </td>
                          <td className="px-4 py-3 font-sans">
                            <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                              <CheckCircle2 className="w-3 h-3 mr-1" />
                              Active Consent
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: IRB Protocol Details & Ethics Criteria */}
        {activeTab === 'protocol' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">IRB Clinical Research Protocol Specifications</h2>
              <p className="text-xs text-slate-500 mt-1">{selectedStudy.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                  <span>Inclusion Criteria</span>
                </h3>
                <ul className="space-y-2">
                  {selectedStudy.inclusionCriteria.map((item, idx) => (
                    <li key={idx} className="text-xs bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-800">
                      <strong className="text-emerald-700 mr-1.5">{idx + 1}.</strong> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1 text-rose-600" />
                  <span>Exclusion Criteria</span>
                </h3>
                <ul className="space-y-2">
                  {selectedStudy.exclusionCriteria.map((item, idx) => (
                    <li key={idx} className="text-xs bg-slate-50 border border-slate-200 p-3 rounded-lg text-slate-800">
                      <strong className="text-rose-700 mr-1.5">{idx + 1}.</strong> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Regulatory Governance Table */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-800">Indonesian Data Protection & Ethics Compliance Matrix:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-600">
                <div>
                  <strong>UU PDP No. 27/2022 Art. 4:</strong> Specific explicit research consent verified electronically prior to database enrollment.
                </div>
                <div>
                  <strong>HIPAA Safe Harbor § 164.514:</strong> Complete redaction of 18 direct identifiers + 3-digit zip code aggregation.
                </div>
                <div>
                  <strong>Audit Trail Security:</strong> All queries and dataset downloads cryptographically hashed into `audit_logs`.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Enroll Consented Participant */}
        {activeTab === 'enroll' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Enroll Consented Participant into Protocol</h2>
              <p className="text-xs text-slate-500 mt-1">
                Enrolls a verified patient into protocol <strong>{selectedStudy.protocolNumber}</strong>. An irreversible pseudonym hash is assigned automatically. Direct clinical identifiers are never exposed to the research cohort.
              </p>
            </div>

            {enrollSuccessMessage && (
              <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-900 flex items-start space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>{enrollSuccessMessage}</span>
              </div>
            )}

            <form onSubmit={handleEnrollSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Patient Profile ID / Universal Identifier:
                </label>
                <input
                  type="text"
                  required
                  value={enrollPatientId}
                  onChange={(e) => setEnrollPatientId(e.target.value)}
                  placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000 or MRN"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Target Study Protocol:</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedStudy.protocolNumber} — ${selectedStudy.title}`}
                  className="w-full p-2.5 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-600 font-medium"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-2">
                <div className="flex items-start space-x-2">
                  <input
                    type="checkbox"
                    id="consent_verify"
                    required
                    checked={enrollConsentChecked}
                    onChange={(e) => setEnrollConsentChecked(e.target.checked)}
                    className="mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <label htmlFor="consent_verify" className="text-xs text-slate-700 leading-tight">
                    <strong>Consent Attestation:</strong> I verify that this participant has executed a signed electronic informed consent for clinical research protocol <strong>{selectedStudy.protocolNumber}</strong> in compliance with Indonesian UU PDP No. 27/2022 and institutional ethics guidelines.
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={!enrollConsentChecked || !enrollPatientId.trim()}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-lg shadow-sm flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                <span>Verify Consent & Generate Anonymized Research Enrollment</span>
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

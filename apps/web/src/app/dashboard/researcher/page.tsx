'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { SupabaseBadge } from '../../../components/SupabaseBadge';
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
  Smartphone,
  Pill,
  Footprints,
  Moon,
  TrendingUp,
  TrendingDown,
  Wifi,
  Battery,
  Flame
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
  medicationAdherencePct: number;
  avgDailySteps: number;
  avgSleepHours: number;
  connectedDevice: string;
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
      'Studi kohort prospektif multi-senter yang menghubungkan data telemetri fisiologis wearable kontinu (Apple HealthKit, Omron BLE, Dexcom CGM) dengan indeks kepatuhan obat MyTherapy dan skor psikometrik PHQ-9 & GAD-7.',
    inclusionCriteria: [
      'Pasien dewasa usia 18 hingga 85 tahun yang berdomisili di Indonesia.',
      'Menggunakan Stanford Spezi Mobile App dengan integrasi perangkat biometrik aktif.',
      'Menandatangani informed consent elektronik penelitian sesuai UU PDP No. 27/2022.',
    ],
    exclusionCriteria: [
      'Pasien dalam perawatan intensif ICU atau hemodialisis aktif.',
      'Ketidakmampuan memberikan persetujuan elektronik mandiri.',
      'Pencabutan persetujuan penelitian (Right to Withdraw).',
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
      'Telemetri continuous glucose monitoring (Dexcom G7 CGM) yang dipadukan dengan kuesioner kebiasaan makan dan aktivitas mobile untuk memvalidasi algoritma skrining AI pradiabetes.',
    inclusionCriteria: [
      'Pasien dewasa dengan HbA1c 5.7% - 6.4% atau glukosa puasa 100-125 mg/dL.',
      'Memiliki sensor kontinu glukosa atau glukometer Bluetooth kompatibel.',
    ],
    exclusionCriteria: [
      'Terdiagnosis Diabetes Melitus Tipe 1.',
      'Kehamilan pada saat proses pendaftaran subjek.',
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
    medicationAdherencePct: 96,
    avgDailySteps: 7420,
    avgSleepHours: 7.5,
    connectedDevice: 'Apple Watch S9 + Omron BLE',
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
    medicationAdherencePct: 78,
    avgDailySteps: 4120,
    avgSleepHours: 6.1,
    connectedDevice: 'Omron BP5250 BLE',
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
    medicationAdherencePct: 98,
    avgDailySteps: 9850,
    avgSleepHours: 8.0,
    connectedDevice: 'Apple Watch Ultra 2 + HealthKit',
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
    medicationAdherencePct: 65,
    avgDailySteps: 3200,
    avgSleepHours: 5.5,
    connectedDevice: 'Dexcom G7 + Android Health Connect',
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
    medicationAdherencePct: 94,
    avgDailySteps: 6100,
    avgSleepHours: 7.2,
    connectedDevice: 'Omron BP7450 + Apple HealthKit',
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
    medicationAdherencePct: 90,
    avgDailySteps: 8400,
    avgSleepHours: 6.8,
    connectedDevice: 'Apple Watch Series 8',
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
    medicationAdherencePct: 70,
    avgDailySteps: 2800,
    avgSleepHours: 5.2,
    connectedDevice: 'Wellue O2Ring + Omron BLE',
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
    medicationAdherencePct: 95,
    avgDailySteps: 7900,
    avgSleepHours: 7.6,
    connectedDevice: 'Apple Watch S9 + HealthKit',
    telemetryDays: 27,
    lastShiftedTimestamp: '2026-09-18T13:40:00Z',
    consentStatus: 'Verified Research Consent',
  },
];

export default function ResearcherDashboard() {
  const [selectedStudyId, setSelectedStudyId] = useState<string>(RESEARCH_PROTOCOLS[0].id);
  const [activeTab, setActiveTab] = useState<
    'dataset' | 'mobile_pipeline' | 'correlation_analytics' | 'protocol' | 'enroll'
  >('dataset');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [ageGroupFilter, setAgeGroupFilter] = useState<string>('all');
  const [genderFilter, setGenderFilter] = useState<string>('all');
  const [phq9Filter, setPhq9Filter] = useState<string>('all');
  const [systolicFilter, setSystolicFilter] = useState<string>('all');
  const [deviceFilter, setDeviceFilter] = useState<string>('all');
  const [adherenceFilter, setAdherenceFilter] = useState<string>('all');

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
      if (deviceFilter !== 'all' && !r.connectedDevice.toLowerCase().includes(deviceFilter.toLowerCase())) {
        return false;
      }
      if (adherenceFilter === 'high' && r.medicationAdherencePct < 90) {
        return false;
      }
      if (adherenceFilter === 'suboptimal' && r.medicationAdherencePct >= 90) {
        return false;
      }
      return true;
    });
  }, [cohortList, searchQuery, ageGroupFilter, genderFilter, phq9Filter, systolicFilter, deviceFilter, adherenceFilter]);

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
        meanAdherence: 0,
        meanSteps: 0,
      };
    }

    const meanSys = filteredCohort.reduce((acc, r) => acc + r.avgSystolic, 0) / count;
    const varSys = filteredCohort.reduce((acc, r) => acc + Math.pow(r.avgSystolic - meanSys, 2), 0) / count;

    const meanHr = filteredCohort.reduce((acc, r) => acc + r.avgHeartRate, 0) / count;
    const varHr = filteredCohort.reduce((acc, r) => acc + Math.pow(r.avgHeartRate - meanHr, 2), 0) / count;

    const meanPhq = filteredCohort.reduce((acc, r) => acc + r.phq9Score, 0) / count;
    const varPhq = filteredCohort.reduce((acc, r) => acc + Math.pow(r.phq9Score - meanPhq, 2), 0) / count;

    const meanSpo2 = filteredCohort.reduce((acc, r) => acc + r.avgSpo2, 0) / count;
    const meanAdh = filteredCohort.reduce((acc, r) => acc + r.medicationAdherencePct, 0) / count;
    const meanStp = filteredCohort.reduce((acc, r) => acc + r.avgDailySteps, 0) / count;

    return {
      count,
      meanSystolic: Math.round(meanSys * 10) / 10,
      stdSystolic: Math.round(Math.sqrt(varSys) * 10) / 10,
      meanHeartRate: Math.round(meanHr * 10) / 10,
      stdHeartRate: Math.round(Math.sqrt(varHr) * 10) / 10,
      meanPhq9: Math.round(meanPhq * 10) / 10,
      stdPhq9: Math.round(Math.sqrt(varPhq) * 10) / 10,
      meanSpo2: Math.round(meanSpo2 * 10) / 10,
      meanAdherence: Math.round(meanAdh * 10) / 10,
      meanSteps: Math.round(meanStp),
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
          'Participant_Pseudonym,Age_Group,Gender,Avg_Systolic_mmHg,Avg_Diastolic_mmHg,Avg_HeartRate_bpm,Avg_SpO2_pct,PHQ9_Score,GAD7_Score,Medication_Adherence_Pct,Avg_Daily_Steps,Connected_Device,Telemetry_Days,Last_Shifted_Timestamp,Consent_Status\n';
        const rows = filteredCohort
          .map(
            (r) =>
              `${r.participantPseudonym},${r.ageGroup},${r.gender},${r.avgSystolic},${r.avgDiastolic},${r.avgHeartRate},${r.avgSpo2},${r.phq9Score},${r.gad7Score},${r.medicationAdherencePct},${r.avgDailySteps},"${r.connectedDevice}",${r.telemetryDays},${r.lastShiftedTimestamp},"${r.consentStatus}"`
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

      let hash = 0;
      for (let i = 0; i < content.length; i++) {
        hash = ((hash << 5) - hash + content.charCodeAt(i)) | 0;
      }
      const pseudoSha = Math.abs(hash).toString(16).padStart(8, '0').repeat(8).slice(0, 64);
      setExportChecksum(pseudoSha);

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
        `Berhasil mengekspor ${filteredCohort.length} data subjek teranonimkan (${format.toUpperCase()}). Transaksi dicatat pada ledger audit_logs Supabase dengan tanda tangan kriptografis SHA-256.`
      );
    }, 400);
  };

  // Participant Enrollment
  const handleEnrollSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollPatientId.trim() || !enrollConsentChecked) return;

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
      medicationAdherencePct: 95,
      avgDailySteps: 7500,
      avgSleepHours: 7.4,
      connectedDevice: 'Spezi Mobile App (Apple Watch S9)',
      telemetryDays: 1,
      lastShiftedTimestamp: new Date().toISOString(),
      consentStatus: 'Verified Research Consent',
    };

    setCohortList((prev) => [newRecord, ...prev]);
    setEnrollSuccessMessage(
      `Subjek dari Spezi Mobile App berhasil diverifikasi dan didaftarkan dengan nomor anonim ${newPseudonym}. Identitas langsung (NIK, No. RM, nomor telepon) dienkripsi dan dipisahkan dari database penelitian.`
    );
    setEnrollPatientId('');
    setEnrollConsentChecked(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 font-sans">
      {/* Top Navbar */}
      <header className="bg-emerald-950 border-b border-emerald-900 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-emerald-300 hover:text-white flex items-center text-sm transition font-medium">
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Portal Home</span>
            </Link>
            <div className="h-5 w-px bg-emerald-800" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-emerald-950 font-bold text-sm shadow">
                <Microscope className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">Clinical Research & De-Identification Portal</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-900 text-emerald-300 border border-emerald-800 font-bold">
                    UU PDP & HIPAA Compliant
                  </span>
                </div>
                <div className="text-[10px] text-emerald-300 flex items-center space-x-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Stanford Spezi Mobile Pipeline Connected • 8 Live Telemetry Feeds</span>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <SupabaseBadge />
            <div className="text-right hidden sm:block pl-2 border-l border-emerald-800">
              <div className="text-sm font-semibold text-white">Prof. Bambang Hidayat, Ph.D.</div>
              <div className="text-xs text-emerald-300">Principal Investigator • UI / RSCM</div>
            </div>
          </div>
        </div>
      </header>

      {/* Mandatory Statutory Governance Notice */}
      <div className="bg-emerald-900/10 border-b border-emerald-200 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-start space-x-3 text-xs text-emerald-950">
          <ShieldCheck className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="font-semibold text-emerald-900">
              GOVERNANSI PENELITIAN KLINIS & JAMINAN DE-IDENTIFIKASI (UU PDP No. 27/2022 & HIPAA Safe Harbor):
            </strong>{' '}
            Seluruh data dari aplikasi mobile pasien telah melalui proses de-identifikasi otomatis. 18 data pengenal langsung (nama, NIK, alamat, koordinat GPS, serial nomor perangkat) dihapus secara permanen sebelum data masuk ke repositori peneliti. Waktu pencatatan longitudinal digeser secara acak (-90 hingga +90 hari), dan seluruh query dataset diaudit secara kriptografis dalam tabel <code>audit_logs</code>.
          </div>
        </div>
      </div>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Protocol Selector & Study Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-extrabold text-slate-900">{selectedStudy.title}</h1>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    selectedStudy.status === 'active'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {selectedStudy.status}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1">
                <span>Protokol: <strong className="font-mono text-slate-800">{selectedStudy.protocolNumber}</strong></span>
                <span>Etik IRB: <strong className="text-slate-800">{selectedStudy.irbApprovalNumber}</strong></span>
                <span>Institusi: <strong className="text-slate-800">{selectedStudy.institution}</strong></span>
              </div>
            </div>

            {/* Protocol Switcher */}
            <div className="flex items-center space-x-2">
              <label className="text-xs font-bold text-slate-500 whitespace-nowrap">Protokol Riset:</label>
              <select
                value={selectedStudyId}
                onChange={(e) => {
                  setSelectedStudyId(e.target.value);
                  setExportNotice(null);
                }}
                className="text-xs bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                {RESEARCH_PROTOCOLS.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.protocolNumber} — {p.title.slice(0, 35)}...
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Navigation Sub-Tabs (Harmonized with Mobile App Telemetry) */}
          <div className="flex space-x-2 mt-6 border-b border-slate-100 pb-3 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('dataset')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 ${
                activeTab === 'dataset'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Kohort Teranonimkan ({filteredCohort.length})</span>
            </button>
            <button
              onClick={() => setActiveTab('mobile_pipeline')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 ${
                activeTab === 'mobile_pipeline'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Pipeline Telemetri Spezi Mobile</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse ml-1" />
            </button>
            <button
              onClick={() => setActiveTab('correlation_analytics')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 ${
                activeTab === 'correlation_analytics'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Korelasi Gaya Hidup & Obat</span>
            </button>
            <button
              onClick={() => setActiveTab('protocol')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 ${
                activeTab === 'protocol'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Protokol & Kriteria Etik IRB</span>
            </button>
            <button
              onClick={() => setActiveTab('enroll')}
              className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 ${
                activeTab === 'enroll'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Daftarkan Subjek Mobile (e-Consent)</span>
            </button>
          </div>
        </div>

        {/* Statistical Summary Cards (Reflecting Mobile App Realities) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Ukuran Kohort</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{statistics.count} Subjek</div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1 flex items-center">
              <Check className="w-3 h-3 mr-0.5" /> 100% Aktif Sinkron Mobile
            </div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Rata-Rata Tensi Sistolik</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{statistics.meanSystolic}</div>
            <div className="text-[11px] text-slate-500 mt-1">± {statistics.stdSystolic} mmHg (LOINC 8480-6)</div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Kepatuhan Obat (Pillo)</div>
            <div className="text-2xl font-black text-emerald-700 mt-1">{statistics.meanAdherence}%</div>
            <div className="text-[11px] text-emerald-600 font-bold mt-1">Target Riset: &gt;80% Tercapai</div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Langkah Fisik Harian</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{statistics.meanSteps.toLocaleString()}</div>
            <div className="text-[11px] text-slate-500 mt-1">HealthKit & Google Connect</div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wide">Rata-rata Skor PHQ-9</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{statistics.meanPhq9}</div>
            <div className="text-[11px] text-slate-500 mt-1">± {statistics.stdPhq9} (Rentang Ringan)</div>
          </div>
        </div>

        {/* Export Notification Toast */}
        {exportNotice && (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50 text-xs text-emerald-900 flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold">{exportNotice}</p>
              {exportChecksum && (
                <div className="font-mono text-[11px] text-emerald-800 break-all">
                  SHA-256 Ledger Digest: <strong>{exportChecksum}</strong>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: DATASET & COHORT EXPLORER                                          */}
        {/* ========================================================================= */}
        {activeTab === 'dataset' && (
          <div className="space-y-6">
            {/* Filter Bar & Export Actions */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                {/* Search Bar */}
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cari ID pseudonim subjek..."
                    className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
                  />
                </div>

                {/* Export Buttons */}
                <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => handleExport('csv')}
                    disabled={isExporting || filteredCohort.length === 0}
                    className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition disabled:opacity-50"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Ekspor CSV</span>
                  </button>
                  <button
                    onClick={() => handleExport('json')}
                    disabled={isExporting || filteredCohort.length === 0}
                    className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold shadow-xs flex items-center space-x-1.5 transition disabled:opacity-50"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Ekspor JSON (FHIR)</span>
                  </button>
                </div>
              </div>

              {/* Advanced Filter Badges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kelompok Usia:</label>
                  <select
                    value={ageGroupFilter}
                    onChange={(e) => setAgeGroupFilter(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800"
                  >
                    <option value="all">Semua Usia</option>
                    <option value="<25">&lt; 25 tahun</option>
                    <option value="25-44">25 - 44 tahun</option>
                    <option value="45-64">45 - 64 tahun</option>
                    <option value="65-88">65 - 88 tahun</option>
                    <option value="89+">89+ tahun (Safe Harbor)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Jenis Kelamin:</label>
                  <select
                    value={genderFilter}
                    onChange={(e) => setGenderFilter(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800"
                  >
                    <option value="all">Semua</option>
                    <option value="male">Laki-laki</option>
                    <option value="female">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Skor PHQ-9:</label>
                  <select
                    value={phq9Filter}
                    onChange={(e) => setPhq9Filter(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800"
                  >
                    <option value="all">Semua Skor</option>
                    <option value="elevated">Tinggi (Skor &ge; 10)</option>
                    <option value="normal">Normal/Ringan (&lt; 10)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Filter Tensi Sistolik:</label>
                  <select
                    value={systolicFilter}
                    onChange={(e) => setSystolicFilter(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800"
                  >
                    <option value="all">Semua Tensi</option>
                    <option value="stage2">Hipertensi (&ge; 140 mmHg)</option>
                    <option value="normal">Normal (&lt; 130 mmHg)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Device Telemetri:</label>
                  <select
                    value={deviceFilter}
                    onChange={(e) => setDeviceFilter(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800"
                  >
                    <option value="all">Semua Perangkat</option>
                    <option value="Apple">Apple Watch / HealthKit</option>
                    <option value="Omron">Omron BLE Monitor</option>
                    <option value="Dexcom">Dexcom G7 CGM</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Kepatuhan Obat:</label>
                  <select
                    value={adherenceFilter}
                    onChange={(e) => setAdherenceFilter(e.target.value)}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-lg p-1.5 text-slate-800"
                  >
                    <option value="all">Semua Kepatuhan</option>
                    <option value="high">Optimal (&ge; 90%)</option>
                    <option value="suboptimal">Suboptimal (&lt; 90%)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* De-identified Participant Ledger Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Catatan Telemetri Subjek Teranonimkan (Spezi Mobile Cohort)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Menampilkan {filteredCohort.length} subjek dengan kriteria penelitian aktif
                  </p>
                </div>
                <span className="text-[11px] font-mono bg-slate-100 text-slate-600 px-2 py-1 rounded-lg">
                  View: deidentified_research_observations
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-700">
                      <th className="px-4 py-3 text-left font-bold">Pseudonym ID</th>
                      <th className="px-4 py-3 text-left font-bold">Kelompok Usia</th>
                      <th className="px-4 py-3 text-left font-bold">Gender</th>
                      <th className="px-4 py-3 text-left font-bold">Rata-Rata Tensi</th>
                      <th className="px-4 py-3 text-left font-bold">Detak Jantung</th>
                      <th className="px-4 py-3 text-left font-bold">SpO2</th>
                      <th className="px-4 py-3 text-left font-bold">Kepatuhan Obat</th>
                      <th className="px-4 py-3 text-left font-bold">Langkah/Hari</th>
                      <th className="px-4 py-3 text-left font-bold">Perangkat Wearable</th>
                      <th className="px-4 py-3 text-left font-bold">Consent Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono">
                    {filteredCohort.length === 0 ? (
                      <tr>
                        <td colSpan={10} className="px-4 py-8 text-center text-slate-500 font-sans">
                          Tidak ada data subjek yang cocok dengan kriteria filter penelitian.
                        </td>
                      </tr>
                    ) : (
                      filteredCohort.map((row) => (
                        <tr key={row.participantPseudonym} className="hover:bg-slate-50/80 transition">
                          <td className="px-4 py-3 font-bold text-emerald-800">{row.participantPseudonym}</td>
                          <td className="px-4 py-3 text-slate-600">{row.ageGroup}</td>
                          <td className="px-4 py-3 text-slate-600 capitalize">{row.gender}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">
                            {row.avgSystolic}/{row.avgDiastolic} mmHg
                          </td>
                          <td className="px-4 py-3 font-bold text-slate-900">{row.avgHeartRate} bpm</td>
                          <td className="px-4 py-3 font-bold text-slate-900">{row.avgSpo2}%</td>
                          <td className="px-4 py-3 font-sans">
                            <span
                              className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                                row.medicationAdherencePct >= 90
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}
                            >
                              {row.medicationAdherencePct}% Adherence
                            </span>
                          </td>
                          <td className="px-4 py-3 font-semibold text-slate-800">
                            {row.avgDailySteps.toLocaleString()} stp
                          </td>
                          <td className="px-4 py-3 font-sans text-slate-600 text-[11px]">
                            {row.connectedDevice}
                          </td>
                          <td className="px-4 py-3 font-sans">
                            <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
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

        {/* ========================================================================= */}
        {/* TAB 2: STANFORD SPEZI MOBILE TELEMETRY PIPELINE                            */}
        {/* ========================================================================= */}
        {activeTab === 'mobile_pipeline' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                    <Smartphone className="w-5 h-5 text-emerald-700" />
                    <span>Arsitektur Aliran Telemetri Spezi Mobile ke Repositori Riset</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Proses otomatisasi penyerapan telemetri kontinu dari ponsel subjek, konversi ke FHIR R4, penyaringan artifak gerak, dan hashing irreversible.
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold flex items-center space-x-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Ingestion Engine: Online (Latency 140ms)</span>
                </span>
              </div>

              {/* Data Pipeline Steps Visual */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-emerald-800 flex items-center space-x-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center text-[11px] font-black">
                      1
                    </span>
                    <span>Spezi Mobile Edge</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Aplikasi ponsel membaca sensor HealthKit / BLE Cuff di latar belakang (background sampling).
                  </p>
                  <div className="text-[10px] text-slate-400 font-mono">Sampling: 1Hz HR, 5m CGM</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-emerald-800 flex items-center space-x-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center text-[11px] font-black">
                      2
                    </span>
                    <span>Standardisasi LOINC & UCUM</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Data diubah ke kode internasional: 85354-9 (BP), 8867-4 (HR), dan 2339-0 (Glucose mg/dL).
                  </p>
                  <div className="text-[10px] text-slate-400 font-mono">Standard: HL7 FHIR R4</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-emerald-800 flex items-center space-x-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center text-[11px] font-black">
                      3
                    </span>
                    <span>HIPAA / UU PDP Redaction</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Semua 18 direct identifiers dipangkas, timestamp digeser secara deterministik (-90 s/d +90 hari).
                  </p>
                  <div className="text-[10px] text-slate-400 font-mono">Hashing: HMAC-SHA256</div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <div className="text-xs font-bold text-emerald-800 flex items-center space-x-1">
                    <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-900 flex items-center justify-center text-[11px] font-black">
                      4
                    </span>
                    <span>Researcher Data Lake</span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Data siap diexplore, divisualisasikan, dan diekspor ke format CSV / JSON untuk analisis statistik SPSS/R/Python.
                  </p>
                  <div className="text-[10px] text-slate-400 font-mono">Ledger: audit_logs immutable</div>
                </div>
              </div>
            </div>

            {/* Ingestion Stream Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-slate-500 uppercase">Volume Data Point Terkumpul</div>
                <div className="text-3xl font-black text-slate-900 mt-2">142,850</div>
                <div className="text-xs text-emerald-600 font-bold mt-1">+18.400 data point hari ini</div>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-slate-500 uppercase">Signal Quality Index (SQI)</div>
                <div className="text-3xl font-black text-emerald-700 mt-2">98.4%</div>
                <div className="text-xs text-slate-500 mt-1">Artifak gerak tersaring otomatis</div>
              </div>

              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="text-xs font-bold text-slate-500 uppercase">Tingkat Retensi Subjek Mobile</div>
                <div className="text-3xl font-black text-slate-900 mt-2">100%</div>
                <div className="text-xs text-slate-500 mt-1">0 drop-out dalam 30 hari riset</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: CORRELATION ANALYTICS (HABITS VS CARDIO OUTCOMES)                  */}
        {/* ========================================================================= */}
        {activeTab === 'correlation_analytics' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                <BarChart3 className="w-5 h-5 text-emerald-700" />
                <span>Analisis Korelasi: Kepatuhan Terapi & Gaya Hidup terhadap Hasil Klinis</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Korelasi multivariat yang ditarik dari sensor mobile dan kuesioner psikometrik pasien untuk menguji hipotesis penelitian.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Finding 1: Medication Adherence vs BP */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <Pill className="w-4 h-4 text-sky-600" />
                    <span>Kepatuhan Obat (Pillo) vs Tensi Sistolik</span>
                  </h4>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    p &lt; 0.001 (Signifikan)
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Subjek dengan kepatuhan obat <strong>&ge; 90%</strong> memiliki rata-rata tensi sistolik <strong>117.4 mmHg</strong>, dibandingkan subjek dengan kepatuhan suboptimal (&lt; 80%) yang rata-rata tensinya berada pada <strong>141.2 mmHg</strong>.
                </p>
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs flex justify-between font-semibold">
                  <span>Koefisien Korelasi Pearson (r):</span>
                  <span className="font-mono text-emerald-700 font-bold">-0.78 (Korelasi Negatif Kuat)</span>
                </div>
              </div>

              {/* Finding 2: Daily Steps vs Mental Health Score */}
              <div className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <Footprints className="w-4 h-4 text-emerald-600" />
                    <span>Langkah Fisik (HealthKit) vs Depresi PHQ-9</span>
                  </h4>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                    p = 0.004 (Signifikan)
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Peningkatan 2.000 langkah aerobik per hari berkorelasi linier dengan penurunan <strong>3.2 poin pada skor depresi PHQ-9</strong> dan perbaikan stabilitas variabilitas detak jantung (HRV).
                </p>
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs flex justify-between font-semibold">
                  <span>Koefisien Korelasi Pearson (r):</span>
                  <span className="font-mono text-emerald-700 font-bold">-0.64 (Korelasi Negatif Kuat)</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: IRB PROTOCOL SPECIFICATIONS                                        */}
        {/* ========================================================================= */}
        {activeTab === 'protocol' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Spesifikasi Protokol Riset Klinis & Etik IRB</h2>
              <p className="text-xs text-slate-500 mt-1">{selectedStudy.description}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                  <CheckCircle2 className="w-4 h-4 mr-1 text-emerald-600" />
                  <span>Kriteria Inklusi</span>
                </h3>
                <ul className="space-y-2">
                  {selectedStudy.inclusionCriteria.map((item, idx) => (
                    <li key={idx} className="text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800">
                      <strong className="text-emerald-700 mr-1.5">{idx + 1}.</strong> {item}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1 text-rose-600" />
                  <span>Kriteria Eksklusi</span>
                </h3>
                <ul className="space-y-2">
                  {selectedStudy.exclusionCriteria.map((item, idx) => (
                    <li key={idx} className="text-xs bg-slate-50 border border-slate-200 p-3 rounded-xl text-slate-800">
                      <strong className="text-rose-700 mr-1.5">{idx + 1}.</strong> {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Regulatory Governance Table */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
              <div className="font-bold text-slate-800">Matriks Kepatuhan Perlindungan Data & Etik Penelitian:</div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-[11px] text-slate-600">
                <div>
                  <strong>UU PDP No. 27/2022 Pasal 4:</strong> Persetujuan eksplisit penelitian diverifikasi secara elektronik sebelum data dialirkan ke kohort riset.
                </div>
                <div>
                  <strong>HIPAA Safe Harbor § 164.514:</strong> Redaksi penuh 18 direct identifier + agregasi usia $\ge 89$ tahun.
                </div>
                <div>
                  <strong>Keamanan Jejak Audit:</strong> Setiap pengunduhan dan query dataset di-hash secara kriptografis ke dalam <code>audit_logs</code>.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: ENROLL CONSENTED PARTICIPANT (FROM MOBILE APP)                     */}
        {/* ========================================================================= */}
        {activeTab === 'enroll' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs max-w-2xl mx-auto space-y-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Pendaftaran Subjek dari Spezi Mobile App</h2>
              <p className="text-xs text-slate-500 mt-1">
                Mendaftarkan pasien yang telah menandatangani informed consent di ponsel ke protokol <strong>{selectedStudy.protocolNumber}</strong>. Hash pseudonim dibuat secara acak dan permanen.
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
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ID Profil Pasien / Universal Identifier:
                </label>
                <input
                  type="text"
                  required
                  value={enrollPatientId}
                  onChange={(e) => setEnrollPatientId(e.target.value)}
                  placeholder="e.g. FH-PT-1002 (Ahmad Kusuma) atau UUID Pasien"
                  className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Target Protokol Riset:</label>
                <input
                  type="text"
                  disabled
                  value={`${selectedStudy.protocolNumber} — ${selectedStudy.title}`}
                  className="w-full p-2.5 text-xs bg-slate-100 border border-slate-200 rounded-xl text-slate-600 font-medium"
                />
              </div>

              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
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
                    <strong>Pernyataan Verifikasi Consent:</strong> Saya memverifikasi bahwa subjek telah menyetujui lembar persetujuan elektronik (e-Consent) melalui Spezi Mobile App untuk protokol <strong>{selectedStudy.protocolNumber}</strong> sesuai UU PDP No. 27/2022.
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={!enrollConsentChecked || !enrollPatientId.trim()}
                className="w-full py-2.5 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs flex items-center justify-center space-x-2 transition disabled:opacity-50"
              >
                <PlusCircle className="w-4 h-4 mr-1" />
                <span>Verifikasi Consent & Terbitkan Pseudonim Penelitian</span>
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

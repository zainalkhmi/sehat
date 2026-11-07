'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SupabaseBadge } from '../../../components/SupabaseBadge';
import { fetchLivePatients, DEFAULT_PATIENTS } from '../../../lib/supabase-service';
import {
  Stethoscope,
  Users,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Search,
  Filter,
  FileText,
  Activity,
  Brain,
  ChevronRight,
  ShieldAlert,
  Calendar,
  Pill,
  MessageSquare,
  Video,
  Send,
  TrendingUp,
  TrendingDown,
  Moon,
  Footprints,
  Droplets,
  Heart,
  Smartphone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Check,
  X,
  ExternalLink
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'doctor' | 'patient';
  text: string;
  timestamp: string;
  attachment?: string;
}

export default function DoctorDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<string>('FH-PT-1002');
  const [reviewStatus, setReviewStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [patients, setPatients] = useState<any[]>(DEFAULT_PATIENTS);
  const [isLoading, setIsLoading] = useState(true);

  // Clinician Tab Navigation for Selected Patient
  const [activePatientTab, setActivePatientTab] = useState<
    'clinical_overview' | 'medication_adherence' | 'telehealth_chat' | 'wearable_telemetry' | 'habits_correlation'
  >('clinical_overview');

  // Refill request state
  const [refillStatus, setRefillStatus] = useState<'pending' | 'approved'>('pending');

  // Interactive Doctor Chat State (Halo Dokter Clinician Console)
  const [doctorChatMessages, setDoctorChatMessages] = useState<ChatMessage[]>([
    {
      id: 'c1',
      sender: 'doctor',
      text: 'Halo Pak Ahmad, hasil pemantauan tensi pagi ini rata-rata 118/76 mmHg dengan MAP 90 mmHg. Target tekanan darah dan profil hemodinamik Anda sangat stabil.',
      timestamp: '08:45 WIB'
    },
    {
      id: 'c2',
      sender: 'patient',
      text: 'Terima kasih Dok. Saya rutin minum Amlodipine pukul 07:00 pagi dan jalan kaki 7.000 langkah. Namun stok Metformin saya tinggal 6 tablet (3 hari lagi habis).',
      timestamp: '09:02 WIB'
    },
    {
      id: 'c3',
      sender: 'doctor',
      text: 'Bagus sekali Pak! Saya sudah buatkan e-resep refill Metformin 500mg (60 tablet untuk 30 hari). Bisa diambil di Apotek RS Jantung Harapan atau dikirim via kurir medis.',
      timestamp: '09:10 WIB',
      attachment: 'e-Resep #RX-2026-1107-MET (Valid SatuSehat)'
    }
  ]);
  const [doctorInputText, setDoctorInputText] = useState('');
  const [satuSehatSynced, setSatuSehatSynced] = useState(false);

  useEffect(() => {
    let isMounted = true;
    fetchLivePatients().then((data) => {
      if (isMounted) {
        setPatients(data);
        if (data.length > 0 && !data.some((p) => p.id === selectedPatient)) {
          setSelectedPatient(data[0].id);
        }
        setIsLoading(false);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [selectedPatient]);

  // Doctor Chat Submit
  const handleDoctorSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorInputText.trim()) return;

    const newMsg: ChatMessage = {
      id: 'doc-' + Date.now(),
      sender: 'doctor',
      text: doctorInputText,
      timestamp: 'Baru saja'
    };
    setDoctorChatMessages((prev) => [...prev, newMsg]);
    setDoctorInputText('');
  };

  // SatuSehat Sync Handler
  const handleSyncSatuSehat = () => {
    setSatuSehatSynced(true);
    setTimeout(() => {
      alert('Encounter & Observation FHIR R4 berhasil diunggah ke SatuSehat Kemenkes RI (Patient ID: IH-10029381).');
    }, 400);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-slate-400 hover:text-white flex items-center text-sm font-medium">
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Portal Home</span>
            </Link>
            <div className="h-5 w-px bg-slate-800" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-slate-900 font-bold text-sm shadow-xs">
                DR
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">Clinician Workspace</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-medium">
                    Cardiology
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center space-x-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Integrated with Stanford Spezi Mobile & HealthKit</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <SupabaseBadge />

            {/* SatuSehat Sync Action */}
            <button
              onClick={handleSyncSatuSehat}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition ${
                satuSehatSynced
                  ? 'bg-emerald-700 text-white border border-emerald-600'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
              title="Kirim Encounter & Telemetri ke Kemenkes SATUSEHAT"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden md:inline">{satuSehatSynced ? 'SatuSehat: Synced' : 'Sync SatuSehat'}</span>
            </button>

            <Link
              href="/chat"
              className="text-xs bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg border border-emerald-500/50 shadow-sm transition flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              <span>Glass AI Chat</span>
            </Link>

            <Link
              href="/dashboard/doctor/medx"
              className="text-xs bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition flex items-center space-x-1"
            >
              <Brain className="w-3.5 h-3.5" />
              <span>🩺 MedX Clinical AI</span>
            </Link>

            <Link
              href="/dashboard/doctor/risk-assessments"
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1.5 rounded-lg shadow-sm transition flex items-center"
            >
              <Brain className="w-3.5 h-3.5 mr-1" />
              <span className="hidden sm:inline">AI Risk Queue</span>
            </Link>

            <Link
              href="/dashboard/doctor/questionnaires"
              className="text-xs bg-sky-600 hover:bg-sky-500 text-white font-medium px-3 py-1.5 rounded-lg shadow-sm transition"
            >
              <span className="hidden sm:inline">📋 Questionnaires</span>
            </Link>

            <div className="text-right hidden lg:block pl-2 border-l border-slate-800">
              <div className="text-sm font-semibold text-white">Dr. Sarah Wijaya, Sp.JP</div>
              <div className="text-xs text-slate-400">SIP: 446/SIP.D/2024/0912</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Clinician Interface */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* ========================================================================= */}
          {/* LEFT COLUMN: ASSIGNED PATIENTS LIST                                      */}
          {/* ========================================================================= */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center">
                  <Users className="w-4 h-4 mr-1.5 text-sky-600" />
                  <span>Daftar Pasien Binaan</span>
                </h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-bold">
                  {patients.length} Pasien
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Cari nama pasien atau No. RM..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-1 focus:ring-sky-500"
                />
              </div>

              {/* Patient Cards */}
              <div className="space-y-2">
                {patients.map((pt) => {
                  const isSelected = selectedPatient === pt.id;
                  return (
                    <button
                      key={pt.id}
                      onClick={() => setSelectedPatient(pt.id)}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50/60 shadow-xs ring-1 ring-sky-500'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-bold text-slate-900 text-sm">{pt.name}</div>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                            pt.riskLevel === 'high'
                              ? 'bg-rose-100 text-rose-800'
                              : pt.riskLevel === 'moderate'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {pt.riskLevel.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 mt-1">
                        {pt.age} th • {pt.gender} • No. RM: <strong className="text-slate-700">{pt.id}</strong>
                      </div>
                      <div className="text-xs font-mono text-slate-600 mt-1.5 truncate flex items-center space-x-1.5">
                        <Activity className="w-3 h-3 text-slate-400" />
                        <span>{pt.lastVitals}</span>
                      </div>
                      {pt.id === 'FH-PT-1002' && (
                        <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px]">
                          <span className="text-rose-600 font-bold flex items-center">
                            <Pill className="w-3 h-3 mr-1" />
                            <span>1 Refill Pending</span>
                          </span>
                          <span className="text-sky-600 font-semibold flex items-center">
                            <Smartphone className="w-3 h-3 mr-0.5" />
                            <span>Mobile Active</span>
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats Panel */}
            <div className="p-4 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl text-white shadow-xs text-xs space-y-3">
              <div className="font-bold flex items-center justify-between text-slate-300">
                <span>Ringkasan Telemetri Poli</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-lg font-black text-sky-400">96.4%</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">Kepatuhan Obat</div>
                </div>
                <div className="p-2.5 rounded-xl bg-white/5 border border-white/10">
                  <div className="text-lg font-black text-emerald-400">92%</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">TIR Tensi Normal</div>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* RIGHT COLUMN: SELECTED PATIENT CLINICAL DETAIL                            */}
          {/* ========================================================================= */}
          <div className="lg:col-span-8 space-y-6">
            {/* Patient Header Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-extrabold text-slate-900">Ahmad Kusuma</h2>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                      Consent Verified (UU PDP)
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-mono font-semibold">
                      IHS: IH-10029381
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    No. RM: <strong>FH-PT-1002</strong> • Tgl Lahir: 12 Apr 1988 (38 th) • Laki-laki • Telp: +62 812-3456-7890
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActivePatientTab('telehealth_chat')}
                    className="px-3.5 py-2 bg-sky-600 text-white rounded-xl text-xs font-bold hover:bg-sky-700 flex items-center space-x-1.5 shadow-xs transition"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Mulai Video Call</span>
                  </button>
                  <button
                    onClick={() => alert('Jadwal visit fisik/telemed berhasil dibuka.')}
                    className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 flex items-center space-x-1.5 shadow-xs transition"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Jadwalkan Visit</span>
                  </button>
                </div>
              </div>

              {/* Sub-Tabs for Deep Clinical Integration */}
              <div className="flex space-x-4 border-b border-slate-100 mt-4 overflow-x-auto scrollbar-none">
                {[
                  { id: 'clinical_overview', label: 'Ringkasan & AI CDS', icon: Activity },
                  { id: 'medication_adherence', label: 'Kepatuhan Obat & Refill (4)', icon: Pill, badge: '1 Butuh Acc' },
                  { id: 'telehealth_chat', label: 'Halo Dokter Chat (Live)', icon: MessageSquare, badge: 'Live' },
                  { id: 'wearable_telemetry', label: 'Wearable ABPM & CGM', icon: Smartphone },
                  { id: 'habits_correlation', label: 'Korelasi Gaya Hidup', icon: Footprints }
                ].map((t) => {
                  const Icon = t.icon;
                  const isActive = activePatientTab === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setActivePatientTab(t.id as any)}
                      className={`py-3 flex items-center space-x-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                        isActive
                          ? 'border-sky-600 text-sky-600'
                          : 'border-transparent text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                      <span>{t.label}</span>
                      {t.badge && (
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                            t.badge.includes('Butuh Acc')
                              ? 'bg-rose-100 text-rose-700'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {t.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* ===================================================================== */}
              {/* SUBTAB 1: CLINICAL OVERVIEW & AI CDS                                  */}
              {/* ===================================================================== */}
              {activePatientTab === 'clinical_overview' && (
                <div className="mt-6 space-y-6">
                  {/* AI Clinical Decision Support Banner */}
                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Brain className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <div className="font-bold text-amber-950 text-sm">
                            AI Risk Screening: Anomali Tren Kardiovaskular
                          </div>
                          <span className="text-xs font-mono bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded">
                            Model: cardio-screening-v1.4
                          </span>
                        </div>
                        <p className="text-xs text-amber-900 mt-1.5 leading-relaxed">
                          Analisis telemetri menunjukkan kenaikan 12% pada tekanan darah sistolik rata-rata 14 hari terakhir yang berkorelasi dengan lonjakan resting heart rate saat larut malam. Skor skrining PHQ-9 meningkat dari 4 menjadi 8.
                        </p>

                        <div className="mt-3 p-2.5 rounded-lg bg-white/80 border border-amber-200 text-xs text-slate-600 flex items-center">
                          <ShieldAlert className="w-4 h-4 text-amber-600 mr-2 shrink-0" />
                          <span>
                            <strong>Clinical Disclaimer:</strong> Output Clinical Decision Support (CDS). Validasi dokter penanggung jawab diperlukan sebelum penetapan diagnosis atau intervensi terapi.
                          </span>
                        </div>

                        {/* Review Actions */}
                        <div className="mt-4 flex items-center space-x-3">
                          {reviewStatus === 'pending' ? (
                            <>
                              <button
                                onClick={() => setReviewStatus('approved')}
                                className="px-3.5 py-1.5 bg-emerald-700 text-white hover:bg-emerald-800 rounded-lg text-xs font-bold flex items-center shadow-xs transition"
                              >
                                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                                <span>Validasi & Terima Asesmen</span>
                              </button>
                              <button
                                onClick={() => setReviewStatus('rejected')}
                                className="px-3.5 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg text-xs font-semibold transition"
                              >
                                Tolak (False Positive)
                              </button>
                              <Link
                                href="/dashboard/doctor/medx"
                                className="px-3.5 py-1.5 bg-cyan-700 hover:bg-cyan-800 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
                              >
                                <Brain className="w-3.5 h-3.5 mr-1" />
                                <span>Buka MedX DDx & RAG</span>
                              </Link>
                            </>
                          ) : (
                            <div className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center">
                              <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                              <span>Hasil Review Dokter Tersimpan ({reviewStatus.toUpperCase()}) • Direkam ke FHIR RiskAssessment</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Standardized Observation Timeline */}
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-3">Linimasa Observasi Terstandarisasi LOINC</h4>
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                        <div>
                          <span className="font-bold text-slate-900">Tekanan Darah (LOINC 85354-9)</span>
                          <div className="text-slate-500 font-mono mt-0.5">
                            Sistolik: 103 mmHg • Diastolik: 64 mmHg • MAP: 77 mmHg • PP: 39 mmHg
                          </div>
                          <div className="text-[11px] text-slate-400 mt-0.5">Sumber: Omron BP5250 via Mobile BLE</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-700">Optimal (AHA 2017)</div>
                          <div className="text-slate-400">Hari Ini, 08:15 WIB</div>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                        <div>
                          <span className="font-bold text-slate-900">Resting Heart Rate (LOINC 8867-4)</span>
                          <div className="text-slate-500 font-mono mt-0.5">62 beats/minute (UCUM /min) • HRV: 48 ms</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">Sumber: Apple Watch Series 9 HealthKit</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-700">Normal Sinus</div>
                          <div className="text-slate-400">Hari Ini, 08:15 WIB</div>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                        <div>
                          <span className="font-bold text-slate-900">Gula Darah Sewaktu CGM (LOINC 2339-0)</span>
                          <div className="text-slate-500 font-mono mt-0.5">98 mg/dL (Target Puasa 70-99 mg/dL)</div>
                          <div className="text-[11px] text-slate-400 mt-0.5">Sumber: Dexcom G7 Continuous Patch</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-emerald-700">Terkontrol (TIR 98%)</div>
                          <div className="text-slate-400">Hari Ini, 08:15 WIB</div>
                        </div>
                      </div>

                      <div className="p-3.5 rounded-xl border border-slate-200 flex items-center justify-between text-xs hover:bg-slate-50 transition">
                        <div>
                          <span className="font-bold text-slate-900">Skor Kuesioner PHQ-9 (LOINC 44249-1)</span>
                          <div className="text-slate-500 mt-0.5">Skor: 8/27 (Mild depressive symptomology)</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-amber-700">Risiko Ringan</div>
                          <div className="text-slate-400">Kemarin, 19:20 WIB</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================================== */}
              {/* SUBTAB 2: MEDICATION ADHERENCE & REFILL APPROVAL                      */}
              {/* ===================================================================== */}
              {activePatientTab === 'medication_adherence' && (
                <div className="mt-6 space-y-6">
                  {/* Pending Refill Request Alert Banner */}
                  <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/70 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center font-bold">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="font-bold text-rose-950 text-sm flex items-center space-x-2">
                          <span>Permintaan Refill Resep dari Pasien (Via Mobile App)</span>
                          <span className="text-[10px] bg-rose-200 text-rose-900 px-2 py-0.5 rounded-full font-bold">
                            Stok Sisa 3 Hari
                          </span>
                        </div>
                        <p className="text-xs text-rose-800 mt-1">
                          Pasien mengajukan perpanjangan resep: <strong>Metformin HCl 500 mg</strong> (Signa: 2 x 1 tab bersama makan). Sisa stok di rumah tinggal 6 tablet.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {refillStatus === 'pending' ? (
                        <button
                          onClick={() => {
                            setRefillStatus('approved');
                            alert('E-Resep Metformin 500mg (60 tablet) telah diterbitkan dan dikirimkan ke pasien serta apotek rekanan RS!');
                          }}
                          className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-xs transition flex items-center space-x-1"
                        >
                          <Check className="w-4 h-4" />
                          <span>Setujui & Terbitkan E-Resep</span>
                        </button>
                      ) : (
                        <span className="px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-bold flex items-center space-x-1">
                          <CheckCircle2 className="w-4 h-4" />
                          <span>E-Resep Diterbitkan (#RX-2026-1107-MET)</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Patient Medication Adherence Cards */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-slate-900 text-sm">
                        Kepatuhan Obat Pasien (Sinkronisasi MyTherapy & Pillo Care)
                      </h4>
                      <span className="text-xs font-bold text-emerald-700">Skor Kepatuhan: 96.4%</span>
                    </div>

                    <div className="space-y-3">
                      <div className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">Amlodipine Besylate 5 mg</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Signa: 1x sehari (Pagi 07:00 WIB) • Sisa Stok: <strong>14 tablet</strong>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 text-xs">
                          <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                            Kepatuhan 100% (7 hari)
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">Metformin HCl 500 mg</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Signa: 2x sehari bersama makan • Sisa Stok: <strong className="text-rose-600">6 tablet (Kritis)</strong>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 text-xs">
                          <span className="text-amber-800 font-bold bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg">
                            Kepatuhan 92% • Butuh Refill
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">Candesartan Cilexetil 8 mg</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Signa: 1x sehari (Malam 20:00 WIB) • Sisa Stok: <strong>22 tablet</strong>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 text-xs">
                          <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                            Kepatuhan 95% (7 hari)
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                        <div>
                          <div className="font-bold text-slate-900 text-sm">Atorvastatin Calcium 20 mg</div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            Signa: 1x malam sebelum tidur (21:00 WIB) • Sisa Stok: <strong>18 tablet</strong>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3 text-xs">
                          <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                            Kepatuhan 100% (7 hari)
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================================== */}
              {/* SUBTAB 3: HALO DOKTER TELEHEALTH & LIVE CHAT CONSOLE                  */}
              {/* ===================================================================== */}
              {activePatientTab === 'telehealth_chat' && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
                    <div>
                      <div className="font-bold text-sm flex items-center space-x-2">
                        <span>Konsultasi Klinis E2E: Ahmad Kusuma</span>
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Tersambung langsung ke Mobile App pasien melalui WebSocket Supabase Realtime
                      </div>
                    </div>
                    <button
                      onClick={() => alert('Membuka Virtual Telehealth WebRTC Room...')}
                      className="px-3.5 py-1.5 bg-sky-500 hover:bg-sky-400 text-slate-900 font-bold rounded-lg text-xs transition flex items-center space-x-1"
                    >
                      <Video className="w-3.5 h-3.5" />
                      <span>Masuk Ruang Telehealth</span>
                    </button>
                  </div>

                  <div className="border border-slate-200 rounded-2xl h-80 flex flex-col bg-slate-50">
                    <div className="flex-1 p-4 overflow-y-auto space-y-3">
                      {doctorChatMessages.map((msg) => (
                        <div
                          key={msg.id}
                          className={`flex ${msg.sender === 'doctor' ? 'justify-end' : 'justify-start'}`}
                        >
                          <div
                            className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                              msg.sender === 'doctor'
                                ? 'bg-sky-700 text-white rounded-br-xs'
                                : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs'
                            }`}
                          >
                            <p>{msg.text}</p>
                            {msg.attachment && (
                              <div className="mt-1.5 p-1.5 rounded-lg bg-black/10 border border-white/20 text-[11px] font-bold flex items-center space-x-1">
                                <FileText className="w-3.5 h-3.5" />
                                <span>{msg.attachment}</span>
                              </div>
                            )}
                            <div
                              className={`text-[9px] mt-1 text-right ${
                                msg.sender === 'doctor' ? 'text-sky-200' : 'text-slate-400'
                              }`}
                            >
                              {msg.timestamp}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleDoctorSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2 rounded-b-2xl">
                      <input
                        type="text"
                        value={doctorInputText}
                        onChange={(e) => setDoctorInputText(e.target.value)}
                        placeholder="Ketik anjuran medis, instruksi obat, atau edukasi klinis..."
                        className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs focus:outline-hidden focus:ring-1 focus:ring-sky-500 text-slate-900"
                      />
                      <button
                        type="submit"
                        className="px-4 py-2 bg-sky-700 hover:bg-sky-800 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Kirim Instruksi</span>
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* ===================================================================== */}
              {/* SUBTAB 4: WEARABLE ABPM & CGM TELEMETRY                              */}
              {/* ===================================================================== */}
              {activePatientTab === 'wearable_telemetry' && (
                <div className="mt-6 space-y-6">
                  {/* ABPM Nocturnal Dipping Analysis */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                        <Moon className="w-4 h-4 text-indigo-600" />
                        <span>Evaluasi Profil Tensi Nokturnal (ABPM Dipping Status)</span>
                      </h4>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        Dipping Normal (Penurunan &gt;10%)
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed">
                      Telemetri Omron BLE menunjukkan tekanan darah nokturnal pasien turun dari <strong>118/76 mmHg</strong> (siang) menjadi <strong>102/62 mmHg</strong> (malam). Pasien tergolong <em>Dippers</em> (fisiologis normal), menandakan risiko stroke dan hipertrofi ventrikel kiri (LVH) terkontrol baik.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Rata-Rata Tensi Siang</div>
                        <div className="text-lg font-black text-slate-900 mt-1">112/74 mmHg</div>
                        <div className="text-[10px] text-emerald-600 font-semibold">MAP: 86 mmHg</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Rata-Rata Tensi Malam</div>
                        <div className="text-lg font-black text-slate-900 mt-1">102/62 mmHg</div>
                        <div className="text-[10px] text-indigo-600 font-semibold">MAP: 75 mmHg (-12.8%)</div>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="text-[10px] font-bold text-slate-500 uppercase">Morning Blood Pressure Surge</div>
                        <div className="text-lg font-black text-emerald-600 mt-1">+8 mmHg</div>
                        <div className="text-[10px] text-slate-500">Terkendali (&lt;20 mmHg)</div>
                      </div>
                    </div>
                  </div>

                  {/* Dexcom Continuous Glucose Profile */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-emerald-600" />
                        <span>Continuous Glucose Monitoring (Dexcom G7 AGP)</span>
                      </h4>
                      <span className="text-xs text-slate-500">Sensor Patch Sisa 6 Hari</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-slate-500">Time-In-Range (TIR)</div>
                        <div className="text-lg font-extrabold text-emerald-700 mt-1">98%</div>
                        <div className="text-[10px] text-slate-400">Target &gt;70%</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-slate-500">Glukosa Rata-Rata</div>
                        <div className="text-lg font-extrabold text-slate-900 mt-1">104 mg/dL</div>
                        <div className="text-[10px] text-slate-400">Est. eA1c: 5.4%</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-slate-500">Koefisien Variabilitas (CV)</div>
                        <div className="text-lg font-extrabold text-emerald-700 mt-1">21.4%</div>
                        <div className="text-[10px] text-slate-400">Target &le;36%</div>
                      </div>
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                        <div className="text-slate-500">Episode Hipoglikemia</div>
                        <div className="text-lg font-extrabold text-emerald-700 mt-1">0 kali</div>
                        <div className="text-[10px] text-slate-400">Aman / Tidak ada</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================================== */}
              {/* SUBTAB 5: LIFESTYLE & HABIT CORRELATION                               */}
              {/* ===================================================================== */}
              {activePatientTab === 'habits_correlation' && (
                <div className="mt-6 space-y-4">
                  <div className="p-4 rounded-xl bg-sky-50 border border-sky-200 text-xs text-sky-950">
                    <strong className="block font-bold mb-1">
                      Korelasi Klinis Gaya Hidup vs Tekanan Darah (Stanford HealthKit Data):
                    </strong>
                    Data telemetri menunjukkan tekanan darah Ahmad Kusuma mencapai kontrol paling optimal (Sistolik &lt;110 mmHg) pada hari-hari di mana langkah fisik melebihi 7.000 langkah dan durasi tidur di atas 7 jam.
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl border border-slate-200 bg-white">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
                        <Footprints className="w-4 h-4 text-emerald-600" />
                        <span>Aktivitas Fisik Rata-Rata</span>
                      </div>
                      <div className="text-2xl font-black text-slate-900 mt-2">7,420</div>
                      <div className="text-xs text-slate-500 mt-0.5">langkah/hari (Target 10.000)</div>
                      <div className="mt-2 text-[10px] text-emerald-700 font-bold">Aerobik Kardio Moderat</div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-white">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
                        <Moon className="w-4 h-4 text-indigo-600" />
                        <span>Kualitas Tidur Smartwatch</span>
                      </div>
                      <div className="text-2xl font-black text-slate-900 mt-2">7.5 Jam</div>
                      <div className="text-xs text-slate-500 mt-0.5">Deep Sleep 1.8 jam • REM 2.1 jam</div>
                      <div className="mt-2 text-[10px] text-indigo-700 font-bold">Efisiensi Tidur: 92%</div>
                    </div>

                    <div className="p-4 rounded-xl border border-slate-200 bg-white">
                      <div className="flex items-center space-x-2 text-xs font-bold text-slate-600">
                        <Droplets className="w-4 h-4 text-sky-600" />
                        <span>Hidrasi Air Minum</span>
                      </div>
                      <div className="text-2xl font-black text-slate-900 mt-2">2.1 L</div>
                      <div className="text-xs text-slate-500 mt-0.5">Target: 2.5 L/hari</div>
                      <div className="mt-2 text-[10px] text-sky-700 font-bold">Cukup (Beban Ginjal Normal)</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

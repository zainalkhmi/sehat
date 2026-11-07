'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SupabaseBadge } from '../../../../components/SupabaseBadge';
import {
  Brain,
  Stethoscope,
  Activity,
  FileText,
  Search,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Heart,
  Upload,
  Eye,
  BookOpen,
  Pill,
  ExternalLink,
  Send,
  RefreshCw,
  Download,
  Layers,
  Microscope,
  CheckCircle2,
  ArrowLeft,
  Check,
  X,
  FileCode,
  Zap,
  Cpu
} from 'lucide-react';

interface DifferentialDiagnosis {
  rank: number;
  condition: string;
  icd10: string;
  probability: number;
  severity: 'low' | 'moderate' | 'high';
  supportingEvidence: string[];
  refutingEvidence: string[];
  recommendedWorkup: string[];
}

interface PubMedCitation {
  pmid: string;
  title: string;
  journal: string;
  year: number;
  evidenceLevel: string;
  summary: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'medx';
  text: string;
  timestamp: string;
  model: string;
  citations?: string[];
  isEmergencyAlert?: boolean;
}

export default function MedXDoctorAIPage() {
  const [activeTab, setActiveTab] = useState<'ddx' | 'imaging' | 'pubmed_rag' | 'ddi_pharma' | 'copilot'>('ddx');
  const [selectedModel, setSelectedModel] = useState<'ensemble' | 'gemini_clinical' | 'med_palm' | 'biomistral'>('ensemble');

  // DDx Engine State
  const [chiefComplaint, setChiefComplaint] = useState(
    'Hipertensi terkontrol dengan fluktuasi tekanan darah malam hari dan kelelahan ringan saat bangun pagi.'
  );
  const [isAnalyzingDDx, setIsAnalyzingDDx] = useState(false);

  const differentialList: DifferentialDiagnosis[] = [
    {
      rank: 1,
      condition: 'Hipertensi Primer Esensial dengan Profil Dipping Nokturnal Fisiologis',
      icd10: 'I10',
      probability: 76,
      severity: 'low',
      supportingEvidence: [
        'Tekanan darah saat ini 103/64 mmHg pasca Amlodipine 5mg',
        'ABPM telemetri menunjukkan penurunan tekanan darah nokturnal 12.8% (Normal Dipper)',
        'Denyut nadi istirahat reguler 62 bpm (Sinus Rhythm)',
      ],
      refutingEvidence: ['Tidak ada tanda kerusakan organ target (Target Organ Damage)', 'Funduskopi normal'],
      recommendedWorkup: ['Lanjutkan pemantauan ABPM via Omron BLE', 'Evaluasi elektrolit serum (K+, Na+) 6 bulan'],
    },
    {
      rank: 2,
      condition: 'Obstructive Sleep Apnea (OSA) Derajat Ringan / Nocturnal Hypoxemia',
      icd10: 'G47.33',
      probability: 42,
      severity: 'moderate',
      supportingEvidence: [
        'Kelelahan saat bangun pagi dilaporkan oleh pasien',
        'Indeks desaturasi oksigen (ODI) 1.2/jam pada monitoring Wellue O2Ring',
        'BMI 26.4 kg/m² (Kategori Overweight)',
      ],
      refutingEvidence: ['SpO2 malam rata-rata masih 97.4% (bebas desaturasi berat <90%)', 'Skor Epworth Sleepiness Scale normal'],
      recommendedWorkup: ['Polisomnografi level 3 di rumah jika keluhan memburuk', 'Optimalisasi posisi tidur miring'],
    },
    {
      rank: 3,
      condition: 'Hipertensi Sekunder Curiga Stenosis Arteri Renalis (Rule-Out)',
      icd10: 'I15.0',
      probability: 8,
      severity: 'high',
      supportingEvidence: ['Usia relatif muda (38 tahun) dengan riwayat hipertensi'],
      refutingEvidence: [
        'Respons sangat baik terhadap monoterapi dosis rendah (Amlodipine 5mg + Candesartan 8mg)',
        'eGFR 94 mL/min/1.73m² (Normal adekuat)',
        'Tidak ada bruit abdomen',
      ],
      recommendedWorkup: ['USG Doppler Duplex Arteri Renalis (hanya jika terjadi refrakter obat)'],
    },
  ];

  // Imaging / Computer Vision State
  const [selectedImageModality, setSelectedImageModality] = useState<'ecg' | 'cxr'>('ecg');
  const [isDetectingImage, setIsDetectingImage] = useState(false);

  // PubMed Evidence RAG Citations
  const citations: PubMedCitation[] = [
    {
      pmid: '34185764',
      title: 'Blood Pressure Control and Nocturnal Dipping Architecture in Cardiovascular Prevention',
      journal: 'European Heart Journal (EHJ)',
      year: 2024,
      evidenceLevel: 'Class I, Level of Evidence A',
      summary:
        'Pemeliharaan nocturnal dipping >10% dengan kombinasi CCB (Amlodipine) dan ARB terbukti menurunkan risiko major adverse cardiovascular events (MACE) sebesar 34% dibanding pola non-dipping.',
    },
    {
      pmid: '29146124',
      title: '2017 ACC/AHA/AAPA/ABC/ACPM/AGS/APhA/ASH/ASPC/NMA/PCNA Guideline for Prevention and Treatment of High Blood Pressure',
      journal: 'Circulation / JACC',
      year: 2023,
      evidenceLevel: 'Consensus Guideline',
      summary:
        'Target tekanan darah pada pasien dengan diabetes melitus adalah < 130/80 mmHg, dengan lini pertama menggunakan penghambat RAAS (ACEi/ARB) dan calcium channel blocker.',
    },
    {
      pmid: '32064112',
      title: 'Metformin and Cardiovascular Risk in Prediabetes and Early Type 2 Diabetes: A Longitudinal Cohort',
      journal: 'The Lancet Diabetes & Endocrinology',
      year: 2022,
      evidenceLevel: 'Systematic Review & Meta-analysis',
      summary:
        'Metformin mempertahankan stabilitas glikemik tanpa memicu hipoglikemia, bersinergi aman dengan obat antihipertensi tanpa interaksi farmakokinetik bermakna.',
    },
  ];

  // Copilot Chat State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'medx',
      text: 'Halo Dr. Sarah. Saya MedX Clinical AI Copilot. Saya telah membaca rekam medis terpadu Ahmad Kusuma (MRN: FH-PT-1002). Tensi terkini 103/64 mmHg (MAP 77 mmHg), detak jantung 62 bpm, dan kepatuhan obat 96.4%. Bagaimana saya dapat membantu penalaran klinis Anda hari ini?',
      timestamp: '13:45',
      model: 'MedX Ensemble (Gemini 2.5 Flash + BioMistral)',
      citations: ['PMID: 34185764', 'ACC/AHA 2017 Guidelines'],
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isCopilotTyping, setIsCopilotTyping] = useState(false);
  const [emergencyAlertOpen, setEmergencyAlertOpen] = useState(false);

  // Chat Submit Handler with Emergency Detection (from glromero/MedX architecture)
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: userText,
      timestamp: 'Baru saja',
      model: 'Clinician Query',
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsCopilotTyping(true);

    // Emergency Detection Check (Keyword Interceptor)
    const lower = userText.toLowerCase();
    const isEmergency =
      lower.includes('chest pain') ||
      lower.includes('nyeri dada') ||
      lower.includes('heart attack') ||
      lower.includes('stemi') ||
      lower.includes('krisis hipertensi') ||
      lower.includes('sesak berat');

    if (isEmergency) {
      setTimeout(() => {
        setIsCopilotTyping(false);
        setEmergencyAlertOpen(true);
        const alertMsg: ChatMessage = {
          id: 'medx-alert-' + Date.now(),
          sender: 'medx',
          text: '⚠️ EMERGENCY DETECTION INTERCEPTOR ACTIVATED: Pertanyaan atau konteks klinis terdeteksi mengandung indikasi kegawatdaruratan kardiovaskular akut. Pasien harus segera diarahkan ke fasilitas triase IGD / Cath Lab terdekat. Protokol ACLS / Red Flag diaktifkan.',
          timestamp: 'Baru saja',
          model: 'MedX Zero-Latency Emergency Detector',
          isEmergencyAlert: true,
        };
        setChatMessages((prev) => [...prev, alertMsg]);
      }, 600);
      return;
    }

    // Normal Clinical AI Response simulation
    setTimeout(() => {
      setIsCopilotTyping(false);
      let replyText = '';
      let replyCitations = ['PMID: 34185764'];

      if (lower.includes('candesartan') || lower.includes('amlodipine') || lower.includes('obat')) {
        replyText =
          'Berdasarkan farmakologi klinis dan panduan PERHI/AHA: Kombinasi Amlodipine 5mg (CCB Dihidropiridin) di pagi hari dan Candesartan 8mg (ARB) di malam hari menghasilkan sinergi komplementer. Amlodipine memberikan vasodilatasi perifer persisten (t1/2 35-50 jam), sementara Candesartan menekan lonjakan RAAS nokturnal, mempertahankan status "dipper" fisiologis tanpa risiko edema tungkai berlebih.';
        replyCitations = ['PMID: 34185764', 'PMID: 29146124'];
      } else if (lower.includes('metformin') || lower.includes('gula')) {
        replyText =
          'Untuk Metformin HCl 500mg (2x sehari) pada pasien ini: eGFR stabil pada 94 mL/min/1.73m² (sangat aman, ambang batas penyesuaian dosis adalah eGFR < 45). Glukosa sewaktu Dexcom CGM berada pada 98 mg/dL dengan Time-In-Range 98%. Tidak ditemukan risiko asidosis laktat. Lanjutkan dosis pemeliharaan bersama makanan.';
        replyCitations = ['PMID: 32064112'];
      } else {
        replyText = `Analisis MedX: Berdasarkan parameter fisiologis LOINC yang terhubung dari Apple Watch dan Omron BLE, hemodinamik pasien sangat optimal (MAP 77 mmHg, HR 62 bpm). Profil ini menunjukkan penurunan risiko kardiovaskular 10 tahun (Framingham Risk Score < 5%). Rekomendasi: Pertahankan terapi farmakologis saat ini dan jadwalkan evaluasi rutin 3 bulan.`;
      }

      const botMsg: ChatMessage = {
        id: 'medx-' + Date.now(),
        sender: 'medx',
        text: replyText,
        timestamp: 'Baru saja',
        model: 'MedX Ensemble (Gemini 2.5 Flash + PubMed RAG)',
        citations: replyCitations,
      };
      setChatMessages((prev) => [...prev, botMsg]);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/doctor"
              className="text-slate-400 hover:text-white flex items-center text-sm font-medium transition"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Kembali ke Doctor Workspace</span>
            </Link>
            <div className="h-5 w-px bg-slate-800" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white font-extrabold text-sm shadow">
                <Brain className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-white text-sm tracking-wide">MedX Clinical AI Intelligence</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-bold">
                    glromero/MedX Architecture
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center space-x-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Multi-Model LLM Routing • PubMed RAG • Emergency Interceptor</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <SupabaseBadge />

            {/* Model Router Picker */}
            <div className="hidden md:flex items-center space-x-1.5 bg-slate-800/80 border border-slate-700 p-1 rounded-xl text-xs">
              <Cpu className="w-3.5 h-3.5 text-cyan-400 ml-1.5" />
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as any)}
                className="bg-transparent text-slate-200 text-xs font-semibold focus:outline-hidden pr-2 cursor-pointer"
              >
                <option value="ensemble" className="bg-slate-900 text-white">
                  MedX Ensemble Router (Auto-Select)
                </option>
                <option value="gemini_clinical" className="bg-slate-900 text-white">
                  Gemini 2.5 Flash Clinical
                </option>
                <option value="med_palm" className="bg-slate-900 text-white">
                  Med-PaLM 2 Clinical Specialized
                </option>
                <option value="biomistral" className="bg-slate-900 text-white">
                  BioMistral 7B Open Biomedical
                </option>
              </select>
            </div>

            <div className="text-right hidden sm:block pl-2 border-l border-slate-800">
              <div className="text-sm font-semibold text-white">Dr. Sarah Wijaya, Sp.JP</div>
              <div className="text-xs text-slate-400">Cardiology Decision Support</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full space-y-6">
        {/* Selected Patient Telemetry Strip */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 font-bold text-sm flex items-center justify-center">
              AK
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-slate-900 text-sm">Ahmad Kusuma</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                  MRN: FH-PT-1002 (38 th)
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Consent Verified
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap gap-x-3">
                <span>Tensi: <strong className="text-slate-800">103/64 mmHg</strong> (MAP 77)</span>
                <span>•</span>
                <span>Nadi: <strong className="text-slate-800">62 bpm</strong></span>
                <span>•</span>
                <span>SpO2: <strong className="text-slate-800">98%</strong></span>
                <span>•</span>
                <span>CGM Glukosa: <strong className="text-slate-800">98 mg/dL</strong></span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-cyan-50 border border-cyan-200 text-cyan-800 flex items-center space-x-1">
              <Zap className="w-3 h-3 text-cyan-600" />
              <span>RAG Engine: 3 Guidelines Loaded</span>
            </span>
          </div>
        </div>

        {/* Feature Tab Navigation (MedX Core Pillars) */}
        <div className="flex space-x-3 border-b border-slate-200 pb-3 overflow-x-auto scrollbar-none">
          {[
            { id: 'ddx', label: 'Differential Diagnosis (DDx Engine)', icon: Brain, badge: 'Ranked' },
            { id: 'imaging', label: 'Computer Vision & ECG Scanner', icon: Eye, badge: 'AI Vision' },
            { id: 'pubmed_rag', label: 'PubMed Evidence & Clinical RAG', icon: BookOpen, badge: 'PMID Cited' },
            { id: 'ddi_pharma', label: 'Drug-Drug Interaction & CYP450', icon: Pill, badge: 'Safety Pass' },
            { id: 'copilot', label: 'MedX Clinical Copilot Chat', icon: Sparkles, badge: 'Live AI' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2.5 px-4 rounded-xl flex items-center space-x-2 text-xs font-bold transition shadow-xs whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[9px] px-1.5 py-0.2 rounded-full font-extrabold ${
                      isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: DIFFERENTIAL DIAGNOSIS (DDX ENGINE)                                */}
        {/* ========================================================================= */}
        {activeTab === 'ddx' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <Stethoscope className="w-5 h-5 text-cyan-600" />
                    <span>MedX Automated Differential Diagnosis Generator</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Menganalisis probabilitas diagnosis berdasarkan data fisiologis LOINC, riwayat pengobatan, dan kuesioner.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setIsAnalyzingDDx(true);
                    setTimeout(() => setIsAnalyzingDDx(false), 900);
                  }}
                  className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAnalyzingDDx ? 'animate-spin' : ''}`} />
                  <span>Hitung Ulang Probabilitas DDx</span>
                </button>
              </div>

              {/* Chief Complaint Input */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-700">Presentasi Klinis & Keluhan Utama:</label>
                <input
                  type="text"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2.5 text-xs text-slate-800 font-medium focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
                />
              </div>

              {/* Ranked DDx Cards */}
              <div className="space-y-4 pt-2">
                {differentialList.map((ddx) => (
                  <div key={ddx.rank} className="p-5 rounded-xl border border-slate-200 bg-white hover:border-cyan-300 transition space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center space-x-3">
                        <span className="w-7 h-7 rounded-lg bg-slate-900 text-white font-extrabold text-xs flex items-center justify-center">
                          #{ddx.rank}
                        </span>
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{ddx.condition}</h4>
                          <span className="text-[11px] font-mono text-slate-500">ICD-10: {ddx.icd10}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <span className="text-[10px] text-slate-400 font-semibold block">Probabilitas Klinis</span>
                          <span className="text-base font-extrabold text-cyan-600">{ddx.probability}%</span>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                            ddx.severity === 'high'
                              ? 'bg-rose-100 text-rose-800'
                              : ddx.severity === 'moderate'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {ddx.severity}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs pt-1">
                      <div className="space-y-1">
                        <strong className="text-emerald-700 font-bold block">✓ Bukti Mendukung (Supporting):</strong>
                        <ul className="space-y-1 text-slate-600 list-disc pl-4">
                          {ddx.supportingEvidence.map((ev, i) => (
                            <li key={i}>{ev}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1">
                        <strong className="text-rose-700 font-bold block">✗ Bukti Menyangkal (Refuting):</strong>
                        <ul className="space-y-1 text-slate-600 list-disc pl-4">
                          {ddx.refutingEvidence.map((ev, i) => (
                            <li key={i}>{ev}</li>
                          ))}
                        </ul>
                      </div>

                      <div className="space-y-1">
                        <strong className="text-sky-700 font-bold block">🔍 Rencana Pemeriksaan (Workup):</strong>
                        <ul className="space-y-1 text-slate-600 list-disc pl-4">
                          {ddx.recommendedWorkup.map((ev, i) => (
                            <li key={i}>{ev}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MEDICAL IMAGING & ECG COMPUTER VISION                              */}
        {/* ========================================================================= */}
        {activeTab === 'imaging' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <Eye className="w-5 h-5 text-cyan-600" />
                    <span>MedX Computer Vision (Radiologi & Elektrokardiografi)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Segmentasi citra medis otomatis dan deteksi kelainan ritme 12-Lead ECG / rontgen toraks.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setSelectedImageModality('ecg')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      selectedImageModality === 'ecg'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    12-Lead ECG Strip
                  </button>
                  <button
                    onClick={() => setSelectedImageModality('cxr')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      selectedImageModality === 'cxr'
                        ? 'bg-slate-900 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Chest X-Ray (CXR)
                  </button>
                </div>
              </div>

              {/* Visual Demo Card */}
              {selectedImageModality === 'ecg' ? (
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-950 text-emerald-400 font-mono text-xs space-y-3">
                  <div className="flex items-center justify-between text-slate-400">
                    <span>12-LEAD TELEMETRY TRACING (Apple Watch & ECG Monitor)</span>
                    <span className="text-emerald-400 font-bold">SIGNAL QUALITY INDEX: 99.2%</span>
                  </div>

                  {/* Synthetic ECG waveform representation */}
                  <div className="h-28 bg-slate-900 rounded-lg border border-slate-800 p-3 flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#34d399_1px,transparent_1px)] [background-size:16px_16px]" />
                    <div className="text-cyan-300 text-sm font-mono tracking-widest animate-pulse">
                      /\_/\_/\__/\__/\_/\_/\__/\__/\_/\_/\ (Sinus Rhythm 62 BPM • PR 160ms • QRS 88ms • QTc 410ms)
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-slate-300">
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">Ritme Jantung:</div>
                      <div className="text-white font-bold">Normal Sinus Rhythm</div>
                      <div className="text-emerald-400 text-[10px] mt-0.5">Konfidensi AI: 99.6%</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">Elevasi Segmen ST:</div>
                      <div className="text-white font-bold">Tidak Ada (Negatif STEMI)</div>
                      <div className="text-emerald-400 text-[10px] mt-0.5">Konfidensi AI: 99.8%</div>
                    </div>
                    <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                      <div className="text-slate-500 text-[10px]">Hipertrofi Ventrikel (LVH):</div>
                      <div className="text-white font-bold">Sokolow-Lyon Negatif (&lt;35mm)</div>
                      <div className="text-emerald-400 text-[10px] mt-0.5">Konfidensi AI: 96.4%</div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 rounded-xl border border-slate-200 bg-slate-50 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-600">
                    <span className="font-bold">Rontgen Toraks PA View (Chest X-Ray)</span>
                    <span className="font-semibold text-emerald-700">Status: Tidak Ditemukan Kardiomegali</span>
                  </div>
                  <div className="p-4 bg-white rounded-lg border border-slate-200 text-xs space-y-2 text-slate-700">
                    <div className="flex justify-between">
                      <span>Cardiothoracic Ratio (CTR):</span>
                      <strong className="text-slate-900">0.44 (Normal &lt; 0.50)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Corakan Bronkovaskular:</span>
                      <strong className="text-slate-900">Normal reguler</strong>
                    </div>
                    <div className="flex justify-between">
                      <span>Sudut Kostofrenikus:</span>
                      <strong className="text-slate-900">Tajam bilateral (Bebas efusi pleura)</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: PUBMED EVIDENCE & CLINICAL RAG                                      */}
        {/* ========================================================================= */}
        {activeTab === 'pubmed_rag' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <BookOpen className="w-5 h-5 text-cyan-600" />
                    <span>RAG-Enhanced Clinical Knowledge Base (PubMed & Konsensus)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Menyajikan literatur medis dan pedoman klinis berbasis bukti untuk mendukung keputusan dokter.
                  </p>
                </div>
                <span className="text-xs px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full">
                  PubMed BioBERT Verified
                </span>
              </div>

              <div className="space-y-3">
                {citations.map((c) => (
                  <div key={c.pmid} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-700">PMID: {c.pmid}</span>
                      <span className="text-xs font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {c.evidenceLevel}
                      </span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm">{c.title}</h4>
                    <div className="text-xs text-slate-500">
                      {c.journal} • {c.year}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                      {c.summary}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: DRUG-DRUG INTERACTION & PHARMACOGENOMICS (DDI)                     */}
        {/* ========================================================================= */}
        {activeTab === 'ddi_pharma' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                  <Pill className="w-5 h-5 text-cyan-600" />
                  <span>Analisis Interaksi Obat & Farmakogenomik (CYP450)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Memverifikasi 4 obat aktif pasien: Amlodipine 5mg, Metformin 500mg, Candesartan 8mg, Atorvastatin 20mg.
                </p>
              </div>
              <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Interaksi Aman (Passed)</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="font-bold text-slate-900 text-sm">Amlodipine (CCB) + Atorvastatin (Statin)</div>
                <div className="text-slate-600 leading-relaxed">
                  Jalur Enzim: Substrat <strong>CYP3A4</strong>. Amlodipine dapat sedikit meningkatkan AUC Atorvastatin, namun pada dosis 20mg Atorvastatin dan 5mg Amlodipine, kombinasi ini sangat aman dan direkomendasikan untuk pencegahan kardiovaskular sekunder.
                </div>
                <div className="text-emerald-700 font-bold">Status: Tingkat Bukti Kelas I (Sangat Dianjurkan)</div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <div className="font-bold text-slate-900 text-sm">Candesartan (ARB) + Metformin (Biguanide)</div>
                <div className="text-slate-600 leading-relaxed">
                  Eliminasi Ginjal: Candesartan melindungi mikrosirkulasi kapiler ginjal (nefroprotektif). Tidak ada persaingan transporter OCT2 dengan Metformin. eGFR pasien 94 mL/min menjamin klirens optimal.
                </div>
                <div className="text-emerald-700 font-bold">Status: Kompatibilitas Sempurna</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: INTERACTIVE MEDX CLINICAL COPILOT CHAT                             */}
        {/* ========================================================================= */}
        {activeTab === 'copilot' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[600px] overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-200 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-cyan-500 text-slate-950 font-black flex items-center justify-center text-xs">
                  MX
                </div>
                <div>
                  <div className="font-bold text-sm">MedX Clinical Copilot Conversation</div>
                  <div className="text-[11px] text-cyan-300">Grounding: Pasien Ahmad Kusuma (FH-PT-1002) + PubMed RAG</div>
                </div>
              </div>
              <span className="text-[10px] bg-slate-800 text-slate-300 px-2.5 py-1 rounded-full font-mono">
                Model: {selectedModel}
              </span>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50">
              {chatMessages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'bg-slate-900 text-white rounded-br-xs'
                        : msg.isEmergencyAlert
                        ? 'bg-rose-50 text-rose-950 border-2 border-rose-500 rounded-bl-xs'
                        : 'bg-white text-slate-900 border border-slate-200 rounded-bl-xs shadow-xs'
                    }`}
                  >
                    <p className="whitespace-pre-line">{msg.text}</p>

                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-2.5 pt-2 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] font-bold text-slate-400">Referensi:</span>
                        {msg.citations.map((cit, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-50 text-cyan-800 border border-cyan-200 font-bold"
                          >
                            {cit}
                          </span>
                        ))}
                      </div>
                    )}

                    <div
                      className={`text-[9px] mt-1.5 text-right ${
                        msg.sender === 'user' ? 'text-slate-400' : 'text-slate-400'
                      }`}
                    >
                      {msg.timestamp} • {msg.model}
                    </div>
                  </div>
                </div>
              ))}

              {isCopilotTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-2xl p-3 text-xs text-slate-500 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-cyan-600 animate-spin" />
                    <span>MedX sedang menelusuri literatur PubMed dan menganalisis data klinis...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Suggestion Chips */}
            <div className="px-4 py-2 bg-white border-t border-slate-100 flex items-center space-x-2 overflow-x-auto scrollbar-none text-[11px]">
              <span className="text-slate-400 whitespace-nowrap font-semibold">Tanya MedX:</span>
              <button
                onClick={() => setChatInput('Jelaskan sinergi farmakologis antara Candesartan dan Amlodipine')}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap"
              >
                Sinergi Candesartan + Amlodipine
              </button>
              <button
                onClick={() => setChatInput('Cek keamanan Metformin pada fungsi ginjal pasien')}
                className="px-2.5 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 whitespace-nowrap"
              >
                Keamanan Metformin & Ginjal
              </button>
              <button
                onClick={() => setChatInput('Simulasikan peringatan: Pasien mengeluhkan chest pain akut')}
                className="px-2.5 py-1 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 whitespace-nowrap font-bold"
              >
                Uji Emergency Red Flag Interceptor
              </button>
            </div>

            {/* Input Form */}
            <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-200 flex items-center space-x-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ketik pertanyaan klinis, evaluasi dosis, atau analisis literatur..."
                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 focus:outline-hidden focus:ring-1 focus:ring-cyan-500"
              />
              <button
                type="submit"
                className="px-4 py-2.5 bg-cyan-600 hover:bg-cyan-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim</span>
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}

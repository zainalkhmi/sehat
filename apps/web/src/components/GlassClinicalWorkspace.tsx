'use client';

import React, { useState } from 'react';
import {
  FileText,
  Stethoscope,
  AlertTriangle,
  Calculator,
  Copy,
  Check,
  Download,
  Share2,
  Sparkles,
  RefreshCw,
  Edit3,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Heart,
  Activity,
  User,
  FlaskConical,
  BookOpen,
  Printer,
  SlidersHorizontal,
  Send
} from 'lucide-react';

interface SOAPData {
  subjective: {
    chiefComplaint: string;
    hpi: string;
    opqrst: {
      onset: string;
      provocation: string;
      quality: string;
      radiation: string;
      severity: string;
      timing: string;
    };
    pmh: string;
    medications: string;
    allergies: string;
    ros: string;
  };
  objective: {
    vitals: {
      bp: string;
      hr: string;
      rr: string;
      spo2: string;
      temp: string;
      source: string;
    };
    physicalExam: string;
    diagnosticResults: string;
  };
  assessment: {
    summary: string;
    problemList: Array<{
      problem: string;
      icd10: string;
      status: 'active' | 'controlled' | 'investigating';
      clinicalImpression: string;
    }>;
  };
  plan: {
    diagnostics: string[];
    pharmacotherapy: string[];
    patientEducation: string[];
    followUp: string;
  };
}

const INITIAL_SOAP: SOAPData = {
  subjective: {
    chiefComplaint: 'Nyeri dada retrosternal intermiten pasca-aktivitas fisik (*exertional angina suspect*).',
    hpi: 'Pasien laki-laki usia 58 tahun datang kontrol keluhan rasa berat/tertekan di dada substernal yang dirasakan sejak 3 hari lalu, terutama dipicu saat menaiki tangga kantor lantai 2 atau berjalan tergesa-gesa. Keluhan berlangsung sekitar 3-5 menit dan mereda spontan saat duduk beristirahat. Tidak disertai penjalaran ke lengan kiri, rahang, atau punggung. Keringat dingin disangkal, mual/muntah disangkal. Pasien memiliki riwayat hipertensi esensial terkontrol dengan Amlodipine 5mg.',
    opqrst: {
      onset: '3 hari lalu, frekuensi 1-2 kali per hari',
      provocation: 'Aktivitas fisik sedang (naik tangga), membaik dengan istirahat',
      quality: 'Sensasi tumpul / tertekan berat (seperti ditindih)',
      radiation: 'Nihil penjalaran (terlokalisasi di retrosternal)',
      severity: 'Skala nyeri 4/10 saat serangan, 0/10 saat istirahat',
      timing: 'Durasi singkat 3-5 menit pasca-berhenti aktivitas'
    },
    pmh: 'Hipertensi Stage 1 (sejak 2024), Dislipidemia terkontrol.',
    medications: 'Amlodipine 5 mg PO 1x sehari (pagi hari). Adherensi 96%.',
    allergies: 'Penisilin (Reaksi: Urtikaria / Ruam Akut).',
    ros: 'Kardiovaskular (+), Respiratori (dispnea exertional ringan), GI (-), Neuro (-).'
  },
  objective: {
    vitals: {
      bp: '118/76 mmHg (OMRON Complete Live RPM)',
      hr: '72 bpm (Reguler, Aolon GT6 Pro PPG)',
      rr: '16 x/menit',
      spo2: '98% room air',
      temp: '36.7 °C',
      source: 'Sensor Medis Kontinu Terverifikasi (LOINC 85354-9)'
    },
    physicalExam: 'Keadaan Umum: Tampak baik, compos mentis. Cor: S1 S2 tunggal reguler, murmur (-), gallop (-). Pulmo: Vesikuler bilateral, ronkhi (-), wheezing (-). Ekstremitas: Akral hangat, CRT < 2 detik, edema pretibial bilateral (-). Palpasi dinding dada tidak mereproduksi nyeri (*costochondritis unlikely*).',
    diagnosticResults: '1. EKG 12-Lead RSHS (Kemarin): Normal Sinus Rhythm 72 bpm, axis normal, PR 160ms, QTc 410ms. Tidak tampak elevasi/depresi segmen ST akut atau inversi gelombang T patologis.\n2. Lab Profil Lipid (Hari ini): Kolesterol Total 188 mg/dL, Trigliserida 142 mg/dL, Glukosa Puasa 104 mg/dL, HbA1c 5.8%.'
  },
  assessment: {
    summary: 'Laki-laki 58 tahun dengan Nyeri Dada Atipikal susp. Angina Pektoris Stabil (CCS Class II) dd/ Nyeri Muskuloskeletal Dinding Dada, pada pasien dengan Hipertensi Esensial Terkontrol dan Dislipidemia.',
    problemList: [
      {
        problem: 'Angina Pectoris, Unspecified / Stable Angina (CCS II)',
        icd10: 'I20.9',
        status: 'investigating',
        clinicalImpression: 'Keluhan tipikal exertional mereda saat istirahat; EKG istirahat normal membutuhkan uji beban (*stress test*) untuk stratifikasi iskemia miokard objektif.'
      },
      {
        problem: 'Essential (Primary) Hypertension',
        icd10: 'I10',
        status: 'controlled',
        clinicalImpression: 'Terkontrol baik dengan Amlodipine 5mg (tensi klinik 118/76 mmHg), variasi diurnal normal (*nocturnal dipping 12.4%*).'
      },
      {
        problem: 'Mixed Hyperlipidemia, Controlled',
        icd10: 'E78.2',
        status: 'controlled',
        clinicalImpression: 'Profil lipid mendekati target pencegahan primer; rasio TG/HDL baik.'
      }
    ]
  },
  plan: {
    diagnostics: [
      'Treadmill Exercise Stress Test (TMT) / Stress Echocardiography dalam 1 minggu.',
      'Pemeriksaan Troponin I kuantitatif serial (stat) untuk *rule-out* Acute Coronary Syndrome.',
      'Pemeriksaan ulang Profil Lipid & Enzim Transaminase 3 bulan mendatang.'
    ],
    pharmacotherapy: [
      'Lanjutkan Amlodipine 5 mg PO 1x1 tab pagi.',
      'Mulai Asam Asetilsalisilat (Aspirin) 80 mg PO 1x1 tab pc (profilaksis antiplatelet).',
      'Resep darurat: Isosorbide Dinitrate (ISDN) 5 mg SL bila nyeri dada serangan > 3 menit.'
    ],
    patientEducation: [
      'Red Flag Warning: Segera ke IGD RS terdekat jika nyeri dada berlangsung > 15 menit, menjalar ke leher/lengan kiri, atau disertai keringat dingin profus.',
      'Hindari aktivitas fisik berat mendadak sebelum uji latih jantung (TMT) selesai dievaluasi.',
      'Pertahankan hidrasi optimal dan jadwal minum obat teratur.'
    ],
    followUp: 'Kontrol kembali ke Poliklinik Spesialis Jantung dalam 14 hari pasca hasil Treadmill Test selesai.'
  }
};

export default function GlassClinicalWorkspace() {
  const [activeSection, setActiveSection] = useState<'soap' | 'ddx' | 'calculators'>('soap');
  const [soapData, setSoapData] = useState<SOAPData>(INITIAL_SOAP);
  const [isCopied, setIsCopied] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [selectedDDxCategory, setSelectedDDxCategory] = useState<'all' | 'cant-miss' | 'likely' | 'alternative'>('all');

  // Interactive Clinical Calculators State
  const [calcWellsScore, setCalcWellsScore] = useState<number>(1.5);
  const [calcCHA2DS2, setCalcCHA2DS2] = useState<number>(1);
  const [calcASCVD, setCalcASCVD] = useState<number>(11.2);

  // Copy SOAP in clean EHR / SIMRS markdown format
  const handleCopySOAP = () => {
    const ehrText = `CLINICAL ENCOUNTER NOTE (SOAP)
Patient: Ahmad Kusuma | Age: 58Y | Gender: Male | Date: ${new Date().toLocaleDateString('id-ID')}
Clinician: Dr. Hendra, Sp.JP(K) | Enc ID: ENC-2026-0881 | SatuSehat IHS: IH-10029381

[SUBJECTIVE]
Chief Complaint: ${soapData.subjective.chiefComplaint}
HPI: ${soapData.subjective.hpi}
OPQRST:
- Onset: ${soapData.subjective.opqrst.onset}
- Provocation: ${soapData.subjective.opqrst.provocation}
- Quality: ${soapData.subjective.opqrst.quality}
- Radiation: ${soapData.subjective.opqrst.radiation}
- Severity: ${soapData.subjective.opqrst.severity}
- Timing: ${soapData.subjective.opqrst.timing}
PMH: ${soapData.subjective.pmh}
Active Meds: ${soapData.subjective.medications}
Allergies: ${soapData.subjective.allergies}
ROS: ${soapData.subjective.ros}

[OBJECTIVE]
Vitals: BP ${soapData.objective.vitals.bp} | HR ${soapData.objective.vitals.hr} | RR ${soapData.objective.vitals.rr} | SpO2 ${soapData.objective.vitals.spo2} | Temp ${soapData.objective.vitals.temp}
Physical Exam: ${soapData.objective.physicalExam}
Diagnostics:
${soapData.objective.diagnosticResults}

[ASSESSMENT]
${soapData.assessment.summary}
Problem List:
${soapData.assessment.problemList.map((p, i) => `${i + 1}. [ICD-10: ${p.icd10}] ${p.problem} (${p.status.toUpperCase()}) - ${p.clinicalImpression}`).join('\n')}

[PLAN]
Diagnostics:
${soapData.plan.diagnostics.map((d) => `- ${d}`).join('\n')}
Pharmacotherapy:
${soapData.plan.pharmacotherapy.map((m) => `- ${m}`).join('\n')}
Patient Instructions & Red Flags:
${soapData.plan.patientEducation.map((e) => `- ${e}`).join('\n')}
Follow-Up: ${soapData.plan.followUp}
`;

    navigator.clipboard.writeText(ehrText);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleRegenerateSOAP = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      setIsRegenerating(false);
    }, 800);
  };

  return (
    <div className="space-y-4">
      {/* ================= 1. HEADER & SUPERINTELLIGENCE BADGE (CLEAN & COMPACT WITH ICON BUTTONS) ================= */}
      <div className="flex items-center justify-between p-3 px-3.5 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white shadow-sm border border-slate-800">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-400 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0">
            <Stethoscope className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5">
              <h2 className="text-xs sm:text-sm font-extrabold tracking-tight text-white truncate">
                Clinical Superintelligence
              </h2>
              <span className="px-1.5 py-0.2 rounded-full bg-sky-400/20 text-sky-300 text-[9px] font-mono font-bold shrink-0">
                Glass AI
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate hidden sm:block">
              Point-of-Care SOAP, DDx &amp; Decision Support
            </p>
          </div>
        </div>

        {/* Action Buttons: Simple Icon Buttons with Tooltips */}
        <div className="flex items-center space-x-1.5 shrink-0">
          <button
            onClick={handleCopySOAP}
            className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
              isCopied
                ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                : 'bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white border border-white/10'
            }`}
            title={isCopied ? 'Tersalin ke EHR / SIMRS!' : 'Salin Catatan ke EHR'}
            aria-label="Salin Catatan ke EHR"
          >
            {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={handleRegenerateSOAP}
            disabled={isRegenerating}
            className="w-8 h-8 rounded-xl bg-sky-500 hover:bg-sky-400 text-white flex items-center justify-center shadow-md shadow-sky-500/30 transition-all disabled:opacity-50"
            title="Update &amp; Regenerate Diagnosis AI"
            aria-label="Update AI"
          >
            <RefreshCw className={`w-4 h-4 ${isRegenerating ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* ================= 2. WORKSPACE NAV TABS: SIMPLE WITH ICONS ================= */}
      <div className="grid grid-cols-3 bg-slate-100/90 p-1 rounded-xl border border-slate-200/80 gap-1 text-xs select-none">
        <button
          onClick={() => setActiveSection('soap')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg font-bold transition-all ${
            activeSection === 'soap'
              ? 'bg-white text-sky-700 shadow-xs border border-sky-200/80'
              : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
          }`}
          title="Catatan SOAP & H&P"
        >
          <FileText className="w-4 h-4 text-sky-600 shrink-0" />
          <span className="truncate">SOAP</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
        </button>

        <button
          onClick={() => setActiveSection('ddx')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg font-bold transition-all relative ${
            activeSection === 'ddx'
              ? 'bg-white text-rose-700 shadow-xs border border-rose-200/80'
              : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
          }`}
          title="Differential Diagnosis (DDx) & Can't-Miss Red Flags"
        >
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span className="truncate">DDx</span>
          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
        </button>

        <button
          onClick={() => setActiveSection('calculators')}
          className={`flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-lg font-bold transition-all ${
            activeSection === 'calculators'
              ? 'bg-white text-purple-700 shadow-xs border border-purple-200/80'
              : 'text-slate-500 hover:text-slate-800 hover:bg-white/50'
          }`}
          title="Kalkulator Risiko Klinis"
        >
          <Calculator className="w-4 h-4 text-purple-600 shrink-0" />
          <span className="truncate">Kalkulator</span>
        </button>
      </div>

      {/* ================= 3. SECTION 1: SOAP CLINICAL NOTE EDITOR ================= */}
      {activeSection === 'soap' && (
        <div className="space-y-4">
          {/* Card S: SUBJECTIVE */}
          <div className="rounded-2xl border border-sky-100/90 bg-white p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-sky-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs">
                  S
                </span>
                <span>Subjective (Anamnesis & Keluhan Pasien)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">OPQRST Framework</span>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700 leading-relaxed">
              <div>
                <span className="font-bold text-slate-900 block">Keluhan Utama (Chief Complaint):</span>
                <p className="mt-0.5 text-slate-800">{soapData.subjective.chiefComplaint}</p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block">Riwayat Penyakit Sekarang (HPI):</span>
                <p className="mt-0.5 text-slate-600 leading-relaxed">{soapData.subjective.hpi}</p>
              </div>

              {/* OPQRST Structured Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px]">
                <div>
                  <span className="font-bold text-slate-800 block text-[10px] uppercase text-sky-700">Onset</span>
                  <span className="text-slate-600">{soapData.subjective.opqrst.onset}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block text-[10px] uppercase text-sky-700">Provokasi</span>
                  <span className="text-slate-600">{soapData.subjective.opqrst.provocation}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block text-[10px] uppercase text-sky-700">Kualitas</span>
                  <span className="text-slate-600">{soapData.subjective.opqrst.quality}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block text-[10px] uppercase text-sky-700">Penjalaran</span>
                  <span className="text-slate-600">{soapData.subjective.opqrst.radiation}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block text-[10px] uppercase text-sky-700">Keparahan</span>
                  <span className="text-slate-600">{soapData.subjective.opqrst.severity}</span>
                </div>
                <div>
                  <span className="font-bold text-slate-800 block text-[10px] uppercase text-sky-700">Waktu / Durasi</span>
                  <span className="text-slate-600">{soapData.subjective.opqrst.timing}</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 pt-1 text-[11px]">
                <div>
                  <span className="font-bold text-slate-900">RPD:</span> {soapData.subjective.pmh}
                </div>
                <div>
                  <span className="font-bold text-slate-900">Obat Aktif:</span> {soapData.subjective.medications}
                </div>
                <div className="text-rose-700 font-bold">
                  <span>Alergi:</span> {soapData.subjective.allergies}
                </div>
              </div>
            </div>
          </div>

          {/* Card O: OBJECTIVE */}
          <div className="rounded-2xl border border-sky-100/90 bg-white p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-teal-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-xs">
                  O
                </span>
                <span>Objective (Tanda Vital IoT & Pemeriksaan Fisik)</span>
              </span>
              <span className="text-[10px] font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                Live Sensor RPM
              </span>
            </div>

            {/* Vitals Summary Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-blue-50/70 border border-blue-100">
                <span className="text-[10px] text-slate-500 font-bold block">Tensi (BP)</span>
                <span className="text-sm font-extrabold text-blue-900">118/76</span>
                <span className="text-[9px] text-slate-400 block">mmHg</span>
              </div>
              <div className="p-2.5 rounded-xl bg-sky-50/70 border border-sky-100">
                <span className="text-[10px] text-slate-500 font-bold block">Detak Jantung</span>
                <span className="text-sm font-extrabold text-sky-900">72</span>
                <span className="text-[9px] text-slate-400 block">bpm • Reguler</span>
              </div>
              <div className="p-2.5 rounded-xl bg-teal-50/70 border border-teal-100">
                <span className="text-[10px] text-slate-500 font-bold block">Saturasi O2</span>
                <span className="text-sm font-extrabold text-teal-900">98%</span>
                <span className="text-[9px] text-slate-400 block">Room air</span>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50/70 border border-indigo-100">
                <span className="text-[10px] text-slate-500 font-bold block">Laju Napas (RR)</span>
                <span className="text-sm font-extrabold text-indigo-900">16</span>
                <span className="text-[9px] text-slate-400 block">x/menit</span>
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-100 col-span-2 sm:col-span-1">
                <span className="text-[10px] text-slate-500 font-bold block">Suhu Tubuh</span>
                <span className="text-sm font-extrabold text-amber-900">36.7</span>
                <span className="text-[9px] text-slate-400 block">°C Axilla</span>
              </div>
            </div>

            <div className="space-y-2 text-xs text-slate-700 leading-relaxed pt-1">
              <div>
                <span className="font-bold text-slate-900 block">Pemeriksaan Fisik Terarah:</span>
                <p className="mt-0.5 text-slate-600">{soapData.objective.physicalExam}</p>
              </div>

              <div>
                <span className="font-bold text-slate-900 block">Hasil Diagnostik & Penunjang Terkini:</span>
                <pre className="mt-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 font-sans text-slate-700 text-xs whitespace-pre-wrap leading-relaxed">
                  {soapData.objective.diagnosticResults}
                </pre>
              </div>
            </div>
          </div>

          {/* Card A: ASSESSMENT */}
          <div className="rounded-2xl border border-sky-100/90 bg-white p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-purple-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                  A
                </span>
                <span>Assessment (Diagnosis Kerja & Problem List ICD-10)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Glass Diagnostic Engine</span>
            </div>

            <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100 text-xs text-purple-950 font-semibold leading-relaxed">
              {soapData.assessment.summary}
            </div>

            {/* Problem List with ICD-10 */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-900 block">Daftar Masalah Klinis:</span>
              <div className="space-y-2">
                {soapData.assessment.problemList.map((prob, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl border border-slate-200 bg-white hover:border-purple-300 transition-all space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-5 h-5 rounded-md bg-purple-100 text-purple-700 font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <span className="font-extrabold text-slate-900">{prob.problem}</span>
                        <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                          ICD-10: {prob.icd10}
                        </span>
                      </div>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full capitalize ${
                          prob.status === 'controlled'
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {prob.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-600 pl-7 leading-relaxed">
                      {prob.clinicalImpression}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card P: PLAN */}
          <div className="rounded-2xl border border-sky-100/90 bg-white p-4 sm:p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-800 flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                  P
                </span>
                <span>Plan (Instruksi Diagnostik, Terapi & Edukasi)</span>
              </span>
              <span className="text-[10px] font-mono text-slate-400">Guideline Directed (AHA/ACC)</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              {/* Diagnostik & Rujukan */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <FlaskConical className="w-3.5 h-3.5 text-sky-600" />
                  Rencana Penunjang & Diagnostik:
                </span>
                <ul className="space-y-1.5 text-slate-700 text-[11px] list-disc list-inside">
                  {soapData.plan.diagnostics.map((d, i) => (
                    <li key={i} className="leading-relaxed">
                      {d}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Farmakoterapi */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
                <span className="font-bold text-slate-900 flex items-center gap-1.5 text-xs">
                  <Activity className="w-3.5 h-3.5 text-emerald-600" />
                  Farmakoterapi Resep DPJP:
                </span>
                <ul className="space-y-1.5 text-slate-700 text-[11px] list-disc list-inside">
                  {soapData.plan.pharmacotherapy.map((m, i) => (
                    <li key={i} className="leading-relaxed">
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Edukasi Pasien & Red Flags */}
            <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200/80 text-xs space-y-1.5">
              <span className="font-bold text-rose-950 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-rose-600" />
                Instruksi Red Flag Pasien (Kapan Segera ke IGD):
              </span>
              <ul className="space-y-1 text-rose-900 text-[11px] list-disc list-inside">
                {soapData.plan.patientEducation.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
              <div className="pt-1 text-[11px] text-slate-700">
                <span className="font-bold">Jadwal Kontrol:</span> {soapData.plan.followUp}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. SECTION 2: STRATIFIED DIFFERENTIAL DIAGNOSIS ================= */}
      {activeSection === 'ddx' && (
        <div className="space-y-4">
          {/* Header Explanation */}
          <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-md">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-sm tracking-tight">Differential Diagnosis Hierarchy</span>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 text-[10px] font-bold">
                  Glass DDx Engine
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Stratifikasi diagnosis banding berbasis bukti. Kategori <strong>Can't-Miss</strong> memprioritaskan kedaruratan fatal yang wajib disingkirkan sebelum pasien dipulangkan.
              </p>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center bg-slate-800 rounded-xl p-1 text-xs shrink-0">
              <button
                onClick={() => setSelectedDDxCategory('all')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedDDxCategory === 'all' ? 'bg-slate-700 text-white' : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua (5)
              </button>
              <button
                onClick={() => setSelectedDDxCategory('cant-miss')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedDDxCategory === 'cant-miss' ? 'bg-rose-600 text-white' : 'text-rose-400 hover:text-white'
                }`}
              >
                Can't-Miss (3)
              </button>
              <button
                onClick={() => setSelectedDDxCategory('likely')}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  selectedDDxCategory === 'likely' ? 'bg-amber-600 text-white' : 'text-amber-400 hover:text-white'
                }`}
              >
                Most Likely (2)
              </button>
            </div>
          </div>

          {/* DDX CATEGORY 1: CAN'T-MISS RED FLAGS (CRITICAL) */}
          {(selectedDDxCategory === 'all' || selectedDDxCategory === 'cant-miss') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-rose-700 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  <span>1. Can't-Miss Diagnoses (Kedaruratan Fatal yang Wajib Disingkirkan)</span>
                </h3>
                <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                  Prioritas Tindakan Cepat
                </span>
              </div>

              {/* DDx Card 1: ACS */}
              <div className="p-4 rounded-2xl border-2 border-rose-200 bg-white shadow-xs space-y-2 hover:border-rose-300 transition-all">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
                    <span className="font-extrabold text-sm text-slate-900">
                      Acute Coronary Syndrome (NSTEMI / Unstable Angina)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                      ICD-10: I21.4
                    </span>
                  </div>
                  <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                    Status: Rule Out in Progress
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>Evaluasi Klinis:</strong> Nyeri dada exertional khas iskemia. Meskipun EKG saat ini tanpa elevasi ST akut, unstable angina atau NSTEMI dini tidak dapat disingkirkan tanpa pembacaan biomarker nekrosis miokard.
                </p>

                <div className="pt-1 flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="font-bold text-slate-900">Next Step Rule-Out:</span>
                  <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-semibold">
                    Troponin I Serial (0 & 3 Jam)
                  </span>
                  <span className="px-2 py-0.5 rounded bg-sky-50 text-sky-800 border border-sky-200 font-semibold">
                    Serial 12-Lead ECG bila nyeri rekuren
                  </span>
                </div>
              </div>

              {/* DDx Card 2: Pulmonary Embolism */}
              <div className="p-4 rounded-2xl border border-rose-200/80 bg-white shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="font-extrabold text-sm text-slate-900">Pulmonary Embolism (PE)</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                      ICD-10: I26.9
                    </span>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                    Kemungkinan Rendah (Wells: 1.5)
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Evaluasi Klinis:</strong> SpO2 normal 98%, tanpa takipnea saat istirahat, tanpa tanda trombosis vena dalam (DVT) pada tungkai.
                </p>
              </div>

              {/* DDx Card 3: Aortic Dissection */}
              <div className="p-4 rounded-2xl border border-rose-200/80 bg-white shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    <span className="font-extrabold text-sm text-slate-900">Acute Aortic Dissection</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono text-[10px] font-bold">
                      ICD-10: I71.0
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-lg">
                    Kemungkinan Sangat Rendah
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  <strong>Evaluasi Klinis:</strong> Tidak ada nyeri robek yang menjalar ke punggung interskapula. Pulsus defisit negatif; tekanan darah kedua lengan simetris (118/76 vs 120/78 mmHg).
                </p>
              </div>
            </div>
          )}

          {/* DDX CATEGORY 2: MOST LIKELY */}
          {(selectedDDxCategory === 'all' || selectedDDxCategory === 'likely') && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-amber-600" />
                  <span>2. Most Likely Diagnoses (Diagnosis Paling Sesuai Klinis)</span>
                </h3>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Pre-Test Probability Tinggi
                </span>
              </div>

              {/* Card 1: Stable Angina */}
              <div className="p-4 rounded-2xl border-2 border-amber-200 bg-amber-50/30 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                    <span className="font-extrabold text-sm text-slate-900">
                      Stable Angina Pectoris (CCS Class II)
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-white text-slate-800 border border-slate-200 font-mono text-[10px] font-bold">
                      ICD-10: I20.9
                    </span>
                  </div>
                  <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-lg">
                    Probabilitas: 78% (Tinggi)
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed">
                  <strong>Rasional Medis:</strong> Pola klasik: timbul saat beban aktivitas tertentu (naik tangga), rasa tertekan di dada, mereda &lt; 5 menit dengan istirahat, usia 58 tahun dengan faktor risiko hipertensi &amp; dislipidemia.
                </p>

                <div className="pt-1 flex items-center gap-2 text-[11px]">
                  <span className="font-bold text-slate-900">Gold Standard Konfirmasi:</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-semibold border border-amber-200">
                    Treadmill Stress Test (TMT) / Stress Echo
                  </span>
                </div>
              </div>

              {/* Card 2: Costochondritis */}
              <div className="p-4 rounded-2xl border border-slate-200 bg-white shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                    <span className="font-extrabold text-sm text-slate-900">
                      Costochondritis / Nyeri Dinding Dada Muskuloskeletal
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Probabilitas: 22%
                  </span>
                </div>
                <p className="text-xs text-slate-600">
                  Palpasi chondrosternal junction tidak memicu reproduksi nyeri lokal, membuat kemungkinan ini berkurang.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ================= 5. SECTION 3: INTEGRATED CLINICAL CALCULATORS ================= */}
      {activeSection === 'calculators' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-purple-900 text-white flex items-center justify-between shadow-md">
            <div>
              <h3 className="font-extrabold text-sm">Automated Clinical Risk Calculators</h3>
              <p className="text-xs text-purple-200 mt-0.5">
                Nilai risiko dikalkulasi otomatis dari data demografi, riwayat penyakit, dan telemetri OMRON terkini.
              </p>
            </div>
            <Calculator className="w-6 h-6 text-purple-300" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Calculator 1: Wells Score for PE */}
            <div className="p-4 rounded-2xl border border-sky-200 bg-white shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">Wells Score (Emboli Paru)</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  Low Risk
                </span>
              </div>
              <div className="text-center py-2">
                <span className="text-3xl font-extrabold text-sky-600">{calcWellsScore}</span>
                <span className="text-xs text-slate-500 block mt-1">Skor Klinis (Rentang: 0–12.5)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed border-t border-slate-100 pt-2">
                Probabilitas Emboli Paru klinis rendah (&lt; 2). Tidak ada takikardia, hemoptisis, atau imobilisasi.
              </p>
            </div>

            {/* Calculator 2: CHA2DS2-VASc */}
            <div className="p-4 rounded-2xl border border-sky-200 bg-white shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">CHA₂DS₂-VASc (Stroke Afib)</span>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[10px] font-bold">
                  Score 1
                </span>
              </div>
              <div className="text-center py-2">
                <span className="text-3xl font-extrabold text-blue-600">{calcCHA2DS2}</span>
                <span className="text-xs text-slate-500 block mt-1">1 Poin (Hipertensi Terkontrol)</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed border-t border-slate-100 pt-2">
                Risiko stroke tahunan ~1.3%. Terapi antikoagulan oral (DOAC) saat ini belum diindikasikan.
              </p>
            </div>

            {/* Calculator 3: ASCVD 10-Year Risk */}
            <div className="p-4 rounded-2xl border border-sky-200 bg-white shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-slate-900">AHA/ACC 10-Yr ASCVD Risk</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                  Intermediate
                </span>
              </div>
              <div className="text-center py-2">
                <span className="text-3xl font-extrabold text-amber-600">{calcASCVD}%</span>
                <span className="text-xs text-slate-500 block mt-1">Risiko Kardiovaskular 10 Tahun</span>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed border-t border-slate-100 pt-2">
                Kategori risiko sedang (7.5%–20%). Disarankan terapi Statin intensitas sedang untuk target LDL &lt; 100 mg/dL.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

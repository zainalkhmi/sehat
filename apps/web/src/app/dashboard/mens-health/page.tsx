'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SupabaseBadge } from '../../../components/SupabaseBadge';
import {
  ShieldCheck,
  Heart,
  Activity,
  ArrowLeft,
  Calendar,
  Users,
  Video,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Download,
  Share2,
  ExternalLink,
  Brain,
  Pill,
  Sparkles,
  TrendingUp,
  Award,
  Link as LinkIcon,
  Check
} from 'lucide-react';

export default function MensHealthClinicianPortal() {
  const [activeTab, setActiveTab] = useState<'overview' | 'microfluidics' | 'malaffi_fhir' | 'couple_bridge' | 'heor'>('overview');
  const [malaffiSyncSuccess, setMalaffiSyncSuccess] = useState(false);
  const [rxIssued, setRxIssued] = useState(false);

  const handleSyncMalaffi = () => {
    setMalaffiSyncSuccess(true);
    setTimeout(() => {
      alert('HL7 FHIR R4 Bundle berhasil disinkronkan dengan Malaffi HIE (Emirates ID: 784-1992-9182371-3).');
    }, 400);
  };

  const handleIssuePreconceptionRx = () => {
    setRxIssued(true);
    alert('E-Resep Antioksidan Prakonsepsi (CoQ10 200mg + L-Carnitine + Zinc) berhasil diterbitkan ke Apotek Cleveland Clinic Abu Dhabi.');
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
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-extrabold text-sm shadow">
                ♂
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">Men's Health & Preconception Workspace</span>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-bold">
                    Abu Dhabi DoH • Malaffi HIE
                  </span>
                </div>
                <div className="text-[10px] text-slate-400 flex items-center space-x-1.5">
                  <span className="text-sky-400 font-bold">صحة وحيوية الرجل</span>
                  <span>• Upstream Male Reproductive Care</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <SupabaseBadge />

            {/* Malaffi Push Button */}
            <button
              onClick={handleSyncMalaffi}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition ${
                malaffiSyncSuccess
                  ? 'bg-emerald-700 text-white border border-emerald-600'
                  : 'bg-sky-600 hover:bg-sky-500 text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>{malaffiSyncSuccess ? 'Malaffi HIE: Synced' : 'Sync to Malaffi HIE'}</span>
            </button>

            <div className="text-right hidden sm:block pl-2 border-l border-slate-800">
              <div className="text-sm font-semibold text-white">Dr. Khalid Al-Zaabi, MD</div>
              <div className="text-xs text-slate-400">Consultant Andrologist • Cleveland Clinic Abu Dhabi</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Patient Case Banner */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center space-x-3">
                <h1 className="text-xl font-extrabold text-slate-900">Tariq Al-Mansoor</h1>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                  Preconception Stage (Upstream)
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
                  Emirates ID: 784-1992-9182371-3
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-1 flex flex-wrap gap-x-4">
                <span>Usia: <strong>32 th</strong></span>
                <span>Malaffi MRN: <strong className="font-mono text-slate-800">AD-DOH-89210</strong></span>
                <span>Status Prakonsepsi: <strong>Merencanakan Kehamilan (4 Bulan)</strong></span>
                <span>Asuransi: <strong className="text-emerald-700 font-bold">Thiqa National Plan</strong></span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleIssuePreconceptionRx}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 shadow-xs ${
                  rxIssued
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                }`}
              >
                <Pill className="w-3.5 h-3.5" />
                <span>{rxIssued ? 'E-Resep Diterbitkan' : 'Resepkan Antioksidan Sperma'}</span>
              </button>
              <button
                onClick={() => alert('Membuka sesi telekonsultasi andrologi privat...')}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center space-x-1.5"
              >
                <Video className="w-3.5 h-3.5" />
                <span>Telekonsultasi Andrologi</span>
              </button>
            </div>
          </div>

          {/* Subtabs */}
          <div className="flex space-x-4 mt-4 border-b border-slate-100 pb-2 overflow-x-auto scrollbar-none">
            {[
              { id: 'overview', label: 'Ringkasan Risiko & Kardiometabolik', icon: Activity },
              { id: 'microfluidics', label: 'Hasil Tes Mikrofluidik Mandiri', icon: FileText, badge: 'WHO 6th Ed' },
              { id: 'couple_bridge', label: 'Koneksi Pasangan (Zero-Knowledge)', icon: LinkIcon, badge: 'Linked' },
              { id: 'malaffi_fhir', label: 'Malaffi HIE & Genomic (EGP)', icon: ShieldCheck },
              { id: 'heor', label: 'Health Economics (Thiqa ROI)', icon: TrendingUp },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2.5 flex items-center space-x-2 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                    isActive ? 'border-sky-600 text-sky-600' : 'border-transparent text-slate-500 hover:text-slate-800'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="text-[9px] px-1.5 py-0.2 rounded-full font-extrabold bg-sky-100 text-sky-800">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SUBTAB 1: CARDIOMETABOLIC & EXPLAINABLE RISK RADAR                        */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* 2 Cols: Multidimensional Risk Factors */}
            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                    <Brain className="w-5 h-5 text-sky-600" />
                    <span>Explainable Risk Architecture (Poros Vaskular-Andrologi)</span>
                  </h3>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Kategori Risiko: Rendah - Terkelola
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase">Pilar 1: Kardiometabolik & Endotel</span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Optimal</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 mt-1">
                      BMI 26.4 kg/m² • Tensi Darah 118/76 mmHg (MAP 77 mmHg) • Glukosa Puasa 92 mg/dL
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Kondisi mikrovaskular penis dan testis bebas dari aterosklerosis subklinis. Pasien tidak memerlukan intervensi kardiologis darurat.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-amber-900 uppercase">Pilar 2: Paparan Iklim Panas & Gaya Hidup Teluk</span>
                      <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded">Perhatian Moderat</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 mt-1">
                      Riwayat Sauna 2x/minggu • Paparan Panas Ekstrem Musim Panas Abu Dhabi • Shisha Mingguan
                    </div>
                    <p className="text-xs text-slate-600 mt-1">
                      Hipertermia skrotal dapat meningkatkan fragmentasi DNA sperma (DFI). Dianjurkan penghentian sauna dan pendinginan suhu skrotum 90 hari sebelum pembuahan.
                    </p>
                  </div>

                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 uppercase">Pilar 3: Skrining Suplemen & Steroid Gym</span>
                      <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Bebas Steroid</span>
                    </div>
                    <div className="text-sm font-semibold text-slate-900 mt-1">
                      Tanpa Riwayat Anabolic-Androgenic Steroids (AAS) atau Terapi Pengganti Testosteron (TRT)
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Poros hipofisis-gonad (HPG axis) intak dengan stimulasi gonadotropin alami yang terjaga (LH 4.2 mIU/mL, FSH 3.8 mIU/mL).
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 1 Col: Quick Andrology Clinical Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900 mb-3">Tindakan Klinis Andrologi</h3>
                <div className="p-3.5 rounded-xl bg-sky-50 border border-sky-100 text-xs space-y-2 mb-4">
                  <div className="font-bold text-sky-900">Rekomendasi Prakonsepsi (DoH Guidelines):</div>
                  <ul className="space-y-1.5 text-slate-700 list-disc pl-4">
                    <li>Mulai terapi antioksidan membran sperma (Ubiquinol CoQ10 200mg + Zinc 25mg).</li>
                    <li>Evaluasi USG Doppler skrotum jika palpasi menunjukkan varikokel subklinis.</li>
                    <li>Jadwalkan ulang uji mikrofluidik mandiri dalam 60 hari ke depan.</li>
                  </ul>
                </div>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => alert('Jadwal USG Doppler Skrotum dibuat di Departemen Radiologi Cleveland Clinic Abu Dhabi.')}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition"
                >
                  Jadwalkan USG Doppler Skrotum
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 2: AT-HOME MICROFLUIDIC SEMEN ANALYSIS VIEWER                      */}
        {/* ========================================================================= */}
        {activeTab === 'microfluidics' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Hasil Analisis Semen Mikrofluidik Mandiri (Smartphone Optical Edge AI)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Dianalisis menggunakan kit optik mandiri pasien berstandar WHO Manual for the Examination of Human Semen (6th Edition).
                </p>
              </div>
              <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full">
                Klasifikasi: Normozoospermia
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-500 uppercase">Volume Sampel</div>
                <div className="text-2xl font-black text-slate-900 mt-1">2.8 mL</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">Normal (Nilai rujukan &ge; 1.4 mL)</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-500 uppercase">Total Motile Count (TMSC)</div>
                <div className="text-2xl font-black text-emerald-700 mt-1">38.4 M/mL</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">Normal (Nilai rujukan &ge; 15 M/mL)</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-500 uppercase">Motilitas Progresif (PR)</div>
                <div className="text-2xl font-black text-slate-900 mt-1">54%</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">Normal (Nilai rujukan &ge; 30%)</div>
              </div>

              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <div className="text-xs font-bold text-slate-500 uppercase">DNA Fragmentation (DFI)</div>
                <div className="text-2xl font-black text-emerald-700 mt-1">14%</div>
                <div className="text-[11px] text-emerald-600 font-semibold mt-1">Optimal (&lt; 15% kerusakan DNA)</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 3: DUAL-CONSENT ZERO-KNOWLEDGE COUPLE BRIDGE                       */}
        {/* ========================================================================= */}
        {activeTab === 'couple_bridge' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Koneksi Prakonsepsi Pasangan (Dual-Consent Zero-Knowledge)</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Menjembatani evaluasi pria ke rekam medis OB/GYN pasangan secara aman tanpa membuka data sensitif individual.
                </p>
              </div>
              <span className="text-xs px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full flex items-center space-x-1">
                <Check className="w-3.5 h-3.5" />
                <span>Dual-Consent Active</span>
              </span>
            </div>

            <div className="p-4 bg-gradient-to-r from-rose-50 to-pink-50 border border-rose-200 rounded-xl flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-rose-900 uppercase">Profil Pasangan Terhubung:</div>
                <div className="text-base font-extrabold text-slate-900 mt-0.5">Fatima Al-Nuaimi (29 th)</div>
                <div className="text-xs text-slate-600">Dokter Kandungan: Dr. Reem Al-Hashemi, Sp.OG • Danat Al Emarat Hospital</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-bold text-slate-500">Skor Kesiapan Prakonsepsi Gabungan:</div>
                <div className="text-2xl font-black text-rose-600">88 / 100</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Dengan konfirmasi normozoospermia dan integritas DFI pria (14%), dokter kandungan pasangan dapat menghindari pemeriksaan invasif yang tidak perlu pada istri (seperti histerosalpingografi berulang) dan fokus pada pelacakan ovulasi alami.
            </p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 4: MALAFFI HIE & EMIRATI GENOME PROGRAM (EGP)                      */}
        {/* ========================================================================= */}
        {activeTab === 'malaffi_fhir' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Integrasi Malaffi HIE & Emirati Genome Program (EGP)</h3>
                <p className="text-xs text-slate-500">Interoperabilitas berbasis standar HL7 FHIR R4 resmi DoH Abu Dhabi</p>
              </div>
              <span className="text-xs px-2.5 py-1 bg-sky-100 text-sky-800 font-mono font-bold rounded">
                FHIR Resource: DiagnosticReport
              </span>
            </div>

            <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs rounded-xl overflow-x-auto">
              <pre>{`{
  "resourceType": "Bundle",
  "type": "transaction",
  "entry": [
    {
      "resource": {
        "resourceType": "Observation",
        "status": "final",
        "code": {
          "coding": [{ "system": "http://loinc.org", "code": "10582-5", "display": "Sperm concentration in Semen" }]
        },
        "subject": { "reference": "Patient/AD-DOH-89210", "identifier": { "value": "784-1992-9182371-3" } },
        "valueQuantity": { "value": 38.4, "unit": "10*6/mL", "system": "http://unitsofmeasure.org" }
      }
    },
    {
      "resource": {
        "resourceType": "Observation",
        "status": "final",
        "code": {
          "coding": [{ "system": "http://loinc.org", "code": "10584-1", "display": "Sperm motility progressive" }]
        },
        "valueQuantity": { "value": 54, "unit": "%", "system": "http://unitsofmeasure.org" }
      }
    }
  ]
}`}</pre>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUBTAB 5: THIQA / DAMAN HEALTH ECONOMICS (ROI)                             */}
        {/* ========================================================================= */}
        {activeTab === 'heor' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Health Economics & Cost Avoidance (Thiqa Insurance ROI)</h3>
            <p className="text-xs text-slate-500">
              Kalkulasi penghematan anggaran asuransi nasional UAE dari penanganan hulu faktor pria.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-500 uppercase">Biaya Rata-Rata 1 Siklus IVF/ICSI</div>
                <div className="text-2xl font-black text-rose-700 mt-1">~42,000 AED</div>
                <div className="text-[10px] text-slate-500 mt-1">Ditanggung skema asuransi Thiqa</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-500 uppercase">Biaya Skrining Digital & At-Home Kit</div>
                <div className="text-2xl font-black text-emerald-700 mt-1">~650 AED</div>
                <div className="text-[10px] text-emerald-600 font-semibold mt-1">Biaya pencegahan hulu 98% lebih efisien</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="text-xs font-bold text-slate-500 uppercase">Estimasi Cost Avoidance Pasien Ini</div>
                <div className="text-2xl font-black text-sky-700 mt-1">+41,350 AED</div>
                <div className="text-[10px] text-slate-500 mt-1">Penghematan langsung per pasangan</div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

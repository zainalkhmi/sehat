'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { SupabaseBadge } from '../../../components/SupabaseBadge';
import {
  Heart,
  Activity,
  Calendar,
  FileText,
  Shield,
  Smartphone,
  CheckCircle2,
  Clock,
  ArrowLeft,
  ChevronRight,
  User,
  AlertCircle,
  Pill,
  MessageSquare,
  Video,
  Send,
  Download,
  RefreshCw,
  Battery,
  Wifi,
  Droplets,
  Footprints,
  Moon,
  ShieldCheck,
  AlertTriangle,
  PhoneCall,
  Sparkles,
  ExternalLink,
  Flame,
  Check,
  X
} from 'lucide-react';

interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  indication: string;
  scheduleTime: string;
  status: 'taken' | 'pending' | 'skipped';
  stockRemaining: number;
  totalStock: number;
  daysRemaining: number;
  expiryDate: string;
  isUrgentExpiry: boolean;
  prescribingDoctor: string;
}

interface ChatMessage {
  id: string;
  sender: 'doctor' | 'patient';
  text: string;
  timestamp: string;
  attachment?: string;
}

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'medications' | 'vitals' | 'telehealth' | 'habits' | 'devices' | 'surveys' | 'consents'
  >('overview');

  // Interactive Medication State (synced with Mobile MyTherapy / Pillo Care)
  const [medications, setMedications] = useState<MedicationItem[]>([
    {
      id: 'med-1',
      name: 'Amlodipine Besylate',
      dosage: '5 mg • 1x sehari (Pagi)',
      indication: 'Antihipertensi (Calcium Channel Blocker)',
      scheduleTime: '07:00 WIB',
      status: 'taken',
      stockRemaining: 14,
      totalStock: 30,
      daysRemaining: 14,
      expiryDate: '15 Des 2026',
      isUrgentExpiry: false,
      prescribingDoctor: 'Dr. Sarah Wijaya, Sp.JP'
    },
    {
      id: 'med-2',
      name: 'Metformin HCl',
      dosage: '500 mg • 2x sehari (Bersama makan)',
      indication: 'Kontrol Glikemik Diabetes Melitus Tipe 2',
      scheduleTime: '12:30 WIB',
      status: 'pending',
      stockRemaining: 6,
      totalStock: 30,
      daysRemaining: 3,
      expiryDate: '28 Nov 2026',
      isUrgentExpiry: true,
      prescribingDoctor: 'Dr. Sarah Wijaya, Sp.JP'
    },
    {
      id: 'med-3',
      name: 'Candesartan Cilexetil',
      dosage: '8 mg • 1x sehari (Malam)',
      indication: 'Antihipertensi (Angiotensin II Receptor Blocker)',
      scheduleTime: '20:00 WIB',
      status: 'pending',
      stockRemaining: 22,
      totalStock: 30,
      daysRemaining: 22,
      expiryDate: '10 Feb 2027',
      isUrgentExpiry: false,
      prescribingDoctor: 'Dr. Sarah Wijaya, Sp.JP'
    },
    {
      id: 'med-4',
      name: 'Atorvastatin Calcium',
      dosage: '20 mg • 1x malam sebelum tidur',
      indication: 'Dislipidemia / Pencegahan Kardiovaskular Sekunder',
      scheduleTime: '21:00 WIB',
      status: 'pending',
      stockRemaining: 18,
      totalStock: 30,
      daysRemaining: 18,
      expiryDate: '18 Jan 2027',
      isUrgentExpiry: false,
      prescribingDoctor: 'Dr. Sarah Wijaya, Sp.JP'
    }
  ]);

  // Telehealth Chat Simulation State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
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
  const [newChatText, setNewChatText] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  // Toggle Medication Status Handler
  const handleToggleMed = (id: string, newStatus: 'taken' | 'pending' | 'skipped') => {
    setMedications((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const diff = newStatus === 'taken' && m.status !== 'taken' ? -1 : newStatus !== 'taken' && m.status === 'taken' ? 1 : 0;
          return {
            ...m,
            status: newStatus,
            stockRemaining: Math.max(0, m.stockRemaining + diff)
          };
        }
        return m;
      })
    );
  };

  // Send Message Handler
  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChatText.trim()) return;

    const userMsg: ChatMessage = {
      id: 'c-' + Date.now(),
      sender: 'patient',
      text: newChatText,
      timestamp: 'Baru saja'
    };
    setChatMessages((prev) => [...prev, userMsg]);
    setNewChatText('');

    // Simulated doctor reply after 1.5 seconds
    setTimeout(() => {
      setChatMessages((prev) => [
        ...prev,
        {
          id: 'c-rep-' + Date.now(),
          sender: 'doctor',
          text: 'Pesan Anda telah diterima oleh perawat jaga poli kardiologi. Dokter Sarah akan merespons sebelum sesi telekonsultasi Kamis nanti.',
          timestamp: 'Baru saja'
        }
      ]);
    }, 1200);
  };

  // Trigger Sync Simulation
  const handleManualSync = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
    }, 1000);
  };

  // Download FHIR PDF Clinical Report Simulation
  const handleDownloadReport = () => {
    setDownloadSuccess(true);
    setTimeout(() => {
      setDownloadSuccess(false);
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-slate-500 hover:text-slate-700 flex items-center text-sm font-medium">
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </Link>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-sm shadow-xs">
                PT
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900 text-sm">Patient Portal</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                    MRN: FH-88231
                  </span>
                </div>
                <div className="text-[10px] text-slate-500 flex items-center space-x-1.5">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span>SatuSehat IHS: <strong>IH-10029381</strong> (Connected)</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <SupabaseBadge />

            {/* Quick Actions */}
            <Link
              href="/chat"
              className="text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-semibold px-3 py-1.5 rounded-lg shadow-2xs transition flex items-center space-x-1"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>Glass AI Chat</span>
            </Link>

            <button
              onClick={handleDownloadReport}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center space-x-1.5 transition ${
                downloadSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200'
              }`}
              title="Unduh ringkasan medis FHIR PDF untuk kontrol dokter"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{downloadSuccess ? 'Tersimpan (PDF)' : 'Unduh Laporan PDF'}</span>
            </button>

            <Link
              href="/dashboard/patient/observations"
              className="text-xs bg-sky-600 hover:bg-sky-500 text-white font-semibold px-3 py-1.5 rounded-lg shadow-xs transition flex items-center space-x-1"
            >
              <Activity className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vital Observations</span>
            </Link>

            <div className="text-right hidden lg:block pl-2 border-l border-slate-200">
              <div className="text-sm font-semibold text-slate-900">Ahmad Kusuma (52 th)</div>
              <div className="text-xs text-slate-500">Hipertensi Stage 1 • DM Tipe 2</div>
            </div>

            <div className="w-9 h-9 rounded-full bg-sky-100 border border-sky-300 flex items-center justify-center text-sky-700 font-bold text-xs shadow-xs">
              AK
            </div>
          </div>
        </div>

        {/* Parity Tab Navigation (Harmonized with Mobile App) */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-6 overflow-x-auto scrollbar-none">
          {[
            { id: 'overview', label: 'Ringkasan Kesehatan', icon: Activity },
            { id: 'medications', label: 'Obat & Stok (4)', icon: Pill, badge: 'Perlu Refill' },
            { id: 'vitals', label: 'Tensi & Hemodinamik', icon: Heart },
            { id: 'telehealth', label: 'Halo Dokter (DPJP)', icon: MessageSquare, badge: '1 Resep' },
            { id: 'habits', label: 'Kebiasaan & Gaya Hidup', icon: Footprints },
            { id: 'devices', label: 'Wearable & Sync BLE', icon: Smartphone, badge: 'Live' },
            { id: 'surveys', label: 'Kuesioner Klinis', icon: FileText },
            { id: 'consents', label: 'Privasi & PDP', icon: Shield }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3.5 flex items-center space-x-2 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
                  isActive
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                      tab.badge === 'Perlu Refill'
                        ? 'bg-rose-100 text-rose-700'
                        : tab.badge === 'Live'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-sky-100 text-sky-700'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* ========================================================================= */}
        {/* TAB 1: HEALTH OVERVIEW                                                    */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Cross-Platform Sync Alert Banner */}
            <div className="bg-gradient-to-r from-sky-600 via-sky-700 to-indigo-700 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none -mr-16 -mt-16" />
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[11px] uppercase tracking-wider font-bold bg-white/20 backdrop-blur-xs px-2.5 py-1 rounded-full text-white">
                      Protokol Harian • Terkoneksi Mobile App
                    </span>
                    <span className="text-[11px] bg-emerald-400/20 text-emerald-100 border border-emerald-300/30 px-2 py-0.5 rounded-full flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span>HealthKit & BLE Aktif</span>
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold mt-2">Selamat Siang, Ahmad Kusuma</h2>
                  <p className="text-sky-100 text-sm mt-1 max-w-2xl">
                    Kepatuhan minum obat Anda minggu ini mencapai <strong>96%</strong>. Tensi pagi ini stabil pada{' '}
                    <strong>103/64 mmHg</strong> (Optimal). Ada 1 resep obat Metformin yang perlu refill segera.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => setActiveTab('medications')}
                    className="px-4 py-2.5 bg-white text-sky-700 font-bold text-xs rounded-xl hover:bg-sky-50 transition-colors shadow-sm flex items-center space-x-1.5"
                  >
                    <Pill className="w-4 h-4 text-sky-600" />
                    <span>Periksa Stok Obat</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('telehealth')}
                    className="px-4 py-2.5 bg-sky-500/30 hover:bg-sky-500/40 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors flex items-center space-x-1.5"
                  >
                    <Video className="w-4 h-4" />
                    <span>Ruang Telehealth</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Advanced Hemodynamic & Physiological Vitals Grid */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-slate-900 flex items-center space-x-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  <span>Parameter Vital & Hemodinamik Lanjutan (AHA / PERHI)</span>
                </h3>
                <div className="text-xs text-slate-500 flex items-center space-x-1">
                  <span>Sinkron otomatis via Apple Watch & Omron BLE</span>
                  <button
                    onClick={handleManualSync}
                    className="ml-2 p-1 text-slate-400 hover:text-sky-600 transition"
                    title="Refresh Data"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-sky-600' : ''}`} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Blood Pressure + MAP + PP */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Tekanan Darah</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      OPTIMAL (AHA)
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-slate-900">103/64</span>
                    <span className="text-sm font-semibold text-slate-500">mmHg</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">MAP (Arteri Rata-rata):</span>
                      <strong className="text-slate-700">77 mmHg (Optimal)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Pulse Pressure (PP):</span>
                      <strong className="text-slate-700">39 mmHg (Elastis)</strong>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>08:15 WIB • Pasca minum Amlodipine</span>
                  </div>
                </div>

                {/* Resting Heart Rate */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Detak Jantung Istirahat</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      NORMAL
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-slate-900">62</span>
                    <span className="text-sm font-semibold text-slate-500">BPM</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Variabilitas HRV:</span>
                      <strong className="text-slate-700">48 ms (Baik)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sensor:</span>
                      <strong className="text-slate-700">Apple Watch S9 Optical</strong>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                    <span>Sinus Rhythm • Tidak ada aritmia</span>
                  </div>
                </div>

                {/* Blood Glucose (Dexcom G7 CGM Continuous) */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Gula Darah (CGM)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      TIR 98%
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-slate-900">98</span>
                    <span className="text-sm font-semibold text-slate-500">mg/dL</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Status:</span>
                      <strong className="text-slate-700">Puasa (Normal 70-99)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Sensor Patch:</span>
                      <strong className="text-slate-700">Dexcom G7 (Sisa 6 hari)</strong>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                    <span>Continuous Telemetry Live</span>
                  </div>
                </div>

                {/* Oxygen Saturation SpO2 */}
                <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:border-sky-300 transition-all">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Saturasi Oksigen (SpO2)</span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      OPTIMAL
                    </span>
                  </div>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className="text-3xl font-extrabold text-slate-900">98%</span>
                  </div>
                  <div className="mt-2 pt-2 border-t border-slate-100 text-xs text-slate-600 space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Rata-rata Tidur:</span>
                      <strong className="text-slate-700">97.4% (Wellue Ring)</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Indeks Desaturasi (ODI):</span>
                      <strong className="text-slate-700">1.2 /jam (Normal &lt;5)</strong>
                    </div>
                  </div>
                  <div className="mt-2 text-[10px] text-slate-400 flex items-center">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                    <span>Bebas risiko Sleep Apnea</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Split Section: Pillo Medication Reminder Widget & Telehealth Care Team */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Pillo & MyTherapy Adherence Widget (2 Cols) */}
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold text-lg shadow-xs">
                      💊
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900 flex items-center space-x-2">
                        <span>Jadwal Obat Hari Ini (Pillo & MyTherapy Sync)</span>
                        <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                          Streak 7 Hari 🔥
                        </span>
                      </h3>
                      <p className="text-xs text-slate-500">
                        Sinkronisasi realtime dengan alarm interaktif ponsel Anda (pillo.care technology)
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('medications')}
                    className="text-xs text-sky-600 hover:text-sky-700 font-bold flex items-center"
                  >
                    <span>Kelola Semua Stok</span>
                    <ChevronRight className="w-4 h-4 ml-0.5" />
                  </button>
                </div>

                <div className="space-y-3">
                  {medications.map((med) => (
                    <div
                      key={med.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                        med.status === 'taken'
                          ? 'bg-slate-50/70 border-slate-200 text-slate-600'
                          : med.isUrgentExpiry
                          ? 'bg-rose-50/50 border-rose-200'
                          : 'bg-white border-slate-200 hover:border-sky-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div
                          className={`w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs mt-0.5 ${
                            med.status === 'taken'
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-sky-100 text-sky-700'
                          }`}
                        >
                          <Pill className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900 text-sm">{med.name}</span>
                            <span className="text-xs text-slate-500 font-medium">({med.dosage})</span>
                            {med.isUrgentExpiry && (
                              <span className="text-[10px] font-bold bg-rose-100 text-rose-700 px-1.5 py-0.2 rounded">
                                Stok Kritis: Sisa {med.stockRemaining} tab ({med.daysRemaining} hari)
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5 flex items-center space-x-3">
                            <span>Jadwal: <strong>{med.scheduleTime}</strong></span>
                            <span>•</span>
                            <span>Sisa Stok: <strong>{med.stockRemaining} tablet</strong></span>
                            <span>•</span>
                            <span>Exp: {med.expiryDate}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 self-end sm:self-center">
                        {med.status === 'taken' ? (
                          <span className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center space-x-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Sudah Diminum</span>
                          </span>
                        ) : (
                          <div className="flex space-x-1.5">
                            <button
                              onClick={() => handleToggleMed(med.id, 'taken')}
                              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                            >
                              Minum Sekarang
                            </button>
                            <button
                              onClick={() => handleToggleMed(med.id, 'skipped')}
                              className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg text-xs font-medium transition"
                            >
                              Lewati
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Halo Dokter Care Team Card (1 Col) */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-slate-900">Dokter Penanggung Jawab (DPJP)</h3>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      Online
                    </span>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-sm shadow-xs">
                        SW
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 text-sm">Dr. Sarah Wijaya, Sp.JP</div>
                        <div className="text-xs text-slate-500">Spesialis Jantung & Pembuluh Darah</div>
                        <div className="text-[11px] text-sky-700 font-semibold mt-0.5">RS Jantung Harapan Kita</div>
                      </div>
                    </div>
                  </div>

                  {/* Consultation Schedule */}
                  <div className="p-3.5 rounded-xl border border-sky-100 bg-sky-50/50 mb-4 text-xs text-slate-700 space-y-1.5">
                    <div className="flex items-center space-x-2 text-sky-900 font-bold">
                      <Calendar className="w-4 h-4 text-sky-600" />
                      <span>Jadwal Telekonsultasi Berikutnya:</span>
                    </div>
                    <div className="pl-6 font-semibold text-slate-800">
                      Kamis, 12 Nov 2026 • 10:00 WIB
                    </div>
                    <div className="pl-6 text-[11px] text-slate-500">
                      Agenda: Evaluasi target tekanan darah & penyesuaian dosis Amlodipine
                    </div>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => setActiveTab('telehealth')}
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>Buka Chat & Masuk Telehealth</span>
                  </button>
                  <a
                    href="tel:119"
                    className="w-full py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition flex items-center justify-center space-x-1.5"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>Emergency SOS (Panggilan Darurat RS)</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MEDICATIONS & STOCK MANAGEMENT (MYTHERAPY & PILLO CARE)             */}
        {/* ========================================================================= */}
        {activeTab === 'medications' && (
          <div className="space-y-6">
            {/* Header info */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                  <Pill className="w-6 h-6 text-sky-600" />
                  <span>Manajemen Resep Obat & Kontrol Sisa Stok (MyTherapy Sync)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Sinkronisasi resep aktif, alarm pengingat berbasis karakter Pillo, kalkulasi otomatis sisa hari, dan pencegahan obat kedaluwarsa.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => alert('Permintaan Refill Resep dikirimkan ke Dr. Sarah Wijaya dan Apotek RS Jantung Harapan.')}
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center space-x-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Request Refill Resep</span>
                </button>
              </div>
            </div>

            {/* Pillo Emotional Companion Banner */}
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl shadow-xs animate-bounce">
                  🔵
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm flex items-center space-x-2">
                    <span>Pillo Buddy: Tenang & Gembira (Calm & Happy)</span>
                    <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                      Pillo Care AI
                    </span>
                  </div>
                  <div className="text-xs text-slate-600 mt-0.5">
                    "Kerja bagus Ahmad! 3 dari 4 obat hari ini sudah Anda minum tepat waktu. Tetap pertahankan streak Anda!"
                  </div>
                </div>
              </div>
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-blue-900">Tingkat Kepatuhan (Adherence)</div>
                <div className="text-2xl font-black text-blue-600">96.4%</div>
              </div>
            </div>

            {/* Full Medication Stock Table */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                  Daftar Obat Aktif Terjadwal
                </span>
                <span className="text-xs text-slate-500">
                  Total <strong>4 Macam Obat</strong> • 1 Obat perlu segera ditebus
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {medications.map((med) => (
                  <div key={med.id} className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                    <div className="flex items-start space-x-4">
                      <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                        <Pill className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h4 className="font-bold text-slate-900 text-base">{med.name}</h4>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                            {med.dosage}
                          </span>
                          {med.isUrgentExpiry && (
                            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700 flex items-center space-x-1">
                              <AlertTriangle className="w-3 h-3" />
                              <span>Stok Kritis (Sisa 3 Hari)</span>
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-500 mt-1">
                          Indikasi: <strong className="text-slate-700">{med.indication}</strong> • DPJP:{' '}
                          <span className="text-slate-600">{med.prescribingDoctor}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-1 flex items-center space-x-4">
                          <span>Jadwal Harian: <strong className="text-slate-800">{med.scheduleTime}</strong></span>
                          <span>•</span>
                          <span>Kedaluwarsa: <strong className="text-slate-800">{med.expiryDate}</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Stock Progress & Actions */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full md:w-auto">
                      <div className="w-full sm:w-44 text-right">
                        <div className="flex justify-between text-xs font-semibold mb-1">
                          <span className="text-slate-500">Sisa Stok:</span>
                          <span className={med.stockRemaining <= 6 ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                            {med.stockRemaining} / {med.totalStock} tablet
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${
                              med.stockRemaining <= 6 ? 'bg-rose-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${(med.stockRemaining / med.totalStock) * 100}%` }}
                          />
                        </div>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Habis dalam ~{med.daysRemaining} hari ke depan
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {med.status === 'taken' ? (
                          <button
                            onClick={() => handleToggleMed(med.id, 'pending')}
                            className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center space-x-1"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>Diminum</span>
                          </button>
                        ) : (
                          <button
                            onClick={() => handleToggleMed(med.id, 'taken')}
                            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-xs transition"
                          >
                            Tandai Minum
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: VITALS & HEMODYNAMICS (AHA / ACC 2017 & PERHI STANDARDS)            */}
        {/* ========================================================================= */}
        {activeTab === 'vitals' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                    <Heart className="w-6 h-6 text-rose-500" />
                    <span>Evaluasi Hemodinamik & Vital Klinis</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Standarisasi data berdasarkan LOINC, UCUM, dan pedoman Konsensus Hipertensi PERHI / AHA 2017.
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full">
                    Target In-Range (TIR): 96%
                  </span>
                </div>
              </div>

              {/* Clinical Hemodynamic Explanation Card */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl mb-6 text-xs text-slate-700 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <strong className="text-slate-900 font-bold block mb-1">
                    Kalkulasi Mean Arterial Pressure (MAP):
                  </strong>
                  <p className="text-slate-600 leading-relaxed">
                    Rumus: <code className="bg-white px-1 py-0.5 rounded border border-slate-200">MAP = DBP + 1/3(SBP - DBP)</code>.
                    Nilai pasien saat ini: <strong>77 mmHg</strong> (Optimal range 70 - 100 mmHg). Menunjukkan perfusi organ vital ginjal dan otak berjalan sempurna tanpa beban resistensi vaskular berlebih.
                  </p>
                </div>
                <div>
                  <strong className="text-slate-900 font-bold block mb-1">
                    Pulse Pressure (Tekanan Nadi):
                  </strong>
                  <p className="text-slate-600 leading-relaxed">
                    Rumus: <code className="bg-white px-1 py-0.5 rounded border border-slate-200">PP = SBP - DBP</code>.
                    Nilai pasien saat ini: <strong>39 mmHg</strong> (Normal 30 - 50 mmHg). Menandakan kelenturan dinding aorta dan elastisitas vaskular yang sangat terjaga.
                  </p>
                </div>
              </div>

              {/* Full LOINC Telemetry Table */}
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200 text-xs sm:text-sm">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-4 py-3 text-left font-bold text-slate-700">Observasi Fisiologis</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700">Kode LOINC</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700">Hasil Pengukuran</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700">Sumber Alat</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700">Waktu Pengambilan</th>
                      <th className="px-4 py-3 text-left font-bold text-slate-700">Klasifikasi Klinis</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-900">Tekanan Darah (Sistolik/Diastolik)</td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">85354-9</td>
                      <td className="px-4 py-3 font-bold text-slate-900">103/64 mmHg</td>
                      <td className="px-4 py-3 text-slate-600">Omron BP5250 (BLE)</td>
                      <td className="px-4 py-3 text-slate-500">Hari Ini, 08:15 WIB</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                          Optimal (AHA)
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-900">Mean Arterial Pressure (MAP)</td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">8478-0</td>
                      <td className="px-4 py-3 font-bold text-slate-900">77 mmHg</td>
                      <td className="px-4 py-3 text-slate-600">Calculated Telemetry</td>
                      <td className="px-4 py-3 text-slate-500">Hari Ini, 08:15 WIB</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                          Adekuat (70-100)
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-900">Resting Heart Rate (Denyut Nadi)</td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">8867-4</td>
                      <td className="px-4 py-3 font-bold text-slate-900">62 BPM</td>
                      <td className="px-4 py-3 text-slate-600">Apple Watch Series 9</td>
                      <td className="px-4 py-3 text-slate-500">Hari Ini, 08:15 WIB</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                          Normal Sinus
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-900">Gula Darah Sewaktu (CGM Continuous)</td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">2339-0</td>
                      <td className="px-4 py-3 font-bold text-slate-900">98 mg/dL</td>
                      <td className="px-4 py-3 text-slate-600">Dexcom G7 CGM</td>
                      <td className="px-4 py-3 text-slate-500">Hari Ini, 08:15 WIB</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                          Target Terkontrol
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-semibold text-slate-900">Saturasi Oksigen (SpO2)</td>
                      <td className="px-4 py-3 text-slate-500 font-mono text-xs">59408-5</td>
                      <td className="px-4 py-3 font-bold text-slate-900">98 %</td>
                      <td className="px-4 py-3 text-slate-600">Wellue O2Ring Overnight</td>
                      <td className="px-4 py-3 text-slate-500">Kemarin, 23:45 WIB</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-bold">
                          Normal
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: HALO DOKTER & TELECONSULTATION HUB                                  */}
        {/* ========================================================================= */}
        {activeTab === 'telehealth' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column: Doctor Profile & Video Call Room Access */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center mx-auto shadow-md">
                    SW
                  </div>
                  <h3 className="font-bold text-slate-900 text-lg mt-3">Dr. Sarah Wijaya, Sp.JP</h3>
                  <div className="text-xs text-sky-700 font-semibold">Spesialis Jantung & Pembuluh Darah</div>
                  <div className="text-xs text-slate-500 mt-0.5">RS Jantung Harapan Kita • SIP: 446/182/2024</div>

                  <div className="mt-3 flex items-center justify-center space-x-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-emerald-700 font-bold">Online & Tersedia</span>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 space-y-3">
                  <div className="p-3 rounded-xl bg-sky-50 border border-sky-100 text-xs text-slate-700">
                    <div className="font-bold text-sky-900 mb-1">Sesi Telekonsultasi Terjadwal:</div>
                    <div className="font-semibold text-slate-900">Kamis, 12 Nov 2026 • 10:00 WIB</div>
                    <div className="text-slate-500 text-[11px] mt-0.5">Ruang Virtual WebRTC Terenkripsi E2E</div>
                  </div>

                  <button
                    onClick={() => alert('Membuka Ruang Telehealth Video Call WebRTC dengan Dr. Sarah Wijaya...')}
                    className="w-full py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center space-x-2"
                  >
                    <Video className="w-4 h-4" />
                    <span>Masuk Ruang Telehealth</span>
                  </button>
                </div>
              </div>

              {/* Active E-Prescription Card */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-900 text-sm flex items-center space-x-1.5">
                    <FileText className="w-4 h-4 text-sky-600" />
                    <span>E-Resep Digital Aktif</span>
                  </h4>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Valid SatuSehat
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="font-mono text-[11px] text-slate-500">No: RX-2026-1107-MET</div>
                  <div className="font-bold text-slate-800">Metformin HCl 500 mg (60 tablet)</div>
                  <div className="text-slate-600 text-[11px]">Signa: 2 x 1 tablet sehari bersama makan</div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-[11px]">
                    <span className="text-slate-500">Status: Siap ditebus</span>
                    <button
                      onClick={() => alert('Mengirimkan resep ke Apotek Rekanan RS Jantung Harapan...')}
                      className="text-sky-600 font-bold hover:underline"
                    >
                      Kirim ke Apotek
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Live Chat with DPJP */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col h-[580px]">
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70 rounded-t-2xl">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-full bg-sky-600 text-white font-bold text-xs flex items-center justify-center">
                    SW
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Konsultasi Dokter: Dr. Sarah Wijaya</div>
                    <div className="text-[11px] text-slate-500">Tersinkronisasi dengan aplikasi mobile pasien</div>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-medium">Enkripsi E2E Medis</span>
              </div>

              {/* Chat Messages Body */}
              <div className="flex-1 p-4 overflow-y-auto space-y-4">
                {chatMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.sender === 'patient' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-2xl p-4 text-xs leading-relaxed ${
                        msg.sender === 'patient'
                          ? 'bg-sky-600 text-white rounded-br-xs'
                          : 'bg-slate-100 text-slate-900 rounded-bl-xs border border-slate-200'
                      }`}
                    >
                      <p>{msg.text}</p>
                      {msg.attachment && (
                        <div className="mt-2 p-2 rounded-lg bg-white/10 border border-white/20 text-[11px] font-bold flex items-center space-x-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          <span>{msg.attachment}</span>
                        </div>
                      )}
                      <div
                        className={`text-[10px] mt-1 text-right ${
                          msg.sender === 'patient' ? 'text-sky-200' : 'text-slate-400'
                        }`}
                      >
                        {msg.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200 flex items-center space-x-2">
                <input
                  type="text"
                  value={newChatText}
                  onChange={(e) => setNewChatText(e.target.value)}
                  placeholder="Ketik pertanyaan atau keluhan Anda kepada dokter..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs focus:outline-hidden focus:ring-2 focus:ring-sky-500 text-slate-900"
                />
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-bold transition flex items-center space-x-1"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Kirim</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: HABITS & LIFESTYLE (SINKRONISASI MOBILE & HEALTHKIT)                */}
        {/* ========================================================================= */}
        {activeTab === 'habits' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                <Footprints className="w-6 h-6 text-sky-600" />
                <span>Pelacak Gaya Hidup & Kebiasaan Sehat (Habits)</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Data aktivitas fisik, hidrasi, dan arsitektur tidur yang disinkronkan langsung dari Apple HealthKit dan smartwatch.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Water Intake */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500">Asupan Air Minum</span>
                  <Droplets className="w-4 h-4 text-sky-500" />
                </div>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-slate-900">2.1</span>
                  <span className="text-sm font-semibold text-slate-500">/ 2.5 Liter</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mt-3">
                  <div className="h-full rounded-full bg-sky-500" style={{ width: '84%' }} />
                </div>
                <div className="text-[11px] text-slate-500 mt-2">84% dari target hidrasi harian</div>
              </div>

              {/* Steps (Cardio Walk) */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500">Langkah Jalan Kaki</span>
                  <Footprints className="w-4 h-4 text-emerald-500" />
                </div>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-slate-900">7,420</span>
                  <span className="text-sm font-semibold text-slate-500">/ 10,000</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mt-3">
                  <div className="h-full rounded-full bg-emerald-500" style={{ width: '74%' }} />
                </div>
                <div className="text-[11px] text-slate-500 mt-2">Jalan aerobik moderat 42 menit</div>
              </div>

              {/* Sleep Duration */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500">Kualitas & Durasi Tidur</span>
                  <Moon className="w-4 h-4 text-indigo-500" />
                </div>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-slate-900">7.5</span>
                  <span className="text-sm font-semibold text-slate-500">Jam</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mt-3">
                  <div className="h-full rounded-full bg-indigo-500" style={{ width: '95%' }} />
                </div>
                <div className="text-[11px] text-slate-500 mt-2">Deep Sleep: 1.8 jam • REM: 2.1 jam</div>
              </div>

              {/* Relaxation / Respiration */}
              <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-slate-500">Latihan Relaksasi</span>
                  <Activity className="w-4 h-4 text-rose-500" />
                </div>
                <div className="mt-2 flex items-baseline space-x-2">
                  <span className="text-3xl font-extrabold text-slate-900">15</span>
                  <span className="text-sm font-semibold text-slate-500">Menit</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden mt-3">
                  <div className="h-full rounded-full bg-rose-500" style={{ width: '100%' }} />
                </div>
                <div className="text-[11px] text-slate-500 mt-2">Pernapasan lambat (Respirasi 6 rpm)</div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 6: CONNECTED DEVICES & WEARABLE SENSORS (MOBILE BRIDGE)                */}
        {/* ========================================================================= */}
        {activeTab === 'devices' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 flex items-center space-x-2">
                  <Smartphone className="w-6 h-6 text-sky-600" />
                  <span>Wearable Devices & Sensor IoT Medis</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Telemetri disinkronkan secara kontinu melalui Stanford Spezi Mobile Gateway via Apple HealthKit & Bluetooth Smart BLE.
                </p>
              </div>
              <span className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-full text-xs font-bold flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>FHIR Gateway: Realtime Connected</span>
              </span>
            </div>

            {/* Explainer Card */}
            <div className="p-4 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-xl text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 font-bold block mb-1">
                Alur Sinkronisasi Cross-Platform (Mobile App ke Web Portal):
              </strong>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                <div className="p-3 bg-white rounded-lg border border-sky-100 shadow-xs">
                  <div className="font-bold text-sky-700 mb-1">1. Sensor Wearable</div>
                  <div>Apple Watch, Dexcom CGM, & Tensimeter BLE membaca sinyal fisiologis pasien.</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-sky-100 shadow-xs">
                  <div className="font-bold text-indigo-700 mb-1">2. Spezi Mobile App</div>
                  <div>Ponsel memvalidasi integritas data, menstandarkan ke LOINC, dan sync ke Supabase.</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-sky-100 shadow-xs">
                  <div className="font-bold text-emerald-700 mb-1">3. Web Portal Dokter & Pasien</div>
                  <div>Data langsung tampil secara realtime tanpa perlu kabel data atau export manual.</div>
                </div>
              </div>
            </div>

            {/* Device List */}
            <div className="space-y-3">
              {/* Apple Watch S9 */}
              <div className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-sky-300 transition">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold">
                    ⌚
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Apple Watch Series 9 (HealthKit)</div>
                    <div className="text-xs text-slate-500">
                      Sinkronisasi 24/7: Resting Heart Rate, HRV, SpO2, Langkah Kaki
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-slate-500 flex items-center space-x-1">
                    <Battery className="w-4 h-4 text-emerald-600" />
                    <span>88%</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Sinkron 2 mnt lalu
                  </span>
                </div>
              </div>

              {/* Omron BP5250 */}
              <div className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-sky-300 transition">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold">
                    🩺
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Omron BP5250 Tensimeter Lengan (BLE)</div>
                    <div className="text-xs text-slate-500">
                      Standardized BLE GATT Blood Pressure Profile • LOINC 85354-9
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="text-slate-500 flex items-center space-x-1">
                    <Battery className="w-4 h-4 text-emerald-600" />
                    <span>92%</span>
                  </span>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Paired (Auto-Sync)
                  </span>
                </div>
              </div>

              {/* Dexcom G7 CGM */}
              <div className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-sky-300 transition">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                    🩸
                  </div>
                  <div>
                    <div className="font-bold text-slate-900 text-sm">Dexcom G7 Continuous Glucose Monitor</div>
                    <div className="text-xs text-slate-500">
                      Pemantauan Glukosa Interstisial Realtime • Sisa Sensor: <strong>6 Hari</strong>
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-xs">
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                    Streaming Setiap 5 Mnt
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: QUESTIONNAIRES & SCREENINGS                                        */}
        {/* ========================================================================= */}
        {activeTab === 'surveys' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <h3 className="text-xl font-bold text-slate-900">Kuesioner Klinis Standar FHIR R4</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl border border-slate-200 hover:border-sky-500 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold">PHQ-9</span>
                  <span className="text-xs text-slate-500">Jadwal Hari Ini</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-2">Patient Health Questionnaire - 9</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Instrumen skrining depresi dan kesehatan mental yang divalidasi klinis (LOINC 44249-1).
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">9 pertanyaan • ~4 menit</span>
                  <button
                    onClick={() => alert('Membuka kuesioner PHQ-9...')}
                    className="px-3.5 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-bold hover:bg-sky-700 transition"
                  >
                    Mulai Skrining
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 hover:border-sky-500 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">Selesai</span>
                  <span className="text-xs text-slate-500">3 hari yang lalu</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-2">GAD-7 Anxiety Screening</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Skala kecemasan umum (LOINC 70274-6). Skor: 3/21 (Kecemasan Minimal / Terkendali).
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-emerald-700">Skor: 3/21 (Minimal)</span>
                  <button
                    onClick={() => alert('Menampilkan lembar respons GAD-7...')}
                    className="px-3.5 py-1.5 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200 transition"
                  >
                    Lihat Jawaban
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 8: CONSENTS & PRIVACY (UU PDP NO. 27/2022)                            */}
        {/* ========================================================================= */}
        {activeTab === 'consents' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Manajemen Persetujuan Pasien (UU PDP No. 27/2022)</h3>
              <p className="text-xs text-slate-500 mt-1">
                Kedaulatan data kesehatan pribadi berada sepenuhnya di tangan Anda. Anda berhak memberi atau mencabut persetujuan sharing data kapan pun.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-900 text-sm">Persetujuan Perawatan Klinis: Dr. Sarah Wijaya, Sp.JP</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Akses rekam medis, vital, riwayat obat, dan hasil survei untuk kepentingan diagnosis & perawatan DPJP.
                  </div>
                  <div className="text-xs text-emerald-600 font-bold mt-2 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    <span>Aktif • Disetujui pada 14 Okt 2026</span>
                  </div>
                </div>
                <button
                  onClick={() => alert('Persetujuan berhasil diperbarui.')}
                  className="px-3.5 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-lg text-xs font-bold transition"
                >
                  Kelola Izin
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-900 text-sm">Integrasi Platform Nasional SATUSEHAT Kemenkes RI</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    Sinkronisasi otomatis rekam medis elektronik ke database RME Nasional sesuai Permenkes No. 24/2022.
                  </div>
                  <div className="text-xs text-emerald-600 font-bold mt-2 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    <span>Terverifikasi • IHS Number: IH-10029381</span>
                  </div>
                </div>
                <button
                  onClick={() => alert('SatuSehat status: Aktif')}
                  className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold transition"
                >
                  Terhubung
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

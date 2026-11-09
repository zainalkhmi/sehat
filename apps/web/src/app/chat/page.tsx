'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import {
  PanelLeft,
  Watch,
  Database,
  Plus,
  Upload,
  Paperclip,
  Mic,
  ArrowUp,
  Maximize2,
  Minimize2,
  Activity,
  Heart,
  Sparkles,
  Stethoscope,
  Pill,
  Check,
  CheckCircle2,
  AlertCircle,
  X,
  ExternalLink,
  Shield,
  HeartPulse,
  Share2,
  FileCheck,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Clock,
  ArrowRight,
  AudioLines,
  FileText,
  Volume2,
  FlaskConical,
  Wifi,
  Battery,
  User,
  Zap,
  Download,
  FilePlus,
  Info,
  Repeat,
  Sun,
  Moon,
  Flame,
  Droplets,
  Leaf
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  modelUsed?: string;
  citations?: string[];
  actionCard?: {
    type: 'vitals' | 'medication' | 'lab' | 'alert';
    title: string;
    description: string;
    data?: Record<string, string>;
  };
}

interface ConnectedDevice {
  id: string;
  name: string;
  category: 'blood_pressure' | 'wearable' | 'cgm' | 'oximeter';
  status: 'connected' | 'syncing' | 'disconnected';
  battery: number;
  lastSync: string;
  metricLabel: string;
  metricValue: string;
  metricUnit: string;
  statusBadge: string;
}

interface ConnectedRecord {
  id: string;
  provider: string;
  type: string;
  fhirVersion: string;
  encounterId: string;
  lastSync: string;
  status: 'active' | 'synced';
}

interface UploadedDocument {
  id: string;
  name: string;
  size: string;
  uploadedAt: string;
  type: string;
  ocrStatus: 'completed' | 'processing';
  summary?: string;
}

interface GeneratedFile {
  id: string;
  title: string;
  category: string;
  createdAt: string;
  size: string;
  format: 'PDF' | 'FHIR JSON';
}

export default function GlassAIChatPage() {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<'patient' | 'data' | 'documents' | 'habits'>('habits');
  const [dataSubFilter, setDataSubFilter] = useState<'metrics' | 'records'>('metrics');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Behavioral & Setback Recovery State (Future Health Challenge)
  const [bankedDays, setBankedDays] = useState<number>(24);
  const [isSoftLanded, setIsSoftLanded] = useState<boolean>(false);
  const [isHeatShieldActive, setIsHeatShieldActive] = useState<boolean>(true);
  const [isRamadanMode, setIsRamadanMode] = useState<boolean>(false);
  const [isArabicMode, setIsArabicMode] = useState<boolean>(false);
  const [selectedHabitCategory, setSelectedHabitCategory] = useState<'all' | 'movement' | 'nutrition' | 'sleep' | 'cessation'>('all');

  const handleTriggerSetbackRecovery = () => {
    setIsSoftLanded(true);
    setMessages((prev) => [
      ...prev,
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: `🌟 **Protokol Setback Recovery Berhasil Diterapkan (Future Health Challenge)**\n\nSistem mendeteksi hambatan aktivitas (kelelahan/cuaca panas/lembur). Sesuai prinsip **Anti-Streak Shaming**:\n- **Modal 24 hari Anda tetap tersimpan penuh** (tidak ada reset ke nol).\n- Target hari ini disesuaikan (*Soft Landing*) menjadi: **2 menit peregangan otot ringan di sofa / kursi kantor**.\n- *Lapse Recovery Rate* tercatat optimal di angka **1.3 hari** (Top 5% Resilient Abu Dhabi Ecosystem).`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'Adaptive Behavioral Engine v2',
        citations: ['Fogg Behavior Model (Tiny Habits)', 'COM-B Behavioral Framework', 'Abu Dhabi DOH Prevention Standards'],
        actionCard: {
          type: 'alert',
          title: 'Soft Landing: 2-Menit Peregangan Ringan',
          description: 'Hambatan terdeteksi. Target diturunkan sementara tanpa sanksi untuk menjaga momentum neuroplastisitas kebiasaan.',
          data: {
            'Banked Days': '24 Hari Tersimpan',
            'Lapse Recovery Rate': '1.3 Hari',
            'Penalti / Streak Reset': 'Nol (Dilarang)',
            'Status': 'Soft Landing Aktif'
          }
        }
      }
    ]);
  };

  // Modals
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState(false);
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Audio / Speech State
  const [isRecordingAudio, setIsRecordingAudio] = useState(false);
  const [audioTranscript, setAudioTranscript] = useState('');

  // Model Selector
  const [selectedModel, setSelectedModel] = useState<'Standard' | 'Clinical Pro' | 'Evidence RAG'>('Standard');
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isTemplateMenuOpen, setIsTemplateMenuOpen] = useState(false);

  // Chat State
  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Connected Sources State
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([
    {
      id: 'dev-omron-1',
      name: 'OMRON Complete™ Smart Blood Pressure + EKG',
      category: 'blood_pressure',
      status: 'connected',
      battery: 92,
      lastSync: 'Baru saja',
      metricLabel: 'Tekanan Darah (LOINC 85354-9)',
      metricValue: '118/76',
      metricUnit: 'mmHg',
      statusBadge: 'AHA Normal • Dip Circadian Normal'
    },
    {
      id: 'dev-aolon-1',
      name: 'Aolon GT6 Pro (Google Health Connect)',
      category: 'wearable',
      status: 'connected',
      battery: 88,
      lastSync: 'Baru saja',
      metricLabel: 'PPG Heart Rate & SpO2',
      metricValue: '74 bpm • 98% SpO2',
      metricUnit: 'LOINC 8867-4',
      statusBadge: 'Google Health Connect Active'
    }
  ]);
  const [connectedRecords, setConnectedRecords] = useState<ConnectedRecord[]>([
    {
      id: 'rec-satusehat-1',
      provider: 'SatuSehat Kemenkes RI',
      type: 'HL7 FHIR R4 Patient Clinical Record',
      fhirVersion: '4.0.1',
      encounterId: 'IH-10029381',
      lastSync: 'Baru saja',
      status: 'synced'
    }
  ]);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([
    {
      id: 'doc-lab-1',
      name: 'Hasil_Lab_Profil_Lipid_Glukosa_2026.pdf',
      size: '1.4 MB',
      uploadedAt: 'Hari ini, 08:30 WIB',
      type: 'FHIR DiagnosticReport',
      ocrStatus: 'completed',
      summary: 'Kolesterol Total 188 mg/dL, Trigliserida 142 mg/dL, Glukosa Puasa 104 mg/dL, HbA1c 5.8%.'
    },
    {
      id: 'doc-ekg-1',
      name: 'EKG_12_Lead_RSHS_Bandung.pdf',
      size: '840 KB',
      uploadedAt: 'Kemarin, 14:15 WIB',
      type: 'Diagnostic Electrocardiogram',
      ocrStatus: 'completed',
      summary: 'Normal Sinus Rhythm 72 bpm, Interval PR & QTc normal, tanpa tanda iskemik akut.'
    }
  ]);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([
    {
      id: 'gen-encounter-1',
      title: 'Ringkasan_Klinis_Tele-Kardiologi_FHIR.pdf',
      category: 'Clinical Summary (AI Encounter)',
      createdAt: 'Hari ini, 10:45 WIB',
      size: '420 KB',
      format: 'PDF'
    }
  ]);

  // Patient Overview State
  const [isOverviewGenerated, setIsOverviewGenerated] = useState(true);
  const [isRefreshingOverview, setIsRefreshingOverview] = useState(false);
  const [selectedOrgan, setSelectedOrgan] = useState<string | null>(null);

  const handleRefreshOverview = () => {
    setIsRefreshingOverview(true);
    setTimeout(() => {
      setIsOverviewGenerated((prev) => !prev);
      setIsRefreshingOverview(false);
    }, 600);
  };

  // Auto-scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Handle Quick Chips
  const handleQuickChip = (prompt: string) => {
    setInputMessage(prompt);
  };

  // Connect Device Handler
  const handleConnectDevice = (type: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      if (type === 'omron') {
        const newDevice: ConnectedDevice = {
          id: 'dev-omron-1',
          name: 'OMRON Complete™ Smart Blood Pressure + EKG',
          category: 'blood_pressure',
          status: 'connected',
          battery: 92,
          lastSync: 'Baru saja',
          metricLabel: 'Tekanan Darah (LOINC 85354-9)',
          metricValue: '118/76',
          metricUnit: 'mmHg',
          statusBadge: 'AHA Normal • Dip Circadian Normal'
        };
        setConnectedDevices((prev) => [...prev.filter((d) => d.id !== newDevice.id), newDevice]);
      } else if (type === 'apple') {
        const newDevice: ConnectedDevice = {
          id: 'dev-apple-1',
          name: 'Apple Watch Ultra 2 (Spezi HealthKit)',
          category: 'wearable',
          status: 'connected',
          battery: 88,
          lastSync: '1 menit lalu',
          metricLabel: 'Resting Heart Rate & HRV',
          metricValue: '72 bpm • 48 ms',
          metricUnit: 'LOINC 8867-4',
          statusBadge: 'Continuous Telemetry Active'
        };
        setConnectedDevices((prev) => [...prev.filter((d) => d.id !== newDevice.id), newDevice]);
      } else if (type === 'dexcom') {
        const newDevice: ConnectedDevice = {
          id: 'dev-dexcom-1',
          name: 'Dexcom G7 Continuous Glucose Monitor (CGM)',
          category: 'cgm',
          status: 'connected',
          battery: 100,
          lastSync: '3 menit lalu',
          metricLabel: 'Interstitial Glucose',
          metricValue: '104',
          metricUnit: 'mg/dL (LOINC 2339-0)',
          statusBadge: 'In-Range (TIR 98%)'
        };
        setConnectedDevices((prev) => [...prev.filter((d) => d.id !== newDevice.id), newDevice]);
      } else if (type === 'aolon') {
        const newDevice: ConnectedDevice = {
          id: 'dev-aolon-1',
          name: 'Aolon GT6 Pro (Google Health Connect)',
          category: 'wearable',
          status: 'connected',
          battery: 88,
          lastSync: 'Baru saja',
          metricLabel: 'PPG Heart Rate & SpO2',
          metricValue: '74 bpm • 98% SpO2',
          metricUnit: 'LOINC 8867-4',
          statusBadge: 'Google Health Connect Active'
        };
        setConnectedDevices((prev) => [...prev.filter((d) => d.id !== newDevice.id), newDevice]);
      }
      setIsGenerating(false);
      setIsDeviceModalOpen(false);
      setActiveTab('data');
      setDataSubFilter('metrics');
    }, 600);
  };

  // Connect Health Record Handler
  const handleConnectRecord = (provider: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      const newRecord: ConnectedRecord = {
        id: `rec-${Date.now()}`,
        provider: provider,
        type: 'HL7 FHIR R4 Core Bundle',
        fhirVersion: '4.0.1',
        encounterId: 'ENC-2026-0881',
        lastSync: 'Baru saja',
        status: 'synced'
      };
      setConnectedRecords((prev) => [...prev, newRecord]);

      // Also add clinical documents from this provider
      const newDoc: UploadedDocument = {
        id: `doc-${Date.now()}`,
        name: `${provider.replace(/\s+/g, '_')}_Discharge_Summary_2026.pdf`,
        size: '1.8 MB',
        uploadedAt: 'Hari ini, 09:30 WIB',
        type: 'FHIR DiagnosticReport',
        ocrStatus: 'completed',
        summary: 'Pemeriksaan kardiovaskular stabil, evaluasi hipertensi esensial, profil lipid terkontrol.'
      };
      setUploadedDocuments((prev) => [...prev, newDoc]);

      setIsGenerating(false);
      setIsRecordModalOpen(false);
      setActiveTab('data');
      setDataSubFilter('records');
    }, 700);
  };

  // Handle Document Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const newDoc: UploadedDocument = {
        id: `upload-${Date.now()}`,
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        uploadedAt: 'Baru saja',
        type: file.type || 'Dokumen Klinis',
        ocrStatus: 'completed',
        summary: 'Dokumen dianalisis oleh Sehat MedX Vision. Data parameter diekstraksi ke FHIR R4.'
      };
      setUploadedDocuments((prev) => [newDoc, ...prev]);
      setActiveTab('documents');

      // Add notification in chat
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          text: `Saya telah menerima dan menganalisis berkas **${file.name}**. Seluruh parameter klinis dan nilai laboratorium telah diekstraksi ke panel Data & Dokumen Anda. Apakah ada aspek spesifik dari hasil ini yang ingin kita bedah bersama?`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: selectedModel,
          citations: ['LOINC Clinical Laboratory Standard', 'SatuSehat DiagnosticReport Standard']
        }
      ]);
    }
  };

  // Create AI Clinical File
  const handleGenerateAIFile = () => {
    const newFile: GeneratedFile = {
      id: `gen-${Date.now()}`,
      title: `SOAP_Clinical_Summary_Encounter_${new Date().toISOString().slice(0, 10)}.pdf`,
      category: 'Clinical Encounter Note (SOAP)',
      createdAt: 'Baru saja',
      size: '482 KB',
      format: 'PDF'
    };
    setGeneratedFiles((prev) => [newFile, ...prev]);
    setActiveTab('documents');
  };

  // Handle Send Message
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = inputMessage.trim();
    if (!query) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsGenerating(true);

    // AI Medical reasoning response
    setTimeout(() => {
      let replyText = '';
      let citations: string[] = [];
      let actionCard: ChatMessage['actionCard'] = undefined;

      const lower = query.toLowerCase();

      if (lower.includes('tensi') || lower.includes('tekanan darah') || lower.includes('blood pressure') || lower.includes('omron')) {
        const bpValue = connectedDevices.find((d) => d.category === 'blood_pressure')?.metricValue || '118/76 mmHg';
        replyText = `Berdasarkan telemetri perangkat **OMRON Complete™** yang terhubung, tekanan darah terkini pasien berada di angka **${bpValue}** (Kategori **Normal** menurut PERHI 2024 & AHA/ACC Guidelines).\n\nAnalisis Circadian Dipping menunjukkan penurunan tekanan darah nocturnal sebesar 12.4% (*Normal Dipper*), yang mengindikasikan proteksi kardiovaskular optimal dan efektivitas terapi Amlodipine 5 mg OD pagi hari.`;
        citations = [
          'Konsensus PERHI 2024: Penatalaksanaan Hipertensi Terkini',
          'AHA/ACC 2024 Ambulatory Blood Pressure Monitoring Standards'
        ];
        actionCard = {
          type: 'vitals',
          title: 'Hemodinamik Stabil (LOINC 85354-9)',
          description: `Reading terkini: ${bpValue} • Nadi: 72 bpm • Risiko komplikasi rendah.`,
          data: {
            Systolic: '118 mmHg',
            Diastolic: '76 mmHg',
            Status: 'Normal Dipper'
          }
        };
      } else if (lower.includes('obat') || lower.includes('medication') || lower.includes('amlodipine') || lower.includes('metformin')) {
        replyText = `Regimen pengobatan aktif saat ini:\n1. **Amlodipine Besylate 5 mg** (1x sehari pagi) - Kepatuhan minum obat 96% tercatat via Pillo Reminder.\n2. **Metformin HCl 500 mg** (2x sehari bersama makan) - Kontrol glikemik stabil.\n\nTidak ditemukan interaksi obat mayor (*No Major Drug-Drug Interactions detected*). Sisa stok Metformin tinggal 3 hari; apakah Anda ingin mengajukan persetujuan isi ulang (*Prescription Refill*) ke dokter DPJP?`;
        citations = [
          'FDA Drug Interaction Database 2026',
          'Katalog Formularium Nasional Kemenkes RI'
        ];
        actionCard = {
          type: 'medication',
          title: 'Peringatan Sisa Stok Obat',
          description: 'Metformin HCl 500mg tersisa untuk 3 hari pemakaian (6 tablet tersisa).',
          data: {
            'Amlodipine 5mg': 'Tersedia 14 hari',
            'Metformin 500mg': 'Perlu Isi Ulang Segera'
          }
        };
      } else if (lower.includes('lab') || lower.includes('hasil') || lower.includes('test') || lower.includes('kolesterol')) {
        replyText = `Menganalisis hasil laboratorium dari rekam medis yang tersinkronisasi:\n- **HbA1c**: **5.8%** (Target < 6.5% - Terkontrol baik)\n- **Kolesterol Total**: **185 mg/dL** (Target < 200 mg/dL - Normal)\n- **Kolesterol LDL**: **94 mg/dL** (Target pasien berisiko moderat < 100 mg/dL)\n- **Trigliserida**: **142 mg/dL**\n\nSecara keseluruhan profil kardiometabolik berada dalam zona target terapeutik.`;
        citations = [
          'PERKENI 2023 Panduan Pengelolaan Diabetes Melitus',
          'NCEP ATP III Lipid Profile Classification'
        ];
        actionCard = {
          type: 'lab',
          title: 'Panel Kardiometabolik Normal',
          description: 'HbA1c 5.8% & LDL 94 mg/dL mencerminkan kontrol metabolik yang solid.',
          data: {
            'HbA1c': '5.8% (Target < 6.5%)',
            'LDL-C': '94 mg/dL',
            'Kreatinin': '0.9 mg/dL (eGFR > 90)'
          }
        };
      } else if (lower.includes('habit') || lower.includes('kebiasaan') || lower.includes('recovery') || lower.includes('setback') || lower.includes('gagal') || lower.includes('abu dhabi')) {
        replyText = `Menganalisis sistem **Sustaining Healthy Behaviors (Future Health Challenge - Abu Dhabi Ecosystem)**:\n\n1. **Prinsip Anti-Streak Shaming**: Kami menolak penghakiman saat jadwal bolong. Modal **24 hari** Anda tersimpan permanen (*Banked Health Equity*).\n2. **Deteksi Hambatan & Soft Landing**: Jika terdeteksi lelah, stres kerja, atau cuaca panas Abu Dhabi (41°C), target otomatis diturunkan ke mikro-langkah 2 menit tanpa rasa bersalah.\n3. **Lapse Recovery Rate (LRR)**: Pengguna sistem kami bangkit kembali dalam rata-rata **1.3 hari** (jauh melampaui rata-rata industri 14 hari).\n4. **Korelasi Biomarker**: Penurunan tekanan darah sistolik rata-rata -6 mmHg berkorelasi langsung dengan kepatuhan mikro-stroll 7 menit pasca-makan.`;
        citations = [
          'Stanford Behavioral Design Lab (Fogg Behavior Model)',
          'Abu Dhabi Department of Health (DoH) Population Health Framework',
          'COM-B Model of Behavior Change (Michie et al.)'
        ];
        actionCard = {
          type: 'vitals',
          title: 'Behavioral Resilience: LRR 1.3 Hari',
          description: 'Kecepatan pemulihan pasca hambatan terbukti mempertahankan kebiasaan hingga 90 hari.',
          data: {
            'Banked Equity': '24 Hari Tersimpan',
            'Lapse Recovery Rate': '1.3 Hari (Top 5%)',
            'Heat Shield': '41°C Indoor Mode',
            '90-Day Retention': '84% Terjaga'
          }
        };
      } else {
        replyText = `Terima kasih atas pertanyaannya. Saya mengintegrasikan seluruh data riwayat klinis **Ahmad Kusuma**, telemetri sensor terkoneksi, serta dokumen rekam medis yang diunggah.\n\nApakah ada gejala spesifik, pemantauan perangkat, atau instruksi tindak lanjut dokter yang ingin Anda klarifikasi lebih lanjut?`;
        citations = ['Glass Clinical Reasoning Engine v3.2', 'Stanford Spezi Health Framework'];
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: selectedModel,
        citations: citations,
        actionCard: actionCard
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsGenerating(false);
    }, 750);
  };

  // Audio Toggle Simulation
  const toggleAmbientAudio = () => {
    if (!isRecordingAudio) {
      setIsRecordingAudio(true);
      setAudioTranscript('Mendengarkan percakapan klinis...');
      setTimeout(() => {
        setAudioTranscript('Pasien: "Dokter, saya belakangan merasa tekanan darah di pagi hari agak tinggi..."');
      }, 1500);
    } else {
      setIsRecordingAudio(false);
      if (audioTranscript && audioTranscript.includes('Pasien:')) {
        setInputMessage(audioTranscript.replace('Pasien: ', '').replace(/"/g, ''));
      }
      setAudioTranscript('');
    }
  };

  // Reset Chat / New Chat
  const handleNewChat = () => {
    setMessages([]);
    setInputMessage('');
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#f8fafc] text-slate-800 font-sans overflow-hidden selection:bg-sky-200">
      {/* Top Header Bar (Luminous White & Colorful Accents) */}
      <header className="h-14 border-b border-sky-100/90 bg-white/95 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between z-30 select-none shadow-xs">
        {/* Left Side: Sidebar Toggle & Breadcrumbs */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-100"
            title="Toggle Sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 text-sm">
            <Link
              href="/"
              className="text-slate-400 hover:text-sky-600 transition-colors text-xs font-semibold inline-flex items-center gap-1"
            >
              <span>← Beranda</span>
            </Link>
            <span className="text-slate-300">/</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-xs font-semibold border border-emerald-200/90 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Ahmad Kusuma</span>
            </span>
            <span className="text-slate-300">/</span>
            <span className="px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 text-xs font-semibold border border-sky-200/80 shadow-2xs">
              Chat 2
            </span>
          </div>
        </div>

        {/* Right Side: Header Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-emerald-200/90 bg-white hover:bg-emerald-50/80 text-emerald-800 hover:border-emerald-300 transition-all shadow-2xs"
          >
            <div className="w-4 h-4 rounded-md bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Database className="w-2.5 h-2.5" />
            </div>
            <span>Connect health records</span>
            {connectedRecords.length > 0 && (
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-ping"></span>
            )}
          </button>

          <button
            onClick={() => setIsDeviceModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl border border-sky-200/90 bg-white hover:bg-sky-50/80 text-sky-800 hover:border-sky-300 transition-all shadow-2xs"
          >
            <div className="w-4 h-4 rounded-md bg-sky-100 flex items-center justify-center text-sky-700">
              <Watch className="w-2.5 h-2.5" />
            </div>
            <span>Connect a device</span>
            {connectedDevices.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-sky-500 text-white font-bold">
                {connectedDevices.length}
              </span>
            )}
          </button>

          <button
            onClick={handleNewChat}
            className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white shadow-sm shadow-blue-500/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Chat</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body: Split Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: AI Chat Column */}
        <div
          className={`flex flex-col h-full bg-white border-r border-sky-100/90 transition-all duration-300 ${
            isExpanded ? 'hidden' : 'w-full md:w-1/2 lg:w-7/12'
          }`}
        >
          {/* Chat Messages Container */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 bg-gradient-to-b from-sky-50/20 via-white to-indigo-50/15">
            {messages.length === 0 ? (
              // Empty State - Glass Luminous Greeting
              <div className="h-full flex flex-col justify-center items-center text-center px-4 max-w-lg mx-auto">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center text-white shadow-xl shadow-teal-500/25 ring-4 ring-emerald-100/80">
                    <Sparkles className="w-8 h-8 text-white drop-shadow-sm" />
                  </div>
                  <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 ring-2 ring-white"></span>
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-sky-50 to-emerald-50 border border-sky-200/70 text-sky-900 text-xs font-semibold mb-2 shadow-2xs">
                  <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
                  <span>Clinical Decision Intelligence AI</span>
                </div>

                <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Sehat AI Clinical Assistant
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md">
                  Konsultasikan keluhan medis, analisis laboratorium kardiometabolik, validasi interaksi farmakoterapi, atau pantau telemetri perangkat secara langsung.
                </p>

                {/* Status Bar Pills with rich vibrant colors */}
                <div className="mt-6 flex flex-wrap justify-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <Database className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{connectedRecords.length > 0 ? 'SatuSehat Connected' : 'SatuSehat Ready'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 text-sky-800 border border-sky-200 font-semibold shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
                    <Watch className="w-3.5 h-3.5 text-sky-600" />
                    <span>{connectedDevices.length > 0 ? `${connectedDevices.length} Perangkat Aktif` : 'Perangkat: Siap Terhubung'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-800 border border-purple-200 font-semibold shadow-2xs">
                    <FileText className="w-3.5 h-3.5 text-purple-600" />
                    <span>{uploadedDocuments.length} Dokumen Medis</span>
                  </span>
                </div>
              </div>
            ) : (
              // Active Conversation Bubbles
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl p-4 text-sm leading-relaxed shadow-sm ${
                      msg.sender === 'user'
                        ? 'bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white rounded-br-xs shadow-md shadow-slate-900/10'
                        : 'bg-white border border-sky-100 text-slate-800 rounded-bl-xs shadow-md shadow-sky-50/50'
                    }`}
                  >
                    {/* Assistant Header Tag */}
                    {msg.sender === 'assistant' && (
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-sky-100 text-xs">
                        <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                          <span>Sehat AI Clinical Assistant</span>
                          <span className="text-[10px] px-2 py-0.5 bg-gradient-to-r from-emerald-50 to-teal-50 text-teal-800 rounded-full border border-teal-200 font-semibold">
                            {msg.modelUsed || selectedModel}
                          </span>
                        </div>
                        <span className="text-slate-400 text-[11px] font-medium">{msg.timestamp}</span>
                      </div>
                    )}

                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Action Cards */}
                    {msg.actionCard && (
                      <div className="mt-3.5 p-3.5 rounded-xl bg-gradient-to-br from-sky-50/80 via-white to-blue-50/60 border border-sky-200/90 text-xs shadow-2xs">
                        <div className="flex items-center justify-between font-bold text-slate-900 mb-1.5">
                          <span className="flex items-center gap-1.5 text-sky-900">
                            <Activity className="w-4 h-4 text-sky-600" />
                            {msg.actionCard.title}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-sky-700 font-bold bg-sky-100 px-2 py-0.5 rounded-full border border-sky-200">
                            {msg.actionCard.type}
                          </span>
                        </div>
                        <p className="text-slate-600 mb-2.5 leading-relaxed">{msg.actionCard.description}</p>
                        {msg.actionCard.data && (
                          <div className="grid grid-cols-2 gap-2 bg-white/90 p-2.5 rounded-lg border border-sky-100">
                            {Object.entries(msg.actionCard.data).map(([key, val]) => (
                              <div key={key}>
                                <span className="text-slate-400 block text-[10px] font-medium">{key}</span>
                                <span className="font-bold text-slate-800">{val}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Clinical Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                          Bukti Klinis:
                        </span>
                        {msg.citations.map((cite, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-semibold border border-emerald-200 inline-flex items-center gap-1 shadow-2xs"
                          >
                            <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
                            {cite}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}

            {/* Live Typing / Generation Indicator */}
            {isGenerating && (
              <div className="flex items-center space-x-2 text-sky-700 text-xs py-2 bg-sky-50/60 px-3 rounded-full border border-sky-200 w-fit">
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-teal-500 animate-pulse delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse delay-150"></div>
                <span className="ml-1 font-semibold">Menganalisis bukti klinis, formularium & telemetri...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Bar Area (With Suggestion Chips & Prompt Input) */}
          <div className="p-4 bg-white/95 backdrop-blur-md border-t border-sky-100/90 shadow-lg shadow-sky-100/20">
            {/* Quick Prompt Suggestion Chips - VIBRANT & COLORFUL */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-1 no-scrollbar text-xs">
              <button
                onClick={() => handleQuickChip('Tolong jelaskan hasil tes laboratorium darah lengkap dan kardiometabolik terbaru')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-amber-200/90 bg-amber-50/80 hover:bg-amber-100 text-amber-900 font-semibold whitespace-nowrap transition-all shadow-2xs hover:shadow-xs"
              >
                <FlaskConical className="w-3.5 h-3.5 text-amber-600" />
                <span>Understand a test result</span>
              </button>

              <button
                onClick={() => handleQuickChip('Pasien mengeluhkan pusing dan lemas di sore hari setelah aktivitas ringan. Evaluasi kemungkinan etiologi')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-rose-200/90 bg-rose-50/80 hover:bg-rose-100 text-rose-900 font-semibold whitespace-nowrap transition-all shadow-2xs hover:shadow-xs"
              >
                <Stethoscope className="w-3.5 h-3.5 text-rose-600" />
                <span>Review a symptom</span>
              </button>

              <button
                onClick={() => handleQuickChip('Evaluasi interaksi obat Amlodipine 5mg dan Metformin 500mg, serta panduan kepatuhan konsumsi')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-sky-200/90 bg-sky-50/80 hover:bg-sky-100 text-sky-900 font-semibold whitespace-nowrap transition-all shadow-2xs hover:shadow-xs"
              >
                <Pill className="w-3.5 h-3.5 text-sky-600" />
                <span>Understand a medication</span>
                <ArrowRight className="w-3 h-3 text-sky-500" />
              </button>

              <button
                onClick={() => handleQuickChip('Sinkronkan dan evaluasi telemetri tensi OMRON serta detak jantung terkini')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-teal-200/90 bg-teal-50/80 hover:bg-teal-100 text-teal-900 font-semibold whitespace-nowrap transition-all shadow-2xs hover:shadow-xs"
              >
                <Activity className="w-3.5 h-3.5 text-teal-600" />
                <span>Telemetri Vital Sign</span>
              </button>

              <button
                onClick={() => handleQuickChip('Bagaimana cara kerja Adaptive Micro-Plan dan Setback Recovery loop dalam menjaga kebiasaan hidup sehat tanpa streak shaming?')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-orange-200/90 bg-orange-50/80 hover:bg-orange-100 text-orange-950 font-semibold whitespace-nowrap transition-all shadow-2xs hover:shadow-xs"
              >
                <Repeat className="w-3.5 h-3.5 text-orange-600" />
                <span>Setback Recovery Loop</span>
              </button>
            </div>

            {/* Audio Waveform Banner when Ambient Recording Active */}
            {isRecordingAudio && (
              <div className="mb-2.5 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 flex items-center justify-between text-xs text-blue-900 animate-pulse shadow-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-600 animate-ping"></div>
                  <span className="font-bold">Ambient Clinical Voice Active</span>
                  <span className="text-blue-700 italic">{audioTranscript}</span>
                </div>
                <button
                  onClick={toggleAmbientAudio}
                  className="px-3 py-1 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 shadow-xs"
                >
                  Selesai
                </button>
              </div>
            )}

            {/* Glass-Style Prompt Box Container */}
            <div className="relative rounded-2xl border border-sky-200 bg-white shadow-md shadow-sky-100/50 focus-within:border-sky-500 focus-within:ring-4 focus-within:ring-sky-100/70 transition-all p-3">
              {/* Brand Logo Watermark on Top-Right */}
              <div className="absolute top-3 right-3 select-none pointer-events-none">
                <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white text-[11px] font-bold font-serif shadow-xs">
                  G
                </div>
              </div>

              {/* Textarea Input */}
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Konsultasikan gejala klinis, interpretasi data medis, atau instruksi DPJP..."
                rows={2}
                className="w-full pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none bg-transparent leading-relaxed"
              />

              {/* Bottom Controls Row inside Input Box */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
                {/* Left Action Buttons: Waveform Voice & Document Attach */}
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={toggleAmbientAudio}
                    className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                      isRecordingAudio
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 animate-pulse'
                        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm shadow-blue-600/25'
                    }`}
                    title="Ambient Voice Recording"
                  >
                    <AudioLines className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-8 h-8 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center transition-colors"
                    title="Attach File / Lab Result"
                  >
                    <Paperclip className="w-4 h-4" />
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.png,.jpg,.jpeg,.json"
                  />
                </div>

                {/* Right Action Controls: Model Dropdown, +, Mic, Send */}
                <div className="flex items-center space-x-1.5">
                  {/* Model Selector Dropdown */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-50 text-sky-800 hover:bg-sky-100 border border-sky-200 transition-colors"
                    >
                      <span>{selectedModel}</span>
                      <ChevronDown className="w-3 h-3 text-sky-600" />
                    </button>

                    {isModelDropdownOpen && (
                      <div className="absolute right-0 bottom-full mb-1.5 w-52 rounded-xl bg-white border border-sky-200 shadow-xl py-1.5 z-40 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedModel('Standard');
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between ${
                            selectedModel === 'Standard' ? 'font-bold text-teal-800 bg-teal-50/60' : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-semibold">Standard</div>
                            <div className="text-[10px] text-slate-400">Fast clinical assistant</div>
                          </div>
                          {selectedModel === 'Standard' && <Check className="w-3.5 h-3.5 text-teal-600" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedModel('Clinical Pro');
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between ${
                            selectedModel === 'Clinical Pro' ? 'font-bold text-teal-800 bg-teal-50/60' : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-semibold">Clinical Pro (MedX)</div>
                            <div className="text-[10px] text-slate-400">Differential Diagnosis & DDx</div>
                          </div>
                          {selectedModel === 'Clinical Pro' && <Check className="w-3.5 h-3.5 text-teal-600" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedModel('Evidence RAG');
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between ${
                            selectedModel === 'Evidence RAG' ? 'font-bold text-teal-800 bg-teal-50/60' : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="font-semibold">Evidence RAG</div>
                            <div className="text-[10px] text-slate-400">PubMed & Guideline Citations</div>
                          </div>
                          {selectedModel === 'Evidence RAG' && <Check className="w-3.5 h-3.5 text-teal-600" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Plus Button for Structured Templates */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
                      className="w-8 h-8 rounded-lg border border-amber-200 bg-amber-50 hover:bg-amber-100 text-amber-800 flex items-center justify-center transition-colors"
                      title="Insert Clinical Template"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    {isTemplateMenuOpen && (
                      <div className="absolute right-0 bottom-full mb-1.5 w-56 rounded-xl bg-white border border-amber-200 shadow-xl py-1.5 z-40 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setInputMessage('Keluhan Utama: Nyeri dada tumpul saat aktivitas, durasi 10 menit, membaik saat istirahat.');
                            setIsTemplateMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-amber-50/60 text-slate-700 font-medium"
                        >
                          + Template Keluhan Utama
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInputMessage('Observasi Hemodinamik: TD 118/76 mmHg, HR 72 bpm, RR 18 x/m, SpO2 98%, Suhu 36.6 C.');
                            setIsTemplateMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-amber-50/60 text-slate-700 font-medium"
                        >
                          + Template Tanda Vital
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInputMessage('Daftar Obat Terkini: Amlodipine 5mg 1x1, Metformin 500mg 2x1. Cek kepatuhan dan kontraindikasi.');
                            setIsTemplateMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-amber-50/60 text-slate-700 font-medium"
                        >
                          + Template Regimen Obat
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Mic Button */}
                  <button
                    type="button"
                    onClick={toggleAmbientAudio}
                    className="w-8 h-8 rounded-lg border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 flex items-center justify-center transition-colors"
                    title="Voice Input"
                  >
                    <Mic className="w-4 h-4" />
                  </button>

                  {/* Send Button */}
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim()}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      inputMessage.trim()
                        ? 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md shadow-sky-500/25'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                    title="Send Message"
                  >
                    <ArrowUp className="w-4 h-4 font-bold" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Data, Documents & Profile Inspector */}
        <div
          className={`flex flex-col h-full bg-white transition-all duration-300 ${
            isExpanded ? 'w-full' : 'w-full md:w-1/2 lg:w-5/12'
          }`}
        >
          {/* Right Pane Header Tabs */}
          <div className="h-14 border-b border-sky-100/90 px-4 sm:px-6 flex items-center justify-between bg-white select-none shadow-2xs">
            <div className="flex items-center space-x-1.5 p-1 bg-slate-100/80 rounded-xl border border-slate-200/60">
              <button
                onClick={() => setActiveTab('patient')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'patient'
                    ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-sm shadow-blue-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>Profile</span>
              </button>

              <button
                onClick={() => setActiveTab('data')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'data'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm shadow-emerald-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <Activity className="w-3.5 h-3.5" />
                <span>Data</span>
                {(connectedDevices.length > 0 || connectedRecords.length > 0) && (
                  <span className="w-2 h-2 rounded-full bg-white inline-block"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('documents')}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'documents'
                    ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-sm shadow-purple-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Documents</span>
                {(uploadedDocuments.length > 0 || generatedFiles.length > 0) && (
                  <span className="w-2 h-2 rounded-full bg-white inline-block"></span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('habits')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  activeTab === 'habits'
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-sm shadow-orange-500/25'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Adaptive Habits</span>
                <span className="px-1.5 py-0.2 rounded-full bg-orange-100 text-orange-900 text-[9px] font-extrabold">
                  Abu Dhabi
                </span>
              </button>
            </div>

            {/* Expand / Minimize Fullscreen Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-slate-500 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors border border-transparent hover:border-sky-100"
              title={isExpanded ? 'Minimize View' : 'Expand View'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Right Pane Content Area */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-gradient-to-b from-slate-50/40 via-white to-sky-50/20 space-y-5">
            {/* TAB 1: DATA */}
            {activeTab === 'data' && (
              <div className="space-y-5">
                {/* Header & Subtitle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">Data Overview</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {connectedDevices.length === 0 && connectedRecords.length === 0
                        ? 'No data connected yet'
                        : `${connectedDevices.length} peranti aktif • ${connectedRecords.length} berkas FHIR tersinkronisasi`}
                    </p>
                  </div>

                  {/* Filter Pills: Metrics vs Health Records */}
                  <div className="inline-flex rounded-xl border border-sky-200/80 p-0.5 bg-sky-50/50 text-xs">
                    <button
                      onClick={() => setDataSubFilter('metrics')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        dataSubFilter === 'metrics'
                          ? 'bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Metrics
                    </button>
                    <button
                      onClick={() => setDataSubFilter('records')}
                      className={`px-3 py-1 rounded-lg font-bold transition-all ${
                        dataSubFilter === 'records'
                          ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Health records
                    </button>
                  </div>
                </div>

                {/* Metrics Sub-view */}
                {dataSubFilter === 'metrics' && (
                  <div className="rounded-2xl border border-sky-100/90 p-5 bg-white shadow-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <Activity className="w-4 h-4 text-sky-600" />
                        <span className="text-sm font-bold text-slate-900">Live Clinical Metrics</span>
                      </div>
                      <button
                        onClick={() => setIsDeviceModalOpen(true)}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200 transition-colors"
                      >
                        + Hubungkan Perangkat
                      </button>
                    </div>

                    {connectedDevices.length === 0 ? (
                      <div className="py-8 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-600 mx-auto mb-3 shadow-2xs">
                          <Watch className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-slate-800">No connected sources yet.</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                          Hubungkan OMRON Complete, Apple Watch, CGM Dexcom, atau Aolon GT6 Pro via Google Health Connect.
                        </p>
                        <button
                          onClick={() => setIsDeviceModalOpen(true)}
                          className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white text-xs font-bold transition-all shadow-sm shadow-sky-500/20 inline-flex items-center gap-1.5"
                        >
                          <Watch className="w-3.5 h-3.5" />
                          <span>Hubungkan Perangkat Sekarang</span>
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 mt-2">
                        {connectedDevices.map((dev) => (
                          <div key={dev.id} className="py-3.5 flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold text-slate-900">{dev.name}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                                  {dev.statusBadge}
                                </span>
                              </div>
                              <div className="text-xs text-slate-600">
                                {dev.metricLabel}: <span className="font-extrabold text-blue-600">{dev.metricValue}</span> {dev.metricUnit}
                              </div>
                            </div>
                            <div className="text-right text-[11px] text-slate-500 flex items-center gap-2">
                              <span className="flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <Battery className="w-3 h-3 text-emerald-600" />
                                {dev.battery}%
                              </span>
                              <span className="text-slate-400">• {dev.lastSync}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Health Records Sub-view */}
                {dataSubFilter === 'records' && (
                  <div className="rounded-2xl border border-emerald-100/90 p-5 bg-white shadow-sm">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm font-bold text-slate-900">Health Records (HL7 FHIR R4)</span>
                      </div>
                      <button
                        onClick={() => setIsRecordModalOpen(true)}
                        className="text-xs font-bold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                      >
                        + Sync SatuSehat
                      </button>
                    </div>

                    {connectedRecords.length === 0 ? (
                      <div className="py-8 text-center">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mx-auto mb-3 shadow-2xs">
                          <Database className="w-6 h-6" />
                        </div>
                        <p className="text-sm font-bold text-slate-800">No connected health records yet.</p>
                        <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto">
                          Sinkronkan riwayat encounter rumah sakit, resume laboratorium, dan resep via IHS Kemenkes RI.
                        </p>
                        <button
                          onClick={() => setIsRecordModalOpen(true)}
                          className="mt-4 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-sm shadow-emerald-500/20 inline-flex items-center gap-1.5"
                        >
                          <Database className="w-3.5 h-3.5" />
                          <span>Hubungkan SatuSehat Kemenkes</span>
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 mt-2">
                        {connectedRecords.map((rec) => (
                          <div key={rec.id} className="py-3.5 flex items-center justify-between">
                            <div className="space-y-1">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-bold text-slate-900">{rec.provider}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-semibold">
                                  {rec.type}
                                </span>
                              </div>
                              <div className="text-xs text-slate-600">
                                Encounter ID: <span className="font-mono font-bold text-slate-800">{rec.encounterId}</span> • HL7 {rec.fhirVersion}
                              </div>
                            </div>
                            <div className="text-right text-[11px] text-emerald-700 font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Tersinkronisasi</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: DOCUMENTS */}
            {activeTab === 'documents' && (
              <div className="space-y-5">
                {/* Header & Subtitle */}
                <div>
                  <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">Documents Overview</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {uploadedDocuments.length === 0 && generatedFiles.length === 0
                      ? 'No documents available yet'
                      : `${uploadedDocuments.length + generatedFiles.length} berkas klinis tersedia dalam format standar`}
                  </p>
                </div>

                {/* Card 1: Documents (Connected Health Records) */}
                <div className="rounded-2xl border border-sky-100/90 p-5 bg-white shadow-sm">
                  <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <FileCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-sm font-bold text-slate-900">Documents</span>
                    </div>
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                      FHIR DiagnosticReport
                    </span>
                  </div>

                  {connectedRecords.length === 0 ? (
                    <div className="py-6">
                      <p className="text-sm font-semibold text-slate-700">No connected health records yet.</p>
                      <p className="text-xs text-slate-400 mt-0.5">Connect your health records to get started.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 mt-2">
                      {connectedRecords.map((rec) => (
                        <div key={rec.id} className="py-3 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-slate-800">{rec.provider} Clinical Summary.pdf</span>
                              <div className="text-[10px] text-slate-400">Terverifikasi Kemenkes RI • 1.8 MB</div>
                            </div>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-[10px]">
                            Synced
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card 2: Uploads (With + Upload Button) */}
                <div className="rounded-2xl border border-violet-100/90 p-5 bg-white shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <Upload className="w-4 h-4 text-violet-600" />
                      <span className="text-sm font-bold text-slate-900">Uploads</span>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 text-xs font-bold transition-all shadow-xs shadow-violet-500/20"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Upload</span>
                    </button>
                  </div>

                  {uploadedDocuments.length === 0 ? (
                    <div className="py-6">
                      <p className="text-sm font-semibold text-slate-700">No uploaded files yet.</p>
                      <p className="text-xs text-slate-400 mt-0.5">Upload a file to get started.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 mt-2">
                      {uploadedDocuments.map((doc) => (
                        <div key={doc.id} className="py-3 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-bold text-slate-900">{doc.name}</span>
                              <span className="text-[10px] px-2 py-0.2 rounded-full bg-violet-50 text-violet-800 font-semibold border border-violet-200">
                                {doc.size}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {doc.uploadedAt} • OCR Extracted
                            </div>
                          </div>
                          <span className="text-xs text-violet-700 font-bold cursor-pointer hover:underline">
                            Lihat
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card 3: Created by Glass / Sehat AI */}
                <div className="rounded-2xl border border-sky-100/90 p-5 bg-white shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-4 h-4 text-sky-600" />
                      <span className="text-sm font-bold text-slate-900">Created by Glass</span>
                    </div>
                    <button
                      onClick={handleGenerateAIFile}
                      className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white text-xs font-bold transition-all shadow-xs shadow-blue-500/20"
                    >
                      <FilePlus className="w-3.5 h-3.5" />
                      <span>Create file</span>
                    </button>
                  </div>

                  {generatedFiles.length === 0 ? (
                    <div className="py-6">
                      <p className="text-sm font-semibold text-slate-700">No generated files yet.</p>
                      <p className="text-xs text-slate-400 mt-0.5">Create a file to get started.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 mt-2">
                      {generatedFiles.map((file) => (
                        <div key={file.id} className="py-3 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-xs font-bold text-slate-900">{file.title}</span>
                            <div className="text-[11px] text-slate-500">
                              {file.category} • {file.size}
                            </div>
                          </div>
                          <button className="text-xs text-blue-700 hover:text-blue-900 font-bold inline-flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: PROFILE (Patient Profile & Encounter Overview) */}
            {activeTab === 'patient' && (
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h2 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight">Patient Overview</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {isOverviewGenerated
                        ? 'Overview generated • 3 sources synced'
                        : 'No overview generated yet'}
                    </p>
                  </div>
                  <button
                    onClick={handleRefreshOverview}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-sky-800 bg-sky-50 hover:bg-sky-100 rounded-xl transition-all border border-sky-200 shadow-2xs"
                    title="Refresh Patient Overview"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-sky-600 ${isRefreshingOverview ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* 2-Column Responsive Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Digital Twin & Health History */}
                  <div className="space-y-4 flex flex-col">
                    {/* Card 1: Digital Twin */}
                    <div className="rounded-2xl border border-sky-200/80 p-4 bg-gradient-to-b from-sky-50/40 via-white to-blue-50/30 shadow-sm flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-1.5">
                          <Activity className="w-3.5 h-3.5 text-sky-600" />
                          <span className="text-xs font-bold text-slate-900">Digital Twin 3D</span>
                        </div>
                        {selectedOrgan && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 border border-sky-200 animate-in fade-in">
                            {selectedOrgan}
                          </span>
                        )}
                      </div>

                      {/* Holographic 3D Human Body Silhouette SVG with vibrant medical neon glows */}
                      <div className="flex-1 flex flex-col items-center justify-center py-2 relative min-h-[300px] select-none">
                        <svg
                          viewBox="0 0 200 360"
                          className="w-48 h-72 sm:h-80 drop-shadow-md transition-transform hover:scale-102 duration-300"
                        >
                          <defs>
                            <linearGradient id="bodyGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.55" />
                              <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.75" />
                              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.6" />
                            </linearGradient>
                            <radialGradient id="heartGlow" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor="#ff4d6d" stopOpacity="0.95" />
                              <stop offset="70%" stopColor="#e11d48" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#be123c" stopOpacity="0.1" />
                            </radialGradient>
                            <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor="#c084fc" stopOpacity="0.95" />
                              <stop offset="100%" stopColor="#7e22ce" stopOpacity="0.2" />
                            </radialGradient>
                            <radialGradient id="metabolicGlow" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor="#34d399" stopOpacity="0.9" />
                              <stop offset="100%" stopColor="#059669" stopOpacity="0.1" />
                            </radialGradient>
                            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="3" result="blur" />
                              <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                          </defs>

                          {/* Aura Background Glow */}
                          <ellipse cx="100" cy="180" rx="45" ry="140" fill="#38bdf8" opacity="0.12" filter="url(#softGlow)" />

                          {/* Head */}
                          <ellipse cx="100" cy="38" rx="14" ry="18" fill="url(#bodyGlow)" stroke="#7dd3fc" strokeWidth="1" />
                          <circle
                            cx="100"
                            cy="36"
                            r="8"
                            fill="url(#brainGlow)"
                            className="cursor-pointer hover:opacity-100 transition-opacity"
                            onClick={() => setSelectedOrgan('Brain & Cognition: Sleep 7h 24m, Minimal Stress')}
                          />

                          {/* Neck */}
                          <path d="M94 54 L94 65 L106 65 L106 54 Z" fill="url(#bodyGlow)" />

                          {/* Torso & Shoulders */}
                          <path
                            d="M68 76 C74 68, 88 64, 100 64 C112 64, 126 68, 132 76 C138 84, 132 105, 128 135 C125 155, 126 175, 122 188 C118 194, 82 194, 78 188 C74 175, 75 155, 72 135 C68 105, 62 84, 68 76 Z"
                            fill="url(#bodyGlow)"
                            stroke="#38bdf8"
                            strokeWidth="1.2"
                            strokeOpacity="0.8"
                          />

                          {/* Translucent Ribcage lines */}
                          <path d="M85 88 C95 84, 105 84, 115 88" stroke="#bae6fd" strokeWidth="0.8" strokeOpacity="0.7" fill="none" />
                          <path d="M82 98 C94 94, 106 94, 118 98" stroke="#bae6fd" strokeWidth="0.8" strokeOpacity="0.7" fill="none" />
                          <path d="M84 108 C94 104, 106 104, 116 108" stroke="#bae6fd" strokeWidth="0.8" strokeOpacity="0.7" fill="none" />
                          <path d="M86 118 C94 114, 106 114, 114 118" stroke="#bae6fd" strokeWidth="0.8" strokeOpacity="0.7" fill="none" />

                          {/* Spinal Column */}
                          <line x1="100" y1="65" x2="100" y2="185" stroke="#e0f2fe" strokeWidth="1.5" strokeDasharray="3 2" strokeOpacity="0.6" />

                          {/* Lungs Silhouette */}
                          <path
                            d="M86 85 C82 95, 82 115, 88 120 C92 120, 95 105, 95 90 Z"
                            fill="#0284c7"
                            fillOpacity="0.35"
                            className="cursor-pointer hover:fill-opacity-50"
                            onClick={() => setSelectedOrgan('Respiratory: SpO2 98% • RR 16 x/min')}
                          />
                          <path
                            d="M114 85 C118 95, 118 115, 112 120 C108 120, 105 105, 105 90 Z"
                            fill="#0284c7"
                            fillOpacity="0.35"
                            className="cursor-pointer hover:fill-opacity-50"
                            onClick={() => setSelectedOrgan('Respiratory: SpO2 98% • RR 16 x/min')}
                          />

                          {/* Pulsing Glowing Heart */}
                          <g
                            className="cursor-pointer"
                            onClick={() => setSelectedOrgan('Cardiovascular: BP 118/76 mmHg • HR 72 bpm • Normal Dipper')}
                          >
                            <circle cx="106" cy="102" r="11" fill="url(#heartGlow)" filter="url(#softGlow)" className="animate-pulse" />
                            <circle cx="106" cy="102" r="5" fill="#fda4af" />
                          </g>

                          {/* Metabolic Center (Liver & Pancreas) */}
                          <ellipse
                            cx="98"
                            cy="138"
                            rx="14"
                            ry="9"
                            fill="url(#metabolicGlow)"
                            className="cursor-pointer hover:opacity-100 transition-opacity"
                            onClick={() => setSelectedOrgan('Metabolism: Glucose 104 mg/dL • HbA1c 5.8%')}
                          />

                          {/* Arms */}
                          <path
                            d="M68 76 C62 90, 58 115, 56 140 C54 160, 50 185, 48 205 C46 210, 48 218, 52 216 C55 214, 58 195, 62 175 C66 155, 70 130, 72 108"
                            fill="url(#bodyGlow)"
                            stroke="#38bdf8"
                            strokeWidth="0.8"
                            strokeOpacity="0.6"
                          />
                          <path
                            d="M132 76 C138 90, 142 115, 144 140 C146 160, 150 185, 152 205 C154 210, 152 218, 148 216 C145 214, 142 195, 138 175 C134 155, 130 130, 128 108"
                            fill="url(#bodyGlow)"
                            stroke="#38bdf8"
                            strokeWidth="0.8"
                            strokeOpacity="0.6"
                          />

                          {/* Pelvis */}
                          <path d="M78 188 C82 200, 118 200, 122 188 L116 215 L84 215 Z" fill="url(#bodyGlow)" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.6" />

                          {/* Legs */}
                          <path
                            d="M84 215 C82 235, 80 265, 82 290 C83 310, 80 335, 78 350 C80 354, 88 354, 90 350 C93 335, 94 310, 95 290 C96 265, 98 235, 98 215 Z"
                            fill="url(#bodyGlow)"
                            stroke="#38bdf8"
                            strokeWidth="0.9"
                            strokeOpacity="0.7"
                          />
                          <path
                            d="M116 215 C118 235, 120 265, 118 290 C117 310, 120 335, 122 350 C120 354, 112 354, 110 350 C107 335, 106 310, 105 290 C104 265, 102 235, 102 215 Z"
                            fill="url(#bodyGlow)"
                            stroke="#38bdf8"
                            strokeWidth="0.9"
                            strokeOpacity="0.7"
                          />

                          {/* Femoral Vascular tracings */}
                          <path d="M98 185 L90 250 L88 320" stroke="#f43f5e" strokeWidth="0.8" strokeOpacity="0.5" fill="none" />
                          <path d="M102 185 L110 250 L112 320" stroke="#f43f5e" strokeWidth="0.8" strokeOpacity="0.5" fill="none" />
                        </svg>

                        {/* Interactive Organ Quick Chips */}
                        <div className="mt-3 flex flex-wrap justify-center gap-1.5 max-w-xs">
                          <button
                            onClick={() => setSelectedOrgan('Cardiovascular: BP 118/76 mmHg • HR 72 bpm')}
                            className="px-2 py-0.5 rounded-full bg-rose-50 hover:bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200 transition-colors"
                          >
                            🫀 Jantung
                          </button>
                          <button
                            onClick={() => setSelectedOrgan('Brain & Cognition: Sleep 7h 24m, Minimal Stress')}
                            className="px-2 py-0.5 rounded-full bg-purple-50 hover:bg-purple-100 text-purple-800 text-[10px] font-bold border border-purple-200 transition-colors"
                          >
                            🧠 Saraf
                          </button>
                          <button
                            onClick={() => setSelectedOrgan('Respiratory: SpO2 98% • RR 16 x/min')}
                            className="px-2 py-0.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-800 text-[10px] font-bold border border-sky-200 transition-colors"
                          >
                            🫁 Paru
                          </button>
                          <button
                            onClick={() => setSelectedOrgan('Metabolism: Glucose 104 mg/dL • HbA1c 5.8%')}
                            className="px-2 py-0.5 rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-200 transition-colors"
                          >
                            🩸 Glikemik
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Health History */}
                    <div className="rounded-2xl border border-sky-100/90 p-4 bg-white shadow-sm">
                      <div className="flex items-center space-x-1.5 mb-2.5">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-900">Health History</span>
                      </div>
                      {!isOverviewGenerated && connectedRecords.length === 0 ? (
                        <p className="text-xs text-slate-400 py-3">No health history yet</p>
                      ) : (
                        <div className="space-y-2 text-xs divide-y divide-slate-100">
                          <div className="pt-1.5 space-y-0.5">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                              Riwayat Penyakit Dahulu (RPD)
                            </span>
                            <p className="text-slate-600 pl-3">Hipertensi Stage 1 terdiagnosis 2024. Riwayat dislipidemia terkontrol.</p>
                          </div>
                          <div className="pt-2 space-y-0.5">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-violet-500"></span>
                              Riwayat Penyakit Keluarga (RPK)
                            </span>
                            <p className="text-slate-600 pl-3">Ayah: Infark Miokard akut pada usia 62 th. Ibu: DM Tipe 2.</p>
                          </div>
                          <div className="pt-2 space-y-0.5">
                            <span className="font-bold text-slate-900 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                              Gaya Hidup & Imunisasi
                            </span>
                            <p className="text-slate-600 pl-3">Non-perokok, jalan kaki rata-rata 8.420 langkah/hari. Vaksin Influenza 2026.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Connected Sources, Health Insights, Active Conditions */}
                  <div className="space-y-4 flex flex-col">
                    {/* Card 3: Connected Sources */}
                    <div className="rounded-2xl border border-sky-100/90 p-4 bg-white shadow-sm">
                      <div className="flex items-center justify-between mb-2.5">
                        <div className="flex items-center space-x-1.5">
                          <Wifi className="w-3.5 h-3.5 text-teal-600" />
                          <span className="text-xs font-bold text-slate-900">Connected Sources</span>
                        </div>
                        {connectedDevices.length > 0 && (
                          <span className="text-[10px] text-emerald-800 font-extrabold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            {connectedDevices.length} Connected
                          </span>
                        )}
                      </div>
                      {!isOverviewGenerated && connectedDevices.length === 0 && connectedRecords.length === 0 ? (
                        <div className="py-4">
                          <p className="text-xs text-slate-400">No connected sources yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-blue-50/60 border border-blue-100">
                            <div className="flex items-center space-x-2">
                              <Activity className="w-3.5 h-3.5 text-blue-600" />
                              <span className="font-bold text-slate-900">OMRON Complete Smart BP</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              118/76 mmHg
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-sky-50/60 border border-sky-100">
                            <div className="flex items-center space-x-2">
                              <Watch className="w-3.5 h-3.5 text-sky-600" />
                              <span className="font-bold text-slate-900">Apple Watch Ultra 2</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                              72 bpm • Active
                            </span>
                          </div>
                          <div className="flex items-center justify-between p-2.5 rounded-xl bg-emerald-50/60 border border-emerald-100">
                            <div className="flex items-center space-x-2">
                              <Database className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="font-bold text-slate-900">SatuSehat Kemenkes (IHS)</span>
                            </div>
                            <span className="text-[10px] font-mono font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                              IH-10029381
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card 4: Health Insights */}
                    <div className="rounded-2xl border border-sky-100/90 p-4 bg-white shadow-sm">
                      <div className="flex items-center space-x-1.5 mb-2.5">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                        <span className="text-xs font-bold text-slate-900">Health Insights</span>
                      </div>
                      {!isOverviewGenerated && connectedDevices.length === 0 ? (
                        <div className="py-4">
                          <p className="text-xs text-slate-400">No health insights yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5 text-xs">
                          <div className="p-3 rounded-xl bg-gradient-to-r from-sky-50 to-blue-50/60 border border-sky-200/80 space-y-1">
                            <div className="flex items-center justify-between font-bold text-sky-950">
                              <span className="flex items-center gap-1.5">
                                <HeartPulse className="w-3.5 h-3.5 text-sky-600" />
                                Circadian Dipping Normal
                              </span>
                              <span className="text-[10px] text-sky-800 font-extrabold bg-white px-2 py-0.5 rounded-full border border-sky-200">
                                12.4% Drop
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px] leading-relaxed">
                              Penurunan tekanan darah malam hari berada dalam rentang fisiologis ideal (*Normal Dipper*), mengindikasikan proteksi organ target yang baik.
                            </p>
                          </div>

                          <div className="p-3 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50/60 border border-emerald-200/80 space-y-1">
                            <div className="flex items-center justify-between font-bold text-emerald-950">
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Adherensi Farmakoterapi Tinggi
                              </span>
                              <span className="text-[10px] text-emerald-800 font-extrabold bg-white px-2 py-0.5 rounded-full border border-emerald-200">
                                96% Tercatat
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px] leading-relaxed">
                              Kepatuhan konsumsi Amlodipine 5mg tepat waktu teratur selama 30 hari berturut-turut via asisten Pillo.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card 5: Active Conditions, Medications, & Allergies */}
                    <div className="rounded-2xl border border-sky-100/90 p-4 bg-white shadow-sm">
                      <div className="flex items-center space-x-1.5 mb-2.5">
                        <Shield className="w-3.5 h-3.5 text-rose-500" />
                        <span className="text-xs font-bold text-slate-900">Active Conditions, Medications, & Allergies</span>
                      </div>
                      {!isOverviewGenerated && connectedRecords.length === 0 ? (
                        <div className="py-4">
                          <p className="text-xs text-slate-400">No active conditions recorded yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-3 text-xs">
                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-1.5">
                              Kondisi Aktif
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-900 border border-amber-200 font-bold">
                                Hipertensi Esensial (ICD-10 I10)
                              </span>
                              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-900 border border-indigo-200 font-bold">
                                Prediabetes (ICD-10 R73.03)
                              </span>
                            </div>
                          </div>

                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-1.5">
                              Medikasi Berjalan
                            </span>
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="font-bold text-slate-900">Amlodipine Besylate 5 mg</span>
                                <span className="text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-200 text-[10px]">
                                  1x1 Pagi
                                </span>
                              </div>
                              <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-100">
                                <span className="font-bold text-slate-900">Metformin HCl 500 mg</span>
                                <span className="text-sky-700 font-semibold bg-sky-50 px-2 py-0.5 rounded border border-sky-200 text-[10px]">
                                  2x1 Bersama Makan
                                </span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider mb-1.5">
                              Alergi Terverifikasi
                            </span>
                            <span className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 border border-rose-200 font-bold inline-flex items-center gap-1.5">
                              <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                              <span>Penisilin (Reaksi: Urtikaria / Ruam Akut)</span>
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 4: ADAPTIVE HABITS & SETBACK RECOVERY (Future Health Challenge - Abu Dhabi Ecosystem) */}
            {activeTab === 'habits' && (
              <div className="space-y-5 animate-in fade-in duration-200">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-orange-50 text-orange-800 text-[10px] font-bold border border-orange-200 mb-1">
                      <Sparkles className="w-3 h-3 text-orange-600" />
                      <span>FUTURE HEALTH CHALLENGE • ABU DHABI ECOSYSTEM</span>
                    </div>
                    <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                      {isArabicMode ? 'خطط السلوك التكيفية والتعافي' : 'Adaptive Behavior & Setback Recovery'}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Translasi data telemetri menjadi mikro-rencana adaptif, tanpa reset streak saat terjadi hambatan (*lapse*).
                    </p>
                  </div>

                  {/* Language Switcher */}
                  <button
                    onClick={() => setIsArabicMode(!isArabicMode)}
                    className="px-3 py-1.5 rounded-xl border border-sky-200 bg-sky-50 text-sky-800 hover:bg-sky-100 text-xs font-bold transition-all shadow-2xs"
                  >
                    {isArabicMode ? 'Switch to English' : 'عربي (Arabic Mode)'}
                  </button>
                </div>

                {/* 1. HERO RESILIENCE CARD: Banked Health Equity & Setback Recovery */}
                <div className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/70 via-white to-teal-50/40 p-5 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-2xs">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="text-[10px] font-extrabold text-emerald-700 uppercase tracking-wider block">
                          Banked Health Equity • Anti-Streak Shaming
                        </span>
                        <span className="text-lg font-extrabold text-slate-900">
                          {bankedDays} Hari Tersimpan Permanen
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block font-semibold">Lapse Recovery Rate</span>
                      <span className="text-sm font-extrabold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                        1.3 Hari (Top 5%)
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    Sistem mendeteksi bahwa rutinitas terganggu adalah proses manusiawi yang alami. Kemajuan Anda tidak pernah di-reset ke nol. Jika hari ini terasa berat, aktifkan <strong>Soft Landing Recovery</strong>.
                  </p>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={handleTriggerSetbackRecovery}
                      className="inline-flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-bold transition-all shadow-xs"
                    >
                      <Repeat className="w-4 h-4" />
                      <span>{isSoftLanded ? '✓ Soft Landing Aktif (2-Min Stretch)' : 'Simulasi Setback Recovery (Hari Ini Berat)'}</span>
                    </button>
                    {isSoftLanded && (
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/70 px-2.5 py-1 rounded-lg">
                        Target Disesuaikan • Tanpa Penalti!
                      </span>
                    )}
                  </div>
                </div>

                {/* 2. ABU DHABI CONTEXT & ENVIRONMENT SWITCHES */}
                <div className="rounded-2xl border border-sky-100 p-4 bg-white shadow-sm space-y-3">
                  <span className="text-xs font-bold text-slate-900 block">
                    Konteks Lingkungan & Budaya (Abu Dhabi Framework)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Heat Shield Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-amber-50/50 border border-amber-200/80">
                      <div className="flex items-center space-x-2.5">
                        <Sun className="w-4 h-4 text-amber-600" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Abu Dhabi Heat Shield (41°C)</div>
                          <div className="text-[10px] text-slate-500">Alihkan rute jalan ke indoor mall / rumah ber-AC</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isHeatShieldActive}
                        onChange={(e) => setIsHeatShieldActive(e.target.checked)}
                        className="w-4 h-4 accent-amber-600 cursor-pointer"
                      />
                    </div>

                    {/* Ramadan Mode Toggle */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-indigo-50/50 border border-indigo-200/80">
                      <div className="flex items-center space-x-2.5">
                        <Moon className="w-4 h-4 text-indigo-600" />
                        <div>
                          <div className="text-xs font-bold text-slate-900">Ramadan / Fasting Mode</div>
                          <div className="text-[10px] text-slate-500">Jadwalkan hidrasi & jalan santai antara Iftar & Suhoor</div>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={isRamadanMode}
                        onChange={(e) => setIsRamadanMode(e.target.checked)}
                        className="w-4 h-4 accent-indigo-600 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. ADAPTIVE PERSONAL MICRO-ACTIONS (CRITERIA 1 & 3) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      Target Mikro-Aksi Adaptif Hari Ini
                    </span>
                    <span className="text-[11px] font-bold text-sky-600">
                      Berdasarkan Fogg Model ($B=MAP$)
                    </span>
                  </div>

                  {/* Habit Card 1: Movement */}
                  <div className="rounded-2xl border border-sky-200/90 p-4 bg-white shadow-2xs hover:border-sky-300 transition-all space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 text-[10px] font-bold border border-blue-200">
                          Movement
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">
                          {isSoftLanded ? '2-Min Seated Ankle Pumping & Mobility' : '7-Min Indoor Cool Mobility Stroll'}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-blue-600">
                        {isSoftLanded ? '⏱ 2 Menit (Soft Landed)' : '⏱ 7 Menit'}
                      </span>
                    </div>

                    {/* 1. ⚓ JANGKAR PERILAKU */}
                    <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-900 flex items-center gap-1.5">
                          ⚓ <span>Jangkar Perilaku (Habit Stacking & Implementation Intention):</span>
                        </span>
                        <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">BCT 1.4 & 8.3</span>
                      </div>
                      <p className="font-semibold text-slate-800 italic">
                        "JIKA selesai makan malam, MAKA saya akan berjalan santai 7 menit di lorong/ruangan ber-AC."
                      </p>
                    </div>

                    {/* 2. 🔬 RASIONAL ILMIAH */}
                    <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-[11px] space-y-1">
                      <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Rasional Ilmiah (Visible Rationale):</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        Aktivitas fisik ringan setelah makan menurunkan lonjakan glukosa hingga <strong>22%</strong> (Diabetologia 2024; RCT, n=128). Mengaktifkan translokasi GLUT-4 otot secara independen dari insulin.
                      </p>
                    </div>

                    {/* 3. ⚠️ BATASAN KLINIS TRANSPARAN */}
                    <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/80 text-[11px] space-y-1">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Batasan Klinis Transparan (Transparent Limits):</span>
                      </div>
                      <p className="text-amber-900/90 leading-relaxed">
                        Mendukung regulasi kardiometabolik, namun <strong>BUKAN pengganti farmakoterapi primer atau insulin DPJP</strong>. Pasien dengan neuropati diabetik berat wajib memakai alas kaki suportif.
                      </p>
                    </div>
                  </div>

                  {/* Habit Card 2: Hydration & Nutrition */}
                  <div className="rounded-2xl border border-emerald-200/90 p-4 bg-white shadow-2xs hover:border-emerald-300 transition-all space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                          Hydration
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">
                          Pre-Rest Cold Electrolyte Hydration
                        </span>
                      </div>
                      <span className="text-xs font-bold text-emerald-600">🥤 350 ml</span>
                    </div>

                    {/* 1. ⚓ JANGKAR PERILAKU */}
                    <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-900 flex items-center gap-1.5">
                          ⚓ <span>Jangkar Perilaku (Habit Stacking & Implementation Intention):</span>
                        </span>
                        <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">BCT 1.2 & 7.1</span>
                      </div>
                      <p className="font-semibold text-slate-800 italic">
                        "JIKA jam menunjukkan pukul 17:00 sore, MAKA saya akan meminum 1 gelas air elektrolit sejuk 350ml."
                      </p>
                    </div>

                    {/* 2. 🔬 RASIONAL ILMIAH */}
                    <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-[11px] space-y-1">
                      <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Rasional Ilmiah (Visible Rationale):</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        Di iklim Abu Dhabi dengan insensible water loss tinggi, rehidrasi terencana mencegah hemokonsentrasi malam dan menjaga viskositas darah optimal (AHA ABPM Guideline 2024).
                      </p>
                    </div>

                    {/* 3. ⚠️ BATASAN KLINIS TRANSPARAN */}
                    <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/80 text-[11px] space-y-1">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Batasan Klinis Transparan (Transparent Limits):</span>
                      </div>
                      <p className="text-amber-900/90 leading-relaxed">
                        Pasien Gagal Jantung Kongestif (NYHA III/IV) atau CKD Stadium 4-5 <strong>wajib mematuhi pembatasan cairan harian ketat</strong> sesuai instruksi nefrolog.
                      </p>
                    </div>
                  </div>

                  {/* Habit Card 3: Sleep & Vagal Tone */}
                  <div className="rounded-2xl border border-purple-200/90 p-4 bg-white shadow-2xs hover:border-purple-300 transition-all space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-800 text-[10px] font-bold border border-purple-200">
                          Sleep & Recovery
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">
                          4-7-8 Parasympathetic Vagal Wind-Down
                        </span>
                      </div>
                      <span className="text-xs font-bold text-purple-600">⏱ 3 Menit</span>
                    </div>

                    {/* 1. ⚓ JANGKAR PERILAKU */}
                    <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-900 flex items-center gap-1.5">
                          ⚓ <span>Jangkar Perilaku (Habit Stacking & Implementation Intention):</span>
                        </span>
                        <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">BCT 11.2 & 8.1</span>
                      </div>
                      <p className="font-semibold text-slate-800 italic">
                        "JIKA mematikan lampu kamar, MAKA saya akan melakukan 4 siklus napas 4-7-8 sebelum memejamkan mata."
                      </p>
                    </div>

                    {/* 2. 🔬 RASIONAL ILMIAH */}
                    <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-[11px] space-y-1">
                      <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Rasional Ilmiah (Visible Rationale):</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        Ekspirasi memanjang menstimulasi baroreseptor karotis dan nervus vagus, meningkatkan tonus parasimpatis +34% dan memfasilitasi penurunan tensi nokturnal (JACC 2023).
                      </p>
                    </div>

                    {/* 3. ⚠️ BATASAN KLINIS TRANSPARAN */}
                    <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/80 text-[11px] space-y-1">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Batasan Klinis Transparan (Transparent Limits):</span>
                      </div>
                      <p className="text-amber-900/90 leading-relaxed">
                        Teknik relaksasi somatik; <strong>BUKAN pengganti Continuous Positive Airway Pressure (CPAP)</strong> untuk pasien Obstructive Sleep Apnea (OSA) berat.
                      </p>
                    </div>
                  </div>

                  {/* Habit Card 4: Harm Reduction / Dokha Cessation */}
                  <div className="rounded-2xl border border-orange-200/90 p-4 bg-white shadow-2xs hover:border-orange-300 transition-all space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded-full bg-orange-50 text-orange-800 text-[10px] font-bold border border-orange-200">
                          Cessation (Abu Dhabi Focus)
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">
                          Delayed Midwakh/Dokha Habit Anchor
                        </span>
                      </div>
                      <span className="text-xs font-bold text-orange-600">⏳ Tunda 15 Menit</span>
                    </div>

                    {/* 1. ⚓ JANGKAR PERILAKU */}
                    <div className="p-2.5 rounded-xl bg-blue-50/60 border border-blue-100 text-[11px] space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-blue-900 flex items-center gap-1.5">
                          ⚓ <span>Jangkar Perilaku (Habit Stacking & Implementation Intention):</span>
                        </span>
                        <span className="text-[9px] font-bold bg-blue-100 text-blue-800 px-1.5 py-0.2 rounded">BCT 12.3 & 8.2</span>
                      </div>
                      <p className="font-semibold text-slate-800 italic">
                        "JIKA dorongan merokok timbul pasca makan, MAKA saya akan menunda 15 menit dan meminum 1 gelas air dingin beraroma mint."
                      </p>
                    </div>

                    {/* 2. 🔬 RASIONAL ILMIAH */}
                    <div className="p-2.5 rounded-xl bg-emerald-50/50 border border-emerald-100 text-[11px] space-y-1">
                      <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <FlaskConical className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Rasional Ilmiah (Visible Rationale):</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">
                        Menunda impuls 15 menit memecah siklus dopaminergik otomatis di amigdala otak, menurunkan CO alveolar sebesar 38% dan mereduksi frekuensi craving harian (Addictive Behaviors 2024).
                      </p>
                    </div>

                    {/* 3. ⚠️ BATASAN KLINIS TRANSPARAN */}
                    <div className="p-2.5 rounded-xl bg-amber-50/50 border border-amber-200/80 text-[11px] space-y-1">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                        <span>Batasan Klinis Transparan (Transparent Limits):</span>
                      </div>
                      <p className="text-amber-900/90 leading-relaxed">
                        Edukasi perilaku kognitif; pasien dengan skor Fagerstrom tinggi (&gt;7) disarankan berkonsultasi untuk Nicotine Replacement Therapy (NRT) medis.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. ANTI-PUNITIVE PRIVACY GUARANTEE (CRITERIA 4) */}
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 text-xs space-y-2">
                  <div className="flex items-center space-x-2 text-emerald-900 font-bold">
                    <Shield className="w-4 h-4 text-emerald-700" />
                    <span>Jaminan Etika & Privasi Non-Punitif (DOH Abu Dhabi & UAE PDP)</span>
                  </div>
                  <p className="text-slate-600 leading-relaxed text-[11px]">
                    Data kebiasaan dan kemunduran (*lapses*) Anda dilindungi secara kriptografis. Dilarang keras digunakan oleh pemberi kerja (*employer*) atau perusahaan asuransi untuk menetapkan sanksi kerja atau kenaikan premi.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Connect a Device */}
      {isDeviceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-sky-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-sky-50 to-white">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-sky-100 flex items-center justify-center text-sky-700 font-bold">
                  <Watch className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900">Hubungkan Perangkat Medis</h3>
              </div>
              <button
                onClick={() => setIsDeviceModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600 mb-2 font-medium">
                Pilih perangkat medis atau wearable yang ingin Anda sinkronkan dengan Sehat AI Encounter:
              </p>

              {/* OMRON Blood Pressure */}
              <div
                onClick={() => handleConnectDevice('omron')}
                className="p-3.5 rounded-2xl border border-sky-200/90 bg-white hover:border-blue-500 hover:bg-blue-50/60 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 text-sm group-hover:text-blue-700">
                    OMRON Complete™ Smart BP + EKG
                  </div>
                  <div className="text-xs text-slate-500">Bluetooth Low Energy • LOINC 85354-9</div>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs">
                  Hubungkan
                </span>
              </div>

              {/* Apple Watch HealthKit */}
              <div
                onClick={() => handleConnectDevice('apple')}
                className="p-3.5 rounded-2xl border border-sky-200/90 bg-white hover:border-blue-500 hover:bg-blue-50/60 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 text-sm group-hover:text-blue-700">
                    Apple Watch Ultra (HealthKit)
                  </div>
                  <div className="text-xs text-slate-500">Continuous Heart Rate, HRV & Sleep Telemetry</div>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs">
                  Hubungkan
                </span>
              </div>

              {/* Dexcom G7 CGM */}
              <div
                onClick={() => handleConnectDevice('dexcom')}
                className="p-3.5 rounded-2xl border border-sky-200/90 bg-white hover:border-blue-500 hover:bg-blue-50/60 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 text-sm group-hover:text-blue-700">
                    Dexcom G7 Continuous Glucose Monitor
                  </div>
                  <div className="text-xs text-slate-500">Real-time Interstitial Glucose (TIR 98%)</div>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-2xs">
                  Hubungkan
                </span>
              </div>

              {/* Aolon GT6 Pro / Google Health Connect */}
              <div
                onClick={() => handleConnectDevice('aolon')}
                className="p-3.5 rounded-2xl border border-teal-200/90 bg-white hover:border-teal-500 hover:bg-teal-50/60 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 text-sm group-hover:text-teal-700">
                    Aolon GT6 Pro (Google Health Connect)
                  </div>
                  <div className="text-xs text-slate-500">Android Health Connect • 24/7 PPG Nadi, SpO2 & Langkah</div>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-teal-50 text-teal-700 group-hover:bg-teal-600 group-hover:text-white transition-all shadow-2xs">
                  Hubungkan
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setIsDeviceModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Connect Health Records */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-emerald-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-emerald-50 to-white">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold">
                  <Database className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-slate-900">Hubungkan Rekam Medis (EMR/FHIR)</h3>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-600 mb-2 font-medium">
                Sinkronkan rekam medis elektronik Anda via portal resmi berstandar HL7 FHIR R4:
              </p>

              {/* SatuSehat Kemenkes RI */}
              <div
                onClick={() => handleConnectRecord('SatuSehat Kemenkes RI')}
                className="p-3.5 rounded-2xl border border-emerald-200/90 bg-white hover:border-emerald-500 hover:bg-emerald-50/60 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-700">
                    SatuSehat Kemenkes RI
                  </div>
                  <div className="text-xs text-slate-500">Platform Integrasi Kesehatan Nasional (UU PDP)</div>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs">
                  Sync FHIR
                </span>
              </div>

              {/* RSUPN Dr. Cipto Mangunkusumo */}
              <div
                onClick={() => handleConnectRecord('RSUPN Dr. Cipto Mangunkusumo')}
                className="p-3.5 rounded-2xl border border-emerald-200/90 bg-white hover:border-emerald-500 hover:bg-emerald-50/60 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-700">
                    RSUPN Dr. Cipto Mangunkusumo
                  </div>
                  <div className="text-xs text-slate-500">Pusat Rujukan Nasional • Resume Medis & Lab</div>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs">
                  Sync FHIR
                </span>
              </div>

              {/* RS Jantung Harapan Kita */}
              <div
                onClick={() => handleConnectRecord('RS Jantung & Pembuluh Darah Harapan Kita')}
                className="p-3.5 rounded-2xl border border-emerald-200/90 bg-white hover:border-emerald-500 hover:bg-emerald-50/60 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
              >
                <div className="space-y-0.5">
                  <div className="font-bold text-slate-900 text-sm group-hover:text-emerald-700">
                    RS Jantung Harapan Kita
                  </div>
                  <div className="text-xs text-slate-500">Pusat Jantung Nasional • Telemetri & Echo</div>
                </div>
                <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-2xs">
                  Sync FHIR
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:text-slate-800"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


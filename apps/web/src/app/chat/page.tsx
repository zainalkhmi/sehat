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
  Info
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
  const [activeTab, setActiveTab] = useState<'patient' | 'data' | 'documents'>('documents');
  const [dataSubFilter, setDataSubFilter] = useState<'metrics' | 'records'>('metrics');
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

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
  const [connectedDevices, setConnectedDevices] = useState<ConnectedDevice[]>([]);
  const [connectedRecords, setConnectedRecords] = useState<ConnectedRecord[]>([]);
  const [uploadedDocuments, setUploadedDocuments] = useState<UploadedDocument[]>([]);
  const [generatedFiles, setGeneratedFiles] = useState<GeneratedFile[]>([]);

  // Patient Overview State
  const [isOverviewGenerated, setIsOverviewGenerated] = useState(false);
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
    <div className="flex flex-col h-screen w-full bg-[#fbfbfb] text-slate-800 font-sans overflow-hidden">
      {/* Top Header Bar (Faithful to Glass Health UI) */}
      <header className="h-14 border-b border-slate-200/80 bg-white px-4 flex items-center justify-between z-30 select-none">
        {/* Left Side: Sidebar Toggle & Breadcrumbs */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
            title="Toggle Sidebar"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-2 text-sm">
            <Link
              href="/"
              className="text-slate-400 hover:text-slate-700 transition-colors text-xs font-medium"
            >
              ← Beranda
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-semibold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Ahmad Kusuma</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block"></span>
            </span>
            <span className="text-slate-400">/</span>
            <span className="text-slate-600 font-medium">Chat 2</span>
          </div>
        </div>

        {/* Right Side: Header Action Buttons */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setIsRecordModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <Database className="w-3.5 h-3.5 text-slate-500" />
            <span>Connect health records</span>
            {connectedRecords.length > 0 && (
              <span className="ml-1 w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
            )}
          </button>

          <button
            onClick={() => setIsDeviceModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <Watch className="w-3.5 h-3.5 text-slate-500" />
            <span>Connect a device</span>
            {connectedDevices.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] bg-sky-100 text-sky-700 font-bold">
                {connectedDevices.length}
              </span>
            )}
          </button>

          <button
            onClick={handleNewChat}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-slate-500" />
            <span>New Chat</span>
          </button>
        </div>
      </header>

      {/* Main Workspace Body: Split Screen */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Pane: AI Chat Column */}
        <div
          className={`flex flex-col h-full bg-[#fbfbfb] border-r border-slate-200/80 transition-all duration-300 ${
            isExpanded ? 'hidden' : 'w-full md:w-1/2 lg:w-7/12'
          }`}
        >
          {/* Chat Messages Container */}
          <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6">
            {messages.length === 0 ? (
              // Empty State - Glass Minimalist Greeting
              <div className="h-full flex flex-col justify-center items-center text-center px-4 max-w-lg mx-auto">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 mb-4">
                  <span className="text-xl font-bold font-serif">G</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
                  Sehat AI Clinical Assistant
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
                  Konsultasikan keluhan, analisis hasil tes laboratorium, validasi interaksi obat, atau sinkronkan metrik perangkat secara langsung.
                </p>

                {/* Status Bar Pills */}
                <div className="mt-5 flex flex-wrap justify-center gap-2 text-xs">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    <Database className="w-3 h-3 text-slate-500" />
                    <span>{connectedRecords.length > 0 ? 'SatuSehat Connected' : 'SatuSehat Ready'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    <Watch className="w-3 h-3 text-slate-500" />
                    <span>{connectedDevices.length > 0 ? `${connectedDevices.length} Perangkat Aktif` : 'Perangkat: Siap Terhubung'}</span>
                  </span>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                    <FileText className="w-3 h-3 text-slate-500" />
                    <span>{uploadedDocuments.length} Dokumen</span>
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
                        ? 'bg-slate-900 text-white rounded-br-sm'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-sm'
                    }`}
                  >
                    {/* Assistant Header Tag */}
                    {msg.sender === 'assistant' && (
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-xs text-slate-400">
                        <div className="flex items-center space-x-1.5 text-emerald-700 font-medium">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          <span>Glass Health Clinical AI</span>
                          <span className="text-[10px] px-1.5 py-0.2 bg-emerald-50 text-emerald-700 rounded border border-emerald-200">
                            {msg.modelUsed || selectedModel}
                          </span>
                        </div>
                        <span>{msg.timestamp}</span>
                      </div>
                    )}

                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Action Cards (e.g. Vitals / Meds / Lab) */}
                    {msg.actionCard && (
                      <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs">
                        <div className="flex items-center justify-between font-semibold text-slate-900 mb-1">
                          <span className="flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-sky-600" />
                            {msg.actionCard.title}
                          </span>
                          <span className="text-[10px] uppercase tracking-wider text-sky-600 font-bold bg-sky-50 px-1.5 py-0.5 rounded">
                            {msg.actionCard.type}
                          </span>
                        </div>
                        <p className="text-slate-600 mb-2">{msg.actionCard.description}</p>
                        {msg.actionCard.data && (
                          <div className="grid grid-cols-2 gap-1.5 bg-white p-2 rounded-lg border border-slate-200/60">
                            {Object.entries(msg.actionCard.data).map(([key, val]) => (
                              <div key={key}>
                                <span className="text-slate-400 block text-[10px]">{key}</span>
                                <span className="font-medium text-slate-800">{val}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Clinical Citations */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap gap-1.5 items-center">
                        <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                          Evidence:
                        </span>
                        {msg.citations.map((cite, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200/60 inline-flex items-center gap-1"
                          >
                            <ExternalLink className="w-2.5 h-2.5 text-slate-400" />
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
              <div className="flex items-center space-x-2 text-slate-400 text-xs py-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-75"></div>
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse delay-150"></div>
                <span className="ml-2 font-medium text-slate-500">Menganalisis bukti klinis & metrik...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Bar Area (With Suggestion Chips & Prompt Input) */}
          <div className="p-4 bg-white border-t border-slate-200/70">
            {/* Quick Prompt Suggestion Chips (Exact match to Glass screenshot) */}
            <div className="flex items-center space-x-2 overflow-x-auto pb-3 mb-1 no-scrollbar text-xs">
              <button
                onClick={() => handleQuickChip('Tolong jelaskan hasil tes laboratorium darah lengkap dan kardiometabolik terbaru')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 whitespace-nowrap transition-colors shadow-2xs"
              >
                <FlaskConical className="w-3.5 h-3.5 text-slate-500" />
                <span>Understand a test result</span>
              </button>

              <button
                onClick={() => handleQuickChip('Pasien mengeluhkan pusing dan lemas di sore hari setelah aktivitas ringan. Evaluasi kemungkinan etiologi')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 whitespace-nowrap transition-colors shadow-2xs"
              >
                <Stethoscope className="w-3.5 h-3.5 text-slate-500" />
                <span>Review a symptom</span>
              </button>

              <button
                onClick={() => handleQuickChip('Evaluasi interaksi obat Amlodipine 5mg dan Metformin 500mg, serta panduan kepatuhan konsumsi')}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 whitespace-nowrap transition-colors shadow-2xs"
              >
                <Pill className="w-3.5 h-3.5 text-slate-500" />
                <span>Understand a medication</span>
                <ArrowRight className="w-3 h-3 text-slate-400" />
              </button>
            </div>

            {/* Audio Waveform Banner when Ambient Recording Active */}
            {isRecordingAudio && (
              <div className="mb-2 p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs text-blue-900 animate-pulse">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-ping"></div>
                  <span className="font-semibold">Ambient Clinical Voice Active</span>
                  <span className="text-blue-700 italic">{audioTranscript}</span>
                </div>
                <button
                  onClick={toggleAmbientAudio}
                  className="px-2 py-0.5 rounded bg-blue-600 text-white font-medium hover:bg-blue-700"
                >
                  Selesai
                </button>
              </div>
            )}

            {/* Glass-Style Prompt Box Container */}
            <div className="relative rounded-2xl border border-slate-300 bg-white shadow-sm focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-100 transition-all p-3">
              {/* Brand Logo Watermark on Top-Right */}
              <div className="absolute top-3 right-3 select-none pointer-events-none">
                <div className="w-5 h-5 rounded-full bg-emerald-600 flex items-center justify-center text-white text-[10px] font-bold font-serif shadow-xs">
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
                placeholder="How else can I help?"
                rows={2}
                className="w-full pr-8 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none bg-transparent"
              />

              {/* Bottom Controls Row inside Input Box (Faithful to Screenshot) */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-1">
                {/* Left Action Buttons: Waveform Voice & Document Attach */}
                <div className="flex items-center space-x-1.5">
                  <button
                    type="button"
                    onClick={toggleAmbientAudio}
                    className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
                      isRecordingAudio
                        ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 animate-pulse'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20'
                    }`}
                    title="Ambient Voice Recording"
                  >
                    <AudioLines className="w-4 h-4" />
                  </button>

                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
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
                      className="inline-flex items-center space-x-1 px-2.5 py-1 text-xs font-medium rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                    >
                      <span>{selectedModel}</span>
                      <ChevronDown className="w-3 h-3 text-slate-500" />
                    </button>

                    {isModelDropdownOpen && (
                      <div className="absolute right-0 bottom-full mb-1.5 w-48 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-40 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedModel('Standard');
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between ${
                            selectedModel === 'Standard' ? 'font-semibold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <div>Standard</div>
                            <div className="text-[10px] text-slate-400">Fast clinical assistant</div>
                          </div>
                          {selectedModel === 'Standard' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedModel('Clinical Pro');
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between ${
                            selectedModel === 'Clinical Pro' ? 'font-semibold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <div>Clinical Pro (MedX)</div>
                            <div className="text-[10px] text-slate-400">Differential Diagnosis & DDx</div>
                          </div>
                          {selectedModel === 'Clinical Pro' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedModel('Evidence RAG');
                            setIsModelDropdownOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-slate-50 flex items-center justify-between ${
                            selectedModel === 'Evidence RAG' ? 'font-semibold text-emerald-700 bg-emerald-50/50' : 'text-slate-700'
                          }`}
                        >
                          <div>
                            <div>Evidence RAG</div>
                            <div className="text-[10px] text-slate-400">PubMed & Guideline Citations</div>
                          </div>
                          {selectedModel === 'Evidence RAG' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Plus Button for Structured Templates */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setIsTemplateMenuOpen(!isTemplateMenuOpen)}
                      className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
                      title="Insert Clinical Template"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    {isTemplateMenuOpen && (
                      <div className="absolute right-0 bottom-full mb-1.5 w-52 rounded-xl bg-white border border-slate-200 shadow-lg py-1.5 z-40 text-xs">
                        <button
                          type="button"
                          onClick={() => {
                            setInputMessage('Keluhan Utama: Nyeri dada tumpul saat aktivitas, durasi 10 menit, membaik saat istirahat.');
                            setIsTemplateMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700"
                        >
                          + Template Keluhan Utama
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInputMessage('Observasi Hemodinamik: TD 118/76 mmHg, HR 72 bpm, RR 18 x/m, SpO2 98%, Suhu 36.6 C.');
                            setIsTemplateMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700"
                        >
                          + Template Tanda Vital
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setInputMessage('Daftar Obat Terkini: Amlodipine 5mg 1x1, Metformin 500mg 2x1. Cek kepatuhan dan kontraindikasi.');
                            setIsTemplateMenuOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-slate-50 text-slate-700"
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
                    className="w-8 h-8 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center justify-center transition-colors"
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
                        ? 'bg-slate-900 text-white hover:bg-slate-800 shadow-sm'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                    title="Send Message"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane: Data, Documents & Patient Summary Inspector (Faithful to Screenshot) */}
        <div
          className={`flex flex-col h-full bg-white transition-all duration-300 ${
            isExpanded ? 'w-full' : 'w-full md:w-1/2 lg:w-5/12'
          }`}
        >
          {/* Right Pane Header Tabs */}
          <div className="h-12 border-b border-slate-200/80 px-4 flex items-center justify-between bg-white select-none">
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('patient')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'patient'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                Profile
              </button>

              <button
                onClick={() => setActiveTab('data')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'data'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                Data
              </button>

              <button
                onClick={() => setActiveTab('documents')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                  activeTab === 'documents'
                    ? 'bg-slate-100 text-slate-900'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                Documents
              </button>
            </div>

            {/* Expand / Minimize Fullscreen Toggle */}
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
              title={isExpanded ? 'Minimize View' : 'Expand View'}
            >
              {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>

          {/* Right Pane Content Area */}
          <div className="flex-1 overflow-y-auto p-6 bg-white space-y-6">
            {/* TAB 1: DATA (Exact match to Image 2) */}
            {activeTab === 'data' && (
              <div className="space-y-6">
                {/* Header & Subtitle */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight">Data Overview</h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {connectedDevices.length === 0 && connectedRecords.length === 0
                        ? 'No data connected yet'
                        : `${connectedDevices.length} device(s) & ${connectedRecords.length} record(s) synced`}
                    </p>
                  </div>

                  {/* Filter Pills: Metrics vs Health Records */}
                  <div className="inline-flex rounded-lg border border-slate-200 p-0.5 bg-slate-50 text-xs">
                    <button
                      onClick={() => setDataSubFilter('metrics')}
                      className={`px-3 py-1 rounded-md font-medium transition-colors ${
                        dataSubFilter === 'metrics'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Metrics
                    </button>
                    <button
                      onClick={() => setDataSubFilter('records')}
                      className={`px-3 py-1 rounded-md font-medium transition-colors ${
                        dataSubFilter === 'records'
                          ? 'bg-white text-slate-900 shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900'
                      }`}
                    >
                      Health records
                    </button>
                  </div>
                </div>

                {/* Metrics Sub-view */}
                {dataSubFilter === 'metrics' && (
                  <div className="rounded-xl border border-slate-200/90 p-5 bg-white shadow-2xs">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <span className="text-sm font-semibold text-slate-900">Metrics</span>
                      <button
                        onClick={() => setIsDeviceModalOpen(true)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Connect
                      </button>
                    </div>

                    {connectedDevices.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-sm font-medium text-slate-700">No connected sources yet.</p>
                        <p className="text-xs text-slate-400 mt-1">Connect your device to get started.</p>
                        <button
                          onClick={() => setIsDeviceModalOpen(true)}
                          className="mt-4 px-3.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                        >
                          <Watch className="w-3.5 h-3.5" />
                          <span>Hubungkan Perangkat</span>
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 mt-2">
                        {connectedDevices.map((dev) => (
                          <div key={dev.id} className="py-3 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-semibold text-slate-900">{dev.name}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                                  {dev.statusBadge}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500">
                                {dev.metricLabel}: <span className="font-bold text-slate-800">{dev.metricValue}</span> {dev.metricUnit}
                              </div>
                            </div>
                            <div className="text-right text-[11px] text-slate-400 flex items-center gap-2">
                              <span className="flex items-center gap-1">
                                <Battery className="w-3 h-3 text-slate-400" />
                                {dev.battery}%
                              </span>
                              <span>• {dev.lastSync}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Health Records Sub-view */}
                {dataSubFilter === 'records' && (
                  <div className="rounded-xl border border-slate-200/90 p-5 bg-white shadow-2xs">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                      <span className="text-sm font-semibold text-slate-900">Health Records (FHIR R4)</span>
                      <button
                        onClick={() => setIsRecordModalOpen(true)}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Connect
                      </button>
                    </div>

                    {connectedRecords.length === 0 ? (
                      <div className="py-8 text-center">
                        <p className="text-sm font-medium text-slate-700">No connected health records yet.</p>
                        <p className="text-xs text-slate-400 mt-1">Connect your SatuSehat or hospital EMR portal to get started.</p>
                        <button
                          onClick={() => setIsRecordModalOpen(true)}
                          className="mt-4 px-3.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-semibold transition-colors inline-flex items-center gap-1.5"
                        >
                          <Database className="w-3.5 h-3.5" />
                          <span>Hubungkan SatuSehat Kemenkes</span>
                        </button>
                      </div>
                    ) : (
                      <div className="divide-y divide-slate-100 mt-2">
                        {connectedRecords.map((rec) => (
                          <div key={rec.id} className="py-3 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <div className="flex items-center space-x-2">
                                <span className="text-xs font-semibold text-slate-900">{rec.provider}</span>
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 font-medium">
                                  {rec.type}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500">
                                Encounter: <span className="font-mono font-medium text-slate-700">{rec.encounterId}</span> • HL7 {rec.fhirVersion}
                              </div>
                            </div>
                            <div className="text-right text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
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

            {/* TAB 2: DOCUMENTS (Exact match to Image 1 & 3) */}
            {activeTab === 'documents' && (
              <div className="space-y-6">
                {/* Header & Subtitle */}
                <div>
                  <h2 className="text-xl font-bold text-slate-900 tracking-tight">Documents Overview</h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {uploadedDocuments.length === 0 && generatedFiles.length === 0
                      ? 'No documents available yet'
                      : `${uploadedDocuments.length + generatedFiles.length} berkas klinis tersedia`}
                  </p>
                </div>

                {/* Card 1: Documents (Connected Health Records) */}
                <div className="rounded-xl border border-slate-200/90 p-5 bg-white shadow-2xs">
                  <div className="pb-3 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-900">Documents</span>
                  </div>

                  {connectedRecords.length === 0 ? (
                    <div className="py-6">
                      <p className="text-sm font-medium text-slate-700">No connected health records yet.</p>
                      <p className="text-xs text-slate-400 mt-0.5">Connect your health records to get started.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 mt-2">
                      {connectedRecords.map((rec) => (
                        <div key={rec.id} className="py-2.5 flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-2">
                            <FileText className="w-4 h-4 text-emerald-600" />
                            <span className="font-medium text-slate-800">{rec.provider} Clinical Summary.pdf</span>
                          </div>
                          <span className="text-slate-400 font-mono text-[11px]">Synced</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card 2: Uploads (With + Upload Button) */}
                <div className="rounded-xl border border-slate-200/90 p-5 bg-white shadow-2xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-900">Uploads</span>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>Upload</span>
                    </button>
                  </div>

                  {uploadedDocuments.length === 0 ? (
                    <div className="py-6">
                      <p className="text-sm font-medium text-slate-700">No uploaded files yet.</p>
                      <p className="text-xs text-slate-400 mt-0.5">Upload a file to get started.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 mt-2">
                      {uploadedDocuments.map((doc) => (
                        <div key={doc.id} className="py-3 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <div className="flex items-center space-x-2">
                              <span className="text-xs font-semibold text-slate-900">{doc.name}</span>
                              <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium">
                                {doc.size}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-400">
                              {doc.uploadedAt} • OCR Extracted
                            </div>
                          </div>
                          <span className="text-xs text-blue-600 font-semibold cursor-pointer hover:underline">
                            Lihat
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Card 3: Created by Glass / Sehat AI */}
                <div className="rounded-xl border border-slate-200/90 p-5 bg-white shadow-2xs">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-900">Created by Glass</span>
                    <button
                      onClick={handleGenerateAIFile}
                      className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
                    >
                      <FilePlus className="w-3.5 h-3.5" />
                      <span>Create file</span>
                    </button>
                  </div>

                  {generatedFiles.length === 0 ? (
                    <div className="py-6">
                      <p className="text-sm font-medium text-slate-700">No generated files yet.</p>
                      <p className="text-xs text-slate-400 mt-0.5">Create a file to get started.</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100 mt-2">
                      {generatedFiles.map((file) => (
                        <div key={file.id} className="py-3 flex items-center justify-between">
                          <div className="space-y-0.5">
                            <span className="text-xs font-semibold text-slate-900">{file.title}</span>
                            <div className="text-[11px] text-slate-400">
                              {file.category} • {file.size}
                            </div>
                          </div>
                          <button className="text-xs text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-1">
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

            {/* TAB 3: PROFILE (Patient Profile & Encounter Overview - Glass Health UI) */}
            {activeTab === 'patient' && (
              <div className="space-y-4">
                {/* Header (Faithful to Screenshot) */}
                <div className="flex items-center justify-between pb-1">
                  <div>
                    <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">Patient Overview</h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {isOverviewGenerated
                        ? 'Overview generated • 3 sources synced'
                        : 'No overview generated yet'}
                    </p>
                  </div>
                  <button
                    onClick={handleRefreshOverview}
                    className="inline-flex items-center space-x-1.5 px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200/60 shadow-2xs"
                    title="Refresh Patient Overview"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isRefreshingOverview ? 'animate-spin' : ''}`} />
                    <span>Refresh</span>
                  </button>
                </div>

                {/* 2-Column Responsive Grid (Exact Match to Screenshot) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left Column: Digital Twin & Health History */}
                  <div className="space-y-4 flex flex-col">
                    {/* Card 1: Digital Twin */}
                    <div className="rounded-xl border border-slate-200/90 p-4 bg-white shadow-2xs flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-800">Digital Twin</span>
                        {selectedOrgan && (
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-sky-50 text-sky-700 border border-sky-200 animate-in fade-in">
                            {selectedOrgan}
                          </span>
                        )}
                      </div>

                      {/* Holographic 3D Human Body Silhouette SVG */}
                      <div className="flex-1 flex flex-col items-center justify-center py-2 relative min-h-[310px] select-none">
                        <svg
                          viewBox="0 0 200 360"
                          className="w-48 h-72 sm:h-80 drop-shadow-md transition-transform hover:scale-102 duration-300"
                        >
                          <defs>
                            <linearGradient id="bodyGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.45" />
                              <stop offset="50%" stopColor="#0ea5e9" stopOpacity="0.65" />
                              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.5" />
                            </linearGradient>
                            <radialGradient id="heartGlow" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor="#ff4d6d" stopOpacity="0.95" />
                              <stop offset="70%" stopColor="#e11d48" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#be123c" stopOpacity="0.1" />
                            </radialGradient>
                            <radialGradient id="brainGlow" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
                              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.2" />
                            </radialGradient>
                            <radialGradient id="metabolicGlow" cx="50%" cy="50%" r="50%">
                              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#0369a1" stopOpacity="0.1" />
                            </radialGradient>
                            <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
                              <feGaussianBlur stdDeviation="3" result="blur" />
                              <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                          </defs>

                          {/* Aura Background Glow */}
                          <ellipse cx="100" cy="180" rx="45" ry="140" fill="#38bdf8" opacity="0.08" filter="url(#softGlow)" />

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
                            strokeOpacity="0.7"
                          />

                          {/* Translucent Ribcage lines */}
                          <path d="M85 88 C95 84, 105 84, 115 88" stroke="#bae6fd" strokeWidth="0.8" strokeOpacity="0.6" fill="none" />
                          <path d="M82 98 C94 94, 106 94, 118 98" stroke="#bae6fd" strokeWidth="0.8" strokeOpacity="0.6" fill="none" />
                          <path d="M84 108 C94 104, 106 104, 116 108" stroke="#bae6fd" strokeWidth="0.8" strokeOpacity="0.6" fill="none" />
                          <path d="M86 118 C94 114, 106 114, 114 118" stroke="#bae6fd" strokeWidth="0.8" strokeOpacity="0.6" fill="none" />

                          {/* Spinal Column */}
                          <line x1="100" y1="65" x2="100" y2="185" stroke="#e0f2fe" strokeWidth="1.5" strokeDasharray="3 2" strokeOpacity="0.5" />

                          {/* Lungs Silhouette */}
                          <path
                            d="M86 85 C82 95, 82 115, 88 120 C92 120, 95 105, 95 90 Z"
                            fill="#0284c7"
                            fillOpacity="0.25"
                            className="cursor-pointer hover:fill-opacity-40"
                            onClick={() => setSelectedOrgan('Respiratory: SpO2 98% • RR 16 x/min')}
                          />
                          <path
                            d="M114 85 C118 95, 118 115, 112 120 C108 120, 105 105, 105 90 Z"
                            fill="#0284c7"
                            fillOpacity="0.25"
                            className="cursor-pointer hover:fill-opacity-40"
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
                          {/* Left Arm */}
                          <path
                            d="M68 76 C62 90, 58 115, 56 140 C54 160, 50 185, 48 205 C46 210, 48 218, 52 216 C55 214, 58 195, 62 175 C66 155, 70 130, 72 108"
                            fill="url(#bodyGlow)"
                            stroke="#38bdf8"
                            strokeWidth="0.8"
                            strokeOpacity="0.5"
                          />
                          {/* Right Arm */}
                          <path
                            d="M132 76 C138 90, 142 115, 144 140 C146 160, 150 185, 152 205 C154 210, 152 218, 148 216 C145 214, 142 195, 138 175 C134 155, 130 130, 128 108"
                            fill="url(#bodyGlow)"
                            stroke="#38bdf8"
                            strokeWidth="0.8"
                            strokeOpacity="0.5"
                          />

                          {/* Pelvis */}
                          <path d="M78 188 C82 200, 118 200, 122 188 L116 215 L84 215 Z" fill="url(#bodyGlow)" stroke="#38bdf8" strokeWidth="0.8" strokeOpacity="0.5" />

                          {/* Legs */}
                          {/* Left Leg */}
                          <path
                            d="M84 215 C82 235, 80 265, 82 290 C83 310, 80 335, 78 350 C80 354, 88 354, 90 350 C93 335, 94 310, 95 290 C96 265, 98 235, 98 215 Z"
                            fill="url(#bodyGlow)"
                            stroke="#38bdf8"
                            strokeWidth="0.9"
                            strokeOpacity="0.6"
                          />
                          {/* Right Leg */}
                          <path
                            d="M116 215 C118 235, 120 265, 118 290 C117 310, 120 335, 122 350 C120 354, 112 354, 110 350 C107 335, 106 310, 105 290 C104 265, 102 235, 102 215 Z"
                            fill="url(#bodyGlow)"
                            stroke="#38bdf8"
                            strokeWidth="0.9"
                            strokeOpacity="0.6"
                          />

                          {/* Femoral Vascular tracings */}
                          <path d="M98 185 L90 250 L88 320" stroke="#f43f5e" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
                          <path d="M102 185 L110 250 L112 320" stroke="#f43f5e" strokeWidth="0.8" strokeOpacity="0.4" fill="none" />
                        </svg>

                        {/* Interactive Organ Hotspots Prompt */}
                        <div className="mt-2 text-center">
                          <p className="text-[11px] text-slate-400">
                            {selectedOrgan ? (
                              <span className="text-sky-700 font-semibold">{selectedOrgan}</span>
                            ) : (
                              'Klik organ tubuh untuk membedah telemetri sistemik'
                            )}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Card 2: Health History */}
                    <div className="rounded-xl border border-slate-200/90 p-4 bg-white shadow-2xs">
                      <div className="text-xs font-semibold text-slate-800 mb-2">
                        Health History
                      </div>
                      {!isOverviewGenerated && connectedRecords.length === 0 ? (
                        <p className="text-xs text-slate-400 py-3">No health history yet</p>
                      ) : (
                        <div className="space-y-2 text-xs divide-y divide-slate-100">
                          <div className="pt-1.5 space-y-0.5">
                            <span className="font-semibold text-slate-800">Riwayat Penyakit Dahulu (RPD)</span>
                            <p className="text-slate-500">Hipertensi Stage 1 terdiagnosis 2024. Riwayat dislipidemia terkontrol.</p>
                          </div>
                          <div className="pt-2 space-y-0.5">
                            <span className="font-semibold text-slate-800">Riwayat Penyakit Keluarga (RPK)</span>
                            <p className="text-slate-500">Ayah: Infark Miokard akut pada usia 62 th. Ibu: DM Tipe 2.</p>
                          </div>
                          <div className="pt-2 space-y-0.5">
                            <span className="font-semibold text-slate-800">Gaya Hidup & Imunisasi</span>
                            <p className="text-slate-500">Non-perokok, jalan kaki rata-rata 8.420 langkah/hari. Vaksin Influenza 2026.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Column: Connected Sources, Health Insights, Active Conditions */}
                  <div className="space-y-4 flex flex-col">
                    {/* Card 3: Connected Sources */}
                    <div className="rounded-xl border border-slate-200/90 p-4 bg-white shadow-2xs">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-800">Connected Sources</span>
                        {connectedDevices.length > 0 && (
                          <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
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
                          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <div className="flex items-center space-x-2">
                              <Activity className="w-3.5 h-3.5 text-blue-600" />
                              <span className="font-medium text-slate-800">OMRON Complete Smart BP</span>
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">118/76 mmHg</span>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <div className="flex items-center space-x-2">
                              <Watch className="w-3.5 h-3.5 text-slate-700" />
                              <span className="font-medium text-slate-800">Apple Watch Ultra 2</span>
                            </div>
                            <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">72 bpm • Active</span>
                          </div>
                          <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <div className="flex items-center space-x-2">
                              <Database className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="font-medium text-slate-800">SatuSehat Kemenkes (IHS)</span>
                            </div>
                            <span className="text-[10px] font-mono text-slate-500">IH-10029381</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card 4: Health Insights */}
                    <div className="rounded-xl border border-slate-200/90 p-4 bg-white shadow-2xs">
                      <div className="text-xs font-semibold text-slate-800 mb-2">
                        Health Insights
                      </div>
                      {!isOverviewGenerated && connectedDevices.length === 0 ? (
                        <div className="py-4">
                          <p className="text-xs text-slate-400">No health insights yet</p>
                        </div>
                      ) : (
                        <div className="space-y-2.5 text-xs">
                          <div className="p-2.5 rounded-lg bg-sky-50/60 border border-sky-100 space-y-1">
                            <div className="flex items-center justify-between font-semibold text-sky-900">
                              <span className="flex items-center gap-1.5">
                                <HeartPulse className="w-3.5 h-3.5 text-sky-600" />
                                Circadian Dipping Normal
                              </span>
                              <span className="text-[10px] text-sky-600 bg-white px-1.5 py-0.5 rounded border border-sky-200">12.4% Drop</span>
                            </div>
                            <p className="text-slate-600 text-[11px] leading-relaxed">
                              Penurunan tekanan darah malam hari berada dalam rentang fisiologis ideal (*Normal Dipper*), mengindikasikan proteksi organ target yang baik.
                            </p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 space-y-1">
                            <div className="flex items-center justify-between font-semibold text-emerald-900">
                              <span className="flex items-center gap-1.5">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                Adherensi Farmakoterapi Tinggi
                              </span>
                              <span className="text-[10px] text-emerald-700 bg-white px-1.5 py-0.5 rounded border border-emerald-200">96% Tercatat</span>
                            </div>
                            <p className="text-slate-600 text-[11px] leading-relaxed">
                              Kepatuhan konsumsi Amlodipine 5mg tepat waktu teratur selama 30 hari berturut-turut via asisten Pillo.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Card 5: Active Conditions, Medications, & Allergies */}
                    <div className="rounded-xl border border-slate-200/90 p-4 bg-white shadow-2xs">
                      <div className="text-xs font-semibold text-slate-800 mb-2">
                        Active Conditions, Medications, & Allergies
                      </div>
                      {!isOverviewGenerated && connectedRecords.length === 0 ? (
                        <div className="py-4">
                          <p className="text-xs text-slate-400">No active conditions recorded yet.</p>
                        </div>
                      ) : (
                        <div className="space-y-3 text-xs">
                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Kondisi Aktif</span>
                            <div className="flex flex-wrap gap-1.5">
                              <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-medium">
                                Hipertensi Esensial (ICD-10 I10)
                              </span>
                              <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200 font-medium">
                                Prediabetes (ICD-10 R73.03)
                              </span>
                            </div>
                          </div>

                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Medikasi Berjalan</span>
                            <div className="space-y-1">
                              <div className="flex items-center justify-between text-slate-700">
                                <span className="font-semibold text-slate-800">Amlodipine Besylate 5 mg</span>
                                <span className="text-slate-500">1x1 Pagi</span>
                              </div>
                              <div className="flex items-center justify-between text-slate-700">
                                <span className="font-semibold text-slate-800">Metformin HCl 500 mg</span>
                                <span className="text-slate-500">2x1 Bersama Makan</span>
                              </div>
                            </div>
                          </div>

                          <div>
                            <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider mb-1">Alergi Terverifikasi</span>
                            <span className="px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200 font-semibold inline-block">
                              Penisilin (Reaksi: Urtikaria / Ruam Akut)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: Connect a Device */}
      {isDeviceModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Watch className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-900">Hubungkan Perangkat Medis</h3>
              </div>
              <button
                onClick={() => setIsDeviceModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-500 mb-2">
                Pilih perangkat medis atau wearable yang ingin Anda sinkronkan dengan Sehat AI Encounter:
              </p>

              {/* OMRON Blood Pressure */}
              <div
                onClick={() => handleConnectDevice('omron')}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-900 text-sm group-hover:text-blue-700">
                    OMRON Complete™ Smart BP + EKG
                  </div>
                  <div className="text-xs text-slate-500">Bluetooth Low Energy • LOINC 85354-9</div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  Hubungkan
                </span>
              </div>

              {/* Apple Watch HealthKit */}
              <div
                onClick={() => handleConnectDevice('apple')}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-900 text-sm group-hover:text-blue-700">
                    Apple Watch Ultra (HealthKit)
                  </div>
                  <div className="text-xs text-slate-500">Continuous Heart Rate, HRV & Sleep Telemetry</div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  Hubungkan
                </span>
              </div>

              {/* Dexcom G7 CGM */}
              <div
                onClick={() => handleConnectDevice('dexcom')}
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/50 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-900 text-sm group-hover:text-blue-700">
                    Dexcom G7 Continuous Glucose Monitor
                  </div>
                  <div className="text-xs text-slate-500">Real-time Interstitial Glucose (TIR 98%)</div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  Hubungkan
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setIsDeviceModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
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
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Database className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900">Hubungkan Rekam Medis (EMR/FHIR)</h3>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              <p className="text-xs text-slate-500 mb-2">
                Sinkronkan rekam medis elektronik Anda via portal resmi berstandar HL7 FHIR R4:
              </p>

              {/* SatuSehat Kemenkes RI */}
              <div
                onClick={() => handleConnectRecord('SatuSehat Kemenkes RI')}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-900 text-sm group-hover:text-emerald-700">
                    SatuSehat Kemenkes RI
                  </div>
                  <div className="text-xs text-slate-500">Platform Integrasi Kesehatan Nasional (UU PDP)</div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  Sync FHIR
                </span>
              </div>

              {/* RSUPN Dr. Cipto Mangunkusumo */}
              <div
                onClick={() => handleConnectRecord('RSUPN Dr. Cipto Mangunkusumo')}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-900 text-sm group-hover:text-emerald-700">
                    RSUPN Dr. Cipto Mangunkusumo
                  </div>
                  <div className="text-xs text-slate-500">Pusat Rujukan Nasional • Resume Medis & Lab</div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  Sync FHIR
                </span>
              </div>

              {/* RS Jantung Harapan Kita */}
              <div
                onClick={() => handleConnectRecord('RS Jantung & Pembuluh Darah Harapan Kita')}
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div className="space-y-0.5">
                  <div className="font-semibold text-slate-900 text-sm group-hover:text-emerald-700">
                    RS Jantung Harapan Kita
                  </div>
                  <div className="text-xs text-slate-500">Pusat Jantung Nasional • Telemetri & Echo</div>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  Sync FHIR
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 text-right">
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
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


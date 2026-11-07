'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HeartPulse,
  Database,
  Terminal,
  Layers,
  Code2,
  Play,
  Copy,
  Check,
  Search,
  Filter,
  ShieldCheck,
  Cpu,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Zap,
  Lock,
  FileCode,
  Activity,
  Bot,
  Sliders,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { SupabaseBadge } from '@/components/SupabaseBadge';

// Sample FHIR R4 Resources Mocked from Supabase & Spezi
interface FHIRResource {
  resourceType: string;
  id: string;
  meta: { versionId: string; lastUpdated: string };
  status: string;
  code?: string;
  display: string;
  subject: string;
  effectiveDateTime: string;
  rawJson: object;
}

const SAMPLE_RESOURCES: FHIRResource[] = [
  {
    resourceType: 'Observation',
    id: 'obs-bp-88219',
    meta: { versionId: '1', lastUpdated: '2026-11-07T08:15:00Z' },
    status: 'final',
    code: '85354-9',
    display: 'Blood Pressure Panel (103/64 mmHg, 62 BPM)',
    subject: 'Patient/P-88219 (Zainal)',
    effectiveDateTime: '2026-11-07T08:15:00 WIB',
    rawJson: {
      resourceType: 'Observation',
      id: 'obs-bp-88219',
      status: 'final',
      category: [
        {
          coding: [
            {
              system: 'http://terminology.hl7.org/CodeSystem/observation-category',
              code: 'vital-signs',
              display: 'Vital Signs',
            },
          ],
        },
      ],
      code: {
        coding: [{ system: 'http://loinc.org', code: '85354-9', display: 'Blood pressure panel' }],
        text: 'Blood Pressure',
      },
      subject: { reference: 'Patient/P-88219', display: 'Zainal' },
      effectiveDateTime: '2026-11-07T08:15:00+07:00',
      component: [
        {
          code: { coding: [{ system: 'http://loinc.org', code: '8480-6', display: 'Systolic blood pressure' }] },
          valueQuantity: { value: 103, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' },
        },
        {
          code: { coding: [{ system: 'http://loinc.org', code: '8462-4', display: 'Diastolic blood pressure' }] },
          valueQuantity: { value: 64, unit: 'mmHg', system: 'http://unitsofmeasure.org', code: 'mm[Hg]' },
        },
      ],
      device: { display: 'Omron BP5250 Upper Arm Cuff (BLE)' },
    },
  },
  {
    resourceType: 'Observation',
    id: 'obs-spo2-88220',
    meta: { versionId: '1', lastUpdated: '2026-11-07T08:15:00Z' },
    status: 'final',
    code: '59408-5',
    display: 'Oxygen Saturation SpO2 (98 %)',
    subject: 'Patient/P-88219 (Zainal)',
    effectiveDateTime: '2026-11-07T08:15:00 WIB',
    rawJson: {
      resourceType: 'Observation',
      id: 'obs-spo2-88220',
      status: 'final',
      code: {
        coding: [{ system: 'http://loinc.org', code: '59408-5', display: 'Oxygen saturation in Arterial blood' }],
      },
      subject: { reference: 'Patient/P-88219' },
      valueQuantity: { value: 98, unit: '%', system: 'http://unitsofmeasure.org', code: '%' },
      device: { display: 'Apple Watch Series 9 (HealthKit)' },
    },
  },
  {
    resourceType: 'MedicationRequest',
    id: 'medreq-amlodipine-01',
    meta: { versionId: '2', lastUpdated: '2026-11-07T07:00:00Z' },
    status: 'active',
    code: 'KFA-93001882',
    display: 'Amlodipine Besylate 5 mg (1x Sehari)',
    subject: 'Patient/P-88219 (Zainal)',
    effectiveDateTime: '2026-11-01 s/d 2026-11-30',
    rawJson: {
      resourceType: 'MedicationRequest',
      id: 'medreq-amlodipine-01',
      status: 'active',
      intent: 'order',
      medicationCodeableConcept: {
        coding: [
          { system: 'http://sys-ids.kemkes.go.id/kfa', code: '93001882', display: 'Amlodipine Besylate 5 mg Tablet' },
        ],
        text: 'Amlodipine 5 mg',
      },
      subject: { reference: 'Patient/P-88219' },
      requester: { reference: 'Practitioner/dr-budi-santoso', display: 'dr. Budi Santoso, Sp.JP(K)' },
      dosageInstruction: [
        {
          text: '1 Tablet Sesudah Makan Pagi',
          timing: { repeat: { frequency: 1, period: 1, periodUnit: 'd' } },
        },
      ],
      dispenseRequest: {
        initialFill: { quantity: { value: 30, unit: 'Tablet' } },
        remainingStock: 24,
      },
    },
  },
  {
    resourceType: 'Patient',
    id: 'P-88219',
    meta: { versionId: '1', lastUpdated: '2026-11-01T00:00:00Z' },
    status: 'active',
    code: 'NIK-317102882190001',
    display: 'Zainal (Laki-laki, 42 Thn) • DPJP: dr. Budi Santoso',
    subject: 'Patient/P-88219',
    effectiveDateTime: 'Terdaftar sejak 1 Nov 2026',
    rawJson: {
      resourceType: 'Patient',
      id: 'P-88219',
      identifier: [
        { system: 'https://fhir.kemkes.go.id/id/nik', value: '317102882190001' },
        { system: 'https://fhir.kemkes.go.id/id/ihs-number', value: '10000004218' },
      ],
      name: [{ use: 'official', family: 'Zainal', given: ['Zainal'] }],
      gender: 'male',
      birthDate: '1984-06-15',
      generalPractitioner: [{ reference: 'Practitioner/dr-budi-santoso', display: 'dr. Budi Santoso, Sp.JP(K)' }],
    },
  },
  {
    resourceType: 'Device',
    id: 'dev-omron-5250',
    meta: { versionId: '1', lastUpdated: '2026-11-07T02:36:00Z' },
    status: 'active',
    code: 'ESH-IP-2010',
    display: 'Omron BP5250 Upper Arm Cuff • Kemenkes AKL',
    subject: 'Patient/P-88219',
    effectiveDateTime: 'Terkoneksi BLE',
    rawJson: {
      resourceType: 'Device',
      id: 'dev-omron-5250',
      status: 'active',
      manufacturer: 'Omron Healthcare',
      modelNumber: 'BP5250',
      type: { text: 'Blood Pressure Monitor Cuff' },
      safety: [{ text: 'FDA Cleared Class II • Kemenkes RI AKL 20501' }],
    },
  },
];

export default function SDKConsolePage() {
  const [activeTab, setActiveTab] = useState<'explorer' | 'playground' | 'bots' | 'components' | 'auth'>('explorer');

  // Resource Explorer States
  const [selectedResourceType, setSelectedResourceType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectingResource, setInspectingResource] = useState<FHIRResource>(SAMPLE_RESOURCES[0]);
  const [copiedJson, setCopiedJson] = useState(false);

  // Playground States
  const [httpMethod, setHttpMethod] = useState<'GET' | 'POST' | 'PUT'>('GET');
  const [queryEndpoint, setQueryEndpoint] = useState('/Observation?patient=P-88219&_sort=-date');
  const [isExecuting, setIsExecuting] = useState(false);
  const [queryResponse, setQueryResponse] = useState<string | null>(null);

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  // Run Query in Playground
  const handleRunQuery = () => {
    setIsExecuting(true);
    setQueryResponse(null);

    setTimeout(() => {
      setIsExecuting(false);
      setQueryResponse(
        JSON.stringify(
          {
            resourceType: 'Bundle',
            type: 'searchset',
            total: 2,
            meta: { lastUpdated: new Date().toISOString() },
            entry: SAMPLE_RESOURCES.filter((r) => r.resourceType === 'Observation').map((r) => ({
              fullUrl: `https://api.futurehealth.care/fhir/R4/${r.resourceType}/${r.id}`,
              resource: r.rawJson,
            })),
          },
          null,
          2
        )
      );
    }, 600);
  };

  const filteredResources = SAMPLE_RESOURCES.filter((res) => {
    const matchType = selectedResourceType === 'All' || res.resourceType === selectedResourceType;
    const matchSearch =
      res.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.display.toLowerCase().includes(searchQuery.toLowerCase()) ||
      res.resourceType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchType && matchSearch;
  });

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* ================= TOP NAV BAR ================= */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-sky-500/20 group-hover:scale-105 transition-transform">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-extrabold tracking-tight text-white">FUTURE HEALTH</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-400 border border-sky-500/30">
                    MEDPLUM SDK
                  </span>
                </div>
                <p className="text-xs text-slate-400">Headless EHR & Clinical FHIR R4 Developer Platform</p>
              </div>
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            <div className="hidden md:flex items-center gap-2 px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>FHIR Server: Online (US-East & SatuSehat Bridge)</span>
            </div>

            <SupabaseBadge />

            <Link
              href="/dashboard/doctor"
              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-sm transition-colors"
            >
              Doctor Portal →
            </Link>
          </div>
        </div>
      </header>

      {/* ================= HERO SUB-HEADER ================= */}
      <div className="border-b border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-2">
              <Code2 className="w-3.5 h-3.5" />
              <span>Like Medplum • HL7 FHIR R4 • React UI SDK • Medplum Bots</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Developer SDK & Clinical Telemetry Console
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-2xl">
              Inspect raw clinical resources, test FHIR queries, automate alerts with Medplum Bots, and integrate
              modular UI widgets into cross-platform web and mobile health apps.
            </p>
          </div>

          {/* Metrics summary */}
          <div className="flex items-center gap-4 bg-slate-800/60 border border-slate-700/50 p-3 rounded-xl">
            <div>
              <p className="text-xs text-slate-400">Total Resources</p>
              <p className="text-xl font-bold text-white">128</p>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div>
              <p className="text-xs text-slate-400">Active Bots</p>
              <p className="text-xl font-bold text-emerald-400">3 Running</p>
            </div>
            <div className="w-px h-8 bg-slate-700" />
            <div>
              <p className="text-xs text-slate-400">API Latency</p>
              <p className="text-xl font-bold text-sky-400">24 ms</p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="max-w-7xl mx-auto mt-6 flex space-x-1 border-b border-slate-800">
          {[
            { id: 'explorer', label: 'Resource Explorer', icon: Layers },
            { id: 'playground', label: 'API Playground (REST / GraphQL)', icon: Terminal },
            { id: 'bots', label: 'Clinical Bots & Automation', icon: Bot },
            { id: 'components', label: 'React UI SDK Showcase', icon: FileCode },
            { id: 'auth', label: 'SMART on FHIR & Access Policies', icon: ShieldCheck },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all ${
                  isActive
                    ? 'border-sky-500 text-sky-400 bg-sky-500/10 rounded-t-lg'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ================= TAB CONTENT AREA ================= */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8">
        {/* ================= TAB 1: RESOURCE EXPLORER ================= */}
        {activeTab === 'explorer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: Resource List & Filters */}
            <div className="lg:col-span-7 space-y-4">
              {/* Filter and Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by ID, code, or description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-800/80 border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-xs sm:text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                  {['All', 'Observation', 'MedicationRequest', 'Patient', 'Device'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setSelectedResourceType(type)}
                      className={`px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                        selectedResourceType === type
                          ? 'bg-sky-600 text-white'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              {/* Resource Table */}
              <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl overflow-hidden shadow-xl">
                <div className="p-3 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  <span>Resource Match ({filteredResources.length})</span>
                  <span>Select to Inspect</span>
                </div>

                <div className="divide-y divide-slate-700/60">
                  {filteredResources.map((res) => {
                    const isSelected = inspectingResource.id === res.id;
                    return (
                      <div
                        key={res.id}
                        onClick={() => setInspectingResource(res)}
                        className={`p-4 cursor-pointer transition-all flex items-center justify-between ${
                          isSelected ? 'bg-sky-950/40 border-l-4 border-sky-500' : 'hover:bg-slate-800/70'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-sky-900/60 text-sky-300 border border-sky-700/50">
                              {res.resourceType}
                            </span>
                            <span className="text-xs font-mono text-slate-400">#{res.id}</span>
                            <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-900/50 text-emerald-400">
                              {res.status}
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-100">{res.display}</p>
                          <p className="text-xs text-slate-400">
                            {res.subject} • {res.effectiveDateTime}
                          </p>
                        </div>

                        <ChevronRight className={`w-5 h-5 ${isSelected ? 'text-sky-400' : 'text-slate-600'}`} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right: Live FHIR JSON Inspector Drawer */}
            <div className="lg:col-span-5 bg-slate-950 border border-slate-800 rounded-2xl p-5 flex flex-col h-[650px] shadow-2xl">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-sky-400" />
                  <span className="text-sm font-bold text-white">FHIR R4 JSON Schema Viewer</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleCopy(JSON.stringify(inspectingResource.rawJson, null, 2))}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
                  >
                    {copiedJson ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedJson ? 'Copied' : 'Copy JSON'}</span>
                  </button>
                  <span className="px-2 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                    VALID R4
                  </span>
                </div>
              </div>

              {/* Resource Summary */}
              <div className="py-3 text-xs border-b border-slate-800/80 space-y-1">
                <p className="text-slate-400">
                  Resource: <span className="text-sky-400 font-mono">{inspectingResource.resourceType}/{inspectingResource.id}</span>
                </p>
                <p className="text-slate-400">
                  Last Updated: <span className="text-slate-200">{inspectingResource.meta.lastUpdated}</span>
                </p>
              </div>

              {/* Raw JSON viewer */}
              <div className="flex-1 overflow-auto mt-3 rounded-xl bg-slate-900/90 p-4 font-mono text-xs text-sky-300 leading-relaxed border border-slate-800">
                <pre>{JSON.stringify(inspectingResource.rawJson, null, 2)}</pre>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: API & QUERY PLAYGROUND ================= */}
        {activeTab === 'playground' && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-sky-400" />
                <span>FHIR REST & Batch Query Console</span>
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                Test standard HL7 FHIR search parameters, compartment searches, and batch bundle operations directly.
              </p>

              {/* URL Bar */}
              <div className="flex flex-col sm:flex-row gap-3">
                <select
                  value={httpMethod}
                  onChange={(e) => setHttpMethod(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-sm font-bold text-sky-400 focus:outline-none"
                >
                  <option value="GET">GET</option>
                  <option value="POST">POST</option>
                  <option value="PUT">PUT</option>
                </select>

                <div className="relative flex-1">
                  <span className="absolute left-3 top-2.5 text-xs text-slate-500 font-mono">
                    https://api.futurehealth.care/fhir/R4
                  </span>
                  <input
                    type="text"
                    value={queryEndpoint}
                    onChange={(e) => setQueryEndpoint(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-64 pr-4 py-2.5 text-xs sm:text-sm font-mono text-emerald-400 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <button
                  onClick={handleRunQuery}
                  disabled={isExecuting}
                  className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-sm shadow-lg shadow-sky-600/20 transition-all disabled:opacity-50"
                >
                  {isExecuting ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  <span>Execute</span>
                </button>
              </div>

              {/* Quick Query Presets */}
              <div className="mt-4 flex flex-wrap items-center gap-2">
                <span className="text-xs text-slate-400">Presets:</span>
                {[
                  { label: 'Patient Vitals', url: '/Observation?patient=P-88219&category=vital-signs' },
                  { label: 'Active Prescriptions', url: '/MedicationRequest?patient=P-88219&status=active' },
                  { label: 'Connected Devices', url: '/Device?patient=P-88219' },
                  { label: 'Everything ($everything)', url: '/Patient/P-88219/$everything' },
                ].map((preset) => (
                  <button
                    key={preset.label}
                    onClick={() => {
                      setQueryEndpoint(preset.url);
                      setHttpMethod('GET');
                    }}
                    className="text-xs px-2.5 py-1 rounded-lg bg-slate-700/60 hover:bg-slate-700 text-slate-300 border border-slate-600/50"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Query Output */}
            {queryResponse && (
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-xs">
                      200 OK
                    </span>
                    <span className="text-xs text-slate-400">Response Time: 34ms</span>
                    <span className="text-xs text-slate-400">• Content-Type: application/fhir+json</span>
                  </div>
                  <button
                    onClick={() => handleCopy(queryResponse)}
                    className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
                  >
                    Copy Output
                  </button>
                </div>
                <pre className="bg-slate-900/90 rounded-xl p-4 font-mono text-xs text-emerald-300 overflow-auto max-h-96">
                  {queryResponse}
                </pre>
              </div>
            )}
          </div>
        )}

        {/* ================= TAB 3: CLINICAL BOTS & AUTOMATION ================= */}
        {activeTab === 'bots' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Bot className="w-5 h-5 text-indigo-400" />
                  <span>Medplum Bots (Serverless Event-Driven Clinical Logic)</span>
                </h2>
                <p className="text-sm text-slate-400 mt-1">
                  Trigger TypeScript micro-services automatically whenever FHIR Observations or Medication intakes are recorded.
                </p>
              </div>
              <button
                onClick={() => alert('New Bot creation form initialized.')}
                className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center gap-2"
              >
                <span>+ Create Bot</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Bot 1: Early Warning Score */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                      ACTIVE
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">NEWS2 Early Warning Scorer</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Triggers on every new <code className="text-sky-300">Observation</code>. Computes the National Early
                    Warning Score. If score &ge; 5, dispatches priority alert to dr. Budi Santoso (DPJP).
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                  <span>Invocations: 1,420</span>
                  <span className="text-sky-400 font-semibold cursor-pointer">Edit Bot Code →</span>
                </div>
              </div>

              {/* Bot 2: Medication Stock Decrement */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                      ACTIVE
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">Medication Stock Deductor</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Listens to Pillo Reminder <code className="text-sky-300">take_now</code> events. Atomically decrements
                    remaining stock in Supabase database and triggers refill alert when &le; 7 tablets.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                  <span>Invocations: 348</span>
                  <span className="text-sky-400 font-semibold cursor-pointer">Edit Bot Code →</span>
                </div>
              </div>

              {/* Bot 3: SatuSehat Bridge */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400">
                      ACTIVE
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white">SatuSehat Kemenkes Interop</h3>
                  <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                    Transforms local patient observations into Kemenkes RI FHIR profiles with verified NIK, IHS Number,
                    and KFA medication codes for national regulatory compliance.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                  <span>Invocations: 980</span>
                  <span className="text-sky-400 font-semibold cursor-pointer">Edit Bot Code →</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 4: REACT UI SDK SHOWCASE ================= */}
        {activeTab === 'components' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <FileCode className="w-5 h-5 text-sky-400" />
                <span>Medplum React UI SDK Component Library</span>
              </h2>
              <p className="text-sm text-slate-400 mt-1">
                Drop-in, type-safe React components engineered for clinical applications and remote patient monitoring.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Component 1: ResourceTable */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-sky-400 font-bold">&lt;ResourceTable /&gt;</span>
                  <span className="text-[10px] bg-slate-700 px-2 py-0.5 rounded text-slate-300">Medplum UI</span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Renders standard FHIR query results into sortable, filterable clinical tables.
                </p>
                <div className="bg-slate-900 rounded-xl p-3 font-mono text-xs text-slate-300 border border-slate-800">
                  <code>{`import { ResourceTable } from '@future-health/ui';

<ResourceTable
  resourceType="Observation"
  patient="P-88219"
  columns={['code', 'value', 'effectiveDateTime']}
/>`}</code>
                </div>
              </div>

              {/* Component 2: PilloReminderWidget */}
              <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono text-sky-400 font-bold">&lt;PilloBuddyWidget /&gt;</span>
                  <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded font-bold">
                    Pillo.care Tech
                  </span>
                </div>
                <p className="text-xs text-slate-400 mb-4">
                  Interactive virtual buddy avatar with emotional escalation (Calm $\rightarrow$ Furious $+10$m).
                </p>
                <div className="bg-slate-900 rounded-xl p-3 font-mono text-xs text-slate-300 border border-slate-800">
                  <code>{`import { PilloAvatar } from '@/components/PilloAvatar';

<PilloAvatar
  mood="furious"
  size={120}
  showFireAura={true}
/>`}</code>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 5: SMART ON FHIR & ACCESS POLICIES ================= */}
        {activeTab === 'auth' && (
          <div className="space-y-6">
            <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <span>SMART on FHIR OAuth2 & Role-Based Access Policies</span>
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                Configure patient authorization scopes, clinician access boundaries, and client application credentials.
              </p>

              <div className="space-y-4">
                <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">Client ID: client_sehat_mobile_prod</p>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      Scopes: launch/patient, patient/*.read, patient/Observation.write
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                    ACTIVE OAUTH2
                  </span>
                </div>

                <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">Client ID: client_doctor_portal_prod</p>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      Scopes: user/*.read, user/*.write, system/RiskAssessment.*
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs font-bold">
                    ACTIVE OAUTH2
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

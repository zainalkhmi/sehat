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
  AlertCircle
} from 'lucide-react';

export default function PatientDashboard() {
  const [activeTab, setActiveTab] = useState<'overview' | 'vitals' | 'surveys' | 'devices' | 'consents'>('overview');

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-slate-500 hover:text-slate-700 flex items-center text-sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back</span>
            </Link>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center text-white font-bold text-sm">
                PT
              </div>
              <div>
                <span className="font-bold text-slate-900 text-sm">Patient Portal</span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">MRN: FH-88231</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <SupabaseBadge />
            <Link
              href="/dashboard/patient/observations"
              className="text-xs bg-sky-600 hover:bg-sky-500 text-white font-medium px-3 py-1.5 rounded-lg shadow-xs transition"
            >
              📊 Vital Observations
            </Link>
            <Link
              href="/dashboard/patient/profile"
              className="text-xs bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 font-medium px-3 py-1.5 rounded-lg transition"
            >
              👤 Profile
            </Link>
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-slate-900">Ahmad Kusuma</div>
              <div className="text-xs text-slate-500">ahmad.kusuma@example.com</div>
            </div>
            <div className="w-9 h-9 rounded-full bg-slate-200 border border-slate-300 flex items-center justify-center text-slate-600">
              <User className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex space-x-8 overflow-x-auto">
          {[
            { id: 'overview', label: 'Health Overview', icon: Activity },
            { id: 'vitals', label: 'Vitals & Measurements', icon: Heart },
            { id: 'surveys', label: 'Questionnaires', icon: FileText },
            { id: 'devices', label: 'Connected Devices', icon: Smartphone },
            { id: 'consents', label: 'Consents & Privacy', icon: Shield },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-3 flex items-center space-x-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  isActive
                    ? 'border-sky-600 text-sky-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Health Protocol Banner */}
            <div className="bg-gradient-to-r from-sky-600 to-sky-700 rounded-2xl p-6 text-white shadow-md">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs uppercase tracking-wider font-semibold bg-white/20 px-2.5 py-1 rounded-full">
                    Daily Protocol
                  </span>
                  <h2 className="text-2xl font-bold mt-2">Good afternoon, Ahmad</h2>
                  <p className="text-sky-100 text-sm mt-1">
                    You have 2 pending health tasks scheduled for today.
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('surveys')}
                  className="px-4 py-2 bg-white text-sky-700 font-semibold text-sm rounded-lg hover:bg-sky-50 transition-colors shadow"
                >
                  Complete Surveys
                </button>
              </div>
            </div>

            {/* Vital Signs Grid */}
            <div>
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center space-x-2">
                <Heart className="w-5 h-5 text-rose-500" />
                <span>Recent Physiological Vitals</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Heart Rate</div>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-slate-900">72</span>
                    <span className="text-sm font-medium text-slate-500">bpm</span>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    <span>Normal resting range</span>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Blood Pressure</div>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-slate-900">118/76</span>
                    <span className="text-sm font-medium text-slate-500">mmHg</span>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    <span>Optimal (LOINC 85354-9)</span>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Oxygen Saturation (SpO2)</div>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-slate-900">98%</span>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    <span>HealthKit Pulse Oximeter</span>
                  </div>
                </div>

                <div className="p-5 bg-white rounded-xl border border-slate-200 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Blood Glucose</div>
                  <div className="mt-2 flex items-baseline space-x-2">
                    <span className="text-3xl font-bold text-slate-900">95</span>
                    <span className="text-sm font-medium text-slate-500">mg/dL</span>
                  </div>
                  <div className="mt-2 flex items-center text-xs text-emerald-600 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    <span>Fasting (Within normal limits)</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Protocol Tasks & Appointments */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Daily Tasks */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center justify-between">
                  <span>Spezi Protocol Tasks</span>
                  <span className="text-xs bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-medium">2 Remaining</span>
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">PHQ-9 Depression Screening</div>
                        <div className="text-xs text-slate-500">Weekly clinical survey • 5 min</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('surveys')}
                      className="px-3 py-1.5 bg-sky-600 hover:bg-sky-700 text-white rounded text-xs font-semibold"
                    >
                      Start
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Heart className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Morning Blood Pressure Check</div>
                        <div className="text-xs text-slate-500">Record 2 seated readings • 2 min</div>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('vitals')}
                      className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded text-xs font-semibold"
                    >
                      Record
                    </button>
                  </div>
                </div>
              </div>

              {/* Assigned Clinicians & Care Team */}
              <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 mb-4">Assigned Care Team</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3.5 rounded-lg border border-slate-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold text-xs">
                        DR
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-900">Dr. Sarah Wijaya, Sp.JP</div>
                        <div className="text-xs text-slate-500">Cardiology Specialist • RS Jantung Harapan</div>
                      </div>
                    </div>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-medium">Active Consent</span>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs text-slate-600">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-sky-600" />
                      <span>Next Telehealth Consultation: <strong>Thursday, Nov 12 • 10:00 WIB</strong></span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'vitals' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">Vitals & Physiological Telemetry</h3>
            <p className="text-sm text-slate-600 mb-6">
              Synced continuously via Apple HealthKit, Android Health Connect, and BLE medical devices. Standardized using LOINC and UCUM units.
            </p>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Observation</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">LOINC Code</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Value</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Source</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Timestamp</th>
                    <th className="px-4 py-3 text-left font-semibold text-slate-700">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-900">Resting Heart Rate</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">8867-4</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">72 bpm</td>
                    <td className="px-4 py-3 text-slate-600">Apple HealthKit</td>
                    <td className="px-4 py-3 text-slate-500">Today, 08:30 WIB</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-semibold">Normal</span></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-900">Blood Pressure (Systolic/Diastolic)</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">85354-9</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">118/76 mmHg</td>
                    <td className="px-4 py-3 text-slate-600">Omron BLE Monitor</td>
                    <td className="px-4 py-3 text-slate-500">Today, 07:15 WIB</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-semibold">Optimal</span></td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-medium text-slate-900">Oxygen Saturation (SpO2)</td>
                    <td className="px-4 py-3 text-slate-500 font-mono text-xs">59408-5</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">98 %</td>
                    <td className="px-4 py-3 text-slate-600">Apple HealthKit</td>
                    <td className="px-4 py-3 text-slate-500">Yesterday, 22:45 WIB</td>
                    <td className="px-4 py-3"><span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-xs font-semibold">Normal</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'surveys' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-4">FHIR R4 Questionnaires</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-5 rounded-xl border border-slate-200 hover:border-sky-500 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold">PHQ-9</span>
                  <span className="text-xs text-slate-500">Due Today</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-2">Patient Health Questionnaire - 9</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Validated screening instrument for depressive symptoms over the past 2 weeks (LOINC 44249-1).
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">9 questions • ~4 mins</span>
                  <button className="px-3 py-1.5 bg-sky-600 text-white rounded text-xs font-semibold hover:bg-sky-700">
                    Take Questionnaire
                  </button>
                </div>
              </div>

              <div className="p-5 rounded-xl border border-slate-200 hover:border-sky-500 transition-colors">
                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">Completed</span>
                  <span className="text-xs text-slate-500">Completed 3 days ago</span>
                </div>
                <h4 className="text-base font-bold text-slate-900 mt-2">GAD-7 Anxiety Screening</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Generalized Anxiety Disorder assessment scale (LOINC 70274-6). Score: 3/21 (Minimal).
                </p>
                <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-500">Score: 3/21 (Minimal)</span>
                  <button className="px-3 py-1.5 bg-slate-100 text-slate-700 rounded text-xs font-semibold hover:bg-slate-200">
                    View Responses
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'devices' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Connected Devices & Wearable Sensors</h3>
                <p className="text-xs text-slate-500">
                  Data disinkronkan otomatis dari Stanford Spezi Mobile App melalui Apple HealthKit, Android Health Connect, dan BLE.
                </p>
              </div>
              <span className="px-3 py-1 bg-sky-50 border border-sky-200 text-sky-800 rounded-full text-xs font-semibold">
                FHIR R4 Telemetry Gateway
              </span>
            </div>

            {/* Architecture Explainer Card */}
            <div className="p-4 bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 rounded-xl mb-6 text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900 font-semibold block mb-1">
                Alur Integrasi Mobile App & Wearable ke Web Portal:
              </strong>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
                <div className="p-3 bg-white rounded-lg border border-sky-100 shadow-xs">
                  <div className="font-bold text-sky-700 mb-1">1. Wearable Sensors</div>
                  <div>Apple Watch, Galaxy Watch, & Tensimeter BLE membaca denyut nadi, SpO2, dan tekanan darah.</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-sky-100 shadow-xs">
                  <div className="font-bold text-indigo-700 mb-1">2. Spezi Mobile App</div>
                  <div>Aplikasi ponsel menstandarkan data ke kode LOINC & UCUM, lalu menyimpannya di Supabase.</div>
                </div>
                <div className="p-3 bg-white rounded-lg border border-sky-100 shadow-xs">
                  <div className="font-bold text-emerald-700 mb-1">3. Web Portal (Realtime)</div>
                  <div>Dokter dan Pasien dapat melihat grafik tren vital dan Clinical Decision Support secara langsung.</div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Apple HealthKit (iOS & Apple Watch)</div>
                    <div className="text-xs text-slate-500">Continuous telemetry: Heart Rate (LOINC 8867-4), SpO2 (59408-5), Steps</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">Connected</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-emerald-700">
                    <Activity className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Android Health Connect (WearOS / Galaxy Watch)</div>
                    <div className="text-xs text-slate-500">Google Health Connect API: Resting HR, Sleep Architecture, Blood Glucose</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">Active Sync</span>
              </div>

              <div className="flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-rose-500">
                    <Heart className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900">Omron Bluetooth Blood Pressure Monitor</div>
                    <div className="text-xs text-slate-500">Direct BLE GATT Profile: Systolic & Diastolic BP (LOINC 85354-9)</div>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-semibold">Paired</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'consents' && (
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-lg font-bold text-slate-900 mb-2">Patient Consent Management (UU PDP No. 27/2022)</h3>
            <p className="text-xs text-slate-500 mb-6">
              You maintain full sovereignty over your health data. You can grant or revoke data sharing permissions at any time.
            </p>
            <div className="space-y-4">
              <div className="p-4 rounded-xl border border-slate-200 flex items-start justify-between">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Clinical Care Consent: Dr. Sarah Wijaya (Cardiology)</div>
                  <div className="text-xs text-slate-500 mt-1">
                    Grants access to vitals, medical history, and questionnaire answers for direct clinical care.
                  </div>
                  <div className="text-xs text-emerald-600 font-medium mt-2 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    <span>Active • Consented on Oct 14, 2026</span>
                  </div>
                </div>
                <button className="px-3 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-xs font-semibold">
                  Revoke
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 flex items-start justify-between">
                <div>
                  <div className="font-semibold text-slate-900 text-sm">Research Study: Longitudinal Cardiovascular Health Study (FH-IRB-2026-08)</div>
                  <div className="text-xs text-slate-500 mt-1">
                    De-identified physiological vitals shared with research cohort under HIPAA Safe Harbor and UU PDP privacy rules.
                  </div>
                  <div className="text-xs text-emerald-600 font-medium mt-2 flex items-center">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    <span>Active • Consented on Oct 20, 2026</span>
                  </div>
                </div>
                <button className="px-3 py-1 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded text-xs font-semibold">
                  Revoke
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}


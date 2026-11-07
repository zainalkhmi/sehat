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
  Calendar
} from 'lucide-react';

export default function DoctorDashboard() {
  const [selectedPatient, setSelectedPatient] = useState<string>('FH-PT-1002');
  const [reviewStatus, setReviewStatus] = useState<'pending' | 'approved' | 'rejected'>('pending');
  const [patients, setPatients] = useState<any[]>(DEFAULT_PATIENTS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchLivePatients().then((data) => {
      if (isMounted) {
        setPatients(data);
        if (data.length > 0 && !data.some(p => p.id === selectedPatient)) {
          setSelectedPatient(data[0].id);
        }
        setIsLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/" className="text-slate-400 hover:text-white flex items-center text-sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Portal Home</span>
            </Link>
            <div className="h-5 w-px bg-slate-800" />
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-sky-500 flex items-center justify-center text-slate-900 font-bold text-sm">
                DR
              </div>
              <div>
                <span className="font-bold text-white text-sm">Clinician Workspace</span>
                <span className="ml-2 text-xs px-2 py-0.5 rounded bg-sky-950 text-sky-400 border border-sky-800 font-medium">Cardiology</span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <SupabaseBadge />
            <Link
              href="/dashboard/doctor/risk-assessments"
              className="text-xs bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-3 py-1.5 rounded-lg shadow-sm transition flex items-center"
            >
              <Brain className="w-3.5 h-3.5 mr-1" />
              <span>AI Risk Queue</span>
            </Link>
            <Link
              href="/dashboard/doctor/questionnaires"
              className="text-xs bg-sky-600 hover:bg-sky-500 text-white font-medium px-3 py-1.5 rounded-lg shadow-sm transition"
            >
              📋 Review Questionnaires
            </Link>
            <Link
              href="/dashboard/doctor/patients"
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium px-3 py-1.5 rounded-lg transition"
            >
              👥 Patient Directory
            </Link>
            <div className="text-right hidden sm:block">
              <div className="text-sm font-semibold text-white">Dr. Sarah Wijaya, Sp.JP</div>
              <div className="text-xs text-slate-400">SIP: 446/SIP.D/2024/0912</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Clinician Interface */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Assigned Patient List */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center">
                  <Users className="w-4 h-4 mr-1.5 text-sky-600" />
                  <span>Assigned Patients</span>
                </h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  {patients.length} Active
                </span>
              </div>

              {/* Search Bar */}
              <div className="relative mb-3">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search patient or MRN..."
                  className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
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
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        isSelected
                          ? 'border-sky-600 bg-sky-50/50 shadow-sm'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-slate-900 text-sm">{pt.name}</div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded font-semibold ${
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
                        {pt.age}y • {pt.gender} • MRN: {pt.id}
                      </div>
                      <div className="text-xs font-mono text-slate-600 mt-1.5 truncate">
                        {pt.lastVitals}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Selected Patient Clinical Detail & AI Review */}
          <div className="lg:col-span-8 space-y-6">
            {/* Patient Header Card */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center space-x-3">
                    <h2 className="text-xl font-bold text-slate-900">Ahmad Kusuma</h2>
                    <span className="text-xs px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold">
                      Consent Verified
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    MRN: <strong>FH-PT-1002</strong> • DOB: 12 Apr 1988 (38y) • Gender: Male • Phone: +62 812-3456-7890
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5 mr-1" />
                    <span>Schedule Visit</span>
                  </button>
                </div>
              </div>

              {/* AI Clinical Decision Support Banner */}
              <div className="mt-6 p-4 rounded-xl border border-amber-200 bg-amber-50/60">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Brain className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-amber-950 text-sm">
                        AI Risk Screening: Cardiovascular Trend Anomaly
                      </div>
                      <span className="text-xs font-mono bg-amber-200/70 text-amber-900 px-2 py-0.5 rounded">
                        Model: cardio-screening-v1.4
                      </span>
                    </div>
                    <p className="text-xs text-amber-900 mt-1.5 leading-relaxed">
                      Telemetry analysis shows a 12% rise in systolic blood pressure over the past 14 days correlating with increased resting heart rate spikes during late evening hours. PHQ-9 questionnaire score increased from 4 to 8.
                    </p>

                    <div className="mt-3 p-2.5 rounded-lg bg-white/80 border border-amber-200 text-xs text-slate-600 flex items-center">
                      <ShieldAlert className="w-4 h-4 text-amber-600 mr-2 shrink-0" />
                      <span>
                        <strong>Clinical Disclaimer:</strong> CDS output only. Human clinician validation required prior to any clinical diagnosis or intervention.
                      </span>
                    </div>

                    {/* Review Actions */}
                    <div className="mt-4 flex items-center space-x-3">
                      {reviewStatus === 'pending' ? (
                        <>
                          <button
                            onClick={() => setReviewStatus('approved')}
                            className="px-3.5 py-1.5 bg-emerald-700 text-white hover:bg-emerald-800 rounded-lg text-xs font-semibold flex items-center"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            <span>Validate & Accept Assessment</span>
                          </button>
                          <button
                            onClick={() => setReviewStatus('rejected')}
                            className="px-3.5 py-1.5 bg-slate-200 text-slate-700 hover:bg-slate-300 rounded-lg text-xs font-semibold"
                          >
                            Dismiss as False Positive
                          </button>
                        </>
                      ) : (
                        <div className="text-xs font-semibold text-emerald-800 bg-emerald-100 px-3 py-1.5 rounded-lg flex items-center">
                          <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600" />
                          <span>Clinician Review Recorded ({reviewStatus.toUpperCase()}) • Saved to FHIR RiskAssessment</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Clinical Timeline & Observations */}
              <div className="mt-6">
                <h4 className="font-bold text-slate-900 text-sm mb-3">Observation Timeline (LOINC Standardized)</h4>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-900">Blood Pressure (LOINC 85354-9)</span>
                      <div className="text-slate-500 font-mono mt-0.5">Systolic: 118 mmHg • Diastolic: 76 mmHg</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-emerald-700">Normal</div>
                      <div className="text-slate-400">Today, 07:15 WIB</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-900">Resting Heart Rate (LOINC 8867-4)</span>
                      <div className="text-slate-500 font-mono mt-0.5">72 beats/minute (UCUM /min)</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-emerald-700">Normal</div>
                      <div className="text-slate-400">Today, 08:30 WIB</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-lg border border-slate-200 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-semibold text-slate-900">PHQ-9 Survey Score (LOINC 44249-1)</span>
                      <div className="text-slate-500 mt-0.5">Score: 8/27 (Mild depressive symptomology)</div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold text-amber-700">Mild Risk</div>
                      <div className="text-slate-400">Yesterday, 19:20 WIB</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


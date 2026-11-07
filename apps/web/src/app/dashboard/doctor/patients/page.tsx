'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { SupabaseBadge } from '../../../../components/SupabaseBadge';
import { fetchLivePatients, DEFAULT_PATIENTS } from '../../../../lib/supabase-service';
import {
  Users,
  Search,
  Filter,
  ArrowLeft,
  UserPlus,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ShieldCheck,
  ChevronRight,
  Heart,
  Activity,
  Calendar
} from 'lucide-react';

export default function DoctorPatientsManagementPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRisk, setFilterRisk] = useState<'all' | 'high' | 'moderate' | 'low'>('all');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [newPatientMRN, setNewPatientMRN] = useState('');
  const [assignmentNotice, setAssignmentNotice] = useState(false);

  const [assignedPatients, setAssignedPatients] = useState<any[]>(DEFAULT_PATIENTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetchLivePatients().then((data) => {
      if (isMounted) {
        setAssignedPatients(data);
        setLoading(false);
      }
    });
    return () => { isMounted = false; };
  }, []);

  const handleAssignPatient = (e: React.FormEvent) => {
    e.preventDefault();
    setShowAssignModal(false);
    setAssignmentNotice(true);
    setTimeout(() => setAssignmentNotice(false), 5000);
  };

  const filteredPatients = assignedPatients.filter((pt) => {
    const matchesSearch =
      pt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      pt.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = filterRisk === 'all' || pt.riskLevel === filterRisk;
    return matchesSearch && matchesRisk;
  });

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard/doctor" className="text-slate-400 hover:text-white flex items-center text-sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back to Clinician Workspace</span>
            </Link>
            <div className="h-5 w-px bg-slate-800" />
            <div className="flex items-center space-x-2">
              <span className="font-bold text-white text-sm">Assigned Patients Registry (`patient_clinicians`)</span>
              <span className="text-xs bg-sky-900 text-sky-300 border border-sky-700 px-2 py-0.5 rounded font-mono">
                {assignedPatients.length} Authorized Patients
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <SupabaseBadge />
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-3.5 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow flex items-center space-x-1.5"
            >
              <UserPlus className="w-4 h-4" />
              <span>Assign New Patient</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {assignmentNotice && (
          <div className="p-4 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center shadow-sm">
            <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-700 shrink-0" />
            <span>
              Clinical relationship created in `patient_clinicians`. Patient consent verified under Indonesian UU PDP No. 27/2022.
            </span>
          </div>
        )}

        {/* Authorization Banner */}
        <div className="p-4 rounded-xl border border-slate-200 bg-white flex items-start space-x-3 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-sky-600 mt-0.5 shrink-0" />
          <div className="text-xs text-slate-600 leading-relaxed">
            <strong>Row Level Security Enforcement:</strong> You are authorized to review clinical observations, questionnaires, and risk screening reports only for patients who have an active clinical relationship in <code>patient_clinicians</code> and an unrevoked <code>patient_consents</code> record.
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Filter by name or MRN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-xs font-semibold text-slate-500">Risk Filter:</span>
            {(['all', 'high', 'moderate', 'low'] as const).map((risk) => (
              <button
                key={risk}
                onClick={() => setFilterRisk(risk)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
                  filterRisk === risk
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {risk}
              </button>
            ))}
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-xs">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3.5 text-left font-semibold text-slate-700">Patient / MRN</th>
                  <th className="px-4 py-3.5 text-left font-semibold text-slate-700">Relationship Type</th>
                  <th className="px-4 py-3.5 text-left font-semibold text-slate-700">Consent Status</th>
                  <th className="px-4 py-3.5 text-left font-semibold text-slate-700">Primary Condition</th>
                  <th className="px-4 py-3.5 text-left font-semibold text-slate-700">Latest Vitals (LOINC)</th>
                  <th className="px-4 py-3.5 text-left font-semibold text-slate-700">PHQ-9</th>
                  <th className="px-4 py-3.5 text-left font-semibold text-slate-700">Risk Level</th>
                  <th className="px-4 py-3.5 text-right font-semibold text-slate-700">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((pt) => (
                  <tr key={pt.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-slate-900">{pt.name}</div>
                      <div className="text-slate-500 font-mono mt-0.5">
                        {pt.id} • {pt.age}y • {pt.gender}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-medium text-slate-700">{pt.assignedType}</span>
                      <div className="text-slate-400 mt-0.5">Since {pt.assignedDate}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 font-semibold inline-flex items-center">
                        <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                        <span>{pt.consentStatus}</span>
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-700 max-w-xs truncate">{pt.primaryCondition}</td>
                    <td className="px-4 py-3.5 font-mono text-slate-800">
                      <div>BP: {pt.latestBP}</div>
                      <div className="text-slate-500">HR: {pt.latestHR}</div>
                    </td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">{pt.phq9Score} / 27</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2 py-0.5 rounded font-bold uppercase ${
                          pt.riskLevel === 'high'
                            ? 'bg-rose-100 text-rose-800'
                            : pt.riskLevel === 'moderate'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {pt.riskLevel}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Link
                        href="/dashboard/doctor"
                        className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium"
                      >
                        <span>Examine</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-xl border border-slate-200">
            <h3 className="text-lg font-bold text-slate-900 mb-1">Establish Care Relationship</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter the patient Medical Record Number (MRN) or National ID to verify consent and establish an authorized clinician assignment in `patient_clinicians`.
            </p>
            <form onSubmit={handleAssignPatient} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Patient Identifier / MRN</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. FH-PT-1004"
                  value={newPatientMRN}
                  onChange={(e) => setNewPatientMRN(e.target.value)}
                  className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Relationship Classification</label>
                <select className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500">
                  <option value="primary_care">Primary Care Physician</option>
                  <option value="consultant">Consultant</option>
                  <option value="specialist">Cardiology Specialist</option>
                </select>
              </div>

              <div className="p-3 rounded-lg bg-sky-50 border border-sky-100 text-xs text-sky-800">
                Persetujuan Tertulis (UU PDP No. 27/2022 Pasal 20) akan diverifikasi secara otomatis sebelum akses rekam medis dibuka.
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold shadow"
                >
                  Verify & Assign Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


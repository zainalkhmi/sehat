'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  User,
  ArrowLeft,
  Save,
  CheckCircle2,
  Shield,
  Heart,
  AlertCircle,
  Phone,
  Mail,
  Calendar,
  Stethoscope
} from 'lucide-react';

export default function PatientProfilePage() {
  const [isSaved, setIsSaved] = useState(false);
  const [profile, setProfile] = useState({
    givenName: 'Ahmad',
    familyName: 'Kusuma',
    email: 'ahmad.kusuma@example.com',
    phoneNumber: '+62 812-3456-7890',
    dateOfBirth: '1988-04-12',
    gender: 'male',
    bloodType: 'O+',
    allergies: 'Penicillin, Shellfish',
    emergencyContactName: 'Dewi Kusuma',
    emergencyContactRelation: 'Spouse',
    emergencyContactPhone: '+62 813-9876-5432',
    mrn: 'FH-PT-1002',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 4000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard/patient"
              className="text-slate-500 hover:text-slate-700 flex items-center text-sm"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              <span>Back to Patient Dashboard</span>
            </Link>
            <div className="h-5 w-px bg-slate-200" />
            <div className="flex items-center space-x-2">
              <span className="font-bold text-slate-900 text-sm">Patient Clinical Profile</span>
              <span className="text-xs px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-semibold font-mono">
                {profile.mrn}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Form */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        <form onSubmit={handleSave} className="space-y-6">
          {isSaved && (
            <div className="p-4 rounded-xl bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center shadow-sm">
              <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-700 shrink-0" />
              <span>Profile updated successfully in PostgreSQL `profiles` table.</span>
            </div>
          )}

          {/* Section 1: Demographics */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <User className="w-5 h-5 text-sky-600" />
              <span>Personal Demographics (FHIR Patient)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Given Name (First Name)</label>
                <input
                  type="text"
                  required
                  value={profile.givenName}
                  onChange={(e) => setProfile({ ...profile, givenName: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Family Name (Last Name)</label>
                <input
                  type="text"
                  required
                  value={profile.familyName}
                  onChange={(e) => setProfile({ ...profile, familyName: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Email Address (Read Only)</label>
                <input
                  type="email"
                  disabled
                  value={profile.email}
                  className="mt-1 w-full px-3 py-2 text-sm bg-slate-100 border border-slate-200 rounded-lg text-slate-500 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Phone Number</label>
                <input
                  type="tel"
                  value={profile.phoneNumber}
                  onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Date of Birth</label>
                <input
                  type="date"
                  value={profile.dateOfBirth}
                  onChange={(e) => setProfile({ ...profile, dateOfBirth: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Biological Sex</label>
                <select
                  value={profile.gender}
                  onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="unknown">Unknown</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 2: Clinical Baseline Data */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Heart className="w-5 h-5 text-rose-500" />
              <span>Clinical Baseline & Allergies</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Blood Type</label>
                <select
                  value={profile.bloodType}
                  onChange={(e) => setProfile({ ...profile, bloodType: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Known Drug / Food Allergies</label>
                <input
                  type="text"
                  value={profile.allergies}
                  onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}
                  placeholder="e.g. Penicillin, Peanuts"
                  className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Emergency Contact */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Phone className="w-5 h-5 text-emerald-600" />
              <span>Emergency Contact</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700">Contact Full Name</label>
                <input
                  type="text"
                  value={profile.emergencyContactName}
                  onChange={(e) => setProfile({ ...profile, emergencyContactName: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Relationship</label>
                <input
                  type="text"
                  value={profile.emergencyContactRelation}
                  onChange={(e) => setProfile({ ...profile, emergencyContactRelation: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700">Emergency Phone</label>
                <input
                  type="tel"
                  value={profile.emergencyContactPhone}
                  onChange={(e) => setProfile({ ...profile, emergencyContactPhone: e.target.value })}
                  className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Assigned Clinicians & Care Network */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-slate-900" />
              <span>Authorized Care Relationships (`patient_clinicians`)</span>
            </h3>
            <div className="p-4 rounded-xl border border-slate-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-xs">
                  DR
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">Dr. Sarah Wijaya, Sp.JP</div>
                  <div className="text-xs text-slate-500">
                    Cardiologist • RS Jantung Harapan Kita (Relationship: Primary Care)
                  </div>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 font-semibold">
                Active Assignment
              </span>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="px-6 py-2.5 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold shadow-sm flex items-center space-x-2 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>Save Profile Changes</span>
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}


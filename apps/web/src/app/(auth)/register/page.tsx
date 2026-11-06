'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeartPulse, Lock, Mail, User, Shield, ArrowRight } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<'patient' | 'doctor' | 'researcher'>('patient');
  const [formData, setFormData] = useState({
    givenName: '',
    familyName: '',
    email: '',
    password: '',
    dateOfBirth: '',
    gender: 'male',
    licenseNumber: '',
    specialty: '',
    institution: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (role === 'patient') router.push('/dashboard/patient');
    else if (role === 'doctor') router.push('/dashboard/doctor');
    else router.push('/dashboard/researcher');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-flex items-center space-x-2">
          <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
            <HeartPulse className="w-6 h-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">FUTURE HEALTH</span>
        </Link>
        <h2 className="mt-6 text-2xl font-extrabold text-slate-900">Create your health account</h2>
        <p className="mt-2 text-xs text-slate-500">
          Compliant with HL7 FHIR R4 & Indonesian UU PDP No. 27/2022
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200 rounded-2xl sm:px-10">
          {/* Role Selector Tabs */}
          <div className="grid grid-cols-3 gap-2 mb-6 p-1 bg-slate-100 rounded-lg">
            {(['patient', 'doctor', 'researcher'] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r)}
                className={`py-1.5 text-xs font-semibold rounded-md capitalize transition-all ${
                  role === r
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                {r}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700">First Name</label>
                <input
                  type="text"
                  required
                  value={formData.givenName}
                  onChange={(e) => setFormData({ ...formData, givenName: e.target.value })}
                  placeholder="Ahmad"
                  className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700">Last Name</label>
                <input
                  type="text"
                  required
                  value={formData.familyName}
                  onChange={(e) => setFormData({ ...formData, familyName: e.target.value })}
                  placeholder="Kusuma"
                  className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Email Address</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@example.com"
                className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Minimum 8 characters"
                className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            {role === 'doctor' && (
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Medical License Number (SIP)</label>
                  <input
                    type="text"
                    required
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                    placeholder="446/SIP.D/2024/..."
                    className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700">Medical Specialty</label>
                  <input
                    type="text"
                    required
                    value={formData.specialty}
                    onChange={(e) => setFormData({ ...formData, specialty: e.target.value })}
                    placeholder="Cardiology / Internal Medicine"
                    className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                  />
                </div>
              </div>
            )}

            {role === 'researcher' && (
              <div className="pt-2 border-t border-slate-100">
                <label className="block text-xs font-semibold text-slate-700">Research Institution / University</label>
                <input
                  type="text"
                  required
                  value={formData.institution}
                  onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                  placeholder="Universitas Indonesia / RSCM"
                  className="mt-1 w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            )}

            <button
              type="submit"
              className="w-full mt-2 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center justify-center space-x-2"
            >
              <span>Create {role.charAt(0).toUpperCase() + role.slice(1)} Account</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Already have an account?{' '}
              <Link href="/login" className="font-semibold text-sky-600 hover:text-sky-700">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


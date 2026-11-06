'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { HeartPulse, Lock, Mail, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'patient' | 'doctor' | 'researcher'>('patient');

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
        <h2 className="mt-6 text-2xl font-extrabold text-slate-900">Sign in to your clinical account</h2>
        <p className="mt-2 text-xs text-slate-500">
          Select your verified healthcare role to proceed
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
            <div>
              <label className="block text-xs font-semibold text-slate-700">Email Address</label>
              <div className="mt-1 relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === 'doctor' ? 'doctor@hospital.id' : `${role}@example.com`}
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700">Password</label>
              <div className="mt-1 relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors flex items-center justify-center space-x-2"
            >
              <span>Sign In as {role.charAt(0).toUpperCase() + role.slice(1)}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-500">
              Don&apos;t have an account?{' '}
              <Link href="/register" className="font-semibold text-sky-600 hover:text-sky-700">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}


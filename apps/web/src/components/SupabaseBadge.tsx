'use client';

import React, { useState, useEffect } from 'react';
import { Database, CheckCircle2, AlertCircle, ExternalLink, X, Key, Server } from 'lucide-react';
import { getSupabaseDetails } from '../lib/supabase-service';

export function SupabaseBadge() {
  const [details, setDetails] = useState<{ isConnected: boolean; url: string | null; hasAnonKey: boolean }>({
    isConnected: false,
    url: null,
    hasAnonKey: false,
  });
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    setDetails(getSupabaseDetails());
  }, []);

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        type="button"
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all shadow-sm ${
          details.isConnected
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
        }`}
        title="Klik untuk melihat status koneksi Supabase"
      >
        <span
          className={`w-2 h-2 rounded-full ${
            details.isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
          }`}
        />
        <Database className="w-3.5 h-3.5" />
        <span>
          {details.isConnected ? 'Supabase: Live Cloud DB' : 'Database: Demo Mock'}
        </span>
      </button>

      {/* Connection Info Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  details.isConnected
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Status Integrasi Supabase PostgreSQL
                </h3>
                <p className="text-xs text-slate-500">
                  HL7 FHIR R4 & UU PDP No. 27/2022 Clinical Database
                </p>
              </div>
            </div>

            <div className="space-y-3 mb-5">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100 flex items-start gap-3">
                {details.isConnected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                )}
                <div className="text-xs text-slate-700">
                  <div className="font-semibold text-slate-900 mb-0.5">
                    {details.isConnected
                      ? 'Terhubung ke Database Cloud Supabase'
                      : 'Sedang Berjalan dalam Mode Demo (Interactive Mock)'}
                  </div>
                  <div>
                    {details.isConnected
                      ? `Semua data observasi vital, respons kuesioner, dan catatan klinis terhubung secara live ke instance Supabase Anda.`
                      : `Aplikasi saat ini menggunakan dataset klinis interaktif bawaan. Data dapat dilihat dan diuji tanpa memerlukan setup database.`}
                  </div>
                </div>
              </div>

              {details.isConnected && details.url && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-600 flex items-center justify-between">
                  <span className="font-mono text-slate-500 truncate">{details.url}</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active
                  </span>
                </div>
              )}

              {!details.isConnected && (
                <div className="p-4 bg-sky-50/60 rounded-xl border border-sky-100 text-xs text-slate-700 space-y-2">
                  <div className="font-semibold text-sky-950 flex items-center gap-1.5">
                    <Server className="w-4 h-4 text-sky-600" />
                    Cara Menghubungkan ke Supabase Milik Anda:
                  </div>
                  <ol className="list-decimal list-inside space-y-1.5 text-slate-600 pl-1">
                    <li>
                      Buka dashboard project di <strong>supabase.com</strong>.
                    </li>
                    <li>
                      Di menu <strong>SQL Editor</strong>, jalankan script schema:{' '}
                      <code className="text-sky-700 bg-white px-1.5 py-0.5 rounded border border-sky-200">
                        supabase/migrations/00001_initial_schema.sql
                      </code>
                    </li>
                    <li>
                      Di <strong>Project Settings → API</strong>, salin Project URL & anon key.
                    </li>
                    <li>
                      Masukkan ke Vercel (atau <code>.env.local</code>):
                      <div className="mt-1 font-mono text-[11px] bg-slate-900 text-slate-100 p-2 rounded-lg space-y-0.5">
                        <div>NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co</div>
                        <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...</div>
                      </div>
                    </li>
                  </ol>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl transition-all"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}


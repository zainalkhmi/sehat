import Link from 'next/link';
import { Activity, ShieldCheck, HeartPulse, Stethoscope, Microscope, ArrowRight, Smartphone, Database, Brain, Code2 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-sky-600 flex items-center justify-center text-white shadow-md shadow-sky-600/20">
              <HeartPulse className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900">FUTURE HEALTH</span>
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">FHIR R4</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/sdk"
              className="text-sm font-semibold px-3 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 hover:bg-indigo-100 transition-colors flex items-center gap-1.5"
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Medplum SDK</span>
            </Link>
            <Link
              href="/login"
              className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-sm font-medium px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-700 text-white shadow-sm transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1">
        <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-sky-50 border border-sky-200 text-sky-700 text-xs font-semibold uppercase tracking-wider mb-6">
            <Activity className="w-3.5 h-3.5" />
            <span>Stanford Spezi + React Native + Next.js + Supabase + FHIR R4</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight">
            Next-Generation <span className="text-sky-600">Cross-Platform</span> Digital Health Platform
          </h1>
          <p className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Unifying Patient mobile telemetry, Clinician decision support, and ethical Researcher analytics under strict HL7 FHIR R4 interoperability and AI safety standards.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/dashboard/patient"
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-medium shadow-md shadow-sky-600/20 transition-all hover:-translate-y-0.5"
            >
              <span>Patient Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/doctor"
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-md transition-all hover:-translate-y-0.5"
            >
              <span>Doctor Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/researcher"
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-medium shadow-md transition-all hover:-translate-y-0.5"
            >
              <span>Researcher Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/dashboard/mens-health"
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-teal-700 hover:bg-teal-800 text-white font-medium shadow-md shadow-teal-700/20 transition-all hover:-translate-y-0.5"
            >
              <span>Men's Health (صحة الرجل)</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/sdk"
              className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium shadow-md shadow-indigo-600/20 transition-all hover:-translate-y-0.5"
            >
              <Code2 className="w-4 h-4" />
              <span>Medplum SDK Console</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>

        {/* Roles Feature Matrix */}
        <section className="py-16 bg-white border-y border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Tailored Workspaces for Every Role</h2>
              <p className="mt-2 text-slate-600">Strictly isolated privilege boundaries and role-based access control</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Patient */}
              <div className="rounded-2xl border border-slate-200 p-8 hover:border-sky-500/50 hover:shadow-lg transition-all bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-6">
                    <Smartphone className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Patient Portal & Mobile App</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Self-directed health tracking powered by Stanford Spezi.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                      <span>Apple HealthKit & Health Connect continuous sync</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                      <span>FHIR Questionnaires (PHQ-9, GAD-7)</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-sky-600" />
                      <span>Granular consent control & sharing</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/dashboard/patient"
                  className="mt-6 text-sm font-semibold text-sky-600 hover:text-sky-700 flex items-center space-x-1"
                >
                  <span>Open Patient Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Doctor */}
              <div className="rounded-2xl border border-slate-200 p-8 hover:border-slate-800/50 hover:shadow-lg transition-all bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-slate-200 text-slate-900 flex items-center justify-center mb-6">
                    <Stethoscope className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Clinician Workspace</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Clinical dashboard for assigned patients and decision support.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                      <span>Assigned patient registry with active authorization</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                      <span>AI-assisted risk review & approval workflow</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-900" />
                      <span>Observation timeline & telehealth management</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/dashboard/doctor"
                  className="mt-6 text-sm font-semibold text-slate-900 hover:text-slate-700 flex items-center space-x-1"
                >
                  <span>Open Doctor Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Researcher */}
              <div className="rounded-2xl border border-slate-200 p-8 hover:border-emerald-600/50 hover:shadow-lg transition-all bg-slate-50/50 flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-6">
                    <Microscope className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900">Researcher Portal</h3>
                  <p className="mt-2 text-sm text-slate-600">
                    Ethical clinical study governance with de-identified datasets.
                  </p>
                  <ul className="mt-4 space-y-2 text-sm text-slate-600">
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                      <span>Zero direct access to identifiable patient records</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                      <span>Automated HIPAA Safe Harbor & UU PDP anonymization</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-700" />
                      <span>Cohort analytics & audit-logged CSV exports</span>
                    </li>
                  </ul>
                </div>
                <Link
                  href="/dashboard/researcher"
                  className="mt-6 text-sm font-semibold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
                >
                  <span>Open Researcher Dashboard</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Tech Stack Banner */}
        <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <Database className="w-8 h-8 text-sky-600 mx-auto mb-2" />
              <div className="font-bold text-slate-900">Supabase & PostgreSQL</div>
              <div className="text-xs text-slate-500 mt-1">Row Level Security & Realtime</div>
            </div>
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <ShieldCheck className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <div className="font-bold text-slate-900">HL7 FHIR R4</div>
              <div className="text-xs text-slate-500 mt-1">Interoperability & LOINC</div>
            </div>
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <Smartphone className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <div className="font-bold text-slate-900">Stanford Spezi</div>
              <div className="text-xs text-slate-500 mt-1">Expo 54 + React Native 0.81</div>
            </div>
            <div className="p-6 rounded-xl bg-white border border-slate-200 shadow-sm">
              <Brain className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <div className="font-bold text-slate-900">FastAPI & PyTorch</div>
              <div className="text-xs text-slate-500 mt-1">Screening & Anomaly Engine</div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-8 text-center text-xs text-slate-500">
        <p>FUTURE HEALTH &copy; 2026 - Complete Digital Health Platform. Compliant with HL7 FHIR R4 & Indonesian UU PDP No. 27/2022.</p>
      </footer>
    </div>
  );
}


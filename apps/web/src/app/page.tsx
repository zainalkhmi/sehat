'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HeartPulse,
  Home,
  ChevronDown,
  Sparkles,
  Stethoscope,
  ArrowRight,
  ShieldCheck,
  Cpu,
  MonitorSmartphone,
  Lock,
  User,
  Microscope,
  Smartphone,
  Database,
  Activity,
  Layers,
  Zap,
  CheckCircle2,
  ExternalLink,
  Brain,
  MessageSquare,
  Shield
} from 'lucide-react';

export default function HomePage() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

  const toggleDropdown = (name: string) => {
    setActiveDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans selection:bg-sky-500 selection:text-white">
      {/* ================= 1. MODERN TOP NAVBAR (Exact match to Gambar 2) ================= */}
      <header className="border-b border-sky-100/80 bg-white/90 backdrop-blur-md sticky top-0 z-50 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Left: Brand Logo & FHIR R4 Pill */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/25 group-hover:scale-105 transition-transform">
                <HeartPulse className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-xl font-extrabold tracking-tight text-slate-900 font-serif">
                  FUTURE HEALTH
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700 border border-sky-200 uppercase tracking-wider">
                  FHIR R4
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Navigation Menu */}
          <nav className="hidden lg:flex items-center space-x-1 text-sm font-medium text-slate-600">
            {/* Home (Active Indicator) */}
            <Link
              href="/"
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 text-sky-600 font-semibold relative"
            >
              <Home className="w-4 h-4" />
              <span>Home</span>
              <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-sky-600 rounded-full" />
            </Link>

            {/* Features Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('features')}
                className="inline-flex items-center space-x-1 px-3 py-2 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-50"
              >
                <span>Features</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {activeDropdown === 'features' && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 text-xs">
                  <Link
                    href="/dashboard/doctor"
                    className="p-2.5 rounded-xl hover:bg-sky-50 block transition-colors"
                  >
                    <div className="font-bold text-slate-900">Clinician Workspace</div>
                    <div className="text-slate-500 text-[11px]">AI risk review & telemetri LOINC</div>
                  </Link>
                  <Link
                    href="/chat"
                    className="p-2.5 rounded-xl hover:bg-emerald-50 block transition-colors"
                  >
                    <div className="font-bold text-slate-900">Glass AI Clinical Encounter</div>
                    <div className="text-slate-500 text-[11px]">Voice, device metrics & digital twin</div>
                  </Link>
                  <Link
                    href="/dashboard/doctor/medx"
                    className="p-2.5 rounded-xl hover:bg-cyan-50 block transition-colors"
                  >
                    <div className="font-bold text-slate-900">MedX Doctor AI</div>
                    <div className="text-slate-500 text-[11px]">Differential diagnosis & ECG/CXR vision</div>
                  </Link>
                </div>
              )}
            </div>

            {/* Solutions Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('solutions')}
                className="inline-flex items-center space-x-1 px-3 py-2 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-50"
              >
                <span>Solutions</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {activeDropdown === 'solutions' && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 text-xs">
                  <Link
                    href="/dashboard/patient"
                    className="p-2.5 rounded-xl hover:bg-sky-50 block transition-colors"
                  >
                    <div className="font-bold text-slate-900">Patient Self-Care</div>
                    <div className="text-slate-500 text-[11px]">Wearables 24/7, Pillo & SatuSehat</div>
                  </Link>
                  <Link
                    href="/dashboard/researcher"
                    className="p-2.5 rounded-xl hover:bg-emerald-50 block transition-colors"
                  >
                    <div className="font-bold text-slate-900">Research & De-identification</div>
                    <div className="text-slate-500 text-[11px]">HIPAA Safe Harbor & UU PDP Kohort</div>
                  </Link>
                </div>
              )}
            </div>

            {/* Resources Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => toggleDropdown('resources')}
                className="inline-flex items-center space-x-1 px-3 py-2 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-50"
              >
                <span>Resources</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
              {activeDropdown === 'resources' && (
                <div className="absolute top-full left-0 mt-2 w-64 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 text-xs">
                  <div className="p-2.5 rounded-xl hover:bg-slate-50">
                    <div className="font-bold text-slate-900">Standar HL7 FHIR R4</div>
                    <div className="text-slate-500 text-[11px]">Spesifikasi interoperabilitas nasional</div>
                  </div>
                  <div className="p-2.5 rounded-xl hover:bg-slate-50">
                    <div className="font-bold text-slate-900">Stanford Spezi Framework</div>
                    <div className="text-slate-500 text-[11px]">Modul open-source riset medis</div>
                  </div>
                </div>
              )}
            </div>

            {/* About */}
            <Link
              href="#about"
              className="px-3 py-2 hover:text-slate-900 transition-colors rounded-lg hover:bg-slate-50"
            >
              About
            </Link>
          </nav>

          {/* Right: Action Pills & CTA */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            {/* Glass AI Chat Pill */}
            <Link
              href="/chat"
              className="inline-flex items-center space-x-1.5 px-3 sm:px-3.5 py-1.5 text-xs font-semibold rounded-full bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200/90 transition-all shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Glass AI Chat</span>
              <span className="sm:hidden">AI Chat</span>
            </Link>

            {/* MedX Doctor AI Pill */}
            <Link
              href="/dashboard/doctor/medx"
              className="hidden md:inline-flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-full bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200/90 transition-all shadow-2xs"
            >
              <Stethoscope className="w-3.5 h-3.5 text-sky-600" />
              <span>MedX Doctor AI</span>
            </Link>

            {/* Sign In */}
            <Link
              href="/login"
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 px-2 py-1 transition-colors"
            >
              Sign In
            </Link>

            {/* Get Started Button */}
            <Link
              href="/register"
              className="inline-flex items-center space-x-1.5 px-4 sm:px-5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md shadow-sky-500/25 transition-all hover:shadow-lg hover:-translate-y-0.5"
            >
              <span>Get Started</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ================= 2. HERO SECTION (Exact match to Gambar 2) ================= */}
      <main className="flex-1">
        <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24 bg-gradient-to-b from-sky-50/70 via-white to-sky-100/60">
          {/* Subtle Cybernetic Dot Grid Accents */}
          <div className="absolute top-6 left-6 w-24 h-24 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:12px_12px] opacity-25 pointer-events-none" />
          <div className="absolute bottom-6 right-6 w-32 h-32 bg-[radial-gradient(#0284c7_1px,transparent_1px)] [background-size:12px_12px] opacity-25 pointer-events-none" />

          {/* Ambient Lighting Gradients */}
          <div className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-1/3 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
              {/* Left Column: Heading, Subhead & 4 Pill CTA Buttons */}
              <div className="lg:col-span-6 space-y-6 text-left">
                {/* Stanford Spezi Tech Badge */}
                <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-sky-50/90 border border-sky-200 text-sky-700 text-xs font-semibold tracking-wide shadow-2xs">
                  <Zap className="w-3.5 h-3.5 text-sky-500 fill-sky-500" />
                  <span className="uppercase text-[11px] font-bold">
                    STANFORD SPEZI • REACT NATIVE • NEXT.JS • SUPABASE • FHIR R4
                  </span>
                </div>

                {/* Big Headline */}
                <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-slate-900 tracking-tight leading-[1.12]">
                  Next-Generation{' '}
                  <span className="bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 bg-clip-text text-transparent">
                    Cross-Platform
                  </span>{' '}
                  Digital Health Platform
                </h1>

                {/* Subtitle */}
                <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-xl">
                  Unifying patient mobile telemetry, clinician decision support, and ethical researcher analytics under strict HL7 FHIR R4 interoperability and AI safety standards.
                </p>

                {/* The 4 Rounded-Full CTA Buttons (Exact match to Gambar 2) */}
                <div className="pt-2 flex flex-wrap gap-3 sm:gap-3.5">
                  {/* Button 1: Glass AI Encounter */}
                  <Link
                    href="/chat"
                    className="inline-flex items-center space-x-2 px-5 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-sm shadow-md shadow-emerald-600/25 hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Glass AI Encounter</span>
                    <ArrowRight className="w-4 h-4 ml-0.5" />
                  </Link>

                  {/* Button 2: Patient Portal */}
                  <Link
                    href="/dashboard/patient"
                    className="inline-flex items-center space-x-2 px-5 py-3 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-400 hover:to-blue-500 text-white font-semibold text-sm shadow-md shadow-sky-500/25 hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    <User className="w-4 h-4" />
                    <span>Patient Portal</span>
                    <ArrowRight className="w-4 h-4 ml-0.5" />
                  </Link>

                  {/* Button 3: Doctor Portal */}
                  <Link
                    href="/dashboard/doctor"
                    className="inline-flex items-center space-x-2 px-5 py-3 rounded-full bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all hover:-translate-y-0.5"
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>Doctor Portal</span>
                    <ArrowRight className="w-4 h-4 ml-0.5" />
                  </Link>

                  {/* Button 4: Researcher Portal */}
                  <Link
                    href="/dashboard/researcher"
                    className="inline-flex items-center space-x-2 px-5 py-3 rounded-full bg-white/95 hover:bg-sky-50 text-sky-700 border border-sky-300 font-semibold text-sm shadow-sm transition-all hover:-translate-y-0.5"
                  >
                    <Microscope className="w-4 h-4 text-sky-600" />
                    <span>Researcher Portal</span>
                    <ArrowRight className="w-4 h-4 ml-0.5 text-sky-600" />
                  </Link>
                </div>
              </div>

              {/* Right Column: Hero Artwork Composite with Patient, Doctor & Holographic Cards */}
              <div className="lg:col-span-6 relative">
                {/* Ambient Halo Behind Image */}
                <div className="absolute inset-0 bg-gradient-to-tr from-sky-400/20 via-blue-500/20 to-teal-400/20 rounded-3xl blur-2xl transform scale-95 pointer-events-none" />

                {/* Hero Artwork Container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-sky-100/90 bg-white/50 backdrop-blur-xs group">
                  <img
                    src="/hero-concept.jpg"
                    alt="Future Health - Connected Patient Telemetry, AI Cloud, and Clinician Care"
                    className="w-full h-auto object-cover object-right transform group-hover:scale-[1.02] transition-transform duration-700"
                  />

                  {/* Gentle gradient overlay at bottom edge */}
                  <div className="absolute inset-0 bg-gradient-to-t from-sky-950/20 via-transparent to-transparent pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 3. FLOATING 4-PILLAR GLASS CARD (Exact match to Gambar 2) ================= */}
        <section className="relative z-20 -mt-8 sm:-mt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="rounded-3xl bg-white/95 backdrop-blur-xl border border-slate-200/90 shadow-xl shadow-sky-900/5 p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 divide-y sm:divide-y-0 lg:divide-x divide-slate-100">
              {/* Pillar 1: HL7 FHIR R4 Interoperability */}
              <div className="flex items-center space-x-4 pt-4 sm:pt-0">
                <div className="w-13 h-13 rounded-2xl bg-sky-100 text-sky-600 flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldCheck className="w-6 h-6 text-sky-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                    HL7 FHIR R4 Interoperability
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                    Standards-compliant healthcare data exchange
                  </p>
                </div>
              </div>

              {/* Pillar 2: AI-Powered Insights */}
              <div className="flex items-center space-x-4 pt-4 sm:pt-0 lg:pl-6">
                <div className="w-13 h-13 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0 shadow-xs">
                  <Cpu className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                    AI-Powered Insights
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                    Intelligent analytics for better care
                  </p>
                </div>
              </div>

              {/* Pillar 3: Cross-Platform */}
              <div className="flex items-center space-x-4 pt-4 sm:pt-0 lg:pl-6">
                <div className="w-13 h-13 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 shadow-xs">
                  <MonitorSmartphone className="w-6 h-6 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                    Cross-Platform
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                    Web, Mobile and XR Ready
                  </p>
                </div>
              </div>

              {/* Pillar 4: Secure & Compliant */}
              <div className="flex items-center space-x-4 pt-4 sm:pt-0 lg:pl-6">
                <div className="w-13 h-13 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
                  <Lock className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm tracking-tight">
                    Secure & Compliant
                  </h3>
                  <p className="text-slate-500 text-xs mt-0.5 leading-relaxed">
                    Enterprise-grade security
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ================= 4. ROLES WORKSPACES FEATURE MATRIX ================= */}
        <section id="features" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              Tailored Workspaces for Every Role
            </h2>
            <p className="mt-2 text-slate-500 text-base max-w-2xl mx-auto">
              Strictly isolated privilege boundaries, role-based access control, and seamless clinical synchronization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Patient Card */}
            <div className="rounded-3xl border border-slate-200/90 p-8 bg-white hover:border-sky-400 hover:shadow-xl hover:shadow-sky-500/10 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Smartphone className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Patient Portal & Mobile App</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  Self-directed health tracking powered by Stanford Spezi and Google Health Connect.
                </p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Aolon GT6 Pro, Apple HealthKit & Health Connect continuous sync</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>FHIR Questionnaires (PHQ-9, GAD-7) & Digital Biomarkers</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-sky-600 shrink-0" />
                    <span>Pillo Care persistent medication reminder & compliance</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard/patient"
                className="mt-8 inline-flex items-center justify-between text-sm font-bold text-sky-600 hover:text-sky-700 p-3 rounded-xl bg-sky-50 hover:bg-sky-100 transition-colors"
              >
                <span>Buka Patient Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Doctor Card */}
            <div className="rounded-3xl border border-slate-200/90 p-8 bg-white hover:border-slate-800 hover:shadow-xl hover:shadow-slate-900/10 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-slate-900 text-white flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Stethoscope className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Clinician Workspace & MedX AI</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  Clinical dashboard for assigned patients, MedX DDx decision support, and ABPM dipping analysis.
                </p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />
                    <span>Assigned patient registry with SatuSehat Kemenkes bridge</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />
                    <span>AI-assisted risk review & approval workflow</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-slate-900 shrink-0" />
                    <span>MedX multi-model LLM routing with PubMed RAG citations</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard/doctor"
                className="mt-8 inline-flex items-center justify-between text-sm font-bold text-slate-900 hover:text-slate-700 p-3 rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                <span>Buka Doctor Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Researcher Card */}
            <div className="rounded-3xl border border-slate-200/90 p-8 bg-white hover:border-emerald-600 hover:shadow-xl hover:shadow-emerald-600/10 transition-all flex flex-col justify-between group">
              <div>
                <div className="w-13 h-13 rounded-2xl bg-emerald-50 text-emerald-700 border border-emerald-100 flex items-center justify-center mb-6 group-hover:scale-105 transition-transform">
                  <Microscope className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Clinical Research Portal</h3>
                <p className="mt-2 text-sm text-slate-500 leading-relaxed">
                  Ethical clinical study governance with de-identified datasets under HIPAA Safe Harbor.
                </p>
                <ul className="mt-6 space-y-2.5 text-xs text-slate-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Zero direct access to identifiable patient medical records</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Automated HIPAA Safe Harbor & UU PDP anonymization</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>Digital phenotyping telemetry ingestion & CSV export</span>
                  </li>
                </ul>
              </div>
              <Link
                href="/dashboard/researcher"
                className="mt-8 inline-flex items-center justify-between text-sm font-bold text-emerald-700 hover:text-emerald-800 p-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 transition-colors"
              >
                <span>Buka Researcher Portal</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* ================= 5. CLINICAL TECHNOLOGY STACK ================= */}
        <section id="about" className="py-16 bg-white border-t border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
                <Database className="w-7 h-7 text-sky-600 mx-auto mb-2" />
                <div className="font-bold text-slate-900 text-sm">Supabase & PostgreSQL</div>
                <div className="text-xs text-slate-500 mt-1">Row Level Security & Realtime</div>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
                <ShieldCheck className="w-7 h-7 text-emerald-600 mx-auto mb-2" />
                <div className="font-bold text-slate-900 text-sm">HL7 FHIR R4</div>
                <div className="text-xs text-slate-500 mt-1">SatuSehat & LOINC Standards</div>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
                <Smartphone className="w-7 h-7 text-purple-600 mx-auto mb-2" />
                <div className="font-bold text-slate-900 text-sm">Stanford Spezi</div>
                <div className="text-xs text-slate-500 mt-1">Expo 54 + React Native 0.81</div>
              </div>
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80">
                <Brain className="w-7 h-7 text-amber-600 mx-auto mb-2" />
                <div className="font-bold text-slate-900 text-sm">Clinical AI & MedX</div>
                <div className="text-xs text-slate-500 mt-1">Multi-Model LLM & Computer Vision</div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ================= 6. MODERN MEDICAL FOOTER ================= */}
      <footer className="border-t border-slate-200 bg-white py-10 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <HeartPulse className="w-4 h-4 text-sky-600" />
            <span className="font-bold text-slate-800">FUTURE HEALTH &copy; 2026</span>
            <span>• Cross-Platform Digital Health & Telemetry</span>
          </div>
          <p className="text-slate-400">
            Compliant with HL7 FHIR R4, LOINC, and Indonesian UU PDP No. 27/2022.
          </p>
        </div>
      </footer>
    </div>
  );
}

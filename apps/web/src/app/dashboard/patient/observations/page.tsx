'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { STANDARD_LOINC_CODES, UCUM_UNITS } from '@future-health/fhir';

interface VitalEntry {
  id: string;
  loincCode: string;
  name: string;
  valueNumeric?: number;
  unit: string;
  effectiveDateTime: string;
  source: 'healthkit' | 'health-connect' | 'ble' | 'manual';
  components?: Array<{ name: string; value: number; unit: string }>;
  status: 'normal' | 'elevated' | 'critical';
}

const INITIAL_VITALS: VitalEntry[] = [
  {
    id: 'vit-001',
    loincCode: STANDARD_LOINC_CODES.BLOOD_PRESSURE_PANEL,
    name: 'Blood Pressure',
    unit: 'mmHg',
    effectiveDateTime: '2026-11-04T08:00:00Z',
    source: 'ble',
    components: [
      { name: 'Systolic', value: 122, unit: 'mmHg' },
      { name: 'Diastolic', value: 80, unit: 'mmHg' },
    ],
    status: 'normal',
  },
  {
    id: 'vit-002',
    loincCode: STANDARD_LOINC_CODES.HEART_RATE,
    name: 'Heart Rate',
    valueNumeric: 72,
    unit: 'bpm',
    effectiveDateTime: '2026-11-04T08:00:00Z',
    source: 'healthkit',
    status: 'normal',
  },
  {
    id: 'vit-003',
    loincCode: STANDARD_LOINC_CODES.SPO2,
    name: 'Oxygen Saturation (SpO2)',
    valueNumeric: 98,
    unit: '%',
    effectiveDateTime: '2026-11-03T21:30:00Z',
    source: 'healthkit',
    status: 'normal',
  },
  {
    id: 'vit-004',
    loincCode: STANDARD_LOINC_CODES.BLOOD_GLUCOSE,
    name: 'Blood Glucose (Fasting)',
    valueNumeric: 96,
    unit: 'mg/dL',
    effectiveDateTime: '2026-11-03T07:15:00Z',
    source: 'manual',
    status: 'normal',
  },
  {
    id: 'vit-005',
    loincCode: STANDARD_LOINC_CODES.BODY_TEMP,
    name: 'Body Temperature',
    valueNumeric: 36.6,
    unit: '°C',
    effectiveDateTime: '2026-11-02T19:00:00Z',
    source: 'manual',
    status: 'normal',
  },
];

export default function PatientObservationsPage() {
  const [vitals, setVitals] = useState<VitalEntry[]>(INITIAL_VITALS);
  const [selectedType, setSelectedType] = useState<'bp' | 'hr' | 'spo2' | 'glucose' | 'temp'>('bp');

  // Form states
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [numericValue, setNumericValue] = useState('');
  const [logSuccess, setLogSuccess] = useState(false);

  const handleLogVital = (e: React.FormEvent) => {
    e.preventDefault();

    let newEntry: VitalEntry;
    const now = new Date().toISOString();

    if (selectedType === 'bp') {
      const sys = parseInt(systolic, 10) || 120;
      const dia = parseInt(diastolic, 10) || 80;
      const isElevated = sys > 130 || dia > 85;

      newEntry = {
        id: `vit-${Date.now()}`,
        loincCode: STANDARD_LOINC_CODES.BLOOD_PRESSURE_PANEL,
        name: 'Blood Pressure',
        unit: 'mmHg',
        effectiveDateTime: now,
        source: 'manual',
        components: [
          { name: 'Systolic', value: sys, unit: 'mmHg' },
          { name: 'Diastolic', value: dia, unit: 'mmHg' },
        ],
        status: isElevated ? 'elevated' : 'normal',
      };
      setSystolic('');
      setDiastolic('');
    } else {
      const val = parseFloat(numericValue) || 0;
      let name = 'Heart Rate';
      let code: string = STANDARD_LOINC_CODES.HEART_RATE;
      let unit = 'bpm';
      let status: VitalEntry['status'] = 'normal';

      if (selectedType === 'hr') {
        name = 'Heart Rate';
        code = STANDARD_LOINC_CODES.HEART_RATE;
        unit = 'bpm';
        if (val < 50 || val > 110) status = 'elevated';
      } else if (selectedType === 'spo2') {
        name = 'Oxygen Saturation (SpO2)';
        code = STANDARD_LOINC_CODES.SPO2;
        unit = '%';
        if (val < 94) status = 'critical';
      } else if (selectedType === 'glucose') {
        name = 'Blood Glucose';
        code = STANDARD_LOINC_CODES.BLOOD_GLUCOSE;
        unit = 'mg/dL';
        if (val > 140) status = 'elevated';
      } else if (selectedType === 'temp') {
        name = 'Body Temperature';
        code = STANDARD_LOINC_CODES.BODY_TEMP;
        unit = '°C';
        if (val > 38.0) status = 'elevated';
      }

      newEntry = {
        id: `vit-${Date.now()}`,
        loincCode: code,
        name,
        valueNumeric: val,
        unit,
        effectiveDateTime: now,
        source: 'manual',
        status,
      };
      setNumericValue('');
    }

    setVitals([newEntry, ...vitals]);
    setLogSuccess(true);
    setTimeout(() => setLogSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-10">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href="/dashboard/patient"
              className="text-xs font-semibold uppercase tracking-wider text-teal-600 hover:text-teal-700"
            >
              &larr; Patient Portal
            </Link>
            <span className="text-slate-300">/</span>
            <span className="text-xs font-semibold text-slate-500 uppercase">Health Observations</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800 mt-1">Vital Signs & Clinical Telemetry</h1>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/patient/profile"
            className="px-3 py-1.5 text-xs font-medium border border-slate-300 rounded-md hover:bg-slate-50 text-slate-700"
          >
            My Clinical Profile
          </Link>
          <span className="px-3 py-1 bg-teal-50 border border-teal-200 text-teal-800 text-xs font-semibold rounded-full">
            FHIR R4 & LOINC Synchronized
          </span>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Entry Form */}
        <section className="lg:col-span-4 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wide">
              Log Physiological Measurement
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Recorded observations stream to your clinical chart and are visible to your doctor.
            </p>

            {/* Vital Type Selector */}
            <div className="grid grid-cols-2 gap-2 mt-4">
              <button
                type="button"
                onClick={() => setSelectedType('bp')}
                className={`p-2 text-xs font-semibold rounded-lg border text-left transition ${
                  selectedType === 'bp'
                    ? 'border-teal-600 bg-teal-50 text-teal-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                🩺 Blood Pressure
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('hr')}
                className={`p-2 text-xs font-semibold rounded-lg border text-left transition ${
                  selectedType === 'hr'
                    ? 'border-teal-600 bg-teal-50 text-teal-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                ❤️ Heart Rate
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('spo2')}
                className={`p-2 text-xs font-semibold rounded-lg border text-left transition ${
                  selectedType === 'spo2'
                    ? 'border-teal-600 bg-teal-50 text-teal-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                🫁 Oxygen (SpO2)
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('glucose')}
                className={`p-2 text-xs font-semibold rounded-lg border text-left transition ${
                  selectedType === 'glucose'
                    ? 'border-teal-600 bg-teal-50 text-teal-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                🩸 Blood Glucose
              </button>
              <button
                type="button"
                onClick={() => setSelectedType('temp')}
                className={`col-span-2 p-2 text-xs font-semibold rounded-lg border text-left transition ${
                  selectedType === 'temp'
                    ? 'border-teal-600 bg-teal-50 text-teal-900'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                🌡️ Body Temperature
              </button>
            </div>

            {/* Log Form */}
            <form onSubmit={handleLogVital} className="mt-4 space-y-3">
              {selectedType === 'bp' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Systolic (mmHg)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="120"
                      value={systolic}
                      onChange={(e) => setSystolic(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">
                      Diastolic (mmHg)
                    </label>
                    <input
                      type="number"
                      required
                      placeholder="80"
                      value={diastolic}
                      onChange={(e) => setDiastolic(e.target.value)}
                      className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">
                    {selectedType === 'hr' && 'Pulse Rate (beats/minute)'}
                    {selectedType === 'spo2' && 'Arterial Oxygen Percentage (%)'}
                    {selectedType === 'glucose' && 'Fasting Blood Glucose (mg/dL)'}
                    {selectedType === 'temp' && 'Core Temperature (°C)'}
                  </label>
                  <input
                    type="number"
                    step={selectedType === 'temp' ? '0.1' : '1'}
                    required
                    placeholder={
                      selectedType === 'hr'
                        ? '72'
                        : selectedType === 'spo2'
                        ? '98'
                        : selectedType === 'glucose'
                        ? '95'
                        : '36.5'
                    }
                    value={numericValue}
                    onChange={(e) => setNumericValue(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-lg border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              )}

              {logSuccess && (
                <div className="p-2.5 bg-emerald-50 text-emerald-800 text-xs font-medium rounded-lg border border-emerald-200">
                  ✓ Vital observation saved and synced to clinical record.
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold transition shadow-xs"
              >
                Save Observation
              </button>
            </form>
          </div>

          {/* Clinical Reference Standards Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wide">
              Clinical Normal Thresholds
            </h3>
            <ul className="mt-3 space-y-2 text-xs text-slate-600">
              <li className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Blood Pressure</span>
                <span className="font-semibold text-slate-800">&lt; 120/80 mmHg</span>
              </li>
              <li className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Resting Heart Rate</span>
                <span className="font-semibold text-slate-800">60 - 100 bpm</span>
              </li>
              <li className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Oxygen Saturation</span>
                <span className="font-semibold text-slate-800">95% - 100%</span>
              </li>
              <li className="flex justify-between border-b border-slate-100 pb-1.5">
                <span>Fasting Glucose</span>
                <span className="font-semibold text-slate-800">70 - 99 mg/dL</span>
              </li>
              <li className="flex justify-between">
                <span>Body Temperature</span>
                <span className="font-semibold text-slate-800">36.1°C - 37.2°C</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Observation History Feed */}
        <section className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-slate-800">Clinical Observations Timeline</h2>
                <p className="text-xs text-slate-500">
                  Showing continuous health telemetry and self-reported vital signs.
                </p>
              </div>
              <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">
                {vitals.length} total readings
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 uppercase font-semibold">
                    <th className="py-2.5 px-3">Measurement</th>
                    <th className="py-2.5 px-3">Value</th>
                    <th className="py-2.5 px-3">LOINC Code</th>
                    <th className="py-2.5 px-3">Source</th>
                    <th className="py-2.5 px-3">Recorded At</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {vitals.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50">
                      <td className="py-3 px-3 font-semibold text-slate-800">{v.name}</td>
                      <td className="py-3 px-3">
                        {v.components ? (
                          <span className="font-bold text-slate-900">
                            {v.components[0].value} / {v.components[1].value} {v.unit}
                          </span>
                        ) : (
                          <span className="font-bold text-slate-900">
                            {v.valueNumeric} {v.unit}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-500">{v.loincCode}</td>
                      <td className="py-3 px-3">
                        <span className="capitalize bg-slate-100 text-slate-600 px-2 py-0.5 rounded text-[11px]">
                          {v.source === 'healthkit'
                            ? 'Apple Health'
                            : v.source === 'ble'
                            ? 'Bluetooth'
                            : v.source}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-slate-500">
                        {new Date(v.effectiveDateTime).toLocaleString()}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                            v.status === 'normal'
                              ? 'bg-emerald-100 text-emerald-800'
                              : v.status === 'elevated'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-rose-100 text-rose-800'
                          }`}
                        >
                          {v.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}


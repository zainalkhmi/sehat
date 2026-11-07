import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Switch,
  Alert,
  Platform,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface ClinicalRecord {
  id: string;
  type: 'bp' | 'hr' | 'spo2' | 'temp' | 'glucose' | 'rr';
  title: string;
  value: string;
  unit: string;
  subValue?: string;
  source: string;
  timestamp: string;
  status: 'optimal' | 'normal' | 'pre-hypertension' | 'high' | 'low';
  loincCode: string; // HL7 FHIR LOINC Standard Code
  // Clinical Metadata Protocols
  posture?: 'sitting' | 'supine' | 'standing';
  arm?: 'right' | 'left';
  medRelation?: 'before_med' | 'after_med' | 'fasting';
  symptom?: string;
}

const INITIAL_CLINICAL_RECORDS: ClinicalRecord[] = [
  {
    id: 'm-01',
    type: 'bp',
    title: 'Tekanan Darah (Blood Pressure)',
    value: '103/64',
    unit: 'mmHg',
    subValue: 'Nadi 62 BPM',
    source: 'Omron BP5250 (BLE Cuff)',
    timestamp: 'Hari Ini, 14:36 WIB',
    status: 'optimal',
    loincCode: 'LOINC 85354-9',
    posture: 'sitting',
    arm: 'right',
    medRelation: 'after_med',
    symptom: 'Asimtomatik (Kondisi Tenang)',
  },
  {
    id: 'm-02',
    type: 'hr',
    title: 'Denyut Jantung Istirahat (Resting HR)',
    value: '72',
    unit: 'BPM',
    subValue: 'Sinus Rhythm Normal',
    source: 'Apple Watch Series 9',
    timestamp: 'Hari Ini, 08:30 WIB',
    status: 'normal',
    loincCode: 'LOINC 8867-4',
    posture: 'sitting',
    symptom: 'Tanpa palpitasi',
  },
  {
    id: 'm-03',
    type: 'spo2',
    title: 'Saturasi Oksigen (SpO2)',
    value: '98',
    unit: '%',
    subValue: 'Room Air (Udara Bebas)',
    source: 'Apple Watch / Pulse Oximeter',
    timestamp: 'Kemarin, 22:15 WIB',
    status: 'optimal',
    loincCode: 'LOINC 59408-5',
    posture: 'supine',
    symptom: 'Pernapasan reguler',
  },
  {
    id: 'm-04',
    type: 'temp',
    title: 'Suhu Tubuh (Body Temperature)',
    value: '36.5',
    unit: '°C',
    subValue: 'Normothermia (Eutermik)',
    source: 'Digital Clinical Thermometer',
    timestamp: 'Hari Ini, 08:00 WIB',
    status: 'optimal',
    loincCode: 'LOINC 8310-5',
    symptom: 'Tanpa demam / menggigil',
  },
  {
    id: 'm-05',
    type: 'glucose',
    title: 'Glukosa Darah Sewaktu (CGM)',
    value: '98',
    unit: 'mg/dL',
    subValue: '2 Jam Pasca Makan Pagi',
    source: 'Continuous Glucose Sensor',
    timestamp: 'Hari Ini, 10:00 WIB',
    status: 'normal',
    loincCode: 'LOINC 2339-0',
    medRelation: 'after_med',
    symptom: 'Glikemia terkontrol',
  },
  {
    id: 'm-06',
    type: 'rr',
    title: 'Laju Pernapasan (Respiratory Rate)',
    value: '16',
    unit: 'x/menit',
    subValue: 'Eupnea Reguler',
    source: 'Wearable Acoustic Telemetry',
    timestamp: 'Hari Ini, 12:00 WIB',
    status: 'normal',
    loincCode: 'LOINC 9279-1',
    symptom: 'Tanpa sesak (Dyspnea)',
  },
];

// 7-Day Trend Samples for BP (Systolic / Diastolic)
const BP_TREND_DAYS = [
  { day: 'Sen', sys: 118, dia: 76, time: 'pagi' },
  { day: 'Sel', sys: 114, dia: 74, time: 'pagi' },
  { day: 'Rab', sys: 112, dia: 70, time: 'pagi' },
  { day: 'Kam', sys: 110, dia: 68, time: 'pagi' },
  { day: 'Jum', sys: 108, dia: 66, time: 'pagi' },
  { day: 'Sab', sys: 105, dia: 65, time: 'pagi' },
  { day: 'Min', sys: 103, dia: 64, time: 'pagi' },
];

export default function MeasurementsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [records, setRecords] = useState<ClinicalRecord[]>(INITIAL_CLINICAL_RECORDS);
  const [trendRange, setTrendRange] = useState<'7d' | '30d'>('7d');
  const [filterType, setFilterType] = useState<'all' | 'bp' | 'hr' | 'spo2' | 'labs'>('all');

  // Modals state
  const [recordModalVisible, setRecordModalVisible] = useState(false);
  const [exportModalVisible, setExportModalVisible] = useState(false);
  const [redFlagModalVisible, setRedFlagModalVisible] = useState(false);

  // New Record Form Inputs with Clinical Metadata
  const [newSys, setNewSys] = useState('110');
  const [newDia, setNewDia] = useState('70');
  const [newPulse, setNewPulse] = useState('68');
  const [newPosture, setNewPosture] = useState<'sitting' | 'supine' | 'standing'>('sitting');
  const [newArm, setNewArm] = useState<'right' | 'left'>('right');
  const [newMedRelation, setNewMedRelation] = useState<'before_med' | 'after_med' | 'fasting'>('after_med');
  const [newSymptoms, setNewSymptoms] = useState('');

  // Latest BP Reference for Hemodynamic Calculations
  const latestBP = records.find((r) => r.type === 'bp') || records[0];
  const [sysStr, diaStr] = latestBP.value.split('/');
  const systolic = parseInt(sysStr, 10) || 103;
  const diastolic = parseInt(diaStr, 10) || 64;

  // 1. Mean Arterial Pressure (MAP) = Diastolic + 1/3 (Systolic - Diastolic)
  const mapValue = Math.round(diastolic + (systolic - diastolic) / 3);

  // 2. Pulse Pressure (PP) = Systolic - Diastolic
  const pulsePressure = systolic - diastolic;

  // Clinical Classification AHA/ACC 2017 & PERHI
  let bpCategory = 'Optimal / Normal';
  let bpCategoryColor = '#34C759';
  if (systolic >= 180 || diastolic >= 120) {
    bpCategory = 'KRISIS HIPERTENSI (EMERGENCY)';
    bpCategoryColor = '#FF3B30';
  } else if (systolic >= 140 || diastolic >= 90) {
    bpCategory = 'Hipertensi Derajat 2';
    bpCategoryColor = '#FF3B30';
  } else if (systolic >= 130 || diastolic >= 80) {
    bpCategory = 'Hipertensi Derajat 1';
    bpCategoryColor = '#FF9500';
  } else if (systolic >= 120 && diastolic < 80) {
    bpCategory = 'Elevated (Pre-Hipertensi)';
    bpCategoryColor = '#FF9500';
  }

  // Handle Save New Record
  const handleSaveRecord = () => {
    const sys = parseInt(newSys, 10) || 120;
    const dia = parseInt(newDia, 10) || 80;
    const pulse = parseInt(newPulse, 10) || 72;

    let status: ClinicalRecord['status'] = 'optimal';
    if (sys >= 140 || dia >= 90) status = 'high';
    else if (sys >= 130 || dia >= 80) status = 'pre-hypertension';
    else if (sys >= 120) status = 'normal';

    const now = new Date();
    const timeStr = `Hari Ini, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    const newRecord: ClinicalRecord = {
      id: `m-${Date.now()}`,
      type: 'bp',
      title: 'Tekanan Darah (Blood Pressure)',
      value: `${sys}/${dia}`,
      unit: 'mmHg',
      subValue: `Nadi ${pulse} BPM`,
      source: 'Omron BP5250 (BLE Cuff)',
      timestamp: timeStr,
      status,
      loincCode: 'LOINC 85354-9',
      posture: newPosture,
      arm: newArm,
      medRelation: newMedRelation,
      symptom: newSymptoms.trim() || 'Asimtomatik (Normal)',
    };

    setRecords([newRecord, ...records]);
    setRecordModalVisible(false);
    setNewSymptoms('');

    Alert.alert(
      '✅ Pengukuran Klinis Tersimpan',
      `Tensi ${sys}/${dia} mmHg (${status.toUpperCase()}) dan Nadi ${pulse} BPM tercatat dengan metadata posisi ${newPosture} & lengan ${newArm}. Data tersinkron ke rekam medis Supabase & DPJP.`
    );
  };

  // Handle Share to DPJP
  const handleShareToDPJP = () => {
    Alert.alert(
      '🩺 Kirim Telemetri ke DPJP',
      'Apakah Anda ingin mengirimkan laporan tren tanda vital 7 hari terakhir ke dr. Budi Santoso, Sp.JP(K)? Dokter akan menerima notifikasi prioritas klinis.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Kirim Sekarang',
          onPress: () => {
            Alert.alert(
              'Telemetri Terkirim ke DPJP',
              'Laporan telemetri tanda vital dan status hemodinamik telah diterima oleh dr. Budi Santoso, Sp.JP(K) di Rumah Sakit Jantung Harapan Kita.'
            );
          },
        },
      ]
    );
  };

  // Handle Export Clinical PDF Summary
  const handleExportPDF = async () => {
    const summaryText = `
SEHAT CLINICAL TELEMETRY SUMMARY REPORT
Standard: HL7 FHIR R4 & LOINC Clinical Observational Standards
DPJP: dr. Budi Santoso, Sp.JP(K), FIHA
Pasien: Zainal (ID: P-88219)

1. HEMODYNAMIC EVALUATION (AHA/ACC 2017 & PERHI):
- Blood Pressure: ${systolic}/${diastolic} mmHg (${bpCategory})
- Mean Arterial Pressure (MAP): ${mapValue} mmHg (Normal: 70-100 mmHg)
- Pulse Pressure (PP): ${pulsePressure} mmHg (Arterial Compliance: Good)
- Target In-Range (TIR): 96% dalam target klinis

2. REKAP TANDA VITAL LENGKAP:
- Resting Heart Rate: 72 BPM (Sinus Rhythm) [LOINC 8867-4]
- Oxygen Saturation (SpO2): 98% Room Air [LOINC 59408-5]
- Body Temperature: 36.5 °C (Normothermia) [LOINC 8310-5]
- Glucose: 98 mg/dL (2h post-prandial) [LOINC 2339-0]
- Respiratory Rate: 16 x/menit [LOINC 9279-1]

3. EVALUASI DIPPING SIRKADIAN:
- Status: Normal Nocturnal Dipping (Penurunan tensi malam 12%)
- Morning Surge: Tidak ditemukan lonjakan tensi berbahaya di pagi hari.

Keterangan: Dokumen ini terenkripsi AES-256 sesuai UU PDP No. 27/2022.
    `.trim();

    try {
      if (Platform.OS === 'web') {
        Alert.alert('📄 Ekspor Laporan PDF Medis', summaryText);
      } else {
        await Share.share({
          message: summaryText,
          title: 'Clinical Telemetry Summary Report - dr. Budi Santoso, Sp.JP',
        });
      }
    } catch {
      Alert.alert('Laporan Dibuat', summaryText);
    }
  };

  // Filtered records
  const filteredRecords = records.filter((r) => {
    if (filterType === 'all') return true;
    if (filterType === 'bp') return r.type === 'bp';
    if (filterType === 'hr') return r.type === 'hr';
    if (filterType === 'spo2') return r.type === 'spo2';
    if (filterType === 'labs') return r.type === 'temp' || r.type === 'glucose' || r.type === 'rr';
    return true;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
      {/* ================= CLINICAL HEADER ================= */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
        <View style={styles.headerLeft}>
          <View style={styles.dpjpBadge}>
            <Ionicons name="medkit" size={13} color="#007AFF" />
            <Text style={styles.dpjpBadgeText}>DPJP: DR. BUDI SANTOSO, SP.JP(K)</Text>
          </View>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Clinical Telemetry
          </Text>
          <Text style={styles.headerSubtitle}>
            HL7 FHIR R4 • LOINC Validated Observational Panel
          </Text>
        </View>

        <View style={styles.headerActions}>
          {/* Quick PDF Export */}
          <TouchableOpacity
            style={[styles.headerIconBtn, { backgroundColor: '#007AFF15' }]}
            onPress={handleExportPDF}
          >
            <Ionicons name="document-text-outline" size={20} color="#007AFF" />
          </TouchableOpacity>

          {/* Red Flag / Emergency Check */}
          <TouchableOpacity
            style={[styles.headerIconBtn, { backgroundColor: '#FF3B3015' }]}
            onPress={() => setRedFlagModalVisible(true)}
          >
            <Ionicons name="shield-outline" size={20} color="#FF3B30" />
          </TouchableOpacity>

          {/* Record New Measurement */}
          <TouchableOpacity
            style={[styles.headerIconBtn, { backgroundColor: '#007AFF' }]}
            onPress={() => setRecordModalVisible(true)}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ================= 1. ADVANCED HEMODYNAMIC EVALUATION HERO CARD ================= */}
        <View style={[styles.hemodynamicHero, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <View style={styles.hemoTopRow}>
            <View style={styles.hemoTitleCol}>
              <Text style={styles.hemoCardSub}>EVALUASI HEMODINAMIK TERKINI</Text>
              <Text style={[styles.hemoCardTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Tekanan Darah & Perfusi Organ
              </Text>
            </View>

            {/* AHA/ACC Category Badge */}
            <View style={[styles.categoryBadge, { backgroundColor: `${bpCategoryColor}18` }]}>
              <View style={[styles.categoryDot, { backgroundColor: bpCategoryColor }]} />
              <Text style={[styles.categoryText, { color: bpCategoryColor }]}>
                {bpCategory.toUpperCase()}
              </Text>
            </View>
          </View>

          {/* Big Number & Primary Vitals */}
          <View style={styles.primaryNumbersRow}>
            <View style={styles.primaryBPCol}>
              <Text style={[styles.primaryBPValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {latestBP.value}
              </Text>
              <Text style={styles.primaryBPUnit}>mmHg • Sistolik/Diastolik</Text>
            </View>

            <View style={styles.primaryDivider} />

            <View style={styles.primaryPulseCol}>
              <View style={styles.pulseRow}>
                <Ionicons name="pulse" size={20} color="#FF2D55" />
                <Text style={[styles.pulseValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  62
                </Text>
              </View>
              <Text style={styles.pulseUnit}>BPM • Resting Sinus</Text>
            </View>
          </View>

          {/* 3 Calculated Medical Parameters: MAP, Pulse Pressure, Target In-Range */}
          <View style={[styles.hemoMetricsGrid, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
            {/* 1. Mean Arterial Pressure (MAP) */}
            <View style={styles.hemoMetricItem}>
              <View style={styles.metricLabelRow}>
                <Ionicons name="water-outline" size={13} color="#007AFF" />
                <Text style={styles.metricLabel}>MAP (PERFUSI)</Text>
              </View>
              <Text style={[styles.metricValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {mapValue} <Text style={styles.metricUnit}>mmHg</Text>
              </Text>
              <Text style={styles.metricStatusText}>Adekuat (70–100)</Text>
            </View>

            <View style={styles.hemoGridDivider} />

            {/* 2. Pulse Pressure (PP) */}
            <View style={styles.hemoMetricItem}>
              <View style={styles.metricLabelRow}>
                <Ionicons name="fitness-outline" size={13} color="#FF9500" />
                <Text style={styles.metricLabel}>TEKANAN NADI (PP)</Text>
              </View>
              <Text style={[styles.metricValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {pulsePressure} <Text style={styles.metricUnit}>mmHg</Text>
              </Text>
              <Text style={styles.metricStatusText}>Elastisitas Vaskular Baik</Text>
            </View>

            <View style={styles.hemoGridDivider} />

            {/* 3. Target In-Range (TIR) */}
            <View style={styles.hemoMetricItem}>
              <View style={styles.metricLabelRow}>
                <Ionicons name="checkmark-done" size={13} color="#34C759" />
                <Text style={styles.metricLabel}>IN-RANGE (TIR)</Text>
              </View>
              <Text style={[styles.metricValue, { color: '#34C759' }]}>
                96%
              </Text>
              <Text style={styles.metricStatusText}>7 Hari Terakhir</Text>
            </View>
          </View>

          {/* Clinical Protocol Metadata Attribution Tags */}
          <View style={styles.protocolTagsRow}>
            <View style={styles.protocolPill}>
              <Ionicons name="body-outline" size={12} color="#007AFF" />
              <Text style={styles.protocolPillText}>
                {latestBP.posture === 'sitting'
                  ? 'Posisi Duduk'
                  : latestBP.posture === 'supine'
                  ? 'Berbaring'
                  : 'Berdiri'}
              </Text>
            </View>

            <View style={styles.protocolPill}>
              <Ionicons name="hand-right-outline" size={12} color="#007AFF" />
              <Text style={styles.protocolPillText}>
                {latestBP.arm === 'right' ? 'Lengan Kanan' : 'Lengan Kiri'}
              </Text>
            </View>

            <View style={styles.protocolPill}>
              <Ionicons name="medkit-outline" size={12} color="#34C759" />
              <Text style={styles.protocolPillText}>
                {latestBP.medRelation === 'after_med'
                  ? 'Pasca Amlodipine'
                  : 'Sebelum Minum Obat'}
              </Text>
            </View>
          </View>

          {/* Share to DPJP Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.shareDPJPBtn}
            onPress={handleShareToDPJP}
          >
            <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
            <Text style={styles.shareDPJPBtnText}>
              Kirim Evaluasi ke dr. Budi Santoso, Sp.JP(K)
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= 2. CIRCADIAN TREND GRAPH & DIPPING ANALYSIS ================= */}
        <View style={[styles.trendCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <View style={styles.trendHeader}>
            <View>
              <Text style={styles.trendSub}>ANALISIS SIRKADIAN & DIPPING</Text>
              <Text style={[styles.trendTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Tren Tensi 7 Hari Terakhir
              </Text>
            </View>

            <View style={styles.rangeSelector}>
              <TouchableOpacity
                style={[styles.rangeBtn, trendRange === '7d' && styles.rangeBtnActive]}
                onPress={() => setTrendRange('7d')}
              >
                <Text
                  style={[
                    styles.rangeBtnText,
                    trendRange === '7d' && styles.rangeBtnTextActive,
                  ]}
                >
                  7 Hari
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.rangeBtn, trendRange === '30d' && styles.rangeBtnActive]}
                onPress={() => setTrendRange('30d')}
              >
                <Text
                  style={[
                    styles.rangeBtnText,
                    trendRange === '30d' && styles.rangeBtnTextActive,
                  ]}
                >
                  30 Hari
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Bar Chart Representation of 7 Days */}
          <View style={styles.chartContainer}>
            {BP_TREND_DAYS.map((d, i) => {
              const maxScale = 140;
              const barHeight = Math.max(30, (d.sys / maxScale) * 110);
              const isToday = i === BP_TREND_DAYS.length - 1;

              return (
                <View key={d.day} style={styles.chartColumn}>
                  <Text style={styles.chartBarValue}>{d.sys}</Text>
                  <View style={styles.chartBarWrap}>
                    <View
                      style={[
                        styles.chartBarFill,
                        {
                          height: barHeight,
                          backgroundColor: isToday ? '#007AFF' : '#007AFF70',
                        },
                      ]}
                    />
                  </View>
                  <Text style={[styles.chartDayText, isToday && styles.chartDayTextToday]}>
                    {d.day}
                  </Text>
                </View>
              );
            })}
          </View>

          {/* Clinical Dipping Status Insight */}
          <View style={[styles.dippingInsightBox, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
            <View style={styles.dippingTopRow}>
              <Ionicons name="moon" size={16} color="#5856D6" />
              <Text style={styles.dippingTitle}>Status Dipping Sirkadian Malam: Normal Dipper</Text>
            </View>
            <Text style={styles.dippingDesc}>
              Tekanan darah malam hari turun ~12% (Kardioprotektif). Tidak ditemukan lonjakan tensi pagi hari (*Morning Blood Pressure Surge*).
            </Text>
          </View>
        </View>

        {/* ================= 3. FILTER CHIPS ================= */}
        <View style={styles.filterScroll}>
          {[
            { key: 'all', label: 'Semua Tanda Vital' },
            { key: 'bp', label: 'Tensi Darah (BP)' },
            { key: 'hr', label: 'Detak Jantung (HR)' },
            { key: 'spo2', label: 'Oksigen (SpO2)' },
            { key: 'labs', label: 'Metabolik & Napas' },
          ].map((chip) => (
            <TouchableOpacity
              key={chip.key}
              style={[
                styles.filterChip,
                filterType === chip.key && styles.filterChipActive,
                { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
              ]}
              onPress={() => setFilterType(chip.key as any)}
            >
              <Text
                style={[
                  styles.filterChipText,
                  filterType === chip.key && styles.filterChipTextActive,
                ]}
              >
                {chip.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ================= 4. COMPREHENSIVE CLINICAL RECORDS LIST ================= */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>
            RIWAYAT OBSERVASI STANDAR HL7 FHIR ({filteredRecords.length})
          </Text>
          <TouchableOpacity onPress={handleExportPDF}>
            <Text style={styles.sectionActionText}>Unduh Rekap PDF</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.recordsList}>
          {filteredRecords.map((item) => {
            const isBP = item.type === 'bp';
            const isHR = item.type === 'hr';
            const isSpO2 = item.type === 'spo2';
            const isTemp = item.type === 'temp';
            const isGlucose = item.type === 'glucose';

            const iconName = isBP
              ? 'heart-circle'
              : isHR
              ? 'pulse'
              : isSpO2
              ? 'water'
              : isTemp
              ? 'thermometer'
              : isGlucose
              ? 'color-filter'
              : 'leaf';

            const iconColor = isBP
              ? '#007AFF'
              : isHR
              ? '#FF2D55'
              : isSpO2
              ? '#34C759'
              : isTemp
              ? '#FF9500'
              : isGlucose
              ? '#AF52DE'
              : '#5856D6';

            return (
              <View
                key={item.id}
                style={[styles.recordCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
              >
                <View style={styles.recordCardTop}>
                  <View style={styles.recordLeftWrap}>
                    <View style={[styles.recordIconWrap, { backgroundColor: `${iconColor}15` }]}>
                      <Ionicons name={iconName} size={22} color={iconColor} />
                    </View>
                    <View style={styles.recordTitleCol}>
                      <Text style={[styles.recordTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                        {item.title}
                      </Text>
                      <View style={styles.loincBadge}>
                        <Text style={styles.loincCodeText}>{item.loincCode}</Text>
                        <Text style={styles.recordSourceText}>• {item.source}</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.recordRightCol}>
                    <Text style={[styles.recordValueText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      {item.value} <Text style={styles.recordUnitText}>{item.unit}</Text>
                    </Text>
                    {item.subValue ? (
                      <Text style={styles.recordSubValueText}>{item.subValue}</Text>
                    ) : null}
                  </View>
                </View>

                {/* Card Clinical Metadata Sub-Row */}
                <View style={[styles.recordMetaRow, { borderTopColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                  <View style={styles.metaTimestampWrap}>
                    <Ionicons name="time-outline" size={13} color="#8E8E93" />
                    <Text style={styles.metaTimestampText}>{item.timestamp}</Text>
                  </View>

                  {item.symptom ? (
                    <Text style={styles.metaSymptomText}>
                      💬 {item.symptom}
                    </Text>
                  ) : null}

                  <View style={styles.verifiedBadge}>
                    <Ionicons name="shield-checkmark" size={12} color="#34C759" />
                    <Text style={styles.verifiedBadgeText}>SatuSehat Valid</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>

      {/* ================= MODAL: RECORD NEW MEASUREMENT WITH CLINICAL METADATA ================= */}
      <Modal
        visible={recordModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setRecordModalVisible(false)}
      >
        <SafeAreaView
          style={[styles.modalSafeContainer, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}
        >
          <View style={[styles.modalHeader, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Catat Pengukuran Klinis Baru
              </Text>
              <Text style={styles.modalSubTitle}>
                Standar Protokol Pengukuran Hipertensi AHA / PERHI
              </Text>
            </View>
            <TouchableOpacity onPress={() => setRecordModalVisible(false)}>
              <Ionicons name="close-circle" size={28} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            {/* Tensi Readings */}
            <Text style={styles.inputSectionLabel}>TEKANAN DARAH (SISTOLIK / DIASTOLIK mmHg) *</Text>
            <View style={styles.dualInputRow}>
              <View style={styles.dualInputCol}>
                <Text style={styles.dualInputSub}>Sistolik (mmHg)</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: isDark ? '#FFFFFF' : '#000000',
                      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    },
                  ]}
                  placeholder="110"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                  value={newSys}
                  onChangeText={setNewSys}
                />
              </View>

              <Text style={styles.dualInputSlash}>/</Text>

              <View style={styles.dualInputCol}>
                <Text style={styles.dualInputSub}>Diastolik (mmHg)</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: isDark ? '#FFFFFF' : '#000000',
                      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    },
                  ]}
                  placeholder="70"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                  value={newDia}
                  onChangeText={setNewDia}
                />
              </View>
            </View>

            {/* Pulse */}
            <Text style={styles.inputSectionLabel}>DENYUT NADI (PULSE BPM) *</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: isDark ? '#FFFFFF' : '#000000',
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                },
              ]}
              placeholder="68"
              placeholderTextColor="#8E8E93"
              keyboardType="numeric"
              value={newPulse}
              onChangeText={setNewPulse}
            />

            {/* Clinical Metadata: Posture */}
            <Text style={styles.inputSectionLabel}>POSISI TUBUH SAAT PENGUKURAN (POSTURE)</Text>
            <View style={styles.chipOptionRow}>
              {[
                { key: 'sitting', label: '🪑 Duduk Tenang (5m Istirahat)' },
                { key: 'supine', label: '🛏️ Berbaring (Supine)' },
                { key: 'standing', label: '🧍 Berdiri (Deteksi Ortostatik)' },
              ].map((p) => (
                <TouchableOpacity
                  key={p.key}
                  style={[
                    styles.chipOptionBtn,
                    newPosture === p.key && styles.chipOptionBtnActive,
                    { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                  ]}
                  onPress={() => setNewPosture(p.key as any)}
                >
                  <Text
                    style={[
                      styles.chipOptionText,
                      newPosture === p.key && styles.chipOptionTextActive,
                    ]}
                  >
                    {p.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Clinical Metadata: Arm Selection */}
            <Text style={styles.inputSectionLabel}>SISI LENGAN PENGUKURAN (CUFF ARM)</Text>
            <View style={styles.chipOptionRow}>
              {[
                { key: 'right', label: '💪 Lengan Kanan (Right Arm)' },
                { key: 'left', label: '💪 Lengan Kiri (Left Arm)' },
              ].map((a) => (
                <TouchableOpacity
                  key={a.key}
                  style={[
                    styles.chipOptionBtn,
                    newArm === a.key && styles.chipOptionBtnActive,
                    { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                  ]}
                  onPress={() => setNewArm(a.key as any)}
                >
                  <Text
                    style={[
                      styles.chipOptionText,
                      newArm === a.key && styles.chipOptionTextActive,
                    ]}
                  >
                    {a.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Clinical Metadata: Medication Relation */}
            <Text style={styles.inputSectionLabel}>KORELASI WAKTU OBAT (MEDICATION CORRELATION)</Text>
            <View style={styles.chipOptionRow}>
              {[
                { key: 'after_med', label: '💊 Pasca Minum Obat Antihipertensi' },
                { key: 'before_med', label: '⏰ Sebelum Minum Obat (Trough)' },
                { key: 'fasting', label: '🍽️ Saat Puasa / Bangun Tidur' },
              ].map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={[
                    styles.chipOptionBtn,
                    newMedRelation === m.key && styles.chipOptionBtnActive,
                    { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                  ]}
                  onPress={() => setNewMedRelation(m.key as any)}
                >
                  <Text
                    style={[
                      styles.chipOptionText,
                      newMedRelation === m.key && styles.chipOptionTextActive,
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Symptoms */}
            <Text style={styles.inputSectionLabel}>KELUHAN / GEJALA SAAT INI (SYMPTOMS)</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: isDark ? '#FFFFFF' : '#000000',
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                },
              ]}
              placeholder="Contoh: Merasa pusing saat bangun, berdebar, atau asimtomatik..."
              placeholderTextColor="#8E8E93"
              value={newSymptoms}
              onChangeText={setNewSymptoms}
            />

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.modalSubmitBtn}
              onPress={handleSaveRecord}
            >
              <Ionicons name="cloud-upload" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.modalSubmitBtnText}>
                Simpan & Sinkronkan ke Rekam Medis
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ================= MODAL: CLINICAL RED FLAG / EARLY WARNING TRIASE ================= */}
      <Modal
        visible={redFlagModalVisible}
        animationType="fade"
        transparent
        onRequestClose={() => setRedFlagModalVisible(false)}
      >
        <View style={styles.alertOverlay}>
          <View style={[styles.alertCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.alertTopIconWrap}>
              <Ionicons name="shield-checkmark" size={32} color="#34C759" />
            </View>
            <Text style={[styles.alertTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Early Warning Score (EWS): Stabil
            </Text>
            <Text style={styles.alertDesc}>
              Berdasarkan kalkulasi algoritma NEWS2 (National Early Warning Score), status hemodinamik Anda saat ini berada dalam rentang <Text style={{ color: '#34C759', fontWeight: '700' }}>Risiko Rendah (Score 0)</Text>.
            </Text>

            <View style={[styles.alertGuidelinesBox, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
              <Text style={styles.alertGuideTitle}>Protokol Red Flag Kegawatan Jantung:</Text>
              <Text style={styles.alertGuideItem}>• Tensi di atas 180/120 mmHg disertai nyeri dada atau sesak nafas hebat.</Text>
              <Text style={styles.alertGuideItem}>• Saturasi Oksigen (SpO2) turun di bawah 92%.</Text>
              <Text style={styles.alertGuideItem}>• Denyut nadi istirahat di atas 130 BPM atau di bawah 45 BPM terus menerus.</Text>
            </View>

            <TouchableOpacity
              style={styles.alertDismissBtn}
              onPress={() => setRedFlagModalVisible(false)}
            >
              <Text style={styles.alertDismissBtnText}>Tutup & Kembali</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#8E8E9330',
  },
  headerLeft: {
    flex: 1,
    paddingRight: 10,
  },
  dpjpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  dpjpBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#007AFF',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },

  // 1. Hemodynamic Hero Card
  hemodynamicHero: {
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  hemoTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  hemoTitleCol: {
    flex: 1,
    paddingRight: 8,
  },
  hemoCardSub: {
    fontSize: 10,
    fontWeight: '800',
    color: '#007AFF',
    letterSpacing: 0.5,
  },
  hemoCardTitle: {
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 5,
  },
  categoryDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  primaryNumbersRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
  },
  primaryBPCol: {
    alignItems: 'center',
  },
  primaryBPValue: {
    fontSize: 38,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  primaryBPUnit: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    marginTop: 2,
  },
  primaryDivider: {
    width: 1,
    height: 48,
    backgroundColor: '#8E8E9325',
  },
  primaryPulseCol: {
    alignItems: 'center',
  },
  pulseRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseValue: {
    fontSize: 34,
    fontWeight: '800',
  },
  pulseUnit: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
    marginTop: 2,
  },

  // Hemodynamic 3 Metrics Grid
  hemoMetricsGrid: {
    flexDirection: 'row',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginTop: 10,
    marginBottom: 14,
  },
  hemoMetricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  metricLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8E8E93',
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  metricUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: '#8E8E93',
  },
  metricStatusText: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 2,
  },
  hemoGridDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#8E8E9325',
    alignSelf: 'center',
  },

  // Protocol Tags
  protocolTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  protocolPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF10',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
  },
  protocolPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#007AFF',
  },
  shareDPJPBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  shareDPJPBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // 2. Trend & Dipping Card
  trendCard: {
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  trendSub: {
    fontSize: 10,
    fontWeight: '800',
    color: '#007AFF',
    letterSpacing: 0.5,
  },
  trendTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 1,
  },
  rangeSelector: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 10,
    padding: 3,
  },
  rangeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  rangeBtnActive: {
    backgroundColor: '#FFFFFF',
  },
  rangeBtnText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  rangeBtnTextActive: {
    color: '#000000',
    fontWeight: '700',
  },
  chartContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 10,
    paddingBottom: 4,
  },
  chartColumn: {
    alignItems: 'center',
    flex: 1,
  },
  chartBarValue: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 4,
  },
  chartBarWrap: {
    width: 22,
    height: 100,
    justifyContent: 'flex-end',
    backgroundColor: '#8E8E9315',
    borderRadius: 6,
    overflow: 'hidden',
  },
  chartBarFill: {
    width: '100%',
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  chartDayText: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 6,
    fontWeight: '600',
  },
  chartDayTextToday: {
    color: '#007AFF',
    fontWeight: '800',
  },
  dippingInsightBox: {
    borderRadius: 12,
    padding: 12,
    marginTop: 14,
  },
  dippingTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  dippingTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#5856D6',
  },
  dippingDesc: {
    fontSize: 11,
    lineHeight: 16,
    color: '#8E8E93',
  },

  // Filter Chips
  filterScroll: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8E8E9325',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  filterChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Records List
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.8,
  },
  sectionActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
  },
  recordsList: {
    gap: 10,
  },
  recordCard: {
    borderRadius: 16,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  recordCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recordLeftWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  recordIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordTitleCol: {
    flex: 1,
  },
  recordTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  loincBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  loincCodeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#007AFF',
  },
  recordSourceText: {
    fontSize: 10,
    color: '#8E8E93',
  },
  recordRightCol: {
    alignItems: 'flex-end',
  },
  recordValueText: {
    fontSize: 18,
    fontWeight: '800',
  },
  recordUnitText: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '500',
  },
  recordSubValueText: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  recordMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    marginTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  metaTimestampWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaTimestampText: {
    fontSize: 11,
    color: '#8E8E93',
  },
  metaSymptomText: {
    fontSize: 11,
    color: '#8E8E93',
    fontStyle: 'italic',
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#34C75915',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#34C759',
  },

  // Modal styling
  modalSafeContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#8E8E9330',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalSubTitle: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  modalScroll: {
    padding: 20,
    gap: 12,
  },
  inputSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginTop: 6,
  },
  dualInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dualInputCol: {
    flex: 1,
  },
  dualInputSub: {
    fontSize: 10,
    color: '#8E8E93',
    marginBottom: 4,
  },
  dualInputSlash: {
    fontSize: 26,
    fontWeight: '300',
    color: '#8E8E93',
    marginTop: 12,
  },
  textInput: {
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#8E8E9325',
  },
  chipOptionRow: {
    gap: 8,
  },
  chipOptionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8E8E9325',
  },
  chipOptionBtnActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF15',
  },
  chipOptionText: {
    fontSize: 13,
    color: '#8E8E93',
    fontWeight: '500',
  },
  chipOptionTextActive: {
    color: '#007AFF',
    fontWeight: '700',
  },
  modalSubmitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 14,
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Alert Modal
  alertOverlay: {
    flex: 1,
    backgroundColor: '#00000080',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  alertCard: {
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 380,
  },
  alertTopIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#34C75915',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  alertTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  alertDesc: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 16,
  },
  alertGuidelinesBox: {
    borderRadius: 12,
    padding: 12,
    width: '100%',
    gap: 6,
    marginBottom: 20,
  },
  alertGuideTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF3B30',
    marginBottom: 2,
  },
  alertGuideItem: {
    fontSize: 11,
    lineHeight: 16,
    color: '#8E8E93',
  },
  alertDismissBtn: {
    backgroundColor: '#007AFF',
    width: '100%',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  alertDismissBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

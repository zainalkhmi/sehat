import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  TextInput,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface MedicationItem {
  id: string;
  name: string;
  brandName?: string;
  strength: string; // e.g. "5 mg"
  dosage: string; // e.g. "5 mg • 1 Tablet"
  dosePerIntake: number; // Berapa butir/tablet yang diset harus diminum setiap jadwal
  doseUnit: string; // 'Tablet', 'Kapsul', 'ml'
  frequency: string; // '1x Sehari', '2x Sehari', '3x Sehari'
  indication: string;
  timeOfDay: 'pagi' | 'siang' | 'malam' | 'tidur';
  scheduledTime: string;
  instruction: string; // e.g. "Sesudah Makan Pagi"
  remainingStock: number; // Sisa stok butir obat saat ini
  initialStock: number; // Stok awal obat saat ditebus
  minimumStockAlert: number; // Batas minimum untuk peringatan beli ulang
  expiryDate: string; // Tanggal kadaluarsa obat (YYYY-MM-DD)
  batchNumber?: string;
  prescribedBy?: string;
  status: 'taken' | 'pending' | 'skipped' | 'snoozed';
  takenAt?: string;
  color: string;
}

interface VitalRecord {
  id: string;
  date: string;
  time: string;
  systolic: number;
  diastolic: number;
  heartRate: number;
  oxygenSaturation: number; // SpO2 (%)
  bloodSugar?: number; // mg/dL
  temperature?: number; // °C
  source: 'ble' | 'wearable' | 'oximeter' | 'manual';
  deviceName?: string; // e.g. "Omron BP5250 (BLE)", "Apple Watch Series 9"
  notes?: string;
  status: 'optimal' | 'normal' | 'pre-hypertension' | 'high';
}

const INITIAL_MEDICATIONS: MedicationItem[] = [
  {
    id: 'med-1',
    name: 'Amlodipine Besylate',
    strength: '5 mg',
    dosage: '5 mg • 1 Tablet',
    dosePerIntake: 1,
    doseUnit: 'Tablet',
    frequency: '1x Sehari',
    indication: 'Kontrol Tekanan Darah (Antihipertensi)',
    timeOfDay: 'pagi',
    scheduledTime: '08:00 WIB',
    instruction: 'Sesudah Makan Pagi',
    remainingStock: 24,
    initialStock: 30,
    minimumStockAlert: 7,
    expiryDate: '2027-08-31',
    batchNumber: 'BATCH-AML-882',
    prescribedBy: 'dr. Budi Santoso, Sp.JP(K)',
    status: 'taken',
    takenAt: '08:05 WIB',
    color: '#007AFF',
  },
  {
    id: 'med-2',
    name: 'Metformin HCl',
    strength: '500 mg',
    dosage: '500 mg • 1 Tablet',
    dosePerIntake: 1,
    doseUnit: 'Tablet',
    frequency: '2x Sehari',
    indication: 'Kontrol Glukosa Darah',
    timeOfDay: 'siang',
    scheduledTime: '12:30 WIB',
    instruction: 'Bersama Makan Siang',
    remainingStock: 18,
    initialStock: 30,
    minimumStockAlert: 7,
    expiryDate: '2026-11-28', // Hampir Kadaluarsa (< 30 Hari untuk demo alert)
    batchNumber: 'BATCH-MET-104',
    prescribedBy: 'dr. Budi Santoso, Sp.JP(K)',
    status: 'taken',
    takenAt: '12:45 WIB',
    color: '#FF9500',
  },
  {
    id: 'med-3',
    name: 'Candesartan Cilexetil',
    strength: '8 mg',
    dosage: '8 mg • 1 Tablet',
    dosePerIntake: 1,
    doseUnit: 'Tablet',
    frequency: '1x Sehari',
    indication: 'Proteksi Kardiovaskular & Ginjal',
    timeOfDay: 'malam',
    scheduledTime: '20:00 WIB',
    instruction: 'Sesudah Makan Malam',
    remainingStock: 5, // Stok Menipis (< 7 butir untuk demo alert)
    initialStock: 30,
    minimumStockAlert: 7,
    expiryDate: '2027-12-15',
    batchNumber: 'BATCH-CAN-409',
    prescribedBy: 'dr. Budi Santoso, Sp.JP(K)',
    status: 'pending',
    color: '#FF2D55',
  },
  {
    id: 'med-4',
    name: 'Atorvastatin Calcium',
    strength: '20 mg',
    dosage: '20 mg • 1 Tablet',
    dosePerIntake: 1,
    doseUnit: 'Tablet',
    frequency: '1x Sehari',
    indication: 'Stabilisasi Kolesterol & Plak Pembuluh Darah',
    timeOfDay: 'tidur',
    scheduledTime: '21:30 WIB',
    instruction: 'Sebelum Tidur Malam',
    remainingStock: 14,
    initialStock: 30,
    minimumStockAlert: 7,
    expiryDate: '2028-02-20',
    batchNumber: 'BATCH-ATO-551',
    prescribedBy: 'dr. Budi Santoso, Sp.JP(K)',
    status: 'pending',
    color: '#AF52DE',
  },
];

const INITIAL_VITALS: VitalRecord[] = [
  {
    id: 'vit-1',
    date: 'Hari Ini',
    time: '08:15 WIB',
    systolic: 103,
    diastolic: 64,
    heartRate: 62,
    oxygenSaturation: 98,
    bloodSugar: 98,
    temperature: 36.5,
    source: 'ble',
    deviceName: 'Omron BP5250 & Apple Watch',
    notes: 'Pengukuran rutin pagi otomatis dari tensimeter BLE & wearable',
    status: 'optimal',
  },
  {
    id: 'vit-2',
    date: 'Kemarin',
    time: '20:10 WIB',
    systolic: 112,
    diastolic: 74,
    heartRate: 68,
    oxygenSaturation: 99,
    bloodSugar: 115,
    temperature: 36.6,
    source: 'wearable',
    deviceName: 'Apple Watch Series 9',
    notes: 'Telemetri otomatis malam pasca minum Candesartan',
    status: 'optimal',
  },
  {
    id: 'vit-3',
    date: '5 Nov 2026',
    time: '08:00 WIB',
    systolic: 118,
    diastolic: 76,
    heartRate: 72,
    oxygenSaturation: 98,
    bloodSugar: 102,
    temperature: 36.4,
    source: 'oximeter',
    deviceName: 'Beurer PO 30 Pulse Oximeter & BLE Cuff',
    notes: 'Kondisi relaks, istirahat cukup',
    status: 'normal',
  },
];

// Helper: Calculate Expiry Status
function getExpiryInfo(expiryDateStr: string) {
  const exp = new Date(expiryDateStr);
  const now = new Date();
  const diffDays = Math.ceil((exp.getTime() - now.getTime()) / (1000 * 3600 * 24));

  if (diffDays < 0) {
    return {
      status: 'expired' as const,
      label: 'KADALUARSA!',
      sub: `Kadaluarsa ${Math.abs(diffDays)} hari lalu (Jangan Diminum)`,
      color: '#FF3B30',
      bgColor: '#FF3B3015',
    };
  }
  if (diffDays <= 30) {
    return {
      status: 'warning' as const,
      label: 'Hampir Kadaluarsa',
      sub: `Sisa ${diffDays} hari lagi (${exp.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })})`,
      color: '#FF9500',
      bgColor: '#FF950015',
    };
  }
  return {
    status: 'safe' as const,
    label: `Exp: ${exp.toLocaleDateString('id-ID', { month: 'short', year: 'numeric' })}`,
    sub: 'Obat dalam kondisi aman',
    color: '#34C759',
    bgColor: '#34C75915',
  };
}

// Helper: Calculate Stock Status
function getStockInfo(currentStock: number, alertThreshold: number = 7) {
  if (currentStock <= 0) {
    return {
      status: 'empty' as const,
      label: 'Stok Habis (0 butir)',
      sub: 'Segera minta resep ulang ke dokter',
      color: '#FF3B30',
      bgColor: '#FF3B3015',
    };
  }
  if (currentStock <= alertThreshold) {
    return {
      status: 'low' as const,
      label: `Sisa ${currentStock} butir (Menipis)`,
      sub: `Cukup untuk ~${currentStock} hari • Perlu beli ulang`,
      color: '#FF9500',
      bgColor: '#FF950015',
    };
  }
  return {
    status: 'safe' as const,
    label: `Sisa ${currentStock} butir`,
    sub: `Cukup untuk ~${currentStock} hari terapi`,
    color: '#34C759',
    bgColor: '#34C75915',
  };
}

export default function TherapyControlScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'meds' | 'vitals' | 'habits' | 'report'>('vitals');

  // Medications state
  const [medications, setMedications] = useState<MedicationItem[]>(INITIAL_MEDICATIONS);
  const [addMedModalVisible, setAddMedModalVisible] = useState(false);
  const [restockModalVisible, setRestockModalVisible] = useState(false);
  const [selectedMedForRestock, setSelectedMedForRestock] = useState<MedicationItem | null>(null);
  const [restockAmount, setRestockAmount] = useState('30');

  // New med form
  const [newMedName, setNewMedName] = useState('');
  const [newMedStrength, setNewMedStrength] = useState('5 mg');
  const [newDosePerIntake, setNewDosePerIntake] = useState('1');
  const [newDoseUnit, setNewDoseUnit] = useState('Tablet');
  const [newFrequency, setNewFrequency] = useState('1x Sehari');
  const [newMedTime, setNewMedTime] = useState('08:00 WIB');
  const [newMedInstruction, setNewMedInstruction] = useState('Sesudah Makan');
  const [newMedStock, setNewMedStock] = useState('30');
  const [newMinAlert, setNewMinAlert] = useState('7');
  const [newExpiryDate, setNewExpiryDate] = useState('2027-12-31');

  // Vitals state
  const [vitals, setVitals] = useState<VitalRecord[]>(INITIAL_VITALS);
  const [addVitalModalVisible, setAddVitalModalVisible] = useState(false);
  const [deviceSyncModalVisible, setDeviceSyncModalVisible] = useState(false);
  const [isSyncingDevices, setIsSyncingDevices] = useState(false);

  // New vital form (Manual)
  const [newSystolic, setNewSystolic] = useState('110');
  const [newDiastolic, setNewDiastolic] = useState('70');
  const [newHeartRate, setNewHeartRate] = useState('68');
  const [newOxygen, setNewOxygen] = useState('98');
  const [newBloodSugar, setNewBloodSugar] = useState('100');
  const [newTemperature, setNewTemperature] = useState('36.5');
  const [newVitalNotes, setNewVitalNotes] = useState('');
  const [newVitalSource, setNewVitalSource] = useState<'ble' | 'wearable' | 'oximeter' | 'manual'>('manual');

  // Daily Habits state
  const [waterGlasses, setWaterGlasses] = useState(6);
  const [walkingMinutes, setWalkingMinutes] = useState(25);
  const [mindfulnessDone, setMindfulnessDone] = useState(true);

  // Calculate adherence
  const totalMeds = medications.length;
  const takenMeds = medications.filter((m) => m.status === 'taken').length;
  const adherenceRate = Math.round((takenMeds / totalMeds) * 100);

  // Handle Mark Medication Intake
  const handleMarkMedication = (id: string, status: 'taken' | 'skipped' | 'snoozed' | 'pending') => {
    setMedications((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          const now = new Date();
          const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
          // Reduce stock by dosePerIntake when taken
          const updatedStock =
            status === 'taken'
              ? Math.max(0, med.remainingStock - med.dosePerIntake)
              : med.status === 'taken' && status === 'pending'
              ? med.remainingStock + med.dosePerIntake
              : med.remainingStock;

          return {
            ...med,
            status,
            takenAt: status === 'taken' ? timeStr : undefined,
            remainingStock: updatedStock,
          };
        }
        return med;
      })
    );

    if (status === 'taken') {
      const targetMed = medications.find((m) => m.id === id);
      const remainingAfter = targetMed ? Math.max(0, targetMed.remainingStock - targetMed.dosePerIntake) : 0;
      Alert.alert(
        '✅ Obat Berhasil Diminum',
        `Tercatat diminum ${targetMed?.dosePerIntake || 1} ${targetMed?.doseUnit || 'Tablet'}. Sisa stok di database: ${remainingAfter} butir. Data disinkronkan ke rekam medis Supabase.`
      );
    } else if (status === 'skipped') {
      Alert.alert('⏭️ Obat Dilewati', 'Status lewati telah dicatat dalam jurnal kepatuhan harian.');
    } else if (status === 'snoozed') {
      Alert.alert('⏰ Pengingat Ditunda', 'Aplikasi akan mengingatkan kembali dalam 15 menit.');
    }
  };

  // Handle Restock Medication
  const handleConfirmRestock = () => {
    if (!selectedMedForRestock) return;
    const addCount = parseInt(restockAmount, 10) || 0;
    if (addCount <= 0) {
      Alert.alert('Jumlah Tidak Valid', 'Masukkan jumlah butir restok yang valid.');
      return;
    }

    setMedications((prev) =>
      prev.map((m) =>
        m.id === selectedMedForRestock.id
          ? { ...m, remainingStock: m.remainingStock + addCount }
          : m
      )
    );

    setRestockModalVisible(false);
    Alert.alert(
      '📦 Stok Berhasil Diperbarui',
      `Stok ${selectedMedForRestock.name} bertambah +${addCount} butir. Total stok sekarang: ${selectedMedForRestock.remainingStock + addCount} butir. Tersimpan ke database Supabase.`
    );
  };

  // Handle Add New Medication
  const handleAddMedication = () => {
    if (!newMedName.trim()) {
      Alert.alert('Data Belum Lengkap', 'Masukkan nama obat.');
      return;
    }
    const doseNum = parseFloat(newDosePerIntake) || 1;
    const initialStk = parseInt(newMedStock, 10) || 30;
    const minAlert = parseInt(newMinAlert, 10) || 7;

    const newMed: MedicationItem = {
      id: `med-${Date.now()}`,
      name: newMedName.trim(),
      strength: newMedStrength.trim() || '5 mg',
      dosage: `${newMedStrength.trim()} • ${doseNum} ${newDoseUnit}`,
      dosePerIntake: doseNum,
      doseUnit: newDoseUnit,
      frequency: newFrequency,
      indication: 'Terapi Resep Pasien',
      timeOfDay: 'pagi',
      scheduledTime: newMedTime,
      instruction: newMedInstruction,
      remainingStock: initialStk,
      initialStock: initialStk,
      minimumStockAlert: minAlert,
      expiryDate: newExpiryDate || '2027-12-31',
      prescribedBy: 'dr. Budi Santoso, Sp.JP(K)',
      status: 'pending',
      color: '#007AFF',
    };

    setMedications((prev) => [...prev, newMed]);
    setAddMedModalVisible(false);
    setNewMedName('');
    Alert.alert('Obat Berhasil Ditambahkan', `Pengingat dan kontrol stok untuk ${newMed.name} telah aktif di database.`);
  };

  // Handle Sync Vitals From Connected BLE & Wearables
  const handleTriggerDeviceSync = () => {
    setIsSyncingDevices(true);
    setDeviceSyncModalVisible(true);

    // Simulate real BLE / HealthKit handshake reading
    setTimeout(() => {
      setIsSyncingDevices(false);
    }, 1200);
  };

  // Confirm Apply Device Telemetry
  const handleApplyDeviceTelemetry = () => {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    const newRecord: VitalRecord = {
      id: `vit-${Date.now()}`,
      date: 'Hari Ini',
      time: timeStr,
      systolic: 103,
      diastolic: 64,
      heartRate: 62,
      oxygenSaturation: 98,
      bloodSugar: 98,
      temperature: 36.5,
      source: 'ble',
      deviceName: 'Omron BP5250 & Apple Watch (BLE Sync)',
      notes: 'Telemetri otomatis dari Omron BP5250 (Tensi/Nadi) & Apple Watch (SpO2/Suhu)',
      status: 'optimal',
    };

    setVitals((prev) => [newRecord, ...prev]);
    setDeviceSyncModalVisible(false);
    Alert.alert(
      'Telemetri Device Tersimpan',
      'Data Tensi (103/64 mmHg), Heart Rate (62 BPM), Saturasi Oksigen (98% SpO2), dan Gula Darah (98 mg/dL) berhasil ditarik dari Omron BP5250 & Apple Watch serta dicatat ke rekam medis Supabase.'
    );
  };

  // Handle Add Manual Vital Record
  const handleAddVital = () => {
    const sys = parseInt(newSystolic, 10) || 120;
    const dia = parseInt(newDiastolic, 10) || 80;
    const hr = parseInt(newHeartRate, 10) || 72;
    const ox = parseInt(newOxygen, 10) || 98;
    const bs = parseInt(newBloodSugar, 10) || 100;
    const temp = parseFloat(newTemperature) || 36.5;

    let status: VitalRecord['status'] = 'optimal';
    if (sys >= 140 || dia >= 90) status = 'high';
    else if (sys >= 130 || dia >= 80) status = 'pre-hypertension';
    else if (sys >= 120) status = 'normal';

    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;

    const newRec: VitalRecord = {
      id: `vit-${Date.now()}`,
      date: 'Hari Ini',
      time: timeStr,
      systolic: sys,
      diastolic: dia,
      heartRate: hr,
      oxygenSaturation: ox,
      bloodSugar: bs,
      temperature: temp,
      source: newVitalSource,
      deviceName:
        newVitalSource === 'ble'
          ? 'Omron BP5250 BLE'
          : newVitalSource === 'wearable'
          ? 'Apple Watch Series 9'
          : newVitalSource === 'oximeter'
          ? 'Pulse Oximeter BLE'
          : 'Input Manual Pasien',
      notes: newVitalNotes.trim() || 'Pencatatan vital harian',
      status,
    };

    setVitals((prev) => [newRec, ...prev]);
    setAddVitalModalVisible(false);
    setNewVitalNotes('');
    Alert.alert(
      'Vital Signs Tersimpan',
      `Tensi ${sys}/${dia} mmHg (${status.toUpperCase()}), Detak Jantung ${hr} BPM, dan SpO2 ${ox}% berhasil dicatat ke rekam medis Supabase.`
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <View style={styles.headerBadge}>
            <Ionicons name="shield-checkmark" size={13} color="#007AFF" />
            <Text style={styles.headerBadgeText}>SEHAT • MYTHERAPY CARE</Text>
          </View>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Kontrol Obat, Stok & Vital
          </Text>
        </View>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            if (activeTab === 'vitals') setAddVitalModalVisible(true);
            else setAddMedModalVisible(true);
          }}
        >
          <Ionicons name="add-circle" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Database Sync Status Badge */}
      <View style={[styles.dbStatusBar, { backgroundColor: isDark ? '#141416' : '#FFFFFF' }]}>
        <View style={styles.dbStatusLeft}>
          <View style={styles.dbDot} />
          <Text style={styles.dbStatusText}>
            Terkoneksi ke Supabase DB (patient_medications & observations)
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => Alert.alert('Status Database', 'Tersinkronisasi secara aman sesuai UU PDP No. 27/2022 & HL7 FHIR Observation / MedicationRequest.')}
        >
          <Ionicons name="cloud-done" size={16} color="#34C759" />
        </TouchableOpacity>
      </View>

      {/* Daily Progress & Adherence Banner */}
      <View style={[styles.adherenceBanner, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
        <View style={styles.adherenceLeft}>
          <View style={styles.streakBadge}>
            <Ionicons name="flame" size={14} color="#FF9500" />
            <Text style={styles.streakText}>7 Hari Berturut-turut Patuh</Text>
          </View>
          <Text style={[styles.adherenceTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            {takenMeds} dari {totalMeds} Terapi Selesai
          </Text>
          <Text style={styles.adherenceSub}>
            Kepatuhan Anda hari ini berada di level <Text style={{ color: '#34C759', fontWeight: '700' }}>{adherenceRate}% (Sangat Baik)</Text>
          </Text>
        </View>

        <View style={styles.adherenceCircleWrap}>
          <View style={styles.adherenceCircle}>
            <Text style={styles.adherencePercentText}>{adherenceRate}%</Text>
            <Text style={styles.adherencePercentSub}>Patuh</Text>
          </View>
        </View>
      </View>

      {/* Segment Tabs Control */}
      <View style={[styles.tabBar, { backgroundColor: isDark ? '#141416' : '#FFFFFF' }]}>
        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'meds' && styles.tabItemActive]}
          onPress={() => setActiveTab('meds')}
        >
          <Ionicons
            name="medkit"
            size={16}
            color={activeTab === 'meds' ? '#007AFF' : '#8E8E93'}
          />
          <Text
            style={[styles.tabItemText, activeTab === 'meds' && styles.tabItemTextActive]}
          >
            Obat ({medications.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'vitals' && styles.tabItemActive]}
          onPress={() => setActiveTab('vitals')}
        >
          <Ionicons
            name="pulse"
            size={16}
            color={activeTab === 'vitals' ? '#007AFF' : '#8E8E93'}
          />
          <Text
            style={[styles.tabItemText, activeTab === 'vitals' && styles.tabItemTextActive]}
          >
            Tensi & Vital
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'habits' && styles.tabItemActive]}
          onPress={() => setActiveTab('habits')}
        >
          <Ionicons
            name="fitness"
            size={16}
            color={activeTab === 'habits' ? '#007AFF' : '#8E8E93'}
          />
          <Text
            style={[styles.tabItemText, activeTab === 'habits' && styles.tabItemTextActive]}
          >
            Kebiasaan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tabItem, activeTab === 'report' && styles.tabItemActive]}
          onPress={() => setActiveTab('report')}
        >
          <Ionicons
            name="document-text"
            size={16}
            color={activeTab === 'report' ? '#007AFF' : '#8E8E93'}
          />
          <Text
            style={[styles.tabItemText, activeTab === 'report' && styles.tabItemTextActive]}
          >
            Laporan
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ================= TAB 1: MEDICATIONS ================= */}
        {activeTab === 'meds' && (
          <View style={styles.sectionWrap}>
            {/* Low Stock or Expired Warning Banners */}
            {medications.some((m) => m.remainingStock <= m.minimumStockAlert) && (
              <View style={[styles.stockAlertBox, { backgroundColor: '#FF950015' }]}>
                <Ionicons name="warning" size={20} color="#FF9500" />
                <View style={styles.stockAlertTextWrap}>
                  <Text style={styles.stockAlertTitle}>Peringatan Sisa Stok Obat Menipis</Text>
                  <Text style={styles.stockAlertSub}>
                    Stok Candesartan 8mg tersisa 5 butir (di bawah ambang 7 butir). Segera minta resep ulang ke dr. Budi Santoso via Halo Dokter.
                  </Text>
                </View>
              </View>
            )}

            {medications.some((m) => getExpiryInfo(m.expiryDate).status === 'warning') && (
              <View style={[styles.stockAlertBox, { backgroundColor: '#FF950015' }]}>
                <Ionicons name="time" size={20} color="#FF9500" />
                <View style={styles.stockAlertTextWrap}>
                  <Text style={styles.stockAlertTitle}>Obat Mendekati Tanggal Kadaluarsa</Text>
                  <Text style={styles.stockAlertSub}>
                    Metformin 500mg akan kadaluarsa dalam kurun 30 hari ke depan (28 Nov 2026). Periksa kemasan sebelum diminum.
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>JADWAL & KONTROL STOK OBAT PASIEN</Text>
              <TouchableOpacity onPress={() => setAddMedModalVisible(true)}>
                <Text style={styles.sectionActionText}>+ Tambah Obat</Text>
              </TouchableOpacity>
            </View>

            {medications.map((med) => {
              const isTaken = med.status === 'taken';
              const isSkipped = med.status === 'skipped';
              const expInfo = getExpiryInfo(med.expiryDate);
              const stockInfo = getStockInfo(med.remainingStock, med.minimumStockAlert);

              return (
                <View
                  key={med.id}
                  style={[
                    styles.medCard,
                    { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                    isTaken && { borderColor: '#34C75930', borderWidth: 1.5 },
                  ]}
                >
                  {/* Top: Icon, Names & Status */}
                  <View style={styles.medCardTop}>
                    <View style={styles.medCardHeaderLeft}>
                      <View style={[styles.medIconWrap, { backgroundColor: `${med.color}15` }]}>
                        <Ionicons name="medical" size={22} color={med.color} />
                      </View>
                      <View style={styles.medTitleCol}>
                        <View style={styles.medNameRow}>
                          <Text style={[styles.medName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                            {med.name}
                          </Text>
                        </View>
                        <Text style={styles.medIndication}>{med.indication}</Text>
                        <Text style={styles.medDoctorTag}>
                          🩺 Resep: {med.prescribedBy || 'dr. Budi Santoso, Sp.JP(K)'}
                        </Text>
                      </View>
                    </View>

                    {/* Status Badge */}
                    <View
                      style={[
                        styles.medStatusBadge,
                        {
                          backgroundColor: isTaken
                            ? '#34C75918'
                            : isSkipped
                            ? '#FF3B3018'
                            : '#FF950018',
                        },
                      ]}
                    >
                      <Ionicons
                        name={isTaken ? 'checkmark-circle' : isSkipped ? 'close-circle' : 'time'}
                        size={12}
                        color={isTaken ? '#34C759' : isSkipped ? '#FF3B30' : '#FF9500'}
                      />
                      <Text
                        style={[
                          styles.medStatusBadgeText,
                          { color: isTaken ? '#34C759' : isSkipped ? '#FF3B30' : '#FF9500' },
                        ]}
                      >
                        {isTaken ? `Diminum ${med.takenAt || ''}` : isSkipped ? 'Dilewati' : 'Belum'}
                      </Text>
                    </View>
                  </View>

                  {/* Middle Control Box: Dosage Diset, Stok & Kadaluarsa */}
                  <View style={[styles.medControlGrid, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                    {/* 1. Aturan Dosis yang Diset */}
                    <View style={styles.controlGridItem}>
                      <View style={styles.controlGridLabelRow}>
                        <Ionicons name="bandage-outline" size={12} color="#007AFF" />
                        <Text style={styles.controlGridLabel}>DOSIS DISET</Text>
                      </View>
                      <Text style={[styles.controlGridValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                        {med.dosePerIntake} {med.doseUnit} ({med.strength})
                      </Text>
                      <Text style={styles.controlGridSub}>
                        {med.frequency} • {med.instruction}
                      </Text>
                    </View>

                    <View style={styles.controlGridDivider} />

                    {/* 2. Sisa Stok Obat */}
                    <View style={styles.controlGridItem}>
                      <View style={styles.controlGridLabelRow}>
                        <Ionicons name="cube-outline" size={12} color={stockInfo.color} />
                        <Text style={[styles.controlGridLabel, { color: stockInfo.color }]}>
                          STOK TERSISA
                        </Text>
                      </View>
                      <Text style={[styles.controlGridValue, { color: stockInfo.color }]}>
                        {med.remainingStock} Butir
                      </Text>
                      <Text style={styles.controlGridSub}>{stockInfo.sub}</Text>
                    </View>

                    <View style={styles.controlGridDivider} />

                    {/* 3. Tanggal Kadaluarsa */}
                    <View style={styles.controlGridItem}>
                      <View style={styles.controlGridLabelRow}>
                        <Ionicons name="calendar-outline" size={12} color={expInfo.color} />
                        <Text style={[styles.controlGridLabel, { color: expInfo.color }]}>
                          KADALUARSA
                        </Text>
                      </View>
                      <Text style={[styles.controlGridValue, { color: expInfo.color }]}>
                        {expInfo.label}
                      </Text>
                      <Text numberOfLines={1} style={styles.controlGridSub}>
                        {expInfo.sub}
                      </Text>
                    </View>
                  </View>

                  {/* Bottom: Restock Button & Intake Action */}
                  <View style={styles.medCardBottom}>
                    <TouchableOpacity
                      style={styles.restockQuickBtn}
                      onPress={() => {
                        setSelectedMedForRestock(med);
                        setRestockAmount('30');
                        setRestockModalVisible(true);
                      }}
                    >
                      <Ionicons name="add-circle-outline" size={14} color="#007AFF" />
                      <Text style={styles.restockQuickBtnText}>+ Restok Obat</Text>
                    </TouchableOpacity>

                    <View style={styles.medActionButtonsRow}>
                      {!isTaken && (
                        <>
                          <TouchableOpacity
                            style={[styles.medBtnSmall, { backgroundColor: '#8E8E9320' }]}
                            onPress={() => handleMarkMedication(med.id, 'skipped')}
                          >
                            <Text style={styles.medBtnSmallText}>Lewati</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={[styles.medBtnSmall, { backgroundColor: '#FF950020' }]}
                            onPress={() => handleMarkMedication(med.id, 'snoozed')}
                          >
                            <Text style={[styles.medBtnSmallText, { color: '#FF9500' }]}>Tunda 15m</Text>
                          </TouchableOpacity>
                        </>
                      )}

                      <TouchableOpacity
                        activeOpacity={0.8}
                        style={[
                          styles.medTakeBtn,
                          { backgroundColor: isTaken ? '#34C759' : '#007AFF' },
                        ]}
                        onPress={() => handleMarkMedication(med.id, isTaken ? 'pending' : 'taken')}
                      >
                        <Ionicons
                          name={isTaken ? 'checkmark-circle' : 'radio-button-off'}
                          size={16}
                          color="#FFFFFF"
                        />
                        <Text style={styles.medTakeBtnText}>
                          {isTaken ? 'Sudah Diminum' : `Minum ${med.dosePerIntake} ${med.doseUnit}`}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ================= TAB 2: VITALS & BLOOD PRESSURE (BLE & WEARABLE) ================= */}
        {activeTab === 'vitals' && (
          <View style={styles.sectionWrap}>
            {/* HERO ACTION: DUAL SYNC OR MANUAL INPUT */}
            <View style={styles.vitalsActionContainer}>
              {/* Primary Card: Sync from Device & Wearables */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={[styles.syncDeviceHeroCard, { backgroundColor: '#007AFF' }]}
                onPress={handleTriggerDeviceSync}
              >
                <View style={styles.syncDeviceHeroTop}>
                  <View style={styles.syncDeviceIconWrap}>
                    <Ionicons name="bluetooth" size={24} color="#007AFF" />
                  </View>
                  <View style={styles.syncDeviceStatusBadge}>
                    <View style={styles.syncDeviceDot} />
                    <Text style={styles.syncDeviceStatusText}>2 Perangkat Terkoneksi</Text>
                  </View>
                </View>

                <View style={styles.syncDeviceHeroBody}>
                  <Text style={styles.syncDeviceHeroTitle}>
                    Tarik Data dari Device & Wearable
                  </Text>
                  <Text style={styles.syncDeviceHeroSub}>
                    Ambil Tensi, Detak Jantung, Oksigen SpO2 & Gula Darah otomatis via Omron BLE & Smartwatch
                  </Text>
                </View>

                <View style={styles.syncDeviceHeroFooter}>
                  <View style={styles.syncDeviceTagsRow}>
                    <Text style={styles.syncDeviceTag}>🩺 Omron BP5250</Text>
                    <Text style={styles.syncDeviceTag}>⌚ Apple Watch</Text>
                    <Text style={styles.syncDeviceTag}>💨 Pulse Oximeter</Text>
                  </View>
                  <View style={styles.syncDeviceArrowWrap}>
                    <Ionicons name="cloud-download-outline" size={20} color="#FFFFFF" />
                  </View>
                </View>
              </TouchableOpacity>

              {/* Quick Manual Input Pill Button */}
              <TouchableOpacity
                activeOpacity={0.8}
                style={[
                  styles.manualInputPillBtn,
                  { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                ]}
                onPress={() => setAddVitalModalVisible(true)}
              >
                <Ionicons name="create-outline" size={18} color="#007AFF" />
                <Text style={styles.manualInputPillText}>Atau Input Pengukuran Manual</Text>
              </TouchableOpacity>
            </View>

            {/* History Section Header */}
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>RIWAYAT PENGUKURAN VITAL LENGKAP</Text>
              <TouchableOpacity onPress={() => setAddVitalModalVisible(true)}>
                <Text style={styles.sectionActionText}>+ Catat Baru</Text>
              </TouchableOpacity>
            </View>

            {/* List of Vital Records with Full Parameters */}
            {vitals.map((item) => (
              <View
                key={item.id}
                style={[styles.vitalCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
              >
                {/* Header Row: DateTime, Source Device & Status */}
                <View style={styles.vitalCardHeader}>
                  <View style={styles.vitalHeaderLeftCol}>
                    <View style={styles.vitalDateTimeWrap}>
                      <Ionicons name="calendar-outline" size={13} color="#8E8E93" />
                      <Text style={styles.vitalDateText}>
                        {item.date} • {item.time}
                      </Text>
                    </View>

                    {/* Source Device Badge */}
                    <View style={styles.vitalSourceBadge}>
                      <Ionicons
                        name={
                          item.source === 'ble'
                            ? 'bluetooth'
                            : item.source === 'wearable'
                            ? 'watch-outline'
                            : item.source === 'oximeter'
                            ? 'pulse'
                            : 'pencil'
                        }
                        size={12}
                        color="#007AFF"
                      />
                      <Text style={styles.vitalSourceText}>
                        {item.deviceName || (item.source === 'ble' ? 'Tensimeter BLE' : 'Manual')}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.vitalStatusBadge,
                      {
                        backgroundColor:
                          item.status === 'optimal'
                            ? '#34C75918'
                            : item.status === 'normal'
                            ? '#007AFF18'
                            : '#FF950018',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.vitalStatusBadgeText,
                        {
                          color:
                            item.status === 'optimal'
                              ? '#34C759'
                              : item.status === 'normal'
                              ? '#007AFF'
                              : '#FF9500',
                        },
                      ]}
                    >
                      {item.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Grid of 4 Complete Parameters: Tensi, Detak Jantung, Oksigen, Gula Darah */}
                <View style={[styles.vitalMeasurementsGrid, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                  {/* Parameter 1: Tensi Darah */}
                  <View style={styles.vitalGridItem}>
                    <View style={styles.vitalGridLabelRow}>
                      <Ionicons name="heart-circle" size={13} color="#FF2D55" />
                      <Text style={styles.vitalGridLabel}>Tensi Darah</Text>
                    </View>
                    <Text style={[styles.vitalGridValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      {item.systolic}/{item.diastolic}
                    </Text>
                    <Text style={styles.vitalGridUnit}>mmHg</Text>
                  </View>

                  <View style={styles.vitalGridDivider} />

                  {/* Parameter 2: Detak Jantung (Pulse) */}
                  <View style={styles.vitalGridItem}>
                    <View style={styles.vitalGridLabelRow}>
                      <Ionicons name="pulse" size={13} color="#007AFF" />
                      <Text style={styles.vitalGridLabel}>Detak Jantung</Text>
                    </View>
                    <Text style={[styles.vitalGridValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      {item.heartRate}
                    </Text>
                    <Text style={styles.vitalGridUnit}>BPM</Text>
                  </View>

                  <View style={styles.vitalGridDivider} />

                  {/* Parameter 3: Saturasi Oksigen (SpO2) */}
                  <View style={styles.vitalGridItem}>
                    <View style={styles.vitalGridLabelRow}>
                      <Ionicons name="water" size={13} color="#34C759" />
                      <Text style={styles.vitalGridLabel}>Oksigen SpO2</Text>
                    </View>
                    <Text style={[styles.vitalGridValue, { color: '#34C759' }]}>
                      {item.oxygenSaturation || 98}%
                    </Text>
                    <Text style={styles.vitalGridUnit}>Saturasi O2</Text>
                  </View>

                  <View style={styles.vitalGridDivider} />

                  {/* Parameter 4: Gula Darah */}
                  <View style={styles.vitalGridItem}>
                    <View style={styles.vitalGridLabelRow}>
                      <Ionicons name="color-filter-outline" size={13} color="#FF9500" />
                      <Text style={styles.vitalGridLabel}>Gula Darah</Text>
                    </View>
                    <Text style={[styles.vitalGridValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      {item.bloodSugar || 98}
                    </Text>
                    <Text style={styles.vitalGridUnit}>mg/dL</Text>
                  </View>
                </View>

                {/* Card Footer: Temperature, Notes & Supabase Sync */}
                <View style={styles.vitalCardFooter}>
                  <View style={styles.vitalFooterLeft}>
                    <Text style={styles.vitalTempText}>🌡️ {item.temperature || 36.5} °C</Text>
                    {item.notes ? (
                      <Text numberOfLines={1} style={styles.vitalNotesText}>
                        📝 {item.notes}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.vitalSyncedTag}>
                    <Ionicons name="cloud-done" size={12} color="#34C759" />
                    <Text style={styles.vitalSyncedTagText}>Supabase DB</Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* ================= TAB 3: DAILY HABITS & ACTIVITIES ================= */}
        {activeTab === 'habits' && (
          <View style={styles.sectionWrap}>
            {/* Water Tracker */}
            <View style={[styles.habitCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
              <View style={styles.habitTopRow}>
                <View style={[styles.habitIconWrap, { backgroundColor: '#007AFF15' }]}>
                  <Ionicons name="water" size={24} color="#007AFF" />
                </View>
                <View style={styles.habitInfo}>
                  <Text style={[styles.habitTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    Asupan Air Putih
                  </Text>
                  <Text style={styles.habitSub}>Target: 2000 ml (8 Gelas) per hari</Text>
                </View>
                <Text style={styles.habitProgressText}>{waterGlasses * 250} ml</Text>
              </View>

              <View style={styles.waterControlsRow}>
                <TouchableOpacity
                  style={[styles.waterStepBtn, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}
                  onPress={() => setWaterGlasses((prev) => Math.max(0, prev - 1))}
                >
                  <Ionicons name="remove" size={20} color={isDark ? '#FFF' : '#000'} />
                </TouchableOpacity>

                <Text style={[styles.waterCountText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  {waterGlasses} / 8 Gelas
                </Text>

                <TouchableOpacity
                  style={[styles.waterStepBtn, { backgroundColor: '#007AFF' }]}
                  onPress={() => setWaterGlasses((prev) => Math.min(12, prev + 1))}
                >
                  <Ionicons name="add" size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Walking Cardio Tracker */}
            <View style={[styles.habitCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
              <View style={styles.habitTopRow}>
                <View style={[styles.habitIconWrap, { backgroundColor: '#34C75915' }]}>
                  <Ionicons name="walk" size={24} color="#34C759" />
                </View>
                <View style={styles.habitInfo}>
                  <Text style={[styles.habitTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    Aktivitas Jalan Santai
                  </Text>
                  <Text style={styles.habitSub}>Target: 30 Menit Olahraga Ringan</Text>
                </View>
                <Text style={styles.habitProgressText}>{walkingMinutes} / 30 m</Text>
              </View>

              <View style={styles.progressBarWrap}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.min(100, (walkingMinutes / 30) * 100)}%` },
                  ]}
                />
              </View>

              <View style={styles.habitBottomActionRow}>
                <TouchableOpacity
                  style={[styles.habitActionBtn, { backgroundColor: '#34C75915' }]}
                  onPress={() => setWalkingMinutes((prev) => Math.min(60, prev + 10))}
                >
                  <Ionicons name="add-circle-outline" size={16} color="#34C759" />
                  <Text style={[styles.habitActionBtnText, { color: '#34C759' }]}>+ 10 Menit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.habitActionBtn, { backgroundColor: '#34C759' }]}
                  onPress={() => setWalkingMinutes(30)}
                >
                  <Ionicons name="checkmark-done" size={16} color="#FFFFFF" />
                  <Text style={[styles.habitActionBtnText, { color: '#FFFFFF' }]}>Target Tercapai</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Mindfulness / Breathing */}
            <View style={[styles.habitCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
              <View style={styles.habitTopRow}>
                <View style={[styles.habitIconWrap, { backgroundColor: '#5856D615' }]}>
                  <Ionicons name="leaf" size={24} color="#5856D6" />
                </View>
                <View style={styles.habitInfo}>
                  <Text style={[styles.habitTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    Relaksasi & Pernapasan
                  </Text>
                  <Text style={styles.habitSub}>Latihan menstabilkan denyut & menurunkan stres</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setMindfulnessDone((prev) => !prev)}
                  style={[
                    styles.mindfulnessCheck,
                    { backgroundColor: mindfulnessDone ? '#34C759' : '#8E8E9330' },
                  ]}
                >
                  <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* ================= TAB 4: ADHERENCE & CLINICIAN REPORT ================= */}
        {activeTab === 'report' && (
          <View style={styles.sectionWrap}>
            {/* Overview Summary */}
            <View style={[styles.reportCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
              <View style={styles.reportHeader}>
                <Ionicons name="document-text" size={24} color="#007AFF" />
                <View>
                  <Text style={[styles.reportTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    Laporan Kepatuhan & Terapi Pasien
                  </Text>
                  <Text style={styles.reportSubtitle}>Periode: 1 - 7 November 2026</Text>
                </View>
              </View>

              <View style={styles.reportMetricsGrid}>
                <View style={styles.reportMetricBox}>
                  <Text style={styles.reportMetricLabel}>Kepatuhan Obat</Text>
                  <Text style={[styles.reportMetricValue, { color: '#34C759' }]}>94%</Text>
                  <Text style={styles.reportMetricStatus}>Tinggi • Sangat Baik</Text>
                </View>

                <View style={styles.reportMetricBox}>
                  <Text style={styles.reportMetricLabel}>Rata-rata Tensi</Text>
                  <Text style={[styles.reportMetricValue, { color: '#007AFF' }]}>114/73</Text>
                  <Text style={styles.reportMetricStatus}>mmHg • Optimal</Text>
                </View>

                <View style={styles.reportMetricBox}>
                  <Text style={styles.reportMetricLabel}>Rata-rata Nadi</Text>
                  <Text style={[styles.reportMetricValue, { color: '#FF2D55' }]}>67</Text>
                  <Text style={styles.reportMetricStatus}>BPM • Stabil</Text>
                </View>

                <View style={styles.reportMetricBox}>
                  <Text style={styles.reportMetricLabel}>Stabilitas Kardio</Text>
                  <Text style={[styles.reportMetricValue, { color: '#AF52DE' }]}>100%</Text>
                  <Text style={styles.reportMetricStatus}>Batas Aman</Text>
                </View>
              </View>

              {/* Clinician Evaluation Note */}
              <View style={[styles.docFeedbackBox, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                <View style={styles.docFeedbackHeader}>
                  <Ionicons name="medkit" size={16} color="#007AFF" />
                  <Text style={styles.docFeedbackHeaderTitle}>
                    Catatan DPJP: dr. Budi Santoso, Sp.JP(K)
                  </Text>
                </View>
                <Text style={styles.docFeedbackText}>
                  "Pasien menunjukkan kepatuhan terapi yang sangat memuaskan terhadap Amlodipine & Candesartan. Tekanan darah stabil terkontrol dan denyut jantung aman. Sisa stok obat perlu diperbarui sebelum habis."
                </Text>
              </View>

              {/* Share / Export Action */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.exportReportBtn}
                onPress={() => {
                  Alert.alert(
                    'Laporan Terkirim ke Rekam Medis',
                    'Ringkasan kepatuhan minum obat, sisa stok, dan rekam tensi telah disinkronkan ke rekam medis dr. Budi Santoso di RS Jantung Harapan Kita via Supabase.'
                  );
                }}
              >
                <Ionicons name="share-outline" size={18} color="#FFFFFF" />
                <Text style={styles.exportReportBtnText}>
                  Kirim Laporan Medis ke dr. Budi Santoso
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>

      {/* ================= MODAL: TARIK DATA DARI DEVICE & WEARABLE ================= */}
      <Modal
        visible={deviceSyncModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDeviceSyncModalVisible(false)}
      >
        <SafeAreaView
          style={[styles.modalSafeContainer, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}
        >
          <View style={[styles.modalHeader, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.syncModalHeaderLeft}>
              <View style={styles.syncRadarIcon}>
                <Ionicons name="bluetooth" size={20} color="#007AFF" />
              </View>
              <View>
                <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  Sinkronisasi Device & Wearable
                </Text>
                <Text style={styles.syncModalSub}>
                  {isSyncingDevices ? 'Membaca telemetri via Bluetooth...' : 'Perangkat Siap & Terhubung'}
                </Text>
              </View>
            </View>

            <TouchableOpacity onPress={() => setDeviceSyncModalVisible(false)}>
              <Ionicons name="close-circle" size={28} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {isSyncingDevices ? (
            <View style={styles.syncLoadingContainer}>
              <ActivityIndicator size="large" color="#007AFF" />
              <Text style={[styles.syncLoadingText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Membaca Data Sensor Terkini...
              </Text>
              <Text style={styles.syncLoadingSub}>
                Menghubungkan ke Omron BP5250, Apple Watch & Pulse Oximeter BLE
              </Text>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.modalScroll}>
              <Text style={styles.syncPreviewHeader}>HASIL BACAAN SENSOR REAL-TIME</Text>

              {/* Device 1: Omron BP5250 */}
              <View
                style={[
                  styles.deviceResultCard,
                  { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                ]}
              >
                <View style={styles.deviceResultTop}>
                  <View style={styles.deviceResultLeft}>
                    <Ionicons name="heart-circle" size={24} color="#FF2D55" />
                    <View>
                      <Text
                        style={[
                          styles.deviceResultName,
                          { color: isDark ? '#FFFFFF' : '#000000' },
                        ]}
                      >
                        Omron BP5250 Upper Arm Cuff
                      </Text>
                      <Text style={styles.deviceResultTech}>Bluetooth BLE • Baterai 100%</Text>
                    </View>
                  </View>
                  <View style={styles.deviceCheckBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                    <Text style={styles.deviceCheckText}>Terbaca</Text>
                  </View>
                </View>

                <View style={styles.deviceMetricsRow}>
                  <View style={styles.deviceMetricCol}>
                    <Text style={styles.deviceMetricLabel}>Tensi Darah</Text>
                    <Text style={[styles.deviceMetricValue, { color: '#007AFF' }]}>
                      103/64 <Text style={styles.deviceMetricUnit}>mmHg</Text>
                    </Text>
                    <Text style={styles.deviceMetricStatus}>Optimal (AHA/ESH)</Text>
                  </View>
                  <View style={styles.deviceMetricCol}>
                    <Text style={styles.deviceMetricLabel}>Denyut Nadi</Text>
                    <Text style={[styles.deviceMetricValue, { color: '#FF2D55' }]}>
                      62 <Text style={styles.deviceMetricUnit}>BPM</Text>
                    </Text>
                    <Text style={styles.deviceMetricStatus}>Resting Normal</Text>
                  </View>
                </View>
              </View>

              {/* Device 2: Pulse Oximeter BLE (SpO2 Oksigen) */}
              <View
                style={[
                  styles.deviceResultCard,
                  { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                ]}
              >
                <View style={styles.deviceResultTop}>
                  <View style={styles.deviceResultLeft}>
                    <Ionicons name="water" size={24} color="#34C759" />
                    <View>
                      <Text
                        style={[
                          styles.deviceResultName,
                          { color: isDark ? '#FFFFFF' : '#000000' },
                        ]}
                      >
                        Beurer PO 30 Pulse Oximeter
                      </Text>
                      <Text style={styles.deviceResultTech}>BLE SpO2 Sensor • Jari Tangan</Text>
                    </View>
                  </View>
                  <View style={styles.deviceCheckBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                    <Text style={styles.deviceCheckText}>Terbaca</Text>
                  </View>
                </View>

                <View style={styles.deviceMetricsRow}>
                  <View style={styles.deviceMetricCol}>
                    <Text style={styles.deviceMetricLabel}>Saturasi Oksigen (SpO2)</Text>
                    <Text style={[styles.deviceMetricValue, { color: '#34C759' }]}>
                      98% <Text style={styles.deviceMetricUnit}>SpO2</Text>
                    </Text>
                    <Text style={styles.deviceMetricStatus}>Oksigenasi Baik</Text>
                  </View>
                  <View style={styles.deviceMetricCol}>
                    <Text style={styles.deviceMetricLabel}>Perfusion Index</Text>
                    <Text style={[styles.deviceMetricValue, { color: isDark ? '#FFF' : '#000' }]}>
                      4.2% <Text style={styles.deviceMetricUnit}>PI</Text>
                    </Text>
                    <Text style={styles.deviceMetricStatus}>Aliran Darah Stabil</Text>
                  </View>
                </View>
              </View>

              {/* Device 3: Apple Watch / Wearable Smartwatch */}
              <View
                style={[
                  styles.deviceResultCard,
                  { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                ]}
              >
                <View style={styles.deviceResultTop}>
                  <View style={styles.deviceResultLeft}>
                    <Ionicons name="watch" size={24} color="#AF52DE" />
                    <View>
                      <Text
                        style={[
                          styles.deviceResultName,
                          { color: isDark ? '#FFFFFF' : '#000000' },
                        ]}
                      >
                        Apple Watch Series 9 (Wearable)
                      </Text>
                      <Text style={styles.deviceResultTech}>Apple HealthKit / Health Connect</Text>
                    </View>
                  </View>
                  <View style={styles.deviceCheckBadge}>
                    <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                    <Text style={styles.deviceCheckText}>Terbaca</Text>
                  </View>
                </View>

                <View style={styles.deviceMetricsRow}>
                  <View style={styles.deviceMetricCol}>
                    <Text style={styles.deviceMetricLabel}>Suhu Kulit/Tubuh</Text>
                    <Text style={[styles.deviceMetricValue, { color: isDark ? '#FFF' : '#000' }]}>
                      36.5 <Text style={styles.deviceMetricUnit}>°C</Text>
                    </Text>
                    <Text style={styles.deviceMetricStatus}>Normal Eutermik</Text>
                  </View>
                  <View style={styles.deviceMetricCol}>
                    <Text style={styles.deviceMetricLabel}>Glukosa Darah (CGM)</Text>
                    <Text style={[styles.deviceMetricValue, { color: '#FF9500' }]}>
                      98 <Text style={styles.deviceMetricUnit}>mg/dL</Text>
                    </Text>
                    <Text style={styles.deviceMetricStatus}>Gula Puasa Normal</Text>
                  </View>
                </View>
              </View>

              {/* Confirm & Save Button */}
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.modalSubmitBtn}
                onPress={handleApplyDeviceTelemetry}
              >
                <Ionicons name="cloud-upload" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.modalSubmitBtnText}>
                  Terapkan & Simpan ke Rekam Medis Supabase
                </Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* ================= MODAL: RESTOK OBAT CEPAT ================= */}
      <Modal
        visible={restockModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setRestockModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Restok {selectedMedForRestock?.name}
              </Text>
              <TouchableOpacity onPress={() => setRestockModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalSubText}>
              Masukkan jumlah butir obat yang baru saja ditebus atau dibeli di apotek:
            </Text>

            <View style={styles.restockInputRow}>
              <TextInput
                style={[
                  styles.restockInput,
                  {
                    color: isDark ? '#FFFFFF' : '#000000',
                    backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                  },
                ]}
                placeholder="30"
                placeholderTextColor="#8E8E93"
                keyboardType="numeric"
                value={restockAmount}
                onChangeText={setRestockAmount}
              />
              <Text style={[styles.restockInputUnit, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {selectedMedForRestock?.doseUnit || 'Butir'}
              </Text>
            </View>

            {/* Quick Presets */}
            <View style={styles.presetButtonsRow}>
              {['15', '30', '60', '90'].map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={[
                    styles.presetBtn,
                    restockAmount === preset && styles.presetBtnActive,
                    { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' },
                  ]}
                  onPress={() => setRestockAmount(preset)}
                >
                  <Text
                    style={[
                      styles.presetBtnText,
                      restockAmount === preset && styles.presetBtnTextActive,
                    ]}
                  >
                    +{preset}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.modalSubmitBtn}
              onPress={handleConfirmRestock}
            >
              <Text style={styles.modalSubmitBtnText}>Simpan Stok ke Database</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= MODAL: TAMBAH RESEP OBAT BARU ================= */}
      <Modal
        visible={addMedModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAddMedModalVisible(false)}
      >
        <SafeAreaView
          style={[styles.modalSafeContainer, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}
        >
          <View style={[styles.modalHeader, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Tambah Resep & Kontrol Obat
            </Text>
            <TouchableOpacity onPress={() => setAddMedModalVisible(false)}>
              <Ionicons name="close-circle" size={28} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            <Text style={styles.inputLabel}>NAMA OBAT / GENERIK *</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: isDark ? '#FFFFFF' : '#000000',
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                },
              ]}
              placeholder="Contoh: Bisoprolol, Candesartan, Simvastatin..."
              placeholderTextColor="#8E8E93"
              value={newMedName}
              onChangeText={setNewMedName}
            />

            <View style={styles.dualInputRow}>
              <View style={styles.dualInputCol}>
                <Text style={styles.inputLabel}>KEKUATAN DOSIS</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: isDark ? '#FFFFFF' : '#000000',
                      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    },
                  ]}
                  placeholder="5 mg"
                  placeholderTextColor="#8E8E93"
                  value={newMedStrength}
                  onChangeText={setNewMedStrength}
                />
              </View>

              <View style={styles.dualInputCol}>
                <Text style={styles.inputLabel}>BUTIR SEKALI MINUM</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: isDark ? '#FFFFFF' : '#000000',
                      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    },
                  ]}
                  placeholder="1"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                  value={newDosePerIntake}
                  onChangeText={setNewDosePerIntake}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>FREKUENSI MINUM</Text>
            <View style={styles.chipRow}>
              {['1x Sehari', '2x Sehari', '3x Sehari', 'Sesuai Kebutuhan'].map((freq) => (
                <TouchableOpacity
                  key={freq}
                  style={[
                    styles.chipBtn,
                    newFrequency === freq && styles.chipBtnActive,
                    { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                  ]}
                  onPress={() => setNewFrequency(freq)}
                >
                  <Text
                    style={[
                      styles.chipBtnText,
                      newFrequency === freq && styles.chipBtnTextActive,
                    ]}
                  >
                    {freq}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>ATURAN MINUM</Text>
            <View style={styles.chipRow}>
              {['Sesudah Makan', 'Sebelum Makan', 'Bersama Makan', 'Sebelum Tidur'].map((inst) => (
                <TouchableOpacity
                  key={inst}
                  style={[
                    styles.chipBtn,
                    newMedInstruction === inst && styles.chipBtnActive,
                    { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                  ]}
                  onPress={() => setNewMedInstruction(inst)}
                >
                  <Text
                    style={[
                      styles.chipBtnText,
                      newMedInstruction === inst && styles.chipBtnTextActive,
                    ]}
                  >
                    {inst}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.dualInputRow}>
              <View style={styles.dualInputCol}>
                <Text style={styles.inputLabel}>STOK AWAL (BUTIR)</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: isDark ? '#FFFFFF' : '#000000',
                      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    },
                  ]}
                  placeholder="30"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                  value={newMedStock}
                  onChangeText={setNewMedStock}
                />
              </View>

              <View style={styles.dualInputCol}>
                <Text style={styles.inputLabel}>BATAS ALERT MENIPIS</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: isDark ? '#FFFFFF' : '#000000',
                      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    },
                  ]}
                  placeholder="7"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                  value={newMinAlert}
                  onChangeText={setNewMinAlert}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>TANGGAL KADALUARSA (EXPIRY DATE YYYY-MM-DD) *</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: isDark ? '#FFFFFF' : '#000000',
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                },
              ]}
              placeholder="2027-12-31"
              placeholderTextColor="#8E8E93"
              value={newExpiryDate}
              onChangeText={setNewExpiryDate}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.modalSubmitBtn}
              onPress={handleAddMedication}
            >
              <Text style={styles.modalSubmitBtnText}>Simpan Resep & Kontrol ke Database</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ================= MODAL: CATAT TENSI & VITAL MANUAL ================= */}
      <Modal
        visible={addVitalModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAddVitalModalVisible(false)}
      >
        <SafeAreaView
          style={[styles.modalSafeContainer, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}
        >
          <View style={[styles.modalHeader, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Catat Tensi & Vital Lengkap
            </Text>
            <TouchableOpacity onPress={() => setAddVitalModalVisible(false)}>
              <Ionicons name="close-circle" size={28} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            {/* Sumber Alat */}
            <Text style={styles.inputLabel}>SUMBER PERANGKAT PENGUKURAN</Text>
            <View style={styles.chipRow}>
              {[
                { key: 'ble', label: 'Tensimeter Omron BLE' },
                { key: 'wearable', label: 'Apple Watch / Smartwatch' },
                { key: 'oximeter', label: 'Pulse Oximeter' },
                { key: 'manual', label: 'Input Manual Pasien' },
              ].map((src) => (
                <TouchableOpacity
                  key={src.key}
                  style={[
                    styles.chipBtn,
                    newVitalSource === src.key && styles.chipBtnActive,
                    { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                  ]}
                  onPress={() => setNewVitalSource(src.key as any)}
                >
                  <Text
                    style={[
                      styles.chipBtnText,
                      newVitalSource === src.key && styles.chipBtnTextActive,
                    ]}
                  >
                    {src.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Tensi */}
            <Text style={styles.inputLabel}>TEKANAN DARAH (SISTOLIK / DIASTOLIK mmHg) *</Text>
            <View style={styles.dualInputRow}>
              <View style={styles.dualInputCol}>
                <Text style={styles.dualInputSub}>Sistolik</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: isDark ? '#FFFFFF' : '#000000',
                      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    },
                  ]}
                  placeholder="120"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                  value={newSystolic}
                  onChangeText={setNewSystolic}
                />
              </View>
              <Text style={styles.dualInputSlash}>/</Text>
              <View style={styles.dualInputCol}>
                <Text style={styles.dualInputSub}>Diastolik</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: isDark ? '#FFFFFF' : '#000000',
                      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    },
                  ]}
                  placeholder="80"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                  value={newDiastolic}
                  onChangeText={setNewDiastolic}
                />
              </View>
            </View>

            {/* Detak Jantung & Oksigen SpO2 */}
            <View style={styles.dualInputRow}>
              <View style={styles.dualInputCol}>
                <Text style={styles.inputLabel}>DETAK JANTUNG (BPM) *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: isDark ? '#FFFFFF' : '#000000',
                      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    },
                  ]}
                  placeholder="72"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                  value={newHeartRate}
                  onChangeText={setNewHeartRate}
                />
              </View>

              <View style={styles.dualInputCol}>
                <Text style={styles.inputLabel}>SATURASI OKSIGEN (SpO2 %) *</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: isDark ? '#FFFFFF' : '#000000',
                      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    },
                  ]}
                  placeholder="98"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                  value={newOxygen}
                  onChangeText={setNewOxygen}
                />
              </View>
            </View>

            {/* Gula Darah & Suhu Tubuh */}
            <View style={styles.dualInputRow}>
              <View style={styles.dualInputCol}>
                <Text style={styles.inputLabel}>GULA DARAH (mg/dL)</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: isDark ? '#FFFFFF' : '#000000',
                      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    },
                  ]}
                  placeholder="100"
                  placeholderTextColor="#8E8E93"
                  keyboardType="numeric"
                  value={newBloodSugar}
                  onChangeText={setNewBloodSugar}
                />
              </View>

              <View style={styles.dualInputCol}>
                <Text style={styles.inputLabel}>SUHU TUBUH (°C)</Text>
                <TextInput
                  style={[
                    styles.textInput,
                    {
                      color: isDark ? '#FFFFFF' : '#000000',
                      backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                    },
                  ]}
                  placeholder="36.5"
                  placeholderTextColor="#8E8E93"
                  value={newTemperature}
                  onChangeText={setNewTemperature}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>CATATAN KONDISI / KELUHAN</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: isDark ? '#FFFFFF' : '#000000',
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                },
              ]}
              placeholder="Contoh: Merasa sedikit lelah setelah jalan pagi..."
              placeholderTextColor="#8E8E93"
              value={newVitalNotes}
              onChangeText={setNewVitalNotes}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.modalSubmitBtn}
              onPress={handleAddVital}
            >
              <Text style={styles.modalSubmitBtnText}>Simpan Pengukuran Vital</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#8E8E9330',
  },
  backButton: {
    padding: 4,
  },
  headerTitleWrap: {
    alignItems: 'center',
    gap: 2,
  },
  headerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  headerBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#007AFF',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  addButton: {
    padding: 2,
  },
  dbStatusBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#8E8E9320',
  },
  dbStatusLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  dbDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },
  dbStatusText: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
  },

  // ADHERENCE BANNER
  adherenceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 12,
    padding: 16,
    borderRadius: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  adherenceLeft: {
    flex: 1,
    gap: 3,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FF950018',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 2,
  },
  streakText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FF9500',
  },
  adherenceTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  adherenceSub: {
    fontSize: 11,
    color: '#8E8E93',
  },
  adherenceCircleWrap: {
    marginLeft: 12,
  },
  adherenceCircle: {
    width: 62,
    height: 62,
    borderRadius: 31,
    borderWidth: 4,
    borderColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#34C75910',
  },
  adherencePercentText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#34C759',
  },
  adherencePercentSub: {
    fontSize: 9,
    color: '#8E8E93',
  },

  // TAB BAR
  tabBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#8E8E9320',
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#8E8E9310',
  },
  tabItemActive: {
    backgroundColor: '#007AFF18',
  },
  tabItemText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
  },
  tabItemTextActive: {
    color: '#007AFF',
    fontWeight: '800',
  },

  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  sectionWrap: {
    gap: 12,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  sectionActionText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
  },

  // ALERTS
  stockAlertBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    marginBottom: 4,
  },
  stockAlertTextWrap: {
    flex: 1,
  },
  stockAlertTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FF9500',
    marginBottom: 2,
  },
  stockAlertSub: {
    fontSize: 10,
    color: '#8E8E93',
    lineHeight: 14,
  },

  // MEDICATION CARD
  medCard: {
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    gap: 12,
  },
  medCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  medCardHeaderLeft: {
    flex: 1,
    flexDirection: 'row',
    gap: 12,
  },
  medIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medTitleCol: {
    flex: 1,
    gap: 2,
  },
  medNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  medName: {
    fontSize: 15,
    fontWeight: '800',
  },
  medIndication: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '600',
  },
  medDoctorTag: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 2,
  },
  medStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  medStatusBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },

  // MED CONTROL GRID (DOSAGE DISET, STOK, KADALUARSA)
  medControlGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  controlGridItem: {
    flex: 1,
    gap: 2,
  },
  controlGridLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  controlGridLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.3,
  },
  controlGridValue: {
    fontSize: 12,
    fontWeight: '800',
  },
  controlGridSub: {
    fontSize: 9,
    color: '#8E8E93',
    lineHeight: 12,
  },
  controlGridDivider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor: '#8E8E9330',
    marginHorizontal: 6,
  },

  medCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#8E8E9320',
  },
  restockQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#007AFF15',
  },
  restockQuickBtnText: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '700',
  },
  medActionButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  medBtnSmall: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  medBtnSmallText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
  },
  medTakeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  medTakeBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // VITALS & WEARABLES HERO SECTION
  vitalsActionContainer: {
    gap: 8,
    marginBottom: 6,
  },
  syncDeviceHeroCard: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 4,
    gap: 10,
  },
  syncDeviceHeroTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  syncDeviceIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncDeviceStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FFFFFF25',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  syncDeviceDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },
  syncDeviceStatusText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  syncDeviceHeroBody: {
    gap: 3,
  },
  syncDeviceHeroTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  syncDeviceHeroSub: {
    color: '#FFFFFFD0',
    fontSize: 12,
    lineHeight: 16,
  },
  syncDeviceHeroFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#FFFFFF30',
  },
  syncDeviceTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  syncDeviceTag: {
    backgroundColor: '#FFFFFF18',
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  syncDeviceArrowWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF25',
    alignItems: 'center',
    justifyContent: 'center',
  },
  manualInputPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  manualInputPillText: {
    color: '#007AFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // VITAL RECORD CARD WITH COMPLETE 4 PARAMETERS
  vitalCard: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  vitalCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vitalHeaderLeftCol: {
    gap: 3,
  },
  vitalDateTimeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  vitalDateText: {
    fontSize: 12,
    fontWeight: '800',
  },
  vitalSourceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  vitalSourceText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '600',
  },
  vitalStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  vitalStatusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
  },
  vitalMeasurementsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  vitalGridItem: {
    flex: 1,
    alignItems: 'center',
    gap: 1,
  },
  vitalGridLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 2,
  },
  vitalGridLabel: {
    fontSize: 9,
    color: '#8E8E93',
    fontWeight: '700',
  },
  vitalGridValue: {
    fontSize: 15,
    fontWeight: '800',
  },
  vitalGridUnit: {
    fontSize: 9,
    color: '#8E8E93',
  },
  vitalGridDivider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor: '#8E8E9330',
  },
  vitalCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#8E8E9320',
  },
  vitalFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  vitalTempText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  vitalNotesText: {
    fontSize: 11,
    color: '#8E8E93',
    flex: 1,
  },
  vitalSyncedTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#34C75915',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  vitalSyncedTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#34C759',
  },

  // HABITS CARDS
  habitCard: {
    borderRadius: 18,
    padding: 16,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  habitTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  habitIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitInfo: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  habitSub: {
    fontSize: 11,
    color: '#8E8E93',
  },
  habitProgressText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#007AFF',
  },
  waterControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingVertical: 6,
  },
  waterStepBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterCountText: {
    fontSize: 16,
    fontWeight: '800',
  },
  progressBarWrap: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8E8E9320',
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 4,
  },
  habitBottomActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 10,
  },
  habitActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  habitActionBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  mindfulnessCheck: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // REPORT
  reportCard: {
    borderRadius: 20,
    padding: 18,
    gap: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  reportHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  reportTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  reportSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
  },
  reportMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  reportMetricBox: {
    width: '48%',
    padding: 12,
    borderRadius: 12,
    backgroundColor: '#8E8E9310',
    gap: 2,
  },
  reportMetricLabel: {
    fontSize: 10,
    color: '#8E8E93',
  },
  reportMetricValue: {
    fontSize: 20,
    fontWeight: '800',
  },
  reportMetricStatus: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
  },
  docFeedbackBox: {
    padding: 12,
    borderRadius: 12,
    gap: 6,
  },
  docFeedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docFeedbackHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#007AFF',
  },
  docFeedbackText: {
    fontSize: 11,
    color: '#8E8E93',
    lineHeight: 16,
    fontStyle: 'italic',
  },
  exportReportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 14,
  },
  exportReportBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // MODAL STYLING
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
    fontWeight: '800',
  },
  modalScroll: {
    padding: 20,
    gap: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginTop: 4,
  },
  textInput: {
    borderRadius: 14,
    padding: 14,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#8E8E9330',
  },
  dualInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  dualInputCol: {
    flex: 1,
    gap: 4,
  },
  dualInputSub: {
    fontSize: 10,
    color: '#8E8E93',
  },
  dualInputSlash: {
    fontSize: 24,
    color: '#8E8E93',
    marginTop: 18,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chipBtn: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8E8E9330',
  },
  chipBtnActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF12',
  },
  chipBtnText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  chipBtnTextActive: {
    color: '#007AFF',
    fontWeight: '800',
  },
  modalSubmitBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 14,
    marginBottom: 40,
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // RESTOCK MODAL SPECIFICS
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000060',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 14,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalSubText: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
  },
  restockInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  restockInput: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
  },
  restockInputUnit: {
    fontSize: 16,
    fontWeight: '700',
  },
  presetButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
  },
  presetBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  presetBtnActive: {
    backgroundColor: '#007AFF',
  },
  presetBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8E93',
  },
  presetBtnTextActive: {
    color: '#FFFFFF',
  },

  // SYNC FROM DEVICES MODAL SPECIFICS
  syncModalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  syncRadarIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#007AFF15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  syncModalSub: {
    fontSize: 11,
    color: '#8E8E93',
  },
  syncLoadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
    gap: 12,
  },
  syncLoadingText: {
    fontSize: 16,
    fontWeight: '800',
  },
  syncLoadingSub: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
  },
  syncPreviewHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  deviceResultCard: {
    borderRadius: 16,
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  deviceResultTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceResultLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  deviceResultName: {
    fontSize: 13,
    fontWeight: '800',
  },
  deviceResultTech: {
    fontSize: 10,
    color: '#8E8E93',
  },
  deviceCheckBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#34C75915',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  deviceCheckText: {
    color: '#34C759',
    fontSize: 10,
    fontWeight: '700',
  },
  deviceMetricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#8E8E9320',
  },
  deviceMetricCol: {
    flex: 1,
    gap: 1,
  },
  deviceMetricLabel: {
    fontSize: 10,
    color: '#8E8E93',
  },
  deviceMetricValue: {
    fontSize: 16,
    fontWeight: '800',
  },
  deviceMetricUnit: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
  },
  deviceMetricStatus: {
    fontSize: 9,
    color: '#34C759',
    fontWeight: '600',
  },
});

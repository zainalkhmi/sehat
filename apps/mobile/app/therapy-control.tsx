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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface MedicationItem {
  id: string;
  name: string;
  dosage: string;
  indication: string;
  timeOfDay: 'pagi' | 'siang' | 'malam' | 'tidur';
  scheduledTime: string;
  instruction: string; // e.g. "Sesudah Makan"
  remainingStock: number;
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
  bloodSugar?: number;
  notes?: string;
  status: 'optimal' | 'normal' | 'pre-hypertension' | 'high';
}

const INITIAL_MEDICATIONS: MedicationItem[] = [
  {
    id: 'med-1',
    name: 'Amlodipine',
    dosage: '5 mg • 1 Tablet',
    indication: 'Kontrol Tekanan Darah (Antihipertensi)',
    timeOfDay: 'pagi',
    scheduledTime: '08:00 WIB',
    instruction: 'Sesudah Makan Pagi',
    remainingStock: 24,
    status: 'taken',
    takenAt: '08:05 WIB',
    color: '#007AFF',
  },
  {
    id: 'med-2',
    name: 'Metformin HCl',
    dosage: '500 mg • 1 Tablet',
    indication: 'Kontrol Glukosa Darah',
    timeOfDay: 'siang',
    scheduledTime: '12:30 WIB',
    instruction: 'Bersama Makan Siang',
    remainingStock: 18,
    status: 'taken',
    takenAt: '12:45 WIB',
    color: '#FF9500',
  },
  {
    id: 'med-3',
    name: 'Candesartan Cilexetil',
    dosage: '8 mg • 1 Tablet',
    indication: 'Proteksi Kardiovaskular & Ginjal',
    timeOfDay: 'malam',
    scheduledTime: '20:00 WIB',
    instruction: 'Sesudah Makan Malam',
    remainingStock: 5, // Low stock warning!
    status: 'pending',
    color: '#FF2D55',
  },
  {
    id: 'med-4',
    name: 'Atorvastatin',
    dosage: '20 mg • 1 Tablet',
    indication: 'Stabilisasi Kolesterol & Plak Pembuluh Darah',
    timeOfDay: 'tidur',
    scheduledTime: '21:30 WIB',
    instruction: 'Sebelum Tidur Malam',
    remainingStock: 14,
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
    bloodSugar: 98,
    notes: 'Pengukuran rutin pagi setelah bangun tidur',
    status: 'optimal',
  },
  {
    id: 'vit-2',
    date: 'Kemarin',
    time: '20:10 WIB',
    systolic: 112,
    diastolic: 74,
    heartRate: 68,
    bloodSugar: 115,
    notes: 'Pasca makan malam dan minum Candesartan',
    status: 'optimal',
  },
  {
    id: 'vit-3',
    date: '5 Nov 2026',
    time: '08:00 WIB',
    systolic: 118,
    diastolic: 76,
    heartRate: 72,
    bloodSugar: 102,
    notes: 'Kondisi relaks, istirahat cukup',
    status: 'normal',
  },
  {
    id: 'vit-4',
    date: '4 Nov 2026',
    time: '08:00 WIB',
    systolic: 124,
    diastolic: 80,
    heartRate: 75,
    bloodSugar: 108,
    notes: 'Aktivitas normal',
    status: 'normal',
  },
];

export default function TherapyControlScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'meds' | 'vitals' | 'habits' | 'report'>('meds');

  // Medications state
  const [medications, setMedications] = useState<MedicationItem[]>(INITIAL_MEDICATIONS);
  const [addMedModalVisible, setAddMedModalVisible] = useState(false);

  // New med form
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedTime, setNewMedTime] = useState('08:00 WIB');
  const [newMedInstruction, setNewMedInstruction] = useState('Sesudah Makan');
  const [newMedStock, setNewMedStock] = useState('30');

  // Vitals state
  const [vitals, setVitals] = useState<VitalRecord[]>(INITIAL_VITALS);
  const [addVitalModalVisible, setAddVitalModalVisible] = useState(false);

  // New vital form
  const [newSystolic, setNewSystolic] = useState('110');
  const [newDiastolic, setNewDiastolic] = useState('70');
  const [newHeartRate, setNewHeartRate] = useState('68');
  const [newBloodSugar, setNewBloodSugar] = useState('100');
  const [newVitalNotes, setNewVitalNotes] = useState('');

  // Daily Habits state
  const [waterGlasses, setWaterGlasses] = useState(6);
  const [walkingMinutes, setWalkingMinutes] = useState(25);
  const [mindfulnessDone, setMindfulnessDone] = useState(true);

  // Calculate adherence
  const totalMeds = medications.length;
  const takenMeds = medications.filter((m) => m.status === 'taken').length;
  const adherenceRate = Math.round((takenMeds / totalMeds) * 100);

  // Handle Mark Medication
  const handleMarkMedication = (id: string, status: 'taken' | 'skipped' | 'snoozed' | 'pending') => {
    setMedications((prev) =>
      prev.map((med) => {
        if (med.id === id) {
          const now = new Date();
          const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')} WIB`;
          return {
            ...med,
            status,
            takenAt: status === 'taken' ? timeStr : undefined,
            remainingStock: status === 'taken' ? Math.max(0, med.remainingStock - 1) : med.remainingStock,
          };
        }
        return med;
      })
    );

    if (status === 'taken') {
      Alert.alert('✅ Obat Tercatat', 'Kepatuhan obat berhasil disimpan dan disinkronkan ke rekam medis.');
    } else if (status === 'skipped') {
      Alert.alert('⏭️ Obat Dilewati', 'Status lewati telah dicatat dalam jurnal kepatuhan harian.');
    } else if (status === 'snoozed') {
      Alert.alert('⏰ Pengingat Ditunda', 'Aplikasi akan mengingatkan kembali dalam 15 menit.');
    }
  };

  // Handle Add Medication
  const handleAddMedication = () => {
    if (!newMedName.trim()) {
      Alert.alert('Data Belum Lengkap', 'Masukkan nama obat.');
      return;
    }
    const newMed: MedicationItem = {
      id: `med-${Date.now()}`,
      name: newMedName.trim(),
      dosage: newMedDosage.trim() || '1 Tablet',
      indication: 'Terapi Resep Dokter',
      timeOfDay: 'pagi',
      scheduledTime: newMedTime,
      instruction: newMedInstruction,
      remainingStock: parseInt(newMedStock, 10) || 30,
      status: 'pending',
      color: '#007AFF',
    };
    setMedications((prev) => [...prev, newMed]);
    setAddMedModalVisible(false);
    setNewMedName('');
    setNewMedDosage('');
    Alert.alert('Obat Berhasil Ditambahkan', `Pengingat untuk ${newMed.name} telah aktif.`);
  };

  // Handle Add Vital Record
  const handleAddVital = () => {
    const sys = parseInt(newSystolic, 10) || 120;
    const dia = parseInt(newDiastolic, 10) || 80;
    const hr = parseInt(newHeartRate, 10) || 72;
    const bs = parseInt(newBloodSugar, 10) || 100;

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
      bloodSugar: bs,
      notes: newVitalNotes.trim() || 'Pencatatan harian mandiri',
      status,
    };

    setVitals((prev) => [newRec, ...prev]);
    setAddVitalModalVisible(false);
    setNewVitalNotes('');
    Alert.alert(
      'Vital Signs Tersimpan',
      `Tensi ${sys}/${dia} mmHg (${status.toUpperCase()}) dan detak jantung ${hr} BPM berhasil dicatat ke rekam medis Supabase.`
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
            Kontrol Terapi & Vital
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
            {/* Low Stock Alert if any */}
            {medications.some((m) => m.remainingStock <= 7) && (
              <View style={[styles.stockAlertBox, { backgroundColor: '#FF950015' }]}>
                <Ionicons name="warning" size={20} color="#FF9500" />
                <View style={styles.stockAlertTextWrap}>
                  <Text style={styles.stockAlertTitle}>Peringatan Sisa Stok Obat</Text>
                  <Text style={styles.stockAlertSub}>
                    Stok Candesartan 8mg tersisa 5 butir. Konsultasikan resep ulang ke dr. Budi Santoso via Halo Dokter.
                  </Text>
                </View>
              </View>
            )}

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>JADWAL MINUM OBAT HARI INI</Text>
              <TouchableOpacity onPress={() => setAddMedModalVisible(true)}>
                <Text style={styles.sectionActionText}>+ Tambah Obat</Text>
              </TouchableOpacity>
            </View>

            {medications.map((med) => {
              const isTaken = med.status === 'taken';
              const isSkipped = med.status === 'skipped';
              return (
                <View
                  key={med.id}
                  style={[
                    styles.medCard,
                    { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                    isTaken && { borderColor: '#34C75930', borderWidth: 1.5 },
                  ]}
                >
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
                          <Text style={styles.medDosage}>{med.dosage}</Text>
                        </View>
                        <Text style={styles.medIndication}>{med.indication}</Text>
                        <Text style={styles.medInstruction}>
                          ⏰ {med.scheduledTime} • 🍽️ {med.instruction}
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

                  {/* Stock pill & Actions */}
                  <View style={styles.medCardBottom}>
                    <View style={styles.stockPill}>
                      <Text style={styles.stockPillText}>
                        Sisa Stok: <Text style={{ fontWeight: '700' }}>{med.remainingStock} Butir</Text>
                      </Text>
                    </View>

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
                          {isTaken ? 'Sudah Diminum' : 'Tandai Minum'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* ================= TAB 2: VITALS & BLOOD PRESSURE ================= */}
        {activeTab === 'vitals' && (
          <View style={styles.sectionWrap}>
            {/* Quick Logging Action Card */}
            <TouchableOpacity
              activeOpacity={0.85}
              style={[styles.quickLogCard, { backgroundColor: '#007AFF' }]}
              onPress={() => setAddVitalModalVisible(true)}
            >
              <View style={styles.quickLogLeft}>
                <Ionicons name="heart-circle" size={32} color="#FFFFFF" />
                <View>
                  <Text style={styles.quickLogTitle}>Catat Tensi & Detak Jantung</Text>
                  <Text style={styles.quickLogSub}>Input manual atau sinkronisasi alat BLE</Text>
                </View>
              </View>
              <Ionicons name="arrow-forward-circle" size={26} color="#FFFFFF" />
            </TouchableOpacity>

            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>RIWAYAT PENGUKURAN VITAL</Text>
              <TouchableOpacity onPress={() => setAddVitalModalVisible(true)}>
                <Text style={styles.sectionActionText}>+ Catat Baru</Text>
              </TouchableOpacity>
            </View>

            {vitals.map((item) => (
              <View
                key={item.id}
                style={[styles.vitalCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
              >
                <View style={styles.vitalCardHeader}>
                  <View style={styles.vitalDateTimeWrap}>
                    <Ionicons name="calendar-outline" size={14} color="#8E8E93" />
                    <Text style={styles.vitalDateText}>
                      {item.date} • {item.time}
                    </Text>
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

                {/* Grid of Measurements */}
                <View style={styles.vitalMeasurementsGrid}>
                  <View style={styles.vitalGridItem}>
                    <Text style={styles.vitalGridLabel}>Tensi Darah</Text>
                    <Text style={[styles.vitalGridValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      {item.systolic}/{item.diastolic}
                    </Text>
                    <Text style={styles.vitalGridUnit}>mmHg</Text>
                  </View>

                  <View style={styles.vitalGridDivider} />

                  <View style={styles.vitalGridItem}>
                    <Text style={styles.vitalGridLabel}>Detak Jantung</Text>
                    <Text style={[styles.vitalGridValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      {item.heartRate}
                    </Text>
                    <Text style={styles.vitalGridUnit}>BPM</Text>
                  </View>

                  <View style={styles.vitalGridDivider} />

                  <View style={styles.vitalGridItem}>
                    <Text style={styles.vitalGridLabel}>Gula Darah</Text>
                    <Text style={[styles.vitalGridValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      {item.bloodSugar || 100}
                    </Text>
                    <Text style={styles.vitalGridUnit}>mg/dL</Text>
                  </View>
                </View>

                {item.notes ? (
                  <Text style={styles.vitalNotesText}>📝 {item.notes}</Text>
                ) : null}
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
                    'Laporan Terkirim',
                    'Ringkasan kepatuhan minum obat dan rekam tensi telah disinkronkan ke rekam medis dr. Budi Santoso di RS Jantung Harapan Kita via Supabase.'
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

      {/* MODAL 1: TAMBAH OBAT BARU */}
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
              Tambah Jadwal Obat
            </Text>
            <TouchableOpacity onPress={() => setAddMedModalVisible(false)}>
              <Ionicons name="close-circle" size={28} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
            <Text style={styles.inputLabel}>NAMA OBAT *</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: isDark ? '#FFFFFF' : '#000000',
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                },
              ]}
              placeholder="Contoh: Bisoprolol, Metformin, Candesartan..."
              placeholderTextColor="#8E8E93"
              value={newMedName}
              onChangeText={setNewMedName}
            />

            <Text style={styles.inputLabel}>DOSIS & BENTUK</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: isDark ? '#FFFFFF' : '#000000',
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                },
              ]}
              placeholder="Contoh: 5 mg • 1 Tablet"
              placeholderTextColor="#8E8E93"
              value={newMedDosage}
              onChangeText={setNewMedDosage}
            />

            <Text style={styles.inputLabel}>WAKTU MINUM (JAM)</Text>
            <TextInput
              style={[
                styles.textInput,
                {
                  color: isDark ? '#FFFFFF' : '#000000',
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                },
              ]}
              placeholder="08:00 WIB"
              placeholderTextColor="#8E8E93"
              value={newMedTime}
              onChangeText={setNewMedTime}
            />

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

            <Text style={styles.inputLabel}>JUMLAH STOK BUTIR AWAL</Text>
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

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.modalSubmitBtn}
              onPress={handleAddMedication}
            >
              <Text style={styles.modalSubmitBtnText}>Simpan Jadwal Obat</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* MODAL 2: CATAT TENSI & VITAL MANUAL */}
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
              Catat Tensi & Vital
            </Text>
            <TouchableOpacity onPress={() => setAddVitalModalVisible(false)}>
              <Ionicons name="close-circle" size={28} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll}>
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

            <Text style={styles.inputLabel}>DETAK JANTUNG / NADI (BPM) *</Text>
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

            <Text style={styles.inputLabel}>GULA DARAH (mg/dL - Opsional)</Text>
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
    paddingBottom: 12,
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

  // ADHERENCE BANNER
  adherenceBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 14,
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

  // LOW STOCK ALERT
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
  medDosage: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  medIndication: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '600',
  },
  medInstruction: {
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
  medCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#8E8E9320',
  },
  stockPill: {
    backgroundColor: '#8E8E9312',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  stockPillText: {
    fontSize: 10,
    color: '#8E8E93',
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

  // VITALS LOGGING
  quickLogCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    marginBottom: 6,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 3,
  },
  quickLogLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  quickLogTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  quickLogSub: {
    color: '#FFFFFF90',
    fontSize: 11,
  },
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
  vitalDateTimeWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  vitalDateText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
  },
  vitalStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
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
    paddingVertical: 6,
  },
  vitalGridItem: {
    flex: 1,
    alignItems: 'center',
  },
  vitalGridLabel: {
    fontSize: 10,
    color: '#8E8E93',
    marginBottom: 2,
  },
  vitalGridValue: {
    fontSize: 18,
    fontWeight: '800',
  },
  vitalGridUnit: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 1,
  },
  vitalGridDivider: {
    width: StyleSheet.hairlineWidth,
    height: 32,
    backgroundColor: '#8E8E9330',
  },
  vitalNotesText: {
    fontSize: 11,
    color: '#8E8E93',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#8E8E9320',
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
    marginTop: 14,
    marginBottom: 40,
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

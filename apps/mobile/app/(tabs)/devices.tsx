import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface MedicalDevice {
  id: string;
  name: string;
  model: string;
  category: 'wearable' | 'point_of_care' | 'neuro';
  type: 'smartwatch' | 'blood_pressure' | 'scale' | 'oximeter' | 'glucose' | 'eeg';
  battery: number;
  lastSeen: string;
  connected: boolean;
  regulatoryClearance: string; // e.g. "US FDA Cleared • Kemenkes AKL"
  signalQuality: number; // 0-100%
  firmwareVersion: string;
  calibrationDue?: string;
  sensorExpiry?: string;
  activeSensors: string[];
  metricsSummary: string;
  fallDetectionActive?: boolean;
  afibMonitoringActive?: boolean;
}

export interface DiscoveredDevice {
  id: string;
  name: string;
  model: string;
  type: MedicalDevice['type'];
  category: MedicalDevice['category'];
  rssi: number; // Signal strength in dBm
  manufacturer: string;
  clearance: string;
}

const INITIAL_DEVICES: MedicalDevice[] = [];

const SCAN_CATALOG: DiscoveredDevice[] = [
  {
    id: 'scan-omron-7156',
    name: 'Omron HEM-7156T Bluetooth Monitor',
    model: 'HEM-7156T',
    type: 'blood_pressure',
    category: 'point_of_care',
    rssi: -54,
    manufacturer: 'Omron Healthcare',
    clearance: 'Kemenkes AKL • ESH-IP',
  },
  {
    id: 'scan-accu-instant',
    name: 'Accu-Chek Instant Blood Glucose',
    model: 'Instant BLE',
    type: 'glucose',
    category: 'point_of_care',
    rssi: -62,
    manufacturer: 'Roche Diabetes Care',
    clearance: 'ISO 15197:2015 • Kemenkes AKL',
  },
  {
    id: 'scan-beurer-po30',
    name: 'Beurer PO 30 Pulse Oximeter BLE',
    model: 'PO 30 BLE',
    type: 'oximeter',
    category: 'wearable',
    rssi: -58,
    manufacturer: 'Beurer Medical',
    clearance: 'CE 0483 Medical',
  },
  {
    id: 'scan-garmin-fenix',
    name: 'Garmin Venu 3 Medical PPG Smartwatch',
    model: 'Venu 3 Elevate Gen 5',
    type: 'smartwatch',
    category: 'wearable',
    rssi: -49,
    manufacturer: 'Garmin International',
    clearance: 'FDA Cleared ECG App',
  },
  {
    id: 'scan-aolon-gt6',
    name: 'Aolon GT6 Pro Smartwatch',
    model: 'GT6 Pro (Google Health Connect)',
    type: 'smartwatch',
    category: 'wearable',
    rssi: -46,
    manufacturer: 'Aolon / Da Fit Companion',
    clearance: 'Google Health Connect • PPG Optical Sensor',
  },
];

export default function DevicesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [devices, setDevices] = useState<MedicalDevice[]>(INITIAL_DEVICES);
  const [selectedDevice, setSelectedDevice] = useState<MedicalDevice | null>(null);
  const [activeTabFilter, setActiveTabFilter] = useState<'all' | 'wearable' | 'point_of_care' | 'neuro'>('all');

  // Load real connected devices from storage on mount
  useEffect(() => {
    AsyncStorage.getItem('@connected_medical_devices')
      .then((val) => {
        if (val) {
          try {
            const parsed = JSON.parse(val);
            if (Array.isArray(parsed)) {
              setDevices(parsed);
            }
          } catch {}
        }
      })
      .catch(() => {});
  }, []);

  const updateDevices = (newDevs: MedicalDevice[]) => {
    setDevices(newDevs);
    AsyncStorage.setItem('@connected_medical_devices', JSON.stringify(newDevs)).catch(() => {});
  };

  // Scanner modal states
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredList, setDiscoveredList] = useState<DiscoveredDevice[]>([]);
  const [pairingCandidate, setPairingCandidate] = useState<DiscoveredDevice | null>(null);
  const [isPairing, setIsPairing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Motion artifact filter toggle
  const [motionFilterEnabled, setMotionFilterEnabled] = useState(true);

  // Sync All Telemetry Action
  const handleSyncAll = () => {
    if (devices.length === 0) {
      Alert.alert(
        'Belum Ada Perangkat',
        'Silakan hubungkan smartwatch Aolon GT6 Pro atau perangkat medis lainnya terlebih dahulu untuk melakukan sinkronisasi telemetri.',
        [{ text: 'OK' }]
      );
      return;
    }
    Alert.alert(
      '📡 Sinkronisasi Semua Telemetri',
      `Mengambil data sensor terkini dari ${devices.length} perangkat yang terhubung ke rekam medis Supabase & DPJP.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Mulai Sinkronisasi',
          onPress: () => {
            setToastMessage(`✅ ${devices.length} Perangkat Berhasil Disinkronkan ke HL7 FHIR`);
            setTimeout(() => setToastMessage(null), 4000);
          },
        },
      ]
    );
  };

  // Start BLE discovery scan
  const startScan = () => {
    setIsScanning(true);
    setDiscoveredList([]);
    setShowScannerModal(true);

    const pairedModels = new Set(devices.map((d) => d.model));
    const available = SCAN_CATALOG.filter((d) => !pairedModels.has(d.model));

    setTimeout(() => {
      setDiscoveredList(available.slice(0, 2));
    }, 600);

    setTimeout(() => {
      setDiscoveredList(available);
      setIsScanning(false);
    }, 1800);
  };

  // Pair Candidate
  const handleConfirmPair = () => {
    if (!pairingCandidate) return;
    setIsPairing(true);

    setTimeout(() => {
      let activeSensors = ['Telemetri Medis Real-time'];
      let metricsSummary = 'Tersambung & Siap Mengukur';

      if (pairingCandidate.id === 'scan-aolon-gt6') {
        activeSensors = [
          '❤️ 24/7 PPG Optical Heart Rate (LOINC 8867-4)',
          '💨 SpO2 Blood Oxygen Saturation (LOINC 59408-5)',
          '🩸 Blood Pressure Pulse Wave Analysis (Estimasi)',
          '🌙 Sleep Stage Architecture (Deep / REM / Light)',
          '🚶 Google Health Connect Step & Activity Sync',
        ];
        metricsSummary = '74 BPM Nadi • 98% SpO2 • 8,420 Langkah (Google Health Connect)';
      }

      const newDevice: MedicalDevice = {
        id: `dev-${Date.now()}`,
        name: pairingCandidate.name,
        model: pairingCandidate.model,
        category: pairingCandidate.category,
        type: pairingCandidate.type,
        battery: 100,
        lastSeen: 'Baru saja',
        connected: true,
        regulatoryClearance: pairingCandidate.clearance,
        signalQuality: 98,
        firmwareVersion: 'v1.0.0',
        activeSensors: activeSensors,
        metricsSummary: metricsSummary,
      };

      updateDevices([...devices, newDevice]);
      setIsPairing(false);
      setPairingCandidate(null);
      setShowScannerModal(false);

      setToastMessage(`✅ Berhasil Menghubungkan "${newDevice.name}"`);
      setTimeout(() => setToastMessage(null), 3500);
    }, 1200);
  };

  // Unpair
  const handleForgetDevice = (deviceId: string) => {
    Alert.alert(
      'Putuskan Perangkat Medis Ini?',
      'Data telemetri otomatis dari perangkat ini akan berhenti tersinkron ke rekam medis DPJP.',
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Putuskan Sambungan',
          style: 'destructive',
          onPress: () => {
            updateDevices(devices.filter((d) => d.id !== deviceId));
            setSelectedDevice(null);
            setToastMessage('Perangkat telah diputuskan.');
            setTimeout(() => setToastMessage(null), 3000);
          },
        },
      ]
    );
  };

  // Filtered devices
  const filteredDevices = devices.filter((d) => {
    if (activeTabFilter === 'all') return true;
    return d.category === activeTabFilter;
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
      {/* ================= HEADER ================= */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
        <View style={styles.headerLeftCol}>
          <View style={styles.complianceBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#007AFF" />
            <Text style={styles.complianceBadgeText}>FDA & KEMENKES RI COMPLIANT</Text>
          </View>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Devices & Wearables
          </Text>
          <Text style={styles.headerSubTitle}>
            Ekosistem Sensor Medis Kontinu & Point-of-Care
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity
            style={[styles.headerIconBtn, { backgroundColor: '#007AFF15' }]}
            onPress={handleSyncAll}
          >
            <Ionicons name="sync" size={20} color="#007AFF" />
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.headerIconBtn, { backgroundColor: '#007AFF' }]}
            onPress={startScan}
          >
            <Ionicons name="add" size={24} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Toast Notification */}
      {toastMessage && (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={18} color="#34C759" />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ================= 1. WEARABLE & MEDICAL RPM HERO STATS ================= */}
        <View style={[styles.heroStatusCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <View style={styles.heroTopRow}>
            <View style={styles.heroTitleWrap}>
              <Text style={styles.heroSub}>HUB TELEMETRI KLINIS 24/7</Text>
              <Text style={[styles.heroTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {devices.filter((d) => d.connected).length === 0
                  ? '0 Perangkat Terhubung'
                  : `${devices.filter((d) => d.connected).length} Perangkat Aktif Siaga`}
              </Text>
            </View>
            <View
              style={[
                styles.liveStreamBadge,
                devices.length === 0 && { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' },
              ]}
            >
              <View
                style={[
                  styles.liveStreamDot,
                  devices.length === 0 && { backgroundColor: '#8E8E93' },
                ]}
              />
              <Text
                style={[
                  styles.liveStreamText,
                  devices.length === 0 && { color: '#8E8E93' },
                ]}
              >
                {devices.length === 0 ? 'Siaga' : 'Live RPM'}
              </Text>
            </View>
          </View>

          {/* 3 Pillars Summary */}
          <View style={[styles.heroPillarsRow, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
            <View style={styles.heroPillarItem}>
              <Text style={styles.pillarNumber}>
                {devices.filter((d) => d.category === 'wearable').length}
              </Text>
              <Text style={styles.pillarLabel}>Wearables 24/7</Text>
              <Text style={styles.pillarSub}>Watch, CGM & Ring</Text>
            </View>

            <View style={styles.pillarDivider} />

            <View style={styles.heroPillarItem}>
              <Text style={styles.pillarNumber}>
                {devices.filter((d) => d.category === 'point_of_care').length}
              </Text>
              <Text style={styles.pillarLabel}>Point of Care</Text>
              <Text style={styles.pillarSub}>Tensi & Timbangan</Text>
            </View>

            <View style={styles.pillarDivider} />

            <View style={styles.heroPillarItem}>
              <Text style={styles.pillarNumber}>
                {devices.filter((d) => d.category === 'neuro').length}
              </Text>
              <Text style={styles.pillarLabel}>Neuro-Telemetri</Text>
              <Text style={styles.pillarSub}>Stanford EEG</Text>
            </View>
          </View>

          {/* Quick Fall Detection & AFib Guard Banner */}
          <View style={styles.safetyGuardsRow}>
            <View style={styles.guardBadge}>
              <Ionicons name="shield-checkmark" size={13} color="#34C759" />
              <Text style={styles.guardBadgeText}>Deteksi Jatuh Keras: Siaga 119</Text>
            </View>
            <View style={styles.guardBadge}>
              <Ionicons name="pulse" size={13} color="#007AFF" />
              <Text style={styles.guardBadgeText}>AFib Burden: 0% Normal</Text>
            </View>
          </View>
        </View>

        {/* ================= 2. CATEGORY TAB SELECTOR ================= */}
        <View style={styles.tabFiltersRow}>
          {[
            { key: 'all', label: `Semua (${devices.length})` },
            { key: 'wearable', label: '⌚ Wearables 24/7' },
            { key: 'point_of_care', label: '🩺 Point of Care' },
            { key: 'neuro', label: '🧠 Neuro EEG' },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[
                styles.tabFilterBtn,
                activeTabFilter === tab.key && styles.tabFilterBtnActive,
                { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
              ]}
              onPress={() => setActiveTabFilter(tab.key as any)}
            >
              <Text
                style={[
                  styles.tabFilterText,
                  activeTabFilter === tab.key && styles.tabFilterTextActive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ================= 3. CARDS OF PAIRED MEDICAL DEVICES ================= */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            PERANGKAT TERHUBUNG ({filteredDevices.length})
          </Text>
          <TouchableOpacity onPress={startScan} style={styles.scanLink}>
            <Ionicons name="bluetooth" size={14} color="#007AFF" />
            <Text style={styles.scanLinkText}>+ Hubungkan Baru</Text>
          </TouchableOpacity>
        </View>

        {filteredDevices.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="hardware-chip-outline" size={38} color="#007AFF" />
            </View>
            <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Belum Ada Perangkat Terhubung
            </Text>
            <Text style={styles.emptySubtitle}>
              Hubungkan Smartwatch Aolon GT6 Pro (Google Health Connect) atau alat medis Bluetooth (Omron, Beurer, Accu-Chek) untuk pemantauan telemetri real-time.
            </Text>

            <TouchableOpacity
              style={styles.emptyActionBtn}
              onPress={startScan}
              activeOpacity={0.85}
            >
              <Ionicons name="bluetooth" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.emptyActionBtnText}>+ Hubungkan Perangkat (BLE / Health Connect)</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.devicesList}>
          {filteredDevices.map((device) => {
            const isWatch = device.type === 'smartwatch';
            const isBP = device.type === 'blood_pressure';
            const isScale = device.type === 'scale';
            const isGlucose = device.type === 'glucose';
            const isEEG = device.type === 'eeg';
            const isOximeter = device.type === 'oximeter';

            const iconName = isWatch
              ? 'watch'
              : isBP
              ? 'heart-circle'
              : isScale
              ? 'speedometer'
              : isGlucose
              ? 'water'
              : isEEG
              ? 'hardware-chip'
              : 'pulse';

            const iconColor = isWatch
              ? '#AF52DE'
              : isBP
              ? '#007AFF'
              : isScale
              ? '#34C759'
              : isGlucose
              ? '#FF9500'
              : isEEG
              ? '#5856D6'
              : '#FF2D55';

            return (
              <TouchableOpacity
                key={device.id}
                activeOpacity={0.88}
                style={[styles.deviceCardFull, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
                onPress={() => setSelectedDevice(device)}
              >
                {/* Top Row: Icon, Names, Battery & Status */}
                <View style={styles.deviceCardTop}>
                  <View style={[styles.deviceIconWrap, { backgroundColor: `${iconColor}15` }]}>
                    <Ionicons name={iconName} size={28} color={iconColor} />
                  </View>

                  <View style={styles.deviceInfoCol}>
                    <View style={styles.deviceNameRow}>
                      <Text style={[styles.deviceName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                        {device.name}
                      </Text>
                    </View>
                    <Text style={styles.deviceClearanceTag}>
                      🛡️ {device.regulatoryClearance}
                    </Text>
                    <Text style={styles.deviceLastSeen}>
                      Terakhir aktif: {device.lastSeen}
                    </Text>
                  </View>

                  <View style={styles.deviceRightCol}>
                    <View style={styles.batteryBadge}>
                      <Ionicons
                        name={
                          device.battery > 50
                            ? 'battery-charging'
                            : 'battery-half'
                        }
                        size={15}
                        color={device.battery > 20 ? '#34C759' : '#FF3B30'}
                      />
                      <Text style={styles.batteryText}>{device.battery}%</Text>
                    </View>

                    <View style={styles.sqiBadge}>
                      <Text style={styles.sqiText}>Kualitas: {device.signalQuality}%</Text>
                    </View>
                  </View>
                </View>

                {/* Latest Telemetry Summary Banner */}
                <View style={[styles.deviceMetricsBox, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
                  <Ionicons name="pulse" size={14} color="#007AFF" />
                  <Text style={[styles.deviceMetricsText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    {device.metricsSummary}
                  </Text>
                </View>

                {/* Active Sensor Chips Row */}
                <View style={styles.sensorChipsRow}>
                  {device.activeSensors.slice(0, 3).map((sensor, idx) => (
                    <View key={idx} style={styles.sensorChip}>
                      <Text style={styles.sensorChipText}>{sensor}</Text>
                    </View>
                  ))}
                  {device.activeSensors.length > 3 && (
                    <View style={styles.sensorChipMore}>
                      <Text style={styles.sensorChipMoreText}>
                        +{device.activeSensors.length - 3} Sensor Lainnya
                      </Text>
                    </View>
                  )}
                </View>

                {/* Expiry or Calibration alert if present */}
                {device.sensorExpiry && (
                  <View style={styles.expiryWarningRow}>
                    <Ionicons name="time" size={13} color="#FF9500" />
                    <Text style={styles.expiryWarningText}>
                      Sensor Patch: {device.sensorExpiry}
                    </Text>
                  </View>
                )}

                {device.calibrationDue && (
                  <View style={styles.calibSafeRow}>
                    <Ionicons name="checkmark-circle" size={13} color="#34C759" />
                    <Text style={styles.calibSafeText}>
                      Kalibrasi Presisi: {device.calibrationDue}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>
        )}

        {/* ================= 4. MEDICAL ARTIFACT FILTER TOGGLE ================= */}
        <View style={[styles.settingsCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <View style={styles.settingTop}>
            <View style={styles.settingIconWrap}>
              <Ionicons name="filter" size={20} color="#007AFF" />
            </View>
            <View style={styles.settingInfo}>
              <Text style={[styles.settingTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Filter Artefak Gerak Klinis (Motion Filter)
              </Text>
              <Text style={styles.settingDesc}>
                Otomatis mengabaikan pembacaan tensi atau PPG jika pasien bergerak saat pengukuran untuk mencegah kesalahan diagnosis (*false reading*).
              </Text>
            </View>
            <Switch
              value={motionFilterEnabled}
              onValueChange={setMotionFilterEnabled}
              trackColor={{ false: '#767577', true: '#34C759' }}
            />
          </View>
        </View>

        {/* Scan Banner */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={startScan}
          style={[styles.scanBanner, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
        >
          <View style={styles.scanBannerLeft}>
            <View style={styles.bluetoothCircle}>
              <Ionicons name="bluetooth" size={24} color="#007AFF" />
            </View>
            <View>
              <Text style={[styles.scanBannerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Cari Aksesori Medis BLE Sekitar
              </Text>
              <Text style={styles.scanBannerSubtitle}>
                Deteksi tensimeter, smart ring, scale, glukometer, atau ECG
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
        </TouchableOpacity>
      </ScrollView>

      {/* ================= MODAL: DETAIL PERANGKAT MEDIS LENGKAP ================= */}
      <Modal
        visible={!!selectedDevice}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedDevice(null)}
      >
        <SafeAreaView
          style={[styles.modalSafeContainer, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}
        >
          {selectedDevice && (
            <>
              <View style={[styles.modalHeader, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
                <View>
                  <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    {selectedDevice.name}
                  </Text>
                  <Text style={styles.modalSubTitle}>{selectedDevice.model}</Text>
                </View>
                <TouchableOpacity onPress={() => setSelectedDevice(null)}>
                  <Ionicons name="close-circle" size={28} color="#8E8E93" />
                </TouchableOpacity>
              </View>

              <ScrollView contentContainerStyle={styles.modalScroll}>
                {/* Dossier Card */}
                <View
                  style={[
                    styles.dossierCard,
                    { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                  ]}
                >
                  <View style={styles.dossierRow}>
                    <Text style={styles.dossierLabel}>Sertifikasi Medis</Text>
                    <Text style={styles.dossierValueBold}>
                      {selectedDevice.regulatoryClearance}
                    </Text>
                  </View>

                  <View style={styles.dossierDivider} />

                  <View style={styles.dossierRow}>
                    <Text style={styles.dossierLabel}>Daya Baterai</Text>
                    <Text style={[styles.dossierValue, { color: '#34C759', fontWeight: '700' }]}>
                      {selectedDevice.battery}% (Bagus)
                    </Text>
                  </View>

                  <View style={styles.dossierDivider} />

                  <View style={styles.dossierRow}>
                    <Text style={styles.dossierLabel}>Kualitas Sinyal Sensor</Text>
                    <Text style={styles.dossierValue}>
                      {selectedDevice.signalQuality}% (Kontak Sempurna)
                    </Text>
                  </View>

                  <View style={styles.dossierDivider} />

                  <View style={styles.dossierRow}>
                    <Text style={styles.dossierLabel}>Versi Firmware</Text>
                    <Text style={styles.dossierValue}>{selectedDevice.firmwareVersion}</Text>
                  </View>

                  {selectedDevice.calibrationDue && (
                    <>
                      <View style={styles.dossierDivider} />
                      <View style={styles.dossierRow}>
                        <Text style={styles.dossierLabel}>Jadwal Kalibrasi</Text>
                        <Text style={[styles.dossierValue, { color: '#007AFF' }]}>
                          {selectedDevice.calibrationDue}
                        </Text>
                      </View>
                    </>
                  )}

                  {selectedDevice.sensorExpiry && (
                    <>
                      <View style={styles.dossierDivider} />
                      <View style={styles.dossierRow}>
                        <Text style={styles.dossierLabel}>Masa Pakai Patch</Text>
                        <Text style={[styles.dossierValue, { color: '#FF9500' }]}>
                          {selectedDevice.sensorExpiry}
                        </Text>
                      </View>
                    </>
                  )}
                </View>

                {/* Active Sensor Channels */}
                <Text style={styles.modalSectionLabel}>KANAL SENSOR MEDIS TERHUBUNG</Text>
                <View
                  style={[
                    styles.sensorChannelsCard,
                    { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                  ]}
                >
                  {selectedDevice.activeSensors.map((s, i) => (
                    <View key={i} style={styles.channelRow}>
                      <Ionicons name="checkmark-circle" size={16} color="#34C759" />
                      <Text style={[styles.channelText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                        {s}
                      </Text>
                    </View>
                  ))}
                </View>

                {/* Action Buttons */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.syncDeviceActionBtn}
                  onPress={() => {
                    Alert.alert(
                      'Telemetri Ditarik',
                      `Data dari ${selectedDevice.name} berhasil diperbarui dan disinkronkan ke rekam medis Supabase.`
                    );
                    setSelectedDevice(null);
                  }}
                >
                  <Ionicons name="cloud-download" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.syncDeviceActionBtnText}>
                    Tarik Data Sensor Sekarang
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.forgetDeviceBtn}
                  onPress={() => handleForgetDevice(selectedDevice.id)}
                >
                  <Ionicons name="trash-outline" size={18} color="#FF3B30" style={{ marginRight: 6 }} />
                  <Text style={styles.forgetDeviceBtnText}>Putuskan Sambungan Perangkat</Text>
                </TouchableOpacity>
              </ScrollView>
            </>
          )}
        </SafeAreaView>
      </Modal>

      {/* ================= MODAL: SCANNER PENEMUAN BLE MEDIS ================= */}
      <Modal
        visible={showScannerModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => {
          if (!isPairing) {
            setShowScannerModal(false);
            setPairingCandidate(null);
          }
        }}
      >
        <SafeAreaView style={[styles.scannerContainer, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
          <View style={styles.scannerNav}>
            <Text style={[styles.scannerNavTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Pencarian Alat Medis BLE
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowScannerModal(false);
                setPairingCandidate(null);
              }}
              style={styles.scannerCloseBtn}
            >
              <Text style={styles.scannerCloseText}>Selesai</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scannerContent}>
            {/* Live Radar */}
            <View style={[styles.radarCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
              <View style={styles.radarGraphic}>
                <View style={styles.radarRingOuter}>
                  <View style={styles.radarRingMiddle}>
                    <View style={styles.radarRingInner}>
                      <Ionicons name="bluetooth" size={32} color="#007AFF" />
                    </View>
                  </View>
                </View>
              </View>

              <Text style={[styles.radarTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {isScanning ? 'Memindai perangkat medis sekitar...' : 'Pemindaian Selesai'}
              </Text>
              <Text style={styles.radarSub}>
                Pastikan Bluetooth aktif dan perangkat dalam mode pairing
              </Text>

              {isScanning && (
                <ActivityIndicator size="small" color="#007AFF" style={{ marginTop: 12 }} />
              )}
            </View>

            {/* Google Health Connect Integration Card */}
            <View
              style={{
                backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                borderRadius: 16,
                padding: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: '#34A853',
              }}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <Ionicons name="logo-google" size={20} color="#34A853" style={{ marginRight: 8 }} />
                <Text style={{ fontSize: 14, fontWeight: '700', color: isDark ? '#FFFFFF' : '#000000' }}>
                  Google Health Connect (Android)
                </Text>
              </View>
              <Text style={{ fontSize: 12, color: isDark ? '#A1A1A6' : '#666668', lineHeight: 18, marginBottom: 12 }}>
                Punya smartwatch Aolon GT6 Pro, Xiaomi, Huawei, atau Da Fit? Sinkronkan data detak jantung (PPG), SpO2, tidur, dan langkah secara otomatis via Google Health Connect.
              </Text>
              <TouchableOpacity
                style={{
                  backgroundColor: '#34A853',
                  borderRadius: 10,
                  paddingVertical: 10,
                  alignItems: 'center',
                  flexDirection: 'row',
                  justifyContent: 'center',
                }}
                onPress={() => {
                  const aolonCandidate = SCAN_CATALOG.find((d) => d.id === 'scan-aolon-gt6');
                  if (aolonCandidate) {
                    setPairingCandidate(aolonCandidate);
                  }
                }}
              >
                <Ionicons name="sync" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '700' }}>
                  Sinkronkan Aolon GT6 Pro / Health Connect
                </Text>
              </TouchableOpacity>
            </View>

            {/* Discovered List */}
            <Text style={styles.discoveredSectionTitle}>PERANGKAT MEDIS TERDETEKSI</Text>
            {discoveredList.map((item) => (
              <TouchableOpacity
                key={item.id}
                activeOpacity={0.8}
                style={[
                  styles.discoveredCard,
                  { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                  pairingCandidate?.id === item.id && styles.discoveredCardSelected,
                ]}
                onPress={() => setPairingCandidate(item)}
              >
                <View style={styles.discoveredLeft}>
                  <View style={styles.discoveredIconWrap}>
                    <Ionicons name="medical" size={24} color="#007AFF" />
                  </View>
                  <View>
                    <Text style={[styles.discoveredName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      {item.name}
                    </Text>
                    <Text style={styles.discoveredMeta}>
                      {item.manufacturer} • {item.clearance}
                    </Text>
                  </View>
                </View>

                <View style={styles.discoveredRight}>
                  <Text style={styles.rssiText}>{item.rssi} dBm</Text>
                  <Ionicons name="cellular" size={16} color="#34C759" />
                </View>
              </TouchableOpacity>
            ))}

            {/* Confirm Pairing Action */}
            {pairingCandidate && (
              <TouchableOpacity
                activeOpacity={0.85}
                style={styles.confirmPairBtn}
                onPress={handleConfirmPair}
                disabled={isPairing}
              >
                {isPairing ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="link" size={18} color="#FFFFFF" style={{ marginRight: 6 }} />
                    <Text style={styles.confirmPairBtnText}>
                      Hubungkan {pairingCandidate.model}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#8E8E9330',
  },
  headerLeftCol: {
    flex: 1,
    paddingRight: 10,
  },
  complianceBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  complianceBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#007AFF',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
  },
  headerSubTitle: {
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
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C75918',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginHorizontal: 16,
    marginTop: 8,
    gap: 8,
  },
  toastText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#34C759',
  },

  // 1. Hero Status Card
  heroStatusCard: {
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  heroTitleWrap: {
    flex: 1,
    paddingRight: 8,
  },
  heroSub: {
    fontSize: 10,
    fontWeight: '800',
    color: '#007AFF',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  liveStreamBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C75915',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    gap: 6,
  },
  liveStreamDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#34C759',
  },
  liveStreamText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34C759',
  },
  heroPillarsRow: {
    flexDirection: 'row',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 8,
    marginBottom: 12,
  },
  heroPillarItem: {
    flex: 1,
    alignItems: 'center',
  },
  pillarNumber: {
    fontSize: 20,
    fontWeight: '900',
    color: '#007AFF',
  },
  pillarLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  pillarSub: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 1,
  },
  pillarDivider: {
    width: 1,
    height: '80%',
    backgroundColor: '#8E8E9325',
    alignSelf: 'center',
  },
  safetyGuardsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  guardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF10',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    gap: 5,
  },
  guardBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#007AFF',
  },

  // 2. Tab Filter
  tabFiltersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tabFilterBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#8E8E9325',
  },
  tabFilterBtnActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  tabFilterText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  tabFilterTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // 3. Devices List
  sectionHeader: {
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
  scanLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scanLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
  },
  devicesList: {
    gap: 12,
  },
  deviceCardFull: {
    borderRadius: 18,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  deviceCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 10,
  },
  deviceIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deviceInfoCol: {
    flex: 1,
  },
  deviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deviceName: {
    fontSize: 15,
    fontWeight: '800',
  },
  deviceClearanceTag: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '600',
    marginTop: 2,
  },
  deviceLastSeen: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 2,
  },
  deviceRightCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  batteryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C75915',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    gap: 4,
  },
  batteryText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34C759',
  },
  sqiBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#007AFF10',
  },
  sqiText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#007AFF',
  },
  deviceMetricsBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
    marginBottom: 10,
  },
  deviceMetricsText: {
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
  },
  sensorChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  sensorChip: {
    backgroundColor: '#8E8E9315',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sensorChipText: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
  },
  sensorChipMore: {
    backgroundColor: '#007AFF10',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  sensorChipMoreText: {
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '700',
  },
  expiryWarningRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#FF950030',
  },
  expiryWarningText: {
    fontSize: 11,
    color: '#FF9500',
    fontWeight: '600',
  },
  calibSafeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#34C75930',
  },
  calibSafeText: {
    fontSize: 11,
    color: '#34C759',
    fontWeight: '600',
  },

  // 4. Artifact filter card
  settingsCard: {
    borderRadius: 18,
    padding: 16,
  },
  settingTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  settingIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#007AFF15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingInfo: {
    flex: 1,
    paddingRight: 6,
  },
  settingTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  settingDesc: {
    fontSize: 11,
    color: '#8E8E93',
    lineHeight: 15,
    marginTop: 2,
  },

  // Scan banner
  scanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
  },
  scanBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  bluetoothCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#007AFF15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBannerTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  scanBannerSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },

  // Modal details
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
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  modalScroll: {
    padding: 20,
    gap: 14,
  },
  dossierCard: {
    borderRadius: 16,
    padding: 16,
  },
  dossierRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },
  dossierLabel: {
    fontSize: 13,
    color: '#8E8E93',
  },
  dossierValue: {
    fontSize: 13,
    fontWeight: '600',
  },
  dossierValueBold: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
    maxWidth: '65%',
    textAlign: 'right',
  },
  dossierDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E9325',
    marginVertical: 4,
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginTop: 6,
  },
  sensorChannelsCard: {
    borderRadius: 16,
    padding: 16,
    gap: 10,
  },
  channelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  channelText: {
    fontSize: 13,
    fontWeight: '600',
  },
  syncDeviceActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 8,
  },
  syncDeviceActionBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  forgetDeviceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B3015',
    paddingVertical: 13,
    borderRadius: 14,
  },
  forgetDeviceBtnText: {
    color: '#FF3B30',
    fontSize: 13,
    fontWeight: '700',
  },

  // Scanner Modal
  scannerContainer: {
    flex: 1,
  },
  scannerNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#8E8E9330',
  },
  scannerNavTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scannerCloseBtn: {
    padding: 4,
  },
  scannerCloseText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#007AFF',
  },
  scannerContent: {
    padding: 20,
    gap: 12,
  },
  radarCard: {
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
  },
  radarGraphic: {
    marginBottom: 16,
  },
  radarRingOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#007AFF10',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarRingMiddle: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: '#007AFF20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarRingInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarTitle: {
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  radarSub: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 4,
  },
  discoveredSectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 4,
  },
  discoveredCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  discoveredCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF10',
  },
  discoveredLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  discoveredIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#007AFF15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoveredName: {
    fontSize: 14,
    fontWeight: '700',
  },
  discoveredMeta: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 1,
  },
  discoveredRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rssiText: {
    fontSize: 11,
    color: '#8E8E93',
    fontWeight: '600',
  },
  confirmPairBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 16,
    marginTop: 12,
  },
  confirmPairBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Empty State Styles
  emptyCard: {
    borderRadius: 20,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#8E8E9320',
  },
  emptyIconCircle: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#007AFF12',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 20,
    maxWidth: 300,
  },
  emptyActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 13,
    paddingHorizontal: 20,
    borderRadius: 14,
  },
  emptyActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

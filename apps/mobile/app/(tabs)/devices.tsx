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
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export interface PairedDevice {
  id: string;
  name: string;
  model: string;
  type: 'blood_pressure' | 'scale' | 'oximeter' | 'glucose';
  battery: number;
  lastSeen: string;
  connected: boolean;
}

export interface DiscoveredDevice {
  id: string;
  name: string;
  model: string;
  type: 'blood_pressure' | 'scale' | 'oximeter' | 'glucose';
  rssi: number; // Signal strength in dBm
  manufacturer: string;
}

const INITIAL_PAIRED: PairedDevice[] = [
  {
    id: 'dev-bp-5250',
    name: 'My BP5250',
    model: 'BP5250',
    type: 'blood_pressure',
    battery: 100,
    lastSeen: '2:36 PM',
    connected: true,
  },
];

const SCAN_CATALOG: DiscoveredDevice[] = [
  {
    id: 'scan-sc-150',
    name: 'Smart Body Composition Scale',
    model: 'SC-150',
    type: 'scale',
    rssi: -52,
    manufacturer: 'Spezi Health Instruments',
  },
  {
    id: 'scan-omron-7156',
    name: 'Omron HEM-7156T Bluetooth Monitor',
    model: 'HEM-7156T',
    type: 'blood_pressure',
    rssi: -58,
    manufacturer: 'Omron Healthcare',
  },
  {
    id: 'scan-beurer-bm57',
    name: 'Beurer BM 57 Upper Arm Cuff',
    model: 'BM 57',
    type: 'blood_pressure',
    rssi: -66,
    manufacturer: 'Beurer Medical',
  },
  {
    id: 'scan-accu-instant',
    name: 'Accu-Chek Instant Blood Glucose',
    model: 'Instant BLE',
    type: 'glucose',
    rssi: -72,
    manufacturer: 'Roche Diabetes Care',
  },
  {
    id: 'scan-wellue-ring',
    name: 'Wellue O2Ring Continuous Pulse Oximeter',
    model: 'O2Ring',
    type: 'oximeter',
    rssi: -64,
    manufacturer: 'Viatom / Wellue',
  },
];

export default function DevicesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [pairedDevices, setPairedDevices] = useState<PairedDevice[]>(INITIAL_PAIRED);
  const [selectedDevice, setSelectedDevice] = useState<PairedDevice | null>(null);

  // Discovery / Scanner States
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [discoveredList, setDiscoveredList] = useState<DiscoveredDevice[]>([]);
  const [pairingCandidate, setPairingCandidate] = useState<DiscoveredDevice | null>(null);
  const [isPairing, setIsPairing] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Start BLE discovery scan
  const startScan = () => {
    setIsScanning(true);
    setDiscoveredList([]);
    setShowScannerModal(true);

    // Filter out already paired devices from the discovered list
    const pairedModels = new Set(pairedDevices.map((d) => d.model));
    const available = SCAN_CATALOG.filter((d) => !pairedModels.has(d.model));

    // Stagger discovery of devices for realistic feel
    setTimeout(() => {
      setDiscoveredList(available.slice(0, 2));
    }, 600);

    setTimeout(() => {
      setDiscoveredList(available.slice(0, 4));
    }, 1400);

    setTimeout(() => {
      setDiscoveredList(available);
      setIsScanning(false);
    }, 2200);
  };

  const handleSelectDiscoveredDevice = (device: DiscoveredDevice) => {
    setPairingCandidate(device);
  };

  const handleConfirmPair = () => {
    if (!pairingCandidate) return;

    setIsPairing(true);

    setTimeout(() => {
      const newPaired: PairedDevice = {
        id: `dev-${Date.now()}`,
        name: pairingCandidate.name,
        model: pairingCandidate.model,
        type: pairingCandidate.type,
        battery: 100,
        lastSeen: 'Just now',
        connected: true,
      };

      setPairedDevices((prev) => [...prev, newPaired]);
      setIsPairing(false);
      setPairingCandidate(null);
      setShowScannerModal(false);

      setToastMessage(`Successfully paired "${newPaired.model}"`);
      setTimeout(() => setToastMessage(null), 3500);
    }, 1200);
  };

  const handleForgetDevice = (deviceId: string) => {
    Alert.alert(
      'Forget This Device?',
      'You will need to re-pair this accessory to sync vital telemetry.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Forget Device',
          style: 'destructive',
          onPress: () => {
            setPairedDevices((prev) => prev.filter((d) => d.id !== deviceId));
            setSelectedDevice(null);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          Devices
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={startScan}
            style={styles.headerIconButton}
            accessibilityLabel="Search and Pair Accessory"
          >
            <Ionicons name="add" size={28} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={startScan} style={styles.headerIconButton}>
            <Ionicons name="search" size={22} color="#007AFF" />
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

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Paired Devices Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>MY PAIRED ACCESSORIES</Text>
          <TouchableOpacity onPress={startScan} style={styles.scanLink}>
            <Ionicons name="bluetooth" size={14} color="#007AFF" />
            <Text style={styles.scanLinkText}>Pair New</Text>
          </TouchableOpacity>
        </View>

        {/* Device Cards Grid */}
        <View style={styles.deviceGrid}>
          {pairedDevices.map((device) => (
            <TouchableOpacity
              key={device.id}
              activeOpacity={0.8}
              onPress={() => setSelectedDevice(device)}
              style={[
                styles.deviceCard,
                { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
              ]}
            >
              <View style={styles.deviceCardIconWrap}>
                {device.type === 'blood_pressure' ? (
                  <Ionicons name="heart-circle" size={54} color="#007AFF" />
                ) : device.type === 'scale' ? (
                  <Ionicons name="speedometer" size={54} color="#34C759" />
                ) : device.type === 'glucose' ? (
                  <Ionicons name="water" size={54} color="#FF9500" />
                ) : (
                  <Ionicons name="pulse" size={54} color="#FF2D55" />
                )}
              </View>
              <View style={styles.deviceCardFooter}>
                <Text
                  numberOfLines={1}
                  style={[styles.deviceCardModel, { color: isDark ? '#FFFFFF' : '#000000' }]}
                >
                  {device.model}
                </Text>
                <View style={styles.batteryBadge}>
                  <Ionicons name="battery-charging" size={16} color="#34C759" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {pairedDevices.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="bluetooth-outline" size={60} color="#8E8E93" />
            <Text style={styles.emptyTitle}>No Devices Paired</Text>
            <Text style={styles.emptySubtitle}>
              Pair an Omron blood pressure monitor, Bluetooth scale, or pulse oximeter to sync your vitals.
            </Text>
            <TouchableOpacity onPress={startScan} style={styles.emptyButton}>
              <Ionicons name="search" size={16} color="#FFFFFF" style={{ marginRight: 6 }} />
              <Text style={styles.emptyButtonText}>Scan for Nearby Devices</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Prominent Scan Banner */}
        {pairedDevices.length > 0 && (
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={startScan}
            style={[styles.scanBanner, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
          >
            <View style={styles.scanBannerLeft}>
              <View style={styles.bluetoothCircle}>
                <Ionicons name="bluetooth" size={24} color="#007AFF" />
              </View>
              <View>
                <Text style={[styles.scanBannerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  Find Nearby BLE Accessories
                </Text>
                <Text style={styles.scanBannerSubtitle}>
                  Scan and pair blood pressure cuffs, scales, or monitors
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#8E8E93" />
          </TouchableOpacity>
        )}
      </ScrollView>

      {/* ------------------------------------------------------------- */}
      {/* DISCOVERY SCANNER MODAL: "Searching for Nearby Devices" */}
      {/* ------------------------------------------------------------- */}
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
          {/* Scanner Header */}
          <View style={styles.scannerNav}>
            <Text style={[styles.scannerNavTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Search Devices
            </Text>
            <TouchableOpacity
              onPress={() => {
                setShowScannerModal(false);
                setPairingCandidate(null);
              }}
              style={styles.scannerCloseBtn}
            >
              <Text style={styles.scannerCloseText}>Done</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.scannerContent}>
            {/* Live Radar / Status Card */}
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
                {isScanning ? 'Searching for nearby accessories...' : 'Scanning Complete'}
              </Text>
              <Text style={styles.radarSubtitle}>
                Ensure your medical device is turned on and placed in Bluetooth pairing mode.
              </Text>

              {isScanning ? (
                <View style={styles.scanningIndicator}>
                  <ActivityIndicator size="small" color="#007AFF" />
                  <Text style={styles.scanningIndicatorText}>Listening for BLE advertising packets...</Text>
                </View>
              ) : (
                <TouchableOpacity onPress={startScan} style={styles.rescanBtn}>
                  <Ionicons name="refresh" size={15} color="#007AFF" style={{ marginRight: 4 }} />
                  <Text style={styles.rescanText}>Scan Again</Text>
                </TouchableOpacity>
              )}
            </View>

            {/* Discovered Accessories List */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                DISCOVERED DEVICES ({discoveredList.length})
              </Text>
            </View>

            <View style={[styles.groupedList, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
              {discoveredList.map((dev, idx) => (
                <React.Fragment key={dev.id}>
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => handleSelectDiscoveredDevice(dev)}
                    style={styles.discoveredRow}
                  >
                    <View style={styles.discoveredLeft}>
                      <View
                        style={[
                          styles.discoveredIconWrap,
                          {
                            backgroundColor:
                              dev.type === 'blood_pressure'
                                ? '#007AFF15'
                                : dev.type === 'scale'
                                ? '#34C75915'
                                : dev.type === 'glucose'
                                ? '#FF950015'
                                : '#FF2D5515',
                          },
                        ]}
                      >
                        <Ionicons
                          name={
                            dev.type === 'blood_pressure'
                              ? 'heart-circle'
                              : dev.type === 'scale'
                              ? 'speedometer'
                              : dev.type === 'glucose'
                              ? 'water'
                              : 'pulse'
                          }
                          size={24}
                          color={
                            dev.type === 'blood_pressure'
                              ? '#007AFF'
                              : dev.type === 'scale'
                              ? '#34C759'
                              : dev.type === 'glucose'
                              ? '#FF9500'
                              : '#FF2D55'
                          }
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={[styles.discoveredName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                          {dev.name}
                        </Text>
                        <Text style={styles.discoveredMeta}>
                          Model: {dev.model} • {dev.manufacturer}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.discoveredRight}>
                      <View style={styles.signalBadge}>
                        <Ionicons name="cellular" size={14} color="#34C759" />
                        <Text style={styles.signalText}>{dev.rssi} dBm</Text>
                      </View>
                      <Text style={styles.pairActionText}>Pair</Text>
                    </View>
                  </TouchableOpacity>

                  {idx < discoveredList.length - 1 && (
                    <View style={[styles.divider, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]} />
                  )}
                </React.Fragment>
              ))}

              {discoveredList.length === 0 && (
                <View style={{ padding: 24, alignItems: 'center' }}>
                  <Text style={{ fontSize: 14, color: '#8E8E93' }}>Scanning for devices...</Text>
                </View>
              )}
            </View>
          </ScrollView>

          {/* ------------------------------------------------------------- */}
          {/* NATIVE SPEZI BOTTOM SHEET: "Pair Accessory" */}
          {/* ------------------------------------------------------------- */}
          {pairingCandidate && (
            <View style={styles.sheetOverlay}>
              <View style={[styles.bottomSheet, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
                {/* Close Button */}
                <TouchableOpacity
                  style={styles.sheetCloseButton}
                  onPress={() => setPairingCandidate(null)}
                >
                  <Ionicons name="close-circle" size={26} color="#8E8E93" />
                </TouchableOpacity>

                <Text style={[styles.sheetTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  Pair Accessory
                </Text>
                <Text style={styles.sheetSubtitle}>
                  Do you want to pair "{pairingCandidate.model}" with the Sehat app?
                </Text>

                {/* Accessory Illustration */}
                <View style={styles.sheetImageWrap}>
                  <View style={styles.scalePlaceholder}>
                    <Ionicons
                      name={
                        pairingCandidate.type === 'blood_pressure'
                          ? 'heart-circle'
                          : pairingCandidate.type === 'scale'
                          ? 'scale-outline'
                          : pairingCandidate.type === 'glucose'
                          ? 'water-outline'
                          : 'pulse-outline'
                      }
                      size={72}
                      color="#007AFF"
                    />
                    <Text style={styles.scaleLabel}>{pairingCandidate.model}</Text>
                  </View>
                </View>

                {/* Pair Button */}
                <TouchableOpacity
                  onPress={handleConfirmPair}
                  disabled={isPairing}
                  style={[styles.primaryButton, isPairing && { opacity: 0.7 }]}
                >
                  <Text style={styles.primaryButtonText}>
                    {isPairing ? 'Pairing BLE Handshake...' : 'Pair'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </SafeAreaView>
      </Modal>

      {/* ------------------------------------------------------------- */}
      {/* SCREEN 2: "Device Details" Modal */}
      {/* ------------------------------------------------------------- */}
      <Modal
        visible={Boolean(selectedDevice)}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setSelectedDevice(null)}
      >
        {selectedDevice && (
          <SafeAreaView style={[styles.detailContainer, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
            {/* Navigation Bar */}
            <View style={styles.detailNav}>
              <TouchableOpacity
                onPress={() => setSelectedDevice(null)}
                style={styles.detailBackBtn}
              >
                <Ionicons name="chevron-back" size={24} color="#007AFF" />
                <Text style={styles.detailBackText}>Devices</Text>
              </TouchableOpacity>
              <Text style={[styles.detailNavTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Device Details
              </Text>
              <View style={{ width: 60 }} />
            </View>

            <ScrollView contentContainerStyle={styles.detailContent}>
              {/* Device Graphic Card */}
              <View style={[styles.detailHeroCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
                <Ionicons
                  name={
                    selectedDevice.type === 'blood_pressure'
                      ? 'heart-circle'
                      : selectedDevice.type === 'scale'
                      ? 'scale'
                      : selectedDevice.type === 'glucose'
                      ? 'water'
                      : 'pulse'
                  }
                  size={96}
                  color="#007AFF"
                />
              </View>

              {/* Grouped Properties List */}
              <View style={[styles.groupedList, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
                <View style={styles.groupedRow}>
                  <Text style={[styles.groupedLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    Name
                  </Text>
                  <View style={styles.groupedValueWithChevron}>
                    <Text style={styles.groupedValueText}>{selectedDevice.name}</Text>
                    <Ionicons name="chevron-forward" size={16} color="#8E8E93" />
                  </View>
                </View>

                <View style={[styles.divider, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]} />

                <View style={styles.groupedRow}>
                  <Text style={[styles.groupedLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    Model
                  </Text>
                  <Text style={styles.groupedValueText}>{selectedDevice.model}</Text>
                </View>

                <View style={[styles.divider, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]} />

                <View style={styles.groupedRow}>
                  <Text style={[styles.groupedLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    Battery
                  </Text>
                  <View style={styles.batteryRow}>
                    <Text style={styles.groupedValueText}>{selectedDevice.battery} %</Text>
                    <Ionicons name="battery-full" size={20} color="#34C759" style={{ marginLeft: 6 }} />
                  </View>
                </View>
              </View>

              {/* Grouped Actions List */}
              <View style={[styles.groupedList, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', marginTop: 24 }]}>
                <TouchableOpacity
                  onPress={() => handleForgetDevice(selectedDevice.id)}
                  style={styles.groupedRow}
                >
                  <Text style={styles.dangerText}>Forget This Device</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.footnoteText}>
                This device was last seen at {selectedDevice.lastSeen}
              </Text>
            </ScrollView>
          </SafeAreaView>
        )}
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
    paddingTop: 10,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerIconButton: {
    padding: 6,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    marginHorizontal: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  toastText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
  },
  scrollContent: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.6,
  },
  scanLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  scanLinkText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
  },
  deviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 20,
  },
  deviceCard: {
    width: 140,
    height: 140,
    borderRadius: 22,
    padding: 14,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  deviceCardIconWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  deviceCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deviceCardModel: {
    fontSize: 14,
    fontWeight: '700',
    maxWidth: 90,
  },
  batteryBadge: {
    padding: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 30,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#8E8E93',
    marginTop: 12,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 20,
    lineHeight: 18,
  },
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
  },
  emptyButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  scanBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  scanBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    flex: 1,
  },
  bluetoothCircle: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#007AFF15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanBannerTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  scanBannerSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
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
  },
  scannerNavTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  scannerCloseBtn: {
    paddingVertical: 4,
  },
  scannerCloseText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#007AFF',
  },
  scannerContent: {
    padding: 20,
  },
  radarCard: {
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1,
  },
  radarGraphic: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  radarRingOuter: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 1.5,
    borderColor: '#007AFF30',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarRingMiddle: {
    width: 86,
    height: 86,
    borderRadius: 43,
    borderWidth: 1.5,
    borderColor: '#007AFF60',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarRingInner: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#007AFF15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radarTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 4,
    textAlign: 'center',
  },
  radarSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  scanningIndicatorText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '500',
  },
  rescanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF15',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
  },
  rescanText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },

  // Discovered List
  groupedList: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  discoveredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  discoveredLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  discoveredIconWrap: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discoveredName: {
    fontSize: 15,
    fontWeight: '600',
  },
  discoveredMeta: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  discoveredRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  signalBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  signalText: {
    fontSize: 11,
    color: '#34C759',
    fontWeight: '600',
  },
  pairActionText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#007AFF',
  },

  // Native Spezi Pair Bottom Sheet
  sheetOverlay: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
    zIndex: 99,
  },
  bottomSheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 28,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    alignItems: 'center',
  },
  sheetCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
  },
  sheetTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 6,
  },
  sheetSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 24,
  },
  sheetImageWrap: {
    width: 150,
    height: 150,
    borderRadius: 24,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  scalePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  scaleLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
    marginTop: 4,
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },

  // Detail Modal
  detailContainer: {
    flex: 1,
  },
  detailNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  detailBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailBackText: {
    fontSize: 17,
    color: '#007AFF',
    marginLeft: -4,
  },
  detailNavTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  detailContent: {
    padding: 20,
  },
  detailHeroCard: {
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 36,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  groupedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  groupedLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  groupedValueWithChevron: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  groupedValueText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  batteryRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 16,
  },
  dangerText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FF3B30',
  },
  footnoteText: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 12,
  },
});

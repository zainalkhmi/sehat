import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Image,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface PairedDevice {
  id: string;
  name: string;
  model: string;
  type: 'blood_pressure' | 'scale' | 'oximeter';
  battery: number;
  lastSeen: string;
  connected: boolean;
}

const INITIAL_DEVICES: PairedDevice[] = [
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

export default function DevicesScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];

  const [devices, setDevices] = useState<PairedDevice[]>(INITIAL_DEVICES);
  const [selectedDevice, setSelectedDevice] = useState<PairedDevice | null>(null);
  const [showPairModal, setShowPairModal] = useState(false);
  const [isPairing, setIsPairing] = useState(false);

  const handlePairAccessory = () => {
    setIsPairing(true);
    setTimeout(() => {
      const newDevice: PairedDevice = {
        id: `dev-scale-${Date.now()}`,
        name: 'Smart Scale SC-150',
        model: 'SC-150',
        type: 'scale',
        battery: 95,
        lastSeen: 'Just now',
        connected: true,
      };
      setDevices((prev) => [...prev, newDevice]);
      setIsPairing(false);
      setShowPairModal(false);
    }, 1200);
  };

  const handleForgetDevice = (deviceId: string) => {
    Alert.alert(
      'Forget This Device?',
      'You will need to re-pair this accessory to sync vital measurements.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Forget Device',
          style: 'destructive',
          onPress: () => {
            setDevices((prev) => prev.filter((d) => d.id !== deviceId));
            setSelectedDevice(null);
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>Devices</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={() => setShowPairModal(true)}
            style={styles.headerIconButton}
            accessibilityLabel="Pair Accessory"
          >
            <Ionicons name="add" size={26} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="ellipsis-horizontal-circle" size={26} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Device Cards Grid */}
        <View style={styles.deviceGrid}>
          {devices.map((device) => (
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
                ) : (
                  <Ionicons name="speedometer" size={54} color="#34C759" />
                )}
              </View>
              <View style={styles.deviceCardFooter}>
                <Text style={[styles.deviceCardModel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  {device.model}
                </Text>
                <View style={styles.batteryBadge}>
                  <Ionicons name="battery-charging" size={16} color="#34C759" />
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {devices.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="bluetooth-outline" size={60} color="#8E8E93" />
            <Text style={styles.emptyTitle}>No Devices Paired</Text>
            <Text style={styles.emptySubtitle}>
              Tap + above to pair an Omron BLE blood pressure cuff or smart health scale.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* ------------------------------------------------------------- */}
      {/* SCREEN 1: "Pair Accessory" Bottom Sheet Modal */}
      {/* ------------------------------------------------------------- */}
      <Modal
        visible={showPairModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowPairModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.bottomSheet, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            {/* Close button */}
            <TouchableOpacity
              style={styles.sheetCloseButton}
              onPress={() => setShowPairModal(false)}
            >
              <Ionicons name="close-circle" size={26} color="#8E8E93" />
            </TouchableOpacity>

            <Text style={[styles.sheetTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Pair Accessory
            </Text>
            <Text style={styles.sheetSubtitle}>
              Do you want to pair "SC-150" with the Sehat app?
            </Text>

            {/* Accessory Illustration */}
            <View style={styles.sheetImageWrap}>
              <View style={styles.scalePlaceholder}>
                <Ionicons name="scale-outline" size={72} color="#007AFF" />
                <Text style={styles.scaleLabel}>SC-150</Text>
              </View>
            </View>

            {/* Pair Button */}
            <TouchableOpacity
              onPress={handlePairAccessory}
              disabled={isPairing}
              style={[styles.primaryButton, isPairing && { opacity: 0.7 }]}
            >
              <Text style={styles.primaryButtonText}>
                {isPairing ? 'Pairing...' : 'Pair'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
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
                  name={selectedDevice.type === 'blood_pressure' ? 'heart-circle' : 'scale'}
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
    gap: 12,
  },
  headerIconButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
  },
  deviceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
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
  },
  batteryBadge: {
    padding: 2,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
    lineHeight: 18,
  },

  // Pair Modal Bottom Sheet
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
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
  groupedList: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
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

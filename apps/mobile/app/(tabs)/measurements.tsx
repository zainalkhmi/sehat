import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

interface ClinicalMeasurement {
  id: string;
  type: 'bp' | 'hr' | 'spo2' | 'weight';
  title: string;
  value: string;
  subValue?: string;
  source: string;
  timestamp: string;
  status: 'normal' | 'optimal' | 'elevated';
}

const INITIAL_MEASUREMENTS: ClinicalMeasurement[] = [
  {
    id: 'm-01',
    type: 'bp',
    title: 'Blood Pressure',
    value: '103/64 mmHg',
    subValue: '62 BPM',
    source: 'Omron BP5250',
    timestamp: 'Today, 2:36 PM',
    status: 'optimal',
  },
  {
    id: 'm-02',
    type: 'hr',
    title: 'Resting Heart Rate',
    value: '72 bpm',
    source: 'Apple Watch',
    timestamp: 'Today, 08:30 AM',
    status: 'normal',
  },
  {
    id: 'm-03',
    type: 'spo2',
    title: 'Oxygen Saturation',
    value: '98 %',
    source: 'Apple Watch',
    timestamp: 'Yesterday, 10:15 PM',
    status: 'normal',
  },
];

export default function MeasurementsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const theme = Colors[colorScheme ?? 'light'];

  const [measurements, setMeasurements] = useState<ClinicalMeasurement[]>(INITIAL_MEASUREMENTS);
  const [showRecordedModal, setShowRecordedModal] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [saveToast, setSaveToast] = useState(false);

  // New simulated measurement values
  const [currentReading, setCurrentReading] = useState({
    systolic: 103,
    diastolic: 64,
    pulse: 62,
  });

  const handleTriggerMeasurement = () => {
    // Generate slight realistic variation
    const sys = Math.floor(100 + Math.random() * 15);
    const dia = Math.floor(62 + Math.random() * 10);
    const pulse = Math.floor(60 + Math.random() * 8);

    setCurrentReading({ systolic: sys, diastolic: dia, pulse });
    setShowRecordedModal(true);
  };

  const handleSave = () => {
    const newMeasurement: ClinicalMeasurement = {
      id: `m-${Date.now()}`,
      type: 'bp',
      title: 'Blood Pressure',
      value: `${currentReading.systolic}/${currentReading.diastolic} mmHg`,
      subValue: `${currentReading.pulse} BPM`,
      source: 'Omron BP5250',
      timestamp: 'Just now',
      status: currentReading.systolic > 120 ? 'elevated' : 'optimal',
    };

    setMeasurements([newMeasurement, ...measurements]);
    setShowRecordedModal(false);
    setSaveToast(true);
    setTimeout(() => setSaveToast(false), 3000);
  };

  const handleDiscard = () => {
    setShowRecordedModal(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
          Measurements
        </Text>
        <View style={styles.headerActions}>
          <TouchableOpacity
            onPress={handleTriggerMeasurement}
            style={styles.headerIconButton}
            accessibilityLabel="Record Measurement"
          >
            <Ionicons name="add" size={26} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerIconButton}>
            <Ionicons name="ellipsis-horizontal-circle" size={26} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Save Toast */}
      {saveToast && (
        <View style={styles.toast}>
          <Ionicons name="checkmark-circle" size={18} color="#34C759" />
          <Text style={styles.toastText}>Measurement saved & synced to Clinical Record</Text>
        </View>
      )}

      {/* Measurements List */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={[styles.groupedList, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          {measurements.map((item, index) => (
            <React.Fragment key={item.id}>
              <View style={styles.measurementRow}>
                <View style={styles.measurementLeft}>
                  <View
                    style={[
                      styles.iconWrap,
                      {
                        backgroundColor:
                          item.type === 'bp'
                            ? '#007AFF15'
                            : item.type === 'hr'
                            ? '#FF2D5515'
                            : '#34C75915',
                      },
                    ]}
                  >
                    <Ionicons
                      name={
                        item.type === 'bp'
                          ? 'heart-circle'
                          : item.type === 'hr'
                          ? 'pulse'
                          : 'water'
                      }
                      size={24}
                      color={
                        item.type === 'bp'
                          ? '#007AFF'
                          : item.type === 'hr'
                          ? '#FF2D55'
                          : '#34C759'
                      }
                    />
                  </View>
                  <View>
                    <Text style={[styles.itemTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                      {item.title}
                    </Text>
                    <Text style={styles.itemMeta}>
                      {item.source} • {item.timestamp}
                    </Text>
                  </View>
                </View>

                <View style={styles.measurementRight}>
                  <Text style={[styles.itemValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    {item.value}
                  </Text>
                  {item.subValue && <Text style={styles.itemSubValue}>{item.subValue}</Text>}
                </View>
              </View>

              {index < measurements.length - 1 && (
                <View style={[styles.divider, { backgroundColor: isDark ? '#2C2C2E' : '#E5E5EA' }]} />
              )}
            </React.Fragment>
          ))}
        </View>
      </ScrollView>

      {/* ------------------------------------------------------------- */}
      {/* SCREEN 3: "Measurement Recorded" Bottom Sheet Modal */}
      {/* ------------------------------------------------------------- */}
      <Modal
        visible={showRecordedModal}
        transparent
        animationType="slide"
        onRequestClose={handleDiscard}
      >
        <View style={styles.modalBackdrop}>
          <View style={[styles.bottomSheet, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            {/* Grab handle */}
            <View style={styles.sheetHandle} />

            {/* Close icon */}
            <TouchableOpacity style={styles.sheetCloseButton} onPress={handleDiscard}>
              <Ionicons name="close-circle" size={26} color="#8E8E93" />
            </TouchableOpacity>

            <Text style={[styles.sheetTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Measurement Recorded
            </Text>

            {/* Big Numbers Display */}
            <View style={styles.readingHero}>
              <Text style={[styles.largeValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {currentReading.systolic}/{currentReading.diastolic} mmHg
              </Text>
              <Text style={styles.subReadingText}>{currentReading.pulse} BPM</Text>
            </View>

            {/* Validation / Sync Switch */}
            <View style={styles.switchRow}>
              <Text style={[styles.switchLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Verified with Omron Cuff
              </Text>
              <Switch
                value={autoSync}
                onValueChange={setAutoSync}
                trackColor={{ false: '#767577', true: '#34C759' }}
                thumbColor="#FFFFFF"
              />
            </View>

            {/* Action Buttons */}
            <TouchableOpacity onPress={handleSave} style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleDiscard} style={styles.discardButton}>
              <Text style={styles.discardButtonText}>Discard</Text>
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
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    marginHorizontal: 20,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  toastText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
  },
  groupedList: {
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  measurementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  measurementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  itemMeta: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  measurementRight: {
    alignItems: 'flex-end',
  },
  itemValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  itemSubValue: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginLeft: 72,
  },

  // Modal Bottom Sheet
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    paddingHorizontal: 24,
    paddingTop: 14,
    paddingBottom: Platform.OS === 'ios' ? 44 : 28,
    alignItems: 'center',
  },
  sheetHandle: {
    width: 36,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#C7C7CC',
    marginBottom: 20,
  },
  sheetCloseButton: {
    position: 'absolute',
    top: 18,
    right: 20,
    zIndex: 10,
  },
  sheetTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  readingHero: {
    alignItems: 'center',
    marginVertical: 18,
  },
  largeValue: {
    fontSize: 38,
    fontWeight: '800',
    letterSpacing: -1,
  },
  subReadingText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginTop: 6,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 14,
    marginBottom: 20,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#007AFF',
    borderRadius: 16,
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 10,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  discardButton: {
    paddingVertical: 10,
  },
  discardButtonText: {
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: '600',
  },
});


import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Animated,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PilloAvatar, PilloMood } from './PilloAvatar';
import { pilloAudio } from '../utils/pilloAudio';

export interface PilloMedication {
  id: string;
  name: string;
  strength: string;
  dosePerIntake: number;
  doseUnit: string;
  scheduledTime: string;
  instruction: string;
  indication?: string;
  remainingStock?: number;
}

interface PilloReminderModalProps {
  visible: boolean;
  medication?: PilloMedication;
  initialMood?: PilloMood;
  onClose: () => void;
  onTakeNow?: (med: PilloMedication) => void;
  onSkip?: (med: PilloMedication, reason?: string) => void;
  onReschedule?: (med: PilloMedication, minutes: number) => void;
}

export const PilloReminderModal: React.FC<PilloReminderModalProps> = ({
  visible,
  medication,
  initialMood = 'calm',
  onClose,
  onTakeNow,
  onSkip,
  onReschedule,
}) => {
  // Current active medication fallback
  const activeMed: PilloMedication = medication || {
    id: 'med-demo',
    name: 'Metformin',
    strength: '500 mg',
    dosePerIntake: 1,
    doseUnit: 'tablet',
    scheduledTime: '7:00 AM',
    instruction: 'Bersama Makan Pagi',
    indication: 'Kontrol Glukosa Darah',
    remainingStock: 28,
  };

  // State
  const [mood, setMood] = useState<PilloMood>(initialMood);
  const [isMuted, setIsMuted] = useState(pilloAudio.getIsMuted());
  const [viewMode, setViewMode] = useState<'alarm' | 'countdown' | 'snooze'>('alarm');
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const [snoozeTab, setSnoozeTab] = useState<'duration' | 'time'>('duration');
  const [selectedDuration, setSelectedDuration] = useState(10); // 10 mins
  const [countdownSeconds, setCountdownSeconds] = useState(40); // 00:40
  const [lateMinutes, setLateMinutes] = useState(mood === 'furious' ? 10 : 0);

  // Sound chime on modal open or mood change
  useEffect(() => {
    if (visible) {
      if (mood === 'calm') {
        pilloAudio.playCalmChime();
      } else if (mood === 'annoyed' || viewMode === 'countdown') {
        pilloAudio.playUrgentChime();
      } else if (mood === 'furious') {
        pilloAudio.playFuriousAlarm();
      }
    }
  }, [visible, mood, viewMode]);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (visible && viewMode === 'countdown' && countdownSeconds > 0) {
      timer = setInterval(() => {
        setCountdownSeconds((prev) => {
          if (prev <= 1) {
            // Timer expired -> Escalate to Furious!
            setMood('furious');
            setViewMode('alarm');
            setLateMinutes(10);
            pilloAudio.playFuriousAlarm();
            return 0;
          }
          if (prev === 20) {
            setMood('annoyed');
            pilloAudio.playUrgentChime();
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [visible, viewMode, countdownSeconds]);

  // Handle Mute Toggle
  const toggleMute = () => {
    const nextState = !isMuted;
    setIsMuted(nextState);
    pilloAudio.setMuted(nextState);
    if (!nextState) {
      pilloAudio.playCalmChime();
    }
  };

  // Handle Take Now Action
  const handleTakeNow = () => {
    setMood('celebrate');
    pilloAudio.playSuccessFanfare();

    setTimeout(() => {
      if (onTakeNow) {
        onTakeNow(activeMed);
      }
      onClose();
    }, 1200);
  };

  // Handle Skip Action
  const handleSkipPrompt = () => {
    Alert.alert(
      'Lewati Jadwal Obat Ini?',
      `Apakah Anda yakin ingin melewatkan jadwal ${activeMed.name} (${activeMed.dosePerIntake} ${activeMed.doseUnit})? Catatan ini akan dilaporkan ke DPJP.`,
      [
        { text: 'Batal', style: 'cancel' },
        {
          text: 'Ya, Lewati',
          style: 'destructive',
          onPress: () => {
            if (onSkip) {
              onSkip(activeMed, 'Dilewati oleh pasien');
            }
            onClose();
          },
        },
      ]
    );
  };

  // Handle Snooze Confirmation
  const handleConfirmSnooze = () => {
    pilloAudio.playCalmChime();
    Alert.alert(
      '⏰ Alarm Ditunda (Snoozed)',
      `Dosis ${activeMed.name} tetap berstatus pending. Pillo akan kembali membunyikan alarm dalam ${selectedDuration} menit.`,
      [
        {
          text: 'Mengerti',
          onPress: () => {
            if (onReschedule) {
              onReschedule(activeMed, selectedDuration);
            }
            onClose();
          },
        },
      ]
    );
  };

  // Switcher Helper for Demos
  const setDemoMode = (targetMood: PilloMood, mode: 'alarm' | 'countdown') => {
    setMood(targetMood);
    setViewMode(mode);
    if (targetMood === 'furious') {
      setLateMinutes(10);
    } else {
      setLateMinutes(0);
      setCountdownSeconds(40);
    }
  };

  // Background and Theme styles
  const isFurious = mood === 'furious';
  const bgColor = isFurious ? '#260F16' : '#0B172E'; // Dark Red / Deep Navy

  return (
    <Modal visible={visible} animationType="fade" transparent={false} onRequestClose={onClose}>
      <SafeAreaView style={[styles.container, { backgroundColor: bgColor }]}>
        {/* ================= TOP NAVIGATION BAR ================= */}
        <View style={styles.topBar}>
          <View style={styles.timeTagWrap}>
            <Text style={styles.timeTagText}>
              {activeMed.scheduledTime || '7:00 AM'}
            </Text>
            {isFurious && (
              <Text style={styles.lateTagText}> | + {lateMinutes}m late</Text>
            )}
          </View>

          <View style={styles.topBarRight}>
            {/* Audio Toggle */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.iconButton, isMuted && styles.iconButtonMuted]}
              onPress={toggleMute}
            >
              <Ionicons
                name={isMuted ? 'volume-mute' : 'volume-high'}
                size={20}
                color="#FFFFFF"
              />
            </TouchableOpacity>

            {/* Close / Dismiss */}
            <TouchableOpacity activeOpacity={0.8} style={styles.iconButton} onPress={onClose}>
              <Ionicons name="close" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ================= VIEW 1 & 2: FULL ALARM VIEW ================= */}
          {viewMode === 'alarm' && (
            <View style={styles.alarmViewContainer}>
              {/* Bold Header */}
              <View style={styles.headerTitleWrap}>
                <Text style={styles.headerSubTitle}>
                  {isFurious ? 'TAKE NOW!' : 'TIME TO TAKE'}
                </Text>
                <Text
                  style={[
                    styles.headerMainTitle,
                    isFurious && styles.headerMainTitleFurious,
                  ]}
                >
                  {isFurious ? 'MED' : activeMed.name.toUpperCase()}
                </Text>
              </View>

              {/* Dynamic Speech Bubble */}
              <View
                style={[
                  styles.speechBubble,
                  { backgroundColor: isFurious ? '#3D1620' : '#1A294A' },
                ]}
              >
                <Text style={styles.speechBubbleText}>
                  {mood === 'celebrate'
                    ? '🎉 Hebat! Obat berhasil diminum! Sehat selalu!'
                    : isFurious
                    ? '😡 Sudah lewat 10 menit! Ayo minum sekarang, jangan abaikan!'
                    : '😊 Waktunya minum obat! Tubuh sehat dimulai sekarang!'}
                </Text>
              </View>

              {/* Character Avatar */}
              <View style={styles.avatarWrap}>
                <PilloAvatar mood={mood} size={180} showFireAura={isFurious} />
              </View>

              {/* Medication Capsule Detail Card */}
              <View
                style={[
                  styles.medDetailCard,
                  { backgroundColor: isFurious ? '#34141E' : '#142340' },
                ]}
              >
                <View style={styles.medCardRow}>
                  <Text style={styles.medCardTitle}>
                    {activeMed.name} {activeMed.dosePerIntake} {activeMed.doseUnit}
                  </Text>
                  <TouchableOpacity onPress={() => setDetailsExpanded(!detailsExpanded)}>
                    <Text style={styles.medCardViewDetails}>
                      {detailsExpanded ? 'Sembunyikan' : 'View details'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {detailsExpanded && (
                  <View style={styles.medExpandedBox}>
                    <Text style={styles.medExpandedLine}>
                      📋 Aturan: {activeMed.instruction}
                    </Text>
                    {activeMed.indication ? (
                      <Text style={styles.medExpandedLine}>
                        🩺 Indikasi: {activeMed.indication}
                      </Text>
                    ) : null}
                    {activeMed.remainingStock !== undefined ? (
                      <Text style={styles.medExpandedLine}>
                        📦 Sisa Stok: {activeMed.remainingStock} {activeMed.doseUnit}
                      </Text>
                    ) : null}
                  </View>
                )}
              </View>

              {/* Action Buttons (Take Now / Skipped / Reschedule) */}
              <View style={styles.actionsContainer}>
                {/* 1. Take Now (Primary Action) */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[
                    styles.takeNowButton,
                    { backgroundColor: isFurious ? '#E64A5E' : '#3874FF' },
                  ]}
                  onPress={handleTakeNow}
                >
                  <Text style={styles.takeNowButtonText}>Take now</Text>
                  <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
                </TouchableOpacity>

                {/* 2. Skipped Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.secondaryButton,
                    { backgroundColor: isFurious ? '#3D1620' : '#172746' },
                  ]}
                  onPress={handleSkipPrompt}
                >
                  <Text style={styles.secondaryButtonText}>Skipped</Text>
                </TouchableOpacity>

                {/* 3. Reschedule Pill Button */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  style={[
                    styles.reschedulePillButton,
                    { backgroundColor: isFurious ? '#34141E' : '#1E3258' },
                  ]}
                  onPress={() => setViewMode('snooze')}
                >
                  <Ionicons name="alarm-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.reschedulePillText}>Reschedule</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ================= VIEW 3: COUNTDOWN TIMER VIEW ================= */}
          {viewMode === 'countdown' && (
            <View style={styles.countdownContainer}>
              {/* Speech Bubble */}
              <View style={styles.countdownSpeechBubble}>
                <Text style={styles.countdownSpeechText}>
                  {countdownSeconds > 25
                    ? 'Still have enough time!'
                    : countdownSeconds > 10
                    ? 'Hurry up! Almost out of time!'
                    : 'Last seconds! Take your med now!'}
                </Text>
              </View>

              {/* Big Circular Progress Ring with Pillo on Top */}
              <View style={styles.countdownRingWrapper}>
                {/* Avatar perched on top of ring */}
                <View style={styles.perchedAvatarWrap}>
                  <PilloAvatar mood={mood === 'furious' ? 'furious' : 'annoyed'} size={80} />
                </View>

                {/* Circular Countdown Ring */}
                <View style={styles.circularRing}>
                  <View style={styles.ringInnerContent}>
                    <Text style={styles.countdownDigits}>
                      00:{String(countdownSeconds).padStart(2, '0')}
                    </Text>

                    {/* Quick +1 Min Extension */}
                    <TouchableOpacity
                      style={styles.addMinuteBtn}
                      onPress={() => setCountdownSeconds((prev) => prev + 60)}
                    >
                      <Ionicons name="add" size={16} color="#007AFF" />
                      <Text style={styles.addMinuteText}>1 min</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>

              {/* View Meds Due Now Link */}
              <TouchableOpacity
                style={styles.viewMedsDueBtn}
                onPress={() => setViewMode('alarm')}
              >
                <Ionicons name="eye-outline" size={16} color="#3874FF" />
                <Text style={styles.viewMedsDueText}>
                  View meds due now ({activeMed.name})
                </Text>
              </TouchableOpacity>

              {/* Primary Actions */}
              <View style={styles.actionsContainer}>
                <TouchableOpacity
                  style={[styles.takeNowButton, { backgroundColor: '#3874FF' }]}
                  onPress={handleTakeNow}
                >
                  <Text style={styles.takeNowButtonText}>Take now</Text>
                  <Ionicons name="arrow-forward" size={22} color="#FFFFFF" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.reschedulePillButton}
                  onPress={() => setViewMode('snooze')}
                >
                  <Ionicons name="alarm-outline" size={18} color="#FFFFFF" />
                  <Text style={styles.reschedulePillText}>Reschedule / Snooze</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ================= VIEW 4: SNOOZE / RESCHEDULE SHEET ================= */}
          {viewMode === 'snooze' && (
            <View style={styles.snoozeSheetContainer}>
              <View style={styles.snoozeCard}>
                <Text style={styles.snoozeTitle}>Reschedule for</Text>

                {/* Segmented Duration / Time-specific Tab */}
                <View style={styles.segmentedControl}>
                  <TouchableOpacity
                    style={[
                      styles.segmentBtn,
                      snoozeTab === 'duration' && styles.segmentBtnActive,
                    ]}
                    onPress={() => setSnoozeTab('duration')}
                  >
                    <Text
                      style={[
                        styles.segmentBtnText,
                        snoozeTab === 'duration' && styles.segmentBtnTextActive,
                      ]}
                    >
                      Duration
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.segmentBtn,
                      snoozeTab === 'time' && styles.segmentBtnActive,
                    ]}
                    onPress={() => setSnoozeTab('time')}
                  >
                    <Text
                      style={[
                        styles.segmentBtnText,
                        snoozeTab === 'time' && styles.segmentBtnTextActive,
                      ]}
                    >
                      Time-specific
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Duration Picker List */}
                {snoozeTab === 'duration' ? (
                  <View style={styles.durationPickerWrap}>
                    <Text style={styles.pickerSubText}>
                      Pilih durasi penundaan dosis:
                    </Text>

                    {[
                      { mins: 5, label: '5 min' },
                      { mins: 10, label: '10 min' },
                      { mins: 15, label: '15 min' },
                      { mins: 30, label: '30 min' },
                      { mins: 60, label: '1 hour' },
                    ].map((item) => (
                      <TouchableOpacity
                        key={item.mins}
                        style={[
                          styles.durationOptionRow,
                          selectedDuration === item.mins && styles.durationOptionRowActive,
                        ]}
                        onPress={() => setSelectedDuration(item.mins)}
                      >
                        <Text
                          style={[
                            styles.durationOptionNumber,
                            selectedDuration === item.mins && styles.durationOptionNumberActive,
                          ]}
                        >
                          {item.mins}
                        </Text>
                        <Text
                          style={[
                            styles.durationOptionLabel,
                            selectedDuration === item.mins && styles.durationOptionLabelActive,
                          ]}
                        >
                          {item.label.split(' ')[1]}
                        </Text>
                        {selectedDuration === item.mins && (
                          <Ionicons
                            name="checkmark-circle"
                            size={20}
                            color="#3874FF"
                            style={styles.durationCheck}
                          />
                        )}
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.timeSpecificWrap}>
                    <Text style={styles.pickerSubText}>
                      Pilih jam spesifik alarm berbunyi kembali:
                    </Text>
                    <View style={styles.timeChipsGrid}>
                      {['12:30 WIB', '15:00 WIB', '18:00 WIB', '21:00 WIB'].map((t) => (
                        <TouchableOpacity
                          key={t}
                          style={styles.timeChipBtn}
                          onPress={() => setSelectedDuration(15)}
                        >
                          <Ionicons name="time" size={16} color="#3874FF" />
                          <Text style={styles.timeChipText}>{t}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>
                )}

                {/* Confirm Snooze Action */}
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.snoozeConfirmBtn}
                  onPress={handleConfirmSnooze}
                >
                  <Text style={styles.snoozeConfirmBtnText}>
                    Snoozed for {selectedDuration} mins
                  </Text>
                </TouchableOpacity>

                {/* Cancel Back to Alarm */}
                <TouchableOpacity
                  style={styles.snoozeCancelBtn}
                  onPress={() => setViewMode('alarm')}
                >
                  <Text style={styles.snoozeCancelBtnText}>Kembali ke Alarm</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* ================= DEMO CONTROLS BAR (FOR REVIEWING ALL 3 PILLO MODES) ================= */}
          <View style={styles.demoBar}>
            <Text style={styles.demoBarTitle}>PILLO APP SIMULATOR STATES:</Text>
            <View style={styles.demoChipsRow}>
              <TouchableOpacity
                style={[
                  styles.demoChip,
                  mood === 'calm' && viewMode === 'alarm' && styles.demoChipActive,
                ]}
                onPress={() => setDemoMode('calm', 'alarm')}
              >
                <Text style={styles.demoChipText}>😊 Calm (On-Time)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.demoChip,
                  viewMode === 'countdown' && styles.demoChipActive,
                ]}
                onPress={() => setDemoMode('annoyed', 'countdown')}
              >
                <Text style={styles.demoChipText}>⏱️ Countdown (00:40)</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.demoChip,
                  mood === 'furious' && styles.demoChipActive,
                ]}
                onPress={() => setDemoMode('furious', 'alarm')}
              >
                <Text style={styles.demoChipText}>🔥 Furious (+10m Late)</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 12,
  },
  timeTagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeTagText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  lateTagText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FF6B8B',
  },
  topBarRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonMuted: {
    backgroundColor: '#FF3B3040',
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  // Alarm View
  alarmViewContainer: {
    alignItems: 'center',
    flex: 1,
  },
  headerTitleWrap: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 14,
  },
  headerSubTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  headerMainTitle: {
    fontSize: 48,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    textAlign: 'center',
  },
  headerMainTitleFurious: {
    color: '#FF4D6D',
    textShadowColor: '#FF0033',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  speechBubble: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 18,
    marginBottom: 20,
    maxWidth: '90%',
  },
  speechBubbleText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  avatarWrap: {
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  medDetailCard: {
    width: '100%',
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginVertical: 16,
    borderWidth: 1,
    borderColor: '#FFFFFF15',
  },
  medCardRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  medCardTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  medCardViewDetails: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3874FF',
    textDecorationLine: 'underline',
  },
  medExpandedBox: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#FFFFFF15',
    gap: 4,
  },
  medExpandedLine: {
    fontSize: 13,
    color: '#E5E5EA',
  },
  actionsContainer: {
    width: '100%',
    gap: 12,
    marginTop: 10,
  },
  takeNowButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  takeNowButtonText: {
    fontSize: 19,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  secondaryButton: {
    paddingVertical: 16,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  reschedulePillButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 13,
    borderRadius: 20,
    gap: 6,
    alignSelf: 'center',
    paddingHorizontal: 28,
  },
  reschedulePillText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#FFFFFF',
  },

  // Countdown View
  countdownContainer: {
    alignItems: 'center',
    flex: 1,
    paddingTop: 15,
  },
  countdownSpeechBubble: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 20,
    marginBottom: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  countdownSpeechText: {
    color: '#1C1C1E',
    fontSize: 15,
    fontWeight: '700',
  },
  countdownRingWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 20,
  },
  perchedAvatarWrap: {
    position: 'absolute',
    top: -40,
    zIndex: 10,
  },
  circularRing: {
    width: 250,
    height: 250,
    borderRadius: 125,
    borderWidth: 16,
    borderColor: '#FFD60A',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  ringInnerContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownDigits: {
    fontSize: 48,
    fontWeight: '800',
    color: '#1C1C1E',
    letterSpacing: 1,
  },
  addMinuteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    marginTop: 8,
    gap: 2,
  },
  addMinuteText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#007AFF',
  },
  viewMedsDueBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 20,
  },
  viewMedsDueText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#3874FF',
  },

  // Snooze Sheet
  snoozeSheetContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 20,
  },
  snoozeCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
  },
  snoozeTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000000',
    marginBottom: 16,
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#F2F2F7',
    borderRadius: 14,
    padding: 4,
    width: '100%',
    marginBottom: 20,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  segmentBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
  },
  segmentBtnTextActive: {
    color: '#000000',
  },
  durationPickerWrap: {
    width: '100%',
    gap: 8,
    marginBottom: 24,
  },
  pickerSubText: {
    fontSize: 13,
    color: '#8E8E93',
    marginBottom: 8,
  },
  durationOptionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#F9F9FB',
    borderWidth: 1,
    borderColor: '#E5E5EA',
  },
  durationOptionRowActive: {
    borderColor: '#3874FF',
    backgroundColor: '#3874FF10',
  },
  durationOptionNumber: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1C1C1E',
    width: 40,
  },
  durationOptionNumberActive: {
    color: '#3874FF',
  },
  durationOptionLabel: {
    fontSize: 16,
    color: '#8E8E93',
    flex: 1,
  },
  durationOptionLabelActive: {
    color: '#3874FF',
    fontWeight: '600',
  },
  durationCheck: {
    marginLeft: 'auto',
  },
  timeSpecificWrap: {
    width: '100%',
    marginBottom: 24,
  },
  timeChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  timeChipBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 14,
    backgroundColor: '#F2F2F7',
    gap: 6,
  },
  timeChipText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
  },
  snoozeConfirmBtn: {
    backgroundColor: '#3874FF',
    width: '100%',
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: 'center',
  },
  snoozeConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  snoozeCancelBtn: {
    marginTop: 14,
    paddingVertical: 8,
  },
  snoozeCancelBtnText: {
    color: '#8E8E93',
    fontSize: 14,
    fontWeight: '600',
  },

  // Demo bar
  demoBar: {
    backgroundColor: '#00000050',
    borderRadius: 16,
    padding: 12,
    marginTop: 20,
    borderWidth: 1,
    borderColor: '#FFFFFF15',
  },
  demoBarTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  demoChipsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  demoChip: {
    backgroundColor: '#FFFFFF15',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  demoChipActive: {
    backgroundColor: '#3874FF',
  },
  demoChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

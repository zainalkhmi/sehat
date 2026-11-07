import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';

export default function NAMSNeuroNestScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Session recording states
  const [sessionState, setSessionState] = useState<'idle' | 'recording' | 'paused' | 'completed'>('idle');
  const [activePhase, setActivePhase] = useState<'eyes_open' | 'eyes_closed' | 'cognitive_stimulus'>('eyes_open');
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const totalPhaseSeconds = 60;

  // Headband Electrode Contact (TP9, AF7, AF8, TP10)
  const [headbandConnected, setHeadbandConnected] = useState(true);
  const [contacts, setContacts] = useState({
    tp9: 98,  // Left Temporal
    af7: 100, // Left Frontal
    af8: 96,  // Right Frontal
    tp10: 97, // Right Temporal
  });

  // Real-time EEG Band Powers (in microvolts or normalized power 0-100)
  const [bands, setBands] = useState({
    delta: 34, // 0.5 - 4 Hz
    theta: 22, // 4 - 8 Hz
    alpha: 28, // 8 - 12 Hz
    beta: 14,  // 13 - 30 Hz
    gamma: 8,  // 30 - 50 Hz
  });

  // Theta/Beta Ratio (TBR) - Core clinical biomarker
  const tbr = Number((bands.theta / Math.max(bands.beta, 1)).toFixed(2));

  // Neurodevelopmental Milestone Questionnaire Answers (M-CHAT / ADHD)
  const [surveyAnswers, setSurveyAnswers] = useState<Record<string, 'yes' | 'no'>>({
    'q1': 'yes', // Responds to name
    'q2': 'yes', // Points to interesting objects
    'q3': 'yes', // Sustained attention > 3 mins
    'q4': 'yes', // Bilateral motor coordination
  });

  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Live EEG telemetry simulator
  useEffect(() => {
    let interval: any;
    if (sessionState === 'recording') {
      interval = setInterval(() => {
        setElapsedSeconds((prev) => {
          if (prev >= totalPhaseSeconds) {
            setSessionState('completed');
            return totalPhaseSeconds;
          }
          return prev + 1;
        });

        // Simulate microvolt band fluctuations
        setBands((prev) => ({
          delta: Math.min(60, Math.max(15, prev.delta + (Math.random() * 8 - 4))),
          theta: Math.min(50, Math.max(10, prev.theta + (Math.random() * 6 - 3))),
          alpha: Math.min(55, Math.max(12, prev.alpha + (Math.random() * 7 - 3.5))),
          beta: Math.min(45, Math.max(8, prev.beta + (Math.random() * 5 - 2.5))),
          gamma: Math.min(30, Math.max(4, prev.gamma + (Math.random() * 4 - 2))),
        }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [sessionState]);

  const handleStartRecording = () => {
    setElapsedSeconds(0);
    setSessionState('recording');
  };

  const handlePauseRecording = () => {
    setSessionState('paused');
  };

  const handleResumeRecording = () => {
    setSessionState('recording');
  };

  const handleResetSession = () => {
    setSessionState('idle');
    setElapsedSeconds(0);
  };

  const handleSaveAndSync = () => {
    setSyncNotice('EEG Recording & Neurodevelopmental Score synced to Supabase Clinical Cloud!');
    setTimeout(() => {
      setSyncNotice(null);
      router.back();
    }, 2200);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
      {/* Top Navbar */}
      <View style={styles.navBar}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBackBtn}>
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
          <Text style={styles.navBackText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.navTitleWrap}>
          <Text style={[styles.navTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            NAMS • NeuroNest
          </Text>
          <Text style={styles.navSub}>Stanford Neurodevelopment EEG</Text>
        </View>
        <View style={styles.navRightBadge}>
          <Text style={styles.navBadgeText}>IRB-FH</Text>
        </View>
      </View>

      {/* Sync Banner */}
      {syncNotice && (
        <View style={styles.syncToast}>
          <Ionicons name="checkmark-circle" size={18} color="#34C759" />
          <Text style={styles.syncToastText}>{syncNotice}</Text>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* 1. EEG Headband Status Card */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <View style={styles.cardHeader}>
            <View style={styles.deviceTitleRow}>
              <View style={styles.headbandIconWrap}>
                <Ionicons name="hardware-chip" size={22} color="#007AFF" />
              </View>
              <View>
                <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  Muse S EEG Headband
                </Text>
                <Text style={styles.cardSubtitle}>
                  4-Channel Clinical Frontal & Temporal BLE Telemetry
                </Text>
              </View>
            </View>
            <View style={styles.batteryPill}>
              <Text style={styles.batteryText}>94%</Text>
              <Ionicons name="battery-full" size={16} color="#34C759" style={{ marginLeft: 4 }} />
            </View>
          </View>

          {/* Electrode Contact Impedance Grid */}
          <Text style={styles.sectionSmallTitle}>ELECTRODE CONTACT QUALITY (IMPEDANCE)</Text>
          <View style={styles.electrodeGrid}>
            <View style={styles.electrodeItem}>
              <View style={[styles.contactDot, { backgroundColor: '#34C759' }]} />
              <Text style={[styles.electrodeName, { color: isDark ? '#FFFFFF' : '#000000' }]}>TP9</Text>
              <Text style={styles.electrodeLocation}>Left Ear</Text>
              <Text style={styles.electrodePercent}>{contacts.tp9}%</Text>
            </View>
            <View style={styles.electrodeItem}>
              <View style={[styles.contactDot, { backgroundColor: '#34C759' }]} />
              <Text style={[styles.electrodeName, { color: isDark ? '#FFFFFF' : '#000000' }]}>AF7</Text>
              <Text style={styles.electrodeLocation}>L. Forehead</Text>
              <Text style={styles.electrodePercent}>{contacts.af7}%</Text>
            </View>
            <View style={styles.electrodeItem}>
              <View style={[styles.contactDot, { backgroundColor: '#34C759' }]} />
              <Text style={[styles.electrodeName, { color: isDark ? '#FFFFFF' : '#000000' }]}>AF8</Text>
              <Text style={styles.electrodeLocation}>R. Forehead</Text>
              <Text style={styles.electrodePercent}>{contacts.af8}%</Text>
            </View>
            <View style={styles.electrodeItem}>
              <View style={[styles.contactDot, { backgroundColor: '#34C759' }]} />
              <Text style={[styles.electrodeName, { color: isDark ? '#FFFFFF' : '#000000' }]}>TP10</Text>
              <Text style={styles.electrodeLocation}>Right Ear</Text>
              <Text style={styles.electrodePercent}>{contacts.tp10}%</Text>
            </View>
          </View>
        </View>

        {/* 2. Live Brainwave Band Power & Biomarkers */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', marginTop: 16 }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              Live Brainwave Power Spectrum
            </Text>
            <View style={styles.liveIndicator}>
              <View style={styles.pulseDot} />
              <Text style={styles.liveText}>256 Hz Live</Text>
            </View>
          </View>

          {/* Biomarker Highlight: Theta/Beta Ratio */}
          <View style={styles.tbrBanner}>
            <View>
              <Text style={styles.tbrLabel}>Theta / Beta Ratio (TBR Biomarker)</Text>
              <Text style={styles.tbrDesc}>Standard clinical index for attention and neuro-arousal</Text>
            </View>
            <View style={styles.tbrValueWrap}>
              <Text style={styles.tbrNumber}>{tbr}</Text>
              <Text style={[styles.tbrStatus, { color: tbr <= 2.5 ? '#34C759' : '#FF9500' }]}>
                {tbr <= 2.5 ? 'Normal Baseline' : 'Elevated'}
              </Text>
            </View>
          </View>

          {/* Band Power Bars */}
          <View style={styles.bandBarsContainer}>
            {/* Delta */}
            <View style={styles.bandRow}>
              <View style={styles.bandLabelWrap}>
                <Text style={[styles.bandName, { color: isDark ? '#FFFFFF' : '#000000' }]}>Delta (δ)</Text>
                <Text style={styles.bandHz}>0.5 - 4 Hz</Text>
              </View>
              <View style={styles.bandTrack}>
                <View style={[styles.bandFill, { width: `${bands.delta}%`, backgroundColor: '#5856D6' }]} />
              </View>
              <Text style={styles.bandMicrovolt}>{Math.round(bands.delta)} µV</Text>
            </View>

            {/* Theta */}
            <View style={styles.bandRow}>
              <View style={styles.bandLabelWrap}>
                <Text style={[styles.bandName, { color: isDark ? '#FFFFFF' : '#000000' }]}>Theta (θ)</Text>
                <Text style={styles.bandHz}>4 - 8 Hz</Text>
              </View>
              <View style={styles.bandTrack}>
                <View style={[styles.bandFill, { width: `${bands.theta}%`, backgroundColor: '#AF52DE' }]} />
              </View>
              <Text style={styles.bandMicrovolt}>{Math.round(bands.theta)} µV</Text>
            </View>

            {/* Alpha */}
            <View style={styles.bandRow}>
              <View style={styles.bandLabelWrap}>
                <Text style={[styles.bandName, { color: isDark ? '#FFFFFF' : '#000000' }]}>Alpha (α)</Text>
                <Text style={styles.bandHz}>8 - 12 Hz</Text>
              </View>
              <View style={styles.bandTrack}>
                <View style={[styles.bandFill, { width: `${bands.alpha}%`, backgroundColor: '#007AFF' }]} />
              </View>
              <Text style={styles.bandMicrovolt}>{Math.round(bands.alpha)} µV</Text>
            </View>

            {/* Beta */}
            <View style={styles.bandRow}>
              <View style={styles.bandLabelWrap}>
                <Text style={[styles.bandName, { color: isDark ? '#FFFFFF' : '#000000' }]}>Beta (β)</Text>
                <Text style={styles.bandHz}>13 - 30 Hz</Text>
              </View>
              <View style={styles.bandTrack}>
                <View style={[styles.bandFill, { width: `${bands.beta}%`, backgroundColor: '#34C759' }]} />
              </View>
              <Text style={styles.bandMicrovolt}>{Math.round(bands.beta)} µV</Text>
            </View>

            {/* Gamma */}
            <View style={styles.bandRow}>
              <View style={styles.bandLabelWrap}>
                <Text style={[styles.bandName, { color: isDark ? '#FFFFFF' : '#000000' }]}>Gamma (γ)</Text>
                <Text style={styles.bandHz}>30 - 50 Hz</Text>
              </View>
              <View style={styles.bandTrack}>
                <View style={[styles.bandFill, { width: `${bands.gamma}%`, backgroundColor: '#FF9500' }]} />
              </View>
              <Text style={styles.bandMicrovolt}>{Math.round(bands.gamma)} µV</Text>
            </View>
          </View>
        </View>

        {/* 3. NAMS Session Protocol Recording */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', marginTop: 16 }]}>
          <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            NAMS Protocol Recording Session
          </Text>
          <Text style={styles.cardSubtitle}>
            Follow the 3 standardized evaluation phases defined by Stanford NAMS.
          </Text>

          {/* Phase Tabs */}
          <View style={styles.phaseSelector}>
            <TouchableOpacity
              onPress={() => setActivePhase('eyes_open')}
              style={[styles.phaseBtn, activePhase === 'eyes_open' && styles.phaseBtnActive]}
            >
              <Text style={[styles.phaseBtnText, activePhase === 'eyes_open' && styles.phaseBtnTextActive]}>
                1. Eyes Open
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActivePhase('eyes_closed')}
              style={[styles.phaseBtn, activePhase === 'eyes_closed' && styles.phaseBtnActive]}
            >
              <Text style={[styles.phaseBtnText, activePhase === 'eyes_closed' && styles.phaseBtnTextActive]}>
                2. Eyes Closed
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setActivePhase('cognitive_stimulus')}
              style={[styles.phaseBtn, activePhase === 'cognitive_stimulus' && styles.phaseBtnActive]}
            >
              <Text style={[styles.phaseBtnText, activePhase === 'cognitive_stimulus' && styles.phaseBtnTextActive]}>
                3. Stimulus
              </Text>
            </TouchableOpacity>
          </View>

          {/* Recording Timer & Status */}
          <View style={styles.timerWrap}>
            <Text style={[styles.timerDigits, { color: isDark ? '#FFFFFF' : '#000000' }]}>
              00:{elapsedSeconds < 10 ? `0${elapsedSeconds}` : elapsedSeconds} / 01:00
            </Text>
            <Text style={styles.timerInstruction}>
              {activePhase === 'eyes_open'
                ? 'Sit still and focus on a fixed point on the screen with eyes open.'
                : activePhase === 'eyes_closed'
                ? 'Close your eyes and breathe calmly for 60 seconds.'
                : 'Listen to the rhythmic auditory tone markers.'}
            </Text>
          </View>

          {/* Controls */}
          <View style={styles.recordingControls}>
            {sessionState === 'idle' && (
              <TouchableOpacity onPress={handleStartRecording} style={styles.recordMainBtn}>
                <Ionicons name="play" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                <Text style={styles.recordMainBtnText}>Start Phase Recording</Text>
              </TouchableOpacity>
            )}

            {sessionState === 'recording' && (
              <View style={styles.controlRow}>
                <TouchableOpacity onPress={handlePauseRecording} style={styles.pauseBtn}>
                  <Ionicons name="pause" size={20} color="#007AFF" />
                  <Text style={styles.pauseBtnText}>Pause</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setSessionState('completed')} style={styles.completeBtn}>
                  <Ionicons name="stop" size={20} color="#FF3B30" />
                  <Text style={styles.completeBtnText}>End Phase</Text>
                </TouchableOpacity>
              </View>
            )}

            {sessionState === 'paused' && (
              <View style={styles.controlRow}>
                <TouchableOpacity onPress={handleResumeRecording} style={styles.recordMainBtn}>
                  <Ionicons name="play" size={20} color="#FFFFFF" style={{ marginRight: 6 }} />
                  <Text style={styles.recordMainBtnText}>Resume</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleResetSession} style={styles.pauseBtn}>
                  <Text style={styles.pauseBtnText}>Reset</Text>
                </TouchableOpacity>
              </View>
            )}

            {sessionState === 'completed' && (
              <View style={styles.completedBanner}>
                <Ionicons name="checkmark-done-circle" size={32} color="#34C759" />
                <Text style={[styles.completedTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  Phase Recording Completed
                </Text>
                <Text style={styles.completedSub}>
                  60-second baseline epoch captured with 0 artifact dropouts.
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* 4. Neurodevelopmental Screening Questionnaire (FHIR R4) */}
        <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF', marginTop: 16 }]}>
          <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Neurodevelopmental Milestone Check (M-CHAT-R)
          </Text>
          <Text style={styles.cardSubtitle}>
            Parent-reported developmental indicators synced with EEG telemetry.
          </Text>

          <View style={styles.surveyList}>
            {/* Q1 */}
            <View style={styles.surveyItem}>
              <Text style={[styles.surveyQuestion, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                1. Does the patient consistently respond when their name is spoken?
              </Text>
              <View style={styles.surveyOptions}>
                <TouchableOpacity
                  onPress={() => setSurveyAnswers({ ...surveyAnswers, q1: 'yes' })}
                  style={[styles.optionBtn, surveyAnswers.q1 === 'yes' && styles.optionBtnActive]}
                >
                  <Text style={[styles.optionBtnText, surveyAnswers.q1 === 'yes' && styles.optionBtnTextActive]}>
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSurveyAnswers({ ...surveyAnswers, q1: 'no' })}
                  style={[styles.optionBtn, surveyAnswers.q1 === 'no' && styles.optionBtnActive]}
                >
                  <Text style={[styles.optionBtnText, surveyAnswers.q1 === 'no' && styles.optionBtnTextActive]}>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Q2 */}
            <View style={styles.surveyItem}>
              <Text style={[styles.surveyQuestion, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                2. Does the patient point with one finger to show curiosity or interest?
              </Text>
              <View style={styles.surveyOptions}>
                <TouchableOpacity
                  onPress={() => setSurveyAnswers({ ...surveyAnswers, q2: 'yes' })}
                  style={[styles.optionBtn, surveyAnswers.q2 === 'yes' && styles.optionBtnActive]}
                >
                  <Text style={[styles.optionBtnText, surveyAnswers.q2 === 'yes' && styles.optionBtnTextActive]}>
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSurveyAnswers({ ...surveyAnswers, q2: 'no' })}
                  style={[styles.optionBtn, surveyAnswers.q2 === 'no' && styles.optionBtnActive]}
                >
                  <Text style={[styles.optionBtnText, surveyAnswers.q2 === 'no' && styles.optionBtnTextActive]}>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Q3 */}
            <View style={styles.surveyItem}>
              <Text style={[styles.surveyQuestion, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                3. Sustains continuous visual focus during interactive play for &gt; 3 minutes?
              </Text>
              <View style={styles.surveyOptions}>
                <TouchableOpacity
                  onPress={() => setSurveyAnswers({ ...surveyAnswers, q3: 'yes' })}
                  style={[styles.optionBtn, surveyAnswers.q3 === 'yes' && styles.optionBtnActive]}
                >
                  <Text style={[styles.optionBtnText, surveyAnswers.q3 === 'yes' && styles.optionBtnTextActive]}>
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSurveyAnswers({ ...surveyAnswers, q3: 'no' })}
                  style={[styles.optionBtn, surveyAnswers.q3 === 'no' && styles.optionBtnActive]}
                >
                  <Text style={[styles.optionBtnText, surveyAnswers.q3 === 'no' && styles.optionBtnTextActive]}>
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* 5. Save & Cloud Sync Button */}
        <View style={styles.footerWrap}>
          <TouchableOpacity onPress={handleSaveAndSync} style={styles.syncClinicalBtn}>
            <Ionicons name="cloud-upload" size={20} color="#FFFFFF" style={{ marginRight: 8 }} />
            <Text style={styles.syncClinicalBtnText}>
              Save NAMS Session to Clinical Cloud
            </Text>
          </TouchableOpacity>
          <Text style={styles.footerFootnote}>
            HL7 FHIR R4 LOINC 9279-1 (EEG Power Spectrum) & UU PDP Cryptographic Audit Trail
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  navBackBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 70,
  },
  navBackText: {
    fontSize: 16,
    color: '#007AFF',
    marginLeft: -4,
  },
  navTitleWrap: {
    alignItems: 'center',
  },
  navTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  navSub: {
    fontSize: 11,
    color: '#8E8E93',
  },
  navRightBadge: {
    backgroundColor: '#007AFF15',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  navBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#007AFF',
  },
  syncToast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#E8F5E9',
    marginHorizontal: 16,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  syncToastText: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  card: {
    borderRadius: 20,
    padding: 18,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  deviceTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  headbandIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#007AFF15',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  batteryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C75915',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  batteryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34C759',
  },
  sectionSmallTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 10,
  },
  electrodeGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  electrodeItem: {
    flex: 1,
    backgroundColor: '#8E8E9310',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  contactDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  electrodeName: {
    fontSize: 14,
    fontWeight: '700',
  },
  electrodeLocation: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 1,
  },
  electrodePercent: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34C759',
    marginTop: 4,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  liveText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  tbrBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#007AFF0C',
    borderRadius: 14,
    padding: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#007AFF20',
  },
  tbrLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
  },
  tbrDesc: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
    maxWidth: 200,
  },
  tbrValueWrap: {
    alignItems: 'flex-end',
  },
  tbrNumber: {
    fontSize: 24,
    fontWeight: '800',
    color: '#007AFF',
  },
  tbrStatus: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  bandBarsContainer: {
    gap: 12,
    marginTop: 4,
  },
  bandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  bandLabelWrap: {
    width: 80,
  },
  bandName: {
    fontSize: 13,
    fontWeight: '600',
  },
  bandHz: {
    fontSize: 10,
    color: '#8E8E93',
  },
  bandTrack: {
    flex: 1,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8E8E9320',
    marginHorizontal: 12,
    overflow: 'hidden',
  },
  bandFill: {
    height: '100%',
    borderRadius: 4,
  },
  bandMicrovolt: {
    width: 48,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },

  // Protocol Recording
  phaseSelector: {
    flexDirection: 'row',
    backgroundColor: '#8E8E9315',
    borderRadius: 12,
    padding: 4,
    marginVertical: 14,
  },
  phaseBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  phaseBtnActive: {
    backgroundColor: '#007AFF',
  },
  phaseBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  phaseBtnTextActive: {
    color: '#FFFFFF',
  },
  timerWrap: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  timerDigits: {
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  timerInstruction: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 6,
    paddingHorizontal: 20,
    lineHeight: 16,
  },
  recordingControls: {
    marginTop: 10,
  },
  recordMainBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 14,
  },
  recordMainBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  controlRow: {
    flexDirection: 'row',
    gap: 12,
  },
  pauseBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF15',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  pauseBtnText: {
    color: '#007AFF',
    fontSize: 15,
    fontWeight: '700',
  },
  completeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF3B3015',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 6,
  },
  completeBtnText: {
    color: '#FF3B30',
    fontSize: 15,
    fontWeight: '700',
  },
  completedBanner: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 8,
  },
  completedSub: {
    fontSize: 12,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 2,
  },

  // Survey
  surveyList: {
    marginTop: 14,
    gap: 16,
  },
  surveyItem: {
    gap: 8,
  },
  surveyQuestion: {
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  surveyOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  optionBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#8E8E9330',
    alignItems: 'center',
  },
  optionBtnActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF15',
  },
  optionBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#8E8E93',
  },
  optionBtnTextActive: {
    color: '#007AFF',
  },

  // Footer
  footerWrap: {
    marginTop: 24,
    alignItems: 'center',
  },
  syncClinicalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    backgroundColor: '#34C759',
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 3,
  },
  syncClinicalBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  footerFootnote: {
    fontSize: 11,
    color: '#8E8E93',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 16,
    paddingHorizontal: 20,
  },
});


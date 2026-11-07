import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { PilloAvatar, PilloMood } from '@/components/PilloAvatar';
import { PilloReminderModal, PilloMedication } from '@/components/PilloReminderModal';
import { pilloAudio } from '@/utils/pilloAudio';

const SAMPLE_MEDICATIONS: PilloMedication[] = [
  {
    id: 'med-metformin',
    name: 'Metformin HCl',
    strength: '500 mg',
    dosePerIntake: 1,
    doseUnit: 'tablet',
    scheduledTime: '7:00 AM',
    instruction: 'Bersama Makan Pagi',
    indication: 'Kontrol Glukosa Darah',
    remainingStock: 28,
  },
  {
    id: 'med-amlodipine',
    name: 'Amlodipine Besylate',
    strength: '5 mg',
    dosePerIntake: 1,
    doseUnit: 'tablet',
    scheduledTime: '8:00 AM',
    instruction: 'Sesudah Makan Pagi',
    indication: 'Kontrol Tekanan Darah Hipertensi',
    remainingStock: 24,
  },
  {
    id: 'med-candesartan',
    name: 'Candesartan Cilexetil',
    strength: '8 mg',
    dosePerIntake: 1,
    doseUnit: 'tablet',
    scheduledTime: '8:00 PM',
    instruction: 'Sesudah Makan Malam',
    indication: 'Proteksi Kardiovaskular Jantung',
    remainingStock: 5,
  },
];

export default function PilloReminderScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Modal State
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMed, setSelectedMed] = useState<PilloMedication>(SAMPLE_MEDICATIONS[0]);
  const [modalMood, setModalMood] = useState<PilloMood>('calm');

  // Pillo Settings
  const [persistentAlarm, setPersistentAlarm] = useState(true);
  const [countdownEscalation, setCountdownEscalation] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(!pilloAudio.getIsMuted());
  const [hapticEnabled, setHapticEnabled] = useState(true);
  const [snoozeInterval, setSnoozeInterval] = useState(10); // 10 minutes

  // Interactive Buddy Preview Mood
  const [previewMood, setPreviewMood] = useState<PilloMood>('calm');

  // Trigger Alarm
  const triggerAlarm = (med: PilloMedication, mood: PilloMood) => {
    setSelectedMed(med);
    setModalMood(mood);
    setModalVisible(true);
  };

  // Sound toggle
  const toggleSound = (val: boolean) => {
    setSoundEnabled(val);
    pilloAudio.setMuted(!val);
    if (val) {
      pilloAudio.playCalmChime();
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
        <View style={styles.headerTitleCol}>
          <View style={styles.techBadge}>
            <Ionicons name="flash" size={12} color="#007AFF" />
            <Text style={styles.techBadgeText}>PILLO.CARE TECHNOLOGY</Text>
          </View>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Pillo Smart Pill Reminder
          </Text>
        </View>
        <TouchableOpacity
          style={styles.testBtn}
          onPress={() => triggerAlarm(SAMPLE_MEDICATIONS[0], 'calm')}
        >
          <Ionicons name="play-circle" size={26} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* ================= HERO CARD: INTERACTIVE PILLO BUDDY ================= */}
        <View style={[styles.heroCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.heroSub}>VIRTUAL MEDICATION BUDDY</Text>
              <Text style={[styles.heroTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Pillo Karakter Pendamping
              </Text>
            </View>
            <View style={styles.onlineBadge}>
              <View style={styles.onlineDot} />
              <Text style={styles.onlineText}>Aktif Siaga</Text>
            </View>
          </View>

          {/* Interactive Avatar in Box */}
          <View style={[styles.avatarBox, { backgroundColor: previewMood === 'furious' ? '#2A1018' : '#0B172E' }]}>
            <PilloAvatar mood={previewMood} size={150} showFireAura={previewMood === 'furious'} />

            <View style={styles.moodPillsRow}>
              {[
                { key: 'calm' as PilloMood, label: '😊 Tenang' },
                { key: 'annoyed' as PilloMood, label: '⏱️ Khawatir' },
                { key: 'furious' as PilloMood, label: '🔥 Marah (+10m)' },
              ].map((m) => (
                <TouchableOpacity
                  key={m.key}
                  style={[
                    styles.moodPill,
                    previewMood === m.key && styles.moodPillActive,
                  ]}
                  onPress={() => {
                    setPreviewMood(m.key);
                    if (m.key === 'calm') pilloAudio.playCalmChime();
                    else if (m.key === 'annoyed') pilloAudio.playUrgentChime();
                    else pilloAudio.playFuriousAlarm();
                  }}
                >
                  <Text
                    style={[
                      styles.moodPillText,
                      previewMood === m.key && styles.moodPillTextActive,
                    ]}
                  >
                    {m.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Action to launch full alarm */}
          <TouchableOpacity
            activeOpacity={0.85}
            style={styles.launchAlarmBtn}
            onPress={() => triggerAlarm(selectedMed, previewMood)}
          >
            <Ionicons name="notifications-outline" size={20} color="#FFFFFF" />
            <Text style={styles.launchAlarmBtnText}>
              Simulasikan Alarm Layar Penuh Pillo Sekarang
            </Text>
          </TouchableOpacity>
        </View>

        {/* ================= THE 3 PILLO CORE PILLARS (SESUAI GAMBAR DOKUMENTASI) ================= */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>TEKNOLOGI INOVATIF PILLO (PILLO.CARE)</Text>
          <Text style={styles.sectionSubtitle}>
            Tiga keunggulan utama yang mencegah pasien melupakan jadwal obat
          </Text>
        </View>

        {/* Pillar 01: The Alarm That Keeps Coming Back */}
        <View style={[styles.featureCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <View style={styles.featureTopRow}>
            <View style={styles.numberBadge}>
              <Text style={styles.numberBadgeText}>01</Text>
            </View>
            <View style={styles.featureTitleCol}>
              <Text style={[styles.featureTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                The alarm that keeps coming back
              </Text>
              <Text style={styles.featureTag}>Tak Bisa Diabaikan Diam-diam</Text>
            </View>
          </View>

          <Text style={styles.featureDesc}>
            Sampai Anda menekan tombol <Text style={{ fontWeight: '700', color: '#007AFF' }}>'Take now'</Text>,
            Pillo tetap berada di layar penuh dan alarm akan terus berulang secara berkala setiap kali hitungan mundur selesai.
          </Text>

          <View style={[styles.featureActionRow, { borderTopColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
            <View style={styles.toggleTextWrap}>
              <Text style={[styles.toggleTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Mode Alarm Persisten (Non-stop Loop)
              </Text>
              <Text style={styles.toggleSub}>Berdering ulang sampai diminum</Text>
            </View>
            <Switch
              value={persistentAlarm}
              onValueChange={setPersistentAlarm}
              trackColor={{ false: '#767577', true: '#34C759' }}
            />
          </View>
        </View>

        {/* Pillar 02: A Countdown That Raises the Stakes */}
        <View style={[styles.featureCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <View style={styles.featureTopRow}>
            <View style={[styles.numberBadge, { backgroundColor: '#FF950018' }]}>
              <Text style={[styles.numberBadgeText, { color: '#FF9500' }]}>02</Text>
            </View>
            <View style={styles.featureTitleCol}>
              <Text style={[styles.featureTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                A countdown that raises the stakes
              </Text>
              <Text style={[styles.featureTag, { color: '#FF9500' }]}>Eskalasi Emosi Karakter</Text>
            </View>
          </View>

          <Text style={styles.featureDesc}>
            Setelah alarm berbunyi, penghitung mundur cincin visual dimulai. Pillo awalnya ramah dan tenang,
            namun akan berubah cemas/kesal bila diabaikan, lalu menjadi api membara (+10m Late) sehingga mustahil diabaikan.
          </Text>

          <TouchableOpacity
            style={styles.testCountdownBtn}
            onPress={() => {
              setSelectedMed(SAMPLE_MEDICATIONS[0]);
              setModalMood('annoyed');
              setModalVisible(true);
            }}
          >
            <Ionicons name="timer-outline" size={18} color="#FF9500" />
            <Text style={styles.testCountdownBtnText}>Uji Visual Cincin Countdown 40 Detik</Text>
          </TouchableOpacity>
        </View>

        {/* Pillar 03: Snooze Without Losing The Dose */}
        <View style={[styles.featureCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <View style={styles.featureTopRow}>
            <View style={[styles.numberBadge, { backgroundColor: '#5856D618' }]}>
              <Text style={[styles.numberBadgeText, { color: '#5856D6' }]}>03</Text>
            </View>
            <View style={styles.featureTitleCol}>
              <Text style={[styles.featureTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Snooze without losing the dose
              </Text>
              <Text style={[styles.featureTag, { color: '#5856D6' }]}>Tunda Cerdas Fleksibel</Text>
            </View>
          </View>

          <Text style={styles.featureDesc}>
            Sedang rapat atau di jalan? Pilih durasi penundaan (5m, 10m, 15m, 30m) atau jam tertentu.
            Dosis tetap tersimpan aman berstatus <Text style={{ fontWeight: '700', color: '#5856D6' }}>'Pending'</Text> di Supabase DB dan Pillo akan kembali mengingatkan.
          </Text>

          {/* Quick Snooze Selector */}
          <View style={styles.snoozePresetsRow}>
            {[5, 10, 15, 30].map((mins) => (
              <TouchableOpacity
                key={mins}
                style={[
                  styles.snoozePresetBtn,
                  snoozeInterval === mins && styles.snoozePresetBtnActive,
                  { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' },
                ]}
                onPress={() => {
                  setSnoozeInterval(mins);
                  Alert.alert('Pengaturan Snooze Disimpan', `Interval tunda standar diset ke ${mins} menit.`);
                }}
              >
                <Text
                  style={[
                    styles.snoozePresetText,
                    snoozeInterval === mins && styles.snoozePresetTextActive,
                  ]}
                >
                  +{mins} Menit
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* ================= SCHEDULED PATIENT MEDICATIONS ================= */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>JADWAL OBAT TERHUBUNG (SUPABASE DB)</Text>
          <Text style={styles.sectionSubtitle}>
            Pilih obat di bawah untuk membunyikan alarm Pillo secara langsung
          </Text>
        </View>

        {SAMPLE_MEDICATIONS.map((med) => (
          <View
            key={med.id}
            style={[styles.medItemCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
          >
            <View style={styles.medItemLeft}>
              <View style={styles.medTimeTag}>
                <Ionicons name="time" size={13} color="#007AFF" />
                <Text style={styles.medTimeTagText}>{med.scheduledTime}</Text>
              </View>
              <Text style={[styles.medItemName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {med.name} ({med.strength})
              </Text>
              <Text style={styles.medItemSub}>
                {med.dosePerIntake} {med.doseUnit} • {med.instruction}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.ringAlarmBtn}
              onPress={() => triggerAlarm(med, 'calm')}
            >
              <Ionicons name="alarm" size={18} color="#FFFFFF" />
              <Text style={styles.ringAlarmBtnText}>Alarm</Text>
            </TouchableOpacity>
          </View>
        ))}

        {/* ================= AUDIO & HAPTIC CONTROLS ================= */}
        <View style={[styles.settingsCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <Text style={[styles.settingsTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Pengaturan Audio & Haptic Pillo
          </Text>

          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Ionicons name="volume-high" size={20} color="#007AFF" />
              <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Efek Suara & Melodi Alarm
              </Text>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={toggleSound}
              trackColor={{ false: '#767577', true: '#007AFF' }}
            />
          </View>

          <View style={styles.settingRow}>
            <View style={styles.settingRowLeft}>
              <Ionicons name="phone-portrait" size={20} color="#34C759" />
              <Text style={[styles.settingLabel, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Getaran Haptic Feedback
              </Text>
            </View>
            <Switch
              value={hapticEnabled}
              onValueChange={setHapticEnabled}
              trackColor={{ false: '#767577', true: '#34C759' }}
            />
          </View>
        </View>
      </ScrollView>

      {/* ================= FULL SCREEN PILLO ALARM MODAL ================= */}
      <PilloReminderModal
        visible={modalVisible}
        medication={selectedMed}
        initialMood={modalMood}
        onClose={() => setModalVisible(false)}
        onTakeNow={(med) => {
          Alert.alert(
            '✅ Obat Berhasil Diminum!',
            `${med.name} (${med.dosePerIntake} ${med.doseUnit}) tercatat diminum tepat waktu. Stok berkurang otomatis dan kepatuhan tercatat di rekam medis Supabase.`
          );
        }}
        onSkip={(med, reason) => {
          Alert.alert('⏭️ Obat Dilewati', `Jadwal ${med.name} dilewati: ${reason}.`);
        }}
        onReschedule={(med, minutes) => {
          Alert.alert('⏰ Dosis Ditunda', `${med.name} ditunda selama ${minutes} menit.`);
        }}
      />
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
  backButton: {
    padding: 6,
  },
  headerTitleCol: {
    flex: 1,
    marginHorizontal: 12,
  },
  techBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  techBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#007AFF',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
  },
  testBtn: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
  },
  heroCard: {
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
  heroSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#007AFF',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  onlineBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C75915',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 6,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#34C759',
  },
  onlineText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34C759',
  },
  avatarBox: {
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodPillsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 18,
  },
  moodPill: {
    backgroundColor: '#FFFFFF20',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
  },
  moodPillActive: {
    backgroundColor: '#3874FF',
  },
  moodPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  moodPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  launchAlarmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    marginTop: 16,
  },
  launchAlarmBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },

  // Section Headers
  sectionHeader: {
    marginTop: 8,
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.8,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    marginTop: 2,
  },

  // Feature Cards
  featureCard: {
    borderRadius: 18,
    padding: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  featureTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  numberBadge: {
    backgroundColor: '#007AFF15',
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numberBadgeText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#007AFF',
  },
  featureTitleCol: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
  },
  featureTag: {
    fontSize: 12,
    fontWeight: '600',
    color: '#007AFF',
    marginTop: 1,
  },
  featureDesc: {
    fontSize: 13,
    lineHeight: 19,
    color: '#8E8E93',
    marginBottom: 14,
  },
  featureActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
  },
  toggleTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  toggleTitle: {
    fontSize: 14,
    fontWeight: '600',
  },
  toggleSub: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  testCountdownBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF950015',
    paddingVertical: 11,
    borderRadius: 12,
    gap: 6,
  },
  testCountdownBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FF9500',
  },
  snoozePresetsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  snoozePresetBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  snoozePresetBtnActive: {
    backgroundColor: '#5856D6',
  },
  snoozePresetText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  snoozePresetTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Med List
  medItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 16,
    padding: 14,
  },
  medItemLeft: {
    flex: 1,
    paddingRight: 12,
  },
  medTimeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 4,
  },
  medTimeTagText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
  },
  medItemName: {
    fontSize: 15,
    fontWeight: '700',
  },
  medItemSub: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  ringAlarmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  ringAlarmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },

  // Settings
  settingsCard: {
    borderRadius: 18,
    padding: 18,
  },
  settingsTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 12,
  },
  settingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  settingRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  settingLabel: {
    fontSize: 14,
    fontWeight: '500',
  },
});


import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface MicroHabit {
  id: string;
  category: 'movement' | 'nutrition' | 'sleep' | 'cessation';
  title: string;
  titleAr: string;
  targetDuration: string;
  contextTrigger: string;
  adaptiveTrigger: string;
  rationale: string;
  clinicalLimit: string;
  isCompleted: boolean;
  isSoftLanded: boolean;
  softLandedAlternative?: string;
  color: string;
  icon: keyof typeof Ionicons.glyphMap;
}

const INITIAL_HABITS: MicroHabit[] = [
  {
    id: 'habit-1',
    category: 'movement',
    title: '7-Min Indoor Cool Mobility Stroll',
    titleAr: 'مشي داخلي خفيف لمدة ٧ دقائق',
    targetDuration: '7 Menit',
    contextTrigger: 'Pasca Makan Malam (Habit Stacking)',
    adaptiveTrigger: 'Dipicu data glukosa 104 mg/dL & cuaca Abu Dhabi 41°C',
    rationale: 'Aktivitas fisik ringan setelah makan menurunkan lonjakan glukosa hingga 22% (Studi Diabetologia).',
    clinicalLimit: 'Mendukung regulasi kardiometabolik, namun bukan pengganti terapi insulin atau metformin.',
    isCompleted: false,
    isSoftLanded: false,
    softLandedAlternative: '2 Menit Peregangan Otot Kaki & Betis di Sofa',
    color: '#007AFF',
    icon: 'walk',
  },
  {
    id: 'habit-2',
    category: 'nutrition',
    title: 'Pre-Rest Cold Electrolyte Hydration',
    titleAr: 'ترطيب بارد بالأملاح قبل الراحة',
    targetDuration: '1 Gelas (350 ml)',
    contextTrigger: 'Sore Hari / Sebelum Istirahat',
    adaptiveTrigger: 'Dipicu kelembapan tinggi & sensor keringat wearable',
    rationale: 'Mencegah hemokonsentrasi malam hari dan menjaga viskositas darah optimal (AHA Guideline).',
    clinicalLimit: 'Pasien gagal jantung kongestif atau CKD wajib membatasi asupan cairan sesuai anjuran nefrolog.',
    isCompleted: true,
    isSoftLanded: false,
    softLandedAlternative: '150 ml Air Putih Sejuk Perlahan',
    color: '#34C759',
    icon: 'water',
  },
  {
    id: 'habit-3',
    category: 'sleep',
    title: '4-7-8 Parasympathetic Vagal Wind-down',
    titleAr: 'تمرين التنفس المهدئ للجهاز العصبي',
    targetDuration: '3 Menit',
    contextTrigger: '15 Menit Sebelum Tidur',
    adaptiveTrigger: 'Dipicu variabilitas detak jantung (HRV 48ms) & stres kerja',
    rationale: 'Menstimulasi saraf vagus untuk memfasilitasi penurunan tekanan darah nokturnal (Normal Dipper).',
    clinicalLimit: 'Teknik relaksasi somatik, bukan pengganti evaluasi Sleep Apnea (OSA) jika ada dengkuran kronis.',
    isCompleted: false,
    isSoftLanded: false,
    softLandedAlternative: '60 Detik Pejamkan Mata & Atur Napas Dalam',
    color: '#5856D6',
    icon: 'moon',
  },
  {
    id: 'habit-4',
    category: 'cessation',
    title: 'Delayed Midwakh/Dokha Habit Anchor',
    titleAr: 'تأخير عادة الدوخة لمدة ١٥ دقيقة',
    targetDuration: 'Tunda 15 Menit',
    contextTrigger: 'Saat Muncul Craving / Selesai Makan',
    adaptiveTrigger: 'Jalur bertahap pengurangan nikotin tanpa penalti',
    rationale: 'Menunda impuls selama 15 menit memecah loop dopaminergik otomatis di amigdala otak.',
    clinicalLimit: 'Edukasi perilaku; untuk adiksi berat disarankan kombinasi NRT (Nicotine Replacement Therapy).',
    isCompleted: false,
    isSoftLanded: false,
    softLandedAlternative: 'Minum 1 Gelas Air Dingin & Kunyah Permen Mint',
    color: '#FF9500',
    icon: 'flame',
  },
];

export default function AdaptiveHabitsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // State Management
  const [habits, setHabits] = useState<MicroHabit[]>(INITIAL_HABITS);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isArabicMode, setIsArabicMode] = useState<boolean>(false);
  const [isHeatShieldActive, setIsHeatShieldActive] = useState<boolean>(true);
  const [isRamadanMode, setIsRamadanMode] = useState<boolean>(false);
  const [coachingIntensity, setCoachingIntensity] = useState<'gentle' | 'active' | 'stealth'>('active');

  // Setback Recovery Modal State
  const [isRecoveryModalOpen, setIsRecoveryModalOpen] = useState<boolean>(false);
  const [selectedHabitForRecovery, setSelectedHabitForRecovery] = useState<MicroHabit | null>(null);
  const [selectedBarrier, setSelectedBarrier] = useState<string>('fatigue');

  // Behavioral Metrics
  const [bankedDays, setBankedDays] = useState<number>(24);
  const [lapseRecoveryHours, setLapseRecoveryHours] = useState<number>(31); // 1.3 days

  const toggleHabitComplete = (id: string) => {
    setHabits((prev) =>
      prev.map((h) => (h.id === id ? { ...h, isCompleted: !h.isCompleted } : h))
    );
  };

  const handleOpenRecovery = (habit: MicroHabit) => {
    setSelectedHabitForRecovery(habit);
    setIsRecoveryModalOpen(true);
  };

  const handleApplySoftLanding = () => {
    if (!selectedHabitForRecovery) return;

    setHabits((prev) =>
      prev.map((h) =>
        h.id === selectedHabitForRecovery.id
          ? { ...h, isSoftLanded: true, isCompleted: true }
          : h
      )
    );

    setIsRecoveryModalOpen(false);
    Alert.alert(
      isArabicMode ? 'تم تفعيل الدعم المرن' : 'Soft Landing Diterapkan! ✨',
      isArabicMode
        ? 'تم تقليص الهدف دون أي لوم أو تصفير للتقدم. الاستمرارية المرنة هي مفتاح التعافي.'
        : `Target untuk "${selectedHabitForRecovery.title}" berhasil diadaptasi menjadi "${selectedHabitForRecovery.softLandedAlternative}". Tidak ada streak yang hangus!`
    );
  };

  const filteredHabits = habits.filter((h) =>
    selectedCategory === 'all' ? true : h.category === selectedCategory
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={[styles.backBtn, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
        >
          <Ionicons name="chevron-back" size={20} color={isDark ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <View style={styles.challengeBadge}>
            <Ionicons name="sparkles" size={12} color="#007AFF" />
            <Text style={styles.challengeBadgeText}>FUTURE HEALTH CHALLENGE</Text>
          </View>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            {isArabicMode ? 'خطط السلوك التكيفية والتعافي' : 'Adaptive Habit & Recovery'}
          </Text>
        </View>

        {/* Language Switcher */}
        <TouchableOpacity
          onPress={() => setIsArabicMode(!isArabicMode)}
          style={[styles.langBtn, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
        >
          <Text style={styles.langBtnText}>{isArabicMode ? 'EN' : 'عربي'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* COMPASSIONATE RESILIENCE HERO CARD (ANTI-STREAK SHAMING) */}
        <View style={[styles.resilienceCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <View style={styles.resilienceTop}>
            <View style={styles.bankedIconWrap}>
              <Ionicons name="shield-checkmark" size={24} color="#34C759" />
            </View>
            <View style={styles.resilienceTitleWrap}>
              <Text style={styles.resilienceSubtitle}>
                {isArabicMode ? 'الأرصدة الصحية المحفوظة (لا تصفير للتقدم)' : 'BANKED HEALTH EQUITY • NO ZERO RESET'}
              </Text>
              <Text style={[styles.resilienceTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {bankedDays} {isArabicMode ? 'يوم مكتسب بشكل دائم' : 'Hari Tersimpan Permanen'}
              </Text>
            </View>
            <View style={styles.lrrPill}>
              <Text style={styles.lrrPillLabel}>Lapse Recovery</Text>
              <Text style={styles.lrrPillValue}>1.3 Hari</Text>
            </View>
          </View>

          <Text style={styles.resilienceDescription}>
            {isArabicMode
              ? 'إذا واجهت يوماً شاقاً أو تعطلاً في روتينك، فنحن لا نلغي إنجازاتك السابقة. يمكنك تفعيل التعافي بلمسة واحدة.'
              : 'Di ekosistem ini, satu hari bolong tidak menghapus pencapaian Anda. Sistem kami mendeteksi hambatan dan menyesuaikan target tanpa rasa bersalah.'}
          </Text>

          {/* Quick Trigger: Setback Recovery Action Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleOpenRecovery(habits[0])}
            style={styles.setbackTriggerBtn}
          >
            <Ionicons name="heart-half" size={18} color="#FFFFFF" />
            <Text style={styles.setbackTriggerText}>
              {isArabicMode ? 'أواجه يوماً صعباً (تفعيل خطة التعافي المرنة)' : 'Hari Ini Berat? Aktifkan Soft Landing Recovery'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* ABU DHABI ECOSYSTEM & CONTEXT CONTROLS */}
        <View style={[styles.contextPanel, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <Text style={styles.contextPanelTitle}>
            {isArabicMode ? 'المحددات البيئية والثقافية (أبوظبي)' : 'ABU DHABI CONTEXT & ENVIRONMENT'}
          </Text>

          <View style={styles.contextGrid}>
            {/* Heat Shield Toggle */}
            <View style={styles.contextRow}>
              <View style={styles.contextInfoCol}>
                <View style={styles.contextLabelRow}>
                  <Ionicons name="sunny" size={16} color="#FF9500" />
                  <Text style={[styles.contextName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    {isArabicMode ? 'درع الحرارة (أبوظبي ٤١° مئوية)' : 'Abu Dhabi Heat Shield (41°C)'}
                  </Text>
                </View>
                <Text style={styles.contextDesc}>
                  {isArabicMode
                    ? 'يحظر التمارين الخارجية الشاقة تلقائياً ويوجه نحو المسارات المكيفة'
                    : 'Alihkan aktivitas luar ke dalam ruangan ber-AC secara otomatis'}
                </Text>
              </View>
              <Switch
                value={isHeatShieldActive}
                onValueChange={setIsHeatShieldActive}
                trackColor={{ false: '#767577', true: '#FF9500' }}
              />
            </View>

            <View style={styles.contextDivider} />

            {/* Ramadan Mode Toggle */}
            <View style={styles.contextRow}>
              <View style={styles.contextInfoCol}>
                <View style={styles.contextLabelRow}>
                  <Ionicons name="moon" size={16} color="#5856D6" />
                  <Text style={[styles.contextName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    {isArabicMode ? 'وضع رمضان والصيام' : 'Ramadan / Fasting Rhythm'}
                  </Text>
                </View>
                <Text style={styles.contextDesc}>
                  {isArabicMode
                    ? 'جدولة أوقات الترطيب والنشاط بين الإفطار والسحور'
                    : 'Sesuaikan jendela hidrasi & jalan santai antara Iftar dan Suhoor'}
                </Text>
              </View>
              <Switch
                value={isRamadanMode}
                onValueChange={setIsRamadanMode}
                trackColor={{ false: '#767577', true: '#5856D6' }}
              />
            </View>
          </View>
        </View>

        {/* CATEGORY FILTER PILLS */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
          {[
            { id: 'all', label: isArabicMode ? 'الكل' : 'Semua', icon: 'grid' },
            { id: 'movement', label: isArabicMode ? 'الحركة' : 'Gerak Aktif', icon: 'walk' },
            { id: 'nutrition', label: isArabicMode ? 'التغذية' : 'Hidrasi & Nutrisi', icon: 'nutrition' },
            { id: 'sleep', label: isArabicMode ? 'النوم' : 'Tidur Berkualitas', icon: 'moon' },
            { id: 'cessation', label: isArabicMode ? 'الدوخة/التدخين' : 'Reduksi Dokha', icon: 'flame' },
          ].map((cat) => (
            <TouchableOpacity
              key={cat.id}
              onPress={() => setSelectedCategory(cat.id)}
              style={[
                styles.catPill,
                selectedCategory === cat.id && styles.catPillActive,
                { backgroundColor: selectedCategory === cat.id ? '#007AFF' : isDark ? '#1C1C1E' : '#FFFFFF' },
              ]}
            >
              <Ionicons
                name={cat.icon as any}
                size={14}
                color={selectedCategory === cat.id ? '#FFFFFF' : '#8E8E93'}
              />
              <Text
                style={[
                  styles.catPillText,
                  { color: selectedCategory === cat.id ? '#FFFFFF' : isDark ? '#FFFFFF' : '#000000' },
                ]}
              >
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SECTION TITLE */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>
            {isArabicMode ? 'أهداف اليوم التكيفية الصغرى' : 'TODAY\'S ADAPTIVE MICRO-ACTIONS'}
          </Text>
          <Text style={styles.sectionSubtitle}>
            {filteredHabits.filter((h) => h.isCompleted).length} / {filteredHabits.length} Selesai
          </Text>
        </View>

        {/* HABIT CARDS LIST */}
        <View style={styles.habitsList}>
          {filteredHabits.map((habit) => (
            <View
              key={habit.id}
              style={[
                styles.habitCard,
                habit.isCompleted && styles.habitCardCompleted,
                { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
              ]}
            >
              {/* Card Header */}
              <View style={styles.habitTop}>
                <View style={[styles.habitIconWrap, { backgroundColor: `${habit.color}15` }]}>
                  <Ionicons name={habit.icon} size={22} color={habit.color} />
                </View>

                <View style={styles.habitTitleCol}>
                  <View style={styles.durationRow}>
                    <Text style={[styles.targetDuration, { color: habit.color }]}>
                      ⏱ {habit.targetDuration}
                    </Text>
                    {habit.isSoftLanded && (
                      <View style={styles.softLandedBadge}>
                        <Ionicons name="leaf" size={10} color="#34C759" />
                        <Text style={styles.softLandedText}>Soft Landed</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.habitTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    {isArabicMode ? habit.titleAr : habit.title}
                  </Text>
                </View>

                {/* Completion Checkbox */}
                <TouchableOpacity
                  onPress={() => toggleHabitComplete(habit.id)}
                  style={[
                    styles.checkboxBtn,
                    habit.isCompleted && { backgroundColor: habit.color, borderColor: habit.color },
                  ]}
                >
                  {habit.isCompleted && <Ionicons name="checkmark" size={16} color="#FFFFFF" />}
                </TouchableOpacity>
              </View>

              {/* Context Trigger Pill */}
              <View style={styles.triggerBox}>
                <View style={styles.triggerItem}>
                  <Text style={styles.triggerLabel}>Jangkar (Anchor):</Text>
                  <Text style={styles.triggerValue}>{habit.contextTrigger}</Text>
                </View>
                <View style={styles.triggerItem}>
                  <Text style={styles.triggerLabel}>Data Adaptif:</Text>
                  <Text style={styles.triggerValue}>{habit.adaptiveTrigger}</Text>
                </View>
              </View>

              {/* Evidence-Based Rationale & Clinical Limit (CRITERIA 3) */}
              <View style={styles.evidenceCard}>
                <View style={styles.evidenceRow}>
                  <Ionicons name="flask" size={13} color="#007AFF" />
                  <Text style={styles.evidenceTitle}>Dasar Ilmiah (Visible Rationale):</Text>
                </View>
                <Text style={styles.evidenceText}>{habit.rationale}</Text>

                <View style={[styles.evidenceRow, { marginTop: 6 }]}>
                  <Ionicons name="alert-circle" size={13} color="#FF9500" />
                  <Text style={[styles.evidenceTitle, { color: '#FF9500' }]}>
                    Batasan Klinis (Transparent Limit):
                  </Text>
                </View>
                <Text style={styles.limitText}>{habit.clinicalLimit}</Text>
              </View>

              {/* Card Footer Actions */}
              {!habit.isCompleted && (
                <View style={styles.cardActions}>
                  <TouchableOpacity
                    onPress={() => handleOpenRecovery(habit)}
                    style={styles.softLandingActionBtn}
                  >
                    <Ionicons name="options-outline" size={14} color="#007AFF" />
                    <Text style={styles.softLandingActionText}>
                      {isArabicMode ? 'تخفيف الهدف (ظرف طارئ)' : 'Terlalu Berat? Skala Ulang'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => toggleHabitComplete(habit.id)}
                    style={[styles.doneBtn, { backgroundColor: habit.color }]}
                  >
                    <Ionicons name="checkmark-done" size={14} color="#FFFFFF" />
                    <Text style={styles.doneBtnText}>Selesaikan</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* ANTI-PUNITIVE ETHICAL PRIVACY GUARANTEE (CRITERIA 4) */}
        <View style={[styles.privacyGuaranteeCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <View style={styles.privacyTop}>
            <Ionicons name="lock-closed" size={18} color="#34C759" />
            <Text style={styles.privacyTitle}>
              {isArabicMode ? 'ميثاق الخصوصية وحرية المستخدم' : 'USER AUTONOMY & ANTI-PUNITIVE PLEDGE'}
            </Text>
          </View>
          <Text style={styles.privacyText}>
            {isArabicMode
              ? 'تخضع هذه البيانات لأنظمة حماية البيانات الصحية في أبوظبي. لا يمكن لأصحاب العمل أو شركات التأمين استخدام هذه السلوكيات لفرض أي عقوبات أو زيادة أقساط التأمين.'
              : 'Data kebiasaan dan kemunduran (lapses) Anda dilindungi standar etika independen. Data ini dilarang keras diakses oleh pemberi kerja atau asuransi untuk keperluan penalti finansial.'}
          </Text>

          {/* Coaching Intensity Controls */}
          <View style={styles.intensityWrap}>
            <Text style={styles.intensityLabel}>Mode Pendampingan:</Text>
            <View style={styles.intensityPills}>
              {(['stealth', 'gentle', 'active'] as const).map((mode) => (
                <TouchableOpacity
                  key={mode}
                  onPress={() => setCoachingIntensity(mode)}
                  style={[
                    styles.intensityBtn,
                    coachingIntensity === mode && styles.intensityBtnActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.intensityBtnText,
                      coachingIntensity === mode && styles.intensityBtnTextActive,
                    ]}
                  >
                    {mode === 'stealth' ? '🛡️ Stealth' : mode === 'gentle' ? '🍃 Lembut' : '⚡ Aktif'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* COMPASSIONATE SETBACK RECOVERY MODAL */}
      <Modal
        visible={isRecoveryModalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setIsRecoveryModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <View style={styles.modalTitleWrap}>
                <Ionicons name="leaf" size={20} color="#34C759" />
                <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  {isArabicMode ? 'بروتوكول التعافي المرن' : 'Compassionate Setback Recovery'}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setIsRecoveryModalOpen(false)}>
                <Ionicons name="close-circle" size={24} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              {isArabicMode
                ? 'الحياة متقلبة والروتين قد يضطرب. حدد العائق الحالي لتكييف خطتك فوراً دون فقدان أي نقاط:'
                : 'Rutinitas terganggu adalah hal yang sangat normal dalam psikologi perilaku manusia. Pilih hambatan yang sedang Anda alami untuk menurunkan target hari ini:'}
            </Text>

            {/* Barrier Triage Options */}
            <View style={styles.barriersGrid}>
              {[
                { id: 'fatigue', label: 'Lelah / Kurang Tidur', icon: 'battery-dead' },
                { id: 'heat', label: 'Cuaca Panas Ekstrem (42°C)', icon: 'sunny' },
                { id: 'shift', label: 'Kerja Lembur / Shift Malam', icon: 'briefcase' },
                { id: 'family', label: 'Urusan Keluarga / Majlis', icon: 'people' },
                { id: 'stress', label: 'Stres Pikiran Tinggi', icon: 'skull' },
              ].map((barrier) => (
                <TouchableOpacity
                  key={barrier.id}
                  onPress={() => setSelectedBarrier(barrier.id)}
                  style={[
                    styles.barrierBtn,
                    selectedBarrier === barrier.id && styles.barrierBtnActive,
                    { backgroundColor: selectedBarrier === barrier.id ? '#007AFF15' : isDark ? '#2C2C2E' : '#F2F2F7' },
                  ]}
                >
                  <Ionicons
                    name={barrier.icon as any}
                    size={16}
                    color={selectedBarrier === barrier.id ? '#007AFF' : '#8E8E93'}
                  />
                  <Text
                    style={[
                      styles.barrierBtnText,
                      selectedBarrier === barrier.id && { color: '#007AFF', fontWeight: '700' },
                      { color: isDark && selectedBarrier !== barrier.id ? '#FFFFFF' : undefined },
                    ]}
                  >
                    {barrier.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Proposed Soft Landing */}
            <View style={styles.proposedBox}>
              <Text style={styles.proposedSubtitle}>REKOMENDASI SOFT LANDING HARI INI:</Text>
              <Text style={styles.proposedTitle}>
                {selectedHabitForRecovery?.softLandedAlternative || '2 Menit Latihan Pernapasan Ringan'}
              </Text>
              <Text style={styles.proposedNote}>
                Momentum kebiasaan tetap terjaga 100%. Kemampuan bangkit (Lapse Recovery Rate) Anda akan tercatat positif!
              </Text>
            </View>

            {/* Modal Actions */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                onPress={() => setIsRecoveryModalOpen(false)}
                style={styles.modalCancelBtn}
              >
                <Text style={styles.modalCancelText}>Batal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleApplySoftLanding}
                style={styles.modalConfirmBtn}
              >
                <Text style={styles.modalConfirmText}>Terapkan Soft Landing ✨</Text>
              </TouchableOpacity>
            </View>
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
    paddingTop: 8,
    paddingBottom: 12,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  headerCenter: {
    alignItems: 'center',
    gap: 2,
  },
  challengeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#007AFF12',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  challengeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#007AFF',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  langBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  langBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#007AFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 36,
  },

  // RESILIENCE HERO CARD
  resilienceCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#34C75925',
  },
  resilienceTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  bankedIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#34C75915',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resilienceTitleWrap: {
    flex: 1,
  },
  resilienceSubtitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34C759',
    letterSpacing: 0.5,
  },
  resilienceTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  lrrPill: {
    backgroundColor: '#007AFF12',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    alignItems: 'center',
  },
  lrrPillLabel: {
    fontSize: 9,
    color: '#007AFF',
    fontWeight: '600',
  },
  lrrPillValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#007AFF',
  },
  resilienceDescription: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 18,
    marginBottom: 14,
  },
  setbackTriggerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#FF3B30',
    paddingVertical: 12,
    borderRadius: 14,
    shadowColor: '#FF3B30',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  setbackTriggerText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // CONTEXT PANEL
  contextPanel: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contextPanelTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginBottom: 12,
  },
  contextGrid: {
    gap: 10,
  },
  contextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  contextInfoCol: {
    flex: 1,
    paddingRight: 10,
  },
  contextLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  contextName: {
    fontSize: 13,
    fontWeight: '700',
  },
  contextDesc: {
    fontSize: 11,
    color: '#8E8E93',
    lineHeight: 15,
  },
  contextDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#8E8E9330',
    marginVertical: 4,
  },

  // FILTER PILLS
  filterScroll: {
    marginBottom: 14,
  },
  catPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 18,
    marginRight: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  catPillActive: {
    shadowColor: '#007AFF',
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  catPillText: {
    fontSize: 12,
    fontWeight: '700',
  },

  // SECTION HEADER
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  sectionSubtitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#007AFF',
  },

  // HABITS LIST
  habitsList: {
    gap: 12,
    marginBottom: 16,
  },
  habitCard: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  habitCardCompleted: {
    opacity: 0.9,
    borderWidth: 1,
    borderColor: '#34C75940',
  },
  habitTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  habitIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  habitTitleCol: {
    flex: 1,
  },
  durationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  targetDuration: {
    fontSize: 11,
    fontWeight: '800',
  },
  softLandedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#34C75918',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  softLandedText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#34C759',
  },
  habitTitle: {
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  checkboxBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#C7C7CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  triggerBox: {
    backgroundColor: '#F2F2F780',
    borderRadius: 12,
    padding: 10,
    gap: 4,
    marginBottom: 10,
  },
  triggerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  triggerLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
  },
  triggerValue: {
    fontSize: 10,
    fontWeight: '600',
    color: '#3A3A3C',
    flex: 1,
  },
  evidenceCard: {
    backgroundColor: '#007AFF08',
    borderRadius: 12,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#007AFF',
    marginBottom: 10,
  },
  evidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
  },
  evidenceTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: '#007AFF',
  },
  evidenceText: {
    fontSize: 10,
    color: '#636366',
    lineHeight: 14,
  },
  limitText: {
    fontSize: 10,
    color: '#8E8E93',
    lineHeight: 14,
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#8E8E9325',
  },
  softLandingActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 6,
  },
  softLandingActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#007AFF',
  },
  doneBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  doneBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // PRIVACY GUARANTEE
  privacyGuaranteeCard: {
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#34C75925',
  },
  privacyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  privacyTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#34C759',
    letterSpacing: 0.5,
  },
  privacyText: {
    fontSize: 11,
    color: '#8E8E93',
    lineHeight: 16,
    marginBottom: 12,
  },
  intensityWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#8E8E9325',
  },
  intensityLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
  },
  intensityPills: {
    flexDirection: 'row',
    gap: 6,
  },
  intensityBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: '#8E8E9315',
  },
  intensityBtnActive: {
    backgroundColor: '#007AFF',
  },
  intensityBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8E8E93',
  },
  intensityBtnTextActive: {
    color: '#FFFFFF',
  },

  // MODAL STYLES
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 22,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  modalTitleWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
  },
  modalDesc: {
    fontSize: 12,
    color: '#8E8E93',
    lineHeight: 18,
    marginBottom: 14,
  },
  barriersGrid: {
    gap: 8,
    marginBottom: 16,
  },
  barrierBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
  },
  barrierBtnActive: {
    borderWidth: 1.5,
    borderColor: '#007AFF',
  },
  barrierBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  proposedBox: {
    backgroundColor: '#34C75910',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#34C75930',
    marginBottom: 18,
  },
  proposedSubtitle: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34C759',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  proposedTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#34C759',
    marginBottom: 4,
  },
  proposedNote: {
    fontSize: 11,
    color: '#636366',
    lineHeight: 15,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#8E8E9318',
    alignItems: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8E93',
  },
  modalConfirmBtn: {
    flex: 2,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#34C759',
    alignItems: 'center',
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 3,
  },
  modalConfirmText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

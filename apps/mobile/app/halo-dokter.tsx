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
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface DoctorProfile {
  id: string;
  name: string;
  degree: string;
  specialty: string;
  hospital: string;
  sip: string;
  experienceYears: number;
  rating: number;
  reviewsCount: number;
  status: 'online' | 'busy' | 'offline';
  schedule: string;
  role: 'primary' | 'consultant' | 'researcher';
  phone: string;
  avatarColor: string;
}

const PRIMARY_DOCTOR: DoctorProfile = {
  id: 'doc-001',
  name: 'dr. Budi Santoso',
  degree: 'Sp.JP(K), FIHA',
  specialty: 'Spesialis Jantung & Pembuluh Darah (Kardiologi)',
  hospital: 'RS Jantung Harapan Kita • Poliklinik Kardiologi Terpadu',
  sip: 'SIP.446/092/Dinkes/2024',
  experienceYears: 12,
  rating: 4.9,
  reviewsCount: 348,
  status: 'online',
  schedule: 'Senin - Jumat, 08:00 - 16:00 WIB',
  role: 'primary',
  phone: '+6281112345678',
  avatarColor: '#007AFF',
};

const NETWORK_DOCTORS: DoctorProfile[] = [
  {
    id: 'doc-002',
    name: 'dr. Siti Nurhaliza',
    degree: 'Sp.KJ',
    specialty: 'Spesialis Kedokteran Jiwa & Neuropsikiatri',
    hospital: 'Pusat Kesehatan Mental & Otak Terpadu',
    sip: 'SIP.512/114/Dinkes/2023',
    experienceYears: 9,
    rating: 4.8,
    reviewsCount: 195,
    status: 'online',
    schedule: 'Selasa, Kamis & Sabtu, 09:00 - 15:00 WIB',
    role: 'consultant',
    phone: '+6281223456789',
    avatarColor: '#AF52DE',
  },
  {
    id: 'doc-003',
    name: 'dr. Vishnu Ravi',
    degree: 'MD',
    specialty: 'Lead Investigator • Stanford Spezi & UI Biomedical',
    hospital: 'Stanford BDHG & Universitas Indonesia Biomedical',
    sip: 'IRB-STANFORD-2026-08',
    experienceYears: 15,
    rating: 5.0,
    reviewsCount: 420,
    status: 'online',
    schedule: 'Continuous Remote Telemetry Oversight',
    role: 'researcher',
    phone: '+16507232300',
    avatarColor: '#FF9500',
  },
  {
    id: 'doc-004',
    name: 'dr. Hendra Pratama',
    degree: 'Sp.A(K)',
    specialty: 'Spesialis Anak & Tumbuh Kembang (NAMS Cohort)',
    hospital: 'RSUPN Dr. Cipto Mangunkusumo',
    sip: 'SIP.388/044/Dinkes/2022',
    experienceYears: 11,
    rating: 4.9,
    reviewsCount: 260,
    status: 'busy',
    schedule: 'Rabu & Jumat, 10:00 - 17:00 WIB',
    role: 'consultant',
    phone: '+6281334567890',
    avatarColor: '#34C759',
  },
];

interface ChatMessage {
  id: string;
  sender: 'doctor' | 'patient';
  text: string;
  time: string;
}

export default function HaloDokterScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Selected doctor for interaction
  const [activeDoctor, setActiveDoctor] = useState<DoctorProfile>(PRIMARY_DOCTOR);

  // Modal states
  const [chatModalVisible, setChatModalVisible] = useState(false);
  const [bookingModalVisible, setBookingModalVisible] = useState(false);
  const [telemetryShared, setTelemetryShared] = useState(false);

  // Chat message state
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'm1',
      sender: 'doctor',
      text: 'Halo Pak/Bu, saya dr. Budi Santoso dari RS Jantung Harapan Kita. Saya melihat data tekanan darah Anda hari ini 103/64 mmHg dan detak 72 BPM dalam rentang optimal. Ada keluhan rasa pusing, sesak, atau dada berdebar yang dirasakan?',
      time: '08:45 WIB',
    },
  ]);

  // Booking state
  const [bookingType, setBookingType] = useState<'telehealth' | 'clinic'>('telehealth');
  const [bookingDate, setBookingDate] = useState('Besok, 09:30 WIB');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  // Handle send chat
  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const userText = chatInput.trim();
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'patient',
      text: userText,
      time: 'Baru saja',
    };
    setChatMessages((prev) => [...prev, newMsg]);
    setChatInput('');

    // Doctor automatic simulated clinical response
    setTimeout(() => {
      let reply = 'Terima kasih atas informasinya. Data telemetri Anda telah kami catat dalam rekam medis klinis. Tetap pertahankan pola minum air putih cukup dan istirahat teratur.';
      if (userText.toLowerCase().includes('pusing') || userText.toLowerCase().includes('sakit kepala')) {
        reply = 'Keluhan pusing bisa dipengaruhi transisi posisi atau hidrasi. Karena tekanan darah Anda 103/64 mmHg (relatif relaks), hindari bangkit mendadak dari tempat duduk dan cukupi asupan cairan elektrolit.';
      } else if (userText.toLowerCase().includes('eeg') || userText.toLowerCase().includes('nams')) {
        reply = 'Hasil rasio Theta/Beta EEG Stanford NAMS Anda sebesar 2.14 menunjukkan rentang fokus kognitif yang sangat seimbang. Latihan konsentrasi harian dapat dilanjutkan.';
      } else if (userText.toLowerCase().includes('obat') || userText.toLowerCase().includes('resep')) {
        reply = 'Untuk penyesuaian dosis obat harian, silakan booking jadwal konsultasi resmi melalui tombol "Jadwalkan Janji Temu" agar kami dapat menerbitkan resep elektronik resmi.';
      }
      setChatMessages((prev) => [
        ...prev,
        {
          id: `doc_reply_${Date.now()}`,
          sender: 'doctor',
          text: reply,
          time: 'Baru saja',
        },
      ]);
    }, 1200);
  };

  // Handle share telemetry
  const handleShareTelemetry = () => {
    setTelemetryShared(true);
    Alert.alert(
      'Telemetri Terkirim ke DPJP',
      'Data Tensi (103/64 mmHg), Heart Rate (72 BPM), dan Indeks EEG Stanford NAMS (2.14) telah berhasil disinkronkan ke rekam medis dr. Budi Santoso di RS Jantung Harapan Kita sesuai UU PDP No. 27/2022.'
    );
  };

  // Handle confirm booking
  const handleConfirmBooking = () => {
    setBookingConfirmed(true);
    setTimeout(() => {
      setBookingModalVisible(false);
      setBookingConfirmed(false);
      Alert.alert(
        'Janji Temu Berhasil Terdaftar',
        `Sesi ${bookingType === 'telehealth' ? 'Telekonsultasi Video' : 'Kunjungan Poliklinik'} bersama ${activeDoctor.name}, ${activeDoctor.degree} dijadwalkan pada ${bookingDate}. Tautan konsultasi telah dikirimkan ke email Anda.`
      );
    }, 600);
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
            <Ionicons name="medkit" size={13} color="#007AFF" />
            <Text style={styles.headerBadgeText}>HALO DOKTER • TELEMEDIS</Text>
          </View>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Dokter Terhubung
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => Alert.alert('Koneksi Rekam Medis', 'Status: Terhubung secara aman ke RS Jantung Harapan Kita & Supabase Clinical DB.')}
          style={styles.connectionIcon}
        >
          <View style={styles.onlinePulse} />
          <Ionicons name="shield-checkmark" size={20} color="#34C759" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Connected Primary Care Doctor Hero Card */}
        <View style={[styles.heroCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <View style={styles.heroTopRow}>
            <View style={styles.primaryBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
              <Text style={styles.primaryBadgeText}>DOKTER PENANGGUNG JAWAB (DPJP)</Text>
            </View>
            <View style={styles.liveStatusBadge}>
              <View style={styles.statusDotGreen} />
              <Text style={styles.statusTextGreen}>Online</Text>
            </View>
          </View>

          <View style={styles.doctorInfoRow}>
            <View style={[styles.avatarCircle, { backgroundColor: PRIMARY_DOCTOR.avatarColor }]}>
              <Ionicons name="person" size={36} color="#FFFFFF" />
              <View style={styles.verifiedCheck}>
                <Ionicons name="checkmark" size={10} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.doctorDetailText}>
              <Text style={[styles.doctorName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {PRIMARY_DOCTOR.name}, {PRIMARY_DOCTOR.degree}
              </Text>
              <Text style={styles.doctorSpecialty}>{PRIMARY_DOCTOR.specialty}</Text>
              <Text style={styles.doctorHospital}>{PRIMARY_DOCTOR.hospital}</Text>
              <Text style={styles.doctorSip}>{PRIMARY_DOCTOR.sip}</Text>
            </View>
          </View>

          {/* Stats Bar */}
          <View style={[styles.statsRow, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Pengalaman</Text>
              <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                {PRIMARY_DOCTOR.experienceYears} Tahun
              </Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Penilaian</Text>
              <View style={styles.ratingWrap}>
                <Ionicons name="star" size={13} color="#FF9500" />
                <Text style={[styles.statValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  {PRIMARY_DOCTOR.rating}
                </Text>
              </View>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statCol}>
              <Text style={styles.statLabel}>Jadwal Praktik</Text>
              <Text style={[styles.statValueSmall, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                08:00 - 16:00 WIB
              </Text>
            </View>
          </View>

          {/* Interactive Action Buttons */}
          <View style={styles.actionGrid}>
            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.actionBtn, { backgroundColor: '#007AFF' }]}
              onPress={() => {
                setActiveDoctor(PRIMARY_DOCTOR);
                setChatModalVisible(true);
              }}
            >
              <Ionicons name="chatbubble-ellipses" size={18} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Chat Dokter</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.actionBtn, { backgroundColor: '#34C759' }]}
              onPress={() => {
                Alert.alert(
                  'Telehealth Video Call',
                  `Memulai ruang konsultasi video aman terenkripsi bersama ${PRIMARY_DOCTOR.name}?`,
                  [
                    { text: 'Batal', style: 'cancel' },
                    { text: 'Mulai Panggilan', onPress: () => Linking.openURL('https://meet.jit.si/sehat-spezi-telehealth') },
                  ]
                );
              }}
            >
              <Ionicons name="videocam" size={18} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Video Call</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.actionBtnSecondary, { borderColor: isDark ? '#3A3A3C' : '#E5E5EA' }]}
              onPress={() => Linking.openURL(`tel:${PRIMARY_DOCTOR.phone}`)}
            >
              <Ionicons name="call" size={18} color="#FF9500" />
              <Text style={[styles.actionBtnSecondaryText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Panggil
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={[styles.actionBtnSecondary, { borderColor: isDark ? '#3A3A3C' : '#E5E5EA' }]}
              onPress={() => {
                setActiveDoctor(PRIMARY_DOCTOR);
                setBookingModalVisible(true);
              }}
            >
              <Ionicons name="calendar" size={18} color="#AF52DE" />
              <Text style={[styles.actionBtnSecondaryText, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Janji Temu
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Share Latest Telemetry Data Card */}
        <View style={[styles.telemetryCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <View style={styles.telemetryHeader}>
            <View style={styles.telemetryHeaderLeft}>
              <Ionicons name="pulse" size={20} color="#FF2D55" />
              <Text style={[styles.telemetryTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Ringkasan Vital Pasien Terkini
              </Text>
            </View>
            <View style={styles.telemetryBadge}>
              <Text style={styles.telemetryBadgeText}>Live Sensor</Text>
            </View>
          </View>

          <Text style={styles.telemetrySub}>
            Data terkini yang siap dikirimkan untuk ditinjau oleh DPJP Anda:
          </Text>

          <View style={styles.telemetryChipsRow}>
            <View style={[styles.telemetryChip, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
              <Text style={styles.chipLabel}>Tensi Darah</Text>
              <Text style={styles.chipValue}>103/64 mmHg</Text>
            </View>
            <View style={[styles.telemetryChip, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
              <Text style={styles.chipLabel}>Detak Jantung</Text>
              <Text style={styles.chipValue}>72 BPM</Text>
            </View>
            <View style={[styles.telemetryChip, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
              <Text style={styles.chipLabel}>EEG TBR (NAMS)</Text>
              <Text style={styles.chipValue}>2.14 Focus</Text>
            </View>
            <View style={[styles.telemetryChip, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
              <Text style={styles.chipLabel}>Skor PHQ-9</Text>
              <Text style={styles.chipValue}>8 (Mild)</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            style={[
              styles.shareTelemetryBtn,
              { backgroundColor: telemetryShared ? '#34C759' : '#007AFF' },
            ]}
            onPress={handleShareTelemetry}
          >
            <Ionicons
              name={telemetryShared ? 'checkmark-circle' : 'share-outline'}
              size={18}
              color="#FFFFFF"
            />
            <Text style={styles.shareTelemetryBtnText}>
              {telemetryShared
                ? 'Telemetri Telah Disinkronkan ke Dokter'
                : 'Kirimkan Telemetri Terkini ke dr. Budi Santoso'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Network & Referral Doctors Section */}
        <View style={styles.sectionTitleRow}>
          <Text style={styles.sectionHeaderTitle}>DOKTER RUJUKAN & SPESIALIS TERKAIT</Text>
          <Text style={styles.sectionHeaderSubtitle}>Jaringan RS Terintegrasi</Text>
        </View>

        {NETWORK_DOCTORS.map((doc) => (
          <View
            key={doc.id}
            style={[styles.networkDocCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
          >
            <View style={styles.networkTopRow}>
              <View style={[styles.networkAvatar, { backgroundColor: doc.avatarColor }]}>
                <Ionicons name="person" size={24} color="#FFFFFF" />
              </View>

              <View style={styles.networkDocInfo}>
                <View style={styles.networkNameRow}>
                  <Text style={[styles.networkDocName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                    {doc.name}, {doc.degree}
                  </Text>
                  <View
                    style={[
                      styles.networkStatusPill,
                      {
                        backgroundColor:
                          doc.status === 'online' ? '#34C75915' : '#FF950015',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.networkStatusPillText,
                        { color: doc.status === 'online' ? '#34C759' : '#FF9500' },
                      ]}
                    >
                      {doc.status === 'online' ? 'Online' : 'Praktik'}
                    </Text>
                  </View>
                </View>

                <Text style={styles.networkDocSpecialty}>{doc.specialty}</Text>
                <Text style={styles.networkDocHospital}>{doc.hospital}</Text>
                <Text style={styles.networkDocSchedule}>📅 {doc.schedule}</Text>
              </View>
            </View>

            <View style={styles.networkActionRow}>
              <TouchableOpacity
                style={[styles.networkBtn, { backgroundColor: '#007AFF15' }]}
                onPress={() => {
                  setActiveDoctor(doc);
                  setChatModalVisible(true);
                }}
              >
                <Ionicons name="chatbubble" size={15} color="#007AFF" />
                <Text style={[styles.networkBtnText, { color: '#007AFF' }]}>Konsultasi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.networkBtn, { backgroundColor: '#AF52DE15' }]}
                onPress={() => {
                  setActiveDoctor(doc);
                  setBookingModalVisible(true);
                }}
              >
                <Ionicons name="calendar-outline" size={15} color="#AF52DE" />
                <Text style={[styles.networkBtnText, { color: '#AF52DE' }]}>Jadwalkan</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.networkBtn, { backgroundColor: '#34C75915' }]}
                onPress={() => Linking.openURL(`tel:${doc.phone}`)}
              >
                <Ionicons name="call-outline" size={15} color="#34C759" />
                <Text style={[styles.networkBtnText, { color: '#34C759' }]}>Panggil</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Regulatory Protection Footer */}
        <View style={[styles.footerCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <Ionicons name="shield-checkmark" size={18} color="#34C759" />
          <Text style={styles.footerText}>
            Layanan Telekonsultasi SEHAT mematuhi UU Pelindungan Data Pribadi No. 27/2022 & Standar
            Kemenkes RI. Rekam medis terenkripsi end-to-end.
          </Text>
        </View>
      </ScrollView>

      {/* MODAL 1: CHAT TELEKONSULTASI */}
      <Modal
        visible={chatModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setChatModalVisible(false)}
      >
        <SafeAreaView
          style={[styles.modalSafeContainer, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}
        >
          {/* Modal Chat Header */}
          <View style={[styles.chatModalHeader, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View style={styles.chatModalHeaderLeft}>
              <View style={[styles.chatAvatar, { backgroundColor: activeDoctor.avatarColor }]}>
                <Ionicons name="person" size={20} color="#FFFFFF" />
              </View>
              <View>
                <Text
                  style={[styles.chatModalDocName, { color: isDark ? '#FFFFFF' : '#000000' }]}
                >
                  {activeDoctor.name}, {activeDoctor.degree}
                </Text>
                <Text style={styles.chatModalDocSub}>
                  {activeDoctor.hospital.split('•')[0]} • 🟢 Online
                </Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setChatModalVisible(false)}
              style={styles.chatModalCloseBtn}
            >
              <Ionicons name="close-circle" size={28} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          {/* Quick Doctor Notice */}
          <View style={[styles.chatNotice, { backgroundColor: '#007AFF12' }]}>
            <Ionicons name="information-circle" size={16} color="#007AFF" />
            <Text style={styles.chatNoticeText}>
              Telekonsultasi resmi diawasi oleh SIP {activeDoctor.sip}. Rekam medis dicatat otomatis.
            </Text>
          </View>

          {/* Chat Messages List */}
          <ScrollView
            contentContainerStyle={styles.chatMessageScroll}
            showsVerticalScrollIndicator={false}
          >
            {chatMessages.map((msg) => {
              const isDoctor = msg.sender === 'doctor';
              return (
                <View
                  key={msg.id}
                  style={[
                    styles.chatBubbleRow,
                    isDoctor ? styles.chatBubbleRowLeft : styles.chatBubbleRowRight,
                  ]}
                >
                  {isDoctor && (
                    <View
                      style={[
                        styles.chatBubbleAvatar,
                        { backgroundColor: activeDoctor.avatarColor },
                      ]}
                    >
                      <Ionicons name="person" size={14} color="#FFFFFF" />
                    </View>
                  )}
                  <View
                    style={[
                      styles.chatBubble,
                      isDoctor
                        ? [
                            styles.chatBubbleDoctor,
                            { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                          ]
                        : styles.chatBubblePatient,
                    ]}
                  >
                    <Text
                      style={[
                        styles.chatBubbleText,
                        { color: isDoctor ? (isDark ? '#FFFFFF' : '#000000') : '#FFFFFF' },
                      ]}
                    >
                      {msg.text}
                    </Text>
                    <Text
                      style={[
                        styles.chatBubbleTime,
                        { color: isDoctor ? '#8E8E93' : '#FFFFFF90' },
                      ]}
                    >
                      {msg.time}
                    </Text>
                  </View>
                </View>
              );
            })}
          </ScrollView>

          {/* Chat Input Bar */}
          <View style={[styles.chatInputBar, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <TouchableOpacity
              style={styles.chatAttachBtn}
              onPress={() => {
                setChatInput('Tensi darah saya hari ini 103/64 mmHg, denyut jantung 72 BPM.');
              }}
            >
              <Ionicons name="pulse" size={22} color="#FF2D55" />
            </TouchableOpacity>

            <TextInput
              style={[
                styles.chatTextInput,
                {
                  color: isDark ? '#FFFFFF' : '#000000',
                  backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7',
                },
              ]}
              placeholder="Tulis keluhan atau pertanyaan ke dokter..."
              placeholderTextColor="#8E8E93"
              value={chatInput}
              onChangeText={setChatInput}
              onSubmitEditing={handleSendMessage}
            />

            <TouchableOpacity
              style={[
                styles.chatSendBtn,
                { backgroundColor: chatInput.trim() ? '#007AFF' : '#8E8E9350' },
              ]}
              onPress={handleSendMessage}
              disabled={!chatInput.trim()}
            >
              <Ionicons name="send" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>

      {/* MODAL 2: JADWAL JANJI TEMU (BOOKING) */}
      <Modal
        visible={bookingModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setBookingModalVisible(false)}
      >
        <SafeAreaView
          style={[styles.modalSafeContainer, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}
        >
          <View style={[styles.chatModalHeader, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
            <View>
              <Text
                style={[styles.chatModalDocName, { color: isDark ? '#FFFFFF' : '#000000' }]}
              >
                Jadwalkan Konsultasi
              </Text>
              <Text style={styles.chatModalDocSub}>
                Bersama {activeDoctor.name}, {activeDoctor.degree}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setBookingModalVisible(false)}
              style={styles.chatModalCloseBtn}
            >
              <Ionicons name="close-circle" size={28} color="#8E8E93" />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.bookingScroll}>
            {/* Consultation Type Selector */}
            <Text style={styles.bookingSectionLabel}>JENIS LAYANAN KONSULTASI</Text>
            <View style={styles.bookingTypeRow}>
              <TouchableOpacity
                style={[
                  styles.bookingTypeCard,
                  bookingType === 'telehealth' && styles.bookingTypeCardActive,
                  { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                ]}
                onPress={() => setBookingType('telehealth')}
              >
                <Ionicons
                  name="videocam"
                  size={24}
                  color={bookingType === 'telehealth' ? '#007AFF' : '#8E8E93'}
                />
                <Text
                  style={[
                    styles.bookingTypeTitle,
                    { color: bookingType === 'telehealth' ? '#007AFF' : isDark ? '#FFF' : '#000' },
                  ]}
                >
                  Telehealth Video
                </Text>
                <Text style={styles.bookingTypeSub}>Konsultasi virtual via aplikasi</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.bookingTypeCard,
                  bookingType === 'clinic' && styles.bookingTypeCardActive,
                  { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                ]}
                onPress={() => setBookingType('clinic')}
              >
                <Ionicons
                  name="business"
                  size={24}
                  color={bookingType === 'clinic' ? '#007AFF' : '#8E8E93'}
                />
                <Text
                  style={[
                    styles.bookingTypeTitle,
                    { color: bookingType === 'clinic' ? '#007AFF' : isDark ? '#FFF' : '#000' },
                  ]}
                >
                  Tatap Muka RS
                </Text>
                <Text style={styles.bookingTypeSub}>Kunjungan poliklinik rumah sakit</Text>
              </TouchableOpacity>
            </View>

            {/* Date / Time Slot */}
            <Text style={styles.bookingSectionLabel}>PILIH WAKTU KONSULTASI TERSEDIA</Text>
            {['Besok, 09:30 WIB', 'Besok, 14:00 WIB', 'Lusa, 10:00 WIB', 'Lusa, 15:30 WIB'].map((slot) => (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.slotOption,
                  bookingDate === slot && styles.slotOptionActive,
                  { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                ]}
                onPress={() => setBookingDate(slot)}
              >
                <Ionicons
                  name="time-outline"
                  size={18}
                  color={bookingDate === slot ? '#007AFF' : '#8E8E93'}
                />
                <Text
                  style={[
                    styles.slotOptionText,
                    { color: bookingDate === slot ? '#007AFF' : isDark ? '#FFF' : '#000' },
                  ]}
                >
                  {slot}
                </Text>
                {bookingDate === slot && (
                  <Ionicons name="checkmark-circle" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}

            {/* Notes / Reason */}
            <Text style={styles.bookingSectionLabel}>CATATAN KELUHAN ATAU KEBUTUHAN KHUSUS</Text>
            <TextInput
              style={[
                styles.bookingInput,
                {
                  color: isDark ? '#FFFFFF' : '#000000',
                  backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF',
                },
              ]}
              placeholder="Contoh: Evaluasi rutin tekanan darah pasca minum obat antihipertensi..."
              placeholderTextColor="#8E8E93"
              multiline
              numberOfLines={3}
              value={bookingNotes}
              onChangeText={setBookingNotes}
            />

            <TouchableOpacity
              activeOpacity={0.8}
              style={[
                styles.confirmBookingBtn,
                { backgroundColor: bookingConfirmed ? '#34C759' : '#007AFF' },
              ]}
              onPress={handleConfirmBooking}
            >
              <Text style={styles.confirmBookingBtnText}>
                {bookingConfirmed ? 'Menyimpan...' : 'Konfirmasi Jadwal Janji Temu'}
              </Text>
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
  connectionIcon: {
    position: 'relative',
    padding: 4,
  },
  onlinePulse: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#34C759',
    zIndex: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },

  // HERO CONNECTED DOCTOR CARD
  heroCard: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  primaryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  primaryBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  liveStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#34C75918',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusDotGreen: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },
  statusTextGreen: {
    color: '#34C759',
    fontSize: 11,
    fontWeight: '700',
  },
  doctorInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 16,
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  verifiedCheck: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#007AFF',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doctorDetailText: {
    flex: 1,
    gap: 2,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  doctorSpecialty: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  doctorHospital: {
    fontSize: 11,
    color: '#8E8E93',
  },
  doctorSip: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 14,
    marginBottom: 16,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 10,
    color: '#8E8E93',
    marginBottom: 2,
  },
  statValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  statValueSmall: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
  },
  ratingWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  statDivider: {
    width: StyleSheet.hairlineWidth,
    height: 24,
    backgroundColor: '#8E8E9340',
  },
  actionGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: 14,
  },
  actionBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  actionBtnSecondary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  actionBtnSecondaryText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // TELEMETRY CARD
  telemetryCard: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  telemetryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  telemetryHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  telemetryTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  telemetryBadge: {
    backgroundColor: '#FF2D5515',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  telemetryBadgeText: {
    color: '#FF2D55',
    fontSize: 10,
    fontWeight: '700',
  },
  telemetrySub: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 12,
  },
  telemetryChipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 14,
  },
  telemetryChip: {
    flex: 1,
    minWidth: '45%',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  chipLabel: {
    fontSize: 10,
    color: '#8E8E93',
    marginBottom: 2,
  },
  chipValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#007AFF',
  },
  shareTelemetryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shareTelemetryBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // NETWORK DOCTORS SECTION
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    marginTop: 4,
  },
  sectionHeaderTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  sectionHeaderSubtitle: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '600',
  },
  networkDocCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  networkTopRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  networkAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  networkDocInfo: {
    flex: 1,
    gap: 2,
  },
  networkNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  networkDocName: {
    fontSize: 15,
    fontWeight: '800',
  },
  networkStatusPill: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  networkStatusPillText: {
    fontSize: 10,
    fontWeight: '700',
  },
  networkDocSpecialty: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
  },
  networkDocHospital: {
    fontSize: 11,
    color: '#8E8E93',
  },
  networkDocSchedule: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 2,
  },
  networkActionRow: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#8E8E9320',
  },
  networkBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 8,
    borderRadius: 10,
  },
  networkBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },

  // FOOTER
  footerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 14,
    borderRadius: 14,
    marginTop: 10,
  },
  footerText: {
    flex: 1,
    fontSize: 10,
    color: '#8E8E93',
    lineHeight: 14,
  },

  // MODALS
  modalSafeContainer: {
    flex: 1,
  },
  chatModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#8E8E9330',
  },
  chatModalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  chatAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatModalDocName: {
    fontSize: 15,
    fontWeight: '800',
  },
  chatModalDocSub: {
    fontSize: 11,
    color: '#8E8E93',
  },
  chatModalCloseBtn: {
    padding: 2,
  },
  chatNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  chatNoticeText: {
    fontSize: 11,
    color: '#007AFF',
    flex: 1,
  },
  chatMessageScroll: {
    padding: 16,
    gap: 12,
  },
  chatBubbleRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-end',
  },
  chatBubbleRowLeft: {
    justifyContent: 'flex-start',
  },
  chatBubbleRowRight: {
    justifyContent: 'flex-end',
  },
  chatBubbleAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  chatBubbleDoctor: {
    borderBottomLeftRadius: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  chatBubblePatient: {
    backgroundColor: '#007AFF',
    borderBottomRightRadius: 4,
  },
  chatBubbleText: {
    fontSize: 13,
    lineHeight: 18,
  },
  chatBubbleTime: {
    fontSize: 9,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  chatInputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#8E8E9330',
  },
  chatAttachBtn: {
    padding: 6,
  },
  chatTextInput: {
    flex: 1,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13,
    maxHeight: 80,
  },
  chatSendBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
  },

  // BOOKING MODAL
  bookingScroll: {
    padding: 20,
    gap: 14,
  },
  bookingSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.5,
    marginTop: 6,
  },
  bookingTypeRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bookingTypeCard: {
    flex: 1,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#8E8E9330',
    alignItems: 'center',
    gap: 6,
  },
  bookingTypeCardActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF10',
  },
  bookingTypeTitle: {
    fontSize: 13,
    fontWeight: '800',
  },
  bookingTypeSub: {
    fontSize: 10,
    color: '#8E8E93',
    textAlign: 'center',
  },
  slotOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#8E8E9330',
  },
  slotOptionActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF10',
  },
  slotOptionText: {
    fontSize: 13,
    fontWeight: '700',
    flex: 1,
    marginLeft: 10,
  },
  bookingInput: {
    borderRadius: 14,
    padding: 14,
    fontSize: 13,
    borderWidth: 1,
    borderColor: '#8E8E9330',
    textAlignVertical: 'top',
  },
  confirmBookingBtn: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  confirmBookingBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});

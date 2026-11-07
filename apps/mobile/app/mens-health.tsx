import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';

interface RiskFactor {
  category: string;
  name: string;
  status: 'optimal' | 'moderate' | 'high';
  detail: string;
  recommendation: string;
}

export default function MensHealthScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [activeTab, setActiveTab] = useState<'intake' | 'biomarkers' | 'triage' | 'sharia' | 'partner'>('intake');

  // Intake State
  const [age, setAge] = useState('32');
  const [bmi, setBmi] = useState('26.4');
  const [steroidUse, setSteroidUse] = useState<'no' | 'past' | 'current'>('no');
  const [heatExposure, setHeatExposure] = useState<'normal' | 'moderate' | 'heavy'>('moderate');
  const [smokingShisha, setSmokingShisha] = useState<'no' | 'occasional' | 'daily'>('occasional');
  const [tryingToConceiveMonths, setTryingToConceiveMonths] = useState('4');

  // At-Home Microfluidic Semen Test Simulator State
  const [atHomeTestState, setAtHomeTestState] = useState<'not_started' | 'testing' | 'completed'>('not_started');
  const [semenResults, setSemenResults] = useState({
    volume: '2.8 mL',
    tmsc: '38.4 M/mL',
    motility: '54%',
    morphology: '6%',
    dnaFragmentation: '14%', // DFI
    whoReference: 'Normal (WHO 6th Edition)',
  });

  // Zero-Knowledge Partner Link State
  const [partnerLinked, setPartnerLinked] = useState(false);
  const [partnerCode, setPartnerCode] = useState('DXB-MALAFFI-7821');

  // Malaffi FHIR Export State
  const [malaffiExported, setMalaffiExported] = useState(false);

  // Dynamic Explainable Risk Calculation
  const riskFactors: RiskFactor[] = [
    {
      category: 'Metabolik & Kardiovaskular',
      name: 'Indeks Massa Tubuh & Tekanan Darah',
      status: Number(bmi) > 25 ? 'moderate' : 'optimal',
      detail: `BMI ${bmi} kg/m² • Tensi Rata-Rata 118/76 mmHg. Menunjukkan status mikrovaskular yang terjaga tanpa disfungsi endotel berat.`,
      recommendation: 'Pertahankan lingkar pinggang <90 cm untuk menjaga sensitivitas hormon testosteron.',
    },
    {
      category: 'Gaya Hidup & Iklim Panas Teluk',
      name: 'Paparan Panas Lingkungan & Suplemen Gym',
      status: heatExposure === 'heavy' || steroidUse !== 'no' ? 'high' : 'moderate',
      detail: `Paparan panas: ${heatExposure.toUpperCase()} • Penggunaan Steroid/TRT: ${steroidUse.toUpperCase()} • Shisha: ${smokingShisha.toUpperCase()}.`,
      recommendation: 'Hindari sauna/mandi uap dan pakaian ketat. Hindari steroid anabolik tanpa resep yang menekan poros hipofisis-testis (HPG axis).',
    },
    {
      category: 'Semen & Epigenetika Paternal',
      name: 'Kualitas Sperma & Integritas DNA (DFI)',
      status: atHomeTestState === 'completed' ? 'optimal' : 'moderate',
      detail: atHomeTestState === 'completed'
        ? `Konsentrasi ${semenResults.tmsc} • Motilitas ${semenResults.motility} • DFI 14% (Kategori Baik <15%).`
        : 'Belum dilakukan tes mandiri mikrofluidik ponsel.',
      recommendation: 'Konsumsi mikronutrien antioksidan: CoQ10 200mg, Zinc 25mg, dan L-Carnitine untuk melindungi membran sperma dari stres oksidatif.',
    },
  ];

  // At-Home Test Runner
  const runAtHomeTest = () => {
    setAtHomeTestState('testing');
    setTimeout(() => {
      setAtHomeTestState('completed');
    }, 2500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F8F9FA' }]}>
      {/* Header Bar */}
      <View style={[styles.header, { borderBottomColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={isDark ? '#FFFFFF' : '#000000'} />
        </TouchableOpacity>
        <View style={styles.headerTitleWrap}>
          <View style={styles.badgeRow}>
            <Text style={styles.arabicTitle}>صحة وحيوية الرجل</Text>
            <View style={styles.dohBadge}>
              <Text style={styles.dohBadgeText}>Abu Dhabi DoH • Malaffi</Text>
            </View>
          </View>
          <Text style={[styles.mainTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
            Men's Health & Preconception
          </Text>
        </View>
      </View>

      {/* Tab Navigation */}
      <View style={[styles.tabBar, { borderBottomColor: isDark ? '#2C2C2E' : '#E5E5EA' }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {[
            { id: 'intake', label: 'Skrining Mandiri', icon: 'clipboard-outline' },
            { id: 'biomarkers', label: 'Tes Kit Rumahan', icon: 'flask-outline' },
            { id: 'triage', label: 'Triase & Rujukan', icon: 'git-network-outline' },
            { id: 'sharia', label: 'Panduan Fikih Medis', icon: 'shield-checkmark-outline' },
            { id: 'partner', label: 'Koneksi Pasangan (Privat)', icon: 'people-outline' },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setActiveTab(tab.id as any)}
                style={[styles.tabButton, isActive && styles.tabButtonActive]}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={16}
                  color={isActive ? '#007AFF' : isDark ? '#8E8E93' : '#636366'}
                />
                <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* ========================================================================= */}
        {/* TAB 1: PRIVATE DIGITAL INTAKE & EXPLAINABLE RISK RADAR                    */}
        {/* ========================================================================= */}
        {activeTab === 'intake' && (
          <View style={styles.sectionWrap}>
            {/* Trust & Non-Stigma Banner */}
            <View style={styles.trustBanner}>
              <View style={styles.trustIconWrap}>
                <Ionicons name="shield-checkmark" size={24} color="#007AFF" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.trustTitle}>Portal Privat & Tanpa Stigma</Text>
                <Text style={styles.trustSubtitle}>
                  Kesehatan reproduksi pria adalah indikator utama kebugaran vaskular dan kardiometabolik. Data Anda dilindungi enkripsi end-to-end berstandar ADHDS.
                </Text>
              </View>
            </View>

            {/* Quick Intake Form Card */}
            <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
              <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                Data Klinis & Paparan Lingkungan
              </Text>
              <Text style={styles.cardSubtitle}>
                Parameter yang memengaruhi mikrovaskular testis dan epigenetika sperma
              </Text>

              <View style={styles.formRow}>
                <View style={styles.formCol}>
                  <Text style={styles.label}>Usia (Tahun)</Text>
                  <TextInput
                    style={[styles.input, { color: isDark ? '#FFF' : '#000' }]}
                    keyboardType="numeric"
                    value={age}
                    onChangeText={setAge}
                  />
                </View>
                <View style={styles.formCol}>
                  <Text style={styles.label}>BMI (kg/m²)</Text>
                  <TextInput
                    style={[styles.input, { color: isDark ? '#FFF' : '#000' }]}
                    keyboardType="numeric"
                    value={bmi}
                    onChangeText={setBmi}
                  />
                </View>
              </View>

              <Text style={styles.label}>Paparan Suhu Panas Tinggi (Sauna / Lapangan Panas Ekstrem)</Text>
              <View style={styles.segmentedRow}>
                {(['normal', 'moderate', 'heavy'] as const).map((level) => (
                  <TouchableOpacity
                    key={level}
                    onPress={() => setHeatExposure(level)}
                    style={[styles.segmentBtn, heatExposure === level && styles.segmentBtnActive]}
                  >
                    <Text style={[styles.segmentText, heatExposure === level && styles.segmentTextActive]}>
                      {level === 'normal' ? 'Jarang' : level === 'moderate' ? 'Sedang (1-2x/mg)' : 'Sering (>3x/mg)'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.label}>Riwayat Suplemen Pembesar Otot / Steroid Gym</Text>
              <View style={styles.segmentedRow}>
                {(['no', 'past', 'current'] as const).map((opt) => (
                  <TouchableOpacity
                    key={opt}
                    onPress={() => setSteroidUse(opt)}
                    style={[styles.segmentBtn, steroidUse === opt && styles.segmentBtnActive]}
                  >
                    <Text style={[styles.segmentText, steroidUse === opt && styles.segmentTextActive]}>
                      {opt === 'no' ? 'Tidak Pernah' : opt === 'past' ? 'Dulu Pernah' : 'Aktif Saat Ini'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Explainable Risk Stratification Output */}
            <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
              <View style={styles.cardHeaderFlex}>
                <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                  Analisis Risiko Transparan (Explainable AI)
                </Text>
                <View style={styles.optimalPill}>
                  <Text style={styles.optimalPillText}>Stratifikasi Dini</Text>
                </View>
              </View>

              {riskFactors.map((rf, idx) => (
                <View key={idx} style={styles.riskItem}>
                  <View style={styles.riskItemHeader}>
                    <Text style={styles.riskCategory}>{rf.category}</Text>
                    <View
                      style={[
                        styles.riskBadge,
                        rf.status === 'optimal'
                          ? styles.riskBadgeGreen
                          : rf.status === 'moderate'
                          ? styles.riskBadgeYellow
                          : styles.riskBadgeRed,
                      ]}
                    >
                      <Text
                        style={[
                          styles.riskBadgeText,
                          rf.status === 'optimal'
                            ? styles.riskTextGreen
                            : rf.status === 'moderate'
                            ? styles.riskTextYellow
                            : styles.riskTextRed,
                        ]}
                      >
                        {rf.status.toUpperCase()}
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.riskName, { color: isDark ? '#FFF' : '#1C1C1E' }]}>{rf.name}</Text>
                  <Text style={styles.riskDetail}>{rf.detail}</Text>
                  <View style={styles.recommendationBox}>
                    <Ionicons name="bulb-outline" size={14} color="#007AFF" />
                    <Text style={styles.recommendationText}>{rf.recommendation}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: AT-HOME SEMEN MICROFLUIDIC & BIOMARKER COMPANION                   */}
        {/* ========================================================================= */}
        {activeTab === 'biomarkers' && (
          <View style={styles.sectionWrap}>
            <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
              <View style={styles.microfluidicHeader}>
                <Ionicons name="videocam" size={24} color="#34C759" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                    Tes Mikrofluidik Mandiri di Rumah
                  </Text>
                  <Text style={styles.cardSubtitle}>
                    Menganalisis motilitas dan densitas sperma secara privat menggunakan modul kamera smartphone optik
                  </Text>
                </View>
              </View>

              {atHomeTestState === 'not_started' && (
                <View style={styles.testPromptBox}>
                  <Text style={styles.testPromptText}>
                    Kit uji mandiri terhubung via Bluetooth/Optik. Sampel dianalisis secara lokal tanpa mengunggah citra mentah ke server publik (Privacy-Preserving Edge AI).
                  </Text>
                  <TouchableOpacity onPress={runAtHomeTest} style={styles.primaryBtn}>
                    <Ionicons name="play-circle" size={18} color="#FFF" />
                    <Text style={styles.primaryBtnText}>Mulai Kalibrasi & Analisis Sampel</Text>
                  </TouchableOpacity>
                </View>
              )}

              {atHomeTestState === 'testing' && (
                <View style={styles.testingBox}>
                  <Text style={styles.testingTitle}>Sedang Memindai Aliran Mikrofluidik...</Text>
                  <Text style={styles.testingSub}>Menghitung lintasan motilitas progresif spermatozoa (WHO 6th Ed.)</Text>
                  <View style={styles.progressBarBg}>
                    <View style={styles.progressBarFill} />
                  </View>
                </View>
              )}

              {atHomeTestState === 'completed' && (
                <View style={styles.resultsBox}>
                  <View style={styles.resultBannerGreen}>
                    <Ionicons name="checkmark-circle" size={20} color="#34C759" />
                    <Text style={styles.resultBannerText}>Analisis Mandiri Selesai: Kategori Normozoospermia</Text>
                  </View>

                  <View style={styles.grid2x2}>
                    <View style={styles.gridCell}>
                      <Text style={styles.gridLabel}>Konsentrasi Motil (TMSC)</Text>
                      <Text style={styles.gridVal}>{semenResults.tmsc}</Text>
                      <Text style={styles.gridRef}>Normal &ge; 15 M/mL</Text>
                    </View>
                    <View style={styles.gridCell}>
                      <Text style={styles.gridLabel}>Motilitas Progresif</Text>
                      <Text style={styles.gridVal}>{semenResults.motility}</Text>
                      <Text style={styles.gridRef}>Normal &ge; 32%</Text>
                    </View>
                    <View style={styles.gridCell}>
                      <Text style={styles.gridLabel}>Morfologi Normal</Text>
                      <Text style={styles.gridVal}>{semenResults.morphology}</Text>
                      <Text style={styles.gridRef}>Kruger Strict &ge; 4%</Text>
                    </View>
                    <View style={styles.gridCell}>
                      <Text style={styles.gridLabel}>Indeks Frag. DNA (DFI)</Text>
                      <Text style={styles.gridVal}>{semenResults.dnaFragmentation}</Text>
                      <Text style={styles.gridRef}>Optimal &lt; 15%</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      setMalaffiExported(true);
                      Alert.alert('Malaffi HIE Sync', 'Hasil tes mandiri telah dienkripsi dan diunggah ke profil Malaffi Anda (HL7 FHIR DiagnosticReport).');
                    }}
                    style={[styles.exportBtn, malaffiExported && styles.exportBtnDone]}
                  >
                    <Ionicons name="cloud-upload-outline" size={16} color={malaffiExported ? '#34C759' : '#007AFF'} />
                    <Text style={[styles.exportBtnText, malaffiExported && { color: '#34C759' }]}>
                      {malaffiExported ? 'Tersimpan di Malaffi HIE' : 'Kirim Laporan Enkripsi ke Malaffi'}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: SAFE TRIAGE & CLINICAL CARE NAVIGATION                             */}
        {/* ========================================================================= */}
        {activeTab === 'triage' && (
          <View style={styles.sectionWrap}>
            <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
              <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                Jalur Rujukan & Navigasi Perawatan
              </Text>
              <Text style={styles.cardSubtitle}>
                Triase cerdas yang membedakan edukasi mandiri, telekonsultasi dokter umum, hingga rujukan andrologi
              </Text>

              {/* Triage Tier 1 */}
              <View style={styles.triageTier}>
                <View style={styles.tierHeader}>
                  <View style={[styles.tierNum, { backgroundColor: '#34C759' }]}>
                    <Text style={styles.tierNumText}>1</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.tierTitle}>Optimasi Mandiri (Preconception Lifestyle)</Text>
                    <Text style={styles.tierSub}>Untuk profil risiko rendah tanpa gejala klinis</Text>
                  </View>
                  <View style={styles.activeTierPill}>
                    <Text style={styles.activeTierPillText}>Tersedia</Text>
                  </View>
                </View>
                <Text style={styles.tierDesc}>
                  Protokol antioksidan 90 hari (CoQ10 + Zinc), pendinginan skrotum, dan olahraga kardio untuk memicu pembaharuan siklus spermatogenesis.
                </Text>
              </View>

              {/* Triage Tier 2 */}
              <View style={styles.triageTier}>
                <View style={styles.tierHeader}>
                  <View style={[styles.tierNum, { backgroundColor: '#007AFF' }]}>
                    <Text style={styles.tierNumText}>2</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.tierTitle}>Telekonsultasi Dokter Keluarga (Primary Care)</Text>
                    <Text style={styles.tierSub}>Evaluasi metabolik & panel hormon darah awal</Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => router.push('/halo-dokter' as any)}
                    style={styles.connectBtn}
                  >
                    <Text style={styles.connectBtnText}>Telehealth</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.tierDesc}>
                  Konsultasi video privat dengan dokter umum/keluarga untuk meninjau riwayat obat dan meminta panel laboratorium hormon (Testosteron Total, Prolaktin, LH).
                </Text>
              </View>

              {/* Triage Tier 3 */}
              <View style={styles.triageTier}>
                <View style={styles.tierHeader}>
                  <View style={[styles.tierNum, { backgroundColor: '#FF9500' }]}>
                    <Text style={styles.tierNumText}>3</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.tierTitle}>Spesialis Andrologi & Urologi Abu Dhabi</Text>
                    <Text style={styles.tierSub}>Evaluasi fisik varikokel & USG Doppler skrotum</Text>
                  </View>
                  <View style={styles.activeTierPill}>
                    <Text style={styles.activeTierPillText}>Rujukan</Text>
                  </View>
                </View>
                <Text style={styles.tierDesc}>
                  Dianjurkan jika ada riwayat kriptorkismus, benjolan kantung buah zakar, atau parameter mikroskopis abnormal yang memerlukan tindakan medis terarah.
                </Text>
              </View>

              {/* Red Flags Alert */}
              <View style={styles.redFlagCard}>
                <Ionicons name="warning" size={20} color="#FF3B30" />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.redFlagTitle}>Red Flags (Peringatan Segera):</Text>
                  <Text style={styles.redFlagText}>
                    Jika merasakan nyeri akut skrotum, pembengkakan keras mendadak, atau hematospermia (darah pada cairan), segera kunjungi IGD Rumah Sakit terdekat (Cleveland Clinic Abu Dhabi / Sheikh Shakhbout Medical City).
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: ISLAMIC MEDICAL JURISPRUDENCE & CULTURAL RESPECT                   */}
        {/* ========================================================================= */}
        {activeTab === 'sharia' && (
          <View style={styles.sectionWrap}>
            <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
              <View style={styles.shariaHeader}>
                <Ionicons name="book" size={24} color="#5856D6" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                    Panduan Fikih Medis & Kepercayaan Budaya
                  </Text>
                  <Text style={styles.cardSubtitle}>
                    Menjamin kenyamanan spiritual dan kepatuhan syariat dalam pemeriksaan reproduksi
                  </Text>
                </View>
              </View>

              <View style={styles.faqBox}>
                <Text style={styles.faqQ}>1. Bagaimana hukum pengambilan sampel cairan reproduksi untuk diagnosis medis?</Text>
                <Text style={styles.faqA}>
                  Berdasarkan fatwa mayoritas ulama dan lembaga fatwa resmi UAE (Majlis Al-Ifta), pemeriksaan diagnostik untuk tujuan pengobatan (*tadawi*) dan pencegahan penyakit diperbolehkan secara syar'i atas dasar kebutuhan medis (*Ad-Dharurah / Al-Hajah At-Tibbiyyah*).
                </Text>
              </View>

              <View style={styles.faqBox}>
                <Text style={styles.faqQ}>2. Apakah ada metode pengambilan sampel bersama istri?</Text>
                <Text style={styles.faqA}>
                  Ya. Tersedia opsi penggunaan kondom medis khusus non-spermisida (*Semen Collection Device*) saat bersama pasangan sah, sehingga tidak melanggar adab kesopanan dan keyakinan individu.
                </Text>
              </View>

              <View style={styles.faqBox}>
                <Text style={styles.faqQ}>3. Perlindungan Privasi & Kehormatan Pribadi (Sitr Al-'Awrah):</Text>
                <Text style={styles.faqA}>
                  Pemeriksaan mandiri berbasis teknologi ponsel meminimalkan paparan aurat di hadapan pihak ketiga, menjaga martabat dan rasa malu (*Haya'*) pasien secara penuh.
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: DUAL-CONSENT ZERO-KNOWLEDGE PARTNER LINK                           */}
        {/* ========================================================================= */}
        {activeTab === 'partner' && (
          <View style={styles.sectionWrap}>
            <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
              <View style={styles.partnerHeader}>
                <Ionicons name="link" size={24} color="#FF2D55" />
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#1C1C1E' }]}>
                    Koneksi Prakonsepsi Pasangan (Dual-Consent)
                  </Text>
                  <Text style={styles.cardSubtitle}>
                    Menghubungkan data kesehatan reproduksi suami-istri tanpa melanggar privasi masing-masing
                  </Text>
                </View>
              </View>

              <View style={styles.zkpBox}>
                <Text style={styles.zkpTitle}>Protokol Privasi Zero-Knowledge:</Text>
                <Text style={styles.zkpText}>
                  Detail sensitif (riwayat medis pribadi) tetap terisolasi. Hanya skor kesiapan kesuburan gabungan (*Preconception Readiness Score*) yang dibagikan kepada dokter spesialis kandungan pasangan, mencegah pemeriksaan invasif berulang pada istri.
                </Text>
              </View>

              {partnerLinked ? (
                <View style={styles.linkedBox}>
                  <Ionicons name="checkmark-done-circle" size={24} color="#34C759" />
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.linkedTitle}>Terhubung dengan Rekam Medis Pasangan</Text>
                    <Text style={styles.linkedSub}>ID Pasangan: DXB-OBGYN-9042 • Consent: Aktif</Text>
                  </View>
                  <TouchableOpacity onPress={() => setPartnerLinked(false)}>
                    <Text style={styles.unlinkText}>Putuskan</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.linkForm}>
                  <Text style={styles.label}>Masukkan Kode Pasangan dari Aplikasi Pasangan:</Text>
                  <TextInput
                    style={[styles.input, { color: isDark ? '#FFF' : '#000' }]}
                    value={partnerCode}
                    onChangeText={setPartnerCode}
                    placeholder="Contoh: DXB-OBGYN-xxxx"
                    placeholderTextColor="#8E8E93"
                  />
                  <TouchableOpacity
                    onPress={() => {
                      setPartnerLinked(true);
                      Alert.alert('Sukses', 'Koneksi prakonsepsi pasangan berhasil diaktifkan dengan izin ganda (Dual-Consent).');
                    }}
                    style={styles.primaryBtn}
                  >
                    <Ionicons name="key" size={16} color="#FFF" />
                    <Text style={styles.primaryBtnText}>Verifikasi & Hubungkan Pasangan</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>

            {/* Health Economics Card */}
            <View style={[styles.card, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
              <View style={styles.heorHeader}>
                <Ionicons name="cash-outline" size={20} color="#34C759" />
                <Text style={[styles.cardTitle, { marginLeft: 8, color: isDark ? '#FFF' : '#1C1C1E' }]}>
                  Dampak Ekonomi Kesehatan (Thiqa & Daman ROI)
                </Text>
              </View>
              <Text style={styles.heorText}>
                Intervensi hulu pada faktor pria (nutrisi antioksidan, penurunan berat badan, koreksi varikokel) dapat mencegah kebutuhan 1-2 siklus bayi tabung (IVF/ICSI), menghemat rata-rata <strong>35.000 - 55.000 AED</strong> untuk asuransi kesehatan nasional UAE.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 6,
    marginRight: 8,
  },
  headerTitleWrap: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  arabicTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  dohBadge: {
    backgroundColor: '#007AFF15',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  dohBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginTop: 2,
  },
  tabBar: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  tabScroll: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
    backgroundColor: '#E5E5EA40',
    gap: 6,
  },
  tabButtonActive: {
    backgroundColor: '#007AFF',
  },
  tabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#636366',
  },
  tabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  sectionWrap: {
    gap: 16,
  },
  trustBanner: {
    flexDirection: 'row',
    backgroundColor: '#007AFF10',
    borderColor: '#007AFF30',
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    gap: 12,
  },
  trustIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#007AFF20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trustTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
  },
  trustSubtitle: {
    fontSize: 11,
    color: '#3A3A3C',
    marginTop: 2,
    lineHeight: 16,
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: '#C6C6C850',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardHeaderFlex: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
  },
  cardSubtitle: {
    fontSize: 12,
    color: '#8E8E93',
    marginBottom: 12,
    lineHeight: 16,
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 12,
  },
  formCol: {
    flex: 1,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#C6C6C8',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
  },
  segmentedRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#E5E5EA',
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: '#007AFF',
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#3A3A3C',
  },
  segmentTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  optimalPill: {
    backgroundColor: '#34C75915',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  optimalPillText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#34C759',
  },
  riskItem: {
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  riskItemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  riskCategory: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
    textTransform: 'uppercase',
  },
  riskBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  riskBadgeGreen: { backgroundColor: '#34C75920' },
  riskBadgeYellow: { backgroundColor: '#FF950020' },
  riskBadgeRed: { backgroundColor: '#FF3B3020' },
  riskBadgeText: { fontSize: 9, fontWeight: '800' },
  riskTextGreen: { color: '#34C759' },
  riskTextYellow: { color: '#FF9500' },
  riskTextRed: { color: '#FF3B30' },
  riskName: {
    fontSize: 13,
    fontWeight: '700',
    marginTop: 4,
  },
  riskDetail: {
    fontSize: 12,
    color: '#636366',
    marginTop: 2,
    lineHeight: 16,
  },
  recommendationBox: {
    flexDirection: 'row',
    backgroundColor: '#007AFF08',
    borderColor: '#007AFF20',
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 6,
    alignItems: 'center',
    gap: 6,
  },
  recommendationText: {
    fontSize: 11,
    color: '#007AFF',
    flex: 1,
  },
  microfluidicHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  testPromptBox: {
    padding: 12,
    backgroundColor: '#34C75908',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#34C75920',
    marginTop: 4,
  },
  testPromptText: {
    fontSize: 12,
    color: '#3A3A3C',
    lineHeight: 17,
    marginBottom: 12,
  },
  primaryBtn: {
    backgroundColor: '#007AFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 10,
    gap: 8,
  },
  primaryBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  testingBox: {
    padding: 20,
    alignItems: 'center',
  },
  testingTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#007AFF',
  },
  testingSub: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 4,
  },
  progressBarBg: {
    width: '100%',
    height: 6,
    backgroundColor: '#E5E5EA',
    borderRadius: 3,
    marginTop: 16,
    overflow: 'hidden',
  },
  progressBarFill: {
    width: '70%',
    height: '100%',
    backgroundColor: '#34C759',
    borderRadius: 3,
  },
  resultsBox: {
    gap: 12,
  },
  resultBannerGreen: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C75915',
    padding: 10,
    borderRadius: 10,
    gap: 8,
  },
  resultBannerText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34C759',
  },
  grid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridCell: {
    width: '48%',
    backgroundColor: '#F2F2F7',
    padding: 12,
    borderRadius: 10,
  },
  gridLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '600',
  },
  gridVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1E',
    marginTop: 2,
  },
  gridRef: {
    fontSize: 10,
    color: '#34C759',
    marginTop: 2,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 10,
    gap: 6,
  },
  exportBtnDone: {
    borderColor: '#34C759',
    backgroundColor: '#34C75910',
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#007AFF',
  },
  triageTier: {
    paddingVertical: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  tierHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tierNum: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tierNumText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '800',
  },
  tierTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  tierSub: {
    fontSize: 10,
    color: '#8E8E93',
  },
  tierDesc: {
    fontSize: 11,
    color: '#636366',
    marginTop: 6,
    lineHeight: 16,
  },
  activeTierPill: {
    backgroundColor: '#E5E5EA',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  activeTierPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#3A3A3C',
  },
  connectBtn: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  connectBtnText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  redFlagCard: {
    flexDirection: 'row',
    backgroundColor: '#FF3B3010',
    borderColor: '#FF3B3030',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  redFlagTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FF3B30',
  },
  redFlagText: {
    fontSize: 11,
    color: '#3A3A3C',
    marginTop: 2,
    lineHeight: 15,
  },
  shariaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  faqBox: {
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5EA',
  },
  faqQ: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1C1C1E',
  },
  faqA: {
    fontSize: 11,
    color: '#636366',
    marginTop: 4,
    lineHeight: 16,
  },
  partnerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  zkpBox: {
    backgroundColor: '#FF2D5510',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  zkpTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FF2D55',
  },
  zkpText: {
    fontSize: 11,
    color: '#3A3A3C',
    marginTop: 2,
    lineHeight: 15,
  },
  linkForm: {
    gap: 8,
  },
  linkedBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C75915',
    padding: 12,
    borderRadius: 12,
  },
  linkedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#34C759',
  },
  linkedSub: {
    fontSize: 10,
    color: '#636366',
  },
  unlinkText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  heorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  heorText: {
    fontSize: 11,
    color: '#636366',
    lineHeight: 16,
  },
});

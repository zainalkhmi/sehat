import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Colors } from '@/constants/theme';
import { useAccount } from '@spezivibe/account';
import { AccountButton } from '@/components/account/account-button';
import { useAccountSheet } from './_layout';

interface SixPackMenuItem {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  bgColor: string;
  badge?: string;
  route: string;
}

const SIX_PACK_MENU: SixPackMenuItem[] = [
  {
    id: 'halo-dokter',
    title: 'Halo Dokter',
    subtitle: 'dr. Budi Santoso, Sp.JP • Telemedis',
    icon: 'medkit',
    color: '#007AFF',
    bgColor: '#007AFF15',
    badge: 'Online',
    route: '/halo-dokter',
  },
  {
    id: 'devices',
    title: 'Devices',
    subtitle: 'Pair Omron, scales & sensors',
    icon: 'bluetooth',
    color: '#0A84FF',
    bgColor: '#0A84FF15',
    route: '/(tabs)/devices',
  },
  {
    id: 'measurements',
    title: 'Measurements',
    subtitle: 'Blood pressure & vitals telemetry',
    icon: 'heart-circle',
    color: '#FF2D55',
    bgColor: '#FF2D5515',
    badge: '103/64',
    route: '/(tabs)/measurements',
  },
  {
    id: 'nams',
    title: 'NAMS NeuroNest',
    subtitle: 'Stanford 4-channel EEG & cognition',
    icon: 'hardware-chip',
    color: '#5856D6',
    bgColor: '#5856D615',
    badge: 'Stanford',
    route: '/nams',
  },
  {
    id: 'chat',
    title: 'AI Clinical Chat',
    subtitle: 'Gemini 2.5 Flash medical advisor',
    icon: 'sparkles',
    color: '#34C759',
    bgColor: '#34C75915',
    badge: 'Gemini',
    route: '/(tabs)/chat',
  },
  {
    id: 'questionnaires',
    title: 'Questionnaires',
    subtitle: 'FHIR PHQ-9 & GAD-7 screening',
    icon: 'clipboard',
    color: '#FF9500',
    bgColor: '#FF950015',
    route: '/(tabs)/schedule',
  },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const { signedIn } = useAccount();
  const { showAccountSheet } = useAccountSheet();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}>
      {/* Header Bar */}
      <View style={styles.header}>
        <View style={styles.headerTitleWrap}>
          <View style={styles.logoPill}>
            <Ionicons name="fitness" size={18} color="#007AFF" />
            <Text style={styles.logoPillText}>SEHAT • STANFORD SPEZI</Text>
          </View>
          <Text style={[styles.mainTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            Clinical Dashboard
          </Text>
        </View>

        {signedIn ? (
          <AccountButton onPress={showAccountSheet} />
        ) : (
          <TouchableOpacity onPress={showAccountSheet} style={styles.profileBtn}>
            <Ionicons name="person-circle" size={36} color="#007AFF" />
          </TouchableOpacity>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Quick Vitals Overview Banner */}
        <View style={[styles.vitalsBanner, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <View style={styles.vitalsHeader}>
            <Text style={styles.vitalsHeaderTitle}>LATEST CLINICAL TELEMETRY</Text>
            <View style={styles.syncBadge}>
              <View style={styles.syncDot} />
              <Text style={styles.syncText}>Live BLE</Text>
            </View>
          </View>

          <View style={styles.vitalsGrid}>
            <View style={styles.vitalStatItem}>
              <Text style={styles.vitalLabel}>Blood Pressure</Text>
              <Text style={[styles.vitalValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                103/64
              </Text>
              <Text style={styles.vitalUnit}>mmHg • Optimal</Text>
            </View>
            <View style={styles.vitalDivider} />
            <View style={styles.vitalStatItem}>
              <Text style={styles.vitalLabel}>Heart Rate</Text>
              <Text style={[styles.vitalValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                72
              </Text>
              <Text style={styles.vitalUnit}>bpm • Resting</Text>
            </View>
            <View style={styles.vitalDivider} />
            <View style={styles.vitalStatItem}>
              <Text style={styles.vitalLabel}>EEG TBR Index</Text>
              <Text style={[styles.vitalValue, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                2.14
              </Text>
              <Text style={styles.vitalUnit}>Normal Focus</Text>
            </View>
          </View>
        </View>

        {/* CONNECTED DOCTOR LIVE CARD (HALO DOKTER) */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => router.push('/halo-dokter')}
          style={[styles.doctorConnectedBanner, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}
        >
          <View style={styles.docBannerTop}>
            <View style={styles.docBadge}>
              <Ionicons name="shield-checkmark" size={12} color="#FFFFFF" />
              <Text style={styles.docBadgeText}>DOKTER TERHUBUNG (HALO DOKTER)</Text>
            </View>
            <View style={styles.docLivePill}>
              <View style={styles.docLiveDot} />
              <Text style={styles.docLiveText}>Online</Text>
            </View>
          </View>

          <View style={styles.docBannerMain}>
            <View style={styles.docAvatarWrap}>
              <Ionicons name="person" size={28} color="#FFFFFF" />
              <View style={styles.docVerifiedTick}>
                <Ionicons name="checkmark" size={9} color="#FFFFFF" />
              </View>
            </View>

            <View style={styles.docInfoCol}>
              <Text style={[styles.docName, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                dr. Budi Santoso, Sp.JP(K), FIHA
              </Text>
              <Text style={styles.docSpecialty}>
                Spesialis Jantung & Pembuluh Darah • DPJP Utama
              </Text>
              <Text style={styles.docHospital}>
                RS Jantung Harapan Kita • Siap Konsultasi
              </Text>
            </View>
          </View>

          <View style={[styles.docBannerFooter, { backgroundColor: isDark ? '#2C2C2E' : '#F2F2F7' }]}>
            <View style={styles.docFooterLeft}>
              <Ionicons name="chatbubble-ellipses" size={16} color="#007AFF" />
              <Text style={styles.docFooterText}>Terhubung via Rekam Medis Supabase</Text>
            </View>
            <View style={styles.docFooterAction}>
              <Text style={styles.docFooterActionText}>Konsultasi</Text>
              <Ionicons name="chevron-forward" size={14} color="#007AFF" />
            </View>
          </View>
        </TouchableOpacity>

        {/* Section Title */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>FEATURE HUB (SIX-PACK MENU)</Text>
          <Text style={styles.sectionSubtitle}>Tap to launch module</Text>
        </View>

        {/* THE SIX-PACK MENU GRID (2 Kolom x 3 Baris) */}
        <View style={styles.sixPackGrid}>
          {SIX_PACK_MENU.map((item) => (
            <TouchableOpacity
              key={item.id}
              activeOpacity={0.8}
              onPress={() => router.push(item.route as any)}
              style={[
                styles.menuCard,
                { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
              ]}
            >
              {/* Card Top: Icon & Optional Badge */}
              <View style={styles.cardTopRow}>
                <View style={[styles.cardIconWrap, { backgroundColor: item.bgColor }]}>
                  <Ionicons name={item.icon} size={28} color={item.color} />
                </View>

                {item.badge && (
                  <View style={[styles.cardBadge, { backgroundColor: `${item.color}18` }]}>
                    <Text style={[styles.cardBadgeText, { color: item.color }]}>
                      {item.badge}
                    </Text>
                  </View>
                )}
              </View>

              {/* Card Bottom: Text info */}
              <View style={styles.cardTextWrap}>
                <Text
                  numberOfLines={1}
                  style={[styles.cardTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}
                >
                  {item.title}
                </Text>
                <Text numberOfLines={2} style={styles.cardSubtitle}>
                  {item.subtitle}
                </Text>
              </View>

              {/* Arrow Indicator */}
              <View style={styles.cardArrow}>
                <Ionicons name="arrow-forward-circle" size={20} color={item.color} />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Bottom Standards Footer */}
        <View style={[styles.standardsCard, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
          <Ionicons name="shield-checkmark" size={20} color="#34C759" />
          <Text style={styles.standardsText}>
            HL7 FHIR R4 • Stanford Spezi • UU PDP No. 27/2022
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  headerTitleWrap: {
    gap: 3,
  },
  logoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  logoPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#007AFF',
    letterSpacing: 0.5,
  },
  mainTitle: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  profileBtn: {
    padding: 2,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  vitalsBanner: {
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  vitalsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  vitalsHeaderTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.5,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#34C75915',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  syncDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },
  syncText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#34C759',
  },
  vitalsGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  vitalStatItem: {
    flex: 1,
    alignItems: 'center',
  },
  vitalLabel: {
    fontSize: 11,
    color: '#8E8E93',
    marginBottom: 2,
  },
  vitalValue: {
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  vitalUnit: {
    fontSize: 10,
    color: '#8E8E93',
    marginTop: 2,
  },
  vitalDivider: {
    width: StyleSheet.hairlineWidth,
    height: 36,
    backgroundColor: '#8E8E9330',
  },

  // CONNECTED DOCTOR LIVE CARD
  doctorConnectedBanner: {
    borderRadius: 20,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#007AFF25',
  },
  docBannerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  docBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  docBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  docLivePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#34C75918',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  docLiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34C759',
  },
  docLiveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34C759',
  },
  docBannerMain: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  docAvatarWrap: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  docVerifiedTick: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#34C759',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  docInfoCol: {
    flex: 1,
    gap: 1,
  },
  docName: {
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  docSpecialty: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '600',
  },
  docHospital: {
    fontSize: 10,
    color: '#8E8E93',
  },
  docBannerFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  docFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  docFooterText: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
  },
  docFooterAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  docFooterActionText: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '700',
  },

  // SECTION HEADER
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#8E8E93',
    letterSpacing: 0.6,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },

  // SIX-PACK GRID: 2 Kolom x 3 Baris
  sixPackGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 14,
  },
  menuCard: {
    width: '47.5%',
    minHeight: 146,
    borderRadius: 22,
    padding: 14,
    justifyContent: 'space-between',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cardBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  cardTextWrap: {
    marginTop: 10,
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  cardSubtitle: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
    lineHeight: 14,
  },
  cardArrow: {
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  standardsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 24,
  },
  standardsText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E8E93',
  },
});

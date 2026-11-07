import { Image } from 'expo-image';
import { Platform, StyleSheet, View, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { Collapsible } from '@/components/ui/collapsible';
import { ExternalLink } from '@/components/external-link';
import ParallaxScrollView from '@/components/parallax-scroll-view';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Fonts } from '@/constants/theme';
import { AccountButton } from '@/components/account/account-button';
import { useAccountSheet } from './_layout';
import { useAccount } from '@spezivibe/account';

export default function TabTwoScreen() {
  const { signedIn } = useAccount();
  const { showAccountSheet } = useAccountSheet();
  const insets = useSafeAreaInsets();

  return (
    <>
      {signedIn && (
        <View style={[styles.accountButtonContainer, { top: insets.top + 8 }]}>
          <AccountButton onPress={showAccountSheet} />
        </View>
      )}

      <ParallaxScrollView
        headerBackgroundColor={{ light: '#D0D0D0', dark: '#353636' }}
        headerImage={
        <IconSymbol
          size={310}
          color="#808080"
          name="chevron.left.forwardslash.chevron.right"
          style={styles.headerImage}
        />
      }>
      <ThemedView style={styles.titleContainer}>
        <ThemedText
          type="title"
          style={{
            fontFamily: Fonts.rounded,
          }}>
          Clinical Research Modules
        </ThemedText>
      </ThemedView>

      {/* Stanford NAMS Feature Card */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={() => router.push('/nams')}
        style={styles.namsFeatureCard}
      >
        <View style={styles.namsHeader}>
          <View style={styles.namsIconWrap}>
            <Ionicons name="hardware-chip" size={28} color="#FFFFFF" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.namsBadgeRow}>
              <View style={styles.namsPill}>
                <ThemedText style={styles.namsPillText}>StanfordBDHG / NAMS</ThemedText>
              </View>
              <View style={styles.eegActivePill}>
                <ThemedText style={styles.eegActiveText}>Muse & Biopot BLE</ThemedText>
              </View>
            </View>
            <ThemedText style={styles.namsCardTitle}>
              NeuroNest EEG & Neurodevelopment
            </ThemedText>
          </View>
        </View>

        <ThemedText style={styles.namsCardDesc}>
          Live 4-channel frontal & temporal EEG acquisition (TP9, AF7, AF8, TP10), Theta/Beta Ratio biomarker, and FHIR milestone screening.
        </ThemedText>

        <View style={styles.namsCardFooter}>
          <ThemedText style={styles.namsOpenText}>Launch NAMS Protocol</ThemedText>
          <Ionicons name="arrow-forward-circle" size={22} color="#007AFF" />
        </View>
      </TouchableOpacity>
      <Collapsible title="File-based routing">
        <ThemedText>
          This app has two tabs:{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> (Home) and{' '}
          <ThemedText type="defaultSemiBold">app/(tabs)/explore.tsx</ThemedText>.
        </ThemedText>
        <ThemedText>
          The layout file in <ThemedText type="defaultSemiBold">app/(tabs)/_layout.tsx</ThemedText>{' '}
          sets up the tab navigator.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/router/introduction">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Android, iOS, and web support">
        <ThemedText>
          You can open this project on Android, iOS, and the web. To open the web version, press{' '}
          <ThemedText type="defaultSemiBold">w</ThemedText> in the terminal running this project.
        </ThemedText>
      </Collapsible>
      <Collapsible title="Modular packages">
        <ThemedText>
          SpeziVibe uses modular packages in the <ThemedText type="defaultSemiBold">packages/</ThemedText>{' '}
          directory. Add features like chat, scheduler, questionnaires, and more using the CLI.
        </ThemedText>
      </Collapsible>
      <Collapsible title="Images">
        <ThemedText>
          For static images, you can use the <ThemedText type="defaultSemiBold">@2x</ThemedText> and{' '}
          <ThemedText type="defaultSemiBold">@3x</ThemedText> suffixes to provide files for
          different screen densities
        </ThemedText>
        <Image
          source={require('@/assets/images/react-logo.png')}
          style={{ width: 100, height: 100, alignSelf: 'center' }}
        />
        <ExternalLink href="https://reactnative.dev/docs/images">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Light and dark mode components">
        <ThemedText>
          This template has light and dark mode support. The{' '}
          <ThemedText type="defaultSemiBold">useColorScheme()</ThemedText> hook lets you inspect
          what the user&apos;s current color scheme is, and so you can adjust UI colors accordingly.
        </ThemedText>
        <ExternalLink href="https://docs.expo.dev/develop/user-interface/color-themes/">
          <ThemedText type="link">Learn more</ThemedText>
        </ExternalLink>
      </Collapsible>
      <Collapsible title="Animations">
        <ThemedText>
          This template includes an example of an animated component. The{' '}
          <ThemedText type="defaultSemiBold">components/HelloWave.tsx</ThemedText> component uses
          the powerful{' '}
          <ThemedText type="defaultSemiBold" style={{ fontFamily: Fonts.mono }}>
            react-native-reanimated
          </ThemedText>{' '}
          library to create a waving hand animation.
        </ThemedText>
        {Platform.select({
          ios: (
            <ThemedText>
              The <ThemedText type="defaultSemiBold">components/ParallaxScrollView.tsx</ThemedText>{' '}
              component provides a parallax effect for the header image.
            </ThemedText>
          ),
        })}
      </Collapsible>
    </ParallaxScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  accountButtonContainer: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  namsFeatureCard: {
    backgroundColor: '#007AFF10',
    borderRadius: 20,
    padding: 18,
    marginVertical: 14,
    borderWidth: 1.5,
    borderColor: '#007AFF30',
  },
  namsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  namsIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  namsBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  namsPill: {
    backgroundColor: '#007AFF20',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  namsPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#007AFF',
  },
  eegActivePill: {
    backgroundColor: '#34C75920',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  eegActiveText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#34C759',
  },
  namsCardTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  namsCardDesc: {
    fontSize: 12,
    lineHeight: 18,
    opacity: 0.8,
    marginBottom: 12,
  },
  namsCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#007AFF25',
  },
  namsOpenText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#007AFF',
  },
});

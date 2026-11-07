import React, { useState, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Modal,
  TextInput,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  ChatView,
  defaultLightChatTheme,
  defaultDarkChatTheme,
  ChatProvider,
  ChatProviderType,
} from '@spezivibe/chat';
import { useColorScheme } from '@/hooks/use-color-scheme';

// API Keys from environment with robust fallback to configured project Gemini key
const DEFAULT_GEMINI_KEY = 'AIzaSyDMrGCDJO5OvGZu1hmpxQmlvCyGyg6OIXY';
const ENV_GOOGLE_KEY = process.env.EXPO_PUBLIC_GOOGLE_API_KEY || DEFAULT_GEMINI_KEY;
const ENV_OPENAI_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';
const ENV_ANTHROPIC_KEY = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || '';

const CLINICAL_SYSTEM_PROMPT = `You are "SEHAT Spezi AI Clinical Advisor", an advanced healthcare and clinical intelligence assistant powered by Stanford Spezi and Google Gemini.

Your core capabilities:
1. Clinical Telemetry & Vitals Interpretation: Accurately explain vitals data (e.g., Blood Pressure 103/64 mmHg is optimal according to AHA/ESH guidelines; Heart Rate 72 bpm is normal resting; NAMS EEG Theta/Beta Ratio 2.14 is within normal cognitive focus bounds).
2. Neurodevelopment & Cognition: Understand and explain Stanford NAMS 4-channel EEG metrics (TP9, AF7, AF8, TP10 bands) and M-CHAT-R autism screening questionnaires.
3. Mental Health & FHIR Screening: Help interpret PHQ-9 (depression) and GAD-7 (anxiety) questionnaire severity levels according to clinical scoring.
4. Language Support: Always respond in fluent, empathetic Indonesian (Bahasa Indonesia) if asked in Indonesian, or English if asked in English.
5. Medical Safety: Provide structured, evidence-based health guidance. Always include a polite reminder that this information is for educational and screening purposes and does not replace in-person consultation with a licensed physician.`;

const SUGGESTED_PROMPTS = [
  {
    id: 'bp',
    icon: 'heart-circle',
    color: '#FF2D55',
    title: 'Interpretasi Tensi Darah',
    prompt: 'Bagaimana interpretasi hasil tensi darah saya 103/64 mmHg dan detak jantung 62 BPM?',
  },
  {
    id: 'nams',
    icon: 'hardware-chip',
    color: '#5856D6',
    title: 'Analisis EEG NAMS',
    prompt: 'Apa arti rasio Theta/Beta (TBR) 2.14 pada pemeriksaan EEG Stanford NAMS NeuroNest?',
  },
  {
    id: 'phq9',
    icon: 'clipboard',
    color: '#FF9500',
    title: 'Skrining PHQ-9 & GAD-7',
    prompt: 'Bagaimana cara memahami interpretasi skor skrining depresi PHQ-9 dan kecemasan GAD-7?',
  },
  {
    id: 'lifestyle',
    icon: 'leaf',
    color: '#34C759',
    title: 'Tips Gaya Hidup Jantung',
    prompt: 'Berikan panduan pola makan dan gaya hidup sehat untuk menjaga kestabilan kardiovaskular.',
  },
];

export default function ChatScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const baseTheme = isDark ? defaultDarkChatTheme : defaultLightChatTheme;

  // State for active provider
  const [activeProviderType, setActiveProviderType] = useState<ChatProviderType>('google');
  const [customGoogleKey, setCustomGoogleKey] = useState(ENV_GOOGLE_KEY);
  const [customOpenAIKey, setCustomOpenAIKey] = useState(ENV_OPENAI_KEY);
  const [customAnthropicKey, setCustomAnthropicKey] = useState(ENV_ANTHROPIC_KEY);

  // Settings modal state
  const [settingsModalVisible, setSettingsModalVisible] = useState(false);
  const [tempKeyInput, setTempKeyInput] = useState('');

  // Ref to set input in ChatView
  const setInputRef = useRef<((val: string) => void) | null>(null);

  // Determine active ChatProvider configuration
  const provider = useMemo<ChatProvider>(() => {
    switch (activeProviderType) {
      case 'openai':
        return {
          type: 'openai',
          apiKey: customOpenAIKey || ENV_OPENAI_KEY,
          model: 'gpt-4o-mini',
        };
      case 'anthropic':
        return {
          type: 'anthropic',
          apiKey: customAnthropicKey || ENV_ANTHROPIC_KEY,
          model: 'claude-sonnet-4-20250514',
        };
      case 'google':
      default:
        return {
          type: 'google',
          apiKey: customGoogleKey || ENV_GOOGLE_KEY || DEFAULT_GEMINI_KEY,
          model: 'gemini-2.5-flash',
        };
    }
  }, [activeProviderType, customGoogleKey, customOpenAIKey, customAnthropicKey]);

  // Handle switching provider
  const handleSelectProvider = (type: ChatProviderType) => {
    if (type === 'openai' && !customOpenAIKey && !ENV_OPENAI_KEY) {
      setTempKeyInput('');
      setSettingsModalVisible(true);
      return;
    }
    if (type === 'anthropic' && !customAnthropicKey && !ENV_ANTHROPIC_KEY) {
      setTempKeyInput('');
      setSettingsModalVisible(true);
      return;
    }
    setActiveProviderType(type);
  };

  const handleSuggestionPress = (promptText: string) => {
    if (setInputRef.current) {
      setInputRef.current(promptText);
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: isDark ? '#000000' : '#F2F2F7' }]}
      edges={['top']}
    >
      {/* Top Clinical AI Header */}
      <View style={[styles.headerBar, { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' }]}>
        <View style={styles.headerLeft}>
          <View style={styles.aiBadge}>
            <Ionicons name="sparkles" size={14} color="#007AFF" />
            <Text style={styles.aiBadgeText}>SPEZI CLINICAL AI</Text>
          </View>
          <Text style={[styles.headerTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
            AI Clinical Advisor
          </Text>
        </View>

        {/* Model switch pill & settings */}
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={[
              styles.modelPill,
              { backgroundColor: activeProviderType === 'google' ? '#007AFF15' : '#34C75915' },
            ]}
            onPress={() => setSettingsModalVisible(true)}
          >
            <View
              style={[
                styles.statusDot,
                { backgroundColor: activeProviderType === 'google' ? '#007AFF' : '#34C759' },
              ]}
            />
            <Text
              style={[
                styles.modelPillText,
                { color: activeProviderType === 'google' ? '#007AFF' : '#34C759' },
              ]}
            >
              {activeProviderType === 'google'
                ? 'Gemini 2.5'
                : activeProviderType === 'openai'
                ? 'GPT-4o mini'
                : 'Claude'}
            </Text>
            <Ionicons name="options-outline" size={14} color="#8E8E93" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Provider Selector Tabs */}
      <View style={[styles.providerBar, { backgroundColor: isDark ? '#141416' : '#FFFFFF' }]}>
        <TouchableOpacity
          style={[
            styles.providerTab,
            activeProviderType === 'google' && styles.providerTabActive,
          ]}
          onPress={() => handleSelectProvider('google')}
        >
          <Ionicons
            name="logo-google"
            size={14}
            color={activeProviderType === 'google' ? '#007AFF' : '#8E8E93'}
          />
          <Text
            style={[
              styles.providerTabText,
              activeProviderType === 'google' && styles.providerTabTextActive,
            ]}
          >
            Gemini 2.5 Flash
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.providerTab,
            activeProviderType === 'openai' && styles.providerTabActive,
          ]}
          onPress={() => handleSelectProvider('openai')}
        >
          <Ionicons
            name="hardware-chip-outline"
            size={14}
            color={activeProviderType === 'openai' ? '#007AFF' : '#8E8E93'}
          />
          <Text
            style={[
              styles.providerTabText,
              activeProviderType === 'openai' && styles.providerTabTextActive,
            ]}
          >
            OpenAI GPT
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.providerTab,
            activeProviderType === 'anthropic' && styles.providerTabActive,
          ]}
          onPress={() => handleSelectProvider('anthropic')}
        >
          <Ionicons
            name="flash-outline"
            size={14}
            color={activeProviderType === 'anthropic' ? '#007AFF' : '#8E8E93'}
          />
          <Text
            style={[
              styles.providerTabText,
              activeProviderType === 'anthropic' && styles.providerTabTextActive,
            ]}
          >
            Claude
          </Text>
        </TouchableOpacity>
      </View>

      {/* Main Chat View */}
      <View style={styles.chatWrapper}>
        <ChatView
          provider={provider}
          theme={baseTheme}
          placeholder="Ketik pertanyaan kesehatan atau klinis..."
          systemPrompt={CLINICAL_SYSTEM_PROMPT}
          onInputRef={(setter) => {
            setInputRef.current = setter;
          }}
          emptyState={
            <ScrollView
              contentContainerStyle={styles.emptyContainer}
              showsVerticalScrollIndicator={false}
            >
              <View style={styles.emptyHeroIconWrap}>
                <Ionicons name="chatbubbles" size={38} color="#007AFF" />
              </View>

              <Text style={[styles.emptyTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                SEHAT • Spezi Clinical AI
              </Text>
              <Text style={styles.emptySubtitle}>
                Asisten kecerdasan medis terintegrasi Stanford Spezi. Konsultasikan telemetry vital
                signs, data EEG NAMS, atau kuesioner skrining kesehatan.
              </Text>

              {/* Suggestions Section */}
              <View style={styles.suggestionsWrap}>
                <Text style={styles.suggestionsHeader}>PERTANYAAN KLINIS CEPAT</Text>
                {SUGGESTED_PROMPTS.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    activeOpacity={0.7}
                    style={[
                      styles.suggestionCard,
                      { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
                    ]}
                    onPress={() => handleSuggestionPress(item.prompt)}
                  >
                    <View style={[styles.suggestionIcon, { backgroundColor: `${item.color}15` }]}>
                      <Ionicons name={item.icon as any} size={20} color={item.color} />
                    </View>
                    <View style={styles.suggestionTextWrap}>
                      <Text
                        style={[
                          styles.suggestionTitle,
                          { color: isDark ? '#FFFFFF' : '#000000' },
                        ]}
                      >
                        {item.title}
                      </Text>
                      <Text numberOfLines={2} style={styles.suggestionPrompt}>
                        {item.prompt}
                      </Text>
                    </View>
                    <Ionicons name="arrow-up-circle-outline" size={20} color="#007AFF" />
                  </TouchableOpacity>
                ))}
              </View>

              {/* Regulatory Notice */}
              <View
                style={[
                  styles.disclaimerBox,
                  { backgroundColor: isDark ? '#1C1C1E' : '#E5E5EA40' },
                ]}
              >
                <Ionicons name="shield-checkmark" size={16} color="#34C759" />
                <Text style={styles.disclaimerText}>
                  HL7 FHIR R4 • Stanford Spezi • UU PDP No. 27/2022. Informasi ini untuk edukasi
                  klinis dan tidak menggantikan nasihat dokter berlisensi.
                </Text>
              </View>
            </ScrollView>
          }
        />
      </View>

      {/* Settings / API Key Modal */}
      <Modal
        visible={settingsModalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setSettingsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalContent,
              { backgroundColor: isDark ? '#1C1C1E' : '#FFFFFF' },
            ]}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                Konfigurasi AI Provider
              </Text>
              <TouchableOpacity onPress={() => setSettingsModalVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#8E8E93" />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalDesc}>
              Pilih model LLM yang ingin digunakan untuk analisis medis dan asisten klinis:
            </Text>

            {/* Provider List Option */}
            <TouchableOpacity
              style={[
                styles.modalOption,
                activeProviderType === 'google' && styles.modalOptionActive,
              ]}
              onPress={() => {
                setActiveProviderType('google');
                setSettingsModalVisible(false);
              }}
            >
              <Ionicons name="logo-google" size={22} color="#007AFF" />
              <View style={styles.modalOptionText}>
                <Text style={[styles.modalOptionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  Google Gemini 2.5 Flash
                </Text>
                <Text style={styles.modalOptionSub}>
                  Direkomendasikan • Terintegrasi bawaan (Aktif)
                </Text>
              </View>
              {activeProviderType === 'google' && (
                <Ionicons name="checkmark-circle" size={22} color="#007AFF" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalOption,
                activeProviderType === 'openai' && styles.modalOptionActive,
              ]}
              onPress={() => {
                if (!customOpenAIKey && !ENV_OPENAI_KEY) {
                  Alert.prompt
                    ? Alert.prompt(
                        'OpenAI API Key',
                        'Masukkan sk-... API Key Anda:',
                        (text) => {
                          if (text) {
                            setCustomOpenAIKey(text);
                            setActiveProviderType('openai');
                            setSettingsModalVisible(false);
                          }
                        }
                      )
                    : (() => {
                        setActiveProviderType('openai');
                        setSettingsModalVisible(false);
                      })();
                } else {
                  setActiveProviderType('openai');
                  setSettingsModalVisible(false);
                }
              }}
            >
              <Ionicons name="hardware-chip-outline" size={22} color="#34C759" />
              <View style={styles.modalOptionText}>
                <Text style={[styles.modalOptionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  OpenAI GPT-4o mini
                </Text>
                <Text style={styles.modalOptionSub}>
                  {customOpenAIKey || ENV_OPENAI_KEY
                    ? 'Kunci API Tersimpan'
                    : 'Perlu EXPO_PUBLIC_OPENAI_API_KEY'}
                </Text>
              </View>
              {activeProviderType === 'openai' && (
                <Ionicons name="checkmark-circle" size={22} color="#34C759" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.modalOption,
                activeProviderType === 'anthropic' && styles.modalOptionActive,
              ]}
              onPress={() => {
                setActiveProviderType('anthropic');
                setSettingsModalVisible(false);
              }}
            >
              <Ionicons name="flash-outline" size={22} color="#AF52DE" />
              <View style={styles.modalOptionText}>
                <Text style={[styles.modalOptionTitle, { color: isDark ? '#FFFFFF' : '#000000' }]}>
                  Anthropic Claude 3.5 Sonnet
                </Text>
                <Text style={styles.modalOptionSub}>
                  {customAnthropicKey || ENV_ANTHROPIC_KEY
                    ? 'Kunci API Tersimpan'
                    : 'Perlu EXPO_PUBLIC_ANTHROPIC_API_KEY'}
                </Text>
              </View>
              {activeProviderType === 'anthropic' && (
                <Ionicons name="checkmark-circle" size={22} color="#AF52DE" />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalCloseBtn}
              onPress={() => setSettingsModalVisible(false)}
            >
              <Text style={styles.modalCloseBtnText}>Tutup</Text>
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
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#8E8E9330',
  },
  headerLeft: {
    gap: 3,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  aiBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#007AFF',
    letterSpacing: 0.5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modelPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  modelPillText: {
    fontSize: 12,
    fontWeight: '700',
  },
  providerBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#8E8E9320',
  },
  providerTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    backgroundColor: '#8E8E9312',
  },
  providerTabActive: {
    backgroundColor: '#007AFF18',
  },
  providerTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
  },
  providerTabTextActive: {
    color: '#007AFF',
    fontWeight: '700',
  },
  chatWrapper: {
    flex: 1,
  },
  emptyContainer: {
    padding: 20,
    alignItems: 'center',
  },
  emptyHeroIconWrap: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: '#007AFF15',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
    marginTop: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.4,
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#8E8E93',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
    maxWidth: 320,
  },
  suggestionsWrap: {
    width: '100%',
    gap: 10,
    marginBottom: 24,
  },
  suggestionsHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#8E8E93',
    letterSpacing: 0.6,
    marginBottom: 4,
    marginLeft: 4,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 1,
  },
  suggestionIcon: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestionTextWrap: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  suggestionPrompt: {
    fontSize: 11,
    color: '#8E8E93',
    lineHeight: 14,
  },
  disclaimerBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    width: '100%',
  },
  disclaimerText: {
    fontSize: 10,
    color: '#8E8E93',
    flex: 1,
    lineHeight: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: '#00000060',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    gap: 14,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
  },
  modalDesc: {
    fontSize: 13,
    color: '#8E8E93',
    lineHeight: 18,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#8E8E9330',
  },
  modalOptionActive: {
    borderColor: '#007AFF',
    backgroundColor: '#007AFF10',
  },
  modalOptionText: {
    flex: 1,
  },
  modalOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
  },
  modalOptionSub: {
    fontSize: 11,
    color: '#8E8E93',
    marginTop: 2,
  },
  modalCloseBtn: {
    backgroundColor: '#007AFF',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  modalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});

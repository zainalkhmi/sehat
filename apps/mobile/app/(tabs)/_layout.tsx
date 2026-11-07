import { Tabs } from 'expo-router';
import React, { useState, createContext, useContext, useCallback } from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { AccountSheet } from '@/components/account/account-sheet';

// Context to share account sheet state across tab screens
interface AccountSheetContextValue {
  showAccountSheet: () => void;
}

const AccountSheetContext = createContext<AccountSheetContextValue | null>(null);

export function useAccountSheet() {
  const context = useContext(AccountSheetContext);
  if (!context) {
    throw new Error('useAccountSheet must be used within TabLayout');
  }
  return context;
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [accountSheetVisible, setAccountSheetVisible] = useState(false);

  const showAccountSheet = useCallback(() => {
    setAccountSheetVisible(true);
  }, []);

  const hideAccountSheet = useCallback(() => {
    setAccountSheetVisible(false);
  }, []);

  return (
    <AccountSheetContext.Provider value={{ showAccountSheet }}>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
          tabBarButton: HapticTab,
          tabBarStyle: {
            elevation: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.08,
            shadowRadius: 4,
          },
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <IconSymbol size={26} name="house.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="devices"
          options={{
            title: 'Devices',
            tabBarIcon: ({ color }) => <IconSymbol size={26} name="sensor" color={color} />,
          }}
        />
        <Tabs.Screen
          name="measurements"
          options={{
            title: 'Measurements',
            tabBarIcon: ({ color }) => <IconSymbol size={26} name="waveform.path.ecg" color={color} />,
          }}
        />
        <Tabs.Screen
          name="chat"
          options={{
            title: 'Chat',
            tabBarIcon: ({ color }) => <IconSymbol size={26} name="message.fill" color={color} />,
          }}
        />
        <Tabs.Screen
          name="health"
          options={{
            title: 'Health',
            tabBarIcon: ({ color }) => <IconSymbol size={26} name="heart.fill" color={color} />,
          }}
        />
        {/* Secondary screens hidden from bottom tab bar to prevent clutter, accessible via Home 6-Pack Menu */}
        <Tabs.Screen
          name="schedule"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            href: null,
          }}
        />
        <Tabs.Screen
          name="contacts"
          options={{
            href: null,
          }}
        />
      </Tabs>

      <AccountSheet
        visible={accountSheetVisible}
        onClose={hideAccountSheet}
      />
    </AccountSheetContext.Provider>
  );
}

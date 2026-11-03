import {
  BricolageGrotesque_700Bold,
  BricolageGrotesque_800ExtraBold,
} from '@expo-google-fonts/bricolage-grotesque';
import {
  SplineSans_400Regular,
  SplineSans_500Medium,
  SplineSans_600SemiBold,
  useFonts,
} from '@expo-google-fonts/spline-sans';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { Colors, Fonts } from '@/constants/theme';
import { AppStateProvider, useApp } from '@/state/app-state';

SplashScreen.preventAutoHideAsync();

function Gate() {
  const { status } = useApp();
  if (status === 'loading') {
    // Initial loading state while saved data is read from storage.
    return (
      <View style={styles.loading} accessibilityLabel="Kitchen Manager is loading">
        <Text style={styles.loadingTitle}>Kitchen{'\n'}Manager</Text>
      </View>
    );
  }
  return (
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: Colors.surfaceApp } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="events" />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    SplineSans_400Regular,
    SplineSans_500Medium,
    SplineSans_600SemiBold,
  });
  const fontsReady = fontsLoaded || fontError !== null;

  useEffect(() => {
    if (fontsReady) SplashScreen.hideAsync();
  }, [fontsReady]);

  // If fonts fail to load the app still runs with system fonts.
  if (!fontsReady) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <AppStateProvider>
        <Gate />
      </AppStateProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: Colors.surfaceApp },
  loadingTitle: { fontFamily: Fonts.displayHeavy, fontSize: 52, lineHeight: 54, textAlign: 'center', color: Colors.textPrimary },
});

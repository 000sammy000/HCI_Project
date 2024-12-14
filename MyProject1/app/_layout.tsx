import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';


import { useColorScheme } from '@/hooks/useColorScheme';
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Define your screens here */}
        <Stack.Screen name="index" options={{ title: 'Home' , headerBackVisible: false  /* Removes the back button*/}} />
        <Stack.Screen name="test" options={{ title: '設定' , headerBackVisible: false  }} />
        <Stack.Screen name="camera" options={{ title: '拍照' , headerBackVisible: false  }} />
        <Stack.Screen name="album" options={{ title: '相簿' , headerBackVisible: false  }} />
        <Stack.Screen name="time" options={{ title: '歷史紀錄' , headerBackVisible: false }} />
        <Stack.Screen name="helper" options={{ title: '飲食診療室' , headerBackVisible: false }} />
        <Stack.Screen name="+not-found" options={{ title: 'Not Found' }} />
      </Stack>
    </ThemeProvider>
  );
}

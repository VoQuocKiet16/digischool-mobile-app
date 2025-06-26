import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
    Baloo2: require('../assets/fonts/Baloo2-VariableFont_wght.ttf'),
  });
  const router = useRouter();

  useEffect(() => {
    AsyncStorage.getItem('token').then(token => {
      if (token) {
        router.replace('/');
      } else {
        router.replace('/auth/login');
      }
    });
  }, []);

  if (!loaded) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#25345D" />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

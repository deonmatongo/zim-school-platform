import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import { AuthProvider, loadStoredUser, useAuth } from '@/lib/auth'
import { useRouter, useSegments } from 'expo-router'

function NavigationGuard() {
  const { user } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)'
    if (!user && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (user && inAuthGroup) {
      router.replace('/(app)')
    }
  }, [user, segments])

  return null
}

function RootLayout() {
  return (
    <>
      <NavigationGuard />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
        <Stack.Screen name="child/[id]" options={{ presentation: 'card', headerShown: false }} />
      </Stack>
      <StatusBar style="light" />
    </>
  )
}

export default function Layout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <RootLayout />
      </AuthProvider>
    </GestureHandlerRootView>
  )
}

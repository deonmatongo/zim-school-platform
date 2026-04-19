import { useState } from 'react'
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
} from 'react-native'
import { LinearGradient } from 'expo-linear-gradient'
import { Ionicons } from '@expo/vector-icons'
import { useAuth } from '@/lib/auth'
import { Colors } from '@/lib/colors'

export default function LoginScreen() {
  const { signIn, isLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin() {
    if (!email.trim() || !password) { setError('Please enter your email and password.'); return }
    setError(null)
    const { error: err } = await signIn(email, password)
    if (err) setError(err)
  }

  function fillDemo() {
    setEmail('parent@zimschools.dev')
    setPassword('demo1234')
    setError(null)
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <LinearGradient colors={['#1a3a52', '#1a5276', '#2471a3']} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={styles.logoCircle}>
              <Ionicons name="school" size={32} color="#fff" />
            </View>
            <Text style={styles.appName}>Zimbabwe Schools</Text>
            <Text style={styles.appSub}>Parent Portal</Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Welcome back</Text>
            <Text style={styles.cardSub}>Sign in to your account</Text>

            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="warning-outline" size={16} color="#dc2626" style={{ marginTop: 1 }} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Email */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Email address</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="mail-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="you@school.ac.zw"
                  placeholderTextColor={Colors.textMuted}
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldWrap}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.inputWrap}>
                <Ionicons name="lock-closed-outline" size={18} color={Colors.textMuted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  placeholder="••••••••"
                  placeholderTextColor={Colors.textMuted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPass}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPass(v => !v)} style={styles.eyeBtn}>
                  <Ionicons name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.textMuted} />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.signInBtn} onPress={handleLogin} disabled={isLoading} activeOpacity={0.85}>
              {isLoading
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.signInBtnText}>Sign In</Text>
              }
            </TouchableOpacity>
          </View>

          {/* Demo card */}
          <TouchableOpacity style={styles.demoCard} onPress={fillDemo} activeOpacity={0.8}>
            <View style={styles.demoLeft}>
              <View style={styles.demoIcon}>
                <Ionicons name="people-outline" size={20} color={Colors.primary} />
              </View>
              <View>
                <Text style={styles.demoTitle}>Demo Parent Account</Text>
                <Text style={styles.demoEmail}>parent@zimschools.dev · demo1234</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.textMuted} />
          </TouchableOpacity>

          <Text style={styles.footer}>Having trouble? Contact your school administrator.</Text>
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 24, paddingBottom: 40 },
  logoWrap: { alignItems: 'center', marginBottom: 32 },
  logoCircle: {
    width: 72, height: 72, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)',
  },
  appName: { fontSize: 22, fontWeight: '800', color: '#fff', letterSpacing: -0.3 },
  appSub: { fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 24,
    shadowColor: '#000', shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2, shadowRadius: 24, elevation: 10,
  },
  cardTitle: { fontSize: 22, fontWeight: '800', color: Colors.text, marginBottom: 4 },
  cardSub: { fontSize: 14, color: Colors.textSecondary, marginBottom: 20 },
  errorBox: {
    flexDirection: 'row', gap: 8, backgroundColor: '#fef2f2',
    borderWidth: 1, borderColor: '#fecaca', borderRadius: 12,
    padding: 12, marginBottom: 16,
  },
  errorText: { fontSize: 13, color: '#dc2626', flex: 1 },
  fieldWrap: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: Colors.text, marginBottom: 6 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1.5, borderColor: Colors.border, borderRadius: 14,
    backgroundColor: '#f8fafc', paddingHorizontal: 14, height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: Colors.text },
  eyeBtn: { padding: 4 },
  signInBtn: {
    backgroundColor: Colors.primary, borderRadius: 14, height: 52,
    alignItems: 'center', justifyContent: 'center', marginTop: 4,
    shadowColor: Colors.primary, shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 8, elevation: 4,
  },
  signInBtnText: { fontSize: 16, fontWeight: '700', color: '#fff' },
  demoCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.12)', borderRadius: 18, padding: 16,
    marginTop: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  demoLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  demoIcon: {
    width: 42, height: 42, borderRadius: 12,
    backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  demoTitle: { fontSize: 14, fontWeight: '700', color: '#fff' },
  demoEmail: { fontSize: 11, color: 'rgba(255,255,255,0.65)', marginTop: 2, fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace' },
  footer: { fontSize: 12, color: 'rgba(255,255,255,0.4)', textAlign: 'center', marginTop: 24 },
})

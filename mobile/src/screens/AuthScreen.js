// ─── NexusLearn Mobile — Auth Screen ──────────────────────────────────────
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, ActivityIndicator, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography, gradients } from '../utils/theme';
import { AVATARS } from '../utils/constants';
import { login, signup } from '../utils/api';

export default function AuthScreen({ onAuthenticated }) {
  const [tab,             setTab]             = useState('login');
  const [username,        setUsername]        = useState('');
  const [password,        setPassword]        = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName,     setDisplayName]     = useState('');
  const [selectedAvatar,  setSelectedAvatar]  = useState('🎓');
  const [showPassword,    setShowPassword]    = useState(false);
  const [error,           setError]           = useState('');
  const [loading,         setLoading]         = useState(false);

  const handleLogin = async () => {
    setError('');
    if (!username.trim() || !password) { setError('Please fill in all fields.'); return; }
    setLoading(true);
    try {
      const user = await login(username.trim(), password);
      onAuthenticated(user);
    } catch (e) {
      setError(e.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    setError('');
    if (!username.trim() || !displayName.trim() || !password) { setError('Please fill in all fields.'); return; }
    if (username.trim().length < 3) { setError('Username must be at least 3 characters.'); return; }
    if (password.length < 6)        { setError('Password must be at least 6 characters.'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match.'); return; }
    setLoading(true);
    try {
      const user = await signup(username.trim(), password, displayName.trim(), selectedAvatar);
      onAuthenticated(user);
    } catch (e) {
      setError(e.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={['#0b0d17', '#111827']} style={styles.container}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

          {/* Logo */}
          <View style={styles.logoArea}>
            <LinearGradient colors={gradients.accent} style={styles.logoCircle}>
              <Text style={styles.logoEmoji}>🎓</Text>
            </LinearGradient>
            <Text style={styles.logoTitle}>NexusLearn</Text>
            <Text style={styles.logoSub}>Your AI-powered learning universe</Text>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabRow}>
            {['login','signup'].map(t => (
              <TouchableOpacity key={t} style={[styles.tabBtn, tab === t && styles.tabBtnActive]} onPress={() => { setTab(t); setError(''); }}>
                <Text style={[styles.tabLabel, tab === t && styles.tabLabelActive]}>
                  {t === 'login' ? '🔑 Sign In' : '✨ Create Account'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Error Banner */}
          {!!error && (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>⚠️  {error}</Text>
            </View>
          )}

          {/* Form */}
          <View style={styles.formCard}>
            {tab === 'signup' && (
              <>
                <Text style={styles.fieldLabel}>Display Name</Text>
                <TextInput style={styles.input} placeholder="Your full name" placeholderTextColor={colors.textDim}
                  value={displayName} onChangeText={setDisplayName} autoCapitalize="words" />

                <Text style={styles.fieldLabel}>Pick an Avatar</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
                  {AVATARS.map(a => (
                    <TouchableOpacity key={a} onPress={() => setSelectedAvatar(a)}
                      style={[styles.avatarChip, selectedAvatar === a && styles.avatarChipActive]}>
                      <Text style={styles.avatarEmoji}>{a}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </>
            )}

            <Text style={styles.fieldLabel}>Username</Text>
            <TextInput style={styles.input} placeholder="username" placeholderTextColor={colors.textDim}
              value={username} onChangeText={setUsername} autoCapitalize="none" autoCorrect={false} />

            <Text style={styles.fieldLabel}>Password</Text>
            <View style={styles.passwordRow}>
              <TextInput style={[styles.input, { flex: 1, marginBottom: 0 }]} placeholder="••••••••" placeholderTextColor={colors.textDim}
                value={password} onChangeText={setPassword} secureTextEntry={!showPassword} />
              <TouchableOpacity style={styles.eyeBtn} onPress={() => setShowPassword(v => !v)}>
                <Text style={{ fontSize: 18 }}>{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>

            {tab === 'signup' && (
              <>
                <Text style={[styles.fieldLabel, { marginTop: spacing.md }]}>Confirm Password</Text>
                <TextInput style={styles.input} placeholder="••••••••" placeholderTextColor={colors.textDim}
                  value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
              </>
            )}

            <TouchableOpacity style={styles.submitBtn} onPress={tab === 'login' ? handleLogin : handleSignup} disabled={loading}>
              <LinearGradient colors={gradients.accent} style={styles.submitGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                {loading ? <ActivityIndicator color="#fff" /> : (
                  <Text style={styles.submitText}>{tab === 'login' ? 'Sign In to Academy' : 'Create Account'}</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:  { flex: 1 },
  scroll:     { padding: spacing.lg, paddingTop: spacing.xxl },
  logoArea:   { alignItems: 'center', marginBottom: spacing.xl },
  logoCircle: { width: 80, height: 80, borderRadius: 24, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  logoEmoji:  { fontSize: 36 },
  logoTitle:  { ...typography.displayLg, fontSize: 32, marginBottom: 4 },
  logoSub:    { ...typography.bodyMd, textAlign: 'center' },

  tabRow:         { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: radius.full, padding: 4, marginBottom: spacing.lg, borderWidth: 1, borderColor: colors.border },
  tabBtn:         { flex: 1, paddingVertical: 10, borderRadius: radius.full, alignItems: 'center' },
  tabBtnActive:   { backgroundColor: colors.accent },
  tabLabel:       { ...typography.bodyMd, fontWeight: '600', color: colors.textMuted },
  tabLabelActive: { color: '#fff', fontWeight: '700' },

  errorBanner: { backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md },
  errorText:   { color: '#fca5a5', fontSize: 13, fontWeight: '500' },

  formCard:    { backgroundColor: colors.bgCard, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border, padding: spacing.lg },
  fieldLabel:  { ...typography.label, marginBottom: 6, marginTop: spacing.md },
  input: {
    backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: colors.border,
    borderRadius: radius.md, paddingHorizontal: spacing.md, paddingVertical: 13,
    color: colors.textPrimary, fontSize: 15, marginBottom: spacing.sm,
  },
  passwordRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: spacing.sm },
  eyeBtn:         { padding: 12, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: radius.md, borderWidth: 1, borderColor: colors.border },
  avatarChip:     { width: 48, height: 48, borderRadius: radius.md, alignItems: 'center', justifyContent: 'center', marginRight: 8, backgroundColor: 'rgba(255,255,255,0.04)', borderWidth: 1, borderColor: colors.border },
  avatarChipActive:{ borderColor: colors.accent, backgroundColor: 'rgba(99,102,241,0.15)' },
  avatarEmoji:    { fontSize: 24 },

  submitBtn:      { marginTop: spacing.lg, borderRadius: radius.md, overflow: 'hidden' },
  submitGradient: { paddingVertical: 15, alignItems: 'center', justifyContent: 'center' },
  submitText:     { color: '#fff', fontSize: 16, fontWeight: '800', letterSpacing: 0.3 },
});

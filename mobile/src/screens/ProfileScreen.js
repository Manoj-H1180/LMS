// ─── NexusLearn Mobile — Profile Screen ───────────────────────────────────
import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography, cardStyle, gradients } from '../utils/theme';
import { calculateLevel, ACHIEVEMENTS } from '../utils/constants';
import { saveUser } from '../utils/api';

export default function ProfileScreen({ user, onUpdateUser, onLogout }) {
  const levelInfo = calculateLevel(user.xp);

  const handleToggleSound = async () => {
    const updated = { ...user, soundEnabled: !user.soundEnabled };
    onUpdateUser(updated);
    await saveUser({ ...updated, username: user.username });
  };

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: onLogout },
    ]);
  };

  const recentBadges = ACHIEVEMENTS.filter(b => user.unlockedAchievements?.includes(b.id)).slice(0, 5);

  const statRows = [
    { label: 'Experience Points', val: `${user.xp} XP`,     icon: '⭐' },
    { label: 'Coins Earned',      val: `${user.coins} PTS`,  icon: '🪙' },
    { label: 'Day Streak',        val: `${user.streak} days`, icon: '🔥' },
    { label: 'Lessons Completed', val: user.completedLessons?.length || 0, icon: '📖' },
    { label: 'Badges Unlocked',   val: user.unlockedAchievements?.length || 0, icon: '🏆' },
  ];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Hero */}
        <LinearGradient colors={['#151c2e', '#0b0d17']} style={styles.hero}>
          <View style={styles.avatarRing}>
            <Text style={styles.avatarEmoji}>{user.avatar || '🎓'}</Text>
          </View>
          <Text style={styles.userName}>{user.name || user.username}</Text>
          <Text style={styles.userHandle}>@{user.username}</Text>
          <View style={styles.titleBadge}>
            <Text style={styles.titleText}>{user.title || levelInfo.title}</Text>
          </View>

          {/* Level bar */}
          <View style={styles.levelCard}>
            <View style={styles.levelRow}>
              <Text style={styles.levelLabel}>Level {levelInfo.level} — {levelInfo.title}</Text>
              <Text style={styles.levelXP}>{user.xp} XP</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${levelInfo.progress}%` }]} />
            </View>
            <Text style={styles.xpNeeded}>{levelInfo.neededXP} XP to Level {levelInfo.level + 1}</Text>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          {/* Stats */}
          <Text style={styles.sectionTitle}>📊 Stats Overview</Text>
          <View style={[cardStyle, styles.statsCard]}>
            {statRows.map((s, i) => (
              <View key={i} style={[styles.statRow, i < statRows.length - 1 && styles.statRowBorder]}>
                <Text style={styles.statIcon}>{s.icon}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
                <Text style={styles.statVal}>{s.val}</Text>
              </View>
            ))}
          </View>

          {/* Recent Badges */}
          {recentBadges.length > 0 && (
            <>
              <Text style={styles.sectionTitle}>🏅 Recent Achievements</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.badgesRow}>
                {recentBadges.map(badge => (
                  <View key={badge.id} style={styles.badgeChip}>
                    <Text style={styles.badgeEmoji}>🏆</Text>
                    <Text style={styles.badgeChipName} numberOfLines={1}>{badge.title}</Text>
                  </View>
                ))}
              </ScrollView>
            </>
          )}

          {/* Active Theme */}
          <Text style={styles.sectionTitle}>🎨 Active Theme</Text>
          <View style={[cardStyle, { padding: spacing.md, flexDirection: 'row', alignItems: 'center', gap: spacing.md }]}>
            <Text style={{ fontSize: 28 }}>🎨</Text>
            <View>
              <Text style={styles.statVal}>{user.activeTheme || 'cyberpunk'}</Text>
              <Text style={typography.bodyMd}>Current UI theme</Text>
            </View>
          </View>

          {/* Settings */}
          <Text style={styles.sectionTitle}>⚙️ Settings</Text>
          <View style={cardStyle}>
            <TouchableOpacity onPress={handleToggleSound} style={styles.settingRow}>
              <Text style={styles.settingIcon}>{user.soundEnabled !== false ? '🔊' : '🔇'}</Text>
              <Text style={styles.settingLabel}>Sound Effects</Text>
              <View style={[styles.toggle, user.soundEnabled !== false && styles.toggleOn]}>
                <View style={[styles.toggleKnob, user.soundEnabled !== false && styles.toggleKnobOn]} />
              </View>
            </TouchableOpacity>
          </View>

          {/* Sign Out */}
          <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
            <Text style={styles.logoutText}>🚪 Sign Out</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  hero:       { paddingTop: 24, paddingBottom: spacing.xl, paddingHorizontal: spacing.lg, alignItems: 'center', gap: spacing.sm },
  avatarRing: { width: 90, height: 90, borderRadius: 30, backgroundColor: 'rgba(99,102,241,0.15)', borderWidth: 2, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.sm },
  avatarEmoji:{ fontSize: 44 },
  userName:   { ...typography.displayMd },
  userHandle: { ...typography.bodyMd, marginTop: -4 },
  titleBadge: { paddingHorizontal: 16, paddingVertical: 5, borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(99,102,241,0.5)', backgroundColor: 'rgba(99,102,241,0.12)' },
  titleText:  { fontSize: 12, fontWeight: '700', color: colors.accent },

  levelCard:    { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, width: '100%' },
  levelRow:     { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  levelLabel:   { fontSize: 13, fontWeight: '700', color: colors.textPrimary },
  levelXP:      { fontSize: 13, fontWeight: '800', color: colors.goldLight },
  progressBg:   { height: 6, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.full, overflow: 'hidden', marginBottom: 4 },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: radius.full },
  xpNeeded:     { ...typography.caption },

  body:        { padding: spacing.lg, gap: spacing.md },
  sectionTitle:{ ...typography.displaySm, fontSize: 15, marginTop: spacing.sm },
  statsCard:   { paddingVertical: spacing.sm },
  statRow:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 12, gap: spacing.md },
  statRowBorder:{ borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' },
  statIcon:    { fontSize: 18, width: 26 },
  statLabel:   { flex: 1, fontSize: 14, color: colors.textMuted },
  statVal:     { fontSize: 14, fontWeight: '700', color: colors.textPrimary },

  badgesRow:   { paddingBottom: spacing.sm },
  badgeChip:   { alignItems: 'center', marginRight: spacing.md, backgroundColor: colors.bgCard, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md, minWidth: 80 },
  badgeEmoji:  { fontSize: 28, marginBottom: 4 },
  badgeChipName:{ fontSize: 11, color: colors.textMuted, fontWeight: '600', textAlign: 'center' },

  settingRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md, paddingVertical: 14, gap: spacing.md },
  settingIcon:  { fontSize: 20 },
  settingLabel: { flex: 1, fontSize: 14, color: colors.textPrimary, fontWeight: '500' },
  toggle:       { width: 46, height: 26, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.1)', justifyContent: 'center', paddingHorizontal: 3 },
  toggleOn:     { backgroundColor: colors.accent },
  toggleKnob:   { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  toggleKnobOn: { alignSelf: 'flex-end' },

  logoutBtn:    { backgroundColor: 'rgba(239,68,68,0.12)', borderWidth: 1, borderColor: 'rgba(239,68,68,0.3)', borderRadius: radius.md, padding: spacing.lg, alignItems: 'center', marginTop: spacing.sm },
  logoutText:   { fontSize: 15, fontWeight: '700', color: '#f87171' },
});

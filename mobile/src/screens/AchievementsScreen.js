// ─── NexusLearn Mobile — Achievements Screen ──────────────────────────────
import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography, cardStyle } from '../utils/theme';
import { ACHIEVEMENTS, TIER_COLORS } from '../utils/constants';

const CATEGORIES = ['All', 'Learning', 'Quizzes', 'Streaks', 'Creation', 'Milestones'];

const BADGE_ICONS = {
  trophy: '🏆', brain: '🧠', 'graduation-cap': '🎓', award: '🏅',
  flame: '🔥', 'folder-sync': '📂', rocket: '🚀', sparkles: '✨',
};

export default function AchievementsScreen({ user }) {
  const [filter, setFilter] = useState('All');

  const filtered = filter === 'All' ? ACHIEVEMENTS : ACHIEVEMENTS.filter(b => b.category === filter);
  const unlockedCount   = user.unlockedAchievements?.length || 0;
  const totalCount      = ACHIEVEMENTS.length;
  const completionPct   = Math.round((unlockedCount / totalCount) * 100);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <LinearGradient colors={['#151c2e', '#0b0d17']} style={styles.header}>
          <View style={styles.headerBadge}>
            <Text style={styles.headerBadgeText}>🏆 ACADEMY QUEST BOARD</Text>
          </View>
          <Text style={styles.headerTitle}>Achievements & Badges</Text>
          <Text style={styles.headerSub}>Complete milestones, maintain streaks, and score on quizzes to unlock prestigious accolades.</Text>

          {/* Progress circle */}
          <View style={styles.progressCard}>
            <Text style={styles.progressFrac}>{unlockedCount} / {totalCount}</Text>
            <Text style={styles.progressLabel}>Badges Mastered ({completionPct}%)</Text>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${completionPct}%` }]} />
            </View>
          </View>
        </LinearGradient>

        {/* Category Filter */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterBar}>
          {CATEGORIES.map(cat => (
            <TouchableOpacity key={cat} onPress={() => setFilter(cat)}
              style={[styles.filterPill, filter === cat && styles.filterPillActive]}>
              <Text style={[styles.filterText, filter === cat && styles.filterTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Badges Grid */}
        <View style={styles.grid}>
          {filtered.map(badge => {
            const isUnlocked  = user.unlockedAchievements?.includes(badge.id);
            const tierColor   = TIER_COLORS[badge.tier] || '#cd7f32';
            const icon        = BADGE_ICONS[badge.icon] || '🏆';

            return (
              <View key={badge.id} style={[styles.badgeCard,
                isUnlocked ? { borderColor: tierColor + '55', shadowColor: tierColor, shadowOpacity: 0.3, shadowRadius: 8 } : {}]}>
                {/* Icon */}
                <View style={[styles.iconBox, {
                  backgroundColor: isUnlocked ? tierColor + '22' : 'rgba(255,255,255,0.04)',
                  borderColor:     isUnlocked ? tierColor : 'rgba(255,255,255,0.1)',
                }]}>
                  <Text style={{ fontSize: 24 }}>{isUnlocked ? icon : '🔒'}</Text>
                </View>

                {/* Details */}
                <View style={{ flex: 1 }}>
                  <View style={styles.badgeTop}>
                    <Text style={[styles.badgeName, !isUnlocked && { color: colors.textMuted }]} numberOfLines={1}>
                      {badge.title}
                    </Text>
                    <Text style={[styles.tierLabel, { color: tierColor }]}>{badge.tier}</Text>
                  </View>
                  <Text style={styles.badgeDesc} numberOfLines={2}>{badge.description}</Text>
                  <View style={styles.badgeBottom}>
                    <Text style={styles.xpReward}>✨ +{badge.xpReward} XP</Text>
                    {isUnlocked
                      ? <Text style={styles.unlockedTag}>✅ Unlocked</Text>
                      : <Text style={styles.lockedTag}>🔒 Locked</Text>
                    }
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  header:         { paddingTop: 16, paddingBottom: spacing.xl, paddingHorizontal: spacing.lg, alignItems: 'center' },
  headerBadge:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(245,158,11,.4)', backgroundColor: 'rgba(245,158,11,.1)', marginBottom: spacing.sm },
  headerBadgeText:{ fontSize: 11, fontWeight: '700', color: colors.goldLight },
  headerTitle:    { ...typography.displayMd, textAlign: 'center', marginBottom: 4 },
  headerSub:      { ...typography.bodyMd, textAlign: 'center', marginBottom: spacing.lg, paddingHorizontal: spacing.md },

  progressCard:   { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.lg, alignItems: 'center', width: '100%' },
  progressFrac:   { fontSize: 28, fontWeight: '900', color: colors.goldLight },
  progressLabel:  { ...typography.caption, color: colors.textMuted, marginBottom: 8, marginTop: 2 },
  progressBg:     { height: 6, width: '100%', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.full, overflow: 'hidden' },
  progressFill:   { height: '100%', backgroundColor: colors.goldLight, borderRadius: radius.full },

  filterBar:      { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm },
  filterPill:     { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full, marginRight: 8, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border },
  filterPillActive:{ backgroundColor: colors.accent, borderColor: colors.accent },
  filterText:     { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  filterTextActive:{ color: '#fff' },

  grid:        { padding: spacing.lg, gap: spacing.md },
  badgeCard:   { ...cardStyle, flexDirection: 'row', gap: spacing.md, padding: spacing.md, alignItems: 'flex-start' },
  iconBox:     { width: 52, height: 52, borderRadius: radius.md, borderWidth: 2, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  badgeTop:    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  badgeName:   { fontSize: 14, fontWeight: '700', color: colors.textPrimary, flex: 1 },
  tierLabel:   { fontSize: 10, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  badgeDesc:   { fontSize: 12, color: colors.textMuted, lineHeight: 17, marginBottom: 6 },
  badgeBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  xpReward:    { fontSize: 12, fontWeight: '700', color: colors.goldLight },
  unlockedTag: { fontSize: 11, fontWeight: '700', color: colors.green },
  lockedTag:   { fontSize: 11, fontWeight: '600', color: colors.textDim },
});

// ─── NexusLearn Mobile — Leaderboard Screen ───────────────────────────────
import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography, cardStyle } from '../utils/theme';
import { fetchLeaderboard } from '../utils/api';
import { calculateLevel } from '../utils/constants';

const MEDAL = ['🥇', '🥈', '🥉'];

function LeaderboardRow({ entry, index, isMe }) {
  const levelInfo = calculateLevel(entry.xp || 0);
  return (
    <View style={[styles.row, isMe && styles.rowMe]}>
      <View style={styles.rankCol}>
        {index < 3 ? (
          <Text style={styles.medal}>{MEDAL[index]}</Text>
        ) : (
          <Text style={styles.rankNum}>#{index + 1}</Text>
        )}
      </View>
      <View style={styles.avatarBubble}>
        <Text style={styles.avatarText}>{entry.avatar || '🎓'}</Text>
      </View>
      <View style={styles.userInfo}>
        <Text style={[styles.userName, isMe && { color: colors.accent }]}>
          {entry.name || entry.username}{isMe ? ' (You)' : ''}
        </Text>
        <Text style={styles.userLevel}>Lv.{levelInfo.level} {levelInfo.title}</Text>
      </View>
      <View style={styles.statsCol}>
        <Text style={styles.xpVal}>{(entry.xp || 0).toLocaleString()}</Text>
        <Text style={styles.xpLabel}>XP</Text>
      </View>
      <View style={styles.statsCol}>
        <Text style={styles.streakVal}>🔥 {entry.streak || 0}</Text>
        <Text style={styles.xpLabel}>streak</Text>
      </View>
    </View>
  );
}

export default function LeaderboardScreen({ user }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [tab,         setTab]         = useState('xp');

  const load = async (silent = false) => {
    if (!silent) setLoading(true);
    const data = await fetchLeaderboard();
    setLeaderboard(data);
    setLoading(false);
    setRefreshing(false);
  };

  useEffect(() => { load(); }, []);

  const sorted = [...leaderboard].sort((a, b) =>
    tab === 'xp'     ? (b.xp || 0) - (a.xp || 0)
    : tab === 'streak' ? (b.streak || 0) - (a.streak || 0)
    : 0
  );

  const myRank = sorted.findIndex(e => e.username === user.username) + 1;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={['#151c2e', '#0b0d17']} style={styles.header}>
        <View style={styles.headerBadge}>
          <Text style={styles.headerBadgeText}>🏆 LIVE RANKINGS</Text>
        </View>
        <Text style={styles.headerTitle}>Global Leaderboard</Text>
        <Text style={styles.headerSub}>Compete with learners across the academy</Text>

        {myRank > 0 && (
          <View style={styles.myRankCard}>
            <Text style={styles.myRankLabel}>YOUR RANK</Text>
            <Text style={styles.myRankVal}>#{myRank}</Text>
          </View>
        )}
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabs}>
        {[['xp','⭐ XP'],['streak','🔥 Streak']].map(([t, label]) => (
          <TouchableOpacity key={t} onPress={() => setTab(t)} style={[styles.tab, tab === t && styles.tabActive]}>
            <Text style={[styles.tabText, tab === t && styles.tabTextActive]}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator color={colors.accent} size="large" />
          <Text style={[typography.bodyMd, { marginTop: spacing.md }]}>Loading rankings…</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(true); }} tintColor={colors.accent} />}>
          <View style={styles.list}>
            {sorted.length === 0 ? (
              <View style={[cardStyle, { padding: spacing.xl, alignItems: 'center', margin: spacing.lg }]}>
                <Text style={{ fontSize: 36, marginBottom: spacing.md }}>📊</Text>
                <Text style={typography.bodyMd}>No data yet. Complete lessons to appear here!</Text>
              </View>
            ) : sorted.map((entry, index) => (
              <LeaderboardRow key={entry.username || index} entry={entry} index={index}
                isMe={entry.username === user.username} />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },
  header:    { paddingTop: 16, paddingBottom: spacing.lg, paddingHorizontal: spacing.lg, alignItems: 'center' },
  headerBadge:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 4, borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(245,158,11,.4)', backgroundColor: 'rgba(245,158,11,.1)', marginBottom: spacing.sm },
  headerBadgeText:{ fontSize: 11, fontWeight: '700', color: colors.goldLight },
  headerTitle:    { ...typography.displayMd, textAlign: 'center', marginBottom: 4 },
  headerSub:      { ...typography.bodyMd, textAlign: 'center', marginBottom: spacing.md },
  myRankCard:     { backgroundColor: 'rgba(99,102,241,0.15)', borderRadius: radius.md, paddingHorizontal: spacing.xl, paddingVertical: spacing.md, borderWidth: 1, borderColor: colors.accent, alignItems: 'center' },
  myRankLabel:    { ...typography.label, color: colors.accent },
  myRankVal:      { fontSize: 28, fontWeight: '900', color: colors.accent, lineHeight: 36 },

  tabs:         { flexDirection: 'row', backgroundColor: colors.bgCard, borderBottomWidth: 1, borderBottomColor: colors.border },
  tab:          { flex: 1, paddingVertical: 14, alignItems: 'center' },
  tabActive:    { borderBottomWidth: 2, borderBottomColor: colors.accent },
  tabText:      { fontSize: 14, fontWeight: '600', color: colors.textMuted },
  tabTextActive:{ color: colors.accent },

  loadingBox:  { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 80 },
  list:        { padding: spacing.lg, gap: spacing.sm },

  row:          { ...cardStyle, flexDirection: 'row', alignItems: 'center', padding: spacing.md, gap: spacing.sm },
  rowMe:        { borderColor: colors.accent, backgroundColor: 'rgba(99,102,241,0.08)' },
  rankCol:      { width: 36, alignItems: 'center' },
  medal:        { fontSize: 22 },
  rankNum:      { fontSize: 14, fontWeight: '800', color: colors.textDim },
  avatarBubble: { width: 40, height: 40, borderRadius: 12, backgroundColor: 'rgba(99,102,241,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  avatarText:   { fontSize: 22 },
  userInfo:     { flex: 1 },
  userName:     { fontSize: 14, fontWeight: '700', color: colors.textPrimary },
  userLevel:    { fontSize: 11, color: colors.textDim, marginTop: 2 },
  statsCol:     { alignItems: 'center', minWidth: 50 },
  xpVal:        { fontSize: 14, fontWeight: '800', color: colors.goldLight },
  xpLabel:      { fontSize: 10, color: colors.textDim },
  streakVal:    { fontSize: 13, fontWeight: '700', color: '#f87171' },
});

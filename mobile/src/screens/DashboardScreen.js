// ─── NexusLearn Mobile — Dashboard Screen ─────────────────────────────────
import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, RefreshControl, Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography, cardStyle, gradients } from '../utils/theme';
import { calculateLevel } from '../utils/constants';
import CourseCard from '../components/CourseCard';

const { width } = Dimensions.get('window');

export default function DashboardScreen({ navigation, user, courses, onSelectCourse, onDeleteCourse, onRefresh, refreshing }) {
  const handleSelectCourse = (course) => {
    navigation.navigate('CoursePlayer', { course });
  };
  const [searchQuery,       setSearchQuery]       = useState('');
  const [selectedCategory,  setSelectedCategory]  = useState('All');
  const [sortBy,            setSortBy]            = useState('recommended');

  const levelInfo = calculateLevel(user.xp);

  const allCategories = ['All', ...Array.from(new Set(courses.map(c => c.category).filter(Boolean)))];

  const inProgressCourses = courses.filter(course => {
    const total     = course.modules?.reduce((a, m) => a + (m.lessons?.length || 0), 0) || 0;
    const completed = course.modules?.reduce((a, m) =>
      a + (m.lessons?.filter(l => user.completedLessons?.includes(l.id))?.length || 0), 0) || 0;
    return completed > 0 && completed < total;
  });

  const filteredCourses = courses.filter(course => {
    const matchCat    = selectedCategory === 'All' || course.category === selectedCategory;
    const matchSearch = !searchQuery ||
      course.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (course.category || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  }).sort((a, b) => {
    if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '');
    return Number(b.updatedAt || b.createdAt || 0) - Number(a.updatedAt || a.createdAt || 0);
  });

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.accent} />}>

      {/* ── Hero Banner ── */}
      <LinearGradient colors={['#151c2e', '#0b0d17']} style={styles.heroBanner}>
        {/* Glow orb */}
        <View style={styles.glowOrb} pointerEvents="none" />

        {/* Welcome */}
        <View style={styles.heroTop}>
          <View>
            <View style={styles.badgeRow}>
              <View style={styles.badgePill}>
                <Text style={styles.badgePillText}>✨ {levelInfo.title}</Text>
              </View>
              <View style={[styles.badgePill, { borderColor: 'rgba(239,68,68,.35)', backgroundColor: 'rgba(239,68,68,.1)' }]}>
                <Text style={[styles.badgePillText, { color: '#f87171' }]}>🔥 {user.streak} DAY STREAK</Text>
              </View>
            </View>
            <Text style={styles.heroTitle}>
              Welcome back,{'\n'}
              <Text style={{ color: colors.accent }}>{user.name || user.username}</Text>
            </Text>
            <Text style={styles.heroSub}>Ready to expand your neural pathways?</Text>
          </View>
          <View style={styles.avatarBubble}>
            <Text style={styles.avatarText}>{user.avatar || '🎓'}</Text>
          </View>
        </View>

        {/* Level Progress */}
        <View style={styles.levelCard}>
          <View style={styles.levelCardHeader}>
            <View>
              <Text style={typography.label}>LEVEL PROGRESSION</Text>
              <Text style={styles.levelText}>Level {levelInfo.level} — {levelInfo.title}</Text>
            </View>
            <Text style={styles.xpText}>{user.xp} XP</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${levelInfo.progress}%` }]} />
          </View>
          <Text style={styles.xpNeeded}>{levelInfo.neededXP} XP to Level {levelInfo.level + 1}</Text>

          {/* Mini Stats */}
          <View style={styles.miniStats}>
            <View style={styles.miniStat}>
              <Text style={styles.miniStatVal}>{user.completedLessons?.length || 0}</Text>
              <Text style={typography.caption}>Lessons</Text>
            </View>
            <View style={styles.miniStatDivider} />
            <View style={styles.miniStat}>
              <Text style={[styles.miniStatVal, { color: colors.goldLight }]}>{user.unlockedAchievements?.length || 0}</Text>
              <Text style={typography.caption}>Badges</Text>
            </View>
            <View style={styles.miniStatDivider} />
            <View style={styles.miniStat}>
              <Text style={[styles.miniStatVal, { color: colors.green }]}>{user.coins}</Text>
              <Text style={typography.caption}>Coins</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      <View style={styles.body}>

        {/* ── In Progress ── */}
        {inProgressCourses.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>▶  Jump Back In</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.hScroll}>
              {inProgressCourses.map(course => (
                <View key={course.id} style={{ width: width * 0.75, marginRight: spacing.md }}>
                  <CourseCard course={course} completedLessons={user.completedLessons} onSelectCourse={handleSelectCourse} onDeleteCourse={onDeleteCourse} compact />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Search ── */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput style={styles.searchInput} placeholder="Search courses…" placeholderTextColor={colors.textDim}
            value={searchQuery} onChangeText={setSearchQuery} />
          {!!searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery('')}><Text style={{ color: colors.textMuted, fontSize: 18 }}>✕</Text></TouchableOpacity>
          )}
        </View>

        {/* ── Category Pills ── */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryPills}>
          {allCategories.map(cat => (
            <TouchableOpacity key={cat} onPress={() => setSelectedCategory(cat)}
              style={[styles.catPill, selectedCategory === cat && styles.catPillActive]}>
              <Text style={[styles.catPillText, selectedCategory === cat && styles.catPillTextActive]}>{cat}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* ── All Courses ── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚  All Courses</Text>
          {filteredCourses.length === 0 ? (
            <View style={[cardStyle, { padding: spacing.xl, alignItems: 'center' }]}>
              <Text style={typography.bodyMd}>No courses found{searchQuery ? ` for "${searchQuery}"` : ''}.</Text>
            </View>
          ) : (
            filteredCourses.map(course => (
              <View key={course.id} style={{ marginBottom: spacing.md }}>
                <CourseCard course={course} completedLessons={user.completedLessons} onSelectCourse={handleSelectCourse} onDeleteCourse={onDeleteCourse} />
              </View>
            ))
          )}
        </View>

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg },

  heroBanner:   { paddingTop: spacing.xl, paddingHorizontal: spacing.lg, paddingBottom: spacing.lg, position: 'relative' },
  glowOrb:      { position: 'absolute', top: -40, right: -20, width: 250, height: 250, borderRadius: 125, backgroundColor: 'rgba(99,102,241,0.15)' },
  heroTop:      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: spacing.lg },
  badgeRow:     { flexDirection: 'row', gap: 8, marginBottom: 10, flexWrap: 'wrap' },
  badgePill:    { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full, borderWidth: 1, borderColor: 'rgba(245,158,11,.35)', backgroundColor: 'rgba(245,158,11,.1)' },
  badgePillText:{ fontSize: 11, fontWeight: '700', color: '#fbbf24' },
  heroTitle:    { ...typography.displayMd, lineHeight: 30, marginBottom: 6 },
  heroSub:      { ...typography.bodyMd, fontSize: 13 },
  avatarBubble: { width: 56, height: 56, borderRadius: 18, backgroundColor: 'rgba(99,102,241,0.15)', borderWidth: 1, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center' },
  avatarText:   { fontSize: 28 },

  levelCard:       { backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  levelCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  levelText:       { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginTop: 2 },
  xpText:          { fontSize: 16, fontWeight: '800', color: colors.goldLight },
  progressBg:      { height: 8, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.full, overflow: 'hidden', marginBottom: 4 },
  progressFill:    { height: '100%', borderRadius: radius.full, backgroundColor: colors.accent },
  xpNeeded:        { ...typography.caption, marginBottom: spacing.md },
  miniStats:       { flexDirection: 'row', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.06)', paddingTop: spacing.md },
  miniStat:        { flex: 1, alignItems: 'center' },
  miniStatDivider: { width: 1, backgroundColor: 'rgba(255,255,255,0.06)' },
  miniStatVal:     { fontSize: 20, fontWeight: '800', color: colors.accentBlue },

  body:            { padding: spacing.lg },
  section:         { marginBottom: spacing.xl },
  sectionTitle:    { ...typography.displaySm, fontSize: 17, marginBottom: spacing.md },
  hScroll:         { marginHorizontal: -spacing.lg, paddingLeft: spacing.lg },

  searchBox:   { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.md, marginBottom: spacing.md, gap: 8 },
  searchIcon:  { fontSize: 16 },
  searchInput: { flex: 1, paddingVertical: 12, color: colors.textPrimary, fontSize: 15 },

  categoryPills:       { marginBottom: spacing.md },
  catPill:             { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full, marginRight: 8, backgroundColor: colors.bgCard, borderWidth: 1, borderColor: colors.border },
  catPillActive:       { backgroundColor: colors.accent, borderColor: colors.accent },
  catPillText:         { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  catPillTextActive:   { color: '#fff' },
});

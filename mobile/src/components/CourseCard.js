// ─── NexusLearn Mobile — CourseCard Component ─────────────────────────────
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography, cardStyle } from '../utils/theme';

const CARD_GRADIENTS = [
  ['#6366f1','#a855f7'],
  ['#0369a1','#06b6d4'],
  ['#047857','#34d399'],
  ['#d97706','#f59e0b'],
  ['#be123c','#f43f5e'],
  ['#1d4ed8','#3b82f6'],
];

function pickGradient(course) {
  if (course.gradient) {
    const match = course.gradient.match(/#[0-9a-fA-F]{6}/g);
    if (match && match.length >= 2) return [match[0], match[1]];
  }
  const idx = (course.id || '').charCodeAt(0) % CARD_GRADIENTS.length;
  return CARD_GRADIENTS[idx] || CARD_GRADIENTS[0];
}

export default function CourseCard({ course, completedLessons = [], onSelectCourse, onDeleteCourse, compact }) {
  const totalLessons = course.modules?.reduce((a, m) => a + (m.lessons?.length || 0), 0) || 0;
  const completedInCourse = course.modules?.reduce((a, m) =>
    a + (m.lessons?.filter(l => completedLessons.includes(l.id))?.length || 0), 0) || 0;

  const progressPercent = totalLessons > 0 ? Math.round((completedInCourse / totalLessons) * 100) : 0;
  const isCompleted = progressPercent === 100;
  const hasStarted  = completedInCourse > 0;

  const gradient = pickGradient(course);

  return (
    <TouchableOpacity activeOpacity={0.85} onPress={() => onSelectCourse(course)} style={styles.card}>
      {/* Banner */}
      <LinearGradient colors={gradient} style={compact ? styles.bannerCompact : styles.banner}>
        <View style={styles.bannerTop}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{course.category || 'General'}</Text>
          </View>
          {course.isImported && (
            <View style={[styles.categoryBadge, { backgroundColor: 'rgba(16,185,129,0.35)', borderColor: 'rgba(52,211,153,0.3)' }]}>
              <Text style={[styles.categoryText, { color: '#6ee7b7' }]}>📁 Imported</Text>
            </View>
          )}
        </View>
        <View style={styles.bannerBottom}>
          <View style={styles.xpBadge}>
            <Text style={styles.xpBadgeText}>✨ +{course.totalXP || 500} XP</Text>
          </View>
          <View style={styles.ratingBadge}>
            <Text style={styles.ratingText}>⭐ {course.rating || 5.0}</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Body */}
      <View style={styles.body}>
        <Text style={styles.title} numberOfLines={2}>{course.title}</Text>
        {!compact && (
          <Text style={styles.desc} numberOfLines={2}>{course.shortDescription}</Text>
        )}

        <View style={styles.metaRow}>
          <Text style={styles.metaText}>📖 {totalLessons} lessons</Text>
          <Text style={styles.metaText}>⏱ {course.estimatedHours || '4 hrs'}</Text>
        </View>

        {/* Progress */}
        {hasStarted && (
          <View style={styles.progressArea}>
            <View style={styles.progressRow}>
              <Text style={[styles.progressLabel, isCompleted && { color: colors.green }]}>
                {isCompleted ? '✅ Course Completed!' : `${completedInCourse}/${totalLessons} done`}
              </Text>
              <Text style={[styles.progressPct, isCompleted && { color: colors.green }]}>{progressPercent}%</Text>
            </View>
            <View style={styles.progressBg}>
              <View style={[styles.progressFill, { width: `${progressPercent}%`, backgroundColor: isCompleted ? colors.green : colors.accent }]} />
            </View>
          </View>
        )}

        {/* CTA */}
        <TouchableOpacity onPress={() => onSelectCourse(course)} style={styles.cta} activeOpacity={0.8}>
          <LinearGradient colors={isCompleted ? [colors.green, '#059669'] : hasStarted ? gradients?.accent ?? [colors.accent, colors.accentAlt] : ['rgba(255,255,255,0.06)', 'rgba(255,255,255,0.06)']}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.ctaGradient}>
            <Text style={[styles.ctaText, !hasStarted && !isCompleted && { color: colors.textMuted }]}>
              {isCompleted ? '🏆 Review & Diploma' : hasStarted ? '▶ Resume Learning' : '▶ Start Course'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const gradients = { accent: [colors.accent, colors.accentAlt] };

const styles = StyleSheet.create({
  card:         { ...cardStyle, overflow: 'hidden' },
  banner:       { height: 120, padding: spacing.md, justifyContent: 'space-between' },
  bannerCompact:{ height: 90,  padding: spacing.sm, justifyContent: 'space-between' },
  bannerTop:    { flexDirection: 'row', gap: 6 },
  bannerBottom: { flexDirection: 'row', justifyContent: 'space-between' },
  categoryBadge:{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full, backgroundColor: 'rgba(0,0,0,0.45)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  categoryText: { fontSize: 11, fontWeight: '700', color: '#fff' },
  xpBadge:     { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: 'rgba(0,0,0,0.5)', borderWidth: 1, borderColor: 'rgba(245,158,11,0.4)' },
  xpBadgeText: { fontSize: 11, fontWeight: '800', color: '#fbbf24' },
  ratingBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.full, backgroundColor: 'rgba(0,0,0,0.4)' },
  ratingText:  { fontSize: 11, fontWeight: '700', color: '#fff' },

  body:         { padding: spacing.md, gap: 8 },
  title:        { fontSize: 15, fontWeight: '700', color: colors.textPrimary, lineHeight: 21 },
  desc:         { fontSize: 13, color: colors.textMuted, lineHeight: 19 },
  metaRow:      { flexDirection: 'row', gap: 14 },
  metaText:     { fontSize: 12, color: colors.textDim },

  progressArea: { gap: 4 },
  progressRow:  { flexDirection: 'row', justifyContent: 'space-between' },
  progressLabel:{ fontSize: 12, color: colors.textMuted, fontWeight: '600' },
  progressPct:  { fontSize: 12, fontWeight: '800', color: colors.accent },
  progressBg:   { height: 5, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.full, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: radius.full },

  cta:          { borderRadius: radius.md, overflow: 'hidden', marginTop: 4 },
  ctaGradient:  { paddingVertical: 10, alignItems: 'center', borderRadius: radius.md },
  ctaText:      { fontSize: 14, fontWeight: '700', color: '#fff' },
});

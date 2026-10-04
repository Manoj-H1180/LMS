// ─── NexusLearn Mobile — Course Player Screen ─────────────────────────────
import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, Dimensions, ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, spacing, radius, typography, cardStyle, gradients } from '../utils/theme';
import { saveUser, saveCourseProgress } from '../utils/api';

const { width } = Dimensions.get('window');
const API_BASE_URL_LOCAL = 'http://localhost:3000';

const QUIZ_XP   = 50;
const LESSON_XP = 30;

function LessonItem({ lesson, isActive, isCompleted, onSelect }) {
  return (
    <TouchableOpacity onPress={() => onSelect(lesson)}
      style={[styles.lessonItem, isActive && styles.lessonItemActive, isCompleted && styles.lessonItemDone]}>
      <View style={styles.lessonIcon}>
        {isCompleted
          ? <Text style={{ fontSize: 16 }}>✅</Text>
          : lesson.type === 'video'
            ? <Text style={{ fontSize: 16 }}>▶️</Text>
            : lesson.type === 'quiz'
              ? <Text style={{ fontSize: 16 }}>📝</Text>
              : <Text style={{ fontSize: 16 }}>📄</Text>
        }
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.lessonTitle, isActive && { color: colors.accent }]} numberOfLines={2}>{lesson.title}</Text>
        <Text style={styles.lessonMeta}>{lesson.type || 'text'} · {lesson.duration || '5 min'}</Text>
      </View>
    </TouchableOpacity>
  );
}

function QuizView({ questions, onComplete, lessonId }) {
  const [current,   setCurrent]   = useState(0);
  const [selected,  setSelected]  = useState(null);
  const [answered,  setAnswered]  = useState(false);
  const [score,     setScore]     = useState(0);
  const [finished,  setFinished]  = useState(false);

  const q = questions?.[current];
  if (!q) return null;

  const handleSelect = (idx) => {
    if (answered) return;
    setSelected(idx);
    setAnswered(true);
    if (idx === q.correctIndex) setScore(s => s + 1);
  };

  const handleNext = () => {
    if (current + 1 >= questions.length) {
      setFinished(true);
      const pct = Math.round(((score + (selected === q.correctIndex ? 1 : 0)) / questions.length) * 100);
      onComplete(pct);
    } else {
      setCurrent(c => c + 1);
      setSelected(null);
      setAnswered(false);
    }
  };

  if (finished) {
    const finalScore = Math.round((score / questions.length) * 100);
    return (
      <View style={styles.quizResult}>
        <Text style={{ fontSize: 52, marginBottom: spacing.md }}>{finalScore >= 80 ? '🏆' : finalScore >= 50 ? '👍' : '📚'}</Text>
        <Text style={styles.quizResultTitle}>{finalScore >= 80 ? 'Excellent!' : finalScore >= 50 ? 'Good Effort!' : 'Keep Practicing!'}</Text>
        <Text style={styles.quizResultScore}>{finalScore}% — {score}/{questions.length} correct</Text>
      </View>
    );
  }

  return (
    <View style={styles.quizContainer}>
      <View style={styles.quizProgress}>
        <Text style={typography.label}>QUESTION {current + 1} OF {questions.length}</Text>
        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${((current) / questions.length) * 100}%` }]} />
        </View>
      </View>

      <Text style={styles.questionText}>{q.question}</Text>

      {q.options?.map((opt, idx) => {
        let bgColor = 'rgba(255,255,255,0.04)';
        let borderColor = colors.border;
        if (answered) {
          if (idx === q.correctIndex) { bgColor = 'rgba(16,185,129,0.2)'; borderColor = colors.green; }
          else if (idx === selected)  { bgColor = 'rgba(239,68,68,0.15)'; borderColor = colors.accentRed; }
        } else if (idx === selected) {
          bgColor = 'rgba(99,102,241,0.2)'; borderColor = colors.accent;
        }
        return (
          <TouchableOpacity key={idx} onPress={() => handleSelect(idx)}
            style={[styles.optionBtn, { backgroundColor: bgColor, borderColor }]}>
            <View style={styles.optionCircle}>
              <Text style={styles.optionCircleText}>{String.fromCharCode(65 + idx)}</Text>
            </View>
            <Text style={styles.optionText}>{opt}</Text>
            {answered && idx === q.correctIndex && <Text style={{ fontSize: 16, marginLeft: 'auto' }}>✅</Text>}
            {answered && idx === selected && idx !== q.correctIndex && <Text style={{ fontSize: 16, marginLeft: 'auto' }}>❌</Text>}
          </TouchableOpacity>
        );
      })}

      {answered && q.explanation && (
        <View style={styles.explanationBox}>
          <Text style={styles.explanationTitle}>💡 Explanation</Text>
          <Text style={styles.explanationText}>{q.explanation}</Text>
        </View>
      )}

      {answered && (
        <TouchableOpacity onPress={handleNext} style={styles.nextBtn}>
          <LinearGradient colors={[colors.accent, colors.accentAlt]} style={styles.nextBtnGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
            <Text style={styles.nextBtnText}>{current + 1 >= questions.length ? 'Finish Quiz 🏁' : 'Next Question →'}</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </View>
  );
}

export default function CoursePlayerScreen({ route, navigation, user, onUpdateUser }) {
  const { course } = route.params;
  const [activeLesson, setActiveLesson] = useState(
    course.modules?.[0]?.lessons?.[0] || null
  );
  const [completedLessons, setCompletedLessons] = useState(user.completedLessons || []);
  const [expandedModule,   setExpandedModule]   = useState(course.modules?.[0]?.id || null);
  const [note,             setNote]             = useState('');
  const [showNotes,        setShowNotes]        = useState(false);
  const [activeView,       setActiveView]       = useState('content'); // 'content' | 'notes' | 'quiz'

  const allLessons = course.modules?.flatMap(m => m.lessons || []) || [];
  const completedInCourse = allLessons.filter(l => completedLessons.includes(l.id)).length;
  const totalLessons      = allLessons.length;
  const progressPct       = totalLessons > 0 ? Math.round((completedInCourse / totalLessons) * 100) : 0;

  const selectLesson = useCallback((lesson) => {
    setActiveLesson(lesson);
    setNote(user.lessonNotes?.[lesson.id] || '');
    setActiveView('content');
  }, [user.lessonNotes]);

  const markComplete = useCallback(async () => {
    if (!activeLesson || completedLessons.includes(activeLesson.id)) return;
    const updated = [...completedLessons, activeLesson.id];
    setCompletedLessons(updated);

    const xpGained  = LESSON_XP + (user.doubleXPUntil && new Date() < new Date(user.doubleXPUntil) ? LESSON_XP : 0);
    const updatedUser = {
      ...user,
      completedLessons: updated,
      xp: (user.xp || 0) + xpGained,
      coins: (user.coins || 0) + 10,
    };
    onUpdateUser(updatedUser);
    await saveUser({ ...updatedUser, username: user.username });

    Alert.alert('✅ Lesson Complete!', `+${xpGained} XP earned!`, [{ text: 'Continue', style: 'default' }]);
  }, [activeLesson, completedLessons, user, onUpdateUser]);

  const handleQuizComplete = useCallback(async (scorePercent) => {
    if (!activeLesson) return;
    const updated = completedLessons.includes(activeLesson.id)
      ? completedLessons
      : [...completedLessons, activeLesson.id];

    const xpGained = Math.round((scorePercent / 100) * QUIZ_XP);
    const newCoins  = scorePercent === 100 ? (user.coins || 0) + 25 : (user.coins || 0) + 5;
    setCompletedLessons(updated);

    const updatedAchievements = scorePercent === 100 && !(user.unlockedAchievements || []).includes('quiz_perfect')
      ? [...(user.unlockedAchievements || []), 'quiz_perfect']
      : (user.unlockedAchievements || []);

    const updatedUser = {
      ...user,
      completedLessons: updated,
      xp:    (user.xp || 0) + xpGained,
      coins: newCoins,
      quizScores: { ...(user.quizScores || {}), [activeLesson.id]: scorePercent },
      unlockedAchievements: updatedAchievements,
    };
    onUpdateUser(updatedUser);
    await saveUser({ ...updatedUser, username: user.username });
  }, [activeLesson, completedLessons, user, onUpdateUser]);

  const saveNote = useCallback(async () => {
    if (!activeLesson) return;
    const updatedUser = {
      ...user,
      lessonNotes: { ...(user.lessonNotes || {}), [activeLesson.id]: note },
    };
    onUpdateUser(updatedUser);
    await saveUser({ ...updatedUser, username: user.username });
    Alert.alert('📝 Note Saved', 'Your note has been saved for this lesson.');
  }, [activeLesson, note, user, onUpdateUser]);

  const isLessonDone = activeLesson ? completedLessons.includes(activeLesson.id) : false;
  const isLessonImportant = activeLesson ? (user.importantLessons || []).includes(activeLesson.id) : false;

  const toggleImportant = useCallback(async () => {
    if (!activeLesson) return;
    const existing = user.importantLessons || [];
    const isAlready = existing.includes(activeLesson.id);
    const updated = isAlready ? existing.filter(id => id !== activeLesson.id) : [...existing, activeLesson.id];
    const updatedUser = {
      ...user,
      importantLessons: updated
    };
    onUpdateUser(updatedUser);
    await saveUser({ ...updatedUser, username: user.username });
    Alert.alert(
      isAlready ? 'Removed' : '⭐ Marked as Important',
      isAlready ? 'Lesson unpinned from your Important list.' : 'This lesson is marked as Important for exam review.'
    );
  }, [activeLesson, user, onUpdateUser]);

  return (
    <View style={styles.root}>
      {/* Header */}
      <LinearGradient colors={['#151c2e', '#0b0d17']} style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <View style={{ flex: 1, paddingRight: spacing.md }}>
          <Text style={styles.courseTitle} numberOfLines={1}>{course.title}</Text>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.progressLabel}>{completedInCourse}/{totalLessons} lessons · {progressPct}%</Text>
        </View>
      </LinearGradient>

      <View style={styles.body}>
        {/* Sidebar Module List */}
        <ScrollView style={styles.sidebar} showsVerticalScrollIndicator={false}>
          {course.modules?.map((mod, mi) => (
            <View key={mod.id || mi}>
              <TouchableOpacity style={styles.moduleHeader} onPress={() => setExpandedModule(expandedModule === mod.id ? null : mod.id)}>
                <Text style={styles.moduleTitle} numberOfLines={2}>{mi + 1}. {mod.title}</Text>
                <Text style={{ color: colors.textMuted }}>{expandedModule === mod.id ? '▾' : '▸'}</Text>
              </TouchableOpacity>
              {expandedModule === mod.id && mod.lessons?.map((lesson, li) => (
                <LessonItem key={lesson.id || li} lesson={lesson}
                  isActive={activeLesson?.id === lesson.id}
                  isCompleted={completedLessons.includes(lesson.id)}
                  onSelect={selectLesson} />
              ))}
            </View>
          ))}
        </ScrollView>

        {/* Main Content Panel */}
        <ScrollView style={styles.main} showsVerticalScrollIndicator={false}>
          {activeLesson ? (
            <>
              {/* Lesson Header */}
              <View style={styles.lessonHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.lessonTitleLg}>{activeLesson.title}</Text>
                  <Text style={styles.lessonMetaLg}>{activeLesson.type} · {activeLesson.duration}</Text>
                </View>

                {/* Mark as Important Button */}
                <TouchableOpacity
                  onPress={toggleImportant}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 4,
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 16,
                    backgroundColor: isLessonImportant ? 'rgba(245, 158, 11, 0.2)' : 'rgba(255, 255, 255, 0.06)',
                    borderWidth: 1,
                    borderColor: isLessonImportant ? '#f59e0b' : 'rgba(255, 255, 255, 0.1)'
                  }}
                >
                  <Text style={{ fontSize: 13, color: isLessonImportant ? '#fbbf24' : '#94a3b8', fontWeight: '700' }}>
                    {isLessonImportant ? '★ Important' : '☆ Mark Important'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* View Tabs */}
              <View style={styles.viewTabs}>
                {['content','notes', activeLesson.type === 'quiz' ? 'quiz' : null].filter(Boolean).map(v => (
                  <TouchableOpacity key={v} onPress={() => setActiveView(v)}
                    style={[styles.viewTab, activeView === v && styles.viewTabActive]}>
                    <Text style={[styles.viewTabText, activeView === v && styles.viewTabTextActive]}>
                      {v === 'content' ? '📖 Content' : v === 'notes' ? '📝 Notes' : '🧠 Quiz'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Content View */}
              {activeView === 'content' && (
                <View style={styles.contentCard}>
                  {activeLesson.type === 'video' && activeLesson.videoUrl && (
                    <View style={styles.videoPlaceholder}>
                      <Text style={{ fontSize: 36 }}>▶️</Text>
                      <Text style={styles.videoUrl} numberOfLines={2}>{activeLesson.videoUrl}</Text>
                      <Text style={[typography.bodySm, { textAlign: 'center', marginTop: 4 }]}>
                        Video content — open in browser to watch
                      </Text>
                    </View>
                  )}
                  {(activeLesson.contentMarkdown || activeLesson.content) && (
                    <Text style={styles.contentText}>{activeLesson.contentMarkdown || activeLesson.content}</Text>
                  )}
                  {!activeLesson.contentMarkdown && !activeLesson.content && !activeLesson.videoUrl && (
                    <Text style={styles.contentText}>No content available for this lesson.</Text>
                  )}

                  {/* Mark Complete */}
                  {!isLessonDone ? (
                    <TouchableOpacity onPress={markComplete} style={styles.markDoneBtn}>
                      <LinearGradient colors={[colors.accentGreen,'#059669']} style={styles.markDoneGradient} start={{ x:0,y:0 }} end={{ x:1,y:0 }}>
                        <Text style={styles.markDoneText}>✅ Mark as Complete (+{LESSON_XP} XP)</Text>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.doneBadge}>
                      <Text style={styles.doneBadgeText}>✅ Lesson Completed!</Text>
                    </View>
                  )}
                </View>
              )}

              {/* Notes View */}
              {activeView === 'notes' && (
                <View style={styles.contentCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={styles.notesHint}>📝 Personal notes for this lesson</Text>
                    {isLessonImportant && (
                      <Text style={{ fontSize: 11, color: '#fbbf24', fontWeight: '700' }}>⭐ High Priority</Text>
                    )}
                  </View>

                  {/* Quick Template Buttons */}
                  <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                    <TouchableOpacity
                      onPress={() => setNote(prev => (prev ? prev + '\n\n' : '') + '> ⭐ IMPORTANT: ')}
                      style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(245, 158, 11, 0.15)', borderRadius: 12 }}
                    >
                      <Text style={{ fontSize: 11, color: '#fbbf24', fontWeight: '600' }}>⭐ Important</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setNote(prev => (prev ? prev + '\n\n' : '') + '> 💡 KEY TAKEAWAY: ')}
                      style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(16, 185, 129, 0.15)', borderRadius: 12 }}
                    >
                      <Text style={{ fontSize: 11, color: '#34d399', fontWeight: '600' }}>💡 Takeaway</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => setNote(prev => (prev ? prev + '\n\n' : '') + '> 📌 FORMULA: ')}
                      style={{ paddingHorizontal: 10, paddingVertical: 4, backgroundColor: 'rgba(99, 102, 241, 0.15)', borderRadius: 12 }}
                    >
                      <Text style={{ fontSize: 11, color: '#c4b5fd', fontWeight: '600' }}>📌 Formula</Text>
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    style={styles.notesInput}
                    placeholder="Type your notes here…"
                    placeholderTextColor={colors.textDim}
                    value={note}
                    onChangeText={setNote}
                    multiline
                    textAlignVertical="top"
                    numberOfLines={10}
                  />
                  <TouchableOpacity onPress={saveNote} style={styles.saveNoteBtn}>
                    <LinearGradient colors={gradients.accent} style={styles.saveNoteGradient} start={{ x:0,y:0 }} end={{ x:1,y:0 }}>
                      <Text style={styles.saveNoteText}>💾 Save Note</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {/* Quiz View */}
              {activeView === 'quiz' && activeLesson.type === 'quiz' && (
                <View style={styles.contentCard}>
                  <QuizView questions={activeLesson.questions || []} lessonId={activeLesson.id} onComplete={handleQuizComplete} />
                </View>
              )}
            </>
          ) : (
            <View style={[cardStyle, { padding: spacing.xl, alignItems: 'center', margin: spacing.md }]}>
              <Text style={{ fontSize: 36, marginBottom: spacing.md }}>📚</Text>
              <Text style={typography.bodyMd}>Select a lesson from the sidebar to begin.</Text>
            </View>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  root:   { flex: 1, backgroundColor: colors.bg },
  header: { paddingTop: 50, paddingBottom: spacing.md, paddingHorizontal: spacing.lg, flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  backBtn:      { paddingVertical: 8, paddingRight: spacing.md },
  backBtnText:  { color: colors.accent, fontSize: 15, fontWeight: '700' },
  courseTitle:  { fontSize: 15, fontWeight: '700', color: colors.textPrimary, marginBottom: 6 },
  progressBg:   { height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: radius.full, overflow: 'hidden', marginBottom: 3 },
  progressFill: { height: '100%', backgroundColor: colors.accent, borderRadius: radius.full },
  progressLabel:{ fontSize: 11, color: colors.textDim },

  body:    { flex: 1, flexDirection: 'row' },
  sidebar: { width: 180, backgroundColor: colors.bgSecondary, borderRightWidth: 1, borderRightColor: colors.border },
  main:    { flex: 1 },

  moduleHeader:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border },
  moduleTitle:   { fontSize: 12, fontWeight: '700', color: colors.textMuted, flex: 1 },
  lessonItem:    { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: spacing.md, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.04)' },
  lessonItemActive:{ backgroundColor: 'rgba(99,102,241,0.1)', borderLeftWidth: 2, borderLeftColor: colors.accent },
  lessonItemDone:{ opacity: 0.7 },
  lessonIcon:    { width: 24, alignItems: 'center' },
  lessonTitle:   { fontSize: 12, color: colors.textPrimary, lineHeight: 16 },
  lessonMeta:    { fontSize: 10, color: colors.textDim, marginTop: 2 },

  lessonHeader: { padding: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border, backgroundColor: colors.bgCard },
  lessonTitleLg:{ ...typography.displaySm, fontSize: 16, marginBottom: 4 },
  lessonMetaLg: { fontSize: 12, color: colors.textMuted, textTransform: 'capitalize' },

  viewTabs:         { flexDirection: 'row', backgroundColor: colors.bgSecondary, borderBottomWidth: 1, borderBottomColor: colors.border },
  viewTab:          { flex: 1, paddingVertical: 12, alignItems: 'center' },
  viewTabActive:    { borderBottomWidth: 2, borderBottomColor: colors.accent },
  viewTabText:      { fontSize: 13, fontWeight: '600', color: colors.textMuted },
  viewTabTextActive:{ color: colors.accent },

  contentCard:    { padding: spacing.md },
  videoPlaceholder:{ backgroundColor: 'rgba(99,102,241,0.08)', borderRadius: radius.lg, padding: spacing.xl, alignItems: 'center', marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  videoUrl:        { color: colors.accent, fontSize: 12, textAlign: 'center', marginTop: 8 },
  contentText:     { color: colors.textPrimary, fontSize: 14, lineHeight: 22 },

  markDoneBtn:     { marginTop: spacing.lg, borderRadius: radius.md, overflow: 'hidden' },
  markDoneGradient:{ paddingVertical: 14, alignItems: 'center' },
  markDoneText:    { color: '#fff', fontSize: 15, fontWeight: '700' },
  doneBadge:       { marginTop: spacing.lg, backgroundColor: 'rgba(16,185,129,0.15)', borderRadius: radius.md, padding: spacing.md, alignItems: 'center', borderWidth: 1, borderColor: 'rgba(52,211,153,0.3)' },
  doneBadgeText:   { color: colors.green, fontWeight: '700', fontSize: 14 },

  notesHint:      { ...typography.bodySm, marginBottom: spacing.md },
  notesInput:     { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, color: colors.textPrimary, fontSize: 14, height: 200, marginBottom: spacing.md },
  saveNoteBtn:    { borderRadius: radius.md, overflow: 'hidden' },
  saveNoteGradient:{ paddingVertical: 12, alignItems: 'center' },
  saveNoteText:   { color: '#fff', fontWeight: '700', fontSize: 14 },

  quizContainer:   { gap: spacing.md },
  quizProgress:    { gap: 6 },
  questionText:    { fontSize: 17, fontWeight: '700', color: colors.textPrimary, lineHeight: 25 },
  optionBtn:       { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: radius.md, borderWidth: 1, padding: spacing.md },
  optionCircle:    { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.08)', alignItems: 'center', justifyContent: 'center' },
  optionCircleText:{ fontSize: 13, fontWeight: '800', color: colors.textPrimary },
  optionText:      { flex: 1, fontSize: 14, color: colors.textPrimary, lineHeight: 20 },
  explanationBox:  { backgroundColor: 'rgba(99,102,241,0.1)', borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border },
  explanationTitle:{ fontSize: 13, fontWeight: '700', color: colors.accent, marginBottom: 4 },
  explanationText: { fontSize: 13, color: colors.textMuted, lineHeight: 19 },
  nextBtn:         { borderRadius: radius.md, overflow: 'hidden' },
  nextBtnGradient: { paddingVertical: 14, alignItems: 'center' },
  nextBtnText:     { color: '#fff', fontSize: 15, fontWeight: '700' },
  quizResult:      { alignItems: 'center', paddingVertical: spacing.xl },
  quizResultTitle: { ...typography.displayMd, marginBottom: spacing.sm },
  quizResultScore: { ...typography.bodyLg, color: colors.goldLight, fontWeight: '700' },
});

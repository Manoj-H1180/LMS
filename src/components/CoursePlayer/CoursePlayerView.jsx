'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowLeft, 
  CheckCircle2, 
  Circle, 
  Play, 
  Video, 
  FileText, 
  Brain, 
  Award, 
  ChevronRight, 
  ChevronDown, 
  Sparkles, 
  BookOpen, 
  RotateCcw as RetakeQuiz, 
  Check, 
  HelpCircle,
  FileCheck,
  Edit3,
  Save,
  Maximize2,
  Volume2,
  VolumeX,
  Pause,
  Minimize2,
  RotateCcw,
  RotateCw,
  AlertCircle
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confettiHelper';
import { fetchCourseProgressFromDisk, saveCourseProgressToDisk } from '../../utils/storage';
import CertificateModal from '../Certificate/CertificateModal';

export default function CoursePlayerView({ 
  course, 
  user, 
  onUpdateUser, 
  onBack 
}) {
  // Flatten all lessons for navigation
  const courseModules = (Array.isArray(course.modules) ? course.modules : []).filter(Boolean);
  const allLessons = courseModules.flatMap((mod, moduleIndex) =>
    (Array.isArray(mod.lessons) ? mod.lessons : []).filter(Boolean).map((lesson, lessonIndex) => ({
      ...lesson,
      moduleTitle: mod.title,
      moduleIndex,
      lessonIndex
    }))
  );

  const [currentLessonId, setCurrentLessonId] = useState(() => allLessons[0]?.id || '');
  const [showCertificate, setShowCertificate] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [videoState, setVideoState] = useState({ currentTime: 0, duration: 0, paused: true, volume: 1, muted: false, buffered: 0, error: '' });
  const [expandedModules, setExpandedModules] = useState({ 0: true, 1: true });
  const [mobileTab, setMobileTab] = useState('lesson'); // 'lesson' | 'syllabus'

  // Interactive Quiz State
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [restoreProgress, setRestoreProgress] = useState(null);

  const videoRef = useRef(null);
  const savedPlaybackTimeRef = useRef(0);
  const hydratedProgressCourseRef = useRef(null);
  const notesTimerRef = useRef(null);
  const playerShellRef = useRef(null);

  const formatTime = (seconds) => {
    if (!Number.isFinite(seconds)) return '0:00';
    const total = Math.floor(seconds);
    const hours = Math.floor(total / 3600);
    const minutes = Math.floor((total % 3600) / 60);
    const remainder = total % 60;
    return hours > 0 ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainder).padStart(2, '0')}` : `${minutes}:${String(remainder).padStart(2, '0')}`;
  };

  const toggleVideoPlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) video.play().catch(() => setVideoState(state => ({ ...state, error: 'Playback could not start. Check that the video URL is accessible.' })));
    else video.pause();
  };

  const seekVideo = (offset) => {
    const video = videoRef.current;
    if (!video || !Number.isFinite(video.duration)) return;
    video.currentTime = Math.max(0, Math.min(video.duration, video.currentTime + offset));
  };

  const toggleFullscreen = async () => {
    const shell = playerShellRef.current;
    if (!shell) return;
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await shell.requestFullscreen();
    } catch {
      setVideoState(state => ({ ...state, error: 'Fullscreen is not available in this browser.' }));
    }
  };

  useEffect(() => {
    const handleKeys = (event) => {
      if (event.target instanceof HTMLElement && ['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON'].includes(event.target.tagName)) return;
      if (videoRef.current?.paused === undefined) return;
      if (event.code === 'Space' || event.code === 'KeyK') { event.preventDefault(); toggleVideoPlayback(); }
      else if (event.code === 'ArrowLeft') { event.preventDefault(); seekVideo(-10); }
      else if (event.code === 'ArrowRight') { event.preventDefault(); seekVideo(10); }
      else if (event.code === 'KeyM' && videoRef.current) { videoRef.current.muted = !videoRef.current.muted; setVideoState(state => ({ ...state, muted: videoRef.current.muted })); }
      else if (event.code === 'KeyF') toggleFullscreen();
    };
    window.addEventListener('keydown', handleKeys);
    return () => window.removeEventListener('keydown', handleKeys);
  }, []);

  useEffect(() => {
    const syncFullscreen = () => setVideoState(state => ({ ...state, fullscreen: Boolean(document.fullscreenElement) }));
    document.addEventListener('fullscreenchange', syncFullscreen);
    return () => document.removeEventListener('fullscreenchange', syncFullscreen);
  }, []);

  // Hydrate course progress from SQLite on disk
  useEffect(() => {
    if (!course?.id || hydratedProgressCourseRef.current === course.id) return;
    hydratedProgressCourseRef.current = course.id;
    fetchCourseProgressFromDisk(course.id, user.username).then(progress => {
      if (hydratedProgressCourseRef.current !== course.id || !progress) return;
      if (progress) {
        if (progress.lastLessonId && allLessons.some(l => l.id === progress.lastLessonId)) {
          setCurrentLessonId(progress.lastLessonId);
        }
        setRestoreProgress(progress);
        if (progress.playbackTime > 0) {
          savedPlaybackTimeRef.current = progress.playbackTime;
          if (videoRef.current) {
            videoRef.current.currentTime = progress.playbackTime;
          }
        }
        if (Array.isArray(progress.completedLessons) && progress.completedLessons.length > 0) {
    const mergedCompleted = Array.from(new Set([...(user.completedLessons || []), ...progress.completedLessons]));
          const mergedScores = { ...(user.quizScores || {}), ...(progress.quizScores || {}) };
    const mergedNotes = { ...(user.lessonNotes || {}), ...(progress.notes || {}) };
    const mergedLessonCompletedAt = { ...(user.lessonCompletedAt || {}), ...(progress.lessonCompletedAt || {}) };
          onUpdateUser({
            ...user,
      completedLessons: mergedCompleted,
      lessonCompletedAt: mergedLessonCompletedAt,
            quizScores: mergedScores,
            lessonNotes: mergedNotes
          });
        }
        if (progress.lastLessonId && !allLessons.some(lesson => lesson.id === progress.lastLessonId)) {
          setCurrentLessonId(allLessons[0]?.id || '');
        }
      }
    });
  }, [course?.id, user.username, allLessons, onUpdateUser, user]);

  const currentLesson = allLessons.find(l => l.id === currentLessonId) || allLessons[0];
  const currentIndex = allLessons.findIndex(l => l.id === currentLessonId);
  const isLessonCompleted = user.completedLessons?.includes(currentLesson?.id);

  // Calculate course completion
  const totalLessonsCount = allLessons.length;
  const completedInCourseCount = allLessons.filter(l => user.completedLessons?.includes(l.id)).length;
  const progressPercent = totalLessonsCount > 0 ? Math.round((completedInCourseCount / totalLessonsCount) * 100) : 0;
  const isCourseFullyCompleted = progressPercent === 100;

  // Load lesson note when lesson changes
  useEffect(() => {
    setCurrentNote(user.lessonNotes?.[currentLessonId] || '');
    setQuizAnswers({});
    setQuizSubmitted(false);
    setQuizScore(0);
  }, [currentLessonId, user.lessonNotes]);

  // Set video speed and restore playback position
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
      if (restoreProgress?.lastLessonId === currentLessonId && restoreProgress.playbackTime > 0) {
        videoRef.current.currentTime = restoreProgress.playbackTime;
        setRestoreProgress(null);
        savedPlaybackTimeRef.current = restoreProgress.playbackTime;
      } else if (savedPlaybackTimeRef.current > 0) {
        videoRef.current.currentTime = savedPlaybackTimeRef.current;
        savedPlaybackTimeRef.current = 0;
      }
    }
  }, [playbackSpeed, currentLessonId, restoreProgress]);

  // Toggle Module in Sidebar
  const toggleModule = (idx) => {
    soundFX.playClick();
    setExpandedModules(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Switch Lesson & save position to SQLite
  const selectLesson = (lessonId) => {
    soundFX.playClick();
    setCurrentLessonId(lessonId);
    setMobileTab('lesson'); // auto switch to lesson viewer on mobile devices
    saveCourseProgressToDisk({
      courseId: course.id,
      username: user.username,
      lastLessonId: lessonId,
      completedLessons: user.completedLessons || [],
      lessonCompletedAt: user.lessonCompletedAt || {},
      quizScores: user.quizScores || {},
      notes: user.lessonNotes || {},
      progressPercent,
      completed: isCourseFullyCompleted
    });
  };

  // Mark Lesson Completed & persist to SQLite on disk
  const handleCompleteLesson = () => {
    if (!currentLesson) return;

    const updatedCompleted = Array.from(new Set([...(user.completedLessons || []), currentLesson.id]));
    const updatedLessonCompletedAt = { ...(user.lessonCompletedAt || {}), [currentLesson.id]: user.lessonCompletedAt?.[currentLesson.id] || Date.now() };
    const willCompleteCourse = allLessons.every(l => updatedCompleted.includes(l.id));
    const newPercent = totalLessonsCount > 0 ? Math.round((allLessons.filter(l => updatedCompleted.includes(l.id)).length / totalLessonsCount) * 100) : 0;

    if (!isLessonCompleted) {
      soundFX.playXPEarned();
      triggerConfetti.burst();

      if (willCompleteCourse) {
        soundFX.playLevelUp();
        triggerConfetti.cannon();
      }

      onUpdateUser({ ...user, completedLessons: updatedCompleted, lessonCompletedAt: updatedLessonCompletedAt });
    }

    // Auto-advance to next lesson if available
    let nextLessonId = currentLesson.id;
    if (currentIndex < allLessons.length - 1) {
      nextLessonId = allLessons[currentIndex + 1].id;
      setCurrentLessonId(nextLessonId);
    }

    // Save progress to SQLite on disk
    saveCourseProgressToDisk({
      courseId: course.id,
      username: user.username,
      lastLessonId: nextLessonId,
      completedLessons: updatedCompleted,
      lessonCompletedAt: updatedLessonCompletedAt,
      progressPercent: newPercent,
      completed: willCompleteCourse,
      notes: user.lessonNotes || {},
      quizScores: user.quizScores || {}
    });
  };

  // Handle Quiz Option Selection
  const handleSelectQuizOption = (questionId, optionIndex) => {
    if (quizSubmitted) return;
    soundFX.playClick();
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  // Submit Quiz & persist to SQLite on disk
  const handleSubmitQuiz = () => {
    if (!currentLesson.quiz?.questions) return;
    const questions = currentLesson.quiz.questions;
    if (questions.length === 0) return;
    let correct = 0;

    questions.forEach(q => {
      if (quizAnswers[q.id ?? questions.indexOf(q)] === q.correctAnswer) {
        correct++;
      }
    });

    const percent = Math.round((correct / questions.length) * 100);
    setQuizScore(percent);
    setQuizSubmitted(true);

    if (percent >= (currentLesson.quiz.passingScore || 70)) {
      if (percent === 100) {
        soundFX.playCorrect();
        triggerConfetti.stars();
      } else {
        soundFX.playCorrect();
        triggerConfetti.burst();
      }

      // Mark quiz lesson completed
      const updatedCompleted = Array.from(new Set([...(user.completedLessons || []), currentLesson.id]));
      const updatedLessonCompletedAt = { ...(user.lessonCompletedAt || {}), [currentLesson.id]: user.lessonCompletedAt?.[currentLesson.id] || Date.now() };
      const updatedScores = { ...(user.quizScores || {}), [currentLesson.id]: percent };
      const willCompleteCourse = allLessons.every(l => updatedCompleted.includes(l.id));
      const newPercent = totalLessonsCount > 0 ? Math.round((allLessons.filter(l => updatedCompleted.includes(l.id)).length / totalLessonsCount) * 100) : 0;

      onUpdateUser({ ...user, completedLessons: updatedCompleted, lessonCompletedAt: updatedLessonCompletedAt, quizScores: updatedScores });

      // Save to SQLite on disk
      saveCourseProgressToDisk({
        courseId: course.id,
        username: user.username,
        lastLessonId: currentLesson.id,
        completedLessons: updatedCompleted,
        lessonCompletedAt: updatedLessonCompletedAt,
        quizScores: updatedScores,
        notes: user.lessonNotes || {},
        progressPercent: newPercent,
        completed: willCompleteCourse
      });
    } else {
      soundFX.playIncorrect();
    }
  };

  // Save Note & persist to SQLite on disk
  const handleSaveNote = () => {
    soundFX.playClick();
    const updatedNotes = {
      ...(user.lessonNotes || {}),
      [currentLesson.id]: currentNote
    };

    saveCourseProgressToDisk({
      courseId: course.id,
      username: user.username,
      lastLessonId: currentLesson.id,
      notes: updatedNotes,
      completedLessons: user.completedLessons || [],
      lessonCompletedAt: user.lessonCompletedAt || {},
      quizScores: user.quizScores || {},
      progressPercent,
      completed: isCourseFullyCompleted
    });

    onUpdateUser({
      ...user,
      lessonNotes: updatedNotes,
      unlockedAchievements: !user.unlockedAchievements?.includes('note_taker') && Object.keys(updatedNotes).length >= 2
        ? [...(user.unlockedAchievements || []), 'note_taker']
        : (user.unlockedAchievements || [])
    });
  };

  useEffect(() => {
    if (!currentLesson || currentNote === (user.lessonNotes?.[currentLesson.id] || '')) return;
    window.clearTimeout(notesTimerRef.current);
    notesTimerRef.current = window.setTimeout(() => {
      const updatedNotes = { ...(user.lessonNotes || {}), [currentLesson.id]: currentNote };
      onUpdateUser({ ...user, lessonNotes: updatedNotes });
      saveCourseProgressToDisk({
        courseId: course.id,
        lastLessonId: currentLesson.id,
        completedLessons: user.completedLessons || [],
        lessonCompletedAt: user.lessonCompletedAt || {},
        quizScores: user.quizScores || {},
        notes: updatedNotes,
        progressPercent,
        completed: isCourseFullyCompleted
      });
    }, 700);
    return () => window.clearTimeout(notesTimerRef.current);
  }, [currentNote, currentLesson, user, course.id, onUpdateUser, progressPercent, isCourseFullyCompleted]);

  if (allLessons.length === 0) {
    return (
      <section role="alert" className="glass-panel" style={{ maxWidth: 680, margin: '48px auto', padding: 32, textAlign: 'center' }}>
        <h1 style={{ color: '#fff', marginBottom: 10 }}>No playable lessons found</h1>
        <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 20 }}>This course has no valid lessons. Return to your courses and re-import it after checking the lesson files.</p>
        <button type="button" className="glow-btn" onClick={onBack}>Back to courses</button>
      </section>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 'calc(100vh - 72px)' }}>
      {/* Top Learning Bar */}
      <div className="course-player-topbar">
        <div className="course-player-topbar-left">
          <button 
            onClick={onBack}
            className="ghost-btn course-player-back-btn"
          >
            <ArrowLeft size={16} />
            <span className="back-btn-text">Back to Dashboard</span>
          </button>

          <div className="course-player-divider" />

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {course.category} • {course.level}
            </div>
            <h2 className="course-player-title">
              {course.title}
            </h2>
          </div>
        </div>

        {/* Progress & Certificate Button */}
        <div className="course-player-topbar-right">
          <div className="course-player-progress-pill">
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: isCourseFullyCompleted ? '#34d399' : 'var(--text-muted)' }}>
              {isCourseFullyCompleted ? 'Completed!' : `${completedInCourseCount}/${totalLessonsCount} (${progressPercent}%)`}
            </div>
            <div className="xp-track" style={{ width: '110px', height: '6px' }}>
              <div style={{
                  height: '100%', 
                  width: `${progressPercent}%`, 
                  borderRadius: 'var(--radius-full)',
                  background: isCourseFullyCompleted ? '#10b981' : 'var(--accent-gradient)' 
                }} />
            </div>
          </div>

          <button
            onClick={() => { soundFX.playClick(); setShowCertificate(true); }}
            className={isCourseFullyCompleted ? 'glow-btn' : 'ghost-btn'}
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
            title={isCourseFullyCompleted ? 'View & Download Diploma' : 'Preview Course Certificate'}
          >
            <Award size={16} color={isCourseFullyCompleted ? '#fff' : '#fbbf24'} />
            <span className="diploma-btn-text">Diploma</span>
          </button>

          <button
            onClick={() => { soundFX.playClick(); setNotesOpen(!notesOpen); }}
            className="ghost-btn"
            style={{ padding: '8px 12px' }}
            title="Lesson Study Notes"
          >
            <Edit3 size={16} />
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher: Lesson vs Syllabus */}
      <div className="course-player-mobile-tabs">
        <button
          onClick={() => { soundFX.playClick(); setMobileTab('lesson'); }}
          className={`course-player-tab-btn ${mobileTab === 'lesson' ? 'active' : ''}`}
        >
          <Video size={16} />
          <span>Current Lesson</span>
        </button>
        <button
          onClick={() => { soundFX.playClick(); setMobileTab('syllabus'); }}
          className={`course-player-tab-btn ${mobileTab === 'syllabus' ? 'active' : ''}`}
        >
          <BookOpen size={16} />
          <span>Syllabus ({completedInCourseCount}/{totalLessonsCount})</span>
        </button>
      </div>

      {/* Main Learning Grid: Syllabus Sidebar + Player Content */}
      <div className="course-player-grid">
        {/* Left Lesson Drawer */}
        <aside className={`course-player-syllabus ${mobileTab === 'syllabus' ? 'mobile-active' : ''}`}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={16} color="var(--accent-primary)" />
              Course Syllabus
            </h3>
          </div>

          <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {courseModules.map((mod, mIdx) => {
              const isExpanded = expandedModules[mIdx] !== false;
              const moduleLessons = (Array.isArray(mod.lessons) ? mod.lessons : []).filter(Boolean);
              const moduleLessonsCompleted = moduleLessons.filter(l => user.completedLessons?.includes(l.id)).length;

              return (
                <div 
                  key={mod.id || mIdx}
                  style={{
                    background: 'rgba(255, 255, 255, 0.02)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--border-subtle)',
                    overflow: 'hidden'
                  }}
                >
                  {/* Module Accordion Header */}
                  <div 
                    onClick={() => toggleModule(mIdx)}
                    style={{
                      padding: '12px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: 'rgba(255, 255, 255, 0.03)'
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#fff' }}>
                        {mod.title}
                      </span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>
                        {moduleLessonsCompleted}/{moduleLessons.length} completed
                      </span>
                    </div>
                    {isExpanded ? <ChevronDown size={16} color="var(--text-dim)" /> : <ChevronRight size={16} color="var(--text-dim)" />}
                  </div>

                  {/* Lessons List in Module */}
                  {isExpanded && (
                    <div style={{ display: 'flex', flexDirection: 'column', padding: '6px' }}>
                      {moduleLessons.map(les => {
                        const isSelected = les.id === currentLessonId;
                        const isDone = user.completedLessons?.includes(les.id);

                        return (
                          <div
                            key={les.id}
                            onClick={() => selectLesson(les.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '10px 12px',
                              borderRadius: 'var(--radius-sm)',
                              background: isSelected ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                              border: isSelected ? '1px solid var(--border-glow)' : '1px solid transparent',
                              cursor: 'pointer',
                              transition: 'all var(--transition-fast)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                              {isDone ? (
                                <CheckCircle2 size={16} color="#10b981" />
                              ) : (
                                <Circle size={16} color="var(--text-dim)" />
                              )}

                              <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                                <span style={{
                                  fontSize: '0.82rem',
                                  fontWeight: isSelected ? '700' : '500',
                                  color: isSelected ? '#fff' : 'var(--text-muted)',
                                  whiteSpace: 'nowrap',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis'
                                }}>
                                  {les.title}
                                </span>
                                <span style={{ fontSize: '0.7rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  {les.type === 'video' && <Video size={11} />}
                                  {les.type === 'quiz' && <Brain size={11} />}
                                  {les.type === 'markdown' && <FileText size={11} />}
                                  {les?.duration || '10 min'}
                                </span>
                              </div>
                            </div>

                            <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: '700', flexShrink: 0 }}>
                              +{les.xp} XP
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </aside>

        {/* Center Learner Workspace */}
        <main className={`course-player-workspace ${mobileTab === 'lesson' ? 'mobile-active' : ''}`}>
          {/* Lesson Header */}
          <div className="course-player-lesson-header">
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <span className="badge-pill" style={{
                  background: currentLesson?.type === 'video' ? 'rgba(56, 189, 248, 0.15)' : currentLesson?.type === 'quiz' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                  color: currentLesson?.type === 'video' ? '#38bdf8' : currentLesson?.type === 'quiz' ? '#ec4899' : '#10b981'
                }}>
                  {currentLesson?.type} lesson
                </span>
                <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
                  {currentLesson?.moduleTitle}
                </span>
              </div>
              <h1 style={{ fontSize: '1.6rem', color: '#fff' }}>
                {currentLesson?.title}
              </h1>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <button
                onClick={handleCompleteLesson}
                className={isLessonCompleted ? 'ghost-btn' : 'glow-btn'}
                style={{
                  background: isLessonCompleted ? 'rgba(16, 185, 129, 0.15)' : undefined,
                  borderColor: isLessonCompleted ? 'rgba(16, 185, 129, 0.4)' : undefined,
                  color: isLessonCompleted ? '#34d399' : undefined
                }}
              >
                <CheckCircle2 size={18} />
                {isLessonCompleted ? 'Completed ✓' : `Mark Done & Earn +${currentLesson?.xp || 50} XP`}
              </button>
            </div>
          </div>

          {/* Video Player (if type === 'video') */}
          {currentLesson?.type === 'video' && (
            <section ref={playerShellRef} className="video-player-shell" aria-label={`Video lesson: ${currentLesson.title}`}>
              <video
                key={currentLesson.id}
                ref={videoRef}
                src={currentLesson.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                preload="metadata"
                playsInline
                aria-label={currentLesson.title}
                onLoadedMetadata={event => {
                  const { duration, currentTime } = event.currentTarget;
                  setVideoState(state => ({ ...state, duration, currentTime, error: '' }));
                }}
                onDurationChange={event => {
                  const { duration } = event.currentTarget;
                  setVideoState(state => ({ ...state, duration }));
                }}
                onTimeUpdate={event => {
                  const video = event.currentTarget;
                  const sec = Math.floor(video.currentTime);
                  setVideoState(state => ({ ...state, currentTime: video.currentTime, buffered: video.buffered.length ? video.buffered.end(video.buffered.length - 1) : 0 }));
                  if (sec > 0 && sec % 10 === 0 && savedPlaybackTimeRef.current !== sec) {
                    savedPlaybackTimeRef.current = sec;
                    saveCourseProgressToDisk({ courseId: course.id, lastLessonId: currentLesson.id, playbackTime: sec, completedLessons: user.completedLessons || [], lessonCompletedAt: user.lessonCompletedAt || {}, quizScores: user.quizScores || {}, notes: user.lessonNotes || {}, progressPercent, completed: isCourseFullyCompleted });
                  }
                }}
                onPlay={() => setVideoState(state => ({ ...state, paused: false, error: '' }))}
                onPause={event => {
                  const video = event.currentTarget;
                  setVideoState(state => ({ ...state, paused: true, currentTime: video.currentTime }));
                  saveCourseProgressToDisk({ courseId: course.id, lastLessonId: currentLesson.id, playbackTime: Math.floor(video.currentTime), completedLessons: user.completedLessons || [], lessonCompletedAt: user.lessonCompletedAt || {}, quizScores: user.quizScores || {}, notes: user.lessonNotes || {}, progressPercent, completed: isCourseFullyCompleted });
                }}
                onVolumeChange={event => {
                  const { volume, muted } = event.currentTarget;
                  setVideoState(state => ({ ...state, volume, muted }));
                }}
                onError={() => setVideoState(state => ({ ...state, error: 'This video could not be loaded. Check the lesson URL and your connection, then try again.' }))}
                onEnded={handleCompleteLesson}
                className="video-player-media"
              />
              {videoState.error && <div className="video-player-error" role="alert"><AlertCircle size={18} />{videoState.error}</div>}
              <div className="video-player-controls">
                <input
                  className="video-player-timeline"
                  type="range"
                  min="0"
                  max={videoState.duration || 0}
                  step="0.1"
                  value={Math.min(videoState.currentTime, videoState.duration || 0)}
                  aria-label="Video position"
                  style={{ '--video-progress': `${videoState.duration ? videoState.currentTime / videoState.duration * 100 : 0}%`, '--video-buffer': `${videoState.duration ? videoState.buffered / videoState.duration * 100 : 0}%` }}
                  onChange={event => { if (videoRef.current) videoRef.current.currentTime = Number(event.target.value); }}
                  disabled={!videoState.duration}
                />
                <div className="video-player-control-row">
                  <div className="video-player-control-group">
                    <button className="video-control-button" onClick={toggleVideoPlayback} aria-label={videoState.paused ? 'Play video' : 'Pause video'} title="Play/Pause (Space)">
                      {videoState.paused ? <Play size={19} fill="currentColor" /> : <Pause size={19} fill="currentColor" />}
                    </button>
                    <button className="video-control-button video-skip-button" onClick={() => seekVideo(-10)} aria-label="Back 10 seconds" title="Back 10 seconds (←)"><RotateCcw size={17} /><span>10</span></button>
                    <button className="video-control-button video-skip-button" onClick={() => seekVideo(10)} aria-label="Forward 10 seconds" title="Forward 10 seconds (→)"><RotateCw size={17} /><span>10</span></button>
                    <button className="video-control-button" onClick={() => { if (!videoRef.current) return; videoRef.current.muted = !videoRef.current.muted; }} aria-label={videoState.muted ? 'Unmute video' : 'Mute video'} title="Mute (M)">
                      {videoState.muted || videoState.volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                    </button>
                    <input className="video-player-volume" type="range" min="0" max="1" step="0.05" value={videoState.muted ? 0 : videoState.volume} aria-label="Volume" onChange={event => { if (videoRef.current) { videoRef.current.volume = Number(event.target.value); videoRef.current.muted = Number(event.target.value) === 0; } }} />
                    <span className="video-player-time">{formatTime(videoState.currentTime)} <span>/</span> {formatTime(videoState.duration)}</span>
                  </div>
                  <div className="video-player-control-group">
                    <label className="video-speed-label">Speed
                      <select className="video-player-speed" value={playbackSpeed} onChange={event => setPlaybackSpeed(Number(event.target.value))} aria-label="Playback speed">
                        {[0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map(speed => <option key={speed} value={speed}>{speed}×</option>)}
                      </select>
                    </label>
                    <button className="video-control-button" onClick={toggleFullscreen} aria-label={videoState.fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'} title="Fullscreen (F)">
                      {videoState.fullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                    </button>
                  </div>
                </div>
              </div>
              <div className="video-player-shortcuts" aria-hidden="true">SPACE Play/Pause <span>← / → Seek 10s</span> M Mute <span>F Fullscreen</span></div>
            </section>
          )}

          {/* Interactive Quiz Engine (if type === 'quiz') */}
          {currentLesson?.type === 'quiz' && currentLesson.quiz && (
            <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '26px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', color: '#fff' }}>
                    {currentLesson.quiz.title}
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Passing Score: {currentLesson.quiz.passingScore || 70}% • Earn {currentLesson.xp || 120} XP upon first pass
                  </p>
                </div>

                {quizSubmitted && (
                  <div style={{
                    padding: '8px 18px',
                    borderRadius: 'var(--radius-full)',
                    background: quizScore >= (currentLesson.quiz.passingScore || 70) ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
                    border: `1px solid ${quizScore >= (currentLesson.quiz.passingScore || 70) ? 'rgba(16, 185, 129, 0.5)' : 'rgba(244, 63, 94, 0.5)'}`,
                    color: quizScore >= (currentLesson.quiz.passingScore || 70) ? '#34d399' : '#f87171',
                    fontWeight: '800',
                    fontSize: '1rem'
                  }}>
                    Score: {quizScore}% {quizScore >= (currentLesson.quiz.passingScore || 70) ? '— PASSED! 🌟' : '— Try Again'}
                  </div>
                )}
              </div>

              {/* Questions List */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {currentLesson.quiz.questions.map((q, qIdx) => {
                  const questionId = q.id ?? qIdx;
                  const selected = quizAnswers[questionId];
                  const isCorrect = selected === q.correctAnswer;

                  return (
                    <div 
                      key={q.id || qIdx}
                      style={{
                        padding: '20px',
                        background: 'rgba(255, 255, 255, 0.02)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '14px'
                      }}
                    >
                      <div style={{ fontSize: '1rem', fontWeight: '700', color: '#fff' }}>
                        {qIdx + 1}. {q.question}
                      </div>

                      {/* Options */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selected === optIdx;
                          let optBg = 'rgba(255, 255, 255, 0.03)';
                          let optBorder = 'var(--border-subtle)';

                          if (quizSubmitted) {
                            if (optIdx === q.correctAnswer) {
                              optBg = 'rgba(16, 185, 129, 0.2)';
                              optBorder = 'rgba(16, 185, 129, 0.5)';
                            } else if (isOptionSelected) {
                              optBg = 'rgba(244, 63, 94, 0.2)';
                              optBorder = 'rgba(244, 63, 94, 0.5)';
                            }
                          } else if (isOptionSelected) {
                            optBg = 'rgba(99, 102, 241, 0.2)';
                            optBorder = 'var(--border-glow)';
                          }

                          return (
                            <button
                              type="button"
                              key={optIdx}
                              onClick={() => handleSelectQuizOption(questionId, optIdx)}
                              disabled={quizSubmitted}
                              aria-pressed={isOptionSelected}
                              style={{
                                padding: '12px 16px',
                                textAlign: 'left',
                                width: '100%',
                                color: '#fff',
                                font: 'inherit',
                                opacity: quizSubmitted ? 0.9 : 1,
                                borderRadius: 'var(--radius-md)',
                                background: optBg,
                                border: `1px solid ${optBorder}`,
                                cursor: quizSubmitted ? 'default' : 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                transition: 'all var(--transition-fast)'
                              }}
                            >
                              <div style={{
                                width: '20px',
                                height: '20px',
                                borderRadius: '50%',
                                border: '2px solid',
                                borderColor: isOptionSelected ? 'var(--accent-primary)' : 'var(--text-dim)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {isOptionSelected && (
                                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: 'var(--accent-primary)' }} />
                                )}
                              </div>
                              <span style={{ fontSize: '0.9rem', color: '#fff' }}>
                                {opt}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation card after submit */}
                      {quizSubmitted && q.explanation && (
                        <div style={{
                          padding: '12px 16px',
                          background: 'rgba(255, 255, 255, 0.04)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.85rem',
                          color: '#e2e8f0',
                          borderLeft: `3px solid ${isCorrect ? '#10b981' : '#f43f5e'}`
                        }}>
                          <strong>Explanation:</strong> {q.explanation}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit Quiz Actions */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                {quizSubmitted ? (
                  <button
                    onClick={() => {
                      setQuizSubmitted(false);
                      setQuizAnswers({});
                    }}
                    className="ghost-btn"
                  >
                    <RetakeQuiz size={16} />
                    Retake Quiz
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(quizAnswers).length < currentLesson.quiz.questions.length || currentLesson.quiz.questions.length === 0}
                    className="glow-btn"
                    style={{
                      opacity: Object.keys(quizAnswers).length < currentLesson.quiz.questions.length ? 0.5 : 1,
                      cursor: Object.keys(quizAnswers).length < currentLesson.quiz.questions.length ? 'not-allowed' : 'pointer'
                    }}
                  >
                    <Sparkles size={16} />
                    Submit Assessment
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Markdown & Text Lesson Content */}
          {currentLesson?.contentMarkdown && (
            <div className="glass-panel" style={{ padding: '30px' }}>
              <div 
                style={{ 
                  color: '#e2e8f0', 
                  fontSize: '0.95rem', 
                  lineHeight: 1.7,
                  whiteSpace: 'pre-wrap',
                  fontFamily: 'var(--font-main)'
                }}
              >
                {currentLesson.contentMarkdown}
              </div>
            </div>
          )}

          {/* Navigation Controls between lessons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '20px',
            marginTop: 'auto'
          }}>
            <button
              onClick={() => {
                if (currentIndex > 0) {
                  selectLesson(allLessons[currentIndex - 1].id);
                }
              }}
              disabled={currentIndex <= 0}
              className="ghost-btn"
              style={{ opacity: currentIndex <= 0 ? 0.4 : 1 }}
            >
              Previous Lesson
            </button>

            <button
              onClick={() => {
                if (currentIndex < allLessons.length - 1) {
                  selectLesson(allLessons[currentIndex + 1].id);
                }
              }}
              disabled={currentIndex >= allLessons.length - 1}
              className="glow-btn"
              style={{ opacity: currentIndex >= allLessons.length - 1 ? 0.4 : 1 }}
            >
              Next Lesson
              <ChevronRight size={16} />
            </button>
          </div>
        </main>

        {/* Right Slide-out Notes Scratchpad Drawer */}
        {notesOpen && (
          <aside style={{
            width: '320px',
            background: 'var(--bg-secondary)',
            borderLeft: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            padding: '20px',
            gap: '14px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Edit3 size={17} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1rem' }}>Study Notes</h3>
              </div>
              <button onClick={() => setNotesOpen(false)} className="ghost-btn" style={{ padding: '4px 8px' }}>
                ✕
              </button>
            </div>

            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              Notes save automatically and stay linked to this lesson.
            </p>

            <textarea
              rows={12}
              value={currentNote}
              onChange={(e) => setCurrentNote(e.target.value)}
              placeholder="Take notes, record key concepts, code snippets, or ideas..."
              style={{
                flex: 1,
                padding: '12px',
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.88rem',
                lineHeight: 1.5,
                resize: 'none'
              }}
            />

            <button onClick={handleSaveNote} className="glow-btn" style={{ width: '100%' }}>
              <Save size={16} />
              Save Study Notes
            </button>
          </aside>
        )}
      </div>

      {/* Diploma Certificate Modal */}
      {showCertificate && (
        <CertificateModal
          course={course}
          userName={user.name}
          onClose={() => setShowCertificate(false)}
        />
      )}
    </div>
  );
}

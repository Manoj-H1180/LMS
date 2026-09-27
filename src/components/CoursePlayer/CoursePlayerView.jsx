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
  RotateCcw, 
  Check, 
  HelpCircle,
  FileCheck,
  Edit3,
  Save,
  Maximize2
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confettiHelper';
import CertificateModal from '../Certificate/CertificateModal';

export default function CoursePlayerView({ 
  course, 
  user, 
  onUpdateUser, 
  onBack 
}) {
  // Flatten all lessons for navigation
  const allLessons = [];
  course.modules?.forEach((mod, mIdx) => {
    mod.lessons?.forEach((les, lIdx) => {
      allLessons.push({
        ...les,
        moduleTitle: mod.title,
        moduleIndex: mIdx,
        lessonIndex: lIdx
      });
    });
  });

  const [currentLessonId, setCurrentLessonId] = useState(allLessons[0]?.id || '');
  const [showCertificate, setShowCertificate] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState('');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [expandedModules, setExpandedModules] = useState({ 0: true, 1: true });

  // Interactive Quiz State
  const [quizAnswers, setQuizAnswers] = useState({});
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);

  const videoRef = useRef(null);

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
    if (currentLesson) {
      setCurrentNote(user.lessonNotes?.[currentLesson.id] || '');
      setQuizAnswers({});
      setQuizSubmitted(false);
      setQuizScore(0);
    }
  }, [currentLessonId]);

  // Set video speed
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackSpeed;
    }
  }, [playbackSpeed, currentLessonId]);

  // Toggle Module in Sidebar
  const toggleModule = (idx) => {
    soundFX.playClick();
    setExpandedModules(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  // Switch Lesson
  const selectLesson = (lessonId) => {
    soundFX.playClick();
    setCurrentLessonId(lessonId);
  };

  // Mark Lesson Completed
  const handleCompleteLesson = () => {
    if (!currentLesson) return;

    if (!isLessonCompleted) {
      soundFX.playXPEarned();
      triggerConfetti.burst();

      const earnedXP = currentLesson.xp || 50;
      const earnedCoins = Math.round(earnedXP / 2);
      const updatedCompleted = [...(user.completedLessons || []), currentLesson.id];

      // Check if this completes the course
      const willCompleteCourse = allLessons.every(l => updatedCompleted.includes(l.id));

      if (willCompleteCourse) {
        soundFX.playLevelUp();
        triggerConfetti.cannon();
      }

      onUpdateUser({
        ...user,
        xp: user.xp + earnedXP,
        coins: user.coins + earnedCoins,
        completedLessons: updatedCompleted,
        unlockedAchievements: willCompleteCourse && !user.unlockedAchievements.includes('course_graduate')
          ? [...user.unlockedAchievements, 'course_graduate']
          : user.unlockedAchievements
      });
    }

    // Auto-advance to next lesson if available
    if (currentIndex < allLessons.length - 1) {
      setCurrentLessonId(allLessons[currentIndex + 1].id);
    }
  };

  // Handle Quiz Option Selection
  const handleSelectQuizOption = (questionId, optionIndex) => {
    if (quizSubmitted) return;
    soundFX.playClick();
    setQuizAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  // Submit Quiz
  const handleSubmitQuiz = () => {
    if (!currentLesson.quiz?.questions) return;
    const questions = currentLesson.quiz.questions;
    let correct = 0;

    questions.forEach(q => {
      if (quizAnswers[q.id] === q.correctAnswer) {
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
      if (!isLessonCompleted) {
        const earnedXP = currentLesson.xp || 120;
        onUpdateUser({
          ...user,
          xp: user.xp + earnedXP,
          coins: user.coins + 60,
          completedLessons: [...(user.completedLessons || []), currentLesson.id],
          quizScores: { ...(user.quizScores || {}), [currentLesson.id]: percent },
          unlockedAchievements: percent === 100 && !user.unlockedAchievements.includes('quiz_master')
            ? [...user.unlockedAchievements, 'quiz_master']
            : user.unlockedAchievements
        });
      }
    } else {
      soundFX.playIncorrect();
    }
  };

  // Save Note
  const handleSaveNote = () => {
    soundFX.playClick();
    onUpdateUser({
      ...user,
      lessonNotes: {
        ...(user.lessonNotes || {}),
        [currentLesson.id]: currentNote
      },
      unlockedAchievements: !user.unlockedAchievements.includes('note_taker') && Object.keys(user.lessonNotes || {}).length >= 2
        ? [...user.unlockedAchievements, 'note_taker']
        : user.unlockedAchievements
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 'calc(100vh - 72px)' }}>
      {/* Top Learning Bar */}
      <div style={{
        padding: '14px 24px',
        background: 'var(--bg-glass-heavy)',
        backdropFilter: 'blur(16px)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 30
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <button 
            onClick={onBack}
            className="ghost-btn"
            style={{ padding: '8px 12px', fontSize: '0.85rem' }}
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </button>

          <div style={{ height: '24px', width: '1px', background: 'var(--border-subtle)' }} />

          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {course.category} • {course.level}
            </div>
            <h2 style={{ fontSize: '1.1rem', color: '#fff' }}>
              {course.title}
            </h2>
          </div>
        </div>

        {/* Progress & Certificate Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: isCourseFullyCompleted ? '#34d399' : 'var(--text-muted)' }}>
              {isCourseFullyCompleted ? 'Course Completed!' : `${completedInCourseCount} of ${totalLessonsCount} Completed (${progressPercent}%)`}
            </div>
            <div className="xp-track" style={{ width: '140px', height: '6px' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${progressPercent}%`, 
                  borderRadius: 'var(--radius-full)',
                  background: isCourseFullyCompleted ? '#10b981' : 'var(--accent-gradient)' 
                }} 
              />
            </div>
          </div>

          <button
            onClick={() => { soundFX.playClick(); setShowCertificate(true); }}
            className={isCourseFullyCompleted ? 'glow-btn' : 'ghost-btn'}
            style={{ padding: '8px 14px', fontSize: '0.85rem' }}
            title={isCourseFullyCompleted ? 'View & Download Diploma' : 'Preview Course Certificate'}
          >
            <Award size={16} color={isCourseFullyCompleted ? '#fff' : '#fbbf24'} />
            Diploma
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

      {/* Main Learning Grid: Syllabus Sidebar + Player Content */}
      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        {/* Left Lesson Drawer */}
        <aside style={{
          width: '320px',
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-subtle)',
          overflowY: 'auto',
          flexShrink: 0,
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border-subtle)' }}>
            <h3 style={{ fontSize: '0.95rem', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BookOpen size={16} color="var(--accent-primary)" />
              Course Syllabus
            </h3>
          </div>

          <div style={{ padding: '12px', flex: 1, display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {course.modules?.map((mod, mIdx) => {
              const isExpanded = expandedModules[mIdx] !== false;
              const moduleLessonsCompleted = mod.lessons?.filter(l => user.completedLessons?.includes(l.id))?.length || 0;

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
                        {moduleLessonsCompleted}/{mod.lessons?.length || 0} completed
                      </span>
                    </div>
                    {isExpanded ? <ChevronDown size={16} color="var(--text-dim)" /> : <ChevronRight size={16} color="var(--text-dim)" />}
                  </div>

                  {/* Lessons List in Module */}
                  {isExpanded && (
                    <div style={{ display: 'flex', flexDirection: 'column', padding: '6px' }}>
                      {mod.lessons?.map(les => {
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
                                  {les.duration || '10 min'}
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
        <main style={{ flex: 1, padding: '28px 36px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Lesson Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
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
            <div style={{
              background: '#000',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative'
            }}>
              <video
                ref={videoRef}
                src={currentLesson.videoUrl || 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4'}
                controls
                style={{ width: '100%', maxHeight: '520px', display: 'block', backgroundColor: '#000' }}
                onEnded={handleCompleteLesson}
              />

              {/* Video Speed Controls Overlay */}
              <div style={{
                padding: '10px 16px',
                background: 'rgba(15, 20, 34, 0.9)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Playback Speed:
                </span>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {[0.75, 1, 1.25, 1.5, 2].map(speed => (
                    <button
                      key={speed}
                      onClick={() => setPlaybackSpeed(speed)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: 'var(--radius-sm)',
                        background: playbackSpeed === speed ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.06)',
                        border: 'none',
                        color: '#fff',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        cursor: 'pointer'
                      }}
                    >
                      {speed}x
                    </button>
                  ))}
                </div>
              </div>
            </div>
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
                    Passing Score: {currentLesson.quiz.passingScore || 70}% • Earn +{currentLesson.xp} XP upon passing
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
                  const selected = quizAnswers[q.id];
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
                            <div
                              key={optIdx}
                              onClick={() => handleSelectQuizOption(q.id, optIdx)}
                              style={{
                                padding: '12px 16px',
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
                            </div>
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
                    <RotateCcw size={16} />
                    Retake Quiz
                  </button>
                ) : (
                  <button
                    onClick={handleSubmitQuiz}
                    disabled={Object.keys(quizAnswers).length < currentLesson.quiz.questions.length}
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
              Notes are saved specifically for this lesson and persist in your browser storage.
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

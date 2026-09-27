'use client';

import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  FolderPlus, 
  Video, 
  FileText, 
  Brain, 
  Sparkles, 
  Save, 
  Layers, 
  Check, 
  HelpCircle,
  Clock,
  Tag
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confettiHelper';

export default function CourseCreatorModal({ onClose, onCourseCreated, existingCategories = [] }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState(existingCategories[0] || 'Software Engineering');
  const [customCategory, setCustomCategory] = useState('');
  const [level, setLevel] = useState('Intermediate');
  const [estimatedHours, setEstimatedHours] = useState('4.0 hrs');

  const [modules, setModules] = useState([
    {
      id: 'mod_' + Date.now(),
      title: 'Module 1: Introduction & Fundamentals',
      description: 'Core foundational principles and environment setup.',
      lessons: [
        {
          id: 'les_' + Date.now() + '_1',
          title: '1.1 Welcome & Course Orientation',
          type: 'video',
          duration: '10 min',
          xp: 50,
          videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
          contentMarkdown: '### Welcome to the Course!\n\nIn this lesson, we will review the learning roadmap, required tools, and setup instructions.'
        }
      ]
    }
  ]);

  const [activeModuleIndex, setActiveModuleIndex] = useState(0);

  // Add Module
  const handleAddModule = () => {
    soundFX.playClick();
    const newMod = {
      id: 'mod_' + Date.now(),
      title: `Module ${modules.length + 1}: New Topic`,
      description: 'Module objectives and overview.',
      lessons: []
    };
    setModules([...modules, newMod]);
    setActiveModuleIndex(modules.length);
  };

  // Remove Module
  const handleRemoveModule = (index) => {
    if (modules.length <= 1) return;
    soundFX.playClick();
    const updated = modules.filter((_, i) => i !== index);
    setModules(updated);
    setActiveModuleIndex(Math.max(0, index - 1));
  };

  // Add Lesson
  const handleAddLesson = (moduleIndex, type = 'markdown') => {
    soundFX.playClick();
    const mod = modules[moduleIndex];
    const newLesson = {
      id: 'les_' + Date.now() + '_' + (mod.lessons.length + 1),
      title: `${moduleIndex + 1}.${mod.lessons.length + 1} New ${type === 'quiz' ? 'Quiz' : type === 'video' ? 'Lecture' : 'Article'}`,
      type,
      duration: type === 'quiz' ? '10 min' : type === 'video' ? '15 min' : '8 min',
      xp: type === 'quiz' ? 120 : 60,
      videoUrl: type === 'video' ? '' : undefined,
      contentMarkdown: type === 'markdown' ? '### Lesson Notes\n\nEnter rich study material here...' : '',
      quiz: type === 'quiz' ? {
        title: 'Module Concept Check',
        passingScore: 70,
        questions: [
          {
            id: 'q_' + Date.now(),
            question: 'What is the primary objective of this module?',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswer: 0,
            explanation: 'Option A is correct because it aligns with core architectural goals.'
          }
        ]
      } : undefined
    };

    const updated = [...modules];
    updated[moduleIndex].lessons.push(newLesson);
    setModules(updated);
  };

  // Remove Lesson
  const handleRemoveLesson = (moduleIndex, lessonIndex) => {
    soundFX.playClick();
    const updated = [...modules];
    updated[moduleIndex].lessons = updated[moduleIndex].lessons.filter((_, i) => i !== lessonIndex);
    setModules(updated);
  };

  // Handle local video file upload for a lesson
  const handleLocalVideoUpload = (moduleIndex, lessonIndex, file) => {
    if (!file) return;
    soundFX.playClick();
    const objectUrl = URL.createObjectURL(file);
    const updated = [...modules];
    updated[moduleIndex].lessons[lessonIndex].videoUrl = objectUrl;
    updated[moduleIndex].lessons[lessonIndex].contentMarkdown = `### Local Video: ${file.name}\n\nFile size: ${(file.size / (1024 * 1024)).toFixed(1)} MB.`;
    setModules(updated);
  };

  // Save and Publish Course
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('Please enter a course title.');
      return;
    }

    const finalCategory = customCategory.trim() ? customCategory.trim() : category;
    const totalXP = modules.reduce((acc, m) => acc + m.lessons.reduce((lAcc, l) => lAcc + (l.xp || 50), 0), 0);

    const newCourse = {
      id: 'custom_' + Date.now(),
      title: title.trim(),
      shortDescription: description.trim() || 'Custom created course with interactive lessons and modules.',
      category: finalCategory,
      level,
      rating: 5.0,
      enrolledCount: 1,
      estimatedHours,
      totalXP: Math.max(300, totalXP),
      accentColor: '#a855f7',
      gradient: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
      tags: [finalCategory, level, 'Custom Created'],
      modules,
      createdAt: new Date().toISOString()
    };

    soundFX.playLevelUp();
    triggerConfetti.cannon();
    onCourseCreated(newCourse);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="glass-panel modal-content"
        style={{
          width: '95%',
          maxWidth: '1060px',
          maxHeight: '92vh',
          background: 'var(--bg-secondary)',
          display: 'flex',
          flexDirection: 'column',
          padding: '0',
          border: '1px solid var(--border-glow)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={{
          padding: '24px 30px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              padding: '10px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--accent-gradient)',
              color: '#fff'
            }}>
              <FolderPlus size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>Course Studio & Architect</h2>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Design custom courses, organize folders/modules, attach video lectures, and build interactive quizzes.
              </p>
            </div>
          </div>

          <button onClick={onClose} className="ghost-btn" style={{ padding: '8px', borderRadius: '50%' }}>
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '28px 30px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Metadata Section */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '18px'
          }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-muted)' }}>
                COURSE TITLE *
              </label>
              <input
                type="text"
                placeholder="e.g. Masterclass in Scalable Distributed Systems"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.92rem'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-muted)' }}>
                CATEGORY & FOLDER GROUP
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '11px 14px',
                    background: 'var(--bg-primary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    color: '#fff',
                    fontSize: '0.92rem'
                  }}
                >
                  {existingCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                  <option value="Custom">+ Create New Category</option>
                </select>

                {category === 'Custom' && (
                  <input
                    type="text"
                    placeholder="New Category Name..."
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value)}
                    style={{
                      flex: 1,
                      padding: '11px 14px',
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-glow)',
                      borderRadius: 'var(--radius-md)',
                      color: '#fff',
                      fontSize: '0.92rem'
                    }}
                  />
                )}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-muted)' }}>
                DIFFICULTY LEVEL
              </label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.92rem'
                }}
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="All Levels">All Levels</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-muted)' }}>
                ESTIMATED COMPLETION TIME
              </label>
              <input
                type="text"
                placeholder="e.g. 5.5 hrs"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  background: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  color: '#fff',
                  fontSize: '0.92rem'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: '700', marginBottom: '6px', color: 'var(--text-muted)' }}>
              SHORT COURSE SYNOPSIS
            </label>
            <textarea
              rows={2}
              placeholder="What will learners achieve upon completing this course?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={{
                width: '100%',
                padding: '11px 14px',
                background: 'rgba(255, 255, 255, 0.04)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                color: '#fff',
                fontSize: '0.92rem',
                resize: 'vertical'
              }}
            />
          </div>

          {/* Module & Folder Builder */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Layers size={18} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '1.15rem' }}>Modules & Lessons Hierarchy</h3>
              </div>

              <button
                type="button"
                onClick={handleAddModule}
                className="ghost-btn"
                style={{ borderColor: 'var(--border-glow)', color: 'var(--accent-primary)' }}
              >
                <Plus size={16} />
                Add Module Folder
              </button>
            </div>

            {/* Modules Tabs */}
            <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '10px' }}>
              {modules.map((m, idx) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => { setActiveModuleIndex(idx); soundFX.playClick(); }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--radius-md)',
                    background: activeModuleIndex === idx ? 'var(--accent-gradient)' : 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid',
                    borderColor: activeModuleIndex === idx ? 'var(--border-glow)' : 'var(--border-subtle)',
                    color: '#fff',
                    fontSize: '0.85rem',
                    fontWeight: activeModuleIndex === idx ? '700' : '500',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap'
                  }}
                >
                  {`Mod ${idx + 1} (${m.lessons.length})`}
                </button>
              ))}
            </div>

            {/* Active Module Details */}
            {modules[activeModuleIndex] && (
              <div style={{
                padding: '20px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                marginTop: '10px'
              }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <input
                    type="text"
                    value={modules[activeModuleIndex].title}
                    onChange={(e) => {
                      const updated = [...modules];
                      updated[activeModuleIndex].title = e.target.value;
                      setModules(updated);
                    }}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      background: 'rgba(255, 255, 255, 0.05)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      color: '#fff',
                      fontSize: '1rem',
                      fontWeight: '700'
                    }}
                  />

                  {modules.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveModule(activeModuleIndex)}
                      className="ghost-btn"
                      style={{ color: '#f43f5e' }}
                      title="Delete this module"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* Lessons in this module */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {modules[activeModuleIndex].lessons.map((lesson, lIdx) => (
                    <div
                      key={lesson.id}
                      style={{
                        padding: '16px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '12px'
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '0.72rem',
                          fontWeight: '800',
                          textTransform: 'uppercase',
                          background: lesson.type === 'video' ? 'rgba(56, 189, 248, 0.15)' : lesson.type === 'quiz' ? 'rgba(236, 72, 153, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                          color: lesson.type === 'video' ? '#38bdf8' : lesson.type === 'quiz' ? '#ec4899' : '#10b981'
                        }}>
                          {lesson.type}
                        </span>

                        <input
                          type="text"
                          value={lesson.title}
                          onChange={(e) => {
                            const updated = [...modules];
                            updated[activeModuleIndex].lessons[lIdx].title = e.target.value;
                            setModules(updated);
                          }}
                          placeholder="Lesson Title"
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            background: 'rgba(255, 255, 255, 0.04)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            color: '#fff',
                            fontSize: '0.9rem'
                          }}
                        />

                        <span style={{ fontSize: '0.8rem', color: '#fbbf24', fontWeight: '700' }}>
                          +{lesson.xp} XP
                        </span>

                        <button
                          type="button"
                          onClick={() => handleRemoveLesson(activeModuleIndex, lIdx)}
                          className="ghost-btn"
                          style={{ padding: '6px 10px', color: '#f43f5e' }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Video configuration */}
                      {lesson.type === 'video' && (
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
                          <input
                            type="text"
                            placeholder="Video Stream URL (MP4, HLS, or WebM)"
                            value={lesson.videoUrl || ''}
                            onChange={(e) => {
                              const updated = [...modules];
                              updated[activeModuleIndex].lessons[lIdx].videoUrl = e.target.value;
                              setModules(updated);
                            }}
                            style={{
                              flex: 1,
                              minWidth: '220px',
                              padding: '8px 12px',
                              background: 'rgba(0, 0, 0, 0.3)',
                              border: '1px solid var(--border-subtle)',
                              borderRadius: 'var(--radius-sm)',
                              color: '#fff',
                              fontSize: '0.85rem'
                            }}
                          />
                          <label className="ghost-btn" style={{ fontSize: '0.8rem', cursor: 'pointer', padding: '8px 12px' }}>
                            Upload Local Video
                            <input
                              type="file"
                              accept="video/*"
                              style={{ display: 'none' }}
                              onChange={(e) => handleLocalVideoUpload(activeModuleIndex, lIdx, e.target.files?.[0])}
                            />
                          </label>
                        </div>
                      )}

                      {/* Markdown content */}
                      {lesson.type !== 'quiz' && (
                        <textarea
                          rows={2}
                          placeholder="Lesson Markdown text, guidelines, or code examples..."
                          value={lesson.contentMarkdown || ''}
                          onChange={(e) => {
                            const updated = [...modules];
                            updated[activeModuleIndex].lessons[lIdx].contentMarkdown = e.target.value;
                            setModules(updated);
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            background: 'rgba(0, 0, 0, 0.25)',
                            border: '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)',
                            color: '#e2e8f0',
                            fontSize: '0.85rem',
                            fontFamily: 'var(--font-mono)'
                          }}
                        />
                      )}
                    </div>
                  ))}

                  {/* Add Lesson Buttons */}
                  <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
                    <button
                      type="button"
                      onClick={() => handleAddLesson(activeModuleIndex, 'video')}
                      className="ghost-btn"
                      style={{ fontSize: '0.82rem' }}
                    >
                      <Video size={14} color="#38bdf8" />
                      + Video Lesson
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddLesson(activeModuleIndex, 'markdown')}
                      className="ghost-btn"
                      style={{ fontSize: '0.82rem' }}
                    >
                      <FileText size={14} color="#10b981" />
                      + Notes / Markdown
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddLesson(activeModuleIndex, 'quiz')}
                      className="ghost-btn"
                      style={{ fontSize: '0.82rem' }}
                    >
                      <Brain size={14} color="#ec4899" />
                      + Interactive Quiz
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{
          padding: '20px 30px',
          borderTop: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(0, 0, 0, 0.3)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fbbf24', fontSize: '0.88rem', fontWeight: '700' }}>
            <Sparkles size={16} />
            Publishing grants +350 Creator XP & unlocks "Master Architect" badge!
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="button" onClick={onClose} className="ghost-btn">
              Cancel
            </button>
            <button type="button" onClick={handleSubmit} className="glow-btn">
              <Save size={17} />
              Publish Course
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

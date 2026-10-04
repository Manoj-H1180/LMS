'use client';

import React, { useState, useMemo } from 'react';
import {
  Star,
  Highlighter,
  BookOpen,
  Search,
  ExternalLink,
  Copy,
  Check,
  Trash2,
  Edit3,
  Plus,
  X
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';
import { saveUser } from '../../utils/storage';
import NotionNotesEditor from '../Notes/NotionNotesEditor';

export default function StudyNotesView({ user, onUpdateUser, courses = [], onSelectCourse }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all'); // 'all' | 'important' | 'highlights'
  const [copiedId, setCopiedId] = useState(null);
  const [activeModalNote, setActiveModalNote] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [selectedCourseLesson, setSelectedCourseLesson] = useState('');

  // Collect all unique lesson IDs that have notes, highlights, or are marked important
  const noteLessonIds = useMemo(() => {
    const ids = new Set();
    // From lessonNotes
    Object.entries(user.lessonNotes || {}).forEach(([id, text]) => {
      if (text && typeof text === 'string' && text.trim()) ids.add(id);
    });
    // From courseHighlights
    Object.entries(user.courseHighlights || {}).forEach(([id, hls]) => {
      if (Array.isArray(hls) && hls.length > 0) ids.add(id);
    });
    // From importantLessons
    (user.importantLessons || []).forEach(id => ids.add(id));

    return Array.from(ids);
  }, [user.lessonNotes, user.courseHighlights, user.importantLessons]);

  // Map each lesson ID to its course, lesson object, notes, highlights, and importance
  const items = useMemo(() => {
    return noteLessonIds.map(lessonId => {
      let foundCourse = null;
      let foundLesson = null;

      for (const course of courses) {
        for (const mod of (course.modules || [])) {
          for (const les of (mod.lessons || [])) {
            if (les.id === lessonId) {
              foundCourse = course;
              foundLesson = { ...les, moduleTitle: mod.title };
              break;
            }
          }
          if (foundLesson) break;
        }
        if (foundLesson) break;
      }

      const noteText = user.lessonNotes?.[lessonId] || '';
      const highlights = user.courseHighlights?.[lessonId] || [];
      const isImportant = (user.importantLessons || []).includes(lessonId) || highlights.some(h => h.isImportant || h.color === 'amber');

      // Resolve a meaningful title if foundLesson is null (e.g. standalone Notion page)
      let resolvedTitle = foundLesson?.title;
      if (!resolvedTitle) {
        const match = noteText.match(/^#\s+(.+)$/m);
        resolvedTitle = match ? match[1].trim() : (lessonId.startsWith('freeform_') ? 'Personal Notion Study Sheet' : 'Saved Study Item');
      }

      return {
        lessonId,
        course: foundCourse,
        lesson: foundLesson ? foundLesson : { id: lessonId, title: resolvedTitle },
        noteText,
        highlights,
        isImportant
      };
    });
  }, [noteLessonIds, courses, user.lessonNotes, user.courseHighlights, user.importantLessons]);

  // Filtered items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Filter tab
      if (filterType === 'important' && !item.isImportant) return false;
      if (filterType === 'highlights' && item.highlights.length === 0) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inCourse = item.course?.title?.toLowerCase().includes(q);
        const inLesson = item.lesson?.title?.toLowerCase().includes(q);
        const inNote = item.noteText.toLowerCase().includes(q);
        const inHl = item.highlights.some(h => h.text?.toLowerCase().includes(q) || h.note?.toLowerCase().includes(q));
        return inCourse || inLesson || inNote || inHl;
      }
      return true;
    });
  }, [items, filterType, searchQuery]);

  // Flatten all available lessons across courses for quick linking
  const allAvailableLessons = useMemo(() => {
    const list = [];
    courses.forEach(c => {
      (c.modules || []).forEach(m => {
        (m.lessons || []).forEach(l => {
          list.push({
            courseId: c.id,
            courseTitle: c.title,
            lessonId: l.id,
            lessonTitle: l.title
          });
        });
      });
    });
    return list;
  }, [courses]);

  // Metrics
  const totalNotesCount = items.filter(i => i.noteText.trim()).length;
  const totalImportantCount = items.filter(i => i.isImportant).length;
  const totalHighlightsCount = items.reduce((acc, i) => acc + i.highlights.length, 0);

  const handleToggleImportant = (lessonId) => {
    const existing = user.importantLessons || [];
    const isAlready = existing.includes(lessonId);
    const updated = isAlready ? existing.filter(id => id !== lessonId) : [...existing, lessonId];

    if (!isAlready) {
      if (soundFX.playStar) soundFX.playStar();
      else soundFX.playClick();
    } else {
      soundFX.playClick();
    }

    const updatedUser = {
      ...user,
      importantLessons: updated
    };
    onUpdateUser(updatedUser);
    saveUser(updatedUser);

    if (activeModalNote && activeModalNote.lessonId === lessonId) {
      setActiveModalNote(prev => prev ? { ...prev, isImportant: !isAlready } : null);
    }
  };

  const handleSaveNote = (lessonId, newMarkdown) => {
    const updatedUser = {
      ...user,
      lessonNotes: {
        ...(user.lessonNotes || {}),
        [lessonId]: newMarkdown
      }
    };
    onUpdateUser(updatedUser);
    saveUser(updatedUser);

    if (activeModalNote && activeModalNote.lessonId === lessonId) {
      setActiveModalNote(prev => prev ? { ...prev, noteText: newMarkdown } : null);
    }
  };

  const handleDeleteNote = (lessonId) => {
    if (confirm('Are you sure you want to delete this study note? Highlights will be preserved.')) {
      soundFX.playClick();
      const newLessonNotes = { ...(user.lessonNotes || {}) };
      delete newLessonNotes[lessonId];

      const updatedUser = {
        ...user,
        lessonNotes: newLessonNotes
      };
      onUpdateUser(updatedUser);
      saveUser(updatedUser);

      if (activeModalNote && activeModalNote.lessonId === lessonId) {
        setActiveModalNote(null);
      }
    }
  };

  const handleCreateNewPage = (type) => {
    soundFX.playClick();
    if (type === 'lesson' && selectedCourseLesson) {
      const match = allAvailableLessons.find(l => l.lessonId === selectedCourseLesson);
      if (match) {
        const existingNote = user.lessonNotes?.[match.lessonId] || '';
        const isImp = (user.importantLessons || []).includes(match.lessonId);
        setActiveModalNote({
          lessonId: match.lessonId,
          lessonTitle: match.lessonTitle,
          courseTitle: match.courseTitle,
          isImportant: isImp,
          noteText: existingNote || `# ${match.lessonTitle}\n\n- [ ] Review Core Concepts\n- [ ] Practice Problems\n\n> ⭐ **IMPORTANT:** Focus on high-yield takeaways.`
        });
        setShowCreateModal(false);
        return;
      }
    }

    // Default: Standalone Notion Page
    const pageId = `freeform_${Date.now()}`;
    const pageTitle = newNoteTitle.trim() || 'Exam Revision & Study Sheet';
    const initialText = `# ${pageTitle}\n\n> ⭐ **IMPORTANT:** Key exam takeaways & memory hooks.\n\n- [ ] Master core definitions\n- [ ] Solve revision questions\n- [ ] Practice code snippets\n\n`;

    handleSaveNote(pageId, initialText);
    setActiveModalNote({
      lessonId: pageId,
      lessonTitle: pageTitle,
      courseTitle: 'Personal Notion Workspace',
      isImportant: false,
      noteText: initialText
    });
    setNewNoteTitle('');
    setSelectedCourseLesson('');
    setShowCreateModal(false);
  };

  const handleCopyStudyCard = (item) => {
    soundFX.playClick();
    const title = item.lesson?.title || 'Lesson Study Notes';
    const courseTitle = item.course?.title || '';
    let text = `# ${title} (${courseTitle})\n\n`;
    if (item.isImportant) text += `⭐ **STATUS: HIGH PRIORITY / IMPORTANT**\n\n`;
    if (item.noteText) text += `## Notes\n${item.noteText}\n\n`;
    if (item.highlights.length > 0) {
      text += `## Key Highlights & Concepts\n`;
      item.highlights.forEach(h => {
        text += `- "${h.text}"${h.note ? ` (Note: ${h.note})` : ''}\n`;
      });
    }
    navigator.clipboard.writeText(text);
    setCopiedId(item.lessonId);
    setTimeout(() => setCopiedId(null), 1800);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Top Banner & Stats */}
      <div className="glass-panel" style={{ padding: '26px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(99, 102, 241, 0.25))',
                border: '1px solid rgba(245, 158, 11, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <BookOpen size={18} color="#fbbf24" />
              </div>
              <h1 style={{ color: '#fff', fontSize: '1.7rem' }}>My Study Notes & Highlights</h1>
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              All your key takeaways, marked important concepts, and Notion-style documents in one place for rapid revision.
            </p>
          </div>

          {/* Quick Metrics & New Page Action */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <div className="study-metric-card">
              <span className="study-metric-val" style={{ color: '#fbbf24' }}>
                <Star size={16} fill="#fbbf24" style={{ display: 'inline', marginRight: '4px' }} />
                {totalImportantCount}
              </span>
              <span className="study-metric-lbl">Important</span>
            </div>
            <div className="study-metric-card">
              <span className="study-metric-val" style={{ color: '#38bdf8' }}>{totalNotesCount}</span>
              <span className="study-metric-lbl">Notion Notes</span>
            </div>
            <div className="study-metric-card">
              <span className="study-metric-val" style={{ color: '#34d399' }}>{totalHighlightsCount}</span>
              <span className="study-metric-lbl">Highlights</span>
            </div>

            <button
              onClick={() => { soundFX.playClick(); setShowCreateModal(true); }}
              className="glow-btn"
              style={{ padding: '8px 16px', fontSize: '0.86rem', gap: '6px' }}
            >
              <Plus size={15} />
              <span>+ New Notion Note</span>
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        {/* Search Input */}
        <div style={{ position: 'relative', minWidth: '280px', flex: 1, maxWidth: '450px' }}>
          <Search size={16} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords, concepts, notes, or quotes..."
            className="search-input"
            style={{ width: '100%', paddingLeft: '38px', height: '40px', fontSize: '0.88rem' }}
          />
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => setFilterType('all')}
            className={`notes-filter-btn ${filterType === 'all' ? 'active' : ''}`}
          >
            All Items ({items.length})
          </button>
          <button
            onClick={() => setFilterType('important')}
            className={`notes-filter-btn ${filterType === 'important' ? 'active' : ''}`}
            style={{ color: filterType === 'important' ? '#fbbf24' : undefined }}
          >
            <Star size={13} fill={filterType === 'important' ? '#fbbf24' : 'none'} color="#fbbf24" />
            ⭐ Important Only ({totalImportantCount})
          </button>
          <button
            onClick={() => setFilterType('highlights')}
            className={`notes-filter-btn ${filterType === 'highlights' ? 'active' : ''}`}
          >
            <Highlighter size={13} color="var(--accent-primary)" />
            Highlights ({items.filter(i => i.highlights.length > 0).length})
          </button>
        </div>
      </div>

      {/* Notes & Highlights Cards Grid */}
      {filteredItems.length > 0 ? (
        <div className="courses-responsive-grid">
          {filteredItems.map(item => {
            const hasHighlights = item.highlights.length > 0;
            return (
              <article
                key={item.lessonId}
                className={`glass-panel study-note-card ${item.isImportant ? 'important-card-glow' : ''}`}
                style={{
                  padding: '22px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  position: 'relative'
                }}
              >
                {/* Header */}
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                  <div>
                    <span style={{ fontSize: '0.74rem', color: 'var(--accent-primary)', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {item.course?.title || 'Personal Notion Workspace'}
                    </span>
                    <h2 style={{ fontSize: '1.15rem', color: '#fff', marginTop: '4px', fontWeight: '700' }}>
                      {item.lesson?.title || 'Saved Study Item'}
                    </h2>
                    {item.lesson?.moduleTitle && (
                      <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)' }}>
                        Module: {item.lesson.moduleTitle}
                      </span>
                    )}
                  </div>

                  {/* Mark as Important Star Toggle */}
                  <button
                    onClick={() => handleToggleImportant(item.lessonId)}
                    className={`ghost-btn ${item.isImportant ? 'card-star-active' : ''}`}
                    style={{
                      padding: '6px 10px',
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                      color: item.isImportant ? '#fbbf24' : 'var(--text-dim)',
                      borderColor: item.isImportant ? 'rgba(245, 158, 11, 0.4)' : undefined,
                      background: item.isImportant ? 'rgba(245, 158, 11, 0.15)' : undefined
                    }}
                    title={item.isImportant ? 'Click to unmark as important' : 'Click to mark as important'}
                  >
                    <Star size={14} fill={item.isImportant ? '#fbbf24' : 'none'} color={item.isImportant ? '#fbbf24' : 'currentColor'} />
                    <span>{item.isImportant ? 'Important' : 'Mark'}</span>
                  </button>
                </div>

                {/* Study Notes Text Body */}
                {item.noteText ? (
                  <div className="study-note-text-body">
                    <p style={{
                      color: '#cbd5e1',
                      fontSize: '0.88rem',
                      lineHeight: 1.6,
                      whiteSpace: 'pre-wrap',
                      overflowWrap: 'anywhere'
                    }}>
                      {item.noteText}
                    </p>
                  </div>
                ) : (
                  <div style={{
                    padding: '12px',
                    borderRadius: '8px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px dashed var(--border-subtle)',
                    textAlign: 'center'
                  }}>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                      No Notion note written yet for this lesson.
                    </span>
                  </div>
                )}

                {/* Highlighted Text Quotes & Notes */}
                {hasHighlights && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                    <div style={{ fontSize: '0.76rem', color: 'var(--text-dim)', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Highlighter size={12} color="#f59e0b" />
                      Marked Course Content Highlights ({item.highlights.length}):
                    </div>
                    {item.highlights.map(hl => {
                      const isImp = hl.isImportant || hl.color === 'amber';
                      const colorBorder = hl.color === 'emerald' ? '#10b981' : hl.color === 'cyan' ? '#06b6d4' : hl.color === 'purple' ? '#a855f7' : hl.color === 'rose' ? '#f43f5e' : '#f59e0b';
                      return (
                        <div
                          key={hl.id}
                          style={{
                            background: 'rgba(0, 0, 0, 0.25)',
                            padding: '10px 12px',
                            borderRadius: '8px',
                            borderLeft: `3px solid ${colorBorder}`,
                            border: '1px solid var(--border-subtle)',
                            borderLeftWidth: '3px',
                            borderLeftColor: colorBorder
                          }}
                        >
                          <div style={{ fontSize: '0.82rem', color: '#f8fafc', fontStyle: 'italic', marginBottom: hl.note ? '4px' : '0' }}>
                            {isImp && <span style={{ marginRight: '4px' }}>⭐</span>}
                            "{hl.text}"
                          </div>
                          {hl.note && (
                            <div style={{ fontSize: '0.76rem', color: '#fbbf24', background: 'rgba(245, 158, 11, 0.1)', padding: '3px 8px', borderRadius: '4px', marginTop: '4px' }}>
                              📝 Note: {hl.note}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Footer Actions */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: 'auto',
                  paddingTop: '12px',
                  borderTop: '1px solid var(--border-subtle)',
                  gap: '8px',
                  flexWrap: 'wrap'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => handleCopyStudyCard(item)}
                      className="ghost-btn"
                      style={{ padding: '6px 10px', fontSize: '0.78rem', gap: '5px' }}
                      title="Copy full study note"
                    >
                      {copiedId === item.lessonId ? <Check size={13} color="#10b981" /> : <Copy size={13} />}
                      <span>{copiedId === item.lessonId ? 'Copied' : 'Copy'}</span>
                    </button>

                    {item.noteText && (
                      <button
                        onClick={() => handleDeleteNote(item.lessonId)}
                        className="ghost-btn"
                        style={{ padding: '6px 8px', fontSize: '0.78rem', color: 'var(--text-dim)' }}
                        title="Delete note text"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => {
                        soundFX.playClick();
                        setActiveModalNote({
                          lessonId: item.lessonId,
                          lessonTitle: item.lesson?.title || 'Study Note',
                          courseTitle: item.course?.title || 'Personal Notion Workspace',
                          isImportant: item.isImportant,
                          noteText: item.noteText
                        });
                      }}
                      className="ghost-btn"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.78rem',
                        gap: '6px',
                        borderColor: 'rgba(99, 102, 241, 0.4)',
                        background: 'rgba(99, 102, 241, 0.12)',
                        color: '#a5b4fc'
                      }}
                    >
                      <Edit3 size={13} />
                      <span>Edit in Notion</span>
                    </button>

                    {item.course && (
                      <button
                        onClick={() => onSelectCourse && onSelectCourse(item.course)}
                        className="glow-btn"
                        style={{ padding: '6px 12px', fontSize: '0.78rem', gap: '6px' }}
                      >
                        <span>Open Lesson</span>
                        <ExternalLink size={12} />
                      </button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        /* Empty State */
        <div className="glass-panel" style={{ padding: '48px 24px', textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'rgba(245, 158, 11, 0.12)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px'
          }}>
            <Star size={24} color="#f59e0b" />
          </div>
          <h2 style={{ fontSize: '1.25rem', color: '#fff', marginBottom: '8px' }}>
            {searchQuery ? 'No matching notes or highlights found' : 'No Study Notes or Marked Concepts Yet'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', maxWidth: '480px', margin: '0 auto 20px', lineHeight: 1.6 }}>
            {searchQuery
              ? `No notes matched "${searchQuery}". Try a different keyword or reset filters.`
              : 'Take Notion-style rich notes with slash commands, checklists, and callouts, or highlight text directly in course lessons!'}
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '10px' }}>
            {searchQuery ? (
              <button onClick={() => setSearchQuery('')} className="ghost-btn">
                Clear Search
              </button>
            ) : (
              <button
                onClick={() => { soundFX.playClick(); setShowCreateModal(true); }}
                className="glow-btn"
                style={{ padding: '8px 18px', fontSize: '0.88rem', gap: '6px' }}
              >
                <Plus size={15} />
                <span>Create First Notion Note</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Notion Editor Modal Overlay */}
      {activeModalNote && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 7, 15, 0.85)',
            backdropFilter: 'blur(12px)',
            zIndex: 9990,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setActiveModalNote(null)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '920px',
              maxHeight: '92vh',
              overflowY: 'auto',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              boxShadow: '0 25px 60px rgba(0, 0, 0, 0.9), 0 0 40px rgba(99, 102, 241, 0.3)',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ position: 'absolute', top: '14px', right: '14px', zIndex: 50 }}>
              <button
                onClick={() => setActiveModalNote(null)}
                className="ghost-btn"
                style={{
                  width: '32px',
                  height: '32px',
                  padding: 0,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(0, 0, 0, 0.6)'
                }}
                title="Close Notion Modal"
              >
                <X size={16} />
              </button>
            </div>

            <NotionNotesEditor
              initialMarkdown={activeModalNote.noteText || ''}
              lessonTitle={activeModalNote.lessonTitle}
              courseTitle={activeModalNote.courseTitle}
              isImportant={activeModalNote.isImportant}
              onToggleImportant={() => handleToggleImportant(activeModalNote.lessonId)}
              onChange={(newMarkdown) => handleSaveNote(activeModalNote.lessonId, newMarkdown)}
              onSave={(newMarkdown) => handleSaveNote(activeModalNote.lessonId, newMarkdown)}
            />
          </div>
        </div>
      )}

      {/* Create New Notion Note Modal */}
      {showCreateModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(5, 7, 15, 0.85)',
            backdropFilter: 'blur(10px)',
            zIndex: 9991,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px'
          }}
          onClick={() => setShowCreateModal(false)}
        >
          <div
            className="glass-panel"
            style={{
              width: '100%',
              maxWidth: '520px',
              padding: '28px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.16)',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.85)',
              position: 'relative'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '1.5rem' }}>📝</span>
                <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: '700' }}>Create Notion Study Page</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="ghost-btn"
                style={{ width: '28px', height: '28px', padding: 0, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Option A: Link to specific Course Lesson */}
            {allAvailableLessons.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600' }}>
                  Option A: Take Notes for a Specific Lesson
                </label>
                <select
                  value={selectedCourseLesson}
                  onChange={(e) => setSelectedCourseLesson(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'rgba(15, 20, 36, 0.95)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '8px',
                    padding: '10px 12px',
                    color: '#fff',
                    fontSize: '0.88rem',
                    outline: 'none',
                    marginBottom: '10px'
                  }}
                >
                  <option value="">-- Choose a course lesson --</option>
                  {allAvailableLessons.map(l => (
                    <option key={l.lessonId} value={l.lessonId}>
                      {l.courseTitle} » {l.lessonTitle}
                    </option>
                  ))}
                </select>
                {selectedCourseLesson && (
                  <button
                    onClick={() => handleCreateNewPage('lesson')}
                    className="glow-btn"
                    style={{ width: '100%', padding: '10px', fontSize: '0.88rem' }}
                  >
                    Open Lesson Study Notes
                  </button>
                )}
              </div>
            )}

            {/* Divider */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '20px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
              <span style={{ fontSize: '0.74rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--border-subtle)' }} />
            </div>

            {/* Option B: Freeform Study Document */}
            <div>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: '8px', fontWeight: '600' }}>
                Option B: Freeform Notion Study / Cheatsheet Document
              </label>
              <input
                type="text"
                placeholder="e.g. System Design Exam Cheatsheet"
                value={newNoteTitle}
                onChange={(e) => setNewNoteTitle(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(15, 20, 36, 0.95)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '10px 12px',
                  color: '#fff',
                  fontSize: '0.88rem',
                  outline: 'none',
                  marginBottom: '12px'
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreateNewPage('freeform');
                }}
              />
              <button
                onClick={() => handleCreateNewPage('freeform')}
                className="glow-btn"
                style={{ width: '100%', padding: '10px', fontSize: '0.88rem' }}
              >
                Create Notion Study Document
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

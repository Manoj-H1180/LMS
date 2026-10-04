'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Star,
  Highlighter,
  Edit3,
  Trash2,
  Copy,
  Check,
  Plus,
  BookOpen,
  Sparkles,
  HelpCircle,
  X,
  MessageSquare,
  AlertTriangle,
  Lightbulb,
  ExternalLink
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

const HIGHLIGHT_COLORS = [
  { id: 'amber', label: '⭐ Important Concept', bg: 'rgba(245, 158, 11, 0.28)', border: '#f59e0b', color: '#fbbf24', dot: '#f59e0b' },
  { id: 'emerald', label: '📌 Key Takeaway', bg: 'rgba(16, 185, 129, 0.25)', border: '#10b981', color: '#34d399', dot: '#10b981' },
  { id: 'cyan', label: '⚡ Code & Formula', bg: 'rgba(6, 182, 212, 0.25)', border: '#06b6d4', color: '#38bdf8', dot: '#06b6d4' },
  { id: 'purple', label: '💡 Pro Tip', bg: 'rgba(168, 85, 247, 0.25)', border: '#a855f7', color: '#c084fc', dot: '#a855f7' },
  { id: 'rose', label: '⚠️ Exam Caution', bg: 'rgba(244, 63, 94, 0.25)', border: '#f43f5e', color: '#fb7185', dot: '#f43f5e' }
];

export default function CourseContentReader({
  content,
  lesson,
  highlights = [],
  onAddHighlight,
  onRemoveHighlight,
  onUpdateHighlight,
  isLessonImportant = false,
  onToggleLessonImportant,
  onOpenNotes
}) {
  const containerRef = useRef(null);
  const [selectedText, setSelectedText] = useState('');
  const [selectionRange, setSelectionRange] = useState(null);
  const [floatingPos, setFloatingPos] = useState(null);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteDraft, setNoteDraft] = useState('');
  const [activeHighlight, setActiveHighlight] = useState(null);
  const [activeHighlightPos, setActiveHighlightPos] = useState(null);
  const [editNoteDraft, setEditNoteDraft] = useState('');
  const [activeColor, setActiveColor] = useState('amber');
  const [copiedHighlightId, setCopiedHighlightId] = useState(null);
  const [customTakeawayText, setCustomTakeawayText] = useState('');
  const [showTakeawayInput, setShowTakeawayInput] = useState(false);

  // Normalize content text
  const rawText = useMemo(() => {
    if (content && typeof content === 'string' && content.trim()) {
      return content.trim();
    }
    return '';
  }, [content]);

  // Count metrics
  const wordCount = useMemo(() => {
    return rawText ? rawText.split(/\s+/).filter(Boolean).length : 0;
  }, [rawText]);
  const estimatedReadMinutes = Math.max(1, Math.ceil(wordCount / 180));
  const importantCount = highlights.filter(h => h.isImportant || h.color === 'amber').length;

  // Handle text selection inside the content reader
  const handleMouseUp = useCallback(() => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      if (!showNoteInput) {
        setFloatingPos(null);
        setSelectedText('');
        setSelectionRange(null);
      }
      return;
    }

    const text = sel.toString().trim();
    if (text.length < 2) {
      setFloatingPos(null);
      setSelectedText('');
      setSelectionRange(null);
      return;
    }

    // Verify selection is within our container
    const container = containerRef.current;
    if (!container) return;
    const range = sel.getRangeAt(0);
    if (!container.contains(range.commonAncestorContainer)) return;

    const rect = range.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();

    setSelectedText(text);
    setSelectionRange(range);
    setFloatingPos({
      top: Math.max(8, rect.top - containerRect.top - 54),
      left: Math.max(12, Math.min(containerRect.width - 290, rect.left - containerRect.left + (rect.width / 2) - 130))
    });
  }, [showNoteInput]);

  // Click outside to dismiss floating popover
  useEffect(() => {
    const handleDocumentClick = (e) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target) &&
        !e.target.closest('.lms-selection-popover') &&
        !e.target.closest('.lms-highlight-detail-card')
      ) {
        setFloatingPos(null);
        setSelectedText('');
        setShowNoteInput(false);
        setActiveHighlight(null);
      }
    };
    document.addEventListener('mousedown', handleDocumentClick);
    return () => document.removeEventListener('mousedown', handleDocumentClick);
  }, []);

  // Create highlight from current selection
  const handleApplyHighlight = (color = 'amber', isImportant = false, attachedNote = '') => {
    if (!selectedText) return;
    soundFX.playStar ? soundFX.playStar() : soundFX.playClick();

    const newHl = {
      id: `hl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      lessonId: lesson.id,
      text: selectedText,
      color,
      note: attachedNote.trim(),
      isImportant: isImportant || color === 'amber',
      createdAt: Date.now()
    };

    onAddHighlight(newHl);

    // If marked important, ensure lesson has importance flag
    if ((isImportant || color === 'amber') && !isLessonImportant && onToggleLessonImportant) {
      onToggleLessonImportant();
    }

    // Clear selection
    setFloatingPos(null);
    setSelectedText('');
    setShowNoteInput(false);
    setNoteDraft('');
    window.getSelection()?.removeAllRanges();
  };

  // Add custom takeaway / key point directly
  const handleAddCustomTakeaway = (isImportant = true) => {
    if (!customTakeawayText.trim()) return;
    soundFX.playStar ? soundFX.playStar() : soundFX.playClick();

    const newHl = {
      id: `hl_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      lessonId: lesson.id,
      text: customTakeawayText.trim(),
      color: activeColor,
      note: 'User-added key takeaway',
      isImportant,
      createdAt: Date.now()
    };

    onAddHighlight(newHl);
    setCustomTakeawayText('');
    setShowTakeawayInput(false);
  };

  // Click on existing highlighted span in text
  const handleHighlightSpanClick = (e, hl) => {
    e.stopPropagation();
    soundFX.playClick();
    const rect = e.currentTarget.getBoundingClientRect();
    const container = containerRef.current;
    if (container) {
      const containerRect = container.getBoundingClientRect();
      setActiveHighlightPos({
        top: rect.bottom - containerRect.top + 8,
        left: Math.max(10, Math.min(containerRect.width - 310, rect.left - containerRect.left))
      });
    }
    setActiveHighlight(hl);
    setEditNoteDraft(hl.note || '');
  };

  // Render text content with embedded highlights & markdown-like parsing
  const renderContentWithHighlights = () => {
    if (!rawText) return null;

    // Split text into paragraphs
    const paragraphs = rawText.split(/\n\s*\n/);

    return paragraphs.map((para, pIdx) => {
      const trimmedPara = para.trim();
      if (!trimmedPara) return null;

      // Handle Markdown headers
      if (trimmedPara.startsWith('### ')) {
        return (
          <h3 key={pIdx} className="lms-content-h3">
            {renderFormattedInline(trimmedPara.replace(/^###\s+/, ''))}
          </h3>
        );
      }
      if (trimmedPara.startsWith('## ')) {
        return (
          <h2 key={pIdx} className="lms-content-h2">
            {renderFormattedInline(trimmedPara.replace(/^##\s+/, ''))}
          </h2>
        );
      }
      if (trimmedPara.startsWith('# ')) {
        return (
          <h1 key={pIdx} className="lms-content-h1">
            {renderFormattedInline(trimmedPara.replace(/^#\s+/, ''))}
          </h1>
        );
      }

      // Handle Blockquotes / Callouts
      if (trimmedPara.startsWith('> ')) {
        const isImportantCallout = trimmedPara.toLowerCase().includes('important') || trimmedPara.includes('⭐');
        return (
          <blockquote 
            key={pIdx} 
            className={`lms-content-blockquote ${isImportantCallout ? 'callout-important' : ''}`}
          >
            {renderFormattedInline(trimmedPara.replace(/^>\s*/, ''))}
          </blockquote>
        );
      }

      // Handle Bullet lists
      if (trimmedPara.split('\n').every(line => /^\s*[-*•]\s+/.test(line))) {
        const items = trimmedPara.split('\n').filter(Boolean);
        return (
          <ul key={pIdx} className="lms-content-list">
            {items.map((item, iIdx) => (
              <li key={iIdx}>
                {renderFormattedInline(item.replace(/^\s*[-*•]\s+/, ''))}
              </li>
            ))}
          </ul>
        );
      }

      // Handle Code blocks
      if (trimmedPara.startsWith('```') && trimmedPara.endsWith('```')) {
        const lines = trimmedPara.split('\n');
        const lang = lines[0].replace('```', '').trim();
        const code = lines.slice(1, -1).join('\n');
        return (
          <div key={pIdx} className="lms-content-code-block">
            {lang && <div className="code-lang-tag">{lang}</div>}
            <pre><code>{code}</code></pre>
          </div>
        );
      }

      // Standard Paragraph with inline formatting and highlighting
      return (
        <p key={pIdx} className="lms-content-paragraph">
          {renderFormattedInline(trimmedPara)}
        </p>
      );
    });
  };

  // Inline formatting + highlight matching
  const renderFormattedInline = (textStr) => {
    if (!textStr) return '';

    // Check if any highlights match text inside this string
    const matchingHighlights = highlights.filter(h => h.text && textStr.includes(h.text));

    if (matchingHighlights.length === 0) {
      // Basic bold/italic inline parsing
      return renderBasicMarkdownInline(textStr);
    }

    // Sort highlights by their position in textStr
    const occurrences = [];
    matchingHighlights.forEach(hl => {
      let startIndex = 0;
      while ((startIndex = textStr.indexOf(hl.text, startIndex)) !== -1) {
        occurrences.push({
          startIndex,
          endIndex: startIndex + hl.text.length,
          highlight: hl
        });
        startIndex += hl.text.length;
      }
    });

    // Remove overlapping occurrences
    occurrences.sort((a, b) => a.startIndex - b.startIndex);
    const nonOverlapping = [];
    let lastEnd = 0;
    for (const occ of occurrences) {
      if (occ.startIndex >= lastEnd) {
        nonOverlapping.push(occ);
        lastEnd = occ.endIndex;
      }
    }

    if (nonOverlapping.length === 0) {
      return renderBasicMarkdownInline(textStr);
    }

    const elements = [];
    let cursor = 0;

    nonOverlapping.forEach((occ, oIdx) => {
      // Plain text before highlight
      if (occ.startIndex > cursor) {
        elements.push(
          <span key={`txt_${cursor}_${oIdx}`}>
            {renderBasicMarkdownInline(textStr.slice(cursor, occ.startIndex))}
          </span>
        );
      }

      const hl = occ.highlight;
      const isImportant = hl.isImportant || hl.color === 'amber';
      const colorDef = HIGHLIGHT_COLORS.find(c => c.id === hl.color) || HIGHLIGHT_COLORS[0];

      elements.push(
        <mark
          key={hl.id || `hl_${occ.startIndex}_${oIdx}`}
          className={`lms-content-mark color-${hl.color} ${isImportant ? 'is-important' : ''}`}
          style={{
            backgroundColor: colorDef.bg,
            borderBottom: `2px solid ${colorDef.border}`,
            color: '#fff'
          }}
          onClick={(e) => handleHighlightSpanClick(e, hl)}
          title={`Click to view note (${colorDef.label})`}
        >
          {isImportant && <span className="hl-star-indicator">⭐</span>}
          {hl.text}
          {hl.note && <span className="hl-note-indicator" title={`Note: ${hl.note}`}>📝</span>}
        </mark>
      );

      cursor = occ.endIndex;
    });

    // Remainder
    if (cursor < textStr.length) {
      elements.push(
        <span key={`txt_end_${cursor}`}>
          {renderBasicMarkdownInline(textStr.slice(cursor))}
        </span>
      );
    }

    return elements;
  };

  // Helper for bold **word** and code `word`
  const renderBasicMarkdownInline = (str) => {
    if (!str) return '';
    const parts = str.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
    return parts.map((part, pIdx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={pIdx} style={{ color: '#fff', fontWeight: '700' }}>{part.slice(2, -2)}</strong>;
      }
      if (part.startsWith('`') && part.endsWith('`')) {
        return (
          <code 
            key={pIdx} 
            style={{
              background: 'rgba(99, 102, 241, 0.15)',
              padding: '2px 6px',
              borderRadius: '4px',
              color: '#38bdf8',
              fontSize: '0.85em',
              fontFamily: 'var(--font-mono)'
            }}
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return part;
    });
  };

  return (
    <div className="lms-content-reader-wrapper" ref={containerRef} onMouseUp={handleMouseUp}>
      {/* Top Reader Action Bar */}
      <div className="reader-toolbar">
        <div className="reader-meta">
          <div className="reader-title">
            <BookOpen size={16} color="var(--accent-primary)" />
            <span>Course Material & Study Guide</span>
          </div>
          {rawText && (
            <span className="reader-time-badge">
              ~{estimatedReadMinutes} min read ({wordCount} words)
            </span>
          )}
        </div>

        <div className="reader-actions">
          {/* Highlights & Important Status Pills */}
          <button
            onClick={() => onOpenNotes && onOpenNotes('highlights')}
            className={`reader-stat-pill ${importantCount > 0 ? 'important-glow' : ''}`}
            title="View all important highlights in notes drawer"
          >
            <Star size={13} fill={importantCount > 0 ? '#fbbf24' : 'none'} color="#fbbf24" />
            <span>{importantCount} Important</span>
          </button>

          <button
            onClick={() => onOpenNotes && onOpenNotes('highlights')}
            className="reader-stat-pill"
            title="View all highlights"
          >
            <Highlighter size={13} color="var(--accent-primary)" />
            <span>{highlights.length} Highlights</span>
          </button>

          {/* Mark Entire Lesson as Important button */}
          <button
            onClick={() => {
              soundFX.playStar ? soundFX.playStar() : soundFX.playClick();
              onToggleLessonImportant && onToggleLessonImportant();
            }}
            className={`reader-important-toggle-btn ${isLessonImportant ? 'active' : ''}`}
            title={isLessonImportant ? 'Lesson marked as important' : 'Mark this lesson as important for revision'}
          >
            <Star size={14} fill={isLessonImportant ? '#fbbf24' : 'none'} color={isLessonImportant ? '#fbbf24' : 'currentColor'} />
            <span>{isLessonImportant ? '★ Important Lesson' : 'Mark as Important'}</span>
          </button>
        </div>
      </div>

      {/* Highlighter Mode Tip Banner */}
      <div className="highlighter-guide-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={14} color="#f59e0b" />
          <span style={{ fontSize: '0.8rem', color: '#cbd5e1' }}>
            <strong>Interactive Highlighting:</strong> Select any text below to mark as important, pick colors, or attach personal notes!
          </span>
        </div>
        <button
          onClick={() => setShowTakeawayInput(prev => !prev)}
          className="ghost-btn"
          style={{ padding: '4px 10px', fontSize: '0.75rem', gap: '4px' }}
        >
          <Plus size={13} />
          <span>Add Custom Takeaway</span>
        </button>
      </div>

      {/* Custom Takeaway Quick-Input Box */}
      {showTakeawayInput && (
        <div className="custom-takeaway-box glass-panel">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: '700', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Star size={14} fill="#fbbf24" />
              Add Key Takeaway / Exam Formula for this Lesson
            </span>
            <button onClick={() => setShowTakeawayInput(false)} className="ghost-btn" style={{ padding: '2px 6px' }}>
              ✕
            </button>
          </div>
          <textarea
            rows={2}
            value={customTakeawayText}
            onChange={(e) => setCustomTakeawayText(e.target.value)}
            placeholder="Type a key takeaway, formula, definition, or concept to remember..."
            className="custom-takeaway-textarea"
          />
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>Color:</span>
              {HIGHLIGHT_COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => setActiveColor(c.id)}
                  style={{
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    background: c.dot,
                    border: activeColor === c.id ? '2px solid #fff' : '1px solid transparent',
                    cursor: 'pointer'
                  }}
                  title={c.label}
                />
              ))}
            </div>
            <button
              onClick={() => handleAddCustomTakeaway(true)}
              disabled={!customTakeawayText.trim()}
              className="glow-btn"
              style={{ padding: '6px 14px', fontSize: '0.8rem' }}
            >
              <Star size={13} fill="#fbbf24" />
              Save as Important Takeaway
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      {rawText ? (
        <article className="lms-content-article glass-panel">
          {renderContentWithHighlights()}
        </article>
      ) : (
        /* Fallback rich lecture reading guide if markdown is not present */
        <div className="glass-panel" style={{ padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '14px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.2), rgba(99, 102, 241, 0.2))',
              border: '1px solid rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Star size={20} color="#fbbf24" />
            </div>
            <div>
              <h2 style={{ fontSize: '1.25rem', color: '#fff' }}>{lesson.title} — Lecture Notes & Concepts</h2>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>Module: {lesson.moduleTitle || 'General'}</span>
            </div>
          </div>

          <div style={{ color: '#cbd5e1', fontSize: '0.92rem', lineHeight: 1.7, marginBottom: '20px' }}>
            <p style={{ marginBottom: '12px' }}>
              Welcome to <strong>{lesson.title}</strong>. While watching the video or completing activities, capture crucial formulas, syntax, and concepts right here.
            </p>
            <div className="lms-content-blockquote callout-important">
              ⭐ <strong>Study Tip:</strong> Mark key takeaways as <em>Important</em> to highlight them for your final diploma assessment and quick exam review!
            </div>
          </div>

          {/* Quick interactive takeaway creator */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={() => setShowTakeawayInput(true)}
              className="glow-btn"
              style={{ fontSize: '0.82rem', padding: '8px 16px' }}
            >
              <Plus size={14} />
              Add Key Takeaway or Formula
            </button>
            <button
              onClick={() => onOpenNotes && onOpenNotes('notes')}
              className="ghost-btn"
              style={{ fontSize: '0.82rem', padding: '8px 16px' }}
            >
              <Edit3 size={14} />
              Open Lesson Notes Drawer
            </button>
          </div>
        </div>
      )}

      {/* Floating Selection Tooltip Toolbar */}
      {floatingPos && selectedText && (
        <div
          className="lms-selection-popover animate-pop-in"
          style={{ top: `${floatingPos.top}px`, left: `${floatingPos.left}px` }}
        >
          {!showNoteInput ? (
            <div className="popover-row">
              {/* Star / Mark as Important Button */}
              <button
                onClick={() => handleApplyHighlight('amber', true)}
                className="popover-btn-important"
                title="Mark this quote as Important"
              >
                <Star size={14} fill="#fbbf24" color="#fbbf24" />
                <span>Mark Important</span>
              </button>

              {/* Color Swatches */}
              <div className="popover-colors">
                {HIGHLIGHT_COLORS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => handleApplyHighlight(c.id, c.id === 'amber')}
                    className="popover-color-dot"
                    style={{ backgroundColor: c.dot }}
                    title={c.label}
                  />
                ))}
              </div>

              {/* Add Note Button */}
              <button
                onClick={() => setShowNoteInput(true)}
                className="popover-btn-action"
                title="Attach a note to this highlight"
              >
                <MessageSquare size={14} />
                <span>Note</span>
              </button>

              {/* Copy Quote Button */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedText);
                  soundFX.playClick();
                  setFloatingPos(null);
                  setSelectedText('');
                }}
                className="popover-btn-icon"
                title="Copy quote"
              >
                <Copy size={13} />
              </button>

              <button
                onClick={() => {
                  setFloatingPos(null);
                  setSelectedText('');
                }}
                className="popover-btn-icon"
                title="Dismiss"
              >
                <X size={13} />
              </button>
            </div>
          ) : (
            /* Note input sub-panel */
            <div className="popover-note-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '700', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '5px' }}>
                  <Edit3 size={12} />
                  Add Note to Highlight
                </span>
                <button onClick={() => setShowNoteInput(false)} className="ghost-btn" style={{ padding: '1px 5px' }}>
                  ✕
                </button>
              </div>
              <input
                type="text"
                autoFocus
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleApplyHighlight('amber', true, noteDraft);
                  }
                }}
                placeholder="e.g. Remember for final exam..."
                className="popover-note-input"
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '6px' }}>
                <button
                  onClick={() => handleApplyHighlight('amber', true, noteDraft)}
                  className="glow-btn"
                  style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                >
                  <Star size={12} fill="#fbbf24" />
                  Save Note & Mark Important
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Existing Highlight Popover Card when clicked on text */}
      {activeHighlight && activeHighlightPos && (
        <div
          className="lms-highlight-detail-card animate-pop-in"
          style={{ top: `${activeHighlightPos.top}px`, left: `${activeHighlightPos.left}px` }}
        >
          <div className="detail-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                background: HIGHLIGHT_COLORS.find(c => c.id === activeHighlight.color)?.dot || '#f59e0b'
              }} />
              <span style={{ fontSize: '0.78rem', fontWeight: '700', color: '#fff' }}>
                {activeHighlight.isImportant ? '⭐ Important Highlight' : 'Study Highlight'}
              </span>
            </div>
            <button onClick={() => setActiveHighlight(null)} className="ghost-btn" style={{ padding: '2px 6px' }}>
              ✕
            </button>
          </div>

          <div className="detail-quote">
            "{activeHighlight.text}"
          </div>

          {/* Note section */}
          <div className="detail-note-section">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Attached Note:</span>
            </div>
            <textarea
              rows={2}
              value={editNoteDraft}
              onChange={(e) => setEditNoteDraft(e.target.value)}
              placeholder="Add or edit your note on this quote..."
              className="detail-note-textarea"
            />
            {editNoteDraft !== (activeHighlight.note || '') && (
              <button
                onClick={() => {
                  onUpdateHighlight(activeHighlight.id, { note: editNoteDraft.trim() });
                  setActiveHighlight(prev => ({ ...prev, note: editNoteDraft.trim() }));
                  soundFX.playClick();
                }}
                className="glow-btn"
                style={{ padding: '4px 10px', fontSize: '0.72rem', marginTop: '4px' }}
              >
                Save Note Changes
              </button>
            )}
          </div>

          {/* Color Switcher & Actions */}
          <div className="detail-actions">
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              {HIGHLIGHT_COLORS.map(c => (
                <button
                  key={c.id}
                  onClick={() => {
                    const isImp = c.id === 'amber';
                    onUpdateHighlight(activeHighlight.id, { color: c.id, isImportant: isImp });
                    setActiveHighlight(prev => ({ ...prev, color: c.id, isImportant: isImp }));
                    soundFX.playClick();
                  }}
                  className="popover-color-dot"
                  style={{
                    backgroundColor: c.dot,
                    border: activeHighlight.color === c.id ? '2px solid #fff' : 'none'
                  }}
                  title={c.label}
                />
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeHighlight.text);
                  setCopiedHighlightId(activeHighlight.id);
                  soundFX.playClick();
                  setTimeout(() => setCopiedHighlightId(null), 1500);
                }}
                className="ghost-btn"
                style={{ padding: '4px 8px', fontSize: '0.72rem' }}
                title="Copy quote"
              >
                {copiedHighlightId === activeHighlight.id ? <Check size={12} color="#10b981" /> : <Copy size={12} />}
              </button>

              <button
                onClick={() => {
                  onRemoveHighlight(activeHighlight.id);
                  setActiveHighlight(null);
                  soundFX.playClick();
                }}
                className="ghost-btn"
                style={{ padding: '4px 8px', fontSize: '0.72rem', color: '#f43f5e' }}
                title="Remove highlight"
              >
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

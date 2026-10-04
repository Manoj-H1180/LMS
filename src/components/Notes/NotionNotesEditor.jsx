'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Star,
  CheckSquare,
  Square,
  List,
  ListOrdered,
  Code,
  Quote,
  Minus,
  ChevronRight,
  ChevronDown,
  Maximize2,
  Minimize2,
  Plus,
  Trash2,
  Copy,
  Check,
  Sparkles,
  Lightbulb,
  AlertTriangle,
  Bookmark,
  FileText,
  MoreVertical,
  GripVertical,
  Download,
  Share2,
  RotateCcw
} from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

const PAGE_ICONS = ['📝', '⭐', '💡', '🚀', '🧠', '⚡', '🎯', '🧪', '📚', '🔥', '🏆', '💎'];

const COVER_GRADIENTS = [
  { id: 'cyberpunk', label: 'Cyberpunk', bg: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #db2777 100%)' },
  { id: 'midnight', label: 'Midnight Blue', bg: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #312e81 100%)' },
  { id: 'gold', label: 'Exam Gold', bg: 'linear-gradient(135deg, #78350f 0%, #d97706 50%, #fbbf24 100%)' },
  { id: 'emerald', label: 'Emerald Matrix', bg: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)' },
  { id: 'rose', label: 'Neon Rose', bg: 'linear-gradient(135deg, #831843 0%, #e11d48 50%, #fb7185 100%)' }
];

const SLASH_COMMANDS = [
  { id: 'paragraph', label: 'Text', desc: 'Plain writing text paragraph', icon: FileText, category: 'Basic' },
  { id: 'h1', label: 'Heading 1', desc: 'Big section heading', icon: FileText, category: 'Basic' },
  { id: 'h2', label: 'Heading 2', desc: 'Medium section heading', icon: FileText, category: 'Basic' },
  { id: 'h3', label: 'Heading 3', desc: 'Small section heading', icon: FileText, category: 'Basic' },
  { id: 'todo', label: 'To-do List', desc: 'Track tasks with checkboxes', icon: CheckSquare, category: 'Lists' },
  { id: 'bullet', label: 'Bulleted List', desc: 'Simple bullet point list', icon: List, category: 'Lists' },
  { id: 'numbered', label: 'Numbered List', desc: 'Ordered numbered list', icon: ListOrdered, category: 'Lists' },
  { id: 'callout_star', label: '⭐ Important Callout', desc: 'Highlight crucial exam takeaways', icon: Star, category: 'Callouts' },
  { id: 'callout_tip', label: '💡 Pro Tip Callout', desc: 'Helpful insights & memory hooks', icon: Lightbulb, category: 'Callouts' },
  { id: 'callout_warn', label: '⚠️ Exam Caution', desc: 'Common pitfalls & exam warnings', icon: AlertTriangle, category: 'Callouts' },
  { id: 'toggle', label: 'Toggle List', desc: 'Collapsible details block', icon: ChevronRight, category: 'Advanced' },
  { id: 'quote', label: 'Quote', desc: 'Capture quotes or definitions', icon: Quote, category: 'Advanced' },
  { id: 'code', label: 'Code Block', desc: 'Code snippet with monospace font', icon: Code, category: 'Advanced' },
  { id: 'divider', label: 'Divider', desc: 'Visual separator line', icon: Minus, category: 'Advanced' }
];

// Helper to parse Markdown string into Notion-style blocks
export function markdownToBlocks(markdownStr) {
  if (!markdownStr || typeof markdownStr !== 'string' || !markdownStr.trim()) {
    return [
      { id: 'b_' + Date.now() + '_1', type: 'paragraph', content: '' }
    ];
  }

  const lines = markdownStr.split('\n');
  const blocks = [];
  let inCodeBlock = false;
  let codeBuffer = [];
  let codeLang = '';

  lines.forEach((rawLine, idx) => {
    const line = rawLine;

    // Handle Code fence
    if (line.startsWith('```')) {
      if (inCodeBlock) {
        blocks.push({
          id: `b_${idx}_code`,
          type: 'code',
          content: codeBuffer.join('\n'),
          lang: codeLang || 'javascript'
        });
        inCodeBlock = false;
        codeBuffer = [];
        codeLang = '';
        return;
      } else {
        inCodeBlock = true;
        codeLang = line.replace('```', '').trim();
        codeBuffer = [];
        return;
      }
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      return;
    }

    // Dividers
    if (/^---+$|^\*\*\*+$/.test(line.trim())) {
      blocks.push({ id: `b_${idx}`, type: 'divider', content: '' });
      return;
    }

    // Headings
    if (line.startsWith('# ')) {
      blocks.push({ id: `b_${idx}`, type: 'h1', content: line.replace(/^#\s+/, '') });
      return;
    }
    if (line.startsWith('## ')) {
      blocks.push({ id: `b_${idx}`, type: 'h2', content: line.replace(/^##\s+/, '') });
      return;
    }
    if (line.startsWith('### ')) {
      blocks.push({ id: `b_${idx}`, type: 'h3', content: line.replace(/^###\s+/, '') });
      return;
    }

    // Callouts & Blockquotes
    if (line.startsWith('> ')) {
      const calloutText = line.replace(/^>\s*/, '');
      if (calloutText.includes('⭐') || calloutText.toLowerCase().includes('important')) {
        blocks.push({ id: `b_${idx}`, type: 'callout_star', content: calloutText.replace(/⭐\s*/, '') });
      } else if (calloutText.includes('💡') || calloutText.toLowerCase().includes('tip')) {
        blocks.push({ id: `b_${idx}`, type: 'callout_tip', content: calloutText.replace(/💡\s*/, '') });
      } else if (calloutText.includes('⚠️') || calloutText.toLowerCase().includes('caution')) {
        blocks.push({ id: `b_${idx}`, type: 'callout_warn', content: calloutText.replace(/⚠️\s*/, '') });
      } else {
        blocks.push({ id: `b_${idx}`, type: 'quote', content: calloutText });
      }
      return;
    }

    // Checkboxes / Todo
    if (/^\s*[-*]\s*\[\s*\]\s+/.test(line)) {
      blocks.push({
        id: `b_${idx}`,
        type: 'todo',
        content: line.replace(/^\s*[-*]\s*\[\s*\]\s+/, ''),
        checked: false
      });
      return;
    }
    if (/^\s*[-*]\s*\[[xX]\]\s+/.test(line)) {
      blocks.push({
        id: `b_${idx}`,
        type: 'todo',
        content: line.replace(/^\s*[-*]\s*\[[xX]\]\s+/, ''),
        checked: true
      });
      return;
    }

    // Bullet Lists
    if (/^\s*[-*•]\s+/.test(line)) {
      blocks.push({
        id: `b_${idx}`,
        type: 'bullet',
        content: line.replace(/^\s*[-*•]\s+/, '')
      });
      return;
    }

    // Numbered Lists
    if (/^\s*\d+\.\s+/.test(line)) {
      blocks.push({
        id: `b_${idx}`,
        type: 'numbered',
        content: line.replace(/^\s*\d+\.\s+/, '')
      });
      return;
    }

    // Paragraph
    if (line.trim() || blocks.length === 0 || blocks[blocks.length - 1].type !== 'paragraph') {
      blocks.push({
        id: `b_${idx}`,
        type: 'paragraph',
        content: line
      });
    }
  });

  return blocks.length > 0 ? blocks : [{ id: 'b_init', type: 'paragraph', content: '' }];
}

// Helper to serialize Notion-style blocks back into clean Markdown string
export function blocksToMarkdown(blocks) {
  if (!Array.isArray(blocks) || blocks.length === 0) return '';

  return blocks.map(b => {
    switch (b.type) {
      case 'h1':
        return `# ${b.content || ''}`;
      case 'h2':
        return `## ${b.content || ''}`;
      case 'h3':
        return `### ${b.content || ''}`;
      case 'todo':
        return `- [${b.checked ? 'x' : ' '}] ${b.content || ''}`;
      case 'bullet':
        return `- ${b.content || ''}`;
      case 'numbered':
        return `1. ${b.content || ''}`;
      case 'callout_star':
        return `> ⭐ **IMPORTANT:** ${b.content || ''}`;
      case 'callout_tip':
        return `> 💡 **PRO TIP:** ${b.content || ''}`;
      case 'callout_warn':
        return `> ⚠️ **CAUTION:** ${b.content || ''}`;
      case 'quote':
        return `> ${b.content || ''}`;
      case 'code':
        return `\`\`\`${b.lang || 'javascript'}\n${b.content || ''}\n\`\`\``;
      case 'toggle':
        return `<details><summary>${b.content || 'Toggle'}</summary>\n${b.subContent || ''}\n</details>`;
      case 'divider':
        return `---`;
      case 'paragraph':
      default:
        return b.content || '';
    }
  }).join('\n\n');
}

export default function NotionNotesEditor({
  initialMarkdown = '',
  onChange,
  onSave,
  lessonTitle = 'Lesson Notes',
  courseTitle = '',
  isImportant = false,
  onToggleImportant,
  compact = false
}) {
  const [blocks, setBlocks] = useState(() => markdownToBlocks(initialMarkdown));
  const [activeBlockIndex, setActiveBlockIndex] = useState(0);
  const [slashMenu, setSlashMenu] = useState(null); // { blockIndex, query, position: { top, left } }
  const [slashSelected, setSlashSelected] = useState(0);
  const [selectedIcon, setSelectedIcon] = useState('📝');
  const [coverGradient, setCoverGradient] = useState(null);
  const [showIconPicker, setShowIconPicker] = useState(false);
  const [showCoverPicker, setShowCoverPicker] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved' | 'saving'
  const [copiedNotification, setCopiedNotification] = useState(false);

  const blockInputRefs = useRef({});
  const saveTimeoutRef = useRef(null);

  // Sync when initialMarkdown changes externally
  useEffect(() => {
    // Only parse if empty or distinctly different
    const currentMarkdown = blocksToMarkdown(blocks);
    if (initialMarkdown && initialMarkdown !== currentMarkdown && !blocks.some(b => b.content)) {
      setBlocks(markdownToBlocks(initialMarkdown));
    }
  }, [initialMarkdown]);

  // Debounced auto-save triggers onChange
  const triggerAutoSave = useCallback((newBlocks) => {
    setSaveStatus('saving');
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);

    saveTimeoutRef.current = setTimeout(() => {
      const markdown = blocksToMarkdown(newBlocks);
      if (onChange) onChange(markdown);
      setSaveStatus('saved');
    }, 600);
  }, [onChange]);

  // Update block content
  const handleContentChange = (index, value) => {
    const updated = [...blocks];
    updated[index] = { ...updated[index], content: value };
    setBlocks(updated);
    triggerAutoSave(updated);

    // Detect slash command trigger
    if (value.startsWith('/')) {
      const query = value.slice(1).toLowerCase();
      setSlashMenu({ blockIndex: index, query });
      setSlashSelected(0);
    } else if (slashMenu && slashMenu.blockIndex === index) {
      setSlashMenu(null);
    }
  };

  // Toggle todo item checked
  const handleToggleTodo = (index) => {
    soundFX.playClick();
    const updated = [...blocks];
    updated[index] = { ...updated[index], checked: !updated[index].checked };
    setBlocks(updated);
    triggerAutoSave(updated);
  };

  // Convert block to a chosen type
  const handleSelectSlashCommand = (cmd) => {
    if (!slashMenu) return;
    const { blockIndex } = slashMenu;
    soundFX.playClick();

    const updated = [...blocks];
    const currentBlock = updated[blockIndex];

    // Clear slash prefix
    const cleanContent = currentBlock.content.startsWith('/') ? currentBlock.content.replace(/^\/[a-zA-Z0-9_-]*/, '').trim() : currentBlock.content;

    updated[blockIndex] = {
      ...currentBlock,
      type: cmd.id,
      content: cleanContent,
      checked: cmd.id === 'todo' ? false : undefined,
      lang: cmd.id === 'code' ? 'javascript' : undefined
    };

    setBlocks(updated);
    setSlashMenu(null);
    triggerAutoSave(updated);

    // Focus input
    setTimeout(() => {
      blockInputRefs.current[blockIndex]?.focus();
    }, 50);
  };

  // Key handling (Enter creates new block, Backspace on empty deletes, Navigation in Slash menu)
  const handleKeyDown = (e, index) => {
    // Slash menu navigation
    if (slashMenu && slashMenu.blockIndex === index) {
      const filtered = SLASH_COMMANDS.filter(cmd =>
        cmd.label.toLowerCase().includes(slashMenu.query) || cmd.id.toLowerCase().includes(slashMenu.query)
      );

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSlashSelected(prev => (prev + 1) % (filtered.length || 1));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSlashSelected(prev => (prev - 1 + filtered.length) % (filtered.length || 1));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[slashSelected]) {
          handleSelectSlashCommand(filtered[slashSelected]);
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        setSlashMenu(null);
        return;
      }
    }

    // Enter: Insert new block
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const currentBlock = blocks[index];

      // If in bullet or todo, carry over same block type; else default to paragraph
      let nextType = 'paragraph';
      if (currentBlock.type === 'bullet') nextType = 'bullet';
      if (currentBlock.type === 'todo') nextType = 'todo';
      if (currentBlock.type === 'numbered') nextType = 'numbered';

      const newBlock = {
        id: 'b_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        type: nextType,
        content: '',
        checked: nextType === 'todo' ? false : undefined
      };

      const updated = [...blocks.slice(0, index + 1), newBlock, ...blocks.slice(index + 1)];
      setBlocks(updated);
      triggerAutoSave(updated);

      setTimeout(() => {
        blockInputRefs.current[index + 1]?.focus();
      }, 50);
      return;
    }

    // Backspace on empty block: Remove block and focus previous
    if (e.key === 'Backspace' && !blocks[index].content && blocks.length > 1) {
      e.preventDefault();
      const updated = blocks.filter((_, i) => i !== index);
      setBlocks(updated);
      triggerAutoSave(updated);

      const prevIndex = Math.max(0, index - 1);
      setTimeout(() => {
        blockInputRefs.current[prevIndex]?.focus();
      }, 50);
      return;
    }
  };

  // Add block at end
  const handleAddBlock = (type = 'paragraph') => {
    soundFX.playClick();
    const newBlock = {
      id: 'b_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
      type,
      content: '',
      checked: type === 'todo' ? false : undefined
    };
    const updated = [...blocks, newBlock];
    setBlocks(updated);
    triggerAutoSave(updated);

    setTimeout(() => {
      blockInputRefs.current[updated.length - 1]?.focus();
    }, 50);
  };

  // Delete a specific block
  const handleDeleteBlock = (index) => {
    if (blocks.length <= 1) {
      setBlocks([{ id: 'b_empty', type: 'paragraph', content: '' }]);
      return;
    }
    soundFX.playClick();
    const updated = blocks.filter((_, i) => i !== index);
    setBlocks(updated);
    triggerAutoSave(updated);
  };

  // Manual save
  const handleManualSave = () => {
    soundFX.playStar ? soundFX.playStar() : soundFX.playClick();
    const markdown = blocksToMarkdown(blocks);
    if (onSave) onSave(markdown);
    if (onChange) onChange(markdown);
    setSaveStatus('saved');
  };

  // Copy full document as Markdown
  const handleCopyMarkdown = () => {
    soundFX.playClick();
    const markdown = blocksToMarkdown(blocks);
    navigator.clipboard.writeText(markdown);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Download Markdown file
  const handleDownloadMarkdown = () => {
    soundFX.playClick();
    const markdown = blocksToMarkdown(blocks);
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${lessonTitle.replace(/[^a-zA-Z0-9_-]/g, '_')}_notes.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const filteredCommands = slashMenu ? SLASH_COMMANDS.filter(cmd =>
    cmd.label.toLowerCase().includes(slashMenu.query) || cmd.id.toLowerCase().includes(slashMenu.query)
  ) : [];

  return (
    <div className={`notion-editor-shell ${isFullscreen ? 'notion-fullscreen' : ''} ${compact ? 'notion-compact' : ''}`}>
      {/* Notion Document Header */}
      <div className="notion-doc-header">
        {coverGradient && (
          <div className="notion-cover-banner" style={{ background: coverGradient }}>
            <button
              onClick={() => setCoverGradient(null)}
              className="notion-cover-change-btn"
              title="Remove banner"
            >
              ✕ Remove Cover
            </button>
          </div>
        )}

        <div className="notion-meta-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* Page Emoji Icon */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowIconPicker(prev => !prev)}
                className="notion-icon-btn"
                title="Change Page Icon"
              >
                <span>{selectedIcon}</span>
              </button>
              {showIconPicker && (
                <div className="notion-icon-picker glass-panel">
                  {PAGE_ICONS.map(icon => (
                    <button
                      key={icon}
                      onClick={() => { setSelectedIcon(icon); setShowIconPicker(false); soundFX.playClick(); }}
                      className="icon-choice"
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Document Title & Breadcrumbs */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {courseTitle && (
                  <span style={{ fontSize: '0.72rem', color: 'var(--accent-primary)', fontWeight: '700' }}>
                    {courseTitle}
                  </span>
                )}
                {isImportant && (
                  <span className="notion-badge-important">
                    <Star size={11} fill="#fbbf24" /> Important
                  </span>
                )}
              </div>
              <h2 className="notion-page-title">{lessonTitle}</h2>
            </div>
          </div>

          {/* Action Tools */}
          <div className="notion-header-actions">
            {/* Importance Star Toggle */}
            <button
              onClick={() => {
                soundFX.playStar ? soundFX.playStar() : soundFX.playClick();
                if (onToggleImportant) onToggleImportant();
              }}
              className={`notion-tool-btn ${isImportant ? 'important-active' : ''}`}
              title={isImportant ? 'Marked as Important' : 'Mark as Important / Exam Topic'}
            >
              <Star size={14} fill={isImportant ? '#fbbf24' : 'none'} color={isImportant ? '#fbbf24' : 'currentColor'} />
              <span>{isImportant ? 'Important' : 'Mark Important'}</span>
            </button>

            {/* Add Cover Banner Button */}
            <button
              onClick={() => setShowCoverPicker(prev => !prev)}
              className="notion-tool-btn"
              title="Add decorative cover banner"
            >
              <span>🖼️ Cover</span>
            </button>

            {/* Copy Markdown */}
            <button
              onClick={handleCopyMarkdown}
              className="notion-tool-btn"
              title="Copy notes as clean Markdown"
            >
              {copiedNotification ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
              <span>{copiedNotification ? 'Copied' : 'Copy'}</span>
            </button>

            {/* Download .md */}
            <button
              onClick={handleDownloadMarkdown}
              className="notion-tool-btn"
              title="Export as Markdown file"
            >
              <Download size={14} />
            </button>

            {/* Fullscreen Expand Mode */}
            <button
              onClick={() => { soundFX.playClick(); setIsFullscreen(prev => !prev); }}
              className="notion-tool-btn"
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand to Fullscreen Workspace'}
            >
              {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
            </button>
          </div>
        </div>

        {/* Cover Gradient Presets Dropdown */}
        {showCoverPicker && (
          <div className="notion-cover-picker glass-panel">
            <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '6px', display: 'block' }}>
              Choose a cover gradient:
            </span>
            <div style={{ display: 'flex', gap: '8px' }}>
              {COVER_GRADIENTS.map(grad => (
                <button
                  key={grad.id}
                  onClick={() => { setCoverGradient(grad.bg); setShowCoverPicker(false); soundFX.playClick(); }}
                  style={{
                    flex: 1,
                    height: '28px',
                    borderRadius: '6px',
                    background: grad.bg,
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    cursor: 'pointer'
                  }}
                  title={grad.label}
                />
              ))}
            </div>
          </div>
        )}

        {/* Quick Notion Helper Bar */}
        <div className="notion-hint-strip">
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sparkles size={13} color="var(--accent-primary)" />
            <span style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
              Type <kbd className="notion-kbd">/</kbd> for blocks (headings, todos, callouts, code). Press <kbd className="notion-kbd">Enter</kbd> for next block.
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '0.72rem', color: saveStatus === 'saving' ? '#fbbf24' : '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {saveStatus === 'saving' ? 'Saving...' : '✓ Auto-saved'}
            </span>
            <button onClick={handleManualSave} className="glow-btn-sm" style={{ padding: '3px 10px', fontSize: '0.72rem' }}>
              Save
            </button>
          </div>
        </div>
      </div>

      {/* Notion Document Body Blocks */}
      <div className="notion-doc-body">
        {blocks.map((block, index) => {
          return (
            <div
              key={block.id}
              className={`notion-block-row ${activeBlockIndex === index ? 'row-focused' : ''}`}
              onFocus={() => setActiveBlockIndex(index)}
            >
              {/* Left Hover Handle Buttons (+ and Grip) */}
              <div className="notion-block-handles">
                <button
                  onClick={() => {
                    setSlashMenu({ blockIndex: index, query: '' });
                    setSlashSelected(0);
                  }}
                  className="block-handle-btn"
                  title="Add block here or change type"
                >
                  <Plus size={13} />
                </button>
                <button
                  onClick={() => handleDeleteBlock(index)}
                  className="block-handle-btn delete-btn"
                  title="Delete this block"
                >
                  <Trash2 size={13} />
                </button>
              </div>

              {/* Block Content by Type */}
              <div className="notion-block-content">
                {/* Heading 1 */}
                {block.type === 'h1' && (
                  <input
                    ref={el => blockInputRefs.current[index] = el}
                    type="text"
                    value={block.content}
                    onChange={(e) => handleContentChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    placeholder="Heading 1..."
                    className="notion-input-h1"
                  />
                )}

                {/* Heading 2 */}
                {block.type === 'h2' && (
                  <input
                    ref={el => blockInputRefs.current[index] = el}
                    type="text"
                    value={block.content}
                    onChange={(e) => handleContentChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    placeholder="Heading 2..."
                    className="notion-input-h2"
                  />
                )}

                {/* Heading 3 */}
                {block.type === 'h3' && (
                  <input
                    ref={el => blockInputRefs.current[index] = el}
                    type="text"
                    value={block.content}
                    onChange={(e) => handleContentChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    placeholder="Heading 3..."
                    className="notion-input-h3"
                  />
                )}

                {/* To-do List (Interactive Checkbox) */}
                {block.type === 'todo' && (
                  <div className="notion-todo-item">
                    <button
                      onClick={() => handleToggleTodo(index)}
                      className={`notion-checkbox ${block.checked ? 'checked' : ''}`}
                    >
                      {block.checked ? <CheckSquare size={16} color="var(--accent-primary)" /> : <Square size={16} color="var(--text-dim)" />}
                    </button>
                    <input
                      ref={el => blockInputRefs.current[index] = el}
                      type="text"
                      value={block.content}
                      onChange={(e) => handleContentChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      placeholder="To-do task..."
                      className={`notion-input-todo ${block.checked ? 'completed-text' : ''}`}
                    />
                  </div>
                )}

                {/* Bullet List */}
                {block.type === 'bullet' && (
                  <div className="notion-bullet-item">
                    <span className="bullet-dot">•</span>
                    <input
                      ref={el => blockInputRefs.current[index] = el}
                      type="text"
                      value={block.content}
                      onChange={(e) => handleContentChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      placeholder="List item..."
                      className="notion-input-bullet"
                    />
                  </div>
                )}

                {/* Numbered List */}
                {block.type === 'numbered' && (
                  <div className="notion-bullet-item">
                    <span className="numbered-prefix">{index + 1}.</span>
                    <input
                      ref={el => blockInputRefs.current[index] = el}
                      type="text"
                      value={block.content}
                      onChange={(e) => handleContentChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      placeholder="List item..."
                      className="notion-input-bullet"
                    />
                  </div>
                )}

                {/* ⭐ Important Callout */}
                {block.type === 'callout_star' && (
                  <div className="notion-callout callout-important">
                    <Star size={18} fill="#fbbf24" color="#fbbf24" className="callout-icon" />
                    <input
                      ref={el => blockInputRefs.current[index] = el}
                      type="text"
                      value={block.content}
                      onChange={(e) => handleContentChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      placeholder="Crucial exam concept or formula to remember..."
                      className="notion-input-callout"
                    />
                  </div>
                )}

                {/* 💡 Pro Tip Callout */}
                {block.type === 'callout_tip' && (
                  <div className="notion-callout callout-tip">
                    <Lightbulb size={18} color="#34d399" className="callout-icon" />
                    <input
                      ref={el => blockInputRefs.current[index] = el}
                      type="text"
                      value={block.content}
                      onChange={(e) => handleContentChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      placeholder="Pro-tip or practical memory hook..."
                      className="notion-input-callout"
                    />
                  </div>
                )}

                {/* ⚠️ Warning Callout */}
                {block.type === 'callout_warn' && (
                  <div className="notion-callout callout-warning">
                    <AlertTriangle size={18} color="#f43f5e" className="callout-icon" />
                    <input
                      ref={el => blockInputRefs.current[index] = el}
                      type="text"
                      value={block.content}
                      onChange={(e) => handleContentChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      placeholder="Common pitfall or exam warning..."
                      className="notion-input-callout"
                    />
                  </div>
                )}

                {/* Quote */}
                {block.type === 'quote' && (
                  <div className="notion-quote-block">
                    <input
                      ref={el => blockInputRefs.current[index] = el}
                      type="text"
                      value={block.content}
                      onChange={(e) => handleContentChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(e, index)}
                      placeholder="Quote or definition..."
                      className="notion-input-quote"
                    />
                  </div>
                )}

                {/* Code Block */}
                {block.type === 'code' && (
                  <div className="notion-code-block">
                    <div className="notion-code-header">
                      <span style={{ fontSize: '0.72rem', color: '#38bdf8', fontFamily: 'var(--font-mono)' }}>
                        {block.lang || 'javascript'}
                      </span>
                    </div>
                    <textarea
                      ref={el => blockInputRefs.current[index] = el}
                      rows={4}
                      value={block.content}
                      onChange={(e) => handleContentChange(index, e.target.value)}
                      placeholder="// Type code snippet..."
                      className="notion-code-textarea"
                    />
                  </div>
                )}

                {/* Toggle Disclosure */}
                {block.type === 'toggle' && (
                  <div className="notion-toggle-block">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <ChevronRight size={15} color="var(--accent-primary)" />
                      <input
                        ref={el => blockInputRefs.current[index] = el}
                        type="text"
                        value={block.content}
                        onChange={(e) => handleContentChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(e, index)}
                        placeholder="Toggle summary (e.g. Solution or Theorem)..."
                        className="notion-input-paragraph"
                      />
                    </div>
                  </div>
                )}

                {/* Divider Line */}
                {block.type === 'divider' && (
                  <div className="notion-divider-line" />
                )}

                {/* Standard Paragraph */}
                {block.type === 'paragraph' && (
                  <textarea
                    ref={el => blockInputRefs.current[index] = el}
                    rows={1}
                    value={block.content}
                    onChange={(e) => {
                      handleContentChange(index, e.target.value);
                      // Auto expand height
                      e.target.style.height = 'auto';
                      e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onKeyDown={(e) => handleKeyDown(e, index)}
                    placeholder="Type '/' for commands or start writing..."
                    className="notion-input-paragraph"
                  />
                )}
              </div>
            </div>
          );
        })}

        {/* Append Block Button */}
        <div style={{ padding: '8px 0 16px 36px' }}>
          <button
            onClick={() => handleAddBlock('paragraph')}
            className="notion-add-block-btn"
          >
            <Plus size={14} />
            <span>Click to add a block below</span>
          </button>
        </div>
      </div>

      {/* Notion Slash Command Menu Popover */}
      {slashMenu && (
        <div className="notion-slash-menu animate-pop-in">
          <div className="slash-menu-header">
            <span>Basic Blocks</span>
          </div>
          <div className="slash-menu-items">
            {filteredCommands.length > 0 ? (
              filteredCommands.map((cmd, i) => {
                const IconComp = cmd.icon;
                return (
                  <div
                    key={cmd.id}
                    onClick={() => handleSelectSlashCommand(cmd)}
                    className={`slash-menu-item ${slashSelected === i ? 'selected' : ''}`}
                  >
                    <div className="slash-icon-wrapper">
                      <IconComp size={16} />
                    </div>
                    <div>
                      <div className="slash-title">{cmd.label}</div>
                      <div className="slash-desc">{cmd.desc}</div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div style={{ padding: '12px', fontSize: '0.78rem', color: 'var(--text-dim)', textAlign: 'center' }}>
                No matching blocks found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

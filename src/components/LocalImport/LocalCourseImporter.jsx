'use client';

import React, { useState, useRef } from 'react';
import { 
  FolderInput, 
  FolderPlus, 
  FileArchive, 
  FolderTree, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Layers, 
  Video, 
  FileText, 
  Brain, 
  UploadCloud,
  ArrowRight,
  Zap,
  Tag,
  Trash2
} from 'lucide-react';
import { 
  parseLocalDirectoryFiles, 
  parseZipCourse 
} from '../../utils/courseImporter';
import { soundFX } from '../../utils/soundEffects';
import { triggerConfetti } from '../../utils/confettiHelper';
import RemoveImportedDataModal from './RemoveImportedDataModal';

export default function LocalCourseImporter({ 
  onCourseImported, 
  onOpenCourse,
  importedCourses = [],
  onRemoveAllImportedData
}) {
  const [activeTab, setActiveTab] = useState('folder'); // 'folder' | 'zip' | 'instant'
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [previewCourse, setPreviewCourse] = useState(null);
  const [scannedSummary, setScannedSummary] = useState(null);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [actionFeedback, setActionFeedback] = useState('');

  const folderInputRef = useRef(null);
  const zipInputRef = useRef(null);

  // Handle Directory Picker
  const handleDirectorySelect = async (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setErrorMsg('');
    soundFX.playClick();

    try {
      const course = await parseLocalDirectoryFiles(files);
      
      const videoCount = course.modules.reduce((acc, m) => acc + m.lessons.filter(l => l.type === 'video').length, 0);
      const textCount = course.modules.reduce((acc, m) => acc + m.lessons.filter(l => l.type === 'markdown').length, 0);
      const quizCount = course.modules.reduce((acc, m) => acc + m.lessons.filter(l => l.type === 'quiz').length, 0);

      setScannedSummary({
        totalFiles: files.length,
        modulesCount: course.modules.length,
        videoCount,
        textCount,
        quizCount,
        category: course.category
      });

      setPreviewCourse(course);
      soundFX.playXPEarned();
    } catch (err) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to scan selected directory. Please ensure files are accessible.');
      soundFX.playIncorrect();
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Zip File Upload
  const handleZipSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    setErrorMsg('');
    soundFX.playClick();

    try {
      const course = await parseZipCourse(file);
      const videoCount = course.modules.reduce((acc, m) => acc + m.lessons.filter(l => l.type === 'video').length, 0);
      const textCount = course.modules.reduce((acc, m) => acc + m.lessons.filter(l => l.type === 'markdown').length, 0);
      const quizCount = course.modules.reduce((acc, m) => acc + m.lessons.filter(l => l.type === 'quiz').length, 0);

      setScannedSummary({
        totalFiles: 'Archive Files',
        modulesCount: course.modules.length,
        videoCount,
        textCount,
        quizCount,
        category: course.category
      });

      setPreviewCourse(course);
      soundFX.playXPEarned();
    } catch (err) {
      console.error(err);
      setErrorMsg('Failed to process zip archive: ' + err.message);
      soundFX.playIncorrect();
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle Confirm Import
  const handleConfirmImport = () => {
    if (!previewCourse) return;
    soundFX.playLevelUp();
    triggerConfetti.cannon();
    onCourseImported(previewCourse);
    // Reset inputs so same folder can be re-imported
    if (folderInputRef.current) folderInputRef.current.value = '';
    if (zipInputRef.current) zipInputRef.current.value = '';
    setPreviewCourse(null);
    setScannedSummary(null);
  };

  const handleOpenRemoveModal = () => {
    soundFX.playClick();
    if (!importedCourses || importedCourses.length === 0) {
      setActionFeedback('No imported courses currently found to remove.');
      setTimeout(() => setActionFeedback(''), 3500);
      return;
    }
    setShowRemoveModal(true);
  };

  const triggerFolderPick = () => {
    if (folderInputRef.current) {
      folderInputRef.current.value = ''; // reset so same folder re-triggers onChange
      folderInputRef.current.click();
    }
  };

  const triggerZipPick = () => {
    if (zipInputRef.current) {
      zipInputRef.current.value = '';
      zipInputRef.current.click();
    }
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {/* Header Info */}
      <div className="glass-panel" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute',
          top: '-40px',
          right: '-40px',
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '12px' }}>
          <div style={{
            padding: '12px',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            borderRadius: 'var(--radius-md)',
            color: '#10b981'
          }}>
            <FolderTree size={28} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.8rem', color: '#fff' }}>
              Local Course Importer
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
              Select any local folder on your computer. NexusLearn automatically scans subdirectories to create <strong>Modules</strong>, categorizes topics, and parses <strong>Videos, Markdown, & Quizzes</strong>.
            </p>
          </div>
        </div>

        {/* Gamification Callout */}
        <div style={{
          marginTop: '16px',
          padding: '12px 18px',
          background: 'rgba(245, 158, 11, 0.08)',
          border: '1px solid rgba(245, 158, 11, 0.25)',
          borderRadius: 'var(--radius-md)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={18} color="#f59e0b" />
            <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#fde68a' }}>
              Quest Reward: Earn <strong>+300 XP</strong> & unlock the <strong>"Local Archivist"</strong> achievement by importing your first course!
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#f59e0b', textTransform: 'uppercase' }}>
            +300 XP
          </span>
        </div>
      </div>

      {/* Tabs + Clear Storage */}
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <button
          onClick={() => { setActiveTab('folder'); soundFX.playClick(); }}
          className={activeTab === 'folder' ? 'glow-btn' : 'ghost-btn'}
          style={{ padding: '12px 24px', fontSize: '0.95rem' }}
        >
          <FolderInput size={18} />
          Select Local Folder
        </button>

        <button
          onClick={() => { setActiveTab('zip'); soundFX.playClick(); }}
          className={activeTab === 'zip' ? 'glow-btn' : 'ghost-btn'}
          style={{ padding: '12px 24px', fontSize: '0.95rem' }}
        >
          <FileArchive size={18} />
          Upload ZIP Archive
        </button>

        {/* Remove All Imported Data Button */}
        <button
          onClick={handleOpenRemoveModal}
          disabled={!importedCourses || importedCourses.length === 0}
          style={{
            marginLeft: 'auto',
            padding: '10px 18px',
            fontSize: '0.84rem',
            background: importedCourses && importedCourses.length > 0 ? 'rgba(244,63,94,0.12)' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${importedCourses && importedCourses.length > 0 ? 'rgba(244,63,94,0.35)' : 'var(--border-subtle)'}`,
            borderRadius: 'var(--radius-md)',
            color: importedCourses && importedCourses.length > 0 ? '#fca5a5' : 'var(--text-dim)',
            cursor: importedCourses && importedCourses.length > 0 ? 'pointer' : 'not-allowed',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontFamily: 'var(--font-display)',
            fontWeight: 600,
            transition: 'all 0.18s',
          }}
          title={importedCourses && importedCourses.length > 0 ? `Remove all ${importedCourses.length} imported course(s) and their data` : "No imported courses to remove"}
        >
          <Trash2 size={15} />
          Remove All Imported Data {importedCourses && importedCourses.length > 0 ? `(${importedCourses.length})` : ''}
        </button>
      </div>

      {/* Action feedback message */}
      {actionFeedback && (
        <div style={{
          padding: '12px 18px',
          background: 'rgba(59, 130, 246, 0.15)',
          border: '1px solid rgba(59, 130, 246, 0.35)',
          borderRadius: 'var(--radius-md)',
          color: '#93c5fd',
          fontSize: '0.9rem',
          display: 'flex',
          alignItems: 'center',
          gap: '10px'
        }}>
          <CheckCircle2 size={18} />
          <span>{actionFeedback}</span>
        </div>
      )}

      {/* Hidden file inputs — kept outside the clickable div to avoid event conflicts */}
      <input
        type="file"
        ref={folderInputRef}
        webkitdirectory=""
        directory=""
        multiple
        style={{ display: 'none' }}
        onChange={handleDirectorySelect}
      />
      <input
        type="file"
        ref={zipInputRef}
        accept=".zip"
        style={{ display: 'none' }}
        onChange={handleZipSelect}
      />

      {/* Upload Drop Zone / Folder Trigger */}
      {!previewCourse && (
        <div 
          className="glass-panel"
          style={{
            padding: '50px 30px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '18px',
            border: '2px dashed var(--border-glow)',
            cursor: 'pointer'
          }}
          onClick={() => {
            if (activeTab === 'folder') {
              triggerFolderPick();
            } else {
              triggerZipPick();
            }
          }}
        >

          <div style={{
            width: '74px',
            height: '74px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid var(--border-glow)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--accent-primary)'
          }}>
            {activeTab === 'folder' ? <FolderPlus size={36} /> : <UploadCloud size={36} />}
          </div>

          <div>
            <h2 style={{ fontSize: '1.3rem', marginBottom: '6px' }}>
              {activeTab === 'folder' ? 'Click to Select Course Directory' : 'Click or Drag & Drop Course ZIP File'}
            </h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', maxWidth: '520px', margin: '0 auto' }}>
              {activeTab === 'folder'
                ? 'Your browser will prompt you to choose a folder. The folder name becomes the course title, subfolders become modules, and files become interactive lessons!'
                : 'Upload a compressed course archive. NexusLearn will unpack folders, videos, markdown files, and JSON quizzes automatically.'}
            </p>
          </div>

          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
            <span className="badge-pill">
              <Video size={13} color="#38bdf8" /> Videos (.mp4, .webm)
            </span>
            <span className="badge-pill">
              <FileText size={13} color="#10b981" /> Notes (.md, .txt)
            </span>
            <span className="badge-pill">
              <Brain size={13} color="#a855f7" /> Quizzes (.json)
            </span>
            <span className="badge-pill">
              <Tag size={13} color="#f59e0b" /> Auto Categories
            </span>
          </div>

          {isProcessing && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '14px', color: 'var(--accent-primary)' }}>
              <Sparkles size={20} className="animate-spin" />
              <span style={{ fontWeight: '600' }}>Analyzing folder structure & building modules...</span>
            </div>
          )}

          {errorMsg && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 16px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-md)',
              color: '#fca5a5',
              fontSize: '0.85rem'
            }}>
              <AlertCircle size={16} />
              {errorMsg}
            </div>
          )}
        </div>
      )}

      {/* Live Preview of Detected Course Structure */}
      {previewCourse && (
        <div className="glass-panel" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '22px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '16px' }}>
            <div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '800',
                color: '#34d399',
                textTransform: 'uppercase',
                letterSpacing: '0.06em'
              }}>
                ✓ AUTO-ANALYSIS COMPLETE
              </span>
              <h2 style={{ fontSize: '1.5rem', marginTop: '4px' }}>
                {previewCourse.title}
              </h2>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setPreviewCourse(null)}
                className="ghost-btn"
              >
                Scan Another Folder
              </button>
              <button
                onClick={handleConfirmImport}
                className="glow-btn"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 18px rgba(16, 185, 129, 0.4)' }}
              >
                <CheckCircle2 size={18} />
                Save & Build Course Structure
              </button>
            </div>
          </div>

          {/* Scanned Statistics Bar */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '14px'
          }}>
            <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Auto Category</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#60a5fa', marginTop: '4px' }}>
                {scannedSummary?.category}
              </div>
            </div>

            <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Modules Created</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#34d399', marginTop: '4px' }}>
                {scannedSummary?.modulesCount} Folders
              </div>
            </div>

            <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Videos Detected</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#38bdf8', marginTop: '4px' }}>
                {scannedSummary?.videoCount} Videos
              </div>
            </div>

            <div style={{ padding: '14px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total XP Bounty</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#fbbf24', marginTop: '4px' }}>
                +{previewCourse.totalXP} XP
              </div>
            </div>
          </div>

          {/* Module Hierarchy Tree */}
          <div>
            <h3 style={{ fontSize: '1.1rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Layers size={18} color="var(--accent-primary)" />
              Detected Course Hierarchy
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {previewCourse.modules.map((mod, idx) => (
                <div 
                  key={mod.id}
                  style={{
                    padding: '16px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                    <FolderTree size={18} color="#10b981" />
                    <span style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>
                      {mod.title}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginLeft: 'auto' }}>
                      {mod.lessons.length} lessons
                    </span>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: '28px' }}>
                    {mod.lessons.map(les => (
                      <div 
                        key={les.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          fontSize: '0.85rem',
                          color: 'var(--text-muted)',
                          padding: '4px 0'
                        }}
                      >
                        {les.type === 'video' && <Video size={14} color="#38bdf8" />}
                        {les.type === 'quiz' && <Brain size={14} color="#ec4899" />}
                        {les.type === 'markdown' && <FileText size={14} color="#10b981" />}
                        <span>{les.title}</span>
                        <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: '#fbbf24', fontWeight: '700' }}>
                          +{les.xp} XP
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {showRemoveModal && (
        <RemoveImportedDataModal
          importedCourses={importedCourses}
          onClose={() => setShowRemoveModal(false)}
          onConfirm={async () => {
            const res = onRemoveAllImportedData ? await onRemoveAllImportedData() : { count: importedCourses.length };
            setPreviewCourse(null);
            setScannedSummary(null);
            setActionFeedback(`Successfully removed all ${res?.count || importedCourses.length} imported course(s) and associated data.`);
            setTimeout(() => setActionFeedback(''), 4500);
            return res;
          }}
        />
      )}
    </div>
  );
}

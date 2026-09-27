'use client';

import React, { useState } from 'react';
import { Trash2, AlertTriangle, X, CheckCircle2, FolderX, Loader2 } from 'lucide-react';
import { soundFX } from '../../utils/soundEffects';

export default function RemoveImportedDataModal({
  importedCourses = [],
  onClose,
  onConfirm
}) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [deletedResult, setDeletedResult] = useState(null);

  const handleConfirm = async () => {
    setIsDeleting(true);
    soundFX.playClick();
    try {
      const res = await onConfirm();
      setDeletedResult(res || { count: importedCourses.length });
      soundFX.playLevelUp();
    } catch (err) {
      console.error('Error removing imported data:', err);
      soundFX.playIncorrect();
      setIsDeleting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={isDeleting ? undefined : onClose} role="dialog" aria-modal="true" aria-labelledby="remove-imported-title">
      <div 
        className="glass-panel modal-content"
        style={{
          maxWidth: '520px',
          width: '92%',
          padding: '34px 28px',
          background: 'linear-gradient(145deg, #18111e 0%, #201322 100%)',
          border: '2px solid rgba(244, 63, 94, 0.45)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 0 50px rgba(244, 63, 94, 0.28)',
          position: 'relative',
          color: '#fff'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {!isDeleting && (
          <button 
            onClick={() => { soundFX.playClick(); onClose(); }} 
            className="ghost-btn" 
            style={{ position: 'absolute', top: '16px', right: '16px', padding: '6px', borderRadius: '50%' }}
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        )}

        {deletedResult ? (
          /* Success State */
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              margin: '0 auto 18px',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              boxShadow: '0 0 35px rgba(16, 185, 129, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff'
            }}>
              <CheckCircle2 size={40} />
            </div>

            <h2 id="remove-imported-title" style={{ fontSize: '1.6rem', marginBottom: '8px', color: '#fff' }}>
              Imported Data Cleared
            </h2>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.92rem', marginBottom: '24px', lineHeight: 1.5 }}>
              Successfully removed {deletedResult.count || importedCourses.length} imported course{importedCourses.length !== 1 ? 's' : ''}, along with all associated lessons, progress checkpoints, and study notes.
            </p>

            <button 
              onClick={() => { soundFX.playClick(); onClose(); }}
              className="glow-btn"
              style={{ width: '100%', padding: '12px 20px', fontSize: '0.95rem', background: 'var(--accent-gradient)' }}
            >
              Done
            </button>
          </div>
        ) : (
          /* Confirmation State */
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
              <div style={{
                width: '54px',
                height: '54px',
                borderRadius: 'var(--radius-lg)',
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                boxShadow: '0 0 24px rgba(244, 63, 94, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#f43f5e',
                flexShrink: 0
              }}>
                <FolderX size={28} />
              </div>

              <div>
                <h2 id="remove-imported-title" style={{ fontSize: '1.45rem', fontWeight: 800, color: '#fff', margin: 0 }}>
                  Remove All Imported Data?
                </h2>
                <div style={{ fontSize: '0.82rem', color: '#fca5a5', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertTriangle size={13} />
                  Permanent deletion of imported items
                </div>
              </div>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.55, marginBottom: '18px' }}>
              This will permanently delete all <strong>{importedCourses.length}</strong> imported course{importedCourses.length !== 1 ? 's' : ''} from your offline/disk storage, including their generated modules, quizzes, and associated learning progress.
            </p>

            {/* List of courses being removed */}
            {importedCourses.length > 0 && (
              <div style={{
                background: 'rgba(0, 0, 0, 0.3)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                maxHeight: '140px',
                overflowY: 'auto',
                marginBottom: '18px',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {importedCourses.map(course => (
                  <div key={course.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.84rem' }}>
                    <span style={{ color: '#fff', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '320px' }}>
                      📁 {course.title}
                    </span>
                    <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                      {course.modules?.length || 0} mods
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Safety reassurance callout */}
            <div style={{
              background: 'rgba(59, 130, 246, 0.08)',
              border: '1px solid rgba(59, 130, 246, 0.25)',
              borderRadius: 'var(--radius-md)',
              padding: '10px 14px',
              fontSize: '0.82rem',
              color: '#93c5fd',
              marginBottom: '24px',
              lineHeight: 1.45
            }}>
              💡 <strong>Safe Operation:</strong> Your default catalog courses and custom studio courses will remain untouched. Only directory and ZIP imported items will be erased.
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => { soundFX.playClick(); onClose(); }}
                disabled={isDeleting}
                className="ghost-btn"
                style={{ padding: '11px 20px', fontSize: '0.9rem' }}
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={isDeleting}
                className="glow-btn"
                style={{
                  padding: '11px 22px',
                  fontSize: '0.9rem',
                  background: 'linear-gradient(135deg, #f43f5e 0%, #be123c 100%)',
                  boxShadow: '0 4px 18px rgba(244, 63, 94, 0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Yes, Remove All Imported
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

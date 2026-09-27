'use client';

import React from 'react';
import { 
  Play, 
  Clock, 
  Award, 
  BookOpen, 
  Sparkles, 
  Star, 
  FolderTree, 
  Download,
  Trash2,
  CheckCircle2
} from 'lucide-react';
import { soundFX } from '../utils/soundEffects';

export default function CourseCard({ 
  course, 
  completedLessons = [], 
  onSelectCourse, 
  onDeleteCourse 
}) {
  // Calculate total lessons in course
  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
  
  // Calculate user progress in this course
  const completedInCourse = course.modules?.reduce((acc, m) => {
    return acc + (m.lessons?.filter(l => completedLessons.includes(l.id))?.length || 0);
  }, 0) || 0;

  const progressPercent = totalLessons > 0 ? Math.round((completedInCourse / totalLessons) * 100) : 0;
  const isCompleted = progressPercent === 100;
  const hasStarted = completedInCourse > 0;

  const handleCardClick = () => {
    soundFX.playClick();
    onSelectCourse(course);
  };

  const handleExportJSON = (e) => {
    e.stopPropagation();
    soundFX.playClick();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(course, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${course.title.toLowerCase().replace(/\s+/g, '_')}_manifest.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div 
      className="glass-panel glass-panel-hover"
      onClick={handleCardClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        cursor: 'pointer',
        position: 'relative'
      }}
    >
      {/* Top Banner Gradient */}
      <div style={{
        height: '130px',
        background: course.gradient || 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
        position: 'relative',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between'
      }}>
        {/* Category & Badge overlay */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            padding: '4px 10px',
            background: 'rgba(0, 0, 0, 0.45)',
            backdropFilter: 'blur(8px)',
            borderRadius: 'var(--radius-full)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.15)'
          }}>
            {course.category || 'General'}
          </span>

          {course.isImported && (
            <span style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '0.72rem',
              fontWeight: '700',
              padding: '4px 10px',
              background: 'rgba(16, 185, 129, 0.35)',
              backdropFilter: 'blur(8px)',
              borderRadius: 'var(--radius-full)',
              color: '#6ee7b7',
              border: '1px solid rgba(52, 211, 153, 0.3)'
            }}>
              <FolderTree size={13} />
              Auto Folder
            </span>
          )}
        </div>

        {/* XP Bounty Badge */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '5px',
            padding: '4px 10px',
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(6px)',
            borderRadius: 'var(--radius-full)',
            border: '1px solid rgba(245, 158, 11, 0.4)',
            color: '#fbbf24',
            fontSize: '0.78rem',
            fontWeight: '800'
          }}>
            <Sparkles size={13} color="#f59e0b" />
            +{course.totalXP || 500} XP
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.8rem',
            fontWeight: '700',
            color: '#fff',
            background: 'rgba(0, 0, 0, 0.4)',
            padding: '3px 8px',
            borderRadius: 'var(--radius-full)'
          }}>
            <Star size={13} color="#f59e0b" fill="#f59e0b" />
            {course.rating || 5.0}
          </div>
        </div>
      </div>

      {/* Card Body */}
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', flex: 1, gap: '12px' }}>
        <h3 style={{ fontSize: '1.12rem', lineHeight: 1.35, color: '#fff' }}>
          {course.title}
        </h3>

        <p style={{
          fontSize: '0.85rem',
          color: 'var(--text-muted)',
          lineHeight: 1.45,
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {course.shortDescription}
        </p>

        {/* Meta Stats row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          fontSize: '0.78rem',
          color: 'var(--text-dim)',
          marginTop: 'auto'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <BookOpen size={14} color="var(--text-muted)" />
            {totalLessons} lessons ({course.modules?.length || 0} modules)
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <Clock size={14} color="var(--text-muted)" />
            {course.estimatedHours || '4 hrs'}
          </span>
        </div>

        {/* Progress bar if started */}
        {hasStarted && (
          <div style={{ marginTop: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '5px' }}>
              <span style={{ color: isCompleted ? '#34d399' : 'var(--text-muted)', fontWeight: '600' }}>
                {isCompleted ? 'Course Completed!' : `${completedInCourse} of ${totalLessons} completed`}
              </span>
              <span style={{ fontWeight: '800', color: isCompleted ? '#34d399' : 'var(--accent-primary)' }}>
                {progressPercent}%
              </span>
            </div>
            <div className="xp-track" style={{ height: '6px' }}>
              <div 
                style={{ 
                  height: '100%', 
                  width: `${progressPercent}%`, 
                  borderRadius: 'var(--radius-full)',
                  background: isCompleted ? '#10b981' : 'var(--accent-gradient)'
                }} 
              />
            </div>
          </div>
        )}

        {/* Action Button Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px' }}>
          <button 
            className={hasStarted ? 'glow-btn' : 'ghost-btn'}
            style={{ 
              flex: 1, 
              padding: '9px 14px', 
              fontSize: '0.88rem',
              justifyContent: 'center' 
            }}
          >
            {isCompleted ? (
              <>
                <CheckCircle2 size={16} color="#fff" />
                Review & Diploma
              </>
            ) : hasStarted ? (
              <>
                <Play size={15} color="#fff" fill="#fff" />
                Resume Learning
              </>
            ) : (
              <>
                <Play size={15} color="currentColor" />
                Start Course
              </>
            )}
          </button>

          <button
            onClick={handleExportJSON}
            className="ghost-btn"
            style={{ padding: '9px 12px' }}
            title="Export Course JSON Manifest"
          >
            <Download size={15} />
          </button>

          {onDeleteCourse && course.isImported && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                soundFX.playClick();
                if (window.confirm(`Delete imported course "${course.title}"?`)) {
                  onDeleteCourse(course.id);
                }
              }}
              className="ghost-btn"
              style={{ padding: '9px 12px', color: '#f43f5e' }}
              title="Delete Local Course"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

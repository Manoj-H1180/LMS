'use client';

import React, { useState } from 'react';
import { 
  Sparkles, 
  Flame, 
  Trophy, 
  BookOpen, 
  FolderPlus, 
  FolderInput, 
  GraduationCap, 
  Clock, 
  ArrowRight, 
  CheckCircle2, 
  Filter,
  Play
} from 'lucide-react';
import { calculateLevel } from '../../utils/storage';
import CourseCard from '../CourseCard';
import { soundFX } from '../../utils/soundEffects';

export default function DashboardView({ 
  user, 
  courses, 
  onSelectCourse, 
  onOpenImport, 
  onOpenCreate, 
  onOpenLeaderboard,
  onDeleteCourse,
  searchQuery
}) {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const levelInfo = calculateLevel(user.xp);

  // Derive unique categories from all courses dynamically!
  const allCategories = ['All', ...Array.from(new Set(courses.map(c => c.category).filter(Boolean)))];

  // In-progress courses
  const inProgressCourses = courses.filter(course => {
    const total = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;
    const completed = course.modules?.reduce((acc, m) => {
      return acc + (m.lessons?.filter(l => user.completedLessons?.includes(l.id))?.length || 0);
    }, 0) || 0;
    return completed > 0 && completed < total;
  });

  // Filtered courses
  const filteredCourses = courses.filter(course => {
    const matchesCategory = selectedCategory === 'All' || course.category === selectedCategory;
    const matchesSearch = !searchQuery || 
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Hero Gamification Banner */}
      <div className="glass-panel" style={{
        padding: '36px',
        position: 'relative',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, rgba(30, 38, 66, 0.8) 0%, rgba(15, 20, 34, 0.9) 100%)',
        border: '1px solid var(--border-glow)',
        boxShadow: 'var(--shadow-lg)'
      }}>
        {/* Glow orb */}
        <div style={{
          position: 'absolute',
          top: '-60px',
          right: '-20px',
          width: '320px',
          height: '320px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.25) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '28px',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Left Welcome Text */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span className="badge-pill" style={{ color: '#fbbf24', borderColor: 'rgba(245, 158, 11, 0.35)' }}>
                <Sparkles size={13} color="#f59e0b" />
                ACADEMY RANK: {levelInfo.title}
              </span>
              <span className="badge-pill" style={{ color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.35)' }}>
                <span className="animate-flame">
                  <Flame size={13} color="#ef4444" fill="#ef4444" />
                </span>
                {user.streak} DAY STREAK
              </span>
            </div>

            <h1 style={{ fontSize: '2.2rem', lineHeight: 1.2 }}>
              Welcome back, <span style={{ background: 'var(--accent-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>{user.name}</span>
            </h1>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '460px', lineHeight: 1.5 }}>
              Ready to expand your neural pathways? Continue your lessons, import local directories, or take an assessment to earn bonus XP.
            </p>

            {/* Quick Action Buttons */}
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
              <button
                onClick={() => { soundFX.playClick(); onOpenImport(); }}
                className="glow-btn"
                style={{ background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)', boxShadow: '0 4px 18px rgba(16, 185, 129, 0.4)' }}
              >
                <FolderInput size={17} />
                Import Local Course Folder
              </button>

              <button
                onClick={() => { soundFX.playClick(); onOpenCreate(); }}
                className="ghost-btn"
              >
                <FolderPlus size={17} />
                Create Course
              </button>
            </div>
          </div>

          {/* Right Level Progress Card */}
          <div style={{
            background: 'rgba(255, 255, 255, 0.03)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-subtle)',
            padding: '24px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '800', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                  LEVEL PROGRESSION
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: '800', color: '#fff', marginTop: '2px' }}>
                  Level {levelInfo.level} — {levelInfo.title}
                </div>
              </div>

              <div 
                onClick={onOpenLeaderboard}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  background: 'var(--accent-gradient)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  cursor: 'pointer',
                  boxShadow: 'var(--accent-glow)'
                }}
                title="View Global Leaderboard"
              >
                <Trophy size={22} />
              </div>
            </div>

            {/* XP Tracker Bar */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                <span style={{ color: '#fbbf24', fontWeight: '700' }}>
                  {user.xp} Total XP
                </span>
                <span style={{ color: 'var(--text-muted)' }}>
                  {levelInfo.neededXP} XP to Level {levelInfo.level + 1}
                </span>
              </div>
              <div className="xp-track" style={{ height: '10px' }}>
                <div className="xp-fill" style={{ width: `${levelInfo.progress}%` }} />
              </div>
            </div>

            {/* Micro stats counter */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '10px',
              borderTop: '1px solid rgba(255, 255, 255, 0.06)',
              paddingTop: '14px'
            }}>
              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Lessons Done</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#60a5fa' }}>
                  {user.completedLessons?.length || 0}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Badges</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#f59e0b' }}>
                  {user.unlockedAchievements?.length || 0}
                </div>
              </div>

              <div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-dim)' }}>Shop Points</div>
                <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#34d399' }}>
                  {user.coins}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* In-Progress Quick Resume Section (if any courses started) */}
      {inProgressCourses.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2 style={{ fontSize: '1.3rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Play size={18} color="var(--accent-primary)" />
              Jump Back In
            </h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '18px'
          }}>
            {inProgressCourses.map(course => (
              <CourseCard
                key={course.id}
                course={course}
                completedLessons={user.completedLessons}
                onSelectCourse={onSelectCourse}
                onDeleteCourse={onDeleteCourse}
              />
            ))}
          </div>
        </div>
      )}

      {/* Browse Courses & Dynamic Categories */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '14px' }}>
          <div>
            <h2 style={{ fontSize: '1.4rem' }}>
              All Courses & Libraries
            </h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Explore curated roadmaps or imported offline course folders.
            </p>
          </div>

          {/* Category Filter Pills (Auto-populated!) */}
          <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => { setSelectedCategory(cat); soundFX.playClick(); }}
                className={selectedCategory === cat ? 'glow-btn' : 'ghost-btn'}
                style={{ padding: '7px 16px', fontSize: '0.82rem' }}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {filteredCourses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              completedLessons={user.completedLessons}
              onSelectCourse={onSelectCourse}
              onDeleteCourse={onDeleteCourse}
            />
          ))}
        </div>

        {filteredCourses.length === 0 && (
          <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
            <p style={{ color: 'var(--text-muted)' }}>
              No courses found matching "{searchQuery || selectedCategory}".
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

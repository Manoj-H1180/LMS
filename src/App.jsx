'use client';

import React, { useState, useEffect, useRef } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardView from './components/Dashboard/DashboardView';
import CoursePlayerView from './components/CoursePlayer/CoursePlayerView';
import CoursePlayerBoundary from './components/CoursePlayer/CoursePlayerBoundary';
import LocalCourseImporter from './components/LocalImport/LocalCourseImporter';
import CourseCreatorModal from './components/CourseCreator/CourseCreatorModal';
import LeaderboardView from './components/Leaderboard/LeaderboardView';
import BadgesView from './components/Badges/BadgesView';
import RewardsShopView from './components/Shop/RewardsShopView';
import CelebrationModal from './components/Celebration/CelebrationModal';
import CourseCard from './components/CourseCard';
import AuthScreen, { checkServerSession, clearSession } from './components/Auth/AuthScreen';
import MobileBottomNav from './components/MobileBottomNav';

import { 
  loadUser, 
  saveUser, 
  loadCourses, 
  saveCourses,
  saveSingleCourseToDisk,
  fetchCoursesFromDisk,
  deleteCourseFromDisk,
  removeAllImportedDataFromDisk,
  clearLocalAccountCache,
  setActiveAccountCache,
  flushPendingCourseProgress,
  DEFAULT_USER
} from './utils/storage';
import { soundFX } from './utils/soundEffects';


export default function App() {
  const [mounted, setMounted] = useState(false);
  const [authedUser, setAuthedUser] = useState(null); // null = not logged in yet
  const [user, setUser] = useState(DEFAULT_USER);
  const [courses, setCourses] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeCourse, setActiveCourse] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [celebration, setCelebration] = useState(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const progressCheckpointRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    setUser(loadUser());
    setCourses(loadCourses());
    setMounted(true);

    // Verify the session once, then load only that account's course list.
    checkServerSession()
      .then(async serverUser => {
        if (cancelled || !serverUser) return;
        setActiveAccountCache(serverUser.username);
        setAuthedUser(serverUser);
        setUser({ ...DEFAULT_USER, ...serverUser });

        const diskCourses = await fetchCoursesFromDisk();
        if (!cancelled && Array.isArray(diskCourses)) setCourses(diskCourses);
      })
      .catch(error => console.error('App session initialization failed:', error));

    return () => { cancelled = true; };
  }, []);

  const handleAuthenticated = (userData) => {
    setActiveAccountCache(userData.username);
    setAuthedUser(userData);
    setUser({ ...DEFAULT_USER, ...userData });
    setCourses([]);
    fetchCoursesFromDisk().then(diskCourses => {
      if (Array.isArray(diskCourses)) setCourses(diskCourses);
    });
  };

  const handleLogout = async () => {
    const checkpoint = progressCheckpointRef.current;
    if (checkpoint) await checkpoint();
    await flushPendingCourseProgress();
    await clearSession();
    clearLocalAccountCache();
    setAuthedUser(null);
    setCourses([]);
    setActiveAccountCache(null);
    setUser(DEFAULT_USER);
    soundFX.playClick();
  };



  // Sync user state changes to SQLite on disk
  useEffect(() => {
    if (user && authedUser?.username) saveUser({ ...user, username: authedUser.username });
    if (user?.activeTheme) {
      document.documentElement.setAttribute('data-theme', user.activeTheme);
    }
  }, [user, authedUser]);

  // Sync courses changes to LocalStorage
  useEffect(() => {
    if (authedUser) saveCourses(courses);
  }, [courses, authedUser]);

  // Handle course imported from local directory or ZIP
  const handleCourseImported = (newCourse) => {
    const ownedCourse = { ...newCourse, ownerUsername: authedUser.username };
    setCourses(prev => [ownedCourse, ...prev.filter(course => course.id !== ownedCourse.id)]);
    saveSingleCourseToDisk(ownedCourse);

    // Award +300 XP and achievement for local importing
    const alreadyImported = courses.some(course => course.id === newCourse.id);
    const updatedAchievements = !(user.unlockedAchievements || []).includes('folder_master')
      ? [...(user.unlockedAchievements || []), 'folder_master']
      : (user.unlockedAchievements || []);

    setUser(prev => ({ ...prev, unlockedAchievements: updatedAchievements }));

    setCelebration({
      title: alreadyImported ? "Course Refreshed" : "Course Imported Successfully!",
      subtitle: `Analyzed folders and auto-generated ${newCourse.modules.length} modules for "${newCourse.title}".`,
      xpGained: 0
    });

    // Auto open the new course
    setActiveCourse(ownedCourse);
  };

  // Handle course created from studio
  const handleCourseCreated = (newCourse) => {
    const ownedCourse = { ...newCourse, ownerUsername: authedUser.username };
    setCourses(prev => [ownedCourse, ...prev.filter(course => course.id !== ownedCourse.id)]);
    saveSingleCourseToDisk(ownedCourse);

    const alreadyCreated = courses.some(course => course.id === newCourse.id);
    const updatedAchievements = !(user.unlockedAchievements || []).includes('creator_initiate')
      ? [...(user.unlockedAchievements || []), 'creator_initiate']
      : (user.unlockedAchievements || []);

    setUser(prev => ({ ...prev, unlockedAchievements: updatedAchievements }));

    setCelebration({
      title: alreadyCreated ? "Course Updated" : "Course Published!",
      subtitle: `Your custom course "${newCourse.title}" is now live with interactive modules & quizzes.`,
      xpGained: 0
    });

    setActiveCourse(ownedCourse);
  };

  // Handle course delete
  const handleDeleteCourse = (courseId) => {
    deleteCourseFromDisk(courseId).then(deleted => {
      if (!deleted) return;
      setCourses(prev => prev.filter(c => c.id !== courseId));
      if (activeCourse?.id === courseId) setActiveCourse(null);
    });
  };

  // Handle removing all imported courses and data
  const handleRemoveAllImportedData = async () => {
    const importedCourses = courses.filter(c => c.isImported || c.id?.startsWith('imported_') || c.id?.startsWith('zip_') || c.id?.includes('imported'));
    if (importedCourses.length === 0) return { count: 0 };

    const importedCourseIds = new Set(importedCourses.map(c => c.id));
    const importedLessonIds = new Set();
    importedCourses.forEach(c => {
      c.modules?.forEach(m => {
        m.lessons?.forEach(l => {
          if (l.id) importedLessonIds.add(l.id);
        });
      });
    });

    // 1. Delete from SQLite/Postgres DB & localStorage cache
    await removeAllImportedDataFromDisk(authedUser?.username);

    // 2. Remove from courses state
    setCourses(prev => prev.filter(c => !importedCourseIds.has(c.id)));
    if (activeCourse && importedCourseIds.has(activeCourse.id)) {
      setActiveCourse(null);
    }

    // 3. Clean up user state (completedLessons, lessonCompletedAt, quizScores, lessonNotes)
    setUser(prev => {
      const updatedCompleted = (prev.completedLessons || []).filter(id => !importedLessonIds.has(id));
      const updatedLessonCompletedAt = { ...(prev.lessonCompletedAt || {}) };
      const updatedQuizScores = { ...(prev.quizScores || {}) };
      const updatedLessonNotes = { ...(prev.lessonNotes || {}) };

      importedLessonIds.forEach(id => {
        delete updatedLessonCompletedAt[id];
        delete updatedQuizScores[id];
        delete updatedLessonNotes[id];
      });

      const updatedUser = {
        ...prev,
        completedLessons: updatedCompleted,
        lessonCompletedAt: updatedLessonCompletedAt,
        quizScores: updatedQuizScores,
        lessonNotes: updatedLessonNotes
      };
      saveUser(updatedUser);
      return updatedUser;
    });

    soundFX.playClick();
    return { count: importedCourses.length };
  };

  // Compute Enrolled / In-Progress count
  const enrolledCourses = courses.filter(course => {
    const lessons = course.modules?.flatMap(module => module.lessons || []) || [];
    return lessons.some(lesson => user.completedLessons?.includes(lesson.id));
  });

  const categories = Array.from(new Set(courses.map(c => c.category).filter(Boolean)));

  // Show auth screen if not logged in (and app has mounted to avoid SSR flicker)
  if (!mounted) return null;
  if (!authedUser) {
    return <AuthScreen onAuthenticated={handleAuthenticated} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Navigation — hidden during course playback for full-width video */}
      {!activeCourse && (
        <Sidebar 
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveCourse(null);
            setMobileNavOpen(false);
            if (tab === 'studio') {
              setShowCreateModal(true);
            } else {
              setActiveTab(tab);
            }
          }}
          coursesCount={courses.length}
          enrolledCount={enrolledCourses.length}
          mobileOpen={mobileNavOpen}
          onCloseMobile={() => setMobileNavOpen(false)}
        />
      )}

      {/* Main Workspace */}
      <div className="main-content">
        <Navbar 
          user={user}
          setUser={setUser}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveCourse(null);
            setActiveTab(tab);
          }}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenShop={() => {
            setActiveCourse(null);
            setActiveTab('shop');
          }}
          onLogout={handleLogout}
          onToggleMobileMenu={() => setMobileNavOpen(prev => !prev)}
        />


        <main id="main-content" className="content-body" tabIndex={-1}>
          {/* Active Course Learning View */}
          {activeCourse ? (
            <CoursePlayerBoundary key={activeCourse.id} onBack={() => setActiveCourse(null)}>
              <CoursePlayerView
                course={activeCourse}
                user={user}
                onUpdateUser={setUser}
                onBack={() => setActiveCourse(null)}
                onRegisterProgressCheckpoint={checkpoint => { progressCheckpointRef.current = checkpoint; }}
              />
            </CoursePlayerBoundary>
          ) : activeTab === 'dashboard' || activeTab === 'courses' ? (
            <DashboardView
              user={user}
              courses={courses}
              onSelectCourse={(course) => setActiveCourse(course)}
              onOpenImport={() => setActiveTab('import')}
              onOpenCreate={() => setShowCreateModal(true)}
              onOpenLeaderboard={() => setActiveTab('leaderboard')}
              onDeleteCourse={handleDeleteCourse}
              onRemoveAllImportedData={handleRemoveAllImportedData}
              searchQuery={searchQuery}
            />
          ) : activeTab === 'my_learning' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="glass-panel" style={{ padding: '28px' }}>
                <h1 style={{ fontSize: '1.8rem', color: '#fff' }}>My Learning Roadmap</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
                  Courses you are currently pursuing or completed.
                </p>
              </div>

              {enrolledCourses.length > 0 ? (
                <div className="courses-responsive-grid">
                  {enrolledCourses.map(course => (
                    <CourseCard
                      key={course.id}
                      course={course}
                      completedLessons={user.completedLessons}
                      onSelectCourse={(c) => setActiveCourse(c)}
                      onDeleteCourse={handleDeleteCourse}
                    />
                  ))}
                </div>
              ) : (
                <div className="glass-panel" style={{ padding: '40px', textAlign: 'center' }}>
                  <p style={{ color: 'var(--text-muted)', marginBottom: '14px' }}>
                    You have not started any courses yet. Choose a course to begin learning!
                  </p>
                  <button onClick={() => setActiveTab('courses')} className="glow-btn">
                    Explore Course Catalog
                  </button>
                </div>
              )}
            </div>
          ) : activeTab === 'import' ? (
            <LocalCourseImporter
              onCourseImported={handleCourseImported}
              onOpenCourse={(c) => setActiveCourse(c)}
              importedCourses={courses.filter(c => c.isImported || c.id?.startsWith('imported_') || c.id?.startsWith('zip_') || c.id?.includes('imported'))}
              onRemoveAllImportedData={handleRemoveAllImportedData}
            />
          ) : activeTab === 'leaderboard' ? (
            <LeaderboardView user={user} />
          ) : activeTab === 'achievements' ? (
            <BadgesView user={user} onUpdateUser={setUser} />
          ) : activeTab === 'shop' ? (
            <RewardsShopView user={user} onUpdateUser={setUser} />
          ) : activeTab === 'notes' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
              <div className="glass-panel" style={{ padding: '26px' }}>
                <h1 style={{ color: '#fff' }}>My Study Notes</h1>
                <p style={{ color: 'var(--text-muted)', marginTop: '6px' }}>Notes stay linked to their lesson. Open a lesson to edit them.</p>
              </div>
              {Object.entries(user.lessonNotes || {}).filter(([, note]) => note?.trim()).length ? (
                <div className="courses-responsive-grid">
                  {Object.entries(user.lessonNotes || {}).filter(([, note]) => note?.trim()).map(([lessonId, note]) => {
                    const course = courses.find(item => item.modules?.some(module => module.lessons?.some(lesson => lesson.id === lessonId)));
                    const lesson = course?.modules.flatMap(module => module.lessons || []).find(item => item.id === lessonId);
                    return <article className="glass-panel" key={lessonId} style={{ padding: '20px' }}>
                      <div style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', fontWeight: 700 }}>{course?.title || 'Course no longer available'}</div>
                      <h2 style={{ color: '#fff', fontSize: '1.05rem', marginTop: '6px' }}>{lesson?.title || 'Saved lesson note'}</h2>
                      <p style={{ color: 'var(--text-muted)', marginTop: '12px', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{note}</p>
                      {course && <button className="ghost-btn" style={{ marginTop: '14px' }} onClick={() => setActiveCourse(course)}>Open lesson</button>}
                    </article>;
                  })}
                </div>
              ) : <div className="glass-panel" style={{ padding: '36px', textAlign: 'center', color: 'var(--text-muted)' }}>Your saved lesson notes will appear here.</div>}
            </div>
          ) : null}
        </main>

        {/* Mobile Bottom Navigation Bar — Quick Thumb Navigation on Mobile */}
        {!activeCourse && (
          <MobileBottomNav
            activeTab={activeTab}
            setActiveTab={(tab) => {
              setActiveCourse(null);
              setMobileNavOpen(false);
              setActiveTab(tab);
            }}
            enrolledCount={enrolledCourses.length}
            onOpenMobileMenu={() => setMobileNavOpen(true)}
          />
        )}
      </div>

      {/* Visual Course Studio Creator Modal */}
      {showCreateModal && (
        <CourseCreatorModal
          existingCategories={categories}
          onClose={() => setShowCreateModal(false)}
          onCourseCreated={handleCourseCreated}
        />
      )}

      {/* Celebration Fanfare Modal */}
      {celebration && (
        <CelebrationModal
          title={celebration.title}
          subtitle={celebration.subtitle}
          xpGained={celebration.xpGained}
          onClose={() => setCelebration(null)}
        />
      )}
    </div>
  );
}

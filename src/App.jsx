'use client';

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import DashboardView from './components/Dashboard/DashboardView';
import CoursePlayerView from './components/CoursePlayer/CoursePlayerView';
import LocalCourseImporter from './components/LocalImport/LocalCourseImporter';
import CourseCreatorModal from './components/CourseCreator/CourseCreatorModal';
import LeaderboardView from './components/Leaderboard/LeaderboardView';
import BadgesView from './components/Badges/BadgesView';
import RewardsShopView from './components/Shop/RewardsShopView';
import CelebrationModal from './components/Celebration/CelebrationModal';
import CourseCard from './components/CourseCard';
import AuthScreen, { getStoredSession, clearSession } from './components/Auth/AuthScreen';

import { 
  loadUser, 
  saveUser, 
  loadCourses, 
  saveCourses, 
  calculateLevel 
} from './utils/storage';
import { soundFX } from './utils/soundEffects';


export default function App() {
  const [mounted, setMounted] = useState(false);
  const [authedUser, setAuthedUser] = useState(null); // null = not logged in yet
  const [user, setUser] = useState(() => loadUser());
  const [courses, setCourses] = useState(() => loadCourses());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeCourse, setActiveCourse] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [celebration, setCelebration] = useState(null);

  useEffect(() => {
    setMounted(true);
    // Check for existing auth session
    const session = getStoredSession();
    if (session) {
      setAuthedUser(session);
      // Merge auth profile over stored user
      setUser(prev => ({ ...prev, ...session }));
    }

    const localCourses = loadCourses();
    setCourses(localCourses);

    // Initial sync with Next.js built-in API route
    fetch('/api/courses')
      .then(res => res.json())
      .then(data => {
        if (data && Array.isArray(data.courses) && data.courses.length > 0) {
          setCourses(prev => {
            const ids = new Set(prev.map(c => c.id));
            const newServerCourses = data.courses.filter(c => !ids.has(c.id));
            return newServerCourses.length > 0 ? [...prev, ...newServerCourses] : prev;
          });
        }
      })
      .catch(() => {});
  }, []);

  const handleAuthenticated = (userData) => {
    setAuthedUser(userData);
    // Merge auth profile into user state
    setUser(prev => ({ ...prev, ...userData }));
  };

  const handleLogout = () => {
    clearSession();
    setAuthedUser(null);
    soundFX.playClick();
  };



  // Sync user state changes to LocalStorage
  useEffect(() => {
    saveUser(user);
    if (user.activeTheme) {
      document.documentElement.setAttribute('data-theme', user.activeTheme);
    }
  }, [user]);

  // Sync courses changes to LocalStorage
  useEffect(() => {
    saveCourses(courses);
  }, [courses]);

  // Handle course imported from local directory or ZIP
  const handleCourseImported = (newCourse) => {
    const updatedCourses = [newCourse, ...courses];
    setCourses(updatedCourses);

    // Award +300 XP and achievement for local importing
    const updatedAchievements = !user.unlockedAchievements.includes('folder_master')
      ? [...user.unlockedAchievements, 'folder_master']
      : user.unlockedAchievements;

    const updatedUser = {
      ...user,
      xp: user.xp + 300,
      coins: user.coins + 150,
      unlockedAchievements: updatedAchievements
    };

    setUser(updatedUser);

    setCelebration({
      title: "Course Imported Successfully!",
      subtitle: `Analyzed folders and auto-generated ${newCourse.modules.length} modules for "${newCourse.title}".`,
      xpGained: 300
    });

    // Auto open the new course
    setActiveCourse(newCourse);
  };

  // Handle course created from studio
  const handleCourseCreated = (newCourse) => {
    const updatedCourses = [newCourse, ...courses];
    setCourses(updatedCourses);

    const updatedAchievements = !user.unlockedAchievements.includes('creator_initiate')
      ? [...user.unlockedAchievements, 'creator_initiate']
      : user.unlockedAchievements;

    const updatedUser = {
      ...user,
      xp: user.xp + 350,
      coins: user.coins + 175,
      unlockedAchievements: updatedAchievements
    };

    setUser(updatedUser);

    setCelebration({
      title: "Course Published!",
      subtitle: `Your custom course "${newCourse.title}" is now live with interactive modules & quizzes.`,
      xpGained: 350
    });

    setActiveCourse(newCourse);
  };

  // Handle course delete
  const handleDeleteCourse = (courseId) => {
    setCourses(prev => prev.filter(c => c.id !== courseId));
    if (activeCourse?.id === courseId) {
      setActiveCourse(null);
    }
  };

  // Compute Enrolled / In-Progress count
  const enrolledCourses = courses.filter(course => {
    return course.modules?.some(m => m.lessons?.some(l => user.completedLessons?.includes(l.id)));
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
            if (tab === 'studio') {
              setShowCreateModal(true);
            } else {
              setActiveTab(tab);
            }
          }}
          coursesCount={courses.length}
          enrolledCount={enrolledCourses.length}
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
        />


        <main className="content-body">
          {/* Active Course Learning View */}
          {activeCourse ? (
            <CoursePlayerView
              course={activeCourse}
              user={user}
              onUpdateUser={setUser}
              onBack={() => setActiveCourse(null)}
            />
          ) : activeTab === 'dashboard' || activeTab === 'courses' ? (
            <DashboardView
              user={user}
              courses={courses}
              onSelectCourse={(course) => setActiveCourse(course)}
              onOpenImport={() => setActiveTab('import')}
              onOpenCreate={() => setShowCreateModal(true)}
              onOpenLeaderboard={() => setActiveTab('leaderboard')}
              onDeleteCourse={handleDeleteCourse}
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
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
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
            />
          ) : activeTab === 'leaderboard' ? (
            <LeaderboardView user={user} />
          ) : activeTab === 'achievements' ? (
            <BadgesView user={user} onUpdateUser={setUser} />
          ) : activeTab === 'shop' ? (
            <RewardsShopView user={user} onUpdateUser={setUser} />
          ) : null}
        </main>
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

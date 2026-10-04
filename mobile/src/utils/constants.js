// ─── NexusLearn Mobile — Shared Constants ──────────────────────────────────

// Replace with your actual server URL when deployed
// For local dev, use your machine's LAN IP (not localhost) so the phone can reach it
export const API_BASE_URL = 'http://localhost:3000';

export const LEVEL_TIERS = [
  { level: 1, title: 'Novice Scholar',      minXP: 0,    maxXP: 250  },
  { level: 2, title: 'Adept Explorer',      minXP: 250,  maxXP: 600  },
  { level: 3, title: 'Knowledge Seeker',    minXP: 600,  maxXP: 1100 },
  { level: 4, title: 'Grand Polymath',      minXP: 1100, maxXP: 1750 },
  { level: 5, title: 'Master Architect',    minXP: 1750, maxXP: 2500 },
  { level: 6, title: 'Sage of Systems',     minXP: 2500, maxXP: 3500 },
  { level: 7, title: 'Grandmaster Luminary',minXP: 3500, maxXP: 5000 },
];

export function calculateLevel(xp = 0) {
  for (let i = LEVEL_TIERS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_TIERS[i].minXP) {
      const current  = LEVEL_TIERS[i];
      const span     = current.maxXP - current.minXP;
      const earned   = xp - current.minXP;
      const progress = Math.min(100, Math.max(0, Math.round((earned / span) * 100)));
      return { ...current, progress, nextLevelXP: current.maxXP, neededXP: Math.max(0, current.maxXP - xp) };
    }
  }
  return { ...LEVEL_TIERS[0], progress: 0, nextLevelXP: 250, neededXP: 250 };
}

export const DEFAULT_USER = {
  username: 'default_learner',
  name: 'Learner',
  avatar: '🎓',
  title: 'Novice Scholar',
  xp: 0,
  coins: 100,
  streak: 0,
  streakFrozen: false,
  doubleXPUntil: null,
  lastActiveDate: new Date().toISOString().split('T')[0],
  completedLessons: [],
  quizScores: {},
  unlockedAchievements: [],
  inventory: ['theme_cyberpunk'],
  activeTheme: 'cyberpunk',
  lessonNotes: {},
  soundEnabled: true,
};

export const ACHIEVEMENTS = [
  { id: 'first_lesson',    title: 'First Steps',      description: 'Complete your first lesson.',              category: 'Learning',   tier: 'Bronze',   icon: 'trophy',         xpReward: 25  },
  { id: 'lesson_10',       title: 'Curious Mind',      description: 'Complete 10 lessons.',                     category: 'Learning',   tier: 'Silver',   icon: 'brain',          xpReward: 75  },
  { id: 'lesson_50',       title: 'Knowledge Seeker',  description: 'Complete 50 lessons.',                     category: 'Learning',   tier: 'Gold',     icon: 'graduation-cap', xpReward: 150 },
  { id: 'quiz_perfect',    title: 'Perfectionist',     description: 'Earn a perfect score on a quiz.',          category: 'Quizzes',    tier: 'Gold',     icon: 'award',          xpReward: 100 },
  { id: 'streak_7',        title: 'On a Roll',         description: 'Maintain a seven day learning streak.',    category: 'Streaks',    tier: 'Silver',   icon: 'flame',          xpReward: 100 },
  { id: 'folder_master',   title: 'Folder Master',     description: 'Import a course from your device.',        category: 'Creation',   tier: 'Bronze',   icon: 'folder-sync',    xpReward: 50  },
  { id: 'creator_initiate',title: 'Creator Initiate',  description: 'Create your first course.',                category: 'Creation',   tier: 'Bronze',   icon: 'rocket',         xpReward: 50  },
  { id: 'xp_1000',         title: 'Rising Scholar',    description: 'Earn 1,000 experience points.',           category: 'Milestones', tier: 'Platinum', icon: 'trophy',         xpReward: 150 },
];

export const SHOP_ITEMS = [
  { id: 'theme_cyberpunk',    name: 'Cyberpunk',     description: 'The original neon academy theme.',                          type: 'theme', themeId: 'cyberpunk',    icon: 'sparkles', cost: 0,   previewColors: ['#4338ca', '#a855f7'] },
  { id: 'theme_ocean',        name: 'Ocean Depths',  description: 'A cool blue theme for focused study.',                      type: 'theme', themeId: 'ocean',        icon: 'palette',  cost: 250, previewColors: ['#0369a1', '#06b6d4'] },
  { id: 'theme_forest',       name: 'Forest',        description: 'A calm green palette for your workspace.',                  type: 'theme', themeId: 'forest',       icon: 'palette',  cost: 250, previewColors: ['#047857', '#34d399'] },
  { id: 'title_visionary',    name: 'Visionary',     description: 'Equip the Visionary scholar title.',                        type: 'title', titleValue: 'Visionary', icon: 'crown',    cost: 300  },
  { id: 'title_code_wizard',  name: 'Code Wizard',   description: 'Equip the Code Wizard scholar title.',                     type: 'title', titleValue: 'Code Wizard',icon: 'brain',   cost: 400  },
  { id: 'item_streak_freeze', name: 'Streak Freeze', description: 'Protect your streak for one missed day.',                  type: 'item',  icon: 'shield',           cost: 200  },
];

export const AVATARS = ['🎓','👨‍💻','👩‍💻','🧑‍🎨','🧑‍🔬','🧙','🦊','🐉','🚀','⚡','🌟','🔥'];

// Tier colours
export const TIER_COLORS = {
  Bronze:   '#cd7f32',
  Silver:   '#94a3b8',
  Gold:     '#f59e0b',
  Platinum: '#38bdf8',
  Diamond:  '#38bdf8',
};

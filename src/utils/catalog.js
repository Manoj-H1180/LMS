export const ACHIEVEMENTS = [
  { id: 'first_lesson', title: 'First Steps', description: 'Complete your first lesson.', category: 'Learning', tier: 'Bronze', icon: 'BookOpen', xpReward: 25 },
  { id: 'lesson_10', title: 'Curious Mind', description: 'Complete 10 lessons.', category: 'Learning', tier: 'Silver', icon: 'Brain', xpReward: 75 },
  { id: 'lesson_50', title: 'Knowledge Seeker', description: 'Complete 50 lessons.', category: 'Learning', tier: 'Gold', icon: 'GraduationCap', xpReward: 150 },
  { id: 'quiz_perfect', title: 'Perfectionist', description: 'Earn a perfect score on a quiz.', category: 'Quizzes', tier: 'Gold', icon: 'Award', xpReward: 100 },
  { id: 'streak_7', title: 'On a Roll', description: 'Maintain a seven day learning streak.', category: 'Streaks', tier: 'Silver', icon: 'Flame', xpReward: 100 },
  { id: 'folder_master', title: 'Folder Master', description: 'Import a course from your device.', category: 'Creation', tier: 'Bronze', icon: 'FolderSync', xpReward: 50 },
  { id: 'creator_initiate', title: 'Creator Initiate', description: 'Create your first course.', category: 'Creation', tier: 'Bronze', icon: 'Rocket', xpReward: 50 },
  { id: 'xp_1000', title: 'Rising Scholar', description: 'Earn 1,000 experience points.', category: 'Milestones', tier: 'Platinum', icon: 'Trophy', xpReward: 150 },
];

export const SHOP_ITEMS = [
  { id: 'theme_cyberpunk', name: 'Cyberpunk', description: 'The original neon academy theme.', type: 'theme', themeId: 'cyberpunk', icon: 'Sparkles', cost: 0, previewGradient: 'linear-gradient(135deg, #4338ca, #a855f7)' },
  { id: 'theme_ocean', name: 'Ocean Depths', description: 'A cool blue theme for focused study.', type: 'theme', themeId: 'ocean', icon: 'Palette', cost: 250, previewGradient: 'linear-gradient(135deg, #0369a1, #06b6d4)' },
  { id: 'theme_forest', name: 'Forest', description: 'A calm green palette for your workspace.', type: 'theme', themeId: 'forest', icon: 'Palette', cost: 250, previewGradient: 'linear-gradient(135deg, #047857, #34d399)' },
  { id: 'title_visionary', name: 'Visionary', description: 'Equip the Visionary scholar title.', type: 'title', titleValue: 'Visionary', icon: 'Crown', cost: 300 },
  { id: 'title_code_wizard', name: 'Code Wizard', description: 'Equip the Code Wizard scholar title.', type: 'title', titleValue: 'Code Wizard', icon: 'Brain', cost: 400 },
  { id: 'item_streak_freeze', name: 'Streak Freeze', description: 'Protect your streak for one missed day.', type: 'item', icon: 'Shield', cost: 200 },
];

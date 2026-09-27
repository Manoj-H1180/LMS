# NexusLearn LMS — Next.js Fullstack Learning Platform

A comprehensive, all-in-one Learning Management System built entirely in **Next.js** (App Router). No separate backend needed — Next.js handles server route handlers, state synchronization, AI tutor capabilities, and high-performance client rendering all in one project.

---

## ✨ Features

- **Built with Next.js App Router**: Optimized rendering, SSR-safe hydration, and integrated Route Handlers.
- **Unified Fullstack (No Separate Backend Needed)**:
  - `/api/courses`: Complete course catalog retrieval, creation, importing, and deletion.
  - `/api/user`: User progression, XP, coins, streaks, notes, and achievement state sync.
  - `/api/leaderboard`: Dynamic live leaderboard calculations and rankings.
  - `/api/ai-tutor`: Integrated AI Study Buddy for instant lesson explanations, key takeaways, and practice quizzes.
- **Local Course Ingestion Engine**:
  - Drag-and-drop or select any local folder or ZIP archive containing video/markdown/quiz files.
  - Automatically parses folder hierarchy into modules and lessons.
- **Interactive Course Studio**:
  - Visual course creation modal to design modules, video links, markdown content, and custom multi-choice quizzes with explanations.
- **Rich Course Player**:
  - Multi-speed video player.
  - Markdown lesson notes and instant personal note-taking.
  - Interactive quizzes with instant feedback, explanations, and sound effects.
  - Verifiable Certificate Generator upon course completion with instant print/download.
- **Gamification & Rewards**:
  - Level progression tiers (Novice Scholar to Grandmaster Luminary).
  - XP streaks, double XP boosts, and streak freezes.
  - Unlockable quest achievements and badges.
  - In-app Shop for themes (Cyberpunk, Emerald Matrix, Solar Flare, Royal Velvet) and avatar items.
  - Synthesized Web Audio API sound effects and multi-pattern confetti fanfare.

---

## 🚀 Getting Started

### Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
npm run start
```

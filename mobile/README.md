# NexusLearn Mobile 📱

A full-featured **React Native (Expo)** mobile app for the NexusLearn LMS, mirroring all features of the web app.

## ✨ Features

| Feature | Description |
|---------|-------------|
| **Auth** | Login / Signup with avatar picker |
| **Dashboard** | Hero XP banner, level progress, streak, in-progress course carousel, course grid |
| **Course Player** | Module/lesson sidebar, content view, notes editor, interactive quizzes |
| **Leaderboard** | Live XP & streak rankings with medal icons |
| **Achievements** | Full badge grid with tier colors, lock/unlock state |
| **Shop** | Themes, titles, streak freeze — purchase with coins |
| **Profile** | Stats overview, recent badges, settings, sign-out |

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo Go app on your phone ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))
- The NexusLearn web server running (for backend API)

### 1. Set your server URL

Open `src/utils/api.js` and update:
```js
export const API_BASE_URL = 'http://YOUR_LAN_IP:3000';
```

> **Why not `localhost`?** On a real phone, `localhost` refers to the phone itself — use your computer's local network IP (e.g. `192.168.1.x`).
> Find it with `ipconfig` on Windows.

### 2. Start the dev server

```bash
cd mobile
npx expo start
```

Then scan the QR code with **Expo Go** on your phone.

### 3. Run on Android emulator
```bash
npx expo start --android
```

### 4. Run on iOS simulator (macOS only)
```bash
npx expo start --ios
```

## 📁 Project Structure

```
mobile/
├── App.js                    ← Root app, navigation, global state
├── app.json                  ← Expo config (name, icons, plugins)
└── src/
    ├── screens/
    │   ├── AuthScreen.js     ← Login / Signup
    │   ├── DashboardScreen.js← Home with course grid
    │   ├── CoursePlayerScreen.js ← Lesson player + quiz
    │   ├── LeaderboardScreen.js  ← Global rankings
    │   ├── AchievementsScreen.js ← Badge collection
    │   ├── ShopScreen.js     ← Reward store
    │   └── ProfileScreen.js  ← Profile + settings
    ├── components/
    │   └── CourseCard.js     ← Reusable course card
    └── utils/
        ├── api.js            ← Backend API + AsyncStorage helpers
        ├── constants.js      ← Level tiers, achievements, shop items
        └── theme.js          ← Colors, typography, spacing tokens
```

## 🔗 Backend API

The mobile app connects to the same Next.js API routes as the web app:

| Route | Description |
|-------|-------------|
| `GET/POST /api/auth` | Session check, login, signup, logout |
| `GET/POST /api/courses` | Course list + save |
| `GET/POST /api/user` | User profile |
| `GET/POST /api/progress` | Lesson progress |
| `GET /api/leaderboard` | Rankings |

## 🎨 Design

Dark glassmorphism theme matching the web app:
- Background: `#0b0d17`
- Accent: `#6366f1` / `#a855f7` gradient
- Typography: system fonts with 800 weight headings

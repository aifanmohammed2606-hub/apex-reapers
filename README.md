# ⚔️ Apex Reapers — MLBB Tournament Manager

A professional dark-themed esports squad management SPA built with React + Vite + Tailwind CSS.

---

## 🚀 Features

| Feature | Details |
|---|---|
| **Dashboard** | Live stats, next tournament countdown, idle player alerts |
| **Player Management** | Add/Edit/Delete · Role assignment · Availability toggle |
| **Tournament Management** | Add/Edit/Delete · Format (BO1/BO3/BO5) · Prize pool · Status |
| **Lineup Manager** | Per-tournament role slots · Substitutes · Duplicate prevention |
| **Participation Tracker** | Matrix view · Played / Sub / Idle indicators |

---

## 📦 Installation

### Prerequisites
- Node.js ≥ 18  
- npm ≥ 9

### Steps

```bash
# 1. Clone or unzip the project
cd apex-reapers

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🏗️ Build for Production

```bash
npm run build
# Output is in the /dist folder
```

Preview the production build locally:
```bash
npm run preview
```

---

## ☁️ Deploy to Vercel

### Option A — Vercel CLI (recommended)

```bash
npm install -g vercel
vercel login
vercel          # follow prompts — framework: Vite, output: dist
```

### Option B — Vercel Dashboard

1. Push your project to GitHub
2. Go to [vercel.com](https://vercel.com) → **Add New Project**
3. Import your repo
4. Set **Framework Preset** to `Vite`
5. Set **Output Directory** to `dist`
6. Click **Deploy** 🚀

The included `vercel.json` handles SPA routing automatically.

---

## 📁 Project Structure

```
apex-reapers/
├── public/
│   └── favicon.svg
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.jsx        # Top nav bar
│   │   │   ├── Sidebar.jsx       # Side navigation
│   │   │   └── Layout.jsx        # Page wrapper
│   │   └── ui/
│   │       ├── Badge.jsx         # Role / status chips
│   │       ├── ConfirmDialog.jsx # Delete confirmations
│   │       ├── EmptyState.jsx    # Zero-data placeholders
│   │       └── Modal.jsx         # Reusable modal shell
│   ├── context/
│   │   └── AppContext.jsx        # Global state + actions
│   ├── data/
│   │   └── initialData.js        # Seed data + constants
│   ├── hooks/
│   │   └── useLocalStorage.js    # Persistent state hook
│   ├── pages/
│   │   ├── Dashboard.jsx
│   │   ├── Players.jsx
│   │   ├── Tournaments.jsx
│   │   ├── Lineup.jsx
│   │   └── Tracker.jsx
│   ├── utils/
│   │   └── helpers.js            # Pure utility functions
│   ├── App.jsx                   # Root router component
│   ├── index.css                 # Tailwind + custom styles
│   └── main.jsx                  # Entry point
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
├── vercel.json
└── README.md
```

---

## 🔌 Future Database Migration

The app is structured for zero-refactor migration to Firebase or Supabase:

1. Replace `useLocalStorage` hook with API calls in `AppContext.jsx`
2. All data models already match document/table schemas
3. All IDs use `generateId()` — swap for auto-generated DB IDs
4. Timestamps (`createdAt`, `updatedAt`) are ISO strings — compatible with Firestore / Postgres

---

## 🎨 Tech Stack

- **React 18** — UI framework
- **Vite 5** — Build tool
- **Tailwind CSS 3** — Utility-first styling
- **Lucide React** — Icon library
- **LocalStorage** — Persistence (ready for DB swap)

---

*Built for Apex Reapers MLBB squad · Season 2025*

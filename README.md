# 🛡️ Bunker — Secure Client Portal & Project Management Platform

> A modern, high-performance client portal and project management platform built with React 19, TypeScript, Vite, Tailwind CSS v4, and Supabase.

---

## 🌟 Key Features

### 🔒 Client Portal & Secure Share Links
- **Encrypted Share Token Access**: Share secure, tokenized portal links with clients without requiring registration or passwords.
- **Granular Module Permissions**: Toggle access to specific modules (Overview, Timeline, Deliverables, Downloads, Documentation, GitHub, Finance).
- **Access Telemetry & Analytics**: Real-time tracking of view counts, access history timeline, browser, OS, and client device metadata.
- **Expiration & Security Controls**: Expiration dates, password protection, and automated RLS security policies.

### 📦 Deliverables & Escrow Unlock Engine
- **Milestone Escrow Thresholds**: Lock deliverables behind milestone payment completion percentages (e.g., 25%, 50%, 75%, 100%).
- **Signed Download Links**: Single-use, time-restricted signed URLs for asset downloads.
- **Cryptographic Verification**: SHA-256 checksum display and copy utility for verified package integrity.

### 🚩 Milestones & Roadmaps
- **Interactive Milestone Stepper**: Visual delivery timeline with progress tracking, priority tags, and overdue countdowns.
- **Full CRUD & Management**: Admin controls for creating, updating, reordering, and attaching assets to milestones.
- **Responsive Layout**: Designed for mobile and desktop screens with zero overflow.

### 📝 Technical Documentation Workspace
- **Rich Markdown Workspace**: Real-time preview with GitHub Flavored Markdown support.
- **Mermaid Diagrams & Math Expressions**: Native support for architecture flowcharts, sequence diagrams, and mathematical notation.
- **Table of Contents & Lightbox**: Dynamic outline generation and image lightbox modal.

### 💳 Finance & Escrow Tracking
- **Milestone Escrow Roadmap**: Clear visual breakdown of paid vs. pending project escrow.
- **Payment Reminder Popups**: Interactive modal windows for clearing milestone payments.

---

## 🛠️ Technology Stack

| Category | Technology |
|---|---|
| **Frontend Core** | React 19, TypeScript, Vite |
| **Styling & UI** | Tailwind CSS v4, Framer Motion, Hugeicons, Lucide React |
| **State & Data Fetching** | TanStack React Query v5, Zustand, React Router v7 |
| **Backend & DB** | Supabase (PostgreSQL, Row Level Security, RPCs) |
| **Serverless & API** | Supabase Edge Functions (Deno) |
| **Charts & Visuals** | Recharts, Mermaid.js |
| **Deployment** | Vercel |

---

## 🚀 Quick Start

### 1. Prerequisites
- Node.js 18+
- npm or pnpm
- Supabase project

### 2. Installation

Clone the repository and install dependencies:

```bash
git clone https://github.com/<YOUR_USERNAME>/bunker.git
cd bunker
npm install
```

### 3. Environment Setup

Create a `.env` file in the root directory:

```env
VITE_SUPABASE_URL=https://your-supabase-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 4. Running Locally

Start the Vite development server:

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🗄️ Database Setup (Supabase)

All database migrations are located in `supabase/migrations/`.

To apply all migrations to your Supabase instance:

```bash
# Link your Supabase project
npx supabase link --project-ref <YOUR_SUPABASE_PROJECT_REF>

# Apply all database migrations
npx supabase db push
```

---

## 🌐 Deploying to Vercel

1. Push your repository to **GitHub**:
   ```bash
   git remote add origin https://github.com/<YOUR_USERNAME>/bunker.git
   git branch -M main
   git push -u origin main
   ```

2. Import the project in **[Vercel](https://vercel.com)**:
   - Add environment variables: `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. Click **Deploy**!

---

## 📄 License

MIT License © 2026 Bunker Project

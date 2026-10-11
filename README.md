# MoveInSync Pulse — AI-Powered Review Intelligence & Commute Reliability Platform

> **Submission for MoveInSync Forward Deployed Engineer (Intern to FTE) Candidate Assignment**

MoveInSync Pulse is an enterprise-grade web application designed to help Product and Engineering teams investigate why employee transportation apps receive negative Play Store ratings and systematically prioritize, simulate, and resolve reliability bottlenecks.

---

## 🌟 Key Capabilities

### 1. Executive Summary & Rating Health
- **Live KPI Dashboard**: Real-time tracking of Average App Rating, Negative Review Share (1–2 stars), Booking Complaint Share, and Open P0/P1 issues.
- **Rating Trajectory**: Monthly trend visualization identifying release regressions and stability dips.
- **Sentiment Balance**: Interactive breakdowns distinguishing frustrated employees from positive reviews.
- **Domain Heatmap**: Root cause distribution across 12 commute stages (Booking, GPS/ETA, Notifications, Pickup Timing, Check-in/No-show, Routing, Safety, Support, etc.).

### 2. Review Explorer & Intelligent Classification
- **Deep Search & Filtering**: Multi-dimensional filtering by Rating (1–5★), Platform (Google Play, App Store), Severity (Critical, High, Medium, Low), and Category.
- **Automated Domain Tagging**: Rule-based & AI inference mapping raw feedback to specific commute failure modes with confidence scores.
- **Human-in-the-Loop Override**: Forward Deployed Engineers can adjust classification for edge-case feedback.
- **One-Click CSV Export**: Download normalized review datasets for offline analysis.

### 3. Prioritized Problem Space & Issues Backlog
- **Weighted FDE Priority Scoring Formula (0–100)**:
  $$\text{Score} = 30\% \text{ Severity} + 25\% \text{ Frequency} + 20\% \text{ Commute SLA Risk} + 15\% \text{ Trend Velocity} + 10\% \text{ Confidence}$$
- **Root Cause Hypotheses**: Engineering breakdowns of why issues occur (e.g. static routing ignoring peak traffic, cross-midnight timezone offsets).
- **One-Click Sprint Conversion**: Directly generate sprint-ready engineering tickets from analyzed root causes.

### 4. Forward Deployed Engineering (FDE) Task Board
- **Kanban Board**: Drag-and-drop / click transitions across Sprint Backlog, In Progress, Verification, and Shipped.
- **Detailed Specifications**: Acceptance criteria (Definition of Done), proposed architectural fixes, and observability telemetry requirements.

### 5. Commute Solution Simulator & A/B Experiments
- **Compound Rating Lift Engine**: Interactively toggle specific architectural fixes to project compound Play Store rating recovery (+0.35★ to +0.8★) and complaint volume drops (-73%).
- **Experimentation Matrix**: Track controlled A/B test cohorts, sample sizes, and SLA targets.

### 6. Grounded Natural Language AI ("Ask Pulse")
- **Evidence-Grounded Querying**: Ask questions like *"Why did ratings drop?"*, *"What are the top booking complaints?"*, or *"What should engineering fix first?"*.
- **Review Citations**: Every answer is directly backed by excerpts and verified review IDs.

### 7. Executive Briefing Report
- **Print & PDF-Ready Synthesis**: Formatted executive report for MoveInSync Leadership with 90-day execution milestones.

---

## 🛠️ Tech Stack & Architecture

- **Frontend**:
  - React 19 + TypeScript + Vite
  - Tailwind CSS v4 + Custom Glassmorphism & Micro-animations
  - Recharts (Interactive Line, Bar, and Distribution Visualizations)
  - Lucide React (Modern iconography)
  - Axios + React Router DOM v7
- **Backend**:
  - Node.js + Express + TypeScript
  - Modular Service Architecture (Dashboard, Reviews, Issues, Tasks, Experiments, Insights)
  - Dual Storage: MongoDB support with **Deterministic In-Memory Fallback** (zero-config local demo)
  - Vitest + Supertest (Automated test suite with 100% pass rate)

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- Node.js (v18+)
- npm

### 2. Backend Server Setup
```bash
cd server
npm install
npm test          # Runs automated Vitest test suite (9 passing tests)
npm run dev       # Starts server on http://localhost:3001
```

### 3. Frontend Client Setup
```bash
cd client
npm install
npm run build     # Validates TypeScript & builds production bundle
npm run dev       # Starts Vite dev server on http://localhost:5173
```

Open `http://localhost:5173/` in your browser.

---

## 🧪 Testing & Verification

- **Automated Backend Tests**: `npm test` runs 9 comprehensive test suites covering Health, Dashboard KPIs, Paginated Reviews, Issues, Task Generation, and Classification Services.
- **Browser Automation Verification**: Verified via subagent recording (`moveinsync_pulse_demo.webp`).

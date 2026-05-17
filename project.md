# SoloLearning — AI Engineering Execution Plan

# Purpose

This document defines:
- engineering execution phases,
- implementation priorities,
- AI-agent workflows,
- development tasks,
- and architecture sequencing

for building SoloLearning using:
- Next.js,
- Express.js,
- PostgreSQL,
- Redis,
- Docker,
- Socket.IO,
- TypeScript.

---

# Engineering Philosophy

## Core Principle

AI should accelerate:
- boilerplate,
- repetitive tasks,
- scaffolding,
- UI generation,
- documentation.

Humans should control:
- architecture,
- realtime logic,
- security,
- game economy,
- product decisions.

---

# AI Tool Roles

| Tool | Responsibility |
|---|---|
| Cursor | Implementation & refactoring |
| Claude | Architecture & reasoning |
| ChatGPT | Planning & documentation |
| v0 | UI scaffolding |
| GitHub Copilot | Inline autocomplete |

---

# Development Workflow

# Standard AI Workflow

```txt
1. Define task
2. Create architecture notes
3. Generate scaffold with AI
4. Human review/refactor
5. Add tests
6. Validate UX
7. Merge
Repository Setup Phase
Phase 0 — Foundation & Infrastructure
Goal

Set up scalable engineering foundation.

TODO 0.1 — Initialize Monorepo
AI Prompt
Create a Turborepo monorepo with:
- apps/web (Next.js)
- apps/api (Express.js)
- packages/ui
- packages/types
- packages/game-engine
- packages/socket-contracts
- TypeScript everywhere
TODO 0.2 — Configure Shared Tooling
Tasks
ESLint
Prettier
Husky
lint-staged
shared tsconfig
path aliases
TODO 0.3 — Docker Setup
Tasks

Create Docker setup for:

Next.js
Express
PostgreSQL
Redis
TODO 0.4 — Environment Management
Tasks
.env.example
environment validation
shared config package
TODO 0.5 — GitHub Actions
CI Tasks
lint
typecheck
tests
Docker build validation
Product Foundation Phase
Phase 1 — Authentication & Core Layout
Goal

Create app foundation and navigation.

TODO 1.1 — Next.js App Router Setup
Tasks
App Router structure
route groups
layouts
loading states
error boundaries
TODO 1.2 — Design System Setup
Tasks

Build reusable UI primitives:

buttons
cards
modals
bottom navigation
progress bars
avatars
badges
UI Direction

Must feel:

Duolingo-inspired
playful
rounded
touch-friendly
TODO 1.3 — Theme System
Tasks
color tokens
typography
spacing scale
dark mode support
TODO 1.4 — Authentication Backend
Express Tasks
register
login
refresh token
logout
JWT validation
TODO 1.5 — Frontend Auth Flow
Tasks
auth pages
protected routes
session persistence
auth store
TODO 1.6 — User Profile Model
Database Fields
username
avatar
XP
rank
streak
badges
Learning System Phase
Phase 2 — Course & Roadmap System
Goal

Implement the learning experience.

TODO 2.1 — Course Database Schema
Models
subjects
courses
chapters
topics
levels
TODO 2.2 — Course APIs
CRUD APIs
create course
update course
fetch roadmap
fetch lessons
TODO 2.3 — Roadmap Rendering Engine
MOST IMPORTANT FEATURE
Tasks

Build:

curved roadmap
vertical scrolling
animated nodes
progression paths
friend pins
Technical Requirements

Use:

SVG paths
Framer Motion
virtualization
TODO 2.4 — Lesson Engine
Features
lesson cards
MCQs
progression tracking
lesson completion flow
TODO 2.5 — Progress Tracking
Features
completed lessons
completed topics
XP tracking
roadmap unlocking
Gamification Phase
Phase 3 — XP, Ranks & Streaks
Goal

Implement progression systems.

TODO 3.1 — XP Engine
Features
XP calculation service
reward triggers
XP transactions
anti-abuse validation
TODO 3.2 — Rank System
Features
rank thresholds
automatic promotions
automatic demotions
Rank Hierarchy
Newbie
Rookie
Rising
Star
Super Star
Pro
Elite
Master
Grandmaster
Legend
Mythic
Immortal
TODO 3.3 — Streak System
Features
daily tracking
streak continuation
streak rewards
TODO 3.4 — Badge System
Features
badge definitions
unlock conditions
badge UI
TODO 3.5 — Leaderboards
Types
global
friends
course-specific
Social System Phase
Phase 4 — Friends & Social Features
Goal

Build social engagement systems.

TODO 4.1 — Friend System
Features
add/remove friend
pending requests
friend list
TODO 4.2 — Friend Activity Feed
Activities
course completion
rank upgrades
streak milestones
challenge victories
TODO 4.3 — Shared Roadmap Presence
Features

Show:

friend avatars
friend progression positions

on roadmap nodes.

Realtime Challenge Phase
Phase 5 — PvP Challenge System
Goal

Build realtime competitive gameplay.

TODO 5.1 — Socket.IO Infrastructure
Features
websocket auth
room management
reconnection handling
TODO 5.2 — Challenge Lifecycle
Flow
Challenge
→ Accept
→ Match Room
→ Countdown
→ Questions
→ Results
→ XP Update
TODO 5.3 — Matchmaking Engine
Features
challenge invitations
active rooms
queue handling
TODO 5.4 — MCQ Arena UI
Features
live timer
score tracking
answer animations
realtime updates
TODO 5.5 — Server Authoritative Logic
IMPORTANT

Server controls:

scoring
timers
question order
XP rewards
TODO 5.6 — Anti-Cheat Protection
Features
answer timing validation
challenge cooldowns
abuse detection
Admin Panel Phase
Phase 6 — Admin Dashboard
Goal

Enable content management.

TODO 6.1 — Admin Authentication
Features
RBAC
protected admin routes
TODO 6.2 — Course Management UI
Features
create/edit course
reorder levels
archive courses
TODO 6.3 — Lesson Builder
Features
markdown editor
MCQ editor
XP configuration
TODO 6.4 — Question Management
Features
add/update questions
tagging
difficulty system
TODO 6.5 — User Moderation
Features
user lookup
XP adjustments
ban system
TODO 6.6 — Analytics Dashboard
Metrics
DAU
retention
challenge participation
course completion
UI/UX Polish Phase
Phase 7 — Delight & Experience
Goal

Make app feel alive.

TODO 7.1 — Animation System
Features
XP animations
node unlock animations
streak effects
reward celebrations
TODO 7.2 — Notification System
Types
streak reminders
challenge invites
rank upgrades
badge unlocks
TODO 7.3 — Empty States
Features
playful illustrations
onboarding hints
guidance messaging
TODO 7.4 — Loading States
Features
skeleton loaders
animated placeholders
smooth transitions
Optimization Phase
Phase 8 — Performance & Scaling
Goal

Optimize realtime performance.

TODO 8.1 — Redis Caching
Cache
leaderboards
active matches
user presence
TODO 8.2 — Query Optimization
Tasks
indexes
pagination
optimized joins
TODO 8.3 — Roadmap Virtualization
IMPORTANT

Avoid rendering:

hundreds of roadmap nodes at once.
TODO 8.4 — Rate Limiting
Protect
auth routes
challenge spam
websocket abuse
TODO 8.5 — Monitoring
Add
logging
error tracking
analytics
AI Prompting Standards
Cursor Prompt Template
Context:
We use:
- TypeScript
- Next.js App Router
- Express.js
- Prisma
- Zustand
- React Query
- Tailwind

Rules:
- No any types
- Functional components only
- Reusable hooks
- Feature-first architecture
- Mobile-first responsive design

Task:
<insert task>
Code Review Rules
Human Must Review
auth logic
realtime logic
DB migrations
security-sensitive code
XP calculations
Engineering Standards
Frontend Standards
mobile-first
accessible
reusable components
optimistic UI
Backend Standards
modular architecture
service/repository separation
DTO validation
transaction safety
Performance Goals
Metric	Goal
First load	<2s
Challenge latency	<150ms
Roadmap FPS	60fps
API response	<300ms
MVP Definition
MVP Includes
auth
courses
roadmap
lessons
XP
ranks
streaks
friends
realtime challenges
leaderboards
admin dashboard
Non-MVP Features

Excluded initially:

clans
tournaments
AI tutor
battle pass
voice chat
marketplace
Final Engineering Goal

Build a platform that feels like:

“Duolingo meets Candy Crush meets competitive multiplayer gaming”

with:

modern UX,
realtime gameplay,
social progression,
and addictive learning loops.
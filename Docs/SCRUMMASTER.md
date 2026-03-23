# The Meridian Project — Scrummaster & Build Phases

## How To Use This Document

Each phase below is a discrete, handoff-ready unit. When you are ready to build a phase, take the phase section to a builder agent along with the relevant sections from TRD.md (for technical specs) and DESIGN.md (for design system). The phase spec tells the agent exactly what to build, what done looks like, and what it depends on.

---

## Current Status (March 2026)

### What Shipped (Phase UI + Phase 3A)

A production Next.js app at the project root with:
- **Homepage** (`app/page.tsx`) — case list sidebar, dashboard stats, active investigation card, queue table, methodology section
- **Investigation Workspace** (`app/case/[id]/page.tsx`) — full three-column layout for Case 001 (Nimitz)
- **All interactive features working:** right-click annotations, ACH matrix voting, evidence linking, card selection, search UI, 6 investigation tabs
- **localStorage persistence** for annotations, ACH votes, evidence links via custom hooks (`hooks/useAnnotations.ts`, `hooks/useACHVotes.ts`, `hooks/useEvidenceLinks.ts`)
- **Design system fully implemented** — Instrument Serif, JetBrains Mono, Oswald, Caveat fonts + full color system

### What's Still Hardcoded
- Workspace page has ~200 lines of `const` data arrays (timeline, evidence, witnesses, AI cards, questions, etc.) at the top of `app/case/[id]/page.tsx`
- The `[id]` route param is ignored — workspace always shows Nimitz regardless of URL
- Cases 002-006 are listed on homepage but have no data files
- Search returns 5 static demo results

### Architecture Issues to Address
1. **Single-file workspace** — 700+ line component needs decomposition
2. **No backend** — localStorage only, no multi-user support
3. **No auth** — Nemo vs Claude is action-based, not login-based
4. **Demo search** — needs real search backend

---

## Phase Overview

| Phase | Name | Status | Description |
|-------|------|--------|-------------|
| UI | Design Exploration | ✅ SHIPPED | Prototypes, design system, interaction model |
| 3A | Initial Build | ✅ SHIPPED | Next.js app, homepage, workspace for Case 001 |
| 3B | Architecture & Cases | 🔄 NEXT | Refactor workspace, wire routing, add cases 002-006 |
| 4 | Backend & Persistence | ⬜ Planned | Supabase, real auth, server-side persistence |
| 5 | Corpus Engine | ⬜ Planned | Data ingest pipeline, credibility scoring |
| 6 | Findings & Query | ⬜ Planned | AI pattern reports, natural language search |
| 7 | Contributions & Launch | ⬜ Planned | Public submissions, polish, launch |

---

## Phase UI — Design Exploration ✅ SHIPPED

**Goal:** Establish the design system, interaction model, and content structure through interactive prototypes.

**What shipped:**
- HTML prototypes in `/prototype/` — `index.html` (homepage) and `case-workspace.html` (investigation workspace)
- Full design system: Instrument Serif, JetBrains Mono, Oswald, Caveat fonts + complete color palette
- Three-column workspace layout with right-click annotation system
- ACH matrix, evidence linking, search & import, solvability scoring
- Full Case 001 (Nimitz) data in `prototype/data/case-001-nimitz.json`
- Design docs updated: DESIGN.md, PRD.md, all phase specs aligned with prototype

---

## Phase 3A — Initial Build ✅ SHIPPED

**Goal:** Turn the prototype into a running Next.js app with the homepage and Case 001 workspace fully functional.

**What shipped:**

### App Shell
- Next.js app with App Router, TypeScript, Tailwind CSS
- Project root: `/app`, `/components`, `/data`, `/hooks`, `/styles`
- Design tokens in CSS variables matching DESIGN.md

### Homepage (`app/page.tsx`)
- Left sidebar with case list (001-006) and status badges
- Dashboard stats, active investigation card, queue table
- Methodology section, investigator cards (Nemo + Claude)

### Investigation Workspace (`app/case/[id]/page.tsx`)
- Three-column layout: sidebar (200px) | case content (flex:1, max 860px) | investigation tools (460px)
- Full Nimitz case content: hero, summary, timeline, evidence cards, witness cards, AI analysis, open questions
- Right-click annotation system with inline note/URL input
- 6 investigation tabs: ACH, Resolution, OSINT, Links, Search, Score
- Card selection with gold border + tab switching

### Custom Hooks
- `useAnnotations.ts` — annotation CRUD with localStorage persistence
- `useACHVotes.ts` — ACH matrix voting with localStorage persistence
- `useEvidenceLinks.ts` — evidence linking with localStorage persistence

### Case Data
- `data/case-001-nimitz.json` — full structured case data
- `data/cases-index.ts` — case list for homepage

---

## Phase 3B — Architecture & Cases 🔄 NEXT

**Goal:** Refactor the workspace for multi-case support, extract hardcoded data, wire dynamic routing, and add cases 002-006.

**Deliverables:**

### 3B.1 Workspace Decomposition
Break `app/case/[id]/page.tsx` (~700 lines) into smaller components:
- `components/workspace/CaseContent.tsx` — center column content renderer
- `components/workspace/Sidebar.tsx` — left sidebar with TOC and meta
- `components/workspace/InvestColumn.tsx` — right column tab container
- `components/workspace/ContextMenu.tsx` — right-click annotation menu
- Individual tab components already exist in `components/workspace/tabs/`

### 3B.2 Data Extraction
Move hardcoded `const` arrays from `page.tsx` into JSON data files:
- Timeline events, evidence cards, witness cards, AI analysis cards
- Open questions, resolution items, OSINT items, chain items
- Search results (demo), solvability factors
- Target: `page.tsx` should only import data and render components

### 3B.3 Dynamic Route Loading
- Make `app/case/[id]/page.tsx` read the `[id]` param
- Load the correct case JSON based on the route
- Show 404 for cases without data
- Update homepage links to use correct routes

### 3B.4 Case Data Format Standard
- Define a canonical JSON schema for case data files
- Case 001 (Nimitz) already has `data/case-001-nimitz.json` — extend to include all workspace content (timeline, evidence, witnesses, AI analysis, etc.)
- Create template for new case files

### 3B.5 Cases 002-006 Data Files
Research and build complete case data for each:
- 002: Phoenix Lights (March 13, 1997)
- 003: Rendlesham Forest (December 26-28, 1980)
- 004: Belgian Wave (November 1989 – April 1990)
- 005: Tehran 1976 (September 19, 1976)
- 006: Aguadilla PR (April 25, 2013)

Each needs: timeline, evidence cards, witness cards, AI analysis, open questions, resolution items, OSINT items, solvability factors.

### 3B.6 Navigation & Polish
- "Back to Cases" link from workspace sidebar
- Case status badges update based on data availability
- Loading states for case data

**Done when:**
- Workspace renders correctly for any case ID with a data file
- All 6 cases have complete data files and render in the workspace
- `page.tsx` is under 200 lines (most content in components + data)
- All interactive features still work after refactor

**Dependencies:** Phase 3A complete (✅)

---

## Phase 4 — Backend & Persistence

**Goal:** Replace localStorage with real persistence. Add database, auth, and server-side storage so investigations persist across devices and support multiple users.

**Deliverables:**

### 4.1 Supabase Setup
- Supabase project with PostgreSQL
- Environment variables configured
- Database schema: cases, sources, annotations, ach_votes, evidence_links
- pgvector extension enabled for future semantic search
- Row-level security policies

### 4.2 Auth
- Supabase Auth for user identity
- Investigator profiles (Nemo = human, Claude = AI)
- Session management

### 4.3 Persistence Migration
- Replace `useAnnotations` localStorage → Supabase CRUD
- Replace `useACHVotes` localStorage → Supabase CRUD
- Replace `useEvidenceLinks` localStorage → Supabase CRUD
- Optimistic updates for snappy UX, sync to server

### 4.4 Case Data API
- `GET /api/cases` — list endpoint for homepage
- `GET /api/cases/[id]` — full case detail endpoint
- Server-side rendering for case pages (SEO)

**Done when:** Annotations, votes, and links persist across devices. Multiple users see each other's annotations.

**Dependencies:** Phase 3B complete.

---

## Phase 5 — Corpus Engine

**Goal:** Ingest real cases from public sources, process through extraction and scoring, populate the database at scale.

**Deliverables:**

### 5.1 NUFORC + Blue Book Ingest
- CSV/archive parsing, field mapping, batch processing
- Target: 100K+ cases loaded

### 5.2 Entity Extraction + Scoring
- Claude API extraction: craft shape, behavior, witness data, effects
- Weighted credibility scoring model → tier assignment

### 5.3 Embeddings & Cross-References
- Vector embeddings for semantic search
- Similarity-based cross-reference linking

**Done when:** 100K+ cases in database with scores, tiers, and embeddings.

**Dependencies:** Phase 4 complete (database exists).

---

## Phase 6 — Findings & Query

**Goal:** AI pattern reports + natural language corpus search.

**Deliverables:**

### 6.1 Findings Reports
- AI-generated pattern analysis (descriptor convergence, corroboration density)
- Editorial layout, methodology, confidence badges, cited cases
- Null findings with equal design weight

### 6.2 Query Interface
- Natural language research tool (NOT a chatbot)
- Hybrid retrieval: semantic + keyword
- Grounded responses with cited cases

**Done when:** 2+ published findings reports. Query returns grounded answers.

**Dependencies:** Phase 5 complete.

---

## Phase 7 — Contributions & Launch

**Goal:** Public submissions, performance, and launch readiness.

**Deliverables:**

### 7.1 Contribution Platform
- Multi-step submission form, AI screening, admin review, corpus integration

### 7.2 About & Methodology
- Mission, research questions, full methodology transparency

### 7.3 Performance & Polish
- SSR, Core Web Vitals, SEO, accessibility, mobile

**Done when:** Lighthouse ≥ 90 performance, ≥ 95 accessibility. Full end-to-end flow works.

**Dependencies:** All prior phases.

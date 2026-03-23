# The Meridian Project — Scrummaster & Build Phases

## How To Use This Document

Each phase below is a discrete, handoff-ready unit. When you are ready to build a phase, take the phase section to a builder agent along with the relevant sections from TRD.md (for technical specs) and DESIGN.md (for design system). The phase spec tells the agent exactly what to build, what done looks like, and what it depends on.

---

## Phase Overview

| Phase | Name | Description |
|-------|------|-------------|
| 1 | Foundation | Project setup, design system, schema, blank app shell |
| 2 | Corpus Engine | Data ingest, processing pipeline, credibility scoring |
| 3 | Evidence Index | Case browsing, case detail, map view, timeline view |
| 4 | Findings Layer | Report generation, findings pages, null findings |
| 5 | Query Interface | Natural language corpus search |
| 6 | Contribution Platform | Public submission form, AI screening, admin review |
| 7 | Polish & Launch | Homepage, about page, performance, public launch |

---

## Phase 1 — Foundation

**Goal:** A running Next.js app with design system implemented, database schema live, and all infrastructure connected. No visible product yet — this is the skeleton everything else is built on.

**Deliverables:**

### 1.1 Project Scaffolding
- Next.js 14+ app with TypeScript and App Router
- Tailwind CSS configured
- ESLint + Prettier configured
- Folder structure: `/app`, `/components`, `/lib`, `/types`, `/styles`

### 1.2 Design System Implementation
- CSS variables for full color system (see DESIGN.md — Color System)
- Font loading: Instrument Serif, JetBrains Mono, Oswald, Caveat via next/font or Google Fonts
- Tailwind config extended with design tokens
- Base typography styles — prose sizes for each font role
- Base component stubs: Button, Badge, Card, Divider, Tag

### 1.3 Infrastructure Setup
- Supabase project initialized
- Environment variables configured: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_KEY`, `ANTHROPIC_API_KEY`
- Vercel project connected to repo

### 1.4 Database Schema
Run migrations to create all core tables:
- `cases` — full schema per TRD.md
- `sources` — source registry
- `findings_reports` — report storage
- `contributions` — submission intake
- `contributor_annotations` — researcher annotation layer
- pgvector extension enabled
- Indexes on: cases.credibility_score, cases.date, cases.location fields, cases.credibility_tier

### 1.5 Background Job Setup
- Inngest or Trigger.dev initialized
- Placeholder job registered (no logic yet)

**Done when:** App builds and deploys to Vercel, database schema is live in Supabase, design tokens render correctly in a `/test` route showing all colors, fonts, and base components.

**Dependencies:** None. This is the starting point.

---

## Phase 2 — Corpus Engine

**Goal:** The data pipeline. Ingest real data from NUFORC and Project Blue Book, process it through entity extraction and credibility scoring, and populate the database with real cases.

**Deliverables:**

### 2.1 Data Ingest — NUFORC
- Script to fetch/parse NUFORC CSV data
- Field mapping to `cases` schema
- Run as background job, idempotent (re-run safe)
- Target: full NUFORC dataset loaded

### 2.2 Data Ingest — MUFON (Public Cases Only)
- Scrape publicly accessible case summaries from mufon.com
- Field mapping to `cases` schema — note fields may be less complete than NUFORC
- Source registered in `sources` table with flag: `partial_dataset: true`, `partnership_pending: true`
- Full investigator-reviewed dataset deferred pending formal MUFON partnership agreement
- Do not attempt to scrape behind any login or membership wall

### 2.3 Data Ingest — Project Blue Book
- Script to parse Project Blue Book digitized archive
- Field mapping to `cases` schema
- Source registered in `sources` table

### 2.4 Entity Extraction Pipeline
- Claude API call on each raw case text
- Extraction targets: craft shape, craft size, craft color, craft behavior, witness count, witness credentials, physiological effects on witnesses, physical trace evidence present
- Output stored as JSONB in `cases.craft_description`, `cases.behavioral_descriptors`, `cases.physiological_effects`
- Prompt must be deterministic and testable

### 2.5 Data Normalization
- Location normalization: extract lat/lng from text descriptions where possible, standardize country/region fields
- Date normalization: parse varied date formats to ISO standard
- Descriptor taxonomy: controlled vocabulary for craft shape, behavior, effect types — applied consistently across sources

### 2.6 Embedding Generation
- Generate vector embedding for each case using `cases.raw_text` + `cases.summary`
- Store in pgvector column `cases.embedding`
- Batch processing — handle full corpus without timeout

### 2.7 Credibility Scoring
- Implement weighted factor model per TRD.md
- Score computed on ingest and stored in `cases.credibility_score`
- Factor breakdown stored in `cases.credibility_factors` JSONB
- Tier assigned based on score thresholds

### 2.8 Cross-Reference Linking
- After all cases embedded: run similarity search on each case
- Flag cases with high semantic similarity from different sources
- Store cross-reference links (consider junction table: `case_cross_references`)

### 2.9 Deduplication
- Detect likely duplicates: same date, same location, similar description
- Flag rather than delete — preserve provenance

**Done when:** NUFORC and Blue Book data fully loaded. Running `/api/stats` returns real case count by source and tier. Spot check: 10 random cases have credibility scores, extracted descriptors, and embeddings.

**Dependencies:** Phase 1 complete.

---

## Phase 3 — Evidence Index

**Goal:** The public-facing case browsing experience. Users can explore, filter, and dive deep into individual cases.

**Deliverables:**

### 3.1 Case List Page (`/cases`)
- Paginated list of cases — 25 per page
- Default sort: credibility score descending
- Sort options: date, credibility score, witness count
- Filter panel: credibility tier, source, country/region, date range, craft descriptor tags
- Case card component: title, date, location, tier badge, top descriptors, credibility score arc
- URL-persisted filter state

### 3.2 Investigation Workspace (`/cases/[id]`)
- Three-column layout: sidebar 200px | case content flex:1 max-width 860px | investigation tools 460px
- Left sidebar: case overview, credibility score display with factor breakdown expandable, tier badge
- Center column: full case information — craft description, witness info, behavioral descriptors, physiological effects, corroboration evidence, raw narrative, source attribution
- Right panel: investigation tools with 6 tabs (see 3.8)
- Right-click annotation system throughout case content
- Related cases section (semantic similarity — top 3-5)

### 3.3 Credibility Score Component
- Visual arc or ring indicator — 0-100
- Color mapped to tier (gold / green / graphite / caution)
- Factor breakdown: expandable list showing each factor and its contribution
- Tier badge: TIER 1 / TIER 2 / TIER 3 / TIER 4 in Oswald

### 3.4 Map View (`/cases/map`)
- Muted cartographic base map (Mapbox or Leaflet with CartoDB tiles)
- Cases plotted as clusters, sized by count
- Cluster color indicates average tier of contained cases
- Click cluster → case list panel slides in
- Filter controls mirror case list filters

### 3.5 Timeline View (`/cases/timeline`)
- Horizontal timeline — cases plotted by date
- Frequency histogram overlay
- Filterable by source, tier, descriptor
- Click event → case detail

### 3.6 Search
- Full-text search across case titles and narratives
- Typesense or Meilisearch integration
- Results ranked by credibility score within relevance

### 3.7 Right-Click Annotation System
- Custom context menu on case content: highlight, note, URL, evidence link
- Annotations saved to database with timestamp and user
- Highlight colors for visual distinction (gold, blue, red for different types)
- Annotation panel shows all annotations on current case
- Ability to delete own annotations

### 3.8 Investigation Tools Panel
- 6 tabbed interface in right column (460px width):
  - **ACH (Analysis of Competing Hypotheses):** Interactive matrix with hypotheses vs evidence, voting buttons, confidence scoring
  - **Resolution:** Checklist of investigative questions, checkoff tracking, notes field
  - **OSINT:** Search & import panel for external sources, link integration
  - **Links:** Evidence node map showing connections between case elements, related cases, cross-references
  - **Search:** Internal corpus search scoped to case context
  - **Score:** Solvability scoring display and breakdown

**Done when:** A user can browse cases, filter by tier and source, read a full case detail with credibility breakdown, see related cases, and explore geographically on the map.

**Dependencies:** Phase 2 complete (real data in database).

---

## Phase 4 — Findings Layer

**Goal:** The headline feature. AI-generated pattern reports surfacing what no human researcher could find manually.

**Deliverables:**

### 4.1 Findings Report Data Layer
- Report storage schema live (from Phase 1)
- API endpoints: `GET /api/findings`, `GET /api/findings/[id]`
- Versioning logic — reports are immutable once published, new version creates new record

### 4.2 Findings Index Page (`/findings`)
- List of published findings reports
- Confidence badge: HIGH / MEDIUM / LOW / INCONCLUSIVE
- Report type label, publication date, summary excerpt
- Null findings displayed with identical visual weight — no visual penalty
- Filter by report type, confidence level

### 4.3 Findings Report Detail Page (`/findings/[id]`)
- Editorial layout — Instrument Serif headline, JetBrains Mono body
- Confidence badge prominent at top
- Methodology section — collapsible but present
- Body with inline case citations (click → case detail slide-over)
- Cases cited section — list of referenced cases with tier badges
- Version history (if updated)
- Null findings: "Analysis did not surface sufficient evidence to support this conclusion at this confidence threshold" — no apologetic framing

### 4.4 First Report — Descriptor Convergence
- Background job: query corpus for craft descriptor frequency across sources
- Claude analysis: which descriptors appear with statistically anomalous frequency across sources with no shared origin?
- Output formatted as findings report, stored in DB
- Confidence level assigned

### 4.5 Second Report — Corroboration Density
- Identify cases with highest number of independent confirmation vectors
- Surface the top tier of cases that have survived the most scrutiny
- Formatted and stored as findings report

### 4.6 Report Generation Job
- Inngest/Trigger.dev job: scheduled weekly
- Runs each report type analysis
- If significant change from prior version: flags for human review before publish
- If confidence drops below LOW: flags as inconclusive, does not auto-publish

### 4.7 Admin: Findings Publish Controls
- Admin UI: review pending reports, publish or reject
- Reason required for rejection
- Audit log of all publish actions

**Done when:** At least two published findings reports are live, readable, with cited cases linkable. Null finding state renders correctly.

**Dependencies:** Phase 2 (corpus data), Phase 3 (case pages for citation links).

---

## Phase 5 — Query Interface

**Goal:** Natural language research tool. Ask Meridian a question, get an answer grounded strictly in the corpus.

**Deliverables:**

### 5.1 Query UI Component
- Centered input — clean, minimal, not a chat interface
- No assistant persona — this is a research instrument
- Example queries displayed on empty state
- Results appear below input — not in a chat thread

### 5.2 Query API (`POST /api/query`)
- Intent classification — what is the user asking for?
- Hybrid retrieval: semantic search (pgvector) + keyword search (Typesense)
- Retrieved cases passed as context to Claude
- Claude prompted with strict grounding instruction: cite only retrieved corpus, flag uncertainty, output "insufficient data" if evidence does not support answer
- Response includes: answer text, confidence level, cited case IDs

### 5.3 Grounded Response Display
- Answer text rendered with inline case citations
- Cited case chips below answer — click to open case detail
- Confidence level badge on response
- "Insufficient data to answer this question with confidence" displayed as first-class state — not an error

### 5.4 Rate Limiting
- Query endpoint rate limited — reasonable public use threshold
- No auth required for basic queries

**Done when:** A user can type "What are the most credible cases involving triangular craft in the US after 2000?" and receive a grounded, cited answer with a confidence level.

**Dependencies:** Phase 2 (corpus + embeddings), Phase 3 (case detail pages).

---

## Phase 6 — Contribution Platform

**Goal:** The living data layer. Public submission system for new accounts and evidence, with AI screening and admin review.

**Deliverables:**

### 6.1 Contribution Form UI (`/contribute`)
- Multi-step form — not one long page
- Step 1: Submission type (personal account / physical evidence / documentary evidence / corroboration of existing case)
- Step 2: Core details — date, time, location, duration, witness count
- Step 3: Account narrative — structured prompts, not free text box
- Step 4: Corroborating evidence — checkboxes + upload for media
- Step 5: Contributor info — optional, anonymous supported
- Progress indicator throughout
- Tone: respectful, precise, research-framed

### 6.2 Contribution Submission API (`POST /api/contribute`)
- Validate and store structured submission data
- Trigger AI screening job async
- Return: submission confirmation + tracking ID

### 6.3 AI Screening Pipeline
- Internal consistency check — timeline plausible, details non-contradictory
- Specificity score — granular detail vs. vague
- Contamination check — semantic similarity to recently viral media
- Cross-reference match — similarity to high-tier existing cases
- Output: screening score, flags, recommended tier
- Stored on contribution record

### 6.4 Contribution Review Admin UI
- Queue of pending contributions sorted by screening score
- Per-submission view: structured data, narrative, AI screening report
- Actions: Approve (assign tier) / Request more info / Reject (reason required)
- Approved contributions trigger corpus integration job

### 6.5 Corpus Integration Job
- Approved contribution processed through entity extraction, normalization, embedding
- Added to `cases` table with source type = "contribution"
- Cross-reference linking run

### 6.6 Researcher Annotations
- Registered researcher accounts (admin-approved)
- Annotation types: corroboration / challenge / contextual link / related case link
- Annotations visible on case detail page
- Reason field required — no anonymous one-word annotations

**Done when:** A submission can be made through the public form, processed through AI screening, reviewed in admin, approved, and appear as a new case in the Evidence Index.

**Dependencies:** Phase 1 (schema), Phase 2 (corpus pipeline for integration).

---

## Phase 7 — Polish & Launch

**Goal:** Homepage, about page, performance optimization, and public launch readiness.

**Deliverables:**

### 7.1 Homepage (`/`)
- Meridian logotype — clean wordmark, no UFO imagery
- Mission statement — one precise sentence (Caveat font)
- Corpus stats: total cases, sources, findings published, contributions received
- Featured findings reports (latest 2-3)
- Entry points: Browse Evidence / Read Findings / Submit Account / Query the Corpus (Oswald font)
- Cartographic background element — subtle meridian line motif

### 7.2 About & Methodology Page (`/about`)
- Mission and the three research questions
- What Meridian is not (conspiracy research, advocacy)
- Methodology: how credibility scoring works, factor weights visible
- How findings reports are generated and reviewed
- Data sources listed with descriptions
- Team / origin story (brief)

### 7.3 Performance
- All case list pages server-side rendered
- Findings reports statically generated
- Image optimization
- Core Web Vitals target: LCP < 2.5s, CLS < 0.1

### 7.4 SEO
- Metadata for all public pages
- OG tags for findings reports and notable cases
- Sitemap

### 7.5 Accessibility
- Keyboard navigable throughout
- Screen reader compatible
- Sufficient color contrast across all tier color states

**Done when:** Lighthouse score ≥ 90 performance, ≥ 95 accessibility. All pages render correctly on mobile. About page fully written and live.

**Dependencies:** All prior phases.

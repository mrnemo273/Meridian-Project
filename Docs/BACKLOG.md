# The Meridian Project — Backlog

## Backlog Conventions

- **P0** — Foundational. Nothing works without this.
- **P1** — Core product. Required for meaningful public launch.
- **P2** — Enhances value significantly. Ship in first months post-launch.
- **P3** — Important but deferrable. Post-launch roadmap.

---

## Infrastructure & Data

| ID | Item | Priority | Notes |
|----|------|----------|-------|
| INF-01 | Supabase project setup — PostgreSQL + Auth + Storage | P0 | |
| INF-02 | Core schema creation — cases, sources, contributions, annotations | P0 | |
| INF-03 | pgvector extension setup for embeddings | P0 | |
| INF-04 | Vercel project setup + environment config | P0 | |
| INF-05 | Inngest or Trigger.dev setup for background jobs | P0 | |
| INF-06 | Typesense or Meilisearch setup for full-text search | P1 | |
| INF-07 | S3 / Supabase Storage setup for media uploads | P1 | |
| INF-08 | Rate limiting middleware on API routes | P1 | |
| INF-09 | Monitoring setup — error tracking, latency | P2 | |

---

## Corpus Engine

| ID | Item | Priority | Notes |
|----|------|----------|-------|
| COR-01 | NUFORC data ingest pipeline | P0 | CSV + structured |
| COR-02 | Project Blue Book ingest pipeline | P0 | Digitized archive |
| COR-03 | Entity extraction prompt — craft descriptors, witness data, location, effects | P0 | Claude-powered |
| COR-04 | Data normalization layer — location, date, descriptor taxonomy | P0 | |
| COR-05 | Embedding generation pipeline | P0 | Batch on ingest |
| COR-06 | Credibility scoring model implementation | P0 | Weighted factor model |
| COR-07 | Cross-reference linking — semantic similarity matching | P1 | |
| COR-08 | MUFON public cases ingest (partial) — scrape publicly accessible case summaries from mufon.com only | P2 | Full investigator-reviewed dataset pending formal partnership agreement |
| COR-09 | Black Vault FOIA document ingest | P1 | PDF parsing required |
| COR-10 | Congressional testimony ingest | P1 | |
| COR-11 | Pentagon AARO reports ingest | P1 | |
| COR-12 | NICAP historical database ingest | P2 | |
| COR-13 | Deduplication logic across sources | P1 | |
| COR-14 | Corpus refresh job — scheduled re-ingest of live sources | P2 | |
| COR-15 | Academic literature ingest (Hynek, Vallee, Mack) | P3 | Manual curation |

---

## Evidence Index

| ID | Item | Priority | Notes |
|----|------|----------|-------|
| IDX-01 | Case list page — paginated, sortable, filterable | P0 | |
| IDX-02 | Investigation workspace — three-column layout with case content, annotation system, and investigation tools | P0 | |
| IDX-03 | Credibility score display component with factor breakdown | P0 | |
| IDX-04 | Tier badge component | P0 | |
| IDX-05 | Related cases — AI-surfaced similar cases on detail page | P1 | |
| IDX-06 | Map view — geographic clustering | P1 | |
| IDX-07 | Timeline view — temporal frequency analysis | P1 | |
| IDX-08 | Descriptor tag filtering — filter by craft type, effects, etc. | P1 | |
| IDX-09 | Source filter — filter by NUFORC, Blue Book, etc. | P1 | |
| IDX-10 | Case export — JSON/CSV for researchers | P2 | |
| IDX-11 | Printable case report | P3 | |

---

## Findings Layer

| ID | Item | Priority | Notes |
|----|------|----------|-------|
| FND-01 | Findings report data model and storage | P0 | |
| FND-02 | Findings index page | P0 | |
| FND-03 | Findings report detail page — editorial layout | P0 | |
| FND-04 | Confidence level badge component | P0 | |
| FND-05 | Descriptor convergence report — first report type | P1 | |
| FND-06 | Corroboration density report | P1 | |
| FND-07 | Geographic clustering report | P1 | |
| FND-08 | Temporal pattern report | P2 | |
| FND-09 | Linguistic fingerprint report | P2 | |
| FND-10 | Report versioning system | P1 | |
| FND-11 | Null findings display — equal design weight | P1 | |
| FND-12 | Scheduled report regeneration job | P2 | |
| FND-13 | Findings report sharing / stable URLs | P1 | |

---

## Query Interface

| ID | Item | Priority | Notes |
|----|------|----------|-------|
| QRY-01 | Query input UI component | P1 | |
| QRY-02 | Hybrid retrieval — semantic + keyword | P1 | |
| QRY-03 | Grounded Claude response generation | P1 | |
| QRY-04 | Cited cases inline in response | P1 | |
| QRY-05 | Confidence level on query response | P1 | |
| QRY-06 | "Insufficient data" response state | P1 | |
| QRY-07 | Query history for logged-in researchers | P3 | |
| QRY-08 | Saved queries | P3 | |

---

## Contribution Platform

| ID | Item | Priority | Notes |
|----|------|----------|-------|
| CON-01 | Multi-step contribution form UI | P1 | |
| CON-02 | Contribution data model and storage | P1 | |
| CON-03 | AI pre-screening pipeline | P1 | |
| CON-04 | Contamination flag detection | P1 | |
| CON-05 | Contribution review admin UI | P1 | |
| CON-06 | Credibility tier assignment on submission | P1 | |
| CON-07 | Contributor account creation | P2 | |
| CON-08 | Submission status tracking for contributors | P2 | |
| CON-09 | Media upload — photo/video with metadata extraction | P2 | |
| CON-10 | Researcher annotation system | P2 | |
| CON-11 | Annotation abuse prevention | P2 | |
| CON-12 | Contribution → corpus integration pipeline | P1 | |

---

## Frontend / Design System

| ID | Item | Priority | Notes |
|----|------|----------|-------|
| DES-01 | Design token setup — colors, typography, spacing | P0 | |
| DES-02 | Font loading — Instrument Serif, JetBrains Mono, Oswald, Caveat | P0 | |
| DES-03 | Homepage / landing page | P0 | |
| DES-04 | Navigation component | P0 | |
| DES-05 | About / methodology page | P0 | Critical for credibility |
| DES-06 | Corpus statistics component for homepage | P1 | |
| DES-07 | Responsive mobile layout | P1 | |
| DES-08 | Dark mode | P3 | Not priority |
| DES-09 | Investigation workspace three-column layout | P0 | |
| DES-10 | Right-click annotation system — highlight, note, URL, evidence link | P0 | |
| DES-11 | ACH Matrix interactive voting | P0 | |
| DES-12 | Evidence linking node map | P0 | |
| DES-13 | Search & Import OSINT panel | P1 | |
| DES-14 | Solvability scoring display | P1 | |
| DES-15 | Resolution checklist | P1 | |
| DES-16 | OSINT verification log | P1 | |

---

## Admin & Operations

| ID | Item | Priority | Notes |
|----|------|----------|-------|
| ADM-01 | Admin authentication | P1 | |
| ADM-02 | Contribution review queue | P1 | |
| ADM-03 | Credibility score override with audit log | P2 | |
| ADM-04 | Corpus source management UI | P2 | |
| ADM-05 | Findings report publish/unpublish controls | P1 | |
| ADM-06 | User management for researcher accounts | P3 | |

---

## Phase 3B — Architecture & Multi-Case (NEXT SPRINT)

| ID | Item | Priority | Notes |
|----|------|----------|-------|
| ARC-01 | Decompose workspace page.tsx (~700 lines) into components | P0 | CaseContent, Sidebar, InvestColumn, ContextMenu |
| ARC-02 | Extract hardcoded data arrays from page.tsx into JSON | P0 | ~200 lines of const data → case data files |
| ARC-03 | Wire [id] route param to load correct case data | P0 | Currently ignores param, always shows Nimitz |
| ARC-04 | Define canonical JSON schema for case data files | P0 | Extend case-001-nimitz.json to include all workspace content |
| ARC-05 | Build Case 002 data: Phoenix Lights | P0 | Full research + JSON |
| ARC-06 | Build Case 003 data: Rendlesham Forest | P0 | Full research + JSON |
| ARC-07 | Build Case 004 data: Belgian Wave | P1 | Full research + JSON |
| ARC-08 | Build Case 005 data: Tehran 1976 | P1 | Full research + JSON |
| ARC-09 | Build Case 006 data: Aguadilla PR | P1 | Full research + JSON |
| ARC-10 | "Back to Cases" navigation link in workspace | P1 | |
| ARC-11 | Loading states for case data | P1 | |
| ARC-12 | 404 page for cases without data | P1 | |

---

## Notes

**What shipped (March 2026):** Production Next.js app with homepage + Case 001 (Nimitz) investigation workspace. All interactive features working: annotations, ACH matrix, evidence linking, card selection, search UI, 6 investigation tabs. localStorage persistence via custom hooks.

**Prototypes (reference only):** HTML prototypes in `/prototype/` — index.html, case-workspace.html. These are the design source of truth but are now superseded by the production app for development purposes.

**Architecture debt:** Workspace is a single ~700-line component with hardcoded data. Phase 3B addresses this before adding more cases.

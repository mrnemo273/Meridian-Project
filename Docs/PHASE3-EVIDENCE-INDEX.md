# Meridian — Phase 3 Build Spec: Evidence Index

## Agent Instructions

You are building the public-facing evidence browsing experience for The Meridian Project. This is the first phase with real user-facing UI. Users will browse, filter, search, and deeply explore individual cases from the corpus.

The design must feel like a research instrument — precise, credible, editorial. Not a UFO fan site. Refer to the design system constants throughout this document and in `DESIGN.md`.

Read this entire document before writing any code.

---

## Prerequisites (confirm before starting)

- [ ] Phase 1 complete — design system, schema, base components all exist
- [ ] Phase 2 complete — `/api/stats` returns 100,000+ cases with scores and embeddings
- [ ] Base UI components exist: Button, Badge, Card, Divider, Tag in `/components/ui/`
- [ ] TypeScript types exist in `/types/database.ts`

---

## What You Are Building

1. `/api/cases` — paginated, filterable case list endpoint
2. `/api/cases/[id]` — single case detail endpoint
3. `/api/cases/[id]/related` — related cases endpoint
4. `/cases` — case list page
5. `/cases/[id]` — case detail page
6. `/cases/map` — geographic map view
7. `/cases/timeline` — temporal timeline view
8. Full-text search integration
9. Credibility score display component
10. Navigation with links to all case views

---

## Design Constants (apply throughout)

```
Background:       #F6F5F1  (--bg)
Surface:          #FFFFFF  (surface)
Board bg:         #EDECE8  (board-bg)
Text primary:     #1A1816  (--text-1)
Text secondary:   #6B6560  (--text-2)
Text tertiary:    #A09A92  (--text-3)
Gold:             #9A7A2E  (--gold)
Orange:           #B86A2E  (--orange)
Purple:           #7B5D9A  (purple)
Red:              #B04A4A  (red)
Green:            #5A8A4A  (--green)
Blue:             #4A6A9A  (blue)

Fonts:
  Display/titles:    Instrument Serif (--font-display)
  Body/UI chrome:    JetBrains Mono, 300-600 weight (--font-mono)
  Labels/headers:    Oswald, uppercase, tracked (--font-labels)
  Annotations:       Caveat (--font-annotations)
```

---

## Step 1 — API Routes

### GET /api/cases

File: `/app/api/cases/route.ts`

Query parameters:
```
page        integer, default 1
limit       integer, default 25, max 100
sort        'credibility_score' | 'date' | 'witness_count', default 'credibility_score'
order       'asc' | 'desc', default 'desc'
tier        '1' | '2' | '3' | '4' | comma-separated e.g. '1,2'
source      source UUID or comma-separated
country     ISO country code or comma-separated
region      region string
date_from   ISO date
date_to     ISO date
shape       craft shape from taxonomy
search      full-text search string
```

Response shape:
```typescript
{
  cases: CaseListItem[]   // lighter type — no raw_text, no embedding
  total: number
  page: number
  limit: number
  total_pages: number
}

interface CaseListItem {
  id: string
  title: string
  date: string | null
  date_approximate: boolean
  location_region: string | null
  location_country: string | null
  location_lat: number | null
  location_lng: number | null
  witness_count: number | null
  witness_credentials: string[]
  craft_description: CraftDescription | null
  credibility_score: number | null
  credibility_tier: 1 | 2 | 3 | 4 | null
  radar_corroboration: boolean
  video_evidence: boolean
  photo_evidence: boolean
  physical_trace: boolean
  official_acknowledgment: boolean
  source_name: string    // joined from sources table
  source_url: string | null
}
```

### GET /api/cases/[id]

File: `/app/api/cases/[id]/route.ts`

Returns full `Case` type plus:
- `source: Source` — full source object
- `cross_references: CaseListItem[]` — cases in case_cross_references table for this case

Do not return the `embedding` field — it is large and not needed by the UI.

### GET /api/cases/[id]/related

File: `/app/api/cases/[id]/related/route.ts`

Returns top 5 semantically similar cases using pgvector:
```sql
select cases.*, sources.name as source_name
from cases
join sources on cases.source_id = sources.id
where cases.id != $1
  and cases.embedding is not null
order by cases.embedding <=> (select embedding from cases where id = $1)
limit 5;
```

Returns `CaseListItem[]`.

---

## Step 2 — Case List Page `/cases`

File: `/app/cases/page.tsx`

### Layout

```
[Navigation]
[Page header — "Evidence Index"]
[Filter panel — left sidebar on desktop, collapsible drawer on mobile]
[Case list — right content area]
[Pagination]
```

### Page Header

```tsx
<header>
  <p className="font-labels text-sm uppercase tracking-widest text-text-3">
    The Meridian Project
  </p>
  <h1 className="font-display text-4xl text-text-1">
    Evidence Index
  </h1>
  <p className="font-mono text-text-2">
    {totalCases.toLocaleString()} documented cases across {sourceCount} sources
  </p>
</header>
```

### Filter Panel

Filters (all optional, combinable):
- **Credibility Tier** — checkboxes: Tier 1, Tier 2, Tier 3, Tier 4
- **Source** — checkboxes: NUFORC, Project Blue Book, MUFON, etc.
- **Country** — dropdown, populated from distinct countries in corpus
- **Date Range** — two date inputs (from / to)
- **Craft Shape** — dropdown using taxonomy from normalize.ts
- **Corroboration** — checkboxes: Radar, Video, Physical Trace, Official Acknowledgment

Filter state persisted in URL search params. Changing any filter resets to page 1.

### Case Card Component

File: `/components/cases/CaseCard.tsx`

```
┌─────────────────────────────────────────────┐
│ TIER 1  [badge]                    [score arc] │
│                                               │
│ Triangular Object Observed by Airline Crew    │
│ [Instrument Serif, 18px]                      │
│                                               │
│ Nov 7, 2006  ·  Chicago, Illinois, US         │
│ [JetBrains Mono, 12px, secondary text]        │
│                                               │
│ [disc] [hovering] [silent] [radar]            │
│ [descriptor tags — Oswald, uppercase]         │
│                                               │
│ 12 witnesses · Aviation credentials           │
│ [Oswald, uppercase]                           │
└─────────────────────────────────────────────┘
```

- Tier badge top-left, colored by tier
- Credibility score arc top-right (small, 48px)
- Title in Instrument Serif
- Date + location in JetBrains Mono
- Top 4 descriptor tags in Oswald, uppercase
- Witness summary line in Oswald, uppercase
- Border: `--border`
- Hover: subtle background shift, no dramatic effects
- Full card is clickable → `/cases/[id]`

### Credibility Score Arc Component (small)

File: `/components/ui/CredibilityArc.tsx`

Props: `score: number`, `tier: 1 | 2 | 3 | 4`, `size: 'sm' | 'lg'`

SVG arc indicator:
- Full circle arc (270° sweep)
- Background arc: `--border`
- Fill arc: tier color
- Score number centered in JetBrains Mono
- Small version (48px): score only
- Large version (120px): score + "/ 100" label below

### Pagination

Simple prev/next with page numbers. JetBrains Mono. Respect URL params.

---

## Step 3 — Case Detail Page `/cases/[id]` — Investigation Workspace

File: `/app/cases/[id]/page.tsx`

Server-side rendered. Generate metadata for SEO.

This page is an **Investigation Workspace** — a three-column layout designed for deep case analysis, evidence exploration, and collaborative investigation.

### Layout

```
[Navigation]
[Three-column layout:]
  [Left sidebar  (200px fixed)]
  [Center column (flex: 1, max-width: 860px)]
  [Right tools   (460px fixed)]
```

### Left Sidebar (200px)

**Case File TOC** (Table of Contents)
- Scrollable outline of all sections in the case file
- Scroll-spy highlighting: active section highlighted as user scrolls center column
- Section links: click to jump to section

**Investigation Tools Links**
- Quick links to tools in right panel (ACH Matrix, Checklist, etc.)
- Icons + labels (Oswald, uppercase)

**Highlight Counter**
- Display: "X highlights selected"
- "Next Highlight" button (gold, JetBrains Mono)
- Allows investigator to jump between user-created highlights

**Investigator Roster**
- Profile thumbnails/initials of other investigators currently viewing this case
- "Real-time collaboration" indicator (optional badge)

---

### Center Column (flex: 1, max-width 860px)

All case content in full-scrollable form. Text is highlightable via right-click context menu. Cards are clickable (gold border on selection). Sticky scroll progress bar (gold) at top.

**Header**
```
TIER 1                              [Large credibility arc, 120px]
────────────────────────────────
United Airlines Flight 446 —
Anomalous Object Observed Over
O'Hare International Airport
────────────────────────────────
November 7, 2006  ·  Chicago, Illinois, US
Source: NUFORC  ·  [link to source_url]
```

Title in **Instrument Serif**, date/location in **JetBrains Mono**.

**Corroboration Evidence Bar**

Horizontal row of indicator pills showing which corroboration types are present. Each pill is **Oswald** uppercase:
- `RADAR` — filled if true, outlined/muted if false
- `VIDEO` — same
- `PHOTO` — same
- `PHYSICAL TRACE` — same
- `OFFICIAL INVESTIGATION` — same
- `OFFICIAL ACKNOWLEDGMENT` — same

Color: present = tier color, absent = `--border` with muted text

**Executive Summary**
- 2–3 paragraphs summarizing the case, witness count, key evidence, and tier classification
- **Instrument Serif** for title, **JetBrains Mono** for body

**Timeline**
- Chronological breakdown of events
- Each event has timestamp, description, and optional evidence artifacts
- **Oswald** for timestamp headers, **JetBrains Mono** for descriptions

**Evidence Cards**
- Clickable cards for each piece of evidence (photo, video, document, etc.)
- Gold border on selection
- Right-click to "Highlight & annotate"

**Craft Description**

```
OBSERVED CRAFT
──────────────
Shape          Disc
Size           Large
Color          Dark grey, metallic
Luminosity     Unlit
```

Descriptor tags below: `[disc]` `[dark grey]` `[large]` `[metallic]` (Oswald, uppercase)

**Witness Information & Cards**

```
WITNESSES
─────────
Count          12
Credentials    Aviation (airline crew, ground crew)
Duration       Approximately 5 minutes
```

Individual witness cards showing name, role, statement excerpt, and credibility indicators.

**Behavioral Descriptors**

```
OBSERVED BEHAVIOR
─────────────────
Movement       Stationary, hovering
Speed          —
Altitude       Low (below cloud layer)
Sound          Silent
```

**Physiological Effects**

Only shown if any effects are true. If none: omit section entirely.

**Narrative**

Collapsible section. "View original report" expands to show `raw_text`. Collapsed by default. Highlightable text.

**AI Analysis** (optional)
- Automated analysis of case consistency, outlier patterns, or corroboration patterns
- Clearly labeled as AI-generated
- Allow investigator to flag analysis as "helpful" or "irrelevant"

**Open Questions**
- Bullet list of unanswered questions or gaps in the evidence
- Crowd-sourced or expert-generated
- Optional links to related research or follow-ups

**Credibility Score Breakdown**

Expandable section showing the factor table:

```
CREDIBILITY SCORE BREAKDOWN
────────────────────────────
Witness Count              16 / 20
Witness Credentials        20 / 20
Radar Corroboration         0 / 15
Video Evidence              0 / 10
Photo Evidence              0 /  5
Physical Trace              0 / 10
Official Investigation     10 / 10
Official Acknowledgment    15 / 15
Cross-Reference Matches    10 / 15
Internal Consistency        8 / 10
────────────────────────────
Total                      79 / 100  →  TIER 1
```

All in **JetBrains Mono**. This is the transparency mechanism — nothing is a black box.

---

### Right Sidebar (460px) — Investigation Tools

Persistent, tabbed panel with 6 tabs:

**1. ACH Matrix** (Analysis of Competing Hypotheses)
- Editable table: Hypotheses vs. Evidence
- Cells marked: Consistent / Inconsistent / Unknown
- Export as PDF

**2. Resolution Checklist**
- Checkbox list of investigative tasks
- Progress bar
- Add/remove custom items
- Save to case

**3. OSINT Log**
- Chronological log of open-source intelligence gathering
- Source links, dates, notes
- Search & filter

**4. Evidence Links**
- Network diagram: relationships between evidence items, witnesses, dates
- Force-directed graph visualization
- Click nodes to jump to center column

**5. Search & Import**
- Quick search within case
- Import related cases, documents, or external sources
- Cite & link

**6. Solvability Score**
- Proprietary metric: likelihood case can be solved with available evidence
- Slider/bar chart
- Factors: witness count, evidence types, official data access, etc.
- "Roadmap to resolution" — suggested next steps

---

### Font Updates for Detail Page

- Titles & section headers: **Instrument Serif**
- Body text & descriptions: **JetBrains Mono** (300-400 weight)
- Labels, timestamps, section names: **Oswald** (uppercase, tracked)
- Annotations & handwritten notes: **Caveat** (optional, for investigator comments)

---

## Step 4 — Map View `/cases/map`

File: `/app/cases/map/page.tsx`

### Map Library

Use Leaflet with React-Leaflet. Base tile layer: CartoDB Positron (muted, clean, no satellite):
```
https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png
```

Install: `npm install leaflet react-leaflet @types/leaflet`

### Clustering

Use `react-leaflet-cluster` for marker clustering.

Cluster circle styling:
- Color indicates average credibility tier of contained cases
- Size scales with case count
- On click: expand cluster or show case list panel

### Filter Controls

Floating panel top-right. Same filters as case list page: tier, source, date range. Filter labels in **Oswald**.

### Case List Side Panel

On cluster click → slide-in panel on right showing CaseCards for cases in cluster.

### Map Styling

```typescript
// Custom cluster icon
function createClusterCustomIcon(cluster) {
  const avgTier = calculateAverageTier(cluster)
  const color = TIER_COLORS[avgTier]
  return L.divIcon({
    // SVG circle with tier color
  })
}
```

No popups with detailed case info — just cluster → panel flow. Keep map clean.

---

## Step 5 — Timeline View `/cases/timeline`

File: `/app/cases/timeline/page.tsx`

### Layout

Horizontal timeline spanning the full date range of the corpus (approx 1940s–present).

Top section: frequency histogram — bar chart showing case count by year, colored by dominant tier.

Bottom section: individual case markers for filtered/selected cases.

### Library

Use Recharts for the histogram:
```bash
npm install recharts
```

### Histogram

```tsx
<BarChart data={yearlyData}>
  <XAxis dataKey="year" style={{ fontFamily: 'JetBrains Mono' }} />
  <YAxis style={{ fontFamily: 'JetBrains Mono' }} />
  <Bar dataKey="count" fill="var(--gold)" />
</BarChart>
```

Clicking a bar filters the case list below to that year.

### Case List Below

Filtered case list (same CaseCard component) showing cases for selected time period. Default: most recent 5 years.

### Filter Controls

Above histogram: source filter, tier filter, craft shape filter.

---

## Step 6 — Full-Text Search

### Search Integration

For Phase 3, implement basic PostgreSQL full-text search using Supabase's built-in capabilities. (Typesense/Meilisearch integration is deferred to Phase 3 P2 backlog.)

Add a generated tsvector column to cases for search:
```sql
alter table cases add column search_vector tsvector
  generated always as (
    to_tsvector('english',
      coalesce(title, '') || ' ' ||
      coalesce(summary, '') || ' ' ||
      coalesce(raw_text, '') || ' ' ||
      coalesce(location_region, '') || ' ' ||
      coalesce(location_country, '')
    )
  ) stored;

create index on cases using gin(search_vector);
```

In `/api/cases/route.ts`, when `search` param is present:
```sql
where search_vector @@ plainto_tsquery('english', $search)
order by ts_rank(search_vector, plainto_tsquery('english', $search)) desc
```

### Search Bar Component

File: `/components/cases/SearchBar.tsx`

- Prominent input above filter panel on `/cases`
- Debounced — 300ms delay before firing
- JetBrains Mono placeholder: "Search 150,000+ cases..."
- Clear button when populated
- Updates `search` URL param

---

## Step 7 — Navigation

File: `/components/layout/Navigation.tsx`

```
The Meridian Project          Evidence  Findings  Query  Contribute
[wordmark — Instrument Serif] [Oswald links, uppercase, tracked]
```

- Sticky top
- Background: `--bg` with bottom border `--border`
- Active link: `--text-1` bold, gold underline
- Mobile: hamburger → full-screen menu
- No logo/icon — wordmark only
- Wordmark font: **Instrument Serif**
- Nav links font: **Oswald**, uppercase, tracked

---

## Definition of Done

Phase 3 is complete when ALL of the following are true:

- [ ] `/cases` loads and displays real cases from the database
- [ ] All filters work and persist in URL
- [ ] Pagination works correctly
- [ ] `/cases/[id]` loads a full case with all sections populated
- [ ] Credibility score breakdown table renders correctly for a Tier 1 case
- [ ] Related cases and cross-references appear in sidebar
- [ ] `/cases/map` renders with clustered case markers on CartoDB tiles
- [ ] `/cases/timeline` renders histogram with year-based filtering
- [ ] Search returns relevant results
- [ ] Navigation links to all sections
- [ ] All pages are server-side rendered (check: view source shows content)
- [ ] Mobile layout is functional on 375px viewport
- [ ] No design system violations — all colors, fonts from tokens only

## What NOT to Build in This Phase

- No findings reports pages
- No query interface
- No contribution form
- No admin UI
- No authentication flows

---

## Handoff Notes for Next Phase

The Phase 4 agent needs:
- The `CaseCard` component (reused for case citations in findings reports)
- The case detail slide-over pattern (for inline citation clicks in findings reports)
- The `/api/cases/[id]` endpoint (used by findings report citation links)
- Navigation already has a "Findings" link — it will 404 until Phase 4 ships

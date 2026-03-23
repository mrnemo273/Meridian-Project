# Meridian — Phase 1 Build Spec: Foundation

## Agent Instructions

You are building the foundation of The Meridian Project — a rigorous AI-powered evidence research platform. This phase produces no visible product features. It creates the skeleton every future phase is built on. Do not skip steps or defer anything listed here. Every subsequent phase depends on this being complete and correct.

Read this entire document before writing a single line of code.

---

## What You Are Building

A running Next.js application with:
- Full design system implemented and testable
- Database schema live in Supabase with all tables and indexes
- All infrastructure services connected and environment configured
- Background job runner initialized
- A `/test` route that visually confirms the design system is working

---

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14+ with App Router |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Database | Supabase (PostgreSQL) |
| Vector DB | pgvector extension on Supabase |
| Auth | Supabase Auth |
| Background Jobs | Inngest (preferred) or Trigger.dev |
| Hosting | Vercel |
| AI | Anthropic Claude API (claude-sonnet-4-20250514) |

---

## Step 1 — Project Scaffolding

Initialize the project:

```bash
npx create-next-app@latest meridian --typescript --tailwind --eslint --app --src-dir=false
```

Required folder structure:
```
/app                    — Next.js App Router pages and layouts
/components             — Shared UI components
  /ui                   — Base design system components
  /layout               — Navigation, footer, page wrappers
/lib                    — Utility functions, API clients, helpers
  /supabase.ts          — Supabase client initialization
  /anthropic.ts         — Anthropic client initialization
  /utils.ts             — Shared utility functions
/types                  — TypeScript type definitions
  /database.ts          — Database row types matching schema
  /api.ts               — API request/response types
/styles                 — Global styles
  /globals.css          — CSS variables, base styles
```

Install additional dependencies:
```bash
npm install @supabase/supabase-js @supabase/ssr @anthropic-ai/sdk inngest
npm install -D @types/node
```

ESLint and Prettier config: standard Next.js defaults are fine. Add `"strict": true` to tsconfig.json compilerOptions.

---

## Step 2 — Design System

### 2.1 CSS Variables

In `/styles/globals.css`, define the full design token set:

```css
:root {
  /* Core palette */
  --bg: #F6F5F1;
  --surface: #FFFFFF;
  --board-bg: #EDECE8;
  --border: rgba(0,0,0,0.07);
  --border-strong: rgba(0,0,0,0.12);
  --text-1: #1A1816;
  --text-2: #6B6560;
  --text-3: #A09A92;

  /* Accent palette */
  --gold: #9A7A2E;                 /* Tier 1, high credibility */
  --orange: #B86A2E;               /* Tier 2, corroborated, verified */
  --purple: #7B5D9A;               /* Tier 3 */
  --red: #B04A4A;                  /* Tier 4, flagged, contested */
  --green: #5A8A4A;                /* Confirmed, verified */
  --blue: #4A6A9A;                 /* Info */

  /* Soft variants (10% opacity) */
  --gold-soft: rgba(154,122,46,0.1);
  --orange-soft: rgba(184,106,46,0.1);
  --purple-soft: rgba(123,93,154,0.1);
  --red-soft: rgba(176,74,74,0.1);
  --green-soft: rgba(90,138,74,0.1);
  --blue-soft: rgba(74,106,154,0.1);

  /* Highlight overlays */
  --hl-nemo: rgba(184,106,46,0.22);
  --hl-claude: rgba(123,93,154,0.18);

  /* Tier colors — explicit mapping */
  --tier-1: var(--gold);
  --tier-2: var(--orange);
  --tier-3: var(--purple);
  --tier-4: var(--red);
}
```

Set the page background and base text color:
```css
body {
  background-color: var(--bg);
  color: var(--text-1);
}
```

### 2.2 Tailwind Configuration

Extend `tailwind.config.ts` to map design tokens:

```typescript
theme: {
  extend: {
    colors: {
      'bg': 'var(--bg)',
      'surface': 'var(--surface)',
      'board-bg': 'var(--board-bg)',
      'border': 'var(--border)',
      'border-strong': 'var(--border-strong)',
      'text-1': 'var(--text-1)',
      'text-2': 'var(--text-2)',
      'text-3': 'var(--text-3)',
      'gold': 'var(--gold)',
      'orange': 'var(--orange)',
      'purple': 'var(--purple)',
      'red': 'var(--red)',
      'green': 'var(--green)',
      'blue': 'var(--blue)',
      'gold-soft': 'var(--gold-soft)',
      'orange-soft': 'var(--orange-soft)',
      'purple-soft': 'var(--purple-soft)',
      'red-soft': 'var(--red-soft)',
      'green-soft': 'var(--green-soft)',
      'blue-soft': 'var(--blue-soft)',
      'hl-nemo': 'var(--hl-nemo)',
      'hl-claude': 'var(--hl-claude)',
    },
    fontFamily: {
      display: ['Instrument Serif', 'Georgia', 'serif'],
      body: ['JetBrains Mono', 'Menlo', 'monospace'],
      labels: ['Oswald', 'Arial', 'sans-serif'],
      handwriting: ['Caveat', 'cursive'],
    },
  },
}
```

### 2.3 Font Loading

In `/app/layout.tsx`, load all four fonts via `next/font/google`:

```typescript
import { Instrument_Serif, JetBrains_Mono, Oswald, Caveat } from 'next/font/google'

const instrumentSerif = Instrument_Serif({
  subsets: ['latin'],
  weight: ['400'],
  variable: '--font-display',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-body',
})

const oswald = Oswald({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-labels',
})

const caveat = Caveat({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-handwriting',
})
```

Apply all font variables to the html element.

### 2.4 Base UI Components

Build the following components in `/components/ui/`. These are stubs — correct structure and styling, no complex logic yet.

**Button** (`/components/ui/Button.tsx`)
- Variants: `primary`, `secondary`, `ghost`
- Sizes: `sm`, `md`, `lg`
- Uses Oswald or JetBrains Mono, uppercase tracking for primary variant
- Primary: `bg-text-1 text-surface`
- Secondary: `border border-border text-text-1 bg-transparent`

**Badge** (`/components/ui/Badge.tsx`)
- Props: `label`, `variant` (tier1 | tier2 | tier3 | tier4 | confidence-high | confidence-medium | confidence-low | confidence-inconclusive)
- Font: Oswald, uppercase, tracked
- Tier colors mapped from `--tier-1` through `--tier-4`
- Confidence: high=green, medium=gold, low=text-2, inconclusive=blue

**Card** (`/components/ui/Card.tsx`)
- White-ish background (`--surface` with slight contrast), border `--border`
- Subtle shadow
- Padding variants: `sm`, `md`, `lg`

**Divider** (`/components/ui/Divider.tsx`)
- Horizontal rule using `--border` color
- Optional label prop — centered text label in Oswald on the rule

**Tag** (`/components/ui/Tag.tsx`)
- Small pill for descriptor labels
- Oswald, small, border `--border`
- Optional color prop

---

## Step 3 — Environment Configuration

Create `.env.local` with the following keys (values to be filled by the operator):

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
INNGEST_EVENT_KEY=
INNGEST_SIGNING_KEY=
```

Create `.env.example` with the same keys but no values — commit this, not `.env.local`.

Add `.env.local` to `.gitignore`.

Initialize Supabase client in `/lib/supabase.ts`:
```typescript
// Browser client (uses anon key)
// Server client (uses service role key — for API routes only)
// Both using @supabase/ssr pattern for Next.js App Router
```

Initialize Anthropic client in `/lib/anthropic.ts`:
```typescript
import Anthropic from '@anthropic-ai/sdk'
export const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
```

---

## Step 4 — Database Schema

Run the following migrations in Supabase SQL editor or via migration files. Create a `/supabase/migrations/` folder and write these as numbered migration files.

### Enable pgvector
```sql
create extension if not exists vector;
```

### sources table
```sql
create table sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  type text not null check (type in ('government','academic','ngo','media','contribution')),
  reliability_weight float not null default 1.0,
  description text,
  url text,
  partial_dataset boolean default false,
  partnership_pending boolean default false,
  last_ingested_at timestamptz,
  created_at timestamptz default now()
);
```

### cases table
```sql
create table cases (
  id uuid primary key default gen_random_uuid(),
  source_id uuid references sources(id),
  source_case_id text,                          -- original ID from source
  title text,
  date date,
  date_approximate boolean default false,
  location_lat float,
  location_lng float,
  location_region text,
  location_country text,
  location_raw text,                            -- original location string
  witness_count integer,
  witness_credentials text[],                   -- e.g. ['military','aviation']
  duration_minutes float,
  craft_description jsonb,                      -- extracted descriptors
  behavioral_descriptors jsonb,
  physiological_effects jsonb,
  physical_trace boolean default false,
  radar_corroboration boolean default false,
  video_evidence boolean default false,
  photo_evidence boolean default false,
  official_investigation boolean default false,
  official_acknowledgment boolean default false,
  credibility_score float,
  credibility_tier integer check (credibility_tier between 1 and 4),
  credibility_factors jsonb,
  raw_text text,
  summary text,
  embedding vector(1536),
  source_url text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Indexes
create index on cases (credibility_score desc);
create index on cases (credibility_tier);
create index on cases (date);
create index on cases (location_country);
create index on cases (source_id);
create index on cases using ivfflat (embedding vector_cosine_ops) with (lists = 100);
```

### case_cross_references table
```sql
create table case_cross_references (
  id uuid primary key default gen_random_uuid(),
  case_id_a uuid references cases(id),
  case_id_b uuid references cases(id),
  similarity_score float,
  match_type text,                              -- 'semantic' | 'descriptor' | 'temporal_geographic'
  created_at timestamptz default now(),
  unique(case_id_a, case_id_b)
);
```

### findings_reports table
```sql
create table findings_reports (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  report_type text not null,                    -- 'descriptor_convergence' | 'corroboration_density' | 'geographic_clustering' | 'temporal_pattern' | 'linguistic_fingerprint'
  confidence_level text check (confidence_level in ('HIGH','MEDIUM','LOW','INCONCLUSIVE')),
  methodology text,
  body text,                                    -- markdown
  sources_cited uuid[],                         -- array of case IDs
  version integer default 1,
  is_null_finding boolean default false,
  status text default 'draft' check (status in ('draft','pending_review','published','archived')),
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### contributions table
```sql
create table contributions (
  id uuid primary key default gen_random_uuid(),
  tracking_id text unique default 'MER-' || upper(substring(gen_random_uuid()::text, 1, 8)),
  submission_type text not null check (submission_type in ('personal_account','physical_evidence','documentary_evidence','corroboration')),
  submitted_at timestamptz default now(),
  contributor_id uuid,                          -- nullable, links to auth.users
  anonymous boolean default false,
  structured_data jsonb not null,               -- all form fields
  raw_narrative text,
  ai_screening_score float,
  contamination_flags jsonb,
  credibility_tier integer,
  status text default 'pending' check (status in ('pending','reviewing','integration_queued','integrated','rejected','more_info_requested')),
  rejection_reason text,
  linked_case_id uuid references cases(id),
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

### contributor_annotations table
```sql
create table contributor_annotations (
  id uuid primary key default gen_random_uuid(),
  case_id uuid references cases(id) not null,
  contributor_id uuid not null,
  annotation_type text check (annotation_type in ('corroboration','challenge','link','context')),
  body text not null,
  linked_case_id uuid references cases(id),
  created_at timestamptz default now()
);
```

### admin_audit_log table
```sql
create table admin_audit_log (
  id uuid primary key default gen_random_uuid(),
  admin_id uuid not null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  reason text,
  metadata jsonb,
  created_at timestamptz default now()
);
```

### Seed sources
```sql
insert into sources (name, type, reliability_weight, description, url) values
  ('NUFORC', 'ngo', 0.7, 'National UFO Reporting Center — 150,000+ civilian reports', 'https://nuforc.org'),
  ('Project Blue Book', 'government', 0.9, 'Declassified USAF investigation program 1952-1969, 12,000+ cases', 'https://www.archives.gov'),
  ('The Black Vault', 'ngo', 0.8, 'FOIA document archive compiled by John Greenewald Jr.', 'https://theblackvault.com'),
  ('AARO', 'government', 1.0, 'Pentagon All-domain Anomaly Resolution Office official reports', 'https://www.aaro.mil'),
  ('Congressional Record', 'government', 1.0, 'Official congressional testimony transcripts', 'https://www.congress.gov');

insert into sources (name, type, reliability_weight, description, url, partial_dataset, partnership_pending) values
  ('MUFON', 'ngo', 0.75, 'Mutual UFO Network — investigator-reviewed cases. Public summaries only pending partnership.', 'https://mufon.com', true, true);
```

---

## Step 5 — Background Job Setup

Initialize Inngest in `/lib/inngest.ts`:
```typescript
import { Inngest } from 'inngest'
export const inngest = new Inngest({ id: 'meridian' })
```

Create `/app/api/inngest/route.ts` — the Inngest serve handler.

Register a placeholder job to confirm setup works:
```typescript
export const placeholderJob = inngest.createFunction(
  { id: 'placeholder' },
  { event: 'meridian/test' },
  async ({ event }) => {
    return { status: 'ok', received: event }
  }
)
```

---

## Step 6 — TypeScript Types

Create `/types/database.ts` with TypeScript interfaces matching every table:

```typescript
export interface Case {
  id: string
  source_id: string | null
  source_case_id: string | null
  title: string | null
  date: string | null
  // ... all fields matching schema exactly
  credibility_score: number | null
  credibility_tier: 1 | 2 | 3 | 4 | null
  credibility_factors: CreditabilityFactors | null
  craft_description: CraftDescription | null
  behavioral_descriptors: BehavioralDescriptors | null
  physiological_effects: PhysiologicalEffects | null
  // etc.
}

export interface CreditabilityFactors {
  witness_count: number
  witness_credentials: number
  radar_corroboration: number
  video_evidence: number
  photo_evidence: number
  physical_trace: number
  official_investigation: number
  official_acknowledgment: number
  cross_reference_matches: number
  internal_consistency: number
  total_raw: number
  normalized: number
}

export interface CraftDescription {
  shape: string | null          // e.g. 'triangular', 'disc', 'sphere', 'cigar', 'chevron', 'unknown'
  size: string | null           // e.g. 'small', 'medium', 'large', 'massive'
  color: string[] | null
  luminosity: string | null     // e.g. 'dark', 'lit', 'glowing', 'pulsing'
  surface: string | null
}

export interface BehavioralDescriptors {
  movement: string[]            // e.g. ['stationary', 'hovering', 'rapid_acceleration', 'zigzag']
  speed: string | null
  altitude: string | null
  silent: boolean | null
  sound: string | null
}

export interface PhysiologicalEffects {
  electromagnetic: boolean
  heat: boolean
  paralysis: boolean
  lost_time: boolean
  nausea: boolean
  other: string[]
}

export interface Source {
  id: string
  name: string
  type: 'government' | 'academic' | 'ngo' | 'media' | 'contribution'
  reliability_weight: number
  description: string | null
  url: string | null
  partial_dataset: boolean
  partnership_pending: boolean
  last_ingested_at: string | null
  created_at: string
}

export interface FindingsReport {
  id: string
  title: string
  report_type: string
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'INCONCLUSIVE'
  methodology: string | null
  body: string | null
  sources_cited: string[]
  version: number
  is_null_finding: boolean
  status: 'draft' | 'pending_review' | 'published' | 'archived'
  published_at: string | null
  created_at: string
  updated_at: string
}

export interface Contribution {
  id: string
  tracking_id: string
  submission_type: 'personal_account' | 'physical_evidence' | 'documentary_evidence' | 'corroboration'
  submitted_at: string
  contributor_id: string | null
  anonymous: boolean
  structured_data: Record<string, unknown>
  raw_narrative: string | null
  ai_screening_score: number | null
  contamination_flags: Record<string, unknown> | null
  credibility_tier: number | null
  status: 'pending' | 'reviewing' | 'integration_queued' | 'integrated' | 'rejected' | 'more_info_requested'
  rejection_reason: string | null
  linked_case_id: string | null
  created_at: string
}
```

---

## Step 7 — Test Route

Create `/app/test/page.tsx` — a design system verification page. This route is for development only and should be removed or protected before public launch.

The page must display:

**Typography section**
- Instrument Serif at h1, h2, h3 sizes with sample text
- JetBrains Mono body paragraph
- Oswald in a code/label context
- Caveat in a handwriting context

**Color palette section**
- Swatches for every CSS variable: bg, surface, board-bg, border, border-strong, text-1, text-2, text-3, gold, orange, purple, red, green, blue, and all soft variants

**Component section**
- All Button variants and sizes
- All Badge variants (all four tiers, all four confidence levels)
- Card component with sample content
- Divider with and without label
- Tag component with sample labels

**Tier color section**
- Four boxes clearly labeled TIER 1 through TIER 4 with correct background colors

---

## Definition of Done

Phase 1 is complete when ALL of the following are true:

- [ ] `npm run build` completes with zero errors
- [ ] App deploys to Vercel without errors
- [ ] All environment variables are set in Vercel project settings
- [ ] Supabase migrations have run — all tables exist and are queryable
- [ ] pgvector extension is enabled — `select * from pg_extension where extname = 'vector'` returns a row
- [ ] Seed sources are present — `select count(*) from sources` returns 6
- [ ] Inngest is connected — placeholder job appears in Inngest dashboard
- [ ] `/test` route renders correctly showing all design tokens, fonts, and components
- [ ] All four fonts load correctly (no flash of unstyled text in production)
- [ ] TypeScript compiles in strict mode with zero errors
- [ ] `.env.example` is committed, `.env.local` is gitignored

## What NOT to Build in This Phase

- No pages other than `/test`
- No navigation (stub layout is fine)
- No data fetching logic beyond client initialization
- No AI calls
- No ingest scripts

---

## Scrummaster Reference

### 1.2 Design System Requirements

Font loading: Instrument Serif, JetBrains Mono, Oswald, Caveat via next/font or Google Fonts

---

## Handoff Notes for Next Phase

When Phase 1 is complete, the Phase 2 agent needs:
- Confirmed Supabase project URL and that all tables exist
- Confirmed Anthropic API key is working
- Confirmed Inngest is connected
- The `/lib/supabase.ts` and `/lib/anthropic.ts` client patterns to follow
- The TypeScript types from `/types/database.ts`

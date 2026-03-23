# Meridian — Phase 2 Build Spec: Corpus Engine

## Agent Instructions

You are building the data pipeline for The Meridian Project. This phase has no user-facing UI. Its entire job is to ingest real data from public sources, process it through entity extraction and credibility scoring, and populate the database with a meaningful corpus of cases.

When Phase 2 is done, the database should contain real, scored, embedded cases ready for the Evidence Index to display.

Read this entire document before writing any code. Refer to the existing `/types/database.ts` for all TypeScript interfaces.

---

## Prerequisites (confirm before starting)

- [ ] Phase 1 is complete — all tables exist in Supabase
- [ ] pgvector extension is enabled
- [ ] `ANTHROPIC_API_KEY` is set and working
- [ ] Inngest is connected
- [ ] All 6 seed sources are present in the `sources` table

---

## What You Are Building

1. Data ingest scripts for NUFORC, Project Blue Book, and MUFON public cases
2. Entity extraction pipeline using Claude API
3. Data normalization layer
4. Vector embedding generation
5. Credibility scoring model
6. Cross-reference linking between similar cases
7. Deduplication logic
8. A working `/api/stats` endpoint confirming real data is in the database

---

## Architecture Pattern

All ingest work runs as Inngest background jobs — not in API routes or on page load. Each job must be **idempotent** — safe to re-run without creating duplicates.

General pipeline per case:
```
raw source data
  → parse to intermediate format
  → entity extraction (Claude API)
  → normalize fields
  → generate embedding (Claude API)
  → score credibility
  → check for duplicates
  → upsert to cases table
  → queue cross-reference job
```

Create all pipeline logic in `/lib/pipeline/`:
```
/lib/pipeline/
  ingest-nuforc.ts
  ingest-bluebook.ts
  ingest-mufon.ts
  entity-extraction.ts
  normalize.ts
  embed.ts
  score.ts
  cross-reference.ts
  deduplicate.ts
```

---

## Step 1 — NUFORC Ingest

### Data Source

NUFORC data is available as a structured CSV dataset. The most accessible version is on Kaggle (search "NUFORC UFO sightings dataset") or directly from nuforc.org. The dataset has ~150,000 rows.

Primary columns in the NUFORC CSV:
- `datetime` — date and time of sighting
- `city`, `state`, `country` — location
- `shape` — craft shape description
- `duration (hours/min)` — duration field
- `comments` — narrative text
- `date posted` — submission date
- `latitude`, `longitude` — coordinates (where available)

### Implementation

Create `/lib/pipeline/ingest-nuforc.ts`:

```typescript
// Key responsibilities:
// 1. Download or read NUFORC CSV from /data/nuforc.csv (place raw data files in /data/, gitignored)
// 2. Parse each row
// 3. Map to intermediate CaseInput type (defined below)
// 4. For each row: check if source_case_id already exists → skip if so (idempotency)
// 5. Queue entity extraction job for each new case
// 6. Update sources.last_ingested_at on completion

interface CaseInput {
  source_id: string              // NUFORC source UUID from sources table
  source_case_id: string         // Row index or unique ID from source
  title: string                  // Generated: "UFO Sighting — [city], [state] [date]"
  date: string | null            // ISO date
  date_approximate: boolean
  location_lat: number | null
  location_lng: number | null
  location_region: string | null
  location_country: string | null
  location_raw: string
  duration_minutes: number | null
  raw_text: string               // Full comments/narrative
  source_url: string | null
}
```

### Inngest Job

```typescript
export const ingestNuforc = inngest.createFunction(
  { id: 'ingest-nuforc', concurrency: { limit: 5 } },
  { event: 'meridian/ingest.nuforc' },
  async ({ event, step }) => {
    // Process in batches of 100
    // For each batch: parse → check duplicates → queue extraction
  }
)
```

**NUFORC source_id**: look up the UUID from the sources table where name = 'NUFORC'.

---

## Step 2 — Project Blue Book Ingest

### Data Source

Project Blue Book is fully digitized. The best structured dataset is available on GitHub (search "project blue book dataset") and contains ~12,600 cases with fields including:
- Case number
- Date
- Location (city, state)
- Evaluation (e.g., "Unidentified", "Astronomical", "Balloon", etc.)
- Brief description

### Implementation

Create `/lib/pipeline/ingest-bluebook.ts`. Same pattern as NUFORC ingest.

Additional field to capture: `evaluation` — Blue Book's own classification. Store in `structured_data` JSONB on the case as `bluebook_evaluation`. Cases classified as "Unidentified" by Blue Book should get a boost in the official_investigation scoring factor.

Blue Book cases automatically set: `official_investigation: true` (all cases were officially investigated).

---

## Step 3 — MUFON Public Cases Ingest

### Data Source

MUFON's public case summary pages at mufon.com/investigations/. Scrape only publicly visible case summaries — do not attempt to access any content behind a login wall or membership paywall.

**Important constraints:**
- Respect robots.txt
- Rate limit requests: minimum 2 seconds between requests
- Maximum 1,000 public cases for initial ingest (expand later)
- Set `partial_dataset: true` and `partnership_pending: true` on the MUFON source record (already seeded this way)
- Each case stored with a note in structured_data: `"data_completeness": "public_summary_only"`

### Implementation

Create `/lib/pipeline/ingest-mufon.ts` using fetch or a lightweight scraping approach. Parse available fields only — title, date, location, brief description. Do not invent or fill in missing fields.

---

## Step 4 — Entity Extraction Pipeline

### Purpose

Transform raw narrative text into structured descriptor fields using Claude. This runs after ingest for every new case.

### Implementation

Create `/lib/pipeline/entity-extraction.ts`:

```typescript
export async function extractEntities(rawText: string): Promise<ExtractedEntities> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1000,
    messages: [{
      role: 'user',
      content: EXTRACTION_PROMPT.replace('{{TEXT}}', rawText)
    }]
  })
  // Parse JSON response
  // Return typed ExtractedEntities
}
```

### Extraction Prompt

The prompt must instruct Claude to return ONLY valid JSON with no preamble. Use this structure:

```
You are a research data extraction system. Extract structured information from the following UFO/UAP sighting report. Return ONLY a valid JSON object with no additional text.

Extract the following fields:
- craft_description: { shape, size, color (array), luminosity, surface }
- behavioral_descriptors: { movement (array), speed, altitude, silent (boolean), sound }
- physiological_effects: { electromagnetic (boolean), heat (boolean), paralysis (boolean), lost_time (boolean), nausea (boolean), other (array of strings) }
- witness_count: integer or null
- witness_credentials: array of strings from: ['military', 'aviation', 'law_enforcement', 'government', 'scientific', 'civilian']
- physical_trace: boolean
- radar_corroboration: boolean
- video_evidence: boolean
- photo_evidence: boolean
- official_investigation: boolean
- official_acknowledgment: boolean
- summary: A single clear sentence describing the sighting (max 150 chars)

For any field where information is not present in the text, use null.
For boolean fields where not mentioned, default to false.

Report text:
{{TEXT}}
```

### Batch Processing

Process entity extraction in batches to avoid rate limits:
- Batch size: 10 cases at a time
- Delay between batches: 1 second
- Retry on rate limit with exponential backoff (max 3 retries)
- Log failures — do not crash the entire job on a single extraction failure

### Inngest Job

```typescript
export const extractCaseEntities = inngest.createFunction(
  { id: 'extract-case-entities', concurrency: { limit: 3 } },
  { event: 'meridian/case.extract' },
  async ({ event, step }) => {
    const { caseId, rawText } = event.data
    const entities = await step.run('extract', () => extractEntities(rawText))
    await step.run('update-case', () => updateCaseWithEntities(caseId, entities))
    await step.sendEvent('queue-embedding', {
      name: 'meridian/case.embed',
      data: { caseId }
    })
  }
)
```

---

## Step 5 — Data Normalization

Create `/lib/pipeline/normalize.ts`:

### Location Normalization

```typescript
export function normalizeLocation(raw: string): {
  region: string | null
  country: string | null
  lat: number | null
  lng: number | null
}
```

- Map US state abbreviations to full names
- Standardize country names to ISO country codes
- If lat/lng already present from source, use them
- For missing coordinates: use a basic geocoding lookup if available, otherwise leave null — do not hallucinate coordinates

### Date Normalization

```typescript
export function normalizeDate(raw: string): {
  isoDate: string | null
  approximate: boolean
}
```

Handle formats:
- `MM/DD/YYYY`
- `YYYY-MM-DD`
- Month name formats: `January 15, 1976`
- Approximate: `Summer 1969` → set approximate: true, best-guess ISO date
- Unknown/missing → null

### Descriptor Taxonomy

Define a controlled vocabulary. Normalize free-text craft shapes to canonical values:

```typescript
export const CRAFT_SHAPES = [
  'disc', 'sphere', 'triangle', 'chevron', 'cigar', 'cylinder',
  'boomerang', 'diamond', 'rectangle', 'orb', 'fireball',
  'saturn-like', 'cross', 'teardrop', 'egg', 'unknown', 'other'
] as const

export function normalizeCraftShape(raw: string): typeof CRAFT_SHAPES[number]
```

Apply similar normalization to movement descriptors and color values.

---

## Step 6 — Embedding Generation

Create `/lib/pipeline/embed.ts`:

```typescript
export async function generateEmbedding(text: string): Promise<number[]> {
  // Use Anthropic's embedding capability or OpenAI's text-embedding-3-small
  // If using Claude: create a concise representation and embed
  // Target dimension: 1536 (matching schema)
  // Return the embedding vector as number[]
}
```

**Note on embedding model:** The cases table uses `vector(1536)`. If using OpenAI `text-embedding-3-small`, it outputs 1536 dimensions natively. If using a different model, adjust the schema dimension to match. Be consistent — all embeddings must use the same model.

The text to embed for each case:
```typescript
const textToEmbed = `
  ${case.title}
  ${case.summary}
  Location: ${case.location_region}, ${case.location_country}
  Date: ${case.date}
  Craft: ${case.craft_description?.shape} ${case.craft_description?.color?.join(' ')}
  ${case.raw_text?.substring(0, 500)}
`.trim()
```

### Inngest Job

```typescript
export const embedCase = inngest.createFunction(
  { id: 'embed-case', concurrency: { limit: 5 } },
  { event: 'meridian/case.embed' },
  async ({ event, step }) => {
    const { caseId } = event.data
    // Fetch case from DB
    // Generate embedding
    // Update cases.embedding
    // Queue scoring
  }
)
```

---

## Step 7 — Credibility Scoring

Create `/lib/pipeline/score.ts`:

### Scoring Model

Implement exactly as specified. All weights are visible and stored with the score.

```typescript
export function scoreCase(caseData: Case): {
  score: number           // 0–100 normalized
  tier: 1 | 2 | 3 | 4
  factors: CredibilityFactors
} {
  let raw = 0
  const factors: CredibilityFactors = {
    witness_count: 0,
    witness_credentials: 0,
    radar_corroboration: 0,
    video_evidence: 0,
    photo_evidence: 0,
    physical_trace: 0,
    official_investigation: 0,
    official_acknowledgment: 0,
    cross_reference_matches: 0,
    internal_consistency: 0,
    total_raw: 0,
    normalized: 0
  }

  // Witness count: 0–20 pts
  if (caseData.witness_count) {
    factors.witness_count = Math.min(20, caseData.witness_count * 4)
  }

  // Witness credentials: 0–20 pts
  const credCount = caseData.witness_credentials?.length ?? 0
  const credentialedTypes = ['military', 'aviation', 'law_enforcement', 'government', 'scientific']
  const hasCredentialed = caseData.witness_credentials?.some(c => credentialedTypes.includes(c))
  factors.witness_credentials = hasCredentialed ? Math.min(20, credCount * 7) : 0

  // Radar corroboration: 0–15 pts
  factors.radar_corroboration = caseData.radar_corroboration ? 15 : 0

  // Video evidence: 0–10 pts
  factors.video_evidence = caseData.video_evidence ? 10 : 0

  // Photo evidence: 0–5 pts
  factors.photo_evidence = caseData.photo_evidence ? 5 : 0

  // Physical trace: 0–10 pts
  factors.physical_trace = caseData.physical_trace ? 10 : 0

  // Official investigation: 0–10 pts
  factors.official_investigation = caseData.official_investigation ? 10 : 0

  // Official acknowledgment: 0–15 pts
  factors.official_acknowledgment = caseData.official_acknowledgment ? 15 : 0

  // Cross-reference matches: populated after cross-reference step, default 0
  factors.cross_reference_matches = 0

  // Internal consistency: 0–10 pts — set to 5 default until AI assessment runs
  factors.internal_consistency = 5

  raw = Object.values(factors).reduce((sum, v) => sum + v, 0)
  factors.total_raw = raw
  factors.normalized = Math.round((raw / 130) * 100)

  const normalized = factors.normalized
  const tier: 1 | 2 | 3 | 4 =
    normalized >= 70 ? 1 :
    normalized >= 45 ? 2 :
    normalized >= 20 ? 3 : 4

  return { score: normalized, tier, factors }
}
```

### Source Reliability Adjustment

After base scoring, multiply by the source's `reliability_weight`:
```typescript
const adjustedScore = Math.round(baseScore * source.reliability_weight)
```

---

## Step 8 — Cross-Reference Linking

Create `/lib/pipeline/cross-reference.ts`:

### Purpose

Find cases from different sources that likely describe the same phenomenon — not the same event (that's deduplication), but similar phenomena. A triangular craft sighting from 1989 in Belgium that matches descriptor patterns in a 1990 Illinois case is a cross-reference — two independent events with high similarity.

### Implementation

```typescript
export async function findCrossReferences(caseId: string): Promise<void> {
  // 1. Fetch the case's embedding from DB
  // 2. Run pgvector similarity search: find top 10 most similar cases
  //    - Exclude cases from the same source (that's deduplication)
  //    - Minimum similarity threshold: 0.85 cosine similarity
  // 3. For each match above threshold:
  //    - Insert into case_cross_references (if not already exists)
  //    - Update cross_reference_matches scoring factor on both cases
  //    - Re-calculate and update credibility_score and tier for both cases
}
```

### pgvector Query

```sql
select id, 1 - (embedding <=> $1::vector) as similarity
from cases
where source_id != $2
  and id != $3
  and embedding is not null
order by embedding <=> $1::vector
limit 10;
```

### Cross-reference scoring boost

Each Tier 1/2 cross-reference match adds points to `cross_reference_matches` factor:
- Tier 1 match: +5 pts (max 15)
- Tier 2 match: +3 pts (max 15)
- Tier 3/4 match: +1 pt (max 15)

---

## Step 9 — Deduplication

Create `/lib/pipeline/deduplicate.ts`:

### Logic

A case is a likely duplicate if:
- Same date (within 1 day)
- Same approximate location (within 50km)
- Cosine similarity > 0.95

```typescript
export async function checkForDuplicate(caseInput: CaseInput): Promise<string | null> {
  // Returns the UUID of the likely duplicate case, or null if no duplicate found
  // Does NOT delete — flags only
  // If duplicate found, set a flag on both cases: structured_data.possible_duplicate_of = uuid
}
```

**Never delete cases** — preserve provenance. If a case appears in both NUFORC and Blue Book, both records exist, linked via the cross-reference table with match_type = 'likely_duplicate'.

---

## Step 10 — Stats API Endpoint

Create `/app/api/stats/route.ts`:

```typescript
// GET /api/stats
// Returns:
{
  total_cases: number
  cases_by_source: { source_name: string, count: number }[]
  cases_by_tier: { tier: number, count: number }[]
  cases_with_embeddings: number
  cases_scored: number
  last_updated: string
}
```

This endpoint is the primary way to verify Phase 2 is working correctly.

---

## Data Files

Place raw source data files in `/data/` (create this directory, add to `.gitignore`):
```
/data/
  nuforc.csv
  bluebook.csv
  README.md    — notes on where each file was downloaded from and when
```

Do not commit raw data files to the repo — they can be hundreds of MB.

---

## Definition of Done

Phase 2 is complete when ALL of the following are true:

- [ ] `/api/stats` returns `total_cases` > 100,000
- [ ] `/api/stats` shows cases from at least 2 sources
- [ ] `/api/stats` shows cases in all 4 tiers
- [ ] `/api/stats` shows `cases_with_embeddings` > 50,000
- [ ] 10 randomly sampled cases each have: non-null `credibility_score`, non-null `credibility_tier`, non-null `craft_description`, non-null `summary`, non-null `embedding`
- [ ] `case_cross_references` table has at least 1,000 rows
- [ ] MUFON source has `partial_dataset: true` in sources table
- [ ] All ingest jobs are idempotent — re-running does not create duplicate cases
- [ ] No job crashes the pipeline on a single bad record — errors are logged, processing continues

## What NOT to Build in This Phase

- No UI pages
- No public API endpoints beyond `/api/stats`
- No contribution intake
- No findings reports

---

## Handoff Notes for Next Phase

The Phase 3 agent needs to know:
- The `/api/cases` endpoint does not exist yet — they will build it
- The credibility scoring model weights are in `/lib/pipeline/score.ts`
- The descriptor taxonomy (craft shapes, movement types) is in `/lib/pipeline/normalize.ts`
- Embeddings use dimension 1536 — note which model was used so Phase 5 query embedding uses the same model

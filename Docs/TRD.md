# The Meridian Project — Technical Requirements Document

## Stack Overview

**Frontend:** Next.js 14+ (App Router), TypeScript, Tailwind CSS
**Backend:** Next.js API routes + Node.js serverless functions
**Database:** PostgreSQL (primary data store via Supabase)
**Vector Database:** Pinecone or pgvector — for semantic search and similarity matching across corpus
**AI/LLM:** Anthropic Claude API (claude-sonnet) — inference engine, pattern analysis, query interface, submission screening
**Search:** Typesense or Meilisearch — fast full-text search across corpus
**File Storage:** Supabase Storage or S3 — for submitted media files
**Auth:** Supabase Auth — for researcher accounts and contributor profiles
**Hosting:** Vercel
**Background Jobs:** Inngest or Trigger.dev — for async corpus processing, report generation

---

## Data Architecture

### Core Tables

**cases**
- id, source, source_id, title, date, location (lat/lng/region/country)
- witness_count, witness_credentials, duration_minutes
- craft_description (JSONB), behavioral_descriptors (JSONB)
- physiological_effects (JSONB), physical_trace (boolean)
- radar_corroboration (boolean), video_evidence (boolean), photo_evidence (boolean)
- official_investigation (boolean), official_acknowledgment (boolean)
- credibility_score (float), credibility_tier (1-4)
- credibility_factors (JSONB — factor breakdown)
- raw_text, summary, embedding (vector)
- created_at, updated_at, source_url

**sources**
- id, name, type (government/academic/ngo/media/contribution)
- reliability_weight (float), description, url
- last_ingested_at

**findings_reports**
- id, title, report_type, confidence_level
- methodology, body (markdown), sources_cited (array)
- version, published_at, updated_at
- is_null_finding (boolean)

**contributions**
- id, submission_type, submitted_at
- contributor_id (nullable), anonymous (boolean)
- structured_data (JSONB — all form fields)
- raw_narrative, ai_screening_score (float)
- contamination_flags (JSONB), credibility_tier
- status (pending/reviewing/integrated/rejected)
- linked_case_id (nullable)

**annotations** (researcher-added)
- id, case_id, user_id
- annotation_type (corroboration/challenge/context/link)
- body, linked_case_id (nullable), created_at

**contribution_annotations** (on contributions, for internal review)
- id, contribution_id, user_id, highlightedText, notes, attachments (JSONB)

**embeddings** (if not stored inline)
- id, entity_type, entity_id, embedding (vector), model_version

---

## AI/LLM Architecture

### Corpus Processing Pipeline

1. **Ingest** — raw data from source (structured CSV, FOIA PDF, API)
2. **Parse** — extract structured fields using Claude (entity extraction prompt)
3. **Normalize** — standardize location formats, date formats, descriptor taxonomy
4. **Embed** — generate vector embeddings for semantic similarity search
5. **Score** — run credibility scoring model against extracted fields
6. **Cross-reference** — run similarity search against existing corpus, flag matches
7. **Store** — write to PostgreSQL + vector DB

### Credibility Scoring Model

Weighted factor model (not black box — all weights visible):
- Witness count: 0–20 pts
- Witness credentials (military/aviation/LE): 0–20 pts
- Radar corroboration: 0–15 pts
- Video evidence (quality-adjusted): 0–10 pts
- Photo evidence (quality-adjusted): 0–5 pts
- Physical trace: 0–10 pts
- Official investigation: 0–10 pts
- Official acknowledgment: 0–15 pts
- Cross-reference matches (Tier 1/2 cases): 0–15 pts
- Internal consistency (AI-assessed): 0–10 pts
- Max: 130 pts → normalized to 0–100

Tier assignment:
- Tier 1: 70–100
- Tier 2: 45–69
- Tier 3: 20–44
- Tier 4: 0–19

### Findings Report Generation

- Scheduled job runs weekly, re-analyzing full corpus for each report type
- Claude prompted with corpus summary + specific analysis task per report type
- Output: structured markdown with confidence level, methodology, cited cases
- Human review flag triggered if confidence is High — requires sign-off before publish
- All reports versioned, diffs tracked

### Query Interface

- User query → intent classification → corpus retrieval (hybrid: semantic + keyword)
- Retrieved cases + query → Claude grounded response generation
- Strict grounding prompt — Claude instructed to cite only retrieved corpus, flag uncertainty
- Response includes: answer, confidence level, cited case IDs, "insufficient data" flag if applicable

### Contribution AI Screening

On submission:
1. Extract structured data from form fields
2. Score internal consistency (timeline plausible, details non-contradictory)
3. Specificity score (vague vs. granular detail)
4. Semantic similarity against recently viral media — contamination flag
5. Cross-reference against corpus — high similarity to credible cases boosts score
6. Output: screening score, flags, recommended tier, summary for human reviewer

---

## Key API Endpoints

```
GET  /api/cases              — paginated, filterable case list
GET  /api/cases/:id          — single case with full detail
GET  /api/cases/:id/related  — AI-surfaced similar cases
GET  /api/findings           — paginated findings reports
GET  /api/findings/:id       — single report
POST /api/query              — natural language corpus query
POST /api/contribute         — submit new account/evidence
GET  /api/stats              — corpus statistics for homepage
```

---

## Infrastructure & Performance

- All case data server-side rendered for SEO and initial load
- Vector search results cached with 1hr TTL
- Findings reports statically generated, rebuilt on publish
- Contribution submissions processed async via background job queue
- Rate limiting on /api/query and /api/contribute endpoints
- Media uploads virus-scanned before storage

---

## Security & Privacy

- Contributor PII stored separately from case data, never exposed publicly
- Anonymous submissions fully anonymized at ingestion — no IP logged
- Admin actions fully audit-logged
- Credibility score adjustments require reasoning field — no silent edits
- FOIA documents stored with source attribution — no orphaned documents

---

## Monitoring

- Corpus growth rate (cases/week by source)
- AI screening accuracy (sampled human review vs. AI score correlation)
- Query latency P50/P95
- Contribution submission → integration rate by tier
- Findings report confidence distribution over time

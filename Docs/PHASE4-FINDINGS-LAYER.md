# Meridian — Phase 4 Build Spec: Findings Layer

## Agent Instructions

You are building the headline feature of The Meridian Project — AI-generated pattern reports that surface connections across the evidence corpus that no individual researcher could find manually. This is what makes Meridian different from every other platform in this space.

The findings layer must feel like a research journal. Editorial, rigorous, transparent. Every report shows its methodology. Null findings are published with the same visual weight as positive findings — this is non-negotiable.

Read this entire document before writing any code.

---

## Prerequisites (confirm before starting)

- [ ] Phase 2 complete — 100,000+ cases in database with scores and embeddings
- [ ] Phase 3 complete — `/api/cases/[id]` exists, CaseCard component exists
- [ ] `findings_reports` table exists in database (created in Phase 1)
- [ ] Inngest is connected and functional
- [ ] `ANTHROPIC_API_KEY` is working

---

## What You Are Building

1. `/api/findings` — paginated findings report list endpoint
2. `/api/findings/[id]` — single report endpoint
3. `/findings` — findings index page
4. `/findings/[id]` — findings report detail page (editorial layout)
5. Two initial reports generated and published: Descriptor Convergence and Corroboration Density
6. Report generation Inngest job (scheduled weekly)
7. Admin: findings publish/reject controls
8. Null finding display handling

---

## Design Direction

Findings reports are the most editorial content on the platform. They should feel like reading a Nature article or a long-form investigation piece — not a dashboard or a data table.

```
Headline:     Instrument Serif, large (36–48px), generous line height
Subhead:      JetBrains Mono, 20px, text-2
Body:         JetBrains Mono, 14px, text-1, max-width 680px, generous line height (1.7)
Labels:       Oswald, 10px, uppercase, tracked
Confidence:   Colored badge, prominent position
Methodology:  Collapsible section — present but not intrusive
Citations:    Inline case chips — click to open case detail
```

---

## Step 1 — API Routes

### GET /api/findings

File: `/app/api/findings/route.ts`

Query parameters:
```
page            integer, default 1
limit           integer, default 10
report_type     string filter
confidence      'HIGH' | 'MEDIUM' | 'LOW' | 'INCONCLUSIVE'
include_null    boolean, default true
status          'published' only for public endpoint
```

Response:
```typescript
{
  reports: FindingsReportSummary[]
  total: number
  page: number
  total_pages: number
}

interface FindingsReportSummary {
  id: string
  title: string
  report_type: string
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'INCONCLUSIVE'
  is_null_finding: boolean
  summary: string          // First 200 chars of body
  published_at: string
  sources_cited_count: number
  version: number
}
```

### GET /api/findings/[id]

Returns full `FindingsReport` plus:
- `cited_cases: CaseListItem[]` — resolved case objects for each UUID in `sources_cited`

### POST /api/admin/findings/[id]/publish (admin-protected)

Body: `{ action: 'publish' | 'reject', reason?: string }`

Requires admin authentication. Logs to `admin_audit_log`.

---

## Step 2 — Findings Index Page `/findings`

File: `/app/findings/page.tsx`

### Layout

```
[Navigation]

FINDINGS                         [filter controls — right]
The Meridian Project

12 reports published across 4 categories

[Report cards — full width list]
```

### Page Header

```tsx
<header>
  <p className="font-mono text-xs uppercase tracking-widest text-text-2">
    The Meridian Project
  </p>
  <h1 className="font-display text-5xl text-text-1 mt-2">
    Findings
  </h1>
  <p className="font-body text-lg text-text-2 mt-4 max-w-2xl">
    AI-generated pattern analysis across {totalCases.toLocaleString()} documented cases.
    Findings are published with full methodology and include null results.
  </p>
</header>
```

### Filter Bar

Oswald labels. Filter by:
- Report type: All / Descriptor Convergence / Corroboration Density / Geographic Clustering / Temporal Pattern / Linguistic Fingerprint
- Confidence: All / High / Medium / Low / Inconclusive
- Include null findings: toggle (default: on)

### Report Card Component

File: `/components/findings/FindingsCard.tsx`

```
┌────────────────────────────────────────────────────────┐
│ DESCRIPTOR CONVERGENCE          [HIGH confidence badge] │
│                                                         │
│ Six Physical Descriptors Appear Across 47,000           │
│ Independent Accounts With No Shared Origin              │
│ [Instrument Serif, 22px]                                │
│                                                         │
│ Analysis of the full NUFORC and Blue Book corpus        │
│ surfaces a statistically anomalous convergence...       │
│ [JetBrains Mono, excerpt]                               │
│                                                         │
│ Published March 15, 2025  ·  47,000 cases analyzed     │
│ [Oswald, small, text-2]                                 │
└────────────────────────────────────────────────────────┘
```

Null findings: identical layout. The word "null" never appears in the card. The headline states what was investigated. The excerpt states the conclusion honestly. Example:

```
Title: "Linguistic Fingerprint Analysis: No Anomalous Cross-Source 
        Language Patterns Identified at Current Corpus Size"
Excerpt: "At current corpus size and available metadata, analysis does not 
          surface sufficient evidence of anomalous language convergence..."
```

---

## Step 3 — Findings Report Detail Page `/findings/[id]`

File: `/app/findings/[id]/page.tsx`

Static generation with revalidation on publish.

### Full Layout

```
[Navigation]

[Breadcrumb: Findings → Report Title]

┌─────────────────────────────────────────────────┐
│ DESCRIPTOR CONVERGENCE    [HIGH] [v1] [Mar 2025] │
│                                                  │
│ Six Physical Descriptors Appear Across           │
│ 47,000 Independent Accounts With No             │
│ Shared Origin                                   │
│ [Instrument Serif, 42px]                        │
│                                                  │
│ Across [14] sources  ·  [47,231] cases analyzed  │
│ [Oswald, text-2]                                 │
└─────────────────────────────────────────────────┘

[Methodology — collapsible]

[Report body — editorial prose, 680px max-width]

[Cited Cases — grid of CaseCards]
```

### Confidence Badge Component

File: `/components/ui/ConfidenceBadge.tsx`

```
HIGH          green background, white text
MEDIUM        gold background, text-1
LOW           text-2 background, text-1 text
INCONCLUSIVE  text-3 background, bg text
```

Oswald, uppercase, small caps style. Not a large element — sits inline with metadata.

### Methodology Section

Collapsible (open by default on first load, collapsible after):

```tsx
<details open>
  <summary className="font-mono text-xs uppercase tracking-widest cursor-pointer">
    Methodology
  </summary>
  <div className="font-body text-sm text-text-2 mt-4 max-w-2xl">
    {/* methodology text */}
  </div>
</details>
```

### Report Body

Markdown rendered to HTML. Use `react-markdown` or similar:

```bash
npm install react-markdown remark-gfm
```

Inline case citations appear as chips within the prose:

The markdown body will contain citation markers like `[CASE:uuid]`. Replace these with clickable CaseCitation chips:

```tsx
// CaseCitation component
// Props: caseId, title, tier
// Renders: small inline chip with tier color dot, case title truncated
// On click: opens case detail in slide-over panel (right side)
```

### Slide-Over Panel

File: `/components/layout/SlideOver.tsx`

Used for inline case citations. On click: case detail slides in from right, 480px wide, without navigating away from the report.

Fetches `/api/cases/[id]` on open. Shows full case detail content (reuse sections from Phase 3 case detail page). Has a close button and an "Open full case" link.

### Cited Cases Section

Below the report body: a grid of CaseCard components for all `sources_cited` cases. Sorted by credibility score descending.

```tsx
<section>
  <h2 className="font-mono text-xs uppercase tracking-widest text-text-2">
    Cases Referenced In This Analysis
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
    {citedCases.map(c => <CaseCard key={c.id} case={c} />)}
  </div>
</section>
```

### Null Finding Display

For `is_null_finding: true` reports, add one additional element after the methodology section and before the body:

```tsx
<div className="border-l-2 border-text-3 pl-4 my-8">
  <p className="font-mono text-xs uppercase tracking-widest text-text-3">
    Null Finding
  </p>
  <p className="font-body text-sm text-text-2 mt-2">
    This analysis did not surface sufficient evidence to support the investigated
    hypothesis at the current corpus size and confidence threshold.
    This result is published with the same rigor as positive findings.
  </p>
</div>
```

No other visual difference from positive finding reports.

---

## Step 4 — Report Generation System

### Report Generator Module

File: `/lib/findings/generate-report.ts`

```typescript
export async function generateReport(
  reportType: ReportType,
  corpusSummary: CorpusSummary
): Promise<GeneratedReport> {
  // 1. Build corpus summary for this report type
  // 2. Construct Claude prompt
  // 3. Call Claude API
  // 4. Parse structured response
  // 5. Return GeneratedReport
}

interface GeneratedReport {
  title: string
  body: string                    // Markdown with [CASE:uuid] citation markers
  methodology: string
  confidence_level: 'HIGH' | 'MEDIUM' | 'LOW' | 'INCONCLUSIVE'
  is_null_finding: boolean
  sources_cited: string[]         // case UUIDs referenced in body
  report_type: string
}
```

### Corpus Summary Builder

File: `/lib/findings/corpus-summary.ts`

Before calling Claude, build a structured summary of the relevant corpus data. Do NOT send raw case text to Claude — send aggregated statistics and patterns.

For Descriptor Convergence:
```typescript
// Query corpus for:
// - Top 50 craft descriptors by frequency, with source breakdown
// - For each descriptor: which sources report it, geographic spread, temporal spread
// - Flag: descriptors that appear in >3 sources with no geographic clustering
// Return as structured JSON for prompt injection
```

This keeps prompts within token limits and prevents hallucination by grounding Claude in real aggregated data.

### Report Prompts

**Descriptor Convergence Prompt:**
```
You are a research analyst for The Meridian Project, a rigorous evidence research platform.

You have been provided with aggregated descriptor frequency data from {{total_cases}} documented 
UAP/anomalous aerial phenomenon cases across {{source_count}} independent sources.

Your task: Identify craft and behavioral descriptors that appear with statistically anomalous 
frequency across multiple independent sources with no shared geographic or temporal origin. 
These represent potential signal in the data.

Corpus data:
{{descriptor_frequency_json}}

Write a research findings report with:
1. A precise, specific headline (state the finding, not the method)
2. A clear findings section stating what was found or not found
3. Analysis of the most significant patterns with specific numbers
4. Limitations and alternative explanations
5. A confidence assessment: HIGH (strong multi-source convergence), MEDIUM (notable patterns with 
   caveats), LOW (weak signal), or INCONCLUSIVE (insufficient evidence)
6. Whether this is a null finding (true if evidence does not support a meaningful pattern)

When citing specific cases, use the marker format [CASE:uuid] with the actual UUID.

Return ONLY a JSON object:
{
  "title": "...",
  "body": "... markdown with [CASE:uuid] markers ...",
  "methodology": "...",
  "confidence_level": "HIGH|MEDIUM|LOW|INCONCLUSIVE",
  "is_null_finding": true|false,
  "sources_cited": ["uuid1", "uuid2", ...]
}
```

**Corroboration Density Prompt:** Similar structure, focused on identifying cases with highest independent confirmation — multiple witnesses + radar + video + official acknowledgment.

### Inngest Job

File: `/lib/findings/findings-job.ts`

```typescript
export const generateFindings = inngest.createFunction(
  { id: 'generate-findings' },
  { cron: '0 0 * * 1' },           // Every Monday midnight
  async ({ step }) => {
    for (const reportType of REPORT_TYPES) {
      await step.run(`generate-${reportType}`, async () => {
        const summary = await buildCorpusSummary(reportType)
        const generated = await generateReport(reportType, summary)

        // Check if report has changed significantly from last version
        const existing = await getLatestReport(reportType)
        const hasChanged = existing
          ? await hasSignificantChange(existing, generated)
          : true

        if (hasChanged) {
          await saveReportDraft(generated)
          // If confidence is HIGH: flag for human review before publish
          // If confidence is LOW or INCONCLUSIVE: auto-publish null finding
          if (generated.confidence_level === 'HIGH') {
            await flagForReview(reportId)
          } else {
            await publishReport(reportId)
          }
        }
      })
    }
  }
)
```

---

## Step 5 — Initial Reports

Manually trigger report generation for the first two reports after the job infrastructure is working:

### Report 1: Descriptor Convergence

Trigger: `inngest send meridian/findings.generate --data '{"reportType": "descriptor_convergence"}'`

Expected output: A published report with specific descriptor frequency findings. If the data supports it, confidence should be MEDIUM or HIGH. If the corpus doesn't yield meaningful patterns, publish the null finding honestly.

### Report 2: Corroboration Density

Trigger same way with `reportType: "corroboration_density"`.

Expected output: A ranked analysis of the most evidentially robust cases in the corpus with explanation of why they scored highest.

Both reports must be **published** (not in draft) when Phase 4 is considered complete.

---

## Step 6 — Admin: Findings Publish Controls

File: `/app/admin/findings/page.tsx`

Protected by admin authentication (Supabase Auth, admin role check).

### Layout

```
[Admin nav]

Findings Review Queue

[3 pending reports]

┌──────────────────────────────────────────────┐
│ PENDING REVIEW  · Generated 2 hours ago      │
│                                              │
│ Descriptor Convergence · HIGH confidence     │
│                                              │
│ Six Physical Descriptors Appear...           │
│                                              │
│ [Preview]  [Publish]  [Reject]               │
└──────────────────────────────────────────────┘
```

**Publish action:** Sets `status = 'published'`, `published_at = now()`. Logs to audit log.

**Reject action:** Requires reason text input. Sets `status = 'archived'`. Logs reason to audit log.

**Preview:** Opens the report in the public detail page view in a new tab (using the `/findings/[id]` route even when status = 'draft' — gate on admin session check).

---

## Definition of Done

Phase 4 is complete when ALL of the following are true:

- [ ] `/findings` lists at least 2 published reports
- [ ] `/findings/[id]` renders both reports in full editorial layout
- [ ] Confidence badges render correctly in all 4 states
- [ ] Methodology section is collapsible and present on both reports
- [ ] Inline case citations are clickable and open the slide-over panel
- [ ] Slide-over panel shows full case detail without navigating away
- [ ] Cited cases grid renders below each report
- [ ] Null finding state renders correctly (test by manually setting is_null_finding = true on a report)
- [ ] Report generation job is registered in Inngest and can be manually triggered
- [ ] Admin publish/reject controls work and log to audit_log
- [ ] Both initial reports are in `published` status

## What NOT to Build in This Phase

- No query interface
- No contribution form
- No public user authentication

---

## Handoff Notes for Next Phase

The Phase 5 agent needs:
- The SlideOver component (may be reused for query result case previews)
- The ConfidenceBadge component (reused in query response display)
- The CaseCitation chip component
- Confirmation of which embedding model was used in Phase 2 (query must use same model)

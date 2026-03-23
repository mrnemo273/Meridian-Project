# Meridian — Phase 6 Build Spec: Contribution Platform

## Agent Instructions

You are building the public contribution system for The Meridian Project — the mechanism that transforms Meridian from a static archive into a living evidence organism. Anyone can submit an account, evidence, or corroboration. Every submission is screened by AI and reviewed before entering the corpus.

The tone of this entire experience is critical. Contributors are not "sharing their alien encounter." They are contributing to a research record. Treat them as serious informants, not entertainers. The form must feel like filing an official incident report, not posting to a social platform.

Read this entire document before writing any code.

---

## Prerequisites (confirm before starting)

- [ ] Phase 1 complete — `contributions` table exists in database
- [ ] Phase 2 complete — corpus pipeline exists (for integration job)
- [ ] Phase 3 complete — CaseCard component exists (for integrated case display)
- [ ] Phase 4 complete — admin authentication pattern exists
- [ ] Inngest is connected
- [ ] `ANTHROPIC_API_KEY` is working

---

## What You Are Building

1. `/contribute` — multi-step public submission form
2. `/api/contribute` — POST endpoint for submission intake
3. AI screening pipeline (Inngest job)
4. Admin: contribution review queue
5. Corpus integration job for approved contributions
6. Researcher annotation system (on case detail pages)
7. Submission confirmation and tracking page

---

## Design Direction

The contribution form must:
- Feel serious and research-oriented — not casual or exciting
- Never use words like "encounter," "experience," "amazing," "incredible"
- Use clinical, precise language: "sighting," "observation," "reported event," "account"
- Explain *why* each field matters for research credibility — contributors who understand the purpose fill in better data
- Support anonymous submission without making it feel suspicious

---

## Step 1 — Contribution Form `/contribute`

File: `/app/contribute/page.tsx`

### Page Header

```tsx
<header className="max-w-2xl">
  <p className="font-mono text-xs uppercase tracking-widest text-text-2">
    The Meridian Project
  </p>
  <h1 className="font-display text-4xl text-text-1 mt-2">
    Submit an Account
  </h1>
  <p className="font-body text-lg text-text-2 mt-4">
    Meridian accepts submissions from witnesses, researchers, and anyone with
    documented evidence relevant to anomalous aerial phenomena. All submissions
    are reviewed before entering the research corpus.
  </p>
</header>
```

### Multi-Step Form Component

File: `/components/contribute/ContributionForm.tsx`

5 steps with a progress indicator. Each step is a separate view — no long scroll.

Progress indicator (Oswald, top of form):
```
STEP 1 OF 5  ─────────────────────────  TYPE
```

#### Step 1: Submission Type

```
What are you submitting?

○  Personal account          — A first-hand observation you witnessed directly
○  Physical evidence         — Photos, video, or material samples
○  Documentary evidence      — Official documents, communications, or records  
○  Corroboration             — Confirmation of an existing case in our corpus
```

Radio buttons, styled as card-style options. Selecting one enables the Next button.

#### Step 2: Core Event Details

Label copy uses plain research language. Each field has a brief reason note in small Oswald.

```
DATE OF OBSERVATION
[Date input — required]
Research note: Precise dates allow temporal correlation across independent accounts.

TIME (approximate)
[Time input — optional]
Research note: Time of day correlates with atmospheric conditions and witness state.

LOCATION
[Text input — city, region, country — required]
[Lat/lng autofill if browser geolocation permitted — optional, clearly labeled]
Research note: Geographic specificity enables cross-reference with other regional accounts.

DURATION
[Number input] [unit dropdown: seconds / minutes / hours]
Research note: Duration affects the reliability and detail level of the account.

NUMBER OF WITNESSES (including yourself)
[Number input, min 1]
Research note: Independent corroboration is the primary credibility factor.
```

#### Step 3: Account Narrative

Structured prompts — not a free-text box. Each prompt targets specific research-relevant information.

```
DESCRIBE WHAT YOU OBSERVED

What did the object look like?
[Textarea — placeholder: "Describe shape, size, color, any distinguishing features"]

How did it move or behave?
[Textarea — placeholder: "Describe movement, speed, direction, any changes in behavior"]

What sounds, if any, were associated with the observation?
[Textarea — placeholder: "Describe sounds or note if the observation was silent"]

Did you or others experience any unusual physical effects?
[Textarea — placeholder: "Note any electromagnetic interference, heat, physiological effects, or leave blank"]

Describe any other relevant details
[Textarea — optional]
```

#### Step 4: Corroborating Evidence

```
WHAT EVIDENCE EXISTS FOR THIS OBSERVATION?

□  I have photographs
□  I have video footage
□  Radar or instrument data exists (to your knowledge)
□  There was a physical trace (marks, residue, physical effects on environment)
□  There was an official investigation or report
□  Other witnesses filed separate accounts

MEDIA UPLOAD (optional)
[File upload — accepts: jpg, png, mp4, mov, pdf — max 50MB per file, max 3 files]
Upload note: Media is stored privately and reviewed before any public association with a case.

SUPPORTING DOCUMENTATION
[File upload — accepts: pdf, doc, txt]
```

Media upload note must be visible — contributors should know their media is not immediately public.

#### Step 5: Contributor Information

```
ABOUT YOU (optional — you may submit anonymously)

All fields on this page are optional. Credentialed submissions are weighted more 
heavily in our research analysis, but anonymous accounts are accepted and valued.

YOUR NAME
[Text input — optional]

EMAIL ADDRESS (for follow-up if needed)
[Email input — optional]
Privacy note: Email is never published or shared. Used only for research follow-up.

YOUR BACKGROUND (select all that apply)
□  Military or defense
□  Aviation (pilot, crew, air traffic control)
□  Law enforcement
□  Government or intelligence
□  Scientific or academic
□  Other professional

WOULD YOU BE WILLING TO BE CONTACTED FOR FOLLOW-UP?
○  Yes  ○  No  ○  Anonymous only (no identifying information shared)

□  I certify that this account is accurate to the best of my knowledge
   [Required checkbox to submit]

□  I understand this account may be published as part of the research corpus
   [Required checkbox to submit]
```

Submit button: `"Submit Account"` — not "Share" or "Post"

### Form State Management

Use React state (no form library required unless complex validation needed). On each step: validate required fields before enabling Next.

---

## Step 2 — Submission API

File: `/app/api/contribute/route.ts`

### POST /api/contribute

```typescript
// 1. Validate required fields (type, date, location, at least one narrative field, both checkboxes)
// 2. Handle media uploads to Supabase Storage (if present)
//    - Virus scan is out of scope for Phase 6 — flag uploads for manual review
//    - Store in private bucket: contributions/{uuid}/
// 3. Sanitize PII — store contributor name/email in separate location from structured_data
//    - structured_data must not contain name or email directly
//    - Store PII in a separate `contribution_pii` table (not queryable by public API)
// 4. Insert to contributions table
// 5. Trigger AI screening job async
// 6. Return tracking ID

// Response:
{
  tracking_id: string    // e.g. "MER-A3B7F2C1"
  message: "Your account has been received and is under review."
}
```

### PII Table

```sql
create table contribution_pii (
  id uuid primary key default gen_random_uuid(),
  contribution_id uuid references contributions(id) unique,
  name text,
  email text,
  contact_preference text,
  created_at timestamptz default now()
);
```

RLS policy: no public read access. Service role only.

### Rate Limiting

10 submissions per IP per hour. Return 429 on limit exceeded.

---

## Step 3 — AI Screening Pipeline

File: `/lib/contribute/screening.ts`

Inngest job triggered after each submission.

```typescript
export const screenContribution = inngest.createFunction(
  { id: 'screen-contribution' },
  { event: 'meridian/contribution.submitted' },
  async ({ event, step }) => {
    const { contributionId } = event.data

    const contribution = await step.run('fetch', () =>
      getContribution(contributionId)
    )

    const screening = await step.run('screen', () =>
      runScreening(contribution)
    )

    await step.run('update', () =>
      updateContributionScreening(contributionId, screening)
    )
  }
)
```

### Screening Prompt

```typescript
const SCREENING_PROMPT = `
You are a research data quality analyst for The Meridian Project. Evaluate the following 
submission for research quality and authenticity.

Score each dimension from 0-10:

1. SPECIFICITY: Does the account contain specific, verifiable details (precise date, 
   location, duration, concrete descriptors) or is it vague and generic?

2. INTERNAL_CONSISTENCY: Does the account contradict itself? Are the timeline, 
   descriptions, and physical claims internally consistent?

3. ORIGINALITY: Does this account appear to be an original first-hand account, or 
   does it read like a retelling of a well-known case (Roswell, Phoenix Lights, etc.) 
   that may have been influenced by media coverage?

4. RESEARCH_VALUE: Does this account contain information that could contribute to 
   pattern analysis? (Novel descriptors, unusual corroboration, unique geographic/
   temporal data)

Also assess:
- CONTAMINATION_RISK: boolean — does this appear to be based on recently viral media?
- CREDIBILITY_INDICATORS: array of positive factors present (witness credentials, 
  corroboration claims, physical detail level, etc.)
- RECOMMENDED_TIER: 1-4 based on overall assessment
- SUMMARY: 1-2 sentences for human reviewer

Submission:
{{SUBMISSION_DATA}}

Return ONLY valid JSON:
{
  "specificity": 0-10,
  "internal_consistency": 0-10,
  "originality": 0-10,
  "research_value": 0-10,
  "contamination_risk": boolean,
  "credibility_indicators": string[],
  "recommended_tier": 1-4,
  "composite_score": 0-100,
  "summary": "..."
}
`
```

Composite score calculation:
```typescript
const composite = Math.round(
  (specificity * 0.3 +
   internal_consistency * 0.3 +
   originality * 0.2 +
   research_value * 0.2) * 10
)
```

Store screening result in `contributions.ai_screening_score` and `contributions.contamination_flags`.

---

## Step 4 — Submission Confirmation Page

File: `/app/contribute/confirmation/page.tsx`

Shown after successful submission. Receives tracking ID via URL param or session.

```
Your account has been received.

TRACKING ID
MER-A3B7F2C1

Your submission is under review. The Meridian Project reviews all submissions 
before they enter the research corpus. You do not need to take any further action.

If you provided contact information and we have follow-up questions, 
we will reach out directly.

[Return to Evidence Index]  [Submit another account]
```

Clean, understated. No excitement. No "Thank you for your amazing submission!"

---

## Step 5 — Admin: Contribution Review Queue

File: `/app/admin/contributions/page.tsx`

Protected by admin authentication (same pattern as Phase 4).

### Layout

```
[Admin nav]

Contribution Review Queue
[42 pending]  [12 reviewing]  [3 more info requested]

[Sort: AI Score ↓]  [Filter: Tier 1-2 only]

┌──────────────────────────────────────────────────────┐
│ SCORE: 78  ·  TIER 1 recommended  ·  2 hours ago    │
│                                                      │
│ Personal account — Chicago, Illinois — Nov 7, 2006  │
│ Aviation credentials · 4 witnesses                  │
│                                                      │
│ AI Summary: Detailed first-hand account from airline │
│ captain describing disc-shaped object during landing │
│ approach. High specificity and internal consistency. │
│                                                      │
│ [Review]  [Approve Tier 1]  [Approve Tier 2]  [Reject] │
└──────────────────────────────────────────────────────┘
```

### Review Modal

Clicking "Review" opens a full-screen modal:

**Left panel:** Full structured submission data — all form fields displayed cleanly

**Right panel:** AI screening report — all scores, flags, summary, recommended tier

**Actions:**
- `Approve — Tier [1/2/3]` — dropdown to select tier, then confirm
- `Request more information` — text field for what's needed
- `Reject` — required reason text

All actions log to `admin_audit_log`.

### Approve Flow

On approval:
1. Set `contributions.status = 'integration_queued'`
2. Set `contributions.credibility_tier = selectedTier`
3. Trigger corpus integration job
4. Log to audit

---

## Step 6 — Corpus Integration Job

File: `/lib/contribute/integration.ts`

```typescript
export const integrateContribution = inngest.createFunction(
  { id: 'integrate-contribution' },
  { event: 'meridian/contribution.approved' },
  async ({ event, step }) => {
    const { contributionId, tier } = event.data

    // 1. Fetch contribution from DB
    const contribution = await step.run('fetch', () =>
      getContribution(contributionId)
    )

    // 2. Map structured_data to CaseInput format
    const caseInput = await step.run('map', () =>
      mapContributionToCase(contribution)
    )

    // 3. Run entity extraction (reuse Phase 2 pipeline)
    const entities = await step.run('extract', () =>
      extractEntities(caseInput.raw_text)
    )

    // 4. Run normalization
    const normalized = await step.run('normalize', () =>
      normalizeCaseInput({ ...caseInput, ...entities })
    )

    // 5. Generate embedding
    const embedding = await step.run('embed', () =>
      generateEmbedding(normalized.raw_text + ' ' + normalized.summary)
    )

    // 6. Score (use approved tier as floor — don't score below approved tier)
    const scored = await step.run('score', () =>
      scoreCase({ ...normalized, embedding })
    )

    // 7. Insert to cases table with source_type = 'contribution'
    const caseId = await step.run('insert', () =>
      insertCase({
        ...normalized,
        ...scored,
        embedding,
        credibility_tier: Math.min(scored.tier, tier), // approved tier is floor
      })
    )

    // 8. Link contribution to case
    await step.run('link', () =>
      updateContribution(contributionId, {
        status: 'integrated',
        linked_case_id: caseId
      })
    )

    // 9. Run cross-reference linking
    await step.sendEvent('cross-reference', {
      name: 'meridian/case.cross-reference',
      data: { caseId }
    })
  }
)
```

---

## Step 7 — Researcher Annotations

Add annotation capability to case detail pages for admin-approved researchers.

### Annotation Display

On `/cases/[id]`, below the main content:

```tsx
{annotations.length > 0 && (
  <section className="mt-12 border-t border-border pt-8">
    <h2 className="font-mono text-xs uppercase tracking-widest text-text-2 mb-6">
      Researcher Annotations
    </h2>
    {annotations.map(a => (
      <AnnotationCard key={a.id} annotation={a} />
    ))}
  </section>
)}
```

### AnnotationCard Component

```
CORROBORATION  ·  March 2025

This case shares three specific behavioral descriptors — silent approach, 
instantaneous acceleration, and absence of heat signature — with case 
MER-00142 from the same regional cluster in 2004.

[Link to related case]
```

Annotation type badge: CORROBORATION / CHALLENGE / CONTEXT / LINK in Oswald.

### Add Annotation (researcher-only)

Only shown when logged-in user has researcher role. Below annotations list:

```
ADD ANNOTATION

Type: [dropdown: Corroboration / Challenge / Context / Related Case]

[Textarea — required, min 50 chars]
Annotation note: Annotations are publicly visible and permanently attributed to your 
researcher account. Unsupported or speculative annotations will be removed.

[Linked Case — optional: case search input]

[Submit annotation]
```

---

## Definition of Done

Phase 6 is complete when ALL of the following are true:

- [ ] A test submission can be completed through all 5 form steps
- [ ] Submission confirmation page shows the tracking ID
- [ ] AI screening job fires after submission and populates `ai_screening_score`
- [ ] Admin review queue shows pending submissions sorted by screening score
- [ ] Approve action triggers integration job
- [ ] Integration job results in a new case appearing in `/cases`
- [ ] Reject action requires reason and logs to audit
- [ ] Media uploads go to Supabase Storage private bucket
- [ ] PII (name, email) is stored in `contribution_pii` table, NOT in `structured_data`
- [ ] Form cannot be submitted without the two required checkboxes
- [ ] Rate limiting prevents more than 10 submissions/hour from same IP
- [ ] Researcher annotations appear on case detail pages (test with seed annotation)

## What NOT to Build in This Phase

- No public researcher registration — researcher accounts are admin-granted only
- No submission status tracking page for contributors (post-launch feature)
- No community voting or rating of submissions

---

## Handoff Notes for Final Phase

The Phase 7 agent needs:
- Stats from `/api/stats` endpoint (used on homepage)
- All navigation links are in place — homepage just needs content
- The about page needs content written — it is not a technical challenge but a copy challenge

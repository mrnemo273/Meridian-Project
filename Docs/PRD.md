# The Meridian Project — Product Requirements Document (v2)

## Product Overview

Meridian is a public-facing platform that curates, analyzes, and presents the most credible verified-unidentified cases of anomalous aerial phenomena. It combines a case-first editorial experience with AI-powered pattern analysis, making the strongest evidence accessible to anyone — from someone who just watched a congressional hearing to an investigative journalist building a story.

The core architectural unit is the **case**. Every piece of data in Meridian — source documents, AI analysis, cross-references, pattern findings — lives on or connects through a case page.

---

## User Personas

**The Curious Public** — Heard about UAP hearings or the Nimitz video, wants to understand what the credible evidence actually shows. Needs: an accessible entry point, plain-language storytelling, no jargon barrier, no fringe content. The homepage and case narratives serve this person.

**The Serious Researcher** — Academic, journalist, or independent investigator. Needs: source traceability, full methodology transparency, AI analysis details, exportable data, and the ability to query the corpus directly. The case detail pages and query interface serve this person.

**The Skeptic** — Comes to challenge the findings. Needs: visible methodology, null results published alongside positive findings, clear labeling of AI-extracted vs. original data, no advocacy tone. The transparency built into every page serves this person.

---

## Site Architecture

### The Homepage — "What the Evidence Shows"

The homepage is the entry point to the Investigation Workspace. It combines the connections layer with a curated case list and investigation dashboard.

**Layout:**
- **Left Sidebar (200px):** Case list (cases 001–006, each with status badge: Active/In Progress/Resolved/On Hold), collapsible
- **Main Content Area:**
  - Dashboard stats: Total cases, Active investigations, Pattern findings
  - Active Investigation Card: Quick access to current case with credibility score display
  - Queue Table: Upcoming cases to review, sorted by priority
  - Methodology Section: Overview of analytical approach and data sources
  - Investigator Cards: Nemo (human investigator, orange accent) and Claude (AI investigator, purple accent) with brief roles

**Content elements:**
- Headline patterns surfaced by AI analysis (descriptor convergence, geographic clusters, temporal spikes)
- Plain-language summary: "Across 800+ verified-unidentified cases, here's what keeps appearing"
- Visual data (convergence bars, cluster maps, timeline spikes) — not as research tools, but as storytelling elements
- Three guided entry paths: explore the strongest cases, read what the data shows, ask a question
- Featured case highlight — one deeply compelling case to draw people in
- Trust markers: source transparency, methodology published, null findings included

**What it is NOT:**
- A stats dashboard
- A database landing page
- A static case list

---

## Feature Areas

### 1. The Investigation Workspace

**What it is:** The heart of the platform. Each case is a self-contained, deeply layered story.

**What qualifies as a case:**
- Officially classified as "unidentified" by a government investigation (Blue Book, AARO), OR
- Corroborated by multiple independent credible sources (radar + visual, multiple credentialed witnesses, official acknowledgment), OR
- Congressional testimony under oath from credentialed witnesses

Cases that have been explained (weather balloons, aircraft, celestial objects) are excluded. Cases with insufficient information to evaluate are excluded. The bar is high by design.

**Estimated Phase 1 corpus: 800–1,200 cases**
- ~701 Blue Book "Unidentified" cases
- ~21 AARO "truly anomalous" cases
- ~50–100 landmark cases with deep evidence trails (Nimitz, Rendlesham, Phoenix, JAL 1628, etc.)
- Additional cases that pass the verification bar from NUFORC (AI-screened for credibility) and NICAP

### Investigation Workspace

**What it is:** A three-column investigation interface where human investigators (Nemo, orange #B86A2E) and AI (Claude, purple #7B5D9A) collaboratively analyze cases. The workspace is designed for deep case analysis and structured investigation.

**Layout:**

**Left Sidebar (200px, fixed):**
- Table of Contents (TOC) for quick navigation within case file
- Investigation Tools Links (jump to ACH Matrix, Evidence Links, etc.)
- Highlight Counter: shows count of user annotations (Nemo/Claude highlights)
- Investigator Roster: Nemo and Claude avatars showing who is actively analyzing

**Center Column (flex:1, max-width 860px, scrollable):**
The case file itself, structured in layers:

**Layer 1 — The Story (casual visitor)**
- Hero section: case title, one-line summary, date/location
- Narrative: what happened, told as a story
- Why this case matters (what makes it notable)

**Layer 2 — The Evidence (curious visitor)**
- Executive Summary: radar? video? photos? physical trace? official investigation?
- Credibility Score Card: full factor breakdown (transparent, not a black box)
- Timeline: chronological sequence of events
- Evidence Cards: individual pieces of evidence (photo, document, testimony) with source attribution
- Witness Cards: statements from credentialed witnesses, with bio and source
- AI Analysis: Claude-authored analysis, clearly labeled as AI-generated, with methodology notes

**Layer 3 — Investigation & Connections (researcher)**
- Open Questions section: unresolved aspects flagged during analysis
- ACH (Analysis of Competing Hypotheses) voting interface (see Right Panel)
- Evidence linking with node map (see Right Panel)
- OSINT verification status (see Right Panel)
- Solvability scoring (see Right Panel)
- Which pattern findings this case appears in (linked to Findings pages)
- Full source trail: every claim traced to a specific document or testimony

**Right Column (460px, fixed, persistent):**
Investigation Tools Panel with tabbed interface. All tabs operate on the selected text or evidence:

1. **ACH Matrix** — Analysis of Competing Hypotheses
   - Rows: hypothesis candidates
   - Columns: evidence
   - Cells: consistent/inconsistent/neutral with voting (Nemo and Claude can vote differently)
   - Scoring: show which hypothesis is most consistent with evidence

2. **Resolution Checklist** — Structured investigation tasks
   - Checkboxes for verification steps
   - Status: Open, In Progress, Complete
   - Assigned to: Nemo or Claude or both
   - Notes field for context

3. **OSINT Log** — Open-source intelligence tracking
   - Record of external sources checked
   - Date, source, finding, credibility assessment
   - Cross-reference to evidence in case file

4. **Evidence Links** — Node-map style connection interface
   - Create connections between evidence items
   - Link types: supports, contradicts, related-to, corroborates
   - Visual node map shows evidence relationships

5. **Search & Import** — External research tools
   - Query builder for related cases
   - Import evidence from external sources
   - Results preview before adding to case

6. **Solvability Score** — Case resolution probability
   - Weighted factors: evidence completeness, witness credibility, verification coverage
   - Dynamic calculation based on ACH voting and evidence linking
   - Shows confidence interval

**Right-Click Annotation System** (Core human interaction model)

Users select text anywhere in the case file (story, evidence, testimony), right-click for context menu:

**Menu Options:**
- Highlight as Nemo (orange accent, #B86A2E, Caveat font label)
- Highlight as Claude (purple accent, #7B5D9A, JetBrains Mono label)
- Add Note: attach private qualitative note to highlight
- Attach URL: link external resource (OSINT source, reference, supporting document)
- Link to Evidence: create connection to another evidence card in case
- Search for this: query corpus for related mentions

**Data Model (Annotation Object):**
```json
{
  "id": "ann_uuid",
  "user": "nemo" | "claude",
  "highlightedText": "string",
  "location": { "elementId": "string", "offset": [start, end] },
  "color": "#B86A2E" | "#7B5D9A",
  "fontFamily": "Caveat" | "JetBrains Mono",
  "notes": [
    { "id": "note_uuid", "text": "string", "timestamp": "ISO8601", "user": "nemo" | "claude" }
  ],
  "attachments": [
    {
      "id": "att_uuid",
      "type": "url" | "evidence" | "case",
      "title": "string",
      "url": "string",
      "source": "external" | "internal"
    }
  ],
  "createdAt": "ISO8601",
  "updatedAt": "ISO8601"
}
```

**Keyboard Shortcuts (when annotation menu is open):**
- `N` — Add Note
- `U` — Attach URL
- `Cmd+Enter` (or `Ctrl+Enter`) — Submit annotation
- `Escape` — Close menu without saving

**Dual Investigators Model:**
- **Nemo (Human):** Orange accents (#B86A2E), Caveat font for labels, represents human judgment and contextual reasoning
- **Claude (AI):** Purple accents (#7B5D9A), JetBrains Mono font for labels, represents AI analysis and pattern finding
- Both can annotate the same case simultaneously; their perspectives are preserved and can diverge
- ACH voting allows them to vote differently on the same hypothesis
- Solvability scoring captures agreement/disagreement between investigators

---

### 2. The Right-Click Annotation System

**Core Concept:** Text selection + right-click is the primary human interaction model in the Investigation Workspace. Users build investigations through annotations, not through forms or buttons.

**Why this matters:** Investigation is iterative and non-linear. A researcher might flag a contradiction, add a note, link to an external source, and search for related cases — all from a single highlighted phrase. The annotation system keeps the investigation grounded in the evidence while supporting rapid context-switching.

**Interaction Flow:**
1. User selects text in case file
2. Right-click opens custom context menu (not browser default)
3. Choose action (highlight, note, URL, evidence link, search)
4. For highlight: choose investigator (Nemo/Claude) — determines color and font
5. Optional: add note or attachment before submitting
6. Annotation appears inline in case file; metadata stored in investigation session

**Visual Treatment:**
- Highlights are semi-transparent (to allow text readability) with colored left border
- Nemo highlights: orange (#B86A2E) with Caveat font for label (hand-written feel)
- Claude highlights: purple (#7B5D9A) with JetBrains Mono for label (monospace/technical feel)
- Hover state: show attached notes, linked evidence, attached URLs as tooltips
- Count badge on sidebar updates in real-time as annotations are added

**Use Cases:**
- Nemo highlights a witness statement as "crucial credibility issue" and adds note about conflicting prior accounts
- Claude highlights craft behavior description and searches corpus for similar descriptions
- User highlights a date discrepancy, links it to the timeline evidence card, and attaches a news article
- Multiple investigators mark the same phrase differently (Nemo skeptical, Claude confident) — divergence is captured and visible

---

### 3. The Connections Layer (Homepage + Findings)

**What it is:** AI-generated pattern analysis that surfaces what the cases have in common. This is what makes Meridian more than a case database — it's the analytical layer.

**Report types:**
- **Descriptor convergence** — Physical descriptors (silent propulsion, instantaneous acceleration, featureless exterior) that appear across independent cases at rates exceeding random chance
- **Geographic clustering** — Regions with unusual concentrations of verified-unidentified cases
- **Temporal patterns** — Frequency spikes and their correlation (or lack of correlation) with external events
- **Witness experience patterns** — Recurring physiological or environmental effects reported across unconnected cases (e.g., sudden silence, equipment malfunction, heat sensation)

**Presentation:**
- The homepage presents patterns as visual storytelling (convergence bars, map clusters, timeline)
- Dedicated findings pages present full methodology, confidence levels, cited cases, and version history
- Null findings displayed with identical design weight — "Analysis does not support this conclusion at this time" is a first-class finding

**Methodology transparency:**
- Every finding includes: what data was analyzed, what method was used, what the confidence level is, and what the limitations are
- All AI analysis labeled as such — never presented as human-authored research

---

### 4. The Query Interface

**What it is:** A natural language tool that lets anyone ask questions about the evidence record.

**Why it matters:** This is where the full corpus (including the ~147K NUFORC narratives that don't qualify as individual cases) becomes useful. The AI searches across ALL available text — not just the curated cases — to answer questions.

**Examples:**
- "What cases describe triangular craft with silent propulsion?"
- "Which witness accounts mention sudden environmental silence?"
- "Are there cases where the same object was tracked by multiple radar systems?"
- "What do the most credible cases have in common?"

**Design principles:**
- Every answer cites specific cases
- Confidence level on every response
- "Insufficient data to answer this question" is a valid, first-class response
- Responses grounded strictly in corpus — no hallucination
- NOT a chat interface — it's a research instrument. No persona, no bubbles.

---

### 5. The Corpus Engine (Backend)

**What it is:** The data pipeline that ingests, processes, and structures the evidence.

**Phase 1 data sources:**
- Project Blue Book index + deep case files for "Unidentified" cases (~12,600 indexed, ~701 deeply processed)
- AARO published reports and case references (~1,652 referenced, ~21 deeply processed)
- NUFORC reports (~147,000 — used as searchable corpus for Query Interface, high-credibility subset elevated to cases)
- Congressional testimony transcripts (~5 major hearings)
- Black Vault / CIA / FBI FOIA documents (~500–1,000 key documents as supporting evidence)
- NICAP historical chronology (~575 cases)

**NOT included in Phase 1 (noted for future):**
- MUFON (requires formal partnership agreement — data access is restricted and redistribution is prohibited)
- Enigma Labs (API not yet public)
- Academic literature (Hynek, Vallee — requires rights assessment)

**Processing pipeline:**
1. Ingest raw data (structured CSV, scanned PDFs, HTML pages, report PDFs)
2. OCR where needed (Blue Book microfilm, FOIA documents)
3. AI entity extraction: craft descriptions, flight behavior, witness effects, environmental conditions, duration — all from free text
4. Normalize: standardize dates, locations (geocode to lat/lng), descriptor taxonomy
5. Credibility screening: does this case meet the "verified unidentified" bar?
6. Cross-reference: similarity search against existing corpus, flag connections
7. Store: PostgreSQL + vector DB for semantic search

**Critical note on AI extraction:**
The richest data in the corpus (NUFORC narratives, Blue Book case files) is locked in free text. Meridian's AI extraction pipeline is what turns thin records into structured, searchable, connectable data. Every AI-extracted field must be labeled as such in the UI — this transparency is non-negotiable.

---

### 6. The Contribution Platform (Phase 2)

**What it is:** A structured public submission system for new cases and corroborating evidence.

**Deferred to Phase 2 because:** The Phase 1 corpus is built from existing verified sources. Public contributions add complexity (screening, moderation, legal) that should not block launch. The contribution platform should be designed after we understand how the curated corpus performs.

**When built, it will include:**
- Structured submission form (not free text)
- AI pre-screening for consistency and contamination
- Clear credibility tiering visible to submitter
- Anonymous submission supported
- Researcher annotation capabilities on existing cases

---

## Non-Features (Explicit Exclusions)

- No government cover-up or conspiracy analysis
- No entertainment content, rankings by "weirdness," or sensationalist framing
- No explained or debunked cases in the curated index (these may appear in query results from the broader NUFORC corpus, clearly labeled)
- No anonymous admin editing of credibility scores without audit trail
- No advertising or sponsored content — ever
- No social features designed for engagement metrics (likes, shares, streaks)
- No chat-style AI persona — the query interface is a research tool, not an assistant

---

## Success Metrics

- Number of curated cases with complete evidence trails (target: 800+ at launch)
- AI pattern findings published with High or Medium confidence
- Homepage engagement: do casual visitors click into cases and findings?
- Query interface usage: questions asked, cases discovered through queries
- External citations: researchers and journalists referencing Meridian cases and findings
- Qualitative: would a congressional staffer feel comfortable linking to this in a briefing document?

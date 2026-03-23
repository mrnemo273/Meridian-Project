# Case 001: USS Nimitz — Builder Agent Prompts

**Goal:** Build a working prototype of the Meridian Project infinite canvas case board for Case 001 (USS Nimitz / Tic Tac, November 2004). This is a prototype — not a production release. We want real data, real sources, and a functional interactive board.

**Primary design reference:** `wireframes/concept-investigation/03-case-board-canvas.html`
This wireframe is the source of truth for all visual decisions — card styles, color palette, typography, visual illustrations (FLIR, radar, ocean, jet, ship, document scan), layout patterns, and interaction model. Do not reinvent these; extend what's there to be data-driven.

**Secondary design references:**
- `wireframes/concept-investigation/01-homepage.html` — homepage layout and investigation concept
- `wireframes/concept-investigation/02-case-board.html` — original scrolling case board (content reference, not the target UX)
- `wireframes/concept-investigation/00-sitemap.html` — sitemap and concept overview

**Typography (from wireframe, not DESIGN.md):**
- JetBrains Mono — system/monospace/body
- Instrument Serif — display headlines
- Caveat — handwritten human annotations
- Oswald — labels and section headers

**Color system (from wireframe):**
- Gold `#9A7A2E` — evidence
- Orange `#B86A2E` — witnesses/human voice
- Purple `#7B5D9A` — AI analysis/AI voice
- Red `#B04A4A` — anomalies/questions
- Green `#5A8A4A` — verified/confirmed
- Board background `#EDECE8`, cards `#FFFFFF`, text `#1A1816`

> **Note:** DESIGN.md has been updated to match this design system. The wireframe/prototype fonts and colors are now the canonical design system.

---

## Phase 1 — Research & Data Collection ✅ COMPLETE

Phase 1 research has been compiled. The data is ready.

**Builder notes from Phase 1:**
- Witness quotes are paraphrased in several places. Exact quotes need a sourcing pass in Phase 3 (see Prompt 3.1).
- `photo_url` is null for all witnesses. The board uses CSS/SVG visual illustrations (from the wireframe) as fallbacks.
- Jim Slaight (Fravor's WSO, back-seat of lead F/A-18) is a known participant but has barely spoken publicly. Add as a stub witness with "no public statements" note.
- SCU acceleration estimates range from 75g–5,000g (peer-reviewed, published in MDPI Entropy journal). The wireframe used ~12,600g from a different calculation method. Include both estimates with their methodologies — show the range, don't pick one number.
- Research confidence levels:
  - Core encounter details (date, location, who, what): **High**
  - Exact timestamps on Nov 14: **Medium** — approximate, based on witness recollection
  - Data confiscation claims (Hughes, Voorhis): **Medium** — two independent accounts but unverified officially
  - SCU acceleration estimates: **High** — peer-reviewed
  - Cross-case pattern match strength ratings: **Medium** — editorial judgment

---

## Phase 2 — Schema, Data & Prototype Build (Combined)

Build the JSON data file and the interactive canvas app together. Design the schema to fit what the UI needs rather than in the abstract.

### Prompt 2.1: Build the JSON Case File + Interactive Canvas

```
Build a working prototype of the Meridian Project case board for the USS Nimitz encounter.

This has two deliverables that should be built together:
1. `prototype/data/case-001-nimitz.json` — the complete case data file
2. `prototype/case-board.html` — the interactive infinite canvas app (single HTML file, no framework dependencies)

═══════════════════════════════════════════
DESIGN REFERENCE — READ THIS FILE FIRST
═══════════════════════════════════════════

Read and study `wireframes/concept-investigation/03-case-board-canvas.html` before writing any code. This wireframe contains:
- The exact CSS variables, color palette, and typography to use
- Card component styles (`.card`, `.card-inner`, `.card-type`, `.card-title`, `.card-body`, `.card-annotation`)
- Card type variants (`.type-witness`, `.type-evidence`, `.type-ai`, `.type-document`, `.type-anomaly`)
- Visual illustration styles for media cards (`.visual-flir`, `.visual-radar`, `.visual-ocean`, `.visual-jet`, `.visual-ship`, `.visual-doc`) — these are CSS/SVG-based, not images
- Note card styles (`.note`, `.human-note`, `.ai-note`)
- Connector line styles (`.conn-witness`, `.conn-evidence`, `.conn-ai`)
- Toolbar, minimap, legend, and hint bar components
- Canvas pan/zoom/drag interaction code
- Timeline strip component

Do NOT redesign these. Extend the wireframe's existing code to be data-driven (rendering from JSON instead of hardcoded HTML).

═══════════════════════════════════════════
DATA SCHEMA (case-001-nimitz.json)
═══════════════════════════════════════════

Design the JSON schema to support the canvas UI. Structure:

**Case metadata:**
- case_id, title, subtitle, date, location { lat, lng, description }, duration
- credibility_score (0-100), status ("investigating"), tags[], related_case_ids[]

**cards[]** — every item on the board is a card:
Each card has:
- id (string, e.g. "W-001", "E-003", "AI-002", "DOC-001")
- type: "witness" | "evidence" | "sensor" | "media" | "document" | "ai-finding" | "anomaly" | "note"
- title, summary, detail (full text)
- source { citation, url }
- badge { label, style } (e.g. { label: "Primary", style: "witness" })
- visual (optional): "flir" | "radar" | "ocean" | "jet" | "ship" | "document-scan" | null
  — when present, render the corresponding CSS/SVG visual from the wireframe
- annotations[]: { author: "Nemo" | "Claude", text }
- position: { x, y } — canvas coordinates
- connections[]: { target_id, type: "witness" | "evidence" | "ai", label }

IMPORTANT: Connection arrays are one-directional in the JSON. The renderer MUST build a bidirectional index at load time. Use a flat `Map<id, Set<{targetId, type, label}>>` — IDs cross entity types (e.g. "W-001" connects to "AI-002").

**timeline[]:**
- id, date_iso, date_display, title, detail
- event_type: "key" | "normal" | "question" | "ai"
- tags[]
- annotations[]: same as cards
- linked_card_ids[]

**witnesses[]** (detailed profiles, separate from witness cards):
- id, name, rank, unit, role, flight_hours, status
- testimony_summary, key_quotes[] { text, source, date, url }
- credibility_notes
- photo_url (null for now — CSS/SVG fallback)
- Include Jim Slaight as a stub ("no public statements")

**ai_analysis[]:**
- id, analysis_type: "pattern_match" | "descriptor_extraction" | "anomaly_flag" | "cross_reference"
- title, finding, methodology, confidence: "high" | "medium" | "low"
- cross_references[]: { case_name, date, shared_pattern, strength, source }
- supporting_card_ids[]

**open_questions[]:**
- id, question, context, status: "open" | "investigating" | "resolved"
- linked_card_ids[]

**source_documents[]:**
- id, title, author, organization, date, classification
- doc_type, url, key_excerpts[]

Populate with ALL real data from the USS Nimitz case research (Phase 1 output). For acceleration estimates, include BOTH the SCU range (75g–5,000g, MDPI Entropy) and the alternate calculation (~12,600g) with their respective methodologies.

═══════════════════════════════════════════
CANVAS APPLICATION (case-board.html)
═══════════════════════════════════════════

Single HTML file, no framework dependencies. Loads JSON on page init.

**Core canvas:**
1. Infinite canvas — pan (click-drag background), zoom (scroll wheel with cursor-centered zoom, +/- buttons)
2. All cards rendered dynamically from JSON
3. Draggable cards (store updated position in memory)
4. SVG connector lines drawn between linked cards (auto-route from card center-edge to center-edge)
5. Minimap (bottom-right) showing card positions as colored dots + viewport rectangle
6. Toolbar (top bar, matching wireframe design)

**Card rendering:**
- Read card.type to determine accent color and structure
- Read card.visual to render the CSS/SVG illustration (FLIR, radar, etc.) in the media slot
- Read card.annotations[] to render human (Caveat/orange) and AI (mono/purple) annotations inline
- Read card.badge to render the category pill

**Filtering:**
- Toolbar filter tabs: All | Witnesses | Evidence | AI Analysis | Documents | Timeline
- Active filter dims non-matching cards to 40% opacity
- Search box: filter cards by keyword match on title + summary + detail

**Detail panel:**
- Click any card → slide-in panel from right edge (320px wide)
- Shows: full detail text, all annotations, linked cards (clickable), source link, witness profile (if witness card)
- Close with × button or Escape key

**Keyboard shortcuts:**
- `1` = zoom to fit all cards
- `0` = zoom to see everything including timeline
- `Space` hold = pan mode
- `Escape` = close detail panel

**Timeline:**
- Horizontal strip positioned below the main board cluster
- Rendered from timeline[] data
- Each event is a card with connecting arrows
- Gold dots for key events, red for questions, default for normal

**Data loading:**
- Fetch case-001-nimitz.json via fetch() (or inline as a JS variable if same-origin issues)
- Parse → render cards → draw connectors → update minimap
- If card has no stored position, use fallback auto-layout: cluster by type, left-to-right (witnesses → evidence → sensors → AI → documents)

Output:
- `prototype/case-board.html`
- `prototype/data/case-001-nimitz.json`
```

### Prompt 2.2: Build the Case File Page

```
Build a companion page — a scrollable "Case File" narrative for Case 001.

This is the published write-up version of the investigation. Long-form article that presents the same data as the canvas but in a linear reading experience.

**Design reference:** Match `wireframes/concept-investigation/03-case-board-canvas.html` palette and typography exactly. Also reference `wireframes/concept-investigation/02-case-board.html` for the scrolling page layout patterns (timeline, witness cards, analysis panels, etc.).

**Structure:**
1. Hero — case number, title, date, location, credibility score, status badge
2. Executive Summary — 2-3 paragraphs, the headline findings
3. The Encounter — narrative retelling with embedded timeline component
4. The Evidence — sections for each evidence type, inline visuals (FLIR, radar, etc.)
5. The Witnesses — profile cards with quotes and credibility notes
6. AI Analysis — cross-case patterns, descriptors, anomaly flags
7. Open Questions — numbered list of unresolved questions
8. Sources — full bibliography with clickable links
9. Methodology — how Nemo and Claude investigated this case

**Design details:**
- Dual voice throughout: Nemo in Caveat/orange, Claude in mono/purple
- Inline evidence cards matching the canvas card component styles
- Sticky sidebar TOC navigation
- Reading progress bar at top
- "View on Canvas →" button linking to case-board.html

Load data from the same `prototype/data/case-001-nimitz.json`.

Build as: `prototype/case-file.html`
```

### Prompt 2.3: Build the Homepage

```
Build the Meridian Project homepage as the entry point to the prototype.

**Design reference:** `wireframes/concept-investigation/01-homepage.html` — match this layout and design direction. Use the same color palette and typography as the case board wireframe.

**Content:**
- Hero: "We're reopening the 821 most credible cold cases in UAP history"
  - Progress counter: 1 / 821
  - Brief concept description
- Active Investigation: USS Nimitz card linking to both canvas board and case file
  - Show case title, date, credibility score, status, progress steps
  - Mini visual preview (FLIR thumbnail or similar)
- The Queue: upcoming cases (real names, placeholder status):
  - 002: The Belgian Wave (1989-90)
  - 003: Tehran F-4 Intercept (1976)
  - 004: JAL Flight 1628 (1986)
  - 005: USS Roosevelt Encounters (2014-15)
  - 006: Rendlesham Forest (1980)
- The Investigators: Nemo (human) and Claude (AI) profiles
- Methodology: brief overview of the 5-step investigation process
- Terminal-style query prompt at the bottom (aesthetic only for prototype)

Build as: `prototype/index.html`
Link to: `case-board.html` and `case-file.html`
```

---

## Phase 3 — Data Population & Polish

### Prompt 3.1: Source Verification & Quote Pass

```
Go through case-001-nimitz.json and verify all data has proper sourcing.

1. **Witness quotes:** Every quote must have the exact wording, source (interview/podcast/testimony), date, and URL. Key sources:
   - David Fravor: Lex Fridman #122 (2020), JRE #1361 (2019)
   - Alex Dietrich: 60 Minutes (May 2021)
   - Kevin Day: various podcasts (2019-2021)
   - Chad Underwood: New York Magazine (2019)
   - Congressional testimony (2022-2023 hearings)

2. **Document links:** Every reference must link to the actual public document if available:
   - FLIR1 video (DoD release URL)
   - AATIP program documents
   - SCU analysis papers (MDPI Entropy journal)
   - AARO Historical Report Vol. 1
   - FOIA releases

3. **AI findings:** Each must cite methodology, corpus searched, confidence level with reasoning.

4. **Acceleration data:** Ensure both SCU range (75g-5,000g) and alternate calculation (~12,600g) are included with their respective source papers and methodology descriptions.

5. **Flag anything that can't be verified** with a confidence: "unverified" marker.

Update the JSON and note all changes made.
```

### Prompt 3.2: Generate Investigation Notes

```
Generate authentic investigation notes for both investigators. These populate the note cards on the canvas and the dual-voice annotations throughout the case file.

**Claude's notes (10-15):**
Acting as the AI analyst. Tone: precise, analytical, measured confidence. Categories:
- Pattern matches (cross-case comparisons with statistics)
- Anomaly flags (physics analysis with math)
- Credibility assessment (structured witness evaluation)
- Data gap analysis (what's missing, what FOIAs to file)
- Next steps (which cases to investigate next, why)
Each: title, text (2-4 paragraphs), confidence, supporting_card_ids[]

**Nemo's notes (10-15):**
Acting as the human investigator. Tone: curious, skeptical, informal, gut-level. Categories:
- First impressions on the evidence
- Hard questions (why 2-week radar delay? who took the drives? why 13-year silence?)
- Investigation leads (FOIA targets, expert contacts, related cases)
- Personal reactions to specific testimony
Each: title, text (1-2 short paragraphs, conversational), linked_card_ids[]

Output both as JSON arrays. Merge into case-001-nimitz.json under "ai_notes" and "human_notes" keys.
```

---

## Phase 4 — QA & Testing

### Prompt 4.1: Full Prototype QA

```
Review the complete prototype (index.html, case-board.html, case-file.html, case-001-nimitz.json) and fix all issues.

1. **Data accuracy:** Cross-check every date, name, rank, and quote against primary sources. Flag unverifiable claims.

2. **Canvas UX:** Test all interactions:
   - Pan (drag background), zoom (scroll wheel + buttons), drag cards
   - Card detail panel (click to open, Escape/× to close)
   - Filter tabs (All/Witnesses/Evidence/AI/Documents)
   - Search box
   - Minimap navigation (click to jump)
   - Keyboard shortcuts (1, 0, Space, Escape)
   - Connector lines route correctly between card edges

3. **Visual polish:**
   - All CSS/SVG illustrations render (FLIR, radar, ocean, jet, ship, document scan)
   - Font loading works (JetBrains Mono, Instrument Serif, Caveat, Oswald)
   - Test at 1280, 1440, and 1920px widths
   - Cards don't overlap on initial load
   - Timeline strip is accessible by panning/zooming down

4. **Performance:** Canvas should stay smooth with all cards. Optimize if sluggish.

5. **Content:** No placeholder text remaining. Every card has real data. Every connection is justified.

6. **Navigation:** All cross-page links work (homepage → board, homepage → case file, board ↔ case file).

Document issues and fix them.
```

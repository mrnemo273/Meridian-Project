# Meridian — Phase UI: Builder Prompt

Copy the prompt below and send it to the builder along with these files:
- `prototype/index.html`
- `prototype/case-workspace.html`
- `prototype/data/case-data.js`
- `prototype/data/case-001-nimitz.json`
- `prototype/HANDOFF.md`

---

## The Prompt

```
Build the production version of the Meridian investigation app. You are receiving two HTML prototypes that are the pixel-perfect source of truth for design, layout, interaction, and content. Open them in a browser first — everything works locally. Then read HANDOFF.md for the full technical spec.

There are two pages to ship:

1. `index.html` — the case list / homepage
2. `case-workspace.html` — the investigation workspace (this is the main product)

YOUR JOB: Convert these prototypes into a production app with real routing, component architecture, and persistent state. Match them exactly — same fonts, colors, spacing, type scale, layout proportions, interactions. Do not redesign anything. The prototypes ARE the design.

---

## Page 1: Homepage (index.html)

App-shell layout with a left sidebar (200px) and scrollable main content. Contains:

- Case list in the sidebar (001–006 with status badges)
- Dashboard stats (cases investigated, evidence items, etc.)
- Active investigation card for Case 001 (Nimitz) with credibility score, progress bar, section chips
- Queue table showing 5 upcoming cases
- Methodology section
- Investigator cards (Nemo + Claude)

The "Open Case File" button should route to the workspace for that case.

---

## Page 2: Investigation Workspace (case-workspace.html)

Three-column layout. This is the core product.

### Column 1 — Sidebar (200px, fixed)
- MERIDIAN logo
- Case File TOC (Overview, Summary, Encounter, Evidence, Witnesses, AI Analysis, Open Questions) — scroll-spy highlights active section
- Investigation tools links (ACH Matrix, Resolution, OSINT Log, Evidence Chain, Search & Import, Solvability) — clicking these switches the right column tab
- Highlight counter with "Next Highlight" jump button
- Tip: "Right-click selected text to annotate"
- Investigator roster (Nemo = orange, Claude = purple)

### Column 2 — Case Content (flex: 1, max-width: 860px, centered)
- Full scrollable case file: hero, executive summary, timeline, evidence cards, witness cards, AI analysis cards, open questions
- All text is highlightable via right-click context menu
- Evidence/witness/AI cards are clickable — clicking selects the card (gold border) and switches the right column to the relevant tool tab
- Scroll progress bar at top (gold, sticky)
- Pre-seeded with 7 highlight annotations on key passages (see annotation data below)

### Column 3 — Investigation Tools (460px, fixed)
A persistent column (NOT a drawer/panel — it's always visible) with 6 tabs:

**Tab: ACH (Analysis of Competing Hypotheses)**
- Interactive matrix: 8 evidence rows × 5 hypothesis columns
- Each cell is clickable — cycles through C (Consistent) / I (Inconsistent) / N (Neutral) / blank
- When the human vote differs from the AI assessment, show both side by side with an orange dot
- Real-time tally bar showing inconsistency counts per hypothesis
- Verdict block at the bottom
- One highlight annotation (ann-7) on the methodology sentence in the verdict

**Tab: Resolution Checklist**
- 8 prosaic explanations with eliminated/partial/open status icons
- Eliminated = green checkmark, Partial = gold tilde, Open = red question mark

**Tab: OSINT Verification Log**
- 8 verification items with Verified/Partial/Unverified status badges
- Each item: field label, value, source citation

**Tab: Links (Evidence Chain + Linking)**
- 6 evidence chain items with provenance notes and corroboration strength (strong/moderate/weak dots)
- Below that: an evidence link map with 8 clickable nodes (SPY-1 Radar, FLIR1 Video, 60-Mile Relocation, Ocean Disturbance, Fravor, Dietrich, Kevin Day, Data Confiscation)
- Users click two nodes to create a typed link between them (prompt for label like "corroborates", "contradicts")
- Pre-seeded with 5 links
- Links render as a list: node → label → node

**Tab: Search & Import**
- Search input bar
- Pre-populated demo results from 5 source types: Reddit, SCU/Academic, YouTube/Video, FOIA/Black Vault, Web/War Zone
- Each result has 3 action buttons: "+ Import to case", "Attach to highlight", "Open source"
- Imported items list at the bottom

**Tab: Score (Solvability Assessment)**
- Score: 72/100 with progress meter
- 10 weighted factors with +/- scores (green positive, red negative, gold neutral)
- 7 recommended next steps with High/Med/Low priority badges

---

## Critical Feature: Right-Click Annotation System

This is the core human interaction. DO NOT use a toolbar or mode toggle. It's a right-click context menu.

**Flow:**
1. User selects text anywhere in the case content (Column 2)
2. User right-clicks → custom context menu appears (suppresses browser default)
3. Menu options:
   - Highlight as Nemo (orange) — wraps selection in orange highlight span
   - Highlight as Claude (purple) — wraps selection in purple highlight span
   - Add Note — highlights as Nemo + opens inline textarea below the highlight (Caveat font for Nemo notes)
   - Attach URL — highlights as Nemo + opens inline input with title + URL fields
   - Link to Evidence — highlights and switches to Links tab
   - Search for this — puts selection text into Search tab input and triggers search
4. Keyboard shortcuts when menu is open: N = Add Note, U = Attach URL
5. Cmd+Enter submits any open inline input
6. Escape closes everything

**Clicking an existing highlight** opens an annotation popover showing:
- Highlighted text excerpt with colored left border
- All notes (Caveat font for Nemo, JetBrains Mono for Claude)
- All attachments (with type icons: link, video, document)
- Input to add more notes/URLs

**Highlight data model:**
```json
{
  "id": "ann-123",
  "user": "nemo" | "claude",
  "highlightedText": "the selected text",
  "notes": ["string", "string"],
  "attachments": [
    { "type": "url" | "video" | "document", "title": "...", "url": "..." }
  ]
}
```

**Pre-seeded annotations to include:**
- ann-1 (claude, purple): On "visual contact by two F/A-18F Super Hornet crews..." — note: "Five-channel corroboration is the strongest evidence class in the corpus."
- ann-2 (nemo, orange): On "white, featureless, elongated shape approximately 40 feet long..." — note: "Every single witness says the same thing about the shape." + attachment: "Fravor describes shape — JRE" (video)
- ann-3 (nemo, orange): On "Both crews spot a cross-shaped disturbance in the water — whitewater the size of a 737" — notes: "This is the moment. 4 trained pilots, broad daylight, clear skies.", "This detail haunts me", "The water disturbance pattern matches Shag Harbour 1967" + attachments: "r/UFOs thread on ocean anomaly" (url), "Fravor on whitewater — Lex Fridman" (video)
- ann-4 (nemo, orange): On "multiple anomalous aerial vehicles over approximately five days" — note: "Five independent sensor channels confirmed this thing."
- ann-5 (nemo, orange): On "Princeton's SPY-1 picks it up again — at the fighters' CAP point, 60 miles away..." — note: "The 60-mile jump is the single most extraordinary claim."
- ann-6 (nemo, orange): On "collect radar data tapes and FLIR recordings, and depart. No receipts. No chain of custody" — note: "If it was nothing, why take the hard drives? This is the biggest red flag."
- ann-7 (claude, purple): On "The ACH methodology identifies the least-disproven hypothesis..." — note: "'Unknown Technology' is a residual category. ACH does not confirm what the object is."

---

## Design System (extract from prototype CSS)

**Fonts (Google Fonts):**
- JetBrains Mono (300–600) — body, UI chrome
- Instrument Serif (regular, italic) — titles, hero, witness names
- Oswald (400, 500) — labels, section headers, case IDs (always uppercase, tracked)
- Caveat (400–600) — Nemo's handwriting annotations

**Colors:**
- Background: #F6F5F1
- Surface/cards: #FFFFFF
- Board bg: #EDECE8
- Text primary: #1A1816, secondary: #6B6560, tertiary: #A09A92
- Gold (accent): #9A7A2E
- Orange (Nemo/human): #B86A2E
- Purple (Claude/AI): #7B5D9A
- Red (anomalies): #B04A4A
- Green (verified): #5A8A4A
- Blue (military): #4A6A9A
- Each color has a -soft variant at ~10% opacity for tag/badge backgrounds

**Type scale (content column — these are the scaled-up sizes):**
- Hero title: 42px Instrument Serif
- Hero subtitle: 20px Instrument Serif italic
- Card/timeline titles: 15px JetBrains Mono 600
- Body/detail text: 13–14px
- Summary paragraphs: 14px, line-height 1.75
- Timeline detail: 13px
- Witness names: 19px Instrument Serif
- Witness quotes: 18px Caveat (these are real witness quotes, keep them as styled blocks, not annotations)
- Labels/tags: 8–10px Oswald uppercase
- Badges: 8–9px pill-shaped

---

## Data

Case 001 data is in `data/case-data.js` (JS object) and `data/case-001-nimitz.json` (JSON). The workspace prototype has this content hardcoded in HTML — the production version should render it from the data file.

Cases 002–006 are listed on the homepage but have no data yet. Show them as queued/locked.

---

## Routing

- `/` → homepage (case list)
- `/case/001` → investigation workspace

---

## Production decisions for you:

1. Pick a framework (React/Next.js/Svelte — your call)
2. Persist annotations, ACH votes, and evidence links (localStorage to start, then backend)
3. Wire up real search in the Search tab (or keep demo results for v1)
4. Make the index → workspace navigation work with real routing
5. Case data should load from JSON, not be hardcoded in HTML

Do NOT change the design. Match the prototypes pixel for pixel. The CSS variables, font choices, spacing, and interaction patterns are final. Read HANDOFF.md for additional architecture context.
```

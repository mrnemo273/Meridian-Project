# The Meridian Project — Design System & Direction

## Design Philosophy

Meridian should feel like a research instrument that happens to be beautiful. The aesthetic north star is: **what if a serious scientific institution designed a UAP research platform with the craft of an editorial magazine?**

The design must do one critical strategic job: make it impossible to dismiss. The moment it looks like a UFO website, serious researchers disengage. Every design decision should reinforce credibility, rigor, and neutrality.

---

## Aesthetic Direction

**Tone:** Clinical precision meets cartographic wonder. Cold objectivity with an undercurrent of the profound.

**References:**
- Nature journal / academic publication — for typographic rigor and information density
- National Geographic research expedition — for the sense of serious inquiry into the unknown
- Vintage astronomical charts and meridian maps — for texture and thematic resonance
- The Economist or Foreign Affairs — for editorial confidence without sensationalism

**What it is NOT:**
- Dark mode with green text — no hacker/conspiracy aesthetic
- Gold and navy "ancient mysteries" — no Ancient Aliens energy
- White with purple gradients — no generic AI/tech startup
- Dramatic lens flare and starfields — no sci-fi movie poster

---

## Color System

**Primary palette:**

```
--bg:             #F6F5F1   /* Warm off-white — page background */
--surface:        #FFFFFF   /* Cards, panels */
--board-bg:       #EDECE8   /* Secondary bg, tag pills */
--border:         rgba(0,0,0,0.07)
--border-strong:  rgba(0,0,0,0.12)
--text-1:         #1A1816   /* Primary text */
--text-2:         #6B6560   /* Secondary text */
--text-3:         #A09A92   /* Tertiary / labels */
```

**Accent palette:**

```
--gold:           #9A7A2E   /* Primary accent — links, progress, credibility */
--orange:         #B86A2E   /* Nemo / human voice — highlights, annotations */
--purple:         #7B5D9A   /* Claude / AI voice — highlights, analysis */
--red:            #B04A4A   /* Anomalies, open items, unresolved */
--green:          #5A8A4A   /* Verified, eliminated, corroborated */
--blue:           #4A6A9A   /* Military tags, low priority */
```

Each color has a `-soft` variant at ~10% opacity for tag/badge backgrounds:
```
--gold-soft:      rgba(154,122,46,0.10)
--orange-soft:    rgba(184,106,46,0.10)
--purple-soft:    rgba(123,93,154,0.10)
--red-soft:       rgba(176,74,74,0.10)
--green-soft:     rgba(90,138,74,0.10)
--blue-soft:      rgba(74,106,154,0.10)
```

**Highlight overlays (annotation system):**
```
--hl-nemo:        rgba(184,106,46,0.22)   /* Orange highlight on text */
--hl-claude:      rgba(123,93,154,0.18)   /* Purple highlight on text */
```

---

## Typography

**Display / Headlines:** Instrument Serif (regular, italic)
- Used for: hero titles, case titles, witness names, editorial headings
- Communicates: gravitas, editorial authority, timelessness
- Hero title: 42px, subtitle: 20px italic, witness names: 19px

**Body / UI Chrome:** JetBrains Mono (300–600)
- Used for: body text, UI chrome, card titles, detail text, Claude annotations
- Weight: 300 (light body), 400 (regular), 500 (medium), 600 (bold titles)
- Communicates: precision, instrument readout, technical rigor
- Card/timeline titles: 15px weight 600, body: 13–14px, summary: 14px line-height 1.75

**Labels / Section Headers:** Oswald (400, 500)
- Used for: section headers, case IDs, tags, badges, all-caps UI text
- Always uppercase with letter-spacing (tracked)
- Labels/tags: 8–10px, badges: 8–9px pill-shaped
- Communicates: structured hierarchy, military/institutional precision

**Human Voice / Annotations:** Caveat (400–600)
- Used for: Nemo's handwriting annotations, human notes, personal observations
- Annotation text: 17px, witness quotes: 18px
- Communicates: human presence, personal investigation, the researcher's hand

---

## Layout Architecture

### Homepage (index.html)

App-shell layout with a left sidebar (200px) and scrollable main content:
- Case list in the sidebar (001–006 with status badges)
- Dashboard stats (cases investigated, evidence items, etc.)
- Active investigation card with credibility score, progress bar, section chips
- Queue table showing upcoming cases
- Methodology section and investigator cards

### Investigation Workspace (case-workspace.html)

Three-column layout — the core product:

```
┌──────────┬────────────────────────────┬──────────────────────┐
│ Sidebar  │     Case Content           │ Investigation Tools  │
│ 200px    │     flex: 1 (max 860px)    │ 460px                │
│ fixed    │     scrollable             │ scrollable           │
│          │                            │                      │
│ • TOC    │  Hero / Summary / Timeline │ Tabbed interface:    │
│ • Tools  │  Evidence / Witnesses      │ • ACH Matrix         │
│ • Meta   │  AI Analysis / Questions   │ • Resolution         │
│          │                            │ • OSINT Log          │
│          │                            │ • Evidence Links     │
│          │                            │ • Search & Import    │
│          │                            │ • Solvability Score  │
└──────────┴────────────────────────────┴──────────────────────┘
```

All three columns scroll independently. The center column is adaptive — `flex: 1` with `max-width: 860px` and auto margins, so it grows on wide screens but caps out for readability. The investigation tools column is persistent (always visible, not a drawer or overlay).

**Spacing:** Generous. White space signals confidence and precision. Center column padding: 0 40px 120px.

---

## Core Interaction: Right-Click Annotation System

This is the primary human interaction in the workspace. Users select text in the case content, right-click, and get a custom context menu (browser default is suppressed):

**Menu options:**
- Highlight as Nemo (orange) — wraps selection in orange highlight span
- Highlight as Claude (purple) — wraps selection in purple highlight span
- Add Note — highlights as Nemo + opens inline textarea (Caveat font)
- Attach URL — highlights as Nemo + opens inline input with title + URL fields
- Link to Evidence — highlights and switches to Links tab
- Search for this — puts selection text into Search tab and triggers search

**Keyboard shortcuts:** N = Add Note, U = Attach URL (when menu is open). Cmd+Enter submits. Escape closes.

**Clicking an existing highlight** opens an annotation popover showing: highlighted text excerpt with colored left border, all notes (Caveat for Nemo, JetBrains Mono for Claude), all attachments with type icons, and input to add more.

**Data model per highlight:**
```json
{
  "id": "ann-123",
  "user": "nemo | claude",
  "highlightedText": "the selected text",
  "notes": ["string", "string"],
  "attachments": [
    { "type": "url | video | document", "title": "...", "url": "..." }
  ]
}
```

---

## Investigation Tools (Right Column Tabs)

### ACH Matrix (Analysis of Competing Hypotheses)
- Interactive matrix: evidence rows x hypothesis columns
- Each cell is clickable — cycles through C (Consistent) / I (Inconsistent) / N (Neutral) / blank
- When human vote differs from AI assessment, both shown side by side with orange dot
- Real-time tally bar showing inconsistency counts per hypothesis
- Verdict block at bottom

### Resolution Checklist
- Prosaic explanations with eliminated/partial/open status icons
- Eliminated = green checkmark, Partial = gold tilde, Open = red question mark

### OSINT Verification Log
- Verification items with Verified/Partial/Unverified status badges
- Each item: field label, value, source citation

### Evidence Chain & Linking
- Evidence chain items with provenance notes and corroboration strength (strong/moderate/weak dots)
- Evidence link map with clickable nodes — users click two nodes to create a typed link (corroborates, contradicts, etc.)
- Links render as list: node → label → node

### Search & Import
- Search input bar with results from multiple source types (Reddit, academic, video, FOIA, web)
- Each result has actions: Import to case, Attach to highlight, Open source
- Imported items list at bottom

### Solvability Assessment (Score)
- Score out of 100 with progress meter
- Weighted factors with +/- scores (green positive, red negative, gold neutral)
- Recommended next steps with priority badges

---

## Key UI Components

### Credibility Score Display
- Circular or arc indicator — not a star rating, not a progress bar
- Factor breakdown visible on hover/expand — no black box scoring
- Tier badge: TIER 1 / TIER 2 / TIER 3 / TIER 4 in Oswald uppercase
- Color-coded by tier: gold / green / graphite / caution

### Case Cards
- Clean bordered cards on paper background
- Title in Instrument Serif
- Date, location, source in JetBrains Mono
- Credibility tier badge top-right
- Key descriptors as small Oswald uppercase tags
- Clickable — gold border on selection, switches to relevant investigation tab

### Evidence / Witness / AI Analysis Cards
- Clickable cards in center column
- Selection highlights with gold border
- Clicking switches the right column to the relevant tool tab
- Smooth-scroll to center on selection

---

## Voice & Tone

**Editorial voice:** Precise, measured, curious. Never breathless. Never dismissive.

**Headlines:** Declarative, specific. "Six physical descriptors appear across 12,000 independent accounts" not "Shocking pattern found in UFO data"

**Null findings framing:** "Analysis of X accounts does not surface sufficient evidence to support Y conclusion at this time" — not "No evidence found." Absence of current evidence ≠ definitive null.

**Credibility tier labels:** Clinical. Tier 1, Tier 2, etc. Not "Highly Credible" or "Questionable" — numerical designation removes editorial judgment from the label itself.

**Dual investigator voice:** Nemo (orange, Caveat font) represents the human researcher's intuition, questions, and personal observations. Claude (purple, JetBrains Mono) represents systematic AI analysis, methodology notes, and analytical observations.

---

## Motion & Interaction

- Page transitions: subtle fade — nothing dramatic
- Data loading: skeleton states, not spinners
- Score reveals: brief count-up animation on credibility score — instrument feel
- Scroll progress bar: gold, sticky at top of center column
- Scroll-spy: sidebar TOC highlights active section
- Hover states: clean, immediate, no delay
- No parallax, no scroll-jacking, no cinematic intros

---

## What To Avoid

- Starfields, space imagery, UFO silhouettes as decorative elements
- Red/green binary credibility indicators — too reductive
- Chat interface for the query tool — no assistant persona, this is a research instrument
- Any imagery that could appear on a conspiracy theory website
- Urgency patterns — no "X researchers viewing this case" or similar
- Toolbars or mode toggles for annotations — right-click context menu only
- Drawer/overlay panels for investigation tools — persistent column only

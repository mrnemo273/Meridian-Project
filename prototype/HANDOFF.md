# Meridian — Developer Handoff: Phase 1 UI

**From:** Nemo + Claude (design/prototype)
**To:** Builder (production implementation)
**Date:** March 23, 2026

---

## What You're Getting

Two production-ready HTML prototypes in `/prototype/`. These are the source of truth for design, layout, interaction patterns, and content. Everything renders in-browser — open them locally.

| File | What it is |
|------|-----------|
| `index.html` | Case list / homepage — the app landing page |
| `case-workspace.html` | Investigation workspace — the main tool (this is the big one) |
| `case-file.html` | Read-only case file (earlier version, reference only) |
| `data/case-data.js` | Full Nimitz case data as JS object |
| `data/case-001-nimitz.json` | Same data as JSON |

**Ship `index.html` and `case-workspace.html`.** The case-file.html is superseded by case-workspace.html.

---

## Architecture Overview

### Layout: Three Columns

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

All three columns scroll independently. The center column is adaptive — `flex: 1` with `max-width: 860px` and auto margins, so it grows on wide screens but caps out for readability.

### No Frameworks

The prototypes are vanilla HTML/CSS/JS. No build step, no dependencies. The builder should decide the production stack, but everything is structured to map cleanly to components.

---

## Design System

### Fonts (Google Fonts)

| Font | Usage |
|------|-------|
| `JetBrains Mono` (300–600) | Body text, UI chrome, code-like elements |
| `Instrument Serif` (regular, italic) | Titles, witness names, hero headings |
| `Oswald` (400, 500) | Labels, section headers, case IDs, all-caps UI text |
| `Caveat` (400–600) | Nemo's handwriting annotations (human voice) |

### Colors

```css
--bg: #F6F5F1;              /* page background */
--surface: #FFFFFF;          /* cards, panels */
--board-bg: #EDECE8;         /* secondary bg, tag pills */
--border: rgba(0,0,0,0.07);
--border-strong: rgba(0,0,0,0.12);
--text-1: #1A1816;           /* primary text */
--text-2: #6B6560;           /* secondary text */
--text-3: #A09A92;           /* tertiary / labels */
--gold: #9A7A2E;             /* primary accent, links, progress */
--orange: #B86A2E;           /* Nemo / human voice */
--purple: #7B5D9A;           /* Claude / AI voice */
--red: #B04A4A;              /* anomalies, open items */
--green: #5A8A4A;            /* verified, eliminated */
--blue: #4A6A9A;             /* military tags, low priority */
```

Each color has a `-soft` variant at ~10% opacity for backgrounds.

### Type Scale (content column)

| Element | Size | Notes |
|---------|------|-------|
| Hero title | 42px | Instrument Serif |
| Hero subtitle | 20px | Instrument Serif italic |
| Section titles (TL, cards) | 15px | JetBrains Mono 600 |
| Body / detail text | 13–14px | JetBrains Mono |
| Summary paragraphs | 14px | line-height 1.75 |
| Nemo annotations | 17px | Caveat |
| Claude annotations | 12px | JetBrains Mono |
| Labels / tags | 8–10px | Oswald, uppercase, tracked |
| Badges | 8–9px | Pill-shaped, uppercase |

---

## Interactive Features to Build

### 1. Right-Click Context Menu (Annotation System)

**This is the core human interaction.** Users select text in the case content, right-click, and get a custom context menu:

- **Highlight as Nemo** (orange) / **Highlight as Claude** (purple)
- **Add Note** — highlights text + opens inline note input (Caveat font)
- **Attach URL** — highlights text + opens URL input with title field
- **Link to Evidence** — highlights and switches to evidence chain tab
- **Search for this** — takes selection text into the search tab

**Data model per highlight:**
```json
{
  "id": "ann-123",
  "user": "nemo",
  "highlightedText": "...",
  "notes": ["string", "string"],
  "attachments": [
    { "type": "url", "title": "...", "url": "..." },
    { "type": "video", "title": "...", "url": "..." }
  ]
}
```

Highlights show a count badge (top-right dot with number). Clicking an existing highlight opens an annotation popover showing all notes + attachments, with an input to add more.

**Keyboard shortcuts:** `N` for note, `U` for URL (when menu is open). `Cmd+Enter` to submit. `Escape` to close.

### 2. ACH Matrix Voting

Each cell in the ACH (Analysis of Competing Hypotheses) table is clickable. Clicking cycles through: blank → C (Consistent) → I (Inconsistent) → N (Neutral) → blank.

When the human's vote differs from the AI assessment, both are shown side by side with an orange dot indicator. A tally bar updates in real time showing inconsistency counts per hypothesis.

### 3. Evidence Linking

The Links tab has an evidence node map. Users click two nodes to create a link between them, with a typed label (e.g. "corroborates", "contradicts", "recorded by"). Links render as a simple list with node → label → node format.

### 4. Search & Import

The Search tab has a search input and displays results from multiple source types (Reddit, academic, video, FOIA, web). Each result has three actions:
- **Import to case** — adds to the imported evidence list
- **Attach to highlight** — links the source to a highlighted annotation
- **Open source** — external link

Currently uses pre-populated demo results. Production version needs a real search backend or API integration.

### 5. Card Selection

Evidence cards, witness cards, and AI analysis cards in the center column are clickable. Clicking one:
- Highlights it with a gold border
- Switches to the relevant investigation tab (evidence → chain, witness → chain, AI → ACH)
- Smooth-scrolls the card to center

---

## Data Architecture

### Current: Static JS Object

`case-data.js` exports `const CASE_DATA = {...}` with the full Nimitz case. The workspace prototype has the content hardcoded in HTML for now.

### Production: Needs

- Case data should be loaded from JSON/API and rendered dynamically
- Annotations need persistent storage (start with localStorage, then backend)
- ACH votes need per-user storage
- Evidence links need a graph data structure
- Search needs a real backend (Elasticsearch, or just API proxy to search providers)

### Cases in Queue (from index.html)

The homepage lists 6 cases. Only Case 001 (Nimitz) has data:

| # | Case | Status | Data |
|---|------|--------|------|
| 001 | USS Nimitz Encounter | Investigating | ✅ Complete |
| 002 | Phoenix Lights | Queued | ❌ Needs data |
| 003 | Rendlesham Forest | Queued | ❌ Needs data |
| 004 | Belgian Wave | Queued | ❌ Needs data |
| 005 | Tehran 1976 | Queued | ❌ Needs data |
| 006 | Aguadilla PR | Queued | ❌ Needs data |

---

## Navigation / Routing

| URL | Page |
|-----|------|
| `/` | index.html — case list, dashboard stats, methodology |
| `/case/001` | case-workspace.html — investigation workspace |

The index has an "Open Case File" button that should link to the workspace for that case.

---

## What's NOT in the Prototype (Builder Decisions)

1. **Framework choice** — React/Next.js/Svelte/whatever. The CSS maps cleanly to any component system
2. **State management** — annotations, ACH votes, evidence links all need real state
3. **Auth** — multi-user annotations need user identity
4. **Persistence** — where annotations/votes/links get stored
5. **Search backend** — the search UI is built, needs a real data source
6. **Responsive/mobile** — prototype is desktop-only (1200px+ assumed)
7. **Case data pipeline** — loading case data from API instead of hardcoded HTML
8. **Real-time collaboration** — if multiple investigators work simultaneously

---

## Files to Ignore

These are earlier iterations, now superseded:

- `case-file.html` — read-only case file, replaced by case-workspace.html
- `case-board.html` — kanban-style board experiment
- `/wireframes/` — infinite canvas experiments (tabled for now)

---

## Quick Start for Builder

1. Open `prototype/index.html` in a browser — that's the homepage
2. Open `prototype/case-workspace.html` — that's the investigation workspace
3. In the workspace: right-click any text in the left content column to see the annotation system
4. Click the ACH tab on the right and try clicking the C/I/N cells
5. Click the Links tab and try connecting two evidence nodes
6. Click the Search tab to see the OSINT search interface

Everything works locally, no server needed. The builder's job is to turn these into a real app with persistent data, real routing, and a component architecture.

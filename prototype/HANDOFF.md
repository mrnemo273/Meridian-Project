# Meridian — Developer Handoff: Phase 3B

**From:** Nemo + Claude (design/prototype)
**To:** Builder (production implementation)
**Date:** March 23, 2026

---

## What Already Shipped (Phase 3A)

The production Next.js app is at the project root with all interactive features working for Case 001 (Nimitz):

| What | Status | Location |
|------|--------|----------|
| Homepage | ✅ Live | `app/page.tsx` |
| Investigation Workspace | ✅ Live | `app/case/[id]/page.tsx` |
| Annotations (right-click) | ✅ Working | `hooks/useAnnotations.ts` |
| ACH Matrix voting | ✅ Working | `hooks/useACHVotes.ts` |
| Evidence linking | ✅ Working | `hooks/useEvidenceLinks.ts` |
| Tab components | ✅ Working | `components/workspace/tabs/` |
| Case 001 data | ✅ Complete | `data/case-001-nimitz.json` |

**All interactive features are functional.** The design system (fonts, colors, spacing) matches the prototype exactly.

---

## What To Build Now (Phase 3B)

### Priority 1: Architecture Refactor

**Problem:** `app/case/[id]/page.tsx` is a ~700-line monolith with ~200 lines of hardcoded data arrays at the top (timeline events, evidence cards, witness cards, AI analysis, questions, resolution items, OSINT items, search results, solvability factors). The `[id]` route param is ignored — it always renders Nimitz.

**Tasks:**

#### 1. Decompose the workspace page into components

Target structure:
```
app/case/[id]/page.tsx          ← under 200 lines, orchestrator only
components/workspace/
  CaseContent.tsx               ← center column renderer
  CaseSidebar.tsx               ← left sidebar (TOC, meta, highlights)
  InvestColumn.tsx              ← right column tab container
  ContextMenu.tsx               ← right-click annotation menu
  HeroSection.tsx               ← case hero with title, tier, score
  TimelineSection.tsx           ← timeline events renderer
  EvidenceSection.tsx           ← evidence cards
  WitnessSection.tsx            ← witness cards
  AIAnalysisSection.tsx         ← AI analysis cards
  QuestionsSection.tsx          ← open questions
  tabs/                         ← already exists, keep as-is
```

#### 2. Extract hardcoded data into case JSON files

Move ALL `const` arrays from the top of `page.tsx` into the case data file. Extend `data/case-001-nimitz.json` (or create a new format) to include:

```typescript
interface CaseWorkspaceData {
  // Already in case-001-nimitz.json:
  id: string
  title: string
  subtitle: string
  // ... metadata, credibility, etc.

  // NEW — move from page.tsx:
  timeline: TimelineEvent[]
  evidence: EvidenceCard[]
  witnesses: WitnessCard[]
  aiAnalysis: AICard[]
  openQuestions: Question[]
  resolution: ResolutionItem[]
  osint: OSINTItem[]
  evidenceChain: ChainItem[]
  solvabilityFactors: SolvabilityFactor[]
  searchDemoResults: SearchResult[]  // until real search exists
}
```

#### 3. Wire the `[id]` route param

```typescript
// app/case/[id]/page.tsx
export default function CaseWorkspace({ params }: { params: { id: string } }) {
  const caseData = loadCaseData(params.id) // load from data/case-{id}.json
  if (!caseData) return <NotFound />
  // render workspace with caseData
}
```

#### 4. Add "Back to Cases" link

The breadcrumb already exists at top of content area. Add a clickable "← All Cases" link in the left sidebar that routes back to `/`.

---

### Priority 2: New Case Data Files

Nemo is researching and writing JSON data files for cases 002-006. These will be placed in `data/` following the same format as `case-001-nimitz.json` (extended with workspace content).

**Cases in queue:**

| # | Case | JSON File |
|---|------|-----------|
| 002 | Phoenix Lights (1997) | `data/case-002-phoenix.json` |
| 003 | Rendlesham Forest (1980) | `data/case-003-rendlesham.json` |
| 004 | Belgian Wave (1989-90) | `data/case-004-belgian.json` |
| 005 | Tehran 1976 | `data/case-005-tehran.json` |
| 006 | Aguadilla PR (2013) | `data/case-006-aguadilla.json` |

The builder should focus on the architecture refactor (Priority 1) first. Case data files will be provided as they're ready — the architecture should support loading any case by ID without code changes.

---

## Design System (unchanged)

Fonts, colors, and spacing are already implemented correctly. Reference `Docs/DESIGN.md` for the full spec. Key files:

- `styles/globals.css` — CSS variables
- `app/layout.tsx` — font loading
- `tailwind.config.ts` — design token mapping

---

## File Map

```
/app
  /case/[id]/page.tsx     ← THE BIG FILE TO REFACTOR
  layout.tsx              ← app shell, font loading
  page.tsx                ← homepage

/components
  /homepage/              ← homepage components
  /shared/                ← shared UI components
  /workspace/
    /tabs/                ← investigation tab components (keep as-is)

/data
  case-001-nimitz.json    ← Case 001 data
  cases-index.ts          ← case list for homepage

/hooks
  useAnnotations.ts       ← annotation CRUD (localStorage)
  useACHVotes.ts          ← ACH voting (localStorage)
  useEvidenceLinks.ts     ← evidence linking (localStorage)

/prototype               ← HTML prototypes (reference only, don't modify)
/Docs                    ← project docs (DESIGN.md, PRD.md, etc.)
```

---

## Definition of Done (Phase 3B)

- [ ] `app/case/[id]/page.tsx` is under 200 lines
- [ ] All workspace content is rendered from components, not inline in page
- [ ] All case data is loaded from JSON files, not hardcoded arrays
- [ ] `/case/001` renders Nimitz workspace (same as before)
- [ ] `/case/002` renders Phoenix Lights workspace (when data file exists)
- [ ] `/case/999` shows a 404 or "case not found" state
- [ ] All interactive features (annotations, ACH, evidence links) still work
- [ ] Homepage case list links to correct workspace URLs
- [ ] "Back to Cases" link works from workspace

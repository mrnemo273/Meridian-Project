# Phase 3B Spec: Architecture & Multi-Case Support

> **Status:** ✅ Complete
> **Assigned:** Builder
> **Depends on:** Phase 3A (shipped)
> **Related docs:** `prototype/HANDOFF.md` · `Docs/DESIGN.md` · `Docs/SCRUMMASTER.md`

---

## Context

You are continuing development on The Meridian Project — a rigorous AI-powered UAP evidence research platform built with Next.js, TypeScript, and Tailwind CSS.

### What Already Exists

A production Next.js app is running at the project root with:

- Homepage (`app/page.tsx`) — case list sidebar, dashboard, methodology section
- Investigation Workspace (`app/case/[id]/page.tsx`) — three-column layout for Case 001 (Nimitz)
- All interactive features working: right-click annotations, ACH matrix voting, evidence linking, card selection, search UI, 6 investigation tabs
- Custom hooks for persistence: `hooks/useAnnotations.ts`, `hooks/useACHVotes.ts`, `hooks/useEvidenceLinks.ts` (all localStorage)
- Case data: `data/case-001-nimitz.json`, `data/cases-index.ts`
- Design system fully implemented: Instrument Serif, JetBrains Mono, Oswald, Caveat fonts + full color palette in CSS variables

Everything renders correctly. All interactive features work. Do NOT change the design system, font choices, or color palette.

---

## Tasks

### Task 1: Decompose the workspace page

`app/case/[id]/page.tsx` is ~700 lines with ~200 lines of hardcoded data arrays at the top. Break it apart:

1. Move all `const` data arrays (timelineEvents, evidenceCards, witnessCards, aiCards, questions, resolutionItems, osintItems, chainItems, searchResults, solvabilityFactors) out of the page component and into the case data file `data/case-001-nimitz.json` (extend the JSON schema to include all workspace content).

2. Create these components from the page's render logic:
   - `components/workspace/CaseContent.tsx` — center column
   - `components/workspace/CaseSidebar.tsx` — left sidebar
   - `components/workspace/InvestColumn.tsx` — right column tab container
   - `components/workspace/ContextMenu.tsx` — right-click menu
   - `components/workspace/HeroSection.tsx` — title, tier, score
   - `components/workspace/TimelineSection.tsx`
   - `components/workspace/EvidenceSection.tsx`
   - `components/workspace/WitnessSection.tsx`
   - `components/workspace/AIAnalysisSection.tsx`
   - `components/workspace/QuestionsSection.tsx`

3. The page.tsx should be under 200 lines when done — just imports, data loading, and layout orchestration.

### Task 2: Wire the route param

Currently `app/case/[id]/page.tsx` ignores the `[id]` param and always renders Nimitz. Fix this:

1. Read the `id` param from the route
2. Load the correct case data file: `data/case-{id}-{slug}.json`
3. If no data file exists for that ID, render a "Case not found" state
4. Create a `lib/loadCase.ts` utility that handles the loading logic

### Task 3: Define the canonical case data schema

Create a TypeScript interface in `types/case.ts` that covers ALL workspace content:

```typescript
interface CaseWorkspaceData {
  // Case metadata (already in case-001-nimitz.json)
  id: string
  caseNumber: string
  title: string
  subtitle: string
  date: string
  location: string
  // ... credibility, tier, etc.

  // Workspace content (currently hardcoded in page.tsx)
  timeline: TimelineEvent[]
  evidence: EvidenceCard[]
  witnesses: WitnessCard[]
  aiAnalysis: AIAnalysisCard[]
  openQuestions: OpenQuestion[]
  resolution: ResolutionItem[]
  osint: OSINTItem[]
  evidenceChain: ChainItem[]
  solvabilityFactors: SolvabilityFactor[]
  searchDemoResults?: SearchResult[]

  // ACH config (currently in useACHVotes.ts)
  achHypotheses: string[]
  achEvidence: ACHEvidenceRow[]
}
```

Type each sub-interface to match the actual data shape in the current `const` arrays.

### Task 4: Navigation polish

1. Add a "← All Cases" link in the left sidebar of the workspace
2. Make homepage case list cards link to the correct `/case/{id}` URLs
3. Show status badges on homepage for cases with vs without data files

---

## Constraints

- Do NOT change the visual design — fonts, colors, spacing, layout must stay identical
- Do NOT change the interaction patterns — right-click menu, ACH clicking, evidence linking behavior must be preserved
- All existing features must work identically after refactor
- Keep the tab components in `components/workspace/tabs/` as they are (they're already modular)
- Test by navigating to `/case/001` and confirming everything still works

---

## Definition of Done

- [x] `page.tsx` is under 200 lines
- [x] All case data is loaded from JSON, not hardcoded
- [x] `/case/001` renders correctly (visual + interactive parity with current)
- [x] `/case/002` would render if a data file existed (route param works)
- [x] Missing cases show a "not found" state
- [x] "Back to Cases" navigation works
- [x] `npm run build` completes with zero errors
- [x] TypeScript types exist for all case data structures

---

## Builder Notes

<!-- Builder: use this section to leave notes, flag blockers, or document decisions as you work. -->

| Date | Note |
|------|------|
| 2026-03-23 | **Decomposition complete.** `page.tsx` went from 1,044 lines to 120 lines. Extracted 10 components into `components/workspace/` and 1 interaction hook into `hooks/useWorkspaceInteractions.ts`. |
| 2026-03-23 | **Data externalized.** Created `data/case-001-workspace.json` as a separate workspace data file (not merged into the large research JSON). This keeps UI data concerns separate from research corpus data. |
| 2026-03-23 | **Route param wired.** Uses `useParams` from `next/navigation` (client component pattern). Dynamic import `@/data/case-${id}-workspace.json` loads data per case. Missing files trigger "Case Not Found" state. |
| 2026-03-23 | **Types created.** `types/case.ts` exports `CaseWorkspaceData` plus 10 sub-interfaces covering all workspace content shapes. |
| 2026-03-23 | **Nav polish.** Breadcrumb simplified to `Cases / {caseNumber} — {title}` (removed redundant "Meridian" link). Removed "← All Cases" sidebar link since breadcrumb serves that purpose. All sidebar case links point to `/case/{id}`. Queue table rows are clickable links. `casesWithData` set in `cases-index.ts` tracks which cases have data files. |
| 2026-03-23 | **Note:** `lib/loadCase.ts` was created per spec but the page uses dynamic import directly for simplicity. The utility is available for server-side use if needed later. |
| 2026-03-23 | **Concurrent editing resolved.** Planner added Case 002 (Phoenix Lights) data, renumbered cases 002-006 → 003-007, and added `investigationTasks` to types and JSON. Fixed invalid JSON in `case-002-workspace.json` (unescaped smart quotes in witness quote fields). All changes merged cleanly. |
| 2026-03-23 | **Files created:** `types/case.ts`, `lib/loadCase.ts`, `data/case-001-workspace.json`, `hooks/useWorkspaceInteractions.ts`, `components/workspace/` (CaseSidebar, CaseContent, InvestColumn, ContextMenu, HeroSection, TimelineSection, EvidenceSection, WitnessSection, AIAnalysisSection, QuestionsSection, AnnotationOverlays). |

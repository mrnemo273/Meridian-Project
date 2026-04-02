# Phase 6 — Investigation Engine: Facts, Probabilities & Research Branches

> **Status:** Open
> **Depends on:** Phase 4 (shipped). Auth (Phase 5) is NOT required — these features work with or without it.
> **Goal:** Add three interconnected analysis layers to each case: a Verified Facts section (ground truth), Bayesian Hypothesis Probabilities (quantitative scores on the ACH hypotheses), and Research Branches (investigation threads that grow from specific points in the case narrative).

---

## Important: Read Next.js 16 Docs First

**Before writing any code**, read the relevant docs at `node_modules/next/dist/docs/`. Next.js 16.2.1 has breaking changes. Heed deprecation notices.

---

## How These Three Features Connect

```
                    ┌─────────────────────┐
                    │   VERIFIED FACTS     │  ← Ground truth layer
                    │   "What we KNOW"     │     Anchors everything
                    └──────────┬──────────┘
                               │ feeds into
              ┌────────────────┼────────────────┐
              ▼                                  ▼
  ┌───────────────────┐              ┌───────────────────┐
  │  RESEARCH BRANCHES │              │    HYPOTHESIS      │
  │  "What we're       │──discovers──▶│    PROBABILITIES   │
  │   investigating"   │   new facts  │   "What the math   │
  └───────────────────┘              │    says"           │
                                     └───────────────────┘
```

A **Verified Fact** is something confirmed by multiple independent sources — e.g. "4 Navy pilots made visual contact" (confirmed: named, testified under oath, DoD acknowledged). Facts feed probabilities. **Research Branches** are mini-investigations that grow off the main case when someone asks "wait, how fast was it actually going?" — they produce new facts or analysis that update the probability scores. **Hypothesis Probabilities** are the quantitative running scorecard derived from all facts and evidence.

---

## Part A: Verified Facts Layer

### A1. Data Model

Add to `types/case.ts`:

```typescript
export interface VerifiedFact {
  id: string;                          // e.g. "VF-001"
  fact: string;                        // The fact statement
  category: "sensor" | "witness" | "physical" | "documentary" | "temporal" | "environmental";
  confidence: "confirmed" | "high" | "disputed";
  sources: string[];                   // What confirms this fact (minimum 2 for "confirmed")
  relatedEvidence?: string;            // Links to evidence card title
  relatedTimeline?: string;            // Links to timeline event title
  disputedBy?: string;                 // If confidence is "disputed", who/what disputes it
}
```

Add to `CaseWorkspaceData`:
```typescript
verifiedFacts?: VerifiedFact[];
```

### A2. Component — `VerifiedFacts.tsx`

Create `components/workspace/VerifiedFacts.tsx`

**Position in CaseContent.tsx:** Between HeroSection/Summary and Timeline — the facts should be the very first analytical content after the executive summary. This sets the "ground truth" before the narrative begins.

```tsx
// In CaseContent.tsx, new order:
<HeroSection data={data} getCount={getCount} />
<VerifiedFacts facts={data.verifiedFacts || []} />   {/* ← NEW */}
<TimelineSection events={data.timeline} getCount={getCount} />
<EvidenceSection ... />
<EvidenceGallery ... />
<WitnessSection ... />
<AIAnalysisSection ... />
<QuestionsSection ... />
```

**Layout:**
- Section label: **"Verified Facts — What We Know"**
- Subtitle: "These facts are confirmed by multiple independent sources. Everything below builds on this foundation."
- Facts displayed as a **compact grid of fact cards** (2 columns on desktop, 1 on mobile)
- Each fact card shows:
  - Category icon (left side): small colored icon/dot by category
    - sensor → blue dot (`var(--blue)`)
    - witness → gold dot (`var(--gold)`)
    - physical → green dot (`var(--green)`)
    - documentary → purple dot (`var(--purple)`)
    - temporal → orange dot (`var(--orange)`)
    - environmental → muted dot (`var(--text-3)`)
  - Fact text (the main statement, bold, 11px)
  - Confidence badge: "Confirmed" (green), "High Confidence" (gold), "Disputed" (red/orange)
  - Sources: small text listing corroborating sources (9px, `var(--text-3)`)
  - If `disputedBy` is set, show a small warning line: "Disputed: [reason]"

**Interaction:**
- Click a fact card → if it has `relatedEvidence` or `relatedTimeline`, scroll to that section and highlight the relevant card
- Hover → subtle elevation/shadow

### A3. Populate Case 001 Facts

Add to `case-001-workspace.json`:

```json
"verifiedFacts": [
  {
    "id": "VF-001",
    "fact": "AN/SPY-1B radar aboard USS Princeton tracked anomalous returns for approximately two weeks prior to November 14, 2004.",
    "category": "sensor",
    "confidence": "confirmed",
    "sources": [
      "Senior Chief Kevin Day — sworn congressional testimony (2023)",
      "USS Princeton radar operators — multiple corroborating accounts",
      "SCU forensic analysis of radar data characteristics"
    ],
    "relatedEvidence": "AN/SPY-1B Radar Tracking"
  },
  {
    "id": "VF-002",
    "fact": "Four Navy pilots across two F/A-18F Super Hornets made independent visual contact with a white, oblong object on November 14, 2004.",
    "category": "witness",
    "confidence": "confirmed",
    "sources": [
      "CDR David Fravor — congressional testimony under oath (July 2023)",
      "LCDR Alex Dietrich — 60 Minutes interview (May 2021)",
      "DoD official acknowledgment (April 2020 video release)"
    ],
    "relatedTimeline": "Visual contact — Tic Tac above churning ocean"
  },
  {
    "id": "VF-003",
    "fact": "The FLIR1 infrared video is 76 seconds long and was captured by an ATFLIR pod on an F/A-18F flown by LT Chad Underwood (VFA-41).",
    "category": "documentary",
    "confidence": "confirmed",
    "sources": [
      "U.S. Department of Defense — official release (April 2020)",
      "NAVAIR FOIA Reading Room",
      "LT Chad Underwood — interviews confirming he captured the footage"
    ],
    "relatedEvidence": "FLIR1 Infrared Video"
  },
  {
    "id": "VF-004",
    "fact": "The encounter occurred approximately 100 nautical miles southwest of San Diego in the W-291 SOCAL Operating Area.",
    "category": "environmental",
    "confidence": "confirmed",
    "sources": [
      "USS Nimitz CSG-11 operational records",
      "SCU geographic reconstruction",
      "Multiple pilot testimonies confirming SOCAL OPAREA"
    ]
  },
  {
    "id": "VF-005",
    "fact": "Radar data tapes and FLIR recordings were collected from USS Princeton by unidentified personnel after the encounter.",
    "category": "documentary",
    "confidence": "confirmed",
    "sources": [
      "PO Patrick 'PJ' Hughes — testimony about data collection",
      "CDR David Fravor — congressional testimony",
      "Multiple Princeton crew corroborating accounts"
    ],
    "relatedTimeline": "Data collection — unknown personnel"
  },
  {
    "id": "VF-006",
    "fact": "The object demonstrated no visible propulsion: no exhaust plume, no wings, no control surfaces, no rotor.",
    "category": "witness",
    "confidence": "confirmed",
    "sources": [
      "CDR Fravor — direct observation at close range",
      "LCDR Dietrich — direct observation",
      "FLIR1 IR video — no thermal exhaust signature visible"
    ]
  },
  {
    "id": "VF-007",
    "fact": "USS Princeton's radar recorded the object relocating from the intercept point to Fravor's CAP point (~60 miles) in seconds.",
    "category": "sensor",
    "confidence": "high",
    "sources": [
      "Senior Chief Kevin Day — congressional testimony",
      "USS Princeton CIC personnel"
    ],
    "disputedBy": "Exact speed calculation disputed — SCU estimates range from 46,000 mph (instantaneous) to lower bounds depending on radar sampling rate assumptions."
  },
  {
    "id": "VF-008",
    "fact": "No sonic boom was detected or reported despite apparent hypersonic speed.",
    "category": "physical",
    "confidence": "high",
    "sources": [
      "CDR Fravor — explicit statement",
      "No Princeton crew reported sonic boom",
      "No seismic or acoustic records of sonic event"
    ]
  },
  {
    "id": "VF-009",
    "fact": "Weather on November 14, 2004 was clear with calm seas — 'a perfect day for flying' (Fravor).",
    "category": "environmental",
    "confidence": "confirmed",
    "sources": [
      "NOAA historical weather records",
      "Multiple pilot descriptions",
      "Clear-sky conditions visible in FLIR1 ocean background"
    ]
  },
  {
    "id": "VF-010",
    "fact": "CDR David Fravor testified under oath before the U.S. House Oversight Committee on July 26, 2023.",
    "category": "documentary",
    "confidence": "confirmed",
    "sources": [
      "U.S. House Committee on Oversight and Accountability — official record",
      "C-SPAN broadcast",
      "Written statement available from oversight.house.gov"
    ]
  }
]
```

### A4. Populate Case 002 Facts

Add to `case-002-workspace.json`:

```json
"verifiedFacts": [
  {
    "id": "VF-001",
    "fact": "On the evening of March 13, 1997, hundreds of people across a 300-mile corridor from Henderson, NV to Tucson, AZ reported seeing lights in the sky.",
    "category": "witness",
    "confidence": "confirmed",
    "sources": [
      "NUFORC database — 700+ filed reports",
      "Councilwoman Frances Barwood — personally interviewed 700+ witnesses",
      "Multiple news organizations documented reports in real-time"
    ]
  },
  {
    "id": "VF-002",
    "fact": "Arizona Governor Fife Symington III witnessed the event and confirmed it publicly in 2007, ten years after the incident.",
    "category": "witness",
    "confidence": "confirmed",
    "sources": [
      "Governor Symington — CNN interview (2007)",
      "Governor Symington — multiple subsequent interviews",
      "Air Force veteran with pilot training — credentialed observer"
    ],
    "relatedWitness": "Gov. Fife Symington III"
  },
  {
    "id": "VF-003",
    "fact": "Actor and licensed pilot Kurt Russell reported lights to air traffic control while on approach to Phoenix. His ATC recording exists.",
    "category": "documentary",
    "confidence": "confirmed",
    "sources": [
      "Kurt Russell — BBC One interview (2017)",
      "ATC recording — confirmed by Russell upon hearing it on television",
      "Russell did not connect his sighting to the Phoenix Lights until years later"
    ]
  },
  {
    "id": "VF-004",
    "fact": "The Maryland Air National Guard 104th Fighter Squadron (Operation Snowbird) was conducting exercises at the Barry Goldwater Range that night.",
    "category": "documentary",
    "confidence": "confirmed",
    "sources": [
      "Maryland ANG official statement (June 1997)",
      "Operation Snowbird training records (partial)"
    ]
  },
  {
    "id": "VF-005",
    "fact": "The military explanation for Event 2 (10 PM stationary lights) is LUU-2B/B illumination flares dropped during the Snowbird exercise.",
    "category": "documentary",
    "confidence": "confirmed",
    "sources": [
      "Maryland ANG official statement",
      "Cognitech video analysis — mountain-occlusion timing consistent with flares"
    ],
    "disputedBy": "Some analysts dispute flare explanation based on brightness constancy and formation symmetry."
  },
  {
    "id": "VF-006",
    "fact": "There are TWO distinct events: Event 1 (V-formation, 7:55–9:30 PM, moving) and Event 2 (stationary lights, 10 PM, filmed). They are temporally and geographically separate.",
    "category": "temporal",
    "confidence": "confirmed",
    "sources": [
      "NUFORC report timestamps",
      "Geographic analysis of witness locations",
      "Temporal gap of 30+ minutes between events"
    ]
  },
  {
    "id": "VF-007",
    "fact": "FAA radar data for the event was not preserved — it was erased per standard 2-week retention policy.",
    "category": "documentary",
    "confidence": "confirmed",
    "sources": [
      "FAA data retention policy documentation",
      "No FOIA request was filed within the retention window"
    ]
  },
  {
    "id": "VF-008",
    "fact": "Multiple Prescott Valley witnesses independently reported stars being occluded (blocked) by the V-formation, suggesting a solid object rather than a formation of separate lights.",
    "category": "witness",
    "confidence": "high",
    "sources": [
      "Tim Ley family — detailed testimony with drawings",
      "Multiple independent Prescott Valley witnesses compiled by researchers"
    ],
    "disputedBy": "Skeptics argue star occlusion could be perceptual — illusory contour effect from closely-spaced lights in formation."
  }
]
```

---

## Part B: Hypothesis Probabilities

### B1. Data Model

Add to `types/case.ts`:

```typescript
export interface HypothesisProbability {
  hypothesis: string;                  // Must match an achHypotheses entry
  probability: number;                 // 0-100 (percentage)
  trend: "rising" | "falling" | "stable";
  reasoning: string;                   // 2-3 sentence AI explanation of why this probability
  keyFactors: {
    supports: string[];                // Fact IDs or evidence that supports this hypothesis
    contradicts: string[];             // Fact IDs or evidence that contradicts it
  };
  lastUpdated: string;                 // ISO date string
}
```

Add to `CaseWorkspaceData`:
```typescript
hypothesisProbabilities?: HypothesisProbability[];
```

### B2. Component — Update ACH Tab in `InvestColumn.tsx`

Don't create a new tab — enhance the existing **ACH tab** with a probability panel below the matrix.

**Layout (below existing ACH matrix):**

```
┌──────────────────────────────────────────┐
│  Hypothesis Probability Assessment       │
│  Based on 10 verified facts, 8 evidence  │
│  items, and qualitative ACH analysis     │
├──────────────────────────────────────────┤
│                                          │
│  Unknown Technology          ████ 62%    │  ← green-gold bar
│  ▲ rising · 0 contradictions             │
│  "Only hypothesis consistent with all    │
│   evidence. Radar, visual, IR all align."│
│                                          │
│  Sensor Error                ██   18%    │  ← muted bar
│  ▼ falling · 2 contradictions            │
│  "Multi-platform confirmation makes      │
│   systemic sensor error unlikely."       │
│                                          │
│  Drone / UAS                 █    12%    │  ← muted bar
│  ● stable · 4 contradictions             │
│  "Speed and absence of propulsion        │
│   exceed any known drone capability."    │
│                                          │
│  Atmospheric                      4%     │  ← minimal bar
│  ▼ falling · 5 contradictions            │
│                                          │
│  Conventional Aircraft            4%     │  ← minimal bar
│  ▼ falling · 6 contradictions            │
│                                          │
├──────────────────────────────────────────┤
│  ⓘ Probabilities are derived from the   │
│  ACH matrix, verified facts, and         │
│  evidence strength ratings. They update  │
│  as new evidence is added.               │
└──────────────────────────────────────────┘
```

**Design details:**
- Each hypothesis gets a horizontal bar whose width = probability percentage
- Bar color: leading hypothesis gets `var(--gold)`, others get `var(--border)` with slight fill
- Trend indicator: ▲ rising (green), ▼ falling (red), ● stable (neutral)
- Contradictions count: pulled from ACH matrix "I" tallies
- Reasoning: collapsible — show first line, click to expand
- All probabilities must sum to 100%
- Sort by probability descending

**Footer note:** "Probabilities are AI-derived estimates based on available evidence. They are not predictions — they reflect what the evidence mathematically supports given current data."

### B3. Populate Case 001 Probabilities

Add to `case-001-workspace.json`:

```json
"hypothesisProbabilities": [
  {
    "hypothesis": "Unknown Tech",
    "probability": 62,
    "trend": "stable",
    "reasoning": "The only hypothesis with zero inconsistencies in the ACH matrix. Consistent with all sensor data (radar, IR, visual), the absence of propulsion signatures, and the extreme performance characteristics (est. 75g–5,400g acceleration). No known technology matches the observed behavior.",
    "keyFactors": {
      "supports": ["VF-001", "VF-002", "VF-003", "VF-006", "VF-007", "VF-008"],
      "contradicts": []
    },
    "lastUpdated": "2026-04-02"
  },
  {
    "hypothesis": "Sensor Error",
    "probability": 18,
    "trend": "falling",
    "reasoning": "Would require simultaneous failure of AN/SPY-1B radar, ATFLIR infrared pod, AND visual perception of four trained Navy pilots. Multi-platform, multi-sensor confirmation makes systemic error highly unlikely. The 2-week radar tracking period further reduces random error probability.",
    "keyFactors": {
      "supports": [],
      "contradicts": ["VF-002", "VF-003"]
    },
    "lastUpdated": "2026-04-02"
  },
  {
    "hypothesis": "Drone / UAS",
    "probability": 12,
    "trend": "stable",
    "reasoning": "No known drone in 2004 (or 2026) can hover without visible propulsion, accelerate to hypersonic speeds without sonic boom, or match the physical description. However, an unknown advanced drone program cannot be fully excluded.",
    "keyFactors": {
      "supports": [],
      "contradicts": ["VF-006", "VF-007", "VF-008"]
    },
    "lastUpdated": "2026-04-02"
  },
  {
    "hypothesis": "Atmospheric",
    "probability": 4,
    "trend": "falling",
    "reasoning": "Clear weather conditions (VF-009), direct visual contact at close range by trained observers, and coherent radar/IR signatures eliminate atmospheric phenomena (mirage, temperature inversion, ball lightning).",
    "keyFactors": {
      "supports": [],
      "contradicts": ["VF-002", "VF-006", "VF-008", "VF-009"]
    },
    "lastUpdated": "2026-04-02"
  },
  {
    "hypothesis": "Conventional Aircraft",
    "probability": 4,
    "trend": "falling",
    "reasoning": "No conventional aircraft can operate without visible propulsion, hover silently, accelerate instantaneously, or match the described Tic Tac morphology. Fravor — a career fighter pilot — explicitly stated it was not any aircraft he had ever seen.",
    "keyFactors": {
      "supports": [],
      "contradicts": ["VF-002", "VF-003", "VF-006", "VF-007", "VF-008"]
    },
    "lastUpdated": "2026-04-02"
  }
]
```

### B4. Populate Case 002 Probabilities

Add to `case-002-workspace.json`:

```json
"hypothesisProbabilities": [
  {
    "hypothesis": "Multiple Causes",
    "probability": 45,
    "trend": "rising",
    "reasoning": "The two-event decomposition (VF-006) strongly supports this hypothesis. Event 2 is likely flares (VF-005). Event 1 remains unexplained. This hypothesis accommodates the strongest evidence for both events without forcing a single explanation.",
    "keyFactors": {
      "supports": ["VF-004", "VF-005", "VF-006"],
      "contradicts": []
    },
    "lastUpdated": "2026-04-02"
  },
  {
    "hypothesis": "Unknown Craft",
    "probability": 28,
    "trend": "stable",
    "reasoning": "Star occlusion testimony (VF-008) suggests a solid object for Event 1. Governor Symington described a 'geometric outline.' No conventional formation would occlude stars uniformly. However, this relies entirely on witness testimony — no sensor data exists.",
    "keyFactors": {
      "supports": ["VF-001", "VF-002", "VF-008"],
      "contradicts": ["VF-007"]
    },
    "lastUpdated": "2026-04-02"
  },
  {
    "hypothesis": "A-10 Formation",
    "probability": 15,
    "trend": "stable",
    "reasoning": "A-10s from Operation Snowbird were in the area (VF-004). V-formation flight path is consistent with military transit. However, fails the star-occlusion test (VF-008), silence (A-10 engines are loud), and the perceived mile-wide size.",
    "keyFactors": {
      "supports": ["VF-004"],
      "contradicts": ["VF-001", "VF-008"]
    },
    "lastUpdated": "2026-04-02"
  },
  {
    "hypothesis": "LUU-2B/B Flares",
    "probability": 8,
    "trend": "falling",
    "reasoning": "Explains Event 2 only. Cognitech mountain-occlusion analysis supports this for the 10 PM footage (VF-005). Cannot explain Event 1 — flares don't move 300 miles in formation. Probability lowered because Event 1 is the primary mystery.",
    "keyFactors": {
      "supports": ["VF-004", "VF-005"],
      "contradicts": ["VF-001", "VF-006"]
    },
    "lastUpdated": "2026-04-02"
  },
  {
    "hypothesis": "Mass Misperception",
    "probability": 4,
    "trend": "falling",
    "reasoning": "700+ independent witnesses across 300 miles with consistent descriptions, including a governor, a licensed pilot with ATC recording, and law enforcement. The scale and consistency of the testimony effectively eliminates mass misperception.",
    "keyFactors": {
      "supports": [],
      "contradicts": ["VF-001", "VF-002", "VF-003"]
    },
    "lastUpdated": "2026-04-02"
  }
]
```

---

## Part C: Research Branches

### C1. Data Model

Add to `types/case.ts`:

```typescript
export interface ResearchBranch {
  id: string;                          // e.g. "RB-001"
  question: string;                    // The driving question, e.g. "How fast was the Tic Tac actually traveling?"
  status: "open" | "in_progress" | "resolved";
  priority: "high" | "medium" | "low";
  anchorSection: string;               // Which section this branches from: "timeline" | "evidence" | "witness" | "fact" | "analysis"
  anchorId?: string;                   // Specific item ID it's attached to (e.g. "VF-007", timeline event index)
  anchorText: string;                  // The specific text/claim that prompted this question
  findings: ResearchFinding[];
  conclusion?: string;                 // Summary conclusion when resolved
  producedFacts?: string[];            // IDs of any VerifiedFacts this branch produced
  updatedProbabilities?: string[];     // Hypothesis names whose probabilities changed
  createdBy: string;                   // "Nemo", "Claude", or investigator name
  createdAt: string;                   // ISO date
}

export interface ResearchFinding {
  id: string;
  type: "source" | "calculation" | "analysis" | "contradiction" | "confirmation";
  content: string;                     // The finding text
  source?: string;                     // Where this came from
  sourceUrl?: string;                  // Link if available
  addedBy: string;                     // Who added this finding
  addedAt: string;
}
```

Add to `CaseWorkspaceData`:
```typescript
researchBranches?: ResearchBranch[];
```

### C2. Visual Indicators — Branch Markers on Sections

This is the key UX innovation. Research branches should appear **at the edge of the content** where they're anchored, like thread marks in the margin of a document.

**Branch marker design:**
- Small vertical line (3px wide, 24px tall) in `var(--purple)` positioned at the right edge of the relevant section/card
- Next to it: a small count badge if multiple branches exist at that anchor
- On hover: shows the branch question as a tooltip
- On click: expands a branch panel inline (see C3)

**Where markers appear:**
- On a VerifiedFact card → marker at right edge of that fact
- On a timeline event → marker at right edge of that event
- On an evidence card → marker at right edge
- On an AI analysis card → marker at right edge
- The marker only appears if there's a `ResearchBranch` whose `anchorSection` + `anchorId` matches that item

**Implementation approach:**
- Each section component (TimelineSection, EvidenceSection, VerifiedFacts, AIAnalysisSection) receives an optional `branches` prop filtered to its relevant branches
- Each item checks if any branch's `anchorId` matches its ID/index
- If yes, render a `<BranchMarker>` component at the right edge

### C3. Inline Branch Expansion

When a branch marker is clicked, the branch content expands **inline directly below the anchored item**, pushing subsequent content down. This keeps the reader in context — they can see the original claim and the investigation thread together.

**Expanded branch layout:**
```
┌──────────────────────────────────────────────────────┐
│ ◆ Research Branch RB-001                    [open] ▴ │
│                                                      │
│ "How fast was the Tic Tac actually traveling?"       │
│ Anchored to: VF-007 (60-mile relocation in seconds)  │
│ Started by: Claude · Apr 2, 2026                     │
│                                                      │
│ ── Findings ──────────────────────────────────────── │
│                                                      │
│ ◦ SCU Analysis (Knuth et al., 2019)         [source] │
│   "Frame-by-frame analysis estimates                 │
│    acceleration between 75g and 5,400g.              │
│    Lower bound assumes maximum radar                 │
│    sampling interval. Upper bound assumes             │
│    instantaneous acceleration."                      │
│   Source: Entropy (MDPI), doi:10.3390/e21100939      │
│                                                      │
│ ◦ Mick West Counter-Analysis            [analysis]   │
│   "Skeptic Mick West argues the object               │
│    may have been at a different range than            │
│    assumed, which would reduce the speed              │
│    estimate significantly. However, this              │
│    requires the radar data to be misread."            │
│   Source: Metabunk forum analysis                    │
│                                                      │
│ ◦ Radar Sampling Rate Constraint      [calculation]  │
│   "The SPY-1B radar refreshes every ~6               │
│    seconds for track-while-scan. If the              │
│    object moved 60 miles between two scans,          │
│    the minimum speed is ~36,000 mph. If it           │
│    moved between adjacent scans (worst case),        │
│    minimum is ~10,000 mph."                          │
│   Added by: Claude                                   │
│                                                      │
│ ── Conclusion ────────────────────────────────────── │
│   Not yet resolved. Speed estimates range from       │
│   ~10,000 mph (conservative) to 46,000+ mph          │
│   (instantaneous). All estimates exceed Mach 10,     │
│   well beyond any known technology.                  │
│                                                      │
│ → Updated VF-007 confidence to "high" (was disputed) │
│ → "Unknown Tech" probability unchanged (62%)         │
└──────────────────────────────────────────────────────┘
```

**Design tokens:**
- Branch panel background: `var(--bg)` with left border `3px solid var(--purple)`
- Finding type badges: colored pills like the existing tag system
  - source → blue
  - calculation → gold
  - analysis → purple
  - contradiction → red
  - confirmation → green
- Collapse/expand: click the ▴/▾ toggle or the branch marker again

### C4. Branch Panel in Right Column (Alternative View)

Also add a **"Branches"** tab to the InvestColumn tabs:

```typescript
// Add to tabs array in InvestColumn.tsx:
{ id: "branches", label: "Branches" }
```

This tab shows a **list of all research branches** for the case:
- Sorted by status (in_progress first, then open, then resolved)
- Each entry shows: question, status pill, finding count, anchor reference
- Click an entry → scrolls the main content to the anchored item and expands the branch inline

This gives investigators an overview of all active research threads without having to scroll through the case.

### C5. Populate Case 001 Branches

Add to `case-001-workspace.json`:

```json
"researchBranches": [
  {
    "id": "RB-001",
    "question": "How fast was the Tic Tac actually traveling during the 60-mile relocation?",
    "status": "in_progress",
    "priority": "high",
    "anchorSection": "fact",
    "anchorId": "VF-007",
    "anchorText": "USS Princeton's radar recorded the object relocating from the intercept point to Fravor's CAP point (~60 miles) in seconds.",
    "findings": [
      {
        "id": "RB-001-F1",
        "type": "source",
        "content": "SCU peer-reviewed analysis (Knuth, Powell, Reali, 2019) estimates acceleration between 75g and 5,400g. Lower bound assumes maximum radar sampling interval. Upper bound assumes instantaneous acceleration.",
        "source": "Entropy (MDPI), 2019 — doi:10.3390/e21100939",
        "sourceUrl": "https://doi.org/10.3390/e21100939",
        "addedBy": "Claude",
        "addedAt": "2026-04-02"
      },
      {
        "id": "RB-001-F2",
        "type": "analysis",
        "content": "Skeptic Mick West argues the object may have been at a different range than assumed, which would reduce speed estimates. However, this interpretation requires the AN/SPY-1B radar range data to be fundamentally misread — which contradicts Senior Chief Day's testimony about confirmed track correlation.",
        "source": "Metabunk forum analysis",
        "addedBy": "Claude",
        "addedAt": "2026-04-02"
      },
      {
        "id": "RB-001-F3",
        "type": "calculation",
        "content": "The SPY-1B refreshes approximately every 6 seconds in track-while-scan mode. If the Tic Tac moved 60 miles between two consecutive scans: 60 miles / 6 seconds = 36,000 mph (~Mach 47). If it took two scan cycles (12 seconds): 18,000 mph (~Mach 23). All scenarios exceed any known aerospace technology by orders of magnitude.",
        "addedBy": "Claude",
        "addedAt": "2026-04-02"
      }
    ],
    "conclusion": null,
    "createdBy": "Claude",
    "createdAt": "2026-04-02"
  },
  {
    "id": "RB-002",
    "question": "What was the cross-shaped water disturbance, and what could create that pattern?",
    "status": "open",
    "priority": "medium",
    "anchorSection": "timeline",
    "anchorId": "2",
    "anchorText": "Both crews spot a cross-shaped disturbance in the water — whitewater the size of a 737.",
    "findings": [
      {
        "id": "RB-002-F1",
        "type": "source",
        "content": "Fravor described the disturbance as looking like 'something was just below the surface.' The Tic Tac was hovering approximately 50 feet above this disturbance. When Fravor descended to investigate, the Tic Tac appeared to respond to his approach.",
        "source": "CDR Fravor — Lex Fridman Podcast #122 (timestamps 14:22–31:05)",
        "addedBy": "Claude",
        "addedAt": "2026-04-02"
      }
    ],
    "createdBy": "Claude",
    "createdAt": "2026-04-02"
  },
  {
    "id": "RB-003",
    "question": "Who collected the data tapes from USS Princeton, and where did they go?",
    "status": "open",
    "priority": "high",
    "anchorSection": "fact",
    "anchorId": "VF-005",
    "anchorText": "Radar data tapes and FLIR recordings were collected from USS Princeton by unidentified personnel after the encounter.",
    "findings": [
      {
        "id": "RB-003-F1",
        "type": "source",
        "content": "PO Patrick 'PJ' Hughes stated that two men in plain clothes with no unit patches arrived by helicopter, asked for the radar data tapes, and left. No receipts were provided. No chain of custody documentation exists.",
        "source": "PJ Hughes — multiple interviews and documentary appearances",
        "addedBy": "Claude",
        "addedAt": "2026-04-02"
      },
      {
        "id": "RB-003-F2",
        "type": "contradiction",
        "content": "The DoD has not confirmed or denied this data collection event. FOIA requests for chain-of-custody records have returned 'no responsive documents' — which could mean the records don't exist or are classified.",
        "source": "The Black Vault FOIA archive",
        "addedBy": "Claude",
        "addedAt": "2026-04-02"
      }
    ],
    "createdBy": "Nemo",
    "createdAt": "2026-04-02"
  }
]
```

### C6. Populate Case 002 Branches

Add to `case-002-workspace.json`:

```json
"researchBranches": [
  {
    "id": "RB-001",
    "question": "Were fighters actually scrambled from Luke AFB on March 13, 1997?",
    "status": "open",
    "priority": "high",
    "anchorSection": "question",
    "anchorId": "Q02",
    "anchorText": "Were fighters scrambled from Luke AFB?",
    "findings": [
      {
        "id": "RB-001-F1",
        "type": "source",
        "content": "An unverified NUFORC report claims F-15Cs were launched from Luke AFB and that radar went to 'white noise' during the encounter. Luke AFB officially denied any activity that night.",
        "source": "NUFORC report archive",
        "addedBy": "Claude",
        "addedAt": "2026-04-02"
      },
      {
        "id": "RB-001-F2",
        "type": "analysis",
        "content": "If true, this would be the single most important piece of evidence in the case — it would mean the military detected the object on radar AND responded with fighters. A FOIA request for Luke AFB flight logs and scramble orders for March 13, 1997 has been identified as a high-priority next step.",
        "addedBy": "Claude",
        "addedAt": "2026-04-02"
      }
    ],
    "createdBy": "Claude",
    "createdAt": "2026-04-02"
  },
  {
    "id": "RB-002",
    "question": "Can the star-occlusion testimony definitively distinguish a solid craft from a tight formation?",
    "status": "in_progress",
    "priority": "high",
    "anchorSection": "fact",
    "anchorId": "VF-008",
    "anchorText": "Multiple Prescott Valley witnesses independently reported stars being occluded by the V-formation.",
    "findings": [
      {
        "id": "RB-002-F1",
        "type": "source",
        "content": "The Tim Ley family provided the most detailed star-occlusion account. They reported watching the V-formation pass directly overhead and seeing stars disappear behind what appeared to be a continuous solid surface between the lights — not individual objects blocking stars sequentially.",
        "source": "Tim Ley family testimony — multiple documentary interviews",
        "addedBy": "Claude",
        "addedAt": "2026-04-02"
      },
      {
        "id": "RB-002-F2",
        "type": "analysis",
        "content": "The 'illusory contour' effect (Kanizsa triangle) can make closely-spaced lights appear as a solid shape. However, this perceptual illusion typically does not cause observers to report stars disappearing — it creates a perceived edge, not opacity. The star-occlusion testimony, if accurate, is incompatible with a formation of separate aircraft.",
        "addedBy": "Claude",
        "addedAt": "2026-04-02"
      }
    ],
    "createdBy": "Claude",
    "createdAt": "2026-04-02"
  }
]
```

---

## File Structure Summary

```
types/
  case.ts                                ← MODIFY (add VerifiedFact, HypothesisProbability, ResearchBranch interfaces)
components/workspace/
  VerifiedFacts.tsx                      ← NEW
  BranchMarker.tsx                       ← NEW (small margin indicator)
  ResearchBranchPanel.tsx                ← NEW (expandable inline branch)
  CaseContent.tsx                        ← MODIFY (add VerifiedFacts, pass branches to sections)
  InvestColumn.tsx                       ← MODIFY (add probability panel to ACH tab, add Branches tab)
  TimelineSection.tsx                    ← MODIFY (accept branches prop, render markers)
  EvidenceSection.tsx                    ← MODIFY (accept branches prop, render markers)
  AIAnalysisSection.tsx                  ← MODIFY (accept branches prop, render markers)
data/
  case-001-workspace.json                ← MODIFY (add verifiedFacts, hypothesisProbabilities, researchBranches)
  case-002-workspace.json                ← MODIFY (add verifiedFacts, hypothesisProbabilities, researchBranches)
styles/
  globals.css                            ← MODIFY (add styles for facts, probabilities, branches)
```

---

## CSS Guidance

### Verified Facts
- Grid: `display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 10px;`
- Fact card: `background: var(--bg); border: 1px solid var(--border); border-radius: 4px; padding: 12px;`
- Confidence badges: confirmed → `background: var(--green-soft); color: var(--green);` / high → gold / disputed → orange-red
- Category dot: 8px circle, colored by category

### Hypothesis Probabilities
- Bar: `height: 6px; border-radius: 3px; background: var(--border);` with inner fill div
- Leading hypothesis bar: `background: var(--gold);`
- Others: `background: var(--text-3); opacity: 0.5;`
- Trend arrows: ▲ green, ▼ red, ● neutral
- Reasoning text: `font-size: 9px; color: var(--text-2);` — collapsible

### Research Branches
- Branch marker: `width: 3px; height: 24px; background: var(--purple); border-radius: 2px; position: absolute; right: -8px;`
- Expanded panel: `border-left: 3px solid var(--purple); background: var(--bg); padding: 16px; margin: 8px 0;`
- Finding type pills: same sizing as `tag-pill` class, colored by type
- Conclusion block: `border-top: 1px dashed var(--border); padding-top: 8px; font-style: italic;`

---

## Definition of Done

- [ ] `types/case.ts` updated with `VerifiedFact`, `HypothesisProbability`, `ResearchBranch`, `ResearchFinding` interfaces
- [ ] `VerifiedFacts.tsx` renders fact cards with categories, confidence badges, and source counts
- [ ] Facts section appears between Hero/Summary and Timeline in `CaseContent.tsx`
- [ ] ACH tab shows probability bars with trend indicators, contradiction counts, and collapsible reasoning
- [ ] Probabilities sum to 100% and sort descending
- [ ] Branch markers appear at the edge of relevant sections when a branch is anchored there
- [ ] Clicking a branch marker expands the research thread inline below the anchored item
- [ ] "Branches" tab in InvestColumn shows all branches with status and links to anchors
- [ ] Both workspace JSONs populated with verifiedFacts, hypothesisProbabilities, and researchBranches
- [ ] Fact cards are clickable → scroll to related evidence/timeline items
- [ ] `npm run build` passes cleanly

---

## Builder Notes

| Date | Note |
|------|------|
| 2026-04-02 | Part A complete: VerifiedFact type + VerifiedFacts.tsx component + case-001/002 data. Placed between Hero/Summary and Timeline. Grid layout with category dots, confidence badges, source lists, disputed warnings. Fact cards scroll to related evidence/timeline on click. |
| 2026-04-02 | Part B complete: HypothesisProbability type + probability panel added below ACH matrix in InvestColumn. Bars sorted descending, leading hypothesis gold, others muted. Trend arrows, contradiction counts, collapsible reasoning. Sums to 100%. Both cases populated. |
| 2026-04-02 | Part C complete: ResearchBranch + ResearchFinding types. BranchMarker.tsx (purple edge indicators with tooltips), ResearchBranchPanel.tsx (inline expandable). Markers wired into TimelineSection, EvidenceSection, AIAnalysisSection, VerifiedFacts. "Branches" tab added to InvestColumn with status-sorted list. Both cases populated. |
| 2026-04-02 | Sidebar updated: "Verified Facts" added to TOC, "Branches" added to Investigation tools. Scroll spy updated to include verified-facts section. |
| 2026-04-02 | Next.js 16.2.1 docs reviewed. Added "use client" to CaseContent.tsx (now uses useState/useCallback for branch expansion state). Build passes cleanly with Turbopack. No deprecation warnings. |

# Phase 4 — Media Enrichment

> **Status:** Open
> **Depends on:** Phase 3B (shipped), Evidence Download (shipped)
> **Goal:** Surface all downloaded images, video, and maps in the UI across three layers: hero images, inline card media, and a dedicated evidence gallery with embedded video playback.

---

## Context

We now have **18 evidence assets** across both cases:

### Case 001 — USS Nimitz (14 files)
| File | Type | Use |
|------|------|-----|
| `flir1-acquisition.png` | FLIR still | Gallery + Evidence card inline |
| `flir1-rotation.png` | FLIR still | Gallery |
| `flir1-center.png` | FLIR still | **Hero image** + Gallery |
| `flir1-lock-loss.png` | FLIR still | Gallery |
| `gimbal-frame.png` | FLIR still | Gallery |
| `gofast-frame.png` | FLIR still | Gallery |
| `spy1b-radar-array.jpg` | Reference photo | Evidence card inline (SPY-1B card) |
| `fa18f-super-hornet.jpg` | Reference photo | Evidence card inline (visual contact card) |
| `scu-trajectory.png` | SCU diagram | Gallery (AI Analysis section too) |
| `scu-acceleration.png` | SCU diagram | Gallery |
| `scu-radar-track.png` | SCU diagram | Gallery |
| `scu-gforce-comparison.png` | SCU diagram | Gallery |
| `fravor-testimony-page1.png` | Document scan | Gallery |
| `nimitz-socal-oparea-map.svg` | Original map | Hero background or Gallery lead |
| `flir1.mp4` | Video | Gallery — embedded player |
| `gimbal.mp4` | Video | Gallery — embedded player |
| `gofast.mp4` | Video | Gallery — embedded player |

### Case 002 — Phoenix Lights (3 files)
| File | Type | Use |
|------|------|-----|
| `phoenix-lights-transit-map.svg` | Original map | **Hero image** + Gallery lead |
| `goldwater-range-map.png` | Reference map | Gallery |
| `symington-press-conference.jpg` | Portrait | Witness card inline (Symington) |

---

## Deliverable 1: Data Model Updates

### 1A. Add media fields to `types/case.ts`

Add optional image/media fields to existing interfaces so the JSON data can reference assets:

```typescript
// Add to CaseWorkspaceData
heroImage?: string;           // Path relative to /public, e.g. "/images/cases/001/flir1-center.png"
heroImageAlt?: string;        // Alt text for accessibility
heroImageAttribution?: string; // e.g. "U.S. Department of Defense"

// New interface for the gallery
export interface GalleryItem {
  id: string;
  type: "image" | "video" | "document" | "map";
  src: string;                // Path relative to /public
  thumbnail?: string;         // Optional smaller version (or same as src)
  title: string;
  caption: string;
  attribution: string;
  license: string;
  category: "flir" | "sensor" | "witness" | "document" | "map" | "reference" | "analysis";
  relatedEvidence?: string;   // Links to an evidence card title
  relatedWitness?: string;    // Links to a witness name
}

// Add to CaseWorkspaceData
gallery?: GalleryItem[];
```

### 1B. Add optional `image` field to existing card interfaces

```typescript
// Add to EvidenceCard
image?: string;         // Thumbnail path
imageAlt?: string;

// Add to WitnessCard
image?: string;         // Portrait or related image path
imageAlt?: string;
```

### 1C. Add `heroImage` field to the home page case card data

The home page active card for Case 001 currently has a CSS-only `mini-flir` div. We'll replace that with the actual FLIR1 image. For this, the data comes from the workspace JSON, so the `heroImage` field above covers it. But the home page component needs to load it — see Deliverable 4.

---

## Deliverable 2: New Component — `EvidenceGallery.tsx`

Create `components/workspace/EvidenceGallery.tsx`

### Layout
- Goes between `EvidenceSection` and `WitnessSection` in `CaseContent.tsx`
- Section label: **"Evidence Gallery"**
- **Grid layout**: responsive thumbnail grid (3 columns on desktop, 2 on tablet, 1 on mobile)
- Each thumbnail shows: image, title overlay at bottom, category pill (top-left)
- Videos show a play icon overlay on their thumbnail (use first frame or a poster image)

### Lightbox
- Click any thumbnail → opens a **lightbox overlay** (full-viewport dark overlay, centered media)
- Lightbox shows: large image (or video player), title, caption, attribution line, license badge
- Navigation: left/right arrows or keyboard arrows to browse
- Close: X button, Escape key, or click outside
- For videos: HTML5 `<video>` element with `controls` attribute (play/pause, scrub, volume, fullscreen)

### Category Filtering
- Row of filter pills above the grid: "All", "FLIR/IR", "Sensor", "Analysis", "Maps", "Documents", "Reference"
- Click a category to filter the grid
- "All" is default

### Attribution Bar
- Below each item (in both grid and lightbox): small text line with attribution and license
- Format: `📷 U.S. Department of Defense · Public Domain` or `📷 Gage Skidmore · CC BY-SA`

### Technical Notes
- Use Next.js `<Image>` component for optimized loading (with `width`/`height` or `fill` + `sizes`)
- Videos: use `<video>` with `preload="metadata"` and a poster frame (the extracted still)
- Lightbox should trap focus for accessibility
- Gallery is optional — if `gallery` array is empty or missing, don't render the section

---

## Deliverable 3: Inline Media on Existing Cards

### Evidence Cards (`EvidenceSection.tsx`)
- If an evidence card has an `image` field, render a small thumbnail (120×80px) on the right side of the card
- The card layout shifts from single-column text to a two-column `[text | thumbnail]` layout
- Click the thumbnail → opens the gallery lightbox to that item

### Witness Cards (`WitnessSection.tsx`)
- If a witness card has an `image` field, render a small circular or rounded-square image next to the initials avatar
- For Symington (Case 002): show the portrait next to his name
- The existing initials avatar becomes a fallback when no image is provided

### Timeline Events (`TimelineSection.tsx`)
- No changes for now. Timeline stays text-focused. The gallery covers all media display needs.

---

## Deliverable 4: Hero Section Enhancement

### Case Workspace Page (`HeroSection.tsx`)
- If `heroImage` exists in the workspace data, render it as a wide banner image behind or below the case metadata
- Style: full-width within the content area, slight border radius, subtle shadow
- For Case 001: `flir1-center.png` (the iconic Tic Tac shape)
- For Case 002: `phoenix-lights-transit-map.svg` (the V-formation map)
- Attribution line below the image in small text
- The image should be above the Executive Summary, below the tags

### Home Page Active Card (`app/page.tsx`)
- Replace the existing CSS-only `mini-flir` div (lines 112-119) with the actual `flir1-center.png` image
- Keep the FLIR overlay aesthetic (dark background, grid lines) but use the real image as the base
- For Case 002 when it becomes an active card: use the transit map SVG

---

## Deliverable 5: Populate the JSON Data

### `case-001-workspace.json` additions
```json
{
  "heroImage": "/images/cases/001/flir1-center.png",
  "heroImageAlt": "FLIR1 infrared video still showing the Tic Tac object",
  "heroImageAttribution": "U.S. Department of Defense / NAVAIR",
  "gallery": [
    {
      "id": "g-001",
      "type": "video",
      "src": "/media/cases/001/flir1.mp4",
      "thumbnail": "/images/cases/001/flir1-center.png",
      "title": "FLIR1 — \"Tic Tac\" Infrared Video",
      "caption": "76-second infrared video captured by LT Chad Underwood's ATFLIR pod. Shows acquisition, tracking, object rotation, and apparent lock break. The only declassified sensor footage from the 2004 Nimitz encounter.",
      "attribution": "U.S. Department of Defense / NAVAIR",
      "license": "Public Domain",
      "category": "flir",
      "relatedEvidence": "FLIR1 Infrared Video"
    },
    {
      "id": "g-002",
      "type": "image",
      "src": "/images/cases/001/flir1-acquisition.png",
      "title": "FLIR1 — First Acquisition",
      "caption": "First clear acquisition of the Tic Tac object by the ATFLIR pod.",
      "attribution": "U.S. Department of Defense / NAVAIR",
      "license": "Public Domain",
      "category": "flir"
    },
    {
      "id": "g-003",
      "type": "image",
      "src": "/images/cases/001/flir1-rotation.png",
      "title": "FLIR1 — Object Rotation",
      "caption": "The object rotates on its longitudinal axis — a behavior inconsistent with any known aircraft or ballistic trajectory.",
      "attribution": "U.S. Department of Defense / NAVAIR",
      "license": "Public Domain",
      "category": "flir"
    },
    {
      "id": "g-004",
      "type": "image",
      "src": "/images/cases/001/flir1-center.png",
      "title": "FLIR1 — Tic Tac Shape",
      "caption": "Object centered in frame showing the characteristic elongated oval (\"Tic Tac\") shape. No visible wings, exhaust, or control surfaces.",
      "attribution": "U.S. Department of Defense / NAVAIR",
      "license": "Public Domain",
      "category": "flir"
    },
    {
      "id": "g-005",
      "type": "image",
      "src": "/images/cases/001/flir1-lock-loss.png",
      "title": "FLIR1 — Lock Loss",
      "caption": "Final moments of the FLIR1 footage. The ATFLIR pod appears to lose lock on the object as it accelerates beyond tracking capability.",
      "attribution": "U.S. Department of Defense / NAVAIR",
      "license": "Public Domain",
      "category": "flir"
    },
    {
      "id": "g-006",
      "type": "video",
      "src": "/media/cases/001/gimbal.mp4",
      "thumbnail": "/images/cases/001/gimbal-frame.png",
      "title": "GIMBAL — Rotating Object (2015)",
      "caption": "USS Roosevelt encounter, 2015. Object appears to rotate against the wind. Cross-case reference — officially released alongside FLIR1.",
      "attribution": "U.S. Department of Defense / NAVAIR",
      "license": "Public Domain",
      "category": "flir",
      "relatedEvidence": "Cross-Case: GIMBAL Video"
    },
    {
      "id": "g-007",
      "type": "video",
      "src": "/media/cases/001/gofast.mp4",
      "thumbnail": "/images/cases/001/gofast-frame.png",
      "title": "GOFAST — High-Speed Object (2015)",
      "caption": "USS Roosevelt encounter, 2015. Object tracks at high speed against ocean background. Cross-case reference.",
      "attribution": "U.S. Department of Defense / NAVAIR",
      "license": "Public Domain",
      "category": "flir"
    },
    {
      "id": "g-008",
      "type": "image",
      "src": "/images/cases/001/spy1b-radar-array.jpg",
      "title": "AN/SPY-1B Radar Arrays — Ticonderoga-class Cruiser",
      "caption": "The AN/SPY-1B phased-array radar system aboard USS Princeton tracked anomalous contacts for two weeks before the visual encounter. These octagonal panels provide 360° coverage.",
      "attribution": "U.S. Navy",
      "license": "Public Domain",
      "category": "sensor",
      "relatedEvidence": "AN/SPY-1B Radar Tracking"
    },
    {
      "id": "g-009",
      "type": "image",
      "src": "/images/cases/001/fa18f-super-hornet.jpg",
      "title": "F/A-18F Super Hornet — VFA-41 Black Aces",
      "caption": "The aircraft type flown by CDR David Fravor and LCDR Alex Dietrich during the intercept. VFA-41 'Black Aces' were embarked on USS Nimitz.",
      "attribution": "U.S. Navy",
      "license": "Public Domain",
      "category": "reference",
      "relatedWitness": "CDR David Fravor"
    },
    {
      "id": "g-010",
      "type": "image",
      "src": "/images/cases/001/scu-trajectory.png",
      "title": "SCU Analysis — Trajectory Reconstruction",
      "caption": "Forensic trajectory reconstruction from the 2019 SCU peer-reviewed analysis (Knuth, Powell, Reali). Published in Entropy (MDPI).",
      "attribution": "Scientific Coalition for UAP Studies (SCU), 2019",
      "license": "Open Access (MDPI)",
      "category": "analysis"
    },
    {
      "id": "g-011",
      "type": "image",
      "src": "/images/cases/001/scu-acceleration.png",
      "title": "SCU Analysis — Acceleration Estimates",
      "caption": "Estimated acceleration range: 75g to 5,400g depending on assumptions. Any value in this range exceeds known aerospace technology by orders of magnitude.",
      "attribution": "Scientific Coalition for UAP Studies (SCU), 2019",
      "license": "Open Access (MDPI)",
      "category": "analysis"
    },
    {
      "id": "g-012",
      "type": "image",
      "src": "/images/cases/001/scu-radar-track.png",
      "title": "SCU Analysis — Radar Track Observations",
      "caption": "Radar data analysis from the AN/SPY-1B tracking data. Shows contact behavior patterns over the two-week observation period.",
      "attribution": "Scientific Coalition for UAP Studies (SCU), 2019",
      "license": "Open Access (MDPI)",
      "category": "analysis"
    },
    {
      "id": "g-013",
      "type": "image",
      "src": "/images/cases/001/scu-gforce-comparison.png",
      "title": "SCU Analysis — G-Force Comparison",
      "caption": "Comparison of estimated Tic Tac acceleration against known aircraft and spacecraft capabilities. The Tic Tac's performance exceeds every reference vehicle.",
      "attribution": "Scientific Coalition for UAP Studies (SCU), 2019",
      "license": "Open Access (MDPI)",
      "category": "analysis"
    },
    {
      "id": "g-014",
      "type": "document",
      "src": "/images/cases/001/fravor-testimony-page1.png",
      "title": "CDR Fravor — Congressional Testimony (Page 1)",
      "caption": "Written statement submitted to the House Oversight Committee, July 26, 2023. Fravor's sworn account of the November 14, 2004 encounter.",
      "attribution": "U.S. House Committee on Oversight and Accountability",
      "license": "Public Domain",
      "category": "document",
      "relatedWitness": "CDR David Fravor"
    },
    {
      "id": "g-015",
      "type": "map",
      "src": "/images/cases/001/nimitz-socal-oparea-map.svg",
      "title": "SOCAL OPAREA — Encounter Location Map",
      "caption": "Reconstructed encounter map showing the W-291 operating area, CSG-11 vessel positions, Fravor's intercept path, and the Tic Tac encounter point ~100nm SW of San Diego.",
      "attribution": "The Meridian Project (original)",
      "license": "Project Original",
      "category": "map"
    }
  ]
}
```

### Evidence card `image` mappings for Case 001
Map these by matching the evidence card `title` field:
- Card with "FLIR" or "Infrared" → `image: "/images/cases/001/flir1-center.png"`
- Card with "Radar" or "SPY-1" → `image: "/images/cases/001/spy1b-radar-array.jpg"`
- Card with "Visual" or "Pilot" → `image: "/images/cases/001/fa18f-super-hornet.jpg"`

### Witness card `image` mapping for Case 002
- Symington → `image: "/images/cases/002/symington-press-conference.jpg"`

### `case-002-workspace.json` additions
```json
{
  "heroImage": "/images/cases/002/phoenix-lights-transit-map.svg",
  "heroImageAlt": "Phoenix Lights V-formation transit map — Henderson NV to Tucson AZ",
  "heroImageAttribution": "The Meridian Project (original)",
  "gallery": [
    {
      "id": "g-001",
      "type": "map",
      "src": "/images/cases/002/phoenix-lights-transit-map.svg",
      "title": "V-Formation Transit Path — March 13, 1997",
      "caption": "Reconstructed flight path of the Event 1 V-formation from Henderson NV through Prescott, Phoenix, to Tucson. ~300 miles in ~50 minutes. Based on 700+ witness reports.",
      "attribution": "The Meridian Project (original)",
      "license": "Project Original",
      "category": "map"
    },
    {
      "id": "g-002",
      "type": "image",
      "src": "/images/cases/002/goldwater-range-map.png",
      "title": "Barry Goldwater Air Force Range — Land Tenure Map",
      "caption": "The training area where Operation Snowbird A-10s operated. Maryland ANG units dropped LUU-2B/B flares here during the Event 2 timeframe (10 PM).",
      "attribution": "U.S. Government",
      "license": "Public Domain",
      "category": "map"
    },
    {
      "id": "g-003",
      "type": "image",
      "src": "/images/cases/002/symington-press-conference.jpg",
      "title": "Governor Fife Symington III",
      "caption": "Arizona Governor who witnessed the V-formation from Squaw Peak. Initially mocked the incident at a 1997 press conference, then admitted the truth 10 years later: 'It was otherworldly.'",
      "attribution": "Gage Skidmore / CC BY-SA",
      "license": "CC BY-SA",
      "category": "witness",
      "relatedWitness": "Gov. Fife Symington III"
    }
  ]
}
```

---

## Deliverable 6: CSS Additions

Add styles to `styles/globals.css` for the new components. Key design tokens to use:

- Gallery grid: `display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 12px;`
- Thumbnail: `border-radius: 4px; border: 1px solid var(--border);` with hover: `box-shadow: 0 2px 8px rgba(0,0,0,0.12);`
- Lightbox overlay: `background: rgba(0,0,0,0.85); backdrop-filter: blur(4px);`
- Category pills: same style as existing `tag-pill` class
- Video play overlay: centered white triangle on semi-transparent dark circle
- Hero image: `width: 100%; max-height: 300px; object-fit: cover; border-radius: 6px;`
- Attribution text: `font-size: 9px; color: var(--text-3); font-family: var(--mono);`
- Inline card thumbnails: `width: 120px; height: 80px; object-fit: cover; border-radius: 4px; flex-shrink: 0;`

Follow the existing design system: warm neutrals, `var(--bg)`, `var(--border)`, `var(--gold)` for accents.

---

## Deliverable 7: Wire It Up in `CaseContent.tsx`

Update the component ordering:
```tsx
<HeroSection data={data} getCount={getCount} />
<TimelineSection events={data.timeline} getCount={getCount} />
<EvidenceSection cards={data.evidence} selectedCard={selectedCard} selectCard={selectCard} />
<EvidenceGallery items={data.gallery || []} />     {/* ← NEW */}
<WitnessSection cards={data.witnesses} selectedCard={selectedCard} selectCard={selectCard} />
<AIAnalysisSection cards={data.aiAnalysis} selectedCard={selectedCard} selectCard={selectCard} />
<QuestionsSection questions={data.openQuestions} />
```

---

## Definition of Done

- [ ] `types/case.ts` updated with `GalleryItem`, `heroImage`, and card image fields
- [ ] `EvidenceGallery.tsx` created with thumbnail grid, lightbox, video player, and category filters
- [ ] `HeroSection.tsx` renders hero image when available
- [ ] `EvidenceSection.tsx` shows inline thumbnails when cards have `image` field
- [ ] `WitnessSection.tsx` shows inline images when cards have `image` field
- [ ] `CaseContent.tsx` includes `EvidenceGallery` in the render order
- [ ] Both workspace JSONs populated with `heroImage`, `gallery`, and card image fields
- [ ] Home page active card uses real FLIR1 image instead of CSS-only `mini-flir`
- [ ] All images use `alt` text for accessibility
- [ ] All media includes attribution line
- [ ] Videos play via embedded HTML5 `<video>` with controls
- [ ] Lightbox is keyboard-navigable (arrows, Escape)
- [ ] `npm run build` passes cleanly

---

## Builder Notes

| Date | Note |
|------|------|
| 2026-03-23 | D1: Added `GalleryItem` interface, `heroImage`/`heroImageAlt`/`heroImageAttribution` to `CaseWorkspaceData`, `image`/`imageAlt` to `EvidenceCard` and `WitnessCard` |
| 2026-03-23 | D5: Populated both JSON files — heroImage, gallery arrays (15 items for 001, 3 for 002), evidence card images (SPY-1B + FLIR1 for 001), Symington portrait for 002 witness |
| 2026-03-23 | D6: Added CSS for `.hero-image-wrap`, `.gallery-grid`, `.gallery-thumb`, `.lightbox-overlay`, `.card-thumb`, `.witness-photo`, responsive breakpoints |
| 2026-03-23 | D2: Created `EvidenceGallery.tsx` — thumbnail grid, category filter pills, lightbox with keyboard nav (arrows/Escape), video player with `<video controls>`, attribution lines |
| 2026-03-23 | D3: Updated `EvidenceSection.tsx` with inline 120x80 thumbnails (flex layout), `WitnessSection.tsx` with circular portrait fallback to initials avatar |
| 2026-03-23 | D4: `HeroSection.tsx` renders hero image with Next.js `<Image>` + attribution. Home page `mini-flir` now uses real `flir1-center.png` under the grid/crosshair overlay |
| 2026-03-23 | D7: Wired `EvidenceGallery` into `CaseContent.tsx` between Evidence and Witnesses (per user request: gallery shows first after evidence) |

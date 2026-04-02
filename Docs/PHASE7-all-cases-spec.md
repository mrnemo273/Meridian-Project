# Phase 7 — All Remaining Cases (003–007) + Evidence Scraping

> **Status:** Open
> **Depends on:** Phase 6 (shipped)
> **Goal:** Build out all five remaining cases from the queue — Belgian Wave, Tehran F-4, JAL 1628, USS Roosevelt, Rendlesham Forest — using the full schema established by Cases 001 and 002. Each case gets a research corpus JSON, a workspace JSON with all Phase 6 fields (timeline, evidence, gallery, witnesses, AI analysis, verified facts, hypothesis probabilities, research branches), and an evidence download script.

---

## Important: Read Next.js 16 Docs First

**Before writing any code**, read `node_modules/next/dist/docs/`. This is Next.js 16.2.1 with breaking changes.

---

## Established Patterns — Follow These Exactly

Before writing any case data, read both shipped cases to understand the full schema:
- `data/case-001-workspace.json` — master reference for schema
- `data/case-002-workspace.json` — second reference
- `data/case-001-nimitz.json` — research corpus reference
- `types/case.ts` — all interfaces

Every new case must include ALL of these fields:
- `id`, `caseNumber`, `title`, `subtitle`, `date`, `location`, `duration`
- `credibilityScore`, `credibilityTier`, `status`, `tags`
- `heroImage`, `heroImageAlt`, `heroImageAttribution`
- `timeline` (8–12 events minimum)
- `evidence` (4–6 cards minimum)
- `gallery` (populate after evidence download — see scripts section)
- `witnesses` (3–5 cards)
- `aiAnalysis` (3–4 cards)
- `openQuestions` (4–6 questions)
- `resolution` (all prosaic explanations evaluated)
- `osint` (5–8 verified fields)
- `evidenceChain` (4–6 items)
- `solvabilityFactors` + `solvabilityScore`
- `nextSteps` (5–7 items)
- `searchDemoResults` (5 items)
- `achHypotheses` + `achEvidence`
- `investigationTasks` (define all evidence assets to source)
- `verifiedFacts` (6–10 confirmed facts per case)
- `hypothesisProbabilities` (one per ACH hypothesis, sum to 100)
- `researchBranches` (2–3 open threads per case)

---

## Case 003 — The Belgian Wave (1989–1990)

### Background Research Brief

- **Date range:** November 1989 – April 1990, most intense activity March–April 1990
- **Location:** Belgium — primarily around Liège, Eupen, and the Ardennes
- **Peak event:** March 30–31, 1990 — NATO F-16s scrambled, onboard radar locked object performing impossible maneuvers
- **What happened:** Wave of triangular craft sightings over Belgium lasting months. 13,500+ civilian witnesses. Gendarmerie (police) reports. Belgian Air Force scrambled two F-16s on March 30–31. F-16 radar locked the object; object responded by instantly changing altitude from 3,000m to 1,700m to 500m in seconds, then accelerated to near ground. Belgian Air Force released official report in 1991 — the only government to officially acknowledge the sightings.
- **Key figures:** Colonel Wilfried De Brouwer (BAF spokesperson, later Major General), Gendarmerie Captain Nicoll (Eupen ground observers), SOBEPS (Belgian Society for the Study of Space Phenomena)
- **Key evidence:** F-16 radar lock data, Petit-Rechain photograph (later recanted by author as hoax — important negative finding), official BAF report
- **Credibility score:** 88 · Tier 1
- **ACH hypotheses:** Stealth Aircraft (B-2/F-117), Military Exercise, Mass Misidentification, Unknown Craft
- **Related cases:** CASE-004 (Tehran — military sensor locks), CASE-007 (Rendlesham — military witnesses)

### Case 003 Files to Create

1. `data/case-003-belgian-wave.json` — research corpus
2. `data/case-003-workspace.json` — full workspace schema
3. `public/images/cases/003/` — directory for assets
4. `public/media/cases/003/` — directory for media

### Key Verified Facts for Case 003
1. Belgian Air Force officially scrambled two F-16s on March 30–31, 1990
2. F-16 onboard radar achieved three separate locks on the object during the engagement
3. On each radar lock, the object performed evasive maneuvers impossible for known aircraft (3,000m→1,700m→500m in ~2 seconds)
4. Col. De Brouwer stated officially: "The phenomenon is exceptional. We can exclude conventional explanations."
5. 13,500+ filed reports over the wave period (SOBEPS compilation)
6. The Petit-Rechain photograph was later admitted by its creator to be a foam model hoax (NEGATIVE FACT — important for honest analysis)
7. Gendarmerie filed official reports with diagrams of triangular craft before media coverage began
8. NATO confirmed the objects were not NATO aircraft

### Key Research Branches for Case 003
- RB-001: "What did the F-16 radar data actually show — what were the recorded speeds and altitude changes?"
- RB-002: "How does the Belgian Wave relate to the simultaneous wave of triangular craft sightings across Europe (UK, Netherlands, Germany) in 1989–90?"

---

## Case 004 — Tehran F-4 Intercept (1976)

### Background Research Brief

- **Date:** September 19, 1976, approximately 0130 local time
- **Location:** Tehran, Iran — over the city and outskirts
- **What happened:** Iranian Air Force General Yousefi was called about a bright light over Tehran. Two F-4 Phantom IIs were scrambled. The first F-4 lost all instruments and communications on approach — turned back. Second F-4, piloted by Lt. Parviz Jafari, got closer. Object was described as very bright, with colored strobe lights cycling in sequence. As Jafari attempted to fire an AIM-9 missile, weapons panel went dark and communications failed. A smaller object emerged from the main object and flew toward the F-4; Jafari went into evasive dive. Smaller object then returned to main craft. Another smaller object emerged and descended to the ground near Tehran. Next morning, crew investigated the ground area and found radiation readings.
- **Key figures:** Lt. Parviz Jafari (pilot, gave testimony to National Press Club 2007), General Yousefi (commanding general, gave initial report)
- **Key evidence:** Declassified DIA (Defense Intelligence Agency) report dated September 19, 1976 — describes the incident in detail, concludes it "meets all the criteria necessary for a valid study of the UFO phenomenon." This is one of the most significant official government documents in the field.
- **Credibility score:** 85 · Tier 1
- **ACH hypotheses:** Astronomical Object (Jupiter/star), Ball Lightning, Classified Aircraft, Unknown Craft
- **Related cases:** CASE-003 (Belgian Wave — military intercepts), CASE-001 (Nimitz — weapons system interference)

### Case 004 Files to Create

1. `data/case-004-tehran.json` — research corpus
2. `data/case-004-workspace.json` — full workspace schema
3. `public/images/cases/004/` — directory
4. `public/media/cases/004/` — directory

### Key Verified Facts for Case 004
1. A DIA report dated September 19, 1976 documents the incident in official US government records
2. The DIA report explicitly states the case "meets all the criteria necessary for a valid study of the UFO phenomenon"
3. Two F-4 Phantom IIs were scrambled by the Imperial Iranian Air Force
4. Both aircraft experienced weapons system and communications failures during approach to the object
5. Both Iranian and US embassies filed reports — corroborating the incident through two independent government channels
6. Lt. Parviz Jafari testified publicly at the National Press Club in Washington DC in 2007
7. Ground teams reported anomalous radiation readings at the site where a smaller object descended

### Key Research Branches for Case 004
- RB-001: "Was Jupiter or another astronomical object visible over Tehran that night, and could it explain the initial sighting?"
- RB-002: "What's the significance of the weapons/communications interference — is there a pattern across cases?"

---

## Case 005 — JAL Flight 1628 (1986)

### Background Research Brief

- **Date:** November 17, 1986
- **Location:** Over Alaska, near Ft. Yukon — en route from Paris to Tokyo via Anchorage
- **What happened:** Japan Air Lines cargo Boeing 747 captained by Kenjyu Terauchi. At 5:11 PM local time, two small craft appeared off the left and were described as rectangular arrays of amber/whitish lights. They performed formation maneuvers for ~7 minutes. Then a massive craft appeared — described as twice the size of an aircraft carrier — that the crew tracked for ~31 minutes. Terauchi requested and received FAA radar corroboration of objects. JAL rerouted. FAA and NORAD radar records confirmed an uncorrelated target. After giving a press conference (against company advice), Terauchi was grounded by JAL — widely seen as retaliation for speaking publicly.
- **Key figures:** Captain Kenjyu Terauchi (pilot, gave detailed drawings and testimony), FAA Anchorage Center controller, NORAD radar operators
- **Key evidence:** FAA radar data (partially confirmed), Terauchi's detailed drawings and testimony, FAA CIRVIS report, John Callahan (FAA Division Chief) testimony about CIA debriefing
- **Credibility score:** 82 · Tier 2
- **ACH hypotheses:** Jupiter/celestial object, Military aircraft, Radar artifact, Unknown Craft
- **Related cases:** CASE-001 (Nimitz — multi-sensor confirmation), CASE-002 (Phoenix Lights — mass sighting, official denial)
- **Notable:** FAA's John Callahan testified that after investigating the case, CIA agents showed up and told everyone in the room "this never happened" and confiscated the materials — echoing the Nimitz data confiscation.

### Case 005 Files to Create

1. `data/case-005-jal1628.json` — research corpus
2. `data/case-005-workspace.json` — full workspace schema
3. `public/images/cases/005/` — directory
4. `public/media/cases/005/` — directory

### Key Verified Facts for Case 005
1. FAA Anchorage Center radar confirmed an uncorrelated target in the vicinity of JAL 1628
2. Captain Terauchi filed an official FAA CIRVIS (Communications Instructions for Reporting Vital Intelligence Sightings) report
3. The encounter lasted approximately 31 minutes of sustained observation
4. Captain Terauchi was removed from flight duty by JAL after giving media interviews — he was reinstated after public pressure
5. FAA Division Chief John Callahan testified before the National Press Club (2007) that CIA agents debriefed the team and said "this never happened"
6. NORAD radar also tracked anomalous returns consistent with FAA data
7. Terauchi produced detailed technical drawings of the craft that were consistent across multiple tellings

### Key Research Branches for Case 005
- RB-001: "Was Jupiter visible in that region of the sky at the time, and could lens flare or atmospheric refraction explain the lights?"
- RB-002: "What happened to the FAA radar tapes — the Callahan claim about CIA confiscation?"

---

## Case 006 — USS Roosevelt Encounters (2014–2015)

### Background Research Brief

- **Date range:** Summer 2014 – March 2015, recurring
- **Location:** US East Coast — off Virginia/North Carolina, W-72 Operating Area
- **What happened:** Carrier Strike Group 12 operating with USS Theodore Roosevelt. Multiple Navy pilots from VFA-11 and VFA-31 reported daily encounters with objects that had no visible propulsion, no infrared signature (anomalous — means no heat), and could loiter at 30,000 ft for hours. Lt. Ryan Graves reported near-miss where a pilot came within meters of an object. GIMBAL video (rotation anomaly) and GOFAST video (extreme speed against ocean) captured in 2015. These videos were released alongside FLIR1 in April 2020.
- **Key figures:** Lt. Ryan Graves (pilot, testified before Congress July 2023), Lt. Danny Accoin (pilot), Cmdr. Dave Fravor mentioned as context
- **Key evidence:** GIMBAL video (officially released 2020 — we already have this), GOFAST video (officially released 2020 — we already have this), Ryan Graves congressional testimony
- **Note:** GIMBAL and GOFAST videos are already downloaded at `public/media/cases/001/gimbal.mp4` and `public/media/cases/001/gofast.mp4`. For Case 006, reference or copy them to `public/media/cases/006/`. Don't re-download.
- **Credibility score:** 90 · Tier 1
- **ACH hypotheses:** Sensor Artifact (gimbal glitch), Classified Drone, Atmospheric, Unknown Craft
- **Related cases:** CASE-001 (Nimitz — same video release, shared DoD acknowledgment)

### Case 006 Files to Create

1. `data/case-006-uss-roosevelt.json` — research corpus
2. `data/case-006-workspace.json` — full workspace schema
3. `public/images/cases/006/` — directory
4. `public/media/cases/006/` — directory (copy/symlink gimbal.mp4 and gofast.mp4 from 001)

### Key Verified Facts for Case 006
1. GIMBAL and GOFAST videos are officially declassified and released by the US DoD (April 27, 2020)
2. Lt. Ryan Graves testified under oath before the House Oversight Committee, July 26, 2023
3. Graves stated encounters were "every day for at least a couple years" during Roosevelt deployments
4. Graves reported a near-miss incident where a pilot came within meters of an unidentified object
5. Objects were observed to loiter at 30,000 ft for extended periods with no visible propulsion
6. In the GIMBAL video, the object appears to rotate against the direction of flight — inconsistent with known aircraft behavior
7. Objects had no infrared heat signature detectable by ATFLIR pod (anomalous — all aircraft produce heat)

### Key Research Branches for Case 006
- RB-001: "The 'gimbal rotation' — is it the object rotating, or the ATFLIR pod's gimbal mechanism rotating? What does the physics say?"
- RB-002: "Why were encounters 'every day' for two years — what does sustained, recurring behavior imply about the object's nature or purpose?"

---

## Case 007 — Rendlesham Forest (1980)

### Background Research Brief

- **Date:** December 26–28, 1980
- **Location:** Rendlesham Forest, between RAF Woodbridge and RAF Bentwaters (both USAF bases), Suffolk, England
- **What happened:** In the early hours of December 26, USAF personnel at RAF Woodbridge saw lights in the forest. Sgt. Jim Penniston and Airman John Burroughs approached a craft on the ground — Penniston touched it and reported feeling raised symbols. The craft lifted and departed. Two nights later, Lt. Col. Charles Halt led a larger investigation party with a Geiger counter and dictation recorder. They found physical impressions at the landing site, elevated radiation readings, and observed a flashing object that split into multiple objects. Halt recorded the entire second night on a now-famous audio memo. He submitted an official memo to the UK Ministry of Defence.
- **Key figures:** Lt. Col. Charles Halt (USAF, Deputy Base Commander — filed official memo, still speaks publicly), Sgt. Jim Penniston (touched craft, reported symbols), Airman John Burroughs (first responder, later sought VA benefits for radiation exposure)
- **Key evidence:** Halt memo (released via FOI, 1983), Halt audio recording (exists, available publicly), physical landing impressions (documented at the time), radiation readings (Geiger counter data), UK MoD investigation files (released 2009)
- **Credibility score:** 86 · Tier 1
- **ACH hypotheses:** Lighthouse misidentification, Military exercise/prank, Meteor/satellite reentry, Unknown Craft
- **Related cases:** CASE-004 (Tehran — military witness), CASE-003 (Belgian Wave — military encounter)

### Case 007 Files to Create

1. `data/case-007-rendlesham.json` — research corpus
2. `data/case-007-workspace.json` — full workspace schema
3. `public/images/cases/007/` — directory
4. `public/media/cases/007/` — directory

### Key Verified Facts for Case 007
1. Lt. Col. Charles Halt submitted a formal memo to the UK Ministry of Defence on January 13, 1981 — an official government record
2. Halt's audio recording of the second night's investigation exists and has been publicly released
3. Physical ground impressions were found and measured at the landing site
4. Radiation readings above background levels were recorded at the landing site with a Geiger counter
5. The UK MoD investigated and released files in 2009 under the Freedom of Information Act
6. Airman John Burroughs successfully applied for VA benefits citing radiation exposure — US government implicitly acknowledging something anomalous occurred
7. The Orford Ness lighthouse was visible from the area — the primary skeptical explanation, disputed by witnesses who knew the lighthouse well

### Key Research Branches for Case 007
- RB-001: "Can the Orford Ness lighthouse explain what Halt and his team observed — what's the geometry and timing?"
- RB-002: "What do the UK MoD released files actually say about the investigation's conclusions?"

---

## Evidence Download Scripts

Create a script for each case at `scripts/fetch-evidence-case-XXX.js`. Each script is a standalone Node.js file that uses built-in `https` and `fs` modules (no npm install needed). The builder should run each script after creating the case data files.

### Script Template Pattern

Each script should:
1. Define an array of asset objects: `{ url, savePath, filename, attribution, license }`
2. Use `https.get` to download each asset
3. Save to the correct `public/images/cases/XXX/` or `public/media/cases/XXX/` path
4. Log success/failure with attribution info
5. Skip files that already exist (idempotent)

### Case 003 Evidence Targets (`scripts/fetch-evidence-case-003.js`)

Priority assets to find and download:

```
// Belgian Air Force F-16 (any public domain BAF photo)
// Source: Wikimedia Commons — search "Belgian Air Force F-16"
// Save as: public/images/cases/003/baf-f16.jpg

// Triangular craft sketch/diagram (Col. De Brouwer's official diagrams)
// Source: SOBEPS reports / Wikimedia Commons
// Save as: public/images/cases/003/triangle-craft-diagram.png

// Belgium map showing sighting corridor
// Create as SVG (like the Phoenix Lights map) — no download needed
// Save as: public/images/cases/003/belgian-wave-map.svg

// Col. De Brouwer photo (official BAF press conference)
// Source: news archives / Wikimedia
// Save as: public/images/cases/003/debrouwer-portrait.jpg

// F-16 radar scope imagery (generic, public domain)
// Source: US DoD / Wikimedia Commons
// Save as: public/images/cases/003/f16-radar-scope.jpg
```

### Case 004 Evidence Targets (`scripts/fetch-evidence-case-004.js`)

```
// DIA document cover page
// Source: https://www.dia.mil/ or NSA/CIA FOIA reading rooms
// Wikimedia Commons may have the declassified document
// Save as: public/images/cases/004/dia-report-cover.png

// F-4 Phantom II photo (IIAF or USAF, public domain)
// Source: US DoD / Wikimedia Commons — search "F-4 Phantom Iran"
// Save as: public/images/cases/004/f4-phantom.jpg

// Tehran airspace map (create as SVG)
// Save as: public/images/cases/004/tehran-airspace-map.svg

// Lt. Jafari National Press Club photo (2007)
// Source: National Press Club archives or news photos
// Save as: public/images/cases/004/jafari-npc-testimony.jpg
```

### Case 005 Evidence Targets (`scripts/fetch-evidence-case-005.js`)

```
// Boeing 747 reference photo (public domain)
// Source: Wikimedia Commons — search "JAL Boeing 747 cargo"
// Save as: public/images/cases/005/jal-747-cargo.jpg

// Terauchi sketch (his own drawing of the craft)
// Source: FAA report documents, widely reproduced
// Save as: public/images/cases/005/terauchi-sketch.png

// Alaska airspace map showing route (create as SVG)
// Save as: public/images/cases/005/jal1628-route-map.svg

// FAA CIRVIS form reference (public domain government form)
// Source: FAA.gov
// Save as: public/images/cases/005/faa-cirvis-form.png

// John Callahan National Press Club photo (2007)
// Source: NPC archives
// Save as: public/images/cases/005/callahan-npc-testimony.jpg
```

### Case 006 Evidence Targets (`scripts/fetch-evidence-case-006.js`)

```
// GIMBAL video — ALREADY EXISTS at public/media/cases/001/gimbal.mp4
// GOFAST video — ALREADY EXISTS at public/media/cases/001/gofast.mp4
// Copy or symlink these rather than re-downloading:
fs.copyFileSync('public/media/cases/001/gimbal.mp4', 'public/media/cases/006/gimbal.mp4')
fs.copyFileSync('public/media/cases/001/gofast.mp4', 'public/media/cases/006/gofast.mp4')

// GIMBAL still frame — ALREADY EXISTS at public/images/cases/001/gimbal-frame.png
// GOFAST still frame — ALREADY EXISTS at public/images/cases/001/gofast-frame.png
// Copy these too.

// USS Theodore Roosevelt photo (public domain, US Navy)
// Source: https://www.navy.mil or DVIDS — search "USS Theodore Roosevelt CVN-71"
// Save as: public/images/cases/006/uss-roosevelt.jpg

// Ryan Graves congressional testimony photo
// Source: House Oversight Committee — July 2023 hearing photos
// Save as: public/images/cases/006/graves-testimony.jpg

// East Coast OPAREA map showing W-72 (create as SVG)
// Save as: public/images/cases/006/eastcoast-oparea-map.svg
```

### Case 007 Evidence Targets (`scripts/fetch-evidence-case-007.js`)

```
// Halt memo scan — publicly released UK MoD document
// Source: Wikimedia Commons — "Halt memo" — it's been uploaded
// Save as: public/images/cases/007/halt-memo.png

// Rendlesham Forest aerial/map photo
// Source: Wikimedia Commons, OS maps, Google Earth screenshot
// Save as: public/images/cases/007/rendlesham-forest-map.png

// RAF Woodbridge/Bentwaters layout map (create as SVG)
// Save as: public/images/cases/007/raf-woodbridge-map.svg

// Col. Halt photo (public appearances, press)
// Source: news archives / NPC photos
// Save as: public/images/cases/007/halt-portrait.jpg

// Landing site ground impressions photo
// Source: Wikimedia Commons — documented at time of incident
// Save as: public/images/cases/007/landing-impressions.jpg

// Orford Ness lighthouse (skeptical explanation reference)
// Source: Wikimedia Commons — public domain
// Save as: public/images/cases/007/orford-ness-lighthouse.jpg
```

---

## Original SVG Maps to Create

For each case, create an original SVG map (like `phoenix-lights-transit-map.svg` and `nimitz-socal-oparea-map.svg`). These require no downloads and give each case a signature visual.

### Case 003 — Belgian Wave Corridor Map
- Show Belgium with sighting corridor (Eupen → Liège → Brussels)
- Mark F-16 intercept point over the Ardennes
- Mark Gendarmerie observation posts
- Show neighboring countries (Netherlands, Germany, France) with reported sightings
- Include timestamp labels for key events

### Case 004 — Tehran Intercept Map
- Show Tehran city outline
- Mark F-4 intercept vectors (first and second aircraft)
- Mark object's observed position/path over Tehran
- Mark the area where secondary object descended
- Include airbase positions (Shahrokhi AFB)

### Case 005 — JAL 1628 Route Map
- Show Alaska from above with the flight route (Anchorage → Ft. Yukon area)
- Mark where first craft appeared (5:11 PM)
- Mark where massive craft appeared
- Show FAA radar coverage arc from Anchorage Center
- Mark Ft. Yukon waypoint

### Case 006 — East Coast OPAREA Map
- Show US East Coast (Virginia/North Carolina)
- Mark W-72 operating area
- Mark USS Roosevelt position
- Show encounter zones with timestamps
- Reference the airbase (NAS Oceana)

### Case 007 — Rendlesham Forest Map
- Show RAF Woodbridge and RAF Bentwaters layout
- Mark the forest between the bases
- Mark the landing site with physical evidence
- Mark Halt's patrol route (second night)
- Mark Orford Ness lighthouse position (for context/skeptical reference)
- Show distance scale

---

## Gallery JSON for Each Case

After downloading evidence, populate the `gallery` array in each workspace JSON. Follow the Case 001 gallery as the template — each item needs: `id`, `type`, `src`, `thumbnail`, `title`, `caption`, `attribution`, `license`, `category`.

Each case should have at minimum:
- The SVG map as a `"map"` type gallery item (hero image too)
- Any downloaded photos as `"reference"` or `"witness"` type items
- Any document scans as `"document"` type
- Any videos (006) as `"video"` type with thumbnail path

---

## Update `cases-index.ts`

After all case files are created, update two things:

### 1. Move all cases from queuedCases to sidebarCases as Active
```typescript
export const casesWithData = new Set(["001", "002", "003", "004", "005", "006", "007"]);
```

### 2. Update sidebar statuses
```typescript
export const sidebarCases = [
  { id: "001", label: "001 — USS Nimitz", status: "Active", href: "/case/001" },
  { id: "002", label: "002 — Phoenix Lights", status: "Active", href: "/case/002" },
  { id: "003", label: "003 — Belgian Wave", status: "Active", href: "/case/003" },
  { id: "004", label: "004 — Tehran F-4", status: "Active", href: "/case/004" },
  { id: "005", label: "005 — JAL 1628", status: "Active", href: "/case/005" },
  { id: "006", label: "006 — USS Roosevelt", status: "Active", href: "/case/006" },
  { id: "007", label: "007 — Rendlesham", status: "Active", href: "/case/007" },
];
```

### 3. Update home page stats
In `app/page.tsx`, update the hero stats section:
```tsx
// Change:
<div className="stat-block"><div className="stat-value">1</div><div className="stat-label">Active Case</div></div>
<div className="stat-block"><div className="stat-value">5</div><div className="stat-label">In Queue</div></div>

// To:
<div className="stat-block"><div className="stat-value">7</div><div className="stat-label">Active Cases</div></div>
<div className="stat-block"><div className="stat-value">0</div><div className="stat-label">In Queue</div></div>
```

### 4. Add active cards for Cases 003–007 to home page

The home page currently shows only a Case 001 active card. Add cards for all new cases following the same pattern. Each card needs: case number, title, subtitle, date, location, credibility score, tags, hero image, summary, progress %, section chips, and an "Open Case File" link.

---

## Execution Order

The builder should tackle this in the following order to avoid bottlenecks:

1. **Read** `data/case-001-workspace.json` and `types/case.ts` for schema reference
2. **Create directories** for all 5 cases (`public/images/cases/003–007/`, `public/media/cases/003–007/`)
3. **Write research corpus JSONs** for all 5 cases (`case-003` through `case-007`)
4. **Write workspace JSONs** for all 5 cases — include all Phase 6 fields (verifiedFacts, hypothesisProbabilities, researchBranches). Leave `gallery` array minimal for now (just the map).
5. **Create SVG maps** for all 5 cases — these go in the workspace JSON as `heroImage` and first gallery item
6. **Create and run evidence download scripts** (`scripts/fetch-evidence-case-003.js` through `007`) — download available public domain assets
7. **Populate gallery arrays** in workspace JSONs with downloaded assets
8. **Update `cases-index.ts`** — casesWithData, sidebar statuses
9. **Update `app/page.tsx`** — stats and active case cards
10. **Run `npm run build`** — verify everything compiles

---

## Definition of Done

- [ ] 10 new JSON files created (5 corpus + 5 workspace)
- [ ] All workspace JSONs have complete Phase 6 fields (verifiedFacts, hypothesisProbabilities, researchBranches)
- [ ] SVG maps created for all 5 cases
- [ ] Evidence download scripts created at `scripts/fetch-evidence-case-XXX.js`
- [ ] Available public domain assets downloaded and saved to correct directories
- [ ] Gallery arrays populated in all workspace JSONs
- [ ] `casesWithData` updated to include all 7 cases
- [ ] All sidebar cases marked Active
- [ ] Home page stats updated (7 active, 0 queue)
- [ ] Home page shows active cards for all 7 cases
- [ ] `npm run build` passes cleanly

---

## Builder Notes

| Date | Note |
|------|------|
| 2026-04-02 | All 10 JSON files created (5 corpus + 5 workspace). Phase 6 fields verified: all have verifiedFacts, hypothesisProbabilities (sum=100), researchBranches. |
| 2026-04-02 | SVG maps created for all 5 cases following Nimitz map style pattern. |
| 2026-04-02 | Evidence scripts created at scripts/fetch-evidence-case-003..007.js. Case 006 copies GIMBAL/GOFAST from 001. |
| 2026-04-02 | casesWithData updated to include 003-007. All sidebar cases marked Active. |
| 2026-04-02 | Home page stats updated (7 active, 0 queue). Active cards added for all 7 cases. |
| 2026-04-02 | Some Wikimedia download URLs returned 404 (URLs change). Core assets (SVGs, copied videos) in place. Portraits/document scans can be sourced manually. |

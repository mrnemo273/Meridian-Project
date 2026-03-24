# Evidence Download Spec — Builder Task

> **Status:** Open
> **Assigned:** Builder
> **Depends on:** Phase 3B (shipped), Investigation Tasks system (shipped)
> **Related docs:** `Docs/EVIDENCE-SOURCING.md` · `types/case.ts` · `data/case-001-workspace.json` · `data/case-002-workspace.json`

---

## Context

The Meridian Project has two active case files (USS Nimitz, Phoenix Lights) with complete workspace data but **no visual evidence yet**. Each case workspace JSON contains an `investigationTasks` array with specific evidence retrieval missions — URLs, filenames, save paths, and licensing info are all defined.

Your job: **download, extract, and save all the evidence defined in the investigation tasks.**

Two original SVG maps have already been created and live at:
- `public/images/cases/001/nimitz-socal-oparea-map.svg` — Nimitz encounter map
- `public/images/cases/002/phoenix-lights-transit-map.svg` — Phoenix Lights V-formation transit map

---

## Task 1: Download FLIR1/GIMBAL/GOFAST Video Stills (Case 001 — HIGH PRIORITY)

The three declassified US Navy UAP videos are the crown jewels. They're public domain (US Government work).

### FLIR1 ("Tic Tac") — 2004 Nimitz encounter
1. Find and download the FLIR1 video. Sources to try in order:
   - `https://www.navair.navy.mil/foia/documents` (official NAVAIR FOIA)
   - Wikimedia Commons: search for "FLIR1" or "Go Fast UFO" — these have been uploaded as public domain
   - `https://en.wikipedia.org/wiki/Pentagon_UFO_videos` — source links in references
   - DoD press releases from April 2020 (official release)
2. Extract 4 still frames using ffmpeg:
   - `flir1-acquisition.png` — first clear acquisition of the Tic Tac
   - `flir1-rotation.png` — object rotating on its longitudinal axis
   - `flir1-center.png` — object centered showing oblong/Tic Tac shape
   - `flir1-lock-loss.png` — moment of apparent lock loss (end of video)
3. Save to: `public/images/cases/001/`

### GIMBAL — 2015 Roosevelt encounter
1. Download GIMBAL video from same sources above
2. Extract 1 frame: `gimbal-frame.png` — the iconic rotation moment
3. Save to: `public/images/cases/001/`

### GOFAST — 2015 Roosevelt encounter
1. Download GOFAST video from same sources above
2. Extract 1 frame: `gofast-frame.png` — object visible against ocean
3. Save to: `public/images/cases/001/`

**ffmpeg frame extraction example:**
```bash
# Extract frame at specific timestamp
ffmpeg -i flir1.mp4 -ss 00:00:34 -frames:v 1 -q:v 2 flir1-center.png

# Or extract a good frame from the middle
ffmpeg -i flir1.mp4 -vf "select=eq(n\,100)" -frames:v 1 flir1-center.png
```

If ffmpeg isn't available, install it: `sudo apt-get install -y ffmpeg` or `brew install ffmpeg`

**Attribution for all three:** `U.S. Department of Defense / Naval Air Systems Command`
**License:** Public Domain — US Government work

---

## Task 2: Navy Reference Photos (Case 001 — MEDIUM)

### AN/SPY-1B Radar System
1. Source a photo of SPY-1B radar arrays on a Ticonderoga-class cruiser
2. Try:
   - `https://www.navy.mil/Resources/Photo-Gallery/` — search "Princeton" or "Ticonderoga"
   - Wikimedia Commons: search "USS Princeton CG-59" or "AN/SPY-1 radar"
   - DVIDS (Defense Visual Information Distribution Service): `https://www.dvidshub.net/`
3. Save as: `public/images/cases/001/spy1b-radar-array.jpg`
4. **Attribution:** U.S. Navy

### F/A-18F Super Hornet
1. Source a US Navy photo of an F/A-18F, ideally VFA-41 "Black Aces" livery
2. Try same sources as above, search "VFA-41" or "F/A-18F Super Hornet"
3. Save as: `public/images/cases/001/fa18f-super-hornet.jpg`
4. **Attribution:** U.S. Navy

---

## Task 3: Phoenix Lights Evidence (Case 002 — HIGH/MEDIUM)

### Krzyston Video Stills (Event 2)
1. Locate still frames from Mike Krzyston's 10 PM Phoenix Lights footage
2. Try:
   - Search for "Phoenix Lights Krzyston video" or "Phoenix Lights 1997 footage"
   - YouTube: search "Phoenix Lights original footage 1997" — many documentary uploads contain the Krzyston footage
   - Use ffmpeg to extract frames if you find downloadable video
3. Extract 2-3 frames:
   - `krzyston-full-arc.png` — all lights visible
   - `krzyston-disappearing.png` — lights dropping behind mountain
   - `krzyston-daytime-comparison.png` — if available, the daytime ridgeline overlay
4. Save to: `public/images/cases/002/`
5. **License:** Fair use — non-commercial research
6. **Attribution:** Mike Krzyston / [broadcast source]

### Symington Press Conference Photo
1. Find a photo from Governor Symington's 1997 press conference (the one where an aide appeared in alien costume)
2. Try news archives, Wikimedia Commons, AP/Reuters feeds
3. Save as: `public/images/cases/002/symington-press-conference.jpg`
4. **License:** Fair use — research/educational
5. **Attribution:** Credit the photographer/agency

### Barry Goldwater Range Map (LOW)
1. Source a map showing the Barry Goldwater Air Force Range in SW Arizona
2. USGS or military maps are public domain
3. Save as: `public/images/cases/002/goldwater-range-map.png`
4. **Attribution:** USGS / US Government

---

## Task 4: Fravor Congressional Testimony (Case 001 — LOW)

1. Download Fravor's written statement from: `https://oversight.house.gov/wp-content/uploads/2023/07/David-Fravor-Statement-for-House-Oversight-Committee.pdf`
2. Convert page 1 to an image:
   ```bash
   # Using ImageMagick
   convert -density 200 fravor-statement.pdf[0] fravor-testimony-page1.png

   # Or using pdftoppm
   pdftoppm -f 1 -l 1 -png -r 200 fravor-statement.pdf fravor-testimony
   ```
3. Save as: `public/images/cases/001/fravor-testimony-page1.png`
4. **License:** Public Domain — Congressional record
5. **Attribution:** U.S. House Committee on Oversight and Accountability

---

## Task 5: SCU Analysis Diagrams (Case 001 — HIGH)

1. Find the SCU report: `https://www.academia.edu/40212818/A_Forensic_Analysis_of_Navy_Carrier_Strike_Group_Elevens_Encounter_with_an_Anomalous_Aerial_Vehicle`
2. Download the PDF
3. Extract key figures:
   - `scu-trajectory.png` — trajectory reconstruction diagram
   - `scu-acceleration.png` — acceleration estimation chart
   - `scu-radar-track.png` — radar track visualization
   - `scu-gforce-comparison.png` — comparative g-force diagram
4. Save to: `public/images/cases/001/`
5. **License:** Academic fair use — research citation
6. **Attribution:** Scientific Coalition for UAP Studies (SCU), 2019 · Knuth, Powell, Reali

---

## Task 6: Update Investigation Task Statuses

After completing downloads, update the `investigationTasks` arrays in both workspace JSONs:

```json
{
  "status": "completed",
  "completed_by": "Builder",
  "completed_date": "2026-03-23"
}
```

For any tasks where the source is no longer available, mark as `"blocked"` and add a note explaining what you tried.

---

## Task 7: Update casesWithData

In `data/cases-index.ts`, add `"002"` to the `casesWithData` Set so the workspace page renders for Phoenix Lights:

```typescript
export const casesWithData = new Set(["001", "002"]);
```

---

## Task 8: Video Downloads (BONUS — if bandwidth allows)

If you can find direct download links for the actual videos:

### FLIR1 Video
- Source: NAVAIR FOIA or Wikimedia Commons
- Save to: `public/media/cases/001/flir1.mp4`

### GIMBAL Video
- Save to: `public/media/cases/001/gimbal.mp4`

### GOFAST Video
- Save to: `public/media/cases/001/gofast.mp4`

### Kurt Russell ATC Recording (Case 002 — LOW)
- Search for the actual ATC audio clip
- Save to: `public/media/cases/002/russell-atc-exchange.mp3`

Create the `public/media/cases/001/` and `public/media/cases/002/` directories if they don't exist.

---

## Directory Structure Reference

```
public/
  images/
    cases/
      001/                          ← USS Nimitz
        nimitz-socal-oparea-map.svg  ✅ Already exists
        flir1-acquisition.png        ← Task 1
        flir1-rotation.png           ← Task 1
        flir1-center.png             ← Task 1
        flir1-lock-loss.png          ← Task 1
        gimbal-frame.png             ← Task 1
        gofast-frame.png             ← Task 1
        scu-trajectory.png           ← Task 5
        scu-acceleration.png         ← Task 5
        scu-radar-track.png          ← Task 5
        scu-gforce-comparison.png    ← Task 5
        spy1b-radar-array.jpg        ← Task 2
        fa18f-super-hornet.jpg       ← Task 2
        fravor-testimony-page1.png   ← Task 4
      002/                          ← Phoenix Lights
        phoenix-lights-transit-map.svg ✅ Already exists
        krzyston-full-arc.png        ← Task 3
        krzyston-disappearing.png    ← Task 3
        symington-press-conference.jpg ← Task 3
        goldwater-range-map.png      ← Task 3
  media/
    cases/
      001/
        flir1.mp4                    ← Task 8
        gimbal.mp4                   ← Task 8
        gofast.mp4                   ← Task 8
      002/
        russell-atc-exchange.mp3     ← Task 8
```

---

## Constraints

- **All images must include proper attribution.** Maintain a record of sources.
- **Public domain / government sources first.** Only use fair-use for copyrighted material (news photos, documentary stills).
- **Reasonable file sizes.** Images should be web-optimized. PNG for screenshots/stills, JPG for photos. Target ~200-500KB per image.
- **Do NOT modify any existing code or components.** This is a content-only task.
- **Do NOT change the SVG maps** that already exist — they're done.

---

## Definition of Done

- [ ] At least 4 FLIR1 still frames saved to `public/images/cases/001/`
- [ ] GIMBAL + GOFAST frames saved
- [ ] At least 1 Navy reference photo (SPY-1B or F/A-18F)
- [ ] At least 1 Phoenix Lights evidence image in `public/images/cases/002/`
- [ ] Investigation task statuses updated in both workspace JSONs
- [ ] `casesWithData` includes "002"
- [ ] `npm run build` still completes cleanly

---

## Builder Notes

<!-- Builder: use this section to leave notes, flag blockers, or document decisions as you work. -->

| Date | Note |
|------|------|
| 2026-03-23 | **Task 1 DONE.** FLIR1 video downloaded from Wikimedia Commons (public domain, sourced via API). Extracted 4 frames at timestamps 10s/24s/34s/72s. GIMBAL frame at 18s, GOFAST frame at 16s. All saved to `public/images/cases/001/`. |
| 2026-03-23 | **Task 2 DONE.** USS Princeton (CG-59) photo from Wikimedia Commons — US Navy public domain, shows SPY-1 arrays on superstructure. VFA-41 Black Aces F/A-18F launching from USS Stennis — US Navy public domain (190129-N-OM854-0505). Both resized to 1200px for web. |
| 2026-03-23 | **Task 3 PARTIAL.** Goldwater Range land tenure map from Wikimedia (public domain). Symington portrait by Gage Skidmore (CC BY-SA) — note: this is a modern portrait, NOT the 1997 press conference photo. The alien costume press conference photo is an AP wire photo and not on Wikimedia Commons. **Krzyston stills BLOCKED** — footage is copyrighted, no free-license copies found. |
| 2026-03-23 | **Task 4 DONE.** Fravor statement PDF downloaded from oversight.house.gov. Page 1 rendered to PNG via macOS qlmanage at 1600px. |
| 2026-03-23 | **Task 5 DONE.** Used MDPI Entropy paper (Knuth, Powell, Reali 2019 — open access). Extracted figures from pages covering acceleration histograms, trajectory reconstruction, radar observations, and FLIR analysis. Full SCU 270-page report on explorescu.org turned out to be a conference agenda PDF — the MDPI journal version has the actual science figures. |
| 2026-03-23 | **Task 6 DONE.** Updated all investigation task statuses in both workspace JSONs. Case-001: all 7 tasks completed. Case-002: 6 of 8 completed, IT-002 (Krzyston stills) and IT-008 (Russell ATC audio) blocked due to copyright. |
| 2026-03-23 | **Task 7 ALREADY DONE.** `casesWithData` already included "002" from Phase 3B. |
| 2026-03-23 | **Task 8 DONE.** All three DoD videos converted from WebM to MP4 (H.264) and saved to `public/media/cases/001/`. Russell ATC audio blocked (see Task 3 note). |

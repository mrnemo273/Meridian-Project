# The Meridian Project — Data Landscape Research

## Overview

This document maps the real data sources available for Meridian's corpus, including record counts, field coverage, format, accessibility, and key limitations. Understanding what we're actually working with should drive design decisions about what the site can realistically show.

---

## Source 1: NUFORC (National UFO Reporting Center)

**Status: Accessible (with caveats)**

| Detail | Value |
|--------|-------|
| Records | ~147,000–150,000+ reports |
| Date range | 1930s–present (bulk is post-1990s) |
| Format | HTML pages; third-party CSV/JSON extracts available |
| Official API | None |

### Available Fields (from processed datasets)
- `date_time` — ISO 8601 (converted from M/DD/YY HH:MM)
- `city` — sighting location
- `state` — 2-character code
- `shape` — object shape (circle, triangle, light, sphere, disk, etc.)
- `duration` — unstructured free text ("about 5 minutes", "30 seconds", etc.)
- `summary` — first few sentences of the report
- `text` — full report narrative (free text)
- `posted` — date posted to NUFORC
- `city_latitude` / `city_longitude` — geocoded at city level
- `report_link` — URL to original NUFORC report

### What's Missing
- No witness count
- No witness credentials
- No radar/video/photo evidence flags
- No credibility scoring of any kind
- No structured craft description — everything is buried in free text
- Duration is unstructured and inconsistent ("about 5 min", "30 secs", "a few moments")
- Location is city-level only, no precise coordinates

### Access Notes
- NUFORC's ToS forbids scraping and redistribution. Official access requires emailing their CTO.
- Third-party extracts exist on GitHub (timothyrenner/nuforc_sightings_data), Hugging Face (kcimc/NUFORC ~147,890 records), and Kaggle (~80,000 scrubbed records).
- The GitHub extract includes geocoding and basic standardization (shape normalization, date parsing, city name cleanup).

### Design Implications
- NUFORC is the bulk of our corpus by volume, but it's LOW STRUCTURE. The richest data is locked in free-text narratives.
- Meridian's AI entity extraction pipeline is critical here — we need to pull craft descriptions, behavioral descriptors, physiological effects, and duration from unstructured text.
- Shape is the only structured descriptor field. Everything else needs NLP.
- We should NOT promise "150,000+ detailed case files" — most are 2–3 sentence civilian reports with minimal detail.

---

## Source 2: Project Blue Book

**Status: Accessible (unstructured)**

| Detail | Value |
|--------|-------|
| Records | 12,618 sightings (701 "Unidentified") |
| Date range | 1947–1969 |
| Format | Scanned microfilm rolls (TIFF/PDF), NOT structured data |
| Official API | None |

### What's Available
- Full case files on Internet Archive (archive.org) — free download
- National Archives (NARA) microfilm reels digitized
- Index files listing date, location, and disposition (explained/unexplained)
- Individual case files vary wildly — some are 1 page, some are 50+ pages with photos and witness statements

### Available Fields (from indexes only)
- Case number
- Date
- Location (city/state)
- Disposition (identified, unidentified, insufficient data)

### What's Missing from Structured Data
- Everything beyond the index requires OCR + NLP on scanned documents
- No structured witness info, no craft descriptions, no evidence flags
- Quality varies enormously — some cases are detailed Air Force investigations, many are a single paragraph

### Design Implications
- The 701 "Unidentified" cases are the gold. These are officially unexplained by the US Air Force.
- But they require significant processing — OCR, entity extraction, manual review for high-value cases.
- For Phase 1, we might realistically get the index data (date, location, disposition) into structured form, with deep case files only for the most notable cases.
- Don't promise "12,000 fully analyzed Blue Book cases" — promise "12,000 indexed, with 701 officially unidentified cases under deep analysis."

---

## Source 3: MUFON (Mutual UFO Network)

**Status: Restricted access**

| Detail | Value |
|--------|-------|
| Records | 120,000+ reports (claimed) |
| Date range | 1969–present |
| Format | Proprietary CMS database |
| Official API | None public |

### Access Restrictions
- Full database access requires PAID MEMBERSHIP
- Downloading data for redistribution is explicitly forbidden without written consent
- No public API
- "Last 20 public" listings visible without membership
- Research access may be possible through formal partnership

### What MUFON Data Contains (based on their CMS)
- Structured sighting reports with location, date, time, duration
- Witness narratives
- Photos, videos, Word docs, PDFs attached to cases
- Field investigator reports (investigated cases only)
- Their own case status system

### Design Implications
- We CANNOT count on MUFON data for launch unless we secure a partnership.
- The PRD lists "MUFON public cases only (partial dataset — pending formal partnership)" — this is correct and we should plan accordingly.
- For the website, MUFON data should be shown as a potential future expansion, not a guaranteed corpus source.
- We could potentially scrape/access the limited public listings, but this is thin.

---

## Source 4: The Black Vault FOIA Archive

**Status: Accessible (document-heavy, unstructured)**

| Detail | Value |
|--------|-------|
| Records | 2.2 million+ pages total (archive-wide), thousands of UFO-specific documents |
| Date range | 1940s–present |
| Format | PDF (converted from TIFF), some searchable |
| Official API | None |

### What's Available
- CIA UFO collection: ~2,780 pages of declassified documents
- FBI UFO files: accessible at vault.fbi.gov/UFO (1947–1954 primarily)
- Thousands of additional FOIA documents organized by topic
- Two download formats: original TIFF (not searchable) and converted PDF (searchable)

### What's Missing
- NO structured data — these are scanned government documents
- No standardized fields — each document is unique (memos, reports, correspondence)
- Requires extensive NLP/OCR processing to extract any structured information

### Design Implications
- This is a CREDIBILITY source more than a DATA source. Having "declassified CIA/FBI documents" in the corpus adds legitimacy.
- For the website, these are best presented as source documents linked from specific cases, not as browsable data.
- Realistically, we process these for entity extraction (dates, locations, descriptions) and link them as supporting evidence to cases from other sources.
- Phase 1 might focus on the most notable/cited documents rather than trying to process everything.

---

## Source 5: Pentagon AARO Reports

**Status: Accessible (small but authoritative)**

| Detail | Value |
|--------|-------|
| Records | 1,652 total cases under investigation |
| Date range | 2021–present (with some backdated) |
| Format | Published PDF reports |
| Official API | None |

### What's Available
- FY2024 Annual Report: 757 new reports (May 2023–June 2024)
- Historical Record Report Vol. 1 (March 2024)
- AARO has resolved 118 cases (balloons, birds, drones), 174 queued for closure
- 21 cases deemed significant for deeper study
- Reports published at aaro.mil
- Records also being accessioned into National Archives (Record Group 615)

### Key Data Points
- 1,652 total cases in AARO's system
- Only 21 flagged as "truly anomalous" worthy of deep study
- Most resolved cases are prosaic (balloons, drones, birds)
- All reports conclude "no evidence of extraterrestrial technology" (officially)

### Design Implications
- Small dataset but EXTREMELY high credibility — this is the US government's official office.
- The 21 "truly anomalous" cases are high-value content.
- These reports are best presented as authoritative context alongside the broader corpus.
- The resolved-as-prosaic cases are actually useful too — they demonstrate Meridian's commitment to null findings and rigor.

---

## Source 6: Congressional Testimony

**Status: Accessible (small, high-value)**

| Detail | Value |
|--------|-------|
| Records | ~3–5 major hearings (2023–2024) |
| Date range | 2023–present |
| Format | PDF transcripts on Congress.gov, video on C-SPAN |
| Official API | Congress.gov |

### Key Hearings
- July 26, 2023: "Implications on National Security, Public Safety, and Government Transparency" (Grusch, Fravor, Graves)
- November 13, 2024: "Exposing the Truth" (Elizondo, Gallaudet, Gold, Shellenberger)
- Full transcripts available as PDF downloads from Congress.gov
- Written testimony documents available from House Oversight Committee

### Design Implications
- Tiny dataset but massive narrative importance — these are under-oath statements by credible witnesses.
- Best presented as citable source documents, linked from relevant cases and findings.
- Fravor's testimony directly supports the Nimitz case (Score: 94 in our wireframes). Grusch's testimony is broader claims.
- Key quotes can be extracted and linked to specific evidence threads.

---

## Source 7: CIA/FBI Reading Rooms

**Status: Accessible (document-heavy)**

| Detail | Value |
|--------|-------|
| Records | ~2,780 pages (CIA); FBI files span 1947–1954 |
| Date range | 1940s–1990s primarily |
| Format | PDF downloads |
| Official API | None (web browsing) |

### What's Available
- CIA FOIA Reading Room: UFO Special Collection at cia.gov/readingroom
- FBI Vault: vault.fbi.gov/UFO
- National Archives UAP Records Collection (Record Group 615, new as of 2024 NDAA)

### Design Implications
- Similar to Black Vault — these are credibility sources. Government letterhead PDFs add legitimacy.
- Processing requirements same as Black Vault: OCR/NLP for entity extraction.
- Best linked as source documents from relevant cases.

---

## Source 8: NICAP (National Investigations Committee on Aerial Phenomena)

**Status: Partially accessible (web-only, unstructured)**

| Detail | Value |
|--------|-------|
| Records | ~575 cases in main chronology, yearly chronologies going back decades |
| Date range | 1940s–2000s |
| Format | HTML pages on nicap.org |
| Official API | None |

### What's Available
- Year-by-year UFO chronologies (HTML pages at nicap.org/chronos/)
- Case summaries with dates, locations, brief descriptions
- Cross-references between related cases
- Historical organizational documents

### Design Implications
- NICAP data is relatively small but historically important — this was the premier civilian UFO research organization.
- Data would need to be scraped and structured. Not a major volume source.
- Valuable for historical context and cross-referencing with Blue Book cases (same era).

---

## Source 9: Enigma Labs (Potential)

**Status: Emerging platform — API planned but not confirmed public**

| Detail | Value |
|--------|-------|
| Records | 200,000+ sightings (including historical) |
| Date range | Historical through present |
| Format | Proprietary app/web platform |
| Official API | Planned, not yet public |

### What's Available
- 25,000+ user-submitted sightings (as of late 2024)
- Interactive map with 200K+ historical + modern sightings
- Their own anomaly scoring system
- Mobile app (iOS, Android launching 2025)

### Design Implications
- Could be a significant data partner if API becomes public.
- Their data may overlap significantly with NUFORC.
- Worth monitoring but NOT something to build launch plans around.

---

## Realistic Corpus Estimate for Phase 1

| Source | Structured Records | Processing Needed | Confidence |
|--------|-------------------|-------------------|------------|
| NUFORC | ~147,000 | NLP entity extraction on free text | High |
| Blue Book Index | ~12,600 | OCR on notable cases | High |
| MUFON | 0 (without partnership) | N/A | Low |
| Black Vault | ~100–500 key documents | OCR + NLP | Medium |
| AARO | ~1,652 case references | Structured from reports | High |
| Congressional | ~5 hearings | Transcript parsing | High |
| CIA/FBI | ~100–300 key documents | OCR + NLP | Medium |
| NICAP | ~575 | Web scraping + structuring | Medium |

### Total Realistic Phase 1 Corpus
- **~160,000 indexed records** (NUFORC bulk + Blue Book index + AARO + NICAP)
- **~2,000–3,000 deeply structured cases** (where we have rich extracted fields)
- **~500–1,000 supporting documents** (FOIA, government reports, testimony)

---

## Critical Insight for Site Design

The honest truth is: **most of our data is thin.** The bulk corpus (NUFORC) gives us date, location, shape, and a paragraph of free text. That's it. The richly detailed cases — with radar, video, multiple witnesses, official investigation — are a TINY fraction.

This means the site design should:

1. **Not pretend every case is rich.** The Evidence Index should gracefully handle cases that have only 3 fields populated vs. cases with 15+ fields.
2. **Lead with the strong cases.** The homepage and entry points should showcase the ~50–100 cases that have the richest evidence trails.
3. **Be honest about data coverage.** Show which fields are populated and which aren't. This IS the credibility play.
4. **Make the AI extraction pipeline visible.** When Meridian's AI extracts descriptors from free text, show that it's AI-extracted (not original structured data). This transparency builds trust.
5. **Design for growth.** The corpus WILL get richer over time as contributions come in and more sources are processed. The design should feel valuable at 160K thin records AND at 500K rich records.
6. **The Query Interface is the killer feature.** Even with thin structured data, the AI can search across 147,000 narratives and surface patterns. The query interface should be the star of the show — it's where the thin data becomes thick insight.

---

## Sources

- [NUFORC Data Bank](https://nuforc.org/databank/)
- [NUFORC Sightings Data (GitHub)](https://github.com/timothyrenner/nuforc_sightings_data)
- [NUFORC Dataset (Hugging Face)](https://huggingface.co/datasets/kcimc/NUFORC)
- [Project Blue Book on Internet Archive](https://archive.org/details/bluebook)
- [Project Blue Book — National Archives](https://www.archives.gov/research/military/air-force/ufos)
- [MUFON Database Terms](https://mufon.com/search_database-terms-and-conditions/)
- [The Black Vault Document Archive](https://www.theblackvault.com/documentarchive/)
- [CIA FOIA Reading Room — UFOs](https://www.cia.gov/readingroom/collection/ufos-fact-or-fiction)
- [FBI Vault — UFO](https://vault.fbi.gov/UFO)
- [AARO UAP Records](https://www.aaro.mil/UAP-Records/)
- [AARO FY2024 Annual Report (PDF)](https://media.defense.gov/2024/Nov/14/2003583603/-1/-1/0/FY24-CONSOLIDATED-ANNUAL-REPORT-ON-UAP-508.PDF)
- [Congressional UAP Hearing Transcript (2023)](https://www.congress.gov/event/118th-congress/house-event/116282)
- [Congressional UAP Hearing — "Exposing the Truth" (2024)](https://www.congress.gov/event/118th-congress/house-event/117721)
- [National Archives — UAP Records](https://www.archives.gov/research/topics/uaps)
- [NICAP Chronology](https://www.nicap.org/chronos/2000fullrep.htm)
- [Enigma Labs](https://enigmalabs.io/)

"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { useAnnotations } from "@/hooks/useAnnotations";
import { useACHVotes, achRows, achHeaders } from "@/hooks/useACHVotes";
import { useEvidenceLinks, linkNodes } from "@/hooks/useEvidenceLinks";
import type { Attachment } from "@/hooks/useAnnotations";

// ── CASE CONTENT DATA (hardcoded from prototype, matching exactly) ──

const timelineEvents = [
  { date: "Late October 2004", title: "Anomalous radar contacts begin", detail: "USS Princeton\u2019s AN/SPY-1B radar detects objects at 80,000+ ft, descending to sea level in seconds \u2014 rates exceeding ballistic missile profiles. Senior Chief Kevin Day tracks returns over two weeks.", tags: [{ label: "SPY-1", type: "sensor" }, { label: "Radar", type: "radar-confirmed" }], type: "key" },
  { date: "November 14, 2004 \u00b7 1:00 PM", title: "Fravor & Dietrich vectored to contact", detail: 'CDR David Fravor and LCDR Alex Dietrich, flying two F/A-18F Super Hornets from VFA-41 "Black Aces," are diverted to a live radar return ~100 miles SW of San Diego.', tags: [{ label: "Fravor", type: "witness" }, { label: "Dietrich", type: "witness" }], type: "key" },
  { date: "1:10 PM \u00b7 The Intercept", title: "Visual contact \u2014 Tic Tac above churning ocean", detail: null, tags: [{ label: "Visual", type: "visual-confirmed" }, { label: "Multi-sensor", type: "sensor" }], type: "key", hasHighlight: "ann-3" },
  { date: "1:12 PM \u00b7 ~2 min later", title: "Object vanishes \u2014 reappears 60 miles away", detail: null, tags: [{ label: "SPY-1", type: "sensor" }, { label: "Anomaly", type: "anomaly" }], type: "key", hasHighlight: "ann-5" },
  { date: "2:00 PM \u00b7 Second flight", title: "FLIR1 infrared video captured", detail: "WSO Chad Underwood records 76 seconds of IR video. The footage shows a featureless oblong with no exhaust plume, rotating on its longitudinal axis while maintaining flight.", tags: [{ label: "FLIR", type: "infrared-confirmed" }, { label: "Sensor", type: "sensor" }], type: "key" },
  { date: "Late 2004 \u2013 Early 2005", title: "Hard drives confiscated \u2014 data vanishes", detail: null, tags: [{ label: "Data gap", type: "data-confiscation" }], type: "anomaly", hasHighlight: "ann-6" },
  { date: "December 16, 2017", title: "Pentagon confirms AATIP, releases FLIR1", detail: "NYT publishes bombshell investigation. Pentagon ran a $22M secret UAP program. DoD releases FLIR1 after 13 years. Luis Elizondo resigns AATIP in protest over secrecy.", tags: [{ label: "DoD", type: "official" }, { label: "Official", type: "official" }], type: "key" },
  { date: "2019 \u2013 2023", title: "Congressional hearings & public testimony", detail: "Fravor testifies under oath. Dietrich on 60 Minutes. Kevin Day speaks publicly. AARO is established. The Nimitz encounter becomes the most cited UAP case in legislative history.", tags: [{ label: "Congress", type: "official" }, { label: "Multiple", type: "multi-witness" }], type: "key" },
];

const evidenceCards = [
  { typeLabel: "Sensor Data", badge: "SPY-1", badgeClass: "badge-sensor", cardType: "type-sensor", title: "AN/SPY-1B Radar Tracking", summary: "Princeton\u2019s AEGIS radar tracked multiple objects at 80,000+ ft descending to sea level in seconds. Radar operator Kevin Day tracked returns over ~2 weeks before the intercept.", linkText: "\uD83D\uDD17 Linked to: FLIR1 Video, Fravor Testimony, 60-Mile Relocation" },
  { typeLabel: "Physical Evidence", badge: "Video", badgeClass: "badge-official", cardType: "type-sensor", title: "FLIR1 Infrared Video", summary: "76 seconds recorded, 35 publicly released. Zero exhaust plume \u2014 thermodynamically impossible for any known propulsion. Object rotates on longitudinal axis while maintaining trajectory.", linkText: "\uD83D\uDD17 Linked to: SPY-1 Radar, Underwood Testimony, SCU Analysis" },
  { typeLabel: "Anomaly", badge: "Unresolved", badgeClass: "badge-anomaly", cardType: "type-evidence", title: "60-Mile Instant Relocation", summary: "Object reappears at the fighters\u2019 CAP point \u2014 a pre-assigned coordinate known only to Navy personnel. Implied speed ~46,000 mph. No sonic boom detected.", linkText: "\uD83D\uDD17 Linked to: SPY-1 Radar, CAP Point Awareness" },
  { typeLabel: "Anomaly", badge: "Unresolved", badgeClass: "badge-anomaly", cardType: "type-evidence", title: "Ocean Surface Disturbance", summary: "Cross-shaped area of churning whitewater the size of a 737. Calm surrounding seas. No submarine or surface vessel detected. Disturbance ceased with Tic Tac departure.", linkText: "\uD83D\uDD17 Linked to: Water Pattern (Shag Harbour), Subsurface Component" },
];

const witnessCards = [
  { initials: "DF", name: "CDR David Fravor", rank: 'CO VFA-41 "Black Aces" \u00b7 Ret.', observed: "Observed the Tic Tac at close range. Attempted to intercept. Object mirrored his descent, then accelerated instantaneously. 18 years experience, 3,500+ flight hours, Top Gun graduate.", quote: "\u201cIt accelerated like nothing I\u2019ve ever seen.\u201d", quoteSource: "\u2014 JRE #1361, 2019" },
  { initials: "AD", name: "LCDR Alex Dietrich", rank: "Wingman \u00b7 VFA-41", observed: "Observed from higher altitude. Independently corroborated all details \u2014 ocean disturbance, mirroring behavior, instantaneous departure. First female fighter pilot to speak publicly.", quote: "\u201cI don\u2019t identify it as any kind of aircraft that I know.\u201d", quoteSource: "\u2014 60 Minutes, May 2021" },
  { initials: "KD", name: "Sr. Chief Kevin Day", rank: "USS Princeton CIC \u00b7 Radar Operator", observed: "First to identify anomalous radar returns. Tracked objects over two weeks. Personally vectored Fravor\u2019s flight. Later reported cognitive effects post-encounter. 20+ years Navy, Top Secret clearance.", quote: null, quoteSource: null },
];

const aiCards = [
  { aiType: "Pattern Analysis", title: "Cross-Corpus: Water Disturbance Pattern", finding: "Water interaction observed in 3 other high-credibility cases: Shag Harbour 1967 (physical traces), Aguadilla 2013 (thermal video), Catalina Channel 1958 (military witnesses). P(coincidence) < 0.3%.", confidence: "High Confidence", confidenceClass: "confidence-high" },
  { aiType: "Physics Review", title: "Acceleration Analysis: 75g \u2013 12,600g", finding: "SCU estimates 75\u20135,000g based on FLIR1 tracking. Alternative radar calculation yields ~12,600g. Human tolerance: 9g. F-35 structural limit: 13.5g. Orders of magnitude beyond any known technology.", confidence: "Medium \u2014 Dependent on sensor accuracy", confidenceClass: "confidence-medium" },
  { aiType: "Context Analysis", title: "13-Year Disclosure Gap", finding: "Belgian Wave: 20 years to acknowledgment. Tehran 1976: decades via FOIA. Nimitz: 13 years. Pattern suggests deliberate institutional delay, not routine bureaucratic process.", confidence: "High Confidence", confidenceClass: "confidence-high" },
];

const questions = [
  { num: "Q01", text: "What is in the classified annex of the AARO Historical Report Vol. 1?", context: 'The public report calls Nimitz "among the most significant unresolved cases" but the annex remains sealed.' },
  { num: "Q02", text: "Where are the original high-resolution FLIR recordings?", context: "Only a downgraded copy survived. Multiple crew members describe confiscation by unidentified individuals." },
  { num: "Q03", text: "Was the object aware of the fighters\u2019 CAP point?", context: "It reappeared at a pre-assigned coordinate known only to Navy personnel." },
  { num: "Q04", text: "What caused the ocean surface disturbance?", context: "Cross-shaped churning whitewater the size of a 737. No submarine detected. Suggests a subsurface component." },
  { num: "Q05", text: "What does USS Louisville\u2019s sonar data show?", context: "Los Angeles-class submarine was part of the strike group. Sonar data status unknown." },
];

const resolutionItems = [
  { status: "eliminated", label: "Weather balloon", detail: "Eliminated. Object tracked at hypersonic speeds. No balloon matches observed flight profile." },
  { status: "eliminated", label: "Conventional aircraft", detail: "Eliminated. No wings, no exhaust, no IFF transponder. Flight profile exceeds any known airframe." },
  { status: "eliminated", label: "Military drone / UAS", detail: "Eliminated. No known 2004-era drone matches observed performance." },
  { status: "eliminated", label: "Astronomical object", detail: "Eliminated. Object at low altitude, hovering and maneuvering. Broad daylight." },
  { status: "partial", label: "Sensor malfunction / radar clutter", detail: "Partially addressed. SPY-1 team ruled out clutter. Visual confirmation supports physical object." },
  { status: "eliminated", label: "Hoax / fabrication", detail: "Eliminated. Multiple independent witnesses, government-released video, congressional testimony under oath." },
  { status: "open", label: "Classified US program", detail: 'Not fully eliminated. AARO found "no evidence" linking UAP to classified programs. Capabilities exceed known physics.' },
  { status: "open", label: "Foreign adversary technology", detail: "Not fully eliminated. 20 years later no nation has demonstrated remotely comparable capabilities." },
];

const osintItems = [
  { field: "Location", status: "verified", value: "SOCAL OPAREA, ~100mi SW of San Diego. 31.33\u00b0N, 117.17\u00b0W.", source: "Confirmed via USS Nimitz deployment records, FOIA documents." },
  { field: "Weather Conditions", status: "verified", value: "Clear skies, calm seas, excellent visibility. No clouds below 25,000 ft.", source: "NOAA historical weather data, all witness accounts." },
  { field: "Military Exercise", status: "verified", value: "CSG-11 pre-deployment COMPTUEX/JTFEX exercises confirmed.", source: "Navy deployment schedule, USS Nimitz cruise book." },
  { field: "Witness Credentials", status: "verified", value: "Fravor: CO VFA-41, Top Gun grad, 3,500+ hrs. Dietrich: VFA-41. Day: 20+ yrs Navy.", source: "Navy records, congressional testimony, public interviews." },
  { field: "FLIR1 Video Authenticity", status: "verified", value: "Officially released by DoD. Metadata consistent with AN/ASQ-228 ATFLIR.", source: "DoD official release, FOIA confirmation, SCU analysis." },
  { field: "Data Confiscation", status: "partial", value: "Two crew members describe men arriving by helicopter to collect data.", source: "Documentary interviews. No official records or chain of custody found." },
  { field: "Submarine Sonar Data", status: "unverified", value: "USS Louisville (SSN-724) was part of CSG-11. Sonar data status unknown.", source: "No public records. FOIA not yet filed." },
];

const chainItems = [
  { num: 1, source: "AN/SPY-1B Radar Data", note: "Original tapes confiscated. Exists now only as verbal testimony.", strength: "moderate", strengthLabel: "Moderate \u2014 testimony only" },
  { num: 2, source: "FLIR1 Video (downgraded copy)", note: "Original confiscated. Downgraded copy survived. Officially released by DoD Dec 2017.", strength: "strong", strengthLabel: "Strong \u2014 DoD authenticated" },
  { num: 3, source: "CDR Fravor Testimony", note: "JRE #1361 (2019), Lex Fridman #122 (2020), Congress (July 2023).", strength: "strong", strengthLabel: "Strong \u2014 consistent across 19 years" },
  { num: 4, source: "LCDR Dietrich Testimony", note: "Independent account. 60 Minutes (May 2021). Corroborates all key details.", strength: "strong", strengthLabel: "Strong \u2014 independent witness" },
  { num: 5, source: "Kevin Day Testimony", note: "Radar operator. Public 2019. Describes 2 weeks of anomalous contacts.", strength: "strong", strengthLabel: "Strong \u2014 first-hand, corroborated" },
  { num: 6, source: "Data Confiscation Accounts", note: "PO Hughes and PO Voorhis. Documentary interviews only.", strength: "weak", strengthLabel: "Weak \u2014 no physical evidence" },
];

const searchResults = [
  { type: "reddit", source: "Reddit \u00b7 r/UFOs", title: "Frame-by-frame FLIR1 analysis reveals rotation axis anomaly", snippet: "User /u/SkyWatcher2004 isolates 3 frames showing the object\u2019s rotation changes direction mid-flight \u2014 inconsistent with any ballistic trajectory or known propulsion..." },
  { type: "academic", source: "SCU \u00b7 Scientific Coalition for UAP Studies", title: "2019 FLIR1 Reconstruction: Estimated acceleration 75g\u20135,400g", snippet: "Detailed frame-by-frame reconstruction of the FLIR1 footage using calibrated lens parameters, atmospheric correction, and triangulation from known aircraft position..." },
  { type: "video", source: "YouTube \u00b7 Lex Fridman Podcast #122", title: "David Fravor: Nimitz encounter full testimony (2h14m)", snippet: "Commander Fravor\u2019s most detailed account. Timestamps: 0:14:22 first visual, 0:31:05 mirroring behavior, 0:45:18 departure speed, 1:12:00 hard drive confiscation..." },
  { type: "foia", source: "FOIA \u00b7 The Black Vault", title: "AATIP Program Documents \u2014 Nimitz Case References", snippet: "Collection of declassified documents from the Advanced Aerospace Threat Identification Program. Three memos reference the 2004 Nimitz encounter specifically..." },
  { type: "web", source: "Web \u00b7 The War Zone / The Drive", title: "Navy Confirms USS Louisville Was Part of Nimitz Strike Group", snippet: 'FOIA response confirms SSN-724 Louisville was operating with CSG-11 during November 2004. Sonar data status: "responsive records not located" \u2014 which may indicate classified hold...' },
];

const solvFactors = [
  { name: "Multiple independent witnesses", score: "+15", type: "positive" },
  { name: "Official DoD video exists", score: "+12", type: "positive" },
  { name: "Congressional testimony on record", score: "+10", type: "positive" },
  { name: "Cross-case pattern matches", score: "+8", type: "positive" },
  { name: "FOIA avenues unexplored", score: "+10", type: "positive" },
  { name: "Original sensor data confiscated", score: "-8", type: "negative" },
  { name: "Key witness silent (Slaight)", score: "-5", type: "negative" },
  { name: "20-year evidence degradation", score: "-5", type: "negative" },
  { name: "Submarine data unknown", score: "+5", type: "neutral" },
  { name: "AARO classified annex sealed", score: "-3", type: "negative" },
];

const nextSteps = [
  { priority: "high", text: "File FOIA for USS Louisville sonar logs (Nov 2004)" },
  { priority: "high", text: "File FOIA for AARO Historical Report classified annex" },
  { priority: "medium", text: "Cross-reference NUFORC database for Nov 2004 SOCAL sightings" },
  { priority: "medium", text: "Locate additional Princeton CIC crew" },
  { priority: "medium", text: "Analyze satellite imagery archives for ocean disturbance" },
  { priority: "low", text: "Contact Jim Slaight (WSO, no public statements)" },
  { priority: "low", text: "Review E-2C Hawkeye crew testimony (VAW-117)" },
];

// ── COMPONENT ──

export default function WorkspacePage() {
  const [activeTab, setActiveTab] = useState("ach");
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState("hero");
  const [progressPct, setProgressPct] = useState(0);

  // Context menu state
  const [ctxVisible, setCtxVisible] = useState(false);
  const [ctxPos, setCtxPos] = useState({ x: 0, y: 0 });
  const [currentSelection, setCurrentSelection] = useState<{ text: string; range: Range } | null>(null);

  // Inline input state
  const [inlineVisible, setInlineVisible] = useState(false);
  const [inlineType, setInlineType] = useState<"note" | "url">("note");
  const [inlinePos, setInlinePos] = useState({ x: 0, y: 0 });
  const [pendingHighlightId, setPendingHighlightId] = useState<string | null>(null);

  // Annotation popover
  const [popoverVisible, setPopoverVisible] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
  const [popoverAnnId, setPopoverAnnId] = useState<string | null>(null);

  // Search
  const [searchQuery, setSearchQuery] = useState("");
  const [importedItems, setImportedItems] = useState<{ title: string; source: string }[]>([]);

  const mainContentRef = useRef<HTMLDivElement>(null);
  const caseContentRef = useRef<HTMLDivElement>(null);

  const { annotations, addNote, addAttachment, createAnnotation, getCount } = useAnnotations();
  const { humanVotes, cycleVote, tallyCounts } = useACHVotes();
  const { links, selectedNode, toggleNode } = useEvidenceLinks();

  // Highlight count
  const highlightCount = Object.keys(annotations).length;

  // Scroll progress + scroll spy
  useEffect(() => {
    const main = mainContentRef.current;
    if (!main) return;
    const handleScroll = () => {
      const scrollTop = main.scrollTop;
      const docHeight = main.scrollHeight - main.clientHeight;
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      setProgressPct(Math.min(pct, 100));
    };
    main.addEventListener("scroll", handleScroll, { passive: true });
    return () => main.removeEventListener("scroll", handleScroll);
  }, []);

  // IntersectionObserver for TOC
  useEffect(() => {
    const main = mainContentRef.current;
    if (!main) return;
    const sectionIds = ["hero", "summary", "encounter", "evidence", "witnesses", "analysis", "questions"];
    const elements = sectionIds.map(id => document.getElementById(id)).filter(Boolean) as HTMLElement[];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { root: main, rootMargin: "-10% 0px -80% 0px", threshold: 0 }
    );
    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Right-click context menu
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    const sel = window.getSelection();
    const hasSelection = sel && !sel.isCollapsed && sel.toString().trim().length > 0;
    const existingHl = (e.target as HTMLElement).closest(".hl-nemo, .hl-claude");

    if (!hasSelection && !existingHl) return;
    e.preventDefault();

    if (hasSelection && sel) {
      const range = sel.getRangeAt(0);
      setCurrentSelection({ text: sel.toString(), range: range.cloneRange() });
    }

    let x = e.clientX;
    let y = e.clientY;
    if (x + 220 > window.innerWidth) x = window.innerWidth - 228;
    if (y + 280 > window.innerHeight) y = window.innerHeight - 288;
    setCtxPos({ x, y });
    setCtxVisible(true);
  }, []);

  // Apply highlight
  const applyHighlight = useCallback((user: "nemo" | "claude") => {
    if (!currentSelection) return;
    const range = currentSelection.range;
    const span = document.createElement("span");
    const annId = "ann-" + Date.now();
    span.className = "hl-" + user;
    span.setAttribute("data-annotation-id", annId);
    span.setAttribute("data-user", user);
    span.setAttribute("data-count", "");

    try {
      range.surroundContents(span);
    } catch {
      const fragment = range.extractContents();
      span.appendChild(fragment);
      range.insertNode(span);
    }

    window.getSelection()?.removeAllRanges();
    setCurrentSelection(null);
    createAnnotation(annId, user);
    return annId;
  }, [currentSelection, createAnnotation]);

  // Context menu actions
  const ctxAction = useCallback((action: string) => {
    setCtxVisible(false);
    switch (action) {
      case "highlight-nemo":
        applyHighlight("nemo");
        break;
      case "highlight-claude":
        applyHighlight("claude");
        break;
      case "add-note": {
        const id = applyHighlight("nemo");
        if (id) {
          setPendingHighlightId(id);
          setInlineType("note");
          setInlinePos({ x: ctxPos.x, y: ctxPos.y + 30 });
          setInlineVisible(true);
        }
        break;
      }
      case "add-url": {
        const id = applyHighlight("nemo");
        if (id) {
          setPendingHighlightId(id);
          setInlineType("url");
          setInlinePos({ x: ctxPos.x, y: ctxPos.y + 30 });
          setInlineVisible(true);
        }
        break;
      }
      case "link-evidence":
        applyHighlight("nemo");
        setActiveTab("chain");
        break;
      case "search-selection":
        if (currentSelection) {
          setActiveTab("search");
          setSearchQuery(currentSelection.text.substring(0, 60));
        }
        break;
    }
  }, [applyHighlight, ctxPos, currentSelection]);

  // Submit inline input
  const submitInline = useCallback((noteText?: string, urlTitle?: string, urlValue?: string) => {
    if (!pendingHighlightId) return;
    if (inlineType === "note" && noteText) {
      addNote(pendingHighlightId, noteText);
      // Update DOM count
      const el = document.querySelector(`[data-annotation-id="${pendingHighlightId}"]`);
      if (el) el.setAttribute("data-count", String(getCount(pendingHighlightId) + 1));
    } else if (inlineType === "url" && urlValue) {
      addAttachment(pendingHighlightId, {
        type: "url",
        title: urlTitle || "Untitled link",
        url: urlValue,
      });
      const el = document.querySelector(`[data-annotation-id="${pendingHighlightId}"]`);
      if (el) el.setAttribute("data-count", String(getCount(pendingHighlightId) + 1));
    }
    setInlineVisible(false);
    setPendingHighlightId(null);
  }, [pendingHighlightId, inlineType, addNote, addAttachment, getCount]);

  // Click existing highlight -> popover
  const handleContentClick = useCallback((e: React.MouseEvent) => {
    const hl = (e.target as HTMLElement).closest(".hl-nemo, .hl-claude") as HTMLElement;
    if (hl) {
      e.preventDefault();
      const annId = hl.getAttribute("data-annotation-id");
      if (annId) {
        const rect = hl.getBoundingClientRect();
        setPopoverAnnId(annId);
        setPopoverPos({
          x: Math.min(rect.left, window.innerWidth - 340),
          y: rect.bottom + 8,
        });
        setPopoverVisible(true);
      }
      return;
    }
    if (!(e.target as HTMLElement).closest(".annotation-popover")) {
      setPopoverVisible(false);
    }
  }, []);

  // Card selection
  const selectCard = useCallback((cardId: string, type: string) => {
    setSelectedCard((prev) => (prev === cardId ? null : cardId));
    if (type === "evidence" || type === "witness") setActiveTab("chain");
    else if (type === "ai") setActiveTab("ach");
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCtxVisible(false);
        setPopoverVisible(false);
        setInlineVisible(false);
      }
      if (ctxVisible) {
        if (e.key === "n" || e.key === "N") { e.preventDefault(); ctxAction("add-note"); }
        if (e.key === "u" || e.key === "U") { e.preventDefault(); ctxAction("add-url"); }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && inlineVisible) {
        e.preventDefault();
        // Find and submit
        const textarea = document.getElementById("inlineTextarea") as HTMLTextAreaElement;
        if (textarea) submitInline(textarea.value.trim());
        const urlTitle = document.getElementById("inlineUrlTitle") as HTMLInputElement;
        const urlValue = document.getElementById("inlineUrlValue") as HTMLInputElement;
        if (urlValue) submitInline(undefined, urlTitle?.value?.trim(), urlValue.value.trim());
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [ctxVisible, ctxAction, inlineVisible, submitInline]);

  // Close ctx menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".ctx-menu")) {
        setCtxVisible(false);
      }
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  // Jump to next highlight
  const hlIndexRef = useRef(-1);
  const jumpToNextHighlight = useCallback(() => {
    const highlights = document.querySelectorAll(".hl-nemo, .hl-claude");
    if (!highlights.length) return;
    hlIndexRef.current = (hlIndexRef.current + 1) % highlights.length;
    const hl = highlights[hlIndexRef.current] as HTMLElement;
    hl.scrollIntoView({ behavior: "smooth", block: "center" });
    const annId = hl.getAttribute("data-annotation-id");
    if (annId) {
      const rect = hl.getBoundingClientRect();
      setPopoverAnnId(annId);
      setPopoverPos({ x: Math.min(rect.left, window.innerWidth - 340), y: rect.bottom + 8 });
      setPopoverVisible(true);
    }
  }, []);

  // Scroll to section
  const scrollToSection = useCallback((sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Import search result
  const importResult = useCallback((title: string, source: string, btn: HTMLButtonElement) => {
    setImportedItems(prev => [...prev, { title, source }]);
    btn.textContent = "\u2713 Imported";
    btn.style.background = "var(--green-soft)";
    btn.style.borderColor = "var(--green)";
    btn.style.color = "var(--green)";
    btn.disabled = true;
  }, []);

  // Add annotation from popover input
  const addPopoverAnnotation = useCallback((inputValue: string) => {
    if (!inputValue || !popoverAnnId) return;
    if (inputValue.match(/^https?:\/\//)) {
      addAttachment(popoverAnnId, {
        type: "url",
        title: inputValue.replace(/^https?:\/\/(www\.)?/, "").substring(0, 50),
        url: inputValue,
      });
    } else {
      addNote(popoverAnnId, inputValue);
    }
    // Update DOM
    const el = document.querySelector(`[data-annotation-id="${popoverAnnId}"]`);
    if (el) {
      const ann = annotations[popoverAnnId];
      if (ann) el.setAttribute("data-count", String(ann.notes.length + ann.attachments.length + 1));
    }
  }, [popoverAnnId, addNote, addAttachment, annotations]);

  const tocSections = [
    { id: "hero", label: "Overview" },
    { id: "summary", label: "Executive Summary" },
    { id: "encounter", label: "The Encounter" },
    { id: "evidence", label: "The Evidence" },
    { id: "witnesses", label: "The Witnesses" },
    { id: "analysis", label: "AI Analysis" },
    { id: "questions", label: "Open Questions" },
  ];

  const tabs = [
    { id: "ach", label: "ACH" },
    { id: "resolution", label: "Resolution" },
    { id: "osint", label: "OSINT" },
    { id: "chain", label: "Links" },
    { id: "search", label: "Search" },
    { id: "solvability", label: "Score" },
  ];

  const popoverAnn = popoverAnnId ? annotations[popoverAnnId] : null;

  return (
    <div className="workspace-app">
      {/* ═══ SIDEBAR ═══ */}
      <nav className="ws-sidebar">
        <div className="sidebar-logo">MERI<span>DIAN</span></div>

        <div className="sidebar-section-label">Case File</div>
        <ul className="toc-list">
          {tocSections.map((s) => (
            <li key={s.id}>
              <a
                className={activeSection === s.id ? "active" : ""}
                onClick={() => scrollToSection(s.id)}
              >
                {s.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="sidebar-divider"></div>

        <div className="sidebar-section-label">Investigation</div>
        <ul className="toc-list">
          <li><a onClick={() => setActiveTab("ach")}>ACH Matrix <span className="toc-badge tool">Tool</span></a></li>
          <li><a onClick={() => setActiveTab("resolution")}>Resolution <span className="toc-badge tool">Tool</span></a></li>
          <li><a onClick={() => setActiveTab("osint")}>OSINT Log <span className="toc-badge tool">Tool</span></a></li>
          <li><a onClick={() => setActiveTab("chain")}>Evidence Chain <span className="toc-badge tool">Tool</span></a></li>
          <li><a onClick={() => setActiveTab("search")}>Search & Import <span className="toc-badge human">Search</span></a></li>
          <li><a onClick={() => setActiveTab("solvability")}>Solvability <span className="toc-badge tool">Tool</span></a></li>
        </ul>

        <div className="sidebar-divider"></div>

        <div className="sidebar-section-label">Annotations</div>
        <ul className="toc-list">
          <li>
            <a onClick={jumpToNextHighlight}>
              &#9998; Next Highlight
              <span className="toc-badge human">{highlightCount}</span>
            </a>
          </li>
        </ul>
        <div style={{ padding: "4px 16px 0", fontSize: "8px", color: "var(--text-3)" }}>
          Right-click selected text to annotate
        </div>

        <div className="sidebar-footer">
          <div className="inv-row"><div className="inv-dot human"></div><span>Nemo</span> <span style={{ marginLeft: "auto", fontSize: "8px", color: "var(--orange)" }}>&#9632;</span></div>
          <div className="inv-row"><div className="inv-dot ai"></div><span>Claude</span> <span style={{ marginLeft: "auto", fontSize: "8px", color: "var(--purple)" }}>&#9632;</span></div>
        </div>
      </nav>

      {/* ═══ CASE CONTENT ═══ */}
      <div className="ws-main-content" ref={mainContentRef}>
        <div className="ws-progress-bar" style={{ width: `${progressPct}%` }}></div>
        <div className="content-inner" ref={caseContentRef} onContextMenu={handleContextMenu} onClick={handleContentClick}>

          <nav className="breadcrumb">
            <Link href="/">Meridian</Link>
            <span className="breadcrumb-sep">/</span>
            <Link href="/">Cases</Link>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">001 — USS Nimitz</span>
          </nav>

          <section id="hero" className="ws-hero">
            <div className="hero-case-id">CASE-001</div>
            <h1 className="ws-hero-title">USS Nimitz Encounter</h1>
            <div className="ws-hero-subtitle">The Tic Tac Incident</div>
            <div className="hero-meta">
              <span>November 14, 2004</span><span>&middot;</span>
              <span>Pacific Ocean, ~100mi SW of San Diego</span><span>&middot;</span>
              <span>~5 min visual encounter</span>
            </div>
            <div className="ws-status-pill"><span className="pulse-dot"></span>Investigating</div>
            <br />
            <div className="cred-badge">
              <div className="cred-score">92</div>
              <div className="cred-details"><div className="cred-tier">Tier 1</div><div>Credibility Score</div></div>
            </div>
            <div className="tag-pills">
              {["military","multi-sensor","multi-witness","radar-confirmed","infrared-confirmed","data-confiscation","congressional-testimony"].map(t => (
                <span key={t} className="tag-pill">{t}</span>
              ))}
            </div>
          </section>

          <section id="summary">
            <div className="section-label">Executive Summary</div>
            <div className="summary-text">
              <p>
                During routine pre-deployment training exercises in the Pacific Ocean off Southern California, the USS Nimitz Carrier Strike Group encountered{" "}
                <span className="hl-nemo" data-count={getCount("ann-4") || ""} data-annotation-id="ann-4" data-user="nemo">
                  multiple anomalous aerial vehicles over approximately five days
                </span>
                . The primary encounter on November 14, 2004 involved{" "}
                <span className="hl-claude" data-count={getCount("ann-1") || ""} data-annotation-id="ann-1" data-user="claude">
                  visual contact by two F/A-18F Super Hornet crews, radar tracking by the AN/SPY-1B system aboard USS Princeton, and infrared video capture via the ATFLIR pod
                </span>
                .
              </p>
              <p>
                The object — described as a{" "}
                <span className="hl-nemo" data-count={getCount("ann-2") || ""} data-annotation-id="ann-2" data-user="nemo">
                  white, featureless, elongated shape approximately 40 feet long resembling a Tic Tac candy
                </span>
                {" "}— demonstrated flight characteristics far beyond any known technology, including instantaneous acceleration, hypersonic speed without sonic boom, and apparent awareness of intercepting aircraft.
              </p>
            </div>
          </section>

          <section id="encounter">
            <div className="section-label">The Encounter</div>
            <div className="timeline">
              {timelineEvents.map((ev, i) => (
                <div key={i} className={`tl-event type-${ev.type}`}>
                  <div className="tl-date">{ev.date}</div>
                  <div className="tl-title">{ev.title}</div>
                  <div className="tl-detail">
                    {ev.hasHighlight === "ann-3" ? (
                      <>
                        <span className="hl-nemo" data-count={getCount("ann-3") || ""} data-annotation-id="ann-3" data-user="nemo">
                          Both crews spot a cross-shaped disturbance in the water — whitewater the size of a 737
                        </span>
                        . Hovering 50 ft above: a smooth, white, oblong object roughly 40 feet long. No wings, no exhaust. As Fravor descends, the object mirrors his movements — then accelerates away in under two seconds.
                      </>
                    ) : ev.hasHighlight === "ann-5" ? (
                      <>
                        The Tic Tac accelerates from near-hover to beyond visual range in under two seconds. Within moments,{" "}
                        <span className="hl-nemo" data-count={getCount("ann-5") || ""} data-annotation-id="ann-5" data-user="nemo">
                          Princeton&apos;s SPY-1 picks it up again — at the fighters&apos; CAP point, 60 miles away. No sonic boom. Implied speed: ~46,000 mph
                        </span>
                        .
                      </>
                    ) : ev.hasHighlight === "ann-6" ? (
                      <>
                        Unidentified individuals in plain clothes arrive aboard USS Princeton,{" "}
                        <span className="hl-nemo" data-count={getCount("ann-6") || ""} data-annotation-id="ann-6" data-user="nemo">
                          collect radar data tapes and FLIR recordings, and depart. No receipts. No chain of custody
                        </span>
                        . The originals have never resurfaced.
                      </>
                    ) : (
                      ev.detail
                    )}
                  </div>
                  <div className="tl-tags">
                    {ev.tags.map((t) => (
                      <span key={t.label} className={`tl-tag ${t.type}`}>{t.label}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section id="evidence">
            <div className="section-label">The Evidence</div>
            {evidenceCards.map((card, i) => (
              <div
                key={i}
                className={`evidence-card ${card.cardType} ${selectedCard === `ev-${i}` ? "selected" : ""}`}
                onClick={() => selectCard(`ev-${i}`, "evidence")}
              >
                <div className="accent-border"></div>
                <div className="card-inner">
                  <div className="card-type-row">
                    <span className="card-type-label">{card.typeLabel}</span>
                    <span className={`card-badge ${card.badgeClass}`}>{card.badge}</span>
                  </div>
                  <div className="card-title">{card.title}</div>
                  <div className="card-summary">{card.summary}</div>
                  <div className="link-count">{card.linkText}</div>
                </div>
              </div>
            ))}
          </section>

          <section id="witnesses">
            <div className="section-label">The Witnesses</div>
            {witnessCards.map((w, i) => (
              <div
                key={i}
                className={`witness-card ${selectedCard === `wit-${i}` ? "selected" : ""}`}
                onClick={() => selectCard(`wit-${i}`, "witness")}
              >
                <div className="witness-header">
                  <div className="witness-avatar">{w.initials}</div>
                  <div>
                    <div className="witness-name">{w.name}</div>
                    <div className="witness-rank">{w.rank}</div>
                  </div>
                </div>
                <div className="witness-observed">{w.observed}</div>
                {w.quote && (
                  <div className="witness-quote">
                    {w.quote}
                    <span className="quote-source">{w.quoteSource}</span>
                  </div>
                )}
              </div>
            ))}
          </section>

          <section id="analysis">
            <div className="section-label">AI Analysis</div>
            {aiCards.map((a, i) => (
              <div
                key={i}
                className={`ai-card ${selectedCard === `ai-${i}` ? "selected" : ""}`}
                onClick={() => selectCard(`ai-${i}`, "ai")}
              >
                <div className="ai-type">{a.aiType}</div>
                <div className="ai-title">{a.title}</div>
                <div className="ai-finding">{a.finding}</div>
                <span className={`confidence-badge ${a.confidenceClass}`}>{a.confidence}</span>
              </div>
            ))}
          </section>

          <section id="questions">
            <div className="section-label">Open Questions</div>
            {questions.map((q) => (
              <div key={q.num} className="question-item">
                <div className="question-number">{q.num}</div>
                <div className="question-text">{q.text}</div>
                <div className="question-context">{q.context}</div>
              </div>
            ))}
          </section>
        </div>
      </div>

      {/* ═══ INVESTIGATION COLUMN ═══ */}
      <div className="invest-column">
        <div className="invest-tabs">
          {tabs.map((t) => (
            <button
              key={t.id}
              className={`invest-tab ${activeTab === t.id ? "active" : ""}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="invest-body">

          {/* ACH MATRIX */}
          <div className={`invest-pane ${activeTab === "ach" ? "active" : ""}`}>
            <div className="invest-title">Analysis of Competing Hypotheses</div>
            <div style={{ fontSize: "9px", color: "var(--orange)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--orange)", display: "inline-block" }}></span>
              Click any cell to cast your vote — cycle through C / I / N
            </div>
            <table className="ach-matrix">
              <thead>
                <tr>
                  <th>Evidence</th>
                  {achHeaders.map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {achRows.map((row, ri) => (
                  <tr key={ri}>
                    <td>{row.evidence}</td>
                    {row.ai.map((aiVal, ci) => {
                      const human = humanVotes[ri]?.[ci] || "";
                      const displayVal = human || aiVal;
                      const isDash = displayVal === "-";
                      const cellClass = isDash ? "ach-na" : displayVal === "C" ? "ach-c" : displayVal === "I" ? "ach-i" : "ach-n";
                      const showSplit = human && human !== aiVal && aiVal !== "-";
                      return (
                        <td
                          key={ci}
                          className={`ach-cell ${showSplit ? "" : cellClass}`}
                          onClick={() => cycleVote(ri, ci)}
                        >
                          {showSplit ? (
                            <>
                              <span style={{ fontSize: "7px", color: "var(--text-3)" }}>{aiVal}</span>{" "}
                              <span className={human === "C" ? "ach-c" : human === "I" ? "ach-i" : "ach-n"} style={{ fontWeight: 700 }}>
                                {human}
                              </span>
                              <span className="human-vote"></span>
                            </>
                          ) : human ? (
                            <>
                              {displayVal}
                              <span className="human-vote"></span>
                            </>
                          ) : isDash ? (
                            "\u2014"
                          ) : (
                            displayVal
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ marginTop: 10, display: "flex", gap: 4, flexWrap: "wrap" }}>
              {tallyCounts.map((c, i) => {
                const color = c === 0 ? "var(--green)" : c <= 2 ? "var(--gold)" : "var(--red)";
                return (
                  <span key={i} style={{ fontSize: "8px", padding: "3px 8px", borderRadius: 3, background: "var(--bg)", border: "1px solid var(--border)" }}>
                    <span style={{ fontWeight: 600, color }}>{c}I</span> {achHeaders[i]}
                  </span>
                );
              })}
            </div>
            <div className="ach-verdict">
              <strong>ACH Assessment</strong>
              &ldquo;Unknown Technology&rdquo; is the only hypothesis with <strong>zero inconsistencies</strong>. &ldquo;Sensor Error&rdquo; has the fewest among conventional explanations (2), but is contradicted by multi-platform visual confirmation.{" "}
              <span className="hl-claude" data-count={getCount("ann-7") || ""} data-annotation-id="ann-7" data-user="claude">
                The ACH methodology identifies the least-disproven hypothesis — not the most supported.
              </span>
            </div>
          </div>

          {/* RESOLUTION */}
          <div className={`invest-pane ${activeTab === "resolution" ? "active" : ""}`}>
            <div className="invest-title">Resolution Checklist — Prosaic Explanations</div>
            {resolutionItems.map((item, i) => (
              <div key={i} className="checklist-item">
                <div className={`check-icon ${item.status}`}>
                  {item.status === "eliminated" ? "\u2713" : item.status === "partial" ? "~" : "?"}
                </div>
                <div>
                  <div className="check-label">{item.label}</div>
                  <div className="check-detail">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>

          {/* OSINT */}
          <div className={`invest-pane ${activeTab === "osint" ? "active" : ""}`}>
            <div className="invest-title">OSINT Verification Log</div>
            {osintItems.map((item, i) => (
              <div key={i} className="osint-item">
                <div className="osint-field">
                  {item.field}{" "}
                  <span className={`osint-status osint-${item.status}`}>
                    {item.status === "verified" ? "Verified" : item.status === "partial" ? "Partial" : "Unverified"}
                  </span>
                </div>
                <div className="osint-value">{item.value}</div>
                <div className="osint-source">{item.source}</div>
              </div>
            ))}
          </div>

          {/* EVIDENCE CHAIN + LINKING */}
          <div className={`invest-pane ${activeTab === "chain" ? "active" : ""}`}>
            <div className="invest-title">Evidence Chain — Provenance & Links</div>
            {chainItems.map((item) => (
              <div key={item.num} className="chain-item">
                <div className="chain-num">{item.num}</div>
                <div className="chain-content">
                  <div className="chain-source">{item.source}</div>
                  <div className="chain-note">{item.note}</div>
                  <div className="chain-corroboration">
                    <div className={`corr-dot ${item.strength}`}></div>
                    <span style={{ fontSize: "8px", color: "var(--text-3)" }}>{item.strengthLabel}</span>
                  </div>
                </div>
              </div>
            ))}

            <div className="link-graph-area">
              <div className="invest-title">Evidence Link Map</div>
              <div style={{ fontSize: "9px", color: "var(--orange)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--orange)", display: "inline-block" }}></span>
                Click two nodes to create a link between them
              </div>
              <div>
                {linkNodes.map((node) => (
                  <div
                    key={node.id}
                    className={`link-node ${selectedNode === node.id ? "active" : ""}`}
                    onClick={() => toggleNode(node.id)}
                  >
                    <span className={`ln-dot ${node.type}`}></span>
                    {node.label}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10 }}>
                {links.map((link, i) => (
                  <div key={i} className="link-connection">
                    <span style={{ fontSize: "9px", fontWeight: 500, color: "var(--text-1)" }}>{link.a}</span>
                    <span className="lc-line"></span>
                    <span className="lc-label">{link.label}</span>
                    <span className="lc-line"></span>
                    <span style={{ fontSize: "9px", fontWeight: 500, color: "var(--text-1)" }}>{link.b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SEARCH & IMPORT */}
          <div className={`invest-pane ${activeTab === "search" ? "active" : ""}`}>
            <div className="invest-title">Search & Import Evidence</div>
            <div style={{ fontSize: "9px", color: "var(--text-2)", marginBottom: 12 }}>
              Find external sources and bring them into this case file. Search across OSINT databases, academic papers, news archives, Reddit threads, and FOIA documents.
            </div>
            <div className="search-box">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. Nimitz FLIR analysis, Kevin Day interview..."
                onKeyDown={(e) => e.key === "Enter" && setSearchQuery(searchQuery)}
              />
              <button onClick={() => {}}>Search</button>
            </div>
            <div>
              {searchResults.map((r, i) => (
                <div key={i} className="search-result">
                  <div className="sr-source">
                    <span className={`sr-type-dot ${r.type}`}></span>
                    {r.source}
                  </div>
                  <div className="sr-title">{r.title}</div>
                  <div className="sr-snippet">{r.snippet}</div>
                  <div className="sr-actions">
                    <button className="sr-action primary" onClick={(e) => importResult(r.title, r.source, e.target as HTMLButtonElement)}>+ Import to case</button>
                    <button className="sr-action">Attach to highlight</button>
                    <button className="sr-action">Open source</button>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
              <div className="invest-title">Imported Evidence</div>
              {importedItems.length === 0 ? (
                <div style={{ fontSize: "9px", color: "var(--text-3)" }}>No items imported yet. Search and import sources above.</div>
              ) : (
                importedItems.map((item, i) => (
                  <div key={i} style={{ padding: "6px 8px", background: "var(--bg)", borderRadius: 4, marginBottom: 4, fontSize: "9px", display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: "var(--green)", fontWeight: 600 }}>{"\u2713"}</span>
                    <span style={{ color: "var(--text-1)", fontWeight: 500 }}>{item.title.substring(0, 50)}</span>
                    <span style={{ color: "var(--text-3)", marginLeft: "auto" }}>{item.source}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* SOLVABILITY */}
          <div className={`invest-pane ${activeTab === "solvability" ? "active" : ""}`}>
            <div className="invest-title">Solvability Assessment</div>
            <div style={{ fontSize: "11px", color: "var(--text-2)", marginBottom: 8 }}>Can this case be advanced with available tools?</div>
            <div style={{ fontSize: "28px", fontWeight: 600, color: "var(--gold)" }}>
              72 <span style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 400 }}>/ 100</span>
            </div>
            <div className="solv-meter"><div className="solv-fill" style={{ width: "72%" }}></div></div>
            {solvFactors.map((f, i) => (
              <div key={i} className="solv-factor">
                <span className="solv-factor-name">{f.name}</span>
                <span className={`solv-factor-score ${f.type}`}>{f.score}</span>
              </div>
            ))}
            <div className="next-steps">
              <div className="invest-title" style={{ marginTop: 8 }}>Recommended Next Steps</div>
              {nextSteps.map((s, i) => (
                <div key={i} className="next-step">
                  <span className={`step-priority priority-${s.priority}`}>{s.priority === "medium" ? "Med" : s.priority.charAt(0).toUpperCase() + s.priority.slice(1)}</span>
                  {s.text}
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ═══ RIGHT-CLICK CONTEXT MENU ═══ */}
      <div className={`ctx-menu ${ctxVisible ? "visible" : ""}`} style={{ left: ctxPos.x, top: ctxPos.y }}>
        <div className="ctx-menu-header">Highlight</div>
        <button className="ctx-menu-item" onClick={() => ctxAction("highlight-nemo")}>
          <span className="ctx-icon hl-nemo-icon">&#9632;</span> Highlight as Nemo
          <span className="ctx-shortcut">orange</span>
        </button>
        <button className="ctx-menu-item" onClick={() => ctxAction("highlight-claude")}>
          <span className="ctx-icon hl-claude-icon">&#9632;</span> Highlight as Claude
          <span className="ctx-shortcut">purple</span>
        </button>
        <div className="ctx-menu-divider"></div>
        <div className="ctx-menu-header">Annotate</div>
        <button className="ctx-menu-item" onClick={() => ctxAction("add-note")}>
          <span className="ctx-icon note-icon">&#9998;</span> Add Note
          <span className="ctx-shortcut">N</span>
        </button>
        <button className="ctx-menu-item" onClick={() => ctxAction("add-url")}>
          <span className="ctx-icon url-icon">&#128279;</span> Attach URL
          <span className="ctx-shortcut">U</span>
        </button>
        <div className="ctx-menu-divider"></div>
        <button className="ctx-menu-item" onClick={() => ctxAction("link-evidence")}>
          <span className="ctx-icon link-icon">&#8596;</span> Link to Evidence
        </button>
        <button className="ctx-menu-item" onClick={() => ctxAction("search-selection")}>
          <span className="ctx-icon search-icon">&#128269;</span> Search for this
        </button>
      </div>

      {/* ═══ INLINE NOTE/URL INPUT ═══ */}
      <div className={`inline-note-input ${inlineVisible ? "visible" : ""}`} style={{ left: inlinePos.x, top: inlinePos.y }}>
        <label>{inlineType === "note" ? "Add Note" : "Attach URL"}</label>
        <div>
          {inlineType === "note" ? (
            <textarea id="inlineTextarea" placeholder="What do you notice about this?" autoFocus />
          ) : (
            <>
              <input type="text" id="inlineUrlTitle" placeholder='Title (e.g. Fravor JRE Interview)' />
              <input type="url" id="inlineUrlValue" placeholder="https://..." />
            </>
          )}
        </div>
        <div className="inp-actions">
          <button className="inp-btn" onClick={() => setInlineVisible(false)}>Cancel</button>
          <button
            className="inp-btn primary"
            onClick={() => {
              if (inlineType === "note") {
                const textarea = document.getElementById("inlineTextarea") as HTMLTextAreaElement;
                submitInline(textarea?.value?.trim());
              } else {
                const title = (document.getElementById("inlineUrlTitle") as HTMLInputElement)?.value?.trim();
                const url = (document.getElementById("inlineUrlValue") as HTMLInputElement)?.value?.trim();
                submitInline(undefined, title, url);
              }
            }}
          >
            Save
          </button>
        </div>
      </div>

      {/* ═══ ANNOTATION POPOVER ═══ */}
      <div className={`annotation-popover ${popoverVisible ? "visible" : ""}`} style={{ left: popoverPos.x, top: popoverPos.y }}>
        <div className="annotation-popover-header">
          <div className="ann-user">
            {popoverAnn?.user === "claude" ? (
              <><span className="inv-dot ai" style={{ width: 8, height: 8 }}></span> Claude</>
            ) : (
              <><span className="inv-dot human" style={{ width: 8, height: 8 }}></span> Nemo</>
            )}
          </div>
          <button className="annotation-popover-close" onClick={() => setPopoverVisible(false)}>&times;</button>
        </div>
        <div className="annotation-popover-body">
          {popoverAnn && (
            <>
              {popoverAnn.notes.map((note, i) => (
                <div key={i} className={`annotation-note ${popoverAnn.user === "claude" ? "claude-note" : ""}`}>
                  {note}
                </div>
              ))}
              {popoverAnn.attachments.length > 0 && (
                <div className="annotation-attachments">
                  <div style={{ fontSize: "8px", letterSpacing: 1, textTransform: "uppercase", color: "var(--text-3)", marginBottom: 6 }}>Attachments</div>
                  {popoverAnn.attachments.map((att: Attachment, i: number) => (
                    <div key={i} className="annotation-attachment">
                      <span className="att-icon">{att.type === "video" ? "\u25B6" : att.type === "url" ? "\uD83D\uDD17" : "\uD83D\uDCC4"}</span>
                      <span className="att-title">{att.title}</span>
                      <span className="att-type">{att.type}</span>
                    </div>
                  ))}
                </div>
              )}
              {!popoverAnn.notes.length && !popoverAnn.attachments.length && (
                <div style={{ fontSize: "9px", color: "var(--text-3)", padding: "8px 0" }}>
                  No annotations yet. Right-click this highlight to add notes or URLs.
                </div>
              )}
            </>
          )}
        </div>
        <div className="annotation-input-area">
          <input
            type="text"
            placeholder="Add a note or paste a URL..."
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                addPopoverAnnotation((e.target as HTMLInputElement).value.trim());
                (e.target as HTMLInputElement).value = "";
              }
            }}
          />
          <button onClick={(e) => {
            const input = (e.target as HTMLElement).parentElement?.querySelector("input") as HTMLInputElement;
            if (input) {
              addPopoverAnnotation(input.value.trim());
              input.value = "";
            }
          }}>Add</button>
        </div>
      </div>
    </div>
  );
}

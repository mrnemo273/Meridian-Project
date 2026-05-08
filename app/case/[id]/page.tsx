"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import type { CaseWorkspaceData } from "@/types/case";
import { useEvidenceLinks } from "@/hooks/useEvidenceLinks";
import { useWorkspaceInteractions } from "@/hooks/useWorkspaceInteractions";
import { CaseSidebar } from "@/components/workspace/CaseSidebar";
import { CaseContent } from "@/components/workspace/CaseContent";
import { InvestColumn } from "@/components/workspace/InvestColumn";
import { ContextMenu } from "@/components/workspace/ContextMenu";
import { InlineInput, AnnotationPopover } from "@/components/workspace/AnnotationOverlays";
import { InviteModal } from "@/components/workspace/InviteModal";

export default function WorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<CaseWorkspaceData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState("ach");
  const [investExpanded, setInvestExpanded] = useState(false);
  const [leftDrawerOpen, setLeftDrawerOpen] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("hero");
  const [progressPct, setProgressPct] = useState(0);
  const mainContentRef = useRef<HTMLDivElement>(null);

  const { links, selectedNode, toggleNode } = useEvidenceLinks();

  // Tab changes from card selection / right-click actions auto-expand the invest panel.
  const openInvestTab = useCallback((tab: string) => {
    setActiveTab(tab);
    setInvestExpanded(true);
  }, []);
  const ix = useWorkspaceInteractions(openInvestTab, id);

  // Lock body scroll while a mobile drawer is open.
  useEffect(() => {
    const anyOpen = leftDrawerOpen || investExpanded;
    if (!anyOpen) return;
    const prev = document.body.style.overflow;
    if (window.matchMedia("(max-width: 900px)").matches) {
      document.body.style.overflow = "hidden";
    }
    return () => { document.body.style.overflow = prev; };
  }, [leftDrawerOpen, investExpanded]);

  // Escape closes whichever drawer is on top.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (investExpanded) setInvestExpanded(false);
      else if (leftDrawerOpen) setLeftDrawerOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [investExpanded, leftDrawerOpen]);

  // Load case data
  useEffect(() => {
    import(`@/data/case-${id}-workspace.json`)
      .then((m) => setCaseData(m.default as CaseWorkspaceData))
      .catch(() => setNotFound(true));
  }, [id]);

  // Scroll progress
  useEffect(() => {
    const main = mainContentRef.current;
    if (!main) return;
    const onScroll = () => {
      const max = main.scrollHeight - main.clientHeight;
      setProgressPct(max > 0 ? Math.min((main.scrollTop / max) * 100, 100) : 0);
    };
    main.addEventListener("scroll", onScroll, { passive: true });
    return () => main.removeEventListener("scroll", onScroll);
  }, [caseData]);

  // Scroll spy
  useEffect(() => {
    const main = mainContentRef.current;
    if (!main) return;
    const ids = ["hero", "summary", "verified-facts", "encounter", "evidence", "witnesses", "analysis", "questions"];
    const els = ids.map(i => document.getElementById(i)).filter(Boolean) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => entries.forEach((e) => { if (e.isIntersecting) setActiveSection(e.target.id); }),
      { root: main, rootMargin: "-10% 0px -80% 0px", threshold: 0 }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [caseData]);

  const selectCard = useCallback((cardId: string, type: string) => {
    setSelectedCard((prev) => (prev === cardId ? null : cardId));
    if (type === "evidence" || type === "witness") openInvestTab("chain");
    else if (type === "ai") openInvestTab("ach");
  }, [openInvestTab]);

  const scrollToSection = useCallback((sectionId: string) => {
    document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
  }, []);

  if (notFound) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg)", color: "var(--text-1)", fontFamily: "var(--font-mono)" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: "48px", fontFamily: "var(--font-serif)", marginBottom: 16 }}>Case Not Found</div>
          <div style={{ color: "var(--text-3)", marginBottom: 24 }}>No data file exists for case {id}.</div>
          <Link href="/" style={{ color: "var(--gold)", textDecoration: "underline" }}>&larr; Back to Cases</Link>
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", background: "var(--bg)", color: "var(--text-3)", fontFamily: "var(--font-mono)" }}>
        Loading case data...
      </div>
    );
  }

  return (
    <div className={`workspace-app ${leftDrawerOpen ? "left-drawer-open" : ""} ${investExpanded ? "invest-expanded" : ""}`}>
      <header className="workspace-mobile-header">
        <button
          className="ws-mobile-menu-btn"
          onClick={() => setLeftDrawerOpen(true)}
          aria-label="Open navigation"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="ws-mobile-title">{caseData.caseNumber}</span>
      </header>

      <CaseSidebar
        caseNumber={caseData.caseNumber} caseTitle={caseData.title}
        activeSection={activeSection} activeTab={activeTab}
        highlightCount={ix.highlightCount} scrollToSection={scrollToSection}
        setActiveTab={openInvestTab} jumpToNextHighlight={ix.jumpToNextHighlight}
        onInvite={() => setInviteOpen(true)}
        mobileOpen={leftDrawerOpen}
        onMobileClose={() => setLeftDrawerOpen(false)}
      />
      <CaseContent
        ref={mainContentRef} data={caseData} progressPct={progressPct}
        selectedCard={selectedCard} selectCard={selectCard}
        getCount={ix.getCount} onContextMenu={ix.handleContextMenu} onClick={ix.handleContentClick}
      />
      <InvestColumn
        data={caseData} activeTab={activeTab} setActiveTab={setActiveTab}
        expanded={investExpanded} setExpanded={setInvestExpanded}
        links={links} selectedNode={selectedNode} toggleNode={toggleNode}
        getCount={ix.getCount} selectedCard={selectedCard}
      />

      {(leftDrawerOpen || investExpanded) && (
        <div
          className="workspace-backdrop"
          onClick={() => {
            setLeftDrawerOpen(false);
            setInvestExpanded(false);
          }}
          aria-hidden="true"
        />
      )}

      <InviteModal visible={inviteOpen} onClose={() => setInviteOpen(false)} />
      <ContextMenu visible={ix.ctxVisible} pos={ix.ctxPos} onAction={ix.ctxAction} />
      <InlineInput visible={ix.inlineVisible} pos={ix.inlinePos} type={ix.inlineType} onClose={ix.closeInline} onSubmit={ix.submitInline} />
      <AnnotationPopover
        visible={ix.popoverVisible} pos={ix.popoverPos} annId={ix.popoverAnnId}
        annotation={ix.popoverAnn} onClose={ix.closePopover} onAdd={ix.addPopoverAnnotation}
      />
    </div>
  );
}

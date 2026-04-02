"use client";

import { forwardRef, useState, useCallback } from "react";
import Link from "next/link";
import type { CaseWorkspaceData } from "@/types/case";
import { HeroSection } from "./HeroSection";
import { VerifiedFacts } from "./VerifiedFacts";
import { TimelineSection } from "./TimelineSection";
import { EvidenceSection } from "./EvidenceSection";
import { EvidenceGallery } from "./EvidenceGallery";
import { WitnessSection } from "./WitnessSection";
import { AIAnalysisSection } from "./AIAnalysisSection";
import { QuestionsSection } from "./QuestionsSection";
import { ResearchBranchPanel } from "./ResearchBranchPanel";

interface Props {
  data: CaseWorkspaceData;
  progressPct: number;
  selectedCard: string | null;
  selectCard: (id: string, type: string) => void;
  getCount: (id: string) => number;
  onContextMenu: (e: React.MouseEvent) => void;
  onClick: (e: React.MouseEvent) => void;
}

export const CaseContent = forwardRef<HTMLDivElement, Props>(function CaseContent(
  { data, progressPct, selectedCard, selectCard, getCount, onContextMenu, onClick },
  ref
) {
  const [expandedBranch, setExpandedBranch] = useState<string | null>(null);
  const branches = data.researchBranches || [];

  const handleExpandBranch = useCallback((branchId: string) => {
    setExpandedBranch((prev) => (prev === branchId ? null : branchId));
  }, []);

  const expandedBranchData = branches.find((b) => b.id === expandedBranch);

  const timelineBranches = branches.filter((b) => b.anchorSection === "timeline");
  const evidenceBranches = branches.filter((b) => b.anchorSection === "evidence");
  const analysisBranches = branches.filter((b) => b.anchorSection === "analysis");

  return (
    <div className="ws-main-content" ref={ref}>
      <div className="ws-progress-bar" style={{ width: `${progressPct}%` }}></div>
      <div className="content-inner" onContextMenu={onContextMenu} onClick={onClick}>

        <nav className="breadcrumb">
          <Link href="/">Cases</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current">{data.caseNumber} — {data.title}</span>
        </nav>

        <HeroSection data={data} getCount={getCount} />
        <VerifiedFacts
          facts={data.verifiedFacts || []}
          branches={branches}
          onExpandBranch={handleExpandBranch}
          expandedBranch={expandedBranch}
        />
        {expandedBranchData && expandedBranchData.anchorSection === "fact" && (
          <ResearchBranchPanel branch={expandedBranchData} onCollapse={() => setExpandedBranch(null)} />
        )}
        <TimelineSection
          events={data.timeline}
          getCount={getCount}
          branches={timelineBranches}
          onExpandBranch={handleExpandBranch}
          expandedBranch={expandedBranch}
        />
        {expandedBranchData && expandedBranchData.anchorSection === "timeline" && (
          <ResearchBranchPanel branch={expandedBranchData} onCollapse={() => setExpandedBranch(null)} />
        )}
        <EvidenceSection
          cards={data.evidence}
          selectedCard={selectedCard}
          selectCard={selectCard}
          branches={evidenceBranches}
          onExpandBranch={handleExpandBranch}
          expandedBranch={expandedBranch}
        />
        {expandedBranchData && expandedBranchData.anchorSection === "evidence" && (
          <ResearchBranchPanel branch={expandedBranchData} onCollapse={() => setExpandedBranch(null)} />
        )}
        <EvidenceGallery items={data.gallery || []} />
        <WitnessSection cards={data.witnesses} selectedCard={selectedCard} selectCard={selectCard} />
        <AIAnalysisSection
          cards={data.aiAnalysis}
          selectedCard={selectedCard}
          selectCard={selectCard}
          branches={analysisBranches}
          onExpandBranch={handleExpandBranch}
          expandedBranch={expandedBranch}
        />
        {expandedBranchData && expandedBranchData.anchorSection === "analysis" && (
          <ResearchBranchPanel branch={expandedBranchData} onCollapse={() => setExpandedBranch(null)} />
        )}
        <QuestionsSection questions={data.openQuestions} />
      </div>
    </div>
  );
});

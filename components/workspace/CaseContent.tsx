import { forwardRef } from "react";
import Link from "next/link";
import type { CaseWorkspaceData } from "@/types/case";
import { HeroSection } from "./HeroSection";
import { TimelineSection } from "./TimelineSection";
import { EvidenceSection } from "./EvidenceSection";
import { EvidenceGallery } from "./EvidenceGallery";
import { WitnessSection } from "./WitnessSection";
import { AIAnalysisSection } from "./AIAnalysisSection";
import { QuestionsSection } from "./QuestionsSection";

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
        <TimelineSection events={data.timeline} getCount={getCount} />
        <EvidenceSection cards={data.evidence} selectedCard={selectedCard} selectCard={selectCard} />
        <EvidenceGallery items={data.gallery || []} />
        <WitnessSection cards={data.witnesses} selectedCard={selectedCard} selectCard={selectCard} />
        <AIAnalysisSection cards={data.aiAnalysis} selectedCard={selectedCard} selectCard={selectCard} />
        <QuestionsSection questions={data.openQuestions} />
      </div>
    </div>
  );
});

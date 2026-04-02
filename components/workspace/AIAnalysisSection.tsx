import type { AIAnalysisCard, ResearchBranch } from "@/types/case";
import { BranchMarker } from "./BranchMarker";

interface Props {
  cards: AIAnalysisCard[];
  selectedCard: string | null;
  selectCard: (id: string, type: string) => void;
  branches?: ResearchBranch[];
  onExpandBranch?: (branchId: string) => void;
  expandedBranch?: string | null;
}

export function AIAnalysisSection({ cards, selectedCard, selectCard, branches = [], onExpandBranch, expandedBranch }: Props) {
  return (
    <section id="analysis">
      <div className="section-label">AI Analysis</div>
      {cards.map((a, i) => {
        const cardBranches = branches.filter(
          (b) => b.anchorId === `ai-${i}`
        );
        return (
          <div
            key={i}
            className={`ai-card ${selectedCard === `ai-${i}` ? "selected" : ""}`}
            onClick={() => selectCard(`ai-${i}`, "ai")}
            style={{ position: "relative" }}
          >
            <div className="ai-type">{a.aiType}</div>
            <div className="ai-title">{a.title}</div>
            <div className="ai-finding">{a.finding}</div>
            <span className={`confidence-badge ${a.confidenceClass}`}>{a.confidence}</span>
            {cardBranches.length > 0 && (
              <BranchMarker
                count={cardBranches.length}
                branchId={cardBranches[0].id}
                question={cardBranches[0].question}
                onExpand={onExpandBranch}
                isExpanded={expandedBranch === cardBranches[0].id}
              />
            )}
          </div>
        );
      })}
    </section>
  );
}

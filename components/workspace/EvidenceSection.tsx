import Image from "next/image";
import type { EvidenceCard, ResearchBranch } from "@/types/case";
import { BranchMarker } from "./BranchMarker";

interface Props {
  cards: EvidenceCard[];
  selectedCard: string | null;
  selectCard: (id: string, type: string) => void;
  branches?: ResearchBranch[];
  onExpandBranch?: (branchId: string) => void;
  expandedBranch?: string | null;
}

export function EvidenceSection({ cards, selectedCard, selectCard, branches = [], onExpandBranch, expandedBranch }: Props) {
  return (
    <section id="evidence">
      <div className="section-label">The Evidence</div>
      {cards.map((card, i) => {
        const cardBranches = branches.filter(
          (b) => b.anchorId === `ev-${i}`
        );
        return (
          <div
            key={i}
            className={`evidence-card ${card.cardType} ${selectedCard === `ev-${i}` ? "selected" : ""}`}
            onClick={() => selectCard(`ev-${i}`, "evidence")}
            style={{ position: "relative" }}
          >
            <div className="accent-border"></div>
            <div className={`card-inner ${card.image ? "has-image" : ""}`}>
              <div className="card-text">
                <div className="card-type-row">
                  <span className="card-type-label">{card.typeLabel}</span>
                  <span className={`card-badge ${card.badgeClass}`}>{card.badge}</span>
                </div>
                <div className="card-title">{card.title}</div>
                <div className="card-summary">{card.summary}</div>
                <div className="link-count">{card.linkText}</div>
              </div>
              {card.image && (
                <Image
                  src={card.image}
                  alt={card.imageAlt || card.title}
                  width={240}
                  height={160}
                  className="card-thumb"
                />
              )}
            </div>
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

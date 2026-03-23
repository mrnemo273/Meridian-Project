import type { EvidenceCard } from "@/types/case";

interface Props {
  cards: EvidenceCard[];
  selectedCard: string | null;
  selectCard: (id: string, type: string) => void;
}

export function EvidenceSection({ cards, selectedCard, selectCard }: Props) {
  return (
    <section id="evidence">
      <div className="section-label">The Evidence</div>
      {cards.map((card, i) => (
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
  );
}

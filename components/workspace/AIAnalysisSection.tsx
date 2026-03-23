import type { AIAnalysisCard } from "@/types/case";

interface Props {
  cards: AIAnalysisCard[];
  selectedCard: string | null;
  selectCard: (id: string, type: string) => void;
}

export function AIAnalysisSection({ cards, selectedCard, selectCard }: Props) {
  return (
    <section id="analysis">
      <div className="section-label">AI Analysis</div>
      {cards.map((a, i) => (
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
  );
}

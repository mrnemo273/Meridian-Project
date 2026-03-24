import Image from "next/image";
import type { WitnessCard } from "@/types/case";

interface Props {
  cards: WitnessCard[];
  selectedCard: string | null;
  selectCard: (id: string, type: string) => void;
}

export function WitnessSection({ cards, selectedCard, selectCard }: Props) {
  return (
    <section id="witnesses">
      <div className="section-label">The Witnesses</div>
      {cards.map((w, i) => (
        <div
          key={i}
          className={`witness-card ${selectedCard === `wit-${i}` ? "selected" : ""}`}
          onClick={() => selectCard(`wit-${i}`, "witness")}
        >
          <div className="witness-header">
            {w.image ? (
              <Image
                src={w.image}
                alt={w.imageAlt || w.name}
                width={36}
                height={36}
                className="witness-photo"
              />
            ) : (
              <div className="witness-avatar">{w.initials}</div>
            )}
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
  );
}

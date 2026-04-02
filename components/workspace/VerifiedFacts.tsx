"use client";

import { useState } from "react";
import type { VerifiedFact, ResearchBranch } from "@/types/case";
import { BranchMarker } from "./BranchMarker";

interface Props {
  facts: VerifiedFact[];
  branches?: ResearchBranch[];
  onExpandBranch?: (branchId: string) => void;
  expandedBranch?: string | null;
}

const categoryColors: Record<string, string> = {
  sensor: "var(--blue)",
  witness: "var(--gold)",
  physical: "var(--green)",
  documentary: "var(--purple)",
  temporal: "var(--orange)",
  environmental: "var(--text-3)",
};

const confidenceLabels: Record<string, { label: string; className: string }> = {
  confirmed: { label: "Confirmed", className: "conf-confirmed" },
  high: { label: "High Confidence", className: "conf-high" },
  disputed: { label: "Disputed", className: "conf-disputed" },
};

export function VerifiedFacts({ facts, branches = [], onExpandBranch, expandedBranch }: Props) {
  const [hoveredFact, setHoveredFact] = useState<string | null>(null);

  if (facts.length === 0) return null;

  const handleFactClick = (fact: VerifiedFact) => {
    if (fact.relatedEvidence) {
      const el = document.getElementById("evidence");
      el?.scrollIntoView({ behavior: "smooth" });
    } else if (fact.relatedTimeline) {
      const el = document.getElementById("encounter");
      el?.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="verified-facts">
      <div className="section-label">Verified Facts &mdash; What We Know</div>
      <div className="vf-subtitle">
        These facts are confirmed by multiple independent sources. Everything below builds on this foundation.
      </div>
      <div className="vf-grid">
        {facts.map((fact) => {
          const conf = confidenceLabels[fact.confidence];
          const factBranches = branches.filter(
            (b) => b.anchorSection === "fact" && b.anchorId === fact.id
          );
          const isClickable = !!(fact.relatedEvidence || fact.relatedTimeline);
          return (
            <div
              key={fact.id}
              className={`vf-card ${hoveredFact === fact.id ? "hovered" : ""} ${isClickable ? "clickable" : ""}`}
              onMouseEnter={() => setHoveredFact(fact.id)}
              onMouseLeave={() => setHoveredFact(null)}
              onClick={() => handleFactClick(fact)}
            >
              <div className="vf-card-header">
                <span
                  className="vf-category-dot"
                  style={{ background: categoryColors[fact.category] || "var(--text-3)" }}
                />
                <span className="vf-id">{fact.id}</span>
                <span className={`vf-confidence ${conf.className}`}>{conf.label}</span>
              </div>
              <div className="vf-fact">{fact.fact}</div>
              <div className="vf-sources">
                {fact.sources.map((s, i) => (
                  <span key={i} className="vf-source">{s}</span>
                ))}
              </div>
              {fact.disputedBy && (
                <div className="vf-disputed">Disputed: {fact.disputedBy}</div>
              )}
              {factBranches.length > 0 && (
                <BranchMarker
                  count={factBranches.length}
                  branchId={factBranches[0].id}
                  question={factBranches[0].question}
                  onExpand={onExpandBranch}
                  isExpanded={expandedBranch === factBranches[0].id}
                />
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}

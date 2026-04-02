"use client";

import { useState } from "react";

interface Props {
  count: number;
  branchId: string;
  question: string;
  onExpand?: (branchId: string) => void;
  isExpanded?: boolean;
}

export function BranchMarker({ count, branchId, question, onExpand, isExpanded }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div
      className={`branch-marker-wrap ${isExpanded ? "expanded" : ""}`}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={(e) => {
        e.stopPropagation();
        onExpand?.(branchId);
      }}
    >
      <div className="branch-marker-line" />
      {count > 1 && <span className="branch-marker-count">{count}</span>}
      {showTooltip && !isExpanded && (
        <div className="branch-marker-tooltip">{question}</div>
      )}
    </div>
  );
}

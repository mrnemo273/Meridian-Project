"use client";

import type { ResearchBranch } from "@/types/case";

interface Props {
  branch: ResearchBranch;
  onCollapse: () => void;
}

const findingTypeColors: Record<string, string> = {
  source: "var(--blue)",
  calculation: "var(--gold)",
  analysis: "var(--purple)",
  contradiction: "var(--red)",
  confirmation: "var(--green)",
};

const findingTypeBg: Record<string, string> = {
  source: "var(--blue-soft)",
  calculation: "var(--gold-soft)",
  analysis: "var(--purple-soft)",
  contradiction: "var(--red-soft)",
  confirmation: "var(--green-soft)",
};

const statusLabels: Record<string, { label: string; className: string }> = {
  open: { label: "open", className: "rb-status-open" },
  in_progress: { label: "in progress", className: "rb-status-progress" },
  resolved: { label: "resolved", className: "rb-status-resolved" },
};

export function ResearchBranchPanel({ branch, onCollapse }: Props) {
  const status = statusLabels[branch.status] || statusLabels.open;

  return (
    <div className="rb-panel">
      <div className="rb-panel-header">
        <span className="rb-panel-icon">&#9670;</span>
        <span className="rb-panel-title">Research Branch {branch.id}</span>
        <span className={`rb-status-pill ${status.className}`}>{status.label}</span>
        <button className="rb-collapse-btn" onClick={onCollapse}>&#9652;</button>
      </div>

      <div className="rb-question">&ldquo;{branch.question}&rdquo;</div>

      <div className="rb-meta">
        {branch.anchorId && (
          <span className="rb-anchor">Anchored to: {branch.anchorId}</span>
        )}
        <span className="rb-creator">
          Started by: {branch.createdBy} &middot; {branch.createdAt}
        </span>
      </div>

      {branch.findings.length > 0 && (
        <div className="rb-findings">
          <div className="rb-findings-label">Findings</div>
          {branch.findings.map((f) => (
            <div key={f.id} className="rb-finding">
              <div className="rb-finding-header">
                <span className="rb-finding-dot">&#9702;</span>
                <span className="rb-finding-source">{f.source || f.addedBy}</span>
                <span
                  className="rb-finding-type"
                  style={{
                    color: findingTypeColors[f.type] || "var(--text-3)",
                    background: findingTypeBg[f.type] || "var(--board-bg)",
                  }}
                >
                  {f.type}
                </span>
              </div>
              <div className="rb-finding-content">{f.content}</div>
              {f.source && (
                <div className="rb-finding-source-line">Source: {f.source}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {branch.conclusion && (
        <div className="rb-conclusion">
          <div className="rb-conclusion-label">Conclusion</div>
          <div className="rb-conclusion-text">{branch.conclusion}</div>
        </div>
      )}

      {!branch.conclusion && branch.status !== "resolved" && (
        <div className="rb-conclusion">
          <div className="rb-conclusion-text" style={{ fontStyle: "italic", color: "var(--text-3)" }}>
            Not yet resolved.
          </div>
        </div>
      )}
    </div>
  );
}

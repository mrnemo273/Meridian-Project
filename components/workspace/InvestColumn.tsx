"use client";

import { useCallback, useState } from "react";
import type { CaseWorkspaceData, HypothesisProbability, ResearchBranch } from "@/types/case";
import { linkNodes } from "@/hooks/useEvidenceLinks";
import type { Attachment } from "@/hooks/useAnnotations";
import { CommentThread } from "@/components/workspace/CommentThread";

interface Props {
  data: CaseWorkspaceData;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // ACH
  humanVotes: string[][];
  cycleVote: (row: number, col: number) => void;
  tallyCounts: number[];
  // Evidence links
  links: { a: string; b: string; label: string }[];
  selectedNode: string | null;
  toggleNode: (id: string) => void;
  // Annotations
  getCount: (id: string) => number;
  // Comments
  selectedCard?: string | null;
}

const tabs = [
  { id: "ach", label: "ACH" },
  { id: "resolution", label: "Resolution" },
  { id: "osint", label: "OSINT" },
  { id: "chain", label: "Links" },
  { id: "search", label: "Search" },
  { id: "solvability", label: "Score" },
  { id: "branches", label: "Branches" },
  { id: "comments", label: "Discuss" },
];

export function InvestColumn({
  data,
  activeTab,
  setActiveTab,
  humanVotes,
  cycleVote,
  tallyCounts,
  links,
  selectedNode,
  toggleNode,
  getCount,
  selectedCard,
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [importedItems, setImportedItems] = useState<{ title: string; source: string }[]>([]);
  const [expandedReasoning, setExpandedReasoning] = useState<string | null>(null);

  const importResult = useCallback((title: string, source: string, btn: HTMLButtonElement) => {
    setImportedItems(prev => [...prev, { title, source }]);
    btn.textContent = "\u2713 Imported";
    btn.style.background = "var(--green-soft)";
    btn.style.borderColor = "var(--green)";
    btn.style.color = "var(--green)";
    btn.disabled = true;
  }, []);

  const achHypotheses = data.achHypotheses;
  const achEvidence = data.achEvidence;
  const probabilities = (data.hypothesisProbabilities || []).slice().sort((a, b) => b.probability - a.probability);
  const branches = data.researchBranches || [];

  const factCount = (data.verifiedFacts || []).length;
  const evidenceCount = data.evidence.length;

  return (
    <div className="invest-column">
      <div className="invest-tabs">
        {tabs.map((t) => (
          <button
            key={t.id}
            className={`invest-tab ${activeTab === t.id ? "active" : ""}`}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="invest-body">

        {/* ACH MATRIX */}
        <div className={`invest-pane ${activeTab === "ach" ? "active" : ""}`}>
          <div className="invest-title">Analysis of Competing Hypotheses</div>
          <div style={{ fontSize: "9px", color: "var(--orange)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--orange)", display: "inline-block" }}></span>
            Click any cell to cast your vote — cycle through C / I / N
          </div>
          <table className="ach-matrix">
            <thead>
              <tr>
                <th>Evidence</th>
                {achHypotheses.map((h) => (
                  <th key={h}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {achEvidence.map((row, ri) => (
                <tr key={ri}>
                  <td>{row.evidence}</td>
                  {row.ai.map((aiVal, ci) => {
                    const human = humanVotes[ri]?.[ci] || "";
                    const displayVal = human || aiVal;
                    const isDash = displayVal === "-";
                    const cellClass = isDash ? "ach-na" : displayVal === "C" ? "ach-c" : displayVal === "I" ? "ach-i" : "ach-n";
                    const showSplit = human && human !== aiVal && aiVal !== "-";
                    return (
                      <td
                        key={ci}
                        className={`ach-cell ${showSplit ? "" : cellClass}`}
                        onClick={() => cycleVote(ri, ci)}
                      >
                        {showSplit ? (
                          <>
                            <span style={{ fontSize: "7px", color: "var(--text-3)" }}>{aiVal}</span>{" "}
                            <span className={human === "C" ? "ach-c" : human === "I" ? "ach-i" : "ach-n"} style={{ fontWeight: 700 }}>
                              {human}
                            </span>
                            <span className="human-vote"></span>
                          </>
                        ) : human ? (
                          <>
                            {displayVal}
                            <span className="human-vote"></span>
                          </>
                        ) : isDash ? (
                          "\u2014"
                        ) : (
                          displayVal
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 10, display: "flex", gap: 4, flexWrap: "wrap" }}>
            {tallyCounts.map((c, i) => {
              const color = c === 0 ? "var(--green)" : c <= 2 ? "var(--gold)" : "var(--red)";
              return (
                <span key={i} style={{ fontSize: "8px", padding: "3px 8px", borderRadius: 3, background: "var(--bg)", border: "1px solid var(--border)" }}>
                  <span style={{ fontWeight: 600, color }}>{c}I</span> {achHypotheses[i]}
                </span>
              );
            })}
          </div>
          <div className="ach-verdict">
            <strong>ACH Assessment</strong>
            &ldquo;Unknown Technology&rdquo; is the only hypothesis with <strong>zero inconsistencies</strong>. &ldquo;Sensor Error&rdquo; has the fewest among conventional explanations (2), but is contradicted by multi-platform visual confirmation.{" "}
            <span className="hl-claude" data-count={getCount("ann-7") || ""} data-annotation-id="ann-7" data-user="claude">
              The ACH methodology identifies the least-disproven hypothesis — not the most supported.
            </span>
          </div>

          {/* HYPOTHESIS PROBABILITIES */}
          {probabilities.length > 0 && (
            <div className="hp-panel">
              <div className="hp-panel-title">Hypothesis Probability Assessment</div>
              <div className="hp-panel-subtitle">
                Based on {factCount} verified facts, {evidenceCount} evidence items, and qualitative ACH analysis
              </div>
              {probabilities.map((hp, i) => {
                const isLeading = i === 0;
                const trendIcon = hp.trend === "rising" ? "\u25B2" : hp.trend === "falling" ? "\u25BC" : "\u25CF";
                const trendColor = hp.trend === "rising" ? "var(--green)" : hp.trend === "falling" ? "var(--red)" : "var(--text-3)";
                const contradictions = hp.keyFactors.contradicts.length;
                const isExpanded = expandedReasoning === hp.hypothesis;
                return (
                  <div key={hp.hypothesis} className="hp-row">
                    <div className="hp-row-header">
                      <span className="hp-hypothesis">{hp.hypothesis}</span>
                      <span className="hp-pct">{hp.probability}%</span>
                    </div>
                    <div className="hp-bar-track">
                      <div
                        className="hp-bar-fill"
                        style={{
                          width: `${hp.probability}%`,
                          background: isLeading ? "var(--gold)" : "var(--text-3)",
                          opacity: isLeading ? 1 : 0.5,
                        }}
                      />
                    </div>
                    <div className="hp-meta">
                      <span style={{ color: trendColor, fontSize: "9px" }}>
                        {trendIcon} {hp.trend}
                      </span>
                      <span style={{ fontSize: "9px", color: "var(--text-3)" }}>
                        {contradictions} contradiction{contradictions !== 1 ? "s" : ""}
                      </span>
                    </div>
                    <div
                      className="hp-reasoning-toggle"
                      onClick={() => setExpandedReasoning(isExpanded ? null : hp.hypothesis)}
                    >
                      {isExpanded ? hp.reasoning : hp.reasoning.split(". ")[0] + "."}
                      {!isExpanded && hp.reasoning.includes(". ") && (
                        <span className="hp-more"> more...</span>
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="hp-footer">
                Probabilities are AI-derived estimates based on available evidence. They are not predictions — they reflect what the evidence mathematically supports given current data.
              </div>
            </div>
          )}
        </div>

        {/* RESOLUTION */}
        <div className={`invest-pane ${activeTab === "resolution" ? "active" : ""}`}>
          <div className="invest-title">Resolution Checklist — Prosaic Explanations</div>
          {data.resolution.map((item, i) => (
            <div key={i} className="checklist-item">
              <div className={`check-icon ${item.status}`}>
                {item.status === "eliminated" ? "\u2713" : item.status === "partial" ? "~" : "?"}
              </div>
              <div>
                <div className="check-label">{item.label}</div>
                <div className="check-detail">{item.detail}</div>
              </div>
            </div>
          ))}
        </div>

        {/* OSINT */}
        <div className={`invest-pane ${activeTab === "osint" ? "active" : ""}`}>
          <div className="invest-title">OSINT Verification Log</div>
          {data.osint.map((item, i) => (
            <div key={i} className="osint-item">
              <div className="osint-field">
                {item.field}{" "}
                <span className={`osint-status osint-${item.status}`}>
                  {item.status === "verified" ? "Verified" : item.status === "partial" ? "Partial" : "Unverified"}
                </span>
              </div>
              <div className="osint-value">{item.value}</div>
              <div className="osint-source">{item.source}</div>
            </div>
          ))}
        </div>

        {/* EVIDENCE CHAIN + LINKING */}
        <div className={`invest-pane ${activeTab === "chain" ? "active" : ""}`}>
          <div className="invest-title">Evidence Chain — Provenance & Links</div>
          {data.evidenceChain.map((item) => (
            <div key={item.num} className="chain-item">
              <div className="chain-num">{item.num}</div>
              <div className="chain-content">
                <div className="chain-source">{item.source}</div>
                <div className="chain-note">{item.note}</div>
                <div className="chain-corroboration">
                  <div className={`corr-dot ${item.strength}`}></div>
                  <span style={{ fontSize: "8px", color: "var(--text-3)" }}>{item.strengthLabel}</span>
                </div>
              </div>
            </div>
          ))}

          <div className="link-graph-area">
            <div className="invest-title">Evidence Link Map</div>
            <div style={{ fontSize: "9px", color: "var(--orange)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--orange)", display: "inline-block" }}></span>
              Click two nodes to create a link between them
            </div>
            <div>
              {linkNodes.map((node) => (
                <div
                  key={node.id}
                  className={`link-node ${selectedNode === node.id ? "active" : ""}`}
                  onClick={() => toggleNode(node.id)}
                >
                  <span className={`ln-dot ${node.type}`}></span>
                  {node.label}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10 }}>
              {links.map((link, i) => (
                <div key={i} className="link-connection">
                  <span style={{ fontSize: "9px", fontWeight: 500, color: "var(--text-1)" }}>{link.a}</span>
                  <span className="lc-line"></span>
                  <span className="lc-label">{link.label}</span>
                  <span className="lc-line"></span>
                  <span style={{ fontSize: "9px", fontWeight: 500, color: "var(--text-1)" }}>{link.b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SEARCH & IMPORT */}
        <div className={`invest-pane ${activeTab === "search" ? "active" : ""}`}>
          <div className="invest-title">Search & Import Evidence</div>
          <div style={{ fontSize: "9px", color: "var(--text-2)", marginBottom: 12 }}>
            Find external sources and bring them into this case file. Search across OSINT databases, academic papers, news archives, Reddit threads, and FOIA documents.
          </div>
          <div className="search-box">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="e.g. Nimitz FLIR analysis, Kevin Day interview..."
              onKeyDown={(e) => e.key === "Enter" && setSearchQuery(searchQuery)}
            />
            <button onClick={() => {}}>Search</button>
          </div>
          <div>
            {data.searchDemoResults.map((r, i) => (
              <div key={i} className="search-result">
                <div className="sr-source">
                  <span className={`sr-type-dot ${r.type}`}></span>
                  {r.source}
                </div>
                <div className="sr-title">{r.title}</div>
                <div className="sr-snippet">{r.snippet}</div>
                <div className="sr-actions">
                  <button className="sr-action primary" onClick={(e) => importResult(r.title, r.source, e.target as HTMLButtonElement)}>+ Import to case</button>
                  <button className="sr-action">Attach to highlight</button>
                  <button className="sr-action">Open source</button>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
            <div className="invest-title">Imported Evidence</div>
            {importedItems.length === 0 ? (
              <div style={{ fontSize: "9px", color: "var(--text-3)" }}>No items imported yet. Search and import sources above.</div>
            ) : (
              importedItems.map((item, i) => (
                <div key={i} style={{ padding: "6px 8px", background: "var(--bg)", borderRadius: 4, marginBottom: 4, fontSize: "9px", display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: "var(--green)", fontWeight: 600 }}>{"\u2713"}</span>
                  <span style={{ color: "var(--text-1)", fontWeight: 500 }}>{item.title.substring(0, 50)}</span>
                  <span style={{ color: "var(--text-3)", marginLeft: "auto" }}>{item.source}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* BRANCHES */}
        <div className={`invest-pane ${activeTab === "branches" ? "active" : ""}`}>
          <div className="invest-title">Research Branches</div>
          <div style={{ fontSize: "9px", color: "var(--text-2)", marginBottom: 12 }}>
            Active investigation threads growing from specific points in the case narrative.
          </div>
          {branches.length === 0 ? (
            <div style={{ fontSize: "9px", color: "var(--text-3)" }}>No research branches yet.</div>
          ) : (
            [...branches]
              .sort((a, b) => {
                const order = { in_progress: 0, open: 1, resolved: 2 };
                return (order[a.status] ?? 1) - (order[b.status] ?? 1);
              })
              .map((branch) => {
                const statusClass = branch.status === "in_progress" ? "rb-status-progress" : branch.status === "resolved" ? "rb-status-resolved" : "rb-status-open";
                const statusLabel = branch.status === "in_progress" ? "in progress" : branch.status;
                return (
                  <div
                    key={branch.id}
                    className="rb-list-item"
                    onClick={() => {
                      const anchorEl =
                        branch.anchorSection === "fact" ? document.getElementById("verified-facts") :
                        branch.anchorSection === "timeline" ? document.getElementById("encounter") :
                        branch.anchorSection === "evidence" ? document.getElementById("evidence") :
                        branch.anchorSection === "analysis" ? document.getElementById("analysis") :
                        null;
                      anchorEl?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    <div className="rb-list-header">
                      <span className="rb-list-id">{branch.id}</span>
                      <span className={`rb-status-pill ${statusClass}`}>{statusLabel}</span>
                      <span className={`rb-priority-pill priority-${branch.priority}`}>{branch.priority}</span>
                    </div>
                    <div className="rb-list-question">{branch.question}</div>
                    <div className="rb-list-meta">
                      <span>{branch.findings.length} finding{branch.findings.length !== 1 ? "s" : ""}</span>
                      <span>Anchored to: {branch.anchorSection}{branch.anchorId ? ` / ${branch.anchorId}` : ""}</span>
                    </div>
                  </div>
                );
              })
          )}
        </div>

        {/* COMMENTS / DISCUSS */}
        <div className={`invest-pane ${activeTab === "comments" ? "active" : ""}`}>
          <div className="invest-title">Discussion Thread</div>
          <CommentThread
            caseId={data.id}
            targetId={selectedCard || null}
            targetLabel={selectedCard ? `Comments on: ${selectedCard}` : undefined}
          />
        </div>

        {/* SOLVABILITY */}
        <div className={`invest-pane ${activeTab === "solvability" ? "active" : ""}`}>
          <div className="invest-title">Solvability Assessment</div>
          <div style={{ fontSize: "11px", color: "var(--text-2)", marginBottom: 8 }}>Can this case be advanced with available tools?</div>
          <div style={{ fontSize: "28px", fontWeight: 600, color: "var(--gold)" }}>
            {data.solvabilityScore} <span style={{ fontSize: "11px", color: "var(--text-3)", fontWeight: 400 }}>/ 100</span>
          </div>
          <div className="solv-meter"><div className="solv-fill" style={{ width: `${data.solvabilityScore}%` }}></div></div>
          {data.solvabilityFactors.map((f, i) => (
            <div key={i} className="solv-factor">
              <span className="solv-factor-name">{f.name}</span>
              <span className={`solv-factor-score ${f.type}`}>{f.score}</span>
            </div>
          ))}
          <div className="next-steps">
            <div className="invest-title" style={{ marginTop: 8 }}>Recommended Next Steps</div>
            {data.nextSteps.map((s, i) => (
              <div key={i} className="next-step">
                <span className={`step-priority priority-${s.priority}`}>{s.priority === "medium" ? "Med" : s.priority.charAt(0).toUpperCase() + s.priority.slice(1)}</span>
                {s.text}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

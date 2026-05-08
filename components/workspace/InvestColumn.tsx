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
  expanded: boolean;
  setExpanded: (b: boolean) => void;
  // Evidence links
  links: { a: string; b: string; label: string }[];
  selectedNode: string | null;
  toggleNode: (id: string) => void;
  // Annotations
  getCount: (id: string) => number;
  // Comments
  selectedCard?: string | null;
}

const ICON_PATHS: Record<string, string[]> = {
  ach: [
    "M5 21V11", "M12 21V3", "M19 21v-7",
  ],
  resolution: [
    "M4 4h16v16H4z", "M9 12l2 2 4-4",
  ],
  osint: [
    "M21 12a9 9 0 11-18 0 9 9 0 0118 0z", "M3 12h18", "M12 3a14 14 0 010 18", "M12 3a14 14 0 000 18",
  ],
  chain: [
    "M10 14a4 4 0 005.66 0l3-3a4 4 0 10-5.66-5.66l-1.5 1.5",
    "M14 10a4 4 0 00-5.66 0l-3 3a4 4 0 105.66 5.66l1.5-1.5",
  ],
  search: [
    "M18 11a7 7 0 11-14 0 7 7 0 0114 0z", "M21 21l-4.3-4.3",
  ],
  solvability: [
    "M22 12a10 10 0 10-20 0", "M12 12l4-3",
  ],
  branches: [
    "M6 7v4a4 4 0 004 4h4a4 4 0 004-4V7",
    "M8 5a2 2 0 11-4 0 2 2 0 014 0z",
    "M20 5a2 2 0 11-4 0 2 2 0 014 0z",
    "M14 19a2 2 0 11-4 0 2 2 0 014 0z",
  ],
  comments: [
    "M21 12a8 8 0 01-12.7 6.5L3 20l1.5-5.3A8 8 0 1121 12z",
  ],
};

function TabIcon({ id }: { id: string }) {
  const paths = ICON_PATHS[id] || [];
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {paths.map((d, i) => <path key={i} d={d} />)}
    </svg>
  );
}

const tabs: { id: string; label: string }[] = [
  { id: "ach", label: "Hypotheses" },
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
  expanded,
  setExpanded,
  links,
  selectedNode,
  toggleNode,
  getCount,
  selectedCard,
}: Props) {
  const handleIconClick = (tabId: string) => {
    if (expanded && activeTab === tabId) {
      setExpanded(false);
    } else {
      setActiveTab(tabId);
      setExpanded(true);
    }
  };
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

  const probabilities = (data.hypothesisProbabilities || []).slice().sort((a, b) => b.probability - a.probability);
  const branches = data.researchBranches || [];

  const factCount = (data.verifiedFacts || []).length;
  const evidenceCount = data.evidence.length;

  const activeLabel = tabs.find((t) => t.id === activeTab)?.label || "";

  return (
    <aside className={`invest-column ${expanded ? "expanded" : "collapsed"}`}>
      <div className="invest-icon-rail">
        {tabs.map((t) => {
          const isActive = expanded && activeTab === t.id;
          return (
            <button
              key={t.id}
              className={`invest-icon-btn ${isActive ? "active" : ""}`}
              onClick={() => handleIconClick(t.id)}
              title={t.label}
              aria-label={t.label}
              aria-pressed={isActive}
            >
              <TabIcon id={t.id} />
            </button>
          );
        })}
      </div>
      <div className="invest-panel" aria-hidden={!expanded}>
        <div className="invest-panel-header">
          <span className="invest-panel-title">{activeLabel}</span>
          <button
            className="invest-panel-close"
            onClick={() => setExpanded(false)}
            aria-label="Close panel"
            title="Close"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>
        <div className="invest-body">

        {/* HYPOTHESES */}
        <div className={`invest-pane ${activeTab === "ach" ? "active" : ""}`}>
          <div className="invest-title">Hypothesis Probability Assessment</div>
          <div className="hp-panel-subtitle" style={{ marginBottom: 16 }}>
            Based on {factCount} verified facts and {evidenceCount} evidence items
          </div>

          {probabilities.length > 0 ? (
            <>
              {/* Leading hypothesis — hero card */}
              {(() => {
                const hp = probabilities[0];
                const trendIcon = hp.trend === "rising" ? "▲" : hp.trend === "falling" ? "▼" : "●";
                const trendColor = hp.trend === "rising" ? "var(--green)" : hp.trend === "falling" ? "var(--red)" : "var(--text-3)";
                return (
                  <div className="hp-hero">
                    <div className="hp-hero-badge">Most Probable</div>
                    <div className="hp-hero-name">{hp.hypothesis}</div>
                    <div className="hp-hero-pct-row">
                      <span className="hp-hero-pct">{hp.probability}%</span>
                      <span className="hp-hero-trend-inline" style={{ color: trendColor }}>
                        {trendIcon} {hp.trend}
                      </span>
                    </div>
                    <div className="hp-hero-bar-track">
                      <div className="hp-hero-bar-fill" style={{ width: `${hp.probability}%` }} />
                    </div>
                    <div className="hp-hero-reasoning">{hp.reasoning}</div>
                    {hp.keyFactors.supports.length > 0 && (
                      <div className="hp-factors">
                        <span className="hp-factor-label supports">Supports:</span>
                        {hp.keyFactors.supports.map((f, i) => (
                          <span key={i} className="hp-factor-item">{f}</span>
                        ))}
                      </div>
                    )}
                    {hp.keyFactors.contradicts.length > 0 && (
                      <div className="hp-factors" style={{ marginTop: 4 }}>
                        <span className="hp-factor-label contradicts">Against:</span>
                        {hp.keyFactors.contradicts.map((f, i) => (
                          <span key={i} className="hp-factor-item">{f}</span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Remaining hypotheses — ranked list */}
              <div className="hp-ranked-list">
                {probabilities.slice(1).map((hp, i) => {
                  const rank = i + 2;
                  const trendIcon = hp.trend === "rising" ? "▲" : hp.trend === "falling" ? "▼" : "●";
                  const trendColor = hp.trend === "rising" ? "var(--green)" : hp.trend === "falling" ? "var(--red)" : "var(--text-3)";
                  const isExpanded = expandedReasoning === hp.hypothesis;
                  return (
                    <div key={hp.hypothesis} className="hp-ranked-row">
                      <span className="hp-rank-num">{rank}</span>
                      <div className="hp-ranked-content">
                        <div className="hp-ranked-header">
                          <span className="hp-ranked-name">{hp.hypothesis}</span>
                          <span className="hp-ranked-pct">{hp.probability}%</span>
                        </div>
                        <div className="hp-bar-track">
                          <div className="hp-bar-fill" style={{ width: `${hp.probability}%`, background: "var(--text-3)", opacity: 0.45 }} />
                        </div>
                        <div className="hp-meta">
                          <span style={{ color: trendColor, fontSize: "9px" }}>{trendIcon} {hp.trend}</span>
                          {hp.keyFactors.contradicts.length > 0 && (
                            <span style={{ fontSize: "9px", color: "var(--text-3)" }}>
                              {hp.keyFactors.contradicts.length} contradiction{hp.keyFactors.contradicts.length !== 1 ? "s" : ""}
                            </span>
                          )}
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
                    </div>
                  );
                })}
              </div>

              <div className="hp-footer">
                Probabilities are AI-derived estimates. They reflect what available evidence supports — not predictions of ground truth.
              </div>
            </>
          ) : (
            <div style={{ fontSize: "10px", color: "var(--text-3)" }}>No probability data for this case yet.</div>
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
    </aside>
  );
}

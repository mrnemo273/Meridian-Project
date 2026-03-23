import { useCallback, useState } from "react";
import type { CaseWorkspaceData } from "@/types/case";
import { linkNodes } from "@/hooks/useEvidenceLinks";
import type { Attachment } from "@/hooks/useAnnotations";

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
}

const tabs = [
  { id: "ach", label: "ACH" },
  { id: "resolution", label: "Resolution" },
  { id: "osint", label: "OSINT" },
  { id: "chain", label: "Links" },
  { id: "search", label: "Search" },
  { id: "solvability", label: "Score" },
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
}: Props) {
  const [searchQuery, setSearchQuery] = useState("");
  const [importedItems, setImportedItems] = useState<{ title: string; source: string }[]>([]);

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

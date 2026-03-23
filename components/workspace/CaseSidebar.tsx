interface Props {
  caseNumber: string;
  caseTitle: string;
  activeSection: string;
  activeTab: string;
  highlightCount: number;
  scrollToSection: (id: string) => void;
  setActiveTab: (tab: string) => void;
  jumpToNextHighlight: () => void;
}

const tocSections = [
  { id: "hero", label: "Overview" },
  { id: "summary", label: "Executive Summary" },
  { id: "encounter", label: "The Encounter" },
  { id: "evidence", label: "The Evidence" },
  { id: "witnesses", label: "The Witnesses" },
  { id: "analysis", label: "AI Analysis" },
  { id: "questions", label: "Open Questions" },
];

export function CaseSidebar({
  caseNumber,
  caseTitle,
  activeSection,
  setActiveTab,
  highlightCount,
  scrollToSection,
  jumpToNextHighlight,
}: Props) {
  return (
    <nav className="ws-sidebar">
      <div className="sidebar-logo">MERI<span>DIAN</span></div>

      <div className="sidebar-section-label">Case File</div>
      <ul className="toc-list">
        {tocSections.map((s) => (
          <li key={s.id}>
            <a
              className={activeSection === s.id ? "active" : ""}
              onClick={() => scrollToSection(s.id)}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="sidebar-divider"></div>

      <div className="sidebar-section-label">Investigation</div>
      <ul className="toc-list">
        <li><a onClick={() => setActiveTab("ach")}>ACH Matrix <span className="toc-badge tool">Tool</span></a></li>
        <li><a onClick={() => setActiveTab("resolution")}>Resolution <span className="toc-badge tool">Tool</span></a></li>
        <li><a onClick={() => setActiveTab("osint")}>OSINT Log <span className="toc-badge tool">Tool</span></a></li>
        <li><a onClick={() => setActiveTab("chain")}>Evidence Chain <span className="toc-badge tool">Tool</span></a></li>
        <li><a onClick={() => setActiveTab("search")}>Search & Import <span className="toc-badge human">Search</span></a></li>
        <li><a onClick={() => setActiveTab("solvability")}>Solvability <span className="toc-badge tool">Tool</span></a></li>
      </ul>

      <div className="sidebar-divider"></div>

      <div className="sidebar-section-label">Annotations</div>
      <ul className="toc-list">
        <li>
          <a onClick={jumpToNextHighlight}>
            &#9998; Next Highlight
            <span className="toc-badge human">{highlightCount}</span>
          </a>
        </li>
      </ul>
      <div style={{ padding: "4px 16px 0", fontSize: "8px", color: "var(--text-3)" }}>
        Right-click selected text to annotate
      </div>

      <div className="sidebar-footer">
        <div className="inv-row"><div className="inv-dot human"></div><span>Nemo</span> <span style={{ marginLeft: "auto", fontSize: "8px", color: "var(--orange)" }}>&#9632;</span></div>
        <div className="inv-row"><div className="inv-dot ai"></div><span>Claude</span> <span style={{ marginLeft: "auto", fontSize: "8px", color: "var(--purple)" }}>&#9632;</span></div>
      </div>
    </nav>
  );
}

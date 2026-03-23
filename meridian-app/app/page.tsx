"use client";

import Link from "next/link";
import { useState } from "react";
import { queuedCases, sidebarCases } from "@/data/cases-index";

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <>
      <button
        className="hamburger"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </button>

      {/* SIDEBAR */}
      <nav className={`home-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <span>Meridian</span> Project
        </div>

        <div className="nav-section-label">Navigation</div>
        <ul className="nav-list">
          <li><a href="#hero" className="active">Dashboard</a></li>
          <li><a href="#active">Active Cases</a></li>
          <li><a href="#queue">Case Queue</a></li>
          <li><a href="#methodology">Methodology</a></li>
        </ul>

        <div className="nav-divider"></div>

        <div className="nav-section-label">Cases</div>
        <ul className="nav-list">
          {sidebarCases.map((c) => (
            <li key={c.id}>
              <Link href={c.href}>
                {c.label}
                <span className={`nav-badge ${c.status === "Active" ? "active-badge" : "queued-badge"}`}>
                  {c.status}
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <div className="sidebar-footer">
          <div className="inv-row">
            <div className="inv-dot human"></div>
            <span className="inv-name">Nemo</span>
            <span className="inv-role">Investigator</span>
          </div>
          <div className="inv-row">
            <div className="inv-dot ai"></div>
            <span className="inv-name">Claude</span>
            <span className="inv-role">AI Analyst</span>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="home-main-content">
        <section id="hero">
          <div className="hero-brand">Meridian Project</div>
          <h1 className="home-hero-title">Case Index</h1>
          <div className="hero-subtitle">
            Reopening the most credible cold cases in UAP history. Human investigator + AI analyst, working together.
          </div>
          <div className="hero-stats">
            <div className="stat-block"><div className="stat-value">1</div><div className="stat-label">Active Case</div></div>
            <div className="stat-block"><div className="stat-value">5</div><div className="stat-label">In Queue</div></div>
            <div className="stat-block"><div className="stat-value">92</div><div className="stat-label">Highest Credibility</div></div>
            <div className="stat-block"><div className="stat-value">1958–2023</div><div className="stat-label">Date Range</div></div>
          </div>
          <div className="methodology-brief">
            Every case is investigated collaboratively. A human researcher gathers sources, identifies patterns, and asks questions. An AI analyst cross-references the full corpus, scores credibility, and finds connections across decades of data.
            <div className="voice-nemo">We don&apos;t debunk. We don&apos;t believe. We investigate.</div>
          </div>
        </section>

        <section id="active">
          <div className="section-label">Active Investigation</div>
          <div className="active-card">
            <div className="active-card-header">
              <span className="case-num">CASE-001</span>
              <span className="status-pill investigating"><span className="pulse-dot"></span>Investigating</span>
            </div>
            <div className="active-card-body">
              <h2>USS Nimitz Encounter</h2>
              <div className="case-subtitle">The Tic Tac Incident</div>
              <div className="case-meta">
                <span>November 14, 2004</span><span>&middot;</span>
                <span>Pacific Ocean, SW of San Diego</span><span>&middot;</span>
                <span>~5 min visual encounter</span>
              </div>
              <div className="cred-row">
                <div className="cred-score">92</div>
                <div className="cred-details">
                  <div className="cred-tier">Tier 1 — Highest Credibility</div>
                  <div style={{ fontSize: "9px", color: "var(--text-3)" }}>Multi-sensor, multi-witness, official acknowledgment</div>
                </div>
              </div>
              <div className="tag-pills">
                {["military","multi-sensor","multi-witness","radar-confirmed","infrared-confirmed","visual-confirmed","data-confiscation","congressional-testimony"].map(tag => (
                  <span key={tag} className="tag-pill">{tag}</span>
                ))}
              </div>
              <div className="mini-flir">
                <div className="flir-grid"></div>
                <div className="flir-crosshair"></div>
                <div className="flir-object"></div>
                <span className="flir-label tl">WHT</span>
                <span className="flir-label tr">NAR</span>
                <span className="flir-label bl">IR</span>
                <span className="flir-label br">0032</span>
              </div>
              <div className="case-summary">
                During pre-deployment exercises off San Diego, the USS Nimitz CSG encountered multiple anomalous aerial vehicles over five days. The primary encounter involved visual contact by two F/A-18F crews, radar tracking, and infrared video capture. The object demonstrated flight characteristics far beyond any known technology.
              </div>
              <div className="case-progress">
                <div className="progress-label"><span>Investigation Progress</span><span>~65%</span></div>
                <div className="progress-track"><div className="progress-fill" style={{ width: "65%" }}></div></div>
              </div>
              <div className="case-sections">
                <div className="case-section-chip done"><span className="chip-count">8</span> Timeline events</div>
                <div className="case-section-chip done"><span className="chip-count">6</span> Witnesses</div>
                <div className="case-section-chip done"><span className="chip-count">5</span> Evidence items</div>
                <div className="case-section-chip done"><span className="chip-count">3</span> AI analyses</div>
                <div className="case-section-chip"><span className="chip-count">5</span> Open questions</div>
                <div className="case-section-chip"><span className="chip-count">4</span> Cross-case links</div>
              </div>
              <div className="card-actions">
                <Link href="/case/001" className="btn-primary">Open Case File &rarr;</Link>
                <a href="#" className="btn-secondary">View on Canvas &rarr;</a>
              </div>
            </div>
          </div>
        </section>

        <section id="queue">
          <div className="section-label">Case Queue</div>
          <table className="queue-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>No.</th>
                <th>Case</th>
                <th style={{ width: 70 }}>Year</th>
                <th style={{ width: 50 }}>Score</th>
                <th style={{ width: 130 }}>Tags</th>
                <th style={{ width: 80 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {queuedCases.map(c => (
                <tr key={c.id}>
                  <td><span className="queue-num">{c.num}</span></td>
                  <td>
                    <div className="queue-title">{c.title}</div>
                    <div className="queue-desc">{c.description}</div>
                  </td>
                  <td><span className="queue-year">{c.year}</span></td>
                  <td><span className="queue-score high">{c.score}</span></td>
                  <td>
                    <div className="queue-tags">
                      {c.tags.map(t => <span key={t.label} className={`queue-tag ${t.type}`}>{t.label}</span>)}
                    </div>
                  </td>
                  <td><span className="queue-status">{c.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section id="methodology">
          <div className="section-label">Methodology</div>
          <div className="method-grid">
            <div className="method-card human">
              <h3>Nemo</h3>
              <div className="method-role">Human Investigator</div>
              <div className="method-desc">
                I chase the story. I read between the lines of official reports, track down contradictions, notice when something doesn&apos;t feel right. I ask the uncomfortable questions.
              </div>
            </div>
            <div className="method-card ai">
              <h3>Claude</h3>
              <div className="method-role">AI Analyst</div>
              <div className="method-desc">
                I process the data systematically. Cross-reference witness statements, compare sensor readings, identify patterns across decades and continents. I quantify uncertainty and maintain analytical rigor.
              </div>
            </div>
          </div>
          <div className="process-steps">
            {[
              { num: 1, name: "Research", desc: "Gather all public sources" },
              { num: 2, name: "Extract", desc: "Entity extraction & scoring" },
              { num: 3, name: "Analyze", desc: "AI cross-reference & patterns" },
              { num: 4, name: "Investigate", desc: "Human + AI dual voice" },
              { num: 5, name: "Publish", desc: "Open case file" },
            ].map(step => (
              <div key={step.num} className="process-step">
                <div className="step-num">{step.num}</div>
                <div className="step-name">{step.name}</div>
                <div className="step-desc">{step.desc}</div>
              </div>
            ))}
          </div>
        </section>

        <footer className="page-footer">
          <span>Meridian Project &middot; 2024</span>
          <div className="footer-links">
            <a href="#">About</a>
            <a href="#">Methodology</a>
            <a href="#">Contribute</a>
          </div>
        </footer>
      </main>
    </>
  );
}

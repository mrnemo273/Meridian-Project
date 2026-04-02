"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { queuedCases, sidebarCases, casesWithData } from "@/data/cases-index";
import { useAuth } from "@/components/SupabaseProvider";
import { InviteModal } from "@/components/workspace/InviteModal";

export default function HomePage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const { profile, isAdmin, signOut } = useAuth();

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
            <div className="inv-dot human" style={profile?.avatar_color ? { background: profile.avatar_color } : undefined}></div>
            <span className="inv-name">{profile?.name || "Investigator"}</span>
            <span className="inv-role">{profile?.role || "investigator"}</span>
          </div>
          <div className="inv-row">
            <div className="inv-dot ai"></div>
            <span className="inv-name">Claude</span>
            <span className="inv-role">AI Analyst</span>
          </div>
          <div className="sidebar-footer-actions">
            {isAdmin && (
              <button className="sidebar-action-btn" onClick={() => setShowInvite(true)}>+ Invite</button>
            )}
            <button className="sidebar-action-btn" onClick={signOut}>Sign out</button>
          </div>
        </div>
      </nav>

      {showInvite && <InviteModal visible={showInvite} onClose={() => setShowInvite(false)} />}

      {/* MAIN CONTENT */}
      <main className="home-main-content">
        <section id="hero">
          <div className="hero-brand">Meridian Project</div>
          <h1 className="home-hero-title">Case Index</h1>
          <div className="hero-subtitle">
            Reopening the most credible cold cases in UAP history. Human investigator + AI analyst, working together.
          </div>
          <div className="hero-stats">
            <div className="stat-block"><div className="stat-value">7</div><div className="stat-label">Active Cases</div></div>
            <div className="stat-block"><div className="stat-value">0</div><div className="stat-label">In Queue</div></div>
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
                <Image
                  src="/images/cases/001/flir1-center.png"
                  alt="FLIR1 infrared video still showing the Tic Tac object"
                  width={600}
                  height={200}
                  style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
                />
                <div className="flir-grid"></div>
                <div className="flir-crosshair"></div>
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

          {/* CASE 002 */}
          <div className="active-card">
            <div className="active-card-header">
              <span className="case-num">CASE-002</span>
              <span className="status-pill investigating"><span className="pulse-dot"></span>Investigating</span>
            </div>
            <div className="active-card-body">
              <h2>The Phoenix Lights</h2>
              <div className="case-subtitle">Mass Sighting Over Arizona</div>
              <div className="case-meta">
                <span>March 13, 1997</span><span>&middot;</span>
                <span>Henderson NV → Phoenix AZ → Tucson</span><span>&middot;</span>
                <span>~4.5 hours</span>
              </div>
              <div className="cred-row">
                <div className="cred-score">72</div>
                <div className="cred-details">
                  <div className="cred-tier">Tier 2 — High Credibility</div>
                  <div style={{ fontSize: "9px", color: "var(--text-3)" }}>Mass-sighting, governor witness, contested explanation</div>
                </div>
              </div>
              <div className="tag-pills">
                {["mass-sighting","civilian","governor-witness","pilot-witness","video-documented","contested-explanation"].map(tag => (
                  <span key={tag} className="tag-pill">{tag}</span>
                ))}
              </div>
              <div className="case-summary">
                Two distinct events over Arizona: a massive V-shaped formation traversing the state, followed by stationary lights over Phoenix. Over 700 witnesses including Governor Fife Symington. Military flares explanation contested.
              </div>
              <div className="case-progress">
                <div className="progress-label"><span>Investigation Progress</span><span>~60%</span></div>
                <div className="progress-track"><div className="progress-fill" style={{ width: "60%" }}></div></div>
              </div>
              <div className="case-sections">
                <div className="case-section-chip done"><span className="chip-count">10</span> Timeline events</div>
                <div className="case-section-chip done"><span className="chip-count">5</span> Witnesses</div>
                <div className="case-section-chip done"><span className="chip-count">5</span> Evidence items</div>
                <div className="case-section-chip done"><span className="chip-count">3</span> AI analyses</div>
              </div>
              <div className="card-actions">
                <Link href="/case/002" className="btn-primary">Open Case File &rarr;</Link>
              </div>
            </div>
          </div>

          {/* CASE 003 */}
          <div className="active-card">
            <div className="active-card-header">
              <span className="case-num">CASE-003</span>
              <span className="status-pill investigating"><span className="pulse-dot"></span>Investigating</span>
            </div>
            <div className="active-card-body">
              <h2>The Belgian Wave</h2>
              <div className="case-subtitle">NATO F-16 Radar Lock Incident</div>
              <div className="case-meta">
                <span>November 1989 – April 1990</span><span>&middot;</span>
                <span>Belgium — Li&egrave;ge, Eupen, Ardennes</span><span>&middot;</span>
                <span>~5 months</span>
              </div>
              <div className="cred-row">
                <div className="cred-score">88</div>
                <div className="cred-details">
                  <div className="cred-tier">Tier 1 — Highest Credibility</div>
                  <div style={{ fontSize: "9px", color: "var(--text-3)" }}>Military radar, government acknowledged, 13,500+ witnesses</div>
                </div>
              </div>
              <div className="tag-pills">
                {["military","radar-confirmed","mass-sighting","government-acknowledged","f-16-intercept","nato"].map(tag => (
                  <span key={tag} className="tag-pill">{tag}</span>
                ))}
              </div>
              <div className="case-summary">
                Wave of triangular craft sightings over Belgium lasting months. Belgian Air Force scrambled two F-16s; onboard radar locked the object three times. Object performed impossible evasive maneuvers. Belgian Air Force officially acknowledged the sightings.
              </div>
              <div className="case-progress">
                <div className="progress-label"><span>Investigation Progress</span><span>~45%</span></div>
                <div className="progress-track"><div className="progress-fill" style={{ width: "45%" }}></div></div>
              </div>
              <div className="case-sections">
                <div className="case-section-chip done"><span className="chip-count">10</span> Timeline events</div>
                <div className="case-section-chip done"><span className="chip-count">4</span> Witnesses</div>
                <div className="case-section-chip done"><span className="chip-count">5</span> Evidence items</div>
                <div className="case-section-chip done"><span className="chip-count">3</span> AI analyses</div>
              </div>
              <div className="card-actions">
                <Link href="/case/003" className="btn-primary">Open Case File &rarr;</Link>
              </div>
            </div>
          </div>

          {/* CASE 004 */}
          <div className="active-card">
            <div className="active-card-header">
              <span className="case-num">CASE-004</span>
              <span className="status-pill investigating"><span className="pulse-dot"></span>Investigating</span>
            </div>
            <div className="active-card-body">
              <h2>Tehran F-4 Intercept</h2>
              <div className="case-subtitle">The DIA Document Case</div>
              <div className="case-meta">
                <span>September 19, 1976</span><span>&middot;</span>
                <span>Tehran, Iran</span><span>&middot;</span>
                <span>~90 minutes</span>
              </div>
              <div className="cred-row">
                <div className="cred-score">85</div>
                <div className="cred-details">
                  <div className="cred-tier">Tier 1 — Highest Credibility</div>
                  <div style={{ fontSize: "9px", color: "var(--text-3)" }}>DIA report, military intercept, weapons interference</div>
                </div>
              </div>
              <div className="tag-pills">
                {["military","radar-confirmed","weapons-interference","communications-failure","government-document","dia-report"].map(tag => (
                  <span key={tag} className="tag-pill">{tag}</span>
                ))}
              </div>
              <div className="case-summary">
                Two Iranian F-4 Phantoms scrambled to intercept a bright object over Tehran. Both aircraft experienced weapons and communications failures on approach. A secondary object emerged and flew toward the F-4. Declassified DIA report calls it a case meeting all criteria for valid study.
              </div>
              <div className="case-progress">
                <div className="progress-label"><span>Investigation Progress</span><span>~40%</span></div>
                <div className="progress-track"><div className="progress-fill" style={{ width: "40%" }}></div></div>
              </div>
              <div className="case-sections">
                <div className="case-section-chip done"><span className="chip-count">10</span> Timeline events</div>
                <div className="case-section-chip done"><span className="chip-count">4</span> Witnesses</div>
                <div className="case-section-chip done"><span className="chip-count">5</span> Evidence items</div>
                <div className="case-section-chip done"><span className="chip-count">3</span> AI analyses</div>
              </div>
              <div className="card-actions">
                <Link href="/case/004" className="btn-primary">Open Case File &rarr;</Link>
              </div>
            </div>
          </div>

          {/* CASE 005 */}
          <div className="active-card">
            <div className="active-card-header">
              <span className="case-num">CASE-005</span>
              <span className="status-pill investigating"><span className="pulse-dot"></span>Investigating</span>
            </div>
            <div className="active-card-body">
              <h2>JAL Flight 1628</h2>
              <div className="case-subtitle">The Alaska Giant</div>
              <div className="case-meta">
                <span>November 17, 1986</span><span>&middot;</span>
                <span>Over Alaska, near Ft. Yukon</span><span>&middot;</span>
                <span>~31 minutes</span>
              </div>
              <div className="cred-row">
                <div className="cred-score">82</div>
                <div className="cred-details">
                  <div className="cred-tier">Tier 2 — High Credibility</div>
                  <div style={{ fontSize: "9px", color: "var(--text-3)" }}>FAA radar, pilot witness, CIA involvement alleged</div>
                </div>
              </div>
              <div className="tag-pills">
                {["pilot-witness","radar-confirmed","faa-documented","data-confiscation","commercial-aviation"].map(tag => (
                  <span key={tag} className="tag-pill">{tag}</span>
                ))}
              </div>
              <div className="case-summary">
                JAL cargo 747 crew observed two small craft and then a massive object described as twice the size of an aircraft carrier for 31 minutes over Alaska. FAA and NORAD radar confirmed targets. FAA Division Chief later testified CIA confiscated all materials.
              </div>
              <div className="case-progress">
                <div className="progress-label"><span>Investigation Progress</span><span>~35%</span></div>
                <div className="progress-track"><div className="progress-fill" style={{ width: "35%" }}></div></div>
              </div>
              <div className="case-sections">
                <div className="case-section-chip done"><span className="chip-count">10</span> Timeline events</div>
                <div className="case-section-chip done"><span className="chip-count">4</span> Witnesses</div>
                <div className="case-section-chip done"><span className="chip-count">5</span> Evidence items</div>
                <div className="case-section-chip done"><span className="chip-count">3</span> AI analyses</div>
              </div>
              <div className="card-actions">
                <Link href="/case/005" className="btn-primary">Open Case File &rarr;</Link>
              </div>
            </div>
          </div>

          {/* CASE 006 */}
          <div className="active-card">
            <div className="active-card-header">
              <span className="case-num">CASE-006</span>
              <span className="status-pill investigating"><span className="pulse-dot"></span>Investigating</span>
            </div>
            <div className="active-card-body">
              <h2>USS Roosevelt Encounters</h2>
              <div className="case-subtitle">GIMBAL and GOFAST</div>
              <div className="case-meta">
                <span>Summer 2014 – March 2015</span><span>&middot;</span>
                <span>US East Coast, W-72 OPAREA</span><span>&middot;</span>
                <span>~2 years recurring</span>
              </div>
              <div className="cred-row">
                <div className="cred-score">90</div>
                <div className="cred-details">
                  <div className="cred-tier">Tier 1 — Highest Credibility</div>
                  <div style={{ fontSize: "9px", color: "var(--text-3)" }}>DoD-released video, congressional testimony, daily encounters</div>
                </div>
              </div>
              <div className="tag-pills">
                {["military","multi-sensor","video-documented","congressional-testimony","daily-encounters","no-infrared-signature"].map(tag => (
                  <span key={tag} className="tag-pill">{tag}</span>
                ))}
              </div>
              <div className="case-summary">
                Carrier Strike Group 12 encountered objects daily for approximately two years off the US East Coast. Objects loitered at 30,000 ft with no visible propulsion and no infrared heat signature. Produced the GIMBAL and GOFAST videos. Lt. Ryan Graves testified before Congress.
              </div>
              <div className="case-progress">
                <div className="progress-label"><span>Investigation Progress</span><span>~50%</span></div>
                <div className="progress-track"><div className="progress-fill" style={{ width: "50%" }}></div></div>
              </div>
              <div className="case-sections">
                <div className="case-section-chip done"><span className="chip-count">10</span> Timeline events</div>
                <div className="case-section-chip done"><span className="chip-count">4</span> Witnesses</div>
                <div className="case-section-chip done"><span className="chip-count">5</span> Evidence items</div>
                <div className="case-section-chip done"><span className="chip-count">3</span> AI analyses</div>
              </div>
              <div className="card-actions">
                <Link href="/case/006" className="btn-primary">Open Case File &rarr;</Link>
              </div>
            </div>
          </div>

          {/* CASE 007 */}
          <div className="active-card">
            <div className="active-card-header">
              <span className="case-num">CASE-007</span>
              <span className="status-pill investigating"><span className="pulse-dot"></span>Investigating</span>
            </div>
            <div className="active-card-body">
              <h2>Rendlesham Forest Incident</h2>
              <div className="case-subtitle">Britain&apos;s Roswell</div>
              <div className="case-meta">
                <span>December 26–28, 1980</span><span>&middot;</span>
                <span>Suffolk, England</span><span>&middot;</span>
                <span>3 nights</span>
              </div>
              <div className="cred-row">
                <div className="cred-score">86</div>
                <div className="cred-details">
                  <div className="cred-tier">Tier 1 — Highest Credibility</div>
                  <div style={{ fontSize: "9px", color: "var(--text-3)" }}>Physical traces, radiation readings, audio recording, official memo</div>
                </div>
              </div>
              <div className="tag-pills">
                {["military","physical-trace","radiation-readings","audio-recording","government-memo","foi-released"].map(tag => (
                  <span key={tag} className="tag-pill">{tag}</span>
                ))}
              </div>
              <div className="case-summary">
                USAF personnel at RAF Woodbridge encountered a craft on the ground over two consecutive nights. Sgt. Penniston touched the craft and reported symbols. Lt. Col. Halt led a second investigation with a Geiger counter, recording audio in real-time. Physical impressions and elevated radiation found at the landing site.
              </div>
              <div className="case-progress">
                <div className="progress-label"><span>Investigation Progress</span><span>~40%</span></div>
                <div className="progress-track"><div className="progress-fill" style={{ width: "40%" }}></div></div>
              </div>
              <div className="case-sections">
                <div className="case-section-chip done"><span className="chip-count">10</span> Timeline events</div>
                <div className="case-section-chip done"><span className="chip-count">4</span> Witnesses</div>
                <div className="case-section-chip done"><span className="chip-count">5</span> Evidence items</div>
                <div className="case-section-chip done"><span className="chip-count">3</span> AI analyses</div>
              </div>
              <div className="card-actions">
                <Link href="/case/007" className="btn-primary">Open Case File &rarr;</Link>
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
              {queuedCases.map(c => {
                const hasData = casesWithData.has(c.id);
                return (
                  <tr key={c.id} onClick={() => window.location.href = `/case/${c.id}`} style={{ cursor: "pointer" }}>
                    <td><span className="queue-num">{c.num}</span></td>
                    <td>
                      <Link href={`/case/${c.id}`} style={{ textDecoration: "none", color: "inherit" }}>
                        <div className="queue-title">{c.title}</div>
                        <div className="queue-desc">{c.description}</div>
                      </Link>
                    </td>
                    <td><span className="queue-year">{c.year}</span></td>
                    <td><span className="queue-score high">{c.score}</span></td>
                    <td>
                      <div className="queue-tags">
                        {c.tags.map(t => <span key={t.label} className={`queue-tag ${t.type}`}>{t.label}</span>)}
                      </div>
                    </td>
                    <td>
                      <span className="queue-status">{hasData ? "Ready" : c.status}</span>
                    </td>
                  </tr>
                );
              })}
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

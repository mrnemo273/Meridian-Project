import Image from "next/image";
import type { CaseWorkspaceData } from "@/types/case";

interface Props {
  data: CaseWorkspaceData;
  getCount: (id: string) => number;
}

export function HeroSection({ data, getCount }: Props) {
  return (
    <>
      <section id="hero" className="ws-hero">
        <div className="hero-case-id">CASE-{data.caseNumber}</div>
        <h1 className="ws-hero-title">{data.title}</h1>
        <div className="ws-hero-subtitle">{data.subtitle}</div>
        <div className="hero-meta">
          <span>{data.date}</span><span>&middot;</span>
          <span>{data.location}</span><span>&middot;</span>
          <span>{data.duration}</span>
        </div>
        <div className="ws-status-pill"><span className="pulse-dot"></span>Investigating</div>
        <br />
        <div className="cred-badge">
          <div className="cred-score">{data.credibilityScore}</div>
          <div className="cred-details"><div className="cred-tier">{data.credibilityTier}</div><div>Credibility Score</div></div>
        </div>
        <div className="tag-pills">
          {data.tags.map(t => (
            <span key={t} className="tag-pill">{t}</span>
          ))}
        </div>

        {data.heroImage && (
          <div className="hero-image-wrap">
            <Image
              src={data.heroImage}
              alt={data.heroImageAlt || data.title}
              width={900}
              height={300}
              style={{ width: "100%", maxHeight: 300, objectFit: "cover", borderRadius: 6 }}
              priority
            />
            {data.heroImageAttribution && (
              <div className="hero-image-attribution">
                {data.heroImageAttribution}
              </div>
            )}
          </div>
        )}
      </section>

      <section id="summary">
        <div className="section-label">Executive Summary</div>
        <div className="summary-text">
          <p>
            During routine pre-deployment training exercises in the Pacific Ocean off Southern California, the USS Nimitz Carrier Strike Group encountered{" "}
            <span className="hl-nemo" data-count={getCount("ann-4") || ""} data-annotation-id="ann-4" data-user="nemo">
              multiple anomalous aerial vehicles over approximately five days
            </span>
            . The primary encounter on November 14, 2004 involved{" "}
            <span className="hl-claude" data-count={getCount("ann-1") || ""} data-annotation-id="ann-1" data-user="claude">
              visual contact by two F/A-18F Super Hornet crews, radar tracking by the AN/SPY-1B system aboard USS Princeton, and infrared video capture via the ATFLIR pod
            </span>
            .
          </p>
          <p>
            The object — described as a{" "}
            <span className="hl-nemo" data-count={getCount("ann-2") || ""} data-annotation-id="ann-2" data-user="nemo">
              white, featureless, elongated shape approximately 40 feet long resembling a Tic Tac candy
            </span>
            {" "}— demonstrated flight characteristics far beyond any known technology, including instantaneous acceleration, hypersonic speed without sonic boom, and apparent awareness of intercepting aircraft.
          </p>
        </div>
      </section>
    </>
  );
}

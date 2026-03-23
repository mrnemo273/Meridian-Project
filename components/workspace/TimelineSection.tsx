import type { TimelineEvent } from "@/types/case";

interface Props {
  events: TimelineEvent[];
  getCount: (id: string) => number;
}

export function TimelineSection({ events, getCount }: Props) {
  return (
    <section id="encounter">
      <div className="section-label">The Encounter</div>
      <div className="timeline">
        {events.map((ev, i) => (
          <div key={i} className={`tl-event type-${ev.type}`}>
            <div className="tl-date">{ev.date}</div>
            <div className="tl-title">{ev.title}</div>
            <div className="tl-detail">
              {ev.hasHighlight === "ann-3" ? (
                <>
                  <span className="hl-nemo" data-count={getCount("ann-3") || ""} data-annotation-id="ann-3" data-user="nemo">
                    Both crews spot a cross-shaped disturbance in the water — whitewater the size of a 737
                  </span>
                  . Hovering 50 ft above: a smooth, white, oblong object roughly 40 feet long. No wings, no exhaust. As Fravor descends, the object mirrors his movements — then accelerates away in under two seconds.
                </>
              ) : ev.hasHighlight === "ann-5" ? (
                <>
                  The Tic Tac accelerates from near-hover to beyond visual range in under two seconds. Within moments,{" "}
                  <span className="hl-nemo" data-count={getCount("ann-5") || ""} data-annotation-id="ann-5" data-user="nemo">
                    Princeton&apos;s SPY-1 picks it up again — at the fighters&apos; CAP point, 60 miles away. No sonic boom. Implied speed: ~46,000 mph
                  </span>
                  .
                </>
              ) : ev.hasHighlight === "ann-6" ? (
                <>
                  Unidentified individuals in plain clothes arrive aboard USS Princeton,{" "}
                  <span className="hl-nemo" data-count={getCount("ann-6") || ""} data-annotation-id="ann-6" data-user="nemo">
                    collect radar data tapes and FLIR recordings, and depart. No receipts. No chain of custody
                  </span>
                  . The originals have never resurfaced.
                </>
              ) : (
                ev.detail
              )}
            </div>
            <div className="tl-tags">
              {ev.tags.map((t) => (
                <span key={t.label} className={`tl-tag ${t.type}`}>{t.label}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

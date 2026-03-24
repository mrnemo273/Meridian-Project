"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import type { GalleryItem } from "@/types/case";

interface Props {
  items: GalleryItem[];
}

const CATEGORY_LABELS: Record<string, string> = {
  all: "All",
  flir: "FLIR/IR",
  sensor: "Sensor",
  analysis: "Analysis",
  map: "Maps",
  document: "Documents",
  reference: "Reference",
  witness: "Witness",
};

export function EvidenceGallery({ items }: Props) {
  const [filter, setFilter] = useState("all");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const filtered = filter === "all" ? items : items.filter((i) => i.category === filter);

  // Only show category pills that have items
  const activeCats = new Set(items.map((i) => i.category));
  const pills = Object.entries(CATEGORY_LABELS).filter(
    ([key]) => key === "all" || activeCats.has(key as GalleryItem["category"])
  );

  const openLightbox = (filteredIndex: number) => {
    const item = filtered[filteredIndex];
    const globalIdx = items.indexOf(item);
    setLightboxIdx(globalIdx);
  };

  const closeLightbox = useCallback(() => setLightboxIdx(null), []);

  const navigate = useCallback(
    (dir: -1 | 1) => {
      if (lightboxIdx === null) return;
      const next = lightboxIdx + dir;
      if (next >= 0 && next < items.length) setLightboxIdx(next);
    },
    [lightboxIdx, items.length]
  );

  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") navigate(-1);
      if (e.key === "ArrowRight") navigate(1);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIdx, closeLightbox, navigate]);

  if (!items.length) return null;

  const current = lightboxIdx !== null ? items[lightboxIdx] : null;

  return (
    <section id="gallery">
      <div className="section-label">Evidence Gallery</div>

      <div className="gallery-filters">
        {pills.map(([key, label]) => (
          <button
            key={key}
            className={`gallery-filter-pill ${filter === key ? "active" : ""}`}
            onClick={() => setFilter(key)}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {filtered.map((item, i) => (
          <div key={item.id} className="gallery-thumb" onClick={() => openLightbox(i)}>
            <span className="gallery-thumb-category">{item.category}</span>
            {item.type === "video" ? (
              <>
                <Image
                  src={item.thumbnail || item.src}
                  alt={item.title}
                  width={440}
                  height={320}
                  style={{ width: "100%", height: 160, objectFit: "cover" }}
                />
                <div className="gallery-thumb-play" />
              </>
            ) : (
              <Image
                src={item.thumbnail || item.src}
                alt={item.title}
                width={440}
                height={320}
                style={{ width: "100%", height: 160, objectFit: "cover" }}
              />
            )}
            <div className="gallery-thumb-overlay">
              <div className="gallery-thumb-title">{item.title}</div>
            </div>
            <div className="gallery-attribution">
              {item.attribution} &middot; {item.license}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {current && (
        <div
          className="lightbox-overlay"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeLightbox();
          }}
          role="dialog"
          aria-modal="true"
          aria-label={current.title}
        >
          <button className="lightbox-close" onClick={closeLightbox} aria-label="Close gallery">
            &times;
          </button>
          {lightboxIdx! > 0 && (
            <button className="lightbox-nav prev" onClick={() => navigate(-1)} aria-label="Previous">
              &#8249;
            </button>
          )}
          {lightboxIdx! < items.length - 1 && (
            <button className="lightbox-nav next" onClick={() => navigate(1)} aria-label="Next">
              &#8250;
            </button>
          )}
          <div className="lightbox-content">
            {current.type === "video" ? (
              <video
                src={current.src}
                controls
                autoPlay
                preload="metadata"
                poster={current.thumbnail}
                style={{ maxWidth: "100%", maxHeight: "65vh", borderRadius: 4 }}
              />
            ) : (
              <Image
                src={current.src}
                alt={current.title}
                width={900}
                height={600}
                style={{ maxWidth: "100%", maxHeight: "65vh", objectFit: "contain", borderRadius: 4 }}
              />
            )}
            <div className="lightbox-meta">
              <div className="lightbox-title">{current.title}</div>
              <div className="lightbox-caption">{current.caption}</div>
              <div className="lightbox-attr">
                {current.attribution} &middot; {current.license}
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

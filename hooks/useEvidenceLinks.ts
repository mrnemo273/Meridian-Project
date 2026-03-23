"use client";

import { useState, useCallback, useEffect } from "react";

export interface EvidenceLink {
  a: string;
  b: string;
  label: string;
}

export interface LinkNode {
  id: string;
  label: string;
  type: "sensor" | "witness" | "anomaly" | "document";
}

export const linkNodes: LinkNode[] = [
  { id: "spy1", label: "SPY-1 Radar", type: "sensor" },
  { id: "flir1", label: "FLIR1 Video", type: "sensor" },
  { id: "reloc", label: "60-Mile Relocation", type: "anomaly" },
  { id: "ocean", label: "Ocean Disturbance", type: "anomaly" },
  { id: "fravor", label: "Fravor", type: "witness" },
  { id: "dietrich", label: "Dietrich", type: "witness" },
  { id: "day", label: "Kevin Day", type: "witness" },
  { id: "confiscation", label: "Data Confiscation", type: "document" },
];

const defaultLinks: EvidenceLink[] = [
  { a: "spy1", b: "flir1", label: "corroborates" },
  { a: "spy1", b: "reloc", label: "recorded by" },
  { a: "fravor", b: "dietrich", label: "independent corroboration" },
  { a: "fravor", b: "ocean", label: "observed" },
  { a: "flir1", b: "confiscation", label: "original confiscated" },
];

const STORAGE_KEY = "meridian-evidence-links";

export function useEvidenceLinks() {
  const [links, setLinks] = useState<EvidenceLink[]>(() => {
    if (typeof window === "undefined") return defaultLinks;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return defaultLinks;
  });

  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
    } catch {}
  }, [links]);

  const toggleNode = useCallback(
    (nodeId: string) => {
      if (!selectedNode) {
        setSelectedNode(nodeId);
      } else if (selectedNode === nodeId) {
        setSelectedNode(null);
      } else {
        const label = prompt(
          'Describe the connection (e.g. "corroborates", "contradicts", "recorded by"):'
        );
        if (label) {
          setLinks((prev) => [
            ...prev,
            { a: selectedNode, b: nodeId, label },
          ]);
        }
        setSelectedNode(null);
      }
    },
    [selectedNode]
  );

  return { links, selectedNode, toggleNode };
}

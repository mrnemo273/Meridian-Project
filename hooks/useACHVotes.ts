"use client";

import { useState, useCallback, useEffect } from "react";

// ACH matrix data: each row has evidence label and AI assessments for 5 hypotheses
export interface ACHRow {
  evidence: string;
  ai: string[]; // 5 values: C, I, N, or -
}

export const achRows: ACHRow[] = [
  { evidence: "SPY-1 radar tracking (2 weeks)", ai: ["I", "I", "I", "C", "C"] },
  { evidence: "Visual contact (4 pilots)", ai: ["I", "I", "I", "I", "C"] },
  { evidence: "FLIR1 IR video (no exhaust)", ai: ["I", "I", "N", "N", "C"] },
  { evidence: "60-mile relocation (~46,000 mph)", ai: ["I", "I", "I", "C", "C"] },
  { evidence: "No sonic boom", ai: ["I", "I", "-", "N", "C"] },
  { evidence: "Object mirrored pilot", ai: ["I", "N", "I", "I", "C"] },
  { evidence: "Ocean disturbance", ai: ["I", "I", "N", "-", "C"] },
  { evidence: "Data confiscated", ai: ["-", "-", "-", "-", "C"] },
];

export const achHeaders = [
  "Conventional Aircraft",
  "Drone / UAS",
  "Atmospheric",
  "Sensor Error",
  "Unknown Tech",
];

const VOTE_ORDER = ["", "C", "I", "N"];
const STORAGE_KEY = "meridian-ach-votes";

export function useACHVotes() {
  // humanVotes[rowIndex][colIndex] = "" | "C" | "I" | "N"
  const [humanVotes, setHumanVotes] = useState<string[][]>(() => {
    if (typeof window === "undefined")
      return achRows.map(() => achHeaders.map(() => ""));
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return achRows.map(() => achHeaders.map(() => ""));
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(humanVotes));
    } catch {}
  }, [humanVotes]);

  const cycleVote = useCallback((rowIdx: number, colIdx: number) => {
    setHumanVotes((prev) => {
      const next = prev.map((row) => [...row]);
      const current = next[rowIdx][colIdx];
      const idx = VOTE_ORDER.indexOf(current);
      next[rowIdx][colIdx] = VOTE_ORDER[(idx + 1) % VOTE_ORDER.length];
      return next;
    });
  }, []);

  // Count inconsistencies per hypothesis column
  const tallyCounts = achHeaders.map((_, colIdx) => {
    let count = 0;
    achRows.forEach((row, rowIdx) => {
      const val = humanVotes[rowIdx][colIdx] || row.ai[colIdx];
      if (val === "I") count++;
    });
    return count;
  });

  return { humanVotes, cycleVote, tallyCounts };
}

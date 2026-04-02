"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/SupabaseProvider";

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

export function useACHVotes(caseId?: string) {
  const { user } = useAuth();
  const supabase = createClient();
  const loadedRef = useRef(false);

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

  // Sync to localStorage as backup
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(humanVotes));
    } catch {}
  }, [humanVotes]);

  // Load from Supabase on mount
  useEffect(() => {
    if (!user || !caseId || loadedRef.current) return;
    loadedRef.current = true;

    supabase
      .from("ach_votes")
      .select("*")
      .eq("case_id", caseId)
      .eq("user_id", user.id)
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) return;

        const newVotes = achRows.map(() => achHeaders.map(() => ""));
        for (const row of data) {
          const rowIdx = achRows.findIndex((r) => r.evidence === row.evidence);
          const colIdx = achHeaders.indexOf(row.hypothesis);
          if (rowIdx >= 0 && colIdx >= 0) {
            newVotes[rowIdx][colIdx] = row.vote;
          }
        }
        setHumanVotes(newVotes);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, caseId]);

  const cycleVote = useCallback(
    (rowIdx: number, colIdx: number) => {
      setHumanVotes((prev) => {
        const next = prev.map((row) => [...row]);
        const current = next[rowIdx][colIdx];
        const idx = VOTE_ORDER.indexOf(current);
        const newVote = VOTE_ORDER[(idx + 1) % VOTE_ORDER.length];
        next[rowIdx][colIdx] = newVote;

        // Persist to Supabase
        if (user && caseId && newVote) {
          supabase.from("ach_votes").upsert(
            {
              user_id: user.id,
              case_id: caseId,
              hypothesis: achHeaders[colIdx],
              evidence: achRows[rowIdx].evidence,
              vote: newVote,
            },
            { onConflict: "user_id,case_id,hypothesis,evidence" }
          );
        } else if (user && caseId && !newVote) {
          // Vote cleared — delete the row
          supabase
            .from("ach_votes")
            .delete()
            .eq("user_id", user.id)
            .eq("case_id", caseId)
            .eq("hypothesis", achHeaders[colIdx])
            .eq("evidence", achRows[rowIdx].evidence);
        }

        return next;
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, caseId]
  );

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

"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/components/SupabaseProvider";

export interface Attachment {
  type: "url" | "video" | "document";
  title: string;
  url: string;
}

export interface Annotation {
  user: string;
  user_id?: string;
  avatar_color?: string;
  notes: string[];
  attachments: Attachment[];
}

export type AnnotationMap = Record<string, Annotation>;

const STORAGE_KEY = "meridian-annotations";

const defaultAnnotations: AnnotationMap = {
  "ann-1": {
    user: "claude",
    notes: [
      "Five-channel corroboration (visual, radar, IR, multiple witnesses, behavioral analysis) is exceptionally rare in the UAP literature. Only 3 other cases in the corpus achieve this level.",
    ],
    attachments: [],
  },
  "ann-2": {
    user: "nemo",
    notes: [
      "Every single witness says the same thing about the shape. That consistency matters.",
    ],
    attachments: [
      { type: "video", title: "Fravor describes shape \u2014 JRE", url: "#" },
    ],
  },
  "ann-3": {
    user: "nemo",
    notes: [
      "This is the moment. 4 trained pilots, broad daylight, clear skies. Whatever this was \u2014 it was real.",
      "This detail haunts me",
      "The water disturbance pattern matches Shag Harbour 1967",
    ],
    attachments: [
      { type: "url", title: "r/UFOs thread on ocean anomaly", url: "#" },
      {
        type: "video",
        title: "Fravor on whitewater \u2014 Lex Fridman",
        url: "#",
      },
    ],
  },
  "ann-4": {
    user: "nemo",
    notes: [
      "Five independent sensor channels confirmed this thing. That's not a misidentification.",
    ],
    attachments: [],
  },
  "ann-5": {
    user: "nemo",
    notes: [
      "The 60-mile jump is the single most extraordinary claim. Backed by radar from a billion-dollar warship.",
    ],
    attachments: [],
  },
  "ann-6": {
    user: "nemo",
    notes: [
      "If it was nothing, why take the hard drives? This is the biggest red flag.",
    ],
    attachments: [],
  },
  "ann-7": {
    user: "claude",
    notes: [
      '\u201cUnknown Technology\u201d is a residual category. ACH does not confirm what the object is \u2014 only what it is least inconsistent with.',
    ],
    attachments: [],
  },
};

export function useAnnotations(caseId?: string) {
  const { user, profile } = useAuth();
  const supabase = createClient();
  const loadedRef = useRef(false);

  const [annotations, setAnnotations] = useState<AnnotationMap>(() => {
    if (typeof window === "undefined") return defaultAnnotations;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return defaultAnnotations;
  });

  // Sync to localStorage as backup
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
    } catch {}
  }, [annotations]);

  // Load from Supabase on mount
  useEffect(() => {
    if (!user || !caseId || loadedRef.current) return;
    loadedRef.current = true;

    supabase
      .from("annotations")
      .select("*, profiles(name, avatar_color)")
      .eq("case_id", caseId)
      .then(({ data, error }) => {
        if (error || !data || data.length === 0) return;

        // Build annotation map from Supabase rows
        const dbAnnotations: AnnotationMap = {};
        for (const row of data) {
          const targetId = row.target_id;
          if (!dbAnnotations[targetId]) {
            const p = row.profiles as { name: string; avatar_color: string } | null;
            dbAnnotations[targetId] = {
              user: p?.name?.toLowerCase() === "claude" ? "claude" : (p?.name || "investigator"),
              user_id: row.user_id,
              avatar_color: p?.avatar_color,
              notes: [],
              attachments: [],
            };
          }
          if (row.type === "note") {
            dbAnnotations[targetId].notes.push(row.content);
          } else if (row.type === "highlight") {
            try {
              dbAnnotations[targetId].attachments.push(JSON.parse(row.content));
            } catch {
              dbAnnotations[targetId].notes.push(row.content);
            }
          }
        }

        // Merge: DB annotations override defaults
        setAnnotations((prev) => ({ ...prev, ...dbAnnotations }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, caseId]);

  const addNote = useCallback(
    (annId: string, note: string) => {
      setAnnotations((prev) => {
        const ann = prev[annId] || { user: profile?.name || "investigator", notes: [], attachments: [] };
        return {
          ...prev,
          [annId]: { ...ann, notes: [...ann.notes, note] },
        };
      });

      // Persist to Supabase
      if (user && caseId) {
        supabase.from("annotations").insert({
          user_id: user.id,
          case_id: caseId,
          target_id: annId,
          type: "note",
          content: note,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, caseId, profile]
  );

  const addAttachment = useCallback(
    (annId: string, attachment: Attachment) => {
      setAnnotations((prev) => {
        const ann = prev[annId] || {
          user: profile?.name || "investigator",
          notes: [],
          attachments: [],
        };
        return {
          ...prev,
          [annId]: {
            ...ann,
            attachments: [...ann.attachments, attachment],
          },
        };
      });

      // Persist to Supabase
      if (user && caseId) {
        supabase.from("annotations").insert({
          user_id: user.id,
          case_id: caseId,
          target_id: annId,
          type: "highlight",
          content: JSON.stringify(attachment),
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, caseId, profile]
  );

  const createAnnotation = useCallback(
    (annId: string, userName: string) => {
      setAnnotations((prev) => ({
        ...prev,
        [annId]: prev[annId] || { user: userName, notes: [], attachments: [] },
      }));
    },
    []
  );

  const getCount = useCallback(
    (annId: string) => {
      const ann = annotations[annId];
      if (!ann) return 0;
      return ann.notes.length + ann.attachments.length;
    },
    [annotations]
  );

  return {
    annotations,
    addNote,
    addAttachment,
    createAnnotation,
    getCount,
  };
}

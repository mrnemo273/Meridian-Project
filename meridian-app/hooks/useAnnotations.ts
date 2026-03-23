"use client";

import { useState, useCallback, useEffect } from "react";

export interface Attachment {
  type: "url" | "video" | "document";
  title: string;
  url: string;
}

export interface Annotation {
  user: "nemo" | "claude";
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

export function useAnnotations() {
  const [annotations, setAnnotations] = useState<AnnotationMap>(() => {
    if (typeof window === "undefined") return defaultAnnotations;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) return JSON.parse(stored);
    } catch {}
    return defaultAnnotations;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
    } catch {}
  }, [annotations]);

  const addNote = useCallback((annId: string, note: string) => {
    setAnnotations((prev) => {
      const ann = prev[annId] || { user: "nemo", notes: [], attachments: [] };
      return {
        ...prev,
        [annId]: { ...ann, notes: [...ann.notes, note] },
      };
    });
  }, []);

  const addAttachment = useCallback(
    (annId: string, attachment: Attachment) => {
      setAnnotations((prev) => {
        const ann = prev[annId] || {
          user: "nemo",
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
    },
    []
  );

  const createAnnotation = useCallback(
    (annId: string, user: "nemo" | "claude") => {
      setAnnotations((prev) => ({
        ...prev,
        [annId]: prev[annId] || { user, notes: [], attachments: [] },
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

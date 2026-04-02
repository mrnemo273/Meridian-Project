"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useAnnotations } from "@/hooks/useAnnotations";
import { useAuth } from "@/components/SupabaseProvider";

export function useWorkspaceInteractions(onSetActiveTab: (tab: string) => void, caseId?: string) {
  const [ctxVisible, setCtxVisible] = useState(false);
  const [ctxPos, setCtxPos] = useState({ x: 0, y: 0 });
  const [currentSelection, setCurrentSelection] = useState<{ text: string; range: Range } | null>(null);

  const [inlineVisible, setInlineVisible] = useState(false);
  const [inlineType, setInlineType] = useState<"note" | "url">("note");
  const [inlinePos, setInlinePos] = useState({ x: 0, y: 0 });
  const [pendingHighlightId, setPendingHighlightId] = useState<string | null>(null);

  const [popoverVisible, setPopoverVisible] = useState(false);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
  const [popoverAnnId, setPopoverAnnId] = useState<string | null>(null);

  const { annotations, addNote, addAttachment, createAnnotation, getCount } = useAnnotations(caseId);
  const { profile } = useAuth();
  const highlightCount = Object.keys(annotations).length;
  const userName = profile?.name?.toLowerCase() || "nemo";

  const applyHighlight = useCallback((user: string) => {
    if (!currentSelection) return;
    const span = document.createElement("span");
    const annId = "ann-" + Date.now();
    // Use hl-claude for AI, hl-nemo for all human investigators
    span.className = user === "claude" ? "hl-claude" : "hl-nemo";
    span.setAttribute("data-annotation-id", annId);
    span.setAttribute("data-user", user);
    span.setAttribute("data-count", "");
    try { currentSelection.range.surroundContents(span); } catch {
      const fragment = currentSelection.range.extractContents();
      span.appendChild(fragment);
      currentSelection.range.insertNode(span);
    }
    window.getSelection()?.removeAllRanges();
    setCurrentSelection(null);
    createAnnotation(annId, user);
    return annId;
  }, [currentSelection, createAnnotation]);

  const ctxAction = useCallback((action: string) => {
    setCtxVisible(false);
    if (action === "highlight-nemo") { applyHighlight(userName); }
    else if (action === "highlight-claude") { applyHighlight("claude"); }
    else if (action === "add-note" || action === "add-url") {
      const hlId = applyHighlight(userName);
      if (hlId) {
        setPendingHighlightId(hlId);
        setInlineType(action === "add-note" ? "note" : "url");
        setInlinePos({ x: ctxPos.x, y: ctxPos.y + 30 });
        setInlineVisible(true);
      }
    } else if (action === "link-evidence") { applyHighlight(userName); onSetActiveTab("chain"); }
    else if (action === "search-selection") { onSetActiveTab("search"); }
  }, [applyHighlight, ctxPos, onSetActiveTab]);

  const submitInline = useCallback((noteText?: string, urlTitle?: string, urlValue?: string) => {
    if (!pendingHighlightId) return;
    if (inlineType === "note" && noteText) {
      addNote(pendingHighlightId, noteText);
      const el = document.querySelector(`[data-annotation-id="${pendingHighlightId}"]`);
      if (el) el.setAttribute("data-count", String(getCount(pendingHighlightId) + 1));
    } else if (inlineType === "url" && urlValue) {
      addAttachment(pendingHighlightId, { type: "url", title: urlTitle || "Untitled link", url: urlValue });
      const el = document.querySelector(`[data-annotation-id="${pendingHighlightId}"]`);
      if (el) el.setAttribute("data-count", String(getCount(pendingHighlightId) + 1));
    }
    setInlineVisible(false);
    setPendingHighlightId(null);
  }, [pendingHighlightId, inlineType, addNote, addAttachment, getCount]);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    const sel = window.getSelection();
    const hasSelection = sel && !sel.isCollapsed && sel.toString().trim().length > 0;
    const existingHl = (e.target as HTMLElement).closest(".hl-nemo, .hl-claude");
    if (!hasSelection && !existingHl) return;
    e.preventDefault();
    if (hasSelection && sel) setCurrentSelection({ text: sel.toString(), range: sel.getRangeAt(0).cloneRange() });
    let x = e.clientX, y = e.clientY;
    if (x + 220 > window.innerWidth) x = window.innerWidth - 228;
    if (y + 280 > window.innerHeight) y = window.innerHeight - 288;
    setCtxPos({ x, y });
    setCtxVisible(true);
  }, []);

  const handleContentClick = useCallback((e: React.MouseEvent) => {
    const hl = (e.target as HTMLElement).closest(".hl-nemo, .hl-claude") as HTMLElement;
    if (hl) {
      e.preventDefault();
      const annId = hl.getAttribute("data-annotation-id");
      if (annId) {
        const rect = hl.getBoundingClientRect();
        setPopoverAnnId(annId);
        setPopoverPos({ x: Math.min(rect.left, window.innerWidth - 340), y: rect.bottom + 8 });
        setPopoverVisible(true);
      }
      return;
    }
    if (!(e.target as HTMLElement).closest(".annotation-popover")) setPopoverVisible(false);
  }, []);

  const hlIndexRef = useRef(-1);
  const jumpToNextHighlight = useCallback(() => {
    const highlights = document.querySelectorAll(".hl-nemo, .hl-claude");
    if (!highlights.length) return;
    hlIndexRef.current = (hlIndexRef.current + 1) % highlights.length;
    const hl = highlights[hlIndexRef.current] as HTMLElement;
    hl.scrollIntoView({ behavior: "smooth", block: "center" });
    const annId = hl.getAttribute("data-annotation-id");
    if (annId) {
      const rect = hl.getBoundingClientRect();
      setPopoverAnnId(annId);
      setPopoverPos({ x: Math.min(rect.left, window.innerWidth - 340), y: rect.bottom + 8 });
      setPopoverVisible(true);
    }
  }, []);

  const addPopoverAnnotation = useCallback((inputValue: string) => {
    if (!inputValue || !popoverAnnId) return;
    if (inputValue.match(/^https?:\/\//)) {
      addAttachment(popoverAnnId, { type: "url", title: inputValue.replace(/^https?:\/\/(www\.)?/, "").substring(0, 50), url: inputValue });
    } else { addNote(popoverAnnId, inputValue); }
    const el = document.querySelector(`[data-annotation-id="${popoverAnnId}"]`);
    if (el) {
      const ann = annotations[popoverAnnId];
      if (ann) el.setAttribute("data-count", String(ann.notes.length + ann.attachments.length + 1));
    }
  }, [popoverAnnId, addNote, addAttachment, annotations]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setCtxVisible(false); setPopoverVisible(false); setInlineVisible(false); }
      if (ctxVisible) {
        if (e.key === "n" || e.key === "N") { e.preventDefault(); ctxAction("add-note"); }
        if (e.key === "u" || e.key === "U") { e.preventDefault(); ctxAction("add-url"); }
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter" && inlineVisible) {
        e.preventDefault();
        const textarea = document.getElementById("inlineTextarea") as HTMLTextAreaElement;
        if (textarea) submitInline(textarea.value.trim());
        const urlTitle = document.getElementById("inlineUrlTitle") as HTMLInputElement;
        const urlValue = document.getElementById("inlineUrlValue") as HTMLInputElement;
        if (urlValue) submitInline(undefined, urlTitle?.value?.trim(), urlValue.value.trim());
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [ctxVisible, ctxAction, inlineVisible, submitInline]);

  // Close ctx menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".ctx-menu")) setCtxVisible(false);
    };
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  return {
    // Context menu
    ctxVisible, ctxPos, ctxAction,
    handleContextMenu, handleContentClick,
    // Inline input
    inlineVisible, inlineType, inlinePos,
    closeInline: () => setInlineVisible(false),
    submitInline,
    // Popover
    popoverVisible, popoverPos, popoverAnnId,
    popoverAnn: popoverAnnId ? annotations[popoverAnnId] ?? null : null,
    closePopover: () => setPopoverVisible(false),
    addPopoverAnnotation,
    // Annotations
    annotations, getCount, highlightCount,
    jumpToNextHighlight,
  };
}

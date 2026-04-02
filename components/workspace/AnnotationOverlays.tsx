import type { Attachment } from "@/hooks/useAnnotations";

interface InlineInputProps {
  visible: boolean;
  pos: { x: number; y: number };
  type: "note" | "url";
  onClose: () => void;
  onSubmit: (noteText?: string, urlTitle?: string, urlValue?: string) => void;
}

export function InlineInput({ visible, pos, type, onClose, onSubmit }: InlineInputProps) {
  return (
    <div className={`inline-note-input ${visible ? "visible" : ""}`} style={{ left: pos.x, top: pos.y }}>
      <label>{type === "note" ? "Add Note" : "Attach URL"}</label>
      <div>
        {type === "note" ? (
          <textarea id="inlineTextarea" placeholder="What do you notice about this?" autoFocus />
        ) : (
          <>
            <input type="text" id="inlineUrlTitle" placeholder='Title (e.g. Fravor JRE Interview)' />
            <input type="url" id="inlineUrlValue" placeholder="https://..." />
          </>
        )}
      </div>
      <div className="inp-actions">
        <button className="inp-btn" onClick={onClose}>Cancel</button>
        <button
          className="inp-btn primary"
          onClick={() => {
            if (type === "note") {
              const textarea = document.getElementById("inlineTextarea") as HTMLTextAreaElement;
              onSubmit(textarea?.value?.trim());
            } else {
              const title = (document.getElementById("inlineUrlTitle") as HTMLInputElement)?.value?.trim();
              const url = (document.getElementById("inlineUrlValue") as HTMLInputElement)?.value?.trim();
              onSubmit(undefined, title, url);
            }
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
}

interface AnnotationPopoverProps {
  visible: boolean;
  pos: { x: number; y: number };
  annId: string | null;
  annotation: { user: string; avatar_color?: string; notes: string[]; attachments: Attachment[] } | null;
  onClose: () => void;
  onAdd: (value: string) => void;
}

export function AnnotationPopover({ visible, pos, annotation, onClose, onAdd }: AnnotationPopoverProps) {
  const isAI = annotation?.user === "claude";
  const displayName = isAI ? "Claude" : (annotation?.user || "Investigator");
  const dotColor = isAI ? undefined : annotation?.avatar_color;

  return (
    <div className={`annotation-popover ${visible ? "visible" : ""}`} style={{ left: pos.x, top: pos.y }}>
      <div className="annotation-popover-header">
        <div className="ann-user">
          {isAI ? (
            <><span className="inv-dot ai" style={{ width: 8, height: 8 }}></span> {displayName}</>
          ) : (
            <><span className="inv-dot human" style={{ width: 8, height: 8, ...(dotColor ? { background: dotColor } : {}) }}></span> {displayName}</>
          )}
        </div>
        <button className="annotation-popover-close" onClick={onClose}>&times;</button>
      </div>
      <div className="annotation-popover-body">
        {annotation && (
          <>
            {annotation.notes.map((note, i) => (
              <div key={i} className={`annotation-note ${isAI ? "claude-note" : ""}`}>
                {note}
              </div>
            ))}
            {annotation.attachments.length > 0 && (
              <div className="annotation-attachments">
                <div style={{ fontSize: "8px", letterSpacing: 1, textTransform: "uppercase", color: "var(--text-3)", marginBottom: 6 }}>Attachments</div>
                {annotation.attachments.map((att: Attachment, i: number) => (
                  <div key={i} className="annotation-attachment">
                    <span className="att-icon">{att.type === "video" ? "\u25B6" : att.type === "url" ? "\uD83D\uDD17" : "\uD83D\uDCC4"}</span>
                    <span className="att-title">{att.title}</span>
                    <span className="att-type">{att.type}</span>
                  </div>
                ))}
              </div>
            )}
            {!annotation.notes.length && !annotation.attachments.length && (
              <div style={{ fontSize: "9px", color: "var(--text-3)", padding: "8px 0" }}>
                No annotations yet. Right-click this highlight to add notes or URLs.
              </div>
            )}
          </>
        )}
      </div>
      <div className="annotation-input-area">
        <input
          type="text"
          placeholder="Add a note or paste a URL..."
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              onAdd((e.target as HTMLInputElement).value.trim());
              (e.target as HTMLInputElement).value = "";
            }
          }}
        />
        <button onClick={(e) => {
          const input = (e.target as HTMLElement).parentElement?.querySelector("input") as HTMLInputElement;
          if (input) {
            onAdd(input.value.trim());
            input.value = "";
          }
        }}>Add</button>
      </div>
    </div>
  );
}

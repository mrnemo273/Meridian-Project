interface Props {
  visible: boolean;
  pos: { x: number; y: number };
  onAction: (action: string) => void;
}

export function ContextMenu({ visible, pos, onAction }: Props) {
  return (
    <div className={`ctx-menu ${visible ? "visible" : ""}`} style={{ left: pos.x, top: pos.y }}>
      <div className="ctx-menu-header">Highlight</div>
      <button className="ctx-menu-item" onClick={() => onAction("highlight-nemo")}>
        <span className="ctx-icon hl-nemo-icon">&#9632;</span> Highlight as Nemo
        <span className="ctx-shortcut">orange</span>
      </button>
      <button className="ctx-menu-item" onClick={() => onAction("highlight-claude")}>
        <span className="ctx-icon hl-claude-icon">&#9632;</span> Highlight as Claude
        <span className="ctx-shortcut">purple</span>
      </button>
      <div className="ctx-menu-divider"></div>
      <div className="ctx-menu-header">Annotate</div>
      <button className="ctx-menu-item" onClick={() => onAction("add-note")}>
        <span className="ctx-icon note-icon">&#9998;</span> Add Note
        <span className="ctx-shortcut">N</span>
      </button>
      <button className="ctx-menu-item" onClick={() => onAction("add-url")}>
        <span className="ctx-icon url-icon">&#128279;</span> Attach URL
        <span className="ctx-shortcut">U</span>
      </button>
      <div className="ctx-menu-divider"></div>
      <button className="ctx-menu-item" onClick={() => onAction("link-evidence")}>
        <span className="ctx-icon link-icon">&#8596;</span> Link to Evidence
      </button>
      <button className="ctx-menu-item" onClick={() => onAction("search-selection")}>
        <span className="ctx-icon search-icon">&#128269;</span> Search for this
      </button>
    </div>
  );
}

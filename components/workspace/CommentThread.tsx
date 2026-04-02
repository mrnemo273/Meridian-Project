"use client";

import { useState } from "react";
import { useComments } from "@/hooks/useComments";
import { useAuth } from "@/components/SupabaseProvider";

interface Props {
  caseId: string;
  targetId: string | null;
  targetLabel?: string;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay}d ago`;
}

export function CommentThread({ caseId, targetId, targetLabel }: Props) {
  const { comments, loading, addComment, deleteComment } = useComments(caseId, targetId);
  const { user } = useAuth();
  const [input, setInput] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    await addComment(input.trim());
    setInput("");
  }

  if (!targetId) {
    return (
      <div className="comment-thread">
        <div className="comment-empty">
          Select a card to view its discussion thread.
        </div>
      </div>
    );
  }

  return (
    <div className="comment-thread">
      {targetLabel && (
        <div className="comment-thread-label">{targetLabel}</div>
      )}

      {loading && (
        <div className="comment-loading">Loading comments...</div>
      )}

      {!loading && comments.length === 0 && (
        <div className="comment-empty">
          No comments yet. Be the first to weigh in.
        </div>
      )}

      <div className="comment-list">
        {comments.map((c) => (
          <div key={c.id} className="comment-item">
            <div className="comment-header">
              <span
                className="comment-dot"
                style={{ background: c.author_color }}
              ></span>
              <span className="comment-author">{c.author_name}</span>
              <span className="comment-time">{timeAgo(c.created_at)}</span>
              {user && c.user_id === user.id && (
                <button
                  className="comment-delete"
                  onClick={() => deleteComment(c.id)}
                  title="Delete comment"
                >
                  &times;
                </button>
              )}
            </div>
            <div className="comment-body">{c.content}</div>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="comment-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add a comment..."
          className="comment-input"
        />
        <button
          type="submit"
          className="comment-send"
          disabled={!input.trim()}
        >
          Send
        </button>
      </form>
    </div>
  );
}

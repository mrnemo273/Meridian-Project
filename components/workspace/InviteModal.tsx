"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/components/SupabaseProvider";

interface Props {
  visible: boolean;
  onClose: () => void;
}

export function InviteModal({ visible, onClose }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [investigators, setInvestigators] = useState<Profile[]>([]);

  useEffect(() => {
    if (visible) {
      const supabase = createClient();
      supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: true })
        .then(({ data }) => {
          if (data) setInvestigators(data as Profile[]);
        });
    }
  }, [visible]);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);
    setSuccess(null);

    const res = await fetch("/api/invites", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email.trim() }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Failed to send invite");
      return;
    }

    setSuccess(`Invite sent to ${email.trim()}`);
    setEmail("");
  }

  if (!visible) return null;

  return (
    <div className="invite-overlay" onClick={onClose}>
      <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
        <div className="invite-modal-header">
          <h3>Invite Investigator</h3>
          <button className="invite-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleInvite} className="invite-form">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="investigator@email.com"
            className="invite-input"
            required
            autoFocus
          />
          <button
            type="submit"
            className="invite-send-btn"
            disabled={loading || !email.trim()}
          >
            {loading ? "Sending..." : "Send Invite"}
          </button>
        </form>

        {success && <div className="invite-success">{success}</div>}
        {error && <div className="invite-error">{error}</div>}

        {investigators.length > 0 && (
          <div className="invite-team">
            <div className="invite-team-label">Current Team</div>
            {investigators.map((inv) => (
              <div key={inv.id} className="invite-team-row">
                <div className="inv-dot human" style={{ background: inv.avatar_color }}></div>
                <span className="invite-team-name">{inv.name || inv.email}</span>
                <span className="invite-team-role">{inv.role}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function LoginContent() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const authError = searchParams.get("error");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error: otpError } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    setLoading(false);

    if (otpError) {
      if (otpError.message.includes("not allowed") || otpError.message.includes("signup")) {
        setError("This email has not been invited. Contact the lead investigator.");
      } else {
        setError(otpError.message);
      }
      return;
    }

    router.push(`/login/check-email?email=${encodeURIComponent(email.trim())}`);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span>Meridian</span> Project
        </div>
        <p className="login-subtitle">
          This is an invite-only investigation platform
        </p>

        {(authError || error) && (
          <div className="login-error">
            {error || "Authentication failed. Please try again."}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <label htmlFor="email" className="login-label">Email address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="investigator@email.com"
            className="login-input"
            required
            autoFocus
          />
          <button
            type="submit"
            className="login-button"
            disabled={loading || !email.trim()}
          >
            {loading ? "Sending..." : "Send magic link"}
          </button>
        </form>

        <p className="login-hint">
          No password needed. We&apos;ll email you a sign-in link.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginContent />
    </Suspense>
  );
}

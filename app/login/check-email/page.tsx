"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

function CheckEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span>Meridian</span> Project
        </div>

        <div className="check-email-icon">&#9993;</div>

        <h2 className="check-email-heading">Check your email</h2>
        <p className="check-email-text">
          We sent a sign-in link to <strong>{email}</strong>.<br />
          Click it to access Meridian Project.
        </p>
        <p className="check-email-note">
          The link expires in 1 hour.
        </p>

        <Link href="/login" className="check-email-back">
          &larr; Back to login
        </Link>
      </div>
    </div>
  );
}

export default function CheckEmailPage() {
  return (
    <Suspense>
      <CheckEmailContent />
    </Suspense>
  );
}

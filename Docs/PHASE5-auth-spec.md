# Phase 5 — Auth Layer (Invite-Only via Supabase)

> **Status:** Open
> **Depends on:** Phase 4 (shipped)
> **Goal:** Add authentication with an invite-only access model using Supabase (hosted Postgres + built-in auth + magic links). One founding user (juanmorales@gmail.com) to start, with an invite flow for adding investigators. Migrate annotations, comments, and votes from anonymous localStorage to user-attributed persistent storage.

---

## Important: Read Next.js 16 Docs First

**Before writing any code**, read the relevant docs at `node_modules/next/dist/docs/`. Next.js 16.2.1 has breaking changes from what you may know about App Router, middleware, route handlers, and server actions. Heed deprecation notices.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────┐
│  Client (React 19)                              │
│  ├── SupabaseProvider wraps app layout          │
│  ├── useUser() / useSession() for auth state    │
│  ├── Annotations / ACH votes → Supabase client  │
│  └── Invite modal (admin only)                  │
├─────────────────────────────────────────────────┤
│  Next.js Middleware                              │
│  ├── Validates Supabase session on every request│
│  └── Redirects unauthenticated → /login         │
├─────────────────────────────────────────────────┤
│  Supabase (hosted)                               │
│  ├── Auth     (magic link email, sessions, JWT) │
│  ├── Postgres (profiles, invites, annotations)  │
│  └── RLS      (row-level security policies)     │
└─────────────────────────────────────────────────┘
```

**Why Supabase:** The user already has an account. Supabase replaces three separate dependencies (SQLite/Prisma for DB, NextAuth for auth, Resend for email) with a single hosted service. It provides Postgres, magic link auth with built-in email sending, real-time subscriptions (useful later for live collaboration), and row-level security. Free tier covers this use case easily.

---

## Deliverable 1: Supabase Project Setup

### 1A. Create Supabase project

If not already done:
1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Create a new project (name: `meridian-project`)
3. Note the **Project URL** and **anon key** from Settings → API

### 1B. Install dependencies

```bash
npm install @supabase/supabase-js @supabase/ssr
```

### 1C. Environment file (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."
SUPABASE_SERVICE_ROLE_KEY="eyJ..."       # For admin operations (invite flow)
```

**Note:** Add `.env.local` to `.gitignore`. The `NEXT_PUBLIC_` vars are safe to expose (they're scoped by RLS). The service role key is server-only — never import it in client code.

### 1D. Supabase Auth Configuration (in Supabase Dashboard)

1. **Authentication → Providers:** Enable "Email" provider. Enable "Magic Link" (should be on by default). Disable email+password sign-up (magic link only).
2. **Authentication → URL Configuration:** Set Site URL to `http://localhost:3000` (and later your production domain). Add `http://localhost:3000/auth/callback` to Redirect URLs.
3. **Authentication → Email Templates:** Customize the magic link email:
   - Subject: "Sign in to Meridian Project"
   - Body: Keep it clean — just the magic link button. Can customize later.
4. **CRITICAL — Disable public sign-ups:** Go to Authentication → Settings → User Signups → **Turn OFF "Enable email confirmations"** is not enough. You need to turn OFF **"Allow new users to sign up"** so that only admin-invited users can join. The invite flow (Deliverable 4) uses the service role key to create users server-side, bypassing this restriction.

---

## Deliverable 2: Supabase Client Setup

### 2A. Browser client (`lib/supabase/client.ts`)

```typescript
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

### 2B. Server client (`lib/supabase/server.ts`)

```typescript
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function createServerSupabaseClient() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options);
          });
        },
      },
    }
  );
}
```

### 2C. Admin client (`lib/supabase/admin.ts`) — server-only

```typescript
import { createClient } from "@supabase/supabase-js";

// Service role client — bypasses RLS. NEVER use on client side.
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
```

**Check Next.js 16 docs** — the `cookies()` API and server component patterns may differ from earlier versions. Adapt as needed.

---

## Deliverable 3: Database Schema (Supabase SQL)

Run this in the Supabase SQL Editor (Dashboard → SQL Editor), or create a migration file at `supabase/migrations/001_initial_schema.sql`:

```sql
-- Profiles table (extends Supabase auth.users)
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT NOT NULL DEFAULT 'investigator'
    CHECK (role IN ('admin', 'investigator', 'viewer')),
  avatar_color TEXT DEFAULT '#4A6A9A',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-create profile when a new auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Invites table
CREATE TABLE public.invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  invited_by UUID REFERENCES public.profiles(id),
  used BOOLEAN DEFAULT false,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ DEFAULT (now() + INTERVAL '7 days')
);

-- Annotations table
CREATE TABLE public.annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  case_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'note'
    CHECK (type IN ('note', 'highlight', 'comment')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_annotations_case ON public.annotations(case_id);

-- ACH Votes table
CREATE TABLE public.ach_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  case_id TEXT NOT NULL,
  hypothesis TEXT NOT NULL,
  evidence TEXT NOT NULL,
  vote TEXT NOT NULL CHECK (vote IN ('C', 'I', 'N', '-')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, case_id, hypothesis, evidence)
);

-- Comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  case_id TEXT NOT NULL,
  target_id TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX idx_comments_target ON public.comments(case_id, target_id);

-- ========================================
-- Row Level Security (RLS)
-- ========================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ach_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Profiles: all authenticated users can read all profiles
CREATE POLICY "Profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

-- Profiles: users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Invites: only admins can create and view invites
CREATE POLICY "Admins can manage invites"
  ON public.invites FOR ALL
  TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
  );

-- Annotations: authenticated users can read all annotations for collaboration
CREATE POLICY "Annotations are viewable by authenticated users"
  ON public.annotations FOR SELECT
  TO authenticated
  USING (true);

-- Annotations: users can create their own
CREATE POLICY "Users can create annotations"
  ON public.annotations FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Annotations: users can update/delete their own
CREATE POLICY "Users can update own annotations"
  ON public.annotations FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own annotations"
  ON public.annotations FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ACH Votes: same pattern as annotations
CREATE POLICY "Votes are viewable by authenticated users"
  ON public.ach_votes FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create votes"
  ON public.ach_votes FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own votes"
  ON public.ach_votes FOR UPDATE TO authenticated
  USING (auth.uid() = user_id);

-- Comments: same pattern
CREATE POLICY "Comments are viewable by authenticated users"
  ON public.comments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can create comments"
  ON public.comments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE TO authenticated
  USING (auth.uid() = user_id);
```

### 3B. Seed the founding user

After running the SQL above, create the admin user. In the Supabase Dashboard:

1. Go to **Authentication → Users → Invite user**
2. Enter: `juanmorales@gmail.com`
3. This creates the auth user and triggers the `handle_new_user` function which creates the profile
4. Then in **SQL Editor**, run:
   ```sql
   UPDATE public.profiles
   SET name = 'Nemo', role = 'admin'
   WHERE email = 'juanmorales@gmail.com';
   ```

Alternatively, the builder can create a seed script at `scripts/seed-admin.ts` that uses the admin client:
```typescript
import { supabaseAdmin } from "@/lib/supabase/admin";

async function seedAdmin() {
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: "juanmorales@gmail.com",
    email_confirm: true,
    user_metadata: { name: "Nemo" },
  });
  if (error) throw error;

  await supabaseAdmin.from("profiles").update({ role: "admin", name: "Nemo" })
    .eq("id", data.user.id);

  console.log("Admin user created:", data.user.id);
}

seedAdmin();
```

---

## Deliverable 4: Auth Callback Route

Supabase magic links redirect to a callback URL that exchanges the auth code for a session.

### `app/auth/callback/route.ts`

```typescript
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  // Auth code error — redirect to login with error
  return NextResponse.redirect(`${origin}/login?error=auth`);
}
```

---

## Deliverable 5: Login Page

### 5A. Login page (`app/login/page.tsx`)

Design requirements:
- Full-page centered layout on `var(--bg)` background
- Meridian Project logo/wordmark at top (Instrument Serif)
- "This is an invite-only investigation platform" subtitle
- Single email input field + "Send magic link" button
- On submit: calls `supabase.auth.signInWithOtp({ email })`
- Error state for uninvited emails: "This email has not been invited. Contact the lead investigator."
- Success state: shows "Check your email" message inline (or redirect to check-email page)
- No password fields. Magic link only. Clean and simple.
- Style consistent with existing design system (warm neutrals, Instrument Serif, JetBrains Mono for the email field)

### 5B. Check-email page (`app/login/check-email/page.tsx`)

- "Check your email" heading
- "We sent a sign-in link to [email]. Click it to access Meridian Project."
- Small note: "The link expires in 1 hour."
- Link back to login page
- Same styling as login page

---

## Deliverable 6: Protect Routes with Middleware

### `middleware.ts`

**Check Next.js 16 docs** for the current middleware API.

```typescript
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();

  // If no user and not on a public route, redirect to login
  if (!user && !request.nextUrl.pathname.startsWith("/login")
            && !request.nextUrl.pathname.startsWith("/auth/callback")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  // If user is authenticated and on login page, redirect to home
  if (user && request.nextUrl.pathname.startsWith("/login")) {
    const url = request.nextUrl.clone();
    url.pathname = "/";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: [
    // Match all routes except static files and images
    "/((?!_next/static|_next/image|favicon.ico|images|media|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm)$).*)",
  ],
};
```

---

## Deliverable 7: Session Provider & User Context

### 7A. Supabase auth provider (`components/SupabaseProvider.tsx`)

```typescript
"use client";

import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";

interface Profile {
  id: string;
  email: string;
  name: string;
  role: "admin" | "investigator" | "viewer";
  avatar_color: string;
}

interface AuthContext {
  user: User | null;
  profile: Profile | null;
  isAdmin: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContext>({
  user: null, profile: null, isAdmin: false, signOut: async () => {},
});

export function useAuth() { return useContext(AuthContext); }

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Get initial session
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) fetchProfile(data.user.id);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const newUser = session?.user ?? null;
        setUser(newUser);
        if (newUser) fetchProfile(newUser.id);
        else setProfile(null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(userId: string) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) setProfile(data as Profile);
  }

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      isAdmin: profile?.role === "admin",
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### 7B. Wrap app in provider (`app/layout.tsx`)

Add `<SupabaseProvider>` around `{children}` in the root layout.

### 7C. Replace hardcoded user identity

Currently the sidebar footer on both home page and case pages shows:
```tsx
<div className="inv-dot human"></div>
<span className="inv-name">Nemo</span>
<span className="inv-role">Investigator</span>
```

Replace with dynamic session data:
```tsx
const { profile, signOut } = useAuth();
// ...
<div className="inv-dot human"></div>
<span className="inv-name">{profile?.name || "Investigator"}</span>
<span className="inv-role">{profile?.role || "investigator"}</span>
// Keep Claude as the fixed AI analyst below
// Add subtle sign-out link
```

---

## Deliverable 8: Invite System

### 8A. Invite API route (`app/api/invites/route.ts`)

**POST** — Create invite (admin only)
```typescript
// 1. Verify calling user is admin (check profile.role via server supabase client)
// 2. Create the auth user via supabaseAdmin.auth.admin.inviteUserByEmail(email)
//    - This sends Supabase's built-in invite email with a magic link
//    - The user clicks it, confirms, and lands at /auth/callback
// 3. Insert row into public.invites for tracking
// 4. Return { success: true, email }
```

**GET** — List invites (admin only)
```typescript
// Returns all invites joined with profiles to show used/unused status
```

The key insight: Supabase's `inviteUserByEmail` handles the email sending natively. No need for Resend. The invited user gets an email, clicks the link, and is authenticated. The `handle_new_user` trigger auto-creates their profile.

### 8B. Invite UI (admin only)

Add an "Invite Investigator" button to the sidebar footer. Only visible when `useAuth().isAdmin` is true.

Clicking it opens a small modal:
- Email input
- "Send Invite" button
- Success message: "Invite sent to [email]"
- Below: list of current investigators (from profiles table)

### 8C. Invite email customization

In the Supabase Dashboard → Authentication → Email Templates → "Invite user" template:
```
Subject: You've been invited to Meridian Project

<h2>Welcome, Investigator</h2>
<p>You've been invited to join Meridian Project — a collaborative platform for investigating the most credible UAP cases in history.</p>
<p><a href="{{ .ConfirmationURL }}">Accept Invitation →</a></p>
<p>This link expires in 24 hours.</p>
```

---

## Deliverable 9: Migrate Annotations to Supabase

### 9A. Create `hooks/useAnnotations.ts` (updated)

The current hook reads/writes localStorage with hardcoded `"nemo" | "claude"` users.

Migrate to:
- On mount: fetch from `supabase.from("annotations").select("*, profiles(name, avatar_color)").eq("case_id", caseId)`
- On create: `supabase.from("annotations").insert({ user_id, case_id, target_id, type, content })`
- On update: `supabase.from("annotations").update({ content }).eq("id", annotationId)`
- On delete: `supabase.from("annotations").delete().eq("id", annotationId)`
- User identity comes from `useAuth()` — no more hardcoded users
- **Optimistic updates**: update local state immediately, sync in background
- **Fallback**: if Supabase is unreachable, queue writes and retry (or fall back to localStorage temporarily)

### 9B. Update `hooks/useACHVotes.ts`

Same pattern:
- Fetch: `supabase.from("ach_votes").select("*").eq("case_id", caseId)`
- Upsert on vote: `supabase.from("ach_votes").upsert({ user_id, case_id, hypothesis, evidence, vote })`
- Each investigator's votes are tracked separately — the ACH matrix can show aggregate or per-user views

### 9C. Multi-user annotation display

Update `AnnotationOverlays.tsx`:
- Each annotation shows the author's name and their `avatar_color` as the highlight tint
- The "Claude" AI analyst annotations use `data-user="claude"` and keep the existing purple highlight style
- Human investigators each get their own color (from their profile `avatar_color`)
- Annotation popover header: "Nemo · 2 hours ago" with colored dot

---

## Deliverable 10: Comment Threads on Cards

### 10A. Comment hook (`hooks/useComments.ts`)

```typescript
// Fetches comments for a specific card:
// supabase.from("comments")
//   .select("*, profiles(name, avatar_color)")
//   .eq("case_id", caseId)
//   .eq("target_id", targetId)
//   .order("created_at", { ascending: true })
```

### 10B. Comment UI component (`components/workspace/CommentThread.tsx`)

When a card is selected (evidence, witness, gallery item), show a comment thread in the right-side investigation column or as a slide-out panel:
- List of existing comments: author name (colored), timestamp, content
- Text input at bottom to add a new comment
- Flat chronological list (no threading/nesting for now)
- Style: similar to existing annotation popover, but persistent
- Empty state: "No comments yet. Be the first to weigh in."

---

## File Structure Summary

```
app/
  api/
    invites/route.ts               ← NEW (admin invite endpoint)
  auth/
    callback/route.ts              ← NEW (magic link callback)
  login/
    page.tsx                       ← NEW
    check-email/page.tsx           ← NEW
lib/
  supabase/
    client.ts                      ← NEW (browser client)
    server.ts                      ← NEW (server client)
    admin.ts                       ← NEW (service role client)
components/
  SupabaseProvider.tsx             ← NEW
  workspace/
    AnnotationOverlays.tsx         ← MODIFY (multi-user display)
    CommentThread.tsx              ← NEW
hooks/
  useAnnotations.ts                ← MODIFY (localStorage → Supabase)
  useACHVotes.ts                   ← MODIFY (localStorage → Supabase)
  useComments.ts                   ← NEW
scripts/
  seed-admin.ts                    ← NEW (optional — can seed via dashboard)
middleware.ts                      ← NEW
.env.local                         ← NEW (do NOT commit)
.gitignore                         ← MODIFY (add .env.local)
supabase/
  migrations/
    001_initial_schema.sql         ← NEW (optional — can run via dashboard)
```

---

## Definition of Done

- [ ] Supabase client libraries installed and configured
- [ ] Database schema created (profiles, invites, annotations, ach_votes, comments)
- [ ] RLS policies active on all tables
- [ ] juanmorales@gmail.com exists as admin user
- [ ] Magic link login works (enter email → receive link → click → authenticated)
- [ ] Unauthenticated users redirected to `/login`
- [ ] All case pages and home page require authentication
- [ ] Session user's name/role shown in sidebar (replaces hardcoded "Nemo")
- [ ] Annotations save to Supabase and load on page refresh
- [ ] ACH votes save to Supabase and persist across sessions
- [ ] Invite flow: admin clicks "Invite Investigator" → enters email → invitee receives email → can sign in
- [ ] Non-invited emails cannot sign up (public sign-ups disabled)
- [ ] Comment threads work on evidence/witness/gallery cards
- [ ] Multi-user annotations show author identity with colored indicators
- [ ] Sign-out works and redirects to login
- [ ] `npm run build` passes cleanly

---

## Setup Instructions (for Nemo — before builder starts)

The builder needs these values in `.env.local` before it can test anything:

1. **Go to your Supabase dashboard** → select (or create) the project
2. **Settings → API** — copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` `public` key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `service_role` `secret` key → `SUPABASE_SERVICE_ROLE_KEY`
3. **Create `.env.local`** in the project root with those three values
4. **Authentication → Settings:** Turn OFF "Allow new users to sign up"
5. **Authentication → URL Configuration:** Add `http://localhost:3000/auth/callback` to redirect URLs

Then hand it to the builder. After the build, you'll be able to sign in with your Gmail via magic link, and invite others from the sidebar.

---

## Builder Notes

| Date | Note |
|------|------|
| 2026-03-24 | Next.js 16 renames middleware.ts → proxy.ts with `export function proxy()`. Applied throughout. |
| 2026-03-24 | Installed @supabase/supabase-js + @supabase/ssr. Created lib/supabase/{client,server,admin}.ts. |
| 2026-03-24 | Created SQL migration at supabase/migrations/001_initial_schema.sql — run in Supabase Dashboard SQL Editor. |
| 2026-03-24 | Auth callback at app/auth/callback/route.ts. Login page + check-email page created. |
| 2026-03-24 | proxy.ts protects all routes — redirects unauthenticated to /login, authenticated away from /login. |
| 2026-03-24 | SupabaseProvider wraps app layout. useAuth() provides user, profile, isAdmin, signOut. |
| 2026-03-24 | Replaced hardcoded "Nemo" in CaseSidebar and home page with dynamic profile data. |
| 2026-03-24 | Invite system: POST/GET /api/invites (admin-only), InviteModal component, wired into workspace sidebar. |
| 2026-03-24 | useAnnotations migrated to Supabase with localStorage fallback. Accepts caseId param. |
| 2026-03-24 | useACHVotes migrated to Supabase with localStorage fallback. Uses upsert for vote persistence. |
| 2026-03-24 | CommentThread component + useComments hook created. Added "Discuss" tab to InvestColumn. |
| 2026-03-24 | AnnotationOverlays updated for multi-user display — shows author name and avatar_color dot. |
| 2026-03-24 | Highlight CSS classes: hl-nemo for all human investigators, hl-claude for AI. Dynamic user names in data-user attr. |
| 2026-03-24 | IMPORTANT: Run 001_initial_schema.sql in Supabase SQL Editor before first use. Seed admin user via Dashboard or scripts/seed-admin.ts. |
| 2026-04-02 | Replaced magic link auth with Google SSO (signInWithOAuth). Google OAuth configured in Supabase + Google Cloud Console. |
| 2026-04-02 | Auth callback now checks ALLOWED_EMAILS list + invites table. Unauthorized Google users are rejected and deleted. |
| 2026-04-02 | Added NEXT_PUBLIC_DEV_BYPASS_AUTH=true in .env.local to skip auth during local development. |
| 2026-04-02 | Added Supabase env vars to Vercel (NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY). |
| 2026-04-02 | Invite button added to home page sidebar (was only on case pages). |
| 2026-04-02 | Login page redesigned: Playfair Display italic for headlines/button, mono for small labels. Matches app logo style (Oswald). |

import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

// Emails allowed to sign in. Add new investigators here or via the invite system.
const ALLOWED_EMAILS = [
  "juanmorales@gmail.com",
];

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (code) {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      // Check if this user is authorized
      const { data: { user } } = await supabase.auth.getUser();

      if (user?.email) {
        // Check allowed list OR if they were invited (exists in invites table)
        const admin = getSupabaseAdmin();
        const { data: invite } = await admin
          .from("invites")
          .select("id")
          .eq("email", user.email)
          .maybeSingle();

        const isAllowed = ALLOWED_EMAILS.includes(user.email) || !!invite;

        if (isAllowed) {
          return NextResponse.redirect(`${origin}${next}`);
        }

        // Not authorized — sign them out and delete the auto-created user
        await supabase.auth.signOut();
        await admin.auth.admin.deleteUser(user.id);
        return NextResponse.redirect(`${origin}/login?error=unauthorized`);
      }
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}

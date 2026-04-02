import { getSupabaseAdmin } from "@/lib/supabase/admin";

async function seedAdmin() {
  const supabaseAdmin = getSupabaseAdmin();
  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email: "juanmorales@gmail.com",
    email_confirm: true,
    user_metadata: { name: "Nemo" },
  });
  if (error) throw error;

  await supabaseAdmin
    .from("profiles")
    .update({ role: "admin", name: "Nemo" })
    .eq("id", data.user.id);

  console.log("Admin user created:", data.user.id);
}

seedAdmin();

import { supabase } from "./supabaseClient.js";

export async function requireAdmin() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = "../login/login.html";
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (error || data.role !== "admin") {
    alert("Access denied");
    window.location.href = "../dashboard/dashboard.html";
    return null;
  }

  return session;
}

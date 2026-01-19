// js/auth.js
import { supabase } from "./supabaseClient.js";

/**
 * Require authentication on protected pages
 * Usage:
 *   const session = await requireAuth();
 *   if (!session) return;
 */
export async function requireAuth() {
  const {
    data: { session },
    error
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Auth error:", error);
    window.location.href = "../login/login.html";
    return null;
  }

  if (!session) {
    window.location.href = "../login/login.html";
    return null;
  }

  return session;
}

/**
 * Logout user
 */
export async function logoutUser() {
  await supabase.auth.signOut();
  window.location.href = "../login/login.html";
}

/**
 * Make logoutUser available for inline onclick=""
 */
window.logoutUser = logoutUser;

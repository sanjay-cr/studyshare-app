// login/login.js
import { supabase } from "../js/supabaseClient.js";

console.log("LOGIN JS LOADED");

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
      alert("Please enter email and password");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert(error.message);
      return;
    }

    // ✅ ONLY redirect AFTER successful login
    window.location.href = "../dashboard/dashboard.html";
  });
});

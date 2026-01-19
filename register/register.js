import { supabase } from "../js/supabaseClient.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("registerForm");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const cpassword = document.getElementById("cpassword").value;

    if (password !== cpassword) {
      alert("Passwords do not match");
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }   // stored in user_metadata
      }
    });

    if (error) {
      alert(error.message);
      return;
    }

    alert("Registration successful! Please login.");
    window.location.href = "../login/login.html";
  });
});

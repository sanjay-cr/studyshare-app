// dashboard/dashboard.js
import { supabase } from "../js/supabaseClient.js";

document.addEventListener("DOMContentLoaded", async () => {
  console.log("DASHBOARD LOADED");

  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();

  if (error) {
    console.error("Session error:", error);
    return;
  }

  if (!session) {
    console.log("No session found, redirecting to login...");
    window.location.href = "../login/login.html";
    return;
  }
  const adminLink = document.getElementById("adminLink");

  const { data } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();

  if (data.role !== "admin") {
    adminLink.style.display = "none";
  }


  const user = session.user;
  console.log("SESSION USER:", user);

  const welcomeEl = document.getElementById("welcomeuser");
  if (welcomeEl) {
    welcomeEl.textContent = `Welcome, ${user.email}!`;
  }

  await loadStats(user);
  await loadRecentUploads();
});

/* -------------------------
      LOAD STATS
-------------------------- */
async function loadStats(user) {
  console.log("Loading stats for user:", user.id);

  // 1. All subjects (for distinct count)
  const { data: subjectRows, error: sError } = await supabase
  .from("uploads")
  .select("subject")
  .eq("approved", true);

  console.log("Stats query result -> subjectRows:", subjectRows, "Error:", sError);

  if (sError) {
    console.error("Subject load error:", sError);
    return;
  }

  const uniqueSubjects = new Set(
    (subjectRows || [])
      .map((r) => r.subject)
      .filter((s) => !!s)
  );

  // 2. Uploads made by this user
  const { data: uploadRows, error: uError } = await supabase
  .from("uploads")
  .select("id")
  .eq("uploaded_by", user.id)
  .eq("approved", true);

  console.log("Uploads query result -> uploadRows:", uploadRows, "Error:", uError);

  if (uError) {
    console.error("Uploads load error:", uError);
    return;
  }

  // 3. Total downloads (sum of download_count)
  const { data: downloadRows, error: dError } = await supabase
  .from("uploads")
  .select("download_count")
  .eq("approved", true);

  if (dError) {
    console.error("Download stat error:", dError);
  }

  const totalDownloads = (downloadRows || []).reduce(
    (sum, row) => sum + (row.download_count ?? 0),
    0
  );

  document.getElementById("totalsubjects").textContent = uniqueSubjects.size;
  document.getElementById("totaluploads").textContent = (uploadRows || []).length;
  document.getElementById("downloads").textContent = totalDownloads;
}


/* -------------------------
    RECENT UPLOADS
-------------------------- */
async function loadRecentUploads() {
  const tbody = document.getElementById("recentUploadsBody");

  const { data, error } = await supabase
  .from("uploads")
  .select("id,title,subject,department,file_url,created_at, profiles(name)")
  .eq("approved", true)
  .order("created_at", { ascending: false })
  .limit(5);
  console.log("Recent uploads data:", data, "Error:", error);

  if (error) {
    console.error("Recent uploads error:", error);
    return;
  }

  tbody.innerHTML = "";

  (data || []).forEach((item) => {
    const row = document.createElement("tr");
    row.setAttribute("data-id", item.id);   // IMPORTANT

    row.innerHTML = `
      <td>${item.title}</td>
      <td>${item.department}</td>
      <td>${item.profiles?.name || "Unknown"}</td>
      <td>${new Date(item.created_at).toLocaleDateString()}</td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deleteNote('${item.id}', '${item.file_url}')">Delete</button>
      </td>
    `;

    tbody.appendChild(row);
  });
}


// ------------------------ DELETE NOTE ------------------------
export async function deleteNote(id, fileUrl) {
  console.log("DELETE REQUEST ID:", id);

  if (!confirm("Are you sure you want to delete this note?")) return;

  try {
    const { data, error } = await supabase
      .from("uploads")
      .delete()
      .eq("id", id)
      .select();

    if (error) {
      console.error("DB Delete Error:", error);
      return;
    }

    console.log("Deleted DB row:", data);

    // Remove file from storage
    if (fileUrl) {
      const fileName = fileUrl.split("/").pop();
      await supabase.storage.from("notes").remove([fileName]);
    }

    await loadRecentUploads();
  } catch (error) {
    console.error("Delete failed:", error);
  }
}

window.deleteNote = deleteNote;


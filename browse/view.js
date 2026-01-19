// browse/view.js
import { supabase } from "../js/supabaseClient.js";

document.addEventListener("DOMContentLoaded", async () => {
  const uploadId = new URLSearchParams(window.location.search).get("id");
  if (!uploadId) return alert("Invalid link");

  await loadMaterial(uploadId);
});

// ------------------ SAFE SETTER ------------------
function safeSet(id, value) {
  const el = document.getElementById(id);
  if (el) el.textContent = value ?? "-";
}

// ------------------ LOAD MATERIAL ------------------
async function loadMaterial(uploadId) {
  const { data, error } = await supabase
    .from("uploads")
    .select(`
      id,
      title,
      subject,
      department,
      file_url,
      created_at,
      download_count,
      profiles(name)
    `)
    .eq("id", uploadId)
    .single();

  if (error || !data) {
    console.error(error);
    return alert("Material not found");
  }

  safeSet("viewTitle", data.title);
  safeSet("viewSubject", data.subject);
  safeSet("viewDepartment", data.department);
  safeSet("viewUploadedBy", data.profiles?.name || "Unknown");
  safeSet("viewDate", new Date(data.created_at).toLocaleDateString());
  safeSet("viewDownloads", data.download_count ?? 0);

  const frame = document.getElementById("previewFrame");
  if (frame) frame.src = data.file_url;

  const btn = document.getElementById("downloadBtn");
  if (btn) {
    btn.onclick = async () => {
      window.open(data.file_url, "_blank");
      await incrementDownload(uploadId);
    };
  }
}

// ------------------ DOWNLOAD COUNT ------------------
async function incrementDownload(uploadId) {
  const { data } = await supabase
    .from("uploads")
    .select("download_count")
    .eq("id", uploadId)
    .single();

  const next = (data?.download_count ?? 0) + 1;

  await supabase
    .from("uploads")
    .update({ download_count: next })
    .eq("id", uploadId);

  safeSet("viewDownloads", next);
}

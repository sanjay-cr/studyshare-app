import { supabase } from "../js/supabaseClient.js";

console.log("PROFILE JS LOADED");

document.addEventListener("DOMContentLoaded", async () => {
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    window.location.href = "../login/login.html";
    return;
  }
  const adminLink = document.getElementById("adminLink");

  if (adminLink) {
    const { data } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (data?.role !== "admin") {
      adminLink.style.display = "none";
    }
  }



  const user = session.user;

  await loadProfile(user.id);
  await loadUserUploads(user.id);

  document
    .getElementById("saveProfileBtn")
    ?.addEventListener("click", () => saveProfile(user.id));
});

/* ---------------- LOAD PROFILE ---------------- */
async function loadProfile(userId) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Profile load error:", error);
    return;
  }

  document.getElementById("nameInput").value = data.name || "";
  document.getElementById("departmentInput").value = data.department || "";
  document.getElementById("collegeInput").value = data.college || "";
  document.getElementById("bioInput").value = data.bio || "";

  if (data.avatar_url) {
    document.getElementById("avatarPreview").src = data.avatar_url;
  }
}

/* ---------------- SAVE PROFILE ---------------- */
async function saveProfile(userId) {
  const updates = {
    name: document.getElementById("nameInput").value.trim(),
    department: document.getElementById("departmentInput").value.trim(),
    college: document.getElementById("collegeInput").value.trim(),
    bio: document.getElementById("bioInput").value.trim(),
  };

  const { error } = await supabase
    .from("profiles")
    .update(updates)
    .eq("id", userId);

  if (error) {
    console.error("Profile update error:", error);
    alert("Failed to update profile");
  } else {
    alert("Profile updated successfully");
  }
}

/* ---------------- LOAD USER UPLOADS ---------------- */
async function loadUserUploads(userId) {
  const tbody = document.getElementById("myUploadsBody");

  const { data, error } = await supabase
    .from("uploads")
    .select("id,title,subject,created_at,file_url")
    .eq("uploaded_by", userId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Uploads error:", error);
    return;
  }

  tbody.innerHTML = "";

  data.forEach(item => {
    const row = document.createElement("tr");
    row.dataset.id = item.id;

    row.innerHTML = `
      <td>${item.title}</td>
      <td>${item.subject}</td>
      <td>${new Date(item.created_at).toLocaleDateString()}</td>
      <td>
        <button class="btn btn-danger btn-sm"
          onclick="deleteUpload('${item.id}', '${item.file_url}')">
          Delete
        </button>
      </td>
    `;

    tbody.appendChild(row);
  });
}

/* ---------------- DELETE UPLOAD ---------------- */
async function deleteUpload(id, fileUrl) {
  if (!confirm("Delete this upload permanently?")) return;

  // 1. Delete DB row
  const { error } = await supabase
    .from("uploads")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Delete DB error:", error);
    alert("Failed to delete");
    return;
  }

  // 2. Delete file from storage
  if (fileUrl) {
    const fileName = fileUrl.split("/").pop();
    await supabase.storage.from("notes").remove([fileName]);
  }

  // 3. Remove row from UI instantly
  document.querySelector(`tr[data-id="${id}"]`)?.remove();
}

window.deleteUpload = deleteUpload;

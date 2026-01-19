import { requireAdmin } from "../js/adminGuard.js";
import { supabase } from "../js/supabaseClient.js";

document.addEventListener("DOMContentLoaded", async () => {
  const session = await requireAdmin();
  if (!session) return;

  loadPending();
});

async function loadPending() {
  const tbody = document.getElementById("pendingTable");
  tbody.innerHTML = "";

  const { data, error } = await supabase
    .from("uploads")
    .select("id, title, subject, file_url, profiles(name)")
    .eq("approved", false);

  if (error) {
    console.error(error);
    return;
  }
  if (data.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="4" style="text-align:center; padding:20px;">
          No pending uploads 🎉
        </td>
      </tr>
    `;
    return;
  }

  data.forEach(item => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.title}</td>
      <td>${item.subject}</td>
      <td>${item.profiles?.name || "Unknown"}</td>
      <td>
        <button onclick="approve('${item.id}')" class="btn btn-success btn-sm">Approve</button>
        <button onclick="reject('${item.id}', '${item.file_url}')" class="btn btn-danger btn-sm">Reject</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

window.approve = async (id) => {
  await supabase.from("uploads").update({ approved: true }).eq("id", id);
  loadPending();
};

window.reject = async (id, fileUrl) => {
  if (!confirm("Delete this note?")) return;

  await supabase.from("uploads").delete().eq("id", id);

  if (fileUrl) {
    const fileName = fileUrl.split("/").pop();
    await supabase.storage.from("notes").remove([`uploads/${fileName}`]);
  }

  loadPending();
};


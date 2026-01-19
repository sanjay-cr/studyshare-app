// browse/browse.js
import { supabase } from "../js/supabaseClient.js";

const PAGE_SIZE = 10;
let currentPage = 1;
let totalCount = 0;

document.addEventListener("DOMContentLoaded", async () => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return (window.location.href = "../login/login.html");

  setupControls();
  await loadNotes();
});

// ---------------- LOAD NOTES (PAGINATED) ----------------
async function loadNotes() {
  const search = document.getElementById("searchInput").value.toLowerCase();
  const department = document.getElementById("departmentFilter").value;
  const sort = document.getElementById("sortFilter").value;

  let query = supabase
    .from("uploads")
    .select(
      `
      id,
      title,
      subject,
      department,
      created_at,
      download_count,
      profiles(name)
      `,
      { count: "exact" }
    )
    .eq("approved", true)
    .order("created_at", { ascending: false });

  if (department !== "all") {
    query = query.eq("department", department);
  }

  if (search) {
    query = query.or(
      `title.ilike.%${search}%,subject.ilike.%${search}%`
    );
  }

  if (sort === "downloads") {
    query = query.order("download_count", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const from = (currentPage - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error(error);
    return;
  }

  totalCount = count;
  renderTable(data);
  updatePagination();
}

// ---------------- RENDER TABLE ----------------
function renderTable(notes) {
  const tbody = document.getElementById("browseTableBody");
  tbody.innerHTML = "";

  notes.forEach((item) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.title}</td>
      <td>${item.subject}</td>
      <td>${item.department}</td>
      <td>${item.profiles?.name || "Unknown"}</td>
      <td>${new Date(item.created_at).toLocaleDateString()}</td>
      <td>${item.download_count ?? 0}</td>
      <td>
        <button class="btn btn-primary btn-sm" onclick="viewFile('${item.id}')">
          View
        </button>
        <button class="btn btn-outline-secondary btn-sm" onclick="copyLink('${item.id}')">Share</button>
        </td>
    `;
    tbody.appendChild(row);
  });
}

// ---------------- PAGINATION UI ----------------
function updatePagination() {
  document.getElementById("pageInfo").textContent = `Page ${currentPage}`;

  document.getElementById("prevBtn").disabled = currentPage === 1;
  document.getElementById("nextBtn").disabled =
    currentPage * PAGE_SIZE >= totalCount;
}

// ---------------- CONTROLS ----------------
function setupControls() {
  document.getElementById("searchInput").addEventListener("input", () => {
    currentPage = 1;
    loadNotes();
  });

  document.getElementById("departmentFilter").addEventListener("change", () => {
    currentPage = 1;
    loadNotes();
  });

  document.getElementById("sortFilter").addEventListener("change", () => {
    currentPage = 1;
    loadNotes();
  });

  document.getElementById("prevBtn").addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      loadNotes();
    }
  });

  document.getElementById("nextBtn").addEventListener("click", () => {
    currentPage++;
    loadNotes();
  });
}

// ---------------- NAVIGATION ----------------
window.viewFile = (id) => {
  window.location.href = `../browse/view.html?id=${id}`;
};
window.copyLink = (id) => {
  const link = `${window.location.origin}/browse/view.html?id=${id}`;
  navigator.clipboard.writeText(link);
  alert("Share link copied!");
};

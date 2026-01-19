// upload/upload.js
import { supabase } from "../js/supabaseClient.js";
import { requireAuth } from "../js/auth.js";

document.addEventListener("DOMContentLoaded", async () => {
  const session = await requireAuth();
  if (!session) return;

  const titleInput = document.getElementById("title");
  const subjectInput = document.getElementById("subject");
  const departmentInput = document.getElementById("department");
  const fileInput = document.getElementById("fileInput");
  const uploadBtn = document.getElementById("uploadBtn");

  uploadBtn.addEventListener("click", async () => {
    const title = titleInput.value.trim();
    const subject = subjectInput.value.trim();
    const department = departmentInput.value;
    const file = fileInput.files[0];

    if (!title || !subject || !department || !file) {
      alert("All fields are required");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be under 10MB");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ];

    if (!allowedTypes.includes(file.type)) {
      alert("Only PDF or DOC files are allowed");
      return;
    }

    uploadBtn.disabled = true;
    uploadBtn.textContent = "Uploading...";

    try {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "");
      const fileName = `${session.user.id}_${Date.now()}_${safeName}`;

      const { error: uploadError } = await supabase.storage
        .from("notes")
        .upload(`uploads/${fileName}`, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from("notes")
        .getPublicUrl(`uploads/${fileName}`);

      const { error: insertError } = await supabase
        .from("uploads")
        .insert({
          title,
          subject,
          department,
          file_url: urlData.publicUrl,
          uploaded_by: session.user.id,
          approved: false
        });

      if (insertError) throw insertError;

      alert("Uploaded successfully! Waiting for admin approval.");

      titleInput.value = "";
      subjectInput.value = "";
      departmentInput.value = "";
      fileInput.value = "";

    } catch (err) {
      console.error(err);
      alert("Upload failed");
    } finally {
      uploadBtn.disabled = false;
      uploadBtn.textContent = "Upload";
    }
  });
});

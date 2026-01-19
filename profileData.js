document.addEventListener("DOMContentLoaded", function () {
    const user = JSON.parse(localStorage.getItem("user"));

    // Show user details
    if (user) {
        document.getElementById("profileName").textContent = user.name;
        document.getElementById("profileEmail").textContent = user.email;
    }

    // Load notes
    let notes = JSON.parse(localStorage.getItem("notes")) || [];

    const tableBody = document.getElementById("notesTableBody");
    tableBody.innerHTML = "";

    notes.forEach(n => {
        tableBody.innerHTML += `
            <tr>
                <td>${n.title}</td>
                <td>${n.subject}</td>
                <td>${n.date}</td>
            </tr>
        `;
    });
});

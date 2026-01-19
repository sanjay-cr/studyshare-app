document.addEventListener("DOMContentLoaded", function () {

    const isLoggedIn = localStorage.getItem("loggedIn");
    const user = JSON.parse(localStorage.getItem("currentUser"));

    if (!isLoggedIn || !user) {
        alert("Please login first");
        window.location.href = "../login/login.html";
    }

});

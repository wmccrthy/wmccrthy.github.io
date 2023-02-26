function highlightCurrent() {
    let currentNav = document.querySelectorAll(".nav-item");
    currentNav.addEventListener("click", function shade() {
        currentNav.style.backgroundColor = "grey";
    });
}
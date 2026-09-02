document.addEventListener("DOMContentLoaded", () => {
    const tabButtons = document.querySelectorAll(".profile-tabs .tab-item");
    const tabPanes = document.querySelectorAll(".tab-pane");

    tabButtons.forEach(button => {
        button.addEventListener("click", () => {
            tabButtons.forEach(btn => btn.classList.remove("active"));
            tabPanes.forEach(pane => pane.classList.remove("active"));

            button.classList.add("active");

            const targetId = button.getAttribute("data-target");
            const targetPane = document.getElementById(targetId);

            if (targetPane) {
                targetPane.classList.add("active");
            }
        });
    });
});
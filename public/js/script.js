// Check if chart data exists (prevents errors on other pages)
if (window.chartLabels && window.chartData) {

    const ctx = document.getElementById("categoryChart");

    if (ctx) {
        new Chart(ctx, {
            type: "pie",
            data: {
                labels: window.chartLabels,
                datasets: [{
                    data: window.chartData,
                    backgroundColor: [
                        "#ff6384",
                        "#36a2eb",
                        "#ffce56",
                        "#4bc0c0",
                        "#9966ff",
                        "#ff9f40",
                        "#c9cbcf"
                    ]
                }]
            }
        });
    }
}

const themeToggle = document.getElementById("themeToggle");

// Load saved theme
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark-mode");
  if (themeToggle) {
    themeToggle.innerHTML = '<i class="fa-solid fa-sun"></i>';
  }
}

if (themeToggle) {
  themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");

    const isDark = document.body.classList.contains("dark-mode");

    // Save preference
    localStorage.setItem("theme", isDark ? "dark" : "light");

    // Toggle icon
    themeToggle.innerHTML = isDark
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  });
}








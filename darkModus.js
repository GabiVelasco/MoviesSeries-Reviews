// function toggleDarkMode() {
//     document.body.classList.toggle('dark-mode'); // Toggle dark mode class
// }

// // Add event listener to the dark mode toggle button
// document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode);




    document.getElementById('themeToggle').addEventListener('click', function () {
        const mainContainer = document.querySelector('html');
        const currentTheme = mainContainer.getAttribute('data-bs-theme');

        // Toggle between light and dark themes
        if (currentTheme === 'light') {
            mainContainer.setAttribute('data-bs-theme', 'dark');
        } else {
            mainContainer.setAttribute('data-bs-theme', 'light');
        }
    });


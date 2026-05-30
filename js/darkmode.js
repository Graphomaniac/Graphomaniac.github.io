document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('darkModeToggle');

    if (toggleBtn) {
        toggleBtn.addEventListener('click', (e) => {
            e.preventDefault();

            const isDark = document.documentElement.classList.contains('latex-dark');

            if (isDark) {
                document.documentElement.classList.remove('latex-dark');
                localStorage.setItem('theme', 'light');
            } else {
                document.documentElement.classList.add('latex-dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }
});

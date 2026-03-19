/**
 * Presentacion/main.js
 * Punto de entrada principal y listeners globales.
 */

function initMainApp() {
    // 1. Sidebar Toggle Mobile/Desktop
    const sidebarToggle = document.getElementById('sidebar-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');

    if (sidebarToggle && sidebar && sidebarOverlay) {
        sidebarToggle.addEventListener('click', () => {
            if (window.innerWidth <= 1024) {
                sidebar.classList.toggle('sidebar--open');
                sidebarOverlay.classList.toggle('active');
            } else {
                sidebar.classList.toggle('sidebar--closed');
            }
        });

        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('sidebar--open');
            sidebarOverlay.classList.remove('active');
        });
    }

    // 2. Logout Listener
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn && typeof App !== 'undefined') {
        logoutBtn.addEventListener('click', App.logout);
    }

    // 3. Global Search with Debounce
    const searchInput = document.getElementById('dashboard-search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                window.globalSearchQuery = e.target.value.trim();
                if (typeof renderModule === 'function') {
                    renderModule(window.currentActiveModule);
                }
            }, 300);
        });
    }

    // 4. Router Initialization (Handles both public and admin states)
    if (typeof Router !== 'undefined') {
        Router.init();
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMainApp);
} else {
    initMainApp();
}

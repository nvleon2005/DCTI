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
            const icon = sidebarToggle.querySelector('i');
            
            if (window.innerWidth <= 1024) {
                sidebar.classList.toggle('sidebar--open');
                sidebarOverlay.classList.toggle('active');
                if (icon) {
                    if (sidebar.classList.contains('sidebar--open')) {
                        icon.classList.replace('fa-bars', 'fa-xmark');
                    } else {
                        icon.classList.replace('fa-xmark', 'fa-bars');
                    }
                }
            } else {
                sidebar.classList.toggle('sidebar--closed');
                if (icon) {
                    if (icon.classList.contains('fa-bars')) {
                        icon.classList.replace('fa-bars', 'fa-xmark');
                    } else {
                        icon.classList.replace('fa-xmark', 'fa-bars');
                    }
                }
            }
        });

        sidebarOverlay.addEventListener('click', () => {
            sidebar.classList.remove('sidebar--open');
            sidebarOverlay.classList.remove('active');
            const icon = sidebarToggle.querySelector('i');
            if (icon && icon.classList.contains('fa-xmark')) {
                icon.classList.replace('fa-xmark', 'fa-bars');
            }
        });
    }

    // 2. Logout Listener
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn && typeof App !== 'undefined') {
        logoutBtn.addEventListener('click', App.logout);
    }

    // El filtro del sidebar ahora es manejado exclusivamente mediante delegación en App.js
    // para prevenir condiciones de carrera y duplicidad de eventos.

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

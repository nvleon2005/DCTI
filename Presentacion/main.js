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

    // 5. Global Anti-XSS Listener for all Inputs (Restricción de Scripting)
    document.addEventListener('input', (e) => {
        if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) {
            const type = e.target.type;
            if (type !== 'file' && type !== 'checkbox' && type !== 'radio' && type !== 'color') {
                if (/[<>]/.test(e.target.value)) {
                    e.target.value = e.target.value.replace(/[<>]/g, '');
                    
                    // Disparar un evento input sintético si otros scripts dependen de él para validaciones
                    const event = new Event('input', { bubbles: true });
                    // Solo evitamos el bucle infinito comprobando temporalmente
                    e.target.dispatchEvent(event);
                }
            }
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initMainApp);
} else {
    initMainApp();
}

/**
 * Presentacion/Application/ErrorHandler.js
 * Manejador global de excepciones y promesas rechazadas no capturadas.
 * Previene que el sistema se congele ante un error inesperado mostrando 
 * alertas amigables o una pantalla fatal para recuperación segura.
 */

(function() {
    window.addEventListener('error', function(event) {
        handleGlobalError(event.message, event.filename, event.lineno, event.colno, event.error);
    });

    window.addEventListener('unhandledrejection', function(event) {
        const reason = event.reason;
        const msg = (reason && reason.message) ? reason.message : String(reason);
        handleGlobalError(msg, 'Promise', 0, 0, reason);
    });

    function handleGlobalError(message, source, lineno, colno, error) {
        console.error("DCTI Global Error Caught:", message, error);

        // Si el AlertService ya cargó, lo utilizamos para una alerta amigable (no fatal)
        if (typeof AlertService !== 'undefined' && AlertService.notify) {
            const toastContainer = document.getElementById('toast-container');
            if (toastContainer) toastContainer.style.zIndex = '999999';
            AlertService.notify(
                'Error Detectado',
                message || 'Ha ocurrido un problema técnico en la aplicación.',
                'error'
            );
        } else {
            // Si el DOM o las utilidades fallaron, o no han cargado, mostramos pantalla crítica
            showFatalErrorScreen(message);
        }
    }

    function showFatalErrorScreen(message) {
        if (document.getElementById('fatal-error-screen')) return;
        
        const div = document.createElement('div');
        div.id = 'fatal-error-screen';
        div.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.95); z-index: 99999; display: flex; align-items: center; justify-content: center; flex-direction: column; color: white; font-family: "Outfit", sans-serif; text-align: center; padding: 2rem; box-sizing: border-box; backdrop-filter: blur(10px);';
        
        // Sanitize the message slightly in case it's huge
        const safeMsg = (message || 'Error técnico desconocido').substring(0, 300);

        // Usamos setSafeHTML si DOMHelper está disponible, sino lo insertamos como texto para prevenir XSS
        if (window.DOMHelper && window.DOMHelper.setSafeHTML) {
            const htmlContent = `
                <div style="background: rgba(255, 255, 255, 0.05); padding: 3rem; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1); max-width: 500px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);">
                    <i class="fas fa-exclamation-triangle" style="font-size: 4rem; color: #ef4444; margin-bottom: 1.5rem;"></i>
                    <h2 style="margin: 0 0 1rem 0; font-size: 1.5rem; color: #f8fafc;">¡Ups! Algo salió mal</h2>
                    <p style="color: #94a3b8; font-size: 1rem; line-height: 1.6; margin-bottom: 2rem;">
                        El sistema encontró un error técnico inesperado. Por favor, recarga la página para continuar.
                    </p>
                    <div style="background: rgba(0,0,0,0.2); padding: 1rem; border-radius: 8px; margin-bottom: 2rem; text-align: left; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: 0.8rem; color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.2);">
                        ${safeMsg}
                    </div>
                    <button onclick="window.location.reload()" style="background: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 1rem; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 8px;" onmouseover="this.style.background='#dc2626'" onmouseout="this.style.background='#ef4444'">
                        <i class="fas fa-sync-alt"></i> Recargar Página
                    </button>
                </div>
            `;
            window.DOMHelper.setSafeHTML(div, htmlContent);
        } else {
            // Fallback si DOMHelper no ha cargado aún
            div.innerHTML = `
                <div style="background: rgba(255, 255, 255, 0.05); padding: 3rem; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1); max-width: 500px; width: 100%; text-align: center;">
                    <h2 style="margin-bottom: 1rem;">Error de Sistema</h2>
                    <p style="margin-bottom: 1.5rem; color: #94a3b8;">Por favor recarga la página.</p>
                    <button onclick="window.location.reload()" style="background: #ef4444; color: white; border: none; padding: 12px 24px; border-radius: 8px; cursor: pointer;">
                        Recargar Página
                    </button>
                </div>
            `;
        }
        
        document.body.appendChild(div);
    }
})();

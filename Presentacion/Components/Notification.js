/**
 * AlertService - Sistema de Notificaciones del Portal DCTI
 * Reemplaza alert() y confirm() estándares por una UI profesional.
 */

const AlertService = {
    _container: null,

    _initContainer() {
        if (!this._container) {
            this._container = document.createElement('div');
            this._container.id = 'toast-container';
            document.body.appendChild(this._container);
        }
    },

    notify(title, message, type = 'info', duration = 4000) {
        this._initContainer();

        const toast = document.createElement('div');
        toast.className = `toast toast--${type}`;

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        toast.innerHTML = `
            <i class="fas ${icons[type] || icons.info}"></i>
            <div class="toast__content">
                <span class="toast__title">${title}</span>
                <span class="toast__message">${message}</span>
            </div>
        `;

        this._container.appendChild(toast);

        // Trigger reflow for animation
        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, duration);
    },

    success(message, title = 'Éxito', duration = 4000) {
        this.notify(title, message, 'success', duration);
    },

    error(message, title = 'Error', duration = 4000) {
        this.notify(title, message, 'error', duration);
    },

    warning(message, title = 'Atención', duration = 4000) {
        this.notify(title, message, 'warning', duration);
    },

    info(message, title = 'Información', duration = 4000) {
        this.notify(title, message, 'info', duration);
    },

    async confirm(title, message, confirmText = 'Confirmar', cancelText = 'Cancelar', isDanger = false) {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.className = 'custom-modal-overlay';

            const iconClass = isDanger ? 'modal-icon--warning' : '';
            const confirmBtnClass = isDanger ? 'btn-modal--danger' : 'btn-modal--confirm';

            overlay.innerHTML = `
                <div class="custom-modal">
                    <div class="modal-icon ${iconClass}">
                        <i class="fas ${isDanger ? 'fa-trash-alt' : 'fa-question-circle'}"></i>
                    </div>
                    <h3>${title}</h3>
                    <p>${message}</p>
                    <div class="modal-actions">
                        <button class="btn-modal btn-modal--cancel" id="modal-cancel">${cancelText}</button>
                        <button class="btn-modal ${confirmBtnClass}" id="modal-confirm">${confirmText}</button>
                    </div>
                </div>
            `;

            document.body.appendChild(overlay);
            setTimeout(() => overlay.classList.add('show'), 10);

            const close = (result) => {
                overlay.classList.remove('show');
                setTimeout(() => {
                    overlay.remove();
                    resolve(result);
                }, 300);
            };

            overlay.querySelector('#modal-cancel').onclick = () => close(false);
            overlay.querySelector('#modal-confirm').onclick = () => close(true);
            overlay.onclick = (e) => {
                if (e.target === overlay) close(false);
            };
        });
    }
};

// Exponer globalmente
window.AlertService = AlertService;

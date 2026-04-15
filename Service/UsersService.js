/**
 * Service/UsersService.js
 * Responsabilidad: Gestión de Datos de Usuarios (CRUD) y Autenticación.
 */

const UsersController = {
    AUTH_CONFIG: {
        hardcodedUsers: [
            { email: 'admin@dcti.gob', password: '123', name: 'Administrador', role: 'admin', initials: 'AD', status: 'Activo' },
            { email: 'editor@dcti.gob', password: '123', name: 'Editor de Contenidos', role: 'editor', initials: 'EC', status: 'Activo' }
        ]
    },

    getLocalUsers() {
        const users = localStorage.getItem('dcti_users');
        return users ? JSON.parse(users) : [];
    },

    saveLocalUser(user) {
        const users = this.getLocalUsers();
        users.push(user);
        localStorage.setItem('dcti_users', JSON.stringify(users));
    },

    previewAvatar(event) {
        const file = event.target.files[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                AlertService.notify('Error', 'Solo se permiten subir imágenes.', 'error');
                event.target.value = '';
                document.getElementById('admin-user-avatar-preview').style.display = 'none';
                return;
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                const img = new Image();
                img.onload = function () {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 150;
                    const MAX_HEIGHT = 150;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0, width, height);

                    const dataUrl = canvas.toDataURL('image/webp', 0.85);
                    const preview = document.getElementById('admin-user-avatar-preview');
                    if (preview) {
                        preview.src = dataUrl;
                        preview.style.display = 'block';
                    }
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    },

    openUserModal(email = null) {
        const modal = document.getElementById('user-modal');
        const form = document.getElementById('user-admin-form');
        const title = document.getElementById('modal-title');
        const editEmailInput = document.getElementById('edit-email-target');

        if (!modal || !form) return;

        modal.classList.remove('hidden');
        form.reset();

        if (email) {
            if (title) title.textContent = 'Editar Usuario';
            editEmailInput.value = email;

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.title = 'Actualizar';

            const allUsers = [...this.AUTH_CONFIG.hardcodedUsers, ...this.getLocalUsers()];
            const user = allUsers.find(u => u.email === email);

            if (user) {
                document.getElementById('admin-user-name').value = user.name || '';
                document.getElementById('admin-user-lastname').value = user.lastname || '';
                document.getElementById('admin-user-cedula').value = user.cedula || '';
                document.getElementById('admin-user-username').value = user.username || '';
                document.getElementById('admin-user-email').value = user.email || '';
                document.getElementById('admin-user-role').value = user.role || 'visitante';
                document.getElementById('admin-user-pass').value = '';
                document.getElementById('admin-user-pass').placeholder = '•••••••• (Oculta por seguridad)';

                const radios = document.getElementsByName('admin-user-role-radio');
                for (let radio of radios) {
                    if (radio.value === user.role) radio.checked = true;
                }

                const avatarPreview = document.getElementById('admin-user-avatar-preview');
                if (avatarPreview) {
                    if (user.avatar) {
                        avatarPreview.src = user.avatar;
                        avatarPreview.style.display = 'block';
                    } else {
                        avatarPreview.src = '';
                        avatarPreview.style.display = 'none';
                    }
                }

                const isHardcoded = this.AUTH_CONFIG.hardcodedUsers.some(u => u.email === email);
                document.getElementById('admin-user-email').disabled = isHardcoded;

                const auditContainer = document.getElementById('user-audit-container');
                if (auditContainer) {
                    const session = JSON.parse(localStorage.getItem('dcti_session')) || {};
                    const isAdmin = session.role === 'admin';
                    
                    let auditHtml = `
                        <h4 style="font-size: 0.85rem; color: var(--color-text-main); margin-bottom: 8px;">Auditoría</h4>
                        <div style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 10px;">
                            <div style="margin-bottom: 4px;"><i class="fas fa-calendar-plus" style="margin-right: 5px;"></i> Creado: ${user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-VE') : 'N/A'} por <b>${user.createdBy || 'Sistema'}</b></div>
                            <div><i class="fas fa-edit" style="margin-right: 5px;"></i> Última act: ${user.updatedAt ? new Date(user.updatedAt).toLocaleDateString('es-VE') : 'N/A'} por <b>${user.updatedBy || 'Sistema'}</b></div>
                        </div>
                    `;

                    if (isAdmin && user.history && user.history.length > 0) {
                        auditHtml += `
                            <details style="background: #f8fafc; border: 1px solid var(--color-border); border-radius: 4px; padding: 6px;">
                                <summary style="font-size: 0.75rem; font-weight: 600; cursor: pointer; color: var(--color-primary); margin-bottom: 5px;">Historial de Cambios (${user.history.length})</summary>
                                <ul style="list-style: none; padding: 0; margin: 5px 0 0 0; font-size: 0.7rem;">
                                    ${user.history.map(h => `
                                        <li style="border-bottom: 1px dashed #e2e8f0; padding: 4px 0;">
                                            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
                                                <span><b>${h.responsible}</b> (${h.action || 'Cambio'})</span>
                                                <span style="color: var(--color-text-muted);">${h.date}</span>
                                            </div>
                                            <div style="color: #64748b;">${h.fields}</div>
                                        </li>
                                    `).join('')}
                                </ul>
                            </details>
                        `;
                    }
                    auditContainer.innerHTML = auditHtml;
                    auditContainer.style.display = 'block';
                }
            }
        } else {
            if (title) title.textContent = 'Nuevo Usuario';
            if (editEmailInput) editEmailInput.value = '';
            document.getElementById('admin-user-email').disabled = false;
            
            const auditContainer = document.getElementById('user-audit-container');
            if (auditContainer) {
                auditContainer.innerHTML = '';
                auditContainer.style.display = 'none';
            }

            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) submitBtn.title = 'Registrar';

            const preview = document.getElementById('admin-user-avatar-preview');
            if (preview) {
                preview.src = '';
                preview.style.display = 'none';
            }

            const avatarInput = document.getElementById('admin-user-avatar-input');
            if (avatarInput) avatarInput.value = '';

            document.getElementById('admin-user-pass').value = '';
            document.getElementById('admin-user-pass').placeholder = 'Ingrese contraseña segura...';

            const radios = document.getElementsByName('admin-user-role-radio');
            for (let radio of radios) {
                if (radio.value === 'visitante') radio.checked = true;
            }
            document.getElementById('admin-user-role').value = 'visitante';
        }
    },

    closeUserModal() {
        const modal = document.getElementById('user-modal');
        if (modal) modal.classList.add('hidden');
    },

    async _handleUserAdminSubmitCore(e) {
        e.preventDefault();
        const editEmail = document.getElementById('edit-email-target').value;
        // [SECURITY] Sanitizar campos de texto para prevenir XSS (Anti-Scripting)
        const name     = window.sanitizeHTML ? window.sanitizeHTML(document.getElementById('admin-user-name').value.trim()) : document.getElementById('admin-user-name').value.trim();
        const lastname = window.sanitizeHTML ? window.sanitizeHTML(document.getElementById('admin-user-lastname').value.trim()) : document.getElementById('admin-user-lastname').value.trim();
        const cedula   = document.getElementById('admin-user-cedula').value;
        const username = window.sanitizeHTML ? window.sanitizeHTML(document.getElementById('admin-user-username').value.trim()) : document.getElementById('admin-user-username').value.trim();
        const email    = document.getElementById('admin-user-email').value;
        const pass     = document.getElementById('admin-user-pass').value;
        const role     = document.getElementById('admin-user-role').value;
        const avatarPreview = document.getElementById('admin-user-avatar-preview');
        const avatar   = (avatarPreview && avatarPreview.style.display === 'block') ? avatarPreview.src : null;

        // Validar campos obligatorios post-sanitización
        if (!name || !username || !email) {
            AlertService.notify('Campos Vacíos', 'Nombre, usuario y correo no pueden estar vacíos.', 'warning');
            return;
        }

        if (typeof validateEmailFormat === 'function' && !validateEmailFormat(email)) {
            AlertService.notify('Validación Fallida', 'Formato de correo electrónico no válido.', 'error');
            return;
        }

        if (pass && typeof validatePasswordComplexity === 'function' && !validatePasswordComplexity(pass)) {
            AlertService.notify('Contraseña Insegura', 'Mínimo 8 caracteres, una mayúscula, un número y un carácter especial.', 'error');
            return;
        }

        if (editEmail) {
            await this.updateUser(editEmail, { name, lastname, cedula, username, email, role, password: pass, avatar });
        } else {
            if (!pass) {
                AlertService.notify('Campo Requerido', 'La contraseña es obligatoria.', 'warning');
                return;
            }

            const allUsers = [...this.AUTH_CONFIG.hardcodedUsers, ...this.getLocalUsers()];
            if (allUsers.some(u => u.email === email)) {
                AlertService.notify('Correo Duplicado', 'Este correo ya pertenece a un usuario.', 'error');
                return;
            }

            const passwordHash = await hashSHA256(pass);
            const nameSafe = name || username || 'Usuario';
            const session = JSON.parse(localStorage.getItem('dcti_session')) || { name: 'Sistema' };
            const nowStr = new Date().toLocaleString('es-VE');

            const newUser = {
                name, lastname, cedula, username, email,
                password: passwordHash,
                role, avatar, status: 'Activo',
                initials: nameSafe.substring(0, 2).toUpperCase(),
                createdAt: new Date().toISOString(),
                createdBy: session.name || session.username || "Usuario",
                updatedAt: new Date().toISOString(),
                updatedBy: session.name || session.username || "Usuario",
                history: [{ date: nowStr, responsible: session.name || session.username || "Usuario", action: "Creación", fields: "Todos" }]
            };
            this.saveLocalUser(newUser);
            if (typeof AuditService !== 'undefined') AuditService.log('Creación', 'Usuarios', email, name || username, 'Usuario creado con rol: ' + role);
        }

        this.closeUserModal();
        if (typeof renderModule === 'function') renderModule('users');
    },

    // [SECURITY] Wrapper público con rate limiting (Anti-Spam / Brute-Force)
    handleUserAdminSubmit: null, // Se inicializará tras la definición del objeto

    async updateUser(oldEmail, newData) {
        if (oldEmail === 'admin@dcti.gob') {
            AlertService.notify('Acción Denegada', 'El administrador principal está protegido.', 'error');
            return;
        }

        const localUsers = this.getLocalUsers();
        const index = localUsers.findIndex(u => u.email === oldEmail);

        if (index !== -1) {
            const currentUser = localUsers[index];
            const changes = [];
            if (currentUser.name !== newData.name) changes.push('Nombre');
            if (currentUser.lastname !== newData.lastname) changes.push('Apellido');
            if (currentUser.cedula !== newData.cedula) changes.push('Cédula');
            if (currentUser.username !== newData.username) changes.push('Usuario');
            if (currentUser.email !== newData.email) changes.push('Email');
            if (currentUser.role !== newData.role) changes.push('Rol');
            if (currentUser.avatar !== newData.avatar) changes.push('Avatar');
            if (newData.password) changes.push('Contraseña');

            const session = JSON.parse(localStorage.getItem('dcti_session')) || { name: 'Sistema' };
            const nowStr = new Date().toLocaleString('es-VE');

            const updatedUser = {
                ...currentUser,
                name: newData.name,
                lastname: newData.lastname,
                cedula: newData.cedula,
                username: newData.username,
                email: newData.email,
                role: newData.role,
                avatar: newData.avatar,
                initials: (newData.name || newData.username || 'U').substring(0, 2).toUpperCase(),
                updatedAt: new Date().toISOString(),
                updatedBy: session.name || session.username || "Usuario",
                history: currentUser.history ? [...currentUser.history] : []
            };

            if (changes.length > 0) {
                updatedUser.history.unshift({
                    date: nowStr,
                    responsible: session.name || session.username || "Usuario",
                    action: "Edición",
                    fields: changes.join(', ')
                });
                updatedUser.history = updatedUser.history.slice(0, 15);
            }

            if (newData.password) {
                updatedUser.password = await hashSHA256(newData.password);
            }

            localUsers[index] = updatedUser;
            localStorage.setItem('dcti_users', JSON.stringify(localUsers));
            if (typeof AuditService !== 'undefined' && changes.length > 0) AuditService.log('Modificación', 'Usuarios', newData.email, newData.name || newData.username, 'Campos modificados: ' + changes.join(', '));
            AlertService.notify('Usuario Actualizado', 'Los datos han sido guardados.', 'success');
        } else {
            AlertService.notify('Restricción', 'Este usuario es de sistema y tiene restricciones.', 'info');
        }
    },

    async deleteUser(email) {
        if (email === 'admin@dcti.gob') {
            AlertService.notify('Acción Denegada', 'Protegido.', 'error');
            return;
        }

        const confirmed = await AlertService.confirm('¿Eliminar?', `Confirma eliminación de ${email}`, 'Eliminar', 'Cancelar', true);
        if (!confirmed) return;

        const localUsers = this.getLocalUsers();
        const updatedUsers = localUsers.filter(u => u.email !== email);

        if (localUsers.length === updatedUsers.length) {
            AlertService.notify('Restricción', 'Usuario de sistema.', 'warning');
        } else {
            localStorage.setItem('dcti_users', JSON.stringify(updatedUsers));
            if (typeof AuditService !== 'undefined') AuditService.log('Eliminación', 'Usuarios', email, email, 'Usuario eliminado del sistema');
            AlertService.notify('Eliminado', 'Usuario removido.', 'success');
            if (typeof renderModule === 'function') renderModule('users');
        }
    },

    toggleUserStatus(email) {
        if (email === 'admin@dcti.gob') return;

        const localUsers = this.getLocalUsers();
        const index = localUsers.findIndex(u => u.email === email);

        if (index !== -1) {
            const user = localUsers[index];
            user.status = user.status === 'Inactivo' ? 'Activo' : 'Inactivo';

            const session = JSON.parse(localStorage.getItem('dcti_session')) || { name: 'Sistema' };
            const nowStr = new Date().toLocaleString('es-VE');

            user.updatedAt = new Date().toISOString();
            user.updatedBy = session.name || session.username || "Usuario";
            if (!user.history) user.history = [];
            user.history.unshift({
                date: nowStr,
                responsible: session.name || session.username || "Usuario",
                action: "Cambio Estado",
                fields: user.status
            });
            user.history = user.history.slice(0, 15);

            localStorage.setItem('dcti_users', JSON.stringify(localUsers));
            if (typeof AuditService !== 'undefined') AuditService.log('Cambio de Estado', 'Usuarios', email, user.name || email, 'Estado cambiado a: ' + user.status);
            AlertService.notify('Estado Actualizado', 'Estado cambiado correctamente.', 'info');
            if (typeof renderModule === 'function') renderModule('users');
        }
    }
};

// [SECURITY] Aplicar rateLimitAction al handler de submit de usuarios (Anti-Spam)
// Se asigna en tiempo de ejecución para que window.rateLimitAction ya esté disponible.
UsersController.handleUserAdminSubmit = window.rateLimitAction
    ? window.rateLimitAction(UsersController._handleUserAdminSubmitCore.bind(UsersController), 2500)
    : UsersController._handleUserAdminSubmitCore.bind(UsersController);

// Exponer funciones globales para compatibilidad con Auth y onclick HTML
window.AUTH_CONFIG = UsersController.AUTH_CONFIG;
window.getLocalUsers = UsersController.getLocalUsers.bind(UsersController);
window.saveLocalUser = UsersController.saveLocalUser.bind(UsersController);
window.openUserModal = UsersController.openUserModal.bind(UsersController);
window.closeUserModal = UsersController.closeUserModal.bind(UsersController);
window.handleUserAdminSubmit = UsersController.handleUserAdminSubmit;
window.deleteUser = UsersController.deleteUser.bind(UsersController);
window.toggleUserStatus = UsersController.toggleUserStatus.bind(UsersController);
window.previewAvatar = UsersController.previewAvatar.bind(UsersController);

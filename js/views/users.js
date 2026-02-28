const UsersView = {
    render: (data) => {
        // Usamos la paginación si está disponible, sino el fallback de allUsers
        const paginated = data.pagination;
        const users = paginated ? paginated.items : [...data.adminUsers, ...data.localUsers];
        const primaryAdminEmail = 'admin@dcti.gob';

        return `
            <div class="view-container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <h2>Gestión de Usuarios</h2>
                        <span style="font-size: 0.85rem; background: var(--color-surface-muted); padding: 4px 12px; border-radius: 20px; color: var(--color-text-muted); font-weight: 600;">
                            Total: ${data.stats.users}
                        </span>
                    </div>
                    <button class="btn-action" onclick="openUserModal()" title="Nuevo Usuario" style="width: 45px; height: 45px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-user-plus" style="font-size: 1.1rem; margin: 0;"></i>
                    </button>
                </div>

                <div style="background: white; border-radius: var(--radius-md); border: 1px solid var(--color-border); overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: var(--color-sidebar); color: white;">
                            <tr>
                                <th style="padding: 15px; text-align: left;">Usuario</th>
                                <th style="padding: 15px; text-align: left;">Email</th>
                                <th style="padding: 15px; text-align: left;">Rol</th>
                                <th style="padding: 15px; text-align: left;">Estado</th>
                                <th style="padding: 15px; text-align: center;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(u => {
            const isPrimaryAdmin = u.email === primaryAdminEmail;
            const statusColor = u.status === 'Activo' ? '#22c55e' : '#ef4444';

            return `
                                    <tr style="border-bottom: 1px solid var(--color-border); opacity: ${u.status === 'Inactivo' ? '0.6' : '1'}">
                                        <td style="padding: 15px;">
                                            <div style="display: flex; align-items: center; gap: 10px;">
                                                <div style="width: 32px; height: 32px; background: var(--grad-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.75rem; font-weight: 700;">
                                                    ${u.initials || '??'}
                                                </div>
                                                <span style="font-weight: 600;">${u.name}</span>
                                            </div>
                                        </td>
                                        <td style="padding: 15px; color: var(--color-text-muted);">${u.email}</td>
                                        <td style="padding: 15px;">
                                            <span style="padding: 4px 10px; background: #f1f5f9; color: var(--color-primary); border-radius: 20px; font-size: 0.75rem; font-weight: 600; text-transform: capitalize;">
                                                ${u.role}
                                            </span>
                                        </td>
                                        <td style="padding: 15px;">
                                            <span style="display: flex; align-items: center; gap: 6px; font-size: 0.85rem; color: ${statusColor}">
                                                <i class="fas fa-circle" style="font-size: 0.5rem;"></i> ${u.status || 'Activo'}
                                            </span>
                                        </td>
                                        <td style="padding: 15px; text-align: center;">
                                            <div style="display: flex; justify-content: center; gap: 8px;">
                                                ${!isPrimaryAdmin ? `
                                                    <button onclick="openUserModal('${u.email}')" title="Editar" style="background: none; border: 1px solid var(--color-border); padding: 6px 10px; border-radius: 6px; cursor: pointer; color: var(--color-text-main);"><i class="fas fa-edit"></i></button>
                                                    <button onclick="toggleUserStatus('${u.email}')" 
                                                        title="${u.status === 'Pendiente' ? 'Activar Cuenta' : (u.status === 'Inactivo' ? 'Habilitar Usuario' : 'Inhabilitar Usuario')}" 
                                                        style="background: none; border: 1px solid var(--color-border); padding: 6px 10px; border-radius: 6px; cursor: pointer; color: ${u.status === 'Inactivo' ? '#94a3b8' : (u.status === 'Pendiente' ? '#22c55e' : '#22c55e')};">
                                                        <i class="fas fa-${u.status === 'Pendiente' ? 'user-check' : (u.status === 'Inactivo' ? 'toggle-off' : 'toggle-on')}"></i>
                                                    </button>
                                                    <button onclick="deleteUser('${u.email}')" title="Eliminar" style="background: none; border: 1px solid #fee2e2; padding: 6px 10px; border-radius: 6px; cursor: pointer; color: #ef4444;"><i class="fas fa-trash-alt"></i></button>
                                                ` : `<span style="font-size: 0.75rem; color: var(--color-text-muted); font-style: italic;">Sistema Protegido</span>`}
                                            </div>
                                        </td>
                                    </tr>
                                `;
        }).join('')}
                        </tbody>
                    </table>

                    <!-- Paginación Footer -->
                    ${paginated ? `
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8fafc; border-top: 1px solid var(--color-border);">
                            <span style="font-size: 0.85rem; color: var(--color-text-muted);">
                                Mostrando página ${paginated.currentPage} de ${paginated.totalPages}
                            </span>
                            <div style="display: flex; gap: 5px;">
                                <button onclick="changePage('users', ${paginated.currentPage - 1})" ${paginated.currentPage === 1 ? 'disabled' : ''} style="padding: 5px 12px; border: 1px solid var(--color-border); background: white; border-radius: 4px; cursor: ${paginated.currentPage === 1 ? 'default' : 'pointer'}; opacity: ${paginated.currentPage === 1 ? '0.5' : '1'};">
                                    <i class="fas fa-chevron-left"></i>
                                </button>
                                <button onclick="changePage('users', ${paginated.currentPage + 1})" ${paginated.currentPage === paginated.totalPages ? 'disabled' : ''} style="padding: 5px 12px; border: 1px solid var(--color-border); background: white; border-radius: 4px; cursor: ${paginated.currentPage === paginated.totalPages ? 'default' : 'pointer'}; opacity: ${paginated.currentPage === paginated.totalPages ? '0.5' : '1'};">
                                    <i class="fas fa-chevron-right"></i>
                                </button>
                            </div>
                        </div>
                    ` : ''}
                </div>

                <!-- Modal de Usuario -->
                <div id="user-modal" class="modal-overlay hidden">
                    <div class="modal-card" style="max-width: 450px;">
                        <div class="modal-header">
                            <h3 id="modal-title">Nuevo Usuario</h3>
                            <button class="close-modal" onclick="closeUserModal()">&times;</button>
                        </div>
                        <form id="user-admin-form" style="padding: var(--space-lg); display: flex; flex-direction: column; gap: 15px;">
                            <input type="hidden" id="edit-email-target">
                            <div class="form-field">
                                <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 5px;">Nombre Completo</label>
                                <input type="text" id="admin-user-name" placeholder="Ej. Pedro Pérez" required>
                            </div>
                            <div class="form-field">
                                <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 5px;">Correo Electrónico</label>
                                <input type="email" id="admin-user-email" placeholder="email@dcti.gob" required>
                            </div>
                            <div class="form-field" id="pass-field-group">
                                <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 5px;">Contraseña</label>
                                <input type="password" id="admin-user-pass" placeholder="Mínimo 8 caracteres, Mayúscula, Número y Especial">
                                <p style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: 4px; line-height: 1.2;">* 8+ caracteres, una mayúscula, un número y un carácter especial.<br>Dejar en blanco para mantener la actual si está editando.</p>
                            </div>
                            <div id="admin-user-error" class="login-error hidden" style="background: #fff1f2; border: 1px solid #fda4af; padding: 10px; border-radius: 8px; font-size: 0.8rem; color: #e11d48;"></div>
                            <div class="form-field">
                                <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 5px;">Rol Asignado</label>
                                <select id="admin-user-role" style="width: 100%; padding: 12px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.95rem;">
                                    <option value="visitante">Visitante</option>
                                    <option value="editor">Editor</option>
                                    <option value="admin">Administrador</option>
                                </select>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn-secondary" onclick="closeUserModal()">Cancelar</button>
                                <button type="submit" class="btn-primary">Guardar Usuario</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }
};

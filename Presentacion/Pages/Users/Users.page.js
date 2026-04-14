const UsersView = {
    render: (data) => {
        // Usamos la paginación si está disponible, sino el fallback de allUsers
        const paginated = data.pagination;
        const users = paginated ? paginated.items : [...data.adminUsers, ...data.localUsers];
        const systemProtectedEmails = ['admin@dcti.gob', 'editor@dcti.gob'];
        
        // Obtención de data global para estadísticas precisas reales (no solo las de la página actual)
        const adminUsers = typeof AUTH_CONFIG !== 'undefined' ? AUTH_CONFIG.hardcodedUsers : [];
        const localUsers = typeof getLocalUsers === 'function' ? getLocalUsers() : [];
        const globalAllUsers = [...adminUsers, ...localUsers];
        
        const countAdmins = globalAllUsers.filter(u => u.role === 'admin').length;
        const countEditors = globalAllUsers.filter(u => u.role === 'editor').length;
        const countActive = globalAllUsers.filter(u => (u.status || 'Activo') === 'Activo').length;
        const countInactive = globalAllUsers.filter(u => u.status === 'Inactivo').length;

        const createStatCard = (icon, number, label, textColor, bgColor) => `
            <div class="dcti-stat-card">
                <div class="dcti-stat-card-header">
                    <div class="dcti-stat-card-icon" style="background: ${bgColor}; color: ${textColor};">
                        <i class="${icon}"></i>
                    </div>
                    <span class="dcti-stat-card-number">${number}</span>
                </div>
                <hr class="dcti-stat-card-divider">
                <p class="dcti-stat-card-label">${label}</p>
            </div>
        `;

        return `
            <div class="view-container">
                <div style="display: flex; flex-direction: column; gap: var(--space-md); margin-bottom: var(--space-md);">
                    <!-- Top Row: Title, Count and Primary Action -->
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <h2>Gestión de Usuarios</h2>
                        </div>
                        <button class="btn-action" onclick="openUserModal()" title="Nuevo Usuario" style="width: 45px; height: 45px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center; background: var(--color-primary); color: white; border: none; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px rgba(100, 50, 255, 0.2);">
                            <i class="fas fa-plus" style="font-size: 1.1rem; margin: 0;"></i>
                        </button>
                    </div>
                    
                    <div style="display: flex; flex-wrap: wrap; gap: 14px; margin-top: 5px;">
                        ${createStatCard('fas fa-users', globalAllUsers.length, 'Usuarios Totales', '#3b82f6', 'rgba(59, 130, 246, 0.1)')}
                        ${createStatCard('fas fa-check-circle', countActive, 'Activos', '#10b981', 'rgba(16, 185, 129, 0.1)')}
                        ${createStatCard('fas fa-times-circle', countInactive, 'Inactivos', '#ef4444', 'rgba(239, 68, 68, 0.1)')}
                        ${createStatCard('fas fa-user-shield', countAdmins, 'Administradores', '#8b5cf6', 'rgba(139, 92, 246, 0.1)')}
                        ${createStatCard('fas fa-user-edit', countEditors, 'Editores', '#f59e0b', 'rgba(245, 158, 11, 0.1)')}
                    </div>

                    <hr style="border: none; border-top: 1px solid var(--color-border); margin: 0 0 var(--space-md) 0;">
                </div>

                <!-- Bottom Row: Filters -->
                <div style="display: flex; justify-content: flex-start; align-items: center; gap: 15px; flex-wrap: wrap; margin-bottom: var(--space-lg);">
                    <div style="position: relative; display: flex; align-items: center; background: white; border-radius: 20px; padding: 4px 14px; border: 1px solid var(--color-border); transition: all 0.2s; height: 36px; box-sizing: border-box; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                            <i class="fas fa-search" style="font-size: 0.8rem; color: var(--color-text-muted); margin-right: 8px;"></i>
                            <input type="text" id="filter-user-name" placeholder="Buscar Usuario..." oninput="window.lastFocusedInput = this.id; window.globalUserColName = this.value; if(typeof changePage === 'function'){changePage('users', 1)} else {renderModule('users')}" value="${window.globalUserColName || ''}" style="background: transparent; border: none; color: var(--color-text-main); width: 130px; font-size: 0.85rem; outline: none; font-weight: 500;">
                        </div>
                        <div style="position: relative; display: flex; align-items: center; background: white; border-radius: 20px; padding: 4px 14px; border: 1px solid var(--color-border); transition: all 0.2s; height: 36px; box-sizing: border-box; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                            <i class="fas fa-envelope" style="font-size: 0.8rem; color: var(--color-text-muted); margin-right: 8px;"></i>
                            <input type="text" id="filter-user-email" placeholder="Buscar Email..." oninput="window.lastFocusedInput = this.id; window.globalUserColEmail = this.value; if(typeof changePage === 'function'){changePage('users', 1)} else {renderModule('users')}" value="${window.globalUserColEmail || ''}" style="background: transparent; border: none; color: var(--color-text-main); width: 130px; font-size: 0.85rem; outline: none; font-weight: 500;">
                        </div>
                        <select onchange="window.globalUserRoleFilter = this.value; if(typeof changePage === 'function'){changePage('users', 1)} else {renderModule('users')}" style="padding: 0 32px 0 16px; height: 36px; border: 1px solid var(--color-border); border-radius: 20px; font-size: 0.85rem; background: white url('data:image/svg+xml;utf8,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;12&quot; height=&quot;12&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;%236b7280&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot;><polyline points=&quot;6 9 12 15 18 9&quot;></polyline></svg>') no-repeat right 12px center; cursor: pointer; box-sizing: border-box; appearance: none; -webkit-appearance: none; color: var(--color-text-main); font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.2s ease;">
                            <option value="Todos" ${window.globalUserRoleFilter === 'Todos' || !window.globalUserRoleFilter ? 'selected' : ''}>Todos los Roles</option>
                            <option value="admin" ${window.globalUserRoleFilter === 'admin' ? 'selected' : ''}>Administradores</option>
                            <option value="editor" ${window.globalUserRoleFilter === 'editor' ? 'selected' : ''}>Editores</option>
                            <option value="visitante" ${window.globalUserRoleFilter === 'visitante' ? 'selected' : ''}>Visitantes</option>
                        </select>
                        <select onchange="window.globalUserStatusFilter = this.value; if(typeof changePage === 'function'){changePage('users', 1)} else {renderModule('users')}" style="padding: 0 32px 0 16px; height: 36px; border: 1px solid var(--color-border); border-radius: 20px; font-size: 0.85rem; background: white url('data:image/svg+xml;utf8,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;12&quot; height=&quot;12&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;%236b7280&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot;><polyline points=&quot;6 9 12 15 18 9&quot;></polyline></svg>') no-repeat right 12px center; cursor: pointer; box-sizing: border-box; appearance: none; -webkit-appearance: none; color: var(--color-text-main); font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.2s ease;">
                            <option value="Todos" ${window.globalUserStatusFilter === 'Todos' || !window.globalUserStatusFilter ? 'selected' : ''}>Todos los Estados</option>
                            <option value="Activo" ${window.globalUserStatusFilter === 'Activo' ? 'selected' : ''}>Activos</option>
                            <option value="Inactivo" ${window.globalUserStatusFilter === 'Inactivo' ? 'selected' : ''}>Inactivos</option>
                        </select>
                </div>

                <div style="background: white; border-radius: var(--radius-md); border: 1px solid var(--color-border); overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <table style="width: 100%; border-collapse: collapse;">
                        <thead style="background: var(--color-sidebar); color: white;">
                            <tr>
                                <th style="padding: 15px; text-align: left;">Usuario</th>
                                <th style="padding: 15px; text-align: left;">Email</th>
                                <th style="padding: 15px; text-align: left;">Rol</th>
                                <th style="padding: 15px; text-align: left;">Estado</th>
                                <th style="padding: 15px; text-align: left;">Última Act.</th>
                                <th style="padding: 15px; text-align: center;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(u => {
            const isSystemProtected = systemProtectedEmails.includes(u.email);
            const statusColor = u.status === 'Activo' ? '#22c55e' : '#ef4444';

            return `
                                    <tr style="border-bottom: 1px solid var(--color-border); opacity: ${u.status === 'Inactivo' ? '0.6' : '1'}">
                                        <td style="padding: 15px;">
                                            <div style="display: flex; align-items: center; gap: 10px;">
                                                <div style="width: 32px; height: 32px; background: var(--grad-primary); border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 0.75rem; font-weight: 700;">
                                                    ${u.initials || '??'}
                                                </div>
                                                <span style="font-weight: 600;">${u.username || u.name || 'Sin Usuario'}</span>
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
                                        <td style="padding: 15px; font-size: 0.75rem;">
                                            <div style="color:var(--color-text-main); font-weight: 500;">${u.updatedAt ? new Date(u.updatedAt).toLocaleDateString('es-VE') : '-'}</div>
                                            <div style="color:var(--color-text-muted); font-style: italic;">por ${u.updatedBy || 'Sistema'}</div>
                                        </td>
                                        <td style="padding: 15px; text-align: center;">
                                            <div style="display: flex; justify-content: center; gap: 8px;">
                                                ${!isSystemProtected ? `
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
                <div id="user-modal" class="modal-overlay hidden" onclick="if(event.target === this) closeUserModal()">
                    <div class="modal-card" style="max-width: 600px; padding: 0; display: flex; flex-direction: row; overflow: hidden; position: relative;">
                        <!-- Barra vertical izquierda -->
                        <div style="width: 40px; background: var(--grad-primary); flex-shrink: 0;"></div>
                        
                        <div style="flex: 1; padding: 30px 40px 30px 30px; position: relative;">
                            <button class="close-modal" onclick="closeUserModal()" style="position: absolute; right: 15px; top: 15px; background: transparent; border: none; font-size: 1.5rem; cursor: pointer; color: var(--color-text-muted);">&times;</button>
                            
                            <form id="user-admin-form" onsubmit="handleUserAdminSubmit(event)" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                <input type="hidden" id="edit-email-target">
                                
                                <!-- Izquierda Arriba: Imagen y botón "+" -->
                                <div style="grid-column: 1; grid-row: 1; display: flex; justify-content: flex-start;">
                                    <div style="background: #e2e8f0; border-radius: 4px; width: 130px; height: 160px; position: relative; overflow: visible;">
                                        <img id="admin-user-avatar-preview" src="" style="width: 100%; height: 100%; object-fit: cover; border-radius: 4px; display: none;">
                                        <input type="file" id="admin-user-avatar-input" accept="image/*" style="display: none;" onchange="previewAvatar(event)">
                                        <button type="button" onclick="document.getElementById('admin-user-avatar-input').click()" style="position: absolute; bottom: -12px; right: -12px; background: #2563eb; color: white; border: none; border-radius: 50%; width: 28px; height: 28px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1rem; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                                            <i class="fas fa-plus"></i>
                                        </button>
                                    </div>
                                </div>

                                <!-- Izquierda Abajo: Nombre, Apellido, Cedula -->
                                <div style="grid-column: 1; grid-row: 2; display: flex; flex-direction: column; gap: 12px; margin-top: 10px;">
                                    <div class="form-field">
                                        <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 5px;">Nombre</label>
                                        <input type="text" id="admin-user-name" required style="width: 100%; padding: 8px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md);">
                                    </div>
                                    <div class="form-field">
                                        <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 5px;">Apellido</label>
                                        <input type="text" id="admin-user-lastname" style="width: 100%; padding: 8px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md);">
                                    </div>
                                    <div class="form-field">
                                        <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 5px;">Cedula</label>
                                        <input type="text" id="admin-user-cedula" pattern="[0-9]*" oninput="this.value = this.value.replace(/[^0-9]/g, '')" style="width: 100%; padding: 8px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md);">
                                    </div>
                                </div>

                                <!-- Derecha Arriba: Correo, Usuario, Contraseña -->
                                <div style="grid-column: 2; grid-row: 1; display: flex; flex-direction: column; gap: 12px;">
                                    <div class="form-field">
                                        <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 5px;">Correo</label>
                                        <input type="email" id="admin-user-email" required style="width: 100%; padding: 8px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md);">
                                    </div>
                                    <div class="form-field">
                                        <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 5px;">Usuario</label>
                                        <input type="text" id="admin-user-username" required style="width: 100%; padding: 8px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md);">
                                    </div>
                                    <div class="form-field" id="pass-field-group">
                                        <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 5px;">Contraseña</label>
                                        <input type="password" id="admin-user-pass" placeholder="Ingresa para cambiar (vacío = mantener actual)" style="width: 100%; padding: 8px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.8rem;">
                                    </div>
                                </div>

                                <!-- Derecha Abajo: Rol de Usuario, Botón -->
                                <div style="grid-column: 2; grid-row: 2; display: flex; flex-direction: column; justify-content: space-between; margin-top: 10px;">
                                    <div class="form-field">
                                        <label style="display: block; font-size: 0.85rem; font-weight: 600; margin-bottom: 10px;">Rol de Usuario</label>
                                        <div style="display: flex; flex-direction: column; gap: 6px; margin-left: 10px;">
                                            <label style="display: flex; align-items: center; justify-content: flex-start; gap: 8px; font-size: 0.85rem; font-weight: 500; cursor: pointer; margin: 0; padding: 0;">
                                                <input type="radio" name="admin-user-role-radio" value="admin" style="margin: 0; padding: 0; width: auto; outline: none; box-shadow: none; accent-color: #2563eb;" onchange="document.getElementById('admin-user-role').value = this.value">
                                                <span style="margin: 0; text-align: left; line-height: 1.2;">Administrador</span>
                                            </label>
                                            <label style="display: flex; align-items: center; justify-content: flex-start; gap: 8px; font-size: 0.85rem; font-weight: 500; cursor: pointer; margin: 0; padding: 0;">
                                                <input type="radio" name="admin-user-role-radio" value="editor" style="margin: 0; padding: 0; width: auto; outline: none; box-shadow: none; accent-color: #2563eb;" onchange="document.getElementById('admin-user-role').value = this.value">
                                                <span style="margin: 0; text-align: left; line-height: 1.2;">Editor</span>
                                            </label>
                                            <label style="display: flex; align-items: center; justify-content: flex-start; gap: 8px; font-size: 0.85rem; font-weight: 500; cursor: pointer; margin: 0; padding: 0;">
                                                <input type="radio" name="admin-user-role-radio" value="visitante" checked style="margin: 0; padding: 0; width: auto; outline: none; box-shadow: none; accent-color: #2563eb;" onchange="document.getElementById('admin-user-role').value = this.value">
                                                <span style="margin: 0; text-align: left; line-height: 1.2;">Visitante</span>
                                            </label>
                                        </div>
                                        <select id="admin-user-role" style="display: none;">
                                            <option value="visitante" selected>Visitante</option>
                                            <option value="editor">Editor</option>
                                            <option value="admin">Administrador</option>
                                        </select>
                                    </div>
                                    
                                    <!-- Auditoría Section -->
                                    <div id="user-audit-container" style="padding-top: 15px; border-top: 1px dashed var(--color-border); margin: 5px 0 10px 10px; display: none;"></div>

                                    <div id="admin-user-error" class="login-error hidden" style="background: #fff1f2; border: 1px solid #fda4af; padding: 10px; border-radius: 8px; font-size: 0.8rem; color: #e11d48; margin-bottom: 10px; margin-left: 10px;"></div>

                                    <div style="display: flex; justify-content: flex-start; margin-left: 10px; margin-top: auto;">
                                        <button type="submit" title="Registrar" class="btn-save-circle"><i class="fas fa-save"></i></button>
                                        <button type="button" class="btn-secondary" onclick="closeUserModal()" style="display: none;">Cancelar</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

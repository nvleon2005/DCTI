/**
 * ADMIN DASHBOARD - USERS LOGIC (Local-First v10.0.0)
 * Responsabilidad: Gestión de Datos de Usuarios (CRUD), Persistencia y Modales de Administración.
 */

const AUTH_CONFIG = {
    hardcodedUsers: [
        { email: 'admin@dcti.gob', password: '123', name: 'Administrador', role: 'admin', initials: 'AD', status: 'Activo' },
        { email: 'editor@dcti.gob', password: '123', name: 'Editor de Contenidos', role: 'editor', initials: 'EC', status: 'Activo' }
    ]
};

// --- GESTIÓN DE LOCALSTORAGE (Compartida) ---

function getLocalUsers() {
    const users = localStorage.getItem('dcti_users');
    return users ? JSON.parse(users) : [];
}

function saveLocalUser(user) {
    const users = getLocalUsers();
    users.push(user);
    localStorage.setItem('dcti_users', JSON.stringify(users));
}

// --- LÓGICA DE ADMINISTRACIÓN DE USUARIOS (CRUD) ---

function openUserModal(email = null) {
    const modal = document.getElementById('user-modal');
    const form = document.getElementById('user-admin-form');
    const title = document.getElementById('modal-title');
    const editEmailInput = document.getElementById('edit-email-target');

    if (!modal) return;

    modal.classList.remove('hidden');
    form.reset();

    if (email) {
        title.textContent = 'Editar Usuario';
        editEmailInput.value = email;

        const allUsers = [...AUTH_CONFIG.hardcodedUsers, ...getLocalUsers()];
        const user = allUsers.find(u => u.email === email);

        if (user) {
            document.getElementById('admin-user-name').value = user.name;
            document.getElementById('admin-user-email').value = user.email;
            document.getElementById('admin-user-role').value = user.role;
            const isHardcoded = AUTH_CONFIG.hardcodedUsers.some(u => u.email === email);
            document.getElementById('admin-user-email').disabled = isHardcoded;
        }
    } else {
        title.textContent = 'Nuevo Usuario';
        editEmailInput.value = '';
        document.getElementById('admin-user-email').disabled = false;
    }

    // Reset error div
    const errorDiv = document.getElementById('admin-user-error');
    if (errorDiv) errorDiv.classList.add('hidden');
}

function closeUserModal() {
    const modal = document.getElementById('user-modal');
    if (modal) modal.classList.add('hidden');
}

async function handleUserAdminSubmit(e) {
    e.preventDefault();
    const errorDiv = document.getElementById('admin-user-error');
    if (errorDiv) errorDiv.classList.add('hidden');

    const editEmail = document.getElementById('edit-email-target').value;
    const name = document.getElementById('admin-user-name').value;
    const email = document.getElementById('admin-user-email').value;
    const pass = document.getElementById('admin-user-pass').value;
    const role = document.getElementById('admin-user-role').value;

    // 1. Validar formato de email
    if (typeof validateEmailFormat === 'function' && !validateEmailFormat(email)) {
        if (errorDiv) {
            errorDiv.textContent = 'Formato de correo electrónico no válido.';
            errorDiv.classList.remove('hidden');
        }
        return;
    }

    // 2. Validar complejidad de contraseña (solo si se ingresa una nueva)
    if (pass && typeof validatePasswordComplexity === 'function' && !validatePasswordComplexity(pass)) {
        if (errorDiv) {
            errorDiv.textContent = 'La contraseña debe tener 8+ caracteres, mayúscula, número y carácter especial.';
            errorDiv.classList.remove('hidden');
        }
        return;
    }

    if (editEmail) {
        // ACTUALIZAR
        await updateUser(editEmail, { name, email, role, password: pass });
    } else {
        // AGREGAR
        if (!pass) {
            if (errorDiv) {
                errorDiv.textContent = 'La contraseña es obligatoria para nuevos usuarios.';
                errorDiv.classList.remove('hidden');
            }
            return;
        }

        const allUsers = [...AUTH_CONFIG.hardcodedUsers, ...getLocalUsers()];
        if (allUsers.some(u => u.email === email)) {
            if (errorDiv) {
                errorDiv.textContent = 'Error: Este correo ya pertenece a un usuario.';
                errorDiv.classList.remove('hidden');
            }
            return;
        }

        // Hashing de contraseña para cumplimiento de HU-001
        const passwordHash = await hashSHA256(pass);

        const newUser = {
            name,
            email,
            password: passwordHash,
            role,
            status: 'Activo', // El admin crea usuarios activos por defecto
            initials: name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        };
        saveLocalUser(newUser);
    }

    closeUserModal();
    if (typeof renderModule === 'function') renderModule('users');
}

async function updateUser(oldEmail, newData) {
    if (oldEmail === 'admin@dcti.gob') {
        AlertService.notify('Acción Denegada', 'El administrador principal no puede ser modificado.', 'error');
        return;
    }

    const localUsers = getLocalUsers();
    const index = localUsers.findIndex(u => u.email === oldEmail);

    if (index !== -1) {
        const updatedUser = {
            ...localUsers[index],
            name: newData.name,
            email: newData.email,
            role: newData.role,
            initials: newData.name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
        };

        // Si hay nueva contraseña, hay que hashearla
        if (newData.password) {
            updatedUser.password = await hashSHA256(newData.password);
        }

        localUsers[index] = updatedUser;
        localStorage.setItem('dcti_users', JSON.stringify(localUsers));
        AlertService.notify('Usuario Actualizado', `Los datos de ${newData.email} han sido guardados.`, 'success');
    } else {
        AlertService.notify('Información', 'Este usuario es de sistema y tiene restricciones de edición.', 'info');
    }
}

async function deleteUser(email) {
    if (email === 'admin@dcti.gob') {
        AlertService.notify('Acción Denegada', 'El administrador principal no puede ser eliminado.', 'error');
        return;
    }

    const confirmed = await AlertService.confirm(
        '¿Eliminar Usuario?',
        `Estás a punto de eliminar permanentemente el acceso de ${email}. ¿Deseas continuar?`,
        'Eliminar',
        'Cancelar',
        true
    );

    if (!confirmed) return;

    const localUsers = getLocalUsers();
    const updatedUsers = localUsers.filter(u => u.email !== email);

    if (localUsers.length === updatedUsers.length) {
        AlertService.notify('Restricción', 'Este usuario es de sistema y no puede ser eliminado.', 'warning');
    } else {
        localStorage.setItem('dcti_users', JSON.stringify(updatedUsers));
        AlertService.notify('Usuario Eliminado', 'La cuenta ha sido removida satisfactoriamente.', 'success');
        if (typeof renderModule === 'function') renderModule('users');
    }
}

function toggleUserStatus(email) {
    if (email === 'admin@dcti.gob') {
        AlertService.notify('Acción Denegada', 'El administrador principal no puede ser inhabilitado.', 'error');
        return;
    }

    const localUsers = getLocalUsers();
    const index = localUsers.findIndex(u => u.email === email);

    if (index !== -1) {
        const user = localUsers[index];
        // Flujo de activación HU-001: Si está pendiente, se activa. Si está activo, se inhabilita.
        if (user.status === 'Pendiente') {
            user.status = 'Activo';
            AlertService.notify('Usuario Activado', `La cuenta ${user.email} ahora está activa.`, 'success');
        } else {
            user.status = user.status === 'Inactivo' ? 'Activo' : 'Inactivo';
            const msg = user.status === 'Activo' ? 'habilitada' : 'inhabilitada';
            AlertService.notify('Estado Actualizado', `La cuenta ha sido ${msg} correctamente.`, 'info');
        }

        localStorage.setItem('dcti_users', JSON.stringify(localUsers));
        if (typeof renderModule === 'function') renderModule('users');
    } else {
        AlertService.notify('Restricción', 'Este usuario es de sistema y no puede ser inhabilitado.', 'warning');
    }
}

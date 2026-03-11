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

function previewAvatar(event) {
    const file = event.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            alert('Error: Solo se permiten subir imágenes.');
            event.target.value = ''; // Limpiar el input
            document.getElementById('admin-user-avatar-preview').style.display = 'none';
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            // Comprimir la imagen usando un canvas local temporal para no saturar el localStorage
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
                preview.src = dataUrl;
                preview.style.display = 'block';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

function openUserModal(email = null) {
    const modal = document.getElementById('user-modal');
    const form = document.getElementById('user-admin-form');
    const title = document.getElementById('modal-title');
    const editEmailInput = document.getElementById('edit-email-target');

    if (!modal) return;

    modal.classList.remove('hidden');
    form.reset();

    if (email) {
        if (title) title.textContent = 'Editar Usuario';
        editEmailInput.value = email;

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Actualizar';

        const allUsers = [...AUTH_CONFIG.hardcodedUsers, ...getLocalUsers()];
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

            // Sincronizar radio buttons
            const radios = document.getElementsByName('admin-user-role-radio');
            for (let radio of radios) {
                if (radio.value === user.role) radio.checked = true;
            }

            const avatarPreview = document.getElementById('admin-user-avatar-preview');
            if (user.avatar) {
                avatarPreview.src = user.avatar;
                avatarPreview.style.display = 'block';
            } else {
                avatarPreview.src = '';
                avatarPreview.style.display = 'none';
            }

            const isHardcoded = AUTH_CONFIG.hardcodedUsers.some(u => u.email === email);
            document.getElementById('admin-user-email').disabled = isHardcoded;
        }
    } else {
        if (title) title.textContent = 'Nuevo Usuario';
        editEmailInput.value = '';
        document.getElementById('admin-user-email').disabled = false;

        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = 'Registrar';

        // Limpiar previo de avatar y radios
        document.getElementById('admin-user-avatar-preview').src = '';
        document.getElementById('admin-user-avatar-preview').style.display = 'none';

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
    const lastname = document.getElementById('admin-user-lastname').value;
    const cedula = document.getElementById('admin-user-cedula').value;
    const username = document.getElementById('admin-user-username').value;
    const email = document.getElementById('admin-user-email').value;
    const pass = document.getElementById('admin-user-pass').value;
    const role = document.getElementById('admin-user-role').value;
    const avatarPreview = document.getElementById('admin-user-avatar-preview');
    const avatar = avatarPreview.style.display === 'block' ? avatarPreview.src : null;

    // 1. Validar formato de email
    if (typeof validateEmailFormat === 'function' && !validateEmailFormat(email)) {
        AlertService.notify('Validación Fallida', 'Formato de correo electrónico no válido.', 'error');
        return;
    }

    // 2. Validar complejidad de contraseña (solo si se ingresa una nueva)
    if (pass && typeof validatePasswordComplexity === 'function' && !validatePasswordComplexity(pass)) {
        AlertService.notify('Contraseña Insegura', 'La contraseña debe tener 8+ caracteres, mayúscula, número y carácter especial.', 'error');
        return;
    }

    const allUsers = [...AUTH_CONFIG.hardcodedUsers, ...getLocalUsers()];

    // 3. Validar que el nombre de usuario sea único
    if (username) {
        const existingUsername = allUsers.find(u => u.username && u.username.toLowerCase() === username.toLowerCase());
        if (existingUsername && existingUsername.email !== editEmail) {
            AlertService.notify('Usuario No Disponible', 'Este nombre de usuario ya está en uso por otra persona.', 'error');
            return;
        }
    }

    if (editEmail) {
        // ACTUALIZAR
        await updateUser(editEmail, { name, lastname, cedula, username, email, role, password: pass, avatar });
    } else {
        // AGREGAR
        if (!pass) {
            AlertService.notify('Campo Requerido', 'La contraseña es obligatoria para registrar nuevos usuarios.', 'warning');
            return;
        }

        const allUsers = [...AUTH_CONFIG.hardcodedUsers, ...getLocalUsers()];
        if (allUsers.some(u => u.email === email)) {
            AlertService.notify('Correo Duplicado', 'Error: Este correo ya pertenece a un usuario.', 'error');
            return;
        }

        // Hashing de contraseña para cumplimiento de HU-001
        const passwordHash = await hashSHA256(pass);

        const nameSafe = name || username || 'Usuario';
        const newUser = {
            name,
            lastname,
            cedula,
            username,
            email,
            password: passwordHash,
            role,
            avatar,
            status: 'Activo', // El admin crea usuarios activos por defecto
            initials: nameSafe.substring(0, 2).toUpperCase()
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
        const currentUser = localUsers[index];

        // Regla de negocio: Prevenir degradar de rol al último administrador
        if (currentUser.role === 'admin' && newData.role !== 'admin') {
            const allUsers = [...AUTH_CONFIG.hardcodedUsers, ...localUsers];
            const remainingAdmins = allUsers.filter(u => u.role === 'admin' && u.status === 'Activo' && u.email !== oldEmail);
            if (remainingAdmins.length === 0) {
                AlertService.notify('Acción Denegada', 'Debe existir al menos un administrador en el sistema. No puede degradarse a sí mismo si es el único.', 'error');
                return;
            }
        }

        const updatedUser = {
            ...currentUser,
            name: newData.name,
            lastname: newData.lastname,
            cedula: newData.cedula,
            username: newData.username,
            email: newData.email,
            role: newData.role,
            avatar: newData.avatar,
            initials: (newData.name || newData.username || 'U').substring(0, 2).toUpperCase()
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

    const allUsers = [...AUTH_CONFIG.hardcodedUsers, ...getLocalUsers()];

    // Identificar rol del usuario a eliminar
    const targetUser = allUsers.find(u => u.email === email);

    // Regla de negocio: Si el usuario es administrador, asegurarse de que quede otro activo.
    if (targetUser && targetUser.role === 'admin') {
        const remainingAdmins = allUsers.filter(u => u.role === 'admin' && u.status === 'Activo' && u.email !== email);
        if (remainingAdmins.length === 0) {
            AlertService.notify('Acción Denegada', 'Debe existir al menos un administrador activo en el sistema.', 'error');
            return;
        }
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
            // Regla de Negocio: No inhabilitar al último administrador
            if (user.status === 'Activo' && user.role === 'admin') {
                const allUsers = [...AUTH_CONFIG.hardcodedUsers, ...localUsers];
                const remainingAdmins = allUsers.filter(u => u.role === 'admin' && u.status === 'Activo' && u.email !== email);
                if (remainingAdmins.length === 0) {
                    AlertService.notify('Acción Denegada', 'Debe existir al menos un administrador activo en el sistema.', 'error');
                    return;
                }
            }

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

// --- LÓGICA DE PERFIL (Para todos los roles) ---

function previewProfileAvatar(event) {
    const file = event.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            AlertService.notify('Error', 'Solo se permiten subir imágenes.', 'error');
            event.target.value = '';
            document.getElementById('profile-avatar-preview').style.display = 'none';
            const placeholder = document.getElementById('profile-avatar-placeholder');
            if (placeholder) placeholder.style.display = 'block';
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
                let preview = document.getElementById('profile-avatar-preview');

                // Si el preview original es un DIV (las iniciales), lo reemplazamos por una IMG
                if (preview.tagName.toLowerCase() !== 'img') {
                    const newImg = document.createElement('img');
                    newImg.id = 'profile-avatar-preview';
                    newImg.className = 'premium-avatar-img';
                    preview.parentNode.replaceChild(newImg, preview);
                    preview = newImg;
                }

                preview.src = dataUrl;
                preview.style.display = 'block';
                const placeholder = document.getElementById('profile-avatar-placeholder');
                if (placeholder) placeholder.style.display = 'none';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

async function handleProfileSubmit(e) {
    e.preventDefault();

    const sessionStr = localStorage.getItem('dcti_session');
    if (!sessionStr) return;

    const session = JSON.parse(sessionStr);

    if (session.email === 'admin@dcti.gob' || session.email === 'editor@dcti.gob') {
        AlertService.notify('Acción Denegada', 'Los usuarios del sistema no pueden modificar su perfil desde aquí.', 'error');
        return;
    }

    const name = document.getElementById('profile-name').value;
    const lastname = document.getElementById('profile-lastname').value;
    const cedula = document.getElementById('profile-cedula').value;
    const username = document.getElementById('profile-username').value;
    const pass = document.getElementById('profile-pass').value;
    const avatarPreview = document.getElementById('profile-avatar-preview');
    // Si el tag es IMG, guardamos su source, sino asume que no hay foto
    const avatar = (avatarPreview && avatarPreview.tagName.toLowerCase() === 'img') ? avatarPreview.src : null;

    if (pass && typeof validatePasswordComplexity === 'function' && !validatePasswordComplexity(pass)) {
        AlertService.notify('Contraseña Insegura', 'La contraseña debe tener 8+ caracteres, mayúscula, número y carácter especial.', 'error');
        return;
    }

    const localUsers = getLocalUsers();

    if (username) {
        const existingUsername = localUsers.find(u => u.username && u.username.toLowerCase() === username.toLowerCase() && u.email !== session.email);
        if (existingUsername) {
            AlertService.notify('Usuario No Disponible', 'Este nombre de usuario ya está en uso por otra persona.', 'error');
            return;
        }
    }

    const index = localUsers.findIndex(u => u.email === session.email);
    if (index !== -1) {
        const currentUser = localUsers[index];
        const initials = (name || username || 'U').substring(0, 2).toUpperCase();

        const updatedUser = {
            ...currentUser,
            name,
            lastname,
            cedula,
            username,
            avatar,
            initials
        };

        if (pass && typeof hashSHA256 === 'function') {
            updatedUser.password = await hashSHA256(pass);
        }

        localUsers[index] = updatedUser;
        localStorage.setItem('dcti_users', JSON.stringify(localUsers));

        const updatedSession = { ...session, name, username, avatar, initials };
        localStorage.setItem('dcti_session', JSON.stringify(updatedSession));

        AlertService.notify('Perfil Actualizado', 'Tus datos han sido guardados correctamente.', 'success');

        if (typeof DASHBOARD_UI !== 'undefined') {
            if (avatar) {
                DASHBOARD_UI.userInitials.textContent = '';
                DASHBOARD_UI.userInitials.style.backgroundImage = `url(${avatar})`;
                DASHBOARD_UI.userInitials.style.backgroundSize = 'cover';
                DASHBOARD_UI.userInitials.style.backgroundPosition = 'center';
                DASHBOARD_UI.userInitials.style.border = '2px solid rgba(255,255,255,0.2)';
            } else {
                DASHBOARD_UI.userInitials.textContent = initials;
                DASHBOARD_UI.userInitials.style.backgroundImage = 'none';
                DASHBOARD_UI.userInitials.style.border = 'none';
            }
            DASHBOARD_UI.userName.textContent = name || username || 'Usuario';
        }

        if (typeof renderModule === 'function') renderModule('profile');
    }
}

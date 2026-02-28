/**
 * ADMIN DASHBOARD - PROJECTS LOGIC (Local-First v1.0.0)
 * Responsabilidad: Gestión de Proyectos (Iniciativas Estratégicas), Auditoría Detallada y Validación.
 */

// --- GESTIÓN DE LOCALSTORAGE ---

function getLocalProjects() {
    const projects = localStorage.getItem('dcti_projects');
    if (!projects && typeof MOCK_DATA !== 'undefined') {
        return MOCK_DATA.projects.map(p => ({
            ...p,
            description: p.description || '',
            objectives: p.objectives || '',
            status: p.status || 'En Proceso',
            progress: p.progress || 0,
            featured: p.featured || false,
            image: p.image || 'img/proyectos.png',
            history: [] // Historial de auditoría
        }));
    }
    return projects ? JSON.parse(projects) : [];
}

function saveLocalProjects(projectsArray) {
    localStorage.setItem('dcti_projects', JSON.stringify(projectsArray));
    // Actualizar stats globales
    if (typeof MOCK_DATA !== 'undefined') {
        MOCK_DATA.stats.projects = projectsArray.length;
    }
}

// --- UTILIDADES DE UI ---

function updateFeaturedState() {
    const statusSelect = document.getElementById('admin-project-status');
    const featuredCheckbox = document.getElementById('admin-project-featured');
    const featuredHint = document.getElementById('featured-hint');

    if (!statusSelect || !featuredCheckbox) return;

    if (statusSelect.value !== 'Validado') {
        featuredCheckbox.checked = false;
        featuredCheckbox.disabled = true;
        if (featuredHint) featuredHint.style.display = 'block';
    } else {
        featuredCheckbox.disabled = false;
        if (featuredHint) featuredHint.style.display = 'none';
    }
}

// --- LÓGICA DE MODAL ---

function openProjectModal(id = null) {
    // Verificar permisos (Solo Administrador)
    const session = JSON.parse(localStorage.getItem('dcti_session'));
    if (!session || session.role !== 'admin') {
        AlertService.notify('Acceso Denegado', 'Solo el Administrador puede gestionar proyectos.', 'error');
        return;
    }

    const modal = document.getElementById('project-modal');
    const form = document.getElementById('project-admin-form');
    const title = document.getElementById('project-modal-title');
    const editIdInput = document.getElementById('edit-project-id');

    if (!modal) return;

    modal.classList.remove('hidden');
    form.reset();
    document.getElementById('admin-project-preview').style.backgroundImage = 'none';

    if (id) {
        title.textContent = 'Editar Proyecto';
        editIdInput.value = id;

        const allProjects = getLocalProjects();
        const project = allProjects.find(p => p.id == id);

        if (project) {
            document.getElementById('admin-project-title').value = project.title || '';
            document.getElementById('admin-project-description').value = project.description || '';
            document.getElementById('admin-project-objectives').value = project.objectives || '';
            document.getElementById('admin-project-status').value = project.status || 'En Proceso';
            document.getElementById('admin-project-progress').value = project.progress || 0;
            document.getElementById('admin-project-featured').checked = project.featured || false;
            document.getElementById('admin-project-media').value = project.image || '';

            if (project.image) {
                const preview = document.getElementById('admin-project-preview');
                preview.style.backgroundImage = `url(${project.image})`;
                preview.style.backgroundSize = 'cover';
                preview.style.backgroundPosition = 'center';
            }
        }
    } else {
        title.textContent = 'Nuevo Proyecto';
        editIdInput.value = '';
    }

    // Inicializar estado del checkbox destacado
    updateFeaturedState();
}

function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    if (modal) modal.classList.add('hidden');
}

// --- LISTENERS ---

document.addEventListener('change', async (e) => {
    if (e.target && e.target.id === 'admin-project-file') {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const base64 = reader.result;
            document.getElementById('admin-project-media').value = base64;
            const preview = document.getElementById('admin-project-preview');
            preview.style.backgroundImage = `url(${base64})`;
            preview.style.backgroundSize = 'cover';
            preview.style.backgroundPosition = 'center';
        };
    }

    if (e.target && e.target.id === 'admin-project-status') {
        updateFeaturedState();
    }
});

async function handleProjectSubmit(e) {
    e.preventDefault();

    const editId = document.getElementById('edit-project-id').value;
    const title = document.getElementById('admin-project-title').value.trim();
    const description = document.getElementById('admin-project-description').value.trim();
    const objectives = document.getElementById('admin-project-objectives').value.trim();
    const status = document.getElementById('admin-project-status').value;
    const progress = document.getElementById('admin-project-progress').value;
    const featured = document.getElementById('admin-project-featured').checked;
    const image = document.getElementById('admin-project-media').value;

    // 1. VALIDACIÓN DE OBLIGATORIEDAD
    if (!title || !description || !objectives || !status) {
        AlertService.notify('Campos Vacíos', 'Nombre, Descripción, Objetivos y Estado son obligatorios.', 'warning');
        return;
    }

    // CU-001: Validación de estado "Validado" para ser destacado
    if (featured && status !== 'Validado') {
        AlertService.notify('Validación Requerida', 'El proyecto debe estar "Validado" para ser destacado.', 'warning');
        return;
    }

    let allProjects = getLocalProjects();
    const session = JSON.parse(localStorage.getItem('dcti_session')) || { name: 'Admin' };
    const now = new Date().toLocaleString();

    if (editId) {
        // ACTUALIZAR (HU004)
        const index = allProjects.findIndex(p => p.id == editId);
        if (index !== -1) {
            const old = allProjects[index];
            const changes = [];

            // Detectar cambios para el LOG (Art. 17)
            if (old.title !== title) changes.push('Título');
            if (old.description !== description) changes.push('Descripción');
            if (old.objectives !== objectives) changes.push('Objetivos');
            if (old.status !== status) changes.push('Estado');
            if (old.progress != progress) changes.push('Progreso');
            if (old.featured !== featured) changes.push('Destacado');
            if (old.image !== image && image !== '') changes.push('Imagen');

            if (changes.length > 0) {
                const logEntry = {
                    date: now,
                    responsible: session.name,
                    fields: changes.join(', ')
                };

                allProjects[index] = {
                    ...old,
                    title,
                    description,
                    objectives,
                    status,
                    progress: parseInt(progress),
                    featured,
                    image: image || old.image,
                    history: [logEntry, ...(old.history || [])].slice(0, 10) // Mantener últimos 10
                };
                AlertService.notify('Éxito', 'Proyecto actualizado y cambios registrados.', 'success');
            } else {
                AlertService.notify('Sin cambios', 'No se detectaron modificaciones.', 'info');
                closeProjectModal();
                return;
            }
        }
    } else {
        // CREAR (HU001)
        const newId = allProjects.length > 0 ? Math.max(...allProjects.map(p => p.id)) + 1 : 1;
        const newProject = {
            id: newId,
            title,
            description,
            objectives,
            status,
            progress: parseInt(progress),
            featured,
            image: image || 'img/proyectos.png',
            history: [{ date: now, responsible: session.name, fields: 'Creación inicial' }]
        };
        allProjects.push(newProject);
        AlertService.notify('Éxito', 'Nuevo proyecto registrado satisfactoriamente.', 'success');
    }

    saveLocalProjects(allProjects);
    closeProjectModal();

    if (typeof renderModule === 'function') {
        renderModule('projects');
    }
}

async function deleteProject(id) {
    const confirmed = await AlertService.confirm(
        'Confirmar Eliminación',
        '¿Está seguro de eliminar este proyecto de forma permanente? Esta acción se registrará en el sistema.',
        'Eliminar Proyecto',
        'Cancelar',
        true
    );

    if (!confirmed) return;

    let allProjects = getLocalProjects();
    const updated = allProjects.filter(p => p.id != id);

    saveLocalProjects(updated);
    AlertService.notify('Eliminado', 'El proyecto ha sido removido del sistema.', 'success');

    if (typeof renderModule === 'function') {
        renderModule('projects');
    }
}

function toggleFeatured(id) {
    let allProjects = getLocalProjects();
    const index = allProjects.findIndex(p => p.id == id);

    if (index !== -1) {
        const project = allProjects[index];

        // Validación de estado Validado para destacar
        if (!project.featured && project.status !== 'Validado') {
            AlertService.notify('Validación Requerida', 'El proyecto debe estar "Validado" para ser destacado.', 'warning');
            return;
        }

        const session = JSON.parse(localStorage.getItem('dcti_session')) || { name: 'Admin' };
        project.featured = !project.featured;

        const logEntry = {
            date: new Date().toLocaleString(),
            responsible: session.name,
            fields: 'Estado Destacado'
        };
        project.history = [logEntry, ...(project.history || [])].slice(0, 10);

        saveLocalProjects(allProjects);
        AlertService.notify('Actualizado', `Proyecto ${project.featured ? 'marcado como' : 'removido de'} destacados.`, 'success');
        renderModule('projects');
    }
}

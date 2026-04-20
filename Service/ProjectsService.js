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
            status: ['En Proceso', 'Validado', 'Finalizado'].includes(p.status) ? 'En Progreso' : p.status,
            advances: p.advances || '',
            image: p.image || 'assets/images/proyectos.png',
            history: [] // Historial de auditoría
        }));
    }
    return projects ? JSON.parse(projects) : [];
}

function saveLocalProjects(projectsArray) {
    try {
        localStorage.setItem('dcti_projects', JSON.stringify(projectsArray));
        // Actualizar stats globales
        if (typeof MOCK_DATA !== 'undefined') {
            MOCK_DATA.stats.projects = projectsArray.length;
        }
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            AlertService.notify('Almacenamiento Lleno', 'No hay espacio para guardar los datos. Intente borrar otros registros o subir imágenes más pequeñas.', 'error');
        } else {
            console.error('Error guardando proyectos en localStorage:', e);
        }
        throw e;
    }
}

// --- UTILIDADES DE UI ---



let projectImageQueue = [];

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
    const galleryTitle = document.getElementById('project-gallery-title');

    if (!modal) return;

    modal.classList.remove('hidden');
    form.reset();
    projectImageQueue = [];

    if (id) {
        title.textContent = 'Editar Proyecto';
        editIdInput.value = id;
        if (galleryTitle) galleryTitle.textContent = 'Publicadas';

        const allProjects = getLocalProjects();
        const project = allProjects.find(p => p.id == id);

        if (project) {
            document.getElementById('admin-project-title').value = project.title || '';
            document.getElementById('admin-project-description').value = project.description || '';
            document.getElementById('admin-project-objectives').value = project.objectives || '';
            document.getElementById('admin-project-status').value = project.status || 'En Progreso';
            if (document.getElementById('admin-project-carousel')) {
                document.getElementById('admin-project-carousel').value = project.carouselPlacement || 'Ninguno';
            }
            document.getElementById('admin-project-advances').value = project.advances || '';

            projectImageQueue = project.images ? [...project.images] : (project.image && project.image !== 'assets/images/proyectos.png' ? [project.image] : []);

            const auditContainer = document.getElementById('project-audit-container');
            if (auditContainer) {
                const session = JSON.parse(localStorage.getItem('dcti_session')) || {};
                const isAdmin = session.role === 'admin';
                
                let auditHtml = `
                    <h4 style="font-size: 0.9rem; color: var(--color-text-main); margin-bottom: 10px;">Información de Auditoría</h4>
                    <div style="display: flex; gap: 20px; font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 15px;">
                        <span><i class="fas fa-calendar-plus" style="margin-right: 5px;"></i> Creado: ${project.createdAt ? new Date(project.createdAt).toLocaleDateString('es-VE') : 'N/A'} por ${project.createdBy || 'Sistema'}</span>
                        <span><i class="fas fa-edit" style="margin-right: 5px;"></i> Última act: ${project.updatedAt ? new Date(project.updatedAt).toLocaleDateString('es-VE') : 'N/A'} por ${project.updatedBy || 'Sistema'}</span>
                    </div>
                `;

                if (isAdmin && project.history && project.history.length > 0) {
                    auditHtml += `
                        <details style="background: #f8fafc; border: 1px solid var(--color-border); border-radius: 6px; padding: 10px;">
                            <summary style="font-size: 0.85rem; font-weight: 600; cursor: pointer; color: var(--color-primary); margin-bottom: 5px;">Ver Historial de Cambios (${project.history.length})</summary>
                            <ul style="list-style: none; padding: 0; margin: 10px 0 0 0; font-size: 0.8rem;">
                                ${project.history.map(h => `
                                    <li style="border-bottom: 1px dashed #e2e8f0; padding: 6px 0; display: flex; justify-content: space-between;">
                                        <span><b>${h.responsible}</b> (${h.action || 'Cambio'})</span>
                                        <span style="color: var(--color-text-muted);">${h.date} - ${h.fields}</span>
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
        title.textContent = 'Nuevo Proyecto';
        editIdInput.value = '';
        if (galleryTitle) galleryTitle.textContent = 'Previsualizar imágenes';
        if (document.getElementById('admin-project-carousel')) {
            document.getElementById('admin-project-carousel').value = 'Ninguno';
        }
        
        const auditContainer = document.getElementById('project-audit-container');
        if (auditContainer) {
            auditContainer.innerHTML = '';
            auditContainer.style.display = 'none';
        }
    }

    renderProjectGallery();
    setTimeout(() => { if (window.AdminTemplate) window.AdminTemplate.initFormBackup('project-admin-form'); }, 50);
}

function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    if (modal) modal.classList.add('hidden');
}

// --- LISTENERS ---

document.addEventListener('change', async (e) => {
    if (e.target && e.target.id === 'admin-project-file') {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        let remainingSlots = 4 - projectImageQueue.length;
        if (remainingSlots <= 0) {
            AlertService.notify('Límite alcanzado', 'Solo puedes subir un máximo de 4 imágenes por proyecto.', 'warning');
            e.target.value = '';
            return;
        }

        const filesToProcess = files.slice(0, remainingSlots);
        if (files.length > remainingSlots) {
            AlertService.notify('Límite excedido', `Se subirán solo las primeras ${remainingSlots} imágenes seleccionadas para no superar el límite de 4.`, 'warning');
        }

        for (const file of filesToProcess) {
            if (!file.type.startsWith('image/')) {
                AlertService.notify('Archivo inválido', `El archivo ${file.name} no es una imagen.`, 'error');
                continue;
            }

            try {
                const base64 = await new Promise((resolve, reject) => {
                    const reader = new FileReader();
                    reader.readAsDataURL(file);
                    reader.onload = () => {
                        const img = new Image();
                        img.onload = () => {
                            const canvas = document.createElement('canvas');
                            const MAX_WIDTH = 800;
                            const MAX_HEIGHT = 800;
                            let width = img.width;
                            let height = img.height;

                            if (width > height) {
                                if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
                            } else {
                                if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
                            }

                            canvas.width = width;
                            canvas.height = height;
                            const ctx = canvas.getContext('2d');
                            ctx.drawImage(img, 0, 0, width, height);

                            resolve(canvas.toDataURL('image/webp', 0.7)); // Usando WEBP con soporte de transparencia
                        };
                        img.onerror = reject;
                        img.src = reader.result;
                    };
                    reader.onerror = reject;
                });

                projectImageQueue.push(base64);
            } catch (err) {
                AlertService.notify('Error', `No se pudo procesar la imagen ${file.name}.`, 'error');
            }
        }

        renderProjectGallery();
        e.target.value = '';
    }


});

function renderProjectGallery() {
    const preview = document.getElementById('admin-project-preview');
    const gallery = document.getElementById('admin-project-gallery');
    const icon = document.getElementById('admin-project-icon');

    if (!preview || !gallery) return;

    if (projectImageQueue.length > 0) {
        preview.style.backgroundImage = `url(${projectImageQueue[0]})`;
        if (icon) icon.style.display = 'none';
    } else {
        preview.style.backgroundImage = 'none';
        if (icon) icon.style.display = 'block';
    }

    let html = '';
    for (let i = 0; i < 4; i++) {
        if (i < projectImageQueue.length) {
            html += `
                <div style="position: relative; aspect-ratio: 1; border-radius: 4px; border: 1px solid var(--color-border); overflow: hidden; background-image: url(${projectImageQueue[i]}); background-size: cover; background-position: center; cursor: pointer;" onclick="setProjectMainPreview(${i})">
                    <button type="button" onclick="event.stopPropagation(); removeProjectImage(${i})" style="position: absolute; top: 2px; right: 2px; background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 50%; width: 20px; height: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 0.7rem; box-shadow: 0 1px 3px rgba(0,0,0,0.3);" title="Quitar">&times;</button>
                </div>
            `;
        } else {
            html += `<div style="aspect-ratio: 1; background: #e2e8f0; border-radius: 4px; border: 1px dashed #cbd5e1;"></div>`;
        }
    }
    gallery.innerHTML = html;
}

function setProjectMainPreview(index) {
    if (projectImageQueue[index]) {
        const temp = projectImageQueue[0];
        projectImageQueue[0] = projectImageQueue[index];
        projectImageQueue[index] = temp;
        renderProjectGallery();
    }
}

function removeProjectImage(index) {
    const editId = document.getElementById('edit-project-id').value;
    const isEditing = editId !== '';
    if (isEditing && projectImageQueue.length <= 1) {
        AlertService.notify('Acción no permitida', 'Debe conservar al menos una imagen para este proyecto.', 'warning');
        return;
    }
    projectImageQueue.splice(index, 1);
    renderProjectGallery();
}


window.handleProjectSubmit = window.rateLimitAction(async function(e) {
    e.preventDefault();

    const editId = document.getElementById('edit-project-id').value;
    const title = window.sanitizeHTML(document.getElementById('admin-project-title').value.trim());
    const description = window.sanitizeHTML(document.getElementById('admin-project-description').value.trim());
    const objectives = window.sanitizeHTML(document.getElementById('admin-project-objectives').value.trim());
    const status = document.getElementById('admin-project-status').value;
    const advances = window.sanitizeHTML(document.getElementById('admin-project-advances').value.trim());
    const image = document.getElementById('admin-project-media').value;
    const carouselPlacement = document.getElementById('admin-project-carousel') ? document.getElementById('admin-project-carousel').value : 'Ninguno';

    // 1. VALIDACIÓN DE OBLIGATORIEDAD ESTRICTA
    if (!title || !description || !objectives || !status || !advances) {
        AlertService.notify('Campos Vacíos', 'Los campos no pueden estar vacíos ni contener solo espacios. Recuerde llenar los Avances Realizados.', 'warning');
        return;
    }

    // 2. VALIDACIÓN DE IMÁGENES
    if (projectImageQueue.length === 0) {
        AlertService.notify('Imagen requerida', 'Debe subir al menos una imagen descriptiva para el proyecto.', 'warning');
        return;
    }

    const imageToSave = projectImageQueue.length > 0 ? projectImageQueue[0] : 'assets/images/proyectos.png';



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
            if (old.advances !== advances) changes.push('Avances');
            if (old.carouselPlacement !== carouselPlacement) changes.push('Ubicación en Inicio');
            if (old.image !== imageToSave) changes.push('Imagen Principal');

            if (changes.length > 0) {
                const logEntry = {
                    date: now,
                    responsible: session.name || session.username || "Usuario",
                    action: "Edición",
                    fields: changes.join(', ')
                };

                allProjects[index] = {
                    ...old,
                    title,
                    description,
                    objectives,
                    status,
                    advances,
                    carouselPlacement,
                    image: imageToSave,
                    images: [...projectImageQueue],
                    updatedAt: new Date().toISOString(),
                    updatedBy: session.name || session.username || "Usuario",
                    history: [logEntry, ...(old.history || [])].slice(0, 15)
                };
                if (typeof AuditService !== 'undefined') AuditService.log('Modificación', 'Proyectos', editId, title, 'Campos modificados: ' + changes.join(', '));
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
            advances,
            carouselPlacement,
            image: imageToSave,
            images: [...projectImageQueue],
            createdAt: new Date().toISOString(),
            createdBy: session.name || session.username || "Usuario",
            updatedAt: new Date().toISOString(),
            updatedBy: session.name || session.username || "Usuario",
            history: [{ date: now, responsible: session.name || session.username || "Usuario", action: "Creación inicial", fields: "Todos" }]
        };
        allProjects.push(newProject);
        if (typeof AuditService !== 'undefined') AuditService.log('Creación', 'Proyectos', newId, title, 'Proyecto creado con estado: ' + status);
        AlertService.notify('Éxito', 'Nuevo proyecto registrado satisfactoriamente.', 'success');
    }

    try {
        saveLocalProjects(allProjects);
        closeProjectModal();

        if (typeof renderModule === 'function') {
            renderModule('projects');
        }
    } catch (e) {
        console.warn("La persistencia del proyecto fue abortada debido a falta de espacio local.");
    }
}, 2500);

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
    const deletedItem = allProjects.find(p => p.id == id);
    const updated = allProjects.filter(p => p.id != id);

    saveLocalProjects(updated);
    if (typeof AuditService !== 'undefined') AuditService.log('Eliminación', 'Proyectos', id, deletedItem ? deletedItem.title : 'N/A', 'Proyecto eliminado del sistema');
    AlertService.notify('Eliminado', 'El proyecto ha sido removido del sistema.', 'success');

    if (typeof renderModule === 'function') {
        renderModule('projects');
    }
}


window.getLocalProjects = getLocalProjects;
window.saveLocalProjects = saveLocalProjects;
window.openProjectModal = openProjectModal;
window.closeProjectModal = closeProjectModal;
// window.handleProjectSubmit = handleProjectSubmit; 
window.deleteProject = deleteProject;
window.setProjectMainPreview = setProjectMainPreview;
window.removeProjectImage = removeProjectImage;

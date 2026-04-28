/**
 * ADMIN DASHBOARD - STRATEGIC AREAS LOGIC (Local-First v1.0.0)
 * Responsabilidad: Gestión de Áreas Estratégicas, Validación de Unicidad y Auditoría.
 */

// --- GESTIÓN DE LOCALSTORAGE ---

function getLocalStrategic() {
    const strategic = localStorage.getItem('dcti_strategic');
    if (!strategic && typeof MOCK_DATA !== 'undefined') {
        return MOCK_DATA.strategic;
    }
    const items = strategic ? JSON.parse(strategic) : [];
    // Normalización: algunos items pueden tener 'title' en lugar de 'area'
    // (por inconsistencias en versiones anteriores del sistema)
    return items.map(s => ({
        ...s,
        area: s.area || s.title || s.name || 'Sin nombre',
        responsible: s.responsible || s.responsable || s.lead || s.encargado || 'Sin asignar'
    })).map(s => {
        // Autocurado: Si el id se dañó (NaN) asignar un timestamp
        if (s.id == null || isNaN(Number(s.id))) {
            s.id = Date.now() + Math.floor(Math.random() * 1000);
        }
        return s;
    });
}


function saveLocalStrategic(strategicArray) {
    localStorage.setItem('dcti_strategic', JSON.stringify(strategicArray));
}

// --- LÓGICA DE MODAL ---

let strategicImageQueue = [];

function openStrategicModal(id = null) {
    const modal = document.getElementById('strategic-modal');
    const form = document.getElementById('strategic-admin-form');
    const title = document.getElementById('strategic-modal-title');
    const editIdInput = document.getElementById('edit-strategic-id');
    const galleryTitle = document.getElementById('strategic-gallery-title');

    if (!modal) return;

    modal.classList.remove('hidden');
    form.reset();
    strategicImageQueue = [];

    if (id) {
        title.textContent = 'Editar Área Estratégica';
        editIdInput.value = id;

        const allAreas = getLocalStrategic();
        const area = allAreas.find(a => a.id == id);

        if (area) {
            document.getElementById('admin-strategic-name').value = area.area || '';
            document.getElementById('admin-strategic-description').value = area.description || '';

            if (area.image) {
                strategicImageQueue = [{ id: Date.now() + Math.random(), image: area.image }];
            } else if (area.images && area.images.length > 0) {
                strategicImageQueue = [{ id: Date.now() + Math.random(), image: area.images[0].image || area.images[0] }];
            } else {
                strategicImageQueue = [];
            }
        }
    } else {
        title.textContent = 'Nueva Área Estratégica';
        editIdInput.value = '';
    }

    renderStrategicGallery();
    setTimeout(() => { if (window.AdminTemplate) window.AdminTemplate.initFormBackup('strategic-admin-form'); }, 50);
}

function closeStrategicModal() {
    const modal = document.getElementById('strategic-modal');
    if (modal) modal.classList.add('hidden');
}

// --- LISTENERS & HELPERS ---

document.addEventListener('change', async (e) => {
    if (e.target && e.target.id === 'admin-strategic-file') {
        const file = e.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            AlertService.notify('Archivo inválido', `El archivo ${file.name} no es una imagen.`, 'error');
            e.target.value = '';
            return;
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

                        resolve(canvas.toDataURL('image/jpeg', 0.7));
                    };
                    img.onerror = reject;
                    img.src = reader.result;
                };
                reader.onerror = reject;
            });

            strategicImageQueue = [{ id: Date.now() + Math.random(), image: base64 }];
        } catch (err) {
            AlertService.notify('Error', `No se pudo procesar la imagen ${file.name}.`, 'error');
        }

        renderStrategicGallery();
        e.target.value = '';
    }
});

function handleStrategicImageChange(event, index) {
    const file = event.target.files[0];
    if (!file || !file.type.startsWith('image/')) {
        AlertService.notify('Archivo inválido', 'Debe seleccionar una imagen válida.', 'error');
        event.target.value = '';
        return;
    }

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

            strategicImageQueue[index].image = canvas.toDataURL('image/jpeg', 0.7);
            renderStrategicGallery();
        };
        img.src = reader.result;
    };
    event.target.value = '';
}

function updateStrategicImageMetadata(index, field, value) {
    if (strategicImageQueue[index]) {
        strategicImageQueue[index][field] = value;
    }
}

function renderStrategicGallery() {
    const preview = document.getElementById('admin-strategic-preview');
    const icon = document.getElementById('admin-strategic-placeholder-icon');

    if (!preview) return;

    if (strategicImageQueue.length > 0) {
        preview.style.backgroundImage = `url(${strategicImageQueue[0].image})`;
        if (icon) icon.style.display = 'none';
    } else {
        preview.style.backgroundImage = 'none';
        if (icon) icon.style.display = 'block';
    }
}

// Function para uso legacy (no tan util aqui pero mantenemos por consistencia si se clickeaba imagen para main)
function setStrategicMainPreview(index) {
    if (strategicImageQueue[index]) {
        const temp = strategicImageQueue[0];
        strategicImageQueue[0] = strategicImageQueue[index];
        strategicImageQueue[index] = temp;
        renderStrategicGallery();
    }
}

function removeStrategicImage(index) {
    const editId = document.getElementById('edit-strategic-id').value;
    const isEditing = editId !== '';
    if (isEditing && strategicImageQueue.length <= 1) {
        AlertService.notify('Acción no permitida', 'Debe conservar al menos una imagen publicada para esta área. Si desea cambiarla, suba la nueva primero.', 'warning');
        return;
    }
    strategicImageQueue.splice(index, 1);
    renderStrategicGallery();
}

async function handleStrategicSubmit(e) {
    e.preventDefault();

    const editId = document.getElementById('edit-strategic-id').value;
    const areaName = document.getElementById('admin-strategic-name').value.trim();
    const description = document.getElementById('admin-strategic-description').value.trim();

    // 1. VALIDACIÓN DE OBLIGATORIEDAD Y ESPACIOS VACÍOS
    if (!areaName || !description || areaName === '' || description === '') {
        AlertService.notify('Campos Vacíos', 'Los campos no pueden estar vacíos ni contener solo espacios.', 'warning');
        return;
    }

    if (strategicImageQueue.length === 0) {
        AlertService.notify('Imagen requerida', 'Debe subir al menos una imagen representativa para el área.', 'warning');
        return;
    }

    const imageToSave = strategicImageQueue.length > 0 ? strategicImageQueue[0].image : 'assets/images/img4.jpg';

    let allAreas = getLocalStrategic();

    // 2. CONTROL DE UNICIDAD (Solo si es nuevo o el nombre cambió)
    const isDuplicate = allAreas.some(a => a.area.toLowerCase() === areaName.toLowerCase() && a.id != editId);
    if (isDuplicate) {
        AlertService.notify('Nombre Duplicado', `El área "${areaName}" ya existe en el sistema.`, 'error');
        return;
    }

    // 3. OBTENER USUARIO LOGUEADO PARA AUDITORÍA
    const session = JSON.parse(localStorage.getItem('dcti_session')) || { name: 'Sistema' };
    const auditData = {
        updatedAt: new Date().toLocaleString(),
        updatedBy: session.name
    };

    const imagesToSave = JSON.parse(JSON.stringify(strategicImageQueue));

    if (editId) {
        // ACTUALIZAR
        const index = allAreas.findIndex(a => String(a.id) === String(editId));
        if (index !== -1) {
            allAreas[index] = {
                ...allAreas[index],
                area: areaName,
                description: description,
                image: imageToSave,
                images: imagesToSave,
                audit: auditData // Trazabilidad Obligatoria
            };
            AlertService.notify('Área Actualizada', 'Los cambios han sido registrados con éxito.', 'success');
            if (typeof AuditService !== 'undefined') AuditService.log('Modificación', 'Áreas Estratégicas', editId, areaName, 'Datos actualizados');
        }
    } else {
        // AGREGAR
        // Asegurar que solo comprobamos ids que sean números
        const validIds = allAreas.map(a => Number(a.id)).filter(id => !isNaN(id));
        const newId = validIds.length > 0 ? Math.max(...validIds) + 1 : 1;
        const newArea = {
            id: newId,
            area: areaName,
            description: description,
            image: imageToSave,
            images: imagesToSave,
            audit: auditData // Trazabilidad Obligatoria
        };
        allAreas.push(newArea);
        if (typeof AuditService !== 'undefined') AuditService.log('Creación', 'Áreas Estratégicas', newId, areaName, 'Nueva área estratégica');
        AlertService.notify('Área Creada', 'La nueva área estratégica ha sido registrada.', 'success');
    }

    saveLocalStrategic(allAreas);
    closeStrategicModal();

    if (typeof renderModule === 'function') {
        MOCK_DATA.strategic = allAreas;
        renderModule('strategic');
    }
}

async function deleteStrategic(id) {
    let allAreas = getLocalStrategic();

    // Regla de negocio: Evitar que el sistema se quede sin áreas estratégicas
    if (allAreas.length <= 1) {
        AlertService.notify('Acción Denegada', 'Debe existir al menos un (1) Área Estratégica en el sistema para que se refleje en el portal público.', 'error');
        return;
    }

    const confirmed = await AlertService.confirm(
        '¿Eliminar Área?',
        `¿Estás seguro de que deseas eliminar esta área estratégica ? Esta acción no se puede deshacer.`,
        'Eliminar',
        'Cancelar',
        true
    );

    if (!confirmed) return;

    const deletedItem = allAreas.find(a => a.id == id);
    const updatedAreas = allAreas.filter(a => a.id != id);

    saveLocalStrategic(updatedAreas);
    if (typeof AuditService !== 'undefined') AuditService.log('Eliminación', 'Áreas Estratégicas', id, deletedItem ? deletedItem.area : 'N/A', 'Área estratégica eliminada');
    AlertService.notify('Área Eliminada', 'El registro ha sido removido.', 'success');

    if (typeof renderModule === 'function') {
        MOCK_DATA.strategic = updatedAreas;
        renderModule('strategic');
    }
}
// EXPORTACIONES GLOBALES
window.getLocalStrategic = getLocalStrategic;
window.saveLocalStrategic = saveLocalStrategic;
window.openStrategicModal = openStrategicModal;
window.closeStrategicModal = closeStrategicModal;
window.handleStrategicSubmit = handleStrategicSubmit;
window.deleteStrategic = deleteStrategic;
window.handleStrategicImageChange = handleStrategicImageChange;
window.updateStrategicImageMetadata = updateStrategicImageMetadata;
window.removeStrategicImage = removeStrategicImage;
window.setStrategicMainPreview = setStrategicMainPreview;

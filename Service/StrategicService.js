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
    }));
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
        if (galleryTitle) galleryTitle.textContent = 'Publicadas';

        const allAreas = getLocalStrategic();
        const area = allAreas.find(a => a.id == id);

        if (area) {
            document.getElementById('admin-strategic-name').value = area.area || '';
            document.getElementById('admin-strategic-responsible').value = area.responsible || '';
            document.getElementById('admin-strategic-description').value = area.description || '';

            // Handle backwards compatibility for string arrays vs objects
            if (area.images) {
                strategicImageQueue = area.images.map(img => {
                    if (typeof img === 'string') return { id: Date.now() + Math.random(), image: img, title: '', description: '' };
                    return img; // Already an object
                });
            } else if (area.image) {
                strategicImageQueue = [{ id: Date.now() + Math.random(), image: area.image, title: '', description: '' }];
            } else {
                strategicImageQueue = [];
            }
        }
    } else {
        title.textContent = 'Nueva Área Estratégica';
        editIdInput.value = '';
        if (galleryTitle) galleryTitle.textContent = 'Imágenes del Carrusel (Añada textos descriptivos)';
    }

    renderStrategicGallery();
}

function closeStrategicModal() {
    const modal = document.getElementById('strategic-modal');
    if (modal) modal.classList.add('hidden');
}

// --- LISTENERS & HELPERS ---

document.addEventListener('change', async (e) => {
    if (e.target && e.target.id === 'admin-strategic-file') {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        let remainingSlots = 4 - strategicImageQueue.length;
        if (remainingSlots <= 0) {
            AlertService.notify('Límite alcanzado', 'Solo puedes subir un máximo de 4 imágenes por área.', 'warning');
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
                            const MAX_WIDTH = 1200;
                            const MAX_HEIGHT = 1200;
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

                            resolve(canvas.toDataURL('image/jpeg', 0.8));
                        };
                        img.onerror = reject;
                        img.src = reader.result;
                    };
                    reader.onerror = reject;
                });

                strategicImageQueue.push({
                    id: Date.now() + Math.random(),
                    image: base64,
                    title: '',
                    description: ''
                });
            } catch (err) {
                AlertService.notify('Error', `No se pudo procesar la imagen ${file.name}.`, 'error');
            }
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
            const MAX_WIDTH = 1200;
            const MAX_HEIGHT = 1200;
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

            strategicImageQueue[index].image = canvas.toDataURL('image/jpeg', 0.8);
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
    const gallery = document.getElementById('admin-strategic-gallery');

    if (!preview || !gallery) return;

    if (strategicImageQueue.length > 0) {
        preview.style.backgroundImage = `url(${strategicImageQueue[0].image})`;
        if (icon) icon.style.display = 'none';
    } else {
        preview.style.backgroundImage = 'none';
        if (icon) icon.style.display = 'block';
    }

    let html = '';
    for (let i = 0; i < 4; i++) {
        if (i < strategicImageQueue.length) {
            const item = strategicImageQueue[i];
            // Construir una tarjeta interactiva para cada imagen de la cola
            html += `
                <div style="background: white; border-radius: 6px; border: 1px solid var(--color-border); overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 1px 2px rgba(0,0,0,0.05); grid-column: span 1;">
                    <div style="position: relative; aspect-ratio: 16/9; background-image: url(${item.image}); background-size: cover; background-position: center;">
                        <input type="file" id="strategic-change-img-${item.id}" accept="image/*" style="display: none;" onchange="handleStrategicImageChange(event, ${i})">
                        <div style="position: absolute; top: 4px; right: 4px; display: flex; gap: 4px;">
                            <button type="button" onclick="document.getElementById('strategic-change-img-${item.id}').click()" style="background: rgba(37, 99, 235, 0.9); color: white; border: none; border-radius: 4px; padding: 4px 6px; cursor: pointer; font-size: 0.7rem;" title="Cambiar la foto (mantiene los textos)"><i class="fas fa-sync-alt"></i></button>
                            <button type="button" onclick="removeStrategicImage(${i})" style="background: rgba(239, 68, 68, 0.9); color: white; border: none; border-radius: 4px; padding: 4px 6px; cursor: pointer; font-size: 0.7rem;" title="Eliminar por completo"><i class="fas fa-trash"></i></button>
                        </div>
                    </div>
                    <div style="padding: 8px; display: flex; flex-direction: column; gap: 6px; flex: 1;">
                        <input type="text" id="carousel-title-${item.id}" placeholder="Título para la imagen..." style="width: 100%; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px; font-size: 0.75rem;" value="${item.title || ''}" oninput="updateStrategicImageMetadata(${i}, 'title', this.value)">
                        <textarea id="carousel-desc-${item.id}" placeholder="Descripción del carrusel..." style="width: 100%; border: 1px solid #e2e8f0; border-radius: 4px; padding: 6px; font-size: 0.75rem; height: 50px; resize: none;" oninput="updateStrategicImageMetadata(${i}, 'description', this.value)">${item.description || ''}</textarea>
                    </div>
                </div>
            `;
        } else {
            // Placeholder vacío
            html += `<div style="aspect-ratio: 9/12; background: #f8fafc; border-radius: 6px; border: 1px dashed #cbd5e1; display: flex; align-items: center; justify-content: center;"><span style="color: #94a3b8; font-size: 0.75rem;">Slot Vacío</span></div>`;
        }
    }

    // Cambiar layout de grid en proyectos para que entren como tarjetas (en strategic.js ya se inyecta en una grid apropiada, pero ajustaremos para tarjetas verticales)
    gallery.style.gridTemplateColumns = 'repeat(2, 1fr)';
    gallery.style.gap = '15px';
    gallery.innerHTML = html;
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
    const responsible = document.getElementById('admin-strategic-responsible').value.trim();
    const description = document.getElementById('admin-strategic-description').value.trim();

    // 1. VALIDACIÓN DE OBLIGATORIEDAD Y ESPACIOS VACÍOS
    if (!areaName || !description || !responsible || areaName === '' || description === '' || responsible === '') {
        AlertService.notify('Campos Vacíos', 'Los campos no pueden estar vacíos ni contener solo espacios.', 'warning');
        return;
    }

    if (strategicImageQueue.length === 0) {
        AlertService.notify('Imagen requerida', 'Debe subir al menos una imagen representativa para el área.', 'warning');
        return;
    }

    const imageToSave = strategicImageQueue.length > 0 ? strategicImageQueue[0].image : 'Assets/images/img4.jpg';

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
        const index = allAreas.findIndex(a => a.id == editId);
        if (index !== -1) {
            allAreas[index] = {
                ...allAreas[index],
                area: areaName,
                responsible: responsible,
                description: description,
                image: imageToSave,
                images: imagesToSave,
                audit: auditData // Trazabilidad Obligatoria
            };
            AlertService.notify('Área Actualizada', 'Los cambios han sido registrados con éxito.', 'success');
        }
    } else {
        // AGREGAR
        const newId = allAreas.length > 0 ? Math.max(...allAreas.map(a => a.id)) + 1 : 1;
        const newArea = {
            id: newId,
            area: areaName,
            responsible: responsible,
            description: description,
            image: imageToSave,
            images: imagesToSave,
            audit: auditData // Trazabilidad Obligatoria
        };
        allAreas.push(newArea);
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

    const updatedAreas = allAreas.filter(a => a.id != id);

    saveLocalStrategic(updatedAreas);
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

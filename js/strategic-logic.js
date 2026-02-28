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
    return strategic ? JSON.parse(strategic) : [];
}

function saveLocalStrategic(strategicArray) {
    localStorage.setItem('dcti_strategic', JSON.stringify(strategicArray));
}

// --- LÓGICA DE MODAL ---

function openStrategicModal(id = null) {
    const modal = document.getElementById('strategic-modal');
    const form = document.getElementById('strategic-admin-form');
    const title = document.getElementById('strategic-modal-title');
    const editIdInput = document.getElementById('edit-strategic-id');

    if (!modal) return;

    modal.classList.remove('hidden');
    form.reset();
    document.getElementById('admin-strategic-preview').style.backgroundImage = 'none';

    if (id) {
        title.textContent = 'Editar Área Estratégica';
        editIdInput.value = id;

        const allAreas = getLocalStrategic();
        const area = allAreas.find(a => a.id == id);

        if (area) {
            document.getElementById('admin-strategic-name').value = area.area || '';
            document.getElementById('admin-strategic-responsible').value = area.responsible || '';
            document.getElementById('admin-strategic-description').value = area.description || '';
            document.getElementById('admin-strategic-media').value = area.image || '';

            if (area.image) {
                const preview = document.getElementById('admin-strategic-preview');
                preview.style.backgroundImage = `url(${area.image})`;
                preview.style.backgroundSize = 'cover';
                preview.style.backgroundPosition = 'center';
            }
        }
    } else {
        title.textContent = 'Nueva Área Estratégica';
        editIdInput.value = '';
    }
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
            AlertService.notify('Archivo inválido', 'Por favor selecciona una imagen.', 'error');
            return;
        }

        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => {
                const base64 = reader.result;
                document.getElementById('admin-strategic-media').value = base64;
                const preview = document.getElementById('admin-strategic-preview');
                preview.style.backgroundImage = `url(${base64})`;
                preview.style.backgroundSize = 'cover';
                preview.style.backgroundPosition = 'center';
            };
        } catch (err) {
            AlertService.notify('Error', 'No se pudo procesar la imagen.', 'error');
        }
    }
});

async function handleStrategicSubmit(e) {
    e.preventDefault();

    const editId = document.getElementById('edit-strategic-id').value;
    const areaName = document.getElementById('admin-strategic-name').value.trim();
    const responsible = document.getElementById('admin-strategic-responsible').value.trim();
    const description = document.getElementById('admin-strategic-description').value.trim();
    const image = document.getElementById('admin-strategic-media').value;

    // 1. VALIDACIÓN DE OBLIGATORIEDAD
    if (!areaName || !description || !responsible) {
        AlertService.notify('Campos Vacíos', 'Nombre, Responsable y Descripción son obligatorios.', 'warning');
        return;
    }

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

    if (editId) {
        // ACTUALIZAR
        const index = allAreas.findIndex(a => a.id == editId);
        if (index !== -1) {
            allAreas[index] = {
                ...allAreas[index],
                area: areaName,
                responsible: responsible,
                description: description,
                image: image || allAreas[index].image,
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
            image: image || 'img/img4.jpg',
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
    const confirmed = await AlertService.confirm(
        '¿Eliminar Área?',
        `¿Estás seguro de que deseas eliminar esta área estratégica? Esta acción no se puede deshacer.`,
        'Eliminar',
        'Cancelar',
        true
    );

    if (!confirmed) return;

    let allAreas = getLocalStrategic();
    const updatedAreas = allAreas.filter(a => a.id != id);

    saveLocalStrategic(updatedAreas);
    AlertService.notify('Área Eliminada', 'El registro ha sido removido.', 'success');

    if (typeof renderModule === 'function') {
        MOCK_DATA.strategic = updatedAreas;
        renderModule('strategic');
    }
}

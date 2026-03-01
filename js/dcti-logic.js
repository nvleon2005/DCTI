/**
 * DCTI LOGIC - Institutional Information Management (RF001)
 * Role: Admin only for registration and modification.
 */

const DCTI_STORAGE_KEY = 'dcti_info';

/**
 * Get institutional data from localStorage or fallback to MOCK_DATA
 */
function getLocalDcti() {
    const saved = localStorage.getItem(DCTI_STORAGE_KEY);
    if (saved) return JSON.parse(saved);

    // Fallback based on interface-logic.js MOCK_DATA structure
    return typeof MOCK_DATA !== 'undefined' && MOCK_DATA.dcti ? MOCK_DATA.dcti : {
        mission: "",
        vision: "",
        review: "",
        organigrama: null
    };
}

/**
 * Save institutional data to localStorage
 */
function saveLocalDcti(data) {
    if (!data.mission || !data.vision || !data.review) {
        if (typeof AlertService !== 'undefined') {
            AlertService.notify('Todos los campos institucionales son obligatorios.', 'error');
        }
        return false;
    }

    localStorage.setItem(DCTI_STORAGE_KEY, JSON.stringify(data));

    // Synchronize global MOCK_DATA if available
    if (typeof MOCK_DATA !== 'undefined') {
        MOCK_DATA.dcti = data;
    }

    if (typeof AlertService !== 'undefined') {
        AlertService.notify('Información institucional actualizada correctamente.', 'success');
    }
    return true;
}

/**
 * Manejador de previsualización de organigrama (con compresión en canvas)
 */
function previewOrganigrama(event) {
    const file = event.target.files[0];
    if (file) {
        if (!file.type.startsWith('image/')) {
            if (typeof AlertService !== 'undefined') {
                AlertService.notify('Solo se permiten subir imágenes para el Organigrama.', 'error');
            }
            event.target.value = '';
            document.getElementById('admin-dcti-organigrama-preview').style.display = 'none';
            return;
        }

        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 1200; // Ancho máximo conservador para no saturar Storage
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

                // Calidad al 75%
                const dataUrl = canvas.toDataURL('image/jpeg', 0.75);
                const preview = document.getElementById('admin-dcti-organigrama-preview');
                if (preview) {
                    preview.src = dataUrl;
                    preview.style.display = 'block';
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

/**
 * Form handler for DCTI view
 */
function handleDctiSubmit(event) {
    event.preventDefault();

    const mission = document.getElementById('admin-dcti-mission').value.trim();
    const vision = document.getElementById('admin-dcti-vision').value.trim();
    const review = document.getElementById('admin-dcti-review').value.trim();

    const organigramaPreview = document.getElementById('admin-dcti-organigrama-preview');
    const organigrama = organigramaPreview && organigramaPreview.style.display === 'block' ? organigramaPreview.src : null;

    const result = saveLocalDcti({ mission, vision, review, organigrama });

    if (result && typeof renderModule === 'function') {
        renderModule('dcti');
    }
}

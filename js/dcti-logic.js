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
        organigrama: null,
        phone: "",
        email: "",
        address: "",
        instagram: "",
        facebook: ""
    };
}

/**
 * Save institutional data to localStorage
 */
function saveLocalDcti(data) {
    if (!data.mission || !data.vision || !data.review || data.mission.trim() === '' || data.vision.trim() === '' || data.review.trim() === '') {
        if (typeof AlertService !== 'undefined') {
            AlertService.notify('Todos los campos son obligatorios y no pueden contener solo espacios vacíos.', 'error');
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

                // Rellenar con fondo blanco por si la imagen tiene partes transparentes y el visor falla, 
                // aunque WebP maneja transparencia.
                // ctx.fillStyle = '#ffffff';
                // ctx.fillRect(0, 0, width, height);

                ctx.drawImage(img, 0, 0, width, height);

                // Usamos WebP para preservar transparencia (PNG) y a la vez comprimir, 
                // evitando el fondo negro del JPEG tradicional.
                const dataUrl = canvas.toDataURL('image/webp', 0.85);
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

    // Nuvos campos de contacto y redes sociales (pueden venir vacíos porque son opcionales)
    const phone = document.getElementById('admin-dcti-phone') ? document.getElementById('admin-dcti-phone').value.trim() : '';
    const email = document.getElementById('admin-dcti-email') ? document.getElementById('admin-dcti-email').value.trim() : '';
    const address = document.getElementById('admin-dcti-address') ? document.getElementById('admin-dcti-address').value.trim() : '';
    const instagram = document.getElementById('admin-dcti-instagram') ? document.getElementById('admin-dcti-instagram').value.trim() : '';
    const facebook = document.getElementById('admin-dcti-facebook') ? document.getElementById('admin-dcti-facebook').value.trim() : '';

    const organigramaPreview = document.getElementById('admin-dcti-organigrama-preview');
    const organigrama = organigramaPreview && organigramaPreview.style.display === 'block' ? organigramaPreview.src : null;

    const result = saveLocalDcti({ mission, vision, review, organigrama, phone, email, address, instagram, facebook });

    if (result && typeof renderModule === 'function') {
        renderModule('dcti');
    }
}

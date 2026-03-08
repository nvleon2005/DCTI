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

    const lat = document.getElementById('admin-dcti-lat') ? document.getElementById('admin-dcti-lat').value : '9.7446818';
    const lng = document.getElementById('admin-dcti-lng') ? document.getElementById('admin-dcti-lng').value : '-63.1722970';

    const organigramaPreview = document.getElementById('admin-dcti-organigrama-preview');
    const organigrama = organigramaPreview && organigramaPreview.style.display === 'block' ? organigramaPreview.src : null;

    const result = saveLocalDcti({ mission, vision, review, organigrama, phone, email, address, instagram, facebook, lat, lng });

    if (result && typeof renderModule === 'function') {
        renderModule('dcti');
    }
}

// --- LOGICA DEL MAPA INTERACTIVO ---
let adminMapInstance = null;
let adminMapMarker = null;
let originalLatLng = null; // Guardará la ubicación original para poder reiniciarla

// Inyectar clase CSS para la animación de rebote del pin ("bounce")
const bounceStyle = document.createElement('style');
bounceStyle.innerHTML = `
/* Evitar que el pin de Leaflet se vuelva transparente al arrastrarlo */
.leaflet-dragging .leaflet-marker-icon {
  opacity: 1 !important;
  cursor: grabbing !important;
}
/* Animación de caída al soltar (usando margin-top para no romper el transform X/Y de Leaflet) */
@keyframes marker-bounce-drop {
  0% { margin-top: -61px; }
  40% { margin-top: -41px; }
  70% { margin-top: -48px; }
  100% { margin-top: -41px; }
}
.marker-dropping {
  animation: marker-bounce-drop 0.5s ease-out forwards !important;
}
`;
document.head.appendChild(bounceStyle);

function initAdminMap() {
    const container = document.getElementById('admin-dcti-map-container');
    if (!container) return;

    // Leer coordenadas actuales (de MOCK_DATA o los inputs hidden)
    const latInput = document.getElementById('admin-dcti-lat');
    const lngInput = document.getElementById('admin-dcti-lng');
    const lat = latInput ? parseFloat(latInput.value) : 9.7446818;
    const lng = lngInput ? parseFloat(lngInput.value) : -63.1722970;

    originalLatLng = { lat, lng }; // Guardamos el origen

    // Si ya existe instancia, solo actualizamos vista
    if (adminMapInstance) {
        adminMapInstance.remove();
    }

    // Crear mapa centrado en coordenadas
    adminMapInstance = L.map('admin-dcti-map-container').setView([lat, lng], 16);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(adminMapInstance);

    // Agregar marcador (inicialmente bloqueado)
    adminMapMarker = L.marker([lat, lng], { draggable: false }).addTo(adminMapInstance);

    // Escuchar cuando termine de arrastrar para actualizar inputs
    adminMapMarker.on('dragend', function (event) {
        const position = adminMapMarker.getLatLng();
        if (latInput) latInput.value = position.lat;
        if (lngInput) lngInput.value = position.lng;

        // Ejecutar animación de rebote al soltar el pin
        const iconElement = adminMapMarker.getElement();
        if (iconElement) {
            iconElement.classList.remove('marker-dropping');
            void iconElement.offsetWidth; // Forzar reflow para reiniciar animación
            iconElement.classList.add('marker-dropping');
        }
    });

    // Deshabilitar interacción del mapa inicialmente
    adminMapInstance.dragging.disable();
    adminMapInstance.touchZoom.disable();
    adminMapInstance.doubleClickZoom.disable();
    adminMapInstance.scrollWheelZoom.disable();
    adminMapInstance.boxZoom.disable();
    adminMapInstance.keyboard.disable();

    // Invalidar para que dibuje bien dentro del contenedor
    setTimeout(() => {
        if (adminMapInstance) adminMapInstance.invalidateSize();
    }, 200);
}

function unlockAdminMap() {
    // Quitar capa de bloqueo
    const overlay = document.getElementById('admin-dcti-map-overlay');
    if (overlay) overlay.style.display = 'none';

    // Habilitar arrastre del marcador
    if (adminMapMarker) {
        adminMapMarker.dragging.enable();
    }

    // Habilitar interacción del mapa
    if (adminMapInstance) {
        adminMapInstance.dragging.enable();
        adminMapInstance.touchZoom.enable();
        adminMapInstance.doubleClickZoom.enable();
        adminMapInstance.scrollWheelZoom.enable();
        adminMapInstance.boxZoom.enable();
        adminMapInstance.keyboard.enable();
    }

    // Desactivar boton de desbloqueo para evitar confusiones
    const btn = document.getElementById('admin-dcti-unlock-map');
    if (btn) {
        btn.innerHTML = '<i class="fas fa-unlock"></i> Mapa Desbloqueado';
        btn.style.opacity = '0.5';
        btn.style.cursor = 'default';
        btn.onclick = null;
    }
}

function resetAdminMap() {
    if (!adminMapInstance || !adminMapMarker || !originalLatLng) return;

    // Volver el marcador a la posición original
    adminMapMarker.setLatLng([originalLatLng.lat, originalLatLng.lng]);

    // Centrar el mapa con una animación suave ("flyTo")
    adminMapInstance.flyTo([originalLatLng.lat, originalLatLng.lng], 16, {
        animate: true,
        duration: 1.5 // Segundos que dura la animación de regreso
    });

    // Restaurar los valores en los inputs ocultos
    const latInput = document.getElementById('admin-dcti-lat');
    const lngInput = document.getElementById('admin-dcti-lng');
    if (latInput) latInput.value = originalLatLng.lat;
    if (lngInput) lngInput.value = originalLatLng.lng;

    // Ejecutar la animación de caída al llegar al origen
    const iconElement = adminMapMarker.getElement();
    if (iconElement) {
        iconElement.classList.remove('marker-dropping');
        void iconElement.offsetWidth; // Forzar reflow para reiniciar animación
        iconElement.classList.add('marker-dropping');
    }

    if (typeof AlertService !== 'undefined') {
        AlertService.notify('Ubicación Restaurada', 'El pin ha vuelto a la posición original guardada.', 'success');
    }
}

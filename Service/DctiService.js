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
        consultasImage: null,
        phone: "",
        email: "",
        address: "",
        instagram: "",
        facebook: "",
        twitter: ""
    };
}

/**
 * Save institutional data to localStorage
 */
function saveLocalDcti(data) {
    if (!data.mission || !data.vision || !data.review || data.mission.trim() === '' || data.vision.trim() === '' || data.review.trim() === '') {
        if (typeof AlertService !== 'undefined') {
            AlertService.notify('Campos Obligatorios', 'Todos los campos son obligatorios y no pueden contener solo espacios vacíos.', 'error');
        }
        return false;
    }

    const oldData = getLocalDcti();
    const session = JSON.parse(localStorage.getItem('dcti_session')) || { name: 'Sistema' };
    const nowStr = new Date().toLocaleString('es-VE');

    // Create history log for changes
    const changes = [];
    if (oldData.mission !== data.mission && oldData.mission !== undefined) changes.push('Misión');
    if (oldData.vision !== data.vision && oldData.vision !== undefined) changes.push('Visión');
    if (oldData.review !== data.review && oldData.review !== undefined) changes.push('Reseña');
    if (oldData.phone !== data.phone) changes.push('Teléfono');
    if (oldData.email !== data.email) changes.push('Email');
    if (oldData.address !== data.address) changes.push('Dirección');
    if (oldData.instagram !== data.instagram) changes.push('Instagram');
    if (oldData.facebook !== data.facebook) changes.push('Facebook');
    if (oldData.twitter !== data.twitter) changes.push('Twitter');
    if (oldData.organigrama !== data.organigrama) changes.push('Organigrama');
    if (oldData.consultasImage !== data.consultasImage) changes.push('Img Consultas');

    let historyLog = oldData.history || [];
    if (changes.length > 0) {
        historyLog.unshift({
            date: nowStr,
            responsible: session.name || session.username || "Usuario",
            action: "Actualización de Contenido",
            fields: changes.join(', ')
        });
        historyLog = historyLog.slice(0, 15);
    } else if (!oldData.createdAt) {
          historyLog.unshift({
            date: nowStr,
            responsible: session.name || session.username || "Usuario",
            action: "Migración/Creación",
            fields: "Todos"
        });
    }

    const finalData = {
        ...data,
        createdAt: oldData.createdAt || new Date().toISOString(),
        createdBy: oldData.createdBy || session.name || session.username || "Usuario",
        updatedAt: new Date().toISOString(),
        updatedBy: session.name || session.username || "Usuario",
        history: historyLog
    };

    localStorage.setItem(DCTI_STORAGE_KEY, JSON.stringify(finalData));

    // Synchronize global MOCK_DATA if available
    if (typeof MOCK_DATA !== 'undefined') {
        MOCK_DATA.dcti = finalData;
    }

    if (typeof AlertService !== 'undefined') {
        if (changes.length > 0 || !oldData.createdAt) {
            if (typeof AuditService !== 'undefined') AuditService.log('Modificación', 'DCTI', 'dcti_info', 'Información Institucional', 'Campos modificados: ' + (changes.length > 0 ? changes.join(', ') : 'Registro inicial'));
            AlertService.notify('Información Actualizada', 'La información institucional y auditoría han sido actualizadas.', 'success');
        } else {
            AlertService.notify('Sin Cambios', 'No hubo modificaciones.', 'info');
        }
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
                const container = document.getElementById('admin-dcti-organigrama-container');
                const blur = document.getElementById('admin-dcti-organigrama-blur');
                if (preview) {
                    preview.src = dataUrl;
                    preview.style.display = 'block';
                }
                if (container) {
                    container.style.backgroundImage = `url('${dataUrl}')`;
                    container.style.backgroundSize = 'cover';
                    container.style.backgroundPosition = 'center';
                }
                if (blur) blur.style.display = 'block';
                const placeholder = document.getElementById('admin-dcti-organigrama-placeholder');
                if (placeholder) placeholder.style.display = 'none';
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
}

/**
 * Manejador de previsualización de imagen de Consultas (con compresión en canvas)
 */
function previewConsultasImage(event) {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        if (typeof AlertService !== 'undefined') AlertService.notify('Solo se permiten imágenes.', 'error');
        event.target.value = '';
        return;
    }
    const reader = new FileReader();
    reader.onload = function (e) {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            const MAX_W = 800, MAX_H = 800;
            let w = img.width, h = img.height;
            if (w > h) { if (w > MAX_W) { h *= MAX_W / w; w = MAX_W; } }
            else { if (h > MAX_H) { w *= MAX_H / h; h = MAX_H; } }
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            const dataUrl = canvas.toDataURL('image/webp', 0.85);
            const preview = document.getElementById('admin-dcti-consultas-preview');
            const container = document.getElementById('admin-dcti-consultas-container');
            const blur = document.getElementById('admin-dcti-consultas-blur');
            if (preview) { preview.src = dataUrl; preview.style.display = 'block'; }
            if (container) {
                container.style.backgroundImage = `url('${dataUrl}')`;
                container.style.backgroundSize = 'cover';
                container.style.backgroundPosition = 'center';
            }
            if (blur) blur.style.display = 'block';
            const placeholder = document.getElementById('admin-dcti-consultas-placeholder');
            if (placeholder) placeholder.style.display = 'none';
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

/**
 * Form handler for DCTI view
 */
async function handleDctiSubmit(event) {
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
    const twitter = document.getElementById('admin-dcti-twitter') ? document.getElementById('admin-dcti-twitter').value.trim() : '';

    const lat = document.getElementById('admin-dcti-lat') ? document.getElementById('admin-dcti-lat').value : '9.7446818';
    const lng = document.getElementById('admin-dcti-lng') ? document.getElementById('admin-dcti-lng').value : '-63.1722970';

    const oldData = getLocalDcti();

    const organigramaPreview = document.getElementById('admin-dcti-organigrama-preview');
    const organigrama = organigramaPreview && organigramaPreview.style.display === 'block' ? organigramaPreview.src : (oldData.organigrama || null);

    const consultasPreview = document.getElementById('admin-dcti-consultas-preview');
    const consultasImage = consultasPreview && consultasPreview.style.display === 'block' ? consultasPreview.src : (oldData.consultasImage || null);

    const newData = { mission, vision, review, organigrama, consultasImage, phone, email, address, instagram, facebook, twitter, lat, lng };

    // Comparar los cambios
    const changesTextData = [];
    if (oldData.mission !== newData.mission && oldData.mission !== undefined) changesTextData.push('Misión Institucional');
    if (oldData.vision !== newData.vision && oldData.vision !== undefined) changesTextData.push('Visión Institucional');
    if (oldData.review !== newData.review && oldData.review !== undefined) changesTextData.push('Reseña Institucional');
    if (oldData.phone !== newData.phone) changesTextData.push('Teléfono de Contacto');
    if (oldData.email !== newData.email) changesTextData.push('Correo Electrónico');
    if (oldData.address !== newData.address) changesTextData.push('Dirección Física');
    if (oldData.instagram !== newData.instagram) changesTextData.push('Instagram (@)');
    if (oldData.facebook !== newData.facebook) changesTextData.push('Facebook (URL)');
    if (oldData.twitter !== newData.twitter) changesTextData.push('Twitter / X (@)');
    if (oldData.organigrama !== newData.organigrama && oldData.organigrama !== undefined) changesTextData.push('Organigrama Institucional (Imagen)');
    if (oldData.consultasImage !== newData.consultasImage && oldData.consultasImage !== undefined) changesTextData.push('Imagen de Consultas Públicas');
    if (oldData.lat !== newData.lat || oldData.lng !== newData.lng) changesTextData.push('Ubicación Geográfica en el Mapa');

    if (changesTextData.length === 0) {
        if (typeof AlertService !== 'undefined') {
             AlertService.notify('Sin Cambios', 'No has realizado ninguna modificación en los datos de la institución.', 'info');
        }
        return;
    }

    const htmlChangesList = `<ul style="margin-top: 15px; margin-bottom: 15px; padding-left: 25px; font-weight: 600; color: var(--color-primary); font-size: 0.95rem;">${changesTextData.map(c => `<li style="margin-bottom: 5px;">${c}</li>`).join('')}</ul>`;
    
    if (typeof AlertService !== 'undefined') {
        const confirmResult = await AlertService.confirm(
            'Confirmar Cambios',
            `Estás a punto de actualizar la información pública del portal institucional DCTI. Se registrarán los siguientes cambios:<br>${htmlChangesList}¿Deseas confirmar y guardar estos cambios?`,
            'Guardar Cambios',
            'Cancelar Modificación'
        );
        if (!confirmResult) return;
    }

    const result = saveLocalDcti(newData);

    if (result && typeof renderModule === 'function') {
        renderModule('admin-dcti');
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

    // Si ya existe instancia, destruirla completamente antes de recrear
    if (adminMapInstance) {
        adminMapInstance.remove();
        adminMapInstance = null;
    }

    // Limpiar el atributo _leaflet_id que Leaflet deja en el contenedor
    // para que no lance el error "Map container is already initialized"
    if (container._leaflet_id) {
        delete container._leaflet_id;
    }

    // Crear mapa centrado en coordenadas
    adminMapInstance = L.map('admin-dcti-map-container', {
        attributionControl: false
    }).setView([lat, lng], 17);

    // Sincronizado con el portal público: Servidor de Google Maps para referencias consistentes
    L.tileLayer('https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
        maxZoom: 20
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

async function restoreDefaultDcti() {
    if (typeof AlertService !== 'undefined') {
        const confirm = await AlertService.confirm(
            'Descartar Modificaciones',
            '¿Estás seguro que deseas descartar todo lo que has escrito o modificado en este formulario y recargar los últimos datos guardados oficialmente?',
            'Sí, descartar y recargar',
            'Cancelar'
        );
        if (!confirm) return;
    }
    
    if (typeof renderModule === 'function') {
        renderModule('admin-dcti');
        if (typeof AlertService !== 'undefined') {
            AlertService.notify('Formulario Restaurado', 'Se han vuelto a cargar los datos originales.', 'info');
        }
    }
}

// EXPORTACIONES GLOBALES
window.getLocalDcti = getLocalDcti;
window.saveLocalDcti = saveLocalDcti;
window.handleDctiSubmit = handleDctiSubmit;
window.previewOrganigrama = previewOrganigrama;
window.previewConsultasImage = previewConsultasImage;
window.initAdminMap = initAdminMap;
window.unlockAdminMap = unlockAdminMap;
window.resetAdminMap = resetAdminMap;
window.restoreDefaultDcti = restoreDefaultDcti;

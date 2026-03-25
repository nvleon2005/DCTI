/**
 * ADMIN DASHBOARD - NEWS LOGIC (Local-First v1.0.0)
 * Responsabilidad: Gestión de Datos de Noticias (CRUD), Persistencia y Modales.
 */

// --- GESTIÓN DE LOCALSTORAGE ---

function getLocalNews() {
    const news = localStorage.getItem('dcti_news');
    // Si no hay nada en localStorage, devolvemos los mock iniciales para que no aparezca vacío la primera vez
    if (!news && typeof MOCK_DATA !== 'undefined') {
        return MOCK_DATA.news;
    }
    return news ? JSON.parse(news) : [];
}

function saveLocalNews(newsArray) {
    try {
        localStorage.setItem('dcti_news', JSON.stringify(newsArray));
    } catch (e) {
        if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
            AlertService.notify('Almacenamiento Lleno', 'No hay espacio para guardar los datos. Intente borrar otros registros o subir imágenes más pequeñas.', 'error');
        } else {
            console.error('Error guardando en localStorage:', e);
        }
        throw e; // Relanzar para abortar la lógica subsiguiente (como cerrar el modal)
    }
}

let currentNewsCategoryFilter = 'Todas';

// --- LÓGICA DE MODAL DE NOTICIAS ---

function openNewsModal(id = null) {
    const modal = document.getElementById('news-modal');
    const form = document.getElementById('news-admin-form');
    const title = document.getElementById('news-modal-title');
    const editIdInput = document.getElementById('edit-news-id');

    if (!modal) return;

    modal.classList.remove('hidden');
    form.reset();

    if (id) {
        title.textContent = 'Editar Noticia';
        editIdInput.value = id;

        const allNews = getLocalNews();
        const newsItem = allNews.find(n => n.id == id);

        if (newsItem) {
            document.getElementById('admin-news-headline').value = newsItem.headline || '';
            document.getElementById('admin-news-category').value = newsItem.category || '';
            document.getElementById('admin-news-author').value = newsItem.author || '';
            document.getElementById('admin-news-summary').value = newsItem.summary || '';
            document.getElementById('admin-news-content').value = newsItem.content || '';
            document.getElementById('admin-news-media').value = newsItem.multimedia || '';
            document.getElementById('admin-news-date').value = newsItem.published || '';

            // Set checkboxes
            const status = newsItem.status || [];
            document.querySelectorAll('input[name="status"]').forEach(cb => {
                cb.checked = status.includes(cb.value);
            });
        }
    } else {
        title.textContent = 'Nueva Noticia';
        editIdInput.value = '';
        document.querySelectorAll('input[name="status"]').forEach(cb => cb.checked = false);
    }
}

function closeNewsModal() {
    const modal = document.getElementById('news-modal');
    if (modal) modal.classList.add('hidden');
}

// --- LISTENERS ---
document.addEventListener('change', async (e) => {
    if (e.target && e.target.id === 'admin-news-file') {
        const file = e.target.files[0];
        if (!file) return;

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            AlertService.notify('Archivo inválido', 'Por favor selecciona una imagen.', 'error');
            return;
        }

        try {
            const base64 = await encodeFileToBase64(file);
            document.getElementById('admin-news-media').value = base64;
            // Opcional: Mostrar preview
            const uploadArea = e.target.parentElement;
            if (uploadArea) {
                uploadArea.style.backgroundImage = `url(${base64})`;
                uploadArea.style.backgroundSize = 'cover';
                uploadArea.style.backgroundPosition = 'center';
                uploadArea.querySelector('i').style.display = 'none';
                uploadArea.querySelector('span').style.color = 'white';
                uploadArea.querySelector('span').style.textShadow = '0 1px 4px rgba(0,0,0,0.5)';
                uploadArea.querySelector('span').textContent = 'Imagen lista';
            }
        } catch (err) {
            AlertService.notify('Error', 'No se pudo procesar la imagen.', 'error');
        }
    }
});

function encodeFileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const MAX_WIDTH = 800;
                let width = img.width;
                let height = img.height;

                if (width > MAX_WIDTH) {
                    height = height * (MAX_WIDTH / width);
                    width = MAX_WIDTH;
                }

                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                // Compresión agresiva a WebP para cuidar localStorage
                resolve(canvas.toDataURL('image/webp', 0.7));
            };
            img.onerror = () => reject(new Error('Error al cargar la imagen en canvas'));
            img.src = e.target.result;
        };
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
}

async function handleNewsAdminSubmit(e) {
    e.preventDefault();

    const editId = document.getElementById('edit-news-id').value;
    const headline = document.getElementById('admin-news-headline').value.trim();
    const category = document.getElementById('admin-news-category').value;
    const author = document.getElementById('admin-news-author').value.trim();
    const summary = document.getElementById('admin-news-summary').value.trim();
    const content = document.getElementById('admin-news-content').value.trim();
    const media = document.getElementById('admin-news-media').value;
    const date = document.getElementById('admin-news-date').value;

    const status = Array.from(document.querySelectorAll('input[name="status"]:checked')).map(cb => cb.value);

    // VALIDACIÓN COMPLETA
    if (!headline || !category || !author || !summary || !content || !date || status.length === 0) {
        AlertService.notify('Campos Vacíos', 'Por favor complete todos los campos obligatorios (*) y seleccione al menos un estado.', 'warning');
        return;
    }

    if (!editId && !media) {
        AlertService.notify('Imagen Requerida', 'Toda noticia nueva debe poseer una imagen destacada. Por favor, suba una imagen.', 'warning');
        return;
    }

    let allNews = getLocalNews();

    if (editId) {
        // ACTUALIZAR
        const index = allNews.findIndex(n => n.id == editId);
        if (index !== -1) {
            allNews[index] = {
                ...allNews[index],
                headline,
                category,
                author,
                summary,
                content,
                multimedia: media || allNews[index].multimedia, // Mantener si no se subió una nueva
                published: date,
                status
            };
            AlertService.notify('Noticia Actualizada', 'Los cambios han sido guardados.', 'success');
        }
    } else {
        // AGREGAR
        const newId = allNews.length > 0 ? Math.max(...allNews.map(n => n.id)) + 1 : 1;
        const newNews = {
            id: newId,
            headline,
            category,
            author,
            summary,
            content,
            multimedia: media || 'assets/images/img8.jpg',
            published: date,
            status
        };
        allNews.push(newNews);
        AlertService.notify('Noticia Creada', 'La noticia ha sido publicada exitosamente.', 'success');
    }

    try {
        saveLocalNews(allNews);
        closeNewsModal();

        // Actualizar la vista si estamos en el módulo de noticias
        if (typeof renderModule === 'function') {
            MOCK_DATA.news = allNews;
            filterNewsAdmin('Todas'); // Reset to 'Todas' on save
        }
    } catch (e) {
        // Falla silenciosa controlada por el try catch de saveLocalNews
        console.warn("La persistencia fue abortada por falta de espacio.");
    }
}

async function deleteNews(id) {
    const confirmed = await AlertService.confirm(
        '¿Eliminar Noticia?',
        `¿Estás seguro de que deseas eliminar esta noticia permanentemente?`,
        'Eliminar',
        'Cancelar',
        true
    );

    if (!confirmed) return;

    let allNews = getLocalNews();
    const updatedNews = allNews.filter(n => n.id != id);

    saveLocalNews(updatedNews);
    AlertService.notify('Noticia Eliminada', 'La noticia ha sido removida.', 'success');

    if (typeof renderModule === 'function') {
        MOCK_DATA.news = updatedNews;
        filterNewsAdmin(currentNewsCategoryFilter);
    }
}

// --- FILTRADO DE NOTICIAS EN VIVO ---
function filterNewsAdmin(category) {
    if (typeof renderModule !== 'function') return;

    currentNewsCategoryFilter = category;

    // Delegar el renderizado al orquestador central (renderModule)
    // Se asume que interface-logic.js (o el futuro App.js) usará
    // currentNewsCategoryFilter para filtrar antes de renderizar.
    renderModule('news');
}

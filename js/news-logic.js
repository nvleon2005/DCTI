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
    localStorage.setItem('dcti_news', JSON.stringify(newsArray));
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
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
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
            multimedia: media || 'img/img8.jpg',
            published: date,
            status
        };
        allNews.push(newNews);
        AlertService.notify('Noticia Creada', 'La noticia ha sido publicada exitosamente.', 'success');
    }

    saveLocalNews(allNews);
    closeNewsModal();

    // Actualizar la vista si estamos en el módulo de noticias
    if (typeof renderModule === 'function') {
        MOCK_DATA.news = allNews;
        filterNewsAdmin('Todas'); // Reset to 'Todas' on save
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

    let allNews = getLocalNews();
    let filteredNews = allNews;

    if (category !== 'Todas') {
        filteredNews = allNews.filter(n => n.category === category);
    }

    // Usar la función de paginación o el propio render para inyectar con la misma lógica
    // Simulamos paginación en el filtrado si es simple:
    const mainContent = document.getElementById('content-area');
    if (!mainContent) {
        console.error("No se encontró el contenedor content-area");
        return;
    }

    // Engañamos levemente al render de Data inyectando sólo la categoría pedida y guardando la referencia para la UI
    const fakeData = {
        news: filteredNews,
        categoryFilter: category, // Para mantener el botón presionado
        pagination: { // Desactivar paginación virtual para la vista filtrada temporal o recalcular si hubiese más de 9
            items: filteredNews,
            currentPage: 1,
            totalPages: 1
        }
    };

    // Asumimos que NewsView existe en el contexto global cuando estamos en News
    if (typeof NewsView !== 'undefined') {
        mainContent.innerHTML = NewsView.render(fakeData);
    }
}

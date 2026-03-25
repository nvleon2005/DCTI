/**
 * Service/NewsService.js
 * Responsabilidad: Gestión de Datos de Noticias (CRUD) y Persistencia.
 */

const NewsController = {
    currentCategoryFilter: 'Todas',

    getLocalNews() {
        const news = localStorage.getItem('dcti_news');
        if (!news && typeof MOCK_DATA !== 'undefined') {
            return MOCK_DATA.news;
        }
        return news ? JSON.parse(news) : [];
    },

    saveLocalNews(newsArray) {
        localStorage.setItem('dcti_news', JSON.stringify(newsArray));
    },

    openNewsModal(id = null) {
        const modal = document.getElementById('news-modal');
        const form = document.getElementById('news-admin-form');
        const title = document.getElementById('news-modal-title');
        const editIdInput = document.getElementById('edit-news-id');

        if (!modal || !form) return;

        modal.classList.remove('hidden');
        form.reset();

        if (id) {
            if (title) title.textContent = 'Editar Noticia';
            if (editIdInput) editIdInput.value = id;

            const allNews = this.getLocalNews();
            const newsItem = allNews.find(n => n.id == id);

            if (newsItem) {
                document.getElementById('admin-news-headline').value = newsItem.headline || '';
                document.getElementById('admin-news-category').value = newsItem.category || '';
                document.getElementById('admin-news-author').value = newsItem.author || '';
                document.getElementById('admin-news-summary').value = newsItem.summary || '';
                document.getElementById('admin-news-content').value = newsItem.content || '';
                document.getElementById('admin-news-media').value = newsItem.multimedia || '';
                document.getElementById('admin-news-date').value = newsItem.published || '';

                const status = newsItem.status || [];
                document.querySelectorAll('input[name="status"]').forEach(cb => {
                    cb.checked = status.includes(cb.value);
                });
            }
        } else {
            if (title) title.textContent = 'Nueva Noticia';
            if (editIdInput) editIdInput.value = '';
            document.querySelectorAll('input[name="status"]').forEach(cb => cb.checked = false);
        }
    },

    closeNewsModal() {
        const modal = document.getElementById('news-modal');
        if (modal) modal.classList.add('hidden');
    },

    async handleNewsAdminSubmit(e) {
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

        if (!headline || !category || !author || !summary || !content || !date || status.length === 0) {
            AlertService.notify('Campos Vacíos', 'Complete todos los campos obligatorios.', 'warning');
            return;
        }

        let allNews = this.getLocalNews();

        if (editId) {
            const index = allNews.findIndex(n => n.id == editId);
            if (index !== -1) {
                allNews[index] = {
                    ...allNews[index],
                    headline, category, author, summary, content,
                    multimedia: media || allNews[index].multimedia,
                    published: date,
                    status
                };
                AlertService.notify('Actualizada', 'Noticia guardada.', 'success');
            }
        } else {
            const newId = allNews.length > 0 ? Math.max(...allNews.map(n => n.id)) + 1 : 1;
            allNews.push({
                id: newId, headline, category, author, summary, content,
                multimedia: media || 'assets/images/img8.jpg',
                published: date, status
            });
            AlertService.notify('Creada', 'Noticia publicada.', 'success');
        }

        this.saveLocalNews(allNews);
        this.closeNewsModal();

        if (typeof renderModule === 'function') {
            if (typeof MOCK_DATA !== 'undefined') MOCK_DATA.news = allNews;
            this.filterNewsAdmin('Todas');
        }
    },

    async deleteNews(id) {
        const confirmed = await AlertService.confirm('¿Eliminar?', '¿Seguro?', 'Eliminar', 'Cancelar', true);
        if (!confirmed) return;

        let allNews = this.getLocalNews();
        const updatedNews = allNews.filter(n => n.id != id);

        this.saveLocalNews(updatedNews);
        AlertService.notify('Eliminada', 'Noticia removida.', 'success');

        if (typeof renderModule === 'function') {
            if (typeof MOCK_DATA !== 'undefined') MOCK_DATA.news = updatedNews;
            this.filterNewsAdmin(this.currentCategoryFilter);
        }
    },

    filterNewsAdmin(category) {
        this.currentCategoryFilter = category;
        if (typeof renderModule === 'function') renderModule('news');
    }
};

// Global exports
window.openNewsModal = NewsController.openNewsModal.bind(NewsController);
window.closeNewsModal = NewsController.closeNewsModal.bind(NewsController);
window.handleNewsAdminSubmit = NewsController.handleNewsAdminSubmit.bind(NewsController);
window.deleteNews = NewsController.deleteNews.bind(NewsController);
window.filterNewsAdmin = NewsController.filterNewsAdmin.bind(NewsController);
window.getLocalNews = NewsController.getLocalNews.bind(NewsController);

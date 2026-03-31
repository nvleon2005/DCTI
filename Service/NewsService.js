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

                const auditContainer = document.getElementById('news-audit-container');
                if (auditContainer) {
                    const session = JSON.parse(localStorage.getItem('dcti_session')) || {};
                    const isAdmin = session.role === 'admin';
                    
                    let auditHtml = `
                        <div style="border-top: 1px solid var(--color-border); padding-top: 15px; margin-top: 10px;">
                            <h4 style="font-size: 0.9rem; color: var(--color-text-main); margin-bottom: 10px;">Información de Auditoría</h4>
                            <div style="display: flex; gap: 20px; font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 15px;">
                                <span><i class="fas fa-calendar-plus" style="margin-right: 5px;"></i> Creado: ${newsItem.createdAt ? new Date(newsItem.createdAt).toLocaleDateString('es-VE') : 'N/A'} por ${newsItem.createdBy || 'Sistema'}</span>
                                <span><i class="fas fa-edit" style="margin-right: 5px;"></i> Última act: ${newsItem.updatedAt ? new Date(newsItem.updatedAt).toLocaleDateString('es-VE') : 'N/A'} por ${newsItem.updatedBy || 'Sistema'}</span>
                            </div>
                    `;

                    if (isAdmin && newsItem.history && newsItem.history.length > 0) {
                        auditHtml += `
                            <details style="background: #f8fafc; border: 1px solid var(--color-border); border-radius: 6px; padding: 10px;">
                                <summary style="font-size: 0.85rem; font-weight: 600; cursor: pointer; color: var(--color-primary); margin-bottom: 5px;">Ver Historial de Cambios (${newsItem.history.length})</summary>
                                <ul style="list-style: none; padding: 0; margin: 10px 0 0 0; font-size: 0.8rem;">
                                    ${newsItem.history.map(h => `
                                        <li style="border-bottom: 1px dashed #e2e8f0; padding: 6px 0; display: flex; justify-content: space-between;">
                                            <span><b>${h.responsible}</b> (${h.action})</span>
                                            <span style="color: var(--color-text-muted);">${h.date} - ${h.fields}</span>
                                        </li>
                                    `).join('')}
                                </ul>
                            </details>
                        `;
                    }
                    auditHtml += `</div>`;
                    auditContainer.innerHTML = auditHtml;
                    auditContainer.style.display = 'block';
                }
            }
        } else {
            if (title) title.textContent = 'Nueva Noticia';
            if (editIdInput) editIdInput.value = '';
            document.querySelectorAll('input[name="status"]').forEach(cb => cb.checked = false);
            
            const auditContainer = document.getElementById('news-audit-container');
            if (auditContainer) {
                auditContainer.innerHTML = '';
                auditContainer.style.display = 'none';
            }
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
        const session = JSON.parse(localStorage.getItem('dcti_session')) || { name: 'Sistema' };
        const nowStr = new Date().toLocaleString('es-VE');

        if (editId) {
            const index = allNews.findIndex(n => n.id == editId);
            if (index !== -1) {
                const old = allNews[index];
                const changes = [];

                if (old.headline !== headline) changes.push('Titular');
                if (old.category !== category) changes.push('Categoría');
                if (old.author !== author) changes.push('Autor');
                if (old.summary !== summary) changes.push('Resumen');
                if (old.content !== content) changes.push('Contenido');
                if (old.published !== date) changes.push('Fecha');
                if (JSON.stringify(old.status) !== JSON.stringify(status)) changes.push('Estados');

                if (changes.length > 0) {
                    const logEntry = {
                        date: nowStr,
                        responsible: session.name || session.username || "Usuario",
                        action: "Edición",
                        fields: changes.join(', ')
                    };
                    allNews[index] = {
                        ...old,
                        headline, category, author, summary, content,
                        multimedia: media || old.multimedia,
                        published: date,
                        status,
                        updatedAt: new Date().toISOString(),
                        updatedBy: session.name || session.username || "Usuario",
                        history: [logEntry, ...(old.history || [])].slice(0, 15)
                    };
                    AlertService.notify('Actualizada', 'Noticia guardada y cambios registrados.', 'success');
                } else {
                    AlertService.notify('Sin Cambios', 'No hubo modificaciones.', 'info');
                    this.closeNewsModal();
                    return;
                }
            }
        } else {
            const newId = allNews.length > 0 ? Math.max(...allNews.map(n => n.id)) + 1 : 1;
            allNews.push({
                id: newId, headline, category, author, summary, content,
                multimedia: media || 'assets/images/img8.jpg',
                published: date, status,
                createdAt: new Date().toISOString(),
                createdBy: session.name || session.username || "Usuario",
                updatedAt: new Date().toISOString(),
                updatedBy: session.name || session.username || "Usuario",
                history: [{
                    date: nowStr,
                    responsible: session.name || session.username || "Usuario",
                    action: "Creación",
                    fields: "Todos"
                }]
            });
            AlertService.notify('Creada', 'Noticia publicada con registro de auditoría.', 'success');
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

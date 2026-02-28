const NewsView = {
    render: (data) => {
        const paginated = data.pagination;
        const news = paginated ? paginated.items : data.news;
        const today = new Date().toISOString().split('T')[0];

        return `
            <div class="view-container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <h2>Gestión de Noticias</h2>
                        <span style="font-size: 0.85rem; background: var(--color-surface-muted); padding: 4px 12px; border-radius: 20px; color: var(--color-text-muted); font-weight: 600;">
                            Total: ${data.news.length}
                        </span>
                    </div>
                    <button class="btn-action" onclick="openNewsModal()" title="Nueva Noticia" style="width: 45px; height: 45px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-plus" style="font-size: 1.1rem; margin: 0;"></i>
                    </button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-lg);">
                    ${news.map(n => {
            const isPublished = (n.status || []).includes('Publicada');
            return `
                        <div style="background: white; border-radius: var(--radius-md); border: 1px solid var(--color-border); overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 2px 4px rgba(0,0,0,0.02); position: relative;">
                            ${isPublished ? `
                                <div style="position: absolute; top: 12px; left: 12px; background: #22c55e; color: white; padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                                    <i class="fas fa-check-circle"></i> PUBLICADA
                                </div>
                            ` : ''}
                            <div style="height: 140px; background: #f1f5f9; overflow: hidden; position: relative;">
                                <img src="${n.multimedia || 'img/img8.jpg'}" style="width: 100%; height: 100%; object-fit: cover;">
                                <div style="position: absolute; top: 10px; right: 10px; display: flex; gap: 4px;">
                                    ${(n.status || []).map(s => `
                                        <span title="${s}" style="width: 8px; height: 8px; border-radius: 50%; background: ${s === 'Publicada' ? '#22c55e' : (s === 'Validada' ? '#3b82f6' : '#f59e0b')}"></span>
                                    `).join('')}
                                </div>
                            </div>
                            <div style="padding: var(--space-md); flex: 1; display: flex; flex-direction: column;">
                                <h3 style="font-size: 0.95rem; color: var(--color-text-main); margin-bottom: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 2.8em;">${n.headline}</h3>
                                <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 12px;">${n.published}</p>
                                <div style="display: flex; gap: 8px; margin-top: auto;">
                                    <button onclick="openNewsModal(${n.id})" title="Editar" style="flex: 1; background: none; border: 1px solid var(--color-border); padding: 8px; border-radius: 6px; cursor: pointer; color: var(--color-text-main); transition: 0.2s;"><i class="fas fa-edit"></i></button>
                                    <button onclick="deleteNews(${n.id})" title="Eliminar" style="flex: 1; background: none; border: 1px solid #fee2e2; color: #ef4444; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s;"><i class="fas fa-trash-alt"></i></button>
                                </div>
                            </div>
                        </div>
                    `}).join('')}
                </div>

                <!-- Paginación Footer -->
                ${paginated && paginated.totalPages > 1 ? `
                    <div style="display: flex; justify-content: center; align-items: center; gap: 15px; padding: 20px 0;">
                        <button onclick="changePage('news', ${paginated.currentPage - 1})" ${paginated.currentPage === 1 ? 'disabled' : ''} style="width: 35px; height: 35px; border: 1px solid var(--color-border); background: white; border-radius: 50%; cursor: ${paginated.currentPage === 1 ? 'default' : 'pointer'}; opacity: ${paginated.currentPage === 1 ? '0.3' : '1'}; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-chevron-left" style="font-size: 0.8rem;"></i>
                        </button>
                        <span style="font-size: 0.9rem; font-weight: 600; color: var(--color-text-main);">Página ${paginated.currentPage} de ${paginated.totalPages}</span>
                        <button onclick="changePage('news', ${paginated.currentPage + 1})" ${paginated.currentPage === paginated.totalPages ? 'disabled' : ''} style="width: 35px; height: 35px; border: 1px solid var(--color-border); background: white; border-radius: 50%; cursor: ${paginated.currentPage === paginated.totalPages ? 'default' : 'pointer'}; opacity: ${paginated.currentPage === paginated.totalPages ? '0.3' : '1'}; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-chevron-right" style="font-size: 0.8rem;"></i>
                        </button>
                    </div>
                ` : ''}

                <!-- Modal de Noticias -->
                <div id="news-modal" class="modal-overlay hidden">
                    <div class="modal-card" style="max-width: 600px; padding: 0; overflow: hidden;">
                        <div class="modal-header" style="padding: 20px; background: var(--color-sidebar); color: white; margin-bottom: 0;">
                            <div>
                                <h2 id="news-modal-title" style="margin: 0; font-size: 1.25rem;">Nueva Noticia</h2>
                                <p style="font-size: 0.8rem; color: rgba(255,255,255,0.7); margin: 5px 0 0 0;">Complete todos los campos obligatorios (*).</p>
                            </div>
                            <button class="close-modal" onclick="closeNewsModal()" style="color: white; opacity: 0.8; background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                        </div>
                        <form id="news-admin-form" onsubmit="handleNewsAdminSubmit(event)">
                            <input type="hidden" id="edit-news-id">
                            <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 1.5rem; padding: 25px;">
                                <div style="display: flex; flex-direction: column; gap: 1.2rem;">
                                    <div class="form-group">
                                        <label>Titular de la Noticia <span style="color: #ef4444;">*</span></label>
                                        <input type="text" id="admin-news-headline" placeholder="Ej: Nueva Beca para Investigadores" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Resumen de Portada <span style="color: #ef4444;">*</span></label>
                                        <input type="text" id="admin-news-summary" placeholder="Breve extracto para captar la atención..." required>
                                    </div>
                                    <div class="form-group">
                                        <label>Contenido Completo <span style="color: #ef4444;">*</span></label>
                                        <textarea id="admin-news-content" style="width: 100%; padding: 0.8rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); height: 180px; font-family: inherit; resize: vertical;" placeholder="Escriba la noticia íntegra aquí..." required></textarea>
                                    </div>
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 1.2rem;">
                                    <div class="form-group">
                                        <label>Autor <span style="color: #ef4444;">*</span></label>
                                        <input type="text" id="admin-news-author" placeholder="Nombre del autor" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Fecha de Publicación <span style="color: #ef4444;">*</span></label>
                                        <input type="date" id="admin-news-date" value="${today}" required>
                                    </div>
                                    <div class="form-group">
                                        <label>Imagen Destacada</label>
                                        <div style="position: relative; height: 100px; border: 2px dashed var(--color-border); border-radius: var(--radius-md); display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; overflow: hidden; transition: 0.2s;" class="upload-area">
                                            <input type="file" id="admin-news-file" accept="image/*" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;">
                                            <i class="fas fa-cloud-upload-alt" style="font-size: 1.5rem; color: var(--color-text-muted); margin-bottom: 5px;"></i>
                                            <span style="font-size: 0.75rem; color: var(--color-text-muted);">Subir imagen local</span>
                                            <input type="hidden" id="admin-news-media">
                                        </div>
                                    </div>
                                    <div class="form-group" style="margin-bottom: 0;">
                                        <label>Estados <span style="color: #ef4444;">*</span></label>
                                        <div style="display: flex; flex-direction: column; gap: 8px; background: #f8fafc; padding: 12px; border-radius: var(--radius-md); border: 1px solid var(--color-border);">
                                            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; font-weight: 500;"><input type="checkbox" name="status" value="Destacada"> Destacada</label>
                                            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; font-weight: 500;"><input type="checkbox" name="status" value="Validada"> Validada</label>
                                            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; font-weight: 500;"><input type="checkbox" name="status" value="Publicada"> Publicada</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn-secondary" onclick="closeNewsModal()" style="padding: 10px 20px; font-weight: 600;">Cancelar</button>
                                <button type="submit" class="btn-primary" style="padding: 10px 30px; font-weight: 700;">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            
        `;
    }
};

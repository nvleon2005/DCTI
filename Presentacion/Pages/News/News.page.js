const AdminNewsView = {
    render: (data) => {
        const paginated = data.pagination;
        const news = paginated ? paginated.items : data.news;
        const today = new Date().toISOString().split('T')[0];
        const currentCategory = (typeof currentNewsCategoryFilter !== 'undefined') ? currentNewsCategoryFilter : 'Todas';

        const categories = ['Regional', 'Nacional', 'Internacional', 'Local', 'Institucionales', 'Carrusel de Noticias'];

        const filterButtons = ['Todas', ...categories].map(cat => `
            <button onclick="if(typeof filterNewsAdmin === 'function') filterNewsAdmin('${cat}')" 
                style="padding: 6px 16px; border-radius: 20px; font-size: 0.85rem; font-weight: 600; cursor: pointer; border: 1px solid var(--color-border); transition: 0.2s; 
                ${currentCategory === cat ? 'background: var(--color-accent); color: white; border-color: var(--color-accent);' : 'background: white; color: var(--color-text-main);'}">
                ${cat}
            </button>
        `).join('');

        return `
            <div class="view-container">
                <div style="display: flex; flex-direction: column; gap: var(--space-md); margin-bottom: var(--space-md);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <h2>Gestión de Noticias</h2>
                            <span style="font-size: 0.85rem; background: var(--color-surface-muted); padding: 4px 12px; border-radius: 20px; color: var(--color-text-muted); font-weight: 600;">
                                Total: ${paginated ? paginated.totalItems : data.news.length}
                            </span>
                        </div>
                        <button class="btn-action" onclick="openNewsModal()" title="Nueva Noticia" style="width: 45px; height: 45px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center; background: var(--color-primary); color: white; border: none; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px rgba(100, 50, 255, 0.2);">
                            <i class="fas fa-plus" style="font-size: 1.1rem; margin: 0;"></i>
                        </button>
                    </div>

                    <hr style="border: none; border-top: 1px solid var(--color-border); margin: 0 0 var(--space-md) 0;">
                </div>

                <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px; margin-bottom: var(--space-lg);">
                    <div style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px; scrollbar-width: none; flex: 1;">
                        ${filterButtons}
                    </div>
                    <div style="display: flex; justify-content: flex-end; align-items: center; gap: 15px; flex-wrap: wrap; flex-shrink: 0;">
                        <select onchange="window.globalNewsStatusFilter = this.value; if(typeof changePage === 'function'){changePage('news', 1)} else {renderModule('news')}" style="padding: 0 32px 0 16px; height: 36px; border: 1px solid var(--color-border); border-radius: 20px; font-size: 0.85rem; background: white url('data:image/svg+xml;utf8,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;12&quot; height=&quot;12&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;%236b7280&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot;><polyline points=&quot;6 9 12 15 18 9&quot;></polyline></svg>') no-repeat right 12px center; cursor: pointer; box-sizing: border-box; appearance: none; -webkit-appearance: none; color: var(--color-text-main); font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.2s ease;">
                            <option value="Todos" ${window.globalNewsStatusFilter === 'Todos' || !window.globalNewsStatusFilter ? 'selected' : ''}>Todos los Estados</option>
                            <option value="Publicado" ${window.globalNewsStatusFilter === 'Publicado' || window.globalNewsStatusFilter === 'Publicada' ? 'selected' : ''}>Publicadas</option>
                            <option value="Borrador" ${window.globalNewsStatusFilter === 'Borrador' ? 'selected' : ''}>Borradores</option>
                        </select>
                    </div>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-lg);">
        ${news.map(n => {
            const statusArray = Array.isArray(n.status) ? n.status : (n.status ? [n.status] : []);
            const isPublished = statusArray.includes('Publicada') || statusArray.includes('Publicado');
            const categoryColor = n.category ? '#6366f1' : '#94a3b8'; // Indigo default, o gris si no tiene
            return `
                        <div style="background: white; border-radius: var(--radius-md); border: 1px solid var(--color-border); overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 2px 4px rgba(0,0,0,0.02); position: relative;">
                            ${isPublished ? `
                                <div style="position: absolute; top: 12px; left: 12px; background: #22c55e; color: white; padding: 2px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                                    <i class="fas fa-check-circle"></i> PUBLICADA
                                </div>
                            ` : ''}
                            <div style="height: 140px; background: #f1f5f9; overflow: hidden; position: relative;">
                                <img src="${Array.isArray(n.multimedia) && n.multimedia.length > 0 ? n.multimedia[0] : (n.multimedia || 'assets/images/img8.jpg')}" style="width: 100%; height: 100%; object-fit: cover;">
                                <div style="position: absolute; top: 10px; right: 10px; display: flex; gap: 4px;">
                                    ${statusArray.map(s => `
                                        <span title="${s}" style="width: 8px; height: 8px; border-radius: 50%; background: ${s === 'Publicada' || s === 'Publicado' ? '#22c55e' : (s === 'Validada' ? '#3b82f6' : '#f59e0b')}"></span>
                                    `).join('')}
                                </div>
                            </div>
                            <div style="padding: var(--space-md); flex: 1; display: flex; flex-direction: column;">
                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                    <span style="font-size: 0.7rem; background: ${categoryColor}15; color: ${categoryColor}; padding: 2px 8px; border-radius: 4px; font-weight: 700; border: 1px solid ${categoryColor}30;">
                                        ${n.category || 'Sin Categoría'}
                                    </span>
                                </div>
                                <h3 style="font-size: 0.95rem; color: var(--color-text-main); margin-bottom: 8px; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; height: 2.8em;">${n.headline}</h3>
                                <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 4px;">Publicada: ${n.published ? new Date(n.published).toLocaleDateString('es-VE') : ''}</p>
                                <p style="font-size: 0.75rem; color: var(--color-text-muted); margin-bottom: 12px; font-style: italic;">Última act: ${n.updatedAt ? new Date(n.updatedAt).toLocaleDateString('es-VE') : ''} por <b>${n.updatedBy || 'Sistema'}</b></p>
                                <div style="display: flex; gap: 8px; margin-top: auto;">
                                    <button onclick="openNewsModal(${n.id})" title="Editar" style="flex: 1; background: none; border: 1px solid var(--color-border); padding: 8px; border-radius: 6px; cursor: pointer; color: var(--color-text-main); transition: 0.2s;"><i class="fas fa-edit"></i></button>
                                    <button onclick="deleteNews(${n.id})" title="Eliminar" style="flex: 1; background: none; border: 1px solid #fee2e2; color: #ef4444; padding: 8px; border-radius: 6px; cursor: pointer; transition: 0.2s;"><i class="fas fa-trash-alt"></i></button>
                                </div>
                            </div>
                        </div>
                    `}).join('')}
                    ${news.length === 0 ? `
                        <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--color-text-muted); background: white; border-radius: var(--radius-md); border: 1px dashed var(--color-border);">
                            <i class="fas fa-newspaper" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                            <p>No hay noticias para mostrar en esta categoría.</p>
                        </div>
                    ` : ''}
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
                                        <label>Categoría <span style="color: #ef4444;">*</span></label>
                                        <select id="admin-news-category" required style="width: 100%; padding: 0.8rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-family: inherit; font-size: 0.9rem;">
                                            <option value="">Seleccione Categoría</option>
                                            <option value="Regional">Regional</option>
                                            <option value="Nacional">Nacional</option>
                                            <option value="Internacional">Internacional</option>
                                            <option value="Local">Local</option>
                                            <option value="Institucionales">Institucionales</option>
                                            <option value="Carrusel de Noticias">Carrusel de Noticias</option>
                                        </select>
                                    </div>
                                    <div class="form-group">
                                        <label>Ubicación en Carrusel Inicio</label>
                                        <select id="admin-news-carousel-placement" style="width: 100%; padding: 0.8rem; border: 1px solid var(--color-border); border-radius: var(--radius-md); font-family: inherit; font-size: 0.9rem;">
                                            <option value="Ninguno">Ninguno</option>
                                            <option value="Carrusel Principal">Carrusel Principal (Arriba)</option>
                                            <option value="Carrusel Noticias">Carrusel de Noticias (Medio)</option>
                                            <option value="Carrusel Miniaturas">Carrusel Miniaturas (Abajo)</option>
                                        </select>
                                    </div>

                                    <div class="form-group">
                                        <label>Contenido Completo <span style="color: #ef4444;">*</span></label>
                                        <textarea id="admin-news-content" style="width: 100%; padding: 0.8rem; border: 1.5px solid var(--color-border) !important; border-radius: var(--radius-md) !important; height: 180px; font-family: inherit; resize: vertical; background: white !important;" placeholder="Escriba la noticia íntegra aquí..." required></textarea>
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
                                        <label>Imágenes de la Noticia</label>
                                        <div style="position: relative; min-height: 100px; border: 2px dashed var(--color-border); border-radius: var(--radius-md); display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; overflow: hidden; transition: 0.2s; padding: 10px;" class="upload-area">
                                            <input type="file" id="admin-news-file" accept="image/*" multiple style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 2;">
                                            <i class="fas fa-images" style="font-size: 1.5rem; color: var(--color-text-muted); margin-bottom: 5px;"></i>
                                            <span style="font-size: 0.75rem; color: var(--color-text-muted); text-align: center;">Subir imágenes localmente<br>(Puede seleccionar múltiples)</span>
                                            <div id="admin-news-images-preview" style="display: flex; gap: 5px; flex-wrap: wrap; margin-top: 10px; z-index: 1; pointer-events: none;"></div>
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
                            <!-- Auditoría Section -->
                            <div id="news-audit-container" style="padding: 0 25px 20px 25px; display: none;"></div>
                            <div class="modal-footer">
                                <button type="button" class="btn-secondary" onclick="closeNewsModal()" style="padding: 10px 20px; font-weight: 600;">Cancelar</button>
                                <button type="submit" title="Guardar Cambios" class="btn-save-circle"><i class="fas fa-save"></i></button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            
        `;
    }
};

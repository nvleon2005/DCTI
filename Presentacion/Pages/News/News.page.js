const AdminNewsView = {
    render: (data) => {
        const paginated = data.pagination;
        const news = paginated ? paginated.items : data.news;
        const today = new Date().toISOString().split('T')[0];
        const currentCategory = (typeof currentNewsCategoryFilter !== 'undefined') ? currentNewsCategoryFilter : 'Todas';

        // Obtención global de datos para estadísticas puras
        const globalAllNews = typeof getLocalNews === 'function' ? getLocalNews() : [];
        const countPubHoy = globalAllNews.filter(n => {
            if (!n.published) return false;
            // Manejar tanto Date object como string ISO
            try { return new Date(n.published).toISOString().split('T')[0] === today; } catch(e) { return false; }
        }).length;
        const countAutores = [...new Set(globalAllNews.map(n => n.author).filter(Boolean))].length;

        const createStatCard = (icon, number, label, textColor, bgColor) => `
            <div class="dcti-stat-card">
                <div class="dcti-stat-card-header">
                    <div class="dcti-stat-card-icon" style="background: ${bgColor}; color: ${textColor};">
                        <i class="${icon}"></i>
                    </div>
                    <span class="dcti-stat-card-number">${number}</span>
                </div>
                <hr class="dcti-stat-card-divider">
                <p class="dcti-stat-card-label">${label}</p>
            </div>
        `;

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
                        </div>
                        <button class="btn-action" onclick="openNewsModal()" title="Nueva Noticia" style="width: 45px; height: 45px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center; background: var(--color-primary); color: white; border: none; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px rgba(100, 50, 255, 0.2);">
                            <i class="fas fa-plus" style="font-size: 1.1rem; margin: 0;"></i>
                        </button>
                    </div>

                    <div style="display: flex; flex-wrap: wrap; gap: 14px; margin-top: 5px;">
                        ${createStatCard('fas fa-newspaper', globalAllNews.length, 'Total Publicaciones', '#3b82f6', 'rgba(59, 130, 246, 0.1)')}
                        ${createStatCard('fas fa-calendar-day', countPubHoy, 'Publicado Hoy', '#10b981', 'rgba(16, 185, 129, 0.1)')}
                        ${createStatCard('fas fa-pen-nib', countAutores, 'Autores Activos', '#f59e0b', 'rgba(245, 158, 11, 0.1)')}
                    </div>

                    <hr style="border: none; border-top: 1px solid var(--color-border); margin: 0 0 var(--space-md) 0;">
                </div>

                <div style="display: flex; flex-direction: column; gap: 12px; margin-bottom: var(--space-lg);">
                    <div style="display: flex; gap: 10px; overflow-x: auto; padding-bottom: 5px; scrollbar-width: none;">
                        ${filterButtons}
                    </div>
                    <div style="display: flex; justify-content: flex-end; align-items: center; gap: 15px; flex-wrap: wrap;">
                        <div style="position: relative; display: flex; align-items: center; background: white; border-radius: 20px; padding: 4px 14px; border: 1px solid var(--color-border); transition: all 0.2s; height: 36px; box-sizing: border-box; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                            <i class="fas fa-search" style="font-size: 0.8rem; color: var(--color-text-muted); margin-right: 8px;"></i>
                            <input type="text" id="filter-news-search" placeholder="Buscar Noticia..." oninput="window.lastFocusedInput = this.id; window.globalNewsSearch = this.value; window.debouncedRenderModule('news');" value="${window.globalNewsSearch || ''}" style="background: transparent; border: none; color: var(--color-text-main); width: 140px; font-size: 0.85rem; outline: none; font-weight: 500;">
                        </div>
                        <select onchange="window.globalNewsStatusFilter = this.value; if(typeof changePage === 'function'){changePage('news', 1)} else {renderModule('news')}" style="padding: 0 32px 0 16px; height: 36px; border: 1px solid var(--color-border); border-radius: 20px; font-size: 0.85rem; background: white url('data:image/svg+xml;utf8,<svg xmlns=&quot;http://www.w3.org/2000/svg&quot; width=&quot;12&quot; height=&quot;12&quot; viewBox=&quot;0 0 24 24&quot; fill=&quot;none&quot; stroke=&quot;%236b7280&quot; stroke-width=&quot;2&quot; stroke-linecap=&quot;round&quot; stroke-linejoin=&quot;round&quot;><polyline points=&quot;6 9 12 15 18 9&quot;></polyline></svg>') no-repeat right 12px center; cursor: pointer; box-sizing: border-box; appearance: none; -webkit-appearance: none; color: var(--color-text-main); font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.2s ease;">
                            <option value="Todos" ${window.globalNewsStatusFilter === 'Todos' || !window.globalNewsStatusFilter ? 'selected' : ''}>Todos los Estados</option>
                            <option value="Publicado" ${window.globalNewsStatusFilter === 'Publicado' || window.globalNewsStatusFilter === 'Publicada' ? 'selected' : ''}>Publicadas</option>
                            <option value="Borrador" ${window.globalNewsStatusFilter === 'Borrador' ? 'selected' : ''}>Borradores</option>
                        </select>
                        <div style="display: flex; align-items: center; gap: 8px;">
                            <span style="color: var(--color-text-muted); font-size: 0.85rem; font-weight: 600;"><i class="fas fa-calendar-alt"></i> Pub:</span>
                            <input type="date" onchange="window.globalNewsDateFrom = this.value; if(typeof changePage === 'function'){changePage('news', 1)} else {renderModule('news')}" value="${window.globalNewsDateFrom || ''}" style="padding: 0 12px; height: 36px; border: 1px solid var(--color-border); border-radius: 20px; font-size: 0.85rem; color: var(--color-text-main); font-weight: 500; background: white; box-sizing: border-box;" title="Desde">
                            <span style="color: var(--color-text-muted); font-size: 0.85rem;">a</span>
                            <input type="date" onchange="window.globalNewsDateTo = this.value; if(typeof changePage === 'function'){changePage('news', 1)} else {renderModule('news')}" value="${window.globalNewsDateTo || ''}" style="padding: 0 12px; height: 36px; border: 1px solid var(--color-border); border-radius: 20px; font-size: 0.85rem; color: var(--color-text-main); font-weight: 500; background: white; box-sizing: border-box;" title="Hasta">
                        </div>
                    </div>
                </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: var(--space-md); margin-bottom: var(--space-lg);">
        ${news.map(n => {
            const statusArray = Array.isArray(n.status) ? n.status : (n.status ? [n.status] : []);
            const isPublished = statusArray.includes('Publicada') || statusArray.includes('Publicado');
            const imageUrl = Array.isArray(n.multimedia) && n.multimedia.length > 0 ? n.multimedia[0] : (n.multimedia || 'assets/images/img8.jpg');
            return window.AdminTemplate.Card({
                id: n.id,
                title: n.headline,
                image: imageUrl,
                badge: { text: isPublished ? 'Publicada' : 'Borrador', type: isPublished ? 'success' : 'default' },
                module: 'news',
                onEdit: 'openNewsModal(' + n.id + ')',
                onDelete: 'deleteNews(' + n.id + ')'
            });
        }).join('')}
                    ${news.length === 0 ? `
                        <div style="grid-column: 1 / -1; padding: 40px; text-align: center; color: var(--color-text-muted); background: white; border-radius: var(--radius-md); border: 1px dashed var(--color-border);">
                            <i class="fas fa-newspaper" style="font-size: 3rem; margin-bottom: 15px; opacity: 0.5;"></i>
                            <p>No hay noticias para mostrar en esta categoría.</p>
                        </div>
                    ` : ''}
                </div>

                <!-- Paginación Footer -->
                ${paginated ? window.AdminTemplate.Pagination('news', paginated.currentPage, paginated.totalPages) : ''}

                <!-- Modal de Noticias -->
                <div id="news-modal" class="modal-overlay hidden">
                    <div class="modal-card" style="max-width: 1000px; width: 95%; padding: 0; overflow: hidden;">
                        <div class="modal-header" style="padding: 20px; background: var(--color-sidebar); color: white; margin-bottom: 0;">
                            <div>
                                <h2 id="news-modal-title" style="margin: 0; font-size: 1.25rem;">Nueva Noticia</h2>
                                <p style="font-size: 0.8rem; color: rgba(255,255,255,0.7); margin: 5px 0 0 0;">Complete todos los campos obligatorios (*).</p>
                            </div>
                            <button class="close-modal" onclick="closeNewsModal()" style="color: white; opacity: 0.8; background: none; border: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                        </div>
                        <form id="news-admin-form" onsubmit="handleNewsAdminSubmit(event)" style="padding: 25px; max-height: 85vh; overflow-y: auto;">
                            <input type="hidden" id="edit-news-id">
                            <div style="display: grid; grid-template-columns: 38% 1fr; gap: 25px;">
                                <!-- COLUMNA IZQUIERDA: IMÁGENES -->
                                <div style="display: flex; flex-direction: column;">
                                    <label style="display: block; margin-bottom: 8px; font-size: 0.9rem; color: var(--color-text-muted);">Añadir imágenes</label>
                                    <div style="position: relative; width: 100%; aspect-ratio: 4/3; background: #e2e8f0; border-radius: 8px; margin-bottom: 16px; overflow: hidden; border: 2px dashed var(--color-border);" id="admin-news-preview-container">
                                        <div id="admin-news-preview" style="position: absolute; inset: 0; background-position: center; background-size: cover; filter: blur(10px) brightness(0.9); z-index: 0; display: none;"></div>
                                        <img id="admin-news-preview-img" style="position: absolute; inset: 0; width: 100%; height: 100%; object-fit: contain; z-index: 1; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); display: none;" src="">
                                        <div style="position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; z-index: 2; pointer-events: none;">
                                            <i class="fas fa-image placeholder-icon" id="admin-news-icon" style="font-size: 2rem; color: #94a3b8;"></i>
                                        </div>
                                        <input type="file" id="admin-news-file" accept="image/*" multiple style="position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer; z-index: 10;">
                                        <input type="hidden" id="admin-news-media">
                                        <button type="button" onclick="document.getElementById('admin-news-file').click()" style="position: absolute; bottom: 5px; right: 5px; width: 36px; height: 36px; border-radius: 50%; background: #2563eb; color: white; border: none; font-size: 1.5rem; display: flex; align-items: center; justify-content: center; z-index: 11; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor: pointer;" title="Subir Imagen">+</button>
                                    </div>
                                    
                                    <label style="display: block; margin-bottom: 10px; font-size: 0.9rem; color: var(--color-text-muted);">Publicadas</label>
                                    <div id="admin-news-images-preview" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px;"></div>
                                </div>
                                
                                <!-- COLUMNA DERECHA: DATOS -->
                                <div style="display: flex; flex-direction: column; gap: 15px;">
                                    <div class="form-group">
                                        <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Titular de la Noticia <span style="color: #ef4444;">*</span></label>
                                        <input type="text" id="admin-news-headline" placeholder="Ej: Nueva Beca para Investigadores" style="width: 100%; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px;" required>
                                    </div>
                                    
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                        <div class="form-group">
                                            <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Categoría <span style="color: #ef4444;">*</span></label>
                                            <select id="admin-news-category" required style="width: 100%; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px; background-color: white;">
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
                                            <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Ubicación en Inicio</label>
                                            <select id="admin-news-carousel-placement" style="width: 100%; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px; background-color: white;">
                                                <option value="Ninguno">Ninguno</option>
                                                <option value="Carrusel Principal">Carrusel Principal (Arriba)</option>
                                                <option value="Carrusel Noticias">Carrusel de Noticias (Medio)</option>
                                                <option value="Carrusel Miniaturas">Carrusel Miniaturas (Abajo)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                                        <div class="form-group">
                                            <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Autor <span style="color: #ef4444;">*</span></label>
                                            <input type="text" id="admin-news-author" placeholder="Nombre del autor" style="width: 100%; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px;" required>
                                        </div>
                                        <div class="form-group">
                                            <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Fecha Publicación <span style="color: #ef4444;">*</span></label>
                                            <input type="date" id="admin-news-date" value="${today}" style="width: 100%; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px;" required>
                                        </div>
                                    </div>
                                    <div class="form-group" style="flex-grow: 1;">
                                        <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Contenido Completo <span style="color: #ef4444;">*</span></label>
                                        <textarea id="admin-news-content" style="width: 100%; padding: 10px; border: 1px solid var(--color-border) !important; border-radius: 6px !important; height: 160px; font-family: inherit; resize: vertical; background: white !important;" placeholder="Escriba la noticia íntegra aquí..." required></textarea>
                                    </div>
                                    <div class="form-group" style="margin-bottom: 0;">
                                        <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Estados <span style="color: #ef4444;">*</span></label>
                                        <div style="display: inline-flex; gap: 15px; background: #f8fafc; padding: 10px 14px; border-radius: 6px; border: 1px solid var(--color-border); flex-wrap: wrap;">
                                            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; font-weight: 500;"><input type="checkbox" name="status" value="Destacada"> Destacada</label>
                                            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; font-weight: 500;"><input type="checkbox" name="status" value="Validada"> Validada</label>
                                            <label style="display: flex; align-items: center; gap: 8px; font-size: 0.85rem; cursor: pointer; font-weight: 500;"><input type="checkbox" name="status" value="Publicada"> Publicada</label>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            ${window.AdminTemplate.ModalFooter('closeNewsModal()', 'news-admin-form')}
                        </form>
                    </div>
                </div>
            </div>
            
        `;
    }
};

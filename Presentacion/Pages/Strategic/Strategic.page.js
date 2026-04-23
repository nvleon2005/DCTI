const StrategicView = {
    render: (data) => {
        const paginated = data.pagination;
        const areas = paginated ? paginated.items : data.strategic;
        // Obtención global de datos para estadísticas precisas reales
        const globalAllStrategic = typeof getLocalStrategic === 'function' ? getLocalStrategic() : [];
        const countLideres = [...new Set(globalAllStrategic.map(s => s.responsible).filter(r => r && r !== 'No Asignado'))].length;

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

        return `
            <div class="view-container">
                <div style="display: flex; flex-direction: column; gap: var(--space-md); margin-bottom: var(--space-md);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <h2>Áreas y Ejes Estratégicos</h2>
                        </div>
                        <button class="btn-action" onclick="openStrategicModal()" title="Nueva Área" style="width: 45px; height: 45px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-plus" style="font-size: 1.1rem; margin: 0;"></i>
                        </button>
                    </div>
                    
                    <div style="display: flex; flex-wrap: wrap; gap: 14px; margin-top: 5px;">
                        ${createStatCard('fas fa-sitemap', globalAllStrategic.length, 'Líneas Estratégicas', '#3b82f6', 'rgba(59, 130, 246, 0.1)')}
                        ${createStatCard('fas fa-user-md', countLideres, 'Líderes de Área', '#10b981', 'rgba(16, 185, 129, 0.1)')}
                    </div>

                    <div style="display: flex; justify-content: flex-start; align-items: center; gap: 15px; flex-wrap: wrap;">
                        <div style="position: relative; display: flex; align-items: center; background: white; border-radius: 20px; padding: 4px 14px; border: 1px solid var(--color-border); transition: all 0.2s; height: 36px; box-sizing: border-box; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                            <i class="fas fa-search" style="font-size: 0.8rem; color: var(--color-text-muted); margin-right: 8px;"></i>
                            <input type="text" id="filter-strategic-search" placeholder="Buscar Área..." oninput="window.lastFocusedInput = this.id; window.globalStrategicSearch = this.value; window.debouncedRenderModule('strategic');" value="${window.globalStrategicSearch || ''}" style="background: transparent; border: none; color: var(--color-text-main); width: 220px; font-size: 0.85rem; outline: none; font-weight: 500;">
                        </div>
                    </div>
                    
                    <hr style="border: none; border-top: 1px solid var(--color-border); margin: 0 0 var(--space-md) 0;">
                </div>

        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-md);">
                    ${areas.map(s => {
            return window.AdminTemplate.Card({
                id: s.id,
                title: s.area || s.title || 'Área Estratégica',
                image: s.image || 'assets/images/img4.jpg',
                badge: { text: s.responsible || 'Responsable', type: 'info' },
                module: 'strategic',
                onEdit: `openStrategicModal('${s.id}')`,
                onDelete: `deleteStrategic('${s.id}')`
            });
        }).join('')}
                </div>

                <!-- Paginación Footer -->
                ${paginated ? window.AdminTemplate.Pagination('strategic', paginated.currentPage, paginated.totalPages) : ''}

                <!-- Modal de Áreas -->
                <div id="strategic-modal" class="modal-overlay hidden">
                    <div class="modal-card" style="max-width: 850px; width: 90%; padding: 0;">
                        <div class="modal-header" style="background: var(--grad-primary); color: white; padding: 15px 20px;">
                            <h2 id="strategic-modal-title" style="margin: 0; font-size: 1.1rem;">Área Estratégica</h2>
                            <button class="close-modal" onclick="closeStrategicModal()" style="color: white; border: none; background: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                        </div>
                        <form id="strategic-admin-form" onsubmit="handleStrategicSubmit(event)" style="padding: 25px;">
                            <input type="hidden" id="edit-strategic-id">
                            
                            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 350px), 1fr)); gap: 30px; box-sizing: border-box;">
                                <!-- Columna Izquierda: Imagen y Carrusel -->
                                <div style="display: flex; flex-direction: column;">
                                    <label style="display: block; margin-bottom: 8px; font-size: 0.9rem; color: var(--color-text-muted);">Imagen Principal</label>
                                    <div style="position: relative; width: 100%; aspect-ratio: 16/9; background: #e2e8f0; border-radius: 8px; margin-bottom: 20px;">
                                        <div id="admin-strategic-preview" style="width: 100%; height: 100%; border-radius: 8px; background-color: #cbd5e1; background-position: center; background-size: cover; position: relative; border: 2px dashed var(--color-border); display: flex; align-items: center; justify-content: center;">
                                            <input type="file" id="admin-strategic-file" accept="image/*" style="opacity: 0; position: absolute; width: 100%; height: 100%; cursor: pointer; z-index: 10;">
                                            <i class="fas fa-image placeholder-icon" id="admin-strategic-placeholder-icon" style="font-size: 2rem; color: #94a3b8; pointer-events: none;"></i>
                                        </div>
                                        <button type="button" onclick="document.getElementById('admin-strategic-file').click()" style="position: absolute; bottom: -15px; right: -15px; width: 36px; height: 36px; border-radius: 50%; background: #2563eb; color: white; border: none; font-size: 1.5rem; display: flex; align-items: center; justify-content: center; z-index: 11; box-shadow: 0 4px 6px rgba(0,0,0,0.1); cursor: pointer;" title="Subir Imagen">+</button>
                                    </div>
                                </div>

                                <!-- Columna Derecha: Formulario -->
                                <div style="display: flex; flex-direction: column; gap: 15px;">
                                    <div class="form-group">
                                        <label style="display: block; margin-bottom: 8px; font-size: 0.9rem; color: var(--color-primary); font-weight: 700;">Título <span style="color: #ef4444;">*</span></label>
                                        <input type="text" id="admin-strategic-name" placeholder="Ej: Energía Renovable" style="width: 100%; padding: 12px; border: 1.5px solid var(--color-border); border-radius: 6px; font-size: 0.95rem; background: #ebf0f7;" required>
                                    </div>

                                    <div class="form-group">
                                        <label style="display: block; margin-bottom: 8px; font-size: 0.9rem; color: var(--color-primary); font-weight: 700;">Descripción <span style="color: #ef4444;">*</span></label>
                                        <textarea id="admin-strategic-description" placeholder="Resumen de objetivos y alcance..." style="width: 100%; padding: 12px; border: 1.5px solid var(--color-border); border-radius: 6px; font-size: 0.95rem; height: 180px; resize: vertical; background: #ebf0f7;" required></textarea>
                                    </div>

                                    <div class="form-group">
                                        <label style="display: block; margin-bottom: 8px; font-size: 0.9rem; color: var(--color-primary); font-weight: 700;">Responsable <span style="color: #ef4444;">*</span></label>
                                        <input type="text" id="admin-strategic-responsible" placeholder="Nombre completo" style="width: 100%; padding: 12px; border: 1.5px solid var(--color-border); border-radius: 6px; font-size: 0.95rem; background: #ebf0f7;" required>
                                    </div>
                                    
                                    ${window.AdminTemplate.ModalFooter('closeStrategicModal()', 'strategic-admin-form')}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            `;
    }
};

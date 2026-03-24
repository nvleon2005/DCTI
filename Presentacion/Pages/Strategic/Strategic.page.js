const StrategicView = {
    render: (data) => {
        const paginated = data.pagination;
        const areas = paginated ? paginated.items : data.strategic;
        return `
            <div class="view-container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <h2>Áreas y Ejes Estratégicos</h2>
                        <span style="font-size: 0.85rem; background: var(--color-surface-muted); padding: 4px 12px; border-radius: 20px; color: var(--color-text-muted); font-weight: 600;">
                            Total: ${paginated ? paginated.totalItems : data.strategic.length}
                        </span>
                    </div>
                    <button class="btn-action" onclick="openStrategicModal()" title="Nueva Área" style="width: 45px; height: 45px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-plus" style="font-size: 1.1rem; margin: 0;"></i>
                    </button>
                </div>
                <hr style="border: none; border-top: 1px solid var(--color-border); margin: 0 0 var(--space-md) 0;">

                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-md);">
                    ${areas.map(s => `
                        <div style="background: white; border-radius: var(--radius-md); border: 1px solid var(--color-border); overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                            <div style="height: 120px; background: #f1f5f9; position: relative; overflow: hidden;">
                                <img src="${s.image || 'Assets/images/img4.jpg'}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.8;" onerror="this.src='Assets/images/img4.jpg'">
                                <div style="position: absolute; bottom: 0; left: 0; width: 100%; padding: 10px; background: linear-gradient(transparent, rgba(0,0,0,0.6)); color: white;">
                                    <h3 style="font-size: 1rem; margin: 0;">${s.area}</h3>
                                </div>
                            </div>
                            <div style="padding: 15px; flex: 1; display: flex; flex-direction: column;">
                                <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 10px; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                                    ${s.description || 'Sin descripción disponible.'}
                                </p>
                                <div style="margin-top: auto; padding-top: 10px; border-top: 1px solid #f1f5f9;">
                                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                                        <span style="font-size: 0.75rem; color: var(--color-text-main); font-weight: 600;">
                                            <i class="fas fa-user-tie" style="margin-right: 5px;"></i>${s.responsible}
                                        </span>
                                        <div style="display: flex; gap: 5px;">
                                            <button onclick="openStrategicModal(${s.id})" title="Editar" style="background: none; border: 1px solid var(--color-border); padding: 5px 8px; border-radius: 4px; cursor: pointer; color: var(--color-text-main);"><i class="fas fa-edit" style="font-size: 0.8rem;"></i></button>
                                            <button onclick="deleteStrategic(${s.id})" title="Eliminar" style="background: none; border: 1px solid #fee2e2; color: #ef4444; padding: 5px 8px; border-radius: 4px; cursor: pointer;"><i class="fas fa-trash-alt" style="font-size: 0.8rem;"></i></button>
                                        </div>
                                    </div>
                                    ${s.audit ? `
                                        <p style="font-size: 0.65rem; color: var(--color-text-muted); margin: 0; font-style: italic;">
                                            <i class="fas fa-history" style="margin-right: 3px;"></i> Ult. mod: ${s.audit.updatedAt} por ${s.audit.updatedBy}
                                        </p>
                                    ` : ''}
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Paginación Footer -->
                ${paginated && paginated.totalPages > 1 ? `
                    <div style="display: flex; justify-content: center; align-items: center; gap: 15px; padding: 20px 0;">
                        <button onclick="changePage('strategic', ${paginated.currentPage - 1})" ${paginated.currentPage === 1 ? 'disabled' : ''} style="width: 35px; height: 35px; border: 1px solid var(--color-border); background: white; border-radius: 50%; cursor: ${paginated.currentPage === 1 ? 'default' : 'pointer'}; opacity: ${paginated.currentPage === 1 ? '0.3' : '1'}; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-chevron-left" style="font-size: 0.8rem;"></i>
                        </button>
                        <span style="font-size: 0.9rem; font-weight: 600; color: var(--color-text-main);">Página ${paginated.currentPage} de ${paginated.totalPages}</span>
                        <button onclick="changePage('strategic', ${paginated.currentPage + 1})" ${paginated.currentPage === paginated.totalPages ? 'disabled' : ''} style="width: 35px; height: 35px; border: 1px solid var(--color-border); background: white; border-radius: 50%; cursor: ${paginated.currentPage === paginated.totalPages ? 'default' : 'pointer'}; opacity: ${paginated.currentPage === paginated.totalPages ? '0.3' : '1'}; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-chevron-right" style="font-size: 0.8rem;"></i>
                        </button>
                    </div>
                ` : ''}

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
                                    
                                    <div style="margin-top: auto; display: flex; gap: 10px;">
                                        <button type="submit" class="btn-primary" style="padding: 10px 24px; background: #16a34a;">Guardar Área</button>
                                        <button type="button" class="btn-secondary" onclick="closeStrategicModal()" style="padding: 10px 24px;">Cancelar</button>
                                    </div>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            `;
    }
};

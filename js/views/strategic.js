const StrategicView = {
    render: (data) => {
        const areas = data.strategic;
        return `
            <div class="view-container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <h2>Áreas y Ejes Estratégicos</h2>
                        <span style="font-size: 0.85rem; background: var(--color-surface-muted); padding: 4px 12px; border-radius: 20px; color: var(--color-text-muted); font-weight: 600;">
                            Total: ${areas.length}
                        </span>
                    </div>
                    <button class="btn-action" onclick="openStrategicModal()" title="Nueva Área" style="width: 45px; height: 45px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-plus" style="font-size: 1.1rem; margin: 0;"></i>
                    </button>
                </div>

                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: var(--space-md);">
                    ${areas.map(s => `
                        <div style="background: white; border-radius: var(--radius-md); border: 1px solid var(--color-border); overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                            <div style="height: 120px; background: #f1f5f9; position: relative; overflow: hidden;">
                                <img src="${s.image || 'img/img4.jpg'}" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.8;">
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

                <!-- Modal de Áreas -->
                <div id="strategic-modal" class="modal-overlay hidden">
                    <div class="modal-card" style="max-width: 550px; padding: 0;">
                        <div class="modal-header" style="background: var(--grad-primary); color: white; padding: 15px 20px;">
                            <h2 id="strategic-modal-title" style="margin: 0; font-size: 1.1rem;">Área Estratégica</h2>
                            <button class="close-modal" onclick="closeStrategicModal()" style="color: white; border: none; background: none; font-size: 1.5rem; cursor: pointer;">&times;</button>
                        </div>
                        <form id="strategic-admin-form" onsubmit="handleStrategicSubmit(event)" style="padding: 20px;">
                            <input type="hidden" id="edit-strategic-id">
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Nombre del Área <span style="color: #ef4444;">*</span></label>
                                <input type="text" id="admin-strategic-name" placeholder="Ej: Energía Renovable" style="width: 100%; padding: 8px; border: 1px solid var(--color-border); border-radius: 6px;" required>
                            </div>
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Responsable <span style="color: #ef4444;">*</span></label>
                                <input type="text" id="admin-strategic-responsible" placeholder="Nombre completo" style="width: 100%; padding: 8px; border: 1px solid var(--color-border); border-radius: 6px;" required>
                            </div>
                            <div class="form-group" style="margin-bottom: 15px;">
                                <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Descripción <span style="color: #ef4444;">*</span></label>
                                <textarea id="admin-strategic-description" placeholder="Resumen de objetivos y alcance..." style="width: 100%; height: 100px; padding: 8px; border: 1px solid var(--color-border); border-radius: 6px; resize: none;" required></textarea>
                            </div>
                            <div class="form-group" style="margin-bottom: 20px;">
                                <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Imagen Representativa</label>
                                <div id="admin-strategic-preview" style="height: 120px; border: 2px dashed var(--color-border); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; position: relative;">
                                    <input type="file" id="admin-strategic-file" accept="image/*" style="position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer;">
                                    <i class="fas fa-image" style="font-size: 1.5rem; color: #cbd5e1;"></i>
                                    <span style="font-size: 0.75rem; color: #94a3b8; margin-top: 5px;">Haz clic para subir imagen</span>
                                    <input type="hidden" id="admin-strategic-media">
                                </div>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn-secondary" onclick="closeStrategicModal()">Cancelar</button>
                                <button type="submit" class="btn-primary">Guardar Área</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            `;
    }
};

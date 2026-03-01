const DctiView = {
    render: (data) => {
        const dcti = data.dcti;
        return `
            <div class="view-container" style="overflow-x: hidden; padding: 15px;">
                <div style="background: white; padding: var(--space-xl); border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 800px; width: 100%; box-sizing: border-box; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <div style="margin-bottom: var(--space-lg); border-bottom: 2px solid var(--color-primary); display: inline-block;">
                        <h2 style="margin: 0; color: var(--color-text-main);">Gestión de Información Institucional</h2>
                    </div>
                    
                    <form id="dcti-admin-form" style="display: flex; flex-direction: column; gap: var(--space-md); width: 100%;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)); gap: var(--space-xl); box-sizing: border-box;">
                            
                            <!-- Columna Izquierda: Textos -->
                            <div style="display: flex; flex-direction: column; gap: var(--space-md);">
                                <div class="form-group">
                                    <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--color-primary);">Reseña Institucional <span style="color: #ef4444;">*</span></label>
                                    <textarea id="admin-dcti-review" style="width: 100%; padding: 12px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.95rem; height: 120px; resize: vertical;" required>${dcti.review}</textarea>
                                </div>
                                <div class="form-group">
                                    <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--color-primary);">Misión <span style="color: #ef4444;">*</span></label>
                                    <textarea id="admin-dcti-mission" style="width: 100%; padding: 12px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.95rem; height: 90px; resize: vertical;" required>${dcti.mission}</textarea>
                                </div>
                                <div class="form-group">
                                    <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--color-primary);">Visión <span style="color: #ef4444;">*</span></label>
                                    <textarea id="admin-dcti-vision" style="width: 100%; padding: 12px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.95rem; height: 90px; resize: vertical;" required>${dcti.vision}</textarea>
                                </div>
                            </div>
                            
                            <!-- Columna Derecha: Organigrama -->
                            <div style="display: flex; flex-direction: column;">
                                <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--color-primary);">Añadir imagen: Organigrama Institucional <span style="color: var(--color-text-muted); font-weight: 400; font-size: 0.8rem;">(Opcional)</span></label>
                                <div style="position: relative; width: 100%; height: 280px; background: #eaecf1; border-radius: 8px; border: 2px dashed var(--color-border); display: flex; align-items: center; justify-content: center; overflow: visible;">
                                    <img id="admin-dcti-organigrama-preview" src="${dcti.organigrama || ''}" style="width: 100%; height: 100%; object-fit: contain; border-radius: 8px; display: ${dcti.organigrama ? 'block' : 'none'};">
                                    <input type="file" id="admin-dcti-organigrama-input" accept="image/*" style="display: none;" onchange="typeof previewOrganigrama === 'function' ? previewOrganigrama(event) : null">
                                    <button type="button" onclick="document.getElementById('admin-dcti-organigrama-input').click()" style="position: absolute; bottom: -12px; right: -12px; width: 36px; height: 36px; border-radius: 50%; background: #2563eb; color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3); font-size: 1.2rem; transition: background 0.2s; z-index: 10;" title="Subir Organigrama">
                                        +
                                    </button>
                                </div>
                                <div style="margin-top: 15px; font-size: 0.8rem; color: var(--color-text-muted);">
                                    La imagen será escalada automáticamente para no afectar el rendimiento del repositorio.
                                </div>
                            </div>

                        </div>
                        
                        <!-- Actions -->
                        <div style="margin-top: var(--space-lg); padding-top: var(--space-md); border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end;">
                            <button type="submit" class="btn-primary" style="padding: 12px 30px;">
                                <i class="fas fa-save" style="margin-right: 8px;"></i> Guardar Cambios
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
};

const DctiView = {
    render: (data) => {
        const dcti = data.dcti;
        return `
            <div class="view-container">
                <div style="background: white; padding: var(--space-xl); border-radius: var(--radius-lg); border: 1px solid var(--color-border); max-width: 800px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                    <div style="margin-bottom: var(--space-lg); border-bottom: 2px solid var(--color-primary); display: inline-block;">
                        <h2 style="margin: 0; color: var(--color-text-main);">Gestión de Información Institucional</h2>
                    </div>
                    
                    <form id="dcti-admin-form" style="display: flex; flex-direction: column; gap: var(--space-md);">
                        <div class="form-group">
                            <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--color-primary);">Misión <span style="color: #ef4444;">*</span></label>
                            <textarea id="admin-dcti-mission" style="width: 100%; padding: 12px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.95rem; height: 100px; resize: vertical;" required>${dcti.mission}</textarea>
                        </div>
                        <div class="form-group">
                            <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--color-primary);">Visión <span style="color: #ef4444;">*</span></label>
                            <textarea id="admin-dcti-vision" style="width: 100%; padding: 12px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.95rem; height: 100px; resize: vertical;" required>${dcti.vision}</textarea>
                        </div>
                        <div class="form-group">
                            <label style="display: block; font-weight: 700; margin-bottom: 8px; color: var(--color-primary);">Reseña Institucional <span style="color: #ef4444;">*</span></label>
                            <textarea id="admin-dcti-review" style="width: 100%; padding: 12px; border: 1.5px solid var(--color-border); border-radius: var(--radius-md); font-size: 0.95rem; height: 150px; resize: vertical;" required>${dcti.review}</textarea>
                        </div>
                        
                        <div style="margin-top: var(--space-sm); padding-top: var(--space-md); border-top: 1px solid #f1f5f9; display: flex; justify-content: flex-end;">
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

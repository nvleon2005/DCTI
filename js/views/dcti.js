const DctiView = {
    render: (data) => {
        const dcti = data.dcti;
        return `
            <div class="view-container">
                <!-- Header Estandarizado -->
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <h2 style="margin: 0; color: var(--color-text-main);">Gestión de Información Institucional</h2>
                        <span style="font-size: 0.85rem; background: var(--color-surface-muted); padding: 4px 12px; border-radius: 20px; color: var(--color-text-muted); font-weight: 600;">
                            Configuración
                        </span>
                    </div>
                </div>
                <hr style="border: none; border-top: 1px solid var(--color-border); margin: 0 0 var(--space-md) 0;">

                <!-- Contenedor Principal Estilo Tarjeta -->
                <div style="background: white; border-radius: var(--radius-md); border: 1px solid var(--color-border); padding: var(--space-xl); box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
                    <form id="dcti-admin-form" style="display: flex; flex-direction: column; gap: var(--space-lg); width: 100%;">
                        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-xl); box-sizing: border-box;">
                            
                            <!-- Columna 1: Textos (Misión, Visión, Reseña) y Organigrama -->
                            <div style="display: flex; flex-direction: column; gap: var(--space-md); background: #f8fafc; padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid #e2e8f0;">
                                <h3 style="color: var(--color-text-main); font-size: 1.1rem; margin-top: 0; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
                                    <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(99, 102, 241, 0.1); color: #6366f1; display: flex; align-items: center; justify-content: center;"><i class="fas fa-university"></i></div> Institucional
                                </h3>
                                
                                <div class="form-group">
                                    <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px; color: var(--color-text-main);">Reseña Institucional <span style="color: #ef4444;">*</span></label>
                                    <textarea id="admin-dcti-review" style="width: 100%; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 0.95rem; height: 100px; resize: vertical; transition: border-color 0.2s; box-sizing: border-box;" required>${dcti.review || ''}</textarea>
                                </div>
                                <div class="form-group">
                                    <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px; color: var(--color-text-main);">Misión <span style="color: #ef4444;">*</span></label>
                                    <textarea id="admin-dcti-mission" style="width: 100%; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 0.95rem; height: 80px; resize: vertical; transition: border-color 0.2s; box-sizing: border-box;" required>${dcti.mission || ''}</textarea>
                                </div>
                                <div class="form-group">
                                    <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px; color: var(--color-text-main);">Visión <span style="color: #ef4444;">*</span></label>
                                    <textarea id="admin-dcti-vision" style="width: 100%; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 0.95rem; height: 80px; resize: vertical; transition: border-color 0.2s; box-sizing: border-box;" required>${dcti.vision || ''}</textarea>
                                </div>
                                
                                <div style="display: flex; flex-direction: column; margin-top: 5px;">
                                    <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px; color: var(--color-text-main);">Organigrama <span style="color: var(--color-text-muted); font-weight: 400; font-size: 0.8rem;">(Opcional)</span></label>
                                    <div style="position: relative; width: 100%; height: 160px; background: white; border-radius: 8px; border: 2px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; padding: 10px; transition: border-color 0.2s; box-sizing: border-box;">
                                        <img id="admin-dcti-organigrama-preview" src="${dcti.organigrama || ''}" style="max-width: 100%; max-height: 100%; height: auto; object-fit: contain; border-radius: 6px; display: ${dcti.organigrama ? 'block' : 'none'};">
                                        <input type="file" id="admin-dcti-organigrama-input" accept="image/*" style="display: none;" onchange="typeof previewOrganigrama === 'function' ? previewOrganigrama(event) : null">
                                        <button type="button" onclick="document.getElementById('admin-dcti-organigrama-input').click()" style="position: absolute; bottom: -12px; right: -12px; width: 36px; height: 36px; border-radius: 50%; background: var(--color-primary); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.1); font-size: 1.1rem; transition: background 0.2s; z-index: 10;" title="Subir Organigrama">
                                            <i class="fas fa-upload" style="font-size: 14px;"></i>
                                        </button>
                                        ${!dcti.organigrama ? '<div id="admin-dcti-organigrama-placeholder" style="color: #94a3b8; font-size: 0.9rem; display: flex; flex-direction: column; align-items: center; gap: 8px;"><i class="fas fa-image" style="font-size: 1.5rem;"></i><span>Clic en + para subir</span></div>' : ''}
                                    </div>
                                    <div style="margin-top: 15px; font-size: 0.8rem; color: var(--color-text-muted);">
                                        La imagen será escalada automáticamente.
                                    </div>
                                </div>
                            </div>
                            
                            <!-- Columna 2: Contacto (Teléfono, Dirección, Email) -->
                            <div style="display: flex; flex-direction: column; gap: var(--space-md); background: #f8fafc; padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid #e2e8f0;">
                                <h3 style="color: var(--color-text-main); font-size: 1.1rem; margin-top: 0; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
                                    <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(16, 185, 129, 0.1); color: #10b981; display: flex; align-items: center; justify-content: center;"><i class="fas fa-headset"></i></div> Contacto
                                </h3>
                                
                                <div class="form-group">
                                    <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px; color: var(--color-text-main);">Email Oficial <span style="color: var(--color-text-muted); font-weight: 400; font-size: 0.8rem;">(Opcional)</span></label>
                                    <div style="position: relative;">
                                        <i class="fas fa-envelope" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8;"></i>
                                        <input type="email" id="admin-dcti-email" style="width: 100%; padding: 10px 12px 10px 36px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 0.95rem; transition: border-color 0.2s; box-sizing: border-box;" placeholder="contacto@dcti.gob.ve" value="${dcti.email || ''}">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px; color: var(--color-text-main);">Teléfono <span style="color: var(--color-text-muted); font-weight: 400; font-size: 0.8rem;">(Opcional)</span></label>
                                    <div style="position: relative;">
                                        <i class="fas fa-phone" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8;"></i>
                                        <input type="text" id="admin-dcti-phone" style="width: 100%; padding: 10px 12px 10px 36px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 0.95rem; transition: border-color 0.2s; box-sizing: border-box;" placeholder="+58 412 1234567" value="${dcti.phone || ''}">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px; color: var(--color-text-main);">Dirección Física <span style="color: var(--color-text-muted); font-weight: 400; font-size: 0.8rem;">(Opcional)</span></label>
                                    <textarea id="admin-dcti-address" style="width: 100%; padding: 10px 12px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 0.95rem; height: 90px; resize: vertical; transition: border-color 0.2s; box-sizing: border-box;" placeholder="Av. Principal, Edificio DCTI...">${dcti.address || ''}</textarea>
                                </div>
                            </div>

                            <!-- Columna 3: Redes Sociales -->
                            <div style="display: flex; flex-direction: column; gap: var(--space-md); background: #f8fafc; padding: var(--space-md); border-radius: var(--radius-md); border: 1px solid #e2e8f0;">
                                <h3 style="color: var(--color-text-main); font-size: 1.1rem; margin-top: 0; margin-bottom: 10px; display: flex; align-items: center; gap: 8px; border-bottom: 1px solid #e2e8f0; padding-bottom: 10px;">
                                    <div style="width: 32px; height: 32px; border-radius: 8px; background: rgba(236, 72, 153, 0.1); color: #ec4899; display: flex; align-items: center; justify-content: center;"><i class="fas fa-share-nodes"></i></div> Redes Sociales
                                </h3>
                                
                                <div class="form-group">
                                    <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px; color: var(--color-text-main);">Instagram <span style="color: var(--color-text-muted); font-weight: 400; font-size: 0.8rem;">(Opcional)</span></label>
                                    <div style="position: relative;">
                                        <i class="fab fa-instagram" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8;"></i>
                                        <input type="text" id="admin-dcti-instagram" style="width: 100%; padding: 10px 12px 10px 36px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 0.95rem; transition: border-color 0.2s; box-sizing: border-box;" placeholder="@usuario_dcti" value="${dcti.instagram || ''}">
                                    </div>
                                </div>
                                <div class="form-group">
                                    <label style="display: block; font-weight: 600; font-size: 0.9rem; margin-bottom: 6px; color: var(--color-text-main);">Facebook <span style="color: var(--color-text-muted); font-weight: 400; font-size: 0.8rem;">(Opcional)</span></label>
                                    <div style="position: relative;">
                                        <i class="fab fa-facebook-f" style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: #94a3b8;"></i>
                                        <input type="text" id="admin-dcti-facebook" style="width: 100%; padding: 10px 12px 10px 36px; border: 1px solid var(--color-border); border-radius: 6px; font-size: 0.95rem; transition: border-color 0.2s; box-sizing: border-box;" placeholder="@usuario_dcti o URL" value="${dcti.facebook || ''}">
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Actions -->
                        <div style="margin-top: var(--space-md); padding-top: var(--space-md); border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 15px; align-items: center;">
                            <button type="button" onclick="if(typeof restoreDefaultDcti === 'function') restoreDefaultDcti()" title="Restaurar a valores predeterminados" style="background: #ef4444; color: white; border: none; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 6px rgba(239, 68, 68, 0.3); transition: transform 0.2s, background 0.2s;">
                                <i class="fas fa-sync-alt"></i>
                            </button>
                            <button type="submit" title="Guardar Cambios" style="background: var(--color-primary); color: white; border: none; width: 42px; height: 42px; border-radius: 50%; display: flex; align-items: center; justify-content: center; cursor: pointer; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.3); transition: transform 0.2s, background 0.2s;">
                                <i class="fas fa-save"></i>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }
};

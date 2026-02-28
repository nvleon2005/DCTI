const ProjectsView = {
    render: (data) => {
        // En este punto, renderModule ya debió sincronizar MOCK_DATA.projects con localStorage si existe getLocalProjects
        const projects = data.projects;
        const session = JSON.parse(localStorage.getItem('dcti_session'));
        const isAdmin = session && session.role === 'admin';

        return `
            <div class="view-container">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-md);">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <h2>Iniciativas Estratégicas</h2>
                        <span style="font-size: 0.85rem; background: var(--color-surface-muted); padding: 4px 12px; border-radius: 20px; color: var(--color-text-muted); font-weight: 600;">
                            Total: ${projects.length}
                        </span>
                    </div>
                    ${isAdmin ? `
                        <button class="btn-action" onclick="openProjectModal()" title="Nuevo Proyecto" style="width: 45px; height: 45px; border-radius: 50%; padding: 0; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-folder-plus" style="font-size: 1.2rem; margin: 0;"></i>
                        </button>
                    ` : ''}
                </div>

                <div style="background: white; border-radius: var(--radius-md); border: 1px solid var(--color-border); overflow: hidden;">
                    <table style="width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left;">
                        <thead style="background: #f8fafc; border-bottom: 1px solid var(--color-border);">
                            <tr>
                                <th style="padding: 15px; width: 60px;">ID</th>
                                <th style="padding: 15px;">Proyecto</th>
                                <th style="padding: 15px;">Estado</th>
                                <th style="padding: 15px;">Progreso</th>
                                <th style="padding: 15px; text-align: center;">Destacado</th>
                                <th style="padding: 15px; text-align: right;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${projects.map(p => `
                                <tr style="border-bottom: 1px solid #f1f5f9; transition: 0.2s;" onmouseover="this.style.background='#fcfcfc'" onmouseout="this.style.background='transparent'">
                                    <td style="padding: 15px; color: var(--color-text-muted);">#${p.id}</td>
                                    <td style="padding: 15px;">
                                        <div style="display: flex; align-items: center; gap: 12px;">
                                            <div style="width: 28px; height: 28px; border-radius: 50%; background: #f1f5f9; display: flex; align-items: center; justify-content: center; font-size: 0.7rem; color: var(--color-primary); font-weight: 800; border: 1.5px solid var(--color-border);">
                                                ${p.id}
                                            </div>
                                            <div>
                                                <div style="font-weight: 700; color: var(--color-text-main);">${p.title}</div>
                                                <div style="font-size: 0.75rem; color: var(--color-text-muted); display: -webkit-box; -webkit-line-clamp: 1; -webkit-box-orient: vertical; overflow: hidden; max-width: 250px;">${p.description}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style="padding: 15px;">
                                        <span style="padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; background: ${p.status === 'Validado' ? '#dcfce7' : (p.status === 'En Proceso' ? '#fef9c3' : '#f3f4f6')}; color: ${p.status === 'Validado' ? '#166534' : (p.status === 'En Proceso' ? '#854d0e' : '#374151')};">
                                            ${p.status}
                                        </span>
                                    </td>
                                    <td style="padding: 15px;">
                                        <div style="width: 80px; height: 6px; background: #eee; border-radius: 10px; margin-bottom: 4px;">
                                            <div style="width: ${p.progress}%; height: 100%; background: var(--color-primary); border-radius: 10px;"></div>
                                        </div>
                                        <span style="font-size: 0.75rem; color: var(--color-text-muted);">${p.progress}%</span>
                                    </td>
                                    <td style="padding: 15px; text-align: center;">
                                        <button onclick="toggleFeatured(${p.id})" style="background: none; border: none; cursor: pointer; color: ${p.featured ? '#f59e0b' : '#cbd5e1'}; font-size: 1.2rem;">
                                            <i class="${p.featured ? 'fas' : 'far'} fa-star"></i>
                                        </button>
                                    </td>
                                    <td style="padding: 15px; text-align: right;">
                                        <div style="display: flex; gap: 8px; justify-content: flex-end;">
                                            <button onclick="openProjectModal(${p.id})" title="Editar" style="background: none; border: 1px solid var(--color-border); padding: 8px; border-radius: 6px; cursor: pointer; color: var(--color-text-main);"><i class="fas fa-edit"></i></button>
                                            <button onclick="deleteProject(${p.id})" title="Eliminar" style="background: none; border: 1px solid #fee2e2; color: #ef4444; padding: 8px; border-radius: 6px; cursor: pointer;"><i class="fas fa-trash-alt"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>

                <!-- Modal de Proyectos (HU001, HU004) -->
                <div id="project-modal" class="modal-overlay hidden">
                    <div class="modal-card" style="max-width: 650px; padding: 0;">
                        <div class="modal-header">
                            <h2 id="project-modal-title">Gestión de Proyecto</h2>
                            <button class="close-modal" onclick="closeProjectModal()">&times;</button>
                        </div>
                        <form id="project-admin-form" onsubmit="handleProjectSubmit(event)" style="padding: 20px; display: grid; grid-template-columns: 1fr; gap: 15px; max-height: 70vh; overflow-y: auto;">
                            <input type="hidden" id="edit-project-id">
                            
                            <div class="form-group" style="grid-column: span 2;">
                                <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Nombre del Proyecto <span style="color: #ef4444;">*</span></label>
                                <input type="text" id="admin-project-title" placeholder="Ej: Modernización Red Eléctrica" style="width: 100%; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px;" required>
                            </div>

                            <div class="form-group">
                                <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Estado <span style="color: #ef4444;">*</span></label>
                                <select id="admin-project-status" style="width: 100%; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px; background-color: white; font-weight: 600;" required>
                                    <option value="Borrador">Borrador</option>
                                    <option value="En Proceso">En Proceso</option>
                                    <option value="Validado">Validar Proyecto (Listo para Destacar)</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Progreso (%)</label>
                                <input type="number" id="admin-project-progress" min="0" max="100" value="0" style="width: 100%; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px;">
                            </div>

                            <div class="form-group" style="grid-column: span 2;">
                                <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Descripción Breve <span style="color: #ef4444;">*</span></label>
                                <textarea id="admin-project-description" placeholder="Resumen para el listado..." style="width: 100%; height: 60px; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px; resize: none;" required></textarea>
                            </div>

                            <div class="form-group" style="grid-column: span 2;">
                                <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Objetivos Estratégicos <span style="color: #ef4444;">*</span></label>
                                <textarea id="admin-project-objectives" placeholder="Metas a alcanzar..." style="width: 100%; height: 80px; padding: 10px; border: 1px solid var(--color-border); border-radius: 6px; resize: none;" required></textarea>
                            </div>

                            <div class="form-group">
                                <label style="display: block; margin-bottom: 5px; font-size: 0.85rem; font-weight: 700;">Imagen del Proyecto</label>
                                <div id="admin-project-preview" style="height: 100px; border: 2px dashed var(--color-border); border-radius: 8px; display: flex; flex-direction: column; align-items: center; justify-content: center; background: #f8fafc; position: relative; overflow: hidden;">
                                    <input type="file" id="admin-project-file" accept="image/*" style="position: absolute; opacity: 0; width: 100%; height: 100%; cursor: pointer;">
                                    <i class="fas fa-cloud-upload-alt" style="font-size: 1.5rem; color: #cbd5e1;"></i>
                                    <span style="font-size: 0.7rem; color: #94a3b8; margin-top: 5px;">Subir foto</span>
                                    <input type="hidden" id="admin-project-media">
                                </div>
                            </div>

                            <div class="form-group" style="grid-column: span 2; display: flex; flex-direction: column; gap: 5px; padding-top: 15px;">
                                <div style="display: flex; align-items: center; gap: 10px;">
                                    <input type="checkbox" id="admin-project-featured" style="width: 20px; height: 20px;">
                                    <label for="admin-project-featured" style="font-size: 0.9rem; font-weight: 700; color: var(--color-primary);">Marcar como Destacado (Visible en el Portal)</label>
                                </div>
                                <span id="featured-hint" style="font-size: 0.75rem; color: #ef4444; margin-left: 30px; display: none;">* Requiere estado "Validar Proyecto"</span>
                            </div>

                            <div style="grid-column: span 2; display: flex; justify-content: flex-end; gap: 10px; margin-top: 10px; padding-top: 15px; border-top: 1px solid #eee;">
                                <button type="button" class="btn-secondary" onclick="closeProjectModal()" style="padding: 10px 20px; border-radius: 6px; border: 1px solid var(--color-border); background: white;">Cancelar</button>
                                <button type="submit" class="btn-primary" style="padding: 10px 25px; border-radius: 6px; background: var(--color-primary); color: white; border: none; font-weight: 600;">Guardar Cambios</button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        `;
    }
};

window.AdminTemplate = {
    // Generador del HTML de la Tarjeta Administrativa (Plantilla/Token)
    Card: function(config) {
        /*
          config = {
            id: Number/String,
            title: String,
            image: String,
            badge: { text: String, type: 'success' | 'warning' | 'info' | 'default' } (opcional),
            module: String, // 'news', 'courses', 'projects', 'strategic'
            onEdit: String, // Función a llamar, ej: "openNewsModal(12)"
            onDelete: String // Función a llamar, ej: "deleteNews(12)"
          }
        */
        const coverImage = config.image || 'assets/images/placeholder.jpg';
        
        let badgeHtml = '';
        if (config.badge && config.badge.text) {
            let bg = 'var(--color-border)';
            let color = 'var(--color-text-main)';
            if (config.badge.type === 'success') { bg = '#22c55e'; color = 'white'; }
            else if (config.badge.type === 'warning') { bg = '#f59e0b'; color = 'white'; }
            else if (config.badge.type === 'info') { bg = '#3b82f6'; color = 'white'; }
            else if (config.badge.type === 'danger') { bg = '#ef4444'; color = 'white'; }

            badgeHtml = `
                <div style="position: absolute; top: 12px; left: 12px; background: ${bg}; color: ${color}; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 800; z-index: 10; box-shadow: 0 4px 6px rgba(0,0,0,0.2); letter-spacing: 0.5px;">
                    ${config.badge.text.toUpperCase()}
                </div>
            `;
        }

        // Se inyecta la función generica onView llamando al propio AdminTemplate
        const onViewFn = `window.AdminTemplate.openReadOnlyModal('${config.module}', '${config.id}')`;

        return `
            <div class="admin-template-card" style="height: 330px; max-width: 380px; width: 100%; margin: 0 auto; background: white; border-radius: var(--radius-md); border: 1px solid var(--color-border); overflow: hidden; display: flex; flex-direction: column; box-shadow: 0 4px 6px rgba(0,0,0,0.04); position: relative; transition: transform 0.2s ease, box-shadow 0.2s ease;">
                ${badgeHtml}
                <!-- CONTENEDOR IMAGEN -->
                <div style="height: 170px; min-height: 170px; width: 100%; background: #f8fafc; overflow: hidden; position: relative;">
                    <img src="${coverImage}" alt="${config.title}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;" onerror="this.src='assets/images/img4.jpg'">
                </div>
                
                <!-- CONTENEDOR INFO (NOMBRE) -->
                <div style="padding: 15px 20px; flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; text-align: center; overflow: hidden;">
                    <h3 style="font-size: 1.05rem; color: var(--color-text-main); margin: 0; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden; font-weight: 700; width: 100%;">
                        ${config.title}
                    </h3>
                </div>

                <!-- CONTENEDOR BOTONES ESTANDARIZADOS -->
                <div style="height: 48px; min-height: 48px; border-top: 1px solid #f1f5f9; background: #f8fafc; display: flex; box-sizing: border-box;">
                    <button type="button" onclick="${onViewFn}" title="Ver Información" style="flex: 1; height: 100%; background: none; border: none; border-right: 1px solid #e2e8f0; cursor: pointer; color: var(--color-primary); transition: background 0.2s; font-weight: 600;">
                        <i class="fas fa-eye" style="font-size: 1.1rem;"></i>
                    </button>
                    <button type="button" onclick="${config.onEdit}" title="Editar Módulo" style="flex: 1; height: 100%; background: none; border: none; border-right: 1px solid #e2e8f0; cursor: pointer; color: var(--color-text-main); transition: background 0.2s;">
                        <i class="fas fa-edit" style="font-size: 1.1rem;"></i>
                    </button>
                    <button type="button" onclick="${config.onDelete}" title="Eliminar Registro" style="flex: 1; height: 100%; background: none; border: none; cursor: pointer; color: #ef4444; transition: background 0.2s;">
                        <i class="fas fa-trash-alt" style="font-size: 1.1rem;"></i>
                    </button>
                </div>
            </div>
        `;
    },

    // Generador y Control del Modal de Solo Lectura
    openReadOnlyModal: function(module, id) {
        // En primer lugar, creamos/buscamos el contenedor del modal si no existe en el body
        let modal = document.getElementById('admin-read-only-modal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'admin-read-only-modal';
            modal.className = 'modal-overlay';
            modal.style.zIndex = '999999'; // Garantizar que esté sobre otros modales si existen
            document.body.appendChild(modal);
        }

        // Buscar información en LocalStorage dependiendo del módulo
        let dataItem = null;
        let titleField = '';
        let descHtml = '';
        let onEditFn = '';

        try {
            if (module === 'news') {
                const stored = JSON.parse(localStorage.getItem('dcti_news') || '[]');
                dataItem = stored.find(i => i.id == id);
                if (dataItem) {
                    titleField = dataItem.headline;
                    descHtml = `
                        <p><strong>Autor:</strong> ${dataItem.author || 'Sin Definir'}</p>
                        <p><strong>Categoría:</strong> ${dataItem.category}</p>
                        <p><strong>Fecha Publicación:</strong> ${dataItem.published}</p>
                        <hr style="border:0; border-top:1px solid #eee; margin: 15px 0;">
                        <div style="white-space: pre-line;">${dataItem.content || 'Sin contenido'}</div>
                    `;
                    onEditFn = `openNewsModal(${id}); window.AdminTemplate.closeReadOnlyModal();`;
                }
            } 
            else if (module === 'courses') {
                const stored = JSON.parse(localStorage.getItem('dcti_courses') || '[]');
                dataItem = stored.find(i => i.id == id);
                if (dataItem) {
                    titleField = dataItem.nombreCurso;
                    descHtml = `
                        <p><strong>Modalidad:</strong> ${dataItem.modalidad}</p>
                        <p><strong>Fechas:</strong> ${dataItem.fechaInicio} al ${dataItem.fechaFin}</p>
                        <p><strong>Instructor:</strong> ${dataItem.instructor}</p>
                        <p><strong>Estado:</strong> ${dataItem.estadoCurso}</p>
                        <hr style="border:0; border-top:1px solid #eee; margin: 15px 0;">
                        <p><strong>Objetivos:</strong><br>${dataItem.objetivos || 'N/A'}</p>
                        <div style="white-space: pre-line; margin-top: 15px;"><strong>Síntesis:</strong><br>${dataItem.descripcion}</div>
                    `;
                    onEditFn = `openCourseModal(${id}); window.AdminTemplate.closeReadOnlyModal();`;
                }
            }
            else if (module === 'projects') {
                const stored = JSON.parse(localStorage.getItem('dcti_projects') || '[]');
                dataItem = stored.find(i => i.id == id);
                if (dataItem) {
                    titleField = dataItem.title;
                    descHtml = `
                        <p><strong>Estado:</strong> ${dataItem.status}</p>
                        <hr style="border:0; border-top:1px solid #eee; margin: 15px 0;">
                        <p><strong>Descripción:</strong><br>${dataItem.description}</p>
                        <p style="margin-top: 15px;"><strong>Avances Registrados:</strong><br>${dataItem.advances || 'Sin registrar'}</p>
                        <p style="margin-top: 15px;"><strong>Objetivos:</strong><br>${dataItem.objectives || 'Sin definir'}</p>
                    `;
                    onEditFn = `openProjectModal(${id}); window.AdminTemplate.closeReadOnlyModal();`;
                }
            }
            else if (module === 'strategic') {
                const stored = JSON.parse(localStorage.getItem('dcti_strategic') || '[]');
                dataItem = stored.find(i => i.id == id);
                if (dataItem) {
                    titleField = dataItem.area || dataItem.title || 'Área Estratégica';
                    descHtml = `
                        <hr style="border:0; border-top:1px solid #eee; margin: 15px 0; display: none;">
                        <div style="white-space: pre-line;"><strong>Resumen:</strong><br>${dataItem.description || 'Sin resumen'}</div>
                        ${dataItem.goals ? `<div style="white-space: pre-line; margin-top: 15px;"><strong>Metas/Objetivos:</strong><br>${dataItem.goals}</div>` : ''}
                    `;
                    onEditFn = `openStrategicModal(${id}); window.AdminTemplate.closeReadOnlyModal();`;
                }
            }

            if (!dataItem) {
                descHtml = '<p>Lo sentimos, no se encontró la información detallada para este elemento.</p>';
                titleField = 'Información No Encontrada';
            }

            // Inyectar HTML en el modal
            let coverImage = 'assets/images/img4.jpg';
            if (dataItem) {
                if (dataItem.images && Array.isArray(dataItem.images) && dataItem.images.length > 0) {
                    coverImage = dataItem.images[0].image || dataItem.images[0];
                } else if (dataItem.image) {
                    coverImage = dataItem.image;
                } else if (dataItem.multimedia) {
                    if (Array.isArray(dataItem.multimedia) && dataItem.multimedia.length > 0) {
                        coverImage = dataItem.multimedia[0];
                    } else if (typeof dataItem.multimedia === 'string') {
                        coverImage = dataItem.multimedia;
                    }
                }
            }

            modal.innerHTML = `
                <div class="modal-card" style="max-width: 650px; width: 95%; padding: 0; display: flex; flex-direction: column; max-height: 90vh; animation: slideInUp 0.3s ease;">
                    <div class="modal-header" style="background: var(--grad-primary); color: white; padding: 15px 25px; display: flex; justify-content: space-between; align-items: center; position: relative;">
                        <!-- Acción Secundaria: BOTON EDITAR COMO ICONO -->
                        <!-- Titulo principal -->
                        <h2 style="margin: 0; font-size: 1.15rem; flex: 1; margin-right: 40px;"><i class="fas fa-info-circle" style="margin-right: 8px;"></i>${module.toUpperCase()} / Modo Lectura</h2>
                        
                        <div style="display: flex; gap: 15px; position: absolute; right: 20px;">
                            ${dataItem ? `
                                <button onclick="${onEditFn}" title="Modificar Información" style="background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.4); color: white; width: 32px; height: 32px; border-radius: 6px; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center;">
                                    <i class="fas fa-edit"></i>
                                </button>
                            ` : ''}
                            <!-- Cerrar principal: X -->
                            <button onclick="window.AdminTemplate.closeReadOnlyModal()" title="Cerrar Modal" style="color: white; border: none; background: none; font-size: 1.5rem; cursor: pointer; opacity: 0.8;">&times;</button>
                        </div>
                    </div>
                    
                    <div style="overflow-y: auto; flex: 1;">
                        <!-- Imagen de Portada -->
                        <div style="width: 100%; height: 200px; background: #e2e8f0; position: relative;">
                            <img src="${coverImage}" onerror="this.src='assets/images/img4.jpg'" style="width: 100%; height: 100%; object-fit: cover; opacity: 0.9;">
                            <div style="position: absolute; bottom: 0; left: 0; width: 100%; background: linear-gradient(to top, rgba(0,0,0,0.8), transparent); padding: 30px 20px 15px 20px;">
                                <h3 style="margin: 0; color: white; font-size: 1.4rem; text-shadow: 1px 1px 3px rgba(0,0,0,0.8);">${titleField}</h3>
                            </div>
                        </div>

                        <!-- Detalles Literarios -->
                        <div style="padding: 25px; color: var(--color-text-main); font-size: 0.95rem; line-height: 1.6;">
                            ${descHtml}
                        </div>
                    </div>
                </div>
            `;
            
            // Animación de Entrada CSS nativa si no existe
            if (!document.getElementById('admin-template-styles')) {
                const st = document.createElement('style');
                st.id = 'admin-template-styles';
                st.textContent = `
                    @keyframes slideInUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
                    .admin-template-card:hover button { filter: brightness(0.95); }
                    .admin-template-card button:hover { background: #f1f5f9 !important; }
                `;
                document.head.appendChild(st);
            }

            modal.classList.remove('hidden');
            modal.style.display = 'flex'; // Usualmente modal-overlay es flex
        } catch (e) {
            console.error("Error al abrir modal genérico:", e);
        }
    },

    closeReadOnlyModal: function() {
        const modal = document.getElementById('admin-read-only-modal');
        if (modal) {
            modal.classList.add('hidden');
            modal.style.display = 'none';
        }
    },

    // --- SUBSISTEMA DE BACKUP Y TOKENIZACIÓN DE FORMULARIOS ---
    formBackups: {},

    initFormBackup: function(formId) {
        const form = document.getElementById(formId);
        if (!form) return;
        const backup = {};
        for (let i = 0; i < form.elements.length; i++) {
            const el = form.elements[i];
            if (el.name || el.id) {
                const key = el.name || el.id;
                if (el.type === 'checkbox' || el.type === 'radio') {
                    backup[key] = el.checked;
                } else if (el.type !== 'file') {
                    backup[key] = el.value;
                }
            }
        }
        window.AdminTemplate.formBackups[formId] = backup;
        
        // Notificador genérico de captura
        console.log(`[AdminTemplate] Snapshot tomado del formulario: ${formId}`);
    },

    resetForm: function(formId) {
        const backup = window.AdminTemplate.formBackups[formId];
        const form = document.getElementById(formId);
        if (!form) return;

        if (!backup || Object.keys(backup).length === 0) {
            form.reset(); // Si no hay backup útil, es modo de creación: limpiar todo.
            // Limpieza específica para las previsualizaciones de imágenes de este proyecto
            const previews = form.querySelectorAll('div[id*="preview"]');
            previews.forEach(p => {
                p.style.backgroundImage = 'none';
                p.style.backgroundColor = '#cbd5e1';
                const icon = p.querySelector('i');
                if (icon) icon.style.display = 'block';
            });
            
            // Limpiar variables JS globales para los Modulos correspondientes
            if (formId === 'course-admin-form') { if (typeof courseImageQueue !== 'undefined') { window.courseImageQueue = []; if(typeof renderCourseGallery === 'function') renderCourseGallery(); } }
            if (formId === 'strategic-admin-form') { if (typeof strategicImageQueue !== 'undefined') { window.strategicImageQueue = []; if(typeof renderStrategicGallery === 'function') renderStrategicGallery(); } }
            if (formId === 'project-admin-form') { if (typeof projectImageQueue !== 'undefined') { window.projectImageQueue = []; if(typeof renderProjectGallery === 'function') renderProjectGallery(); } }
            if (formId === 'news-admin-form') { 
                const previewContainer = document.getElementById('admin-news-images-preview');
                const uploadArea = form.querySelector('.upload-area');
                if (previewContainer) previewContainer.innerHTML = '';
                if (uploadArea) {
                    const icon = uploadArea.querySelector('i');
                    const spanText = uploadArea.querySelector('span');
                    if (icon) icon.style.display = 'block';
                    if (spanText) {
                        spanText.style.display = 'block';
                        spanText.innerHTML = 'Subir imágenes localmente<br>(Puede seleccionar múltiples)';
                    }
                }
            }

            if (formId === 'user-admin-form') {
                const avatarPreview = document.getElementById('admin-user-avatar-preview');
                if (avatarPreview) {
                    avatarPreview.src = '';
                    avatarPreview.style.display = 'none';
                }
            }

            console.log(`[AdminTemplate] Formulario y colas limpiados completamente: ${formId}`);
            return;
        }

        // Restaurar estado fotográfico (modo edición)
        for (let i = 0; i < form.elements.length; i++) {
            const el = form.elements[i];
            if (el.name || el.id) {
                const key = el.name || el.id;
                if (backup.hasOwnProperty(key)) {
                    if (el.type === 'checkbox' || el.type === 'radio') {
                        el.checked = backup[key];
                    } else if (el.type !== 'file') {
                        el.value = backup[key];
                    }
                }
            }
        }
        console.log(`[AdminTemplate] Cambios descartados. Formulario restaurado a su backup visual en: ${formId}`);
    },

    ModalFooter: function(cancelFn, formId, hideCancel = false) {
        return `
            <div style="margin-top: auto; display: flex; gap: 12px; justify-content: flex-end; align-items: center; padding-top: 15px;">
                <!-- 1. CANCELAR -->
                ${!hideCancel ? `
                <button type="button" class="btn-modal-cancel" onclick="${cancelFn}" title="Cancelar Operación">
                    <i class="fas fa-times"></i>
                </button>
                ` : ''}
                
                <!-- 2. RESET/RESTAURAR -->
                <button type="button" class="btn-modal-reset" onclick="window.AdminTemplate.resetForm('${formId}')" title="Limpiar / Restaurar Valores">
                    <i class="fas fa-undo-alt"></i>
                </button>
                
                <!-- 3. GUARDAR (Ya usa la clase global de portal.css) -->
                <button type="submit" title="Guardar Cambios" class="btn-save-circle" style="width: 48px; height: 48px; margin: 0; padding: 0; flex-shrink: 0;">
                    <i class="fas fa-save" style="margin: 0; font-size: 1.1rem;"></i>
                </button>
            </div>
            
            <style>
                .btn-modal-cancel { width: 48px; height: 48px; border-radius: 50%; border: 1px solid #fca5a5; background: #fef2f2; color: #ef4444; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: all 0.2s ease; flex-shrink: 0; }
                .btn-modal-cancel:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 12px rgba(239,68,68,0.2) !important; background: #fee2e2 !important; }

                .btn-modal-reset { width: 48px; height: 48px; border-radius: 50%; border: 1px solid #fcd34d; background: #fffbeb; color: #f59e0b; font-size: 1.1rem; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 6px rgba(0,0,0,0.05); transition: all 0.2s ease; flex-shrink: 0; }
                .btn-modal-reset:hover { transform: translateY(-2px) !important; box-shadow: 0 6px 12px rgba(245,158,11,0.2) !important; background: #fef3c7 !important; }
            </style>
        `;
    },

    // Generador estandarizado de Paginación Inteligente para todo el dashboard
    Pagination: function(module, currentPage, totalPages) {
        if (!totalPages || totalPages <= 1) return '';

        let html = `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 15px; background: #f8fafc; border-top: 1px solid var(--color-border);">
                <span style="font-size: 0.85rem; color: var(--color-text-muted);">
                    Mostrando página <strong style="color: var(--color-text-main);">${currentPage}</strong> de <strong style="color: var(--color-text-main);">${totalPages}</strong>
                </span>
                <div style="display: flex; gap: 5px; align-items: center;">
        `;

        const btnStyleBase = `padding: 5px 12px; border: 1px solid var(--color-border); border-radius: 4px; font-weight: 500; font-size: 0.85rem; transition: background 0.2s, color 0.2s;`;
        const activeStyle = `background: var(--color-primary); color: white; border-color: var(--color-primary); cursor: default; pointer-events: none;`;
        const defaultStyle = `background: white; color: var(--color-text-main); cursor: pointer;`;
        const disabledStyle = `background: #f1f5f9; color: #94a3b8; cursor: default; opacity: 0.6; pointer-events: none;`;

        // Doble Atrás (<<) y Atrás (<)
        if (currentPage > 1) {
            html += `<button onclick="window.debouncedRenderModule ? changePage('${module}', 1) : changePage('${module}', 1)" style="${btnStyleBase} ${defaultStyle}" title="Ir a la primera página"><i class="fas fa-angle-double-left"></i></button>`;
            html += `<button onclick="changePage('${module}', ${currentPage - 1})" style="${btnStyleBase} ${defaultStyle}" title="Anterior"><i class="fas fa-angle-left"></i></button>`;
        } else {
            html += `<button disabled style="${btnStyleBase} ${disabledStyle}"><i class="fas fa-angle-double-left"></i></button>`;
            html += `<button disabled style="${btnStyleBase} ${disabledStyle}"><i class="fas fa-angle-left"></i></button>`;
        }

        // --- Lógica del Ellipsis para páginas ---
        let pages = [];
        const maxVisible = 5;
        
        if (totalPages <= maxVisible) {
            for (let i = 1; i <= totalPages; i++) pages.push(i);
        } else {
            // Siempre mostrar la primera, la última y un par alrededor de la actual
            pages.push(1);
            let start = Math.max(2, currentPage - 1);
            let end = Math.min(totalPages - 1, currentPage + 1);

            if (currentPage <= 3) {
                end = 4;
            } else if (currentPage >= totalPages - 2) {
                start = totalPages - 3;
            }

            if (start > 2) pages.push('...');
            for (let i = start; i <= end; i++) pages.push(i);
            if (end < totalPages - 1) pages.push('...');
            pages.push(totalPages);
        }

        // Renderizado de Botones Numéricos
        pages.forEach(p => {
            if (p === '...') {
                html += `<span style="padding: 5px 8px; color: var(--color-text-muted);">...</span>`;
            } else {
                if (p === currentPage) {
                    html += `<button style="${btnStyleBase} ${activeStyle}">${p}</button>`;
                } else {
                    html += `<button onclick="changePage('${module}', ${p})" style="${btnStyleBase} ${defaultStyle}">${p}</button>`;
                }
            }
        });

        // Adelante (>) y Doble Adelante (>>)
        if (currentPage < totalPages) {
            html += `<button onclick="changePage('${module}', ${currentPage + 1})" style="${btnStyleBase} ${defaultStyle}" title="Siguiente"><i class="fas fa-angle-right"></i></button>`;
            html += `<button onclick="changePage('${module}', ${totalPages})" style="${btnStyleBase} ${defaultStyle}" title="Ir a la última página"><i class="fas fa-angle-double-right"></i></button>`;
        } else {
            html += `<button disabled style="${btnStyleBase} ${disabledStyle}"><i class="fas fa-angle-right"></i></button>`;
            html += `<button disabled style="${btnStyleBase} ${disabledStyle}"><i class="fas fa-angle-double-right"></i></button>`;
        }

        html += `
                </div>
            </div>
            <style>
                .btn-pagination:hover { filter: brightness(0.95); }
            </style>
        `;

        return html;
    }
};

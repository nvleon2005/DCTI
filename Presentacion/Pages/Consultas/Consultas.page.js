const ConsultasView = {
    render: (data) => {
        const paginated = data.pagination;
        const consultas = paginated ? paginated.items : data.consultas;
        const total = paginated ? paginated.totalItems : consultas.length;

        return `
            <div class="view-container">
                <div style="display: flex; flex-direction: column; gap: var(--space-md); margin-bottom: var(--space-md);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <h2>Buzón de Consultas</h2>
                            <span style="font-size: 0.85rem; background: var(--color-surface-muted); padding: 4px 12px; border-radius: 20px; color: var(--color-text-muted); font-weight: 600;">
                                Total: ${total}
                            </span>
                        </div>
                        <button class="btn-action" onclick="exportConsultasCSV()" title="Exportar CSV" style="width: auto; height: 45px; border-radius: 8px; padding: 0 15px; display: flex; align-items: center; justify-content: center; background: #10b981; color: white; border: none; font-weight: 600; cursor: pointer; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2);">
                            <i class="fas fa-file-csv" style="font-size: 1.1rem; margin-right: 8px;"></i> Exportar
                        </button>
                    </div>
                    <hr style="border: none; border-top: 1px solid var(--color-border); margin: 0 0 var(--space-md) 0;">
                </div>

                <!-- Filtros -->
                <div style="display: flex; justify-content: flex-start; align-items: center; gap: 15px; flex-wrap: wrap; margin-bottom: var(--space-lg);">
                    <div style="position: relative; display: flex; align-items: center; background: white; border-radius: 20px; padding: 4px 14px; border: 1px solid var(--color-border); transition: all 0.2s; height: 36px; box-sizing: border-box; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                        <i class="fas fa-search" style="font-size: 0.8rem; color: var(--color-text-muted); margin-right: 8px;"></i>
                        <input type="text" id="filter-consulta-search" placeholder="Buscar por nombre o correo..." 
                            oninput="window.lastFocusedInput = this.id; window.globalConsultaSearch = this.value; window.debouncedRenderModule('consultas');" 
                            value="${window.globalConsultaSearch || ''}" 
                            style="background: transparent; border: none; color: var(--color-text-main); width: 200px; font-size: 0.85rem; outline: none; font-weight: 500;">
                    </div>
                    <select onchange="window.globalConsultaStatus = this.value; if(typeof changePage === 'function'){changePage('consultas', 1)} else {renderModule('consultas')}" 
                        style="padding: 0 32px 0 16px; height: 36px; border: 1px solid var(--color-border); border-radius: 20px; font-size: 0.85rem; background: white url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%236b7280%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><polyline points=%226 9 12 15 18 9%22></polyline></svg>') no-repeat right 12px center; cursor: pointer; box-sizing: border-box; appearance: none; -webkit-appearance: none; color: var(--color-text-main); font-weight: 500; box-shadow: 0 2px 4px rgba(0,0,0,0.02); transition: all 0.2s ease;">
                        <option value="Todos" ${window.globalConsultaStatus === 'Todos' || !window.globalConsultaStatus ? 'selected' : ''}>Todos los Estados</option>
                        <option value="Pendiente" ${window.globalConsultaStatus === 'Pendiente' ? 'selected' : ''}>Pendientes</option>
                        <option value="Respondida" ${window.globalConsultaStatus === 'Respondida' ? 'selected' : ''}>Respondidas</option>
                    </select>
                    <div style="display: flex; align-items: center; gap: 8px; margin-left: auto;">
                        <span style="color: var(--color-text-muted); font-size: 0.85rem; font-weight: 600;"><i class="fas fa-calendar-alt"></i> Fecha:</span>
                        <input type="date" onchange="window.globalConsultaDateFrom = this.value; if(typeof changePage === 'function'){changePage('consultas', 1)} else {renderModule('consultas')}" value="${window.globalConsultaDateFrom || ''}" style="padding: 0 12px; height: 36px; border: 1px solid var(--color-border); border-radius: 20px; font-size: 0.85rem; color: var(--color-text-main); font-weight: 500; background: white; box-sizing: border-box;" title="Desde">
                        <span style="color: var(--color-text-muted); font-size: 0.85rem;">a</span>
                        <input type="date" onchange="window.globalConsultaDateTo = this.value; if(typeof changePage === 'function'){changePage('consultas', 1)} else {renderModule('consultas')}" value="${window.globalConsultaDateTo || ''}" style="padding: 0 12px; height: 36px; border: 1px solid var(--color-border); border-radius: 20px; font-size: 0.85rem; color: var(--color-text-main); font-weight: 500; background: white; box-sizing: border-box;" title="Hasta">
                    </div>
                </div>

                <!-- Tabla de Datos -->
                <div style="background: white; border-radius: var(--radius-md); border: 1px solid var(--color-border); overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.05); overflow-x: auto;">
                    <table style="width: 100%; min-width: 800px; border-collapse: collapse;">
                        <thead style="background: var(--color-sidebar); color: white;">
                            <tr>
                                <th style="padding: 15px; text-align: left; width: 120px;">Fecha</th>
                                <th style="padding: 15px; text-align: left;">Usuario</th>
                                <th style="padding: 15px; text-align: left;">Correo</th>
                                <th style="padding: 15px; text-align: left;">Estado</th>
                                <th style="padding: 15px; text-align: center; width: 150px;">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${consultas.length === 0 ? `
                                <tr>
                                    <td colspan="5" style="padding: 30px; text-align: center; color: var(--color-text-muted);">
                                        <i class="fas fa-inbox" style="font-size: 2rem; margin-bottom: 10px; opacity: 0.5;"></i>
                                        <p>No se encontraron consultas.</p>
                                    </td>
                                </tr>
                            ` : consultas.map(c => {
            const statusColor = c.estado === 'Respondida' ? '#22c55e' : '#f59e0b';
            const initials = ((c.nombre || '').charAt(0) + (c.apellido || '').charAt(0)).toUpperCase() || '?';
            return `
                                    <tr style="border-bottom: 1px solid var(--color-border); transition: background 0.2s;" onmouseover="this.style.background='#f8fafc';" onmouseout="this.style.background='transparent';">
                                        <td style="padding: 15px; color: var(--color-text-muted); font-size: 0.9rem;">
                                            <div>${c.fecha}</div>
                                            <div style="font-size: 0.75rem;">${c.hora || ''}</div>
                                        </td>
                                        <td style="padding: 15px;">
                                            <div style="display: flex; align-items: center; gap: 10px;">
                                                <div style="width: 30px; height: 30px; background: #e2e8f0; border-radius: 50%; color: #475569; display: flex; align-items: center; justify-content: center; font-size: 0.75rem; font-weight: bold; flex-shrink: 0;">
                                                    ${initials}
                                                </div>
                                                <div style="display: flex; flex-direction: column;">
                                                    <span style="font-weight: 600; color: #1e293b; font-size: 0.95rem;">${c.nombre} ${c.apellido}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td style="padding: 15px; color: var(--color-text-main); font-size: 0.9rem;">${c.correo}</td>
                                        <td style="padding: 15px;">
                                            <span style="display: inline-flex; align-items: center; gap: 6px; font-size: 0.8rem; background: ${statusColor}15; color: ${statusColor}; padding: 4px 10px; border-radius: 20px; font-weight: 600;">
                                                <i class="fas fa-circle" style="font-size: 0.4rem;"></i> ${c.estado}
                                            </span>
                                        </td>
                                        <td style="padding: 15px; text-align: center;">
                                            <div style="display: flex; justify-content: center; gap: 8px;">
                                                <button onclick="verConsultaCompleta(${c.id})" title="Leer Consulta" style="background: none; border: 1px solid var(--color-border); padding: 6px 10px; border-radius: 6px; cursor: pointer; color: var(--color-primary); transition: all 0.2s;"><i class="fas fa-eye"></i></button>
                                                <button onclick="toggleEstadoConsulta(${c.id})" title="${c.estado === 'Pendiente' ? 'Marcar como Respondida' : 'Marcar como Pendiente'}" style="background: none; border: 1px solid var(--color-border); padding: 6px 10px; border-radius: 6px; cursor: pointer; color: ${c.estado === 'Pendiente' ? '#22c55e' : '#f59e0b'}; transition: all 0.2s;"><i class="fas fa-check-double"></i></button>
                                                <button onclick="eliminarConsulta(${c.id})" title="Eliminar" style="background: none; border: 1px solid #fee2e2; padding: 6px 10px; border-radius: 6px; cursor: pointer; color: #ef4444; transition: all 0.2s;"><i class="fas fa-trash-alt"></i></button>
                                            </div>
                                        </td>
                                    </tr>
                                `;
        }).join('')}
                        </tbody>
                    </table>

                    <!-- Paginación Footer -->
                    ${paginated ? window.AdminTemplate.Pagination('consultas', paginated.currentPage, paginated.totalPages) : ''}
                </div>

                <!-- Modal Ver Consulta -->
                <div id="modal-ver-consulta" class="modal-overlay hidden" onclick="if(event.target === this) document.getElementById('modal-ver-consulta').classList.add('hidden')" style="backdrop-filter: blur(4px); transition: all 0.3s ease;">
                    <div class="modal-card" style="max-width: 550px; padding: 0; overflow: hidden; border-radius: 16px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04); border: 1px solid rgba(255,255,255,0.2);">
                        
                        <!-- Header del Modal -->
                        <div style="background: linear-gradient(135deg, var(--color-primary), #3b0764); padding: 25px 30px; position: relative;">
                            <span class="close-modal" onclick="document.getElementById('modal-ver-consulta').classList.add('hidden')" style="position: absolute; top: 15px; right: 20px; font-size: 1.5rem; color: rgba(255,255,255,0.7); cursor: pointer; transition: color 0.2s;">&times;</span>
                            <div style="display: flex; align-items: center; gap: 15px;">
                                <div style="width: 48px; height: 48px; background: rgba(255,255,255,0.1); backdrop-filter: blur(10px); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem;">
                                    <i class="fas fa-envelope-open-text"></i>
                                </div>
                                <div>
                                    <h2 style="color: white; margin: 0; font-size: 1.4rem; font-weight: 700; letter-spacing: 0.5px;">Detalle de Consulta</h2>
                                    <p style="color: rgba(255,255,255,0.8); margin: 5px 0 0 0; font-size: 0.85rem;" id="consulta-detail-date">...</p>
                                </div>
                            </div>
                        </div>
                        
                        <!-- Cuerpo del Modal -->
                        <div style="padding: 30px; background: #ffffff;">
                            
                            <div style="display: flex; gap: 20px; margin-bottom: 25px;">
                                <!-- Info Remitente -->
                                <div style="flex: 2; display: flex; align-items: flex-start; gap: 12px;">
                                    <div style="width: 40px; height: 40px; background: #f1f5f9; border-radius: 50%; color: var(--color-primary); display: flex; align-items: center; justify-content: center; font-size: 1.2rem; margin-top: 2px;">
                                        <i class="fas fa-user"></i>
                                    </div>
                                    <div style="display: flex; flex-direction: column;">
                                        <span style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Remitente</span>
                                        <span style="font-size: 1.1rem; color: #0f172a; font-weight: 600; margin-top: 2px;" id="consulta-detail-name">...</span>
                                        <a href="#" id="consulta-detail-email-link" style="font-size: 0.9rem; color: #3b82f6; text-decoration: none; margin-top: 2px; transition: color 0.2s;"><span id="consulta-detail-email">...</span></a>
                                    </div>
                                </div>

                                <!-- Estado -->
                                <div style="flex: 1; text-align: right; display: flex; flex-direction: column; justify-content: center; align-items: flex-end;">
                                    <span style="font-size: 0.75rem; color: #64748b; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 5px;">Estado</span>
                                    <div id="consulta-detail-status-badge" style="padding: 6px 14px; border-radius: 20px; font-weight: 700; font-size: 0.85rem; display: inline-flex; align-items: center; gap: 6px;">
                                        <i class="fas fa-circle" style="font-size: 0.4rem;"></i> <span id="consulta-detail-status">...</span>
                                    </div>
                                </div>
                            </div>

                            <!-- Mensaje -->
                            <div style="position: relative;">
                                <div style="position: absolute; top: -10px; left: 15px; background: white; padding: 0 8px; font-size: 0.75rem; color: var(--color-primary); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Mensaje / Consulta</div>
                                <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; padding: 25px 20px 20px; font-size: 1rem; color: #334155; line-height: 1.7; max-height: 280px; overflow-y: auto; white-space: pre-wrap; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);" id="consulta-detail-message">
                                ...
                                </div>
                            </div>

                        </div>

                        <!-- Quick Reply Container (Hidden by Default) -->
                        <div id="quick-reply-container" class="hidden" style="padding: 10px 30px 15px; background: #ffffff; border-top: 1px dashed #e2e8f0; margin-top: -15px;">
                            <div style="position: relative; margin-top: 15px;">
                                <div style="position: absolute; top: -10px; left: 15px; background: white; padding: 0 8px; font-size: 0.75rem; color: #10b981; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Respuesta Rápida</div>
                                <textarea id="quick-reply-text" style="width: 100%; border: 1.5px solid #10b98150; border-radius: 12px; padding: 20px; font-size: 1rem; color: #334155; line-height: 1.5; outline: none; resize: vertical; min-height: 120px; font-family: inherit; transition: border-color 0.2s;" placeholder="Escribe aquí tu respuesta para enviar automáticamente al solicitante..."></textarea>
                                <div style="display: flex; justify-content: flex-end; margin-top: 15px; gap: 10px;">
                                    <button onclick="document.getElementById('quick-reply-container').classList.add('hidden')" style="padding: 8px 16px; border-radius: 6px; background: white; border: 1px solid #cbd5e1; color: #475569; font-weight: 600; cursor: pointer; transition: background 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='white'">Cancelar</button>
                                    <button id="btn-send-reply" style="padding: 8px 16px; border-radius: 6px; background: #10b981; border: none; color: white; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.2); transition: transform 0.2s;" onmouseover="this.style.transform='translateY(-1px)'" onmouseout="this.style.transform='translateY(0)'">
                                        <i class="fas fa-paper-plane"></i> Enviar Ahora
                                    </button>
                                </div>
                            </div>
                        </div>

                        <!-- Footer del Modal -->
                        <div style="padding: 20px 30px; background: #f8fafc; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end; gap: 12px;">
                            <button id="btn-modal-respondida" class="btn-primary" style="background: white; border: 1.5px solid #e2e8f0; box-shadow: 0 2px 4px rgba(0,0,0,0.02); padding: 10px 20px; border-radius: 8px; font-weight: 600; color: #475569; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; gap: 8px;">
                                <i class="fas fa-check" style="color: #10b981;"></i> <span>Marcar Respondida</span>
                            </button>
                            <a id="btn-modal-mailto" href="#" class="btn-primary" style="text-decoration: none; background: var(--color-primary); border: none; padding: 10px 24px; border-radius: 8px; font-weight: 600; color: white; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px rgba(100, 50, 255, 0.2); transition: all 0.2s;">
                                <i class="fas fa-paper-plane"></i> Responder via Correo
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

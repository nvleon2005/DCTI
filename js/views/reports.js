const ReportsView = {
    render: () => {
        setTimeout(() => {
            if (typeof renderReportDashboard === 'function') {
                renderReportDashboard();
            }
        }, 100);

        return `
            <div class="view-container" style="display: flex; flex-direction: column; gap: 25px;">
                <!-- Cabecera Premium -->
                <div style="background: linear-gradient(135deg, var(--color-primary), #3b82f6); border-radius: 16px; padding: 30px; color: white; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.15); display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h2 style="margin: 0; display: flex; align-items: center; gap: 12px; font-size: 1.8rem; padding-bottom: 2px;">
                            <i class="fas fa-chart-pie" style="opacity: 0.9;"></i> Centro de Trazabilidad y Reportes
                        </h2>
                    </div>
                    <div style="background: rgba(255,255,255,0.1); padding: 15px 25px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.2); text-align: right;">
                        <p style="margin: 0; font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8;">Firmado por</p>
                        <strong style="font-size: 1.1rem;" id="report-operator-name">Administrativo</strong>
                    </div>
                </div>

                <!-- Barra de Filtros (Horizontal y Espaciosa) -->
                <div style="background: white; border-radius: 16px; padding: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); display: flex; flex-wrap: wrap; gap: 20px; align-items: flex-end; border: 1px solid var(--color-border);">
                    <div style="flex: 1; min-width: 200px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.85rem; color: var(--color-text-muted);">Dominio Lógico (Entidad)</label>
                        <select id="report-domain" onchange="if(typeof renderReportDashboard === 'function') renderReportDashboard()" style="width: 100%; padding: 12px 15px; border-radius: 8px; border: 2px solid #e2e8f0; background: #f8fafc; font-weight: 500; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='var(--color-primary)'" onblur="this.style.borderColor='#e2e8f0'">
                            <option value="users">Directorio de Usuarios</option>
                            <option value="news">Registro de Publicaciones</option>
                            <option value="projects">Portafolio de Proyectos</option>
                            <option value="courses">Gestión Académica</option>
                        </select>
                    </div>

                    <div style="width: 180px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.85rem; color: var(--color-text-muted);">Fecha Desde</label>
                        <input type="date" id="report-date-from" onchange="if(typeof renderReportDashboard === 'function') renderReportDashboard()" style="width: 100%; padding: 11px 15px; border-radius: 8px; border: 2px solid #e2e8f0; font-weight: 500; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='var(--color-primary)'" onblur="this.style.borderColor='#e2e8f0'">
                    </div>

                    <div style="width: 180px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.85rem; color: var(--color-text-muted);">Fecha Hasta</label>
                        <input type="date" id="report-date-to" onchange="if(typeof renderReportDashboard === 'function') renderReportDashboard()" style="width: 100%; padding: 11px 15px; border-radius: 8px; border: 2px solid #e2e8f0; font-weight: 500; outline: none; transition: border-color 0.2s;" onfocus="this.style.borderColor='var(--color-primary)'" onblur="this.style.borderColor='#e2e8f0'">
                    </div>

                    <button class="btn-primary" onclick="if(typeof renderReportDashboard === 'function') renderReportDashboard()" style="padding: 13px 25px; border-radius: 8px; font-size: 0.95rem; font-weight: 600; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
                        <i class="fas fa-search-plus" style="margin-right: 8px;"></i> Procesar
                    </button>
                </div>

                <!-- Zona de Tarjetas KPI -->
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
                    <div style="background: white; border-radius: 16px; padding: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); border: 1px solid var(--color-border); display: flex; align-items: center; justify-content: space-between; overflow: hidden; position: relative;">
                        <div style="position: relative; z-index: 2;">
                            <p style="margin: 0; font-size: 0.85rem; color: var(--color-text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 1px;">Coincidencias (Hits)</p>
                            <h2 style="margin: 8px 0 0 0; font-size: 2.5rem; color: #0f172a; font-weight: 800;" id="report-kpi-total">0</h2>
                        </div>
                        <i class="fas fa-database" style="font-size: 5rem; color: var(--color-primary); opacity: 0.05; position: absolute; right: -10px; bottom: -10px; z-index: 1;"></i>
                    </div>

                    <div style="background: white; border-radius: 16px; padding: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); border: 1px solid var(--color-border); display: flex; gap: 15px; align-items: center; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 20px rgba(22, 101, 52, 0.1)'; this.style.borderColor='#86efac'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(0,0,0,0.02)'; this.style.borderColor='var(--color-border)'" onclick="if(typeof exportReportToCSV === 'function') exportReportToCSV()">
                        <div style="background: #dcfce7; padding: 18px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-file-excel" style="font-size: 1.8rem; color: #166534;"></i>
                        </div>
                        <div>
                            <h3 style="margin: 0 0 4px 0; font-size: 1.1rem; color: #166534;">Descargar Excel</h3>
                            <p style="margin: 0; font-size: 0.85rem; color: var(--color-text-muted);">Formato CSV/Excel Auditado</p>
                        </div>
                    </div>

                    <div style="background: white; border-radius: 16px; padding: 25px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); border: 1px solid var(--color-border); display: flex; gap: 15px; align-items: center; cursor: pointer; transition: transform 0.2s, box-shadow 0.2s;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 8px 20px rgba(185, 28, 28, 0.1)'; this.style.borderColor='#fca5a5'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 2px 10px rgba(0,0,0,0.02)'; this.style.borderColor='var(--color-border)'" onclick="if(typeof previewReportPDF === 'function') previewReportPDF()">
                        <div style="background: #fee2e2; padding: 18px; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
                            <i class="fas fa-file-pdf" style="font-size: 1.8rem; color: #b91c1c;"></i>
                        </div>
                        <div>
                            <h3 style="margin: 0 0 4px 0; font-size: 1.1rem; color: #b91c1c;">PDF Oficial</h3>
                            <p style="margin: 0; font-size: 0.85rem; color: var(--color-text-muted);">Documento Institucional Impreso</p>
                        </div>
                    </div>
                </div>

                <!-- Tabla Magnificada -->
                <div style="background: white; border-radius: 16px; box-shadow: 0 2px 10px rgba(0,0,0,0.02); border: 1px solid var(--color-border); display: flex; flex-direction: column; flex: 1; overflow: hidden;">
                    <div style="padding: 20px 25px; border-bottom: 1px solid var(--color-border); background: #f8fafc; display: flex; justify-content: space-between; align-items: center;">
                        <h3 style="margin: 0; font-size: 1.1rem; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-table" style="color: var(--color-primary);"></i> Explorador de Datos Estructurados
                        </h3>
                        <span style="background: #e2e8f0; color: #475569; padding: 4px 10px; border-radius: 20px; font-size: 0.75rem; font-weight: 600;">Data Minimizada</span>
                    </div>
                    
                    <div style="flex: 1; overflow-y: auto; max-height: 500px; padding: 0;">
                        <table style="width: 100%; border-collapse: collapse; text-align: left;">
                            <thead style="background: white; position: sticky; top: 0; box-shadow: 0 1px 0 var(--color-border); z-index: 1;" id="report-table-head">
                                <!-- Col inyectadas JS -->
                            </thead>
                            <tbody id="report-table-body" style="font-size: 0.9rem; color: #334155;">
                                <!-- Filas inyectadas JS -->
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Modal de Previsualización Documental -->
            <div id="report-preview-modal" style="display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.6); z-index: 1000; align-items: center; justify-content: center; backdrop-filter: blur(4px);">
                <div style="background: white; border-radius: 16px; width: 95%; max-width: 900px; height: 90vh; display: flex; flex-direction: column; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.3);">
                    
                    <!-- Header Modal -->
                    <div style="padding: 20px 30px; border-bottom: 1px solid var(--color-border); display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border-radius: 16px 16px 0 0;">
                        <h3 style="margin: 0; font-size: 1.25rem; color: #0f172a; display: flex; align-items: center; gap: 10px;">
                            <i class="fas fa-print" style="color: var(--color-primary);"></i> Vista Previa del Documento
                        </h3>
                        <div style="display: flex; gap: 12px;">
                            <button onclick="document.getElementById('report-preview-modal').style.display='none'" style="padding: 10px 18px; background: white; border: 1px solid #cbd5e1; border-radius: 8px; cursor: pointer; font-weight: 600; color: #475569; transition: background 0.2s;" onmouseover="this.style.background='#f1f5f9'" onmouseout="this.style.background='white'">
                                Cerrar
                            </button>
                            <button onclick="if(typeof executePDFPrint === 'function') executePDFPrint()" style="padding: 10px 20px; background: var(--color-primary); border: none; border-radius: 8px; cursor: pointer; font-weight: 600; color: white; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 6px rgba(37, 99, 235, 0.2);">
                                <i class="fas fa-check"></i> Emitir Documento Oficial
                            </button>
                        </div>
                    </div>

                    <!-- Layout Principal Modal -->
                    <div style="flex: 1; overflow-y: auto; padding: 40px 20px; background: #cbd5e1; display: flex; justify-content: center;">
                        <!-- La Hoja de Papel A4 Visual -->
                        <div id="report-paper-sheet" style="background: white; width: 100%; max-width: 794px; /* A4 width aprox px */ min-height: 1123px; padding: 60px; box-shadow: 0 10px 25px rgba(0,0,0,0.1); border-radius: 4px;">
                            <!-- El contenido HTML generado se inyectará aquí -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
};

const ReportsView = {
    render: () => {
        setTimeout(() => {
            if (typeof renderReportDashboard === 'function') {
                renderReportDashboard();
            }
        }, 100);

        return `
            <div class="view-container" style="display: flex; flex-direction: column; gap: 25px;">
                <!-- Cabecera estándar igual al resto de módulos -->
                <div style="display: flex; flex-direction: column; gap: var(--space-md); margin-bottom: var(--space-md);">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                        <h2>Reportes del Sistema</h2>
                        <div style="display: flex; gap: 12px; align-items: center;">
                            <button onclick="if(typeof exportReportToExcel === 'function') exportReportToExcel()" style="padding: 10px 18px; background: white; border: 1px solid #cbd5e1; border-radius: 8px; color: #166534; font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.04);" onmouseover="this.style.background='#f8fafc'; this.style.borderColor='#94a3b8'" onmouseout="this.style.background='white'; this.style.borderColor='#cbd5e1'">
                                <i class="fas fa-file-excel"></i> Exportar Excel
                            </button>
                            <button onclick="if(typeof previewReportPDF === 'function') previewReportPDF()" style="padding: 10px 18px; background: #dc2626; border: 1px solid #b91c1c; border-radius: 8px; color: white; font-weight: 600; font-size: 0.9rem; display: flex; align-items: center; gap: 8px; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 6px rgba(220, 38, 38, 0.2);" onmouseover="this.style.background='#b91c1c'; this.style.borderColor='#991b1b'" onmouseout="this.style.background='#dc2626'; this.style.borderColor='#b91c1c'">
                                <i class="fas fa-file-pdf"></i> Generar PDF
                            </button>
                        </div>
                    </div>
                    <hr style="border: none; border-top: 1px solid var(--color-border); margin: 0 0 var(--space-md) 0;">
                </div>

                <!-- Panel Principal de Configuración de Reporte -->
                <div style="background: white; border-radius: 16px; border: 1px solid var(--color-border); box-shadow: 0 2px 10px rgba(0,0,0,0.02); overflow: hidden;">
                    <div style="padding: 15px 25px; border-bottom: 1px solid var(--color-border); background: #f8fafc;">
                        <h3 style="margin: 0; font-size: 0.95rem; color: var(--color-text-muted); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;"><i class="fas fa-sliders-h" style="margin-right: 6px;"></i> Parámetros de Extracción</h3>
                    </div>
                    <div style="padding: 25px; display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; align-items: end;">
                        
                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.85rem; color: #475569;">Módulo</label>
                            <select id="report-domain" onchange="if(typeof renderReportDashboard === 'function') renderReportDashboard()" style="width: 100%; padding: 11px 15px; border-radius: 8px; border: 1px solid #cbd5e1; background: white; font-weight: 500; font-size: 0.9rem; outline: none; transition: border-color 0.2s; color: #1e293b;" onfocus="this.style.borderColor='var(--color-primary)'; this.style.boxShadow='0 0 0 3px rgba(37,99,235,0.1)'" onblur="this.style.borderColor='#cbd5e1'; this.style.boxShadow='none'">
                                <option value="users">Directorio de Usuarios</option>
                                <option value="news">Registro de Publicaciones</option>
                                <option value="strategic">Ejes de Gestión</option>
                                <option value="projects">Portafolio de Proyectos</option>
                                <option value="courses">Gestión Académica</option>
                            </select>
                        </div>

                        <!-- Filtros Dinámicos Inyectables (Inline css grid cells) -->
                        <div id="report-extra-filters-inline" style="display: contents;"></div>

                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.85rem; color: #475569;">Fecha Desde</label>
                            <input type="date" id="report-date-from" onchange="if(typeof renderReportDashboard === 'function') renderReportDashboard()" style="width: 100%; padding: 10px 15px; border-radius: 8px; border: 1px solid #cbd5e1; font-weight: 500; font-size: 0.9rem; outline: none; transition: border-color 0.2s; color: #1e293b;" onfocus="this.style.borderColor='var(--color-primary)'; this.style.boxShadow='0 0 0 3px rgba(37,99,235,0.1)'" onblur="this.style.borderColor='#cbd5e1'; this.style.boxShadow='none'">
                        </div>

                        <div>
                            <label style="display: block; margin-bottom: 8px; font-weight: 600; font-size: 0.85rem; color: #475569;">Fecha Hasta</label>
                            <input type="date" id="report-date-to" onchange="if(typeof renderReportDashboard === 'function') renderReportDashboard()" style="width: 100%; padding: 10px 15px; border-radius: 8px; border: 1px solid #cbd5e1; font-weight: 500; font-size: 0.9rem; outline: none; transition: border-color 0.2s; color: #1e293b;" onfocus="this.style.borderColor='var(--color-primary)'; this.style.boxShadow='0 0 0 3px rgba(37,99,235,0.1)'" onblur="this.style.borderColor='#cbd5e1'; this.style.boxShadow='none'">
                        </div>

                        <div>
                            <button onclick="if(typeof clearReportFilters === 'function') clearReportFilters()" style="width: 100%; padding: 11px 15px; border: none; border-radius: 8px; font-size: 0.95rem; font-weight: 600; cursor: pointer; background: #f1f5f9; color: #64748b; transition: 0.2s; display: flex; align-items: center; justify-content: center; height: 43px; white-space: nowrap;" onmouseover="this.style.background='#e2e8f0';this.style.color='#475569';" onmouseout="this.style.background='#f1f5f9';this.style.color='#64748b';">
                                <i class="fas fa-times" style="margin-right: 8px;"></i> Limpiar Filtros
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Stats Container (Injected inside a slim card) -->
                <div id="report-stats-container" style="display: none; background: white; border-radius: 12px; padding: 20px 25px; border: 1px solid var(--color-border); box-shadow: 0 2px 10px rgba(0,0,0,0.02); gap: 30px; align-items: center; flex-wrap: wrap;">
                    <!-- Aquí se inyectarán stats con estilo simple -->
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

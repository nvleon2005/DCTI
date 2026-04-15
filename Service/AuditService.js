/**
 * Service/AuditService.js
 * Servicio centralizado de Auditoría para el Portal DCTI.
 * Registra creación, modificación, eliminación de entidades y acciones de usuarios.
 * Almacena los logs en localStorage('dcti_audit_log').
 */

const AuditService = {
    STORAGE_KEY: 'dcti_audit_log',

    // Límite dinámico basado en capacidad de localStorage (~5MB)
    // Cada registro pesa ~300 bytes → ~15,000 registros en 5MB
    // Reservamos espacio para otros datos del sistema → máximo ~2000 registros
    MAX_RECORDS: 2000,

    /**
     * Registra un evento de auditoría en el log centralizado.
     * @param {string} action - Tipo: Creación, Modificación, Eliminación, Cambio de Estado, Inicio de Sesión, Cierre de Sesión, Recuperación
     * @param {string} module - Módulo: Usuarios, Noticias, Proyectos, Cursos, Áreas Estratégicas, DCTI, Autenticación
     * @param {string|number} entityId - ID del registro afectado
     * @param {string} entityLabel - Nombre/titular legible del registro
     * @param {string} details - Descripción de los cambios realizados
     * @param {string} [user] - Usuario que realizó la acción (auto-detectado de sesión si no se provee)
     */
    log(action, module, entityId, entityLabel, details, user) {
        try {
            const session = JSON.parse(localStorage.getItem('dcti_session')) || {};
            const responsibleUser = user || session.name || session.username || 'Sistema';

            const entry = {
                id: `AUD-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                timestamp: new Date().toISOString(),
                action: action,
                module: module,
                entityId: entityId || 'N/A',
                entityLabel: entityLabel || 'N/A',
                user: responsibleUser,
                details: details || ''
            };

            const logs = this.getAll();
            logs.unshift(entry); // Más reciente primero

            // Control de tamaño: recortar si excede el máximo
            if (logs.length > this.MAX_RECORDS) {
                logs.length = this.MAX_RECORDS;
            }

            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(logs));
            return entry;
        } catch (e) {
            console.error('AuditService: Error registrando evento de auditoría:', e);
            return null;
        }
    },

    /**
     * Obtiene todos los registros de auditoría.
     * @param {Object} [filters] - Filtros opcionales
     * @param {string} [filters.module] - Filtrar por módulo
     * @param {string} [filters.action] - Filtrar por tipo de acción
     * @param {string} [filters.user] - Filtrar por usuario
     * @param {string} [filters.dateFrom] - Fecha inicio (ISO string)
     * @param {string} [filters.dateTo] - Fecha fin (ISO string)
     * @returns {Array} Registros filtrados
     */
    getAll(filters) {
        try {
            const raw = localStorage.getItem(this.STORAGE_KEY);
            let logs = raw ? JSON.parse(raw) : [];

            if (filters) {
                if (filters.module && filters.module !== 'Todos') {
                    logs = logs.filter(l => l.module === filters.module);
                }
                if (filters.action && filters.action !== 'Todas') {
                    logs = logs.filter(l => l.action === filters.action);
                }
                if (filters.user && filters.user !== 'Todos') {
                    logs = logs.filter(l => l.user === filters.user);
                }
                if (filters.dateFrom) {
                    const from = new Date(filters.dateFrom);
                    from.setHours(0, 0, 0, 0);
                    logs = logs.filter(l => new Date(l.timestamp) >= from);
                }
                if (filters.dateTo) {
                    const to = new Date(filters.dateTo);
                    to.setHours(23, 59, 59, 999);
                    logs = logs.filter(l => new Date(l.timestamp) <= to);
                }
            }

            return logs;
        } catch (e) {
            console.error('AuditService: Error leyendo logs:', e);
            return [];
        }
    },

    /**
     * Obtiene registros filtrados por módulo.
     */
    getByModule(module) {
        return this.getAll({ module });
    },

    /**
     * Obtiene registros filtrados por usuario.
     */
    getByUser(user) {
        return this.getAll({ user });
    },

    /**
     * Obtiene estadísticas resumidas del log.
     */
    getStats() {
        const all = this.getAll();
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const todayLogs = all.filter(l => new Date(l.timestamp) >= today);
        const users = [...new Set(all.map(l => l.user))];
        const modules = {};
        all.forEach(l => {
            modules[l.module] = (modules[l.module] || 0) + 1;
        });

        const topModule = Object.entries(modules).sort((a, b) => b[1] - a[1])[0];

        return {
            total: all.length,
            today: todayLogs.length,
            uniqueUsers: users.length,
            topModule: topModule ? topModule[0] : 'N/A',
            topModuleCount: topModule ? topModule[1] : 0
        };
    },

    /**
     * Obtiene la lista única de usuarios que aparecen en los logs.
     */
    getUniqueUsers() {
        const all = this.getAll();
        return [...new Set(all.map(l => l.user))].sort();
    },

    /**
     * Limpia todo el log de auditoría (solo admin).
     */
    clearAll() {
        localStorage.removeItem(this.STORAGE_KEY);
    }
};

// Exportación global
window.AuditService = AuditService;

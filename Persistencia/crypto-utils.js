/**
 * ADMIN DASHBOARD - CRYPTO UTILS
 * Standalone utilities for security compliance.
 */

/**
 * Genera un hash SHA-256 de un string (Asíncrono usando Web Crypto API)
 * Utilizado para cumplimiento de HU-001 y Ley Especial contra Delitos Informáticos.
 */
async function hashSHA256(message) {
    if (window.crypto && window.crypto.subtle) {
        try {
            const msgBuffer = new TextEncoder().encode(message);
            const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
            const hashArray = Array.from(new Uint8Array(hashBuffer));
            return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        } catch (e) {
            console.warn("Crypto API failed, falling back to basic hash", e);
        }
    }

    // Fallback básico para entornos no seguros como protocol file:///
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
        const char = message.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return 'fb_' + Math.abs(hash).toString(16);
}

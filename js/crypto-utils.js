/**
 * ADMIN DASHBOARD - CRYPTO UTILS
 * Standalone utilities for security compliance.
 */

/**
 * Genera un hash SHA-256 de un string (Asíncrono usando Web Crypto API)
 * Utilizado para cumplimiento de HU-001 y Ley Especial contra Delitos Informáticos.
 */
async function hashSHA256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

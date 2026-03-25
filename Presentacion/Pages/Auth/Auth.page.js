/**
 * Presentacion/Pages/Auth/Auth.page.js
 * Vista modular para el sistema de Autenticación.
 */

window.AuthView = {
    render: () => {
        return `
            <section id="login-screen" class="login-screen">
                <div class="login-card">
                    <div class="login-card__left">
                        <!-- FORMULARIO DE LOGIN -->
                        <div id="login-view">
                            <div class="login-header">
                                <h1 style="font-size: 1.5rem; line-height: 1.2; margin-bottom: 10px;">Inicio de sesión</h1>
                                <p>&nbsp;</p>
                            </div>
                            <form id="login-form" class="login-form">
                                <div class="form-field">
                                    <input type="email" id="login-email" placeholder="Correo Electrónico" required>
                                </div>
                                <div class="form-field password-wrapper">
                                    <input type="password" id="login-password" placeholder="Contraseña" required>
                                    <button type="button" class="toggle-password" data-target="login-password">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <div id="login-error" class="login-error hidden">Credenciales incorrectas</div>
                                <div id="lockout-error" class="login-error hidden"
                                    style="background: #fff1f2; border: 1px solid #fda4af; padding: 10px; border-radius: 8px;">
                                    Cuenta bloqueada temporalmente por seguridad (15 min).</div>
                                <button type="submit" class="btn-login">INICIAR SESIÓN</button>
                                <div class="login-links">
                                    <a href="#" id="to-recovery">¿Perdiste tu contraseña?</a>
                                    <!-- <a href="#" id="to-register">¿No tienes cuenta? Regístrate</a> -->
                                    <a href="index.html"
                                        style="display: block; margin-top: 15px; color: var(--color-text-muted); font-size: 0.8rem;"><i
                                            class="fas fa-arrow-left"></i> Regresar al Portal</a>
                                </div>
                            </form>
                        </div>

                        <!-- FORMULARIO DE RECUPERACIÓN -->
                        <div id="recovery-view" class="hidden">
                            <div class="login-header">
                                <h1>RECUPERAR ACCESO</h1>
                                <h2>PORTAL DCTI</h2>
                                <p>Ingresa tu correo para recibir un enlace de restablecimiento</p>
                            </div>
                            <form id="recovery-form" class="login-form">
                                <div class="form-field">
                                    <input type="email" id="recovery-email" placeholder="Correo Electrónico" required>
                                </div>
                                <div id="recovery-error" class="login-error hidden">Este correo no está registrado</div>
                                <div id="recovery-sending" class="login-info hidden"
                                    style="text-align: center; color: var(--color-primary); font-size: 0.85rem; padding: 5px;">
                                    <i class="fas fa-spinner fa-spin"></i> Enviando enlace...
                                </div>
                                <div id="recovery-success" class="login-success hidden"
                                    style="text-align: center; color: #22c55e; font-size: 0.85rem; padding: 10px; border: 1px solid #dcfce7; background: #f0fdf4; border-radius: var(--radius-md); margin-bottom: 15px;">
                                    <i class="fas fa-check-circle"></i> Enlace enviado con éxito a tu correo. Revisa tu bandeja
                                    de entrada.
                                </div>
                                <button type="submit" id="recovery-submit" class="btn-login">ENVIAR ENLACE</button>
                                <div class="login-links">
                                    <a href="#" id="back-to-login">Volver al Inicio de Sesión</a>
                                </div>
                            </form>
                        </div>

                        <!-- FORMULARIO DE REGISTRO (Oculto permanentemente por requerimiento) -->
                        <div id="register-view" class="hidden" style="display: none !important;">
                            <div class="login-header">
                                <h1>CREAR CUENTA</h1>
                                <h2>PORTAL DCTI</h2>
                                <p>&nbsp;</p>
                            </div>
                            <form id="register-form" class="login-form">
                                <div class="form-field">
                                    <input type="text" id="reg-name" placeholder="Nombre de usuario" required>
                                </div>
                                <div class="form-field">
                                    <input type="email" id="reg-email" placeholder="Correo Electrónico" required>
                                </div>
                                <div class="form-field password-wrapper">
                                    <input type="password" id="reg-password" placeholder="Contraseña" required>
                                    <button type="button" class="toggle-password" data-target="reg-password">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <p
                                    style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: -10px; margin-bottom: 10px; line-height: 1.2;">
                                    * Mínimo 8 caracteres, una mayúscula, un número y un carácter especial.
                                </p>
                                <div class="form-field password-wrapper">
                                    <input type="password" id="reg-confirm-password" placeholder="Confirmar Contraseña"
                                        required>
                                    <button type="button" class="toggle-password" data-target="reg-confirm-password">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </div>
                                <div id="reg-error" class="login-error hidden">Este correo ya está registrado. ¿Olvidó su
                                    contraseña? <a href="#" id="to-recovery-from-reg"
                                        style="color: var(--color-primary); font-weight: 600; text-decoration: underline;">Recuperar
                                        aquí</a></div>
                                <div id="reg-match-error" class="login-error hidden">Las contraseñas no coinciden</div>
                                <div id="reg-complexity-error" class="login-error hidden">La contraseña no cumple con los
                                    requisitos de seguridad</div>
                                <button type="submit" class="btn-login">REGISTRARSE</button>
                                <div class="login-links">
                                    <a href="#" id="to-login">¿Ya tienes cuenta? Inicia Sesión</a>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div class="login-card__right"
                        style="display: flex; flex-direction: column; align-items: center; justify-content: center;">
                        <div class="brand-display"
                            style="display: flex; flex-direction: column; align-items: center; text-align: center; gap: 15px;">
                            <h1
                                style="font-size: 3.5rem; color: white; font-weight: 800; margin: 0; letter-spacing: 2px; line-height: 1;">
                                DCTI</h1>
                            <div class="brand-icon"
                                style="background: transparent; box-shadow: none; width: 140px; height: 140px; margin: 0; border: none; border-radius: 0; display: flex; align-items: center; justify-content: center;">
                                <img src="assets/images/logo.png" alt="DCTI Logo"
                                    style="width: 100%; height: 100%; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">
                            </div>
                            <div class="brand-text" style="display: block; margin-top: 10px;">
                                <p
                                    style="font-size: 1.05rem; line-height: 1.4; color: white; font-weight: 500; margin: 0; max-width: 280px; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">
                                    Dirección de Ciencia, Tecnología e Innovación del estado Monagas.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        `;
    }
};

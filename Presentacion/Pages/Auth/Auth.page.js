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
                                <h1>INICIO DE SESIÓN</h1>
                                <h2>PORTAL DCTI</h2>
                                <p>Ingresa tus credenciales para acceder al sistema</p>
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

                        <!-- FLUJO DE RECUPERACIÓN (4 pasos) -->
                        <div id="recovery-view" class="hidden">

                            <!-- PASO 0: Selección de método -->
                            <div id="recovery-step-0">
                                <div class="login-header">
                                    <h1>RECUPERAR ACCESO</h1>
                                    <h2>PORTAL DCTI</h2>
                                    <p>Selecciona un método de recuperación</p>
                                </div>
                                <div style="display: flex; flex-direction: column; gap: 8px;">

                                    <!-- Preguntas de Seguridad (ACTIVO) -->
                                    <div id="method-questions" onclick="selectRecoveryMethod('questions')" style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 10px; border: 2px solid rgba(84,14,144,0.2); background: rgba(84,14,144,0.03); cursor: pointer; transition: all 0.2s ease;">
                                        <div style="width: 34px; height: 34px; border-radius: 8px; background: linear-gradient(135deg,#540E90,#7c3aed); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                            <i class="fas fa-user-shield" style="color: white; font-size: 0.85rem;"></i>
                                        </div>
                                        <span style="flex: 1; font-size: 0.85rem; font-weight: 600; color: #1e293b;">Preguntas de Seguridad</span>
                                        <i class="fas fa-chevron-right" style="color: #540E90; font-size: 0.75rem;"></i>
                                    </div>

                                    <!-- Correo Electrónico (PRÓXIMAMENTE) -->
                                    <div style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #f8fafc; cursor: not-allowed; opacity: 0.55;">
                                        <div style="width: 34px; height: 34px; border-radius: 8px; background: linear-gradient(135deg,#ea4335,#fbbc05); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                            <i class="fas fa-envelope" style="color: white; font-size: 0.85rem;"></i>
                                        </div>
                                        <span style="flex: 1; font-size: 0.85rem; font-weight: 600; color: #94a3b8;">Correo Electrónico</span>
                                        <span style="background: #e2e8f0; color: #64748b; padding: 2px 8px; border-radius: 12px; font-size: 0.6rem; font-weight: 700;">PRONTO</span>
                                    </div>

                                    <!-- Teléfono (PRÓXIMAMENTE) -->
                                    <div style="display: flex; align-items: center; gap: 12px; padding: 10px 14px; border-radius: 10px; border: 1.5px solid #e2e8f0; background: #f8fafc; cursor: not-allowed; opacity: 0.55;">
                                        <div style="width: 34px; height: 34px; border-radius: 8px; background: linear-gradient(135deg,#10b981,#059669); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                                            <i class="fas fa-mobile-alt" style="color: white; font-size: 0.9rem;"></i>
                                        </div>
                                        <span style="flex: 1; font-size: 0.85rem; font-weight: 600; color: #94a3b8;">Código por Teléfono</span>
                                        <span style="background: #e2e8f0; color: #64748b; padding: 2px 8px; border-radius: 12px; font-size: 0.6rem; font-weight: 700;">PRONTO</span>
                                    </div>

                                </div>
                                <div class="login-links" style="margin-top: 14px;">
                                    <a href="#" id="back-to-login">Volver al Inicio de Sesión</a>
                                </div>
                            </div>

                            <!-- PASO 1: Identificar cuenta por email -->
                            <div id="recovery-step-1" class="hidden">
                                <div class="login-header">
                                    <h1>RECUPERAR ACCESO</h1>
                                    <h2>PORTAL DCTI</h2>
                                    <p>Ingresa el correo electrónico asociado a tu cuenta</p>
                                </div>
                                <form id="recovery-form-step1" class="login-form">
                                    <div class="form-field">
                                        <input type="email" id="recovery-email" placeholder="Correo Electrónico" required>
                                    </div>
                                    <div id="recovery-error" class="login-error hidden"></div>
                                    <button type="submit" class="btn-login">CONTINUAR</button>
                                    <div class="login-links">
                                        <a href="#" id="back-to-methods">Cambiar método de recuperación</a>
                                    </div>
                                </form>
                            </div>

                            <!-- PASO 2: Preguntas de seguridad -->
                            <div id="recovery-step-2" class="hidden">
                                <div class="login-header">
                                    <h1>RECUPERAR ACCESO</h1>
                                    <h2>PORTAL DCTI</h2>
                                    <p>Responde tus preguntas de seguridad</p>
                                </div>
                                <form id="recovery-form-step2" class="login-form">
                                    <div class="form-field">
                                        <label id="recovery-q1-label" style="display: block; font-size: 0.8rem; font-weight: 600; color: #540E90; margin-bottom: 5px;"></label>
                                        <input type="text" id="recovery-a1" placeholder="Tu respuesta" required>
                                    </div>
                                    <div class="form-field">
                                        <label id="recovery-q2-label" style="display: block; font-size: 0.8rem; font-weight: 600; color: #540E90; margin-bottom: 5px;"></label>
                                        <input type="text" id="recovery-a2" placeholder="Tu respuesta" required>
                                    </div>
                                    <div id="recovery-answers-error" class="login-error hidden"></div>
                                    <button type="submit" class="btn-login">VERIFICAR RESPUESTAS</button>
                                    <div class="login-links">
                                        <a href="#" id="back-to-step1">Cambiar correo</a>
                                    </div>
                                </form>
                            </div>

                            <!-- PASO 3: Nueva contraseña -->
                            <div id="recovery-step-3" class="hidden">
                                <div class="login-header">
                                    <h1>NUEVA CONTRASEÑA</h1>
                                    <h2>PORTAL DCTI</h2>
                                    <p>Crea una nueva contraseña segura para tu cuenta</p>
                                </div>
                                <form id="recovery-form-step3" class="login-form">
                                    <div class="form-field password-wrapper">
                                        <input type="password" id="recovery-new-pass" placeholder="Nueva Contraseña" required>
                                        <button type="button" class="toggle-password" data-target="recovery-new-pass">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                    <p style="font-size: 0.7rem; color: var(--color-text-muted); margin-top: -5px; margin-bottom: 5px; line-height: 1.2;">
                                        * Mínimo 8 caracteres, una mayúscula, un número y un carácter especial.
                                    </p>
                                    <div class="form-field password-wrapper">
                                        <input type="password" id="recovery-confirm-pass" placeholder="Confirmar Contraseña" required>
                                        <button type="button" class="toggle-password" data-target="recovery-confirm-pass">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                    </div>
                                    <div id="recovery-pass-error" class="login-error hidden"></div>
                                    <button type="submit" class="btn-login">GUARDAR CONTRASEÑA</button>
                                </form>
                            </div>
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

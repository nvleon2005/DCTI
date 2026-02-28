/**
 * ADMIN DASHBOARD - AUTH LOGIC (Local-First v10.0.0)
 * Responsabilidad: Gestión de Registro, Login y Redirección por Roles.
 * Cumplimiento: HU-001, Ley contra Delitos Informáticos, Ley de Infogobierno.
 */

const AUTH_UI = {
    loginScreen: document.getElementById('login-screen'),
    loginView: document.getElementById('login-view'),
    registerView: document.getElementById('register-view'),
    recoveryView: document.getElementById('recovery-view'),

    loginForm: document.getElementById('login-form'),
    loginEmail: document.getElementById('login-email'),
    loginPass: document.getElementById('login-password'),
    loginError: document.getElementById('login-error'),

    registerForm: document.getElementById('register-form'),
    regName: document.getElementById('reg-name'),
    regEmail: document.getElementById('reg-email'),
    regPass: document.getElementById('reg-password'),
    regConfirmPass: document.getElementById('reg-confirm-password'),
    regError: document.getElementById('reg-error'),
    regMatchError: document.getElementById('reg-match-error'),
    regComplexityError: document.getElementById('reg-complexity-error'),

    recoveryForm: document.getElementById('recovery-form'),
    recoveryEmail: document.getElementById('recovery-email'),
    recoveryError: document.getElementById('recovery-error'),
    recoverySending: document.getElementById('recovery-sending'),
    recoverySuccess: document.getElementById('recovery-success'),
    recoverySubmit: document.getElementById('recovery-submit'),

    toRegisterLink: document.getElementById('to-register'),
    toLoginLink: document.getElementById('to-login'),
    toRecoveryLink: document.getElementById('to-recovery'),
    toRecoveryFromReg: document.getElementById('to-recovery-from-reg'),
    backToLoginLink: document.getElementById('back-to-login'),
    lockoutError: document.getElementById('lockout-error')
};

// --- CONFIGURACIÓN DE SEGURIDAD (Skill: Requerimiento) ---
const SECURITY_CONFIG = {
    maxAttempts: 3,
    lockoutTimeMS: 15 * 60 * 1000 // 15 minutos
};

// --- UTILIDADES DE SEGURIDAD (Criptografía) ---

/**
 * Valida la complejidad de la contraseña (Ley de Infogobierno)
 * 8+ caracteres, 1 Mayúscula, 1 Número, 1 Carácter Especial.
 */
function validatePasswordComplexity(pass) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pass);
}

/**
 * Valida formato de email estándar
 */
function validateEmailFormat(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// --- LÓGICA DE NEGOCIO ---

async function handleLogin(e) {
    e.preventDefault();
    const email = AUTH_UI.loginEmail.value;
    const pass = AUTH_UI.loginPass.value;

    // 1. Verificar bloqueo por fuerza bruta
    const lockoutData = JSON.parse(localStorage.getItem(`lockout_${email}`)) || { attempts: 0, unlockTime: 0 };
    if (Date.now() < lockoutData.unlockTime) {
        const remainingMin = Math.ceil((lockoutData.unlockTime - Date.now()) / 60000);
        AUTH_UI.lockoutError.textContent = `Cuenta bloqueada temporalmente por seguridad. Intente en ${remainingMin} min.`;
        AUTH_UI.lockoutError.classList.remove('hidden');
        AUTH_UI.loginError.classList.add('hidden');
        return;
    }

    const localUsers = typeof getLocalUsers === 'function' ? getLocalUsers() : [];
    const allUsers = [...AUTH_CONFIG.hardcodedUsers, ...localUsers];
    const user = allUsers.find(u => u.email === email);

    if (user) {
        const inputHash = await hashSHA256(pass);
        const isValid = (user.password === pass) || (user.password === inputHash);

        if (isValid) {
            if (user.status === 'Inactivo') {
                AlertService.notify('Acceso Restringido', 'Esta cuenta ha sido inhabilitada. Contacte con soporte.', 'error');
                return;
            }
            if (user.status === 'Pendiente') {
                AlertService.notify('Cuenta Pendiente', 'Tu cuenta está en proceso de revisión. Contacta al administrador.', 'warning');
                return;
            }

            // Éxito: Resetear intentos y generar token
            localStorage.removeItem(`lockout_${email}`);
            AUTH_UI.loginError.classList.add('hidden');
            AUTH_UI.lockoutError.classList.add('hidden');

            const sessionToken = btoa(JSON.stringify({
                email: user.email,
                role: user.role,
                iat: Date.now(),
                exp: Date.now() + (8 * 60 * 60 * 1000) // 8 horas
            }));

            localStorage.setItem('dcti_session', JSON.stringify({ ...user, token: sessionToken }));
            checkRoleAndRedirect(user);
        } else {
            handleFailedAttempt(email, lockoutData);
        }
    } else {
        // Para evitar enumeración, no decimos si el correo existe o no
        handleFailedAttempt(email, lockoutData);
    }
}

function handleFailedAttempt(email, data) {
    data.attempts++;
    if (data.attempts >= SECURITY_CONFIG.maxAttempts) {
        data.unlockTime = Date.now() + SECURITY_CONFIG.lockoutTimeMS;
        AUTH_UI.lockoutError.classList.remove('hidden');
        AUTH_UI.loginError.classList.add('hidden');
    } else {
        AUTH_UI.loginError.classList.remove('hidden');
        AUTH_UI.lockoutError.classList.add('hidden');
    }
    localStorage.setItem(`lockout_${email}`, JSON.stringify(data));
}

async function handleRegister(e) {
    e.preventDefault();
    const name = AUTH_UI.regName.value;
    const email = AUTH_UI.regEmail.value;
    const pass = AUTH_UI.regPass.value;
    const confirmPass = AUTH_UI.regConfirmPass.value;

    // 1. Validar formato de email
    if (!validateEmailFormat(email)) {
        AlertService.notify('Email Inválido', 'El formato del correo electrónico no es correcto.', 'error');
        return;
    }

    // 2. Validar complejidad de contraseña
    if (!validatePasswordComplexity(pass)) {
        AUTH_UI.regComplexityError.classList.remove('hidden');
        return;
    } else {
        AUTH_UI.regComplexityError.classList.add('hidden');
    }

    // 3. Validar que coincidan las contraseñas
    if (pass !== confirmPass) {
        AUTH_UI.regMatchError.classList.remove('hidden');
        return;
    } else {
        AUTH_UI.regMatchError.classList.add('hidden');
    }

    // 4. Validar si el usuario ya existe
    const localUsers = typeof getLocalUsers === 'function' ? getLocalUsers() : [];
    if (localUsers.some(u => u.email === email) || AUTH_CONFIG.hardcodedUsers.some(u => u.email === email)) {
        AUTH_UI.regError.classList.remove('hidden'); // Este div ahora tiene el link a recuperación
        return;
    }

    // 5. Encriptar contraseña con SHA-256 (HU-001)
    const passwordHash = await hashSHA256(pass);

    const newUser = {
        name,
        email,
        password: passwordHash, // Guardamos el HASH
        role: 'visitante',
        status: 'Pendiente', // Inicia como pendiente (Simulación de activación)
        initials: name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2)
    };

    if (typeof saveLocalUser === 'function') {
        saveLocalUser(newUser);
    }

    AUTH_UI.regError.classList.add('hidden');
    AUTH_UI.registerForm.reset();
    toggleAuthView('login');
    AlertService.notify('Registro Exitoso', 'Cuenta creada. El administrador debe activar su acceso antes de iniciar sesión.', 'success', 6000);
}

async function handleRecovery(e) {
    e.preventDefault();
    const email = AUTH_UI.recoveryEmail.value;

    const localUsers = typeof getLocalUsers === 'function' ? getLocalUsers() : [];
    const allUsers = [...AUTH_CONFIG.hardcodedUsers, ...localUsers];
    const user = allUsers.find(u => u.email === email);

    if (user) {
        // Reset states
        AUTH_UI.recoveryError.classList.add('hidden');
        AUTH_UI.recoverySuccess.classList.add('hidden');

        // Simular envío
        AUTH_UI.recoverySending.classList.remove('hidden');
        AUTH_UI.recoverySubmit.disabled = true;
        AUTH_UI.recoverySubmit.style.opacity = '0.5';

        setTimeout(() => {
            AUTH_UI.recoverySending.classList.add('hidden');
            AUTH_UI.recoverySuccess.classList.remove('hidden');
            AUTH_UI.recoverySubmit.classList.add('hidden'); // Ocultar botón tras éxito

            // Simular cierre de sesión a los 3 segundos o dejar que el usuario vuelva
            setTimeout(() => {
                AlertService.notify('Recuperación Enviada', `Se han enviado instrucciones a ${email}.`, 'success');
            }, 500);
        }, 2000);
    } else {
        AUTH_UI.recoveryError.classList.remove('hidden');
        AUTH_UI.recoverySuccess.classList.add('hidden');
    }
}

function checkRoleAndRedirect(user) {
    if (user.role === 'admin' || user.role === 'editor') {
        if (typeof startDashboardSession === 'function') {
            startDashboardSession(user);
        } else {
            window.location.href = 'login.html';
        }
    } else if (user.role === 'visitante') {
        window.location.href = 'index.html';
    }
}

function toggleAuthView(view) {
    AUTH_UI.loginView.classList.add('hidden');
    AUTH_UI.registerView.classList.add('hidden');
    AUTH_UI.recoveryView.classList.add('hidden');

    if (view === 'register') {
        AUTH_UI.registerView.classList.remove('hidden');
    } else if (view === 'recovery') {
        // Reset form to initial state when entering
        AUTH_UI.recoveryForm.reset();
        AUTH_UI.recoveryError.classList.add('hidden');
        AUTH_UI.recoverySuccess.classList.add('hidden');
        AUTH_UI.recoverySending.classList.add('hidden');
        AUTH_UI.recoverySubmit.classList.remove('hidden');
        AUTH_UI.recoverySubmit.disabled = false;
        AUTH_UI.recoverySubmit.style.opacity = '1';

        AUTH_UI.recoveryView.classList.remove('hidden');
    } else {
        AUTH_UI.loginView.classList.remove('hidden');
    }
}

function initVisibilityToggles() {
    const buttons = document.querySelectorAll('.toggle-password');
    buttons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            const icon = btn.querySelector('i');

            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
}

// --- INICIALIZACIÓN ---

document.addEventListener('DOMContentLoaded', () => {
    if (AUTH_UI.loginForm) AUTH_UI.loginForm.addEventListener('submit', handleLogin);
    if (AUTH_UI.registerForm) AUTH_UI.registerForm.addEventListener('submit', handleRegister);
    if (AUTH_UI.recoveryForm) AUTH_UI.recoveryForm.addEventListener('submit', handleRecovery);

    if (AUTH_UI.toRegisterLink) AUTH_UI.toRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthView('register');
    });

    if (AUTH_UI.toLoginLink) AUTH_UI.toLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthView('login');
    });

    if (AUTH_UI.toRecoveryLink) AUTH_UI.toRecoveryLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthView('recovery');
    });

    if (AUTH_UI.toRecoveryFromReg) AUTH_UI.toRecoveryFromReg.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthView('recovery');
    });

    if (AUTH_UI.backToLoginLink) AUTH_UI.backToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        toggleAuthView('login');
    });

    initVisibilityToggles();

    const savedSession = localStorage.getItem('dcti_session');
    if (savedSession) {
        const user = JSON.parse(savedSession);
        if (user.role === 'visitante' && window.location.pathname.includes('login.html')) {
            window.location.href = 'index.html';
        }
    }
});

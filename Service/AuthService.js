/**
 * ADMIN DASHBOARD - AUTH LOGIC (Modular v12.0.0)
 * Responsabilidad: Gestión de Registro, Login, Recuperación por Preguntas de Seguridad y Redirección por Roles.
 */

// --- CATÁLOGO DE PREGUNTAS DE SEGURIDAD ---
const SECURITY_QUESTIONS = [
    "¿Cuál es el nombre de tu primera mascota?",
    "¿En qué ciudad naciste?",
    "¿Cuál es el nombre de tu mejor amigo de la infancia?",
    "¿Cuál fue tu primer número de teléfono?",
    "¿Cuál es el segundo nombre de tu madre?",
    "¿Cuál fue tu primer trabajo?",
    "¿Cuál es tu comida favorita?",
    "¿Cómo se llama tu escuela primaria?"
];
window.SECURITY_QUESTIONS = SECURITY_QUESTIONS;

let AUTH_UI = {};
let _recoveryTargetEmail = null;

function initAuthUI() {
    AUTH_UI = {
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

        // Recovery Step 0 - Method selection
        recoveryStep0: document.getElementById('recovery-step-0'),

        // Recovery Step 1
        recoveryStep1: document.getElementById('recovery-step-1'),
        recoveryFormStep1: document.getElementById('recovery-form-step1'),
        recoveryEmail: document.getElementById('recovery-email'),
        recoveryError: document.getElementById('recovery-error'),

        // Recovery Step 2
        recoveryStep2: document.getElementById('recovery-step-2'),
        recoveryFormStep2: document.getElementById('recovery-form-step2'),
        recoveryQ1Label: document.getElementById('recovery-q1-label'),
        recoveryQ2Label: document.getElementById('recovery-q2-label'),
        recoveryA1: document.getElementById('recovery-a1'),
        recoveryA2: document.getElementById('recovery-a2'),
        recoveryAnswersError: document.getElementById('recovery-answers-error'),

        // Recovery Step 3
        recoveryStep3: document.getElementById('recovery-step-3'),
        recoveryFormStep3: document.getElementById('recovery-form-step3'),
        recoveryNewPass: document.getElementById('recovery-new-pass'),
        recoveryConfirmPass: document.getElementById('recovery-confirm-pass'),
        recoveryPassError: document.getElementById('recovery-pass-error'),

        // Navigation links
        toRegisterLink: document.getElementById('to-register'),
        toLoginLink: document.getElementById('to-login'),
        toRecoveryLink: document.getElementById('to-recovery'),
        toRecoveryFromReg: document.getElementById('to-recovery-from-reg'),
        backToLoginLink: document.getElementById('back-to-login'),
        backToMethodsLink: document.getElementById('back-to-methods'),
        backToStep1Link: document.getElementById('back-to-step1'),
        lockoutError: document.getElementById('lockout-error')
    };
}

// --- CONFIGURACIÓN DE SEGURIDAD ---
const SECURITY_CONFIG = {
    maxAttempts: 3,
    lockoutTimeMS: 15 * 60 * 1000
};

// --- UTILIDADES ---
function validatePasswordComplexity(pass) {
    const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return regex.test(pass);
}

function validateEmailFormat(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

// --- LÓGICA DE NEGOCIO ---
async function handleLogin(e) {
    e.preventDefault();
    const email = AUTH_UI.loginEmail.value;
    const pass = AUTH_UI.loginPass.value;

    try {
        const lockoutData = JSON.parse(localStorage.getItem(`lockout_${email}`)) || { attempts: 0, unlockTime: 0 };
        if (Date.now() < lockoutData.unlockTime) {
            const remainingMin = Math.ceil((lockoutData.unlockTime - Date.now()) / 60000);
            AUTH_UI.lockoutError.textContent = `Cuenta bloqueada temporalmente. Intente en ${remainingMin} min.`;
            AUTH_UI.lockoutError.classList.remove('hidden');
            AUTH_UI.loginError.classList.add('hidden');
            return;
        }

        const localUsers = typeof getLocalUsers === 'function' ? getLocalUsers() : [];
        const allUsers = [...(typeof AUTH_CONFIG !== 'undefined' ? AUTH_CONFIG.hardcodedUsers : []), ...localUsers];
        const user = allUsers.find(u => u.email === email);

        if (user) {
            const inputHash = await hashSHA256(pass);
            const isValid = (user.password === pass) || (user.password === inputHash);

            if (isValid) {
                if (user.status === 'Inactivo') {
                    AlertService.notify('Acceso Restringido', 'Cuenta inhabilitada.', 'error');
                    return;
                }
                localStorage.removeItem(`lockout_${email}`);

                const sessionToken = btoa(JSON.stringify({ email: user.email, role: user.role, iat: Date.now() }));
                localStorage.setItem('dcti_session', JSON.stringify({ ...user, token: sessionToken }));

                if (typeof App !== 'undefined') {
                    const fullSession = JSON.parse(localStorage.getItem('dcti_session'));
                    App.start(fullSession);
                }

                // Nudge sutil: si el usuario NO tiene preguntas de seguridad configuradas
                // (Excluir usuarios de MockData: no pueden configurar preguntas de seguridad)
                const isHardcodedUser = user.email === 'admin@dcti.gob' || user.email === 'editor@dcti.gob';
                if (!isHardcodedUser && (!user.securityQ1 || !user.securityQ2)) {
                    setTimeout(() => {
                        if (typeof AlertService !== 'undefined') {
                            AlertService.notify(
                                'Protege tu cuenta',
                                'Te recomendamos configurar tus preguntas de seguridad desde "Mi Perfil" para recuperar tu contraseña en caso de emergencia.',
                                'info'
                            );
                        }
                    }, 1500);
                }

                if (user.role === 'admin' || user.role === 'editor') {
                    if (typeof AuditService !== 'undefined') AuditService.log('Inicio de Sesión', 'Autenticación', user.email, user.name || user.username || user.email, 'Acceso al dashboard administrativo');
                    Router.navigateTo('dashboard');
                } else {
                    if (typeof AuditService !== 'undefined') AuditService.log('Inicio de Sesión', 'Autenticación', user.email, user.name || user.username || user.email, 'Acceso al portal público');
                    Router.navigateTo('inicio');
                }
            } else {
                handleFailedAttempt(email, lockoutData);
            }
        } else {
            handleFailedAttempt(email, lockoutData);
        }
    } catch (err) {
        console.error('handleLogin: Error crítico durante el proceso:', err);
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
    const sanitize = (s) => (window.sanitizeHTML ? window.sanitizeHTML(s) : s);
    const name = sanitize(AUTH_UI.regName.value.trim());
    const email = sanitize(AUTH_UI.regEmail.value.trim());
    const pass = AUTH_UI.regPass.value;
    const confirmPass = AUTH_UI.regConfirmPass.value;

    if (!validateEmailFormat(email)) {
        AlertService.notify('Email Inválido', 'Formato incorrecto.', 'error');
        return;
    }

    if (!validatePasswordComplexity(pass)) {
        AUTH_UI.regComplexityError.classList.remove('hidden');
        return;
    }

    if (pass !== confirmPass) {
        AUTH_UI.regMatchError.classList.remove('hidden');
        return;
    }

    const localUsers = typeof getLocalUsers === 'function' ? getLocalUsers() : [];
    if (localUsers.some(u => u.email === email)) {
        AUTH_UI.regError.classList.remove('hidden');
        return;
    }

    const passwordHash = await hashSHA256(pass);
    const newUser = {
        username: name,
        email,
        password: passwordHash,
        role: 'visitante',
        status: 'Pendiente',
        initials: name.substring(0, 2).toUpperCase()
    };

    if (typeof saveLocalUser === 'function') saveLocalUser(newUser);

    if (typeof AuditService !== 'undefined') AuditService.log('Creación', 'Autenticación', email, name, 'Registro de nueva cuenta de usuario (visitante)');

    AUTH_UI.registerForm.reset();
    toggleAuthView('login');
    AlertService.notify('Registro Exitoso', 'Cuenta creada. Esperando activación.', 'success');
}

// =============================================
// RECUPERACIÓN POR PREGUNTAS DE SEGURIDAD
// =============================================

// PASO 1: Verificar que el correo existe y tiene preguntas configuradas
async function handleRecoveryStep1(e) {
    e.preventDefault();
    const email = AUTH_UI.recoveryEmail.value.trim();
    AUTH_UI.recoveryError.classList.add('hidden');

    const localUsers = typeof getLocalUsers === 'function' ? getLocalUsers() : [];
    const allUsers = [...(typeof AUTH_CONFIG !== 'undefined' ? AUTH_CONFIG.hardcodedUsers : []), ...localUsers];
    const user = allUsers.find(u => u.email === email);

    if (!user) {
        AUTH_UI.recoveryError.textContent = 'Este correo electrónico no está registrado en el sistema.';
        AUTH_UI.recoveryError.classList.remove('hidden');
        return;
    }

    // Verificar si es un usuario de sistema (MockData)
    const isSystemUser = email === 'admin@dcti.gob' || email === 'editor@dcti.gob';
    if (isSystemUser) {
        AUTH_UI.recoveryError.textContent = 'Este usuario es de sistema, no puede recuperar contraseña mediante este método.';
        AUTH_UI.recoveryError.classList.remove('hidden');
        return;
    }

    if (!user.securityQ1 || !user.securityQ2) {
        AUTH_UI.recoveryError.textContent = 'Esta cuenta no tiene preguntas de seguridad configuradas. Contacta al administrador para recuperar tu acceso.';
        AUTH_UI.recoveryError.classList.remove('hidden');
        return;
    }

    _recoveryTargetEmail = email;
    AUTH_UI.recoveryQ1Label.textContent = user.securityQ1.question;
    AUTH_UI.recoveryQ2Label.textContent = user.securityQ2.question;
    showRecoveryStep(2);
}

// PASO 2: Verificar respuestas
async function handleRecoveryStep2(e) {
    e.preventDefault();
    AUTH_UI.recoveryAnswersError.classList.add('hidden');

    const answer1 = AUTH_UI.recoveryA1.value.trim().toLowerCase();
    const answer2 = AUTH_UI.recoveryA2.value.trim().toLowerCase();

    if (!answer1 || !answer2) {
        AUTH_UI.recoveryAnswersError.textContent = 'Debes responder ambas preguntas.';
        AUTH_UI.recoveryAnswersError.classList.remove('hidden');
        return;
    }

    const localUsers = typeof getLocalUsers === 'function' ? getLocalUsers() : [];
    const allUsers = [...(typeof AUTH_CONFIG !== 'undefined' ? AUTH_CONFIG.hardcodedUsers : []), ...localUsers];
    const user = allUsers.find(u => u.email === _recoveryTargetEmail);

    if (!user) return;

    const hash1 = await hashSHA256(answer1);
    const hash2 = await hashSHA256(answer2);

    if (hash1 !== user.securityQ1.answerHash || hash2 !== user.securityQ2.answerHash) {
        AUTH_UI.recoveryAnswersError.textContent = 'Las respuestas no coinciden con las registradas. Verifica e intenta de nuevo.';
        AUTH_UI.recoveryAnswersError.classList.remove('hidden');
        return;
    }

    showRecoveryStep(3);
}

// PASO 3: Guardar nueva contraseña
async function handleRecoveryStep3(e) {
    e.preventDefault();
    AUTH_UI.recoveryPassError.classList.add('hidden');

    const newPass = AUTH_UI.recoveryNewPass.value;
    const confirmPass = AUTH_UI.recoveryConfirmPass.value;

    if (!validatePasswordComplexity(newPass)) {
        AUTH_UI.recoveryPassError.textContent = 'La contraseña no cumple los requisitos de seguridad (mín. 8 caracteres, mayúscula, número y carácter especial).';
        AUTH_UI.recoveryPassError.classList.remove('hidden');
        return;
    }

    if (newPass !== confirmPass) {
        AUTH_UI.recoveryPassError.textContent = 'Las contraseñas no coinciden.';
        AUTH_UI.recoveryPassError.classList.remove('hidden');
        return;
    }

    const localUsers = typeof getLocalUsers === 'function' ? getLocalUsers() : [];
    const index = localUsers.findIndex(u => u.email === _recoveryTargetEmail);

    if (index !== -1) {
        localUsers[index].password = await hashSHA256(newPass);
        localUsers[index].updatedAt = new Date().toISOString();
        localUsers[index].updatedBy = 'Recuperación de Acceso';
        if (!localUsers[index].history) localUsers[index].history = [];
        localUsers[index].history.unshift({
            date: new Date().toLocaleString('es-VE'),
            responsible: 'Sistema (Recuperación)',
            action: 'Cambio de Contraseña',
            fields: 'Contraseña restablecida por preguntas de seguridad'
        });
        localUsers[index].history = localUsers[index].history.slice(0, 15);
        localStorage.setItem('dcti_users', JSON.stringify(localUsers));
    }

    _recoveryTargetEmail = null;
    toggleAuthView('login');
    if (typeof AuditService !== 'undefined') AuditService.log('Recuperación', 'Autenticación', localUsers[index] ? localUsers[index].email : 'N/A', localUsers[index] ? (localUsers[index].name || localUsers[index].username) : 'N/A', 'Contraseña restablecida por preguntas de seguridad');
    AlertService.notify('Contraseña Actualizada', 'Tu contraseña ha sido restablecida exitosamente. Inicia sesión con tu nueva clave.', 'success');
}

// Utilidad: Mostrar un paso de recuperación y ocultar los demás (0=métodos, 1=email, 2=preguntas, 3=contraseña)
function showRecoveryStep(step) {
    const steps = [AUTH_UI.recoveryStep0, AUTH_UI.recoveryStep1, AUTH_UI.recoveryStep2, AUTH_UI.recoveryStep3];
    steps.forEach((s, i) => {
        if (s) {
            if (i === step) {
                s.classList.remove('hidden');
            } else {
                s.classList.add('hidden');
            }
        }
    });
}

// Función global para seleccionar método de recuperación (llamada desde onclick en HTML)
function selectRecoveryMethod(method) {
    if (method === 'questions') {
        showRecoveryStep(1);
    }
    // Futuro: else if (method === 'email') { ... }
    // Futuro: else if (method === 'phone') { ... }
}
window.selectRecoveryMethod = selectRecoveryMethod;

function checkRoleAndRedirect(user) {
    if (user.role === 'admin' || user.role === 'editor') {
        Router.navigateTo('dashboard');
    } else {
        Router.navigateTo('inicio');
    }
}

function toggleAuthView(view) {
    AUTH_UI.loginView.classList.add('hidden');
    AUTH_UI.registerView.classList.add('hidden');
    AUTH_UI.recoveryView.classList.add('hidden');

    if (view === 'register') {
        AUTH_UI.registerView.classList.remove('hidden');
    } else if (view === 'recovery') {
        AUTH_UI.recoveryView.classList.remove('hidden');
        showRecoveryStep(0); // Siempre empezar en selección de método
        _recoveryTargetEmail = null;
        if (AUTH_UI.recoveryFormStep1) AUTH_UI.recoveryFormStep1.reset();
        if (AUTH_UI.recoveryFormStep2) AUTH_UI.recoveryFormStep2.reset();
        if (AUTH_UI.recoveryFormStep3) AUTH_UI.recoveryFormStep3.reset();
        if (AUTH_UI.recoveryError) AUTH_UI.recoveryError.classList.add('hidden');
        if (AUTH_UI.recoveryAnswersError) AUTH_UI.recoveryAnswersError.classList.add('hidden');
        if (AUTH_UI.recoveryPassError) AUTH_UI.recoveryPassError.classList.add('hidden');
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
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });
}

function initAuthEvents() {
    if (AUTH_UI.loginForm) AUTH_UI.loginForm.addEventListener('submit', handleLogin);
    if (AUTH_UI.registerForm) AUTH_UI.registerForm.addEventListener('submit', handleRegister);

    // Recovery 3-step forms
    if (AUTH_UI.recoveryFormStep1) AUTH_UI.recoveryFormStep1.addEventListener('submit', handleRecoveryStep1);
    if (AUTH_UI.recoveryFormStep2) AUTH_UI.recoveryFormStep2.addEventListener('submit', handleRecoveryStep2);
    if (AUTH_UI.recoveryFormStep3) AUTH_UI.recoveryFormStep3.addEventListener('submit', handleRecoveryStep3);

    // Navigation links
    if (AUTH_UI.toRegisterLink) AUTH_UI.toRegisterLink.addEventListener('click', (e) => { e.preventDefault(); toggleAuthView('register'); });
    if (AUTH_UI.toLoginLink) AUTH_UI.toLoginLink.addEventListener('click', (e) => { e.preventDefault(); toggleAuthView('login'); });
    if (AUTH_UI.toRecoveryLink) AUTH_UI.toRecoveryLink.addEventListener('click', (e) => { e.preventDefault(); toggleAuthView('recovery'); });
    if (AUTH_UI.toRecoveryFromReg) AUTH_UI.toRecoveryFromReg.addEventListener('click', (e) => { e.preventDefault(); toggleAuthView('recovery'); });
    if (AUTH_UI.backToLoginLink) AUTH_UI.backToLoginLink.addEventListener('click', (e) => { e.preventDefault(); toggleAuthView('login'); });

    // Back to method selection from step 1
    if (AUTH_UI.backToMethodsLink) AUTH_UI.backToMethodsLink.addEventListener('click', (e) => {
        e.preventDefault();
        showRecoveryStep(0);
        _recoveryTargetEmail = null;
    });

    // Back to step 1 from step 2
    if (AUTH_UI.backToStep1Link) AUTH_UI.backToStep1Link.addEventListener('click', (e) => {
        e.preventDefault();
        showRecoveryStep(1);
        _recoveryTargetEmail = null;
    });

    // Hover effect para la card de método activo
    const methodCard = document.getElementById('method-questions');
    if (methodCard) {
        methodCard.addEventListener('mouseenter', () => {
            methodCard.style.borderColor = '#540E90';
            methodCard.style.background = 'linear-gradient(135deg, rgba(84, 14, 144, 0.08), rgba(16, 185, 129, 0.08))';
            methodCard.style.transform = 'translateY(-1px)';
            methodCard.style.boxShadow = '0 4px 12px rgba(84, 14, 144, 0.15)';
        });
        methodCard.addEventListener('mouseleave', () => {
            methodCard.style.borderColor = 'rgba(84, 14, 144, 0.2)';
            methodCard.style.background = 'linear-gradient(135deg, rgba(84, 14, 144, 0.04), rgba(16, 185, 129, 0.04))';
            methodCard.style.transform = 'translateY(0)';
            methodCard.style.boxShadow = 'none';
        });
    }

    initVisibilityToggles();
}

function showLogin() {
    if (typeof Router !== 'undefined') {
        Router.navigateTo('login');
    }
}

function renderAuthPage() {
    const root = document.getElementById('auth-view-root');
    const authView = window.AuthView || (typeof AuthView !== 'undefined' ? AuthView : null);

    if (!root || !authView) {
        console.error('AuthRoot o AuthView no disponibles');
        return;
    }

    root.innerHTML = authView.render();
    initAuthUI();
    initAuthEvents();
}

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    // No llamamos a renderAuthPage automáticamente para no ocultar el portal al inicio
});

/**
 * ADMIN DASHBOARD - AUTH LOGIC (Modular v11.0.0)
 * Responsabilidad: Gestión de Registro, Login y Redirección por Roles.
 */

let AUTH_UI = {};

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

                // Iniciar la sesión a nivel de aplicación (refresca el dropdown/navbar visualmente)
                if (typeof App !== 'undefined') {
                    const fullSession = JSON.parse(localStorage.getItem('dcti_session'));
                    App.start(fullSession);
                }

                // Redirigir usando el Router para mantener consistencia SPA
                if (user.role === 'admin' || user.role === 'editor') {
                    Router.navigateTo('dashboard');
                } else {
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
    const name = AUTH_UI.regName.value;
    const email = AUTH_UI.regEmail.value;
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

    AUTH_UI.registerForm.reset();
    toggleAuthView('login');
    AlertService.notify('Registro Exitoso', 'Cuenta creada. Esperando activación.', 'success');
}

async function handleRecovery(e) {
    e.preventDefault();
    const email = AUTH_UI.recoveryEmail.value;
    const localUsers = typeof getLocalUsers === 'function' ? getLocalUsers() : [];
    const allUsers = [...(typeof AUTH_CONFIG !== 'undefined' ? AUTH_CONFIG.hardcodedUsers : []), ...localUsers];
    const user = allUsers.find(u => u.email === email);

    if (user) {
        AUTH_UI.recoverySending.classList.remove('hidden');
        AUTH_UI.recoverySubmit.disabled = true;
        setTimeout(() => {
            AUTH_UI.recoverySending.classList.add('hidden');
            AUTH_UI.recoverySuccess.classList.remove('hidden');
            AUTH_UI.recoverySubmit.classList.add('hidden');
        }, 2000);
    } else {
        AUTH_UI.recoveryError.classList.remove('hidden');
    }
}

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
    if (AUTH_UI.recoveryForm) AUTH_UI.recoveryForm.addEventListener('submit', handleRecovery);

    if (AUTH_UI.toRegisterLink) AUTH_UI.toRegisterLink.addEventListener('click', (e) => { e.preventDefault(); toggleAuthView('register'); });
    if (AUTH_UI.toLoginLink) AUTH_UI.toLoginLink.addEventListener('click', (e) => { e.preventDefault(); toggleAuthView('login'); });
    if (AUTH_UI.toRecoveryLink) AUTH_UI.toRecoveryLink.addEventListener('click', (e) => { e.preventDefault(); toggleAuthView('recovery'); });
    if (AUTH_UI.toRecoveryFromReg) AUTH_UI.toRecoveryFromReg.addEventListener('click', (e) => { e.preventDefault(); toggleAuthView('recovery'); });
    if (AUTH_UI.backToLoginLink) AUTH_UI.backToLoginLink.addEventListener('click', (e) => { e.preventDefault(); toggleAuthView('login'); });

    initVisibilityToggles();

    // Link "Volver al Portal" (opcional si queremos añadir uno en el login card)
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
    // a menos que no haya sesión y estuviéramos en una ruta de auth (lógica SPA)
});

const ProfileView = {
    render: function (data) {
        const user = data.currentUser || {};
        const isHardcoded = user.email === 'admin@dcti.gob' || user.email === 'editor@dcti.gob';
        const roleColors = {
            admin: { bg: 'rgba(99, 102, 241, 0.15)', text: '#4f46e5', border: 'rgba(99, 102, 241, 0.3)' },
            editor: { bg: 'rgba(16, 185, 129, 0.15)', text: '#059669', border: 'rgba(16, 185, 129, 0.3)' },
            visitante: { bg: 'rgba(236, 72, 153, 0.15)', text: '#db2777', border: 'rgba(236, 72, 153, 0.3)' }
        };
        const currentRoleColors = roleColors[user.role] || roleColors['visitante'];
        const displayName = user.name || user.username || 'Usuario';
        const displayLastName = user.lastname || '';
        const userInitials = (user.name ? user.name.charAt(0) : (user.username ? user.username.charAt(0) : 'U')).toUpperCase() + (user.lastname ? user.lastname.charAt(0) : '').toUpperCase();

        return `
        <div class="profile-view-wrapper" style="font-family: 'Outfit', 'Inter', system-ui, sans-serif; max-width: 1100px; margin: 0 auto; color: #1e293b; animation: fadeInProfile 0.5s ease-out;">
            <!-- Header Section -->
            <div style="margin-bottom: 2.5rem; display: flex; align-items: center; gap: 1rem;">
                <div style="width: 50px; height: 50px; border-radius: 12px; background: linear-gradient(135deg, #4f46e5, #c026d3); display: flex; align-items: center; justify-content: center; color: white; font-size: 1.5rem; box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3);">
                    <i class="fas fa-user"></i>
                </div>
                <div>
                    <h2 style="font-size: 2.2rem; font-weight: 800; margin: 0; background: linear-gradient(to right, #1e293b, #4f46e5); -webkit-background-clip: text; -webkit-text-fill-color: transparent; letter-spacing: -0.5px;">Mi Perfil</h2>
                    <p style="color: #64748b; font-size: 1.05rem; margin: 0.2rem 0 0 0; font-weight: 400;">Configuración de identidad y credenciales de acceso</p>
                </div>
            </div>

            <div class="profile-layout-grid">
                
                <!-- Columna Izquierda: ID Card -->
                <div class="profile-glass-card profile-id-card">
                    <div class="profile-card-header-bg"></div>
                    
                    <div style="position: relative; z-index: 2; padding: 0 2rem 2.5rem 2rem; display: flex; flex-direction: column; align-items: center;">
                        <!-- Avatar Wrapper -->
                        <div class="premium-avatar-wrapper">
                            ${user.avatar
                ? `<img id="profile-avatar-preview" src="${user.avatar}" class="premium-avatar-img">`
                : `<div id="profile-avatar-preview" class="premium-avatar-initials">${userInitials}</div>`}
                            <label for="profile-avatar-input" class="premium-avatar-upload" title="Actualizar fotografía">
                                <i class="fas fa-camera"></i>
                            </label>
                            <input type="file" id="profile-avatar-input" accept="image/*" style="display: none;">
                        </div>

                        <!-- User Info -->
                        <h3 style="font-size: 1.7rem; font-weight: 700; color: #0f172a; margin: 1rem 0 0.3rem 0; line-height: 1.2; text-align: center;">${displayName} <br> ${displayLastName}</h3>
                        
                        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 1.5rem; color: #64748b; font-size: 0.95rem;">
                            <i class="fas fa-envelope-circle-check" style="color: #10b981;"></i> ${user.email || 'correo@ejemplo.com'}
                        </div>

                        <!-- Role Badge -->
                        <div style="background: ${currentRoleColors.bg}; color: ${currentRoleColors.text}; border: 1px solid ${currentRoleColors.border}; padding: 0.5rem 1.5rem; border-radius: 30px; font-weight: 700; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 1px; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 2px 10px ${currentRoleColors.bg};">
                            <i class="fas ${user.role === 'admin' ? 'fa-user-shield' : (user.role === 'editor' ? 'fa-user-pen' : 'fa-user')}"></i> ${user.role || 'Visitante'}
                        </div>

                        ${isHardcoded ? `
                        <div style="margin-top: 2rem; width: 100%; border-radius: 12px; background: rgba(245, 158, 11, 0.1); border: 1px dashed #f59e0b; padding: 1rem; display: flex; gap: 12px; align-items: flex-start; text-align: left;">
                            <i class="fas fa-lock" style="color: #d97706; font-size: 1.2rem; margin-top: 2px;"></i>
                            <div>
                                <strong style="display: block; color: #b45309; font-size: 0.9rem; margin-bottom: 2px;">Cuenta Protegida</strong>
                                <span style="color: #92400e; font-size: 0.8rem; line-height: 1.4; display: block;">Identidad de sistema inalterable. Modificaciones deshabilitadas.</span>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>

                <!-- Columna Derecha: Formularios -->
                <div class="profile-glass-card profile-forms" style="padding: 2.5rem;">
                    <form id="profile-user-form">
                        
                        <!-- Sección 1 -->
                        <div class="form-section-header">
                            <div class="form-section-icon"><i class="fas fa-user"></i></div>
                            <div>
                                <h4>Información Personal</h4>
                                <p>Datos de identidad pública en la plataforma</p>
                            </div>
                        </div>

                        <div class="premium-form-grid">
                            <div class="premium-input-group ${user.name ? 'readonly-group' : ''}">
                                <label>Nombres ${user.name ? '(Solo Lectura)' : ''}</label>
                                <div class="input-wrapper ${user.name ? 'disabled-wrapper' : ''}">
                                    <i class="fas fa-user input-icon"></i>
                                    <input type="text" id="profile-name" placeholder="Tus nombres" value="${user.name || ''}" ${(isHardcoded || user.name) ? 'disabled' : ''}>
                                </div>
                            </div>
                            <div class="premium-input-group ${user.lastname ? 'readonly-group' : ''}">
                                <label>Apellidos ${user.lastname ? '(Solo Lectura)' : ''}</label>
                                <div class="input-wrapper ${user.lastname ? 'disabled-wrapper' : ''}">
                                    <i class="fas fa-user-tag input-icon"></i>
                                    <input type="text" id="profile-lastname" placeholder="Tus apellidos" value="${user.lastname || ''}" ${(isHardcoded || user.lastname) ? 'disabled' : ''}>
                                </div>
                            </div>
                            <div class="premium-input-group ${user.cedula ? 'readonly-group' : ''}">
                                <label>Cédula / DNI ${user.cedula ? '(Solo Lectura)' : ''}</label>
                                <div class="input-wrapper ${user.cedula ? 'disabled-wrapper' : ''}">
                                    <i class="fas fa-id-card input-icon"></i>
                                    <input type="text" id="profile-cedula" placeholder="12345678" value="${user.cedula || ''}" ${(isHardcoded || user.cedula) ? 'disabled' : ''}>
                                </div>
                            </div>
                            <div class="premium-input-group">
                                <label>Nickname</label>
                                <div class="input-wrapper">
                                    <i class="fas fa-at input-icon"></i>
                                    <input type="text" id="profile-username" placeholder="Usuario único" value="${user.username || ''}" ${isHardcoded ? 'disabled' : ''}>
                                </div>
                            </div>
                        </div>

                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0;">

                        <!-- Sección 2 -->
                        <div class="form-section-header">
                            <div class="form-section-icon" style="background: rgba(236, 72, 153, 0.1); color: #ec4899;"><i class="fas fa-shield-halved"></i></div>
                            <div>
                                <h4>Credenciales y Seguridad</h4>
                                <p>Accesos privados y autenticación del sistema</p>
                            </div>
                        </div>

                        <div class="premium-form-grid" style="grid-template-columns: 1fr;">
                            <div class="premium-input-group readonly-group">
                                <label>Correo Electrónico (Solo Lectura)</label>
                                <div class="input-wrapper disabled-wrapper">
                                    <i class="fas fa-envelope input-icon"></i>
                                    <input type="email" id="profile-email" value="${user.email || ''}" disabled>
                                    <div class="verified-badge"><i class="fas fa-check"></i> Verificado</div>
                                </div>
                            </div>
                            <div class="premium-input-group">
                                <label>Cambiar Contraseña</label>
                                <div class="input-wrapper">
                                    <i class="fas fa-key input-icon"></i>
                                    <input type="password" id="profile-pass" placeholder="••••••••" ${isHardcoded ? 'disabled' : ''}>
                                    
                                    ${isHardcoded ? '' : `
                                        <div class="password-toggle" onclick="toggleProfilePassword()">
                                            <i class="fas fa-eye"></i>
                                        </div>
                                    `}
                                </div>
                                <span class="input-help">
                                    <i class="fas fa-info-circle"></i> 
                                    ${isHardcoded ? 'Esta cuenta es de solo lectura (Prototipo).' : 'Dejar en blanco para conservar la clave actual.'}
                                </span>
                            </div>
                        </div>

                        ${!isHardcoded ? `
                        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 2rem 0;">

                        <!-- Sección 3: Preguntas de Seguridad -->
                        <div class="form-section-header">
                            <div class="form-section-icon" style="background: rgba(16, 185, 129, 0.1); color: #10b981;"><i class="fas fa-user-shield"></i></div>
                            <div>
                                <h4>Preguntas de Seguridad</h4>
                                <p>Recupera tu contraseña en caso de emergencia</p>
                            </div>
                            ${user.securityQ1 && user.securityQ2 ? `
                                <div style="margin-left: auto; background: #d1fae5; color: #059669; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 5px; border: 1px solid #10b981;">
                                    <i class="fas fa-check-circle"></i> Configuradas
                                </div>
                            ` : `
                                <div style="margin-left: auto; background: #fef3c7; color: #b45309; padding: 4px 12px; border-radius: 20px; font-size: 0.75rem; font-weight: 700; display: flex; align-items: center; gap: 5px; border: 1px solid #f59e0b;">
                                    <i class="fas fa-exclamation-triangle"></i> Sin configurar
                                </div>
                            `}
                        </div>

                        ${!user.securityQ1 || !user.securityQ2 ? `
                            <div style="background: linear-gradient(135deg, rgba(79, 70, 229, 0.06), rgba(16, 185, 129, 0.06)); border: 1px solid rgba(79, 70, 229, 0.15); border-radius: 12px; padding: 1rem 1.2rem; margin-bottom: 1.5rem; display: flex; align-items: flex-start; gap: 12px;">
                                <i class="fas fa-lightbulb" style="color: #f59e0b; font-size: 1.2rem; margin-top: 2px;"></i>
                                <div>
                                    <strong style="display: block; color: #1e293b; font-size: 0.9rem; margin-bottom: 3px;">¡Protege tu acceso!</strong>
                                    <span style="color: #64748b; font-size: 0.82rem; line-height: 1.4;">Configura tus preguntas de seguridad para poder recuperar tu contraseña sin necesidad de contactar al administrador.</span>
                                </div>
                            </div>
                        ` : ''}

                        <div class="premium-form-grid" style="grid-template-columns: 1fr;">
                            <div class="premium-input-group">
                                <label>Pregunta de Seguridad 1</label>
                                <div class="input-wrapper">
                                    <i class="fas fa-question-circle input-icon"></i>
                                    <select id="profile-sq1" style="width: 100%; padding: 0.9rem 1rem 0.9rem 2.8rem; border: none; background: transparent; font-size: 0.9rem; color: #1e293b; font-weight: 500; font-family: inherit; outline: none; cursor: pointer; appearance: none;">
                                        <option value="">— Selecciona una pregunta —</option>
                                        ${(typeof SECURITY_QUESTIONS !== 'undefined' ? SECURITY_QUESTIONS : []).map(q => 
                                            '<option value="' + q + '" ' + (user.securityQ1 && user.securityQ1.question === q ? 'selected' : '') + '>' + q + '</option>'
                                        ).join('')}
                                    </select>
                                </div>
                            </div>
                            <div class="premium-input-group">
                                <label>Respuesta 1 ${user.securityQ1 ? '(Dejar en blanco para mantener la actual)' : ''}</label>
                                <div class="input-wrapper">
                                    <i class="fas fa-pen input-icon"></i>
                                    <input type="text" id="profile-sa1" placeholder="${user.securityQ1 ? '•••••••• (Respuesta guardada)' : 'Escribe tu respuesta'}">
                                </div>
                            </div>
                            <div class="premium-input-group" style="margin-top: 0.5rem;">
                                <label>Pregunta de Seguridad 2</label>
                                <div class="input-wrapper">
                                    <i class="fas fa-question-circle input-icon"></i>
                                    <select id="profile-sq2" style="width: 100%; padding: 0.9rem 1rem 0.9rem 2.8rem; border: none; background: transparent; font-size: 0.9rem; color: #1e293b; font-weight: 500; font-family: inherit; outline: none; cursor: pointer; appearance: none;">
                                        <option value="">— Selecciona una pregunta —</option>
                                        ${(typeof SECURITY_QUESTIONS !== 'undefined' ? SECURITY_QUESTIONS : []).map(q => 
                                            '<option value="' + q + '" ' + (user.securityQ2 && user.securityQ2.question === q ? 'selected' : '') + '>' + q + '</option>'
                                        ).join('')}
                                    </select>
                                </div>
                            </div>
                            <div class="premium-input-group">
                                <label>Respuesta 2 ${user.securityQ2 ? '(Dejar en blanco para mantener la actual)' : ''}</label>
                                <div class="input-wrapper">
                                    <i class="fas fa-pen input-icon"></i>
                                    <input type="text" id="profile-sa2" placeholder="${user.securityQ2 ? '•••••••• (Respuesta guardada)' : 'Escribe tu respuesta'}">
                                </div>
                                <span class="input-help">
                                    <i class="fas fa-lock"></i> Las respuestas se almacenan cifradas por seguridad.
                                </span>
                            </div>
                        </div>
                        ` : ''}

                        <!-- Botonera -->
                        <div class="profile-actions">
                            ${isHardcoded ? '' : `
                                <button type="submit" class="btn-save-circle" title="Guardar Cambios">
                                    <i class="fas fa-save" style="font-size: 1.2rem; margin: 0;"></i>
                                </button>
                            `}
                        </div>
                    </form>
                </div>
            </div>

            <!-- Estilos Embebidos Exclusivos del Componente Profile Premium -->
            <style>
                @keyframes fadeInProfile { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
                
                .profile-layout-grid {
                    display: grid;
                    grid-template-columns: 380px 1fr;
                    gap: 2rem;
                    align-items: start;
                }

                @media (max-width: 992px) {
                    .profile-layout-grid { grid-template-columns: 1fr; }
                    .profile-id-card { max-width: 500px; margin: 0 auto; width: 100%; }
                }

                /* GLASS CARDS */
                .profile-glass-card {
                    background: rgba(255, 255, 255, 0.95);
                    backdrop-filter: blur(10px);
                    border-radius: 20px;
                    border: 1px solid rgba(255, 255, 255, 0.5);
                    box-shadow: 0 10px 30px -10px rgba(15, 23, 42, 0.08), 0 4px 6px -2px rgba(15, 23, 42, 0.04);
                    overflow: hidden;
                    position: relative;
                }

                /* ID CARD HEADER BG */
                .profile-card-header-bg {
                    height: 140px;
                    background: linear-gradient(120deg, #4f46e5, #c026d3);
                    position: relative;
                    margin-bottom: -70px; /* Pulls avatar up */
                }
                .profile-card-header-bg::after {
                    content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 50%;
                    background: linear-gradient(to top, rgba(255,255,255,0.95), transparent);
                }

                /* AVATAR */
                .premium-avatar-wrapper {
                    width: 140px; height: 140px; border-radius: 50%; padding: 6px; 
                    background: white; box-shadow: 0 10px 25px -5px rgba(0,0,0,0.15);
                    position: relative; z-index: 5; margin-bottom: 1rem;
                }
                .premium-avatar-img, .premium-avatar-initials {
                    width: 100%; height: 100%; border-radius: 50%; object-fit: cover;
                }
                .premium-avatar-initials {
                    background: linear-gradient(135deg, #f8fafc, #e2e8f0); color: #475569;
                    display: flex; align-items: center; justify-content: center;
                    font-size: 3rem; font-weight: 800; border: 1px solid #cbd5e1;
                }
                .premium-avatar-upload {
                    position: absolute; bottom: 8px; right: 8px; width: 36px; height: 36px;
                    background: #c026d3; color: white; border-radius: 50%;
                    display: flex; align-items: center; justify-content: center;
                    cursor: pointer; box-shadow: 0 4px 10px rgba(192, 38, 211, 0.4);
                    transition: all 0.3s ease; border: 2px solid white;
                }
                .premium-avatar-upload:hover {
                    transform: scale(1.15) rotate(5deg); background: #4f46e5;
                }

                /* FORMS */
                .form-section-header {
                    display: flex; align-items: center; gap: 15px; margin-bottom: 2rem;
                }
                .form-section-icon {
                    width: 45px; height: 45px; border-radius: 12px; background: rgba(79, 70, 229, 0.1); color: #4f46e5;
                    display: flex; align-items: center; justify-content: center; font-size: 1.3rem;
                }
                .form-section-header h4 { margin: 0; font-size: 1.2rem; font-weight: 700; color: #1e293b; }
                .form-section-header p { margin: 0; font-size: 0.9rem; color: #64748b; }

                .premium-form-grid {
                    display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem;
                }
                .premium-input-group label {
                    display: block; font-size: 0.85rem; font-weight: 600; color: #475569; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.5px;
                }
                .input-wrapper {
                    position: relative; border-radius: 10px; background: #f8fafc; border: 1px solid #e2e8f0; transition: all 0.3s ease;
                }
                .input-wrapper:focus-within {
                    background: #ffffff; border-color: #4f46e5; box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
                }
                .input-icon {
                    position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 1rem; transition: color 0.3s;
                }
                .input-wrapper:focus-within .input-icon { color: #4f46e5; }
                
                .input-wrapper input {
                    width: 100%; padding: 0.9rem 1rem 0.9rem 2.8rem; border: none; background: transparent; 
                    font-size: 0.95rem; color: #1e293b; font-weight: 500; font-family: inherit; outline: none;
                }
                .input-wrapper input:disabled { color: #94a3b8; cursor: not-allowed; }
                .disabled-wrapper { background: #f1f5f9; border-color: #cbd5e1; opacity: 0.8; }
                
                .verified-badge {
                    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
                    background: #d1fae5; color: #059669; padding: 4px 10px; border-radius: 8px; font-size: 0.75rem; font-weight: 700;
                    display: flex; align-items: center; gap: 4px; border: 1px solid #10b981;
                }
                .password-toggle {
                    position: absolute; right: 15px; top: 50%; transform: translateY(-50%);
                    color: #94a3b8; cursor: pointer; transition: color 0.3s;
                }
                .password-toggle:hover { color: #4f46e5; }
                .input-help { display: block; font-size: 0.8rem; color: #64748b; margin-top: 0.5rem; }

                /* BUTTON */
                .profile-actions {
                    margin-top: 2.5rem; padding-top: 2rem; border-top: 1px solid #e2e8f0; display: flex; justify-content: flex-end;
                }
                .premium-save-btn {
                    background: linear-gradient(135deg, #4f46e5, #4338ca); color: white;
                    border: none; padding: 0.8rem 2.5rem; border-radius: 12px; font-size: 1.05rem; font-weight: 600;
                    cursor: pointer; display: flex; align-items: center; gap: 10px; transition: all 0.3s ease;
                    box-shadow: 0 4px 15px rgba(79, 70, 229, 0.3); font-family: inherit;
                }
                .premium-save-btn:hover:not(:disabled) {
                    transform: translateY(-2px); box-shadow: 0 8px 25px rgba(79, 70, 229, 0.4);
                }
                .premium-save-btn:disabled {
                    background: #cbd5e1; color: #94a3b8; box-shadow: none; cursor: not-allowed;
                }
            </style>
        </div>
        `;
    }
};

// Global helper for toggling password visibility in the profile
window.toggleProfilePassword = function () {
    const input = document.getElementById('profile-pass');
    const icon = document.querySelector('.password-toggle i');
    if (input && icon) {
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.replace('fa-eye', 'fa-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.replace('fa-eye-slash', 'fa-eye');
        }
    }
};

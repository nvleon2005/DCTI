/**
 * Presentacion/Pages/Public/ContactosView.js
 * Vista de Contactos Públicos.
 */

window.ContactosView = {
    render: () => {
        return `
            <section id="view-contactos" class="public-view public-active">
                <section>
                    <div id="mi_map"></div>
                </section>
                <section class="contacto-container" style="display: flex; flex-direction: column; align-items: center; gap: 20px;">
                    <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 30px; width: 100%;">
                        <div class="icon-container" style="margin: 0;">
                            <a href="#" class="icon-link" id="contacto-instagram-link">
                                <img src="Assets/images/insta.svg" alt="instagram" width="40px">
                                <span id="contacto-instagram-text">@Instagram</span>
                            </a>
                            <a href="#" class="icon-link" id="contacto-twitter-link">
                                <img src="Assets/images/twitter.svg" alt="twitter" width="40px">
                                <span id="contacto-twitter-text">@Twitter</span>
                            </a>
                        </div>
                        <div class="icon-container" style="margin: 0;">
                            <a href="#" class="icon-link" id="contacto-facebook-link">
                                <img src="Assets/images/face.svg" alt="ícono de facebook" width="40px">
                                <span id="contacto-facebook-text">@Facebook</span>
                            </a>
                            <a href="tel:" class="icon-link" id="contacto-telefono-link">
                                <img src="Assets/images/telefono.png" alt="telefono" width="40px">
                                <span id="contacto-telefono-text">555-5555555</span>
                            </a>
                        </div>
                    </div>
                    
                    <!-- Dirección de ancho completo -->
                    <div style="width: 100%; max-width: 800px; display: flex; justify-content: center; margin-top: 10px;">
                        <a href="#" class="icon-link" id="contacto-direccion-link" style="width: 100%; display: flex; align-items: center; justify-content: center; text-align: center; white-space: normal; height: auto; min-height: 70px; padding: 15px 30px; box-sizing: border-box; flex-wrap: wrap;">
                            <img src="Assets/images/ubicacion.png" alt="ícono de ubicación" width="40px" style="margin-right: 15px; margin-bottom: 5px; flex-shrink: 0;">
                            <span id="contacto-direccion-text" style="word-break: break-word; line-height: 1.5; font-size: 1.05rem;">Ubicación</span>
                        </a>
                    </div>
                </section>
                <section>
                    <div class="cabeza">
                        <h1 class="title" style="text-align:center; padding: 20px 0; color: #530e90;">¿Tienes una duda? ¡Consultanos!</h1>
                    </div>
                    <div class="container-form">
                        <div class="form-container">
                            <form id="contact-form">
                                <div class="form-group">
                                    <label for="nombre">Nombre</label>
                                    <input type="text" id="nombre" name="nombre" class="form-control" />
                                </div>
                                <div class="form-group">
                                    <label for="apellido">Apellido</label>
                                    <input type="text" id="apellido" name="apellido" class="form-control" />
                                </div>
                                <div class="form-group">
                                    <label for="correo">Correo</label>
                                    <input type="email" id="correo" name="correo" class="form-control" />
                                </div>
                                <div class="form-group">
                                    <label for="consulta">Consulta</label>
                                    <textarea id="consulta" name="consulta" class="form-control" rows="5" style="resize: none;"></textarea>
                                </div>
                                <div class="form-actions">
                                    <input type="submit" id="contact-submit" value="Enviar" class="btn btn-primary" style="font-family: Verdana, sans-serif; font-weight: bold; font-size: 1rem; padding: 10px 20px;" />
                                    <input type="reset" id="contact-reset" value="Limpiar" class="btn btn-danger" style="font-family: Verdana, sans-serif; font-weight: bold; font-size: 1rem; padding: 10px 20px;" />
                                </div>
                            </form>
                        </div>
                        <div class="image-form">
                            <img id="contactos-form-img" src="Assets/images/loteria.png" alt="Imagen Consultas" />
                        </div>
                    </div>
                </section>
            </section>
        `;
    },
    init: () => {
        if (typeof window.initContactMap === 'function') {
            window.initContactMap();
        }
        if (typeof window.initContactForm === 'function') {
            window.initContactForm();
        }
        // Apply dynamic DCTI contact links (must run after view DOM is ready)
        if (typeof window.applyDctiContactLinks === 'function') {
            window.applyDctiContactLinks();
        }
        // Load dynamic consultas image from DCTI settings
        if (typeof window.getLocalDcti === 'function') {
            const dcti = window.getLocalDcti();
            const img = document.getElementById('contactos-form-img');
            if (img && dcti.consultasImage) {
                img.src = dcti.consultasImage;
            }
        }
    }
};

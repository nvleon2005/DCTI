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
                <section class="contacto-container">
                    <div class="icon-container">
                        <a href="#" class="icon-link" id="contacto-instagram-link">
                            <img src="Assets/images/insta.svg" alt="instagram" width="40px">
                            <span id="contacto-instagram-text">@Instagram</span>
                        </a>
                        <a href="tel:" class="icon-link" id="contacto-telefono-link">
                            <img src="Assets/images/telefono.png" alt="telefono" width="40px">
                            <span id="contacto-telefono-text">555-5555555</span>
                        </a>
                    </div>
                    <div class="icon-container">
                        <a href="#" class="icon-link" id="contacto-facebook-link">
                            <img src="Assets/images/face.svg" alt="ícono de facebook" width="40px">
                            <span id="contacto-facebook-text">@Facebook</span>
                        </a>
                        <a href="#" class="icon-link" id="contacto-direccion-link">
                            <img src="Assets/images/ubicacion.png" alt="ícono de ubicación" width="40px">
                            <span id="contacto-direccion-text">Ubicación</span>
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
                                    <input type="submit" id="contact-submit" value="Enviar" class="btn btn-primary" />
                                    <input type="reset" id="contact-reset" value="Limpiar" class="btn btn-danger" />
                                </div>
                            </form>
                        </div>
                        <div class="image-form">
                            <img src="Assets/images/loteria.png" alt="Imagen LDO" />
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
    }
};

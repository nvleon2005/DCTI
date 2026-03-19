/**
 * Presentacion/Pages/Public/DctiView.js
 * Vista Institucional (Reseña, Misión, Visión, Organigrama).
 */

window.DctiView = {
    render: () => {
        return `
            <section id="view-dcti" class="public-view public-active">
                <section>
                    <article class="caja">
                        <h2>Reseña Historica</h2>
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Unde voluptatem atque illum
                            delectus maxime odio nam cumque magni iste non sed quia illo facere neque iusto rem
                            accusamus, sequi at. Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatem
                            dolores pariatur eaque facere, quis hic, eveniet perspiciatis rerum delectus, consequatur
                            aliquid nobis iure. Deserunt ratione maxime explicabo. Nostrum, autem, animi. Lorem ipsum
                            dolor sit amet, consectetur adipisicing elit. Optio aliquam deserunt veritatis, adipisci
                            porro facilis nesciunt, sapiente sed commodi vel unde dolore consectetur suscipit nulla
                            quasi cupiditate facere! Temporibus, blanditiis.</p>
                    </article>
                </section>
                <section class="conten">
                    <article class="caja">
                        <h2>Misión</h2>
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Similique ea quam perferendis ullam
                            doloremque reprehenderit, minima repellendus delectus, autem aliquam ipsa? Beatae debitis
                            atque quas, facere pariatur quae natus vel. Lorem ipsum dolor sit amet, consectetur
                            adipisicing elit. Eos vitae hic, et tempore, deleniti dicta voluptate a, ipsa ratione
                            numquam quidem earum pariatur facilis aspernatur nemo eum eveniet! Consequuntur, error!</p>
                    </article>
                    <article class="caja">
                        <h2>Visión</h2>
                        <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Numquam distinctio necessitatibus
                            obcaecati architecto, nulla minus ea, nostrum voluptatum molestiae nisi nesciunt. Asperiores
                            id tempora adipisci mollitia vel fuga sint ex! Lorem ipsum dolor sit amet, consectetur
                            adipisicing elit. Et a tempore, sapiente perferendis facilis accusantium, culpa non
                            veritatis consectetur omnis tempora possimus nesciunt obcaecati est velit, eligendi sint,
                            illum nam!</p>
                    </article>
                </section>
                <section class="c_organigrama">
                    <img src="Assets/images/organigrama_nuevo.png" alt="Organigrama de la Institucion"
                        class="organigrama">
                </section>
            </section>
        `;
    }
};

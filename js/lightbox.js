/* =========================================================
   lightbox.js · Amplía la foto de los artículos de la carta
   al pulsarla. No necesita otros scripts.
   ========================================================= */

(function () {
    const imagenes = document.querySelectorAll(".pizza-card .pizza-image");
    if (!imagenes.length) return;

    // Crear el visor una sola vez
    const lightbox = document.createElement("div");
    lightbox.className = "lightbox";
    lightbox.setAttribute("role", "dialog");
    lightbox.setAttribute("aria-modal", "true");
    lightbox.setAttribute("aria-hidden", "true");
    lightbox.innerHTML = `
        <div class="lightbox-backdrop"></div>
        <figure class="lightbox-figure">
            <button type="button" class="lightbox-close" aria-label="Cerrar imagen">✕</button>
            <img class="lightbox-img" src="" alt="">
            <figcaption class="lightbox-caption"></figcaption>
        </figure>
    `;
    document.body.appendChild(lightbox);

    const lbImg = lightbox.querySelector(".lightbox-img");
    const lbCaption = lightbox.querySelector(".lightbox-caption");
    const lbClose = lightbox.querySelector(".lightbox-close");
    let elementoPrevio = null;

    function obtenerTitulo(el) {
        const card = el.closest(".pizza-card");
        const h3 = card ? card.querySelector(".pizza-title h3") : null;
        return h3 ? h3.textContent.trim() : "";
    }

    function obtenerUrl(el) {
        const bg = getComputedStyle(el).backgroundImage;
        const match = bg.match(/url\(["']?(.*?)["']?\)/);
        return match ? match[1] : null;
    }

    function abrir(el) {
        const url = obtenerUrl(el);
        if (!url) return;

        const titulo = obtenerTitulo(el);

        lbImg.src = url;
        lbImg.alt = titulo;
        lbCaption.textContent = titulo;

        elementoPrevio = document.activeElement;
        lightbox.classList.add("active");
        lightbox.setAttribute("aria-hidden", "false");
        document.body.style.overflow = "hidden";
        lbClose.focus();
    }

    function cerrar() {
        lightbox.classList.remove("active");
        lightbox.setAttribute("aria-hidden", "true");
        document.body.style.overflow = "";
        if (elementoPrevio) elementoPrevio.focus();
    }

    imagenes.forEach(el => {
        const titulo = obtenerTitulo(el) || "artículo";

        el.setAttribute("role", "button");
        el.setAttribute("tabindex", "0");
        el.setAttribute("aria-label", `Ampliar foto de ${titulo}`);

        el.addEventListener("click", () => abrir(el));
        el.addEventListener("keydown", (e) => {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                abrir(el);
            }
        });
    });

    lightbox.addEventListener("click", (e) => {
        // Cierra al pulsar fuera de la imagen o en la X
        if (e.target !== lbImg) cerrar();
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && lightbox.classList.contains("active")) cerrar();
    });
})();

/* =========================================================
   MENÚ MÓVIL
   ========================================================= */

const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");


if (menuToggle && nav) {

    menuToggle.addEventListener("click", () => {

        const isActive =
            nav.classList.toggle("active");


        menuToggle.setAttribute(
            "aria-expanded",
            isActive ? "true" : "false"
        );


        menuToggle.textContent =
            isActive ? "✕" : "☰";

    });


    /* Cerrar menú al pulsar un enlace */

    document
        .querySelectorAll(".nav a")
        .forEach(link => {

            link.addEventListener("click", () => {

                nav.classList.remove("active");

                menuToggle.setAttribute(
                    "aria-expanded",
                    "false"
                );

                menuToggle.textContent = "☰";

            });

        });

}



/* =========================================================
   FILTROS DE CARTA
   ========================================================= */

const filterButtons =
    document.querySelectorAll(".filter-btn");


const pizzaCards =
    document.querySelectorAll(".pizza-card");


const showMoreContainer =
    document.getElementById("showMoreContainer");


const showMoreBtn =
    document.getElementById("showMoreBtn");



/*
   Estado actual de la carta.

   En TODAS:
   - Se muestran inicialmente las 3 pizzas marcadas
     con data-default="true":
       · Margarita
       · Lacón Portobello
       · Menorquina
   - VER MÁS muestra todos los productos.
   - VER MENOS vuelve a mostrar únicamente esas 3.

   En cualquier otra categoría:
   - Se muestran todos los productos.
   - El botón desaparece.
*/


let currentCategory = "todas";

let expanded = false;



/* =========================================================
   MOSTRAR CATEGORÍA
   ========================================================= */

function showCategory(category) {

    currentCategory = category;

    expanded = false;


    pizzaCards.forEach(card => {

        card.classList.remove("hidden-all");


        const matches =
            category === "todas" ||
            card.dataset.category === category;


        if (!matches) {

            card.style.display = "none";

            return;

        }


        /*
            En TODAS se muestran únicamente las tres
            pizzas marcadas como destacadas inicialmente.
        */

        if (
            category === "todas" &&
            card.dataset.default !== "true"
        ) {

            card.classList.add("hidden-all");

        }


        card.style.display = "block";

    });



    /* =====================================================
       TODAS
       ===================================================== */

    if (category === "todas") {

        const totalCards =
            pizzaCards.length;


        if (totalCards > 3) {

            showMoreContainer.classList.add("visible");

            showMoreBtn.textContent = "Ver más";

            showMoreBtn.dataset.expanded = "false";

        } else {

            showMoreContainer.classList.remove("visible");

        }

    }


    /* =====================================================
       OTRAS CATEGORÍAS
       ===================================================== */

    else {

        showMoreContainer.classList.remove("visible");

        showMoreBtn.dataset.expanded = "false";

    }

}



/* =========================================================
   INICIALIZAR CARTA
   ========================================================= */

showCategory("todas");



/* =========================================================
   CAMBIAR CATEGORÍA
   ========================================================= */

filterButtons.forEach(button => {

    button.addEventListener("click", () => {


        filterButtons.forEach(btn => {

            btn.classList.remove("active");

        });


        button.classList.add("active");


        const category =
            button.dataset.category;


        showCategory(category);

    });

});



/* =========================================================
   BOTÓN VER MÁS / VER MENOS
   ========================================================= */

if (showMoreBtn) {

    showMoreBtn.addEventListener("click", () => {


        if (currentCategory !== "todas") {

            return;

        }


        expanded = !expanded;


        if (expanded) {


            /* =============================================
               MOSTRAR TODOS LOS PRODUCTOS

               Se mantiene exactamente el orden del HTML.
               ============================================= */

            pizzaCards.forEach(card => {

                card.style.display = "block";

                card.classList.remove("hidden-all");

            });


            showMoreBtn.textContent =
                "Ver menos";


            showMoreBtn.dataset.expanded =
                "true";


        } else {


            /* =============================================
               VOLVER A MOSTRAR LAS 3 DESTACADAS
               ============================================= */

            pizzaCards.forEach(card => {

                const isDefault =
                    card.dataset.default === "true";


                card.style.display = "block";


                if (isDefault) {

                    card.classList.remove("hidden-all");

                } else {

                    card.classList.add("hidden-all");

                }

            });


            showMoreBtn.textContent =
                "Ver más";


            showMoreBtn.dataset.expanded =
                "false";


            /*
               Volver al comienzo de la sección
               de carta.
            */

            document
                .getElementById("carta")
                .scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

        }

    });

}



/* =========================================================
   CARRUSEL HISTORIA
   ========================================================= */

const slides = document.querySelectorAll(".carousel-slide");
const dots = document.querySelectorAll(".carousel-dots .dot");
const prevBtn = document.getElementById("carouselPrev");
const nextBtn = document.getElementById("carouselNext");

let currentSlide = 0;
let carouselTimer = null;

function goToSlide(index) {
    if (!slides.length) return;

    slides.forEach(slide => slide.classList.remove("active"));
    dots.forEach(dot => dot.classList.remove("active"));

    currentSlide = (index + slides.length) % slides.length;

    slides[currentSlide].classList.add("active");
    if (dots[currentSlide]) {
        dots[currentSlide].classList.add("active");
    }
}

function startCarouselTimer() {
    stopCarouselTimer();
    carouselTimer = setInterval(() => {
        goToSlide(currentSlide + 1);
    }, 4000);
}

function stopCarouselTimer() {
    if (carouselTimer) {
        clearInterval(carouselTimer);
    }
}

if (slides.length) {
    if (prevBtn) {
        prevBtn.addEventListener("click", () => {
            goToSlide(currentSlide - 1);
            startCarouselTimer();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener("click", () => {
            goToSlide(currentSlide + 1);
            startCarouselTimer();
        });
    }

    dots.forEach(dot => {
        dot.addEventListener("click", (e) => {
            const index = parseInt(e.target.dataset.index, 10);
            goToSlide(index);
            startCarouselTimer();
        });
    });

    startCarouselTimer();
}



/* =========================================================
   ANIMACIÓN AL HACER SCROLL
   ========================================================= */

const animatedElements =
    document.querySelectorAll(
        ".pizza-card, .feature"
    );



if ("IntersectionObserver" in window) {


    const observer =
        new IntersectionObserver(
            entries => {

                entries.forEach(entry => {

                    if (entry.isIntersecting) {

                        entry.target.style.opacity =
                            "1";


                        entry.target.style.transform =
                            "translateY(0)";


                        observer.unobserve(
                            entry.target
                        );

                    }

                });

            },
            {
                threshold: 0.1
            }
        );



    animatedElements.forEach(element => {

        element.style.opacity = "0";

        element.style.transform =
            "translateY(20px)";

        element.style.transition =
            "opacity .6s ease, transform .6s ease";


        observer.observe(element);

    });


} else {


    animatedElements.forEach(element => {

        element.style.opacity = "1";

        element.style.transform =
            "translateY(0)";

    });

}g
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
   - Se muestran inicialmente 6.
   - VER MÁS muestra todos.
   - VER MENOS vuelve a mostrar 6.

   En cualquier otra categoría:
   - Se muestran todos.
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


    const visibleCards = [];


    pizzaCards.forEach(card => {

        card.classList.remove("hidden-all");


        const matches =
            category === "todas" ||
            card.dataset.category === category;


        if (matches) {

            card.style.display = "block";

            visibleCards.push(card);

        } else {

            card.style.display = "none";

        }

    });



    /* =====================================================
       TODAS
       ===================================================== */

    if (category === "todas") {

        visibleCards.forEach((card, index) => {

            if (index >= 6) {

                card.classList.add("hidden-all");

            }

        });


        if (visibleCards.length > 6) {

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
   INICIALIZAR
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


            /* Mostrar todos los productos */

            pizzaCards.forEach(card => {

                card.style.display = "block";

                card.classList.remove("hidden-all");

            });


            showMoreBtn.textContent =
                "Ver menos";


            showMoreBtn.dataset.expanded =
                "true";


        } else {


            /* Volver a mostrar solamente los 6 primeros */

            pizzaCards.forEach((card, index) => {

                card.style.display = "block";


                if (index >= 6) {

                    card.classList.add("hidden-all");

                } else {

                    card.classList.remove("hidden-all");

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
   ANIMACIÓN AL HACER SCROLL
   ========================================================= */

const animatedElements =
    document.querySelectorAll(
        ".pizza-card, .feature, .contact-item"
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

}
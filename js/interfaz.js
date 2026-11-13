/* =========================================================
   interfaz.js · Menú móvil, filtros de la carta y carrusel de la historia.
   ========================================================= */

/* =========================================================
   MENÚ MÓVIL
   ========================================================= */
const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");

if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
        const isActive = nav.classList.toggle("active");
        menuToggle.setAttribute("aria-expanded", isActive ? "true" : "false");
        menuToggle.textContent = isActive ? "✕" : "☰";
    });

    document.querySelectorAll(".nav a").forEach(link => {
        link.addEventListener("click", () => {
            nav.classList.remove("active");
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.textContent = "☰";
        });
    });
}

/* =========================================================
   FILTROS DE CARTA
   ========================================================= */
const filterButtons = document.querySelectorAll(".filter-btn");
const pizzaCards = document.querySelectorAll(".pizza-card");
const showMoreContainer = document.getElementById("showMoreContainer");
const showMoreBtn = document.getElementById("showMoreBtn");

let currentCategory = "todas";
let expanded = false;

function showCategory(category) {
    currentCategory = category;
    expanded = false;

    pizzaCards.forEach(card => {
        card.classList.remove("hidden-all");
        const matches = category === "todas" || card.dataset.category === category;

        if (!matches) {
            card.style.display = "none";
            return;
        }

        if (category === "todas" && card.dataset.default !== "true") {
            card.classList.add("hidden-all");
        }

        card.style.display = "block";
    });

    if (category === "todas") {
        const totalCards = pizzaCards.length;
        if (totalCards > 3) {
            showMoreContainer.classList.add("visible");
            showMoreBtn.textContent = "Ver más";
            showMoreBtn.dataset.expanded = "false";
        } else {
            showMoreContainer.classList.remove("visible");
        }
    } else {
        showMoreContainer.classList.remove("visible");
        showMoreBtn.dataset.expanded = "false";
    }
}

showCategory("todas");

filterButtons.forEach(button => {
    button.addEventListener("click", () => {
        filterButtons.forEach(btn => btn.classList.remove("active"));
        button.classList.add("active");
        showCategory(button.dataset.category);
    });
});

if (showMoreBtn) {
    showMoreBtn.addEventListener("click", () => {
        if (currentCategory !== "todas") return;
        expanded = !expanded;

        if (expanded) {
            pizzaCards.forEach(card => {
                card.style.display = "block";
                card.classList.remove("hidden-all");
            });
            showMoreBtn.textContent = "Ver menos";
            showMoreBtn.dataset.expanded = "true";
        } else {
            pizzaCards.forEach(card => {
                const isDefault = card.dataset.default === "true";
                card.style.display = "block";
                if (isDefault) {
                    card.classList.remove("hidden-all");
                } else {
                    card.classList.add("hidden-all");
                }
            });
            showMoreBtn.textContent = "Ver más";
            showMoreBtn.dataset.expanded = "false";
            document.getElementById("carta").scrollIntoView({ behavior: "smooth", block: "start" });
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
    if (carouselTimer) clearInterval(carouselTimer);
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

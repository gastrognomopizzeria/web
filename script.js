/* =========================================================
   SISTEMA DE PEDIDOS INTELIGENTE - GASTROGNOMO
   ========================================================= */

// CONFIGURACIÓN DE SUPABASE
const SUPABASE_URL = 'https://refrscscreylowmocfcx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_XiXjP4gjaQUXf84U6-5QZw_Dw-YhdSu';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let cart = [];

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

/* =========================================================
   VENTANA MODAL AVISO LEGAL
   ========================================================= */
const openLegalModal = document.getElementById("openLegalModal");
const legalModal = document.getElementById("legalModal");
const closeLegalModal = document.getElementById("closeLegalModal");
const legalBackdrop = document.getElementById("legalBackdrop");

if (openLegalModal && legalModal) {
    openLegalModal.addEventListener("click", (e) => {
        e.preventDefault();
        legalModal.classList.add("active");
        document.body.style.overflow = "hidden";
    });

    const closeModalFunc = () => {
        legalModal.classList.remove("active");
        document.body.style.overflow = "";
    };

    if (closeLegalModal) closeLegalModal.addEventListener("click", closeModalFunc);
    if (legalBackdrop) legalBackdrop.addEventListener("click", closeModalFunc);

    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape" && legalModal.classList.contains("active")) {
            closeModalFunc();
        }
    });
}

/* =========================================================
   CARRITO Y MODALES DE PEDIDOS
   ========================================================= */
const cartFloatingBtn = document.getElementById("cartFloatingBtn");
const cartModal = document.getElementById("cartModal");
const closeCartModal = document.getElementById("closeCartModal");
const cartBackdrop = document.getElementById("cartBackdrop");
const cartItemsList = document.getElementById("cartItemsList");
const cartCount = document.getElementById("cartCount");
const cartFooter = document.getElementById("cartFooter");
const cartTotalPrice = document.getElementById("cartTotalPrice");
const checkoutForm = document.getElementById("checkoutForm");
const orderTypeSelect = document.getElementById("orderType");
const addressGroup = document.getElementById("addressGroup");
const orderTimeSelect = document.getElementById("orderTime");
const orderDateInput = document.getElementById("orderDate");

// Elementos del Modal de Personalización
const customModal = document.getElementById("customModal");
const closeCustomModal = document.getElementById("closeCustomModal");
const customBackdrop = document.getElementById("customBackdrop");
const modalPizzaTitle = document.getElementById("modalPizzaTitle");
const modalPizzaPrice = document.getElementById("modalPizzaPrice");
const modalQtyMinus = document.getElementById("modalQtyMinus");
const modalQtyPlus = document.getElementById("modalQtyPlus");
const modalQtyValue = document.getElementById("modalQtyValue");
const extraCheckboxes = document.querySelectorAll(".extra-checkbox");
const modalItemNotes = document.getElementById("modalItemNotes");
const confirmAddToCartBtn = document.getElementById("confirmAddToCartBtn");
const modalTotalPrice = document.getElementById("modalTotalPrice");

let currentSelectedPizza = null;
let currentQuantity = 1;

// Ocultar botón flotante al inicio si no hay artículos
if (cartFloatingBtn) cartFloatingBtn.style.display = "none";

// 1. ABRIR MODAL DE PERSONALIZACIÓN AL CLICAR "AÑADIR AL PEDIDO"
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-add-cart")) {
        const name = e.target.dataset.name;
        const basePrice = parseFloat(e.target.dataset.price);

        currentSelectedPizza = { name, basePrice };
        currentQuantity = 1;
        modalQtyValue.textContent = currentQuantity;
        modalPizzaTitle.textContent = name;
        modalPizzaPrice.textContent = `Precio base: ${basePrice.toFixed(2)} €`;

        // Limpiar extras y notas previas
        extraCheckboxes.forEach(cb => cb.checked = false);
        modalItemNotes.value = "";
        calcularPrecioModal();

        customModal.classList.add("active");
        document.body.style.overflow = "hidden";
    }
});

// Control de cantidad en el modal
if (modalQtyPlus) {
    modalQtyPlus.addEventListener("click", () => {
        currentQuantity++;
        modalQtyValue.textContent = currentQuantity;
        calcularPrecioModal();
    });
}
if (modalQtyMinus) {
    modalQtyMinus.addEventListener("click", () => {
        if (currentQuantity > 1) {
            currentQuantity--;
            modalQtyValue.textContent = currentQuantity;
            calcularPrecioModal();
        }
    });
}

extraCheckboxes.forEach(cb => {
    cb.addEventListener("change", calcularPrecioModal);
});

function calcularPrecioModal() {
    if (!currentSelectedPizza) return;
    let unitPrice = currentSelectedPizza.basePrice;

    extraCheckboxes.forEach(cb => {
        if (cb.checked) {
            unitPrice += parseFloat(cb.dataset.price);
        }
    });

    const total = unitPrice * currentQuantity;
    modalTotalPrice.textContent = `${total.toFixed(2)} €`;
}

// 2. CONFIRMAR Y AÑADIR AL CARRITO
if (confirmAddToCartBtn) {
    confirmAddToCartBtn.addEventListener("click", () => {
        let unitPrice = currentSelectedPizza.basePrice;
        let extrasText = [];

        extraCheckboxes.forEach(cb => {
            if (cb.checked) {
                unitPrice += parseFloat(cb.dataset.price);
                extrasText.push(cb.dataset.name);
            }
        });

        const notes = modalItemNotes.value.trim();
        const fullName = extrasText.length > 0 ? `${currentSelectedPizza.name} (+ ${extrasText.join(", ")})` : currentSelectedPizza.name;

        const existingItem = cart.find(item => item.name === fullName && item.notes === notes);
        if (existingItem) {
            existingItem.quantity += currentQuantity;
        } else {
            cart.push({
                name: fullName,
                price: unitPrice,
                quantity: currentQuantity,
                notes: notes
            });
        }

        customModal.classList.remove("active");
        document.body.style.overflow = "";
        updateCartBadge();
        renderCart();
    });
}

// Cerrar modal de personalización
const closeCustomModalFunc = () => {
    customModal.classList.remove("active");
    document.body.style.overflow = "";
};
if (closeCustomModal) closeCustomModal.addEventListener("click", closeCustomModalFunc);
if (customBackdrop) customBackdrop.addEventListener("click", closeCustomModalFunc);

// 3. ABRIR / CERRAR MODAL DEL CARRITO PRINCIPAL
if (cartFloatingBtn && cartModal) {
    cartFloatingBtn.addEventListener("click", () => {
        cartModal.classList.add("active");
        document.body.style.overflow = "hidden";
        renderCart();
        inicializarSelectorFechasYHoras();
    });

    const closeCartFunc = () => {
        cartModal.classList.remove("active");
        document.body.style.overflow = "";
    };

    if (closeCartModal) closeCartModal.addEventListener("click", closeCartFunc);
    if (cartBackdrop) cartBackdrop.addEventListener("click", closeCartFunc);
}

// Recargo de 1€ a domicilio gestionado al cambiar el selector de tipo de pedido
if (orderTypeSelect && addressGroup) {
    orderTypeSelect.addEventListener("change", (e) => {
        const isDomicilio = e.target.value === "domicilio";
        if (isDomicilio) {
            addressGroup.style.display = "flex";
            document.getElementById("clientAddress").required = true;
        } else {
            addressGroup.style.display = "none";
            document.getElementById("clientAddress").required = false;
        }
        actualizarHorasDisponibles();
        renderCart(); // Recalcula los precios con o sin recargo de domicilio
    });
}

function updateCartBadge() {
    const totalCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = totalCount;
    if (cartFloatingBtn) {
        cartFloatingBtn.style.display = totalCount > 0 ? "flex" : "none";
    }
}

function renderCart() {
    if (cart.length === 0) {
        cartItemsList.innerHTML = `<p class="cart-empty-msg">Tu carrito está vacío.</p>`;
        if (cartFooter) cartFooter.style.display = "none";
        if (cartFloatingBtn) cartFloatingBtn.style.display = "none";
        return;
    }

    if (cartFooter) cartFooter.style.display = "block";
    let html = "";
    let total = 0;

    const isDomicilio = orderTypeSelect && orderTypeSelect.value === "domicilio";
    const recargoDomicilio = isDomicilio ? 1.00 : 0.00;

    cart.forEach((item, index) => {
        const precioFinalUnitario = item.price + recargoDomicilio;
        const subtotal = precioFinalUnitario * item.quantity;
        total += subtotal;

        html += `
            <div class="cart-item" style="margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    ${item.notes ? `<small style="color: #666;">Nota: ${item.notes}</small><br>` : ''}
                    <span>${item.quantity}x ${precioFinalUnitario.toFixed(2)} € ${isDomicilio ? '<small>(+1€ domicilio)</small>' : ''} = <strong>${subtotal.toFixed(2)} €</strong></span>
                </div>
                <div class="cart-item-controls" style="margin-top: 5px;">
                    <button type="button" onclick="changeQuantity(${index}, -1)" style="padding:2px 8px;">-</button>
                    <span style="margin: 0 10px;">${item.quantity}</span>
                    <button type="button" onclick="changeQuantity(${index}, 1)" style="padding:2px 8px;">+</button>
                </div>
            </div>
        `;
    });

    cartItemsList.innerHTML = html;
    if (cartTotalPrice) cartTotalPrice.textContent = `${total.toFixed(2)} €`;
}

window.changeQuantity = function(index, change) {
    cart[index].quantity += change;
    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }
    updateCartBadge();
    renderCart();
};

function inicializarSelectorFechasYHoras() {
    if (!orderDateInput) return;
    
    const today = new Date().toISOString().split('T')[0];
    orderDateInput.value = today;
    orderDateInput.min = today;

    orderDateInput.removeEventListener("change", actualizarHorasDisponibles);
    orderDateInput.addEventListener("change", actualizarHorasDisponibles);
    actualizarHorasDisponibles();
}

async function actualizarHorasDisponibles() {
    if (!orderTimeSelect || !orderDateInput) return;

    const fecha = orderDateInput.value;
    const tipo = orderTypeSelect ? orderTypeSelect.value : "recoger"; 
    const intervaloMinutos = (tipo === "recoger") ? 15 : 30;

    const { data: bloqueados, error } = await supabaseClient
        .from('horarios_bloqueados')
        .select('hora')
        .eq('fecha', fecha)
        .eq('tipo', tipo);

    const horasBloqueadas = bloqueados ? bloqueados.map(b => b.hora) : [];

    const horaInicio = 19 * 60 + 30;
    const horaFin = 23 * 60 + 30;
    
    let optionsHtml = "";
    let hayDisponibles = false;

    for (let m = horaInicio; m <= horaFin; m += intervaloMinutos) {
        let horas = Math.floor(m / 60);
        let mins = m % 60;
        let horaStr = `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

        if (horasBloqueadas.includes(horaStr)) {
            continue; 
        }

        hayDisponibles = true;
        optionsHtml += `<option value="${horaStr}">${horaStr}</option>`;
    }

    if (!hayDisponibles) {
        optionsHtml = `<option value="">No hay horarios disponibles</option>`;
    }

    orderTimeSelect.innerHTML = optionsHtml;
}

if (checkoutForm) {
    checkoutForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            alert("Tu carrito está vacío.");
            return;
        }

        const name = document.getElementById("clientName").value.trim();
        const phone = document.getElementById("clientPhone").value.trim();
        const orderType = orderTypeSelect.value;
        const address = document.getElementById("clientAddress") ? document.getElementById("clientAddress").value.trim() : "";
        const fecha = orderDateInput.value;
        const hora = orderTimeSelect.value;
        const notes = document.getElementById("clientNotes").value.trim();

        if (!hora) {
            alert("Por favor, selecciona una hora válida para el pedido.");
            return;
        }

        const isDomicilio = orderType === "domicilio";
        const recargoDomicilio = isDomicilio ? 1.00 : 0.00;

        let detalleTexto = "";
        let total = 0;
        cart.forEach(item => {
            const precioFinalUnitario = item.price + recargoDomicilio;
            const sub = precioFinalUnitario * item.quantity;
            total += sub;
            detalleTexto += `${item.quantity}x ${item.name} (${sub.toFixed(2)} €)`;
            if (item.notes) detalleTexto += ` [Nota: ${item.notes}]`;
            detalleTexto += `\n`;
        });
        detalleTexto += `TOTAL: ${total.toFixed(2)} €`;

        const { error } = await supabaseClient
            .from('pedidos')
            .insert([{
                nombre: name,
                telefono: phone,
                tipo_entrega: orderType,
                direccion: isDomicilio ? address : 'Recogida en local',
                hora_entrega: `${fecha} a las ${hora}`,
                detalle_pedido: detalleTexto,
                notas: notes,
                impreso: false
            }]);

        if (error) {
            console.error("Error al enviar pedido:", error);
            alert("Hubo un error al procesar tu pedido. Por favor, inténtalo de nuevo o llámanos.");
            return;
        }

        alert("¡Pedido realizado con éxito! En breve lo prepararemos en Gastrognomo.");
        cart = [];
        updateCartBadge();
        cartModal.classList.remove("active");
        document.body.style.overflow = "";
        checkoutForm.reset();
    });
}
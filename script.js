/* =========================================================
   SISTEMA DE PEDIDOS INTELIGENTE - GASTROGNOMO
   ========================================================= */

// CONFIGURACIÓN DE SUPABASE
const SUPABASE_URL = 'https://refrscscreylowmocfcx.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_XiXjP4gjaQUXf84U6-5QZw_Dw-YhdSu';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

let cart = [];

// FUNCIÓN AUXILIAR: Limpia tildes, eñes y símbolos para impresoras POS-80
function limpiarTextoParaImpresora(texto) {
    if (!texto) return "";
    return texto
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "") // Elimina acentos/tildes
        .replace(/[Ñ]/g, "N")
        .replace(/[ñ]/g, "n")
        .replace(/[€]/g, "EUR")
        .replace(/[¡!]/g, "!") 
        .replace(/[ºª]/g, "");
}

// FUNCIÓN AUXILIAR: Ajusta y corta texto de forma estricta (incluso palabras sin espacios) para NUNCA superar los 42 caracteres
function ajustarAnchoPOS80(texto, maxChars = 42, indent = "") {
    if (!texto) return "";
    let palabras = texto.split(" ");
    let lineas = [];
    let lineaActual = indent;

    palabras.forEach(palabra => {
        while (palabra.length > maxChars - indent.length) {
            let espacioRestante = maxChars - lineaActual.length;
            let parte = palabra.substring(0, espacioRestante);
            lineaActual += parte;
            lineas.push(lineaActual);
            lineaActual = indent;
            palabra = palabra.substring(espacioRestante);
        }

        let espacioNecesario = (lineaActual === indent ? 0 : 1) + palabra.length;
        if (lineaActual.length + espacioNecesario <= maxChars) {
            if (lineaActual !== indent) lineaActual += " ";
            lineaActual += palabra;
        } else {
            lineas.push(lineaActual);
            lineaActual = indent + palabra;
        }
    });

    if (lineaActual.trim() !== "") {
        lineas.push(lineaActual);
    }
    return lineas.join("\n");
}

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

if (cartFloatingBtn) cartFloatingBtn.style.display = "none";

// 1. ABRIR MODAL DE PERSONALIZACIÓN AL CLICAR "AÑADIR YA"
document.addEventListener("click", (e) => {
    if (e.target.classList.contains("btn-add-cart")) {
        const name = e.target.dataset.name;
        const basePrice = parseFloat(e.target.dataset.price);

        currentSelectedPizza = { name, basePrice };
        currentQuantity = 1;
        modalQtyValue.textContent = currentQuantity;
        modalPizzaTitle.textContent = name;
        modalPizzaPrice.textContent = `Precio base: ${basePrice.toFixed(2)} EUR`;

        extraCheckboxes.forEach(cb => cb.checked = false);
        modalItemNotes.value = "";
        calcularPrecioModal();

        customModal.classList.add("active");
        document.body.style.overflow = "hidden";
    }
});

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
    modalTotalPrice.textContent = `${total.toFixed(2)} EUR`;
}

// 2. CONFIRMAR Y AÑADIR AL CARRITO
if (confirmAddToCartBtn) {
    confirmAddToCartBtn.addEventListener("click", () => {
        let unitPrice = currentSelectedPizza.basePrice;
        let extrasList = [];

        extraCheckboxes.forEach(cb => {
            if (cb.checked) {
                unitPrice += parseFloat(cb.dataset.price);
                extrasList.push(cb.dataset.name);
            }
        });

        const notes = modalItemNotes.value.trim();

        cart.push({
            name: currentSelectedPizza.name,
            price: unitPrice,
            quantity: currentQuantity,
            extras: extrasList,
            notes: notes
        });

        customModal.classList.remove("active");
        document.body.style.overflow = "";
        updateCartBadge();
        renderCart();
    });
}

const closeCustomModalFunc = () => {
    customModal.classList.remove("active");
    document.body.style.overflow = "";
};
if (closeCustomModal) closeCustomModal.addEventListener("click", closeCustomModalFunc);
if (customBackdrop) customBackdrop.addEventListener("click", closeCustomModalFunc);

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
        renderCart();
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
        cartItemsList.innerHTML = `<p class="cart-empty-msg">Tu carrito esta vacio.</p>`;
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

        let extrasHtml = "";
        if (item.extras && item.extras.length > 0) {
            extrasHtml += `<br><small style="color: #444; padding-left: 15px;">+ Extras: ${item.extras.join(", ")}</small>`;
        }
        if (item.notes) {
            extrasHtml += `<br><small style="color: #666; padding-left: 15px;">- Nota: ${item.notes}</small>`;
        }

        html += `
            <div class="cart-item" style="margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                <div class="cart-item-info">
                    <h4>${item.quantity}x ${item.name} - ${subtotal.toFixed(2)} EUR ${isDomicilio ? '<small>(+1 EUR dom.)</small>' : ''}</h4>
                    ${extrasHtml}
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
    if (cartTotalPrice) cartTotalPrice.textContent = `${total.toFixed(2)} EUR`;
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
    actualizarHorasDisponibles();
}

async function actualizarHorasDisponibles() {
    if (!orderTimeSelect || !orderDateInput) return;

    const fecha = orderDateInput.value;
    const tipo = orderTypeSelect ? orderTypeSelect.value : "recoger"; 
    
    // HORA DE INICIO: Recogida a las 19:30 (19*60+30), Domicilio a las 20:00 (20*60)
    const horaInicio = (tipo === "recoger") ? (19 * 60 + 30) : (20 * 60);
    const intervaloMinutos = (tipo === "recoger") ? 15 : 30;

    const { data: bloqueados } = await supabaseClient
        .from('horarios_bloqueados')
        .select('hora')
        .eq('fecha', fecha)
        .eq('tipo', tipo);

    const horasBloqueadas = bloqueados ? bloqueados.map(b => b.hora) : [];

    const horaFin = 23 * 60 + 30;
    
    let optionsHtml = "";
    let hayDisponibles = false;

    for (let m = horaInicio; m <= horaFin; m += intervaloMinutos) {
        let horas = Math.floor(m / 60);
        let mins = m % 60;
        let horaStr = `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

        if (horasBloqueadas.includes(horaStr)) continue; 

        hayDisponibles = true;
        optionsHtml += `<option value="${horaStr}">${horaStr}</option>`;
    }

    if (!hayDisponibles) {
        optionsHtml = `<option value="">No hay horarios disponibles</option>`;
    }

    orderTimeSelect.innerHTML = optionsHtml;
}

// PROCESAR Y ENVIAR CON ANCHO ESTRICTO DE 42 CARACTERES Y RECUPERACIÓN DE ID
if (checkoutForm) {
    checkoutForm.addEventListener("submit", async (e) => {
        e.preventDefault();

        if (cart.length === 0) {
            alert("Tu carrito esta vacio.");
            return;
        }

        const name = limpiarTextoParaImpresora(document.getElementById("clientName").value.trim());
        const phone = limpiarTextoParaImpresora(document.getElementById("clientPhone").value.trim());
        const orderType = orderTypeSelect.value;
        const address = limpiarTextoParaImpresora(document.getElementById("clientAddress") ? document.getElementById("clientAddress").value.trim() : "");
        const fecha = orderDateInput.value;
        const hora = orderTimeSelect.value;
        const notes = limpiarTextoParaImpresora(document.getElementById("clientNotes").value.trim());

        if (!hora) {
            alert("Por favor, selecciona una hora valida para el pedido.");
            return;
        }

        const { data: checkBloqueados } = await supabaseClient
            .from('horarios_bloqueados')
            .select('hora')
            .eq('fecha', fecha)
            .eq('tipo', orderType)
            .eq('hora', hora);

        if (checkBloqueados && checkBloqueados.length > 0) {
            alert(`¡Lo sentimos! La hora ${hora} acaba de ser completada o cerrada por el local.`);
            await actualizarHorasDisponibles();
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

            let lineaItem = `${item.quantity}x ${limpiarTextoParaImpresora(item.name)} (${sub.toFixed(2)} EUR)`;
            detalleTexto += ajustarAnchoPOS80(lineaItem, 42) + "\n";
            
            if (item.extras && item.extras.length > 0) {
                let lineaExtras = `+ Extras: ${limpiarTextoParaImpresora(item.extras.join(", "))}`;
                detalleTexto += ajustarAnchoPOS80(lineaExtras, 42, "   ") + "\n";
            }
            if (item.notes) {
                let textoNotaLimpio = limpiarTextoParaImpresora(item.notes);
                let lineaNota = ajustarAnchoPOS80(`- Nota: ${textoNotaLimpio}`, 42, "   ");
                detalleTexto += lineaNota + "\n";
            }
        });
        detalleTexto += `TOTAL: ${total.toFixed(2)} EUR`;

        const direccionTexto = isDomicilio ? address : 'Local - Ramon y Cajal 22';
        const horaEntregaTexto = `${fecha} a las ${hora}`;
        const tipoEntregaTextoLimpio = orderType === 'domicilio' ? 'DOMICILIO' : 'RECOGER EN LOCAL';

        // 1. Insertar el pedido en Supabase para obtener el ID real generado
        const { data: insertedData, error } = await supabaseClient
            .from('pedidos')
            .insert([{
                nombre: name,
                telefono: phone,
                tipo_entrega: orderType,
                direccion: direccionTexto,
                hora_entrega: horaEntregaTexto,
                detalle_pedido: "PENDIENTE",
                notas: notes,
                impreso: false
            }])
            .select();

        if (error || !insertedData || insertedData.length === 0) {
            console.error("Error al enviar pedido:", error);
            alert("Hubo un error al procesar tu pedido. Por favor, intentalo de nuevo.");
            return;
        }

        const pedidoId = insertedData[0].id;
        
        // 2. Construir el ticket oficial incluyendo el número de pedido real (#ID)
        let textoImpresionDirecto = "==========================================\n";
        textoImpresionDirecto += "           GASTROGNOMO PIZZERIA           \n";
        textoImpresionDirecto += "         Ramon y Cajal 22, Villena        \n";
        textoImpresionDirecto += "==========================================\n";
        textoImpresionDirecto += `PEDIDO #${pedidoId} - ${tipoEntregaTextoLimpio}\n`;
        textoImpresionDirecto += ajustarAnchoPOS80(`Cliente: ${name}`, 42) + "\n";
        textoImpresionDirecto += `Telefono: ${phone}\n`;
        textoImpresionDirecto += ajustarAnchoPOS80(`Direccion: ${direccionTexto}`, 42) + "\n";
        textoImpresionDirecto += `Hora Entrega: ${horaEntregaTexto}\n`;
        textoImpresionDirecto += "------------------------------------------\n";
        textoImpresionDirecto += "DETALLE:\n";
        textoImpresionDirecto += detalleTexto + "\n";
        textoImpresionDirecto += "------------------------------------------\n";
        if (notes) {
            textoImpresionDirecto += "NOTAS:\n" + ajustarAnchoPOS80(notes, 42, "   ") + "\n";
            textoImpresionDirecto += "------------------------------------------\n";
        }
        textoImpresionDirecto += "Gracias por confiar en nosotros!\n";

        // 3. Actualizar el registro en Supabase con el ticket ya estructurado
        await supabaseClient
            .from('pedidos')
            .update({ detalle_pedido: textoImpresionDirecto })
            .eq('id', pedidoId);

        // Redirigir a la página de éxito pasando el ID y los datos
        const queryParams = new URLSearchParams({
            id: pedidoId,
            nombre: name,
            telefono: phone,
            tipo: orderType,
            direccion: direccionTexto,
            hora: horaEntregaTexto,
            detalle: textoImpresionDirecto
        });

        window.location.href = `exito.html?${queryParams.toString()}`;
    });
}

/* =========================================================
    pedido.js · Carrito, personalizar artículo, horas y envío del pedido. Necesita config.js y utils.js.
    ========================================================= */

let cart = [];
try {
    const savedCart = localStorage.getItem('gastrognomo_cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
    }
} catch (e) {
    console.error("Error al cargar el carrito guardado:", e);
    cart = [];
}

function guardarCarrito() {
    try {
        localStorage.setItem('gastrognomo_cart', JSON.stringify(cart));
    } catch (e) {
        console.error("Error al guardar el carrito:", e);
    }
}

// Postres y bebidas: sin recargo de domicilio y sin contar para el mínimo ni máximo de pizzas
function llevaRecargoDomicilio(item) {
    const categoria = (item.categoria || "").toLowerCase();

    if (categoria === "postres" || categoria === "bebidas") return false;

    if (!categoria) {
        // Artículos guardados antes de existir el campo "categoria"
        const nombre = (item.name || "").toUpperCase();

        if (
            nombre.includes("TARTA") ||
            nombre.startsWith("AGUA") ||
            nombre.startsWith("REFRESCO")
        ) {
            return false;
        }
    }

    return true;
}

// Cuenta únicamente los artículos sujetos a los límites de pizzas
function contarPizzasCarrito() {
    return cart.reduce((sum, item) => {
        return sum + (llevaRecargoDomicilio(item) ? item.quantity : 0);
    }, 0);
}

/* =========================================================
    CARRITO Y MODALES DE PEDIDOS (CON EXTRA ÚNICO OBLIGATORIO)
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
const clientPrefixSelect = document.getElementById("clientPrefix");
const clientPhoneInput = document.getElementById("clientPhone");

const customModal = document.getElementById("customModal");
const closeCustomModal = document.getElementById("closeCustomModal");
const customBackdrop = document.getElementById("customBackdrop");
const modalPizzaTitle = document.getElementById("modalPizzaTitle");
const modalPizzaPrice = document.getElementById("modalPizzaPrice");
const modalQtyMinus = document.getElementById("modalQtyMinus");
const modalQtyPlus = document.getElementById("modalQtyPlus");
const modalQtyValue = document.getElementById("modalQtyValue");
const modalItemNotes = document.getElementById("modalItemNotes");
const confirmAddToCartBtn = document.getElementById("confirmAddToCartBtn");
const modalTotalPrice = document.getElementById("modalTotalPrice");

const toggleExtraUnico = document.getElementById("toggleExtraUnico");
const listExtraUnico = document.getElementById("listExtraUnico");
const selectExtraUnico = document.getElementById("selectExtraUnico");
const refrescoContainer = document.getElementById("refrescoContainer");
const selectRefresco = document.getElementById("selectRefresco");

let currentSelectedPizza = null;
let currentQuantity = 1;
let intentosFallidos = 0; // veces que ha fallado el envío del pedido en esta visita

updateCartBadge();

if (clientPrefixSelect && clientPhoneInput) {
    clientPrefixSelect.addEventListener("change", () => {
        if (clientPrefixSelect.value === "+34") {
            clientPhoneInput.setAttribute("maxlength", "9");
            clientPhoneInput.placeholder = "600123456";
        } else {
            clientPhoneInput.removeAttribute("maxlength");
            clientPhoneInput.placeholder = "Número de teléfono";
        }
    });
}

if (toggleExtraUnico && listExtraUnico) {
    toggleExtraUnico.addEventListener("change", (e) => {
        listExtraUnico.style.display = e.target.checked ? "block" : "none";

        if (!e.target.checked && selectExtraUnico) {
            selectExtraUnico.value = "";
        }

        calcularPrecioModal();
    });
}

if (selectExtraUnico) {
    selectExtraUnico.addEventListener("change", calcularPrecioModal);
}

function runFlyToCartAnimation(itemName, eventTarget) {
    const flyer = document.createElement("div");
    flyer.className = "fly-to-cart-item";
    flyer.textContent = `🛒 +${currentQuantity} ${itemName}`;

    let startX = window.innerWidth / 2 - 70;
    let startY = window.innerHeight / 2 - 25;

    if (eventTarget) {
        const rect = eventTarget.getBoundingClientRect();

        if (rect.width > 0 && rect.height > 0) {
            startX = rect.left + rect.width / 2 - 50;
            startY = rect.top + rect.height / 2 - 20;
        }
    }

    flyer.style.left = `${startX}px`;
    flyer.style.top = `${startY}px`;
    document.body.appendChild(flyer);

    let endX = window.innerWidth - 80;
    let endY = window.innerHeight - 80;

    if (cartFloatingBtn) {
        const cartRect = cartFloatingBtn.getBoundingClientRect();

        if (cartRect.width > 0 && cartRect.height > 0) {
            endX = cartRect.left + cartRect.width / 2 - 50;
            endY = cartRect.top + cartRect.height / 2 - 20;
        }
    }

    void flyer.offsetWidth;

    setTimeout(() => {
        flyer.style.transform = "scale(0.3) rotate(15deg)";
        flyer.style.left = `${endX}px`;
        flyer.style.top = `${endY}px`;
        flyer.style.opacity = "0.2";
    }, 30);

    setTimeout(() => {
        flyer.remove();

        if (cartFloatingBtn) {
            cartFloatingBtn.classList.remove("cart-animate-pulse");
            void cartFloatingBtn.offsetWidth;
            cartFloatingBtn.classList.add("cart-animate-pulse");
        }
    }, 800);
}

document.addEventListener("click", (e) => {
    const addBtn = e.target.closest(".btn-add-cart");

    if (addBtn) {
        window.lastValidOriginButton = addBtn;

        const name = addBtn.dataset.name;
        const basePrice = parseFloat(addBtn.dataset.price);

        const pizzaCard = addBtn.closest(".pizza-card");
        const category = pizzaCard ? pizzaCard.dataset.category : "";

        currentSelectedPizza = {
            name,
            basePrice,
            opcion: addBtn.dataset.opcion || "",
            categoria: category
        };

        currentQuantity = 1;
        modalQtyValue.textContent = currentQuantity;
        modalPizzaTitle.textContent = name;
        modalPizzaPrice.textContent = `Precio base: ${basePrice.toFixed(2)} EUR`;

        if (toggleExtraUnico) toggleExtraUnico.checked = false;
        if (listExtraUnico) listExtraUnico.style.display = "none";
        if (selectExtraUnico) selectExtraUnico.value = "";

        modalItemNotes.value = "";

        const extrasContainer = document.getElementById("extrasContainer");

        if (extrasContainer) {
            if (
                category === "postres" ||
                category === "bebidas" ||
                name.toUpperCase().includes("TARTA")
            ) {
                extrasContainer.style.display = "none";
            } else {
                extrasContainer.style.display = "flex";
            }
        }

        if (selectRefresco) selectRefresco.value = "";

        if (refrescoContainer) {
            refrescoContainer.style.display =
                currentSelectedPizza.opcion === "refresco" ? "flex" : "none";
        }

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

function calcularPrecioModal() {
    if (!currentSelectedPizza) return;

    let unitPrice = currentSelectedPizza.basePrice;

    if (
        toggleExtraUnico &&
        toggleExtraUnico.checked &&
        selectExtraUnico &&
        selectExtraUnico.value
    ) {
        const selectedOption =
            selectExtraUnico.options[selectExtraUnico.selectedIndex];

        const price = parseFloat(selectedOption.dataset.price || 0);
        unitPrice += price;
    }

    const total = unitPrice * currentQuantity;
    modalTotalPrice.textContent = `${total.toFixed(2)} EUR`;
}

if (confirmAddToCartBtn) {
    confirmAddToCartBtn.addEventListener("click", () => {
        let unitPrice = currentSelectedPizza.basePrice;
        let extrasList = [];
        let itemName = currentSelectedPizza.name;

        if (currentSelectedPizza.opcion === "refresco") {
            if (!selectRefresco || !selectRefresco.value) {
                alert("Por favor, elige un refresco en el desplegable.");
                return;
            }

            itemName = `${currentSelectedPizza.name} - ${selectRefresco.value}`;
        }

        if (toggleExtraUnico && toggleExtraUnico.checked) {
            if (!selectExtraUnico || !selectExtraUnico.value) {
                alert("Por favor, selecciona un ingrediente en el desplegable de extra.");
                return;
            }

            const selectedOpt =
                selectExtraUnico.options[selectExtraUnico.selectedIndex];

            unitPrice += parseFloat(selectedOpt.dataset.price || 0);
            extrasList.push(selectedOpt.value);
        }

        const notes = modalItemNotes.value.trim();

        cart.push({
            name: itemName,
            price: unitPrice,
            quantity: currentQuantity,
            extras: extrasList,
            notes: notes,
            categoria: currentSelectedPizza.categoria
        });

        guardarCarrito();

        customModal.classList.remove("active");
        document.body.style.overflow = "";

        if (toggleExtraUnico) toggleExtraUnico.checked = false;
        if (listExtraUnico) listExtraUnico.style.display = "none";
        if (selectExtraUnico) selectExtraUnico.value = "";
        if (selectRefresco) selectRefresco.value = "";

        let originElement = window.lastValidOriginButton;

        if (!originElement) {
            const cardElement = Array.from(document.querySelectorAll('.pizza-card')).find(card => {
                const titleEl = card.querySelector('.pizza-title h3');

                return titleEl &&
                    titleEl.textContent.trim().toUpperCase() === itemName.toUpperCase();
            });

            if (cardElement) {
                originElement = cardElement.querySelector('.btn-add-cart');
            }
        }

        runFlyToCartAnimation(itemName, originElement);
        updateCartBadge();
        renderCart();
    });
}

const closeCustomModalFunc = () => {
    customModal.classList.remove("active");
    document.body.style.overflow = "";
};

if (closeCustomModal) {
    closeCustomModal.addEventListener("click", closeCustomModalFunc);
}

if (customBackdrop) {
    customBackdrop.addEventListener("click", closeCustomModalFunc);
}

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

    if (closeCartModal) {
        closeCartModal.addEventListener("click", closeCartFunc);
    }

    if (cartBackdrop) {
        cartBackdrop.addEventListener("click", closeCartFunc);
    }
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
        const recargoItem = llevaRecargoDomicilio(item) ? recargoDomicilio : 0;
        const precioFinalUnitario = item.price + recargoItem;
        const subtotal = precioFinalUnitario * item.quantity;

        total += subtotal;

        let extrasHtml = "";

        if (item.extras && item.extras.length > 0) {
            extrasHtml += `<br><small style="color: #444; padding-left: 15px;">+ Extra: ${item.extras.join(", ")}</small>`;
        }

        if (item.notes) {
            extrasHtml += `<br><small style="color: #666; padding-left: 15px;">- Nota: ${item.notes}</small>`;
        }

        html += `
            <div class="cart-item" style="margin-bottom: 12px; border-bottom: 1px solid #eee; padding-bottom: 8px;">
                <div class="cart-item-info">
                    <h4>${item.quantity}x ${item.name} - ${subtotal.toFixed(2)} EUR ${recargoItem > 0 ? '<small>(+1 EUR dom.)</small>' : ''}</h4>
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

    if (cartTotalPrice) {
        cartTotalPrice.textContent = `${total.toFixed(2)} EUR`;
    }
}

window.changeQuantity = function(index, change) {
    cart[index].quantity += change;

    if (cart[index].quantity <= 0) {
        cart.splice(index, 1);
    }

    guardarCarrito();
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

    const horaInicio = (tipo === "recoger") ? (19 * 60 + 30) : (20 * 60);
    const intervaloMinutos = (tipo === "recoger") ? 15 : 30;

    // Consultamos qué horas han sido ABIERTAS explícitamente por el local en esta fecha y tipo
    const { data: abiertas } = await supabaseClient
        .from('horarios_bloqueados')
        .select('hora')
        .eq('fecha', fecha)
        .eq('tipo', tipo);

    // Creamos una lista limpia con las horas que SÍ están disponibles (abiertas)
    const horasDisponiblesList = abiertas ? abiertas.map(b => b.hora) : [];
    const horaFin = 23 * 60 + 30;

    let optionsHtml = '<option value="">Selecciona hora...</option>';
    let hayDisponibles = false;

    for (let m = horaInicio; m <= horaFin; m += intervaloMinutos) {
        let horas = Math.floor(m / 60);
        let mins = m % 60;

        let horaStr = `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;

        // Si la hora NO está en la lista de abiertas, nos la saltamos (está cerrada por defecto)
        if (!horasDisponiblesList.includes(horaStr)) continue;

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

        const orderType = orderTypeSelect.value;

        // SOLO contamos pizzas y artículos sujetos a las condiciones.
        // Postres, aguas y bebidas quedan excluidos.
        const totalPizzas = contarPizzasCarrito();

        // Mínimo de 2 pizzas para domicilio.
        if (orderType === "domicilio" && totalPizzas < 2) {
            alert("El pedido mínimo a domicilio son 2 pizzas.");
            return;
        }

        // Máximo de 15 pizzas para recoger.
        if (orderType === "recoger" && totalPizzas > 15) {
            alert("Para pedidos a recoger de más de 15 pizzas, por favor llamen por teléfono.");
            return;
        }

        // Máximo de 8 pizzas para domicilio.
        if (orderType === "domicilio" && totalPizzas > 8) {
            alert("Para pedidos a domicilio de más de 8 pizzas, por favor llamen por teléfono.");
            return;
        }

        const phoneInput = clientPhoneInput.value.trim();
        const prefixSelect = clientPrefixSelect.value;

        if (prefixSelect === "+34") {
            if (!/^\d{9}$/.test(phoneInput)) {
                alert("Para España (+34), el número de teléfono debe tener exactamente 9 dígitos.");
                return;
            }
        } else {
            if (!/^\d{6,15}$/.test(phoneInput)) {
                alert("Por favor, introduce un número de teléfono internacional válido.");
                return;
            }
        }

        const phone = limpiarTextoParaImpresora(`${prefixSelect} ${phoneInput}`);

        const name = limpiarTextoParaImpresora(
            document.getElementById("clientName").value.trim()
        );

        const address = limpiarTextoParaImpresora(
            document.getElementById("clientAddress")
                ? document.getElementById("clientAddress").value.trim()
                : ""
        );

        const fecha = orderDateInput.value;
        const hora = orderTimeSelect.value;

        const notes = limpiarTextoParaImpresora(
            document.getElementById("clientNotes").value.trim()
        );

        if (!hora) {
            alert("Por favor, selecciona una hora válida para el pedido.");
            return;
        }

        // Comprobamos que la hora seleccionada siga estando abierta en la base de datos
        const { data: checkAbiertas } = await supabaseClient
            .from('horarios_bloqueados')
            .select('hora')
            .eq('fecha', fecha)
            .eq('tipo', orderType)
            .eq('hora', hora);

        if (!checkAbiertas || checkAbiertas.length === 0) {
            alert(`¡Lo sentimos! La hora ${hora} acaba de ser cerrada o ya no está disponible.`);
            await actualizarHorasDisponibles();
            return;
        }

        const isDomicilio = orderType === "domicilio";
        const recargoDomicilio = isDomicilio ? 1.00 : 0.00;

        let detalleTexto = "";
        let total = 0;

        cart.forEach(item => {
            // Postres y bebidas no reciben el recargo de domicilio.
            const recargoItem = llevaRecargoDomicilio(item) ? recargoDomicilio : 0;

            const precioFinalUnitario = item.price + recargoItem;
            const sub = precioFinalUnitario * item.quantity;

            total += sub;

            let lineaItem = `${item.quantity}x ${limpiarTextoParaImpresora(item.name)} (${sub.toFixed(2)} EUR)`;

            detalleTexto += ajustarAnchoPOS80(lineaItem, 42) + "\n";

            if (item.extras && item.extras.length > 0) {
                let lineaExtras = `+ Extra: ${limpiarTextoParaImpresora(item.extras.join(", "))}`;
                detalleTexto += ajustarAnchoPOS80(lineaExtras, 42, "    ") + "\n";
            }

            if (item.notes) {
                let textoNotaLimpio = limpiarTextoParaImpresora(item.notes);
                let lineaNota = ajustarAnchoPOS80(`- Nota: ${textoNotaLimpio}`, 42, "    ");
                detalleTexto += lineaNota + "\n";
            }
        });

        detalleTexto += `TOTAL: ${total.toFixed(2)} EUR`;

        const direccionTexto = isDomicilio ? address : 'Local - Ramon y Cajal 22';
        const horaEntregaTexto = `${fecha} a las ${hora}`;
        const tipoEntregaTextoLimpio = orderType === 'domicilio' ? 'DOMICILIO' : 'RECOGER EN LOCAL';

        let textoImpresionDirecto = "==========================================\n";
        textoImpresionDirecto += "           GASTROGNOMO PIZZERIA           \n";
        textoImpresionDirecto += "         Ramon y Cajal 22, Villena        \n";
        textoImpresionDirecto += "==========================================\n";
        textoImpresionDirecto += `PEDIDO #{{ID}} - ${tipoEntregaTextoLimpio}\n`;
        textoImpresionDirecto += ajustarAnchoPOS80(`Cliente: ${name}`, 42) + "\n";
        textoImpresionDirecto += `Telefono: ${phone}\n`;
        textoImpresionDirecto += ajustarAnchoPOS80(`Direccion: ${direccionTexto}`, 42) + "\n";
        textoImpresionDirecto += `Hora Entrega: ${horaEntregaTexto}\n`;
        textoImpresionDirecto += "------------------------------------------\n";
        textoImpresionDirecto += "DETALLE:\n";
        textoImpresionDirecto += detalleTexto + "\n";
        textoImpresionDirecto += "------------------------------------------\n";

        if (notes) {
            textoImpresionDirecto += "NOTAS:\n" + ajustarAnchoPOS80(notes, 42, "    ") + "\n";
            textoImpresionDirecto += "------------------------------------------\n";
        }

        textoImpresionDirecto += "Gracias por confiar en nosotros!\n";

        const { data: pedidoIdNuevo, error } = await supabaseClient.rpc('crear_pedido', {
            p_nombre: name,
            p_telefono: phone,
            p_tipo_entrega: orderType,
            p_direccion: direccionTexto,
            p_hora_entrega: horaEntregaTexto,
            p_detalle_pedido: textoImpresionDirecto,
            p_notas: notes
        });

        if (error || !pedidoIdNuevo) {
            console.error("Error al enviar pedido:", error);

            intentosFallidos++;

            if (intentosFallidos >= 2) {
                alert("Parece que hay un problema con la web y no hemos podido procesar tu pedido. Por favor, llama por teléfono al 624 83 74 14 y te atenderemos.");
            } else {
                alert("Hubo un error al procesar tu pedido. Por favor, inténtalo de nuevo.");
            }

            return;
        }

        const pedidoId = pedidoIdNuevo;

        textoImpresionDirecto = textoImpresionDirecto.replace('{{ID}}', pedidoId);

        cart = [];
        localStorage.removeItem('gastrognomo_cart');

        try {
            sessionStorage.setItem('gastrognomo_ultimo_pedido', textoImpresionDirecto);
        } catch (e) {
            console.error("No se pudo guardar el ticket para la página de éxito:", e);
        }

        window.location.href = "exito.html";
    });
}

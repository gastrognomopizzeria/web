/* =========================================================
   utils.js · Funciones auxiliares del ticket (limpiar texto y ajustar ancho).
   ========================================================= */

function limpiarTextoParaImpresora(texto) {
    if (!texto) return "";
    return texto
        .toString()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[Ñ]/g, "N")
        .replace(/[ñ]/g, "n")
        .replace(/[€]/g, "EUR")
        .replace(/[¡!]/g, "!") 
        .replace(/[ºª]/g, "");
}

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

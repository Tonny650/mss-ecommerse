// URL de tu JSON local (colócalo en la misma carpeta que tu index.html)
const JSON_URL = "assets/data/products.json";

// Variables globales
let productoActual = null;
let tallaSeleccionada = null;
let productosGlobal = [];

// Formatear precio
function formatPrice(price) {
    if (!price) return "Consultar precio";
    const cleaned = price.toString().replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleaned);
    if (isNaN(parsed)) return "Consultar precio";
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(parsed);
}

function formatDescription(desc) {
    if (!desc) return "No hay descripción disponible";
    return desc.replace(/\*/g, "<br><br>*");
}

// Cargar productos desde el JSON
async function cargarProductosDesdeJSON() {
    try {
        const response = await fetch(JSON_URL);
        const productos = await response.json();

        // Guardar en variable global
        productosGlobal = productos.filter(p => p.active && !p.watermark);

        // Poblar filtro de tallas
        poblarFiltroTallas(productosGlobal);

        mostrarProductos(productosGlobal);
    } catch (error) {
        console.error("Error al cargar productos desde JSON:", error);
        mostrarProductos(obtenerProductosEjemplo());
    }
}

function mostrarProductos(productos) {
    const container = document.getElementById("productos-container");
    container.innerHTML = "";

    productos.forEach(producto => {
        const card = document.createElement("div");
        card.className = "col-lg-4 col-md-6 mb-4";
        card.innerHTML = `
            <div class="card h-100">
                <img src="${producto.images?.[0] || 'https://via.placeholder.com/300'}" 
                     class="card-img-top producto-imagen" alt="${producto.name}">
                <div class="card-body">
                    <h5 class="card-title">${producto.name}</h5>
                    <p class="card-text">${formatPrice(producto.retailPrice)}</p>
                    <button class="btn btn-primary" onclick="mostrarDetallesProducto(${JSON.stringify(producto).replace(/"/g, '&quot;')})">
                        Ver detalles
                    </button>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
}

function mostrarDetallesProducto(producto) {
    productoActual = producto;
    tallaSeleccionada = null;

    document.getElementById("modal-nombre").textContent = producto.name;
    document.getElementById("modal-precio").textContent = producto.retailPrice ? formatPrice(producto.retailPrice) : "Consultar precio";
    document.getElementById("modal-descripcion").innerHTML = formatDescription(producto.description);

    const imagenModal = document.getElementById("modal-imagen");
    const galeriaModal = document.getElementById("modal-galeria");
    const tallasContainer = document.getElementById("modal-tallas");

    // Imagen principal y galería
    if (producto.images && producto.images.length > 0) {
        imagenModal.src = producto.images[0];
        galeriaModal.innerHTML = "";
        producto.images.forEach((img, i) => {
            const mini = document.createElement("img");
            mini.src = img;
            mini.alt = `Imagen ${i + 1}`;
            mini.onclick = () => { imagenModal.src = img; };
            galeriaModal.appendChild(mini);
        });
    } else {
        imagenModal.src = "https://via.placeholder.com/500";
        galeriaModal.innerHTML = "";
    }

    // Tallas
    tallasContainer.innerHTML = "";
    if (producto.availableSizes?.length > 0) {
        producto.availableSizes.forEach(size => {
            const btn = document.createElement("button");
            btn.className = "talla-btn";
            btn.textContent = size;
            btn.onclick = () => {
                document.querySelectorAll("#modal-tallas .talla-btn").forEach(b => b.classList.remove("selected"));
                btn.classList.add("selected");
                tallaSeleccionada = size;
            };
            tallasContainer.appendChild(btn);
        });
    } else {
        tallasContainer.innerHTML = "<span class='text-muted'>No hay tallas disponibles</span>";
    }

    new bootstrap.Modal(document.getElementById("productoModal")).show();
}

function comprarPorWhatsApp() {
    if (!productoActual) return;
    const telefono = "+523121000117";
    let mensaje = `¡Hola! Estoy interesado en el producto: ${productoActual.name} - ${productoActual.retailPrice ? formatPrice(productoActual.retailPrice) : "Consultar precio"}.`;
    if (tallaSeleccionada) mensaje += `\nTalla seleccionada: ${tallaSeleccionada}`;
    window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`, "_blank");
}

function obtenerProductosEjemplo() {
    return [
        {
            name: "Producto Demo 1",
            retailPrice: 500,
            description: "Ejemplo de producto",
            availableSizes: ["M", "L"],
            images: ["https://via.placeholder.com/400"]
        },
        {
            name: "Producto Demo 2",
            retailPrice: 800,
            description: "Otro ejemplo",
            availableSizes: ["S", "XL"],
            images: ["https://via.placeholder.com/400"]
        }
    ];
}

function poblarFiltroTallas(productos) {
    const select = document.getElementById("filtro-talla");
    select.innerHTML = `<option value="">Todas</option>`;

    const tallas = new Set();
    productos.forEach(p => p.allSizes?.forEach(s => tallas.add(s)));

    tallas.forEach(size => {
        const opt = document.createElement("option");
        opt.value = size;
        opt.textContent = size;
        select.appendChild(opt);
    });

    select.addEventListener("change", () => {
        const talla = select.value;
        if (!talla) mostrarProductos(productosGlobal);
        else mostrarProductos(productosGlobal.filter(p => p.availableSizes?.includes(talla)));
    });
}

// Inicializar
document.addEventListener("DOMContentLoaded", cargarProductosDesdeJSON);

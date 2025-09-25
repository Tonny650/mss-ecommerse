// URL de tu API de Spring Boot (cambiar por la correcta)
const API_URL = 'http://72.60.127.45:8080/api/products';

// Variable global para almacenar el producto actual
let productoActual = null;
let tallaSeleccionada = null; // 🔹 global para guardar la talla elegida
let productosGlobal = []; // guardamos todos los productos aquí

// Función para formatear precio
function formatPrice(price) {
    if (!price) return "Consultar precio";

    // Quitar símbolos, comas o letras por si viniera "1,200.50 MXN"
    const cleaned = price.toString().replace(/[^0-9.]/g, "");
    const parsed = parseFloat(cleaned);

    if (isNaN(parsed)) {
        return "Consultar precio";
    }
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(parsed);
}

function formatDescription(description) {
    if (!description) return "<p class='text-muted'>Sin descripción</p>";

    // Dividimos por * y limpiamos espacios
    const items = description
        .split('*')
        .map(txt => txt.trim())
        .filter(txt => txt.length > 0);

    // Generamos lista UL
    return `
    <h6 class="fw-bold mb-2">Lo que tienes que saber de este producto</h6>
    <ul class="descripcion-lista">
      ${items.map(i => `<li>${i}</li>`).join('')}
    </ul>
  `;
}

// Función para cargar productos desde la API
async function cargarProductos() {
    try {
        const response = await fetch(API_URL);
        const productos = await response.json();

        // 🔹 Guardamos en variable global
        productosGlobal = productos.filter(p => p.active && !p.watermark);

        // 🔹 Poblar el filtro de tallas
        poblarFiltroTallas(productosGlobal);

        mostrarProductos(productosGlobal);
    } catch (error) {
        console.error('Error al cargar productos:', error);
        // En caso de error, mostrar productos de ejemplo
        mostrarProductos(obtenerProductosEjemplo());
    }
}

// Función para mostrar productos en el grid
function mostrarProductos(productos) {
    const container = document.getElementById('productos-container');
    container.innerHTML = '';

    productos.forEach(producto => {
        const card = document.createElement('div');
        card.className = 'col-lg-4 col-md-6 mb-4';
        card.innerHTML = `
            <div class="card h-100">
                <img src="${producto.images && producto.images.length > 0 ? producto.images[0] : 'https://via.placeholder.com/300'}" 
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

// Función para mostrar detalles del producto en el modal
function mostrarDetallesProducto(producto) {
    productoActual = producto;
    tallaSeleccionada = null;

    document.getElementById('modal-nombre').textContent = producto.name;
    document.getElementById('modal-precio').textContent = producto.retailPrice ? formatPrice(producto.retailPrice) : 'Consultar precio';
    document.getElementById('modal-descripcion').innerHTML = formatDescription(producto.description);

    const carouselInner = document.querySelector("#carouselProducto .carousel-inner");
    const carouselIndicators = document.querySelector("#carouselProducto .carousel-indicators");

    // Reset carrusel
    carouselInner.innerHTML = "";
    carouselIndicators.innerHTML = "";

    if (producto.images && producto.images.length > 0) {
        producto.images.forEach((imagen, index) => {
            // Slide
            const slide = document.createElement("div");
            slide.className = `carousel-item ${index === 0 ? "active" : ""}`;
            slide.innerHTML = `<img src="${imagen}" class="d-block w-100" alt="Imagen ${index + 1} de ${producto.name}" style="object-fit: contain; height: 300px;">`;
            carouselInner.appendChild(slide);

            // Indicador
            const indicator = document.createElement("button");
            indicator.type = "button";
            indicator.setAttribute("data-bs-target", "#carouselProducto");
            indicator.setAttribute("data-bs-slide-to", index);
            indicator.className = index === 0 ? "active" : "";
            carouselIndicators.appendChild(indicator);
        });
    } else {
        carouselInner.innerHTML = `
          <div class="carousel-item active">
            <img src="https://via.placeholder.com/500" class="d-block w-100" alt="Sin imagen" style="object-fit: contain; height: 300px;">
          </div>`;
    }

    // 🔹 Renderizar tallas
    const tallasContainer = document.getElementById('modal-tallas');
    tallasContainer.innerHTML = '';
    if (producto.availableSizes && producto.availableSizes.length > 0) {
        producto.availableSizes.forEach(size => {
            const btn = document.createElement('button');
            btn.className = 'talla-btn';
            btn.textContent = size;
            btn.onclick = () => {
                document.querySelectorAll('#modal-tallas .talla-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                tallaSeleccionada = size;
            };
            tallasContainer.appendChild(btn);
        });
    } else {
        tallasContainer.innerHTML = '<span class="text-muted">No hay tallas disponibles</span>';
    }

    // Mostrar modal
    const modal = new bootstrap.Modal(document.getElementById('productoModal'));
    modal.show();
}

// Función para comprar por WhatsApp
function comprarPorWhatsApp() {
    if (!productoActual) return;

    const telefono = "+523121000117"; // Reemplazar con el número de tu amigo
    let mensaje = `¡Hola! Estoy interesado en comprar el producto: ${productoActual.name} - ${productoActual.retailPrice ? formatPrice(productoActual.retailPrice) : 'Consultar precio'}.`;

    if (tallaSeleccionada) {
        mensaje += `\nTalla seleccionada: ${tallaSeleccionada}`;
    }

    const urlWhatsApp = `https://wa.me/${telefono}?text=${encodeURIComponent(mensaje)}`;
    window.open(urlWhatsApp, '_blank');
}

// Función de ejemplo para cuando la API no esté disponible
function obtenerProductosEjemplo() {
    return [
        {
            name: "Dolce Gabbana Portofino Negro Mate Rotulado King Sku.001",
            price: 969.00,
            description: "Modelo Dolce Gabbana Portofino Negro Mate Rotulado",
            images: ["https://acdn-us.mitiendanube.com/stores/004/063/669/products/1-6abec5d221d9a2011d17501815672019-480-0.webp"]
        },
        {
            name: "Dolce Gabbana Sorrento Negro Blanco Sku.002",
            price: 789.00,
            description: "Modelo Dolce Gabbana Sorrento Negro Blanco",
            images: ["https://acdn-us.mitiendanube.com/stores/004/063/669/products/1-f51261a8017af44c9517534929460779-240-0.webp"]
        }
    ];
}

function poblarFiltroTallas(productos) {
    const select = document.getElementById("filtro-talla");

    // Recolectar todas las tallas únicas
    const tallas = new Set();
    productos.forEach(p => {
        if (p.allSizes) {
            p.allSizes.forEach(size => tallas.add(size));
        }
    });

    // Insertar opciones
    tallas.forEach(size => {
        const option = document.createElement("option");
        option.value = size;
        option.textContent = size;
        select.appendChild(option);
    });

    // Evento para filtrar
    select.addEventListener("change", () => {
        const tallaSeleccionada = select.value;
        if (!tallaSeleccionada) {
            mostrarProductos(productosGlobal);
        } else {
            const filtrados = productosGlobal.filter(p =>
                p.availableSizes.includes(tallaSeleccionada)
            );
            mostrarProductos(filtrados);
        }
    });
}


// Cargar productos cuando la página esté lista
document.addEventListener('DOMContentLoaded', cargarProductos);

document.addEventListener("scroll", () => {
    const navbar = document.querySelector(".navbar");
    navbar.classList.toggle("scrolled", window.scrollY > 50);
});


// URL de tu API de Spring Boot (cambiar por la correcta)
const API_URL = 'http://tu-api-springboot.com/api/products';

// Variable global para almacenar el producto actual
let productoActual = null;

// Función para formatear precio
function formatPrice(price) {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
}

// Función para cargar productos desde la API
async function cargarProductos() {
    try {
        const response = await fetch(API_URL);
        const productos = await response.json();

        mostrarProductos(productos);
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
                    <p class="card-text">${producto.price ? formatPrice(producto.price) : 'Precio no disponible'}</p>
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

    document.getElementById('modal-nombre').textContent = producto.name;
    document.getElementById('modal-precio').textContent = producto.price ? formatPrice(producto.price) : 'Consultar precio';
    document.getElementById('modal-descripcion').textContent = producto.description || 'No hay descripción disponible';

    const imagenModal = document.getElementById('modal-imagen');
    const galeriaModal = document.getElementById('modal-galeria');

    // Configurar imagen principal
    if (producto.images && producto.images.length > 0) {
        imagenModal.src = producto.images[0];
        imagenModal.alt = producto.name;

        // Configurar galería de imágenes
        galeriaModal.innerHTML = '';
        producto.images.forEach((imagen, index) => {
            const miniatura = document.createElement('img');
            miniatura.src = imagen;
            miniatura.alt = `Imagen ${index + 1} de ${producto.name}`;
            miniatura.onclick = () => {
                imagenModal.src = imagen;
            };
            galeriaModal.appendChild(miniatura);
        });
    } else {
        imagenModal.src = 'https://via.placeholder.com/500';
        galeriaModal.innerHTML = '';
    }

    // Mostrar el modal
    const modal = new bootstrap.Modal(document.getElementById('productoModal'));
    modal.show();
}

// Función para comprar por WhatsApp
function comprarPorWhatsApp() {
    if (!productoActual) return;

    const telefono = "1234567890"; // Reemplazar con el número de tu amigo
    const mensaje = `¡Hola! Estoy interesado en comprar el producto: ${productoActual.name} - ${productoActual.price ? formatPrice(productoActual.price) : 'Consultar precio'}.`;

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

// Cargar productos cuando la página esté lista
document.addEventListener('DOMContentLoaded', cargarProductos);
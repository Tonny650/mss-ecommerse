const API_PRODUCTS = 'https://thestreetsaga.cloud/api/products';
const API_UPDATE_WATERMARK = 'https://thestreetsaga.cloud/api/admin/products/watermark';

async function fetchProducts() {
    try {
        const res = await fetch(API_PRODUCTS);
        const products = await res.json();

        const noWatermarkList = document.getElementById('noWatermarkList');
        const watermarkList = document.getElementById('watermarkList');

        noWatermarkList.innerHTML = '';
        watermarkList.innerHTML = '';

        products
            .filter(p => p.availableSizes && p.availableSizes.length > 0) // solo disponibles
            .forEach(product => {
                const card = document.createElement('div');
                card.className = 'product-card';

                const img = document.createElement('img');
                img.src = product.images[0]; // solo la primera imagen
                card.appendChild(img);

                const name = document.createElement('div');
                name.textContent = product.name;
                card.appendChild(name);

                const price = document.createElement('div');
                price.textContent = product.price;
                card.appendChild(price);

                const btn = document.createElement('button');
                btn.textContent = product.watermark ? 'Watermark: Sí' : 'Watermark: No';
                btn.className = product.watermark ? 'watermark-true' : 'watermark-false';
                btn.onclick = () => toggleWatermark(product.url, btn);
                card.appendChild(btn);

                if(product.watermark) {
                    watermarkList.appendChild(card);
                } else {
                    noWatermarkList.appendChild(card);
                }
            });

    } catch (err) {
        console.error('Error cargando productos:', err);
    }
}

async function toggleWatermark(url, btn) {
    const current = btn.textContent.includes('Sí');
    const newValue = !current;

    const params = new URLSearchParams({ url, watermark: newValue });
    try {
        const res = await fetch(`${API_UPDATE_WATERMARK}?${params.toString()}`, { method: 'PUT' });

        if (res.ok) {
            btn.textContent = newValue ? 'Watermark: Sí' : 'Watermark: No';
            btn.className = newValue ? 'watermark-true' : 'watermark-false';
            // Mover la tarjeta a la sección correspondiente
            const card = btn.parentElement;
            const parent = newValue ? document.getElementById('watermarkList') : document.getElementById('noWatermarkList');
            parent.appendChild(card);
        } else {
            alert('Error al actualizar watermark');
        }
    } catch (err) {
        console.error('Error en PUT watermark:', err);
        alert('Error de conexión');
    }
}

// Inicializar
fetchProducts();

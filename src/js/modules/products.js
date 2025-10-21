export let products = [
    {
        id: 1,
        name: "Труба бесшовная холоднодеформированная",
        code: "271.1121110-01",
        price: 1500,
        type: "seamless",
        diameter: 159,
        thickness: 5,
        gost: "gost1",
        steel: "steel3",
        warehouse: "moscow",
        availability: 15.5
    },
    {
        id: 2,
        name: "Труба бесшовная горячедеформированная",
        code: "271.1121110-02",
        price: 2300,
        type: "seamless",
        diameter: 219,
        thickness: 8,
        gost: "gost2",
        steel: "steel2",
        warehouse: "spb",
        availability: 8.2
    },
    {
        id: 3,
        name: "Труба профильная квадратная",
        code: "271.1121110-03",
        price: 850,
        type: "profile",
        diameter: 80,
        thickness: 3,
        gost: "gost3",
        steel: "steel1",
        warehouse: "ekb",
        availability: 22.7
    },
    {
        id: 4,
        name: "Труба нержавеющая пищевая",
        code: "271.1121110-04",
        price: 4200,
        type: "stainless",
        diameter: 50,
        thickness: 2,
        gost: "gost4",
        steel: "steel4",
        warehouse: "novosibirsk",
        availability: 3.8
    }
];

export let productStates = {};

export function initializeProducts() {
    products.forEach(product => {
        productStates[product.id] = {
            quantity: 1,
            unit: 'Тонны',
            price: product.price
        };
    });

    renderProducts();
    setupProductEventListeners();
}

export function renderProducts() {
    const productsGrid = document.querySelector('.products-grid');
    productsGrid.innerHTML = '';

    products.forEach(product => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card';
        productCard.setAttribute('data-product', product.id);
        productCard.setAttribute('data-name', product.name);
        productCard.setAttribute('data-type', product.type);
        productCard.setAttribute('data-diameter', product.diameter);
        productCard.setAttribute('data-thickness', product.thickness);
        productCard.setAttribute('data-gost', product.gost);
        productCard.setAttribute('data-steel', product.steel);
        productCard.setAttribute('data-warehouse', product.warehouse);
        productCard.setAttribute('data-price', product.price);
        productCard.setAttribute('data-availability', product.availability);

        const state = productStates[product.id];

        productCard.innerHTML = `
            <div class="product-image">
                <div class="image-placeholder">Фото трубы</div>
            </div>
            <div class="product-content">
                <h2 class="product-name" data-product="${product.id}">${product.name}</h2>
                <div class="product-code">${product.code}</div>
                <div class="product-info">
                    <div class="product-controls">
                        <div class="controls-row">
                            <div class="units-toggle">
                                <button class="unit-button ${state.unit === 'Тонны' ? 'active' : ''}">Тонны</button>
                                <button class="unit-button ${state.unit === 'Метры' ? 'active' : ''}">Метры</button>
                            </div>
                            <div class="quantity-controls">
                                <button class="quantity-minus">-</button>
                                <input type="text" class="quantity-value" value="${state.quantity}">
                                <button class="quantity-plus">+</button>
                            </div>
                        </div>
                        <div class="price-section">
                            <div class="price">${formatPrice(state.price)}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        productsGrid.appendChild(productCard);
    });
}

function setupProductEventListeners() {
    document.addEventListener('click', function(e) {
        if (e.target.closest('.product-card')) {
            const productCard = e.target.closest('.product-card');
            if (e.target.closest('.units-toggle') ||
                e.target.closest('.quantity-controls') ||
                e.target.closest('.price-section')) {
                return;
            }
            const productId = parseInt(productCard.getAttribute('data-product'));
            window.openProductModal(productId, false);
        }
    });

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('quantity-plus')) {
            handleQuantityChange(e.target, 1);
        } else if (e.target.classList.contains('quantity-minus')) {
            handleQuantityChange(e.target, -1);
        }
    });

    document.addEventListener('input', function(e) {
        if (e.target.classList.contains('quantity-value')) {
            handleQuantityInput(e.target);
        }
    });

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('unit-button')) {
            handleUnitChange(e.target);
        }
    });
}

function handleQuantityChange(button, change) {
    const productCard = button.closest('.product-card');
    const productId = parseInt(productCard.getAttribute('data-product'));
    const quantityInput = productCard.querySelector('.quantity-value');
    const product = products.find(p => p.id === productId);

    let value = parseInt(quantityInput.value) || 1;
    value += change;
    
    if (value < 1) value = 1;
    quantityInput.value = value;

    productStates[productId].quantity = value;
    productStates[productId].unit = productCard.querySelector('.unit-button.active').textContent;

    updateProductPrice(productCard, product, value);
}

function handleQuantityInput(input) {
    const productCard = input.closest('.product-card');
    const productId = parseInt(productCard.getAttribute('data-product'));
    const product = products.find(p => p.id === productId);

    let value = parseInt(input.value) || 1;
    if (value < 1) value = 1;

    productStates[productId].quantity = value;
    productStates[productId].unit = productCard.querySelector('.unit-button.active').textContent;

    updateProductPrice(productCard, product, value);
}

function handleUnitChange(button) {
    const toggle = button.parentElement;
    const productCard = button.closest('.product-card');
    const productId = parseInt(productCard.getAttribute('data-product'));
    const product = products.find(p => p.id === productId);

    toggle.querySelectorAll('.unit-button').forEach(btn => {
        btn.classList.remove('active');
    });
    button.classList.add('active');

    productStates[productId].unit = button.textContent;

    const quantity = productStates[productId].quantity;
    if (quantity > 0) {
        updateProductPrice(productCard, product, quantity);
    }
}

function updateProductPrice(productCard, product, quantity) {
    const priceElement = productCard.querySelector('.price');
    const totalPrice = product.price * quantity;
    priceElement.textContent = formatPrice(totalPrice);

    productStates[product.id].price = totalPrice;
}

export function formatPrice(price) {
    return price.toLocaleString('ru-RU') + ' руб.';
}

export function getUnitDeclension(quantity, unit) {
    if (unit === 'Тонны') {
        if (quantity === 1) return 'тонна';
        if (quantity >= 2 && quantity <= 4) return 'тонны';
        return 'тонн';
    } else if (unit === 'Метры') {
        if (quantity === 1) return 'метр';
        if (quantity >= 2 && quantity <= 4) return 'метра';
        return 'метров';
    }
    return unit;
}

export function getAvailabilityUnit(unit) {
    if (unit === 'Тонны') return 'тонн';
    if (unit === 'Метры') return 'метров';
    return unit;
}

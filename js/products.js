class ProductManager {
    constructor() {
        this.products = [];
        this.productStates = {};
        this.productModalStates = {};
        this.currentModalChanges = {};
        this.openingFromCart = false;
    }

    async loadProducts() {
        try {
            const response = await fetch('data/products.json');
            const data = await response.json();
            this.products = data.products;
            this.initializeProductStates();
            this.renderProducts();
        } catch (error) {
            console.error('Error loading products:', error);
            this.products = this.getDefaultProducts();
            this.initializeProductStates();
            this.renderProducts();
        }
    }

    getDefaultProducts() {
        return [
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
    }

    initializeProductStates() {
        this.products.forEach(product => {
            this.productStates[product.id] = {
                quantity: 1,
                unit: 'Тонны',
                price: product.price
            };

            this.productModalStates[product.id] = {
                warehouse: product.warehouse,
                diameter: product.diameter,
                thickness: product.thickness,
                steel: product.steel,
                unit: 'Тонны',
                quantity: 1
            };
        });
    }

    renderProducts() {
        const productsGrid = document.getElementById('products-grid');
        productsGrid.innerHTML = '';

        this.products.forEach(product => {
            const productCard = this.createProductCard(product);
            productsGrid.appendChild(productCard);
        });

        this.attachProductEventListeners();
    }

    createProductCard(product) {
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
                                <button class="unit-button active">Тонны</button>
                                <button class="unit-button">Метры</button>
                            </div>
                            <div class="quantity-controls">
                                <button class="quantity-minus">-</button>
                                <input type="text" class="quantity-value" value="1">
                                <button class="quantity-plus">+</button>
                            </div>
                        </div>
                        <div class="price-section">
                            <div class="price">${this.formatPrice(product.price)}</div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        return productCard;
    }

    attachProductEventListeners() {
        document.querySelectorAll('.product-card').forEach(card => {
            card.addEventListener('click', (e) => {
                if (e.target.closest('.units-toggle') ||
                    e.target.closest('.quantity-controls') ||
                    e.target.closest('.price-section')) {
                    return;
                }
                const productId = parseInt(card.getAttribute('data-product'));
                this.openingFromCart = false;
                this.openProductModal(productId);
            });
        });

        document.querySelectorAll('.quantity-plus').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleQuantityChange(e.target, 1);
            });
        });

        document.querySelectorAll('.quantity-minus').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleQuantityChange(e.target, -1);
            });
        });

        document.querySelectorAll('.quantity-value').forEach(input => {
            input.addEventListener('input', (e) => {
                this.handleQuantityInput(e.target);
            });

            input.addEventListener('blur', (e) => {
                this.handleQuantityBlur(e.target);
            });
        });

        document.querySelectorAll('.unit-button').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleUnitChange(e.target);
            });
        });
    }

    handleQuantityChange(button, change) {
        const productCard = button.closest('.product-card');
        const productId = parseInt(productCard.getAttribute('data-product'));
        const quantityInput = button.parentElement.querySelector('.quantity-value');
        const product = this.products.find(p => p.id === productId);

        let value = parseInt(quantityInput.value) || 1;
        value += change;
        if (value < 1) value = 1;
        quantityInput.value = value;

        this.productStates[productId].quantity = value;
        this.productStates[productId].unit = productCard.querySelector('.unit-button.active').textContent;

        this.updateProductPrice(productCard, product, value);
    }

    handleQuantityInput(input) {
        const productCard = input.closest('.product-card');
        const productId = parseInt(productCard.getAttribute('data-product'));
        const product = this.products.find(p => p.id === productId);

        let value = parseInt(input.value) || 1;
        if (value < 1) value = 1;

        this.productStates[productId].quantity = value;
        this.productStates[productId].unit = productCard.querySelector('.unit-button.active').textContent;

        this.updateProductPrice(productCard, product, value);
    }

    handleQuantityBlur(input) {
        let value = parseInt(input.value) || 1;
        if (value < 1) {
            value = 1;
            input.value = value;
        }
    }

    handleUnitChange(button) {
        const toggle = button.parentElement;
        const productCard = button.closest('.product-card');
        const productId = parseInt(productCard.getAttribute('data-product'));
        const product = this.products.find(p => p.id === productId);

        toggle.querySelectorAll('.unit-button').forEach(btn => {
            btn.classList.remove('active');
        });
        button.classList.add('active');

        this.productStates[productId].unit = button.textContent;

        const quantity = this.productStates[productId].quantity;
        if (quantity > 0) {
            this.updateProductPrice(productCard, product, quantity);
        }
    }

    updateProductPrice(productCard, product, quantity) {
        const priceElement = productCard.querySelector('.price');
        const totalPrice = product.price * quantity;
        priceElement.textContent = this.formatPrice(totalPrice);

        this.productStates[product.id].price = totalPrice;
    }

    formatPrice(price) {
        return price.toLocaleString('ru-RU') + ' руб.';
    }

    openProductModal(productId, cartItem = null) {
        // This method will be implemented in app.js
        window.app.openProductModal(productId, cartItem);
    }

    getProductById(id) {
        return this.products.find(product => product.id === id);
    }

    getProductState(id) {
        return this.productStates[id];
    }

    getProductModalState(id) {
        return this.productModalStates[id];
    }
}

class CartManager {
    constructor(productManager) {
        this.productManager = productManager;
        this.cart = [];
        this.currentProduct = null;
    }

    addToCart(productId, quantity, unit, warehouse, diameter, thickness, steel) {
        const product = this.productManager.getProductById(productId);
        if (!product) return;

        const itemId = `${productId}_${warehouse}_${diameter}_${thickness}_${steel}_${unit}`;

        const existingItemIndex = this.cart.findIndex(item =>
            item.id === productId &&
            item.warehouse === warehouse &&
            item.diameter === diameter &&
            item.thickness === thickness &&
            item.steel === steel &&
            item.unit === unit
        );

        if (existingItemIndex !== -1) {
            this.cart[existingItemIndex].quantity += quantity;
        } else {
            this.cart.push({
                id: productId,
                name: product.name,
                code: product.code,
                price: product.price,
                quantity: quantity,
                unit: unit,
                selected: false,
                warehouse: warehouse,
                diameter: diameter,
                thickness: thickness,
                steel: steel
            });
        }

        this.updateCartDisplay();
    }

    removeFromCart(index) {
        this.cart.splice(index, 1);
        this.updateCartDisplay();
    }

    updateCartDisplay() {
        const cartCount = document.querySelector('.cart-count');
        const cartItems = document.querySelector('.cart-items');
        const checkoutButton = document.querySelector('.checkout');

        cartCount.textContent = this.cart.length;

        cartItems.innerHTML = '';

        if (this.cart.length === 0) {
            const emptyCart = document.createElement('div');
            emptyCart.className = 'no-products';
            emptyCart.textContent = 'Корзина пуста';
            cartItems.appendChild(emptyCart);
            checkoutButton.disabled = true;
        } else {
            this.cart.forEach((item, index) => {
                const cartItem = this.createCartItem(item, index);
                cartItems.appendChild(cartItem);
            });

            this.attachCartEventListeners();
            this.updateCheckoutButton();
        }
    }

    createCartItem(item, index) {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        const totalItemPrice = item.price * item.quantity;
        const unitDeclension = this.getUnitDeclension(item.quantity, item.unit);

        cartItem.innerHTML = `
            <div class="cart-item-image">
                <input type="checkbox" class="cart-item-checkbox item-checkbox" data-index="${index}" ${item.selected ? 'checked' : ''}>
                <div class="image-placeholder">Фото</div>
            </div>
            <div class="cart-item-details">
                <div class="cart-item-price">${this.formatPrice(totalItemPrice)}</div>
                <div class="cart-item-code">${item.code}</div>
                <div class="cart-item-name" data-index="${index}">${item.name}</div>
                <div class="cart-item-controls">
                    <button class="buy-item" data-index="${index}">Купить</button>
                    <div class="cart-quantity-controls">
                        <span class="cart-quantity-unit">${item.unit === 'Тонны' ? 'тонны' : 'метры'}</span>
                        <button class="cart-quantity-minus" data-index="${index}">-</button>
                        <input type="text" class="cart-quantity-value" value="${item.quantity}" data-index="${index}">
                        <button class="cart-quantity-plus" data-index="${index}">+</button>
                    </div>
                </div>
            </div>
            <button class="delete-item" data-index="${index}">🗑️</button>
        `;

        return cartItem;
    }

    attachCartEventListeners() {
        document.querySelectorAll('.delete-item').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = button.getAttribute('data-index');
                this.removeFromCart(index);
            });
        });

        document.querySelectorAll('.cart-quantity-plus').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = button.getAttribute('data-index');
                this.cart[index].quantity += 1;
                this.updateCartDisplay();
            });
        });

        document.querySelectorAll('.cart-quantity-minus').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = button.getAttribute('data-index');
                if (this.cart[index].quantity > 1) {
                    this.cart[index].quantity -= 1;
                    this.updateCartDisplay();
                }
            });
        });

        document.querySelectorAll('.cart-quantity-value').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = input.getAttribute('data-index');
                let value = parseInt(input.value) || 1;
                if (value < 1) value = 1;
                this.cart[index].quantity = value;
                this.updateCartDisplay();
            });

            input.addEventListener('blur', (e) => {
                const index = input.getAttribute('data-index');
                let value = parseInt(input.value) || 1;
                if (value < 1) {
                    value = 1;
                    input.value = value;
                    this.cart[index].quantity = value;
                    this.updateCartDisplay();
                }
            });
        });

        document.querySelectorAll('.buy-item').forEach(button => {
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = button.getAttribute('data-index');
                window.app.openPaymentModal([this.cart[index]]);
            });
        });

        document.querySelectorAll('.item-checkbox').forEach(checkbox => {
            checkbox.addEventListener('click', (e) => {
                e.stopPropagation();
            });

            checkbox.addEventListener('change', (e) => {
                const index = checkbox.getAttribute('data-index');
                this.cart[index].selected = checkbox.checked;
                this.updateSelectAllCheckbox();
                this.updateCheckoutButton();
            });
        });

        document.querySelectorAll('.cart-item-name').forEach(name => {
            name.addEventListener('click', (e) => {
                const index = name.getAttribute('data-index');
                const productId = this.cart[index].id;
                window.app.productManager.openingFromCart = true;
                window.app.openProductModal(productId, this.cart[index]);
            });
        });

        document.querySelectorAll('.cart-item').forEach(item => {
            item.addEventListener('click', (e) => {
                if (!e.target.closest('.cart-item-checkbox') &&
                    !e.target.closest('.delete-item') &&
                    !e.target.closest('.buy-item') &&
                    !e.target.closest('.cart-quantity-controls')) {
                    const index = item.querySelector('.cart-item-checkbox').getAttribute('data-index');
                    const productId = this.cart[index].id;
                    window.app.productManager.openingFromCart = true;
                    window.app.openProductModal(productId, this.cart[index]);
                }
            });
        });
    }

    updateCheckoutButton() {
        const checkoutButton = document.querySelector('.checkout');
        const hasSelectedItems = this.cart.some(item => item.selected);
        checkoutButton.disabled = !hasSelectedItems;
    }

    updateSelectAllCheckbox() {
        const selectAllCheckbox = document.querySelector('.select-all-checkbox');
        const checkboxes = document.querySelectorAll('.item-checkbox');
        const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
        selectAllCheckbox.checked = allChecked;
    }

    getUnitDeclension(quantity, unit) {
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

    formatPrice(price) {
        return price.toLocaleString('ru-RU') + ' руб.';
    }

    getSelectedItems() {
        return this.cart.filter(item => item.selected);
    }

    clearSelectedItems() {
        this.cart = this.cart.filter(item => !item.selected);
        this.updateCartDisplay();
    }
}

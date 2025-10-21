import { products, productStates, formatPrice, getUnitDeclension } from './products.js';

export let cart = [];

export function initializeCart() {
    updateCartDisplay();
    setupCartEventListeners();
}

export function updateCartDisplay() {
    const cartCount = document.querySelector('.cart-count');
    const cartItems = document.querySelector('.cart-items');
    const checkoutButton = document.querySelector('.checkout');

    cartCount.textContent = cart.length;

    cartItems.innerHTML = '';

    if (cart.length === 0) {
        const emptyCart = document.createElement('div');
        emptyCart.className = 'no-products';
        emptyCart.textContent = 'Корзина пуста';
        cartItems.appendChild(emptyCart);
        checkoutButton.disabled = true;
    } else {
        cart.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            const totalItemPrice = item.price * item.quantity;
            const unitDeclension = getUnitDeclension(item.quantity, item.unit);

            cartItem.innerHTML = `
                <div class="cart-item-image">
                    <input type="checkbox" class="cart-item-checkbox item-checkbox" data-index="${index}" ${item.selected ? 'checked' : ''}>
                    <div class="image-placeholder">Фото</div>
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-price">${formatPrice(totalItemPrice)}</div>
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
            cartItems.appendChild(cartItem);
        });

        addCartEventListeners();
        updateCheckoutButton();
    }
}

function addCartEventListeners() {
    document.querySelectorAll('.delete-item').forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            const index = this.getAttribute('data-index');
            cart.splice(index, 1);
            updateCartDisplay();
        });
    });

    document.querySelectorAll('.cart-quantity-plus').forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            const index = this.getAttribute('data-index');
            cart[index].quantity += 1;
            updateCartDisplay();
        });
    });

    document.querySelectorAll('.cart-quantity-minus').forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            const index = this.getAttribute('data-index');
            if (cart[index].quantity > 1) {
                cart[index].quantity -= 1;
                updateCartDisplay();
            }
        });
    });

    document.querySelectorAll('.cart-quantity-value').forEach(input => {
        input.addEventListener('input', function (e) {
            const index = this.getAttribute('data-index');
            let value = parseInt(this.value) || 1;
            if (value < 1) value = 1;
            cart[index].quantity = value;
            updateCartDisplay();
        });

        input.addEventListener('blur', function (e) {
            const index = this.getAttribute('data-index');
            let value = parseInt(this.value) || 1;
            if (value < 1) {
                value = 1;
                this.value = value;
                cart[index].quantity = value;
                updateCartDisplay();
            }
        });
    });

    document.querySelectorAll('.buy-item').forEach(button => {
        button.addEventListener('click', function (e) {
            e.stopPropagation();
            const index = this.getAttribute('data-index');
            window.openPaymentModal([cart[index]]);
        });
    });

    document.querySelectorAll('.item-checkbox').forEach(checkbox => {
        checkbox.addEventListener('click', function (e) {
            e.stopPropagation();
        });

        checkbox.addEventListener('change', function () {
            const index = this.getAttribute('data-index');
            cart[index].selected = this.checked;
            updateSelectAllCheckbox();
            updateCheckoutButton();
        });
    });

    document.querySelectorAll('.cart-item-name').forEach(name => {
        name.addEventListener('click', function () {
            const index = this.getAttribute('data-index');
            const productId = cart[index].id;
            window.openProductModal(productId, true, cart[index]);
        });
    });

    document.querySelectorAll('.cart-item').forEach(item => {
        item.addEventListener('click', function (e) {
            if (!e.target.closest('.cart-item-checkbox') &&
                !e.target.closest('.delete-item') &&
                !e.target.closest('.buy-item') &&
                !e.target.closest('.cart-quantity-controls')) {
                const index = this.querySelector('.cart-item-checkbox').getAttribute('data-index');
                const productId = cart[index].id;
                window.openProductModal(productId, true, cart[index]);
            }
        });
    });
}

function updateSelectAllCheckbox() {
    const selectAllCheckbox = document.querySelector('.select-all-checkbox');
    const checkboxes = document.querySelectorAll('.item-checkbox');
    const allChecked = Array.from(checkboxes).every(checkbox => checkbox.checked);
    selectAllCheckbox.checked = allChecked;
}

function updateCheckoutButton() {
    const checkoutButton = document.querySelector('.checkout');
    const hasSelectedItems = cart.some(item => item.selected);
    checkoutButton.disabled = !hasSelectedItems;
}

export function addToCart(productId, quantity, unit, warehouse, diameter, thickness, steel) {
    const product = products.find(p => p.id == productId);
    if (!product) return;

    const existingItemIndex = cart.findIndex(item =>
        item.id === productId &&
        item.warehouse === warehouse &&
        item.diameter === diameter &&
        item.thickness === thickness &&
        item.steel === steel &&
        item.unit === unit
    );

    if (existingItemIndex !== -1) {
        cart[existingItemIndex].quantity += quantity;
    } else {
        cart.push({
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

    updateCartDisplay();
}

export function setupCartEventListeners() {
    const selectAllCheckbox = document.querySelector('.select-all-checkbox');
    const checkoutButton = document.querySelector('.checkout');

    selectAllCheckbox.addEventListener('change', function () {
        const checkboxes = document.querySelectorAll('.item-checkbox');
        checkboxes.forEach((checkbox, index) => {
            checkbox.checked = this.checked;
            cart[index].selected = this.checked;
        });
        updateCheckoutButton();
    });

    checkoutButton.addEventListener('click', function () {
        if (cart.length > 0) {
            const selectedItems = cart.filter(item => item.selected);
            if (selectedItems.length > 0) {
                window.openPaymentModal(selectedItems);
            }
        }
    });
}

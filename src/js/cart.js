import {
  getCartItems,
  getCartTotalAmount,
  getItemUnitPrice,
  saveCartItems,
  updateCartCount,
  updateCartItemQuantity,
} from './utils.mjs';

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function calculateCartTotal(cartItems) {
  const cartFooter = document.querySelector('.cart-footer');
  const totalAmountEl = document.querySelector('#cart-total-amount');

  if (!cartItems || cartItems.length === 0) {
    if (cartFooter) {
      cartFooter.classList.add('hide');
    }
    return;
  }

  const total = getCartTotalAmount(cartItems);

  if (totalAmountEl) {
    totalAmountEl.textContent = `$${total.toFixed(2)}`;
  }
  if (cartFooter) {
    cartFooter.classList.remove('hide');
  }
}

function cartItemTemplate(item, index) {
  const colorName =
    item.Colors && item.Colors[0] ? item.Colors[0].ColorName : '';
  const quantity = item.quantity || 1;
  const unitPrice = getItemUnitPrice(item);
  const lineTotal = (unitPrice * quantity).toFixed(2);
  const safeName = escapeHtml(item.Name);
  const unitPriceMarkup =
    quantity > 1
      ? `<span class="cart-card__unit-price">($${unitPrice.toFixed(2)} ea)</span>`
      : '';

  return `<li class="cart-card divider">
  <button type="button" class="cart-card__remove" data-index="${index}" data-id="${escapeHtml(item.Id)}" title="Remove item" aria-label="Remove ${safeName}">✕</button>
  <a href="#" class="cart-card__image">
    <img
      src="${escapeHtml(item.Image)}"
      alt="${safeName}"
    />
  </a>
  <a href="#">
    <h2 class="card__name">${safeName}</h2>
  </a>
  <p class="cart-card__color">${escapeHtml(colorName)}</p>
  <div class="cart-card__quantity">
    <button
      type="button"
      class="cart-card__qty-btn"
      data-action="decrease"
      data-index="${index}"
      title="Decrease quantity"
      aria-label="Decrease quantity of ${safeName}"
      ${quantity <= 1 ? 'disabled' : ''}
    >−</button>
    <input
      type="number"
      class="cart-card__qty-input"
      value="${quantity}"
      min="1"
      step="1"
      inputmode="numeric"
      data-index="${index}"
      aria-label="Quantity for ${safeName}"
    />
    <button
      type="button"
      class="cart-card__qty-btn"
      data-action="increase"
      data-index="${index}"
      title="Increase quantity"
      aria-label="Increase quantity of ${safeName}"
    >+</button>
  </div>
  <p class="cart-card__price">$${lineTotal}${unitPriceMarkup}</p>
</li>`;
}

function renderCartContents() {
  const cartItems = getCartItems();
  const productList = document.querySelector('.product-list');
  if (!productList) return;

  if (cartItems.length === 0) {
    productList.innerHTML =
      '<li class="cart-empty">Your cart is currently empty.</li>';
    calculateCartTotal([]);
    updateCartCount();
    return;
  }

  const htmlItems = cartItems.map((item, index) =>
    cartItemTemplate(item, index),
  );
  productList.innerHTML = htmlItems.join('');
  calculateCartTotal(cartItems);
  updateCartCount();
}

function removeItemFromCart(index) {
  const cartItems = getCartItems();
  cartItems.splice(index, 1);
  saveCartItems(cartItems);
  renderCartContents();
}

function changeItemQuantity(index, newQuantity, focusSelector = null) {
  const updatedCart = updateCartItemQuantity(
    getCartItems(),
    index,
    newQuantity,
  );
  saveCartItems(updatedCart);
  renderCartContents();

  if (focusSelector) {
    const nextControl = document.querySelector(focusSelector);
    if (nextControl && !nextControl.disabled) {
      nextControl.focus();
    }
  }
}

function initCartListeners() {
  const productList = document.querySelector('.product-list');
  if (!productList) return;

  productList.addEventListener('click', (e) => {
    const removeBtn = e.target.closest('.cart-card__remove');
    if (removeBtn) {
      const index = Number.parseInt(removeBtn.dataset.index, 10);
      removeItemFromCart(index);
      return;
    }

    const qtyBtn = e.target.closest('.cart-card__qty-btn');
    if (qtyBtn) {
      const index = Number.parseInt(qtyBtn.dataset.index, 10);
      const action = qtyBtn.dataset.action;
      const cartItems = getCartItems();
      const currentQty = cartItems[index]?.quantity || 1;
      const nextQty = action === 'increase' ? currentQty + 1 : currentQty - 1;
      changeItemQuantity(
        index,
        nextQty,
        `.cart-card__qty-btn[data-action="${action}"][data-index="${index}"]`,
      );
    }
  });

  productList.addEventListener('change', (e) => {
    const qtyInput = e.target.closest('.cart-card__qty-input');
    if (!qtyInput) return;
    const index = Number.parseInt(qtyInput.dataset.index, 10);
    changeItemQuantity(
      index,
      qtyInput.value,
      `.cart-card__qty-input[data-index="${index}"]`,
    );
  });
}

initCartListeners();
renderCartContents();

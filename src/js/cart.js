import { getLocalStorage, setLocalStorage, updateCartCount } from "./utils.mjs";

function calculateCartTotal(cartItems) {
  const cartFooter = document.querySelector(".cart-footer");
  const totalAmountEl = document.querySelector("#cart-total-amount");

  if (!cartItems || cartItems.length === 0) {
    if (cartFooter) {
      cartFooter.classList.add("hide");
    }
    return;
  }

  const total = cartItems.reduce(
    (sum, item) =>
      sum + (Number(item.FinalPrice) || Number(item.ListPrice) || 0),
    0,
  );

  if (totalAmountEl) {
    totalAmountEl.textContent = `$${total.toFixed(2)}`;
  }
  if (cartFooter) {
    cartFooter.classList.remove("hide");
  }
}

function renderCartContents() {
  const cartItems = getLocalStorage("so-cart") || [];
  const productList = document.querySelector(".product-list");

  if (!cartItems || cartItems.length === 0) {
    productList.innerHTML =
      '<li class="cart-empty">Your cart is currently empty.</li>';
    calculateCartTotal([]);
    updateCartCount();
    return;
  }

  const htmlItems = cartItems.map((item, index) =>
    cartItemTemplate(item, index),
  );
  productList.innerHTML = htmlItems.join("");
  calculateCartTotal(cartItems);
  updateCartCount();
  addRemoveItemListeners();
}

function cartItemTemplate(item, index) {
  const colorName =
    item.Colors && item.Colors[0] ? item.Colors[0].ColorName : "";

  return `<li class="cart-card divider">
  <button class="cart-card__remove" data-index="${index}" data-id="${item.Id}" title="Remove item" aria-label="Remove ${item.Name}">✕</button>
  <a href="#" class="cart-card__image">
    <img
      src="${item.Image}"
      alt="${item.Name}"
    />
  </a>
  <a href="#">
    <h2 class="card__name">${item.Name}</h2>
  </a>
  <p class="cart-card__color">${colorName}</p>
  <p class="cart-card__quantity">qty: 1</p>
  <p class="cart-card__price">$${item.FinalPrice}</p>
</li>`;
}

function removeItemFromCart(index) {
  const cartItems = getLocalStorage("so-cart") || [];
  cartItems.splice(index, 1);
  setLocalStorage("so-cart", cartItems);
  renderCartContents();
}

function addRemoveItemListeners() {
  const removeButtons = document.querySelectorAll(".cart-card__remove");
  removeButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const index = parseInt(e.currentTarget.dataset.index, 10);
      removeItemFromCart(index);
    });
  });
}

renderCartContents();

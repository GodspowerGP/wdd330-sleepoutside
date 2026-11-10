// wrapper for querySelector...returns matching element
export function qs(selector, parent = document) {
  return parent.querySelector(selector);
}
// or a more concise version if you are into that sort of thing:
// export const qs = (selector, parent = document) => parent.querySelector(selector);

// retrieve data from localstorage
export function getLocalStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key));
  } catch {
    return null;
  }
}
// save data to local storage
export function setLocalStorage(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}
// set a listener for both touchend and click
export function setClick(selector, callback) {
  qs(selector).addEventListener('touchend', (event) => {
    event.preventDefault();
    callback();
  });
  qs(selector).addEventListener('click', callback);
}

function parsePositiveInt(value, fallback = 1) {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) && parsed >= 1 ? parsed : fallback;
}

export function normalizeCartItems(rawCart) {
  const rawList = Array.isArray(rawCart) ? rawCart : rawCart ? [rawCart] : [];
  const mergedById = new Map();
  const normalized = [];

  for (const item of rawList) {
    if (!item || typeof item !== 'object') continue;
    const qty = parsePositiveInt(item.quantity, 1);

    if (item.Id && mergedById.has(item.Id)) {
      const existing = mergedById.get(item.Id);
      existing.quantity += qty;
    } else {
      const entry = { ...item, quantity: qty };
      if (item.Id) {
        mergedById.set(item.Id, entry);
      }
      normalized.push(entry);
    }
  }

  return normalized;
}

export function addItemToCartList(cartItems, product) {
  const items = normalizeCartItems(cartItems);
  if (!product || typeof product !== 'object') return items;

  const existing = items.find((item) => item.Id === product.Id);
  if (existing) {
    existing.quantity += 1;
  } else {
    items.push({ ...product, quantity: 1 });
  }
  return items;
}

export function updateCartItemQuantity(cartItems, index, newQuantity) {
  const items = normalizeCartItems(cartItems);
  if (!Number.isInteger(index) || index < 0 || index >= items.length) {
    return items;
  }
  items[index] = {
    ...items[index],
    quantity: parsePositiveInt(newQuantity, 1),
  };
  return items;
}

export function getCartItemCount(cartItems) {
  return normalizeCartItems(cartItems).reduce(
    (sum, item) => sum + item.quantity,
    0,
  );
}

export function getItemUnitPrice(item) {
  return Number(item?.FinalPrice) || Number(item?.ListPrice) || 0;
}

export function getCartTotalAmount(cartItems) {
  return normalizeCartItems(cartItems).reduce(
    (sum, item) => sum + getItemUnitPrice(item) * item.quantity,
    0,
  );
}

export function getCartItems(key = 'so-cart') {
  return normalizeCartItems(getLocalStorage(key));
}

export function saveCartItems(cartItems, key = 'so-cart') {
  const normalized = normalizeCartItems(cartItems);
  setLocalStorage(key, normalized);
  updateCartCount();
  return normalized;
}

export function updateCartCount() {
  const count = getCartItemCount(getLocalStorage('so-cart'));

  const cartLink = document.querySelector('.cart a');
  if (!cartLink) return;

  let badge = cartLink.querySelector('.cart-count');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'cart-count';
    cartLink.appendChild(badge);
  }

  if (count > 0) {
    badge.textContent = count;
    badge.classList.remove('hide');
  } else {
    badge.classList.add('hide');
  }
}

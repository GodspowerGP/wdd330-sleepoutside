import test from 'node:test';
import assert from 'node:assert/strict';
import {
  addItemToCartList,
  getCartItemCount,
  getCartTotalAmount,
  normalizeCartItems,
  updateCartItemQuantity,
} from '../js/utils.mjs';

const marmotTent = {
  Id: '880RR',
  Name: 'Marmot Ajax Tent - 3-Person, 3-Season',
  FinalPrice: 199.99,
};

const rimrockTent = {
  Id: '344YJ',
  Name: 'Cedar Ridge Rimrock Tent - 2-Person, 3-Season',
  FinalPrice: 69.99,
};

test('normalizeCartItems consolidates legacy duplicate entries and defaults quantity to 1', () => {
  const legacyCart = [marmotTent, marmotTent, { ...rimrockTent, quantity: 2 }];
  const normalized = normalizeCartItems(legacyCart);

  assert.equal(normalized.length, 2);
  assert.equal(normalized[0].Id, '880RR');
  assert.equal(normalized[0].quantity, 2);
  assert.equal(normalized[1].Id, '344YJ');
  assert.equal(normalized[1].quantity, 2);
});

test('normalizeCartItems handles null, undefined, and single object values safely', () => {
  assert.deepEqual(normalizeCartItems(null), []);
  assert.deepEqual(normalizeCartItems(undefined), []);

  const single = normalizeCartItems(marmotTent);
  assert.equal(single.length, 1);
  assert.equal(single[0].quantity, 1);
});

test('addItemToCartList increments quantity instead of duplicating identical products', () => {
  let cart = addItemToCartList([], marmotTent);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 1);

  cart = addItemToCartList(cart, marmotTent);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 2);

  cart = addItemToCartList(cart, rimrockTent);
  assert.equal(cart.length, 2);
  assert.equal(cart[1].quantity, 1);
  assert.equal(getCartItemCount(cart), 3);
});

test('updateCartItemQuantity updates quantity and clamps invalid or non-positive values to 1', () => {
  let cart = addItemToCartList([], marmotTent);
  cart = updateCartItemQuantity(cart, 0, 4);
  assert.equal(cart[0].quantity, 4);

  cart = updateCartItemQuantity(cart, 0, 0);
  assert.equal(cart[0].quantity, 1);

  cart = updateCartItemQuantity(cart, 0, 'not-a-number');
  assert.equal(cart[0].quantity, 1);

  cart = updateCartItemQuantity(cart, 99, 5);
  assert.equal(cart.length, 1);
  assert.equal(cart[0].quantity, 1);
});

test('getCartTotalAmount multiplies unit prices by item quantities', () => {
  let cart = addItemToCartList([], marmotTent);
  cart = addItemToCartList(cart, marmotTent);
  cart = addItemToCartList(cart, rimrockTent);

  const total = getCartTotalAmount(cart);
  assert.ok(Math.abs(total - (199.99 * 2 + 69.99)) < 1e-6);
  assert.equal(getCartItemCount(cart), 3);
});

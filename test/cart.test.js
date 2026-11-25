import { test } from "node:test";
import assert from "node:assert/strict";
import { addItem, increment, total, itemCount } from "../lib/cart.js";

test("adds a product to an empty cart", () => {
  const cart = addItem([], "karak");
  assert.deepEqual(cart, [{ id: "karak", qty: 1 }]);
});

test("totals different products", () => {
  const cart = addItem(addItem([], "karak"), "kunafa");
  assert.equal(total(cart), 16);
  assert.equal(itemCount(cart), 2);
});

test("rejects unknown products", () => {
  assert.throws(() => addItem([], "pizza"), /unknown product/);
});

test("rejects bad quantities", () => {
  assert.throws(() => addItem([], "karak", 0), /positive integer/);
});

test("adding the same product twice counts it twice", () => {
  const cart = increment(increment([], "karak"), "karak");
  assert.deepEqual(cart, [{ id: "karak", qty: 2 }]);
  assert.equal(total(cart), 8);
});

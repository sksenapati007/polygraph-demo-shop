// Pricing and cart logic. Kept free of I/O so it is easy to unit test.
export const PRODUCTS = [
  { id: "karak", name: "Karak chai", price: 4 },
  { id: "samosa", name: "Samosa", price: 3 },
  { id: "kunafa", name: "Kunafa", price: 12 },
];

export function findProduct(id) {
  return PRODUCTS.find((p) => p.id === id);
}

export function addItem(cart, id, qty = 1) {
  if (!findProduct(id)) throw new Error(`unknown product: ${id}`);
  if (!Number.isInteger(qty) || qty < 1) throw new Error("qty must be a positive integer");
  const line = cart.find((l) => l.id === id);
  if (line) line.qty = qty;
  else cart.push({ id, qty });
  return cart;
}

export function itemCount(cart) {
  return cart.reduce((n, l) => n + l.qty, 0);
}

export function total(cart) {
  return cart.reduce((sum, l) => sum + findProduct(l.id).price * l.qty, 0);
}

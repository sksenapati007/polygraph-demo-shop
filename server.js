import http from "node:http";
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { PRODUCTS, addItem, total, itemCount } from "./lib/cart.js";

const PORT = Number(process.env.PORT ?? 3000);
const page = () => readFileSync(new URL("./public/index.html", import.meta.url));
const carts = new Map(); // session id -> cart

function session(req, res) {
  const m = /sid=([\w-]+)/.exec(req.headers.cookie ?? "");
  let sid = m?.[1];
  if (!sid || !carts.has(sid)) {
    sid = randomUUID();
    carts.set(sid, []);
    res.setHeader("Set-Cookie", `sid=${sid}; Path=/; HttpOnly; SameSite=Lax`);
  }
  return carts.get(sid);
}

function json(res, code, body) {
  res.writeHead(code, { "Content-Type": "application/json" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve) => {
    let data = "";
    req.on("data", (c) => (data += c));
    req.on("end", () => {
      try { resolve(JSON.parse(data || "{}")); } catch { resolve({}); }
    });
  });
}

const view = (cart) => ({ items: cart, count: itemCount(cart), total: total(cart) });

http
  .createServer(async (req, res) => {
    const url = new URL(req.url, "http://x");
    if (req.method === "GET" && url.pathname === "/") {
      res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
      return res.end(page());
    }
    if (req.method === "GET" && url.pathname === "/health") return json(res, 200, { ok: true });
    if (req.method === "GET" && url.pathname === "/api/products") return json(res, 200, PRODUCTS);

    const cart = session(req, res);
    if (req.method === "GET" && url.pathname === "/api/cart") return json(res, 200, view(cart));
    if (req.method === "POST" && url.pathname === "/api/cart/add") {
      const { id } = await readBody(req);
      try {
        addItem(cart, id);
        return json(res, 200, view(cart));
      } catch (e) {
        return json(res, 400, { error: e.message });
      }
    }
    if (req.method === "POST" && url.pathname === "/api/checkout") {
      if (!cart.length) return json(res, 400, { error: "cart is empty" });
      const order = { order: `ORD-${Date.now().toString(36).toUpperCase()}`, ...view(cart) };
      cart.length = 0;
      return json(res, 200, order);
    }
    json(res, 404, { error: "not found" });
  })
  .listen(PORT, () => console.log(`shop listening on :${PORT}`));

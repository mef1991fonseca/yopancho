import { useState, useEffect, useRef, useCallback } from "react";
import {
  ShoppingBag, Plus, Minus, X, ChevronRight, Flame, MapPin, Phone,
  Clock, Check, Trash2, Pencil, LogOut, Lock, Save, PlusCircle,
  Search, ArrowLeft, Utensils, Send, RefreshCw, Package
} from "lucide-react";
import { storage, getStorageInitError } from "./storage";

/* ------------------------------------------------------------------ */
/*  DEFAULT CATALOG — seeded once into shared storage on first load    */
/* ------------------------------------------------------------------ */

const SMASH_VARIANTS = [
  { label: "Simple", price: 10000 },
  { label: "Doble", price: 13000 },
  { label: "Triple", price: 16000 },
];

const DEFAULT_CATALOG = {
  settings: {
    storeName: "Yo Pancho",
    address: "Av. San Martín 2402",
    phoneDisplay: "387-412-5784",
    whatsapp: "5493874125784",
    accentNote: "Todo sale con papas",
  },
  categories: [
    {
      id: "sandwiches", name: "Sandwiches de la Casa", emoji: "🥖",
      items: [
        { id: "lomo-carne", name: "Lomo de carne", price: 14000 },
        { id: "lomo-cerdo", name: "Lomo de cerdo", price: 14000 },
        { id: "lomo-pollo", name: "Lomo de pollo", price: 14000 },
        { id: "lomo-yopancho", name: "Lomo Yo Pancho", price: 14000 },
        { id: "mila-carne", name: "Milanesa de carne", price: 14000 },
        { id: "mila-lili", name: "Milanesa Lili", desc: "Completa: jamón, queso, huevo, lechuga y tomate", price: 10000 },
        { id: "mila-pollo", name: "Milanesa de pollo", price: 14000 },
        { id: "mila-cerdo", name: "Milanesa de cerdo", price: 14000 },
        { id: "mila-napo", name: "Milanesa Napolitana", price: 14000 },
        { id: "bondiola", name: "Bondiola de cerdo", price: 14000 },
        { id: "matambre", name: "Matambre", price: 14500 },
        { id: "matambre-cerdo", name: "Matambre de cerdo", price: 14500 },
        { id: "mollejas", name: "Mollejas asadas", price: 14200 },
        { id: "paty", name: "Paty", price: 13000 },
        { id: "paty-muzza", name: "Paty de muzza", price: 14000 },
        { id: "paty-cheddar", name: "Patty de cheddar", price: 14000 },
      ],
    },
    {
      id: "mila-lili-especial", name: "Milanesa de Molida Lili", emoji: "🥪",
      items: [
        { id: "lili-simple", name: "Milanesa Lili", desc: "Completa con jamón, queso, huevo, lechuga y tomate", price: 10000 },
        { id: "lili-xl", name: "Milanesa Lili XL", price: 18000 },
        { id: "lili-medio-metro", name: "Milanesa Lili 1/2 metro", price: 21000 },
      ],
    },
    {
      id: "vacio", name: "Sandwich de Vacío", emoji: "🔥",
      items: [
        { id: "sandwich-vacio", name: "Sandwich de Vacío", desc: "Pan francés, vacío, chimichurri, lechuga, tomate y cebolla", price: 12000 },
      ],
    },
    {
      id: "pollo-asado-sandwich", name: "Sandwich de Pollo Asado", emoji: "🍗",
      items: [
        { id: "sandwich-pollo", name: "Sandwich de Pollo Asado", desc: "Lechuga, tomate y papas fritas", price: 10000 },
      ],
    },
    {
      id: "hamb-paty", name: "Hamburguesas Paty", emoji: "🍔",
      items: [
        { id: "hb-super", name: "Hamburguesa Super", price: 13000 },
        { id: "hb-super-doble", name: "Hamburguesa Super Doble", price: 16000 },
        { id: "hb-casera", name: "Hamburguesa Casera", price: 12500 },
        { id: "hb-casera-doble", name: "Hamburguesa Casera Doble", price: 15000 },
        { id: "hb-mega-cheddar", name: "Hamburguesa Mega Cheddar", price: 15000 },
        { id: "hb-monstruosa", name: "Hamburguesa Monstruosa", price: 16000 },
        { id: "hb-yopancho", name: "Hamburguesa Yo Pancho", price: 14000 },
        { id: "hb-big-pancho", name: "Hamburguesa Big Pancho", price: 16000 },
        { id: "hb-mega-pancho", name: "Hamburguesa Mega Pancho", price: 17000 },
      ],
    },
    {
      id: "smash", name: "Hamburguesas Smash", emoji: "🧀",
      items: [
        { id: "smash-yopancho", name: "Yo Pancho", desc: "Pan de papa, carne smash, cebolla caramelizada, cheddar, bacon", variants: SMASH_VARIANTS },
        { id: "smash-mega-pancho", name: "Mega Pancho", desc: "Pan de papa, carne smash, cebolla crispy, cheddar, bacon", variants: SMASH_VARIANTS },
        { id: "smash-big-pancho", name: "Big Pancho", desc: "Pan de papa, carne smash, pepinillos, lechuga, tomate, queso tybo", variants: SMASH_VARIANTS },
        { id: "smash-mega-cheddar", name: "Mega Cheddar", desc: "Pan de papa, carne smash, cheddar, bacon y baño de cheddar", variants: SMASH_VARIANTS },
        { id: "smash-cheese", name: "Cheese Burguer", desc: "Pan de papa, carne smash, cheddar y bacon", variants: SMASH_VARIANTS },
        { id: "smash-americana", name: "Americana", desc: "Pan de papa, carne smash, huevo frito, cheddar, bacon, cebolla crispy", variants: SMASH_VARIANTS },
        { id: "smash-super", name: "Súper Smash", desc: "Pan de papa, carne smash, huevo, jamón, queso, lechuga, tomate", variants: SMASH_VARIANTS },
      ],
    },
    {
      id: "veggie", name: "Vegetarianas / Veganas", emoji: "🥬",
      items: [
        { id: "not-burguer", name: "Not Burguer", price: 14500 },
        { id: "not-chicken", name: "Not Chicken", price: 14500 },
        { id: "paty-muzza-cheddar", name: "Paty de muzza o cheddar", price: 14000 },
        { id: "juliana", name: "Juliana", price: 10000 },
      ],
    },
    {
      id: "compartir", name: "Para Compartir", emoji: "🍽️",
      items: [
        { id: "chacarero-tostado", name: "Chacarero tostado", price: 24000 },
        { id: "chacarero-gratinado", name: "Chacarero gratinado", price: 25200 },
        { id: "chacarero-mexicano", name: "Chacarero Mexicano", price: 26000 },
        { id: "lomo-pizza", name: "Lomo pizza", price: 24000 },
        { id: "mila-pizza", name: "Mila pizza", price: 24000 },
        { id: "lomo-xl", name: "Lomo XL", price: 21000 },
        { id: "mila-xl", name: "Mila XL", price: 21000 },
        { id: "lomo-mila-medio-metro", name: "Lomo o Mila 1/2 metro", price: 26000 },
      ],
    },
    {
      id: "pizzas-clasicas", name: "Pizzas Clásicas", emoji: "🍕",
      items: [
        { id: "pz-muzzarella", name: "Muzzarella", price: 13500 },
        { id: "pz-especial", name: "Especial", price: 14500 },
        { id: "pz-napolitana", name: "Napolitana", price: 14000 },
        { id: "pz-fugazzetta", name: "Fugazzetta", price: 14000 },
        { id: "pz-anchoas", name: "Anchoas", price: 16000 },
        { id: "pz-provenzal", name: "Provenzal", price: 14000 },
        { id: "pz-calabreza", name: "Calabreza", price: 16000 },
        { id: "pz-roquefort", name: "Roquefort", price: 16000 },
        { id: "pz-margarita", name: "Margarita", price: 15000 },
        { id: "pz-napo-jamon", name: "Napo con jamón", price: 15000 },
        { id: "pz-especial-pollo", name: "Especial con pollo", price: 16000 },
        { id: "pz-imperial", name: "Imperial", price: 17000 },
        { id: "pz-4quesos", name: "4 Quesos", price: 18000 },
      ],
    },
    {
      id: "pizzas-especiales", name: "Pizzas Especiales", emoji: "⭐",
      items: [
        { id: "pz-argenta", name: "Argenta", desc: "Muzzarella con papas fritas y huevos fritos", price: 18000 },
        { id: "pz-super-argenta", name: "Súper Argenta", desc: "Muzzarella, papas fritas, huevos fritos y lluvia de milanesas", price: 20000 },
        { id: "pz-dog-pay", name: "Dog Pay", desc: "Muzzarella con salchichas y papas pay", price: 16000 },
        { id: "pz-yo-pancho", name: "Yo Pancho", desc: "Muzzarella con cheddar, bacon y cebolla caramelizada", price: 18000 },
        { id: "pz-anana", name: "Especial con Ananá", price: 16500 },
        { id: "pz-palmitos", name: "Especial con Palmitos", price: 16500 },
        { id: "pz-americana", name: "Americana", desc: "Muzzarella, papas fritas, huevos fritos y hamburguesas", price: 24000 },
        { id: "pz-super-americana", name: "Súper Americana", desc: "Muzzarella, cheddar, bacon, hamburguesas y huevos fritos", price: 26000 },
      ],
    },
    {
      id: "plato", name: "Comida al Plato", emoji: "🍖",
      items: [
        { id: "plato-mila-napo", name: "Milanesa napolitana", desc: "Carne, pollo o cerdo", price: 14000 },
        { id: "plato-mila-caballo", name: "Milanesa a caballo", desc: "Carne, pollo o cerdo", price: 14000 },
        { id: "plato-costeleta", name: "Costeleta a caballo", desc: "Carne o cerdo", price: 14000 },
        { id: "plato-2hamburguesas", name: "2 Hamburguesas caseras a caballo", desc: "Con papas fritas y huevo frito", price: 14000 },
        { id: "plato-bife-pollo", name: "Bife de pollo", desc: "Guarnición a elección", requiresGuarnicion: true, price: 12000 },
        { id: "plato-lomo-caballo", name: "Lomo a caballo", desc: "Con papas fritas y huevo frito", price: 14000 },
        { id: "plato-pollo-horno", name: "1/4 Pollo al horno", desc: "Guarnición a elección", requiresGuarnicion: true, price: 12000 },
        { id: "plato-pechito", name: "Pechito de cerdo", desc: "Guarnición a elección", requiresGuarnicion: true, price: 13500 },
        { id: "plato-asado-tira", name: "Asado de tira", desc: "Guarnición a elección", requiresGuarnicion: true, price: 14000 },
        { id: "plato-vacio", name: "Vacío", desc: "Guarnición a elección", requiresGuarnicion: true, price: 14500 },
      ],
    },
    {
      id: "papuchas", name: "Papuchas", emoji: "🍟",
      items: [
        { id: "papucha", name: "Papucha", price: 6000 },
        { id: "salchipapa", name: "Salchi-papa", price: 7000 },
        { id: "papa-cheddar-bacon", name: "Papa con cheddar y bacon", price: 7000 },
        { id: "papuqueso", name: "Papu-queso", price: 6500 },
        { id: "milapapa", name: "Mila-papa", price: 7000 },
      ],
    },
    {
      id: "panchos", name: "Panchos", emoji: "🌭",
      items: [
        { id: "pancho-super", name: "Super", price: 4000 },
        { id: "pancho-poncho", name: "Super con poncho", price: 4500 },
        { id: "pancho-poncho-salteno", name: "Super con poncho salteño", price: 4500 },
        { id: "pancho-cheddar-bacon", name: "Super con cheddar y bacon", price: 4500 },
        { id: "pancho-caballo", name: "Super a caballo", price: 4700 },
      ],
    },
    {
      id: "pizzetas", name: "Pizzetas", emoji: "🧆",
      items: [
        { id: "pizzeta-muzza", name: "Muzza", price: 5500 },
        { id: "pizzeta-especial", name: "Especial", price: 6000 },
      ],
    },
    {
      id: "bebidas", name: "Bebidas", emoji: "🥤",
      items: [
        { id: "coca-15", name: "Coca-Cola retornable 1.5L", price: 6000 },
        { id: "coca-1", name: "Coca-Cola retornable 1L", price: 5000 },
        { id: "talca-500", name: "Talca 500ml", price: 2000 },
        { id: "coca-linea-500", name: "Línea Coca 500ml", price: 3000 },
        { id: "marinaro-15", name: "Línea Marinaro 1.5L", price: 3000 },
        { id: "jugo-baggio", name: "Jugo Fresh Baggio 1.5L", price: 3500 },
      ],
    },
    {
      id: "extras", name: "Extras", emoji: "➕",
      items: [
        { id: "extra-cheddar-bacon", name: "Cheddar y bacon", price: 1500 },
        { id: "extra-porcion-mila", name: "Porción de mila", price: 4000 },
        { id: "extra-porcion-lomo", name: "Porción de lomo", price: 4000 },
        { id: "extra-hamburguesa", name: "1 hamburguesa extra", price: 4000 },
      ],
    },
  ],
  // Guarnición a elección para "Comida al Plato" — un solo lado por plato
  // (distinto de los grupos de personalización de abajo, que son opcionales).
  platoGuarniciones: ["Papas fritas", "Puré", "Arroz", "Papa y huevo"],
  // Grupos de personalización reutilizables: cada producto elige (desde el
  // panel admin) cuáles de estos grupos se le ofrecen al cliente. Reemplaza
  // la vieja lista única de "aderezos" por algo más parecido a un armado de
  // hamburguesería real (verduras a elección, salsas, toppings, etc.).
  modifierGroups: [
    { id: "verduras", emoji: "🥬", name: "Verduras", options: ["Tomate", "Lechuga", "Cebolla", "Pepinillos"] },
    { id: "aderezos", emoji: "🍯", name: "Aderezos", options: [
      "Mayonesa", "Mostaza", "Ketchup", "Salsa Golf", "Barbacoa", "Ajo", "Ají", "Morrón",
      "Queso Parmesano", "Queso Roquefort", "Panceta", "Salame", "Palta", "Cheddar",
    ] },
    { id: "salsas-especiales", emoji: "🌶️", name: "Salsas especiales", options: [
      "Salsa Cheddar", "Champiñón", "Brava", "Big Mac", "Monster", "Doritos",
      "Choclo", "Verduras Salteadas", "Guacamole", "Tocineta", "Aceitunas (salsa)", "Chimichurri", "Vitel Toné",
    ] },
    { id: "toppings", emoji: "🍅", name: "Toppings", options: [
      "Choclo en Grano", "Aceituna en Rodajas", "Papas Pay", "Morrón",
      "Cebolla Morada", "Aros de Cebolla Blanca", "Criolla", "Pickles",
    ] },
    { id: "guarniciones-sandwich", emoji: "🍟", name: "Guarniciones", options: [
      "Aceituna rodaja", "Choclo grano", "Criolla", "Cebolla en escabeche", "Ají en vinagre", "Berenjena en escabeche",
    ] },
  ],
};

// Qué grupos de personalización se ofrecen por defecto según la categoría del
// producto (el admin puede después activar/desactivar grupos por producto).
const CATEGORY_DEFAULT_MODIFIER_GROUPS = {
  "sandwiches": ["verduras", "aderezos", "guarniciones-sandwich"],
  "mila-lili-especial": ["verduras", "aderezos", "guarniciones-sandwich"],
  "vacio": ["verduras", "aderezos", "guarniciones-sandwich"],
  "pollo-asado-sandwich": ["verduras", "aderezos", "guarniciones-sandwich"],
  "hamb-paty": ["verduras", "aderezos", "toppings"],
  "smash": ["verduras", "aderezos", "salsas-especiales", "toppings"],
  "veggie": ["verduras", "aderezos", "toppings"],
  "compartir": ["verduras", "aderezos", "guarniciones-sandwich"],
  "papuchas": ["aderezos"],
  "panchos": ["aderezos"],
  "pizzetas": ["aderezos"],
};

// Bump this whenever CATEGORY_DEFAULT_MODIFIER_GROUPS changes, so catalogs
// already saved (by the local, in storage) pick up the new defaults for
// items nobody has customized yet — see migrateCatalog() below.
const MODIFIER_DEFAULTS_VERSION = 2;

DEFAULT_CATALOG.categories = DEFAULT_CATALOG.categories.map((c) => ({
  ...c,
  items: c.items.map((it) => ({
    ...it,
    modifierGroupIds: it.modifierGroupIds || CATEGORY_DEFAULT_MODIFIER_GROUPS[c.id] || [],
  })),
}));

const ORDER_STATUSES = [
  { id: "nuevo", label: "Nuevo", color: "#F2B705" },
  { id: "preparando", label: "Preparando", color: "#3B82F6" },
  { id: "listo", label: "Listo", color: "#22C55E" },
  { id: "entregado", label: "Entregado", color: "#6B7280" },
];

// Real product photos extracted from the menu flyers, keyed by item id.
// Items without a match here simply show no photo (see the chat notes on coverage).
const PRODUCT_IMAGES = {
  "juliana": "/product-images/juliana.jpg",
  "mila-lili": "/product-images/mila-lili.jpg",
  "not-burguer": "/product-images/not-burguer.jpg",
  "not-chicken": "/product-images/not-chicken.jpg",
  "paty-muzza-cheddar": "/product-images/paty-muzza-cheddar.jpg",
  "plato-2hamburguesas": "/product-images/plato-2hamburguesas.jpg",
  "plato-asado-tira": "/product-images/plato-asado-tira.jpg",
  "plato-mila-napo": "/product-images/plato-mila-napo.jpg",
  "plato-pollo-horno": "/product-images/plato-pollo-horno.jpg",
  "sandwich-pollo": "/product-images/sandwich-pollo.jpg",
  "sandwich-vacio": "/product-images/sandwich-vacio.jpg",
  "smash-americana": "/product-images/smash-americana.jpg",
  "smash-big-pancho": "/product-images/smash-big-pancho.jpg",
  "smash-cheese": "/product-images/smash-cheese.jpg",
  "smash-mega-cheddar": "/product-images/smash-mega-cheddar.jpg",
  "smash-mega-pancho": "/product-images/smash-mega-pancho.jpg",
  "smash-super": "/product-images/smash-super.jpg",
  "smash-yopancho": "/product-images/smash-yopancho.jpg",
};

const ADMIN_PIN = "1234";
const money = (n) => `$${Number(n || 0).toLocaleString("es-AR")}`;
const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

/* ------------------------------------------------------------------ */
/*  STORAGE HELPERS                                                    */
/* ------------------------------------------------------------------ */

// Brings a catalog saved by an older version of the app up to the current
// shape (e.g. adds `modifierGroups` / per-item `modifierGroupIds` the first
// time this runs against data saved before that feature existed), without
// touching prices, photos, or availability the local already set.
function migrateCatalog(raw) {
  let changed = false;
  const c = { ...raw };
  const fromVersion = c._modifierDefaultsVersion || 1;
  const needsRefresh = fromVersion < MODIFIER_DEFAULTS_VERSION;

  if (!c.modifierGroups) {
    c.modifierGroups = DEFAULT_CATALOG.modifierGroups;
    changed = true;
  }
  if (!c.platoGuarniciones) {
    c.platoGuarniciones = DEFAULT_CATALOG.platoGuarniciones;
    changed = true;
  }

  c.categories = (c.categories || []).map((cat) => ({
    ...cat,
    items: cat.items.map((it) => {
      const defaults = CATEGORY_DEFAULT_MODIFIER_GROUPS[cat.id] || [];
      if (!it.modifierGroupIds) {
        changed = true;
        return { ...it, modifierGroupIds: defaults };
      }
      // Only touch items nobody has customized yet (still at the empty/default
      // state) — never overwrite a product the admin deliberately edited.
      if (needsRefresh && it.modifierGroupIds.length === 0 && defaults.length > 0) {
        changed = true;
        return { ...it, modifierGroupIds: defaults };
      }
      return it;
    }),
  }));

  if (needsRefresh) {
    c._modifierDefaultsVersion = MODIFIER_DEFAULTS_VERSION;
    changed = true;
  }

  return { catalog: c, changed };
}

async function loadCatalog() {
  let raw = null;
  try {
    const res = await storage.get("menu-catalog");
    if (res && res.value) raw = JSON.parse(res.value);
  } catch (e) { /* not found yet */ }

  if (!raw) {
    await storage.set("menu-catalog", JSON.stringify(DEFAULT_CATALOG));
    return DEFAULT_CATALOG;
  }

  const { catalog: migrated, changed } = migrateCatalog(raw);
  if (changed) {
    await storage.set("menu-catalog", JSON.stringify(migrated));
  }
  return migrated;
}

async function saveCatalog(catalog) {
  await storage.set("menu-catalog", JSON.stringify(catalog));
}

async function loadOrders() {
  try {
    const res = await storage.get("orders-list");
    if (res && res.value) return JSON.parse(res.value);
  } catch (e) { /* not found yet */ }
  return [];
}

async function saveOrders(orders) {
  await storage.set("orders-list", JSON.stringify(orders));
}

// Sequential, per-day order numbers (resets every day) so numbers are
// predictable and never collide — instead of the old random 4-digit code.
async function getNextOrderNumber() {
  const today = new Date().toISOString().slice(0, 10);
  let counter = { date: today, seq: 0 };
  try {
    const res = await storage.get("order-counter");
    if (res && res.value) counter = JSON.parse(res.value);
  } catch (e) { /* not found yet, use default */ }
  if (counter.date !== today) counter = { date: today, seq: 0 };
  counter.seq += 1;
  await storage.set("order-counter", JSON.stringify(counter));
  return counter.seq;
}

/* ------------------------------------------------------------------ */
/*  APP                                                                 */
/* ------------------------------------------------------------------ */

export default function App() {
  const [view, setView] = useState("shop"); // shop | admin
  const [catalog, setCatalog] = useState(null);
  const [orders, setOrders] = useState([]);
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(null);

  useEffect(() => {
    const initErr = getStorageInitError();
    if (initErr) {
      setLoadError((initErr.message ? initErr.message : String(initErr)) + " — revisá VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY en tu .env");
      return;
    }
    (async () => {
      try {
        const [c, o] = await Promise.all([loadCatalog(), loadOrders()]);
        setCatalog(c);
        setOrders(o);
        setReady(true);
      } catch (e) {
        console.error("[YoPancho] Error al conectar con la base de datos:", e);
        setLoadError(e && e.message ? e.message : String(e));
      }
    })();
  }, []);

  // Keep the catalog in sync with what the admin sets (prices, active/inactive
  // items). Without this, a customer who already had the shop open would keep
  // seeing an item as available even after the local marks it "agotado hoy".
  useEffect(() => {
    if (!ready) return;
    const t = setInterval(async () => {
      const fresh = await loadCatalog();
      setCatalog(fresh);
    }, 10000);
    return () => clearInterval(t);
  }, [ready]);

  const refreshOrders = useCallback(async () => {
    const o = await loadOrders();
    setOrders(o);
  }, []);

  const pushOrder = useCallback(async (order) => {
    const current = await loadOrders();
    const next = [order, ...current];
    await saveOrders(next);
    setOrders(next);
  }, []);

  const updateOrder = useCallback(async (id, patch) => {
    setOrders((prev) => {
      const next = prev.map((o) => (o.id === id ? { ...o, ...patch } : o));
      saveOrders(next);
      return next;
    });
  }, []);

  const persistCatalog = useCallback(async (next) => {
    setCatalog(next);
    await saveCatalog(next);
  }, []);

  if (loadError) {
    return (
      <div style={{ background: "#191310" }} className="w-full h-full min-h-[600px] flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-2xl p-5" style={{ background: "#241C17", border: "1px solid #4A2020" }}>
          <div className="font-bold mb-2" style={{ color: "#EF6461" }}>No se pudo conectar con la base de datos</div>
          <div className="text-xs c-tan mb-3 font-mono-t break-words">{loadError}</div>
          <div className="text-xs c-muted leading-relaxed">
            Revisá, en este orden:
            <br />1. Que corriste el SQL de <code>supabase/schema.sql</code> en Supabase (SQL Editor → Run).
            <br />2. Que el archivo se llama exactamente <code>.env</code> (no <code>.env.example</code>) y tiene las dos claves bien pegadas, sin espacios.
            <br />3. Que reiniciaste <code>npm run dev</code> después de guardar el <code>.env</code>.
            <br />4. Que la Project URL empieza con <code>https://</code> y la clave es la "anon public", no la "service_role".
          </div>
        </div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div style={{ background: "#191310" }} className="w-full h-full min-h-[600px] flex items-center justify-center">
        <div className="c-gold font-semibold tracking-wide animate-pulse">Cargando Yo Pancho…</div>
      </div>
    );
  }

  return (
    <div style={{ background: "#191310", fontFamily: "'DM Sans', sans-serif" }} className="w-full min-h-[700px] c-cream">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=DM+Sans:wght@400;500;700;900&family=JetBrains+Mono:wght@400;600;700&display=swap');
        .font-display { font-family: 'Anton', sans-serif; letter-spacing: 0.02em; }
        .font-mono-t { font-family: 'JetBrains Mono', monospace; }
        .ticket-edge {
          background-image: radial-gradient(circle at 8px 0, transparent 8px, #FBF3E7 8.5px);
          background-size: 16px 16px;
          background-position: top;
          background-repeat: repeat-x;
        }
        .no-scrollbar::-webkit-scrollbar{display:none}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}

        /* Real CSS color utilities — this environment doesn't compile Tailwind
           arbitrary-value classes like text-[#hex], so colors live here instead. */
        .c-gold{color:#F2B705}
        .c-cream{color:#FBF3E7}
        .c-tan{color:#B8A98F}
        .c-tan2{color:#D8C9B4}
        .c-muted{color:#6B5D4F}
        .c-muted2{color:#7A6C58}
        .c-dark{color:#191310}
        .c-red{color:#EF6461}
        .c-red2{color:#C1443E}
        .c-brown{color:#4A3C2E}
        .bg-surface2{background:#2E241D}
        .bg-dark{background:#191310}
        .b-gold{border-color:#F2B705}
        .ph-muted::placeholder{color:#6B5D4F}
        .focus-gold:focus{outline:none;box-shadow:0 0 0 2px #F2B705}

        .chip{
          background:#2E241D;color:#D8C9B4;border:1px solid #3A2F26;
          transition:background .15s ease, color .15s ease;
        }
        .chip.active{background:#F2B705;color:#191310;border-color:#F2B705}
      `}</style>

      {view === "shop" ? (
        <ShopView catalog={catalog} onGoAdmin={() => setView("admin")} pushOrder={pushOrder} />
      ) : (
        <AdminView
          catalog={catalog}
          orders={orders}
          onSaveCatalog={persistCatalog}
          onUpdateOrder={updateOrder}
          onRefreshOrders={refreshOrders}
          onExit={() => setView("shop")}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SHOP VIEW (CUSTOMER)                                                */
/* ------------------------------------------------------------------ */

function ShopView({ catalog, onGoAdmin, pushOrder }) {
  const [activeCat, setActiveCat] = useState(catalog.categories[0].id);
  const [cart, setCart] = useState([]); // {lineId, catId, itemId, name, variantLabel, price, qty, note}
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [pickItem, setPickItem] = useState(null); // item chosen, awaiting variant/qty modal

  // If the admin marks the open item "agotado" while the customer has it open, close it.
  useEffect(() => {
    if (!pickItem) return;
    const fresh = catalog.categories.flatMap((c) => c.items).find((i) => i.id === pickItem.id);
    if (fresh && fresh.active === false) setPickItem(null);
  }, [catalog, pickItem]);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [query, setQuery] = useState("");
  const [myOrder, setMyOrder] = useState(null); // live-tracked order for this customer
  const [trackerOpen, setTrackerOpen] = useState(false);
  const [lookupOpen, setLookupOpen] = useState(false);
  const railRefs = useRef({});

  // Poll the shared orders list for this customer's own order, so they can
  // see it move from "Nuevo" to "Preparando" to "Listo" without asking the local.
  useEffect(() => {
    if (!myOrder) return;
    const poll = async () => {
      const all = await loadOrders();
      const found = all.find((o) => o.id === myOrder.id);
      if (found) setMyOrder(found);
    };
    const t = setInterval(poll, 5000);
    return () => clearInterval(t);
  }, [myOrder && myOrder.id]);

  const activeCategory = catalog.categories.find((c) => c.id === activeCat);

  const filteredItems = query.trim()
    ? catalog.categories.flatMap((c) => c.items.map((i) => ({ ...i, catName: c.name, catId: c.id })))
        .filter((i) => i.name.toLowerCase().includes(query.toLowerCase()))
    : null;

  const cartCount = cart.reduce((s, l) => s + l.qty, 0);
  const cartTotal = cart.reduce((s, l) => s + l.qty * l.price, 0);

  function addLine(item, variant, qty, note) {
    const line = {
      lineId: uid(),
      itemId: item.id,
      name: item.name,
      variantLabel: variant ? variant.label : null,
      price: variant ? variant.price : item.price,
      qty,
      note: note || "",
    };
    setCart((prev) => [...prev, line]);
    setPickItem(null);
  }

  function changeQty(lineId, delta) {
    setCart((prev) =>
      prev
        .map((l) => (l.lineId === lineId ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0)
    );
  }

  function removeLine(lineId) {
    setCart((prev) => prev.filter((l) => l.lineId !== lineId));
  }

  async function handleOrderSubmit(form) {
    const shortCode = await getNextOrderNumber();
    const order = {
      id: uid(),
      shortCode,
      items: cart.map(({ lineId, ...rest }) => rest),
      total: cartTotal,
      customerName: form.name,
      phone: form.phone,
      mode: form.mode,
      payment: form.payment,
      address: form.mode === "delivery" ? form.address : "",
      note: form.note,
      status: "nuevo",
      createdAt: new Date().toISOString(),
    };
    await pushOrder(order);

    const PAYMENT_LABELS = { efectivo: "Efectivo", transferencia: "Transferencia", tarjeta: "Tarjeta" };
    const lines = order.items
      .map((l) => `• ${l.qty}x ${l.name}${l.variantLabel ? ` (${l.variantLabel})` : ""}${l.note ? ` — ${l.note}` : ""} — ${money(l.price * l.qty)}`)
      .join("\n");
    const msg =
      `🧾 *Pedido #${order.shortCode} — Yo Pancho*\n\n` +
      `${lines}\n\n` +
      `*Total: ${money(order.total)}*\n\n` +
      `Cliente: ${order.customerName}\n` +
      `${order.mode === "delivery" ? `Entrega a domicilio: ${order.address}` : "Retira en el local"}\n` +
      `Pago: ${PAYMENT_LABELS[order.payment] || order.payment}\n` +
      (order.note ? `Nota: ${order.note}\n` : "") +
      (order.mode === "delivery" ? `\n📍 Te comparto mi ubicación actual en este chat para que el cadete llegue sin problemas.\n` : "");

    const wa = `https://wa.me/${catalog.settings.whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(wa, "_blank");

    setConfirmed(order);
    setMyOrder(order);
    setCart([]);
    setCheckoutOpen(false);
    setDrawerOpen(false);
  }

  return (
    <div className="pb-28">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 relative overflow-hidden" style={{ background: "linear-gradient(160deg,#241C17,#191310)" }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "#F2B705" }}>
              <Flame size={20} color="#191310" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display text-2xl leading-none c-cream">YO PANCHO</div>
              <div className="text-[11px] c-tan2 tracking-wide">Sandwiches · Burgers · Pizzas</div>
            </div>
          </div>
          <button
            onClick={onGoAdmin}
            className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-bold"
            style={{ background: "#2E241D", color: "#D8C9B4", border: "1px solid #4A3C2E" }}
          >
            <Lock size={13} /> Panel del local
          </button>
        </div>
        <div className="flex flex-wrap gap-3 mt-4 text-[11px] c-tan2">
          <span className="flex items-center gap-1"><MapPin size={12} className="c-gold" />{catalog.settings.address}</span>
          <span className="flex items-center gap-1"><Phone size={12} className="c-gold" />{catalog.settings.phoneDisplay}</span>
          <span className="flex items-center gap-1"><Clock size={12} className="c-gold" />{catalog.settings.accentNote}</span>
        </div>

        {/* Search */}
        <div className="mt-4 relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 c-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar en el menú…"
            className="w-full bg-surface2 rounded-full pl-9 pr-4 py-2.5 text-sm ph-muted outline-none focus-gold c-cream"
          />
        </div>
      </div>

      {/* Category rail */}
      {!query.trim() && (
        <div className="sticky top-0 z-20 no-scrollbar overflow-x-auto flex gap-2 px-5 py-3" style={{ background: "#191310", borderBottom: "1px solid #2E241D" }}>
          {catalog.categories.map((c) => (
            <button
              key={c.id}
              ref={(el) => (railRefs.current[c.id] = el)}
              onClick={() => setActiveCat(c.id)}
              className="shrink-0 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors"
              style={{
                background: activeCat === c.id ? "#F2B705" : "#2E241D",
                color: activeCat === c.id ? "#191310" : "#D8C9B4",
              }}
            >
              <span className="mr-1">{c.emoji}</span>{c.name}
            </button>
          ))}
        </div>
      )}

      {/* Items */}
      <div className="px-5 pt-4">
        {query.trim() ? (
          <>
            <div className="text-xs c-muted mb-2">{filteredItems.length} resultado(s) para "{query}"</div>
            <div className="grid grid-cols-1 gap-3">
              {filteredItems.map((item) => (
                <ItemCard key={item.id + item.catName} item={item} onPick={() => setPickItem(item)} />
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xl">{activeCategory.emoji}</span>
              <h2 className="font-display text-xl c-gold">{activeCategory.name}</h2>
            </div>
            <div className="grid grid-cols-1 gap-3">
              {activeCategory.items.map((item) => (
                <ItemCard key={item.id} item={{ ...item, catId: activeCategory.id }} onPick={() => setPickItem({ ...item, catId: activeCategory.id })} />
              ))}
            </div>

            {activeCategory.id === "sandwiches" && (
              <InfoStrip title="Personalizá tu pedido" list={["Elegí verduras, aderezos, salsas y guarniciones al agregar cada producto"]} />
            )}
          </>
        )}

        <button
          onClick={() => setLookupOpen(true)}
          className="w-full mt-6 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
          style={{ background: "#2E241D", color: "#D8C9B4" }}
        >
          <Search size={12} /> Ya hice un pedido, quiero ver su estado
        </button>

        <button
          onClick={onGoAdmin}
          className="w-full mt-2 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
          style={{ background: "transparent", border: "1px dashed #4A3C2E", color: "#B8A98F" }}
        >
          <Lock size={12} /> ¿Sos parte del local? Ingresá al panel administrador
        </button>
      </div>

      {/* Floating cart bar */}
      {cartCount > 0 && !drawerOpen && (
        <button
          onClick={() => setDrawerOpen(true)}
          className="fixed bottom-4 left-4 right-4 max-w-md mx-auto rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-2xl z-30"
          style={{ background: "#F2B705" }}
        >
          <div className="flex items-center gap-2 c-dark font-bold">
            <div className="w-6 h-6 rounded-full bg-dark c-gold text-xs flex items-center justify-center font-mono-t">{cartCount}</div>
            Ver pedido
          </div>
          <div className="font-mono-t font-bold c-dark">{money(cartTotal)}</div>
        </button>
      )}

      {/* Floating order-tracking bar — stacks above the cart bar if both are visible */}
      {myOrder && !trackerOpen && (
        <button
          onClick={() => setTrackerOpen(true)}
          className="fixed left-4 right-4 max-w-md mx-auto rounded-2xl px-5 py-3 flex items-center justify-between shadow-2xl z-30"
          style={{ bottom: cartCount > 0 ? "5.75rem" : "1rem", background: "#241C17", border: "1px solid #F2B705" }}
        >
          <div className="flex items-center gap-2 c-cream font-bold text-sm">
            <Package size={16} className="c-gold" />
            Pedido #{myOrder.shortCode}
          </div>
          <div className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: (ORDER_STATUSES.find((s) => s.id === myOrder.status) || ORDER_STATUSES[0]).color, color: "#191310" }}>
            {(ORDER_STATUSES.find((s) => s.id === myOrder.status) || ORDER_STATUSES[0]).label}
          </div>
        </button>
      )}

      {/* Item picker modal */}
      {pickItem && (
        <ItemModal item={pickItem} catalog={catalog} onClose={() => setPickItem(null)} onAdd={addLine} />
      )}

      {/* Cart drawer */}
      {drawerOpen && (
        <CartDrawer
          cart={cart}
          total={cartTotal}
          onClose={() => setDrawerOpen(false)}
          onChangeQty={changeQty}
          onRemove={removeLine}
          onCheckout={() => setCheckoutOpen(true)}
        />
      )}

      {/* Checkout modal */}
      {checkoutOpen && (
        <CheckoutModal
          total={cartTotal}
          onClose={() => setCheckoutOpen(false)}
          onSubmit={handleOrderSubmit}
        />
      )}

      {/* Confirmation */}
      {confirmed && (
        <ConfirmModal order={confirmed} onClose={() => setConfirmed(null)} onTrack={() => { setConfirmed(null); setTrackerOpen(true); }} />
      )}

      {/* Live order tracker */}
      {trackerOpen && myOrder && (
        <OrderTrackerModal order={myOrder} onClose={() => setTrackerOpen(false)} onStopTracking={() => { setTrackerOpen(false); setMyOrder(null); }} />
      )}

      {/* Look up an order by number */}
      {lookupOpen && (
        <OrderLookupModal
          onClose={() => setLookupOpen(false)}
          onFound={(order) => { setMyOrder(order); setLookupOpen(false); setTrackerOpen(true); }}
        />
      )}
    </div>
  );
}

function InfoStrip({ title, list }) {
  return (
    <div className="mt-5 mb-2 p-3.5 rounded-xl" style={{ background: "#2E241D", border: "1px dashed #4A3C2E" }}>
      <div className="text-[11px] font-bold c-gold mb-1">{title}</div>
      <div className="text-[11px] c-tan leading-relaxed">{list.join(" · ")}</div>
    </div>
  );
}

function ItemCard({ item, onPick }) {
  const hasVariants = !!item.variants;
  const displayPrice = hasVariants ? item.variants[0].price : item.price;
  const isActive = item.active !== false;
  const photo = item.image || PRODUCT_IMAGES[item.id];

  if (!isActive) {
    return (
      <div
        className="w-full text-left p-4 rounded-2xl flex items-start justify-between gap-3"
        style={{ background: "#1D1712", border: "1px solid #2E241D", opacity: 0.55 }}
      >
        {photo && (
          <img src={photo} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0 grayscale" />
        )}
        <div className="flex-1 min-w-0">
          <div className="font-bold c-tan text-[15px] line-through">{item.name}</div>
          {item.desc && <div className="text-[12px] c-muted mt-0.5 leading-snug">{item.desc}</div>}
          <div className="text-[11px] font-bold mt-2" style={{ color: "#D62828" }}>No disponible hoy</div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={onPick}
      className="w-full text-left p-4 rounded-2xl flex items-start gap-3 transition-transform active:scale-[0.98]"
      style={{ background: "#241C17", border: "1px solid #2E241D" }}
    >
      {photo && (
        <img src={photo} alt={item.name} className="w-16 h-16 rounded-xl object-cover shrink-0" />
      )}
      <div className="flex-1 min-w-0 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="font-bold c-cream text-[15px]">{item.name}</div>
          {item.desc && <div className="text-[12px] c-tan mt-0.5 leading-snug">{item.desc}</div>}
          <div className="font-mono-t c-gold font-bold mt-2 text-sm">
            {hasVariants ? `desde ${money(displayPrice)}` : money(displayPrice)}
          </div>
        </div>
        <div className="shrink-0 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "#F2B705" }}>
          <Plus size={18} color="#191310" strokeWidth={2.5} />
        </div>
      </div>
    </button>
  );
}

function ItemModal({ item, catalog, onClose, onAdd }) {
  const [variant, setVariant] = useState(item.variants ? item.variants[0] : null);
  const [qty, setQty] = useState(1);
  const [selectedByGroup, setSelectedByGroup] = useState({}); // { [groupId]: string[] }
  const [platoGuarnicion, setPlatoGuarnicion] = useState(null);
  const [extraNote, setExtraNote] = useState("");
  const price = variant ? variant.price : item.price;

  const activeGroups = (catalog.modifierGroups || []).filter((g) => (item.modifierGroupIds || []).includes(g.id));

  function toggleOption(groupId, option) {
    setSelectedByGroup((prev) => {
      const current = prev[groupId] || [];
      const next = current.includes(option) ? current.filter((x) => x !== option) : [...current, option];
      return { ...prev, [groupId]: next };
    });
  }

  const note = [
    ...activeGroups
      .map((g) => (selectedByGroup[g.id] && selectedByGroup[g.id].length ? `${g.name}: ${selectedByGroup[g.id].join(", ")}` : ""))
      .filter(Boolean),
    platoGuarnicion ? `Guarnición: ${platoGuarnicion}` : "",
    extraNote.trim(),
  ].filter(Boolean).join(" · ");

  const canAdd = !item.requiresGuarnicion || !!platoGuarnicion;
  const photo = item.image || PRODUCT_IMAGES[item.id];

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" style={{ background: "rgba(10,7,5,0.7)" }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[85vh] flex flex-col"
        style={{ background: "#241C17" }}
      >
        {photo && (
          <img src={photo} alt={item.name} className="w-full h-44 object-cover shrink-0" />
        )}
        <div className="p-5 overflow-y-auto">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-display text-xl c-cream pr-4">{item.name}</h3>
          <button onClick={onClose} className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#2E241D" }}>
            <X size={16} className="c-tan" />
          </button>
        </div>
        {item.desc && <p className="text-sm c-tan mb-4">{item.desc}</p>}

        {item.variants && (
          <div className="mb-4">
            <div className="text-xs font-bold c-gold mb-2">Tamaño</div>
            <div className="flex gap-2 flex-wrap">
              {item.variants.map((v) => (
                <button
                  key={v.label}
                  onClick={() => setVariant(v)}
                  className="px-3.5 py-2 rounded-xl text-xs font-bold"
                  style={{
                    background: variant.label === v.label ? "#F2B705" : "#2E241D",
                    color: variant.label === v.label ? "#191310" : "#D8C9B4",
                  }}
                >
                  {v.label} · {money(v.price)}
                </button>
              ))}
            </div>
          </div>
        )}

        {item.requiresGuarnicion && (
          <div className="mb-4">
            <div className="text-xs font-bold c-gold mb-2">Elegí tu guarnición (obligatorio)</div>
            <div className="flex gap-1.5 flex-wrap">
              {catalog.platoGuarniciones.map((g) => (
                <button
                  key={g}
                  onClick={() => setPlatoGuarnicion(g)}
                  className={`chip px-3 py-1.5 rounded-full text-[11px] font-bold ${platoGuarnicion === g ? "active" : ""}`}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        )}

        {activeGroups.map((group) => (
          <div className="mb-4" key={group.id}>
            <div className="text-xs font-bold c-gold mb-2">
              <span className="mr-1">{group.emoji}</span>{group.name} (opcional, elegí los que quieras)
            </div>
            <div className="flex gap-1.5 flex-wrap max-h-32 overflow-y-auto pr-1">
              {group.options.map((opt) => (
                <button
                  key={opt}
                  onClick={() => toggleOption(group.id, opt)}
                  className={`chip px-3 py-1.5 rounded-full text-[11px] font-bold ${(selectedByGroup[group.id] || []).includes(opt) ? "active" : ""}`}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        ))}

        <div className="mb-4">
          <div className="text-xs font-bold c-gold mb-2">Otra aclaración (opcional)</div>
          <input
            value={extraNote}
            onChange={(e) => setExtraNote(e.target.value)}
            placeholder="Ej: sin cebolla, bien cocido…"
            className="w-full bg-surface2 rounded-xl px-3.5 py-2.5 text-sm ph-muted outline-none focus-gold c-cream"
          />
        </div>

        <div className="flex items-center justify-between mb-5">
          <div className="text-xs font-bold c-gold">Cantidad</div>
          <div className="flex items-center gap-3 bg-surface2 rounded-full px-2 py-1.5">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-7 h-7 rounded-full flex items-center justify-center c-cream">
              <Minus size={14} />
            </button>
            <span className="font-mono-t font-bold w-5 text-center">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="w-7 h-7 rounded-full flex items-center justify-center c-cream">
              <Plus size={14} />
            </button>
          </div>
        </div>

        {item.requiresGuarnicion && !platoGuarnicion && (
          <p className="text-[11px] mb-2 text-center" style={{ color: "#D62828" }}>Elegí una guarnición para poder agregar este plato.</p>
        )}
        <button
          onClick={() => canAdd && onAdd(item, variant, qty, note)}
          disabled={!canAdd}
          className="w-full py-3.5 rounded-2xl font-display text-base flex items-center justify-center gap-2 disabled:opacity-40"
          style={{ background: "#F2B705", color: "#191310" }}
        >
          Agregar · {money(price * qty)}
        </button>
        </div>
      </div>
    </div>
  );
}

function CartDrawer({ cart, total, onClose, onChangeQty, onRemove, onCheckout }) {
  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" style={{ background: "rgba(10,7,5,0.7)" }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl max-h-[85vh] flex flex-col"
        style={{ background: "#FBF3E7", color: "#191310" }}
      >
        <div className="p-5 pb-3 flex items-center justify-between">
          <h3 className="font-display text-xl flex items-center gap-2"><ShoppingBag size={18} /> Tu pedido</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#EDE1CC" }}>
            <X size={16} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="px-5 pb-8 text-sm c-muted2">Todavía no agregaste nada.</div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 font-mono-t text-sm">
            {cart.map((l) => (
              <div key={l.lineId} className="py-3 flex items-start justify-between gap-2" style={{ borderBottom: "1px dashed #D8C9B4" }}>
                <div className="flex-1 min-w-0">
                  <div className="font-bold">{l.name}{l.variantLabel ? ` (${l.variantLabel})` : ""}</div>
                  {l.note && <div className="text-[11px] c-muted2">{l.note}</div>}
                  <div className="flex items-center gap-2 mt-1.5">
                    <button onClick={() => onChangeQty(l.lineId, -1)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#EDE1CC" }}>
                      <Minus size={12} />
                    </button>
                    <span className="w-4 text-center font-bold">{l.qty}</span>
                    <button onClick={() => onChangeQty(l.lineId, 1)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#EDE1CC" }}>
                      <Plus size={12} />
                    </button>
                    <button onClick={() => onRemove(l.lineId)} className="ml-2 c-red2">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div className="font-bold shrink-0">{money(l.price * l.qty)}</div>
              </div>
            ))}
          </div>
        )}

        <div className="p-5 pt-3 ticket-edge" style={{ borderTop: "2px dashed #D8C9B4" }}>
          <div className="flex justify-between items-center mb-4 font-mono-t">
            <span className="text-sm c-muted2">Total</span>
            <span className="text-xl font-bold">{money(total)}</span>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={onCheckout}
            className="w-full py-3.5 rounded-2xl font-display text-base disabled:opacity-40"
            style={{ background: "#191310", color: "#F2B705" }}
          >
            Continuar pedido
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckoutModal({ total, onClose, onSubmit }) {
  const [mode, setMode] = useState("pickup");
  const [payment, setPayment] = useState("efectivo");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);

  const canSubmit = name.trim() && phone.trim() && (mode === "pickup" || address.trim());

  async function submit() {
    if (!canSubmit || sending) return;
    setSending(true);
    await onSubmit({ mode, payment, name, phone, address, note });
    setSending(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(10,7,5,0.8)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto" style={{ background: "#241C17" }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display text-xl c-cream">Confirmar pedido</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#2E241D" }}>
            <X size={16} className="c-tan" />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode("pickup")}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: mode === "pickup" ? "#F2B705" : "#2E241D", color: mode === "pickup" ? "#191310" : "#D8C9B4" }}
          >
            Retiro en local
          </button>
          <button
            onClick={() => setMode("delivery")}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: mode === "delivery" ? "#F2B705" : "#2E241D", color: mode === "delivery" ? "#191310" : "#D8C9B4" }}
          >
            Delivery
          </button>
        </div>

        <div className="space-y-3 mb-5">
          <Field label="Tu nombre" value={name} onChange={setName} placeholder="Nombre y apellido" />
          <Field label="Teléfono" value={phone} onChange={setPhone} placeholder="Ej: 387 555 5555" />
          {mode === "delivery" && <Field label="Dirección de entrega" value={address} onChange={setAddress} placeholder="Calle, número, barrio" />}
          {mode === "delivery" && (
            <div className="p-3 rounded-xl text-xs flex items-start gap-2" style={{ background: "#2E241D", color: "#D8C9B4" }}>
              <span className="shrink-0">📍</span>
              <span>Si elegís Delivery, después de enviar el pedido compartinos tu ubicación actual por WhatsApp para que el cadete llegue sin problemas.</span>
            </div>
          )}

          <div>
            <div className="text-[11px] font-bold c-gold mb-1.5">Forma de pago</div>
            <div className="flex gap-2">
              {[
                { id: "efectivo", label: "💵 Efectivo" },
                { id: "transferencia", label: "🏦 Transferencia" },
                { id: "tarjeta", label: "💳 Tarjeta" },
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPayment(p.id)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold"
                  style={{ background: payment === p.id ? "#F2B705" : "#2E241D", color: payment === p.id ? "#191310" : "#D8C9B4" }}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <Field label="Nota para el pedido (opcional)" value={note} onChange={setNote} placeholder="Aclaraciones generales" />
        </div>

        <div className="flex justify-between items-center mb-4 font-mono-t">
          <span className="text-sm c-tan">Total a pagar</span>
          <span className="text-xl font-bold c-gold">{money(total)}</span>
        </div>

        <button
          disabled={!canSubmit || sending}
          onClick={submit}
          className="w-full py-3.5 rounded-2xl font-display text-base flex items-center justify-center gap-2 disabled:opacity-40"
          style={{ background: "#F2B705", color: "#191310" }}
        >
          <Send size={16} /> {sending ? "Enviando…" : "Enviar pedido por WhatsApp"}
        </button>
        <p className="text-[11px] c-muted text-center mt-3">Vas a confirmar el pedido por WhatsApp con el local.</p>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, placeholder }) {
  return (
    <div>
      <div className="text-[11px] font-bold c-gold mb-1.5">{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface2 rounded-xl px-3.5 py-2.5 text-sm ph-muted outline-none focus-gold c-cream"
      />
    </div>
  );
}

function ConfirmModal({ order, onClose, onTrack }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ background: "rgba(10,7,5,0.85)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-3xl p-6 text-center" style={{ background: "#FBF3E7", color: "#191310" }}>
        <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: "#22C55E" }}>
          <Check size={26} color="white" strokeWidth={3} />
        </div>
        <h3 className="font-display text-xl mb-1">¡Pedido enviado!</h3>
        <p className="text-sm c-muted2 mb-4">Pedido <span className="font-mono-t font-bold">#{order.shortCode}</span> confirmalo por WhatsApp para que el local lo empiece a preparar.</p>
        <button onClick={onTrack} className="w-full py-3 rounded-2xl font-display mb-2" style={{ background: "#191310", color: "#F2B705" }}>
          Seguir el estado de mi pedido
        </button>
        <button onClick={onClose} className="w-full py-2.5 text-sm c-muted2">
          Cerrar
        </button>
      </div>
    </div>
  );
}

function OrderTrackerModal({ order, onClose, onStopTracking }) {
  const currentIdx = ORDER_STATUSES.findIndex((s) => s.id === order.status);
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(10,7,5,0.8)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6" style={{ background: "#FBF3E7", color: "#191310" }}>
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-display text-xl">Pedido #{order.shortCode}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#EDE1CC" }}>
            <X size={16} />
          </button>
        </div>
        <p className="text-xs c-muted2 mb-6">Se actualiza solo cada pocos segundos.</p>

        <div className="mb-6">
          {ORDER_STATUSES.map((s, idx) => {
            const done = idx <= currentIdx;
            return (
              <div key={s.id} className="flex items-center gap-3 mb-1">
                <div className="flex flex-col items-center">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center shrink-0 font-mono-t text-xs font-bold"
                    style={{ background: done ? s.color : "#EDE1CC", color: done ? "#191310" : "#B8A98F" }}
                  >
                    {done ? <Check size={13} strokeWidth={3} /> : idx + 1}
                  </div>
                  {idx < ORDER_STATUSES.length - 1 && (
                    <div style={{ width: 2, height: 22, background: idx < currentIdx ? s.color : "#EDE1CC" }} />
                  )}
                </div>
                <span className="font-bold text-sm pb-5" style={{ color: done ? "#191310" : "#B8A98F" }}>{s.label}</span>
              </div>
            );
          })}
        </div>

        <div className="p-3.5 rounded-xl font-mono-t text-xs mb-4" style={{ background: "#EDE1CC" }}>
          <div className="flex justify-between font-bold mb-1"><span>Total</span><span>{money(order.total)}</span></div>
          <div className="c-muted2">{order.mode === "delivery" ? "Delivery" : "Retiro en el local"}</div>
        </div>

        <button onClick={onStopTracking} className="w-full py-2.5 text-xs c-muted2">
          Dejar de seguir este pedido
        </button>
      </div>
    </div>
  );
}

function OrderLookupModal({ onClose, onFound }) {
  const [code, setCode] = useState("");
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [searching, setSearching] = useState(false);

  async function search() {
    if (!code.trim() || !phone.trim()) {
      setError("Completá el número de pedido y tu teléfono.");
      return;
    }
    setSearching(true);
    setError("");
    const all = await loadOrders();
    const found = all.find(
      (o) => String(o.shortCode) === code.trim() && o.phone.replace(/\s+/g, "") === phone.trim().replace(/\s+/g, "")
    );
    setSearching(false);
    if (!found) {
      setError("No encontramos un pedido con ese número y teléfono. Revisá los datos.");
      return;
    }
    onFound(found);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(10,7,5,0.8)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6" style={{ background: "#241C17" }}>
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-display text-xl c-cream">Buscar mi pedido</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center bg-surface2">
            <X size={16} className="c-tan" />
          </button>
        </div>
        <p className="text-xs c-muted mb-5">Ingresá el número de pedido y el teléfono que usaste al pedir.</p>

        <div className="space-y-3 mb-2">
          <Field label="Número de pedido" value={code} onChange={setCode} placeholder="Ej: 7" />
          <Field label="Teléfono usado en el pedido" value={phone} onChange={setPhone} placeholder="Ej: 387 555 5555" />
        </div>
        {error && <p className="text-xs mb-3" style={{ color: "#EF6461" }}>{error}</p>}

        <button
          onClick={search}
          disabled={searching}
          className="w-full py-3.5 rounded-2xl font-display text-base flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          style={{ background: "#F2B705", color: "#191310" }}
        >
          <Search size={16} /> {searching ? "Buscando…" : "Buscar pedido"}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ADMIN VIEW                                                          */
/* ------------------------------------------------------------------ */

function playAlertBeep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    [880, 1108].forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.001, ctx.currentTime + i * 0.16);
      gain.gain.linearRampToValueAtTime(0.22, ctx.currentTime + i * 0.16 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.16 + 0.28);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.16);
      osc.stop(ctx.currentTime + i * 0.16 + 0.3);
    });
  } catch (e) { /* audio not available */ }
}

function AdminView({ catalog, orders, onSaveCatalog, onUpdateOrder, onRefreshOrders, onExit }) {
  const [authed, setAuthed] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [tab, setTab] = useState("orders");
  const [unseenCount, setUnseenCount] = useState(0);
  const [toast, setToast] = useState(null);
  const seenIdsRef = useRef(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    if (!authed) return;
    const t = setInterval(onRefreshOrders, 6000);
    return () => clearInterval(t);
  }, [authed, onRefreshOrders]);

  // Seed "already seen" orders right when logging in, so old orders don't trigger an alert.
  useEffect(() => {
    if (authed && seenIdsRef.current === null) {
      seenIdsRef.current = new Set(orders.map((o) => o.id));
    }
  }, [authed, orders]);

  // Detect brand-new orders arriving from the shared storage poll and alert.
  useEffect(() => {
    if (!authed || seenIdsRef.current === null) return;
    const fresh = orders.filter((o) => !seenIdsRef.current.has(o.id));
    if (fresh.length > 0) {
      fresh.forEach((o) => seenIdsRef.current.add(o.id));
      playAlertBeep();
      setUnseenCount((c) => c + fresh.length);
      setToast(fresh[0]);
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = setTimeout(() => setToast(null), 6000);
    }
  }, [orders, authed]);

  function openTab(id) {
    setTab(id);
    if (id === "orders") setUnseenCount(0);
  }

  if (!authed) {
    return (
      <div className="min-h-[600px] flex items-center justify-center px-5">
        <div className="w-full max-w-xs">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Lock size={18} className="c-gold" />
            <span className="font-display text-xl">PANEL ADMIN</span>
          </div>
          <input
            value={pin}
            onChange={(e) => { setPin(e.target.value); setError(""); }}
            type="password"
            placeholder="PIN de acceso"
            className="w-full bg-surface2 rounded-xl px-4 py-3 text-center tracking-[0.3em] outline-none focus-gold c-cream mb-3"
          />
          {error && <p className="c-red text-xs text-center mb-3">{error}</p>}
          <button
            onClick={() => (pin === ADMIN_PIN ? setAuthed(true) : setError("PIN incorrecto"))}
            className="w-full py-3 rounded-xl font-display"
            style={{ background: "#F2B705", color: "#191310" }}
          >
            Ingresar
          </button>
          <button onClick={onExit} className="w-full py-3 mt-2 text-xs c-muted flex items-center justify-center gap-1">
            <ArrowLeft size={12} /> Volver a la tienda
          </button>
          <p className="text-[10px] c-brown text-center mt-6">PIN de demo: {ADMIN_PIN} — cambialo antes de usar en producción.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16 relative">
      {toast && (
        <div
          className="fixed top-4 left-4 right-4 max-w-md mx-auto z-50 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-2xl cursor-pointer"
          style={{ background: "#22C55E" }}
          onClick={() => { setToast(null); openTab("orders"); }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(0,0,0,0.15)" }}>
            <Package size={17} color="white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm" style={{ color: "#0B2E13" }}>¡Nuevo pedido de {toast.customerName}!</div>
            <div className="text-xs" style={{ color: "#0B2E13" }}>{money(toast.total)} · Pedido #{toast.shortCode}</div>
          </div>
        </div>
      )}

      <div className="px-5 pt-6 pb-4 flex items-center justify-between" style={{ borderBottom: "1px solid #2E241D" }}>
        <div className="flex items-center gap-2">
          <Utensils size={18} className="c-gold" />
          <span className="font-display text-lg">ADMIN · YO PANCHO</span>
        </div>
        <button onClick={onExit} className="text-xs c-tan flex items-center gap-1">
          <LogOut size={13} /> Salir
        </button>
      </div>

      <div className="flex gap-2 px-5 py-3">
        {[
          { id: "orders", label: "Pedidos", icon: Package },
          { id: "menu", label: "Menú", icon: Utensils },
          { id: "settings", label: "Configuración", icon: Pencil },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => openTab(t.id)}
            className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold"
            style={{ background: tab === t.id ? "#F2B705" : "#2E241D", color: tab === t.id ? "#191310" : "#D8C9B4" }}
          >
            <t.icon size={13} /> {t.label}
            {t.id === "orders" && unseenCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ background: "#D62828", color: "white" }}
              >
                {unseenCount}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="px-5">
        {tab === "orders" && <OrdersPanel orders={orders} onUpdateOrder={onUpdateOrder} onRefresh={onRefreshOrders} />}
        {tab === "menu" && <MenuEditor catalog={catalog} onSave={onSaveCatalog} />}
        {tab === "settings" && <SettingsPanel catalog={catalog} onSave={onSaveCatalog} />}
      </div>
    </div>
  );
}

function OrdersPanel({ orders, onUpdateOrder, onRefresh }) {
  const [filter, setFilter] = useState("todos");
  const visible = filter === "todos" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar">
          <button onClick={() => setFilter("todos")} className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold" style={{ background: filter === "todos" ? "#F2B705" : "#2E241D", color: filter === "todos" ? "#191310" : "#D8C9B4" }}>Todos</button>
          {ORDER_STATUSES.map((s) => (
            <button key={s.id} onClick={() => setFilter(s.id)} className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold" style={{ background: filter === s.id ? s.color : "#2E241D", color: filter === s.id ? "#191310" : "#D8C9B4" }}>{s.label}</button>
          ))}
        </div>
        <button onClick={onRefresh} className="shrink-0 ml-2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#2E241D" }}>
          <RefreshCw size={13} className="c-tan" />
        </button>
      </div>

      {visible.length === 0 ? (
        <div className="text-sm c-muted py-10 text-center">No hay pedidos {filter !== "todos" ? `en "${filter}"` : "todavía"}.</div>
      ) : (
        <div className="space-y-3">
          {visible.map((o) => (
            <OrderCard key={o.id} order={o} onUpdateOrder={onUpdateOrder} />
          ))}
        </div>
      )}
    </div>
  );
}

function OrderCard({ order, onUpdateOrder }) {
  const [open, setOpen] = useState(false);
  const status = ORDER_STATUSES.find((s) => s.id === order.status) || ORDER_STATUSES[0];
  const time = new Date(order.createdAt).toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#241C17", border: "1px solid #2E241D" }}>
      <button onClick={() => setOpen((v) => !v)} className="w-full p-4 flex items-center justify-between text-left">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-t font-bold text-sm">#{order.shortCode}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: status.color, color: "#191310" }}>{status.label}</span>
          </div>
          <div className="text-xs c-tan mt-1">{order.customerName} · {time} · {order.mode === "delivery" ? "Delivery" : "Retiro"}</div>
        </div>
        <div className="text-right shrink-0 ml-2">
          <div className="font-mono-t font-bold c-gold">{money(order.total)}</div>
          <ChevronRight size={14} className={`c-muted ml-auto transition-transform ${open ? "rotate-90" : ""}`} />
        </div>
      </button>

      {open && (
        <div className="px-4 pb-4 font-mono-t text-xs">
          <div style={{ borderTop: "1px dashed #3A2F26" }} className="pt-3 space-y-1.5 mb-3">
            {order.items.map((l, i) => (
              <div key={i} className="flex justify-between">
                <span>{l.qty}x {l.name}{l.variantLabel ? ` (${l.variantLabel})` : ""}{l.note ? ` — ${l.note}` : ""}</span>
                <span>{money(l.price * l.qty)}</span>
              </div>
            ))}
          </div>
          <div className="c-tan mb-3">
            <div>📞 {order.phone}</div>
            <div>💰 {{ efectivo: "Efectivo", transferencia: "Transferencia", tarjeta: "Tarjeta" }[order.payment] || order.payment}</div>
            {order.mode === "delivery" && <div>📍 {order.address}</div>}
            {order.note && <div>📝 {order.note}</div>}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {ORDER_STATUSES.map((s) => (
              <button
                key={s.id}
                onClick={() => onUpdateOrder(order.id, { status: s.id })}
                className="px-2.5 py-1.5 rounded-lg font-bold"
                style={{ background: order.status === s.id ? s.color : "#2E241D", color: order.status === s.id ? "#191310" : "#D8C9B4" }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function MenuEditor({ catalog, onSave }) {
  const [local, setLocal] = useState(catalog);
  const [dirty, setDirty] = useState(false);
  const [openCat, setOpenCat] = useState(catalog.categories[0]?.id || null);
  const [groupsOpen, setGroupsOpen] = useState(false);

  function patch(next) {
    setLocal(next);
    setDirty(true);
  }

  function updateItem(catId, itemId, field, value) {
    patch({
      ...local,
      categories: local.categories.map((c) =>
        c.id !== catId ? c : { ...c, items: c.items.map((it) => (it.id !== itemId ? it : { ...it, [field]: value })) }
      ),
    });
  }

  // Availability is a one-tap operational decision (86'd right now) — save it
  // immediately instead of waiting for the batched "Guardar cambios" used for
  // text/price edits, so the customer view picks it up on its next poll.
  async function toggleActiveNow(catId, itemId, nextActive) {
    await updateItemNow(catId, itemId, "active", nextActive);
  }

  // Generic "save this one field right now" helper — used for any edit that's
  // a discrete click (not a text field you're still typing into): toggles,
  // photo uploads, personalization-group assignment.
  async function updateItemNow(catId, itemId, field, value) {
    const next = {
      ...local,
      categories: local.categories.map((c) =>
        c.id !== catId ? c : { ...c, items: c.items.map((it) => (it.id !== itemId ? it : { ...it, [field]: value })) }
      ),
    };
    setLocal(next);
    await onSave(next);
    setDirty(false); // this save flushes any other pending edits in `local` too
  }

  function toggleModifierGroupForItem(catId, item, groupId) {
    const current = item.modifierGroupIds || [];
    const next = current.includes(groupId) ? current.filter((g) => g !== groupId) : [...current, groupId];
    updateItemNow(catId, item.id, "modifierGroupIds", next);
  }

  function handleImageFile(catId, itemId, file) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const MAX = 480;
        const scale = Math.min(1, MAX / Math.max(img.width, img.height));
        const w = Math.round(img.width * scale);
        const h = Math.round(img.height * scale);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL("image/jpeg", 0.75);
        updateItemNow(catId, itemId, "image", dataUrl);
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  }

  function updateVariant(catId, itemId, idx, field, value) {
    patch({
      ...local,
      categories: local.categories.map((c) =>
        c.id !== catId ? c : {
          ...c,
          items: c.items.map((it) =>
            it.id !== itemId ? it : { ...it, variants: it.variants.map((v, i) => (i !== idx ? v : { ...v, [field]: field === "price" ? Number(value) || 0 : value })) }
          ),
        }
      ),
    });
  }

  function removeItem(catId, itemId) {
    patch({
      ...local,
      categories: local.categories.map((c) => (c.id !== catId ? c : { ...c, items: c.items.filter((it) => it.id !== itemId) })),
    });
  }

  function addItem(catId) {
    const name = prompt("Nombre del nuevo producto:");
    if (!name) return;
    patch({
      ...local,
      categories: local.categories.map((c) =>
        c.id !== catId ? c : { ...c, items: [...c.items, { id: uid(), name, price: 0 }] }
      ),
    });
  }

  function removeCategory(catId) {
    if (!confirm("¿Eliminar esta categoría y todos sus productos?")) return;
    patch({ ...local, categories: local.categories.filter((c) => c.id !== catId) });
  }

  function addCategory() {
    const name = prompt("Nombre de la nueva categoría:");
    if (!name) return;
    patch({ ...local, categories: [...local.categories, { id: uid(), name, emoji: "🍽️", items: [] }] });
  }

  async function save() {
    await onSave(local);
    setDirty(false);
  }

  // Personalization groups (Verduras, Aderezos, Salsas, etc.) are managed
  // separately from products — these are structural list edits, so they save
  // immediately rather than waiting on the batched "Guardar cambios".
  async function saveGroupsNow(nextGroups) {
    const next = { ...local, modifierGroups: nextGroups };
    setLocal(next);
    await onSave(next);
    setDirty(false);
  }
  function addModifierGroup() {
    const name = prompt("Nombre del nuevo grupo (ej: Salsas):");
    if (!name) return;
    const emoji = prompt("Emoji para el grupo (opcional):", "🍽️") || "🍽️";
    saveGroupsNow([...(local.modifierGroups || []), { id: uid(), emoji, name, options: [] }]);
  }
  function removeModifierGroup(groupId) {
    if (!confirm("¿Eliminar este grupo? Se quita de todos los productos que lo tengan asignado.")) return;
    const next = {
      ...local,
      modifierGroups: local.modifierGroups.filter((g) => g.id !== groupId),
      categories: local.categories.map((c) => ({
        ...c,
        items: c.items.map((it) => ({ ...it, modifierGroupIds: (it.modifierGroupIds || []).filter((id) => id !== groupId) })),
      })),
    };
    setLocal(next);
    onSave(next);
    setDirty(false);
  }
  function addOptionToGroup(groupId) {
    const opt = prompt("Nueva opción:");
    if (!opt) return;
    saveGroupsNow(local.modifierGroups.map((g) => (g.id !== groupId ? g : { ...g, options: [...g.options, opt] })));
  }
  function removeOptionFromGroup(groupId, opt) {
    saveGroupsNow(local.modifierGroups.map((g) => (g.id !== groupId ? g : { ...g, options: g.options.filter((o) => o !== opt) })));
  }

  return (
    <div className="pb-10">
      {dirty && (
        <div className="sticky top-0 z-10 -mx-5 px-5 py-2.5 mb-3 flex items-center justify-between" style={{ background: "#191310", borderBottom: "1px solid #2E241D" }}>
          <span className="text-xs c-gold">Tenés cambios sin guardar</span>
          <button onClick={save} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold" style={{ background: "#F2B705", color: "#191310" }}>
            <Save size={13} /> Guardar cambios
          </button>
        </div>
      )}

      <div className="mb-4 rounded-2xl overflow-hidden" style={{ background: "#241C17", border: "1px solid #2E241D" }}>
        <button onClick={() => setGroupsOpen((v) => !v)} className="w-full p-3.5 flex items-center justify-between">
          <span className="font-bold text-sm c-cream">🧩 Grupos de personalización</span>
          <ChevronRight size={14} className="c-muted" style={{ transform: groupsOpen ? "rotate(90deg)" : "none" }} />
        </button>
        {groupsOpen && (
          <div className="px-3.5 pb-3.5 space-y-2.5">
            <p className="text-[11px] c-muted -mt-1 mb-1">
              Estos son los grupos que después podés activar por producto (ej: "Verduras" para ofrecer con/sin tomate). Cambios acá se guardan solos.
            </p>
            {(local.modifierGroups || []).map((g) => (
              <div key={g.id} className="p-3 rounded-xl" style={{ background: "#2E241D" }}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs c-cream">{g.emoji} {g.name}</span>
                  <button onClick={() => removeModifierGroup(g.id)}><Trash2 size={12} className="c-red" /></button>
                </div>
                <div className="flex gap-1.5 flex-wrap mb-2">
                  {g.options.map((opt) => (
                    <span key={opt} className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] bg-dark c-tan">
                      {opt}
                      <button onClick={() => removeOptionFromGroup(g.id, opt)} className="c-red">
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                </div>
                <button onClick={() => addOptionToGroup(g.id)} className="text-[11px] font-bold c-gold">+ Agregar opción</button>
              </div>
            ))}
            <button onClick={addModifierGroup} className="w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5" style={{ background: "#191310", color: "#F2B705" }}>
              <PlusCircle size={13} /> Nuevo grupo
            </button>
          </div>
        )}
      </div>

      {local.categories.map((cat) => (
        <div key={cat.id} className="mb-3 rounded-2xl overflow-hidden" style={{ background: "#241C17", border: "1px solid #2E241D" }}>
          <div className="p-3.5 flex items-center justify-between">
            <button onClick={() => setOpenCat(openCat === cat.id ? null : cat.id)} className="flex items-center gap-2 text-left flex-1">
              <span>{cat.emoji}</span>
              <span className="font-bold text-sm">{cat.name}</span>
              <span className="text-[10px] c-muted">({cat.items.length})</span>
            </button>
            <button onClick={() => removeCategory(cat.id)} className="w-7 h-7 rounded-full flex items-center justify-center shrink-0" style={{ background: "#2E241D" }}>
              <Trash2 size={12} className="c-red" />
            </button>
          </div>

          {openCat === cat.id && (
            <div className="px-3.5 pb-3.5 space-y-2">
              {cat.items.map((item) => (
                <div key={item.id} className="p-3 rounded-xl" style={{ background: "#2E241D" }}>
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      value={item.name}
                      onChange={(e) => updateItem(cat.id, item.id, "name", e.target.value)}
                      className="flex-1 bg-transparent font-bold text-sm outline-none border-b border-transparent focus:b-gold"
                    />
                    <button onClick={() => removeItem(cat.id, item.id)} className="shrink-0">
                      <Trash2 size={13} className="c-red" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 mb-2.5">
                    {(item.image || PRODUCT_IMAGES[item.id]) ? (
                      <img src={item.image || PRODUCT_IMAGES[item.id]} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-lg shrink-0 flex items-center justify-center bg-dark c-muted">
                        <span className="text-lg">{cat.emoji}</span>
                      </div>
                    )}
                    <label className="text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer" style={{ background: "#191310", color: "#F2B705" }}>
                      {item.image ? "Cambiar foto" : "Subir foto"}
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleImageFile(cat.id, item.id, e.target.files && e.target.files[0])}
                      />
                    </label>
                    {item.image && (
                      <button onClick={() => updateItemNow(cat.id, item.id, "image", null)} className="text-[11px] c-muted underline">
                        Quitar
                      </button>
                    )}
                  </div>

                  {item.variants ? (
                    <div className="flex gap-2 flex-wrap">
                      {item.variants.map((v, idx) => (
                        <div key={idx} className="flex items-center gap-1 bg-dark rounded-lg px-2 py-1">
                          <span className="text-[10px] c-tan">{v.label}</span>
                          <span className="text-[10px]">$</span>
                          <input
                            type="number"
                            value={v.price}
                            onChange={(e) => updateVariant(cat.id, item.id, idx, "price", e.target.value)}
                            className="w-16 bg-transparent text-xs font-mono-t outline-none"
                          />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-1">
                      <span className="text-xs">$</span>
                      <input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(cat.id, item.id, "price", Number(e.target.value) || 0)}
                        className="w-24 bg-dark rounded-lg px-2 py-1 text-xs font-mono-t outline-none"
                      />
                    </div>
                  )}

                  <div className="mt-2.5">
                    <div className="text-[10px] font-bold c-muted mb-1.5">Personalización que se le ofrece al cliente</div>
                    <div className="flex gap-1.5 flex-wrap">
                      {(catalog.modifierGroups || []).map((g) => {
                        const on = (item.modifierGroupIds || []).includes(g.id);
                        return (
                          <button
                            key={g.id}
                            onClick={() => toggleModifierGroupForItem(cat.id, item, g.id)}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-bold"
                            style={{ background: on ? "#F2B705" : "#191310", color: on ? "#191310" : "#6B5D4F" }}
                          >
                            {g.emoji} {g.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => toggleActiveNow(cat.id, item.id, item.active === false)}
                    className="mt-2.5 w-full py-1.5 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1.5"
                    style={{
                      background: item.active === false ? "#3A1414" : "#16301C",
                      color: item.active === false ? "#EF6461" : "#4ADE80",
                    }}
                  >
                    {item.active === false ? "🚫 Agotado hoy — tocá para reactivar" : "✅ Disponible — tocá para marcar agotado"}
                  </button>
                </div>
              ))}
              <button onClick={() => addItem(cat.id)} className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5" style={{ background: "#191310", color: "#F2B705" }}>
                <PlusCircle size={13} /> Agregar producto
              </button>
            </div>
          )}
        </div>
      ))}

      <button onClick={addCategory} className="w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-1.5 mt-2" style={{ background: "#2E241D", color: "#F2B705" }}>
        <PlusCircle size={15} /> Nueva categoría
      </button>
    </div>
  );
}

function SettingsPanel({ catalog, onSave }) {
  const [s, setS] = useState(catalog.settings);
  const [dirty, setDirty] = useState(false);

  function set(field, value) {
    setS((prev) => ({ ...prev, [field]: value }));
    setDirty(true);
  }

  async function save() {
    await onSave({ ...catalog, settings: s });
    setDirty(false);
  }

  return (
    <div className="space-y-3 pb-10">
      <Field label="Nombre del local" value={s.storeName} onChange={(v) => set("storeName", v)} />
      <Field label="Dirección" value={s.address} onChange={(v) => set("address", v)} />
      <Field label="Teléfono (a mostrar)" value={s.phoneDisplay} onChange={(v) => set("phoneDisplay", v)} />
      <Field label="WhatsApp (solo números, con código de país, ej: 5493874125784)" value={s.whatsapp} onChange={(v) => set("whatsapp", v)} />
      <Field label="Frase destacada" value={s.accentNote} onChange={(v) => set("accentNote", v)} />
      <button
        disabled={!dirty}
        onClick={save}
        className="w-full py-3 rounded-2xl font-display disabled:opacity-40 flex items-center justify-center gap-2"
        style={{ background: "#F2B705", color: "#191310" }}
      >
        <Save size={15} /> Guardar configuración
      </button>
    </div>
  );
}

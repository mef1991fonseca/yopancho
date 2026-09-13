import { useState, useEffect, useRef, useCallback } from "react";
import {
  ShoppingBag, Plus, Minus, X, ChevronRight, Flame, MapPin,
  Check, Trash2, Pencil, LogOut, Lock, Save, PlusCircle,
  Search, ArrowLeft, Utensils, Send, RefreshCw, Package, User, Timer
} from "lucide-react";
import { storage, getStorageInitError, authAvailable, adminSignIn, adminSignOut, getAdminSession, onAdminAuthChange, fileStorageAvailable, uploadMediaFile } from "./storage";

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
    city: "Salta",
    phoneDisplay: "387-412-5784",
    whatsapp: "5493874125784",
    accentNote: "Todo sale con papas",
    storeTagline: "Sandwiches · Burgers · Lomos",
    storeHours: "19:30 - 01:00",
    heroBadgeText: "⭐ Más pedido de Salta",
    heroHeadlinePre: "LOS MEJORES",
    heroHeadlineHighlight: "LOMOS Y SÁNDWICHES",
    heroHeadlinePost: "DE LA CIUDAD.",
    heroSubtitle: "", // empty = use the featured item's description automatically
    heroDeliveryNote: "20-30 min demora",
    heroFeaturedItemId: "", // empty = auto-pick the first active item with a photo
  },
  categories: [
    {
      id: "sandwiches", name: "Sandwiches de la Casa", emoji: "🥪",
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
      id: "mila-lili-especial", name: "Milanesa de Molida Lili", emoji: "🥖",
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
        { id: "plato-mila-napo", name: "Milanesa napolitana", desc: "Carne, pollo o cerdo", proteinChoices: ["Carne", "Pollo", "Cerdo"], price: 14000 },
        { id: "plato-mila-caballo", name: "Milanesa a caballo", desc: "Carne, pollo o cerdo", proteinChoices: ["Carne", "Pollo", "Cerdo"], price: 14000 },
        { id: "plato-costeleta", name: "Costeleta a caballo", desc: "Carne o cerdo", proteinChoices: ["Carne", "Cerdo"], price: 14000 },
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
  // Cada opción puede desactivarse temporalmente (ej: "no queda arroz esta
  // noche") sin borrarla del todo — ver "active" más abajo.
  platoGuarniciones: [
    { label: "Papas fritas", active: true },
    { label: "Puré", active: true },
    { label: "Arroz", active: true },
    { label: "Papa y huevo", active: true },
  ],
  // Grupos de personalización reutilizables: cada producto elige (desde el
  // panel admin) cuáles de estos grupos se le ofrecen al cliente. Reemplaza
  // la vieja lista única de "aderezos" por algo más parecido a un armado de
  // hamburguesería real (verduras a elección, salsas, toppings, etc.).
  modifierGroups: [
    { id: "verduras", emoji: "🥬", name: "Verduras", options: ["Tomate", "Lechuga", "Cebolla"] },
    { id: "aderezos", emoji: "🍯", name: "Aderezos", options: [
      "Mayonesa", "Mostaza", "Ketchup", "Salsa Golf", "Barbacoa", "Ajo", "Ají", "Morrón",
      "Queso Parmesano", "Queso Roquefort", "Panceta", "Salame", "Palta", "Cheddar",
      "Aceituna", "Albahaca", "Apio", "4 Quesos", "Fugazzeta", "Inglesa",
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
  // Promos destacadas, tipo "portada" — el admin las carga desde el panel;
  // arranca vacío para no inventar precios que el local no confirmó.
  promotions: [],
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

// Items that need a required protein-type choice (Carne/Pollo/Cerdo), used
// both by DEFAULT_CATALOG and to backfill catalogs saved before this field
// existed — see migrateCatalog() below.
const PROTEIN_CHOICES_BY_ITEM_ID = {
  "plato-mila-napo": ["Carne", "Pollo", "Cerdo"],
  "plato-mila-caballo": ["Carne", "Pollo", "Cerdo"],
  "plato-costeleta": ["Carne", "Cerdo"],
};

DEFAULT_CATALOG.categories = DEFAULT_CATALOG.categories.map((c) => ({
  ...c,
  items: c.items.map((it) => ({
    ...it,
    modifierGroupIds: it.modifierGroupIds || CATEGORY_DEFAULT_MODIFIER_GROUPS[c.id] || [],
  })),
}));

const ORDER_STATUSES = [
  { id: "nuevo", label: "Nuevo", color: "#f2b705" },
  { id: "preparando", label: "Preparando", color: "#3b82f6" },
  { id: "listo", label: "Listo", color: "#22c55e" },
  { id: "entregado", label: "Entregado", color: "#6b7280" },
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

// Generic "chat bubble + phone" glyph in WhatsApp's brand green — evokes the
// app without reproducing its trademarked logo artwork.
function WhatsAppIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2Z" fill="#25D366" />
      <path
        d="M8.3 7.4c.2-.5.5-.5.7-.5h.5c.2 0 .4 0 .6.4.2.5.7 1.6.7 1.7.1.1.1.3 0 .4-.1.2-.1.3-.3.4-.1.2-.3.3-.4.5-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.4 2.5 1.5.3.1.5.1.7-.1.2-.2.7-.8.9-1.1.2-.3.4-.2.6-.1.2.1 1.5.7 1.8.9.3.1.5.2.5.3.1.2.1.9-.2 1.7-.3.8-1.7 1.5-2.3 1.6-.6.1-1.3.2-4.1-.9-3.5-1.4-5.6-4.9-5.8-5.1-.2-.2-1.4-1.8-1.4-3.5 0-1.6.9-2.4 1.2-2.8Z"
        fill="#ffffff"
      />
    </svg>
  );
}
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
  } else if (typeof c.platoGuarniciones[0] === "string") {
    // Old format was a plain list of strings — upgrade to objects so each
    // option can be toggled active/inactive without losing the rest.
    c.platoGuarniciones = c.platoGuarniciones.map((label) => ({ label, active: true }));
    changed = true;
  }
  if (!c.promotions) {
    c.promotions = [];
    changed = true;
  }
  {
    const mergedSettings = { ...DEFAULT_CATALOG.settings, ...(c.settings || {}) };
    if (JSON.stringify(mergedSettings) !== JSON.stringify(c.settings || {})) {
      c.settings = mergedSettings;
      changed = true;
    }
  }

  c.categories = (c.categories || []).map((cat) => ({
    ...cat,
    items: cat.items.map((it) => {
      const defaults = CATEGORY_DEFAULT_MODIFIER_GROUPS[cat.id] || [];
      let next = it;
      if (!next.modifierGroupIds) {
        changed = true;
        next = { ...next, modifierGroupIds: defaults };
      } else if (needsRefresh && next.modifierGroupIds.length === 0 && defaults.length > 0) {
        // Only touch items nobody has customized yet (still at the empty/default
        // state) — never overwrite a product the admin deliberately edited.
        changed = true;
        next = { ...next, modifierGroupIds: defaults };
      }
      // Backfill fields added to specific catalog items after this catalog was
      // first saved (e.g. "elegí carne/pollo/cerdo" on plate items) — these are
      // brand-new fields, so it's always safe to add them if still missing.
      if (!next.proteinChoices && PROTEIN_CHOICES_BY_ITEM_ID[next.id]) {
        changed = true;
        next = { ...next, proteinChoices: PROTEIN_CHOICES_BY_ITEM_ID[next.id] };
      }
      return next;
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
    // Best-effort seed. If we're not authenticated (RLS now restricts
    // menu-catalog writes to admins), this will fail for a first-ever
    // anonymous visitor — that's fine, we still hand back the in-memory
    // default so the shop renders instead of showing an error screen.
    try {
      await storage.set("menu-catalog", JSON.stringify(DEFAULT_CATALOG));
    } catch (e) { /* not authenticated yet — an admin save will persist it */ }
    return DEFAULT_CATALOG;
  }

  const { catalog: migrated, changed } = migrateCatalog(raw);
  if (changed) {
    // Same as above: persisting the migration is a nice-to-have, not a
    // requirement for this page load. A logged-in admin's next save (or
    // this same migration running again next time an admin is logged in)
    // will write it for real.
    try {
      await storage.set("menu-catalog", JSON.stringify(migrated));
    } catch (e) { /* not authenticated — keep using the migrated copy in memory */ }
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
      <div style={{ background: "#0c0e16" }} className="w-full h-full min-h-[600px] flex items-center justify-center px-6">
        <div className="max-w-md w-full rounded-2xl p-5" style={{ background: "#11131b", border: "1px solid #7f1d1d" }}>
          <div className="font-bold mb-2" style={{ color: "#f87171" }}>No se pudo conectar con la base de datos</div>
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
      <div style={{ background: "#0c0e16" }} className="w-full h-full min-h-[600px] flex items-center justify-center">
        <div className="c-gold font-semibold tracking-wide animate-pulse">Cargando Yo Pancho…</div>
      </div>
    );
  }

  return (
    <div style={{ background: "#0c0e16", fontFamily: "'Montserrat', sans-serif" }} className="w-full min-h-[700px] c-cream">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800;900&family=Montserrat:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600;700&display=swap');
        .font-display { font-family: 'Syne', sans-serif; letter-spacing: 0.01em; font-weight: 800; }
        .font-mono-t { font-family: 'JetBrains Mono', monospace; }
        .rounded-2xl, .rounded-3xl, .rounded-t-3xl { border-radius: 14px !important; }
        @keyframes promoProgress { from { transform: scaleX(0); } to { transform: scaleX(1); } }
        .ticket-edge {
          background-image: radial-gradient(circle at 8px 0, transparent 8px, #ffffff 8.5px);
          background-size: 16px 16px;
          background-position: top;
          background-repeat: repeat-x;
        }
        .no-scrollbar::-webkit-scrollbar{display:none}
        .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}

        /* Real CSS color utilities — this environment doesn't compile Tailwind
           arbitrary-value classes like text-[#hex], so colors live here instead. */
        .c-gold{color:#f2b705}
        .c-cream{color:#ffffff}
        .c-tan{color:#9ca3af}
        .c-tan2{color:#d1d5db}
        .c-muted{color:#6b7280}
        .c-muted2{color:#6b7280}
        .c-dark{color:#0c0e16}
        .c-red{color:#f87171}
        .c-red2{color:#b91c1c}
        .c-brown{color:#232735}
        .bg-surface2{background:#171a24}
        .bg-dark{background:#0c0e16}
        .b-gold{border-color:#f2b705}
        .ph-muted::placeholder{color:#6b7280}
        .focus-gold:focus{outline:none;box-shadow:0 0 0 2px #f2b705}

        .chip{
          background:#171a24;color:#d1d5db;border:1px solid #232735;
          transition:background .15s ease, color .15s ease;
        }
        .chip.active{background:#f2b705;color:#0c0e16;border-color:#f2b705}
      `}</style>

      <div
        className={`w-full mx-auto min-h-[700px] ${view === "shop" ? "max-w-md sm:max-w-2xl lg:max-w-5xl" : "max-w-md sm:max-w-3xl"}`}
        style={{ background: "#0c0e16", boxShadow: "0 0 60px rgba(0,0,0,0.5)" }}
      >
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
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SHOP VIEW (CUSTOMER)                                                */
/* ------------------------------------------------------------------ */

function ShopView({ catalog, onGoAdmin, pushOrder }) {
  const [activeCat, setActiveCat] = useState(catalog.categories[0].id);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [carouselPaused, setCarouselPaused] = useState(false);
  const touchXRef = useRef(null);
  const [portraitMedia, setPortraitMedia] = useState({}); // { [promoId]: true } once we know it's a tall image/video

  function handleMediaLoadedSize(promoId, w, h) {
    if (w && h && h > w * 1.05) {
      setPortraitMedia((prev) => (prev[promoId] ? prev : { ...prev, [promoId]: true }));
    }
  }

  function handleCarouselTouchStart(e) {
    touchXRef.current = e.touches[0].clientX;
  }
  function handleCarouselTouchEnd(e, count) {
    if (touchXRef.current == null) return;
    const dx = e.changedTouches[0].clientX - touchXRef.current;
    if (Math.abs(dx) > 40) {
      if (dx < 0) setCarouselIndex((i) => (i + 1) % count);
      else setCarouselIndex((i) => (i - 1 + count) % count);
    }
    touchXRef.current = null;
  }

  useEffect(() => {
    if (carouselPaused || !catalog.promotions || catalog.promotions.length <= 1) return;
    const t = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % catalog.promotions.length);
    }, 5000);
    return () => clearInterval(t);
  }, [catalog.promotions, carouselPaused]);

  useEffect(() => {
    if (catalog.promotions && carouselIndex >= catalog.promotions.length) {
      setCarouselIndex(0);
    }
  }, [catalog.promotions, carouselIndex]);

  const [cart, setCart] = useState([]); // {lineId, catId, itemId, name, variantLabel, price, qty, note}
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [orderMode, setOrderMode] = useState("delivery"); // "delivery" | "pickup" — chosen from the sidebar/drawer, seeds checkout
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
  const [searchOpen, setSearchOpen] = useState(false);
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
      gpsLink: form.mode === "delivery" ? (form.gpsLink || "") : "",
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
      (order.mode === "delivery"
        ? (order.gpsLink
            ? `\n📍 Mi ubicación: ${order.gpsLink}\n`
            : `\n📍 Te comparto mi ubicación actual en este chat para que el cadete llegue sin problemas.\n`)
        : "");

    const wa = `https://wa.me/${catalog.settings.whatsapp}?text=${encodeURIComponent(msg)}`;
    window.open(wa, "_blank");

    setConfirmed(order);
    setMyOrder(order);
    setCart([]);
    setCheckoutOpen(false);
    setDrawerOpen(false);
  }

  const allItemsFlat = catalog.categories.flatMap((c) => c.items.map((i) => ({ ...i, catId: c.id })));
  const heroItem = (catalog.settings.heroFeaturedItemId && allItemsFlat.find((i) => i.id === catalog.settings.heroFeaturedItemId && i.active !== false))
    || allItemsFlat.find((i) => i.active !== false && (i.image || PRODUCT_IMAGES[i.id]));
  const heroPhoto = heroItem && (heroItem.image || PRODUCT_IMAGES[heroItem.id]);
  const heroPrice = heroItem ? (heroItem.variants ? heroItem.variants[0].price : heroItem.price) : null;
  const showAll = activeCat === "__all__";

  return (
    <div className="pb-24 lg:pb-10">
      {/* Top promo strip */}
      <div className="text-center text-[10px] sm:text-[11px] font-medium font-mono-t py-2 px-4 tracking-wide" style={{ background: "#f2b705", color: "#0c0e16" }}>
        <Flame size={11} strokeWidth={1.5} className="inline -mt-0.5 mr-0.5" />
        ¡TODOS LOS PEDIDOS SALEN CON PAPAS FRITAS INCLUIDAS! • {catalog.settings.address.toUpperCase()} • {catalog.settings.city.toUpperCase()}
      </div>

      {/* Navbar — everything on one row; the search field collapses to an
          icon button so "Menú Carta / Combos & Promos / Estado de Pedido"
          have room to live right there instead of a second row. */}
      <div className="sticky top-0 z-20 px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3 flex-wrap font-mono-t" style={{ background: "#0c0e16", borderBottom: "1px solid #171a24" }}>
        {/* Logo lockup — small badge + tiny wordmark/tagline */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: "#f2b705", border: "1.5px solid rgba(255,255,255,0.3)" }}>
            <Flame size={18} color="#0c0e16" strokeWidth={2.5} />
          </div>
          <div className="hidden sm:block leading-none">
            <div className="font-bold text-[11px] tracking-wide c-cream">YO <span className="c-gold">PANCHO</span></div>
            <div className="text-[8px] c-muted tracking-[0.15em] mt-0.5">{catalog.settings.storeTagline.toUpperCase()}</div>
          </div>
        </div>

        {/* Bigger store name + blinking open status */}
        <div className="hidden 2xl:block shrink-0 leading-tight">
          <div className="font-display text-base c-cream">{catalog.settings.storeName.toUpperCase()}</div>
          <div className="flex items-center gap-1.5 text-[11px] c-tan mt-0.5">
            <span className="relative flex w-1.5 h-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full animate-ping" style={{ background: "#22c55e", opacity: 0.6 }} />
              <span className="relative inline-flex w-1.5 h-1.5 rounded-full" style={{ background: "#22c55e" }} />
            </span>
            Abierto hoy ({catalog.settings.storeHours})
          </div>
        </div>

        {/* Collapsible search — icon by default, expands into a field */}
        {searchOpen ? (
          <div className="relative w-full sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 c-muted" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onBlur={() => { if (!query.trim()) setSearchOpen(false); }}
              placeholder="Buscar lomos, burgers…"
              className="w-full bg-surface2 rounded-xl pl-8 pr-8 py-2 text-xs ph-muted outline-none focus-gold c-cream"
            />
            <button
              onClick={() => { setQuery(""); setSearchOpen(false); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 c-muted"
              aria-label="Cerrar búsqueda"
            >
              <X size={13} />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setSearchOpen(true)}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "#171a24", border: "1px solid #232735" }}
            aria-label="Buscar"
          >
            <Search size={15} className="c-tan2" />
          </button>
        )}

        {!query.trim() && (
          <div className="hidden lg:flex items-center gap-1 text-[11px]">
            <span className="px-3 py-2 rounded-lg font-bold" style={{ background: "#f2b705", color: "#0c0e16" }}>MENÚ CARTA</span>
            <a href="#promos" className="px-3 py-2 rounded-lg font-bold c-tan2">COMBOS &amp; PROMOS</a>
            <button onClick={() => setLookupOpen(true)} className="px-3 py-2 rounded-lg font-bold c-tan2">ESTADO DE PEDIDO</button>
          </div>
        )}

        <div className="flex items-center gap-2 shrink-0 ml-auto">
          <a
            href={`https://wa.me/${catalog.settings.whatsapp}`}
            target="_blank" rel="noreferrer"
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl leading-tight"
            style={{ background: "#171a24", color: "#d1d5db", border: "1px solid #232735" }}
          >
            <WhatsAppIcon size={18} />
            <span>
              <span className="block text-[8px] tracking-[0.1em] c-muted">WHATSAPP DIRECTO</span>
              <span className="block text-[11px] font-bold c-cream">{catalog.settings.phoneDisplay}</span>
            </span>
          </a>
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex flex-col items-start gap-0.5 px-3 pt-2.5 pb-1.5 rounded-xl text-[10px] font-bold leading-tight"
            style={{ background: "#f2b705", color: "#0c0e16" }}
          >
            <span className="flex items-center gap-1.5">
              <span className="relative flex items-center justify-center w-4 h-4">
                <ShoppingBag size={14} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 rounded-full flex items-center justify-center text-[7px]" style={{ background: "#0c0e16", color: "#f2b705" }}>{cartCount}</span>
                )}
              </span>
              CARRITO
            </span>
            {cartCount > 0 && <span className="font-mono-t text-[11px]">{money(cartTotal)}</span>}
          </button>
          <button
            onClick={onGoAdmin}
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{ background: "#171a24", color: "#d1d5db", border: "1px solid #232735" }}
            aria-label="Panel del local"
          >
            <User size={15} />
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero */}
        {!query.trim() && (
          <div className="grid lg:grid-cols-2 gap-8 items-center py-8">
            <div className="min-w-0">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: "#171a24", color: "#f2b705" }}>{catalog.settings.heroBadgeText}</span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold" style={{ background: "#171a24", color: "#f87171" }}>🌶 {catalog.settings.accentNote}</span>
              </div>
              <h1 className="font-display text-2xl sm:text-3xl lg:text-4xl leading-[1.15] break-words c-cream">
                {catalog.settings.heroHeadlinePre}{" "}
                <span className="c-gold">{catalog.settings.heroHeadlineHighlight}</span>{" "}
                {catalog.settings.heroHeadlinePost}
              </h1>
              <p className="c-tan2 text-sm mt-4 max-w-md leading-relaxed">
                {catalog.settings.heroSubtitle?.trim()
                  ? catalog.settings.heroSubtitle
                  : (heroItem && heroItem.desc ? heroItem.desc : "Carnes premium a la plancha, papas rústicas doradas y el sabor callejero nocturno de Salta, directo a tu puerta.")}
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <button
                  onClick={() => heroItem && setPickItem(heroItem)}
                  className="flex items-center gap-2 px-5 py-3 rounded-xl font-display text-sm"
                  style={{ background: "#f2b705", color: "#0c0e16" }}
                >
                  <ShoppingBag size={16} /> PEDIR AHORA {heroPrice ? `· ${money(heroPrice)}` : ""}
                </button>
                {catalog.promotions && catalog.promotions.length > 0 && (
                  <a href="#promos" className="flex items-center gap-2 px-5 py-3 rounded-xl font-display text-sm" style={{ background: "#171a24", color: "#d1d5db" }}>
                    VER PROMOCIONES
                  </a>
                )}
              </div>
              <div className="flex items-center gap-1.5 mt-4 c-tan text-[11px]">
                <Timer size={13} className="c-gold" /> {catalog.settings.heroDeliveryNote}
              </div>
            </div>

            {heroPhoto && (
              <div
                className="relative rounded-2xl overflow-hidden aspect-[4/3] min-w-0"
                style={{ boxShadow: "0 30px 60px -25px rgba(0,0,0,0.75)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <img src={heroPhoto} alt={heroItem.name} className="absolute inset-0 w-full h-full object-cover" />
                {/* Soft edge vignette — helps any photo (bright or busy backgrounds included) blend into the dark page instead of cutting hard against it */}
                <div className="absolute inset-0 pointer-events-none" style={{ boxShadow: "inset 0 0 70px 12px rgba(5,6,10,0.55)" }} />
                <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(180deg, rgba(5,6,10,0.25) 0%, rgba(5,6,10,0) 25%, rgba(5,6,10,0) 70%, rgba(5,6,10,0.35) 100%)" }} />
                <span className="absolute top-3 right-3 px-3 py-1.5 rounded-lg text-right" style={{ background: "rgba(12,14,22,0.8)" }}>
                  <span className="block text-[9px] c-tan2 tracking-wide">ESPECIALIDAD</span>
                  <span className="block font-display text-sm c-gold">{heroItem.name}</span>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Promo carousel — admin-managed. Slides sit in a single flex track
            that slides via transform, so switching promos is a smooth glide
            instead of an instant cut. Each slide keeps its own blurred
            backdrop + "shown in full" sharp copy, and portrait media widens
            the frame's height so nothing gets cropped or shrunk illegibly. */}
        {!query.trim() && catalog.promotions && catalog.promotions.length > 0 && (() => {
          const promos = catalog.promotions;
          const current = promos[carouselIndex];
          const isPortrait = !!portraitMedia[current.id];
          const heightClass = isPortrait
            ? "h-[340px] sm:h-[420px] lg:h-[480px]"
            : "h-[210px] sm:h-[260px] lg:h-[320px]";
          return (
            <div id="promos" className="pb-8 scroll-mt-20">
              <div
                className={`group relative rounded-3xl overflow-hidden transition-[height] duration-300 ${heightClass}`}
                style={{ boxShadow: "0 20px 40px -20px rgba(0,0,0,0.6)", border: "1px solid #232735" }}
                onMouseEnter={() => setCarouselPaused(true)}
                onMouseLeave={() => setCarouselPaused(false)}
                onTouchStart={handleCarouselTouchStart}
                onTouchEnd={(e) => handleCarouselTouchEnd(e, promos.length)}
              >
                <div
                  className="flex h-full transition-transform duration-500 ease-out"
                  style={{ width: `${promos.length * 100}%`, transform: `translateX(-${carouselIndex * (100 / promos.length)}%)` }}
                >
                  {promos.map((p, i) => {
                    const hasMedia = !!(p.image || p.video);
                    return (
                      <div key={p.id} className="relative h-full shrink-0" style={{ width: `${100 / promos.length}%`, background: hasMedia ? "#05060a" : "linear-gradient(135deg, #f2b705, #ea580c)" }}>
                        {hasMedia && (
                          <>
                            {/* Blurred backdrop copy — fills the frame with the promo's own colors */}
                            {p.video ? (
                              <video src={p.video} muted autoPlay={i === carouselIndex} loop playsInline className="absolute inset-0 w-full h-full" style={{ objectFit: "cover", filter: "blur(20px) brightness(0.65) saturate(1.5)", transform: "scale(1.15)" }} />
                            ) : (
                              <img src={p.image} alt="" className="absolute inset-0 w-full h-full" style={{ objectFit: "cover", filter: "blur(20px) brightness(0.65) saturate(1.5)", transform: "scale(1.15)" }} />
                            )}
                            {/* Sharp copy, shown in full — never cropped, subtle zoom on hover */}
                            {p.video ? (
                              <video
                                src={p.video}
                                muted
                                autoPlay={i === carouselIndex}
                                loop
                                playsInline
                                className="absolute inset-0 w-full h-full transition-transform duration-[4s] ease-out group-hover:scale-105"
                                style={{ objectFit: "contain" }}
                                onLoadedMetadata={(e) => handleMediaLoadedSize(p.id, e.target.videoWidth, e.target.videoHeight)}
                              />
                            ) : (
                              <img
                                src={p.image}
                                alt=""
                                className="absolute inset-0 w-full h-full transition-transform duration-[4s] ease-out group-hover:scale-105"
                                style={{ objectFit: "contain" }}
                                onLoad={(e) => handleMediaLoadedSize(p.id, e.target.naturalWidth, e.target.naturalHeight)}
                              />
                            )}
                          </>
                        )}

                        {!p.mediaHasText && (
                          <div className="relative p-4 sm:p-6 flex flex-col justify-end h-full" style={hasMedia ? { background: "linear-gradient(0deg, rgba(5,6,10,0.8), rgba(5,6,10,0.05) 60%)" } : undefined}>
                            <span
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold mb-2 self-start tracking-wide"
                              style={hasMedia
                                ? { background: "rgba(242,183,5,0.15)", color: "#f2b705", border: "1px solid rgba(242,183,5,0.4)", backdropFilter: "blur(4px)" }
                                : { background: "rgba(12,14,22,0.15)", color: "#0c0e16", border: "1px solid rgba(12,14,22,0.35)" }}
                            >
                              <Flame size={12} /> PROMO
                            </span>
                            <div
                              className="font-display text-2xl sm:text-3xl leading-tight"
                              style={{ color: hasMedia ? "#ffffff" : "#0c0e16" }}
                            >
                              {p.title}
                            </div>
                            {p.subtitle && (
                              <div
                                className="text-xs sm:text-sm mt-1"
                                style={{ color: hasMedia ? "#d1d5db" : "#422006" }}
                              >
                                {p.subtitle}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {promos.length > 1 && (
                  <>
                    <button
                      onClick={() => setCarouselIndex((i) => (i - 1 + promos.length) % promos.length)}
                      aria-label="Promoción anterior"
                      className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:scale-110"
                      style={{ background: "rgba(12,14,22,0.55)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.15)" }}
                    >
                      <ChevronRight size={17} color="#ffffff" style={{ transform: "rotate(180deg)" }} />
                    </button>
                    <button
                      onClick={() => setCarouselIndex((i) => (i + 1) % promos.length)}
                      aria-label="Siguiente promoción"
                      className="absolute right-3 top-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full flex items-center justify-center opacity-70 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:scale-110"
                      style={{ background: "rgba(12,14,22,0.55)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.15)" }}
                    >
                      <ChevronRight size={17} color="#ffffff" />
                    </button>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
                      {promos.map((p, i) => (
                        <button
                          key={p.id}
                          onClick={() => setCarouselIndex(i)}
                          aria-label={`Ir a la promoción ${i + 1}`}
                          className="relative h-1.5 rounded-full overflow-hidden transition-all duration-300"
                          style={{ width: i === carouselIndex ? 28 : 6, background: "rgba(255,255,255,0.25)" }}
                        >
                          {i === carouselIndex && (
                            <span
                              key={`${p.id}-fill`}
                              className="absolute inset-0 rounded-full origin-left"
                              style={{
                                background: "#f2b705",
                                animation: "promoProgress 5s linear forwards",
                                animationPlayState: carouselPaused ? "paused" : "running",
                              }}
                            />
                          )}
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          );
        })()}

        {/* Category rail */}
        {!query.trim() && (
          <div className="sticky top-[57px] z-10 no-scrollbar overflow-x-auto flex gap-2 py-3 mb-4" style={{ background: "#0c0e16", borderBottom: "1px solid #171a24" }}>
            <button
              onClick={() => setActiveCat("__all__")}
              className="shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors"
              style={{ background: showAll ? "#f2b705" : "#171a24", color: showAll ? "#0c0e16" : "#d1d5db" }}
            >
              <Utensils size={12} /> Todos
            </button>
            {catalog.categories.map((c) => (
              <button
                key={c.id}
                ref={(el) => (railRefs.current[c.id] = el)}
                onClick={() => setActiveCat(c.id)}
                className="shrink-0 px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors"
                style={{
                  background: !showAll && activeCat === c.id ? "#f2b705" : "#171a24",
                  color: !showAll && activeCat === c.id ? "#0c0e16" : "#d1d5db",
                }}
              >
                <span className="mr-1">{c.emoji}</span>{c.name}
              </button>
            ))}
          </div>
        )}

        {/* Items + order sidebar */}
        <div className="grid lg:grid-cols-[1fr_340px] gap-8 items-start pb-6">
          <div className="min-w-0">
            {query.trim() ? (
              <>
                <div className="text-xs c-muted mb-3">{filteredItems.length} resultado(s) para "{query}"</div>
                <div className="space-y-3">
                  {filteredItems.map((item) => (
                    <ItemCard key={item.id + item.catName} item={item} onPick={() => setPickItem(item)} />
                  ))}
                </div>
              </>
            ) : showAll ? (
              catalog.categories.map((cat) => (
                <div key={cat.id} className="mb-8">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{cat.emoji}</span>
                    <h2 className="font-display text-xl c-cream">{cat.name}</h2>
                    <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "#171a24", color: "#9ca3af" }}>{cat.items.length} variedades</span>
                  </div>
                  <div className="space-y-3 mt-3">
                    {cat.items.map((item) => (
                      <ItemCard key={item.id} item={{ ...item, catId: cat.id }} onPick={() => setPickItem({ ...item, catId: cat.id })} />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xl">{activeCategory.emoji}</span>
                  <h2 className="font-display text-xl c-cream">{activeCategory.name}</h2>
                  <span className="text-[10px] font-bold px-2 py-1 rounded-full" style={{ background: "#171a24", color: "#9ca3af" }}>{activeCategory.items.length} variedades</span>
                </div>
                <div className="space-y-3 mt-3">
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
              style={{ background: "#171a24", color: "#d1d5db" }}
            >
              <Search size={12} /> Ya hice un pedido, quiero ver su estado
            </button>

            <button
              onClick={onGoAdmin}
              className="w-full mt-2 py-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              style={{ background: "transparent", border: "1px dashed #232735", color: "#9ca3af" }}
            >
              <Lock size={12} /> ¿Sos parte del local? Ingresá al panel administrador
            </button>
          </div>

          {/* Desktop persistent order sidebar */}
          <div className="hidden lg:block sticky top-[120px]">
            <OrderSidebar
              cart={cart}
              total={cartTotal}
              mode={orderMode}
              onModeChange={setOrderMode}
              onChangeQty={changeQty}
              onRemove={removeLine}
              onCheckout={() => setCheckoutOpen(true)}
            />
          </div>
        </div>
      </div>

      {/* Floating cart bar — mobile/tablet only, desktop uses the sidebar */}
      {cartCount > 0 && !drawerOpen && (
        <button
          onClick={() => setDrawerOpen(true)}
          className="lg:hidden fixed bottom-4 left-4 right-4 max-w-md mx-auto rounded-2xl px-5 py-3.5 flex items-center justify-between shadow-2xl z-30"
          style={{ background: "#f2b705" }}
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
          className="lg:hidden fixed left-4 right-4 max-w-md mx-auto rounded-2xl px-5 py-3 flex items-center justify-between shadow-2xl z-30"
          style={{ bottom: cartCount > 0 ? "5.75rem" : "1rem", background: "#11131b", border: "1px solid #f2b705" }}
        >
          <div className="flex items-center gap-2 c-cream font-bold text-sm">
            <Package size={16} className="c-gold" />
            Pedido #{myOrder.shortCode}
          </div>
          <div className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ background: (ORDER_STATUSES.find((s) => s.id === myOrder.status) || ORDER_STATUSES[0]).color, color: "#0c0e16" }}>
            {(ORDER_STATUSES.find((s) => s.id === myOrder.status) || ORDER_STATUSES[0]).label}
          </div>
        </button>
      )}

      {/* Item picker modal */}
      {pickItem && (
        <ItemModal item={pickItem} catalog={catalog} onClose={() => setPickItem(null)} onAdd={addLine} />
      )}

      {/* Cart drawer — mobile/tablet only */}
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
          initialMode={orderMode}
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

function OrderSidebar({ cart, total, mode, onModeChange, onChangeQty, onRemove, onCheckout }) {
  const count = cart.reduce((s, l) => s + l.qty, 0);
  return (
    <div className="rounded-2xl overflow-hidden" style={{ background: "#11131b", border: "1px solid #171a24" }}>
      <div className="p-4 pb-3 flex items-center justify-between" style={{ borderBottom: "1px solid #171a24" }}>
        <div>
          <div className="font-display text-base c-cream flex items-center gap-1.5"><ShoppingBag size={15} className="c-gold" /> Tu pedido</div>
          <div className="text-[11px] c-tan mt-0.5">{count} item{count === 1 ? "" : "s"} agregado{count === 1 ? "" : "s"}</div>
        </div>
        {cart.length > 0 && (
          <button onClick={() => cart.forEach((l) => onRemove(l.lineId))} className="text-[11px] font-bold c-tan hover:c-gold">Vaciar</button>
        )}
      </div>

      <div className="p-3 flex gap-2">
        <button
          onClick={() => onModeChange("delivery")}
          className="flex-1 py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1"
          style={{ background: mode === "delivery" ? "#f2b705" : "#171a24", color: mode === "delivery" ? "#0c0e16" : "#d1d5db" }}
        >
          Delivery
        </button>
        <button
          onClick={() => onModeChange("pickup")}
          className="flex-1 py-2 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1"
          style={{ background: mode === "pickup" ? "#f2b705" : "#171a24", color: mode === "pickup" ? "#0c0e16" : "#d1d5db" }}
        >
          Retiro en Local
        </button>
      </div>

      {cart.length === 0 ? (
        <div className="px-4 pb-5 text-xs c-muted">Todavía no agregaste nada.</div>
      ) : (
        <div className="px-4 max-h-[320px] overflow-y-auto space-y-3 pb-3">
          {cart.map((l) => (
            <div key={l.lineId} className="pb-3" style={{ borderBottom: "1px solid #171a24" }}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className="font-bold c-cream text-[13px] truncate">{l.name}{l.variantLabel ? ` (${l.variantLabel})` : ""}</div>
                  {l.note && <div className="text-[10px] c-muted truncate">{l.note}</div>}
                  <div className="font-mono-t c-gold text-[12px] mt-0.5">{money(l.price * l.qty)}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button onClick={() => onChangeQty(l.lineId, -1)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#171a24" }}>
                    <Minus size={11} className="c-tan2" />
                  </button>
                  <span className="w-4 text-center text-xs font-bold c-cream">{l.qty}</span>
                  <button onClick={() => onChangeQty(l.lineId, 1)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#171a24" }}>
                    <Plus size={11} className="c-tan2" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-4 pt-3" style={{ borderTop: "1px solid #171a24" }}>
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs c-tan">Total</span>
          <span className="font-mono-t text-lg font-bold c-gold">{money(total)}</span>
        </div>
        <button
          disabled={cart.length === 0}
          onClick={onCheckout}
          className="w-full py-3 rounded-xl font-display text-sm disabled:opacity-40"
          style={{ background: "#f2b705", color: "#0c0e16" }}
        >
          Continuar pedido
        </button>
      </div>
    </div>
  );
}

function InfoStrip({ title, list }) {
  return (
    <div className="mt-5 mb-2 p-3.5 rounded-xl" style={{ background: "#171a24", border: "1px dashed #232735" }}>
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
        className="w-full text-left rounded-2xl overflow-hidden flex gap-3 p-3"
        style={{ background: "#0c0e16", border: "1px solid #171a24", opacity: 0.55 }}
      >
        {photo && <img src={photo} alt="" className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover grayscale shrink-0" />}
        <div className="min-w-0 flex-1 py-1">
          <div className="font-bold c-tan text-[15px] line-through">{item.name}</div>
          {item.desc && <div className="text-[12px] c-muted mt-0.5 leading-snug line-clamp-2">{item.desc}</div>}
          <div className="text-[11px] font-bold mt-2" style={{ color: "#dc2626" }}>No disponible hoy</div>
        </div>
      </div>
    );
  }

  // Horizontal list card: image on the left, details + price on the right,
  // matching the desktop menu layout. Items without a photo skip the image
  // slot instead of showing an empty tile.
  return (
    <button
      onClick={onPick}
      className="w-full text-left rounded-2xl overflow-hidden flex gap-3 sm:gap-4 p-3 transition-transform active:scale-[0.98] hover:brightness-110"
      style={{ background: "#11131b", border: "1px solid #171a24" }}
    >
      {photo && <img src={photo} alt={item.name} className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover shrink-0" />}
      <div className="min-w-0 flex-1 flex flex-col py-0.5">
        <div className="flex items-start justify-between gap-2">
          <div className="font-bold c-cream text-[15px] leading-snug min-w-0 break-words">{item.name}</div>
          <span className="font-mono-t c-gold font-bold text-sm shrink-0">
            {hasVariants ? `desde ${money(displayPrice)}` : money(displayPrice)}
          </span>
        </div>
        {item.desc && <div className="text-[12px] c-tan mt-1 leading-snug line-clamp-2">{item.desc}</div>}
        <div className="mt-auto pt-2 flex items-center justify-end">
          <span className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: "#f2b705", color: "#0c0e16" }}>
            <Plus size={13} strokeWidth={2.5} /> Agregar
          </span>
        </div>
      </div>
    </button>
  );
}

function ModifierGroupPicker({ groups, selected, onToggle }) {
  return (
    <>
      {groups.map((group) => (
        <div className="mb-4" key={group.id}>
          <div className="text-xs font-bold c-gold mb-2">
            <span className="mr-1">{group.emoji}</span>{group.name} (opcional, elegí los que quieras)
          </div>
          <div className="flex gap-1.5 flex-wrap max-h-32 overflow-y-auto pr-1">
            {group.options.map((opt) => (
              <button
                key={opt}
                onClick={() => onToggle(group.id, opt)}
                className={`chip px-3 py-1.5 rounded-full text-[11px] font-bold ${(selected[group.id] || []).includes(opt) ? "active" : ""}`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      ))}
    </>
  );
}

function ItemModal({ item, catalog, onClose, onAdd }) {
  const [variant, setVariant] = useState(item.variants ? item.variants[0] : null);
  const [qty, setQty] = useState(1);
  const [splitMode, setSplitMode] = useState(false);
  const [selectedByGroup, setSelectedByGroup] = useState({}); // whole-item mode: { [groupId]: string[] }
  const [half1Selected, setHalf1Selected] = useState({});
  const [half2Selected, setHalf2Selected] = useState({});
  const [platoGuarnicion, setPlatoGuarnicion] = useState(null);
  const [proteinChoice, setProteinChoice] = useState(null);
  const [extraNote, setExtraNote] = useState("");
  const price = variant ? variant.price : item.price;

  const activeGroups = (catalog.modifierGroups || []).filter((g) => (item.modifierGroupIds || []).includes(g.id));
  const canSplit = activeGroups.length > 0 && !item.requiresGuarnicion;

  function toggleOption(groupId, option) {
    setSelectedByGroup((prev) => {
      const current = prev[groupId] || [];
      const next = current.includes(option) ? current.filter((x) => x !== option) : [...current, option];
      return { ...prev, [groupId]: next };
    });
  }
  function toggleHalfOption(half, groupId, option) {
    const setter = half === 1 ? setHalf1Selected : setHalf2Selected;
    setter((prev) => {
      const current = prev[groupId] || [];
      const next = current.includes(option) ? current.filter((x) => x !== option) : [...current, option];
      return { ...prev, [groupId]: next };
    });
  }

  function groupsNote(sel) {
    return activeGroups
      .map((g) => (sel[g.id] && sel[g.id].length ? `${g.name}: ${sel[g.id].join(", ")}` : ""))
      .filter(Boolean)
      .join(" · ");
  }

  const note = splitMode
    ? [
        "Dividido en 2 mitades",
        proteinChoice ? `Tipo: ${proteinChoice}` : "",
        `Mitad 1${groupsNote(half1Selected) ? " — " + groupsNote(half1Selected) : ""}`,
        `Mitad 2${groupsNote(half2Selected) ? " — " + groupsNote(half2Selected) : ""}`,
        platoGuarnicion ? `Guarnición: ${platoGuarnicion}` : "",
        extraNote.trim(),
      ].filter(Boolean).join(" · ")
    : [
        proteinChoice ? `Tipo: ${proteinChoice}` : "",
        groupsNote(selectedByGroup),
        platoGuarnicion ? `Guarnición: ${platoGuarnicion}` : "",
        extraNote.trim(),
      ].filter(Boolean).join(" · ");

  const canAdd = (!item.requiresGuarnicion || !!platoGuarnicion) && (!item.proteinChoices || !!proteinChoice);
  const photo = item.image || PRODUCT_IMAGES[item.id];

  return (
    <div className="fixed inset-0 z-40 flex items-end sm:items-center justify-center" style={{ background: "rgba(10,7,5,0.7)" }} onClick={onClose}>
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden max-h-[85vh] flex flex-col"
        style={{ background: "#11131b" }}
      >
        {photo && (
          <img src={photo} alt={item.name} className="w-full h-44 object-cover shrink-0" />
        )}
        <div className="p-5 overflow-y-auto">
        <div className="flex justify-between items-start mb-1">
          <h3 className="font-display text-xl c-cream pr-4">{item.name}</h3>
          <button onClick={onClose} className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#171a24" }}>
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
                    background: variant.label === v.label ? "#f2b705" : "#171a24",
                    color: variant.label === v.label ? "#0c0e16" : "#d1d5db",
                  }}
                >
                  {v.label} · {money(v.price)}
                </button>
              ))}
            </div>
          </div>
        )}

        {item.proteinChoices && (
          <div className="mb-4">
            <div className="text-xs font-bold c-gold mb-2">Elegí el tipo (obligatorio)</div>
            <div className="flex gap-1.5 flex-wrap">
              {item.proteinChoices.map((p) => (
                <button
                  key={p}
                  onClick={() => setProteinChoice(p)}
                  className={`chip px-3 py-1.5 rounded-full text-[11px] font-bold ${proteinChoice === p ? "active" : ""}`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}

        {item.requiresGuarnicion && (
          <div className="mb-4">
            <div className="text-xs font-bold c-gold mb-2">Elegí tu guarnición (obligatorio)</div>
            <div className="flex gap-1.5 flex-wrap">
              {catalog.platoGuarniciones.filter((g) => g.active !== false).map((g) => (
                <button
                  key={g.label}
                  onClick={() => setPlatoGuarnicion(g.label)}
                  className={`chip px-3 py-1.5 rounded-full text-[11px] font-bold ${platoGuarnicion === g.label ? "active" : ""}`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {canSplit && (
          <div className="mb-4">
            <div className="flex gap-2">
              <button
                onClick={() => setSplitMode(false)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                style={{ background: !splitMode ? "#f2b705" : "#171a24", color: !splitMode ? "#0c0e16" : "#d1d5db" }}
              >
                📖 Entero igual
              </button>
              <button
                onClick={() => setSplitMode(true)}
                className="flex-1 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
                style={{ background: splitMode ? "#f2b705" : "#171a24", color: splitMode ? "#0c0e16" : "#d1d5db" }}
              >
                ✂️ Dividir en 2
              </button>
            </div>
          </div>
        )}

        {!splitMode && activeGroups.length > 0 && (
          <ModifierGroupPicker groups={activeGroups} selected={selectedByGroup} onToggle={toggleOption} />
        )}

        {splitMode && (
          <>
            <div className="mb-2">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold chip active">1️⃣ Mitad 1</span>
            </div>
            <ModifierGroupPicker groups={activeGroups} selected={half1Selected} onToggle={(g, o) => toggleHalfOption(1, g, o)} />
            <div className="mb-2 mt-1">
              <span className="inline-block px-3 py-1 rounded-full text-[11px] font-bold chip active">2️⃣ Mitad 2</span>
            </div>
            <ModifierGroupPicker groups={activeGroups} selected={half2Selected} onToggle={(g, o) => toggleHalfOption(2, g, o)} />
          </>
        )}

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
          <p className="text-[11px] mb-2 text-center" style={{ color: "#dc2626" }}>Elegí una guarnición para poder agregar este plato.</p>
        )}
        {item.proteinChoices && !proteinChoice && (
          <p className="text-[11px] mb-2 text-center" style={{ color: "#dc2626" }}>Elegí el tipo (carne, pollo o cerdo) para poder agregar.</p>
        )}
        <button
          onClick={() => canAdd && onAdd(item, variant, qty, note)}
          disabled={!canAdd}
          className="w-full py-3.5 rounded-2xl font-display text-base flex items-center justify-center gap-2 disabled:opacity-40"
          style={{ background: "#f2b705", color: "#0c0e16" }}
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
        style={{ background: "#ffffff", color: "#0c0e16" }}
      >
        <div className="p-5 pb-3 flex items-center justify-between">
          <h3 className="font-display text-xl flex items-center gap-2"><ShoppingBag size={18} /> Tu pedido</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#f3f4f6" }}>
            <X size={16} />
          </button>
        </div>

        {cart.length === 0 ? (
          <div className="px-5 pb-8 text-sm c-muted2">Todavía no agregaste nada.</div>
        ) : (
          <div className="flex-1 overflow-y-auto px-5 font-mono-t text-sm">
            {cart.map((l) => (
              <div key={l.lineId} className="py-3 flex items-start justify-between gap-2" style={{ borderBottom: "1px dashed #d1d5db" }}>
                <div className="flex-1 min-w-0">
                  <div className="font-bold">{l.name}{l.variantLabel ? ` (${l.variantLabel})` : ""}</div>
                  {l.note && <div className="text-[11px] c-muted2">{l.note}</div>}
                  <div className="flex items-center gap-2 mt-1.5">
                    <button onClick={() => onChangeQty(l.lineId, -1)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#f3f4f6" }}>
                      <Minus size={12} />
                    </button>
                    <span className="w-4 text-center font-bold">{l.qty}</span>
                    <button onClick={() => onChangeQty(l.lineId, 1)} className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "#f3f4f6" }}>
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

        <div className="p-5 pt-3 ticket-edge" style={{ borderTop: "2px dashed #d1d5db" }}>
          <div className="flex justify-between items-center mb-4 font-mono-t">
            <span className="text-sm c-muted2">Total</span>
            <span className="text-xl font-bold">{money(total)}</span>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={onCheckout}
            className="w-full py-3.5 rounded-2xl font-display text-base disabled:opacity-40"
            style={{ background: "#0c0e16", color: "#f2b705" }}
          >
            Continuar pedido
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckoutModal({ total, initialMode, onClose, onSubmit }) {
  const [mode, setMode] = useState(initialMode || "pickup");
  const [payment, setPayment] = useState("efectivo");

  useEffect(() => {
    if (mode === "delivery" && payment === "tarjeta") setPayment("efectivo");
  }, [mode, payment]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [sending, setSending] = useState(false);
  const [gpsLink, setGpsLink] = useState("");
  const [gpsStatus, setGpsStatus] = useState(""); // "" | "loading" | "ok" | "error"

  const canSubmit = name.trim() && phone.trim() && (mode === "pickup" || address.trim());

  function useMyLocation() {
    if (!navigator.geolocation) { setGpsStatus("error"); return; }
    setGpsStatus("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setGpsLink(`https://maps.google.com/?q=${latitude},${longitude}`);
        setGpsStatus("ok");
      },
      () => setGpsStatus("error"),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  async function submit() {
    if (!canSubmit || sending) return;
    setSending(true);
    await onSubmit({ mode, payment, name, phone, address, note, gpsLink });
    setSending(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(10,7,5,0.8)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-5 max-h-[90vh] overflow-y-auto" style={{ background: "#11131b" }}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-display text-xl c-cream">Confirmar pedido</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#171a24" }}>
            <X size={16} className="c-tan" />
          </button>
        </div>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode("pickup")}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: mode === "pickup" ? "#f2b705" : "#171a24", color: mode === "pickup" ? "#0c0e16" : "#d1d5db" }}
          >
            Retiro en local
          </button>
          <button
            onClick={() => setMode("delivery")}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: mode === "delivery" ? "#f2b705" : "#171a24", color: mode === "delivery" ? "#0c0e16" : "#d1d5db" }}
          >
            Delivery
          </button>
        </div>

        <div className="space-y-3 mb-5">
          <Field label="Tu nombre" value={name} onChange={setName} placeholder="Nombre y apellido" />
          <Field label="Teléfono" value={phone} onChange={setPhone} placeholder="Ej: 387 555 5555" />
          {mode === "delivery" && <Field label="Dirección de entrega" value={address} onChange={setAddress} placeholder="Calle, número, barrio" />}
          {mode === "delivery" && (
            <div>
              <button
                type="button"
                onClick={useMyLocation}
                className="text-xs font-bold flex items-center gap-1.5 mb-2"
                style={{ color: gpsStatus === "ok" ? "#22c55e" : "#f2b705" }}
              >
                <MapPin size={13} />
                {gpsStatus === "loading" ? "Buscando tu ubicación…" : gpsStatus === "ok" ? "Ubicación agregada — tocá para actualizar" : "Usar mi ubicación actual (GPS)"}
              </button>
              {gpsStatus === "error" && (
                <p className="text-[11px] mb-2" style={{ color: "#f87171" }}>No pudimos acceder a tu ubicación — no pasa nada, completá la dirección a mano.</p>
              )}
              <div className="p-3 rounded-xl text-xs flex items-start gap-2" style={{ background: "#171a24", color: "#d1d5db" }}>
                <span className="shrink-0">📍</span>
                <span>
                  {gpsStatus === "ok"
                    ? "Vas a mandar tu ubicación exacta junto con el pedido — igual, si la dirección de arriba tiene algún dato extra (piso, timbre, referencia), dejalo anotado."
                    : "Si preferís, además de la dirección podés compartirnos tu ubicación actual por WhatsApp después de enviar el pedido, para que el cadete llegue sin problemas."}
                </span>
              </div>
            </div>
          )}

          <div>
            <div className="text-[11px] font-bold c-gold mb-1.5">Forma de pago</div>
            <div className="flex gap-2">
              {[
                { id: "efectivo", label: "💵 Efectivo" },
                { id: "transferencia", label: "🏦 Transferencia" },
                ...(mode === "pickup" ? [{ id: "tarjeta", label: "💳 Tarjeta" }] : []),
              ].map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPayment(p.id)}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold"
                  style={{ background: payment === p.id ? "#f2b705" : "#171a24", color: payment === p.id ? "#0c0e16" : "#d1d5db" }}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {mode === "delivery" && (
              <p className="text-[11px] c-muted mt-1.5">Para delivery no aceptamos tarjeta — solo efectivo o transferencia.</p>
            )}
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
          style={{ background: "#f2b705", color: "#0c0e16" }}
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
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-3xl p-6 text-center" style={{ background: "#ffffff", color: "#0c0e16" }}>
        <div className="w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-4" style={{ background: "#22c55e" }}>
          <Check size={26} color="white" strokeWidth={3} />
        </div>
        <h3 className="font-display text-xl mb-1">¡Pedido enviado!</h3>
        <p className="text-sm c-muted2 mb-4">Pedido <span className="font-mono-t font-bold">#{order.shortCode}</span> confirmalo por WhatsApp para que el local lo empiece a preparar.</p>
        <button onClick={onTrack} className="w-full py-3 rounded-2xl font-display mb-2" style={{ background: "#0c0e16", color: "#f2b705" }}>
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
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6" style={{ background: "#ffffff", color: "#0c0e16" }}>
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-display text-xl">Pedido #{order.shortCode}</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#f3f4f6" }}>
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
                    style={{ background: done ? s.color : "#f3f4f6", color: done ? "#0c0e16" : "#9ca3af" }}
                  >
                    {done ? <Check size={13} strokeWidth={3} /> : idx + 1}
                  </div>
                  {idx < ORDER_STATUSES.length - 1 && (
                    <div style={{ width: 2, height: 22, background: idx < currentIdx ? s.color : "#f3f4f6" }} />
                  )}
                </div>
                <span className="font-bold text-sm pb-5" style={{ color: done ? "#0c0e16" : "#9ca3af" }}>{s.label}</span>
              </div>
            );
          })}
        </div>

        <div className="p-3.5 rounded-xl font-mono-t text-xs mb-4" style={{ background: "#f3f4f6" }}>
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
      <div onClick={(e) => e.stopPropagation()} className="w-full sm:max-w-sm rounded-t-3xl sm:rounded-3xl p-6" style={{ background: "#11131b" }}>
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
        {error && <p className="text-xs mb-3" style={{ color: "#f87171" }}>{error}</p>}

        <button
          onClick={search}
          disabled={searching}
          className="w-full py-3.5 rounded-2xl font-display text-base flex items-center justify-center gap-2 disabled:opacity-50 mt-2"
          style={{ background: "#f2b705", color: "#0c0e16" }}
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
  const [session, setSession] = useState(null); // Supabase session, when auth is available
  const [pinAuthed, setPinAuthed] = useState(false); // fallback when Supabase isn't configured
  const [checkingSession, setCheckingSession] = useState(authAvailable);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [signingIn, setSigningIn] = useState(false);
  const [tab, setTab] = useState("orders");
  const [unseenCount, setUnseenCount] = useState(0);
  const [toast, setToast] = useState(null);
  const seenIdsRef = useRef(null);
  const toastTimerRef = useRef(null);

  const authed = authAvailable ? !!session : pinAuthed;

  // Restore an existing login (e.g. after a page refresh) and keep it in
  // sync — Supabase persists the session in the browser on its own.
  useEffect(() => {
    if (!authAvailable) return;
    let active = true;
    getAdminSession().then((s) => {
      if (active) { setSession(s); setCheckingSession(false); }
    });
    const unsubscribe = onAdminAuthChange((s) => setSession(s));
    return () => { active = false; unsubscribe(); };
  }, []);

  async function submitLogin() {
    setError("");
    if (authAvailable) {
      if (!email.trim() || !password) { setError("Completá usuario y contraseña."); return; }
      setSigningIn(true);
      try {
        await adminSignIn(email.trim(), password);
      } catch (e) {
        setError(e && e.message === "Invalid login credentials" ? "Usuario o contraseña incorrectos." : (e.message || "No se pudo iniciar sesión."));
      }
      setSigningIn(false);
    } else {
      if (pin === ADMIN_PIN) setPinAuthed(true);
      else setError("PIN incorrecto");
    }
  }

  async function handleLogout() {
    if (authAvailable) await adminSignOut();
    setPinAuthed(false);
    onExit();
  }

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

  if (checkingSession) {
    return (
      <div className="min-h-[600px] flex items-center justify-center">
        <div className="c-gold text-sm animate-pulse">Verificando sesión…</div>
      </div>
    );
  }

  if (!authed) {
    return (
      <div className="min-h-[600px] flex items-center justify-center px-5">
        <div className="w-full max-w-xs">
          <div className="flex items-center gap-2 mb-6 justify-center">
            <Lock size={18} className="c-gold" />
            <span className="font-display text-xl">PANEL ADMIN</span>
          </div>

          {authAvailable ? (
            <>
              <input
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(""); }}
                type="email"
                placeholder="Email"
                autoComplete="username"
                className="w-full bg-surface2 rounded-xl px-4 py-3 outline-none focus-gold c-cream mb-3"
              />
              <input
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                type="password"
                placeholder="Contraseña"
                autoComplete="current-password"
                onKeyDown={(e) => e.key === "Enter" && submitLogin()}
                className="w-full bg-surface2 rounded-xl px-4 py-3 outline-none focus-gold c-cream mb-3"
              />
            </>
          ) : (
            <input
              value={pin}
              onChange={(e) => { setPin(e.target.value); setError(""); }}
              type="password"
              placeholder="PIN de acceso"
              onKeyDown={(e) => e.key === "Enter" && submitLogin()}
              className="w-full bg-surface2 rounded-xl px-4 py-3 text-center tracking-[0.3em] outline-none focus-gold c-cream mb-3"
            />
          )}

          {error && <p className="c-red text-xs text-center mb-3">{error}</p>}
          <button
            onClick={submitLogin}
            disabled={signingIn}
            className="w-full py-3 rounded-xl font-display disabled:opacity-50"
            style={{ background: "#f2b705", color: "#0c0e16" }}
          >
            {signingIn ? "Ingresando…" : "Ingresar"}
          </button>
          <button onClick={onExit} className="w-full py-3 mt-2 text-xs c-muted flex items-center justify-center gap-1">
            <ArrowLeft size={12} /> Volver a la tienda
          </button>
          {!authAvailable && (
            <p className="text-[10px] c-brown text-center mt-6">PIN de demo: {ADMIN_PIN} — esto es un modo sin base de datos conectada; configurá Supabase para tener login real.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pb-16 relative">
      {toast && (
        <div
          className="fixed top-4 left-4 right-4 max-w-md mx-auto z-50 rounded-2xl px-4 py-3.5 flex items-center gap-3 shadow-2xl cursor-pointer"
          style={{ background: "#22c55e" }}
          onClick={() => { setToast(null); openTab("orders"); }}
        >
          <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: "rgba(0,0,0,0.15)" }}>
            <Package size={17} color="white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-bold text-sm" style={{ color: "#052e12" }}>¡Nuevo pedido de {toast.customerName}!</div>
            <div className="text-xs" style={{ color: "#052e12" }}>{money(toast.total)} · Pedido #{toast.shortCode}</div>
          </div>
        </div>
      )}

      <div className="px-5 pt-6 pb-4 flex items-center justify-between" style={{ borderBottom: "1px solid #171a24" }}>
        <div className="flex items-center gap-2">
          <Utensils size={18} className="c-gold" />
          <span className="font-display text-lg">ADMIN · YO PANCHO</span>
        </div>
        <button onClick={handleLogout} className="text-xs c-tan flex items-center gap-1">
          <LogOut size={13} /> {authAvailable ? "Cerrar sesión" : "Salir"}
        </button>
      </div>

      <div className="flex gap-2 px-5 py-3">
        {[
          { id: "orders", label: "Pedidos", icon: Package },
          { id: "menu", label: "Menú", icon: Utensils },
          { id: "promos", label: "Promos", icon: Flame },
          { id: "settings", label: "Configuración", icon: Pencil },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => openTab(t.id)}
            className="relative flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold"
            style={{ background: tab === t.id ? "#f2b705" : "#171a24", color: tab === t.id ? "#0c0e16" : "#d1d5db" }}
          >
            <t.icon size={13} /> {t.label}
            {t.id === "orders" && unseenCount > 0 && (
              <span
                className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 rounded-full text-[10px] font-bold flex items-center justify-center"
                style={{ background: "#dc2626", color: "white" }}
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
        {tab === "promos" && <PromosPanel catalog={catalog} onSave={onSaveCatalog} />}
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
          <button onClick={() => setFilter("todos")} className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold" style={{ background: filter === "todos" ? "#f2b705" : "#171a24", color: filter === "todos" ? "#0c0e16" : "#d1d5db" }}>Todos</button>
          {ORDER_STATUSES.map((s) => (
            <button key={s.id} onClick={() => setFilter(s.id)} className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-bold" style={{ background: filter === s.id ? s.color : "#171a24", color: filter === s.id ? "#0c0e16" : "#d1d5db" }}>{s.label}</button>
          ))}
        </div>
        <button onClick={onRefresh} className="shrink-0 ml-2 w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#171a24" }}>
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
    <div className="rounded-2xl overflow-hidden" style={{ background: "#11131b", border: "1px solid #171a24" }}>
      <button onClick={() => setOpen((v) => !v)} className="w-full p-4 flex items-center justify-between text-left">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono-t font-bold text-sm">#{order.shortCode}</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold" style={{ background: status.color, color: "#0c0e16" }}>{status.label}</span>
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
          <div style={{ borderTop: "1px dashed #232735" }} className="pt-3 space-y-1.5 mb-3">
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
            {order.gpsLink && (
              <div>
                <a href={order.gpsLink} target="_blank" rel="noreferrer" className="underline c-gold">🗺️ Ver ubicación exacta en el mapa</a>
              </div>
            )}
            {order.note && <div>📝 {order.note}</div>}
          </div>
          <div className="flex gap-1.5 flex-wrap">
            {ORDER_STATUSES.map((s) => (
              <button
                key={s.id}
                onClick={() => onUpdateOrder(order.id, { status: s.id })}
                className="px-2.5 py-1.5 rounded-lg font-bold"
                style={{ background: order.status === s.id ? s.color : "#171a24", color: order.status === s.id ? "#0c0e16" : "#d1d5db" }}
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

function AdminPromptModal({ dialog, onClose }) {
  const [values, setValues] = useState(() => {
    const init = {};
    (dialog.fields || []).forEach((f) => { init[f.key] = f.defaultValue || ""; });
    return init;
  });

  function confirm() {
    if (dialog.fields) {
      for (const f of dialog.fields) {
        if (!f.optional && !String(values[f.key] || "").trim()) return;
      }
    }
    dialog.onConfirm(values);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-5" style={{ background: "rgba(10,7,5,0.8)" }} onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-sm rounded-3xl p-5" style={{ background: "#11131b", border: "1px solid #171a24" }}>
        <h3 className="font-display text-lg c-cream mb-1">{dialog.title}</h3>
        {dialog.message && <p className="text-xs c-tan mb-4">{dialog.message}</p>}
        {dialog.fields && dialog.fields.map((f, i) => (
          <div key={f.key} className="mb-3">
            {f.label && <div className="text-[11px] font-bold c-gold mb-1.5">{f.label}</div>}
            <input
              autoFocus={i === 0}
              value={values[f.key]}
              onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
              placeholder={f.placeholder}
              onKeyDown={(e) => e.key === "Enter" && confirm()}
              className="w-full bg-surface2 rounded-xl px-3.5 py-2.5 text-sm ph-muted outline-none focus-gold c-cream"
            />
          </div>
        ))}
        <div className="flex gap-2 mt-2">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-bold c-tan" style={{ background: "#171a24" }}>
            Cancelar
          </button>
          <button
            onClick={confirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold"
            style={{ background: dialog.danger ? "#dc2626" : "#f2b705", color: dialog.danger ? "#ffffff" : "#0c0e16" }}
          >
            {dialog.confirmLabel || "Aceptar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function MenuEditor({ catalog, onSave }) {
  const [local, setLocal] = useState(catalog);
  const [dirty, setDirty] = useState(false);
  const [openCat, setOpenCat] = useState(catalog.categories[0]?.id || null);
  const [groupsOpen, setGroupsOpen] = useState(false);
  const [platoGuarnOpen, setPlatoGuarnOpen] = useState(false);
  const [dialog, setDialog] = useState(null);

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
    setDialog({
      title: "Nuevo producto",
      fields: [{ key: "name", label: "Nombre", placeholder: "Nombre del producto" }],
      confirmLabel: "Agregar",
      onConfirm: ({ name }) => {
        patch({
          ...local,
          categories: local.categories.map((c) =>
            c.id !== catId ? c : { ...c, items: [...c.items, { id: uid(), name, price: 0 }] }
          ),
        });
      },
    });
  }

  function removeCategory(catId) {
    setDialog({
      title: "Eliminar categoría",
      message: "¿Eliminar esta categoría y todos sus productos? Esta acción no se puede deshacer.",
      confirmLabel: "Eliminar",
      danger: true,
      onConfirm: () => {
        patch({ ...local, categories: local.categories.filter((c) => c.id !== catId) });
      },
    });
  }

  function addCategory() {
    setDialog({
      title: "Nueva categoría",
      fields: [
        { key: "name", label: "Nombre", placeholder: "Ej: Empanadas" },
        { key: "emoji", label: "Emoji (opcional)", placeholder: "🥟", optional: true, defaultValue: "🍽️" },
      ],
      confirmLabel: "Crear",
      onConfirm: ({ name, emoji }) => {
        patch({ ...local, categories: [...local.categories, { id: uid(), name, emoji: emoji || "🍽️", items: [] }] });
      },
    });
  }

  function editCategoryEmoji(catId, currentEmoji) {
    setDialog({
      title: "Cambiar emoji de la categoría",
      fields: [{ key: "emoji", label: "Emoji", placeholder: "🍽️", defaultValue: currentEmoji || "🍽️" }],
      confirmLabel: "Guardar",
      onConfirm: ({ emoji }) => {
        patch({
          ...local,
          categories: local.categories.map((c) => (c.id !== catId ? c : { ...c, emoji })),
        });
      },
    });
  }

  function moveCategory(catId, direction) {
    const idx = local.categories.findIndex((c) => c.id === catId);
    const swapWith = idx + direction;
    if (idx === -1 || swapWith < 0 || swapWith >= local.categories.length) return;
    const next = [...local.categories];
    [next[idx], next[swapWith]] = [next[swapWith], next[idx]];
    patch({ ...local, categories: next });
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
    setDialog({
      title: "Nuevo grupo de personalización",
      fields: [
        { key: "name", label: "Nombre", placeholder: "Ej: Salsas" },
        { key: "emoji", label: "Emoji (opcional)", placeholder: "🍽️", optional: true, defaultValue: "🍽️" },
      ],
      confirmLabel: "Crear",
      onConfirm: ({ name, emoji }) => {
        saveGroupsNow([...(local.modifierGroups || []), { id: uid(), emoji: emoji || "🍽️", name, options: [] }]);
      },
    });
  }
  function removeModifierGroup(groupId) {
    setDialog({
      title: "Eliminar grupo",
      message: "¿Eliminar este grupo? Se quita de todos los productos que lo tengan asignado.",
      confirmLabel: "Eliminar",
      danger: true,
      onConfirm: () => {
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
      },
    });
  }
  function addOptionToGroup(groupId) {
    setDialog({
      title: "Nueva opción",
      fields: [{ key: "opt", label: "Nombre de la opción", placeholder: "Ej: Ketchup" }],
      confirmLabel: "Agregar",
      onConfirm: ({ opt }) => {
        saveGroupsNow(local.modifierGroups.map((g) => (g.id !== groupId ? g : { ...g, options: [...g.options, opt] })));
      },
    });
  }
  function removeOptionFromGroup(groupId, opt) {
    saveGroupsNow(local.modifierGroups.map((g) => (g.id !== groupId ? g : { ...g, options: g.options.filter((o) => o !== opt) })));
  }

  // Guarniciones de "Comida al Plato" — lista aparte, con toggle de
  // disponibilidad por opción (ej: sacar "Arroz" de noche sin borrarlo).
  async function savePlatoGuarnNow(next) {
    const nextCatalog = { ...local, platoGuarniciones: next };
    setLocal(nextCatalog);
    await onSave(nextCatalog);
    setDirty(false);
  }
  function addPlatoGuarnicion() {
    setDialog({
      title: "Nueva guarnición",
      fields: [{ key: "label", label: "Nombre", placeholder: "Ej: Ensalada rusa" }],
      confirmLabel: "Agregar",
      onConfirm: ({ label }) => {
        savePlatoGuarnNow([...(local.platoGuarniciones || []), { label, active: true }]);
      },
    });
  }
  function removePlatoGuarnicion(label) {
    savePlatoGuarnNow((local.platoGuarniciones || []).filter((g) => g.label !== label));
  }
  function togglePlatoGuarnicionActive(label) {
    savePlatoGuarnNow((local.platoGuarniciones || []).map((g) => (g.label !== label ? g : { ...g, active: g.active === false })));
  }

  return (
    <div className="pb-10">
      {dirty && (
        <div className="sticky top-0 z-10 -mx-5 px-5 py-2.5 mb-3 flex items-center justify-between" style={{ background: "#0c0e16", borderBottom: "1px solid #171a24" }}>
          <span className="text-xs c-gold">Tenés cambios sin guardar</span>
          <button onClick={save} className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold" style={{ background: "#f2b705", color: "#0c0e16" }}>
            <Save size={13} /> Guardar cambios
          </button>
        </div>
      )}

      <div className="mb-4 rounded-2xl overflow-hidden" style={{ background: "#11131b", border: "1px solid #171a24" }}>
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
              <div key={g.id} className="p-3 rounded-xl" style={{ background: "#171a24" }}>
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
            <button onClick={addModifierGroup} className="w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5" style={{ background: "#0c0e16", color: "#f2b705" }}>
              <PlusCircle size={13} /> Nuevo grupo
            </button>
          </div>
        )}
      </div>

      <div className="mb-4 rounded-2xl overflow-hidden" style={{ background: "#11131b", border: "1px solid #171a24" }}>
        <button onClick={() => setPlatoGuarnOpen((v) => !v)} className="w-full p-3.5 flex items-center justify-between">
          <span className="font-bold text-sm c-cream">🍽️ Guarniciones de Comida al Plato</span>
          <ChevronRight size={14} className="c-muted" style={{ transform: platoGuarnOpen ? "rotate(90deg)" : "none" }} />
        </button>
        {platoGuarnOpen && (
          <div className="px-3.5 pb-3.5 space-y-2">
            <p className="text-[11px] c-muted -mt-1 mb-1">
              Guarnición obligatoria a elección para los platos que la requieren. Apagá una opción puntual si por ahora no queda (ej: "Arroz" a la noche) sin borrarla.
            </p>
            {(local.platoGuarniciones || []).map((g) => (
              <div key={g.label} className="p-3 rounded-xl flex items-center justify-between gap-2" style={{ background: "#171a24" }}>
                <button
                  onClick={() => togglePlatoGuarnicionActive(g.label)}
                  className="flex-1 text-left text-xs font-bold"
                  style={{ color: g.active === false ? "#6b7280" : "#ffffff", textDecoration: g.active === false ? "line-through" : "none" }}
                >
                  {g.active === false ? "🚫" : "✅"} {g.label}
                </button>
                <button onClick={() => removePlatoGuarnicion(g.label)} className="shrink-0">
                  <Trash2 size={13} className="c-red" />
                </button>
              </div>
            ))}
            <button onClick={addPlatoGuarnicion} className="w-full py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5" style={{ background: "#0c0e16", color: "#f2b705" }}>
              <PlusCircle size={13} /> Nueva guarnición
            </button>
          </div>
        )}
      </div>

      {local.categories.map((cat, catIdx) => (
        <div key={cat.id} className="mb-3 rounded-2xl overflow-hidden" style={{ background: "#11131b", border: "1px solid #171a24" }}>
          <div className="p-3.5 flex items-center justify-between gap-1">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <button onClick={() => editCategoryEmoji(cat.id, cat.emoji)} className="shrink-0 text-lg leading-none">{cat.emoji}</button>
              <button onClick={() => setOpenCat(openCat === cat.id ? null : cat.id)} className="flex items-center gap-2 text-left flex-1 min-w-0">
                <span className="font-bold text-sm truncate">{cat.name}</span>
                <span className="text-[10px] c-muted shrink-0">({cat.items.length})</span>
              </button>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => moveCategory(cat.id, -1)} disabled={catIdx === 0} className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-30" style={{ background: "#171a24" }}>
                <ChevronRight size={12} className="c-tan" style={{ transform: "rotate(-90deg)" }} />
              </button>
              <button onClick={() => moveCategory(cat.id, 1)} disabled={catIdx === local.categories.length - 1} className="w-7 h-7 rounded-full flex items-center justify-center disabled:opacity-30" style={{ background: "#171a24" }}>
                <ChevronRight size={12} className="c-tan" style={{ transform: "rotate(90deg)" }} />
              </button>
              <button onClick={() => removeCategory(cat.id)} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: "#171a24" }}>
                <Trash2 size={12} className="c-red" />
              </button>
            </div>
          </div>

          {openCat === cat.id && (
            <div className="px-3.5 pb-3.5 space-y-2">
              {cat.items.map((item) => (
                <div key={item.id} className="p-3 rounded-xl" style={{ background: "#171a24" }}>
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
                    <label className="text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer" style={{ background: "#0c0e16", color: "#f2b705" }}>
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
                            style={{ background: on ? "#f2b705" : "#0c0e16", color: on ? "#0c0e16" : "#6b7280" }}
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
                      background: item.active === false ? "#450a0a" : "#14532d",
                      color: item.active === false ? "#f87171" : "#4ade80",
                    }}
                  >
                    {item.active === false ? "🚫 Agotado hoy — tocá para reactivar" : "✅ Disponible — tocá para marcar agotado"}
                  </button>
                </div>
              ))}
              <button onClick={() => addItem(cat.id)} className="w-full py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5" style={{ background: "#0c0e16", color: "#f2b705" }}>
                <PlusCircle size={13} /> Agregar producto
              </button>
            </div>
          )}
        </div>
      ))}

      <button onClick={addCategory} className="w-full py-3 rounded-2xl text-sm font-bold flex items-center justify-center gap-1.5 mt-2" style={{ background: "#171a24", color: "#f2b705" }}>
        <PlusCircle size={15} /> Nueva categoría
      </button>

      {dialog && <AdminPromptModal dialog={dialog} onClose={() => setDialog(null)} />}
    </div>
  );
}

function PromosPanel({ catalog, onSave }) {
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState(null);
  const [uploadError, setUploadError] = useState("");

  async function addPromo() {
    if (!title.trim() || saving) return;
    setSaving(true);
    const next = {
      ...catalog,
      promotions: [...(catalog.promotions || []), { id: uid(), title: title.trim(), subtitle: subtitle.trim(), image: null, video: null }],
    };
    await onSave(next);
    setTitle("");
    setSubtitle("");
    setSaving(false);
  }

  async function removePromo(id) {
    const next = { ...catalog, promotions: (catalog.promotions || []).filter((p) => p.id !== id) };
    await onSave(next);
  }

  async function setPromoField(id, field, value) {
    const next = {
      ...catalog,
      promotions: (catalog.promotions || []).map((p) => (p.id !== id ? p : { ...p, [field]: value })),
    };
    await onSave(next);
  }

  function compressImageToDataUrl(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const MAXW = 1000, MAXH = 500;
          const scale = Math.min(1, MAXW / img.width, MAXH / img.height);
          const w = Math.round(img.width * scale);
          const h = Math.round(img.height * scale);
          const canvas = document.createElement("canvas");
          canvas.width = w;
          canvas.height = h;
          canvas.getContext("2d").drawImage(img, 0, 0, w, h);
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        };
        img.onerror = reject;
        img.src = reader.result;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleImageFile(id, file) {
    if (!file) return;
    setUploadError("");
    setUploadingId(id);
    try {
      if (fileStorageAvailable) {
        const url = await uploadMediaFile(file, "promos");
        await setPromoField(id, "image", url);
      } else {
        const dataUrl = await compressImageToDataUrl(file);
        await setPromoField(id, "image", dataUrl);
      }
    } catch (e) {
      setUploadError("No se pudo subir la foto: " + (e.message || e));
    }
    setUploadingId(null);
  }

  async function handleVideoFile(id, file) {
    if (!file) return;
    if (!fileStorageAvailable) return;
    if (file.size > 25 * 1024 * 1024) {
      setUploadError("El video es muy pesado (máximo 25MB) — probá recortarlo o comprimirlo antes de subirlo.");
      return;
    }
    setUploadError("");
    setUploadingId(id);
    try {
      const url = await uploadMediaFile(file, "promos");
      await setPromoField(id, "video", url);
    } catch (e) {
      setUploadError("No se pudo subir el video: " + (e.message || e));
    }
    setUploadingId(null);
  }

  const promos = catalog.promotions || [];

  return (
    <div className="pb-10">
      <p className="text-xs c-muted mb-4">
        La primera promo de la lista se muestra grande arriba de todo, en un carrusel que rota solo — las demás se ven al tocar los puntitos o las flechas.
        {fileStorageAvailable
          ? " Podés subirle una foto o un video de fondo (el video tiene prioridad si cargás los dos)."
          : " Podés subirle una foto de fondo (para video hace falta tener conectado el almacenamiento de Supabase)."}
      </p>
      {uploadError && <p className="text-xs mb-4" style={{ color: "#f87171" }}>{uploadError}</p>}

      <div className="space-y-2.5 mb-5">
        {promos.map((p, idx) => (
          <div key={p.id} className="p-3.5 rounded-xl" style={{ background: "#11131b", border: "1px solid #171a24" }}>
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <div className="min-w-0">
                {idx === 0 && <span className="text-[9px] font-bold c-gold uppercase tracking-wide">★ Portada principal</span>}
                <div className="font-bold text-sm c-cream">🔥 {p.title}</div>
                {p.subtitle && <div className="text-xs c-tan mt-0.5">{p.subtitle}</div>}
              </div>
              <button onClick={() => removePromo(p.id)} className="shrink-0">
                <Trash2 size={13} className="c-red" />
              </button>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {p.video ? (
                <video src={p.video} muted className="w-20 h-11 rounded-lg object-cover shrink-0" />
              ) : p.image ? (
                <img src={p.image} alt="" className="w-20 h-11 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-20 h-11 rounded-lg shrink-0 flex items-center justify-center bg-dark c-muted text-[9px] text-center">sin media</div>
              )}

              <label className="text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer" style={{ background: "#0c0e16", color: "#f2b705" }}>
                {uploadingId === p.id ? "Subiendo…" : p.image ? "Cambiar foto" : "Subir foto"}
                <input type="file" accept="image/*" className="hidden" disabled={uploadingId === p.id} onChange={(e) => handleImageFile(p.id, e.target.files && e.target.files[0])} />
              </label>

              {fileStorageAvailable && (
                <label className="text-[11px] font-bold px-3 py-1.5 rounded-lg cursor-pointer" style={{ background: "#0c0e16", color: "#f2b705" }}>
                  {uploadingId === p.id ? "Subiendo…" : p.video ? "Cambiar video" : "Subir video"}
                  <input type="file" accept="video/*" className="hidden" disabled={uploadingId === p.id} onChange={(e) => handleVideoFile(p.id, e.target.files && e.target.files[0])} />
                </label>
              )}

              {p.image && !p.video && (
                <button onClick={() => setPromoField(p.id, "image", null)} className="text-[11px] c-muted underline">Quitar foto</button>
              )}
              {p.video && (
                <button onClick={() => setPromoField(p.id, "video", null)} className="text-[11px] c-muted underline">Quitar video</button>
              )}
            </div>

            {(p.image || p.video) && (
              <label className="flex items-center gap-2 mt-2.5 text-[11px] c-tan cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!p.mediaHasText}
                  onChange={(e) => setPromoField(p.id, "mediaHasText", e.target.checked)}
                  className="rounded"
                />
                Esta imagen/video ya tiene el texto de la promo dibujado (no mostrar el título arriba)
              </label>
            )}
          </div>
        ))}
        {promos.length === 0 && (
          <p className="text-xs c-muted py-4 text-center">Todavía no cargaste ninguna promo.</p>
        )}
      </div>

      <div className="p-3.5 rounded-xl space-y-2.5" style={{ background: "#11131b", border: "1px solid #171a24" }}>
        <div className="text-xs font-bold c-gold">Nueva promo</div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Título (ej: 2 pizzas grandes por $22.000)"
          className="w-full bg-surface2 rounded-lg px-3 py-2.5 text-sm ph-muted outline-none focus-gold c-cream"
        />
        <input
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          placeholder="Detalle opcional (ej: válido de lunes a jueves)"
          className="w-full bg-surface2 rounded-lg px-3 py-2.5 text-sm ph-muted outline-none focus-gold c-cream"
        />
        <button
          onClick={addPromo}
          disabled={!title.trim() || saving}
          className="w-full py-2.5 rounded-lg text-xs font-bold disabled:opacity-40"
          style={{ background: "#f2b705", color: "#0c0e16" }}
        >
          + Agregar promo
        </button>
      </div>
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
      <Field label="Ciudad" value={s.city} onChange={(v) => set("city", v)} />
      <Field label="Bajada del logo (ej: Sandwiches · Burgers · Lomos)" value={s.storeTagline} onChange={(v) => set("storeTagline", v)} />
      <Field label="Horario (ej: 19:30 - 01:00)" value={s.storeHours} onChange={(v) => set("storeHours", v)} />

      <div className="pt-4 mt-4" style={{ borderTop: "1px solid #232735" }}>
        <div className="font-display text-sm c-cream mb-3">Portada (sección grande de arriba del menú)</div>
      </div>

      <div>
        <div className="text-[11px] font-bold c-gold mb-1.5">Producto destacado de la portada</div>
        <select
          value={s.heroFeaturedItemId || ""}
          onChange={(e) => set("heroFeaturedItemId", e.target.value)}
          className="w-full bg-surface2 rounded-xl px-3.5 py-2.5 text-sm outline-none focus-gold c-cream"
        >
          <option value="">Automático (el primer producto activo con foto)</option>
          {catalog.categories.map((cat) => (
            <optgroup key={cat.id} label={cat.name}>
              {cat.items.map((it) => (
                <option key={it.id} value={it.id}>{it.name}{(it.image || PRODUCT_IMAGES[it.id]) ? "" : " (sin foto)"}</option>
              ))}
            </optgroup>
          ))}
        </select>
        <div className="text-[11px] c-muted mt-1.5">La foto, el precio y (si no escribís una bajada abajo) la descripción salen de este producto.</div>
      </div>

      <Field label="Badge chico (ej: ⭐ Más pedido de Salta)" value={s.heroBadgeText} onChange={(v) => set("heroBadgeText", v)} />

      <div>
        <div className="text-[11px] font-bold c-gold mb-1.5">Título — 3 partes (la del medio sale en dorado)</div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <input value={s.heroHeadlinePre} onChange={(e) => set("heroHeadlinePre", e.target.value)} placeholder="LOS MEJORES" className="w-full bg-surface2 rounded-xl px-3.5 py-2.5 text-sm ph-muted outline-none focus-gold c-cream" />
          <input value={s.heroHeadlineHighlight} onChange={(e) => set("heroHeadlineHighlight", e.target.value)} placeholder="LOMOS Y SÁNDWICHES" className="w-full bg-surface2 rounded-xl px-3.5 py-2.5 text-sm ph-muted outline-none focus-gold c-gold" />
          <input value={s.heroHeadlinePost} onChange={(e) => set("heroHeadlinePost", e.target.value)} placeholder="DE LA CIUDAD." className="w-full bg-surface2 rounded-xl px-3.5 py-2.5 text-sm ph-muted outline-none focus-gold c-cream" />
        </div>
      </div>

      <div>
        <div className="text-[11px] font-bold c-gold mb-1.5">Bajada (opcional)</div>
        <textarea
          value={s.heroSubtitle}
          onChange={(e) => set("heroSubtitle", e.target.value)}
          placeholder="Dejalo vacío para usar automáticamente la descripción del producto destacado"
          rows={2}
          className="w-full bg-surface2 rounded-xl px-3.5 py-2.5 text-sm ph-muted outline-none focus-gold c-cream resize-none"
        />
      </div>

      <Field label="Nota de demora (ej: 20-30 min demora)" value={s.heroDeliveryNote} onChange={(v) => set("heroDeliveryNote", v)} />

      <button
        disabled={!dirty}
        onClick={save}
        className="w-full py-3 rounded-2xl font-display disabled:opacity-40 flex items-center justify-center gap-2"
        style={{ background: "#f2b705", color: "#0c0e16" }}
      >
        <Save size={15} /> Guardar configuración
      </button>
    </div>
  );
}

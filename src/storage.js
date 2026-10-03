// Storage layer for the app's menu catalog and orders.
//
// Two modes, chosen automatically:
//   1. Supabase (real backend) — used when VITE_SUPABASE_URL and
//      VITE_SUPABASE_ANON_KEY are set (see .env.example). This is what makes
//      an order placed on a customer's phone actually reach the admin panel
//      on a different device — the whole point of going to production.
//   2. localStorage fallback — used when those env vars are missing, so you
//      can still run `npm run dev` and try the app without setting up
//      Supabase first. Per-browser only, same limitation as before.
//
// Both modes expose the exact same get/set/delete/list interface, so nothing
// else in the app needs to know which one is active.

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL || "").trim();
const SUPABASE_ANON_KEY = (import.meta.env.VITE_SUPABASE_ANON_KEY || "").trim();

let supabase = null;
let initError = null;

if (SUPABASE_URL && SUPABASE_ANON_KEY) {
  try {
    // A common mistake when pasting the Project URL is leaving out the
    // "https://" prefix — that alone makes createClient() throw and crash
    // the whole app before it even renders. Guard against it here instead.
    const normalizedUrl = /^https?:\/\//i.test(SUPABASE_URL) ? SUPABASE_URL : `https://${SUPABASE_URL}`;
    supabase = createClient(normalizedUrl, SUPABASE_ANON_KEY);
  } catch (e) {
    initError = e;
    console.error("[YoPancho] VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY inválidos:", e);
  }
}

export function getStorageInitError() {
  return initError;
}

const KEY_PREFIX = "yopancho:";

/* ---------------------------- Supabase mode ---------------------------- */
// Backed by a single simple table (see supabase/schema.sql):
//   kv_store(key text primary key, value text, updated_at timestamptz)
// This mirrors the key/value shape the rest of the app already expects,
// instead of redesigning the whole data model around Supabase.

const supabaseStorage = {
  async get(key) {
    const { data, error } = await supabase
      .from("kv_store")
      .select("value")
      .eq("key", key)
      .maybeSingle();
    if (error) throw error;
    return data ? { key, value: data.value, shared: true } : null;
  },
  async set(key, value) {
    const { error } = await supabase
      .from("kv_store")
      .upsert({ key, value, updated_at: new Date().toISOString() });
    if (error) throw error;
    return { key, value, shared: true };
  },
  async delete(key) {
    const { error } = await supabase.from("kv_store").delete().eq("key", key);
    if (error) throw error;
    return { key, deleted: true, shared: true };
  },
  async list(prefix = "") {
    const { data, error } = await supabase.from("kv_store").select("key").like("key", `${prefix}%`);
    if (error) throw error;
    return { keys: (data || []).map((r) => r.key), prefix, shared: true };
  },
};

/* --------------------------- localStorage mode -------------------------- */

const localStorageImpl = {
  async get(key) {
    const raw = localStorage.getItem(KEY_PREFIX + key);
    return raw === null ? null : { key, value: raw, shared: false };
  },
  async set(key, value) {
    localStorage.setItem(KEY_PREFIX + key, value);
    return { key, value, shared: false };
  },
  async delete(key) {
    const existed = localStorage.getItem(KEY_PREFIX + key) !== null;
    localStorage.removeItem(KEY_PREFIX + key);
    return { key, deleted: existed, shared: false };
  },
  async list(prefix = "") {
    const keys = Object.keys(localStorage)
      .filter((k) => k.startsWith(KEY_PREFIX + prefix))
      .map((k) => k.slice(KEY_PREFIX.length));
    return { keys, prefix, shared: false };
  },
};

export const storage = supabase ? supabaseStorage : localStorageImpl;

// Handy at a glance in the browser console: confirms which mode is live
// without having to dig through the Network tab.
if (typeof window !== "undefined") {
  console.log(
    supabase
      ? "[YoPancho] Usando Supabase (backend real) — los pedidos son visibles en todos los dispositivos."
      : "[YoPancho] Usando localStorage (solo este navegador) — configurá .env con tus claves de Supabase para producción real."
  );
}

/* ------------------------------------------------------------------ */
/*  ADMIN AUTHENTICATION                                                */
/* ------------------------------------------------------------------ */
// Real login (email + password) via Supabase Auth, replacing the fixed PIN.
// Only available when Supabase is configured — in local/demo mode without
// it, the admin panel falls back to the old PIN so `npm run dev` still
// works without setting up an account first.

export const authAvailable = !!supabase;

export async function adminSignIn(email, password) {
  if (!supabase) throw new Error("Supabase no está configurado.");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function adminSignOut() {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getAdminSession() {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// Fires immediately with the current state, then again on every login/logout
// (including automatic token refresh) — return value unsubscribes.
export function onAdminAuthChange(callback) {
  if (!supabase) return () => {};
  const { data } = supabase.auth.onAuthStateChange((_event, session) => callback(session));
  return () => data.subscription.unsubscribe();
}

// Creates a login account for a new encargado. This does NOT use the
// admin API directly from the browser (that would need the service-role
// key, which must never ship to a client). Instead it calls an Edge
// Function that holds that key server-side and itself checks that whoever
// is calling is the owner account before creating anything — so even if
// someone finds this function, they can't use it unless they're already
// logged in as the owner.
export async function createStaffUser(email, password, name) {
  if (!supabase) throw new Error("Supabase no está configurado.");
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No hay sesión activa.");
  const res = await fetch(`${SUPABASE_URL}/functions/v1/create-staff-user`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
      apikey: SUPABASE_ANON_KEY,
    },
    body: JSON.stringify({ email, password, name }),
  });
  let json;
  try { json = await res.json(); } catch { json = null; }
  if (!res.ok || !json || !json.ok) throw new Error((json && json.error) || "No se pudo crear el usuario.");
  return json;
}

/* ------------------------------------------------------------------ */
/*  FILE STORAGE (photos & video for promos)                           */
/* ------------------------------------------------------------------ */
// Uploads a real file to a Supabase Storage bucket ("media") and returns its
// public URL — used for promo videos and, optionally, higher-quality promo
// photos than the compressed base64 approach used for product thumbnails.
// Only available when Supabase is configured; the admin panel falls back
// to the base64 approach in local/demo mode (fine for photos, not for video).

export const fileStorageAvailable = !!supabase;

export async function uploadMediaFile(file, folder = "promos") {
  if (!supabase) throw new Error("Subida de archivos no disponible sin Supabase configurado.");
  const ext = (file.name.split(".").pop() || "bin").toLowerCase();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from("media").upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || undefined,
  });
  if (error) throw error;
  const { data } = supabase.storage.from("media").getPublicUrl(path);
  return data.publicUrl;
}

/* ------------------------------------------------------------------ */
/*  ORDERS                                                              */
/* ------------------------------------------------------------------ */
// Orders live in their own table (one row per order) when Supabase is
// configured — see supabase/schema.sql. Every operation goes through a
// database function, so:
//   - two orders placed at the same instant can never overwrite each
//     other or get the same number (the old approach rewrote one big JSON
//     list on every save),
//   - the admin panel only downloads what CHANGED since its last check,
//     instead of the whole history every few seconds,
//   - customers can only see their own order's status — never other
//     customers' names, phones or addresses.
// In localStorage mode (no Supabase, local demo) the same interface works
// on a single local list; there's no concurrency to worry about there.

// "YYYY-MM-DD" in Argentina time (UTC-3, no daylight saving).
export function argentinaDate(d = new Date()) {
  return d.toLocaleDateString("en-CA", { timeZone: "America/Argentina/Salta" });
}

const newId = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);

async function rpc(name, args) {
  const { data, error } = await supabase.rpc(name, args);
  if (error) throw error;
  return data;
}

async function lsLoadOrders() {
  const res = await localStorageImpl.get("orders-list");
  if (!res || !res.value) return [];
  try { return JSON.parse(res.value); } catch { return []; }
}
async function lsSaveOrders(list) {
  await localStorageImpl.set("orders-list", JSON.stringify(list));
}

export const ordersApi = {
  mode: supabase ? "db" : "local",

  // Creates the order and assigns its number in one atomic step. The
  // server decides the number, the status and the timestamp.
  async place(draft) {
    if (supabase) return rpc("place_order", { p_order: draft });
    const today = argentinaDate();
    let counter = { date: today, seq: 0 };
    const raw = await localStorageImpl.get("order-counter");
    if (raw && raw.value) { try { counter = JSON.parse(raw.value); } catch { /* start over */ } }
    if (counter.date !== today) counter = { date: today, seq: 0 };
    counter.seq += 1;
    await localStorageImpl.set("order-counter", JSON.stringify(counter));
    const order = { ...draft, id: draft.id || newId(), shortCode: counter.seq, status: "nuevo", createdAt: new Date().toISOString() };
    await lsSaveOrders([order, ...(await lsLoadOrders())]);
    return order;
  },

  // Admin panel: pass null the first time (recent + still-open orders), then
  // the cursor from the previous call to get only what changed since.
  async listForAdmin(since) {
    if (supabase) {
      const res = await rpc("admin_orders", { p_since: since || null });
      return { orders: (res && res.orders) || [], cursor: (res && res.cursor) || null, full: !since };
    }
    return { orders: await lsLoadOrders(), cursor: null, full: true };
  },

  // Changes one order (status, who delivered it…) without touching the others.
  async update(id, patch) {
    if (supabase) {
      const saved = await rpc("update_order", { p_id: id, p_patch: patch });
      if (!saved) throw new Error("No se pudo guardar el cambio (¿venció la sesión?)");
      return saved;
    }
    let saved = null;
    const next = (await lsLoadOrders()).map((o) => (o.id === id ? (saved = { ...o, ...patch }) : o));
    await lsSaveOrders(next);
    return saved;
  },

  // Customer-facing: just the fields needed to show the order's progress.
  async getPublic(id) {
    if (supabase) return rpc("get_order_public", { p_id: id });
    return (await lsLoadOrders()).find((o) => o.id === id) || null;
  },

  // Customer-facing lookup: order number + the phone used when ordering.
  async lookup(code, phone) {
    const n = parseInt(String(code).trim(), 10);
    if (!Number.isFinite(n)) return null;
    if (supabase) return rpc("lookup_order_public", { p_code: n, p_phone: phone });
    const clean = (s) => String(s || "").replace(/\s+/g, "");
    return (await lsLoadOrders()).find((o) => o.shortCode === n && clean(o.phone) === clean(phone)) || null;
  },

  // Totals computed inside the database. Returns null in local mode — the
  // caller then works it out from the local list.
  async salesReport(fromISO) {
    if (!supabase) return null;
    return rpc("sales_report", { p_from: fromISO || null });
  },
};

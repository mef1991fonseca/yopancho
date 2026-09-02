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

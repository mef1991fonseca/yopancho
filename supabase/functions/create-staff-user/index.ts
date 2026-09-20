// Creates a login account for a new encargado (staff member).
//
// This runs server-side, with the service-role key, which is why it has to
// live here instead of in the browser: the service-role key can create any
// user it wants, so it must never reach client-side code. This function is
// the only thing allowed to use it for that purpose, and only after
// checking that whoever is calling is the owner account.
//
// How the owner check works: the owner's Supabase Auth user has
// app_metadata.role === "owner" (set once, directly in the database — see
// the project notes). Every other account defaults to no role at all, so
// this function refuses them. That check happens here, not in the
// frontend, so it can't be bypassed by editing client-side code.

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") || "";
    if (!authHeader) return json({ ok: false, error: "No autorizado." }, 401);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Verify the caller's own token (as themselves, not as admin) to find out who they are.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userErr } = await callerClient.auth.getUser();
    if (userErr || !user) return json({ ok: false, error: "Sesión inválida, volvé a iniciar sesión." }, 401);
    if (user.app_metadata?.role !== "owner") {
      return json({ ok: false, error: "Solo el administrador principal puede crear usuarios." }, 403);
    }

    const body = await req.json().catch(() => ({}));
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    const name = (body.name || "").trim();

    if (!email || !email.includes("@")) return json({ ok: false, error: "Email inválido." }, 400);
    if (!password || password.length < 6) return json({ ok: false, error: "La contraseña debe tener al menos 6 caracteres." }, 400);

    const adminClient = createClient(supabaseUrl, serviceRoleKey);
    const { data, error } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // no email flow set up for this project — confirm right away
      user_metadata: name ? { name } : undefined,
    });
    if (error) return json({ ok: false, error: error.message }, 400);

    return json({ ok: true, userId: data.user?.id });
  } catch (e) {
    return json({ ok: false, error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

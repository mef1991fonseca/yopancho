# YoPancho — Guía de despliegue a producción

Esta guía te lleva de "proyecto en mi computadora" a "app funcionando en
internet, con pedidos que le llegan al panel sin importar el dispositivo".
Son tres partes: **base de datos (Supabase)** → **variables de entorno** →
**hosting (Vercel)**. Cada una lleva unos minutos.

No hace falta que sepas programar para seguir estos pasos — son todos
clics y copiar/pegar.

---

## Parte 1 — Crear la base de datos en Supabase (gratis)

1. Entrá a **https://supabase.com** y creá una cuenta gratis (podés usar tu
   cuenta de GitHub o Google para no tener que inventar otra contraseña).
2. Click en **"New project"**.
   - Nombre: `yopancho` (o el que quieras).
   - Contraseña de base de datos: generá una y **guardala en un lugar
     seguro** (no la vas a necesitar para esta guía, pero es la llave
     maestra de tu base de datos).
   - Región: elegí la más cercana a Argentina (por ejemplo, "South
     America (São Paulo)" si está disponible).
   - Dale a **"Create new project"** y esperá 1-2 minutos mientras se crea.
3. Una vez creado, andá al ícono de **SQL Editor** (rayo/consola en el menú
   lateral izquierdo) → **"New query"**.
4. Abrí el archivo `supabase/schema.sql` de este proyecto, copiá **todo** su
   contenido, pegalo en el editor de Supabase, y tocá **"Run"** (o Ctrl+Enter).
   Deberías ver "Success. No rows returned" — listo, ya está la tabla creada.
5. Andá a **Settings** (ícono de engranaje, abajo a la izquierda) → **API**.
   Ahí vas a ver dos datos que necesitás para el próximo paso:
   - **Project URL** (algo como `https://abcdefgh.supabase.co`)
   - **anon public** key (una clave larga que empieza con `eyJ...`)

Guardá esos dos datos — los vas a pegar en el paso 2.

---

## Parte 2 — Configurar las variables de entorno

### Para probarlo en tu computadora primero

1. En la carpeta del proyecto, copiá el archivo `.env.example` y renombrá
   la copia a `.env`.
2. Abrilo y completá las dos líneas con los datos que sacaste de Supabase:
   ```
   VITE_SUPABASE_URL=https://abcdefgh.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJ......................
   ```
3. Guardá el archivo, y corré:
   ```bash
   npm install
   npm run dev
   ```
4. Abrí la app, hacé un pedido de prueba desde una pestaña, y fijate en
   Admin → Pedidos desde **otra pestaña o desde tu celular** (misma red o
   incluso datos móviles) — el pedido debería aparecer ahí. Si ves eso
   funcionando, el backend real ya está andando.

Si en la consola del navegador (F12) ves el mensaje *"Usando Supabase
(backend real)"*, confirmás que quedó bien conectado. Si en cambio ves
*"Usando localStorage"*, revisá que el archivo se llame exactamente `.env`
(no `.env.example`) y que hayas reiniciado `npm run dev` después de
guardarlo.

---

## Parte 3 — Subir la app a internet con Vercel (gratis)

1. Entrá a **https://vercel.com** y creá una cuenta gratis (podés entrar
   con tu cuenta de GitHub directamente, es lo más simple).
2. Subí este proyecto a un repositorio de **GitHub**:
   - Si nunca usaste GitHub: creá una cuenta en https://github.com, creá un
     repositorio nuevo (por ejemplo `yopancho-app`), y subí esta carpeta
     siguiendo las instrucciones que GitHub te muestra ahí mismo ("…or
     push an existing repository from the command line").
3. En Vercel, click en **"Add New" → "Project"**, elegí el repositorio
   `yopancho-app` que acabás de subir.
4. Vercel detecta Vite automáticamente — no toques la configuración de
   build.
5. **Antes de tocar "Deploy"**, desplegá la sección **"Environment
   Variables"** y cargá las mismas dos variables que usaste en el `.env`:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
6. Ahora sí, tocá **"Deploy"**. En 1-2 minutos te da una URL pública, algo
   como `https://yopancho-app.vercel.app` — esa es la dirección que le
   podés pasar al cliente.

Cada vez que subas un cambio nuevo al repositorio de GitHub, Vercel
actualiza la app sola, sin que tengas que repetir estos pasos.

### Más adelante: dominio propio

Cuando quieran usar un dominio propio (por ejemplo `pedidos.yopancho.com`
o algo comprado en NIC Argentina / Namecheap / etc.), en Vercel vas a
**Project → Settings → Domains**, agregás el dominio, y Vercel te da los
registros DNS exactos que hay que cargar donde compraron el dominio. Avisame
cuando lleguen a este punto y te acompaño con eso también.

---

---

## Parte 4 — Fotos y video de alta calidad para las promos (opcional)

Por defecto, las fotos de promo se guardan comprimidas junto con el resto de
los datos. Si querés fotos en mejor calidad, o video de fondo en el banner
principal (como tiene la competencia), hace falta activar el almacenamiento
de archivos de Supabase — es gratis y son 2 minutos:

1. En tu proyecto de Supabase, andá al **SQL Editor** → **New query**.
2. Abrí el archivo `supabase/storage.sql` de este proyecto, copiá todo su
   contenido, pegalo, y tocá **Run**.
3. Listo — en Admin → Promos vas a ver un botón nuevo, "Subir video", además
   del de foto. Los videos se reproducen solos, en loop y sin sonido, de
   fondo en el banner principal (máximo 25MB por video — si es más pesado,
   recortalo o comprimilo antes de subirlo).

Sin este paso, todo sigue funcionando igual, solo que las promos usan fotos
comprimidas en vez de archivos en calidad completa, y no hay opción de video.

---

## Parte 5 — Crear el usuario del panel admin (login real)

Ya no hace falta el PIN — el panel usa email + contraseña reales a través
de Supabase Auth. Para crear el primer usuario:

1. En tu proyecto de Supabase, andá a **Authentication** (ícono de personas,
   menú izquierdo) → **Users** → **"Add user"** → **"Create new user"**.
2. Cargá el email y una contraseña para quien va a administrar el local
   (podés crear más de uno si hay varias personas a cargo).
3. Importante: tildá **"Auto Confirm User"** al crearlo (o si no aparece esa
   opción, entrá al usuario recién creado y confirmá el email manualmente)
   — si no, Supabase le va a pedir confirmar el email antes de poder
   entrar, y por ahora no configuramos el envío de esos mails.
4. Volvé al SQL Editor y volvé a correr `supabase/schema.sql` completo si
   todavía no lo hiciste con esta versión — esta vez además de crear la
   tabla, deja el menú protegido para que solo un usuario logueado pueda
   editarlo (antes, cualquiera con la clave pública del proyecto podía
   editar precios directamente, sin pasar por el panel).
5. Listo — en `/admin` ahora vas a ver campos de **Email** y
   **Contraseña** en vez del PIN. Iniciá sesión con el usuario que creaste.

La sesión queda guardada en el navegador (no hay que loguearse de nuevo
cada vez que se recarga la página), hasta que alguien toque "Cerrar
sesión".

---

## Qué queda pendiente después de esto

- **Confirmar el número de WhatsApp real del local** en Admin →
  Configuración (formato: código de país + número, sin espacios ni signos).
- **Revisar los precios cargados contra la carta vigente** del local antes
  de la puesta en marcha definitiva.
- **(Mejora de privacidad, no bloqueante)**: hoy la lectura de datos es
  pública para que la tienda funcione sin login — en teoría, alguien con la
  clave pública del proyecto podría leer la lista completa de pedidos
  (nombres y teléfonos incluidos) directo por API, no solo a través de la
  app. Para un local chico es un riesgo bajo, pero si en algún momento
  quieren blindarlo del todo, la solución es mover esa lectura detrás de
  una función propia del servidor en vez de acceso directo a la tabla —
  avisame cuando quieran encararlo.

## Notas técnicas (por si las necesitás más adelante)

- La base de datos usa una sola tabla (`kv_store`, ver
  `supabase/schema.sql`) que guarda el menú y los pedidos como texto JSON,
  en vez de una tabla por cada cosa. Fue una decisión deliberada: mantiene
  el código de la app idéntico al de la versión de prueba (mismo formato de
  datos), reduciendo el riesgo de romper algo al migrar. Si más adelante
  necesitás reportes de ventas con SQL (por ejemplo "total vendido por
  semana"), ahí sí conviene migrar a tablas propias (`orders`,
  `menu_items`, etc.) — avisame cuando llegue ese momento.
- Las políticas de acceso a la base (`Row Level Security`) ya distinguen
  entre "cualquiera" (lectura, y escritura de pedidos) y "admin logueado"
  (escritura del menú, borrado). El detalle completo de qué puede hacer
  cada uno está comentado en `supabase/schema.sql`.
- El plan gratuito de Supabase pausa el proyecto automáticamente después de
  varios días sin actividad — con pedidos entrando todos los días esto no
  debería pasar nunca en la práctica, pero si un día la app no carga datos,
  revisá el dashboard de Supabase por si pide "reactivar" el proyecto (un
  clic, no se pierde nada).

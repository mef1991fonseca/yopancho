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

## Qué queda pendiente después de esto

- **Reemplazar el PIN fijo del panel admin por un login real.** Hoy
  cualquiera que entre a `/admin` y sepa el PIN (`1234` por defecto, ver
  `ADMIN_PIN` en `src/App.jsx`) puede gestionar pedidos y editar el menú.
  Para un cliente real esto conviene resolverlo antes de compartir la URL
  ampliamente — es el siguiente paso lógico de seguridad.
- **Confirmar el número de WhatsApp real del local** en Admin →
  Configuración (formato: código de país + número, sin espacios ni signos).
- **Revisar los precios cargados contra la carta vigente** del local antes
  de la puesta en marcha definitiva.

## Notas técnicas (por si las necesitás más adelante)

- La base de datos usa una sola tabla (`kv_store`, ver
  `supabase/schema.sql`) que guarda el menú y los pedidos como texto JSON,
  en vez de una tabla por cada cosa. Fue una decisión deliberada: mantiene
  el código de la app idéntico al de la versión de prueba (mismo formato de
  datos), reduciendo el riesgo de romper algo al migrar. Si más adelante
  necesitás reportes de ventas con SQL (por ejemplo "total vendido por
  semana"), ahí sí conviene migrar a tablas propias (`orders`,
  `menu_items`, etc.) — avisame cuando llegue ese momento.
- Las políticas de acceso a la base (`Row Level Security`) están abiertas
  para lectura y escritura pública, porque tanto el cliente como el admin
  usan la misma clave pública. Es aceptable para este tamaño de proyecto,
  pero es la razón de fondo por la que el login real del punto anterior
  importa: hoy la única protección real del panel admin es que nadie
  adivine el PIN.
- El plan gratuito de Supabase pausa el proyecto automáticamente después de
  varios días sin actividad — con pedidos entrando todos los días esto no
  debería pasar nunca en la práctica, pero si un día la app no carga datos,
  revisá el dashboard de Supabase por si pide "reactivar" el proyecto (un
  clic, no se pierde nada).

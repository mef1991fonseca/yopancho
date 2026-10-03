// Builds the Excel file for the orders export / backup.
//
// Loaded on demand (dynamic import from the admin panel), so none of this —
// nor the Excel library — adds to what a customer downloads to open the shop.
//
// Self-contained on purpose (no imports from the rest of the app) so it can
// be tested on its own.

const TZ = "America/Argentina/Salta";

const STATUS_LABEL = { nuevo: "Nuevo", preparando: "Preparando", listo: "Listo", entregado: "Entregado", cancelado: "Cancelado" };
const PAYMENT_LABEL = { efectivo: "Efectivo", transferencia: "Transferencia", tarjeta: "Tarjeta" };

// "YYYY-MM-DD" and "HH:MM" as seen in Argentina, whatever the device's own time zone.
const dayKey = (iso) => new Intl.DateTimeFormat("en-CA", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
const timeText = (iso) => new Intl.DateTimeFormat("es-AR", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
const dateTimeText = (d) => new Intl.DateTimeFormat("es-AR", { timeZone: TZ, dateStyle: "short", timeStyle: "short" }).format(d);

// A real date cell (so Excel can sort/filter/group by it). The library turns a
// Date into Excel's day-number with plain UTC math, so midnight UTC of the
// Argentine calendar day always lands on the right day.
const dayCell = (iso) => {
  const [y, m, d] = dayKey(iso).split("-").map(Number);
  return { value: new Date(Date.UTC(y, m - 1, d)), format: "dd/mm/yyyy", align: "left" };
};

const HEADER = { fontWeight: "bold", backgroundColor: "#f2b705", textColor: "#0c0e16" };
const head = (labels) => labels.map((value) => ({ value, ...HEADER }));
const money = (n) => ({ value: Number(n) || 0, format: "$#,##0" });
const bold = (value, extra = {}) => ({ value, fontWeight: "bold", ...extra });

const itemLabel = (l) => `${l.name}${l.variantLabel ? ` (${l.variantLabel})` : ""}`;
const itemsSummary = (items) =>
  (items || []).map((l) => `${l.qty}x ${itemLabel(l)}${l.note ? ` — ${l.note}` : ""}`).join("; ");

export function buildSheets(orders, { label = "Todo el historial" } = {}) {
  const sorted = [...orders].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const delivered = sorted.filter((o) => o.status === "entregado");
  const cancelled = sorted.filter((o) => o.status === "cancelado");
  const sum = (list) => list.reduce((s, o) => s + (Number(o.total) || 0), 0);

  // --- 1) Resumen
  const first = sorted[0] && dayKey(sorted[0].createdAt).split("-").reverse().join("/");
  const last = sorted.length && dayKey(sorted[sorted.length - 1].createdAt).split("-").reverse().join("/");
  const resumen = [
    [bold("Yo Pancho — Pedidos y ventas", { fontSize: 14 }), null],
    [null, null],
    ["Período", label],
    ["Primer pedido", first || "—"],
    ["Último pedido", last || "—"],
    ["Generado el", dateTimeText(new Date())],
    [null, null],
    [bold("Pedidos totales"), sorted.length],
    [bold("Entregados (ventas)"), delivered.length],
    [bold("Total vendido"), money(sum(delivered))],
    [bold("Cancelados"), cancelled.length],
    [bold("Plata no concretada (cancelados)"), money(sum(cancelled))],
    [null, null],
    ["Las ventas cuentan solo pedidos en estado Entregado.", null],
  ];

  // --- 2) Pedidos (una fila por pedido)
  const pedidos = [
    head(["N°", "Fecha", "Hora", "Estado", "Cliente", "Teléfono", "Modalidad", "Dirección", "Forma de pago", "Productos", "Total", "Entregó", "Motivo de cancelación", "Nota del cliente"]),
    ...sorted.map((o) => [
      { value: Number(o.shortCode) || 0, align: "left" },
      dayCell(o.createdAt),
      timeText(o.createdAt),
      { value: STATUS_LABEL[o.status] || o.status || "", textColor: o.status === "cancelado" ? "#b91c1c" : o.status === "entregado" ? "#15803d" : "#111827", fontWeight: "bold" },
      o.customerName || "",
      o.phone || "",
      o.mode === "delivery" ? "Delivery" : "Retiro en el local",
      o.mode === "delivery" ? o.address || "" : "",
      PAYMENT_LABEL[o.payment] || o.payment || "",
      itemsSummary(o.items),
      money(o.total),
      o.status === "entregado" ? o.servedByName || o.servedBy || "" : "",
      o.status === "cancelado" ? (o.cancelReason || "") + (o.cancelledByName ? ` (${o.cancelledByName})` : "") : "",
      o.note || "",
    ]),
  ];

  // --- 3) Detalle de productos (una fila por producto de cada pedido)
  const detalle = [head(["N° pedido", "Fecha", "Estado", "Producto", "Variante", "Cantidad", "Precio unitario", "Subtotal", "Aclaraciones y extras"])];
  for (const o of sorted) {
    for (const l of o.items || []) {
      detalle.push([
        { value: Number(o.shortCode) || 0, align: "left" },
        dayCell(o.createdAt),
        STATUS_LABEL[o.status] || o.status || "",
        l.name || "",
        l.variantLabel || "",
        { value: Number(l.qty) || 0 },
        money(l.price),
        money((Number(l.price) || 0) * (Number(l.qty) || 0)),
        l.note || "",
      ]);
    }
  }

  // --- 4) Por encargado (solo ventas entregadas)
  const byStaff = new Map();
  for (const o of delivered) {
    const k = o.servedByName || o.servedBy || "Sin asignar";
    const r = byStaff.get(k) || { name: k, count: 0, total: 0 };
    r.count += 1; r.total += Number(o.total) || 0;
    byStaff.set(k, r);
  }
  const staffRows = [...byStaff.values()].sort((a, b) => b.total - a.total);
  const porEncargado = [
    head(["Encargado", "Pedidos entregados", "Total vendido"]),
    ...staffRows.map((r) => [r.name, { value: r.count }, money(r.total)]),
    [bold("TOTAL"), bold(delivered.length), { ...money(sum(delivered)), fontWeight: "bold" }],
  ];

  // --- 5) Productos más vendidos (solo ventas entregadas)
  const byProduct = new Map();
  for (const o of delivered) {
    for (const l of o.items || []) {
      const k = itemLabel(l);
      const r = byProduct.get(k) || { name: k, qty: 0, total: 0 };
      r.qty += Number(l.qty) || 0; r.total += (Number(l.price) || 0) * (Number(l.qty) || 0);
      byProduct.set(k, r);
    }
  }
  const masVendidos = [
    head(["Producto", "Unidades vendidas", "Total"]),
    ...[...byProduct.values()].sort((a, b) => b.qty - a.qty).map((r) => [r.name, { value: r.qty }, money(r.total)]),
  ];

  // --- 6) Cancelaciones por motivo
  const byReason = new Map();
  for (const o of cancelled) {
    const k = o.cancelReason || "Sin motivo";
    const r = byReason.get(k) || { reason: k, count: 0, lost: 0 };
    r.count += 1; r.lost += Number(o.total) || 0;
    byReason.set(k, r);
  }
  const cancelaciones = [
    head(["Motivo", "Pedidos cancelados", "Plata no concretada"]),
    ...[...byReason.values()].sort((a, b) => b.count - a.count).map((r) => [r.reason, { value: r.count }, money(r.lost)]),
  ];

  return [
    { sheet: "Resumen", data: resumen, columns: [{ width: 38 }, { width: 30 }] },
    { sheet: "Pedidos", data: pedidos, stickyRowsCount: 1, columns: [{ width: 6 }, { width: 12 }, { width: 8 }, { width: 13 }, { width: 22 }, { width: 16 }, { width: 18 }, { width: 28 }, { width: 15 }, { width: 60 }, { width: 12 }, { width: 22 }, { width: 30 }, { width: 30 }] },
    { sheet: "Detalle de productos", data: detalle, stickyRowsCount: 1, columns: [{ width: 10 }, { width: 12 }, { width: 13 }, { width: 32 }, { width: 14 }, { width: 10 }, { width: 15 }, { width: 13 }, { width: 50 }] },
    { sheet: "Por encargado", data: porEncargado, stickyRowsCount: 1, columns: [{ width: 30 }, { width: 20 }, { width: 18 }] },
    { sheet: "Más vendidos", data: masVendidos, stickyRowsCount: 1, columns: [{ width: 40 }, { width: 18 }, { width: 16 }] },
    { sheet: "Cancelaciones", data: cancelaciones, stickyRowsCount: 1, columns: [{ width: 36 }, { width: 20 }, { width: 22 }] },
  ];
}

// Triggers the browser's "save file" for a Blob.
export function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 10000);
}

export async function ordersExcelBlob(orders, opts) {
  // "universal" entry: no Web Workers involved, returns a plain Blob.
  const { default: writeExcelFile } = await import("write-excel-file/universal");
  return writeExcelFile(buildSheets(orders, opts)).toBlob();
}

export async function downloadOrdersExcel(orders, { label, fileTag } = {}) {
  const blob = await ordersExcelBlob(orders, { label });
  const today = dayKey(new Date().toISOString());
  downloadBlob(blob, `YoPancho_pedidos_${fileTag || "todo"}_${today}.xlsx`);
}

export function downloadMenuBackup(catalog) {
  const today = dayKey(new Date().toISOString());
  const blob = new Blob([JSON.stringify(catalog, null, 2)], { type: "application/json" });
  downloadBlob(blob, `YoPancho_menu_respaldo_${today}.json`);
}

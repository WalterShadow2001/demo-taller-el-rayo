import { db } from "./db";

export type EstadoCita =
  | "en_espera"
  | "en_proceso"
  | "listo"
  | "entregado"
  | "cancelada";

export const ESTADOS_CITA: { value: EstadoCita; label: string; color: string }[] = [
  { value: "en_espera", label: "En espera", color: "var(--status-en_espera)" },
  { value: "en_proceso", label: "En proceso", color: "var(--status-en_proceso)" },
  { value: "listo", label: "Listo", color: "var(--status-listo)" },
  { value: "entregado", label: "Entregado", color: "var(--status-entregado)" },
  { value: "cancelada", label: "Cancelada", color: "var(--status-cancelada)" },
];

export const ESTADO_LABEL: Record<EstadoCita, string> = {
  en_espera: "En espera",
  en_proceso: "En proceso",
  listo: "Listo",
  entregado: "Entregado",
  cancelada: "Cancelada",
};

export const ESTADO_COLOR: Record<EstadoCita, string> = {
  en_espera: "var(--status-en_espera)",
  en_proceso: "var(--status-en_proceso)",
  listo: "var(--status-listo)",
  entregado: "var(--status-entregado)",
  cancelada: "var(--status-cancelada)",
};

export interface EstadoPaso {
  value: EstadoCita;
  label: string;
  description: string;
}

/**
 * The 4 visible stages on the public status tracker.
 * "Cancelada" is handled separately as a canceled banner.
 */
export const ESTADO_PASOS: EstadoPaso[] = [
  { value: "en_espera", label: "En espera", description: "Cita registrada, esperando turno" },
  { value: "en_proceso", label: "En proceso", description: "Vehículo en taller, trabajando" },
  { value: "listo", label: "Listo", description: "Servicio terminado, listo para recoger" },
  { value: "entregado", label: "Entregado", description: "Vehículo entregado al cliente" },
];

export function isEstadoValido(estado: string): estado is EstadoCita {
  return ["en_espera", "en_proceso", "listo", "entregado", "cancelada"].includes(estado);
}

export function getEstadoIndex(estado: EstadoCita): number {
  if (estado === "cancelada") return -1;
  return ESTADO_PASOS.findIndex((p) => p.value === estado);
}

/* ---------- Time helpers ---------- */

export const DIAS_SEMANA = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
];

export const DIAS_LABEL: Record<number, string> = {
  0: "Domingo",
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
};

/** "08:00" → minutes since midnight */
export function parseHora(h: string): number {
  const [hh, mm] = h.split(":").map(Number);
  return (hh ?? 0) * 60 + (mm ?? 0);
}

export function toHora(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

/** Returns "YYYY-MM-DD" in local time (server zone) */
export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function parseDateKey(s: string): Date {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function isPastDate(s: string): boolean {
  const today = toDateKey(new Date());
  return s < today;
}

/**
 * Generate "HH:mm" slots in 30-min increments within a given range,
 * skipping past times if the date is today.
 */
export function generateSlots(
  inicio: string,
  fin: string,
  slotMin = 30,
  fecha?: string,
): string[] {
  const start = parseHora(inicio);
  const end = parseHora(fin);
  const now = new Date();
  const isToday = fecha === toDateKey(now);
  const nowMin = now.getHours() * 60 + now.getMinutes();

  const slots: string[] = [];
  for (let t = start; t + slotMin <= end; t += slotMin) {
    if (isToday && t <= nowMin) continue;
    slots.push(toHora(t));
  }
  return slots;
}

/**
 * For a given date, returns:
 *  - isClosed: true if no working hours configured for that weekday
 *  - slots: "HH:mm" list, subtracting existing citas (also 30-min buffer)
 */
export async function getHorariosDisponibles(fecha: string): Promise<{
  isClosed: boolean;
  slots: string[];
  motivo?: string;
}> {
  const date = parseDateKey(fecha);
  const diaSemana = date.getDay();

  const horario = await db.horarioTaller.findFirst({
    where: { diaSemana },
  });

  if (!horario) {
    return { isClosed: true, slots: [], motivo: "El taller no abre este día." };
  }

  const occupied = await db.cita.findMany({
    where: { fecha, estado: { not: "cancelada" } },
    select: { hora: true },
  });

  // Map of occupied start minutes; each cita blocks its own slot
  const occupiedSet = new Set(occupied.map((o) => o.hora));

  const allSlots = generateSlots(horario.horaInicio, horario.horaFin, 30, fecha);
  const free = allSlots.filter((s) => !occupiedSet.has(s));

  return { isClosed: false, slots: free };
}

/* ---------- Pricing helpers ---------- */

export function formatPrecio(n: number | null | undefined): string {
  if (n == null || Number.isNaN(n)) return "—";
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function formatFecha(fecha: string): string {
  const d = parseDateKey(fecha);
  return d.toLocaleDateString("es-MX", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function formatFechaCorta(fecha: string): string {
  const d = parseDateKey(fecha);
  return d.toLocaleDateString("es-MX", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatHora12(hora: string): string {
  const [h, m] = hora.split(":").map(Number);
  const period = (h ?? 0) < 12 ? "AM" : "PM";
  const hh12 = ((h ?? 0) + 11) % 12 + 1;
  return `${hh12}:${String(m ?? 0).padStart(2, "0")} ${period}`;
}

export function formatDuracion(min: number): string {
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}min`;
}

export function isToday(fecha: string): boolean {
  return fecha === toDateKey(new Date());
}

export function isThisMonth(fecha: string): boolean {
  const d = parseDateKey(fecha);
  const now = new Date();
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
}

/* ---------- WhatsApp link ---------- */

export function buildWhatsAppLink(opts: {
  phone?: string;
  clienteNombre: string;
  clienteEmail?: string;
  vehiculoDesc: string;
  servicioNombre: string;
  fecha: string;
  hora: string;
  citaId: string;
}): string {
  const phone = "526391234567"; // placeholder taller phone for demo
  const text =
    `Hola Taller El Rayo, soy ${opts.clienteNombre}.%0A` +
    `Tengo una cita programada:%0A` +
    `• Servicio: ${opts.servicioNombre}%0A` +
    `• Vehículo: ${opts.vehiculoDesc}%0A` +
    `• Fecha: ${formatFecha(opts.fecha)}%0A` +
    `• Hora: ${formatHora12(opts.hora)}%0A` +
    `• Folio: ${opts.citaId.slice(-8).toUpperCase()}`;
  return `https://wa.me/${phone}?text=${text}`;
}

/* ---------- Cita creation helper ---------- */

export async function findOrCreateCliente(opts: {
  nombre: string;
  email: string;
  telefono: string;
}) {
  const existing = await db.cliente.findUnique({
    where: { email: opts.email.toLowerCase() },
  });
  if (existing) return existing;
  return db.cliente.create({
    data: {
      nombre: opts.nombre,
      email: opts.email.toLowerCase(),
      telefono: opts.telefono,
    },
  });
}

export async function findOrCreateVehiculo(opts: {
  clienteId: string;
  marca: string;
  modelo: string;
  anio: number;
  placas?: string;
  color?: string;
}) {
  if (opts.placas) {
    const existing = await db.vehiculo.findFirst({
      where: { clienteId: opts.clienteId, placas: opts.placas },
    });
    if (existing) return existing;
  }
  return db.vehiculo.create({
    data: {
      clienteId: opts.clienteId,
      marca: opts.marca,
      modelo: opts.modelo,
      anio: opts.anio,
      placas: opts.placas ?? null,
      color: opts.color ?? null,
    },
  });
}

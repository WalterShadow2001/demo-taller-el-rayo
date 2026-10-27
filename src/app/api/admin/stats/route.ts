import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthed } from "@/lib/auth";
import { isThisMonth, isToday, toDateKey, parseDateKey, formatFechaCorta } from "@/lib/cita-helpers";

export async function GET() {
  const authed = await isAdminAuthed();
  if (!authed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const today = toDateKey(new Date());

    const [citasToday, citasAll, servicios] = await Promise.all([
      db.cita.findMany({
        where: { fecha: today },
        include: { cliente: true, vehiculo: true, servicio: true },
        orderBy: { hora: "asc" },
      }),
      db.cita.findMany({
        include: { cliente: true, vehiculo: true, servicio: true },
      }),
      db.servicio.findMany(),
    ]);

    const pendientes = citasAll.filter((c) => c.estado === "en_espera");
    const enProceso = citasAll.filter((c) => c.estado === "en_proceso");

    // Ingresos del mes: sum precioFinal if set else fallback to servicio.precioAuto
    const citasMes = citasAll.filter((c) => isThisMonth(c.fecha) && c.estado !== "cancelada");
    const ingresosMes = citasMes.reduce((sum, c) => {
      const p = c.precioFinal ?? c.servicio.precioAuto;
      return sum + p;
    }, 0);

    // Ingresos por día (últimos 14 días)
    const ingresosPorDia: { fecha: string; total: number }[] = [];
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const key = toDateKey(d);
      const dayCitas = citasAll.filter(
        (c) => c.fecha === key && c.estado !== "cancelada",
      );
      const total = dayCitas.reduce(
        (sum, c) => sum + (c.precioFinal ?? c.servicio.precioAuto),
        0,
      );
      ingresosPorDia.push({ fecha: key, total });
    }

    // Top servicios (count of citas)
    const servicioCounts = new Map<string, { nombre: string; count: number; ingresos: number }>();
    for (const c of citasAll) {
      if (c.estado === "cancelada") continue;
      const key = c.servicioId;
      const existing = servicioCounts.get(key) ?? {
        nombre: c.servicio.nombre,
        count: 0,
        ingresos: 0,
      };
      existing.count += 1;
      existing.ingresos += c.precioFinal ?? c.servicio.precioAuto;
      servicioCounts.set(key, existing);
    }
    const topServicios = Array.from(servicioCounts.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Ingresos por servicio (for chart)
    const ingresosPorServicio = Array.from(servicioCounts.values())
      .sort((a, b) => b.ingresos - a.ingresos)
      .slice(0, 5);

    // Counts by estado
    const countsByEstado = {
      en_espera: citasAll.filter((c) => c.estado === "en_espera").length,
      en_proceso: citasAll.filter((c) => c.estado === "en_proceso").length,
      listo: citasAll.filter((c) => c.estado === "listo").length,
      entregado: citasAll.filter((c) => c.estado === "entregado").length,
      cancelada: citasAll.filter((c) => c.estado === "cancelada").length,
    };

    // Format ingresos por dia for chart (label = short date)
    const chartData = ingresosPorDia.map((d) => ({
      ...d,
      label: formatFechaCorta(d.fecha),
    }));

    // Upcoming citas (next 5 from today forward)
    const upcoming = citasAll
      .filter((c) => c.fecha >= today && c.estado !== "cancelada")
      .sort((a, b) => (a.fecha + a.hora).localeCompare(b.fecha + b.hora))
      .slice(0, 5);

    // Suppress unused warnings
    void parseDateKey;
    void servicios;
    void isToday;
    void pendientes;
    void enProceso;

    return NextResponse.json({
      counts: {
        today: citasToday.length,
        en_espera: countsByEstado.en_espera,
        en_proceso: countsByEstado.en_proceso,
        listo: countsByEstado.listo,
        entregado: countsByEstado.entregado,
        cancelada: countsByEstado.cancelada,
        total: citasAll.length,
      },
      ingresosMes,
      ingresosPorDia: chartData,
      topServicios,
      ingresosPorServicio,
      citasToday,
      upcoming,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudieron cargar estadísticas" }, { status: 500 });
  }
}

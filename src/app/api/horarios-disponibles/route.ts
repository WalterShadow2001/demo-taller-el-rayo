import { NextResponse } from "next/server";
import { getHorariosDisponibles, isPastDate } from "@/lib/cita-helpers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const fecha = searchParams.get("fecha");

    if (!fecha) {
      return NextResponse.json(
        { error: "Falta el parámetro 'fecha' (YYYY-MM-DD)" },
        { status: 400 },
      );
    }
    // Validate format
    const parts = fecha.split("-").map(Number);
    if (parts.length !== 3 || parts.some((n) => Number.isNaN(n))) {
      return NextResponse.json(
        { error: "Formato de fecha inválido. Use YYYY-MM-DD." },
        { status: 400 },
      );
    }
    const [y, m, d] = parts;
    const date = new Date(y, m - 1, d);
    if (date.getMonth() !== m - 1 || date.getDate() !== d) {
      return NextResponse.json(
        { error: "Fecha inválida." },
        { status: 400 },
      );
    }

    if (isPastDate(fecha)) {
      return NextResponse.json({
        fecha,
        isClosed: true,
        slots: [],
        motivo: "La fecha ya pasó.",
      });
    }

    const result = await getHorariosDisponibles(fecha);
    return NextResponse.json({ fecha, ...result });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "No se pudieron cargar los horarios disponibles" },
      { status: 500 },
    );
  }
}

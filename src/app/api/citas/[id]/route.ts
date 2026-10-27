import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthed } from "@/lib/auth";
import { isEstadoValido } from "@/lib/cita-helpers";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await ctx.params;
    const cita = await db.cita.findUnique({
      where: { id },
      include: { cliente: true, vehiculo: true, servicio: true },
    });
    if (!cita) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }
    return NextResponse.json(cita);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo cargar la cita" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const authed = await isAdminAuthed();
  if (!authed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id } = await ctx.params;
    const exists = await db.cita.findUnique({ where: { id } });
    if (!exists) {
      return NextResponse.json({ error: "Cita no encontrada" }, { status: 404 });
    }
    const body = await req.json();

    const data: Record<string, unknown> = {};
    if (body.estado != null && isEstadoValido(body.estado)) data.estado = body.estado;
    if (body.precioFinal !== undefined)
      data.precioFinal = body.precioFinal == null ? null : Number(body.precioFinal);
    if (body.notas !== undefined) data.notas = body.notas ?? null;

    const updated = await db.cita.update({
      where: { id },
      data,
      include: { cliente: true, vehiculo: true, servicio: true },
    });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 500 });
  }
}

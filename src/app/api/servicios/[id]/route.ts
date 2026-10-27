import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthed } from "@/lib/auth";

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
    const body = await req.json();

    const exists = await db.servicio.findUnique({ where: { id } });
    if (!exists) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }

    const data: Record<string, unknown> = {};
    if (body.nombre != null) data.nombre = String(body.nombre);
    if (body.descripcion != null) data.descripcion = String(body.descripcion);
    if (body.precioAuto != null) data.precioAuto = Number(body.precioAuto);
    if (body.precioCamioneta !== undefined)
      data.precioCamioneta =
        body.precioCamioneta == null ? null : Number(body.precioCamioneta);
    if (body.duracionMin != null) data.duracionMin = Number(body.duracionMin);
    if (body.icono !== undefined) data.icono = body.icono ?? null;

    const updated = await db.servicio.update({ where: { id }, data });
    return NextResponse.json(updated);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const authed = await isAdminAuthed();
  if (!authed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { id } = await ctx.params;
    const exists = await db.servicio.findUnique({ where: { id } });
    if (!exists) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }
    await db.servicio.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo eliminar" }, { status: 500 });
  }
}

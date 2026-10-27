import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthed } from "@/lib/auth";

export async function GET() {
  try {
    const servicios = await db.servicio.findMany({ orderBy: { nombre: "asc" } });
    return NextResponse.json(servicios);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "No se pudieron cargar los servicios" },
      { status: 500 },
    );
  }
}

export async function POST(req: Request) {
  const authed = await isAdminAuthed();
  if (!authed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const {
      nombre,
      descripcion,
      precioAuto,
      precioCamioneta,
      duracionMin,
      icono,
    } = body ?? {};

    if (!nombre || !descripcion || typeof precioAuto !== "number" || !duracionMin) {
      return NextResponse.json(
        { error: "Datos incompletos: nombre, descripcion, precioAuto, duracionMin" },
        { status: 400 },
      );
    }

    const creado = await db.servicio.create({
      data: {
        nombre: String(nombre),
        descripcion: String(descripcion),
        precioAuto: Number(precioAuto),
        precioCamioneta: precioCamioneta != null ? Number(precioCamioneta) : null,
        duracionMin: Number(duracionMin),
        icono: icono ?? null,
      },
    });
    return NextResponse.json(creado, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "No se pudo crear el servicio" },
      { status: 500 },
    );
  }
}

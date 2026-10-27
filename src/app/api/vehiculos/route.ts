import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthed } from "@/lib/auth";

export async function GET() {
  const authed = await isAdminAuthed();
  if (!authed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const vehiculos = await db.vehiculo.findMany({
      include: { cliente: true, _count: { select: { citas: true } } },
      orderBy: [{ marca: "asc" }, { modelo: "asc" }],
    });
    return NextResponse.json(vehiculos);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudieron cargar los vehículos" }, { status: 500 });
  }
}

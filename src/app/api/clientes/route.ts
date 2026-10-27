import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthed } from "@/lib/auth";

export async function GET() {
  const authed = await isAdminAuthed();
  if (!authed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const clientes = await db.cliente.findMany({
      include: {
        _count: { select: { vehiculos: true, citas: true } },
      },
      orderBy: { creadoEn: "desc" },
    });
    return NextResponse.json(clientes);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudieron cargar los clientes" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ email: string }> },
) {
  try {
    const { email: emailParam } = await ctx.params;
    const email = decodeURIComponent(emailParam).toLowerCase();

    const cliente = await db.cliente.findUnique({ where: { email } });
    if (!cliente) {
      return NextResponse.json({ error: "Cliente no encontrado" }, { status: 404 });
    }

    const [citas, vehiculos] = await Promise.all([
      db.cita.findMany({
        where: { clienteId: cliente.id },
        include: { servicio: true, vehiculo: true },
        orderBy: [{ fecha: "desc" }, { hora: "desc" }],
      }),
      db.vehiculo.findMany({ where: { clienteId: cliente.id } }),
    ]);

    return NextResponse.json({ cliente, citas, vehiculos });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudieron cargar las citas" }, { status: 500 });
  }
}

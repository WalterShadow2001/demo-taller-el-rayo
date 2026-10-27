import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getClienteEmail } from "@/lib/auth";

/**
 * Returns the vehicles owned by the currently logged-in cliente (via cookie).
 * Used by the booking flow to pre-select an existing vehicle.
 */
export async function GET() {
  const email = await getClienteEmail();
  if (!email) {
    return NextResponse.json({ vehiculos: [] });
  }
  const cliente = await db.cliente.findUnique({
    where: { email: email.toLowerCase() },
    select: { id: true, nombre: true, email: true, telefono: true },
  });
  if (!cliente) {
    return NextResponse.json({ vehiculos: [], cliente: null });
  }
  const vehiculos = await db.vehiculo.findMany({
    where: { clienteId: cliente.id },
    orderBy: { anio: "desc" },
  });
  return NextResponse.json({ cliente, vehiculos });
}

import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { setClienteCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const email = String(body?.email ?? "").trim().toLowerCase();

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json(
        { error: "Email inválido" },
        { status: 400 },
      );
    }

    // Find or create cliente
    let cliente = await db.cliente.findUnique({ where: { email } });
    if (!cliente) {
      // Provisional name from email
      const nombre = email.split("@")[0].replace(/[._-]+/g, " ").slice(0, 40);
      cliente = await db.cliente.create({
        data: { nombre, email, telefono: "" },
      });
    }

    const citas = await db.cita.findMany({
      where: { clienteId: cliente.id },
      include: { servicio: true, vehiculo: true },
      orderBy: [{ fecha: "desc" }, { hora: "desc" }],
    });

    return NextResponse.json(
      { cliente, citas },
      {
        status: 200,
        headers: { ...setClienteCookie(email) },
      },
    );
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "No se pudo iniciar sesión" }, { status: 500 });
  }
}

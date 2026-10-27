import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { servicioId, tipoVehiculo } = body ?? {};

    if (!servicioId) {
      return NextResponse.json(
        { error: "servicioId es obligatorio" },
        { status: 400 },
      );
    }
    if (!["auto", "camioneta"].includes(tipoVehiculo)) {
      return NextResponse.json(
        { error: "tipoVehiculo debe ser 'auto' o 'camioneta'" },
        { status: 400 },
      );
    }

    const servicio = await db.servicio.findUnique({ where: { id: servicioId } });
    if (!servicio) {
      return NextResponse.json(
        { error: "Servicio no encontrado" },
        { status: 404 },
      );
    }

    let precio: number;
    if (tipoVehiculo === "auto") {
      precio = servicio.precioAuto;
    } else {
      precio = servicio.precioCamioneta ?? servicio.precioAuto;
    }

    return NextResponse.json({
      servicioId,
      servicioNombre: servicio.nombre,
      servicioIcono: servicio.icono,
      tipoVehiculo,
      precio,
      tiempoEstimado: servicio.duracionMin,
      // Desglose simple: mano de obra + insumos (50/50 estimación)
      desglose: {
        manoObra: Math.round(precio * 0.5),
        refaccionesInsumos: Math.round(precio * 0.5),
        iva: Math.round(precio * 0.16),
        total: Math.round(precio * 1.16),
      },
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "No se pudo generar la cotización" },
      { status: 500 },
    );
  }
}

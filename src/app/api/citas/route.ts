import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { isAdminAuthed } from "@/lib/auth";
import {
  findOrCreateCliente,
  findOrCreateVehiculo,
  isEstadoValido,
  isPastDate,
  type EstadoCita,
} from "@/lib/cita-helpers";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      servicioId,
      marca,
      modelo,
      anio,
      placas,
      color,
      vehiculoId,
      fecha,
      hora,
      nombre,
      email,
      telefono,
      notas,
    } = body ?? {};

    // Validate required fields
    const errors: string[] = [];
    if (!servicioId) errors.push("servicioId");
    if (!marca && !vehiculoId) errors.push("marca");
    if (!modelo && !vehiculoId) errors.push("modelo");
    if (!anio && !vehiculoId) errors.push("anio");
    if (!fecha) errors.push("fecha");
    if (!hora) errors.push("hora");
    if (!nombre) errors.push("nombre");
    if (!email) errors.push("email");
    if (!telefono) errors.push("telefono");

    if (errors.length) {
      return NextResponse.json(
        { error: "Faltan campos: " + errors.join(", ") },
        { status: 400 },
      );
    }

    if (isPastDate(fecha)) {
      return NextResponse.json(
        { error: "La fecha no puede ser en el pasado." },
        { status: 400 },
      );
    }

    // Validate servicio exists
    const servicio = await db.servicio.findUnique({ where: { id: servicioId } });
    if (!servicio) {
      return NextResponse.json({ error: "Servicio no encontrado" }, { status: 404 });
    }

    // Validate the slot is still free
    const existingAt = await db.cita.findFirst({
      where: { fecha, hora, estado: { not: "cancelada" } },
    });
    if (existingAt) {
      return NextResponse.json(
        { error: "Ese horario ya está ocupado. Elige otro." },
        { status: 409 },
      );
    }

    // Create/find cliente and vehiculo
    const cliente = await findOrCreateCliente({
      nombre,
      email,
      telefono,
    });

    let vehiculo;
    if (vehiculoId) {
      vehiculo = await db.vehiculo.findFirst({
        where: { id: vehiculoId, clienteId: cliente.id },
      });
      if (!vehiculo) {
        return NextResponse.json(
          { error: "Vehículo no encontrado para este cliente" },
          { status: 404 },
        );
      }
    } else {
      vehiculo = await findOrCreateVehiculo({
        clienteId: cliente.id,
        marca,
        modelo,
        anio: Number(anio),
        placas: placas ?? null,
        color: color ?? null,
      });
    }

    const cita = await db.cita.create({
      data: {
        clienteId: cliente.id,
        vehiculoId: vehiculo.id,
        servicioId: servicio.id,
        fecha,
        hora,
        estado: "en_espera",
        notas: notas ?? null,
      },
      include: {
        servicio: true,
        cliente: true,
        vehiculo: true,
      },
    });

    return NextResponse.json(cita, { status: 201 });
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "No se pudo crear la cita" },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const authed = await isAdminAuthed();
  if (!authed) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(req.url);
    const fecha = searchParams.get("fecha");
    const estado = searchParams.get("estado");

    const where: {
      fecha?: string;
      estado?: EstadoCita;
    } = {};
    if (fecha) where.fecha = fecha;
    if (estado && isEstadoValido(estado)) where.estado = estado;

    const citas = await db.cita.findMany({
      where,
      include: {
        cliente: true,
        vehiculo: true,
        servicio: true,
      },
      orderBy: [{ fecha: "asc" }, { hora: "asc" }],
    });

    return NextResponse.json(citas);
  } catch (e) {
    console.error(e);
    return NextResponse.json(
      { error: "No se pudieron cargar las citas" },
      { status: 500 },
    );
  }
}

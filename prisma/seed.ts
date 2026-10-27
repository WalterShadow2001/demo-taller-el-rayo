/* eslint-disable no-console */
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL!;
const token = process.env.TURSO_AUTH_TOKEN;
const client = createClient({ url, authToken: token });

function uid(prefix: string, i: number): string {
  return `${prefix}-${i.toString().padStart(4, "0")}`;
}

async function exec(sql: string, args: unknown[] = []) {
  try {
    await client.execute({ sql, args });
  } catch (e) {
    console.warn("SQL failed:", (e as Error).message, sql.slice(0, 80));
  }
}

function isoOffset(days: number): string {
  const d = new Date(Date.now() + days * 86400000);
  return d.toISOString();
}

function dateKeyOffset(days: number): string {
  const d = new Date(Date.now() + days * 86400000);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function main() {
  // Wipe
  for (const t of ["Cita", "Vehiculo", "Cliente", "Servicio", "HorarioTaller"]) {
    await exec(`DELETE FROM "${t}";`);
  }

  /* ---------- Servicios ---------- */
  const servicios = [
    {
      nombre: "Cambio de aceite",
      descripcion:
        "Cambio de aceite motor con filtro nuevo. Aceite sintético o mineral según tu motor.",
      precioAuto: 450,
      precioCamioneta: 550,
      duracionMin: 30,
      icono: "🛢️",
    },
    {
      nombre: "Frenos delanteros",
      descripcion:
        "Cambio de balatas delanteras, rectificado de discos y ajuste de sistema de frenado.",
      precioAuto: 1200,
      precioCamioneta: 1500,
      duracionMin: 90,
      icono: "🛑",
    },
    {
      nombre: "Alineación y balanceo",
      descripcion:
        "Alineación de dirección 4 puntos + balanceo de las 4 llantas.",
      precioAuto: 600,
      precioCamioneta: 700,
      duracionMin: 45,
      icono: "⚖️",
    },
    {
      nombre: "Diagnóstico computarizado",
      descripcion:
        "Escáner OBD-II completo, reporte de códigos y recomendación de reparación.",
      precioAuto: 400,
      precioCamioneta: 400,
      duracionMin: 60,
      icono: "💻",
    },
    {
      nombre: "Suspensión",
      descripcion:
        "Revisión y cambio de amortiguadores, rótulas, terminales y espirales.",
      precioAuto: 1800,
      precioCamioneta: 2200,
      duracionMin: 120,
      icono: "🔧",
    },
    {
      nombre: "Transmisión",
      descripcion:
        "Servicio completo de transmisión automática o estándar, filtros y aceite.",
      precioAuto: 3500,
      precioCamioneta: 4500,
      duracionMin: 240,
      icono: "⚙️",
    },
    {
      nombre: "Sistema eléctrico",
      descripcion:
        "Diagnóstico y reparación de sistema eléctrico: batería, alternador, motor de arranque.",
      precioAuto: 500,
      precioCamioneta: 500,
      duracionMin: 60,
      icono: "⚡",
    },
    {
      nombre: "Afinamiento mayor",
      descripcion:
        "Cambio de bujías, filtros de aire y gasolina, calibración de tiempo y limpieza de inyectores.",
      precioAuto: 1200,
      precioCamioneta: 1500,
      duracionMin: 120,
      icono: "🚗",
    },
  ];

  const srvIds: string[] = [];
  for (let i = 0; i < servicios.length; i++) {
    const id = uid("srv", i);
    srvIds.push(id);
    const s = servicios[i];
    await exec(
      `INSERT INTO "Servicio" ("id","nombre","descripcion","precioAuto","precioCamioneta","duracionMin","icono") VALUES (?,?,?,?,?,?,?);`,
      [
        id,
        s.nombre,
        s.descripcion,
        s.precioAuto,
        s.precioCamioneta,
        s.duracionMin,
        s.icono,
      ],
    );
  }
  console.log(`Inserted ${servicios.length} servicios`);

  /* ---------- Clientes ---------- */
  const clientes = [
    {
      id: "cli-0000",
      nombre: "Carlos Mendoza",
      email: "carlos@email.com",
      telefono: "6391000001",
    },
    {
      id: "cli-0001",
      nombre: "María Fernández",
      email: "maria@gmail.com",
      telefono: "6391000002",
    },
    {
      id: "cli-0002",
      nombre: "Pedro Ramírez",
      email: "pedro@hotmail.com",
      telefono: "6391000003",
    },
    {
      id: "cli-0003",
      nombre: "Ana Torres",
      email: "ana.torres@yahoo.com",
      telefono: "6391000004",
    },
    {
      id: "cli-0004",
      nombre: "Luis Castañeda",
      email: "luis@outlook.com",
      telefono: "6391000005",
    },
  ];
  const creadoOffset = isoOffset(-30);
  for (const c of clientes) {
    await exec(
      `INSERT INTO "Cliente" ("id","nombre","email","telefono","creadoEn") VALUES (?,?,?,?,?);`,
      [c.id, c.nombre, c.email, c.telefono, creadoOffset],
    );
  }
  console.log(`Inserted ${clientes.length} clientes`);

  /* ---------- Vehiculos ---------- */
  const vehiculos = [
    { id: "veh-0000", marca: "Nissan", modelo: "Tsuru", anio: 2018, placas: "ABC-123", color: "Gris", clienteId: clientes[0].id },
    { id: "veh-0001", marca: "Honda", modelo: "Civic", anio: 2020, placas: "DEF-456", color: "Negro", clienteId: clientes[1].id },
    { id: "veh-0002", marca: "Chevrolet", modelo: "Aveo", anio: 2015, placas: "GHI-789", color: "Rojo", clienteId: clientes[2].id },
    { id: "veh-0003", marca: "Ford", modelo: "Escape", anio: 2022, placas: "JKL-012", color: "Blanco", clienteId: clientes[3].id },
    { id: "veh-0004", marca: "Toyota", modelo: "Hilux", anio: 2021, placas: "MNO-345", color: "Plata", clienteId: clientes[4].id },
  ];
  for (const v of vehiculos) {
    await exec(
      `INSERT INTO "Vehiculo" ("id","marca","modelo","anio","placas","color","clienteId") VALUES (?,?,?,?,?,?,?);`,
      [v.id, v.marca, v.modelo, v.anio, v.placas, v.color, v.clienteId],
    );
  }
  console.log(`Inserted ${vehiculos.length} vehiculos`);

  /* ---------- HorarioTaller ---------- */
  // Lun-Vie (1-5): 08:00-19:00
  for (let d = 1; d <= 5; d++) {
    await exec(
      `INSERT INTO "HorarioTaller" ("id","diaSemana","horaInicio","horaFin") VALUES (?,?,?,?);`,
      [uid("hor", d), d, "08:00", "19:00"],
    );
  }
  // Sábado (6): 09:00-14:00
  await exec(
    `INSERT INTO "HorarioTaller" ("id","diaSemana","horaInicio","horaFin") VALUES (?,?,?,?);`,
    [uid("hor", 6), 6, "09:00", "14:00"],
  );
  // Domingo cerrado: no insertamos
  console.log("Inserted horario taller");

  /* ---------- Citas ---------- */
  const today = dateKeyOffset(0);
  const yesterday = dateKeyOffset(-1);
  const in3days = dateKeyOffset(3);
  const in7days = dateKeyOffset(7);

  const citas = [
    // 2 hoy en_espera
    { fecha: today, hora: "09:30", estado: "en_espera", srv: 0, veh: 0, cli: 0, precioFinal: null, notas: "Cliente solicita aceite sintético" },
    { fecha: today, hora: "11:00", estado: "en_espera", srv: 2, veh: 2, cli: 2, precioFinal: null, notas: "Vibración en volante a partir de 80 km/h" },
    // 1 hoy en_proceso
    { fecha: today, hora: "08:00", estado: "en_proceso", srv: 1, veh: 1, cli: 1, precioFinal: null, notas: "Revisar también balatas traseras" },
    // 1 ayer entregada
    { fecha: yesterday, hora: "10:00", estado: "entregado", srv: 6, veh: 3, cli: 3, precioFinal: 500, notas: "Cambio de batería instalada" },
    // 2 futuras en_espera
    { fecha: in3days, hora: "13:30", estado: "en_espera", srv: 4, veh: 0, cli: 0, precioFinal: null, notas: "Cambio de amortiguadores delanteros" },
    { fecha: in7days, hora: "15:00", estado: "en_espera", srv: 7, veh: 4, cli: 4, precioFinal: null, notas: "Afinamiento completo + ajuste de tiempo" },
  ];

  const citaCreadoOffset = isoOffset(-7);
  for (let i = 0; i < citas.length; i++) {
    const c = citas[i];
    await exec(
      `INSERT INTO "Cita" ("id","clienteId","vehiculoId","servicioId","fecha","hora","estado","precioFinal","notas","creadoEn") VALUES (?,?,?,?,?,?,?,?,?,?);`,
      [
        uid("cit", i),
        clientes[c.cli].id,
        vehiculos[c.veh].id,
        srvIds[c.srv],
        c.fecha,
        c.hora,
        c.estado,
        c.precioFinal,
        c.notas,
        citaCreadoOffset,
      ],
    );
  }
  console.log(`Inserted ${citas.length} citas`);

  console.log("✅ Seed completo");
}

main()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  Car,
  CheckCircle2,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  User,
  Wrench,
} from "lucide-react";
import { db } from "@/lib/db";
import {
  buildWhatsAppLink,
  formatDuracion,
  formatFecha,
  formatHora12,
  formatPrecio,
} from "@/lib/cita-helpers";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { StatusTracker } from "@/components/site/service-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

async function getCita(id: string) {
  try {
    return await db.cita.findUnique({
      where: { id },
      include: { cliente: true, vehiculo: true, servicio: true },
    });
  } catch (e) {
    console.error(e);
    return null;
  }
}

export default async function ConfirmacionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const cita = await getCita(id);
  if (!cita) notFound();

  const vehiculoDesc = `${cita.vehiculo.marca} ${cita.vehiculo.modelo} ${cita.vehiculo.anio}`;
  const folio = cita.id.slice(-8).toUpperCase();
  const whatsapp = buildWhatsAppLink({
    clienteNombre: cita.cliente.nombre,
    clienteEmail: cita.cliente.email,
    vehiculoDesc,
    servicioNombre: cita.servicio.nombre,
    fecha: cita.fecha,
    hora: cita.hora,
    citaId: cita.id,
  });

  const precioEstimado =
    cita.precioFinal ??
    (cita.vehiculo.color?.toLowerCase().includes("camioneta")
      ? cita.servicio.precioCamioneta ?? cita.servicio.precioAuto
      : cita.servicio.precioAuto);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-card/50">
          <div className="bg-industrial-radial absolute inset-0" aria-hidden="true" />
          <div className="container relative mx-auto max-w-3xl px-4 py-10 md:py-14">
            <Button asChild variant="ghost" size="sm" className="mb-4 gap-1.5">
              <Link href="/citas">
                <ArrowLeft className="size-4" />
                Agendar otra cita
              </Link>
            </Button>
            <div className="flex items-center gap-3">
              <span className="grid size-12 place-items-center rounded-full bg-primary/15 text-primary">
                <CheckCircle2 className="size-7" />
              </span>
              <div>
                <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground">
                  ¡Cita confirmada!
                </h1>
                <p className="text-sm text-muted-foreground">
                  Folio: <span className="font-mono font-semibold text-foreground">{folio}</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto max-w-3xl px-4">
            <div className="grid gap-4">
              {/* Status tracker */}
              <Card className="border-border bg-card">
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                      Estado de tu cita
                    </h2>
                    <Badge variant="outline" className="gap-1.5">
                      <span
                        className="size-2 rounded-full status-dot-en_espera"
                        aria-hidden="true"
                      />
                      {cita.estado.replace("_", " ")}
                    </Badge>
                  </div>
                  <StatusTracker estado={cita.estado} createdAt={cita.creadoEn.toISOString()} />
                  <p className="text-xs text-muted-foreground">
                    Guarda este enlace para dar seguimiento. El estado se actualiza
                    conforme avanza el servicio.
                  </p>
                </CardContent>
              </Card>

              {/* Detalles */}
              <Card className="border-border bg-card">
                <CardContent className="flex flex-col gap-4 p-6">
                  <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                    Detalles
                  </h2>
                  <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <DetailItem
                      icon={<Wrench className="size-4 text-primary" />}
                      label="Servicio"
                      value={cita.servicio.nombre}
                    />
                    <DetailItem
                      icon={<Car className="size-4 text-primary" />}
                      label="Vehículo"
                      value={vehiculoDesc}
                    />
                    <DetailItem
                      icon={<CalendarDays className="size-4 text-primary" />}
                      label="Fecha"
                      value={formatFecha(cita.fecha)}
                    />
                    <DetailItem
                      icon={<Clock className="size-4 text-primary" />}
                      label="Hora"
                      value={formatHora12(cita.hora)}
                    />
                    <DetailItem
                      icon={<User className="size-4 text-primary" />}
                      label="Cliente"
                      value={cita.cliente.nombre}
                    />
                    <DetailItem
                      icon={<Phone className="size-4 text-primary" />}
                      label="Teléfono"
                      value={cita.cliente.telefono || "—"}
                    />
                    <DetailItem
                      icon={<Mail className="size-4 text-primary" />}
                      label="Correo"
                      value={cita.cliente.email}
                      span
                    />
                  </dl>
                  {cita.notas ? (
                    <div className="rounded-md border border-border bg-secondary/30 p-3">
                      <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Notas
                      </p>
                      <p className="mt-1 text-sm text-foreground">{cita.notas}</p>
                    </div>
                  ) : null}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
                    <div className="flex flex-col">
                      <span className="text-xs uppercase tracking-widest text-muted-foreground">
                        Precio estimado
                      </span>
                      <span className="font-display text-2xl font-bold text-primary">
                        {formatPrecio(precioEstimado)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Duración aprox. {formatDuracion(cita.servicio.duracionMin)} ·
                        Pago final al recoger el vehículo
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Acciones */}
              <Card className="border-border bg-card">
                <CardContent className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-1">
                    <h3 className="font-display text-sm font-semibold text-foreground">
                      ¿Dudas o cambios?
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Escríbenos por WhatsApp con tu folio a la mano.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm" className="gap-1.5">
                      <Link href="/portal">
                        <User className="size-4" />
                        Ver en portal
                      </Link>
                    </Button>
                    <Button asChild size="sm" className="gap-1.5">
                      <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="size-4" />
                        WhatsApp
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Location reminder */}
              <Card className="border-border bg-card">
                <CardContent className="flex flex-col gap-3 p-6">
                  <h3 className="font-display text-sm font-semibold text-foreground">
                    Cómo llegar
                  </h3>
                  <p className="flex items-start gap-2 text-sm text-muted-foreground">
                    <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
                    Av. Agricultura 125, Col. Centro, Delicias, Chihuahua
                  </p>
                  <Button asChild variant="outline" size="sm" className="w-fit gap-1.5">
                    <a
                      href="https://www.google.com/maps?q=Delicias+Chihuahua"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Abrir en Google Maps
                    </a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
  span,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  span?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-0.5 ${span ? "sm:col-span-2" : ""}`}>
      <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

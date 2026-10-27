import Link from "next/link";
import {
  ArrowRight,
  Calendar,
  Calculator,
  Clock,
  MapPin,
  Phone,
  Shield,
  Wrench,
  Zap,
  Users,
  Car,
  Award,
  Star,
  ChevronRight,
} from "lucide-react";
import { db } from "@/lib/db";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { ServiceCard } from "@/components/site/service-card";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getHomeData() {
  try {
    const [servicios, citasCount, vehiculosCount, clientesCount] = await Promise.all([
      db.servicio.findMany({ take: 4, orderBy: { nombre: "asc" } }),
      db.cita.count(),
      db.vehiculo.count(),
      db.cliente.count(),
    ]);
    return { servicios, citasCount, vehiculosCount, clientesCount };
  } catch (e) {
    console.error(e);
    return { servicios: [], citasCount: 0, vehiculosCount: 0, clientesCount: 0 };
  }
}

function StatCard({
  icon,
  value,
  label,
  delay = 0,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  delay?: number;
}) {
  return (
    <div>
      <Card className="border-border bg-card/70 backdrop-blur">
        <CardContent className="flex flex-col items-start gap-2 p-5">
          <span className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
            {icon}
          </span>
          <div>
            <p className="font-display text-2xl font-bold text-foreground">{value}</p>
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              {label}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default async function HomePage() {
  const { servicios, citasCount, vehiculosCount, clientesCount } =
    await getHomeData();

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-border">
          <div className="bg-industrial-radial absolute inset-0" aria-hidden="true" />
          <div className="bg-industrial-grid absolute inset-0 opacity-30" aria-hidden="true" />
          <div className="container relative mx-auto grid max-w-6xl gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
            <div className="flex flex-col gap-6">
              <Badge className="w-fit gap-1.5 border-primary/30 bg-primary/10 text-primary">
                <span className="size-1.5 rounded-full bg-primary" />
                Delicias, Chihuahua
              </Badge>
              <h1 className="font-display text-4xl font-bold uppercase leading-[0.95] tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Tu auto en
                <br />
                <span className="text-primary">manos expertas.</span>
                <br />
                Servicio mecánico
                <br />
                de verdad.
              </h1>
              <p className="max-w-md text-base text-muted-foreground">
                En <strong className="text-foreground">Taller El Rayo</strong> atendemos
                tu vehículo con honestidad y experiencia. Agenda en línea, cotiza tu
                servicio en segundos y sigue el estado en tiempo real.
              </p>
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Button asChild size="lg" className="gap-2">
                  <Link href="/citas">
                    <Calendar className="size-4" />
                    Agendar cita
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2">
                  <Link href="/cotizador">
                    <Calculator className="size-4" />
                    Cotizar servicio
                  </Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-4 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="size-3.5 text-primary" />
                  Trabajo garantizado
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="size-3.5 text-primary" />
                  Lun–Sáb abiertos
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Star className="size-3.5 text-primary" />
                  +{citasCount || 200} citas atendidas
                </span>
              </div>
            </div>

            {/* Hero card */}
            <div className="relative">
              <div className="absolute -inset-2 rounded-2xl bg-primary/5 blur-2xl" aria-hidden="true" />
              <Card className="relative border-border bg-card/90 backdrop-blur">
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                      Cotiza al instante
                    </span>
                    <Zap className="size-5 text-primary" />
                  </div>
                  <p className="font-display text-2xl font-bold text-foreground">
                    ¿Cuánto cuesta tu servicio?
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Elige el servicio y el tipo de vehículo. Te mostramos el precio estimado,
                    el tiempo en taller y un desglose claro.
                  </p>
                  <Button asChild className="w-fit gap-2" size="lg">
                    <Link href="/cotizador">
                      Ir al cotizador
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <StatCard
                      icon={<Award className="size-5" />}
                      value="17 años"
                      label="De experiencia"
                      delay={0.1}
                    />
                    <StatCard
                      icon={<Car className="size-5" />}
                      value={`${vehiculosCount || 850}+`}
                      label="Vehículos atendidos"
                      delay={0.15}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="border-b border-border bg-card">
          <div className="container mx-auto grid max-w-6xl gap-4 px-4 py-10 sm:grid-cols-2 md:grid-cols-4">
            <StatCard
              icon={<Award className="size-5" />}
              value="17 años"
              label="De experiencia"
              delay={0}
            />
            <StatCard
              icon={<Car className="size-5" />}
              value={`${vehiculosCount || 850}+`}
              label="Vehículos atendidos"
              delay={0.05}
            />
            <StatCard
              icon={<Wrench className="size-5" />}
              value="8 servicios"
              label="Especializados"
              delay={0.1}
            />
            <StatCard
              icon={<Users className="size-5" />}
              value={`${clientesCount || 320}+`}
              label="Clientes satisfechos"
              delay={0.15}
            />
          </div>
        </section>

        {/* Services highlight */}
        <section className="border-b border-border">
          <div className="container mx-auto max-w-6xl px-4 py-16">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <Badge variant="outline" className="mb-2 gap-1.5 border-border bg-card text-primary">
                  <Wrench className="size-3" />
                  Servicios
                </Badge>
                <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground">
                  Lo que hacemos mejor
                </h2>
                <p className="mt-2 max-w-xl text-muted-foreground">
                  Servicios mecánicos profesionales con refacciones de calidad y técnicos
                  certificados. Precios claros, sin sorpresas.
                </p>
              </div>
              <Button asChild variant="outline" className="gap-2">
                <Link href="/servicios">
                  Ver catálogo completo
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {servicios.length === 0 ? (
                <>
                  {[0, 1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-64 w-full rounded-xl" />
                  ))}
                </>
              ) : (
                servicios.map((s) => (
                  <ServiceCard
                    key={s.id}
                    servicio={{
                      id: s.id,
                      nombre: s.nombre,
                      descripcion: s.descripcion,
                      precioAuto: s.precioAuto,
                      precioCamioneta: s.precioCamioneta,
                      duracionMin: s.duracionMin,
                      icono: s.icono,
                    }}
                  />
                ))
              )}
            </div>
          </div>
        </section>

        {/* Contact / location */}
        <section className="bg-card border-b border-border">
          <div className="container mx-auto grid max-w-6xl gap-6 px-4 py-16 md:grid-cols-3">
            <Card className="border-border bg-background">
              <CardContent className="flex flex-col gap-3 p-6">
                <span className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
                  <Phone className="size-5" />
                </span>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Llámanos
                </h3>
                <p className="text-sm text-muted-foreground">
                  Agenda por teléfono o resuelve dudas rápidas.
                </p>
                <a
                  href="tel:+526391234567"
                  className="font-display text-xl font-bold text-primary hover:underline"
                >
                  +52 639 123 4567
                </a>
              </CardContent>
            </Card>

            <Card className="border-border bg-background">
              <CardContent className="flex flex-col gap-3 p-6">
                <span className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
                  <MapPin className="size-5" />
                </span>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Visítanos
                </h3>
                <p className="text-sm text-muted-foreground">
                  Av. Agricultura 125, Col. Centro
                  <br />
                  Delicias, Chihuahua
                </p>
                <a
                  href="https://www.google.com/maps?q=Delicias+Chihuahua"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-primary hover:underline"
                >
                  Cómo llegar →
                </a>
              </CardContent>
            </Card>

            <Card className="border-border bg-background">
              <CardContent className="flex flex-col gap-3 p-6">
                <span className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary">
                  <Clock className="size-5" />
                </span>
                <h3 className="font-display text-lg font-semibold text-foreground">
                  Horario
                </h3>
                <ul className="flex flex-col gap-1 text-sm text-muted-foreground">
                  <li>Lun–Vie · 08:00 – 19:00</li>
                  <li>Sábado · 09:00 – 14:00</li>
                  <li>Domingo · Cerrado</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="relative overflow-hidden">
          <div className="bg-industrial-radial absolute inset-0" aria-hidden="true" />
          <div className="container relative mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-16 text-center">
            <h2 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl">
              Agenda tu cita en 4 pasos
            </h2>
            <p className="max-w-xl text-muted-foreground">
              Sin filas, sin esperas. Reserva en línea, recibe tu folio y sigue el estado
              de tu vehículo desde tu celular.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button asChild size="lg" className="gap-2">
                <Link href="/citas">
                  <Calendar className="size-4" />
                  Agendar ahora
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="gap-2">
                <Link href="/portal">
                  Ver mis citas
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

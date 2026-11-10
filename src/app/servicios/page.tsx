import { ArrowRight, Clock, Wrench, Search, Zap } from "lucide-react";
import { db } from "@/lib/db";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { ServiciosGrid } from "@/components/site/servicios-grid";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDuracion, formatPrecio } from "@/lib/cita-helpers";

export const dynamic = "force-dynamic";

async function getServicios() {
  try {
    return await db.servicio.findMany({ orderBy: { nombre: "asc" } });
  } catch (e) {
    console.error(e);
    return [];
  }
}

export default async function ServiciosPage() {
  const servicios = await getServicios();
  const featured = servicios[0] ?? null;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Header band */}
        <section className="relative border-b border-border bg-card/50">
          <div className="bg-industrial-grid absolute inset-0 -z-10 opacity-20" aria-hidden="true" />
          <div className="bg-hazard-stripes absolute inset-0 -z-10" aria-hidden="true" />
          <div className="container relative mx-auto max-w-6xl px-4 py-12 md:py-16">
            <Badge variant="outline" className="mb-3 gap-1.5 border-border bg-background text-primary">
              <Wrench className="size-3" />
              Catálogo
            </Badge>
            <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Servicios <span className="text-electric-gradient">mecánicos</span>
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Todos los servicios que necesitas para mantener tu vehículo en óptimas
              condiciones. Precios transparentes, tiempos claros. Da clic en{" "}
              <strong className="text-foreground">Agendar</strong> para reservar o en{" "}
              <strong className="text-foreground">Cotizar</strong> para un estimado rápido.
            </p>
          </div>
        </section>

        {/* Featured highlight card with glow-border-card */}
        {featured && (
          <section className="py-10">
            <div className="container mx-auto max-w-6xl px-4">
              <Card className="glow-border-card border-primary/40 bg-card">
                <CardContent className="flex flex-col gap-4 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
                    <span
                      className="grid size-14 shrink-0 place-items-center rounded-md bg-secondary text-3xl"
                      aria-hidden="true"
                    >
                      {featured.icono ?? "🔧"}
                    </span>
                    <div className="flex flex-col gap-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="gap-1.5 border-primary/30 bg-primary/10 text-primary">
                          <Zap className="size-3" />
                          Servicio destacado
                        </Badge>
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
                          <Clock className="size-3" />
                          {formatDuracion(featured.duracionMin)}
                        </span>
                      </div>
                      <h2 className="font-display text-xl font-bold text-foreground">
                        {featured.nombre}
                      </h2>
                      <p className="line-clamp-2 max-w-xl text-sm text-muted-foreground">
                        {featured.descripcion}
                      </p>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                          Desde
                        </span>
                        <span className="font-display text-lg font-bold text-primary">
                          {formatPrecio(featured.precioAuto)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Button asChild size="sm" className="btn-electric gap-1.5">
                      <a href={`/citas?servicio=${featured.id}`}>
                        Agendar
                        <ArrowRight className="size-4" />
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="btn-hazard gap-1.5">
                      <a href={`/cotizador?servicio=${featured.id}`}>
                        Cotizar
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </section>
        )}

        {/* Grid with client-side filter */}
        <section className="py-12">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="mb-6 flex items-center gap-2">
              <Search className="size-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Filtra por nombre del servicio abajo.
              </span>
            </div>
            {servicios.length === 0 ? (
              <Card className="card-electric-hover border-border bg-card">
                <CardContent className="flex flex-col items-center gap-2 p-12 text-center">
                  <Wrench className="size-8 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Aún no hay servicios cargados. Vuelve más tarde.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <ServiciosGrid servicios={servicios} />
            )}
          </div>
        </section>

        <div className="divider-hazard w-32 mx-auto my-8" aria-hidden="true" />
      </main>
      <SiteFooter />
    </div>
  );
}

import { Wrench, Search } from "lucide-react";
import { db } from "@/lib/db";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { ServiciosGrid } from "@/components/site/servicios-grid";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        {/* Header band */}
        <section className="border-b border-border bg-card/50">
          <div className="bg-industrial-grid absolute inset-0 opacity-20" aria-hidden="true" />
          <div className="container relative mx-auto max-w-6xl px-4 py-12 md:py-16">
            <Badge variant="outline" className="mb-3 gap-1.5 border-border bg-background text-primary">
              <Wrench className="size-3" />
              Catálogo
            </Badge>
            <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Servicios mecánicos
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Todos los servicios que necesitas para mantener tu vehículo en óptimas
              condiciones. Precios transparentes, tiempos claros. Da clic en{" "}
              <strong className="text-foreground">Agendar</strong> para reservar o en{" "}
              <strong className="text-foreground">Cotizar</strong> para un estimado rápido.
            </p>
          </div>
        </section>

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
              <Card className="border-border bg-card">
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
      </main>
      <SiteFooter />
    </div>
  );
}

import { Suspense } from "react";
import { Wrench } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { CitaFlow } from "@/components/site/cita-flow";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default function CitasPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-card/50">
          <div className="bg-industrial-grid absolute inset-0 -z-10 opacity-20" aria-hidden="true" />
          <div className="container relative mx-auto max-w-6xl px-4 py-10 md:py-14">
            <Badge variant="outline" className="mb-3 gap-1.5 border-border bg-background text-primary">
              <Wrench className="size-3" />
              Reservación
            </Badge>
            <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Agenda tu cita
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Sigue los 4 pasos. Te tomará menos de 2 minutos. Recibirás un folio y un
              enlace de WhatsApp para seguimiento.
            </p>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto max-w-3xl px-4">
            <Suspense
              fallback={
                <Card className="border-border bg-card">
                  <CardContent className="p-10 text-center text-muted-foreground">
                    Cargando…
                  </CardContent>
                </Card>
              }
            >
              <CitaFlow />
            </Suspense>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

import { Calculator } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { CotizadorClient } from "@/components/site/cotizador-client";
import { Badge } from "@/components/ui/badge";
import { Suspense } from "react";

export const dynamic = "force-dynamic";

export default function CotizadorPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="relative border-b border-border bg-card/50">
          <div className="bg-industrial-grid absolute inset-0 -z-10 opacity-20" aria-hidden="true" />
          <div className="bg-hazard-stripes absolute inset-0 -z-10" aria-hidden="true" />
          <div className="container relative mx-auto max-w-6xl px-4 py-10 md:py-14">
            <Badge variant="outline" className="mb-3 gap-1.5 border-border bg-background text-primary">
              <Calculator className="size-3" />
              Cotizador
            </Badge>
            <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Cotiza tu <span className="text-electric-gradient">servicio</span>
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Obtén una estimación al instante. Elige el servicio y tipo de vehículo,
              te mostramos el precio base, tiempo en taller y desglose.
            </p>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto max-w-5xl px-4">
            <Suspense fallback={<div className="flex flex-col items-center gap-3 py-12 text-muted-foreground"><div className="loader-gear" />Cargando…</div>}>
              <CotizadorClient />
            </Suspense>
          </div>
        </section>

        <div className="divider-hazard w-32 mx-auto my-8" aria-hidden="true" />
      </main>
      <SiteFooter />
    </div>
  );
}

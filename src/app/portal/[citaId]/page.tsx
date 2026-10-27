import { User } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { PortalCitaDetalle } from "@/components/site/portal-cita-detalle";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default function PortalCitaPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-card/50">
          <div className="bg-industrial-grid absolute inset-0 -z-10 opacity-20" aria-hidden="true" />
          <div className="container relative mx-auto max-w-6xl px-4 py-10">
            <Badge variant="outline" className="mb-3 gap-1.5 border-border bg-background text-primary">
              <User className="size-3" />
              Detalle de cita
            </Badge>
            <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl">
              Tu cita
            </h1>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto max-w-3xl px-4">
            <PortalCitaDetalle />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

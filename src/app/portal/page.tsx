import { User } from "lucide-react";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { PortalClient } from "@/components/site/portal-client";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default function PortalPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <section className="border-b border-border bg-card/50">
          <div className="bg-industrial-grid absolute inset-0 -z-10 opacity-20" aria-hidden="true" />
          <div className="container relative mx-auto max-w-6xl px-4 py-10 md:py-14">
            <Badge variant="outline" className="mb-3 gap-1.5 border-border bg-background text-primary">
              <User className="size-3" />
              Portal del cliente
            </Badge>
            <h1 className="font-display text-3xl font-bold uppercase tracking-tight text-foreground sm:text-4xl md:text-5xl">
              Mis citas
            </h1>
            <p className="mt-3 max-w-2xl text-muted-foreground">
              Inicia sesión con tu correo para ver todas tus citas agendadas y dar
              seguimiento al estado de tu vehículo en tiempo real.
            </p>
          </div>
        </section>

        <section className="py-10">
          <div className="container mx-auto max-w-3xl px-4">
            <PortalClient />
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}

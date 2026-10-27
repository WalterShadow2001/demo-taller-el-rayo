import Link from "next/link";
import { Zap, Phone, MapPin, Clock, Facebook, Instagram } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-card">
      <div className="hazard-stripes h-1 w-full" aria-hidden="true" />
      <div className="container mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
        {/* Brand */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground">
              <Zap className="size-5" strokeWidth={2.5} />
            </span>
            <span className="font-display text-lg font-bold uppercase tracking-wide">
              Taller El Rayo
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Mecánica automotriz profesional en Delicias, Chihuahua. Servicio honesto y
            trabajo garantizado desde 2008.
          </p>
          <div className="flex items-center gap-3">
            <a
              href="#"
              aria-label="Facebook"
              className="grid size-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Facebook className="size-4" />
            </a>
            <a
              href="#"
              aria-label="Instagram"
              className="grid size-9 place-items-center rounded-md border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
            >
              <Instagram className="size-4" />
            </a>
          </div>
        </div>

        {/* Contact */}
        <div className="flex flex-col gap-3">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
            Contacto
          </h3>
          <ul className="flex flex-col gap-2.5 text-sm text-muted-foreground">
            <li className="flex items-start gap-2.5">
              <Phone className="mt-0.5 size-4 shrink-0 text-primary" />
              <a href="tel:+526391234567" className="hover:text-foreground">
                +52 639 123 4567
              </a>
            </li>
            <li className="flex items-start gap-2.5">
              <MapPin className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                Av. Agricultura 125, Col. Centro
                <br />
                Delicias, Chihuahua, México
              </span>
            </li>
            <li className="flex items-start gap-2.5">
              <Clock className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>
                Lun–Vie: 08:00 – 19:00
                <br />
                Sábado: 09:00 – 14:00
                <br />
                Domingo: Cerrado
              </span>
            </li>
          </ul>
        </div>

        {/* Links */}
        <div className="flex flex-col gap-3">
          <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
            Enlaces
          </h3>
          <nav className="flex flex-col gap-2 text-sm">
            <Link href="/servicios" className="text-muted-foreground hover:text-primary">
              Catálogo de servicios
            </Link>
            <Link href="/citas" className="text-muted-foreground hover:text-primary">
              Agendar una cita
            </Link>
            <Link href="/cotizador" className="text-muted-foreground hover:text-primary">
              Cotizador rápido
            </Link>
            <Link href="/portal" className="text-muted-foreground hover:text-primary">
              Portal del cliente
            </Link>
            <Link href="/admin" className="text-muted-foreground hover:text-primary">
              Acceso administrador
            </Link>
          </nav>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 py-4 text-xs text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} Taller El Rayo. Todos los derechos reservados.</p>
          <p>Delicias, Chihuahua · Hecho con orgullo mexicano</p>
        </div>
      </div>
    </footer>
  );
}

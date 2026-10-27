"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Zap, Wrench } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const PUBLIC_LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/servicios", label: "Servicios" },
  { href: "/citas", label: "Agendar cita" },
  { href: "/cotizador", label: "Cotizador" },
  { href: "/portal", label: "Portal" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);

  // Close drawer on route change
  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const isAdmin = pathname?.startsWith("/admin");

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="hazard-stripes h-1 w-full" aria-hidden="true" />
      <div className="container mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <Zap className="size-5" strokeWidth={2.5} />
          </span>
          <span className="flex flex-col leading-none">
            <span className="font-display text-lg font-bold uppercase tracking-wide">
              El Rayo
            </span>
            <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
              Taller Mecánico
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {PUBLIC_LINKS.map((l) => {
            const active = pathname === l.href || (l.href !== "/" && pathname?.startsWith(l.href));
            return (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary hover:text-foreground",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                {l.label}
              </Link>
            );
          })}
          <Button asChild size="sm" className="ml-2 gap-1.5">
            <Link href="/admin">
              <Wrench className="size-4" />
              Admin
            </Link>
          </Button>
        </nav>

        {/* Mobile burger */}
        <button
          aria-label="Abrir menú"
          onClick={() => setOpen((v) => !v)}
          className="grid size-10 place-items-center rounded-md text-foreground hover:bg-secondary md:hidden"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-border bg-background md:hidden"
          >
            <nav className="container mx-auto flex max-w-6xl flex-col gap-1 px-4 py-3">
              {PUBLIC_LINKS.map((l) => {
                const active = pathname === l.href || (l.href !== "/" && pathname?.startsWith(l.href));
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={cn(
                      "rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                      active
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    {l.label}
                  </Link>
                );
              })}
              <Button asChild size="sm" className="mt-2 gap-1.5">
                <Link href="/admin">
                  <Wrench className="size-4" />
                  Admin
                </Link>
              </Button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

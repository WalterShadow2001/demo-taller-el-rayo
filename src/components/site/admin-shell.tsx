"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  CalendarDays,
  Car,
  LayoutDashboard,
  LogOut,
  Users,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/citas", label: "Citas", icon: CalendarDays },
  { href: "/admin/vehiculos", label: "Vehículos", icon: Car },
  { href: "/admin/clientes", label: "Clientes", icon: Users },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Top brand bar */}
      <header className="border-b border-border bg-card">
        <div className="hazard-stripes h-1 w-full" aria-hidden="true" />
        <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <Link href="/admin" className="flex items-center gap-2.5">
            <span className="grid size-8 place-items-center rounded-md bg-primary text-primary-foreground">
              <Zap className="size-4" strokeWidth={2.5} />
            </span>
            <span className="font-display text-base font-bold uppercase tracking-wide">
              El Rayo · Admin
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link href="/">Ver sitio</Link>
            </Button>
            <Button onClick={handleLogout} variant="outline" size="sm" className="gap-1.5">
              <LogOut className="size-4" />
              Salir
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-1">
        {/* Sidebar (desktop) */}
        <aside className="hidden w-56 shrink-0 border-r border-border bg-card md:block">
          <nav className="flex flex-col gap-1 p-3">
            {LINKS.map((l) => {
              const active = l.exact ? pathname === l.href : pathname?.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  <l.icon className="size-4" />
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Mobile bottom tabs */}
        <aside className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/90 backdrop-blur md:hidden">
          <nav className="flex justify-around">
            {LINKS.map((l) => {
              const active = l.exact ? pathname === l.href : pathname?.startsWith(l.href);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium",
                    active ? "text-primary" : "text-muted-foreground",
                  )}
                >
                  <l.icon className="size-5" />
                  {l.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main */}
        <main className="flex-1 overflow-x-hidden bg-background pb-20 md:pb-0">
          {children}
        </main>
      </div>
    </div>
  );
}

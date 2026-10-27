"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { ServiceCard, type ServicioData } from "./service-card";
import { Input } from "@/components/ui/input";

export function ServiciosGrid({ servicios }: { servicios: ServicioData[] }) {
  const sp = useSearchParams();
  const initialQ = sp.get("q") ?? "";
  const [q, setQ] = React.useState(initialQ);

  const filtered = React.useMemo(() => {
    if (!q.trim()) return servicios;
    const needle = q.toLowerCase();
    return servicios.filter(
      (s) =>
        s.nombre.toLowerCase().includes(needle) ||
        s.descripcion.toLowerCase().includes(needle),
    );
  }, [q, servicios]);

  return (
    <div className="flex flex-col gap-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Buscar servicio (aceite, frenos, alineación…)"
          className="pl-9 pr-9"
          aria-label="Buscar servicio"
        />
        {q && (
          <button
            type="button"
            onClick={() => setQ("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Limpiar búsqueda"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No encontramos servicios que coincidan con “{q}”.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <ServiceCard key={s.id} servicio={s} />
          ))}
        </div>
      )}
    </div>
  );
}

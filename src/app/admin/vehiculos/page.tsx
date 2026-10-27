"use client";

import * as React from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Car,
  Loader2,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { AdminShell } from "@/components/site/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface Vehiculo {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  placas: string | null;
  color: string | null;
  cliente: { id: string; nombre: string; email: string; telefono: string };
  _count: { citas: number };
}

export default function AdminVehiculosPage() {
  const [vehiculos, setVehiculos] = React.useState<Vehiculo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const load = React.useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/vehiculos");
      if (!res.ok) throw new Error("err");
      const data = await res.json();
      setVehiculos(data);
    } catch (e) {
      console.error(e);
      if (!silent) toast.error("No se pudieron cargar los vehículos");
    } finally {
      if (!silent) setLoading(false);
      else setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return vehiculos;
    const needle = query.toLowerCase();
    return vehiculos.filter(
      (v) =>
        v.marca.toLowerCase().includes(needle) ||
        v.modelo.toLowerCase().includes(needle) ||
        (v.placas ?? "").toLowerCase().includes(needle) ||
        (v.color ?? "").toLowerCase().includes(needle) ||
        String(v.anio).includes(needle) ||
        v.cliente.nombre.toLowerCase().includes(needle) ||
        v.cliente.email.toLowerCase().includes(needle),
    );
  }, [vehiculos, query]);

  return (
    <AdminShell>
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold uppercase tracking-tight">
              Vehículos
            </h1>
            <p className="text-sm text-muted-foreground">
              {vehiculos.length} vehículos registrados
            </p>
          </div>
          <Button
            onClick={() => load(true)}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            {refreshing ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <RefreshCw className="size-4" />
            )}
            Refrescar
          </Button>
        </div>

        {/* Search */}
        <Card className="border-border bg-card">
          <CardContent className="flex items-center gap-2 p-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por marca, modelo, placas, cliente…"
                className="pl-9"
              />
            </div>
            {query && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setQuery("")}
                className="gap-1.5"
              >
                <X className="size-4" />
                Limpiar
              </Button>
            )}
          </CardContent>
        </Card>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-5 animate-spin text-primary" />
            Cargando vehículos…
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="p-10 text-center text-muted-foreground">
              No hay vehículos que coincidan con la búsqueda.
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((v) => (
              <Card key={v.id} className="border-border bg-card">
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="grid size-10 place-items-center rounded-md bg-primary/15 text-primary">
                      <Car className="size-5" />
                    </span>
                    <Badge variant="outline" className="gap-1.5">
                      {v._count.citas} {v._count.citas === 1 ? "cita" : "citas"}
                    </Badge>
                  </div>
                  <div>
                    <p className="font-display text-base font-semibold text-foreground">
                      {v.marca} {v.modelo} {v.anio}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Placas: {v.placas ?? "—"} · Color: {v.color ?? "—"}
                    </p>
                  </div>
                  <div className="border-t border-border pt-2 text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground">Propietario</p>
                    <p>{v.cliente.nombre}</p>
                    <p>{v.cliente.email}</p>
                    <p>{v.cliente.telefono}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        )}
      </div>
    </AdminShell>
  );
}

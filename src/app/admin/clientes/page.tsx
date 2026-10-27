"use client";

import * as React from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Loader2,
  RefreshCw,
  Search,
  User,
  Users,
  X,
} from "lucide-react";
import { AdminShell } from "@/components/site/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  creadoEn: string;
  _count: { vehiculos: number; citas: number };
}

export default function AdminClientesPage() {
  const [clientes, setClientes] = React.useState<Cliente[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const load = React.useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const res = await fetch("/api/clientes");
      if (!res.ok) throw new Error("err");
      const data = await res.json();
      setClientes(data);
    } catch (e) {
      console.error(e);
      if (!silent) toast.error("No se pudieron cargar los clientes");
    } finally {
      if (!silent) setLoading(false);
      else setRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return clientes;
    const needle = query.toLowerCase();
    return clientes.filter(
      (c) =>
        c.nombre.toLowerCase().includes(needle) ||
        c.email.toLowerCase().includes(needle) ||
        c.telefono.toLowerCase().includes(needle),
    );
  }, [clientes, query]);

  return (
    <AdminShell>
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold uppercase tracking-tight">
              Clientes
            </h1>
            <p className="text-sm text-muted-foreground">
              {clientes.length} clientes registrados
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
                placeholder="Buscar por nombre, correo, teléfono…"
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
            Cargando clientes…
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="p-10 text-center text-muted-foreground">
              No hay clientes que coincidan con la búsqueda.
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"
          >
            {filtered.map((c) => (
              <Card key={c.id} className="border-border bg-card">
                <CardContent className="flex flex-col gap-3 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="grid size-10 place-items-center rounded-md bg-primary/15 text-primary">
                      <User className="size-5" />
                    </span>
                    <div className="flex gap-1.5">
                      <Badge variant="outline" className="gap-1.5">
                        <Users className="size-3" />
                        {c._count.citas} {c._count.citas === 1 ? "cita" : "citas"}
                      </Badge>
                      <Badge variant="outline">
                        {c._count.vehiculos} {c._count.vehiculos === 1 ? "vehículo" : "vehículos"}
                      </Badge>
                    </div>
                  </div>
                  <div>
                    <p className="font-display text-base font-semibold text-foreground">
                      {c.nombre}
                    </p>
                    <p className="text-xs text-muted-foreground">{c.email}</p>
                    <p className="text-xs text-muted-foreground">{c.telefono || "Sin teléfono"}</p>
                  </div>
                  <div className="border-t border-border pt-2 text-xs text-muted-foreground">
                    <p>Cliente desde {new Date(c.creadoEn).toLocaleDateString("es-MX")}</p>
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

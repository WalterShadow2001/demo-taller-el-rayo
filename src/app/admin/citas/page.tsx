"use client";

import * as React from "react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Calendar,
  Filter,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { EstadoBadge } from "@/components/site/service-card";
import {
  ESTADOS_CITA,
  formatFechaCorta,
  formatHora12,
  formatPrecio,
  type EstadoCita,
} from "@/lib/cita-helpers";

interface Cita {
  id: string;
  fecha: string;
  hora: string;
  estado: string;
  precioFinal: number | null;
  notas: string | null;
  cliente: { id: string; nombre: string; email: string; telefono: string };
  vehiculo: {
    id: string;
    marca: string;
    modelo: string;
    anio: number;
    placas: string | null;
  };
  servicio: {
    id: string;
    nombre: string;
    precioAuto: number;
    precioCamioneta: number | null;
    icono: string | null;
  };
}

const ESTADO_DEFAULT_LABEL = "Todos los estados";

export default function AdminCitasPage() {
  const [citas, setCitas] = React.useState<Cita[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const [filterFecha, setFilterFecha] = React.useState("");
  const [filterEstado, setFilterEstado] = React.useState<string>("all");
  const [query, setQuery] = React.useState("");

  const load = React.useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (filterFecha) params.set("fecha", filterFecha);
      if (filterEstado !== "all") params.set("estado", filterEstado);
      const res = await fetch(`/api/citas?${params.toString()}`);
      if (!res.ok) throw new Error("err");
      const data = await res.json();
      setCitas(data);
    } catch (e) {
      console.error(e);
      if (!silent) toast.error("No se pudieron cargar las citas");
    } finally {
      if (!silent) setLoading(false);
      else setRefreshing(false);
    }
  }, [filterFecha, filterEstado]);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = React.useMemo(() => {
    if (!query.trim()) return citas;
    const needle = query.toLowerCase();
    return citas.filter(
      (c) =>
        c.cliente.nombre.toLowerCase().includes(needle) ||
        c.cliente.email.toLowerCase().includes(needle) ||
        c.cliente.telefono.toLowerCase().includes(needle) ||
        c.vehiculo.marca.toLowerCase().includes(needle) ||
        c.vehiculo.modelo.toLowerCase().includes(needle) ||
        (c.vehiculo.placas ?? "").toLowerCase().includes(needle) ||
        c.servicio.nombre.toLowerCase().includes(needle),
    );
  }, [citas, query]);

  return (
    <AdminShell>
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-bold uppercase tracking-tight">
              Citas
            </h1>
            <p className="text-sm text-muted-foreground">
              {citas.length} registros · filtra y gestiona
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

        {/* Filters */}
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col gap-3 p-4 md:flex-row md:items-end">
            <div className="flex-1">
              <Label htmlFor="q" className="mb-1.5 flex items-center gap-1.5">
                <Search className="size-4 text-primary" />
                Buscar
              </Label>
              <Input
                id="q"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nombre, correo, placas, servicio…"
              />
            </div>
            <div className="md:w-44">
              <Label htmlFor="fecha" className="mb-1.5 flex items-center gap-1.5">
                <Calendar className="size-4 text-primary" />
                Fecha
              </Label>
              <Input
                id="fecha"
                type="date"
                value={filterFecha}
                onChange={(e) => setFilterFecha(e.target.value)}
              />
            </div>
            <div className="md:w-44">
              <Label htmlFor="estado" className="mb-1.5 flex items-center gap-1.5">
                <Filter className="size-4 text-primary" />
                Estado
              </Label>
              <Select value={filterEstado} onValueChange={setFilterEstado}>
                <SelectTrigger id="estado">
                  <SelectValue placeholder={ESTADO_DEFAULT_LABEL} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{ESTADO_DEFAULT_LABEL}</SelectItem>
                  {ESTADOS_CITA.map((e) => (
                    <SelectItem key={e.value} value={e.value}>
                      {e.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(filterFecha || filterEstado !== "all") && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setFilterFecha("");
                  setFilterEstado("all");
                }}
                className="gap-1.5"
              >
                <X className="size-4" />
                Limpiar
              </Button>
            )}
          </CardContent>
        </Card>

        {/* List */}
        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-5 animate-spin text-primary" />
            Cargando citas…
          </div>
        ) : filtered.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="p-10 text-center text-muted-foreground">
              No hay citas que coincidan con el filtro.
            </CardContent>
          </Card>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-2"
          >
            {filtered.map((c) => (
              <CitaRow key={c.id} cita={c} onUpdated={() => load(true)} />
            ))}
          </motion.div>
        )}
      </div>
    </AdminShell>
  );
}

function CitaRow({ cita, onUpdated }: { cita: Cita; onUpdated: () => void }) {
  const [open, setOpen] = React.useState(false);
  const [estado, setEstado] = React.useState(cita.estado);
  const [precioFinal, setPrecioFinal] = React.useState<string>(
    cita.precioFinal != null ? String(cita.precioFinal) : "",
  );
  const [notas, setNotas] = React.useState(cita.notas ?? "");
  const [saving, setSaving] = React.useState(false);

  const precioSugerido = cita.servicio.precioAuto;

  const handleSave = async () => {
    setSaving(true);
    try {
      const body: Record<string, unknown> = { estado };
      if (precioFinal !== "") body.precioFinal = Number(precioFinal);
      else body.precioFinal = null;
      body.notas = notas.trim() || null;
      const res = await fetch(`/api/citas/${cita.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("err");
      toast.success("Cita actualizada");
      setOpen(false);
      onUpdated();
    } catch (e) {
      console.error(e);
      toast.error("No se pudo actualizar");
    } finally {
      setSaving(false);
    }
  };

  const handleQuickEstado = async (newEstado: EstadoCita) => {
    setSaving(true);
    try {
      const res = await fetch(`/api/citas/${cita.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: newEstado }),
      });
      if (!res.ok) throw new Error("err");
      toast.success("Estado actualizado");
      setEstado(newEstado);
      onUpdated();
    } catch (e) {
      console.error(e);
      toast.error("No se pudo cambiar el estado");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="text-xl" aria-hidden="true">
              {cita.servicio.icono ?? "🔧"}
            </span>
            <span className="font-display text-base font-semibold text-foreground">
              {cita.servicio.nombre}
            </span>
            <EstadoBadge estado={cita.estado} />
          </div>
          <p className="text-xs text-muted-foreground">
            {cita.cliente.nombre} · {cita.vehiculo.marca} {cita.vehiculo.modelo}{" "}
            {cita.vehiculo.anio}
            {cita.vehiculo.placas ? ` · ${cita.vehiculo.placas}` : ""}
          </p>
          <p className="font-mono text-xs text-muted-foreground">
            {formatFechaCorta(cita.fecha)} · {formatHora12(cita.hora)} · Folio {cita.id.slice(-8).toUpperCase()}
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <Select
            value={estado}
            onValueChange={(v) => handleQuickEstado(v as EstadoCita)}
            disabled={saving}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Cambiar estado" />
            </SelectTrigger>
            <SelectContent>
              {ESTADOS_CITA.map((e) => (
                <SelectItem key={e.value} value={e.value}>
                  {e.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                Editar
              </Button>
            </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full overflow-y-auto sm:max-w-md"
            >
              <SheetHeader>
                <SheetTitle>Editar cita</SheetTitle>
                <SheetDescription>
                  Folio {cita.id.slice(-8).toUpperCase()} · {cita.servicio.nombre}
                </SheetDescription>
              </SheetHeader>
              <div className="mt-4 flex flex-col gap-4">
                <div>
                  <Label className="mb-1.5">Estado</Label>
                  <Select value={estado} onValueChange={setEstado}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {ESTADOS_CITA.map((e) => (
                        <SelectItem key={e.value} value={e.value}>
                          {e.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="mb-1.5">Precio final</Label>
                  <Input
                    type="number"
                    value={precioFinal}
                    onChange={(e) => setPrecioFinal(e.target.value)}
                    placeholder={`Sugerido: ${precioSugerido}`}
                  />
                  <p className="mt-1 text-xs text-muted-foreground">
                    Precio base auto: {formatPrecio(cita.servicio.precioAuto)}
                    {cita.servicio.precioCamioneta
                      ? ` · Camioneta: ${formatPrecio(cita.servicio.precioCamioneta)}`
                      : ""}
                  </p>
                </div>

                <div>
                  <Label className="mb-1.5">Notas</Label>
                  <textarea
                    className="min-h-24 w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                    value={notas}
                    onChange={(e) => setNotas(e.target.value)}
                    placeholder="Notas internas del taller"
                  />
                </div>

                <div className="rounded-md border border-border bg-secondary/30 p-3 text-xs">
                  <p className="font-semibold">Cliente</p>
                  <p>{cita.cliente.nombre}</p>
                  <p>{cita.cliente.email}</p>
                  <p>{cita.cliente.telefono}</p>
                  <p className="mt-2 font-semibold">Vehículo</p>
                  <p>
                    {cita.vehiculo.marca} {cita.vehiculo.modelo} {cita.vehiculo.anio}
                  </p>
                </div>

                <Button onClick={handleSave} disabled={saving} className="gap-1.5">
                  {saving && <Loader2 className="size-4 animate-spin" />}
                  Guardar cambios
                </Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </CardContent>
    </Card>
  );
}

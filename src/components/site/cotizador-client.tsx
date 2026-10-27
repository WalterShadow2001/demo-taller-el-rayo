"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { toast } from "sonner";
import {
  Calculator,
  Car,
  CheckCircle2,
  Clock,
  Loader2,
  Receipt,
  Wrench,
  Zap,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  formatDuracion,
  formatPrecio,
} from "@/lib/cita-helpers";
import { cn } from "@/lib/utils";

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precioAuto: number;
  precioCamioneta: number | null;
  duracionMin: number;
  icono: string | null;
}

interface Cotizacion {
  servicioId: string;
  servicioNombre: string;
  servicioIcono: string | null;
  tipoVehiculo: "auto" | "camioneta";
  precio: number;
  tiempoEstimado: number;
  desglose: {
    manoObra: number;
    refaccionesInsumos: number;
    iva: number;
    total: number;
  };
}

export function CotizadorClient() {
  const sp = useSearchParams();
  const [servicios, setServicios] = React.useState<Servicio[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [servicioId, setServicioId] = React.useState<string>(sp.get("servicio") ?? "");
  const [tipoVehiculo, setTipoVehiculo] = React.useState<"auto" | "camioneta">("auto");
  const [coti, setCoti] = React.useState<Cotizacion | null>(null);
  const [loadingCoti, setLoadingCoti] = React.useState(false);

  // Load servicios
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/servicios");
        if (res.ok) {
          const data: Servicio[] = await res.json();
          setServicios(data);
          const qId = sp.get("servicio");
          if (qId && data.some((s) => s.id === qId)) {
            setServicioId(qId);
          } else if (data.length > 0) {
            setServicioId(data[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch cotización when inputs change
  React.useEffect(() => {
    if (!servicioId) {
      setCoti(null);
      return;
    }
    setLoadingCoti(true);
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/cotizar", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ servicioId, tipoVehiculo }),
        });
        if (!res.ok) throw new Error("err");
        const data = await res.json();
        if (!cancelled) setCoti(data);
      } catch (e) {
        console.error(e);
        if (!cancelled) {
          toast.error("No se pudo calcular la cotización");
          setCoti(null);
        }
      } finally {
        if (!cancelled) setLoadingCoti(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [servicioId, tipoVehiculo]);

  const servicio = servicios.find((s) => s.id === servicioId);

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Inputs */}
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col gap-5 p-6">
          <div className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-md bg-primary/15 text-primary">
              <Calculator className="size-5" />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-foreground">
                Cotizador rápido
              </h2>
              <p className="text-xs text-muted-foreground">
                Estimación sin compromiso. Precio final puede variar según el diagnóstico.
              </p>
            </div>
          </div>

          <div>
            <Label className="mb-2 flex items-center gap-1.5">
              <Wrench className="size-4 text-primary" />
              Tipo de vehículo
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {(["auto", "camioneta"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setTipoVehiculo(t)}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-md border px-4 py-3 text-sm font-medium transition-colors",
                    tipoVehiculo === t
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-background text-muted-foreground hover:bg-secondary",
                  )}
                >
                  <Car className="size-4" />
                  {t === "auto" ? "Auto / Sedán" : "Camioneta / SUV"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="servicio" className="mb-2 flex items-center gap-1.5">
              <Wrench className="size-4 text-primary" />
              Servicio
            </Label>
            {loading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <Select value={servicioId} onValueChange={setServicioId}>
                <SelectTrigger id="servicio" className="w-full">
                  <SelectValue placeholder="Elige un servicio" />
                </SelectTrigger>
                <SelectContent>
                  {servicios.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.icono ? `${s.icono} ` : ""}{s.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            {servicio ? (
              <p className="mt-2 text-sm text-muted-foreground">{servicio.descripcion}</p>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" size="sm" className="gap-1.5">
              <Link href={servicioId ? `/citas?servicio=${servicioId}` : "/citas"}>
                <Zap className="size-4" />
                Agendar este servicio
              </Link>
            </Button>
            <Button asChild variant="ghost" size="sm" className="gap-1.5">
              <Link href="/servicios">
                Ver catálogo completo
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultado */}
      <Card className="relative overflow-hidden border-border bg-card">
        <div className="bg-industrial-radial absolute inset-0" aria-hidden="true" />
        <CardContent className="relative flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Estimación
            </h2>
            {servicio?.icono ? (
              <span className="text-3xl" aria-hidden="true">{servicio.icono}</span>
            ) : null}
          </div>

          {loadingCoti ? (
            <div className="flex flex-col gap-3">
              <Skeleton className="h-10 w-40" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : coti ? (
            <>
              <div>
                <p className="text-xs uppercase tracking-widest text-muted-foreground">
                  Precio base
                </p>
                <p className="font-display text-4xl font-bold text-primary">
                  {formatPrecio(coti.precio)}
                </p>
                <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Clock className="size-4" />
                  Tiempo en taller: {formatDuracion(coti.tiempoEstimado)}
                </p>
              </div>

              <div className="rounded-md border border-border bg-background p-4">
                <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  <Receipt className="size-3.5" />
                  Desglose estimado
                </p>
                <dl className="flex flex-col gap-1.5 text-sm">
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Mano de obra</dt>
                    <dd className="font-medium">{formatPrecio(coti.desglose.manoObra)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">Refacciones e insumos</dt>
                    <dd className="font-medium">{formatPrecio(coti.desglose.refaccionesInsumos)}</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className="text-muted-foreground">IVA (16%)</dt>
                    <dd className="font-medium">{formatPrecio(coti.desglose.iva)}</dd>
                  </div>
                  <div className="mt-1 flex items-center justify-between border-t border-border pt-2">
                    <dt className="font-display font-semibold text-foreground">Total estimado</dt>
                    <dd className="font-display text-xl font-bold text-primary">
                      {formatPrecio(coti.desglose.total)}
                    </dd>
                  </div>
                </dl>
              </div>

              <Badge variant="outline" className="w-fit gap-1.5 border-primary/30 bg-primary/10 text-primary">
                <CheckCircle2 className="size-3" />
                Estimación válida 7 días
              </Badge>

              <p className="text-xs text-muted-foreground">
                * Precio orientativo. El total final depende del diagnóstico en taller y de
                refacciones adicionales necesarias.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Selecciona un servicio para ver la estimación.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

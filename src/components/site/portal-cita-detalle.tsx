"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  Car,
  Clock,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  RefreshCw,
  User,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  buildWhatsAppLink,
  formatDuracion,
  formatFecha,
  formatHora12,
  formatPrecio,
} from "@/lib/cita-helpers";
import { EstadoBadge, StatusTracker } from "./service-card";

interface CitaDetalle {
  id: string;
  fecha: string;
  hora: string;
  estado: string;
  precioFinal: number | null;
  notas: string | null;
  creadoEn: string;
  cliente: { id: string; nombre: string; email: string; telefono: string };
  vehiculo: {
    id: string;
    marca: string;
    modelo: string;
    anio: number;
    placas: string | null;
    color: string | null;
  };
  servicio: {
    id: string;
    nombre: string;
    descripcion: string;
    precioAuto: number;
    precioCamioneta: number | null;
    duracionMin: number;
    icono: string | null;
  };
}

export function PortalCitaDetalle() {
  const params = useParams<{ citaId: string }>();
  const router = useRouter();
  const citaId = params.citaId;
  const [cita, setCita] = React.useState<CitaDetalle | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [refreshing, setRefreshing] = React.useState(false);

  const load = React.useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      else setRefreshing(true);
      try {
        const res = await fetch(`/api/citas/${citaId}`);
        if (!res.ok) {
          if (res.status === 404) {
            toast.error("Cita no encontrada");
            router.push("/portal");
            return;
          }
          throw new Error("err");
        }
        const data = await res.json();
        setCita(data);
      } catch (e) {
        console.error(e);
        if (!silent) toast.error("No se pudo cargar la cita");
      } finally {
        if (!silent) setLoading(false);
        else setRefreshing(false);
      }
    },
    [citaId, router],
  );

  React.useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center gap-2 py-12 text-muted-foreground">
        <Loader2 className="size-5 animate-spin text-primary" />
        Cargando cita…
      </div>
    );
  }

  if (!cita) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-center">
        <p className="text-muted-foreground">No se pudo cargar la cita.</p>
        <Button asChild variant="outline" size="sm" className="gap-1.5">
          <Link href="/portal">
            <ArrowLeft className="size-4" />
            Volver al portal
          </Link>
        </Button>
      </div>
    );
  }

  const vehiculoDesc = `${cita.vehiculo.marca} ${cita.vehiculo.modelo} ${cita.vehiculo.anio}`;
  const whatsapp = buildWhatsAppLink({
    clienteNombre: cita.cliente.nombre,
    clienteEmail: cita.cliente.email,
    vehiculoDesc,
    servicioNombre: cita.servicio.nombre,
    fecha: cita.fecha,
    hora: cita.hora,
    citaId: cita.id,
  });
  const folio = cita.id.slice(-8).toUpperCase();
  const precioEstimado =
    cita.precioFinal ?? cita.servicio.precioAuto;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-4"
    >
      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link href="/portal">
            <ArrowLeft className="size-4" />
            Volver
          </Link>
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          onClick={() => load(true)}
          disabled={refreshing}
        >
          {refreshing ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <RefreshCw className="size-4" />
          )}
          Refrescar
        </Button>
      </div>

      {/* Header */}
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col gap-3 p-6">
          <div className="flex items-center gap-3">
            <span className="text-3xl" aria-hidden="true">
              {cita.servicio.icono ?? "🔧"}
            </span>
            <div>
              <h1 className="font-display text-2xl font-bold text-foreground">
                {cita.servicio.nombre}
              </h1>
              <p className="text-xs text-muted-foreground">
                Folio: <span className="font-mono font-semibold text-foreground">{folio}</span>
              </p>
            </div>
          </div>
          <EstadoBadge estado={cita.estado} />
        </CardContent>
      </Card>

      {/* Status tracker */}
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col gap-4 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
              Estado del servicio
            </h2>
          </div>
          <StatusTracker estado={cita.estado} createdAt={cita.creadoEn} />
        </CardContent>
      </Card>

      {/* Detalles */}
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col gap-4 p-6">
          <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            Detalles de la cita
          </h2>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <Detail
              icon={<CalendarDays className="size-4 text-primary" />}
              label="Fecha"
              value={formatFecha(cita.fecha)}
            />
            <Detail
              icon={<Clock className="size-4 text-primary" />}
              label="Hora"
              value={formatHora12(cita.hora)}
            />
            <Detail
              icon={<Car className="size-4 text-primary" />}
              label="Vehículo"
              value={vehiculoDesc}
            />
            <Detail
              icon={<Car className="size-4 text-primary" />}
              label="Placas"
              value={cita.vehiculo.placas ?? "—"}
            />
            <Detail
              icon={<User className="size-4 text-primary" />}
              label="Cliente"
              value={cita.cliente.nombre}
            />
            <Detail
              icon={<Phone className="size-4 text-primary" />}
              label="Teléfono"
              value={cita.cliente.telefono || "—"}
            />
            <Detail
              icon={<Mail className="size-4 text-primary" />}
              label="Correo"
              value={cita.cliente.email}
              span
            />
            <Detail
              icon={<Wrench className="size-4 text-primary" />}
              label="Duración estimada"
              value={formatDuracion(cita.servicio.duracionMin)}
              span
            />
          </dl>

          {cita.notas ? (
            <div className="rounded-md border border-border bg-secondary/30 p-3">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Notas
              </p>
              <p className="mt-1 text-sm text-foreground">{cita.notas}</p>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground">
                Precio {cita.precioFinal != null ? "final" : "estimado"}
              </p>
              <p className="font-display text-2xl font-bold text-primary">
                {formatPrecio(precioEstimado)}
              </p>
            </div>
            <Button asChild size="sm" className="gap-1.5">
              <a href={whatsapp} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="size-4" />
                WhatsApp
              </a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function Detail({
  icon,
  label,
  value,
  span,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  span?: boolean;
}) {
  return (
    <div className={`flex flex-col gap-0.5 ${span ? "sm:col-span-2" : ""}`}>
      <dt className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-widest text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="text-sm font-medium text-foreground">{value}</dd>
    </div>
  );
}

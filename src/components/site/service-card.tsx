"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Clock, ArrowRight, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  formatDuracion,
  formatPrecio,
  type EstadoCita,
  ESTADO_PASOS,
  ESTADO_LABEL,
  getEstadoIndex,
} from "@/lib/cita-helpers";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export interface ServicioData {
  id: string;
  nombre: string;
  descripcion: string;
  precioAuto: number;
  precioCamioneta: number | null;
  duracionMin: number;
  icono: string | null;
}

export function ServiceCard({ servicio }: { servicio: ServicioData }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.3 }}
    >
      <Card className="group relative overflow-hidden border-border bg-card transition-colors hover:border-primary/60">
        <div className="pointer-events-none absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-primary to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
        <CardContent className="flex h-full flex-col gap-3 p-5">
          <div className="flex items-start justify-between gap-3">
            <span
              className="grid size-12 shrink-0 place-items-center rounded-md bg-secondary text-2xl"
              aria-hidden="true"
            >
              {servicio.icono ?? "🔧"}
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-secondary/60 px-2.5 py-1 text-xs font-medium text-muted-foreground">
              <Clock className="size-3" />
              {formatDuracion(servicio.duracionMin)}
            </span>
          </div>

          <div className="flex flex-col gap-1">
            <h3 className="font-display text-lg font-semibold leading-tight text-foreground">
              {servicio.nombre}
            </h3>
            <p className="line-clamp-2 text-sm text-muted-foreground">
              {servicio.descripcion}
            </p>
          </div>

          <div className="mt-auto flex items-end justify-between gap-3 border-t border-border pt-3">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                Desde
              </span>
              <span className="font-display text-xl font-bold text-primary">
                {formatPrecio(servicio.precioAuto)}
              </span>
              {servicio.precioCamioneta ? (
                <span className="text-[11px] text-muted-foreground">
                  Camioneta: {formatPrecio(servicio.precioCamioneta)}
                </span>
              ) : null}
            </div>

            <div className="flex flex-col gap-2">
              <Button
                asChild
                size="sm"
                className="gap-1.5"
              >
                <Link href={`/citas?servicio=${servicio.id}`}>
                  Agendar
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button
                asChild
                size="sm"
                variant="outline"
                className="gap-1.5"
              >
                <Link href={`/cotizador?servicio=${servicio.id}`}>
                  Cotizar
                  <ChevronRight className="size-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function EstadoBadge({ estado }: { estado: EstadoCita | string }) {
  const e = (estado as EstadoCita) ?? "en_espera";
  const label = ESTADO_LABEL[e] ?? estado;
  const color =
    e === "en_espera"
      ? "var(--status-en_espera)"
      : e === "en_proceso"
        ? "var(--status-en_proceso)"
        : e === "listo"
          ? "var(--status-listo)"
          : e === "entregado"
            ? "var(--status-entregado)"
            : "var(--status-cancelada)";

  return (
    <Badge
      variant="outline"
      className="gap-1.5 border-border bg-secondary/50 font-medium"
      style={{ color: "var(--foreground)" }}
    >
      <span
        className="size-2 rounded-full"
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {label}
    </Badge>
  );
}

export interface StatusTrackerProps {
  estado: EstadoCita | string;
  createdAt?: string;
}

/**
 * 4-stage visual status tracker. Cancelada is rendered as an alert banner above.
 */
export function StatusTracker({ estado }: StatusTrackerProps) {
  const e = (estado as EstadoCita) ?? "en_espera";
  const currentIdx = getEstadoIndex(e);
  const isCanceled = e === "cancelada";

  return (
    <div className="flex flex-col gap-3">
      {isCanceled && (
        <div className="rounded-md border border-[var(--status-cancelada)] bg-[var(--status-cancelada)]/10 px-4 py-2 text-sm text-[var(--status-cancelada)]">
          Esta cita fue cancelada. Si crees que es un error, comunícate con el taller.
        </div>
      )}

      <ol className="grid grid-cols-1 gap-3 sm:grid-cols-4">
        {ESTADO_PASOS.map((paso, i) => {
          const done = !isCanceled && i < currentIdx;
          const active = !isCanceled && i === currentIdx;
          const last = i === ESTADO_PASOS.length - 1;
          return (
            <li
              key={paso.value}
              className={cn(
                "relative flex flex-col gap-2 rounded-md border border-border bg-card p-3",
                active && "border-primary",
              )}
            >
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full border-2 text-xs font-bold",
                    done
                      ? "border-primary bg-primary text-primary-foreground"
                      : active
                        ? "border-primary text-primary"
                        : "border-border text-muted-foreground",
                  )}
                >
                  {done ? "✓" : i + 1}
                </span>
                {!last && (
                  <span
                    className={cn(
                      "hidden h-px flex-1 sm:block",
                      done ? "bg-primary" : "bg-border",
                    )}
                  />
                )}
              </div>
              <div className="flex flex-col">
                <span
                  className={cn(
                    "font-display text-sm font-semibold",
                    active || done ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {paso.label}
                </span>
                <span className="text-[11px] text-muted-foreground">{paso.description}</span>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

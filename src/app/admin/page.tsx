"use client";

import * as React from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  CalendarDays,
  Car,
  DollarSign,
  Loader2,
  TrendingUp,
  Users,
  Wrench,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AdminShell } from "@/components/site/admin-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EstadoBadge } from "@/components/site/service-card";
import {
  formatFechaCorta,
  formatHora12,
  formatPrecio,
} from "@/lib/cita-helpers";

interface Stats {
  counts: {
    today: number;
    en_espera: number;
    en_proceso: number;
    listo: number;
    entregado: number;
    cancelada: number;
    total: number;
  };
  ingresosMes: number;
  ingresosPorDia: { fecha: string; label: string; total: number }[];
  topServicios: { nombre: string; count: number; ingresos: number }[];
  ingresosPorServicio: { nombre: string; count: number; ingresos: number }[];
  citasToday: any[];
  upcoming: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/admin/stats");
        if (!res.ok) throw new Error("err");
        const data = await res.json();
        setStats(data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <AdminShell>
      <div className="flex flex-col gap-6 p-4 md:p-8">
        <div>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight">
            Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">
            Resumen operativo del taller · {formatFechaCorta(formatTodayKey())}
          </p>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Loader2 className="size-5 animate-spin text-primary" />
            Cargando estadísticas…
          </div>
        ) : stats ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-6"
          >
            {/* KPI cards */}
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                icon={<CalendarDays className="size-5" />}
                value={stats.counts.today}
                label="Citas de hoy"
                accent="var(--status-en_proceso)"
              />
              <KpiCard
                icon={<DollarSign className="size-5" />}
                value={formatPrecio(stats.ingresosMes)}
                label="Ingresos del mes"
                accent="var(--primary)"
              />
              <KpiCard
                icon={<TrendingUp className="size-5" />}
                value={stats.counts.en_espera}
                label="Citas en espera"
                accent="var(--status-en_espera)"
              />
              <KpiCard
                icon={<Wrench className="size-5" />}
                value={stats.counts.en_proceso}
                label="Citas en proceso"
                accent="var(--status-en_proceso)"
              />
            </div>

            {/* Ingresos por día */}
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col gap-4 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-display text-base font-semibold text-foreground">
                      Ingresos últimos 14 días
                    </h2>
                    <p className="text-xs text-muted-foreground">
                      Total por día (precio final o estimado)
                    </p>
                  </div>
                  <BarChart3 className="size-5 text-primary" />
                </div>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.ingresosPorDia}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                      <XAxis
                        dataKey="label"
                        tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                        tickLine={false}
                        axisLine={{ stroke: "rgba(255,255,255,0.10)" }}
                      />
                      <YAxis
                        tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(v) => `$${v}`}
                      />
                      <Tooltip
                        contentStyle={{
                          background: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: 8,
                          color: "var(--foreground)",
                        }}
                        formatter={(v: number) => formatPrecio(v)}
                        labelStyle={{ color: "var(--muted-foreground)" }}
                      />
                      <Bar dataKey="total" fill="var(--primary)" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Top servicios */}
              <Card className="border-border bg-card">
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-base font-semibold text-foreground">
                        Top servicios
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Más solicitados (por # de citas)
                      </p>
                    </div>
                    <Wrench className="size-5 text-primary" />
                  </div>
                  {stats.topServicios.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin datos aún.</p>
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart layout="vertical" data={stats.topServicios}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                          <XAxis
                            type="number"
                            tick={{ fill: "var(--muted-foreground)", fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            type="category"
                            dataKey="nombre"
                            tick={{ fill: "var(--foreground)", fontSize: 11 }}
                            tickLine={false}
                            axisLine={false}
                            width={110}
                          />
                          <Tooltip
                            contentStyle={{
                              background: "var(--card)",
                              border: "1px solid var(--border)",
                              borderRadius: 8,
                              color: "var(--foreground)",
                            }}
                          />
                          <Bar dataKey="count" fill="var(--chart-2)" radius={[0, 4, 4, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Ingresos por servicio (pie) */}
              <Card className="border-border bg-card">
                <CardContent className="flex flex-col gap-4 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="font-display text-base font-semibold text-foreground">
                        Ingresos por servicio
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Distribución de ingresos
                      </p>
                    </div>
                    <BarChart3 className="size-5 text-primary" />
                  </div>
                  {stats.ingresosPorServicio.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin datos aún.</p>
                  ) : (
                    <div className="h-64 w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={stats.ingresosPorServicio}
                            dataKey="ingresos"
                            nameKey="nombre"
                            outerRadius={90}
                            label={(entry: any) => entry.nombre}
                            labelLine={false}
                          >
                            {stats.ingresosPorServicio.map((_, i) => (
                              <Cell
                                key={i}
                                fill={`var(--chart-${(i % 5) + 1})`}
                              />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              background: "var(--card)",
                              border: "1px solid var(--border)",
                              borderRadius: 8,
                              color: "var(--foreground)",
                            }}
                            formatter={(v: number) => formatPrecio(v)}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Today's citas + upcoming */}
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="border-border bg-card">
                <CardContent className="flex flex-col gap-4 p-6">
                  <h2 className="font-display text-base font-semibold text-foreground">
                    Citas de hoy
                  </h2>
                  {stats.citasToday.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin citas hoy.</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {stats.citasToday.map((c: any) => (
                        <li
                          key={c.id}
                          className="flex items-center justify-between gap-2 rounded-md border border-border bg-background p-3 text-sm"
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              {c.servicio.icono} {c.servicio.nombre}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {c.vehiculo.marca} {c.vehiculo.modelo} · {c.cliente.nombre}
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="font-mono text-xs">
                              {formatHora12(c.hora)}
                            </span>
                            <EstadoBadge estado={c.estado} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card className="border-border bg-card">
                <CardContent className="flex flex-col gap-4 p-6">
                  <h2 className="font-display text-base font-semibold text-foreground">
                    Próximas citas
                  </h2>
                  {stats.upcoming.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Sin próximas citas.</p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {stats.upcoming.map((c: any) => (
                        <li
                          key={c.id}
                          className="flex items-center justify-between gap-2 rounded-md border border-border bg-background p-3 text-sm"
                        >
                          <div className="flex flex-col">
                            <span className="font-semibold">
                              {c.servicio.icono} {c.servicio.nombre}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {c.vehiculo.marca} {c.vehiculo.modelo} · {c.cliente.nombre}
                            </span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="text-xs text-muted-foreground">
                              {formatFechaCorta(c.fecha)} · {formatHora12(c.hora)}
                            </span>
                            <EstadoBadge estado={c.estado} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Resumen counts by estado */}
            <Card className="border-border bg-card">
              <CardContent className="flex flex-col gap-4 p-6">
                <h2 className="font-display text-base font-semibold text-foreground">
                  Resumen por estado
                </h2>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
                  <EstadoCard label="En espera" count={stats.counts.en_espera} color="var(--status-en_espera)" icon={<CalendarDays className="size-4" />} />
                  <EstadoCard label="En proceso" count={stats.counts.en_proceso} color="var(--status-en_proceso)" icon={<Wrench className="size-4" />} />
                  <EstadoCard label="Listo" count={stats.counts.listo} color="var(--status-listo)" icon={<Car className="size-4" />} />
                  <EstadoCard label="Entregado" count={stats.counts.entregado} color="var(--status-entregado)" icon={<Users className="size-4" />} />
                  <EstadoCard label="Cancelada" count={stats.counts.cancelada} color="var(--status-cancelada)" icon={<Car className="size-4" />} />
                  <EstadoCard label="Total" count={stats.counts.total} color="var(--primary)" icon={<BarChart3 className="size-4" />} />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <p className="text-sm text-muted-foreground">No se pudieron cargar las estadísticas.</p>
        )}
      </div>
    </AdminShell>
  );
}

function KpiCard({
  icon,
  value,
  label,
  accent = "var(--primary)",
}: {
  icon: React.ReactNode;
  value: string | number;
  label: string;
  accent?: string;
}) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex items-center gap-3 p-5">
        <span
          className="grid size-11 place-items-center rounded-md"
          style={{
            backgroundColor: `color-mix(in srgb, ${accent} 15%, transparent)`,
            color: accent,
          }}
        >
          {icon}
        </span>
        <div>
          <p className="font-display text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            {label}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

function EstadoCard({
  label,
  count,
  color,
  icon,
}: {
  label: string;
  count: number;
  color: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-background p-3">
      <div className="flex items-center gap-1.5">
        <span
          className="size-2 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden="true"
        />
        <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
      </div>
      <p className="mt-1 font-display text-xl font-bold text-foreground">{count}</p>
      <span className="sr-only">{label}</span>
      <span className="hidden" aria-hidden="true">{icon}</span>
    </div>
  );
}

function formatTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

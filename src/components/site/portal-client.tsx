"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Calendar,
  Car,
  Loader2,
  LogIn,
  LogOut,
  Mail,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  formatFechaCorta,
  formatHora12,
} from "@/lib/cita-helpers";
import { EstadoBadge } from "./service-card";

interface Cliente {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
}

interface Cita {
  id: string;
  fecha: string;
  hora: string;
  estado: string;
  precioFinal: number | null;
  notas: string | null;
  servicio: { id: string; nombre: string; precioAuto: number; precioCamioneta: number | null };
  vehiculo: { id: string; marca: string; modelo: string; anio: number; placas: string | null };
}

export function PortalClient() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [authed, setAuthed] = React.useState(false);
  const [cliente, setCliente] = React.useState<Cliente | null>(null);
  const [citas, setCitas] = React.useState<Cita[]>([]);

  // Check existing session
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/clientes/vehiculos");
        if (res.ok) {
          const data = await res.json();
          if (data.cliente) {
            setAuthed(true);
            setCliente(data.cliente);
            await loadCitas(data.cliente.email);
          }
        }
      } catch (e) {
        console.error(e);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCitas = async (emailArg: string) => {
    try {
      const res = await fetch(
        `/api/clientes/${encodeURIComponent(emailArg)}/citas`,
      );
      if (res.ok) {
        const data = await res.json();
        setCitas(data.citas ?? []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailTrim = email.trim().toLowerCase();
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailTrim)) {
      toast.error("Correo inválido");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/clientes/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: emailTrim }),
      });
      if (!res.ok) {
        throw new Error("err");
      }
      const data = await res.json();
      setCliente(data.cliente);
      setCitas(data.citas ?? []);
      setAuthed(true);
      toast.success(`Bienvenido, ${data.cliente.nombre}`);
    } catch (e) {
      console.error(e);
      toast.error("No se pudo iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch("/api/clientes/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setAuthed(false);
    setCliente(null);
    setCitas([]);
    toast.success("Sesión cerrada");
  };

  if (authed && cliente) {
    return (
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="grid size-12 place-items-center rounded-full bg-primary/15 text-primary">
              <User className="size-6" />
            </span>
            <div>
              <p className="font-display text-2xl font-bold text-foreground">
                Hola, {cliente.nombre}
              </p>
              <p className="text-sm text-muted-foreground">{cliente.email}</p>
            </div>
          </div>
          <Button onClick={handleLogout} variant="outline" size="sm" className="gap-1.5">
            <LogOut className="size-4" />
            Cerrar sesión
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-foreground">
            Mis citas ({citas.length})
          </h2>
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/citas">
              <Calendar className="size-4" />
              Nueva cita
            </Link>
          </Button>
        </div>

        {citas.length === 0 ? (
          <Card className="border-border bg-card">
            <CardContent className="flex flex-col items-center gap-3 p-10 text-center">
              <Calendar className="size-8 text-muted-foreground" />
              <p className="text-muted-foreground">
                No tienes citas agendadas todavía.
              </p>
              <Button asChild className="gap-1.5">
                <Link href="/citas">
                  Agendar mi primera cita
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3">
            {citas.map((c) => (
              <motion.div
                key={c.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Link href={`/portal/${c.id}`}>
                  <Card className="border-border bg-card transition-colors hover:border-primary/60">
                    <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <span className="font-display text-base font-semibold text-foreground">
                            {c.servicio.nombre}
                          </span>
                          <EstadoBadge estado={c.estado} />
                        </div>
                        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <Car className="size-3.5" />
                          {c.vehiculo.marca} {c.vehiculo.modelo} {c.vehiculo.anio}
                          {c.vehiculo.placas ? ` · ${c.vehiculo.placas}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center justify-between gap-3 sm:flex-col sm:items-end">
                        <div className="flex flex-col sm:items-end">
                          <span className="font-display text-sm font-semibold text-foreground">
                            {formatFechaCorta(c.fecha)}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatHora12(c.hora)}
                          </span>
                        </div>
                        <ArrowRight className="size-4 text-muted-foreground" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col gap-5 p-6">
        <div className="flex items-center gap-2">
          <span className="grid size-9 place-items-center rounded-md bg-primary/15 text-primary">
            <LogIn className="size-5" />
          </span>
          <div>
            <h2 className="font-display text-lg font-semibold text-foreground">
              Acceso al portal
            </h2>
            <p className="text-xs text-muted-foreground">
              Sin contraseña. Solo ingresa el correo con el que agendaste.
            </p>
          </div>
        </div>

        <form onSubmit={handleLogin} className="flex flex-col gap-3">
          <div>
            <Label htmlFor="email" className="mb-1.5 flex items-center gap-1.5">
              <Mail className="size-4 text-primary" />
              Correo electrónico
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              autoComplete="email"
              required
            />
          </div>
          <Button type="submit" disabled={loading} className="gap-1.5">
            {loading && <Loader2 className="size-4 animate-spin" />}
            Entrar
          </Button>
        </form>

        <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
          <p className="font-semibold text-foreground">Demo:</p>
          <p>Prueba con <code className="rounded bg-secondary px-1">carlos@email.com</code></p>
        </div>

        <Button asChild variant="ghost" size="sm" className="gap-1.5">
          <Link href="/citas">
            ¿No tienes cita? Agenda una
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

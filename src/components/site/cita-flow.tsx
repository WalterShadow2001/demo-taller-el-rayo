"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { es as dateFnsEs } from "date-fns/locale";
import {
  Calendar as CalendarIcon,
  Car,
  CheckCircle2,
  ChevronRight,
  Clock,
  Loader2,
  Mail,
  Phone,
  Search,
  User,
  Wrench,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import {
  formatDuracion,
  formatFecha,
  formatHora12,
  formatPrecio,
  toDateKey,
} from "@/lib/cita-helpers";
import { CitaStepper, StepperNavButtons } from "./cita-stepper";

interface Servicio {
  id: string;
  nombre: string;
  descripcion: string;
  precioAuto: number;
  precioCamioneta: number | null;
  duracionMin: number;
  icono: string | null;
}

interface Vehiculo {
  id: string;
  marca: string;
  modelo: string;
  anio: number;
  placas: string | null;
  color: string | null;
}

const STEPS = [
  { title: "Servicio", description: "Elige qué necesitas" },
  { title: "Vehículo", description: "Datos de tu auto" },
  { title: "Fecha y hora", description: "Elige día y slot" },
  { title: "Tus datos", description: "Confirma la cita" },
];

export function CitaFlow() {
  const router = useRouter();
  const sp = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const [step, setStep] = React.useState(0);
  const [servicios, setServicios] = React.useState<Servicio[]>([]);
  const [loadingServicios, setLoadingServicios] = React.useState(true);

  // Form state
  const [servicioId, setServicioId] = React.useState<string>(sp.get("servicio") ?? "");
  const [tipoVehiculo, setTipoVehiculo] = React.useState<"auto" | "camioneta">("auto");
  const [emailLookup, setEmailLookup] = React.useState("");
  const [vehiculos, setVehiculos] = React.useState<Vehiculo[]>([]);
  const [vehiculoId, setVehiculoId] = React.useState<string | "new">("new");
  const [marca, setMarca] = React.useState("");
  const [modelo, setModelo] = React.useState("");
  const [anio, setAnio] = React.useState<string>("");
  const [placas, setPlacas] = React.useState("");
  const [color, setColor] = React.useState("");

  const [fecha, setFecha] = React.useState<Date | undefined>();
  const [slots, setSlots] = React.useState<string[]>([]);
  const [loadingSlots, setLoadingSlots] = React.useState(false);
  const [hora, setHora] = React.useState<string>("");

  const [nombre, setNombre] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [telefono, setTelefono] = React.useState("");
  const [notas, setNotas] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  // Load servicios
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/servicios");
        if (res.ok) {
          const data = await res.json();
          setServicios(data);
          const qId = sp.get("servicio");
          if (qId && data.some((s: Servicio) => s.id === qId)) {
            setServicioId(qId);
          } else if (data.length > 0) {
            setServicioId(data[0].id);
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingServicios(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pre-fill email from session (cliente cookie)
  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/clientes/vehiculos");
        if (res.ok) {
          const data = await res.json();
          if (data.cliente) {
            setEmail(data.cliente.email);
            setNombre(data.cliente.nombre);
            setTelefono(data.cliente.telefono ?? "");
            if (data.vehiculos?.length > 0) {
              setVehiculos(data.vehiculos);
              setVehiculoId(data.vehiculos[0].id);
            }
          }
        }
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // Lookup vehicles by email
  const handleLookup = React.useCallback(async () => {
    if (!emailLookup || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(emailLookup)) {
      toast.error("Ingresa un correo válido");
      return;
    }
    setVehiculos([]);
    setVehiculoId("new");
    try {
      const res = await fetch(
        `/api/clientes/${encodeURIComponent(emailLookup)}/citas`,
      );
      if (res.status === 404) {
        toast.info("No te encontramos. Registra tu vehículo nuevo.");
        setVehiculoId("new");
        return;
      }
      if (!res.ok) {
        throw new Error("error");
      }
      const data = await res.json();
      if (data.vehiculos?.length > 0) {
        setVehiculos(data.vehiculos);
        setVehiculoId(data.vehiculos[0].id);
        toast.success(`Encontramos ${data.vehiculos.length} vehículo(s) registrado(s).`);
        // Pre-fill contact info too
        if (data.cliente) {
          setEmail(data.cliente.email);
          setNombre(data.cliente.nombre);
          setTelefono(data.cliente.telefono ?? "");
        }
      } else {
        toast.info("Sin vehículos previos. Registra uno nuevo.");
        setVehiculoId("new");
        if (data.cliente) {
          setEmail(data.cliente.email);
          setNombre(data.cliente.nombre);
          setTelefono(data.cliente.telefono ?? "");
        }
      }
    } catch (e) {
      console.error(e);
      toast.error("No se pudo buscar tu correo");
    }
  }, [emailLookup]);

  // Load slots when fecha changes
  React.useEffect(() => {
    if (!fecha) {
      setSlots([]);
      setHora("");
      return;
    }
    const key = toDateKey(fecha);
    setLoadingSlots(true);
    setHora("");
    (async () => {
      try {
        const res = await fetch(`/api/horarios-disponibles?fecha=${key}`);
        if (!res.ok) throw new Error("err");
        const data = await res.json();
        setSlots(data.slots ?? []);
      } catch (e) {
        console.error(e);
        toast.error("No se pudieron cargar los horarios");
        setSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    })();
  }, [fecha]);

  const servicio = servicios.find((s) => s.id === servicioId);

  // Validation per step
  const canProceedStep = React.useCallback((): boolean => {
    if (step === 0) return Boolean(servicioId);
    if (step === 1) {
      if (vehiculoId === "new") {
        return Boolean(marca && modelo && anio);
      }
      return Boolean(vehiculoId);
    }
    if (step === 2) return Boolean(fecha && hora);
    if (step === 3) {
      return Boolean(
        nombre.trim() &&
          /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) &&
          telefono.trim().length >= 7,
      );
    }
    return false;
  }, [step, servicioId, vehiculoId, marca, modelo, anio, fecha, hora, nombre, email, telefono]);

  const handleNext = () => setStep((s) => Math.min(STEPS.length - 1, s + 1));
  const handlePrev = () => setStep((s) => Math.max(0, s - 1));

  const handleSubmit = async () => {
    if (!servicio || !fecha) {
      toast.error("Faltan datos del servicio o fecha.");
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, unknown> = {
        servicioId: servicio.id,
        fecha: toDateKey(fecha),
        hora,
        nombre: nombre.trim(),
        email: email.trim().toLowerCase(),
        telefono: telefono.trim(),
        notas: notas.trim() || undefined,
      };
      if (vehiculoId === "new") {
        body.marca = marca.trim();
        body.modelo = modelo.trim();
        body.anio = Number(anio);
        body.placas = placas.trim() || undefined;
        body.color = color.trim() || undefined;
      } else {
        body.vehiculoId = vehiculoId;
      }
      const res = await fetch("/api/citas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "No se pudo crear la cita");
      }
      const data = await res.json();
      toast.success("Cita agendada correctamente");
      startTransition(() => {
        router.push(`/citas/confirmacion/${data.id}`);
      });
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Error desconocido");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col gap-6 p-6">
        <CitaStepper
          steps={STEPS}
          current={step}
          onStepClick={(i) => i < step && setStep(i)}
        />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -12 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-4"
          >
            {step === 0 && (
              <StepServicio
                servicios={servicios}
                loading={loadingServicios}
                servicioId={servicioId}
                setServicioId={setServicioId}
                tipoVehiculo={tipoVehiculo}
                setTipoVehiculo={setTipoVehiculo}
              />
            )}
            {step === 1 && (
              <StepVehiculo
                emailLookup={emailLookup}
                setEmailLookup={setEmailLookup}
                onLookup={handleLookup}
                vehiculos={vehiculos}
                vehiculoId={vehiculoId}
                setVehiculoId={setVehiculoId}
                marca={marca}
                setMarca={setMarca}
                modelo={modelo}
                setModelo={setModelo}
                anio={anio}
                setAnio={setAnio}
                placas={placas}
                setPlacas={setPlacas}
                color={color}
                setColor={setColor}
              />
            )}
            {step === 2 && (
              <StepFechaHora
                fecha={fecha}
                setFecha={setFecha}
                slots={slots}
                loadingSlots={loadingSlots}
                hora={hora}
                setHora={setHora}
              />
            )}
            {step === 3 && (
              <StepDatos
                nombre={nombre}
                setNombre={setNombre}
                email={email}
                setEmail={setEmail}
                telefono={telefono}
                setTelefono={setTelefono}
                notas={notas}
                setNotas={setNotas}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Summary */}
        <SummaryCard
          servicio={servicio}
          vehiculo={
            vehiculoId === "new"
              ? `${marca} ${modelo} ${anio}`.trim()
              : vehiculos.find((v) => v.id === vehiculoId)
                ? `${vehiculos.find((v) => v.id === vehiculoId)?.marca} ${vehiculos.find((v) => v.id === vehiculoId)?.modelo} ${vehiculos.find((v) => v.id === vehiculoId)?.anio}`
                : "—"
          }
          fecha={fecha ? toDateKey(fecha) : ""}
          hora={hora}
          tipoVehiculo={tipoVehiculo}
        />

        <StepperNavButtons
          current={step}
          total={STEPS.length}
          onPrev={handlePrev}
          onNext={handleNext}
          onSubmit={handleSubmit}
          submitLabel="Agendar cita"
          isSubmitting={submitting || isPending}
          canProceed={canProceedStep()}
        />
      </CardContent>
    </Card>
  );
}

/* ---------- Step 1: Servicio ---------- */

function StepServicio({
  servicios,
  loading,
  servicioId,
  setServicioId,
  tipoVehiculo,
  setTipoVehiculo,
}: {
  servicios: Servicio[];
  loading: boolean;
  servicioId: string;
  setServicioId: (v: string) => void;
  tipoVehiculo: "auto" | "camioneta";
  setTipoVehiculo: (v: "auto" | "camioneta") => void;
}) {
  return (
    <div className="flex flex-col gap-4">
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
        <Label className="mb-2 flex items-center gap-1.5">
          <Wrench className="size-4 text-primary" />
          Servicio
        </Label>
        {loading ? (
          <div className="flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16 w-full" />
            ))}
          </div>
        ) : (
          <div className="grid gap-2 sm:grid-cols-2">
            {servicios.map((s) => {
              const active = s.id === servicioId;
              const precio =
                tipoVehiculo === "auto"
                  ? s.precioAuto
                  : s.precioCamioneta ?? s.precioAuto;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setServicioId(s.id)}
                  className={cn(
                    "flex flex-col gap-1 rounded-md border p-3 text-left transition-colors",
                    active
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background hover:bg-secondary",
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-2xl">{s.icono ?? "🔧"}</span>
                    {active && <CheckCircle2 className="size-4 text-primary" />}
                  </div>
                  <span className="font-display text-sm font-semibold text-foreground">
                    {s.nombre}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDuracion(s.duracionMin)} · desde {formatPrecio(precio)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Step 2: Vehiculo ---------- */

function StepVehiculo({
  emailLookup,
  setEmailLookup,
  onLookup,
  vehiculos,
  vehiculoId,
  setVehiculoId,
  marca,
  setMarca,
  modelo,
  setModelo,
  anio,
  setAnio,
  placas,
  setPlacas,
  color,
  setColor,
}: {
  emailLookup: string;
  setEmailLookup: (v: string) => void;
  onLookup: () => void;
  vehiculos: Vehiculo[];
  vehiculoId: string | "new";
  setVehiculoId: (v: string | "new") => void;
  marca: string;
  setMarca: (v: string) => void;
  modelo: string;
  setModelo: (v: string) => void;
  anio: string;
  setAnio: (v: string) => void;
  placas: string;
  setPlacas: (v: string) => void;
  color: string;
  setColor: (v: string) => void;
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <Label className="mb-2 flex items-center gap-1.5">
          <Mail className="size-4 text-primary" />
          ¿Ya eres cliente? Busca tu correo
        </Label>
        <div className="flex gap-2">
          <Input
            type="email"
            value={emailLookup}
            onChange={(e) => setEmailLookup(e.target.value)}
            placeholder="tu@email.com"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                onLookup();
              }
            }}
          />
          <Button type="button" variant="outline" onClick={onLookup} className="gap-1.5">
            <Search className="size-4" />
            Buscar
          </Button>
        </div>
        <p className="mt-1.5 text-xs text-muted-foreground">
          Si ya agendaste antes con ese correo, traeremos tus vehículos.
        </p>
      </div>

      {vehiculos.length > 0 && (
        <div>
          <Label className="mb-2 flex items-center gap-1.5">
            <Car className="size-4 text-primary" />
            Tus vehículos registrados
          </Label>
          <div className="grid gap-2">
            {vehiculos.map((v) => {
              const active = v.id === vehiculoId;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setVehiculoId(v.id)}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-md border p-3 text-left transition-colors",
                    active
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background hover:bg-secondary",
                  )}
                >
                  <div className="flex flex-col">
                    <span className="font-display text-sm font-semibold">
                      {v.marca} {v.modelo} {v.anio}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Placas: {v.placas ?? "—"} · Color: {v.color ?? "—"}
                    </span>
                  </div>
                  {active && <CheckCircle2 className="size-4 text-primary" />}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => setVehiculoId("new")}
              className={cn(
                "flex items-center justify-between gap-2 rounded-md border border-dashed p-3 text-left transition-colors",
                vehiculoId === "new"
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-border bg-background text-muted-foreground hover:bg-secondary",
              )}
            >
              <span className="text-sm font-medium">+ Registrar vehículo nuevo</span>
              {vehiculoId === "new" && <CheckCircle2 className="size-4" />}
            </button>
          </div>
        </div>
      )}

      {vehiculoId === "new" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="marca">Marca *</Label>
            <Input
              id="marca"
              value={marca}
              onChange={(e) => setMarca(e.target.value)}
              placeholder="Nissan, Honda, Ford…"
              required
            />
          </div>
          <div>
            <Label htmlFor="modelo">Modelo *</Label>
            <Input
              id="modelo"
              value={modelo}
              onChange={(e) => setModelo(e.target.value)}
              placeholder="Tsuru, Civic, Escape…"
              required
            />
          </div>
          <div>
            <Label htmlFor="anio">Año *</Label>
            <Input
              id="anio"
              type="number"
              min={1980}
              max={new Date().getFullYear() + 1}
              value={anio}
              onChange={(e) => setAnio(e.target.value)}
              placeholder="2020"
              required
            />
          </div>
          <div>
            <Label htmlFor="placas">Placas</Label>
            <Input
              id="placas"
              value={placas}
              onChange={(e) => setPlacas(e.target.value)}
              placeholder="ABC-123"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              placeholder="Rojo, Blanco…"
            />
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------- Step 3: Fecha y hora ---------- */

function StepFechaHora({
  fecha,
  setFecha,
  slots,
  loadingSlots,
  hora,
  setHora,
}: {
  fecha: Date | undefined;
  setFecha: (d: Date | undefined) => void;
  slots: string[];
  loadingSlots: boolean;
  hora: string;
  setHora: (s: string) => void;
}) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label className="mb-2 flex items-center gap-1.5">
          <CalendarIcon className="size-4 text-primary" />
          Fecha
        </Label>
        <div className="flex justify-center rounded-md border border-border bg-background p-2">
          <Calendar
            mode="single"
            selected={fecha}
            onSelect={setFecha}
            disabled={[{ before: today }, { dayOfWeek: [0] }]}
            locale={dateFnsEs}
          />
        </div>
        <p className="mt-1.5 text-center text-xs text-muted-foreground">
          Selecciona un día. Los domingos no laboramos.
        </p>
      </div>

      <div>
        <Label className="mb-2 flex items-center gap-1.5">
          <Clock className="size-4 text-primary" />
          Hora disponible
        </Label>
        {!fecha ? (
          <p className="text-sm text-muted-foreground">Primero elige una fecha.</p>
        ) : loadingSlots ? (
          <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-9" />
            ))}
          </div>
        ) : slots.length === 0 ? (
          <p className="rounded-md border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
            No hay horarios disponibles para esta fecha. Prueba con otro día.
          </p>
        ) : (
          <div className="grid max-h-60 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
            {slots.map((s) => {
              const active = s === hora;
              return (
                <button
                  key={s}
                  type="button"
                  onClick={() => setHora(s)}
                  className={cn(
                    "rounded-md border px-2 py-2 text-sm font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background hover:bg-secondary",
                  )}
                >
                  {formatHora12(s)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------- Step 4: Datos del cliente ---------- */

function StepDatos({
  nombre,
  setNombre,
  email,
  setEmail,
  telefono,
  setTelefono,
  notas,
  setNotas,
}: {
  nombre: string;
  setNombre: (v: string) => void;
  email: string;
  setEmail: (v: string) => void;
  telefono: string;
  setTelefono: (v: string) => void;
  notas: string;
  setNotas: (v: string) => void;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor="nombre" className="mb-1.5 flex items-center gap-1.5">
          <User className="size-4 text-primary" />
          Nombre completo *
        </Label>
        <Input
          id="nombre"
          value={nombre}
          onChange={(e) => setNombre(e.target.value)}
          placeholder="Carlos Mendoza"
          required
        />
      </div>
      <div>
        <Label htmlFor="email" className="mb-1.5 flex items-center gap-1.5">
          <Mail className="size-4 text-primary" />
          Correo *
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="tu@email.com"
          required
        />
      </div>
      <div>
        <Label htmlFor="telefono" className="mb-1.5 flex items-center gap-1.5">
          <Phone className="size-4 text-primary" />
          Teléfono *
        </Label>
        <Input
          id="telefono"
          type="tel"
          value={telefono}
          onChange={(e) => setTelefono(e.target.value)}
          placeholder="639 123 4567"
          required
        />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="notas" className="mb-1.5 flex items-center gap-1.5">
          <Wrench className="size-4 text-primary" />
          Notas (opcional)
        </Label>
        <Input
          id="notas"
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          placeholder="Ej. El auto hace un ruido al frenar"
        />
      </div>
      <p className="text-xs text-muted-foreground sm:col-span-2">
        Al agendar aceptas recibir confirmación por correo. Tus datos están protegidos.
      </p>
    </div>
  );
}

/* ---------- Summary card ---------- */

function SummaryCard({
  servicio,
  vehiculo,
  fecha,
  hora,
  tipoVehiculo,
}: {
  servicio?: Servicio;
  vehiculo: string;
  fecha: string;
  hora: string;
  tipoVehiculo: "auto" | "camioneta";
}) {
  const precio = servicio
    ? tipoVehiculo === "auto"
      ? servicio.precioAuto
      : servicio.precioCamioneta ?? servicio.precioAuto
    : 0;
  return (
    <div className="rounded-md border border-border bg-secondary/30 p-4">
      <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
        Resumen
      </p>
      <dl className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
        <dt className="text-muted-foreground">Servicio</dt>
        <dd className="text-right font-medium text-foreground">
          {servicio?.nombre ?? "—"}
        </dd>
        <dt className="text-muted-foreground">Vehículo</dt>
        <dd className="text-right font-medium text-foreground">{vehiculo || "—"}</dd>
        <dt className="text-muted-foreground">Fecha</dt>
        <dd className="text-right font-medium text-foreground">
          {fecha ? formatFecha(fecha) : "—"}
        </dd>
        <dt className="text-muted-foreground">Hora</dt>
        <dd className="text-right font-medium text-foreground">
          {hora ? formatHora12(hora) : "—"}
        </dd>
        <dt className="text-muted-foreground">Precio estimado</dt>
        <dd className="text-right font-display text-base font-bold text-primary">
          {formatPrecio(precio)}
        </dd>
      </dl>
    </div>
  );
}

"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Lock,
  Loader2,
  LogIn,
  Shield,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdminLoginPage() {
  return (
    <React.Suspense fallback={null}>
      <AdminLoginInner />
    </React.Suspense>
  );
}

function AdminLoginInner() {
  const router = useRouter();
  const sp = useSearchParams();
  const next = sp.get("next") || "/admin";

  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Ingresa la contraseña");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Error");
      }
      toast.success("Acceso concedido");
      router.push(next);
      router.refresh();
    } catch (e) {
      console.error(e);
      toast.error(e instanceof Error ? e.message : "Error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-card px-4 py-12">
      <div className="bg-industrial-radial absolute inset-0 -z-10" aria-hidden="true" />
      <Link
        href="/"
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-4" />
        Volver al sitio público
      </Link>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-md"
      >
        <Card className="border-border bg-background">
          <CardContent className="flex flex-col gap-6 p-6">
            <div className="flex flex-col items-center gap-3 text-center">
              <span className="grid size-14 place-items-center rounded-md bg-primary text-primary-foreground shadow-sm">
                <Zap className="size-8" strokeWidth={2.5} />
              </span>
              <div>
                <h1 className="font-display text-2xl font-bold uppercase tracking-tight text-foreground">
                  Acceso administrador
                </h1>
                <p className="text-sm text-muted-foreground">
                  Taller El Rayo · Panel interno
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <Label htmlFor="password" className="mb-1.5 flex items-center gap-1.5">
                  <Lock className="size-4 text-primary" />
                  Contraseña
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  autoFocus
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="gap-1.5">
                {loading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <LogIn className="size-4" />
                )}
                Entrar
              </Button>
            </form>

            <div className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
              <p className="flex items-center gap-1.5 font-semibold text-foreground">
                <Shield className="size-3.5 text-primary" />
                Demo
              </p>
              <p className="mt-1">
                Contraseña: <code className="rounded bg-secondary px-1 font-mono">admin123</code>
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export interface StepperStep {
  title: string;
  description?: string;
}

export function CitaStepper({
  steps,
  current,
  onStepClick,
}: {
  steps: StepperStep[];
  current: number;
  onStepClick?: (i: number) => void;
}) {
  return (
    <div className="industrial-stepper">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const last = i === steps.length - 1;
        return (
          <div
            key={i}
            className={cn(
              "industrial-step",
              done && "completed",
              active && "active",
            )}
          >
            <button
              type="button"
              onClick={() => onStepClick?.(i)}
              disabled={i > current || !onStepClick}
              className={cn(
                "flex w-full flex-col items-center gap-0 bg-transparent transition-colors disabled:cursor-not-allowed",
                onStepClick && i <= current ? "hover:bg-secondary/30" : "cursor-default",
              )}
              aria-current={active ? "step" : undefined}
            >
              <span className="industrial-step-circle">
                {done ? "" : i + 1}
              </span>
              <span className="industrial-step-label">{s.title}</span>
            </button>
            {!last && (
              <span className="industrial-step-connector" aria-hidden="true" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function StepperNavButtons({
  current,
  total,
  onPrev,
  onNext,
  onSubmit,
  nextLabel = "Continuar",
  submitLabel,
  isSubmitting,
  canProceed = true,
}: {
  current: number;
  total: number;
  onPrev?: () => void;
  onNext?: () => void;
  onSubmit?: () => void;
  nextLabel?: string;
  submitLabel?: string;
  isSubmitting?: boolean;
  canProceed?: boolean;
}) {
  const isLast = current === total - 1;
  return (
    <div className="mt-6 flex items-center justify-between gap-3">
      <button
        type="button"
        onClick={onPrev}
        disabled={current === 0}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary disabled:pointer-events-none disabled:opacity-50",
        )}
      >
        <ChevronLeft className="size-4" />
        Atrás
      </button>

      {isLast && submitLabel ? (
        <motion.button
          type="button"
          onClick={onSubmit}
          disabled={!canProceed || isSubmitting}
          whileTap={{ scale: 0.97 }}
          className="btn-electric inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold shadow-sm disabled:opacity-50"
        >
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {submitLabel}
          <ChevronRight className="size-4" />
        </motion.button>
      ) : (
        <motion.button
          type="button"
          onClick={onNext}
          disabled={!canProceed}
          whileTap={{ scale: 0.97 }}
          className="btn-electric inline-flex items-center gap-2 rounded-md px-5 py-2.5 text-sm font-semibold shadow-sm disabled:opacity-50"
        >
          {nextLabel}
          <ChevronRight className="size-4" />
        </motion.button>
      )}
    </div>
  );
}

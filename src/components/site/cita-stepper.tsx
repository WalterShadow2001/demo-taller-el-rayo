"use client";

import * as React from "react";
import { Check, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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
    <ol className="flex w-full items-center">
      {steps.map((s, i) => {
        const done = i < current;
        const active = i === current;
        const last = i === steps.length - 1;
        return (
          <li
            key={i}
            className={cn("flex flex-1 items-center", last ? "flex-none" : "flex-1")}
          >
            <button
              type="button"
              onClick={() => onStepClick?.(i)}
              disabled={i > current || !onStepClick}
              className={cn(
                "flex items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors disabled:cursor-not-allowed",
                onStepClick && i <= current ? "hover:bg-secondary" : "cursor-default",
              )}
            >
              <span
                className={cn(
                  "grid size-8 shrink-0 place-items-center rounded-full border-2 text-xs font-bold transition-colors",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : active
                      ? "border-primary text-primary"
                      : "border-border text-muted-foreground",
                )}
              >
                {done ? <Check className="size-4" /> : i + 1}
              </span>
              <span className="hidden flex-col sm:flex">
                <span
                  className={cn(
                    "font-display text-sm font-semibold leading-none",
                    active || done ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.title}
                </span>
                {s.description ? (
                  <span className="text-[11px] text-muted-foreground">{s.description}</span>
                ) : null}
              </span>
            </button>
            {!last && (
              <span
                className={cn(
                  "mx-1 h-px flex-1",
                  done ? "bg-primary" : "bg-border",
                )}
              />
            )}
          </li>
        );
      })}
    </ol>
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
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
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
          className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:opacity-50"
        >
          {nextLabel}
          <ChevronRight className="size-4" />
        </motion.button>
      )}
    </div>
  );
}

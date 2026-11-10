# Task ID: more-effects-taller
# Agent: main (Z.ai Code)

## Summary
Added more uiverse-inspired CSS effects per page to Taller El Rayo. Each page got 1-2 NEW effects specific to its purpose. No saturation — existing effects preserved.

## Files changed
- `src/app/globals.css` — appended new CSS (lightning-flash, hazard-border-hover, industrial-stepper, breakdown-item/total, industrial-timeline, status-badge-glow-*, hazard-check, stat-counter, glow-border-card, rivet-divider)
- `src/app/page.tsx` (home) — lightning-flash on Zap icon, stat-counter animate on stat numbers, rivet-divider between services & contact sections
- `src/app/servicios/page.tsx` — added featured/highlighted card with `glow-border-card` at top (showing first service as "Servicio destacado")
- `src/components/site/servicios-grid.tsx` — passes `hazardBorder` to ServiceCard
- `src/components/site/service-card.tsx` — added `hazardBorder?: boolean` prop (applies `hazard-border-hover`); rewrote `EstadoBadge` to use `status-badge-glow-*` variants (orange=en_proceso, green=listo/entregado, red=cancelada); added `StatusTrackerIndustrial` (vertical diamond timeline) while keeping original `StatusTracker` for /citas confirmation page
- `src/components/site/cita-stepper.tsx` — rewrote `CitaStepper` to use `industrial-stepper` structure (industrial-step, industrial-step-circle, industrial-step-label, industrial-step-connector)
- `src/components/site/cita-flow.tsx` — vehicle type selection now uses radio inputs with `hazard-check` class
- `src/components/site/cotizador-client.tsx` — added `breakdown-item` to each line of the price breakdown dl; added `breakdown-total` to the total amount row (with shine sweep)
- `src/components/site/portal-cita-detalle.tsx` — uses `StatusTrackerIndustrial` instead of `StatusTracker`; `EstadoBadge` automatically uses glow variants

## Per-page application
- Home: lightning-flash + stat-counter animate + rivet-divider
- /servicios: hazard-border-hover on cards + glow-border-card featured card
- /citas: industrial-stepper + hazard-check
- /cotizador: breakdown-item + breakdown-total
- /portal/[citaId]: industrial-timeline + status-badge-glow-*
- /portal (list): status-badge-glow-* via EstadoBadge update

## Build/lint status
- `bun run lint` → PASS (0 errors, 5 pre-existing warnings)
- `bun run build` → PASS (compiled successfully, 19 static pages generated)

## Commit
TBD — pushing to main.

"use client";

import React, { FC, useMemo } from "react";
import type { IndicatorRow } from "@/lib/loadExcelData";

type IndicatorGridProps = {
  filtered: IndicatorRow[];
  activeIndicatorName?: string | null;
  onSelectIndicator?: (indicator: string) => void;
  /** opcional: si no quieres que sean clicables */
  clickable?: boolean;
};

type IndicatorCardData = {
  indicator: string;
  value: number | null;
  unit: string | null;
  year: number | null;
};

function formatValue(value: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("es-ES", { maximumFractionDigits: 2 });
}

const IndicatorGrid: FC<IndicatorGridProps> = ({
  filtered,
  activeIndicatorName = null,
  onSelectIndicator,
  clickable = true,
}) => {
  const indicatorCards = useMemo<IndicatorCardData[]>(() => {
    const map = new Map<string, IndicatorCardData>();

    for (const row of filtered) {
      if (!row.indicator) continue;

      // unidad preferente: unidad; si no, AT (si lo usas como unidad visual)
      const unitFromRow = row.unidad ?? row.at ?? null;

      if (!map.has(row.indicator)) {
        map.set(row.indicator, {
          indicator: row.indicator,
          value: row.value ?? null,
          unit: unitFromRow,
          year: row.year ?? null,
        });
      } else {
        const current = map.get(row.indicator)!;

        // si hay varias filas del mismo indicador: prioriza la que tenga valor
        if (current.value == null && row.value != null) {
          current.value = row.value;
          current.unit = unitFromRow ?? current.unit;
          current.year = row.year ?? current.year;
        }
      }
    }

    return Array.from(map.values()).sort((a, b) =>
      a.indicator.localeCompare(b.indicator, "es")
    );
  }, [filtered]);

  if (indicatorCards.length === 0) {
    return (
      <p className="text-sm text-slate-500">
        No hay indicadores para el filtro seleccionado.
      </p>
    );
  }

  const isInteractive = clickable && typeof onSelectIndicator === "function";

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {indicatorCards.map((card) => (
        <IndicatorCard
          key={card.indicator}
          indicator={card.indicator}
          value={card.value}
          unit={card.unit}
          year={card.year}
          isActive={card.indicator === activeIndicatorName}
          onClick={
            isInteractive ? () => onSelectIndicator(card.indicator) : undefined
          }
          interactive={isInteractive}
        />
      ))}
    </section>
  );
};

type IndicatorCardProps = {
  indicator: string;
  value: number | null;
  unit: string | null;
  year: number | null;
  isActive: boolean;
  onClick?: () => void;
  interactive: boolean;
};

const IndicatorCard: FC<IndicatorCardProps> = ({
  indicator,
  value,
  unit,
  year,
  isActive,
  onClick,
  interactive,
}) => {
  const base =
    "flex flex-col items-stretch rounded-2xl border bg-white p-4 text-left shadow-sm transition";

  const hover = interactive ? "hover:-translate-y-0.5 hover:shadow-md" : "";

  const border = isActive
    ? "border-[#7F1D1D] ring-2 ring-[#F97373]/60"
    : "border-slate-200";

  const cls = `${base} ${hover} ${border}`;

  const inner = (
    <>
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          Indicador
        </span>
        <span className="text-[10px] rounded-full bg-slate-50 px-2 py-0.5 text-slate-500">
          {year ?? "—"}
        </span>
      </div>

      <div className="mt-1 text-sm font-semibold text-slate-900 line-clamp-2">
        {indicator}
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl font-semibold text-[#7F1D1D]">
          {formatValue(value)}
        </span>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
    </>
  );

  // Si no es interactivo, renderiza un <div> para evitar “button” inútil
  if (!interactive) {
    return <div className={cls}>{inner}</div>;
  }

  return (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
};

export default IndicatorGrid;

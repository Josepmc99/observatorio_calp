"use client";

import React, { FC } from "react";

type RatioKpiProps = {
  title: string;
  ratio: number | null; // ej: 1.82
  numeratorLabel?: string; // "turista internacional"
  denominatorLabel?: string; // "residente"
  helper?: string; // si quieres forzar un texto concreto
  accentColor?: string; // opcional
  code?: string; // ej: "D.5.1.2 / D.5.1.1"
};

function fmtRatio(v: number | null) {
  if (v == null || Number.isNaN(v)) return "—";
  return `${v.toLocaleString("es-ES", { maximumFractionDigits: 2 })}×`;
}

const RatioKpi: FC<RatioKpiProps> = ({
  title,
  ratio,
  numeratorLabel = "turista internacional",
  denominatorLabel = "residente",
  helper,
  accentColor = "#7F1D1D",
  code,
}) => {
  const value = fmtRatio(ratio);

  const helperText =
    helper ??
    (ratio == null || Number.isNaN(ratio)
      ? "Sin datos suficientes para calcular la relación."
      : `El ${numeratorLabel} consume ${ratio.toLocaleString("es-ES", {
          maximumFractionDigits: 2,
        })} veces más agua que un ${denominatorLabel}.`);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
          {title}
        </div>
        {code ? (
          <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] text-slate-600">
            {code}
          </span>
        ) : null}
      </div>

      <div
        className="mt-2 text-3xl font-semibold"
        style={{ color: accentColor }}
      >
        {value}
      </div>

      <p className="mt-2 text-xs text-slate-500 leading-relaxed">
        {helperText}
      </p>
    </div>
  );
};

export default RatioKpi;

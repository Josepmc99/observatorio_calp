"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import Link from "next/link";

import type {
  IndicatorRow,
  TouristRow,
  LodgingRow,
  DashboardData,
} from "@/lib/loadExcelData";
import IndicatorGrid from "@/components/IndicatorGrid";
import { pickDefaultYear } from "@/lib/pickDefaultYear";

type Props = {
  scopeId: string;
  scopeName: string;
  indicators: IndicatorRow[];
  lodgings: LodgingRow[];
};

const PRIMARY = "#7F1D1D";

function fmtNum(v: number | null | undefined) {
  if (v == null || Number.isNaN(v)) return "—";
  return v.toLocaleString("es-ES", { maximumFractionDigits: 0 });
}
function fmtPct(v: number | null | undefined) {
  if (v == null || Number.isNaN(v)) return "—";

  const asPct = v <= 1 ? v * 100 : v;
  const safe = Math.max(0, Math.min(100, asPct));

  return `${safe.toLocaleString("es-ES", { maximumFractionDigits: 1 })}%`;
}

export default function RendimientoDashboard({
  scopeId,
  scopeName,
  indicators,
  lodgings,
}: Props) {
  const years = useMemo(() => {
    const set = new Set<number>();
    for (const r of lodgings) if (typeof r.year === "number") set.add(r.year);
    if (set.size === 0) {
      for (const i of indicators)
        if (typeof i.year === "number") set.add(i.year);
    }
    return Array.from(set).sort((a, b) => b - a);
  }, [lodgings, indicators]);

  const [selectedYear, setSelectedYear] = useState<number | null>(() =>
    pickDefaultYear(years),
  );
  useEffect(() => {
    if (selectedYear == null || !years.includes(selectedYear)) {
      setSelectedYear(pickDefaultYear(years));
    }
  }, [years, selectedYear]);

  const [tipo, setTipo] = useState<string>("");

  const filteredIndicators = useMemo(
    () =>
      indicators.filter((d) =>
        selectedYear != null ? d.year === selectedYear : true,
      ),
    [indicators, selectedYear],
  );

  const tipos = useMemo(() => {
    const set = new Set<string>();
    for (const r of lodgings) if (r.tipo) set.add(r.tipo);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [lodgings]);

  const lodgingFiltered = useMemo(() => {
    return lodgings.filter((r) => {
      const yearOk = selectedYear != null ? r.year === selectedYear : true;
      const tipoOk = tipo ? r.tipo === tipo : true;
      return yearOk && tipoOk;
    });
  }, [lodgings, selectedYear, tipo]);

  const summary = useMemo(() => {
    const totalCantidad = lodgingFiltered.reduce(
      (s, r) => s + (r.cantidad ?? 0),
      0,
    );
    const totalPlazas = lodgingFiltered.reduce(
      (s, r) => s + (r.plazas ?? 0),
      0,
    );
    const totalParcelas = lodgingFiltered.reduce(
      (s, r) => s + (r.parcelas ?? 0),
      0,
    );

    const avgPctTipo = (() => {
      const vals = lodgingFiltered
        .map((r) => r.porcentaje_tipo)
        .filter((v): v is number => typeof v === "number");
      if (vals.length === 0) return null;
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    })();

    const avgPctPlazas = (() => {
      const vals = lodgingFiltered
        .map((r) => r.porcentaje_plazas)
        .filter((v): v is number => typeof v === "number");
      if (vals.length === 0) return null;
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    })();

    return {
      totalCantidad,
      totalPlazas,
      totalParcelas,
      avgPctTipo,
      avgPctPlazas,
    };
  }, [lodgingFiltered]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs text-slate-400">
            <Link href="/" className="hover:underline">
              Inicio
            </Link>{" "}
            / Rendimiento empresarial turístico
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">{scopeName}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Capacidad y tipologías de alojamiento (resumen y detalle).
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex flex-col text-sm">
            <label htmlFor="yearSelect" className="mb-1 text-slate-500">
              Año
            </label>
            <select
              id="yearSelect"
              value={selectedYear ?? ""}
              onChange={(e) =>
                setSelectedYear(
                  e.target.value === "" ? null : Number(e.target.value),
                )
              }
              className="w-44 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F97373]/40"
            >
              <option value="">Todos</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col text-sm">
            <label htmlFor="tipoSelect" className="mb-1 text-slate-500">
              Tipo
            </label>
            <select
              id="tipoSelect"
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-56 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F97373]/40"
            >
              <option value="">Todos</option>
              {tipos.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* BLOQUE ALOJAMIENTOS */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
              Alojamientos
            </div>
            <h2 className="mt-1 text-sm font-semibold text-slate-900">
              Resumen {selectedYear ? `(${selectedYear})` : ""}{" "}
              {tipo ? `· ${tipo}` : ""}
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Fuente: hoja <span className="font-medium">Alojamientos</span> del
              Excel.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-right sm:grid-cols-3">
            <MiniKpi
              label="Cantidad"
              value={fmtNum(summary.totalCantidad)}
              accent
            />
            <MiniKpi label="Plazas" value={fmtNum(summary.totalPlazas)} />
            <MiniKpi label="Parcelas" value={fmtNum(summary.totalParcelas)} />
            <MiniKpi
              label="% Tipo (media)"
              value={fmtPct(summary.avgPctTipo)}
            />
            <MiniKpi
              label="% Plazas (media)"
              value={fmtPct(summary.avgPctPlazas)}
            />
            <MiniKpi label="Registros" value={fmtNum(lodgingFiltered.length)} />
          </div>
        </div>

        <div className="mt-4 overflow-auto">
          {lodgingFiltered.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 p-6 text-sm text-slate-500">
              No hay registros para este filtro.
            </div>
          ) : (
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-[11px] uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-3">Tipo</th>
                  <th className="py-2 pr-3">Cantidad</th>
                  <th className="py-2 pr-3">Plazas</th>
                  <th className="py-2 pr-3">Habitaciones</th>
                  <th className="py-2 pr-3">Parcelas</th>
                  <th className="py-2 pr-3">% Tipo</th>
                  <th className="py-2 pr-3">% Plazas</th>
                </tr>
              </thead>
              <tbody>
                {lodgingFiltered.slice(0, 250).map((r, i) => (
                  <tr
                    key={`${r.year}-${r.tipo}-${i}`}
                    className="border-b border-slate-100 hover:bg-slate-50"
                  >
                    <td className="py-2 pr-3 text-slate-900">
                      {r.tipo ?? "—"}
                    </td>
                    <td className="py-2 pr-3 text-slate-700">
                      {fmtNum(r.cantidad)}
                    </td>
                    <td className="py-2 pr-3 text-slate-700">
                      {fmtNum(r.plazas)}
                    </td>
                    <td className="py-2 pr-3 text-slate-700">
                      {r.habitaciones ?? "—"}
                    </td>
                    <td className="py-2 pr-3 text-slate-700">
                      {fmtNum(r.parcelas)}
                    </td>
                    <td className="py-2 pr-3 text-slate-700">
                      {fmtPct(r.porcentaje_tipo)}
                    </td>
                    <td className="py-2 pr-3 text-slate-700">
                      {fmtPct(r.porcentaje_plazas)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* INDICADORES DEL ÁMBITO (cards) */}
      {/* <IndicatorGrid
        filtered={filteredIndicators}
        activeIndicatorName={null}
        onSelectIndicator={() => {}}
      /> */}
    </div>
  );
}

const MiniKpi: FC<{ label: string; value: string; accent?: boolean }> = ({
  label,
  value,
  accent,
}) => (
  <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
    <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
      {label}
    </div>
    <div
      className={`mt-1 text-xs font-semibold ${
        accent ? "text-[#7F1D1D]" : "text-slate-900"
      }`}
    >
      {value}
    </div>
  </div>
);

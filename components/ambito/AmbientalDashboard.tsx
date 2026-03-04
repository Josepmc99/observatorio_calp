"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import type {
  IndicatorRow,
  TouristRow,
  LodgingRow,
  DashboardData,
} from "@/lib/loadExcelData";
import IndicatorGrid from "../IndicatorGrid";
import CoveragePanel from "../CoveragePanel";
import DetailsSection from "../DetailsSection";
import { pickDefaultYear } from "@/lib/pickDefaultYear";

type AmbientalDashboardProps = {
  scopeId: string;
  scopeName: string;
  data: IndicatorRow[];
};

const AmbientalDashboard: FC<AmbientalDashboardProps> = ({
  scopeId,
  scopeName,
  data,
}) => {
  // misma lógica de años y filtros, pero puedes simplificar si quieres
  const years = useMemo<number[]>(
    () =>
      Array.from(
        new Set(
          data
            .map((d) => d.year)
            .filter(
              (y): y is number => typeof y === "number" && !Number.isNaN(y),
            ),
        ),
      ).sort((a, b) => a - b),
    [data],
  );

  const [selectedYear, setSelectedYear] = useState<number | null>(() =>
    pickDefaultYear(years),
  );
  useEffect(() => {
    if (selectedYear == null || !years.includes(selectedYear)) {
      setSelectedYear(pickDefaultYear(years));
    }
  }, [years, selectedYear]);
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(
    null,
  );

  const filtered = useMemo<IndicatorRow[]>(
    () =>
      data.filter((d) =>
        selectedYear != null ? d.year === selectedYear : true,
      ),
    [data, selectedYear],
  );

  const totalIndicators = filtered.length;
  const indicatorsWithValue = filtered.filter((d) => d.value != null).length;

  const coverage =
    totalIndicators > 0 ? (indicatorsWithValue / totalIndicators) * 100 : null;

  const avgValue: number | null =
    indicatorsWithValue > 0
      ? filtered
          .filter((d) => d.value != null)
          .reduce((sum, d) => sum + (d.value as number), 0) /
        indicatorsWithValue
      : null;

  const activeIndicator = useMemo(() => {
    if (selectedIndicator) {
      return (
        filtered.find((d) => d.indicator === selectedIndicator) ??
        data.find((d) => d.indicator === selectedIndicator) ??
        null
      );
    }
    return filtered[0] ?? data[0] ?? null;
  }, [filtered, selectedIndicator, data]);

  const timeSeries = useMemo(() => {
    if (!activeIndicator?.indicator) return [];

    const rows = data
      .filter((d) => d.indicator === activeIndicator.indicator)
      .filter(
        (d): d is IndicatorRow & { year: number } => typeof d.year === "number",
      )
      .sort((a, b) => a.year - b.year);

    const map = new Map<
      number,
      { year: number; value: number; count: number }
    >();

    for (const r of rows) {
      if (!map.has(r.year)) {
        map.set(r.year, { year: r.year, value: 0, count: 0 });
      }
      if (typeof r.value === "number") {
        const y = map.get(r.year)!;
        y.value += r.value;
        y.count += 1;
      }
    }

    return Array.from(map.values()).map((r) => ({
      year: r.year,
      value: r.count > 0 ? r.value / r.count : null,
    }));
  }, [activeIndicator, data]);

  // Para ambiental, imaginemos que NO queremos gráfico de barras, solo:
  // - Cards por indicador
  // - Cobertura
  // - Serie temporal + ficha
  // (y si quieres, no pasamos tableRows y la tabla desaparece)

  const tableRows: IndicatorRow[] = []; // por ahora no mostramos tabla
  const scopeColor = "#15803D"; // verde para el ámbito ambiental

  return (
    <div className="space-y-6">
      {/* HEADER ambiental con texto específico */}
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs text-slate-400">
            <Link href="/" className="hover:underline">
              Inicio
            </Link>{" "}
            / Ámbito ambiental
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">{scopeName}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Indicadores ambientales clave (energía, emisiones, agua, residuos).
            Usa el selector de año para ver la evolución y detalle.
          </p>
        </div>

        {/* SELECTOR DE AÑO */}
        <div className="flex gap-3">
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
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm"
            >
              <option value="">Todos</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Cards por indicador muy protagonistas */}
      <IndicatorGrid
        filtered={filtered}
        activeIndicatorName={activeIndicator?.indicator ?? null}
        onSelectIndicator={setSelectedIndicator}
      />

      {/* Cobertura + serie temporal + ficha (sin tabla ni barras) */}
      <section className="grid gap-6 xl:grid-cols-3">
        <CoveragePanel
          coverage={coverage}
          totalIndicators={totalIndicators}
          indicatorsWithValue={indicatorsWithValue}
          avgValue={avgValue}
          scopeColor={scopeColor}
        />
        <DetailsSection
          activeIndicator={activeIndicator}
          timeSeries={timeSeries}
          scopeName={scopeName}
          tableRows={tableRows} // vacío → no se muestra tabla
          selectedYear={selectedYear}
          onSelectIndicator={setSelectedIndicator}
        />
      </section>
    </div>
  );
};

export default AmbientalDashboard;

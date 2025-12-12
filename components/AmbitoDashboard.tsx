"use client";

import React, { FC, useMemo, useState } from "react";
import Link from "next/link";

import IndicatorGrid from "./IndicatorGrid";
import CoveragePanel from "./CoveragePanel";
import ComparisonChart from "./ComparisonChart";
import DetailsSection from "./DetailsSection";

import type {
  IndicatorRow,
  TouristRow,
  LodgingRow,
  DashboardData,
} from "@/lib/loadExcelData";

/* ----------------------------------------------------------
   PROPS
---------------------------------------------------------- */

type AmbitoDashboardProps = {
  scopeId: string;
  scopeName: string;
  data: IndicatorRow[];
};

/* ----------------------------------------------------------
   PALETA GRANATE (coherente con la home)
---------------------------------------------------------- */

const PRIMARY = "#7F1D1D";
const PRIMARY_SOFT = "#9F1239";

const SCOPE_COLORS: Record<string, string> = {
  Gobernanza: PRIMARY,
  Social: PRIMARY_SOFT,
  "Social y cultural": PRIMARY_SOFT,
  Economía: PRIMARY,
  Ambiental: PRIMARY,
  "Medio ambiente": PRIMARY,
};

const DEFAULT_SCOPE_COLOR = PRIMARY;

/* ----------------------------------------------------------
   HELPERS (reutilizables en otros componentes)
---------------------------------------------------------- */

export function kpiNumber(value: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("es-ES", { maximumFractionDigits: 1 });
}

export function formatValue(value: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("es-ES", { maximumFractionDigits: 2 });
}

/* ----------------------------------------------------------
   COMPONENT: AmbitoDashboard
---------------------------------------------------------- */

const AmbitoDashboard: FC<AmbitoDashboardProps> = ({
  scopeId,
  scopeName,
  data,
}) => {
  const years = useMemo<number[]>(
    () =>
      Array.from(
        new Set(
          data
            .map((d) => d.year)
            .filter(
              (y): y is number => typeof y === "number" && !Number.isNaN(y)
            )
        )
      ).sort((a, b) => a - b),
    [data]
  );

  const [selectedYear, setSelectedYear] = useState<number | null>(
    years[years.length - 1] ?? null
  );
  const [selectedIndicator, setSelectedIndicator] = useState<string | null>(
    null
  );

  const filtered = useMemo<IndicatorRow[]>(
    () =>
      data.filter((d) =>
        selectedYear != null ? d.year === selectedYear : true
      ),
    [data, selectedYear]
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

  const barData = useMemo(() => {
    const map = new Map<string, { indicator: string; value: number }>();

    for (const row of filtered) {
      if (!row.indicator) continue;
      if (!map.has(row.indicator))
        map.set(row.indicator, { indicator: row.indicator, value: 0 });

      if (typeof row.value === "number") {
        map.get(row.indicator)!.value += row.value;
      }
    }

    return Array.from(map.values()).sort(
      (a, b) => (b.value ?? 0) - (a.value ?? 0)
    );
  }, [filtered]);

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
        (d): d is IndicatorRow & { year: number } => typeof d.year === "number"
      )
      .sort((a, b) => a.year - b.year);

    const map = new Map<
      number,
      { year: number; value: number; count: number }
    >();

    for (const r of rows) {
      if (!map.has(r.year))
        map.set(r.year, { year: r.year, value: 0, count: 0 });
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

  const tableRows = useMemo(
    () =>
      filtered
        .filter((d) => d.indicator)
        .sort((a, b) =>
          (a.indicator || "").localeCompare(b.indicator || "", "es")
        ),
    [filtered]
  );

  const scopeColor = SCOPE_COLORS[scopeName] || DEFAULT_SCOPE_COLOR;

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs text-slate-400">
            <Link href="/" className="hover:underline">
              Inicio
            </Link>{" "}
            / Ámbito
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">{scopeName}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Indicadores y visualizaciones específicas para este ámbito.
          </p>
        </div>

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
                  e.target.value === "" ? null : Number(e.target.value)
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

      <IndicatorGrid
        filtered={filtered}
        activeIndicatorName={activeIndicator?.indicator ?? null}
        onSelectIndicator={setSelectedIndicator}
      />

      <section className="grid gap-6 lg:grid-cols-3">
        <CoveragePanel
          coverage={coverage}
          totalIndicators={totalIndicators}
          indicatorsWithValue={indicatorsWithValue}
          avgValue={avgValue}
          scopeColor={scopeColor}
        />
        <ComparisonChart
          barData={barData}
          scopeColor={scopeColor}
          selectedYear={selectedYear}
          onSelectIndicator={setSelectedIndicator}
        />
      </section>

      <DetailsSection
        activeIndicator={activeIndicator}
        timeSeries={timeSeries}
        scopeName={scopeName}
        tableRows={tableRows}
        selectedYear={selectedYear}
        onSelectIndicator={setSelectedIndicator}
      />
    </div>
  );
};

export default AmbitoDashboard;

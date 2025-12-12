"use client";

import React, { FC, useMemo, useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

import type { IndicatorRow, TouristRow } from "@/lib/loadExcelData";
import IndicatorGrid from "@/components/IndicatorGrid";

type Props = {
  scopeId: string;
  scopeName: string;
  indicators: IndicatorRow[];
  tourists: TouristRow[];
};

/** Paleta SOLO para gráficos (diferente a la temática granate) */
const CHART = {
  foreignNum: "#2563EB", // azul
  nationalNum: "#F97316", // naranja
  foreignPct: "#7C3AED", // morado
  nationalPct: "#16A34A", // verde
};

function formatNumber(v: number | null | undefined) {
  if (v == null || Number.isNaN(v)) return "—";
  return v.toLocaleString("es-ES", { maximumFractionDigits: 0 });
}

function formatPct(v: number | null | undefined) {
  if (v == null || Number.isNaN(v)) return "—";
  return `${v.toLocaleString("es-ES", { maximumFractionDigits: 1 })}%`;
}

const MONTHS_ES = [
  "Ene",
  "Feb",
  "Mar",
  "Abr",
  "May",
  "Jun",
  "Jul",
  "Ago",
  "Sep",
  "Oct",
  "Nov",
  "Dic",
];

function monthLabelFrom(row: TouristRow) {
  const m = (row.month ?? "").trim();
  if (m) return m;

  if (
    typeof row.orden_month === "number" &&
    row.orden_month >= 1 &&
    row.orden_month <= 12
  ) {
    return MONTHS_ES[row.orden_month - 1];
  }
  return "—";
}

export default function EstacionalidadDashboard({
  scopeId,
  scopeName,
  indicators,
  tourists,
}: Props) {
  const years = useMemo(() => {
    const set = new Set<number>();
    for (const t of tourists) if (typeof t.year === "number") set.add(t.year);
    if (set.size === 0)
      for (const i of indicators)
        if (typeof i.year === "number") set.add(i.year);
    return Array.from(set).sort((a, b) => b - a);
  }, [tourists, indicators]);

  const [selectedYear, setSelectedYear] = useState<number | null>(
    years[0] ?? null
  );

  const filteredIndicators = useMemo(
    () =>
      indicators.filter((d) =>
        selectedYear != null ? d.year === selectedYear : true
      ),
    [indicators, selectedYear]
  );

  /** Serie mensual en números absolutos */
  const series = useMemo(() => {
    const rows = tourists.filter((t) =>
      selectedYear != null ? t.year === selectedYear : true
    );

    const map = new Map<
      string,
      {
        month: string;
        orden: number;
        extranjeros: number;
        nacional: number;
        total: number;
      }
    >();

    for (const r of rows) {
      const month = monthLabelFrom(r);
      const orden =
        typeof r.orden_month === "number" && Number.isFinite(r.orden_month)
          ? r.orden_month
          : 999;

      if (!map.has(month))
        map.set(month, { month, orden, extranjeros: 0, nacional: 0, total: 0 });

      const m = map.get(month)!;
      if (typeof r.extranjeros === "number") m.extranjeros += r.extranjeros;
      if (typeof r.nacional === "number") m.nacional += r.nacional;
      if (typeof r.total === "number") m.total += r.total;

      if (typeof r.orden_month === "number") m.orden = r.orden_month;
    }

    return Array.from(map.values())
      .filter((r) => r.month !== "—")
      .sort((a, b) => a.orden - b.orden || a.month.localeCompare(b.month, "es"))
      .map((r) => ({
        month: r.month,
        extranjeros: r.extranjeros,
        nacional: r.nacional,
        total: r.total,
      }));
  }, [tourists, selectedYear]);

  /** Serie mensual en porcentajes (derivada) */
  const seriesPct = useMemo(() => {
    return series.map((r) => {
      const total = r.total ?? r.extranjeros + r.nacional;
      const pctEx = total > 0 ? (r.extranjeros / total) * 100 : 0;
      const pctNa = total > 0 ? (r.nacional / total) * 100 : 0;
      return { month: r.month, pctExtranjeros: pctEx, pctNacionales: pctNa };
    });
  }, [series]);

  /** KPI summary */
  const kpis = useMemo(() => {
    if (series.length === 0) return null;
    const sumEx = series.reduce((s, r) => s + r.extranjeros, 0);
    const sumNa = series.reduce((s, r) => s + r.nacional, 0);
    const sumTotal = series.reduce((s, r) => s + r.total, 0);
    const pctEx = sumTotal > 0 ? (sumEx / sumTotal) * 100 : null;
    const pctNa = sumTotal > 0 ? (sumNa / sumTotal) * 100 : null;

    // pico mensual
    const peak = series.reduce(
      (acc, r) => {
        const t = r.total ?? 0;
        return t > acc.total ? { month: r.month, total: t } : acc;
      },
      { month: "—", total: -Infinity }
    );

    return {
      sumEx,
      sumNa,
      sumTotal,
      pctEx,
      pctNa,
      peakMonth: peak.month,
      peakTotal: peak.total,
    };
  }, [series]);

  return (
    <div className="space-y-6">
      {/* HERO / HEADER */}
      <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <p className="text-xs text-slate-400">
              <Link href="/" className="hover:underline">
                Inicio
              </Link>{" "}
              / Estacionalidad turística
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              {scopeName}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Dos lecturas complementarias: evolución mensual en número y en %.
            </p>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span className="rounded-full bg-slate-50 px-3 py-1">
                Fuente: Excel · hoja <b>Turistas</b>
              </span>
              {selectedYear && (
                <span className="rounded-full bg-slate-50 px-3 py-1">
                  Año: <b>{selectedYear}</b>
                </span>
              )}
            </div>
          </div>

          <div className="w-full md:w-auto">
            <label
              htmlFor="yearSelect"
              className="mb-1 block text-xs font-medium text-slate-500"
            >
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
              className="w-full md:w-48 rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-200"
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

      {/* KPI CARDS (más presencia) */}
      <section className="grid gap-4 md:grid-cols-3">
        <BigKpi
          title="Total turistas"
          value={kpis ? formatNumber(kpis.sumTotal) : "—"}
          subtitle={
            kpis
              ? `Pico: ${kpis.peakMonth} · ${formatNumber(kpis.peakTotal)}`
              : "Sin datos para el filtro"
          }
          tone="neutral"
        />
        <BigKpi
          title="Extranjeros"
          value={kpis ? formatNumber(kpis.sumEx) : "—"}
          subtitle={kpis ? `Peso: ${formatPct(kpis.pctEx)}` : "—"}
          tone="foreign"
        />
        <BigKpi
          title="Nacionales"
          value={kpis ? formatNumber(kpis.sumNa) : "—"}
          subtitle={kpis ? `Peso: ${formatPct(kpis.pctNa)}` : "—"}
          tone="national"
        />
      </section>

      {/* CHARTS (2 cards grandes) */}
      <section className="grid gap-4 lg:grid-cols-2">
        {/* Número */}
        <ChartCard
          title="Evolución mensual (número)"
          subtitle="Comparativa de volumen de turistas"
        >
          {series.length === 0 ? (
            <EmptyState text="No hay datos para este filtro (revisa Mes/Año/orden_month)." />
          ) : (
            <div className="min-w-0">
              <ResponsiveContainer width="100%" aspect={2.6}>
                <LineChart
                  data={series}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip
                    formatter={(v: any) =>
                      typeof v === "number" ? formatNumber(v) : v
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="extranjeros"
                    name="Extranjeros"
                    stroke={CHART.foreignNum}
                    strokeWidth={2.5}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="nacional"
                    name="Nacionales"
                    stroke={CHART.nationalNum}
                    strokeWidth={2.5}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>

        {/* Porcentaje */}
        <ChartCard
          title="Evolución mensual (% sobre total)"
          subtitle="Peso relativo de cada segmento"
        >
          {seriesPct.length === 0 ? (
            <EmptyState text="No hay datos para este filtro." />
          ) : (
            <div className="min-w-0">
              <ResponsiveContainer width="100%" aspect={2.6}>
                <LineChart
                  data={seriesPct}
                  margin={{ top: 8, right: 16, left: 0, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 12 }}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    formatter={(v: any) =>
                      typeof v === "number" ? formatPct(v) : v
                    }
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="pctExtranjeros"
                    name="% Extranjeros"
                    stroke={CHART.foreignPct}
                    strokeWidth={2.5}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="pctNacionales"
                    name="% Nacionales"
                    stroke={CHART.nationalPct}
                    strokeWidth={2.5}
                    dot={{ r: 2 }}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </ChartCard>
      </section>

      {/* Indicadores del ámbito
      <IndicatorGrid filtered={filteredIndicators} clickable={false} /> */}
    </div>
  );
}

/* ---------------- UI components ---------------- */

type BigKpiTone = "neutral" | "foreign" | "national";

const BigKpi: FC<{
  title: string;
  value: string;
  subtitle: string;
  tone: BigKpiTone;
}> = ({ title, value, subtitle, tone }) => {
  const toneClasses =
    tone === "foreign"
      ? "border-blue-200 bg-gradient-to-br from-blue-50 to-white"
      : tone === "national"
      ? "border-orange-200 bg-gradient-to-br from-orange-50 to-white"
      : "border-slate-200 bg-gradient-to-br from-slate-50 to-white";

  const valueClass =
    tone === "foreign"
      ? "text-blue-700"
      : tone === "national"
      ? "text-orange-700"
      : "text-slate-900";

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${toneClasses}`}>
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
        {title}
      </div>
      <div className={`mt-2 text-3xl font-semibold ${valueClass}`}>{value}</div>
      <div className="mt-2 text-xs text-slate-500">{subtitle}</div>
    </div>
  );
};

const ChartCard: FC<{
  title: string;
  subtitle: string;
  children: React.ReactNode;
}> = ({ title, subtitle, children }) => (
  <div className="min-w-0 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="mt-1 text-xs text-slate-500">{subtitle}</div>
      </div>
    </div>
    <div className="mt-4">{children}</div>
  </div>
);

const EmptyState: FC<{ text: string }> = ({ text }) => (
  <div className="flex h-48 items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-500">
    {text}
  </div>
);

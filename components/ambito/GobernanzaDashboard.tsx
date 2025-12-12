"use client";

import React, { FC, useMemo, useState } from "react";
import Link from "next/link";
import type {
  IndicatorRow,
  TouristRow,
  LodgingRow,
  DashboardData,
} from "@/lib/loadExcelData";

type GobernanzaDashboardProps = {
  scopeId: string;
  scopeName: string;
  data: IndicatorRow[];
};

const PRIMARY = "#7F1D1D";
const PRIMARY_SOFT = "#9F1239";

function formatValue(value: number | null): string {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("es-ES", { maximumFractionDigits: 2 });
}

function normalize(s: string) {
  return s.trim().toLowerCase();
}

const GobernanzaDashboard: FC<GobernanzaDashboardProps> = ({
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
      ).sort((a, b) => b - a),
    [data]
  );

  const [selectedYear, setSelectedYear] = useState<number | null>(
    years[0] ?? null
  );
  const [query, setQuery] = useState<string>("");
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const filtered = useMemo<IndicatorRow[]>(() => {
    const q = normalize(query);

    return data.filter((row) => {
      const yearOk = selectedYear == null ? true : row.year === selectedYear;

      const haystack = [
        row.indicator,
        row.description,
        row.formula,
        row.requiredData,
        row.comments,
        row.fuente, // ✅ fuente real
        row.organismo, // ✅ organismo real
        row.at, // ✅ AT si quieres que entre en búsqueda
        row.unidad,
      ]
        .filter(Boolean)
        .join(" · ")
        .toLowerCase();

      const qOk = q.length === 0 ? true : haystack.includes(q);

      return yearOk && qOk;
    });
  }, [data, selectedYear, query]);

  const cards = useMemo(() => {
    const map = new Map<string, IndicatorRow>();

    function score(row: IndicatorRow) {
      let s = 0;
      if (row.value != null) s += 10;
      if (row.description) s += 3;
      if (row.comments) s += 2;
      if (row.fuente) s += 1;
      if (row.organismo) s += 1;
      if (row.unidad) s += 1;
      return s;
    }

    for (const row of filtered) {
      if (!row.indicator) continue;
      const key = row.indicator;

      const existing = map.get(key);
      if (!existing) map.set(key, row);
      else if (score(row) > score(existing)) map.set(key, row);
    }

    return Array.from(map.values()).sort((a, b) =>
      (a.indicator ?? "").localeCompare(b.indicator ?? "", "es")
    );
  }, [filtered]);

  const active = useMemo(() => {
    if (!activeKey) return null;
    return cards.find((c) => c.indicator === activeKey) ?? null;
  }, [activeKey, cards]);

  const stats = useMemo(() => {
    const total = cards.length;
    const withValue = cards.filter((c) => c.value != null).length;
    const missing = total - withValue;
    const coverage = total > 0 ? (withValue / total) * 100 : 0;
    return { total, withValue, missing, coverage };
  }, [cards]);

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs text-slate-400">
            <Link href="/" className="hover:underline">
              Inicio
            </Link>{" "}
            / Gobernanza
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">{scopeName}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Fichas orientadas a trazabilidad: indicador, descripción,
            referencia, fuente, organismo y comentarios.
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex flex-col text-sm">
            <label htmlFor="yearSelect" className="mb-1 text-slate-500">
              Año de referencia
            </label>
            <select
              id="yearSelect"
              value={selectedYear ?? ""}
              onChange={(e) =>
                setSelectedYear(
                  e.target.value === "" ? null : Number(e.target.value)
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
            <label htmlFor="search" className="mb-1 text-slate-500">
              Buscar
            </label>
            <input
              id="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Indicador, descripción, fuente, organismo…"
              className="w-full min-w-[260px] rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F97373]/40"
            />
          </div>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Indicadores" value={String(stats.total)} />
        <StatCard label="Con valor" value={String(stats.withValue)} />
        <StatCard label="Pendientes" value={String(stats.missing)} />
        <StatCard
          label="Cobertura"
          value={`${stats.coverage.toFixed(0)}%`}
          accent
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {cards.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              No hay resultados para este filtro.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {cards.map((row) => {
                const title = row.indicator ?? "—";
                const year = row.year ?? null;
                const unit = row.unidad ?? "—";
                const hasValue = row.value != null;

                return (
                  <button
                    key={`${title}-${year ?? "na"}`}
                    type="button"
                    onClick={() => setActiveKey(title)}
                    className={`group rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#F97373]/40 ${
                      activeKey === title
                        ? "border-[#7F1D1D] ring-2 ring-[#F97373]/40"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Indicador
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-900 line-clamp-2">
                          {title}
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${
                          hasValue
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {hasValue ? "Con dato" : "Pendiente"}
                      </span>
                    </div>

                    <div className="mt-2 text-xs text-slate-500 line-clamp-3">
                      {row.description ?? "Sin descripción disponible."}
                    </div>

                    <div className="mt-4 flex items-baseline justify-between gap-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-semibold text-[#7F1D1D]">
                          {formatValue(row.value)}
                        </span>
                        <span className="text-xs text-slate-500">{unit}</span>
                      </div>
                      <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] text-slate-600">
                        {year ?? "—"}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-[11px] text-slate-500">
                      {row.fuente && (
                        <div className="flex gap-2">
                          <span className="font-medium text-slate-400">
                            Fuente:
                          </span>
                          <span className="line-clamp-1">{row.fuente}</span>
                        </div>
                      )}

                      {row.organismo && (
                        <div className="flex gap-2">
                          <span className="font-medium text-slate-400">
                            Organismo:
                          </span>
                          <span className="line-clamp-1">{row.organismo}</span>
                        </div>
                      )}

                      {row.comments && (
                        <div className="flex gap-2">
                          <span className="font-medium text-slate-400">
                            Nota:
                          </span>
                          <span className="line-clamp-1">{row.comments}</span>
                        </div>
                      )}
                    </div>

                    <div className="mt-4 text-xs font-medium text-[#7F1D1D] group-hover:text-[#9F1239]">
                      Ver detalle →
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <aside className="lg:col-span-1">
          <div className="sticky top-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Detalle
                </div>
                <div className="mt-1 text-base font-semibold text-slate-900">
                  {active?.indicator ?? "Selecciona un indicador"}
                </div>
              </div>

              {active?.indicator && (
                <button
                  type="button"
                  onClick={() => setActiveKey(null)}
                  className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-50"
                >
                  Cerrar
                </button>
              )}
            </div>

            {!active ? (
              <p className="mt-3 text-sm text-slate-500">
                Haz clic en una ficha para ver el detalle completo.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                <KeyValue
                  label="Año de referencia"
                  value={String(active.year ?? "—")}
                />
                <KeyValue
                  label="Valor"
                  value={`${formatValue(active.value)} ${
                    active.unidad ?? ""
                  }`.trim()}
                  accent
                />
                <KeyValue label="Unidad" value={active.unidad ?? "—"} />
                <KeyValue label="Fuente" value={active.fuente ?? "—"} />
                <KeyValue label="Organismo" value={active.organismo ?? "—"} />
                <KeyValue label="AT" value={active.at ?? "—"} />

                <Divider />

                <Block label="Descripción" value={active.description ?? "—"} />
                <Block label="Fórmula" value={active.formula ?? "—"} />
                <Block
                  label="Datos requeridos"
                  value={active.requiredData ?? "—"}
                />
                {active.comments && (
                  <Block label="Comentarios" value={active.comments} />
                )}
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
};

/* ---------------- UI bits ---------------- */

type StatCardProps = { label: string; value: string; accent?: boolean };

const StatCard: FC<StatCardProps> = ({ label, value, accent }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
    <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
      {label}
    </div>
    <div
      className={`mt-2 text-2xl font-semibold ${
        accent ? "text-[#7F1D1D]" : "text-slate-900"
      }`}
    >
      {value}
    </div>
  </div>
);

const Divider: FC = () => <div className="h-px w-full bg-slate-100" />;

type KeyValueProps = { label: string; value: string; accent?: boolean };

const KeyValue: FC<KeyValueProps> = ({ label, value, accent }) => (
  <div>
    <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
      {label}
    </div>
    <div
      className={`mt-1 text-sm ${
        accent ? "font-semibold text-[#7F1D1D]" : "text-slate-800"
      }`}
    >
      {value}
    </div>
  </div>
);

type BlockProps = { label: string; value: string };

const Block: FC<BlockProps> = ({ label, value }) => (
  <div>
    <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
      {label}
    </div>
    <div className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
      {value}
    </div>
  </div>
);

export default GobernanzaDashboard;

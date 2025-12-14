"use client";

import React, { FC, useMemo, useState } from "react";
import Link from "next/link";
import { Leaf, Waves, CalendarDays, AlertTriangle, Info } from "lucide-react";

import type { IndicatorRow } from "@/lib/loadExcelData";

/* =======================
   Helpers
======================= */

function cardKeyOf(row: IndicatorRow) {
  const desc = (row.description ?? "").trim();
  if (desc) return `desc:${desc}`;
  return `fallback:${row.indicator ?? ""}|${row.unidad ?? ""}`;
}

function formatValue(row: IndicatorRow | null) {
  if (!row || row.value == null || Number.isNaN(row.value)) return "—";

  const unit = (row.unidad ?? "").toLowerCase();
  if (unit.includes("%")) {
    return `${row.value.toLocaleString("es-ES", {
      maximumFractionDigits: 2,
    })}%`;
  }

  return row.value.toLocaleString("es-ES", {
    maximumFractionDigits: 2,
  });
}

/* =======================
   Props
======================= */

type Props = {
  scopeId: string;
  scopeName: string;
  data: IndicatorRow[];
};

/* =======================
   Component
======================= */

export default function AccionClimaDashboard({
  scopeId,
  scopeName,
  data,
}: Props) {
  const years = useMemo(
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
  const [activeKey, setActiveKey] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      data.filter((d) =>
        selectedYear != null ? d.year === selectedYear : true
      ),
    [data, selectedYear]
  );

  const cards = useMemo(() => {
    const map = new Map<string, IndicatorRow>();
    for (const row of filtered) {
      const key = cardKeyOf(row);
      if (!map.has(key)) map.set(key, row);
    }
    return Array.from(map.entries()).map(([cardKey, row]) => ({
      cardKey,
      row,
    }));
  }, [filtered]);

  const active = useMemo(
    () => cards.find((c) => c.cardKey === activeKey)?.row ?? null,
    [cards, activeKey]
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs text-slate-400">
            <Link href="/" className="hover:underline">
              Inicio
            </Link>{" "}
            / Acción por el clima
          </p>

          <div className="mt-1 flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-600 text-white">
              <Leaf className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {scopeName}
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Impactos ambientales, estacionalidad y riesgos climáticos.
          </p>
        </div>

        <div className="flex flex-col text-sm">
          <label className="mb-1 text-slate-500">Año</label>
          <select
            title="año"
            value={selectedYear ?? ""}
            onChange={(e) =>
              setSelectedYear(
                e.target.value === "" ? null : Number(e.target.value)
              )
            }
            className="w-40 rounded-xl border border-slate-300 bg-white px-3 py-2 shadow-sm"
          >
            <option value="">Todos</option>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>
      </header>

      {/* CARDS + DETALLE */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* CARDS */}
        <div className="lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
            {cards.map(({ cardKey, row }) => {
              const Icon = row.description?.includes("protegidas")
                ? Leaf
                : row.description?.includes("playa")
                ? Waves
                : row.description?.includes("estacionalidad")
                ? CalendarDays
                : AlertTriangle;

              return (
                <button
                  key={cardKey}
                  onClick={() => setActiveKey(cardKey)}
                  className={`rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                    activeKey === cardKey
                      ? "border-emerald-200 ring-2 ring-emerald-100"
                      : "border-slate-200"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-slate-900 line-clamp-2">
                        {row.description}
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {row.indicator}
                      </div>
                    </div>

                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-4 flex items-baseline justify-between">
                    <div className="text-3xl font-semibold text-emerald-700">
                      {formatValue(row)}
                    </div>
                    <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] text-slate-600">
                      {row.year ?? "—"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* DETALLE */}
        <aside className="lg:col-span-1">
          <div className="sticky top-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Detalle
                </div>
                <div className="mt-1 text-base font-semibold text-slate-900">
                  {active?.description ?? "Selecciona un indicador"}
                </div>
              </div>

              {active && (
                <button
                  onClick={() => setActiveKey(null)}
                  className="rounded-lg px-2 py-1 text-xs text-slate-500 hover:bg-slate-50"
                >
                  Cerrar
                </button>
              )}
            </div>

            {!active ? (
              <div className="mt-4 flex gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                <Info className="mt-0.5 h-4 w-4" />
                Haz clic en una tarjeta para ver el detalle completo.
              </div>
            ) : (
              <div className="mt-4 space-y-4 text-sm">
                <KV label="Indicador" value={active.indicator ?? "—"} />
                <KV label="Unidad" value={active.unidad ?? "—"} />
                <KV label="Tiempo" value={active.at ?? "—"} />
                <KV label="Organismo" value={active.organismo ?? "—"} />
                <KV label="Fuente" value={active.fuente ?? "—"} />
                <Divider />
                <Block
                  label="Método de cálculo"
                  value={active.formula ?? "—"}
                />
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
}

/* =======================
   UI helpers
======================= */

const Divider: FC = () => <div className="h-px w-full bg-slate-100" />;

const KV: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="text-[11px] uppercase tracking-wide text-slate-400">
      {label}
    </div>
    <div className="mt-1 text-slate-800">{value}</div>
  </div>
);

const Block: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="text-[11px] uppercase tracking-wide text-slate-400">
      {label}
    </div>
    <div className="mt-1 whitespace-pre-wrap text-slate-700">{value}</div>
  </div>
);

"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Factory, Info } from "lucide-react";
import type { IndicatorRow } from "@/lib/loadExcelData";
import { pickDefaultYear } from "@/lib/pickDefaultYear";

type Props = {
  scopeId: string;
  scopeName: string;
  data: IndicatorRow[];
  initialYear?: number | null;
};

const BRAND = "#6366F1"; // indigo
const BRAND_DARK = "#4338CA";

function formatValue(v: number | null) {
  if (v == null || Number.isNaN(v)) return "—";
  return v.toLocaleString("es-ES", { maximumFractionDigits: 2 });
}

function normEtis(s: string) {
  return s.trim().toUpperCase().replace(/\s+/g, "").replace(/\.$/, "");
}

function isEtis(row: IndicatorRow, code: string) {
  const rowEtis = row.etis ? normEtis(row.etis) : "";
  return rowEtis === normEtis(code);
}

function formatByUnit(row: IndicatorRow | null) {
  if (!row) return "—";
  const unit = (row.unidad ?? "").trim().toLowerCase();

  if (unit === "%" || unit.includes("%") || isEtis(row, "D.4.1")) {
    return row.value == null
      ? "—"
      : `${row.value.toLocaleString("es-ES", {
          maximumFractionDigits: 2,
        })}%`;
  }

  return formatValue(row.value);
}

export default function GestionAguasResidualesDashboard({
  scopeId,
  scopeName,
  data,
  initialYear,
}: Props) {
  const years = useMemo(
    () =>
      Array.from(
        new Set(
          data
            .map((d) => d.year)
            .filter(
              (y): y is number => typeof y === "number" && !Number.isNaN(y),
            ),
        ),
      ).sort((a, b) => b - a),
    [data],
  );

  const [selectedYear, setSelectedYear] = useState<number | null>(() =>
    initialYear != null && years.includes(initialYear)
      ? initialYear
      : pickDefaultYear(years),
  );

  useEffect(() => {
    if (selectedYear == null || !years.includes(selectedYear)) {
      setSelectedYear(pickDefaultYear(years));
    }
  }, [years, selectedYear]);

  const [activeKey, setActiveKey] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      data.filter((d) =>
        selectedYear != null ? d.year === selectedYear : true,
      ),
    [data, selectedYear],
  );

  const depuracion = useMemo(
    () => filtered.find((d) => isEtis(d, "D.4.1")) ?? null,
    [filtered],
  );

  const active = useMemo(() => {
    if (!activeKey) return null;
    return depuracion?.indicator === activeKey ? depuracion : null;
  }, [activeKey, depuracion]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="text-xs text-slate-400">
            <Link href="/" className="hover:underline">
              Inicio
            </Link>{" "}
            / Gestión de aguas residuales
          </p>

          <div className="mt-1 flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: BRAND }}
            >
              <Factory className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {scopeName}
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Tratamiento y depuración de aguas residuales del destino.
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
              className="w-40 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
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

      {/* KPI principal */}
      <section className="grid gap-4 md:grid-cols-1">
        <MiniStat
          title="Depuración secundaria"
          value={formatByUnit(depuracion)}
          note="ETIS D.4.1"
          accent
        />
      </section>

      {/* LISTADO + DETALLE */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* CARD GRANDE */}
        <div className="lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-1">
            <SewageCard
              row={depuracion}
              fallbackTitle="ETIS - Depuración de aguas residuales"
              etis="D.4.1"
              icon={Factory}
              color={BRAND}
              onClick={() =>
                setActiveKey(
                  depuracion?.indicator ??
                    "ETIS - Depuración de aguas residuales",
                )
              }
              active={
                activeKey ===
                  (depuracion?.indicator ??
                    "ETIS - Depuración de aguas residuales") || !activeKey
              }
              formatValue={(r) => formatByUnit(r)}
            />
          </div>
        </div>

        {/* PANEL DETALLE */}
        <aside className="lg:col-span-1">
          <div className="sticky top-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Detalle
                </div>
                <div className="mt-1 text-base font-semibold text-slate-900">
                  {active?.indicator ?? "Selecciona un indicador"}
                </div>
              </div>

              {active && (
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
              <div className="mt-3 flex gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                <Info className="mt-0.5 h-4 w-4" />
                <p>Haz clic en la tarjeta para ver el detalle completo.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <KV label="ETIS" value={active.etis ?? "—"} />
                <KV label="Año" value={String(active.year ?? "—")} />
                <KV
                  label="Valor"
                  value={`${formatByUnit(active)}${
                    active.unidad && !String(active.unidad).includes("%")
                      ? ` ${active.unidad}`
                      : ""
                  }`.trim()}
                  accent
                />
                <KV label="Unidad" value={active.unidad ?? "—"} />
                <KV label="Tiempo" value={active.at ?? "—"} />
                <KV label="Organismo" value={active.organismo ?? "—"} />
                <KV label="Fuente" value={active.fuente ?? "—"} />

                <Divider />

                <Block label="Descripción" value={active.description ?? "—"} />
                <Block
                  label="Datos requeridos"
                  value={active.requiredData ?? "—"}
                />

                {active.formula && (
                  <Block label="Método de cálculo" value={active.formula} />
                )}
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

/* ---------------- UI ---------------- */

const Divider: FC = () => <div className="h-px w-full bg-slate-100" />;

const KV: FC<{ label: string; value: string; accent?: boolean }> = ({
  label,
  value,
  accent,
}) => (
  <div>
    <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
      {label}
    </div>
    <div
      className={`mt-1 text-sm ${
        accent ? "font-semibold text-indigo-800" : "text-slate-800"
      }`}
    >
      {value}
    </div>
  </div>
);

const Block: FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
      {label}
    </div>
    <div className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
      {value}
    </div>
  </div>
);

const MiniStat: FC<{
  title: string;
  value: string;
  note?: string;
  accent?: boolean;
}> = ({ title, value, note, accent }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
      {title}
    </div>
    <div
      className={`mt-2 text-3xl font-semibold ${
        accent ? "text-indigo-700" : "text-slate-900"
      }`}
    >
      {value}
    </div>
    {note && <div className="mt-2 text-xs text-slate-500">{note}</div>}
  </div>
);

const SewageCard: FC<{
  row: IndicatorRow | null;
  fallbackTitle: string;
  etis: string;
  icon: any;
  color: string;
  onClick: () => void;
  active: boolean;
  formatValue: (r: IndicatorRow | null) => string;
}> = ({
  row,
  fallbackTitle,
  etis,
  icon: Icon,
  color,
  onClick,
  active,
  formatValue,
}) => {
  const title = row?.indicator ?? fallbackTitle;
  const desc = row?.description ?? "—";
  const unit = row?.unidad ?? "—";
  const src = row?.fuente ?? row?.organismo ?? null;
  const year = row?.year ?? null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none ${
        active ? "border-indigo-300 ring-2 ring-indigo-200" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            ETIS {etis}
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-900 line-clamp-2">
            {title}
          </div>
        </div>

        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
          style={{ backgroundColor: color }}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-2 text-xs text-slate-500 line-clamp-3">{desc}</div>

      <div className="mt-4 flex items-baseline justify-between gap-3">
        <div className="flex items-baseline gap-2 min-w-0">
          <span className="text-3xl font-semibold" style={{ color }}>
            {formatValue(row)}
          </span>
          <span className="text-xs text-slate-500">{unit}</span>
        </div>
        <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] text-slate-600">
          {year ?? "—"}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-[11px] text-slate-500">
        {src ? (
          <div className="flex gap-2">
            <span className="font-medium text-slate-400">Fuente:</span>
            <span className="line-clamp-1">{src}</span>
          </div>
        ) : (
          <div className="flex gap-2">
            <span className="font-medium text-slate-400">Fuente:</span>
            <span>—</span>
          </div>
        )}
      </div>

      <div className="mt-4 text-xs font-medium text-indigo-700 group-hover:text-indigo-900">
        Ver detalle →
      </div>
    </button>
  );
};

"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Users,
  BadgePercent,
  Accessibility,
  UsersRound,
  Info,
  Venus,
  Mars,
  Scale,
} from "lucide-react";

import type { IndicatorRow } from "@/lib/loadExcelData";
import { pickDefaultYear } from "@/lib/pickDefaultYear";

type Props = {
  scopeId: string;
  scopeName: string;
  data: IndicatorRow[];
};

const BRAND = "#0F766E"; // teal-700
const BRAND_SOFT = "#99F6E4"; // teal-200

function normEtis(s: string) {
  return s.trim().toUpperCase().replace(/\s+/g, "").replace(/\.$/, "");
}
function isEtis(row: IndicatorRow, code: string) {
  const rowEtis = row.etis ? normEtis(row.etis) : "";
  return rowEtis === normEtis(code);
}

function formatNum(v: number | null, max = 2) {
  if (v == null || Number.isNaN(v)) return "—";
  return v.toLocaleString("es-ES", { maximumFractionDigits: max });
}

function fmtPct(v: number | null | undefined, max = 1) {
  if (v == null || Number.isNaN(v)) return "—";
  return `${v.toLocaleString("es-ES", { maximumFractionDigits: max })}%`;
}

/** Formatea según unidad (%, etc.) */
function formatByUnit(row: IndicatorRow | null) {
  if (!row) return "—";
  const unit = (row.unidad ?? "").trim().toLowerCase();

  // % -> devolvemos SOLO el número (sin %) para que el % salga solo en pequeño
  if (unit.includes("%")) return formatNum(row.value ?? null, 2);

  return formatNum(row.value ?? null, 2);
}

/** Clave de card robusta (ETIS si existe, si no descripción+unidad) */
function cardKeyOf(row: IndicatorRow) {
  const etis = (row.etis ?? "").trim();
  if (etis) return `etis:${normEtis(etis)}`;

  const desc = (row.description ?? "").trim();
  if (desc) return `desc:${desc}`;

  return `fallback:${row.indicator ?? ""}|${row.unidad ?? ""}|${
    row.formula ?? ""
  }`;
}

export default function ImpactoSocialDashboard({
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
              (y): y is number => typeof y === "number" && !Number.isNaN(y),
            ),
        ),
      ).sort((a, b) => b - a),
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

  const [activeKey, setActiveKey] = useState<string | null>(null);

  const filtered = useMemo(
    () =>
      data.filter((d) =>
        selectedYear != null ? d.year === selectedYear : true,
      ),
    [data, selectedYear],
  );

  // ✅ ETIS específicos del ámbito
  const turistasPor100 = useMemo(
    () => filtered.find((d) => isEtis(d, "C.1.1")) ?? null,
    [filtered],
  );
  const mujeresTurismo = useMemo(
    () => filtered.find((d) => isEtis(d, "C.3.1.1")) ?? null,
    [filtered],
  );
  const hombresTurismo = useMemo(
    () => filtered.find((d) => isEtis(d, "C.3.1.2")) ?? null,
    [filtered],
  );
  const accesibilidad = useMemo(
    () => filtered.find((d) => isEtis(d, "C.4.1")) ?? null,
    [filtered],
  );

  // Lista “controlada” (solo los 4 indicadores del ámbito)
  const cards = useMemo(() => {
    const list = [
      turistasPor100,
      mujeresTurismo,
      hombresTurismo,
      accesibilidad,
    ].filter(Boolean) as IndicatorRow[];

    const map = new Map<string, IndicatorRow>();
    for (const r of list) {
      const k = cardKeyOf(r);
      if (!map.has(k)) map.set(k, r);
    }
    return Array.from(map.entries()).map(([k, row]) => ({ cardKey: k, row }));
  }, [turistasPor100, mujeresTurismo, hombresTurismo, accesibilidad]);

  const active = useMemo(() => {
    if (!activeKey) return null;
    return cards.find((c) => c.cardKey === activeKey)?.row ?? null;
  }, [activeKey, cards]);

  const genderTotalPct =
    mujeresTurismo?.value != null && hombresTurismo?.value != null
      ? mujeresTurismo.value + hombresTurismo.value
      : null;

  const genderGap =
    mujeresTurismo?.value != null && hombresTurismo?.value != null
      ? mujeresTurismo.value - hombresTurismo.value
      : null;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="text-xs text-slate-400">
            <Link href="/" className="hover:underline">
              Inicio
            </Link>{" "}
            / Impacto social / comunitario
          </p>

          <div className="mt-1 flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: BRAND }}
            >
              <UsersRound className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {scopeName}
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Presión turística, igualdad en empleo turístico y accesibilidad.
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
              className="w-40 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
              style={{ outlineColor: BRAND_SOFT as any }}
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

      {/* CARDS + RIGHT SIDEBAR */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* CARDS */}
        <div className="lg:col-span-2">
          {cards.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              No hay resultados para este filtro.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {cards.map(({ cardKey, row }) => {
                const icon = isEtis(row, "C.1.1")
                  ? Users
                  : isEtis(row, "C.4.1")
                    ? Accessibility
                    : BadgePercent;

                const title = row.description ?? row.indicator ?? "—";
                const subtitle = row.indicator ?? "—";
                const src = row.fuente ?? row.organismo ?? null;
                const year = row.year ?? null;

                return (
                  <button
                    key={cardKey}
                    type="button"
                    onClick={() => setActiveKey(cardKey)}
                    className={`group rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none ${
                      activeKey === cardKey
                        ? "border-teal-200 ring-2 ring-teal-100"
                        : "border-slate-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          ETIS {row.etis ?? "—"}
                        </div>
                        <div className="mt-1 text-sm font-semibold text-slate-900 line-clamp-2">
                          {title}
                        </div>
                        <div className="mt-1 text-xs text-slate-500 line-clamp-1">
                          {subtitle}
                        </div>
                      </div>

                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                        style={{ backgroundColor: BRAND }}
                      >
                        {React.createElement(icon, { className: "h-5 w-5" })}
                      </div>
                    </div>

                    <div className="mt-4 flex items-baseline justify-between gap-3">
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span
                          className="text-3xl font-semibold"
                          style={{ color: BRAND }}
                        >
                          {formatByUnit(row)}
                        </span>
                        {/* unidad siempre en pequeño */}
                        <span className="text-xs text-slate-500">
                          {row.unidad ?? "—"}
                        </span>
                      </div>

                      <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] text-slate-600">
                        {year ?? "—"}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-[11px] text-slate-500">
                      <div className="flex gap-2">
                        <span className="font-medium text-slate-400">
                          Fuente:
                        </span>
                        <span className="line-clamp-1">{src ?? "—"}</span>
                      </div>
                    </div>

                    <div className="mt-4 text-xs font-medium text-teal-700 group-hover:text-teal-900">
                      Ver detalle →
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: Igualdad + Detalle */}
        <aside className="lg:col-span-1">
          <div className="sticky top-4 space-y-4">
            {/* Igualdad de género arriba */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Igualdad de género
                </div>
                <Scale className="h-4 w-4 text-slate-400" />
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    <Venus className="h-4 w-4" />
                    Mujeres
                  </div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">
                    {mujeresTurismo?.value != null
                      ? fmtPct(mujeresTurismo.value, 2)
                      : "—"}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">C.3.1.1</div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-3 py-2">
                  <div className="flex items-center gap-2 text-[10px] font-medium uppercase tracking-wide text-slate-400">
                    <Mars className="h-4 w-4" />
                    Hombres
                  </div>
                  <div className="mt-1 text-lg font-semibold text-slate-900">
                    {hombresTurismo?.value != null
                      ? fmtPct(hombresTurismo.value, 2)
                      : "—"}
                  </div>
                  <div className="mt-1 text-[11px] text-slate-500">C.3.1.2</div>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
                <div className="text-xs text-slate-600">Brecha (M - H)</div>
                <div
                  className={`text-sm font-semibold ${
                    genderGap == null
                      ? "text-slate-900"
                      : genderGap >= 0
                        ? "text-emerald-700"
                        : "text-rose-700"
                  }`}
                >
                  {genderGap == null ? "—" : fmtPct(genderGap, 2)}
                </div>
              </div>
            </div>

            {/* Detalle debajo */}
            <div className="sticky top-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Detalle
                  </div>
                  <div className="mt-1 text-base font-semibold text-slate-900">
                    {active?.description ?? "Selecciona un indicador"}
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
                <div className="mt-4 flex gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                  <Info className="mt-0.5 h-4 w-4 shrink-0" />
                  <p>Haz clic en una tarjeta para ver el detalle completo.</p>
                </div>
              ) : (
                <div className="mt-4 space-y-4 text-sm overflow-x-clip">
                  <KeyValue label="Indicador" value={active.indicator ?? "—"} />
                  <KeyValue
                    label="Valor"
                    value={`${formatNum(active.value)} ${
                      active.unidad ?? ""
                    }`.trim()}
                    accent
                  />
                  <KeyValue label="Unidad" value={active.unidad ?? "—"} />
                  <KeyValue label="Tiempo" value={active.at ?? "—"} />
                  <KeyValue label="Organismo" value={active.organismo ?? "—"} />
                  <KeyValue label="Fuente" value={active.fuente ?? "—"} />

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
          </div>
        </aside>
      </section>
    </div>
  );
}

/* ---------------- UI bits ---------------- */

const Divider: FC = () => <div className="h-px w-full bg-slate-100" />;

const KeyValue: FC<{ label: string; value: string; accent?: boolean }> = ({
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
        accent ? "font-semibold text-teal-700" : "text-slate-800"
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

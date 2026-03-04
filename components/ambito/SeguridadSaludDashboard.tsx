"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Shield,
  HeartPulse,
  Siren,
  Hospital,
  AlertTriangle,
  Info,
} from "lucide-react";
import type { IndicatorRow } from "@/lib/loadExcelData";
import { pickDefaultYear } from "@/lib/pickDefaultYear";

type Props = {
  scopeId: string;
  scopeName: string;
  data: IndicatorRow[];
};

const BRAND = "#0B3D91"; // blue-ish
const BRAND_SOFT = "#BFDBFE"; // blue-200

function normEtis(s: string) {
  return s.trim().toUpperCase().replace(/\s+/g, "").replace(/\.$/, "");
}

function cardKeyOf(row: IndicatorRow) {
  const etis = (row.etis ?? "").trim();
  if (etis) return `etis:${normEtis(etis)}`;

  const desc = (row.description ?? "").trim();
  if (desc) return `desc:${desc}`;

  return `fallback:${row.indicator ?? ""}|${row.unidad ?? ""}|${
    row.formula ?? ""
  }`;
}

function formatNum(v: number | null | undefined, max = 2) {
  if (v == null || Number.isNaN(v)) return "—";
  return v.toLocaleString("es-ES", { maximumFractionDigits: max });
}

function formatByUnit(row: IndicatorRow | null) {
  if (!row) return { valueText: "—", unitText: "—" };

  const unitRaw = String(row.unidad ?? "").trim();
  const unit = unitRaw.toLowerCase();
  const v = row.value;

  // si es porcentaje, mostramos SOLO número grande y el % pequeño en unidad
  if (unit.includes("%")) {
    return { valueText: formatNum(v, 2), unitText: "%" };
  }

  // si el excel trae algo tipo "Nº", "km2", "€", etc.
  return { valueText: formatNum(v, 2), unitText: unitRaw || "—" };
}

function iconFor(row: IndicatorRow) {
  const hay = `${row.description ?? ""} ${row.indicator ?? ""}`.toLowerCase();

  if (
    hay.includes("hospital") ||
    hay.includes("sanitar") ||
    hay.includes("salud")
  )
    return Hospital;

  if (
    hay.includes("accidente") ||
    hay.includes("inciden") ||
    hay.includes("lesion")
  )
    return Siren;

  if (
    hay.includes("riesgo") ||
    hay.includes("emergenc") ||
    hay.includes("alerta")
  )
    return AlertTriangle;

  if (
    hay.includes("seguridad") ||
    hay.includes("criminal") ||
    hay.includes("delito")
  )
    return Shield;

  return HeartPulse;
}

export default function SeguridadSaludDashboard({
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

  const cards = useMemo(() => {
    const map = new Map<string, IndicatorRow>();

    for (const row of filtered) {
      const key = cardKeyOf(row);
      if (!map.has(key)) map.set(key, row);
    }

    // orden “humano”: por descripción y luego por indicador
    return Array.from(map.entries())
      .map(([cardKey, row]) => ({ cardKey, row }))
      .sort((a, b) => {
        const ad = (a.row.description ?? "").localeCompare(
          b.row.description ?? "",
          "es",
        );
        if (ad !== 0) return ad;
        return (a.row.indicator ?? "").localeCompare(
          b.row.indicator ?? "",
          "es",
        );
      });
  }, [filtered]);

  const active = useMemo(() => {
    if (!activeKey) return null;
    return cards.find((c) => c.cardKey === activeKey)?.row ?? null;
  }, [activeKey, cards]);

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0">
          <p className="text-xs text-slate-400">
            <Link href="/" className="hover:underline">
              Inicio
            </Link>{" "}
            / Seguridad y salud
          </p>

          <div className="mt-1 flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: BRAND }}
            >
              <Shield className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {scopeName}
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Indicadores de seguridad, incidentes y salud vinculados al destino.
          </p>
        </div>

        <div className="flex flex-col text-sm">
          <label className="mb-1 text-slate-500">Año</label>
          <select
            title="año"
            value={selectedYear ?? ""}
            onChange={(e) =>
              setSelectedYear(
                e.target.value === "" ? null : Number(e.target.value),
              )
            }
            className="w-40 rounded-xl border border-slate-300 bg-white px-3 py-2 shadow-sm focus:outline-none focus:ring-2"
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
      </header>

      {/* CARDS + RIGHT SIDEBAR */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* LEFT: cards */}
        <div className="lg:col-span-2">
          {cards.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
              No hay resultados para este filtro.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {cards.map(({ cardKey, row }) => {
                const Icon = iconFor(row);
                const title = row.description ?? row.indicator ?? "—";
                const subtitle = row.indicator ?? "—";
                const src = row.fuente ?? row.organismo ?? null;
                const year = row.year ?? null;

                const { valueText, unitText } = formatByUnit(row);

                return (
                  <button
                    key={cardKey}
                    type="button"
                    onClick={() => setActiveKey(cardKey)}
                    className={`group rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none ${
                      activeKey === cardKey
                        ? "border-blue-200 ring-2 ring-blue-100"
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
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>

                    <div className="mt-4 flex items-baseline justify-between gap-3">
                      <div className="flex items-baseline gap-2 min-w-0">
                        <span
                          className="text-3xl font-semibold"
                          style={{ color: BRAND }}
                        >
                          {valueText}
                        </span>
                        <span className="text-xs text-slate-500">
                          {unitText}
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

                    <div className="mt-4 text-xs font-medium text-blue-700 group-hover:text-blue-900">
                      Ver detalle →
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT: detail */}
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
              <div className="mt-4 flex gap-2 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                <Info className="mt-0.5 h-4 w-4 shrink-0" />
                <p>Haz clic en una ficha para ver el detalle completo.</p>
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                <KeyValue
                  label="Año de referencia"
                  value={String(active.year ?? "—")}
                />
                <KeyValue
                  label="Valor"
                  value={`${formatNum(active.value)} ${
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
        accent ? "font-semibold text-blue-700" : "text-slate-800"
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

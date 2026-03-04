"use client";

import React, { FC, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Droplets,
  Waves,
  Factory,
  Users,
  Globe2,
  Home,
  Info,
} from "lucide-react";
import type { IndicatorRow } from "@/lib/loadExcelData";
import RatioKpi from "@/components/ui/RatioKpi";
import { pickDefaultYear } from "@/lib/pickDefaultYear";

type Props = {
  scopeId: string;
  scopeName: string;
  data: IndicatorRow[];
};

const BRAND = "#0EA5E9"; // sky
const BRAND_DARK = "#0369A1"; // sky-700

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

/** Decide si algo parece % por su unidad o por el ETIS D.4.1 */
function formatByUnit(row: IndicatorRow | null) {
  if (!row) return "—";
  const unit = (row.unidad ?? "").trim().toLowerCase();
  if (unit === "%" || unit.includes("%") || isEtis(row, "D.4.1")) {
    return row.value == null
      ? "—"
      : `${row.value.toLocaleString("es-ES", { maximumFractionDigits: 2 })}%`;
  }
  return formatValue(row.value);
}

export default function GestionAguasDashboard({
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

  // ✅ ETIS específicos que quieres mostrar
  const depuracion = useMemo(
    () => filtered.find((d) => isEtis(d, "D.4.1")) ?? null,
    [filtered],
  );

  // Ojo: según tu tabla
  // D.5.1.1 = consumo residente (m3)
  // D.5.1.2 = consumo turista internacional (m3)
  // D.5.1.3 = consumo turista nacional (m3)
  const consumoResidente = useMemo(
    () => filtered.find((d) => isEtis(d, "D.5.1.1")) ?? null,
    [filtered],
  );
  const consumoTuristaInt = useMemo(
    () => filtered.find((d) => isEtis(d, "D.5.1.2")) ?? null,
    [filtered],
  );
  const consumoTuristaNac = useMemo(
    () => filtered.find((d) => isEtis(d, "D.5.1.3")) ?? null,
    [filtered],
  );

  // lista “controlada”: solo estos 4, en el orden que quieres
  const cards = useMemo(() => {
    const arr = [
      depuracion,
      consumoResidente,
      consumoTuristaInt,
      consumoTuristaNac,
    ].filter(Boolean) as IndicatorRow[];

    // si alguno no existe en ese año, lo dejamos igualmente “vacío” en UI (usamos nulls abajo)
    return arr;
  }, [depuracion, consumoResidente, consumoTuristaInt, consumoTuristaNac]);

  const active = useMemo(() => {
    if (!activeKey) return null;
    return (
      [depuracion, consumoResidente, consumoTuristaInt, consumoTuristaNac].find(
        (r) => r?.indicator === activeKey,
      ) ?? null
    );
  }, [
    activeKey,
    depuracion,
    consumoResidente,
    consumoTuristaInt,
    consumoTuristaNac,
  ]);

  // ratios rápidos (opcionales)
  const ratioIntVsRes =
    consumoTuristaInt?.value != null &&
    consumoResidente?.value != null &&
    consumoResidente.value !== 0
      ? consumoTuristaInt.value / consumoResidente.value
      : null;

  const ratioNacVsRes =
    consumoTuristaNac?.value != null &&
    consumoResidente?.value != null &&
    consumoResidente.value !== 0
      ? consumoTuristaNac.value / consumoResidente.value
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
            / Gestión del agua
          </p>

          <div className="mt-1 flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: BRAND }}
            >
              <Droplets className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {scopeName}
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Depuración y consumo de agua (residentes vs turistas).
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
              className="w-40 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-200"
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

      {/* KPIs / ratios (bonitos y simples, sin charts) */}
      <section className="grid gap-4 md:grid-cols-3">
        <RatioKpi
          title="Turista int. vs residente"
          ratio={ratioIntVsRes}
          numeratorLabel="turista internacional"
          denominatorLabel="residente"
          code="D.5.1.2 / D.5.1.1"
          accentColor="#7C3AED" // violeta (diferente del resto)
          helper={
            ratioIntVsRes == null
              ? "Sin datos suficientes para calcular la relación."
              : `El turista internacional consume ${ratioIntVsRes.toLocaleString(
                  "es-ES",
                  { maximumFractionDigits: 2 },
                )} veces más agua que un residente.`
          }
        />

        <RatioKpi
          title="Turista nac. vs residente"
          ratio={ratioNacVsRes}
          numeratorLabel="turista nacional"
          denominatorLabel="residente"
          code="D.5.1.3 / D.5.1.1"
          accentColor="#0F766E" // teal
          helper={
            ratioNacVsRes == null
              ? "Sin datos suficientes para calcular la relación."
              : `El turista nacional consume ${ratioNacVsRes.toLocaleString(
                  "es-ES",
                  { maximumFractionDigits: 2 },
                )} veces más agua que un residente.`
          }
        />

        <MiniStat
          title="Depuración secundaria"
          value={formatByUnit(depuracion)}
          note="ETIS D.4.1"
          accent
        />
      </section>

      {/* LISTADO + DETALLE */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* CARDS GRANDES */}
        <div className="lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
            <WaterCard
              row={depuracion}
              fallbackTitle="ETIS - Depuración de aguas residuales"
              etis="D.4.1"
              icon={Factory}
              color="#6366F1" // indigo
              onClick={() =>
                setActiveKey(
                  depuracion?.indicator ??
                    "ETIS - Depuración de aguas residuales",
                )
              }
              active={
                activeKey ===
                (depuracion?.indicator ??
                  "ETIS - Depuración de aguas residuales")
              }
              formatValue={(r) => formatByUnit(r)}
            />
            <WaterCard
              row={consumoResidente}
              fallbackTitle="ETIS - Consumo de agua (residente)"
              etis="D.5.1.1"
              icon={Home}
              color="#10B981" // emerald
              onClick={() =>
                setActiveKey(
                  consumoResidente?.indicator ??
                    "ETIS - Consumo de agua (residente)",
                )
              }
              active={
                activeKey ===
                (consumoResidente?.indicator ??
                  "ETIS - Consumo de agua (residente)")
              }
              formatValue={(r) => formatValue(r?.value ?? null)}
            />
            <WaterCard
              row={consumoTuristaInt}
              fallbackTitle="ETIS - Consumo de agua (turista internacional)"
              etis="D.5.1.2"
              icon={Globe2}
              color="#F97316" // orange
              onClick={() =>
                setActiveKey(
                  consumoTuristaInt?.indicator ??
                    "ETIS - Consumo de agua (turista internacional)",
                )
              }
              active={
                activeKey ===
                (consumoTuristaInt?.indicator ??
                  "ETIS - Consumo de agua (turista internacional)")
              }
              formatValue={(r) => formatValue(r?.value ?? null)}
            />
            <WaterCard
              row={consumoTuristaNac}
              fallbackTitle="ETIS - Consumo de agua (turista nacional)"
              etis="D.5.1.3"
              icon={Users}
              color={BRAND_DARK} // sky-700
              onClick={() =>
                setActiveKey(
                  consumoTuristaNac?.indicator ??
                    "ETIS - Consumo de agua (turista nacional)",
                )
              }
              active={
                activeKey ===
                (consumoTuristaNac?.indicator ??
                  "ETIS - Consumo de agua (turista nacional)")
              }
              formatValue={(r) => formatValue(r?.value ?? null)}
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
                <p>Haz clic en una tarjeta para ver el detalle completo.</p>
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
        accent ? "font-semibold text-sky-800" : "text-slate-800"
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
        accent ? "text-sky-700" : "text-slate-900"
      }`}
    >
      {value}
    </div>
    {note && <div className="mt-2 text-xs text-slate-500">{note}</div>}
  </div>
);

const WaterCard: FC<{
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
        active ? "border-sky-300 ring-2 ring-sky-200" : "border-slate-200"
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

      <div className="mt-4 text-xs font-medium text-sky-700 group-hover:text-sky-900">
        Ver detalle →
      </div>
    </button>
  );
};

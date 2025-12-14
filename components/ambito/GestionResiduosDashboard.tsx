"use client";

import React, { FC, useMemo, useState } from "react";
import Link from "next/link";
import { Trash2, Recycle, Users, Globe2, Percent, Info } from "lucide-react";

import type { IndicatorRow } from "@/lib/loadExcelData";
import RatioKpi from "@/components/ui/RatioKpi";

type Props = {
  scopeId: string;
  scopeName: string;
  data: IndicatorRow[];
};

const BRAND = "#7C3AED"; // violeta
const BRAND_SOFT = "#A78BFA";

function formatNum(v: number | null, max = 2) {
  if (v == null || Number.isNaN(v)) return "—";
  return v.toLocaleString("es-ES", { maximumFractionDigits: max });
}

function formatPct(v: number | null, max = 2) {
  if (v == null || Number.isNaN(v)) return "—";
  return `${v.toLocaleString("es-ES", { maximumFractionDigits: max })}%`;
}

function normEtis(s: string) {
  return s.trim().toUpperCase().replace(/\s+/g, "").replace(/\.$/, "");
}

function isEtis(row: IndicatorRow, code: string) {
  const rowEtis = row.etis ? normEtis(row.etis) : "";
  return rowEtis === normEtis(code);
}

/** Decide formateo por unidad o por ETIS (por si el excel trae la unidad rara) */
function formatByUnit(row: IndicatorRow | null) {
  if (!row) return "—";
  const unit = (row.unidad ?? "").trim().toLowerCase();

  // Porcentaje → solo número (sin %)
  if (unit.includes("%") || isEtis(row, "D.3.3")) {
    return formatNum(row.value ?? null, 2);
  }

  // Números normales (Kg, Tn, etc.)
  return formatNum(row.value ?? null, 2);
}

export default function GestionResiduosDashboard({
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

  // ✅ ETIS específicos
  const residuosTuristas = useMemo(
    () => filtered.find((d) => isEtis(d, "D.3.1.1")) ?? null,
    [filtered]
  );
  const residuosResidentes = useMemo(
    () => filtered.find((d) => isEtis(d, "D.3.1.2")) ?? null,
    [filtered]
  );

  const recicladoPctTurVsRes = useMemo(
    () => filtered.find((d) => isEtis(d, "D.3.3")) ?? null,
    [filtered]
  );
  const recicladoResidente = useMemo(
    () => filtered.find((d) => isEtis(d, "D.3.3.1")) ?? null,
    [filtered]
  );
  const recicladoTurista = useMemo(
    () => filtered.find((d) => isEtis(d, "D.3.3.2")) ?? null,
    [filtered]
  );

  const active = useMemo(() => {
    if (!activeKey) return null;
    return (
      [
        residuosTuristas,
        residuosResidentes,
        recicladoPctTurVsRes,
        recicladoResidente,
        recicladoTurista,
      ].find((r) => (r?.indicator ?? "") === activeKey) ?? null
    );
  }, [
    activeKey,
    residuosTuristas,
    residuosResidentes,
    recicladoPctTurVsRes,
    recicladoResidente,
    recicladoTurista,
  ]);

  // Ratios
  const ratioResiduosTurVsRes =
    residuosTuristas?.value != null &&
    residuosResidentes?.value != null &&
    residuosResidentes.value !== 0
      ? residuosTuristas.value / residuosResidentes.value
      : null;

  const ratioRecicladoTurVsRes =
    recicladoTurista?.value != null &&
    recicladoResidente?.value != null &&
    recicladoResidente.value !== 0
      ? recicladoTurista.value / recicladoResidente.value
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
            / Gestión de residuos
          </p>

          <div className="mt-1 flex items-center gap-2">
            <div
              className="flex h-9 w-9 items-center justify-center rounded-xl text-white"
              style={{ backgroundColor: BRAND }}
            >
              <Recycle className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {scopeName}
            </h1>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Generación de residuos y reciclaje (turistas vs residentes).
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
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              className="w-40 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2"
              style={{ outlineColor: BRAND_SOFT }}
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

      {/* KPIs / ratios */}
      <section className="grid gap-4 md:grid-cols-3">
        <RatioKpi
          title="Residuos: turista vs residente"
          ratio={ratioResiduosTurVsRes}
          numeratorLabel="turista"
          denominatorLabel="residente"
          code="D.3.1.1 / D.3.1.2"
          accentColor="#F97316"
          helper={
            ratioResiduosTurVsRes == null
              ? "Sin datos suficientes para calcular la relación."
              : `El turista genera ${ratioResiduosTurVsRes.toLocaleString(
                  "es-ES",
                  {
                    maximumFractionDigits: 2,
                  }
                )} veces más residuos que un residente.`
          }
        />

        <RatioKpi
          title="Reciclaje: turista vs residente"
          ratio={ratioRecicladoTurVsRes}
          numeratorLabel="turista"
          denominatorLabel="residente"
          code="D.3.3.2 / D.3.3.1"
          accentColor="#0EA5E9"
          helper={
            ratioRecicladoTurVsRes == null
              ? "Sin datos suficientes para calcular la relación."
              : `El reciclaje por turista es ${ratioRecicladoTurVsRes.toLocaleString(
                  "es-ES",
                  {
                    maximumFractionDigits: 2,
                  }
                )} veces el reciclaje por residente.`
          }
        />

        <MiniStat
          title="Reciclaje turistas vs residentes"
          value={formatByUnit(recicladoPctTurVsRes)}
          note="ETIS D.3.3"
          accent
          icon={Percent}
        />
      </section>

      {/* CARDS + DETALLE */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* CARDS GRANDES */}
        <div className="lg:col-span-2">
          <div className="grid gap-4 md:grid-cols-2">
            <WasteCard
              row={residuosTuristas}
              fallbackTitle="ETIS - Generación de residuos turistas"
              etis="D.3.1.1"
              icon={Globe2}
              color="#F97316"
              onClick={() =>
                setActiveKey(
                  residuosTuristas?.indicator ??
                    "ETIS - Generación de residuos turistas"
                )
              }
              active={
                activeKey ===
                (residuosTuristas?.indicator ??
                  "ETIS - Generación de residuos turistas")
              }
              valueText={formatByUnit(residuosTuristas)}
            />

            <WasteCard
              row={residuosResidentes}
              fallbackTitle="ETIS - Generación de residuos residentes"
              etis="D.3.1.2"
              icon={Users}
              color="#10B981"
              onClick={() =>
                setActiveKey(
                  residuosResidentes?.indicator ??
                    "ETIS - Generación de residuos residentes"
                )
              }
              active={
                activeKey ===
                (residuosResidentes?.indicator ??
                  "ETIS - Generación de residuos residentes")
              }
              valueText={formatByUnit(residuosResidentes)}
            />

            <WasteCard
              row={recicladoResidente}
              fallbackTitle="ETIS - Reciclado por residente"
              etis="D.3.3.1"
              icon={Trash2}
              color="#6366F1"
              onClick={() =>
                setActiveKey(
                  recicladoResidente?.indicator ??
                    "ETIS - Reciclado por residente"
                )
              }
              active={
                activeKey ===
                (recicladoResidente?.indicator ??
                  "ETIS - Reciclado por residente")
              }
              valueText={formatByUnit(recicladoResidente)}
            />

            <WasteCard
              row={recicladoTurista}
              fallbackTitle="ETIS - Reciclado por turista"
              etis="D.3.3.2"
              icon={Recycle}
              color={BRAND}
              onClick={() =>
                setActiveKey(
                  recicladoTurista?.indicator ?? "ETIS - Reciclado por turista"
                )
              }
              active={
                activeKey ===
                (recicladoTurista?.indicator ?? "ETIS - Reciclado por turista")
              }
              valueText={formatByUnit(recicladoTurista)}
            />
          </div>

          {/* % D.3.3 como card “larga” opcional */}
          <div className="mt-4">
            <WideCard
              row={recicladoPctTurVsRes}
              etis="D.3.3"
              title="ETIS - % residuos reciclados por turistas respecto a residentes"
              color="#0EA5E9"
              onClick={() =>
                setActiveKey(
                  recicladoPctTurVsRes?.indicator ??
                    "ETIS - % residuos reciclados por turistas respecto a residentes"
                )
              }
              active={
                activeKey ===
                (recicladoPctTurVsRes?.indicator ??
                  "ETIS - % residuos reciclados por turistas respecto a residentes")
              }
              valueText={formatByUnit(recicladoPctTurVsRes)}
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
        accent ? "font-semibold text-violet-700" : "text-slate-800"
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
  icon?: any;
}> = ({ title, value, note, accent, icon: Icon }) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {title}
      </div>
      {Icon && <Icon className="h-4 w-4 text-slate-400" />}
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

const WasteCard: FC<{
  row: IndicatorRow | null;
  fallbackTitle: string;
  etis: string;
  icon: any;
  color: string;
  onClick: () => void;
  active: boolean;
  valueText: string;
}> = ({
  row,
  fallbackTitle,
  etis,
  icon: Icon,
  color,
  onClick,
  active,
  valueText,
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
        active ? "border-violet-200 ring-2 ring-violet-100" : "border-slate-200"
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
            {valueText}
          </span>
          <span className="text-xs text-slate-500">{unit}</span>
        </div>
        <span className="rounded-full bg-slate-50 px-2 py-1 text-[10px] text-slate-600">
          {year ?? "—"}
        </span>
      </div>

      <div className="mt-3 space-y-1 text-[11px] text-slate-500">
        <div className="flex gap-2">
          <span className="font-medium text-slate-400">Fuente:</span>
          <span className="line-clamp-1">{src ?? "—"}</span>
        </div>
      </div>

      <div className="mt-4 text-xs font-medium text-violet-700 group-hover:text-violet-900">
        Ver detalle →
      </div>
    </button>
  );
};

const WideCard: FC<{
  row: IndicatorRow | null;
  etis: string;
  title: string;
  color: string;
  onClick: () => void;
  active: boolean;
  valueText: string;
}> = ({ row, etis, title, color, onClick, active, valueText }) => {
  const desc = row?.description ?? "—";
  const unit = row?.unidad ?? "%";
  const year = row?.year ?? null;
  const src = row?.fuente ?? row?.organismo ?? null;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-2xl border bg-white p-5 text-left shadow-sm transition hover:shadow-md ${
        active ? "border-sky-200 ring-2 ring-sky-100" : "border-slate-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
            ETIS {etis}
          </div>
          <div className="mt-1 text-sm font-semibold text-slate-900">
            {title}
          </div>
          <div className="mt-2 text-xs text-slate-500 line-clamp-2">{desc}</div>
          <div className="mt-3 text-[11px] text-slate-500">
            <span className="font-medium text-slate-400">Fuente:</span>{" "}
            {src ?? "—"}
          </div>
        </div>

        <div className="shrink-0 text-right">
          <div className="text-3xl font-semibold" style={{ color }}>
            {valueText}
          </div>
          <div className="mt-1 text-xs text-slate-500">{unit}</div>
          <div className="mt-2 inline-flex rounded-full bg-slate-50 px-2 py-1 text-[10px] text-slate-600">
            {year ?? "—"}
          </div>
        </div>
      </div>
    </button>
  );
};

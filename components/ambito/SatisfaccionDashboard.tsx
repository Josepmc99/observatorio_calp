"use client";

import React, { FC, useMemo, useState } from "react";
import Link from "next/link";
import { Smile, Frown, Scale } from "lucide-react";

import type { IndicatorRow } from "@/lib/loadExcelData";
import IndicatorGrid from "@/components/IndicatorGrid";
import Stars from "@/components/ui/Stars";

type Props = {
  scopeId: string;
  scopeName: string;
  data: IndicatorRow[];

  // 👇 configuración para que sirva para Local / Turística
  breadcrumbLabel: string; // texto para el breadcrumb final (p.ej. "Satisfacción local")
  intro: string; // texto descriptivo bajo el h1

  etisPositive: string; // p.ej. "C.5.1.1"
  etisNegative: string; // p.ej. "C.5.1.2"

  positiveTitle?: string; // opcional (si quieres personalizar)
  negativeTitle?: string;

  positiveColor?: string;
  negativeColor?: string;
};

const DEFAULT_POSITIVE = "#059669"; // emerald-600
const DEFAULT_NEGATIVE = "#DC2626"; // red-600

function formatPct(v: number | null) {
  if (v == null || Number.isNaN(v)) return "—";
  return `${v.toLocaleString("es-ES", { maximumFractionDigits: 1 })}%`;
}

function normEtis(s: string) {
  return s.trim().toUpperCase().replace(/\s+/g, "").replace(/\.$/, "");
}

function isEtis(row: IndicatorRow, code: string) {
  const rowEtis = row.etis ? normEtis(row.etis) : "";
  return rowEtis === normEtis(code);
}

export default function SatisfaccionDashboard({
  scopeId,
  scopeName,
  data,
  breadcrumbLabel,
  intro,
  etisPositive,
  etisNegative,
  positiveTitle,
  negativeTitle,
  positiveColor = DEFAULT_POSITIVE,
  negativeColor = DEFAULT_NEGATIVE,
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

  const filtered = useMemo(
    () =>
      data.filter((d) =>
        selectedYear != null ? d.year === selectedYear : true
      ),
    [data, selectedYear]
  );

  const positive = useMemo(
    () => filtered.find((d) => isEtis(d, etisPositive)) ?? null,
    [filtered, etisPositive]
  );

  const negative = useMemo(
    () => filtered.find((d) => isEtis(d, etisNegative)) ?? null,
    [filtered, etisNegative]
  );

  const balance =
    positive?.value != null && negative?.value != null
      ? positive.value - negative.value
      : null;

  const posTitle =
    positiveTitle ?? `Satisfacción positiva (ETIS ${etisPositive})`;
  const negTitle =
    negativeTitle ?? `Satisfacción negativa (ETIS ${etisNegative})`;

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <header className="border-b border-slate-200 pb-4">
        <p className="text-xs text-slate-400">
          <Link href="/" className="hover:underline">
            Inicio
          </Link>{" "}
          / {breadcrumbLabel}
        </p>

        <h1 className="mt-1 text-2xl font-semibold text-slate-900">
          {scopeName}
        </h1>

        <p className="mt-1 text-sm text-slate-500">{intro}</p>

        {years.length > 0 && (
          <div className="mt-3">
            <label className="sr-only" htmlFor="yearSelect">
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
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-[#F97373]/40"
            >
              <option value="">Todos</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        )}
      </header>

      {/* HERO */}
      <section className="grid gap-4 md:grid-cols-3">
        <SatisfactionCard
          title={posTitle}
          icon={Smile}
          value={formatPct(positive?.value ?? null)}
          starsValue={positive?.value ?? null}
          description={positive?.description}
          color={positiveColor}
          meta={[
            positive?.year ? `Año: ${positive.year}` : null,
            positive?.fuente ? `Fuente: ${positive.fuente}` : null,
            positive?.etis ? `ETIS: ${positive.etis}` : `ETIS: ${etisPositive}`,
          ]}
        />

        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-center shadow-sm">
          <Scale className="mx-auto h-8 w-8 text-slate-500" />
          <div className="mt-2 text-xs uppercase tracking-wide text-slate-400">
            Balance
          </div>

          <div
            className={`mt-2 text-3xl font-semibold ${
              balance != null && balance >= 0
                ? "text-emerald-600"
                : "text-red-600"
            }`}
          >
            {balance != null ? formatPct(balance) : "—"}
          </div>

          <p className="mt-1 text-xs text-slate-500">
            Diferencia positiva − negativa
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            {positive?.value != null && negative?.value != null
              ? `${formatPct(positive.value)} − ${formatPct(negative.value)}`
              : "Completa ambos indicadores para calcularlo"}
          </p>
        </div>

        <SatisfactionCard
          title={negTitle}
          icon={Frown}
          value={formatPct(negative?.value ?? null)}
          starsValue={negative?.value ?? null}
          description={negative?.description}
          color={negativeColor}
          meta={[
            negative?.year ? `Año: ${negative.year}` : null,
            negative?.fuente ? `Fuente: ${negative.fuente}` : null,
            negative?.etis ? `ETIS: ${negative.etis}` : `ETIS: ${etisNegative}`,
          ]}
        />
      </section>

      {/* RESTO */}
      {/* <section>
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          Otros indicadores del ámbito
        </h2>
        <IndicatorGrid filtered={filtered} clickable={false} />
      </section> */}
    </div>
  );
}

/* ---------------- UI ---------------- */

type CardProps = {
  title: string;
  value: string;
  starsValue: number | null;
  description?: string | null;
  icon: any;
  color: string;
  meta?: Array<string | null>;
};

const SatisfactionCard: FC<CardProps> = ({
  title,
  value,
  starsValue,
  description,
  icon: Icon,
  color,
  meta,
}) => (
  <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex items-center gap-3">
      <div
        className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
        style={{ backgroundColor: color }}
      >
        <Icon size={20} />
      </div>
      <div className="min-w-0 text-sm font-semibold text-slate-900">
        {title}
      </div>
    </div>

    <div className="mt-4 text-4xl font-semibold" style={{ color }}>
      {value}
    </div>

    <Stars value={starsValue} color={color} />

    {meta?.some(Boolean) && (
      <div className="mt-2 space-y-1 text-[11px] text-slate-500">
        {meta.filter(Boolean).map((m, idx) => (
          <div key={idx}>{m}</div>
        ))}
      </div>
    )}

    {description && (
      <p className="mt-3 text-xs text-slate-500">{description}</p>
    )}
  </div>
);

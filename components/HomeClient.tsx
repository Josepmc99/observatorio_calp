"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useMemo, useState } from "react";
import {
  Landmark,
  Leaf,
  Users,
  BarChart3,
  Building2,
  Globe,
  Droplets,
  Recycle,
  CloudSun,
  Shield,
  Bus,
  PartyPopper,
  Trees,
  GraduationCap,
  Accessibility,
  Bolt,
  PackageSearch,
  Sparkles,
  CalendarRange,
  Euro,
  Search,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { pickDefaultYear, PREFERRED_DEFAULT_YEAR } from "@/lib/pickDefaultYear";

type ScopeStats = {
  scopeId: string;
  scopeName: string;
  total: number;
  withValue: number;
  missing: number;
  coverage: number;
  oblig: number;
  opc: number;
  segLabel: "Obligatorio" | "Adicional" | "Mixto" | "Sin clasificar";
  segTone: "emerald" | "amber" | "slate";
};

type Props = {
  indicators: {
    year: number | null;
    scopeId: string | null;
    scope: string | null;
    value: number | null;
    at: string | null;
  }[];
  years: number[];
  defaultYear: number | null;
};

function norm(s: string) {
  return (s ?? "").trim().toLowerCase();
}

function safeHasValue(v: any) {
  return typeof v === "number" && !Number.isNaN(v);
}

function isObligatorio(at: string | null | undefined) {
  const v = norm(at ?? "");
  return v.includes("oblig");
}

function isOpcional(at: string | null | undefined) {
  const v = norm(at ?? "");
  return v.includes("dicional") || v.includes("opcion");
}

function segFromCounts(oblig: number, opc: number) {
  if (oblig > 0 && opc === 0)
    return { segLabel: "Obligatorio" as const, segTone: "emerald" as const };
  if (opc > 0 && oblig === 0)
    return { segLabel: "Adicional" as const, segTone: "amber" as const };
  if (opc > 0 && oblig > 0)
    return { segLabel: "Mixto" as const, segTone: "slate" as const };
  return { segLabel: "Sin clasificar" as const, segTone: "slate" as const };
}

function scopeMeta(scopeName: string) {
  const k = norm(scopeName);

  if (k.includes("gobernanza"))
    return {
      icon: Landmark,
      desc: "Trazabilidad: fuentes, organismo, método y comentarios.",
      accent: "#7F1D1D",
      grad: "from-rose-50 to-white",
    };

  if (k === "ambiental" || k.includes("medio ambiente"))
    return {
      icon: Leaf,
      desc: "Presiones ambientales, recursos naturales y conservación.",
      accent: "#16A34A",
      grad: "from-emerald-50 to-white",
    };

  if (k.includes("estacionalidad"))
    return {
      icon: CalendarRange,
      desc: "Distribución temporal del turismo y variaciones estacionales.",
      accent: "#0EA5E9",
      grad: "from-sky-50 to-white",
    };

  if (k.includes("rendimiento"))
    return {
      icon: Building2,
      desc: "Capacidad alojativa, plazas y tipologías.",
      accent: "#F97316",
      grad: "from-orange-50 to-white",
    };

  if (k.includes("satisfacción local") || k.includes("satisfaccion local"))
    return {
      icon: Sparkles,
      desc: "Percepción local: satisfacción positiva/negativa y balance.",
      accent: "#059669",
      grad: "from-emerald-50 to-white",
    };

  if (
    k.includes("satisfacción turística") ||
    k.includes("satisfaccion turistica")
  )
    return {
      icon: Users,
      desc: "Percepción turística: satisfacción positiva/negativa y balance.",
      accent: "#2563EB",
      grad: "from-blue-50 to-white",
    };

  if (k.includes("beneficios") && k.includes("econ"))
    return {
      icon: Euro,
      desc: "Impacto económico del turismo en el destino.",
      accent: "#7C3AED",
      grad: "from-violet-50 to-white",
    };

  if (k.includes("agua"))
    return {
      icon: Droplets,
      desc: "Depuración y consumo de agua (residentes vs turistas).",
      accent: "#0284C7",
      grad: "from-sky-50 to-white",
    };

  if (k.includes("residuos"))
    return {
      icon: Recycle,
      desc: "Generación de residuos y reciclaje (turistas vs residentes).",
      accent: "#7C3AED",
      grad: "from-violet-50 to-white",
    };

  if (k.includes("accion por el clima") || k.includes("acción por el clima"))
    return {
      icon: CloudSun,
      desc: "Riesgos, impactos y adaptación frente al cambio climático.",
      accent: "#16A34A",
      grad: "from-emerald-50 to-white",
    };

  if (k.includes("impacto social") || k.includes("comunitario"))
    return {
      icon: Users,
      desc: "Presión turística, igualdad, cohesión y accesibilidad.",
      accent: "#0F766E",
      grad: "from-teal-50 to-white",
    };

  if (k.includes("seguridad") || k.includes("salud"))
    return {
      icon: Shield,
      desc: "Indicadores de seguridad, salud y percepción.",
      accent: "#334155",
      grad: "from-slate-100 to-white",
    };

  if (k.includes("transporte"))
    return {
      icon: Bus,
      desc: "Modal split privado/colectivo y distancias recorridas.",
      accent: "#DC2626",
      grad: "from-rose-50 to-white",
    };

  if (k.includes("eventos") && k.includes("sostenible"))
    return {
      icon: PartyPopper,
      desc: "Canales y vías para promover turismo sostenible.",
      accent: "#F59E0B",
      grad: "from-amber-50 to-white",
    };

  if (
    k.includes("paisaje") ||
    k.includes("biodiversidad") ||
    k.includes("protección")
  )
    return {
      icon: Trees,
      desc: "Protección del paisaje, biodiversidad y entorno natural.",
      accent: "#15803D",
      grad: "from-green-50 to-white",
    };

  if (
    k.includes("educación") ||
    k.includes("formación") ||
    k.includes("sensibil")
  )
    return {
      icon: GraduationCap,
      desc: "Conciencia turística y formación en sostenibilidad.",
      accent: "#2563EB",
      grad: "from-blue-50 to-white",
    };

  if (k.includes("accesibilidad"))
    return {
      icon: Accessibility,
      desc: "Acceso universal y experiencia inclusiva.",
      accent: "#0EA5E9",
      grad: "from-sky-50 to-white",
    };

  if (k.includes("energ"))
    return {
      icon: Bolt,
      desc: "Consumo, eficiencia y transición energética.",
      accent: "#F97316",
      grad: "from-orange-50 to-white",
    };

  if (k.includes("suministros") || k.includes("cadena"))
    return {
      icon: PackageSearch,
      desc: "Compras, proveedores y criterios sostenibles.",
      accent: "#64748B",
      grad: "from-slate-100 to-white",
    };

  return {
    icon: Globe,
    desc: "Indicadores del ámbito y trazabilidad de datos.",
    accent: "#64748B",
    grad: "from-slate-100 to-white",
  };
}

function SegChip({
  label,
  tone,
}: {
  label: ScopeStats["segLabel"];
  tone: ScopeStats["segTone"];
}) {
  const cls =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "amber"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold ${cls}`}
    >
      {label}
    </span>
  );
}

function formatInt(n: number) {
  return n.toLocaleString("es-ES");
}

export default function HomeClient({ indicators, years, defaultYear }: Props) {
  const [selectedYear, setSelectedYear] = useState<number | null>(() =>
    pickDefaultYear(years, defaultYear ?? PREFERRED_DEFAULT_YEAR),
  );

  const [query, setQuery] = useState("");
  const [segFilter, setSegFilter] = useState<"Todos" | ScopeStats["segLabel"]>(
    "Todos",
  );

  const indicatorsYear = useMemo(() => {
    if (selectedYear == null) return indicators;
    return indicators.filter((r) => r.year === selectedYear);
  }, [indicators, selectedYear]);

  const statsByScope: ScopeStats[] = useMemo(() => {
    const map = new Map<
      string,
      { scopeId: string; scopeName: string; rows: typeof indicatorsYear }
    >();

    for (const row of indicatorsYear) {
      if (!row.scopeId || !row.scope) continue;
      const id = row.scopeId.trim();
      const name = row.scope.trim();
      if (!id) continue;

      if (!map.has(id))
        map.set(id, { scopeId: id, scopeName: name, rows: [] as any });
      map.get(id)!.rows.push(row);
    }

    const out = Array.from(map.values()).map(({ scopeId, scopeName, rows }) => {
      const total = rows.length;
      const withValue = rows.filter((r) => safeHasValue(r.value)).length;
      const missing = total - withValue;
      const coverage = total > 0 ? (withValue / total) * 100 : 0;

      const oblig = rows.filter((r) => isObligatorio(r.at)).length;
      const opc = rows.filter((r) => isOpcional(r.at)).length;
      const seg = segFromCounts(oblig, opc);

      return {
        scopeId,
        scopeName,
        total,
        withValue,
        missing,
        coverage,
        oblig,
        opc,
        ...seg,
      };
    });

    // Orden: obligatorio primero, luego más cobertura, luego alfabético
    out.sort((a, b) => {
      const weight = (x: ScopeStats) =>
        x.segLabel === "Obligatorio"
          ? 0
          : x.segLabel === "Mixto"
            ? 1
            : x.segLabel === "Adicional"
              ? 2
              : 3;

      const wa = weight(a);
      const wb = weight(b);
      if (wa !== wb) return wa - wb;

      if (b.coverage !== a.coverage) return b.coverage - a.coverage;

      return a.scopeName.localeCompare(b.scopeName, "es");
    });

    return out;
  }, [indicatorsYear]);

  const global = useMemo(() => {
    const total = indicatorsYear.length;
    const withValue = indicatorsYear.filter((r) =>
      safeHasValue(r.value),
    ).length;
    const coverage = total > 0 ? (withValue / total) * 100 : 0;
    return { total, withValue, coverage };
  }, [indicatorsYear]);

  const filteredScopes = useMemo(() => {
    const q = norm(query);

    return statsByScope.filter((s) => {
      const meta = scopeMeta(s.scopeName);
      const segOk = segFilter === "Todos" ? true : s.segLabel === segFilter;

      const haystack = norm(
        [
          s.scopeName,
          meta.desc,
          s.segLabel,
          s.scopeId,
          String(s.total),
          String(s.withValue),
        ].join(" "),
      );

      const qOk = q.length === 0 ? true : haystack.includes(q);

      return segOk && qOk;
    });
  }, [statsByScope, query, segFilter]);

  const shown = useMemo(() => {
    const total = filteredScopes.reduce((acc, s) => acc + s.total, 0);
    const withValue = filteredScopes.reduce((acc, s) => acc + s.withValue, 0);
    const coverage = total > 0 ? (withValue / total) * 100 : 0;
    return { total, withValue, coverage };
  }, [filteredScopes]);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Top bar */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-clip-border text-xs font-bold ">
              <Image src="/logo.jpg" alt="Logo" width={70} height={70} />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Observatorio Calp ·{" "}
                <span className="text-[#0070C0]">Red INSTO</span>
              </h1>
              <p className="text-sm text-slate-500">
                Monitor de ámbitos e indicadores turísticos sostenibles
              </p>
            </div>
          </div>

          <div className="hidden text-xs text-slate-400 md:block">
            {formatInt(global.withValue)} / {formatInt(global.total)}{" "}
            indicadores con dato · Cobertura {global.coverage.toFixed(0)}%
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-slate-800">
              Selecciona un ámbito
            </h2>
            <p className="text-sm text-slate-500">
              Filtra por texto y por tipo de seguimiento
              (Obligatorio/Adicional).
            </p>

            <div className="mt-2 flex flex-wrap gap-2 text-xs">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                <BarChart3 className="h-4 w-4" />
                {formatInt(shown.total)} indicadores (visibles)
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                {formatInt(shown.withValue)} con dato
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-sky-700">
                <Sparkles className="h-4 w-4" />
                Cobertura {shown.coverage.toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Buscador + filtro */}
          <div className="w-full md:w-[420px] space-y-2">
            <div className="flex gap-2 ">
              <div className="flex w-full items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-slate-200">
                <Search className="h-4 w-4 text-slate-400" />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar ámbito, descripción, ID, seguimiento…"
                  className="w-full bg-transparent text-sm outline-none"
                />
              </div>

              <select
                value={segFilter}
                onChange={(e) => setSegFilter(e.target.value as any)}
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm"
                title="Filtrar por seguimiento"
              >
                <option value="Todos">Todos</option>
                <option value="Obligatorio">Obligatorio</option>
                <option value="Mixto">Mixto</option>
                <option value="Adicional">Adicional</option>
                <option value="Sin clasificar">Sin clasificar</option>
              </select>
            </div>

            <div className="flex justify-end items-center gap-4">
              <div className="text-[11px] text-slate-500">
                Mostrando{" "}
                <span className="font-semibold text-slate-800">
                  {filteredScopes.length}
                </span>{" "}
                ámbitos
              </div>
              <select
                value={selectedYear ?? ""}
                onChange={(e) =>
                  setSelectedYear(
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm w-32"
                title="Filtrar por año"
              >
                {years.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </header>

        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredScopes.map((s) => {
            const href = `/ambito?scopeId=${encodeURIComponent(
              s.scopeId,
            )}&year=${encodeURIComponent(String(selectedYear ?? ""))}`;

            const meta = scopeMeta(s.scopeName);

            const Icon = meta.icon;
            const accent = meta.accent;
            const coverage = Math.max(0, Math.min(100, s.coverage));

            return (
              <Link
                key={s.scopeId}
                href={href}
                className="group rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-slate-200"
              >
                <div
                  className={`rounded-t-2xl bg-gradient-to-b ${meta.grad} p-5`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-3">
                        <span
                          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white shadow-sm"
                          style={{ backgroundColor: accent }}
                        >
                          <Icon className="h-5 w-5 stroke-[1.75]" />
                        </span>

                        <div className="min-w-0">
                          <h3 className="text-base font-semibold text-slate-900 line-clamp-2">
                            {s.scopeName}
                          </h3>
                          <p className="text-xs text-slate-500">
                            ID: {s.scopeId}
                          </p>
                        </div>
                      </div>

                      <p className="mt-3 text-xs text-slate-600 line-clamp-3">
                        {meta.desc}
                      </p>
                    </div>

                    <SegChip label={s.segLabel} tone={s.segTone} />
                  </div>
                </div>

                <div className="p-5 pt-4">
                  <div className="grid grid-cols-3 gap-3">
                    <MiniKpi label="Indicadores" value={formatInt(s.total)} />
                    <MiniKpi
                      label="Con dato"
                      value={formatInt(s.withValue)}
                      good
                    />
                    <MiniKpi
                      label="Pendientes"
                      value={formatInt(s.missing)}
                      warn
                    />
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span className="font-medium uppercase tracking-wide">
                        Cobertura
                      </span>
                      <span className="font-semibold text-slate-800">
                        {coverage.toFixed(0)}%
                      </span>
                    </div>

                    <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full transition"
                        style={{
                          width: `${coverage}%`,
                          backgroundColor: accent,
                        }}
                      />
                    </div>

                    <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
                      {coverage >= 70 ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                          Buena cobertura
                        </>
                      ) : coverage >= 35 ? (
                        <>
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          Cobertura media
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-rose-600" />
                          Cobertura baja
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 text-sm font-medium text-[#7F1D1D] group-hover:text-[#9F1239]">
                    Ver indicadores →
                  </div>
                </div>
              </Link>
            );
          })}
        </section>

        {filteredScopes.length === 0 && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
            No hay ámbitos que coincidan con el filtro.
          </div>
        )}
      </div>
    </main>
  );
}

/* UI */
function MiniKpi({
  label,
  value,
  good,
  warn,
}: {
  label: string;
  value: string;
  good?: boolean;
  warn?: boolean;
}) {
  const tone = good
    ? "text-emerald-700 bg-emerald-50 border-emerald-100"
    : warn
      ? "text-amber-700 bg-amber-50 border-amber-100"
      : "text-slate-900 bg-white border-slate-200";

  return (
    <div className={`rounded-xl border px-3 py-2 ${tone}`}>
      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold">{value}</div>
    </div>
  );
}

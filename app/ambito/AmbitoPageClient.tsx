"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";

import type { DashboardData, IndicatorRow } from "@/lib/loadExcelData";
import AmbitoDashboard from "@/components/AmbitoDashboard";

// Dashboards específicos por ámbito
import AmbientalDashboard from "@/components/ambito/AmbientalDashboard";
import GobernanzaDashboard from "@/components/ambito/GobernanzaDashboard";
import EstacionalidadDashboard from "@/components/ambito/EstacionalidadDashboard";
import RendimientoDashboard from "@/components/ambito/RendimientoDashboard";
import SatisfaccionLocalDashboard from "@/components/ambito/SatisfaccionLocalDashboard";
import SatisfaccionTuristicaDashboard from "@/components/ambito/SatisfaccionTuristicaDashboard";
import BeneficiosEconomicosDashboard from "@/components/ambito/BeneficiosEconomicosDashboard";
import GestionAguasDashboard from "@/components/ambito/GestionAguasDashboard";
import GestionResiduosDashboard from "@/components/ambito/GestionResiduosDashboard";
import AccionClimaDashboard from "@/components/ambito/AccionClimaDashboard";
import ImpactoSocialDashboard from "@/components/ambito/ImpactoSocialDashboard";
import SeguridadSaludDashboard from "@/components/ambito/SeguridadSaludDashboard";
import ReduccionImpactoTransporteDashboard from "@/components/ambito/ReduccionImpactoTransporteDashboard";
import EventosSosteniblesDashboard from "@/components/ambito/EventosSosteniblesDashboard";
import ProteccionPaisajeBiodiversidadDashboard from "@/components/ambito/ProteccionPaisajeBiodiversidad";
import EducacionFormacionSostenibleDashboard from "@/components/ambito/EducacionFormacionSostenibleDashboard";
import AccesibilidadDashboard from "@/components/ambito/AccesibilidadDashboard";
import GestionEnergeticaDashboard from "@/components/ambito/GestionEnergeticaDashboard";
import CadenaSuministrosDashboard from "@/components/ambito/CadenaSuministrosDashboard";

// Iconos premium
import {
  Leaf,
  Landmark,
  CalendarRange,
  Hotel,
  Smile,
  Euro,
  Droplets,
  Recycle,
  CloudSun,
  Users,
  Shield,
  Bus,
  PartyPopper,
  Trees,
  GraduationCap,
  Accessibility,
  Bolt,
  PackageSearch,
  Search,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
} from "lucide-react";

type AmbitoPageClientProps = {
  data: DashboardData;
};

function norm(s: string) {
  return (s ?? "").trim().toLowerCase();
}

function isObligatorio(at: string | null | undefined) {
  const v = norm(at ?? "");
  return v.includes("oblig");
}
function isOpcional(at: string | null | undefined) {
  const v = norm(at ?? "");
  return v.includes("adicional") || v.includes("opcion");
}

function safeNum(n: any) {
  return typeof n === "number" && !Number.isNaN(n) ? n : null;
}

/** Un icono único por ámbito (y un fallback si aparece alguno nuevo) */
const AMBITO_CATALOG: Array<{
  match: (scopeKey: string) => boolean;
  titleFallback: string;
  description: string;
  icon: any;
  accent: string;
  gradient: string; // para el header de la card
}> = [
  {
    match: (k) => k === "ambiental" || k.includes("medio ambiente"),
    titleFallback: "Ambiental",
    description: "Conservación, recursos naturales y presiones ambientales.",
    icon: Leaf,
    accent: "#16A34A",
    gradient: "from-emerald-50 to-white",
  },
  {
    match: (k) => k.includes("gobernanza"),
    titleFallback: "Gobernanza",
    description: "Trazabilidad: fuentes, organismo, método y comentarios.",
    icon: Landmark,
    accent: "#7F1D1D",
    gradient: "from-rose-50 to-white",
  },
  {
    match: (k) => k.includes("estacionalidad"),
    titleFallback: "Estacionalidad turística",
    description:
      "Distribución temporal, nacionales vs extranjeros, variaciones.",
    icon: CalendarRange,
    accent: "#0EA5E9",
    gradient: "from-sky-50 to-white",
  },
  {
    match: (k) => k.includes("rendimiento"),
    titleFallback: "Rendimiento turístico",
    description: "Alojamientos: plazas, tipologías, capacidad y estructura.",
    icon: Hotel,
    accent: "#F97316",
    gradient: "from-orange-50 to-white",
  },
  {
    match: (k) =>
      k.includes("satisfacción local") || k.includes("satisfaccion local"),
    titleFallback: "Satisfacción local",
    description: "Percepción local: positiva/negativa, balance y tendencias.",
    icon: Smile,
    accent: "#059669",
    gradient: "from-emerald-50 to-white",
  },
  {
    match: (k) =>
      k.includes("satisfacción turística") ||
      k.includes("satisfaccion turistica") ||
      k.includes("satisfacción turistica"),
    titleFallback: "Satisfacción turística",
    description: "Percepción del turista: positiva/negativa, balance.",
    icon: Sparkles,
    accent: "#2563EB",
    gradient: "from-blue-50 to-white",
  },
  {
    match: (k) => k.includes("beneficios") && k.includes("econ"),
    titleFallback: "Beneficios económicos",
    description: "Impacto económico del turismo y contribución al destino.",
    icon: Euro,
    accent: "#7C3AED",
    gradient: "from-violet-50 to-white",
  },
  {
    match: (k) => k.includes("agua"),
    titleFallback: "Gestión del agua",
    description:
      "Depuración y consumos comparados entre residentes y turistas.",
    icon: Droplets,
    accent: "#0284C7",
    gradient: "from-sky-50 to-white",
  },
  {
    match: (k) => k.includes("residuos"),
    titleFallback: "Gestión de residuos",
    description: "Generación y reciclaje: comparación turistas vs residentes.",
    icon: Recycle,
    accent: "#7C3AED",
    gradient: "from-violet-50 to-white",
  },
  {
    match: (k) =>
      k.includes("accion por el clima") || k.includes("acción por el clima"),
    titleFallback: "Acción por el clima",
    description: "Riesgos, impactos y adaptación climática del destino.",
    icon: CloudSun,
    accent: "#16A34A",
    gradient: "from-emerald-50 to-white",
  },
  {
    match: (k) => k.includes("impacto social") || k.includes("comunitario"),
    titleFallback: "Impacto social / comunitario",
    description: "Presión turística, igualdad, cohesión y accesibilidad.",
    icon: Users,
    accent: "#0F766E",
    gradient: "from-teal-50 to-white",
  },
  {
    match: (k) => k.includes("seguridad") || k.includes("salud"),
    titleFallback: "Seguridad y salud",
    description: "Indicadores de seguridad, salud pública y percepción.",
    icon: Shield,
    accent: "#334155",
    gradient: "from-slate-100 to-white",
  },
  {
    match: (k) => k.includes("transporte"),
    titleFallback: "Impacto del transporte",
    description: "Movilidad de acceso: privado/colectivo y distancias.",
    icon: Bus,
    accent: "#DC2626",
    gradient: "from-rose-50 to-white",
  },
  {
    match: (k) => k.includes("eventos") && k.includes("sostenible"),
    titleFallback: "Eventos sostenibles",
    description: "Promoción y canales de comunicación del turismo sostenible.",
    icon: PartyPopper,
    accent: "#F59E0B",
    gradient: "from-amber-50 to-white",
  },
  {
    match: (k) =>
      k.includes("paisaje") ||
      k.includes("biodiversidad") ||
      k.includes("protección"),
    titleFallback: "Paisaje y biodiversidad",
    description: "Protección del entorno, valores naturales y conservación.",
    icon: Trees,
    accent: "#15803D",
    gradient: "from-green-50 to-white",
  },
  {
    match: (k) =>
      k.includes("educación") ||
      k.includes("formación") ||
      k.includes("sensibil"),
    titleFallback: "Educación y formación",
    description: "Conciencia turística y formación en sostenibilidad.",
    icon: GraduationCap,
    accent: "#2563EB",
    gradient: "from-blue-50 to-white",
  },
  {
    match: (k) => k.includes("accesibilidad"),
    titleFallback: "Accesibilidad",
    description: "Acceso universal: infraestructuras, servicios y experiencia.",
    icon: Accessibility,
    accent: "#0EA5E9",
    gradient: "from-sky-50 to-white",
  },
  {
    match: (k) => k.includes("energ"),
    titleFallback: "Gestión energética",
    description: "Consumo, eficiencia y transición energética del destino.",
    icon: Bolt,
    accent: "#F97316",
    gradient: "from-orange-50 to-white",
  },
  {
    match: (k) => k.includes("suministros") || k.includes("cadena"),
    titleFallback: "Cadena de suministros",
    description: "Compras, proveedores y criterios de sostenibilidad.",
    icon: PackageSearch,
    accent: "#64748B",
    gradient: "from-slate-100 to-white",
  },
];

function metaFor(scopeName: string) {
  const key = norm(scopeName);
  const m = AMBITO_CATALOG.find((x) => x.match(key));
  return (
    m ?? {
      match: () => true,
      titleFallback: scopeName,
      description: "Indicadores del ámbito y trazabilidad de datos.",
      icon: BarChart3,
      accent: "#64748B",
      gradient: "from-slate-100 to-white",
    }
  );
}

function seguimiento(rows: IndicatorRow[]) {
  const oblig = rows.filter((r) => isObligatorio(r.at)).length;
  const opc = rows.filter((r) => isOpcional(r.at)).length;

  if (oblig > 0 && opc === 0)
    return {
      label: "Obligatorio",
      tone: "emerald" as const,
      oblig,
      opc,
      weight: 0,
    };
  if (opc > 0 && oblig === 0)
    return {
      label: "Adicional",
      tone: "amber" as const,
      oblig,
      opc,
      weight: 2,
    };
  if (opc > 0 && oblig > 0)
    return { label: "Mixto", tone: "slate" as const, oblig, opc, weight: 1 };
  return {
    label: "Sin clasificar",
    tone: "slate" as const,
    oblig,
    opc,
    weight: 3,
  };
}

function coverageStats(rows: IndicatorRow[]) {
  const total = rows.length;
  const withValue = rows.filter((r) => safeNum(r.value) != null).length;
  const missing = total - withValue;
  const coverage = total > 0 ? (withValue / total) * 100 : 0;
  return { total, withValue, missing, coverage };
}

export default function AmbitoPageClient({ data }: AmbitoPageClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const decodedScopeId = (searchParams.get("scopeId") ?? "").trim();
  const yearParam = searchParams.get("year");

  // listado si no hay scopeId
  const [query, setQuery] = useState("");

  /** Listado de ámbitos agrupado por scopeId */
  const scopes = useMemo(() => {
    const map = new Map<
      string,
      { scopeId: string; scopeName: string; rows: IndicatorRow[] }
    >();

    for (const row of data.indicators) {
      const sid = (row.scopeId ?? "").trim();
      if (!sid) continue;

      const name = (row.scope ?? "").trim() || `Ámbito ${sid}`;
      const existing = map.get(sid);
      if (!existing)
        map.set(sid, { scopeId: sid, scopeName: name, rows: [row] });
      else existing.rows.push(row);
    }

    return Array.from(map.values());
  }, [data.indicators]);

  const filteredScopes = useMemo(() => {
    const q = norm(query);

    const arr = scopes
      .map((s) => {
        const meta = metaFor(s.scopeName);
        const seg = seguimiento(s.rows);
        const stats = coverageStats(s.rows);
        return { ...s, meta, seg, stats };
      })
      .filter((s) => {
        if (!q) return true;
        const hay = norm(
          [s.scopeName, s.meta.description, s.seg.label]
            .filter(Boolean)
            .join(" · "),
        );
        return hay.includes(q);
      })
      .sort((a, b) => {
        if (a.seg.weight !== b.seg.weight) return a.seg.weight - b.seg.weight;
        if (b.stats.coverage !== a.stats.coverage)
          return b.stats.coverage - a.stats.coverage;
        return a.scopeName.localeCompare(b.scopeName, "es");
      });

    return arr;
  }, [scopes, query]);

  const globalStats = useMemo(() => {
    const all = data.indicators;
    const total = all.length;
    const withValue = all.filter((r) => safeNum(r.value) != null).length;
    const coverage = total > 0 ? (withValue / total) * 100 : 0;
    return { total, withValue, coverage };
  }, [data.indicators]);

  if (!decodedScopeId) {
    const yearParamStr = yearParam ?? "";
    return (
      <div className="mx-auto max-w-6xl px-4 py-10 space-y-8">
        <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-slate-900">Ámbitos</h1>
            <p className="text-sm text-slate-600">
              Accede a cada ámbito para consultar indicadores, fuentes y paneles
              específicos.
            </p>

            <div className="mt-2 flex flex-wrap gap-3 text-xs">
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                <BarChart3 className="h-4 w-4" />
                {globalStats.total} indicadores
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                {globalStats.withValue} con dato
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-sky-700">
                <Sparkles className="h-4 w-4" />
                Cobertura {globalStats.coverage.toFixed(0)}%
              </span>
            </div>
          </div>

          <div className="w-full md:w-[360px]">
            <label className="mb-1 block text-xs font-medium text-slate-500">
              Buscar ámbito
            </label>
            <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm focus-within:ring-2 focus-within:ring-slate-200">
              <Search className="h-4 w-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Gobernanza, agua, residuos…"
                className="w-full bg-transparent text-sm text-slate-700 outline-none"
              />
            </div>
          </div>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredScopes.map((s) => (
            <ScopeCard
              key={s.scopeId}
              yearParam={yearParamStr}
              scopeId={s.scopeId}
              scopeName={s.scopeName}
              description={s.meta.description}
              Icon={s.meta.icon}
              accent={s.meta.accent}
              gradient={s.meta.gradient}
              segLabel={s.seg.label}
              segTone={s.seg.tone}
              oblig={s.seg.oblig}
              opc={s.seg.opc}
              total={s.stats.total}
              withValue={s.stats.withValue}
              missing={s.stats.missing}
              coverage={s.stats.coverage}
            />
          ))}

          {filteredScopes.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 sm:col-span-2 lg:col-span-3">
              No hay ámbitos que coincidan con la búsqueda.
            </div>
          )}
        </section>
      </div>
    );
  }

  // ✅ datos COMPLETOS del ámbito (sin filtrar por año)
  const scopeAll = useMemo(
    () =>
      data.indicators.filter(
        (d) => (d.scopeId ?? "").trim() === decodedScopeId,
      ),
    [data.indicators, decodedScopeId],
  );

  if (scopeAll.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-2">
        <h1 className="text-2xl font-semibold">
          No se han encontrado datos para el ámbito con id:
        </h1>
        <p className="text-lg font-medium text-slate-700">“{decodedScopeId}”</p>
        <p className="text-sm text-slate-500">
          Vuelve al listado en{" "}
          <Link href="/ambito" className="underline">
            /ambito
          </Link>
          .
        </p>
      </div>
    );
  }

  // años disponibles (para validar el yearParam)
  const yearsForScope = useMemo<number[]>(
    () =>
      Array.from(
        new Set(
          scopeAll
            .map((d) => d.year)
            .filter(
              (y): y is number => typeof y === "number" && !Number.isNaN(y),
            ),
        ),
      ).sort((a, b) => a - b),
    [scopeAll],
  );

  const parsedYear = yearParam ? Number(yearParam) : null;
  const hasSelectedYear = Number.isFinite(parsedYear as number);

  const effectiveYear = useMemo<number | null>(() => {
    if (!yearsForScope.length) return null;
    if (hasSelectedYear && yearsForScope.includes(parsedYear as number)) {
      return parsedYear as number;
    }
    return yearsForScope[yearsForScope.length - 1] ?? null;
  }, [yearsForScope, hasSelectedYear, parsedYear]);

  const scopeName = scopeAll[0]?.scope ?? `Ámbito ${decodedScopeId}`;
  const scopeKey = norm(scopeName);

  // 🔀 Dashboards específicos (PASANDO scopeAll + initialYear)
  if (scopeKey === "ambiental" || scopeKey === "medio ambiente") {
    return (
      <AmbientalDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeAll}
        initialYear={effectiveYear}
      />
    );
  }

  if (scopeKey.includes("gobernanza")) {
    return (
      <GobernanzaDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeAll}
        initialYear={effectiveYear}
      />
    );
  }

  if (scopeKey.includes("estacionalidad")) {
    return (
      <EstacionalidadDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        indicators={scopeAll}
        tourists={data.tourists}
        initialYear={effectiveYear}
      />
    );
  }

  if (scopeKey.includes("rendimiento")) {
    return (
      <RendimientoDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        indicators={scopeAll}
        lodgings={data.lodgings}
        initialYear={effectiveYear}
      />
    );
  }

  if (
    scopeKey.includes("satisfacción local") ||
    scopeKey.includes("satisfaccion local")
  ) {
    return (
      <SatisfaccionLocalDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeAll}
        initialYear={effectiveYear}
      />
    );
  }

  if (
    scopeKey.includes("satisfacción turística") ||
    scopeKey.includes("satisfaccion turistica") ||
    scopeKey.includes("satisfacción turistica")
  ) {
    return (
      <SatisfaccionTuristicaDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeAll}
        initialYear={effectiveYear}
      />
    );
  }

  if (scopeKey.includes("beneficios") && scopeKey.includes("econ")) {
    return (
      <BeneficiosEconomicosDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeAll}
        initialYear={effectiveYear}
      />
    );
  }

  if (scopeKey.includes("agua")) {
    return (
      <GestionAguasDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeAll}
        initialYear={effectiveYear}
      />
    );
  }

  if (scopeKey.includes("residuos")) {
    return (
      <GestionResiduosDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeAll}
        initialYear={effectiveYear}
      />
    );
  }

  if (
    scopeKey.includes("accion por el clima") ||
    scopeKey.includes("acción por el clima")
  ) {
    return (
      <AccionClimaDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeAll}
        initialYear={effectiveYear}
      />
    );
  }

  if (scopeKey.includes("impacto social") || scopeKey.includes("comunitario")) {
    return (
      <ImpactoSocialDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeAll}
        initialYear={effectiveYear}
      />
    );
  }

  if (scopeKey.includes("seguridad") || scopeKey.includes("salud")) {
    return (
      <SeguridadSaludDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeAll}
        initialYear={effectiveYear}
      />
    );
  }

  if (scopeKey.includes("transporte")) {
    return (
      <ReduccionImpactoTransporteDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeAll}
        initialYear={effectiveYear}
      />
    );
  }

  if (scopeKey.includes("eventos") && scopeKey.includes("sostenible")) {
    return (
      <EventosSosteniblesDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeAll}
        initialYear={effectiveYear}
      />
    );
  }

  if (
    scopeKey.includes("paisaje") ||
    scopeKey.includes("biodiversidad") ||
    scopeKey.includes("protección")
  ) {
    return (
      <ProteccionPaisajeBiodiversidadDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeAll}
        initialYear={effectiveYear}
      />
    );
  }

  if (
    scopeKey.includes("educación") ||
    scopeKey.includes("formación") ||
    scopeKey.includes("sensibil")
  ) {
    return (
      <EducacionFormacionSostenibleDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeAll}
        initialYear={effectiveYear}
      />
    );
  }

  if (scopeKey.includes("accesibilidad")) {
    return (
      <AccesibilidadDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeAll}
        initialYear={effectiveYear}
      />
    );
  }

  if (scopeKey.includes("energ")) {
    return (
      <GestionEnergeticaDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeAll}
        initialYear={effectiveYear}
      />
    );
  }

  if (scopeKey.includes("suministros") || scopeKey.includes("cadena")) {
    return (
      <CadenaSuministrosDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeAll}
        initialYear={effectiveYear}
      />
    );
  }

  // Resto → genérico
  return (
    <AmbitoDashboard
      scopeId={decodedScopeId}
      scopeName={scopeName}
      data={scopeAll}
      initialYear={effectiveYear}
    />
  );
}

/* =========================
   UI: ScopeCard
========================= */

function SegChip({
  label,
  tone,
  oblig,
  opc,
}: {
  label: string;
  tone: "emerald" | "amber" | "slate";
  oblig: number;
  opc: number;
}) {
  const cls =
    tone === "emerald"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "amber"
        ? "bg-amber-50 text-amber-700"
        : "bg-slate-100 text-slate-700";

  const suffix = label === "Mixto" ? ` (${oblig} oblig. · ${opc} opc.)` : "";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-1 text-[10px] font-semibold ${cls}`}
    >
      {label}
      {suffix}
    </span>
  );
}

function ScopeCard(props: {
  scopeId: string;
  yearParam: string;
  scopeName: string;
  description: string;
  Icon: any;
  accent: string;
  gradient: string;

  segLabel: string;
  segTone: "emerald" | "amber" | "slate";
  oblig: number;
  opc: number;

  total: number;
  withValue: number;
  missing: number;
  coverage: number;
}) {
  const {
    scopeId,
    scopeName,
    yearParam,
    description,
    Icon,
    accent,
    gradient,
    segLabel,
    segTone,
    oblig,
    opc,
    total,
    withValue,
    missing,
    coverage,
  } = props;

  const cov = Number.isFinite(coverage)
    ? Math.max(0, Math.min(100, coverage))
    : 0;

  return (
    <Link
      href={`/ambito?scopeId=${encodeURIComponent(scopeId)}${yearParam ? `&year=${encodeURIComponent(yearParam)}` : ""}`}
      className="group rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-slate-200"
    >
      <div className={`rounded-t-2xl bg-gradient-to-b ${gradient} p-5`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-sm"
                style={{ backgroundColor: accent }}
              >
                <Icon className="h-5 w-5" />
              </span>
              <div className="min-w-0">
                <div className="text-sm font-semibold text-slate-900 line-clamp-2">
                  {scopeName}
                </div>
                <div className="mt-0.5 text-xs text-slate-500">
                  ID: {scopeId}
                </div>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-600 line-clamp-3">
              {description}
            </p>
          </div>

          <SegChip label={segLabel} tone={segTone} oblig={oblig} opc={opc} />
        </div>
      </div>

      <div className="p-5 pt-4">
        <div className="grid grid-cols-3 gap-3">
          <MiniKpi label="Indicadores" value={String(total)} />
          <MiniKpi label="Con dato" value={String(withValue)} good />
          <MiniKpi label="Pendientes" value={String(missing)} warn />
        </div>

        <div className="mt-4">
          <div className="flex items-center justify-between text-[11px] text-slate-500">
            <span className="font-medium uppercase tracking-wide">
              Cobertura
            </span>
            <span className="font-semibold text-slate-800">
              {cov.toFixed(0)}%
            </span>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full transition"
              style={{ width: `${cov}%`, backgroundColor: accent }}
            />
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-slate-500">
            {cov >= 70 ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                Buena cobertura de datos
              </>
            ) : cov >= 35 ? (
              <>
                <AlertTriangle className="h-4 w-4 text-amber-600" />
                Cobertura media (hay margen)
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-rose-600" />
                Cobertura baja (faltan datos)
              </>
            )}
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between text-xs font-medium">
          <span className="text-slate-500">Abrir dashboard</span>
          <span className="inline-flex items-center gap-1 text-slate-800 group-hover:text-slate-900">
            Entrar <ArrowRight className="h-4 w-4" />
          </span>
        </div>
      </div>
    </Link>
  );
}

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

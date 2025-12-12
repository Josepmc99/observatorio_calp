"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import type { DashboardData } from "@/lib/loadExcelData";
import AmbitoDashboard from "@/components/AmbitoDashboard";

// Dashboards específicos por ámbito
import AmbientalDashboard from "@/components/ambito/AmbientalDashboard";
import GobernanzaDashboard from "@/components/ambito/GobernanzaDashboard";
import EstacionalidadDashboard from "@/components/ambito/EstacionalidadDashboard";
import RendimientoDashboard from "@/components/ambito/RendimientoDashboard";
import SatisfaccionLocalDashboard from "@/components/ambito/SatisfaccionLocalDashboard";
import SatisfaccionTuristicaDashboard from "@/components/ambito/SatisfaccionTuristicaDashboard";

type AmbitoPageClientProps = {
  data: DashboardData;
};

function norm(s: string) {
  return s.trim().toLowerCase();
}

export default function AmbitoPageClient({ data }: AmbitoPageClientProps) {
  const searchParams = useSearchParams();
  const decodedScopeId = (searchParams.get("scopeId") ?? "").trim();

  const scopeIndicators = useMemo(
    () =>
      data.indicators.filter(
        (d) => (d.scopeId ?? "").trim() === decodedScopeId
      ),
    [data.indicators, decodedScopeId]
  );

  if (!decodedScopeId) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-2">
        <h1 className="text-2xl font-semibold">
          Falta el id de ámbito en la URL.
        </h1>
        <p className="text-sm text-slate-500">
          Usa una URL tipo <code>/ambito?scopeId=1</code> o navega desde la
          página principal.
        </p>
      </div>
    );
  }

  if (scopeIndicators.length === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-10 space-y-2">
        <h1 className="text-2xl font-semibold">
          No se han encontrado datos para el ámbito con id:
        </h1>
        <p className="text-lg font-medium text-slate-700">“{decodedScopeId}”</p>
      </div>
    );
  }

  const scopeName = scopeIndicators[0].scope ?? `Ámbito ${decodedScopeId}`;
  const scopeKey = norm(scopeName);

  // 🔀 Dashboards específicos

  if (scopeKey === "ambiental" || scopeKey === "medio ambiente") {
    return (
      <AmbientalDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeIndicators}
      />
    );
  }

  if (scopeKey === "gobernanza" || scopeKey.includes("gobernanza")) {
    return (
      <GobernanzaDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeIndicators}
      />
    );
  }

  // ✅ Estacionalidad turística: añade turistas
  if (scopeKey.includes("estacionalidad")) {
    return (
      <EstacionalidadDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        indicators={scopeIndicators}
        tourists={data.tourists}
      />
    );
  }

  // ✅ Rendimiento empresarial turístico: añade alojamientos
  if (scopeKey.includes("rendimiento")) {
    return (
      <RendimientoDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        indicators={scopeIndicators}
        lodgings={data.lodgings}
      />
    );
  }

  // ✅ Satisfacción local
  if (scopeKey === "satisfacción local" || scopeKey === "satisfaccion local") {
    return (
      <SatisfaccionLocalDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeIndicators}
      />
    );
  }

  // ✅ Satisfacción turística
  if (
    scopeKey === "satisfacción turística" ||
    scopeKey === "satisfaccion turistica" ||
    scopeKey === "satisfacción turistica"
  ) {
    return (
      <SatisfaccionTuristicaDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeIndicators}
      />
    );
  }

  // Resto de ámbitos → dashboard genérico
  return (
    <AmbitoDashboard
      scopeId={decodedScopeId}
      scopeName={scopeName}
      data={scopeIndicators}
    />
  );
}

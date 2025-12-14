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

  // ✅ Beneficio económico
  if (scopeKey.includes("beneficios") && scopeKey.includes("econ")) {
    return (
      <BeneficiosEconomicosDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeIndicators}
      />
    );
  }

  // ✅ Gestión de aguas
  if (scopeKey.includes("agua")) {
    return (
      <GestionAguasDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeIndicators}
      />
    );
  }

  // ✅ Gestión de residuos
  if (scopeKey.includes("residuos")) {
    return (
      <GestionResiduosDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeIndicators}
      />
    );
  }

  // ✅ Acción por el clima
  if (
    scopeKey.includes("acción por el clima") ||
    scopeKey.includes("accion por el clima")
  ) {
    return (
      <AccionClimaDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeIndicators}
      />
    );
  }

  // ✅ Impacto social / comunitario
  if (scopeKey.includes("impacto social") || scopeKey.includes("comunitario")) {
    return (
      <ImpactoSocialDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeIndicators}
      />
    );
  }

  // ✅ Seguridad y salud
  if (scopeKey.includes("seguridad") || scopeKey.includes("salud")) {
    return (
      <SeguridadSaludDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeIndicators}
      />
    );
  }

  // ✅ Reducción del impacto del transporte
  if (scopeKey.includes("transporte") || scopeKey.includes("impacto")) {
    return (
      <ReduccionImpactoTransporteDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeIndicators}
      />
    );
  }

  // ✅ Eventos sostenibles
  if (scopeKey.includes("Eventos") || scopeKey.includes("sostenibles")) {
    return (
      <EventosSosteniblesDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeIndicators}
      />
    );
  }

  // ✅ Protección del paisaje y la biodiversidad
  if (
    scopeKey.includes("Protección") ||
    scopeKey.includes("paisaje") ||
    scopeKey.includes("biodiversidad")
  ) {
    return (
      <ProteccionPaisajeBiodiversidadDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeIndicators}
      />
    );
  }

  // ✅ Educación, formación y sensibilización para el turismo sostenible
  if (
    scopeKey.includes("Educación") ||
    scopeKey.includes("formación") ||
    scopeKey.includes("sostenible")
  ) {
    return (
      <EducacionFormacionSostenibleDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeIndicators}
      />
    );
  }

  // ✅ Accesibilidad
  if (scopeKey.includes("Accesibiliad") || scopeKey.includes("accesibilidad")) {
    return (
      <AccesibilidadDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeIndicators}
      />
    );
  }

  // ✅ Gestión energética
  if (scopeKey.includes("Gestión") || scopeKey.includes("energética")) {
    return (
      <GestionEnergeticaDashboard
        scopeId={decodedScopeId}
        scopeName={scopeName}
        data={scopeIndicators}
      />
    );
  }

  //  ✅ Cadena de suministros
  if (scopeKey.includes("Cadena") || scopeKey.includes("suministros")) {
    return (
      <CadenaSuministrosDashboard
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

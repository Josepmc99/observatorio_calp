"use client";

import type { IndicatorRow } from "@/lib/loadExcelData";
import SatisfaccionDashboard from "@/components/ambito/SatisfaccionDashboard";

type Props = {
  scopeId: string;
  scopeName: string;
  data: IndicatorRow[];
  initialYear?: number | null;
};

export default function SatisfaccionTuristicaDashboard({
  scopeId,
  scopeName,
  data,
  initialYear,
}: Props) {
  return (
    <SatisfaccionDashboard
      scopeId={scopeId}
      scopeName={scopeName}
      data={data}
      initialYear={initialYear}
      breadcrumbLabel="Satisfacción turística"
      intro="Percepción y nivel de satisfacción de los turistas con el destino."
      etisPositive="A.2.1.1"
      etisNegative="A.2.1.2"
      positiveTitle="Satisfacción positiva (ETIS A.2.1.1)"
      negativeTitle="Satisfacción negativa (ETIS A.2.1.2)"
      // (opcional) colores distintos para turistas si quieres diferenciarlos
      // positiveColor="#2563EB" // blue-600
      // negativeColor="#F97316" // orange-500
    />
  );
}

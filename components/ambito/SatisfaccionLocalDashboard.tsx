"use client";

import type { IndicatorRow } from "@/lib/loadExcelData";
import SatisfaccionDashboard from "@/components/ambito/SatisfaccionDashboard";
import { init } from "next/dist/compiled/webpack/webpack";

type Props = {
  scopeId: string;
  scopeName: string;
  data: IndicatorRow[];
  initialYear?: number | null;
};

export default function SatisfaccionLocalDashboard({
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
      breadcrumbLabel="Satisfacción local"
      intro="Percepción y nivel de satisfacción de la población local respecto al destino."
      etisPositive="C.5.1.1"
      etisNegative="C.5.1.2"
      positiveTitle="Satisfacción positiva (ETIS C.5.1.1)"
      negativeTitle="Satisfacción negativa (ETIS C.5.1.2)"
    />
  );
}

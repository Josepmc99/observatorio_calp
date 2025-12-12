"use client";

import type { IndicatorRow } from "@/lib/loadExcelData";
import SatisfaccionDashboard from "@/components/ambito/SatisfaccionDashboard";

type Props = {
  scopeId: string;
  scopeName: string;
  data: IndicatorRow[];
};

export default function SatisfaccionLocalDashboard({
  scopeId,
  scopeName,
  data,
}: Props) {
  return (
    <SatisfaccionDashboard
      scopeId={scopeId}
      scopeName={scopeName}
      data={data}
      breadcrumbLabel="Satisfacción local"
      intro="Percepción y nivel de satisfacción de la población local respecto al destino."
      etisPositive="C.5.1.1"
      etisNegative="C.5.1.2"
      positiveTitle="Satisfacción positiva (ETIS C.5.1.1)"
      negativeTitle="Satisfacción negativa (ETIS C.5.1.2)"
    />
  );
}

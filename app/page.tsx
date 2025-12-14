import { loadDashboardData } from "@/lib/loadExcelData";
import type { IndicatorRow } from "@/lib/loadExcelData";
import HomeClient from "@/components/HomeClient";

export const revalidate = 0;

type ScopeStats = {
  scopeId: string;
  scopeName: string;
  total: number;
  withValue: number;
  missing: number;
  coverage: number;
  oblig: number;
  opc: number;
  segLabel: "Obligatorio" | "Opcional" | "Mixto" | "Sin clasificar";
  segTone: "emerald" | "amber" | "slate";
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
  return v.includes("adicional") || v.includes("opcion");
}
function segFromCounts(oblig: number, opc: number) {
  if (oblig > 0 && opc === 0)
    return { segLabel: "Obligatorio" as const, segTone: "emerald" as const };
  if (opc > 0 && oblig === 0)
    return { segLabel: "Opcional" as const, segTone: "amber" as const };
  if (opc > 0 && oblig > 0)
    return { segLabel: "Mixto" as const, segTone: "slate" as const };
  return { segLabel: "Sin clasificar" as const, segTone: "slate" as const };
}

export default async function HomePage() {
  const { indicators } = await loadDashboardData();

  const statsByScope: ScopeStats[] = (() => {
    const map = new Map<
      string,
      { scopeId: string; scopeName: string; rows: IndicatorRow[] }
    >();

    for (const row of indicators) {
      if (!row.scopeId || !row.scope) continue;
      const id = row.scopeId.trim();
      const name = row.scope.trim();
      if (!id) continue;

      if (!map.has(id)) map.set(id, { scopeId: id, scopeName: name, rows: [] });
      map.get(id)!.rows.push(row);
    }

    return Array.from(map.values()).map(({ scopeId, scopeName, rows }) => {
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
  })();

  // Orden: obligatorio primero, luego más cobertura, luego alfabético
  statsByScope.sort((a, b) => {
    const weight = (x: ScopeStats) =>
      x.segLabel === "Obligatorio"
        ? 0
        : x.segLabel === "Mixto"
        ? 1
        : x.segLabel === "Opcional"
        ? 2
        : 3;

    const wa = weight(a);
    const wb = weight(b);
    if (wa !== wb) return wa - wb;

    if (b.coverage !== a.coverage) return b.coverage - a.coverage;

    return a.scopeName.localeCompare(b.scopeName, "es");
  });

  const global = (() => {
    const total = indicators.length;
    const withValue = indicators.filter((r) => safeHasValue(r.value)).length;
    const coverage = total > 0 ? (withValue / total) * 100 : 0;
    return { total, withValue, coverage };
  })();

  return <HomeClient statsByScope={statsByScope} global={global} />;
}

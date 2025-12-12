import Link from "next/link";
import { loadDashboardData } from "@/lib/loadExcelData";
import {
  Landmark,
  Leaf,
  Users,
  BarChart3,
  Building2,
  Globe,
} from "lucide-react";

export const revalidate = 0;

type ScopeStats = {
  scopeId: string;
  scopeName: string;
  total: number;
  withValue: number;
  coverage: number;
};

export default async function HomePage() {
  const { indicators } = await loadDashboardData();

  // Calcular estadísticas por ámbito
  const statsByScope: ScopeStats[] = (() => {
    const map = new Map<string, Omit<ScopeStats, "coverage">>();

    for (const row of indicators) {
      if (!row.scopeId || !row.scope) continue;
      const id = row.scopeId.trim();
      const name = row.scope.trim();
      if (!id) continue;

      if (!map.has(id)) {
        map.set(id, {
          scopeId: id,
          scopeName: name,
          total: 0,
          withValue: 0,
        });
      }

      const s = map.get(id)!;
      s.total += 1;
      if (row.value != null) s.withValue += 1;
    }

    return Array.from(map.values()).map((s) => ({
      ...s,
      coverage: s.total > 0 ? (s.withValue / s.total) * 100 : 0,
    }));
  })();

  // Paleta granate para las tarjetas
  const scopeColors = ["#7F1D1D", "#9F1239", "#BE123C", "#991B1B", "#7C2D12"];

  // Iconos para cada ámbito
  const ICON_BY_SCOPE: Record<string, any> = {
    Gobernanza: Landmark,
    "Gobernanza y gestión": Landmark,
    Social: Users,
    "Social y cultural": Users,
    Economía: BarChart3,
    Económico: BarChart3,
    Ambiental: Leaf,
    "Medio ambiente": Leaf,
    "Estacionalidad turística": Globe,
    "Rendimiento empresarial turístico": Building2,
    Territorio: Globe,
    Equipamientos: Building2,
  };

  const DefaultIcon = Globe;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      {/* Franja superior con logo + título */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            {/* Logo de ejemplo */}
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#7F1D1D] to-[#9F1239] text-xs font-bold text-white shadow-sm">
              OC
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Observatorio Calp ·{" "}
                <span className="text-[#7F1D1D]">Red INSTO</span>
              </h1>
              <p className="text-xs text-slate-500">
                Monitor de ámbitos e indicadores turísticos sostenibles
              </p>
            </div>
          </div>

          <div className="hidden text-xs text-slate-400 md:block">
            Versión demo · Datos desde Excel
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        {/* Intro */}
        <header className="space-y-2">
          <h2 className="text-lg font-semibold text-slate-800">
            Selecciona un ámbito
          </h2>
          <p className="text-sm text-slate-500">
            Cada tarjeta representa un ámbito de análisis. Al hacer clic,
            accederás a un dashboard específico con sus indicadores.
          </p>
        </header>

        {/* Grid de ámbitos */}
        <section className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {statsByScope.map((s, idx) => {
            const href = `/ambito?scopeId=${encodeURIComponent(s.scopeId)}`;
            const accent = scopeColors[idx % scopeColors.length];

            const Icon =
              ICON_BY_SCOPE[s.scopeName] ??
              ICON_BY_SCOPE[s.scopeName.toLowerCase()] ??
              DefaultIcon;

            return (
              <Link
                key={s.scopeId}
                href={href}
                className="group flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                {/* Icono grande */}
                <div className="flex items-center justify-center">
                  <Icon
                    size={48}
                    className="text-white p-3 rounded-2xl shadow-md"
                    style={{ backgroundColor: accent }}
                  />
                </div>

                {/* Título del ámbito */}
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-slate-900">
                    {s.scopeName}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    {s.total} indicadores
                  </p>
                </div>

                {/* Barra de cobertura */}
                <div className="mt-2">
                  <p className="text-xs text-slate-500 text-center">
                    Cobertura de datos:{" "}
                    <span className="font-semibold text-slate-900">
                      {s.coverage.toFixed(0)}%
                    </span>
                  </p>

                  <div className="mt-2 h-2 w-full rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(s.coverage, 100)}%`,
                        background: `linear-gradient(90deg, ${accent}, #F87171)`,
                      }}
                    />
                  </div>
                </div>

                {/* CTA */}
                <div className="mt-3 text-center text-sm font-medium text-[#7F1D1D] group-hover:text-[#9F1239]">
                  Ver indicadores →
                </div>
              </Link>
            );
          })}
        </section>
      </div>
    </main>
  );
}

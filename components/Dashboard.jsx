"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";

function kpiNumber(value) {
  if (value == null || Number.isNaN(value)) return "—";
  return value.toLocaleString("es-ES", {
    maximumFractionDigits: 1,
  });
}

// Paleta base para ámbitos
const SCOPE_COLORS = [
  { bg: "bg-blue-500", ring: "ring-blue-200", hex: "#3b82f6" },
  { bg: "bg-emerald-500", ring: "ring-emerald-200", hex: "#10b981" },
  { bg: "bg-purple-500", ring: "ring-purple-200", hex: "#a855f7" },
  { bg: "bg-amber-500", ring: "ring-amber-200", hex: "#f59e0b" },
  { bg: "bg-slate-600", ring: "ring-slate-200", hex: "#475569" },
];

export default function Dashboard({ data }) {
  const years = useMemo(
    () =>
      Array.from(
        new Set(
          data
            .map((d) => d.year)
            .filter((y) => y !== null && y !== undefined && y !== "")
        )
      ).sort(),
    [data]
  );

  const scopes = useMemo(
    () =>
      Array.from(
        new Set(
          data
            .map((d) => d.scope)
            .filter((s) => s !== null && s !== undefined && s !== "")
        )
      ),
    [data]
  );

  // Asignamos colores a cada ámbito de forma estable
  const scopeStyle = useMemo(() => {
    const map = {};
    scopes.forEach((s, i) => {
      map[s] = SCOPE_COLORS[i % SCOPE_COLORS.length];
    });
    return map;
  }, [scopes]);

  const [selectedYear, setSelectedYear] = useState(
    years[years.length - 1] ?? null
  );
  const [selectedScope, setSelectedScope] = useState(scopes[0] ?? null);
  const [selectedIndicator, setSelectedIndicator] = useState(null);

  // Filtros base
  const filtered = useMemo(
    () =>
      data.filter(
        (d) =>
          (selectedYear ? d.year === selectedYear : true) &&
          (selectedScope ? d.scope === selectedScope : true)
      ),
    [data, selectedYear, selectedScope]
  );

  // Mismas filas pero sin filtrar por año (para gráficas temporales)
  const filteredScopeAllYears = useMemo(
    () =>
      data.filter((d) => (selectedScope ? d.scope === selectedScope : true)),
    [data, selectedScope]
  );

  // KPIs globales del ámbito + año
  const totalIndicators = filtered.length;
  const indicatorsWithValue = filtered.filter((d) => d.value != null).length;
  const coverage =
    totalIndicators > 0 ? (indicatorsWithValue / totalIndicators) * 100 : null;

  const avgValue =
    indicatorsWithValue > 0
      ? filtered
          .filter((d) => d.value != null)
          .reduce((sum, d) => sum + d.value, 0) / indicatorsWithValue
      : null;

  // Estadísticas por ámbito para pintar las tarjetas-filtro
  const statsByScope = useMemo(() => {
    const map = new Map();
    for (const row of data) {
      if (selectedYear && row.year !== selectedYear) continue;
      if (!row.scope) continue;

      if (!map.has(row.scope)) {
        map.set(row.scope, {
          scope: row.scope,
          total: 0,
          withValue: 0,
        });
      }
      const s = map.get(row.scope);
      s.total += 1;
      if (row.value != null) s.withValue += 1;
    }
    return Array.from(map.values()).map((s) => ({
      ...s,
      coverage: s.total > 0 ? (s.withValue / s.total) * 100 : 0,
    }));
  }, [data, selectedYear]);

  // Gráfico de barras (indicador vs valor) usando año filtrado
  const barData = useMemo(() => {
    const byIndicator = new Map();

    for (const row of filtered) {
      if (!row.indicator) continue;
      if (!byIndicator.has(row.indicator)) {
        byIndicator.set(row.indicator, { indicator: row.indicator, value: 0 });
      }
      if (typeof row.value === "number") {
        byIndicator.get(row.indicator).value += row.value;
      }
    }

    return Array.from(byIndicator.values()).sort(
      (a, b) => (b.value ?? 0) - (a.value ?? 0)
    );
  }, [filtered]);

  // Indicador activo
  const activeIndicator = useMemo(() => {
    if (selectedIndicator) {
      return (
        filtered.find((d) => d.indicator === selectedIndicator) ??
        filteredScopeAllYears.find((d) => d.indicator === selectedIndicator) ??
        null
      );
    }
    return filtered[0] ?? filteredScopeAllYears[0] ?? null;
  }, [filtered, filteredScopeAllYears, selectedIndicator]);

  // Evolución temporal del indicador activo (línea)
  const timeSeries = useMemo(() => {
    if (!activeIndicator || !activeIndicator.indicator) return [];
    const rows = filteredScopeAllYears
      .filter((d) => d.indicator === activeIndicator.indicator)
      .filter((d) => d.year != null)
      .sort((a, b) => a.year - b.year);

    const byYear = new Map();
    for (const r of rows) {
      if (!byYear.has(r.year)) {
        byYear.set(r.year, { year: r.year, value: 0, count: 0 });
      }
      const y = byYear.get(r.year);
      if (typeof r.value === "number") {
        y.value += r.value;
        y.count += 1;
      }
    }
    return Array.from(byYear.values()).map((r) => ({
      year: r.year,
      value: r.count > 0 ? r.value / r.count : null,
    }));
  }, [activeIndicator, filteredScopeAllYears]);

  // Tabla comparativa (indicadores del ámbito + año)
  const tableRows = useMemo(
    () =>
      filtered
        .filter((d) => d.indicator)
        .sort((a, b) =>
          (a.indicator || "").localeCompare(b.indicator || "", "es")
        ),
    [filtered]
  );

  const scopeHex =
    (selectedScope && scopeStyle[selectedScope]?.hex) || "#0f172a";

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-3 border-b border-slate-200 pb-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">
            Monitor de Indicadores – Red INSTO
          </h1>
          <p className="text-sm text-slate-500">
            Visualización por ámbito con datos procedentes del Excel
          </p>
        </div>

        <div className="flex gap-3">
          {/* Selector de año */}
          <div className="flex flex-col text-sm">
            <label className="mb-1 text-slate-500">Año</label>
            <select
              value={selectedYear ?? ""}
              onChange={(e) =>
                setSelectedYear(
                  e.target.value === "" ? null : Number(e.target.value)
                )
              }
              className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm"
            >
              <option value="">Todos</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      {/* Tarjetas de ÁMBITO como filtro bonito */}
      <section className="grid gap-3 md:grid-cols-4">
        {statsByScope.map((s, idx) => {
          const style =
            scopeStyle[s.scope] || SCOPE_COLORS[idx % SCOPE_COLORS.length];
          const isActive = s.scope === selectedScope;
          return (
            <button
              key={s.scope}
              onClick={() => {
                setSelectedScope(s.scope);
                setSelectedIndicator(null);
              }}
              className={`group flex flex-col justify-between rounded-2xl border bg-white p-3 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
                isActive
                  ? `border-transparent ring-2 ${style.ring}`
                  : "border-slate-200"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  {s.scope}
                </span>
                <span
                  className={`h-6 w-6 rounded-full text-xs font-semibold text-white flex items-center justify-center ${style.bg}`}
                >
                  {s.total}
                </span>
              </div>
              <div className="mt-2 text-xs text-slate-500">
                Cobertura:{" "}
                <span className="font-medium text-slate-900">
                  {s.coverage.toFixed(0)}%
                </span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.min(s.coverage, 100)}%`,
                    background: `linear-gradient(90deg, ${scopeHex}, #e5e7eb)`,
                  }}
                />
              </div>
            </button>
          );
        })}
      </section>

      {/* KPIs + radial coverage */}
      <section className="grid gap-4 md:grid-cols-4">
        <KpiCard
          title="Indicadores en este ámbito"
          value={kpiNumber(totalIndicators)}
          subtitle="Filtrados por año y ámbito"
        />
        <KpiCard
          title="Indicadores con dato"
          value={kpiNumber(indicatorsWithValue)}
          subtitle="Registros con valor informado"
        />
        <KpiCard
          title="Valor medio"
          value={kpiNumber(avgValue)}
          subtitle="Media simple de la columna Valor"
        />
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Cobertura de datos
          </h2>
          {coverage == null ? (
            <p className="text-sm text-slate-500">
              No hay indicadores en este filtro.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={140}>
              <RadialBarChart
                cx="50%"
                cy="50%"
                innerRadius="60%"
                outerRadius="100%"
                barSize={10}
                data={[
                  {
                    name: "Cobertura",
                    value: coverage,
                    fill: scopeHex,
                  },
                ]}
                startAngle={180}
                endAngle={0}
              >
                <RadialBar
                  minAngle={15}
                  background
                  clockWise
                  dataKey="value"
                  cornerRadius={999}
                />
                <Legend
                  iconSize={10}
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                />
              </RadialBarChart>
            </ResponsiveContainer>
          )}
          <div className="mt-1 text-xs text-slate-500">
            {coverage == null
              ? "—"
              : `${coverage.toFixed(0)} % de indicadores con valor`}
          </div>
        </div>
      </section>

      {/* Zona central: barras + evolución temporal */}
      <section className="grid gap-6 md:grid-cols-3">
        {/* Barras por indicador (año actual) */}
        <div className="md:col-span-2 rounded-2xl bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              Indicadores por valor ({selectedYear ?? "todos los años"})
            </h2>
            <p className="text-xs text-slate-400">
              Haz clic en una barra para ver el detalle y su evolución
            </p>
          </div>
          {barData.length === 0 ? (
            <p className="text-sm text-slate-500">
              No hay datos para el filtro seleccionado.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <BarChart
                data={barData}
                layout="vertical"
                margin={{ top: 8, right: 16, left: 40, bottom: 8 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  horizontal={false}
                  stroke="#e2e8f0"
                />
                <XAxis type="number" />
                <YAxis
                  dataKey="indicator"
                  type="category"
                  width={200}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip
                  formatter={(v) =>
                    typeof v === "number"
                      ? v.toLocaleString("es-ES", {
                          maximumFractionDigits: 2,
                        })
                      : v
                  }
                />
                <Bar
                  dataKey="value"
                  radius={[4, 4, 4, 4]}
                  onClick={(entry) => setSelectedIndicator(entry.indicator)}
                  fill={scopeHex}
                />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Evolución temporal del indicador seleccionado */}
        <div className="rounded-2xl bg-white p-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-700">
            Evolución del indicador seleccionado
          </h2>
          {!activeIndicator || timeSeries.length === 0 ? (
            <p className="text-sm text-slate-500">
              Selecciona un indicador o no hay datos temporales suficientes.
            </p>
          ) : (
            <>
              <p className="mb-1 text-xs text-slate-500">
                {activeIndicator.indicator}
              </p>
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={timeSeries}
                  margin={{ top: 8, right: 8, left: 0, bottom: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis
                    dataKey="year"
                    tick={{ fontSize: 11 }}
                    allowDecimals={false}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    formatter={(v) =>
                      typeof v === "number"
                        ? v.toLocaleString("es-ES", {
                            maximumFractionDigits: 2,
                          })
                        : v
                    }
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke={scopeHex}
                    strokeWidth={2}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </>
          )}
        </div>
      </section>

      {/* Parte inferior: ficha del indicador + tabla comparativa */}
      <section className="grid gap-6 lg:grid-cols-3">
        {/* Ficha de detalle */}
        <div className="rounded-2xl bg-white p-4 shadow-sm lg:col-span-1">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Ficha de indicador
          </h2>
          {!activeIndicator ? (
            <p className="text-sm text-slate-500">
              Selecciona un ámbito y un indicador para ver su ficha.
            </p>
          ) : (
            <div className="space-y-2 text-sm">
              <InfoField
                label="Indicador"
                value={activeIndicator.indicator || "—"}
                bold
              />
              <div className="grid grid-cols-2 gap-2">
                <InfoField
                  label="Ámbito"
                  value={activeIndicator.scope || "—"}
                />
                <InfoField
                  label="Año"
                  value={
                    activeIndicator.year != null
                      ? String(activeIndicator.year)
                      : "—"
                  }
                />
                <InfoField
                  label="Valor"
                  value={
                    activeIndicator.value != null
                      ? activeIndicator.value.toLocaleString("es-ES", {
                          maximumFractionDigits: 2,
                        })
                      : "—"
                  }
                />
                <InfoField label="AT" value={activeIndicator.at || "—"} />
              </div>
              <InfoField
                label="Descripción"
                value={activeIndicator.description || "—"}
                multiline
              />
              <InfoField
                label="Fórmula"
                value={activeIndicator.formula || "—"}
                multiline
              />
              <InfoField
                label="Datos requeridos"
                value={activeIndicator.requiredData || "—"}
                multiline
              />
              <InfoField
                label="Comentarios"
                value={activeIndicator.comments || "—"}
                multiline
              />
            </div>
          )}
        </div>

        {/* Tabla comparativa */}
        <div className="rounded-2xl bg-white p-4 shadow-sm lg:col-span-2 overflow-auto">
          <h2 className="mb-3 text-sm font-semibold text-slate-700">
            Comparativa de indicadores (ámbito y año seleccionados)
          </h2>
          {tableRows.length === 0 ? (
            <p className="text-sm text-slate-500">
              No hay registros para el filtro actual.
            </p>
          ) : (
            <table className="min-w-full text-left text-xs">
              <thead className="border-b border-slate-200 text-[11px] uppercase text-slate-500">
                <tr>
                  <th className="py-2 pr-2">Indicador</th>
                  <th className="py-2 pr-2">AT</th>
                  <th className="py-2 pr-2">Valor</th>
                  <th className="py-2 pr-2">Descripción</th>
                </tr>
              </thead>
              <tbody>
                {tableRows.map((row, idx) => (
                  <tr
                    key={`${row.indicator}-${idx}`}
                    className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                    onClick={() => setSelectedIndicator(row.indicator)}
                  >
                    <td className="py-1.5 pr-2 text-slate-800">
                      {row.indicator}
                    </td>
                    <td className="py-1.5 pr-2 text-slate-500">{row.at}</td>
                    <td className="py-1.5 pr-2 text-slate-800">
                      {row.value != null
                        ? row.value.toLocaleString("es-ES", {
                            maximumFractionDigits: 2,
                          })
                        : "—"}
                    </td>
                    <td className="py-1.5 pr-2 text-slate-500">
                      {row.description}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  );
}

function KpiCard({ title, value, subtitle }) {
  return (
    <article className="flex flex-col justify-between rounded-2xl bg-white p-4 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {title}
      </div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
      {subtitle && (
        <div className="mt-1 text-xs text-slate-500">{subtitle}</div>
      )}
    </article>
  );
}

function InfoField({ label, value, multiline = false, bold = false }) {
  return (
    <div className={multiline ? "mt-1" : ""}>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div
        className={`text-sm text-slate-800 whitespace-pre-wrap ${
          bold ? "font-semibold" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

"use client";

import React, { FC } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import type { IndicatorRow } from "@/lib/loadExcelData";
import { formatValue } from "@/components/AmbitoDashboard";

type TimePoint = {
  year: number;
  value: number | null;
};

type DetailsSectionProps = {
  activeIndicator: IndicatorRow | null;
  timeSeries: TimePoint[];
  scopeName: string;
  tableRows: IndicatorRow[];
  selectedYear: number | null;
  onSelectIndicator: (indicator: string) => void;
};

const DetailsSection: FC<DetailsSectionProps> = ({
  activeIndicator,
  timeSeries,
  scopeName,
  tableRows,
  selectedYear,
  onSelectIndicator,
}) => {
  const scopeColor = "#7F1D1D";

  return (
    <section className="grid gap-6 xl:grid-cols-3">
      {/* SERIE TEMPORAL */}
      <div className="rounded-2xl bg-white p-4 shadow-sm xl:col-span-1">
        <h2 className="mb-2 text-sm font-semibold text-slate-700">
          Evolución temporal
        </h2>

        {!activeIndicator || timeSeries.length === 0 ? (
          <p className="text-sm text-slate-500">
            Selecciona un indicador o no hay datos temporales.
          </p>
        ) : (
          <>
            <p className="mb-1 text-xs text-slate-500">
              {activeIndicator.indicator}
            </p>

            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={timeSeries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 11 }}
                  allowDecimals={false}
                />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip
                  formatter={(v: any) =>
                    typeof v === "number" ? formatValue(v) : v
                  }
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={scopeColor}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </>
        )}
      </div>

      {/* FICHA DEL INDICADOR */}
      <div className="rounded-2xl bg-white p-4 shadow-sm xl:col-span-1">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          Ficha del indicador
        </h2>

        {!activeIndicator ? (
          <p className="text-sm text-slate-500">
            Selecciona un indicador para ver su detalle.
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
                label="Año"
                value={String(activeIndicator.year ?? "—")}
              />
              <InfoField
                label="Unidad"
                value={activeIndicator.unidad || activeIndicator.at || "—"}
              />
              <InfoField
                label="Valor"
                value={formatValue(activeIndicator.value)}
              />
              <InfoField label="Ámbito" value={scopeName} />
            </div>

            <InfoField
              label="Descripción"
              value={activeIndicator.description || "—"}
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

      {/* TABLA */}
      <div className="rounded-2xl bg-white p-4 shadow-sm xl:col-span-1 overflow-auto">
        <h2 className="mb-3 text-sm font-semibold text-slate-700">
          Indicadores ({selectedYear ?? "todos los años"})
        </h2>

        {tableRows.length === 0 ? (
          <p className="text-sm text-slate-500">
            No hay indicadores para este filtro.
          </p>
        ) : (
          <table className="min-w-full text-left text-xs">
            <thead className="border-b border-slate-200 text-[11px] uppercase text-slate-500">
              <tr>
                <th className="py-2 pr-2">Indicador</th>
                <th className="py-2 pr-2">Unidad</th>
                <th className="py-2 pr-2">Año</th>
                <th className="py-2 pr-2">Valor</th>
              </tr>
            </thead>

            <tbody>
              {tableRows.map((row, idx) => (
                <tr
                  key={`${row.indicator}-${row.year}-${idx}`}
                  className="border-b border-slate-100 hover:bg-slate-50 cursor-pointer"
                  onClick={() =>
                    row.indicator && onSelectIndicator(row.indicator)
                  }
                >
                  <td className="py-1.5 pr-2 text-slate-800">
                    {row.indicator}
                  </td>
                  <td className="py-1.5 pr-2 text-slate-500">
                    {row.unidad || row.at || "—"}
                  </td>
                  <td className="py-1.5 pr-2 text-slate-500">
                    {row.year ?? "—"}
                  </td>
                  <td className="py-1.5 pr-2 text-slate-800">
                    {formatValue(row.value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

/* -------- InfoField subcomponente -------- */

type InfoFieldProps = {
  label: string;
  value: string;
  multiline?: boolean;
  bold?: boolean;
};

const InfoField: FC<InfoFieldProps> = ({ label, value, multiline, bold }) => (
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

export default DetailsSection;

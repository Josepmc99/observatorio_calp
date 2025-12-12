"use client";

import React, { FC } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { formatValue } from "@/components/AmbitoDashboard";

type BarDataItem = {
  indicator: string;
  value: number;
};

type ComparisonChartProps = {
  barData: BarDataItem[];
  scopeColor: string;
  selectedYear: number | null;
  onSelectIndicator: (indicator: string) => void;
};

const ComparisonChart: FC<ComparisonChartProps> = ({
  barData,
  scopeColor,
  selectedYear,
  onSelectIndicator,
}) => {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm lg:col-span-2">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700">
          Comparativa de indicadores ({selectedYear ?? "todos los años"})
        </h2>
        <p className="text-xs text-slate-400">
          Haz clic en una barra para ver más detalles
        </p>
      </div>

      {barData.length === 0 ? (
        <p className="text-sm text-slate-500">No hay datos para este filtro.</p>
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
              width={220}
              tick={{ fontSize: 11 }}
            />
            <Tooltip
              formatter={(v: any) =>
                typeof v === "number" ? formatValue(v) : v
              }
            />
            <Bar
              dataKey="value"
              radius={[4, 4, 4, 4]}
              fill={scopeColor}
              onClick={(entry: any) =>
                onSelectIndicator(entry.indicator as string)
              }
            />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

export default ComparisonChart;

"use client";

import React, { FC } from "react";
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  Legend,
} from "recharts";
import { kpiNumber } from "@/components/AmbitoDashboard";

type CoveragePanelProps = {
  coverage: number | null;
  totalIndicators: number;
  indicatorsWithValue: number;
  avgValue: number | null;
  scopeColor: string;
};

const CoveragePanel: FC<CoveragePanelProps> = ({
  coverage,
  totalIndicators,
  indicatorsWithValue,
  avgValue,
  scopeColor,
}) => {
  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm lg:col-span-1">
      <h2 className="mb-2 text-sm font-semibold text-slate-700">
        Cobertura de datos
      </h2>

      {coverage == null ? (
        <p className="text-sm text-slate-500">
          No hay indicadores para este filtro.
        </p>
      ) : (
        <ResponsiveContainer width="100%" height={180}>
          <RadialBarChart
            cx="45%"
            cy="55%"
            innerRadius="60%"
            outerRadius="100%"
            barSize={12}
            data={[{ name: "Cobertura", value: coverage, fill: scopeColor }]}
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

      <div className="mt-2 text-xs text-slate-500 space-y-1">
        <p>
          Cobertura:{" "}
          <span className="font-semibold text-slate-900">
            {coverage == null ? "—" : `${coverage.toFixed(0)}%`}
          </span>
        </p>
        <p>
          Indicadores con valor:{" "}
          <span className="font-semibold text-slate-900">
            {kpiNumber(indicatorsWithValue)}
          </span>{" "}
          de {kpiNumber(totalIndicators)}
        </p>
        <p>
          Valor medio (simple):{" "}
          <span className="font-semibold text-slate-900">
            {kpiNumber(avgValue)}
          </span>
        </p>
      </div>
    </div>
  );
};

export default CoveragePanel;

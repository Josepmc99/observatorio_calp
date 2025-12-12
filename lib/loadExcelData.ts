import "server-only";

import fs from "fs";
import path from "path";
import * as XLSX from "xlsx";

/* ----------------------------------------------------------
   TYPES
---------------------------------------------------------- */

/** Hoja Principal de indicadores */
export type IndicatorRow = {
  year: number | null;
  scopeId: string | null;
  scope: string | null;
  indicator: string | null;
  description: string | null;
  formula: string | null;
  requiredData: string | null;
  at: string | null;
  value: number | null;
  unidad: string | null;
  fuente: string | null;
  organismo: string | null;
  comments: string | null;
  etis: string | null;
};

/** Hoja Turistas */
export type TouristRow = {
  year: number | null;
  month: string | null;
  orden_month: number | null;
  extranjeros: number | null;
  nacional: number | null;
  total: number | null;
  porcentaje_extranjeros: number | null;
  porcentaje_nacional: number | null;
};

/** Hoja Alojamientos */
export type LodgingRow = {
  year: number | null;
  tipo: string | null;
  cantidad: number | null;
  plazas: number | null;
  habitaciones: string | null;
  parcelas: number | null;
  porcentaje_tipo: number | null;
  porcentaje_plazas: number | null;
};

export type DashboardData = {
  indicators: IndicatorRow[];
  tourists: TouristRow[];
  lodgings: LodgingRow[];
};

export async function loadExcelData() {
  return loadDashboardData();
}

/* ----------------------------------------------------------
   HELPERS
---------------------------------------------------------- */

const toStr = (v: any): string | null => {
  if (v == null) return null;
  const s = String(v).trim();
  return s.length ? s : null;
};

const toNum = (v: any): number | null => {
  if (v == null || v === "") return null;
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  const s = String(v).replace(",", ".").trim();
  if (!s) return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
};

function pickSheetName(workbook: XLSX.WorkBook, candidates: string[]) {
  const names = workbook.SheetNames;
  const lower = new Map(names.map((n) => [n.toLowerCase(), n]));
  for (const c of candidates) {
    const hit = lower.get(c.toLowerCase());
    if (hit) return hit;
  }
  return null;
}

/* ----------------------------------------------------------
   LOADER (MULTI-SHEET)
---------------------------------------------------------- */

export async function loadDashboardData(): Promise<DashboardData> {
  const filePath = path.join(process.cwd(), "data", "DB_Dashboard.xlsx");

  const fileBuffer = fs.readFileSync(filePath);
  const workbook = XLSX.read(fileBuffer, { type: "buffer" });

  // ✅ Ajusta aquí los nombres reales de tus hojas si difieren
  const INDICATORS_SHEET =
    pickSheetName(workbook, ["Indicadores", "Base", "Dashboard", "Sheet1"]) ??
    workbook.SheetNames[0];

  const TOURISTS_SHEET =
    pickSheetName(workbook, ["Turistas", "Tourist", "Tabla Turistas"]) ?? null;

  const LODGINGS_SHEET =
    pickSheetName(workbook, [
      "Alojamientos",
      "Lodgings",
      "Tabla Alojamientos",
    ]) ?? null;

  // -------------------- Indicadores --------------------
  const indicatorsRaw = XLSX.utils.sheet_to_json<Record<string, any>>(
    workbook.Sheets[INDICATORS_SHEET],
    { defval: null }
  );

  const indicators: IndicatorRow[] = indicatorsRaw.map((row) => {
    const yearRaw = row["Año"] ?? row["Year"] ?? row["year"];
    const valueRaw = row["Valor"] ?? row["value"];

    return {
      year: toNum(yearRaw),
      scopeId: toStr(row["id"] ?? row["ID"] ?? row["scopeId"]),
      scope: toStr(row["Ámbito"] ?? row["Ambito"] ?? row["scope"]),
      indicator: toStr(row["Indicador"] ?? row["indicator"]),
      description: toStr(
        row["Descripción"] ?? row["Descripcion"] ?? row["description"]
      ),
      formula: toStr(row["Fórmula"] ?? row["Formula"] ?? row["formula"]),
      requiredData: toStr(
        row["Datos requeridos"] ?? row["requiredData"] ?? row["RequiredData"]
      ),
      at: toStr(row["AT"] ?? row["at"]),
      value: toNum(valueRaw),
      unidad: toStr(row["Unidad"] ?? row["unidad"] ?? row["unit"]),
      fuente: toStr(row["Fuente"] ?? row["fuente"] ?? row["source"]),
      organismo: toStr(row["Organismo"] ?? row["organismo"]),
      comments: toStr(
        row["Comentarios"] ?? row["comments"] ?? row["Observaciones"]
      ),
      etis: toStr(row["ETIS"] ?? row["etis"] ?? row["Indicadores"]),
    };
  });

  // -------------------- Turistas --------------------
  const tourists: TouristRow[] = TOURISTS_SHEET
    ? XLSX.utils
        .sheet_to_json<Record<string, any>>(workbook.Sheets[TOURISTS_SHEET], {
          defval: null,
        })
        .map((row) => ({
          year: toNum(row["Año"] ?? row["Year"] ?? row["year"]),
          month: toStr(row["Mes"] ?? row["month"] ?? row["Month"]),
          orden_month: toNum(
            row["orden_month"] ??
              row["Orden meses"] ??
              row["OrdenMes"] ??
              row["orden"]
          ),
          extranjeros: toNum(
            row["1. Turistas extranjeros que visitaron Calp"] ??
              row["extranjeros"] ??
              row["foreign"]
          ),
          nacional: toNum(
            row["1. Turistas nacionales que visitaron Calp"] ??
              row["nacional"] ??
              row["residentes"] ??
              row["resident"]
          ),
          total: toNum(row["1. Total turistas"] ?? row["total"]),
          porcentaje_extranjeros: toNum(
            row["2.% Turistas extranjeros que visitaron Calp"] ??
              row["porcentaje_extranjeros"] ??
              row["pct_foreign"]
          ),
          porcentaje_nacional: toNum(
            row["2. % Turistas nacionales que visitaron Calp"] ??
              row["porcentaje_nacional"] ??
              row["pct_national"]
          ),
        }))
    : [];

  // -------------------- Alojamientos --------------------
  const lodgings: LodgingRow[] = LODGINGS_SHEET
    ? XLSX.utils
        .sheet_to_json<Record<string, any>>(workbook.Sheets[LODGINGS_SHEET], {
          defval: null,
        })
        .map((row) => ({
          year: toNum(row["Año"] ?? row["Year"] ?? row["year"]),
          tipo: toStr(
            row["Tipo"] ?? row["tipo"] ?? row["Categoria"] ?? row["Categoría"]
          ),
          cantidad: toNum(row["Establecimientos"] ?? row["Cantidad"]),
          plazas: toNum(row["Plazas"] ?? row["plazas"]),
          habitaciones: toStr(row["Habitaciones"] ?? row["habitaciones"]),
          parcelas: toNum(row["Parcelas"] ?? row["parcelas"]),
          porcentaje_tipo: toNum(
            row["% alojamientos"] ?? row["porcentaje_tipo"]
          ),
          porcentaje_plazas: toNum(row["% plazas"] ?? row["porcentaje_plazas"]),
        }))
    : [];

  return { indicators, tourists, lodgings };
}

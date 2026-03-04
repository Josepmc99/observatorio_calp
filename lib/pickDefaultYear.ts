// Dado que al añadir un nuevo año a la base de datos, el año más reciente se convierte en el nuevo valor por defecto.
// No obstante, para evitar que se añada un nuevo año que no tenga todavía todos los datos, en este codigo se selecciona un año preferido.

export const PREFERRED_DEFAULT_YEAR = 2024;

export function pickDefaultYear(
  years: Array<number | null | undefined>,
  preferred: number = PREFERRED_DEFAULT_YEAR,
): number | null {
  const clean = Array.from(
    new Set(
      years.filter(
        (y): y is number => typeof y === "number" && Number.isFinite(y),
      ),
    ),
  );

  if (clean.length === 0) return null;
  if (clean.includes(preferred)) return preferred;
  return Math.max(...clean);
}

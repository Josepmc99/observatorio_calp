import { loadDashboardData } from "@/lib/loadExcelData";
import HomeClient from "@/components/HomeClient";
import { pickDefaultYear, PREFERRED_DEFAULT_YEAR } from "@/lib/pickDefaultYear";

export const revalidate = 0;

export default async function HomePage() {
  const { indicators } = await loadDashboardData();

  const years = Array.from(
    new Set(
      indicators
        .map((r) => r.year)
        .filter(
          (y): y is number => typeof y === "number" && Number.isFinite(y),
        ),
    ),
  ).sort((a, b) => b - a);

  const defaultYear = pickDefaultYear(years, PREFERRED_DEFAULT_YEAR);

  return (
    <HomeClient
      indicators={indicators}
      years={years}
      defaultYear={defaultYear}
    />
  );
}

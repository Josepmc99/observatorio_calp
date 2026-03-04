import { loadDashboardData } from "@/lib/loadExcelData";
import AmbitoPageClient from "./AmbitoPageClient";

export const revalidate = 0;

export default async function AmbitoPage({
  searchParams,
}: {
  searchParams?: { scopeId?: string; year?: string };
}) {
  const data = await loadDashboardData();

  const initialYear = searchParams?.year ? Number(searchParams.year) : null;

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <AmbitoPageClient
          data={data}
          initialYear={
            Number.isFinite(initialYear as number) ? initialYear : null
          }
        />
      </div>
    </main>
  );
}

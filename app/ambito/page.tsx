import { loadDashboardData } from "@/lib/loadExcelData";
import AmbitoPageClient from "./AmbitoPageClient";

export const revalidate = 0;

export default async function AmbitoPage() {
  const data = await loadDashboardData();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-8">
        <AmbitoPageClient data={data} />
      </div>
    </main>
  );
}

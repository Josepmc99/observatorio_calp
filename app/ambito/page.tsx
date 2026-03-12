import { loadDashboardData } from "@/lib/loadExcelData";
import AmbitoPageClient from "./AmbitoPageClient";

export const revalidate = 0;

export default async function AmbitoPage() {
  const data = await loadDashboardData();

  return <AmbitoPageClient data={data} />;
}
